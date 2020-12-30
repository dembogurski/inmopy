<?php
require_once("../../Y_DB_MySQL.class.php");

$db = new My();
$db->Database = 'inmopy';

$db2 = new My();
$db2->Database = 'inmopy';



$db->Query("SELECT f_nro,cod_cli,cliente,cat,usuario, DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,ruc_cli,suc,total FROM factura_venta WHERE fecha = current_date and cod_desc = 3 ORDER BY suc ASC");


if ($db->NumRows() > 0) {
    $message = '<table border="2  cellspacing="0" cellpadding="2" style="width:80%;border-collpase:collapse"> ';
    $message.="<tr><th>f_nro</th> <th>cod_cli</th> <th>cliente</th> <th>cat</th><th>usuario</th><th>fecha</th><th>ruc_cli</th><th>suc</th><th>total</th></tr>";
    $i = 0;
    while ($db->NextRecord()) {
        $i++;
        $line = array_map("htmlentities",$db->Record);
        $f_nro = $line['f_nro'];
        $cod_cli = $line['cod_cli'];
        $cliente = $line['cliente'];
        $cat = $line['cat'];
        $usuario = $line['usuario'];
        $fecha = $line['fecha'];
        $ruc_cli = $line['ruc_cli'];
        $suc = $line['suc'];
        $total = $line['total'];
      


        $db2->Query("SELECT codigo, descrip, SUM(cantidad) AS cantidad, precio_venta, SUM(subtotal) AS sub_Total 
        FROM fact_vent_det WHERE f_nro = $f_nro GROUP BY codigo, precio_venta");
        $i2 = 0;
        $det = '';

        while ($db2->NextRecord()) {
                $i2++;
                $line = array_map("htmlentities",$db2->Record);
                $codigo = $line['codigo'];
                $descrip = $line['descrip'];
                $cantidad = $line['cantidad'];
                $precio_venta = $line['precio_venta'];
                $sub_Total = $line['sub_Total'];

        $det.="<tr> <td>$codigo</td> <td>$descrip</td> <td style='text-align:right'>$cantidad</td> <td style='text-align:right'>$precio_venta</td> <td style='text-align:right'>$sub_Total</td></tr>";
        }

    $message.="<tr><td>$f_nro</td><td>$cod_cli</td><td>$cliente</td><td>$cat</td><td>$usuario</td><td>$fecha</td><td>$ruc_cli</td><td>$suc</td><td style='text-align:right'>$total</td></tr><tr> <td colspan='10'>
    <table border = '1' style = 'width:100%;border-collapse:collapse'>
    <th>Codigo</th><th>Descripcion</th><th>Cant.</th><th>Precio Venta</th><th>Sub Total</th>
    $det 
    </table><br><br></td></tr>";

    }
    $message.="</table>";
   
    $ricardo = "ricardoyunis@corporaciontextil.com.py";
    $andrea = "andrea@corporaciontextil.com.py";
    $rocio = "rocio@corporaciontextil.com.py";
    $sistema = "sistema@inmopy.com";
   
    $subject = "Ventas Mayoristas";
    $message ="<html><body>$message</body></html>";


    enviarMail($sistema, $subject, $message, true);
    enviarMail($ricardo, $subject, $message, true);
    enviarMail($andrea, $subject, $message, true);
    enviarMail($rocio, $subject, $message, true);

    //enviarMail('0986393670@mms.tigo.com.py',"Hola Soy el Servidor, se esta llenando el disco",$text,true);
}else{ 
    print "No nada para enviar del Dia";
}

function enviarMail($email, $subject, $message, $isHTML) {
    
    //echo "$email, $subject, $message, $isHTML"; 
    require_once("phpmailer-gmail/class.phpmailer.php");
    require_once("phpmailer-gmail/class.smtp.php");

    $mail = new PHPMailer();
    $mail->IsSMTP();
    $mail->SMTPAuth = true;
    $mail->SMTPSecure = "ssl";
    $mail->Host = "sv42.byethost42.org";
    $mail->Port = 290;
    $mail->Username = "sistema@inmopy.com";
    $mail->Password = "rootdba";

    $mail->From = "sistema@inmopy.com";
    $mail->FromName = "Sistema Marijoa";
    $mail->Subject = "$subject";
    $mail->MsgHTML("$message");
    $mail->AltBody = "$message";

    $mail->AddAddress("$email", "$email");

    $mail->IsHTML($isHTML);

    if (!$mail->Send()) {
        print "Error: " . $mail->ErrorInfo;
    } else {
        print "Mensaje enviado correctamente.../n <br>";
    }
}
?>
 