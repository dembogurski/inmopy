<?php

/**
 * Description of Arqueo
 * @author Jorge Armando Colina
 * @date 14-10-2016
 */
require_once("../../Y_Template.class.php");
require_once("../../Y_DB_MySQL.class.php");  
require_once("../../Functions.class.php");

class Arqueo{ 
	private $template;
	private $convenios;
	private $usuario;
	private $desde;
	private $hasta;
	private $suc;
	private $hoy;
	private $fn;


    function __construct() {
		date_default_timezone_set('America/Asuncion');
		$this->template = new Y_Template("Arqueo.html");
		$this->template->Show("header"); 
		$this->convenios = $this->getConvenios();
		$this->usuario = $_REQUEST['usuario'];
		$this->desde = $_REQUEST['desde'];
		$this->hasta = $_REQUEST['hasta'];
		$this->moneda = $_REQUEST['moneda'];
		$this->suc = $_REQUEST['suc'];
		$this->hoy = date("d/m/Y");
		$this->fn = new Functions();
		

		$this->template->Set('time', date("m-d-Y H:i"));
		$this->template->Set('user', $this->usuario);
		$this->template->Set('papar_size', $_REQUEST['papar_size']);
        
		$this->template->Set('_desde', $this->desde);
		$this->template->Set('_hasta', $this->hasta);
		$this->template->Set('desde', $this->fn->invertirFecha($this->desde));
		$this->template->Set('hasta', $this->fn->invertirFecha($this->hasta));
		$this->template->Set('suc', $this->suc);        
		$this->template->Show("head");
	
		$usuarios = $this->getUsersMovs($this->suc,$this->desde,$this->hasta);
		$t_contado=0;
		$t_credito=0;
		$t_debito=0;
		$t_convenio=0;
		$t_devoluciones=0;
		$t_ch_dia=0;
		$t_ch_dif=0;
		$t_cuotas=0;
		$t_reservas=0;
                $t_reservas_ret=0;
		$t_total=0;
		if($usuarios){
			// Facturas de Venta
			if($this->verificatPermiso($this->usuario,'3.8.3')){
				$this->template->Show("Verif_ventas");
			}
			
			foreach ($usuarios as $usu){	 			
				$total=0;
				
				$this->template->Set('usuario',$usu['usuario']);
				$this->template->Set('vendedor',$usu['vendedor']);
				$this->template->Set('contado',$this->moneda($usu['efectivo'],0));
				$this->template->Set('credito',$this->moneda($usu['credito']['Tarjeta Credito'],0));
				$this->template->Set('debito',$this->moneda($usu['credito']['Tarjeta Debito'],0));
				$this->template->Set('retencion',$this->moneda($usu['credito']['Retencion'],0));
                                $this->template->Set('criptomoneda',$this->moneda($usu['credito']['Criptomoneda'],0));
                                $this->template->Set('pago_qr',$this->moneda($usu['credito']['Pago QR'],0));
				$this->template->Set('devoluciones',$this->moneda($usu['devoluciones'],0));
				$this->template->Set('reservas',$this->moneda($usu['reservas'],0));
                                $this->template->Set('reservas_ret',$this->moneda($usu['reservas_ret'],0));
				$this->template->Set('ch_dia',$this->moneda($usu['cheques']['Al Dia'],0));
				$this->template->Set('ch_dif',$this->moneda($usu['cheques']['Diferido'],0));
				$this->template->Set('cuotas',$this->moneda($usu['cuotas'],0));
				
				$total = $usu['efectivo']+$usu['credito']['Tarjeta Credito']+$usu['credito']['Tarjeta Debito']+$usu['credito']['Retencion']+$usu['credito']['Criptomoneda']+$usu['cheques']['Al Dia']+$usu['cheques']['Diferido']+$usu['cuotas']/*+$usu['reservas']*/-$usu['devoluciones'];				
				
				$t_contado +=$usu['efectivo'];
				$t_credito +=$usu['credito']['Tarjeta Credito'];
				$t_debito +=$usu['credito']['Tarjeta Debito'];
				$t_retencion +=$usu['credito']['Retencion'];
                                $t_criptomoneda +=$usu['credito']['Criptomoneda'];
                                $t_pago_qr +=$usu['credito']['Pago QR'];
				$t_devoluciones +=$usu['devoluciones'];
				$t_reservas +=$usu['reservas'];
                                $t_reservas_ret +=$usu['reservas_ret'];
				$t_ch_dia +=$usu['cheques']['Al Dia'];
				$t_ch_dif +=$usu['cheques']['Diferido'];
				$t_cuotas +=$usu['cuotas'];
				$t_total +=$total;
				$this->template->Set('total',$this->moneda($total,0));
				if((double)$total!==0.00){
				    $this->template->Show("data"); 
				}
			}			
		}
		$this->template->Set('t_contado',$this->moneda($t_contado,0));
		$this->template->Set('t_credito',$this->moneda($t_credito,0));
		$this->template->Set('t_debito',$this->moneda($t_debito,0));
		$this->template->Set('t_retencion',$this->moneda($t_convenio,0));
                $this->template->Set('t_criptomoneda',$this->moneda($t_criptomoneda,0));
                $this->template->Set('t_pago_qr',$this->moneda($t_pago_qr,0));
		$this->template->Set('t_devoluciones',$this->moneda($t_devoluciones,0));
		$this->template->Set('t_reservas',$this->moneda($t_reservas,0));
                $this->template->Set('t_reservas_ret',$this->moneda($t_reservas_ret,0));
		$this->template->Set('t_ch_dia',$this->moneda($t_ch_dia,0));
		$this->template->Set('t_ch_dif',$this->moneda($t_ch_dif,0));
		$this->template->Set('t_cuotas',$this->moneda($t_cuotas,0));
		
		
		$this->template->Set('t_total',$this->moneda($t_total,0));
		$this->template->Show("total");
		$this->template->Show("foot");
		
		// Sumatoria
		$resument = $this->getMonedasSum($this->suc,$this->desde,$this->hasta);
		
		foreach($resument as $moneda=>$cantidad){
			$this->template->Set($moneda,$this->moneda($resument[$moneda],0));
		}
		$this->template->Show("resumen_head");
		
		
		// Cheques  registrado por ventas
		$cheques_v = $this->getCheques($this->suc,$this->desde,$this->hasta,'ventas');
		if(count($cheques_v)>0){
			$this->template->Set('ex_head',"<th colspan='8' >Cheques Registrados por Ventas</th>");
			$this->template->Show("extra_head");
			$this->template->Set('ex_sub_head',"<th style='width:40%'>Cliente</th><th style='width:15%'>Banco</th><th style='width:8%'>Cuenta</th><th  style='width:8%'>N&deg;Cta.</th><th style='width:8%'>Valor</th><th style='width:8%'>Fecha Emision</th><th style='width:8%'>Fecha Pago</th><th style='width:5%'>Tipo</th>");
			$this->template->Set('ex_sub_head_conf','class="report_header"');
			$this->template->Show("extra_sub_head"); 			
			$this->template->Set('ex_sub_head_conf','');


			$t_total = 0;
			foreach($cheques_v as $cheque){
				$t_total += $cheque['valor_ref'];
				$this->template->Set('ex_data',"<td class='item'>".utf8_decode($cheque['benef'])."</td><td class='item'>".utf8_decode($cheque['nombre'])."</td><td class='num'>".$cheque['cuenta']."</td><td class='num'>".$cheque['nro_cheque']."</td><td class='num'>".$this->moneda($cheque['valor_ref'],2)."</td><td class='itemc'>".$cheque['emis']."</td><td class='itemc'>".$cheque['pago']."</td><td class='itemc'>".$cheque['tipo']."</td>");
				$this->template->Show("extra_body"); 
			}
			$this->template->Set('ex_foot',"<td colspan='4' class='item'>Total: </td><td class='num'>".$this->moneda($t_total,2)."</td><td colspan='2'></td>");
			$this->template->Show("extra_foot"); 
		}
                
                // Ventas a Credito
                $cuotas = $this->getVentasCredito($this->suc,$this->desde,$this->hasta);
                if(count($cuotas)>0){
                    $this->template->Set('ex_head',"<th colspan='5' >Ventas a Credito</th>");
                    $this->template->Show("extra_head");
                    $this->template->Set('ex_sub_head',"<th style='width:10%'>Ticket</th><th style='width:5%'>Moneda</th><th style='width:50%'>Cliente</th><th style='width:5%'>Cuotas</th><th style='width:10%'>Total Cuotas</th>");
                    $this->template->Show("extra_sub_head"); 
                    $t_total = 0;
                    foreach($cuotas as $cuota){
                        $t_total += $cuota['total'];
                        $this->template->Set('ex_data',"<td class='item'>".$cuota['f_nro']."</td><td class='itemc'>".$cuota['moneda']."</td><td class='item'>".$cuota['cliente']."</td><td class='itemc'>".$cuota['cuotas']."</td><td class='num'>".$this->moneda($cuota['total'],2)."</td>");
                        $this->template->Show("extra_body"); 
                    }
                    $this->template->Set('ex_foot',"<td colspan='4' class='item'>Total: </td><td class='num'>".$this->moneda($t_total,2)."</td>");
                    $this->template->Show("extra_foot"); 
                }
                
		// Cheques  registrado por Cuotas
		$cheques_c = $this->getCheques($this->suc,$this->desde,$this->hasta,'cuotas');
		if(count($cheques_c)>0){
			$this->template->Set('ex_head',"<th colspan='8'  >Cheques Registrados por Cobro de Cuotas</th>");
			$this->template->Show("extra_head");
			$this->template->Set('ex_sub_head',"<th style='width:40%'>Cliente</th><th style='width:15%'>Banco</th><th style='width:8%'>Cuenta</th><th style='width:8%'>N&deg;Cta.</th><th style='width:8%'>Valor</th><th style='width:8%'>Fecha Emision</th><th style='width:8%'>Fecha Pago</th><th style='width:5%'>Tipo</th>");
			$this->template->Set('ex_sub_head_conf','class="report_header"');
			$this->template->Show("extra_sub_head"); 			
			$this->template->Set('ex_sub_head_conf','');
			$t_total = 0;
			foreach($cheques_c as $cheque){
				$t_total += $cheque['valor_ref'];
				$this->template->Set('ex_data',"<td class='item'>".$cheque['benef']."</td><td class='item'>".$cheque['nombre']."</td><td class='num'>".$cheque['cuenta']."</td><td class='num'>".$cheque['nro_cheque']."</td><td class='num'>".$this->moneda($cheque['valor_ref'],2)."</td><td class='itemc'>".$cheque['emis']."</td><td class='itemc'>".$cheque['pago']."</td><td class='itemc'>".$cheque['tipo']."</td>");
				$this->template->Show("extra_body"); 
			}
			$this->template->Set('ex_foot',"<td colspan='4' class='item'>Total: </td><td class='num'>".$this->moneda($t_total,2)."</td><td colspan='2'></td>");
			$this->template->Show("extra_foot"); 
		}
                // Cobros de Cuotas
                $cobros = $this->getCobrosCuotas($this->suc,$this->desde,$this->hasta);
                if(count($cobros)>0){
                    $this->template->Set('ex_head',"<th colspan='5' >Cobros de Ventas a Credito</th>");
                    $this->template->Show("extra_head");
                    $this->template->Set('ex_sub_head',"<th style='width:40%'>Cliente</th><th style='width:10%'>Valor</th><th style='width:10%'>Recibo</th>");
                    $this->template->Show("extra_sub_head"); 
                    $t_total = 0;
                    foreach($cobros as $cobro){
                        $t_total += $cobro['valor'];
                        $this->template->Set('ex_data',"<td class='item'>".$cobro['cliente']."</td><td class='num'>".$this->moneda($cobro['valor'],2)."</td><td class='itemc'>".$cobro['recibo']."</td>");
                        $this->template->Show("extra_body"); 
                    }
                    $this->template->Set('ex_foot',"<td class='item'>Total: </td><td class='num'>".$this->moneda($t_total,2)."</td><td></td> ");
                    $this->template->Show("extra_foot"); 
                }
		
		// Notas de Creditos
		$notasCredito = $this->getNotasCredito($this->suc,$this->desde,$this->hasta);
                if(count($notasCredito)>0){
                    $this->template->Set('ex_head',"<th colspan='6' >Notas de Credito</th>");    
                    $this->template->Show("extra_head"); 
                    $this->template->Set('ex_sub_head',"<th>Nro.</th><th>Vendedor</th><th>Cliente</th><th>Factura N&deg;</th><th>Moneda</th><th>Total</th>");
                    $this->template->Show("extra_sub_head"); 
                    $t_total = 0;
                    if(count($notasCredito)>0){

                            foreach($notasCredito as $notaCredito){
                                    $t_total += $notaCredito['total'];
                                    $this->template->Set('ex_data',"<td class='num'>".$notaCredito['n_nro']."</td><td class='item'>".str_replace('zzzz','',$notaCredito['vendedor'])."</td><td class='item'>".$notaCredito['cliente']."</td><td class='num'>".$notaCredito['f_nro']."</td><td class='itemc'>".$notaCredito['moneda']."</td><td class='num'>".$this->moneda($notaCredito['total'],2)."</td>");
                                    $this->template->Show("extra_body"); 
                            }
                    }
                    $this->template->Set('ex_foot',"<td colspan='5' class='item'>Total: </td><td class='num'>".$this->moneda($t_total,2)."</td>");
                    $this->template->Show("extra_foot");
                }
		// Cambio de Divisas
		$opDivisas = $this->getCambioDivisas($this->suc,$this->desde,$this->hasta);
                if(count($opDivisas)>0){
                    $this->template->Set('ex_head',"<th colspan='7'><span id='cab_cm_div' data-target='det_cm_div' onclick='toggle($(this))' class='hide'>Diff. de Cambio</span></th>");
                    $this->template->Show("extra_head"); 
                    $this->template->Set('ex_sub_head',"<th>Operaci&oacute;n</th><th>Moneda</th><th>Entrada</th><th>Salida</th><th>Cotiz</th><th>Ent Ref</th><th>Sal Ref</th>");
                    $this->template->Set('ex_sub_head_conf','class="report_header det_cm_div" style="display: none;"');
                    $this->template->Show("extra_sub_head"); 
                    $this->template->Set('ex_sub_head_conf','');

                    $opDivEnteRef = 0;
                    $opDivSalRef = 0;
                    $opDivDiff = 0;
                    $color = '';      

                            
                            foreach($opDivisas as $opDivisa){
                                    $this->template->Set('ex_conf','class="det_cm_div"');
                                    $this->template->Set('ex_data',"<td class='item'>".$opDivisa['descrip']."</td><td class='itemc'>".$opDivisa['m_cod']."</td><td class='num'>".$this->moneda($opDivisa['entrada'],2)."</td><td class='num'>".$this->moneda($opDivisa['salida'],2)."</td><td class='num'>".$this->moneda($opDivisa['cotiz'],2)."</td><td class='num'>".$this->moneda($opDivisa['ent_ref'],2)."</td><td class='num'>".$this->moneda($opDivisa['sal_ref'],2)."</td>");
                                    $opDivEnteRef += $opDivisa['ent_ref'];
                                    $opDivSalRef += $opDivisa['sal_ref'];
                                    $this->template->Show("extra_body"); 
                            }
                            $this->template->Set('ex_conf','');
                            $opDivDiff = $opDivEnteRef-$opDivSalRef;

                            
                    switch($opDivDiff){
                            case $opDivDiff>0:
                                    $color = "green";
                                    break;
                            case $opDivDiff<0:
                                    $color = "red";
                                    break;
                            default:
                                    $color = "black";
                    }

                    $this->template->Set('ex_foot',"<td colspan='5' class='itemc' style='color:$color'> Diferencia: = ".$this->moneda($opDivDiff,2)." </td><td class='num'> Ent: ".$this->moneda($opDivEnteRef,2)."</td><td class='num'> Sal: ".$this->moneda($opDivSalRef,2)."</td>");
                    $this->template->Show("extra_foot");
                }         
		// Intereses Cobrados
		$intCobrados = $this->getInteresesCobrados($this->suc,$this->desde,$this->hasta);
                if(count($intCobrados)>0){		
                    $this->template->Set('ex_head',"<th colspan='5'><span id='cab_int_cob' data-target='det_int_cob' onclick='toggle($(this))' class='hide'>Intereses Cobrados</span></th>");
                    $this->template->Show("extra_head"); 
                    $this->template->Set('ex_sub_head',"<th>Cliente</th><th>Interes</th><th>Moneda</th><th>Cotiz</th><th>Ref</th>");
                    $this->template->Set('ex_sub_head_conf','class="report_header det_int_cob" style="display: none;"');
                    $this->template->Show("extra_sub_head"); 
                    $this->template->Set('ex_sub_head_conf','');
                    $intSum = 0;


                            foreach($intCobrados as $intCb){
                                    $this->template->Set('ex_conf','class="det_int_cob"');
                                    $this->template->Set('ex_data',"<td class='item'>".$intCb['cliente']."</td><td class='num'>".$this->moneda($intCb['interes'],2)."</td><td class='itemc'>".$intCb['moneda']."</td><td class='num'>".$this->moneda($intCb['cotiz'],2)."</td><td class='num'>".$this->moneda($intCb['ref'],2)."</td>");
                                    $intSum += $intCb['ref'];
                                    $this->template->Show("extra_body"); 
                            }
                            $this->template->Set('ex_conf','');

                    $this->template->Set('ex_foot',"<td colspan='5' class='itemc'> Total: = ".$this->moneda($intSum,2)." </td>");
                    $this->template->Show("extra_foot");
                }
		// Cobros
		$cobros = $this->getCobros($this->suc,$this->desde,$this->hasta);
		if(count($cobros)>0){
			// Cobros
			$verif_cobros = $this->verificatPermiso($this->usuario,'3.8.2')?"onclick='verifCobros()' id='cobros'":"";
			$this->template->Set('cobros_ex_head',"<th colspan='2' style='cursor:pointer' $verif_cobros >Cobros</th>");
			$this->template->Show("cobros_head"); 
			$this->template->Set('ex_sub_head',"<th>Metodo</th><th>Total</th>");
			$this->template->Set('ex_sub_head_conf',"");			
			$this->template->Show("extra_sub_head");  
			$t_total = 0;
			foreach($cobros as $metodo=>$total){
				$t_total += $total;
				$this->template->Set('ex_data',"<td class='item'>".$metodo."</td><td class='num'>".$this->moneda($total,2)."</td>");
				$this->template->Show("extra_body"); 
			}
			$this->template->Set('cobos_foot',"<td class='item'>Total: </td><td class='num'>".$this->moneda($t_total,2)."</td>");
			$this->template->Set('visibility',"visible");
			$this->template->Show("cobos_foot"); 
		}else{
			$this->template->Set('visibility',"hidden");
			$this->template->Show("cobros_head"); 
			$this->template->Show("cobos_foot"); 
		}
		
		
		$this->template->Show("resumen_foot");
		$this->template->Set('ch_dia',$usu['cheques']['Al Dia']);
		$this->template->Show("foot");
		$this->template->Show("end");
    }

