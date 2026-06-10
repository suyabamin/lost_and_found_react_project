<?php
declare(strict_types=1);

class ItemController
{
    public function index(): void
    {
        Request::requireUser();
        $filters = $_GET;
        $where = [];
        $params = [];
        foreach (['status', 'category'] as $field) {
            if (!empty($filters[$field])) {
                $where[] = "{$field} = ?";
                $params[] = $filters[$field];
            }
        }
        
        // If no status specified, only show lost/found (hide resolved/archived)
        if (empty($filters['status'])) {
            $where[] = "items.status IN ('lost', 'found')";
        }
        if (!empty($filters['keyword'])) {
            $where[] = '(title LIKE ? OR description LIKE ?)';
            $params[] = '%' . $filters['keyword'] . '%';
            $params[] = '%' . $filters['keyword'] . '%';
        }
        if (!empty($filters['location'])) {
            $where[] = 'location LIKE ?';
            $params[] = '%' . $filters['location'] . '%';
        }
        if (!empty($filters['user_id'])) {
            $where[] = 'items.user_id = ?';
            $params[] = $filters['user_id'];
        }
        $sql = 'SELECT items.*, items.item_date AS date, users.name AS owner_name, 
                (SELECT COUNT(*) FROM favorites WHERE favorites.item_id = items.id) AS favorite_count
                FROM items JOIN users ON users.id = items.user_id';
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY items.created_at DESC';
        $stmt = Database::connection()->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll();
        foreach ($items as &$item) {
            $item['image_url'] = imageUrl($item['image_url']);
        }
        Response::json(['items' => $items]);
    }

    public function store(): void
    {
        error_log("[ITEM] Create request started");
        $user = Request::requireUser();
        $data = Request::input();

        // Handle image upload - try Cloudinary first, then local
        $imageUrl = null;
        
        // Check for file upload
        $fileImage = Cloudinary::uploadFromFiles('images', 'lost_found/items');
        if ($fileImage) {
            $imageUrl = $fileImage;
        }
        
        // Check for base64 image in request body
        if (!$imageUrl && !empty($data['image_url']) && str_starts_with($data['image_url'], 'data:image/')) {
            $imageUrl = Cloudinary::uploadBase64($data['image_url'], 'lost_found/items');
        }
        
        // Use provided URL if it's a real URL (not base64)
        if (!$imageUrl && !empty($data['image_url']) && str_starts_with($data['image_url'], 'http')) {
            $imageUrl = $data['image_url'];
        }

        $status = trim($data['status'] ?? 'lost');
        if (!in_array($status, ['lost', 'found', 'resolved', 'processing'])) {
            $status = 'lost';
        }

        $stmt = Database::connection()->prepare('INSERT INTO items (user_id, title, description, category, status, location, full_address, latitude, longitude, item_date, contact, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        try {
            $stmt->execute([
                $user['id'],
                trim($data['title'] ?? ''),
                trim($data['description'] ?? $data['desc'] ?? ''),
                trim($data['category'] ?? ''),
                $status,
                trim($data['location'] ?? ''),
                $data['full_address'] ?? null,
                $data['latitude'] ?? null,
                $data['longitude'] ?? null,
                $data['date'] ?? null,
                trim($data['contact'] ?? $user['email'] ?? ''),
                $imageUrl,
            ]);

            $id = (int) Database::connection()->lastInsertId();
            error_log("[DATABASE] Item created with ID: " . $id);
            
            // Handle verification questions
            if (!empty($data['verification_questions']) && is_array($data['verification_questions'])) {
                $qStmt = Database::connection()->prepare('INSERT INTO claim_questions (item_id, question_text) VALUES (?, ?)');
                foreach ($data['verification_questions'] as $qText) {
                    if (!empty(trim($qText))) {
                        $qStmt->execute([$id, trim($qText)]);
                    }
                }
            }

            // Create notification for the user
            NotificationController::createNotification(
                (int) $user['id'],
                'Post Published',
                "Your post \"{$data['title']}\" is now live.",
                'system'
            );
            
            Response::json(['id' => $id, 'message' => 'Item created.'], 201);
        } catch (PDOException $e) {
            error_log("[DATABASE] Error creating item: " . $e->getMessage());
            if ($e->getCode() === "23000") {
                Response::error('Failed to create post. Your session might be stale. Please logout and login again.', 401);
            }
            Response::error('Database error: ' . $e->getMessage(), 500);
        }
    }

    public function show(array $params): void
    {
        error_log("[ITEM] View request for ID: " . ($params['id'] ?? 'NONE'));
        $user = Request::requireUser();
        $stmt = Database::connection()->prepare(
            'SELECT items.*, items.item_date AS date, users.name AS owner_name, users.avatar AS owner_avatar, users.created_at AS owner_join_date,
            (SELECT COUNT(*) FROM favorites WHERE favorites.item_id = items.id) AS favorite_count,
            (SELECT COUNT(*) FROM claims WHERE claims.item_id = items.id) AS claim_count,
            (SELECT COUNT(*) FROM items WHERE user_id = items.user_id) AS owner_posts_count,
            (SELECT COUNT(*) FROM claims WHERE user_id = items.user_id) AS owner_claims_count
            FROM items JOIN users ON users.id = items.user_id WHERE items.id = ?'
        );
        $stmt->execute([$params['id']]);
        $item = $stmt->fetch();
        if (!$item) {
            error_log("[ITEM] Not found: " . $params['id']);
            Response::error('Item not found.', 404);
        }
        
        $item['image_url'] = imageUrl($item['image_url']);
        $item['owner_avatar'] = imageUrl($item['owner_avatar']);
        
        // Check if current user has favorited this item
        $favStmt = Database::connection()->prepare('SELECT id FROM favorites WHERE user_id = ? AND item_id = ?');
        $favStmt->execute([$user['id'], $params['id']]);
        $item['is_favorited'] = (bool) $favStmt->fetch();
        $item['is_owner'] = ((int) $item['user_id'] === (int) $user['id']);
        
        // Tracking info
        $trackingStmt = Database::connection()->prepare(
            'SELECT id FROM tracking_sessions 
             WHERE item_id = ? AND status = "active" 
             AND (owner_id = ? OR claimant_id = ?)'
        );
        $trackingStmt->execute([$params['id'], $user['id'], $user['id']]);
        $tracking = $trackingStmt->fetch();
        $item['active_tracking_id'] = $tracking ? (int)$tracking['id'] : null;

        // Fetch verification questions
        $qStmt = Database::connection()->prepare('SELECT id, question_text FROM claim_questions WHERE item_id = ?');
        $qStmt->execute([$params['id']]);
        $item['verification_questions'] = $qStmt->fetchAll();
        
        Response::json(['item' => $item]);
    }

