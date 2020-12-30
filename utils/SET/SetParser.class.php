<?php

/**
 * Description of SetParser
 * @author Ing.Douglas
 * @date 31/03/2017
 * Por ahora solo para 03 Matriz
 */

require_once("../../Y_DB_MySQL.class.php");

class SetParser {
    function __construct(){
       $content = $_REQUEST['content'];
       //$arr = explode("|",$content);
        
       echo "Recibido: $content<br><br>";
       
       $db = new My();
       
       $rates = json_decode($content);
       
       echo "Recibido: $rates<br><br>";
       
       foreach ($rates as $mon => $val) {
           $db->Query("SELECT m_cod AS moneda,compra FROM cotizaciones_contables WHERE m_cod = '$mon' AND fecha = CURRENT_DATE and suc = '03'");
           
            
           //echo "SELECT m_cod AS moneda,compra FROM cotizaciones_contables WHERE m_cod = '$mon' AND fecha = CURRENT_DATE and suc = '03'";
           //$db->Query("SELECT Currency,Rate  FROM ORTT WHERE Currency = '$mon' and RateDate = '07-08-2018'  ");
                
           $today = date("d-m-Y");
           //$today = date("07-08-2018");
              
           if($db->NumRows() > 0){
               $db->NextRecord();
               $cotiz = number_format($db->Record['compra'], 2, ',', '.') ;  
                
               echo "$mon  $cotiz  --> $val<br>";
               
               if($cotiz != $val){//Update
                   $val = str_replace(".", "", $val);
                   $val = str_replace(",", ".", $val);
                   
                   $db->Query("INSERT INTO  cotizaciones_contables( suc, m_cod, fecha, hora, compra, venta, ref)VALUES ( '03', '$mon', CURRENT_DATE, CURRENT_TIME,$val, $val, 'G$');");
                                      
                   //echo "Cotizacion $mon $val  != a establecida: $cotiz  \n  ";
                    
                   sleep(2);
               }else{// No hacer nada cotizacion establecida e igual a la actual 
                   echo "Cotizacion $mon $val  == a pre-establecida: $cotiz  \n  ";
               }
           }else{//Insertar cotizacion no establecida   
               $val = str_replace(".", "", $val);
               $val = str_replace(",", ".", $val);
               $db->Query("INSERT INTO  cotizaciones_contables( suc, m_cod, fecha, hora, compra, venta, ref)VALUES ( '03', '$mon', CURRENT_DATE, CURRENT_TIME,$val, $val, 'G$');");
               echo "Registrando cotizacion $mon $val  \n  ";
           }
       } 
       
       file_put_contents("cotizaciones.txt", $rates);
       
      
    }
}
new SetParser();
?>