	private function start(){
		$this->template->Show("header");
	}

	// Retor usuarios con venta en ese día
	private function getUsersMovs($suc,$desde,$hasta){
		$data = array();
		$link = new My();
		$link->Query("SELECT u.usuario,concat(u.nombre,', ',u.apellido) as vendedor from factura_venta f inner join usuarios u using(usuario) where f.suc='$suc' and f.fecha_cierre between '$desde' and '$hasta' and f.estado = 'Cerrada' union select u.usuario,concat(u.nombre,', ',u.apellido) as vendedor from reservas r inner join usuarios u using(usuario) where r.suc='$suc' and r.fecha between '$desde' and '$hasta'   union select u.usuario,concat(u.nombre,', ',u.apellido) as vendedor from nota_credito n inner join usuarios u using(usuario) where n.suc='$suc' and n.fecha between '$desde' and '$hasta' and n.estado = 'Cerrada' group by usuario");
		while($link->NextRecord()){
			$user = $link->Record['usuario'];
			array_push($data,[
				"usuario"=>$user,
				"vendedor"=>$link->Record['vendedor'],
				"efectivo"=>$this->getVentasContado($user,$suc,$desde,$hasta),
				"credito"=>$this->getVentasConvenio($user,$suc,$desde,$hasta),
				"cheques"=>$this->getVentasCheque($user,$suc,$desde,$hasta),
				"cuotas"=>$this->getVentasCuotas($user,$suc,$desde,$hasta),
				"devoluciones"=>$this->getDevoluciones($user,$suc,$desde,$hasta),
				"reservas"=>$this->getReservas($user,$suc,$desde,$hasta),
                                "reservas_ret"=>$this->getReservasRet($user,$suc,$desde,$hasta)
			]);
		}
                
               
                
		$link->Close();
		return count($data)>0?$data:false;
	}

