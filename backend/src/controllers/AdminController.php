<?php
declare(strict_types=1);

class AdminController
{
    public function dashboard(): void
    {
        Request::requireAdmin();
        $db = Database::connection();
        
        $stats = [
            'totalUsers'      => (int) $db->query('SELECT COUNT(*) FROM users')->fetchColumn(),
            'activeUsers'     => (int) $db->query('SELECT COUNT(*) FROM users WHERE status = "active"')->fetchColumn(),
            'totalLostPosts'  => (int) $db->query('SELECT COUNT(*) FROM items WHERE status = "lost"')->fetchColumn(),
            'totalFoundPosts' => (int) $db->query('SELECT COUNT(*) FROM items WHERE status = "found"')->fetchColumn(),
            'recoveredItems'  => (int) $db->query('SELECT COUNT(*) FROM items WHERE status = "resolved"')->fetchColumn(),
            'claims'          => (int) $db->query('SELECT COUNT(*) FROM claims')->fetchColumn(),
            'messages'        => (int) $db->query('SELECT COUNT(*) FROM messages')->fetchColumn(),
            'reports'         => (int) $db->query('SELECT COUNT(*) FROM reports')->fetchColumn(),
            'ratings'         => (int) $db->query('SELECT COUNT(*) FROM ratings')->fetchColumn(),
            'rewards'         => (int) $db->query('SELECT COUNT(*) FROM rewards')->fetchColumn(),
        ];
        
        Response::json($stats);
    }

