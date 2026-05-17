<?php
// Config for development. Move secrets to environment variables in production.
return (function(){
    $config = [];
    $config['db'] = [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'name' => getenv('DB_NAME') ?: 'metafit',
        'user' => getenv('DB_USER') ?: 'root',
        'pass' => getenv('DB_PASS') ?: ''
    ];
    $config['jwt_secret'] = getenv('JWT_SECRET') ?: 'change-me-to-secure-random';
    return $config;
})();
