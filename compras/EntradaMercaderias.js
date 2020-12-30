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
var designs = [];
var monedas = [];

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

var entrada_directa_sin_invoice = false;

var pedidos = new Array();

var precios = {};


function preconfigurar() { 
    inicializarCursores("clicable");
    $(".clicable").click(function() {
        var id = $(this).parent().attr("id");
        var nro_pedido = $(this).parent().attr("data-nro_pedido");
        cargarEntrada(id, nro_pedido);
    });
    $("#pais").val($("#pais option:nth-child(1)").val())
        //$("#pais").val("PY");
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
                "sLast": "�ltimo",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            },
        }
    });   
     
}

function configurarEntradaMercaderias() {
   
    //$( "#fecha" ).datepicker({ dateFormat: 'dd-mm-yy' }   ); 
    $("#fecha").mask("99-99-9999");

    $("select > option:nth-child(even)").css("background", "#F0F0F5"); // Color Zebra para los Selects  
    $(".check").change(function() {
        var v = $(this).val();
        if (v.length < 1) {
            $(this).addClass("input_err");
        } else {
            $(this).removeClass("input_err");
        }
        checkform();
        if ($(this).attr("id") == "fecha") {
            //controlarCotizacion();
        }
    });

    //$("#pais").val( $("#pais option:nth-child(1)").val())
    $("#pais").val("PY");
    $("#proveedor").change(function() {
        if ($(this).val() == "Nacional") {
            $(".internacional").fadeOut();
            $(".nacional").fadeIn();
        } else {
            $(".internacional").fadeIn();
            $(".nacional").fadeOut();
        }
    });
    
    $("#tipo_doc_sap").change(function() {
        var tipo = $(this).val();
        if (tipo == "OPDN") {
            $("#button_entrada_directa").fadeIn();
            $("#proveedor").val("Internacional");
            $("#pais").val("CN");
        } else {
            $("#button_entrada_directa").fadeOut();
            $("#proveedor").val("Nacional");
            $("#pais").val("PY");
        }
        if (tipo == "OPDN" || tipo == "OIGN") {
            $(".timbrado").fadeOut();
            $(".timbrado").removeClass("check");
        } else {
            $(".timbrado").fadeIn();
            $(".timbrado").addClass("check");
            $(".timbrado").focus();
        }
        if (tipo == "OIGN" && nro_pedido_compra < 1) {
            var c = confirm("Se debe generar un pedido para relacionar con esta entrada, Desea generar un Pedido ahora?");
            if (c) {
                crearPedidoCompra();
            }
        }
    });
    $("#subtotal").change(function() {
        var subt = $(this).val();
        var cant = $("#cantidad").val();
        var precio_dec = subt / cant;
        $("#subtotal").val(parseFloat(precio_dec).format(4, 3, '.', ','));
    });
    $("#cotiz").change(function() {

        var cot = $("#cotiz").val().replace(/\./g, ',');

        if (isNaN(parseFloat(cot))) {
            cot = 1;
        }
        $("#cotiz").val(cot);
    });
    
    setHotKeyArticulo();
   
    
}

function crearEntradaDirecta() {
    var c = confirm("Se creara un Pedido para relacionar con esta Carga no se copiara de Ningun Packing List, continuar?");
    if (c) {
        $("#button_entrada_directa").fadeOut();
        $(".internacional").fadeOut();
        $(".copy_detail").fadeOut();
        crearPedidoCompra();
        entrada_directa_sin_invoice = true;
    }
}

function crearPedidoCompra() {
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "crearPedidoDeCompra", "usuario": getNick(), "suc": getSuc() },
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
        },
        complete: function(objeto, exito) {
            if (exito == "success") {
                var result = $.trim(objeto.responseText);
                nro_pedido_compra = result;
                $("#n_nro").val(result);
                pedidos.push(result);
            }
            $("#msg").html("Ok..");
            checkform();
        },
        error: function() {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });
}

function cambiarEstado(estado) {
    if (checked != estado) {
        load("compras/EntradaMercaderias.class.php?estado=" + estado, { usuario: getNick(), session: (getCookie(getNick()).sesion), suc: getSuc() }, function() {
            preconfigurar();
        });
        checked = estado;
    }
}

function nuevaEntradaMercaderias() {
    
    var ses = getCookie(getNick()).sesion;
    //load("compras/NuevaEntradaMercaderias.class.php", { usuario: getNick(), session: ses, suc: getSuc() }); 
        
        //setTimeout("configurarEntradaMercaderias()",800);
    //});
    
    $.ajax({
            type: "POST",
            url: "compras/NuevaEntradaMercaderias.class.php",
            data: {usuario: getNick(), session: ses, suc: getSuc()},
            async:true,
            dataType: "html",
            beforeSend: function(objeto){ 
                  
                $("#work_area").html("<img id='loading' src='img/loading.gif'>");
            },
            complete: function(objeto, exito){
                if(exito==="success"){  
                    $("#work_area").html(objeto.responseText  );  
                     
                    configurarEntradaMercaderias();
                    
                }
            }
        }); 
}

function crearEntrada() {
    $("#boton_generar").attr("disabled", true);
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
    if (tipo == "OPCH" && timbrado == "") {
        $("#timbrado").focus();
        errorMsg("Timbrado no puede ser vacio para tipo documento Factura de Proveedor", 8000);
        return;
    }
    if (pedidos.length == 0) {
        pedidos.push($("#n_nro").val());
    }
    var nros_pedidos = JSON.stringify(pedidos);


    if (moneda != "G$" && cotiz == 1) {
        errorMsg("Cotizacion para " + moneda + " no puede ser 1", 8000);
        $("#cotiz").focus();
    } else {
        $.ajax({
            type: "POST",
            url: "compras/EntradaMercaderias.class.php",
            data: { "action": "crearEntradaMercaderias", usuario: getNick(), suc: suc, cod_prov: cod_prov, nombre: nombre, invoice: invoice, fecha: fecha, moneda: moneda, cotiz: cotiz, pais_origen: pais_origen, tipo: tipo, pedidos: nros_pedidos, timbrado: timbrado },
            async: true,
            dataType: "html",
            beforeSend: function() {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
            },
            complete: function(objeto, exito) {
                if (exito == "success") {
                    var result = $.trim(objeto.responseText);
                    $("#ref").val(result);
                    $("#msg").html("");
                    desabilitarInputs(); //check_copy_from_pedidos
                    $("#boton_generar").fadeOut();
                    if ($("#copy_from_invoice").is(":checked")) {
                        if ($("#copy_detail").is(":checked")) {
                            copiarPackingList();
                        }
                    } else if ($("#check_copy_from_pedidos").is(":checked")) {
                        if ($("#copy_detail").is(":checked")) {
                            copiarPedidos();
                        }
                    } else {
                        mostrarAreaCarga();
                    }
                }
            },
            error: function() {
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        });
    }
}

function cargarEntrada(id_ent, nro_pedido) {
    var usuario = getNick();
    var session = getCookie(usuario).sesion;
    load("compras/CargarEntradaMercaderias.class.php", { usuario: usuario, session: session, id_ent: id_ent, nro_pedido: nro_pedido }, mostrarAreaCarga);
}

function mostrarAreaCarga() {  
    estado = $("#estado").val();  
    if ($("#estado").val() == "Abierta") {
        $("#area_carga").fadeIn("fast", function() {
            $("#codigo").focus();
            setHotKeyArticulo();
            $("#area_carga").fadeIn();
            configAreaCarga();
        });
    } else {
        $("div#area_carga input[type=text]").attr("readonly", true);
        $(".control").fadeOut();
        $("#inv_obs").attr("readonly", true);
        if(estado == "Recibida"){
            $("#estado").click(function(){
                $(".back_invoice").fadeIn();
            }); 
        }
    }
    configAreaCarga();
    cargarDetalleEntrada($("#ref").val());
}
function volverAAbrirFactura(){
    var ref = $("#ref").val();
    $.ajax({
        type: "POST",
        url: "compras/EntradaMercaderias.class.php",
        data: {"action": "cambiarEstado", "ref": ref, "estado": "Abierta"},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);            
                if(result == "Ok"){
                    alert("Se ha cambiado el estado con exito!");
                    showMenu();
                }else{
                    $("#msg").html("Ocurrio un error en la comunicacion con el Servidor..."+ result);
                }                
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor... " );
        }
    }); 
}

