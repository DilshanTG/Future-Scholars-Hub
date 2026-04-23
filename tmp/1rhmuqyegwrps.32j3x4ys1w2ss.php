<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bulk Create Classes - Future Scholars Hub</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
            <a class="navbar-brand" href="/teacher/dashboard">🎓 Future Scholars Hub</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="/teacher/dashboard">Dashboard</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/students">Students</a></li>
                    <li class="nav-item"><a class="nav-link active" href="/teacher/classes">Classes</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/recordings">Recordings</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/payments">Payments</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/notes">Notes</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/announcements">Announcements</a></li>                    <li class="nav-item"><a class="nav-link" href="/teacher/history">History</a></li>
                    <li class="nav-item"><a class="nav-link" href="/logout">Logout</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <h2 class="mb-4">Bulk Create Classes</h2>
        
        <div class="card">
            <div class="card-body">
                <form method="POST" action="/teacher/classes/bulk" id="bulkForm">
                    <div class="mb-3">
                        <label class="form-label">Assign to Students (Optional - can assign later)</label>
                        <div class="border p-2" style="max-height: 200px; overflow-y: auto;">
                            <?php foreach (($students?:[]) as $student): ?>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="student_ids[]" value="<?= ($student['id']) ?>" id="student<?= ($student['id']) ?>">
                                <label class="form-check-label" for="student<?= ($student['id']) ?>"><?= ($student['name']) ?> (<?= ($student['mobile']) ?>)</label>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    
                    <div id="classesContainer">
                        <div class="class-entry border p-3 mb-3">
                            <h5>Class 1</h5>
                            <div class="mb-3">
                                <label class="form-label">Topic *</label>
                                <input type="text" name="topics[]" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Date *</label>
                                <input type="date" name="dates[]" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Time *</label>
                                <input type="time" name="times[]" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Zoom Link (Optional)</label>
                                <input type="url" name="zoom_links[]" class="form-control">
                            </div>
                        </div>
                    </div>
                    
                    <button type="button" class="btn btn-secondary mb-3" onclick="addClassEntry()">Add Another Class</button>
                    <br>
                    <button type="submit" class="btn btn-primary">Create All Classes</button>
                    <a href="/teacher/classes" class="btn btn-secondary">Cancel</a>
                </form>
            </div>
        </div>
    </div>

    <footer class="bg-dark text-white text-center py-3 mt-5">
        <div class="container">
            <p class="mb-0">© 2024 Future Scholars Hub. All rights reserved.</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        let classCount = 1;
        function addClassEntry() {
            classCount++;
            const container = document.getElementById('classesContainer');
            const newEntry = document.createElement('div');
            newEntry.className = 'class-entry border p-3 mb-3';
            newEntry.innerHTML = `
                <h5>Class ${classCount}</h5>
                <div class="mb-3">
                    <label class="form-label">Topic *</label>
                    <input type="text" name="topics[]" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Date *</label>
                    <input type="date" name="dates[]" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Time *</label>
                    <input type="time" name="times[]" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Zoom Link (Optional)</label>
                    <input type="url" name="zoom_links[]" class="form-control">
                </div>
                <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">Remove</button>
            `;
            container.appendChild(newEntry);
        }
    </script>
</body>
</html>

