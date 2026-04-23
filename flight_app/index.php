<?php
// flight_app/index.php

require 'flight/flight/autoload.php';
require 'app/config/db.php';

session_start();

// Helper to render view with layout
function renderWithLayout($view, $data = []) {
    // Check for flash message and pass it to view
    $flash = getFlash();
    if ($flash) {
        $data['message'] = $flash;
    }
    Flight::render($view, $data, 'body_content');
    Flight::render('layout', $data);
}

// Flash Message Helpers
function setFlash($type, $title, $text) {
    $_SESSION['flash'] = [
        'type' => $type,
        'title' => $title,
        'text' => $text
    ];
    session_write_close();
}

function getFlash() {
    if (isset($_SESSION['flash'])) {
        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $flash;
    }
    return null;
}

// Routes
Flight::route('GET /', function(){
    if (isset($_SESSION['user'])) {
        $user = $_SESSION['user'];
        if ($user['type'] == 'teacher') {
            Flight::redirect('/online_class/flight_app/teacher/dashboard');
        } else {
            Flight::redirect('/online_class/flight_app/student/dashboard');
        }
        return;
    }
    renderWithLayout('login', ['title' => 'Login - Future Scholars Hub']);
});

Flight::route('POST /login', function(){
    $request = Flight::request();
    $username = $request->data->username;
    $password = $request->data->password;
    $userType = $request->data->user_type;
    
    $db = getDB();
    
    if ($userType == 'teacher') {
        $stmt = $db->prepare('SELECT * FROM users WHERE username = ? AND type = ?');
        $stmt->execute([$username, 'teacher']);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user'] = [
                'id' => $user['id'],
                'username' => $user['username'],
                'type' => 'teacher',
                'avatar' => $user['avatar'] ?: '👨‍🏫'
            ];
            Flight::redirect('/online_class/flight_app/teacher/dashboard');
        } else {
            renderWithLayout('login', ['title' => 'Login Failed', 'error' => 'Invalid credentials']);
        }
    } else {
        $stmt = $db->prepare('SELECT * FROM students WHERE mobile = ?');
        $stmt->execute([$username]);
        $student = $stmt->fetch();
        
        if ($student && password_verify($password, $student['password'])) {
            $_SESSION['user'] = [
                'id' => $student['id'],
                'mobile' => $student['mobile'],
                'name' => $student['name'],
                'type' => 'student',
                'avatar' => $student['avatar'] ?: '🎓'
            ];
            Flight::redirect('/online_class/flight_app/student/dashboard');
        } else {
            renderWithLayout('login', ['title' => 'Login Failed', 'error' => 'Invalid credentials']);
        }
    }
});

Flight::route('GET /logout', function(){
    session_destroy();
    Flight::redirect('/online_class/flight_app/');
});


Flight::route('GET /teacher/dashboard', function(){
    // Middleware check
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $db = getDB();
    
    // Stats
    $stmt = $db->query('SELECT COUNT(*) as count FROM students');
    $totalStudents = $stmt->fetch()['count'];
    
    $stmt = $db->prepare('SELECT COUNT(*) as count FROM students WHERE status = ?');
    $stmt->execute(['active']);
    $activeStudents = $stmt->fetch()['count'];
    
    $stmt = $db->query('SELECT COUNT(*) as count FROM classes');
    $totalClasses = $stmt->fetch()['count'];

    renderWithLayout('teacher/dashboard', [
        'title' => 'Teacher Dashboard',
        'totalStudents' => $totalStudents,
        'activeStudents' => $activeStudents,
        'totalClasses' => $totalClasses,
        'user' => $_SESSION['user']
    ]);
});


