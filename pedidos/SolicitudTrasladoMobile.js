var nro_nota = 0;
var decimales = 0;
var cant_articulos = 0;
var fila_art = 0;
var PORC_VAL_MIN = 25;     
var data_next_time_flag = true;
var ventana;
var latencia = null;
var selecciono_nota = false;
var agregar_lotes = false;
var tipo_busqueda = "tejidos";
var lista_precios = new Object();          
var printing;

var moneda_actual = 'G$';

var solicitudes_abiertas = new Object();  


function configurar(){
    setHotKeyArticulo();
    $("#filtroStock").mask("9?999",{placeholder:""});
    $(".numeros").change(function(){ 
        var n = parseFloat($(this).val() ).format(decimales, 3, '.', ',') ;
        $(this).val( n  );
        if($(this).val() ==="" || $(this).val() ==="NaN" ){
           $(this).val( 0);
        }  
     });
      
    activarEstados();  
    statusInfo();
     
     
    function setHotKeysListaCliente() {}
    controlarVacias();
     
    $("#precio_venta").change(function(){
        var pv = parseFloat($(this).val().replace(".","").replace(",","."));
        var vm = $("#valor_minimo").val();
         
        if(pv < vm){
            $("#precio_venta").val(vm);
            alert("Estas vendiendo bajo el Minimo");
        }        
    });
    $("#precio_venta, #cantidad").focus(function(){
       $(this).select(); 
    });
    
    $(".tipo_busqueda").click(function(){
        var tipo = $("input[name='tipo_busqueda']:checked").val();
        if(tipo === "insumos"){
            tipo_busqueda = "insumos";
            $("#mts_unid").html("Cant Requerida:");
            
            $("#codigo_cliente").val("C000018");
            $("#ruc_cliente").val("80001404-9");
            $("#categoria").val("1");
            $("#nombre_cliente").val("CORPORACION TEXTIL S.A");  
            $("#moneda").val("G$");
            if($("#fijar_cliente").prop("disabled")){
                fijarCliente();
                $("#fijar_cliente").removeAttr("disabled");
            }
            $(".clr_tejido").html("Stock:");
            $("#tipo_normal_cliente").prop("checked",false);
            $(".precio_categ").prop("readonly",true);
            getSolicitudesAbiertasXMoneda();
        }else{
            tipo_busqueda = "tejidos"; 
            if($("#tipo_normal_cliente").is(":checked")){
                $(".precio_categ").prop("readonly",false);
            }else{
                $(".precio_categ").prop("readonly",true);
            }
        }
    });
    $("#tipo_normal_cliente").click(function(){
        var normal_cliente = $(this).is(":checked");
        if(normal_cliente){ 
            $('input:radio[name=tipo_busqueda][value=tejidos]').prop('checked', true);
            $(".precio_categ").prop("readonly",false);
        }else{
            $(".precio_categ").prop("readonly",true);
            $("#codigo_cliente").val("C000018");
            $("#ruc_cliente").val("80001404-9");
            $("#categoria").val("1");
            $("#nombre_cliente").val("CORPORACION TEXTIL S.A");  
            $("#moneda").val("G$");
            $("#fijar_cliente").prop("disabled",false);
            getSolicitudesAbiertasXMoneda();
        } 
    });
    var sucObj = getCookie("sucObjetivo").sesion;
    if(sucObj!==undefined){
        $("#sucObjetivo").val(sucObj);
    }else{
        $("#sucObjetivo").val("%");
    }
     
    $(document).click( function(){ calcularLatencia();  });    
    sumSubtotal();
    $( window ).resize(function() {
      acomodarListaLotes();
    });
    $("#suc").val($("#sucObjetivo").val() ) ;
}
function checkPreciosXMoneda(){
    var codigo = $("#codigo").val();
    var moneda = $("#moneda").val();
    var um = $("#um").val();
    
    if(moneda != "G$" ){
       decimales = 2;
    }
     
    if(codigo !== ""){
        $.ajax({
            type: "POST",
            url: "productos/Articulos.class.php",
            data: {action: "checkPreciosXMoneda",codigo:codigo, moneda: moneda, um: um},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                if(Object.keys(data).length > 0){
                   lista_precios = data; 
                }else{
                   lista_precios = new Object();           
                   errorMsg("No se ha definido precios en "+moneda+" para "+um+" para este articulo contactese con compras para definir precios",15000); 
                }              
            },
            error: function (e) {                 
                $("#msg").html("Error en checkPreciosXMoneda:  " + e);   
                errorMsg("Error en checkPreciosXMoneda:  " + e, 10000);
            }
        }); 
        if(moneda_actual != moneda){
           moneda_actual =moneda;
           getSolicitudesAbiertasXMoneda();
        }
        
    }
}

function listarSucs(){
    var sucs = new Array(); 
    $('.checked .suc').each(function() {
        var suc = $(this).text();
        if (sucs.indexOf(suc) < 0){
             sucs.push(suc);
        } 
    });
    if(sucs.length > 0){
        $("#result").addClass("info_sucs");
        $("#result").html("Pedidos para sucursales: ");
        sucs.forEach(function(suc){
            $("#result").append("  "+suc+",    ");
        });
        $("#result").append("...");
    }else{
        $("#result").removeClass("info_sucs");
    }
    return sucs;
}

