<?php
declare(strict_types=1);

class AdminController
{
    public function stats(): void
    {
        Request::requireAdmin();
        $db = Database::connection();
        Response::json([
            'users' => (int) $db->query('SELECT COUNT(*) FROM users')->fetchColumn(),
            'posts' => (int) $db->query('SELECT COUNT(*) FROM items')->fetchColumn(),
            'reports' => (int) $db->query('SELECT COUNT(*) FROM reports WHERE status = "pending"')->fetchColumn(),
            'claims' => (int) $db->query('SELECT COUNT(*) FROM claims WHERE status = "pending"')->fetchColumn(),
        ]);
    }

    public function users(): void
    {
        Request::requireAdmin();
        $db = Database::connection();
        $users = $db->query('SELECT id, name, email, avatar, role, created_at FROM users ORDER BY created_at DESC')->fetchAll();
        foreach ($users as &$u) {
            $u['avatar'] = imageUrl($u['avatar']);
        }
        Response::json(['users' => $users]);
    }

    public function posts(): void
    {
        Request::requireAdmin();
        $db = Database::connection();
        $posts = $db->query('SELECT * FROM items ORDER BY created_at DESC')->fetchAll();
        foreach ($posts as &$p) {
            $p['image_url'] = imageUrl($p['image_url']);
        }
        Response::json(['posts' => $posts]);
    }

    public function reports(): void
    {
        Request::requireAdmin();
        Response::json(['reports' => Database::connection()->query('SELECT * FROM reports ORDER BY created_at DESC')->fetchAll()]);
    }

    public function updateClaim(array $params): void
    {
        Request::requireAdmin();
        $data = Request::input();
        Database::connection()->prepare('UPDATE claims SET status = ? WHERE id = ?')->execute([$data['status'] ?? 'pending', $params['id']]);
        Response::json(['message' => 'Claim updated.']);
    }

    public function updateReport(array $params): void
    {
        Request::requireAdmin();
        $data = Request::input();
        Database::connection()->prepare('UPDATE reports SET status = ? WHERE id = ?')->execute([$data['status'] ?? 'reviewed', $params['id']]);
        Response::json(['message' => 'Report updated.']);
    }
}
