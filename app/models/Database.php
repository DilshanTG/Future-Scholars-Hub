<?php
namespace App\Models;

class Database {
    public static function init($f3) {
        $db = $f3->get('DB');
        
        // Users table (for teachers)
        $db->exec('CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT "teacher",
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )');
        
        // Students table
        $db->exec('CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mobile TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            grade TEXT NOT NULL,
            gender TEXT NOT NULL,
            district TEXT NOT NULL,
            password TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT "active",
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )');
        
        // Classes table
        $db->exec('CREATE TABLE IF NOT EXISTS classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT NOT NULL,
            class_date DATETIME NOT NULL,
            zoom_link TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )');
        
        // Class assignments (many-to-many)
        $db->exec('CREATE TABLE IF NOT EXISTS class_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            FOREIGN KEY (class_id) REFERENCES classes(id),
            FOREIGN KEY (student_id) REFERENCES students(id),
            UNIQUE(class_id, student_id)
        )');
        
        // Payments table
        $db->exec('CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            month TEXT NOT NULL,
            year INTEGER NOT NULL,
            status TEXT DEFAULT "unpaid",
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id),
            UNIQUE(student_id, month, year)
        )');
        
        // Notes table
        $db->exec('CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            link TEXT,
            details TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )');
        
        // Note assignments (many-to-many)
        $db->exec('CREATE TABLE IF NOT EXISTS note_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            note_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            FOREIGN KEY (note_id) REFERENCES notes(id),
            FOREIGN KEY (student_id) REFERENCES students(id),
            UNIQUE(note_id, student_id)
        )');
        
        // Recordings table
        $db->exec('CREATE TABLE IF NOT EXISTS recordings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT NOT NULL,
            link TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )');
        
        // Recording assignments (many-to-many)
        $db->exec('CREATE TABLE IF NOT EXISTS recording_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recording_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            FOREIGN KEY (recording_id) REFERENCES recordings(id),
            FOREIGN KEY (student_id) REFERENCES students(id),
            UNIQUE(recording_id, student_id)
        )');
        
        // Announcements table
        $db->exec('CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            expire_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )');
        
        // Announcement assignments (many-to-many, NULL student_id means all students)
        $db->exec('CREATE TABLE IF NOT EXISTS announcement_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            announcement_id INTEGER NOT NULL,
            student_id INTEGER,
            FOREIGN KEY (announcement_id) REFERENCES announcements(id),
            FOREIGN KEY (student_id) REFERENCES students(id),
            UNIQUE(announcement_id, student_id)
        )');
        
        // Create default teacher if not exists
        $teacher = $db->exec('SELECT * FROM users WHERE username = ?', ['admin']);
        if (empty($teacher)) {
            $db->exec('INSERT INTO users (username, password, type) VALUES (?, ?, ?)', [
                'admin',
                password_hash('admin123', PASSWORD_DEFAULT),
                'teacher'
            ]);
        }
    }
}

