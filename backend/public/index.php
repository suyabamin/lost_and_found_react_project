<?php
declare(strict_types=1);

// Handle static files for PHP built-in server
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (file_exists(__DIR__ . $requestUri) && is_file(__DIR__ . $requestUri)) {
    return false;
}

require_once __DIR__ . '/../src/bootstrap.php';

$router = new Router();

$router->post('/api/auth/register', [AuthController::class, 'register']);
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->post('/api/auth/logout', [AuthController::class, 'logout']);
$router->get('/api/auth/me', [AuthController::class, 'me']);
$router->post('/api/profile', [ProfileController::class, 'update']);
$router->post('/api/profile/password', [ProfileController::class, 'password']);
$router->get('/api', function() { Response::json(['status' => 'API is running']); });
$router->get('/api/system/stats', [SystemController::class, 'stats']);
$router->get('/', function() { Response::json(['status' => 'API is running', 'message' => 'Use /api endpoints']); });

$router->get('/api/profile/posts', [ProfileController::class, 'posts']);
$router->get('/api/profile/favorites', [ProfileController::class, 'favorites']);
$router->get('/api/profile/claims', [ProfileController::class, 'claims']);
$router->get('/api/profile/stats', [ProfileController::class, 'stats']);
$router->get('/api/profile/history', [ProfileController::class, 'history']);

$router->get('/api/items', [ItemController::class, 'index']);
$router->post('/api/items', [ItemController::class, 'store']);
$router->get('/api/items/{id}', [ItemController::class, 'show']);
$router->post('/api/items/{id}', [ItemController::class, 'update']);
$router->delete('/api/items/{id}', [ItemController::class, 'destroy']);
$router->get('/api/items/{id}/matches', [ItemController::class, 'matches']);

// Favorites
$router->get('/api/favorites', [FavoriteController::class, 'index']);
$router->post('/api/favorites/toggle', [FavoriteController::class, 'toggle']);
$router->delete('/api/favorites/{id}', [FavoriteController::class, 'destroy']);
// Legacy toggle
$router->post('/api/items/{id}/favorite', [FavoriteController::class, 'toggle']);

// Claims
$router->get('/api/claims/my', [ClaimController::class, 'myClaims']);
$router->get('/api/claims/{id}', [ClaimController::class, 'show']);
$router->post('/api/claims', [ClaimController::class, 'store']);
$router->patch('/api/claims/{id}/respond', [ClaimController::class, 'founderRespond']);
// Legacy claim
$router->post('/api/items/{id}/claims', [ClaimController::class, 'store']);

$router->post('/api/items/{id}/reports', [ReportController::class, 'store']);

// Messenger
$router->get('/api/conversations', [MessageController::class, 'conversations']);
$router->post('/api/conversations/start', [MessageController::class, 'start']);
$router->get('/api/conversations/{id}/messages', [MessageController::class, 'messages']);
$router->post('/api/conversations/{id}/messages', [MessageController::class, 'send']);
$router->get('/api/messages/unread-count', [MessageController::class, 'unreadCount']);
// Legacy start
$router->post('/api/items/{id}/conversations', [MessageController::class, 'start']);

$router->get('/api/notifications', [NotificationController::class, 'index']);
$router->get('/api/notifications/unread-count', [NotificationController::class, 'unreadCount']);
$router->post('/api/notifications/{id}/read', [NotificationController::class, 'markRead']);
$router->post('/api/notifications/read-all', [NotificationController::class, 'markAllRead']);
$router->delete('/api/notifications/{id}', [NotificationController::class, 'destroy']);

// Tracking
$router->post('/api/tracking/update-location', [TrackingController::class, 'updateLocation']);
$router->get('/api/tracking/{id}', [TrackingController::class, 'show']);
$router->post('/api/tracking/{id}/complete', [TrackingController::class, 'complete']);

// Return Process
$router->post('/api/return-item/{id}', [ReturnController::class, 'submitReturn']);

// Rewards
$router->get('/api/rewards/my', [RewardController::class, 'myRewards']);
$router->patch('/api/rewards/{id}/respond', [RewardController::class, 'respond']);

// Admin Routes
$router->get('/api/admin/dashboard', [AdminController::class, 'dashboard']);
$router->get('/api/admin/users', [AdminController::class, 'users']);
$router->post('/api/admin/ban-user', [AdminController::class, 'banUser']);
$router->post('/api/admin/unban-user', [AdminController::class, 'unbanUser']);
$router->post('/api/admin/promote-user', [AdminController::class, 'promoteUser']);
$router->post('/api/admin/demote-user', [AdminController::class, 'demoteUser']);
$router->get('/api/admin/analytics', [AdminController::class, 'analytics']);
$router->get('/api/admin/stats', [AdminController::class, 'stats']);
$router->get('/api/admin/reports', [AdminController::class, 'reports']);
$router->get('/api/admin/logs', [AdminController::class, 'logs']);
$router->get('/api/admin/moderation', [AdminController::class, 'moderation']);
$router->post('/api/admin/posts/{id}/action', [AdminController::class, 'postAction']);

// Legacy/Existing Admin Routes
$router->get('/api/admin/posts', [AdminController::class, 'posts']);
$router->patch('/api/admin/claims/{id}', [ClaimController::class, 'updateStatus']);
$router->post('/api/admin/claims/{id}', [AdminController::class, 'updateClaim']);
$router->post('/api/admin/reports/{id}', [AdminController::class, 'updateReport']);

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
error_log("[ROUTER] Dispatching: $method $path");

$router->dispatch($method, $path);
