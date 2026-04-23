<?php
namespace App\Controllers;

use Base;

class TeacherController {
    private function checkAuth($f3) {
        if (!$f3->get('SESSION.user') || $f3->get('SESSION.user')['type'] != 'teacher') {
            $f3->reroute('/');
        }
    }

    private function getRandomAvatar($gender) {
        $boys = ['🦁', '🐯', '🦅', '🐺', '🦖', '🐉', '🦈', '🐊', '🦏', '🐘', '🦌', '🐗', '🦍', '🐆', '🦔', '🐢', '🦎', '🐙', '🦂', '🦞'];
        $girls = ['🌸', '🌺', '🌻', '🌷', '🌹', '🏵️', '💐', '🦋', '🐞', '🐝', '🦢', '🦩', '🦚', '🐰', '🦊', '🐨', '🐼', '🦄', '🌼', '🪷'];
        
        if (strtolower($gender) == 'male') {
            return $boys[array_rand($boys)];
        } else {
            return $girls[array_rand($girls)];
        }
    }
    
    public function dashboard($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        
        // Get stats
        $totalStudents = $db->exec('SELECT COUNT(*) as count FROM students')[0]['count'];
        $activeStudents = $db->exec('SELECT COUNT(*) as count FROM students WHERE status = ?', ['active'])[0]['count'];
        $totalClasses = $db->exec('SELECT COUNT(*) as count FROM classes')[0]['count'];
        
        $f3->set('totalStudents', $totalStudents);
        $f3->set('activeStudents', $activeStudents);
        $f3->set('totalClasses', $totalClasses);
        
        echo \Template::instance()->render('teacher/dashboard.html');
    }
    
    public function students($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        
        $students = $db->exec('SELECT * FROM students ORDER BY created_at DESC');
        
        // Get payment status and next class for each student
        foreach ($students as &$student) {
            $currentMonth = date('F');
            $currentYear = date('Y');
            $payment = $db->exec('SELECT * FROM payments WHERE student_id = ? AND month = ? AND year = ?', 
                [$student['id'], $currentMonth, $currentYear]);
            $student['payment_status'] = !empty($payment) ? $payment[0]['status'] : 'unpaid';
            
            // Get next class
            $nextClass = $db->exec('SELECT c.* FROM classes c 
                INNER JOIN class_assignments ca ON c.id = ca.class_id 
                WHERE ca.student_id = ? AND c.class_date > datetime("now") 
                ORDER BY c.class_date ASC LIMIT 1', [$student['id']]);
            $student['next_class'] = !empty($nextClass) ? $nextClass[0] : null;
        }
        
        $f3->set('students', $students);
        echo \Template::instance()->render('teacher/students.html');
    }
    
    public function addStudent($f3) {
        $this->checkAuth($f3);
        echo \Template::instance()->render('teacher/add_student.html');
    }
    
    public function saveStudent($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        
        $defaultPassword = 'student123';
        $gender = $f3->get('POST.gender');
        $avatar = $this->getRandomAvatar($gender);

        $db->exec('INSERT INTO students (mobile, name, grade, gender, district, password, description, status, avatar, teacher_note) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            $f3->get('POST.mobile'),
            $f3->get('POST.name'),
            $f3->get('POST.grade'),
            $gender,
            $f3->get('POST.district'),
            password_hash($defaultPassword, PASSWORD_DEFAULT),
            $f3->get('POST.description'),
            'active',
            $avatar,
            $f3->get('POST.teacher_note')
        ]);
        
        $f3->reroute('/teacher/students');
    }
    
    public function editStudent($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $student = $db->exec('SELECT * FROM students WHERE id = ?', [$f3->get('PARAMS.id')])[0];
        
        // Get current month payment status
        $currentMonth = date('F');
        $currentYear = (int)date('Y');
        $payment = $db->exec('SELECT * FROM payments WHERE student_id = ? AND month = ? AND year = ?', 
            [$student['id'], $currentMonth, $currentYear]);
        $student['current_payment'] = !empty($payment) ? $payment[0] : null;
        
        // Generate years array (current year to current year + 10)
        $years = range($currentYear, $currentYear + 10);
        
        $f3->set('student', $student);
        $f3->set('currentMonth', $currentMonth);
        $f3->set('currentYear', $currentYear);
        $f3->set('years', $years);
        echo \Template::instance()->render('teacher/edit_student.html');
    }
    
