<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile - Future Scholars Hub</title>
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

        .profile-card {
            border: none;
            border-radius: 24px;
            box-shadow: var(--shadow-md);
            background: white;
            overflow: hidden;
        }

        .profile-header {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            padding: 3rem 2rem;
            text-align: center;
            color: white;
        }

        .profile-avatar {
            width: 100px;
            height: 100px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            margin: 0 auto 1rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
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
                        <li class="nav-item"><a class="nav-link" href="/student/announcements">News 📢</a></li>
                        <li class="nav-item"><a class="nav-link" href="/student/payment">Payment 💳</a></li>
                        <li class="nav-item"><a class="nav-link active" href="/student/profile">Profile 👤</a></li>
                        <li class="nav-item"><a class="nav-link text-danger" href="/logout">Logout 🚪</a></li>
                    </ul>
                </div>
            </div>
        </nav>

        <div class="container pb-5">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                    <h2 class="fw-bold mb-4 text-center">My Profile 👤</h2>

                    <div class="card profile-card mb-4">
                        <div class="profile-header">
                            <div class="profile-avatar">
                                <?= ($student['avatar'])."
" ?>
                            </div>
                            <h3 class="fw-bold mb-1"><?= ($student['name']) ?></h3>
                            <p class="mb-0 opacity-75">Grade <?= ($student['grade']) ?> Student</p>
                        </div>
                        <div class="card-body p-4">
                            <div class="mb-4">
                                <label class="text-muted small fw-bold text-uppercase">Mobile Number</label>
                                <p class="fs-5 fw-bold mb-0"><?= ($student['mobile']) ?></p>
                            </div>
                            <div class="mb-4">
                                <label class="text-muted small fw-bold text-uppercase">District</label>
                                <p class="fs-5 fw-bold mb-0"><?= ($student['district']) ?></p>
                            </div>
                            <div class="mb-0">
                                <label class="text-muted small fw-bold text-uppercase">Account Status</label>
                                <p class="fs-5 fw-bold mb-0 text-success">
                                    <?php if ($student['status'] == 'active'): ?>
                                        Active ✅
                                        <?php else: ?><span class="text-danger">Inactive ❌</span>
                                    <?php endif; ?>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="card profile-card">
                        <div class="card-body p-4">
                            <h5 class="fw-bold mb-3">Update Profile ✏️</h5>
                            <form method="POST" action="/student/profile" id="profileForm">
                                <h6 class="fw-bold mb-2">Choose Your Avatar</h6>
                                <div class="mb-4">
                                    <div class="avatar-selection border rounded p-3 bg-light">
                                        <!-- Boys -->
                                        <div class="d-flex flex-wrap justify-content-center gap-2 mb-3">
                                            <?php foreach ((['🦁', '🐯', '🦅', '🐺', '🦖', '🐉', '🦈', '🐊', '🦏', '🐘', '🦌', '🐗', '🦍', '🐆', '🦔', '🐢', '🦎', '🐙', '🦂', '🦞']?:[]) as $emoji): ?>
                                                <div class="avatar-option <?= ($student['avatar'] == $emoji ? 'selected' : '') ?>"
                                                    onclick="selectAvatar(this, '<?= ($emoji) ?>')">
                                                    <?= ($emoji)."
" ?>
                                                </div>
                                            <?php endforeach; ?>
                                        </div>
                                        <!-- Girls -->
                                        <div class="d-flex flex-wrap justify-content-center gap-2">
                                            <?php foreach ((['🌸', '🌺', '🌻', '🌷', '🌹', '🏵️', '💐', '🦋', '🐞', '🐝', '🦢', '🦩', '🦚', '🐰', '🦊', '🐨', '🐼', '🦄', '🌼', '🪷']?:[]) as $emoji): ?>
                                                <div class="avatar-option <?= ($student['avatar'] == $emoji ? 'selected' : '') ?>"
                                                    onclick="selectAvatar(this, '<?= ($emoji) ?>')">
                                                    <?= ($emoji)."
" ?>
                                                </div>
                                            <?php endforeach; ?>
                                        </div>
                                    </div>
                                    <input type="hidden" name="avatar" id="avatarInput" value="<?= ($student['avatar']) ?>">
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">New Password (Optional)</label>
                                    <input type="password" name="password" class="form-control form-control-lg"
                                        placeholder="Leave blank to keep current">
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary btn-lg">Save Changes 💾</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function selectAvatar(element, emoji) {
            // Remove selected class from all options
            document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
            // Add selected class to clicked element
            element.classList.add('selected');
            // Update hidden input
            document.getElementById('avatarInput').value = emoji;
            // Update header avatar preview
            document.querySelector('.profile-avatar').textContent = emoji;
        }
    </script>
</body>

</html>