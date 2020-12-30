/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var checked = $('input[name=radio_estado]:checked').val();
var estado = "Abierto";
var setDatePickers = false;

var catalogos_seleccionados = 0;
var pedidos_seleccionados = 0;
var users_fullnames = [];
var printing;
var imagen;

$(function(){
   $(".fecha").removeClass('hasDatepicker'); 
   $(".form").draggable();
   $("#cant_filter").keyup(function (e) {
        if (e.keyCode === 13) {
            buscarLotes();
        }
   });  
   $(".rango").each(function(){
       var v = $(this).val();
       var nro = $(this).attr("data-nro");   
       $(".etiq_"+nro+"_"+v).addClass("porc");
       if(v > 50){
         $(".print_"+nro).fadeIn();
       }else{
         $(".print_"+nro).fadeOut();
       }
   });
   $(".selectable").click(function(){
       if($(this).hasClass("selected_for_print")){
           $(this).removeClass("selected_for_print");
       }else{
           $(this).addClass("selected_for_print");
       }
   });
   $("#image_container").draggable();
   $("#image_container").click(function() { $(this).fadeOut() });
   
   $(".stock_real").change(function(){
       var nro = $(this).attr("data-nro");
       var lote = $(this).attr("data-lote");
       var stock_real = parseFloat($(this).val().replace(",","."));
       var stock  = parseFloat($("#stock_"+nro+"_"+lote).html().replace(",","."));
       var max = (stock * 50 / 100) + stock;
       if(stock_real > max){
           alert("Ajuste incorrecto, para ajustes positivos utilice la herramienta de Ajustes");
       }else{
           ajustar(nro,lote,stock,stock_real);
       }
   });
   //setAnchorTitle();
});
function ajustar(nro,lote,stock,stockreal){
   var codigo = $(".codigo_"+nro).html();
   var ajuste =  parseFloat((stockreal - stock).format(2, 30, '', '.'));   
   var suc = getSuc();   
   var signo = "+";
   var final = 0;
   var ajuste_pos = ajuste;
   
   if(ajuste < 0){  
       signo = "-"; 
       ajuste_pos = ajuste_pos * -1;
   } 
   final = stock + ajuste;   
    
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "registarAjuste", codigo: codigo,lote:lote,stock:stock,ajuste:ajuste_pos,final:final,signo:signo,suc:suc,oper:"Disminucion en Inventario",motivo:"Fabrica de Muestras",um:"Mts",usuario:getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_"+nro+"_"+lote).html("<img src='img/loading_fast.gif' width='18px' height='18px' >"); 
        },
        success: function (data) { 
            if(data.estado == 'Ok'){
               $("#msg_"+nro+"_"+lote).html("Ok");  
            }else{                
                $("#msg_"+nro+"_"+lote).html(data.info);
                errorMsg("Atencion! "+data.info,30000);
            }
           
        }
    });    
    
}
function showImage(lote) {
    var img = $(".fila_" + lote).attr("data-image");
    
    if (img.length > 2 ) {
        var image_path = $("#images_url").val();
        var image_url = image_path + "/" + img + ".thum.jpg";
        $("#image_container").html("<img src='" + image_url + "' width='200px' alt=''>");
        $("#image_container").fadeIn();
        var w = $($(".fila_" + lote + " td").get(1)).width();
        var h = $($(".fila_" + lote + " td").get(1)).height();
        var pos = $($(".fila_" + lote + " td").get(1)).position();
        var left = pos.left;
        var top = pos.top + h ;
        var izq = (left + w) ;
        $("#image_container").css({ top: top, left: izq });
    }
}
function verImagen(lote){
  var img = $(".fila_" + lote).attr("data-image");
  
   if (img.length > 2 ) {
      var image_path = $("#images_url").val();
      var url = image_path + "/" + img + ".jpg";
      
       
      var title = "Imagen asociada al Lote";
      var params = "width=980,height=600,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";    
      if(!imagen){        
          imagen = window.open(url,title,params);
      }else{
         imagen.close();
         imagen = window.open(url,title,params);
      }  
   }
}
function configurar(){
     configurarCatalogo();
}

