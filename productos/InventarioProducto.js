function configurar() {
    if(id_inv.length == 0){
        $("#inv_nuevo").show();
    }else{
        $("#inv_fin,#inv_cab").show();
        $("#inv_iniciar_info").hide();
    }
    $("#inv_FP").click(function(){
        var fp = $("#inv_FP").val();
        if(fp !=''){
            if(fp == "Si"){
                $("#inv_FP").val("No");                
            }else{
               $("#inv_FP").val("Si"); 
            }
            setClassFP();
        }
    });
    $("#inv_lote").focus(function(){
        $(this).select();
    });
}

function inv_nuevo(){
    var data = {
        "inv_action": "nuevo_inventario",
        "args": getNick()+','+getSuc()
    };
    $.post("productos/InventarioProducto.class.php", data, function(response){
        if(!response.erro){
            id_inv = response.id_inv;
            fechaIni = response.fechaIni;
            $("#inv_fechaIni").text(response.fechaFormat);
            $("#inv_nuevo").hide();
            $("#inv_fin,#inv_cab").show();
            $("#inv_iniciar_info").hide();
        }else{
            alert("Ocurrio un error al comunicarse con el Servidor\n")
        }
    },'json');
}
function inv_fin(){
    if(confirm("Se cerrara el inventario iniciado " +$("#inv_fechaIni").text())){
        var data = {
            "inv_action": "fin_inventario",
            "args": id_inv+','+getNick()
        };
        $.post("productos/InventarioProducto.class.php", data, function(response){
            if(!response.erro){
                id_inv = '';
                fechaIni = '';
                $("#inv_fechaIni").text('');
                $("#inv_nuevo").show();
                $("#inv_fin,#inv_cab").hide();
                $("#inv_iniciar_info").show();
            }else{
                alert("Ocurrio un error al comunicarse con el Servidor\n")
            }
        },'json');
    }
}

function invInicializar() {
    invNoImagen();
}
// Si el lote no tiene una imagen o no existe la imagen pone por defecto 0/0 No-Imagen
function invNoImagen() {
    $("#inv_photo").attr("src", imgURI + "0/0.jpg");
}
// Limpia el campo lote antes de pedir información al servidor
function inv_actualizar() {
    var lote = $("#inv_lote").val();
    if ($.trim(lote) != '' && !isNaN(lote)) {
        buscarDatosDeCodigo($("#inv_lote"));
    }
}
// Guarda si no hay errores
function inv_guardar() {
    $("[class^=ok_], [class^=error_]").each(function() { if ($(this).is(":visible") == false) { $(this).remove(); } });

    // Actualizar lote
    var data = {
        "action": "actualizarLote",
        "usuario": getNick(),
        "suc": getSuc(),
        "codigo": $("#inv_Codigo").val(),
        "lote": $("#inv_lote").val(),
        "descrip": $("#inv_Descrip").text(),
        "F1": parseFloat($("#inv_F1").val()),
        "F2": parseFloat($("#inv_F2").val()),
        "F3": parseFloat($("#inv_F3").val()),
        "tara": $("#inv_Tara").val(),
        "FP": $("#inv_FP").val(),
        "ancho": $("#inv_Ancho").val(),
        "gramaje": $("#inv_Gramaje").val(),
        "kg": $("#inv_Kg").val()
    };
    $.post("productos/ActualizarLotes.class.php", data).done(
        function() {
            var current = new Date().getTime();
            $("div#inv_msj").append($("<div/>", {
                "onload": function() { setTimeout(function() { $(".ok_" + current).hide(1500); }, 5000); },
                "text": "Se envio actualizacion de lote, en segundos se aplicará el cambio",
                "class": "ok_" + current
            }));

            // Insertar Registro de Inventario
            var invData = {
                "inv_action": "insertarRegistro",
                "usuario": getNick(),
                "id_inv": id_inv,
                "suc": getSuc(),
                "um": $('#inv_UM').val(),
                "lote": $('#inv_lote').val(),
                "codigo": $("#inv_Codigo").val(),
                "stock_ini": $('#inv_Stock').data("org"),
                "gramaje_ini": $('#inv_Gramaje').data("org"),
                "ancho_ini": $('#inv_Ancho').data("org"),
                "tara_ini": $('#inv_Tara').data("org"),
                "kg_calc": $('#inv_Kg_calc').data("org"),
                "kg_desc_ini": $('#inv_U_kg_desc').data("org"),
                "tipo_ini": $("input#inv_Tipo").data("org"),
                "stock": $('#inv_Stock').val(),
                "gramaje": $('#inv_Gramaje').val(),
                "ancho": $('#inv_Ancho').val(),
                "tara": $('#inv_Tara').val(),
                "kg": $('#inv_Kg').val(),
                "kg_desc": $('#inv_U_kg_desc').val(),
                "tipo": $("input#inv_Tipo").val(),
                "actualizarKgDesc": $("#in_checkbox").is(":checked")
            };
            $.post("productos/InventarioProducto.class.php", invData).done(function(_data) {
                rData = _data;
                
                JSON.parse(_data).forEach(function(data, i) {
                    var _current = new Date().getTime();
                    $("div#inv_msj").append($("<div/>", {
                        "onload": function() { setTimeout(function() { $("." + data.status + "_" + _current).hide(1500); }, 5000); },
                        "text": data.msj,
                        "class": data.status + "_" + _current
                    })); 
                });
                if(_data[0].status == "ok"){ 
                     // playSaved();
                     console.log("status ok")
                }
                playSaved();
                limpiarValores();
            }, "json");
        }
    );
}
// Ajuste

