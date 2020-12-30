var f_nro;

function configurar() {
    $("#fecha_venc").mask("99/99/2099");
    $("#inicial").mask("9?999999", { placeholder: "" });
    $("#cantidad").mask("9?999", { placeholder: "" });
    $("#nro_factura").mask("9?999999", { placeholder: "" });
    $("#fecha_venc").mask("99/99/9999");
    $("#fecha_venc").focus();

    $("#tipo_doc").change(function() {
        var tipo = $(this).val();
        if (tipo == "Recibo") {
            $("#fecha_venc").val("00/00/0000");
            $("#fecha_venc").attr("disabled", true);
            $("#timbrado").val("");
            $("#timbrado").attr("disabled", true);
        } else {
            $("#fecha_venc").val("");
            $("#fecha_venc").attr("disabled", false);
            $("#timbrado").val("");
            $("#timbrado").attr("disabled", false);
        }
        $("#selected_doc_type").html(tipo);
        getPDVs();
    });
    $("#tipo").change(function() {
        getPDVs();
    });
    $("#pdvs").change(function() {
        getPDVs();
    });
    $("#moneda").change(function() {
        getPDVs();
    });
    $("#fecha_venc").change(function() {
        getPDVs();
    });

    $("*[data-next]").keyup(function(e) {
        if (e.keyCode == 13) {
            var next = $(this).attr("data-next");
            $("#" + next).focus();
        }
    });
    $("#tipo_doc").focus();
    getPDVs();
}

function obtenerNumeroInicial() {
    var tipo_doc = $("#tipo_doc").val();
    var estab = $("#estab").val();
    var tipo_fact = $("#tipo").val(); // Manual Pre-Impresa    
    var moneda = $("#moneda").val();
    var pe = $("#pdvs").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "siguienteNumeroDeDocumento", tipo_doc: tipo_doc, tipo_fact: tipo_fact, estab: estab, moneda: moneda, pe: pe },
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading.gif' width='22px' height='22px' >");
        },
        complete: function(objeto, exito) {
            if (exito == "success") {
                var result = $.trim(objeto.responseText);
                $("#inicial").val(result);
                $("#msg").html("");
            }
        },
        error: function() {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });
}

function getPDVs() {
    var tipo_doc = $("#tipo_doc").val();
    var moneda = $("#moneda").val();
    var tipo = $("#tipo").val();

    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "getPDVs", "tipo_doc": tipo_doc, "moneda": moneda, "tipo": tipo, "suc": getSuc() },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
        },
        success: function(data) {
            if (data.length > 0) {
                for (var i in data) {
                    var pdv_cod = data[i].pdv_cod;
                    $("#pdvs").val(pdv_cod);
                }
                obtenerNumeroInicial();
            } else {
                alert("No existe Punto de expedicion para este tipo de Documento.");
                $("#pdvs").val("");
            }
            $("#msg").html("");
        }
    });
}

function calcNroFinal() {
    var inicial = $("#inicial").val();
    var cantidad = $("#cantidad").val() - 1;
    var flag = 0;
    if (isNaN(inicial)) {
        $("#msg").html("Debe ingresar un Numero en el Campo N&deg; Inicial");
        $("#inicial").css("border", "solid red 1px");
        flag++;
        $("#msg").addClass("error");
    } else {
        $("#inicial").css("border", "initial");
        $("#msg").html("");
        $("#msg").removeClass("error");

        if (isNaN(cantidad)) {
            $("#msg").html("Debe ingresar un Numero en el Campo Cantidad");
            $("#cantidad").css("border", "solid red 1px");
            flag++;
            $("#msg").addClass("error");
        } else {
            $("#cantidad").css("border", "initical");
            $("#msg").html("");
            $("#msg").removeClass("error");
            var final = parseInt(inicial) + parseInt(cantidad);
            $("#final").val(final);
            $("#msg").removeClass("error");
            $("#msg").addClass("info");
            var tipo = $("#tipo_doc").val();
            var vdate = validDate($("#fecha_venc").val()).estado;
            if ((cantidad > 0) && (vdate || tipo == "Recibo")) {
                console.log(validDate($("#fecha_venc").val()).estado);
                $("#generar").removeAttr("disabled");
                $("#filtrar").attr("disabled", true);
            } else {
                $("#msg").html("");
                $("#generar").attr("disabled", true);
                $("#filtrar").removeAttr("disabled");
            }
        }
    }
}

