var decimales = 0;
var data_next_time_flag = true;
var intentos = 0;
var um_tmp = "";
var estado = 0; // 0 Liberado 1 Acceso Denegado, 2 Bloqueado
var stock_comprometido = true;
var remision;
var impresion_codigo_barras = false;
var auto_close_window = true;

var index_transp = 0;
var index_chofer = 0;

var selected_transportadora = "";
var selected_transp_ruc = "";

var found_sound = new Audio('files/sounds/beep-07.wav');


function configurar() {
    preConfigurar();    
}

function preConfigurar() {
    $( "#tabs" ).tabs();      
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
    $("#ip").val(getCookie("ip_balanza").sesion); // Poner balanza ultimamente utilizada

/*
    $("#bkg_env").focus(function() {
        if ($(this).val() > 0) {
            leerDatosBalanza("bkg_env", true);
        }
    });*/
    if (touch) {
        $("#ip").focus(function() {
            showNumpad("ip", null, true);
        });
         
    }
    $("#bkg_env").keyup(function(e) {
        if (e.keyCode == 13) { // Enter 
            calcCantEnvControl();
        }
    });
    $("#message").draggable();
    $("#btipo").height(30);
    verifProcesados();
    $("div.transportadora ul").hide(0);
    getFacturasContables();
    if(is_mobile){
      $("#control").height("200px");
    }
    
    if( $("#remision_existente").val() == "true" ){
        $(".area_carga").fadeIn("fast");
    }
}
function getTotalPaquetes(){
    var nro_remito = $("#nro_remito").val();
    
    $.ajax({
        type: "POST",
        url: "remisiones/CargarNotaRemision.class.php",
        data: {"action": "getTotalPaquetes", "nro_remito": nro_remito,usuario:getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_pack").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#punteados").html("<img src='img/clock.gif' width='24px' height='24px' >"); 
        },
        success: function (data) {    
            var ultimo = data.Ultimo; 
            $("#paquete").val(ultimo); 
            getPunteadosXNroPaquete();
            
            $("#msg_pack").html(""); 
        }
    });  
}
function getPunteadosXNroPaquete(){
    var nro_remito = $("#nro_remito").val();
    var paquete = $("#paquete").val(); 
    $.ajax({
        type: "POST",
        url: "remisiones/CargarNotaRemision.class.php",
        data: {"action": "getPunteadosXNroPaquete", "nro_remito": nro_remito,paquete:paquete,usuario:getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_pack").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#punteados").html("<img src='img/clock.gif' width='24px' height='24px' >"); 
        },
        success: function (data) {   
            var punteados = data.Punteados; 
            $("#punteados").html(punteados);  
            var maximo = parseInt(data.Maximo);
            if(paquete > maximo +1){
                $("#paquete").val(maximo + 1)
                errorMsg("Se bloquearon los saltos para evitar huecos!",16000);
            }
            $("#msg_pack").html(""); 
        }
    });
}

function setDefaultColor(){
   $("#control").css("background","#fcefa1");  
}
function found() {    
    //$(".found").trigger('play');  
    found_sound.play();
    $("#control").css("background","lightgreen");
    setTimeout("setDefaultColor()",4000);
}
function notFound() {    
    $(".not_found").trigger('play');
    $("#control").css("background","orangered");
}
function pesar() {    
    $(".pesar").trigger('play');      
}
function verifProcesados() {
    $("td.kg_env").each(
        function() {
            if (eval($(this).text().replace(/\./g,'').replace(/,/g,'.')) > 0 && parseInt($(this).attr("data-punteado")) > 0) {
                $($(this).closest("tr")).addClass("procesado");
            }
        }
    );
    $("#msg_det").html($("tr.procesado").length + " procesados de " + $("tr.fila").length + " lotes");
}

function showKeyPad() {
    showNumpad("lote", buscarDatosDeCodigo, false);
}