function inv_ajustarStock() {

    $("[class^=ok_], [class^=error_]").each(function() { if ($(this).is(":visible") == false) { $(this).remove(); } });
    var msj = "Actualizar Stock del producto?";
    $("#inv_Stock").removeClass("inv_error");
    if (inv_verif($("#inv_Stock"))) {

        if (confirm(msj)) {
            $("button#inv_update img").addClass("spin");
            var stock = parseFloat($("#inv_Stock").data("org"));
            var final = parseFloat($("#inv_Stock").val());
            var ajuste = stock - final;
            var signo = (stock > final) ? '-' : '+';

            var params = {
                "action": "registarAjuste",
                "codigo": $("#inv_Codigo").val(),
                "lote": $("#inv_lote").val(),
                "suc": getSuc(),
                "stock": stock,
                "final": final,
                "ajuste": ((ajuste < 0) ? ajuste * -1 : ajuste),
                "oper": "Correccion de Stock",
                "signo": signo,
                "motivo": "Actualizacion de Inventario",
                "um": $("#inv_UM").val(),
                "usuario": getNick()
            }
            $.post("Ajax.class.php", params, function(data) {
                var cerrent = new Date().getTime();
                if (data.estado == 'Error') {
                    $("div#inv_msj").append($("<div/>", {
                        "onload": function() { setTimeout(function() { $(".error_" + cerrent).hide(1500); }, 5000); },
                        "text": data.info,
                        "class": "inv_error" + cerrent
                    }));
                } else {
                    $("div#inv_msj").append($("<div/>", {
                        "onload": function() { setTimeout(function() { $(".ok_" + cerrent).hide(1500); }, 5000); },
                        "text": "Se envio el ajuste, en unos segundos se aplicará el cambio",
                        "class": "ok_" + cerrent
                    }));
                }

                inv_actualizarGramaje();
                $("button#inv_update img").removeClass("spin");
            }, "json").fail(function(xhr, status, error) { $("button#inv_update img").removeClass("spin"); });
        } else {
            $("#inv_Stock").val($("#inv_Stock").data("org"));
        }
    } else {
        $("#inv_Stock").addClass("inv_error");
    }
    inv_verificarDatos();
}
/**
 * Actualiza el gramaje en funcion los datos de producto
 * @param {JQueryObject} target 
 */
function inv_actualizarGramaje() {
    var stock = $("#inv_Stock").val();
    var ancho = $("#inv_Ancho").val();
    var tara = $("#inv_Tara").val();
    var kg = $("#inv_Kg").val();

    var verif_kg = inv_verif($("#inv_Kg"));
    var verif_tara = inv_verif($("#inv_Tara"));
    var verif_ancho = inv_verif($("#inv_Ancho"));

    if (verif_ancho && verif_tara && verif_kg) {
        if (tara == 0) {
            tara = 1;
            $("#inv_Tara").val(1);
        }
        $("#inv_Gramaje").val(parseFloat(((kg - (tara / 1000)) * 1000) / (stock * ancho)).toFixed(2));
        // Actualiza Kg Calc
        $("#inv_Kg_calc").val(eval('(' + $("#inv_Gramaje").data("org") + ' * ' + $("#inv_Stock").val() + ' * ' + $("#inv_Ancho").val() + ' + ' + $("#inv_Tara").val() + ')/1000').toFixed(3));
        //inv_updateKgCalc(false);
    }
    inv_verificarDatos();
}
/**
 * Verifica si es un numero valido
 * @param {JQueryObject} target
 */
