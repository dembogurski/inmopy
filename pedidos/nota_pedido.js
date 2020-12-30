
var abm_cliente = null;
var fecha_nac = "0000-00-00";
var data_next_time_flag = true;

 
var um_original = "";
var cantidad_original = 0;
var factorPrecio = 1;
var precioOriginal = 0;
var F = ""; // Codigo de Falla
var moneda_cliente = "G$";
var moneda = "G$";
var decimales = 0;
var cant_articulos = 0;
var fila_art = 0;

var colores = [];



function configurarNP(){
    if(touch){
       capslock = true;
       $('.letter').toggleClass('uppercase');    
    }
    
    $("#ruc_cliente").click(function(){
        $(this).select(); 
        if(touch){
           hideKeyboard(); 
           showNumpad("ruc_cliente",buscarClienteTouch,true);
        }
    });
    $("#cantidad").click(function(){
        if(touch){
           hideKeyboard(); 
           showNumpad("cantidad",check,true);
        }
    });
    $("#ruc_cliente").mask("r99?rrrrrrr",{placeholder:""});  
    // Ruc para nuevo cliente
    $("#ruc_cliente").change(function(){
        if( $(this).val()==""){
            $("#codigo_cliente").val("");
            $("#nombre_cliente").val("");
        }        
        check();
    });
    
    $("#nombre_cliente").change(function(){
        if( $(this).val()==""){
            $("#codigo_cliente").val("0");// Por defecto 
            $("#ruc_cliente").val("");
        }  
        check();
    });
    $("#nombre_cliente").click(function(){ 
        $(this).select();
        if(touch){
           hideNumpad(); 
           showKeyboard(this,buscarClienteTouchNombre); 
           reposicionar();
        }        
    });
    $("#codigo").click(function(){ 
        $(this).select();
        if(touch){
           showKeyboard(this,buscarArticulo); 
           reposicionar();
        } 
        //setHotKeyArticulo();
    }); 
    $("#color").click(function(){ 
        $(this).select();
        colorFocus = true;
        if(touch){
           $('#keyboard li').click(function () { triggerColor()  }); 
           showKeyboard(this,ocultar); 
           reposicionar();
        }        
    });
    $("#obs").click(function(){ 
        $(this).select();
        if(touch){
           showKeyboard(this,ocultar); 
           reposicionar();
        }        
    });
    $("#color").blur(function(){
        colorFocus = false;
    });
    $("#nombre_cliente, #codigo, #color").change(function(){
        hideKeyboard();
    })
     
    // Para cargar Ventas Abiertas
 
       
    // Inicializa cursores para ventas abiertas
    inicializarCursores("clicable"); 
    
    $("*[data-next]").keyup(function (e) {        
        if (e.keyCode == 13) { 
            if(data_next_time_flag){
               data_next_time_flag = false;                    
               var id = $(this).attr("id");
               console.log(id);
               if($(this).attr("id") == "nombre_cliente" || $(this).attr("id") == "ruc_cliente"){                   
                   buscarCliente(this);                  
               }else{ 
                  var next =  $(this).attr("data-next");
                
                 $("#"+next).focus();               
                  setTimeout("setDefaultDataNextFlag()",600);
               }
            }
            check();   
        } 
    });  
    
    setHotKeyArticulo();
 
     //inicializarCursores("descrip"); 
     
    $("#precio_venta").change(function(){
        var Precio =  parseFloat(  $(this).val() ).format(0, 3, '.', ',');
        $(this).val(Precio);
        check();
    });
    $("#cantidad, #maryorista").change(function(){ 
        check();        
    });
    $("#maryorista, #presentacion").blur(function(){ 
        check();        
    }); 
    $("#tipo").change(function(){
        var tipo = $(this).val();
        if(tipo == 'Nacional'){            
            $(".intSuc").hide(0);
            $(".Internacionales").fadeOut("fast");  
            $(".Nacionales").fadeIn("fast");             
        }else{            
            $(".intSuc").show(0);
            $(".Nacionales").fadeOut("fast");
            $(".Internacionales").fadeIn("fast");
        }
        getDetalle();
        check();
    });
    $("#obs").click(function(){
      check();
    });
    $("#obs").change(function(){
      check();
    });
    
    $(".Internacionales").fadeOut("slow");
    statusInfo();
    setTimeout('$("#ruc_cliente").focus()',500);
    
    if(is_mobile){
        var c = $(".categ");
        $("#ruc_cliente").after(c);
        $(".lb_cli").before("<br>");
    }
    
    getDetalle();
};
function reposicionar(){
    var window_height = $(document).height();
    var keyboard_height = $("#virtual_keyboard").height();
    var  posy = (window_height - keyboard_height);     
    $("#virtual_keyboard").css({top:posy});
    $('#virtual_keyboard').css("background","lightgray");
    $('#virtual_keyboard').css("border-radius","4px");
}
function check(){
    var codigo = $("#codigo").val(); 
    var valor =  parseFloat(  $("#cantidad").val() );
    var precio =  parseFloat(  $("#precio_venta").val() );
    var cod_cli =  $("#codigo_cliente").val();
    var mayorista = $("#mayorista").val();
    var cantidad  = $("#cantidad").val();
    var color  = $("#color").val(); 
    
    var control0 = (codigo.length > 0 && valor > 0 && precio > 0 && cantidad > 0 && color != "" );
     
    if(mayorista == "Minorista" && control0){
        $("#add_code").removeAttr("disabled");  
    }else if(mayorista == "Mayorista" && control0 && cod_cli.length > 0){
        $("#add_code").removeAttr("disabled");        
    }else{
        $("#add_code").attr("disabled",true); 
        if(cod_cli.length < 1 && mayorista == "Mayorista"){
           errorMsg("El cliente es requerido para compras Mayoristas...",8000);
        }
    }
    if(isNaN(parseFloat($("#cantidad").val()))){
        $("#cantidad").addClass("input_err");
    }else{
        $("#cantidad").removeClass("input_err");
    }
    if(  mayorista=="Minorista" && $("#tipo").val() == "Internacional"){
        disableCli(); 
    }else{
        enableCli();
    }  
}
function enableCli(){     
   $(".clidata").removeAttr("disabled");
}
function disableCli(){
   $(".clidata").val("");
   $(".clidata").prop("disabled",true);
}
function addCode(){
   var cod_cli = $("#codigo_cliente").val();
   var cliente = $("#nombre_cliente").val();
   var codigo = $("#codigo").val(); 
   var lote = $("#lote").val(); 
   var descrip = $("#descrip").val(); 
   var precio  = $("#precio_venta").val().replace(".",""); 
   var cantidad  = $("#cantidad").val();     
   var um  = $("#um").val(); 
   var color  = $("#color").val(); 
   var tipo  = $("#tipo").val(); 
   var obs  = $("#obs").val(); 
   var may  = $("#mayorista").val(); 
   var urge  = $("#urge").val(); 
   var presentacion = $("#presentacion").val(); 
   if(color.length < 1){
       var seguir = confirm("Esta cargando un articulo sin especificar el Color. Desea continuar?");
       if(!seguir){
           $("#color").focus();
           return;
       }
   }
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "agregarArticuloANotaDePedidoCompra",cod_cli:cod_cli,cliente:cliente, "usuario": getNick(), "suc": getSuc(),codigo:codigo,lote:lote,descrip:descrip,precio:precio,cantidad:cantidad,um:um,color:color,tipo:tipo,obs:obs,mayorista:may,urge:urge,presentacion:presentacion},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading_fast.gif' width='22px' height='22px' >");                      
        },
        complete: function(objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);     
                if(isNaN(result)){
                    $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
                }else{
                    limpiarAreaCarga();
                    getDetalle();
                    $("#msg").html("Articulo agregado...");
                }
            }else{
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        },
        error: function() {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}
