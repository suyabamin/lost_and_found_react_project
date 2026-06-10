<?php
declare(strict_types=1);

class SystemController
{
    public function stats(): void
    {
        $db = Database::connection();
        $stats = [
            'active_listings'    => (int) $db->query('SELECT COUNT(*) FROM items WHERE status IN ("lost", "found")')->fetchColumn(),
            'successful_matches' => (int) $db->query('SELECT COUNT(*) FROM items WHERE status = "resolved"')->fetchColumn(),
            'community_members'  => (int) $db->query('SELECT COUNT(*) FROM users WHERE status = "active"')->fetchColumn(),
        ];
        Response::json($stats);
    }
}