function inv_verif(target) {
    var rg_num = /^[0-9]{1,5}(\.[0-9]{1,3})?$/;
    var val = target.val();
    if (isNaN(val) || $.trim(val) == '' || val === undefined) {
        target.addClass("inv_error");
        return false;
    }
    if (rg_num.test(val)) {
        target.removeClass("inv_error");
        return true;
    } else {
        target.addClass("inv_error");
        return false;
    }
}
/**
 * Obtiene datos de lote
 * @param {Objet} Obj 
 */
function buscarDatosDeCodigo(Obj) {

    inv_registrosAnteriores();
    $("#inv_kgMsj").text("");
    $(".inv_error").removeClass("inv_error");
    $(".inv_diff").removeClass("inv_diff");
    $("button#inv_update img").addClass("spin");
    $("#inv_save").attr("disabled", true);
    $("input.inv_load_data").val('');
    $("#inv_Descrip").text('');
    $("#in_checkbox").prop("checked", false);
    var cat = 1;
    var suc = getSuc();
    var lote = Obj.val();
    var esRollo;



    // Obtener Datos de Lote
    $.post("productos/InventarioProducto.class.php", { "inv_action": "buscarDatosDeCodigo", "args": lote + "," + suc }, function(data) {
        $("button#inv_update img").removeClass("spin");
        //console.log("Mensaje, " + data.Mensaje);
        var kg_desc = 0;            
        if (data.Mensaje == "Ok") {
            
            $.each(data, function(key, value) {  
                switch (key) {
                    case "Img":
                        $("#inv_photo").attr("src", imgURI + value + ".jpg?_=" + (new Date().getTime()));
                        break;
                    case "Tara": 
                        if(getSuc()=="00"){   
                            if( value == ""){
                                value = 1;
                            }
                            $("#inv_Tara" ).val(1);
                        }else{
                            $("#inv_" + key).val(value);
                            $("#inv_" + key).data("org", value);
                            $("#inv_" + key).attr("title", value);
                        }
                        break;
                    case "Descrip":
                        $("#inv_" + key).text(value);
                        $("#inv_" + key).data("org", value);
                        $("#inv_" + key).attr("title", value);
                        break;
                    case "Ancho":
                    case "Gramaje":
                    case "Stock":
                        $("#inv_" + key).val(parseFloat(value).toFixed(2));
                        $("#inv_" + key).data("org", parseFloat(value).toFixed(2));
                        $("#inv_" + key).attr("title", parseFloat(value).toFixed(2));
                        break;
                    case "U_kg_desc":
                        $("#inv_" + key).val(parseFloat(value).toFixed(2));
                        $("#inv_" + key).data("org", parseFloat(value).toFixed(2));
                        $("#inv_" + key).attr("title", parseFloat(value).toFixed(2));
                        if(getSuc()=="00"){   
                           $("#inv_Kg").val(parseFloat(value).toFixed(2));
                           kg_desc =parseFloat(value).toFixed(2);
                        }
                        break;
                    case "entDate":
                        console.log(new Date(value) + ', ' + new Date(fechaIni));
                        if (new Date(value) > new Date(fechaIni)) {
                            $("#inv_kgMsj").html("Lote ingreso porterior al inicio del Inventario " + fechaIni + "<br>Fecha de registro de lote " + value);
                            $("#inv_kgMsj").addClass("inv_error");
                        }
                        break;
                    default:
                        $("#inv_" + key).val(value);
                        $("#inv_" + key).data("org", value);
                        $("#inv_" + key).attr("title", value);
                }
               
                
            });
             
            
            setClassFP();
            
            inv_updateKgCalc(true);
            if($("#inv_Codigo").val() == 'C0172'){
                $("#inv_save").removeAttr("disabled");
                $("#inv_Kg").val("0.001");
            }else{
                $("#inv_Kg").val("");
            }
            
       //Forzar kg_desc            
if(getSuc() === "00"){
   $("#inv_Kg").val(parseFloat(kg_desc).toFixed(2));
   $("#inv_save").prop("disabled",false);
}

        } else {
            if(data.Mensaje == "En Remision"){
                var ms = data.Mensaje+" Nro: "+data.NroRemision +" Detino: "+ data.Destino;
                $("#inv_kgMsj").text(ms);
            }else{
                $("#inv_kgMsj").text(data.Mensaje);
            }
            
            $("#inv_kgMsj").addClass("inv_error");
        }

        // Verif Rollo
        $.post("productos/InventarioProducto.class.php", { "inv_action": "esRollo", "args": $("#inv_lote").val() + ',' + $("#inv_Codigo").val() },
            function(data) {
                esRollo = (data.esRollo == 1) ? 'Rollo' : 'Pieza';
                $("input#inv_Kg_calc, input#inv_U_kg_desc").closest("div.inv_block").removeAttr("style");
                if (esRollo === "Rollo") {
                    $("input#inv_Kg_calc").closest("div.inv_block").css("display", "none");
                } else {
                    $("input#inv_U_kg_desc").closest("div.inv_block").css("display", "none");
                }
                $("#inv_Tipo").val(esRollo);
                $("#inv_Tipo").data("org", esRollo);
                $("#inv_Tipo").attr("title", esRollo);

            }, "json").fail(function(xhr, status, error) { $("button#inv_update img").removeClass("spin"); });

        // Verif Avance
        $.post("productos/InventarioProducto.class.php", { "inv_action": "verifAvance", "args": fechaIni + ',' + getSuc() + ',' + $("#inv_Codigo").val()+','+id_inv },
            function(data) {
                if (Object.keys(data).length > 0) {
                    var ancho = Math.round((parseInt(data.inventariados) * 100) / (parseInt(data.lotes))) + "%";
                    var ancho = (isNaN(ancho))?0:ancho;
                    $("div#inv_inventariados").text("Progreso " + data.inventariados + " de " + data.lotes);
                    $("div#inv_progreso").css("width", ancho);
                    $("div#inv_progreso").css("max-width", "100%");
                    $("div#inv_progreso").text(ancho);
                }
            }, "json").fail(function(xhr, status, error) { $("button#inv_update img").removeClass("spin"); });
    }, "json").fail(function(xhr, status, error) { $("button#inv_update img").removeClass("spin"); });
    $("#inv_lote").focus();
    $("#inv_lote").select();
    
    
}
function setClassFP(){
    var fp = $("#inv_FP").val();
    if(fp === "Si"){
        $("#inv_FP").removeClass("fp_No");                
    }else{
        $("#inv_FP").removeClass("fp_Si");     
    }            
    $("#inv_FP").addClass("fp_"+fp);
}
// Tipos
function cambiarTipo(target) {
    if (target.val() === 'Rollo') {
        target.val('Pieza');
    } else {
        target.val('Rollo');
    }
    inv_verifKg($("input#inv_Kg").val());
    inv_verificarDatos();
}
// Cantidad de registros anteriores
function inv_registrosAnteriores() {
    var sucursal = $("#xsuc").is(":checked")?getSuc():'%';
    
    $.post("productos/InventarioProducto.class.php", { "inv_action": "registrosAnteriores", "args": $("#inv_lote").val()+","+sucursal }, function(data) {
        var reg = data.length;
        if (reg > 0) {
            inv_reg = data;
            $("#inv_reg").text(reg); 
            
            var reg_ant = 0;
            inv_reg.forEach(function(e){ 
               var id_ = e.id_inv;  
               if(id_ == id_inv){
                   reg_ant ++;
               }
            });  
            if(reg_ant == 0){
                $("#inv_registros").css("background","red");
            }else{
                $("#inv_registros").css("background","white"); 
            }
            playAlert();
        } else {
            inv_reg = {};
            $("#inv_reg").text(0);     
            $("#inv_registros").css("background","red");
        }
    }, "json");
}

