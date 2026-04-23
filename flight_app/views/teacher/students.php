<?php
// flight_app/views/teacher/students.php
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
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold">Student List 👶</h2>
            <a href="/online_class/flight_app/teacher/students/add" class="btn btn-primary d-none d-md-inline-block">Add New Student</a>
        </div>

        <!-- Filters & Search -->
        <div class="card shadow-sm mb-4 border-0">
            <div class="card-body p-3">
                <div class="row g-3">
                    <div class="col-md-4">
                        <div class="search-bar mb-0 h-100 d-flex align-items-center p-0 shadow-none border-0">
                            <input type="text" class="search-input" id="studentSearch"
                                placeholder="🔍 Search by name, mobile...">
                        </div>
                    </div>
                    <div class="col-6 col-md-2">
                        <select class="form-select" id="gradeFilter">
                            <option value="">All Grades</option>
                            <option value="Grade 6">Grade 6</option>
                            <option value="Grade 7">Grade 7</option>
                            <option value="Grade 8">Grade 8</option>
                            <option value="Grade 9">Grade 9</option>
                            <option value="Grade 10">Grade 10</option>
                            <option value="Grade 11">Grade 11</option>
                            <option value="A/L">A/L</option>
                        </select>
                    </div>
                    <div class="col-6 col-md-3">
                        <select class="form-select" id="statusFilter">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div class="col-12 col-md-3">
                        <select class="form-select" id="paymentFilter">
                            <option value="">All Payments</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- Desktop Table -->
        <div class="card shadow-sm desktop-table">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="bg-light">
                            <tr>
                                <th class="ps-4" style="width: 50px;"></th>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Grade</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Next Class</th>
                                <th class="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($students as $student): ?>
                                <tr data-grade="<?= $student['grade'] ?>" data-status="<?= $student['status'] ?>"
                                    data-payment="<?= $student['payment_status'] ?>">
                                    <td class="ps-4">
                                        <div class="avatar-circle"><?= $student['avatar'] ?></div>
                                    </td>
                                    <td>
                                        <a href="/online_class/flight_app/teacher/students/view/<?= $student['id'] ?>"
                                            class="text-decoration-none fw-bold text-dark">
                                            <?= $student['name'] ?>
                                        </a>
                                        <div class="small text-muted"><?= $student['district'] ?></div>
                                    </td>
                                    <td><?= $student['mobile'] ?></td>
                                    <td><span class="badge bg-light text-dark border"><?= $student['grade'] ?></span>
                                    </td>
                                    <td>
                                        <span
                                            class="badge <?= $student['status'] == 'active' ? 'bg-success' : 'bg-secondary' ?>">
                                            <?= $student['status'] ?>
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            class="badge <?= $student['payment_status'] == 'paid' ? 'bg-success' : 'bg-danger' ?>">
                                            <?= $student['payment_status'] ?>
                                        </span>
                                    </td>
                                    <td>
                                        <?php if ($student['next_class']): ?>
                                            <div class="small fw-bold"><?= $student['next_class']['topic'] ?></div>
                                            <div class="small text-muted"><?= date('M d, H:i', strtotime($student['next_class']['class_date'])) ?></div>
                                        <?php else: ?>
                                            <span class="text-muted small">-</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-end pe-4">
                                        <div class="btn-group">
                                            <a href="/online_class/flight_app/teacher/students/edit/<?= $student['id'] ?>"
                                                class="btn btn-sm btn-outline-primary">Edit</a>
                                            <button type="button"
                                                class="btn btn-sm btn-outline-primary dropdown-toggle dropdown-toggle-split"
                                                data-bs-toggle="dropdown"></button>
                                            <ul class="dropdown-menu">
                                                <li><a class="dropdown-item"
                                                        href="/online_class/flight_app/teacher/students/assign-note/<?= $student['id'] ?>">Assign
                                                        Note</a></li>
                                                <li><a class="dropdown-item"
                                                        href="/online_class/flight_app/teacher/students/assign-class/<?= $student['id'] ?>">Assign
                                                        Class</a></li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Mobile List -->
        <div class="mobile-card-list mobile-list">
            <?php foreach ($students as $student): ?>
                <div class="list-card" data-grade="<?= $student['grade'] ?>" data-status="<?= $student['status'] ?>"
                    data-payment="<?= $student['payment_status'] ?>">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="d-flex align-items-center gap-3">
                            <div class="avatar-circle"><?= $student['avatar'] ?></div>
                            <div>
                                <div class="list-card-title"><?= $student['name'] ?></div>
                                <div class="list-card-subtitle"><?= $student['grade'] ?> • <?= $student['district'] ?></div>
                            </div>
                        </div>
                        <span class="badge <?= $student['status'] == 'active' ? 'bg-success' : 'bg-secondary' ?>">
                            <?= $student['status'] ?>
                        </span>
                    </div>

                    <div class="mb-2">
                        <small class="text-muted d-block">📱 <?= $student['mobile'] ?></small>
                        <small class="text-muted d-block">
                            💳 Payment:
                            <span
                                class="<?= $student['payment_status'] == 'paid' ? 'text-success' : 'text-danger' ?> fw-bold">
                                <?= $student['payment_status'] ?>
                            </span>
                        </small>
                    </div>

                    <?php if ($student['next_class']): ?>
                        <div class="alert alert-light border p-2 mb-0 mt-2">
                            <small class="fw-bold d-block">🔜 Next Class:</small>
                            <small><?= $student['next_class']['topic'] ?></small>
                            <small class="d-block text-muted"><?= date('M d, H:i', strtotime($student['next_class']['class_date'])) ?></small>
                        </div>
                    <?php endif; ?>

                    <div class="list-card-actions">
                        <a href="/online_class/flight_app/teacher/students/view/<?= $student['id'] ?>"
                            class="btn btn-sm btn-light flex-grow-1">View</a>
                        <a href="/online_class/flight_app/teacher/students/edit/<?= $student['id'] ?>"
                            class="btn btn-sm btn-outline-primary flex-grow-1">Edit</a>
                        <div class="dropdown flex-grow-1 d-grid">
                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button"
                                data-bs-toggle="dropdown">
                                More
                            </button>
                            <ul class="dropdown-menu w-100">
                                <li><a class="dropdown-item"
                                        href="/online_class/flight_app/teacher/students/assign-note/<?= $student['id'] ?>">Assign Note</a></li>
                                <li><a class="dropdown-item"
                                        href="/online_class/flight_app/teacher/students/assign-class/<?= $student['id'] ?>">Assign Class</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Floating Action Button (Mobile) -->
        <a href="/online_class/flight_app/teacher/students/add" class="fab-btn d-md-none">
            +
        </a>
    </div>