function mostrarPedido(estado) {
    if (checked !== estado) {
        load("produccion/PedidosDeMuestra.class.php?estado=" + estado, { usuario: getNick(), session: (getCookie(getNick()).sesion), suc: getSuc() }, function() {
            configurarCatalogo();
        });
        checked = estado;
    }
}
function configurarCatalogo() { 
    //inicializarCursores("clicable");
    $(".clicable").click(function() {        
        var nro_pedido = $(this).parent().data("nro_pedido");
        editarCatalogo(nro_pedido);
    });
    
    estado = $("#estado").val();
 
    $("#lista_invoices").DataTable({
        "language": {
            "lengthMenu": "Mostrando _MENU_ registros por pagina",
            "zeroRecords": "Ningun registro.",
            "info": "Mostrando _PAGE_ de _PAGES_ paginas",
            "infoEmpty": "No hay registros.",
            "infoFiltered": "(filtrado entre _MAX_ registros)",
            "sSearch": "Buscar",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Ultimo",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            }
        }
    });   
}
 

function nuevoCatalogo(){         
    $("#nuevo_catalogo").slideDown(function (){
        var es = ($(document).width() / 2 ) - $("#nuevo_catalogo").width() / 2; 
        $("#nuevo_catalogo").offset({left:es,top:120}); 
    });
    
    $(".fecha").datepicker({ dateFormat: 'dd-mm-yy' });
    $(".fecha").mask("99-99-9999");
    $("select").height("22px");  
}

function editarCatalogo(nro){
    $(".extra").fadeOut();   
    $("#cat_nro").val(nro);
    
    var cliente = $("#nro_"+nro).find(".cliente").html();
    var usuario = $("#nro_"+nro).find(".usuario").html();
    var fecha_entrega = $("#nro_"+nro).find(".fecha_entrega").html();    
    var medida = $("#nro_"+nro).find(".medida").html();
    var codigo = $("#nro_"+nro).find(".codigo").html();
    var articulo = $("#nro_"+nro).find(".articulo").html();
    var cantidad = $("#nro_"+nro).find(".cantidad").html();
    var estado = $("#nro_"+nro).find(".estado").html();
    var obs = $("#nro_"+nro).find(".obs").html();
    var entregado_a = $("#nro_"+nro).attr("data-entregado_a");
    $("#cat_personal").html("");
    $("#nro_"+nro).attr("data-personal").split(",").forEach(addPersonal);
     
    
    $("#cat_cliente").val(cliente);
    $("#cat_fecha_ent").val(fecha_entrega);
    $("#cat_usuario").val(usuario);
    $("#cat_medida").val(medida);
    $("#cat_codigo").val(codigo);
    $("#cat_articulo").val(articulo);
    $("#cat_cantidad").val(cantidad);
    $("#cat_cliente").val(cliente);
    $("#cat_estado").val(estado);
    $("#cat_obs").val(obs);
    $("#cat_entregado_a").val(entregado_a);
    
    $("#cat_fecha_ent").mask("99-99-9999 99:99");
    
    //$("#edit_catalogo").offset({top:120,left:esq});
    //$("#edit_catalogo")
    $("#edit_catalogo").slideDown(function (){
        var es = ($(document).width() / 2 ) - $("#edit_catalogo").width() / 2; 
        $("#edit_catalogo").offset({left:es,top:120}); 
    });
    $("#boton_nuevo_catalogo").prop("disabled",true); 
    if($("#cat_estado").val() != "Cerrado"){
       $("#cerrar").fadeIn(); 
    }
    $(".fila_asign").remove();
    $(".tabla_pedido").remove();
    
    if(estado === "Cerrado"){
        $(".cerrada_no_display").remove();   
        $(".delete_per").remove();
        $("#cat_obs").prop("readonly",true);
        $("#cat_fecha_ent").prop("readonly",true);   
        $("#cat_entregado_a").prop("readonly",true);   
    }else if(estado === "Abierto"){ 
        $(".abierto_display_none").fadeOut();            
    }else{
        getPersonales();
    }
    
}
function getPersonales(){
      
      $.post("produccion/PedidosDeMuestra.class.php?", {action: "getPersonales" },function(data){
        for(var i in data){
            users_fullnames.push(data[i].user_fullname);
        }
        
        $("#cat_entregado_a").autocomplete({
            source: users_fullnames
        });
      },'json');
}

