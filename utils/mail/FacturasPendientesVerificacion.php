<?php
require_once("../../Y_DB_MySQL.class.php");
 

$db = new My();
$db->Database = 'inmopy_sap';
 

$db->Query("SELECT f_nro, cod_cli,cliente,fecha_cierre as fecha, suc ,total  FROM factura_venta WHERE e_sap = 1 AND estado = 'Cerrada'  AND fecha_cierre <  (CURRENT_DATE - INTERVAL 2 DAY) AND YEAR(fecha_cierre) = YEAR(DATE(NOW())) order by suc asc,fecha asc limit 500");

 
if ($db->NumRows() > 0) {
    $message = '<table border="1  cellspacing="0" cellpadding="0" style="border-collpase:collapse"> ';
    $message.="<tr><th><b>#</b></th> <th>Ticket</th> <th>Suc</th> <td>Fecha</th></tr>";
    $i = 0;
    while ($db->NextRecord()) {
        $i++;
        $line = array_map("htmlentities",$db->Record);
        $f_nro = $line['f_nro'];
        $cod_cli = $line['cod_cli'];
        $cliente = $line['cliente'];
        $fecha = $line['fecha'];
        $suc = $line['suc'];

        $message.="<tr><td><b>$i</b></td> <td>$f_nro</td> <td>$suc</td> <td>$fecha</td></tr>";
    }
    $message.="</table>";
    $douglas = "dembogurski@gmail.com";
    $lelia = "lelia@corporaciontextil.com.py";
     
    $subject = "Facturas Pendientes de Verificacion";
    $message ="<html><body>$message</body></html>";

    //enviarMail("jack@corporaciontextil.com.py", $subject, $message, true);
    enviarMail($lelia, $subject, $message, true);
    enviarMail($douglas, $subject, $message, true);
    
    //enviarMail('0986393670@mms.tigo.com.py',"Hola Soy el Servidor, se esta llenando el disco",$text,true);
}else{ 
    print "No hay facturas pendientes de Verificacion";
}

function enviarMail($email, $subject, $message, $isHTML) {
    
    //echo "$email, $subject, $message, $isHTML"; 
    require_once("phpmailer-gmail/class.phpmailer.php");
    require_once("phpmailer-gmail/class.smtp.php");

    $mail = new PHPMailer();
    $mail->IsSMTP();
    $mail->SMTPAuth = true;
    $mail->SMTPSecure = "ssl";
    $mail->Host = "mail.inmopy.com";
    $mail->Port = 465;
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
 