var intentos = 0;
var actual_AbsEntry = 0;

var DocEntry = 0; // SAP DocEntry

var articulos = [];
var designs = [];
var mares = [];
var colores_fabrica = [];
var colores_comerciales = [];
var searching = false;

var impresion_codigo_barras = false;


function setAutocomplete() {

}
 

function preconfigurar() {
    inicializarCursores("clicable");
    $(".suc").each(function() {
        if ($(this).text() != getSuc()) {
            $(this).css("background", "orange");
        } else {

            $(this).css("background", "lightblue");
        }
    });
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
    statusInfo();

}

function setSearch(s) {
    searching = s;
}

function configure() {
    searching = false;
    $("#tabs").tabs().fadeIn("fast");
    DocEntry = $("#DocEntry").val();
    $(".filter").focus(function() {
        $(this).select();
    });
    $(".filter").keyup(function(e) {
        var tecla = e.keyCode;

        if (tecla == 13) {
            if ($(this).attr("id") == "search_q") {
                buscar();
            } else {
                filtrar();
            }
        }
    });

    $("#search_bar").draggable({
        stop: function(event, ui) {
            var totalWidth = 0;
            searching = false;
        }
    });

    // Prevent Ctrl F
    window.addEventListener("keydown", function(e) {
        if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {
            e.preventDefault();

            if (searching) {
                $("#search_bar").slideUp();
                setTimeout("setSearch(false)", 500);
            } else {
                $("#search_bar").slideDown();
                setTimeout("setSearch(true)", 500);
            }
            $("#search_q").focus();
            $("#search_q").select();
        }
    })

    $(window).scroll(function() {
        // $('#search_bar').animate({top:$(window).scrollTop()+"px" },{queue: false, duration: 350});            
    });
    // OVERWRITES old selecor
    jQuery.expr[':'].contains = function(a, i, m) {
        return jQuery(a).text().toUpperCase()
            .indexOf(m[3].toUpperCase()) >= 0;
    };
    //alert("Ready");
    $("#fuente").slider({
        value: 12,
        min: 7,
        max: 20,
        step: 1,
        slide: function(event, ui) {
            $("#font").text(ui.value);
            $("#productos *").css("font-size", ui.value);
            $("#cabecera  *").css("font-size", ui.value);
            $("#filtros  *").css("font-size", ui.value);
        }
    });
    $("#imagenes").slider({
        value: 14,
        min: 0,
        max: 30,
        step: 1,
        slide: function(event, ui) {
            var ratio = 1.2;
            $('.camara').css('width', ((ui.value + 4) * ratio) + '%');
            $('.camara').css('height', (ui.value + 4) + '%');
            $('.print, .printed').css("width", ui.value * ratio);
            $('.print, .printed').css("height", ui.value);
        }
    });
    $("#filtro_articulo").focus();
    $("#img_viewer").click(function() {
        $(this).slideUp();
        $(".tmp_obs").removeClass("tmp_obs");
    });

    configurePrinter();
    $("select > option:nth-child(even)").css("background", "#F0F0F5");
}

function filtrar() {
     alert("Temporalmente desabilita movida a Descarga.js ");      
     return; 
}

function buscarOld() {
    $("#msg").html("Buscando...");
    $(".first_found").removeClass("first_found");
    $(".second_found").removeClass("second_found");
    var count0 = 0;
    var count1 = 0;
    var words = $.trim($("#search_q").val());
    var first_word = $.trim((words.split(" ")[0]).toUpperCase());
    var element_found = "";
    //console.log
    $('td:contains("' + first_word + '")').each(function() {
        var AbsEntry = ($(this).parent().attr("id")).substring(3, 30);
        var firstcomplete = $(".input_" + AbsEntry).val().length;
        if (firstcomplete == 0) {
            $(this).addClass("first_found"); // Primera palabra ha sido encontrada

            if (count0 == 0) { element_found = $("#qty_ticket_" + AbsEntry); };
            count0++;
            $.each(words.split(" "), function(i, word) {
                var upper_word = $.trim(word.toUpperCase());

                if (i > 0) {
                    $(".buscar_" + AbsEntry + ":contains('" + upper_word + "')").each(function() {
                        var complete = $(".input_" + AbsEntry).val().length;
                        if (complete == 0) {
                            $(this).addClass("second_found");
                            if (count1 == 0) {
                                element_found = $("#qty_ticket_" + AbsEntry);
                            }
                            count1++;
                        }
                    });
                }
            });
        }
    });
    if (count0 > 0) {
        $("#msg").html(count0 + " - " + count1 + " coincidencias / ");
        var position_top = element_found.position().top;
        //var tabletop = $(".tabla").position().top;

        var k_pos = 100; // Arbitrarian Const 200 px
        $(".fixed-table-container-inner").animate({ scrollTop: position_top - k_pos }, 200, function() {
            element_found.focus().select();
        });


    } else {
        $("#msg").html("0 coincidencias");
    }
}
// Mod JACK
var index = 0;

