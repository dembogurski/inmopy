<?php

/**
 * @author Jorge Armando Colina
 * @date 22/08/2017
 * @ultima modificacion 19-12-2019 Doglas A. Dembogurski
 */

require_once("../Y_DB_MySQL.class.php");
require_once("../utils/DocTypes.class.php");
require_once("../Y_Template.class.php");
 
class HistorialMovimiento {
    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
       $ms = new My();
                    
        $path = "http://".$_SERVER['SERVER_NAME'].":".$_SERVER['SERVER_PORT']."/inmopy"; 
        
        $codigo = $_REQUEST['codigo'];
        $lote = $_REQUEST['lote'];
        $suc = $_REQUEST['suc'];
        
        $t = new Y_Template("HistorialMovimiento.html");
        
        $t->Set('fullpath', $path );
        
        $ms->Query("SELECT descrip, mnj_x_lotes, um FROM articulos WHERE codigo = '$codigo'");
        $ms->NextRecord();
        $descrip = $ms->Get('descrip');
        $mnj_x_lotes = $ms->Get('mnj_x_lotes');
        $um = $ms->Get('um');
        
        if($mnj_x_lotes === "No"){
           $t->Set('no_mnj_x_lotes', 'no_mnj_x_lotes' );  
        }
                    
        
        $DocType = new DocTypes();        
        
        $t->Set('codigo', $codigo );
        $t->Set('descrip', $descrip );
        $t->Set('lote', $lote );
        $t->Set('um', $um );
        
        $dt = new DocTypes();
                    
        $t->Show("header"); 
        
        
        $Qry = "SELECT id_hist,suc,tipo_doc, nro_doc,DATE_FORMAT(fecha_hora,'%d-%m-%Y %H:%i:%s') AS fecha,fecha_hora,usuario,direccion,cantidad,l.kg_desc, h.gramaje as gramaje,h.tara,h.ancho  
        FROM historial h, lotes l WHERE  h.codigo = l.codigo AND h.lote = l.lote AND 
        h.codigo ='$codigo' AND h.lote = '$lote' AND suc like '$suc'";   
        
        if($mnj_x_lotes === "No"){
            $Qry ="SELECT id_hist,suc,tipo_doc, nro_doc,DATE_FORMAT(fecha_hora,'%d-%m-%Y %H:%i:%s') AS fecha,fecha_hora,usuario,direccion,cantidad,'' AS kg_desc, '' AS   gramaje,'' AS tara,h.ancho  
            FROM historial h, articulos l WHERE  h.codigo = l.codigo  AND         h.codigo ='$codigo'   AND suc LIKE '$suc'";
        }
        
        
        $ms->Query($Qry);
        $first = true;
        $curr_suc;
        $linea = "dos";
        $sucs = array();
        
        $saldo = 0;        
        $i = 0;
        
        
        
        
        while($ms->NextRecord()){ 
            $datos = array();       
            foreach($ms->Record as $key=>$value){
                $datos[$key] = $value;
                    
                switch($key){
                    case 'cantidad':
                        $t->Set($key,number_format((float)($value),2,',','.'));
                        if($i === 0){
                            $saldo = $value;
                            $t->Set("saldo",number_format((float)($saldo),2,',','.'));
                        }else{
                            $saldo = $saldo + $value;
                            $t->Set("saldo",number_format((float)($saldo),2,',','.'));
                        }   
                    
                        $Total = $Total + (float)($value);
                        
                        $i++;
                        break;
                    case 'suc':
                        if( $curr_suc !== $value ){
                            $curr_suc = $value;
                            $linea = ($linea == "uno")?"dos":"uno";
                            if(!in_array($value,$sucs)){
                                array_push($sucs,$value);
                            }
                        }
                        $t->Set($key,trim($value));
                        $t->Set("linea",trim($linea));
                        break;
                    
                    case 'direccion':
                        

                        if($value == 'S'){                
                            $t->Set("fondo","orangered");   
                            $t->Set("color","black");                               
                            $t->Set('direccion',"Salida");
                        }else{
                            $t->Set("fondo","green");   
                            $t->Set("color","white");  
                            $t->Set('direccion',"Entrada");
                        } 
                        break;
                    
                    case 'tipo_doc':
                        $t->Set('DocType',$DocType->getType($value));
                        $t->Set('tipo_doc', $value );
                        break;
                    
                    default: //echo  "$key --> $value  <br>";
                        $t->Set($key,trim($value));
                }                
            }
            //print_r($datos);        
            if($first){
                $first = false;
                $t->Show("head");
            }
            $kg_calc = (($datos['gramaje'] * $saldo * $datos['ancho']) / 1000 ) + ($datos['tara'] / 1000);
            $t->Set("kg_calc",number_format((float)($kg_calc),2,',','.'));
            $t->Show("data");
        }
        $t->Set("QuantityTotal",  number_format($Total,2,',','.'));   
        $t->Show("total");
        
        $db = new My();
        $db->Query("SELECT  suc as suc_ev, estado_venta FROM stock WHERE codigo ='$codigo' AND lote = '$lote' and suc like '$suc'");
        while($db->NextRecord()){
            $suc_ev = $db->Get('suc_ev');
            $estado_venta = $db->Get('estado_venta');
            $t->Set("suc_ev", $suc_ev);   
            $t->Set("estado_venta", $estado_venta);  
            $t->Show("estado_venta"); 
        }          
        
        
        $t->Set("sucs", json_encode($sucs));   
        $t->Show("footer");
        $t->Show("script");
    }
    // Fin de pieza
    private function is_FP($lote){
                    
        $link = new My();
        $link->Query("SELECT id,usuario,CONCAT(DATE_FORMAT(fecha, '%d-%m-%Y'),' ', hora) AS fecha,suc FROM edicion_lotes WHERE lote = $lote and FP = 'Si' AND e_sap=1 ORDER By id DESC LIMIT 1");
        $link->NextRecord();
        return $link->Record;
    }
}

function getModificacionesLote(){
    $codigo = $_REQUEST['codigo'];
    $lote = $_REQUEST['lote'];
    $desde = $_REQUEST['desde'];
    $hasta = $_REQUEST['hasta'];
    require_once("../Functions.class.php");
    
    $f = new Functions();
    $sql = "SELECT suc,usuario, CONCAT( DATE_FORMAT(fecha,'%d-%m-%Y'),' ',hora) AS fecha ,ancho,tara,gramaje,kg, estado_venta, obs FROM edicion_lotes WHERE codigo = '$codigo' AND lote = '$lote'
    AND CONCAT(  fecha ,' ',hora) > '$desde' AND CONCAT(  fecha ,' ',hora) < '$hasta'";
    
    echo json_encode($f->getResultArray($sql));
    
    
    //codigo:codigo,lote:lote, id :id,fecha:fecha
}

new HistorialMovimiento();
?>


