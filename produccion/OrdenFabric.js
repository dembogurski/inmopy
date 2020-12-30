var ping_time = 0;

var timeout = null;
var check_flag = true;

var data_next_time_flag = true;
 
var loadDesings = false;
 
var designs = ['ABORIGEN', 'BULGAROS'];
 
var decimales = 0;
var cant_articulos = 0;
var fila_art = 0;

var nro_orden = 0;

var PORCENTAJE_PERMITIDO = 4;       

var colores = ["#c0392b","#fbc531","#ffd32a","#3498db","#20bf6b","#6f1abd"];

 

function configurar(){
      
    $(".numeros").change(function(){
        var decimals = 0;
         
        var n = parseFloat($(this).val() ).format(decimals, 3, '.', ',') ;
        $(this).val( n  );
        if($(this).val() =="" || $(this).val() =="NaN" ){
           $(this).val( 0);
        }  
     });
     setHotKeyArticulo();
      
    $(".requerido").change(function(){
        controlarDatos();
    });
    $(".requerido").blur(function(){
        controlarDatos();
    });
    $("#lote").change(function(){
        buscarDatos();
    });
   
     
    $(".agregar").each(function(){
        var estado = $(this).attr("data-estado");
        if(estado === "Ok"){
           $(this).fadeIn();   
        }else{
           $(this).fadeOut(); 
        }         
    });
    getPorcentajeAsingnaciones();
}

function getPorcentajeAsingnaciones(){
    $(".porc_asign").each(function(){
        var codigo_fab = $(this).attr("data-codigo");
        var nro_emis = $(this).attr("data-nro_emis");
        var id_det = $(this).attr("data-id_det");
        var cantidad_fab = $(this).attr("data-cant");
        if(nro_emis !== ""){
           getPorcentajeAsingnacionXLinea(codigo_fab,nro_emis,id_det,cantidad_fab);
        }
    });   
}
 
function getPorcentajeAsingnacionXLinea(codigo_fab,nro_emis,id_det,cantidad_fab){
    $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {action: "getPorcentajeAsingnacionXLinea", suc: getSuc(), usuario: getNick(),codigo_fab:codigo_fab,nro_emis:nro_emis,id_det:id_det,cantidad_fab:cantidad_fab},
        async: true,
        dataType: "json",
        beforeSend: function () {
           // $("#porc_asign_"+nro_emis+"_"+id_det+"").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {  
            if(data.length > 0){
                var porc_ref = 0;
                var tabla = "<table class='tabla_porc_asign' border='0'>";  
                for (var i in data) { // No mas de una por Cliente por Usuario
                   var MateriaPrima = data[i].MateriaPrima;   
                   var PorcAsignado = data[i].PorcAsignado;  
                   var ref = data[i].ref;   
                   if(ref === "true"){
                       porc_ref+= PorcAsignado;
                   }
                   var ColorCalc = Math.floor((PorcAsignado / 20)  );
                   if(ColorCalc > 5){ ColorCalc= 5;}
                   var fondo = colores[ColorCalc];
                   tabla+="<tr><td class='cod_mat_pri' title='"+PorcAsignado+"%' onclick='getPorcentajeAsingnaciones()' >"+MateriaPrima+"</td><td style='padding:2px 0 2px 0;height:20px' title='"+PorcAsignado+"%'><div style='border:solid black 1px;witdh:100%;height:40%;margin-right:1px'><div style='width:"+PorcAsignado+"%;background-color:"+fondo+";height:100%' >&nbsp;</div><div></td></tr>"; 
                } 
                tabla+"</table>">
                $("#porc_asign_"+nro_emis+"_"+id_det+"").html(tabla);
               if(porc_ref > 60){
                  $("#poner_en_proc_"+nro_emis).removeAttr("disabled");
               }else{
                  $("#poner_en_proc_"+nro_emis).prop("disabled",true);
               }
            }
        },
        error: function (e) {                 
            $("#msg").html("Error al xxx cuenta:  " + e);   
            errorMsg("Error al xxx cuenta:  " + e, 10000);
        }
    }); 
}
 
function controlarDatos(){
    var c = $("#cantidad").val().replace(".","");
    var l = $("#codigo").val().length;
    var d = $("#design").val().length; 
    if(isNaN(c) || l == 0 || d == 0 || c == 0){
        $("#insertar").prop("disabled",true);
    }else{
       $("#insertar").removeAttr("disabled"); 
    }
}
function fijarCliente(){
    var v = $("#fijar_cliente").val();
    var ruc  = $("#ruc_cliente").val();
    if(ruc == "XXXX"){
        //alert("El pedido debe ser para un cliente, no esta permitido generar Ordenes a clientes anonimos");
        errorMsg("El pedido debe ser para un cliente, no esta permitido generar Ordenes a clientes anonimos",10000);
        return;
    }else{
        if(v == "Fijar" && ruc.length > 0){
            $("#fijar_cliente").val("Cambiar");
            $(".clidata").attr("disabled",true);         
            listarOrdenes(); 
        }else{
            $("#fijar_cliente").val("Fijar");
            $(".clidata").removeAttr("disabled");
            $(".clidata").val("");   
            $("#enviar_nota").fadeOut();
            $("#generar").fadeOut();

        }
        var cod_cli = $("#codigo_cliente").val(); 
        $(document).click( function(){ calcularLatencia();  });
    }
    /*  
    $(".solicitud_abierta_cab").each(function(){
        var codigo_cliente = $(this).find(".cod_cli").html();
        if(cod_cli != codigo_cliente){
            $(this).fadeOut();
        } 
     }); */   
}
function seleccionarCliente(obj){
    var cliente = $(obj).find(".cliente").html(); 
    var ruc = $(obj).find(".ruc").html();  
    var codigo = $(obj).find(".codigo").html();
    var cat = $(obj).find(".cat").html();  
 
    $("#ruc_cliente").val(ruc);
    $("#nombre_cliente").val(cliente);
    $("#codigo_cliente").val(codigo);
    $("#categoria").val(cat);
       
    $("#ui_clientes" ).fadeOut("fast");
    $("#tipo").focus();
    $("#msg").html(""); 
    
    $("#fijar_cliente").removeAttr("disabled");
    
    $("#codigo").focus();
}
function mostrar(){
    $("#fijar_cliente").val("Fijar");
    $("#fijar_cliente").removeAttr("disabled");
}