function getSolicitudesAbiertasXMoneda(){
    solicitudes_abiertas = new Object();  // Antes que nada vaciar la lista
    var moneda = $("#moneda").val();
    var cod_cli = $("#codigo_cliente").val();
    
    $.ajax({
        type: "POST",
        url: "pedidos/SolicitudTrasladoMobile.class.php",
        data: {action: "getSolicitudesAbiertasXMoneda", suc: getSuc(), usuario: getNick(),moneda:moneda,cod_cli:cod_cli,tipo:tipo_busqueda},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#solicitudes").html("Buscando pedidos Abiertos");
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
             if(data.length > 0 ){
                solicitudes_abiertas = data;
                $("#solicitudes").html("");
                for(var i in data){  
                var Nro = data[i].Nro;
                var Usuario = data[i].Usuario;
                var cod_cli = data[i].cod_cli;
                var Fecha = data[i].Fecha;
                var cat = data[i].cat;
                var Origen = data[i].Origen;
                var Destino = data[i].Destino;    
                var Cliente = data[i].cliente;    
                var moneda = data[i].moneda;    
                var html = '<table border="1" class="solicitud_abierta_cab solicitud_'+Nro+' '+cod_cli+'-'+Destino+'" data-destino="'+Destino+'" data-nro="'+Nro+'"   >\n\
                <tr style="background-color: lightgray">\n\
                            <th>Nro</th> <th>Usuario</th><th>Origen</th><th>Destino</th><th>Moneda</th><th>Fecha</th><th>Estado</th><th></th>\n\
                </tr>\n\
                <tr> \n\
                     <th id="ped_nro_'+Nro+'" data-cod_cli="'+cod_cli+'" data-cat="'+cat+'" >'+Nro+'</th> <th class="cod_cli"  >'+Usuario+'</th><th class="select_cliente" style="text-align: left" onclick=seleccionarNotaPedido("'+Nro+'") >'+Cliente+'</th><th class="destino_'+Nro+'">'+Destino+'</th><th class="moneda">'+moneda+'</th><th>'+Fecha+'</th><th class="estado" style="background-color: #white;color:black;width:170px;height:28px">Abierta&nbsp;<input type="button" value="Enviar Solicitud" style="display:none;height:22px;font-size: 9px;cursor:pointer" onclick="enviarSolicitud('+Nro+')"></th>\n\
                     <th  style="text-align: center"> <img src="img/ticket_black.png" style="cursor:pointer" class="comp" id="comp_'+Nro+'"  onclick="comprobanteTermico('+Nro+')" height="24px"> <span id="trash_ped_'+Nro+'"></span></th> \n\
                </tr>\n\
                <tr>\n\
                    <td colspan="8">\n\
                        <table border="1" id="sol_'+Nro+'" class="solicitud_abierta" data-destino="'+Destino+'" data-nro="'+Nro+'" style="border:1px solid gray;border-collapse: collapse;min-width: 100%;">\n\
                            <tr class="titulo"><th>Lote</th><th>Descrip</th><th>Color</th><th>Cantidad</th><th>Precio Cat.</th><th>Precio Venta</th><th>Subtotal</th><th>Mayorista</th><th>Urgente</th><th>Obs</th><th></th></tr>\n\
                        </table>\n\
                    </td>\n\
                </tr></table>';

                $("#solicitudes").append(html);
                getDetalleSolicitud(Nro);
                activarEstados();
                inicializarCursores('select_cliente');
                $("#msg").html("Ok");                  
             }  
             }else{
                 $("#solicitudes").html("");
                 $("#msg").html("Ningun pedido abierto"); 
             }
        },
        error: function (e) {                 
            $("#msg").html("Error al obtener pedidos  " + e);   
            errorMsg("Error al obtener pedidos" + e, 10000);
        }
    }); 
    //solicitudes_abiertas = 
}
function seleccionarNotaPedido(nro){
    $(".cursor").remove();
    var codigo_actual = $("#codigo_cliente").val();
    var codigo_select =  $("#ped_nro_"+nro).attr("data-cod_cli");
    if(codigo_select != codigo_actual){
        var cat =  $("#ped_nro_"+nro).attr("data-cat");
        var cliente = $("#ped_nro_"+nro).parent().find(".select_cliente").html();
        var moneda = $("#ped_nro_"+nro).parent().find(".moneda").html();
        $("#ruc_cliente").val("");// No importa el RUC
        $("#nombre_cliente").val(cliente);
        $("#codigo_cliente").val(codigo_select);
        $("#categoria").val(cat);
        $("#moneda").val(moneda);
        fijarCliente();
    }
     
    $("#tipo").focus();
    $("#msg").html(""); 
    
    $("#fijar_cliente").removeAttr("disabled");
    
    $("#descrip").focus();    
}

function show_all(){
    if($("#show_all").is(":checked")){
        $("#codigo_cliente").val("%");
        $("#ruc_cliente").val("");
        $("#nombre_cliente").val("");
        $("#ruc_cliente").prop("disabled",false);
        $("#nombre_cliente").prop("disabled",false);
        mostrarTodo();
    }
}

function getDetalleSolicitud(nro){
    $.ajax({
        type: "POST",
        url: "pedidos/SolicitudTrasladoMobile.class.php",
        data: {action: "getDetalleSolicitud", nro: nro },
         
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {  
            //codigo,lote,descrip,cantidad,precio_venta,ROUND((cantidad*precio_venta),2) as subtotal,color,mayorista,urge,obs
            if(data.length > 0 ){
                $(".fila_"+nro+"").remove();
                for(var i in data){  
                   var codigo = data[i].codigo;
                   var lote = data[i].lote;
                   var descrip = data[i].descrip;
                   var cantidad = data[i].cantidad;
                   var precio_cat = parseFloat(data[i].precio_cat).format(2, 3, '.', ',');    
                   var precio_venta = parseFloat(data[i].precio_venta).format(2, 3, '.', ',');    
                   var subtotal = parseFloat(data[i].subtotal).format(2, 3, '.', ',');  
                   var classe = "";
                   var classe_nro = "";
                   var toolt = "";
                   if( parseFloat(data[i].precio_cat) >  parseFloat(data[i].precio_venta) ){
                       classe = " pendiente tooltip";
                       classe_nro = "pend_"+nro;
                       toolt = '<span class="tooltiptext">Precio mas bajo que la categoria del cliente, quedara pendiente de aprobacion</span>';
                   } 
                   var color = data[i].color;
                   var mayorista = data[i].mayorista;
                   var urge = data[i].urge;
                   var obs = data[i].obs;
                   $("#sol_"+nro).append("<tr id='tr_"+nro+"' class='fila_"+nro+" "+classe_nro+"'><td class='item lote_"+lote+"'>"+lote+"</td><td class='item'>"+descrip+"</td><td class='item'>"+color+"</td><td class='num'> "+cantidad+"</td><td class='num "+classe+" "+toolt+"'>"+precio_cat+"</td><td class='num "+classe+"'>"+precio_venta+" "+toolt+"</td><td class='num'>"+subtotal+"</td><td class='itemc'>"+mayorista+"</td><td class='itemc'>"+urge+"</td><td class='item'>"+obs+"</td>\n\
                   <td class='itemc'><img src='img/trash_mini.png' class='trash' id='trash_{"+lote+"}' style='cursor:pointer;' onclick='borrarLote("+lote+","+nro+")'  /></td>/</tr>");
                }
            }else{
                $("#trash_ped_"+nro).html('<img src="img/trash.png" class="trash" id="eliminar_'+nro+'" style="cursor:pointer;" onclick="borrarNota('+nro+')">');
            }
            $("#msg").html(""); 
        },
        error: function (e) {                 
            $("#msg").html("Error al obtejer filas:  " + e);   
            errorMsg("Error al obtejer filas:  " + e, 10000);
        }
    }); 
}

