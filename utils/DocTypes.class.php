<?php

 

/**
 * Description of DocTypes
 * @date 16/12/2019
 * @author Doglas
 */
class DocTypes {
  
   private $DocTypes = array();
   
   function __construct(){
       $this->DocTypes["FV"] = 'Factura Venta';
       $this->DocTypes["DV"] = 'Devolucion'; 
       $this->DocTypes["RS"] = 'Reserva'; 
       $this->DocTypes["FC"] = 'Factura Compra'; 
       $this->DocTypes["EM"] = 'Entrada Mercaderias por Compra';
       $this->DocTypes["DVP"] = 'Devolucion Proveedor';
       $this->DocTypes["PT"] = 'Productos Terminados'; 
       $this->DocTypes["AJ"] = 'Ajuste'; 
       $this->DocTypes["RM"] = '(Remision) Traslado de Stock';
       $this->DocTypes["FR"] = 'Fraccionamiento'; 
       /*Agregar + aqui*/ 
        
       
   }
   function getType($DocBase){       
      return $this->DocTypes[$DocBase];   
   }   
}
?>
