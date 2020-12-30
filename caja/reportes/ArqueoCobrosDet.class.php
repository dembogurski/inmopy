<?php

/**
 * Description of Arqueo
 * @author Jorge Armando Colina
 * @date 14-10-2016
 */
require_once("../../Y_Template.class.php");
require_once("../../Y_DB_MySQL.class.php"); 
                        
require_once("../../Functions.class.php");

class ArqueoCobrosDet{
	private $template;
    function __construct() {
		$this->template = new Y_Template("ArqueoCobrosDet.html");
	}
	function error(){
		$this->template->Show("error");
	}
	// Cobros
	function showCobros($suc,$desde,$hasta){
		$this->template->Show("header");
		$this->template->Show("c_head");
		$link = new My();
		$this->template->Show("cobro_head");
		$this->template->Show("menu_head");
		$query = "select id_pago,cliente,if(control_caja='Si','si','no') as control from pagos_recibidos p where p.suc='$suc' and p.fecha between '$desde' and '$hasta' and estado = 'Cerrado' order by id_pago asc";
		$link->Query($query);
		while($link->NextRecord()){
                        $cliente = $link->Record['cliente'];
                        $nombre_corto = explode(" ", $cliente)[0];
			$this->template->Set("cobro",$link->Record['id_pago']);
                        $this->template->Set("menu_cliente",$cliente);
                        $this->template->Set("nombre_corto",  $nombre_corto );
			$this->template->Set("control",$link->Record['control']);
			$this->template->Show("menu_body");
		}
		$this->template->Show("menu_foot");
		$this->template->Show("c_are");
		$this->template->Show("cobro_foot");
		$this->template->Show("end");
		
	}
	// Devuelve Pagos Recibidos relacionados a los id de pago
	function getPagosRec($cobro){
		$link = new My();
		$r_movs = array();
		$movs['cli_data'] = "SELECT p.id_pago, p.cliente, p.estado, DATE_FORMAT(p.fecha,'%d-%m-%Y') AS fecha, sum(d.entrega_actual) AS float0monto, sum(d.interes) AS float0interes FROM pagos_recibidos p INNER JOIN pago_rec_det d USING(id_pago) WHERE p.id_pago = '$cobro'";
		$movs['efectivo'] = "SELECT e.id_pago, DATE_FORMAT(e.fecha,'%d-%m-%Y') AS c0fecha,e.m_cod AS c0m_cod,e.suc AS c0suc, sum(e.entrada_ref - e.salida_ref) AS float0r_mov FROM efectivo e  WHERE e.trans_num='$cobro' group by e.m_cod, e.trans_num";
		$movs['cheques_ter'] = "SELECT id_cheque, c.nro_cheque AS r0nro_cheque, id_banco as r0id_banco, cuenta as r0cuenta, c.benef AS l0benef,DATE_FORMAT(c.fecha_emis,'%d-%m-%Y') AS c0fecha_emis, DATE_FORMAT(c.fecha_pago,'%d-%m-%Y') AS c0fecha_pago, c.tipo as c0tipo, c.valor AS float0valor, c.cotiz AS float0cotiz, c.valor_ref AS float0valor_ref FROM cheques_ter c WHERE c.trans_num='$cobro' ";
		$movs['convenios'] = "SELECT c.id_mov, c.suc AS c0suc, c.nombre AS c0nombre,c.voucher AS r0voucher,DATE_FORMAT(c.fecha,'%d-%m-%Y') AS c0fecha,c.monto AS float0monto FROM convenios c WHERE c.trans_num='$cobro'";
		$movs['bcos_ctas_mov'] = "SELECT b.id_mov,b.suc AS c0suc,bc.nombre AS l0nombre, b.nro_deposito AS r0nro_deposito,b.cuenta AS r0cuenta, b.entrada AS float0entrada from bcos_ctas_mov b INNER JOIN bancos bc USING(id_banco) WHERE b.trans_num='$cobro'";

		foreach($movs as $metodo=>$query){
			$link->Query($query);
			$mov = array();
			while($link->NextRecord()){
				array_push($mov,$link->Record);
			}
			if(count($mov)>0){
				$r_movs[$metodo] = $mov;
			}
		}
		
		$r_movs['cli_data'][0]['cuotas'] = $this->getCotasDet($cobro);		
		echo json_encode($r_movs,JSON_FORCE_OBJECT);
	}
	// Lista de Convenios
	function getConvenios() {
            
        $link = new My();
        $convenios = array();
        $link->Query("SELECT tipo,cod_tarjeta as CreditCard,nombre as CardName, 
        case 
        when tipo = 'Tarjeta Debito'  then 1  
        WHEN tipo = 'Tarjeta Credito'  THEN 1
        WHEN tipo = 'Asociacion'  THEN 2
        else 3
        end as prioridad
        FROM tarjetas order by prioridad asc , CardName asc");
        
        while ($link->NextRecord()) {
            $convenios['"'.$link->Record['CreditCard'].'"'] = $link->Record['CardName'];
        }
        echo json_encode($convenios);
    }
	// Actializar datos
	function actualizar(){
		$my = new My();
		$v = json_decode($_REQUEST['valores'], true);
		switch($v['col']){
			case 'fecha_emis':
			case 'fecha_pago':
			$v['valor'] = date('Y-m-d',strtotime($v['valor']));
			break;
		}
		$query = '';
		if($v['tabla'] == 'convenios'){
			$query =  "UPDATE convenios SET cod_conv = ".$v['cod_conv'].", nombre = '".$v['nombre']."' WHERE id_mov = '".$v['id']."'";
		}else{
			$query =  "UPDATE ".$v['tabla']." SET ".$v['col']." = '".$v['valor']."' WHERE ".$v['id_col']." = '".$v['id']."'";
		}
		$my->Query($query);		
		if($my->AffectedRows() > 0){
			$r['msg'] = "Actualizacion exitosa";
		}else{
			$r['msg'] = "No se actualizo ningun dato";
		}
		echo json_encode($r);
	}
	// Detalle de la cuota
	function getCotasDet($ref){
		$link = new My();
		$link->Query("SELECT factura AS int_sap_doc,id_cuota AS c_id_cuota,folio_num,DATE_FORMAT(fecha_fac,'%d-%m-%Y') AS fecha_fac, entrega_actual AS float_entrega_actual ,suc  FROM pago_rec_det d, factura_venta f WHERE f.f_nro = d.factura AND  id_pago=$ref");
		$cuota_det = array(); 
		while($link->NextRecord()){ 
		   array_push($cuota_det,$link->Record); 
		}
		return $cuota_det;

	}
	// Marca como verificado un Cobro tabla pagos_recibidos
	function verificado($cobro){
		$db = new My();
                $db_u = new My();
                $db->Query("SELECT factura,id_cuota,entrega_actual FROM pago_rec_det WHERE id_pago = $cobro");
                
                while($db->NextRecord()){
                   $factura = $db->Record['factura'];
                   $id_cuota = $db->Record['id_cuota'];
                   $entrega_actual= $db->Record['entrega_actual'];
                   
                   $db_u->Query("UPDATE cuotas SET saldo = saldo - $entrega_actual WHERE f_nro = $factura AND id_cuota = $id_cuota;");
                   $db_u->Query("UPDATE cuotas SET estado ='Cancelada' WHERE f_nro = $factura AND  saldo = 0;"); //id_cuota = $id_cuota and // Todas las cuotas con saldo 0 de esta factura poner como cancelada
                }                    
                
		$db->Query("UPDATE pagos_recibidos set control_caja='Si', e_sap = 1 where id_pago = $cobro");   
		if($db->AffectedRows() > 0){
			echo '{"msg":"Ok"}';
		}else{
			echo '{"msg":"error"}';
		}
	}
	// Eliminar un cobro
	function eliminar($cobro){
		$link = new My();
		$eliminado = array();
		$eliminar['deposito']="DELETE from bcos_ctas_mov WHERE trans_num = $cobro";
		$eliminar['efectivo']="DELETE from efectivo WHERE trans_num = $cobro";
		$eliminar['convenios']="DELETE from convenios WHERE trans_num = $cobro";
		$eliminar['cheques']="DELETE from cheques_ter WHERE trans_num = $cobro";
		$eliminar['det']="DELETE from pago_rec_det WHERE id_pago = $cobro";
		$eliminar['pago']="DELETE from pagos_recibidos WHERE id_pago = $cobro";

		foreach($eliminar as $key=>$value){
			$link->Query($value);
			if($link->AffectedRows() > 0){
				$eliminado[$key] = 'OK';
			}
		}

		if(count($eliminado) > 0){
			$eliminado['msg'] = "Ok";
			echo json_encode($eliminado);
		}else{
			echo '{"msg":"error"}';
		}
	}
	function modificarFechaPago($n_nro, $nFecha){
		$link = new My();
		$fecha = date('Y-m-d',strtotime($nFecha));
		$actualizado = array();
		
		$actializar['deposito']="UPDATE bcos_ctas_mov SET fecha_reg='$fecha', fecha='$fecha'  WHERE trans_num = $n_nro";
		$actializar['efectivo']="UPDATE efectivo SET fecha_reg='$fecha', fecha='$fecha' WHERE trans_num = $n_nro";
		$actializar['convenios']="UPDATE convenios SET fecha='$fecha' WHERE trans_num = $n_nro";
		$actializar['cheques']="UPDATE cheques_ter SET fecha_ins='$fecha' WHERE trans_num = $n_nro";
		$actializar['pago']="UPDATE pagos_recibidos SET fecha='$fecha' WHERE id_pago = $n_nro";

		foreach($actializar as $key=>$value){
			$link->Query($value);
			if($link->AffectedRows() > 0){
				$actualizado[$key] = 'OK';
			}
		}

		if(count($actualizado) > 0){
			$actualizado['msg'] = "Ok";
			echo json_encode($actualizado);
		}else{
			echo '{"msg":"error"}';
		}
	}

	function getBancos(){
		$link = new My();
		$bancos = array();
		$link->Query("SELECT id_banco, nombre FROM bancos");
		while($link->NextRecord()){
			$line = $link->Record;
			$bancos[$line['id_banco']] = utf8_encode($line['nombre']);
		}
		$link->Close();
		echo json_encode($bancos);
	}
}

$det = new ArqueoCobrosDet();

if(isset($_REQUEST['action'])){
     call_user_func_array(array($det,$_REQUEST['action']), explode(',', $_REQUEST['args']));
 }else{
     $det->error();
 }
?>