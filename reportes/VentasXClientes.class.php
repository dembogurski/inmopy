<?php
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


class VentasXVendedor {
    
    private $desde;
    private $hasta;
    private $cliente;
    private $suc;
    private $usuario;
    private $t;
    private $buscar;
    private $color;   
    private $cat_filter;
    private $tipoReporte;
    
    
    
    function __construct(){

        $this->buscar = '';
        $this->desde = $this->flipDate($_GET['desde'],'/');
        $this->hasta = $this->flipDate($_GET['hasta'],'/');
        $this->suc = $_GET['select_suc']; 
        //$this->suc = '%'; 
        $this->usuario = $_GET['usuario'];
        $this->cliente = $_GET['cliente'];
        $date_ini = strtotime($this->desde);
        $date_end = strtotime($this->hasta);
        $this->color = $_GET['color'];
        $this->tipoReporte = $_GET['tipoReporte'];
        
        if($this->tipoReporte == 'Agrupado'){ //Liberado por Pedido de Rocio en Fecha 28-08-2019 14:10
            $this->suc = '%';
        }
        
        $cat_filter = "";
        
        for($i = 1; $i < 8; $i++){
            $c = $_GET["cat$i"];
            if($c == "true"){
                $cat_filter.= "$i,";
            }
        }
        $cat_filter = substr($cat_filter,0, -1);
        
        $this->cat_filter = " and cat in($cat_filter)";

        if($this->tipoReporte == 'extendido'){
            $this->t = new Y_Template("VentasXClientes.html");
            $date_diff = ($date_end-$date_ini)/ (60 * 60 * 24);
    
            if(strlen(trim($this->desde)) > 2 && strlen(trim($this->hasta)) > 2 && trim($_GET['cliente']) !== '' && (($date_diff < 91 && $this->cliente === 'todos')||$this->cliente !== 'todos')){
                if(strlen(trim($_GET['buscar']))>0){
                    $ex_filter = explode(' ',trim($_GET['buscar']));
                    //No funciona para TNT 70
                    foreach($ex_filter as $filter){
                        $this->buscar .= " and d.descrip LIKE '%$filter%' ";
                    }    
                    $filter = trim($_GET['buscar']);
                    //$this->buscar = " and d.descrip LIKE '%$filter%' ";
                }
                if(strlen($this->color) > 0){
                   $color = $this->color;
                   $this->buscar .= " and d.descrip LIKE '%$color%' ";
                }
                if($this->cliente === 'todos'){
                    $this->cliente = '%';
                }else{
                    $this->suc='%';
                }            
                $this->mostrarReporte();
            }else{
                $this->t->Show("header");
                if($date_diff > 90){
                    $this->t->Set("error_msg","El periodo de tiempo no debe superar los 90 dias para generar el Reporte");
                }else{
                    $this->t->Set("error_msg","Debe enviar los valores Desde, Hasta para generar el Reporte");
                }
                $this->t->Show("error");
            }
        }else{
            require_once("../utils\\tbs_class.php");
            $tbs = new clsTinyButStrong;
            //$tbs->LoadTemplate('VentasXClientesGPR.html');
            $t = new Y_Template("VentasXClientesGPR.html");
            $tbs->VarRef['cliente'] = $this->cliente;
            $link = new My();
            $reporte = array();
            
            $desde == 'DATE(NOW())';
            $hasta == 'DATE(NOW())';
            $suc = $_GET['select_suc'];
            $vendedor = (strlen(trim($_GET['vendedor']))>0)?'%'.trim($_GET['vendedor']).'%':'%';
            $color = (strlen(trim($_GET['color']))>0)?'%'.trim($_GET['color']).'%':'%';
            $buscar = (strlen(trim($_GET['buscar']))>0)?'%'.trim($_GET['buscar']).'%':'%';
            $buscar_cliente = (strlen(trim($_GET['buscar_cliente']))>0)?'%'.trim($_GET['buscar_cliente']).'%':'%';
            $cliente = (strlen(trim($_GET['cliente']))>0)?'%'.trim($_GET['cliente']).'%':'%';

            $t->Show("head");

            $t->Set('show_suc','hide');
            $t->Set('show_usuario','hide');
            $t->Set('show_cliente','hide');
            $t->Set('show_cat','hide');
            $t->Set('show_codigo','hide');
            $t->Set('show_articulo','hide');
            $t->Set('show_color','hide');
            
            $t->Set('emp',$_GET['emp']);
            $t->Set('desde',$_GET['desde']);
            $t->Set('hasta',$_GET['hasta']);

            $getData['suc']=($_GET['gpr_suc'] == 'true')?'f.suc':'';
            $getData['usuario']=($_GET['gpr_usuario'] == 'true')?'f.usuario':'';
            $getData['cliente']=($_GET['gpr_cliente'] == 'true')?'f.cliente':'';
            $getData['cat']=($_GET['gpr_cat'] == 'true')?'f.cat':'';
            $getData['codigo']=($_GET['gpr_codigo'] == 'true')?"d.codigo, TRIM(LEFT(d.descrip,LOCATE('-', d.descrip)-1)) AS articulo":'';
            $getData['color']=($_GET['gpr_color'] == 'true')?"TRIM(SUBSTRING(d.descrip,LOCATE('-', d.descrip)+1)) AS color":'';
            $criGetData = implode(',',array_filter($getData));
            
            $gpr['suc']=($_GET['gpr_suc'] == 'true')?'f.suc':'';
            $gpr['usuario']=($_GET['gpr_usuario'] == 'true')?'f.usuario':'';
            $gpr['cliente']=($_GET['gpr_cliente'] == 'true')?'f.cliente':'';
            $gpr['cat']=($_GET['gpr_cat'] == 'true')?'f.cat':'';
            $gpr['codigo']=($_GET['gpr_codigo'] == 'true')?"d.codigo, TRIM(LEFT(d.descrip,LOCATE('-', d.descrip)-1))":'';
            $gpr['color']=($_GET['gpr_color'] == 'true')?"TRIM(SUBSTRING(d.descrip,LOCATE('-', d.descrip)+1))":'';
            $criGroupBy = implode(',',array_filter($gpr));

            foreach($gpr AS $k=>$vl){
                if(strlen($vl)>0){
                    $t->Set("show_".$k,"show");
                }
            }

            
            $t->Show("cab");

            if(trim($_GET['desde']) != '' ||  trim($_GET['hasta']) != ''){
                $desde = $this->flipDate($_GET['desde'],'/');
                $hasta = $this->flipDate($_GET['hasta'],'/');
            }

            $sum_mts = 0;
            $sum_mov = 0;

            $query = "SELECT $criGetData, SUM(d.cantidad - IF(ncr.f_nro IS NULL,0,ncr.cantidad)) AS metros, SUM(d.subtotal - IF(ncr.f_nro IS NULL,0,ncr.subtotal)) AS mov,cod_cli FROM fact_vent_det d INNER JOIN factura_venta f USING(f_nro) LEFT JOIN (SELECT n.f_nro,nd.lote,nd.cantidad,nd.precio_unit,nd.subtotal FROM nota_credito_det nd INNER JOIN nota_credito n USING(n_nro) WHERE n.estado='Cerrada' AND n.e_sap = 1) AS ncr ON f.f_nro = ncr.f_nro AND d.lote = ncr.lote WHERE (f.cliente LIKE '$buscar_cliente' OR f.ruc_cli LIKE '$cliente') AND ((TRIM(LEFT(d.descrip,LOCATE('-', d.descrip)-1)) LIKE '$buscar' OR d.codigo LIKE '$buscar') AND TRIM(SUBSTRING(d.descrip,LOCATE('-', d.descrip)+1)) LIKE '$color') AND f.usuario LIKE '$vendedor' AND f.estado='Cerrada' AND f.fecha_cierre BETWEEN '$desde' AND '$hasta'  AND f.suc LIKE '$suc' AND f.cat IN ($cat_filter) GROUP BY $criGroupBy ORDER BY f.suc*1 ASC, f.usuario ASC, f.cliente ASC, d.descrip ASC";

            $link->Query($query);
            while($link->NextRecord()){
                $linea = array_map('utf8_encode',$link->Record);
                array_push($reporte,$linea);
                foreach($link->Record as $key=>$value){
                    $t->Set($key,utf8_encode($value));
                    if($key ==  'metros'){
                        $t->Set($key,number_format($value, 2, ',', '.'));         
                    }
                    if($key ==  'mov'  ){
                        $t->Set($key,number_format($value, 0, ',', '.'));         
                    }
                }
                $sum_mts += floatval($link->Record['metros']);
                $sum_mov += floatval($link->Record['mov']);
                $t->Show("body");
            }
            $colspam = (key_exists('codigo',array_filter($gpr)))? count(array_filter($gpr))+2 : count(array_filter($gpr));
            $t->Set('colspam',$colspam);
            $t->Set('sum_mts',$sum_mts);
            $t->Set('sum_mov',$sum_mov);
            $t->Show("foot");

            /* $tbs->MergeBlock('data','array',$reporte);
            $tbs->Show(); */
        }
    }

