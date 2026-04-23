# Future Scholars Hub 🎓

A simple student management system built with Fat-Free Framework (F3) and Bootstrap.

## Features

### Teacher Features
- Student management (add, edit, view)
- Class creation (single and bulk)
- Assign classes to students
- Payment status management
- Notes creation and assignment
- Class history

### Student Features
- View payment status
- View next available class with Zoom link
- Access assigned notes
- View class history
- Change password

## Installation

1. Upload all files to your cPanel public_html directory (or subdirectory)

2. Ensure the following directories are writable:
   - `db/` (for SQLite database)
   - `tmp/` (for Fat-Free Framework cache)

3. Access the application through your web browser

4. Default login credentials:
   - **Teacher**: username: `admin`, password: `admin123`

## Database

The system uses SQLite database which will be automatically created in the `db/` directory on first run.

## Requirements

- PHP 7.4 or higher
- SQLite extension enabled
- Apache with mod_rewrite enabled (for .htaccess)

## File Structure

```
online_class/
├── app/
│   ├── config/
│   │   └── config.ini
│   ├── controllers/
│   │   ├── LoginController.php
│   │   ├── TeacherController.php
│   │   └── StudentController.php
│   ├── models/
│   │   └── Database.php
│   └── views/
│       ├── login.html
│       ├── teacher/
│       └── student/
├── db/
│   └── online_class.db (auto-created)
├── lib/
│   └── (Fat-Free Framework files)
├── tmp/
│   └── (cache files)
├── .htaccess
├── index.php
└── README.md
```

## Usage

### Adding Students
1. Login as teacher
2. Go to Students → Add New Student
3. Fill in required fields (Mobile number is the login ID)
4. Default password for students: `student123`

### Creating Classes
1. Go to Classes → Create Class
2. Enter topic, date/time, and optional Zoom link
3. Assign students to the class

### Bulk Class Creation
1. Go to Classes → Bulk Create
2. Add multiple classes at once
3. Optionally assign students to all classes

### Managing Payments
1. Go to Payments
2. Select student, month, year, and status
3. Click Update

### Adding Notes
1. Go to Notes → Add New Note
2. Enter title, link (optional), and details
3. Select students to assign the note to

## Security Notes

- Change the default teacher password after first login
- Ensure proper file permissions on server
- Keep the `db/` directory secure

## Support

For issues or questions, contact your system administrator.

