<?php
// api/login.php
include 'db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);

$username = $data['username'] ?? ''; // This is the ID
$password = $data['password'] ?? '';

// CHANGED: Removed role check
if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Please fill all fields.']);
    exit;
}

// Find the user by username (ID)
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

// CHANGED: Check only for user and password
if ($user && password_verify($password, $user['password'])) {
    // Password is correct!
    // Store user info in session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role']; // Get role from DB

    // Send back user data (but not the password)
    echo json_encode([
        'success' => true,
        'user' => [
            'username' => $user['username'],
            'role' => $user['role'] // Send the role from the DB
        ]
    ]);
} else {
    // Invalid credentials
    // CHANGED: Updated error message
    echo json_encode(['success' => false, 'message' => 'Invalid ID or password.']);
}
?>