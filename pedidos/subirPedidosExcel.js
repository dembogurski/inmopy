var event;
var curren;
$(function() {
    setInterval(function() {
        if (opener == null) {
            self.close();
        }
    }, 2000);
    $("#editPoUp").draggable();
    $.ajaxSetup({
        beforeSend: function() {
            $('.loader').css("visibility", "visible");
        },
        complete: function(html) {
            $('.loader').css("visibility", "hidden");
        }
    });
    if ($("#excelData").length > 0) {
        $("#upploadForm form").css("display", "none");
        $("#toggleView").html("Mostrar");
        $("#toggleView").attr("class", "mostrar");
    }
    $("#edit_color").autocomplete({
        source: colores,
        select: function(event, ui) { chekColor($("#edit_color").val()) }
    });


});


// Verificala existencia de un color
function chekColor(color) {
    $.post("SubirPedidoExcel.class.php", { "action": "getColor", "args": color + ",true" }, function(data) {
        var dateCheck = 'ok';
        if (data.error) {
            dateCheck = 'error';
        } else {
            $("#edit_color").val(data.Name);
            $("#edit_color").attr("data-colorcode", data.Code);
        }
        $("#edit_color").attr("data-check", dateCheck);
        verifData();
    }, "json");
}
// Verifica la existencia de un codigo de articulo
function checkItem(Item) {
    $.post("SubirPedidoExcel.class.php", { "action": "getItemData", "args": Item + ",true" }, function(data) {
        var dateCheck = 'ok';
        if (data.error) {
            dateCheck = 'error';
            $("#edit_articulo_nombre").val(data.error);
        } else {
            $("#edit_articulo").val(data.ItemCode);
            $("#edit_articulo_nombre").val(data.ItemName);
        }
        $("#edit_articulo").attr("data-check", dateCheck);
        verifData();
    }, "json");
}
// Verificacion basica numero 
function checkNumber(target) {
    var valor = target.val();
    var dateCheck = 'ok';
    if (isNaN(valor)) {
        dateCheck = 'error';
    }
    target.attr("data-check", dateCheck);
    verifData();
}
/**
 *  Elimina una Fila
 *  @param target:object 
 */
function remove(t) {
    var target = $(t).parent().parent();
    var t_ = $("#excelData tbody tr").index(target);
    $($("#excelData tbody tr").get(t_)).remove()
}
/**
 *  Abre la ventana de Edicion
 *  @param target:object 
 */
function edit(t) {
    $("#excelDataLoader").removeClass("loader");
    var target = $(t).parent().parent();
    $("#excelData tbody tr").removeClass("edit");
    var t_ = $("#excelData tbody tr").index(target);
    curren = t_;
    var edit = $($("#excelData tbody tr").get(t_));
    edit.addClass("edit");
    $("[id^='edit_']").each(function() {
        var t = $(this).attr('id');
        var l = t.length;
        var targetID = t.substr(5, l);

        $(this).val(edit.find($("td." + targetID)).text());
        if (targetID === 'color') {
            $(this).attr("data-colorcode", edit.find($("td." + targetID)).attr("data-colorcode"));
        }
    });
    $("#editPoUp").show();
}
// Cerrar popup de Edicion
function cerrar() {
    $("#excelDataLoader").addClass("loader");
    $("#excelData tbody tr").removeClass("edit");
    $("input[id^='edit_']").each(function() { $(this).removeAttr("data-check") });
    $("#editPoUp").hide();
}

// Actualizar datos
function actualizar() {
    $("#excelData tbody tr").removeClass("edit");
    var t_ = curren;
    var target = $("#excelData tbody tr").get(t_);
    $("[id^='edit_']").each(function() {
        var t = $(this).attr('id');
        var l = t.length;
        var targetID = t.substr(5, l);
        var targetRow = $(target).find($("td." + targetID));


        targetRow.text($(this).val());
        if (!targetRow.hasClass("ok") && targetRow.hasClass("sync")) { targetRow.addClass("ok"); }
        if (targetID === 'color') {
            targetRow.attr("data-colorcode", $(this).attr("data-colorcode"));
            $(this).attr("data-colorcode", $($("#excelData tbody tr").get(t_)).find($("td." + targetID)).attr("data-colorcode"));
        }
    });
    $(target).attr("class", "file_ok");
    $(target).find($("td.verif span")).html('&#9745;');
    $(target).find($("td.error")).removeClass("error");
    cerrar();
}
// Verifica que los datos en edicion son correctos
function verifData() {
    var error = false;
    $("input[id^='edit_']").each(function() {
        var verif = $(this).attr("data-check");
        if (verif && verif === 'error') {
            error = true;
        }
    });
    if (error) {
        $("#actualizar").attr("disabled", "disabled");
    } else {
        $("#actualizar").removeAttr("disabled");
    }
}

// Filtro de Filas
function view(obj) {
    target = obj.find("option:selected").val();
    $("tr[class^='file_']").hide();
    if (target == 'todos') {
        $(".file_ok").show();
        $(".file_error").show();
    } else {
        $("." + target).show();
    }
}
// Envia las filas correctas para cargar en la base de datos
function procesar() {
    var lista = [];
    var fila = [];
    $("#procesar").attr("disabled","disabled");
    $(".file_ok").each(function() {
        fila = [];
        $(this).find($("td.ok")).each(function() {
            if ($(this).hasClass("color")) {
                fila.push($(this).attr("data-colorcode"));
            } else {
                fila.push($(this).text());
            }
        });
        lista.push(fila);
    });
    lista.forEach(function(val, key) {
        console.log("key: " + key + ", val:" + val);
    });
    $.post("SubirPedidoExcel.class.php", { "action": "procesar", "filas": JSON.stringify(lista), "user": opener.getNick() }, function(data) {
        if(data.msj === 'ok'){
            $("#procesar").text("Ok!");            
        }
    },"json");
}

// Muestra el nombre del archivo seleccionado para subir al servidor
function updateFileData() {
    $("#filedata").html($("#fileToUpload").val());
}
// Permuta la vista del area de carga de archivos
function toggleView() {
    if ($("#upploadForm form").css("display") === "none") {
        $("#upploadForm form").css("display", "block");
        $("#toggleView").html("Ocultar");
        $("#toggleView").attr("class", "ocultar");
    } else {
        $("#upploadForm form").css("display", "none");
        $("#toggleView").html("Mostrar");
        $("#toggleView").attr("class", "mostrar");
    }
}