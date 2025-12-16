<?php
$url = "http://localhost/MiniProject/public/api/uploads/leave_docs/leave_2_1765871823.png";
echo "Attempting to fetch: $url\n";
$content = @file_get_contents($url);
if ($content === FALSE) {
    echo "Failed to fetch file. Check Apache config or URL.\n";
    $headers = @get_headers($url);
    print_r($headers);
} else {
    echo "Success! Content: $content\n";
}
?>