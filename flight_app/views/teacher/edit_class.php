<?php
// flight_app/views/teacher/edit_class.php
?>
<div class="container-fluid px-0">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg dashboard-header shadow-sm bg-white mb-4 rounded-bottom-4">
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
                     <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/payments">Payments 💳</a></li>
                    <li class="nav-item"><a class="nav-link text-danger" href="/online_class/flight_app/logout">Logout 🚪</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container pb-5">
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <div class="card shadow-sm border-0 rounded-4">
                    <div class="card-body p-4 p-md-5">
                        <div class="d-flex align-items-center mb-4 gap-3">
                            <span class="fs-1">✏️</span>
                            <h3 class="fw-bold mb-0">Edit Class</h3>
                        </div>

                        <form method="POST" action="/online_class/flight_app/teacher/classes/edit/<?= $class['id'] ?>">
                            <div class="row g-3">
                                <div class="col-12">
                                    <label class="form-label fw-bold small">Topic</label>
                                    <input type="text" name="topic" class="form-control" value="<?= $class['topic'] ?>" required>
                                </div>
                                <div class="col-12">
                                    <label class="form-label fw-bold small">Date & Time</label>
                                    <input type="datetime-local" name="class_date" class="form-control" value="<?= date('Y-m-d\TH:i', strtotime($class['class_date'])) ?>" required>
                                </div>
                                <div class="col-12">
                                    <label class="form-label fw-bold small">Zoom/Google Meet Link</label>
                                    <input type="url" name="zoom_link" class="form-control" value="<?= $class['zoom_link'] ?>" placeholder="https://...">
                                </div>
                                <div class="col-12">
                                    <label class="form-label fw-bold small">Teacher's Note (Private)</label>
                                    <textarea name="teacher_note" class="form-control" rows="3"><?= $class['teacher_note'] ?></textarea>
                                </div>
                                <div class="col-12 mt-4">
                                    <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">Update Class</button>
                                    <a href="/online_class/flight_app/teacher/classes" class="btn btn-light w-100 py-2 fw-bold mt-2 text-muted">Cancel</a>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