function insertar(){
    $("#insertar").prop("disabled",true);   
    var codigo = $("#codigo").val();    
    var descrip = $("#descrip").val();
    var cantidad = $("#cantidad").val().replace(".","");
    var design = $("#design").val();    
    var largo = $("#largo").val().replace(",",".");;    
    
    $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {"action": "insertarEnOrdenFabric", "nro_orden": nro_orden, "codigo": codigo,"descrip":descrip,cantidad:cantidad,design:design,largo:largo},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);        
                listarOrdenes();
                limpiarAreaCarga();
                $("#insertar").attr("disabled",false);// Ahora permitiremos mas de una
            }else{
                alert("Ocurrio un error en la comunicacion con el Servidor...")
            }
            
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });     
}

function ocultar(){}

function listarOrdenes(){
    $("#solicitudes_abiertas").fadeIn();
    var cod_cli = $("#codigo_cliente").val();
    $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {"action": "listarOrdenes", cod_cli: cod_cli,"usuario": getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            $(".orden").remove();
            $("#generar").fadeOut();
            if(data.length > 0){
                var tabla = "<table class='orden' border='1' >";
                tabla+='<tr  class="titulo" ><th>N&deg;</th><th>Cliente</th><th>Fecha</th><th>  <input type="button" id="enviar_nota" value="Enviar Orden" onclick="enviarOrden()" style="display:none;font-size:11px"> </th></tr>';
                for (var i in data) { // No mas de una por Cliente por Usuario
                    nro_orden = data[i].nro_orden;
                    var cod_cli = data[i].cod_cli;   
                    var cliente = data[i].cliente;
                    var usuario = data[i].usuario;
                    var fecha = data[i].fecha;
                    var estado = data[i].estado;
                    tabla+='<tr class="fila"><td  class="itemc">'+nro_orden+'</td><td>'+cliente+'</td><td  class="itemc">'+fecha+'</td><td class="itemc"><img id="eliminar" style="cursor:pointer" src="img/trash_mini.png" title="Eliminar esta Orden" onclick="borrarOrden('+nro_orden+')" ></td></tr>';
                } 
                tabla+='<tr><td  colspan="4">\n\
                <table border="1" class="detalle" >\n\
                    <tr><th>N&deg;</th><th>Codigo</th><th>Descripcion</th><th>Dise&ntilde;o</th><th>Cantidad</th></tr>\n\
                 </table>\n\
                </td></tr>';
                tabla+='</table>';
                $("#area_carga").slideDown();
                getDetalleOrden(nro_orden);
            }else{
                $("#area_carga").slideUp();
                $("#generar").fadeIn();
            }
            
            $("#solicitudes_abiertas").append(tabla);
            $("#msg").html(""); 
            
        }
    });
}
function getDetalleOrden(nro_orden){
    $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {"action": "getDetalleOrden", nro_orden: nro_orden},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            var i = 0;
            for (var i in data) { 
                var id_det = data[i].id_det;
                var codigo = data[i].codigo;         
                var descrip = data[i].descrip;         
                var cantidad = data[i].cantidad;         
                var design = data[i].design;
                
                var path = $("#images_url").val();
                var img = data[i].design;
                var img_path = path+"/"+img+".thum.jpg";
                if(img === ""){
                    img = "0/0";
                    img_path = "img/0.jpg";
                }
                
                $(".detalle").append("<tr><td class='itemc'>"+id_det+"</td><td class='item'>"+codigo+"</td><td class='item'>"+descrip+"</td><td class='itemc'><img src="+img_path+" width='40'></td><td class='num'>"+cantidad+"</td></tr>");
                i++;
            }  
            if(i > 0){
                $("#enviar_nota").fadeIn();
            }else{
                $("#enviar_nota").fadeOut();
            }
            $("#msg").html(""); 
        }
    });    
}

function generarOrden(){
    $("#generar").fadeOut();
    var cod_cli = $("#codigo_cliente").val();
    var cliente = $("#nombre_cliente").val();
    $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {"action": "generarOrden", "usuario": getNick(), "suc": getSuc(),cod_cli:cod_cli,cliente:cliente},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);   
                if(result == "Ok"){
                    $("#msg").html("");
                    $(".requerido").removeAttr("disabled"); 
                    listarOrdenes();                     
                }else{
                    alert(result);
                    $("#msg").html(result);
                }
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}
function cerrar(){
    $("#ui_clientes").fadeOut();
}
  
