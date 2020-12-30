<?php

 

/**
 * Description of HistorialUbicaciones
 *
 * @author Doglas
 */
require_once("../Y_Template.class.php");
require_once("../Y_DB_MySQL.class.php");

class HistorialUbicaciones {
     function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }

    function main() {

        $t = new Y_Template("HistorialUbicaciones.html");

        $codigo = $_REQUEST['codigo'];
        $lote = $_REQUEST['lote'];
       
        $t->Show("header");
        $t->Show("head");
        
        $db = new My();
        $db->Query("select id_ubic,suc, nombre as estante,fila,col,nro_pallet,usuario, date_format(fecha_hora,'%d-%m-%Y %h:%i') as fecha,cantidad as stock, obs,estado, DATE_FORMAT(fecha_salida,'%d-%m-%Y %h:%i') as fecha_salida, usuario_salida from reg_ubic where codigo ='$codigo' and lote ='$lote' order by id_ubic asc");
        
        while($db->NextRecord()){
            $id_ubic = $db->Get('id_ubic');
            $suc = $db->Get('suc');
            $estante = $db->Get('estante');
            $fila = $db->Get('fila');
            $col = $db->Get('col');
            $nro_pallet = $db->Get('nro_pallet');
            $usuario = $db->Get('usuario');
            $fecha = $db->Get('fecha');
            $stock = $db->Get('stock');
            $obs = $db->Get('obs');
            $estado = $db->Get('estado');
            $fecha_salida = $db->Get('fecha_salida');
            $usuario_salida = $db->Get('usuario_salida');
            
            $t->Set("id_ubic",$id_ubic);
            $t->Set("suc",$suc);
            $t->Set("estante",$estante);
            $t->Set("fila",$fila);
            $t->Set("col",$col);
            $t->Set("nro_pallet",$nro_pallet);
            $t->Set("usuario",$usuario);
            $t->Set("fecha",$fecha);            
            $t->Set("stock",number_format($stock, 2, ',', '.'));  
            $t->Set("obs",$obs);
            $t->Set("estado",$estado);
            $t->Set("fecha_salida",$fecha_salida);
            $t->Set("usuario_salida",$usuario_salida);
            
            $t->Show("data");
        }
        
        $t->Show("foot");

        //new NumPad();
    }
}

new HistorialUbicaciones();

?>
