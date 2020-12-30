/**
 * Cotizacion se declara en el template
 */
// caja_mov se actualiza cuando se cambia de moneda
var caja_mov = '';
var ajuste = 0;

// Start
function configurar() {
    $.ajaxSetup({
        beforeSend: function() {
            $('#cd_loader').show();
        },
        complete: function(html) {
            $('#cd_loader').hide();
        }
    });
    $("#cambioFecha").mask("99/99/9999");
    $("#cambioFecha").change(function() {
        dateCheck = validDate(this.value);
        if (!dateCheck.estado) {
            $(this).attr("data-err", "si");
        } else {
            $(this).attr("data-err", "no");
            getMonedasXFecha(getSuc(), dateCheck.fecha);
        }
    });
    $("#cambioFecha").datepicker({
        dateFormat: "dd/mm/yy",
        showAnim: "drop"
    });
    $("#cambioFecha").datepicker("option", $.datepicker.regional["es"]);
    $("#cambioFecha").click(function() {
        $(this).datepicker("show");
    });
    $("#cambioFecha").keyup(function() {
        $(this).datepicker("hide");
    });
    cotizXSuc();
}

// Lista de monedas con moviento por sucursal y fecha   (Referencia)
function getMonedasXFecha(suc, fecha) {
    $.post("caja/CambioDivisas.class.php", { "action": "getMovimientos", "args": suc + ',' + fecha }, function(data) {
        if (data.err) {
            resetAll();
            showMsj(data.err, "err", "info_com");
            clearValues("com");
        } else {
            clearMsj("info_com");
            $("#com").empty();
            var datos = data.data;
            $.each(datos, function(i, val) {
                $("<option/>", {
                    "html": "<img heigth='16' width='16' src='/inmopy/img/" + (datos[i].moneda).toLowerCase().replace("$", "s") + ".png'/>" + datos[i].moneda
                }).appendTo("#com");
            });
            if(data.cotiz){
                currentCotiz = data.cotiz;                
            }
            getMonedasXDia($("#com"));
        }
    }, "json");
}

// Obtiene los movimientos de la moneda por sucursal, fecha y moneda seleccionada
function getMonedasXDia(ref) {
    var target = ref.attr("id");
    var moneda = $("#" + target + " option:selected").val();
    
    if(moneda !== "G$"){
        $("#ch").val("G$");
        $("#ch").trigger("change");
    }else{
        //$("#ch").val([]);
    }    
    
    var dateCheck = validDate($("#cambioFecha").val());
    if (dateCheck.estado) {
        $.post("caja/CambioDivisas.class.php", { "action": "getMonedasXDia", "args": getSuc() + ',' + dateCheck.fecha + ',' + moneda }, function(data) {
            if (data.err) {
                showMsj(data.err, "err", "info_com");
                clearValues(target);

            } else {
                clearMsj("info_com");
                var datos = data.data;
                caja_mov = datos[0];
                getCotiz(ref);
            }
        }, "json");
    }

}

//Obtine las ultimas cotizaciones.
function cotizXSuc() {
    clearMsj("info_ch");
    if (currentCotiz.length === 0) {
        showMsj("No se encotraron cotizaciones para esta sucurzal!", "err", "info_ch");
    } else {
        for (var i in currentCotiz) {
            $("<option/>", {
                "value": i,
                "html": "<img heigth='16' width='16' src='/inmopy/img/" + (i).toLowerCase().replace("$", "s") + ".png'/>" + currentCotiz[i].m_cod
            }).appendTo("#ch");
        }
        $("#ch").val("R$").trigger("change");
        getCotiz();
    }
}

