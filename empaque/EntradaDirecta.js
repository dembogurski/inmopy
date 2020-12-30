/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var fila_art = 0;
var cant_articulos = 0;
var escribiendo = false;

var editando = false;
var editing_id_ent = 0;
var editing_id_det = 0;

var colores = [];
var designs = ['ABORIGEN','BULGAROS'];

var datos_incorrectos = 0;
var colores_incorrectos = 0;
var gramajes_incorrectos = 0;
var anchos_incorrectos = 0;

var copiar_de = false; 
var checked = $('input[name=radio_estado]:checked').val();
var estado = "Abierta";
var cotizacion_sap = true;
var nro_pedido_compra = 0;
var loadDesings = false; 
var pedidos = new Array();

function preconfigurar(){
    inicializarCursores("clicable");
    $(".clicable").click(function(){
        var id = $(this).parent().attr("id");
        var nro_pedido = $(this).parent().attr("data-nro_pedido");
        cargarEntrada(id,nro_pedido);
    });
    $("#pais").val( $("#pais option:nth-child(1)").val())
    //$("#pais").val("PY");
    estado = $("#estado").val();  
    
    $("#lista_invoices").DataTable( {
        "language": {
            "lengthMenu": "Mostrando _MENU_ registros por pagina",
            "zeroRecords": "Ningun registro.",
            "info": "Mostrando _PAGE_ de _PAGES_ paginas",
            "infoEmpty": "No hay registros.",
            "infoFiltered": "(filtrado entre _MAX_ registros)",
            "sSearch":"Buscar",
            "oPaginate": {
                "sFirst":    "Primero",
                "sLast":     "Último",
                "sNext":     "Siguiente",
                "sPrevious": "Anterior"
            },
        }
    } );
    
}
function sinFoto(){
   $("#img").val("0/0");
}
function configurar(){  
   
   //$( "#fecha" ).datepicker({ dateFormat: 'dd-mm-yy' }   ); 
    $( "#fecha" ).mask( "99-99-2099"  ); 
   
   $("select > option:nth-child(even)").css("background","#F0F0F5"); // Color Zebra para los Selects  
   $( ".check").change(function(){
       var v = $(this).val();
       if(v.length < 1){
           $(this).addClass("input_err");
       }else{
           $(this).removeClass("input_err");
       }
       checkform();
   });
    
   //$("#pais").val( $("#pais option:nth-child(1)").val())
   $("#pais").val("CN");
   $("#pais").change(function(){
       if($(this).val()=="CN"){
          $(".internacional").fadeOut();  
          $(".nacional").fadeIn(); 
       }else{
          $(".internacional").fadeIn(); 
          $(".nacional").fadeOut(); 
       }
   }); 
     
   setHotKeyArticulo();
}
function crearPedidoCompra(){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "crearPedidoDeCompra", "usuario": getNick(), "suc": getSuc()},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);  
                nro_pedido_compra = result;
                pedidos.push(nro_pedido_compra);
                $("#n_nro").val(result);
                crearEntrada();
            }
            $("#msg").html("Ok..");
            
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}
function cambiarEstado(estado){    
    if(checked != estado){  
        load("compras/EntradaMercaderias.class.php?estado="+estado,{usuario:getNick(),session:(getCookie(getNick()).sesion),suc:getSuc()},function(){
            preconfigurar();
        });  
        checked = estado;
    }
}

function nuevaEntrada(){
   load("compras/NuevaEntradaMercaderias.class.php",{usuario:getNick(),session:(getCookie(getNick()).sesion),suc:getSuc()},function(){ 
       configurar();
   });   
}

function crearEntrada(){
   $("#pais").val("CN");
   $("#boton_generar").attr("disabled",true); 
   var cod_prov = $("#codigo_proveedor").val();    
   var nombre = $("#nombre_proveedor").val(); 
   var invoice = $("#invoice").val(); 
   var fecha = validDate($("#fecha").val()).fecha;
   var moneda = $("#moneda").val();  
   var cotiz = $("#cotiz").val();    
   var suc = $("#suc").val();
   var pais_origen = $("#pais").val();
   var tipo = $("#tipo_doc_sap").val();
   var timbrado = $("#timbrado").val();
   if(tipo == "OPCH" && timbrado == ""){
       $("#timbrado").focus();
       errorMsg("Timbrado no puede ser vacio para tipo documento Factura de Proveedor",8000);
       return;
   }
   
   if(pedidos.length == 0){
       pedidos.push($("#n_nro").val());
   }
   var nros_pedidos = JSON.stringify(pedidos);
   
   if(moneda != "G$" && cotiz == 1 ){
       errorMsg("Cotizacion para "+moneda+" no puede ser 1",8000);
       $("#cotiz").focus();
   }else{   
        $.ajax({
             type: "POST",
             url: "Ajax.class.php",
             data: {"action": "crearEntradaMercaderias", usuario:getNick(),suc:suc,cod_prov:cod_prov,nombre:nombre,invoice:invoice,fecha:fecha,moneda:moneda,cotiz:cotiz,pais_origen:pais_origen,tipo:tipo,pedidos:nros_pedidos,timbrado:timbrado},
             async: true,
             dataType: "html",
             beforeSend: function () {
                 $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
             },
             complete: function (objeto, exito) {
                 if (exito == "success") {                          
                     var result = $.trim(objeto.responseText);
                     $("#ref").val(result);
                     $("#msg").html("");
                     desabilitarInputs();  //check_copy_from_pedidos
                     $("#boton_generar").fadeOut();
                     
                     /*
                     if($("#copy_from_invoice").is(":checked")){
                          if($("#copy_detail").is(":checked")){
                             copiarPackingList();                              
                          }
                     }else if($("#check_copy_from_pedidos").is(":checked")){
                         if($("#copy_detail").is(":checked")){
                             copiarPedido();  
                         }
                     }else{
                        mostrarAreaCarga();
                     }*/
                     mostrarAreaCarga();
                 }
             },
             error: function () {
                 $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
             }
        }); 
   } 
}

function cargarEntrada(id_ent,nro_pedido){ 
    var usuario = getNick(); 
    var session = getCookie(usuario).sesion;    
    load("compras/CargarEntradaMercaderias.class.php",{usuario:usuario,session:session,id_ent:id_ent,nro_pedido:nro_pedido},mostrarAreaCarga); 
}
function mostrarAreaCarga(){
   estado = $("#estado").val();
   if($("#estado").val() == "Abierta"){        
        $("#area_carga").fadeIn("fast",function(){  
            $("#codigo").focus();             
            setHotKeyArticulo();
            $("#area_carga").fadeIn();
            configAreaCarga();            
        }); 
   }else{ 
       $("input[type=text]").attr("readonly",true);
       $(".control").fadeOut();
       $("#inv_obs").attr("readonly",true);
   }
   cargarDetalleEntrada($("#ref").val()); 
}

