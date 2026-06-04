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
        if ($session['status'] !== 'active') {
            Response::error('Tracking session is already completed.', 400);
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
        $isOwner    = ((int)$user['id'] === $ownerId);
        $toUserId   = $isOwner ? $claimantId : $ownerId;

        // 3. Fetch item details BEFORE destruction
        $itemStmt = $db->prepare('SELECT title, image_url FROM items WHERE id = ?');
        $itemStmt->execute([$itemId]);
        $item = $itemStmt->fetch();
        $itemTitle = $item['title'] ?? 'Unknown Item';

        // 4. Handle Reward (Optional)
        $hasReward = !empty($data['reward_amount']) && (float)$data['reward_amount'] > 0;
        
        if ($hasReward && $isOwner) {
            // Require transaction_id if reward selected
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

            // — Store Reward (if provided by owner) —
            if ($hasReward && $isOwner) {
                // Fetch receiver's payment number
                $methodStr = strtolower($data['payment_method']) . '_number'; // e.g. bkash_number
                $userStmt = $db->prepare("SELECT $methodStr FROM users WHERE id = ?");
                $userStmt->execute([$claimantId]);
                $receiverNumber = $userStmt->fetchColumn() ?: 'unknown';

                $db->prepare('
                    INSERT INTO rewards (tracking_id, item_id, sender_id, receiver_id, payment_method, receiver_number, amount, transaction_id, screenshot_url, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "pending")
                ')->execute([
                    $trackingId, 
                    $itemId, 
                    $ownerId, 
                    $claimantId, 
                    $data['payment_method'], 
                    $receiverNumber,
                    (float)$data['reward_amount'],
                    $data['transaction_id'],
                    $data['screenshot_url'] ?? null,
                ]);

                NotificationController::createNotification(
                    $claimantId,
                    '🎁 Reward Waiting!',
                    "You have a pending reward of {$data['reward_amount']} BDT for returning \"{$itemTitle}\". Please confirm receipt.",
                    'reward',
                    $trackingId
                );
            }

            // — Update item title in conversations and history for archival —
            $db->prepare('UPDATE conversations SET item_title = ? WHERE item_id = ?')->execute([$itemTitle, $itemId]);

            // — Archive History —
            $histStmt = $db->prepare('INSERT INTO history (user_id, item_id, item_title, action_type, reference_id) VALUES (?, ?, ?, ?, ?)');
            $histStmt->execute([$ownerId,    $itemId, $itemTitle, 'item_returned',  $trackingId]);
            $histStmt->execute([$claimantId, $itemId, $itemTitle, 'item_recovered', $trackingId]);

            // — Close Tracking Session —
            $db->prepare('UPDATE tracking_sessions SET status = "completed" WHERE id = ?')->execute([$trackingId]);

            // — Delete Item (resolved) —
            $db->prepare('DELETE FROM items WHERE id = ?')->execute([$itemId]);

            // — Notify Other User —
            NotificationController::createNotification(
                $toUserId,
                '🎉 Item Return Complete',
                "The return process for \"{$itemTitle}\" was finalized. Thank you!",
                'system',
                $trackingId
            );

            $db->commit();
            Response::json(['message' => 'Return process completed successfully.']);
        } catch (\Exception $e) {
            $db->rollBack();
            Response::error('Failed to complete return: ' . $e->getMessage(), 500);
        }
    }
}
