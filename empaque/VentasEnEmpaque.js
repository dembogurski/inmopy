//var factura = 0;
var empaquePrControl = setTimeout("contarVentasEnprocesoTodos()", 500);
var fila_venta = 0;
var cant_facturas = 0;
var fila_detalle = 0;
var cant_detalles = 0;
var control = false;
var abriendoFactura = false;
var ignorarControles = false;
var guardando = false;
var detalleFactura;
var impresion_codigo_barras;
var remision;
var index_transp = 0;
var index_chofer = 0;

var error_en_fila = -1;

var last_focused_input = "";

function configurar() {
    //var callSetKeys = null;
    fila_venta = 0;
    cant_facturas = 0;

    $(".clicable").click(function() {
        var factura = $(this).parent().attr("id").substring(5, 20);
        controlarFactura(factura);
    });
    inicializarCursores("clicable");

    $(window).scroll(function() {
        $('#control_pupup').animate({ top: $(window).scrollTop() + "px" }, { queue: false, duration: 350 });
    });

    //setHotKeysFactura();
    selectRow(0);
    //acomodarPopup();
    $(window).resize(function() {
        acomodarPopup();
    });
    //$(".estado_factura").mouseenter(function(){$(this).children().fadeIn()});
    //$(".estado_factura").mouseleave(function(){$(this).children().fadeOut()});
    statusInfo();
    $("#balanza").val(getCookie("balanza").sesion); // Poner balanza ultimamente utilizada
    $("#image_container").draggable();
    $("#image_container").click(function() { $(this).fadeOut() });
    /*
    $("#passw").keydown(function(e) {         
        var tecla = e.keyCode; 
       
         if (tecla == 13) {
             //autorizarMalCorte();
         }
    });*/
    
    contarVentasEnproceso();
    if(getSuc() == "00"){
        getFacturasContables();
    }
}

function cerrarVerificacion() {
    $("#verificar").fadeOut();
    //setHotKeysFactura();
    setHotKeysDetalle();
}

function setHotKeysFactura() {

    $(document).keydown(function(e) {
        cant_facturas = parseInt($("#cant_facturas").html()) - 1;
        var tecla = e.keyCode;
         
        if($("table#fact2vendedorForm").length == 0){
            if (tecla >= 37 && tecla <= 38) {
                (fila_venta == 0) ? fila_venta = cant_facturas: fila_venta--;
                selectRow(fila_venta);
            }
            if (tecla >= 39 && tecla <= 40) {
                (fila_venta == cant_facturas) ? fila_venta = 0: fila_venta++;
                selectRow(fila_venta);
            }
            if (tecla == 13) {
                if (!abriendoFactura) {
                    abriendoFactura = true;
                    var factura = $(".fila_venta_" + fila_venta).attr("id").substring(5, 20);
                    controlarFactura(factura);
                    setTimeout("abriendoFactura=false;", 1000);
                }
            }
        }
        if (tecla == 116) { // F5
            e.preventDefault();
            recargar();
        }
    });
}

function setHotKeysDetalle() {
    fila_detalle = 0;
    $(document).keydown(function(e) {
        var tecla = e.keyCode;
         
        if($("table#fact2vendedorForm").length == 0){
            if (tecla == 38) {
                (fila_detalle == 0) ? fila_detalle = cant_detalles: fila_detalle--;
                selectDetRow(fila_detalle);
            }
            if (tecla == 40 || tecla == 13) { // Flecha abajo o Enter para el Siguiente
                if ($("#controlado").is(":focus")) {
                    finalizar();
                } else {
                    (fila_detalle == cant_detalles) ? fila_detalle = 0: fila_detalle++;
                    selectDetRow(fila_detalle);
                }
            }
            if (tecla == 27) { // Escape
                cancelar();
            }
            if (tecla == 67) { // c = Caputar 
                var fila = $(":focus").parent().parent().attr("data-fila");
                if (fila != undefined) {
                    var sis_med = $(".sis_" + fila).val();
                    if (sis_med === "Kg") {
                        balanza(fila);
                    } else {
                        $("#msg").addClass("error").html("El sistema de Medicion debe estar en Kilos para poder capturar");
                        setTimeout('$("#msg").removeClass("error").html("")', 6000);
                    }
                }
            }

            var numeros = (tecla > 45 && tecla < 58);
            var numpad = (tecla > 95 && tecla < 106);
            var F5 = (tecla == 116);
            var F12 = (tecla == 123);
            var punto = (tecla == 110);
            var flechas = (tecla == 39 || tecla == 37);
            var backspace_tab = (tecla == 8 || tecla == 9);

            var passwfocus = $("#passw").is(":focus");

            if (!(numeros || numpad || F5 || F12 || punto || backspace_tab || flechas) && !passwfocus) {
                e.preventDefault();
            }
            if (tecla == 73) { // i
                showDetail()
            }
            if (tecla == 75) { // k Cambiar Unidad de Medicion a Kilos
                cambiarSistemaMedicion(fila_detalle, "Kg");
            }
            if (tecla == 77) { // M Cambiar Unidad de Medicion a Metros
                cambiarSistemaMedicion(fila_detalle, "Mts");
            }
            if (tecla == 70) { // F Finalizar posicionarse en el boton Controlado
                $("#controlado").focus();
                e.preventDefault();
            }
        }
    });
    $(".cantidad").click(function() {
        /*
          var codigo = $(this).parent().attr("id").substring(3, 20);
          var actual = $(this).html();
          var position = $(this).position();
          var w = $(this).width()
          modificarCantidad(codigo,actual,position,w);     */
    });
    $(".falla").click(function() {
        var codigo = $(this).parent().attr("id").substring(3, 20);
        var fila = $("#tr_" + codigo).attr("data-fila");
        var um_venta = $(".um_venta_" + fila).html();
        var codigo_falla = $(".cm_falla_" + fila).attr("data-cod_falla");

        if (um_venta != "Unid" && codigo_falla != "") {
            var actual = $(this).html();
            var position = $(this).position();
            var w = $(this).width()
            modificarFalla(codigo, actual, position, w);
        }
        if (codigo_falla == "") {
            $("#msg").attr("class", "errorgrave");
            $("#msg").html("Pieza no esta marcada con fallas, debe agregar codigo de Fallas.");
            setTimeout('$("#msg").attr("class","info");', 8000);
            setTimeout('$("#msg").html("")', 8000);
        }
    })

    $(".input_kg_med").keyup(function() {
        //var fila = $(this).parent().parent().attr("data-fila");
        //calcularMedicion(fila);
    });
}

function abrirFactura(factura) {
    alert("Ya no esta permitido la Apertura de Facturas.\n\rSi tiene problemas con el Metraje, consulte el procedimiento a su Superior");
    /*
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "cambiarEstadoFactura",factura:factura, "estado": "Abierta"},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#estado_"+factura).html("<img src='img/loading.gif' width='22px' height='22px' >");                      
        },
        complete: function(objeto, exito) {
            if (exito == "success") {                          
                $("#fact_"+factura).remove();     
            }
        },
        error: function() {
            $("#img_"+factura).html("Error");     
        }
    }); */
}
/**
 * Verifica si todos estan guardados
 * @returns {undefined}
 */