var  calcularLatencia = function(){
    if(check_flag){
    $.ajax({
        type: "POST",
        url: "pedidos/SolicitudTrasladoMobile.class.php",
        timeout:40000, //40 seconds timeout
        data: {"action": "ping"},
        async: true,
        dataType: "html",
        beforeSend: function () {
            ping_time = new Date().getTime();
             
            infoMsg("Ping",3000);
            check_flag = false;
            setTimeout( function(){ check_flag = true; },20000);// Minimo 20 segundos
        },
        
        complete: function (objeto, exito) {
            if (exito == "success") {                          
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
                infoMsg("Tiempo de conexion: "+diff+" seg",6000);
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
}

function limpiarAreaCarga(){
    $(".requerido, .ui-autocomplete-input").val("");  
    $(".requerido").val(""); 
    $("#img_design").html("");
}

function buscarArticulo(){
    var articulo = $("#codigo").val();
    var cat = 1;
    
    fila_art = 0;
    if(articulo.length > 0){
    $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {"action": "buscarArticulos", "articulo": articulo,"cat":cat},
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function(data) { 
            
            if(data.length > 0){
                limpiarListaArticulos();
                var k = 0;
                for(var i in data){        
                    k++;
                    var codigo =  (data[i].codigo).toString().toUpperCase();
                    var Sector = data[i].sector;
                    var descrip = data[i].descrip; 
                    var Precio =  parseFloat(  (data[i].precio) ).format(0, 3, '.', ',');
                    
                    var Largo = parseFloat(data[i].produc_largo).format(2, 3, '.', ',');
                    var Ancho = parseFloat(data[i].produc_ancho).format(2, 3, '.', ',');          
                    var Alto = parseFloat(data[i].produc_alto).format(2, 3, '.', ',');
                    
                    var medidas = Largo+" x "+Ancho+" x "+Alto;
                    
                    
                    var Especificaciones = data[i].especificaciones;
                    var um = data[i].um;         
                                                                         
                    $("#lista_articulos") .append("<tr class='tr_art_data fila_art_"+i+"' data-sector="+Sector+" data-largo="+Largo+" data-precio="+Precio+" data-um="+um+"><td class='item clicable_art'><span class='codigo' >"+codigo+"</span></td>\n\
                    </td><td class='item clicable_art'><span class='NombreComercial'>"+descrip+"</span></td> <td class='itemc clicable_art'>"+medidas+"</td>\n\
                    <td class='item clicable_art'>"+Especificaciones+"</td> <td class='num clicable_art'>"+Precio+"</td> </tr>");
                    cant_articulos = k;
                }  
                inicializarCursores("clicable_art"); 
                $("#ui_articulos").fadeIn();
                $(".tr_art_data").click(function(){                            
                      seleccionarArticulo(this); 
                });
                $("#msg").html(""); 
            }else{
                $("#msg").html("Sin resultados..."); 
            }
        }
    });
    }
} 
function limpiarListaArticulos(){    
    $(".tr_art_data").each(function () {   
       $(this).remove();
    });    
} 
 
function setDefaultDataNextFlag(){
    data_next_time_flag = true;
}
function setHotKeyArticulo(){
     
    $("#codigo").keydown(function(e) {
        
        var tecla = e.keyCode;  //console.log(tecla);  
        if (tecla == 38) {
            (fila_art == 0) ? fila_art = cant_articulos-1 : fila_art--;
            selectRowArt(fila_art);
        }
        if (tecla == 40) {
            (fila_art == cant_articulos-1) ? fila_art = 0 : fila_art++;
            selectRowArt(fila_art);
        }
        if (tecla != 38 && tecla != 40 && tecla != 13) {
            buscarArticulo();
            escribiendo = true;
            
        }
        if (tecla == 13) {
           if(!escribiendo){ 
             seleccionarArticulo(".fila_art_"+fila_art); 
           }else{
               setTimeout("escribiendo = false;",1000);
           }
        }
        if (tecla == 116) { // F5
            e.preventDefault(); 
        } 
          
    });
}
function selectRowArt(row) {
    $(".art_selected").removeClass("art_selected");
    $(".fila_art_" + row).addClass("art_selected");
    $(".cursor").remove();
    $($(".fila_art_" + row + " td").get(2)).append("<img class='cursor' src='img/l_arrow.png' width='18px' height='10px'>");
    escribiendo = false;   
} 


function seleccionarArticulo(obj){
    var codigo = $(obj).find(".codigo").html();
    var sector = $(obj).attr("data-sector"); 
    var nombre_com = $(obj).find(".NombreComercial").html();  
    var precio = $(obj).attr("data-precio");
    var um = $(obj).attr("data-um");
    var largo = $(obj).attr("data-largo"); 
    $("#codigo").val(codigo);
    $("#descrip").val(nombre_com);
    $("#um").val(um);
    $("#largo").val(largo);
    $("#ui_articulos").fadeOut(); 
    $("#design").val("");
    $("#img_design").html("<img src='img/0.jpg' height='60'>");
    $("#cantidad").focus();
    $("#cantidad").select();
}

function getDesigns(){
    var codigo = $("#codigo").val();
    var cantidad = $("#cantidad").val();
    if(cantidad > 0){
        $.ajax({
            type: "POST",
            url: "produccion/OrdenFabric.class.php",
            data: {action: "getImagesLotesXMateriaPrima", suc: "00" , usuario: getNick(),codigo:codigo,cantidad:cantidad},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                 $(".design_div").remove();
                 if(data.length > 0){
                    for (var i in data) {

                           var piezas = data[i].piezas;
                           var metros = parseFloat(data[i].metros).format(2, 3, '.', ',');
                           var prod_ter = data[i].prod_ter;
                           var path = $("#images_url").val();
                           var img = data[i].design;
                           var img_path = path+"/"+img+".thum.jpg";
                           if(img === ""){
                               img = "0/0";
                               img_path = "img/0.jpg";
                           }

                           var ul = '<div data-img="' + img + '" data-img_path="' + img_path + '" class="design_div" onclick="selectDesign(this)" >\n\
                               <div><label class="img_label">Piezas:</label>&nbsp;'+piezas+' <br>\n\
                               <label class="img_label">Metros:</label>&nbsp; '+metros+'   <br>\n\
                               <label class="img_label">Fabricable:</label> &nbsp;'+prod_ter+' </div>\n\
                               <img  class="imagen_design" src="'+img_path+'" />   \n\
                             </div>'; 

                           $("#designs_container").append(ul);
                           //console.log(key+"  "+name+"  "+thums);

                    }
                  
              }else{
                  $("#designs_container").append("<big class='design_div'>No se encontro materia prima disponible para esta<br> cantidad intente con menos cantidad o otro articulo...</big>");
              }
              showDesigns();
            },
            error: function (e) {                 
                $("#msg").html("Error al obtener Estampas:  " + e);   
                errorMsg("Error al obtener Estampas  " + e, 10000);
            }
    });    
    }else{
       errorMsg("Ingrese una cantidad minima a fabricar",6000);
    }
}

function selectDesign(obj){
    var path = $(obj).attr("data-img_path"); 
    var imagen = $(obj).attr("data-img"); 
    $("#design").val(imagen);
    $("#img_design").html("<img src='"+path+"' height='60'>");
    hideDesigns();
    controlarDatos();
}

var entMerc_designTarget;

function selectDesignsOLD(ObjTarget) {
    entMerc_designTarget = ObjTarget.data("target");
    if (!loadDesings) {
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "getDesignsImages" },
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
            },
            success: function(data) {
                //console.log(data);
                for (var i in data) {
                    var key = data[i].key;
                    var name = data[i].name;
                    var thums = data[i].thumnails;
                    var ul = '<ul id="' + key + '" data-name="' + name + '" >';
                    for (var i = 0; i < thums.length; ++i) {
                        var img = thums[i];
                        var class_ = "";
                        if (i == 0) {
                            class_ = "class='lastitem'";
                        }
                        ul += '<li ' + class_ + '><img title="' + name + '" src="img/PATTERNS/' + key + '/' + img + '" height="46"  ></li>';
                    }

                    ul += '</ul>';
                    $("#designs_container").append(ul);
                    //console.log(key+"  "+name+"  "+thums);

                }
                $("#designs_container li").click(function() {
                    var name = $(this).parent().attr("data-name");
                    $("#" + entMerc_designTarget).val(name);
                    $("#designs_container").fadeOut();
                });
                loadDesings = true;
                $("#msg").html("");
            }
        });
    }
    
}
function showDesigns(){
    var window_width = $(document).width() / 2;
    var desing_width = $("#designs_container").width() / 2;
    var posx = (window_width - desing_width);
    posx = posx + "px";
    $("#designs_container").css({ left: posx, top: 80 });
    $("#designs_container").fadeIn();  
    $("#designs_container").draggable();
    
    $("#design").val("");
    $("#img_design").html("<img src='img/0.jpg' height='60'>");
}

