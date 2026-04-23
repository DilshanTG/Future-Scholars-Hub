<?php
// flight_app/views/teacher/classes.php
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
            <h2 class="fw-bold">Class List 📚</h2>
            <div class="d-none d-md-block">
                <a href="/online_class/flight_app/teacher/classes/add" class="btn btn-primary">Create Class</a>
                <a href="/online_class/flight_app/teacher/classes/bulk" class="btn btn-info text-white">Bulk Create</a>
            </div>
        </div>

        <!-- Search Bar -->
        <div class="search-bar">
            <input type="text" class="search-input" id="classSearch" placeholder="🔍 Search classes by topic...">
        </div>

        <!-- Desktop Table -->
        <div class="card shadow-sm desktop-table">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="bg-light">
                            <tr>
                                <th class="ps-4">Topic</th>
                                <th>Date & Time</th>
                                <th>Students</th>
                                <th>Zoom Link</th>
                                <th class="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($classes as $class): ?>
                                <tr>
                                    <td class="ps-4 fw-bold"><?= $class['topic'] ?></td>
                                    <td>
                                        <div><?= date('M d, Y', strtotime($class['class_date'])) ?></div>
                                        <div class="small text-muted"><?= date('H:i', strtotime($class['class_date'])) ?></div>
                                    </td>
                                    <td><span class="badge bg-light text-dark border"><?= $class['assigned_count'] ?></span></td>
                                    <td>
                                        <?php if ($class['zoom_link']): ?>
                                            <a href="<?= $class['zoom_link'] ?>" target="_blank"
                                                class="btn btn-sm btn-light">
                                                🎥 Join
                                            </a>
                                        <?php else: ?>
                                            <span class="text-muted small">-</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-end pe-4">
                                        <div class="btn-group">
                                            <a href="/online_class/flight_app/teacher/classes/edit/<?= $class['id'] ?>"
                                                class="btn btn-sm btn-outline-primary">Edit</a>
                                            <a href="/online_class/flight_app/teacher/classes/assign/<?= $class['id'] ?>"
                                                class="btn btn-sm btn-primary">Assign</a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Mobile Card List -->
        <div class="mobile-card-list mobile-list">
            <?php foreach ($classes as $class): ?>
                <div class="list-card">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="list-card-title"><?= $class['topic'] ?></div>
                        <span class="badge bg-light text-dark border"><?= $class['assigned_count'] ?> 👤</span>
                    </div>

                    <div class="mb-3">
                        <div class="text-muted">
                            📅 <?= date('M d, Y', strtotime($class['class_date'])) ?>
                            <span class="mx-1">•</span>
                            ⏰ <?= date('H:i', strtotime($class['class_date'])) ?>
                        </div>
                    </div>

                    <?php if ($class['zoom_link']): ?>
                        <a href="<?= $class['zoom_link'] ?>" target="_blank"
                            class="btn btn-light btn-sm w-100 mb-3">
                            🎥 Join Zoom Meeting
                        </a>
                    <?php endif; ?>

                    <div class="list-card-actions">
                        <a href="/online_class/flight_app/teacher/classes/edit/<?= $class['id'] ?>"
                            class="btn btn-outline-primary flex-grow-1">Edit</a>
                        <a href="/online_class/flight_app/teacher/classes/assign/<?= $class['id'] ?>"
                            class="btn btn-primary flex-grow-1">Assign</a>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Floating Action Button (Mobile) -->
        <div class="fab-container d-md-none">
            <a href="/online_class/flight_app/teacher/classes/add" class="fab-btn">
                +
            </a>
        </div>
    </div>
</div>

<script>
    document.getElementById('classSearch').addEventListener('keyup', function () {
        let searchText = this.value.toLowerCase();

        // Filter Desktop Table
        let tableRows = document.querySelectorAll('.desktop-table tbody tr');
        tableRows.forEach(row => {
            let text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchText) ? '' : 'none';
        });

        // Filter Mobile Cards
        let mobileCards = document.querySelectorAll('.mobile-list .list-card');
        mobileCards.forEach(card => {
            let text = card.textContent.toLowerCase();
            card.style.display = text.includes(searchText) ? '' : 'none';
        });
    });
</script>
