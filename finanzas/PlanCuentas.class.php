<?php

/**
 * Description of PlanCuentas
 *
 * @author Doglas
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class PlanCuentas {

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $t = new Y_Template("PlanCuentas.html");
        $t->Show("header");
        $db = new My();

        $db->Query("SELECT m_cod , m_descri FROM monedas");
        $monedas = "";
        while ($db->NextRecord()) {
            $moneda = $db->Record['m_cod'];
            $nombre_moneda = $db->Record['m_descri'];
            $monedas .= "<option value='$moneda'>$moneda</option>";
        }
        $t->Set("monedas", $monedas);

        $db->Query("SELECT suc,nombre FROM sucursales   WHERE estado ='Activo'");
        $sucs = "";
        while ($db->NextRecord()) {
            $suc = $db->Record['suc'];
            $nombre_suc = $db->Record['nombre'];
            $sucs .= "<option value='$suc'>$suc - $nombre_suc</option>";
        }
        $t->Set("sucursales", $sucs);

        $t->Show("form");
 

        $db->Query("SELECT cuenta, nombre_cuenta FROM plan_cuentas  WHERE nivel = 1 AND estado = 'Activa'");
        while ($db->NextRecord()) {
            $cuenta_nivel_1 = $db->Record['cuenta'];
            $nombre_cuenta = $db->Record['nombre_cuenta'];
            $t->Set("cuenta_nivel_1", $cuenta_nivel_1);
            $t->Set("nombre_cuenta_nivel_1", $nombre_cuenta);
            $t->Show("cuenta_nivel_1");
        }

        $t->Show("foot");
    }

}

function getPlanCuenta() {
    $padre = $_REQUEST['cuenta_master'];
    $sql = "SELECT cuenta, nombre_cuenta,moneda,padre,nivel,saldo,saldoMS,suc,tipo,asentable, estado FROM plan_cuentas WHERE padre LIKE '$padre%' ORDER BY cuenta   ASC, nivel asc ";
    
    echo json_encode(getResultArray($sql));
}

function actualizarORegistrar(){
    $cuenta = $_REQUEST['cuenta'];
    $nombre = $_REQUEST['nombre'];
    $nivel = $_REQUEST['nivel'];
    $suc = $_REQUEST['suc'];
    $moneda = $_REQUEST['moneda'];
    $estado = $_REQUEST['estado'];
    $tipo = $_REQUEST['tipo'];
    $asentable = $_REQUEST['asentable'];
    $accion = $_REQUEST['accion'];
     
    $db = new My();
    if($accion == "modificar"){
       $db->Query("UPDATE plan_cuentas SET nombre_cuenta = '$nombre', moneda = '$moneda',  nivel = '$nivel', suc = '$suc',tipo = '$tipo', asentable= '$asentable', estado = '$estado' WHERE cuenta = '$cuenta';");   
    }else{
       $padre =   substr($cuenta, 0, strrpos($cuenta, "."));
       $db->Query("INSERT INTO  plan_cuentas (cuenta, nombre_cuenta, moneda, padre, nivel, saldo, saldoMS, suc, estado)
       VALUES ('$cuenta', '$nombre', '$moneda', '$padre', '$nivel',0, 0, '$suc', '$estado');");   
    }
    echo json_encode(array("mensaje"=>"Ok"));
}

function getResultArray($sql) {
    $db = new My();
    $array = array();
    $db->Query($sql);
    while ($db->NextRecord()) {
        array_push($array, $db->Record);
    }
    $db->Close();
    return $array;
}

new PlanCuentas();
?>
        