function checkDateVenc() {
    var fecha = $("#fecha_venc").val();
    if (validDate(fecha).estado) {
        fecha = validDate(fecha).fecha;
        $("#msg_fecha").html("");
    } else {
        $("#msg_fecha").html("Error en la Fecha de Vencimiento");
        $("#generar").attr("disabled", true);
    }
    calcNroFinal();
}

function filtrar() {
    var nro = $("#nro_factura").val().toString();

    if (nro != "") {
        //$(".filtrar").slideUp("slow");
        //$(".area_carga").slideDown("slow"); 
        buscarFacturas(nro);
    } else {
        $(".fila_timbrado").fadeOut();
        $(".area_carga").fadeOut(5);
        $(".filtrar").fadeIn(5);
        $("#nro_factura").focus();
    }
}

function generarFacturas() {
    $("#generar").attr("disabled", true);
    var fecha_venc = validDate($("#fecha_venc").val()).fecha;
    var usuario = getNick();
    var suc = getSuc();
    var pdv = $("#pdvs").val();
    var inicial = $("#inicial").val();
    var cantidad = $("#cantidad").val() - 1;
    var tipo = $("#tipo").val();
    var timbrado = $("#timbrado").val();
    var estab = $("#estab").val();
    var tipo_doc = $("#tipo_doc").val();
    var moneda = $("#moneda").val();
    
    if(tipo_doc == "Recibo"){
         fecha_venc = "2030-12-31"; 
    }
    
    if (pdv.length > 0) {
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "generarFacturasContables", "usuario": usuario, "suc": suc, "pdv": pdv, "inicial": inicial, "cantidad": cantidad, "fecha_venc": fecha_venc, "tipo": tipo, "timbrado": timbrado, "estab": estab, "tipo_doc": tipo_doc, moneda: moneda },
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg").html("Intentando generar Facturas...   <img src='img/loading.gif' width='22px' height='22px' >");
            },
            success: function(data) {
                if (data.estado == 'Error') {
                    $("#msg").removeClass("info");
                    $("#msg").addClass("error");
                } else {
                    $("#msg").removeClass("error");
                    $("#msg").addClass("info");
                    $("#cerrar").removeAttr("disabled");
                }
                $("#msg").html(data.mensaje);
            },
            error: function(e) {
                $("#msg").html("Ocurrio un error al generar los documentos contables informe al administrador "+e);
            }
            
        });
    } else {
        errorMsg("Punto de Expedicion no puede estar vacio, cambie entre tipo Manual/Pre-Impresa");
    }
}

function buscarFacturas(fact_nro) {
    $("tr.ticketInfo").remove();
    $("input.f_nro, input.motivo_anul").attr("disabled", "disabled");
    $("#facturas").fadeOut("fast");

    var suc = getSuc();
    var pdv = $("#pdvs").val();
    var tipo = $("#tipo option:selected").val();
    var tipo_doc = $("#tipo_doc option:selected").val();
    var moneda = $("#moneda option:selected").val();
    //var fact_nro = $("#nro_factura").val().toString();  

    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "buscarFacturasContables", "fact_nro": fact_nro, "pdv": pdv, "suc": suc, "tipo": tipo, tipo_doc: tipo_doc, moneda: moneda },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading.gif' width='24px' height='24px' >");
        },
        success: function(data) {
            //limpiarLista(); // Borro los anteriores 
            var f_nro;
            var estado;
            if (data.length > 0) {
                for (var i in data) {
                    f_nro = data[i].ticket;
                    estado = data[i].estado;

                    var color = "#00CC00";
                    var color_letra = ''
                    if (estado == "Anulada") {
                        color = "#FFCC00";
                        color_letra = 'color:black';
                    } else if (estado == "Cerrada") {
                        color = "#FF6633";
                        color_letra = ''
                    } else { // Impresa
                        color = "#00CC00";
                        color_letra = ''
                    }

                    $.each(data[i], function(key, value) {
                        //console.log(key+','+value);                    
                        var current = $("." + key);
                        if (current.prop("tagName") === 'INPUT') {
                            current.val(value);
                        } else {
                            current.text(value);
                        }
                        if (key == 'estado') {
                            current.parent().css("background-color", color);
                        }
                    });
                }
                if (estado == 'Cerrada' && f_nro != null) {
                    verificarTicket(f_nro);
                }
                $("#msg").html("");
                inicializarCursores("celda_estado");
                $("#facturas").fadeIn("fast");
                
            }else{
                $("#msg").addClass("error");
                $("#msg").html("No se encontro la Factura "+tipo+" Nro: " + fact_nro);
            }
        },
        error: function(e) {
            $("#msg").addClass("error");
            $("#msg").html("Error en la comunicacion con el servidor:  " + e);
        }

    });
}

