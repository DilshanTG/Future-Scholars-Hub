<?php
// flight_app/views/student/announcements.php
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
            <a class="navbar-brand fw-bold text-primary fs-4" href="/online_class/flight_app/student/dashboard">
                <span class="me-2"><?= $user['avatar'] ?></span>Future Scholars
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto gap-2">
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/student/dashboard">Dashboard</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/student/classes">Classes 📚</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/student/notes">Notes 📝</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/student/recordings">Recordings 🎥</a></li>
                    <li class="nav-item"><a class="nav-link active" href="/online_class/flight_app/student/announcements">News 📢</a></li>
                    <li class="nav-item"><a class="nav-link text-danger" href="/online_class/flight_app/logout">Logout 🚪</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container pb-5">
        <h2 class="fw-bold mb-4">News & Announcements 📢</h2>

        <div class="row">
            <div class="col-lg-8">
                <?php foreach ($announcements as $announcement): ?>
                    <div class="card shadow-sm border-0 mb-3">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title fw-bold mb-0 text-primary"><?= $announcement['title'] ?></h5>
                                <?php if ($announcement['expire_date']): ?>
                                    <span class="badge bg-light text-danger border">Exp: <?= date('M d', strtotime($announcement['expire_date'])) ?></span>
                                <?php endif; ?>
                            </div>
                            <h6 class="card-subtitle mb-3 text-muted small">
                                📅 <?= date('M d, Y h:i A', strtotime($announcement['created_at'])) ?>
                            </h6>
                            <p class="card-text"><?= nl2br(htmlspecialchars($announcement['message'])) ?></p>
                        </div>
                    </div>
                <?php endforeach; ?>
                <?php if (empty($announcements)): ?>
                    <div class="alert alert-info text-center py-5">
                        <div class="fs-1 mb-3">📭</div>
                        <h4>No new announcements</h4>
                        <p>You're all caught up!</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>