function buscar() {
    $("#msg").html("Buscando...");
    $(".first_found").removeClass("first_found");
    $(".second_found").removeClass("second_found");
    var count0 = 0;
    var count1 = 0;
    index = 0;
    $("#index").text(index+1);
    var words = $.trim($("#search_q").val()).split(" ");
    var bagSearch = (words.length > 1) ? '.bag' : '';
    var first_word = $.trim((words[0]).toUpperCase());

    var element_found = "";

    $('tr.producto td' + bagSearch + ':contains("' + first_word + '")').each(function() {
        if (($.trim($(this).text()) === first_word && words.length > 1) || words.length === 1) {

            var AbsEntry =$($(this).parent()).attr("data-lote");
            var firstcomplete = $(".input_" + AbsEntry).val();
            var fPorCompletar = $("input#porCompletar").is(":checked");
            
            if ((eval(firstcomplete)===undefined && fPorCompletar) || !fPorCompletar) {
                $(this).addClass("first_found"); // Primera palabra ha sido encontrada

                if (count0 == 0) { element_found = $("#qty_ticket_" + AbsEntry); };
                count0++;
                $.each(words, function(i, word) {
                    var upper_word = $.trim(word.toUpperCase());

                    if (i > 0) {
                        $(".buscar_" + AbsEntry + ":contains('" + upper_word + "')").each(function() {
                            var complete = $(".input_" + AbsEntry).val().length;
                            if (complete == 0) {
                                $(this).addClass("second_found");
                                if (count1 == 0) {
                                    element_found = $("#qty_ticket_" + AbsEntry);
                                }
                                count1++;
                            }
                        });
                    }
                });
            }
        }
    });
    if (count0 > 0) {
        $("#msg").html(count0 + " - " + count1 + " coincidencias / ");
        /*var position_top = element_found.position().top;
        //var tabletop = $(".tabla").position().top;

        var k_pos = 100; // Arbitrarian Const 200 px
        $(".fixed-table-container-inner").animate({ scrollTop: position_top - k_pos }, 200, function() {
            element_found.focus().select();
        });
*/
        resSig();
    } else {
        $("#msg").html("0 coincidencias");
    }
}

function resAnt() {
    $($($(".first_found")).parent()).removeClass("current");
    var container = $(".fixed-table-container-inner");
    //var scrollTo = $($(".first_found").get(index));
    var target = ($(".second_found").length>0)?$(".second_found"):$(".first_found");
    var scrollTo = ($(".second_found").length>0)?$($(".second_found").get(index)) : $($(".first_found").get(index));
    $(scrollTo.parent()).addClass("current");
    $("#index").text(index+1);
    container.scrollTop(
        scrollTo.offset().top - container.offset().top + container.scrollTop()        
    );
    $($(scrollTo.parent()).find("[id^=qty_ticket_]")).focus().select();
    //index = (index === 0) ? $(".first_found").length - 1 : index - 1;
    index = (index === 0) ? target.length - 1 : index - 1;
}

function resSig() {
    $($($(".first_found")).parent()).removeClass("current");
    var container = $(".fixed-table-container-inner");
    //var scrollTo = $($(".first_found").get(index));
    var target = ($(".second_found").length>0)?$(".second_found"):$(".first_found");
    var scrollTo = ($(".second_found").length>0)?$($(".second_found").get(index)) : $($(".first_found").get(index));
    $(scrollTo.parent()).addClass("current");
    $("#index").text(index+1);
    container.scrollTop(
        scrollTo.offset().top - container.offset().top + container.scrollTop()
    );
    $($(scrollTo.parent()).find("[id^=qty_ticket_]")).focus().select();
    //index = (index === 0) ? $(".first_found").length - 1 : index - 1
    index = (index + 1 === target.length) ? 0 : index + 1;
}