Flight::route('GET /teacher/students', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $db = getDB();
    
    // Get all students
    $stmt = $db->query('SELECT * FROM students ORDER BY created_at DESC');
    $students = $stmt->fetchAll();
    
    // Enrich with payment and next class
    foreach ($students as &$student) {
        $currentMonth = date('F');
        $currentYear = date('Y');
        
        // Payment Status
        $stmt = $db->prepare('SELECT status FROM payments WHERE student_id = ? AND month = ? AND year = ?');
        $stmt->execute([$student['id'], $currentMonth, $currentYear]);
        $payment = $stmt->fetch();
        $student['payment_status'] = $payment ? $payment['status'] : 'unpaid';
        
        // Next Class
        $stmt = $db->prepare('SELECT c.* FROM classes c 
            INNER JOIN class_assignments ca ON c.id = ca.class_id 
            WHERE ca.student_id = ? AND c.class_date > datetime("now") 
            ORDER BY c.class_date ASC LIMIT 1');
        $stmt->execute([$student['id']]);
        $nextClass = $stmt->fetch();
        $student['next_class'] = $nextClass ? $nextClass : null;
    }
    
    renderWithLayout('teacher/students', [
        'title' => 'Students',
        'students' => $students,
        'user' => $_SESSION['user']
    ]);
});


Flight::route('GET /teacher/students/add', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $old = [];
    if (isset($_SESSION['old'])) {
        $old = $_SESSION['old'];
        unset($_SESSION['old']);
    }

    renderWithLayout('teacher/add_student', [
        'title' => 'Add Student',
        'user' => $_SESSION['user'],
        'old' => $old
    ]);
});

Flight::route('POST /teacher/students/add', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $request = Flight::request();
    $db = getDB();
    
    $mobile = $request->data->mobile;
    $name = $request->data->name;
    $grade = $request->data->grade;
    $gender = $request->data->gender;
    $district = $request->data->district;
    $description = $request->data->description;
    $teacher_note = $request->data->teacher_note;
    $defaultPassword = password_hash('student123', PASSWORD_DEFAULT);
    
    // Avatar Logic
    $boys = ['🦁', '🐯', '🦅', '🐺', '🦖', '🐉', '🦈', '🐊', '🦏', '🐘', '🦌', '🐗', '🦍', '🐆', '🦔', '🐢', '🦎', '🐙', '🦂', '🦞'];
    $girls = ['🌸', '🌺', '🌻', '🌷', '🌹', '🏵️', '💐', '🦋', '🐞', '🐝', '🦢', '🦩', '🦚', '🐰', '🦊', '🐨', '🐼', '🦄', '🌼', '🦷'];
    $avatar = (strtolower($gender) == 'male') ? $boys[array_rand($boys)] : $girls[array_rand($girls)];
    
    try {
        $stmt = $db->prepare('INSERT INTO students (mobile, name, grade, gender, district, password, description, status, avatar, teacher_note) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $mobile, $name, $grade, $gender, $district, $defaultPassword, $description, 'active', $avatar, $teacher_note
        ]);
        
        setFlash('success', 'Success!', 'Student added successfully.');
        Flight::redirect('/online_class/flight_app/teacher/students');
    } catch (PDOException $e) {
        $_SESSION['old'] = $request->data->getData();
        setFlash('error', 'Error!', 'Could not add student. Check duplicate mobile.');
        Flight::redirect('/online_class/flight_app/teacher/students/add');
    }

});