function triggerColor(){
    if(colorFocus){
       $("#color").trigger("keydown");
    }
}

function getDetalle(){
    var tipo = $("#tipo").val();
    var nro = 0;
    if(tipo === "Nacional"){
        nro = $(".tipo_Nacionales").attr("id").substring(5,30);
    }else{
        nro = $(".tipo_Internacionales").attr("id").substring(5,30);               
    }
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getDetalleNotaPedido", nro: nro,usuario:getNick()},
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >"); 
        },
        success: function(data) { 
            $(".articulo_"+nro+"").remove();
            for(var i in data){     
                var id = data[i].id_det; 
                var usuario = data[i].usuario; 
                var cliente = data[i].cliente;
                var codigo = data[i].codigo;
                var suc = data[i].suc;
                var descrip = data[i].descrip;
                var cantidad = data[i].cantidad;
                var um_prod = data[i].um_prod;
                var mayorista = data[i].mayorista;
                var color = data[i].color;
                var obs = data[i].obs;
                 $(".articulos_"+nro).append("<tr class='articulo_"+nro+" detalle'  id_"+id+"' style='background-color: white'>\n\
                <td class='item'>"+usuario+"</td>\n\\n\
                <td class='itemc'>"+suc+"</td>\n\\n\
                <td class='item'>"+cliente+"</td>\n\\n\
                <td class='item'>"+codigo+"</td>\n\\n\
                <td class='item'>"+descrip+"</td>\n\
                <td class='num'>"+cantidad+"</td>\n\
                <td class='itemc'  >"+um_prod+"</td>\n\
                <td class='itemc'>"+mayorista+"</td>\n\
                <td class='item' >"+color+" </td>\n\
                <td class='item' title='Eliminar este Articulo'  >"+obs+" </td><td class='itemc'  > <img src='img/trash_mini.png' style='cursor:pointer'  onclick='eliminarArticulo("+id+")'> </td>");
            }            
            $("#msg").html(""); 
        }
    });
}
function limpiarAreaCarga(){
    //$("#codigo").val(""); 
    //$("#lote").val(""); 
    //$("#descrip").val(""); 
    //$("#precio_venta").val(""); 
    $("#cantidad").val("");     
    //$("#um").val(""); 
    $("#color").val(""); 
    $("#obs").val(""); 
    $("#cantidad").focus();
    check();
}
function eliminarArticulo(id){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "eliminarArticuloDetallePedido", "id": id },
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading_fast.gif' width='22px' height='22px' >");                      
        },
        complete: function(objeto, exito) {
            if (exito == "success") {                          
                 getDetalle();
            }
        },
        error: function() {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}