function mostrarBotonFinalizar() {
    $("#cerrar").fadeIn("fast");
    setTimeout('$("#cerrar").fadeOut()', 6000);
}

function finalizar() {
    alert("Movido a Descarga.js");
}

function noRecibida() {
    var c = confirm("Confirme que no ha recibido las mercaderias que no estan con los datos completos");
    if (c) {
        $(".producto").each(function() {
            var AbsEntry = $(this).attr("id").substring(3, 16);
            var qty_ticket = parseFloat($("#qty_ticket_" + AbsEntry).val());
            var kg_desc = parseFloat($("#kg_desc_" + AbsEntry).val());
            if (qty_ticket == 0 && kg_desc == 0) {
                saveLine(AbsEntry, "No");
            }
        });
        $("#set_no_recibido").attr("disabled", true);
    } else {
        $("#set_no_recibido").fadeOut();
    }
}

function cerrarDescarga() {
    $("#cerrar_descarga").attr("disabled", true);
    var tipo_doc = $("#tipo_doc").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "cerrarEntradaMercaderiasMS", "usuario": getNick(), DocEntry: DocEntry, tipo_doc: tipo_doc },
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg_cab").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
        },
        complete: function(objeto, exito) {
            if (exito == "success") {
                var result = $.trim(objeto.responseText);
                $("#msg_cab").html(result);
                setTimeout("showMenu()", 4000);
            }
        },
        error: function() {
            $("#msg_cab").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });
}

function deducirGramaje(um, ancho, kg, cantidad) {
    var gramaje = 1;
    if (um === "Mts") {
        //console.log
        gramaje = redondear((kg * 1000) / (cantidad * ancho));
    } else if (um === "Yds") {
        gramaje = redondear((kg * 1000) / ((cantidad * 0.9144) * ancho));
    } else { //Unid
        gramaje = 1;
    }
    return gramaje;
}

function saveLine(AbsEntry, recibido) {
    var qty_ticket = $("#qty_ticket_" + AbsEntry).val();
    var kg_desc = $("#kg_desc_" + AbsEntry).val();
    var ancho = $("#tr_" + AbsEntry).attr("data-ancho");
    var gramaje = $("#tr_" + AbsEntry).attr("data-gramaje"); // Solo para KG    
    var obs = $("#obs_" + AbsEntry).attr("data-obs");
    var um_prod = $("#tr_" + AbsEntry).attr("data-um");
    var umc = $("#tr_" + AbsEntry + " :nth-child(8)").text()
    var estado = $("#estado").val();
    var codigo = $("#tr_" + AbsEntry).attr("data-codigo");
    var lote = $("#tr_" + AbsEntry + " :nth-child(9)").text();

    if (umc != "Kg") {
        gramaje = deducirGramaje(umc, ancho, kg_desc, qty_ticket);
        //console.log(gramaje);
    }

    if (estado === "En Transito") {

        if ((qty_ticket > 0 && kg_desc > 0) || (recibido == "No")) {

            if (kg_desc > 200) {
                $("#kg_desc_" + AbsEntry).parent().addClass("error_field");
                errorMsg("Ha Ingresado un Kilaje muy alto favor corregir...", 8000);
            } else {
                $("#kg_desc_" + AbsEntry).parent().removeClass("error_field");

                $("#print_" + AbsEntry).removeAttr("disabled");
                var printed = $("#print_" + AbsEntry).val();
                $("#print_" + AbsEntry).focus();

                var start = new Date().getTime();

                $.ajax({
                    type: "POST",
                    url: "Ajax.class.php",
                    data: { "action": "actualizarLote", usuario: getNick(), suc: getSuc(), AbsEntry: AbsEntry, qty_ticket: qty_ticket, kg_desc: kg_desc, ancho: ancho, gramaje: gramaje, obs: obs, printed: printed, um_prod: um_prod, umc: umc, codigo: codigo, lote: lote, recibido: recibido },
                    async: true,
                    dataType: "html",
                    beforeSend: function() {
                        $("#msg_" + AbsEntry).html("<img src='img/loading_fast.gif' width='18px' height='18px' >");
                    },
                    complete: function(objeto, exito) {
                        if (exito == "success") {
                            var result = $.trim(objeto.responseText);
                            if (result == "0") {
                                var time = (new Date().getTime()) - start;
                                $("#msg_" + AbsEntry).html("<img src='img/ok.png' width='18px' height='18px' >");
                                $("#msg_" + AbsEntry).attr("title", "Procesamento en " + String(time) + " milissegundos...");
                                $(".input_" + AbsEntry).removeClass("parcial_complete");
                                $(".input_" + AbsEntry).addClass("complete");

                            } else {
                                $("#msg_" + AbsEntry).html("<img src='img/warning_red_16.png' width='18px' height='18px' >");
                                $("#msg_" + AbsEntry).attr("title", result);
                                $(".input_" + AbsEntry).removeClass("complete");
                                alert("ATENCION! Ocurrio un Error al tratar de guardar los datos del lote: " + lote);
                            }
                        }
                    },
                    error: function() {
                        $("#msg_" + AbsEntry).html("<img src='img/warning_red_16.png' width='18px' height='18px' >");
                        $("#msg_" + AbsEntry).attr("title", "Error en la comunicacion con el Servidor...");
                        $(".input_" + AbsEntry).removeClass("complete");
                        alert("ATENCION! Ocurrio un Error al tratar de guardar los datos del lote: " + lote);
                    }
                });
            }
        }
    } else {
        alert("Compra en " + estado + " para Editar debe estar en 'En Transito'.");
    }
}