function crearPedidoCatalogo(){
    var cod_cli = $("#cliente").val();
    var cliente = $("#cliente option:selected").text();
    
    var codigo = $("#articulo").val();
    var articulo = $("#articulo option:selected").text();
    
    var medida = $("#medida").val();
    var cantidad = $("#cantidad").val();
    var fecha_ent = $("#fecha_entrega").val();
    var hora_ent = $("#hora_entrega").val();
    var obs = $("#obs").val();
    var mensaje = "";
    if( cod_cli == null){
        mensaje+="Debe elegir un cliente\n";        
    }
    if( codigo == null){
        mensaje+="Debe elegir un articulo\n";        
    }
    /*
    if( fecha_ent.length < 3){
        mensaje+="Debe ingresar la fecha de limite de entrega\n";        
    }
    if( hora_ent.length < 3){
        mensaje+="Debe ingresar la hora de limite de entrega\n";        
    }*/
    if(mensaje.length > 5 ){
        alert(mensaje);
        return;
    }else{
         
        $.ajax({
            type: "POST",
            url: "produccion/PedidosDeMuestra.class.php",
            data: {"action": "crearPedidoCatalogo",usuario:getNick(),suc:getSuc(), cod_cli: cod_cli,cliente:cliente,codigo:codigo,articulo:articulo,medida:medida,cantidad:cantidad,fecha_ent:fecha_ent,hora_ent:hora_ent,obs:obs},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                 
                var estado = data .estado;
                if(estado == "Ok"){
                    alert("El pedido de muestras ha sido creado con exito!");
                    mostrarPedido("Abierto");
                }else{
                   $("#msg").html("Error en la comunicacion con el Servidor, intente de nuevo!, si el problema persiste contacte con informatica"); 
                }    
                 
            }
        });
    } 
}

function cerrarFormCatalogo(){
    $(".form").slideUp();
    $("#boton_nuevo_catalogo").prop("disabled",false); 
}

function cerrarCatalogo(){
    var nro = $("#cat_nro").val();
    $("#msg_asign").html("Cerrando Catalogo espere...<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
    $.post("produccion/PedidosDeMuestra.class.php", {action: "cerrarCatalogo", nro: nro},function(data){
         $("#msg_asign").html("Catalogo cerrado."); 
         $("#radio_proc").click();
    },'json');
}
function save(){
    var nro = $("#cat_nro").val();
    var obs = $("#cat_obs").val();
    var entregado_a = $("#cat_entregado_a").val();
    var fecha_entrega = $("#cat_fecha_ent").val();
    $.post("produccion/PedidosDeMuestra.class.php", {action: "save", nro: nro, obs: obs,fecha_entrega:fecha_entrega,entregado_a:entregado_a});
}
function buscarCliente(){
    var criterio = $("#buscar_cliente").val();
    $.ajax({
        type: "POST",
        url: "produccion/PedidosdeMuestra.class.php",
        data: {"action": "buscarCliente", criterio: criterio},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) { 
            $("#cliente").html("");
            for (var i in data) { 
                var CardCode = data[i].cod_cli;
                var CardName = data[i].nombre;    
                $("#cliente").append('<option value="'+CardCode+'" >'+CardName+'</option>');
            }   
            $("#msg").html("");      
        }
    });
}
function agregarPersonal(){
    
    var p = $(".personal").text().replace(/ x/g,"','").replace(/ /g,"");
    var excluir = "'"+p.substring(0,p.length-2);  
    if(excluir === "'"){
        excluir = "'xYz'";//Truco mï¿½gico para indicar que traiga todos
    }
    
    $.ajax({
        type: "POST",
        url: "produccion/PedidosdeMuestra.class.php",
        data: {"action": "getPersonalMuestras", excluir:excluir},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
             $("#personal").html("");
            for (var i in data) { 
                var usuario = data[i].usuario;   
                appendToUl(usuario);             
            }  
            $("#div_personal").fadeIn();        
        }
    });
}
function appendToUl(usuario){    
       $("#personal").append("<li class='per_"+usuario+"' onclick=addPesonalAndSave('"+usuario+"')>"+usuario+"</li>");    
}
function addPersonal(usuario){    
    if(usuario.length > 1){
        $("#cat_personal").append("<span class='personal personal_"+usuario+"' onclick=selectPersonal('"+usuario+"') >"+usuario+"  <label class='delete_per' onclick=deletePersonal('"+usuario+"')   >x</label></span>");
        $(".per_"+usuario).remove();
    }
}
function addPesonalAndSave(usuario){
    addPersonal(usuario);
    guardarPersonales();
    setData();
}
function deletePersonal(usuario){
    $(".personal_"+usuario).remove();
    setData();
    guardarPersonales();
}
function setData(){
    var nro = $("#cat_nro").val();
    var p = $(".personal").text().replace(/ x/g,",");
    var pers = p.substring(0,p.length-1);
    $("#nro_"+nro).attr("data-personal",pers);
}
function buscarArticulo(){
    var criterio = $("#buscar_articulo").val();
    $.ajax({
        type: "POST",
        url: "produccion/PedidosdeMuestra.class.php",
        data: {"action": "buscarArticulo", criterio: criterio},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) { 
            $("#articulo").html("");
            for (var i in data) { 
                var ItemCode = data[i].codigo;
                var ItemName = data[i].descrip;    
                $("#articulo").append('<option value="'+ItemCode+'" >'+ItemName+'</option>');
            }   
            $("#msg").html("");      
        }
    });
}
function closePersonal(){
    $("#div_personal").slideUp();
} 
function guardarPersonales(){
   var nro = $("#cat_nro").val();
   var p = $(".personal").text().replace(/ x/g,",");
   var pers = p.substring(0,p.length-1);
    $.ajax({
        type: "POST",
        url: "produccion/PedidosdeMuestra.class.php",
        data: {"action": "guardarPersonales", "personales": pers, nro: nro},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);    
                $("#msg").html("");
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });  
}