function playAlert() {   
    var audio = new Audio('files/sounds/button-4.wav');
    audio.play();   
}
function playSaved() {   
    var audio = new Audio('files/sounds/beep-02.wav');
    audio.play();   
}  

// Limpia campos de carga
function limpiarValores() {
    $("#inv_reg").text(0);
    $("input.inv_load_data, input#inv_Kg, input#inv_lote").val('');
    $("#in_checkbox").prop("checked", false);
    $("#inv_save").attr("disabled", true);
    
    $("#inv_lote").focus();
    $("#inv_lote").select();
     
}

// Lista de registros anteriores por lotes
function inv_verRegistrosAnteriores() {
    $("div#inv_info").empty();

    if (inv_reg.length > 0) {
        var tabla = $("<table/>");
        var header = "<tr><th colspan='10'> Registros de Inventario Anteriores </th><th><button onclick='inv_cerrarInfo()' >Cerrar</button></th></tr> <tr><th>ID Inv.</th> <th>Usuario</th><th>SUC</th><th>UM</th><th>Stock</th><th>Gramaje</th><th>Ancho</th><th>Tara</th><th>Kg</th><th>Fecha</th><th>Hora</th></tr>";
        tabla.append(header);
        inv_reg.forEach(function(Obj, i) {
            var tr = $("<tr/>")
            $.each(Obj, function(key, value) {
                $("<td/>", { "class": key, "text": value }).appendTo(tr);
            });
            tabla.append(tr);
        });
        tabla.appendTo("div#inv_info");
        $("div#inv_info").show();
    }
}