    public function update(array $params): void
    {
        error_log("[ITEM] Update request for ID: " . $params['id']);
        $user = Request::requireUser();
        $data = Request::input();
        
        // Check ownership
        $check = Database::connection()->prepare('SELECT id, image_url FROM items WHERE id = ? AND user_id = ?');
        $check->execute([$params['id'], $user['id']]);
        $existing = $check->fetch();
        if (!$existing) {
            Response::error('Item not found or not authorized.', 403);
        }

        // Handle image update
        $imageUrl = $existing['image_url'];
        $fileImage = Cloudinary::uploadFromFiles('images', 'lost_found/items');
        
        if ($fileImage || (!empty($data['image_url']) && str_starts_with($data['image_url'], 'data:image/'))) {
            $newImage = $fileImage;
            if (!$newImage) {
                $newImage = Cloudinary::uploadBase64($data['image_url'], 'lost_found/items');
            }
            
            if ($newImage) {
                // Delete old one if it was on Cloudinary
                if ($existing['image_url']) {
                    $oldPublicId = Cloudinary::extractPublicId($existing['image_url']);
                    if ($oldPublicId) Cloudinary::delete($oldPublicId);
                }
                $imageUrl = $newImage;
            }
        } elseif (!empty($data['image_url']) && str_starts_with($data['image_url'], 'http')) {
            $imageUrl = $data['image_url'];
        }

        $stmt = Database::connection()->prepare('UPDATE items SET title = ?, description = ?, category = ?, status = ?, location = ?, full_address = ?, latitude = ?, longitude = ?, item_date = ?, contact = ?, image_url = ? WHERE id = ? AND user_id = ?');
        $stmt->execute([
            $data['title'] ?? '',
            $data['description'] ?? '',
            $data['category'] ?? '',
            $data['status'] ?? '',
            $data['location'] ?? '',
            $data['full_address'] ?? null,
            $data['latitude'] ?? null,
            $data['longitude'] ?? null,
            $data['date'] ?? null,
            $data['contact'] ?? '',
            $imageUrl,
            $params['id'],
            $user['id']
        ]);
        error_log("[DATABASE] Item updated successfully");
        Response::json(['message' => 'Item updated.']);
    }

    public function destroy(array $params): void
    {
        $user = Request::requireUser();
        
        // Get image URL before deleting
        $stmt = Database::connection()->prepare('SELECT image_url FROM items WHERE id = ? AND user_id = ?');
        $stmt->execute([$params['id'], $user['id']]);
        $item = $stmt->fetch();
        
        if (!$item) {
            Response::error('Item not found or not authorized.', 403);
        }
        
        // Delete from DB
        $del = Database::connection()->prepare('DELETE FROM items WHERE id = ?');
        $del->execute([$params['id']]);
        
        // Delete from Cloudinary
        if ($item['image_url']) {
            $publicId = Cloudinary::extractPublicId($item['image_url']);
            if ($publicId) Cloudinary::delete($publicId);
        }
        
        Response::json(['message' => 'Item deleted.']);
    }

    public function updateClaim(array $params): void
    {
        Request::requireAdmin();
        $data = Request::input();
        $db = Database::connection();
        $status = $data['status'] ?? 'pending';
        
        $db->prepare('UPDATE claims SET status = ? WHERE id = ?')->execute([$status, $params['id']]);
        
        // Notify the claimant
        $claimStmt = $db->prepare('SELECT c.user_id, i.title FROM claims c JOIN items i ON i.id = c.item_id WHERE c.id = ?');
        $claimStmt->execute([$params['id']]);
        $claim = $claimStmt->fetch();
        
        if ($claim) {
            $msg = ($status === 'approved') ? "Your claim for \"{$claim['title']}\" has been APPROVED." : "Your claim for \"{$claim['title']}\" has been rejected.";
            NotificationController::createNotification(
                (int) $claim['user_id'],
                $status === 'approved' ? 'Claim Approved' : 'Claim Rejected',
                $msg,
                'claim'
            );
        }
        
        Response::json(['message' => 'Claim updated.']);
    }

    public function matches(array $params): void
    {
        Request::requireUser();
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM items WHERE id = ?');
        $stmt->execute([$params['id']]);
        $item = $stmt->fetch();
        if (!$item) {
            Response::error('Item not found.', 404);
        }
        $opposite = $item['status'] === 'lost' ? 'found' : 'lost';
        $match = $db->prepare('SELECT *, item_date AS date, 75 AS score FROM items WHERE id != ? AND status = ? AND (category = ? OR location LIKE ?) ORDER BY created_at DESC LIMIT 10');
        $match->execute([$params['id'], $opposite, $item['category'], '%' . $item['location'] . '%']);
        Response::json(['matches' => $match->fetchAll()]);
    }
}
