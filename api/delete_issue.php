<?php
// api/delete_issue.php
include 'db_connect.php';

// Check if user is logged in
if (!isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'message' => 'Not authorized.']);
    exit;
}

// Get the issue ID from the request
$data = json_decode(file_get_contents('php://input'), true);
$issueId = $data['issueId'] ?? 0;
$username = $_SESSION['username'];

if (empty($issueId)) {
    echo json_encode(['success' => false, 'message' => 'Invalid issue ID.']);
    exit;
}

try {
    // --- 1. First, find the issue to get file paths ---
    // We MUST also match against the session username
    $stmt = $pdo->prepare("SELECT photo_paths, audio_path FROM issues WHERE id = ? AND submittedBy = ?");
    $stmt->execute([$issueId, $username]);
    $issue = $stmt->fetch();

    if ($issue) {
        // --- 2. Delete associated files from the server ---
        
        // Delete audio file
        if (!empty($issue['audio_path'])) {
            // Use '../' to go up from 'api' to the root
            $audio_file = '../' . $issue['audio_path'];
            if (file_exists($audio_file)) {
                unlink($audio_file); // Deletes the file
            }
        }

        // Delete photo files
        if (!empty($issue['photo_paths'])) {
            $photo_paths = json_decode($issue['photo_paths'], true);
            if (is_array($photo_paths)) {
                foreach ($photo_paths as $path) {
                    $photo_file = '../' . $path;
                    if (file_exists($photo_file)) {
                        unlink($photo_file); // Deletes the file
                    }
                }
            }
        }

        // --- 3. Now, delete the issue from the database ---
        $deleteStmt = $pdo->prepare("DELETE FROM issues WHERE id = ? AND submittedBy = ?");
        $deleteStmt->execute([$issueId, $username]);

        echo json_encode(['success' => true, 'message' => 'Issue deleted successfully.']);

    } else {
        // This means the issue was not found OR the user didn't own it
        echo json_encode(['success' => false, 'message' => 'Issue not found or you do not have permission.']);
    }

} catch (\PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>