function configAreaCarga() {

    $(".requerido").blur(function() {
        var v = $(this).val();
        if (v.length < 1) {
            $(this).addClass("input_err");
        } else {
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
    $("#color").blur(function() {
        var v = $(this).val();
        var inarr = $.inArray(v, colores);
        if (inarr == -1) {
            $("#msg").html("Color invalido, debe ser un color de la lista");
            $("#msg").addClass("error");
            setTimeout('$("#color").focus()', 300);
        } else {
            $("#msg").html("");
            $("#msg").removeClass("error");
            buscarImagenPantoneColorLiso();
        }
        controlarDatos();
    });
    $("#design").blur(function() {
        var v = $(this).val();
        var inarr = $.inArray(v, designs);
        if (inarr == -1) {
            $("#msg").html("Dise�o invalido, debe ser un dise�o de la lista");
            infoMsg("" + designs, 10000);
            $("#msg").addClass("error");
            setTimeout('$("#designs").focus()', 300);
        } else {
            $("#msg").html("");
            $("#msg").removeClass("error");
        }
        controlarDatos();
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
function controlarDatos() {
    datos_incorrectos = 0;
    $(".requerido").each(function() {
        var v = $(this).val();
        if (v.length < 1) {
            datos_incorrectos++;
            errorMsg("Hay campos requeridos...", 4000);
        }
        if ($(this).attr("id") != "um") {
            $(this).val(v.toUpperCase());
        }
    });
    $(".numero").each(function() {
        var v = $(this).val();
        var id = $(this).attr("id");
        if (isNaN(v)) {

            v = parseFloat($(this).val().replace(".", "").replace(",", "."));

        }

        if (isNaN(v) || v <= 0) {
            datos_incorrectos++;
            errorMsg("Hay numeros incorrectos..." + id, 4000);
        }

    });
    if (datos_incorrectos > 0) {
        $("#add_code").attr("disabled", true);
        $("#update").attr("disabled", true);
        if (datos_incorrectos > 0 && datos_incorrectos < 2) {
            errorMsg("Debe rellenar todos los campos.", 6000);
        }
    } else {
        $("#add_code").removeAttr("disabled");
        $("#update").removeAttr("disabled");
    }
    var cants = $("#cantidades").val();
    if (cants.length > 0) {
        $("#edit_bale").fadeOut();
    } else {
        $("#cantidades").focus();
    }
}

function limpiarAreaCarga() {
    $(".requerido").val("");
    $("#img").val("");
    $("#piezas").val("0");
}

function addCode() {
    $("#add_code").attr("disabled", true);
    var ref = $("#ref").val();
    var tipo = $("#tipo_doc_sap").val();
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
    var nro_lot_fab = $("#nro_lot_fab").val();
    var bale_no = $("#bale").val();
    var correlativo = $("#correlativo").is(":checked");
    var img = $.trim( $("#img").val() );
    var precio = parseFloat($("#precio").val().replace(".", "").replace(",", "."));
    var qtys = $.trim($("#cantidades").val()).split("\n");
    var qtys_array = new Array();
     
     console.log(img);
    $.each(qtys, function(k) {
        var cant = parseFloat(qtys[k]);
        qtys_array.push(cant)
    });
    qtys_array = JSON.stringify(qtys_array);
    if (nro_pedido_compra == 0) {
        nro_pedido_compra = $("#n_nro").val();
    }
    
    var entrada_directa = false;
    if(tipo == "OIGN"){
        entrada_directa = true;
    }

    $.ajax({
        type: "POST",
        url: "compras/EntradaMercaderias.class.php",
        data: {
            "action": "agregarDetalleEntrada",
            ref: ref,
            store_no: store_no,
            nro_pedido: nro_pedido_compra,
            codigo: codigo,
            um_art: um_art,
            descrip: descrip,
            color: color,
            catalogo: catalogo,
            cod_color: cod_color,
            corlo_comb: color_comb,
            design: design,
            composicion: composicion,
            umc: umc,
            ancho: ancho,
            gramaje: gramaje,
            cantidades: qtys_array,
            precio: precio,
            nro_lot_fab: nro_lot_fab,
            bale_no: bale_no,
            correlativo:correlativo,
            entrada_directa:entrada_directa,
            img:img
        },
        async: false,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
        },
        success: function(data) {
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
                var cod_catalogo = data[i].cod_catalogo + "-" + data[i].fab_color_cod;

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
                var img = "";
                var img_name = data[i].img;
                if(img_name != null){
                    img = '<img src="img/image.png" width="14" >';
                }
                

                $("#detalle_entrada").append('<tr id="tr_' + id_ent + '_' + id_det + '" class="fila_ent ' + um + '" onclick=editar("' + id_ent + '_' + id_det + '") > \n\
                <td class="item store_no">' + store_no + '</td> \n\
                <td class="num">' + bale + '</td>\n\
                <td class="item">' + codigo + '</td>\n\
                <td class="item">' + lote + '</td>\n\
                <td class="item">' + descrip + '</td> \n\
                <td class="item color">' + color + '</td>\n\
                <td class="item">' + color_comb + '</td>\n\
                <td class="item">' + cod_catalogo + '</td> \n\
                <td class="item">' + nro_lote_fab + '</td> \n\
                <td class="num">' + ancho + '</td>\n\
                <td class="num">' + gramaje + '</td>\n\\n\
                <td class="item">' + design + '</td>\n\
                <td class="itemc">' + um + '</td>\n\
                <td class="num">' + cantidad + '</td>\n\
                <td class="num">' + precio + '</td>\n\
                <td class="num subtotal">' + subtotal + '</td>\n\
                <td class="itemc">' + um_prod + '</td>\n\
                <td class="num">' + cant_calc + '</td>\n\
                <td class="itemc img" data-img='+img_name+'>' + img + '</td>\n\
                <td class="itemc"><img class="del_det trash" title="Borrar Esta Pieza" style="cursor:pointer" src="img/trash_mini.png" onclick=delDet("' + id_ent + '_' + id_det + '");></td></tr>');
            }
            $("#msg").html("");
            limpiarAreaCarga();
            totalizar();
            $("#finalizar").attr("disabled", true);
            $("#generar_lotes").removeAttr("disabled");
        }
    });

}
function sinFoto(){
    $("#img").val("0/0");
}
function update() {
    $("#update").attr("disabled", true);
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
    var nro_lot_fab = $("#nro_lot_fab").val();
    var composicion = "";
    var umc = $("#umc").val();
    var ancho = $("#ancho").val();
    var gramaje = $("#gramaje").val();
    var bale = $("#bale").val();
    var precio = parseFloat($("#precio").val().replace(".", "").replace(",", "."));
    var qtys = $.trim($("#cantidades").val()).split("\n");
    var img = $("#img").val();
     
    //var editing_id_ent = 0;
    //var editing_id_det = 0;

    $.each(qtys, function(k) {
        var cant = parseFloat(qtys[k]);
        //var costo = precio * cant;

        $.ajax({
            type: "POST",
            url: "compras/EntradaMercaderias.class.php",
            data: {
                "action": "modificarDetalleEntradaMercaderia",
                ref: ref,
                id_det: editing_id_det,
                store_no: store_no,
                codigo: codigo,
                um_art: um_art,
                descrip: descrip,
                color: color,
                catalogo: catalogo,
                cod_color: cod_color,
                corlo_comb: color_comb,
                design: design,
                composicion: composicion,
                umc: umc,
                ancho: ancho,
                gramaje: gramaje,
                cantidad: cant,
                precio: precio,
                nro_lot_fab: nro_lot_fab,
                bale: bale,
                img:img
            },
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
            },
            success: function(data) {
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
                    var cod_catalogo = data[i].cod_catalogo + "-" + data[i].fab_color_cod;

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
                    var img = "";
                    var img_name = data[i].img;
                    if(img_name != null){
                        img = '<img src="img/image.png" width="14" >';
                    }
                
                    $("#tr_" + id_ent + '_' + id_det + "").html(' \n\
                    <td class="item">' + store_no + '</td> \n\
                    <td class="num">' + bale + '</td>\n\
                    <td class="item">' + codigo + '</td>\n\
                    <td class="item">' + lote + '</td>\n\
                    <td class="item">' + descrip + '</td> \n\
                    <td class="item color">' + color + '</td>\n\
                    <td class="item">' + color_comb + '</td>\n\
                    <td class="item">' + cod_catalogo + '</td> \n\
                    <td class="item">' + nro_lote_fab + '</td> \n\
                    <td class="num">' + ancho + '</td>\n\
                    <td class="num">' + gramaje + '</td>\n\\n\
                    <td class="item">' + design + '</td>\n\
                    <td class="itemc">' + um + '</td>\n\
                    <td class="num">' + cantidad + '</td>\n\
                    <td class="num">' + precio + '</td>\n\
                    <td class="num subtotal">' + subtotal + '</td>\n\
                    <td class="itemc">' + um_prod + '</td>\n\
                    <td class="num">' + cant_calc + '</td>\n\
                    <td class="itemc img" data-img='+img_name+'>' + img + '</td>\n\
                    <td class="itemc"><img class="del_det trash" title="Borrar Esta Pieza" style="cursor:pointer" src="img/trash_mini.png" onclick=delDet("' + id_ent + '_' + id_det + '");></td>');
                }
                $("#msg").html("");
                limpiarAreaCarga();
                totalizar();
                //controlarDatosServer();
            }
        });
    });
}

function copyFromInvoice() {
    if ($("#copy_from_invoice").is(":checked")) {
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "getInvoicesNoCargados" },
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
                $(".copy_fila").remove();
                $(".copy_from").fadeIn();
                $(".copy_from").draggable();
            },
            success: function(data) {

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
                    $("#copy_from").append("<tr class='copy_fila' id='copy_fila_" + i + "' data-coment='" + coment + "' data-nro_pedido='" + nro_pedido_compra + "' ><td class='item'>" + invoice + "</td><td class='item'>" + cod_prov + "</td><td class='item'>" + ruc + "</td><td class='item'>" + proveedor + "</td><td class='itemc'>" + moneda + "</td><td class='itemc'>" + fecha + "</td><td class='num'>" + total + "</td><td class='itemc'>" + origen + "</td><td class='itemc'><input type='radio' name='copiar_de' onclick='copiar(" + i + ")' ></td></tr>");
                }

                $("#msg").html("");
            }
        });
    }
}

