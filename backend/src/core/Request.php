<?php
declare(strict_types=1);

class Request
{
    public static function input(): array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
        error_log("[REQUEST] Content-Type: " . $contentType);

        if (stripos($contentType, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            error_log("[REQUEST] Raw body: " . $raw);
            $decoded = json_decode($raw, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log("[REQUEST] JSON decode error: " . json_last_error_msg());
                return [];
            }
            return $decoded ?: [];
        }
        
        error_log("[REQUEST] Using _POST data");
        return $_POST ?: [];
    }

    public static function requireUser(): array
    {
        if (empty($_SESSION['user'])) {
            Response::error('Authentication required.', 401);
        }
        $user = $_SESSION['user'];
        if (($user['status'] ?? 'active') === 'banned') {
            $_SESSION = [];
            session_destroy();
            Response::error('Your account has been banned.', 403);
        }
        return $user;
    }

    public static function requireAdmin(): array
    {
        $user = self::requireUser();
        if (($user['role'] ?? 'user') !== 'admin') {
            Response::error('Admin access required.', 403);
        }
        return $user;
    }
}