// Obtine cotizaciones mas recientes registradas para la sucursal actual
function getCotiz(ref) {
    /**
     * Si es compra debería poder elegis cualquier moneda menos G$
     * Si es venta solo debería poder elegir las monedas con las que cuenta en caja
     */
    caller = ref || false;
    if (caller) {
        var targert = (ref.attr("id") == 'com') ? "#ch" : "#com";
        if (ref.val() == $(targert).val()) $(targert).val("G$");
    }
    var ref_ent = $("#ch").val();
    var ref_salida = $("#com").val();
    var current = currentCotiz[ref_ent];
    var cotiz = (ref_salida === "G$") ? current.venta : current.compra;
    if(ref_ent === "G$"){
        $("#info_ch").html("---");
        cotiz = 1;
    }else{
        $("#info_ch").html("Cotizacion actualizada en fecha " + validDate(current.fecha).fecha + ", hora " + current.hora);
    }
    
     
    // Actualizado de banderas.- 
    $("#salida,#entrada").empty();
    $("#salida").append($("<img/>", { "src": $("#com option:selected img").attr("src") }));
    $("#entrada").append($("<img/>", { "src": $("#ch option:selected img").attr("src") }));
    calcCant();
}

// Calcula los moviemientos según cantidad moneda y cotizacion.
function calcCant() {
    var salida = 0;
    var entrada = 0;
    var entrada_lock = $("#entrada_lock").is(":checked");
    var salida_lock = $("#salida_lock").is(":checked");
    var monedaEntrada = $("#ch").val();
    var monedaSalida = $("#com").val();
    //var cotiz_entrada = 0;
    var cotiz_salida = 0;
    var cambio = 0;
    var diferencia = 0;
    ajuste = 0;
    var decimales = 6;
    var decimales_entrada = 6;
    $(".cotizaciones").empty();

    // Cotizacion
    if (monedaEntrada !== null && monedaSalida !== null) {
        var cotiz_entrada_venta = (monedaEntrada === 'G$') ? 1 : eval("currentCotiz." + monedaEntrada + ".venta");
        var cotiz_entrada_compra = (monedaEntrada === 'G$') ? 1 : eval("currentCotiz." + monedaEntrada + ".compra");
        var cotiz_salida_venta = (monedaSalida === 'G$') ? 1 : eval("currentCotiz." + monedaSalida + ".venta");
        var cotiz_salida_compra = (monedaSalida === 'G$') ? 1 : eval("currentCotiz." + monedaSalida + ".compra");
        salida = parseFloat($("#cant_salida").val());
        entrada = parseFloat($("#cant_entrada").val());
        $("<p/>", { "text": "Compra:" + cotiz_salida_compra }).appendTo("#info_salida");
        $("<p/>", { "text": "Venta:" + cotiz_salida_venta }).appendTo("#info_salida");
        $("<p/>", { "text": "Compra:" + cotiz_entrada_compra }).appendTo("#info_entrada");
        $("<p/>", { "text": "Venta:" + cotiz_entrada_venta }).appendTo("#info_entrada");

        if (monedaSalida === 'G$') {
            decimales = 2;
            cambio = (salida / cotiz_entrada_venta);
        } else {
            cambio = ((salida * cotiz_salida_compra) / cotiz_entrada_venta);
        }
        if(monedaEntrada === 'G$'){
            decimales_entrada = 2;
        }

        if (entrada_lock === false || salida_lock === false) {
            if (entrada_lock === false) {
                var cotiz = parseFloat(eval("currentCotiz." + monedaEntrada + ".venta"));
                entrada = cambio;                
                $("#cant_entrada").val(entrada.toFixed(decimales_entrada));
            } else if (salida_lock === false) {
                var cotiz = parseFloat(eval("currentCotiz." + monedaEntrada + ".venta"));
                salida = parseFloat($("#cant_entrada").val() * cotiz);
                $("#cant_salida").val(salida.toFixed(decimales));
            }
        }
        // Limpiar
        $(".operaciones").empty();

        $("<p/>", {
            "class": "caja",
            "text": "En Caja: " + (parseFloat(caja_mov.diff).format(decimales,3,'.',',')) + ' ' + monedaSalida
        }).appendTo("#en_caja");
        
        $("<p/>", {
            "class": "salida",
            "text": "Salida: " + $("#cant_salida").val() + ' ' + monedaSalida
        }).appendTo("#operaciones");
        $("<p/>", {
            "class": "entrada",
            "text": "Entrada: " + $("#cant_entrada").val() + ' ' + monedaEntrada
        }).appendTo("#operaciones");
        //Si no coincide el cambio        
       
        if (parseFloat(entrada).format(6,3,'.',',') != cambio.format(6,3,'.',',')) {
            var cotiz_ent = eval("currentCotiz." + monedaEntrada + ".venta");
            
            //diferencia = -eval((salida * cotiz_salida) + '-(' + entrada + '*' + cotiz_ent + ')');
            //diferencia = eval((salida * cotiz_salida) + '-(' + entrada + '*' + cotiz_ent + ')');
            diferencia =  entrada - cambio;  
            ajuste = diferencia;
            
            $("<p/>", {
                "class": "entrada_calc",
                "text": "Entrada Calculada: " + cambio.format(decimales_entrada,3,'.',',') + ' ' + monedaEntrada
            }).appendTo("#operaciones");
            
            var signo = '+';
            if(diferencia < 0){
                signo = '';// Ya tiene signo
            }

            $("<p/>", {
                "class": "entrada_calc",
                "text": "Diferencia: "+signo+"" + diferencia.format(decimales_entrada,3,'.',',') + 'G$'
            }).appendTo("#operaciones");
        }
        /*
        $("<p/>", {
            "class": "inf",
            "text": "Cotizacion Calculada: " + eval(salida + '/' + entrada).format(2,3,'.',',') + ' ' + monedaSalida
        }).appendTo("#operaciones");*/
    }

    verifProc();
}

