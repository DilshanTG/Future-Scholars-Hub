<!-- flight_app/views/layout.php -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($title) ? $title : 'Future Scholars Hub' ?></title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link href="/online_class/flight_app/public/css/style.css" rel="stylesheet">
    
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <style>
        body { font-family: 'Outfit', sans-serif; }
    </style>
    
    <?php if (isset($head_content)) echo $head_content; ?>
</head>
<body>

    <?= $body_content ?>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- SweetAlert Logic -->
    <?php if (isset($message)): ?>
    <script>
        Swal.fire({
            icon: '<?= $message['type'] ?>', // success, error, warning, info
            title: '<?= $message['title'] ?>',
            text: '<?= $message['text'] ?>'
        });
    </script>
    <?php endif; ?>
    
</body>
</html>
