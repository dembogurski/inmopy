

function configurar(){
    
}

function aprobar(nro){
    $.ajax({
        type: "POST",
        url: "pedidos/SolicitudesPendientesAutorizacion.class.php",
        data: {action: "aprobarSoliciutd",nro:nro,  suc: getSuc(), usuario: getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $(".foot_"+nro).html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            if (data.estado === "Ok") {
                $(".foot_"+nro).html("<div class='aprobada'>Autorizada</div>"); 
                enviarNotificacionTelegramPickers(nro);
            } else {
                $(".foot_"+nro).html("Error al aprobar pedido contacte con el administrador");   
            }                
        },
        error: function (e) {                 
            $(".foot_"+nro).html("Error al aprobar pedido contacte con el administrador");   
            errorMsg("Error al aprobar pedido :" + e, 10000);
        }
    });     
}   


function rechazar(nro){
    $.ajax({
        type: "POST",
        url: "pedidos/SolicitudesPendientesAutorizacion.class.php",
        data: {action: "rechazarSoliciutd",nro:nro, suc: getSuc(), usuario: getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $(".foot_"+nro).html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            if (data.estado === "Ok") {
                $(".foot_"+nro).html("<div class='rechazada' >Rechazada<br><label>La solicitud ha sido puesta en Abierta para que el Vendedor visualice, Edite o elimine el Pedido</label></div>"); 
            } else {
                $(".foot_"+nro).html("Error al rechazar pedido contacte con el administrador");   
            }                
        },
        error: function (e) {                 
            $(".foot_"+nro).html("Error al rechazar pedido: " + e);   
            errorMsg("Error al rechazar pedido :" + e, 10000);
        }
    });  
}

function enviarNotificacionTelegramPickers(nro){
    
    var usuario = $(".usuario_"+nro).html(); 
    var suc =  $(".dest_"+nro).attr("data-origen");
    var cod_cli = $(".cliente_"+nro).attr("data-cod_cli");
    
    var add_cli = "";
    if(cod_cli !== "C000018" ){
        var cliente   =$(".cliente_"+nro).html();
        add_cli = " para Cliente: "+cliente+" ";
    }
    
    var msg = "<b>Hay una nuevo Pedido "+add_cli+" </b> de <b>Suc.:</b> "+suc+" Usuario: <i><b>"+usuario+"</b></i>, <b>Pedido Nro:</b>  "+nro+".    Para acceder al sistema haga click <a href='http://192.168.2.222'>Aqui</a>  ";
    
    $.ajax({
        type: "POST",
        url: "utils/telegram/Telegram.class.php",
        data: {action: "enviarMensajePickers", msg: msg},
        async: true,
        dataType: "json",
        beforeSend: function () {
            
        },
        success: function (data) {   
            if (data.ok === true) {
                $(".foot_"+nro).append("Pickers notificados por Telegram"); 
            } else {
                console.log("data  "+data);
                $(".foot_"+nro).append("Error no se ha podido nofiticar a los pickers por Telegram, pero el pedido ha sido aprobado."); 
            }                
        },
        error: function (e) {                 
            $("#result").html("Error al enviar notificacion a Telegram:  " + e);   
            errorMsg("Error al enviar notificacion a Telegram:  " + e, 10000);
        }
    }); 
}

