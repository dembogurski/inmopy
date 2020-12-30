<?php

/**
 * Description of StockYMovimientoArticulos
 * @author Ing.Douglas
 * @date 24/02/2018
 */

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");


class StockYMovimientoArticulos {
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
        $usuario = $_REQUEST['usuario'];
        $user = $_REQUEST['user'];
        $sector = $_REQUEST['select_sector'];
        $codigo = $_REQUEST['select_articulos'];
        $descrip = $_REQUEST['descrip'];
        $suc = $_REQUEST['select_suc'];
        $ruc = $_REQUEST['cliente'];   
        $categ = "";   
        $criterio = $_REQUEST['stockCrit'];
        $val1 = (int)$_REQUEST['val1'];
        $val2 = (int)$_REQUEST['val2'];
        
        foreach(range(1,7) as $cat){
            $categ .= ($_GET["cat_$cat"] == 'true')?"$cat,":"";
        }
        $categ = trim($categ,',');
        
        $include_stock =  $_REQUEST['include_stock'];
        
                 
        $oitm_names= array();
        
        $db = new My();
        $db->Query("SELECT codigo,descrip FROM articulos  WHERE cod_sector like '$sector' AND codigo like '$codigo';");    
        $tmp_cod ="";
        while($db->NextRecord()){
            $ItemCode = $db->Record['codigo'];
            $ItemName = $db->Record['descrip'];            
            $oitm_names[$ItemCode]= $ItemName;
            $tmp_cod = $ItemCode;
        }
        
        $prefs = array("101"=>"B","102"=>"H","103"=>"C","104"=>"S","108"=>"T");
        
        if($sector != "%"){             
            $prefij  =  $prefs[$sector];
            $prefijo_codigo = " AND codigo like '$prefij%' ";
        }else{
            $prefijo_codigo = "";
        }
        
        
        $db = new My();
        $t = new Y_Template("StockYMovimientoArticulos.html");
        
        $cli_filter = "%";
        $cat_filter = "$categ";
                
        if($ruc != "todos"){
            $db->Query("SELECT cod_cli, cliente,cat FROM factura_venta WHERE ruc_cli = '$ruc' LIMIT 1");
            $db->NextRecord();
            $cod_cli = $db->Record['cod_cli'];
            $cliente = $db->Record['cliente'];
            $cat = $db->Record['cat'];
            $t->Set("cliente",$cliente);
            $t->Set("ruc",$ruc);
            $t->Set("cat",$cat);
            $t->Set("cod_cli",$cod_cli);
            $cli_filter = "$cod_cli";    
            $cat_filter = "1,2,3,4,5,6,7";
        }else{
            $t->Set("cliente","Todos");
            $t->Set("ruc","*");
            $t->Set("cat","$categ");
            $t->Set("cod_cli","*");            
        }           
        $t->Set("include_stock",$include_stock);
        $t->Show("header");        
        
        $db->Query("SET lc_time_names = 'es_AR'");

        $db->Query("SELECT DISTINCT  DATE_FORMAT(fecha_cierre,'%m-%Y') AS meses,DATE_FORMAT(fecha_cierre,'%M-%y') AS meses_nom  FROM factura_venta WHERE fecha_cierre BETWEEN '$desde_eng' AND '$hasta_eng'  and suc like '$suc' order by fecha_cierre asc ;");  
        
        $array_meses = array();
        $array_totales = array();
        
        $cab_meses = "";
        $cadena_meses = "";
        $colspan =0;
        
        while( $db->NextRecord() ){
            $mes = $db->Record['meses'];     
            $nmes = ucfirst($db->Record['meses_nom']);
            $array_meses[$mes] = $nmes;
            $array_totales[$mes] = 0;
            
            $cab_meses .="<th class='cab_meses'>$nmes</th>";
            $cadena_meses .= ",SUM(IF(DATE_FORMAT(fecha_cierre,'%m-%Y') LIKE '$mes',cantidad,0)) AS '$mes'";
            $colspan++;
        }
         
        
        $colspan++;
        $cab_meses.="<td> </td>";  

        $t->Set("desde", $desde);
        $t->Set("hasta", $hasta);
        $t->Set("desde_eng", $desde_eng);   
        $t->Set("hasta_eng", $hasta_eng);
        $t->Set("suc", $suc);         
        $t->Set("user", $user);
        
        
        
