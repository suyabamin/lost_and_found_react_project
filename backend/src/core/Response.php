<?php
declare(strict_types=1);

class Response
{
    public static function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        echo json_encode($payload);
        exit;
    }

    public static function error(string $message, int $status = 400): void
    {
        self::json(['message' => $message], $status);
    }
}