function inv_cerrarInfo() {
    $("div#inv_info").hide();
    $("div#inv_info").empty();
}
// Actualiza el kilogramo calculado
function inv_updateKgCalc(updateOrg) {
    var stock = $("#inv_Stock").val();
    var gramaje = $("#inv_Gramaje").val();
    var ancho = $("#inv_Ancho").val();
    var tara = $("#inv_Tara").val();

    var kg_calc = parseFloat((((stock * gramaje * ancho)) / 1000) + (tara / 1000)).toFixed(3);
    $("#inv_Kg_calc").val(kg_calc);

    if (updateOrg) {
        $("#inv_Kg_calc").data("org", kg_calc);
        $("#inv_Kg_calc").attr("title", kg_calc);
    }
}

var intentos;
var porcentajeTolerancia = 2;
/**
 * Lee datos de la balanza
 */
function inv_leerBalanza() {
    var target = $("#inv_Kg");
    target.val("- - - - -");
    target.removeClass("inv_error");
    intentos++;
    var ip_domain = $("#inv_ip").val();
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
                        target.addClass("inv_error");
                        leerDatosBalanza();
                    } else {
                        intentos = 0;
                    }
                } else {
                    target.val(kg);
                    inv_verifKg(kg);
                }
            } else {
                target.val(kg);
            }
            inv_actualizarGramaje();

        },
        error: function(xhr, ajaxOptions, thrownError) {
            if (xhr.status == 404) {
                target.addClass("inv_error");
                target.val("Error");
                alert("No se encontro la aplicación\npara capturar datos de la balanza");
            }
            inv_actualizarGramaje();
        }

    });
}
// Kg. Verifica que este dentro del rango de tolerancia
function inv_verifKg(kg) {

    var kgRef;
    if ($("input#inv_Tipo").val() === "Pieza" && $("input#inv_UM").val() != 'Unid') {
        if($("input#inv_Stock").hasClass("inv_diff")){
            kgRef = eval($("input#inv_Kg").val());
        }else{
            kgRef = eval($("#inv_Kg_calc").val() + '+((' + ($("#inv_Tara").val() + ' - ' + $("#inv_Tara").data("org") + ')/1000)'));
        }
    } else if($("input#inv_UM").val() == 'Unid') {
        kgRef = eval($("input#inv_Kg").val());
    } else {
        kgRef = eval($("#inv_U_kg_desc").val());
    }
    
    //var kgRef = parseFloat($("#inv_Kg_calc").val());
    var tolerancia = parseFloat((kgRef * 2) / 100);
    var max = parseFloat(kgRef + tolerancia).toFixed(3);
    var min = parseFloat(kgRef - tolerancia).toFixed(3);
    console.log("Min: "+min+"  Max: "+max+"     Kg: "+kg);
    if (inv_verif($("#inv_Kg"))) {
        if (eval(kg) > eval(max) || eval(kg) < eval(min)) {
            $("#inv_kgMsj").text(kg + " no se encuentra entre " + min + " y " + max);
            $("#inv_kgMsj").addClass("inv_error");
        } else {
            $("#inv_kgMsj").text("");
            $("#inv_kgMsj").removeClass("inv_error");
        }
    }
    inv_actualizarGramaje();
}

