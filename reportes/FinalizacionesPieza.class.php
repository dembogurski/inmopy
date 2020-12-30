<?php

/**
 * Description of FinalizacionesPieza
 * @author Ing.Douglas
 * @date 29/05/2017
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");
require_once("../Functions.class.php");

set_time_limit(2000);

class FinalizacionesPieza {
    
    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
        $master_historial = array();
        $TOLERANCIA = 0.02;
        
        $desde = $_REQUEST['desde'];
        $desde_eng = substr($desde, 6, 4) . '-' . substr($desde, 3, 2) . '-' . substr($desde, 0, 2);
        $hasta = $_REQUEST['hasta'];
        $hasta_eng = substr($hasta, 6, 4) . '-' . substr($hasta, 3, 2) . '-' . substr($hasta, 0, 2);
        $usuario = $_REQUEST['usuario'];
        $incluir_desc_0 =   $_REQUEST['incluir_desc_0'];  
        if($usuario == "null"){
            $usuario = "%";
        }
        $user = $_REQUEST['user'];
        $suc = $_REQUEST['select_suc'];

        $t = new Y_Template("FinalizacionesPieza.html");
        $t->Show("header");

        $t->Set("desde", $desde);
        $t->Set("hasta", $hasta);
        $t->Set("desde_eng", $desde_eng);
        $t->Set("hasta_eng", $hasta_eng);
        $t->Set("vendedor", $usuario);
        
        $t->Set("suc_d", $suc);
        $t->Set("user", $user);
        $t->Set("time", date("d-m-Y H:i"));
        
        $t->Show("head");
        $db = new My();
        $dbd = new My();
        $Qry = "SELECT  MAX(id) AS id,e.suc, usuario,e.codigo,e.lote,SUM(IF(e.estado_venta = 'FP',1,0)) AS CantFP,e.descrip,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,hora,e.estado_venta,a.costo_prom AS precio_costo, s.cantidad AS stock
        FROM edicion_lotes e  INNER JOIN articulos a ON e.codigo = a.codigo 
        INNER JOIN stock s ON e.codigo = s.codigo AND e.lote = s.lote AND s.suc = e.suc
        
        WHERE  fecha BETWEEN '$desde_eng' AND '$hasta_eng' AND e.suc = '$suc' AND usuario LIKE '$usuario' AND usuario <> 'Sistema' GROUP BY id,lote  HAVING  SUM(IF(e.estado_venta = 'FP',1,0)) > 0 ORDER BY fecha ASC, usuario ASC";
        
        //echo $Qry;  
        $db->Query($Qry); 
        $t->Show("cabecera");
        
        $count = 0;
        
        while($db->NextRecord()){
            
            $id = $db->Record['id'];
            $usuario= $db->Record['usuario'];
            $codigo= $db->Record['codigo'];
            $lote= $db->Record['lote'];
            $descrip= $db->Record['descrip'];
            $fecha= $db->Record['fecha'];
            $hora= $db->Record['hora'];
            $estado_venta= $db->Record['estado_venta'];
            $CantFP = $db->Record['CantFP'];
            $StockActual =  $db->Record['stock']; 
            $p_costo =  $db->Record['precio_costo']; 
            
            if($CantFP > 0){
                
            //$dbd->Query("SELECT cantidad as cant_entrada FROM historial WHERE codigo ='$codigo' and lote = '$lote' and suc = '$suc'");  
            $dbd->Query("SELECT cantidad as cant_entrada FROM historial WHERE codigo ='$codigo' and lote = '$lote' ");  // A pedido de Ricardo la cantidad inicial global
            if($dbd->NumRows()>0){
                $dbd->NextRecord();
                $p_cant_compra = $dbd->Record['cant_entrada'];
                 
            }    
                
            
            $t->Set("usuario",$usuario);
            $t->Set("codigo",$codigo);
            $t->Set("usuario",$usuario);
            $t->Set("lote",$lote);
            $t->Set("descrip",$descrip);
            $t->Set("fecha",$fecha);
            $t->Set("hora",$hora);
            
            $toler  = $p_cant_compra * $TOLERANCIA;
                
                                
            $exceso =  round(  0  + $StockActual - $toler,2);
            $descuento = $exceso * $p_costo;


            $t->Set("tipo_doc",$TipoDoc);
            $t->Set("cant_ini",number_format($p_cant_compra,2,',','.'));   
            $t->Set('tol', number_format($toler,2,',','.')); 
            $t->Set("cant_final",number_format($StockActual,2,',','.'));  
            $t->Set('exceso', number_format($exceso,2,',','.'));  
            $t->Set('costo', number_format($p_costo,0,',','.'));  
            if($exceso <= 0){
                $descuento = 0;
            }
            if($estado_venta == 'FP' && $descuento > 0){ 
               $total +=0+$descuento;
            }
            $t->Set('descuento', number_format($descuento,0,',','.'));  

         
            //$hist_array = getHistorialLote($codigo,$lote,$suc); 
            $hist_array = array(); 
                        
            $k = 0;
            foreach ($hist_array as $key => $data) {
                  
                
                break; // No interesan los demas datos
            } 
            $flag = true;
            if($incluir_desc_0 == "false"){
                $descuento > 0?$flag = true:$flag = false;
            }else{
                $flag = true;
            }
            $t->Show("data"); 
             
           }
        }
        $t->Set('count', number_format($count,0,',','.'));  
        $t->Set('total', number_format($total,0,',','.'));  
          
        $t->Show("footer");               
        
    }   
}



function getHistorialLote($codigo,$lote,$suc){
    
   $my = new My(); 
   
   $sql="SELECT id_hist,suc,tipo_doc, nro_doc,DATE_FORMAT(fecha_hora,'%d-%m-%Y %H:%i:%s') AS fecha,fecha_hora,usuario,direccion,cantidad,l.kg_desc, h.gramaje AS gramaje,h.tara,h.ancho  
        FROM historial h, lotes l WHERE  h.codigo = l.codigo AND h.lote = l.lote AND 
        h.codigo ='$codigo' AND h.lote = '$lote' AND suc LIKE '$suc'"; 
   
   $f = new Functions();
   
   $master = $f->getResultArray($sql);
   
   return $master;
}

new FinalizacionesPieza();

?>