function verificarCambios() {
    control = false;
    var errors = 0;
    $(".det_codigo").each(function(fila) {
        var input = float(".med_" + fila);
        var g = $(".g_" + fila).html();

        if (input == "0" || g != "Ok") {
            control = false;
            $("#controlado").attr("disabled", true);
            errors++
        }
    });

    if (errors == 0) {
        control = true;
        $("#controlado").removeAttr("disabled");
    }
}

function finalizar() {
    $("#controlado").attr("disabled", true);
    $("#image_container").fadeOut();
    var errors = 0;
    if (control) {
        $(".det_codigo").each(function(fila) {
            var g = $(".g_" + fila).html();
            if (g != "Ok") {
                control = false;
                $("#controlado").attr("disabled", true);
                errors++
            }
        });
        if (errors == 0) {
            var factura = $("#factura").val();
            $.ajax({
                type: "POST",
                url: "Ajax.class.php",
                data: { "action": "enviarFacturaCaja", factura: factura, usuario: getNick() },
                async: true,
                dataType: "html",
                beforeSend: function() {
                    $("#msg").html("<img src='img/loading.gif' width='22px' height='22px' >");
                },
                complete: function(objeto, exito) {
                    if (exito == "success") {
                        $("#fact_" + factura).remove();
                        cerrarPopupEmpaque(); // Cancelar remueve los detalles, levanta el Popup
                    }
                },
                error: function() {
                    $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
                }
            });
        }
    } else {
        alert("Error au no se ha controlado todo...");
    }
}

function guardarControl(fila) {
    var medicion = float(".med_" + fila);
    var ajuste = $(".corr_" + fila).html();
    if (!guardando || ignorarControles) {
        //guardando = true;    

        if (medicion != "0" && ajuste != "") {
            var factura = $("#factura").val();
            var sis_med = $(".sis_" + fila).val();
            var calc = $(".cant_calc_" + fila).html().replace(",", "");
            var diff = $(".info_" + fila).html();
            var fr = $(".fr_" + fila).html();
            var falla = $(".cm_falla_" + fila).html();
            var um = $(".um_venta_" + fila).text();
            if (ajuste == '<img src="img/ok.png">') {
                ajuste = "";
            }
            if (fr == "") { fr = 0; }
            var lote = $(".fila_" + fila).attr("id").substring(3, 20);
            $.ajax({
                type: "POST",
                url: "Ajax.class.php",
                data: { "action": "guardarControlEmpaque", factura: factura, lote: lote, medicion: medicion, sis_med: sis_med, calc: calc, diff: diff, fuera_rango: fr, ajuste: ajuste, verificador: getNick(), falla: falla, um: um, usuario: getNick() },
                async: true,
                dataType: "html",
                beforeSend: function() {
                    $(".g_" + fila).html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
                },
                complete: function(objeto, exito) {
                    if (exito == "success") {
                        var result = $.trim(objeto.responseText);
                        $(".g_" + fila).html(result);
                        verificarCambios();
                    }
                },
                error: function() {
                    $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
                }
            });
        }
    }
    setTimeout("guardando=false;", 700);
}

function mostrarMensajes(fila, cant_calc, ra, rb, diff, margen, ct) {

    if (isNaN(cant_calc) || diff == Infinity) {
        $(".cant_calc_" + fila).html("Error");
        $(".info_" + fila).html("Error");
        $(".info_" + fila).removeClass("info");
        $(".info_" + fila).addClass("error");
    } else {
        var margen_neg = ct - margen;
        var margen_pos = ct + margen;
        console.log("cant_calc " + cant_calc + " > margen_pos " + margen_pos + "   ||  " + cant_calc + " < " + margen_neg + "   ");

        if ((cant_calc > margen_pos) || (cant_calc < margen_neg)) {
            $("#msg").attr("class", "errorgrave");
            $("#msg").html("Atencion! ha introducido un valor fuera del Rango! Min:" + rb + " Max:" + ra);
            $(".g_" + fila).html("");
            $("#verificar").attr("data-fila", fila);
            $("#passw").val("");
            $("#ajuste_supervisor").fadeIn();

            setTimeout('$("#msg").attr("class","info");', 8000);
            setTimeout('$("#msg").html("")', 8000);
            $(".med_" + fila).addClass("errorgrave");
            setTimeout("$('.errorgrave').removeClass('errorgrave');", 8000);
            if (error_en_fila == -1 || error_en_fila == fila) {
                //setTimeout("$('.med_"+fila+"').focus()",1000);
            }
            error_en_fila = fila;
        } else {
            $("#ajuste_supervisor").fadeOut();
            error_en_fila = -1;
            $(".cant_calc_" + fila).html(parseFloat(cant_calc).format(2, 3, ',', '.'));
            if (diff < 0) {
                $(".info_" + fila).removeClass("info");
                $(".info_" + fila).addClass("error");
            } else {
                $(".info_" + fila).removeClass("error");
                $(".info_" + fila).addClass("info");
            }
            $(".info_" + fila).html(diff);
            if (cant_calc < rb) {
                var valor_mc = redondear(rb - cant_calc) * -1;
                $(".fr_" + fila).html(valor_mc);
                $(".corr_" + fila).html("M.C.");
            } else if (cant_calc > ra) {
                var valor_mc = redondear(cant_calc - ra);
                $(".fr_" + fila).html(valor_mc);
                $(".corr_" + fila).html("M.C.");
            } else { // Dentro del Rango
                var falla = parseFloat($(".cm_falla_" + fila).html());

                $(".fr_" + fila).html("");
                if (falla > 0) {
                    var cod_falla = $(".cm_falla_" + fila).attr("data-cod_falla");
                    if (cod_falla == "FP") {
                        $(".corr_" + fila).html("D.FP.");
                    } else {
                        $(".corr_" + fila).html("D.F.");
                    }
                } else {
                    $(".corr_" + fila).html("<img src='img/ok.png'>");
                }
            }
            //console.log("Guardando control fila "+fila);
            guardarControl(fila);
        }
    }
}

