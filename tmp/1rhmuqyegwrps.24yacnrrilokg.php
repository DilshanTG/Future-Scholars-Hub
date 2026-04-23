<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assign Class - Future Scholars Hub</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="/css/style.css" rel="stylesheet">
    <style>
        body {
            padding-bottom: 100px;
            /* Space for sticky footer */
        }

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

        /* Student Selection Card */
        .student-select-card {
            background: white;
            border: 2px solid transparent;
            border-radius: 16px;
            padding: 1rem;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            height: 100%;
            box-shadow: var(--shadow-sm);
        }

        .student-select-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        .student-select-card.selected {
            border-color: var(--primary-color);
            background-color: #F3F0FF;
            /* Light purple tint */
            box-shadow: 0 4px 12px rgba(108, 99, 255, 0.2);
        }

        .student-select-card .check-indicator {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #E2E8F0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            transition: all 0.2s;
        }

        .student-select-card.selected .check-indicator {
            background: var(--primary-color);
            transform: scale(1.1);
        }

        .student-avatar-large {
            width: 60px;
            height: 60px;
            font-size: 2.5rem;
            background: #F8FAFC;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
        }

        /* Sticky Action Bar */
        .sticky-action-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            padding: 1.5rem;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
            from {
                transform: translateY(100%);
            }

            to {
                transform: translateY(0);
            }
        }

        /* Filter Badges */
        .filter-badge {
            cursor: pointer;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            background: white;
            border: 1px solid #E2E8F0;
            font-weight: 500;
            transition: all 0.2s;
        }

        .filter-badge:hover,
        .filter-badge.active {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }
    </style>
</head>

<body>
    <div class="container-fluid px-0">
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg dashboard-header">
            <div class="container">
                <a class="navbar-brand fw-bold text-primary fs-4" href="/teacher/dashboard">
                    <span class="me-2"><?= ($SESSION['user']['avatar']) ?></span>Future Scholars
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto gap-2">
                        <li class="nav-item"><a class="nav-link" href="/teacher/dashboard">Dashboard</a></li>
                        <li class="nav-item"><a class="nav-link" href="/teacher/students">Students 👶</a></li>
                        <li class="nav-item"><a class="nav-link active" href="/teacher/classes">Classes 📚</a></li>
                        <li class="nav-item"><a class="nav-link" href="/teacher/recordings">Recordings 🎥</a></li>
                        <li class="nav-item"><a class="nav-link" href="/teacher/notes">Notes 📝</a></li>
                        <li class="nav-item"><a class="nav-link" href="/teacher/announcements">News 📢</a></li>
                        <li class="nav-item"><a class="nav-link" href="/teacher/settings">Settings ⚙️</a></li>
                        <li class="nav-item"><a class="nav-link text-danger" href="/logout">Logout 🚪</a></li>
                    </ul>
                </div>
            </div>
        </nav>

        <div class="container pb-5">
            <!-- Header -->
            <div class="d-flex align-items-center mb-4">
                <a href="/teacher/classes" class="btn btn-light rounded-circle me-3 shadow-sm"
                    style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                    ⬅️
                </a>
                <div>
                    <h2 class="fw-bold mb-0">Assign Class 📚</h2>
                    <p class="text-muted mb-0">Select students to attend <strong><?= ($class['topic']) ?></strong></p>
                </div>
            </div>

            <!-- Filters & Search -->
            <div class="card shadow-sm mb-4 border-0 sticky-top" style="top: 20px; z-index: 900;">
                <div class="card-body p-3">
                    <div class="row g-3 align-items-center">
                        <div class="col-md-4">
                            <div class="position-relative">
                                <span
                                    class="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">🔍</span>
                                <input type="text" class="form-control form-control-lg ps-5 border-0 bg-light"
                                    id="studentSearch" placeholder="Search students...">
                            </div>
                        </div>
                        <div class="col-md-8">
                            <div class="d-flex gap-2 overflow-auto pb-1">
                                <select class="form-select border-0 bg-light" id="gradeFilter"
                                    style="min-width: 120px;">
                                    <option value="">All Grades</option>
                                    <?php foreach (($grades?:[]) as $grade): ?>
                                        <option value="<?= ($grade) ?>"><?= ($grade) ?></option>
                                    <?php endforeach; ?>
                                </select>
                                <select class="form-select border-0 bg-light" id="statusFilter"
                                    style="min-width: 120px;">
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <select class="form-select border-0 bg-light" id="paymentFilter"
                                    style="min-width: 140px;">
                                    <option value="">All Payments</option>
                                    <?php foreach (($paymentStatuses?:[]) as $status): ?>
                                        <option value="<?= ($status) ?>"><?= (ucfirst($status)) ?></option>
                                    <?php endforeach; ?>
                                </select>
                                <button type="button" class="btn btn-outline-primary text-nowrap ms-auto"
                                    id="selectAllBtn">
                                    Select All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <form method="POST" action="/teacher/classes/assign/<?= ($class['id']) ?>" id="assignForm">
                <!-- Student Grid -->
                <div class="row g-3" id="studentGrid">
                    <?php foreach (($students?:[]) as $student): ?>
                        <div class="col-6 col-md-4 col-lg-3 student-item-wrapper" data-grade="<?= ($student['grade']) ?>"
                            data-status="<?= ($student['status']) ?>" data-payment="<?= ($student['payment_status']) ?>">

                            <div class="student-select-card<?php if ($student['is_assigned']): ?> selected<?php endif; ?>"
                                onclick="toggleSelection(this, '<?= ($student['id']) ?>')">

                                <div class="check-indicator">✓</div>
                                <input type="checkbox" name="student_ids[]" value="<?= ($student['id']) ?>"
                                    id="cb_<?= ($student['id']) ?>" class="d-none" <?php if ($student['is_assigned']): ?>
                                checked<?php endif; ?>>

                                <div class="student-avatar-large">
                                    <?= ($student['avatar'])."
