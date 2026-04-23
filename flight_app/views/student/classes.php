<?php
// flight_app/views/student/classes.php
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
                    <li class="nav-item"><a class="nav-link active" href="/online_class/flight_app/student/classes">Classes 📚</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/student/notes">Notes 📝</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/student/recordings">Recordings 🎥</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/student/announcements">News 📢</a></li>
                    <li class="nav-item"><a class="nav-link text-danger" href="/online_class/flight_app/logout">Logout 🚪</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container pb-5">
        <h2 class="fw-bold mb-4">My Classes 📚</h2>

        <!-- Active/Upcoming Classes -->
        <h4 class="mb-3 text-primary">Upcoming Classes</h4>
        <div class="row g-4 mb-5">
            <?php 
            $hasUpcoming = false;
            foreach ($classes as $class): 
                if (strtotime($class['class_date']) > time()):
                    $hasUpcoming = true;
            ?>
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm border-0 class-card">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <span class="badge bg-primary-subtle text-primary rounded-pill px-3">Upcoming</span>
                                <small class="text-muted fw-bold"><?= date('M d', strtotime($class['class_date'])) ?></small>
                            </div>
                            <h4 class="fw-bold mb-2"><?= $class['topic'] ?></h4>
                            <p class="text-muted mb-4">
                                🕒 <?= date('l, g:i A', strtotime($class['class_date'])) ?>
                            </p>
                            <?php if ($class['zoom_link']): ?>
                                <a href="<?= $class['zoom_link'] ?>" target="_blank" class="btn btn-primary w-100 py-2">
                                    Join Class 🎥
                                </a>
                            <?php else: ?>
                                <button disabled class="btn btn-secondary w-100 py-2">Link Pending</button>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php 
                endif;
            endforeach; 
            ?>
            <?php if (!$hasUpcoming): ?>
                <div class="col-12">
                    <div class="alert alert-light text-center">No upcoming classes scheduled.</div>
                </div>
            <?php endif; ?>
        </div>

        <!-- Past Classes -->
        <h4 class="mb-3 text-muted">Past Classes</h4>
        <div class="card shadow-sm border-0">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="bg-light">
                            <tr>
                                <th class="ps-4">Date</th>
                                <th>Topic</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                            $hasPast = false;
                            foreach ($classes as $class): 
                                if (strtotime($class['class_date']) <= time()):
                                    $hasPast = true;
                            ?>
                                <tr>
                                    <td class="ps-4 text-muted"><?= date('M d, Y', strtotime($class['class_date'])) ?></td>
                                    <td class="fw-bold"><?= $class['topic'] ?></td>
                                    <td><span class="badge bg-light text-dark border">Completed</span></td>
                                </tr>
                            <?php 
                                endif;
                            endforeach; 
                            ?>
                            <?php if (!$hasPast): ?>
                                <tr><td colspan="3" class="text-center py-4 text-muted">No past classes.</td></tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
