<?php

/**
 * Description of Arqueo
 * @author Jorge Armando Colina
 * @date 14-10-2016
 */
require_once("../../Y_Template.class.php");
require_once("../../Y_DB_MySQL.class.php");
require_once("../../Functions.class.php");

class ArqueoVentasDet
{
    private $template;
    function __construct() {
        $this->template = new Y_Template("ArqueoVentasDet.html");
    }
    function error() {
        $this->template->Show("error");
    }
    // Movimientos por venta
    function showVentas($verif, $suc, $desde, $hasta) {
        $this->template->Show("header");
    }
    
    // Ventas
    function getVentasData($suc, $desde, $hasta) {
        $this->template->Show("header");
        if($desde==$hasta){
            $this->template->Set("show_fecha",'Style="display:none;"');
            $this->template->Set("colspan",'5');
        }else{
            $this->template->Set("colspan",'6');
        }
        $link = new My();
        $facturas = '';
        $ventas = array();
        $query = "select f.f_nro,date_format(f.fecha_cierre,'%d/%m/%Y') as fecha_cierre,f.tipo,f.total as n_total,f.moneda,f.total_desc as n_total_desc,f.total_bruto as n_total_bruto,if(control_caja='Si','si','no') as control, if(empaque='Si','si','no') as control_empaque, e_sap from factura_venta f where f.suc='$suc' and f.fecha_cierre between '$desde' and '$hasta' and estado = 'Cerrada' order by f_nro asc";

        $link->Query($query);
        while ($link->NextRecord()) {
            $facturas .= $link->Record['f_nro'].',';
            $ventas[$link->Record['f_nro']] = $link->Record;
        }
        $f_check = trim($facturas, ',');
        if (strlen($f_check)>0) {
            $disableCheck = '';
            $error = '';
            $pagos = $this->getPagos($f_check);
            //print_r($pagos);
            $this->template->Show("facturas_head");
            // Detalle de pago de factura
            foreach ($ventas as $venta) {
                $t_factura = 0;
                $suma = 0;
                foreach ($venta as $key => $data) {
                    $s_data = (strpos($key, "n_") === 0)?(number_format((double)$data, 2, ',', '.')):$data;
                    $this->template->Set($key, $s_data);
                    if($key == 'n_total'){
                        $t_factura =  $data ;
                        $this->template->Set($key,number_format((double)$t_factura,2,',','.'));
                    }else{
                        $this->template->Set($key,$s_data);
                    }
                    // Detalle de cobros registrados por factura
                    
                    if ($key == 'f_nro' && key_exists($data, $pagos)) {
                        $this->template->Set('efectivo', '0.00');
                        $this->template->Set('cheques', '0.00');
                        $this->template->Set('convenio', '0.00');
                        $this->template->Set('cuotas', '0.00');
                        $this->template->Set('reserva', '0.00');
                        $this->template->Set("resClass", "");

                        $disableCheck = '';
                        $error = '';

                        
                        foreach($pagos[$data] as $p_key=>$p_data){
                                $suma += (double)$p_data;
                                if((double)$p_data < 0 && $p_key !='efectivo'){
                                        $disableCheck = 'disabled="disabled"';
                                        $this->template->Set("verif_$p_key","error");
                                }
                                if($p_key === 'reserva'){
                                        $this->template->Set("resData",$this->getReservaData($data));
                                        $this->template->Set("resClass","class='resaltar'");
                                }
                                $this->template->Set("verif_$p_key","");
                                $this->template->Set($p_key,number_format((double)$p_data,2,',','.'));
                        }
                    } elseif ($key == 'f_nro' && !key_exists($data, $pagos)) {
                        $this->template->Set('efectivo', '0.00');
                        $this->template->Set('cheques', '0.00');
                        $this->template->Set('convenio', '0.00');
                        $this->template->Set('cuotas', '0.00');
                        $this->template->Set('reserva', '0.00');
                    }
                    if (($key == 'control_empaque' && ($data == 'No' || $data == 'Pr')) ||  ($key=='e_sap' && $data == 3)) {
                        $disableCheck = 'disabled="disabled"';
                        if($key == 'control_empaque'){
                            $error = '_Emp';
                        }else{
                            $error = '_Sync';
                        }
                    }else{
                        $error = '';
                    }
                }
                $verificacion = round((double)$t_factura) - round((double)$suma);
                
                if ($verificacion!=0) {
                    $disableCheck = 'disabled="disabled"';
                } else if(strlen(trim($error))==0){
                    $error = '';
                }

				$this->template->Set('c_tot_verif',($verificacion!=0)?'diff':'eq');
				$this->template->Set('tot_verif',($verificacion!=0)?'&ne;':'=');
				$this->template->Set('suma',number_format(round((double)$suma),2,',','.'));
				$this->template->Set('disabled',$disableCheck);
                
                if ($disableCheck !== '') {
                        $this->template->Set('control', "error$error");
                }
                $this->template->Show("facturas_body");
            }
            $this->template->Show("facturas_foot");
        }
        $this->getReservas($suc, $desde, $hasta);
    }

