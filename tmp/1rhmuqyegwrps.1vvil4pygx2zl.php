<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Details - Future Scholars Hub</title>
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
                    <li class="nav-item"><a class="nav-link active" href="/teacher/students">Students</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/classes">Classes</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/recordings">Recordings</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/payments">Payments</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/notes">Notes</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/announcements">Announcements</a></li>
                    <li class="nav-item"><a class="nav-link" href="/teacher/history">History</a></li>
                    <li class="nav-item"><a class="nav-link" href="/logout">Logout</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Student: <?= ($student['name']) ?></h2>
            <a href="/teacher/students" class="btn btn-secondary">Back to Students</a>
        </div>
        
        <!-- Student Information -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Mobile:</strong> <?= ($student['mobile']) ?></p>
                        <p><strong>Grade:</strong> <?= ($student['grade']) ?></p>
                        <p><strong>Gender:</strong> <?= ($student['gender']) ?></p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>District:</strong> <?= ($student['district']) ?></p>
                        <p><strong>Status:</strong> 
                            <span class="badge <?= ($student['status'] == 'active' ? 'bg-success' : 'bg-secondary') ?>">
                                <?= ($student['status'])."
" ?>
                            </span>
                        </p>
                        <p><strong>Payment Status (<?= ($student['current_month']) ?> <?= ($student['current_year']) ?>):</strong> 
                            <span class="badge <?= ($student['payment_status'] == 'paid' ? 'bg-success' : 'bg-danger') ?>">
                                <?= ($student['payment_status'] == 'paid' ? 'Paid' : 'Not Paid')."
" ?>
                            </span>
                        </p>
                        <p><strong>Created:</strong> <?= (date('M d, Y', strtotime($student['created_at']))) ?></p>
                    </div>
                </div>
                <?php if ($student['description']): ?>
                    
                        <hr>
                        <p><strong>Description:</strong> <?= ($student['description']) ?></p>
                    
                <?php endif; ?>
                <div class="mt-3">
                    <a href="/teacher/students/edit/<?= ($student['id']) ?>" class="btn btn-warning">Edit Student</a>
                </div>
            </div>
        </div>
        
        <!-- Create New Items -->
        <div class="row mb-4">
            <!-- Create Class -->
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Create Class</h5>
                    </div>
                    <div class="card-body">
                        <form method="POST" action="/teacher/students/view/<?= ($student['id']) ?>/class">
                            <div class="mb-3">
                                <label class="form-label">Topic *</label>
                                <input type="text" name="topic" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Date & Time *</label>
                                <input type="datetime-local" name="class_date" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Zoom Link (Optional)</label>
                                <input type="url" name="zoom_link" class="form-control" placeholder="https://zoom.us/j/...">
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Create & Assign</button>
                        </form>
                    </div>
                </div>
            </div>
            
            <!-- Create Note -->
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h5 class="mb-0">Create Note</h5>
                    </div>
                    <div class="card-body">
                        <form method="POST" action="/teacher/students/view/<?= ($student['id']) ?>/note">
                            <div class="mb-3">
                                <label class="form-label">Title *</label>
                                <input type="text" name="title" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Link (Optional)</label>
                                <input type="url" name="link" class="form-control" placeholder="https://...">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Details (Optional)</label>
                                <textarea name="details" class="form-control" rows="3" placeholder="Enter details..."></textarea>
                            </div>
                            <button type="submit" class="btn btn-info w-100">Create & Assign</button>
                        </form>
                    </div>
                </div>
            </div>
            
            <!-- Create Recording -->
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0">Create Recording</h5>
                    </div>
                    <div class="card-body">
                        <form method="POST" action="/teacher/students/view/<?= ($student['id']) ?>/recording">
                            <div class="mb-3">
                                <label class="form-label">Topic *</label>
                                <input type="text" name="topic" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Link *</label>
                                <input type="url" name="link" class="form-control" placeholder="https://..." required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description (Optional)</label>
                                <textarea name="description" class="form-control" rows="3" placeholder="Enter description..."></textarea>
                            </div>
                            <button type="submit" class="btn btn-success w-100">Create & Assign</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Assigned Items -->
        <div class="row">
            <!-- Assigned Classes -->
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Assigned Classes (<?= (count($classes)) ?>)</h5>
                    </div>
                    <div class="card-body" style="max-height: 400px; overflow-y: auto;">
                        <?php foreach (($classes?:[]) as $class): ?>
                        <div class="card mb-2">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-1"><?= ($class['topic']) ?></h6>
                                <small class="text-muted">
                                    <?= (date('M d, Y H:i', strtotime($class['class_date'])))."
" ?>
                                </small>
                                <?php if ($class['zoom_link']): ?>
                                    
                                        <br><a href="<?= ($class['zoom_link']) ?>" target="_blank" class="btn btn-sm btn-link p-0">Zoom Link</a>
                                    
                                <?php endif; ?>
                            </div>
                        </div>
                        <?php endforeach; ?>
                        <?php if (empty($classes)): ?>
                            
                                <div class="alert alert-info mb-0">No classes assigned yet.</div>
                            
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            
            <!-- Assigned Notes -->
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Assigned Notes (<?= (count($notes)) ?>)</h5>
                    </div>
                    <div class="card-body" style="max-height: 400px; overflow-y: auto;">
                        <?php foreach (($notes?:[]) as $note): ?>
                        <div class="card mb-2">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-1"><?= ($note['title']) ?></h6>
                                <?php if ($note['link']): ?>
                                    
                                        <small><a href="<?= ($note['link']) ?>" target="_blank">Link</a></small><br>
                                    
                                <?php endif; ?>
                                <?php if ($note['details']): ?>
                                    
                                        <small class="text-muted"><?= ($note['details']) ?></small>
                                    
                                <?php endif; ?>
                            </div>
                        </div>
                        <?php endforeach; ?>
                        <?php if (empty($notes)): ?>
                            
                                <div class="alert alert-info mb-0">No notes assigned yet.</div>
                            
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            
            <!-- Assigned Recordings -->
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Assigned Recordings (<?= (count($recordings)) ?>)</h5>
                    </div>
                    <div class="card-body" style="max-height: 400px; overflow-y: auto;">
                        <?php foreach (($recordings?:[]) as $recording): ?>
                        <div class="card mb-2">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-1"><?= ($recording['topic']) ?></h6>
                                <small><a href="<?= ($recording['link']) ?>" target="_blank">Link</a></small>
                                <?php if ($recording['description']): ?>
                                    
                                        <br><small class="text-muted"><?= ($recording['description']) ?></small>
                                    
                                <?php endif; ?>
                            </div>
                        </div>
                        <?php endforeach; ?>
                        <?php if (empty($recordings)): ?>
                            
                                <div class="alert alert-info mb-0">No recordings assigned yet.</div>
                            
                        <?php endif; ?>
                    </div>
                </div>
            </div>
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

