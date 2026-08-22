<?php
declare(strict_types=1);

function avciForwardPrefixed(string $uri, string $prefix, string $backend): array
{
    $qPos = strpos($uri, '?');
    $path = $qPos === false ? $uri : substr($uri, 0, $qPos);
    $query = $qPos === false ? '' : substr($uri, $qPos);
    $prefixLen = strlen($prefix);
    $rest = $path === $prefix ? '' : substr($path, $prefixLen);
    $isFile = $rest !== '' && (bool) preg_match(
        '/\.(css|js|mjs|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|webmanifest|txt)$/i',
        $rest
    );
    $isStaticDir = str_starts_with($rest, '/assets/')
        || str_starts_with($rest, '/brand/')
        || str_starts_with($rest, '/story/')
        || str_starts_with($rest, '/bakim/');

    if ($isStaticDir || $isFile) {
        return [$backend, $rest . $query];
    }

    return [$backend, $path . $query];
}

function avciForwardUri(string $uri): array
{
    $fallback = 'http://127.0.0.1:4115';
    $qPos = strpos($uri, '?');
    $path = $qPos === false ? $uri : substr($uri, 0, $qPos);
    $query = $qPos === false ? '' : substr($uri, $qPos);

    if ($path === '/v1' || str_starts_with($path, '/v1/')) {
        return avciForwardPrefixed($uri, '/v1', 'http://127.0.0.1:4120');
    }
    if ($path === '/v2' || str_starts_with($path, '/v2/')) {
        return avciForwardPrefixed($uri, '/v2', 'http://127.0.0.1:4121');
    }

    return [$fallback, $path . $query];
}

$uri = $_SERVER['REQUEST_URI'] ?? '/';
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

[$backend, $forwardUri] = avciForwardUri($uri);
$url = $backend . $forwardUri;
header('X-Avc-Proxy-Backend: ' . $backend, false);
header('X-Avc-Proxy-Uri: ' . $forwardUri, false);

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
