var cotizaciones;


$(function(){
    setInterval(function() { if (opener == null) { self.close(); } }, 2000);
    $.ajaxSetup({
        beforeSend: function() {
            $('.loader').css("visibility", "visible");
        },
        complete: function(html) {
            $('.loader').css("visibility", "hidden");
        }
    });
    $("div#editor_container").draggable();
    
    $(".si").click(function(){
      var factura = $(this).parent().attr("data-fact");
      verDetalleAplicado(factura);
    });
    
    $(".si").mouseover(function(){
        $(".cursor").remove(); // Se saco a todos los que tienen
        $(this).prepend("<img class='cursor' src='../../img/r_arrow.png' width='18px' height='10px'>"); 
   }).mouseleave(function(){
        $(this).children('.cursor').remove();
   });
    
});

 

function getPagos(){ 
  alert("Esta seccion aun no se ha desarrollado");  
/*
   $('.si').each(function(){
        var factura = $(this).parent().attr("data-fact");
        verDetalleAplicado(factura);
   });
   $(".cancelar_pagos").fadeIn();
   */
}
function cancelarTodos(){
   $(".agregar").each(function(){ 
     $(this).trigger("click");
   });
   $(".cancelar_todos").attr("disabled",true);
}
function cancelarPagos(){
    $('.incorrecto').each(function(){        
        $(this).html("<img src='../../img/r_arrow.png' width='20px' height='10px' class='agregar' title='Agregar a lista de Cancelacion' style='cursor:pointer' >");
    });  
    $(".cancelar_todos").fadeIn();
    
    $(".agregar").click(function(){
        var factura = $(this).parent().attr("data-factura");
        var nro_pago =$(this).parent().attr("data-nro_pago");
        cancelarPago(nro_pago,factura);
    }); 
    
}
function cancelarPago(nro_pago,factura){
    var usuario = opener.opener.getNick();
    
    $.ajax({
        type: "POST",
        url: "../../Ajax.class.php",
        data: {"action": "cancelarPagoFactura", "usuario": usuario, "factura": factura,nro_pago:nro_pago},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#pago_"+nro_pago).html("<img src='../../img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);  
                $("#pago_"+nro_pago).html(result); 
            }
        },
        error: function () {
           $("#pago_"+nro_pago).html("<img src='../../img/warning_red_16.png' width='16px' height='16px' title='Error al registrar la cancelacion' >"); 
        }
    }); 
}
function verif() {
    if ($('#todos').is(':checked')) {
        $('.no .unitario').prop('checked', true);
    } else {
        $('.unitario').prop('checked', false);
    }
    checkVerif();
}

function checkVerif() {
    if ($('.no .unitario:checked').length > 0) {
        $("#verif").removeAttr("disabled");
    } else {
        $("#verif").attr("disabled", "disabled");
    }
}
// Marcar ventas como verificadas
function verif_ventas() {
    $(".verif_errro").remove();
    if ($('.no .unitario:checked').length > 0) {
        if (confirm("Marcar Ventas como Verificada?")) {
            $.each($('.no .unitario:checked'), function(element) {
                var factura = $(this).attr("id");
                $.post("ArqueoVentasDet.class.php", { "action": "verificado", "args": factura }, function(data) {
                    if (data.msg == "Ok") {
                        $($("#" + factura).parent()).addClass("si");
                        $($("#" + factura).parent()).removeClass("no");
                        $($("#" + factura).parent()).html("si");
                    } else {
                        $("<span/>", {
                            "class": "verif_errro",
                            "text": "error",
                            "style": "color:red",
                            "title": "No se pudo ejecutar la operacion"
                        }).appendTo($($("#" + data.msg).parent()));
                    }
                }, "json");
            });
        }
    }
}