function hideDesigns() {
    $("#designs_container").fadeOut();
}

function borrarOrden(nro_orden){
    var c = confirm("Esta seguro de que desea eliminar la Orden de Fabricacion? Este proceso no es reversible");
    if(c){
        $.ajax({
            type: "POST",
            url: "produccion/OrdenFabric.class.php",
            data: {"action": "eliminarOrden", nro_orden: nro_orden},
            async: true,
            dataType: "html",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            complete: function (objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText);   
                    listarOrdenes();
                }
            },
            error: function () {
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        }); 
    }
}

function enviarOrden(){
    var obs = $("#obs").val();
    $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {"action": "cambiarEstadoOrden", nro_orden: nro_orden,"estado":"Pendiente",obs:obs},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $(".requerido").prop("disabled",true);
            $("input").prop("disabled",true);
            $("#eliminar").remove();
            $("#insertar").remove();            
            $("#enviar_nota").fadeOut();  
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText); 
                if(result == "Ok"){                  
                   alert("El pedido de Fabricacion ha sido enviado con exito");
                   
                   showMenu();
                }else{
                  $("#enviar_nota").fadeIn();                     
                   alert("Error: "+result);
                }
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}
/*
function sincronizarOrdenFabric(nro_orden){
  
   var data = {     
        "action": "generarOrdenFabricion",
        "NroOrden": nro_orden
    };
    $.post(bc_url, data, function(data) {
        if (data.status == "ok") {
            $("#msg").html("Ok"); 
            alert("La Orden de Fabricacion ha sido enviada con exito");
            //genericLoad("produccion/OrdenFabric.class.php");
            $("#area_carga").fadeOut();
            $("#solicitudes_abiertas").fadeOut();
            $(".requerido").attr("disabled",true); 
            $("#generar").fadeIn();             
        } else {
           alert("Error en la comunicacion con el servidor, intente enviar nuevamente."); 
        }
    }, "jsonp").fail(function() {
         alert("Error de comunicacion con el servidor "+data.status);
    });    
}
function sincronizarEmisionProduccion(nro_emision,nro_orden){
   var server_ip = location.host;
   var url = "http://"+server_ip+":8081" // Desmarcar despues
   //var url = "http://localhost:8081";
   var data = {
        "action": "generarEmisionProduccion",
        "NroEmision": nro_emision
    };
    $.post(url, data, function(data) {
        if (data.status == "ok") {
            $("#msg").html("Ok"); 
            alert("La Emision para Produccion ha sido enviada con exito");
            genericLoad("produccion/OrdenFabric.class.php?action=listarPendientes");
        } else {
           alert("Error en la comunicacion con el servidor, intente enviar nuevamente."); 
           ponerPendientePorErrorSinc(nro_emision,nro_orden);
        }
    }, "jsonp").fail(function() {
         alert("Error de comunicacion "+data);
         ponerPendientePorErrorSinc(nro_emision,nro_orden);
    });    
} 
function ponerPendientePorErrorSinc(nro_emision,nro_orden){
$.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {"action": "ponerEnPendiente", nro_emision: nro_emision,nro_orden:nro_orden,usuario:getNick()},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);    
                if(result == "Ok"){
                    $("#msg").html(""); 
                    
                }else{
                    $("#msg").html(result); 
                }
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });    
}*/
function misOrdenes(){
    genericLoad("produccion/OrdenFabric.class.php?action=misOrdenes");
}
function agregarLotes(codigo,nro_orden,id_det_orden,nro_emis){
    
    $(".msg").html("");
      
        //var req = parseFloat($(".req_"+nro_orden).html().replace(".","").replace(",","."));
        var medida = parseFloat($(".medida_"+nro_orden+"_"+id_det_orden).html().replace(".","").replace(",","."));
        var cant_pedida = parseFloat($(".cant_pedida_"+nro_orden+"_"+id_det_orden).html().replace(".","").replace(",","."));
        
        var descrip_fab = $(".codigo_ped_"+nro_orden).next().html();
        
        var imagen_fab = $(".cant_pedida_"+nro_orden+"_"+id_det_orden).prev().find(".img_linea").attr("src");
        var img_only =  $(".cant_pedida_"+nro_orden+"_"+id_det_orden).prev().find(".img_linea").attr("data-img");
        
        //$("#requerido").val(req);
        $("#medida").val(medida);
        
        
        $("#a_codigo").html(" "+codigo+" - "+descrip_fab );
        $(".img_ref").attr("src",imagen_fab);
        $(".img_ref").attr("data-img",img_only);
        $("#codigo_art").val(codigo);
        $("#nro_orden").val(nro_orden);
        $("#nro_orden_id_det").val(id_det_orden);
        
        $("#nro_emision").val(nro_emis);    
        $("#cant_pedida").val(cant_pedida);    
        $("#pedido").val(cant_pedida);    
        
        
        $("#asign_popup").slideDown();
        //$("#asign_popup").draggable();
        
        
        var w = $(window).width();
        var asw = $("#asign_popup").width();
        var esii = (w / 2) - (asw / 2);
        $("#asign_popup").offset({top:100,left: esii });
        $("#asign_popup").width(900);
        $("#lote").focus();    
        buscarArticulosPermitidos();
        listarLotesAsignados();
         
        $("#btn_"+nro_emis+"_"+id_det_orden+"").parent().parent().addClass("fila_marcada");
     
}
function getUbicaciones(img, img_id,codigo_fab){
    $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {action: "getUbicacionXImagen", suc: getSuc(),codigo_fab:codigo_fab, img: img},
        async: true,
        dataType: "json",
        beforeSend: function () {
            infoMsg("Buscando Ubicaciones con misma imagen",3000); 
        },
        success: function (data) { 
            $(".fila_ubic").remove();
            $("#ubicaciones").css("height","auto");
            $("#ubicaciones").css("width","auto");
            for (var i in data) { 
                var ubic  = data[i].ubicacion;
                var metros = parseFloat(data[i].metros); 
                var piezas = data[i].piezas; 
                $("#tabla_ubic").append("<tr class='fila_ubic'><td class='item'>"+ubic+"</td><td class='itemc'>"+metros+"</td><td class='itemc'>"+piezas+"</td></tr>");
            }    
            $("#ubicaciones").slideDown();
            $("#ubicaciones").draggable();
            
            
            var img_pos = $("."+img_id+"").offset();
            var h = $("."+img_id+"").height();
            
            $("#ubicaciones").offset({top:img_pos.top + h,left: img_pos.left });
        },
        error: function (e) {  
            errorMsg("Error al xxx cuenta:  " + e, 10000);
        }
    }); 
}
function cerrarUbicaciones(){
    $("#ubicaciones").slideUp();
}
function buscarArticulosPermitidos(){
    var ItemCodePadre = $("#codigo_art").val();
    $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {"action": "getArticulosPermitidos", ItemCodePadre: ItemCodePadre},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            $(".permitidos").remove();
            for (var i in data) { 
                var articulo = data[i].articulo;
                var descrip = data[i].descrip; 
                var cantidad = data[i].cantidad; 
                var rendimiento = parseFloat(data[i].rendimiento); 
                var um = data[i].um; 
                var ref = data[i].rf; 
                var requerido = parseFloat(cantidad);
                 
                if(rendimiento !== 1){
                    requerido+"x"+rendimiento;
                }
                requerido+=" "+um;
                $("#permitidos").append("<tr class='permitidos'><td data-qty='"+cantidad+"' data-rendimiento='"+rendimiento+"' class='permit_"+articulo+" codigo_permitido item ref_"+ref+"' onclick=sumarAsignados('"+articulo+"')>"+articulo+"</td><td class='item'>"+descrip+"</td> <td class='itemc'>"+requerido+"</td> </tr>");
            }   
            $("#msg").html(""); 
        }
    });
}
function cerrarPopup(){
    $("#asign_popup").slideUp();
    $(".fila_marcada").removeClass("fila_marcada");
    setTimeout("getPorcentajeAsingnaciones()",1500);    
}
function generarEmision(nro_orden){
    
    $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {"action": "generarEmision", nro_orden: nro_orden,"usuario": getNick(), "suc": getSuc()},         
        async: true,
        dataType: "html",
        beforeSend: function () {     
            $("#boton_generar_"+nro_orden).prop("disabled",true);
            $("#emis_"+nro_orden).html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var nro_emis = parseInt($.trim(objeto.responseText));    
                if(!isNaN(nro_emis)){
                    $("#emis_"+nro_orden).html(nro_emis); 
                    alert("Emision generada con exito Nro: "+nro_emis);
                    enviarNotificacionTelegramPickers(nro_orden,nro_emis)
                    setTimeout(function(){
                        genericLoad("produccion/OrdenFabric.class.php?action=listarPendientes");
                    },1000);
                    
                }else{
                    alert($.trim(objeto.responseText));
                }
            }
        },
        error: function () {
            $("#emis_"+nro_orden).html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });     
            
}
function enviarNotificacionTelegramPickers(nro_orden,nro_emis){
    
    var usuario = getNick();
    var saludo = getSaludo();
    
    
    var msg = "<i><b>"+usuario+"</b></i> <b>ha liberado una Orden de Fabricacion </b>  <b>Nro:</b>  "+nro_orden+".  Emision  <b>Nro:</b>"+nro_emis+"  Para acceder al sistema haga click <a href='http://192.168.2.222'>Aqui</a>  "+saludo;
    
    $.ajax({
        type: "POST",
        url: "utils/telegram/Telegram.class.php",
        data: {action: "enviarMensajePickers", msg: msg},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#emis_"+nro_orden).html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            if (data.ok === true) {
                $("#emis_"+nro_orden).html("Ok notificacion de Telegram enviada"); 
            } else {
                console.log("data.ok  "+data.ok);
                $("#emis_"+nro_orden).html("<br>Error al enviar notificacion a Telegram");   
            }                
        },
        error: function (e) {                 
            $("#result").html("Error al enviar notificacion a Telegram:  " + e);   
            errorMsg("Error al enviar notificacion a Telegram:  " + e, 10000);
        }
    }); 
}
function showKeyPad(){
    var postop = $("#lote").offset().top;
    showRelative("lote",buscarDatos,false,postop);
}

