var decimales = 0;
var data_next_time_flag = true;
var intentos = 0;
var um_tmp = "";

function preConfigurar() {
    configurar();
}

function configurar() {
    $("#suc").change(function() {
        if ($(this).val() != "") {
            $("#generar_remito").fadeIn();
        } else {
            $("#generar_remito").fadeOut("fast");
        }
    });
    $("*[data-next]").keyup(function(e) {
        if (e.keyCode == 13) {
            if (data_next_time_flag) {
                data_next_time_flag = false;
                var next = $(this).attr("data-next");
                $("#" + next).focus();
                setTimeout("setDefaultDataNextFlag()", 600);
            }
        }
    });

    $("#blote").blur(function(e) {
        buscarEnRemision();
    });
    $("#blote").keyup(function(e) {
        if (e.keyCode == 13) {
            buscarEnRemision();
        }
    });
    $("#blote").focus(function() {
        $(this).select();
    });
    $("#guardar").keyup(function(e) {
        if (e.keyCode == 71) { // g or G 
            actualizarYGuardar();
        }
    });
    $("#ip").blur(function() {
        var ip = $("#ip").val();
        setCookie("ip_balanza", ip, 365);
    });
    if (getCookie("ip_balanza").sesion == undefined) {
        setCookie("ip_balanza", "localhost", 365);
    }
    $("#bkg_env").focus(function() {
        if ($(this).val() > 0) {
            leerDatosBalanza("bkg_env", true);
        }
    });
    $("#ip").val(getCookie("ip_balanza").sesion); // Poner balanza ultimamente utilizada
    if (touch) {
        $("#ip").focus(function() {
            showNumpad("ip", null, true);
        }); 
    }
    $("#bkg_env").keyup(function(e) {
        if (e.keyCode == 13) { // g or G 
            calcCantEnvControl();
        }
    });
    verifProcesados();
}

function verifProcesados() {
    $("td.kg_rec").each(
        function() {
            if (eval($(this).text().replace(/\./g, '').replace(/,/g, '.')) > 0) {
                $($(this).closest("tr")).addClass("procesado");
            }
        }
    );
    $("#msg_det").html($("tr.procesado").length + " procesados de " + $("tr.fila").length + " lotes");
}

function recibirLote() {
    var lote = $("#blote").val();
    var remito = $("#nro_remito").val();
    var codigo = $("#tr_" + lote).attr("data-codigo");
    var cantidad = $("#bcant").val();
    var um = $("#um").val();
    var kg_env = $("#bkg_env").val();
    var cant_calc = $("#bcant_calc").val();
    var cant_inicial = parseFloat($("#tr_" + lote).attr("data-cant_inicial"));

    var PORC_TOLERANCIAL = $("#porc_tolerancia_remsiones").val(); // 2% Sacar de la tabla Parametros 

    //var fuera_rango = false;
    if (um === 'Mts') {

        var rango_bajo = cantidad - (cant_inicial * PORC_TOLERANCIAL / 100);
        var rango_alto = parseFloat(cantidad) + parseFloat((cant_inicial * PORC_TOLERANCIAL / 100));
        if (cant_calc >= rango_bajo && cant_calc <= rango_alto) {
            fuera_rango = false;
        }
    }


    //if (!fuera_rango) {
    if (!fuera_rango || (fuera_rango && confirm("Los valores que se guardaran se encuentran fuera del rango de tolerancia\n Desea Continuar"))) {
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "recibirLoteNotaRemision", "usuario": getNick(), nro_remito: remito, codigo: codigo, lote: lote, kg_env: kg_env, cant_calc: cant_calc },
            async: true,
            dataType: "html",
            beforeSend: function() {
                $("#msg_blote").html("<img src='img/loading_fast.gif' width='24px' height='24px' >");
            },
            complete: function(objeto, exito) {
                if (exito == "success") {
                    var result = $.trim(objeto.responseText);
                    if (result == "Ok") {
                        $("#msg_blote").html(lote + " :   <img src='img/ok.png' width='22px' height='22px' >");
                        $("#tr_" + lote).find(".cant_calc").html(cant_calc);
                        $("#tr_" + lote).find(".kg_env").html(kg_env);
                        $("#tr_" + lote).addClass("encontrado");
                        if(!fuera_rango){
                            limpiarBuscador();
                            verifProcesados();
                        }else{
                            $("#tr_"+lote).find("td.codigo_lote").removeClass('OK');
                            $("#tr_"+lote).find("td.codigo_lote").addClass('FR');
                        }
                    } else {
                        $("#msg_blote").html("<img src='img/important.png' width='22px' height='22px' > Ocurrio un error en la comunicacion con el Servidor...");
                    }
                }
            },
            error: function() {
                $("#msg_blote").html("<img src='img/important.png' width='22px' height='22px' > Ocurrio un error en la comunicacion con el Servidor...");
            }
        });
    }
    //} else {
    if(fuera_rango){
        $("#msg_blote").html("<img src='img/important.png' width='22px' height='22px' >Fuera de Rango, Calculo: " + cant_calc + " no esta entre " + rango_bajo + " y " + rango_alto);
    }

}