// Ver Editar valores
function edit(Obj) {
    var target = Obj.attr("data-target");
    var factura = $(Obj.parent().parent()).attr("data-fact");
    console.log(target);

    $.post("ArqueoVentasDet.class.php", { "action": "movObtenerDetalle", "args": factura + ',' + target }, function(data) {
        $("#editor").empty();
        if (data.data.length > 0) {
            var table = $("<table/>", { "border": "1", "cellspacing": "0", "cellpadding": "0" });
            var first = true;
            $.each(data.data, function(i, element) {
                var tr = $("<tr/>", { "data-table": target, "data-changed": false });
                var tr1 = $("<tr/>");
                var i = 0;
                var id_concepto = 0;
                $.each(element, function(key, value) {
                    if (key == 'id_concepto') {
                        id_concepto = value;
                    }
                    if (first) {
                        $("<th/>", { "text": data.names[i], "class": key }).appendTo(tr1);
                    }
                    switch (key) {
                        case 'moneda':
                            var td = $("<td/>", { "data-row": key });
                            td.append(getCotizXFact(factura, value, actualizarMov));
                            td.appendTo(tr);
                            break;
                        case 'm_cod':
                            var td = $("<td/>", { "data-row": key });
                            td.append(getCotizXFact(factura, value, actualizarMov));
                            td.appendTo(tr);
                            break;
                        case 'id_banco':
                            var td = $("<td/>", { "data-row": key });
                            td.append(getBancos(value,actualizarCheque));
                            td.appendTo(tr);
                            break;
                        case 'cod_conv':
                            var td = $("<td/>", { "data-row": key });
                            td.append(getConvenios(value, actualizarConvenio));
                            td.append($("<input/>",{"type":"hidden", "data-row": "nombre"}));
                            td.append($("<input/>",{"type":"hidden", "data-row": "neto"}));
                            td.appendTo(tr);
                            break;
                        case 'tipo':
                            var td = $("<td/>", { "data-row": key,"style":"display:none;" });
                            td.append($("<input/>",{"type":"hidden", "data-row": key, "value":value}));
                            td.appendTo(tr);
                            break;
                        case 'cotiz':
                        case 'entrada_ref':
                        case 'salida_ref':
                        case 'valor_ref':
                            $("<td/>", { "data-row": key, "text": value }).appendTo(tr);
                            break;
                        case 'id_pago':
                        case 'id_cheque':
                        case 'id_mov':
                            $("<td/>", { "class": "ref", "data-row": key, "text": value }).appendTo(tr);
                            break;

                        default:
                            if (target === 'efectivo' && ((id_concepto == 1 && key === "entrada") || (id_concepto == 2 && key === "salida"))) {
                                // Efectivo
                                var td = $("<td/>");
                                var input = $("<input/>", {
                                    "value": value,
                                    "data-row": key,
                                    "class": "edit_data",
                                    "data-changed": false,
                                    "readOnly": "true",
                                    "type":"text",
                                    change: actualizarMov
                                });
                                input.click(editar);
                                input.appendTo(td);
                                td.appendTo(tr);

                            } else if (target === 'convenios' && (key === "voucher" || key === 'monto')) {
                                // Convenio
                                var td = $("<td/>");
                                var input = $("<input/>", {
                                    "value": value,
                                    "data-row": key,
                                    "class": 'edit_data',
                                    "type":"text",
                                    "readOnly": "true",
                                    change: actualizarConvenio
                                });
                                input.click(editar);
                                input.appendTo(td);
                                td.appendTo(tr);

                            } else if (target === 'cheques_ter' && (key === "fecha_emis" || key === 'fecha_pago' || key === 'benef' || key === 'valor' || key === "nro_cheque" || key === "cuenta")) {
                                // Cheque
                                var td = $("<td/>");
                                var input = $("<input/>", {
                                    "value": value,
                                    "data-row": key,
                                    "class": 'edit_data',
                                    "readOnly": "true",
                                    "type":"text",
                                    "size":value.length,
                                    change: actualizarCheque
                                });
                                
                                input.click(editar);
                                input.appendTo(td);
                                td.appendTo(tr);

                            } else {
                                $("<td/>", {
                                    "class": key,
                                    "text": value,
                                }).appendTo(tr);
                            }
                            break;
                    }

                    i++;
                });
                if (first) {
                    tr1.appendTo(table);
                    first = false;
                }
                tr.appendTo(table);
            });
            table.appendTo("#editor");
            $("#editor_container").show(function(){
                $("input[type='text']").each(function(){$(this).attr("size",$(this).val().length)});
                $("div#editor_container").css({"width":"auto","height":"auto","left":0});
                
            });
        }else{
            cerrarEditor();
        }
    }, 'json');
}

