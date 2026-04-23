<?php
// flight_app/views/student/profile.php
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

    .profile-card {
        background: white;
        border-radius: 24px;
        padding: 2rem;
        text-align: center;
        box-shadow: var(--shadow-sm);
    }

    .profile-avatar {
        width: 120px;
        height: 120px;
        font-size: 4rem;
        background: #F8FAFC;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        box-shadow: var(--shadow-sm);
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
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/student/recordings">Recordings 🎥</a></li>
                    <li class="nav-item"><a class="nav-link" href="/online_class/flight_app/student/announcements">News 📢</a></li>
                    <li class="nav-item"><a class="nav-link active" href="/online_class/flight_app/student/profile">Profile 👤</a></li>
                    <li class="nav-item"><a class="nav-link text-danger" href="/online_class/flight_app/logout">Logout 🚪</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container pb-5">
        <div class="row g-4 justify-content-center">
            <!-- Profile Info -->
            <div class="col-md-5 col-lg-4">
                <div class="profile-card">
                    <div class="profile-avatar"><?= $student['avatar'] ?></div>
                    <h3 class="fw-bold mb-1"><?= $student['name'] ?></h3>
                    <p class="text-muted mb-3"><?= $student['grade'] ?></p>
                    
                    <div class="text-start bg-light p-3 rounded-4 mb-3">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted">📱 Mobile:</span>
                            <span class="fw-bold"><?= $student['mobile'] ?></span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted">📍 District:</span>
                            <span class="fw-bold"><?= $student['district'] ?></span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span class="text-muted">📅 Joined:</span>
                            <span class="fw-bold"><?= date('M Y', strtotime($student['created_at'])) ?></span>
                        </div>
                    </div>

                    <form method="POST" action="/online_class/flight_app/student/profile/update">
                        <div class="mb-3 text-start">
                            <label class="form-label fw-bold small">Change Password</label>
                            <input type="password" name="password" class="form-control" placeholder="New Password">
                            <small class="text-muted" style="font-size: 0.7rem;">Leave empty to keep current</small>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Update Profile</button>
                    </form>
                </div>
            </div>

            <!-- Payment History -->
            <div class="col-md-7 col-lg-8">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-body p-4">
                        <h4 class="fw-bold mb-4">Payment History 💳</h4>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle">
                                <thead class="bg-light">
                                    <tr>
                                        <th>Month</th>
                                        <th>Year</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($payments as $payment): ?>
                                        <tr>
                                            <td><?= $payment['month'] ?></td>
                                            <td><?= $payment['year'] ?></td>
                                            <td><?= $payment['amount'] ?></td>
                                            <td>
                                                <span class="badge <?= $payment['status'] == 'paid' ? 'bg-success' : 'bg-warning' ?>">
                                                    <?= ucfirst($payment['status']) ?>
                                                </span>
                                            </td>
                                            <td class="small text-muted"><?= date('M d, Y', strtotime($payment['created_at'])) ?></td>
                                        </tr>
                                    <?php endforeach; ?>
                                    <?php if (empty($payments)): ?>
                                        <tr>
                                            <td colspan="5" class="text-center py-4 text-muted">
                                                No payment records found.
                                            </td>
                                        </tr>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