function buscarEnRemision() {
    var lote = $("#blote").val();
    if ($("#tr_" + lote).length) {
        $("#tr_" + lote).addClass("encontrado");
        var kg = $("#bkg_env").val();
        var um = $("#tr_" + lote).find(".um").html().replace(/\./g, '').replace(/\,/g, '.');
        var tara = $("#tr_" + lote).find(".tara").html().replace(/\./g, '').replace(/\,/g, '.');
        var ancho = $("#tr_" + lote).find(".ancho").html().replace(/\./g, '').replace(/\,/g, '.');
        var gramaje = $("#tr_" + lote).find(".gramaje").html().replace(/\./g, '').replace(/\,/g, '.');
        var cant = $("#tr_" + lote).find(".cantidad").html().replace(/\./g, '').replace(/\,/g, '.');
        um_tmp = um;
        var tipo = $("#tr_" + lote).attr("data-tipo");
        var descrip = $("#tr_" + lote).find(".descrip").html();

        $("#bcant").val(cant);
        $("#btara").val(tara);
        $("#bancho").val(ancho);
        $("#bgramaje").val(gramaje);
        $("#bdescrip").val(descrip);
        $("#btipo").text(tipo);
        $("#bkg_env").focus();

        $("div#work_area").animate({
            scrollTop: $("#tr_" + lote).offset().top
        }, 500);
    } else {
        limpiarBuscador();
        $("#blote").focus();
        $("#blote").select();
    }

}

function limpiarBuscador() {
    $(".b").val("");
    $("#guardar").attr("disabled", true);
    $("#blote").focus();
}

function setDefaultDataNextFlag() {
    data_next_time_flag = true;
}

var fuera_rango = false;
function calcCantEnvControl() {
    var lote = $("#blote").val();
    var found = $("#tr_" + lote).length;
    var kg = $("#bkg_env").val();
    var rango_bajo = 0;
    var rango_alto = 0;
    var um = $("#tr_" + lote).find(".um").html();
    var tipo = $("#tr_" + lote).attr("data-tipo");
    //var cantidad_actual = $("#bcant").val();
    // Tolerancia debe ser PORC_TOLERANCIAL respecto de la Cantidad inicial  $("#cant_inicial").val();
    var cant_inicial = parseFloat($("#bcant").val());
    var PORC_TOLERANCIAL = $("#porc_tolerancia_remsiones").val(); // 2% Sacar de la tabla Parametros 
    var verifRef = 0;
    $("#msg_blote").html("");

    if (um === "Mts") {
        if (tipo === 'Pieza' || tipo === '') {
            var gramaje = $("#bgramaje").val();
            var ancho = $("#bancho").val();
            var tara = $("#btara").val() / 1000;
            var largo_calc = parseFloat(redondear(((kg - tara) * 1000) / (gramaje * ancho), 3));
            if (isNaN(largo_calc)) { largo_calc = 0; }
            $("#bcant_calc").val(largo_calc);
            //Chequear rango de tolerancia 
            rango_bajo = parseFloat(cant_inicial - (cant_inicial * PORC_TOLERANCIAL / 100));
            rango_alto = parseFloat(cant_inicial + (cant_inicial * PORC_TOLERANCIAL / 100));
            verifRef = largo_calc;

            if (eval(largo_calc >= rango_bajo && largo_calc <= rango_alto)) {
                fuera_rango = false;
            } else {
                fuera_rango = true;
            }
            //console.log("fuera_rango "+fuera_rango);
        } else {
            $("#bcant_calc").val('0.00');
            var kg_desc = parseFloat($("#tr_" + lote).attr("data-kgdesc"));
            rango_bajo = (kg_desc - (kg_desc * PORC_TOLERANCIAL / 100));
            rango_alto = (kg_desc + (kg_desc * PORC_TOLERANCIAL / 100));

            verifRef = kg;


            if (eval(kg >= rango_bajo && kg <= rango_alto)) {
                fuera_rango = false;
                $("#bcant_calc").val($("#bcant").val());
            } else {
                fuera_rango = true;
            }
        }
    } else {
        $("#bcant_calc").val($("#bcant").val());
    }
    console.log("fuera_rango " + fuera_rango);
    if (kg > 0 && found/* && !fuera_rango*/) {
        $("#guardar").removeAttr("disabled");
        $("#guardar").focus();
    } else {
        $("#guardar").attr("disabled", true);
    }
    if (fuera_rango) {
        //$("#tr_"+lote).removeClass("encontrado");
        $("#msg_blote").html("Fuera de Rango..." + verifRef + " no se encuentra entre " + rango_bajo + " y " + rango_alto);
    }
}