// Kg de Descarga
function inv_actalizarKgDesc(Obj) {
    if (Obj.is(":checked")) {
        $("input#inv_U_kg_desc").val($("input#inv_Kg").val());
    } else {
        $("input#inv_U_kg_desc").val($("input#inv_U_kg_desc").data("org"));
    }

    inv_verifKg($("input#inv_kg").val());
}
// Verifica los errores en el proceso de inventario
function inv_verificarDatos() {
    $(".inv_load_data").each(function() {
        if ($(this).val() != $(this).data("org")) {
            $(this).addClass("inv_diff");
        } else {
            $(this).removeClass("inv_diff");
        }
    });
    // Estado de error
    if ($(".inv_error").length > 0 && $("#inv_Codigo").val() !== 'C0172') {
        $("#inv_save").attr("disabled", true);
    } else {
        $("#inv_save").removeAttr("disabled");
    }
    // Elimina estilo inicial 
    $("input#inv_Kg_calc, input#inv_U_kg_desc").closest("div.inv_block").removeAttr("style");
    // Pieza o rollo
    if ($("input#inv_Tipo").val() === "Rollo") {
        $("input#inv_Kg_calc").closest("div.inv_block").css("display", "none");
    } else {
        $("input#inv_U_kg_desc").closest("div.inv_block").css("display", "none");
    }
}
// Historial de Lote
var ventana;

function inv_historial() {     
    var lote = $("#inv_lote").val();
    var codigo = $("#inv_Codigo").val(); 
    var suc = "%";
    var url = "productos/HistorialMovimiento.class.php?codigo="+codigo+"&lote=" + lote + "&suc=" + suc + "";
    var title = "Historial de Movimiento de Lote";
    var params = "width=980,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";

    if (!ventana) {
        ventana = window.open(url, title, params);
    } else {
        ventana.close();
        ventana = window.open(url, title, params);
    }
}
// Reportes
function inv_reportes() {
    var lote = $("#inv_lote").val();
    var suc = "%";
    var url = "productos/InventarioReportes.php?suc=" + getSuc() + "&fecha_limite=" + fechaIni;
    var title = "Reporte de Inventario";
    var params = "width=980,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    
    if(id_inv.length == 0){
        alert("Debe iniciar un nuevo Inventario\nPara poder acceder al area de reportes.");
    }else{
        if (!ventana) {
            ventana = window.open(url, title, params);
        } else {
            ventana.close();
            ventana = window.open(url, title, params);
        }
    }
}

// Fotos

function inv_actualizarImagen() {
    var lotes = '';
    // Lista de lotes
    $("input.actualizar:checked").each(function() {
        var lote = $(this).prop("id").split('_')[1].trim();
        lotes += (lotes.length == 0) ? lote : ',' + lote;
    });
    if (lotes.length > 0) {
        // Si tiene imagen asignada
        if ($("div#inv_info table").data("ref") == undefined) {
            // Loader
            $("button#inv_actualizarImagen").text("Actualizando...");
            $("button#inv_actualizarImagen").append($("<img/>",{"src":"img/loadingt.gif"}));
            $("button#inv_actualizarImagen").prop("disabled",true);
            // Datos de formulario
            var fd = new FormData();
            fd.append('inv_action', 'guardarImagen');
            fd.append('file', document.getElementById("inv_subirImagen").files[0]);
            fd.append('lote', $("input#inv_lote").val());
            fd.append('lotes', lotes);
            $("#inv_kgMsj").empty();
            $("#inv_kgMsj").removeClass("inv_error");
            //inv_lotesSimilares();
            $.ajax({
                url: 'productos/InventarioProducto.class.php',
                data: fd,
                processData: false,
                contentType: false,
                type: 'POST',
                dataType: 'json',
                success: function(data) {
                    $("#inv_kgMsj").text("La imagen fue actualizada");
                    $("img#inv_photo").prop("src", data.url + "?_=" + new Date().getTime());
                    $("div#inv_info").hide();
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    if (xhr.status == 404) {
                        target.addClass("inv_error");
                        target.val("Error");
                        alert("Ocurrio un error al efectuar el procedimiento");
                    }
                }
            });
        }else{
            var loteRef = $("div#inv_info table").data("ref");
            $.post('productos/InventarioProducto.class.php',{"inv_action": "asignarImagenExistente","args":loteRef+","+lotes},function(data){
                alert(data.data);
            },"json");
        }
    }
}

