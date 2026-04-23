<?php
namespace App\Controllers;

use Base;

class LoginController {
    public function index($f3) {
        // Check if user is already logged in
        if ($f3->get('SESSION.user')) {
            $user = $f3->get('SESSION.user');
            if ($user['type'] == 'teacher') {
                $f3->reroute('/teacher/dashboard');
                exit;
            } else {
                $f3->reroute('/student/dashboard');
                exit;
            }
        }
        $f3->set('error', $f3->get('error') ?: '');
        echo \Template::instance()->render('login.html');
    }
    
    public function login($f3) {
        $username = $f3->get('POST.username');
        $password = $f3->get('POST.password');
        $userType = $f3->get('POST.user_type');
        
        $db = $f3->get('DB');
        
        if ($userType == 'teacher') {
            $user = $db->exec('SELECT * FROM users WHERE username = ? AND type = ?', [$username, 'teacher']);
            if (!empty($user) && password_verify($password, $user[0]['password'])) {
                $f3->set('SESSION.user', [
                    'id' => $user[0]['id'],
                    'username' => $user[0]['username'],
                    'type' => 'teacher',
                    'avatar' => $user[0]['avatar'] ?: '👨‍🏫'
                ]);
                $f3->reroute('/teacher/dashboard');
            } else {
                $f3->set('error', 'Invalid credentials');
                echo \Template::instance()->render('login.html');
            }
        } else {
            $student = $db->exec('SELECT * FROM students WHERE mobile = ?', [$username]);
            if (!empty($student) && password_verify($password, $student[0]['password'])) {
                $f3->set('SESSION.user', [
                    'id' => $student[0]['id'],
                    'mobile' => $student[0]['mobile'],
                    'name' => $student[0]['name'],
                    'type' => 'student',
                    'avatar' => $student[0]['avatar'] ?: '🎓'
                ]);
                $f3->reroute('/student/dashboard');
            } else {
                $f3->set('error', 'Invalid credentials');
                echo \Template::instance()->render('login.html');
            }
        }
    }
    
    public function logout($f3) {
        $f3->clear('SESSION');
        $f3->reroute('/');
    }
}

