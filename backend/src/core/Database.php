<?php
declare(strict_types=1);

class Database
{
    private static ?PDO $connection = null;

    public static function connection(): PDO
    {
        if (self::$connection) {
            return self::$connection;
        }

        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $database = getenv('DB_DATABASE') ?: 'lost_found';
        $username = getenv('DB_USERNAME') ?: 'root';
        $password = getenv('DB_PASSWORD') ?: '';
        $dsn = "mysql:host={$host};dbname={$database};charset=utf8mb4";

        try {
            self::$connection = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            error_log("[DATABASE] Connected successfully to lost_found");
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Database connection failed',
                'details' => $e->getMessage(),
                'hint' => 'Make sure MySQL is running and the database "lost_found" exists.'
            ]);
            exit;
        }

        return self::$connection;
    }
}