function calcularMedicion(fila) {
    //console.log(fila);
    var cantidad = parseFloat($(".cant_" + fila).text());
    var tolerancia = parseInt($("#margen_tolerancia").val());

    var sis_med = $(".sis_" + fila).val();
    var um_venta = $(".um_venta_" + fila).text();
    var falla = parseFloat($(".cm_falla_" + fila).html());
    var ancho = parseFloat($(".ancho_" + fila).text());
    var gramaje = parseFloat($(".gram_" + fila).html());
    var tara = parseFloat($(".fila_" + fila).attr("data-tara"));
    tara = 0; // No tomar en cuenta la tara ahora
    var medido = float(".med_" + fila);

    var margen_error_alerta = parseInt($(".fila_" + fila).attr("data-margen"));

    var margen = 0;

    var long_calc = 0;
    var diff = 0;

    if (medido > 0) {
        
        if (um_venta === "Mts") {
            
            var ct = cantidad + falla;
            console.log("Medido " + medido + "  UM Prod: " + um_venta + "  sis_med " + sis_med+"   ct: "+ct);
             
            var ra = redondear(ct + ((parseInt(ct + 1) * tolerancia) / 100));
            var rb = redondear(ct - ((parseInt(ct + 1) * tolerancia) / 100)) * 100 / 100;

            //console.log("Cant + Falla = "+ct+ "    Valor de Tolerancia en cm = " + vt + " Minimo: " + rb + "   Maximo: " + ra);

            if (sis_med === "Kg") {
                long_calc = (((medido - (tara / 1000)) * 1000) / (gramaje * ancho)).toFixed(2);
                diff = (long_calc - (ct)).toFixed(2);
            } else { // Sis Med = Mts
                long_calc = float(".med_" + fila);
                diff = (long_calc - (ct)).toFixed(2);
            }
            margen = (ct * margen_error_alerta) / 100;
            mostrarMensajes(fila, long_calc, ra, rb, diff, margen, ct);
        }

        if (um_venta === "Kg") {
            var kilaje_falla = redondear((gramaje * falla * ancho) / 1000);
            var total = cantidad + kilaje_falla; //Kilaje total Vendido + Falla
            var metraje_total_cargado = redondear(((total + (tara / 1000)) * 1000) / (gramaje * ancho));

            //console.log(metraje_total_cargado);
            var rb = redondear(metraje_total_cargado - (metraje_total_cargado * tolerancia) / 100);
            var ra = redondear(metraje_total_cargado + (metraje_total_cargado * tolerancia) / 100);

            if (sis_med === "Kg") {  
                var metraje_total_medido = redondear((( medido * 1000)) / (gramaje * ancho)); // No quitar la tara - (tara / 1000)
                diff = redondear(metraje_total_medido - metraje_total_cargado);
                 console.log("KG  Rango Bajo: "+rb+"    Correcto: "+metraje_total_cargado+"    Rango Alto: "+ra+"   "+metraje_total_medido);
                margen = (metraje_total_medido * margen_error_alerta) / 100;
                mostrarMensajes(fila, metraje_total_medido, ra, rb, diff, margen, metraje_total_cargado);
            } else { // Mts 
                diff = redondear(medido - metraje_total_cargado);
                margen = (medido * margen_error_alerta) / 100;
                mostrarMensajes(fila, medido, ra, rb, diff, margen, medido);
                console.log(">> MTS Rango Bajo: "+rb+"    Correcto: "+metraje_total_cargado+"    Rango Alto: "+ra+"   ");
            }
        }
        if (um_venta === "Unid") {
            var rb = cantidad;
            var ra = cantidad;
            diff = medido - cantidad;
            margen = 0;
            mostrarMensajes(fila, medido, ra, rb, diff, margen, cantidad);
            
        }
    } else {
        console.log("Medido: " + medido);
    }
    //verificarCambios();
}

function cambiarSistemaMedicion(fila, sistema) {
    var sis_med = $(".sis_" + fila).val();
    if (sis_med !== "Unid") {
        if (sis_med === "Kg" && sistema == "Mts") {
            $(".sis_" + fila).val("Mts");
            $("#balanza_" + fila).slideUp("slow");
            $(".med_" + fila).focus().select();
        } else if (sis_med === "Mts" && sistema == "Kg") {
            $(".sis_" + fila).val("Kg");
            $("#balanza_" + fila).slideDown("slow");
        } // Else Unid no se puede cambiar a nada
    }
}

function modificarCantidad(codigo, cant_actual, pos, w) {
    alert("Ya no esta permitido modificar la Cantidad vendida.\n\rSi tiene problemas con el Metraje, consulte el procedimiento a su Superior");
    /*
        $("#edit_falla").fadeOut("fast"); 
        $("#new_cant").attr("data-editcode",codigo);
        $("#new_cant").attr("data-oldcant",cant_actual); 
        $("#new_cant").val(cant_actual);  
        var pw = $("#edit").width();
        var calc = (pos.left + w) - pw;
        $("#edit").css("margin-left",calc); 
        $("#edit").css("margin-top",pos.top-1);
        $(".tmp_edit").remove();
        $("#edit").fadeIn("fast");    
        $("#new_cant").select();
        $("#new_cant").keydown(function(e){
           if($(this).val() > 0){
               $("#accept_edit").removeAttr("disabled");
           }else{
               $("#accept_edit").attr("disabled",true); 
           } 
           if (e.keyCode == 13) {   
              cambiarCantidadVenta();  
           }
        });*/
}

function modificarFalla(codigo, cant_actual, pos, w) {
    $("#edit").fadeOut("fast");
    $("#new_falla").attr("data-editcode", codigo);
    $("#new_falla").attr("data-oldfalla", cant_actual);
    $("#new_falla").val(cant_actual);
    var pw = $("#edit_falla").width();
    var calc = (pos.left + w) - pw;
    $("#edit_falla").css("margin-left", calc);
    $("#edit_falla").css("margin-top", pos.top - 1);
    $(".tmp_edit").remove();
    $("#edit_falla").fadeIn("fast");
    $("#new_falla").select();
    $("#new_falla").keydown(function(e) {
        if ($(this).val() > 0) {
            $("#accept_falla").removeAttr("disabled");
        } else {
            $("#accept_falla").attr("disabled", true);
        }
        if (e.keyCode == 13) {
            cambiarCantidadFalla();
        }
    });
}

function cambiarCantidadVenta() {
    var factura = $("#factura").val();
    var codigo = $("#new_cant").attr("data-editcode");
    var old_cant = $("#new_cant").attr("data-oldcant");
    var cant = parseFloat($("#new_cant").val());
    var fila = $("#tr_" + codigo).attr("data-fila");
    var usuario = getNick();
    var gramaje = parseFloat($(".gram_" + fila).html());
    var ancho = parseFloat($(".ancho_" + fila).html());
    var falla = parseFloat($(".cm_falla_" + fila).html());
    var um = $(".um_venta_" + fila).html();

    var stock_real = parseFloat($(".fila_" + fila).attr("data-stock_real"));
    if (cant > stock_real) {
        alert("Stock " + stock_real + " " + um + " es insuficiente para lo que trata de vender " + cant + " " + um + "");
        return;
    }

    var kg_calc = 0;
    if (um == "Mts") {
        if (gramaje > 0 && ancho > 0) {
            var c = eval(cant + falla);
            kg_calc = ((gramaje * ancho * (c)) / 1000).format(3, 0, '', '.');
        }

    } else if (um == "Kg") {
        var kg_falla = ((gramaje * ancho * falla) / 1000);
        kg_calc = cant + kg_falla;
    } else { //Unid
        kg_calc = 0;
        if ((cant % 1) > 0) {
            alert("Cantidad en Para Unidades no puede tener decimales");
            return;
        } else {
            $(".med_" + fila).val(cant);
        }
    }

    $(".kg_calc_" + fila).html(kg_calc);

    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "cambiarCantidadVenta", "usuario": usuario, "factura": factura, codigo: codigo, cantidad: cant, old_cant: old_cant },
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#new_cant").after("<img class='tmp_edit' src='img/loading_fast.gif' style='margin-left:-26px;margin-bottom:-4px'>");
        },
        complete: function(objeto, exito) {
            if (exito == "success") {
                var result = $.trim(objeto.responseText);
                $("#edit").fadeOut("fast");
                $(".cant_" + fila).html(cant);
                calcularMedicion(fila);
            }
        },
        error: function() {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });
}

