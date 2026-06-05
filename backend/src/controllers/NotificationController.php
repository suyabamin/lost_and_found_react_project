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
        
        $notifications = $stmt->fetchAll();
        // Add relative time
        foreach ($notifications as &$n) {
            $n['time_ago'] = $this->timeAgo($n['created_at']);
        }
        
        Response::json(['notifications' => $notifications]);
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
     * Static helper to create a notification
     */
    public static function createNotification(int $userId, string $title, string $message, string $type = 'system', $referenceId = null): void
    {
        try {
            $db = Database::connection();
            $stmt = $db->prepare('INSERT INTO notifications (user_id, title, message, type, reference_id, is_read) VALUES (?, ?, ?, ?, ?, 0)');
            $stmt->execute([$userId, $title, $message, $type, $referenceId]);
        } catch (\Exception $e) {
            error_log("[NOTIFICATION] Failed to create: " . $e->getMessage());
        }
    }

    public static function notifyAdmins(string $title, string $message, string $type = 'admin_alert', $referenceId = null): void
    {
        try {
            $db = Database::connection();
            $admins = $db->query("SELECT id FROM users WHERE role = 'admin'")->fetchAll(PDO::FETCH_COLUMN);
            foreach ($admins as $adminId) {
                self::createNotification((int)$adminId, $title, $message, $type, $referenceId);
            }
        } catch (\Exception $e) {
            error_log("[NOTIFICATION] Failed to notify admins: " . $e->getMessage());
        }
    }

    private function timeAgo(string $datetime): string
    {
        $time = strtotime($datetime);
        $diff = time() - $time;
        if ($diff < 60) return 'Just now';
        if ($diff < 3600) return floor($diff / 60) . 'm ago';
        if ($diff < 86400) return floor($diff / 3600) . 'h ago';
        return floor($diff / 86400) . 'd ago';
    }
}
