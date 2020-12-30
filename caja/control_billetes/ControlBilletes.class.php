<?php

/**
 * Description of ControlBilletes
 * @author Ing.Douglas
 * @date 18/06/2015
 */

require_once("../../Y_Template.class.php");
require_once("../../Y_DB_MySQL.class.php");

class ControlBilletes {
    
    function __construct() {
         
        $id = $_REQUEST['id'];
        $usuario = $_REQUEST['usuario'];
                
        $db = new My();
         
          
        $fecha_hora = date("d-m-Y H:i:s");
        //echo date_default_timezone_get();
        
        $now = new DateTime();
        $fecha_hora = $now->format('Y-m-d H:i:s');
        
        $db->Query("SELECT suc,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,cajero,tipo,estado FROM cont_billetes WHERE id_cont = $id;");
        
        $db->NextRecord();
        $suc = $db->Record['suc'];
        $fecha = $db->Record['fecha'];
        $cajero = $db->Record['cajero'];
        $tipo = $db->Record['tipo'];
        $estado = $db->Record['estado'];
        $audit = $_REQUEST['audit'];
                
        $t = new Y_Template("ControlBilletes.html");
        
        $t->Set("nro",$id);
        
        $t->Set("tipo",$tipo);
        $t->Set("fecha",$fecha);
        $t->Set("cajero",$cajero);
        $t->Set("suc",$suc);
        $t->Set("estado",$estado);
        $t->Set("fecha_hora",$fecha_hora);  
        //$t->Set("fecha_hora","");  
        $t->Set("audit",$audit);
        $t->Set("usuario",$usuario);
        
        $db->Query("select replace(LOWER(d.m_cod),'$','s' ) as moneda, d.identif as ident,cantidad,total from mon_subdiv m, cont_bill_det d where m.m_cod = d.m_cod and m.identif = d.identif and d.id_cont = $id;");
        while($db->NextRecord()){
            $m = $db->Record['moneda'];
            $identif = $db->Record['ident'];            
            $cantidad = $db->Record['cantidad'];
            
            $tipo = substr($identif, 0,1); 
            if($tipo == "b" || $m == 'gs'){
                 $total = number_format( $db->Record['total'] , 0, ',', '.');  
            }else{
                 $total = number_format( $db->Record['total'] , 2, ',', '.');  
            }
             
            $id_cant = "$m"."_c_".$identif;            
            $id_tot = "$m"."_t_".$identif;   
                
            
            $t->Set($id_cant,$cantidad);
            $t->Set($id_tot,$total);
        }
        
        $db->Query("select cotiz_rs,cotiz_ps,cotiz_us,total from cont_billetes where id_cont = $id");
        if($db->NumRows() > 0){
           $db->NextRecord();
           $crs = $db->Record['cotiz_rs'];
           $cps = $db->Record['cotiz_ps'];
           $cus = $db->Record['cotiz_us'];
           $t->Set("cotiz_rs", number_format( $crs , 2, ',', '.'));    
           $t->Set("cotiz_ps", number_format( $cps , 2, ',', '.'));     
           $t->Set("cotiz_us",number_format( $cus , 2, ',', '.'));       
        }
                
        $t->Show("general_header");            
        $t->Show("query0_data_row");   
        $t->Show("end_query0");   
    }
    
}
new ControlBilletes();
?>