function listarLotesAsignados(){
    
    var nro_emision = $("#nro_emision").val();
    var codigo_ref = $("#codigo_art").val(); 
    var nro_orden_id_det = $("#nro_orden_id_det").val(); 
    
    $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {"action": "listarLotesAsignados", nro_emision: nro_emision,codigo:codigo_ref,nro_orden_id_det:nro_orden_id_det},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $(".fila_asign").remove();
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            for (var i in data) { 
                var codigo = data[i].codigo;
                var lote = data[i].lote;
                var descrip = data[i].descrip;   
                var cant_lote = data[i].cant_lote;
                var cant_format = parseFloat( cant_lote  ).format(2, 3, '.', ',');
                var path = $("#images_url").val();
                var img = data[i].img;
                var img_path = path+"/"+img+".thum.jpg";
                if(img === ""){
                    img = "0/0";
                    img_path = "img/0.jpg";
                }
                $("#detalle_asign").append("<tr  class='fila_asign fila_"+nro_emision+"_"+lote+"'><td class='asign_"+codigo+" itemc'>"+codigo+"</td><td data-img='"+img+"' class='item asigned_lote'>"+lote+"</td><td  class='item'>"+descrip+"</td> <td class='itemc'><img style='border-radius:2px'  src='"+img_path+"' width='28'></td>  <td  class='num cant_"+codigo+"'>"+cant_format+"</td><th><img src='img/trash_mini.png'  onclick='eliminarLote("+nro_emision+","+lote+")'></th></tr>");  
            }   
            $("#msg").html(""); 
        }
    });
}