function cambiarCantidadFalla() {
    var factura = $("#factura").val();
    var codigo = $("#new_falla").attr("data-editcode");
    var old_falla = parseFloat($("#new_falla").attr("data-oldfalla"));
    var falla = parseFloat($("#new_falla").val());
    if (falla <= old_falla || (old_falla <= 0.3 && falla <= 0.3)) {
        var fila = $("#tr_" + codigo).attr("data-fila");
        var usuario = getNick();
        var gramaje = parseFloat($(".gram_" + fila).html());
        var ancho = parseFloat($(".ancho_" + fila).html());
        var cant = parseFloat($(".cant_" + fila).html());
        var um = $(".um_venta_" + fila).html();
        var kg_calc = 0;
        if (um == "Mts") {
            if (gramaje > 0 && ancho > 0) {
                var c = eval(cant + falla);
                kg_calc = ((gramaje * ancho * (c)) / 1000).format(3, 0, '', '.');
            }

        } else if (um == "Kg") {
            var kg_falla = ((gramaje * ancho * falla) / 1000);
            kg_calc = (cant + kg_falla).format(3, 0, ".", "");
        } else { //Unid
            kg_calc = 0;
            if ((cant % 1) > 0) {
                alert("Cantidad en Para Unidades no puede tener decimales");
                return;
            } else {
                $(".med_" + fila).val(cant);
            }
        }

        $(".kg_calc_" + fila).html(kg_calc);

        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "cambiarCantidadFalla", "usuario": usuario, "factura": factura, codigo: codigo, falla: falla, old_falla: old_falla },
            async: true,
            dataType: "html",
            beforeSend: function() {
                $("#new_cant").after("<img class='tmp_edit' src='img/loading_fast.gif' style='margin-left:-26px;margin-bottom:-4px'>");
            },
            complete: function(objeto, exito) {
                if (exito == "success") {
                    var result = $.trim(objeto.responseText);
                    $("#edit_falla").fadeOut("fast");
                    $(".cm_falla_" + fila).html(falla);
                    calcularMedicion(fila);
                }
            },
            error: function() {
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        });
    } else {
        $("#msg").addClass("error");
        $("#msg").html("Solo se permite cargar fallas hasta "+old_falla+" Mts");
        setTimeout('$("#msg").html("");', 8000);
    }

}

function recargar() {
    genericLoad("empaque/VentasEnEmpaque.class.php");
}

function cerrarPopupEmpaque() {
    if ($(".xinfo").is(":visible")) {
        $(".xinfo").hide();
    }
    $('.det_codigo').remove();
    $('#control_pupup').slideUp("fast");

    $(document).off('keydown');
    $("#image_container").fadeOut();
    //setHotKeysFactura();
    $("#back_arrow").slideDown();
}

function cancelar() {
    // Remover Lineas de Facturas Anterioes 
    if ($(".xinfo").is(":visible")) {
        $(".xinfo").hide();
    }
    $('.det_codigo').remove();
    var factura = $("#factura").val();
    $.post("Ajax.class.php", { action: "cancelarControlEmpaque", factura: factura, usuario: getNick() });

    $('#control_pupup').slideUp("fast");

    $(document).off('keydown');
    $("#image_container").fadeOut();
    //setHotKeysFactura();
    $("#back_arrow").slideDown();
    $("#control_laser").slideUp();
    $(".datos_remision").fadeOut();        
}

function selectRow(row) {
    $(".venta_selected").removeClass("venta_selected");
    $(".fila_venta_" + row).addClass("venta_selected");
    $(".cursor").remove();
    $($(".fila_venta_" + row + " td").get(3)).append("<img class='cursor' src='img/l_arrow.png' width='18px' height='10px'>");
}

function selectDetRow(row) {
    //var sel = select||true;
    $(".fila_selected").removeClass("fila_selected");
    $(".fila_" + row).addClass("fila_selected");
    $(".cursor").remove();
    $($(".fila_" + row + " td").get(1)).children().before("<img class='cursor' src='img/r_arrow.png' width='18px' height='10px' style='margin-left: -21;padding-right: 3px'>");
    $(".med_" + row).focus().select();
    var sistem_medicion = $(".sis_" + row).html();
    $(".borde_rojo").removeClass("borde_rojo");
    $(".borde_verde").removeClass("borde_verde");
    if (sistem_medicion === 'Kg') {
        $(".kg_calc_" + row).addClass("borde_rojo");
        $(".cant_" + row).addClass("borde_verde");
        $(".cant_calc_" + row).addClass("borde_verde");
    } else {
        $(".cant_" + row).addClass("borde_verde");
        $(".cant_calc_" + row).addClass("borde_verde");
    }
    last_focused_input = ".med_" + row;
    showImage(row);
}

function showImage(row) {
    var img = $(".fila_" + row).attr("data-img");
    var stock_real = $(".fila_" + row).attr("data-stock_real");
    if (img !== undefined) {
        var image_path = $("#images_url").val();
        var image_url = image_path + "/" + img + ".thum.jpg";
        $("#image_container").html("<div class='stock_real'>Cant.: " + stock_real + "</div> <img src='" + image_url + "' width='89px' alt='Sin Foto'>");
        $("#image_container").fadeIn();
        var w = $($(".fila_" + row + " td").get(1)).width();
        var pos = $($(".fila_" + row + " td").get(1)).position();
        var left = pos.left;
        var top = pos.top;
        var izq = (left + w) - $("#image_container").width();
        $("#image_container").css({ top: top, left: izq });
    }
}

