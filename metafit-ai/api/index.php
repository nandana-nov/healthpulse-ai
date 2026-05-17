<?php
header('Content-Type: application/json');
// Minimal API entry. Real routes will be added under /api/*
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ($uri === '/api/health') {
    echo json_encode(['status'=>'ok','time'=>time()]);
    exit;
}
http_response_code(404);
echo json_encode(['error'=>'API route not found']);
