<?php

/**
 * Description of NAS
 * @author Ing.Douglas
 * @date 06/10/2016
 */
class NAS {

    //put your code here

    private $connection;
    private $sftp;

    public function __construct($host, $port) {

        $this->connection = ssh2_connect($host, $port);
        if (!$this->connection)
            throw new Exception("Could not connect to $host on port $port.");
    }

    public function login($username, $password) {
        if (!ssh2_auth_password($this->connection, $username, $password))
            throw new Exception("No se puede autenticar con el Servidor de Arcivos NAS " . __FILE__ . ":" . __LINE__);

        $this->sftp = ssh2_sftp($this->connection);
        if (!$this->sftp)
            throw new Exception("No se puede puede inicializar el SFTP " . __FILE__ . ":" . __LINE__);
    }
    

    public function mkdir($folder_name) {
        $sftp = $this->sftp;
        if (ssh2_sftp_mkdir( $sftp, $folder_name)) {
            return true;
        } else {
            return false;
        }
    }

    public function setContent($base64, $remote_file) {
        error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);
        $sftp = $this->sftp;
        $stream = @fopen("ssh2.sftp://" . intval($sftp) . $remote_file, 'w+');

        if (!$stream)
            throw new Exception("No se puede abir el archivo remoto $remote_file " . __FILE__ . ":" . __LINE__);

        if (@fwrite($stream, $base64) === false)
            throw new Exception("No se puede enviar el contenido al archivo remoto $remote_file " . __FILE__ . ":" . __LINE__);

        @fclose($stream);
    }

    public function uploadFile($local_file, $remote_file) {
        $sftp = $this->sftp;
        $stream = @fopen("ssh2.sftp://". intval($sftp) .$remote_file, 'w');

        if (!$stream)
            throw new Exception("Could not open file: $remote_file");

        $data_to_send = @file_get_contents($local_file);
        if ($data_to_send === false)
            throw new Exception("Could not open local file: $local_file.");

        if (@fwrite($stream, $data_to_send) === false)
            throw new Exception("Could not send data from file: $local_file.");

        @fclose($stream);
    }

    public function readDirectory($remote_file) {   
        error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);
        
        $sftp = $this->sftp;
        $stream = opendir("ssh2.sftp://$sftp$remote_file");
        
        $files = array();
        if (!$stream){
            return $files;
        }
 
        while (false !== ($file = readdir($stream))) {
            if ($file != '.' && $file != '..') {
                $files[] = $file;
            }
        }
        @fclose($stream);
        return $files;
    }
     
    
    public function deleteFile($remote_file){
        $sftp = $this->sftp; 
        ssh2_sftp_unlink($sftp, $remote_file );
    }

}
