<?php
declare(strict_types=1);

class TrackingController
{
    /**
     * POST /api/tracking/update-location
     */
    public function updateLocation(): void
    {
        $user = Request::requireUser();
        $data = Request::input();
        $db = Database::connection();

        $lat = isset($data['latitude']) ? (float) $data['latitude'] : null;
        $lng = isset($data['longitude']) ? (float) $data['longitude'] : null;

        if ($lat === null || $lng === null) {
            Response::error('Latitude and Longitude are required.', 400);
        }

        $stmt = $db->prepare('UPDATE users SET current_lat = ?, current_lng = ? WHERE id = ?');
        $stmt->execute([$lat, $lng, $user['id']]);

        Response::json(['message' => 'Location updated.']);
    }

    /**
     * GET /api/tracking/:sessionId
     */
    public function show(array $params): void
    {
        $user = Request::requireUser();
        $db = Database::connection();
        $sessionId = (int) $params['id'];

        $stmt = $db->prepare('
            SELECT ts.*, 
                   items.title AS item_title, items.image_url AS item_image, items.status AS item_type,
                   owner.name AS owner_name, owner.current_lat AS owner_lat, owner.current_lng AS owner_lng, owner.avatar AS owner_avatar,
                   owner.bkash_number AS owner_bkash, owner.nagad_number AS owner_nagad, owner.rocket_number AS owner_rocket,
                   claimant.name AS claimant_name, claimant.current_lat AS claimant_lat, claimant.current_lng AS claimant_lng, claimant.avatar AS claimant_avatar,
                   claimant.bkash_number AS claimant_bkash, claimant.nagad_number AS claimant_nagad, claimant.rocket_number AS claimant_rocket
            FROM tracking_sessions ts
            JOIN items ON items.id = ts.item_id
            JOIN users owner ON owner.id = ts.owner_id
            JOIN users claimant ON claimant.id = ts.claimant_id
            WHERE ts.id = ?
        ');
        $stmt->execute([$sessionId]);
        $session = $stmt->fetch();

        if (!$session) {
            Response::error('Tracking session not found.', 404);
        }

        // Security: Only owner or claimant
        if ((int) $user['id'] !== (int) $session['owner_id'] && (int) $user['id'] !== (int) $session['claimant_id']) {
            Response::error('Access denied.', 403);
        }

        // Map details for reward processing
        $session['claimant_details'] = [
            'bkash_number'  => $session['claimant_bkash'],
            'nagad_number'  => $session['claimant_nagad'],
            'rocket_number' => $session['claimant_rocket'],
        ];
        $session['owner_details'] = [
            'bkash_number'  => $session['owner_bkash'],
            'nagad_number'  => $session['owner_nagad'],
            'rocket_number' => $session['owner_rocket'],
        ];

        $session['item_image'] = imageUrl($session['item_image']);
        $session['owner_avatar'] = imageUrl($session['owner_avatar']);
        $session['claimant_avatar'] = imageUrl($session['claimant_avatar']);

        Response::json(['session' => $session]);
    }

    /**
     * POST /api/tracking/:sessionId/complete
     */
    public function complete(array $params): void
    {
        $user = Request::requireUser();
        $db = Database::connection();
        $sessionId = (int) $params['id'];

        $stmt = $db->prepare('SELECT owner_id, claimant_id, item_id FROM tracking_sessions WHERE id = ?');
        $stmt->execute([$sessionId]);
        $session = $stmt->fetch();

        if (!$session) {
            Response::error('Tracking session not found.', 404);
        }

        if ((int) $user['id'] !== (int) $session['owner_id'] && (int) $user['id'] !== (int) $session['claimant_id']) {
            Response::error('Access denied.', 403);
        }

        $db->prepare('UPDATE tracking_sessions SET status = "completed" WHERE id = ?')->execute([$sessionId]);
        
        // Also update item status to resolved
        $db->prepare('UPDATE items SET status = "resolved" WHERE id = ?')->execute([$session['item_id']]);

        // Notify both parties
        $notifData = [
            'owner_id' => $session['owner_id'],
            'claimant_id' => $session['claimant_id']
        ];
        
        foreach($notifData as $role => $targetId) {
            NotificationController::createNotification(
                (int)$targetId,
                'Tracking Completed',
                'Item has been successfully returned and tracking ended.',
                'system'
            );
        }

        Response::json(['message' => 'Tracking session completed.']);
    }

    /**
     * Helper to create session (called from ClaimController)
     */
    public static function createSession(int $itemId, int $ownerId, int $claimantId): int
    {
        $db = Database::connection();
        $stmt = $db->prepare('INSERT INTO tracking_sessions (item_id, owner_id, claimant_id, status) VALUES (?, ?, ?, "active")');
        $stmt->execute([$itemId, $ownerId, $claimantId]);
        return (int) $db->lastInsertId();
    }
}