function copyFromPedidos() {
    $("#copy_detail").prop("checked", true);

    if ($("#check_copy_from_pedidos").is(":checked")) {
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "getPedidosNoCargados" },
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
                $(".copy_fila_pedidos").remove();
                $(".copy_from_pedidos").fadeIn();
                $(".copy_from_pedidos").draggable();
            },
            success: function(data) { //n_nro,usuario,  AS fecha,suc,Estado
                for (var i in data) {
                    var nro_pedido_compra = data[i].n_nro;
                    var usuario = data[i].usuario;
                    var fecha = data[i].fecha;
                    var suc = data[i].suc;
                    var estado = data[i].Estado;
                    var Items = data[i].Items;
                    var obs = data[i].obs;
                    if (obs == null) { obs = ""; }
                    $("#copy_from_pedidos").append("<tr class='copy_fila_pedidos' style='background:white' id='copy_fila_" + i + "' data-nro_pedido='" + nro_pedido_compra + "' ><td class='itemc showdetail' onclick='mostrarDetalle(" + i + ")'>" + nro_pedido_compra + "</td><td class='itemc'>" + usuario + "</td><td class='itemc'>" + fecha + "</td><td class='itemc'>" + suc + "</td><td class='itemc'>" + estado + "</td><td class='itemc'>" + Items + "</td> <td class='item'>" + obs + "</td><td class='itemc'><input type='checkbox' class='pedidos_check'  onclick='revisarMarcados(" + i + ")' ></td></tr>");
                    $("#copy_from_pedidos").append("<tr style='display:none' id='fila_detalle_" + i + "' ><td style='text-align:center'> <img src='img/arrow-up.png' onclick='ocultar(" + i + ")' heigth='16' width='16'> </td><td colspan='7'>\n\
                    <table class='detalle' border='1' id='detalle_" + i + "'><tr><th>Usuario</th><th>Suc</th><th>Codigo</th><th>Descrip</th><th>Color</th><th>Cantidad</th><th>Obs</th><th>Proveedor</th><th>Previsto</th><th><input type='checkbox' class='chek_all_" + i + "' onclick='checkear(" + i + ")' ></th></tr></table>\n\
                    </td></tr>");
                }
                //inicializarCursores("clicable");
                $("#msg").html("");
            }
        });
    }
}

function seleccionarPedido() {
    /*
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
    }*/

    $(".copy_from_pedidos").fadeOut();
}

function checkear(i) {
    console.log(i);
    $(".ped_" + i).find(".chek_det").each(function() {
        var c = $(this).is(":checked");
        $(this).prop("checked", !c);
    });
}

function ocultar(i) {
    $("#fila_detalle_" + i).slideUp();
}

function cancelarPedido(nro){
 var obs = $("#obs_"+nro).val();   
 if(obs.length < 5){
     alert("Ingrese un motivo para la cancelacion");
     return;
 }else{
    
    var arr = new Array();
     
    $(".chek_det").each(function(){
      var ch = $(this).is(":checked");
    
      var id= $(this).parent().parent().attr("id").substring(4,60);
      var ped= $(this).parent().parent().data("ped");
      if(ped === nro && ch ){
          arr.push(id);
      }   
   }); 
   var ids = JSON.stringify(arr);
   if(arr.length > 0){
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "cancelarDetallesDePedidoCompra", nro: nro,ids:ids,obs:obs},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                for (var i in data) { 
                    var rid = data[i].id_det;
                    $("#det_"+rid).remove();              
                }   
                $("#msg").html(""); 
            }
        });
    }else{
        alert("Marque al menos un pedido para cancelar.");
    }   
   
  }
}

function mostrarDetalle(j) {

    var nro = $("#copy_fila_" + j).attr("data-nro_pedido");
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "getDetallePedidosComprados", nro: nro },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#detalle_" + j + " .detail").remove();
            $("#detalle_" + j + " .cancel").remove();
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
        },
        success: function(data) {
            for (var i in data) {
                var id_det = data[i].id_det;
                var usuario = data[i].usuario;
                var suc = data[i].suc;
                var codigo = data[i].codigo;
                var descrip = data[i].descrip;
                var color = data[i].color;
                var cantidad = data[i].cantidad;
                var obs = data[i].obs;
                var c_prov = data[i].c_prov;
                var previsto = data[i].previsto;

                $("#detalle_" + j).append("<tr class='detail ped_" + j + "' data-ped=" + nro + " id='det_" + id_det + "'><td>" + usuario + "   </td><td>" + suc + "</td><td>" + codigo + "</td><td>" + descrip + "</td><td>" + color + "</td><td>" + cantidad + "</td><td>" + obs + "</td><td>" + c_prov + "</td><td>" + previsto + "</td>   </tr>");
            }
            $("#detalle_" + j).append("<tr class='cancel' ><td></td><td style='text-align:center' colspan='10'>Motivo cancelacion:<input type='text' id='obs_"+nro+"' size='40'> <input type='button' value='Cancelar' id='cancel_"+nro+"' onclick='cancelarPedido("+nro+")'> </td></tr>");
            /*
            $(".td_chk").each(function(){                    
                var chk = '<imput type="checkbox" class="chek_det" >';
                $(this).append(chk);
            });*/

            $(".detail").each(function() {
                var len = $(this).find(".chek_det").length;
                if (len < 1) {
                    $(this).append("<td><input type='checkbox' class='chek_det' ></td>");
                }
            });

            $("#msg").html("");
            $("#fila_detalle_" + j).slideDown();
        }
    });

}

function revisarMarcados(i) {
    while (pedidos.length) { pedidos.pop(); }
    var cadena_pedidos = "";
    $(".pedidos_check").each(function() {
        if ($(this).is(":checked")) {
            var nro_ped = $(this).parent().parent().attr("data-nro_pedido")
            pedidos.push(nro_ped);
            cadena_pedidos = cadena_pedidos + "[" + nro_ped + "] ";
        }
    });
    if (pedidos[0] == undefined) {
        nro_pedido_compra = "";
        $("#n_nro").val("");
    } else {
        nro_pedido_compra = pedidos[0];
        $("#n_nro").val(pedidos[0]);
    }

    $("#pedidos_marcados").html("Pedidos: " + cadena_pedidos);
    $(".pedidos_check").each(function() {
        if ($(this).is(":checked")) {
            $("#aceptar_pedido").removeAttr("disabled");
        }
    });
    checkform();
    /*
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
    }*/
}

function unificarPedidos(a, b) {
    if (!$(".unificar").prop("disabled")) {
        $(".unificar").prop("disabled", true);
        var c = confirm("Los detalles del Pedido " + a + " se moveran al Pedido " + b + ", Favor confirme esta accion.");
        if (c) {
            $.post("Ajax.class.php", { action: "unificarPedidos", a: a, b: b, usuario: getNick() }, function(data) {
                copyFromPedidos();
            });
        }
    }
}

function totalizar() {
    var subtotal = 0;
    var cotiz_factura = parseFloat($("#cotiz").val());
    $(".subtotal").each(function() {
        var v = parseFloat($(this).text());
        subtotal += v;
    });

    $("#total_entrada").val(parseFloat(subtotal).format(2, 3, '.', ','));
    
    var total_ref = parseFloat(subtotal * cotiz_factura);
    
    $("#total_entrada_ref").val(parseFloat(subtotal * cotiz_factura).format(0, 3, '.', ','));
 
    var gastos = 0;
    $(".gasto").each(function() {
        var g = parseFloat($(this).val().replace(/\./g,""));
        gastos += g;
    });

    var porc_recargo = (gastos * 100 / total_ref).toFixed(4);
    
    $("#porc_recargo").val(porc_recargo+"%");

    var total_gastos = (subtotal * cotiz_factura) + gastos ;
    var total_formated = (total_gastos).format(0, 3, '.', ',');
    var gastos_formated = (gastos).format(0, 3, '.', ',');
    $("#total_gastos").val(gastos_formated);
    $("#mercaderias_gastos").val(total_formated);


}

function copiar(i) {
    var invoice = $("#copy_fila_" + i + " > td:nth-child(1)").text();
    var cod_prov = $("#copy_fila_" + i + " > td:nth-child(2)").text();
    var ruc = $("#copy_fila_" + i + " > td:nth-child(3)").text();
    var proveedor = $("#copy_fila_" + i + " > td:nth-child(4)").text();
    var moneda = $("#copy_fila_" + i + " > td:nth-child(5)").text();
    var fecha = $("#copy_fila_" + i + " > td:nth-child(6)").text();
    var origen = $("#copy_fila_" + i + " > td:nth-child(8)").text();
    var coment = $("#copy_fila_" + i).attr("data-coment");
    nro_pedido_compra = $("#copy_fila_" + i).attr("data-nro_pedido");

    $("#codigo_proveedor").val(cod_prov);
    $("#ruc_proveedor").val(ruc);
    $("#nombre_proveedor").val(proveedor);
    $("#invoice").val(invoice);
    $("#fecha").val(fecha);
    $("#codigo_proveedor").val(cod_prov);
    $("#moneda").val(moneda);
    $("#inv_obs").val(coment);
    $('#n_nro').val(nro_pedido_compra);
    $('#pais option').each(function() {
        var v = $(this).val();
        var text = $(this).text();
        if (text == origen) {
            $('#pais').val(v);
            return;
        }
    });
    $(".copy_from").fadeOut();
    checkform();

}