function controlarVacias(){
    $(".solicitud_abierta_cab").each(function(){            
        var nro = $(this).attr("data-nro");
        var c = 0;
        $(".fila_"+nro).each(function(){  
          c++;        
        });   
        if(c > 0){
           $(".boton_env_"+nro).removeAttr("disabled");
           $("#eliminar_"+nro).fadeOut();             
        }else{
           $(".boton_env_"+nro).prop("disabled",true);
           $("#eliminar_"+nro).fadeIn();  
        }
    });          
}
function seleccionarLista(cod_cli){
    console.log(cod_cli);
    var cliente = $("."+cod_cli).html();    
    $("#nombre_cliente").val(cliente);
    $("#ruc_cliente").val("");
    selecciono_nota = true;
    nro_nota = parseInt($("."+cod_cli).data("nro"));     
    console.log("nro_nro "+nro_nota);
    buscarCliente("#nombre_cliente");    
}
function borrarNota(nro){
    var c = 0;
    $(".fila_"+nro).each(function(){  
      c++;        
    });    
    if(c > 0){
        alert("No se puede eliminar debido a que la Nota contiene Lotes");
    }else{
        $.ajax({
            type: "POST",
            url: "pedidos/SolicitudTrasladoMobile.class.php",
            data: {"action": "eliminarNotaPedidoVacia", "nro_nota": nro},
            async: true,
            dataType: "html",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            complete: function (objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText);    
                    if(result == "Ok"){
                        $(".solicitud_"+nro).slideUp();
                        $(".solicitud_"+nro).remove();
                        $("#msg").html(result);
                        
                    }else{
                        $("#msg").html( result );
                    }
                }
            },
            error: function () {
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        });         
    }
}

function activarEstados(){
    $(".estado").hover(function(){ $(this).children().first().fadeIn();} ,function(){$(this).children().first().fadeOut();});   
}
function mostrar(){
   $("#fijar_cliente").removeAttr("disabled"); 
   if(selecciono_nota){
       selecciono_nota = false;
       $("#fijar_cliente").click();
   }
}
function fijarCliente(){
    var nombre_cliente  = $("#nombre_cliente").val();
    var v = $("#fijar_cliente").val();
    if(v == "Fijar" && nombre_cliente.length > 0){
        $("#fijar_cliente").val("Cambiar");
        $(".clidata").attr("disabled",true);
        $("#area_carga").slideDown();
        var cat = $("#categoria").val();
        $(".precio_cat").html("Precio "+cat);
        //checkear();
    }else{
        $("#fijar_cliente").val("Fijar");
        $(".clidata").removeAttr("disabled");
        $(".clidata").val("");
        $("#area_carga").slideUp();
    }
    //var cod_cli = $("#codigo_cliente").val(); 
    getSolicitudesAbiertasXMoneda(); 
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
    
    var moneda = $(obj).find(".codigo").attr("data-moneda");
 
    $("#ruc_cliente").val(ruc);
    $("#nombre_cliente").val(cliente);
    $("#codigo_cliente").val(codigo);
    $("#categoria").val(cat);
    $("#moneda").val(moneda);
       
    $("#ui_clientes" ).fadeOut("fast");
    $("#tipo").focus();
    $("#msg").html(""); 
    
    $("#fijar_cliente").removeAttr("disabled");
    
    $("#descrip").focus();
    getSolicitudesAbiertasXMoneda();
}

function ocultar(){
    //hideKeyboard();
    //check();
}
function cerrar(){}
function limpiarAreaCarga(){
    $("#add_code").prop("disabled",true);
    $("#codigo").val(""); 
    $("#lote").val(""); 
    $("#descrip").val(""); 
    $("#stock").val(""); 
    $("#cantidad").val("");  
    $("#color").val(""); 
    $("#obs").val(""); 
    $("#lote").focus();   
}

 

function agregarLotes(){
    $("#add_code").attr("disabled",true);   
    //var seleccionados = $("input.check:checked").length;
    
    var cod_cli = $("#codigo_cliente").val();
    var sucs = listarSucs(); // sucursales seleccionadas
    
    sucs.forEach(function(sucd){
       if( $("."+cod_cli+"-"+sucd).length > 0 ){
           var nro =  $("."+cod_cli+"-"+sucd).attr("data-nro");          
           procesar(nro,sucd);
       } else{
           generarSolicitudTraslado(sucd); // Generar e Insertar
       }  
    });
    
}   

function procesar(nro_nota,sucd){
    $("input.check."+sucd+":checked").each(function(){  
        console.log("nro_nota : "+nro_nota+"  sucd "+sucd);
        var id = $(this).attr("id").substring(6,26); 
        addLoteSolicitudTraslado(id,nro_nota,sucd);        
    });   
}    

function addLoteSolicitudTraslado(id,nro_nota,sucd){
    var codigo = $("#tr_"+id).attr("data-codigo");
    var lote = $("#tr_"+id).find(".lote").text();
    var color = $("#tr_"+id).find(".Color").text();
     
    var urge = $("#urge").val();
    var mayorista = $("#mayorista").val();
    var descrip = $("#tr_"+id).attr("data-descrip"); 
    var stock = parseFloat($("#tr_"+id).find(".stock").text().replace(".","").replace(",","."));     
    var cantidad = parseFloat($("#tr_"+id).find(".pedir_"+id).val().replace(".","").replace(",","."));     
    var precio_venta = parseFloat($("#tr_"+id).find(".precio_venta_"+id).val().replace(".","").replace(",",".")); 
    var precio_cat = parseFloat($("#tr_"+id).find(".precio_cat_"+id).text().replace(".","").replace(",",".")); 
     
    var subtotal = parseFloat(cantidad) * precio_venta;   
    var obs = $("#obs").val();
    var um = $("#um").val();
    
    if(lote.length != "" && nro_nota > 0 && precio_venta > 0 && !isNaN(lote) && codigo != ""){
 
        if(cantidad < stock){
            
           obs = obs+"  Fraccionar en "+cantidad+" "+um; 
        }    
         
        $.ajax({
            type: "POST",
            url: "pedidos/SolicitudTrasladoMobile.class.php",
            data: {"action": "addLoteSolicitudTraslado", nro_nota: nro_nota,codigo:codigo,lote:lote,usuario:getNick(),cantidad:cantidad,urge:urge,mayorista:mayorista,descrip:descrip,color:color,obs:obs,precio_cat:precio_cat,precio_venta:precio_venta,destino:sucd,um:um},
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >"); 
                $("#check_"+id).prop("disabled",true); 
                $("#check_"+id).after("<img src='img/loading_fast.gif' width='18px' height='18px' >"); 
            },
            success: function(data) {                               
                var estado = data.estado;                
                var mensaje = data.mensaje;                
                $("#msg").removeClass();
                if(estado == "Ok"){ 
                    getDetalleSolicitud(nro_nota); 
                    
                    $("#msg").addClass("info");
                    $("#msg").html(mensaje+"   <img src='img/ok.png' width='18px' height='18px' >"); 
                    setTimeout( function(){ $("#tr_"+id).remove() },700);
                    sumSubtotal();
                     
                }else{
                    $("#msg").addClass("error");
                    $("#msg").html(mensaje); 
                } 
            }
        });
    }else{
        alert("Seleccione un Lote y asigne un precio de venta.");
    }    
}


