<?php
require_once 'vendor/autoload.php';

$f3 = Base::instance();

// Load configuration
$f3->config('app/config/config.ini');

// Create directories if they don't exist
if (!is_dir('tmp')) {
    mkdir('tmp', 0755, true);
}
if (!is_dir('db')) {
    mkdir('db', 0755, true);
}

// Database setup
$f3->set('DB', new DB\SQL(
    'sqlite:db/online_class.db'
));

// Initialize database tables
require_once 'app/models/Database.php';
App\Models\Database::init($f3);

// Routes
$f3->route('GET /', 'App\Controllers\LoginController->index');
$f3->route('POST /login', 'App\Controllers\LoginController->login');
$f3->route('GET /logout', 'App\Controllers\LoginController->logout');

// Teacher routes
$f3->route('GET /teacher/dashboard', 'App\Controllers\TeacherController->dashboard');
$f3->route('GET /teacher/students', 'App\Controllers\TeacherController->students');
$f3->route('GET /teacher/students/add', 'App\Controllers\TeacherController->addStudent');
$f3->route('POST /teacher/students/add', 'App\Controllers\TeacherController->saveStudent');
$f3->route('GET /teacher/students/edit/@id', 'App\Controllers\TeacherController->editStudent');
$f3->route('POST /teacher/students/edit/@id', 'App\Controllers\TeacherController->updateStudent');
$f3->route('GET /teacher/students/assign-note/@id', 'App\Controllers\TeacherController->assignNoteToStudent');
$f3->route('POST /teacher/students/assign-note/@id', 'App\Controllers\TeacherController->saveAssignNoteToStudent');
$f3->route('GET /teacher/students/assign-class/@id', 'App\Controllers\TeacherController->assignClassToStudent');
$f3->route('POST /teacher/students/assign-class/@id', 'App\Controllers\TeacherController->saveAssignClassToStudent');
$f3->route('GET /teacher/students/view/@id', 'App\Controllers\TeacherController->viewStudent');
$f3->route('POST /teacher/students/view/@id/class', 'App\Controllers\TeacherController->saveClassForStudent');
$f3->route('POST /teacher/students/view/@id/note', 'App\Controllers\TeacherController->saveNoteForStudent');
$f3->route('POST /teacher/students/view/@id/recording', 'App\Controllers\TeacherController->saveRecordingForStudent');
$f3->route('GET /teacher/classes', 'App\Controllers\TeacherController->classes');
$f3->route('GET /teacher/classes/add', 'App\Controllers\TeacherController->addClass');
$f3->route('POST /teacher/classes/add', 'App\Controllers\TeacherController->saveClass');
$f3->route('GET /teacher/classes/bulk', 'App\Controllers\TeacherController->bulkClass');
$f3->route('POST /teacher/classes/bulk', 'App\Controllers\TeacherController->saveBulkClass');
$f3->route('GET /teacher/classes/edit/@id', 'App\Controllers\TeacherController->editClass');
$f3->route('POST /teacher/classes/edit/@id', 'App\Controllers\TeacherController->updateClass');
$f3->route('GET /teacher/classes/assign/@id', 'App\Controllers\TeacherController->assignClass');
$f3->route('POST /teacher/classes/assign/@id', 'App\Controllers\TeacherController->saveAssignClass');
$f3->route('GET /teacher/payments', 'App\Controllers\TeacherController->payments');
$f3->route('GET /teacher/payments/check', 'App\Controllers\TeacherController->checkPayment');
$f3->route('POST /teacher/payments/update', 'App\Controllers\TeacherController->updatePayment');
$f3->route('GET /teacher/notes', 'App\Controllers\TeacherController->notes');
$f3->route('GET /teacher/notes/add', 'App\Controllers\TeacherController->addNote');
$f3->route('POST /teacher/notes/add', 'App\Controllers\TeacherController->saveNote');
$f3->route('GET /teacher/notes/assign/@id', 'App\Controllers\TeacherController->assignNoteToStudents');
$f3->route('POST /teacher/notes/assign/@id', 'App\Controllers\TeacherController->saveNoteAssignments');
$f3->route('GET /teacher/notes/edit/@id', 'App\Controllers\TeacherController->editNote');
$f3->route('POST /teacher/notes/edit/@id', 'App\Controllers\TeacherController->updateNote');
$f3->route('GET /teacher/history', 'App\Controllers\TeacherController->history');
$f3->route('GET /teacher/recordings', 'App\Controllers\TeacherController->recordings');
$f3->route('GET /teacher/recordings/add', 'App\Controllers\TeacherController->addRecording');
$f3->route('POST /teacher/recordings/add', 'App\Controllers\TeacherController->saveRecording');
$f3->route('GET /teacher/recordings/edit/@id', 'App\Controllers\TeacherController->editRecording');
$f3->route('POST /teacher/recordings/edit/@id', 'App\Controllers\TeacherController->updateRecording');
$f3->route('GET /teacher/recordings/assign/@id', 'App\Controllers\TeacherController->assignRecording');
$f3->route('POST /teacher/recordings/assign/@id', 'App\Controllers\TeacherController->saveAssignRecording');
$f3->route('GET /teacher/announcements', 'App\Controllers\TeacherController->announcements');
$f3->route('GET /teacher/announcements/add', 'App\Controllers\TeacherController->addAnnouncement');
$f3->route('POST /teacher/announcements/add', 'App\Controllers\TeacherController->saveAnnouncement');
$f3->route('GET /teacher/announcements/history', 'App\Controllers\TeacherController->announcementsHistory');
$f3->route('GET /teacher/settings', 'App\Controllers\TeacherController->settings');
$f3->route('POST /teacher/settings/update', 'App\Controllers\TeacherController->updateSettings');

// Student routes
$f3->route('GET /student/dashboard', 'App\Controllers\StudentController->dashboard');
$f3->route('GET /student/payment', 'App\Controllers\StudentController->payment');
$f3->route('GET /student/notes', 'App\Controllers\StudentController->notes');
$f3->route('GET /student/classes', 'App\Controllers\StudentController->classes');
$f3->route('GET /student/recordings', 'App\Controllers\StudentController->recordings');
$f3->route('GET /student/announcements', 'App\Controllers\StudentController->announcements');
$f3->route('GET /student/profile', 'App\Controllers\StudentController->profile');
$f3->route('POST /student/profile', 'App\Controllers\StudentController->updateProfile');

$f3->run();

