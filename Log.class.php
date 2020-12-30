<?php

include_once 'Config.class.php';

class Log {
    
    private $config;
    // Name of the file where the message logs will be appended.
    private $LOGFILENAME;
    // Define the separator for the fields. Default is comma (,).
    private $SEPARATOR;
    // headers
    private $HEADERS;

    // Default tag.
    const DEFAULT_TAG = '--';

    function __construct($separator = ',') {
        $this->config = new Config();
        $this->LOGFILENAME = $this->config->getLogFile();
        $this->SEPARATOR = $separator;
        $this->HEADERS = 'DATETIME' . $this->SEPARATOR .
                'ERRORLEVEL' . $this->SEPARATOR .
                'TAG' . $this->SEPARATOR .
                'VALUE' . $this->SEPARATOR .
                'LINE' . $this->SEPARATOR .
                'FILE';
    }

    // Private method that will write the text logs into the $LOGFILENAME.
    private function log($errorlevel = 'INFO', $value = '', $tag) {

        $datetime = date("Y-m-d H:i:s");
        if (!file_exists($this->LOGFILENAME)) {
            $headers = $this->HEADERS . "\n";
        }

        $fd = fopen($this->LOGFILENAME, "a");

        if (@$headers) {
            fwrite($fd, $headers);
        }

        $debugBacktrace = debug_backtrace();
        $line = $debugBacktrace[1]['line'];
        $file = $debugBacktrace[1]['file'];

        $entry = array($datetime, $errorlevel, $tag, $value, $line, $file);

        fputcsv($fd, $entry, $this->SEPARATOR);

        fclose($fd);
    }

    // Function to write not technical INFOrmation messages that will be written into $LOGFILENAME.
    public function info($value = '', $tag = self::DEFAULT_TAG) {

        self::log('INFO', $value, $tag);
    }

    // Function to write WARNING messages that will be written into $LOGFILENAME.
    // These messages are non-fatal errors, so, the script will work properly even
    // if WARNING errors appears, but this is a thing that you must ponderate about.
    public function warning($value = '', $tag = self::DEFAULT_TAG) {

        self::log('WARNING', $value, $tag);
    }

    // Function to write ERROR messages that will be written into $LOGFILENAME.
    // These messages are fatal errors. Your script will NOT work properly if an ERROR happens, right?
    public function error($value = '', $tag = self::DEFAULT_TAG) {

        self::log('ERROR', $value, $tag);
    }

    // Function to write DEBUG messages that will be written into $LOGFILENAME.
    // DEBUG messages are highly technical issues, like an SQL query or result of it.
    public function debug($value = '', $tag = self::DEFAULT_TAG) {

        self::log('DEBUG', $value, $tag);
    }

}

?>

