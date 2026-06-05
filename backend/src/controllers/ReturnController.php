<?php
declare(strict_types=1);

class ReturnController
{
    /**
     * POST /api/return-item/{trackingId}
     * Payload: { rating: 5, review: "...", reward_amount: 100 }
     */
    public function submitReturn(array $params): void
    {
        $user = Request::requireUser();
        $data = Request::input();
        $db   = Database::connection();
        $trackingId = (int) $params['id'];

        // 1. Get tracking session
        $stmt = $db->prepare('SELECT * FROM tracking_sessions WHERE id = ?');
        $stmt->execute([$trackingId]);
        $session = $stmt->fetch();

        if (!$session) {
            Response::error('Tracking session not found.', 404);
        }
        
        $isOwner = ((int)$user['id'] === (int)$session['owner_id']);
        $isClaimant = ((int)$user['id'] === (int)$session['claimant_id']);

        if (!$isOwner && !$isClaimant) {
            Response::error('Access denied.', 403);
        }

        // Check if this user already confirmed
        if (($isOwner && $session['owner_confirmed']) || ($isClaimant && $session['claimant_confirmed'])) {
            Response::error('You have already submitted your confirmation for this return.', 400);
        }

        // 2. Validate rating (mandatory)
        $rating = isset($data['rating']) ? (int) $data['rating'] : 0;
        if ($rating < 1 || $rating > 5) {
            Response::error('A valid rating between 1 and 5 is required.', 400);
        }

        $review     = trim($data['review'] ?? '');
        $itemId     = (int) $session['item_id'];
        $ownerId    = (int) $session['owner_id'];
        $claimantId = (int) $session['claimant_id'];
        $toUserId   = $isOwner ? $claimantId : $ownerId;

        // 3. Fetch item details
        $itemStmt = $db->prepare('SELECT title, type FROM items WHERE id = ?');
        $itemStmt->execute([$itemId]);
        $item = $itemStmt->fetch();
        $itemTitle = $item['title'] ?? 'Unknown Item';
        $itemType = $item['type'] ?? 'lost';

        // 4. Handle Reward (Only Loster pays)
        // Loster is: (Post is 'lost' AND current user is Owner) OR (Post is 'found' AND current user is Claimant)
        $isLoster = ($itemType === 'lost' && $isOwner) || ($itemType === 'found' && $isClaimant);
        $hasReward = !empty($data['reward_amount']) && (float)$data['reward_amount'] > 0;
        
        if ($hasReward) {
            if (!$isLoster) {
                Response::error('Only the person who lost the item can provide a reward.', 403);
            }
            if (empty($data['transaction_id'])) {
                Response::error('Transaction ID is required for rewards.');
            }
            if (empty($data['payment_method'])) {
                Response::error('Payment method is required for rewards.');
            }
        }

        $db->beginTransaction();
        try {
            // — Store Rating —
            $db->prepare(
                'INSERT INTO ratings (tracking_id, item_id, from_user_id, to_user_id, rating, review)
                 VALUES (?, ?, ?, ?, ?, ?)'
            )->execute([$trackingId, $itemId, $user['id'], $toUserId, $rating, $review ?: null]);

            // — Store Reward (if provided by loster) —
            if ($hasReward && $isLoster) {
                // Receiver is the OTHER person
                $receiverId = $toUserId;
                $methodStr = strtolower($data['payment_method']) . '_number'; // e.g. bkash_number
                $userStmt = $db->prepare("SELECT $methodStr FROM users WHERE id = ?");
                $userStmt->execute([$receiverId]);
                $receiverNumber = $userStmt->fetchColumn() ?: 'unknown';

                $db->prepare('
                    INSERT INTO rewards (tracking_id, item_id, sender_id, receiver_id, payment_method, receiver_number, amount, transaction_id, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, "pending")
                ')->execute([
                    $trackingId, 
                    $itemId, 
                    $user['id'], 
                    $receiverId, 
                    $data['payment_method'], 
                    $receiverNumber,
                    (float)$data['reward_amount'],
                    $data['transaction_id']
                ]);

                NotificationController::createNotification(
                    $receiverId,
                    '🎁 Reward Waiting!',
                    "You have a pending reward of {$data['reward_amount']} BDT for returning \"{$itemTitle}\". Please confirm receipt in your profile.",
                    'reward',
                    $trackingId
                );
            }

            // — Update Confirmation Flags —
            if ($isOwner) {
                $db->prepare('UPDATE tracking_sessions SET owner_confirmed = 1 WHERE id = ?')->execute([$trackingId]);
                $session['owner_confirmed'] = 1;
            } else {
                $db->prepare('UPDATE tracking_sessions SET claimant_confirmed = 1 WHERE id = ?')->execute([$trackingId]);
                $session['claimant_confirmed'] = 1;
            }

            // — Check if both confirmed —
            if ($session['owner_confirmed'] && $session['claimant_confirmed']) {
                // Finalize everything
                $db->prepare('UPDATE conversations SET item_title = ? WHERE item_id = ?')->execute([$itemTitle, $itemId]);

                $histStmt = $db->prepare('INSERT INTO history (user_id, item_id, item_title, action_type, reference_id) VALUES (?, ?, ?, ?, ?)');
                $histStmt->execute([$ownerId,    $itemId, $itemTitle, 'item_returned',  $trackingId]);
                $histStmt->execute([$claimantId, $itemId, $itemTitle, 'item_recovered', $trackingId]);

                $db->prepare('UPDATE tracking_sessions SET status = "completed" WHERE id = ?')->execute([$trackingId]);
                $db->prepare('UPDATE items SET status = "resolved" WHERE id = ?')->execute([$itemId]);

                NotificationController::createNotification(
                    $toUserId,
                    '🎉 Item Return Fully Finalized',
                    "Both parties have confirmed the return of \"{$itemTitle}\". The post is now archived.",
                    'system',
                    $trackingId
                );
            } else {
                // Just notify the other person to confirm
                NotificationController::createNotification(
                    $toUserId,
                    '🔔 Waiting for your confirmation',
                    "{$user['name']} has confirmed the return of \"{$itemTitle}\". Please complete the return form to finalize.",
                    'tracking',
                    $trackingId
                );
            }

            $db->commit();
            Response::json(['message' => 'Your confirmation has been recorded.']);
        } catch (\Exception $e) {
            $db->rollBack();
            error_log("Return error: " . $e->getMessage());
            Response::error('Failed to process confirmation: ' . $e->getMessage(), 500);
        }
    }
}
