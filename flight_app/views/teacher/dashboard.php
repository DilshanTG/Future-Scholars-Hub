<?php
// flight_app/views/teacher/dashboard.php
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

    .stat-card {
        background: white;
        border-radius: 24px;
        padding: 2rem;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        transition: transform 0.3s ease;
        border: 2px solid transparent;
    }

    .stat-card:hover {
        transform: translateY(-5px);
        border-color: var(--primary-color);
    }

    .stat-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--primary-color);
    }

    .stat-label {
        color: var(--text-muted);
        font-weight: 600;
    }

    .action-btn {
        padding: 1rem 2rem;
        font-size: 1.1rem;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: transform 0.2s;
    }

    .action-btn:hover {
        transform: scale(1.02);
    }
</style>

<div class="container-fluid px-0">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg dashboard-header">
        <div class="container">
            <a class="navbar-brand fw-bold text-primary fs-4" href="/online_class/flight_app/teacher/dashboard">
                <span class="me-2"><?= $user['avatar'] ?></span>Future Scholars
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto gap-2">
                    <li class="nav-item"><a class="nav-link active" href="/online_class/flight_app/teacher/dashboard">Dashboard</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/students">Students 👶</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/classes">Classes 📚</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/recordings">Recordings 🎥</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/notes">Notes 📝</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/announcements">News 📢</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/settings">Settings ⚙️</a></li>
                    <li class="nav-item"><a class="nav-link text-danger" href="/online_class/flight_app/logout">Logout 🚪</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container pb-5">
        <div class="row mb-5 align-items-center">
            <div class="col-md-8">
                <h1 class="display-5 fw-bold">Hello, Teacher! 👋</h1>
                <p class="lead text-muted">Ready to inspire some young minds today?</p>
            </div>
            <div class="col-md-4 text-md-end">
                <span class="badge bg-primary rounded-pill px-3 py-2">Term 1 - 2024</span>
            </div>
        </div>

        <!-- Stats Row -->
        <div class="row g-4 mb-5">
            <div class="col-md-4">
                <div class="stat-card shadow-sm">
                    <div class="stat-icon">👶</div>
                    <div class="stat-value"><?= $totalStudents ?></div>
                    <div class="stat-label">Total Students</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card shadow-sm">
                    <div class="stat-icon">✨</div>
                    <div class="stat-value"><?= $activeStudents ?></div>
                    <div class="stat-label">Active Learners</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card shadow-sm">
                    <div class="stat-icon">📚</div>
                    <div class="stat-value"><?= $totalClasses ?></div>
                    <div class="stat-label">Total Classes</div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <h3 class="mb-4 fw-bold">Quick Actions ⚡</h3>
        <div class="row g-3">
            <div class="col-md-4">
                <a href="/online_class/flight_app/teacher/students/add" class="btn btn-primary w-100 action-btn shadow-sm">
                    <span>➕</span> Add New Student
                </a>
            </div>
            <div class="col-md-4">
                <a href="/online_class/flight_app/teacher/classes/add" class="btn btn-secondary w-100 action-btn shadow-sm">
                    <span>📅</span> Create Class
                </a>
            </div>
            <div class="col-md-4">
                <a href="/online_class/flight_app/teacher/classes/bulk" class="btn btn-info text-white w-100 action-btn shadow-sm"
                    style="background-color: #00BCD4;">
                    <span>📦</span> Bulk Create
                </a>
            </div>
        </div>
    </div>
</div>