function cerrarCopyFrom() {
    $(".copy_from").fadeOut();
    $("#copy_from_invoice").removeAttr("checked");
    $(".copy_from_pedidos").fadeOut();
    $("#check_copy_from_pedidos").removeAttr("checked");
}

function cargarDetalleEntrada(id_ent) {  
    $("#detalle_entrada tbody").empty();
    $.ajax({
        type: "POST",
        url: "compras/EntradaMercaderias.class.php",
        data: { "action": "getDetalleEntradaMercaderias", id_ent: id_ent },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("Cargando Detalle. <img src='img/loading_fast.gif' width='16px' height='16px' >");
        },
        success: function(data) {
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
                var cod_catalogo = data[i].cod_catalogo + "-" + data[i].fab_color_cod;
                
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
                var Obs = stringify(data[i].obs);
                var mnj_x_lotes = data[i].mnj_x_lotes;
                
                var img = "";
                var img_name = data[i].img;
                if(img_name != null){
                    img = '<img src="img/image.png" width="14" >';
                }
                //console.log(img_name);
                
                if (um_prod != 'Unid') {
                    if (gramaje <= 0) {
                        gram_class = "input_err";
                    }
                    if (ancho <= 0) {
                        ancho_class = "input_err";
                    }
                }
                var haveObs = '';
                var ult_td = '<td class="itemc"></td>';
                if(estado == "Recibida" || estado == "Cerrada"){                    
                    if (Obs.length > 0) {
                       haveObs = "<img title='"+Obs+"' src='img/warning_yellow_16.png' width='14px' height='14px' >"
                    }
                    ult_td = "<td class='itemc observ' id='obs_" + id_det + "' onclick='showObs(" + id_det + ")' style='cursor:pointer' data-obs='" + Obs + "' >" + haveObs + "</td>";
                }else{
                    if(estado == "Abierta" && Obs.length > 0){
                       haveObs = "<img title='"+Obs+"' src='img/warning_yellow_16.png' width='14px' height='14px' >" 
                       ult_td = '<td class="itemc"><img class="del_det trash" title="Borrar Esta Pieza" style="cursor:pointer" src="img/trash_mini.png" onclick=delDet("' + id_ent + '_' + id_det + '");>&nbsp;' + haveObs + '</td>';
                    }else{
                       ult_td = '<td class="itemc"><img class="del_det trash" title="Borrar Esta Pieza" style="cursor:pointer" src="img/trash_mini.png" onclick=delDet("' + id_ent + '_' + id_det + '");></td>';    
                    }
                    
                }
                
                $("#detalle_entrada tbody").append('<tr id="tr_' + id_ent + '_' + id_det + '" class="fila_ent ' + um + ' mnj_x_lotes_'+mnj_x_lotes+'" onclick=editar("' + id_ent + '_' + id_det + '")> \n\
                    <td class="item store_no">' + store_no + '</td> \n\
                    <td class="num">' + bale + '</td>\n\
                    <td class="item codigo">' + codigo + '</td>\n\
                    <td class="item lote">' + lote + '</td>\n\
                    <td class="item descrip">' + descrip + '</td> \n\
                    <td class="item color">' + color + '</td>\n\
                    <td class="item color_comb">' + color_comb + '</td>\n\
                    <td class="item cod_catalogo">' + cod_catalogo + '</td> \n\\n\
                    <td class="item nro_lote_fab">' + nro_lote_fab + '</td> \n\
                    <td class="num ancho ' + ancho_class + '">' + ancho + '</td>\n\
                    <td class="num gramaje ' + gram_class + '">' + gramaje + '</td>\n\\n\
                    <td class="item design">' + design + '</td>\n\
                    <td class="itemc">' + um + '</td>\n\
                    <td class="num">' + cantidad + '</td>\n\
                    <td class="num">' + precio + '</td>\n\
                    <td class="num subtotal">' + subtotal + '</td>\n\
                    <td class="itemc">' + um_prod + '</td>\n\
                    <td class="num">' + cant_calc + '</td>\n\
                    <td class="itemc img" data-img='+img_name+'>' + img + '</td>\n\
                    '+ ult_td +' </tr>');
            }
            $("#msg").html("");
            getGastos();
           
            if(estado == "Recibida"){
               $("#finalizar").removeAttr("disabled");
               $("#finalizar").fadeIn("disabled");
            }
            if(estado !== "Abierta" && estado !== "Cerrada"){
                $("#alerta_gastos").fadeIn(5000);
            }
            $("#bale").focus();
        }
    });
}

function showObs(AbsEntry) {
    var estado = $("#estado").val();
    if (estado !== "En_Transito") {
        $("#observ").attr("disabled", true);
    } else {
        $("#observ").removeAttr("disabled");
    }
    actual_AbsEntry = AbsEntry;

    $(".tmp_obs").removeClass("tmp_obs");

    var ref = $("#ref").val();

    var p = $("#tr_" +ref+"_"+ AbsEntry);

    var h = $("#tr_" +ref+"_"+ AbsEntry).height();
    var tr = p.position();
    

    var obs = $("#obs_" + AbsEntry).attr("data-obs");
    $("#obs_" + AbsEntry).addClass("tmp_obs");
    $("#obs").slideDown("slow");
    $("#observ").val($.trim(obs));
    $('#obs').animate({ top: tr.top + h  + "px" }, { queue: false, duration: 150 });
}
function getGastos() {
     
    var ref = $("#ref").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "getGastosEntradaMerc", ref: ref },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
            $(".row_gasto").remove();
        },
        success: function(data) {
            var total = 0;
            var gastos = 0;
            var cotiz_factura = parseFloat($("#cotiz").val());
             
            for (var i in data) { 
                 
                var cod_gasto = data[i].cod_gasto;
                var nombre_gasto = data[i].nombre_gasto;
                var valor = parseFloat(data[i].valor);
                var moneda = data[i].moneda;
                var cotiz = parseFloat(data[i].cotiz);
                var valor_ref = parseFloat(data[i].valor_ref);
                var valor_ref_f = (valor_ref).format(0, 3, '.', ',');
                
                var visible = 'style="display:none"';
                var fila_0 = ' cero';
                if(valor > 0){
                    visible = ""; 
                    fila_0 = "";
                }
                
                  
                var select = "<select class='gmonedas_"+cod_gasto+"'>"; 
                monedas.forEach(function(e){ 
                    var selected = "";
                    if(e === moneda){
                        selected = 'selected="selected"';   
                    }
                    select+="<option value='"+e+"' "+selected+">"+e+"</option>";
                });
                select+="</select>";   
                
                gastos += valor_ref;
                total += valor_ref;
                $("#expenses").append("<tr class='row_gasto "+fila_0+"' "+visible+" >\n\
                <td style='width:42%' class='item'> " + nombre_gasto + "</td> <td style='text-align:center'><input class='num tipo_gasto valor_" + cod_gasto + "' id='id_gasto_" + cod_gasto + "' onchange='guardarGasto(" + cod_gasto + ")' type='text' value='" + valor + "'   size='12'></td>\n\
                <td> "+select+"  </td>\n\
                <td style='text-align:center'><input class='num cotiz_"+ cod_gasto + " g_cotiz' id='cotiz_" + cod_gasto + "' onchange='guardarGasto(" + cod_gasto + ")' type='text' value='" + cotiz + "'   size='6'></td> \n\
                <td style='width:3%;text-align:center'  ><input class='gasto num valor_ref_"+ cod_gasto + "' id='valor_ref_" + cod_gasto + "' onchange='guardarGasto(" + cod_gasto + ")' type='text' readonly='readonly' value='" + valor_ref_f + "'   size='16'> </td>   \n\   \n\
                <td><span id='sp_" + cod_gasto + "'></span></td><tr>");
            }
            var total_entrada = parseFloat( $("#total_entrada").val(    ))  * cotiz_factura ;
            var impuesto = total_entrada * 10 / 100;

            
            total += total_entrada ;
            var gastos_formated = (gastos).format(2, 3, '.', ',');
            var total_formated = (total).format(2, 3, '.', ',');
            var impuesto_formated = (impuesto).format(2, 3, '.', ','); 

            $("#expenses").append("<tr class='row_gasto' ><td> <b>Total Gastos:</b></td><td></td><td></td><td></td> <td style='width:3%;text-align:center' ><input id='total_gastos' type='text' readonly='readonly' value='" + gastos_formated + "' style='text-align:right;margin-right:1px;font-weight:bolder' size='16' ><div style='width:140px'></div></td><tr>");
            $("#expenses").append("<tr class='row_gasto' ><td> <b>Porcentaje Recargo:</b></td><td></td><td></td><td></td> <td style='width:3%;text-align:center' ><input id='porc_recargo' type='text' readonly='readonly' value='' style='text-align:right;margin-right:1px;font-weight:bolder' size='16' ><div style='width:140px'></div></td><tr>");            
            $("#expenses").append("<tr class='row_gasto'><td> <b>Total Mercaderias + Gastos:</b></td><td>.</td><td  style='text-align:center'> <img id='mas_menos' src='img/button-add_blue.png' style='cursor:pointer;height:24px' onclick='masGastos()' > </td><td>.</td><td style='width:3%;text-align:center' ><input id='mercaderias_gastos'  type='text' readonly='readonly' value='" + total_formated + "' style='text-align:right;margin-right:1px;font-weight:bolder' size='16' ><div style='width:140px'></div></td><tr>");
            totalizar();
            if(estado == "Cerrada"){
                $("#expenses select").prop("disabled",true);
                $("#expenses .tipo_gasto").prop("readonly",true);
                $("#expenses .g_cotiz").prop("readonly",true);
                $("#mas_menos").remove();
            }
            $("#msg").html("");
            if (estado == "Abierta") {
                //controlarCotizacion();
            } else {
                $("div#area_ara input[type=text]").attr("readonly", true);
            }
        }
    });
}
function masGastos(){
    var src = $("#mas_menos").attr("src");
    if(src == "img/button-add_blue.png"){
        $("#mas_menos").attr("src","img/button_minus_blue.png"); 
        $(".cero").slideDown();
    }else{
        $("#mas_menos").attr("src","img/button-add_blue.png");
        $(".cero").slideUp();        
    }
}
function controlarDatosServer() {
    var filas = $(".fila_ent").length;
    if (filas > 0) {
        var id_ent = $("#ref").val();
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "verificarDatosEntradaMercaderia", id_ent: id_ent },
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg_bottom").removeClass("error");
                $("#msg_bottom").addClass("info");
                $("#msg_bottom").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
                $(".input_err").removeClass("input_err");
            },
            success: function(data) {
                var cant_errores = 0;
                var primero = 0;
                for (var i in data) {
                    var arreglo = data[i];
                    var id_det = arreglo.id_det;
                    var errores = arreglo.errores;
                    if (i == 0) {
                        primero = id_det;
                    }
                    for (var t = 0; t < errores.length; t++) {
                        var e = errores[t];
                        $("#tr_" + id_ent + "_" + id_det).find("." + e).addClass("input_err");
                        cant_errores++;
                    }
                }
                if (cant_errores > 0) {
                    $("#msg_bottom").addClass("error");
                    $("#msg_bottom").html("<img src='img/warning_red_16.png' width='16px' height='16px' > Debe corregir los errores antes de generar los lotes...");
                    var top = $("#tr_" + id_ent + "_" + primero).position().top;
                    scrollWindows(top - 50);
                    errorMsg("Existen datos incorrectos favor corregir antes de Generar los Lotes.", 20000);
                } else {
                    generarLotes();
                    $("#msg_bottom").html("");
                }

            }
        });
    } else {
        errorMsg("Debe cargar al menos un articulo para poder cargar.", 8000);
    }

}