function generarSolicitudTraslado(sucd){
    
    var cod_cli = $("#codigo_cliente").val();
    var cliente = $("#nombre_cliente").val();
    var cat = $("#categoria").val();
    var moneda = $("#moneda").val();
    if(sucd != ""){
        
        $.ajax({
            type: "POST",
            url: "pedidos/SolicitudTrasladoMobile.class.php",
            data: {"action": "generarSolicitudTraslado", suc: getSuc(),sucd:sucd,usuario:getNick(),cod_cli:cod_cli,cliente:cliente,cat:cat,tipo:tipo_busqueda,moneda:moneda},
            async: true,
            dataType: "json",
            beforeSend: function() {
                $(".generar").fadeOut();
                $("#msg").html("Generando Solicitud... <img src='img/loading_fast.gif' width='18px' height='18px' >"); 
            },
            success: function(data) {   
                //n_nro as Nro,usuario as Usuario,date_format(fecha,'%d-%m-%Y') as Fecha,estado as Estado,suc as Origen,suc_d as Destino
                var Nro = data[0].Nro;
                var Usuario = data[0].Usuario;
                var Fecha = data[0].Fecha;
                //var Estado = data[i].Estado;
                var Origen = data[0].Origen;
                var Destino = data[0].Destino;    
                var Cliente = data[0].cliente;    
                var moneda = data[0].moneda;    
                var html = '<table border="1" class="solicitud_abierta_cab solicitud_'+Nro+' '+cod_cli+'-'+Destino+'" data-destino="'+Destino+'" data-nro="'+Nro+'"  >\n\
                <tr style="background-color: lightgray">\n\
                            <th>Nro</th> <th>Usuario</th><th>Origen</th><th>Destino</th><th>Moneda</th><th>Fecha</th><th>Estado</th><th></th>\n\
                </tr>\n\
                <tr> \n\
                     <th>'+Nro+'</th> <th class="cod_cli" >'+cod_cli+'</th><th style="text-align: left">'+Cliente+'</th><th class="destino_'+Nro+'">'+Destino+'</th><th>'+moneda+'</th><th>'+Fecha+'</th><th class="estado" style="background-color: #white;color:black;width:170px;height:28px">Abierta&nbsp;<input type="button" value="Enviar Solicitud" style="display:none;height:22px;font-size: 9px;cursor:pointer" onclick="enviarSolicitud('+Nro+')"></th>\n\
                     <th  style="text-align: center"> <img src="img/ticket_black.png" style="cursor:pointer" class="comp" id="comp_'+Nro+'"  onclick="comprobanteTermico('+Nro+')" height="24px"></th> \n\
                </tr>\n\
                <tr>\n\
                    <td colspan="8">\n\
                        <table border="1" id="sol_'+Nro+'" class="solicitud_abierta" data-destino="'+Destino+'" data-nro="'+Nro+'" style="border:1px solid gray;border-collapse: collapse;min-width: 100%;">\n\
                            <tr class="titulo"><th>Lote</th><th>Descrip</th><th>Color</th><th>Cantidad</th><th>Precio Cat</th><th>Precio Venta</th><th>Subtotal</th><th>Mayorista</th><th>Urgente</th><th>Obs</th><th></th></tr>\n\
                        </table>\n\
                    </td>\n\
                </tr></table>';

                $("#solicitudes").append(html);
                
               
                activarEstados();
                procesar(Nro,sucd);

            }
        });
    }else{
        alert("Seleccione al menos un articulo para identificar la sucursal.");
    }
}


 