function balanza(row, intentos) {
    selectDetRow(row);
    var objeto = $(".med_" + row);
    var intentos = intentos || 0;
    intentos++;
    $("#balanza_" + row).addClass("balanza_button_reading");
    var ip_balanza = $("#balanza").val();
    if (ip_balanza == null) {
        ip_balanza = "localhost";
        $("#balanza").val(ip_balanza);
    }


    $.ajax({
        url: "http://" + ip_balanza + "/serial/Indicador_LR22.php",
        dataType: "jsonp",
        jsonp: "mycallback",
        timeout: 4000,
        success: function(data) {
            objeto.css("background-color", "");
            var peso = data.peso;
            var estado = data.estado;
            if (estado == "estable") {
                if (peso == "") {
                    //console.log("Estado "+estado+" Intento:"+intentos);
                    if (intentos < 2) {
                        balanza(row, intentos);
                    } else {
                        objeto.css("color", "red");
                        objeto.val("error");
                        intentos = 0;
                        $("#balanza_" + row).removeClass("balanza_button_reading");
                        $("#balanza_" + row).addClass("balanza_button");
                    }
                } else {
                    objeto.css("color", "black");
                    objeto.val(peso);
                    calcularMedicion(row);
                    intentos = 0;
                    $("#balanza_" + row).removeClass("balanza_button_reading");
                    $("#balanza_" + row).addClass("balanza_button_read");
                }
            } else {
                objeto.css("color", "red");
                objeto.val("");
                if (peso === "-1000" || peso === -1000) {
                    alert("Hubo un error al intentar leer los datos de la balanza, verifique los cables de la balanza...");
                }
                if (estado == "inestable") {
                    $(".info_" + row).css("color", "red");
                    $(".info_" + row).html("Instable");
                    $("#balanza_" + row).removeClass("balanza_button_reading");
                    $("#balanza_" + row).addClass("balanza_button");
                }

            }
        },
        error: function(XHR, textStatus, errorThrown) {
            objeto.css("color", "red");
            $("#balanza_" + row).removeClass("balanza_button_reading");
            $("#balanza_" + row).addClass("balanza_button");
            objeto.val("Error").focus();
            objeto.select();
            $(".info_" + row).css("color", "red");
            $(".info_" + row).html("Balanza no Conectada");

            $("#balanza_" + row).removeClass("balanza_button_reading");
            $("#balanza_" + row).addClass("balanza_button");
        }
    });
}

function inicializarCursoresDetalle(clase) {
    $(".select").click(function() {
        var row = $(this).parent().attr("data-fila");
        selectDetRow(row);
        fila_detalle = row;
    });
    $(".input_kg_med").click(function() {
        var row = $(this).parent().parent().attr("data-fila");
        selectDetRow(row);
    });
    $(".tipo_med").click(function() {
        var row = $(this).parent().parent().attr("data-fila");
        //console.log(row);
        var sis_med = $(this).val();
        if (sis_med !== "Unid") {
            if (sis_med === "Kg") {
                $(this).val("Mts");
                $("#balanza_" + row).slideUp("slow");
                $(".med_" + row).focus().select();
            } else if (sis_med === "Mts") {
                $(this).val("Kg");
                $("#balanza_" + row).slideDown("slow");
            } // Else Unid no se puede cambiar a nada
        }
        calcularMedicion(row);
    });
}

function showDetail() {
    if ($(".xinfo").is(":visible")) {
        $(".xinfo").hide();
    } else {
        $(".xinfo").show();
    }
}

function controlarFactura(factura) {
    this.factura = factura;
    this.controlando = true;
    var fecha = $("#fecha_" + factura).html();
    var cod_cli = $("#ruc_" + factura).attr("data-cod_cli");
    var cat = $("#ruc_" + factura).attr("data-categoria");
    var ruc = $("#ruc_" + factura).html();
    var cliente = $("#cliente_" + factura).html();
    var total_gs = $("#total_" + factura).html();

    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "detalleFacturaEmpaque", "factura": factura, usuario: getNick(),suc:getSuc() },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $(".det_codigo").remove();
            $(".fact_vend").hide();
            $("#msg").html("<img src='img/loading.gif' width='22px' height='22px' style='margin-bottom:-5px' >");
        },
        success: function(data) {
            var j = 0;
            detalleFactura = data;

            if (data.Error != "Factura en Edicion") {
                $("#factura").val(factura);
                $("#fecha").val(fecha);
                $("#ruc_cliente").val(ruc);
                $("#codigo_cliente").val(cod_cli);
                $("#nombre_cliente").val(cliente);
                $("#categoria").val(cat);
                $("#total_gs").val(total_gs);
                $('#control_pupup').slideDown("fast");
                $("#back_arrow").slideUp();
                for (var i in data) {
                    var codigo = data[i].codigo;
                    var lote = data[i].lote;
                    var descrip = data[i].descrip;
                    
                    var um_prod = data[i].um_prod;
                    var um_venta = data[i].um; // Unidad de Medida de Venta
                   
                    var cod_falla = data[i].cod_falla;
                    var cod_falla_e = data[i].cod_falla_e;
                    var cant_falla = data[i].falla_real;
                    var cantidad = data[i].cantidad;
                    var precio_venta = data[i].precio_venta;
                    var gramaje = data[i].gramaje;
                    var ancho = data[i].ancho;
                    var tara = data[i].tara;
                    var kg_calc = data[i].kg_calc;
                    var sis_med = data[i].sis_med;
                    var cant_med = data[i].cant_med;
                    var kg_med = data[i].kg_med;
                    var img = data[i].img;
                    var stock_actual = data[i].stock_real;
                    var cant_calc = '';
                    if (kg_med == null) {
                        kg_med = "";
                    }

                    var pre_control = false;

                    if (sis_med == null) {
                        if (um_venta == "Unid") {
                            sis_med = "Unid";
                        } else {
                            sis_med = "Kg";
                        }
                    } else {
                        pre_control = true;
                    }

                    
                    var show_balanza = "inline";
                    
                    if(um_venta == "Mts" && um_prod == "Mts" ){
                        if(cantidad >= 5){
                            cant_calc = parseFloat(cantidad) + parseFloat(cant_falla);
                            show_balanza = "none";
                            sis_med = "Mts";
                        }else{
                            if (sis_med == "Kg") {
                                kg_med = kg_calc;                                
                            }else{
                                kg_med = cant_med;    
                            }                            
                        }                            
                    }else if(um_venta == "Kg" && um_prod == "Mts" ){
                         kg_med = kg_calc;
                         cant_calc = cantidad;   
                    }else if (um_venta == "Unid") {
                        cant_calc = cantidad;
                        kg_med = cantidad;
                        sis_med = "Unid";
                        show_balanza = "none";
                    }
                    
                    if (kg_calc == null || kg_calc == 0) {
                        kg_calc = "0.000";
                    } 
                    
                    if (gramaje == null) {
                        gramaje = "";
                    }
                     
                    if (!pre_control && !(um_venta == "Mts" && cantidad >= 5)) { // Ya guardo antes
                        kg_med = "";
                    }
                    //alert("sis_med "+sis_med+"  "+pre_control);  
                    if (ancho == null) { ancho = ""; }
                    if (cant_falla == null) { cant_falla = "0.00"; }
                    if (cod_falla_e == null) { cod_falla_e = ""; }
                    cod_falla = cod_falla.replace("+","_");

                    $("#detalle_factura").append("<tr class='det_codigo fila_" + j + "' id=tr_" + lote + " data-fila='" + j + "' data-margen='5' data-stock_real='"+stock_actual+"' data-img='"+img+"' data-tara='"+tara+"' ><td class='item select'><span class='lote' data-precio='" + precio_venta + "'>" + lote + "</span></td><td class='item select'><span class='descrip' data-codigo='"+codigo+"'>" + descrip + "</span> </td><td class='num cantidad cant_" + j + "'>" + cantidad + "</td>  \n\
                <td class='itemc um_venta_" + j + "'>" + um_venta + "</td><td class='falla itemc " + cod_falla + " cm_falla_" + j + "' data-cod_falla='" + cod_falla_e + "'  >" + cant_falla + "</td>\n\
                <td class='num gram_" + j + " xinfo'>" + gramaje + "</td><td class='num ancho_" + j + " xinfo'>" + ancho + "</td><td class='num kg_calc_" + j + " xinfo'>" + kg_calc + "</td>\n\
                <td><input type='text' class='input_kg_med med_" + j + " num'  id=kg_med_" + lote + " onchange='calcularMedicion(" + j + ")' value='" + kg_med + "'><input type='button' onclick='balanza(" + j + ")' style='display:" + show_balanza + "' class='balanza_button' id='balanza_" + j + "'></td>\n\
                <td class='itemc'><input type='button' class='sis_" + j + " tipo_med' value='" + sis_med + "'></td><td class='fact_vend itemc'><div class='fact2vend'><div class='fact2vendFormContainer'></div><button id='f2vadd_"+lote+"' onclick='fact2vendedor($(this))'><div></button></td> \n\
                <td class='num cant_calc_" + j + "'>" + cant_calc + "</td> <td class='num info_" + j + "'>&nbsp;</td><td class='fr_" + j + " itemc'></td><td class='itemc corr_" + j + "'></td><td class='itemc guardado g_" + j + "'></td></tr>");
                    if (kg_calc == "0.000") {
                        $("#balanza_" + j).slideUp("fast");
                        if (um_venta != "Unid") {
                            $(".sis_" + j).val("Mts");
                        }
                    }
                    if (um_venta == "Unid") {
                        $("#balanza_" + j).slideUp("fast");
                    }
                    j++;

                }
                cant_detalles = j - 1;
                $(document).off('keydown');
                setHotKeysDetalle();
                inicializarCursoresDetalle("select");

                //getImagenLotes();
                selectDetRow(0);
                var tiempo = 0;
                $(".det_codigo").each(function() {
                    var fila = $(this).attr("data-fila");
                    setTimeout("calcularMedicion(" + fila + ")", tiempo);
                    tiempo += 200;
                });

                $("#msg").html("");
            } else {
                alert("Esta Factura esta siendo controlada por otro Empaquetador");
                $("#fact_" + factura).slideUp();
                setTimeout(function() { $("#fact_" + factura).remove() }, 1000);
            }
        },
        error: function(x, status, error) {
            $("#msg").addClass("error");
            $("#msg").html("Error en la comunicacion con el servidor:  " + status + "<br>  " + error);
        }
    });
}
/*
function getImagenLotes() {
    var array = new Array();
    $(".det_codigo").each(function() {
        var lote = $(this).attr("id").substring(3, 30);
        array.push(lote);
    });
    array = JSON.stringify(array);
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "getImagenLotes", lotes: array,suc:getSuc() },
        async: true,
        dataType: "json",
        beforeSend: function() {},
        success: function(data) {
            for (var i in data) {
                var lote = data[i].Lote;
                var img = data[i].Img;
                var stock_real = data[i].StockReal;
                $("#tr_" + lote).attr("data-img", img);
                $("#tr_" + lote).attr("data-stock_real", stock_real);
            }
            showImage(0);
        }
    });
}*/

