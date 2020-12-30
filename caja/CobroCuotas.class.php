<?php

/**
 * Description of CobroCuotas
 * @author Ing.Douglas
 * @date 06/08/2015
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


class CobroCuotas {
    
    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
     
        $useragent=$_SERVER['HTTP_USER_AGENT'];
        $t = new Y_Template("CobroCuotas.html");
        $usuario = $_POST['usuario'];
        $suc = $_POST['suc'];
        
        //echo getcwd();
        
        $ruc_cli = ""; 
        if(isset($_POST['ruc_cli'])){
            $ruc_cli = $_POST['ruc_cli']; 
        }
        
        $t->Set('ruc_cli',$ruc_cli);
        $t->Set('random',mt_rand(100, 9999999));
        
        
        
        $t->Set('is_mobile','false');
        // Detectar Dispositivos Android
        if(preg_match('/android/i',$useragent)){
            //echo 'Mobile';
            $t->Set('is_mobile','true');
            $t->Set("fecha_hoy",date("Y-m-d"));
        }else{
            //echo 'PC';
            $t->Set("fecha_hoy",date("d/m/Y"));
        }
        $t->Show("header"); 
         
        
        // Buscar Convenios
        $ms = new My();
        $ms->Query("SELECT cod_tarjeta AS CreditCard,nombre AS CardName,tipo AS Tipo FROM tarjetas WHERE tipo <> 'Asociacion' ORDER BY CardName ASC");
        $convenios = "";
        while ($ms->NextRecord()) {
            $conv_cod = $ms->Record['CreditCard'];
            $conv_nombre = $ms->Record['CardName'];
            $tipo_tarjeta_ret = $ms->Record['Tipo'];
            $convenios.="<option value='$conv_cod'>$conv_nombre</option>";
        }
        $t->Set("convenios", $convenios);

        $db = new My();
        $db2 = new My();
        
        $db->Query("SELECT m_descri AS m, m_cod AS moneda FROM monedas WHERE m_ref <> 'Si';");
        //echo $db->NumRows();
        while ($db->NextRecord()) {
            $moneda = $db->Record['moneda'];
            $mon_replaced = strtolower(str_replace("$", "s", $moneda));
            $db2->Query("SELECT compra,venta FROM cotizaciones WHERE suc = '$suc' AND m_cod = '$moneda' and fecha <= current_date ORDER BY id_cotiz DESC LIMIT 1;");
            if ($db2->NumRows() > 0) {
                $db2->NextRecord();
                $compra = $db2->Record['compra'];
                $t->Set("cotiz_$mon_replaced", number_format($compra, 2, ',', '.'));
            } else {
                $t->Set("cotiz_$mon_replaced", 0);
            }
        }
        
        $t->Show("cotizaciones");
        $t->Show("body"); 
        // Buscar Lista de Bancos
        $db->Query("SELECT id_banco,nombre FROM bancos order by nombre asc");
        $bancos = "";
        while ($db->NextRecord()) {
            $id_banco = $db->Record['id_banco'];
            $nombre = $db->Record['nombre'];
            $bancos.="<option value='$id_banco'>$nombre</option>";
        }
        $t->Set("bancos", $bancos);
        
        $db->QUERY("SELECT  b.id_banco,b.nombre,cuenta, c.m_cod as moneda FROM bancos b, bcos_ctas c WHERE b.id_banco = c.id_banco ORDER BY b.nombre ASC");
        $cuentas = "";
        $i = 0;
        while ($db->NextRecord()) {
            $id_banco = $db->Record['id_banco'];
            $nombre = $db->Record['nombre'];
            $cuenta = $db->Record['cuenta'];
            $moneda = $db->Record['moneda'];
            $cuentas.="<option value='$id_banco' data-cuenta='$cuenta' onchange='setCuenta()' >$nombre - $cuenta - $moneda</option>";
            if($i == 0){
                $t->Set("cuenta",$cuenta);
            }
            $i++;
        }
        $t->Set("cuentas", $cuentas);
        

        // Buscar Lista de Monedas
        $db->Query("SELECT m_cod AS moneda, m_descri FROM monedas ");
        $monedas = "";
        $monedas_cod = "";
        while ($db->NextRecord()) {
            $moneda = $db->Record['moneda'];
            $m_descri = $db->Record['m_descri'];
            if ($moneda != 'P$' && $moneda != 'R$' && $moneda != 'Y$') {
                $monedas.="<option value='$moneda'>$m_descri</option>";
            }
            $monedas_cod.="<option value='$moneda'>$moneda</option>";
        }
        $t->Set("monedas", $monedas);
        $t->Set("monedas_cod", $monedas_cod);
        $ncuotas = "";
        for ($i = 1; $i <= 60; $i++) {
            $ncuotas .= "<option>$i</option>";
        }
        $t->Set("n_cuotas", $ncuotas);

        $t->Show("ui");
        
        $t->Show("area_impresion");
        
    }
}

function generarFacturaXIntereses(){
    $datos = json_decode($_POST['datos']);

    $CardCode = $datos->CardCode;
     
     
    $usuario = $datos->usuario;
    $suc = $datos->suc;
    $moneda = $datos->moneda;
    $cotiz = $datos->cotiz;
    $data = $datos->data;
    
    
    $db = new My();
    $sql = "select nombre,ci_ruc, cat, tipo_doc from clientes WHERE cod_cli = '$CardCode'";
    $db->Query($sql);
    $db->NextRecord();
    $ruc = $db->Record['ci_ruc'];
    $cliente = utf8_encode($db->Record['nombre']);
    $cat = $db->Record['cat'];
    $tipo_doc = $db->Record['tipo_doc'];
    
    $hora = date('H:i');
    
    $db->Query("INSERT INTO inmopy.factura_venta(cod_cli,cliente,usuario,fecha,hora,ruc_cli,tipo_doc_cli,suc,cat,total,total_desc,total_bruto,estado,cod_desc,moneda,cotiz,turno,turno_id, turno_fecha, turno_llamada,empaque,nro_reserva,clase)
    VALUES ('$CardCode','$cliente','$usuario',current_date,'$hora','$ruc','$tipo_doc','$suc',$cat,0,0,0,'En_caja',0,'$moneda',$cotiz,NULL,NULL, NULL, NULL,'Si',NULL,'Servicio');");

    $db->Query("SELECT f_nro AS NRO FROM factura_venta WHERE estado = 'En_caja' AND usuario = '$usuario' and clase = 'Servicio'  ORDER BY f_nro DESC LIMIT 1");
    $db->NextRecord();
    $nro = $db->Record['NRO'];  

    $total_bruto = 0;

    foreach ($data as $cuota) {
        $Factura = $cuota->Factura;
        $FolioNum = $cuota->FolioNum;
        $Cuota = $cuota->Cuota;
        $Total = $cuota->Total;
        $Pagado = $cuota->Pagado;
        $Monto = $cuota->Monto;
        $FechaFactura = $cuota->FechaFactura;
        $Tipo = $cuota->Tipo;
        $Interes = $cuota->Interes;
        $total_bruto += 0 +$Interes;
        $descrip = "Interes Ref: $Factura Cuota: $Cuota";
        
        $det = "INSERT INTO fact_vent_det (f_nro, codigo, lote,um_prod, descrip, um_cod,cod_falla,cant_falla,cod_falla_e,falla_real, cantidad, precio_venta, descuento, precio_neto, subtotal, estado,gramaje,ancho,tara,kg_calc,cant_med,estado_venta,ref_factura,ref_cuota)"
             . "VALUES ($nro, 'SR001','','Unid', '$descrip', 'Unid',NULL,NULL,NULL,NULL, 1 , $Interes, 0,$Interes, $Interes, 'Pendiente',0,0,0,0, 1,'Normal',$Factura,$Cuota);";
        $db->Query($det);
    }
    $descuento = fmod($total_bruto, 50);
    $total_neto = $total_bruto - $descuento;
    
    $cod_desc = 0;
    
    if($descuento > 0){
        $cod_desc = 4;
    }
    
    $db->Query("UPDATE factura_venta SET total = $total_neto,desc_sedeco = $descuento,total_bruto = $total_bruto, cod_desc = $cod_desc WHERE f_nro = $nro");
     
    echo json_encode(array("mensaje"=>"Ok"));
}

new CobroCuotas();
?>