function actualizarYGuardar() {
    var lote = $("#blote").val();
    var remito = $("#nro_remito").val();
    var codigo = $("#tr_" + lote).attr("data-codigo");
    var cantidad = $("#bcant").val();
    var kg_env = $("#bkg_env").val();
    var cant_calc = $("#bcant_calc").val();
    var cant_inicial = parseFloat($("#tr_" + lote).attr("data-cant_inicial"));
    var tipo = $("select#btipo option:selected").val();
    var paquete = $("#paquete").val();
    var PORC_TOLERANCIAL = $("#porc_tolerancia_remsiones").val(); // 2% Sacar de la tabla Parametros 
    
    
    if(kg_env <= 0){ // Me aseguro aqui de que el peso es > 0
        pesar();
        return;
    }

    var fuera_rango = false;
    if (um_tmp == 'Mts') {
        var rango_bajo = parseFloat(cantidad) - parseFloat((cant_inicial * PORC_TOLERANCIAL / 100));
        var rango_alto = parseFloat(cantidad) + parseFloat((cant_inicial * PORC_TOLERANCIAL / 100));
        if (cant_calc >= rango_bajo && cant_calc <= rango_alto) {
            fuera_rango = false;
        }
    }
    if (!fuera_rango) {
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "actualizarDatosDeRemision", "usuario": getNick(), "nro_remito": remito, "codigo": codigo, "lote": lote, "kg_env": kg_env, "cant_calc": cant_calc, "tipo": tipo,paquete:paquete },
            async: true,
            dataType: "html",
            beforeSend: function() {
                $("#msg_blote").css("color","orange");
                $("#msg_blote").html("Guardando lote: " +lote+" >>>   <img src='img/clock.gif' width='24px' height='24px' >");
                
                $("#msg_blote").css("font-size","20px");
                $(".bale").prop("disabled",true);
                $("img.bale").fadeOut();
            },
            complete: function(objeto, exito) {
                if (exito == "success") {
                    var result = $.trim(objeto.responseText);
                    if (result == "Ok") {
                        getPunteadosXNroPaquete();
                        $("#msg_blote").css("color","green");
                        $("#msg_blote").html(">>>   "+lote + " :   <img src='img/ok.png' width='22px' height='22px' >");
                        $("#tr_" + lote).find(".cant_calc").html(cant_calc);
                        $("#tr_" + lote).find(".kg_env").html(kg_env);
                        $("#tr_" + lote).addClass("encontrado");
                        
                        limpiarBuscador();
                        verifProcesados();
                        $(".bale").prop("disabled",false);
                        $("img.bale").fadeIn();
                        
                        found();
                    } else {
                        $("#msg_blote").css("color","red");
                        $("#msg_blote").html("<img src='img/important.png' width='22px' height='22px' > Ocurrio un error en la comunicacion con el Servidor...");
                        errorMsg(msg, 6000);
                    }
                }
            },
            error: function() {
                $("#msg_blote").css("color","red");
                $("#msg_blote").html("<img src='img/important.png' width='22px' height='22px' > Ocurrio un error en la comunicacion con el Servidor...");
                errorMsg(msg, 6000);
            }
        });
    } else {
        var msg = "Fuera de Rango, Calculo: " + cant_calc + " no esta entre " + (rango_bajo).toFixed(2) + " y " + (rango_alto).toFixed(2) + "";
        $("#msg_blote").html("<img src='img/important.png' width='22px' height='22px' >" + msg);
        errorMsg(msg, 6000);
    }

}


function buscarEnRemision() {
    var lote = $("#blote").val();
    if ($("#tr_" + lote).length) {
        $("#tr_" + lote).addClass("encontrado");

        var um = $("#tr_" + lote).find(".um").html().replace(/\./g, '').replace(/\,/g, '.');
        var tara = $("#tr_" + lote).find(".tara").html().replace(/\./g, '').replace(/\,/g, '.');
        var ancho = $("#tr_" + lote).find(".ancho").html().replace(/\./g, '').replace(/\,/g, '.');
        var gramaje = $("#tr_" + lote).find(".gramaje").html().replace(/\./g, '').replace(/\,/g, '.');
        var cant = $("#tr_" + lote).find(".cantidad").html().replace(/\./g, '').replace(/\,/g, '.');
        var kg_env = $("#tr_" + lote).find(".kg_env").html().replace(/\./g, '').replace(/\,/g, '.');
        um_tmp = um;
        var tipo = $("#tr_" + lote).attr("data-tipo");
        var descrip = $("#tr_" + lote).find(".descrip").html();

        $("#bcant").val(cant);
        $("#btara").val(tara);
        $("#bancho").val(ancho);
        $("#bgramaje").val(gramaje);
        $("#bdescrip").val(descrip);
        $("#btipo").val(tipo);    
        
        
        $("div#work_area").animate({
            scrollTop: $("#tr_" + lote).offset().top
        }, 500);
        esRolloPieza();
        //var terminacion = parseInt( $("#blote").val().substring($("#blote").val().length-2,100)) ; 
        if(kg_env > 0 &&  getSuc() === '00'  ){
            $(".btipo").fadeOut();
            $("#bkg_env").val(kg_env);  
            calcCantEnvControl();
            actualizarYGuardar();
        }else{
            $("#bkg_env").val("");
            $("#getKg").focus();
            if(getSuc() == '00'){
               pesar();
            }
            $(".btipo").fadeIn();
        }
        
        //$("#getKg").click();
    } else {
        limpiarBuscador();
        $("#blote").focus();
        $("#blote").select();
        if(lote != ""){
           notFound();
        }
    }
}

function esRolloPieza() {
    var tipo = $("#btipo").val();
    if (tipo == "Rollo" && getSuc() == "00") {
        $("#actualizarKGDesc").fadeIn();
    } else {
        $("#actualizarKGDesc").fadeOut();
    }
    //$("#control").width("auto");
}


function actualizarKGDesc() {
    var kg_env = $("#bkg_env").val();
    var lote = $("#blote").val();
    if (kg_env > 0 && kg_env != "") {
        $("#actualizarKGDesc").fadeOut();
        $("#tr_" + lote).attr("data-kgdesc", kg_env);

        var nro_remito = $("#nro_remito").val();
        var codigo = $("#tr_" + lote).attr("data-codigo");

        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "actualizarKgDescRemision", "usuario": getNick(), "suc": getSuc(), nro_remito: nro_remito, codigo: codigo, lote: lote, kg_env: kg_env, },
            async: true,
            dataType: "html",
            beforeSend: function() {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' > Actualizando kg de descarga");
            },
            complete: function(objeto, exito) {
                if (exito == "success") {
                    var result = $.trim(objeto.responseText);
                    $("#msg").html(result);
                    buscarEnRemision();
                }
            },
            error: function() {
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        });
    } else {
        errorMsg("Capture primero el Kg para Guardar", 8000);
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

function generarNotaRemision() {
    var destino = $("#suc").val();
    if (destino != "") {
        $("#generar_remito").fadeOut("fast");
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "generarRemito", usuario: getNick(), origen: getSuc(), destino: destino },
            async: true,
            dataType: "html",
            beforeSend: function() {
                $("#msg").html("Generando Remision... <img src='img/loading_fast.gif' width='18px' height='18px'>");
            },
            complete: function(objeto, exito) {
                if (exito == "success") {
                    var result = $.trim(objeto.responseText);
                    $("#nro_remito").val(result);
                    $("#suc").attr("disabled", true);
                    $("#msg").html("");
                    $(".area_carga").fadeIn("fast");
                }
            },
            error: function() {
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        });
    } else {
        $("#generar_remito").fadeOut("fast");
    }
}

