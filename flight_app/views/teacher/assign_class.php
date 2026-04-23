<?php
?>
<div class="container-fluid px-0">
    <nav class="navbar navbar-expand-lg dashboard-header shadow-sm bg-white mb-4 rounded-bottom-4">
        <div class="container"><a class="navbar-brand fw-bold text-primary fs-4" href="/online_class/flight_app/teacher/dashboard">🎓 Future Scholars</a></div>
    </nav>
    <div class="container pb-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow-sm border-0 rounded-4">
                    <div class="card-body p-4">
                        <h3 class="fw-bold mb-4">Assign Classes to Student</h3>
                        <form method="POST" action="/online_class/flight_app/teacher/students/assign-class/<?= $studentId ?>">
                            <div class="list-group mb-4" style="max-height: 400px; overflow-y: auto;">
                                <?php foreach ($classes as $class): ?>
                                    <label class="list-group-item d-flex gap-2">
                                        <input class="form-check-input flex-shrink-0" type="checkbox" name="class_ids[]" value="<?= $class['id'] ?>">
                                        <span>
                                            <strong><?= $class['topic'] ?></strong><br>
                                            <small class="text-muted"><?= date('M d, Y h:i A', strtotime($class['class_date'])) ?></small>
                                        </span>
                                    </label>
                                <?php endforeach; ?>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Assign Selected</button>
                            <a href="/online_class/flight_app/teacher/students" class="btn btn-light w-100 mt-2">Cancel</a>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