function buscarDatos(){
   var lote = $.trim($("#lote").val());
   var suc = getSuc();
   var producto_final = $("#codigo_art").val();
   //$('input[type="checkbox"]#traer_historial').prop("checked",false);
   $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {"action":"buscarDatosDeCodigo","lote":lote,"categoria":1,"suc":suc,producto_final:producto_final}, // Utilizo la misma funcion de Factura de Ventas
        async:true,
        dataType: "json",
        beforeSend: function(){ 
           $("#msg").html("<img src='img/loadingt.gif' >");   
            
           $("#img").fadeOut("fast");
           $("#codigo").val(""); 
           $("#um").val("");  
           $("#suc").val("");   
           $("#ancho").val("");  
           $("#gramaje").val("");  
           $("#descrip").val("");  
           $("#stock").val("");  
           $("#mat_pri_ref").val("");  
        },
        success: function(data){ 
            var existe = data.existe;
            $("#msg").attr("class","info");
            if( existe === "true" ){
                var codigo = data.codigo;
                 
                // Ver si coincide el ItemCode con los articulos Permitidos
                var enlista = false;
                
                $(".permitido").removeClass("permitido");
                
                $(".codigo_permitido").each(function(){
                    var cp = $(this).html();
                    if(cp == codigo){
                        enlista = true;
                        $(this).addClass("permitido");
                    }
                });
                
                 
                 
                $("#codigo").val(codigo); 
                $("#descrip").val(data.descrip);
                $("#stock").val(  parseFloat( data.stock  ).format(2, 3, '.', ',')   );
                
                var ancho = parseFloat(  data.ancho ).format(2, 3, '.', ',');
                var gramaje = parseFloat(  data.gramaje ).format(2, 3, '.', ',');
                var um = data.um_prod; 
                var suc = data.suc;  
                var img = data.img;  
                var padre = data.padre;  
                var ubic = data.ubicacion;  
                var fab_color_cod = data.color_cod_fabric;
                var color = data.color;
                var design = data.design;  
                var MateriaPrima = parseFloat(  data.MateriaPrima ).format(2, 3, '.', ',');  
                var MatPriRef = data.MatPriRef=="true"?"Si":"No";
                
                        
                $("#um").val(um);  
                $("#suc").val(suc);   
                $("#ancho").val(ancho);  
                $("#gramaje").val(gramaje);  
                $("#padre").val(padre); 
                $("#ubic").val(ubic); 
                $("#fab_color_cod").val(fab_color_cod); 
                $("#color").val(color); 
                $("#design").val(design); 
                $("#materia_prima").val(MateriaPrima);  
                $("#mat_pri_ref").val(MatPriRef);  
                $("#mat_pri_ref").addClass("MT_ref_"+MatPriRef);
                        
                if(img != "" && img != undefined){
                    var images_url = $("#images_url").val();
                    $("#img").attr("src",images_url+"/"+img+".thum.jpg");
                    $("#img").fadeIn(100);
                }else{
                    $("#img").attr("src","img/no_image.png");
                    $("#img").fadeIn(2500);
                }                
         
                $("#msg").html("<img src='img/ok.png'>");  
                if(getSuc() == suc){
                   $("#imprimir").removeAttr("disabled");
                }else{
                    $("#msg").addClass("error");
                    $("#msg").html("Esta pieza no se encuentra en esta Sucursal!, Corrobore.");   
                }
                if(enlista){
                    buscarStockComprometido(lote);
                }else{
                    $("#asignar").prop("disabled",true);
                    $("#msg").addClass("error");
                    $("#msg").html("Esta pieza no esta en la lista de Articulos para emision");   
                }
                sumarAsignados(codigo);
                //$("#imprimir").removeAttr("disabled");
            }else{
                $("#msg").addClass("error");
                $("#msg").html("No encontrado");   
                $("#lote").focus(); 
                $("#lote").select();
                $("#stock_compr").html("");
                //$("#imprimir").attr("disabled",true);
            }
        },
        error: function(e){ 
           $("#msg").addClass("error");
           $("#msg").html("Error en la comunicacion con el servidor:  "+e);
           $("#imprimir").attr("disabled",true);
           $("#lote").select();
           $("#stock_compr").html("");
        }
    });
}
function asignarLote(){
    var nro_emision = $("#nro_emision").val();
    var nro_orden = $("#nro_orden").val(); 
    var codigo = $("#codigo").val(); 
    var codigo_ref = $("#codigo_art").val(); 
    var nro_orden_id_det =   $("#nro_orden_id_det").val(); 
    
    var lote = $("#lote").val(); 
    var cantidad = parseFloat($("#stock").val().replace(/\./g,"").replace(/,/g,".")); 
    var MatPriRef = $("#mat_pri_ref").val();
    if(MatPriRef == "No"){
        cantidad = parseFloat($("#materia_prima").val().replace(/\./g,"").replace(/,/g,".")); 
        var pedido = parseFloat($("#pedido").val()); 
        cantidad = cantidad * pedido;
    }
    
    var color = $("#color").val(); 
    var descrip = $("#descrip").val(); 
    var design = $("#design").val(); 
    
    var ancho = parseFloat($("#ancho").val().replace(",","."));
    var medida = parseFloat($("#medida").val()); 
    
    var img_path  = $("#img").attr("src");
    
    var multiplicador = Math.floor(  ancho / medida); 
    if(multiplicador < 1){
        multiplicador = 1;
    }
    
    var esta_asignado = false;
    
    $(".asigned_lote").each(function(){  
        var loteasignado = $(this).html();    
        if(loteasignado == lote){
            esta_asignado = true;
        }
    });
           
    if(codigo != "" || lote !="" ){
       if(!esta_asignado){ 
    
        $.ajax({
            type: "POST",
            url: "produccion/OrdenFabric.class.php",
            data: {"action": "asignarLote", nro_orden: nro_orden,nro_emision:nro_emision,codigo:codigo,lote:lote,descrip:descrip,color:color,design:design,cantidad:cantidad,codigo_ref:codigo_ref,usuario:getNick(),multiplicador:multiplicador,nro_orden_id_det:nro_orden_id_det},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                if(data.Estado == "Ok"){
                   // $("#detalle_asign").append("<tr class='fila_asign fila_"+nro_emision+"_"+lote+"'><td class='asign_"+codigo+" itemc'>"+codigo+"</td><td class='item asigned_lote' >"+lote+"</td><td class='item'>"+descrip+"</td><td class='num cant_"+codigo+"'>"+cantidad+"</td><th><img src='img/trash_mini.png' onclick='eliminarLote("+nro_emision+","+lote+")'></th></tr>");
                   $("#detalle_asign").append("<tr  class='fila_asign fila_"+nro_emision+"_"+lote+"'><td class='asign_"+codigo+" itemc'>"+codigo+"</td><td   class='item asigned_lote'>"+lote+"</td><td  class='item'>"+descrip+"</td> <td class='itemc'><img style='border-radius:2px'  src='"+img_path+"' width='28'></td>  <td  class='num cant_"+codigo+"'>"+cantidad+"</td><th><img src='img/trash_mini.png'  onclick='eliminarLote("+nro_emision+","+lote+")'></th></tr>");  
                    sumarAsignados(codigo);
                    //buscarResumenAsignados(nro_orden,nro_emision,codigo_ref);
                    limpiarAsignForm();
                    $("#msg").html("");
                }else{
                    alert(data.Mensaje);
                    $("#msg").html(data.Mensaje);
                }    
            }
        });
    }else{
        alert("Este lote ya esta asignado previamente.");
    }
    }else{
        alert("Puntee un lote con el lector.");
    }
    
}
function sumarAsignados(codigo){  
     
    var tasign = 0;
    $(".cant_"+codigo).each(function(){
       var v = parseFloat($(this).html());
       tasign+=v;
    });
    var medida  = parseFloat($(".permit_"+codigo).attr("data-qty").replace(",",".")) ; 
    var multiplicador  = parseFloat($(".permit_"+codigo).attr("data-rendimiento").replace(",","."));  
      
    var calcasign =  (tasign / medida) * multiplicador ;    
    var fixedval =  (((tasign / medida) * multiplicador)).toFixed(2);    
    $("#tasign").val(fixedval);
    var pedido = parseFloat($("#pedido").val());
    if(calcasign >= pedido){
      $(".msg").html("Asignacion completa para este Articulo ["+codigo+"] <img src='img/ok.png'>");
      $(".msg").css("color","green");
    }else{
      $(".msg").html("Falta Asignar mas para este Articulo ["+codigo+"]");
      $(".msg").css("color","red");
    }
}
function eliminarLote(nro_emision,lote){
    var c = confirm("Seguro que desea eliminar este lote?");
    if(c){
        var codigo_ref = $("#codigo_art").val();
    $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {"action": "eliminarLote", nro_emision: nro_emision,lote:lote,codigo_ref:codigo_ref},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);   
                if(result == "Ok"){
                    $(".fila_"+nro_emision+"_"+lote).remove();
                    $("#msg").html("Ok"); 
                }else{                     
                    $("#msg").html(result); 
                }
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
    }    
}
function limpiarAsignForm(){
    $(".asign_form input[type=text]:not(.ped)").val("");    
    $("#lote").focus(); 
    $("#img").attr("src","img/no_image.png");
    $("#asignar").prop("disabled",true);
}
 