function rotarEstado() {
    var target = $("tr.tr_fact_legal");
    var tEstado = $("tr.tr_fact_legal").find(".estado");
    var estado = tEstado.text();
    $("input.f_nro, input.motivo_anul").attr("disabled", "disabled");
    $("input.aplicarCambios").removeAttr("disabled");

    if (estado == "Disponible") {
        tEstado.text("Anulada");
        tEstado.removeAttr("disabled");
        $("input.motivo_anul").removeAttr("disabled");
        tEstado.focus();
        tEstado.attr("placeholder", "Ingrese aqui el motivo de Anulacion");
        tEstado.parent().css("background", "#FFCC00");
    } else if (estado == "Anulada") {
        tEstado.html("Cerrada");
        tEstado.attr("disabled", true);
        tEstado.parent().css("background", "#FF6633");
        var tipo_doc = $("select#tipo_doc option:selected").val();
        if ( tipo_doc === 'Factura' || tipo_doc === 'Factura Conformada') {
            $("input.f_nro").removeAttr("disabled");
        }
    } else { // Impresa
        tEstado.html("Disponible");
        tEstado.attr("disabled", true);
        tEstado.parent().css("background", "#00CC00");
    }
}

function cambiarEstado() {
    var nro = $("tr.tr_fact_legal").find(".nro").text();
    var estado = $("tr.tr_fact_legal").find(".estado").text();
    var motivo = $("tr.tr_fact_legal").find(".motivo_anul").val();
    var tipo_doc = $("select#tipo_doc option:selected").val();
   
    if (estado == "Anulada") {
        if ($.trim(motivo) == "") {
            $("#msg").addClass("error");
            $("#msg").html("Debe especificar el motivo de la Anulacion de la Factura");
            $(("tr.tr_fact_legal").find(".motivo_anul")).focus().select();
        } else {
            procederderCambioEstado(nro, estado, motivo);
        }
    } else if (estado == "Cerrada" && (tipo_doc === 'Factura' || tipo_doc === 'Factura Conformada'  )) {
        var ticket = $("td.f_nro").text();
        if ($("td.fact_nro").text() === '') {
            if (($("tr.tr_fact_legal").find(".ticket").val()).trim().length == 0) {
                alert("No se puede cerrar una Factura sin asignar un Ticket al mismo")
                /* if (confirm("Se cambiara el estado de la factura sin asignar un ticket")) {
                    procederderCambioEstado(nro, estado, motivo);
                } */
            } else {
                asignarFacturaTicket(nro, estado, ticket);
            }

        } else {
            if (confirm("Se anulara la factura Nro. " + $("td.fact_nro").text() + "\nSe asignara la factura Nro. " + $("span.nro").text() + "\nAl ticket" + $("td.f_nro").text())) {
                asignarFacturaTicket(nro, estado, ticket);
            } else {
                $("input.f_nro").val($("input#nro_factura").val());
                $("tr.ticketInfo").remove();
                $("input.f_nro").attr("disabled", "disabled");
            }
        }
    } else {
        procederderCambioEstado(nro, estado, motivo);
    }
}