function configAreaCarga(){
    
    $(".requerido").blur(function(){
       var v = $(this).val();
       if(v.length < 1){
           $(this).addClass("input_err");           
       }else{
           $(this).removeClass("input_err");           
       } 
       controlarDatos();
    });       
    
    $("#color").autocomplete({
        source: colores 
    });
    $("#design").autocomplete({
        source: designs 
    });
    $("#color").blur(function(){
       var v = $(this).val();
       var inarr = $.inArray( v, colores );
       if(inarr == -1){ 
           $("#msg").html("Color invalido, debe ser un color de la lista");
           $("#msg").addClass("error");
           setTimeout('$("#color").focus()',300);          
       }else{
         $("#msg").html(""); 
         $("#msg").removeClass("error"); 
         buscarImagenPantoneColorLiso();
       }
       controlarDatos();
   });
   $("#design").blur(function(){
       var v = $(this).val();
       var inarr = $.inArray( v, designs );
       if(inarr == -1){ 
           $("#msg").html("Diseño invalido, debe ser un diseño de la lista");
           infoMsg(""+designs,10000);
           $("#msg").addClass("error");
           setTimeout('$("#designs").focus()',300);          
       }else{
         $("#msg").html(""); 
         $("#msg").removeClass("error");         
       }
       controlarDatos();
   });  
}
function controlarDatos(){
    datos_incorrectos = 0;
    $(".requerido").each(function(){       
       var v = $(this).val();
       if(v.length < 1){
           datos_incorrectos++;
       }
       if($(this).attr("id") != "um"){
         $(this).val(v.toUpperCase());
       }
    });  
    $(".numero").each(function(){  
       var v = $(this).val(); 
       if(isNaN(v)){
           v = parseFloat($(this).val().replace(".","").replace(",","."));
       }
        
       if(isNaN(v) || v <= 0){
           datos_incorrectos++;
       }      
    });
    if(datos_incorrectos > 0){
       $("#add_code").attr("disabled",true);
       $("#update").attr("disabled",true);
       if(datos_incorrectos > 0 && datos_incorrectos < 2){
          errorMsg("Debe rellenar todos los campos.",6000);
       }
    }else{        
       $("#add_code").removeAttr("disabled"); 
       $("#update").removeAttr("disabled"); 
    }
    var cants = $("#cantidades").val();
    if(cants.length > 0){
        $("#edit_bale").fadeOut();
    }else{
        $("#cantidades").focus();  
    }
}
function limpiarAreaCarga(){
    $(".requerido").val("");
    $("#piezas").val("0");      
}
function addCode(){
    $("#add_code").attr("disabled",true);
    var ref = $("#ref").val();
    var store_no = $("#codigo_proveedor").val();
    var codigo = $("#codigo").val();
    var um_art = $("#um").val();
    var descrip = $("#descrip").val();
    var color = $("#color").val();
    var catalogo = $("#catalogo").val();
    var cod_color = $("#cod_color").val();
    var color_comb = $("#color_comb").val();
    var design = $("#design").val();
    //var composicion = $("#composicion").val();
    var composicion = "";
    var umc = $("#umc").val();
    var ancho = $("#ancho").val();
    var gramaje = $("#gramaje").val();
    var nro_lot_fab  = $("#nro_lot_fab").val();
    
    var precio = parseFloat($("#precio").val().replace(".","").replace(",","."));
    var qtys = $.trim($("#cantidades").val()).split("\n");
    var qtys_array = new Array();
    var img = $("#img").val();
    
    $.each(qtys, function(k){ 
       var cant = parseFloat(qtys[k]);
       qtys_array.push(cant) 
    });     
    qtys_array = JSON.stringify(qtys_array);
    
    $.ajax({
        type: "POST",
        url: "compras/EntradaMercaderias.class.php",
        data: {"action": "agregarDetalleEntrada",ref:ref,store_no:store_no,nro_pedido:nro_pedido_compra ,codigo:codigo,um_art:um_art,descrip:descrip,color:color,catalogo:catalogo,cod_color:cod_color,corlo_comb:color_comb,
                design:design,composicion:composicion,umc:umc,ancho:ancho,gramaje:gramaje,cantidades:qtys_array,precio:precio,nro_lot_fab:nro_lot_fab,img:img,desde_empaque:"true"},
        async: false,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            for (var i in data) { 
            var id_ent = data[i].id_ent;
            var id_det = data[i].id_det; 
            var nro_pedido = data[i].nro_pedido;   
            var id_pack = data[i].id_pack;   
            var store_no = data[i].store_no;   
            var bale = data[i].bale;   
            //var piece = data[i].piece;   
            var codigo = data[i].codigo;   
            var lote = data[i].lote;                   
            var descrip = data[i].descrip;   
            var um = data[i].um;   
            var cod_catalogo = data[i].cod_catalogo+"-"+data[i].fab_color_cod;   

            var precio = data[i].precio;   
            var cantidad = data[i].cantidad;   
            var subtotal = data[i].subtotal;   
            var color = data[i].color;   
            var color_comb = data[i].color_comb;   
            var design = data[i].design;   
            //var composicion = data[i].composicion;   
            var ancho = data[i].ancho;   
            var gramaje = data[i].gramaje;   
            var obs = data[i].obs; 
            var cant_calc = data[i].cant_calc; 
            var um_prod = data[i].um_prod; 
            var nro_lote_fab = data[i].nro_lote_fab; 
            
            $("#detalle_entrada").append('<tr id="tr_'+id_ent+'_'+id_det+'" class="fila_ent '+um+'" onclick=editar("'+id_ent+'_'+id_det+'") > \n\
                <td class="item">'+store_no+'</td> \n\
                <td class="num">'+bale+'</td>\n\
                <td class="item">'+codigo+'</td>\n\
                <td class="item">'+lote+'</td>\n\
                <td class="item">'+descrip+'</td> \n\
                <td class="item color">'+color+'</td>\n\
                <td class="item">'+color_comb+'</td>\n\
                <td class="item">'+cod_catalogo+'</td> \n\
                <td class="item">'+nro_lote_fab+'</td> \n\
                <td class="num">'+ancho+'</td>\n\
                <td class="num">'+gramaje+'</td>\n\\n\
                <td class="item">'+design+'</td>\n\
                <td class="itemc">'+um+'</td>\n\
                <td class="num">'+cantidad+'</td>\n\
                <td class="num">'+precio+'</td>\n\
                <td class="num subtotal">'+subtotal+'</td>\n\
                <td class="itemc">'+um_prod+'</td>\n\
                <td class="num">'+cant_calc+'</td>\n\
                <td class="itemc"><img class="del_det trash" title="Borrar Esta Pieza" style="cursor:pointer" src="img/trash_mini.png" onclick=delDet("'+id_ent+'_'+id_det+'");></td></tr>');
            }   
            $("#msg").html(""); 
            limpiarAreaCarga();
            totalizar();
            $("#finalizar").attr("disabled",true);
            $("#generar_lotes").removeAttr("disabled");
        }
    });
    
}
function buscarImagenPantoneColorLiso(){
      var codigo = $("#codigo").val();
      var color = $("#color").val();
      $.ajax({
            type: "POST",
            url: "compras/EntradaMercaderias.class.php",
            data: { "action": "getImageColorPantoneLiso","codigo":codigo,"color":color },
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function(data) {
                
                var color = data.color;                
                $("#img").val(color);
                if(data.thumnail != ""){
                   $("#td_img").html("<img src='"+data.thumnail+"' width='106'>" );   
                }else{
                    $("#td_img").html("");   
                }                 
                
                $("#msg").html("");
            }
        });    
}
function update(){
    $("#update").attr("disabled",true);
    var ref = $("#ref").val();
    var store_no = $("#codigo_proveedor").val();
    var codigo = $("#codigo").val();
    var um_art = $("#um").val();
    var descrip = $("#descrip").val();
    var color = $("#color").val();
    var catalogo = $("#catalogo").val();
    var cod_color = $("#cod_color").val();
    var color_comb = $("#color_comb").val();
    var design = $("#design").val();
    // var composicion = $("#composicion").val();
    var nro_lot_fab  = $("#nro_lot_fab").val();
    var composicion = "";
    var umc = $("#umc").val();
    var ancho = $("#ancho").val();
    var gramaje = $("#gramaje").val();
    
    var precio = parseFloat($("#precio").val().replace(".","").replace(",","."));
    var qtys = $.trim($("#cantidades").val()).split("\n");
    
    //var editing_id_ent = 0;
    //var editing_id_det = 0;
    
    $.each(qtys, function(k){ 
       var cant = parseFloat(qtys[k]);
       //var costo = precio * cant;
        
        $.ajax({
            type: "POST",
            url: "compras/EntradaMercaderias.class.php",
            data: {"action": "modificarDetalleEntradaMercaderia",ref:ref,id_det: editing_id_det,store_no:store_no,codigo:codigo,um_art:um_art,descrip:descrip,color:color,catalogo:catalogo,cod_color:cod_color,corlo_comb:color_comb,
                    design:design,composicion:composicion,umc:umc,ancho:ancho,gramaje:gramaje,cantidad:cant,precio:precio,nro_lot_fab:nro_lot_fab},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                for (var i in data) { 
                var id_ent = data[i].id_ent;
                var id_det = data[i].id_det; 
                var nro_pedido = data[i].nro_pedido;   
                var id_pack = data[i].id_pack;   
                var store_no = data[i].store_no;   
                var bale = data[i].bale;   
                //var piece = data[i].piece;   
                var codigo = data[i].codigo;   
                var lote = data[i].lote;                   
                var descrip = data[i].descrip;   
                var um = data[i].um;   
                var cod_catalogo = data[i].cod_catalogo+"-"+data[i].fab_color_cod;   
                
                var precio = data[i].precio;   
                var cantidad = data[i].cantidad;   
                var subtotal = data[i].subtotal;   
                var color = data[i].color;   
                var color_comb = data[i].color_comb;   
                var design = data[i].design;   
                var composicion = data[i].composicion;   
                var ancho = data[i].ancho;   
                var gramaje = data[i].gramaje;   
                var obs = data[i].obs; 
                var cant_calc = data[i].cant_calc; 
                var um_prod = data[i].um_prod; 
                var nro_lote_fab = data[i].nro_lote_fab; 
                $("#tr_"+id_ent+'_'+id_det+"").html(' \n\
                    <td class="item">'+store_no+'</td> \n\
                    <td class="num">'+bale+'</td>\n\
                    <td class="item">'+codigo+'</td>\n\
                    <td class="item">'+lote+'</td>\n\
                    <td class="item">'+descrip+'</td> \n\
                    <td class="item color">'+color+'</td>\n\
                    <td class="item">'+color_comb+'</td>\n\
                    <td class="item">'+cod_catalogo+'</td> \n\
                    <td class="item">'+nro_lote_fab+'</td> \n\
                    <td class="num">'+ancho+'</td>\n\
                    <td class="num">'+gramaje+'</td>\n\\n\
                    <td class="item">'+design+'</td>\n\
                    <td class="itemc">'+um+'</td>\n\
                    <td class="num">'+cantidad+'</td>\n\
                    <td class="num">'+precio+'</td>\n\
                    <td class="num subtotal">'+subtotal+'</td>\n\
                    <td class="itemc">'+um_prod+'</td>\n\
                    <td class="num">'+cant_calc+'</td>\n\
                    <td class="itemc"><img class="del_det trash" title="Borrar Esta Pieza" style="cursor:pointer" src="img/trash_mini.png" onclick=delDet("'+id_ent+'_'+id_det+'");></td>');
            }   
            $("#msg").html(""); 
            limpiarAreaCarga();
            totalizar();
            controlarDatosServer();
            }
        });
    });
}
function copyFromInvoice(){
    if($("#copy_from_invoice").is(":checked")){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getInvoicesNoCargados"},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $(".copy_fila").remove();
            $(".copy_from").fadeIn();
            $(".copy_from").draggable();
        },
        success: function (data) {  
              
            for (var i in data) { 
                var invoice = data[i].invoice;
                var nro_pedido_compra = data[i].n_nro;
                var cod_prov = data[i].cod_prov;
                var ruc = data[i].ruc;
                var proveedor = data[i].proveedor; 
                var moneda = data[i].moneda;
                var fecha = data[i].fecha;
                var total = data[i].total;
                var origen = data[i].origen;
                var coment = data[i].coment;
                $("#copy_from").append("<tr class='copy_fila' id='copy_fila_"+i+"' data-coment='"+coment+"' data-nro_pedido='"+nro_pedido_compra+"' ><td class='item'>"+invoice+"</td><td class='item'>"+cod_prov+"</td><td class='item'>"+ruc+"</td><td class='item'>"+proveedor+"</td><td class='itemc'>"+moneda+"</td><td class='itemc'>"+fecha+"</td><td class='num'>"+total+"</td><td class='itemc'>"+origen+"</td><td class='itemc'><input type='radio' name='copiar_de' onclick='copiar("+i+")' ></td></tr>"); 
            }   
          
            $("#msg").html(""); 
        }
    });
    }
}
function copyFromPedidos(){
    if($("#check_copy_from_pedidos").is(":checked")){
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getPedidosNoCargados"},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
                $(".copy_fila_pedidos").remove();
                $(".copy_from_pedidos").fadeIn();
                $(".copy_from_pedidos").draggable();
            },
            success: function (data) {                                                              //n_nro,usuario,  AS fecha,suc,Estado
                for (var i in data) { 
                   
                    var nro_pedido_compra = data[i].n_nro;
                    var usuario = data[i].usuario;
                    var fecha = data[i].fecha;
                    var suc = data[i].suc; 
                    var estado = data[i].Estado;
                    var Items = data[i].Items; 
                    var obs = data[i].obs; 
                    if(obs == null){ obs = "";}
                    $("#copy_from_pedidos").append("<tr class='copy_fila_pedidos' style='background:white' id='copy_fila_"+i+"' data-nro_pedido='"+nro_pedido_compra+"' ><td class='itemc clicable' onclick='mostrarDetalle("+i+")'>"+nro_pedido_compra+"</td><td class='itemc'>"+usuario+"</td><td class='itemc'>"+fecha+"</td><td class='itemc'>"+suc+"</td><td class='itemc'>"+estado+"</td><td class='itemc'>"+Items+"</td> <td class='item'>"+obs+"</td><td class='itemc'><input type='checkbox' class='pedidos_check'  onclick='revisarMarcados("+i+")' ></td></tr>"); 
                    $("#copy_from_pedidos").append("<tr style='display:none' id='fila_detalle_"+i+"' ><td style='text-align:center'> <img src='img/arrow-up.png' onclick='ocultar("+i+")' heigth='16' width='16'> </td><td colspan='7'>\n\
                    <table class='detalle' border='1' id='detalle_"+i+"'><tr><th>Usuario</th><th>Suc</th><th>Codigo</th><th>Descrip</th><th>Color</th><th>Cantidad</th><th>Obs</th><th>Proveedor</th><th>Previsto</th></tr></table>\n\
                    </td></tr>");
                }
                inicializarCursores("clicable");
                $("#msg").html(""); 
            }
        });
    }
}
function seleccionarPedido(){
    $(".pedidos_check").each(function(){
      if($(this).is(":checked")){
          nro_pedido_compra = $(this).parent().parent().attr("data-nro_pedido");
          $("#n_nro").val(nro_pedido_compra);          
          return true;
      }
    });
    if(!$("#copy_detail").is(":checked")){
        var c = confirm("Desea copiar el Detalle del Pedido?, Debe marcar el Checkbox Copiar detalle antes de Generar la Entrada");
        if(c){
            $("#copy_detail").prop("checked",true);
        }else{
            $("#copy_detail").removeAttr("checked"); 
        }
    }
    $(".copy_from_pedidos").fadeOut();
}
function ocultar(i){
   $("#fila_detalle_"+i).slideUp(); 
}
function mostrarDetalle(j){
        
        var nro = $("#copy_fila_"+j).attr("data-nro_pedido");
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getDetallePedidosComprados", nro: nro},     
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#detalle_"+j+" .detail").remove();
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                for (var i in data) { 
                    var usuario = data[i].usuario;
                    var suc = data[i].suc; 
                    var codigo = data[i].codigo; 
                    var descrip = data[i].descrip; 
                    var color = data[i].color; 
                    var cantidad = data[i].cantidad; 
                    var obs = data[i].obs; 
                    var c_prov = data[i].c_prov; 
                    var previsto = data[i].previsto; 
                    $("#detalle_"+j).append("<tr class='detail'><td>"+usuario+"</td><td>"+suc+"</td><td>"+codigo+"</td><td>"+descrip+"</td><td>"+color+"</td><td>"+cantidad+"</td><td>"+obs+"</td><td>"+c_prov+"</td><td>"+previsto+"</td></tr>");                                                    
                }   
                $("#msg").html(""); 
                $("#fila_detalle_"+j).slideDown();
            }
         }); 
     
}
function revisarMarcados(i){
   var count = 0;
   var primero = 0;
   var segundo = 0;
   
    
   $(".pedidos_check").each(function(){ 
       if( $(this).is(":checked")){
           count++;
           
           if(count == 1){
              primero =  $(this).parent().parent().attr("data-nro_pedido");
           }
           if(count == 2){
              segundo =  $(this).parent().parent().attr("data-nro_pedido");
           }
           if(count > 2){               
               $(this).removeAttr("checked");
               errorMsg("Solo se permite seleccionar dos Pedidos para Unificarlos, (Mover el detalle de uno a otro)",8000);
           }
       } 
   });
   if(count == 1){       
       // Aceptar Fade In
       $("#aceptar_pedido").removeAttr("disabled");
       $(".unificar").fadeOut();
       
   }else if(count == 2){
       $(".unificar").fadeIn();
       $("#aceptar_pedido").prop("disabled",true);
       $("#bt0").val("Unificar "+primero +" >> "+ segundo);
       $("#bt1").val("Unificar "+segundo +" >> "+ primero);     
       $("#bt0").click(function(){
           unificarPedidos(primero,segundo)
       });
       $("#bt1").click(function(){
           unificarPedidos(segundo,primero)
       });
   }else{
       $(".unificar").fadeOut();
       //Aceptar FadeOut
       $("#aceptar_pedido").prop("disabled",true);
   }
}
function unificarPedidos(a,b){
    if(!$(".unificar").prop("disabled") ){
        $(".unificar").prop("disabled",true);
        var c = confirm("Los detalles del Pedido "+a+" se moveran al Pedido "+b+", Favor confirme esta accion.");
        if(c){
            $.post( "Ajax.class.php",{ action: "unificarPedidos",a:a,b:b,usuario:getNick()}, function( data ) {                
                copyFromPedidos();
            });        
        }
    }
}
function totalizar(){
    var subtotal = 0;

    $(".subtotal").each(function(){
       var v = parseFloat($(this).text());
       subtotal+=v;
    }); 
   
    $("#total_entrada").val(parseFloat(subtotal).format(2, 3, '.', ','));
    
    
    var gastos = 0;
    $(".gasto").each(function(){
       var g =     parseFloat($(this).val());  
       gastos += g;      
    });
    
    var impuesto = subtotal * 10 /100;
    var impuesto_formated = (impuesto).format(2, 3, '.', ',');
    $("#impuesto").val(impuesto_formated);
    
    var total_gastos = subtotal + gastos + impuesto; 
    var total_formated = (total_gastos).format(2, 3, '.', ',');
    var gastos_formated = (gastos).format(2, 3, '.', ',');
    $("#total_gastos").val(gastos_formated);
    $("#mercaderias_gastos").val(total_formated);
    
    
}
function copiar(i){
   var invoice =   $("#copy_fila_"+i+" > td:nth-child(1)").text(); 
   var cod_prov =  $("#copy_fila_"+i+" > td:nth-child(2)").text();
   var ruc =       $("#copy_fila_"+i+" > td:nth-child(3)").text();
   var proveedor =  $("#copy_fila_"+i+" > td:nth-child(4)").text();
   var moneda =  $("#copy_fila_"+i+" > td:nth-child(5)").text();
   var fecha =  $("#copy_fila_"+i+" > td:nth-child(6)").text();
   var origen =  $("#copy_fila_"+i+" > td:nth-child(8)").text();
   var coment =  $("#copy_fila_"+i).attr("data-coment");
   nro_pedido_compra = $("#copy_fila_"+i).attr("data-nro_pedido");  
   
   $("#codigo_proveedor").val(cod_prov);
   $("#ruc_proveedor").val(ruc);
   $("#nombre_proveedor").val(proveedor);
   $("#invoice").val(invoice);
   $("#fecha").val(fecha);
   $("#codigo_proveedor").val(cod_prov);
   $("#moneda").val(moneda);
   $("#inv_obs").val(coment);
   $('#n_nro').val(nro_pedido_compra);
   $('#pais option').each(function () {       
        var v = $(this).val();     
        var text = $(this).text();         
        if(text == origen){
          $('#pais').val(v);
          return;        
        }   
    });   
   $(".copy_from").fadeOut(); 
   checkform();
   
}
function cerrarCopyFrom(){
    $(".copy_from").fadeOut(); 
    $("#copy_from_invoice").removeAttr("checked");
    $(".copy_from_pedidos").fadeOut();
    $("#check_copy_from_pedidos").removeAttr("checked");    
}
 
