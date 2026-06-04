<?php
declare(strict_types=1);

class MessageController
{
    public function conversations(): void
    {
        $user = Request::requireUser();
        $db = Database::connection();
        $stmt = $db->prepare(
            'SELECT c.*,
                    i.title AS item_title, i.image_url AS item_image, i.status AS item_status,
                    u_req.name AS requester_name, u_req.avatar AS requester_avatar,
                    u_own.name AS owner_name, u_own.avatar AS owner_avatar,
                    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = 0 AND m.sender_id != ?) AS unread_count,
                    (SELECT m2.body FROM messages m2 WHERE m2.conversation_id = c.id ORDER BY m2.created_at DESC LIMIT 1) AS last_message,
                    (SELECT m3.created_at FROM messages m3 WHERE m3.conversation_id = c.id ORDER BY m3.created_at DESC LIMIT 1) AS last_message_at
             FROM conversations c
             JOIN items i ON i.id = c.item_id
             JOIN users u_req ON u_req.id = c.requester_id
             JOIN users u_own ON u_own.id = c.owner_id
             WHERE c.requester_id = ? OR c.owner_id = ?
             ORDER BY c.updated_at DESC'
        );
        $stmt->execute([$user['id'], $user['id'], $user['id']]);
        $conversations = $stmt->fetchAll();
        
        foreach ($conversations as &$conv) {
            $conv['item_image'] = imageUrl($conv['item_image']);
            $conv['requester_avatar'] = imageUrl($conv['requester_avatar']);
            $conv['owner_avatar'] = imageUrl($conv['owner_avatar']);
            
            if ((int) $conv['requester_id'] === (int) $user['id']) {
                $conv['other_user_name'] = $conv['owner_name'];
                $conv['other_user_avatar'] = $conv['owner_avatar'];
                $conv['other_user_id'] = $conv['owner_id'];
            } else {
                $conv['other_user_name'] = $conv['requester_name'];
                $conv['other_user_avatar'] = $conv['requester_avatar'];
                $conv['other_user_id'] = $conv['requester_id'];
            }
        }
        
