<?php
declare(strict_types=1);

class ClaimController
{
    /**
     * POST /api/claims
     */
    public function store(): void
    {
        $user = Request::requireUser();
        $data = Request::input();
        $db = Database::connection();
        
        $itemId = (int) ($data['item_id'] ?? 0);
        if (!$itemId) {
            Response::error('Item ID is required for claims.', 400);
        }
        
        // Get item owner for notification
        $itemStmt = $db->prepare('SELECT user_id, title FROM items WHERE id = ?');
        $itemStmt->execute([$itemId]);
        $item = $itemStmt->fetch();
        
        if (!$item) {
            Response::error('Item not found.', 404);
        }

        if ((int) $item['user_id'] === (int) $user['id']) {
            Response::error('You cannot claim your own item.', 400);
        }

        // Check if already claimed
        $check = $db->prepare('SELECT id FROM claims WHERE item_id = ? AND claimant_id = ?');
        $check->execute([$itemId, $user['id']]);
        if ($check->fetch()) {
            Response::error('You have already submitted a claim for this item.', 400);
        }

        // Handle evidence image upload
        $proofImage = null;
        $fileImage = Cloudinary::uploadFromFiles('proof_image', 'lost_found/claims');
        if ($fileImage) {
            $proofImage = $fileImage;
        } elseif (!empty($data['proof_image']) && str_starts_with($data['proof_image'], 'data:image/')) {
            $proofImage = Cloudinary::uploadBase64($data['proof_image'], 'lost_found/claims');
        }

        $stmt = $db->prepare(
            'INSERT INTO claims (item_id, claimant_id, reason, proof_description, proof_image, contact_info, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $itemId, 
            $user['id'], 
            trim($data['reason'] ?? ''),
            trim($data['proof_description'] ?? trim($data['proofDetails'] ?? '')),
            $proofImage,
            trim($data['contact_info'] ?? $data['phone'] ?? $user['phone'] ?? ''),
            'pending'
        ]);
        
        $claimId = (int) $db->lastInsertId();
        
        // Handle verification answers
        if (!empty($data['answers']) && is_array($data['answers'])) {
            $aStmt = $db->prepare('INSERT INTO claim_answers (claim_id, question_id, answer_text) VALUES (?, ?, ?)');
            foreach ($data['answers'] as $qId => $answer) {
                if (!empty(trim((string)$answer))) {
                    $aStmt->execute([$claimId, (int)$qId, trim((string)$answer)]);
                }
            }
        }
        
        // Notify item owner — store claim_id in the notification's reference_id column
        // Requirement: {claimerName} submitted a claim for your item "{itemTitle}".
        $notifMsg = "{$user['name']} submitted a claim for your item \"{$item['title']}\". Click to review claim.";
        self::createClaimNotification(
            (int) $item['user_id'],
            'New Claim Received',
            $notifMsg,
            'claim',
            $claimId
        );

        NotificationController::notifyAdmins(
            "New Claim Submitted", 
            "A new claim has been submitted for item \"{$item['title']}\" by {$user['name']}.",
            'claim', // Using 'claim' type so it's valid in DB enum and clickable in UI
            $claimId
        );
        