    public function updateStudent($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('PARAMS.id');
        
        // Update student information
        $db->exec('UPDATE students SET mobile = ?, name = ?, grade = ?, gender = ?, district = ?, description = ?, status = ?, teacher_note = ? 
            WHERE id = ?', [
            $f3->get('POST.mobile'),
            $f3->get('POST.name'),
            $f3->get('POST.grade'),
            $f3->get('POST.gender'),
            $f3->get('POST.district'),
            $f3->get('POST.description'),
            $f3->get('POST.status'),
            $f3->get('POST.teacher_note'),
            $studentId
        ]);
        
        // Update payment status if provided
        $paymentMonth = $f3->get('POST.payment_month');
        $paymentYear = $f3->get('POST.payment_year');
        $paymentStatus = $f3->get('POST.payment_status');
        
        if ($paymentMonth && $paymentYear && $paymentStatus) {
            $paymentYear = (int)$paymentYear;
            $db->exec('INSERT OR REPLACE INTO payments (student_id, month, year, status, updated_at) 
                VALUES (?, ?, ?, ?, datetime("now"))', [$studentId, $paymentMonth, $paymentYear, $paymentStatus]);
        }
        
        $f3->reroute('/teacher/students');
    }
    
    public function assignNoteToStudent($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('PARAMS.id');
        
        $student = $db->exec('SELECT * FROM students WHERE id = ?', [$studentId])[0];
        $notes = $db->exec('SELECT n.*, 
            CASE WHEN na.student_id IS NOT NULL THEN 1 ELSE 0 END as is_assigned
            FROM notes n
            LEFT JOIN note_assignments na ON n.id = na.note_id AND na.student_id = ?
            ORDER BY n.created_at DESC', [$studentId]);
        
        $f3->set('student', $student);
        $f3->set('notes', $notes);
        echo \Template::instance()->render('teacher/assign_note_to_student.html');
    }
    
    public function saveAssignNoteToStudent($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('PARAMS.id');
        $noteIds = $f3->get('POST.note_ids') ?: [];
        
        // Remove all existing assignments for this student
        $db->exec('DELETE FROM note_assignments WHERE student_id = ?', [$studentId]);
        
        // Add new assignments
        foreach ($noteIds as $noteId) {
            $db->exec('INSERT INTO note_assignments (note_id, student_id) VALUES (?, ?)', 
                [$noteId, $studentId]);
        }
        
        $f3->reroute('/teacher/students');
    }
    
    public function assignClassToStudent($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('PARAMS.id');
        
        $student = $db->exec('SELECT * FROM students WHERE id = ?', [$studentId])[0];
        $classes = $db->exec('SELECT c.*, 
            CASE WHEN ca.student_id IS NOT NULL THEN 1 ELSE 0 END as is_assigned
            FROM classes c
            LEFT JOIN class_assignments ca ON c.id = ca.class_id AND ca.student_id = ?
            ORDER BY c.class_date DESC', [$studentId]);
        
        $f3->set('student', $student);
        $f3->set('classes', $classes);
        echo \Template::instance()->render('teacher/assign_class_to_student.html');
    }
    
    public function saveAssignClassToStudent($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('PARAMS.id');
        $classIds = $f3->get('POST.class_ids') ?: [];
        
        // Remove all existing assignments for this student
        $db->exec('DELETE FROM class_assignments WHERE student_id = ?', [$studentId]);
        
        // Add new assignments
        foreach ($classIds as $classId) {
            $db->exec('INSERT INTO class_assignments (class_id, student_id) VALUES (?, ?)', 
                [$classId, $studentId]);
        }
        
        $f3->reroute('/teacher/students');
    }
    
    public function viewStudent($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('PARAMS.id');
        
        $student = $db->exec('SELECT * FROM students WHERE id = ?', [$studentId])[0];
        
        // Get payment status for current month
        $currentMonth = date('F');
        $currentYear = (int)date('Y');
        $payment = $db->exec('SELECT * FROM payments WHERE student_id = ? AND month = ? AND year = ?', 
            [$studentId, $currentMonth, $currentYear]);
        $student['payment_status'] = !empty($payment) ? $payment[0]['status'] : 'unpaid';
        $student['current_month'] = $currentMonth;
        $student['current_year'] = $currentYear;
        
        // Get assigned classes
        $classes = $db->exec('SELECT c.* FROM classes c 
            INNER JOIN class_assignments ca ON c.id = ca.class_id 
            WHERE ca.student_id = ? 
            ORDER BY c.class_date DESC', [$studentId]);
        
        // Get assigned notes
        $notes = $db->exec('SELECT n.* FROM notes n 
            INNER JOIN note_assignments na ON n.id = na.note_id 
            WHERE na.student_id = ? 
            ORDER BY n.created_at DESC', [$studentId]);
        
        // Get assigned recordings
        $recordings = $db->exec('SELECT r.* FROM recordings r 
            INNER JOIN recording_assignments ra ON r.id = ra.recording_id 
            WHERE ra.student_id = ? 
            ORDER BY r.created_at DESC', [$studentId]);
        
        $f3->set('student', $student);
        $f3->set('classes', $classes);
        $f3->set('notes', $notes);
        $f3->set('recordings', $recordings);
        echo \Template::instance()->render('teacher/view_student.html');
    }
    
    public function saveClassForStudent($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('PARAMS.id');
        
        // Create class
        $db->exec('INSERT INTO classes (topic, class_date, zoom_link) VALUES (?, ?, ?)', [
            $f3->get('POST.topic'),
            $f3->get('POST.class_date'),
            $f3->get('POST.zoom_link') ?: null
        ]);
        
        $classId = $db->lastInsertId();
        
        // Auto-assign to student
        $db->exec('INSERT OR IGNORE INTO class_assignments (class_id, student_id) VALUES (?, ?)', 
            [$classId, $studentId]);
        
        $f3->reroute('/teacher/students/view/' . $studentId);
    }
    
    public function saveNoteForStudent($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('PARAMS.id');
        
        // Create note
        $db->exec('INSERT INTO notes (title, link, details) VALUES (?, ?, ?)', [
            $f3->get('POST.title'),
            $f3->get('POST.link') ?: null,
            $f3->get('POST.details') ?: null
        ]);
        
        $noteId = $db->lastInsertId();
        
        // Auto-assign to student
        $db->exec('INSERT OR IGNORE INTO note_assignments (note_id, student_id) VALUES (?, ?)', 
            [$noteId, $studentId]);
        
        $f3->reroute('/teacher/students/view/' . $studentId);
    }
    
    public function saveRecordingForStudent($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $studentId = $f3->get('PARAMS.id');
        
        // Create recording
        $db->exec('INSERT INTO recordings (topic, link, description) VALUES (?, ?, ?)', [
            $f3->get('POST.topic'),
            $f3->get('POST.link'),
            $f3->get('POST.description') ?: null
        ]);
        
        $recordingId = $db->lastInsertId();
        
        // Auto-assign to student
        $db->exec('INSERT OR IGNORE INTO recording_assignments (recording_id, student_id) VALUES (?, ?)', 
            [$recordingId, $studentId]);
        
        $f3->reroute('/teacher/students/view/' . $studentId);
    }
    
    public function classes($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $classes = $db->exec('SELECT c.*, COUNT(ca.student_id) as assigned_count 
            FROM classes c 
            LEFT JOIN class_assignments ca ON c.id = ca.class_id 
            GROUP BY c.id 
            ORDER BY c.class_date DESC');
        $f3->set('classes', $classes);
        echo \Template::instance()->render('teacher/classes.html');
    }
    
    public function addClass($f3) {
        $this->checkAuth($f3);
        echo \Template::instance()->render('teacher/add_class.html');
    }
    
    public function saveClass($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        
        $db->exec('INSERT INTO classes (topic, class_date, zoom_link, teacher_note) VALUES (?, ?, ?, ?)', [
            $f3->get('POST.topic'),
            $f3->get('POST.class_date'),
            $f3->get('POST.zoom_link') ?: null,
            $f3->get('POST.teacher_note')
        ]);
        
        $f3->reroute('/teacher/classes');
    }
    
    public function editClass($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $class = $db->exec('SELECT * FROM classes WHERE id = ?', [$f3->get('PARAMS.id')])[0];
        
        // Format datetime for input field (YYYY-MM-DDTHH:mm)
        $classDate = new \DateTime($class['class_date']);
        $class['formatted_date'] = $classDate->format('Y-m-d\TH:i');
        
        $f3->set('class', $class);
        echo \Template::instance()->render('teacher/edit_class.html');
    }
    
    public function updateClass($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        
        $db->exec('UPDATE classes SET topic = ?, class_date = ?, zoom_link = ?, teacher_note = ? WHERE id = ?', [
            $f3->get('POST.topic'),
            $f3->get('POST.class_date'),
            $f3->get('POST.zoom_link') ?: null,
            $f3->get('POST.teacher_note'),
            $f3->get('PARAMS.id')
        ]);
        
        $f3->reroute('/teacher/classes');
    }
    
    public function bulkClass($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $students = $db->exec('SELECT * FROM students WHERE status = ?', ['active']);
        $f3->set('students', $students);
        echo \Template::instance()->render('teacher/bulk_class.html');
    }
    
    public function saveBulkClass($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        
        $topics = $f3->get('POST.topics');
        $dates = $f3->get('POST.dates');
        $times = $f3->get('POST.times');
        $zoomLinks = $f3->get('POST.zoom_links');
        $studentIds = $f3->get('POST.student_ids') ?: [];
        
        $count = count($topics);
        for ($i = 0; $i < $count; $i++) {
            if (!empty($topics[$i]) && !empty($dates[$i]) && !empty($times[$i])) {
                $classDate = $dates[$i] . ' ' . $times[$i];
                $db->exec('INSERT INTO classes (topic, class_date, zoom_link) VALUES (?, ?, ?)', [
                    $topics[$i],
                    $classDate,
                    !empty($zoomLinks[$i]) ? $zoomLinks[$i] : null
                ]);
                
                $classId = $db->lastInsertId();
                
                // Assign to selected students
                if (!empty($studentIds)) {
                    foreach ($studentIds as $studentId) {
                        $db->exec('INSERT OR IGNORE INTO class_assignments (class_id, student_id) VALUES (?, ?)', 
                            [$classId, $studentId]);
                    }
                }
            }
        }
        $f3->reroute('/teacher/classes');
    }
    
    public function assignClass($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $class = $db->exec('SELECT * FROM classes WHERE id = ?', [$f3->get('PARAMS.id')])[0];
        $students = $db->exec('SELECT * FROM students ORDER BY name');
        $assigned = $db->exec('SELECT student_id FROM class_assignments WHERE class_id = ?', 
            [$f3->get('PARAMS.id')]);
        $assignedIds = array_column($assigned, 'student_id');
        
        // Add assigned flag and payment status to each student
        foreach ($students as &$student) {
            $student['is_assigned'] = in_array($student['id'], $assignedIds);
            
            // Get latest payment status for current month
            $currentMonth = date('F');
            $currentYear = date('Y');
            $payment = $db->exec('SELECT status FROM payments WHERE student_id = ? AND month = ? AND year = ? LIMIT 1', 
                [$student['id'], $currentMonth, $currentYear]);
            
            $student['payment_status'] = !empty($payment) ? $payment[0]['status'] : 'unpaid';
        }
        
        // Get unique grades for filter
        $uniqueGrades = $db->exec('SELECT DISTINCT grade FROM students ORDER BY grade');
        $grades = array_column($uniqueGrades, 'grade');
        
        // Get unique payment statuses
        $paymentStatuses = ['paid', 'unpaid'];
        
        $f3->set('class', $class);
        $f3->set('students', $students);
        $f3->set('grades', $grades);
        $f3->set('paymentStatuses', $paymentStatuses);
        echo \Template::instance()->render('teacher/assign_class.html');
    }
    
    public function saveAssignClass($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $classId = $f3->get('PARAMS.id');
        $studentIds = $f3->get('POST.student_ids') ?: [];
        
        // Remove all assignments
        $db->exec('DELETE FROM class_assignments WHERE class_id = ?', [$classId]);
        
        // Add new assignments
        foreach ($studentIds as $studentId) {
            $db->exec('INSERT INTO class_assignments (class_id, student_id) VALUES (?, ?)', 
                [$classId, $studentId]);
        }
        
        $f3->reroute('/teacher/classes');
    }
    
    public function payments($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $students = $db->exec('SELECT * FROM students ORDER BY name');
        
        // Get payment status for each student for current month
        $currentMonth = date('F');
        $currentYear = (int)date('Y'); // Ensure year is integer
        foreach ($students as &$student) {
            $payment = $db->exec('SELECT * FROM payments WHERE student_id = ? AND month = ? AND year = ?', 
                [$student['id'], $currentMonth, $currentYear]);
            $student['current_payment'] = !empty($payment) ? $payment[0] : null;
        }
        
        // Generate years array (current year to current year + 10)
        $currentYearInt = (int)$currentYear;
        $years = range($currentYearInt, $currentYearInt + 10);
        
        $f3->set('students', $students);
        $f3->set('currentMonth', $currentMonth);
        $f3->set('currentYear', $currentYear);
        $f3->set('years', $years);
        echo \Template::instance()->render('teacher/payments.html');
    }
    
    public function checkPayment($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        
        $studentId = $f3->get('GET.student_id');
        $month = $f3->get('GET.month');
        $year = $f3->get('GET.year');
        
        // Convert year to integer for proper comparison
        $year = (int)$year;
        
        $payment = $db->exec('SELECT * FROM payments WHERE student_id = ? AND month = ? AND year = ?', 
            [$studentId, $month, $year]);
        
        $status = !empty($payment) ? $payment[0]['status'] : 'unpaid';
        
        header('Content-Type: application/json');
        echo json_encode(['status' => $status]);
        exit;
    }
    
    public function updatePayment($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        
        $studentId = $f3->get('POST.student_id');
        $month = $f3->get('POST.month');
        $year = $f3->get('POST.year');
        $status = $f3->get('POST.status');
        $studentStatus = $f3->get('POST.student_status');
        
        // Validate inputs
        if (!$studentId || !$month || !$year || !$status) {
            $f3->reroute('/teacher/payments');
            return;
        }
        
        // Ensure year is integer
        $year = (int)$year;
        
        // Update payment status
        $db->exec('INSERT OR REPLACE INTO payments (student_id, month, year, status, updated_at) 
            VALUES (?, ?, ?, ?, datetime("now"))', [$studentId, $month, $year, $status]);
        
        // Update student status (active/inactive)
        if ($studentStatus) {
            $db->exec('UPDATE students SET status = ? WHERE id = ?', [$studentStatus, $studentId]);
        }
        
        $f3->reroute('/teacher/payments');
    }
    
    public function notes($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $notes = $db->exec('SELECT n.*, COUNT(na.student_id) as assigned_count 
            FROM notes n 
            LEFT JOIN note_assignments na ON n.id = na.note_id 
            GROUP BY n.id 
            ORDER BY n.created_at DESC');
        $f3->set('notes', $notes);
        echo \Template::instance()->render('teacher/notes.html');
    }
    
    public function addNote($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $students = $db->exec('SELECT * FROM students ORDER BY name');
        
        // Add payment status to each student
        foreach ($students as &$student) {
            $currentMonth = date('F');
            $currentYear = date('Y');
            $payment = $db->exec('SELECT status FROM payments WHERE student_id = ? AND month = ? AND year = ? LIMIT 1', 
                [$student['id'], $currentMonth, $currentYear]);
            $student['payment_status'] = !empty($payment) ? $payment[0]['status'] : 'unpaid';
        }
        
        // Get unique grades for filter
        $uniqueGrades = $db->exec('SELECT DISTINCT grade FROM students ORDER BY grade');
        $grades = array_column($uniqueGrades, 'grade');
        
        // Get unique payment statuses
        $paymentStatuses = ['paid', 'unpaid'];
        
        $f3->set('students', $students);
        $f3->set('grades', $grades);
        $f3->set('paymentStatuses', $paymentStatuses);
        echo \Template::instance()->render('teacher/add_note.html');
    }
    
    public function saveNote($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        
        $db->exec('INSERT INTO notes (title, link, details) VALUES (?, ?, ?)', [
            $f3->get('POST.title'),
            $f3->get('POST.link'),
            $f3->get('POST.details')
        ]);
        
        $noteId = $db->lastInsertId();
        $studentIds = $f3->get('POST.student_ids') ?: [];
        
        foreach ($studentIds as $studentId) {
            $db->exec('INSERT INTO note_assignments (note_id, student_id) VALUES (?, ?)', 
                [$noteId, $studentId]);
        }
        
        $f3->reroute('/teacher/notes');
    }
    
    public function editNote($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $noteId = $f3->get('PARAMS.id');
        
        $note = $db->exec('SELECT * FROM notes WHERE id = ?', [$noteId]);
        if (empty($note)) {
            $f3->reroute('/teacher/notes');
            return;
        }
        
        $note = $note[0];
        
        // Get assigned students
        $assigned = $db->exec('SELECT student_id FROM note_assignments WHERE note_id = ?', [$noteId]);
        $assignedIds = array_column($assigned, 'student_id');
        
        // Get all active students
        $students = $db->exec('SELECT * FROM students WHERE status = ?', ['active']);
        
        // Add assigned flag to each student
        foreach ($students as &$student) {
            $student['is_assigned'] = in_array($student['id'], $assignedIds);
        }
        
        $f3->set('note', $note);
        $f3->set('students', $students);
        echo \Template::instance()->render('teacher/edit_note.html');
    }
    
    public function updateNote($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $noteId = $f3->get('PARAMS.id');
        
        // Update note
        $db->exec('UPDATE notes SET title = ?, link = ?, details = ? WHERE id = ?', [
            $f3->get('POST.title'),
            $f3->get('POST.link'),
            $f3->get('POST.details'),
            $noteId
        ]);
        
        // Delete existing student assignments
        $db->exec('DELETE FROM note_assignments WHERE note_id = ?', [$noteId]);
        
        // Add new student assignments
        $studentIds = $f3->get('POST.student_ids');
        if ($studentIds) {
            foreach ($studentIds as $studentId) {
                $db->exec('INSERT INTO note_assignments (note_id, student_id) VALUES (?, ?)', [$noteId, $studentId]);
            }
        }
        
        $f3->reroute('/teacher/notes');
    }
    
    public function assignNoteToStudents($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $noteId = $f3->get('PARAMS.id');
        
        // Get note details
        $note = $db->exec('SELECT * FROM notes WHERE id = ?', [$noteId]);
        if (empty($note)) {
            $f3->reroute('/teacher/notes');
            return;
        }
        
        // Get all students with payment status
        $students = $db->exec('SELECT * FROM students ORDER BY name');
        
        // Add payment status to each student
        foreach ($students as &$student) {
            $currentMonth = date('F');
            $currentYear = date('Y');
            $payment = $db->exec('SELECT status FROM payments WHERE student_id = ? AND month = ? AND year = ? LIMIT 1', 
                [$student['id'], $currentMonth, $currentYear]);
            $student['payment_status'] = !empty($payment) ? $payment[0]['status'] : 'unpaid';
        }
        
        // Get assigned students
        $assigned = $db->exec('SELECT student_id FROM note_assignments WHERE note_id = ?', [$noteId]);
        $assignedIds = array_column($assigned, 'student_id');
        
        // Mark assigned students
        foreach ($students as &$student) {
            $student['is_assigned'] = in_array($student['id'], $assignedIds);
        }
        
        // Get unique grades for filter
        $uniqueGrades = $db->exec('SELECT DISTINCT grade FROM students ORDER BY grade');
        $grades = array_column($uniqueGrades, 'grade');
        
        // Get unique payment statuses
        $paymentStatuses = ['paid', 'unpaid'];
        
        $f3->set('note', $note[0]);
        $f3->set('students', $students);
        $f3->set('grades', $grades);
        $f3->set('paymentStatuses', $paymentStatuses);
        echo \Template::instance()->render('teacher/assign_note.html');
    }
    
    public function saveNoteAssignments($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $noteId = $f3->get('PARAMS.id');
        
        // Delete existing assignments
        $db->exec('DELETE FROM note_assignments WHERE note_id = ?', [$noteId]);
        
        // Add new assignments
        $studentIds = $f3->get('POST.student_ids');
        if ($studentIds) {
            foreach ($studentIds as $studentId) {
                $db->exec('INSERT INTO note_assignments (note_id, student_id) VALUES (?, ?)', [$noteId, $studentId]);
            }
        }
        
        $f3->reroute('/teacher/notes');
    }
    
    
    public function history($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $classes = $db->exec('SELECT c.*, COUNT(ca.student_id) as assigned_count 
            FROM classes c 
            LEFT JOIN class_assignments ca ON c.id = ca.class_id 
            GROUP BY c.id 
            ORDER BY c.class_date DESC');
        $f3->set('classes', $classes);
        echo \Template::instance()->render('teacher/history.html');
    }
    
    public function recordings($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $recordings = $db->exec('SELECT r.*, COUNT(ra.student_id) as assigned_count 
            FROM recordings r 
            LEFT JOIN recording_assignments ra ON r.id = ra.recording_id 
            GROUP BY r.id 
            ORDER BY r.created_at DESC');
        $f3->set('recordings', $recordings);
        echo \Template::instance()->render('teacher/recordings.html');
    }
    
    public function addRecording($f3) {
        $this->checkAuth($f3);
        echo \Template::instance()->render('teacher/add_recording.html');
    }
    
    public function saveRecording($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        
        $db->exec('INSERT INTO recordings (topic, link, description) VALUES (?, ?, ?)', [
            $f3->get('POST.topic'),
            $f3->get('POST.link'),
            $f3->get('POST.description') ?: null
        ]);
        
        $f3->reroute('/teacher/recordings');
    }
    
    public function editRecording($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $recording = $db->exec('SELECT * FROM recordings WHERE id = ?', [$f3->get('PARAMS.id')])[0];
        
        $f3->set('recording', $recording);
        echo \Template::instance()->render('teacher/edit_recording.html');
    }
    
    public function updateRecording($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        
        $db->exec('UPDATE recordings SET topic = ?, link = ?, description = ? WHERE id = ?', [
            $f3->get('POST.topic'),
            $f3->get('POST.link'),
            $f3->get('POST.description') ?: null,
            $f3->get('PARAMS.id')
        ]);
        
        $f3->reroute('/teacher/recordings');
    }
    
    public function assignRecording($f3) {
    $this->checkAuth($f3);
    $db = $f3->get('DB');
    $recording = $db->exec('SELECT * FROM recordings WHERE id = ?', [$f3->get('PARAMS.id')])[0];
    $students = $db->exec('SELECT * FROM students ORDER BY name');
    $assigned = $db->exec('SELECT student_id FROM recording_assignments WHERE recording_id = ?', 
        [$f3->get('PARAMS.id')]);
    $assignedIds = array_column($assigned, 'student_id');
    
    // Add assigned flag and payment status to each student
    foreach ($students as &$student) {
        $student['is_assigned'] = in_array($student['id'], $assignedIds);
        
        // Get latest payment status for current month
        $currentMonth = date('F');
        $currentYear = date('Y');
        $payment = $db->exec('SELECT status FROM payments WHERE student_id = ? AND month = ? AND year = ? LIMIT 1', 
            [$student['id'], $currentMonth, $currentYear]);
        $student['payment_status'] = !empty($payment) ? $payment[0]['status'] : 'unpaid';
    }
    
    // Get unique grades for filter
    $uniqueGrades = $db->exec('SELECT DISTINCT grade FROM students ORDER BY grade');
    $grades = array_column($uniqueGrades, 'grade');
    
    // Get unique payment statuses
    $paymentStatuses = ['paid', 'unpaid'];
    
    $f3->set('recording', $recording);
    $f3->set('students', $students);
    $f3->set('grades', $grades);
    $f3->set('paymentStatuses', $paymentStatuses);
    echo \Template::instance()->render('teacher/assign_recording.html');
}    
    public function saveAssignRecording($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $recordingId = $f3->get('PARAMS.id');
        $studentIds = $f3->get('POST.student_ids') ?: [];
        
        // Remove all assignments
        $db->exec('DELETE FROM recording_assignments WHERE recording_id = ?', [$recordingId]);
        
        // Add new assignments
        foreach ($studentIds as $studentId) {
            $db->exec('INSERT INTO recording_assignments (recording_id, student_id) VALUES (?, ?)', 
                [$recordingId, $studentId]);
        }
        
        $f3->reroute('/teacher/recordings');
    }
    
    public function announcements($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        
        // Get active announcements (not expired)
        $announcements = $db->exec('SELECT a.*, 
            COUNT(CASE WHEN aa.student_id IS NULL THEN 1 END) as all_students,
            COUNT(CASE WHEN aa.student_id IS NOT NULL THEN 1 END) as specific_students
            FROM announcements a
            LEFT JOIN announcement_assignments aa ON a.id = aa.announcement_id
            WHERE a.expire_date IS NULL OR a.expire_date > datetime("now")
            GROUP BY a.id
            ORDER BY a.created_at DESC');
        
        $f3->set('announcements', $announcements);
        echo \Template::instance()->render('teacher/announcements.html');
    }
    
    public function addAnnouncement($f3) {
    $this->checkAuth($f3);
    $db = $f3->get('DB');
    $students = $db->exec('SELECT * FROM students ORDER BY name');
    
    // Add payment status to each student
    foreach ($students as &$student) {
        $currentMonth = date('F');
        $currentYear = date('Y');
        $payment = $db->exec('SELECT status FROM payments WHERE student_id = ? AND month = ? AND year = ? LIMIT 1', 
            [$student['id'], $currentMonth, $currentYear]);
        $student['payment_status'] = !empty($payment) ? $payment[0]['status'] : 'unpaid';
    }
    
    // Get unique grades for filter
    $uniqueGrades = $db->exec('SELECT DISTINCT grade FROM students ORDER BY grade');
    $grades = array_column($uniqueGrades, 'grade');
    
    // Get unique payment statuses
    $paymentStatuses = ['paid', 'unpaid'];
    
    $f3->set('students', $students);
    $f3->set('grades', $grades);
    $f3->set('paymentStatuses', $paymentStatuses);
    echo \Template::instance()->render('teacher/add_announcement.html');
}
    
    public function saveAnnouncement($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        
        $title = $f3->get('POST.title');
        $message = $f3->get('POST.message');
        $expireDate = $f3->get('POST.expire_date') ?: null;
        $sendTo = $f3->get('POST.send_to'); // 'all' or 'selected'
        $studentIds = $f3->get('POST.student_ids') ?: [];
        
        // Create announcement
        $db->exec('INSERT INTO announcements (title, message, expire_date) VALUES (?, ?, ?)', [
            $title,
            $message,
            $expireDate
        ]);
        
        $announcementId = $db->lastInsertId();
        
        // Assign to students
        if ($sendTo == 'all') {
            // NULL student_id means all students
            $db->exec('INSERT INTO announcement_assignments (announcement_id, student_id) VALUES (?, ?)', 
                [$announcementId, null]);
        } else {
            // Assign to selected students
            foreach ($studentIds as $studentId) {
                $db->exec('INSERT INTO announcement_assignments (announcement_id, student_id) VALUES (?, ?)', 
                    [$announcementId, $studentId]);
            }
        }
        
        $f3->reroute('/teacher/announcements');
    }
    
    public function announcementsHistory($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        
        // Get all announcements (including expired)
        $announcements = $db->exec('SELECT a.*, 
            COUNT(CASE WHEN aa.student_id IS NULL THEN 1 END) as all_students,
            COUNT(CASE WHEN aa.student_id IS NOT NULL THEN 1 END) as specific_students
            FROM announcements a
            LEFT JOIN announcement_assignments aa ON a.id = aa.announcement_id
            GROUP BY a.id
            ORDER BY a.created_at DESC');
        
        $f3->set('announcements', $announcements);
        echo \Template::instance()->render('teacher/announcements_history.html');
    }
    public function settings($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $userId = $f3->get('SESSION.user')['id'];
        $user = $db->exec('SELECT * FROM users WHERE id = ?', [$userId])[0];
        
        // Default avatar if not set
        if (empty($user['avatar'])) {
            $user['avatar'] = '👨‍🏫';
        }
        
        $f3->set('user', $user);
        echo \Template::instance()->render('teacher/settings.html');
    }

    public function updateSettings($f3) {
        $this->checkAuth($f3);
        $db = $f3->get('DB');
        $userId = $f3->get('SESSION.user')['id'];
        
        $avatar = $f3->get('POST.avatar');
        $password = $f3->get('POST.password');
        
        if (!empty($password)) {
            $db->exec('UPDATE users SET password = ?, avatar = ? WHERE id = ?', [
                password_hash($password, PASSWORD_DEFAULT),
                $avatar,
                $userId
            ]);
        } else {
            $db->exec('UPDATE users SET avatar = ? WHERE id = ?', [
                $avatar,
                $userId
            ]);
        }
        
        // Update session avatar
        $user = $f3->get('SESSION.user');
        $user['avatar'] = $avatar;
        $f3->set('SESSION.user', $user);
        
        $f3->reroute('/teacher/settings');
    }
}

