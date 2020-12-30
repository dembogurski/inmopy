<?php

/**
 * Description of ControlDistribucion
 * @author Ing.Douglas
 * @date 29/07/2016
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");
require_once("../Config.class.php");
                  
class ControlDistribucion {
    function __construct() {
        
        $t = new Y_Template("ControlDistribucion.html");      
        $t->Show("header");
        
        // Solo si es Toutch
        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $t->Set("images_url",$images_url);
        $t->Show("body"); 
        
        require_once("../utils/NumPad.class.php");            
        new NumPad();
    }        
}
new ControlDistribucion();
?>