function controlarCotizacion() {
    var moneda = $("#moneda").val();
    if (moneda != "G$") {
        var fecha = validDate($("#fecha").val()).fecha;
        if (fecha != "NaN-NaN-NaN") {
            $.post("Ajax.class.php", { action: "getCotizacionContable", moneda: moneda, fecha: fecha,suc:getSuc() }, function(data) {
                var estado = data.estado;
                var mensaje = data.mensaje;
                if (estado == "Ok") {
                    var cotiz = parseFloat(data.compra).format(0, 6, '.', ',');      
                    $("#cotiz").val(cotiz);
                    
                    $("#cotiz").attr("title","Fecha de cotizacion: "+data.fecha)
                    
                    cotizacion_sap = true;
                    //$("#moneda").css("border", "solid gray 1px");
                } else {
                    errorMsg("No hay cotizacion para: "+moneda+" y Fecha: "+fecha+" puede hacerlo en Menu: Administracion --> Finanzas --> Cotizaciones Contables", 30000);
                    //cotizacion_sap = false;
                    //$("#moneda").css("border", "solid red 1px");
                }

            }, 'json');
        }else{
            errorMsg("Debe cargar una fecha valida",8000);
        }
    }
}

function guardarGasto(cod_gasto) {
    var id_ent = $("#ref").val();
    var valor = parseFloat($(".valor_"+ cod_gasto).val());
    var cotiz = parseFloat($(".cotiz_"+ cod_gasto).val());
    var moneda = $(".gmonedas_"+ cod_gasto).val();
    var valor_ref = valor * cotiz;
    var valor_ref_formated = (valor_ref).format(0, 3, '.', ',');
    $(".valor_ref_" + cod_gasto).val(valor_ref_formated);
        
    $("#sp_" + cod_gasto).html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
    $.post("Ajax.class.php", { action: "guardarGastoEntradaMerc", id_ent: id_ent, cod_gasto: cod_gasto, valor: valor,moneda:moneda,cotiz:cotiz }, function(data) {
        $("#sp_" + cod_gasto).html("<img src='img/ok.png' width='16px' height='16px' >");
        $("#porc_recargo").val(data);
        totalizar();
    });
}

function editar(tr_id) {
    if (estado == "Abierta" && !$("div#toolbox").is(":visible")) {
        $(".selected").removeClass("selected");
        $("#tr_" + tr_id).addClass("selected");
        $(".insert").fadeOut();
        $(".edit").fadeIn();

        editing_id_ent = tr_id.split("_")[0];
        editing_id_det = tr_id.split("_")[1];

        editando = true;
        var bale = $("#tr_" + tr_id + " :nth-child(2)").text();
        var codigo = $("#tr_" + tr_id + " :nth-child(3)").text();
        var descrip = $("#tr_" + tr_id + " :nth-child(5)").text();
        var um_prod = $("#tr_" + tr_id + " :nth-child(17)").text();
        var color = $("#tr_" + tr_id + " :nth-child(6)").text();
        var catalogo = $("#tr_" + tr_id + " :nth-child(8)").text().split("-");
        var color_comb = $("#tr_" + tr_id + " :nth-child(7)").text();
        var design = $("#tr_" + tr_id + " :nth-child(12)").text();
        var nro_lote_fab = $("#tr_" + tr_id + " :nth-child(9)").text();
        var umc = $("#tr_" + tr_id + " :nth-child(13)").text();
        var ancho = $("#tr_" + tr_id + " :nth-child(10)").text();
        var gramaje = $("#tr_" + tr_id + " :nth-child(11)").text();
        var precio = parseFloat($("#tr_" + tr_id + " :nth-child(15)").text());
        var cantidad = parseFloat($("#tr_" + tr_id + " :nth-child(14)").text());
        var img = $("#tr_" + tr_id + " :nth-child(19)").attr("data-img");
        if(img == "null" || img == undefined ){
            img = "";
        }
        var subtotal = precio * cantidad;

        $("#bale").val(bale);
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
        $("#precio").val(parseFloat(precio).format(3, 3, '.', ','));
        $("#cantidades").val(cantidad);
        $("#cantidad").val(cantidad);
        $("#piezas").val(1);
        $("#subtotal").val(parseFloat(subtotal).format(2, 3, '.', ','));
        $("#codigo").focus();
        $("#img").val(img);
        scrollWindows(0);
         
        if(precios[codigo] == undefined){
            buscarPrecios(codigo);
            $("#ver_precios").fadeIn();  
            $(this).slideUp();
        }else{
            $("#ver_precios").fadeIn();   
        }
        
    } else if ($("div#toolbox").is(":visible")) {
        editarDatos(tr_id);
    }
}
function verPrecios(){
    var info = precios[$("#codigo").val()];
    $("#div_precios").html(info);
    $("#div_precios").slideDown();
    $("#div_precios").click(function(){
        $(this).slideUp();
    });
}

 function buscarPrecios(codigo){  //url: "compras/EntradaMercaderias.class.php",
    $.post( "compras/EntradaMercaderias.class.php",{ action: "getPreciosArticulo",codigo:codigo}, function( data ) {
        var precios_codigo = "";
         
        for(var i in data){ // Solo Necesito el 1 ahora  num ,moneda,um,precio
           var num = data[i].num;  
           var moneda = data[i].moneda;  
           var um = data[i].um;  
           var dec = 0;
           
           if(moneda === "U$"){  
               dec = 2;
           }
           var mon_ = moneda.replace("$","s");
           var p = parseFloat(data[i].precio).format(dec, 3, '.', ','); 
           precios_codigo+="<div class='"+mon_+"_"+um+"' > Precio "+num+"  -  "+moneda+"  -  "+um+"  : "+p+"</div>";                     
        }      
        precios[codigo] = precios_codigo;  
   },'json');      
 }

// Toolbox

function updateCount() {
    $("span#ent_cantCod").text($("tr.selected").length);
}