" ?>
                                </div>

                                <div class="text-center">
                                    <h5 class="fw-bold mb-1 text-truncate"><?= ($student['name']) ?></h5>
                                    <div class="badge bg-light text-dark border mb-2"><?= ($student['grade']) ?></div>

                                    <div class="d-flex justify-content-center gap-2 mt-2">
                                        <span class="badge<?php if ($student['status']=='active'): ?> bg-success
                                            <?php else: ?> bg-secondary
                                            <?php endif; ?> bg-opacity-10 text-dark border">
                                            <?= ($student['status'])."
" ?>
                                        </span>
                                        <span class="badge<?php if ($student['payment_status']=='paid'): ?> bg-success
                                            <?php else: ?> bg-danger
                                            <?php endif; ?> bg-opacity-10 text-dark border">
                                            <?= ($student['payment_status'])."
" ?>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </form>
        </div>

        <!-- Sticky Action Bar -->
        <div class="sticky-action-bar">
            <div class="container d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-3">
                    <div class="bg-primary bg-opacity-10 text-primary rounded-circle p-2"
                        style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                        👥
                    </div>
                    <div>
                        <h5 class="fw-bold mb-0"><span id="selectedCount">0</span> Selected</h5>
                        <small class="text-muted">Ready to assign</small>
                    </div>
                </div>
                <div class="d-flex gap-2">
                    <a href="/teacher/classes" class="btn btn-light btn-lg px-4">Cancel</a>
                    <button type="submit" form="assignForm" class="btn btn-primary btn-lg px-5 shadow">
                        Save Assignments 💾
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function toggleSelection(card, id) {
            const checkbox = document.getElementById('cb_' + id);
            checkbox.checked = !checkbox.checked;

            if (checkbox.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
            updateCount();
        }

        function updateCount() {
            const count = document.querySelectorAll('input[name="student_ids[]"]:checked').length;
            document.getElementById('selectedCount').textContent = count;
        }

        // Filter Logic
        function filterStudents() {
            const searchText = document.getElementById('studentSearch').value.toLowerCase();
            const gradeFilter = document.getElementById('gradeFilter').value.toLowerCase();
            const statusFilter = document.getElementById('statusFilter').value.toLowerCase();
            const paymentFilter = document.getElementById('paymentFilter').value.toLowerCase();

            const items = document.querySelectorAll('.student-item-wrapper');

            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                const grade = (item.getAttribute('data-grade') || '').toLowerCase();
                const status = (item.getAttribute('data-status') || '').toLowerCase();
                const payment = (item.getAttribute('data-payment') || '').toLowerCase();

                const matchesSearch = text.includes(searchText);
                const matchesGrade = !gradeFilter || grade === gradeFilter;
                const matchesStatus = !statusFilter || status === statusFilter;
                const matchesPayment = !paymentFilter || payment === paymentFilter;

                item.style.display = (matchesSearch && matchesGrade && matchesStatus && matchesPayment) ? 'block' : 'none';
            });
        }

        // Select All Logic
        document.getElementById('selectAllBtn').addEventListener('click', function () {
            const visibleItems = Array.from(document.querySelectorAll('.student-item-wrapper')).filter(item => item.style.display !== 'none');
            const allSelected = visibleItems.every(item => item.querySelector('input').checked);

            visibleItems.forEach(item => {
                const checkbox = item.querySelector('input');
                const card = item.querySelector('.student-select-card');

                checkbox.checked = !allSelected;
                if (!allSelected) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });

            this.textContent = allSelected ? 'Select All' : 'Deselect All';
            updateCount();
        });

        // Attach listeners
        ['studentSearch', 'gradeFilter', 'statusFilter', 'paymentFilter'].forEach(id => {
            document.getElementById(id).addEventListener('input', filterStudents);
        });

        // Initial count
        updateCount();
    </script>
</body>

</html>