        Response::json(['message' => 'Claim submitted successfully.', 'id' => $claimId], 201);
    }

    /**
     * GET /api/claims/{id}  — founder views a specific claim
     */
    public function show(array $params): void
    {
        $user = Request::requireUser();
        $db = Database::connection();
        $claimId = (int) $params['id'];

        $stmt = $db->prepare(
            'SELECT c.*, 
                    i.title AS item_title, i.image_url AS item_image, i.status AS item_status, 
                    i.location AS item_location, i.user_id AS item_owner_id,
                    u.name AS claimant_name, u.email AS claimant_email, u.avatar AS claimant_avatar
             FROM claims c
             JOIN items i ON i.id = c.item_id
             JOIN users u ON u.id = c.claimant_id
             WHERE c.id = ?'
        );
        $stmt->execute([$claimId]);
        $claim = $stmt->fetch();

        if (!$claim) {
            Response::error('Claim not found.', 404);
        }

        // Only item owner or admin can view claim details
        $isOwner = (int) $claim['item_owner_id'] === (int) $user['id'];
        $isClaimant = (int) $claim['claimant_id'] === (int) $user['id'];

        if (!$isOwner && !$isClaimant) {
            Response::error('Access denied.', 403);
        }

        $claim['item_image'] = imageUrl($claim['item_image']);
        $claim['proof_image'] = imageUrl($claim['proof_image']);
        $claim['claimant_avatar'] = imageUrl($claim['claimant_avatar']);

        // Fetch questions and answers
        $qaStmt = $db->prepare(
            'SELECT cq.question_text, ca.answer_text 
             FROM claim_answers ca
             JOIN claim_questions cq ON cq.id = ca.question_id
             WHERE ca.claim_id = ?'
        );
        $qaStmt->execute([$claimId]);
        $claim['answers'] = $qaStmt->fetchAll();

        Response::json(['claim' => $claim]);
    }

    /**
     * PATCH /api/claims/{id}/respond  — founder approves or denies a claim
     */
    public function founderRespond(array $params): void
    {
        $user = Request::requireUser();
        $data = Request::input();
        $db = Database::connection();
        $claimId = (int) $params['id'];

        $status = $data['status'] ?? '';
        if (!in_array($status, ['approved', 'rejected'])) {
            Response::error('Status must be "approved" or "rejected".', 400);
        }

        // Fetch claim + verify caller is the item owner
        $stmt = $db->prepare(
            'SELECT c.*, i.title AS item_title, i.user_id AS item_owner_id
             FROM claims c
             JOIN items i ON i.id = c.item_id
             WHERE c.id = ?'
        );
        $stmt->execute([$claimId]);
        $claim = $stmt->fetch();

        if (!$claim) {
            Response::error('Claim not found.', 404);
        }

        if ((int) $claim['item_owner_id'] !== (int) $user['id']) {
            Response::error('Only the item founder can respond to this claim.', 403);
        }

        if ($claim['status'] !== 'pending') {
            Response::error('This claim has already been reviewed.', 400);
        }

        // Update claim status
        $db->prepare('UPDATE claims SET status = ? WHERE id = ?')->execute([$status, $claimId]);

        $convId = null;

        if ($status === 'approved') {
            // Set item status to processing
            $db->prepare('UPDATE items SET status = "processing" WHERE id = ?')->execute([$claim['item_id']]);

            // Create a conversation between founder and claimant
            $existingConv = $db->prepare(
                'SELECT id FROM conversations WHERE item_id = ? AND requester_id = ? AND owner_id = ?'
            );
            $existingConv->execute([$claim['item_id'], $claim['claimant_id'], $claim['item_owner_id']]);
            $existingRow = $existingConv->fetch();

            if ($existingRow) {
                $convId = (int) $existingRow['id'];
            } else {
                $db->prepare(
                    'INSERT INTO conversations (item_id, requester_id, owner_id) VALUES (?, ?, ?)'
                )->execute([$claim['item_id'], $claim['claimant_id'], $claim['item_owner_id']]);
                $convId = (int) $db->lastInsertId();
            }

            // Create a tracking session for live meeting
            $trackingId = TrackingController::createSession(
                (int) $claim['item_id'],
                (int) $claim['item_owner_id'],
                (int) $claim['claimant_id']
            );

            self::createClaimNotification(
                (int) $claim['claimant_id'],
                '🎉 Claim Approved!',
                "Your claim for \"{$claim['item_title']}\" has been approved! You can now chat with the founder and track live location.",
                'claim_approved',
                $claimId,
                $convId
            );
            
            // Send another notification specifically for tracking
            NotificationController::createNotification(
                (int) $claim['claimant_id'],
                'Live Tracking Started',
                "Tracking session for \"{$claim['item_title']}\" is active. Meet the founder to get your item.",
                'tracking',
                $trackingId
            );
        } else {
            // Notify claimant about rejection
            self::createClaimNotification(
                (int) $claim['claimant_id'],
                'Claim Rejected',
                "Your claim for \"{$claim['item_title']}\" was not approved by the founder.",
                'claim_rejected',
                $claimId
            );
        }

        Response::json([
            'message'         => "Claim has been $status.",
            'status'          => $status,
            'conversation_id' => $convId,
        ]);
    }

    /**
     * GET /api/claims/my
     */
    public function myClaims(): void
    {
        $user = Request::requireUser();
        $db = Database::connection();
        $stmt = $db->prepare(
            'SELECT c.*, i.title AS item_title, i.image_url AS item_image, i.status AS item_status, i.location AS item_location
             FROM claims c 
             JOIN items i ON i.id = c.item_id 
             WHERE c.claimant_id = ? ORDER BY c.created_at DESC'
        );
        $stmt->execute([$user['id']]);
        $claims = $stmt->fetchAll();
        foreach ($claims as &$c) {
            $c['item_image'] = imageUrl($c['item_image']);
            $c['proof_image'] = imageUrl($c['proof_image']);
        }
        Response::json(['claims' => $claims]);
    }

    /**
     * GET /api/admin/claims
     */
    public function adminIndex(): void
    {
        Request::requireAdmin();
        $db = Database::connection();
        $stmt = $db->prepare(
            'SELECT c.*, i.title AS item_title, u.name AS claimant_name, u.email AS claimant_email
             FROM claims c
             JOIN items i ON i.id = c.item_id
             JOIN users u ON u.id = c.claimant_id
             ORDER BY c.created_at DESC'
        );
        $stmt->execute();
        $claims = $stmt->fetchAll();
        foreach ($claims as &$c) {
            $c['proof_image'] = imageUrl($c['proof_image']);
        }
        Response::json(['claims' => $claims]);
    }

    /**
     * PATCH /api/admin/claims/{id}
     */
    public function updateStatus(array $params): void
    {
        Request::requireAdmin();
        $data = Request::input();
        $status = $data['status'] ?? '';
        
        if (!in_array($status, ['approved', 'rejected', 'pending'])) {
            Response::error('Invalid status.', 400);
        }
        
        $db = Database::connection();
        $stmt = $db->prepare('UPDATE claims SET status = ? WHERE id = ?');
        $stmt->execute([$status, $params['id']]);
        
        // Notify claimant
        $claim = $db->prepare('SELECT claimant_id, item_id FROM claims WHERE id = ?');
        $claim->execute([$params['id']]);
        $claimRow = $claim->fetch();
        
        if ($claimRow) {
            $item = $db->prepare('SELECT title FROM items WHERE id = ?');
            $item->execute([$claimRow['item_id']]);
            $itemTitle = $item->fetchColumn();
            
            $title = $status === 'approved' ? 'Claim Approved' : 'Claim Rejected';
            $msg = $status === 'approved' 
                ? "Your claim for \"$itemTitle\" has been approved! The finder will contact you soon." 
                : "Your claim for \"$itemTitle\" was rejected. Please contact support if you believe this is an error.";
                
            NotificationController::createNotification(
                (int) $claimRow['claimant_id'],
                $title,
                $msg,
                'claim'
            );
        }
        
        Response::json(['message' => 'Claim status updated.']);
    }

    /**
     * Helper: create a notification with optional claim_id / conversation_id stored in reference_id
     * Stores as JSON: {"claim_id": X, "conversation_id": Y}
     */
    public static function createClaimNotification(
        int $userId, string $title, string $message, string $type,
        ?int $claimId = null, ?int $convId = null
    ): void {
        try {
            $refData = json_encode(array_filter([
                'claim_id'        => $claimId,
                'conversation_id' => $convId,
            ]));
            
            $db = Database::connection();
            $stmt = $db->prepare(
                'INSERT INTO notifications (user_id, title, message, type, reference_id, is_read)
                 VALUES (?, ?, ?, ?, ?, 0)'
            );
            $stmt->execute([$userId, $title, $message, $type, $refData]);
        } catch (\Exception $e) {
            // Fallback to standard controller method if local helper fails
            error_log("[CLAIM_NOTIF] Fail: " . $e->getMessage());
            $refData = isset($refData) ? $refData : null;
            NotificationController::createNotification($userId, $title, $message, $type, $refData);
        }
    }
}
