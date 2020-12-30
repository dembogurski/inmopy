var reporte;

function configurar() {

    $(".rep_button").click(function() {
        var identifier = $(this).val().replace(/\ /g, '_').toLowerCase();
        loadFilters(identifier);
    });

    $("#select_type").change(function() {
        var clase = $(this).val();
        if (clase == "todos") {
            $(".rep_button").fadeIn("fast");
        } else {
            $("." + clase + "").fadeIn("fast");
            $(".rep_button:not('." + clase + "')").fadeOut(800);
        }
    });

    $(".filter").on("keyup change", function() {
        var filter = $(this).val();
        $(".resaltar").removeClass("resaltar");

        if (filter.length > 0) {
            var find = $('.rep_button').filter(function() {
                return $(this).val().toLowerCase().indexOf(filter) > -1;
            });
            find.addClass("resaltar");
        }
    });
    getCtasBancarias();
}
function genericAjax(url,laoder_id,data,callback){       
      $.ajax({
        type: "POST",
        url: url,
        data: data,
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#"+laoder_id).html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) { 
            $("#"+laoder_id).html(""); 
            callback( data );
        }
    });    
}

function mostrarMenu() {
    $("#filters_area").html("");
    $(".back_arrow").fadeOut();
    $("#rep_container").fadeIn();
}

function loadFilters(identif) {
    $("#rep_container").fadeOut();
    $(".back_arrow").fadeIn();
    $.ajax({
        type: "POST",
        url: "reportes/ReportesUI.class.php",
        data: { "action": identif, "usuario": getNick(), "suc": getSuc() },
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#filters_area").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
        },
        complete: function(objeto, exito) {
            if (exito == "success") {
                var result = $.trim(objeto.responseText);
                $("#filters_area").html(result);
                configForm();
            }
        },
        error: function() {
            $("#filters_area").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });
}
/* Prepara el Formulario cuando ya esta cargado */
function configForm() {
    $(".fecha").mask("99/99/9999");
    $(".fecha").datepicker({ dateFormat: 'dd/mm/yy' });
    if ($("#desde").length && $("#hasta").length) { $("#desde").change(function() { $("#hasta").val($(this).val()); }); }
}

function sendForm() {
    var emp = $(".emp").text();
    var params = "";
    $('#filter_table *').each(function() {
        var id = $(this).attr("id");
        if (id != undefined) {
            var valor = $(this).val();
            var type =$("#" + id).attr("type");
            if (type == "checkbox" || type == "radio"){
                valor = $(this).is(":checked");              
            }
            params += "" + id + "=" + valor + "&";
        }
    })
    var user = getNick();
    params += "user=" + user+"&emp="+emp;

    var action = $("#filter_form").attr("action");
    reporte = window.open(action + "?" + params, '_blank', 'scrollbars=yes,width=800,height=800');
}

function checkDate(id) {
    var fecha = validDate($("#" + id).val()).fecha;
}
function setCurrentDate(id) {
    var fecha = new Date().toJSON().slice(0,10).split("-");
    var mdy = fecha[2]+"/"+fecha[1]+"/"+fecha[0];    
    $("#" + id).val(mdy);
}

function buscarUsuariosXSuc(suc_id) {
    var usuario = $("#buscar_usuario").val();
    var suc = getSuc();
    //console.log(suc_id);
    if (suc_id != undefined) {
        suc = $("#" + suc_id).val();
    }
    $.ajax({
        type: "POST",
        url: "reportes/ReportesUI.class.php",
        data: { "action": "getUsuarios", usuario: usuario, suc: suc },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#usuario").html("");
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
        },
        success: function(data) {
            if (data.length > 0) {
                $("#usuario").append("<option value='%' data-img=''  >Todos</option>");
                for (var i in data) {
                    var usuario_ = data[i].usuario;
                    var nombre = data[i].nombre;
                    var apellido = data[i].apellido;
                    var tel = data[i].tel;
                    var imagen = data[i].imagen;
                    $("#usuario").append("<option value='" + usuario_ + "' data-img='" + imagen + "'  >" + usuario_ + "  -  " + nombre + " " + apellido + "</option>");
                }
                $("#msg").html("");
            } else {
                $("#msg").html("Sin resultados");
            }
        }
    });
}

