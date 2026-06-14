<?php
declare(strict_types=1);

class AuthController
{
    public function register(): void
    {
        error_log("[AUTH] Register request started");
        $data = Request::input();
        $name = trim($data['name'] ?? '');
        $email = trim(strtolower($data['email'] ?? ''));
        $email = filter_var($email, FILTER_VALIDATE_EMAIL);
        $password = $data['password'] ?? '';

        if (!$name || !$email || strlen($password) < 8) {
            Response::error('Name, valid email and 8 character password are required.');
        }

        $db = Database::connection();
        error_log("[AUTH] Registering user: $email");
        $stmt = $db->prepare('INSERT INTO users (name, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?)');
        try {
            $stmt->execute([$name, $email, $data['phone'] ?? null, password_hash($password, PASSWORD_DEFAULT), 'user', 'active']);
            error_log("[DATABASE] User inserted successfully: $email");
        } catch (PDOException $e) {
            error_log("[DATABASE] Registration failed for $email: " . $e->getMessage());
            Response::error('Email already exists.', 422);
        }

        $user = [
            'id'     => (int) $db->lastInsertId(),
            'name'   => $name,
            'email'  => $email,
            'phone'  => $data['phone'] ?? null,
            'role'   => 'user',
            'status' => 'active',
            'avatar' => null,
        ];

        NotificationController::notifyAdmins("New User Registration", "A new user $name ($email) has registered on the platform.");

        $_SESSION['user'] = $user;
        Response::json(['user' => $user], 201);
    }

    public function login(): void
    {
        $data = Request::input();
        $email = trim(strtolower($data['email'] ?? ''));
        $password = $data['password'] ?? '';
        
        error_log("[AUTH] Attemping login for: $email (pwd length: " . strlen($password) . ")");
        $db = Database::connection();
        $stmt = $db->prepare('SELECT id, name, email, phone, role, status, password, avatar, bio, location, bkash_number, nagad_number, rocket_number FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            error_log("[LOGIN] Email not found: $email");
            Response::error('Invalid email or password.', 401);
        }

        if (!password_verify($password, $user['password'])) {
            error_log("[LOGIN] Password mismatch for: $email");
            Response::error('Invalid email or password.', 401);
        }
        
        error_log("[LOGIN] Success: User found and verified: $email");

        if ($user['status'] === 'banned') {
            Response::error('Your account has been banned. Please contact support.', 403);
        }

        unset($user['password']);
        $user['avatar'] = imageUrl($user['avatar']);
        $_SESSION['user'] = $user;
        Response::json(['user' => $user]);
    }

    public function logout(): void
    {
        $_SESSION = [];
        session_destroy();
        Response::json(['message' => 'Logged out.']);
    }

    public function me(): void
    {
        if (!empty($_SESSION['user'])) {
            // Refresh from DB to get latest avatar/name
            $db = Database::connection();
            $stmt = $db->prepare('SELECT id, name, email, phone, role, status, avatar, bio, location, bkash_number, nagad_number, rocket_number FROM users WHERE id = ?');
            $stmt->execute([$_SESSION['user']['id']]);
            $user = $stmt->fetch();
            if ($user) {
                if ($user['status'] === 'banned') {
                    $_SESSION = [];
                    session_destroy();
                    Response::json(['user' => null, 'banned' => true], 403);
                    return;
                }
                $user['avatar'] = imageUrl($user['avatar']);
                $_SESSION['user'] = $user;
                Response::json(['user' => $user]);
                return;
            }
        }
        Response::json(['user' => null]);
    }
}
