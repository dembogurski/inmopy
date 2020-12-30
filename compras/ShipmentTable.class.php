<?php

/**
 * Description of ShipmentTable
 * @author Ing.Douglas
 * @date 23/03/2016
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");

class ShipmentTable {
    function __construct() {
       
       $to_user = $_POST['usuario']; 
       //$to_user = '%';
       
       $db = new My();
       // Cerrar las Compras  
    
       
       $sql = "update compras c set c.estado = 'Pendiente' WHERE cod_prov  in ( select cod_prov  from compra_det d where  (d.estado = 'Partial' OR d.estado = 'Pending')   group by d.cod_prov HAVING COUNT(d.estado) >0 ) ;";      
       $db->Query( $sql );
       /*
       $sql = "UPDATE compras c SET c.estado = 'Cerrada' WHERE cod_prov IN ( SELECT cod_prov   FROM compra_det d  GROUP BY d.cod_prov HAVING COUNT(d.estado) = SUM( IF((d.estado = 'Complete' OR d.estado = 'N/A'),1,0)) );";
       $db->Query( $sql );
       */
       $t = new Y_Template("ShipmentTable.html");
       
       $t->Show("header");
       
       
       $db->Query("SELECT md5(concat(c.n_nro,c.cod_prov)) as Id, c.n_nro AS Number,c.cod_prov AS Provider, DATE_FORMAT(c.fecha,'%d-%m-%Y') AS Date,moneda AS Currency,SUM(d.subtotal) AS Total,prioridad AS Priority, 
       DATE_FORMAT(fecha_entrega,'%d-%m-%Y') AS Delivery_Date,
       volumen AS Volume ,c.estado AS State
       FROM nota_pedido_compra n, compras c, compra_det d WHERE n.n_nro = c.n_nro AND d.n_nro AND c.cod_prov = d.cod_prov AND (n.estado = 'En Proceso' or n.estado = 'Cerrada' ) AND (c.estado = 'Pendiente')

       AND c.to_usuario LIKE '$to_user' group by n.n_nro,c.cod_prov");
       
       
       
       $t->Set("to_user",$to_user);
       $t->Show("table_header");
       
       while($db->NextRecord()){
          $id = $db->Record['Id']; 
          $Number = $db->Record['Number'];
          $Provider = $db->Record['Provider'];
          $Date= $db->Record['Date'];
          $Total = $db->Record['Total'];
          $Currency = $db->Record['Currency'];
          $Priority = $db->Record['Priority'];
          $Delivery_Date = $db->Record['Delivery_Date'];
          if($Delivery_Date == "" ){
              $Delivery_Date = "...";
          }
          $Volume = $db->Record['Volume'];
          if($Volume == "" ){
             $Volume = "&nbsp;"; 
          }
          $State = $db->Record['State'];
          if($State == 'Pendiente'){
              $State = 'Pending';
          }
          $color = "green";
          if($Priority == 1){
              $color = "green";
          }else if($Priority == 2){
              $color = "yellow";
          }else{//3 Red
             $color = "red"; 
          }
          
          $t->Set("id",$id);
          $t->Set("Number",$Number);
          $t->Set("Provider",$Provider);
          $t->Set("Date",$Date);
          $t->Set("Currency",$Currency);
          $t->Set("curr_class", str_replace("$","s",$Currency));
          
          $t->Set("total",number_format($Total,2,',','.'));     
          
          $t->Set("Priority",$Priority);
          $t->Set("Priority_Color",$color);
          $t->Set("Delivery_Date",$Delivery_Date);
          $t->Set("Volume",$Volume);
          $t->Set("State",$State);
          $t->Show("table_data");
       }
       $t->Show("table_footer");
    }
}
new ShipmentTable();
?>
