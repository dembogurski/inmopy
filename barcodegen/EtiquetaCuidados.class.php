<?php

/**
 * Description of EtiquetaCuidados
 * @author Ing.Douglas
 * @date 20/07/2017
 */
 

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
require_once("../barcodegen/RadPlusBarcodeNoFont.php");

class EtiquetaCuidados {
    
    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {
     
        $tam = $_REQUEST['tam'];     
        $tipo = $_REQUEST['tipo'];    
        $usuario = $_REQUEST['usuario'];
        $printer = $_REQUEST['printer'];
        $silent_print = $_REQUEST['silent_print'];
         
        $ip = $_SERVER['REMOTE_ADDR'];   
        
        
        $auto_close_window = $_REQUEST['auto_close_window'];
                
        $margin= 'style="margin: 0;"';
        
         
                        
        $t = new Y_Template("EtiquetaCuidados.html");
        $t->Set("ip", $ip);
        
        $t->Set("printer",$printer);
        $t->Set("silent_print",$silent_print); 
        $t->Set("auto_close_window", $auto_close_window);
        $showFallas = false;     
        $fallas = '';      
        
        $etiqueta = "etiqueta_6x4";
         

        if(isset($_REQUEST['etiqueta'])){
            $etiqueta = $_REQUEST['etiqueta'];           
        }
        $t->Set("tam",$tam);

        $clave = $etiqueta."_".$ip;   
        $margin = $this->getMargins($clave);   
        $margen = "style='margin:$margin;'";
         
         
        $my = new My();
        $my->Query("SELECT suc FROM usuarios WHERE usuario = '$usuario'");
        $my->NextRecord();
        $suc_user = $my->Record['suc'];
        
        $t->Show("headers");
         
       
            
        $t->Set("image","../img/etiquetascuidados/$tipo");
              
        $t->Set("barcode_image",$barcode_image);

        $t->Set("margin",$margen);     

        $t->Show($etiqueta);
        
        $t->Show("config_popup");
            
     } 
     function getMargins($clave){
        $db = new My();
        $db->Query("select valor from parametros where clave = '$clave'");
        if($db->NumRows()>0){
            $db->NextRecord();
            return $db->Get("valor");
        }else{
            return "0";
        }
    }
     
}
 

new EtiquetaCuidados();
?>