function buscarLotes(){
    var codigo = $("#cat_codigo").val();
    var minimo = $("#cant_filter").val();
    var design_filter = $("#desing_filter").is(":checked");
    var cod_color_filter = $("#cod_color_filter").is(":checked");
    var filtro_codigo_color_fabrica = $("#filtro_codigo_color_fabrica").val()+"%";
    var lote_especifico = $("#lote_especifico").val();
    var only_sucs = $.trim($("#only_sucs").val());
    var sucs = only_sucs.split(",");
    
    var valid_sucs =  ["03","00","02","01","04","05","06","10","24","25","30"];
    
    for(var i =0; i < sucs.length;i++){
        if(valid_sucs.indexOf(sucs[i]) < 0 ){
            errorMsg("Ingrese una sucursal Valida! "+valid_sucs,10000);            
            return;
            break;
        }
    }
    
    sucs = JSON.stringify(sucs);
   
    $("#buscar").fadeOut();
    if(getSuc() !== '03'){
        alert("Debe estar en la Sucursal '03' ...");
    }else{
        $.ajax({
            type: "POST",
            url: "produccion/PedidosdeMuestra.class.php",
            data: {"action": "getLotesDisponibles", codigo: codigo,minimo:minimo,design_filter:design_filter,color_cod_filter:cod_color_filter,filtro_codigo_color_fabrica:filtro_codigo_color_fabrica,lote_especifico:lote_especifico,only_sucs:sucs},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg_asign").html("<b>Buscando en </b><label class='info'>"+sucs+"</label> <img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) { 
                $(".fila_disp").remove();
                if(data.length > 0){
                    for (var i in data) { 
                        var ItemCode = data[i].ItemCode;
                        var Pantone = data[i].Pantone;  
                        var Color = data[i].Color;    
                        var Design = data[i].Design;    
                        var FabColorCode = data[i].FabColorCode;    
                        var BatchNum = data[i].BatchNum;  
                        var Quantity = data[i].Quantity;
                        var WhsCode = data[i].WhsCode;   
                        var Image = data[i].Image;   
                        var Mts = data[i].Mts;   
                        var classe = "pedido";
                        var img = "<img src='img/truck.png' width='16' id='truck_"+BatchNum+"'  >";
                        
                        if( $(".lote_"+BatchNum ).length < 1){ // Solo agrego si no esta asignado                
                        
                            if(WhsCode == '03'){ 
                                classe = "catalogo";
                                img = "<img src='img/r_arrow.png' width='16' style='cursor:pointer' >";
                            }
                            $("#lotes_disponibles").append("<tr class='fila_disp fila_"+BatchNum+"' data-image="+Image+" ><td class='item lote' data-pantone='"+Pantone+"' data-codigo='"+ItemCode+"' onclick='verImagen("+BatchNum+")' >"+BatchNum+"</td><td class='item color'  onmouseover='showImage("+BatchNum+")'>"+Color+"</td><td class='item design'>"+Design+"</td><td class='item fab_color_cod'>"+FabColorCode+"</td><td class='num'>"+Quantity+"</td><td class='itemc suc'>"+WhsCode+"</td><td class='num' >"+Mts+"</td><td class='itemc' style='width:24px'>"+img+" </td>  <td class='itemc msg_"+BatchNum+"'><input class='check "+classe+" ' type='checkbox' onclick='enableTools()' > </td></tr>");
                        }
                    }  
                    $("#msg_asign").html(""); 
                }else{
                    $("#msg_asign").addClass("error");
                    $("#msg_asign").html("No hay colores con cantidad minima > a "+minimo+" mts."); 
                }
               $("#buscar").fadeIn(); 
            }
        });
    }
}


