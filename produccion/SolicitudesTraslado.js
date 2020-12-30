
var ids = null;

var actualID = 0;

var nodoAnterior = "00";
var nodoActual = "00";

var pedidos = 0;
var pendientes = 0;
var tactil = false;

var sucurs = null;
var origens = null;



function configurar(){
    $(".fecha").datepicker({ dateFormat: 'dd-mm-yy' }); 
    sucurs = $("#sucurs").html();
    origens = $("#origen").html();
    $(".lote_rem").change(function() {
        var remp = $(this).val();
        guardarLoteRemplazo(remp);
    });
    if(getSuc() === "00"){
       getHorasCierrePedidos();
    }
}

 
function cambiarSucursales(){
   var estado = $("#estado").val();
   if(estado == 'Pendiente'){
       $("#origen").html(origens);
   }else{
      $("#origen").html(sucurs);
   }
}

function verSolicitudesMoviles(){
    var tipo_filtro = $("input[name='tipo_busqueda']:checked").val();
    genericLoad("produccion/SolicitudesTraslado.class.php?mobile=true&tipo_filtro="+tipo_filtro);
}

function verSolicitudes(mobile,tactil){
    
    var origen = $("#origen").val();
    var destino = getSuc();
    var usuario = getNick();
    var desde = validDate($("#desde").val()).fecha;
    var hasta = validDate($("#hasta").val()).fecha;
    var hora = $("#hora_cierre").val();
    var nivel = $("#nivel").val();
    
    var tipo = $("#tipo").val();
    var urge = $("#urge").val();
    var estado = $("#estado").val();
    var paper_size = $('input[name=paper_size]:checked').val();
    var nivel = $("#nivel").val();
    var tipo_filtro = $("input[name='tipo_busqueda']:checked").val();

    if(!mobile){
        var url = "produccion/ReporteSolicitudes.class.php?origen="+origen+"&destino="+destino+"&usuario="+usuario+"&desde="+desde+"&hasta="+hasta+"&hora="+hora+"&paper_size="+paper_size+"&tipo="+tipo+"&urge="+urge+"&estado="+estado+"&tipo_filtro="+tipo_filtro;
        if(tactil){
            url = "produccion/ReporteSolicitudesTactil.class.php?origen="+origen+"&destino="+destino+"&usuario="+usuario+"&desde="+desde+"&hasta="+hasta+"&hora="+hora+"&paper_size="+paper_size+"&tipo="+tipo+"&urge="+urge+"&estado="+estado+"&nivel="+nivel+"&tipo_filtro="+tipo_filtro;;
        }
        var title = "Solicitudes de Traslado";
        var params = "width=1024,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
        window.open(url,title,params);
    }else{
        //getPedidos(origen,destino,desde,hasta,hora,nivel,tipo,urge,estado)
    }   
    
}

function getPedidosFiltrados(){
    var desde = validDate( $("#desde").val()).fecha;      
    var hasta = validDate( $("#hasta").val()).fecha;
    var nivel =  $("#nivel").val(); 
    var destino =  getSuc();
    var origen = "%"; 
    if($("#fijar").is(":checked")){
        origen = $("#origen").val(); 
    }
    var hora = $("#hora_cierre").val();
    var tipo_busqueda = $("input[name='tipo_busqueda']:checked").val();
    var suc_selected = $("#origen").val();
    
    var urge = $("#urge").val();
    var mayorista = $("#tipo").val(); 
    
    $.ajax({
        type: "POST",
        url: "produccion/SolicitudesTraslado.class.php",
        data: {"action": "getPedidosFiltrados", desde: desde,hasta:hasta,hora:hora,nivel:nivel,origen:origen,destino:destino,tipo_busqueda:tipo_busqueda,urge:urge,mayorista:mayorista},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) { 
            $("#origen").html("");
            var set_ant = false;
            for (var i in data) { 
                var suc = data[i].suc;
                var nombre = data[i].nombre;                 
                var items = data[i].Items;
                var fecha = data[i].fecha;
                var fecha_corta = fecha.substring(0,5);
                var nom = "Item";
                if(items > 1){
                    nom = "Items"; 
                }
                if(suc == suc_selected){
                    set_ant = true;
                }
                $("#origen").append("<option value='"+suc+"'>"+suc+"  -  ["+fecha_corta+"]               "+items+"   "+nom+"  </option>");
            }  
            $("#msg").html(""); 
            if(!set_ant){  
                $("#origen").append("<option value='"+suc_selected+"'>"+suc_selected+"  -      0   Items     </option>"); 
                $("#msg").html("No hay pedidos para: "+nivel); 
                errorMsg("No hay pedidos para: "+nivel+"",7000); 
            }
            $("#origen").val(suc_selected);
        }
    });
}
 
