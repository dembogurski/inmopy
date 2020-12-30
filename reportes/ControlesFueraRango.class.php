<?php

/**
 * Description of DescuentosMC
 * @author Ing.Douglas
 * @date 13/03/2017
 */

require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");

class ControlesFueraRango {
    
    private $totalizadores = array('usuario'=>"",'fecha'=>""); 
    private $sub_total = 0;    
    private $total = 0;
    
    function __construct(){
        
        $t = new Y_Template("ControlesFueraRango.html");
                
        
        $desde = $this->flipDate($_GET['desde'],'/');
        $hasta = $this->flipDate($_GET['hasta'],'/');  
        $suc = $_GET['select_suc'];
        $tipo = $_GET['tipo']; 
        $user = $_GET['user']; 
        $fuera_rango = $_GET['fuera_rango'];
        
        $t->Set("user",$user);
        $t->Set("time",date('d-m-Y H:i'));
        $t->Set("desde",$_GET['desde']);
        $t->Set("hasta",$_GET['hasta']);
        $t->Set("suc",$suc);
        
        if($tipo == "*"){
            $tipo = "%";
        }        
        $db = new My();
                    
       // $db->Query("SELECT f.f_nro AS factura,usuario,DATE_FORMAT(fecha_cierre,'%d-%m-%Y') AS fecha,hora,codigo,lote,descrip,cantidad,cant_falla,precio_costo,sis_med,cant_med,d.tipo_desc,fuera_rango,dif,ROUND(precio_costo * dif ,2) AS valor FROM  factura_venta f, fact_vent_det d WHERE f.f_nro = d.f_nro AND f.estado = 'Cerrada' AND f.e_sap IS NOT NULL AND fecha_cierre BETWEEN '$desde' AND '$hasta' AND d.tipo_desc  like '$tipo' AND dif $fuera_rango AND suc = '$suc' ORDER BY usuario ASC, fecha_cierre ASC ");
       $db->Query("SELECT f.f_nro AS factura,usuario,DATE_FORMAT(fecha_cierre,'%d-%m-%Y') AS fecha,hora,codigo,lote,descrip,cantidad,cant_falla,precio_costo,sis_med,cant_med,d.tipo_desc,round(if((ROUND(dif-(((cantidad+cant_falla)*2)/100),2)>0),round(dif-(((cantidad+cant_falla)*2)/100),2),0),2) as fuera_rango,dif,ROUND(precio_costo * if((ROUND(dif-(((cantidad+cant_falla)*2)/100),2)>0),round(dif-(((cantidad+cant_falla)*2)/100),2),0),2) AS valor,  round((((cantidad+cant_falla)*2)/100),2) as tolerancia FROM  factura_venta f inner join fact_vent_det d  using(f_nro) WHERE f.estado = 'Cerrada' AND f.e_sap IS NOT NULL AND fecha_cierre BETWEEN '$desde' AND '$hasta' AND d.tipo_desc  like '$tipo' AND dif $fuera_rango AND suc = '$suc' ORDER BY usuario ASC, fecha_cierre ASC");
        
        $cabeceras = array('factura','usuario','fecha','hora','codigo','lote','descrip','cantidad','cant_falla','precio_costo','sis_med','cant_med','tipo_desc','fuera_rango','tolerancia','dif','valor');
        
        
        
        $t->Show("header");        
        $t->Show("head");        
        while($db->NextRecord()){  
            $this->extraer($db,$t,$cabeceras );            
        }
        $t->Set("total", number_format($this->total, 2, ',', '.'));
        $t->Show("total");        
        $t->Show("foot");         
         
    }
    function extraer($db,$t,$cabeceras){
       
        foreach ($cabeceras as $cab) {
           $data = $db->Record[$cab];
           $t->Set("$cab",$data); 
           
           if($cab == 'valor'){ 
               $t->Set("$cab",  number_format($data, 2, ',', '.'));    
           }
           
           foreach ($this->totalizadores as $totaliz => $totval) {
                
                if($cab == $totaliz){
                    if($data != $totval && $totval != "" ){
                        if((float)$this->sub_total > 0){
                            $t->Set("sub_total", number_format($this->sub_total, 2, ',', '.'));
                            $t->Show("sub_total");
                        }
                        $this->sub_total = 0;
                    }
                    $this->totalizadores[$totaliz] = $data;
                }
           } 
             
           if($cab == 'valor'){
               $this->sub_total +=0 + $data;                
               $this->total +=0 + $data;
           }
        } 
        
        $t->Show("data");
    }
    
    private function flipDate($date,$separator){
        $date = explode($separator,$date);
        return $date[2].$separator.$date[1].$separator.$date[0];
    }
}
new ControlesFueraRango();

?>