function controlar() {
    $("#control").draggable();
    $("#control").slideDown();
    $("#blote").focus();
    $("#blote").select();
}

function ocultarControl() {
    $("#control").slideUp();
    $(".control").val("");
    $("#guardar").attr("disabled", true);
}

function leerDatosBalanza(id) {

    $("#" + id).val("- - - - -");

    intentos++;
    var ip_domain = $("#ip").val();
    //$("#msg").html("<img src='images/working.gif' width='24' height='24' > &nbsp;&nbsp;Conectado con: "+ip_domain+"...    ");  

    $.ajax({
        url: "http://" + ip_domain + "/serial/Indicador_LR22.php",
        dataType: "jsonp",
        jsonp: "mycallback",
        success: function(data) {
            var kg = data.peso;
            var estado = data.estado;
            if (estado == "estable") {
                if (kg == "") {
                    if (intentos < 5) {
                        leerDatosBalanza(id);
                    } else {
                        intentos = 0;
                    }
                } else {
                    $("#" + id).val(kg);
                    $("#" + id).css("color", "green");
                    calcCantEnvControl();
                }
            } else {
                $("#" + id).val(kg);
                $("#" + id).css("color", "red");
            }
        }

    });

}


function imprimir() {
    var nro_remito = $("#nro_remito").val();
    var url = "remisiones/NotaRemisionPrint.class.php?nro_remito=" + nro_remito + "&usuario=" + getNick() + "";
    var title = "Nota de Remision";
    var params = "width=800,height=840,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    window.open(url, title, params);
}

function cerrarRemito() {

    var nro_remito = $("#nro_remito").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "cerrarNotaRemision", "nro_remito": nro_remito, recepcionista: getNick() },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg_control").html("<img src='img/loading_fast.gif' width='18px' height='18px' >");
        },
        success: function(data) {
            var estado = data.estado;
            if (estado == 'Error') {
                var lotes = data.lotes;
                /*
               var incorrectos = lotes.split(",");
              
               for(var i = 0;i < incorrectos.length;i++){
                   $("#tr_"+incorrectos[i]).removeClass("encontrado"); 
               } */

                $("#msg_control").html("Lotes con Cantidades calculadas fuera de Rango! " + lotes);
            } else {
                $("#msg_control").html("");
                alert("La Remision ha sido cerrada con exito!");
                showMenu();
            }

        }
    });
}

function float(id) {
    var n = parseFloat($("#" + id).val().replace(/\./g, '').replace(/\,/g, '.'));
    if (isNaN(n)) {
        return 0;
    } else {
        return n;
    }
}

function onlyNumbersAndCaptureKg(e, id) {
    var tecla = new Number();
    if (window.event) {
        tecla = e.keyCode;
    } else if (e.which) {
        tecla = e.which;
    } else {
        return true;
    }
    //console.log(e.keyCode+"  "+ e.which);
    if ((tecla >= "97") && (tecla <= "122")) {
        return false;
    }
}

function onlyC(e, id, control) {
    var tecla = new Number();
    if (window.event) {
        tecla = e.keyCode;
    } else if (e.which) {
        tecla = e.which;
    }
    //console.log(e.keyCode+" tecla "+ tecla);

    if (tecla == "67" || tecla == "99") { // c or C
        leerDatosBalanza(id, control);
    }
    if (tecla == 0) { // Tab
        return true;
    }
    return false;

}

function saveObs() {
    var obs_proc = ($("#obs_rec").val()).split('~');
    var obs_env = $("#obs_env").text();
    var obs_rec = (obs_proc.length>1)?obs_proc[1].trim():obs_proc[0].trim();
    var obs = obs_env.trim() +'|'+getNick()+'~'+ obs_rec.trim();
    var nro_remito = $("#nro_remito").val();
    
    $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >");
    $.post("Ajax.class.php", { action: "guardarObservacionNotaRemision","nro_remito": nro_remito, "obs": obs }, function(data) {
        $("#msg").html(data);
    });
}

function procesarLote(lote){
    $("#blote").val(lote);
    buscarEnRemision();
    controlar();
}