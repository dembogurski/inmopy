<?php

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


class CambioDivisas {
    private $template;
	
    function __construct(){
        $this->template = new Y_Template("CambioDivisas.html");
    }
    public function start(){
        $suc = filter_input(INPUT_POST, 'suc', FILTER_SANITIZE_SPECIAL_CHARS);
        $this->template->Set("currentCotiz",$this->getCurrentCotizXSuc($suc));
        $this->template->Show("header");
        $this->template->Show("cambio_divisas_head");
        $this->template->Show("cambio_divisas_body");
        $this->template->Show("cambio_divisas_footer");
    }
    public function getMovimientos($suc,$date){
        $my_link = new My();
        $my_link->Query("SELECT distinct(m_cod) as moneda, sum(entrada)-sum(salida) as diff from efectivo where suc='$suc' and fecha='$date' group by m_cod having(diff<>0)");
        $result=array();
        $response='';
        if($my_link->NumRows()>0){
            while($my_link->NextRecord()){
                array_push($result, $my_link->Record);
            }
            if(strlen($result[0]['moneda'])<1){
                $response = '{"err":"No se encontraron registros de movimientos para '.$suc.' en la fecha '.$date.'"}';
            }else{
                $response = '{"msj":"OK","data":'.json_encode($result,JSON_FORCE_OBJECT).',"cotiz":' . $this->getCurrentCotizXFechaXSuc($suc,$date) . '}';
            }
        }else{
            $response = '{"err":"No se encontraron registros Suc: '.$suc.' en la fecha '.$date.'"}';
        }
        $my_link->Close();
        echo $response;
    }

    public function getMonedasXDia($suc,$date,$moneda){
        $my_link = new My();
        $my_link->Query("SELECT cotiz, sum(entrada) as ent,sum(entrada_ref) as ent_ref,sum(salida) as sal,sum(salida_ref) as sal_ref,sum(entrada)-sum(salida) as diff,date_format(now(),'%d-%m-%Y %H:%i:%s') as tstamp from efectivo where suc='$suc' and fecha='$date' and m_cod='$moneda'");
        $result=array();
        $response='';
        if($my_link->NumRows()>0){
            while($my_link->NextRecord()){
                array_push($result, $my_link->Record);
            }
            /*            
            if(strlen($result[0]['moneda'])<1){
                $response = '{"err":"No se encontraron registros de movimientos para '.$suc.' en la fecha '.$date.', moneda'.$moneda.'"}';
            }else{*/
                $response = '{"msj":"OK","data":'.json_encode($result,JSON_FORCE_OBJECT).'}';
            //}
        }else{
            $response = '{"err":"No se encontraron registros de movimientos para '.$suc.' en la fecha '.$date.', moneda'.$moneda.'"}';
        }
        $my_link->Close();
        echo $response;
    }
    // Devuelve las ultimas cotizaciones registradas por sucursal
    private function getCurrentCotizXSuc($suc){
        $my_link = new My();
        $my_link->Query("SELECT c.id_cotiz,c.suc,c.m_cod,c.fecha,c.hora,c.compra,c.venta,c.ref from cotizaciones c inner join (SELECT max(_c.id_cotiz) as id,_c.m_cod from cotizaciones _c where _c.suc='$suc' and m_cod <> 'Y$' group by _c.m_cod)  tb on c.id_cotiz = tb.id");
        $response = "{";
        $first = true;
        while($my_link->NextRecord()){
            $m_cod = $my_link->Record['m_cod'];

            $response .= (!$first)?',':'';
            $response .= '"'.$m_cod.'":'.json_encode($my_link->Record,JSON_FORCE_OBJECT);
            $first = false;
        }
        $my_link->Close();
		$response .= ',"G$":{"id_cotiz":"0","suc":"'.$suc.'","m_cod":"G$","fecha":"0000-00-00","hora":"00:00:00","compra":"1","venta":"1","ref":"G$"}';
        return trim($response,',')."}";
    }

