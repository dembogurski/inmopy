var cant_clientes = 0;
var fila_cliente = 0;
var escribiendo = false;



function configurar() {
    //$("#ruc").mask("999999?ddddddd",{placeholder:""});   
    $("#nombre").mask("***?*********************************************************", { placeholder: "" });
    //$("#tel").mask("999dd999?99999999",{placeholder:""}); 
    $("#fecha_nac").mask("99/99/9999");
    $("#ruc").focus();

    $("#tipo_doc").change(function() {
        var tipo = $(this).val();
        $("#ruc").attr("placeholder", tipo);
        if (tipo != "C.I.") {
            $("#tipo_cliente").val("Extranjero");
        } else {
            $("#tipo_cliente").val("Local");
        }
    });
    setAnchorTitle();
}


// LLama los validadores
function checkRUC(Obj) {
    var ruc = $.trim(Obj.val());

    var msg_id = 'msg_' + Obj.attr("id");
    var tipo_doc = $("#tipo_doc").val();
    var respuesta = '';
    var errorStatus = true;
    $("#" + msg_id).html("");
    if (!validRUC(ruc) && tipo_doc == "C.I." && !isNaN(ruc)) {
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "calcularDV", "ci": parseInt(ruc) ,usuario:getNick()},
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
            },
            complete: function(objeto, exito) {
                respuesta = objeto.responseJSON;
                if (exito == "success" && $.trim(respuesta.CI).length > 0) {
                    Obj.val(respuesta.CI + "-" + respuesta.DV);
                    Obj.attr("data-error", "No");
                    errorStatus = false;
                    checkearRUC(Obj,ruc, tipo_doc, msg_id);
                } else {
                    Obj.attr("data-error", "Si");
                    $("#" + msg_id).html("Caracteres invalidos ...");
                }
            },
            error: function() {
                Obj.attr("data-error", "Si");
                $("#" + msg_id).html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        });
    } else {
        if ( tipo_doc == "C.I." && validRUC(ruc) ) {
            checkearRUC(Obj,ruc, tipo_doc, msg_id);
        }else if(tipo_doc !== "C.I."){
            Obj.attr("data-error", "No");
        }else{
            Obj.attr("data-error", "Si");
            $("#" + msg_id).html("Caracteres invalidos ...");
        }
    }
    verifData();
}

function checkearRUC(Obj,ruc, tipo_doc, msg_id) {
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "checkearRUC", "ruc": ruc, "tipo_doc": tipo_doc },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#" + msg_id).html("<img src='img/activity.gif' width='46px' height='8px' >");
        },
        success: function(data) {
            if (data.length > 0) {
                if (data[0].Status == "Error") {
                    var dv = data[0].dv;
                    $("#" + msg_id).html("El Digito Verificador del RUC debe ser:  " + dv);
                    Obj.attr("data-error", "Si");
                } else {
                    var nombre = data[0].Cliente;
                    var rc = data[0].RUC;
                    $("#" + msg_id).html("Ya existe un cliente con este RUC, " + nombre);
                    Obj.attr("data-error", "Si");
                }
            } else {
                $("#" + msg_id).html("");
                Obj.attr("data-error", "No");
            }
        }
    });
    verifData();
}

function checkDate(Obj) {
    var fecha_ = Obj.val();
    var msg_id = 'msg_' + Obj.attr("id");
    Obj.attr("data-error", "No");

    if (!(fecha_.indexOf("/") > 0) && fecha_.length > 4) {
        var dia = fecha_.substring(0, 2);
        var mes = fecha_.substring(2, 4);
        var anio = fecha_.substring(4, 8);
        $("#fecha_nac").val(dia + "/" + mes + "/" + anio);
    }

    fecha_ = Obj.val();
    var result = validDate(fecha_);
    fecha_nac = result.fecha;
    var anio = parseInt((validDate($("#fecha_nac").val()).fecha).substring(0, 4));
    var mayor = anio > 1900;
    var anio_actual = new Date().getFullYear();

    var menor = anio <= anio_actual;

    if (result.estado && mayor && menor) {
        $("#" + msg_id).html("");
        Obj.attr("data-error", "No");        
    } else if( (fecha_.replace(/[^0-9]/g,'')).length > 0 ){
        $("#" + msg_id).html("Formato de Fecha incorrecto intente  dd/mm/aaaa [1900 <-> " + anio_actual + "]");
        fecha_nac = '0000-00-00';
        Obj.attr("data-error", "Si");
        //console.log("fecha "+fecha_+', '+$.trim(fecha_).length);
    }
    verifData();
}

function checkNombre(Obj) {
    var nombre = Obj.val();
    var msg_id = 'msg_' + Obj.attr("id");
    $("#" + msg_id).html("");
    Obj.attr("data-error", "No");
    // console.log(nombre+validString(nombre, 3));
    if (!validString(nombre, 3) /*&& $.trim(nombre).length > 0*/) {
        $("#" + msg_id).html("Nombre contiene caracteres indebidos");
        Obj.attr("data-error", "Si");
        Obj.focus();
        Obj.select();
    } else if((nombre.replace(/[^a-zA-Z]/g,'')).length === 0) {
        $("#" + msg_id).html("Nombre no puede ser vacio");
        Obj.attr("data-error", "Si");
    }
    verifData();
}

