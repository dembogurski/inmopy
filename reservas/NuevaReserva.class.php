<?php

/**
 * Description of NuevaReserva
 * @author Ing.Douglas
 * @date 30/04/2015
 */


require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php"); 
require_once("../clientes/Clientes.class.php");

class NuevaReserva {

    function __construct() {
        
        $usuario = $_POST['usuario'];  
        $t = new Y_Template("Reserva.html");
        
        
        $t->Show("header");
        $t->Show("titulo_reserva");
        $t->Show("cabecera_reserva");
        
        
        $t->Show("area_carga_cab");
        //$t->Show("area_carga_data");
        $t->Show("area_carga_foot");
        
        
        $c = new Clientes();
        $c->getABM();
    }    
} 
new NuevaReserva();
?>