// Busca clientes con ventas 
function buscarCliente(cod_cli_or_ruc) {
    
    $("#ventasCliDatosCli").empty();
    var RUC_CI_NOMBRE = $("#buscar_cliente").val();
    var param = { "action": "getCli", "search": RUC_CI_NOMBRE, "suc": getSuc() };
    $.post("reportes/ReportesUI.class.php", param, function(data) {
        $("select#cliente option.dinamic").remove();
        if (data.length > 0) {
            $.each(data, function(key, val) {
                var identif = val.ruc_cli;
                if(cod_cli_or_ruc == "codigo"){
                    identif = val.cod_cli;
                }
                $("<option/>", {
                    "class": "dinamic",
                    "value": identif,
                    "text": val.cliente,
                    "data-cat": val.cat
                }).appendTo("select#cliente");
            });

            $("#ventasCliMsg").html(data.length + (data.length > 1 ? ' registros encontrados!' : ' registro encontrado!'));
            $("select#cliente").val($($("select#cliente option").get(1)).val());
            updateCliData();
        } else {
            $("#ventasCliMsg").html("No se obtuvo resultados");
        }
    }, 'json');

}
// Busca clientes con ventas que compraron en un rango de fecha 
function buscarClienteXfecha(cod_cli_or_ruc) {
    var desde = $("#desde").val().split('/');
    var hasta = $("#hasta").val().split('/');
    $("#ventasCliDatosCli").empty();
    if(desde.length ==3 && hasta.length == 3){
        var RUC_CI_NOMBRE = $("#buscar_cliente").val();
        var param = { 
            "action": "getCli", 
            "search": RUC_CI_NOMBRE, 
            "suc": getSuc(),
            "desde" : desde[2]+'-'+desde[1]+'-'+desde[0],
            "hasta" : hasta[2]+'-'+hasta[1]+'-'+hasta[0],
            
        };
        $.post("reportes/ReportesUI.class.php", param, function(data) {
            $("select#cliente option.dinamic").remove();
            if (data.length > 0) {
                $.each(data, function(key, val) {
                    var identif = val.ruc_cli;
                    if(cod_cli_or_ruc == "codigo"){
                        identif = val.cod_cli;
                    }
                    $("<option/>", {
                        "class": "dinamic",
                        "value": identif,
                        "text": val.cliente,
                        "data-cat": val.cat
                    }).appendTo("select#cliente");
                });
    
                $("#ventasCliMsg").html(data.length + (data.length > 1 ? ' registros encontrados!' : ' registro encontrado!'));
                $("select#cliente").val($($("select#cliente option").get(1)).val());
                updateCliData();
            } else {
                $("#ventasCliMsg").html("No se obtuvo resultados");
            }
        }, 'json');
    }
}

function updateCliData() {
    $("#ventasCliDatosCli").empty();
    if ($("select#cliente option:selected").val() !== 'todos') { 
        $("<strong> RUC: </strong> <label>"+ $("select#cliente option:selected").val() + " </label>,   ").appendTo("#ventasCliDatosCli");
        $("<strong> Nombre: </strong> <label> "+ $("select#cliente option:selected").text() + " </label>,  ").appendTo("#ventasCliDatosCli"); 
        $("<strong> Cat: </strong> <label> "+ $("select#cliente option:selected").data("cat") + " </label> ").appendTo("#ventasCliDatosCli");         
    }
}

function imprimirEntregaCheques() {
    if (reporte !== undefined) {
        reporte.close();
    }
    var moneda = $("#moneda").val();
    var desde = $("#desde").val();
    var hasta = $("#hasta").val();
    var tipo = $("#tipo").val();
    reporte = window.open("reportes/ChequesTerceros.class.php?action=chequesTercerosEntrega&moneda=" + moneda + "&usuario=" + getNick() + "&desde=" + desde + "&hasta" + hasta + "&tipo=" + tipo, '_blank', 'width=1024,height=760');
}

function desmarcarTodos() {
    var c = confirm("Esta seguro que desea desmarcar todos?");
    if (c) {
        $.post("reportes/ChequesTerceros.class.php", "action=desmarcarTodos", function(data) {
            alert("Ok Todos los cheques han sido desmarcados...");
        });
    }
}

// Bancos Cuentas Movs 
function getCtasBancarias() {
    var id_banco = $("select#id_banco option:selected").val();
    var param = { "action": "getCtasBancarias", "id_banco": id_banco };
    $("option.cuenta").remove();
    $.post("reportes/ReportesUI.class.php", param, function(data) {
        $.each(data, function(key, value) {
            $("<option/>", {
                "class": "cuenta",
                "value": value.cuenta,
                "text": value.m_cod + ' ' + value.cuenta
            }).appendTo("select#cuentas");
        });
    }, "json");
}