function limpiarAreaCarga() {
    $(".dato").val("");
    $(".dato").removeClass("error");
    $("#add_code").attr("disabled", true);
}

function buscarDatosDeCodigo() {
    limpiarAreaCarga();
    var lote = $("#lote").val();
    var suc = getSuc();
    var categoria = $("#categoria").val();
    if (lote != "") {
        $("#info").fadeIn("fast");

        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "buscarDatosDeCodigo", "lote": lote, "categoria": 1, "suc": suc ,usuario:getNick() },
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg_codigo").html("<img src='img/loadingt.gif' >");
            },
            success: function(data) {
                var existe = data.existe;
                $("#msg_codigo").attr("class", "info");
                if (existe === "true") {
                    estado = data.estado_venta; // 0 Liberado 1 Acceso Denegado, 2 Bloqueado
                    $("#cantidad").removeAttr("disabled")
                    
                    $("#codigo").val(data.codigo);
                    $("#descrip").val(data.descrip);
                    $("#ubic").val(data.ubic);
                    $("#U_kg_desc").val(parseFloat(data.kg_desc).format(3, 3, '.', ','));
                    $("#stock").val(parseFloat(data.stock).format(2, 3, '.', ','));
                    $("#stock").attr("data-stock", parseFloat(data.stock).format(2, 3, '.', ','));
                   

                    var ancho = parseFloat(data.ancho).format(2, 3, '.', ',');
                    var gramaje = parseFloat(data.gramaje).format(2, 3, '.', ',');
                    var um = data.um_prod;
                    var tara = parseFloat(data.tara).format(2, 3, '.', ',');  ;
                    if (tara == null) {
                        tara = 0;
                    }

                    getStockComprometido(lote);

                    var cantidad_inicial = data.cant_ini;
                    $("#cant_inicial").val(cantidad_inicial);

                    $("#um").val(um);
                    $("#um").attr("data-um_prod", um);
                    $("#ancho").val(ancho);
                    $("#gramaje").val(gramaje);

                    $("#tara").val(tara);

                    $("#cantidad").focus();
                    $("#cantidad").select();
                    data_next_time_flag = false;
                    if (estado != 'Bloqueado' && estado != 'FP' ) {
                        $("#msg_codigo").html("<img src='img/ok.png'>");
                    } else {
                        $("#msg_codigo").addClass("error");
                        $("#msg_codigo").html("Codigo con estado: "+estado+" Consulte con compras...");
                        errorMsg("Codigo con estado: "+estado+" Consulte con compras...", 8000);
                    }
                    setTimeout("setDefaultDataNextFlag()", 500);

                } else {
                    $("#msg_codigo").addClass("error");
                    $("#msg_codigo").html("No se han encontrado datos para esta pieza!");
                    //limpiarAreaCarga();
                    $("#lote").focus();
                    $("#cantidad").attr("disabled", true);
                    
                }
            },
            error: function(e) {
                $("#msg_codigo").addClass("error");
                $("#msg_codigo").html("Error en la comunicacion con el servidor:  " + e);
            }
        });
    } else {
        $("#info").fadeOut("fast");
    }
}

function check() {
    var um = $("#um").val();
    var gramaje = parseFloat($("#gramaje").val());
    if (um == "Mts" && gramaje == 0) {
        $("#msg_codigo").addClass("error");
        $("#msg_codigo").html("Gramaje incorrecto, Favor corregir...");
        $("#gramaje").addClass("error");
        enable(false);
    } else {
        enable(true);
    }
    if (um == "Mts" && $("#tara").val() == 0) {
        $("#tara").addClass("error");
    }
    if (float("stock") <= 0) {
        enable(false);
        $("#msg_codigo").addClass("error");
        $("#msg_codigo").html("Stock insuficiente...");
    }
    if (estado > 0) {
        errorMsg("Codigo Bloqueado o en Transito! Consulte con compras para desbloquear...", 10000);
        enable(false);
    }
    if (stock_comprometido) {
        enable(false);
        errorMsg("Codigo con Stock comprometido, Liberar o Fraccionar antes de Remitir", 10000);
    }
}

function enable(e) {
    $("#add_code").attr("disabled", !e);
}

