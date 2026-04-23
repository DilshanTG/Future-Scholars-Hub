<?php
// flight_app/views/teacher/settings.php
?>
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
                    <li class="nav-item"><a class="nav-link active" href="/online_class/flight_app/teacher/settings">Settings ⚙️</a></li>
                    <li class="nav-item"><a class="nav-link text-danger" href="/online_class/flight_app/logout">Logout 🚪</a></li>
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
                            <?= $user['avatar'] ?>
                        </div>
                        <h3 class="fw-bold mb-0"><?= $user['username'] ?></h3>
                        <p class="mb-0 opacity-75">Teacher Profile</p>
                    </div>
                    <div class="card-body p-4 p-md-5">
                        <form method="POST" action="/online_class/flight_app/teacher/settings/update" id="settingsForm">
                            <h5 class="fw-bold mb-3">Choose Your Avatar</h5>
                            <div class="mb-4">
                                <div class="avatar-selection border rounded p-3 bg-light">
                                    <!-- Boys -->
                                    <div class="d-flex flex-wrap justify-content-center gap-2 mb-3">
                                        <?php 
                                        $boys = ['🦁', '🐯', '🦅', '🐺', '🦖', '🐉', '🦈', '🐊', '🦏', '🐘', '🦌', '🐗', '🦍', '🐆', '🦔', '🐢', '🦎', '🐙', '🦂', '🦞'];
                                        foreach ($boys as $emoji): 
                                        ?>
                                            <div class="avatar-option <?= $user['avatar'] == $emoji ? 'selected' : '' ?>"
                                                onclick="selectAvatar(this, '<?= $emoji ?>')">
                                                <?= $emoji ?>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>
                                    <!-- Girls -->
                                    <div class="d-flex flex-wrap justify-content-center gap-2">
                                        <?php 
                                        $girls = ['🌸', '🌺', '🌻', '🌷', '🌹', '🏵️', '💐', '🦋', '🐞', '🐝', '🦢', '🦩', '🦚', '🐰', '🦊', '🐨', '🐼', '🦄', '🌼', '🪷'];
                                        foreach ($girls as $emoji): 
                                        ?>
                                            <div class="avatar-option <?= $user['avatar'] == $emoji ? 'selected' : '' ?>"
                                                onclick="selectAvatar(this, '<?= $emoji ?>')">
                                                <?= $emoji ?>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                                <input type="hidden" name="avatar" id="avatarInput" value="<?= $user['avatar'] ?>">
                            </div>

                            <hr class="my-4">

                            <h5 class="fw-bold mb-3">Change Password</h5>
                            <div class="mb-3">
                                <label class="form-label text-muted small text-uppercase fw-bold">New Password</label>
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
</script>