function cargarDetalleEntrada(id_ent){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getDetalleEntradaMercaderias", id_ent: id_ent},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("Cargando Detalle. <img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            for (var i in data) { 
                var id_ent = data[i].id_ent;
                var id_det = data[i].id_det; 
                var nro_pedido = data[i].nro_pedido;   
                var id_pack = data[i].id_pack;   
                var store_no = data[i].store_no;   
                var bale = data[i].bale;   
                //var piece = data[i].piece;   
                var codigo = data[i].codigo;   
                var lote = data[i].lote;                   
                var descrip = data[i].descrip;   
                var um = data[i].um;   
                var cod_catalogo = data[i].cod_catalogo+"-"+data[i].fab_color_cod;   
                
                var precio = data[i].precio;   
                var cantidad = data[i].cantidad;   
                var subtotal = data[i].subtotal;   
                var color = data[i].color;   
                var color_comb = data[i].color_comb;   
                var design = data[i].design;   
                var composicion = data[i].composicion;   
                var ancho = data[i].ancho;   
                var gramaje = data[i].gramaje;   
                var obs = data[i].obs; 
                var cant_calc = data[i].cant_calc; 
                var um_prod = data[i].um_prod; 
                var nro_lote_fab = data[i].nro_lote_fab; 
                var gram_class = "";
                var ancho_class = "";
                
                
                if(um_prod != 'Unid'){
                    if(gramaje <= 0){
                        gram_class = "input_err";
                    }
                    if(ancho <= 0){
                        ancho_class = "input_err";
                    }
                }
                $("#detalle_entrada").append('<tr id="tr_'+id_ent+'_'+id_det+'" class="fila_ent '+um+'" onclick=editar("'+id_ent+'_'+id_det+'")> \n\
                    <td class="item">'+store_no+'</td> \n\
                    <td class="num">'+bale+'</td>\n\
                    <td class="item codigo">'+codigo+'</td>\n\
                    <td class="item">'+lote+'</td>\n\
                    <td class="item">'+descrip+'</td> \n\
                    <td class="item color">'+color+'</td>\n\
                    <td class="item color_comb">'+color_comb+'</td>\n\
                    <td class="item">'+cod_catalogo+'</td> \n\\n\
                    <td class="item">'+nro_lote_fab+'</td> \n\
                    <td class="num ancho '+ancho_class+'">'+ancho+'</td>\n\
                    <td class="num gramaje '+gram_class+'">'+gramaje+'</td>\n\\n\
                    <td class="item design">'+design+'</td>\n\
                    <td class="itemc">'+um+'</td>\n\
                    <td class="num">'+cantidad+'</td>\n\
                    <td class="num">'+precio+'</td>\n\
                    <td class="num subtotal">'+subtotal+'</td>\n\
                    <td class="itemc">'+um_prod+'</td>\n\
                    <td class="num">'+cant_calc+'</td>\n\
                    <td class="itemc"><img class="del_det trash" title="Borrar Esta Pieza" style="cursor:pointer" src="img/trash_mini.png" onclick=delDet("'+id_ent+'_'+id_det+'");></td></tr>');
            }   
            $("#msg").html(""); 
            getGastos();
            if(estado == "Abierta"){      
              controlarDatosServer();
            }
            
        }
    });  
}
function getGastos(){
    var ref = $("#ref").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getGastosEntradaMerc", ref: ref},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {  
            var total = 0;
            var gastos = 0;
            for (var i in data) {   id_gasto, cod_gasto,nombre_gasto,valor
                var id_gasto = data[i].id_gasto;
                var cod_gasto = data[i].cod_gasto; 
                var nombre_gasto = data[i].nombre_gasto; 
                var valor = parseFloat(data[i].valor); 
                gastos +=valor;
                total +=valor;
                $("#expenses").append("<tr><td><label>"+nombre_gasto+":</td><td style='width:20%' ><input class='gasto' id='id_gasto_"+id_gasto+"' onchange='guardarGasto("+id_gasto+")' type='text' value='"+valor+"' style='text-align:right;margin-right:2px' size='16'><span id='sp_"+id_gasto+"'></span></td><tr>");
            }   
            var total_entrada =   parseFloat($("#total_entrada").val()); //$("#total_entrada").val(parseFloat(total).format(2, 3, '.', ','));
            var impuesto = total_entrada * 10 / 100;
            
            total +=total_entrada + impuesto;
            var gastos_formated = (gastos).format(2, 3, '.', ',');
            var total_formated = (total).format(2, 3, '.', ',');
            var impuesto_formated = (impuesto).format(2, 3, '.', ',');
            $("#expenses").append("<tr><td><label><b>Total Gastos:</b></td><td style='width:20%' ><input id='total_gastos' type='text' readonly='readonly' value='"+gastos_formated+"' style='text-align:right;margin-right:2px' size='16' ><div style='width:140px'></div></td><tr>");
            $("#expenses").append("<tr><td><label><b>Inpuesto:</b></td><td style='width:20%' ><input id='impuesto' type='text' readonly='readonly' value='"+impuesto_formated+"' style='text-align:right;margin-right:2px' size='16' ><div style='width:140px'></div></td><tr>");
            $("#expenses").append("<tr><td><label><b>Total Mercaderias + Gastos:</b></td><td style='width:20%' ><input id='mercaderias_gastos' type='text' readonly='readonly' value='"+total_formated+"' style='text-align:right;margin-right:2px' size='16' ><div style='width:140px'></div></td><tr>");
            totalizar();
            $("#msg").html(""); 
            if(estado == "Abierta"){     
              controlarCotizacion();
            }else{
                $("input[type=text]").attr("readonly",true);
            }
        }
    });
}
function controlarDatosServer(){
     
    var filas = $(".fila_ent").length;
    if(filas > 0){
    var id_ent = $("#ref").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "verificarDatosEntradaMercaderia", id_ent:id_ent},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_bottom").removeClass("error");
            $("#msg_bottom").addClass("info");
            $("#msg_bottom").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $(".input_err").removeClass("input_err");
        },
        success: function (data) {  
            var cant_errores = 0;
            var primero = 0;
            for (var i in data) { 
                var arreglo = data[i];    
                var id_det = arreglo.id_det;   
                var errores = arreglo.errores; 
                if(i == 0){
                    primero = id_det;
                }
                for(var t = 0;t < errores.length;t++){
                    var e = errores[t]; 
                    $("#tr_"+id_ent+"_"+id_det).find("."+e).addClass("input_err");
                    cant_errores++;
                }
            }            
            if(cant_errores > 0){
                $("#msg_bottom").addClass("error");
                $("#msg_bottom").html("<img src='img/warning_red_16.png' width='16px' height='16px' > Debe corregir los errores antes de generar los lotes..."); 
                var top = $("#tr_"+id_ent+"_"+primero).position().top;
                scrollWindows(top - 50);
                errorMsg("Existen datos incorrectos favor corregir antes de Generar los Lotes.",20000);
            }else{
                generarLotes();
                $("#msg_bottom").html(""); 
            }      
            
        }
    });
   
    }else{
        errorMsg("Debe cargar al menos un articulo para poder cargar.",8000);
    }
 
}
function controlarCotizacion(){
    var moneda = $("#moneda").val();
    if(moneda != "G$"){
    var fecha = validDate($("#fecha").val()).fecha;
    $.post( "Ajax.class.php",{ action: "controlarCotizacionEntradaMercaderias",moneda:moneda,fecha:fecha,suc:getSuc()}, function( data ){            
       var estado = data.estado;
       var mensaje = data.mensaje;
       if(estado == "Ok"){
           cotizacion_sap = true;    
           $("#moneda").css("border","solid gray 1px");
       }else{
           errorMsg(mensaje,60000);
           cotizacion_sap = false;
           $("#moneda").css("border","solid red 1px");
       }
        
    },'json');
   }
}
function guardarGasto(id_gasto){
    var id_ent = $("#ref").val();
    var valor = $("#id_gasto_"+id_gasto).val();
    $("#sp_"+id_gasto).html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
    $.post( "Ajax.class.php",{ action: "guardarGastoEntradaMerc",id_ent:id_ent,id_gasto:id_gasto,valor:valor}, function( data ) {   
        $("#sp_"+id_gasto).html("<img src='img/ok.png' width='16px' height='16px' >");
        totalizar();
    });         
}
function editar(tr_id){
   if(estado == "Abierta"){      
        $(".selected").removeClass("selected"); 
        $("#tr_"+tr_id).addClass("selected");
        $(".insert").fadeOut();
        $(".edit").fadeIn();

        editing_id_ent = tr_id.split("_")[0];
        editing_id_det = tr_id.split("_")[1];

        editando = true;

        var codigo = $("#tr_"+tr_id+" :nth-child(3)").text();
        var descrip = $("#tr_"+tr_id+" :nth-child(5)").text();
        var um_prod = $("#tr_"+tr_id+" :nth-child(17)").text();
        var color = $("#tr_"+tr_id+" :nth-child(6)").text();
        var catalogo = $("#tr_"+tr_id+" :nth-child(8)").text().split("-");
        var color_comb = $("#tr_"+tr_id+" :nth-child(7)").text();
        var design = $("#tr_"+tr_id+" :nth-child(12)").text();        
        var nro_lote_fab = $("#tr_"+tr_id+" :nth-child(9)").text();
        var umc = $("#tr_"+tr_id+" :nth-child(13)").text();
        var ancho = $("#tr_"+tr_id+" :nth-child(10)").text();
        var gramaje = $("#tr_"+tr_id+" :nth-child(11)").text();
        var precio = parseFloat($("#tr_"+tr_id+" :nth-child(15)").text());
        var cantidad = parseFloat($("#tr_"+tr_id+" :nth-child(14)").text());
        var subtotal = precio * cantidad;

        $("#codigo").val(codigo);
        $("#descrip").val(descrip);
        $("#um").val(um_prod);
        $("#color").val(color);
        $("#catalogo").val(catalogo[0]);
        $("#cod_color").val(catalogo[1]);
        $("#color_comb").val(color_comb);
        $("#design").val(design);
        $("#nro_lot_fab").val(nro_lote_fab);
        $("#umc").val(umc);
        $("#ancho").val(ancho);
        $("#gramaje").val(gramaje);
        $("#precio").val(parseFloat(precio).format(2, 3, '.', ','));
        $("#cantidades").val(cantidad);
        $("#cantidad").val(cantidad);
        $("#piezas").val(1);   
        $("#subtotal").val(parseFloat(subtotal).format(2, 3, '.', ','));
        $("#codigo").focus();
        scrollWindows(0); 
   }
}