function setObs(AbsEntry) {
    var estado = $("#estado").val();
    if (estado !== "En Transito") {
        $("#observ").attr("disabled", true);
    } else {
        $("#observ").removeAttr("disabled");
    }
    actual_AbsEntry = AbsEntry;

    $(".tmp_obs").removeClass("tmp_obs");


    var p = $("#tr_" + AbsEntry);

    var h = $("#tr_" + AbsEntry).height();
    var tr = p.position();

    var obs = $("#obs_" + AbsEntry).attr("data-obs");
    $("#obs_" + AbsEntry).addClass("tmp_obs");
    $("#obs").slideDown("slow");
    $("#observ").val($.trim(obs));
    $('#obs').animate({ top: tr.top + h + 60 + "px" }, { queue: false, duration: 150 });
}

function saveObs() {
    var obs = $("#observ").val();
    $("#obs_" + actual_AbsEntry).attr("data-obs", obs);
    if (obs.length > 0) {
        $(".tmp_obs").html("...");
    } else {
        $(".tmp_obs").html("");
    }
    $("#obs").slideUp("fast");
    saveLine(actual_AbsEntry, "Si");
}

function closeObs() {
    $("#obs").slideUp("slow");
}

/**
 * @Deprecated
function imprimirCodigoBarras(AbsEntry, lote) {


    var printer = $("#printers").val();
    var silent_print = $("#silent_print").is(":checked");
    if (typeof(jsPrintSetup) == "object") {
        jsPrintSetup.setSilentPrint(silent_print);
    }

    $("#print_" + AbsEntry).removeClass("print");
    $("#print_" + AbsEntry).addClass("printed");

    var impresiones = $("#print_" + AbsEntry).val();
    if (impresiones > 0) {

        var c = confirm("Este codigo ya se imprimio " + impresiones + " veces, esta seguro de que desea Reimprimir?");
        //errorMsg("Atencion! Remimpresion de codigo!",8000);
        if (!c) {
            return false;
        }
    }
    if (impresiones == "") {
        impresiones = 0;
    }
    impresiones++;
    $("#print_" + AbsEntry).val(impresiones)
    saveLine(AbsEntry, "Si");

    var suc = getSuc();
    var usuario = getNick();

    var umc = $("#tr_" + AbsEntry).attr("data-umc");
    var quty_ticket = $("#qty_ticket_" + AbsEntry).val();
    if (umc == "Kg") {
        quty_ticket = $("#kg_desc_" + AbsEntry).val();
    } else if (umc == "Yds") {
        umc = "Mts";
        quty_ticket = redondear(parseFloat($("#qty_ticket_" + AbsEntry).val() * 0.9144));
    }

    var url = "barcodegen/BarcodePrinterDescarga.class.php?codes=" + lote + "&usuario=" + usuario + "&printer=" + printer + "&silent_print=" + silent_print + "&etiqueta=etiqueta_10x5&umc=" + umc + "&cant_c=" + quty_ticket;
    var title = "Impresion de Codigos de Barras";
    var params = "width=800,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=yes";
    if (impresion_codigo_barras) {
        impresion_codigo_barras.close();
    }
    impresion_codigo_barras = window.open(url, title, params);
} */