function checkTel(Obj) {
    var tel = Obj.val();
    var msg_id = 'msg_' + Obj.attr("id");
    if (!validPhone(tel)) {
        $("#" + msg_id).html("Formato de Telefono incorrecto minimo 6 digitos");
        Obj.attr("data-error", "Si");
        Obj.focus();
        Obj.select();
    } else {
        Obj.attr("data-error", "No");
        $("#" + msg_id).html("");
    }
    verifData();
}


/**
 * Limpia la lista de Clientes
 * @returns {nada}
 */
function limpiarLista() {
    $(".tr_cli_data").each(function() {
        $(this).remove();
    });
    $(".cli_data_foot").remove();
}

/**
 * 
 * @param {type} obj
 * @returns json 
 */
function buscarCliente(obj) {
    buscando = true;
    cant_clientes = 0;
    fila_cliente = 0;
    if($(obj).val().length > 0 ){
    var q = $.trim($(obj).val());
    var campo = "CardName";

    if ($(obj).attr("id") == "ruc_cliente") {
        campo = "LicTradNum";
    }
    $("#msg").html("<img src='img/activity.gif' width='46px' height='8px' >");

    $(document).off("keydown");

    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "buscarClientes", "campo": campo, "criterio": q, "limite": 30 },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("<img src='img/activity.gif' width='46px' height='8px' >");
        },
        success: function(data) {
            if (data.length > 0) {
                if (data.length > 1) {
                    limpiarLista(); // Borro los anteriores
                    ocultar(); //ocultar
                    var cont = 0;
                    for (var i in data) {
                        cont++;
                        var codigo = data[i].Codigo;
                        var cliente = data[i].Cliente;
                        var ruc = data[i].RUC;
                        var cat = data[i].Cat;
                        var moneda = data[i].Moneda;
                        var TipoDoc = data[i].TipoDoc;
                        //var telefonos = data[i].Tel;
                        
                        $("#lista_clientes").append("<tr class='tr_cli_data fila_cliente_" + i + "' data-tipo_doc='" + TipoDoc + "'><td class='item'><span class='codigo' data-moneda='" + moneda + "'>" + codigo + "</span></td>   <td class='item'><span class='ruc'>" + ruc + "</span> </td><td  class='item'><span class='cliente'>" + cliente + "</span></td> <td class='itemc'><span class='cat'>" + cat + "</span></td></tr>");
                    }
                    cant_clientes = cont;
                    $("#lista_clientes").append("<tr class='cli_data_foot'><td   style='text-align:center' colspan='4'> <input type='button' value='Nuevo' onclick='nuevoCliente()' > <input type='button' value='Cerrar' onclick='cerrar()' > </td></tr>");
                    $("#msg").html("" + cont + " resultados");
                    $("#msg").toggleClass("info");
                    $("#ui_clientes").fadeIn("fast");

                    $(".tr_cli_data").click(function() {
                        seleccionarCliente(this);
                    });
                    $(".tr_cli_data").css("background", "white");
                    inicializarCursores("item"); // Indico para que muestre la flechita al pasar por encima
                    selectRow(fila_cliente);
                    setHotKeysListaCliente();
                    setTimeout("buscando = false;", 500);

                } else { // Un unico resultado
                    //$( clientes ).dialog( "close" );
                    $("#ui_clientes").fadeOut("fast");
                    var codigo = data[0].Codigo;
                    var cliente = data[0].Cliente;
                    var ruc = data[0].RUC;
                    var cat = data[0].Cat;
                    var moneda = data[0].Moneda;
                    var TipoDoc = data[0].TipoDoc;
                    $("#ruc_cliente").val(ruc);
                    $("#codigo_cliente").val(codigo);
                    $("#nombre_cliente").val(cliente);
                    $("#categoria").val(cat);
                    $("#moneda").val("G$");
                    $("#tipo_doc").val(TipoDoc);
                    moneda_cliente = moneda;

                    $("#msg").html("");
                    mostrar(); // mostrar
                    //$("#nombre_cliente").attr("readonly","true");
                }
            } else {
                limpiarLista();
                $("#msg").toggleClass("error");
                $("#codigo_cliente").val("");
                $("#msg").html("Sin resultados");
                $("#lista_clientes").append("<tr class='cli_data_foot'><td style='text-align:center' colspan='4'> <input type='button' value='Nuevo' onclick='nuevoCliente()' > <input type='button' value='Cerrar' onclick='cerrar()' > </td></tr>");
                $("#ui_clientes").fadeIn("fast");
                // Desabilitar boton generar factura
                ocultar();
            }

        },
        error: function(e) {
            $("#msg").addClass("error");
            $("#msg").html("Error en la comunicacion con el servidor:  " + e);
        }
    });
    }
}

