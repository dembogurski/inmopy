<?php

/**
 * Description of Ajustes
 * @author Ing.Douglas
 * @date 23/02/2016
 */
  

require_once("../Y_Template.class.php");
require_once("../Config.class.php");

class Ajustes {
    function __construct(){
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $t = new Y_Template("Ajustes.html");        
         
        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $t->Set("images_url",$images_url);
        $t->Show("header");
        $t->Show("body"); 
        
        require_once("../utils/NumPad.class.php");            
        new NumPad();
    }
}

function checkPasswordAndTrustee() {
    require_once("../Y_DB_MySQL.class.php");
    $passw = $_REQUEST['passw']; 
    $suc = $_REQUEST['suc'];

    $db = new My();
    $crypt_pass = sha1($passw);

    $sql = "SELECT u.usuario FROM usuarios u, usuarios_x_grupo g WHERE u.usuario =  g.usuario AND u.estado ='Activo' AND id_grupo IN(11, 15,19) AND u.passw = '$crypt_pass' AND u.passw <> 'b436b5a8341e3c40d71230db30b2dc4799a88d31'  AND u.suc ='$suc'";

    $db->Query($sql);

    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $usuario = $db->Record['usuario'];
        echo $usuario;
    } else {
        echo "Permiso denegado";
    }
}

new Ajustes();

?>
