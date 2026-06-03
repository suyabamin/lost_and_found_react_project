<?php
declare(strict_types=1);

class FavoriteController
{
    /**
     * POST /api/favorites/toggle
     */
    public function toggle(): void
    {
        $user = Request::requireUser();
        $data = Request::input();
        $itemId = (int) ($data['item_id'] ?? 0);
        
        if (!$itemId) {
            Response::error('Item ID is required for favorites.', 400);
        }

        $db = Database::connection();
        $exists = $db->prepare('SELECT id FROM favorites WHERE user_id = ? AND item_id = ?');
        $exists->execute([$user['id'], $itemId]);
        
        if ($row = $exists->fetch()) {
            $db->prepare('DELETE FROM favorites WHERE id = ?')->execute([$row['id']]);
            // Notify when someone favorites? User said "Generate notifications for: Item Favorited".
            // Typically we notify the OWNER of the item.
            Response::json(['message' => 'Favorite removed.', 'favorited' => false]);
            return;
        }
        
        $db->prepare('INSERT INTO favorites (user_id, item_id) VALUES (?, ?)')->execute([$user['id'], $itemId]);
        
        // Notify owner
        $item = $db->prepare('SELECT user_id, title FROM items WHERE id = ?');
        $item->execute([$itemId]);
        $itemRow = $item->fetch();
        if ($itemRow && (int)$itemRow['user_id'] !== (int)$user['id']) {
            NotificationController::createNotification(
                (int)$itemRow['user_id'],
                'Item Favorited',
                "{$user['name']} favorited your item \"{$itemRow['title']}\".",
                'favorite'
            );
        }
        
        Response::json(['message' => 'Favorite added.', 'favorited' => true]);
    }

    /**
     * GET /api/favorites
     */
    public function index(): void
    {
        $user = Request::requireUser();
        $db = Database::connection();
        $stmt = $db->prepare(
            'SELECT i.*, f.created_at AS favorited_at
             FROM favorites f
             JOIN items i ON i.id = f.item_id
             WHERE f.user_id = ?
             ORDER BY f.created_at DESC'
        );
        $stmt->execute([$user['id']]);
        $favs = $stmt->fetchAll();
        foreach ($favs as &$f) {
            $f['image_url'] = imageUrl($f['image_url']);
        }
        Response::json(['favorites' => $favs]);
    }

    /**
     * DELETE /api/favorites/{id}
     */
    public function destroy(array $params): void
    {
        $user = Request::requireUser();
        $db = Database::connection();
        $stmt = $db->prepare('DELETE FROM favorites WHERE id = ? AND user_id = ?');
        $stmt->execute([$params['id'], $user['id']]);
        Response::json(['message' => 'Favorite removed.']);
    }
}
