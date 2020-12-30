<?php

/**
 * Description of VariableGenrentes
 * @author Ing.Douglas
 * @date 21/06/2018
 */
 
set_time_limit(0);

require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class VariableGerentes {
    var $meta_base = 0;
    var $meta_minima = 0;
    var $variable = 0;
    var $ponderacion = 0;
    var $pond_neg = 0;
    var $DEV_TOTAL_NORMAL = 0;
    var $DEV_TOTAL_OFERTA = 0;
    var $DEV_TOTAL_NORMAL_Y_OFERTA = 0;
    var $ZDEV_Oferta1 = 0;
    var $ZDEV_Normal1 = 0;
    var $ZDEV_Oferta3 = 0;
    var $ZDEV_Normal3 = 0;
    var $ZDEV_OfertaM = 0;
    var $ZDEV_NormalM = 0;
    var $TOTAL_NORMAL = 0;
    var $TOTAL_OFERTA = 0;
    var $TOTAL_NORMAL_Y_OFERTA = 0;
    var $Z_Oferta1 = 0;
    var $Z_Normal1 = 0;
    var $Z_Oferta3 = 0;
    var $Z_Normal3 = 0;
    var $Z_OfertaM = 0;
    var $Z_NormalM = 0;
    var $master_devs = array();
    var $master = array();
    var $meta_normales = 0;
    var $meta_ofertas = 0;

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

        $t = new Y_Template("VariableGerentes.html");
        $t->Show("header");

        $t->Set("desde", $desde);
        $t->Set("hasta", $hasta);
        $t->Set("desde_eng", $desde_eng);
        $t->Set("hasta_eng", $hasta_eng);
        $t->Set("vendedor", $usuario);
         
   
        $t->Set("user", $user);
        $t->Set("time", date("d-m-Y H:i"));
        
        // Datos de la Gerente
        $db = new My();
        $db->Query("SELECT doc,nombre,apellido,tel,date_format(fecha_cont,'%d-%m-%Y') as fecha_cont,imagen,id_tipo,sueldo_fijo,suc FROM usuarios WHERE usuario = '$usuario'");
        $db->NextRecord();
        $doc = $db->Record['doc'];
        $nombre = $db->Record['nombre'];
        $apellido = $db->Record['apellido'];
        $tel = $db->Record['tel'];
        $fecha_cont = $db->Record['fecha_cont'];
        $id_tipo = $db->Record['id_tipo'];
        $sueldo_fijo = $db->Record['sueldo_fijo'];
        $suc = $db->Record['suc'];
        $t->Set("nombre", $nombre . " " . $apellido);
        $t->Set("doc", $doc);
        $t->Set("suc", $suc);
        $t->Set("fecha_cont", $fecha_cont);
        $t->Set("tipo_vend", $id_tipo);
        $t->Set("sueldo_fijo", number_format($db->Record['sueldo_fijo'], 0, ',', '.'));

        if ($id_tipo == "") {
            $t->Set("err_msg", "Tipo de Vendedor no asignado a este usuario!");
            $t->Show("alerta");
            die();
        }
        $t->Set("meta", "<img src='../img/loading_fast.gif'>");
        $t->Set("variable", "<img src='../img/loading_fast.gif'>");
        $t->Set("meta_normal", "<img src='../img/loading_fast.gif'>");
        $t->Set("meta_ofertas", "<img src='../img/loading_fast.gif'>");

        
        // Datos de los funcionarios de la Gerente
        $Qry = "SELECT id_tipo,u.usuario , CONCAT(nombre,' ',apellido) AS nombre, meta_minima, meta_base,sueldo_base  FROM usuarios u, metas m WHERE  u.usuario = m.usuario AND suc = '$suc' AND id_tipo IS NOT NULL  AND id_tipo  NOT IN ('NV','GV')  AND estado ='Activo' GROUP BY u.usuario ORDER BY id_tipo ASC, nombre, meta_base +0 ASC ";
        $db->Query($Qry);
        $total_metas = 0;
        $total_variables =0;
        $total_ventas = 0;
        $dias_trabajados =$this->getDiasTrabGeneral($desde_eng, $hasta_eng,$suc);  
        $t->Set("dias_trab_gral",$dias_trabajados);
        $t->Show("user_data");
        
        while($db->NextRecord()){
            $vend_user = $db->Record['usuario'];
            $nombre = $db->Record['nombre'];
            $meta_minima = $db->Record['meta_minima'];
            $meta  = $db->Record['meta_base'];
            $variable = $db->Record['sueldo_base'];
            $id_tipo = $db->Record['id_tipo'];
            $usuario = $db->Record['usuario'];
            
            $total_variables+=0+$variable;
         
            $ventas = $this->getVentas($desde_eng, $hasta_eng, $vend_user,$suc);            
            $devoluciones = $this->getDevoluciones($desde_eng, $hasta_eng, $vend_user,$suc);
            $dias_trab = $this->getDiasTrab($desde_eng, $hasta_eng, $vend_user,$suc);
            $t->Set("variable_real", number_format($variable, 0, ',', '.'));
            $meta_nf = $meta;
            
            if($dias_trab < $dias_trabajados){
                $variable = ($dias_trab * $variable / $dias_trabajados);
            }
            if($dias_trab == 0){
                $variable =  0;
                $meta = 0;
            }else{
                $total_metas +=0+$meta;
            }
            $ventas_neto = $ventas - $devoluciones;
            $total_ventas  +=0 + $ventas_neto;
            if($dias_trab != 0){
               $porc =  ($ventas_neto * 100) / $meta; 
            }else{
               $porc = 0; 
            }
            
            if($id_tipo == "MY-3" || $id_tipo == "MY-4-7" ){
                $meta = 0;
                $ventas_neto = 0;
                $content = file_get_contents("http://192.168.2.220/inmopy/reportes/CalculoVariable.class.php?desde=$desde&hasta=$hasta&select_suc=$suc&usuario=$usuario&tipo=CalculoVariable.class.php");
                 
                preg_match('/^<input class="premio_acred"[^\r\n]*/m', $content, $matches);
                $pos = strpos($content, 'class="premio_acred"');
                 
                $line = substr($content, $pos + 29, 60) ;
                $variable = str_replace('" type="hidden">', "", $line);
                $variable = str_replace('.', "", $variable); 
            }
            
            //
            $t->Set("vendedor", $nombre);
            $t->Set("tipo_vend", $id_tipo);
            $t->Set("usuario", $usuario);
            $t->Set("dias_trab", number_format($dias_trab, 0, ',', '.'));            
            $t->Set("meta", number_format($meta, 0, ',', '.'));
            $t->Set("meta_nf",$meta_nf);
            $t->Set("ventas", number_format($ventas_neto, 0, ',', '.'));
            $t->Set("ventas_nf", $ventas_neto );
            $t->Set("logro", number_format($porc, 1, ',', '.'));
            $t->Set("variable", number_format($variable, 0, ',', '.'));
            $t->Show("vendedores"); 
        } 
        
        $porc_logrado = ($total_ventas * 100 ) / $total_metas;
        $t->Set("total_metas", number_format($total_metas, 0, ',', '.'));
        $t->Set("total_ventas", number_format($total_ventas, 0, ',', '.'));
        $t->Set("porc_logrado", number_format($porc_logrado, 1, ',', '.'));
        $t->Set("meta_aux", number_format($total_variables, 0, ',', '.'));
        $t->Show("data_aux");
        $t->Set("total_variables", number_format($total_variables, 0, ',', '.'));
        $t->Show("foot"); 
          
       
    }
    function getDiasTrab($desde_eng, $hasta_eng, $usuario,$suc){
        $db = new My();
        $db->Query("SELECT  COUNT( DISTINCT fecha_cierre) as dias_trab    FROM factura_venta f  WHERE   f.fecha_cierre BETWEEN   '$desde_eng' AND '$hasta_eng' AND f.usuario = '$usuario'  AND f.estado = 'Cerrada' AND suc = '$suc' ");
         if ($db->NumRows()>0) {
            $db->NextRecord();
            $dias_trab = $db->Record['dias_trab'];
            return $dias_trab;
         }else{
              0;
         }
    }
    function getDiasTrabGeneral($desde_eng, $hasta_eng,$suc){
        $db = new My();
        $db->Query("SELECT  COUNT( DISTINCT fecha_cierre) as dias_trab    FROM factura_venta f  WHERE   f.fecha_cierre BETWEEN   '$desde_eng' AND '$hasta_eng'   AND f.estado = 'Cerrada' AND suc = '$suc' ");
         if ($db->NumRows()>0) {
            $db->NextRecord();
            $dias_trab = $db->Record['dias_trab'];
            return $dias_trab;
         }else{
              0;
         }
    }
    
    function getDevoluciones($desde_eng, $hasta_eng, $usuario,$suc) {
        // Devoluciones
        $master_devs = array();
        $devs = "SELECT  CAT,SUM( IF( d.estado_venta  = 'Normal',d.subtotal,0) ) AS Normal, SUM(IF(d.estado_venta  != 'Normal',d.subtotal,0)) AS Oferta FROM nota_credito n, nota_credito_det d 
         WHERE n.n_nro = d.n_nro  AND n.fecha BETWEEN '$desde_eng' AND '$hasta_eng' AND n.vendedor = '$usuario'  AND n.estado = 'Cerrada' and suc = '$suc' ";
        $db = new My();
        $db->Query($devs);
        if ($db->NumRows()>0) {
            $db->NextRecord();
            $Normal = $db->Record['Normal'];
            $Oferta = $db->Record['Oferta'];
            $total = $Normal + $Oferta;   
            return $total;
        }else{
            return 0;
        }
    }

    function getVentas($desde_eng, $hasta_eng, $usuario,$suc) {
         
        $ms = new My();
        $sql_my = "SELECT  cat AS CAT  ,SUM( IF( d.estado_venta  = 'Normal' OR d.estado_venta IS NULL,d.subtotal,0) ) AS Normal, SUM(IF(d.estado_venta  != 'Normal' AND d.estado_venta IS NOT NULL,d.subtotal,0)) AS Oferta 
        FROM factura_venta f, fact_vent_det d WHERE f.f_nro = d.f_nro  AND f.fecha_cierre BETWEEN   '$desde_eng' AND '$hasta_eng' AND f.usuario = '$usuario'  AND f.estado = 'Cerrada' and suc = '$suc' ";

        $ms->Query($sql_my);
        
        if( $ms ->NumRows() > 0 ) {
            $ms->NextRecord();             
            $Normal = $ms->Record['Normal'];
            $Oferta = $ms->Record['Oferta'];            
            $total = $Normal + $Oferta;   
            return $total;
        }else{
            return0;
        }
         
    }

     

}

 
   
new VariableGerentes();
?>

