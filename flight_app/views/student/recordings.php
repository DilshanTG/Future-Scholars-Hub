<?php
// flight_app/views/student/recordings.php
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
                    <li class="nav-item"><a class="nav-link active" href="/online_class/flight_app/student/recordings">Recordings 🎥</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/student/announcements">News 📢</a></li>
                    <li class="nav-item"><a class="nav-link text-danger" href="/online_class/flight_app/logout">Logout 🚪</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container pb-5">
        <h2 class="fw-bold mb-4">My Recordings 🎥</h2>

        <div class="row g-4">
            <?php foreach ($recordings as $recording): ?>
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm border-0">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="fw-bold mb-0"><?= $recording['topic'] ?></h5>
                            </div>
                            <small class="text-muted d-block mb-3">📅 <?= date('M d, Y', strtotime($recording['created_at'])) ?></small>
                            
                            <?php if ($recording['description']): ?>
                                <p class="text-muted mb-3 small"><?= $recording['description'] ?></p>
                            <?php endif; ?>
                            
                            <a href="<?= $recording['link'] ?>" target="_blank" class="btn btn-danger w-100">
                                Watch Now ▶️
                            </a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
            <?php if (empty($recordings)): ?>
                <div class="col-12">
                    <div class="text-center py-5 text-muted">
                        <div class="mb-3" style="font-size: 3rem;">🎥</div>
                        <h4>No recordings available</h4>
                        <p>Class recordings will appear here.</p>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>