function forzarControles() {
    ignorarControles = true;
    $(".tipo_med").each(function() {
        var row = $(this).parent().parent().attr("data-fila");
        //console.log(row);
        var sis_med = $(this).val();
        var cant_v = $(".cant_" + row).html();
        var falla = $(".cm_falla_" + row).html();

        if (sis_med !== "Unid") {
            if (sis_med === "Kg") {
                $(this).val("Mts");
                $("#balanza_" + row).slideUp("slow");
                $(".med_" + row).focus().select();
            }
        }
        var total_v = parseFloat(cant_v) + parseFloat(falla);
        $(".med_" + row).val(total_v);
        $(".med_" + row).trigger("change");
        calcularMedicion(row);
    });
    setTimeout("ignorarControles = false;", 4000);
}

function controlarTodo() {

    var c = 0;
    $(".guardado").each(function() {
        var v = $(this).html();
        if (v == "") {
            calcularMedicion(c);
        }
        c++;
    });
    var count = 0;
    var guardados = 0;
    $(".guardado").each(function() {
        var g = $(this).html();
        if (g == "Ok") {
            guardados++;
        }
        count++;
    });

    if (count == guardados) {
        $("#controlado").removeAttr("disabled");
    } else {
        $("#controlado").prop("disabled", true);
    }
}

function autorizarMalCorte() {
    var passw = $("#passw").val();
    var usuario = getNick();

    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "checkPasswordAndTrustee", "usuario": usuario, "passw": passw, id_permiso: "2.5", suc: getSuc() },
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg_pw").html("<img src='img/loading_fast.gif' width='20px' height='20px' >");
        },
        complete: function(objeto, exito) {
            if (exito == "success") {
                var result = $.trim(objeto.responseText);
                if (result == "Ok") {
                    $("#verificar").fadeOut();
                    infoMsg("Autorizado!", 8000);
                    var filax = parseInt($("#verificar").attr("data-fila"));
                    $(".fila_" + filax).attr("data-margen", "10");
                    infoMsg("Margen a subido de 5% a 10%", 8000);
                    $("#msg_pw").html("");
                    $("#passw").val("");
                } else {
                    $("#msg_pw").addClass("errorgrave");
                    $("#msg_pw").html(result);
                }
            }
        },
        error: function() {
            $("#msg_pw").addClass("errorgrave");
            $("#msg_pw").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });
    //setHotKeysFactura();
    setHotKeysDetalle();
}

function ajusteSupervisor() {
    var position_tr = $("#ajuste_supervisor").offset();
    var pie = $("#ajuste_supervisor").width() / 2;
    var width = $("#verificar").width() / 2;
    var boton = $("#ajuste_supervisor").position();
    var top = position_tr.top;

    $("#verificar").css("margin-left", boton.left + pie - width);
    $("#verificar").css("margin-top", top - 44);
    $("#verificar").fadeIn();
    $("#passw").focus();
    $(document).off("keydown");
}

function liberarControleEnProceso() {
    var u = getNick();
    //alert("Estamos programando para que esto funcione, favor tenga paciencia, sabemos quien es Ud.!  '"+ getNick()+ "' y donde se encuentra en este momento.");
    var c = confirm("Asegurese de que no este controlando las Facturas en Proceso en otra Computadora antes de continuar!\n\nLas Ventas que esta por Liberar son de: '" + getNick() + "' cancele la operacion si Ud. no es '" + getNick() + "' \n\nNo se debe controlar la misma factura en dos computadoras al mismo tiempo");
    if (c) {
        $.post("Ajax.class.php", { action: "liberarVentasEnProceso", usuario: getNick() }, function(data) {
            recargar();
        });
    }
}

function contarVentasEnproceso() {
    $.post("Ajax.class.php", { action: "getVentasEnProcesoEmpaque", usuario: getNick() }, function(data) {
        if (parseInt(data) > 0) {
            $("#liberar_ventas_pr").fadeIn();
        }
    });
}

