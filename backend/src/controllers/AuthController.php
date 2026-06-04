<?php
declare(strict_types=1);

class AuthController
{
    public function register(): void
    {
        error_log("[AUTH] Register request started");
        $data = Request::input();
        $name = trim($data['name'] ?? '');
        $email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
        $password = $data['password'] ?? '';

        if (!$name || !$email || strlen($password) < 8) {
            Response::error('Name, valid email and 8 character password are required.');
        }

        $db = Database::connection();
        $stmt = $db->prepare('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)');
        try {
            $stmt->execute([$name, $email, $data['phone'] ?? null, password_hash($password, PASSWORD_DEFAULT), 'user']);
        } catch (PDOException $e) {
            Response::error('Email already exists.', 422);
        }

        $user = [
            'id'     => (int) $db->lastInsertId(),
            'name'   => $name,
            'email'  => $email,
            'phone'  => $data['phone'] ?? null,
            'role'   => 'user',
            'avatar' => null,
        ];
        $_SESSION['user'] = $user;
        Response::json(['user' => $user], 201);
    }

    public function login(): void
    {
        $data = Request::input();
        $email = $data['email'] ?? '';

        $db = Database::connection();
        $stmt = $db->prepare('SELECT id, name, email, phone, role, password, avatar, bio, location, bkash_number, nagad_number, rocket_number FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('Invalid email or password.', 401);
        }

        if (!password_verify($data['password'] ?? '', $user['password'])) {
            Response::error('Invalid email or password.', 401);
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
            $stmt = $db->prepare('SELECT id, name, email, phone, role, avatar, bio, location, bkash_number, nagad_number, rocket_number FROM users WHERE id = ?');
            $stmt->execute([$_SESSION['user']['id']]);
            $user = $stmt->fetch();
            if ($user) {
                $user['avatar'] = imageUrl($user['avatar']);
                $_SESSION['user'] = $user;
                Response::json(['user' => $user]);
                return;
            }
        }
        Response::json(['user' => null]);
    }
}
