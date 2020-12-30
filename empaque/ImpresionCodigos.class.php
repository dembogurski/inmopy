<?php

/**
 * Description of ImpresionCodigos
 * @author Ing.Douglas
 * @date 19/10/2015
 */
require_once("../Y_Template.class.php");
require_once("../Config.class.php");
require_once("../Functions.class.php");

class ImpresionCodigos {

    function __construct() {
        $t = new Y_Template("ImpresionCodigos.html");
        
        $usuario = $_REQUEST['usuario'];  
        $f = new Functions();   
        $permiso = $f->chequearPermiso("2.3.1", $usuario); // Acceso al Menu Recepcion de Mercaderias Nuevo
        
        if($permiso != '---'){
           $t->Set("stacks","inline");                
        }else{
           $t->Set("stacks","none");    
        } 
        
        $t->Show("header");
        $c = new Config();
        $host = $c->getNasHost();
        $path = $c->getNasFolder();
        $images_url = "http://$host/$path";
        $t->Set("images_url", $images_url);
        $t->Show("body");
    }

}

new ImpresionCodigos();
?>

