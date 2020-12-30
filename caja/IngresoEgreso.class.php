<?php

/**
 * Description of IngresoEgreso
 * @author Ing.Douglas
 * @date 28/04/2017
 */

require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class IngresoEgreso {
    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }
    function main(){
        $t = new Y_Template("IngresoEgreso.html");
        $t->Show("header");
        $hoy = date("d/m/Y");
        $t->Set("hoy", $hoy);
        
        $db = new My();
        
        $db->Query("SELECT m_cod AS moneda, m_descri FROM monedas where m_cod != 'Y$'");

        $monedas = "";
        while ($db->NextRecord()) {
            $moneda = $db->Record['moneda'];
            $m_descri = $db->Record['m_descri'];
            $monedas .="<option value='$moneda'>$moneda</option>";
        }
        $t->Set("monedas", $monedas);
        // Sucursales
        
        $db->Query("SELECT id_concepto ,descrip ,tipo FROM conceptos WHERE id_concepto in(13,14,15,16,17)");
        $conceptos = "";
        while($db->NextRecord()){
            $id = $db->Record['id_concepto'];
            $concepto = $db->Record['descrip'];
            $tipo = $db->Record['tipo'];
            $conceptos.="<option value='$id' data-tipo='$tipo' >$concepto</option>";                         
        }
        $t->Set("conceptos",$conceptos);
        $t->Show("body");
    }
}

function generarMovimiento(){
    $usuario  = $_REQUEST['usuario'];
    $moneda = $_REQUEST['moneda'];
    $id_concepto = $_REQUEST['concepto'];
    $tipo = $_REQUEST['tipo'];
    $monto = $_REQUEST['monto'];
    $cotiz = $_REQUEST['cotiz'];
    $monto_ref = $_REQUEST['monto_ref'];
    $suc = $_REQUEST['suc'];
    $fecha = $_REQUEST['fecha'];
    
    $entrada = 0;
    $salida = 0;
    $entrada_ref = 0;
    $salida_ref = 0;
    
    if($tipo == "E"){
        $entrada = $monto;
        $entrada_ref = $monto_ref;
    }else{
        $salida = $monto;
        $salida_ref = $monto_ref;
    }        
    
    $db = new My();
    
    $mov = "INSERT INTO  efectivo( id_concepto,  m_cod, usuario, entrada, salida, cotiz, entrada_ref, salida_ref, fecha_reg, fecha, hora, suc, estado, e_sap)
    VALUES ($id_concepto, '$moneda', '$usuario', $entrada, $salida, $cotiz, $entrada_ref, $salida_ref, CURRENT_DATE, '$fecha', CURRENT_TIME, '$suc', 'Pendiente', NULL);";
            
    $db->Query($mov);
    
}


new IngresoEgreso();
?>