</div>

<script>
    // Simple client-side search
    function filterStudents() {
        const searchText = document.getElementById('studentSearch').value.toLowerCase();
        const gradeFilter = document.getElementById('gradeFilter').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value.toLowerCase();
        const paymentFilter = document.getElementById('paymentFilter').value.toLowerCase();

        const filterElement = (el) => {
            const text = el.textContent.toLowerCase();
            const grade = (el.getAttribute('data-grade') || '').toLowerCase();
            const status = (el.getAttribute('data-status') || '').toLowerCase();
            const payment = (el.getAttribute('data-payment') || '').toLowerCase();

            const matchesSearch = text.includes(searchText);
            const matchesGrade = !gradeFilter || grade === gradeFilter;
            const matchesStatus = !statusFilter || status === statusFilter;
            const matchesPayment = !paymentFilter || payment === paymentFilter;

            return matchesSearch && matchesGrade && matchesStatus && matchesPayment;
        };

        // Filter Desktop Table
        document.querySelectorAll('.desktop-table tbody tr').forEach(row => {
            row.style.display = filterElement(row) ? '' : 'none';
        });

        // Filter Mobile Cards
        document.querySelectorAll('.mobile-list .list-card').forEach(card => {
            card.style.display = filterElement(card) ? '' : 'none';
        });
    }

    // Attach event listeners
    ['studentSearch', 'gradeFilter', 'statusFilter', 'paymentFilter'].forEach(id => {
        document.getElementById(id).addEventListener('input', filterStudents);
    });
</script>
