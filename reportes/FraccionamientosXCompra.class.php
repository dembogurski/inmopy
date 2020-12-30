<?php

/**
 * Description of FraccionamientosXCompra
 * @author Ing.Douglas
 * @date 21/11/2018
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class FraccionamientosXCompra {
    
    var $total_gral = 0;
     
    
    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }
    function main() {
        $t = new Y_Template("FraccionamientosXCompra.html");
        $t->Show("header");
        $ref = $_REQUEST['ref'];
        $lote = $_REQUEST['lote'];
        $user = $_REQUEST['user'];
        if($lote == ""){
            $lote ='%';
        }
          
        $t->Set("user", $user);
        $t->Set("time", date("d-m-Y H:i"));
        $my = new My();
         
        
        $sql =  'SELECT m.id_ent AS ref,usuario,invoice,IF(tipo_doc_sap = "OPDN","Entrada Mercaderias", IF(tipo_doc_sap = "OPCH","Factura Proveedor","Entrada Directa")) AS tipo,  
        proveedor,date_format(fecha,"%d-%m-%Y") as fecha,date_format(fecha_fact,"%d-%m-%Y") as fecha_fact, moneda,origen,pais_origen
        FROM entrada_merc m     WHERE  m.id_ent = '.$ref.' ';
       
        $my->Query($sql); 
        while ($my->NextRecord()) {
            $array = $my->Record ; // print_r($array);
            foreach ($array as $key => $value) {
               $t->Set($key, $value ); 
            }
        }
        $t->Show("head");
       
        
        $sql = "SELECT codigo,lote,descrip,color,um,gramaje_m,img,cantidad,kg_desc,quty_ticket,cant_calc  FROM entrada_det WHERE id_ent = $ref and lote like '$lote' order by descrip asc";
        $my->Query($sql);
        $numeros = array("gramaje_m","cantidad","quty_ticket","cant_calc","kg_desc");
        $t->Show("cabecera");
        $old_code = ""; 
        $totalcant_c_padre = 0;
        $total_parcial = 0;
        $total_gral_fracciones = 0;
        
        while ($my->NextRecord()) {
           $array = $my->Record ;
           $padre = "";
           $cant_c_padre = 0;
           $umc = "Mts";
           foreach ($array as $key => $value) {
              if(  in_array( $key ,$numeros)){
                  $t->Set($key,number_format($value,2,',','.')); 
              }else{
                  $t->Set($key, $value ); 
              }        
              if($key == "lote"){
                 $padre = $value; 
              }
              if($key == "cantidad"){
                 $cant_c_padre = $value; 
                 $totalcant_c_padre+=0+$value;
              }
              if($key == "um"){
                  $umc = $value;
              }
              $t->Set("totalcant_c_padre", number_format( $totalcant_c_padre ,2,',','.'));   
              
                 
              if($key == "codigo" && $value != $old_code && $old_code != ""){                 
                 $t->Show("subtotal");
                 $total_parcial = 0;
              }
              if($key == "codigo"){
                 $old_code = $value;  
              } 
           }
           $t->Show("data");   
           $total_fracciones = getFracciones($padre,$cant_c_padre, $t,$umc);  
           $total_parcial += 0 + $total_fracciones;  
           $total_gral_fracciones += 0 + $total_fracciones;  
           $t->Set("subtotal_total_frac", number_format( $total_gral_fracciones ,2,',','.'));   
           //echo "$total_gral_fracciones <br>";
           $porc_frac =  ($total_gral_fracciones * 100) /  $totalcant_c_padre;
           $t->Set("porc_frac", number_format( $porc_frac ,2,',','.'));   
             
        } 
        $t->Show("subtotal");
        $t->Show("footer");                 
        
    }
}
function getFracciones($padre,$cant_c_padre, $t, $umc){
     
    $my = new My();
        
    $sql = "SELECT id_frac,usuario,lote as hijo,date_format(fecha,'%d-%m-%Y') as fecha,tara,kg_desc,gramaje,ancho,cantidad FROM fraccionamientos where padre ='$padre' and suc = '00'";
    $my->Query($sql);
    $numeros = array("tara","kg_desc","gramaje","ancho","cantidad");
    $total_mts = 0;
    $total_kg = 0;
    
    $campo = "cantidad";
    if($umc == "Kg"){   
      $campo = "kg_desc";
    }
   
    while ($my->NextRecord()) {
       $array = $my->Record ;
       foreach ($array as $key => $value) {     
          if(  in_array( $key ,$numeros)){
              $t->Set($key,number_format($value,2,',','.')); 
               
              if($key == $campo){    
                 $total +=0+$value; 
              }
              if($key == "cantidad"){
                  $total_mts +=0+$value; 
              }
              if($key == "kg_desc"){
                  $total_kg +=0+$value; 
              }
          }else{
              $t->Set($key, $value ); 
          }              
       }
       $t->Show("fracciones");     
    }
    $t->Set("umc",$umc);
    
    if($total > 0){
       $diff =  $cant_c_padre - $total  ; 
       
       if($diff > 0 ){
           $t->Set("color_diff","red"); 
           $t->Set("diff","-".number_format($diff,2,',','.'));  
       }else if($diff == 0){
           $t->Set("diff","=".number_format($diff,2,',','.'));  
           $t->Set("color_diff","black"); 
       }else{
           $t->Set("diff","+".number_format($diff * -1,2,',','.'));  
           $t->Set("color_diff","green"); 
       }
       $t->Set("total_frac_mts",number_format($total_mts,2,',','.'));  
       $t->Set("total_frac_kg",number_format($total_kg,2,',','.'));  
       
       $t->Show("total_fracciones");     
    }
    $my->Close();
    return $total;
}
function getDatosCompra(){
    $ref = $_REQUEST['ref'];
    $lote = $_REQUEST['lote'];
    $my = new My();
    $filro_lote = "";
    if($lote != ""){      
        $filro_lote = " AND lote = '$lote' ";
    }
    $filro_ref = "";
    if($ref != ""){
        $filro_ref = " AND m.id_ent like '$ref' ";
    }
        
    $sql = 'SELECT m.id_ent AS Ref,usuario,invoice,IF(tipo_doc_sap = "OPDN","Entrada Mercaderias", IF(tipo_doc_sap = "OPCH","Factura Proveedor","Entrada Directa")) AS Tipo,
    proveedor,date_format(fecha,"%d-%m-%Y") as fecha,date_format(fecha_fact,"%d-%m-%Y") as fecha_fact, moneda,origen,pais_origen
    FROM entrada_merc m, entrada_det d  WHERE m.id_ent = d.id_ent  '.$filro_ref.' '.$filro_lote.'   ';
    $my->Query($sql);
    $array = array();
    while ($my->NextRecord()) {
        array_push($array, $my->Record);
    }
    $my->Close();
    echo json_encode( $array );
    
}
new FraccionamientosXCompra();

?>