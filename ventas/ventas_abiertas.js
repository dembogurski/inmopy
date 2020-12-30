
var moneda = "G$";

function configurar(){
     
    $(".venta_abierta td:not(:last-child)").click(function(){ 
        var factura = $(this).parent().attr("id").substring(5,20);
        cargarFactura(factura);
    }); 
    $(".estado_factura").mouseenter(function(){$(this).children().fadeIn()});
    $(".estado_factura").mouseleave(function(){$(this).children().fadeOut()});
    // Inicializa cursores para ventas abiertas
    inicializarCursores("clicable");
    $(".estado_abierta").hover(function(){ 
         $(this).children("img").fadeIn();         
    }); 
}
function cargarFactura(factura){  
    var usuario = getNick(); 
    var session = getCookie(usuario).sesion;    
    load("ventas/FacturaVenta.class.php",{usuario:usuario,session:session,factura:factura,suc:getSuc()}, function(){    
        showAreaCarga();
    });
}
function showAreaCarga(){ 
    var len = $('script[src*="ventas/FacturaVenta.js"]').length; 
    var visible = $("#area_carga").is(":visible");
    console.log("Controlando script...len "+len+"  visible: "+visible);
    if (len > 0 || !visible) {
         $("#area_carga").slideDown(function(){    
           setTimeout( "verificarMoneda()",500);  
         });
    }else{
        console.log("Esperando carga script...");
        setTimeout("showAreaCarga()",1000);        
    }
}
function eliminarFactura(factura){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "eliminarVenta",  factura: factura},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);     
                if(result == "true"){
                    genericLoad("ventas/VentasAbiertas.class.php");
                }else{
                   errorMsg("No se puede eliminar la Factura contiene Articulos!",10000); 
                }
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}
