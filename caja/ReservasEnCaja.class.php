<?php

/**
 * Description of ReservasEnCaja
 * @author Ing.Douglas
 * @date 04/05/2015
 */
require_once("../Y_DB_MySQL.class.php"); 
require_once("../Y_Template.class.php");

class ReservasEnCaja {

    function __construct() {
        //$session = $_POST['session'];
        $usuario = $_POST['usuario'];
        $suc = $_POST['suc'];

        $db = new My();
        $db->Query("SELECT nro_reserva as nro, DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha, cod_cli ,ruc_cli AS ruc, cliente,cat,valor_total_ref as total,minimo_senia_ref, estado  
        FROM reservas WHERE estado = 'En_caja'   AND suc = '$suc'");
 

        $va = new Y_Template("ReservasEnCaja.html");

        $va->Set("suc", $suc);
        $va->Set("usuario", $usuario);
        
        $va->Show("header");

        $va->Show("reservas_encaja_cab");

        while ($db->NextRecord()) {
            $nro = $db->Record['nro'];
            $fecha = $db->Record['fecha'];
            $cod_cli = $db->Record['cod_cli'];
            $ruc = $db->Record['ruc'];
            $cat = $db->Record['cat'];
            $cliente = $db->Record['cliente'];
            $total = $db->Record['total'];
            $minimo_senia_ref = $db->Record['minimo_senia_ref'];
            $estado = $db->Record['estado'];

            $va->Set("nro", $nro);
            $va->Set("fecha", $fecha);
            $va->Set("cliente", $cliente);
            $va->Set("cod_cli", $cod_cli);
            $va->Set("ruc", $ruc);
            $va->Set("cat", $cat);
            $va->Set("total_neto", number_format($total, 0, ',', '.'));
            $va->Set("minimo_senia_ref", number_format($minimo_senia_ref, 0, ',', '.'));
            $va->Set("estado", $estado);

            $va->Show("reservas_encaja_data");
        }
        $va->Show("reservas_encaja_foot");  
        
        
        // Buscar Convenios
        $my = new My();
        $my->Query("SELECT tipo,cod_tarjeta AS CreditCard,nombre AS CardName,CASE  WHEN tipo = 'Tarjeta Debito'  THEN 1   WHEN tipo = 'Tarjeta Credito'  THEN 1 WHEN tipo = 'Asociacion'  THEN 2 ELSE 3 END AS prioridad FROM tarjetas ORDER BY prioridad ASC , CardName ASC");
        $convenios = "";
        while($my->NextRecord()){
            $conv_cod = $my->Record['CreditCard'];
            $conv_nombre = $my->Record['CardName'];
            $convenios.="<option value='$conv_cod'>$conv_nombre</option>";
        }        
        $va->Set("convenios",$convenios); 
        
        /*
        // Buscar Lista de Bancos
        $db->Query("SELECT id_banco,nombre FROM bancos order by nombre asc");
        $bancos = "";
        while($db->NextRecord()){
           $id_banco = $db->Record['id_banco'];
           $nombre = $db->Record['nombre'];
           $bancos.="<option value='$id_banco'>$nombre</option>";
        }
        $va->Set("bancos",$bancos); 
        */
        // Buscar Lista de Monedas
        $db->Query("SELECT m_cod AS moneda, m_descri FROM monedas ");
        $monedas = "";
        $monedas_cod = "";
        while($db->NextRecord()){
           $moneda = $db->Record['moneda'];
           $m_descri = $db->Record['m_descri'];
           if($moneda != 'P$' && $moneda != 'R$'){
              $monedas.="<option value='$moneda'>$m_descri</option>";
           }
           $monedas_cod.="<option value='$moneda'>$moneda</option>";
        }
        $va->Set("monedas",$monedas); 
        $va->Set("monedas_cod",$monedas_cod); 
       
        
        $va->Show("ui_reserva");  
    
    }
}
new ReservasEnCaja();
?>
    