function selectPersonal(usuario){
    $(".selected").removeClass("selected");
    $(".personal_"+usuario).addClass("selected");
}

function asignarLotes(){
    var nro = $("#cat_nro").val();
    catalogos_seleccionados = $(".catalogo:checked").length;
    var selected = $(".selected").length;
    
    if(selected > 0){    
        var personal =  $(".selected").text().replace(" x","");
        $(".catalogo:checked").each(function(){
            //var codigo = $(this).parent().parent().attr("data-codigo");
            var lote = $(this).parent().parent().find(".lote").html();
            var pantone =$(this).parent().parent().attr("data-pantone");
            var color = $(this).parent().parent().find(".color").html();
            asignarLotesCatalogo(nro,lote,pantone,color,personal);
        });    
    }else{
        alert("Seleccione un Personal haciendo click en el Nombre");
    }
}
  
function asignarLotesCatalogo(nro,lote,pantone,color,personal){
    var encargado = getNick();
    $.ajax({
        type: "POST",
        url: "produccion/PedidosdeMuestra.class.php",
        data: {"action": "asignarLotes",nro:nro,lote:lote,pantone:pantone,color:color, "usuario": personal,encargado:encargado  },
        async: true,
        dataType: "html",
        beforeSend: function () {
            $(".msg_"+lote).html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);     
                if(result == "Ok"){
                    $(".fila_"+lote).remove();
                    catalogos_seleccionados--;
                }else{
                    $(".msg_"+lote).html("<img title='"+result+"' src='img/warning_red_16.png' width='16px' height='16px' >"); 
                }
                
            }else{
                $(".msg_"+lote).html("<img title='Error en la comunicacion con el Servidor' src='img/warning_red_16.png' width='16px' height='16px' >"); 
            }
            if(catalogos_seleccionados == 0){
                verLotesAsignados();
                enableTools();
            }    
        },
        error: function () {
            $(".msg_"+lote).html("<img title='Error en la comunicacion con el Servidor' src='img/warning_red_16.png' width='16px' height='16px' >"); 
        }
    }); 
}

