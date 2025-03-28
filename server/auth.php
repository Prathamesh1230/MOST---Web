<?php
session_start(); // Start session for authentication

header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

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

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db.php'; // Database connection

$data = json_decode(file_get_contents("php://input"), true);

// Check if JSON is valid
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["success" => false, "message" => "Invalid JSON format"]);
    exit;
}

// Check if required fields are present
if (!$data || !isset($data['action'], $data['email'], $data['password'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$action = $data['action'];
$email = trim($data['email']);
$password = $data['password'];

if ($action === "register") {
    if (!isset($data['username'])) {
        echo json_encode(["success" => false, "message" => "Username is required"]);
        exit;
    }

    // Check if email already exists
    $checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Email already registered"]);
        $checkStmt->close();
        exit;
    }
    $checkStmt->close();

    $username = trim($data['username']);
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $email, $hashedPassword);

    if ($stmt->execute()) {
        // Auto-login after registration
        $_SESSION['user_id'] = $stmt->insert_id;
        $_SESSION['username'] = $username;
        $_SESSION['email'] = $email;

        echo json_encode([
            "success" => true, 
            "message" => "Registration successful",
            "user" => [
                "id" => $_SESSION['user_id'],
                "username" => $_SESSION['username'],
                "email" => $_SESSION['email']
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
    }
    $stmt->close();

} elseif ($action === "login") {
    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            // Store user data in session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['email'] = $email;

            echo json_encode([
                "success" => true, 
                "user" => [
                    "id" => $_SESSION['user_id'],
                    "username" => $_SESSION['username'],
                    "email" => $_SESSION['email']
                ]
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid credentials"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "User not found"]);
    }
    $stmt->close();
} elseif ($action === "logout") {
    // Destroy session on logout
    session_destroy();
    echo json_encode(["success" => true, "message" => "Logged out successfully"]);
} elseif ($action === "check_session") {
    // Check if user is logged in
    if (isset($_SESSION['user_id'])) {
        echo json_encode([
            "success" => true, 
            "user" => [
                "id" => $_SESSION['user_id'],
                "username" => $_SESSION['username'],
                "email" => $_SESSION['email']
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "No active session"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid action"]);
}

$conn->close();
?>
