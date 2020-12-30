<?php

/**
 * Description of Depositos
 * @author Ing.Douglas
 * @date 08/10/2015
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

//require_once("../Functions.class.php");

class Depositos {

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {

        $t = new Y_Template("Depositos.html");
        $t->Show("header");

        $t->Set("hoy", date("d-m-Y"));
        $db = new My();

        $db->Query("SELECT distinct b.id_banco,b.nombre FROM bancos b, bcos_ctas c WHERE b.id_banco = c.id_banco ORDER BY b.nombre ASC");
        $bancos = "";
        while ($db->NextRecord()) {
            $id_banco = $db->Record['id_banco'];
            $nombre = $db->Record['nombre'];
            $bancos.="<option value='$id_banco' >$nombre</option>";
        }
        $t->Set("bancos", $bancos);

        $db->QUERY("SELECT  b.id_banco,b.nombre,cuenta,m_cod as moneda FROM bancos b, bcos_ctas c WHERE b.id_banco = c.id_banco ORDER BY b.nombre ASC");
        $cuentas = "";
        $i = 0;
        while ($db->NextRecord()) {
            $id_banco = $db->Record['id_banco'];
            $moneda = $db->Record['moneda'];
            $cuenta = $db->Record['cuenta'];
            $cuentas.="<option  class='cta_$id_banco' value='$cuenta' data-moneda='$moneda' >$cuenta - $moneda</option>";
            $i++;
        }
        $t->Set("cuentas", $cuentas);
        $t->Show("form");
    }

}
function getUltimoIdMov(){
    $sql = "SELECT MAX(id_mov) + 1 AS id_mov FROM  bcos_ctas_mov ";
    $db = new My();
    $db->Query($sql);
    $db->NextRecord();
    $id_mov = $db->Record['id_mov'];
    echo json_encode(array("id_mov"=>$id_mov));
}
function getEfectivo() {
    $suc = $_REQUEST['suc'];
    $fecha = $_REQUEST['fecha'];
    $moneda = $_REQUEST['moneda'];
    $sql = "select sum(entrada - salida) as Efectivo from efectivo where suc = '$suc' and fecha = '$fecha' and m_cod = '$moneda'";
    
    $db = new My();
    $db->Query($sql);
    $efectivo = 0;
    if ($db->NumRows() > 0) {
        $db->NextRecord();
        $efectivo = $db->Record['Efectivo'];
        if ($efectivo == null) {
            $efectivo = 0;
        }
    }
    echo json_encode(Array('Efectivo' => $efectivo));
}

function getDepositos() {
    $suc = $_REQUEST['suc'];
    $fecha = $_REQUEST['fecha'];
    $moneda  = $_REQUEST['moneda'];
    $sql = "SELECT m.id_banco,b.nombre,m.cuenta,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,hora,suc,m.id_concepto,c.descrip AS concepto, entrada,salida,m.estado 
        FROM bancos b, bcos_ctas_mov m, conceptos c, bcos_ctas bc WHERE b.id_banco = m.id_banco AND m.id_concepto = c.id_concepto AND fecha = '$fecha'
        AND suc = '$suc' and bc.m_cod = '$moneda' and bc.cuenta = m.cuenta";
    $db = new My();
    $array = array();
    $db->Query($sql);
    while ($db->NextRecord()) {
        array_push($array, $db->Record);
    }
    echo json_encode($array);
}
//id_banco:id_banco,cuenta:cuenta, fecha: fecha,moneda:moneda,efectivo:efectivo,nro_dep:nro_dep,fecha_dep:fecha_dep
function registrarDeposito(){
    $id_banco = $_REQUEST['id_banco'];
    $cuenta = $_REQUEST['cuenta'];
    $suc = $_REQUEST['suc'];
    $fecha = $_REQUEST['fecha'];
    $moneda = $_REQUEST['moneda'];
    $efectivo = $_REQUEST['efectivo'];
    $cotiz = $_REQUEST['cotiz'];
    $nro_dep = $_REQUEST['nro_dep'];
    $fecha_dep = $_REQUEST['fecha_dep'];
    $usuario = $_REQUEST['usuario'];
    
    $monto_moneda_ref = round($efectivo * $cotiz,2);
    $db = new My();
    $db->Query("insert into efectivo( id_concepto, f_nro, nro_reserva, nro_deposito, m_cod,usuario, trans_num, entrada, salida, cotiz, entrada_ref, salida_ref,fecha_reg, fecha, hora, suc, estado, e_sap)
    values (9, null, null,'$nro_dep', '$moneda','$usuario', 0, 0, $efectivo, $cotiz, null, " . ((float)$efectivo*(float)$cotiz) . ",current_date, '$fecha', current_time, '$suc', 'Pendiente', 0);");
        
    $db->Query("insert into bcos_ctas_mov ( nro_deposito, trans_num, id_banco, cuenta,fecha_reg, fecha, hora, entrada, salida, suc, estado, id_concepto, usuario,e_sap)
    values ( '$nro_dep',null, '$id_banco', '$cuenta',current_date,'$fecha_dep',current_time,$efectivo, 0, '$suc', 'Pendiente', 9, '$usuario', 0);");
    echo "Ok";
}
function getCotiz(){
    $suc = $_REQUEST['suc'];
    $moneda = $_REQUEST['moneda'];
            
    $sql = "select compra,venta from cotizaciones where m_cod = '$moneda' and suc = '$suc' order by id_cotiz desc limit 1";
    $db = new My();
    $array = array();
    $db->Query($sql);
    while ($db->NextRecord()) {
        array_push($array, $db->Record);
    }
    echo json_encode($array);
}

new Depositos();
?>