    // Reservas --.:
    private function getReservas($suc, $desde, $hasta)
    {
        $link = new My();
        
        $link->Query("select ruc_cli,cliente,nro_reserva, valor_total_ref, minimo_senia_ref, senia_entrega_ref, estado from reservas where estado not in ('Abierta', 'En_caja') and suc='$suc' and fecha_cierre between '$desde' and '$hasta'");
        $data_string = ['ruc_cli','cliente','nro_reserva','estado'];
        $this->template->Show("reservas_head");
        while ($link->NextRecord()) {
            $data_res=$link->Record;
            $reserva = $data_res['nro_reserva'];
            $pago_res = (double)$data_res['senia_entrega_ref'];
            $pagos = $this->getPagosReservas($data_res['nro_reserva']);

            foreach ($data_res as $key => $data) {
                if (in_array($key, $data_string)) {
                    $this->template->Set($key, $data);
                } else {
                    $this->template->Set($key, number_format((double)$data, 2, ',', '.'));
                }
            }
            foreach ($pagos as $pago) {
                $total = 0.00;
                foreach ($pago as $key => $data) {
                    $this->template->Set($key, number_format((double)$data, 2, ',', '.'));
                    $total += (double)$data;
                }
                
                $verificacion = $pago_res-(double)$total;
                $this->template->Set('c_tot_verif', ($verificacion!=0)?'diff':'eq');
                $this->template->Set('tot_verif', ($verificacion!=0)?'&ne;':'=');
                $this->template->Set('suma', number_format((double)$total, 2, ',', '.'));
            }
            $this->template->Show("reservas_body");
        }
        $this->template->Set('bancos', json_encode($this->getBancosCuentas()));
        $this->template->Set('convenios', json_encode($this->getConvenios(), JSON_UNESCAPED_UNICODE));
        $this->template->Show("reservas_foot");
    }

    // Pagos Reservas
    private function getPagosReservas($res_nro)
    {
        $pagos_data = array();
        $link = new My();
        $pagos['efectivo'] = "select sum(entrada_ref)-sum(salida_ref) as monto from efectivo where nro_reserva = '$res_nro' group by nro_reserva";
        $pagos['convenio'] = "select sum(monto) as monto from convenios where nro_reserva='$res_nro'";
        foreach ($pagos as $tipo => $query) {
            $link->Query($query);
            $pagos_data[$res_nro][$tipo] = '0.00';
            while ($link->NextRecord()) {
                $pagos_data[$res_nro][$tipo] = $link->Record['monto']==''?'0.00':$link->Record['monto'];
            }
        }
        return $pagos_data;
    }

    // Datos de la reserva por nro de factura
    private function getReservaData($f_nro)
    {
        $link = new My();
        $data = "<table>";
        $link->Query("select r.nro_reserva as Nro,r.suc as Suc,r.ruc_cli as RUC,r.cliente as Cli from factura_venta v inner join reservas r using(nro_reserva) where f_nro = '$f_nro'");
        while ($link->NextRecord()) {
            foreach ($link->Record as $key => $value) {
                $data .= "<tr><td>$key:</td><td>$value</td></tr>";
            }
        }
        $link->Close();
        return  $data .= "</table>";
    }

