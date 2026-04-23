<?php
// flight_app/views/teacher/bulk_class.php
?>
<style>
    .dashboard-header {
        background: white;
        padding: 1rem 2rem;
        border-radius: 0 0 24px 24px;
        box-shadow: var(--shadow-sm);
        margin-bottom: 2rem;
    }

    .nav-link {
        color: var(--text-color);
        font-weight: 600;
        padding: 0.5rem 1rem;
        border-radius: 12px;
        transition: all 0.3s ease;
    }

    .nav-link:hover,
    .nav-link.active {
        background-color: var(--primary-color);
        color: white;
    }
</style>

<div class="container-fluid px-0">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg dashboard-header">
        <div class="container">
            <a class="navbar-brand fw-bold text-primary fs-4" href="/online_class/flight_app/teacher/dashboard">🎓 Future Scholars</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto gap-2">
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/dashboard">Dashboard</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/students">Students 👶</a></li>
                    <li class="nav-item"><a class="nav-link active" href="/online_class/flight_app/teacher/classes">Classes 📚</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/recordings">Recordings 🎥</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/notes">Notes 📝</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/announcements">News 📢</a></li>
                    <li class="nav-item"><a class="nav-link text-danger" href="/online_class/flight_app/logout">Logout 🚪</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container pb-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold">Bulk Create Classes 📦</h2>
            <a href="/online_class/flight_app/teacher/classes" class="btn btn-secondary">← Back to List</a>
        </div>
        
        <div class="card shadow-sm">
            <div class="card-body p-4">
                <form method="POST" action="/online_class/flight_app/teacher/classes/bulk" id="bulkForm">
                    <div class="mb-4">
                        <label class="form-label fw-bold">Assign to Students (Optional)</label>
                        <div class="border rounded p-3 bg-light" style="max-height: 200px; overflow-y: auto;">
                            <?php foreach ($students as $student): ?>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="student_ids[]" value="<?= $student['id'] ?>" id="student<?= $student['id'] ?>">
                                <label class="form-check-label" for="student<?= $student['id'] ?>">
                                    <?= $student['name'] ?> (<?= $student['mobile'] ?>)
                                </label>
                            </div>
                            <?php endforeach; ?>
                        </div>
                        <small class="text-muted">Selected students will be assigned to ALL classes created below.</small>
                    </div>
                    
                    <div id="classesContainer">
                        <div class="class-entry border rounded p-3 mb-3 bg-light position-relative">
                            <h5 class="fw-bold text-primary mb-3">Class 1</h5>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Topic *</label>
                                    <input type="text" name="topics[]" class="form-control" placeholder="e.g. Math - Algebra" required>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Date *</label>
                                    <input type="date" name="dates[]" class="form-control" required>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Time *</label>
                                    <input type="time" name="times[]" class="form-control" required>
                                </div>
                            </div>
                            <div class="mb-2">
                                <label class="form-label">Zoom Link (Optional)</label>
                                <input type="url" name="zoom_links[]" class="form-control" placeholder="https://zoom.us/...">
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-center my-4">
                        <button type="button" class="btn btn-outline-primary rounded-pill px-4" onclick="addClassEntry()">
                            + Add Another Class
                        </button>
                    </div>
                    
                    <hr>
                    
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-primary btn-lg">Create All Classes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
    let classCount = 1;
    function addClassEntry() {
        classCount++;
        const container = document.getElementById('classesContainer');
        const newEntry = document.createElement('div');
        newEntry.className = 'class-entry border rounded p-3 mb-3 bg-light position-relative animate-fade-in';
        newEntry.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-primary mb-0">Class ${classCount}</h5>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.closest('.class-entry').remove()">Remove</button>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Topic *</label>
                    <input type="text" name="topics[]" class="form-control" required>
                </div>
                <div class="col-md-3 mb-3">
                    <label class="form-label">Date *</label>
                    <input type="date" name="dates[]" class="form-control" required>
                </div>
                <div class="col-md-3 mb-3">
                    <label class="form-label">Time *</label>
                    <input type="time" name="times[]" class="form-control" required>
                </div>
            </div>
            <div class="mb-2">
                <label class="form-label">Zoom Link (Optional)</label>
                <input type="url" name="zoom_links[]" class="form-control">
            </div>
        `;
        container.appendChild(newEntry);
    }
</script>