function volver(){
    $("#nodos").slideUp();
    $("#filters").slideDown();
}

 
function cursor(id){
    $("#cursor").html('<img style="margin-left: 30px;cursor: pointer" src="img/loading_fast.gif">');
    if(id < 0){
        id = 0;
        $("#camino").html("Inicio.");
    }
    var infoCursor = actualID + 1;
    if(id > ids.length - 1 ){
        id = ids.length - 1;
        $("#camino").html("Fin.");
        $("#cursor").html(""+infoCursor +"/"+pedidos);    
        return;
    }
    actualID = id;
    var nodo = ids[id].nodo;    
    var codigo = ids[id].codigo;
    var lote = ids[id].lote;
    nodoAnterior = nodoActual;
    nodoActual = nodo;
    infoCursor = actualID + 1;
    
    if(ids.length > 0){         
        $("#porigen").html($("#origen").val());
        $("#nodo").html(ids[id].nodo);
        $("#ubic").html(ids[id].ubic);
        $("#plote").val(lote);
        $("#plote").attr("data-nro_pedido", ids[id].nro);
        $("#plote").attr("data-codigo", codigo);
        $("#pdescrip").html(ids[id].descrip);
        $("#pcant").val( Math.round( ids[id].cantidad ));
        $("#premp").val(ids[id].lote_rem);
        var obs = ids[id].obs;
        var user = ids[id].usuario;
        if(obs != ""){
            obs = "<span style='color:black'> Obs:</span>"+obs;
        }       
        var may = "Minorista";
        var pmayclass = "pminorista";
        if(ids[id].mayorista == "Si"){
            may = "Mayorista";
            pmayclass = "pmayorista";
        }
        $("#pmayorista").html(may);
        $("#pmayorista").attr("class",pmayclass);  
        
        var estado = ids[actualID].estado;
        if(estado == "Pendiente"){
            $("#remitir").removeAttr("disabled");             
            $("#remitir").val("Remitir");
        }else{
            $("#remitir").attr("disabled",true);
            $("#remitir").val("Procesado");                           
        }        
        
        var urg = "No Urge";
        var purge = "pnourge";
        if(ids[id].urge == "Si"){
            urg = "Urgente"
            purge = "purge";
        }
        $("#purge").html(urg);
        $("#purge").attr("class",purge);  
        $("#cursor").html(""+infoCursor+"/"+pedidos);    
        getImage(codigo,lote);
        if(nodoAnterior != nodoActual && nodo != ""){
          // getRuta(nodoAnterior,nodoActual);
        }
        if(nodo == ""){
            $("#camino").html("Sin Ubic");
        }
        $("#info").html("<span style='color:blue'>("+user+")</span>"+obs);
    }else{
       $("#camino").html("No hay Pedidos"); 
    }
}
function mostraRuta(){   
    getRuta(nodoAnterior,nodoActual);   
}

function siguiente(){
    cursor(actualID + 1);
}
function anterior(){
    cursor(actualID - 1);
}