// Buscar Articulos
function getArticulos() {
    var codigo_grupo = $("select#select_sector option:selected").val();
    $("option.articulo").remove();
    $.post("reportes/ReportesUI.class.php", { "action": "getArticulos", "codigo_grupo": codigo_grupo }, function(data) {
        $.each(data, function(key, value) {
            $("<option/>", {
                "class": "articulo",
                "value": key,
                "text": value
            }).appendTo("select#select_articulos");
        });
    }, "json");
}

// Verificacion de estado de los criterios en Reporte de Stock

function verifCrit() {
    var target = $("select#stockCrit option:selected").text();
    if (target === 'Entre') {
        $("#val2").removeAttr("disabled");
    } else {
        $("#val2").attr("disabled", "disabled");
    }
}
function verifCritTG(target) {
    var t = (target.attr("id")).split('_')[1];

    var trgt = target.val();
    if (trgt === 'Entre') {
      $("#val"+t+"_2").removeAttr("disabled");
    } else {
      $("#val"+t+"_2").attr("disabled", "disabled");
    }
  }
// Reporte de Stock

function iniRepStock() {    
    $('ul.estado_venta li').click(function() {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else { $(this).addClass('selected'); }
    });

    $("input[type='button'].select").click(function(){
        if($("ul.estado_venta").css("display") === 'none'){
            $("ul.estado_venta").show();
            $(this).val('Confirmar');
        }else{
            var selected = '';
            $("li.selected").each(function(){
                selected += ','+$(this).text();
            });
            $("#estado_venta").val(selected.replace(/^,/,''));
            $("ul.estado_venta").hide();
            $(this).val('Seleccionar');
        }
    });

}

function iniRepFraccionamiento(){
    $("#frac_pend").click(function(){
        var chq = $(this).is(":checked");
        if(chq){
            $(".rep_frac").fadeOut();
            $(".pend").fadeIn();
        }else{
            $(".rep_frac").fadeIn();
            $(".pend").fadeOut();
        }
    });
}

function cambiarURL(path){    
    $("#tipo").change(function(){ 
        var t = $(this).val();
        var url = path+"/reportes/"+t;         
        $("#filter_form").attr("action",url);  
    });   
}
function iniRepLogistica(){
    $("#suc_de").change(function(){ 
        $(".invisible").removeClass("invisible");
        var v = $(this).val();
        $("#suc_a option[value='"+v+"']").addClass("invisible");   
        var primero = $("#suc_a :not(.invisible)").first().val();
        $("#suc_a").val(primero); 
    });   
}
function initReporteFraccionamientoCompras(){
    var url = "reportes/FraccionamientosXCompra.class.php";
    $("#lote").change(function(){
        $("#datos_compra").html("");
        var lote = $(this).val();
        if(lote !== ""){
           var ref = $("#ref").val();
           var data = {"action":"getDatosCompra",lote:lote,ref:""};
           genericAjax(url,"msg",data,showRefData);  
        }
    });
    $("#ref").change(function(){
        $("#datos_compra").html("");
        var ref = $(this).val();
        if(ref !== ""){
           var ref = $("#ref").val();
           var data = {"action":"getDatosCompra",lote:"",ref:ref};
           genericAjax(url,"msg",data,showRefData);  
        }
    }); 
    
    function showRefData(data){
        if(data.length > 0){     
            var ref = data[0].Ref;
            $("#ref").val(ref);
            var cadena ="<b>Tipo:</b>"+data[0].Tipo+"<br>";
            cadena+="<b>Proveedor:</b>"+data[0].proveedor+"<br>";
            cadena+="<b>Factura/Invoice:</b>"+data[0].invoice+"<br>";
            
            cadena+="<b>Fecha Creacion:</b>"+data[0].fecha+"<br>";
            cadena+="<b>Fecha Factura:</b>"+data[0].fecha_fact+"<br>";
            cadena+="<b>Moneda:</b>"+data[0].moneda+"<br>";
            cadena+="<b>Procedencia:</b>"+data[0].origen+"<br>";     
            cadena+="<b>Pais Origen:</b>"+data[0].pais_origen+"<br>";            
            
            $("#datos_compra").html(cadena);
            
            console.log(data[0]);    
        }
    }
}