function buscarLotes(){
    //$("#ui_lotes").fadeOut();
    //$("[readonly], .editable:not(select):not(input#lote):not(input#color)").val(""); // Limpiar Área de Carga
    var codigo = $("#codigo").val();
    var color = $("#color").val(); 
    var cantidad = $("#cantidad").val();
    var moneda = $("#moneda").val();
    var um = $("#um").val();
    var sucDestino = $("#suc").val();
    var tipo_busqueda = $('input:radio[name=tipo_busqueda]:checked').val(); 
    var categoria = $("#categoria").val();
    var disponibles = $("#disponibles").is(":checked");
    
    var images_url = $("#images_url").val();
    
    var precios_editables = !$("#tipo_normal_cliente").is(":checked");
     
     
    if(tipo_busqueda === "insumos"){
        color = "%";
        categoria = 1;
    }
    var articulos_lote = $("#articulos_lote").val();
    
    if(articulos_lote === "lote"){
        codigo = $.trim($("#descrip").val());
    }
    
    $("#precio_venta").val("");
    fila_art = 0;
    if(codigo.length > 0  ){
    $.ajax({
        type: "POST",
        url: "pedidos/SolicitudTrasladoMobile.class.php",
        data: {"action": "buscarLotes", "codigo": codigo,"color":color,"cantidad":cantidad ,suc:sucDestino,cat:categoria,disponibles:disponibles,tipo_busqueda:tipo_busqueda,moneda:moneda,um:um,articulos_lote:articulos_lote,usuario:getNick()},
        async: true,
        dataType: "json",
        beforeSend: function() {
            limpiarListaArticulos();
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#result").removeClass("error");
            $("#result").addClass("info");
            $("#add_code").attr("disabled",true);   
            $("#result").html("Buscando...");
        },
        success: function(data) { 
            
            if(data.length > 0){
                var   solo_disponibles = $("#disponibles").is(":checked");
                var k = 0;
                
                var mi_suc = getSuc();
                
                cant_articulos = 0;
                for(var i in data){        
                    k++;
                    var ItemCode = data[i].codigo;
                    var Descrip = data[i].descrip;
                    var Lote = data[i].lote;                      
                    var Color = data[i].color;
                    var Design = data[i].design;
                    var fab_color_cod = data[i].cod_catalogo+"-"+data[i].color_cod_fabric; 
                    var Stock =  parseFloat(  (data[i].cantidad) ).format(2, 3, '.', ',');   
                    var Stock_nf =    data[i].cantidad  ;   
                    var Disponible = parseFloat(  (data[i].cantidad) ).format(2, 3, '.', ',');   
                     
                    
                    var precio = parseFloat( data[i].precio );
                    var descuento = parseFloat( data[i].descuento );
                    if(isNaN(descuento)){
                        descuento = 0;
                    }
                    var PrecioCat  =  parseFloat(  precio -  descuento ).format(0, 3, '.', ',');   
                    
                    var hash = "hash_"+ hashCode(Color+"-"+Design+"-"+fab_color_cod);
                   
                    var PrecioCosto =  parseFloat (data[i].costo_prom); 
                    //var Ancho = data[i].ancho;
                    var Suc = data[i].suc;
                    var img = data[i].img;
                    var imageTitle = "";
                    //var doc = data[i].doc.doc?data[i].doc.doc:'Libre';
                    var doc = data[i].doc;
                    if(img !== ""){  
                        imageTitle = "title='"+img+"'";
                    }
                    var porc_valor_minimo = parseFloat($("#porc_valor_minimo").val());
                    var PrecioMinimo = PrecioCosto + ((PrecioCosto + porc_valor_minimo) / 100 );
                     
                    var info = ""; 
                    var container ="";
                    var cant_pedir = Disponible;    
                    if( doc.length > 0  ){
                        container = "<div class='info_docs info_"+Lote+"'> <table class='info_table'  border='1'>";
                        container+="<tr class='titulo' ><th>Tipo</th><th>Nro</th><th>Usuario</th><th>Fecha</th><th>Suc</th><th>Cant.</th><th>Estado</th></tr>";
                        var suma = 0;
                        for(var j = 0; j < doc.length; j++){
                            var nro = doc[j].Nro;
                            var td = doc[j].TipoDocumento;
                            var usuario = doc[j].usuario;                            
                            var fecha = doc[j].fecha;
                            var suc = doc[j].suc;                            
                            var comp = parseFloat(doc[j].cantidad);
                            var estado = doc[j].estado;
                            suma+=0+comp;
                            container+="<tr><td class='item'>"+td+"</td><td class='item'>"+nro+"</td><td class='itemc'>"+usuario+"</td><td class='itemc'>"+fecha+"</td><td class='itemc'>"+suc+"</td><td class='num'>"+comp+"</td><td class='itemc'>"+estado+"</td></tr>"; 
                        }
                        container+="</table></div>";
                        Disponible =  parseFloat(  Stock_nf - suma ).format(2, 3, '.', ',');   
                        cant_pedir = Disponible;
                        info = "<img src='img/info.png' style='cursor:pointer;width:22px' onclick='showInfo("+Lote+")'>"+container;
                    } 
                     
                     
                    var checkbox = "";
                    var disponible_clean =  parseFloat(Disponible.replace(/\./g,"").replace(",",".")); 
                    var disp = 'Libre';
                    if(disponible_clean > 0){
                        checkbox = "<input id='check_"+i+"' type='checkbox' class='check "+Suc+"' >";    
                    }else{
                        disp = '';
                    } 
                    var clase_disponible = 'disponible';
                     
                    if(solo_disponibles && disponible_clean <= cantidad){
                        clase_disponible = 'no_disponible';
                    }
                    
                    if(Suc === mi_suc && mi_suc != "00"){
                        disp = "En_"+Suc;
                        info = "<label style='font-weight:bolder;color:red'>En: "+Suc+"</label>";
                        checkbox = "";
                    }
                    
                    var tr = $("<tr/>",{
                        "class":"tr_art_data_lote fila_lote_"+i+" "+clase_disponible+" "+disp,
                        "data-codigo":ItemCode, 
                        "data-descrip":Descrip, 
                        "data-stock":Stock, 
                        "data-stock_nf":Stock_nf,
                        "data-img":img,
                        "data-precio":PrecioCat,
                        "data-precio_minimo":PrecioMinimo,
                        "id":"tr_"+i
                    });
                    //console.log(td_doc);
                    var readonly_code = "";
                    if(precios_editables){
                        readonly_code = "readonly='readonly'";
                    }
                    
                    
                    tr.append("<td class='item clicable_lote'><span class='codigo lote' >"+Lote+"</span> "+checkbox+" </td> \n\
                    <td class='item Color clicable_lote' "+imageTitle+" >"+Color+"</td>\n\
                    <td class='item design' >"+Design+"</td>\n\
                    <td class='item fab_color_cod' >"+fab_color_cod+"</td>\n\
                    <td class='itemc suc'>"+Suc+"</td>\n\
                    <td class='img itemc'><img class='imagen_design' src='"+images_url+"/"+img+".thum.jpg' ></td>\n\
                    <td class='num stock'>"+Stock+"</td>\n\
                    <td class='num disponib_"+i+"'>"+Disponible+"</td>\n\
                    <td class='item'><input type='text' class='pedir_"+i+" add_carrito' value='"+cant_pedir+"' maxlength='12'> </td>\n\
                    <td class='precio_cat_"+i+" num' >"+PrecioCat+"</td>\n\
                    <td class='item'><input type='text' class='precio_venta_"+i+" precio_categ "+hash+"' value='"+PrecioCat+"' data-hash='"+hash+"' data-precio_minimo='"+PrecioMinimo+"' "+readonly_code+" maxlength='12'> </td>\n\
                    <td class='itemc td_"+Lote+"' >"+info+"</td>");
                    
                    //tr.append(td_doc);
                    $("#lista_lotes").append(tr);                                                      
                    cant_articulos = k;
                }  
                inicializarCursores("clicable_lote"); 
                $("#ui_lotes").fadeIn();
                $("tr.tr_art_data_lote.Libre").click(function(){                     
                    
                    var fila = $(this).attr("id").substring(3,20);
                    if($("#check_"+fila).is(":checked")){
                       $("#check_"+fila).prop("checked",false);
                    }else{
                       $("#check_"+fila).prop("checked",true);                     
                    }                    
                    resaltar();
                    selectRowLote($(this).attr("id").substring(3,20));
                    //seleccionarArticulo(this); 
                });
                $(".add_carrito").change(function(){
                    var v = $(this).val();
                    $(this).val(v.replace(/\./g,","));
                    var identif = $(this).attr("class").split(" ")[0].substring(6,20);
                    var disponible = parseFloat($(".disponib_"+identif).text().replace(/\./g,"").replace(",",".")); 
  
                    if(isNaN(v) || v > disponible ){                       
                        $(this).val($(".disponib_"+identif).text());
                    } 
                    $("#check_"+identif).prop("checked",true);
                    resaltar();
                });
                $(".add_carrito").click(function(){
                   $(this).select(); 
                });
                $(".precio_categ").change(function(){
                    var precio_venta = $(this).val().replace(/\./g,"").replace(/\./g,",");
                    var identif = $(this).attr("class").split(" ")[0].substring(13,25);
                    var precio_cat  = parseFloat($(".precio_cat_"+identif).text().replace(/\./g,"").replace(",",".")); 
                    //var precio_minimo_venta = parseFloat($(this).attr("data-precio_minimo").replace(/\./g,"").replace(",","."));  // 05-08-2020 Ricardo: Si es menor al de la categoria dejar pendiente
                    
                    if(isNaN(precio_venta)){                        
                        $(this).val(precio_cat);
                         errorMsg("Ingrese un precio valido",8000); 
                    }else{
                        if($("#change_all").is(":checked")){
                           var hash = $(this).attr("data-hash");
                           $("."+hash).val(precio_venta); 
                        }
                    }
                    if( precio_venta < precio_cat ){                       
                       infoMsg("Pedido quedara pendiente de aprobacion por precios mas bajos de su categoria...",15000); 
                    }  
                });
                
                $("#msg").html(""); 
                $("#result").html(cant_articulos +" coincidencias...");
                //selectRowLote($(".Libre").first().attr("id").substring(3,20));// Primero Libre
                selectRowLote(0);
                acomodarListaLotes();
            }else{
                limpiarListaArticulos();
                $("#msg").html(""); 
                $("#result").removeClass("info");
                $("#result").addClass("error");
                $("#result").html("0 coincidencias...");
            }
        }
    });
    }
}

