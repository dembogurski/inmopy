<?php

/**
 * Description of ComisionesMayoristas
 * @author Ing.Douglas
 * @date 18/04/2018
 */
set_time_limit(0);

require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class ComisionesMayoristas {

    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {

        $PARAM_COMIS_2p5 = 2.5; //2.5%
        $PARAM_COMIS_5  =  5; //5%    
        $reglas = array("H0204"=>15000,"C0044"=>38000,"H0225"=>25500,"H0068"=>21000,"B0009"=>10000,"H0233"=>20000,"H0232"=>20000,"H0009"=>26000,"H0123"=>28500,"H0011"=>28000,"H0140"=>7200,"S0055"=>15500,"S0054"=>15000,"H0030"=>7700,"H0018"=>19200,"B0005"=>11500,"H0021"=>19350,"H0062"=>11600,"S0074"=>25500,"H0046"=>32500,"C0193"=>115000,"H0080"=>25500,"B0065"=>10800,"S0184"=>22050,"C0026"=>15500,"C0083"=>15500,"C0196"=>46500,"C0149"=>9900,"C0009"=>8800,"C0080"=>14000,"B0072"=>3500,"H0043"=>19100,"S0015"=>19500,"S0249"=>16500,"S0061"=>18500,"B0053"=>10500,"S0180"=>3750,"S0135"=>16500,"S0018"=>21000,"S0136"=>14500,"B0055"=>9500,"B0122"=>9500,"C0043"=>35500,"S0115"=>5850,"H0088"=>98000,"S0024"=>13000,"S0156"=>7500,"S0022"=>10600,"S0012"=>19000,"S0037"=>23500,"S0014"=>12500,"S0008"=>28500,"S0259"=>16500,"S0001"=>15300,"S0226"=>28500,"S0086"=>27000,"S0226"=>28500,"S0010"=>25000,"C0016"=>12600,"S0129"=>19500,"C0020"=>9450,"C0024"=>9450,"C0055"=>9000,"C0079"=>20000,"H0019"=>12500,"S0121"=>8500,"H0244"=>19000,"B0030"=>7700,"B0031"=>33000,"B0109"=>11000,"B0035"=>7500,"B0074"=>31500,"S0122"=>10000,"B0105"=>23500,"B0001"=>11000,"B0068"=>17200,"B0040"=>12500,"B0098"=>14800,"B0034"=>5650,"TX111"=>43800,"H0056"=>9000,"H0265"=>18800,"B0032"=>17200,"H0116"=>10500,"TX24"=>13500,"TX26"=>16500,"TX27"=>17000,"TX29"=>20500,"TX30"=>24000,"TX31"=>27500,"TX45"=>14000,"TX35"=>17000,"TX36"=>17500,"TX37"=>21500,"TX38"=>24500,"TX94"=>13500,"TX95"=>14500,"TX99"=>18000,"H0052"=>7400,"H0282"=>7500,"H0281"=>7500,"TX104"=>11700,"TX105"=>10200,"B0090"=>24500,"C0070"=>14000,"B0013"=>6100,"B0043"=>11000,"B0003"=>16000,"B0092"=>15000,"C0042"=>13000,"S0205"=>16000,"H0039"=>30600,"H0293"=>24500,"S0110"=>29000,"H0004"=>16850,"H0006"=>23500,"H0273"=>23500,"H0274"=>38500,"H0002"=>6500,"H0227"=>17500,"B0028"=>18000,"H0106"=>17500,"B0120"=>6800,"B0002"=>16800,"H0048"=>30500,"B0021"=>13000,"B0022"=>13600,"B0023"=>9900,"B0020"=>21500,"S0197"=>9500,"S0017"=>9800,"S0020"=>15500,"S0170"=>18500,"S0016"=>7200,"S0238"=>10000,"S0253"=>3200,"S0257"=>15500,"B0071"=>3500,"C0095"=>20500,"H0053"=>7000,"H0050"=>6000,"H0142"=>15000,"H0055"=>5000,"H0054"=>7800,"H0066"=>9500,"H0162"=>6500,"H0161"=>5000,"B0007"=>21100,"S0004"=>22800,"TX04"=>30940,"TX05"=>25585,"TX100"=>75200,"TX101"=>81000,"C0040"=>18500,"C0150"=>15600,"C0098"=>7800,"C0076"=>5150,"C0084"=>10500,"C0073"=>28800,"C0051"=>18500,"S0065"=>19800,"H0025"=>24500,"H0020"=>24500,"H0022"=>24500,"B0045"=>8800,"B0012"=>12500,"C0011"=>12000,"H0024"=>32800,"C0069"=>29000,"S0233"=>3500,"S0117"=>3100,"H0146"=>33200,"H0145"=>18000,"H0100"=>7900,"S0007"=>6000,"H0095"=>13500,"C0066"=>13500,"C0190"=>6500,"C0074"=>6500,"C0082"=>6800);   
        $desde = $_REQUEST['desde'];
        $desde_eng = substr($desde, 6, 4) . '-' . substr($desde, 3, 2) . '-' . substr($desde, 0, 2);
        $hasta = $_REQUEST['hasta'];
        $hasta_eng = substr($hasta, 6, 4) . '-' . substr($hasta, 3, 2) . '-' . substr($hasta, 0, 2);
        $usuario = $_REQUEST['usuario'];
        $user = $_REQUEST['user'];
        $emp = $_REQUEST['emp'];
        
        $db = new My();

        $t = new Y_Template("ComisionesMayoristas.html");

        $t->Set('time', date("d-m-Y h:i"));
        $t->Set('user', $user);
        
        if($emp === "MARIJOA"){
           $t->Set('logo', "logo_small.png");
           $t->Set('altura', "50");
        }else{
           $t->Set('logo', "logo_corporacion_small.png"); 
           $t->Set('altura', "60");
        }
        
        $bsql = "SELECT id_banco, nombre FROM bancos ORDER BY id_banco + 0 ASC    ";
        $db->Query($bsql);
        $bancos = "";
        while($db->NextRecord()){
           $id =   $db->Record['id_banco'];    
           $nombre = $db->Record['nombre'];    
           $bancos.='<option value="'.$id.'">'.$nombre.'</option>';
        }
        $t->Set("bancos", $bancos);
        $t->Show("header");

        $t->Set("desde", $desde);
        $t->Set("hasta", $hasta);
        $t->Set("desde_eng", $desde_eng);
        $t->Set("hasta_eng", $hasta_eng);
        $t->Set("vendedor", $usuario);

        $t->Show("head");

        $t->Set("user", $user);
        $t->Set("time", date("d-m-Y H:i"));
        
        $codigos = "";
        
        $pivot2p5 = "SUM(  IF( ";
        $pivot5 = "SUM(  IF( ";
        foreach ($reglas as $codigo => $precio) {
            $pivot2p5 .= "(codigo = '$codigo' AND  precio_venta < $precio) OR";
            $pivot5.= "(codigo = '$codigo' AND  precio_venta >= $precio) OR";
            $codigos.="'$codigo',";
        }   
        $codigos= substr($codigos, 0, -1);
        //echo $codigos."<br><br>"; 
         
        $pivot2p5= substr($pivot2p5, 0, -2);
        
        $pivot2p5 .=  " ,subtotal,0)) AS Subtotal2p5 ";
        
        
        $pivot5 .= " CODIGO NOT IN ($codigos)";
        $pivot5    .=  " ,subtotal,0)) AS Subtotal5 ";
        
        //echo $pivot2p5;
        
        $sql = "SELECT f.f_nro AS factura,fact_nro AS fact_legal,cod_cli,cliente,DATE_FORMAT(fecha_cierre,'%d-%m-%Y') AS fecha,
        $pivot2p5,$pivot5,subtotal      
        FROM  factura_venta f , fact_vent_det d  WHERE f.f_nro = d.f_nro AND f.estado = 'Cerrada' AND f.e_sap IS NOT NULL AND fecha_cierre BETWEEN '$desde_eng' AND '$hasta_eng'  AND f.usuario = '$usuario'
        GROUP BY f.f_nro ORDER BY f.f_nro ASC ";
        //  echo $sql; die();
        $db->Query($sql);

        $TOTAL_COMISION_VENTAS = 0;
        $count = 0;

        while ($db->NextRecord()) {
            $count++;
            $factura = $db->Record['factura'];
            $fact_legal = $db->Record['fact_legal'];
            $fecha = $db->Record['fecha'];
            $cod_cli = $db->Record['cod_cli'];
            $cliente = $db->Record['cliente'];
             
            $Subtotal2p5 = $db->Record['Subtotal2p5'];
            $Subtotal5 = $db->Record['Subtotal5'];
             
            $Comis2o5 = $Subtotal2p5 * $PARAM_COMIS_2p5 / 100;
            $Comis5   = $Subtotal5 * $PARAM_COMIS_5 / 100;
            
            $t->Set("factura", $factura);
            $t->Set("fact_legal", $fact_legal);
            $t->Set("fecha", $fecha);
            $t->Set("cod_cli", $cod_cli);
            $t->Set("cliente", $cliente);
               
            $t->Set("Subtotal2p5", number_format($Subtotal2p5, 2, ',', '.'));
            $t->Set("Subtotal5", number_format($Subtotal5, 2, ',', '.'));

            $t->Set("Comis2p5", number_format($Comis2o5, 0, ',', '.'));
            $t->Set("Comis5", number_format($Comis5, 0, ',', '.'));
            

            $comision = $Comis2o5 + $Comis5 ;
            $TOTAL_COMISION_VENTAS+=0 + $comision;

            $t->Set("subtotal", number_format($comision, 2, ',', '.'));
            $t->Set("total_comis_ventas", number_format($TOTAL_COMISION_VENTAS, 2, ',', '.'));

            $devs = getDevoluciones($factura, $pivot2p5,$pivot5, $PARAM_COMIS_2p5, $PARAM_COMIS_5);
            //$devs = 0;
            $t->Set("devoluciones", number_format($devs, 0, ',', '.'));

            $datos_sap = getPagosRecibidos($factura);
            //print_r( $datos_sap);
            $TotalFactura = $datos_sap['TotalFactura'];
            $Cobrado = $datos_sap['Cobrado'];
            $porc_cobrado =  ($Cobrado * 100) / $TotalFactura ;
            
            $pagos = getPagosEfectuados($factura);
            $pagado = $pagos["pagado"]; 
            $historial = str_replace(",Cheque:", ",<br>Cheque:", $pagos["historial"]) ; 
            
            $comis_correspond = round((($comision * $porc_cobrado) / 100) -  ($devs + $pagado),2); 
                                   
            
            $t->Set("porc_cobrado", number_format($porc_cobrado,2, ',', '.'));
            
            $t->Set("pagado", number_format($pagado,2, ',', '.'));
            
            $t->Set("comis_corresp", number_format($comis_correspond,2, ',', '.'));
                        
            $t->Set("total_factura", number_format($TotalFactura,0, ',', '.'));
            $t->Set("cobrado", number_format($Cobrado,0, ',', '.'));
             
            if($comis_correspond <= 0){
                $t->Set("tipo", "negativo");
                if($comision == $pagado ){
                   $t->Set("selectable_check", '<img src="../img/cheque.png" title="'.$historial.'" > ');     
                }else{
                   $t->Set("selectable_check", "");                
                }
            }else{
                $t->Set("tipo", "positivo");
                $t->Set("selectable_check", '<input type="checkbox" class="check" onclick="verificarMarcados()" id="check_'.$factura.'"  >');     
            }
            
            $t->Show("data");
            $t->Set("count", number_format($count, 0, ',', '.'));
        }
        $t->Show("footer");
    }

}