    public function users(): void
    {
        Request::requireAdmin();
        $db = Database::connection();
        $users = $db->query("
            SELECT u.id, u.name, u.email, u.role, u.status, u.created_at as join_date,
            (SELECT COUNT(*) FROM items WHERE user_id = u.id) as posts_count,
            (SELECT AVG(rating) FROM ratings WHERE to_user_id = u.id) as avg_rating
            FROM users u
            ORDER BY u.created_at DESC
        ")->fetchAll();
        
        Response::json(['users' => $users]);
    }

    public function banUser(): void
    {
        Request::requireAdmin();
        $data = Request::input();
        $userId = $data['userId'] ?? null;
        if (!$userId) Response::error('User ID required.');
        
        $db = Database::connection();
        $db->prepare('UPDATE users SET status = "banned" WHERE id = ?')->execute([$userId]);
        Response::json(['message' => 'User banned successfully.']);
    }

    public function unbanUser(): void
    {
        Request::requireAdmin();
        $data = Request::input();
        $userId = $data['userId'] ?? null;
        if (!$userId) Response::error('User ID required.');
        
        $db = Database::connection();
        $db->prepare('UPDATE users SET status = "active" WHERE id = ?')->execute([$userId]);
        Response::json(['message' => 'User unbanned successfully.']);
    }

    public function promoteUser(): void
    {
        Request::requireAdmin();
        $data = Request::input();
        $userId = $data['userId'] ?? null;
        if (!$userId) Response::error('User ID required.');
        
        $db = Database::connection();
        $db->prepare('UPDATE users SET role = "admin" WHERE id = ?')->execute([$userId]);
        Response::json(['message' => 'User promoted to admin.']);
    }

    public function demoteUser(): void
    {
        Request::requireAdmin();
        $data = Request::input();
        $userId = $data['userId'] ?? null;
        if (!$userId) Response::error('User ID required.');
        
        $db = Database::connection();
        // Prevent demoting self (best practice)
        $currentUser = $_SESSION['user'];
        if ((int)$userId === (int)$currentUser['id']) {
            Response::error('You cannot demote yourself.', 400);
        }
        
        $db->prepare('UPDATE users SET role = "user" WHERE id = ?')->execute([$userId]);
        Response::json(['message' => 'User demoted to user.']);
    }

    public function moderation(): void
    {
        Request::requireAdmin();
        $db = Database::connection();
        
        Response::json([
            'pendingClaims' => $db->query('SELECT c.*, i.title as item_title, u.name as claimant_name FROM claims c JOIN items i ON c.item_id = i.id JOIN users u ON c.claimant_id = u.id WHERE c.status = "pending"')->fetchAll(),
            'reportedUsers' => [], // reports table doesn't have reported_user directly, usually it's post-based
            'reportedPosts' => $db->query('SELECT r.*, i.title as item_title, u.name as reporter_name FROM reports r JOIN items i ON r.item_id = i.id JOIN users u ON r.user_id = u.id')->fetchAll(),
            'reportedMessages' => [], // no reported messages in this schema
        ]);
    }

    public function postAction(array $params): void
    {
        Request::requireAdmin();
        $data = Request::input();
        $action = $data['action'] ?? ''; // hide, restore, archive, delete
        $postId = $params['id'] ?? null;
        
        if (!$postId) Response::error('Post ID required.');
        
        $db = Database::connection();
        switch($action) {
            case 'hide':
                $db->prepare('UPDATE items SET status = "hidden" WHERE id = ?')->execute([$postId]);
                break;
            case 'restore':
                $db->prepare('UPDATE items SET status = "lost" WHERE id = ?')->execute([$postId]); // back to lost or previous state
                break;
            case 'archive':
                $db->prepare('UPDATE items SET status = "resolved" WHERE id = ?')->execute([$postId]);
                break;
            case 'delete':
                $db->prepare('DELETE FROM items WHERE id = ?')->execute([$postId]);
                break;
            default:
                Response::error('Invalid action.');
        }
        
        Response::json(['message' => "Post $action successfully."]);
    }

    public function analytics(): void
    {
        Request::requireAdmin();
        $db = Database::connection();
        
        // Fetch daily users for last 30 days
        $dailyUsers = $db->query("SELECT DATE(created_at) as date, COUNT(*) as count FROM users GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30")->fetchAll();
        
        // Fetch posts stats
        $lostPosts  = (int) $db->query('SELECT COUNT(*) FROM items WHERE status = "lost"')->fetchColumn();
        $foundPosts = (int) $db->query('SELECT COUNT(*) FROM items WHERE status = "found"')->fetchColumn();
        $recovered  = (int) $db->query('SELECT COUNT(*) FROM items WHERE status = "resolved"')->fetchColumn();
        
        Response::json([
            'dailyUsers' => array_reverse($dailyUsers),
            'postStats' => [
                'lost' => $lostPosts,
                'found' => $foundPosts,
                'recovered' => $recovered
            ],
            'activity' => [
                'messages' => (int) $db->query('SELECT COUNT(*) FROM messages')->fetchColumn(),
                'claims' => (int) $db->query('SELECT COUNT(*) FROM claims')->fetchColumn(),
                'rewards' => (int) $db->query('SELECT COUNT(*) FROM rewards WHERE status = "completed"')->fetchColumn(),
                'ratings' => (int) $db->query('SELECT COUNT(*) FROM ratings')->fetchColumn(),
            ]
        ]);
    }

    public function stats(): void
    {
        Request::requireAdmin();
        $db = Database::connection();
        
        Response::json([
            'totalUsers'        => (int)   $db->query('SELECT COUNT(*) FROM users')->fetchColumn(),
            'totalAdmins'       => (int)   $db->query('SELECT COUNT(*) FROM users WHERE role = "admin"')->fetchColumn(),
            'activeTracking'    => (int)   $db->query('SELECT COUNT(*) FROM tracking_sessions WHERE status = "active"')->fetchColumn(),
            'completedReturns'  => (int)   $db->query('SELECT COUNT(*) FROM tracking_sessions WHERE status = "completed"')->fetchColumn(),
            'totalRewards'      => (int)   $db->query('SELECT COUNT(*) FROM rewards')->fetchColumn(),
            'totalRewardAmount' => (float) $db->query('SELECT COALESCE(SUM(amount), 0) FROM rewards')->fetchColumn(),
            'averageRating'     => round((float) $db->query('SELECT COALESCE(AVG(rating), 0) FROM ratings')->fetchColumn(), 1),
            'topFinders'        => $db->query("SELECT u.name, COUNT(*) as found_count FROM items i JOIN users u ON i.user_id = u.id WHERE i.status = 'found' GROUP BY u.id ORDER BY found_count DESC LIMIT 5")->fetchAll(),
            'topContributors'   => $db->query("SELECT u.name, (SELECT COUNT(*) FROM items WHERE user_id = u.id) as post_count FROM users u ORDER BY post_count DESC LIMIT 5")->fetchAll()
        ]);
    }

    public function reports(): void
    {
        Request::requireAdmin();
        $db = Database::connection();
        
        Response::json([
            'userReports' => [],
            'postReports' => $db->query('SELECT r.*, i.title as item_title, u.name as reporter_name FROM reports r JOIN items i ON r.item_id = i.id JOIN users u ON r.user_id = u.id')->fetchAll(),
            'claimReports' => [],
            'rewardReports' => [],
        ]);
    }

    public function logs(): void
    {
        Request::requireAdmin();
        // Mock logs or fetch from file if available
        Response::json([
            'logs' => [
                ['id' => 1, 'action' => 'Admin Login', 'user' => 'admin@lostfound.com', 'timestamp' => date('Y-m-d H:i:s')],
                ['id' => 2, 'action' => 'Database Backup', 'user' => 'System', 'timestamp' => date('Y-m-d H:i:s')],
            ]
        ]);
    }
}
