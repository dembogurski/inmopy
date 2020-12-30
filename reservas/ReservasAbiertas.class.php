<?php

/**
 * Description of ReservasAbiertas
 * @author Ing.Douglas
 * @date 04/05/2015
 */
 
require_once("../Y_Template.class.php"); 
require_once("../Y_DB_MySQL.class.php"); 

class ReservasAbiertas {

    function __construct() {
        //$session = $_POST['session'];
        $usuario = $_POST['usuario'];
        $suc = $_POST['suc'];

        $db = new My();
        $db->Query("SELECT nro_reserva as nro, DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha, cod_cli ,ruc_cli AS ruc, cliente,cat,valor_total_ref as total, estado  
        FROM reservas WHERE estado = 'Abierta' AND usuario = '$usuario' AND suc = '$suc'");

        $t = new Y_Template("Reserva.html");
        $t->Show("header");


        $va = new Y_Template("ReservasAbiertas.html");

        $va->Set("suc", $suc);
        $va->Set("usuario", $usuario);

        $va->Show("reservas_abiertas_cab");

        while ($db->NextRecord()) {
            $nro = $db->Record['nro'];
            $fecha = $db->Record['fecha'];
            $cod_cli = $db->Record['cod_cli'];
            $ruc = $db->Record['ruc'];
            $cat = $db->Record['cat'];
            $cliente = $db->Record['cliente'];
            $total = $db->Record['total'];
            $estado = $db->Record['estado'];

            $va->Set("nro", $nro);
            $va->Set("fecha", $fecha);
            $va->Set("cliente", $cliente);
            $va->Set("cod_cli", $cod_cli);
            $va->Set("ruc", $ruc);
            $va->Set("cat", $cat);
            $va->Set("total_neto", number_format($total, 0, ',', '.'));
            $va->Set("estado", $estado);

            $va->Show("reservas_abiertas_data");
        }

        $va->Show("reservas_abiertas_foot");
    }

}
new ReservasAbiertas();
?>
