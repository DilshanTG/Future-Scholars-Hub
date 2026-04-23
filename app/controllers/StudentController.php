<?php
namespace App\Controllers;

use Base;

class StudentController {
    private function checkAuth($f3) {
        if (!$f3->get('SESSION.user') || $f3->get('SESSION.user')['type'] != 'student') {
            $f3->reroute('/');
        }
    }
    
    public function dashboard($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('SESSION.user')['id'];
        
        // Get student info
        $student = $db->exec('SELECT * FROM students WHERE id = ?', [$studentId])[0];
        
        // Get payment status
        $currentMonth = date('F');
        $currentYear = date('Y');
        $payment = $db->exec('SELECT * FROM payments WHERE student_id = ? AND month = ? AND year = ?', 
            [$studentId, $currentMonth, $currentYear]);
        $paymentStatus = !empty($payment) ? $payment[0]['status'] : 'unpaid';
        
        // Get next class
        $nextClass = $db->exec('SELECT c.* FROM classes c 
            INNER JOIN class_assignments ca ON c.id = ca.class_id 
            WHERE ca.student_id = ? AND c.class_date > datetime("now") 
            ORDER BY c.class_date ASC LIMIT 1', [$studentId]);
        
        // Get active announcements for this student
        $announcements = $db->exec('SELECT DISTINCT a.* FROM announcements a
            INNER JOIN announcement_assignments aa ON a.id = aa.announcement_id
            WHERE (aa.student_id = ? OR aa.student_id IS NULL)
            AND (a.expire_date IS NULL OR a.expire_date > datetime("now"))
            ORDER BY a.created_at DESC', [$studentId]);
        
        $f3->set('student', $student);
        $f3->set('paymentStatus', $paymentStatus);
        $f3->set('nextClass', !empty($nextClass) ? $nextClass[0] : null);
        $f3->set('announcements', $announcements);
        echo \Template::instance()->render('student/dashboard.html');
    }
    
    public function payment($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('SESSION.user')['id'];
        
        $payments = $db->exec('SELECT * FROM payments WHERE student_id = ? ORDER BY year DESC, month DESC', 
            [$studentId]);
        
        $f3->set('payments', $payments);
        echo \Template::instance()->render('student/payment.html');
    }
    
    public function notes($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('SESSION.user')['id'];
        
        $student = $db->exec('SELECT * FROM students WHERE id = ?', [$studentId])[0];
        
        if ($student['status'] == 'active') {
            $notes = $db->exec('SELECT n.* FROM notes n 
                INNER JOIN note_assignments na ON n.id = na.note_id 
                WHERE na.student_id = ? 
                ORDER BY n.created_at DESC', [$studentId]);
            $f3->set('notes', $notes);
        } else {
            $f3->set('notes', []);
        }
        
        $f3->set('student', $student);
        echo \Template::instance()->render('student/notes.html');
    }
    
    public function classes($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('SESSION.user')['id'];
        
        // Get all assigned classes
        $allClasses = $db->exec('SELECT c.* FROM classes c 
            INNER JOIN class_assignments ca ON c.id = ca.class_id 
            WHERE ca.student_id = ? 
            ORDER BY c.class_date DESC', [$studentId]);
        
        // Separate upcoming and past classes
        $upcomingClasses = [];
        $pastClasses = [];
        $now = date('Y-m-d H:i:s');
        
        foreach ($allClasses as $class) {
            if ($class['class_date'] > $now) {
                $upcomingClasses[] = $class;
            } else {
                $pastClasses[] = $class;
            }
        }
        
        $f3->set('upcomingClasses', $upcomingClasses);
        $f3->set('pastClasses', $pastClasses);
        echo \Template::instance()->render('student/classes.html');
    }
    
    public function recordings($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('SESSION.user')['id'];
        
        $student = $db->exec('SELECT * FROM students WHERE id = ?', [$studentId])[0];
        
        if ($student['status'] == 'active') {
            $recordings = $db->exec('SELECT r.* FROM recordings r 
                INNER JOIN recording_assignments ra ON r.id = ra.recording_id 
                WHERE ra.student_id = ? 
                ORDER BY r.created_at DESC', [$studentId]);
            $f3->set('recordings', $recordings);
        } else {
            $f3->set('recordings', []);
        }
        
        $f3->set('student', $student);
        echo \Template::instance()->render('student/recordings.html');
    }
    
    public function announcements($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('SESSION.user')['id'];
        
        // Get all announcements for this student (active and expired)
        $announcements = $db->exec('SELECT DISTINCT a.* FROM announcements a
            INNER JOIN announcement_assignments aa ON a.id = aa.announcement_id
            WHERE aa.student_id = ? OR aa.student_id IS NULL
            ORDER BY a.created_at DESC', [$studentId]);
        
        $f3->set('announcements', $announcements);
        echo \Template::instance()->render('student/announcements.html');
    }
    
    public function profile($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('SESSION.user')['id'];
        $student = $db->exec('SELECT * FROM students WHERE id = ?', [$studentId])[0];
        $f3->set('student', $student);
        echo \Template::instance()->render('student/profile.html');
    }
    
    public function updateProfile($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('SESSION.user')['id'];
        
        $newPassword = $f3->get('POST.password');
        $avatar = $f3->get('POST.avatar');
        
        if (!empty($newPassword)) {
            $db->exec('UPDATE students SET password = ?, avatar = ? WHERE id = ?', 
                [password_hash($newPassword, PASSWORD_DEFAULT), $avatar, $studentId]);
        } else {
            $db->exec('UPDATE students SET avatar = ? WHERE id = ?', 
                [$avatar, $studentId]);
        }
        
        // Update session avatar
        $user = $f3->get('SESSION.user');
        $user['avatar'] = $avatar;
        $f3->set('SESSION.user', $user);
        
        $f3->reroute('/student/profile');
    }
}