function agregarCodigoARemito() {
    $("#add_code").attr("disabled", true);
    var nro_remito = $("#nro_remito").val();
    var lote = $.trim($("#lote").val());
    var codigo = $("#codigo").val();
    var cantidad = float("stock");
    var um = $("#um").val();
    var ancho = float("ancho");
    var gramaje = float("gramaje");
    var descrip = $("#descrip").val();
    var tara = float("tara");
    var kg_env = $("#kg_env").val();
    var cant_calc = parseFloat($("#cant_calc").val());
    var fuera_rango = false;
    var cant_inicial = parseFloat($("#cant_inicial").val());
    var U_kg_desc = parseFloat($("#U_kg_desc").val());
    /*
    var PORC_TOLERANCIAL = $("#porc_tolerancia_remsiones").val(); // 2% Sacar de la tabla Parametros 
    
    // Tolerancia debe ser PORC_TOLERANCIAL respecto de la Cantidad inicial  $("#cant_inicial").val();
    
    
    var rango_bajo = cantidad - (cant_inicial * PORC_TOLERANCIAL / 100);
    var rango_alto = cantidad + (cant_inicial * PORC_TOLERANCIAL / 100);
    // Arreglar bien aqui rango alto y bajo son los metrajes que puede estar fuera de rango esa merc.
    // Ejemplo si Cant Inicial es 100  PORC_TOLERANCIAL = 2 metros
    // El metraje Calculado en base al Kg, tara y Ancho debe estar entre 98 y 102 sino error
    
     
    if(isNaN(cant_calc)){
        cant_calc = 0;
    }
    if(um != 'Mts'){
        cant_calc = cantidad;
    }else{ // Mts                  
        if((cant_calc >= rango_bajo) && (cant_calc <= rango_alto)){
            fuera_rango = false;
        }else{
            fuera_rango = true;
        }
    }
    */
    var msg = "";
    if (kg_env == "") {
        kg_env = 0;
    }
    if (cantidad > 0) {
        if (gramaje > 0) {
            if (ancho > 0) {
                fuera_rango = false;
            } else {
                msg = "Ancho Incorrecto!";
                fuera_rango = true;
            }
        } else {
            msg = "Gramaje Incorrecto!";
            fuera_rango = true;
        }
    } else {
        msg = "Stock insuficiente!";
        fuera_rango = true;
    }
    if (isNaN(cant_calc)) {
        cant_calc = 0;
    }

    //var um_prod = $("#um").attr("data-um_prod");
    if (!fuera_rango) {
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "agregarDetalleRemito", "nro_remito": nro_remito, "codigo": codigo, "lote": lote, "um": um, "descrip": descrip, "cantidad": cantidad, "gramaje": gramaje, "ancho": ancho, "U_kg_desc": U_kg_desc, kg_env: kg_env, tara: tara, cant_calc: cant_calc, cant_inicial: cant_inicial,usuario:getNick() },
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg_codigo").html("<img src='img/loadingt.gif'>");
            },
            success: function(data) {
                var mensaje = data.Mensaje;
                if (mensaje == "Ok") {
                    $("#msg_codigo").html("<img src='img/ok.png'>");
                    $("#lote").val("");
                    $("#lote").focus();
                    limpiarAreaCarga();

                    var id_det = data.id_det;
                    var cantf = cantidad.format(2, 3, '.', ',');
                    var kg_envf = parseFloat(kg_env).format(2, 3, '.', ',');
                    var cant_calcf = cant_calc.format(2, 3, '.', ',');
                    var gramajef = gramaje.format(2, 3, '.', ',');
                    var anchof = ancho.format(2, 3, '.', ',');

                    appendDetail(id_det, codigo, lote, descrip, cantf, um, tara, kg_envf, cant_calcf, gramajef, anchof, cant_inicial);

                } else {
                    $("#msg_codigo").attr("class", "error");
                    $("#msg_codigo").html(mensaje);
                    $("#lote").focus();
                    $("#lote").select();
                    $("#add_code").attr("disabled", true);
                }
            }
        });
    } else {
        //var msg = "Fuera de Rango, Calculo: "+cant_calc+" no esta entre "+(rango_bajo).toFixed(2)+" y "+(rango_alto).toFixed(2)+"";
        $("#msg").addClass("error");
        $("#msg").html("<img src='img/important.png' width='22px' height='22px' >" + msg);
        errorMsg(msg, 6000);
    }
}

function appendDetail(id_det, codigo, lote, descrip, cant, um, tara, kg_env, cant_calc, gramaje, ancho, cant_inicial) {
    $(".tr_total_remito").before('<tr id="tr_' + lote + '" class="fila" data-codigo="' + codigo + '" data-cant_inicial="' + cant_inicial + '" ><td class="item codigo_lote">' + lote + '</td><td class="item descrip">' + descrip + '</td><td class="num cantidad">' + cant + '</td><td  class="itemc um">' + um + '</td><td  class="itemc tara">' + tara + '</td><td class="num gramaje">' + gramaje + '</td><td class="num ancho">' + ancho + '</td><td class="num kg_env">' + kg_env + '</td><td class="num cant_calc">' + cant_calc + '</td><td class="itemc"><img class="del_det trash" title="Borrar Esta Pieza" style="cursor:pointer" src="img/trash_mini.png" onclick=delDetRemito("' + id_det + '");></td></tr>');
}

function delDetRemito(id_det) {
    $("#dialog-confirm").dialog({
        resizable: false,
        height: 140,
        modal: true,
        dialogClass: "ui-state-error",
        buttons: {
            "Cancelar": function() {
                $(this).dialog("close");
            },
            "Borrar esta Pieza": function() {
                $(this).dialog("close");
                var nro_remito = $("#nro_remito").val();

                $.ajax({
                    type: "POST",
                    url: "Ajax.class.php",
                    data: { "action": "borrarDetalleRemito", "id_det": id_det,usuario:getNick() },
                    async: true,
                    dataType: "json",
                    beforeSend: function() {
                        $("#msg").html("<img src='img/loadingt.gif' > <img src='img/delete.png' >");
                    },
                    success: function(data) {
                        var estado = data.estado;
                        if(estado == "Ok"){
                           $("tr." + id_det).remove();
                           $("#msg").html("");
                        }else{
                            var mensaje = data.mensaje;
                            $("#msg").html(mensaje);
                            alert(mensaje);
                        }
                    }
                });
            }
        },
        Cancel: function() {
            $(this).dialog("close");
        }
    });
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
    console.log(e.keyCode+" tecla "+ tecla);

    if (tecla == "67" || tecla == "99") { // c or C
        leerDatosBalanza(id, control);
    }
    if (tecla == 0) { // Tab
        return true;
    }
    return false;

}

