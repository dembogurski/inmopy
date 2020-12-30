<?php

/**
 * Description of SET
 * @author Ing.Douglas
 * @date 31/03/2017
 */
require_once("../../Y_DB_MySQL.class.php");

class SET {

    function __construct() {

        $compra = array();
        $venta = array();
        $rates = "{";

        $web = 'wget -q http://www.set.gov.py/portal/PARAGUAY-SET -O -| grep "UICotizacion" | grep "G." | grep "," > SET';
        $output = shell_exec($web);

        echo "Cotizaciones bajadas\n\r<br>";
        sleep(1);

        $handler = fopen("SET", "r");
        if ($handler) {
            $i = 0;
             
            while (($line = fgets($handler)) !== false) {
                $cut = str_replace('<span class="UICotizacion">G.', "", $line);
                $cut = str_replace('</span>', "", $cut);
                $cut = trim(str_replace('</div>', "", $cut));
                            
                            
                        echo "$i  :  $cut \n\r<br>";
                        //$cotiz[$k] = $cut;
                        $valor = $cut;
                        $valor = str_replace(".","", $cut);
                        $valor = str_replace(",",".", $valor);
                       
                        if($i == 0){
                           $compra['U$']= $valor;
                        }
                        if($i == 1){
                           $venta['U$']= $valor;
                        }
                        if($i == 4){
                           $compra['P$']= $valor;
                        }
                        if($i == 5){
                           $venta['P$']= $valor;
                        }
                        if($i == 8){
                           $compra['R$']= $valor;
                        }
                        if($i == 9){
                           $venta['R$']= $valor;
                        }  
                $i++;
                if ($i == 10) {
                    break;
                }
            }
        }
        fclose($handler); 

        //print_r($compra);
        $this->actualizarCotizaciones($compra,'compra');
        //echo "<br>";
        //print_r($venta);
        $this->actualizarCotizaciones($venta,'venta');
         
                            
    }
    
    function actualizarCotizaciones($cotizaciones,$compra_venta){
        $db = new My();
        foreach ($cotizaciones as $moneda => $cotiz) {
           $db->Query("SELECT m_cod AS moneda,$compra_venta FROM cotizaciones_contables WHERE m_cod = '$moneda' AND fecha = CURRENT_DATE and suc = '03' ORDER BY id_cotiz DESC LIMIT 1");
           $today = date("d-m-Y");
           //$today = date("07-08-2018");
              
           if($db->NumRows() > 0){
               $db->NextRecord();
               $cotiz_establecida =  $db->Record[$compra_venta]  ;  
                 
               if($cotiz != $cotiz_establecida){//Update
                     
                   insertar($compra_venta,$moneda,$cotiz);
                                      
                   echo "Cotizacion [$compra_venta] $moneda   $cotiz_establecida  != a establecida: $cotiz <br> \n  ";
                    
                   
               }else{// No hacer nada cotizacion establecida e igual a la actual 
                   echo "Cotizacion [$compra_venta] $moneda   $cotiz_establecida  =  a pre-establecida: $cotiz  nada por hacer <br> \n  ";
               }
           }else{//Insertar cotizacion no establecida   
               insertar($compra_venta,$moneda,$cotiz); 
               //$db->Query("INSERT INTO  cotizaciones_contables( suc, m_cod, fecha, hora, $compra_venta, ref)VALUES ( '03', '$moneda', CURRENT_DATE, CURRENT_TIME,$cotiz,'G$');");
               echo "Registrando cotizacion $moneda [$compra_venta] $cotiz  <br> \n  ";
           }
         }
        
    }
}
function insertar($compra_venta,$moneda,$cotiz){
    $db = new My();
    if($compra_venta == 'compra'){
        $db->Query("SELECT venta FROM cotizaciones_contables WHERE m_cod = '$moneda' AND fecha = CURRENT_DATE and suc = '03' ORDER BY id_cotiz DESC LIMIT 1");
        $venta = 0;
        if($db->NumRows()>0){
            $db->NextRecord();
            $venta = $db->Record['venta'];
        }
        $db->Query("INSERT INTO  cotizaciones_contables( suc, m_cod, fecha, hora, $compra_venta,venta, ref)VALUES ( '03', '$moneda', CURRENT_DATE, CURRENT_TIME,$cotiz,$venta,'G$');");
    }else{ //Venta
        $db->Query("SELECT compra FROM cotizaciones_contables WHERE m_cod = '$moneda' AND fecha = CURRENT_DATE and suc = '03' ORDER BY id_cotiz DESC LIMIT 1");
        $compra = 0;
        if($db->NumRows()>0){
            $db->NextRecord();
            $compra = $db->Record['compra'];
        }
        $db->Query("INSERT INTO  cotizaciones_contables( suc, m_cod, fecha, hora, $compra_venta,compra, ref)VALUES ( '03', '$moneda', CURRENT_DATE, CURRENT_TIME,$cotiz,$compra,'G$');");
    }
    
}

new SET();
?>
