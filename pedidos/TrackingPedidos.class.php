<?php

/**
 * Description of TrackingPedidos
 * @author Ing.Douglas
 * @date 30/11/2015
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../Functions.class.php");

class TrackingPedidos {
   function __construct(){
        $t = new Y_Template("TrackingPedidos.html");
        $t->Show("headers");
        $hoy = date("d-m-Y");
        $t->Set("hoy",$hoy);
        $usuario = $_POST['usuario'];  
        $fn = new Functions(); 
        $trustee = $fn->chequearPermiso("1.5.5", $usuario); // Permiso para Filtrar todos los Usuarios
            
        if($trustee != '---'){
           $t->Set("filtrar_todos_los_usuarios","inline");                
        }else{
           $t->Set("filtrar_todos_los_usuarios","none");    
        } 
         
        $t->Show("filters");
        $t->Show("pedidos_nacionales");
        
        //$t->Set("hoy",$hoy);
   }
}
new TrackingPedidos();
?>