function editarDatos(tr_id) {
    var tr = $("#tr_" + tr_id);
    var selectFilter = {};

    $(".ent_group:checked").each(function() {
        var target = $(this).data("target");
        selectFilter[target] = tr.find("td." + target).text();
    });
    

    if (tr.hasClass("selected")) {
        tr.removeClass("selected");
    } else {
        if (Object.keys(selectFilter).length > 0) {

            $("tr[id^='tr_']").each(function() {
                var igual = true;
                var current = $(this);
                $.each(selectFilter, function(key, value) {
                    //console.log(selectFilter[key] + ', ' + current.find("td." + key).text());
                    if (selectFilter[key] != current.find("td." + key).text()) {
                        igual = false;
                    }
                });

                if (igual) {
                    $(this).addClass("selected");
                }
            });

        } else {
            tr.addClass("selected");
        }
    }
    updateCount();
}


function seleccionarTodos() {
    $("tr[id^='tr_']").addClass("selected");
    updateCount();
}

function seleccionarNinguno() {
    $("tr[id^='tr_']").removeClass("selected");
    updateCount();
}

function invertirSeleccion() {
    var tr = $($("tr[id^='tr_'].selected").get(0));
    var codigo = tr.find("td.codigo").text();
    var color = tr.find("td.color").text();

    $("tr[id^='tr_']").each(function() {
        var cur_codigo = $(this).find("td.codigo").text();
        var cur_color = $(this).find("td.color").text();

        //if ((cur_codigo === codigo && cur_color === color) || !$("input#mismo_color").is(":checked")) {
        if ($(this).hasClass("selected")) {
            $(this).removeClass("selected");
        } else {
            $(this).addClass("selected");
        }
        //}
    });
    updateCount();
}

function cerrarToolBox() {
    $("tr[id^='tr_']").removeClass("selected");
    $("div#toolbox").hide();
}

function abrirToolBox() {
    if($("input#estado").val() !== "Abierta"){
        $("button#eliminarSeleccionados").attr("Disabled",true);
    }
    $("div#toolbox").show();
}

function setUm() {
    var umc = $("#umc").val();
    if (umc == "Unid") {
        $(".umgroup").fadeOut();
        $(".umgroup").val(1);
    } else {
        $(".umgroup").fadeIn();
        $(".umgroup").val("");
    }
}

function showContextMenu() {
    if (editando) {
        $("#cantidades").attr("rows", 1);
    } else {
        $("#cantidades").attr("rows", 10);
    }
    var precio = parseFloat($("#precio").val().replace(".", "").replace(",", "."));
    if (!isNaN(precio) && precio > 0) {
        $(".tmp_row").remove();
        $("#edit_bale").slideDown("slow");
        var off = $("#piezas").offset();
        var h = $("#piezas").height();
        $('#edit_bale').offset({ top: off.top + h + 2, left: off.left });
        $("#precio").removeClass("input_err");
        $("#cantidades").focus();
    } else {
        errorMsg("Debe ingresar primero el precio.", 6000);
        $("#precio").addClass("input_err").focus();
    }
}

function eliminarSeleccionados(){
    var id_ent = $("#ref").val();
    var ids = [];
    $('html, body').css("cursor", "wait");
    $("tr[id^='tr_'].selected").each(function() {
        var id_det = $(this).attr("id").split('_')[2];
        ids.push(id_det);
    });
    $.post("Ajax.class.php", { "action": "eliminarSeleccionados", "id_ent": id_ent, "ids": JSON.stringify(ids)},function(data){
        if(parseInt(data.eliminados) !== ids.length){
            alert("Se eliminaron "+parseInt(data.eliminados)+" de "+ids.length+" seleccionados.\n Berifique!")
        }
        ids.forEach(function(id,i){
           $("tr#tr_"+id_ent+"_"+id).remove();
        });
        $('html, body').css("cursor", "auto");
    },"json")
    .error(function() {
        alert("Ocurrio un error al comunicar con el Servidor");
        $('html, body').css("cursor", "auto");
    });;
    
}
// Actualizar Datos
function cambiarValoresEntMercaderia() {
    // New
    var entMercUpdate = {};
    if ($("[id^='ch_'].error").length > 0) {
        alert("Existen campos con datos No Permitidos");
    } else {
        $("input.changes:checked").closest("tr").find("[id^='ch_']").each(function() {
            var row = $(this).prop("id").substr(3, $(this).prop("id").length - 1);
            var text = '';
            var value = '';

            text = $(this).val();
            value = $(this).data("Code");

            if (text.trim() !== '' && text !== undefined) {
                switch (row) {
                    case 'color':
                        entMercUpdate[row] = text;
                        entMercUpdate['cod_pantone'] = value;
                        break;
                    case 'codFab':
                        entMercUpdate['cod_catalogo'] = text.split('-')[0];
                        entMercUpdate['fab_color_cod'] = text.split('-')[1];
                        break;
                    default:
                        entMercUpdate[row] = text;

                }
            }
        });
    }
    if (Object.keys(entMercUpdate).length > 0) {
        $('html, body').css("cursor", "wait");
        var selectedColorCod = $("#ch_color").data("Code");
        var selectedColorName = $("#ch_color").val();
        var id_ent = $("#ref").val();
        var ids = [];
        $("tr[id^='tr_'].selected").each(function() {
            var id_det = $(this).attr("id").split('_')[2];
            ids.push(id_det);
        });

        $.post("Ajax.class.php", { "action": "cambiarValoresEntMercaderia", "Code": selectedColorCod, "Name": selectedColorName, "id_ent": id_ent, "ids": JSON.stringify(ids), "entMercUpdate": JSON.stringify(entMercUpdate) },
            function(data) {
                cerrarToolBox();
                cargarDetalleEntrada(id_ent);
                var msj = ""
                $.each(data, function(key, value) {
                    msj += value + "\r\n";
                });
                $('html, body').css("cursor", "auto");
                $("tr[id^='tr_'].selected").each(function() {
                    $(this).find("td.color").text(selectedColorName);
                });
                alert(msj);
            }, "json").error(function() {
            alert("Ocurrio un error al comunicar con el Servidor");
            $('html, body').css("cursor", "auto");
        });
    }
}

function changeStatus(ObjTarget) {
    var target = ObjTarget.data("target");
    if (target == 'all') {
        if (ObjTarget.is(":checked")) {
            $("input.changes").prop("checked", true);
        } else {
            $("input.changes").prop("checked", false);
        }

    } else {
        if (ObjTarget.is(":checked")) {
            $("#" + target).removeAttr("disabled");
        } else {
            $("#" + target).attr("disabled", true);
        }
    }
    $("input.changes").each(function() {
        var t = $(this).data("target");
        if (t != 'all') {
            if ($(this).prop('checked') == true) {
                $("#" + t).prop("disabled", false);
            } else {
                $("#" + t).prop("disabled", true);
            }
        }
    });
}

function tootlboxBuscarColor(targetObj) {
    var search = targetObj.val();
    var targetList = targetObj.closest("tr").find("ul.toolbox_colorList");
    targetObj.val(targetObj.val().toUpperCase())
    targetList.empty();
    targetList.show();
    $.each(toolboxColores, function(key, value) {
        if (value.search(new RegExp(search, "i")) != -1) {

            var li = $("<li/>", {
                "text": value,
                "class": "tbColor",
                click: function() {
                    targetObj.val(value);
                    targetObj.data("Code", key);
                    targetList.hide();
                }
            }).data("Code", key);
            li.appendTo(targetList);
        }
    });
    if ($("li.tbColor").length > 0 || (targetObj.attr('id') == 'ch_color_comb') && targetObj.val() === "NINGUNA") {
        if (targetObj.hasClass("error")) {
            targetObj.removeClass("error");
        }
    } else {
        if (!targetObj.hasClass("error")) {
            targetObj.addClass("error");
        }
    }
}

function puntoXComa(){
    if($("#dotbycomma").is(":checked")){
      var v = $("#cantidades").val().replace(/\,/g, '.');  
      $("#cantidades").val(v);
    }else{
      var v =  $("#cantidades").val().replace(/\./g, ',');   
      $("#cantidades").val(v);
    }   
}

//END Toolbox

function actualizarCantidades(indicador) { // 1 replace 0 no replace
    var counter = 0;
    var qtys = $.trim($("#cantidades").val()).split("\n");
    if (editando) {
        $("#cantidades").val(qtys[0]);
        qtys = $.trim($("#cantidades").val()).split("\n");
    }
    var precio = $("#precio").val()
    if (indicador == 1) {
        precio = $("#precio").val().replace(",", ".");
    } else {
        precio = $("#precio").val().replace(".", "").replace(",", ".");
    }

    if (isNaN(precio)) {
        errorMsg("Ingrese el precio de costo de este Articulo", 10000);
    }
    $("#precio").val(parseFloat(precio).format(3, 3, '.', ','));
    var sub_total = 0;
    var total_um = 0;
    $.each(qtys, function(k) {
        var cant = parseFloat(qtys[k]);
        var costo = precio * cant;
        sub_total += costo;
        total_um += cant * 1;
        counter++
    });
    if (!isNaN(sub_total) || !isNaN(total_um)) {
        $("#subtotal").val(parseFloat(sub_total).format(2, 3, '.', ','));
        $("#cantidad").val(parseFloat(total_um).format(2, 3, '.', ','));
        $("#piezas").val(counter);
    } else {
        $("#subtotal").val("");
        $("#cantidad").val("");
        $("#piezas").val("0");
    }
}

function closeCantPopup() {
    $("#edit_bale").slideUp("fast");
}