function enviarPedido(nro){
    var count = 0;
    $(".detalle").each(function(){
        count++;
    });
    
    if(count > 0 || ( $("#tipo").val() == "Internacional")){
    var c = confirm("Confirme enviar este pedido...");
    if(c){
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "finalizarNotaPedidoCompra", "nro": nro},
            async: true,
            dataType: "html",
            beforeSend: function() {
                $("#msg").html("<img src='img/loading_fast.gif' width='22px' height='22px' >");                      
            },
            complete: function(objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText);  
                    $("#msg").html("Ok, recargando...");
                    alert("El pedido se ha enviado con exito. Ref.: Nro: "+nro);
                    genericLoad("pedidos/NotasPedidoAbiertas.class.php");
                }
            },
            error: function() {
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        }); 
    }
    }else{
        alert("Debe cargar al menos un articulo en el pedido antes de enviar...");
    }
}

function setAutocomplete(){ 
   $("#color").autocomplete({
     maxResults: 10,
     source: colores 
   }); 
   $("#color").blur(function(){
       var v = $(this).val();
       var inarr = $.inArray( v, colores );
       if(inarr == -1){ 
           $("#msg").html("Color invalido");
           $("#msg").addClass("error");
           setTimeout('$("#color").focus()',300);
       }else{
         $("#msg").html(""); 
         $("#msg").removeClass("error");
       } 
   });
}
function ocultar(){
    hideKeyboard();
    check();
}

