<?php
declare(strict_types=1);

class ReportController
{
    public function store(array $params): void
    {
        $user = Request::requireUser();
        $data = Request::input();
        $stmt = Database::connection()->prepare('INSERT INTO reports (item_id, user_id, reason, details, status) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$params['id'], $user['id'], trim($data['reason'] ?? 'Fake Post'), trim($data['details'] ?? ''), 'pending']);
        
        NotificationController::notifyAdmins(
            "New Report Received",
            "A new report has been filed for item #{$params['id']} with reason: " . ($data['reason'] ?? 'Fake Post'),
            'admin_report',
            (int)$params['id']
        );

        Response::json(['message' => 'Report submitted.'], 201);
    }
}
