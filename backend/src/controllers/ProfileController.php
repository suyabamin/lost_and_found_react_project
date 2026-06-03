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
                    if ($oldPublicId) Cloudinary::delete($oldPublicId);
                }
                $avatarUrl = $newAvatar;
            }
        } elseif (!empty($data['avatar']) && str_starts_with($data['avatar'], 'http')) {
            $avatarUrl = $data['avatar'];
        }

        $stmt = Database::connection()->prepare('UPDATE users SET name = ?, phone = ?, avatar = ?, bio = ?, location = ? WHERE id = ?');
        $stmt->execute([
            trim($data['name'] ?? $user['name']),
            trim($data['phone'] ?? ''),
            $avatarUrl,
            trim($data['bio'] ?? $user['bio'] ?? ''),
            trim($data['location'] ?? $user['location'] ?? ''),
            $user['id']
        ]);
        
        $_SESSION['user']['name'] = trim($data['name'] ?? $user['name']);
        $_SESSION['user']['phone'] = trim($data['phone'] ?? '');
        $_SESSION['user']['avatar'] = $avatarUrl;
        $_SESSION['user']['bio'] = trim($data['bio'] ?? $user['bio'] ?? '');
        $_SESSION['user']['location'] = trim($data['location'] ?? $user['location'] ?? '');
        
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
     * GET /api/profile/stats - Get current user's stats
     */
    public function stats(): void
    {
        $user = Request::requireUser();
        $db = Database::connection();
        
        $s1 = $db->prepare('SELECT COUNT(*) FROM items WHERE user_id = ?');
        $s1->execute([$user['id']]);
        $totalPosts = (int) $s1->fetchColumn();

        $s2 = $db->prepare('SELECT COUNT(*) FROM items WHERE user_id = ? AND status = ?');
        $s2->execute([$user['id'], 'lost']);
        $lostPosts = (int) $s2->fetchColumn();

        $s3 = $db->prepare('SELECT COUNT(*) FROM items WHERE user_id = ? AND status = ?');
        $s3->execute([$user['id'], 'found']);
        $foundPosts = (int) $s3->fetchColumn();

        $s4 = $db->prepare('SELECT COUNT(*) FROM favorites WHERE user_id = ?');
        $s4->execute([$user['id']]);
        $favorites = (int) $s4->fetchColumn();

        $s5 = $db->prepare('SELECT COUNT(*) FROM claims WHERE claimant_id = ?');
        $s5->execute([$user['id']]);
        $claims = (int) $s5->fetchColumn();

        $s6 = $db->prepare('SELECT COUNT(*) FROM items WHERE user_id = ? AND status = ?');
        $s6->execute([$user['id'], 'resolved']);
        $resolved = (int) $s6->fetchColumn();

        $s7 = $db->prepare('SELECT COUNT(DISTINCT c.id) FROM conversations c WHERE c.requester_id = ? OR c.owner_id = ?');
        $s7->execute([$user['id'], $user['id']]);
        $conversations = (int) $s7->fetchColumn();

        $s8 = $db->prepare('SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0');
        $s8->execute([$user['id']]);
        $unreadNotifications = (int) $s8->fetchColumn();

        Response::json([
            'total_posts'   => $totalPosts,
            'lost_posts'    => $lostPosts,
            'found_posts'   => $foundPosts,
            'favorites'     => $favorites,
            'claims'        => $claims,
            'resolved'      => $resolved,
            'conversations' => $conversations,
            'unread_notifications' => $unreadNotifications,
        ]);
    }
}