function showOnlyDisponibles(){
   var disp = $("#disponibles").is(":checked");
   if(disp){
      $(".no_disponible").slideUp();
   }else{
      $(".no_disponible").slideDown(); 
   }
       
}
function showInfo(lote){
    $(".info_"+lote+"").slideToggle(); 
    var pos = $(".td_"+lote+"").offset();
    var h = $(".td_"+lote+"").height();
    $(".info_"+lote+"").offset({top:pos.top + h,left:pos.left - 180});
}

function acomodarListaLotes(){
    $(".lotes_head").width( $(".lotes_sub_head").width() );    
}

function resaltar(){
    var suma = 0;
    $(".check").each(function(){   
        var id = $(this).attr("id").substring(6,26); 
        if($(this).is(":checked")){
           $("#tr_"+id).addClass("checked");
           var pedir = parseFloat($(".pedir_"+id).val().replace(",","."));
           suma+=pedir;
        }else{
           $("#tr_"+id).removeClass("checked");      
        }              
   }); 
   $("#seleccionados").val(suma.toFixed(1));
   if(suma > 0){
       $("#add_code").removeAttr("disabled");  
       listarSucs(); 
    }else{
       $("#add_code").attr("disabled",true); 
       $("#result").removeClass("info_sucs");
    }
}

function selectItem(){
  
  var pedido = parseFloat($("#requeridos").val().replace(".","").replace(",","."));
   
   var actual = 0; 
   if($("#autoselect").is(":checked")){
      $(".check").each(function(){
           $(this).prop("checked",false);
      });      
      $(".check").each(function(){
            var id = $(this).attr("id").substring(6,26);            
            var stock = parseFloat($(".fila_lote_"+id).attr("data-stock_nf"));
            if(actual < pedido){
               actual+=stock;
               $(this).prop("checked",true);
            } 
      });
      resaltar();
   }    
}

function limpiarListaArticulos(){  
    $(".tr_art_data_lote").remove();
}
function seleccionar(){
    $(".art_selected").click();
}

function hashCode(string) {                   
    var hash = 0;
    if (string.length == 0) return hash; 
    for (i = 0; i < string.length; i++) { 
        char = string.charCodeAt(i); 
        hash = ((hash << 5) - hash) + char; 
        hash = hash & hash; 
    } 
    return Math.abs(hash); 
} 
 
function sumSubtotal(){
    $("table.solicitud_abierta").each(function(){
        var sumSubtotal = 0;
        $(this).find("td.subtotal").each(function(){
            sumSubtotal += parseFloat($(this).text());
        });
        $(this).find("td.sumSubtotal").text(sumSubtotal.toFixed(2));
    });      
}
function cargarImagenLote(img){  
    
    //var img = $("#"+lote).attr("data-img");
    
    $("#image_container").html("");
    var images_url = $("#images_url").val();
    
    var cab = '<div style="width: 500px;text-align: center;background: white">\n\
     <div style="width:100%;background: white;">   <img src="img/substract.png" style="margin-top:-4px"> <input id="zoom_range" onchange="zoomImage()" type="range" name="points"  min="60" max="1000"><img src="img/add.png" style="margin-top:-4px;"></div>\n\
     <div style="float:left;width:10%;background: white;">  <img src="img/close.png" style=margin-top:-20px;margin-left:2px" onclick=javascript:$("#image_container").fadeOut()> </div> </div>';
    
    $("#image_container").fadeIn();
    
    var contw = $("#image_container").width();
    
    var width = $(window).width() ; 
    var top = 100;
     
    $("#image_container").offset({left:30,top:top});
    var path = images_url+"/"+img+".jpg";
    
    var imghtml = '<img src="'+ path +'" id="img_zoom" onclick=javascript:$("#image_container").fadeOut() width="500" >';
    $("#image_container").html( cab +" "+ imghtml);
    $("#image_container").draggable();  
}
function zoomImage(){
    var w = $("#zoom_range").val();    
    $("#image_container").width(w);
    $("#img_zoom").width(w);    
}
 
function seleccionarAbajo(){
   (fila_art == cant_articulos-1) ? fila_art = 0 : fila_art++;  
    selectRowLote(fila_art);  
}
function seleccionarArriba(){
   (fila_art == 0) ? fila_art = cant_articulos-1 : fila_art--;       
    selectRowLote(fila_art);
}
function selectRowLote(row) {
    var images_url = $("#images_url").val();
    $(".art_selected").removeClass("art_selected");
    $(".fila_lote_" + row).addClass("art_selected");
    $(".cursor").remove();
    $($(".fila_lote_" + row + " td").get(2)).append("<img class='cursor' src='img/l_arrow.png' width='18px' height='10px'>");
    var img = $(".fila_lote_" + row).attr("data-img");
    if(img != "" && img != undefined){
        $("#img_td").html("<span id='img' class='zoom'><img src='"+images_url+"/"+img+".thum.jpg'  class='imagen_design' style='border: solid gray 1px;margin:4px 0 4px 15px;width:160px;height:120px'></span>");
          
       $("#img_td").click(function(){ cargarImagenLote(img);}); 
       //$("#img").zoom({url: images_url+"/"+img+".jpg"});
    }else{
        $("#img_td").html("<span id='img' class='zoom'><img src='img/no-image.png' class='imagen_design' style='border: solid gray 1px;margin:4px 0 4px 15px;width:160px;height:120px'></span>");
        $("#img").trigger('zoom.destroy'); // remove zoom
    }
    escribiendo = false;  
    
    //buscarUltimoPrecioVenta();
} 
function buscarUltimoPrecioVenta(){
    var codigo = $("#codigo").val();
    var cod_cli = $("#codigo_cliente").val();
    $.ajax({
        type: "POST",
        url: "pedidos/SolicitudTrasladoMobile.class.php",
        data: {"action": "getPrecioVentaAnterior", codigo: codigo,cod_cli:cod_cli},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            for (var i in data) { 
                var precio = data[i].precio;
                $("#precio_venta").val(precio); 
            }   
            $("#msg").html(""); 
        }
    });
}

function setDefaultDataNextFlag(){
    data_next_time_flag = true;
}
 