// Cotizacion
function getCotizXFact(factura, selected, callback) {
    var select = $("<select/>", { "class": "editable", "data-row": "m_cod", change: callback });
    $.post("ArqueoVentasDet.class.php", { "action": "getCotiz", "args": factura }, function(data) {
        cotizaciones = data;
        $.each(data, function(key, value) {
            var op = $("<option/>", { "value": key, "data-cambio": value.compra, "text": key });
            if (key == selected) {
                op.attr("selected", "selected");
            }
            op.appendTo(select);
        });
    }, "json");
    return select;
}

// Bancos 
function getBancos(selected, callback) {
    var select = $("<select/>", { "class": "editable", "data-row": "id_banco", change: callback });
    $.each(bancos, function(key, value) {
        var op = $("<option/>", { "value": key, "text": value });
        if (key == selected) {
            op.attr("selected", "selected");
        }
        op.appendTo(select);
    });
    return select;
}

// Convenios
function getConvenios(selected, callback) {
    var select = $("<select/>", { "class": "editable", "data-row": "cod_conv", change: callback });
    $.each(convenios, function(key, value) {
        var op = $("<option/>", { "value": key, "text": value });
        if (eval(key) == selected) {
            op.attr("selected", "selected");
        }
        op.appendTo(select);
    });
    return select;
}
// Actualizar cheques
function actualizarCheque(){
    var modded = $(this).attr("data-row");
    var target = $(this).closest("tr");
    var fecha_filtro = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
    
    $("input[data-row='fecha_emis']").removeAttr("data-error");
    $("input[data-row='fecha_pago']").removeAttr("data-error");

    if(modded ==='fecha_emis' || modded ==='fecha_pago'){
        var feha_test = $(this).val();
        if (fecha_filtro.exec(feha_test) !== null) {     
            var feha_emis = new Date($("input[data-row='fecha_emis']").val()).getTime();
            var fecha_pago = new Date($("input[data-row='fecha_pago']").val()).getTime();

            if(feha_emis===fecha_pago){
                $("input[data-row='tipo']").val("Al_Dia");
                $("input[data-row='tipo']").attr("data-changed","true");
            }else if(feha_emis<fecha_pago){
                $("input[data-row='tipo']").val("Diferido"); 
                $("input[data-row='tipo']").attr("data-changed","true");
            }else{
                $(this).attr("data-error",true);
            }
        }else{
            $(this).attr("data-error",true);
        }
    }

    
    if($(this).prop("tagName")==='INPUT'){
        $(this).attr("readonly", "true");
    }
    target.attr("data-changed", true);
    $(this).attr("data-changed", true);
    checkChanges();
}
// Actualizar Convenio
function actualizarConvenio() {
    
    var modded = $(this).attr("data-row");
    var target = $(this).closest("tr");
    if(modded==='cod_conv'){
        var nombre = target.find("input[data-row='nombre']");
        $(nombre).val($(this).find("option:selected").text());
        nombre.attr("data-changed", true);
    }else if(modded === 'monto'){
        var neto = target.find("input[data-row='neto']");
        $(neto).val(target.find(("input[data-row='monto']")).val());
        neto.attr("data-changed", true);
    }
    if($(this).prop("tagName")==='INPUT'){
        $(this).attr("readonly", "true");
    }
    
    target.attr("data-changed", true);
    $(this).attr("data-changed", true);
    checkChanges();   
}
// Efectivo
var actualizarMov = function() { 
    var target = $(this).closest("tr");
    var table = target.attr('data-table');
    target.attr("data-changed", true);
    $(this).attr("data-changed", true);
    var cotiz = $(target.find("select[data-row='m_cod']")).find("option:selected").attr("data-cambio");
    $(target.find("td[data-row='cotiz']")).text(cotiz);
    $(target.find("td[data-row='cotiz']")).attr("data-changed", true);

    if(table === 'cheques_ter'){
        var valor = $(target.find("input[data-row='valor']")).val();
        $(target.find("td[data-row='valor_ref']")).text(parseFloat(valor) * parseFloat(cotiz));
        $(target.find("td[data-row='valor_ref']")).attr("data-changed", true);
    }else{
        // Efectivo
        var id = (target.find("td.id_pago")).text();
        var entrada = $(target.find("input[data-row='entrada']")).val() || 0;
        var salida = $(target.find("input[data-row='salida']")).val() || 0;
        var entrada_ref = (parseFloat(entrada) * parseFloat(cotiz));
        var salida_ref = (parseFloat(salida) * parseFloat(cotiz));

        $(target.find("td[data-row='entrada_ref']")).text(parseFloat(entrada) * parseFloat(cotiz));
        $(target.find("td[data-row='salida_ref']")).text(parseFloat(salida) * parseFloat(cotiz));
        $(target.find("td[data-row='entrada_ref']")).attr("data-changed", true);
        $(target.find("td[data-row='salida_ref']")).attr("data-changed", true);

        $("input[data-row='entrada'], input[data-row='salida']").attr("readonly", "true");
    }
    checkChanges();
};

