<?php
// flight_app/views/teacher/payments.php
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
    
    .status-toggle {
        cursor: pointer;
        opacity: 0.5;
        transition: all 0.2s;
        font-size: 1.5rem;
    }
    
    .status-toggle.active {
        opacity: 1;
        transform: scale(1.1);
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
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/teacher/announcements">News 📢</a></li>
                     <li class="nav-item"><a class="nav-link active" href="/online_class/flight_app/teacher/payments">Payments 💳</a></li>
                    <li class="nav-item"><a class="nav-link text-danger" href="/online_class/flight_app/logout">Logout 🚪</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container pb-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold">Payments 💳</h2>
            <form method="GET" action="/online_class/flight_app/teacher/payments" class="d-flex gap-2">
                <select name="month" class="form-select" onchange="this.form.submit()">
                    <?php foreach ($months as $m): ?>
                        <option value="<?= $m ?>" <?= $filterMonth == $m ? 'selected' : '' ?>><?= $m ?></option>
                    <?php endforeach; ?>
                </select>
                <select name="year" class="form-select" style="width: 100px;" onchange="this.form.submit()">
                    <?php foreach ($years as $y): ?>
                        <option value="<?= $y ?>" <?= $filterYear == $y ? 'selected' : '' ?>><?= $y ?></option>
                    <?php endforeach; ?>
                </select>
            </form>
        </div>

        <!-- Search Bar -->
        <div class="search-bar mb-4">
            <input type="text" class="search-input" id="studentSearch" placeholder="🔍 Search students...">
        </div>

        <div class="card shadow-sm">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="bg-light">
                            <tr>
                                <th class="ps-4">Student</th>
                                <th>Grade</th>
                                <th>Status</th>
                                <th>Amount</th>
                                <th class="text-end pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($students as $student): ?>
                                <tr class="student-row">
                                    <td class="ps-4">
                                        <div class="d-flex align-items-center gap-2">
                                            <span class="fs-4"><?= $student['avatar'] ?></span>
                                            <div>
                                                <div class="fw-bold"><?= $student['name'] ?></div>
                                                <small class="text-muted"><?= $student['mobile'] ?></small>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span class="badge bg-light text-dark border"><?= $student['grade'] ?></span></td>
                                    <td>
                                        <span class="badge rounded-pill <?= $student['payment_status'] == 'paid' ? 'bg-success' : 'bg-danger' ?>">
                                            <?= $student['payment_status'] == 'paid' ? 'PAID' : 'UNPAID' ?>
                                        </span>
                                    </td>
                                    <td>
                                        <?php if ($student['payment_status'] == 'paid'): ?>
                                            <?= $student['amount'] ?>
                                        <?php else: ?>
                                            -
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-end pe-4">
                                        <?php if ($student['payment_status'] == 'paid'): ?>
                                            <button class="btn btn-sm btn-outline-danger" 
                                                onclick="updatePayment(<?= $student['id'] ?>, 'unpaid')">
                                                Mark Unpaid
                                            </button>
                                        <?php else: ?>
                                            <button class="btn btn-sm btn-success" 
                                                onclick="updatePayment(<?= $student['id'] ?>, 'paid')">
                                                Mark Paid
                                            </button>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    function updatePayment(studentId, status) {
        let amount = 0;
        if (status === 'paid') {
            amount = prompt("Enter amount paid:", "2500");
            if (amount === null) return; // Cancelled
        } else {
            if (!confirm("Are you sure you want to mark this as UNPAID?")) return;
        }

        fetch('/online_class/flight_app/teacher/payments/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                student_id: studentId,
                month: '<?= $filterMonth ?>',
                year: '<?= $filterYear ?>',
                status: status,
                amount: amount
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload(); 
            } else {
                alert('Error updating payment.');
            }
        })
        .catch(err => {
            console.error(err);
             // Fallback for non-JSON response (redirects)
            location.reload(); 
        });
    }

    document.getElementById('studentSearch').addEventListener('keyup', function () {
        let searchText = this.value.toLowerCase();
        let rows = document.querySelectorAll('.student-row');
        rows.forEach(row => {
            let text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchText) ? '' : 'none';
        });
    });
</script>
