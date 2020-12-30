<?php

/**
 * Description of PedidosDeCompra
 * @author Ing.Douglas
 * @date 23/11/2015
 */
 
require_once("../Y_Template.class.php"); 
require_once("../Y_DB_MySQL.class.php"); 



class PedidosDeCompra {
    function __construct(){
        $t = new Y_Template("PedidosDeCompra.html");
        $t->Set("colores",$this->getColores());
        $t->Set("disenos",$this->getPatrones());
        $t->Show("headers");
        $hoy = date("d-m-Y");
        $t->Set("hoy",$hoy);
        
        $db = new My();
        
        $sql = "SELECT suc,nombre FROM sucursales order by  nombre";
        $db->Query($sql);
        $sucs = "";
        while ($db->NextRecord()) {
            $suc = $db->Record['suc'];
            $nombre = $db->Record['nombre'];
            $sucs.="<option value=" . $suc . ">" . $nombre . "</option>";
        }
        $t->Set("sucursales", $sucs);
         
         // Previsto para dos dias normalmente
         $previsto =Date('d-m-Y', strtotime("+2 days"));
         $t->Set("fecha_prevista",$previsto);
          
         $db->Query("SELECT n_nro AS Nro ,DATE_FORMAT(fecha,'%d-%m-%Y') AS FechaCreacion, DATE_FORMAT(fecha_cierre,'%d-%m-%Y') AS FechaCierre,estado FROM nota_pedido_compra"
                 . " WHERE (estado = 'Pendiente' or estado = 'Cerrada') AND nac_int = 'Internacional'");
         
         $options = "";
         while($db->NextRecord()){
            $nro = $db->Record['Nro'];    
            $FechaCreacion = $db->Record['FechaCreacion'];    
            $FechaCierre = $db->Record['FechaCierre']; 
            $estado = $db->Record['estado'];  
            $display = 'block';
            if($estado == "Cerrada"){
                $display = 'none';
            }
            $options.="<option class='estado_$estado' style='display:$display'  value='$nro'>$nro - Fecha Creacion: $FechaCreacion    Fecha Cierre: $FechaCierre</option>";
         }
         $t->Set("options",$options);
         $t->Show("filters");
         $t->Show("pedidos_nacionales");
         $t->Show("pedidos_internacionales");         
         $t->Show("area_compra");
         $t->Show("area_tracking");
    }
    
    private function getColores(){
        $link = new My();
        $link->Query("SELECT nombre_color AS color FROM pantone WHERE estado = 'Activo' ORDER BY color ASC ");
        $colores = array();
        while($link->NextRecord()){
            array_push($colores,$link->Record['color']);
        }
        $link->Close();
        return json_encode(array_map('utf8_encode',$colores));
    }

    private function getPatrones(){
        $db = new My();
        $db->Query("SELECT design AS Folder, descrip AS Design FROM designs WHERE estado = 'Activo'");
          
        $patrones = array();

        while($db->NextRecord()){
            $current = array_map("utf8_encode",$db->Record);
            $current["files"] = $this->archivosPermitidos(scandir('../img/PATTERNS/'.$current['Folder'].'/'));
            array_push($patrones,$current);
        }
        $db->Close();
        
        return json_encode($patrones);
    }

    private function archivosPermitidos($files){
        $correct_files = array(".jpg",".png",".gif");
        $filtered = array();

        foreach($files as $file){
            $ex = strtolower(substr($file,strrpos($file,'.'),strlen($file)));
            if(in_array($ex,$correct_files)){
                array_push($filtered, $file);
            }

        }
        return $filtered;
    }
    
}
new PedidosDeCompra();
?>