function getHorasCierrePedidos(){
    var origen = $("#origen").val();
    $.ajax({
        type: "POST",
        url: "produccion/SolicitudesTraslado.class.php",
        data: {action: "getHorasCierrePedidos", suc: origen },
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#hora_cierre").empty(); 
        },
        success: function (data) {   
            if (data.length > 0 ) {
                for(var i in data){
                    var hora = data[i].hora;
                    var hora_corta = hora.substring(0,5);
                    $("#hora_cierre").append("<option value='"+hora+"'>"+hora_corta+"</option>"); 
                }
            } else {
                $("#hora_cierre").append("<option value='23:59:00'>23:59</option>");   
            }                
        },
        error: function (e) {                 
            $("#msg").html("Error al xxx cuenta:  " + e);   
            errorMsg("Error al xxx cuenta:  " + e, 10000);
        }
    }); 
}
/*
function getRuta(origen,destino){
    var ruta = $("#mostrar_ruta").is(":checked");
    if(origen != null && destino != null &&   ruta == true ){
        $.ajax({
            type: "POST",
            url: "produccion/SolicitudesTraslado.class.php",
            data: {"action": "getRutaMasCorta", origen:origen, destino: destino},
            async: true,
            dataType: "html",
            beforeSend: function () {
                $("#msg").html("Buscando ruta mas corta. <img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            complete: function (objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText); 
                    $("#camino").html("Ir de: "+origen+ "<b> &rarr;</b> "+destino+"<br>"+result); 
                }
            },
            error: function () {
                $("#camino").html("Error en la conexion"); 
            }
        });    
    } else{
       $("#camino").html("Ir de: "+origen+ "<b> &rarr;</b> "+destino+"");  
    }  
}

function getImage(codigo,lote){     
    $.ajax({
        type: "POST",
        url: "produccion/SolicitudesTraslado.class.php",
        data: {"action": "getImage", codigo:codigo, lote: lote,suc:getSuc()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px'>"); 
        },
        success: function (data) {   
            var imagen = data.image;
            var stock = data.stock;  
            var images_url = $("#images_url").val();
            if(imagen == "" || imagen == undefined || imagen == null){                    
                imagen = "0/0";
            } 
            $("#imagen").html("<img src='"+images_url+"/"+imagen+".thum.jpg' width='130' height='110' >");  
            $("#pstock").val(stock);
        }
    });
}
function remitir(){
    
    var destino = $("#origen").val();
    $.ajax({
        type: "POST",
        url: "produccion/SolicitudesTraslado.class.php",
        data: {"action": "getRemitosAbiertos", suc: getSuc(),suc_d: destino},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#remisiones").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);     
                $("#remisiones").html(result);
                $("#remisiones").slideDown();                   
                //$("#tabla_remisiones").width($("#nodos").width() - );
            }
        },
        error: function () {
            $("#remisiones").html("Ocurrio un error en la comunicacion con el Servidor...");
            $("#remisiones").slideDown();
        }
    }); 
}

function insertarAqui(nro){
    var codigo = $("#plote").attr("data-codigo");
    var nro_pedido = $("#plote").attr("data-nro_pedido");
    var lote = $("#plote").val();
    var remp = $("#premp").val();
    var cant =$("#pstock").val();
    
    if(cant > 0){
        
    if(remp != ""){
        lote = remp;
    }
    
    var lotes = new Array();
  
    var cod_lote = { 'nro_pedido': nro_pedido, 'codigo': codigo, 'lote': lote, 'cant': cant };

    lotes.push(cod_lote);
   
    lotes = JSON.stringify(lotes);
     
    var usuario = getNick();  
    $.ajax({
        type: "POST",
        url: "produccion/SolicitudesTraslado.class.php",
        data: { 'action': 'insertarLotesEnRemito', 'nro': nro, suc: getSuc(), 'lotes': lotes,usuario:usuario },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $(".btn_" + nro).append("<img class='loading' src='img/loading_fast.gif' width='22px' height='22px' >");
        },
        success: function(data) {
            if (data.error) {
                alert(data.error);
            } else {
                var t = 0;
                for (var i in data) {
                    var loteins = data[i];
                    if(loteins == lote){
                        ids[actualID].estado = "En Proceso";
                        minimizar();
                        $("#remitir").attr("disabled",true);
                        $("#plote").css("background","lightblue");                        
                        $("#pend").html(pendientes - 1);  
                    }else{
                       alert(data);
                    }
                    t++;
                }
                var cant = parseFloat($(".items_" + nro).html());
                var suma = cant + t;
                $(".items_" + nro).html(suma);
                $(".loading").remove();
            }
        }
    }); 
   }else{
       alert("Stock Insuficiente busque remplazo");
   }
}
function guardarLoteRemplazo(lote_rem) {

    $("#remitir").attr("disabled",true);

    var lote = $("#plote").val();   
    if (lote == lote_rem) {
        alert("Cuidado... Lote remplazo igual al lote...");
        $("#premp").val("");
        return;
    }
    var nro = $("#plote").attr("data-nro_pedido");
    var usuario = getNick();
    var suc = getSuc();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "agregarCodigoRemplazoSolicitud", "usuario": usuario, "nro": nro, "lote": lote, "lote_rem": lote_rem, "suc": suc },
        async: true,
        dataType: "html",
        beforeSend: function() {             
            $("#info").html("<img class='loading' src='img/loading_fast.gif' width='18px' height='18px' >");
        },
        complete: function(objeto, exito) {
            if (exito == "success") {
                var result = $.trim(objeto.responseText);     
                var first_part = result.substring(0,2);
                
                if (first_part == "Ok") { 
                    $("#info").html("");
                    $("#remitir").removeAttr("disabled");
                } else {
                    $("#info").html("<img class='error' src='img/important.png' width='18px' height='18px' >"+result);
                    alert(result);
                    $("#premp").val("");                    
                }
            }
        },
        error: function() {             
            $("#info").append("<img class='error' src='img/important.png' width='18px' height='18px' >");
            $("#premp").val("");
        }
    });
}
function minimizar() {
    $("#remisiones").empty();
    $("#remisiones").slideUp();    
}

function generarRemito(origen, destino) {
    var c = confirm("Confirma generar esta Remision?");
    if (c) {
         
        $.ajax({
            type: "POST",
            url: "produccion/SolicitudesTraslado.class.php",
            data: { "action": "generarRemito", usuario: getNick(), origen: origen, destino: destino },
            async: true,
            dataType: "html",
            beforeSend: function() {
                $("#remisiones").html("<img src='../img/loading_fast.gif' width='22px' height='22px' >");
            },
            complete: function(objeto, exito) {
                if (exito == "success") {
                    var nro = $.trim(objeto.responseText);
                    if (nro > 0) {
                        remitir();
                    } else {
                        alert(nro);
                    }
                }
            },
            error: function() {
                $("#remisiones").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        });
    }
}

*/