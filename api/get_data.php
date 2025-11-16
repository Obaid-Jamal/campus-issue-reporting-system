<?php
// api/get_data.php
include 'db_connect.php';

// Check login
if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'message' => 'Not authorized.']);
    exit;
}

$action = $_GET['action'] ?? '';
$username = $_SESSION['username'];
$role = $_SESSION['role'];

try {
    if ($action === 'getMyIssues') {
        $stmt = $pdo->prepare("SELECT * FROM issues WHERE submittedBy = ? ORDER BY id DESC");
        $stmt->execute([$username]);
        $data = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $data]);

    } elseif ($action === 'getAllIssues' && $role === 'admin') {
        $stmt = $pdo->query("SELECT * FROM issues ORDER BY id DESC");
        $data = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $data]);

    } elseif ($action === 'getAllUsers' && $role === 'admin') {
        // Also get issue count for each user
        $stmt = $pdo->query("
            SELECT u.*, COUNT(i.id) as issueCount
            FROM users u
            LEFT JOIN issues i ON u.username = i.submittedBy
            WHERE u.role = 'user'
            GROUP BY u.id
        ");
        $data = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $data]);

    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action or permissions.']);
    }

} catch (\PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>