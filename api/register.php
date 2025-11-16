<?php
// api/register.php
include 'db_connect.php';

// Get the posted data
$data = json_decode(file_get_contents('php://input'), true);

$firstName = $data['firstName'] ?? '';
$lastName = $data['lastName'] ?? '';
$erp = $data['erp'] ?? '';
$password = $data['password'] ?? '';
$department = $data['department'] ?? '';

// Simple validation
if (empty($erp) || empty($password) || empty($firstName) || empty($department)) {
    echo json_encode(['success' => false, 'message' => 'Please fill all fields.']);
    exit;
}

// Check if user (ERP) already exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$erp]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'ERP already exists.']);
    exit;
}

// Hash the password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert the new user
try {
    $stmt = $pdo->prepare("INSERT INTO users (username, firstName, lastName, department, role, registrationDate, password) VALUES (?, ?, ?, ?, 'user', CURDATE(), ?)");
    $stmt->execute([$erp, $firstName, $lastName, $department, $hashedPassword]);
    
    echo json_encode(['success' => true, 'message' => 'Registration successful! You can now login.']);
} catch (\PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>