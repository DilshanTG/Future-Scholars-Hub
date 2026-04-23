<?php
// flight_app/views/teacher/announcements.php
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
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/classes">Classes 📚</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/recordings">Recordings 🎥</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/notes">Notes 📝</a></li>
                    <li class="nav-item"><a class="nav-link active" href="/online_class/flight_app/teacher/announcements">News 📢</a></li>
                    <li class="nav-item"><a class="nav-link text-danger" href="/online_class/flight_app/logout">Logout 🚪</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container pb-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold">Announcements 📢</h2>
            <div class="d-none d-md-block">
                <a href="/online_class/flight_app/teacher/announcements/add" class="btn btn-primary">Create Announcement</a>
            </div>
        </div>

        <div class="row desktop-table">
            <?php foreach ($announcements as $announcement): ?>
                <div class="col-md-6 mb-4">
                    <div class="card h-100 shadow-sm border-0">
                        <div class="card-body">
                            <h5 class="card-title fw-bold"><?= $announcement['title'] ?></h5>
                            <p class="card-text"><?= $announcement['message'] ?></p>

                            <div class="mt-3 pt-3 border-top">
                                <div class="d-flex justify-content-between text-muted small mb-2">
                                    <span>
                                        <?php if ($announcement['all_students']): ?>
                                            👥 All Students
                                        <?php else: ?>
                                            👥 <?= $announcement['specific_students'] ?> Student(s)
                                        <?php endif; ?>
                                    </span>
                                    <span>📅 <?= date('M d, Y', strtotime($announcement['created_at'])) ?></span>
                                </div>
                                <?php if ($announcement['expire_date']): ?>
                                    <div class="text-danger small">⏰ Expires: <?= date('M d, Y H:i', strtotime($announcement['expire_date'])) ?>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
            <?php if (empty($announcements)): ?>
                <div class="col-12">
                    <div class="alert alert-info text-center py-4">
                        <h4>No active announcements 📭</h4>
                        <p>Create one to keep your students updated!</p>
                    </div>
                </div>
            <?php endif; ?>
        </div>

        <!-- Mobile Card List -->
        <div class="mobile-card-list mobile-list">
            <?php foreach ($announcements as $announcement): ?>
                <div class="list-card">
                    <div class="list-card-title"><?= $announcement['title'] ?></div>
                    <div class="list-card-subtitle mb-2"><?= $announcement['message'] ?></div>

                    <div class="d-flex justify-content-between align-items-center mt-2 text-muted small">
                        <span>
                            <?php if ($announcement['all_students']): ?>
                                👥 All
                            <?php else: ?>
                                👥 <?= $announcement['specific_students'] ?>
                            <?php endif; ?>
                        </span>
                        <?php if ($announcement['expire_date']): ?>
                            <span class="text-danger">Exp: <?= date('M d', strtotime($announcement['expire_date'])) ?></span>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Floating Action Button (Mobile) -->
        <a href="/online_class/flight_app/teacher/announcements/add" class="fab-btn d-md-none">
            +
        </a>
    </div>
</div>