function cancelarUpdate() {
    $(".insert").fadeIn();
    $(".edit").fadeOut();
    editando = false;
}

function delDet(tr_id) {
    if ($("input#estado").val() == "Abierta" ) {
        var c = confirm("Confirma que desea eliminar este registro?");
        if (c) {
            var id_ent = tr_id.split("_")[0];
            var id_det = tr_id.split("_")[1];
            $.post("Ajax.class.php", { action: "borrarDetalleEntradaMercaderia", id_ent: id_ent, id_det: id_det }, function(data) {
                $("#tr_" + tr_id).remove();
                cancelarUpdate();
                limpiarAreaCarga();
                totalizar();
            });
        }
    } else {
        alert("La compra no esta Abierta no se puede Eliminar Lotes...");
    }
}

function copiarPedidos() { 
    console.log("CopiarPedidos: "+pedidos);
    var ref = $("#ref").val();
    var invoice = $("#invoice").val();
    var nros_pedidos = JSON.stringify(pedidos);

    var arr_det = new Array();

    $(".chek_det").each(function() {
        var ch = $(this).is(":checked");
        if (ch) {
            var nro = $(this).parent().parent().attr("data-ped");
            var id_det = $(this).parent().parent().attr("id").substring(4, 60);
            arr_det.push(nro + "-" + id_det);
            console.log(nro + "-" + id_det);
        }
    });
    var detalles = JSON.stringify(arr_det);
    $.post("compras/EntradaMercaderias.class.php", { action: "copiarPedidoEnEntrada", invoice: invoice, ref: ref, nros_pedidos: nros_pedidos, ids: detalles }, function(data) {
        $("#area_carga").fadeIn("fast");
        cargarDetalleEntrada(ref);
        setHotKeyArticulo();
        configAreaCarga();
    });


}

function copiarPackingList() {
    var ref = $("#ref").val();
    var invoice = $("#invoice").val();
    $.post("compras/EntradaMercaderias.class.php", { action: "copiarPackingListEnEntrada", invoice: invoice, ref: ref }, function(data) {
        $("#area_carga").fadeIn("fast");
        cargarDetalleEntrada(ref);
        setHotKeyArticulo();
        configAreaCarga();
    });
}

function desabilitarInputs() {
    $("#codigo_proveedor").attr("readonly", true);
    $("#nombre_proveedor").attr("readonly", true).removeClass("editable");
    $("#ruc_proveedor").attr("readonly", true).removeClass("editable");
    $("#invoice").attr("readonly", true).removeClass("editable");
    $("#fecha").attr("readonly", true).removeClass("editable");
    $("#fecha").datepicker("option", "readonly", true);
    $("#moneda").attr("disabled", true);
    $("#cotiz").attr("readonly", true).removeClass("editable");
    $("#suc").attr("readonly", true);
    $("#tipo_doc_sap").attr("disabled", true);
    $("#pais").attr("disabled", true);
}

function seleccionarProveedor(obj) {
    var proveedor = $(obj).find(".proveedor").html();
    var ruc = $(obj).find(".ruc").html();
    var codigo = $(obj).find(".codigo").html();
    var moneda = $(obj).attr("data-moneda");  
    var pais = $(obj).attr("data-pais");  
    
    $("#pais option").filter(function() {
       return this.text == pais; 
    }).attr('selected', true);
    
    
    $("#ruc_proveedor").val(ruc);
    $("#nombre_proveedor").val(proveedor);
    $("#codigo_proveedor").val(codigo);
    
    $("#moneda").val(moneda);
    if(pais != "PY"){
        $("#proveedor").val("Internacional");
    }else{
        $("#proveedor").val("Nacional");
    }


    $("#ui_proveedores").fadeOut("fast");
    $("#msg").html("");

}



function checkform() {

    var cod_prov = $("#codigo_proveedor").val();
    var ruc = $("#ruc_proveedor").val();
    var nombre = $("#nombre_proveedor").val();
    var invoice = $("#invoice").val();
    var fecha = validDate($("#fecha").val()).fecha;
    var cotiz = $("#cotiz").val();
    var pais = $("#pais").val();
    var tipo = $("#tipo_doc_sap").val();
    var timbrado = $("#timbrado").val();
    if (tipo == "OIGN" && fecha.length == 10 && nro_pedido_compra > 0) {
        controlarInvoice();
    } else if (cod_prov.length > 2 && ruc.length > 2 && nombre.length > 2 && invoice.length > 2 && fecha.length == 10 && cotiz.length > 0 && pais.length > 1  ) {
        if (tipo == "OPCH" && timbrado == "") {
            $("#boton_generar").attr("disabled", true);
            errorMsg("Timbrado no puede ser vacio para tipo documento Factura de Proveedor", 8000);
        } else if (tipo == "OPCH") {
            controlarInvoice();
        } else if (tipo == "OPDN" && entrada_directa_sin_invoice) {
            $("#boton_generar").removeAttr("disabled");
        } else {
            controlarInvoice();
        }
    } else {
        $("#boton_generar").attr("disabled", true);
    }
}

function generarLotes() {


    $("#msg_obs").html("Generando Lotes. <img src='img/loading_fast.gif' width='16px' height='16px' >");
    $("#generar_lotes").attr("disabled", true);


    var ids = new Array();

    $(".fila_ent").each(function() {
        var id = $(this).attr("id").substring(3, 60);
        var rf = id.split("_")[0];
        var det_id = id.split("_")[1];
        var lote = $("#tr_" + id + " td:nth-child(4)").text();
        if (lote.length < 1) {
            ids.push(det_id);
            $("#tr_" + rf + "_" + det_id + " td:nth-child(4)").html("<img src='img/loading_fast.gif' width='12px' height='12px'>");
        }
    });

    ids = JSON.stringify(ids);

    var ref = $("#ref").val();
    $.ajax({
        type: "POST",
        url: "compras/EntradaMercaderias.class.php",
        data: { "action": "generarLoteEntradaMercaderia", id_ent: ref, ids: ids },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg_obs").html("Generando Lotes espere...<img src='img/loading_fast.gif' width='12px' height='12px' >");
        },
        success: function(data) {
            $.each(data, function(id_det, lote) {
                $("#tr_" + ref + "_" + id_det + " td:nth-child(4)").html(lote);
            });
            $("#msg_obs").html("Ok, lotes generados...");
            $("#en_transito").fadeIn();
            var tipo = $("#tipo_doc_sap").val();
            if(tipo == "OIGN"){ //Entrada directa
             // $("#finalizar").removeAttr("disabled"); 
             // $("#finalizar").val("Pasar Directamente a SAP");
            }
        }
    });


    $("#msg_obs").html("");
    
    
}

function ponerEnTransito(){
    var ref = $("#ref").val();
    $.ajax({
        type: "POST",
        url: "compras/EntradaMercaderias.class.php",
        data: {"action": "cambiarEstado", "usuario": getNick(), ref: ref,estado:"En_Transito"},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);
                if(result == "Ok"){
                    cambiarEstado("En_Transito");
                }
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });     
}

function finalizar() {
    var error_lotes = 0;
    var filas = $(".fila_ent").length;

    if (filas > 0) {

        var error_lotes = 0;
        $(".mnj_x_lotes_si").each(function() {
            var id = $(this).attr("id").substring(3, 60);
            var lote = $("#tr_" + id + " td:nth-child(4)").text();
            if (lote.length < 1) {
                error_lotes++;
            }
        });
        if (error_lotes > 0) {
            errorMsg("Falta generar al menos " + error_lotes + " lotes...", 6000);
            return;
        }

        if (colores_incorrectos > 0) {
            errorMsg("Falta corregir al menos " + colores_incorrectos + " colores...", 18000);
            return;
        }
        //var gastos = $("#total_gastos").val().replace(/\./g,"");
        var g = $("#total_gastos").val();
        var c = confirm("Esta operacion es irreversible ha cargado Gastos por "+g+" confirme para continuar...");
        if(c){
            $("#finalizar").attr("disabled", true);
            var ref = $("#ref").val();
            $.ajax({
                type: "POST",
                url: "compras/EntradaMercaderias.class.php",
                data: { "action": "cerrarEntradaMercaderias", usuario: getNick(), ref: ref },
                async: true,
                dataType: "html",
                beforeSend: function() {
                    $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
                },
                complete: function(objeto, exito) {
                    if (exito == "success") {
                        var result = $.trim(objeto.responseText);
                        if (result == "Ok") {
                            $("#estado").val("Cerrada");
                            $("#area_carga").fadeOut();
                            $("div#area_carga input[type=text]").attr("readonly", true);
                            $(".control").fadeOut();
                            $("#inv_obs").attr("readonly", true);
                            estado = "Cerrada";
                            $("#msg").html("<img src='img/ok.png' width='16px' height='16px' >");
                            $("#msg_obs").html("Cerrada <img src='img/ok.png' width='16px' height='16px' >");
                            infoMsg("Entrada Cerrada con exito ", 25000)
                             
                            $("#expenses select").prop("disabled",true);
                            $("#expenses .tipo_gasto").prop("readonly",true);
                            $("#expenses .g_cotiz").prop("readonly",true);
                            $("#mas_menos").remove();
                            
                            setTimeout("showMenu()",5000);
           
                        } else {
                            errorMsg("Ocurrio un error en la comunicacion con el Servidor... Mensaje de Error:" + result + "", 20000);
                        }
                    }
                },
                error: function() {
                    $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
                }
            });
        } else {
            errorMsg("Debe cargar al menos un art�culo para poder cerrar", 8000);
        }
    }
}