function guardar() {
    var updates = [];
    var update = {};
    update['table'] = {};
    update['where'] = {};
    update['data'] = {};
    $($("tr[data-changed='true']")).each(function() {
        $($(this).find("[data-changed='true']")).each(function() {
            var val = '';
            var t = $($(this).closest("tr")).find("td.ref");
            update['where'][t.attr("data-row")] = t.text();
            update['table'] = $($(this).closest("tr")).attr("data-table");

            if ($(this).attr("data-row") !== undefined) {
                if ($(this).prop("tagName") === 'TD') {
                    update['data'][$(this).attr("data-row")] = $(this).text();

                } else {
                    update['data'][$(this).attr("data-row")] = $(this).val();

                }

            }
        });
        updates.push(update);
    });
    console.log(updates.length);
    if(updates.length>0){
        var w = $("button#editor_save").css("width");
        var orgText = 'Guardar Cambios';
        $("button#editor_save").attr("disabled",true);
        $("button#editor_save").text(" Procesando ...").css("color","green");
        $.post("ArqueoVentasDet.class.php", { "action": "actualizar", "datos": JSON.stringify(updates),"usuario":(window.opener).opener.getNick() }, function(data) {            
            $("button#editor_save").text("OK!").css({"color":"green","width":w});
            $("button#editor_save").fadeOut(1000,function(){
                $("button#editor_save").text(orgText).css({color:"black"}).fadeIn("slow",function(){
                    $("button#editor_save").attr("disabled",true);
                });
            });
        }, "json");
    }
    
}

function editar() {
    var target = $(this);
    var valor = target.val();
    target.removeAttr("readonly");
}

function cerrarEditor() {
    $("#editor_container").hide();
}

function checkChanges(){

    if($("tr[data-changed='true']").length>0 && $("input[data-error]").length === 0){
        $("button#editor_save").removeAttr("disabled");
    }else{
        $("button#editor_save").attr("disabled",true);
    }
}

Number.prototype.format = function(n, x, s, c) {           
    var s_ = s || ".";   
    var c_ = c || ",";   
    
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));

    return (c_ ? num.replace('.', c_) : num).replace(new RegExp(re, 'g'), '$&' + (s_ || ','));
};