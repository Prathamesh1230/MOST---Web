<?php
$host = "localhost";
$user = "root";//Database username
$pass = "966510";// Your database password
$dbname = "auth_user";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die(json_encode([
        "success" => false, 
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}

// Set charset to ensure proper handling of special characters
$conn->set_charset("utf8mb4");
?>