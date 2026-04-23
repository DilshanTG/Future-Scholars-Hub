<?php
// flight_app/views/teacher/add_student.php
$old = isset($old) ? $old : [];
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
                    <li class="nav-item"><a class="nav-link active" href="/online_class/flight_app/teacher/students">Students 👶</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/classes">Classes 📚</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/recordings">Recordings 🎥</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/notes">Notes 📝</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/announcements">News 📢</a></li>
                    <li class="nav-item"><a class="nav-link text-danger" href="/online_class/flight_app/logout">Logout 🚪</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container pb-5">
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <div class="d-flex align-items-center mb-4">
                    <a href="/online_class/flight_app/teacher/students" class="btn btn-light rounded-circle me-3 shadow-sm"
                        style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                        ←
                    </a>
                    <h2 class="fw-bold mb-0">Add New Student 👶</h2>
                </div>

                <div class="card shadow-sm">
                    <div class="card-body p-4">
                        <form method="POST" action="/online_class/flight_app/teacher/students/add">
                            <div class="mb-3">
                                <label class="form-label fw-bold">Mobile Number (Login ID) *</label>
                                <input type="tel" name="mobile" class="form-control form-control-lg"
                                    placeholder="e.g., 0712345678" value="<?= isset($old['mobile']) ? $old['mobile'] : '' ?>" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold">Full Name *</label>
                                <input type="text" name="name" class="form-control form-control-lg"
                                    placeholder="Student's Name" value="<?= isset($old['name']) ? $old['name'] : '' ?>" required>
                            </div>
                            <div class="row">
                                <div class="col-6 mb-3">
                                    <label class="form-label fw-bold">Grade *</label>
                                    <input type="text" name="grade" class="form-control form-control-lg"
                                        placeholder="e.g., 5" value="<?= isset($old['grade']) ? $old['grade'] : '' ?>" required>
                                </div>
                                <div class="col-6 mb-3">
                                    <label class="form-label fw-bold">Gender *</label>
                                    <select name="gender" class="form-select form-select-lg" required>
                                        <option value="Male" <?= (isset($old['gender']) && $old['gender'] == 'Male') ? 'selected' : '' ?>>Male 👦</option>
                                        <option value="Female" <?= (isset($old['gender']) && $old['gender'] == 'Female') ? 'selected' : '' ?>>Female 👧</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold">District *</label>
                                <input type="text" name="district" class="form-control form-control-lg"
                                    placeholder="City/District" value="<?= isset($old['district']) ? $old['district'] : '' ?>" required>
                            </div>
                            <div class="mb-4">
                                <label class="form-label fw-bold">Private Notes (Optional)</label>
                                <textarea name="description" class="form-control" rows="3"
                                    placeholder="Only visible to you..."><?= isset($old['description']) ? $old['description'] : '' ?></textarea>
                            </div>

                            <div class="mb-4">
                                <label class="form-label fw-bold">🔒 Internal Note (Teacher Only)</label>
                                <textarea name="teacher_note" class="form-control" rows="3"
                                    style="background-color: #FFF9E6; border-color: #FFD700;"
                                    placeholder="Private teacher notes - never visible to students..."><?= isset($old['teacher_note']) ? $old['teacher_note'] : '' ?></textarea>
                                <small class="text-muted">This note is only visible to you and other
                                    teachers.</small>
                            </div>

                            <div class="alert alert-info d-flex align-items-center">
                                <span class="fs-4 me-2">ℹ️</span>
                                <div>
                                    <strong>Default Password:</strong> student123<br>
                                    <small>The student can change this after logging in.</small>
                                </div>
                            </div>

                            <div class="d-grid gap-2 mt-4">
                                <button type="submit" class="btn btn-primary btn-lg">Add Student</button>
                                <a href="/online_class/flight_app/teacher/students" class="btn btn-light btn-lg">Cancel</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
