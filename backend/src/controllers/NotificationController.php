<?php
declare(strict_types=1);

class NotificationController
{
    /**
     * GET /api/notifications — list for current user
     */
    public function index(): void
    {
        $user = Request::requireUser();
        $stmt = Database::connection()->prepare(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
        );
        $stmt->execute([$user['id']]);
        Response::json(['notifications' => $stmt->fetchAll()]);
    }

    /**
     * GET /api/notifications/unread-count
     */
    public function unreadCount(): void
    {
        $user = Request::requireUser();
        $stmt = Database::connection()->prepare(
            'SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0'
        );
        $stmt->execute([$user['id']]);
        Response::json(['count' => (int) $stmt->fetchColumn()]);
    }

    /**
     * POST /api/notifications/{id}/read
     */
    public function markRead(array $params): void
    {
        $user = Request::requireUser();
        Database::connection()->prepare(
            'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?'
        )->execute([$params['id'], $user['id']]);
        Response::json(['message' => 'Marked as read.']);
    }

    /**
     * POST /api/notifications/read-all
     */
    public function markAllRead(): void
    {
        $user = Request::requireUser();
        Database::connection()->prepare(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ?'
        )->execute([$user['id']]);
        Response::json(['message' => 'All marked as read.']);
    }

    /**
     * DELETE /api/notifications/{id}
     */
    public function destroy(array $params): void
    {
        $user = Request::requireUser();
        Database::connection()->prepare(
            'DELETE FROM notifications WHERE id = ? AND user_id = ?'
        )->execute([$params['id'], $user['id']]);
        Response::json(['message' => 'Notification deleted.']);
    }

    /**
     * Static helper to create a notification from other controllers
     */
    public static function createNotification(int $userId, string $title, string $message, string $type = 'system'): void
    {
        try {
            Database::connection()->prepare(
                'INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, 0)'
            )->execute([$userId, $title, $message, $type]);
        } catch (\Exception $e) {
            error_log("[NOTIFICATION] Failed to create: " . $e->getMessage());
        }
    }
}
