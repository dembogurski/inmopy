 var selected_code = "";
 

 function configurar() {
     $("#desde").datepicker({ dateFormat: 'dd-mm-yy' });
     $("#hasta").datepicker({ dateFormat: 'dd-mm-yy' });
     $("#desde_int").datepicker({ dateFormat: 'dd-mm-yy' });
     $("#hasta_int").datepicker({ dateFormat: 'dd-mm-yy' });
     
     
     $("#desde").mask("99-99-9999");
     $("#hasta").mask("99-99-9999");
     $("#desde_int").mask("99-99-9999");
     $("#hasta_int").mask("99-99-9999");


     $("#tipo").change(function() {
         if ($(this).val() == 'Nacional') {
             $(".nac").fadeIn();
             $(".int").fadeOut();
             $("#filtrar").fadeIn();
         } else {
             $(".nac").fadeOut();
             if ($("#nros_internacionales").val() != null) {
                 $(".int").fadeIn();
             } else {
                 $("#filtrar").fadeOut();
                 errorMsg("No hay ningun pedido Internacional Pendiente en este momento...", 40000);
             }
         }
     });
     $("#estado").change(function() {
         checkEstado();
     });
     $("#estado_int").change(function() {
         if ($(this).val() == "Pendiente") {
             $(".estado_Pendiente").fadeIn();
             $(".estado_Cerrada").fadeOut();
             $("#nros_internacionales").val($(".estado_Pendiente").val());
             if ($("#nros_internacionales").val() != null) {
                 $(".filtrar").fadeIn();
             } else {
                 $(".filtrar").fadeOut();
             }
         } else {
             $(".estado_Pendiente").fadeOut();
             $(".estado_Cerrada").fadeIn();
             $("#nros_internacionales").val($(".estado_Cerrada").val());
             $(".filtrar").fadeOut();
         }
     });

     $(".fecha_prevista").datepicker({ dateFormat: 'dd-mm-yy' });
     $("#p_compra").change(function() {
         var valor = parseFloat($(this).val()).format(2, 3, '.', ',');
         $(this).val(valor);
     });
     $("#nros_internacionales").val($(".estado_Pendiente").val());

     $("*[data-next]").keyup(function(e) {
         if (e.keyCode == 13) {
             var next = $(this).attr("data-next");
             $("#" + next).focus();
         }
     });

     $("#cancelar").click(function() {
         cambiarEstadoPedidos("Cancelado", 1);
     });
     $("#disponible").click(function() {
         cambiarEstadoPedidos("Disponible en Stock", 1);    
     });

     $("input[name='slider']").change(function() {
         if ($("input[name='slider']:checked").val() == 'Pendiente') {
             cambiarEstadoPedidos("Pendiente", 2);
         } else if ($("input[name='slider']:checked").val() == 'Comprado') {
             cambiarEstadoPedidos("Comprado", 2);
         } else if ($("input[name='slider']:checked").val() == 'En Transito') {
             cambiarEstadoPedidos("En Transito", 2);
         } else if ($("input[name='slider']:checked").val() == 'En Deposito') {
             cambiarEstadoPedidos("En Deposito", 2);
         } else { // Despachado
             cambiarEstadoPedidos("Despachado", 2);
         }
     });
     grillaDisenho();
     // Verif Codigo de catalogo
     $("#CodCat").mask("9?99", {placeholder: ""});
     $("#CodCat").change(function(){if($.trim($(this).val()) === ''){$(this).val(0);}});
     // Verificación colores
     $("#pantone").change(function(){
         $(this).removeClass("data_ok data_err");
         var currColor = ($("#pantone").val()).toUpperCase();
         var pos = colores.lastIndexOf(currColor);
         
         if(pos>-1){
             $(this).val(colores[pos]);
             $(this).addClass("data_ok");
         }else{
             $(this).addClass("data_err");
         }

     });

     // Verificar Diseños
     $("#diseno").change(function(){
         $(this).removeClass("data_ok data_err");
         var currDis = ($(this).val()).toUpperCase();
         var pos = autocompletadoPatron.lastIndexOf(currDis);
         
         if(pos>-1){
             $(this).val(autocompletadoPatron[pos]);
             $(this).addClass("data_ok");
         }else{
             $(this).addClass("data_err");
         }

     });
     
     


 }

 function resetCampos() {
     seleccionarRadio();
     $("#obs_2").val("");
 }

 function seleccionarRadio() {
     var est = $("#estado").val();
     if (est == "Comprado") {
         $("#radio_comprado").prop("checked", "true");
     } else if (est == "En Transito") {
         $("#radio_transito").prop("checked", "true");
     } else if (est == "En Deposito") {
         $("#radio_deposito").prop("checked", "true");
     } else {
         $("#radio_despachado").prop("checked", "true");
     }
 }

 function checkEstado() {
     if ($("#tipo").val() == 'Nacional') {
         if ($("#estado").val() == 'Pendiente') {
             $("#area_tracking").fadeOut();
             $("#area_compra").fadeIn();
         } else {
             $("#area_tracking").fadeIn();
             $("#area_compra").fadeOut();
             seleccionarRadio();
         }
     } else {
         $("#area_tracking").fadeOut();
         $("#area_compra").fadeOut();
     }
 }

 function setAnchorTitle() {
     $('a[title!=""]').each(function() {
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
     var offset = element.offset();
     $('#anchorTitle').css({
         'top': (offset.top + element.outerHeight() - 40) + 'px',
         'left': offset.left + 'px'
     }).html(text).show();
 }

 function hideAnchorTitle() {
     $('#anchorTitle').hide();
 }

 function getHistorial() {
     $("a[class^='codigo_']").each(function() {
         var title = $(this).attr("title");

         if (title == "") {
             var codigo = $(this).attr("data-codigo");
             $.ajax({
                 type: "POST",
                 url: "Ajax.class.php",
                 data: { "action": "getHistorialPreciosArticulo", codigo: codigo },
                 async: false,
                 dataType: "html",
                 beforeSend: function() {
                     $(".codigo_" + codigo).attr('title', "<img src='img/loading.gif' width='22px' height='22px' >");
                 },
                 complete: function(objeto, exito) {
                     if (exito == "success") {
                         var result = $.trim(objeto.responseText);
                         $(".codigo_" + codigo).attr('title', result);
                         setAnchorTitle();
                     }
                 },
                 error: function() {
                     $(".codigo_" + codigo).attr("Ocurrio un error en la comunicacion con el Servidor al obtener historial de precios");
                 }
             });
         }
     });
 }
 
 function buscarVentas(id){
     var codigo = selected_code;
     var desde = $("#desde_int").val();
     var hasta = $("#hasta_int").val();
      
      
       
     
    var cod_cli = $("#tr_"+id).attr("data-cli_cod");  
               
        var nombre_com = $.trim($("#tr_"+id).find(".articulo").html().split("-")[1]);
        var color= $.trim($("#tr_"+id).find(".color").html());         
        var descrip = nombre_com+"-"+color;
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getSumaVentasDeClienteXArticuloDescripcion", codigo: codigo,desde:desde,hasta:hasta,cod_cli:cod_cli,descrip:descrip},
            async: true,
            dataType: "json",
            beforeSend: function () {
                 $(".ventas_"+id).html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {
               if(data.length > 0){ 
                  var Mts = parseFloat(data[0].Mts);
                  var Devs = parseFloat(data[0].Devs);
                  var VentaNeta =  (Mts - Devs).toFixed(1);
                  $(".ventas_"+id).html(VentaNeta);  
                  $(".ventas_"+id).css("font-weight","bolder");
                  
               } else{
                   $(".ventas_"+id).css("font-weight","normal");
                   $(".ventas_"+id).html("0");                                    
               }
               
            }
        }); 
        setTimeout("totalizarVentas()",5000);
        setTimeout("totalizarVentas()",10000);
 }
 function totalizarVentas(){
    $(".suma_ventas").each(function(){
        var totalv = 0;
        var h = $(this).attr("data-hash"); 
        $(".ventas_cli_"+h).each(function(){
              var val = parseFloat($(this).text());
              totalv += val;
              $("#tot_ventas_"+h).val(totalv );               
        });
    });
 }
 function enableBotonBuscar(){
     $("#buscar_ventas").removeAttr("disabled");
 }
 function buscarVentasEach(){
     $("#buscar_ventas").prop("disabled",true);
     var desde = $("#desde_int").val();
     var hasta = $("#hasta_int").val();
     if(desde == hasta){
         alert("Ponga un rango de Fechas mayor a 1 dia");
     }else{
        $(".fila_pedido").each(function() {
            var id = $(this).attr("id").substring(3,60);  
            buscarVentas(id);
        });
     }
 }

 function getLotesXColor() {
     $("a[class^='color_']").each(function() {
         var title = $(this).attr("title");

         if (title == "") {
             var color = $(this).html();

             var codigo = $(this).attr("data-codigo");
             $.ajax({
                 type: "POST",
                 url: "Ajax.class.php",
                 data: { "action": "buscarLotesXColor", codigo: codigo, color: color },
                 async: false,
                 dataType: "html",
                 beforeSend: function() {
                     $(".color_" + codigo).attr('title', "<img src='img/loading.gif' width='22px' height='22px' >");
                 },
                 complete: function(objeto, exito) {
                     if (exito == "success") {
                         var result = $.trim(objeto.responseText);
                         $(".color_" + codigo).attr('title', result);
                         setAnchorTitle();
                     }
                 },
                 error: function() {
                     $(".color_" + codigo).attr("Ocurrio un error en la comunicacion con el Servidor al obtener historial de precios");
                 }
             });
         }
     });
 }

 function filtrar() {
     var tipo = $("#tipo").val();
     if (tipo == 'Nacional') {
         getNacionales();
         setDragable();
     } else {
         getArticulosInternacional();
     }
 }

 function getNacionales() {
     var desde = validDate($("#desde").val()).fecha;
     var hasta = validDate($("#hasta").val()).fecha;
     var estado = $("#estado").val();
     var urge = $("#urge").val();
     var suc = $("#suc").val();
     $.ajax({
         type: "POST",
         url: "Ajax.class.php",
         data: { "action": "getDetalleNotasPedidoNacionalCompras", "desde": desde, "hasta": hasta, "suc": suc, estado: estado, usuario: '%',urge:urge },
         async: true,
         dataType: "json",
         beforeSend: function() {
             $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >");
         },
         success: function(data) {
             $(".fila_pedido").remove();
             $(".fila_total_pedido").remove();
             var estado = $("#estado").val();

             var j = 0;
             var old_descrip = '*';
             var old_color = '*';
             var old_hash = '';
             var zebra = 1;

             var filas = "";
             var suma = 0;

             for (var i in data) {
                 j++;
                 var id = data[i].id;
                 var nro = data[i].n_nro;
                 var suc = data[i].suc;
                 var usuario = data[i].usuario;
                 var codigo = data[i].codigo;
                 var lote = data[i].lote;
                 var descrip = data[i].descrip;
                 var color = data[i].color;
                 var um = data[i].um_prod;
                 var cantidad = parseFloat(data[i].cantidad);
                 var precio_venta = parseFloat(data[i].precio_venta).format(0, 3, ".", ",");
                 var obs = data[i].obs;
                 var mayorista = data[i].mayorista;
                 var estado = data[i].estado;
                 var urge = data[i].urge;
                 var hash = data[i].hash;
                 var fecha = data[i].fecha;
                 var proveedor = data[i].proveedor;
                 var cliente = data[i].cliente;
                 var urgente = '';
                 var may_class = '';
                 if (urge == "Si") {
                     urgente = 'urge';
                 }

                 if (mayorista == "Si") {
                     may_class = 'mayorista';
                 }
                 if ((color != old_color && old_color != '*') || (descrip != old_descrip && old_descrip != '*')) { // Cambio el Color
                     if (estado == 'Pendiente') {
                         filas += "<tr class='fila_total_pedido  " + old_hash + " zebra0'><td colspan='7'><b>Totales</b></td> <td class='num' style='font-weight:bolder'>" + suma + "</td><td  class='itemc'>" + um + "</td><td colspan='6'></td></tr>";
                     }
                     if (zebra == 0) {
                         zebra = 1;
                     } else {
                         zebra = 0;
                     }
                     suma = 0;
                 }
                 suma = suma + cantidad;
                 filas += "<tr class='fila_pedido fila_" + i + " " + hash + " zebra0' data-hash='" + hash + "' id='tr_" + id + "' data-nro=" + nro + ">\n\
                <td class='item'><a title='"+cliente+"'>"  + nro + "</a></td>\n\\n\
                 <td class='itemc'>" + fecha + "</td>\n\
                <td class='item' >" + usuario + "</td>\n\
                <td class='item' >" + suc + "</td>\n\
                <td class='item' ><a title='' class='codigo_" + codigo + "' data-codigo='" + codigo + "' href='#' >" + codigo + "</a></td>\n\
                <td class='item'>" + lote + " </td>\n\
                <td class='item' title='"+cliente+"'>" + descrip + " </td>\n\
                <td class='item'><a title='' class='color_" + codigo + "' data-codigo='" + codigo + "' href='#' >" + color + "</a></td>\n\
                <td class='num'>" + cantidad + " </td>\n\\n\
                <td class='itemc'>" + um + " </td>\n\
                <td class='num'>" + precio_venta + " </td>\n\
                <td class='itemc " + may_class + "'>" + mayorista + " </td>\n\
                <td class='itemc " + urgente + "'>" + urge + " </td>\n\
                <td class='itemc'>" + obs + " </td>\n\
                <td class='itemc' id='estado_" + id + "'>" + estado + " </td>\n\
                <td class='item' id='prov_" + id + "'>" + proveedor + " </td>  \n\
                <td class='itemc' id='msg_" + id + "'><input type='checkbox' id='check_" + id + "' class='check_" + hash + "' ></td></tr>";
                 old_color = color;
                 old_descrip = descrip;
                 old_hash = hash;
             }
             filas += "<tr class='fila_total_pedido   " + old_hash + " zebra0'><td colspan='8'><b>Totales</b></td> <td class='num' style='font-weight:bolder'>" + suma + "</td><td  class='itemc'>" + um + "</td><td colspan='6'></td></tr>";

             $("#nacionales").append(filas);
             $(".fila_pedido").click(function() {
                 var h = $(this).attr("data-hash");
                 if ($(this).hasClass("selected")) {
                     $("." + h).removeClass("selected");
                     $(".check_" + h).prop("checked", false);
                     $(".check_" + h).removeClass("selected_check");
                 } else {
                     $("." + h).addClass("selected");
                     $(".check_" + h).prop("checked", true);
                     $(".check_" + h).addClass("selected_check");
                 }
             });
             if ($("#estado").val() == "Pendiente") {
                 getHistorial();
                 getLotesXColor();
             }

             $("#msg").html("");
         }
     });
     $('#proveedor').autocomplete({
         source: function(request, response) {
             $.ajax({                 
                 url: "proveedores/Proveedores.class.php",
                 type: "POST",
                 dataType: "json",
                 delay: 500,
                 data: { action: "buscarProveedor", criterio: request.term + '%', campo: 'nombre', limit: 30 },
                 success: function(data) {
                     response($.map(data, function(item) {
                         return {
                             label: item.CardName,
                             id: item.CardCode,
                         };
                     }));
                 }
             });
         },
         minLength: 0,
         select: function(event, ui) {
             $("#cod_prov").val(ui.item.id);
         }
     });
 }

 function getInternacionales() {
     enableBotonBuscar();
     var nro = $("#nros_internacionales").val();

     $.ajax({
         type: "POST",
         url: "Ajax.class.php",
         data: { "action": "getDetalleNotaPedidoInternacionalCompras", "nro": nro, "codigo": selected_code },
         async: true,
         dataType: "json",
         beforeSend: function() {
             $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >");
         },
         success: function(data) {
             $(".fila_pedido").remove();
             $(".fila_total_pedido").remove();
             var estado = $("#estado").val();

             var j = 0;

             var old_descrip = '*';
             var old_color = '*';
             var old_hash = '';
             var old_id = '*';
             var zebra = 1;

             var filas = "";
             var suma = 0;
             var suma_pond = 0;

             for (var i in data) {
                 j++;
                 var id = data[i].id;
                 var nro = data[i].n_nro;
                 var suc = data[i].suc;
                 var usuario = data[i].usuario;
                 var codigo = data[i].codigo;
                 var lote = data[i].lote;
                 var descrip = data[i].descrip;
                 var color = data[i].color;
                 var um = data[i].um_prod;
                 var cantidad = parseFloat(data[i].cantidad);
                 var precio_venta = parseFloat(data[i].precio_venta).format(0, 3, ".", ",");
                 var obs = (data[i].obs).toLowerCase();
                  
                 var mayorista = data[i].mayorista;
                 var estado = data[i].estado;
                 var urge = data[i].urge;
                 var hash = data[i].hash;

                 var cliente = data[i].cliente;
                 var cod_cli = data[i].cod_cli;
                 var ponderacion = parseFloat(data[i].ponderacion).format(2, 3, "", ".");;
                 var cantidad_pond = parseFloat(data[i].cantidad * ponderacion).format(2, 3, ".", ",");
                 var cantidad_pond_eng = parseFloat(data[i].cantidad * ponderacion);
                 var precio_estimado = parseFloat(data[i].precio_estimado).format(2, 3, "", ".");
                 if (isNaN(precio_estimado)) {
                     precio_estimado = 0;
                 }

                 var urgente = '';

                 if (urge == "Si") {
                     urgente = 'urge';
                 }

                 var colorfondo = estado.toLowerCase();

                 var suma_pond_mostrar = suma_pond.format(2, 3, ".", ",");

                 if ((color != old_color && old_color != '*') || (descrip != old_descrip && old_descrip != '*')) { // Cambio el Color

                     filas += "<tr class='fila_total_pedido zebra1 " + old_hash + "'><td colspan='2'><b>Totales</b></td><td  colspan='3'><span id='msg_" + old_id + "' ></span></td> \n\
                        <td colspan='3'><b>Stock:</b><input type='text' size='8' class='num' readonly='readonly' id='stock_" + old_id + "' data-color='" + old_color + "'>\n\
                        <b>Diff:</b><input type='text' size='8' class='num' readonly='readonly' id='diff_" + old_id + "'><b>Total Ventas:</b><input type='text' size='8' class='num suma_ventas tot_ventas_" + old_id + "' readonly='readonly' data-hash='" + old_hash + "' id='tot_ventas_" + old_hash + "'></td>\n\
                        <td class='num' style='font-weight:bolder'>" + suma + "</td>\n\
                        <td style='font-weight:bolder;text-align:center'></td> <td class='num total_pond_" + old_hash + "'  style='font-weight:bolder' id='total_pond_" + old_id + "' >" + suma_pond_mostrar + "</td> \n\
                        <td style='text-align:right'><label style='font-weight:bolder;'>Pedir:</label><input type='text' id='pedido_" + old_id + "' class='num' onchange='guardarPedido(" + old_id + ")' size='4'  style='width:60%' value=''> </td>\n\
                        </tr>";

                     if (zebra == 0) {
                         zebra = 1;
                     } else {
                         zebra = 0;
                     }
                     suma = 0;
                     suma_pond = 0;
                 }
                 suma = suma + cantidad;
                 suma_pond = suma_pond + parseFloat(cantidad_pond_eng);
        
                 var fondo = '';
                 if (cliente == "") {
                     cliente = "MINORISTA";
                     fondo = 'minorista';
                 }    

                filas += "<tr class='fila_pedido fila_" + i + "  " + hash + "' data-hash='" + hash + "'   id='tr_" + id + "' data-nro=" + nro + " data-cli_cod='" + cod_cli + "'>\n\\n\
                <td class='item' >" + usuario + "</td>\n\
                <td class='item' >" + suc + "</td>\n\
                <td class='item " + fondo + "' >" + cliente + "</td>\n\
                <td class='item codigo' ><a title='' class='codigo_" + codigo + "' data-codigo=" + codigo + " href='#' >" + codigo + "</a></td>\n\\n\
                <td class='item articulo'>" + descrip + " </td>\n\
                <td class='item color'>" + color + " </td>\n\
                <td class='num ventas_" + id + " ventas_cli_"+ hash +"'><Sin Calc></td>\n\
                <td class='num'><input type='text' id='precio_est_" + id + "' data-cli_cod='" + cod_cli + "' size='8' class='num input_cell precio_est_" + hash + "' value='" + precio_estimado + "'  data-codigo=" + codigo + "   > </td>\n\
                <td class='num'>" + cantidad + " </td>\n\
                <td class='num'><input type='text'  id='pond_" + id + "' data-cli_cod='" + cod_cli + "'  size='6' class='num input_cell ponderacion  pond_" + cod_cli + "' value='" + ponderacion + "'> </td>\n\
                <td class='cant_pond_" + hash + " num'>" + cantidad_pond + " </td>\n\
                <td class='itemc " + colorfondo + "' id='estado_" + id + "'>" + estado + " </td> <td style='font-size: 10px;width:140px;text-transform:capitalize'>"+obs+"</td></tr>";
                old_color = color;
                old_descrip = descrip;
                old_hash = hash;
                old_id = id;
             }
             suma_pond_mostrar = suma_pond.format(2, 3, ".", ",");
             filas += "<tr class='fila_total_pedido zebra1 " + old_hash + "'><td colspan='2'><b>Totales</b></td><td  colspan='3'><span id='msg_" + old_id + "' ></span></td> \n\
                        <td colspan='3'><b>Stock:</b><input type='text' size='8'  class='num' readonly='readonly' id='stock_" + old_id + "' data-color='" + old_color + "'>\n\
                        <b>Diff:</b><input type='text' size='8' class='num' readonly='readonly' id='diff_" + old_id + "'><b>Total Ventas:</b><input type='text' size='8' class='num suma_ventas tot_ventas_" + old_id + "' readonly='readonly' data-hash='" + old_hash + "' id='tot_ventas_" + old_hash + "'></td>\n\
                        <td class='num' style='font-weight:bolder'>" + suma + "</td>\n\
                        <td style='font-weight:bolder;text-align:center'></td> <td class='num total_pond_" + old_hash + "'  style='font-weight:bolder' id='total_pond_" + old_id + "' >" + suma_pond_mostrar + "</td> \n\
                        <td style='text-align:right'><label style='font-weight:bolder;'>Pedir:</label><input type='text' id='pedido_" + old_id + "' class='num' onchange='guardarPedido(" + old_id + ")' size='4'  style='width:60%' value=''> </td>\n\
                        </tr>";

             $("#internacionales").append(filas);

             getTotalPedidoIntXColor();

             $(".ponderacion").change(function() {
                 var cod_cli = $(this).attr("data-cli_cod");
                 var ponder = $(this).val();
                 setPonderacion(cod_cli, ponder);
             });

             $("input[id^='precio_est_']").change(function() {

                 var hash = $(this).parent().parent().attr("data-hash");
                 var precio = $(this).val();
                 $(".precio_est_" + hash).val(precio);

                 var id = ($(this).parent().parent().attr("id")).substring(3, 30);
                 var nro = $("#nros_internacionales").val();
                 var codigo = $(this).attr("data-codigo");
                 guardarPrecio(id, nro, codigo, precio);


                 $("input[id^='precio_est']").each(function() {
                     var valora = $(this).val();
                     if (valora == "0") {
                         $(this).val(precio);
                         var id_ = $(this).attr("id").substring(11, 30);
                         guardarPrecio(id_, nro, codigo, precio);
                     }
                 });

             });
             $("input[id^='stock_']").each(function() {
                 var color = $(this).attr("data-color");
                 var id = $(this).attr("id").substring(6, 30);
                 buscarStockColor(id, color);
             });
             $("#msg").html("");
             getHistorial();
         }
     });
       
 }

 function buscarStockColor(id, color) {

     $.ajax({
         type: "POST",
         url: "Ajax.class.php",
         data: { "action": "buscarStockXColorArticulo", "codigo": selected_code, "color": color },
         async: true,
         dataType: "json",
         beforeSend: function() {
             $("#stock_" + id).val("...");
         },
         success: function(data) {
             var Stock = data[0].Stock;
             if (Stock == "") {
                 Stock = 0;
             }
             $("#stock_" + id).val(Stock);
             var ponderada = parseFloat($("#total_pond_" + id).html().replace(".", ","));
             $("#diff_" + id).val(Stock - ponderada);
         }
     });
 }

 function getTotalPedidoIntXColor() {
     var nro = $("#nros_internacionales").val();
     $("input[id^='pedido_']").each(function() {
         var id = $(this).attr("id").substring(7, 20);

         $.ajax({
             type: "POST",
             url: "Ajax.class.php",
             data: { "action": "getTotalPedidoIntXColor", "id": id, "nro": nro },
             async: true,
             dataType: "html",
             beforeSend: function() {
                 $("#pedido_" + id).addClass("guardado");
             },
             complete: function(objeto, exito) {
                 if (exito == "success") {
                     var result = $.trim(objeto.responseText);
                     $("#pedido_" + id).removeClass("guardando");
                     $("#pedido_" + id).val(result);
                 }
             },
             error: function() {
                 $("#pedido_" + id).val(0);
             }
         });
     });
 }

 function guardarPedido(id) {
     var nro = $("#nros_internacionales").val();
     var pedido = $("#pedido_" + id).val();
     var total_ventas = parseFloat($(".tot_ventas_"+id).val());
     if(isNaN(total_ventas)){
         total_ventas = 0;
     }
     var desde = $("#desde_int").val();
     var hasta = $("#hasta_int").val();
     if(desde == hasta){
         alert("Debe cambiar por un rango de ventas mas amplio");
         return;
     }
     
     var rango_ventas = desde + " <-> "+hasta; 
     $.ajax({
         type: "POST",
         url: "Ajax.class.php",
         data: { "action": "guardarResumenPediddoInt", "pedido": pedido, "id": id, nro: nro,total_ventas:total_ventas,rango_ventas:rango_ventas },
         async: true,
         dataType: "html",
         beforeSend: function() {
             $("#msg_" + id).addClass("info");
             $("#msg_" + id).html("  Guardando...<img src='img/loading_fast.gif' width='18px' height='18px' >");
         },
         complete: function(objeto, exito) {
             if (exito == "success") {
                 var result = $.trim(objeto.responseText);
                 if(result != "Ok"){
                     $("#msg_" + id).addClass("error");
                     $("#msg_" + id).html(result);
                 }else{
                     $("#msg_" + id).addClass("info");
                     $("#msg_" + id).html("  Guardado...");
                 }
             }
         },
         error: function() {
             $("#msg_" + id).removeClass("info");
             $("#msg_" + id).addClass("error");
             $("#msg_" + id).html("Error al guardar...");
         }
     });
 }

 function guardarPrecio(id, nro, codigo, precio_est) {

     var precio_fila = $("#precio_est_" + id).val();
     console.log(precio_fila);
     $.ajax({
         type: "POST",
         url: "Ajax.class.php",
         data: { "action": "guardarPrecioDetallePedidoInt", id: id, "codigo": codigo, "precio_est": precio_est, "nro": nro },
         async: true,
         dataType: "html",
         beforeSend: function() {
             $("#estado_" + id).addClass("guardando");
         },
         complete: function(objeto, exito) {
             if (exito == "success") {
                 var result = $.trim(objeto.responseText);
                 $("#estado_" + id).removeClass("guardando");
                 $("#estado_" + id).addClass("guardado");
             }
         },
         error: function() {
             $("#estado_" + id).removeClass("guardando");
             $("#estado_" + id).addClass("error");
         }
     });
 }

 function setPonderacion(cod_cli, pond) {

     $(".pond_" + cod_cli + "").each(function() {

         $(this).val(pond);
         var cantidad = parseFloat($(this).parent().prev().text());
         var calc = parseFloat(cantidad * pond);
         $(this).parent().next().html(calc);

         var hash = $(this).parent().parent().attr("data-hash");
         var suma = 0;
         $(".cant_pond_" + hash + "").each(function() {
             var val = parseFloat($(this).text().replace(".","").replace(",","."));
             suma += val;

             var id = ($(this).parent().attr("id")).substring(3, 30);
             var precio_est = $("#precio_est_" + id).val();
             var ponderacion = $("#pond_" + id).val();

             guardarLinea(id, cod_cli, ponderacion, precio_est);
             $(".total_pond_" + hash + "").html(parseFloat(suma));

             var id_tot = $(".total_pond_" + hash + "").attr("id").substring(11, 30);;
             var Stock = $("#stock_" + id_tot).val();
             var ponderada = suma;
             $("#diff_" + id_tot).val(Stock - ponderada);
         }); 

     });
     // Corregir Todo 
 }

 function guardarLinea(id, cod_cli, pond, precio_est) {
     var nro = $("#nros_internacionales").val();
     $.ajax({
         type: "POST",
         url: "Ajax.class.php",
         data: { "action": "guardarPonderacionCliente", "id": id, "cod_cli": cod_cli, "pond": pond, "precio_est": precio_est, "nro": nro },
         async: true,
         dataType: "html",
         beforeSend: function() {
             $("#estado_" + id).addClass("guardando");
         },
         complete: function(objeto, exito) {
             if (exito == "success") {
                 var result = $.trim(objeto.responseText);
                 $("#estado_" + id).removeClass("guardando");
                 $("#estado_" + id).addClass("guardado");
             }
         },
         error: function() {
             $("#estado_" + id).removeClass("guardando");
             $("#estado_" + id).addClass("error");
         }
     });
 }


 function getArticulosInternacional() {    

     var nro = $("#nros_internacionales").val();
     $.ajax({
         type: "POST",
         url: "Ajax.class.php",
         data: { "action": "getArticulosNotaPedidoInternacionalCompras", "nro": nro },
         async: true,
         dataType: "json",
         beforeSend: function() {
             $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >");
         },
         success: function(data) {
             $(".ui-widget-content").remove();
             for (var i in data) {
                 var codigo = data[i].codigo;
                 var descrip = data[i].descrip;
                 var cant_pond = data[i].cant_pond;
                 var pedido = data[i].pedido;
                 if(pedido == null){
                     pedido = 0;
                 } 
                 var porc = parseFloat(((pedido * 100) / cant_pond).toFixed(1));
                 $("#articulos").append('<li title="Pedido: '+porc+'%" class="ui-widget-content" style="cursor:pointer" id="' + codigo + '"><div style="float:left;width:60%">' + codigo + ' - ' + descrip + '</div><div style="float:right;width:39%"><div class="porc_procesado" style="text-align:center;width:'+porc+'%">'+porc+'%</div></div></li>');
             }
             $("#articulos").selectable({
                 selecting: function(event, ui) {
                     selected_code = ui.selecting.id;
                     setTimeout("getInternacionales()", 100);
                 }
             });
             $("#msg").html("");
         }
     });

 }

 function limpiar() {
     $("#p_compra").val("");
     $("#cod_prov").val("");
     $("#proveedor").val("");
     $("#obs").val("");
 }

 function comprado() {
     var p_compra = parseFloat($("#p_compra").val().replace(".", "").replace(",", "."));
     var cod_prov = $("#cod_prov").val();
     var proveedor = $("#proveedor").val();
     var fecha_prev = validDate($("#fp_1").val()).fecha;
     var codcat = $("#CodCat").val().trim();
     var color = $("#CodColor").val();
     var pantone = $("#pantone").val();
     var combinacion = $("#combinacion").val();
     var unidadMedida = $("select#unidadMedida option:selected").val();
     var diseno = $("#diseno").val();
     var obs = $("#obs").val();
     var diffProdCheck = true;

     var files = [];
     var filesData = [];
     $("tr[id^='tr_'].selected").each(function() {
         var current = $(this);
         var file = {};
         var hash = current.attr("data-hash");
         var cod = $(current.find("a[class^='codigo_']")).text();
         var color = $(current.find("a[class^='color_']")).text();

         if (files.indexOf(hash) < 0) {
             files.push(hash);
             filesData.push({
                 "cod": cod,
                 "color": color,
                 "hash": hash
             });
         }
     });
     if (files.length > 1) {
         var msg = ' Cargara los mimos datos de compra a Pedidos diferentes\n\n\n';
         filesData.forEach(function(data) {
             msg += 'Cod: ' + data.cod + ', Color: ' + data.color + '\n';
             for (var key in data) {
                 console.log(key + ':' + data[key]);
             }
         });
         diffProdCheck = confirm(msg);
     }
     var checkColorDisenho = $("input.data_err").length === 0;

     if (diffProdCheck) {
         if (p_compra > 0 && cod_prov != "" && proveedor != "" && fecha_prev != "" && obs != "" && $.trim(color) != "" && $.trim(diseno) !="" && checkColorDisenho) {

             $(".selected_check").each(function() {
                 var check_id = $(this).attr("id");
                 var id = check_id.substring(6, 30);
                 var nro_pedido = $("#tr_" + id).attr("data-nro");
                 $.ajax({
                     type: "POST",
                     url: "Ajax.class.php",
                     data: { "action": "pedidoComprado", "usuario": getNick(), p_compra: p_compra, cod_prov: cod_prov, proveedor: proveedor, codcat: codcat,pantone:pantone ,colorCod: color, combinacion: combinacion, unidadMedida: unidadMedida, diseno: diseno, obs: obs, id: id, nro_pedido: nro_pedido, fecha_prev: fecha_prev },
                     async: true,
                     dataType: "html",
                     beforeSend: function() {
                         $("#" + check_id).remove();
                         $("#msg_" + id).html("<img src='img/loading_fast.gif' width='18px' height='18px' >");
                     },
                     complete: function(objeto, exito) {
                         if (exito == "success") {
                             var result = $.trim(objeto.responseText);
                             if (result == "Ok") {
                                 //$("#tr_" + id).slideUp();
                                 $("#tr_" + id).remove();
                             } else {
                                 $("#msg_" + id).html("<img src='img/delete.png' width='18px' height='18px' >");
                             }
                         } else {
                             $("#msg_" + id).html("<img src='img/delete.png' width='18px' height='18px' >");
                         }
                     },
                     error: function() {
                         $("#msg_" + id).html("<img src='img/delete.png' width='18px' height='18px' >");
                     }
                 });
                 //$(".selected").slideUp();
                 $(".selected").remove();
                 limpiar();
             });
         } else {
             alert("\u2234 Verifique que todos los campos est\351n completos y sin errores !");
         }
     }
 }

 function cambiarEstadoPedidos(estado, fp) {
     var obs = $("#obs_" + fp).val();
     var fecha_prev = validDate($("#fp_" + fp).val()).fecha;

     if (obs != "") {
         var errors = 0;
         $(".selected_check").each(function() {
             var check_id = $(this).attr("id");
             var id = check_id.substring(6, 30);
             var nro_pedido = $("#tr_" + id).attr("data-nro");
             $.ajax({
                 type: "POST",
                 url: "Ajax.class.php",
                 data: { "action": "cambiarEstadoPedido", "usuario": getNick(), obs: obs, estado: estado, id: id, nro_pedido: nro_pedido, fecha_prev: fecha_prev },
                 async: true,
                 dataType: "html",
                 beforeSend: function() {
                     $("#msg").html("<img src='img/loading.gif' width='22px' height='22px' >");
                 },
                 complete: function(objeto, exito) {
                     if (exito == "success") {
                         var result = $.trim(objeto.responseText);
                         if (result == "Ok") {
                             if (estado == "Cancelado") {
                                 $("#estado_" + id).html("Cancelado");
                                 $("#estado_" + id).addClass("cancelado");
                             } else if (estado == "Disponible en Stock") {
                                 $("#estado_" + id).html("Disponible");
                                 $("#estado_" + id).addClass("disponible");
                             } else {
                                 $("#estado_" + id).html(estado);
                                 $("#estado_" + id).addClass("tracking");
                                 setTimeout(function() {
                                     $("#tr_" + id).slideUp("fast");
                                 }, 4000);
                             }
                             $("#" + check_id).prop("checked", false);
                             $(".selected").removeClass("selected");
                             limpiar();
                             resetCampos();
                         } else {
                             errors++;
                         }
                         $("#msg").html("");
                         resetCampos();
                     } else {
                         errors++;
                     }
                 },
                 error: function() {
                     errors++;
                     $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
                 }
             });
         });
         if (errors < 1) {
             $(".selected_check").removeClass("selected_check");
         }
     } else {
         alert("Debe completar completar la Observacion...");
         seleccionarRadio();
     }


 }

 function setDragable() {
     $(".area_trabajo").draggable({
         stop: function(event, ui) {

             //$(".area_trabajo").width(totalWidth+100);
             $(".area_trabajo").css("height", "auto");
         }
     });
     checkEstado();    
 }

 function verResumen() {
     var nro = $("#nros_internacionales").val();
     var usuario = getNick();
     var url = "compras/ResumenPedido.class.php?nro=" + nro + "&usuario=" + usuario;
     var title = "Resumen Pedido Internacional";
     var params = "width=800,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=no,location=no";
     window.open(url, title, params);
 }

 function cambiarEstadoNota() {
     $("#dialog-confirm").dialog({
         resizable: false,
         height: 140,
         modal: true,
         buttons: {
             "Cancelar": function() {
                 $(this).dialog("close");
             },
             "Aceptar": function() {
                 $(this).dialog("close");
                 var nro = $("#nros_internacionales").val();
                 var estacion = $('input[name=estacion]:checked').val();

                 $.ajax({
                     type: "POST",
                     url: "Ajax.class.php",
                     data: { "action": "cambiarEstadoNotaPedidoInternacional", "usuario": getNick(), "nro": nro, estacion: estacion },
                     async: true,
                     dataType: "html",
                     beforeSend: function() {
                         $("#msg").html("<img src='img/loading.gif' width='18px' height='18px' >");
                     },
                     complete: function(objeto, exito) {
                         if (exito == "success") {
                             var result = $.trim(objeto.responseText);
                             $("#msg").html(result);
                             $("#cerrar").fadeOut();
                             alert("Se ha cambiado el estado de la Nota con Exito.");
                             showMenu();
                         }
                     },
                     error: function() {
                         $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
                     }
                 });
             },
             close: function() {
                 $(this).dialog("destroy");
             }
         }
     });

     /*
    var c = confirm("Confirme Poner en Proceso esta Nota de Pedido. No podra revertirla posteriormente.");
        if(c){
        
    }*/
 }

 /**
  *  Inicia la vista de disenhos
  */
 function grillaDisenho() {
     
     disenos.forEach(function(val, key) {
         var c = 'img/PATTERNS/' + val.Folder + '/';
         var pt = val.Design;
         $("<p/>", {
             "text": pt,
             "class": "patrones",
             "data-patron": pt.toLowerCase()
         }).appendTo("#patrones");
         val.files.forEach(function(val) {
             $("<img/>", {
                 "src": c + val,
                 "height": "32",
                 "width": "32",
                 "class": "patrones",
                 "click": function() {
                     $("#diseno").val(($(this).attr("data-patron").toUpperCase()));
                     verOcultarGrilla($("#verOcultarGrilla"));
                 },
                 "data-patron": pt.toLowerCase()
             }).appendTo("#patrones");
             $("#patrones").appendTo("#designs_container");
         });
         autocompletadoPatron.push(pt);
     });
     $("#diseno").autocomplete({ source: autocompletadoPatron });
     // Busqueda
     /*
     $("#diseno").keyup(function() {
         var search = ($(this).val()).toLowerCase();
         if (search.length > 0) {
             $(".patrones").hide();
             $("[data-patron^='" + search + "']").show();
         } else {
             $(".patrones").show();
         }
     });*/
     $("img.patrones").hover(function() {
         $("#preview img").attr("src", $(this).attr("src"));
     });
     $("#designs_container").draggable();
     $("#pantone").autocomplete({ source: colores });
 }
 /**
  * Ver / Ocultar Grilla de Disenhos
  */

 function verOcultarGrilla(obj) {
     var target = obj;

     if (target.attr("data-ch") === 'ver') {
         target.html("Ocultar Dise&ntilde;os");
         target.attr("data-ch", "ocultar");
         $("#designs_container").show();
     } else {
         target.attr("data-ch", "ver");
         target.html("Ver Dise&ntilde;os");
         $("#designs_container").hide();
     }
 }