    // Devuelve cotizaciones registradas en fecha de la sucursal
    private function getCurrentCotizXFechaXSuc($suc,$fecha){
        $my_link = new My();
        //$my_link->Query("SELECT c.id_cotiz,c.suc,c.m_cod,c.fecha,c.hora,c.compra,c.venta,c.ref from cotizaciones c where suc = '$suc' and fecha= '$fecha' and m_cod <> 'Y$'");
        $my_link->Query("SELECT c.id_cotiz,c.suc,c.m_cod,c.fecha,c.hora,c.compra,c.venta,c.ref from cotizaciones c inner join (SELECT max(_c.id_cotiz) as id,_c.m_cod from cotizaciones _c where _c.suc='$suc' and m_cod <> 'Y$' and fecha <= '$fecha' group by _c.m_cod)  tb on c.id_cotiz = tb.id");
        $response = "{";
        $first = true;
        while($my_link->NextRecord()){
            $m_cod = $my_link->Record['m_cod'];

            $response .= (!$first)?',':'';
            $response .= '"'.$m_cod.'":'.json_encode($my_link->Record,JSON_FORCE_OBJECT);
            $first = false;
        }
        $my_link->Close();
        $response .=  strlen(trim($response,','))>1?',':'';
		$response .= '"G$":{"id_cotiz":"0","suc":"'.$suc.'","m_cod":"G$","fecha":"0000-00-00","hora":"00:00:00","compra":"1","venta":"1","ref":"G$"}';
        
        return trim($response,',')."}";
    }

