<?php
// flight_app/views/teacher/add_announcement.php
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
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <div class="d-flex align-items-center mb-4">
                    <a href="/online_class/flight_app/teacher/announcements" class="btn btn-light rounded-circle me-3 shadow-sm"
                        style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                        ←
                    </a>
                    <h2 class="fw-bold mb-0">New Announcement 📢</h2>
                </div>

                <form method="POST" action="/online_class/flight_app/teacher/announcements/add" id="announcementForm">
                    <div class="row g-4">
                        <!-- Left Column: Form Fields -->
                        <div class="col-lg-5">
                            <div class="card shadow-sm border-0 sticky-top" style="top: 20px;">
                                <div class="card-body p-4">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Title *</label>
                                        <input type="text" name="title" class="form-control form-control-lg"
                                            placeholder="e.g., Exam Schedule" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Message *</label>
                                        <textarea name="message" class="form-control" rows="4"
                                            placeholder="Enter your announcement..." required></textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Expiration Date (Optional)</label>
                                        <input type="datetime-local" name="expire_date"
                                            class="form-control form-control-lg">
                                        <small class="text-muted">Announcement will disappear after this
                                            date.</small>
                                    </div>

                                    <div class="mb-4">
                                        <label class="form-label fw-bold">Target Audience</label>
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
                                        <button type="submit" class="btn btn-primary btn-lg">Post Announcement
                                            📢</button>
                                        <a href="/online_class/flight_app/teacher/announcements" class="btn btn-light btn-lg">Cancel</a>
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
                                                        <?php foreach ($grades as $grade): ?>
                                                            <option value="<?= $grade ?>"><?= $grade ?></option>
                                                        <?php endforeach; ?>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="d-flex gap-2 mt-2">
                                            <button type="button" class="btn btn-outline-primary text-nowrap"
                                                id="selectAllBtn">
                                                Select All
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Student Grid -->
                                <div class="row g-2" id="studentGrid">
                                    <?php foreach ($students as $student): ?>
                                        <div class="col-6 col-md-4 student-item-wrapper"
                                            data-grade="<?= $student['grade'] ?>" data-status="<?= $student['status'] ?>">

                                            <div class="student-select-card"
                                                onclick="toggleSelection(this, '<?= $student['id'] ?>')">
                                                <div class="check-indicator">✓</div>
                                                <input type="checkbox" name="student_ids[]"
                                                    value="<?= $student['id'] ?>" id="cb_<?= $student['id'] ?>"
                                                    class="d-none">

                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="student-avatar-small"><?= $student['avatar'] ?></div>
                                                    <div class="flex-grow-1 min-w-0">
                                                        <div class="fw-bold small text-truncate"><?= $student['name'] ?>
                                                        </div>
                                                        <div class="badge bg-light text-dark border"
                                                            style="font-size: 0.7rem;"><?= $student['grade'] ?></div>
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

        const items = document.querySelectorAll('.student-item-wrapper');

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const grade = (item.getAttribute('data-grade') || '').toLowerCase();

            const matchesSearch = text.includes(searchText);
            const matchesGrade = !gradeFilter || grade === gradeFilter;

            item.style.display = (matchesSearch && matchesGrade) ? 'block' : 'none';
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
    document.getElementById('studentSearch').addEventListener('input', filterStudents);
    document.getElementById('gradeFilter').addEventListener('input', filterStudents);

    // Initial count
    updateCount();
</script>
