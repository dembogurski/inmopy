<?php

/**
 * Description of NotasCredito
 * @author Ing.Douglas
 * @date 27/06/2015
 */

require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class NotasCredito {
    function __construct(){
        //$session = $_POST['session'];
        $usuario = $_POST['usuario']; 
        $hoy = date("Y-m-d");
        
        $db = new My();
        $db->Query("SELECT valor FROM parametros WHERE clave = 'vent_det_limit'");
        $db->NextRecord();
        $limite_detalles = $db->Record['valor'];        
        
        $t = new Y_Template("NotasCredito.html");
         
        $t->Set("fecha_hoy",$hoy);
        
        $t->Show("header");
        $t->Show("titulo_nota_credito");
        $t->Show("cabecera_nota_credito");
        
        
        $t->Show("area_carga_cab"); 
        $t->Show("area_carga_foot");
    }
}
new NotasCredito();
?>
