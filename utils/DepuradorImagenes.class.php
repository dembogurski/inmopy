<?php

 

/**
 * Description of DepuradorImagenes
 *
 * @author Doglas
 */

require_once ('../Config.class.php');
require_once('NAS.class.php');

class DepuradorImagenes {
    function __construct() {
        $action = $_REQUEST['action']; 
        if (function_exists($action)) {            
            call_user_func($action);
        } else {            
            $this->main();
        }
    }
    function main() {
        echo "Inicio";
        $c = new Config();
        $username = $c->getNasUser();
        $password = $c->getNasPassw();
        $path = $c->getNasPath();
        $folder = "prod_images";
        $port = $c->getNasPort();
        $host = $c->getNasHost(); 
        $host = "192.168.2.252";
        
        $nas = new NAS($host, $port);
        $nas->login($username, $password);
        
        $full_path = $path . "$folder";
        $arr = $nas->readDirectory($full_path);
        
        echo $full_path;
        //$files = array();
        foreach ($arr as $file) {
             echo "$file <br>";
        }
        
    }
}

new DepuradorImagenes();
?>

