<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Note - Future Scholars Hub</title>
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
            border-radius: 12px;
            padding: 0.75rem;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
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
            box-shadow: 0 4px 12px rgba(108, 99, 255, 0.2);
        }

        .student-select-card .check-indicator {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #E2E8F0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            transition: all 0.2s;
        }

        .student-select-card.selected .check-indicator {
            background: var(--primary-color);
            transform: scale(1.1);
        }

        .student-avatar-small {
            width: 40px;
            height: 40px;
            font-size: 1.5rem;
            background: #F8FAFC;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        #studentSelectionArea {
            display: none;
        }

        #studentSelectionArea.show {
            display: block;
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
                        <li class="nav-item"><a class="nav-link" href="/teacher/classes">Classes 📚</a></li>
                        <li class="nav-item"><a class="nav-link" href="/teacher/recordings">Recordings 🎥</a></li>
                        <li class="nav-item"><a class="nav-link active" href="/teacher/notes">Notes 📝</a></li>
                        <li class="nav-item"><a class="nav-link" href="/teacher/announcements">News 📢</a></li>
                        <li class="nav-item"><a class="nav-link" href="/teacher/settings">Settings ⚙️</a></li>
                        <li class="nav-item"><a class="nav-link text-danger" href="/logout">Logout 🚪</a></li>
                    </ul>
                </div>
            </div>
        </nav>

        <div class="container pb-5">
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <div class="d-flex align-items-center mb-4">
                        <a href="/teacher/notes" class="btn btn-light rounded-circle me-3 shadow-sm"
                            style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                            ⬅️
                        </a>
                        <h2 class="fw-bold mb-0">Add Note 📝</h2>
                    </div>

                    <form method="POST" action="/teacher/notes/add" id="noteForm">
                        <div class="row g-4">
                            <!-- Left Column: Form Fields -->
                            <div class="col-lg-5">
                                <div class="card shadow-sm border-0 sticky-top" style="top: 20px;">
                                    <div class="card-body p-4">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Title *</label>
                                            <input type="text" name="title" class="form-control form-control-lg"
                                                placeholder="e.g., Chapter 1 Summary" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Link (Optional)</label>
                                            <input type="url" name="link" class="form-control form-control-lg"
                                                placeholder="https://drive.google.com/...">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-bold">Details / Instructions</label>
                                            <textarea name="details" class="form-control" rows="5"
                                                placeholder="Enter note details here..."></textarea>
                                        </div>

                                        <div class="mb-4">
                                            <label class="form-label fw-bold">Share With</label>
                                            <div class="form-check mb-2">
                                                <input class="form-check-input" type="radio" name="target"
                                                    id="allStudents" value="all" checked
                                                    onclick="toggleStudentSelection(false)">
                                                <label class="form-check-label" for="allStudents">
                                                    All Students
                                                </label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="target"
                                                    id="specificStudents" value="specific"
                                                    onclick="toggleStudentSelection(true)">
                                                <label class="form-check-label" for="specificStudents">
                                                    Specific Students
                                                </label>
                                            </div>
                                            <small class="text-muted d-block mt-2" id="selectedCountText">
                                                <span id="selectedCount">0</span> students selected
                                            </small>
                                        </div>

                                        <div class="d-grid gap-2">
                                            <button type="submit" class="btn btn-primary btn-lg">Create Note 📝</button>
                                            <a href="/teacher/notes" class="btn btn-light btn-lg">Cancel</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Right Column: Student Selection -->
                            <div class="col-lg-7">
                                <div id="studentSelectionArea">
                                    <div class="card shadow-sm mb-3 border-0">
                                        <div class="card-body p-3">
                                            <div class="row g-2 align-items-center">
                                                <div class="col-md-6">
                                                    <div class="position-relative">
                                                        <span
                                                            class="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">🔍</span>
                                                        <input type="text" class="form-control ps-5 border-0 bg-light"
                                                            id="studentSearch" placeholder="Search students...">
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <div class="d-flex gap-2">
                                                        <select class="form-select border-0 bg-light" id="gradeFilter">
                                                            <option value="">All Grades</option>
                                                            <?php foreach (($grades?:[]) as $grade): ?>
                                                                <option value="<?= ($grade) ?>"><?= ($grade) ?></option>
                                                            <?php endforeach; ?>
                                                        </select>
                                                        <select class="form-select border-0 bg-light" id="statusFilter">
                                                            <option value="">All Status</option>
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="d-flex gap-2 mt-2">
                                                <select class="form-select border-0 bg-light" id="paymentFilter">
                                                    <option value="">All Payments</option>
                                                    <?php foreach (($paymentStatuses?:[]) as $status): ?>
                                                        <option value="<?= ($status) ?>"><?= (ucfirst($status)) ?></option>
                                                    <?php endforeach; ?>
                                                </select>
                                                <button type="button" class="btn btn-outline-primary text-nowrap"
                                                    id="selectAllBtn">
                                                    Select All
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Student Grid -->
                                    <div class="row g-2" id="studentGrid">
                                        <?php foreach (($students?:[]) as $student): ?>
                                            <div class="col-6 col-md-4 student-item-wrapper"
                                                data-grade="<?= ($student['grade']) ?>" data-status="<?= ($student['status']) ?>"
                                                data-payment="<?= ($student['payment_status']) ?>">

                                                <div class="student-select-card"
                                                    onclick="toggleSelection(this, '<?= ($student['id']) ?>')">
                                                    <div class="check-indicator">✓</div>
                                                    <input type="checkbox" name="student_ids[]"
                                                        value="<?= ($student['id']) ?>" id="cb_<?= ($student['id']) ?>"
                                                        class="d-none">

                                                    <div class="d-flex align-items-center gap-2">
                                                        <div class="student-avatar-small"><?= ($student['avatar']) ?></div>
                                                        <div class="flex-grow-1 min-w-0">
                                                            <div class="fw-bold small text-truncate"><?= ($student['name'])."
" ?>
                                                            </div>
                                                            <div class="badge bg-light text-dark border"
                                                                style="font-size: 0.7rem;"><?= ($student['grade']) ?></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function toggleStudentSelection(show) {
            const area = document.getElementById('studentSelectionArea');
            const countText = document.getElementById('selectedCountText');

            if (show) {
                area.classList.add('show');
                countText.style.display = 'block';
            } else {
                area.classList.remove('show');
                countText.style.display = 'none';
                // Uncheck all students
                document.querySelectorAll('input[name="student_ids[]"]').forEach(cb => {
                    cb.checked = false;
                    cb.closest('.student-select-card').classList.remove('selected');
                });
                updateCount();
            }
        }

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