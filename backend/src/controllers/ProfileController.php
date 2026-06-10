<?php
declare(strict_types=1);

class ProfileController
{
    public function update(): void
    {
        $user = Request::requireUser();
        $data = Request::input();

        // Handle avatar upload
        $avatarUrl = $user['avatar'] ?? null;
        $fileAvatar = Cloudinary::uploadFromFiles('avatar', 'lost_found/avatars');

        if ($fileAvatar || (!empty($data['avatar']) && str_starts_with($data['avatar'], 'data:image/'))) {
            $newAvatar = $fileAvatar;
            if (!$newAvatar) {
                $newAvatar = Cloudinary::uploadBase64($data['avatar'], 'lost_found/avatars');
            }

            if ($newAvatar) {
                // Delete old one if it was on Cloudinary
                if ($user['avatar']) {
                    $oldPublicId = Cloudinary::extractPublicId($user['avatar']);
                    if ($oldPublicId)
                        Cloudinary::delete($oldPublicId);
                }
                $avatarUrl = $newAvatar;
            }
        } elseif (!empty($data['avatar']) && str_starts_with($data['avatar'], 'http')) {
            $avatarUrl = $data['avatar'];
        }

        $stmt = Database::connection()->prepare('UPDATE users SET name = ?, phone = ?, avatar = ?, bio = ?, location = ?, bkash_number = ?, nagad_number = ?, rocket_number = ? WHERE id = ?');
        $stmt->execute([
            trim($data['name'] ?? $user['name']),
            trim($data['phone'] ?? ''),
            $avatarUrl,
            trim($data['bio'] ?? $user['bio'] ?? ''),
            trim($data['location'] ?? $user['location'] ?? ''),
            trim($data['bkash_number'] ?? $user['bkash_number'] ?? ''),
            trim($data['nagad_number'] ?? $user['nagad_number'] ?? ''),
            trim($data['rocket_number'] ?? $user['rocket_number'] ?? ''),
            $user['id']
        ]);

        $_SESSION['user']['name'] = trim($data['name'] ?? $user['name']);
        $_SESSION['user']['phone'] = trim($data['phone'] ?? '');
        $_SESSION['user']['avatar'] = $avatarUrl;
        $_SESSION['user']['bio'] = trim($data['bio'] ?? $user['bio'] ?? '');
        $_SESSION['user']['location'] = trim($data['location'] ?? $user['location'] ?? '');
        $_SESSION['user']['bkash_number'] = trim($data['bkash_number'] ?? $user['bkash_number'] ?? '');
        $_SESSION['user']['nagad_number'] = trim($data['nagad_number'] ?? $user['nagad_number'] ?? '');
        $_SESSION['user']['rocket_number'] = trim($data['rocket_number'] ?? $user['rocket_number'] ?? '');

        $user = $_SESSION['user'];
        $user['avatar'] = imageUrl($user['avatar']);

        Response::json(['user' => $user]);
    }

    public function password(): void
    {
        $user = Request::requireUser();
        $data = Request::input();
        if (strlen($data['password'] ?? '') < 8) {
            Response::error('Password must be at least 8 characters.');
        }
        $stmt = Database::connection()->prepare('UPDATE users SET password = ? WHERE id = ?');
        $stmt->execute([password_hash($data['password'], PASSWORD_DEFAULT), $user['id']]);
        Response::json(['message' => 'Password changed.']);
    }

    /**
     * GET /api/profile/posts - Get current user's posts
     */
    public function posts(): void
    {
        $user = Request::requireUser();
        $stmt = Database::connection()->prepare(
            'SELECT items.*, items.item_date AS date, users.name AS owner_name
             FROM items JOIN users ON users.id = items.user_id
             WHERE items.user_id = ?
             ORDER BY items.created_at DESC'
        );
        $stmt->execute([$user['id']]);
        $posts = $stmt->fetchAll();
        foreach ($posts as &$post) {
            $post['image_url'] = imageUrl($post['image_url']);
        }
        Response::json(['posts' => $posts]);
    }

