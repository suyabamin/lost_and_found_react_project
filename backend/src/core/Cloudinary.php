<?php
declare(strict_types=1);

class Cloudinary
{
    private static ?array $config = null;

    private static function getConfig(): array
    {
        if (self::$config) {
            return self::$config;
        }
        self::$config = [
            'cloud_name' => getenv('CLOUDINARY_CLOUD_NAME') ?: '',
            'api_key'    => getenv('CLOUDINARY_API_KEY') ?: '',
            'api_secret' => getenv('CLOUDINARY_API_SECRET') ?: '',
        ];
        return self::$config;
    }

    /**
     * Upload image to Cloudinary from $_FILES or a base64 string.
     * Returns the secure URL or null on failure.
     */
    public static function upload(string $filePathOrBase64, string $folder = 'lost_found'): ?string
    {
        $config = self::getConfig();

        // If Cloudinary is not configured, fall back to local storage
        if (!$config['cloud_name'] || !$config['api_key'] || !$config['api_secret']) {
            error_log('[CLOUDINARY] Not configured – falling back to local upload');
            return null;
        }

        $timestamp = time();
        $params = [
            'folder'    => $folder,
            'timestamp' => $timestamp,
        ];

        // Build signature
        ksort($params);
        $signString = http_build_query($params, '', '&') . $config['api_secret'];
        $signature = sha1($signString);

        $url = "https://api.cloudinary.com/v1_1/{$config['cloud_name']}/image/upload";

        $postFields = [
            'folder'    => $folder,
            'timestamp' => $timestamp,
            'api_key'   => $config['api_key'],
            'signature' => $signature,
        ];

        // Determine if base64 or file path
        if (str_starts_with($filePathOrBase64, 'data:image/') || str_starts_with($filePathOrBase64, 'data:application/')) {
            $postFields['file'] = $filePathOrBase64;
        } elseif (file_exists($filePathOrBase64)) {
            $postFields['file'] = new \CURLFile($filePathOrBase64);
        } else {
            error_log('[CLOUDINARY] Invalid file: ' . substr($filePathOrBase64, 0, 100));
            return null;
        }

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $postFields,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 60,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);
        curl_close($ch);

        if ($curlErr) {
            error_log("[CLOUDINARY] cURL error: $curlErr");
            return null;
        }

        $result = json_decode($response, true);

        if ($httpCode !== 200 || empty($result['secure_url'])) {
            error_log("[CLOUDINARY] Upload failed ($httpCode): " . ($result['error']['message'] ?? $response));
            return null;
        }