function calcCantEnv() {
    var um = $("#um").val();
    if (um == "Mts") {
        var kg = $("#kg_env").val();
        var gramaje = float("gramaje");
        var ancho = float("ancho");
        var tara = float("tara") / 1000;
        var largo_calc = 0;

        if (tara == 0) { // Si la tara es 0 asumo que es un rollo y que a�n no tiene tara
            largo_calc = redondear((kg * 1000) / (gramaje * ancho), 3);
        } else {
            largo_calc = redondear(((kg - tara) * 1000) / (gramaje * ancho), 3);
        }

        if (isNaN(largo_calc)) { largo_calc = 0; }
        $("#cant_calc").val(largo_calc);
    } else {
        $("#cant_calc").val(float("stock"));
    }
    check();
}

function calcCantEnvControl() {
    var lote = $("#blote").val();
    var found = $("#tr_" + lote).length;
    var kg = $("#bkg_env").val();
    var fuera_rango = false;
    var rango_bajo = 0;
    var rango_alto = 0;
    var um = $("#tr_" + lote).find(".um").html();
    var cantidad_actual = $("#bcant").val();
    var tipo = $("#tr_" + lote).attr("data-tipo");
    var verifRef = 0;
    var PORC_TOLERANCIAL = parseFloat($("#porc_tolerancia_remsiones").val()); // 2% Sacar de la tabla Parametros 

    $("#msg_blote").html("");

    if (um === "Mts") {
        if (tipo === 'Pieza') {
            var gramaje = $("#bgramaje").val();
            var ancho = $("#bancho").val();
            var tara = $("#btara").val() / 1000;
            var largo_calc = parseFloat(redondear(((kg - tara) * 1000) / (gramaje * ancho), 3));
            if (isNaN(largo_calc)) { largo_calc = 0; }
            $("#bcant_calc").val(largo_calc);
            //Chequear rango de tolerancia 


            // Tolerancia debe ser PORC_TOLERANCIAL respecto de la Cantidad inicial  $("#cant_inicial").val();
            var cant_inicial = parseFloat($("#bcant").val());
            rango_bajo = parseFloat(cantidad_actual - (cant_inicial * PORC_TOLERANCIAL / 100));
            rango_alto = parseFloat(cantidad_actual) + parseFloat(cant_inicial * PORC_TOLERANCIAL / 100);
            verifRef = largo_calc;


            if (eval(largo_calc >= rango_bajo && largo_calc <= rango_alto)) {
                fuera_rango = false;
            } else {
                fuera_rango = true;
            }
        } else {
            $("#bcant_calc").val(cantidad_actual);
            var kg_desc = parseFloat($("#tr_" + lote).attr("data-kgdesc"));
            rango_bajo = (kg_desc - (kg_desc * PORC_TOLERANCIAL / 100));
            rango_alto = (kg_desc + (kg_desc * PORC_TOLERANCIAL / 100));

            verifRef = kg;

            if (eval(kg >= rango_bajo && kg <= rango_alto)) {
                fuera_rango = false;
            } else {
                fuera_rango = true;
            }
        }

    } else {
        $("#bcant_calc").val($("#bcant").val());
    }

    if (kg > 0 && found && !fuera_rango) {
        $("#guardar").removeAttr("disabled");
        $("#guardar").focus();
    } else {
        if (fuera_rango) {
            //$("#tr_"+lote).removeClass("encontrado");
            $("#msg_blote").html("Fuera de Rango..." + verifRef + " no se encuentra entre " + (rango_bajo).toFixed(2) + " y " + (rango_alto).toFixed(2));
        }
        $("#guardar").attr("disabled", true);
    }
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
    getPunteadosXNroPaquete();
}
function imprimirPaquete(){
    var nro_remito = $("#nro_remito").val();
    var paquete = parseInt($("#paquete").val());
    var usuario = getNick();
    var cod_cli = $("#cod_cli").val();
    var url = "barcodegen/PaqueteRemision.class.php?tipo=remision&nro_remito="+nro_remito+"&paquete="+paquete+"&usuario=" + usuario + "&auto_close_window="+auto_close_window;
    if(cod_cli != ""){       
        url = "barcodegen/PaqueteCliente.class.php?tipo=remision&nro_remito="+nro_remito+"&paquete="+paquete+"&usuario=" + usuario + "&auto_close_window="+auto_close_window;
    }
    
    var title = "Impresion de Paquetes de Remision";
    var params = "width=800,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=yes";
    if (impresion_codigo_barras) {
        impresion_codigo_barras.close();
    }
    impresion_codigo_barras = window.open(url, title, params);
       
    setPaquete("+");
}

function controlar() {
     
    $("#control").slideDown();
    $("#blote").focus();
    $("#blote").select();
    //$("#control").width("auto");
    
    getTotalPaquetes();
    $("#control").draggable(); 
    $("#control").on("drag",function(){
         //$("#control").width("auto");
    });
}

function ocultarControl() {
    $("#control").slideUp();
    $(".control").val("");
    $("#guardar").attr("disabled", true);
}