function setHotKeysListaCliente() {
    //$(document).on("keydown").off();
    //$(document).off("keydown");
    $("#nombre_cliente, #ruc_cliente").keydown(function(e) {

        var tecla = e.keyCode;
        if (tecla == 38) {
            (fila_cliente == 0) ? fila_cliente = cant_clientes - 1: fila_cliente--;
            selectRow(fila_cliente);
        }
        if (tecla == 40) {
            (fila_cliente == cant_clientes - 1) ? fila_cliente = 0: fila_cliente++;
            selectRow(fila_cliente);
        }
        if (tecla != 38 && tecla != 40 && tecla != 13) {
            escribiendo = true;
        }
        if (tecla == 13) {
            if (!escribiendo) {
                seleccionarCliente(".fila_cliente_" + fila_cliente);
            } else {
                setTimeout("escribiendo = false;", 1000);
            }
        }
        if (tecla == 116) { // F5
            e.preventDefault();
        }
    });

}
var cli; 

function registrarCliente() {

    var usuario = getNick();
    var ruc = $.trim($("#ruc").val());
    var nombre = $.trim($("#nombre").val());
    var tel = $.trim($("#tel").val());
    var fecha_nac = $("#fecha_nac").val();
    var pais = $("#pais").val();
    var ciudad = $.trim($("#ciudad").val());
    var dir = $.trim($("#dir").val());
    var ocupacion = $.trim($("#ocupacion").val());
    var situacion = $.trim($("#situacion").val());
    var tipo = $("#tipo_cliente").val().toLowerCase();
    var tipo_doc = $.trim($("#tipo_doc").val());


    if ((validRUC(ruc) && (tipo_doc == "C.I.") || (tipo_doc != "C.I.")) && validString(nombre, 3) && validPhone(tel, 6)) {
        $("#registrar").attr("disabled", true);
        $("#msg_cliente").removeClass("error");
        $("#msg_cliente").html("");
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "nuevoCliente", "usuario": usuario, "ruc": ruc, "nombre": nombre, "tel": tel, "fecha_nac": fecha_nac, "pais": pais, "ciudad": ciudad, "dir": dir, "ocupacion": ocupacion, "situacion": situacion, tipo: tipo, tipo_doc: tipo_doc, suc: getSuc() },
            async: true,
            dataType: "json",
            timeout: 25000,
            beforeSend: function() {
                $("#msg").html("<img src='img/loading.gif' width='22px' height='22px' >");
                $("#msg_cliente").html("<img src='img/loadingbar.gif' width='160px' height='60px' >");
            },
            success: function(data) {   cli = data;    console.log(cli);
                 
                if (data.status == "Ok" ) {
                    $("#msg").html("Cliente " + nombre + " registrado con exito.");
                    $("#abm_cliente").fadeOut();
                    $("#ruc_cliente").val(ruc);
                    $("#nombre_cliente").val(nombre);
                    buscarCliente($("#ruc_cliente"));
                    $("#boton_generar").focus();
                    //alert(data.status);
                } else {
                    $("#msg_cliente").html("Ocurrio un Error al intentar registrar el cliente " +data.msj);
                    $("#msg").html(data.msj);
                }
                
            },
            error: function(e) {
                // console.log(xhr);
                $("#msg_cliente").html("Error al registrar cliente:  " + e  );
                $("#registrar").removeAttr("disabled");
            }

        });
    } else {
        $("#msg_cliente").html("Los campos RUC, Nombre y Telefono son requeridos o contenen errores");
        $("#msg_cliente").addClass("error");
    }


    //console.log(usuario+"  "+ruc+"  "+nombre+"  "+tel+"  "+fecha_nac+"  "+pais+"  "+ciudad+"  "+dir);
}

function selectRow(row) {
    $(".cliente_selected").removeClass("cliente_selected");
    $(".fila_cliente_" + row).addClass("cliente_selected");
    $(".cursor").remove();
    $($(".fila_cliente_" + row + " td").get(2)).append("<img class='cursor' src='img/l_arrow.png' width='18px' height='10px'>");
    escribiendo = false;
}

// Verificacion de errorres
function verifData() {
    var Obligatorios = $("[data-required]").length;
    if ($("[data-error='Si']").length > 0) {
        $("#registrar").attr("disabled", true);
    } else if ($("[data-error='No']").length >= Obligatorios) {
        $("#registrar").removeAttr("disabled");
    }
}

function setAnchorTitle(){
    $('option[title!=""]').each(function() { 
        var a = $(this);  
        a.hover(
            function() { console.log("Hover");
                showAnchorTitle(a, a.data('title'));
            },
            function() { console.log("Lost Hover >>>");
                hideAnchorTitle();
            }
        ).data('title', a.attr('title')).removeAttr('title');
    }); 
     
}
function showAnchorTitle(element, text) { 
    var offset = element.offset(); 
    var izq = offset.left -100;
    $('#anchorTitle').css({
        'top'  : (offset.top + element.outerHeight() + 4) + 'px',
        'left' : izq + 'px'
    }).html(text).show(); 
} 
function hideAnchorTitle() {
    $('#anchorTitle').hide();
}