<?php
ini_set('max_execution_time', 1800);
require_once("../../Y_DB_MySQL.class.php");

$anho = date('Y');
$mes = date('m');

// echo "$anhio - $mes"; 

if ($mes == '1' || $mes == '01') {
    $anho--;
    $mes = '12';
}else{
    $mes--;
    if ($mes < 10) {
        $mes = "0$mes";
    }
}
$fecha_anho = "$anho-$mes";
 
// Temporalmente para sacar reporte de Enero 01 - 08 del 2019
// $fecha_anho = "2019-08";            
           

 
$db = new My();
$db->Database = 'inmopy';
 
$sql = "SELECT f.f_nro AS Ticket, fact_nro AS Factura,f.tipo_fact AS TipoFact , cliente AS Cliente,ruc_cli AS RUC, DATE_FORMAT(fecha_cierre,'%d-%m-%Y') AS Fecha,suc,cat, pref_pago,cant_cuotas,tipo,SUM(d.subtotal) AS Total, ROUND( SUM(precio_costo * cantidad),2) AS PrecioCosto
FROM factura_venta f, fact_vent_det d WHERE f.f_nro = d.f_nro AND f.estado = 'Cerrada' AND fact_nro IS NOT NULL AND f.fecha_cierre LIKE '$fecha_anho%' AND f.e_sap IS NOT NULL   GROUP BY f.f_nro";


$db->Query($sql);

 
if ($db->NumRows() > 0) {
    $message = '<table border="1  cellspacing="0" cellpadding="0" style="border-collpase:collapse"> ';
    $message .= "<tr><td colspan='14'>Reporte Facturas Legales $fecha_anho </td></tr>";
    $message .="<tr> <th><b>#</b></th> <th>Ticket</th> <th>Fact Num</th> <td>Tipo Fact</th> <th>Cliente</th> <th>Ruc</th> <th>Fecha</th> <th>Suc</th> <th>Cat</th> <th>Pref_Pago</th> <th>Cant. Cuotas</th> <th>Tipo</th> <th>Total</th> <th>Precio Costo</th> </tr>";
    $i = 0;
    while ($db->NextRecord()) {
        $i++;
        $line = array_map("htmlentities",$db->Record);
        $f_nro = $line['Ticket'];
        $fact_nro = $line['Factura'];
        $tipo_fact = $line['TipoFact'];
        $cliente = $line['Cliente'];
        $ruc_cli = $line['RUC'];
        $Fecha = $line['Fecha'];
        $suc = $line['suc'];
        $cat = $line['cat'];
        $pref_pago = $line['pref_pago'];
        $cant_cuotas = $line['cant_cuotas'];
        $tipo = $line['tipo'];
        $Total = $line['Total'];
        $PrecioCosto = $line['PrecioCosto'];

        $message.="<tr><td><b>$i</b></td>  <td>$f_nro</td> <td>$fact_nro</td> <td>$tipo_fact</td> <td>$cliente</td> <td>$ruc_cli</td> <td>$Fecha</td> <td>$suc</td> <td>$cat</td> <td>$pref_pago</td> <td>$cant_cuotas</td> <td>$tipo</td> <td>$Total</td> <td>$PrecioCosto</td> </tr>";
    }
    $message.="</table>";
    $ariel = "ariel5bobadilla@gmail.com";
    $douglas = "douglas@corporaciontextil.com.py";
    $arnaldo = "arnaldoa@corporaciontextil.com.py";
    $arnaldogmail = "arnaldo.aquino4570@gmail.com";
     
    $subject = "Facturas Legales mes $fecha_anho";
    $message .="<html><body>$message</body></html>";


    // echo "$message";
    // enviarMail("jack@corporaciontextil.com.py", $subject, $message, true);
    // enviarMail($lelia, $subject, $message, true);
    enviarMail($ariel, $subject, $message, true);
    enviarMail($douglas, $subject, $message, true);
    enviarMail($arnaldo, $subject, $message, true);
    enviarMail($arnaldogmail, $subject, $message, true);

    //enviarMail('0986393670@mms.tigo.com.py',"Hola Soy el Servidor, se esta llenando el disco",$text,true);
}else{ 
    print "No hay facturas para ese mes";
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
 