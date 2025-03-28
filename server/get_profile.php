<?php
//header("Access-Control-Allow-Origin: http://localhost:3000");

// Allowed Origins for CORS
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173', // Add other ports if necessary
    'http://127.0.0.1:3000',
    'http://localhost:5173'
];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
} else {
    header("Access-Control-Allow-Origin: http://localhost:3000"); // Default fallback
}
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db.php';

// Get data from request
$data = json_decode(file_get_contents("php://input"), true);

// Handle password change
if (isset($data['action']) && $data['action'] === 'change_password') {
    if (!isset($data['userId']) || !isset($data['currentPassword']) || !isset($data['newPassword'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }

    $userId = intval($data['userId']);
    $currentPassword = $data['currentPassword'];
    $newPassword = $data['newPassword'];

    // First verify current password
    $verifyStmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
    $verifyStmt->bind_param("i", $userId);
    $verifyStmt->execute();
    $result = $verifyStmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user || !password_verify($currentPassword, $user['password'])) {
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
        $verifyStmt->close();
        $conn->close();
        exit;
    }

    // Hash new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update password
    $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $updateStmt->bind_param("si", $hashedPassword, $userId);

    if ($updateStmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update password']);
    }

    $verifyStmt->close();
    $updateStmt->close();
    $conn->close();
    exit;
}

// Handle profile update
if (isset($data['action']) && $data['action'] === 'update') {
    if (!isset($data['userId']) || !isset($data['userData'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid update request data']);
        exit;
    }

    $userId = intval($data['userId']);
    $userData = $data['userData'];

    $updateStmt = $conn->prepare("
        UPDATE users 
        SET 
            username = ?,
            email = ?,
            phone = ?,
            location = ?
        WHERE id = ?
    ");

    if (!$updateStmt) {
        echo json_encode(['success' => false, 'message' => 'Update query preparation failed']);
        exit;
    }

    $updateStmt->bind_param("ssssi", 
        $userData['name'],
        $userData['email'],
        $userData['phone'],
        $userData['location'],
        $userId
    );

    if ($updateStmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
    }

    $updateStmt->close();
    $conn->close();
    exit;
}

// Handle get profile
if (!isset($data['userId'])) {
    echo json_encode(['success' => false, 'message' => 'User ID is required']);
    exit;
}

$userId = intval($data['userId']);

$stmt = $conn->prepare("
    SELECT 
        u.id,
        u.username,
        u.email,
        u.phone,
        u.position,
        u.location,
        u.created_at
    FROM users u
    WHERE u.id = ?
");

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Query preparation failed']);
    exit;
}

$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    // Get recent analyses
    $analysesStmt = $conn->prepare("
        SELECT id, title, date, model
        FROM analyses
        WHERE user_id = ?
        ORDER BY date DESC
        LIMIT 3
    ");
    
    $analyses = [];
    
    if ($analysesStmt) {
        $analysesStmt->bind_param("i", $userId);
        $analysesStmt->execute();
        $analysesResult = $analysesStmt->get_result();
        
        while ($analysis = $analysesResult->fetch_assoc()) {
            $analyses[] = [
                'id' => $analysis['id'],
                'title' => $analysis['title'],
                'date' => $analysis['date'],
                'model' => $analysis['model']
            ];
        }
        
        $analysesStmt->close();
    }
    
    $response = [
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'name' => $user['username'],
            'email' => $user['email'],
            'phone' => $user['phone'] ?? '',
            'position' => $user['position'] ?? 'Time Study Analyst',
            'location' => $user['location'] ?? 'Not specified',
            'joinDate' => date('F Y', strtotime($user['created_at'])),
            'recentAnalyses' => $analyses
        ]
    ];
    
    echo json_encode($response);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}

$stmt->close();
$conn->close();
?>