        if($criterio != "Entre"){
            $t->Set("criterio", "Ventas: ". $criterio."  $val1");             
        }else{
            $t->Set("criterio", "Ventas: ". $criterio."  $val1 y $val2");
        }
        
        $t->Set("time", date("d-m-Y H:i"));
        $t->Set("cab_meses", $cab_meses);
        $t->Set("colspan", $colspan);
        
        $t->Show("head");      
         
        $qry = "SELECT codigo $cadena_meses FROM factura_venta f, fact_vent_det d WHERE f.f_nro = d.f_nro AND  f.estado = 'Cerrada' AND f.cod_cli LIKE '$cli_filter' AND f.fecha_cierre BETWEEN '$desde_eng' AND '$hasta_eng' AND d.codigo LIKE '$codigo' $prefijo_codigo and suc like '$suc' AND cat in($cat_filter)  GROUP BY codigo";
        //echo $qry;
        $db->Query($qry);
        
        while($db->NextRecord()){
           $codigo_venta = $db->Record['codigo'];
           $t->Set("codigo_venta", $codigo_venta );       
           $t->Set("articulo",$oitm_names[$codigo_venta]  ); 
           $data_mes = "";
           
           $show_line = false;
           $counter = 0;
           //$cant_meses = sizeof($array_meses);
            
            foreach ($array_meses as $cod_mes => $nombre_mes) { 
               $c_mes = $db->Record[$cod_mes];
               $cant_mes = number_format($c_mes, 2, ',', '.');
               $cant_mes_nf = $db->Record[$cod_mes];
               $class = "";
               if($criterio == "<="){ 
                   if($cant_mes_nf <= $val1){
                       $counter++; $class = "red";
                   }
               }else if($criterio == ">"){
                   if($cant_mes_nf > $val1){
                       $counter++; $class = "red";
                   }
               }else{ // Between
                   if($cant_mes_nf >= $val1 && $cant_mes <= $val2){
                       $counter++; $class = "red";
                   }
               }
                
               $data_mes.="<td class='num data_val $class' title='Mts ventidos en $cod_mes' >$cant_mes</td>";  
               $total_tmp =  $array_totales[$cod_mes];
               $total_tmp += 0+$cant_mes_nf;
               $array_totales[$cod_mes] = $total_tmp;
            }
           
            
            $t->Set("data_mes", $data_mes ); 
             
            
            if($counter > 0){
              $t->Show("data");
            }
        }
        $data_total = "";
        foreach ($array_totales as $cod_mes => $total) {
            $nf = number_format($total, 2, ',', '.');
            $data_total.="<td class='num' style='font-weight:bold'>$nf</td>";   
        }
        $data_total.="<td></td>";   
        $t->Set("data_totales", $data_total );       
        $t->Show("foot");
    }
}

