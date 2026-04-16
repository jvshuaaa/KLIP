<?php
header('Content-Type: text/plain');
echo "PHP_BINARY=" . PHP_BINARY . "\n";
echo "PHP_VERSION=" . PHP_VERSION . "\n";
echo "PHP_INI=" . php_ini_loaded_file() . "\n";
echo "LOADED_EXTENSIONS=\n" . implode(',', get_loaded_extensions()) . "\n";
echo "PDO_DRIVERS=\n" . implode(',', PDO::getAvailableDrivers()) . "\n";
