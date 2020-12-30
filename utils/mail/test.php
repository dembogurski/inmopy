<?php
require_once("../../Y_DB_MySQL.class.php");
 
$db = new My();
$db->Database = 'inmopy';

$db->Query("SELECT usuario,nombre,apellido FROM usuarios  LIMIT 10");

if ($db->NumRows() > 0) {
    $message = "<div>";
    $i = 0;
    while ($db->NextRecord()) {
        $i++;
        $nombre = $db->Record['nombre'];
        $usuario = $db->Record['usuario'];
        $apellido = $db->Record['apellido'];

        $message.="<div><b>N&deg;: </b> $i <b><b>Usuario:</b> $usuario  Nombre:</b>$nombre - $apellido       <div>";
    }
    $message.="</div>";
    
    echo $message;
    
    $douglas = "dembogurski@gmail.com";

    $subject = "Usuarios";

    enviarMail($douglas, $subject, $message, false);

    //enviarMail('0986393670@mms.tigo.com.py',"Hola Soy el Servidor, se esta llenando el disco",$text,true);
}

function enviarMail($email, $subject, $message, $isHTML) {

    require_once("phpmailer-gmail/class.phpmailer.php");
    require_once("phpmailer-gmail/class.smtp.php");
    

    $mail = new PHPMailer();
    //$mail->SetLanguage("en");
    //$mail->IsSMTP();
    $mail->Mailer = "mail";
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
        echo "Error: " . $mail->ErrorInfo;
    } else {
        echo "Mensaje enviado correctamente.../n <br>";
    }
}
?>
 