function setUm(){
   var umc = $("#umc").val();
   if(umc == "Unid"){
       $(".umgroup").fadeOut();  $(".umgroup").val(1);     
   }else{
       $(".umgroup").fadeIn(); $(".umgroup").val("");        
   }
}
function showContextMenu(){   
    if(editando){
        $("#cantidades").attr("rows",1);        
    }else{
        $("#cantidades").attr("rows",10);     
    }
    var precio = parseFloat($("#precio").val());
    if(!isNaN(precio) && precio  > 0){
       $(".tmp_row").remove(); 
       $("#edit_bale").slideDown("slow"); 
       var off = $("#piezas").offset(); 
       var h = $("#piezas").height();
       $('#edit_bale').offset({top: off.top + h + 2 ,left: off.left});    
       $("#precio").removeClass("input_err");
       $("#cantidades").focus();
   }else{
       errorMsg("Debe ingresar primero el precio.",6000);       
       $("#precio").addClass("input_err").focus();
   }
}
function actualizarCantidades(indicador){ // 1 replace 0 no replace
  var counter = 0;
  var qtys = $.trim($("#cantidades").val()).split("\n");
  if(editando){
    $("#cantidades").val(qtys[0]);
    qtys = $.trim($("#cantidades").val()).split("\n");
  }
  var precio = $("#precio").val()
  if(indicador == 1 ){
      precio = $("#precio").val().replace(",",".");
  }else{
      precio = $("#precio").val().replace(".","").replace(",",".");
  }
    
  if(isNaN(precio)){
     errorMsg("Ingrese el precio de costo de este Articulo",10000);  
  }
  $("#precio").val(parseFloat(precio).format(2, 3, '.', ','));
  var sub_total = 0;
  var total_um = 0;
  $.each(qtys, function(k){ 
     var cant = parseFloat(qtys[k]);
     var costo = precio * cant;
     sub_total+= costo;
     total_um+= cant * 1;
     counter++
  }); 
  if(!isNaN(sub_total) || !isNaN(total_um)){  
    $("#subtotal").val(parseFloat(sub_total).format(2, 3, '.', ','));
    $("#cantidad").val(parseFloat(total_um).format(2, 3, '.', ','));
    $("#piezas").val(counter);
  }else{
      $("#subtotal").val("");
      $("#cantidad").val("");
      $("#piezas").val("0");
  }
}

