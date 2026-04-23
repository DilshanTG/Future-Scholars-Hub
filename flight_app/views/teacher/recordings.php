<?php
// flight_app/views/teacher/recordings.php
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
                    <li class="nav-item"><a class="nav-link active" href="/online_class/flight_app/teacher/recordings">Recordings 🎥</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/notes">Notes 📝</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/announcements">News 📢</a></li>
                    <li class="nav-item"><a class="nav-link text-danger" href="/online_class/flight_app/logout">Logout 🚪</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container pb-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold">Recordings 🎥</h2>
            <a href="/online_class/flight_app/teacher/recordings/add" class="btn btn-primary d-none d-md-inline-block">Add New Recording</a>
        </div>

        <!-- Search Bar -->
        <div class="search-bar">
            <input type="text" class="search-input" id="recordingSearch" placeholder="🔍 Search recordings...">
        </div>

        <!-- Desktop Table -->
        <div class="card shadow-sm desktop-table">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="bg-light">
                            <tr>
                                <th class="ps-4">Topic</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Link</th>
                                <th>Students</th>
                                <th class="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recordings as $recording): ?>
                                <tr>
                                    <td class="ps-4 fw-bold"><?= $recording['topic'] ?></td>
                                    <td>
                                        <?php if ($recording['description']): ?>
                                            <div class="text-muted small text-truncate"
                                                style="max-width: 200px;"><?= $recording['description'] ?></div>
                                        <?php else: ?>
                                            <span class="text-muted small">-</span>
                                        <?php endif; ?>
                                    </td>
                                    <td><?= date('M d, Y', strtotime($recording['created_at'])) ?></td>
                                    <td>
                                        <a href="<?= $recording['link'] ?>" target="_blank"
                                            class="btn btn-sm btn-light text-truncate" style="max-width: 150px;">
                                            🔗 Link
                                        </a>
                                    </td>
                                    <td><span class="badge bg-light text-dark border"><?= $recording['assigned_count'] ?></span></td>
                                    <td class="text-end pe-4">
                                        <div class="btn-group">
                                            <a href="/online_class/flight_app/teacher/recordings/edit/<?= $recording['id'] ?>"
                                                class="btn btn-sm btn-outline-primary">Edit</a>
                                            <a href="/online_class/flight_app/teacher/recordings/assign/<?= $recording['id'] ?>"
                                                class="btn btn-sm btn-primary">Assign</a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                            <?php if (empty($recordings)): ?>
                                <tr>
                                    <td colspan="6" class="text-center py-4">
                                        <div class="text-muted">No recordings yet 🎥</div>
                                    </td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Mobile Card List -->
        <div class="mobile-card-list mobile-list">
            <?php foreach ($recordings as $recording): ?>
                <div class="list-card">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="list-card-title"><?= $recording['topic'] ?></div>
                        <span class="badge bg-light text-dark border"><?= $recording['assigned_count'] ?> 👤</span>
                    </div>

                    <div class="mb-3 text-muted small">
                        <?php if ($recording['description']): ?>
                            <div class="mb-1"><?= $recording['description'] ?></div>
                        <?php endif; ?>
                        <div>📅 <?= date('M d, Y', strtotime($recording['created_at'])) ?></div>
                    </div>

                    <a href="<?= $recording['link'] ?>" target="_blank"
                        class="btn btn-light btn-sm w-100 mb-3 text-truncate">
                        🔗 Open Link
                    </a>

                    <div class="list-card-actions">
                        <a href="/online_class/flight_app/teacher/recordings/edit/<?= $recording['id'] ?>"
                            class="btn btn-outline-primary flex-grow-1">Edit</a>
                        <a href="/online_class/flight_app/teacher/recordings/assign/<?= $recording['id'] ?>"
                            class="btn btn-primary flex-grow-1">Assign</a>
                    </div>
                </div>
            <?php endforeach; ?>
            <?php if (empty($recordings)): ?>
                <div class="text-center py-5 text-muted">
                    <div class="mb-3" style="font-size: 3rem;">🎥</div>
                    <p>No recordings yet</p>
                </div>
            <?php endif; ?>
        </div>

        <!-- Floating Action Button (Mobile) -->
        <a href="/online_class/flight_app/teacher/recordings/add" class="fab-btn d-md-none">
            +
        </a>
    </div>
</div>

<script>
    document.getElementById('recordingSearch').addEventListener('keyup', function () {
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
