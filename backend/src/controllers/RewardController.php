<?php
declare(strict_types=1);

class RewardController
{
    /**
     * GET /api/rewards/my
     * Fetch rewards sent/received by the user
     */
    public function myRewards(): void
    {
        $user = Request::requireUser();
        $db = Database::connection();

        $stmt = $db->prepare('
            SELECT r.*, i.title as item_title, u_sender.name as sender_name, u_receiver.name as receiver_name
            FROM rewards r
            LEFT JOIN items i ON i.id = r.item_id
            LEFT JOIN users u_sender ON u_sender.id = r.sender_id
            LEFT JOIN users u_receiver ON u_receiver.id = r.receiver_id
            WHERE r.sender_id = ? OR r.receiver_id = ?
            ORDER BY r.created_at DESC
        ');
        $stmt->execute([$user['id'], $user['id']]);
        $rewards = $stmt->fetchAll();

        foreach ($rewards as &$r) {
            $r['screenshot_url'] = imageUrl($r['screenshot_url']);
        }

        Response::json(['rewards' => $rewards]);
    }

    /**
     * PATCH /api/rewards/{id}/respond
     * Payload: { status: "confirmed" | "rejected" }
     */
    public function respond(array $params): void
    {
        $user = Request::requireUser();
        $id = (int) $params['id'];
        $data = Request::input();
        $status = $data['status'] ?? '';

        if (!in_array($status, ['confirmed', 'rejected'])) {
            Response::error('Invalid status.');
        }

        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM rewards WHERE id = ?');
        $stmt->execute([$id]);
        $reward = $stmt->fetch();

        if (!$reward) {
            Response::error('Reward not found.', 404);
        }

        if ((int)$reward['receiver_id'] !== (int)$user['id']) {
            Response::error('Unauthorized.', 403);
        }

        if ($reward['status'] !== 'pending') {
            Response::error('Reward already processed.', 400);
        }

        $db->prepare('UPDATE rewards SET status = ? WHERE id = ?')->execute([$status, $id]);

        // Notifications
        $title = $status === 'confirmed' ? '💰 Reward Confirmed!' : '❌ Reward Rejected';
        $message = $status === 'confirmed' 
            ? "Your reward payment of {$reward['amount']} BDT has been confirmed by the finder."
            : "Your reward payment of {$reward['amount']} BDT was rejected by the finder. Please check transaction details.";

        NotificationController::createNotification(
            (int)$reward['sender_id'],
            $title,
            $message,
            $status === 'confirmed' ? 'reward' : 'system',
            $id
        );

        Response::json(['message' => "Reward $status successfully."]);
    }
}