	// Ventas contado
	private function getVentasContado($user,$suc,$desde,$hasta){
		$data = array();
		$link = new My();
		$monto = 0;
		$link->Query("SELECT e.entrada_ref, e.salida_ref from efectivo e inner join factura_venta f using(f_nro) where f.suc='$suc' and f.fecha_cierre between '$desde' and '$hasta' and f.estado = 'Cerrada' and f.usuario='$user'");
		while($link->NextRecord()){
			$monto += (float)$link->Record['entrada_ref'] - (float)$link->Record['salida_ref'];
		}
		return $monto;
		$link->Close();
	}

	// Lista de ventas con convenios 
	private function getVentasConvenio($user,$suc,$desde,$hasta){
		$data['Tarjeta Credito'] = 0;
		$data['Tarjeta Debito'] = 0;
		$data['Retencion'] = 0;
		$link = new My();
		$convenios = $this->getConvenios();
                $Qry = "SELECT c.cod_conv,c.monto,t.tipo FROM convenios c INNER JOIN factura_venta f USING(f_nro) INNER JOIN tarjetas t ON c.cod_conv = t.cod_tarjeta  where f.suc='$suc' and f.fecha_cierre between '$desde' and '$hasta' and f.estado = 'Cerrada' and f.usuario = '$user'";
		$link->Query($Qry);
		
                while($link->NextRecord()){
			$cod_conv = $link->Record['cod_conv'];
                        $tipo = $link->Record['tipo'];
			$data[$tipo] += (float)$link->Record['monto'];
		}
                        
		$link->Close();
		return $data;
	}
	// Lista de ventas con cheques
	private function getVentasCheque($user,$suc,$desde,$hasta){
		$data['Al Dia'] = 0;
		$data['Diferido'] = 0;
		$link = new My();
		$link->Query("SELECT if(c.fecha_emis=c.fecha_pago,'Al Dia','Diferido') as tipo,sum(c.valor_ref) as monto from cheques_ter c inner join factura_venta f using(f_nro) where f.suc='$suc' and f.fecha_cierre between '$desde' and '$hasta' and f.estado = 'Cerrada' and f.usuario = '$user' group by tipo");
		while($link->NextRecord()){
			$tipo = $link->Record['tipo'];
			$data[$tipo] += (float)$link->Record['monto'];
		}
		$link->Close();
		return $data;
	}
	
