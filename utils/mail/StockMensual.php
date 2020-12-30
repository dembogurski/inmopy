<?PHP
ini_set('max_execution_time', 1800);
require_once("../../Y_DB_MySQL.class.php");

require_once("../../utils/PHPExcel/IOFactory.php");
require_once("phpmailer-gmail/class.phpmailer.php");    
require_once("phpmailer-gmail/class.smtp.php");

/**
 * Schedule Windows Server
 * El primero de cada mes
 * Action
 * Programa/Script
 * powershell
 * Argumento
 * -command &{Invoke-WebRequest -URI http://localhost/inmopy/utils/mail/StockMensual.php}
 */

$reporte = new PHPExcel();
$toExcelFile = array();
$link = new My();
$query = "SELECT s.suc,sec.descrip AS sector,a.descrip AS articulo, a.codigo,COUNT(s.lote) AS items,SUM(cantidad) AS stock,a.um,costo_prom AS costo_unit,SUM(a.costo_prom *  cantidad) AS costo_total FROM articulos a 
INNER JOIN stock s ON a.codigo = s.codigo INNER JOIN sectores sec ON sec.cod_sector = a.cod_sector
GROUP BY s.suc,a.codigo ORDER BY s.suc, a.descrip";

$filename = 'StockSuc_'. Date("d-m-Y") .'.xlsx';


$link->Query($query);
while($link->NextRecord()){
   array_push($toExcelFile,$link->Record);
}
$reporte->setActiveSheetIndex(0);

if(count($toExcelFile)>0){
   
   $reporte->getActiveSheet()->fromArray(array_keys(current($toExcelFile)), null, 'A1');
   $reporte->getActiveSheet()->fromArray($toExcelFile, null, 'A2');
   $writer = PHPExcel_IOFactory::createWriter($reporte, 'Excel2007');
   $writer->save("reporteStock/$filename");
   
   $mail = new PHPMailer();
   $mail->IsSMTP();
   $mail->SMTPAuth = true;
   $mail->SMTPSecure = "ssl";
   $mail->Host = "mail.inmopy.com";
   $mail->Port = 465;
   $mail->Username = "sistema@inmopy.com";
   $mail->Password = "rootdba";
   $mail->AddAttachment("reporteStock/$filename", $filename);
   $mail->From = "sistema@inmopy.com";
   $mail->FromName = "Sistema Marijoa";
   $mail->Subject = "Reporte de Stock por Sucursal generado PROBANDO Sistema Nuevo ".Date("d-m-Y");
   $mail->MsgHTML("Reporte de Stock por Sucursal generado PROBANDO Sistema Nuevo".Date("d-m-Y"));
   $mail->AltBody = "Reporte de Stock por Sucursal generado PROBANDO Sistema Nuevo".Date("d-m-Y");

   $mail->AddAddress("douglas@corporaciontextil.com.py", "douglas@corporaciontextil.com.py");
 
   

   $mail->IsHTML($isHTML);

   if (!$mail->Send()) {
      print "Error: " . $mail->ErrorInfo;
   } else {
      print "Mensaje enviado correctamente.../n <br>";
   }
    
}
?>