function showMsj(msj, status, ref) {
    var r = ref || "msj";
    var st = status || '';
    $("#" + r).html(msj);
    $("#" + r).attr("class", st);
}

function clearMsj(ref) {
    var r = ref || "msj";
    $("#" + r).empty();
    $("#" + r).removeAttr("class");
}

function clearValues(targetRef) {
    var target = targetRef;
    $.each($("[id^=" + target + "]"), function() {
        var target = $(this);
        var tagName = target.prop("tagName");
        if (tagName === 'INPUT') {
            target.val('');
        } else {
            target.html('');
        }
    });
}

function changeStatus(ref) {
    var target = ref.attr("data-target");
    var regex = /^[0-9]{1,11}\.*[0-9]{0,6}$/g;

    $("#" + target).prop('checked', true);
    if (!regex.test(ref.val())) {
        ref.attr("data-status", "error");
        if (!$("#procesar input").is("input:disabled")) $("#procesar input").attr("disabled", "disabled");
    } else {
        ref.css({ "border": "1px dotted green" });
        ref.attr("data-status", "ok");
        $("#procesar input").removeAttr("disabled");
    }
    verifProc();
}

function resetAll() {
    clearValues("salida");
    $("[id^=cant]").val(0);
    clearValues("inf");
    clearValues("oper");
    $("#entrada_lock").prop('checked', false);
    $("#salida_lock").prop('checked', false);
    if (!$("#procesar input").is("input:disabled")) $("#procesar input").attr("disabled", "disabled");
}
// Verificar datos cambio
function verifProc() {
    var salida = parseFloat($("#cant_salida").val());
    var entrada = parseFloat($("#cant_entrada").val());
    var divisas = ($("#ch").val() === $("#com").val());


    // Habilita o inabilita boton procesar
    if (salida > parseFloat(caja_mov.diff) || caja_mov.diff == undefined || salida == 0 || $("[data-status=error]").length != 0 || divisas) {
        if (!$("#procesar input").is("input:disabled")) $("#procesar input").attr("disabled", "disabled");
    } else {
        $("#procesar input").removeAttr("disabled");
    }
}
// Procesar los cambios
function process() {
    var dateCheck = validDate($("#cambioFecha").val());
    var args = [getSuc(), dateCheck.fecha, $("#com").val(), $("#cant_salida").val(), $("#ch").val(), $("#cant_entrada").val(),ajuste, getNick()];
    $.post("caja/CambioDivisas.class.php", { "action": "process", "args": args.toString()  }, function(data) { /** console.log(data) */ }, "json");
    getMonedasXFecha(getSuc(), dateCheck.fecha);
    resetAll();
}