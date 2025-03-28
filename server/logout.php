<?php
session_start();

// Destroy session and remove session cookie
$_SESSION = [];
session_destroy();
setcookie("PHPSESSID", "", time() - 3600, "/");

// Set response headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost'); // Adjust based on frontend domain
header('Access-Control-Allow-Credentials: true');

echo json_encode(["message" => "Logged out successfully"]);
?>