function inv_lotesSimilares() {
    $("div#inv_info").empty();
    var lote = $("input#inv_lote").val();
    $.post("productos/InventarioProducto.class.php", { "inv_action": "lotesSimilares", "args": lote }, function(data) {
        if (data.length > 0) {
            var tabla = $("<table/>");
            var input = document.getElementById("inv_subirImagen");
            if (input.files && input.files[0]) {
                var r = $("<tr/>");
                var d = $("<td/>", { "colspan": '5', "align": "center" });
                // Imagen
                var reader = new FileReader();
                reader.onload = function(e) {
                    $('<img/>', {
                        "class": "inv_loadedImage",
                        "src": e.target.result,
                        "height": "auto",
                        "width": "200px"
                    }).appendTo(d);
                    d.appendTo(r);
                    tabla.append(r);


                    // Tabla
                    var header = "<tr><th colspan='4'> Lotes Similares </th><th><button class='inv_cerrar' onclick='inv_cerrarInfo()' >X</button></th></tr> <tr><th>Lote</th><th>SUC</th><th>Img</th><th>Usar Img</th><th>Actualizar</th></tr>";
                    tabla.append(header);
                    data.forEach(function(val, i) {
                        var tr = $("<tr/>");
                        var loteActual;
                        $.each(val, function(key, value) {
                            switch (key) {
                                case 'lote':
                                    tr.attr("id", value);
                                    loteActual = value;
                                    $("<td/>", {
                                        "align": "center",
                                        "text": value
                                    }).appendTo(tr);
                                    break;
                                case 'suc':
                                    $("<td/>", {
                                        "align": "center",
                                        "text": value
                                    }).appendTo(tr);
                                    break;
                                case 'img':
                                    var t = $("<td/>");
                                    var b = $("<button/>", {
                                        "onclick": "abrirImagen($(this))",
                                        "data-img": imgURI + value + ".jpg?_=" + (new Date().getTime())
                                    });
                                    $("<img/>", {
                                        "src": imgURI + value + ".thum.jpg?_=" + (new Date().getTime()),
                                        "onerror": "invNoImagen()",
                                        "height": "22px"
                                       
                                    }).appendTo(b);
                                    t.append(b);
                                    tr.append(t);
                                    break;
                                default:
                                    break;
                            }
                        });

                        var usetd = $("<td/>");
                        $(usetd).append($("<button/>", { "text": "< Usar", "onclick": "inv_usarImagenExistente($(this))" }));
                        usetd.appendTo(tr);
                        tabla.append(tr);

                        var chtd = $("<td/>");
                        $(chtd).append($("<input/>", { "type": "checkbox", "onchange": "inv_verificarActImagen()", "id": "actualizar_" + loteActual, "class": "actualizar", "checked": (lote == loteActual) }));
                        $(chtd).append($("<label/>", { "for": "actualizar_" + loteActual, "text": "Actualizar" }));
                        chtd.appendTo(tr);
                        tabla.append(tr);
                    });

                    tabla.append("<tr><td colspan='5'><button id='inv_actualizarImagen' onclick='inv_actualizarImagen()'>Actualizar Seleccionados</button></td></tr>");
                }
                reader.readAsDataURL(input.files[0]);
                $("div#inv_info").append(tabla);
                $("div#inv_info").show();
            } else {
                alert("Deve seleccionar o Capturar una Imagen");
            }
        }
    }, "json");

}

// Aplica una imagen que ya existe a un lote
function inv_usarImagenExistente(target) {
    if ($("div#inv_info table").length > 0) {
        $("div#inv_info table").data("ref", $(target.closest("tr")).prop("id"));
    }
}

// Activa o desactiva el boton Actualizar Seleccionados
function inv_verificarActImagen() {
    $("button#inv_actualizarImagen").prop("disabled", !($("input.actualizar:checked").length > 0));
}
// popup
function abrirImagen(target) {
    var lote = $("#inv_lote").val();
    var url = target.data("img");
    var suc = "%";
    var title = "Lote " + lote;
    var params = "width=980,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";

    if (!ventana) {
        ventana = window.open("", title, params);
    } else {
        ventana.close();
        ventana = window.open("", title, params);
    }
    ventana.window.document.writeln("<img src='" + url + "'/>");
}