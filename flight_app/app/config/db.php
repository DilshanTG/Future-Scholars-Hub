<?php
// flight_app/app/config/db.php

// Helper to get DB connection
function getDB() {
    $dbPath = __DIR__ . '/../../../db/online_class.db';
    if (!file_exists($dbPath)) {
        // Fallback or error
        die("Database not found at $dbPath");
    }
    
    try {
        $pdo = new PDO("sqlite:$dbPath");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch(PDOException $e) {
        die("DB Error: " . $e->getMessage());
    }
}
