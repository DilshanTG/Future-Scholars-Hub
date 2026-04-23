<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Announcements - Future Scholars Hub</title>
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

        .announcement-card {
            border: none;
            border-radius: 20px;
            box-shadow: var(--shadow-sm);
            background: white;
            border-left: 5px solid var(--accent-color);
        }
    </style>
</head>

<body>
    <div class="container-fluid px-0">
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg dashboard-header">
            <div class="container">
                <a class="navbar-brand fw-bold text-primary fs-4" href="/student/dashboard">🎓 Future Scholars</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto gap-2">
                        <li class="nav-item"><a class="nav-link" href="/student/dashboard">Dashboard 🏠</a></li>
                        <li class="nav-item"><a class="nav-link" href="/student/classes">Classes 📚</a></li>
                        <li class="nav-item"><a class="nav-link" href="/student/recordings">Recordings 🎥</a></li>
                        <li class="nav-item"><a class="nav-link" href="/student/notes">Notes 📝</a></li>
                        <li class="nav-item"><a class="nav-link active" href="/student/announcements">News 📢</a></li>
                        <li class="nav-item"><a class="nav-link" href="/student/payment">Payment 💳</a></li>
                        <li class="nav-item"><a class="nav-link" href="/student/profile">Profile 👤</a></li>
                        <li class="nav-item"><a class="nav-link text-danger" href="/logout">Logout 🚪</a></li>
                    </ul>
                </div>
            </div>
        </nav>

        <div class="container pb-5">
            <h2 class="fw-bold mb-4 px-2">Latest News 📢</h2>

            <div class="row">
                <?php foreach (($announcements?:[]) as $announcement): ?>
                    <div class="col-md-6 mb-3">
                        <div class="card announcement-card h-100">
                            <div class="card-body p-4">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <h5 class="card-title fw-bold"><?= ($announcement['title']) ?></h5>
                                    <span class="badge bg-light text-muted border">
                                        <?= (date('M d', strtotime($announcement['created_at'])))."
" ?>
                                    </span>
                                </div>
                                <p class="card-text text-muted"><?= ($announcement['message']) ?></p>

                                <?php if ($announcement['expire_date']): ?>
                                    
                                        <div class="mt-3 pt-2 border-top text-danger small">
                                            ⏰ Valid until: <?= (date('M d, Y', strtotime($announcement['expire_date'])))."
" ?>
                                        </div>
                                    
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>

                <?php if (empty($announcements)): ?>
                    
                        <div class="col-12">
                            <div class="alert alert-light text-center py-5 rounded-4 shadow-sm">
                                <div class="fs-1 mb-3">📭</div>
                                <h4>No news right now</h4>
                                <p class="text-muted">Check back later for updates!</p>
                            </div>
                        </div>
                    
                <?php endif; ?>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>