<?php
// flight_app/views/login.php
?>
<style>
    body {
        background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .login-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 24px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        overflow: hidden;
        max-width: 900px;
        width: 90%;
        display: flex;
        flex-direction: row;
    }
    .login-image {
        flex: 1;
        background: url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80') no-repeat center center;
        background-size: cover;
        display: none;
    }
    .login-form-container {
        flex: 1;
        padding: 3rem;
    }
    @media (min-width: 768px) {
        .login-image { display: block; }
    }
    .brand-title {
        font-size: 2rem;
        color: var(--primary-color);
        margin-bottom: 0.5rem;
        text-align: center;
    }
    .brand-subtitle {
        text-align: center;
        color: var(--text-muted);
        margin-bottom: 2rem;
    }
    .form-label {
        font-weight: 600;
        color: var(--text-color);
    }
</style>

<div class="login-card animate-fade-in">
    <div class="login-image"></div>
    <div class="login-form-container">
        <h1 class="brand-title">🎓 Future Scholars</h1>
        <p class="brand-subtitle">Welcome back, little genius!</p>
        
        <?php if(isset($error)): ?>
            <div class="alert alert-danger rounded-pill text-center"><?= $error ?></div>
        <?php endif; ?>

        <form method="POST" action="/online_class/flight_app/login">
            <div class="mb-4">
                <label class="form-label">I am a...</label>
                <select name="user_type" class="form-select" required>
                    <option value="student">Student 🎒</option>
                    <option value="teacher">Teacher 👩‍🏫</option>
                </select>
            </div>
            <div class="mb-4">
                <label class="form-label">Username / Mobile</label>
                <input type="text" name="username" class="form-control" placeholder="Enter your username" required>
            </div>
            <div class="mb-4">
                <label class="form-label">Password</label>
                <input type="password" name="password" class="form-control" placeholder="Enter your password" required>
            </div>
            <button type="submit" class="btn btn-primary w-100 btn-lg shadow-sm">Let's Go! 🚀</button>
        </form>
        
        <div class="mt-4 text-center">
            <small class="text-muted">Need help? Ask your teacher!</small>
        </div>
    </div>
</div>