function buscarStockComprometido(lote){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "buscarStockComprometido", lote: lote,suc:getSuc(),"incluir_reservas":"Si"},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#stock_comprometido").html("");
            $("#stock_compr").html("");
        },
        success: function (data) {   
            var comprometido = 0;
            var st_comp = "<table class='stock_comprometido' border='1'>";
            st_comp+="";
            if(data.length > 0){ // Se permitira si el Stock Limpio es > 0
                
                var st_comp = "<table class='tabla_stock_comprometido' border='1'>";
                st_comp+="<tr><th colspan='6' style='background:lightskyblue;'>Stock Comprometido</th><th style='text-align:center;background:white'>X</th></tr>";
                st_comp+="<tr class='titulo' style='font-size:10px'><th>Doc</th><th>Nro Doc</th><th>Usuario</th><th>Fecha</th><th>Suc</th><th>Estado</th><th>Cantidad</th><tr>";
                for (var i in data) {
                    var tipodoc = data[i].TipoDocumento;
                    var nro = data[i].Nro;
                    var usuario_ = data[i].usuario;
                    var fecha = data[i].fecha;
                    var suc = data[i].suc;
                    var estado = data[i].estado;
                    var cantidad = data[i].cantidad;
                    comprometido += parseFloat(cantidad);
                    st_comp+="<tr style='background:white'><td>"+tipodoc+"</td><td>"+nro+"</td><td>"+usuario_+"</td><td>"+fecha+"</td><td class='itemc'>"+suc+"</td><td>"+estado+"</td><td class='num'>"+cantidad+"</td></tr>";
                }  
               
               
                //console.log(comprometido);
                var stock_limpio = parseFloat($("#stock").val().replace(/\./g,"").replace(/,/g,"."))  - comprometido;
                $("#stock").val(  parseFloat( stock_limpio  ).format(2, 3, '.', ',')   );
                $("#stock_compr").html("<img src='img/warning_red_16.png' onclick='verStockComprometido()' title='Alguien mas tiene cargada esta pieza en un Documento!'>");
                $("#stock_comprometido").html(st_comp);
                $(".tabla_stock_comprometido").click(function(){
                    verStockComprometido();
                });
                 /*
                if(stock_limpio > 0){
                    $("#asignar").removeAttr("disabled"); 
                    $("#msg").html("<img src='img/ok.png'>");  
                }else{
                    $("#asignar").prop("disabled",true);
                     $("#msg").html("<img src='img/warning_red_16.png>");  
                }*/// No se permitira asignar si ya asigno antes o 
                if(stock_limpio > 0){
                    $("#asignar").removeAttr("disabled");   
                    $("#msg").html("<img src='img/ok.png'>");  
                }else{
                    $("#asignar").prop("disabled",true);
                    $("#msg").html("<img src='img/warning_red_16.png'>");  
                }
            }else{
                var stock_limpio = parseFloat($("#stock").val().replace(/\./g,"").replace(/,/g,"."))  - comprometido;
                if(stock_limpio > 0){
                    $("#asignar").removeAttr("disabled");   
                    $("#msg").html("<img src='img/ok.png'>");  
                }else{
                    $("#asignar").prop("disabled",true);
                    $("#msg").html("<img src='img/warning_red_16.png'>");  
                }
            }
            
        }
    });
}
function verStockComprometido(){
    $("#stock_comprometido").toggle();
}
function ponerEnProduccion(nro_orden,nro_emision){
    
    var asignacion = $.trim($(".operador_"+nro_orden).text());
    if(asignacion.length > 2 ){  
        $.ajax({
            type: "POST",
            url: "produccion/OrdenFabric.class.php",
            data: {"action": "ponerEnProduccion", nro_emision: nro_emision,nro_orden:nro_orden,usuario:getNick()},
            async: true,
            dataType: "html",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            complete: function (objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText);    
                    if(result == "Ok"){
                        alert("Ok la orden se puesto en proceso de produccion");
                        $("#msg").html(""); 
                        $(".orden_"+nro_orden).slideUp();
                    }else{
                        $("#msg").html(result); 
                    }
                }
            },
            error: function () {
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        }); 
    }else{
       alert("No se puede poner en Fabrica sin asignar la orden a un Operador de Maquinas.");   
    }      
}

