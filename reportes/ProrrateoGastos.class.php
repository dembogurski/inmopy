<?php

/**
 * Description of ProrrateoGastos
 * @author Ing.Douglas
 * @date 02/06/2017
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

set_time_limit(1000);

class ProrrateoGastos {

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $desde = $_REQUEST['desde'];
        $desde_eng = substr($desde, 6, 4) . '-' . substr($desde, 3, 2) . '-' . substr($desde, 0, 2);
        $hasta = $_REQUEST['hasta'];
        $hasta_eng = substr($hasta, 6, 4) . '-' . substr($hasta, 3, 2) . '-' . substr($hasta, 0, 2);
        $usuario = $_REQUEST['user'];
        $user = $_REQUEST['user'];

        $t = new Y_Template("ProrrateoGastos.html");
        $t->Show("header");

        $t->Set("desde", $desde);
        $t->Set("hasta", $hasta);
        $t->Set("desde_eng", $desde_eng);
        $t->Set("hasta_eng", $hasta_eng);
        $t->Set("vendedor", $usuario);


        $t->Set("user", $user);
        $t->Set("time", date("d-m-Y H:i"));

        $t->Show("head");
        $db = new My();
        $Qry = "SELECT SUM(subtotal)  AS TOTAL FROM factura_venta f, fact_vent_det d WHERE f.f_nro = d.f_nro AND f.fecha BETWEEN '$desde_eng' AND '$hasta_eng' AND  f.estado = 'Cerrada' and suc != '00' ";
        $db->Query($Qry);
        $TOTAL = 0;
        if ($db->NumRows() > 0) {
            $db->NextRecord();
            $TOTAL = $db->Record['TOTAL'];
        } else {
            echo "Error: Total de Ventas 0, puede que haya algun error en el rango de fechas";
            die();
        }

        $Qry = "SELECT suc ,SUM(subtotal)  AS subtotal, ROUND((SUM(subtotal)  * 100) / $TOTAL,2) as porc FROM factura_venta f, fact_vent_det d WHERE f.f_nro = d.f_nro AND f.fecha BETWEEN '$desde_eng' AND '$hasta_eng' AND  f.estado = 'Cerrada' and suc != '00' GROUP BY SUC ASC";
        $db->Query($Qry);
        $t->Show("cabecera");

        $suc_array = array();

        $count = 0;

        while ($db->NextRecord()) {
            $suc = $db->Record['suc'];
            $subtotal = $db->Record['subtotal'];
            $porc = $db->Record['porc'];
            $t->Set("suc", $suc);
            $t->Set("subtotal", number_format($subtotal, 2, ',', '.'));
            $t->Set("porc", number_format($porc, 2, ',', '.'));
            $suc_array[$suc] = $porc;
            $t->Show("data");
        }
        $t->Set("total", number_format($TOTAL, 2, ',', '.'));
        $t->Show("footer");




        $ms = new My();
        $cuentas = "select Account,c.AcctName,j.ProfitCode as NR, sum(Debit-Credit) as Ammount   from  OJDT o,  JDT1 j, OACT c  WHERE o.TransId = j.TransId and j.Account = c.AcctCode 	
	and o.RefDate BETWEEN '$desde' AND '$hasta' and (c.AcctCode like '5%' or c.AcctCode like '6%' or c.AcctCode like '7%' or c.AcctCode like '8%' ) and j.ProfitCode in('00','03') group by Account,c.AcctName,j.ProfitCode";
        $suc_tds = "";
        foreach ($suc_array as $sucursal=>$porc) {
            if($sucursal!="00"){
               $suc_tds = $suc_tds.="<th style='background-color: lightskyblue'>$sucursal</th>";
            }
        }
        $t->Set("cab_sucursales", $suc_tds);
        $t->Show("cuentas_cab");

        $ms->Query($cuentas);

        
        while ($ms->NextRecord()) {
            $Account = $ms->Record['Account'];
            $AcctName = $ms->Record['AcctName'];
            $Ammount = $ms->Record['Ammount'];
            $NR = $ms->Record['NR'];
            $suc_tds = "";
            foreach ($suc_array as $sucursal => $porcent) {
                $porc_part = ($Ammount * $porcent) / 100;
                $porc_equiv = number_format($porc_part, 2, ',', '.');
                
                $identif = md5("$NR-$sucursal-$Account-$Ammount");
                
                $db->Query("select id_asiento, e_sap from asientos where identif = '$identif'");
                $clase = "";
                $id_asiento = "";
                if($db->NumRows()>0){
                   $db->NextRecord();
                   $id_asiento = $db->Record['id_asiento'];
                   $e_sap = $db->Record['e_sap'];
                   if($e_sap == 1){
                       $clase = "sincronizado";
                   }else{
                       $clase = "generado";
                   }
                }                
                if($sucursal!="00"){
                   $suc_tds = $suc_tds.="<td data-suc='$sucursal' id='$identif' class='prorrat $clase num' title='ID Interno: $id_asiento' >$porc_equiv</td>";                
                }
            }
            $t->Set("cuenta", $Account);
            $t->Set("nombre", $AcctName);
            $t->Set("norma_reparto", $NR);            
            $t->Set("valor", number_format($Ammount, 0, ',', '.')); 
            $t->Set("part_suc", $suc_tds);
            $t->Show("cuentas_data");
        }
        $t->Show("cuentas_footer");
    }

}

function generarAsiento(){
    $usuario = $_REQUEST['usuario'];
    $cuenta = $_REQUEST['cuenta'];
    $nombre = $_REQUEST['nombre'];
    $valor = $_REQUEST['valor'];
    $norma_reparto = $_REQUEST['norma_reparto'];
    $hash = $_REQUEST['hash'];
    $suc = $_REQUEST['suc'];
    
    $cuenta_transitoria = '6.1.3.9.30';
    $nombre_cuenta_transitoria = 'Cuentas Transitorias';
     
         
    $my = new My();
    
    // Primer Asiento a Cuenta Transitoria
    $my->Query("INSERT INTO  asientos(fecha, usuario, id_frac,descrip,identif, e_sap)VALUES (CURRENT_DATE, '$usuario', 0,'Distribucion de Gastos << $norma_reparto','$hash',NULL);"); // 3 Por ahora
    
    $my->Query("select id_asiento from asientos where usuario = '$usuario' order by id_asiento desc limit 1");
    $my->NextRecord();
    $id_asiento = $my->Record['id_asiento'];   
    
    // Detalle 1
    $my->Query("INSERT INTO asientos_det(id_asiento,id_det,cuenta, nombre_cuenta, debe, haber,suc)
    VALUES ($id_asiento,1,'$cuenta_transitoria', '$nombre_cuenta_transitoria',$valor, 0,'$norma_reparto');");   
    
    $my->Query("INSERT INTO asientos_det(id_asiento,id_det,cuenta, nombre_cuenta, debe, haber,suc)   
    VALUES ($id_asiento,2,'$cuenta','$nombre', 0, $valor,'$norma_reparto');");
      
    
    
    
     // Segundo Asiento  de Cuenta Transitoria
    $my->Query("INSERT INTO  asientos(fecha, usuario, id_frac,descrip,identif,e_sap)VALUES (CURRENT_DATE, '$usuario', 0,'Distribucion de Gastos >> $norma_reparto','$hash',NULL);"); // 3 Por ahora
    
    $my->Query("select id_asiento from asientos where usuario = '$usuario' order by id_asiento desc limit 1");
    $my->NextRecord();
    $id_asiento = $my->Record['id_asiento'];   
    
    // Detalle 2
    $my->Query("INSERT INTO asientos_det(id_asiento,id_det,cuenta, nombre_cuenta, debe, haber,suc)
    VALUES ($id_asiento,1,'$cuenta','$nombre', $valor, 0,'$suc');");
    
    $my->Query("INSERT INTO asientos_det(id_asiento,id_det,cuenta, nombre_cuenta, debe, haber,suc)
    VALUES ($id_asiento,2,'$cuenta_transitoria', '$nombre_cuenta_transitoria',0, $valor,'$norma_reparto');");   
    
    echo "Ok";
    
}

new ProrrateoGastos();
?>