Flight::route('GET /teacher/students/edit/@id', function($id){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM students WHERE id = ?');
    $stmt->execute([$id]);
    $student = $stmt->fetch();
    
    if (!$student) {
        Flight::redirect('/online_class/flight_app/teacher/students');
        return;
    }
    
    renderWithLayout('teacher/edit_student', [
        'title' => 'Edit Student',
        'student' => $student,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('POST /teacher/students/edit/@id', function($id){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $request = Flight::request();
    $name = $request->data->name;
    $grade = $request->data->grade;
    $mobile = $request->data->mobile;
    $district = $request->data->district;
    $status = $request->data->status;
    $teacher_note = $request->data->teacher_note;
    
    $db = getDB();
    $stmt = $db->prepare('UPDATE students SET name = ?, grade = ?, mobile = ?, district = ?, status = ?, teacher_note = ? WHERE id = ?');
    $stmt->execute([$name, $grade, $mobile, $district, $status, $teacher_note, $id]);
    
    setFlash('success', 'Updated', 'Student details updated.');
    Flight::redirect('/online_class/flight_app/teacher/students');
});


Flight::route('GET /teacher/classes', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $db = getDB();
    $stmt = $db->query('SELECT c.*, COUNT(ca.student_id) as assigned_count 
            FROM classes c 
            LEFT JOIN class_assignments ca ON c.id = ca.class_id 
            GROUP BY c.id 
            ORDER BY c.class_date DESC');
    $classes = $stmt->fetchAll();
    
    renderWithLayout('teacher/classes', [
        'title' => 'Classes',
        'classes' => $classes,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('GET /teacher/classes/add', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    renderWithLayout('teacher/add_class', [
        'title' => 'Create Class',
        'user' => $_SESSION['user']
    ]);
});

Flight::route('POST /teacher/classes/add', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $request = Flight::request();
    $topic = $request->data->topic;
    $class_date = $request->data->class_date;
    $zoom_link = $request->data->zoom_link;
    $teacher_note = $request->data->teacher_note;
    
    $db = getDB();
    try {
        $stmt = $db->prepare('INSERT INTO classes (topic, class_date, zoom_link, teacher_note) VALUES (?, ?, ?, ?)');
        $stmt->execute([$topic, $class_date, $zoom_link ?: null, $teacher_note]);
        
        setFlash('success', 'Class Created!', 'The class has been scheduled.');
        Flight::redirect('/online_class/flight_app/teacher/classes');
    } catch (PDOException $e) {
        setFlash('error', 'Error', 'Could not create class.');
        Flight::redirect('/online_class/flight_app/teacher/classes/add');
    }
});

Flight::route('GET /teacher/classes/bulk', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $db = getDB();
    $stmt = $db->query("SELECT * FROM students WHERE status = 'active'");
    $students = $stmt->fetchAll();
    
    renderWithLayout('teacher/bulk_class', [
        'title' => 'Bulk Create Classes',
        'students' => $students,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('POST /teacher/classes/bulk', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $request = Flight::request();
    $topics = $request->data->topics;
    $dates = $request->data->dates;
    $times = $request->data->times;
    $zoom_links = $request->data->zoom_links;
    $student_ids = $request->data->student_ids ?: [];
    
    $db = getDB();
    $count = count($topics);
    $created = 0;
    
    for ($i = 0; $i < $count; $i++) {
        if (!empty($topics[$i]) && !empty($dates[$i]) && !empty($times[$i])) {
            $classDate = $dates[$i] . ' ' . $times[$i];
            
            try {
                $stmt = $db->prepare('INSERT INTO classes (topic, class_date, zoom_link) VALUES (?, ?, ?)');
                $stmt->execute([
                    $topics[$i],
                    $classDate,
                    !empty($zoom_links[$i]) ? $zoom_links[$i] : null
                ]);
                $classId = $db->lastInsertId();
                
                // Assign to students
                if (!empty($student_ids)) {
                    foreach ($student_ids as $sid) {
                        $stmt = $db->prepare('INSERT OR IGNORE INTO class_assignments (class_id, student_id) VALUES (?, ?)');
                        $stmt->execute([$classId, $sid]);
                    }
                }
                $created++;
            } catch (PDOException $e) {
                // Ignore error and continue
            }
        }
    }
    
    setFlash('success', 'Bulk Action Complete', "$created classes created successfully.");
    Flight::redirect('/online_class/flight_app/teacher/classes');
});

Flight::route('GET /teacher/notes', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $db = getDB();
    $stmt = $db->query('SELECT n.*, COUNT(na.student_id) as assigned_count 
            FROM notes n 
            LEFT JOIN note_assignments na ON n.id = na.note_id 
            GROUP BY n.id 
            ORDER BY n.created_at DESC');
    $notes = $stmt->fetchAll();
    
    renderWithLayout('teacher/notes', [
        'title' => 'Notes',
        'notes' => $notes,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('GET /teacher/notes/add', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    renderWithLayout('teacher/add_note', [
        'title' => 'Add Note',
        'user' => $_SESSION['user']
    ]);
});

Flight::route('POST /teacher/notes/add', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $request = Flight::request();
    $title = $request->data->title;
    $details = $request->data->details;
    $link = $request->data->link;
    $teacher_note = $request->data->teacher_note;
    
    $db = getDB();
    try {
        $stmt = $db->prepare('INSERT INTO notes (title, details, link, teacher_note, created_at) VALUES (?, ?, ?, ?, datetime("now"))');
        $stmt->execute([$title, $details, $link, $teacher_note]);
        
        setFlash('success', 'Note Added', 'The note has been added successfully.');
        Flight::redirect('/online_class/flight_app/teacher/notes');
    } catch (PDOException $e) {
        setFlash('error', 'Error', 'Could not add note.');
        Flight::redirect('/online_class/flight_app/teacher/notes/add');
    }
});

Flight::route('GET /teacher/recordings', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $db = getDB();
    $stmt = $db->query('SELECT r.*, COUNT(ra.student_id) as assigned_count 
            FROM recordings r 
            LEFT JOIN recording_assignments ra ON r.id = ra.recording_id 
            GROUP BY r.id 
            ORDER BY r.created_at DESC');
    $recordings = $stmt->fetchAll();
    
    renderWithLayout('teacher/recordings', [
        'title' => 'Recordings',
        'recordings' => $recordings,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('GET /teacher/recordings/add', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    renderWithLayout('teacher/add_recording', [
        'title' => 'Add Recording',
        'user' => $_SESSION['user']
    ]);
});

Flight::route('POST /teacher/recordings/add', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $request = Flight::request();
    $topic = $request->data->topic;
    $link = $request->data->link;
    $description = $request->data->description;
    $teacher_note = $request->data->teacher_note;
    
    $db = getDB();
    try {
        $stmt = $db->prepare('INSERT INTO recordings (topic, link, description, teacher_note, created_at) VALUES (?, ?, ?, ?, datetime("now"))');
        $stmt->execute([$topic, $link, $description, $teacher_note]);
        
        setFlash('success', 'Recording Added', 'The recording has been added successfully.');
        Flight::redirect('/online_class/flight_app/teacher/recordings');
    } catch (PDOException $e) {
        setFlash('error', 'Error', 'Could not add recording.');
        Flight::redirect('/online_class/flight_app/teacher/recordings/add');
    }
});

Flight::route('GET /teacher/announcements', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $db = getDB();
    $stmt = $db->query("SELECT a.*, 
        (SELECT COUNT(*) FROM announcement_assignments WHERE announcement_id = a.id) as specific_students,
        (SELECT COUNT(*) FROM students WHERE status = 'active') as total_active_students
        FROM announcements a 
        ORDER BY a.created_at DESC");
    $announcements = $stmt->fetchAll();
    
    foreach ($announcements as &$a) {
        $a['all_students'] = ($a['specific_students'] >= $a['total_active_students'] && $a['total_active_students'] > 0) ? 1 : 0;
    }
    
    renderWithLayout('teacher/announcements', [
        'title' => 'Announcements',
        'announcements' => $announcements,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('GET /teacher/announcements/add', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $db = getDB();
    $stmt = $db->query("SELECT * FROM students WHERE status = 'active' ORDER BY grade, name");
    $students = $stmt->fetchAll();
    
    // Get unique grades and payment statuses for filters (simple extraction)
    $grades = [];
    foreach($students as $s) if($s['grade']) $grades[] = $s['grade'];
    $grades = array_unique($grades);
    
    $paymentStatuses = ['paid', 'unpaid'];
    
    renderWithLayout('teacher/add_announcement', [
        'title' => 'New Announcement',
        'students' => $students,
        'grades' => $grades,
        'paymentStatuses' => $paymentStatuses,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('POST /teacher/announcements/add', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $request = Flight::request();
    $title = $request->data->title;
    $message = $request->data->message;
    $expire_date = $request->data->expire_date;
    $target = $request->data->target;
    $student_ids = $request->data->student_ids ?: [];
    
    $db = getDB();
    
    try {
        $stmt = $db->prepare('INSERT INTO announcements (title, message, expire_date, created_at) VALUES (?, ?, ?, datetime("now"))');
        $stmt->execute([$title, $message, $expire_date ?: null]);
        $announcementId = $db->lastInsertId();
        
        if ($target == 'all') {
            // Get all active students
            $stmt = $db->query("SELECT id FROM students WHERE status = 'active'");
            $allIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $student_ids = $allIds;
        }
        
        if (!empty($student_ids)) {
            foreach ($student_ids as $sid) {
                $stmt = $db->prepare('INSERT OR IGNORE INTO announcement_assignments (announcement_id, student_id) VALUES (?, ?)');
                $stmt->execute([$announcementId, $sid]);
            }
        }
        
        setFlash('success', 'Announcement Posted', 'Notifications have been sent.');
        Flight::redirect('/online_class/flight_app/teacher/announcements');
    } catch (PDOException $e) {
        setFlash('error', 'Error', 'Could not post announcement.');
        Flight::redirect('/online_class/flight_app/teacher/announcements/add');
    }
});


Flight::route('GET /student/dashboard', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'student') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $studentId = $_SESSION['user']['id'];
    $db = getDB();
    
    // Get Student Details
    $stmt = $db->prepare('SELECT * FROM students WHERE id = ?');
    $stmt->execute([$studentId]);
    $student = $stmt->fetch();
    
    // Update session user with latest details in case they changed
    $_SESSION['user']['name'] = $student['name'];
    $_SESSION['user']['avatar'] = $student['avatar'];
    
    // Payment Status for current month
    $currentMonth = date('F');
    $currentYear = date('Y');
    $stmt = $db->prepare('SELECT status FROM payments WHERE student_id = ? AND month = ? AND year = ?');
    $stmt->execute([$studentId, $currentMonth, $currentYear]);
    $payment = $stmt->fetch();
    $paymentStatus = $payment ? $payment['status'] : 'unpaid';

    // Get Active Announcements for this student
    $stmt = $db->prepare('SELECT a.* FROM announcements a 
        JOIN announcement_assignments aa ON a.id = aa.announcement_id 
        WHERE aa.student_id = ? AND (a.expire_date IS NULL OR a.expire_date > datetime("now")) 
        ORDER BY a.created_at DESC LIMIT 5');
    $stmt->execute([$studentId]);
    $announcements = $stmt->fetchAll();
    
    // Next Class
    $stmt = $db->prepare('SELECT c.* FROM classes c 
        INNER JOIN class_assignments ca ON c.id = ca.class_id 
        WHERE ca.student_id = ? AND c.class_date > datetime("now") 
        ORDER BY c.class_date ASC LIMIT 1');
    $stmt->execute([$studentId]);
    $nextClass = $stmt->fetch();

    renderWithLayout('student/dashboard', [
        'title' => 'Student Dashboard',
        'student' => $student,
        'paymentStatus' => $paymentStatus,
        'announcements' => $announcements,
        'nextClass' => $nextClass,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('GET /student/classes', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'student') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $studentId = $_SESSION['user']['id'];
    $db = getDB();
    
    // Get assigned classes
    $stmt = $db->prepare('SELECT c.* FROM classes c 
        INNER JOIN class_assignments ca ON c.id = ca.class_id 
        WHERE ca.student_id = ? 
        ORDER BY c.class_date DESC');
    $stmt->execute([$studentId]);
    $classes = $stmt->fetchAll();
    
    renderWithLayout('student/classes', [
        'title' => 'My Classes',
        'classes' => $classes,
        'user' => $_SESSION['user']
    ]);
});


Flight::route('GET /student/notes', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'student') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $studentId = $_SESSION['user']['id'];
    $db = getDB();
    
    // Get assigned notes
    $stmt = $db->prepare('SELECT n.* FROM notes n 
        INNER JOIN note_assignments na ON n.id = na.note_id 
        WHERE na.student_id = ? 
        ORDER BY n.created_at DESC');
    $stmt->execute([$studentId]);
    $notes = $stmt->fetchAll();
    
    renderWithLayout('student/notes', [
        'title' => 'My Notes',
        'notes' => $notes,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('GET /student/recordings', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'student') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $studentId = $_SESSION['user']['id'];
    $db = getDB();
    
    // Get assigned recordings
    $stmt = $db->prepare('SELECT r.* FROM recordings r 
        INNER JOIN recording_assignments ra ON r.id = ra.recording_id 
        WHERE ra.student_id = ? 
        ORDER BY r.created_at DESC');
    $stmt->execute([$studentId]);
    $recordings = $stmt->fetchAll();
    
    renderWithLayout('student/recordings', [
        'title' => 'My Recordings',
        'recordings' => $recordings,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('GET /student/announcements', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'student') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $studentId = $_SESSION['user']['id'];
    $db = getDB();
    
    // Get active announcements
    $stmt = $db->prepare('SELECT a.* FROM announcements a 
        JOIN announcement_assignments aa ON a.id = aa.announcement_id 
        WHERE aa.student_id = ? AND (a.expire_date IS NULL OR a.expire_date > datetime("now")) 
        ORDER BY a.created_at DESC');
    $stmt->execute([$studentId]);
    $announcements = $stmt->fetchAll();
    
    renderWithLayout('student/announcements', [
        'title' => 'News & Announcements',
        'announcements' => $announcements,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('GET /student/profile', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'student') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $studentId = $_SESSION['user']['id'];
    $db = getDB();
    
    $stmt = $db->prepare('SELECT * FROM students WHERE id = ?');
    $stmt->execute([$studentId]);
    $student = $stmt->fetch();
    
    // Get Payment History
    $stmt = $db->prepare('SELECT * FROM payments WHERE student_id = ? ORDER BY year DESC, month DESC');
    $stmt->execute([$studentId]);
    $payments = $stmt->fetchAll();
    
    renderWithLayout('student/profile', [
        'title' => 'My Profile',
        'student' => $student,
        'payments' => $payments,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('POST /student/profile/update', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'student') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $request = Flight::request();
    $password = $request->data->password;
    $studentId = $_SESSION['user']['id'];
    
    if (!empty($password)) {
        $db = getDB();
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $db->prepare('UPDATE students SET password = ? WHERE id = ?');
        $stmt->execute([$hashed, $studentId]);
        
        setFlash('success', 'Profile Updated', 'Your password has been changed.');
    }
    
    Flight::redirect('/online_class/flight_app/student/profile');
});

Flight::route('GET /teacher/payments', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $db = getDB();
    
    // Get distinct months/years for filter
    $months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    $years = range(date('Y'), date('Y') - 2);
    
    $currentMonth = date('F');
    $currentYear = date('Y');
    
    // Get filter from query
    $request = Flight::request();
    $filterMonth = $request->query->month ?: $currentMonth;
    $filterYear = $request->query->year ?: $currentYear;
    
    // Get Students with payment status for selected month/year
    $stmt = $db->prepare("SELECT s.*, p.status as payment_status, p.amount, p.id as payment_id 
        FROM students s 
        LEFT JOIN payments p ON s.id = p.student_id AND p.month = ? AND p.year = ? 
        WHERE s.status = 'active' 
        ORDER BY s.grade, s.name");
    $stmt->execute([$filterMonth, $filterYear]);
    $students = $stmt->fetchAll();
    
    renderWithLayout('teacher/payments', [
        'title' => 'Payments',
        'students' => $students,
        'months' => $months,
        'years' => $years,
        'filterMonth' => $filterMonth,
        'filterYear' => $filterYear,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('POST /teacher/payments/update', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $request = Flight::request();
    $studentId = $request->data->student_id;
    $month = $request->data->month;
    $year = $request->data->year;
    $status = $request->data->status; // 'paid' or 'unpaid'
    $amount = $request->data->amount ?: 0;
    
    $db = getDB();
    
    // Check if exists
    $stmt = $db->prepare('SELECT id FROM payments WHERE student_id = ? AND month = ? AND year = ?');
    $stmt->execute([$studentId, $month, $year]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        // Update
        $stmt = $db->prepare('UPDATE payments SET status = ?, amount = ? WHERE id = ?');
        $stmt->execute([$status, $amount, $existing['id']]);
    } else {
        // Insert
        if ($status == 'paid') {
             $stmt = $db->prepare('INSERT INTO payments (student_id, month, year, amount, status, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))');
             $stmt->execute([$studentId, $month, $year, $amount, $status]);
        }
    }
    
    // Return JSON if AJAX
    if ($request->ajax) {
        Flight::json(['success' => true]);
    } else {
        Flight::redirect("/online_class/flight_app/teacher/payments?month=$month&year=$year");
    }
});


Flight::route('GET /teacher/classes/edit/@id', function($id){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM classes WHERE id = ?');
    $stmt->execute([$id]);
    $class = $stmt->fetch();
    
    if (!$class) {
        Flight::redirect('/online_class/flight_app/teacher/classes');
        return;
    }
    
    renderWithLayout('teacher/edit_class', [
        'title' => 'Edit Class',
        'class' => $class,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('POST /teacher/classes/edit/@id', function($id){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $request = Flight::request();
    $topic = $request->data->topic;
    $class_date = $request->data->class_date;
    $zoom_link = $request->data->zoom_link;
    $teacher_note = $request->data->teacher_note;
    
    $db = getDB();
    $stmt = $db->prepare('UPDATE classes SET topic = ?, class_date = ?, zoom_link = ?, teacher_note = ? WHERE id = ?');
    $stmt->execute([$topic, $class_date, $zoom_link, $teacher_note, $id]);
    
    setFlash('success', 'Updated', 'Class details updated.');
    Flight::redirect('/online_class/flight_app/teacher/classes');
});

Flight::route('GET /teacher/notes/edit/@id', function($id){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM notes WHERE id = ?');
    $stmt->execute([$id]);
    $note = $stmt->fetch();
    
    if (!$note) {
        Flight::redirect('/online_class/flight_app/teacher/notes');
        return;
    }
    
    renderWithLayout('teacher/edit_note', [
        'title' => 'Edit Note',
        'note' => $note,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('POST /teacher/notes/edit/@id', function($id){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $request = Flight::request();
    $title = $request->data->title;
    $details = $request->data->details;
    $link = $request->data->link;
    $teacher_note = $request->data->teacher_note;
    
    $db = getDB();
    $stmt = $db->prepare('UPDATE notes SET title = ?, details = ?, link = ?, teacher_note = ? WHERE id = ?');
    $stmt->execute([$title, $details, $link, $teacher_note, $id]);
    
    setFlash('success', 'Updated', 'Note details updated.');
    Flight::redirect('/online_class/flight_app/teacher/notes');
});

Flight::route('GET /teacher/recordings/edit/@id', function($id){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM recordings WHERE id = ?');
    $stmt->execute([$id]);
    $recording = $stmt->fetch();
    
    if (!$recording) {
        Flight::redirect('/online_class/flight_app/teacher/recordings');
        return;
    }
    
    renderWithLayout('teacher/edit_recording', [
        'title' => 'Edit Recording',
        'recording' => $recording,
        'user' => $_SESSION['user']
    ]);
});

Flight::route('POST /teacher/recordings/edit/@id', function($id){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $request = Flight::request();
    $topic = $request->data->topic;
    $link = $request->data->link;
    $description = $request->data->description;
    $teacher_note = $request->data->teacher_note;
    
    $db = getDB();
    $stmt = $db->prepare('UPDATE recordings SET topic = ?, link = ?, description = ?, teacher_note = ? WHERE id = ?');
    $stmt->execute([$topic, $link, $description, $teacher_note, $id]);
    
    setFlash('success', 'Updated', 'Recording details updated.');
    Flight::redirect('/online_class/flight_app/teacher/recordings');
});

// Assign Routes for Students
Flight::route('GET /teacher/students/assign-class/@id', function($studentId){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') { Flight::redirect('/online_class/flight_app/'); return; }
    
    $db = getDB();
    $stmt = $db->query('SELECT * FROM classes ORDER BY class_date DESC');
    $classes = $stmt->fetchAll();
    
    renderWithLayout('teacher/assign_class', ['title' => 'Assign Class', 'studentId' => $studentId, 'classes' => $classes, 'user' => $_SESSION['user']]);
});

Flight::route('POST /teacher/students/assign-class/@id', function($studentId){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') { Flight::redirect('/online_class/flight_app/'); return; }
    
    $request = Flight::request();
    $classIds = $request->data->class_ids ?: [];
    
    if (!empty($classIds)) {
        $db = getDB();
        foreach ($classIds as $classId) {
            $stmt = $db->prepare('INSERT OR IGNORE INTO class_assignments (class_id, student_id) VALUES (?, ?)');
            $stmt->execute([$classId, $studentId]);
        }
        setFlash('success', 'Assigned', 'Classes assigned successfully.');
    }
    Flight::redirect('/online_class/flight_app/teacher/students');
});

Flight::route('GET /teacher/students/assign-note/@id', function($studentId){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') { Flight::redirect('/online_class/flight_app/'); return; }
    
    $db = getDB();
    $stmt = $db->query('SELECT * FROM notes ORDER BY created_at DESC');
    $notes = $stmt->fetchAll();
    
    renderWithLayout('teacher/assign_note', ['title' => 'Assign Note', 'studentId' => $studentId, 'notes' => $notes, 'user' => $_SESSION['user']]);
});

Flight::route('POST /teacher/students/assign-note/@id', function($studentId){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') { Flight::redirect('/online_class/flight_app/'); return; }
    
    $request = Flight::request();
    $noteIds = $request->data->note_ids ?: [];
    
    if (!empty($noteIds)) {
        $db = getDB();
        foreach ($noteIds as $noteId) {
            $stmt = $db->prepare('INSERT OR IGNORE INTO note_assignments (note_id, student_id) VALUES (?, ?)');
            $stmt->execute([$noteId, $studentId]);
        }
        setFlash('success', 'Assigned', 'Notes assigned successfully.');
    }
    Flight::redirect('/online_class/flight_app/teacher/students');
});



Flight::route('GET /teacher/settings', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    // Refresh user data from DB to get latest avatar
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user']['id']]);
    $user = $stmt->fetch();
    
    // Update session just in case
    $_SESSION['user'] = $user;
    $_SESSION['user']['type'] = 'teacher'; // fast-fix to keep type
    
    renderWithLayout('teacher/settings', [
        'title' => 'Settings',
        'user' => $_SESSION['user']
    ]);
});

Flight::route('POST /teacher/settings/update', function(){
    if (!isset($_SESSION['user']) || $_SESSION['user']['type'] != 'teacher') {
        Flight::redirect('/online_class/flight_app/');
        return;
    }
    
    $request = Flight::request();
    $avatar = $request->data->avatar;
    $password = $request->data->password;
    
    $db = getDB();
    
    if (!empty($password)) {
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $db->prepare('UPDATE users SET avatar = ?, password = ? WHERE id = ?');
        $stmt->execute([$avatar, $hashed, $_SESSION['user']['id']]);
    } else {
        $stmt = $db->prepare('UPDATE users SET avatar = ? WHERE id = ?');
        $stmt->execute([$avatar, $_SESSION['user']['id']]);
    }
    
    setFlash('success', 'Saved', 'Profile updated successfully.');
    Flight::redirect('/online_class/flight_app/teacher/settings');
});


// Start Flight
Flight::start();
