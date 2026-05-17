<?php
// Simple front controller for MVC skeleton
require __DIR__.'/config/config.php';
require __DIR__.'/models/User.php';

// Basic routing
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ($uri === '/' || $uri === '/index.php') {
    echo json_encode(['status'=>'ok','message'=>'MetaFit AI backend running']);
    exit;
}

http_response_code(404);
echo json_encode(['error'=>'Not Found']);
