<?php



/**
 * Description of Telegram
 *
 * @author Doglas
 */
class Telegram {
    
    
    function __construct() {
        $action = $_REQUEST['action'];
        if (function_exists($action)) {
            call_user_func($action);
        } else {
            $this->main();
        }
    }
    
    function main(){
         echo '{"ok":false,result:Debe proporcionar una funcion valida}';        
    }
}

/**
 * Para autorizacion de Pedidos etc  inmopy_bot   
 */
function enviarMensajeGerencia(){
    $msg = $_REQUEST['msg'];     
    $id = "-456736937";
    sendMessage($id,$msg);
}

function enviarMensajePickers(){
    $msg = $_REQUEST['msg'];    
    $id = "-404293405";
    sendMessage($id,$msg);
}

function enviarMensajeAuditoria(){
    $msg = $_REQUEST['msg'];     
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


new Telegram();
?>