function closeCantPopup(){
    $("#edit_bale").slideUp("fast");  
}
function cancelarUpdate(){
  $(".insert").fadeIn();   
  $(".edit").fadeOut();
  editando = false;
}
function delDet(tr_id){
    if(estado == "Abierta"){     
    var c = confirm("Confirma que desea eliminar este registro?");
        if(c){
            var id_ent = tr_id.split("_")[0];
            var id_det = tr_id.split("_")[1];        
            $.post( "Ajax.class.php",{ action: "borrarDetalleEntradaMercaderia",id_ent:id_ent,id_det:id_det}, function( data ) {         
                $("#tr_"+tr_id).remove();
                cancelarUpdate();
                limpiarAreaCarga();
                totalizar();
            });   
        }
    }else{
      alert("Compra Cerrada no se puede Eliminar Lotes...");      
    }
}
function copiarPedido(){
    var ref = $("#ref").val();
    var invoice = $("#invoice").val();
    $.post( "Ajax.class.php",{ action: "copiarPedidoEnEntrada",invoice:invoice,ref:ref,nro_pedido:nro_pedido_compra}, function( data ) { 
        $("#area_carga").fadeIn("fast");
        cargarDetalleEntrada(ref); 
        setHotKeyArticulo();
        configAreaCarga();
    });     
}
function copiarPackingList(){     
    var ref = $("#ref").val();
    var invoice = $("#invoice").val();
    $.post( "Ajax.class.php",{ action: "copiarPackingListEnEntrada",invoice:invoice,ref:ref}, function( data ) { 
        $("#area_carga").fadeIn("fast");
        cargarDetalleEntrada(ref); 
        setHotKeyArticulo();
        configAreaCarga();
    }); 
}
function desabilitarInputs(){
    $("#codigo_proveedor").attr("readonly",true);
    $("#nombre_proveedor").attr("readonly",true).removeClass("editable");
    $("#ruc_proveedor").attr("readonly",true).removeClass("editable");
    $("#invoice").attr("readonly",true).removeClass("editable");
    $("#fecha").attr("readonly",true).removeClass("editable");
    $("#fecha").datepicker("option", "readonly", true);
    $("#moneda").attr("disabled",true); 
    $("#cotiz").attr("readonly",true).removeClass("editable");
    $("#suc").attr("readonly",true); 
    $("#tipo_doc_sap").attr("disabled",true); 
    $("#pais").attr("disabled",true);  
}
function seleccionarProveedor(obj){
    var proveedor = $(obj).find(".proveedor").html(); 
    var ruc = $(obj).find(".ruc").html();  
    var codigo = $(obj).find(".codigo").html(); 
 
    $("#ruc_proveedor").val(ruc);
    $("#nombre_proveedor").val(proveedor);
    $("#codigo_proveedor").val(codigo); 
     
    $( "#ui_proveedores" ).fadeOut("fast");
    $("#msg").html(""); 
     
}