	// Aplica los cambios a la base de datos.- 
    public function process($suc,$date,$curr_out,$curr_out_amount,$curr_in,$curr_in_amount,$ajuste ,$usuario = 'Sistema'){    
         
        $my_link = new My();
		$cotiz = 1;
		$calc_cotiz = 0;
		$dif = 0;
		$curr_in_ref=$this->getCurrentCotizXDateXSucXCurrency($suc,$curr_in,$date);
		$curr_in_ref_cotiz = ($curr_in === "G$")?$curr_in_ref['compra']:$curr_in_ref['venta'];
	
		$curr_out_ref=$this->getCurrentCotizXDateXSucXCurrency($suc,$curr_out,$date);
		$curr_out_ref_cotiz = ($curr_out === "G$")?$curr_out_ref['venta']:$curr_out_ref['compra'];
		//$curr_out_ref_cotiz = $curr_out === "G$"?1:$curr_ref['compra'];
		$cambio = 0;
		if($curr_in === "G$"){
			$calc_cotiz = (int)($curr_in_amount/$curr_out_amount);
			$cambio = $curr_in_amount/$curr_in_ref_cotiz;
			$cotiz = $curr_out_ref_cotiz;
		}else if($curr_out === "G$"){
			$calc_cotiz = (int)($curr_out_amount/$curr_in_amount);
			$cambio = $curr_out_amount/$curr_in_ref_cotiz;			
			$cotiz = $curr_in_ref_cotiz;
		}else{
			$calc_cotiz = (int)($curr_out_amount/$curr_in_amount);
			$cambio = ($curr_out_amount*$curr_out_ref_cotiz)/$curr_in_ref_cotiz;
		}
        $dif = ($curr_in_amount*$curr_in_ref_cotiz)-($curr_out_amount*$curr_out_ref_cotiz);
       
        //$curr_in_check = ($curr_in=="G$")?(($curr_out_amount*$curr_out_ref_cotiz) - $ajuste):$curr_in_amount - $ajuste;
        $curr_in_check = 0;  
        $curr_in_amount_ref = 0;
        if($curr_in=="G$"){
            if($ajuste < 0  ){
                $curr_in_check = ($curr_out_amount * $curr_out_ref_cotiz) + $ajuste;
                $curr_in_amount_ref = ($curr_out_amount * $curr_out_ref_cotiz) +  $ajuste;
            }else{
                $curr_in_check = ($curr_out_amount * $curr_out_ref_cotiz)  ;
                $curr_in_amount_ref = ($curr_out_amount * $curr_out_ref_cotiz)  ;
            }
        }else{
            if($ajuste < 0  ){
                $curr_in_check = $curr_in_amount;
                $curr_in_amount_ref = ($curr_in_amount * $curr_in_ref_cotiz)  ;
            }else{
                $curr_in_check = $curr_in_amount  ;
                $curr_in_amount_ref = ($curr_in_amount * $curr_in_ref_cotiz)  ;
            }
        }

        $query_out = "INSERT into efectivo (id_concepto,m_cod,salida,cotiz,salida_ref,fecha_reg,fecha,hora,suc,estado,usuario) values (6,'$curr_out',$curr_out_amount,$curr_out_ref_cotiz,($curr_out_amount*$curr_out_ref_cotiz),current_date,'$date',current_time,'$suc','Pendiente','$usuario')";
        //$query_in = "INSERT into efectivo (id_concepto,m_cod,entrada,cotiz,entrada_ref,fecha_reg,fecha,hora,suc,estado) values (5,'$curr_in',$curr_in_amount,$curr_in_ref_cotiz,($curr_in_amount*$curr_in_ref_cotiz),current_date,'$date',current_time,'$suc','Pendiente')";
        $query_in = "INSERT into efectivo (id_concepto,m_cod,entrada,cotiz,entrada_ref,fecha_reg,fecha,hora,suc,estado,usuario) values (5,'$curr_in',$curr_in_check,$curr_in_ref_cotiz,$curr_in_amount_ref,current_date,'$date',current_time,'$suc','Pendiente','$usuario')";
		
		$msg = '{"msj":"'.$calc_cotiz.', '.$cambio.', '.$dif;
        //Ejecutar
        
        $my_link->Query($query_out);
        
        $my_link->Query($query_in);    
        
        //Deferencia por decimal
       
        if($dif>=1 || $dif<=-1 || $ajuste > 0 ){			
                  
                $id_concepto = ($ajuste>=1)?10:11;// 10:positivo, 11:negatico
                $tipe_cotiz = ($ajuste<=1)?"salida,salida_ref":"entrada,entrada_ref";
                $cantidad = ($ajuste<0)?'-'.$ajuste:$ajuste;
                $cantidad = $ajuste;
                if($ajuste<=1){
                    $cantidad =$ajuste * -1;
                }
                $cantidad_ref = $cantidad * $curr_in_ref_cotiz;
                                
                $msg.="  cantidad $cantidad,  curr_in_ref_cotiz $curr_in_ref_cotiz,";
                // Ajustar
                $my_link->Query("INSERT INTO efectivo (id_concepto,m_cod,cotiz,$tipe_cotiz,fecha_reg,fecha,hora,suc,estado,usuario) VALUES ($id_concepto,'$curr_in',$curr_in_ref_cotiz,$cantidad,$cantidad_ref,current_date,'$date',current_time,'$suc','Pendiente','$usuario')");
        }
        echo $msg.'"}';

        $my_link->Close();
    }

    //Devuelve la ultima cotizacion registrada de una sucursal para una modeda y fecha
    private function getCurrentCotizXDateXSucXCurrency($suc,$currency,$date){
        $cotiz = false;
        if($currency==="G$"){
            $cotiz = ["compra"=>1,"venta"=>1];
        }else{
            $my_link = new My();
            $my_link->Query("SELECT compra,venta FROM cotizaciones WHERE suc='$suc' and m_cod='$currency' and fecha <= '$date' order by id_cotiz desc limit 1");

            if($my_link->NextRecord()){
                $cotiz = $my_link->Record;
            }
            $my_link->Close();
        }
        return $cotiz;
    }
}

$cambio_divisas = new CambioDivisas();

if(isset($_POST['action'])){
    //print_r(explode(',', $_POST['args']));
    call_user_func_array(array($cambio_divisas,$_POST['action']), explode(',', $_POST['args']));
     
 }else{
     $cambio_divisas->start();
 }

?>