function checkear(){
              
        $(".solicitud_abierta_cab").each(function(){
            var destino = $(this).attr("data-destino"); 
            var nro = $(this).attr("data-nro");
            var codigo_cliente = $(this).find(".cod_cli").html();
             
            if(cod_cli != codigo_cliente){
                 $(this).fadeOut();
            }else{            
                if(destino == sucp  && cod_cli ==  codigo_cliente ){  // Controlar codigo de cliente                    
                   encontro = true; 
                   $(this).fadeIn(); 
                   nro_nota = nro;
                }else{
                   $(this).fadeOut(); 
                }
            }
        });
         
       //generarSolicitudTraslado();
           
}
function borrarLote(lote,nro){
    var c = confirm("Esta seguro de que desea eliminar este Articulo?");
    if(c){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "borrarLoteDeSolicitudTraslado", nro_nota: nro, lote:lote},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >");                      
        },
        complete: function(objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);
                if(result == "Ok"){
                    $(".lote_"+lote).parent().remove();
                    $("#msg").html(result);
                    sumSubtotal();
                }else{
                    $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
                }
            }
            controlarVacias();
        },
        error: function() {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });   
   }
   sumSubtotal();  
}
function enviarSolicitud(nro){
    var cont = parseInt($(".fila_"+nro).length);
    
    if(cont > 0 ){   
    
        var estado = 'Pendiente'; //Default

        var pendientes = $(".pend_"+nro).length;

        var pend_flag = true;

        if(pendientes > 0){
            pend_flag = false;
            estado = 'Req.Auth';
            var conf = confirm("Este pedido tiene precios mas bajos de que la categoria del cliente \nSi continua quedara pendiente de aprobacion por un superior\n[Aceptar] para enviar el pedido,   [Cancelar] para modificar los precios");
            if(conf === true){
                pend_flag = true;
            } 
        } 
    
        if(pend_flag){
            var destino = $(".destino_"+nro).html();
            
            var c = confirm("Confirma enviar esta solicitud?");
            if(c){
                $.ajax({
                    type: "POST",
                    url: "pedidos/SolicitudTrasladoMobile.class.php",
                    data: {"action": "cambiarEstadoSolicitudTraslado", usuario: getNick(), nro: nro,estado:estado},
                    async: true,
                    dataType: "html",
                    beforeSend: function() {
                        $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >");                      
                    },
                    complete: function(objeto, exito) {
                        if (exito == "success") {                          
                            var result = $.trim(objeto.responseText);     
                            $(".solicitud_"+nro).slideUp();
                            $(".solicitud_"+nro).remove();
                            $("#msg").html(result);
                            if( estado == 'Req.Auth' ){
                                enviarNotificacionTelegram(nro);
                            }
                            if(estado !== 'Req.Auth' && destino == "00"){
                                enviarNotificacionTelegramPickers(nro);
                            }
                        }
                    },
                    error: function() {
                        $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
                    }
                });   
           }

        }
    }else{
        alert("Debe cargar almenos 1 Articulo para enviar la Solicitud.");
    }
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

function enviarNotificacionTelegram(nro){
    
    var usuario = getNick();
    var saludo = getSaludo();
    
    var msg = "<b>Hay una nuevo Pedido que requiere su Aprobacion! </b>Usuario: <i><b>"+usuario+"</b></i>,  <b>Pedido Nro:</b>  "+nro+". Para acceder al sistema desde internet haga click <a href='http://www.inmopy.com/sistema'>Aqui</a> Si esta dentro de la Red de Marijoa haga click <a href='http://192.168.2.222'>Aqui</a> posteriormente dirijase a <i>Ventas-->Notas de Pedido --> Solicitudes Pendientes de Autorizacion</i>         "+saludo;
    
    $.ajax({
        type: "POST",
        url: "utils/telegram/Telegram.class.php",
        data: {action: "enviarMensajeGerencia", msg: msg},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#result").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            if (data.ok === true) {
                $("#result").html("Ok notificacion de Telegram enviada"); 
            } else {
                console.log("data.ok  "+data.ok);
                $("#result").html("<br>Error al enviar notificacion a Telegram");   
            }                
        },
        error: function (e) {                 
            $("#result").html("Error al enviar notificacion a Telegram:  " + e);   
            errorMsg("Error al enviar notificacion a Telegram:  " + e, 10000);
        }
    }); 
}

function enviarNotificacionTelegramPickers(nro){
    
    var usuario = getNick();
    var saludo = getSaludo();
    var suc = getSuc();
    var cod_cli =$("#codigo_cliente").val();
    
    var add_cli = "";
    if(cod_cli !== "C000018" ){
        var cliente   =$("#nombre_cliente").val(); 
        add_cli = " para Cliente: "+cliente+" ";
    }
    
    var msg = "<b>Hay una nuevo Pedido "+add_cli+" </b> de <b>Suc.:</b> "+suc+" Usuario: <i><b>"+usuario+"</b></i>, <b>Pedido Nro:</b>  "+nro+".    Para acceder al sistema haga click <a href='http://192.168.2.222'>Aqui</a>  "+saludo;
    
    $.ajax({
        type: "POST",
        url: "utils/telegram/Telegram.class.php",
        data: {action: "enviarMensajePickers", msg: msg},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#result").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            if (data.ok === true) {
                $("#result").html("Ok notificacion de Telegram enviada"); 
            } else {
                console.log("data.ok  "+data.ok);
                $("#result").html("<br>Error al enviar notificacion a Telegram");   
            }                
        },
        error: function (e) {                 
            $("#result").html("Error al enviar notificacion a Telegram:  " + e);   
            errorMsg("Error al enviar notificacion a Telegram:  " + e, 10000);
        }
    }); 
}

function mostrarTodo() {
   getSolicitudesAbiertasXMoneda();  
}
function mostrarResultados() {
    if( $(".tr_art_data").length>0 ){
        $("#ui_lotes").fadeOut();
         var articulos_lote = $("#articulos_lote").val();
        if(articulos_lote === "articulos"){
           $("#ui_articulos").fadeIn();
        }
    }
}
function ocultarResultados() {    
    $("#ui_lotes").fadeOut();    
}

function  historial(){
    var lote = $("#lote").val();
    var suc = $("#suc").val();     
    var url = "productos/HistorialMovimiento.class.php?lote="+lote+"&suc="+suc+"";
    var title = "Historial de Movimiento de Lote";
    var params = "width=980,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    
    if(!ventana){        
        ventana = window.open(url,title,params);
    }else{
        ventana.close();
        ventana = window.open(url,title,params);
    }  
}

var ping_time = 0;

var timeout = null;
var check_flag = true;

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
};

function comprobanteTermico(nro){
    
    var params = "width=400,height=400,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    var url = "https://190.128.150.70/inmopy/pedidos/ImpresorComprobanteTermico.class.php?nro="+nro+"";
    var title = "Comprobante de Pedido";
    if(!printing){        
        printing = window.open(url,title,params);
    }else{
        printing.close();
        printing = window.open(url,title,params);
    } 
}

function cerrar(){
   $("#ui_clientes").fadeOut();
}