function checkform(){
    console.log("checkForm");
    var cod_prov = $("#codigo_proveedor").val(); 
    var ruc = $("#ruc_proveedor").val(); 
    var nombre = $("#nombre_proveedor").val(); 
    var invoice = $("#invoice").val(); 
    var fecha = validDate($("#fecha").val()).fecha;
    var cotiz = $("#cotiz").val();
    var pais = $("#pais").val();
    var tipo = $("#tipo_doc_sap").val();
    var timbrado = $("#timbrado").val();
    if(tipo == "OIGN" && fecha.length == 10 && nro_pedido_compra > 0 ){         
        controlarInvoice();
    }else if(cod_prov.length > 2 && ruc.length > 2 && nombre.length > 2 && invoice.length > 2 && fecha.length == 10 && cotiz.length > 0 && pais.length > 1 && nro_pedido_compra > 0  ){        
        if(tipo == "OPCH" && timbrado == ""){
            $("#boton_generar").attr("disabled",true);
            errorMsg("Timbrado no puede ser vacio para tipo documento Factura de Proveedor",8000);
        }else if(tipo == "OPCH"){
            controlarInvoice();
        }else{
            controlarInvoice();
        }        
    }else{
        $("#boton_generar").attr("disabled",true);
    }
}

function generarLotes(){
    
    
    $("#msg_obs").html("Generando Lotes. <img src='img/loading_fast.gif' width='16px' height='16px' >"); 
    $("#generar_lotes").attr("disabled",true);
    
     
    var ids = new Array();
    
    $(".fila_ent").each(function(){    
        var id = $(this).attr("id").substring(3,60);
        var rf = id.split("_")[0];
        var det_id = id.split("_")[1];
        var lote = $("#tr_"+id+" td:nth-child(4)").text();
        if( lote.length < 1){
           ids.push(det_id); 
           $("#tr_"+rf+"_"+det_id+" td:nth-child(4)").html("<img src='img/loading_fast.gif' width='12px' height='12px'>"); 
        }          
    });
    
    ids = JSON.stringify(ids);
     
    var ref = $("#ref").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "generarLoteEntradaMercaderia", id_ent: ref,ids:ids},
        async: true,
        dataType: "json",
        beforeSend: function () { 
           $("#msg_obs").html("Generando Lotes espere...<img src='img/loading_fast.gif' width='12px' height='12px' >");
        },
        success: function (data) {           
          $.each(data,function(id_det,lote){ 
              $("#tr_"+ref+"_"+id_det+" td:nth-child(4)").html(lote);                    
          });
          $("#msg_obs").html("Ok, lotes generados...");      
        }
    }); 
    
    
    $("#msg_obs").html("");     
    
    $("#finalizar").removeAttr("disabled");
} 
function finalizar(){  
    var error_lotes = 0;
    var filas = $(".fila_ent").length;
    
    if(filas > 0){
      
    $(".fila_ent").each(function(){    
        var id = $(this).attr("id").substring(3,60);       
        var lote = $("#tr_"+id+" td:nth-child(4)").text();
        if( lote.length < 1){
            error_lotes++;
        }        
    });
    if(error_lotes > 0){
        errorMsg("Falta generar al menos "+error_lotes+" lotes...",6000);  
        return;
    } 
     
    if(colores_incorrectos > 0){
        errorMsg("Falta corregir al menos "+colores_incorrectos+" colores...",18000);  
        return;
    }
    if(!cotizacion_sap){
       errorMsg("Establesca el Tipo de Cambio en SAP para la fecha de hoy y del documento o Factura...",18000);   
       return;
    }  
    
    
    $("#finalizar").attr("disabled",true);    
    var ref = $("#ref").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "cerrarEntradaMercaderias", usuario: getNick(), ref: ref},
        async: true,
        dataType: "html",        
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);  
                if(result == "Ok"){
                   $("#estado").val("Cerrada");
                   $("#area_carga").fadeOut();
                   $("input[type=text]").attr("readonly",true);
                    $(".control").fadeOut();
                    $("#inv_obs").attr("readonly",true);
                   estado = "Cerrada";
                   $("#msg").html("<img src='img/ok.png' width='16px' height='16px' >"); 
                   $("#msg_obs").html("Cerrada <img src='img/ok.png' width='16px' height='16px' >"); 
                   infoMsg("Entrada Cerrada con exito, puede tardar unos minutos para ver los resultados en SAP",25000)
                }else{
                   errorMsg("Ocurrio un error en la comunicacion con el Servidor... Mensaje de Error:" + result +"",20000);   
                }                
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
    }else{
        errorMsg("Debe cargar al menos un artículo para poder cerrar",8000);
    }
    
}