	// Sumatoria de cuotas
	private function getVentasCuotas($user,$suc,$desde,$hasta){
		$data = 0;
		$link = new My();
		$link->Query("SELECT sum(c.monto_ref) as monto from cuotas c inner join factura_venta f using(f_nro) where f.suc='$suc' and f.fecha_cierre between '$desde' and '$hasta' and f.estado = 'Cerrada' and f.usuario = '$user'");
		if($link->NextRecord()){
			$data = $link->Record['monto'];
		}
		$link->Close();
		return $data;
	}
	
	// Devoluciones
	private function getDevoluciones($user,$suc,$desde,$hasta){
		$data = 0;
		$link = new My();
		$link->Query("SELECT sum(n.total) as monto from nota_credito n inner join factura_venta f using(f_nro) where n.suc='$suc' and n.fecha between '$desde' and '$hasta' and f.estado = 'Cerrada' and n.estado='Cerrada' and f.usuario = '$user'");
		if($link->NextRecord()){
			$data = $link->Record['monto'];
		}
		$link->Close();
		return $data;
	}
	
	// Reservas Entrantes
	private function getReservas($user,$suc,$desde,$hasta){
		$data = 0;
		$link = new My();		
		$link->Query("SELECT sum(senia_entrega_ref) as monto from reservas where suc='$suc' and fecha between '$desde' and '$hasta' /* and estado ='Pendiente'*/ and usuario ='$user'");
		if($link->NextRecord()){
			$data = $link->Record['monto'];
		}
		$link->Close();
		return $data;
	}
        // Reservas Retiradas
        private function getReservasRet($user,$suc,$desde,$hasta){
		$data = 0;
		$link = new My();		
		$link->Query("SELECT SUM(senia_entrega_ref) AS monto FROM factura_venta f, reservas r WHERE f.nro_reserva = r.nro_reserva AND f.nro_reserva IS NOT NULL AND f.usuario = '$user' AND f.suc = '$suc' AND f.fecha BETWEEN '$desde' AND '$hasta' AND r.estado = 'Retirada'");
		if($link->NextRecord()){
		  $data = $link->Record['monto'];
		}
		$link->Close();
		return $data;
	}
	
