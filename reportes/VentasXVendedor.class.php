<?php

/**
 * Description of VentasXVendedor
 * @author Ing.Douglas
 * @date 16/03/2017
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");
ini_set('max_execution_time', '0');

class VentasXVendedor {
    
    private $totalizadores = array('usuario'=>"",'fecha'=>""); 
    private $sub_total = 0;    
    private $total = 0;
    
    
    function __construct(){
        
        
        $t = new Y_Template("VentasXVendedor.html");                
        
        $desde = $this->flipDate($_GET['desde'],'/');
        $hasta = $this->flipDate($_GET['hasta'],'/');  
        $suc = $_GET['select_suc'];
        $usuario = $_GET['usuario']; 
        $agrupado = $_GET['agrupado'];
        $categorias ='';

        if(isset($_GET["cat_1"])){
            foreach(range(1,7) as $cat){
                $categorias .= ($_GET["cat_$cat"] == 'true')?"$cat,":"";
            }
            $categorias = trim($categorias,',');
        }else{
            $categorias = "1,2,3,4,5,6,7";
        }

        $t->Set("user", $_GET['user']);
        $t->Set("time",date('d-m-Y H:i'));
        $t->Set("desde",$_GET['desde']);
        $t->Set("hasta",$_GET['hasta']);
        $t->Set("suc",$suc);
        $t->Set("categorias",$categorias);
        
        $t->Show("header");
        if(strlen(trim($categorias)) == 0){
            $t->Set("error_msj","Debe seleccionar por lo menos una categoria");
            $t->Show("error");
        }else{
            
            $db = new My();
            if($agrupado == "true"){
                $this-> agrupado($desde,$hasta,$suc,$usuario,$t,$categorias);
            }else{
                $db->Query("SELECT f_nro,usuario,DATE_FORMAT(fecha_cierre,'%d-%m-%Y') AS fecha,ruc_cli,cliente,cat,total,estado FROM factura_venta"
                    . " WHERE suc LIKE '$suc' AND  usuario LIKE '$usuario' AND estado = 'Cerrada' and fecha_cierre between '$desde' and '$hasta' AND cat in ($categorias)  /*AND e_sap IS NOT NULL*/ ORDER BY usuario ASC,fecha_cierre ASC");
                $cabeceras = array('f_nro','usuario','fecha','ruc_cli','cliente','cat','total','estado');

                
                $t->Show("head");      


                while($db->NextRecord()){  
                    $this->extraer($db,$t,$cabeceras);            
                }
                $t->Set("total", number_format($this->total, 2, ',', '.'));
                $t->Show("total");        
            }
        }
        $t->Show("foot");              
         
    }
    
    function extraer($db,$t,$cabeceras){
       
        foreach ($cabeceras as $cab) {
           $data = $db->Record[$cab];
           $t->Set("$cab",$data); 
           
           if($cab == 'total'){ 
               $t->Set("$cab",  number_format($data, 2, ',', '.'));    
           }
           
           foreach ($this->totalizadores as $totaliz => $totval) {
                
                if($cab == $totaliz){
                    if($data != $totval && $totval != "" ){
                        $t->Set("sub_total", number_format($this->sub_total, 2, ',', '.'));
                        $t->Show("sub_total");
                        $this->sub_total = 0;
                    }
                    $this->totalizadores[$totaliz] = $data;
                }
           } 
             
           if($cab == 'total'){
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
    function agrupado($desde,$hasta,$suc,$usuario,$t,$categorias){
        $db = new My();
        $t->Show("head_agrup");      
        $query = "SELECT  f.f_nro, f.suc, f.usuario,
		SUM(d.cantidad) AS cant,
		SUM( IF(d.estado_venta = 'Normal', d.subtotal,0)) AS Normal,
		SUM( IF( d.estado_venta <> 'Normal', d.subtotal,0)) AS Oferta,
		SUM(d.subtotal) AS Total, SUM( IF(d.estado_venta = 'Normal', descuento,0)) AS DescNormal,
		SUM( IF(d.estado_venta <> 'Normal', descuento,0)) AS DescOferta,SUM(descuento) AS Descuento, 
		SUM(ncr.subtotal) AS Devolucion, SUM(d.subtotal) AS Neto FROM factura_venta f 
		INNER JOIN fact_vent_det d ON f.f_nro = d.f_nro 

		LEFT JOIN (SELECT n.f_nro,nd.lote,nd.cantidad,nd.precio_unit,nd.subtotal FROM nota_credito_det nd INNER JOIN nota_credito n USING(n_nro) WHERE n.estado='Cerrada' AND n.e_sap = 1) AS ncr ON f.f_nro = ncr.f_nro AND d.lote = ncr.lote 

		WHERE f.estado = 'Cerrada'   

		AND f.fecha_cierre BETWEEN '$desde' AND '$hasta'  AND f.usuario LIKE '$usuario' AND f.suc LIKE '$suc' AND f.cat IN ($categorias) GROUP BY f.suc,f.usuario ORDER BY f.suc,f.usuario ";
        $TNormal = 0;
        $TCant = 0;
        $TOferta = 0;
        $TTotal = 0;
        $TDescNormal = 0;
        $TDescOferta = 0;
        $TDescuento = 0;  
        $TDevolucion = 0;  
        $TNeto = 0;   
        
        while($db->NextRecord()){        
           $suc_ = $db->Record['suc']; 
           $usuario_ = $db->Record['usuario']; 
           $cant = $db->Record['cant']; 
           $normal = $db->Record['Normal']; 
           $oferta = $db->Record['Oferta']; 
           $Total = $db->Record['Total']; 
           $DescNormal = $db->Record['DescNormal']; 
           $DescOferta = $db->Record['DescOferta']; 
           $Descuento = $db->Record['Descuento']; 
           $Devolucion = $db->Record['Devolucion']; 
           $Neto = $db->Record['Neto']; 
           $Neto = $Neto - ( $Devolucion + $Descuento );
           
           $TCant += (float)$cant;
           $TNormal += 0 + $normal;
           $TOferta += 0 + $oferta;
           $TTotal += 0 + $Total;
           $TDescNormal += 0 + $DescNormal;
           $TDescOferta += 0 + $DescOferta;
           $TDescuento += 0 + $Descuento;  
           $TDevolucion += 0 + $Devolucion;  
           $TNeto += 0 + $Neto;  
           
           
           $t->Set("suc",$suc_);
           $t->Set("usuario",$usuario_);
           $t->Set("cant",number_format($cant,0, ',', '.'));
           $t->Set("Normal", number_format($normal,0, ',', '.'));
           $t->Set("Oferta", number_format($oferta,0, ',', '.'));
           $t->Set("Total", number_format($Total,0, ',', '.'));
           $t->Set("DescNormal", number_format($DescNormal,0, ',', '.'));
           $t->Set("DescOferta", number_format($DescOferta,0, ',', '.'));
           $t->Set("Descuento", number_format($Descuento,0, ',', '.'));
           $t->Set("Devolucion", number_format($Devolucion,0, ',', '.'));
           $t->Set("Neto", number_format($Neto,0, ',', '.'));
           
           $t->Set("sub_total", number_format($this->sub_total, 2, ',', '.'));
           $t->Show("data_agrup"); 
        }
        $t->Set("TCant", number_format($TCant,0, ',', '.'));
        $t->Set("TNormal", number_format($TNormal,0, ',', '.'));
        $t->Set("TOferta", number_format($TOferta,0, ',', '.'));
        $t->Set("TTotal", number_format($TTotal,0, ',', '.'));
        $t->Set("TDescNormal", number_format($TDescNormal,0, ',', '.'));
        $t->Set("TDescOferta", number_format($TDescOferta,0, ',', '.'));
        $t->Set("TDescuento", number_format($TDescuento,0, ',', '.'));
        $t->Set("TDevolucion", number_format($TDevolucion,0, ',', '.'));
        $t->Set("TNeto", number_format($TNeto,0, ',', '.'));
        
        $t->Show("total_agrup"); 
        $t->Show("foot"); 
    }
    
    
}
new VentasXVendedor();

?>