function controlarInvoice(){
    console.log("controlarInvoice");
    var invoice = $("#invoice").val(); 
    var cod_prov = $("#codigo_proveedor").val(); 
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "controlarEntradaMercaderias", "invoice": invoice, "cod_prov": cod_prov},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("Verificando datos. <img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);     
                if(result == "Ok"){
                    $("#boton_generar").removeAttr("disabled")
                }else{
                    $("#boton_generar").attr("disabled",true);
                    errorMsg(result,10000);            
                }
                $("#msg").html("");
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            errorMsg("Ocurrio un error en la comunicacion con el Servidor...",10000);            
        }
    }); 
}

  
function mostrar(){}
function cerrar(){
    $("#ui_proveedores").fadeOut();
}
function setDefaultDataNextFlag(){
    data_next_time_flag = true;
}
function setHotKeyArticulo(){
    $("#codigo").keydown(function(e) {
        
        var tecla = e.keyCode; 
        if (tecla == 27) {
            $("#ui_articulos").fadeOut();
            escribiendo = false;   
        }
        if (tecla == 38) {
            (fila_art == 0) ? fila_art = cant_articulos-1 : fila_art--;
            selectRowArt(fila_art);
        }
        if (tecla == 40) {
            (fila_art == cant_articulos-1) ? fila_art = 0 : fila_art++;
            selectRowArt(fila_art);
        }
        if (tecla != 38 && tecla != 40 && tecla != 13 && tecla != 9 ) { //9 Tab 38-40 Flechas Arriba abajo
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

function updateNotes(){
    $("#msg_obs").html("Guardando Notas... <img src='img/loading_fast.gif' width='16px' height='16px' >"); 
    var ref = $("#ref").val();
    var notes = $("#inv_obs").val();
    $.post( "Ajax.class.php",{ action: "updateEntradaNotes",ref:ref,notes:notes}, function( data ) {
         $("#msg_obs").html("<img src='img/ok.png' width='16px' height='16px' >");      
    });  
}

function seleccionarArticulo(obj){
    var codigo = $(obj).find(".codigo").html();
    var sector = $(obj).find(".Sector").html(); 
    var nombre_com = $(obj).find(".NombreComercial").html();  
    var precio = $(obj).attr("data-precio");
    var precio_costo = parseFloat($(obj).attr("data-precio_costo").replace(".","").replace(",","."));
    
    var ancho = $(obj).attr("data-ancho");
    var gramaje = $(obj).attr("data-gramaje");
    var um = $(obj).attr("data-um");
    var composicion = $(obj).attr("data-comp");
    if(isNaN(gramaje)){
        gramaje = "";
    }
    if(isNaN(ancho)){
        ancho = "";
    }
    
    $("#codigo").val(codigo);
    $("#descrip").val(sector+"-"+nombre_com);
    $("#um").val(um);
    $("#ancho").val(ancho);
    $("#gramaje").val(gramaje);
    $("#composicion").val(composicion);    
    $("#ui_articulos").fadeOut();
    
    
    console.log("precio_costo: "+precio_costo);
     
    
    if(  precio_costo > 0 ){
       $("#precio").val(precio_costo);
    }else{
       $("#precio").val(precio); 
    }
    
    
    
    $("#color").focus();
    
    if(um == "Mts"){
        $(".c_unid").prop("disabled",true);
        $(".c_metros").removeAttr("disabled");
         $("#umc").val("Mts");
    }else{// Inid
        $(".c_metros").prop("disabled",true);
        $(".c_unid").removeAttr("disabled");
        $("#umc").val("Unid");
    }
}
 
function buscarArticulo(){
    var articulo = $("#codigo").val();
    fila_art = 0;
    if(articulo.length > 0){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "buscarArticulos", "articulo": articulo,"cat":1},
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
                    var UM = data[i].um;
                    var Ancho = parseFloat((data[i].ancho)).format(2, 3, ',', '.');
                    var Gramaje = parseFloat((data[i].gramaje)).format(0, 3, '.', ',');
                    var PrecioCosto = parseFloat((data[i].PrecioCosto)).format(0, 3, '.', ',');
                    var Composicion = data[i].composicion;
                    $("#lista_articulos") .append("<tr class='tr_art_data fila_art_"+i+"' data-precio='"+Precio+"' data-precio_costo='"+PrecioCosto+"' data-um='"+UM+"' data-ancho='"+Ancho+"' data-gramaje='"+Gramaje+"' data-comp='"+Composicion+"'><td class='item clicable_art'><span class='codigo' >"+ItemCode+"</span></td>   <td class='item clicable_art'><span class='Sector'>"+Sector+"</span> </td><td  class='item clicable_art'><span class='NombreComercial'>"+NombreComercial+"</span></td><td class='num clicable_art'><span>"+Ancho+"</span></td><td class='num clicable_art'><span>"+Precio+"</span></td></tr>");                                                      
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

function selectDesigns(){
    if(!loadDesings){
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getDesignsImages"},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) { 
                //console.log(data);
                for (var i in data) { 
                   var key = data[i].key;
                   var name = data[i].name;
                   var thums = data[i].thumnails;
                   var ul = '<ul id="'+key+'" data-name="'+name+'" >';
                   for (var i = 0; i < thums.length; ++i) {
                       var img = thums[i];
                       var class_ = "";
                       if(i == 0 ){
                           class_ = "class='lastitem'";      
                       }
                       ul += '<li '+class_+'><img title="'+name+'" src="img/PATTERNS/'+key+'/'+img+'" height="46"  ></li>'; 
                   }

                   ul += '</ul>';
                   $("#designs_container").append(ul);
                   //console.log(key+"  "+name+"  "+thums);

                }
                $("#designs_container li").click(function() {
                    var name = $(this).parent().attr("data-name");
                    $("#design").val(name);
                    $("#designs_container").fadeOut();
                });
                loadDesings = true;
                $("#msg").html(""); 
            }
        });
    }
    var window_width = $(document).width()  / 2;
    var desing_width = $("#designs_container").width()  / 2;   
    var  posx = (window_width - desing_width) ;        
    posx = posx+"px";  
    $("#designs_container").css({left:posx,top:50});   
    $("#designs_container").fadeIn();   
}
function hideDesigns(){
    $("#designs_container").fadeOut();
}
function limpiarListaArticulos(){    
    $(".tr_art_data").each(function () {   
       $(this).remove();
    });    
} 
function infoTipo(){
    $("#msg_info").fadeIn();
    setTimeout(function(){
       $("#msg_info").fadeOut("slow"); 
    },10000);
}
function eliminarEntrada(ref){
    $("#"+ref).children().html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
    $.post( "Ajax.class.php",{ action: "eliminarEntradaMercaderia", ref:ref}, function( data ) { 
        $("#"+ref).remove();         
    });
}
function onlyNumbers(e){
        //e.preventDefault();
	var tecla=new Number();
	if(window.event) {
		tecla = e.keyCode;
	}else if(e.which) {
		tecla = e.which;
	}else {
	   return true;
	} 
        
        if(tecla === "13"){
              
        }
        //console.log(e.keyCode+"  "+ e.which);
	if((tecla >= "97") && (tecla <= "122")){
		return false;
	}
}  
 function scrollWindows(pixels) {
    $("#work_area").animate({
        scrollTop: pixels
    }, 250);
 } 
 