	// Lista de conveniso registrados en SAP
	private function getConvenios(){
		$link = new My();
		$link->Query("SELECT nombre, tipo FROM tarjetas  ORDER BY tipo ASC");
		$convecios = array();
		while($link->NextRecord()){
		    $convecios[$link->Record['nombre']] = $link->Record['tipo'];
		}
		return $convecios;
	}
	
	// Notas de credito
	private function getNotasCredito($suc,$desde,$hasta){
		$link = new My();
		$link->Query("SELECT n_nro, concat(u.nombre,', ',u.apellido) as vendedor, n.cliente, n.f_nro,f.moneda, n.total from nota_credito n inner join factura_venta f using(f_nro) inner join usuarios u on f.usuario=u.usuario where f.suc='$suc' and n.fecha between '$desde' and '$hasta' and f.estado = 'Cerrada' and n.estado='Cerrada' order by vendedor asc");
		$notasCredito = array();
		while($link->NextRecord()){
		    array_push($notasCredito, $link->Record);
		}
		return $notasCredito;
	}
	// Lista de Cheques
	private function getCheques($suc,$desde,$hasta,$tipo){
		$link = new My();
		if($tipo == "ventas"){
		   $query = "SELECT benef,b.nombre,c.cuenta,c.nro_cheque,c.valor_ref,DATE_FORMAT(c.fecha_emis,'%d-%m-%Y') as emis,DATE_FORMAT(c.fecha_pago,'%d-%m-%Y') as pago,tipo from cheques_ter c inner join bancos b using(id_banco) where c.id_concepto=1 and c.fecha_ins between '$desde' and '$hasta' and c.suc = '$suc' and estado <> 'Anulado'";
		}else{
		   $query = "SELECT benef,b.nombre,c.cuenta,c.nro_cheque,c.valor_ref,DATE_FORMAT(c.fecha_emis,'%d-%m-%Y') as emis,DATE_FORMAT(c.fecha_pago,'%d-%m-%Y') as pago,tipo from cheques_ter c inner join bancos b using(id_banco) where c.id_concepto=8 and c.fecha_ins between '$desde' and '$hasta' and c.suc = '$suc' and estado <> 'Anulado'";
		}
		
		$link->Query($query);
		$cheques = array();
		while($link->NextRecord()){
		    array_push($cheques, $link->Record);
		}
		return $cheques;
	}
        // Ventas a credito
	private function getVentasCredito($suc,$desde,$hasta){
		$link = new My();
		$link->Query("SELECT f.f_nro, f.moneda,cliente,COUNT(c.f_nro) AS cuotas,SUM(c.monto) AS total  FROM factura_venta f, cuotas c WHERE f.f_nro = c.f_nro AND f.suc = '$suc' AND f.fecha BETWEEN '$desde' AND '$hasta' and f.estado ='Cerrada' GROUP BY f.f_nro,f.moneda, cod_cli ORDER BY cliente ASC, id_cuota ASC");
		$cuotas = array();
		while($link->NextRecord()){
		    array_push($cuotas, $link->Record);
		}
		return $cuotas;
	}
        private function getCobrosCuotas($suc,$desde,$hasta){
		$link = new My();
		$link->Query("SELECT cliente,SUM(entrega_actual) AS valor,p.folio_num AS recibo FROM pagos_recibidos p, pago_rec_det d WHERE p.id_pago = d.id_pago AND suc = '$suc'  AND  fecha BETWEEN '$desde' AND '$hasta' GROUP BY cliente,p.folio_num");
		$cobros = array();
		while($link->NextRecord()){
		    array_push($cobros, $link->Record);
		}
		return $cobros;
	}
	// Totales por monedas
	private function getMonedasSum($suc,$desde,$hasta){
		$monedas = ['gs'=>'0.00','ps'=>'0.00','us'=>'0.00','rs'=>'0.00','sum'=>'0.00'];
		$link = new My();
		//$query = "select replace(lcase(m.m_cod),'$','s') as moneda, sum(f.entrada)-sum(f.salida) as mov from efectivo f inner join monedas m using(m_cod) where f.suc='$suc' and f.fecha between '$desde' and '$hasta' group by moneda union select 'sum',sum(f.entrada_ref)-sum(f.salida_ref) as mov from efectivo f inner join monedas m using(m_cod) where f.suc='$suc' and f.fecha between '$desde' and '$hasta'";
		$query = " SELECT replace(lcase(m.m_cod),'$','s') as moneda, sum(if((f.f_nro is not null and f.estado = 'Cerrada') or f.f_nro is null,e.entrada,0)) - sum(if((f.f_nro is not null and f.estado = 'Cerrada') or f.f_nro is null,e.salida,0)) as mov from efectivo e left join factura_venta f on e.f_nro=f.f_nro inner join monedas m using(m_cod)  where e.suc='$suc' and e.fecha between '$desde' and '$hasta' group by m.m_cod union select 'sum', sum(if((f.f_nro is not null and f.estado = 'Cerrada') or f.f_nro is null,e.entrada_ref,0))-sum(if((f.f_nro is not null and f.estado = 'Cerrada') or f.f_nro is null,e.salida_ref,0)) as mov from efectivo e left join factura_venta f on e.f_nro=f.f_nro inner join monedas m using(m_cod) where e.suc='$suc' and e.fecha between '$desde' and '$hasta'";	
                //if($this->usuario == "douglas"){                 print_r($resument);            }
		$link->Query($query);

		while($link->NextRecord()){
		  $monedas[$link->Record['moneda']] = $link->Record['mov'];
		}
		return $monedas;
	}
	