function getDevoluciones($factura, $pivot2p5,$pivot5, $PARAM_COMIS_2p5, $PARAM_COMIS_5) {
    $notas_credito_manueles = 
        array(773606=>2550,
              766755=>1340825,
              783013=>20400,
              758348=>3688,
              777000=>201847,   // 13597+188250
              801983=>8460
    );
    
    $dev = $notas_credito_manueles[$factura];
    if($dev > 0){ 
        return $dev;
    }else{
        $pivot2p5 = str_replace("precio_venta", "precio_unit", $pivot2p5);
        $pivot5 = str_replace("precio_venta", "precio_unit", $pivot5);
        $my = new My();
        $my->Query("SELECT  $pivot2p5, $pivot5 FROM  nota_credito n, nota_credito_det d   WHERE n.n_nro = d.n_nro  AND  n.f_nro = $factura");
        $my->NextRecord();

        $Subtotal2p5 = $db->Record['Subtotal2p5'];
        $Subtotal5 = $db->Record['Subtotal5'];
        if($Subtotal2p5 == null){
            $Subtotal2p5 = 0;
        }
        if($Subtotal5 == null){
            $Subtotal5 = 0;
        }

        $Comis2o5 = $Subtotal2p5 * $PARAM_COMIS_2p5 / 100;
        $Comis5   = $Subtotal5 * $PARAM_COMIS_5 / 100;

        $dev_linea = $Comis2o5 +  $Comis5;
        $my->Query("SELECT IF(SUM(comis_dev) IS NULL, 0,SUM(comis_dev)) AS desc_comis_ant FROM pagos_efectuados p, pago_efec_det d WHERE p.id_pago = d.id_pago AND d.ref = $factura AND p.id_concepto = 18");
        $my->NextRecord();
        $desc_comis_ant = $my->Record['desc_comis_ant'];

    return $dev_linea - $desc_comis_ant;
    }
}
function getPagosEfectuados($factura){
    $my = new My();
    $my->Query("SELECT IF(SUM(d.valor) IS NULL, 0,SUM(d.valor)) AS pagado, GROUP_CONCAT(complemento,', Valor: ',p.valor) AS historial FROM pagos_efectuados p, pago_efec_det d WHERE p.id_pago = d.id_pago AND d.ref = $factura AND p.id_concepto = 18");
    $my->NextRecord();
    $pagado = $my->Record['pagado'];
    $historial = $my->Record['historial'];
    return array("pagado"=>$pagado,"historial"=>$historial);
}
function getPagosRecibidos($factura){
   $db = new My();
   $sql = "SELECT total as TotalFactura FROM factura_venta WHERE f_nro = $factura ";    
   $db->Query($sql);
     
   $my = new My();
   $my->Query("SELECT SUM(total) AS NotaCredito  FROM nota_credito WHERE f_nro = $factura");
   $nota_credito = 0;
   if($my->NumRows()>0){
        $my->NextRecord();
        $nota_credito = $my->Record['NotaCredito'];
   } 
   
   if($db->NumRows()>0){
       $db->NextRecord();   
       $TotalFactura = $db->Record['TotalFactura'];
       
       $sql_pagos = "SELECT 'Cuotas' AS tipo, SUM( monto_ref - saldo) AS pagado FROM cuotas WHERE f_nro = $factura UNION
       SELECT 'Efectivo' AS tipo, IF(SUM(entrada_ref) IS NULL,0,SUM(entrada_ref)) - IF(SUM(salida_ref) IS NULL,0,SUM(salida_ref)) AS pagado  FROM efectivo  WHERE f_nro = $factura UNION
       SELECT 'Tarjeta', IF(SUM(monto) IS NULL,0,SUM(monto))   AS pagado FROM convenios WHERE f_nro = $factura UNION
       SELECT 'Cheque', IF(SUM(valor) IS NULL,0,SUM(valor))   AS pagado FROM cheques_ter WHERE f_nro = $factura";
       
       $db->Query($sql_pagos);
       $pagado = 0;
       while($db->NextRecord()){
           $pagado+= 0 + $db->Get('pagado'); 
       } 
       $pagado += 0+ $nota_credito;
       return array("TotalFactura"=>$TotalFactura,"Cobrado"=>$pagado);
   } 
}
function pagarComisiones(){
    $valor = $_REQUEST['valor'];
    $cheque = $_REQUEST['cheque'];
    $banco = $_REQUEST['banco'];
    $cuenta = $_REQUEST['cuenta'];
    $usuario = $_REQUEST['usuario'];
    $facturas = json_decode( $_REQUEST['facturas']);
    
    $complemento = "Cheque: $cheque,  $banco,  Cuenta: $cuenta";
    
    $cab = "INSERT INTO pagos_efectuados(suc, fecha, hora, usuario, id_concepto, estado, complemento, control_caja, valor, e_sap)
    VALUES ('03',CURRENT_DATE, CURRENT_TIME, '$usuario', 18, 'Pendiente', '$complemento', NULL, $valor, 0);";
    
    
    $db = new My();
    $db->Query($cab);
    
    $get_id = "SELECT id_pago FROM pagos_efectuados WHERE usuario ='$usuario' order by id_pago  desc limit 1";
    $db->Query($get_id);
    
    $db->NextRecord();
    $id_pago = $db->Record['id_pago'];
    
    foreach ($facturas as $obj ) {             
        $factura = $obj->Factura;
        $devs = $obj->Devs;
        $comis = $obj->Comis;        
        $db->Query("INSERT INTO pago_efec_det ( id_pago, ref, tipo, valor, comis_dev, estado, e_sap)VALUES($id_pago, '$factura', 'Comision', $comis, $devs, 'Pagado', 0);");
    }      
    $arr = array("Mensaje"=>"Ok");    
    
    echo json_encode($arr);
}

new ComisionesMayoristas();
?>

