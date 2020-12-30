
var nodoAnterior = "00";
var nodoActual = "00";
var ping_time = 0; 
var check_flag = true;
var usuario;

var aux_lotes = null;

$(function() {
    $(".lote_rem").change(function() {
        guardarLoteRemplazo($(this));
    });
    setAnchorTitle();
    
    usuario = window.opener.getNick();

    var isMouseDown = false;
    $("table#solicitudes tr.fila td:not(.td_remplazo):not(.lote):not(.td_foto)")    
        .mousedown(function() {
            isMouseDown = true;
            var top_rem = $(this).parent();
            var en_remito = top_rem.hasClass("en_remito");
            var id = top_rem.attr("id");
            if (!en_remito) {
                $(this).parent().toggleClass("marcada");
            } else {
                var info = top_rem.attr("data-info");
                if (confirm("Articulo " + id + "\n" + info + "\n" + "Marcar como enviado este pedido?")) {
                    var pedido_nro = $("tr#" + id + " .nro_pedido").text();
                    $.post("../Ajax.class.php", { "action": "actualizarEstadoPedido", "ped_nro": pedido_nro, "lote": id ,usuario:usuario},
                        function(data) {
                            if (data.msg === 'Ok') {
                                alert("Operacion exitosa");
                                $("#" + id).slideUp('slow', function() { $(this).remove() });
                            } else {
                                alert("Ocurrio un error al procesar la pericion \n" + data.msg);
                            }
                        }, 'json');
                }
            }
            return false; // prevent text selection
        })
        .mouseover(function() {
            if (isMouseDown) {
                var top_rem = $(this).parent();
                var en_remito = top_rem.hasClass("en_remito");
                if (!en_remito) {
                    $(this).parent().toggleClass("marcada");
                }
            }
        }).mouseup(function() {
            editar();
        })
        .bind("selectstart", function() {
            return false; // prevent text selection in IE
        });
       
    $("[data-verificar='si'].fila").each(function() {
        var codigo = $(this).attr("data-codigo");
        var lote = $(this).attr("data-lote");
        var remp = $(this).find(".lote_rem").val();
        var nro = $(this).children().first().text();
        controlarLotesEnRemitos(nro,codigo, lote, remp);
    });  
    $(document).mouseup(function() {
        isMouseDown = false;
    });

    $(window).scroll(function() {
        $('#message_frame').animate({ top: $(window).scrollTop() + "px" }, { queue: false, duration: 350 });
    });
    $("#message_frame").draggable();
     
    //Cant Codigos
    $("#cantidad").html($('.fila').filter(function() { return $(this).css('display') !== 'none'; }).length);
    //getImagenLotes();
    clasificarFiltro();
    //getHorasCierrePedidos();
    setInterval("calcularLatencia()",30000);
});
 
function recargar(){
    window.location.reload();
}
function showKeypads(){
    $(".keypad").fadeToggle();
}

function controlarLotesEnRemitos(nro,codigo, lote, remplazo) {
    var origen = $("#destino").val(); // Origen de los remitos, un lote de otra sucursal igual a este puede estar en otra remision 
    //var destino = $("#origen").val(); 
    var estado_ant = $(".msg_" + lote).html();
    $.ajax({
        type: "POST",
        url: "../Ajax.class.php",
        data: { "action": "controlarLotesEnRemitos", origen: origen, codigo: codigo, lote: lote, remplazo: remplazo,usuario:usuario },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $(".msg_" + lote).html("<img class='loading' src='../img/loading_fast.gif' width='18px' height='18px' >");
        },
        success: function(data) {
            var estado = data.estado;
            var info = data.info;
            
            //console.log("Estado "+lote+ "= "+estado+" info: "+info);
            
            $("#" + lote).removeClass("error");
            switch(estado){
                case 'Libre':
                    $(".msg_" + lote).html(estado_ant);                  
                    break;
                case 'En Reserva':
                    $(".msg_"+nro+"_"+ lote).text("En Orden de Fraccionamiento");          
                    $(".msg_"+nro+"_"+ lote).addClass("error");
                    break;
                case 'En Remision':      
                    $(".msg_"+nro+"_"+ lote).html(estado_ant + " <img class='img_en_remito' src='../img/truck.png' width='26px' height='18px' >");
                    $("#" + lote).addClass("en_remito");
                    $("#" + lote).attr("data-info", info);
                    $("#" + lote).removeClass("marcada");
                    $(".msg_"+nro+"_"+ lote).addClass("cargando");
                    $("#check_" + lote).prop("checked", "");
                    break;
                case 'En Factura':  console.log("En Factura");    
                    $(".msg_"+nro+"_" + lote).html(estado_ant + " <img class='img_en_remito' src='../img/bill.png' width='26px' height='18px' >");
                    $("#" + lote).addClass("en_remito");
                    $("#" + lote).attr("data-info", info);
                    $("#" + lote).removeClass("marcada");
                    $(".msg_"+nro+"_" + lote).addClass("cargando");
                    $("#check_" + lote).prop("checked", "");
                    break;    
            }
           
        }
    });
}