	// Cobros
	private function getCobros($suc,$desde,$hasta){
		$cobro = array();
		$link = new My();
		$group_by = 'group by p.id_pago,p.moneda';
		//$efectivos = "SELECT 'Efectivo' as metodo,p.moneda,p.id_pago, sum(d.valor) as suma, sum(e.entrada_ref - e.salida_ref) as mov from pagos_recibidos p inner join pago_rec_det d  using(id_pago) inner join efectivo e on p.id_pago=e.trans_num where p.suc='$suc' and p.fecha between '$desde' and '$hasta' $group_by ";
		$efectivos = "SELECT 'Efectivo' as metodo,e.m_cod as moneda,e.trans_num as id_pago,'' as suma,sum(e.entrada_ref - e.salida_ref) as mov  from efectivo e where e.fecha between '$desde' and '$hasta' and e.suc='$suc' and e.id_concepto=7";
		//$cheques = "SELECT 'Cheque',uno.moneda,uno.id_pago, sum(d.valor), sum(d.entrega_actual)  from (SELECT p.id_pago, p.moneda from cheques_ter c inner join pagos_recibidos p on p.id_pago=c.trans_num where p.suc='$suc' and p.fecha between '$desde' and '$hasta' $group_by) as uno inner join  pago_rec_det d using(id_pago)";
		$cheques = "SELECT 'Cheque', c.m_cod,p.id_pago, pagos.valor, sum(c.valor_ref) from  cheques_ter c inner join pagos_recibidos p on p.id_pago=c.trans_num inner join (select d.id_pago,sum(d.valor) as valor from pago_rec_det d group by d.id_pago) as pagos using(id_pago) where p.suc='$suc' and p.fecha between '$desde' and '$hasta' $group_by";
		$convenios = "SELECT t.tipo AS metodo,pagos.moneda,pagos.id_pago, SUM(pagos.valor), SUM(c.monto) AS mov FROM  (SELECT p.moneda,p.id_pago,d.valor,p.suc,p.fecha FROM pagos_recibidos p INNER JOIN pago_rec_det d  USING(id_pago) 
                WHERE p.suc='$suc' AND p.fecha BETWEEN '$desde' AND '$hasta'  $group_by) AS pagos INNER JOIN convenios c ON pagos.id_pago = c.trans_num INNER JOIN tarjetas t ON c.cod_conv = t.cod_tarjeta GROUP BY t.tipo";
		$bcos_mov = "SELECT 'Banco',p.moneda,p.id_pago, sum(d.valor), b.entrada from pagos_recibidos p inner join pago_rec_det d  using(id_pago) inner join bcos_ctas_mov b on p.id_pago = b.trans_num where p.suc='$suc' and p.fecha between '$desde' and '$hasta' $group_by";
		