/**
 * @description Muestra numeros en formato ingles
 * @param {type} numero
 * @param {type} dec
 * @returns {Number}
 * 
 */
function formatoIngles(numero, dec) {
    if (dec == undefined) { dec = 2; }
    if (isNaN(numero) || numero == null) {
        return 0;
    } else {
        return parseFloat(numero).format(dec, 12, "", ".");
    }
}

function formatoInglesOCero(numero, dec) {
    if (dec == undefined) { dec = 2; }
    if (isNaN(numero) || numero == 0) {
        return "";
    } else {
        return parseFloat(numero).format(dec, 12, "", ".");
    }
}

function enableNavigationByArrows() {
    $('#productos').keydown(function(e) {
        var $table = $(this);
        var $active = $('input:focus,select:focus', $table);
        var $next = null;
        var focusableQuery = 'input:visible,select:visible';
        var position = parseInt($active.closest('td').index()) + 1;


        switch (e.keyCode) {
            case 37: // <Left>
                $next = $active.parent('td').prev().find(focusableQuery);
                break;
            case 38: // <Up>                    
                $next = $active.closest('tr').prev().find('td:nth-child(' + position + ')').find(focusableQuery);
                break;
            case 39: // <Enter>                 
                $next = $active.closest('td').next().find(focusableQuery);
                break;
            case 40: // <Down>
                $next = $active.closest('tr').next().find('td:nth-child(' + position + ')').find(focusableQuery);
                break;
            case 13: // <Enter>    
                focusableQuery = 'input';
                $next = $active.closest('td').next().find(focusableQuery);
                break;
        }

        if ($next && $next.length) {
            $next.focus();
        }
    });
}

function onlyNumbers(e) {
    //e.preventDefault();
    var tecla = new Number()

    if (window.event) {
        tecla = e.keyCode;
    } else if (e.which) {
        tecla = e.which;
    } else {
        return true;
    }

    if (tecla === "13") {
        return false;
    }

    if ((tecla >= "97") && (tecla <= "122")) {
        return false;
    }
}

function onlyNumbersAndCaptureKg(e, id) {
    //e.preventDefault();
    var tecla = new Number();
    //console.log("tecla "+tecla);
    if (window.event) {
        tecla = e.keyCode;
    } else if (e.which) {
        tecla = e.which;
    } else {
        return true;
    }
    //console.log("tecla 2: " + tecla);
    if (tecla == "13") {
        if (id.substring(0, 8) == "kg_desc_") {
            var print_id = id.substring(8, 20);
            //console.log("print_" + print_id);
            $("print_" + print_id).focus();
        }
    }
    //console.log(e.keyCode+"  "+ e.which);
    tecla = parseInt(tecla);
    if ((tecla >= 64) && (tecla <= 122)) {
        //console.log(e.keyCode + " Tecla " + tecla);
        if (tecla == 67 || tecla == 99) { // c or C 
            leerDatosBalanza(id);
            return false;
        }
        return false;
    }

}