function zoomImage(){
    var w = $("#zoom_range").val();    
    $("#image_container").width(w);
    $("#img_zoom").width(w);    
}
function cargarImagenLote(img, obj){   
    $("#image_container").html("");
    var images_url = $("#images_url").val();
    
    var cab = '<div style="width: 100%;text-align: right;background: white;">\n\
        <img src="img/substract.png" style="margin-top:-4px"> <input id="zoom_range" onchange="zoomImage()" type="range" name="points"  min="60" max="1000"><img src="img/add.png" style="margin-top:-4px;">\n\
        <img src="img/close.png" style="margin-top:-18px;margin-left:100px" onclick=javascript:$("#image_container").fadeOut()>\n\
    </div>';
    
    $("#image_container").fadeIn();
    
    
    var width = $(obj).width() + 20; 
    var top = $(obj).position().top;
    if(top < 100){
        top = 100;
    }
    $("#image_container").offset({left:width,top:top});
    var path = images_url+"/"+img+".jpg";
    
    var img = '<img src="'+ path +'" id="img_zoom" onclick=javascript:$("#image_container").fadeOut() width="500" >';
    $("#image_container").html( cab +" "+ img);
    $("#image_container").draggable();
}
function asignarOperario(nro_orden){  //<span id="avatar" class="avatar" style="background-image: url(&quot;img/usuarios/douglas.jpg&quot;); display: inline-block;" onclick="avatarClick()"></span>
    var table = "<table border='1' class='tabla_operadores'>";
    table+="<tr><td class='itemc'>Operadores</td><td  class='itemc' ><img src='img/close.png' onclick='hideOperators()' style='cursor:pointer;' ></td></tr>";
    operarios.forEach(function(user){
        setTimeout(getUserImage(user),500);  
        table+='<tr><td onclick=asignarAUsuario('+nro_orden+',"'+user+'")>'+user+'</td><td style="width:30%;height:40px;text-align:center"><span  class="avatar avatar_'+user+'" style="background-image: url(img/person.png); display: inline-block;;margin-top:-10px"></span>  </td></tr>';
    });
    table+='</table>';
    $(".div_operadores").html(table);
    
    $(".div_operadores").fadeIn();
    var window_width = $(document).width() / 2;
    var desing_width = $(".div_operadores").width() / 2;
    var posx = (window_width - desing_width);
    posx = posx + "px";
    $(".div_operadores").css({ left: posx, top: 80 }); 
    $(".div_operadores").draggable();
}
function hideOperators(){
    $('.div_operadores').slideUp();
}
function getUserImage(user){
    var ip = location.host;
    var server = "http://"+ip+"/inmopy/";
    var url = server+"img/usuarios/"+user+".jpg";    
    $.get(url)
    .done(function() {    
        $(".avatar_"+user).css("background-image", "url("+url+")");
    }).fail(function() { 
         
    });    
}

function asignarAUsuario(nro_orden,operador){
    $(".operador_"+nro_orden).html("<span onclick='asignarOperario("+nro_orden+")'>"+operador+"</span> <span  class='avatar avatar_"+operador+"' style='background-image: url(img/person.png); display: inline-block;;margin-top:-10px' onclick='asignarOperario("+nro_orden+")'></span>");
    $.post("produccion/OrdenFabric.class.php", {action: "asignarAOrdenFabricacionAOperador", nro_orden: nro_orden, operador: operador,usuario:getNick()});
    hideOperators();
    getUserImage(operador);
}
function getSaludo(){
  var fecha = new Date(); 
  var hora = fecha.getHours();
 
  if(hora >= 0 && hora < 12){
    var texto = "<b>Que tenga un buen dia!</b>";
    //imagen = "img/dia.png";
  }
 
  if(hora >= 12 && hora < 18){
    var texto = "<b>Buen resto de jornada!</b>";
    //imagen = "img/tarde.png";
  }
 
  if(hora >= 18 && hora < 24){
    var texto = "<b>Buenas Noches!</b>";
    //imagen = "img/noche.png";
  }
  return texto;
}
/*
function asignar(nro_orden){
    var usuario_ = $(".asignar_"+nro_orden).val();
    if(usuario_ != ""){
        $.ajax({
            type: "POST",
            url: "produccion/OrdenFabric.class.php",
            data: {"action": "asignarOrdenFabric",nro_orden:nro_orden, "usuario": usuario_},
            async: true,
            dataType: "html",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            complete: function (objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText);   
                    if(result == "Ok"){
                        alert("La Orden de Fabricacion ha sido asignada y puesta en Proceso.");
                        genericLoad("produccion/OrdenFabric.class.php?action=listarPendientes");
                    }else{
                        alert("Error: "+result);
                    }
                }
            },
            error: function () {
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        }); 
    }else{
        alert("Seleccione un Confeccionista.")
    }
}*/
/*
function emisionProduccion(nro_orden){
    var suc = getSuc();
    genericLoad("produccion/EmisionProduccion.class.php?nro_orden="+nro_orden+"&suc="+suc);
}*/