function pedidoTraslado(){
    var nro = $("#cat_nro").val();
    pedidos_seleccionados = $(".pedido:checked").length;
    var cant_pedir = $("[name=cant_min]:checked").val();   
    $(".pedido:checked").each(function(){
        //var codigo = $(this).parent().parent().attr("data-codigo");
        var lote = $(this).parent().parent().find(".lote").html();         
        var color = $(this).parent().parent().find(".color").html();
        var suc = $(this).parent().parent().find(".suc").html();
        insertarEnPedidoTraslado(nro,lote,suc,color,cant_pedir);
    });    
}
function insertarEnPedidoTraslado(nro,lote,sucd,color,cant_pedir){
    var urge = $("#urge").is(":checked");
    
    if(urge){
       urge = "Si";    
    }else{
       urge = "No"; 
    }
    $.ajax({
        type: "POST",
        url: "produccion/PedidosdeMuestra.class.php",
        data: {"action": "insertarEnSolicitudTraslado",usuario:getNick(), nro:nro,lote:lote,color:color,suc:getSuc(), sucd: sucd,cant_pedir:cant_pedir,urge:urge  },
        async: true,
        dataType: "html",
        beforeSend: function () {
            $(".msg_"+lote).html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);     
                if(result == "Ok"){
                    $("#truck_"+lote).css("position","absolute");
                    $("#truck_"+lote).animate({  'marginLeft' : "+=10500px"   },5000);
                    
                    setTimeout(function(){
                         $(".fila_"+lote).remove();                         
                    },3000);
                      
                    pedidos_seleccionados--;
                }else{
                    $(".msg_"+lote).html("<img title='"+result+"' src='img/warning_red_16.png' width='16px' height='16px' >"); 
                }
                
            }else{
                $(".msg_"+lote).html("<img title='Error en la comunicacion con el Servidor' src='img/warning_red_16.png' width='16px' height='16px' >"); 
            }
            if(pedidos_seleccionados == 0){
                verPedidosTraslado();
                enableTools();
            }    
        },
        error: function () {
            $(".msg_"+lote).html("<img title='Error en la comunicacion con el Servidor' src='img/warning_red_16.png' width='16px' height='16px' >"); 
        }
    });     
}

