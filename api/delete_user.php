<?php
// api/delete_user.php
include 'db_connect.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Not authorized.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'] ?? '';

if (empty($username)) {
    echo json_encode(['success' => false, 'message' => 'Invalid user.']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM users WHERE username = ? AND role = 'user'");
    $stmt->execute([$username]);
    echo json_encode(['success' => true, 'message' => 'User deleted.']);
} catch (\PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
?>