function procederderCambioEstado(nro, estado, motivo) {
    var suc = getSuc();
    var pdv = $("#pdvs").val();
    var tipo = $("tr.tr_fact_legal").find(".tipo").text();
    var tipo_doc = $("#tipo_doc option:selected").val();
    var moneda = $("#moneda option:selected").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "cambiarEstadoFacturaContable", "fact_nro": nro, "suc": suc, "pdv": pdv, "estado": estado, "motivo": motivo, tipo: tipo, tipo_doc: tipo_doc, moneda: moneda },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("Intentando generar Facturas...   <img src='img/loading.gif' width='22px' height='22px' >");
        },
        success: function(data) {
            if (data.estado == 'Error') {
                $("#msg").removeClass("info");
                $("#msg").addClass("error");
            } else {
                $("#msg").removeClass("error");
                $("#msg").addClass("info");
                $("#cerrar").removeAttr("disabled");
            }
            $("#msg").html(data.mensaje);
        }
    });
}

function verificarTicket(ticket) {
    $("tr.ticketInfo").remove();
    var suc = getSuc();
    var tr_top = $("<tr/>", { "class": "ticketInfo" });
    var td_top = $("<td/>", { "colspan": 10 });
    var table = $("<table/>");
    var table_header = "<tr><th>Ticket</th><th>RUC</th><th>Cliente</th><th>Estado</th><th>Fecha</th><th>Total</th><th>Suc</th><th>Fact</th><th>Tipo</th></tr>";
    var tr = $("<tr/>");
    var error_inf = $("<tr/>");
    var error = false;

    $.post("Ajax.class.php", { "action": "verificarTicket", "suc": suc, "ticket": ticket }, function(data) {
        if (data.error) {
            error = true;
            error_inf.append($("<td/>", { "class": "error", "colspan": 10, "text": data.error }));
            $("input.aplicarCambios").attr("disabled", "disabled");
        } else {
            $("input.aplicarCambios").removeAttr("disabled");
            $.each(data.data, function(key, value) {
                $("<td/>", { "class": key, "text": value }).appendTo(tr);
            });
            table.append(table_header);
            table.append(tr);
        }
        if (error) {
            table.append(error_inf);
        }

    }, "json");
    td_top.append(table);
    tr_top.append(td_top);
    $("#facturas_contables").append(tr_top);
}

function limpiarLista() {
    $(".tr_fact_legal").each(function() {
        $(this).remove();
    });
}

function asignarFacturaTicket(fact_nro, estado, ticket) {
    var pdv = $("#pdvs").val();
    var tipo = $("#tipo option:selected").val();
    var tipo_doc = $("#tipo_doc option:selected").val();
    var moneda = $("#moneda option:selected").val();

    $.post("Ajax.class.php", { "action": "asignarFacturaTicketFactura", "moneda": moneda, "pdv": pdv, "tipo": tipo, "tipo_doc": tipo_doc, "suc": getSuc(), "fact_nro": fact_nro, "estado": estado, "ticket": ticket }, function(data) {
        if (data.ok) {
            $("tr.ticketInfo").remove();
            $("input.f_nro").attr("disabled", "disabled");
            alert(data.ok);
        } else {
            alert(data.error);
        }
    }, "json");
}

function confirmar() {
    var text = "Se anulara la factura Nro. " + $("td.fact_nro").text() + "<br/>Se asignara la factura Nro. " + $("span.nro").text() + "<br/>Al ticket Nro. " + $("td.f_nro").text();
    var div = $("<div/>", { "id": "mensaje_frame", "title": "Proceder" });
    var p = $("<p/>");
    $("<span/>", { "class": "ui-icon ui-icon-alert", "style": "float:left; margin:12px 12px 20px 0;" }).appendTo(p);
    $("<span/>", { "id": "mensaje_contenido", html: text }).appendTo(p);
    p.appendTo(div);
    div.appendTo("div#work_area");

    $("div#mensaje_frame").dialog({
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
            "Proceder": function() {
                $(this).remove();
                return true;
            },
            "Cancelar": function() {
                $(this).remove();
                return false;
            }
        }
    });
}