<?php
// api/submit_issue.php
include 'db_connect.php';

// --- START DEBUGGING ---
// This writes to your Apache error log (e.g., C:\xampp\apache\logs\error.log)
error_log("--- NEW ISSUE SUBMISSION (v3_DEBUG) ---");
// --- END DEBUGGING ---

// Check if user is logged in
if (!isset($_SESSION['username'])) {
    error_log("DEBUG: User not logged in."); // Debug
    echo json_encode(['success' => false, 'message' => 'You must be logged in to submit an issue.']);
    exit;
}

// --- Get Text Data ---
$description = $_POST['description'] ?? '';
$category = $_POST['category'] ?? '';
$block = $_POST['block'] ?? '';
$room = $_POST['room'] ?? '';
$location = $_POST['location'] ?? '';
$submittedBy = $_SESSION['username'];
$dateSubmitted = date('Y-m-d');

// --- Handle Audio Data (Base64) ---  
$audioDataUrl = $_POST['audioDataUrl'] ?? null;
$audio_path = null;

if ($audioDataUrl && $audioDataUrl !== 'null') {
    error_log("DEBUG: audioDataUrl is present. First 100 chars: " . substr($audioDataUrl, 0, 100)); // Debug
    
    $matches = [];
    preg_match('/^data:audio\/(\w+)[^;]*;base64,/', $audioDataUrl, $matches);
    $file_ext = $matches[1] ?? 'webm'; 
    error_log("DEBUG: Detected file extension: " . $file_ext); // Debug

    $base64_audio = preg_replace('/^data:audio\/[^,]+,/', '', $audioDataUrl);
    error_log("DEBUG: Base64 prefix stripped. First 50 chars of data: " . substr($base64_audio, 0, 50)); // Debug

    $audio_data = base64_decode($base64_audio);
    
    $audio_filename = 'audio_' . uniqid() . '.' . $file_ext;
    $audio_path = 'uploads/' . $audio_filename;
    
    // --- THIS IS THE MOST IMPORTANT DEBUG ---
    $save_path = '../' . $audio_path;
    if (file_put_contents($save_path, $audio_data)) {
        error_log("DEBUG: SUCCESS! File saved to: " . $save_path); // Debug
    } else {
        error_log("DEBUG: FAILED! Could not save file to: " . $save_path); // Debug
        error_log("DEBUG: Check if 'uploads' folder exists and is writable!"); // Debug
        $audio_path = null;
    }
    // --- END DEBUG ---

} else {
    error_log("DEBUG: No audioDataUrl was sent ('null' or empty)."); // Debug
}
// --- END OF FIXED SECTION ---


// --- Handle Photo Uploads (Files) ---
$photo_paths = [];
$upload_dir = '../uploads/';

if (!empty($_FILES['issuePhoto']['name'][0])) {
    error_log("DEBUG: Photo upload detected."); // Debug
    foreach ($_FILES['issuePhoto']['name'] as $key => $name) {
        if ($_FILES['issuePhoto']['error'][$key] === UPLOAD_ERR_OK) {
            $tmp_name = $_FILES['issuePhoto']['tmp_name'][$key];
            
            $file_ext = pathinfo($name, PATHINFO_EXTENSION);
            $file_name = 'photo_' . uniqid() . '.' . $file_ext;
            $destination = $upload_dir . $file_name;

            if (move_uploaded_file($tmp_name, $destination)) {
                $photo_paths[] = 'uploads/' . $file_name;
                error_log("DEBUG: Photo saved: " . $destination); // Debug
            } else {
                error_log("DEBUG: FAILED to save photo: " . $destination); // Debug
            }
        }
    }
}
$photo_paths_json = empty($photo_paths) ? null : json_encode($photo_paths);


// --- Insert into Database ---
try {
    $stmt = $pdo->prepare("
        INSERT INTO issues (description, category, status, submittedBy, dateSubmitted, block, room, location, photo_paths, audio_path)
        VALUES (?, ?, 'Submitted', ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $description, 
        $category, 
        $submittedBy, 
        $dateSubmitted, 
        $block, 
        $room, 
        $location,
        $photo_paths_json,
        $audio_path
    ]);

    $newIssueId = $pdo->lastInsertId();
    error_log("DEBUG: Successfully inserted issue #" . $newIssueId . " into database."); // Debug
    echo json_encode(['success' => true, 'message' => 'Issue reported successfully!', 'newIssueId' => $newIssueId]);

} catch (\PDOException $e) {
    error_log("DEBUG: DATABASE ERROR: " . $e->getMessage()); // Debug
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>