function buscarArticulo(){
    var articulo = $("#descrip").val();
    var cat = $("#categoria").val();
    var articulos_lote =   $("#articulos_lote").val(); 
    if(articulos_lote == "articulo"){
    fila_art = 0;
    if(articulo.length > 0){
        var filtro = "";
        var tipo = $("input[name='tipo_busqueda']:checked").val();
        if(tipo === "insumos"){
            filtro = " AND a.cod_sector in(106) ";
        }else{
            filtro = " AND a.cod_sector not in(106) ";
        }
        
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "buscarArticulos", "articulo": articulo,"cat":cat,filtro:filtro},
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function(data) { 
            
            if(data.length > 0){
                //limpiarListaArticulos();
                $(".tr_art_data").remove();
                var k = 0;
                for(var i in data){        
                    k++;
                    var codigo =  (data[i].codigo).toString().toUpperCase(); 
                    var descrip = data[i].descrip; 
                    var sector = data[i].sector; 
                    var composicion = data[i].composicion; 
                    var um = data[i].um; 
                    var Precio =  parseFloat(  (data[i].precio) ).format(0, 3, '.', ',');
                                                                
                    $("#lista_articulos") .append("<tr class='tr_art_data fila_art_"+i+"'   data-precio="+Precio+" data-um="+um+" data-sector='"+sector+"' data-composicion='"+composicion+"'><td class='item clicable_art'><span class='codigo' >"+codigo+"</span></td>\n\
                    </td><td class='item clicable_art'><span class='descrip'>"+descrip+"</span></td>  <td class='num clicable_art'>"+Precio+"</td> </tr>");
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
    }else{
       $("#ui_articulos").fadeOut();
    }
} 
function cambiarFormaBusqueda(){
    var articulos_lote =   $("#articulos_lote").val(); 
    if(articulos_lote == "lote"){
       $("#ui_articulos").fadeOut();
    }
}

function setDefaultDataNextFlag(){
    data_next_time_flag = true;
}

function triggerUp(){
    (fila_art == 0) ? fila_art = cant_articulos-1 : fila_art--;
     selectRowArt(fila_art);
}
function triggerDown(){
    (fila_art == cant_articulos-1) ? fila_art = 0 : fila_art++;
    selectRowArt(fila_art);
}

function setHotKeyArticulo(){
     
    $("#descrip").keydown(function(e) {
        
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
    $("#descrip").on("focus",function(){
       $(this).select(); 
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
    var composicion = $(obj).attr("data-composicion"); 
    var descrip = $(obj).find(".descrip").html();  
    var precio = $(obj).attr("data-precio");
    var um = $(obj).attr("data-um");
    var largo = $(obj).attr("data-largo"); 
    $("#codigo").val(codigo);
    $("#codigo").attr("data-sector",sector); 
    $("#codigo").attr("data-composicion",composicion); 
    $("#codigo").attr("data-descrip",descrip); 
    $("#descrip").val(descrip);
    $("#um").val(um);
    $("#largo").val(largo);
    $("#ui_articulos").fadeOut(); 
    $("#design").val("");
    $("#img_design").html("<img src='img/0.jpg' height='60'>");
    $("#cantidad").focus();
    $("#cantidad").select(); 
    if(um == "Unid"){
        $("#um_requerido").html("Unid. Requeridas:");
    }else{
        $("#um_requerido").html(um+" Requeridos:");
    }
    checkPreciosXMoneda();
    buscarSucursales();
}
function fijarSuc(){
    $("#sucObjetivo").prop('disabled', function () {
        return ! $(this).prop('disabled');
    });
    var obj = $("#sucObjetivo").val();
    setCookie("sucObjetivo", obj, 365);
}

function buscarSucursales(){
    var codigo = $("#codigo").val();
    var term = $("#term").val();
    var cantidad = $("#cantidad").val(); 
    if(isNaN(cantidad)){
        $("#cantidad").val("0"); 
        cantidad = 0;
    }
    var suc_destino = $("#sucObjetivo").val();     
    
    if(codigo !== ""){
    $.ajax({
        type: "POST",
        url: "pedidos/SolicitudTrasladoMobile.class.php",
        data: {action: "buscarSucursales", codigo: codigo, term: term,cantidad:cantidad,suc_destino:suc_destino},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            var um = $("#um").val();
            $("#suc").html("");
           
            if (data.length > 0) {      
                $("#suc").append("<option value='%'>Todas</option>");
                $("#suc").append("<optgroup label='Suc    -    Piezas    -    Total "+um+"'>");
                
                for(var i in data){
                   var suc = data[i].suc; 
                   var piezas = data[i].piezas; 
                   var total = parseFloat(data[i].total).format(1, 3, '.', ','); 
                   $("#suc").append("<option value='"+suc+"'>"+suc+"&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp; "+piezas+"&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;"+total+" "+um+" </option>");   
                }      
                $("#suc").append("</optgroup>");
                $("#msg").html("Ok"); 
                $("#suc").val($("#sucObjetivo").val());
                buscarColores();
            } else {
                $("#msg").html("No hay piezas con stock > "+cantidad);   
            }                
        },
        error: function (e) {                 
            $("#msg").html("Error al obtener sucursales:  " + e);   
            errorMsg("Error al obtener sucursales:  " + e, 10000);
        }
    }); 
    }
}

function buscarColores(){
    var codigo = $("#codigo").val(); 
    var cantidad = $("#cantidad").val();
    var suc = $("#suc").val();
    var design = $("#designs").val();
    var suc_destino = $("#sucObjetivo").val();
    if(!$("#fijar_suc").is(":checked")){
        suc_destino = $("#suc").val();
    }
    if(codigo != ""){
        $.ajax({
            type: "POST",
            url: "pedidos/SolicitudTrasladoMobile.class.php",
            data: {action: "buscarColores", codigo: codigo,  cantidad:cantidad,suc:suc,design:design,suc_destino:suc_destino},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                var um = $("#um").val();
                $("#color").html("");

                if (data.length > 0) {      
                    $("#color").append("<option value='%'>Todos</option>"); 
                    $("#color").append("<optgroup label='Color    -    Piezas    -    Total "+um+"'>");
                    for(var i in data){
                       var pantone = data[i].pantone;  
                       var color = data[i].color;  
                       var piezas = data[i].piezas;  
                       var total = data[i].total;  
                       $("#color").append("<option value='"+pantone+"'>"+color+"&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp; "+piezas+"&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;"+total+" "+um+" </option>");   
                    }      
                    $("#color").append("</optgroup>");
                    $("#msg").html("Ok"); 
                } else {
                    $("#msg").html("Error al obtener colores:  ");   
                }                
            },
            error: function (e) {                 
                $("#msg").html("Error al obtener colores:  " + e);   
                errorMsg("Error al obtener colores:  " + e, 10000);
            }
        });         
    }
}