        error_log("[CLOUDINARY] Upload success: " . $result['secure_url']);
        return $result['secure_url'];
    }

    /**
     * Generate a thumbnail URL using Cloudinary transformations.
     * Example: w_200,h_200,c_fill
     */
    public static function getThumbnail(string $url, int $width = 200, int $height = 200): string
    {
        if (!str_contains($url, 'res.cloudinary.com')) {
            return $url;
        }
        return str_replace('/upload/', "/upload/w_{$width},h_{$height},c_fill,g_auto,f_auto,q_auto/", $url);
    }

    /**
     * Generate a compressed/optimized URL.
     */
    public static function getOptimized(string $url): string
    {
        if (!str_contains($url, 'res.cloudinary.com')) {
            return $url;
        }
        return str_replace('/upload/', "/upload/f_auto,q_auto/", $url);
    }

    /**
     * Extract public_id from a Cloudinary URL
     */
    public static function extractPublicId(string $url): ?string
    {
        if (!str_contains($url, 'res.cloudinary.com')) {
            return null;
        }
        
        // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{ext}
        $parts = explode('/upload/', $url);
        if (count($parts) < 2) return null;
        
        $afterUpload = $parts[1];
        // Remove version (if exists, starts with v)
        if (preg_match('/^v\d+\//', $afterUpload)) {
            $afterUpload = preg_replace('/^v\d+\//', '', $afterUpload);
        }
        
        // Remove extension
        return preg_replace('/\.\w+$/', '', $afterUpload);
    }

    /**
     * Upload from $_FILES array (handles the first file in the given key).
     */
    public static function uploadFromFiles(string $fileKey = 'images', string $folder = 'lost_found'): ?string
    {
        if (empty($_FILES[$fileKey]['name'])) {
            // Check both indexed and non-indexed
            if (empty($_FILES[$fileKey]['name'][0] ?? $_FILES[$fileKey]['name'] ?? '')) {
                return null;
            }
        }

        // Validate type
        $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $isIndexed = is_array($_FILES[$fileKey]['name']);
        $type = $isIndexed ? ($_FILES[$fileKey]['type'][0] ?? '') : ($_FILES[$fileKey]['type'] ?? '');
        $size = $isIndexed ? ($_FILES[$fileKey]['size'][0] ?? 0) : ($_FILES[$fileKey]['size'] ?? 0);
        $tmpName = $isIndexed ? ($_FILES[$fileKey]['tmp_name'][0] ?? '') : ($_FILES[$fileKey]['tmp_name'] ?? '');

        if (!in_array($type, $allowed)) {
            error_log("[CLOUDINARY] Invalid type: $type");
            return null;
        }

        // Max 10MB
        if ($size > 10 * 1024 * 1024) {
            error_log("[CLOUDINARY] File too large: $size bytes");
            return null;
        }

        if (!$tmpName || !file_exists($tmpName)) {
            return null;
        }

        // Try Cloudinary
        $cloudUrl = self::upload($tmpName, $folder);
        if ($cloudUrl) {
            return $cloudUrl;
        }

        // Fallback to local
        return self::saveLocal($tmpName, $type);
    }

    /**
     * Upload from base64 string
     */
    public static function uploadBase64(string $base64, string $folder = 'lost_found'): ?string
    {
        if (!$base64 || !str_starts_with($base64, 'data:image/')) {
            return null;
        }

        // Try Cloudinary
        $cloudUrl = self::upload($base64, $folder);
        if ($cloudUrl) {
            return $cloudUrl;
        }

        // Fallback: save locally
        return self::saveLocalBase64($base64);
    }

    /**
     * Delete from Cloudinary by public_id
     */
    public static function delete(string $publicId): bool
    {
        $config = self::getConfig();
        if (!$config['cloud_name'] || !$config['api_key'] || !$config['api_secret']) {
            return false;
        }

        $timestamp = time();
        $signString = "public_id={$publicId}&timestamp={$timestamp}" . $config['api_secret'];
        $signature = sha1($signString);

        $url = "https://api.cloudinary.com/v1_1/{$config['cloud_name']}/image/destroy";

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => [
                'public_id' => $publicId,
                'timestamp' => $timestamp,
                'api_key'   => $config['api_key'],
                'signature' => $signature,
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 30,
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        $result = json_decode($response, true);
        return ($result['result'] ?? '') === 'ok';
    }

    private static function saveLocal(string $tmpName, string $type): ?string
    {
        $ext = match ($type) {
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
            default      => 'jpg',
        };
        $dir = __DIR__ . '/../../public/uploads';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $name = bin2hex(random_bytes(16)) . '.' . $ext;
        move_uploaded_file($tmpName, "$dir/$name");
        return "/uploads/$name";
    }

    private static function saveLocalBase64(string $base64): ?string
    {
        if (!preg_match('/^data:image\/(\w+);base64,/', $base64, $m)) {
            return null;
        }
        $ext = $m[1] === 'jpeg' ? 'jpg' : $m[1];
        $data = base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $base64));
        $dir = __DIR__ . '/../../public/uploads';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $name = bin2hex(random_bytes(16)) . '.' . $ext;
        file_put_contents("$dir/$name", $data);
        return "/uploads/$name";
    }
}