function contarVentasEnprocesoTodos() {
    $.post("Ajax.class.php", { action: "getVentasEnProcesoEmpaqueTodos", "suc": getSuc() }, function(data) {
        var exData = Object.keys(data).length
        if (exData) {
            $("#listaOP").empty();
            $("#pendientes").html(exData);
            var ul = $("<ul/>");
            $.each(data, function(key, data) {
                $("<li/>", { "text": key + ': ' + data }).appendTo(ul);
            });
            ul.appendTo("#listaOP");
        }
    }, "json");
    if ($("#listaOP").length > 0) {
        clearTimeout(empaquePrControl);
        empaquePrControl = setTimeout("contarVentasEnprocesoTodos()", 30000);
    }
}
function mostrarOcultarPr(){
    if($("#listaOP").css("display")=='none'){
        $("#listaOP").show()
    }else{
        $("#listaOP").hide()
    }
}
function cambiarBalanza() {
    var ip = $("#balanza").val();
    setCookie("balanza", ip, 365);
}

function acomodarPopup() {
    //var popup_width = $("#popup_caja").width();         
    var wa = $("#work_area").width();
    var ventas = $("#ventas").width();

    if (ventas >= (wa - 22)) {
        $("#control_pupup").width(ventas);
    }
    var margin_left = (wa - ($("#control_pupup").width())) / 2;
    $("#control_pupup").css("margin-left", "" + margin_left + "px");

}

/**
 * float dado un id le saca el valor y devuelve un Numero valido
 * en caso de no ser un numero devuelve 0
 * @param {String} obj  can be class or id
 * @returns {Number}
 */

function float(obj) {
    var n = parseFloat($(obj).val());
    if (isNaN(n)) {
        return 0;
    } else {
        return n;
    }
}

/**
 * Solo para control con el Lector actualiza el campo control_laser * 
 */
function punteoLaser(){
    $(document).off('keydown');
    var wa = $("#work_area").width(); 
    var margin_left = (wa - ($("#control_laser").width())) / 2;
    $("#control_laser").css("margin-left", "" + margin_left + "px");    
    $("#check_msg").html(""); 
    $("#image_container").fadeOut();
    $("#control_laser").draggable();
    $("#control_laser").slideDown();
    $("#check_lote").keydown(function(e) {         
        var tecla = e.keyCode;        
         if (tecla == 13) {
             puntear();
         }
    });
    $("#check_lote").focus();
    var factura = $("#factura").val();
    $.post("empaque/VentasEnEmpaque.class.php", { "action": "getMaxPaquete", "factura": factura  }, function(data) {
        $("#paquete").val(data.max); 
    }, "json");
    getFacturasContables();
}
function puntear(){    
    
    var lote = $("#check_lote").val();
    if(lote.length > 0){
        if($("#tr_"+lote).length){
           $("#tr_"+lote).children().first().css("background","orange");
           $("#check_lote").select();
           $("#check_msg").css("color","yellow");
           guardarControlLaser(lote);
        }else{
             notFound(); 
            $("#check_msg").css("color","red");
            alert("ATENCION! Lote no encontrado en esta Factura!");
            $("#check_msg").html("ATENCION! Lote no encontrado en esta Factura!");
        }
    }    
}
function beep() {    
    $(".beep").trigger('play');      
}
function notFound() {    
    $(".not_found").trigger('play');      
}
function error() {    
    $(".error").trigger('play');      
}
function imprimirPaquete(){
    var factura = $("#factura").val();
    var paquete = parseInt($("#paquete").val());
    var usuario = getNick();
    var url = "barcodegen/PaqueteCliente.class.php?tipo=factura&factura="+factura+"&paquete="+paquete+"&usuario=" + usuario + "";
    var title = "Impresion de Paquetes de Remision";
    var params = "width=800,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=yes";
    if (impresion_codigo_barras) {
        impresion_codigo_barras.close();
    }
    impresion_codigo_barras = window.open(url, title, params);
       
    setPaquete("+");
}
function resumenPaquetes(){
   var factura = $("#factura").val();     
    var usuario = getNick();
    var url = "empaque/ResumenPaquetes.class.php?tipo=factura&factura="+factura+"&usuario=" + usuario + "";
    var title = "Impresion de Paquetes de Remision";
    var params = "width=800,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=yes";
    if (impresion_codigo_barras) {
        impresion_codigo_barras.close();
    }
    impresion_codigo_barras = window.open(url, title, params);    
}

function setPaquete(signo){
    var paq = parseInt($("#paquete").val());
    if(signo=="+"){
        paq++;
    }else{
        paq--;
    }
    if(paq < 1){
        paq = 1;
    }
    $("#paquete").val(paq);
}

function guardarControlLaser(lote){
    var factura = $("#factura").val();
    var paquete = $("#paquete").val();
     
    $.ajax({
        type: "POST",
        url: "empaque/VentasEnEmpaque.class.php",
        data: {"action": "guardarControlLaser", "factura": factura, "lote": lote,paquete:paquete},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#check_msg").html("Guardando...<img src='img/clock.gif' width='26px' height='26px' style='margin-bottom:-5px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);  
                if(result == "Ok"){
                    $("#check_msg").html("Ok...<img src='img/ok.png' width='18px' height='18px' >");
                    $("#check_lote").val("");
                    $("#check_lote").focus();
                    $("#check_lote").select();
                    $("#check_msg").css("color","black");
                    $("#check_msg").css("background","initial");
                    beep();
                }else{
                    error();
                    $("#check_msg").css("color","red");
                    $("#check_msg").html("Error no se pudo guardar el control!");
                    alert("Error no se pudo guardar el control! Intente de nuevamente");
                }
            }else{
                $("#check_msg").css("color","red");
                alert("Ocurrio un error en la comunicacion con el Servidor...");
                $("#check_msg").html("Error de conexion!");
            }
        },
        error: function () {
            $("#check_msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            alert("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}
function cerrarControl(){
    $(document).off('keydown');
    $("#control_laser").slideUp();
    setHotKeysDetalle();
}
function finalizarControlPunteo(){
    var factura = $("#factura").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "verificarPunteoLector", factura: factura},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#check_msg").html("Controlando...<img src='img/clock.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {             
            var faltantes = data[0].faltantes;                               
            if(faltantes != null){
                 $("#check_msg").html("Faltan puntear estos lotes: "+faltantes); 
            }else{
                var factura_legal = data[0].factura_legal;  
                if(factura_legal != null){
                    var usuario = getNick();
                    var title = "Solicitudes de Traslado";
                    var params = "width=1024,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
                    var url = "empaque/DetalleEntrega.class.php?factura="+factura+"&usuario="+usuario;
                    window.open(url,title,params);
                    $(".datos_remision").fadeIn();   
               }else{
                   
               }
                $("#check_msg").html(""); 
                
            }  
        }
    });
}
 

/**
 * Seccion facturar al vendedor
 */
