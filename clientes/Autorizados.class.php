<?php

/**
 * Description of Autorizados
 * @author Ing.Douglas
 * @date 26/05/2017
 */

require_once("../Y_Template.class.php");

class Autorizados {

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $t = new Y_Template("Autorizados.html");
        $t ->Show("headers");
        //echo "<script> window.open('img/autorizados/index.php'); </script>";
    }
}

 

new Autorizados();
?>