		$link->Query("$efectivos union $cheques union $convenios union $bcos_mov");
		
		while($link->NextRecord()){
			$cobro[$link->Record['metodo']] += $link->Record['mov'];
		}
		return $cobro;
	}
	
	// Cambio de Divisas
	private function getCambioDivisas($suc,$desde,$hasta){
		$cDivisas = array();
		$link = new My();		
		$conceptos = "5,6,10,11,14,15,16,17"; // Conceptos
		$cambioDivisas = "SELECT c.descrip,e.m_cod,sum(e.entrada) as entrada, sum(e.salida) as salida, e.cotiz as cotiz, sum(e.entrada_ref) as ent_ref,sum(e.salida_ref) as sal_ref from efectivo e inner join conceptos c using(id_concepto) where e.suc='$suc' and c.id_concepto in ($conceptos) and e.fecha between '$desde' and '$hasta' group by c.id_concepto,e.m_cod order by c.descrip asc";
		
		$link->Query($cambioDivisas);
		
		while($link->NextRecord()){
			array_push($cDivisas,$link->Record);
		}
		return $cDivisas;
	}

	// Intereses cobrados
	private function getInteresesCobrados($suc,$desde,$hasta){
		$intCob = array();
		$link = new My();		
		$interesesCobrados = "SELECT p.cliente,d.interes,p.moneda,p.cotiz,d.interes*p.cotiz as ref from pagos_recibidos p inner join pago_rec_det d using(id_pago) where p.estado = 'Cerrado' and d.interes>0  and p.suc='$suc' and p.fecha between '$desde' and '$hasta'";
		
		$link->Query($interesesCobrados);
		
		while($link->NextRecord()){
			array_push($intCob,$link->Record);
		}
		return $intCob;
	}
	
	// Verifica permisos
	private function verificatPermiso($user,$permiso){
		$link = new My();
		$link->Query("SELECT u.nombre AS usu,ug.usuario,g.nombre,p.id_permiso AS id_permiso,descripcion,trustee FROM  usuarios u,grupos g, usuarios_x_grupo ug, permisos_x_grupo p, permisos pr WHERE u.usuario = ug.usuario AND ug.id_grupo = p.id_grupo AND g.id_grupo = ug.id_grupo AND p.id_permiso = pr.id_permiso  AND ug.usuario = '$user' AND  p.id_permiso = '$permiso'");
		if( $link->NextRecord() && $link->NumRows()>0 ){
			return true;
		}else{
			return false;
		}
	}
	// Format 
	private function moneda($var,$dec){
		return number_format($var, $dec, ',', '.');
	}
}

new Arqueo();
?>