function facturarAlVendedor (){
    if($($("#fact_"+$("input.factura").val()).find(".estado_factura")).text() === 'Cerrada'){
        // if(typeof(fact2vendedor) == "undefined"){
             var js = "empaque/facturarVendedor.js?_="+new Date().getTime();
             $.getScript(js)
             .fail(function( jqxhr, settings, exception ) {
               console.log( "Error al Cargar "+js );
           });
           f2v_verifDev();
       //  }
         var target = $($("#fact_"+$("input.factura").val()).find(".vendedor"));    
         var vendedor = target.text();
         var doc = target.data('doc');
         var tel = target.data('tel');
         var ticket = parseInt(target.data('ticket'));
         var notaCredito = parseInt(target.data('notaCredito'));
         var nombre  = target.data('nombre');
         if(ticket == 0){
             $.post("clientes/BuscarClientes.class.php",{"action":"buscar_clientes","hit":doc},
             function(data){
                 if( data.length > 0 ){
                     var valores = data[0];
                     generarFactura(valores.CardName,valores.LicTradNum,valores.CardCode,valores.U_tipo_doc);
                 }else{
                     $("#abm_cliente").show()
                     $("input#ruc").val(doc);
                     $("input#nombre").val((nombre).toUpperCase());
                     $("input#tel").val(tel);
                     checkRUC($("input#ruc"));
                     verifData();
                 }
             },'json');
         }else{
            if($(".fact_vend").is(":visible")){
                $(".fact_vend").hide();
            }else{
                $(".fact_vend").show();
            }
         }
    }else{
        errorMsg("   La factura debe estar Cerrada !   ",3000);
    }
}

function getDatosTransporte(){
    index_transp++; 
     
    var transportadora = $.trim( $("#transportadora").val() );
    
    if(selected_transportadora === transportadora ){
        $.ajax({
            type: "POST",
            url: "remisiones/CargarNotaRemision.class.php",
            data: {action: "getDatosTransporte", transp_ruc: selected_transp_ruc,index:index_transp, usuario: getNick() },
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#nro_chapa").val("");
                $("#transp_rua").val("");
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                if(data.length > 0){
                    var RUA = data[0].RUA;
                    var Chapa = data[0].Chapa;
                    var Marca = data[0].Marca;
                    $("#nro_chapa").val(Chapa);
                    $("#transp_rua").val(RUA);                    
                    $("#msg").html(Marca); 
                    $("#msg").css("background","yellow");
                    guardarTransportadora();
                }else{
                    index_transp = 0;
                    getDatosTransporte();
                    $("#msg").html(""); 
                    $("#msg").css("background","initial");
                }
                
            }
        });   
    }else{
        errorMsg("Seleccione una Transportadora",6000);
    }
}
function getDatosTransporte(){
    index_transp++; 
     
    var transportadora = $.trim( $("#transportadora").val() );
    
    if(selected_transportadora === transportadora ){
        $.ajax({
            type: "POST",
            url: "remisiones/CargarNotaRemision.class.php",
            data: {action: "getDatosTransporte", transp_ruc: selected_transp_ruc,index:index_transp, usuario: getNick() },
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#nro_chapa").val("");
                $("#transp_rua").val("");
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                if(data.length > 0){
                    var RUA = data[0].RUA;
                    var Chapa = data[0].Chapa;
                    var Marca = data[0].Marca;
                    $("#nro_chapa").val(Chapa);
                    $("#transp_rua").val(RUA);                    
                    $("#msg").html(Marca); 
                    $("#msg").css("background","yellow");
                    //guardarTransportadora();
                }else{
                    index_transp = 0;
                    getDatosTransporte();
                    $("#msg").html(""); 
                    $("#msg").css("background","initial");
                }
                
            }
        });   
    }else{
        errorMsg("Seleccione una Transportadora",6000);
    }
}

function getDatosChofer(){
    index_chofer++;
        $.ajax({
            type: "POST",
            url: "remisiones/CargarNotaRemision.class.php",
            data: {action: "getDatosChofer", transp_ruc: selected_transp_ruc,index:index_chofer, usuario: getNick() },
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#chofer").val("");
                $("#ci_chofer").val("");
                //$("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                if(data.length > 0){
                    var Chofer = data[0].Chofer;
                    var CI = data[0].CI; 
                    $("#chofer").val(Chofer);
                    $("#ci_chofer").val(CI); 
                    //guardarTransportadora();
                }else{
                    index_chofer = 0;  
                    getDatosChofer();
                }
                //$("#msg").html(""); 
            }
        });        
}


function seleccionarTransportadora(obj){
     
    selected_transportadora = $(obj).text();
    selected_transp_ruc = $(obj).attr("data-ruc");
    $("input#transportadora").val(selected_transportadora);
    $("input#transp_ruc").val(selected_transp_ruc);
    if(selected_transportadora == "MOVIL LOCAL"){
        $("input#nro_levante").val('000000');        
    }
    $("ul#transportadoras").hide();
    getDatosTransporte();
    getDatosChofer();    
}

function mostrarOcultarLista(){
    if(!$("ul#transportadoras").is(":visible")){
        $("ul#transportadoras").show();
    }
}

function getFacturasContables(){
   var suc = getSuc();    
   $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getFacturasContables", "suc": suc,tipo_fact:"Pre-Impresa",tipo_doc:"Nota de Remision",moneda:"G$"},
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#loading_facts").fadeIn();
            },
            success: function(data) {  
                $("#nota_rem_legal").empty();
                var cont = 0;
                for(var i in data){ 
                     var fact_cont = data[i].fact_nro; 
                     var pdv_cod = data[i].pdv_cod; 
                     $("#nota_rem_legal").append("<option value='"+fact_cont+"' data-pdv="+pdv_cod+">"+fact_cont+"</option>");  cont++;
                } 
                $("#loading_facts").fadeOut();
                if(cont == 0){
                    $("#imprimir_nota_rem").fadeOut();
                    //alert("Debe cargar Facturas Contables Pre Impresas en el sistema para poder Imprimir.");
                }else{
                    $("#imprimir_nota_rem").fadeIn();
                    $("#imprimir_nota_rem").removeAttr("disabled");
                }
            }
        });
  }
  
 function imprimirNotaRemLegal(){
    
     var c = confirm("Confirma que desea imprimir la Remision Contable?");
     if(c){
            var factura = $("#factura").val();
            var transp_ruc = $("#transp_ruc").val();
            var chofer = $("#chofer").val();
            var ci_chofer = $("#ci_chofer").val();
            var nro_levante = $("#nro_levante").val();
            var nro_chapa = $("#nro_chapa").val(); 
            var nota_rem_legal = $("#nota_rem_legal").val(); 
            var suc = getSuc();
            var usuario = getNick();
            var papar_size = 9; // Dedocratico A4


            var url = "remisiones/RemisionLegalFactura.class.php?factura="+factura+"&nota_rem_legal="+nota_rem_legal+"&transp_ruc="+transp_ruc+"&chofer="+chofer+"&ci_chofer="+ci_chofer+"&suc="+suc+"&usuario="+usuario+"&papar_size="+papar_size+"&nro_chapa="+nro_chapa+"&nro_levante="+nro_levante;
            var title ="Nota de Remision Legal";
            var params ="width=800,height=840,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
            if(!remision) {  
               remision =  window.open(url,title,params);                         
            }else{
               remision.close();
               window.open(url,title,params);                       
            }      
     }
  }
  
 