function mostrar(){     
    $("#area_carga").fadeIn(); 
    setTimeout('$("#codigo").focus()',500); 
} 
function setDefaultDataNextFlag(){
    data_next_time_flag = true;
}
function setHotKeyArticulo(){
     
    $("#codigo").keydown(function(e) {
        
        var tecla = e.keyCode;  console.log(tecla);  
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
    var sector = $(obj).find(".Sector").html(); 
    var nombre_com = $(obj).find(".NombreComercial").html();  
    var precio = $(obj).attr("data-precio");
    var um = $(obj).attr("data-um");
    $("#codigo").val(codigo);
    $("#descrip").val(sector+"-"+nombre_com);
    $("#um").val(um);
    $("#ui_articulos").fadeOut();
    $("#precio_venta").val(precio);
    $("#precio_venta").focus();
}
 
function buscarArticulo(){
    var articulo = $("#codigo").val();
    var cat = $("#categoria").val();
    fila_art = 0;
    if(articulo.length > 0){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
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
                    var ItemCode = data[i].codigo;
                    var Sector = data[i].sector;
                    var NombreComercial = data[i].descrip;
                    var Precio = parseFloat((data[i].precio)).format(0, 3, '.', ',');
                    var Ancho = parseFloat(data[i].ancho).format(2, 3, '.', ',');
                    var Composicion = data[i].composicion;
                    var UM = data[i].um;
                                                                         
                    $("#lista_articulos") .append("<tr class='tr_art_data fila_art_"+i+"' data-precio="+Precio+" data-um="+UM+"><td class='item clicable_art'><span class='codigo' >"+ItemCode+"</span></td>\n\
                    <td class='item clicable_art'><span class='Sector'>"+Sector+"</span> \n\
                    </td><td class='item clicable_art'><span class='NombreComercial'>"+NombreComercial+"</span></td> \n\
                    <td class='num clicable_art'>"+Ancho+"</td>\n\
                    <td class='item clicable_art'>"+Composicion+"</td>\n\
                    <td class='num clicable_art'>"+Precio+"</td>\n\
                    </tr>");
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
function cerrar(){
  
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
    mostrar();
    check();
    $("#codigo").focus();
}
function crearNotaPedido(){   
    var usuario = getNick();
    var suc = getSuc();
    var cod_cli = $("#codigo_cliente").val();
    var categoria = $("#categoria").val();
    var ruc = $("#ruc_cliente").val();
    var cliente = $("#nombre_cliente").val();
 
 
    /* No utilizado en Pedidos
    var moneda = $("#moneda").val();
    var cotiz = $("#cotiz").val();*/
    
    
       $("#boton_generar").remove();
       $("#ruc_cliente").attr("readonly","true");
       $("#nombre_cliente").attr("readonly","true");
       $(".currency").css("opacity","0");
       $(".currency").unbind("click");
       $(".currency").removeAttr("onclick");
        $.ajax({
                type: "POST",
                url: "Ajax.class.php",
                data: {"action":"crearNotaDePedido","usuario":usuario,"cliente":cliente,"cod_cli":cod_cli,"ruc":ruc,"categoria":categoria,"suc":suc,"moneda":'Gs',"cotiz":1}, 
                async:true,
                dataType: "html",
                beforeSend: function(){
                    $("#msg").html("<img src='img/loading.gif' width='22px' height='22px' style='margin-bottom:-5px' >");                      
                }, 
                complete: function(objeto, exito){
                    if(exito=="success"){                          
                      var factura =  $.trim(objeto.responseText) 
                      mostrarAreaDeCarga(factura);
                    }
                },
                error: function(){
                     $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
                }
        });  
         
}

function buscarCodigo(){    
     
    var lote = $("#lote").val();
    if(lote.length > 0){
    var suc = getSuc();    
    var categoria = $("#categoria").val();
    if(lote != ""){
    $("#info").fadeIn("fast"); 
         
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action":"buscarDatosDeCodigo","lote":lote,"categoria":categoria,"suc":suc}, 
        async:true,
        dataType: "json",
        beforeSend: function(){ 
           $("#msg").html("<img src='img/loadingt.gif' >");             
        },
        success: function(data){ 
            var mensaje = data[0].Mensaje;
            $("#msg").attr("class","info");
            if( mensaje === "Ok" ){
                  
                $("#codigo").val(data[0].Codigo); 
                $("#descrip").val(data[0].Descrip);
                   
                var precio = parseFloat(  (data[0].Precio) ).format(decimales, 3, '.', ',');
                 
                var um = data[0].UM;  
                                
                $("#um").val(um);  
                  
                $("#precio_venta").val(precio);
                 
                $("#cantidad").focus();
                $("#cantidad").select(); 
                $("#msg").html("");    
            }else{
                $("#msg").addClass("error");
                $("#msg").html(mensaje);                
                //limpiarAreaCarga();
                $("#lote").focus();                 
            }
        },
        error: function(e){ 
           $("#msg").addClass("error");
           $("#msg").html("Error en la comunicacion con el servidor:  "+e);
        }
    });
    }else{
         $("#info").fadeOut("fast");
    }
    }    
}

function hideKeyboard(){
   $("#virtual_keyboard").fadeOut();
}
function buscarClienteTouch(){
    buscarCliente($("#ruc_cliente"));
}
function buscarClienteTouchNombre(){
    buscarCliente($("#nombre_cliente"));
}

function float(id){
    var n =  parseFloat($("#"+id).val().replace(/\./g, '').replace(/\,/g, '.'));
    if(isNaN(n)){
        return 0;
    }else{
        return n;
    }
 }

function cargarDesdeExcel(){
    window.open("pedidos/SubirPedidoExcel.class.php");
}