//
function controlarInvoice() {

    var invoice = $("#invoice").val();
    var cod_prov = $("#codigo_proveedor").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "controlarEntradaMercaderias", "invoice": invoice, "cod_prov": cod_prov },
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg").html("Verificando datos. <img src='img/loading_fast.gif' width='16px' height='16px' >");
        },
        complete: function(objeto, exito) {
            if (exito == "success") {
                var result = $.trim(objeto.responseText);
                if (result == "Ok") {
                    $("#boton_generar").removeAttr("disabled")
                } else {
                    $("#boton_generar").attr("disabled", true);
                    errorMsg(result, 10000);
                }
                $("#msg").html("");
            }
        },
        error: function() {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            errorMsg("Ocurrio un error en la comunicacion con el Servidor...", 10000);
        }
    });
}


function mostrar() {}

function cerrar() {
    $("#ui_proveedores").fadeOut();
}

function setDefaultDataNextFlag() {
    data_next_time_flag = true;
}

function setHotKeyArticulo() {
    $("#codigo").keydown(function(e) {

        var tecla = e.keyCode;
        if (tecla == 27) {
            $("#ui_articulos").fadeOut();
            escribiendo = false;
        }
        if (tecla == 38) {
            (fila_art == 0) ? fila_art = cant_articulos - 1: fila_art--;
            selectRowArt(fila_art);
        }
        if (tecla == 40) {
            (fila_art == cant_articulos - 1) ? fila_art = 0: fila_art++;
            selectRowArt(fila_art);
        }
        if (tecla != 38 && tecla != 40 && tecla != 13 && tecla != 9) { //9 Tab 38-40 Flechas Arriba abajo
            buscarArticulo();
            escribiendo = true;
        }
        if (tecla == 13) {
            if (!escribiendo) {
                seleccionarArticulo(".fila_art_" + fila_art);
            } else {
                setTimeout("escribiendo = false;", 1000);
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

function updateNotes() {
    $("#msg_obs").html("Guardando Notas... <img src='img/loading_fast.gif' width='16px' height='16px' >");
    var ref = $("#ref").val();
    var notes = $("#inv_obs").val();
    $.post("Ajax.class.php", { action: "updateEntradaNotes", ref: ref, notes: notes }, function(data) {
        $("#msg_obs").html("<img src='img/ok.png' width='16px' height='16px' >");
    });
}

function seleccionarArticulo(obj) {
    var codigo = $(obj).find(".codigo").html();
    var sector = $(obj).find(".Sector").html();
    var nombre_com = $(obj).find(".NombreComercial").html();
    var precio = $(obj).attr("data-precio");
    var precio_costo = parseFloat($(obj).attr("data-precio_costo").replace(".","").replace(",","."));
    var ancho = $(obj).attr("data-ancho");
    var gramaje = $(obj).attr("data-gramaje");
    var um = $(obj).attr("data-um");
    var composicion = $(obj).attr("data-comp");
    if (isNaN(gramaje)) {
        gramaje = "";
    }
    if (isNaN(ancho)) {
        ancho = "";
    }
    
    var cotiz_compra = parseFloat($("#cotiz").val());
    var precio_moneda_compra = (precio_costo / cotiz_compra).format(2, 3, '.', ',');;

    $("#codigo").val(codigo);
    $("#descrip").val(sector + "-" + nombre_com);
    $("#um").val(um);
    $("#ancho").val(ancho);
    $("#gramaje").val(gramaje);
    $("#composicion").val(composicion);
    $("#ui_articulos").fadeOut();
    $("#precio").val(precio_moneda_compra);
    $("#bale").focus();
    if (um == "Mts") {
        $(".c_unid").prop("disabled", true);
        $(".c_metros").removeAttr("disabled");
        $(".c_yardas").removeAttr("disabled");
        $(".c_kilos").removeAttr("disabled"); 
        $("#umc").val("Mts");
    }else if(um == "Kg"){
        $(".c_kilos").removeAttr("disabled"); 
        $(".c_metros").prop("disabled", true);
        $(".c_unid").prop("disabled", true);
        $(".c_yardas").prop("disabled", true);
        $("#umc").val("Kg");		
    } else { // Unid
        $(".c_metros").prop("disabled", true);
        $(".c_yardas").prop("disabled", true);
        $(".c_kilos").prop("disabled", true);
        $(".c_unid").removeAttr("disabled");
        $("#umc").val("Unid");
    }
}

function buscarArticulo() {
    var articulo = $("#codigo").val();
    fila_art = 0;
    if (articulo.length > 0) {
        var moneda = $("#moneda").val();
        var umc = $("#umc").val();
        $.ajax({
            type: "POST",
            url: "compras/EntradaMercaderias.class.php",
            data: { "action": "buscarArticulos", "articulo": articulo, "cat": 1,moneda:"G$",um:umc },
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
            },
            success: function(data) {

                if (data.length > 0) {
                    limpiarListaArticulos();
                    var k = 0;
                    for (var i in data) {
                        k++;
                        var ItemCode = data[i].codigo;
                        var Sector = data[i].sector;
                        var NombreComercial = data[i].descrip;
                        var Precio = parseFloat((data[i].precio)).format(0, 3, '.', ',');
                        var UM = data[i].um;
                        var Ancho = parseFloat((data[i].ancho)).format(2, 3, ',', '.');
                        var Gramaje = parseFloat((data[i].gramaje_prom)).format(0, 3, '.', ',');
                        var PrecioCosto = parseFloat((data[i].costo_prom)).format(0, 3, '.', ',');
                        var Composicion = data[i].composicion;
                        $("#lista_articulos").append("<tr class='tr_art_data fila_art_" + i + "' data-precio='" + Precio + "' data-precio_costo='" + PrecioCosto + "' data-um='" + UM + "' data-ancho='" + Ancho + "' data-gramaje='" + Gramaje + "' data-comp='" + Composicion + "'><td class='item clicable_art'><span class='codigo' >" + ItemCode + "</span></td>   <td class='item clicable_art'><span class='Sector'>" + Sector + "</span> </td><td  class='item clicable_art'><span class='NombreComercial'>" + NombreComercial + "</span></td><td class='num clicable_art'><span>" + Ancho + "</span></td><td class='num clicable_art'><span>" + Precio + " "+UM+".</span></td></tr>");
                        cant_articulos = k;
                    }
                    inicializarCursores("clicable_art");
                    $("#ui_articulos").fadeIn();
                    $(".tr_art_data").click(function() {
                        seleccionarArticulo(this);
                    });
                    $("#msg").html("");
                } else {
                    $("#msg").html("Sin resultados...");
                }
            }
        });
    }
}

var entMerc_designTarget;

function selectDesigns(ObjTarget) {
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
    var window_width = $(document).width() / 2;
    var desing_width = $("#designs_container").width() / 2;
    var posx = (window_width - desing_width);
    posx = posx + "px";
    $("#designs_container").css({ left: posx, top: 50 });
    $("#designs_container").fadeIn();
}

function hideDesigns() {
    $("#designs_container").fadeOut();
}

function limpiarListaArticulos() {
    $(".tr_art_data").each(function() {
        $(this).remove();
    });
}

function infoTipo() {
    $("#msg_info").fadeIn();
    setTimeout(function() {
        $("#msg_info").fadeOut("slow");
    }, 10000);
}

function eliminarEntrada(ref) {
    var c = confirm("Este procedimiento no tiene vuelta atras...\nConsidere hacer una copia en Excel antes de continuar.\nEsta Seguro que desea Eliminar esta Compra?");
    if(c){
        $("#" + ref).children().html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
        $.post("Ajax.class.php", { action: "eliminarEntradaMercaderia", ref: ref }, function(data) {
            $("#" + ref).remove();
        });
    }
}

function onlyNumbers(e) {
    //e.preventDefault();
    var tecla = new Number();
    if (window.event) {
        tecla = e.keyCode;
    } else if (e.which) {
        tecla = e.which;
    } else {
        return true;
    }

    if (tecla === "13") {

    }
    //console.log(e.keyCode+"  "+ e.which);
    if ((tecla >= "97") && (tecla <= "122")) {
        return false;
    }
}

function scrollWindows(pixels) {
    $("#work_area").animate({
        scrollTop: pixels
    }, 250);
}
function stringify(str) {
    if (str == null) {
        return "";
    } else {
        return str;
    }
}

function descargarExcel(id_ent){
     
    $.ajax({
        type: "POST",
        url: "compras/EntradaMercaderias.class.php",
        data: {action: "descargarExcel", id_ent:id_ent,suc: getSuc(), usuario: getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            if (data.mensaje === "Ok") {
                window.open(data.url);
                $("#msg").html("Descargando excel");   
            } else {
                $("#msg").html("Error al generar Excel  ");   
            }                
        },
        error: function (e) {                 
            $("#msg").html("Error al generar Excel  :  " + e);   
            errorMsg("Error al generar Excel  " + e, 10000);
        }
    }); 
}