function  verLotesAsignados(){
    var nro = $("#cat_nro").val();
    $.ajax({
        type: "POST",
        url: "produccion/PedidosdeMuestra.class.php",
        data: {"action": "verLotesAsignados", nro: nro},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {  
            $(".fila_asign").remove();
            for (var i in data) { 
                var id = data[i].id_det;
                var lote = data[i].lote;  
                var cant = data[i].cantidad;  
                var color = data[i].color;  
                var pantone = data[i].pantone;  
                var usuario = data[i].usuario;   
                var estado = data[i].estado;  
                $("#lotes_asignados").append("<tr class='id_"+id+" fila_asign' data-pantone='"+pantone+"'><td class='item lote_"+lote+"'>"+lote+"</td><td class='item'>"+color+"</td><td class='itemc'>"+cant+"</td><td class='itemc ubic loading_"+lote+"'><img src='img/activity.gif' style='width:40px;height:4px'></td><td class='itemc personal_asign'>"+usuario+"</td><td class='itemc'><div style='width:100%;float:left'>  <div style='width:"+estado+"%' class='porc_div'>"+estado+"%</div>    </div> </td></tr>");
            }   
            $("#msg").html(""); 
            ubicIterator();
        }
    });
}
function ubicIterator(){
    var codigo = $("#cat_codigo").val();
    $("#lotes_asignados").find(".fila_asign").each(function(){
         var lote= $(this).children().first().html();
         getUbic(codigo,lote);
    });  
}
function getUbic(codigo,lote){
     
    $.ajax({
        type: "POST",
        url: "produccion/PedidosdeMuestra.class.php",
        data: {"action": "getUbic",codigo:codigo,lote: lote,suc:getSuc()},
        async: true,
        dataType: "json",
        beforeSend: function () {   },
        success: function (data) {   
            if(data.length > 0){
               var ubic = data[0].U_ubic;  
               $(".loading_"+lote).html(ubic);  
            }else{
                $(".loading_"+lote).html("");  
            }
        }
    });
}
function verPedidosTraslado(){
    var nro_catalogo = $("#cat_nro").val();
    $.ajax({
        type: "POST",
        url: "produccion/PedidosdeMuestra.class.php",
        data: {"action": "getPedidosAbiertos", nro_catalogo: nro_catalogo},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {  
            //$("#pedidos_traslado").fadeIn();
            $(".tabla_pedido").remove();
            for (var i in data) { 
                var nrop = data[i].nro;
                var usuario = data[i].usuario;  
                var fecha = data[i].fecha;  
                var estado = data[i].estado;  
                var destino = data[i].destino;  
                var enviar = "";
                if(estado === "Abierta"){
                     enviar = '<img class="asignar" src="img/r_arrow.png" style="cursor:pointer;width:16px;" onclick="enviarPedido('+nrop+')" title="Enviar Pedido" >';
                }
                
                var tabla = '<table id="pedido_'+nrop+'" border="1" cellspacing="0" cellpadding="0" class="tabla_pedido tabla_izq" > <tr class="titulo"> <th>N&deg;</th><th>Usuario</th><th>Fecha</th><th>Destino</th><th>Estado</th></tr></table>';
                $("#pedidos_traslado").append(tabla);
                $("#pedido_"+nrop).append("<tr class='ped_"+nrop+"' ><td class='itemc' >"+nrop+"</td><td class='item'>"+usuario+"</td><td class='itemc'>"+fecha+"</td><td class='itemc'>"+destino+"</td><td class='itemc msg_"+nrop+"'>"+estado+" &nbsp;"+enviar+"  </td></tr>");
                $("#pedido_"+nrop).append("<tr><td colspan='5'  class='detalle_ped_"+nrop+"'></td></tr>")>
                getDetallePedidoTraslado(nrop);
            }   
            $("#msg").html(""); 
        }
    });
}
function getDetallePedidoTraslado(nro){
$.ajax({
        type: "POST",
        url: "produccion/PedidosdeMuestra.class.php",
        data: {"action": "getDetallePedido", nro: nro},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {  
            //$("#pedidos_traslado").fadeIn();
            $("#det_pedido_"+nro).remove();
            
            var tabla = '<table id="det_pedido_'+nro+'" border="1" cellspacing="0" cellpadding="0" class="det_tabla_pedido tabla_izq"  > <tr class="titulo" style="background:lightgray"> <th>Lote</th><th>LoteRemp</th><th>Color</th><th>Estado</th></tr></table>';
            $(".detalle_ped_"+nro).append(tabla);
                
            for (var i in data) { 
                var id_det = data[i].id_det;
                var lote = data[i].lote;  
                var lote_rem = data[i].lote_rem;  
                var color = data[i].color;  
                var estado = data[i].estado;  
                var imge = '';
                if(estado ==="En Proceso" || estado ==="Despachado"){
                   imge = "<img src='img/truck.png' width='18' >";
                }else if(estado ==="Suspendido" ){
                   imge = "<img src='img/important.png' width='18' >";
                }
                $("#det_pedido_"+nro).append("<tr class='ped_"+nro+" lote_"+lote+"' data-id='"+id_det+"' ><td class='item'>"+lote+"</td><td class='item'>"+lote_rem+"</td><td class='item'>"+color+"</td><td class='itemc'>"+estado+" "+imge+"</td></tr>");
            }   
            $("#msg").html(""); 
        }
    });    
}
function imprimirAsign(){
    var selected = $(".selected").length;
    
    if(selected > 0){    
        var personal =  $(".selected").text().replace(" x","");
        
        $("#print_nro").val($("#cat_nro").val());
        $("#print_codigo").val($("#cat_codigo").val());
        $("#print_articulo").val($("#cat_articulo").val());
        $("#print_cliente").val($("#cat_cliente").val());
        $("#print_date").val(getTimeStamp());
        
        $("#lotes_asing_print").remove();
        var clone = $("#lotes_asignados").clone();
        clone.attr("id","lotes_asing_print");
        $("#print_asign").append(clone);
        
        $("#lotes_asing_print").find(".fila_asign").each(function(){
            var pers  = $(this).find(".personal_asign").html();            
            if(pers !== personal){
                $(this).remove();
            }
        });
        /*
        $("#print_asign").fadeIn(function(){
            var es = ($(document).width() / 2 ) - $("#print_asign").width() / 2; 
            $("#print_asign").offset({left:es,top:120}); 
            
        });*/
        $("#print_asign").print({
              //Use Global styles
              globalStyles : false,                        
              mediaPrint : false,                        
              stylesheet : "css/main.css",                        
              iframe : false,                        
              deferred: $.Deferred().done(function() { 
                  console.log('Printing done', arguments);
              })
         });
        
        
        /*
        var w = open('url','windowName','height=300,width=300');
        w.document.write($("#print_asign").html()); */
    }else{
        alert("Seleccione un Personal haciendo click en el Nombre");
    }   
}

