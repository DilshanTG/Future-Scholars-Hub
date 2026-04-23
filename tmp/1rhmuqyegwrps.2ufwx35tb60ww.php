<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Announcements History - Future Scholars Hub</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
            <a class="navbar-brand" href="/teacher/dashboard">🎓 Future Scholars Hub</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="/teacher/dashboard">Dashboard</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/students">Students</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/classes">Classes</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/recordings">Recordings</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/payments">Payments</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/notes">Notes</a></li>
                    <li class="nav-item"><a class="nav-link active" href="/teacher/announcements">Announcements</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/history">History</a></li>
                    <li class="nav-item"><a class="nav-link" href="/logout">Logout</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Announcements History</h2>
            <div>
                <a href="/teacher/announcements" class="btn btn-primary">Active Announcements</a>
                <a href="/teacher/announcements/add" class="btn btn-success">Create New</a>
            </div>
        </div>

        <div class="row">
            <?php foreach (($announcements?:[]) as $announcement): ?>
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0"><?= ($announcement['title']) ?></h5>
                            <?php if ($announcement['expire_date'] && $announcement['expire_date'] < date('Y-m-d H:i:s')): ?>
                                
                                    <span class="badge bg-secondary">Expired</span>
                                
                                <?php else: ?>
                                    <?php if ($announcement['expire_date']): ?>
                                        
                                            <span class="badge bg-success">Active</span>
                                        
                                        <?php else: ?>
                                            <span class="badge bg-primary">Active</span>
                                        
                                    <?php endif; ?>
                                
                            <?php endif; ?>
                        </div>
                        <p class="card-text"><?= ($announcement['message']) ?></p>
                        <p class="text-muted mb-2">
                            <small>
                                <?php if ($announcement['all_students'] > 0): ?>
                                    📢 Sent to: All Students
                                    <?php else: ?>📢 Sent to: <?= ($announcement['specific_students']) ?> student(s)
                                <?php endif; ?>
                            </small>
                        </p>
                        <p class="text-muted mb-0">
                            <small>
                                📅 Created: <?= (date('M d, Y H:i', strtotime($announcement['created_at']))) ?><br>
                                <?php if ($announcement['expire_date']): ?>
                                    
                                        ⏰ Expires: <?= (date('M d, Y H:i', strtotime($announcement['expire_date'])))."
" ?>
                                        <?php if ($announcement['expire_date'] < date('Y-m-d H:i:s')): ?>
                                             <span class="text-danger">(Expired)</span>
                                        <?php endif; ?>
                                    
                                    <?php else: ?>⏰ No expiration
                                <?php endif; ?>
                            </small>
                        </p>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
            <?php if (empty($announcements)): ?>
                
                    <div class="col-12">
                        <div class="alert alert-info">No announcements found.</div>
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

