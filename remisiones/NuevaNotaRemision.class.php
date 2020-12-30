<?php

/**
 * Description of NuevaRemision
 * @author Ing.Douglas
 * @date 04/01/2016
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");

class NuevaNotaRemision {
   function __construct(){  

        $suc = $_POST['suc'];
        $touch = $_POST['touch'];

        $my = new My();

        $my->Query("select valor from parametros where clave = 'porc_tolerancia_remsiones'");
        $my->NextRecord();

        $porc_tolerancia_remsiones = $my->Record['valor'];

        $t = new Y_Template("NotaRemision.html");

        $t->Set("porc_tolerancia_remsiones",$porc_tolerancia_remsiones);

        $t->Show("header");

        // Sucursales


        $sql = "SELECT suc,nombre FROM sucursales where suc != '$suc' and tipo <> 'Sub-Deposito' order by  nombre asc ";
        $my->Query($sql);
        $sucs = "";
        while ($my->NextRecord()) {
            $suc = $my->Record['suc'];
            $nombre = $my->Record['nombre'];
            $sucs.="<option value=" . $suc . ">" . $nombre . " ($suc)</option>"; 
        }
        $t->Set("sucursales", $sucs);

        $t->Show("remision_cab");
        $t->Show("area_carga_cab");
        $t->Show("area_carga_foot");
        // Solo si es Toutch
        if($touch=="true"){
            require_once("../utils/NumPad.class.php");            
            new NumPad();
        } 
        
   } 
}

new NuevaNotaRemision();
?>
