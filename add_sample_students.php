<?php
require_once 'vendor/autoload.php';

$f3 = Base::instance();
$f3->config('app/config/config.ini');

// Database setup
$f3->set('DB', new DB\SQL('sqlite:db/online_class.db'));
$db = $f3->get('DB');

// Sample students data
$sampleStudents = [
    [
        'mobile' => '0771234567',
        'name' => 'Saman Perera',
        'grade' => '10',
        'gender' => 'Male',
        'district' => 'Colombo',
        'description' => 'Excellent student, very dedicated',
        'status' => 'active'
    ],
    [
        'mobile' => '0772345678',
        'name' => 'Kamani Silva',
        'grade' => '11',
        'gender' => 'Female',
        'district' => 'Gampaha',
        'description' => 'Good performance in mathematics',
        'status' => 'active'
    ],
    [
        'mobile' => '0773456789',
        'name' => 'Nimal Fernando',
        'grade' => '12',
        'gender' => 'Male',
        'district' => 'Kandy',
        'description' => 'Needs improvement in English',
        'status' => 'active'
    ],
    [
        'mobile' => '0774567890',
        'name' => 'Priya Wijesinghe',
        'grade' => '10',
        'gender' => 'Female',
        'district' => 'Matara',
        'description' => 'Active participant in class discussions',
        'status' => 'active'
    ],
    [
        'mobile' => '0775678901',
        'name' => 'Dinesh Jayasuriya',
        'grade' => '11',
        'gender' => 'Male',
        'district' => 'Kurunegala',
        'description' => 'Regular attendance, punctual',
        'status' => 'active'
    ],
    [
        'mobile' => '0776789012',
        'name' => 'Chamari Rathnayake',
        'grade' => '12',
        'gender' => 'Female',
        'district' => 'Anuradhapura',
        'description' => 'Top performer in science subjects',
        'status' => 'active'
    ],
    [
        'mobile' => '0777890123',
        'name' => 'Tharindu Bandara',
        'grade' => '10',
        'gender' => 'Male',
        'district' => 'Ratnapura',
        'description' => 'Shows great potential',
        'status' => 'active'
    ],
    [
        'mobile' => '0778901234',
        'name' => 'Nadeesha Perera',
        'grade' => '11',
        'gender' => 'Female',
        'district' => 'Galle',
        'description' => 'Consistent performer',
        'status' => 'active'
    ],
    [
        'mobile' => '0779012345',
        'name' => 'Kasun Mendis',
        'grade' => '12',
        'gender' => 'Male',
        'district' => 'Badulla',
        'description' => 'Needs more practice in problem solving',
        'status' => 'active'
    ],
    [
        'mobile' => '0770123456',
        'name' => 'Sanduni Karunaratne',
        'grade' => '10',
        'gender' => 'Female',
        'district' => 'Kalutara',
        'description' => 'Very creative and innovative',
        'status' => 'active'
    ],
    [
        'mobile' => '0771122334',
        'name' => 'Ravindu De Silva',
        'grade' => '11',
        'gender' => 'Male',
        'district' => 'Negombo',
        'description' => 'Good team player',
        'status' => 'active'
    ],
    [
        'mobile' => '0772233445',
        'name' => 'Ishara Gunathilaka',
        'grade' => '12',
        'gender' => 'Female',
        'district' => 'Jaffna',
        'description' => 'Excellent communication skills',
        'status' => 'active'
    ],
    [
        'mobile' => '0773344556',
        'name' => 'Pasindu Wickramasinghe',
        'grade' => '10',
        'gender' => 'Male',
        'district' => 'Trincomalee',
        'description' => 'Hardworking student',
        'status' => 'active'
    ],
    [
        'mobile' => '0774455667',
        'name' => 'Tharushi Dissanayake',
        'grade' => '11',
        'gender' => 'Female',
        'district' => 'Polonnaruwa',
        'description' => 'Quick learner',
        'status' => 'active'
    ],
    [
        'mobile' => '0775566778',
        'name' => 'Dilshan Gunasekara',
        'grade' => '12',
        'gender' => 'Male',
        'district' => 'Kandy',
        'description' => 'Good student',
        'status' => 'active'
    ]
];

$defaultPassword = 'student123';
$addedCount = 0;
$skippedCount = 0;

echo "Adding sample students...\n\n";

foreach ($sampleStudents as $student) {
    // Check if student with this mobile already exists
    $existing = $db->exec('SELECT * FROM students WHERE mobile = ?', [$student['mobile']]);
    
    if (empty($existing)) {
        try {
            $db->exec('INSERT INTO students (mobile, name, grade, gender, district, password, description, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
                    $student['mobile'],
                    $student['name'],
                    $student['grade'],
                    $student['gender'],
                    $student['district'],
                    password_hash($defaultPassword, PASSWORD_DEFAULT),
                    $student['description'],
                    $student['status']
                ]);
            echo "✓ Added: {$student['name']} ({$student['mobile']})\n";
            $addedCount++;
        } catch (Exception $e) {
            echo "✗ Error adding {$student['name']}: " . $e->getMessage() . "\n";
        }
    } else {
        echo "- Skipped: {$student['name']} ({$student['mobile']}) - already exists\n";
        $skippedCount++;
    }
}

echo "\n";
echo "Summary:\n";
echo "Added: $addedCount students\n";
echo "Skipped: $skippedCount students (already exist)\n";
echo "\nDone!\n";