function getVentasClientes(){
    $desde = $_REQUEST['desde'];     
    $hasta = $_REQUEST['hasta'];    
     
    $codigo = $_REQUEST['codigo'];    
    $suc = $_REQUEST['suc'];
    $cliente = $_REQUEST['cliente'];   
    $cod_cli = $_REQUEST['cod_cli']; 
    $categ = $_REQUEST['cat'];   
    $cli_filter = "%";  
    $cat_filter = "$categ";  
    if($cod_cli != "*"){ // Solo para un cliente en Especifico no importa la categoria actual
        $cli_filter = "$cod_cli";  
        $cat_filter = "1,2,3,4,5,6,7";;  
    }
    $db = new My();
    $dbd = new My();
    $db->Query("SET lc_time_names = 'es_AR'");
    
    // Primero Armo la cadena de meses
    
    $db->Query("SELECT DISTINCT  DATE_FORMAT(fecha_cierre,'%m-%Y') AS meses,DATE_FORMAT(fecha_cierre,'%M-%y') AS meses_nom  FROM factura_venta f, fact_vent_det d WHERE f.f_nro = d.f_nro AND fecha_cierre BETWEEN '$desde' AND '$hasta'  and suc like '$suc';");
    $array_meses = array();
    $array_totales = array();

    $cadena_meses = "";

    while( $db->NextRecord() ){
        $mes = $db->Record['meses'];     
        $nmes = ucfirst($db->Record['meses_nom']);
        $array_meses[$mes] = $nmes;
        $array_totales[$mes] = 0;            
        $cadena_meses .= ",SUM(IF(DATE_FORMAT(fecha_cierre,'%m-%Y') LIKE '$mes',cantidad,0)) AS '$mes'";
    }
    
    $master = array();
    
     
    // Segundo buscar todos los clientes o el cliente selecto    
    $cli_qry = "SELECT DISTINCT cod_cli,cliente  FROM factura_venta f, fact_vent_det d WHERE f.f_nro = d.f_nro AND fecha_cierre BETWEEN '$desde' AND '$hasta'  and suc like '$suc' AND codigo ='$codigo' AND cod_cli LIKE '$cli_filter' AND cat in($cat_filter) ORDER BY cliente ASC;";
         
    
    $db->Query($cli_qry);
    if($cod_cli != "*" && $db->NumRows() < 1 ){  
        $cli_qry = "SELECT cod_cli,cliente  FROM factura_venta f WHERE cod_cli = '$cod_cli' limit 1 "; // hack Trick ;)
        $db->Query($cli_qry);
    }
    
    
    while($db->NextRecord()){
        $codigo_cliente = $db->Record['cod_cli']; 
        $nombre_cliente = $db->Record['cliente']; 
        
        $arr = array();
               
        $arr['cod_cli'] = $codigo_cliente;
        $arr['cliente'] = $nombre_cliente;
                
        $qry = "SELECT codigo $cadena_meses FROM factura_venta f, fact_vent_det d WHERE f.f_nro = d.f_nro AND f.estado = 'Cerrada' AND f.fecha_cierre BETWEEN '$desde' AND '$hasta' AND  f.cod_cli like '$codigo_cliente'   AND d.codigo ='$codigo'  GROUP BY codigo";
       
         
        $dbd->Query($qry);
        
        
        while($dbd->NextRecord()){               
           foreach ($array_meses as $cod_mes => $nombre_mes) { 
              $c_mes = $dbd->Record[$cod_mes];
              $cant_mes = number_format($c_mes, 2, ',', '.');
              $cant_mes_nf = $dbd->Record[$cod_mes]; 
              $arr["$nombre_mes"]=$cant_mes;                  
           }          
        }
        array_push($master, $arr);
    }         
    echo json_encode($master);
}

function getStock(){
    $suc = $_REQUEST['suc'];
    $codigo = $_REQUEST['codigo'];
    $db = new My();
    
    $cant_suc = 0;
    if($suc != "%"){
        
    $db->Query("SELECT SUM(cantidad) AS Cant FROM stock s WHERE codigo ='$codigo' AND suc ='$suc' AND Cantidad > 0 AND estado_venta <> 'FP' ");
    
    if($db->NumRows()>0){
        $db->NextRecord();
        $cant_suc = $db->Record['Cant'];
        if($cant_suc == null){
            $cant_suc = 0;
        }
    }
    
    }else{
      $cant_suc = "-1";  
    }
        
    // Global
    $db->Query("SELECT SUM(cantidad) AS Cant FROM stock s WHERE codigo ='$codigo'   AND Cantidad > 0 AND estado_venta <> 'FP' ");
    $cant  = 0;
    if($db->NumRows()>0){
        $db->NextRecord();        
        $cant = $db->Record['Cant'];
        if($cant == null){
            $cant = 0;
        }
    }
    $stock = array("stock_suc"=>$cant_suc,"global"=>$cant);
    echo json_encode($stock);
}
function drawChart(){
   $data = $_REQUEST['data'];
   $labels = str_replace('"', "'", $_REQUEST['labels']) ;
   $label = $_REQUEST['label'];
   $tipo = $_REQUEST['tipo'];
   if($tipo == "cliente"){
       $CardCode = $_REQUEST['CardCode'];
       $db = new My();
       $db->Query("SELECT tel AS Phone1,nombre AS CardName FROM clientes WHERE cod_cli = '$CardCode'");
       $db->NextRecord();
       $CardName = $db->Record['CardName'];
       $Phone = $db->Record['Phone1'];
       
       $label.=" Cliente: $CardName";
       
       if($Phone != null){
           $label.="($Phone)";
       }
       
   }
    
   $t = new Y_Template("StockYMovimientoArticulos.html");   
    
   $t->Set("chart_label",$label);
   $t->Set("labels",$labels);
   $t->Set("data",$data);
   $t->Show("chart_header");
   
   $t->Show("draw_chart");
   
}

new StockYMovimientoArticulos();
?>
