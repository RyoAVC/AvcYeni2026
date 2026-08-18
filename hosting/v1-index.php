<?php
declare(strict_types=1);

$backend = 'http://127.0.0.1:4115';
$uri = $_SERVER['REQUEST_URI'] ?? '/';
if ($uri === '/v1' || str_starts_with($uri, '/v1/')) {
    $backend = 'http://127.0.0.1:4120';
}
if (str_starts_with($uri, '/.well-known/')) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not Found';
    exit;
}
if (!empty($_SERVER['REDIRECT_URL']) && strpos($uri, '/index.php') === 0) {
    $uri = $_SERVER['REDIRECT_URL'];
    if (!empty($_SERVER['QUERY_STRING']) && strpos($uri, '?') === false) {
        $uri .= '?' . $_SERVER['QUERY_STRING'];
    }
}
$url = $backend . $uri;

$headers = [];
foreach (getallheaders() ?: [] as $name => $value) {
    $lname = strtolower((string) $name);
    if (in_array($lname, ['host', 'content-length', 'connection', 'expect', 'transfer-encoding', 'accept-encoding'], true)) {
        continue;
    }
    $headers[] = $name . ': ' . $value;
}
$headers[] = 'Accept-Encoding: identity';
$headers[] = 'Host: yeni.avcieticaret.com';
$headers[] = 'X-Forwarded-Proto: ' . (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http');
$headers[] = 'X-Forwarded-For: ' . ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => $_SERVER['REQUEST_METHOD'] ?? 'GET',
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 60,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_ENCODING => 'identity',
]);

$body = file_get_contents('php://input');
if ($body !== false && $body !== '') {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

$response = curl_exec($ch);
if ($response === false) {
    http_response_code(502);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Uygulama su anda kapali. Biraz sonra tekrar deneyin.';
    exit;
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$rawHeaders = substr($response, 0, $headerSize);
$rawBody = substr($response, $headerSize);
http_response_code($status > 0 ? $status : 502);

foreach (preg_split("/\r\n|\n|\r/", $rawHeaders) as $line) {
    if ($line === '' || stripos($line, 'HTTP/') === 0) {
        continue;
    }
    $lname = strtolower(strtok($line, ':'));
    if (in_array($lname, ['transfer-encoding', 'connection', 'keep-alive', 'content-length', 'content-encoding'], true)) {
        continue;
    }
    header($line, false);
}

echo $rawBody;