function editar() {
    var arr = new Array();
    $(".checked").prop("checked", "");
    
    var suc = $("#destino").val();
    
    var origen = $("#origen").val();
    
    var cont = 0;
    $(".marcada").each(function() {
        var lote = $(this).attr("data-lote");
        $("#check_" + lote).prop("checked", "checked");
        $("#check_" + lote).addClass("checked");
        var cod_cli = $(this).attr("data-cod_cli");  
        var cliente = $(this).attr("data-cliente");  
        arr.push(cliente);
        
        cont++;
        if(cont == 1){
            //var en_remito = $(this).hasClass("en_remito");
            var nodo = $(this).attr("data-nodo");
            nodoAnterior = nodoActual;
            nodoActual = nodo;
            if(nodoAnterior != nodoActual && nodo != ""){
               getRuta(nodoAnterior,nodoActual);
            }
        }  
        
    });
    var unique = arr.filter( onlyUnique ); 
   
    if (cont > 0) {
        $("#message_frame").fadeIn();    
        if(unique.length > 1){
            $("#facturar").fadeOut();
        }else{ // Si hay un Solo cliente Seleccionado se Puede Facturar
            console.log("unique[0]: "+unique[0]);
            /*if(unique[0] !== "CORPORACION TEXTIL S.A" && (suc == origen && suc == "00") ){ // No dejar Facturar si es para sucursales y si no es de 00 a 00
               $("#facturar").fadeIn();
            } */
            $("#facturar").fadeIn();
        }  
        if(origen == suc ){
            $("#remitir").fadeOut();
            //$("#message").html("No se puede remitir de "+origen +" al mismo destino "+suc );
        }
        
    } else {
        $("#message_frame").fadeOut();
    }
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function procesarLotes() {
    var origen = $("#destino").val();
    var destino = $("#origen").val();
    var tipo_busqueda = $("#tipo_busqueda").val();
    $("#message_header").hide();

    $.ajax({
        type: "POST",
        url: "../Ajax.class.php",
        data: { "action": "getRemitosAbiertos", suc: origen, suc_d: destino ,tipo:tipo_busqueda,usuario:usuario},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#message").html("<img src='../img/loading_fast.gif' width='18px' height='18px' >");
        },
        complete: function(objeto, exito) {
            if (exito == "success") {
                var result = $.trim(objeto.responseText);
                $("#message").html(result);
                ajustarMedidas();
            }
        },
        error: function() {
            $("#message").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });  
}
function facturar(){
    var moneda = $("#moneda").val(); 
    if(moneda === ""){
        alert("Seleccione un cliente");
        return;
    }
    var cod_cli = 0;  
    var cliente = "";   
    var origen = $("#origen").val();
    var vendedor = "";
    $(".marcada").each(function() {        
        cod_cli = $(this).attr("data-cod_cli");  
        cliente = $(this).attr("data-cliente"); 
        vendedor = $(this).children().next().html();        
    });
    if(cod_cli != '0'){
        $.ajax({
            type: "POST",
            url: "ReporteSolicitudesTactil.class.php",
            data: { "action": "getFacturasAbiertasDeCliente", suc: origen, cod_cli:cod_cli,cliente:cliente ,vendedor:vendedor,usuario:usuario},
            async: true,
            dataType: "html",
            beforeSend: function() {
                $("#message").html("<img src='../img/loading_fast.gif' width='18px' height='18px' >");
            },
            complete: function(objeto, exito) {
                if (exito == "success") {
                    var result = $.trim(objeto.responseText);
                    $("#message").html(result);
                    ajustarMedidas();
                }
            },
            error: function() {
                $("#message").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        }); 
    }
}
 
function generarFactura(cod_cli,suc,usuario){
    var moneda = $("#moneda").val(); 
    if(moneda === ""){
        alert("Seleccione un cliente");
        return;
    }
    
    var notas =  prompt('(Opcional) Ingrese una Observacion:');
    if(notas === undefined ){
        notas = "";
    }
    var nro_pedido = $("#pedido").val(); 
    
    notas ="Pedido Nro: "+nro_pedido+" Suc: "+suc+" "+notas;
    
    var destino = $("#destino").val();
    
    
    $.ajax({
        type: "POST",
        url: "../ventas/NuevaVenta.class.php",
        data: {"action": "crearFactura",cod_cli:cod_cli,suc:destino,"usuario": usuario,notas:notas,moneda:moneda,notas:notas},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#message").html("<img src='../img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result =$.trim(objeto.responseText);   
                if(isNaN(parseInt(result))){
                    alert("Error: "+result);
                }else{
                    facturar();
                }
            }
        },
        error: function () {
            $("#message").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 

}
function getRuta(origen,destino){
    var ruta = $("#mostrar_ruta").is(":checked");
    if(origen != null && destino != null  ){
        $.ajax({
            type: "POST",
            url: "SolicitudesTraslado.class.php",
            data: {"action": "getRutaMasCorta", origen:origen, destino: destino,usuario:usuario},
            async: true,
            dataType: "html",
            timeout: 12000,
            beforeSend: function () {
                $("#msg").html("Buscando ruta mas corta. <img src='../img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            complete: function (objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText); 
                    $("#camino").html("Ir de: "+origen+ "<b> &rarr;</b> "+destino+"<br>"+result); 
                }
            },
            error: function(request, status, err) {
                if (status == "timeout") {
                    // timeout -> reload the page and try again
                    console.log("Error timeout..."+request +" "+status+" "+ err);
                    showMessage("Error tiempo de espera agotado para la comunicacion con el Servidor",10);
                } else { 
                    showMessage("Error en la  comunicacion con el Servidor: " +request +" "+status+" "+ err,20);
                }
            }
            
        });    
    } else{
       $("#camino").html("Ir de: "+origen+ "<b> &rarr;</b> "+destino+"");  
    }  
}

function getLotesMarcados(){
     
    var lotes = new Array();

    $(".marcada").each(function() {
        var en_remito = $(this).hasClass("en_remito");
        var lote = $(this).attr("data-lote");
        var remplazo = $(this).find(".lote_rem").val();
        var rem = "";
        var is_lote_rem = false;
        var lote_pedido = lote;
        if (remplazo.length > 0) {
            lote = remplazo;
            rem = "_rem";
            is_lote_rem = true; 
        }
        if (en_remito) {
            $(this).removeClass("marcada");
            $("#check_" + lote).prop("checked", "");
        } else {
            var codigo = $(this).attr("data-codigo");
            var nro_pedido = $(this).children(".nro_pedido").html();            
            var cant = $(this).find(".stock"+rem).html(); // Del Lote o del Remplazo
             
            
            var precio_venta = $(this).attr("data-precio_venta");
            var gramaje = $(this).attr("data-gramaje");
            var ancho = $(this).attr("data-ancho");
            var descrip = $(this).attr("data-descrip");
            var um = $(this).attr("data-um");
            var tara = $(this).attr("data-tara");
            var cod_lote = { 'nro_pedido': nro_pedido, 'codigo': codigo, 'lote': lote,is_lote_rem:is_lote_rem,'descrip':descrip, 'cant': cant,'precio_venta':precio_venta,'gramaje':gramaje,'um':um,'ancho':ancho,tara:tara,lote_pedido:lote_pedido};

            lotes.push(cod_lote);
            $(".msg_" + lote).html("En Proceso");
        }
    });  
    return lotes;
}

function insertarAqui(nro) {
    var lotes = getLotesMarcados();
    aux_lotes = lotes;
    lotes = JSON.stringify(lotes);
    //console.log(lotes);
    var destino = $("#destino").val();
    var usuario = $("#operario").val();
    $.ajax({
        type: "POST",
        url: "ReporteSolicitudesTactil.class.php",
        data: { 'action': 'insertarLotesEnRemito', 'nro': nro, suc: destino, 'lotes': lotes ,usuario:usuario},
        async: true,
        timeout: 12000,
        dataType: "json",
        beforeSend: function() {
            $(".btn_" + nro).append("<img class='loading' src='../img/loading_fast.gif' width='22px' height='22px' >");
        },
        success: function(data) {
            if (data.error) {
                alert(data.error);
            } else {
                var t = 0;
                for (var i in data) {
                    var lote = data[i];
                    //Busco en la Lista de lotes Auxiliar para ver si fue enviado un lote original o de remplazo
                    aux_lotes.forEach(function(l){
                        if(l.lote == lote){  
                            if(l.is_lote_rem == true){     
                                lote = +l.lote_pedido;   
                            }
                        }       
                    });
                    
                    var nro_ped = $(".lote_"+lote).attr("data-nro");
                    $(".msg_"+nro_ped+"_" + lote).html("En Proceso <img class='img_en_remito' src='../img/truck.png' width='26px' height='18px' >");
                    $(".msg_"+nro_ped+"_" + lote).parent().addClass("en_remito");
                    $(".msg_"+nro_ped+"_" + lote).parent().removeClass("marcada");
                    $(".msg_"+nro_ped+"_" + lote).addClass("cargando");
                    $("#" + lote).attr("data-info", "En Remito Nro: "+nro+" destino: "+destino);
                    t++;
                }
                var cant = parseFloat($(".items_" + nro).html());
                var suma = cant + t;
                $(".items_" + nro).html(suma);
                $(".loading").remove();
            }
        },
        error: function(request, status, err) {
            if (status == "timeout") {
                // timeout -> reload the page and try again
                console.log("Error timeout..."+request +" "+status+" "+ err);
                showMessage("Error tiempo de espera agotado para la comunicacion con el Servidor",10);
            } else { 
                alert("error: " +request +" "+status+" "+ err);
            }
        }
    });
}

var cantItems = 0;
var insertados = 0;


function insertarEnFactura(factura){
    var lotes = getLotesMarcados();
    aux_lotes = lotes;
    var destino = $("#destino").val(); 
    
    for(var i = 0;i < lotes.length;i++){
        var nro_pedido = lotes[i].nro_pedido;
        var codigo = lotes[i].codigo;
        var lote = lotes[i].lote;
        var descrip = lotes[i].descrip;
        var um = lotes[i].um;
        var precio_venta = lotes[i].precio_venta;
        var cantidad = lotes[i].cant;
        var gramaje = lotes[i].gramaje;
        var ancho = lotes[i].ancho;
        var tara = lotes[i].tara;
        var categoria = 7; // Ricardo me dijo que todos son los vendedores externos son para categoria 7
        var subtotal = precio_venta * cantidad;
        var cod_falla = '';
        var cm_falla = 0;
        var fp = "true";
        var um_prod = um;
        var tipo_doc = "C.I.";
        cantItems++;
        
        var operario = $("#operario").val();         
        agregarDetalleFactura(operario,destino,factura,codigo,lote,um,descrip,precio_venta,cantidad,subtotal,categoria,cod_falla,cm_falla,gramaje,ancho,tara,fp,um_prod,tipo_doc,nro_pedido,lote,codigo);
    }
    
}

function agregarDetalleFactura(operario,destino,factura, codigo,lote,um,descrip,precio_venta,cantidad,subtotal,categoria,cod_falla,cm_falla,gramaje,ancho,tara,fp,um_prod,tipo_doc,nro_pedido,lote,codigo){
    $.ajax({
        type: "POST",
        url: "../Ajax.class.php",
        data: {"action": "agregarDetalleFactura","usuario":operario,"suc":destino,"factura":factura, "codigo": codigo,"lote":lote,"um":um,"descrip":descrip,"precio_venta":precio_venta,"cantidad":cantidad,"subtotal":subtotal,"cat":categoria,"cod_falla":cod_falla,"cm_falla":cm_falla,"gramaje":gramaje,"ancho":ancho,tara:tara,fp:fp,um_prod:um_prod,tipo_doc:tipo_doc},
        async: true,
        timeout: 12000,
        dataType: "json",
        beforeSend: function() {
            $(".btn_" + factura).append("<img class='loading' src='../img/loading_fast.gif' width='22px' height='22px' >");
        },
        success: function(data) {
            if (data.error) {
                alert(data.error);
            } else {
                
                if(data.Mensaje == "Ok"){   
                    $("#" + lote).attr("data-info", "En Factura Nro: "+factura+" para: "+destino); 
                    cambiarEstadoPedido(nro_pedido,lote,codigo);
                
                    var cant = parseFloat($(".items_" + factura).html());
                    cant++;
                    $(".items_" + factura).html(cant);
                    $(".loading").remove();
                    $(".btn_" + factura).prop("disabled",true);
                    insertados++;
                    if(cantItems == insertados){
                        facturar();
                    }
                }else{
                    $(".loading").remove();
                    alert(data.Mensaje);
                }
                
            }
        },
        error: function(request, status, err) {
            if (status == "timeout") {
                // timeout -> reload the page and try again
                console.log("Error timeout..."+request +" "+status+" "+ err);
                showMessage("Error tiempo de espera agotado para la comunicacion con el Servidor",10);
            } else { 
                alert("error: " +request +" "+status+" "+ err);
            }
            $(".loading").remove();
        }
    });   
    function cambiarEstadoPedido(nro_pedido,lote,codigo){
            //Busco en la Lista de lotes Auxiliar para ver si fue enviado un lote original o de remplazo
            aux_lotes.forEach(function(l){
                if(l.lote == lote){  
                    if(l.is_lote_rem == true){     
                        lote = +l.lote_pedido;   
                    }
                }       
            });
            $.ajax({
                type: "POST",
                url: "ReporteSolicitudesTactil.class.php",
                data: {"action": "cambiarEstadoPedido", "nro_pedido": nro_pedido, "lote": lote,"codigo":codigo,usuario:usuario},
                async: true,
                dataType: "html",
                beforeSend: function () {
                    $(".msg_" + lote).html("<img src='../img/loading_fast.gif' width='16px' height='16px' >"); 
                },
                complete: function (objeto, exito) {
                    if (exito == "success") {                          
                        var result = $.trim(objeto.responseText);  
                        if(result == "Ok"){
                            $(".msg_" +nro_pedido+"_"+ lote).html("En Proceso <img class='img_en_remito' src='../img/truck.png' width='26px' height='18px' >");
                            $(".msg_" +nro_pedido+"_"+ lote).parent().addClass("en_remito");
                            $(".msg_" +nro_pedido+"_"+ lote).parent().removeClass("marcada");
                            $(".msg_" +nro_pedido+"_"+ lote).addClass("cargando");    
                        }else{
                            $(".msg_" +nro_pedido+""+ lote)("Error al cambiar estado...");
                        }
                    }
                },
                error: function () {
                    $(".msg_" + lote)("Error al cambiar estado...");
                }
            }); 
   }
}

function imprimir() {
    $("#message_frame").fadeOut(1);

    setTimeout("self.print()", 200);
}

function ajustarMedidas() {
    $("#message_frame").width("auto");
    $("#message_frame").height("auto");
}

function minimizar() {
    $("#message").empty();
    $("#message_header").show();
    ajustarMedidas();
}

function generarRemito(origen, destino) {
    var c = confirm("Confirma generar esta Remision?");
    if (c) {
        var operario = $("#operario").val();
        var obs = $("#rem_obs").val();
        $.ajax({
            type: "POST",
            url: "../Ajax.class.php",
            data: { "action": "generarRemito", usuario: operario, origen: origen, destino: destino,obs:obs },
            async: true,
            dataType: "html",
            beforeSend: function() {
                $("#message").html("<img src='../img/loading_fast.gif' width='22px' height='22px' >");
            },
            complete: function(objeto, exito) {
                if (exito == "success") {
                    var nro = $.trim(objeto.responseText);
                    if (nro > 0) {
                        procesarLotes();
                    } else {
                        alert(nro);
                    }
                }
            },
            error: function() {
                $("#message").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        });
    }
}


var current_remp_id = null;

function setRemplazo(){
    guardarLoteRemplazo("#"+current_remp_id);
}
function tecladoNumerico(id){
    current_remp_id = id;    
    showNumpad(id,setRemplazo);
    
    var pedido = id.split("_")[1]; 
    var lote = id.split("_")[2]; 
    var stock_ped = parseFloat($(".stock_ped_"+pedido+"_"+lote).text());
    var disp_ped = parseFloat($(".disp_ped_"+pedido+"_"+lote).text());   
    if(stock_ped != disp_ped){  
        $("#"+id).parent().parent().addClass("marcada"); 
        $("#n_keypad").append( $("#generador_orden_frac"));  
        var obs =  $(".obs_"+pedido+"_"+lote).text() ;   
        $("#cant_frac").val(disp_ped);
        $("#obs_frac").val(obs);
        $("#lote_ref").val(lote); 
        $("#stock_frac").val("");  
        console.log(obs);
        if(obs.toLowerCase().indexOf("tablita") > 0){
            $("#pres_frac").val("Pieza");
        }
        if(obs.toLowerCase().indexOf("rollo") > 0){
            $("#pres_frac").val("Rollo");
        }
        
        var kpp = $("#n_keypad").position();
        var kpw = $("#n_keypad").width();
        $("#generador_orden_frac").fadeIn();
        $("#generador_orden_frac").offset({top:kpp.top+2,left:kpp.left + kpw + 6});
        $("#generador_orden_frac").draggable();
        getOrdenProcesamientoLoteRef(lote);
    }else{
        $("#generador_orden_frac").fadeOut();
    }
}
 
 
function guardarLoteRemplazo(lote_obj) {

    var lote = $(lote_obj).parent().prev().html();
    
    var lote_rem = $.trim($(lote_obj).val());
    if (lote === lote_rem) {
        alert("Cuidado... Lote remplazo igual al lote...");
        $(lote_obj).val("");
        return;
    }
    var nro = $(lote_obj).parent().prev().attr("data-nro");
    var usuario = $("#operario").val();
    var suc = $("#destino").val();
         
       
    $.ajax({
        type: "POST",
        url: "../Ajax.class.php",
        data: { "action": "agregarCodigoRemplazoSolicitud", "usuario": usuario, "nro": nro, "lote": lote, "lote_rem": lote_rem, "suc": suc },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $(".error").remove();
            $(".msg_"+nro+"_"+ lote).append("<img class='loading' src='../img/loading_fast.gif' width='18px' height='18px' >");
        },
        success: function (data) {    
            var estado = data.estado;
            if (estado == "Ok") {
                 var stockRemp = data.stockRemp;
                 var remp_ant = $("#remp_"+nro+"_"+lote).val();
                 $(".lote_"+lote).removeClass("lote_"+remp_ant);
                 $("#remp_"+nro+"_"+lote).val(lote_rem);
                 $("#"+lote).find(".stock_rem").html(stockRemp);
                 $(".lote_"+lote).addClass("lote_"+lote_rem);
                 if(lote_rem === ""){
                     $("#"+lote).find(".stock_rem").html();
                     $("#"+lote).find(".stock").removeClass("tachado");
                 }else{
                     $("#"+lote).find(".stock").addClass("tachado");
                 }
                 $(".msg_" +nro+"_"+ lote).find(".loading").remove();
            }else{
                $(".msg_" +nro+"_"+ lote).find(".loading").remove();
                $(".msg_" +nro+"_"+ lote).html("Pendiente<img class='error' src='../img/important.png' width='18px' height='18px' >"); 
                $(".msg_" +nro+"_"+ lote).attr("title",estado);
                $(lote_obj).val("");
                setAnchorTitle();
            }
        },
        error: function(e) {
            $(".msg_" +nro+"_"+ lote).find(".loading").remove();
            $(".msg_" +nro+"_"+ lote).append("<img class='error' src='../img/important.png' width='18px' height='18px' >");
            $(lote_obj).val("");
        }
    });
}

function setAnchorTitle() {
    $('td[title!=""]').each(function() {
        var a = $(this);
            a.hover(
            function() {
                showAnchorTitle(a, a.data('title'));
            },
            function() {
                hideAnchorTitle();
            }
        ).data('title', a.attr('title')).removeAttr('title');
    });
}

function showAnchorTitle(element, text) {   
    if (text != undefined) {
        var offset = element.offset();
        $('#anchorTitle').css({
            'top': (offset.top + element.outerHeight()) + 'px',
            'left': offset.left + 15 + 'px'
        }).html(text).show();
    }
}

function hideAnchorTitle() {
    $('#anchorTitle').hide();
}

function totalizar(){ //console.log("totalizar");
   var visibles = $('.fila').filter(function() { return $(this).css('display') !== 'none'; }).length;
   $("#cantidad").html(visibles); 
   
   var total_stock = 0;
   $('.fila').filter(function() {
       return $(this).css('display') !== 'none'; 
   }).find(".stock").each(function(){
       total_stock += parseFloat($(this).text());
   });
   $("#total_stock").html(total_stock.toFixed(2));
   
   var total_pedido = 0;
   $('.fila').filter(function() {
       return $(this).css('display') !== 'none'; 
   }).find(".cant").each(function(){
       total_pedido += parseFloat($(this).text());
   });
   $("#total_pedido").html(total_pedido.toFixed(2));
   //console.log(total_stock);
}

// Filtro numero de pedidos opciones
function showOption(target) {  
    var t = target.attr('data-target');    
    if ($("#" + t).css("display") === 'none') {
        $("#" + t).show();
    } else {
        $("#" + t).hide();
    }
}

function findButtonAndClick(clase){ 
    showOption($("."+clase));  
}

// Filtro de Ubicación

function fitrarUbic(Obj) {
    $("tr.fila").show();
    var criterio = Obj.text();
    var filtro = '';
    switch (criterio) {
        case 'Hombre':
            filtro = "fila>3 || fila==''";
            break;
        case 'Maquina':
            filtro = "fila<4 || fila==''";
            break;
        case 'Vacios':
            filtro = "fila!=''";
            break;

    }
    if (filtro != '') {
        $("span[class^=ubic_]").each(function(Obj) {
            var estante = $(this).attr("data-estante");
            var fila = $(this).attr("data-fila");
            var columna = $(this).attr("data-columna");
            var lote = $(this).attr("data-target");
            if (eval(filtro)) {
                $("#check_"+ lote).prop("checked",false);
                $(".lote_"+ lote).removeClass("marcada");
                $("#" + lote).hide();
            }
            totalizar();
        });
    }
    $("#ubic_filtro").hide();
}
// Filtros pedidos.
function filtrar(target) {
    var split = target.text().split("-");
    var pedido = $.trim(split[0]);    
    var cliente = split[1];
    $("#pedido").val(pedido);
    $("#moneda").val( $(".pedido_"+pedido).attr("data-moneda") );
    
    $("#info_pedido").html(cliente);
    if (pedido === '*') {
        $($(".nro_pedido").parent()).show();
    } else {
        $($(".nro_pedido").parent().not(".pedido_"+pedido)).hide(function() { 
            var lote = $(this).attr("id");  
            $("#check_"+ lote).prop("checked",false);
            $(".lote_"+ lote).removeClass("marcada");
            //$(".pedido_" + pedido).show(); 
        });
    }
    $("#nro_filtro").hide(function() {
        totalizar();
    });
}



function clasificarFiltro(){
    var arr = new Array();        
    
    $(".nro_pedido").each(function(){
       var ped = $(this).html();
       var cliente = $(this).parent().attr("data-cliente");
       var li = "<li style='text-align:left' onclick='filtrar($(this))'>"+ped +" - "+ cliente +" </li>";
       arr[ped] = li;        
    });
    var todos = "<li style='text-align:left' onclick='filtrar($(this))'>* - Todos </li>";
    arr.push(todos);
    for(var j = 0; j < arr.length;j++){
       $("#nro_filtro").append(arr[j]);  
    }
    totalizar();
}

// Lista de Estados
function mostrarOcultarEstados() {
    if ($("ul#estados").css("display") === 'none') {
        $("ul#estados").show();
    } else {
        $("ul#estados").hide();
    }
}

// Cambiar Estados
function cambiarEstado(Obj) {
    var estado = Obj.text();
    var targets = {};
    var razon = '';
    var ok = false;

    if( estado == 'Suspendido' ){
        razon = prompt("Motivo: ");
        if(razon != null && razon.trim().length > 0 && razon != undefined){
            razon = '; Usuario('+usuario+'): '+razon;
            ok = true;
        }
    }else{
        ok = true;
    }
    
    if(ok){
        $(".marcada").each(function() {
            var en_remito = $(this).hasClass("en_remito");
            var lote = $(this).attr("data-lote");
            var pedido = $(this).children("td.nro_pedido").text();
            targets[pedido] = lote;
        });
                
        $.post("../Ajax.class.php", { "action": "cambiarEstadoNotaPedido", "estado": estado,"razon":razon,usuario:usuario, "targets": JSON.stringify(targets) }, function(data) {
             
            $(".marcada").remove();
        }, 'json');

        $("ul#estados").hide();
    }
}

function cargarImagenLote(lote){  
    
    var img = $("#"+lote).attr("data-img");
    
    $("#image_container").html("");
    var images_url = $("#images_url").val();
    
    var cab = '<div style="width: 100%;text-align: right;background: white;">\n\
        <img src="../img/substract.png" style="margin-top:-4px"> <input id="zoom_range" onchange="zoomImage()" type="range" name="points"  min="60" max="1000"><img src="../img/add.png" style="margin-top:-4px;">\n\
        <img src="../img/close.png" style="margin-top:-18px;margin-left:100px" onclick=javascript:$("#image_container").fadeOut()>\n\
    </div>';
    
    $("#image_container").fadeIn(); 
          
        var contw = $("#image_container").width();

        var width = $(window).width() ; 
        var top = $(".img_"+lote).offset().top;

        var doc_height = $("#solicitudes").height();
        var container_height = 400; //$("#image_container").height();
        var top_cont = parseInt(top + 400)


        console.log("top "+top+"  doc_height "+doc_height +"  "+top_cont);


        if(top_cont > doc_height){ console.log(">>");
            top = parseInt(top - container_height);   
            if(top < 0){
                top = $(".img_"+lote).offset().top;
            }
        }
      console.log("top >>"+top);
        var center = (width / 2) - (contw / 2);

        $("#image_container").offset({left:center,top:top});
        var path = images_url+"/"+img+".jpg";

        var img = '<img src="'+ path +'" id="img_zoom" onclick=javascript:$("#image_container").fadeOut() width="500" >';
        $("#image_container").html( cab +" "+ img);
        $("#image_container").draggable();
     
}

function zoomImage(){
    var w = $("#zoom_range").val();    
    $("#image_container").width(w);
    $("#img_zoom").width(w);    
}
 
function showMessage(msg,time){
   var h = $(document).height();    
   $("#msg").fadeIn();
   $("#msg").html(msg);    
   $("#msg").offset({top:h-40,left:0});     
   setTimeout("hideMsg()",time*1000);
}
function hideMsg(){
    $("#msg").fadeOut();
}
 

var  calcularLatencia = function(show){
    if(check_flag){
    $.ajax({
        type: "POST",
        url: "../pedidos/SolicitudTrasladoMobile.class.php",
        timeout:40000, //40 seconds timeout
        data: {"action": "ping"},
        async: true,
        dataType: "html",
        beforeSend: function () {
            ping_time = new Date().getTime();
             
            showMessage("Ping",3);
            check_flag = false;
            setTimeout( function(){ check_flag = true; },20000);// Minimo 20 segundos
        },
        
        complete: function (objeto, exito) {
            if (exito === "success") {                          
                var result = $.trim(objeto.responseText);  // Not used
                var pong_time = new Date().getTime();
                var diff = (pong_time - ping_time ) / 1000; // In seconds
                
                if(diff < 5){
                    $("#conexion").css("background","green");
                }else if(diff > 5 && diff < 11){
                    $("#conexion").css("background","orange");
                }else{
                    $("#conexion").css("background","red");
                }
                showMessage("Tiempo de conexion: "+diff+" seg",6);
            }
             
        },
        error: function (jqXHR, textStatus) {
            if(textStatus === 'timeout'){
                $("#conexion").css("background","red");
            }
            $("#msg").html("Error de conexion");
        }
    }); 
   }
};

function buscarDatosLote(){
    var lote_frac = $("#lote_frac").val();
    if( lote_frac != ""){
    var suc =opener.getSuc();
    $.ajax({
        type: "POST",
        url: "../Ajax.class.php",
        data: {"action":"buscarDatosDeCodigo","lote":lote_frac,"categoria":1,"suc":suc,moneda:"G$"}, 
        async:true,
        dataType: "json",
        beforeSend: function(){          
           $("#descrip_frac").html("<img src='../img/loadingt.gif' >");    
           $("#generar_orden").prop("disabled",true);
           $("#msg_frac").removeClass("error");
        },
        success: function(data){ 
            var existe = data.existe;
             
            if( existe === "true" ){
                var Status = data.estado_venta; // Bloqueado,Normal,Oferta,Arribos,FP
                var stock = parseFloat(data.stock); 
                $("#codigo_frac").val(data.codigo); 
                var codigo = data.codigo;
                var color = data.color;                
                var descrip = data.descrip;
                if(color !== '' && color != undefined){
                    descrip+="-"+color;
                }
                $("#descrip_frac").html(descrip);
                $("#stock_frac").val(   stock   );
                  
                art_inv =   JSON.parse(data.art_inv);
                mnj_x_lotes =   data.mnj_x_lotes ;
                
                if(Status != 'FP' && Status != 'Bloqueado'){
                   if( art_inv ){  
                       //Verifico que sea al mennos el mismo articulo y el mismo color
                       var codigo_marcado = $(".marcada").attr("data-codigo");
                       if(codigo_marcado == codigo){
                           var obs_marcada = $(".marcada").find(".descrip").text().substring(0,$(".marcada").find(".descrip").text().indexOf("Obs:")-1) ;
                           if(obs_marcada.indexOf(color) > -1 ){
                               buscarStockComprometido(lote_frac);
                           }else{
                               $("#msg_frac").html("Colores direfentes: Procesando: "+obs_marcada+" intendo fraccionar: "+descrip+"");  
                               $("#msg_frac").addClass("error");
                           }
                           
                       }else{
                         var proc = $(".marcada").find(".nombre_art").text();  
                         $("#msg_frac").html("Articulos diferentes: Procesando: "+proc+" intendo fraccionar: "+descrip);  
                         $("#msg_frac").addClass("error");
                       }
                   }
                }else{
                    $("#generar_orden").attr("disabled",true);
                    $("#descrip_frac").html("Estado de la Pieza: "+Status);
                }    
                //var imagen = data.img;   // De ser necesario agregar imagen buscar codigo en FacturaVenta.js
            }else{
                $("codigo_frac").val("");
                $("stock_frac").val("");
                $("#generar_orden").prop("disabled",true);
                $("#descrip_frac").html("Codigo no existe o no se encuentra en "+suc);
            }
        },
        error: function(e){ 
           $("#descrip_frac").addClass("error");
           $("#descrip_frac").html("Error en la comunicacion con el servidor:  "+e);
        }
    });
    }
}
function getOrdenProcesamientoLoteRef(lote_ref){
        $.ajax({
        type: "POST",
        url: "ReporteSolicitudesTactil.class.php",
        data: {"action": "getOrdenProcesamientoLoteRef", lote_ref:lote_ref },
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_frac").html("<img src='../img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#stock_comprometido").html("");
            $("#stock_compr").html("");
        },
        success: function (data) {   
            var comprometido = 0;
            var st_comp = "<table class='stock_comprometido' border='1'>";
            st_comp+="";
            if(data.length > 0){
                var st_comp = "<table class='tabla_stock_comprometido' border='1' style='border-collapse:collapse;width:100%'>";
                st_comp+="<tr><th colspan='7' style='background:lightskyblue;'>Ordendes de Procesamiento de Ref.: "+lote_ref+"</th><th style='text-align:center;background:white'>X</th></tr>";
                st_comp+="<tr class='titulo' style='font-size:10px'><th>Lote</th> <th>Usuario</th><th>Fecha</th><th>Suc</th><th>Cant.</th><th>Pres.</th><th>Obs</th><th>Estado</th><tr>";
                //id_orden,codigo,lote,color,cantidad,presentacion,suc,obs
                for (var i in data) {
                    var tipodoc = 'Orden Proc.' 
                    var nro = data[i].id_orden;
                    var lote = data[i].lote;
                    var usuario_ = data[i].usuario;
                    var fecha = data[i].fecha;
                    var suc = data[i].suc;
                    var estado = data[i].estado;
                    var presentacion = data[i].presentacion;
                    var cantidad = data[i].cantidad;
                    comprometido += parseFloat(cantidad);
                    var obs = data[i].obs;
                    st_comp+="<tr style='background:white'><td>"+lote+"</td> <td class='itemc'>"+usuario_+"</td><td class='itemc'>"+fecha+"</td><td class='itemc'>"+suc+"</td><td class='num'>"+cantidad+"</td><td class='itemc'>"+presentacion+"</td><td class='item'>"+obs+"</td><td class='itemc'>"+estado+"</td></tr>";
                }   
                  
                 
                $("#stock_compr").html("<img src='img/warning_red_16.png' onclick='verStockComprometido()' title='Alguien mas tiene cargada esta pieza en un documento!'>");
                $("#stock_comprometido").html(st_comp);
                $(".tabla_stock_comprometido").click(function(){
                    verStockComprometido();
                });
                $("#stock_comprometido").fadeIn();
            }else{
                $("#generar_orden").attr("disabled",false);
            }
            $("#msg_frac").html(""); 
        }
    });    
}

function buscarStockComprometido(lote){
    var suc =opener.getSuc();
    $.ajax({
        type: "POST",
        url: "../Ajax.class.php",
        data: {"action": "buscarStockComprometido", lote: lote,suc:suc,"incluir_reservas":"Si","incluir_pedidos":"Si"},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_frac").html("<img src='../img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#stock_comprometido").html("");
            $("#stock_compr").html("");
        },
        success: function (data) {   
            var comprometido = 0;
            var st_comp = "<table class='stock_comprometido' border='1'>";
            st_comp+="";
            if(data.length > 0){
                var st_comp = "<table class='tabla_stock_comprometido' border='1' style='border-collapse:collapse;width:100%'>";
                st_comp+="<tr><th colspan='6' style='background:lightskyblue;'>Stock Comprometido</th><th style='text-align:center;background:white'>X</th></tr>";
                st_comp+="<tr class='titulo' style='font-size:10px'><th>Doc</th><th>Nro</th><th>Usuario</th><th>Fecha</th><th>Suc</th><th>Estado</th><th>Cantidad</th><tr>";
                for (var i in data) {
                    var tipodoc = data[i].TipoDocumento;
                    var nro = data[i].Nro;
                    var usuario_ = data[i].usuario;
                    var fecha = data[i].fecha;
                    var suc = data[i].suc;
                    var estado = data[i].estado;
                    var cantidad = data[i].cantidad;
                    comprometido += parseFloat(cantidad);
                    st_comp+="<tr style='background:white'><td>"+tipodoc+"</td><td>"+nro+"</td><td class='itemc'>"+usuario_+"</td><td class='itemc'>"+fecha+"</td><td class='itemc'>"+suc+"</td><td class='itemc'>"+estado+"</td><td class='num'>"+cantidad+"</td></tr>";
                }   
                var stock_actual =   parseFloat($("#stock_frac").val());
                console.log("stock_actual "+stock_actual+ " " + comprometido);
                
                var stock_limpio = stock_actual  - comprometido ;
                $("#stock_frac").val(  parseFloat( stock_limpio  )    );
                
                if(stock_limpio > 0){
                    var pedido =   parseFloat($("#cant_frac").val());
                    if(isNaN(pedido) ){
                        alert("Seleciona una fila..");
                    }else{    
                        if(stock_actual > pedido){
                            $("#generar_orden").prop("disabled",false);
                        }else{
                            alert("Stock Limpio: "+stock_actual+" insuficiente para pedido: "+pedido);
                            $("#generar_orden").prop("disabled",true);
                        } 
                    }
                }else{
                    $("#generar_orden").prop("disabled",true);
                }
                 
                $("#stock_compr").html("<img src='img/warning_red_16.png' onclick='verStockComprometido()' title='Alguien mas tiene cargada esta pieza en un documento!'>");
                $("#stock_comprometido").html(st_comp);
                $(".tabla_stock_comprometido").click(function(){
                    verStockComprometido();
                });
                $("#stock_comprometido").fadeIn();
            }else{
                $("#generar_orden").attr("disabled",false);
            }
            $("#msg_frac").html(""); 
        }
    });
}
function verStockComprometido(){
    $("#stock_comprometido").toggle();
}
 
function generarOrdenProcesamiento(){
    
    var lote = $("#lote_frac").val();
    var codigo = $("#codigo_frac").val();
    $("#generar_orden").prop("disabled",true);
    
    if(lote != "" && codigo != ""){
        var lote_ref = $("#lote_ref").val(); 
        var presentacion = $("#pres_frac").val(); 
        var cant_frac = $("#cant_frac").val(); 
        var obs = $("#obs_frac").val();
        var destino = $("#origen").val();
        $.ajax({
            type: "POST",
            url: "ReporteSolicitudesTactil.class.php",
            data: {action: "generarOrdenProcesamiento",codigo:codigo,lote:lote,lote_ref:lote_ref, presentacion:presentacion,cant_frac:cant_frac,obs:obs, suc: destino, usuario: opener.getNick()},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg_frac").html("<img src='../img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                if (data.estado === "Ok") {
                    $("#msg_frac").html("Ok"); 
                    $("#generador_orden_frac input:not(#generar_orden)").val("");
                    buscarStockComprometido(data.lote);
                    setTimeout("verStockComprometido()",1000);
                } else {
                    $("#msg_frac").html("Error al Generar Orden Fraccionamiento");   
                    $("#generar_orden").prop("disabled",false);
                }                
            },
            error: function (e) {                 
                $("#msg_frac").html("Error al Generar Orden Fraccionamiento  " + e);   
                errorMsg("Error al Generar Orden Fraccionamiento " + e, 10000);
                $("#generar_orden").prop("disabled",false);
            }
        }); 
    }
} 