function enviarPedido(nro){
    $.ajax({
        type: "POST",
        url: "produccion/PedidosdeMuestra.class.php",
        data: {"action": "enviarNotaPedidoTraslado", "usuario": getNick(), nro: nro},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $(".msg_"+nro).html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText); 
                if(result=="Ok"){
                    $(".msg_"+nro).html("Pendiente"); 
                }else{
                    $(".msg_"+nro).addClass("Error");
                    $(".msg_"+nro).html("Error"); 
                }
            }
        },
        error: function () {
            $(".msg_"+nro).html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });     
}

function checkAll(){
   var ch = $("#check_all").is(":checked");  
   $(".check").prop("checked",ch);  
   enableTools();  
}

function enableTools(){
   if($(".catalogo:checked").length > 0){
       $(".asignar").fadeIn();
   }else{
       $(".asignar").fadeOut();
   }   
   if($(".pedido:checked").length > 0){
       $(".pedir").fadeIn();
   }else{
       $(".pedir").fadeOut();
   }     
}

function areaBusqueda(){
   $("#edit_catalogo").width("1202px");   
   $("#edit_catalogo").offset({left:100}); 
   $(".fila_disp").remove();
   $(".fila_asign").remove();
   $(".tabla_pedido").remove();
   $(".extra").fadeIn(); 
   
   verLotesAsignados();
   verPedidosTraslado();
}

function camiarEstado(lote,nro){
    var v = $("#rango_lote_"+lote+"_"+nro).val();
    //var nro = $(".lote_"+lote).attr("data-nro");
    $(".range_"+nro).val(v);
    $(".porc_"+nro).removeClass("porc");
    $(".etiq_"+nro+"_"+v).addClass("porc");
    var lotes = new Array();
    
    $(".fila_"+nro).each(function(){
        var l = $(this).text();
        lotes.push(l);
    });
    
    if(v > 50){
        $(".print_"+nro).fadeIn();
    }else{
        $(".print_"+nro).fadeOut();
    }
    
    lotes = JSON.stringify(lotes);
    
    $.post("produccion/PedidosDeMuestra.class.php?", {action: "cambiarEstadoDetalle",nro:nro,lotes:lotes,valor:v },function(data){
         
    },'json');
}

function imprimirMuestra(nro,lote){
    $(".selected_for_print").each(function(){
        if(!$(this).prev().hasClass("fila_"+nro)){
           $(this).removeClass("selected_for_print");
        }
    }); 
     
    $(".lote_"+lote+".fila_"+nro).next().addClass("selected_for_print");
    var lotes = new Array();  
    
    $(".selected_for_print").each(function(){
        lotes.push($(this).prev().text());
    }); 
    
    lotes = JSON.stringify(lotes);
    
    var url = "produccion/PedidosdeMuestra.class.php?action=imprimirColor&nro="+nro+"&codes="+lotes+"";
    var title = "Impresion de Codigos de Colores";
    var params = "width=500,height=280,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    printDialog(url,title,params);
} 
 function printCaratula(nro){
    
    var codigo =  $(".codigo_"+nro).text();
    var descrip =  $(".articulo_"+nro).text().split("-")[1]; 
    
    var url = "produccion/PedidosdeMuestra.class.php?action=imprimirCaratula&nro="+nro+"&codigo="+codigo+"&descrip="+descrip;
    var title = "Impresion de Caratulo";
    var params = "width=500,height=280,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    printDialog(url,title,params); 
     
} 
 function printContratapa(nro){
    
    var codigo =  $(".codigo_"+nro).text();
    var descrip =  $(".articulo_"+nro).text().split("-")[1]; 
    
    var url = "produccion/PedidosdeMuestra.class.php?action=imprimirContratapa&nro="+nro+"&codigo="+codigo+"&descrip="+descrip;
    var title = "Impresion de Contratapa";
    var params = "width=500,height=280,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    printDialog(url,title,params); 
     
} 
function printDialog(url,title,params){
    if(!printing){        
        printing = window.open(url,title,params);
    }else{
        printing.close();
        printing = window.open(url,title,params);
    }     
}

