<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
$_POST = ['email' => 'admin@lostfound.test', 'password' => 'password123'];
require_once __DIR__ . '/backend/src/bootstrap.php';
$auth = new AuthController();
$auth->login();
