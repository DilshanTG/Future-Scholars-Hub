<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Dashboard - Future Scholars Hub</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="/css/style.css" rel="stylesheet">
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

        .welcome-section {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            border-radius: 24px;
            padding: 3rem;
            margin-bottom: 2rem;
            position: relative;
            overflow: hidden;
        }

        .welcome-text {
            position: relative;
            z-index: 1;
        }

        .info-card {
            background: white;
            border-radius: 24px;
            padding: 1.5rem;
            height: 100%;
            box-shadow: var(--shadow-sm);
            transition: transform 0.3s ease;
        }

        .info-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-md);
        }

        .class-card {
            background: white;
            border-radius: 24px;
            padding: 2rem;
            border-left: 8px solid var(--primary-color);
            box-shadow: var(--shadow-sm);
        }

        .announcement-alert {
            border-radius: 16px;
            border: none;
            box-shadow: var(--shadow-sm);
        }
    </style>
</head>

<body>
    <div class="container-fluid px-0">
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg dashboard-header">
            <div class="container">
                <div class="container">
                    <a class="navbar-brand fw-bold text-primary fs-4" href="/student/dashboard">
                        <span class="me-2"><?= ($SESSION['user']['avatar']) ?></span>Future Scholars
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav ms-auto gap-2">
                                <li class="nav-item"><a class="nav-link active" href="/student/dashboard">Dashboard</a>
                                </li>
                                <li class="nav-item"><a class="nav-link" href="/student/payment">Payment 💳</a></li>
                                <li class="nav-item"><a class="nav-link" href="/student/notes">Notes 📝</a></li>
                                <li class="nav-item"><a class="nav-link" href="/student/classes">Classes 📚</a></li>
                                <li class="nav-item"><a class="nav-link" href="/student/recordings">Recordings 🎥</a>
                                </li>
                                <li class="nav-item"><a class="nav-link" href="/student/announcements">News 📢</a></li>
                                <li class="nav-item"><a class="nav-link" href="/student/profile">Profile 👤</a></li>
                                <li class="nav-item"><a class="nav-link text-danger" href="/logout">Logout 🚪</a></li>
                            </ul>
                        </div>
                </div>
        </nav>

        <div class="container pb-5">
            <!-- Welcome Section -->
            <div class="welcome-section shadow-sm">
                <div class="welcome-text">
                    <h1 class="display-5 fw-bold mb-2">👋 Welcome, <?= ($student['name']) ?>!</h1>
                    <p class="lead mb-0 text-dark opacity-75">Ready to learn something new today?</p>
                </div>
            </div>

            <div class="row g-4 mb-5">
                <!-- Payment Status -->
                <div class="col-md-4">
                    <div class="info-card">
                        <h5 class="fw-bold mb-3 text-muted">💳 Payment Status</h5>
                        <div class="d-flex align-items-center justify-content-between">
                            <span class="fs-5 fw-bold">Monthly Fee</span>
                            <span
                                class="badge rounded-pill px-3 py-2 fs-6 <?= ($paymentStatus == 'paid' ? 'bg-success' : 'bg-danger') ?>">
                                <?= ($paymentStatus == 'paid' ? '✅ Paid' : '❌ Not Paid')."
" ?>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Quick Stats or Info could go here -->
                <div class="col-md-8">
                    <!-- Active Announcements -->
                    <?php if (count($announcements) > 0): ?>
                        
                            <div class="info-card bg-light border-0">
                                <h5 class="fw-bold mb-3 text-muted">📢 Latest News</h5>
                                <?php foreach (($announcements?:[]) as $announcement): ?>
                                    <div class="alert alert-warning announcement-alert fade show mb-2" role="alert">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h6 class="alert-heading fw-bold mb-1"><?= ($announcement['title']) ?></h6>
                                                <p class="mb-1 small"><?= ($announcement['message']) ?></p>
                                            </div>
                                            <?php if ($announcement['expire_date']): ?>
                                                
                                                    <small class="text-muted" style="font-size: 0.75rem;">Expires: <?= (date('M d', strtotime($announcement['expire_date']))) ?></small>
                                                
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        
                    <?php endif; ?>
                </div>
            </div>

            <!-- Next Class Section -->
            <h3 class="mb-4 fw-bold">📚 Your Next Adventure</h3>
            <?php if ($student['status'] == 'active'): ?>
                
                    <?php if ($nextClass): ?>
                        
                            <div class="class-card">
                                <div class="row align-items-center">
                                    <div class="col-md-8">
                                        <h2 class="fw-bold mb-2"><?= ($nextClass['topic']) ?></h2>
                                        <p class="text-muted fs-5 mb-3">
                                            📅 <?= (date('l, F jS', strtotime($nextClass['class_date']))) ?> at <?= (date('g:i
                                            A', strtotime($nextClass['class_date'])))."
" ?>
                                        </p>
                                        <div class="d-flex gap-2">
                                            <span class="badge bg-light text-dark border">Science</span>
                                            <span class="badge bg-light text-dark border">1 Hour</span>
                                        </div>
                                    </div>
                                    <div class="col-md-4 text-md-end mt-3 mt-md-0">
                                        <?php if ($nextClass['zoom_link']): ?>
                                            
                                                <a href="<?= ($nextClass['zoom_link']) ?>" target="_blank"
                                                    class="btn btn-primary btn-lg px-4 shadow-sm">
                                                    🎥 Join Class
                                                </a>
                                            
                                            <?php else: ?>
                                                <button disabled class="btn btn-secondary btn-lg px-4">
                                                    Link Coming Soon
                                                </button>
                                            
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        
                        <?php else: ?>
                            <div class="info-card text-center py-5">
                                <div class="fs-1 mb-3">📭</div>
                                <h4>No Upcoming Classes</h4>
                                <p class="text-muted">Enjoy your free time! Check back later for updates.</p>
                            </div>
                        
                    <?php endif; ?>
                
                <?php else: ?>
                    <div class="alert alert-danger rounded-4 p-4">
                        <h4 class="alert-heading">⚠️ Account Inactive</h4>
                        <p class="mb-0">Your account is currently inactive. Please ask your parent to contact the
                            teacher!</p>
                    </div>
                
            <?php endif; ?>

        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>