        Response::json(['conversations' => $conversations]);
    }

    /**
     * POST /api/conversations/start
     */
    public function start(array $params = []): void
    {
        $user = Request::requireUser();
        $data = Request::input();
        
        // Take itemId from URL params, body (item_id or itemId), or even the PATH itself if we can
        $itemId = 0;
        if (!empty($params['id'])) {
            $itemId = (int) $params['id'];
        } elseif (!empty($data['item_id'])) {
            $itemId = (int) $data['item_id'];
        } elseif (!empty($data['itemId'])) {
            $itemId = (int) $data['itemId'];
        }

        if (!$itemId) {
            // Fallback: try to extract ID from PATH manually if nothing else worked
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            if (preg_match('/\/items\/(\d+)\//i', $path, $matches)) {
                $itemId = (int) $matches[1];
            }
        }

        if (!$itemId) {
            error_log("[MESSENGER] start error: Item ID missing. Params: " . json_encode($params) . " Data: " . json_encode($data));
            Response::error('Item ID is required.', 400);
        }

        $db = Database::connection();
        
        $owner = $db->prepare('SELECT user_id, title FROM items WHERE id = ?');
        $owner->execute([$itemId]);
        $item = $owner->fetch();
        if (!$item) {
            Response::error('Item not found.', 404);
        }

        // Prevent messaging yourself
        if ((int) $item['user_id'] === (int) $user['id']) {
            Response::error('Cannot start conversation with yourself.', 400);
        }

        // Check for an approved claim between this user and the item
        // Only allow chat if the user is the owner OR has an APPROVED claim
        $claimCheck = $db->prepare('SELECT status FROM claims WHERE item_id = ? AND claimant_id = ?');
        $claimCheck->execute([$itemId, $user['id']]);
        $claim = $claimCheck->fetch();

        if (!$claim || $claim['status'] !== 'approved') {
            Response::error('You can only start a chat after your claim is approved by the founder.', 403);
        }

        // Check for existing conversation (prevent duplicates)
        $existing = $db->prepare(
            'SELECT id FROM conversations WHERE item_id = ? AND requester_id = ? AND owner_id = ?'
        );
        $existing->execute([$itemId, $user['id'], $item['user_id']]);
        $existingConv = $existing->fetch();
        
        if ($existingConv) {
            Response::json(['id' => (int) $existingConv['id'], 'existing' => true]);
            return;
        }

        $stmt = $db->prepare('INSERT INTO conversations (item_id, requester_id, owner_id) VALUES (?, ?, ?)');
        $stmt->execute([$itemId, $user['id'], $item['user_id']]);
        $convId = (int) $db->lastInsertId();
        
        // Notify the owner
        NotificationController::createNotification(
            (int) $item['user_id'],
            'New Message',
            "{$user['name']} wants to discuss \"{$item['title']}\" with you.",
            'message',
            $convId
        );
        
        Response::json(['id' => $convId], 201);
    }

    public function messages(array $params): void
    {
        $user = Request::requireUser();
        $db = Database::connection();
        
        // Verify user is part of this conversation
        $convCheck = $db->prepare('SELECT id FROM conversations WHERE id = ? AND (requester_id = ? OR owner_id = ?)');
        $convCheck->execute([$params['id'], $user['id'], $user['id']]);
        if (!$convCheck->fetch()) {
            Response::error('Conversation not found.', 404);
        }
        
        // Mark messages from the other user as read
        $db->prepare('UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?')
           ->execute([$params['id'], $user['id']]);
        
        $stmt = $db->prepare(
            'SELECT m.*, m.sender_id = ? AS mine, u.name AS sender_name, u.avatar AS sender_avatar
             FROM messages m
             JOIN users u ON u.id = m.sender_id
             WHERE m.conversation_id = ?
             ORDER BY m.created_at ASC'
        );
        $stmt->execute([$user['id'], $params['id']]);
        $messages = $stmt->fetchAll();
        foreach ($messages as &$msg) {
            $msg['sender_avatar'] = imageUrl($msg['sender_avatar']);
            $msg['attachment_url'] = imageUrl($msg['attachment_url']);
        }
        Response::json(['messages' => $messages]);
    }

    public function send(array $params): void
    {
        error_log("[MESSAGE] Request received to send message in conversation ID: " . ($params['id'] ?? 'NONE'));
        $user = Request::requireUser();
        $data = Request::input();
        $body = trim($data['body'] ?? '');
        
        if (!$body) {
            error_log("[MESSAGE] Send failed: body is empty.");
            Response::error('Message is required.');
        }
        
        $db = Database::connection();
        
        // Verify user is part of this conversation
        $convCheck = $db->prepare('SELECT id, requester_id, owner_id, item_id FROM conversations WHERE id = ? AND (requester_id = ? OR owner_id = ?)');
        $convCheck->execute([$params['id'], $user['id'], $user['id']]);
        $conv = $convCheck->fetch();
        if (!$conv) {
            error_log("[MESSAGE] Send failed: Conversation not found or access denied for ID: " . $params['id']);
            Response::error('Conversation not found.', 404);
        }
        
        // Handle attachment upload
        $attachmentUrl = null;
        $attFile = Cloudinary::uploadFromFiles('attachment', 'lost_found/chat');
        if ($attFile) {
            $attachmentUrl = $attFile;
        }
        
        $stmt = $db->prepare('INSERT INTO messages (conversation_id, sender_id, body, attachment_url) VALUES (?, ?, ?, ?)');
        $stmt->execute([$params['id'], $user['id'], $body, $attachmentUrl]);
        error_log("[MESSAGE] Insert successful. Message ID: " . $db->lastInsertId());
        
        $db->prepare('UPDATE conversations SET updated_at = NOW() WHERE id = ?')->execute([$params['id']]);
        
        // Notify the other user
        $otherId = ((int) $conv['requester_id'] === (int) $user['id']) ? $conv['owner_id'] : $conv['requester_id'];
        NotificationController::createNotification(
            (int) $otherId,
            'New Message',
            "{$user['name']}: " . substr($body, 0, 100),
            'message'
        );
        
        $msgId = (int) $db->lastInsertId();
        
        Response::json([
            'status' => 'success',
            'message' => [
                'id' => $msgId,
                'conversation_id' => (int) $params['id'],
                'sender_id' => (int) $user['id'],
                'body' => $body,
                'attachment_url' => $attachmentUrl,
                'created_at' => date('Y-m-d H:i:s'),
            ]
        ], 201);
    }

    /**
     * GET /api/messages/unread-count - total unread across all conversations
     */
    public function unreadCount(): void
    {
        $user = Request::requireUser();
        $db = Database::connection();
        $stmt = $db->prepare(
            'SELECT COUNT(*) FROM messages m
             JOIN conversations c ON c.id = m.conversation_id
             WHERE m.is_read = 0 AND m.sender_id != ?
             AND (c.requester_id = ? OR c.owner_id = ?)'
        );
        $stmt->execute([$user['id'], $user['id'], $user['id']]);
        Response::json(['count' => (int) $stmt->fetchColumn()]);
    }
}