    // Pagos Facturas
    
    function getPagos($facts)
    {
        $pagos_movs = array();
        $link = new My();
        $pagos['efectivo'] = "select e.f_nro, sum(e.entrada_ref - e.salida_ref) as monto from efectivo e where e.f_nro in ($facts) group by e.f_nro";
        $pagos['convenio'] = "select c.f_nro, sum(c.monto) as monto from convenios c where c.f_nro in ($facts) group by c.f_nro";
        $pagos['cheques'] = "select c.f_nro, sum(c.valor) as monto  from  cheques_ter c where c.f_nro in ($facts) and estado ='Pendiente' group by c.f_nro";
        $pagos['cuotas'] = "select c.f_nro, sum(c.monto) as monto from cuotas c where c.f_nro in ($facts) group by c.f_nro";
        $pagos['reserva'] = "select v.f_nro, sum(if(r.senia_entrega_ref is null,0,r.senia_entrega_ref)) as monto from factura_venta v inner join reservas r using(nro_reserva) where f_nro in ($facts)  group by v.f_nro";
        
        foreach ($pagos as $tipo => $query) {
            $link->Query($query);
            while ($link->NextRecord()) {
                $pagos_movs[$link->Record['f_nro']][$tipo] += $link->Record['monto'];
            }
        }
        return $pagos_movs;
    }
    // Marca como verificado una Factura de venta
    function verificado($factura)
    {
        $link = new My();
        $link->Query("update factura_venta set control_caja='Si' where f_nro = $factura");
        if ($link->AffectedRows() > 0) {
            echo '{"msg":"Ok"}';
        } else {
            echo '{"msg":"'.$factura.'"}';
        }
    }
    function getBancosCuentas()
    {
        $link = new My();
        $bancos = array();
        $link->Query("select id_banco,nombre from bancos order by nombre asc");
        while ($link->NextRecord()) {
            $bancos[$link->Record['id_banco']] = $link->Record['nombre'];
        }
        return $bancos;
    }

    function getConvenios()
    {
        $link = new My();
        $convenios = array();
        $link->Query("SELECT  cod_tarjeta as CreditCard,nombre as CardName,case  when tipo = 'Tarjeta Debito'  then 1   WHEN tipo = 'Tarjeta Credito'  THEN 1 WHEN tipo = 'Asociacion'  THEN 2 else 3 end as prioridad FROM tarjetas order by prioridad asc , CardName asc;");
        while ($link->NextRecord()) {
            $convenios['"'.$link->Record['CreditCard'].'"'] = $link->Record['CardName'];
        }
        return $convenios;
    }

    function getCotiz($ticket)
    {
        $link = new My();
        $cotizaciones['G$'] = array("id_cotiz"=>0,"suc"=>0,"fecha"=>"0000-00-00","hora"=>"00:00:00","compra"=>1.00,"venta"=>1.00,"ref"=>"G$");
        $link->Query("select c.id_cotiz,c.suc,c.m_cod,c.fecha,c.hora,c.compra,c.venta,c.ref from cotizaciones c inner join (select max(_c.id_cotiz) as id,_c.m_cod from cotizaciones _c inner join factura_venta f using(suc) where m_cod <> 'Y$' and _c.fecha <= f.fecha and f.f_nro=$ticket group by _c.m_cod)  tb on c.id_cotiz = tb.id");
        while ($link->NextRecord()) {
            $cotizaciones[$link->Record['m_cod']] = $link->Record;
        }
        echo json_encode($cotizaciones);
    }
    // Edicion
    function movObtenerDetalle($factura, $target)
    {
        $link = new My();
        $result = array();

        $efectivo = array("names"=>array("id","Concepto","Moneda","Entrada","Salida","Cotiz","Entrada_ref","Salida_ref"),
            "query"=>"select id_pago,id_concepto,m_cod,entrada,salida,cotiz,entrada_ref,salida_ref from efectivo where f_nro='$factura'");
        $cheques_ter = array("names"=>array("ID","Nro.","Nro.Cta.","Banco","Fecha Emis","Fecha Pag","Librador","Valor","Moneda","Cotiz","Valor Ref."),
            "query"=>"select id_cheque, nro_cheque,cuenta,id_banco,fecha_emis,fecha_pago,tipo,benef,valor,m_cod,cotiz,valor_ref from cheques_ter where f_nro='$factura' and estado = 'Pendiente'");
        $convenios = array("names"=>array("id","Convenio","Voucher","Monto"),
            "query"=>"select id_mov,cod_conv,voucher,monto from convenios where f_nro='$factura'");
        $cuotas = array("names"=>array("Nro.","Moneda","Monto","Cotiz","Monto Ref.","Dias","Vencimiento"),
            "query"=>"select id_cuota,moneda,monto,cotiz,monto_ref,dias,vencimiento from cuotas where f_nro='$factura'");
        $ejecutar = $$target;

        $link->Query($ejecutar['query']);
        $result["names"]=$ejecutar['names'];
        $result['data'] = array();
        while ($link->NextRecord()) {
            array_push($result['data'], $link->Record);
        }
        echo json_encode($result);
    }

