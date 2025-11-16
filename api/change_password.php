<?php
// api/change_password.php
include 'db_connect.php';

// 1. Check if user is logged in
if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in.']);
    exit;
}

// 2. Get data from the form
$data = json_decode(file_get_contents('php://input'), true);
$oldPassword = $data['oldPassword'] ?? '';
$newPassword = $data['newPassword'] ?? '';
$username = $_SESSION['username']; // Get the logged-in user

// 3. Get the user's current hashed password from the DB
$stmt = $pdo->prepare("SELECT password FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

// 4. Verify the "Old Password"
// This is the most likely place for an error
if (!$user || !password_verify($oldPassword, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Old password is not correct.']);
    exit;
}

// 5. If old password was correct, create a new hash
$newHashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

// 6. Update the database with the new password
$stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ?");
$stmt->execute([$newHashedPassword, $username]);

echo json_encode(['success' => true, 'message' => 'Password updated successfully!']);
?>