function stringify(str) {
    if (str == null) {
        return "";
    } else {
        return str;
    }
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
                }

            } else {
                $("#" + id).val(kg);
                $("#" + id).css("color", "red");
                $("#" + id).select();
                errorMsg("Lectura de Balanza Inestable!", 8000);
            }
        }

    });

}
/*
function foto(lote,AbsEntry){
     var estado = $("#estado").val();
    
    if(estado === "En Transito"){
        var reply = true; 
        var AbsEntrys = "";
        if($("#reply").is(":checked")){
            var h = $("#lote_"+AbsEntry).attr("data-hash");
            $(".lote_"+h).each(function(){

                var abse= $(this).parent().attr("id").substring(3,40);  
                AbsEntrys = AbsEntrys+","+abse;
            });
            AbsEntrys = AbsEntrys.substring(1,AbsEntrys.length);
        }else{
            AbsEntrys = AbsEntry;
            reply = false;
        }       
        window.open("compras/Camara.class.php?lote="+lote+"&AbsEntry="+AbsEntry+"&AbsEntrys="+AbsEntrys+"&reply="+reply,"Captura de Imagen","width=1020,height=760,scrollbars=yes");
    }else{
       alert("Compra en "+estado+" para Editar debe estar en 'En Transito'.");
    }
 }*/
function contarCaracteres() {
    var cant = $("#observ").val().length;
    var rest = 200 - cant;
    $("#rest").text(rest + " restantes");
}

function scrollWindows(pixels) {
    $('html,body').animate({
        scrollTop: pixels
    }, 250);
}

function configurePrinter() {
    if (typeof(jsPrintSetup) == "object") {
        if (jsPrintSetup.getPrintersList() == null) {
            alert("Sr. Usuario haga clic en el boton 'Permitir' que se encuentra en la parte superior derecha, y recargue la pagina.");
            return;
        }
        var printer_list = (jsPrintSetup.getPrintersList()).split(",");
        $.each(printer_list, function(number) {
            $("#printers").append('<option>' + printer_list[number] + '</option>');
        });
        //jsPrintSetup.definePaperSize(100, 100, "Custom", "Etiqueta_Marijoa", "Etiqueta Marijoa", 60, 40, jsPrintSetup.kPaperSizeMillimeters);  
        //jsPrintSetup.setPaperSizeData(100);
        jsPrintSetup.definePaperSize(101, 101, "Custom", "Etiqueta_Marijoa 10x5", "Etiqueta Marijoa 10x5", 100, 50, jsPrintSetup.kPaperSizeMillimeters);
        jsPrintSetup.setOption('marginTop', 0);
        jsPrintSetup.setOption('marginBottom', 0);
        jsPrintSetup.setOption('marginLeft', 0);
        jsPrintSetup.setOption('marginRight', 0);
        jsPrintSetup.setPaperSizeData(101);


        $("#silent_print").click(function() {
            var print_silent = $(this).is(":checked");
            jsPrintSetup.setSilentPrint(print_silent);
        });

    } else {
        alert("Este navegador necesita de un Plug in 'js print setup' para mejor funcionamiento, se abrira una ventana para instalarlo presione permitir, posteriormente reinicie su navegador y vuelva a intentarlo, si el problema persiste contacte con el administrador del sistema :D");
        var jsps = "https://192.168.2.252/tools/pc_esscentials/navegadores/moz_addon/js_print_setup-0.9.5.1-fx.xpi";
        window.open(jsps, '_blank', 'width=500,height=160');
    }
}

function getDesigns() {
    /* var ItemCode = $("#filtro_articulo").val();    
     $.ajax({
         type: "POST",
         url: "Ajax.class.php",
         data: {"action": "completarAccion", xxx: xxx},
         async: true,
         dataType: "json",
         beforeSend: function () {
             $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
         },
         success: function (data) {   
             for (var i in data) { 
                 var nro_gasto = data[i].nro_gasto;
                 var cod_gasto = data[i].cod_gasto;                 
             }   
             $("#msg").html(""); 
         }
     });*/
}
/*
function verFoto(lote,AbsEntry){
    $("#img_viewer").html("<img src='files/prod_images/"+lote+".jpg' width='200' height='140'>");
    
    var p  = $(".img_"+AbsEntry);
    var h = $(".img_"+AbsEntry ).height(); 
    $("#img_viewer").slideDown("slow");   
    
    var p = $(".img_"+AbsEntry ); 
    var h = $(".img_"+AbsEntry ).height();
    var im = p.position();  
    $('#img_viewer').animate({top: im.top + h +60+"px",left:im.left - 200 +"px" },{queue: false, duration: 150}); 
    $(".tmp_obs").removeClass("tmp_obs");
    $(".img_"+AbsEntry).addClass("tmp_obs"); 
}
*/