    private function mostrarReporte(){
        $this->t->Set("user", $this->usuario);
        $this->t->Set("time",date('d-m-Y H:i'));
        $this->t->Set("desde",$this->desde);
        $this->t->Set("hasta",$this->hasta);
        $this->t->Set("user_suc",$this->suc);        
        $db = new My();
        
      
        
        
        $resultados = $this->getFacturas($this->desde,$this->hasta,$this->suc,$this->cliente,$this->buscar,$this->cat_filter);
        //print_r($resultados);
        $this->t->Show("header");        
        $this->t->Show("head"); 
        
        $sumTotal = 0;
        foreach($resultados as $resultado){
            $this->t->Show("fact_header");
            $current_det = array();
            foreach($resultado as $key=>$value){                
                if($key === 'det'){
                    $current_det = $value;                    
                }else{
                    if($key === 'total'){
                        $sumTotal += $value;
                        $this->t->Set($key,number_format($value, 2, ',', '.'));                        
                    }else{
                        $this->t->Set($key,$value);
                    }
                }                
            }

            $this->t->Show("fact_data"); 
            $total_cant = 0;
            $det_ = "<table class='detFactura'><tr><th>Art</th><th>Lote</th><th>Descripcion</th><th>Cantitad</th><th>Ancho</th><th>Precio</th></tr>";
            
                foreach($current_det as $file){
                    $det_ .= "<tr>";
                    foreach($file as $k=>$v){
                        
                        if (is_numeric($v) && $k != 'lote'){
                           $valor = number_format($v, 2, ',', '.'); 
                           $det_ .= "<td class='num'>$valor</td>"; 
                           if($k == 'cantidad'){
                               $total_cant+= 0+$v;
                           }
                        }else{
                           $det_ .= "<td>$v</td>";   
                        }                        
                    }
                    $det_ .="</tr>";
                }
                $total_cant = number_format($total_cant, 2, ',', '.'); 
                $det_ .="<tr><td colspan='3'></td><td class='num' style='font-weight:bolder' >$total_cant</td><td colspan='2'></td></tr>";
                $det_ .= "</table>";
                $this->t->Set(detalle,$det_);
                $this->t->Show("det_data");
            
        }
        $this->t->Set('sumTotal',number_format($sumTotal, 2, ',', '.'));
        $this->t->Show("foot");
    }
    // Cabeceras
    private function getFacturas($desde,$hasta,$suc,$ruc,$ex_filter,$cat_filter){    
        $link = new My();
        $facts = array();
        $link->Query("SELECT f.f_nro, f.usuario, f.fecha_cierre, f.suc, f.cat, f.total, f.hora_cierre, cliente, tipo_doc_cli, ruc_cli,cod_cli from factura_venta f inner join fact_vent_det d using(f_nro) where f.estado ='Cerrada' and f.suc like '$suc' $cat_filter and f.fecha_cierre between '$desde' and '$hasta' and f.ruc_cli like '$ruc' $ex_filter group by f.f_nro order by f.suc*1 ASC, f.fecha_cierre ASC");
        
        while($link->NextRecord()){
            $fact = $link->Record;            
            $fact['det'] = $this->getFacturaDet($fact['f_nro'],$ex_filter);
            array_push($facts,$fact);
        }
        
        $link->Close();
        return $facts;
    }
    //Detalles
    private function getFacturaDet($f_nro,$ex_filter){
        $link = new My();
        $detalle = array();
        $link->Query("SELECT Codigo as Art, lote, descrip, cantidad, ancho,precio_venta from fact_vent_det d where f_nro = '$f_nro' $ex_filter");
        while($link->NextRecord()){
            array_push($detalle, $link->Record);
        }
        $link->Close();
        return $detalle;
    }
    private function flipDate($date,$separator){
        $date = explode($separator,$date);
        return $date[2].$separator.$date[1].$separator.$date[0];
    }
 
}
new VentasXVendedor();

?>
