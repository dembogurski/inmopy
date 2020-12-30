<?php

/**
 * Description of OrdenesCompra
 * @author Ing.Douglas
 * @date 13/07/2017
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php"); 
require_once("../Functions.class.php");

class OrdenesCompra {
    function __construct() {
        $action = $_REQUEST['action'];          
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }        
    }     
    function main(){
        $t = new Y_Template("OrdenesCompra.html");
        $t->Show("header");

        $desde = $_REQUEST['desde'];
        $hasta = $_REQUEST['hasta'];
        $venc= $_REQUEST['venc'];
        $mes = $_REQUEST['mes'];
        $anio = $_REQUEST['anio'];
        $asoc = $_REQUEST['asoc'];
         
        
        $t->Set("mes",  strtoupper($mes));
        $t->Set("anio", $anio);
        $t->Set("vencimiento",$venc);
        $t->Set("desde",$desde);
        $t->Set("hasta",$hasta);
       
        $arrmeses = array("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
       
        //$ms = new My();
        //$ms->Query("select CardCode, LicTradNum,CardName from OCRD WHERE CreditCard = $asoc");
        
        echo "En desarrollo rediseñando para que funcione independiente de SAP";
        
        $t->Show("data_foot");
    }
}

function x(){
    
}   

new OrdenesCompra();
?>
