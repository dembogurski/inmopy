<?php

/**
 * Description of TicketReserva
 * @author Ing.Douglas
 * @date 04/05/2015
 */
require_once("../Y_DB_MySQL.class.php");
require_once("../Y_Template.class.php");

class TicketReserva {

    function __construct() {

        $fecha = date("d-m-Y");
        $reserva = $_REQUEST['reserva'];
        $cliente = $_REQUEST['cliente'];
        $ruc = $_REQUEST['ruc'];
        $suc = $_REQUEST['suc'];
        $db = new My();
        $db->Query("SELECT tel FROM sucursales WHERE suc = '$suc'");
        $db->NextRecord();
        $tel = $db->Record['tel'];
        
        $db->Query("SELECT date_format(vencimiento,'%d-%m-%Y') as venc FROM reservas WHERE nro_reserva = '$reserva'");
        $db->NextRecord();
        $venc = $db->Record['venc'];
 
        $add = $add."+--------------------------------------+\n"; 
        $add = $add."|            Marijoa Tejidos           |\n";
        $add = $add."|                                      |\n";
        $add = $add."|           TICKET DE RESERVA          |\n";
        $add = $add."+--------------------------------------+\n"; 
        
        $add = $add . "Nro: $reserva    Fecha: $fecha\n";
        $add = $add . "Cliente:  $cliente\n";
        $add = $add . "C.I./RUC: $ruc\n";
        $add = $add . "Tel:  $tel \n"; 
        $add = $add . " \n";
        $add = $add."+------------- Detalle ---------------+\n";        
        $add = $add . "#| Codigo |  Precio | Cant. | Subtotal |\n";

        $Nro = 0;
         

        $t = new Y_Template("Ticket.html");
        
        $SENIA = 0;
        $db->Query("SELECT minimo_senia_ref from reservas where nro_reserva =  $reserva");
        $db->NextRecord();
        $SENIA = $db->Get('minimo_senia_ref');
        
        $db->Query("SELECT codigo,lote,descrip,um ,cantidad,precio as precio_venta,subtotal from reservas_det where nro_reserva =  $reserva");

        $TOTAL = 0;
        

        while ($db->NextRecord()) {
            $Nro++;
            //$codigo = $db->Record['codigo']; 
            $lote = $this->str_fill($db->Record['lote'], 9);
            $descrip = ucfirst(strtolower($db->Record['descrip']));
            //$um_cod = $db->Record['um_cod']; 
            $cantidad = $this->str_fill($db->Record['cantidad'], 7, "L");
            $pv = $db->Record['precio_venta'];
            $tab_precio = 6;
            if ($pv > 99999) {
                $tab_precio = 5;
            } 
            $precio_venta = $this->str_fill(number_format($pv, 0, ',', '.'), $tab_precio, "L");

              
            $subtotal_venta = $db->Record['subtotal'];
            $tab_subt = 12;
            //if($subtotal_venta > 99999){   $tab_subt = 10;   }if($subtotal_venta > 999999){   $tab_subt = 9;   }
            if ($Nro > 9) {
                $tab_subt--;
            }
            $subtotal = $this->str_fill(number_format($subtotal_venta, 0, ',', '.'), $tab_subt, "L"); 
            $TOTAL+=0 + $db->Record['subtotal']; 

            $add = $add . "$Nro- $lote $precio_venta $cantidad $subtotal\n";
            $add = $add . "" . $descrip . "\n";
        }
        $add = $add . " \n";
        
        $TOTAL_BRUTO = $TOTAL  ; 
        //$SENIA =  ($TOTAL * 30) / 100;

        $TOTAL_BRUTO = $this->str_fill(number_format($TOTAL_BRUTO, 0, ',', '.'), 31, "L", "_");
        $TOTAL_SENHA = $this->str_fill(number_format($SENIA, 0, ',', '.'), 22, "L", "_");
        
         
        $add = $add."TOTAL Gs.".$TOTAL_BRUTO." \n";

        $add = $add."TOTAL A ABONAR Gs.".$TOTAL_SENHA." \n";

        $add = $add . " \n";
        $add = $add."\nLa reserva tendra vigencia hasta la \nfecha $venc.\nUna vez vencida la reserva el cliente no\ntendra derecho a reclamar su mercaderia\nsolo podra retirar mercaderias por el valor abonado. ";
        $add = $add."El cliente debe pasar a abonar el Total restante antes de la fecha de vencimiento\n";
        $add = $add . "     Gracias por su preferencia!    \n";
        $add = $add . " \n";
        $add = $add . " \n";
        $add = $add . " \n";
        $add = $add . " \n";
        //echo $add;
        $t->Set("content", $add);
        $t->Show("submit_form");
    }

    /**
     * 
     * @param type $string
     * @param type $int length
     * @param type $string (Left or Right) L or R
     * @return string
     */
    function str_fill($string, $m_len, $lr = "R", $char = " ") {
        $tmp = $string;
        //$fill = $m_len-strlen($tmp);
        while (strlen($tmp) < $m_len) {
            if ($lr == "R") {
                $tmp .=$char;
            } else {
                $tmp = $char . $tmp;
            }
        }
        return $tmp;
    }

}
new TicketReserva();
?>
