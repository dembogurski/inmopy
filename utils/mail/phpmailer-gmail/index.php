<?php
include("class.phpmailer.php");
include("class.smtp.php");

$mail = new PHPMailer();
$mail->IsSMTP();
$mail->SMTPAuth = true;
$mail->SMTPSecure = "ssl";
$mail->Host = "smtp.gmail.com";
$mail->Port = 465;
$mail->Username = "tratohechopy@gmail.com";
$mail->Password = "mastercase";

$mail->From = "douglas@tratohecho.com.py";
$mail->FromName = "Douglas";
$mail->Subject = "Subject del Email test by douglas";
$mail->AltBody = "Hola, te doy mi nuevo numero\nxxxx.";
$mail->MsgHTML("Hola, te doy mi nuevo numero<br><b>xxxx</b>.");
$mail->AddAttachment("files/files.zip");
$mail->AddAttachment("files/img03.jpg");
$mail->AddAddress("douglas@inmopy.com", "dembogurski@gmail.com", "bordonfederico@gmail.com");
$mail->IsHTML(true);

if(!$mail->Send()) {
  echo "Error: " . $mail->ErrorInfo;
} else {
  echo "Mensaje enviado correctamente";
}
?>
