<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Class History - Future Scholars Hub</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
            <a class="navbar-brand" href="/student/dashboard">🎓 Future Scholars Hub</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="/student/dashboard">Dashboard</a></li>
                    <li class="nav-item"><a class="nav-link" href="/student/payment">Payment</a></li>
                    <li class="nav-item"><a class="nav-link" href="/student/notes">Notes</a></li>
                    <li class="nav-item"><a class="nav-link" href="/student/classes">Classes</a></li>
                    <li class="nav-item"><a class="nav-link active" href="/student/history">History</a></li>
                    <li class="nav-item"><a class="nav-link" href="/student/recordings">Recordings</a></li>
                    <li class="nav-item"><a class="nav-link" href="/student/profile">Profile</a></li>
                    <li class="nav-item"><a class="nav-link" href="/logout">Logout</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <h2 class="mb-4">Class History</h2>
        
        <div class="row">
            <?php foreach (($classes?:[]) as $class): ?>
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title"><?= ($class['topic']) ?></h5>
                        <p class="card-text">
                            <strong>Date & Time:</strong> <?= (date('M d, Y H:i', strtotime($class['class_date']))) ?><br>
                            <?php if ($class['zoom_link']): ?>
                                <strong>Zoom Link:</strong> <a href="<?= ($class['zoom_link']) ?>" target="_blank"><?= ($class['zoom_link']) ?></a>
                                <?php else: ?><strong>Zoom Link:</strong> Not provided
                            <?php endif; ?>
                        </p>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
            <?php if (empty($classes)): ?>
                
                    <div class="col-12">
                        <div class="alert alert-info">No class history available.</div>
                    </div>
                
            <?php endif; ?>
        </div>
    </div>

    <footer class="bg-dark text-white text-center py-3 mt-5">
        <div class="container">
            <p class="mb-0">© 2024 Future Scholars Hub. All rights reserved.</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>