    function actualizarEfectivo($id, $cotiz, $entrada, $salida, $entrada_ref, $salida_ref, $usuario)
    {
        $link = new My();
        $return = array();
        $link->Query("INSERT INTO logs (usuario,fecha,hora,accion,tipo,doc_num,data) VALUES ('$usuario',DATE(NOW()),TIME(NOW()),'actualizar','efectivo',$id,(SELECT CONCAT('ent:',entrada,', sal:',salida,', cotiz:',cotiz,', ent_r:',entrada_ref,', sal_r:',salida_ref) from efectivo where id_pago =$id))");
        if ($link->AffectedRows()>0) {
            $link->Query("UPDATE efectivo SET cotiz=$cotiz,entrada=$entrada,salida=$salida,entrada_ref=$entrada_ref,salida_ref=$salida_ref WHERE id_pago=$id");
            if ($link->AffectedRows()>0) {
                $return['msj']='Se guardaron los cambios';
            } else {
                $return['error']='No se pudo realizar el cambio';
            }
        } else {
            $return['error']='No se pudo realizar el respaldo de la operacion';
        }
        echo json_encode($return);
    }
    function actualizar()
    {
        $datos = json_decode($_POST['datos'], 1);
        $usuario = $_POST['usuario'];
        foreach ($datos as $dato) {
            $table = $dato['table'];
            $set = '';
            $where = '';
            $target = '';
            $log_val = '';
            foreach ($dato['data'] as $key => $value) {
                $log_val .= "'$key:',$key,',', ";
                $set .= "$key='".trim($value, '"')."', ";
            }
            foreach ($dato['where'] as $key => $value) {
                $target=trim($value, '"');
                $where = "$key='$target'";
            }
            $query = "update $table set " . trim($set, ', ') . " where " . $where;

            $link = new My();
            $return = array();
            $link->Query("INSERT INTO logs (usuario,fecha,hora,accion,tipo,doc_num,data) VALUES ('$usuario',DATE(NOW()),TIME(NOW()),'actualizar','$table',$target,(SELECT CONCAT('". trim($log_val, ",',', ") .") from $table where $where))");
            if ($link->AffectedRows()>0) {
                $link->Query($query);
                if ($link->AffectedRows()>0) {
                    $return['msj']='Se guardaron los cambios';
                } else {
                    $return['error']='No se pudo realizar el cambio';
                    $return['query']=$query;
                }
            } else {
                $return['error']='No se pudo realizar el respaldo de la operacion';
            }
            echo json_encode($return);
        }
    }
}

$det = new ArqueoVentasDet();

if (isset($_REQUEST['action'])) {
    $args = isset($_REQUEST['args'])?explode(',', $_REQUEST['args']):array();
    call_user_func_array(array($det,$_REQUEST['action']), $args);
} else {
    $det->error();
}
