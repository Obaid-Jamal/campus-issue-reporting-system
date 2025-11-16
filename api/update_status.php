<?php
// api/update_status.php
include 'db_connect.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Not authorized.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$issueId = $data['issueId'] ?? 0;
$newStatus = $data['newStatus'] ?? '';
$comment = $data['comment'] ?? null; // Get the new comment

if (empty($issueId) || empty($newStatus)) {
    echo json_encode(['success' => false, 'message' => 'Invalid data.']);
    exit;
}

try {
    // If a comment is provided (which only happens on "Resolve"), update it.
    if ($comment !== null && $newStatus === 'Resolved') {
        $stmt = $pdo->prepare("UPDATE issues SET status = ?, admin_comment = ? WHERE id = ?");
        $stmt->execute([$newStatus, $comment, $issueId]);
    } else {
        // This handles "In Progress" or "Resolved" without a comment
        $stmt = $pdo->prepare("UPDATE issues SET status = ? WHERE id = ?");
        $stmt->execute([$newStatus, $issueId]);
    }
    
    echo json_encode(['success' => true, 'message' => 'Status updated.']);
} catch (\PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>