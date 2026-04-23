<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Settings - Future Scholars Hub</title>
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
    </style>
</head>

<body>
    <div class="container-fluid px-0">
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg dashboard-header">
            <div class="container">
                <a class="navbar-brand fw-bold text-primary fs-4" href="/teacher/dashboard">
                    <span class="me-2"><?= ($SESSION['user']['avatar']) ?></span>Future Scholars
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto gap-2">
                        <li class="nav-item"><a class="nav-link" href="/teacher/dashboard">Dashboard</a></li>
                        <li class="nav-item"><a class="nav-link" href="/teacher/students">Students 👶</a></li>
                        <li class="nav-item"><a class="nav-link" href="/teacher/classes">Classes 📚</a></li>
                        <li class="nav-item"><a class="nav-link" href="/teacher/recordings">Recordings 🎥</a></li>
                        <li class="nav-item"><a class="nav-link" href="/teacher/notes">Notes 📝</a></li>
                        <li class="nav-item"><a class="nav-link" href="/teacher/announcements">News 📢</a></li>
                        <li class="nav-item"><a class="nav-link active" href="/teacher/settings">Settings ⚙️</a></li>
                        <li class="nav-item"><a class="nav-link text-danger" href="/logout">Logout 🚪</a></li>
                    </ul>
                </div>
            </div>
        </nav>

        <div class="container pb-5">
            <div class="row justify-content-center">
                <div class="col-lg-6">
                    <div class="settings-card bg-white">
                        <div class="settings-header">
                            <div class="avatar-circle avatar-lg mx-auto mb-3 bg-white text-primary shadow">
                                <?= ($user['avatar'])."
" ?>
                            </div>
                            <h3 class="fw-bold mb-0"><?= ($user['username']) ?></h3>
                            <p class="mb-0 opacity-75">Teacher Profile</p>
                        </div>
                        <div class="card-body p-4 p-md-5">
                            <form method="POST" action="/teacher/settings/update" id="settingsForm">
                                <h5 class="fw-bold mb-3">Choose Your Avatar</h5>
                                <div class="mb-4">
                                    <div class="avatar-selection border rounded p-3 bg-light">
                                        <!-- Boys -->
                                        <div class="d-flex flex-wrap justify-content-center gap-2 mb-3">
                                            <?php foreach ((['🦁', '🐯', '🦅', '🐺', '🦖', '🐉', '🦈', '🐊', '🦏', '🐘', '🦌', '🐗', '🦍', '🐆', '🦔', '🐢', '🦎', '🐙', '🦂', '🦞']?:[]) as $emoji): ?>
                                                <div class="avatar-option <?= ($user['avatar'] == $emoji ? 'selected' : '') ?>"
                                                    onclick="selectAvatar(this, '<?= ($emoji) ?>')">
                                                    <?= ($emoji)."
" ?>
                                                </div>
                                            <?php endforeach; ?>
                                        </div>
                                        <!-- Girls -->
                                        <div class="d-flex flex-wrap justify-content-center gap-2">
                                            <?php foreach ((['🌸', '🌺', '🌻', '🌷', '🌹', '🏵️', '💐', '🦋', '🐞', '🐝', '🦢', '🦩', '🦚', '🐰', '🦊', '🐨', '🐼', '🦄', '🌼', '🪷']?:[]) as $emoji): ?>
                                                <div class="avatar-option <?= ($user['avatar'] == $emoji ? 'selected' : '') ?>"
                                                    onclick="selectAvatar(this, '<?= ($emoji) ?>')">
                                                    <?= ($emoji)."
" ?>
                                                </div>
                                            <?php endforeach; ?>
                                        </div>
                                    </div>
                                    <input type="hidden" name="avatar" id="avatarInput" value="<?= ($user['avatar']) ?>">
                                </div>

                                <hr class="my-4">

                                <h5 class="fw-bold mb-3">Change Password</h5>
                                <div class="mb-3">
                                    <label class="form-label text-muted small text-uppercase fw-bold">New
                                        Password</label>
                                    <input type="password" class="form-control form-control-lg bg-light border-0"
                                        name="password" placeholder="Leave blank to keep current">
                                </div>

                                <div class="d-grid mt-5">
                                    <button type="submit" class="btn btn-primary btn-lg rounded-pill shadow-sm">
                                        Save Changes 💾
                                    </button>
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
            document.querySelector('.settings-header .avatar-circle').textContent = emoji;
        }

        // Bubble Popup Logic
        function showPopup(message, type = 'success') {
            const popup = document.createElement('div');
            popup.className = 'bubble-popup';
            popup.innerHTML = `
                <div class="bubble-icon">${type === 'success' ? '🎉' : '⚠️'}</div>
                <div class="bubble-content">
                    <h4>${type === 'success' ? 'Success!' : 'Oops!'}</h4>
                    <p>${message}</p>
                </div>
                <button class="bubble-close" onclick="this.parentElement.remove()">✕</button>
            `;
            document.body.appendChild(popup);

            // Trigger animation
            setTimeout(() => popup.classList.add('show'), 10);

            // Auto remove
            setTimeout(() => {
                popup.classList.remove('show');
                setTimeout(() => popup.remove(), 500);
            }, 3000);
        }

        // Show popup on form submit (demo)
        document.getElementById('settingsForm').addEventListener('submit', function (e) {
            // In a real app, this would be handled after server response
            // For now, we let the form submit normally
        });
    </script>
</body>

</html>