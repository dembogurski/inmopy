<?php

/**
 * Description of Planos
 * @author Ing.Douglas
 * @date 13/12/2018
 */
require_once("../../Y_Template.class.php");


class Planos {
    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $template = $_REQUEST['template'];
        $suc = $_REQUEST['suc'];
        $usuario = $_REQUEST['usuario'];
        $t = new Y_Template("$suc/$template.html");
        $t->Set("usuario",$usuario);        
        $t->Set("suc",$suc);        
        $t->Show("header");
        $t->Show("body");
    }
     
}

new Planos();
?>