    /**
     * GET /api/profile/favorites - Get current user's favorites
     */
    public function favorites(): void
    {
        $user = Request::requireUser();
        $stmt = Database::connection()->prepare(
            'SELECT items.*, items.item_date AS date, users.name AS owner_name, favorites.created_at AS favorited_at
             FROM favorites
             JOIN items ON items.id = favorites.item_id
             JOIN users ON users.id = items.user_id
             WHERE favorites.user_id = ?
             ORDER BY favorites.created_at DESC'
        );
        $stmt->execute([$user['id']]);
        $favs = $stmt->fetchAll();
        foreach ($favs as &$fav) {
            $fav['image_url'] = imageUrl($fav['image_url']);
        }
        Response::json(['favorites' => $favs]);
    }

    /**
     * GET /api/profile/claims - Get current user's claims
     */
    public function claims(): void
    {
        $user = Request::requireUser();
        $stmt = Database::connection()->prepare(
            'SELECT claims.*, items.title AS item_title, items.image_url AS item_image, items.status AS item_status, items.location AS item_location
             FROM claims
             JOIN items ON items.id = claims.item_id
             WHERE claims.claimant_id = ?
             ORDER BY claims.created_at DESC'
        );
        $stmt->execute([$user['id']]);
        $claims = $stmt->fetchAll();
        foreach ($claims as &$claim) {
            $claim['item_image'] = imageUrl($claim['item_image']);
        }
        Response::json(['claims' => $claims]);
    }

    /**
     * GET /api/profile/history
     */
    public function history(): void
    {
        $user = Request::requireUser();
        $stmt = Database::connection()->prepare(
            'SELECT h.*, items.title AS item_title, items.image_url AS item_image
             FROM history h
             LEFT JOIN items ON items.id = h.item_id
             WHERE h.user_id = ?
             ORDER BY h.created_at DESC'
        );
        $stmt->execute([$user['id']]);
        $history = $stmt->fetchAll();
        foreach ($history as &$h) {
            $h['item_image'] = imageUrl($h['item_image']);
        }
        Response::json(['history' => $history]);
    }

    /**
     * GET /api/profile/stats - Get current user's stats
     */
    public function stats(): void
    {
        $user = Request::requireUser();
        $db = Database::connection();

        $s1 = $db->prepare('SELECT COUNT(*) FROM items WHERE user_id = ?');
        $s1->execute([$user['id']]);
        $totalPosts = (int) $s1->fetchColumn();

        $s2 = $db->prepare('SELECT COUNT(*) FROM items WHERE user_id = ? AND status = "resolved"');
        $s2->execute([$user['id']]);
        $resolved = (int) $s2->fetchColumn();

        $s3 = $db->prepare('SELECT COUNT(*) FROM favorites WHERE user_id = ?');
        $s3->execute([$user['id']]);
        $favorites = (int) $s3->fetchColumn();

        $s4 = $db->prepare('SELECT COUNT(*) FROM claims WHERE claimant_id = ?');
        $s4->execute([$user['id']]);
        $claims = (int) $s4->fetchColumn();

        // New Stats for Ratings
        $s5 = $db->prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings FROM ratings WHERE to_user_id = ?');
        $s5->execute([$user['id']]);
        $ratingData = $s5->fetch();

        // Received (Total expected/confirmed)
        $stmt = $db->prepare('SELECT COUNT(*) as count, SUM(amount) as total FROM rewards WHERE receiver_id = ?');
        $stmt->execute([$user['id']]);
        $received = $stmt->fetch();

        // Sent
        $stmt = $db->prepare('SELECT COUNT(*) as count, SUM(amount) as total FROM rewards WHERE sender_id = ?');
        $stmt->execute([$user['id']]);
        $sent = $stmt->fetch();

        Response::json([
            'total_posts'      => $totalPosts,
            'favorites'        => $favorites,
            'claims'           => $claims,
            'resolved'         => $resolved,
            'avg_rating'       => round((float)($ratingData['avg_rating'] ?? 0), 1),
            'total_ratings'    => (int)($ratingData['total_ratings'] ?? 0),
            'rewards_received' => (float)($received['total'] ?? 0),
            'rewards_sent'     => (float)($sent['total'] ?? 0),
            'received_count'   => (int)($received['count'] ?? 0),
            'sent_count'       => (int)($sent['count'] ?? 0),
        ]);
    }
}
