<?php
try {
    echo "Testing SQLite...\n";
    $pdo = new PDO('sqlite::memory:');
    echo "SUCCESS: SQLite PDO driver is working!\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
