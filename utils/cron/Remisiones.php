<?php


 
require_once("../../Y_DB_MySQL.class.php");

$db = new My();

$db->Query("SELECT n_nro,usuario,CONCAT(suc,'-->',suc_d) AS orig_dest ,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,LEFT(hora,5) AS hora   FROM nota_remision WHERE estado <> 'Cerrada' AND fecha < (CURRENT_DATE - INTERVAL 3 DAY) AND  DAYOFWEEK(CURRENT_DATE) <> 8");

if($db->NumRows() > 0 ){
    
    $msg = '<b>Buenos Dias!!!</b> Hay Remisiones Abiertas o En Proceso con mas de 78 horas desde su apertura.';
    $msg.="<pre>-----------------------</pre>";
    while($db->NextRecord()){
       $nro = $db->Get("n_nro");
       $usuario = $db->Get("usuario");
       $orig_dest = $db->Get("orig_dest");
       $fecha = $db->Get("fecha");
       $hora = $db->Get("hora"); 
       $msg.='<b> Nro:</b> '.$nro.'  <b>Usuario: </b> '.$usuario.' <b>Origen:</b> '.$orig_dest.' <b>Fecha: </b>'.$fecha.' '.$hora.'';
       $msg.="<pre>____________________</pre>";
    }
     
    $id = "-471515597";
 
    sendMessage($id,$msg);
}

function sendMessage($id,$msg){
    $token = "1247768881:AAEvupQN30EoR--4wVsnzOSrfBFycNp8srE";
    
    $urlMsg = "https://api.telegram.org/bot{$token}/sendMessage";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $urlMsg);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, "chat_id={$id}&parse_mode=HTML&text=$msg");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $server_output = curl_exec($ch);
    echo $server_output;
    curl_close($ch);  
}

?>