function leerDatosBalanza(id, control) {

    $("#" + id).val("- - - - -");

    intentos++;
    var ip_domain = $("#ip").val();
    //$("#msg").html("<img src='images/working.gif' width='24' height='24' > &nbsp;&nbsp;Conectado con: "+ip_domain+"...    ");  

    $.ajax({
        url: "http://" + ip_domain + "/serial/Indicador_LR22.php",
        dataType: "jsonp",
        jsonp: "mycallback",
        success: function(data) {
            var kg = parseFloat(data.peso);
            var estado = data.estado;
            if (estado == "estable") {
                if (kg == "" || kg > 85) {               
                    if (intentos < 5) {
                        leerDatosBalanza(id, control);
                    } else {
                        intentos = 0;
                    }
                } else {
                    if(kg < 100 ){
                        $("#" + id).val(kg);
                        $("#" + id).css("color", "green");
                        if (control) {
                            calcCantEnvControl();
                        } else {
                            calcCantEnv();
                        }
                   }else{
                       $("#" + id).val(kg);
                       $("#" + id).css("color", "red");
                       notFound();
                   }
                }
            } else {
                $("#" + id).val(kg);
                $("#" + id).css("color", "red");
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

function saveObs() {
    var obs_proc = ($("#obs").val()).split('~');    
    var obs = (obs_proc.length>1)?obs_proc[1].trim():obs_proc[0].trim();

    var nro_remito = $("#nro_remito").val();
    $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >");
    $.post("Ajax.class.php", { action: "guardarObservacionNotaRemision", nro_remito: nro_remito, obs: getNick()+'~' + obs }, function(data) {
        $("#msg").html(data);
    });
}

function imprimir() {
    var nro_remito = $("#nro_remito").val();
    var url = "remisiones/NotaRemisionPrint.class.php?nro_remito=" + nro_remito + "&usuario=" + getNick() + "&emp=" + $(".emp").text();
    var title = "Nota de Remision";
    var params = "width=800,height=840,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    window.open(url, title, params);
}

function finalizarRemito() {
    
    if( $("input#transportadora").val().trim().length == 0 || $("input#nro_levante").val().trim().length == 0 ){
        alert("Complete Transportadora y Nro de levante\nEj.: Movil Local 000000");
    }else{
        guardarTransportadora();
        var filas = $('.fila').length;
    
        var duplicado = "";
    
        $('.codigo_lote').each(function() {
            var id = $(this).parent().attr("id");
            var c = 0;
            $("tr[id^='" + id + "']").each(function() {
                c++;
                if (c > 1) {
                    duplicado = id.substring(3, 60);
                    alert("Codigo duplicado: " + duplicado + " saque de la remision y vuelva a intentarlo.");
                    return;
                }
            });
            c = 0;
        });
        if (duplicado != "") {
            alert("Codigo duplicado: " + duplicado + " saque de la remision y vuelva a intentarlo.");
            return;
        }
    
    
        if (filas > 0) {
            var nro_remito = $("#nro_remito").val();
            $.ajax({
                type: "POST",
                url: "Ajax.class.php",
                data: { "action": "finalizarNotaRemision", "nro_remito": nro_remito, suc: getSuc(),usuario:getNick() },
                async: true,
                dataType: "json",
                beforeSend: function() {
                    $("#msg_control").html("<img src='img/loading_fast.gif' width='18px' height='18px' >");
                },
                success: function(data) {
                    var estado = $.trim(data.estado);
                    if (estado == 'Error') {
                        var lotes = data.lotes;
                        $("#msg_control").html("Lotes con Cantidades calculadas fuera de Rango! " + lotes);
                    } else if (estado == 'Problema') {
                        var lotes = data.lotes;
                        $("#msg_control").html("Lotes con problemas: " + lotes);
                    } else {
                        $("#msg_control").html("");
                        alert("La Remision ha sido enviada con exito!");
                        showMenu();
                    }
    
                }
            });
        } else {
            alert("Debe insertar al menos un Articulo para poder Cerrar");
        }
    }
}

function verStockComprometido() {
    $("#stock_comprometido").toggle();
}

function getStockComprometido(lote) {
    console.log("lote " + lote);
    stock_comprometido = true; // Bloquear temporalmente hasta que vuelva la consulta
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "buscarStockComprometido", lote: lote, suc: getSuc(), "incluir_reservas": "Si" },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
            $("#stock_comprometido").html("");
            $("#stock_compr").html("");
        },
        success: function(data) {
            var comprometido = 0;
            var st_comp = "<table class='stock_comprometido' border='1'>";
            st_comp += "";

            if (data.length > 0) {
                var st_comp = "<table class='tabla_stock_comprometido' border='1'>";
                st_comp += "<tr><th colspan='6' style='background:lightskyblue;'>Stock Comprometido</th> <th style='text-align:center;background:white'> X </th>  </tr>";
                st_comp += "<tr class='titulo' style='font-size:10px'><th>Doc</th><th>Nro</th><th>Usuario</th><th>Fecha</th><th>Suc</th><th>Estado</th><th>Cantidad</th><tr>";


                for (var i in data) {
                    var tipodoc = data[i].TipoDocumento;
                    var nro = data[i].Nro;
                    var usuario_ = data[i].usuario;
                    var fecha = data[i].fecha;
                    var suc = data[i].suc;
                    var estado = data[i].estado;
                    var cantidad = data[i].cantidad;
                    comprometido += parseFloat(cantidad);
                    st_comp += "<tr style='background:white'><td>" + tipodoc + "</td><td>" + nro + "</td><td>" + usuario_ + "</td><td>" + fecha + "</td><td class='itemc'>" + suc + "</td><td>" + estado + "</td><td class='num'>" + cantidad + "</td></tr>";
                }

                //console.log(comprometido);
                var stock_limpio = float("stock") - comprometido;
                $("#stock").val(parseFloat(stock_limpio).format(2, 3, '.', ','));
                $("#stock_compr").html("<img src='img/warning_red_16.png' onclick='verStockComprometido()' title='Alguien mas tiene cargada esta pieza en una Factura!'>");
                $("#stock_comprometido").html(st_comp);
                $(".tabla_stock_comprometido").click(function() {
                    verStockComprometido();
                });
            } else {
                stock_comprometido = false;
            }
            $("#msg").html("");
            check();
        }
    });
}

function bucarRemisionesSimilares() {
    var origen = $("#_rem_origen").val();
    var destino = $("#_rem_destino").val();
    var rem = $("#nro_remito").val();
    var table = $("<table/>", { "class": "tabla_mover", "border": "1", "style": "border:1px solid gray;border-collapse: collapse;background: white;" });
    var header = $("<tr><th colspan='6'>Remisiones Abiertas</th><th><button id='cerrar_mover' onclick='cerrar_mover()'>Cerrar</button></th></tr><tr class='titulo'><th>N&deg;</th><th>Origen</th><th>Destino</th><th>Fecha</th><th>Usuario</th><th>Lotes</th></tr>").appendTo(table);

    $.post("Ajax.class.php", { "action": "getRemitosAbiertosJSON", "suc": origen, "suc_d": destino, "n_nro": rem }, function(data) {
        $("#message").empty();
        if (data.length > 0) {
            data.forEach(function(obj, i) {
                var tr = $("<tr/>");
                var n_nro = 0;
                $.each(obj, function(key, val) {
                    $("<td/>", { "class": key, "text": val }).appendTo(tr);
                    if (key === 'n_nro') {
                        n_nro = val;
                    }
                });
                $("<td/>").append($("<button/>", { "text": "Insertar aqui", "onclick": "insertarEn(" + n_nro + ")" })).appendTo(tr);
                table.append(tr);
            });
            var td_ = $("<td/>", { "colspan": 7, "align": "center" });
            $("<button/>", { "text": "Generar Remision e Insertar", "onclick": "generarRemision()" }).appendTo(td_);
            ($("<tr/>").append(td_)).appendTo(table);
            $("#message").append(table);
        } else {
            var _table = $("<table/>", { "class": "tabla_mover", "border": "1", "style": "border:1px solid gray;border-collapse: collapse;background: white;" });
            $("<tr><th colspan='6'>Mensaje</th><th align='rigth'><button id='cerrar_mover' onclick='cerrar_mover()'>Cerrar</button></th></tr>").appendTo(_table);
            var tr = $("<tr/>");
            $($("<td/>", { "colspan": 7, "align": "center", "text": "No se encontraron remisiones Abiertas de " + origen + " a " + destino }).appendTo(tr)).appendTo(_table);
            var td_ = $("<td/>", { "colspan": 7, "align": "center" });
            $("<button/>", { "text": "Generar Remision e Insertar", "onclick": "generarRemision()" }).appendTo(td_);
            $($("<tr/>").append(td_)).appendTo(_table);

            $("#message").append(_table);
        }
        $("#message").show();
    }, "json");

}

var generarRemision = function() {
    var origen = $("#_rem_origen").val();
    var destino = $("#_rem_destino").val();
    var rem = $("#nro_remito").val();
    $.post("Ajax.class.php", { "action": "insertarEnRemision", "usuario": getNick(), "suc": origen, "suc_d": destino, "n_nro": rem, "generar": "si" },
        function(data) {
            $("#message").empty();
            var table = $("<table/>", { "class": "tabla_mover", "border": "1", "style": "border:1px solid gray;border-collapse: collapse;background: white;" });
            var header = $("<tr><th colspan='6'>Mensaje</th><th align='rigth'><button id='cerrar_mover' onclick='cerrar_mover()'>Cerrar</button></th></tr>").appendTo(table);
            $.each(data, function(key, value) {
                if (key === 'lotes') {
                    value.forEach(function(lote, i) {
                        $("tr#tr_" + lote).remove();
                    });
                } else {
                    $($("<tr/>", { "class": key }).append($("<td/>", { "colspan": 7, "text": value }))).appendTo(table);
                }

            });
            $("#message").append(table);
        }, "json");

}

function insertarEn(n_nro) {
    var origen = $("#_rem_origen").val();
    var destino = $("#_rem_destino").val();
    var rem = $("#nro_remito").val();
    $.post("Ajax.class.php", { "action": "insertarEnRemision", "usuario": getNick(), "suc": origen, "suc_d": destino, "n_nro": rem, "rem_destino": n_nro },
        function(data) {
            $("#message").empty();
            var table = $("<table/>", { "class": "tabla_mover", "border": "1", "style": "border:1px solid gray;border-collapse: collapse;background: white;" });
            var header = $("<tr><th colspan='6'>Mensaje</th><th align='rigth'><button id='cerrar_mover' onclick='cerrar_mover()'>Cerrar</button></th></tr>").appendTo(table);
            $.each(data, function(key, value) {
                if (key === 'lotes') {
                    value.forEach(function(lote, i) {
                        $("tr#tr_" + lote).remove();
                    });
                } else {
                    $($("<tr/>", { "class": key }).append($("<td/>", { "colspan": 7, "text": value }))).appendTo(table);
                }

            });
            $("#message").append(table);
        }, "json");

}

function cerrar_mover() {
    $("#message").hide();
}

function changeControlTipe() {
    if (confirm("Se cambiara el metodo de control para esta pieza")) {
        $("#tr_" + $("input#blote").val()).attr("data-tipo", $("select#btipo option:selected").val());
        esRolloPieza();
    }
}
function buscarCliente(){
    var criterio = $("#cod_cli").val();
    if(criterio.length > 3){
        $.ajax({
            type: "POST",
            url: "remisiones/CargarNotaRemision.class.php",
            data: {"action": "buscarCliente", criterio: criterio},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {  
                $("#clientes").fadeIn();
                $(".fila_cliente").remove();
                for (var i in data) { 
                    var CardCode = data[i].CardCode;
                    var CardName = data[i].CardName;
                    $("#clientes").append("<li class='fila_cliente' data-cod='"+ CardCode +"' onclick=seleccionarCliente('"+ CardCode +"') >"+CardName+" </li");
                }   
                $("#msg").html(""); 
            }
        });
    }
}
function seleccionarCliente(CardCode){
     $("#cod_cli").val(CardCode);
     $("#clientes").fadeOut();
}
function buscarTransportadora(){  
    if( !$("ul#transportadoras").is(":visible") ) $("ul#transportadoras").show();
        
    $("ul#transportadoras li").hide();
        var buscar = new RegExp($("input#transportadora").val(), "i");
        console.log(buscar);
        $("ul#transportadoras li").each(function(){
           var text = $(this).text();
           var mat = text.match(buscar);
           console.log("text: "+text+"  mat "+mat);
            
        if( text.match(buscar)){
            $(this).show(300);
            $(".transportadora").fadeIn();
        }
    });
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
                    data = data[0];
                    var RUA = data.RUA;
                    var Chapa = data.Chapa; console.log("RUA:  "+RUA);
                    var Marca = data.Marca;
                    $("#nro_chapa").val(Chapa);
                    $("#transp_rua").val(RUA);                    
                    $("#msg").html(Marca); 
                    $("#msg").css("background","yellow");
                    guardarTransportadora();
                }else{
                    index_transp = 0;
                    $("#nro_chapa").val("");
                    $("#transp_rua").val("");                    
                    $("#msg").html(""); 
                    //getDatosTransporte();
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
                    data = data[0];
                    var Chofer = data.Chofer;
                    var CI = data.CI; 
                    $("#chofer").val(Chofer);
                    $("#ci_chofer").val(CI); 
                    guardarTransportadora();
                }else{
                    $("#chofer").val("");
                    $("#ci_chofer").val(""); 
                    index_chofer = 0;  
                    //getDatosChofer(); 
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

function guardarTransportadora(){
    var dataENV ={
        "action":"guardarTransportadora",
        "n_nro":$("input#nro_remito").val(),
        "transportadora":$("input#transportadora").val().replace(/ +(?= )/g,'').trim().toUpperCase(),
        "nro_levante":$("input#nro_levante").val().replace(/ +(?= )/g,'').trim().toUpperCase(),
        "cod_cli":$("#cod_cli").val(),
        "chofer":$("#chofer").val(),
        "ci_chofer":$("#ci_chofer").val(),
        "nro_chapa":$("#nro_chapa").val(),
        "transp_ruc":$("#transp_ruc").val(),
        "rua":$("#transp_rua").val()
    };
    $.post("remisiones/CargarNotaRemision.class.php",dataENV,function(data){
        if(data.msj){
            $("input#transportadora").val($("input#transportadora").val().replace(/ +(?= )/g,'').trim().toUpperCase());
            $("input#nro_levante").val($("input#nro_levante").val().replace(/ +(?= )/g,'').trim().toUpperCase());
        }else{
            alert("Error "+data.error);
        }

    },"json");    
}
function forzarCambioEstado(){
    $("#forzar_cambio_estado").prop("disabled",true);
    $("#forzar_cambio_estado").val("Cambiando estado...");
    var nro_remito = $("#nro_remito").val();
    var dataENV ={
        "action":"forzarCambioEstado",
        "nro_remito":nro_remito,
        "estado":"En Proceso" ,
        "usuario":getNick()
    };
    $.post("remisiones/RemisionesAbiertas.class.php",dataENV,function(data){ 
        if(data.estado == "Ok"){             
            alert("Ok. La Remision ha si puesta en Proceso");
            showMenu();
        }else{
            alert("Error "+data.error);
        } 
    },"json");
}

function getFacturasContables(){
   var suc = getSuc();    
   var milis = new Date().getMilliseconds();
   $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getFacturasContables","milis":milis, "suc": suc,tipo_fact:"Pre-Impresa",tipo_doc:"Nota de Remision",moneda:"G$"},
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
                    errorMsg("Debe cargar Remisiones Pre Impresas en el sistema para poder Imprimir.",10000);
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
        var nro_remito = $("#nro_remito").val();
        var transp_ruc = $("#transp_ruc").val();
        var chofer = $("#chofer").val();
        var nro_chapa = $("#nro_chapa").val(); 
        var nota_rem_legal = $("#nota_rem_legal").val(); 
        var suc = getSuc();
        var usuario = getNick();
        var papar_size = 9; // Dedocratico A4
        var cod_cli = $("#cod_cli").val(); 

        var url = "remisiones/RemisionLegal.class.php?nro_remito="+nro_remito+"&nota_rem_legal="+nota_rem_legal+"&transp_ruc="+transp_ruc+"&chofer="+chofer+"&suc="+suc+"&usuario="+usuario+"&papar_size="+papar_size+"&nro_chapa="+nro_chapa+"&cod_cli="+cod_cli;
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
  
 