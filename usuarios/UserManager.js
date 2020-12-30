var nData = "";


function configurar() {}

$(document).ready(function() {
    // dynamicSearch();  
    /*  
    $(".list").click(function() {
        var user = $(this).attr('id');
        getUser(user);

    });*/
    updateList();
    $("#popUp").dialog({
        dialogClass: "ui-state-highlight",
        autoOpen: false,
        closeOnEscape: true,
        resizable: false,
        modal: true,
        draggable: false,
        width: 'auto'
    });
    var menu3 = [{
            'Cambiar Contrase&ntilde;a': {
                onclick: function(menuItem, menu) { changePassw($(this).attr("id")); },
                title: 'Cambiar Contrase&ntilde;a del usuario'
            }
        },
        {
            'Grupos': {
                onclick: function(menuItem, menu) { groups($(this).attr("id")); },
                title: 'Cambiar grupos al que pertenece el usuario'
            }
        },
        {
            'Sucursales': {
                onclick: function(menuItem, menu) { sucs($(this).attr("id")); },
                title: 'Cambiar sucursales a los que pertenece el usuario usuario'
            }
        }
    ];
    $('#ajaxLoader').hide().ajaxStart(function() {
        $(this).show();
        console.log("Ajax Load");
    }).ajaxStop(function() {
        $(this).hide();
        console.log("Ajax Stop");
    });
    // $('.list').contextMenu(menu3,{shadow:false,className: 'contextMenu'});
    if (Storage.filtro_suc !== undefined) {
        $("select#filtro_suc").val(Storage.filtro_suc);
        $("input#filtro_usuario").val(Storage.filtro_usuario);
        $("select#filtro_criterio").val(Storage.filtro_criterio);
        $("input#filtro_estado").prop('checked', Storage.filtro_estado);
        updateList();
        dynamicSearch();
    } else {
        if (typeof(Storage) !== "undefined") {

            $("[id^='filtro_']").each(function() {
                if ($(this).attr('id') === 'filtro_estado') {
                    Storage['def_' + $(this).attr('id')] = $("#filtro_estado").is(":checked");
                } else {
                    Storage['def_' + $(this).attr('id')] = $(this).val();
                }
            });
        }
    }
});

function validDOC(doc) {
    var pattern = /^[0-9]+$/;
    return (pattern.test(doc));
}

//Busca la informaci�n de un usuario
function getUser(user) {
    setFiltros();

    $("#work_area").load("usuarios/UsersManager.php", { "action": "getUser", "user": user },
        function() {
            $("#estado").css("display", "none");
            var estado = $("#estado").val();
            var estados = ["Activo", "Inactivo"];
            var sl = $("<select/>", {
                "id": "select_estado",
                "change": function() {
                    activeSabe();
                    $("#estado").val($("#select_estado option:selected").text());
                    $("#estado").attr("data-changed", "yes");
                }
            });
            for (var i in estados) {
                if (estados[i] === estado) {
                    $("<option/>", { "text": estados[i], "selected": "selected" }).appendTo(sl);
                } else {
                    $("<option/>", { "text": estados[i] }).appendTo(sl);
                }
            }

            $("#estado").parent("td").append(sl);
            $("#doc").mask("999999?9999", { placeholder: "" });
            $("#doc").change(function() {
                if (!validDOC(this.value)) {
                    $(this).attr("data-err", "si");
                    $(this).next(".error").text("Caracteres Invalidos").css("color", "red");
                } else {
                    $(this).attr("data-err", "no");
                    $(this).next(".error").text("Ok").css("color", "green");
                }
                activeSabe();
            });
            $("#nombre, #apellido").mask("***?**********************", { placeholder: "" });
            $("#nombre, #apellido, #dir").change(function() {
                if (!validString(this.value)) {
                    $(this).attr("data-err", "si");
                    $(this).next(".error").text("Caracteres Invalidos").css("color", "red");
                } else {
                    $(this).attr("data-err", "no");
                    $(this).next(".error").text("Ok").css("color", "green");
                }
                activeSabe();
            });
            $("#email").change(function() {
                if (!validMail(this.value)) {
                    $(this).attr("data-err", "si");
                    $(this).next(".error").text("Caracteres Invalidos").css("color", "red");
                } else {
                    $(this).attr("data-err", "no");
                    $(this).next(".error").text("Ok").css("color", "green");
                }
                activeSabe();
            });
            $("#tel").mask("dddddd?ddddddd", { placeholder: "" });
            $("#tel").change(function() {
                if (!validPhone(this.value)) {
                    $(this).attr("data-err", "si");
                    $(this).next(".error").text("Caracteres Invalidos").css("color", "red");
                } else {
                    $(this).attr("data-err", "no");
                    $(this).next(".error").text("Ok").css("color", "green");
                }
                activeSabe();
            });
            $("input[id^='fecha_']").mask("99/99/9999");
            $("input[id^='fecha_']").change(function() {
                if (!validDate(this.value).estado) {
                    $(this).attr("data-err", "si");
                    $(this).next(".error").text("Fecha Invalida").css("color", "red");
                } else {
                    $(this).attr("data-err", "no");
                    $(this).next(".error").text("Ok").css("color", "green");
                }
                activeSabe();
            });
            $("input#sueldo_fijo, input#sueldo_contable").val(function(){return (parseFloat($(this).val()).format(2, 3, '.', ','));});
            $("input#sueldo_fijo, input#sueldo_contable").focusout(function(){$(this).val(parseFloat($(this).val()).format(2, 3, '.', ','));});
            
            $("input#sueldo_fijo, input#sueldo_contable").click(function() {
                var clearNum = ($(this).val()).replace(/\./g, '').replace(',', '.');
                $(this).val(clearNum);
            });
            $("input#sueldo_fijo, input#sueldo_contable").change(function() {
                var validar = /^[0-9]{6,9}\.?[0-9]{0,2}$/;
                var valor = $(this).val();
                if (validar.exec(valor) === null) {
                    $(this).attr("data-err", "si");
                    $(this).next(".error").text("Valor Invalida").css("color", "red");
                } else {
                    $(this).attr("data-err", "no");
                    $(this).next(".error").text("Ok").css("color", "green");
                }
                activeSabe();
            });
            $.post("usuarios/UsersManager.php", { "action": "getSucsAll" }, function(data) {
                $("#suc").parent().append("<select id='suc_select'>");

                $.each(data, function(key, value) {
                    if (value === $("#suc").val()) {
                        $("#suc_select").append("<option selected value='" + value + "'> " + key + "</option>");
                    } else {
                        $("#suc_select").append("<option value='" + value + "'>" + key + "</option>");
                    }
                });
                $("#suc_select").change(function() {
                    $("#suc").val($("#suc_select option:selected").val());
                    activeSabe();
                    verif("suc");
                });
            }, "json");

            $("#suc").attr("disabled", true);
            $("#id_tipo").attr("disabled", true);

            $.post("usuarios/UsersManager.php", { "action": "getTipoVendedor" }, function(data) {
                $("#id_tipo").parent().append("<select id='tipo_vend'>");
                $("#tipo_vend").append("<option selected value='NV'>No es Vendedor</option>");
                $.each(data, function(key, value) {
                    if (value === $("#id_tipo").val()) {
                        $("#tipo_vend").append("<option selected value='" + key + "'> " + value + "</option>");
                    } else {
                        $("#tipo_vend").append("<option value='" + key + "'>" + value + "</option>");
                    }
                });
                $("#tipo_vend").change(function() {
                    $("#id_tipo").val($("#tipo_vend option:selected").val());
                    activeSabe();
                    verif("id_tipo");
                    checkTipo();
                });
                $("#id_tipo").parent().append("<input id='metas' type='button' value='...' title='metas' onclick='getMetas()' style='display:none'>");
                checkTipo();
                $("#tipo_vend").val($("#id_tipo").val());

            }, "json");


            $("#limite_sesion").mask("99?99", { placeholder: "" });
            $("#limite_sesion").change(function() {
                if (isNaN(this.value)) {
                    $(this).attr("data-err", "si");
                    $(this).next(".error").text("Caracteres Invalidos").css("color", "red");
                } else {
                    $(this).attr("data-err", "no");
                    $(this).next(".error").text("Ok").css("color", "green");
                }
                activeSabe();
            });
        });
        
}

function checkTipo() {
    var tipo = $("#id_tipo").val();
    if (tipo != "") {
        $("#metas").fadeIn();
    } else {
        $("#metas").fadeOut();
    }
}

function getMetas() {
    var usuario = $("#usuario").text();
    $("#popUp").load("usuarios/UsersManager.php", { "action": "getMetas", "usuario": usuario }, function() {
        $("#popUp").dialog("open");
        $(".metas").change(function() {
            var v = $(this).val();
            if (isNaN(v)) {
                $(this).val("0");
            } else {
                v = parseFloat(v).format(0, 3, '.', ',');
                $(this).val(v);
                var id = $(this).parent().parent().attr("id");
                saveMeta(id);
            }
        });
        $(".porc").change(function() {
            var meta = parseFloat($(this).parent().parent().find(".meta_base").val().replace(/\./g, ''));
            var porc = $(this).val();
            var min = parseFloat((meta * porc) / 100).format(0, 3, '.', ',');;
            $(this).parent().next().children().val(min);
        });
        $(".meta_base").change(function() {
            var porc = parseFloat($(this).parent().parent().find(".porc").val());
            var meta = parseFloat($(this).val().replace(/\./g, ''));
            var min = parseFloat((meta * porc) / 100).format(0, 3, '.', ',');;
            $(this).parent().parent().find(".meta_min").val(min);
        });

    });
}

function activeSabe() {
    var error = false;
    $("[data-err]").each(function() {
        if ($(this).attr("data-err") === "si") {
            console.log("in");
            error = true;
        }
    });
    if (!error) {
        $("#action").removeAttr("disabled");
        console.log("ok");
    } else {
        $("#action").attr("disabled", "");
        console.log("err");
    }
}
//accion boton volver
function volver(param) {
    var p = param || 0;
    if ($("#popUp").dialog("isOpen")) {
        $("#popUp").dialog("close");
    } else {
        if (p === 0) {
            $("#work_area").load("usuarios/UsersManager.php");
        } else if (p === 1) {
            getUser($("#ch_usu").text());
        }
    }

}
// Carga lista de empleados
function updateList() {

    $("#lista tbody").empty();
    var fSuc = $("#filtro_suc option:selected").val();
    var estado = $("#filtro_estado").is(":checked");

    var e1 = 'Activo';
    var e2 = 'Inactivo';

    if (estado) {
        e1 = 'Activo';
        e2 = 'Activo';
    } else {
        e1 = 'Activo';
        e2 = 'Inactivo';
    }

    for (user in users) {
        var tr = $("<tr/>", {
            "id": users[user].usuario,
            "class": "list",
            "onclick": "getUser('" + users[user].usuario + "')"
        });
        for (data in users[user]) {
            if (fSuc === '%' && (users[user].estado == e1 || users[user].estado == e2)) {
                $("<td/>", {
                    "class": data,
                    "text": users[user][data]
                }).appendTo(tr);
            } else if (users[user].suc === fSuc && (users[user].estado == e1 || users[user].estado == e2)) {
                $("<td/>", {
                    "class": data,
                    "text": users[user][data]
                }).appendTo(tr);
            }
        }
        $("#lista tbody").append(tr);
    }
    dynamicSearch();
}

//verifica si hubo un cambio 
function verif(dataId) {
    var data = $("#" + dataId);
    if (data.val() === nData) {
        data.attr("data-changed", "no");
        //$("#action").attr("disabled", true);
    } else {
        data.attr("data-changed", "yes");
        //$("#action").removeAttr("disabled");
    }
}
// Actualiza la informaci�n de un usuario
function updateUser() {
    var modded = $("input[data-changed*='yes']");
    var user = $("#usuario").text();
    var id = "";
    var data = "";
    for (var i in modded) {
        var id = $("#" + modded[i].id);
        if (id.val()) {
            if (id.attr("data-key") === "fecha_nac" || id.attr("data-key") === "fecha_cont") {
                data += id.attr("data-key") + '="' + flipDate(id.val(), '/', '-') + '",';
            } else if (id.attr("data-key") === "sueldo_fijo" || id.attr("data-key") === "sueldo_contable") {
                data += id.attr("data-key") + '="' + id.val().replace(/\./g, '').replace(',', '.') + '",';
            } else {
                data += id.attr("data-key") + '="' + id.val() + '",';
            }
        }
    }
    data = data.substr(0, data.lastIndexOf(','));
    $.post("usuarios/UsersManager.php", { "action": "updateUser", "data": data, "user": user }).done(function() {
        var w = $("#action").css("width");
        $("#action").val("OK!").css({ color: "green", width: w });
        $("#action").fadeOut(1000, function() {
            $("#action").val("Guardar").css({ color: "black" }).fadeIn("slow", function() {
                $("#action").attr("disabled", true);
            });
        });
    });
    return true;
}
/**
 * Genera un formulario para un nuevo usuario
 * por defecto deja la fecha de nacimiento y de ocntratacion en 0000-00-00
 * estdo = Activo
 * */
function newUser() {
    $("#popUp").load("usuarios/UsersManager.php", { "action": "newUser" }, function() {
        $("#n_usuario").mask("uuu?uuuuuuuuuuuuu", { placeholder: "" });
        $("#popUp").dialog("open");
    });
}
//Verifica si un usuario ya existe en la base de datos
function checkUsu() {
    var usu = $("#n_usuario").val();
    var flag = true;
    var err = "";
    var strL = usu.replace(/\s/g, "").length;
    if (strL < 3) {
        flag = false;
        if (strL === 0) {
            err = "Debe escribir un nombre";
        } else {
            err = "Nombre menor de 3 caracteres";
        }
        $(".err_u").text(err);
        $("#n_user_b").attr("disabled", true);
    } else {
        $.post("usuarios/UsersManager.php", { action: "checkUser", usuario: usu }, function(data) {
            if (data.existe) {
                flag = false;
                err = "El usuario ya existe en la base de datos";
                $(".err_u").text(err);
                $("#n_user_b").attr("disabled", true);
            } else {
                $(".err_u").text('');
                $("#n_user_b").removeAttr("disabled");
            }
        }, "json");
    }

    return { "estado": flag, "msj": err };
}
//Verifica la contrase�a anterior
function checkOldPassw(pObjId) {
    var p1 = $("#" + pObjId).val();
    var usu = $("#ch_usu").text();
    $.post("usuarios/UsersManager.php", { action: "checkOldPassw", usuario: usu, passw: p1 }, function(data) {
        if (data.estado === false) {
            $("#chp").attr("disabled", "true");
            $(".err_op").html("Contrase&ntilde;a incorrecta").css("color", "red");
        } else {
            $(".err_op").html("Ok").css("color", "green");
            $("#chp").removeAttr("disabled");
        }
    }, "json");
}

function checkPassw(passw1, passw2) {
    var p1 = $("#" + passw1).val();
    var p2 = $("#" + passw2).val();
    var flag = true;
    var err = "";
    if (p1 === p2) {
        if (p1.length < 6) {
            flag = false;
            err = "6 caracteres minimo!";
            $(".err_p").html(err);
        } else {
            $(".err_p").html('');
        }
    } else {
        flag = false;
        err = "Las contrase&ntilde;as no son identicas";
        $(".err_p").html(err);
    }
    return { "estado": flag, "msj": err };
}

function checkValues() {
    if (checkUsu() && checkPassw("n_passw", "rp_passw").estado) {
        var user = $("#n_usuario").val();
        var password = $("#n_passw").val();
        $.post("usuarios/UsersManager.php", { action: "sigInUser", usuario: user, passw: password }, function(data) {
            if (data.exito === true) {
                $("#popUp").dialog("close");
                alert("El Usuario: " + user + "\r\nFue agregado Exitosamente a la Base de Datos");
            }
        }, "json");
    } else {

    }
}
// Chequea los valores para realizar el cambio de contrase�a.
function checkValuesChPassw() {
    if (!checkOldPassw("o_passw") && checkPassw("chn_passw", "chrp_passw").estado) {
        var user = $("#ch_usu").text();
        var password = $("#chn_passw").val();
        $.post("usuarios/UsersManager.php", { action: "updatePassword", usuario: user, passw: password }, function(data) {
            if (data.exito === true) {
                alert("La contrase�a fue modificada exitosamente");
            } else {
                alert("Error! " + data.msj);
            }
        }, "json");
    } else {
        alert("No");
    }

}

function resetPassw() {
    var user = $("#ch_usu").text();
    var password = 'inmopy';
    $.post("usuarios/UsersManager.php", { action: "updatePassword", usuario: user, passw: password }, function(data) {
        if (data.exito === true) {
            alert("La contraseña fue modificada exitosamente");
        } else {
            alert("Error! " + data.msj);
        }
    }, "json");
}

function bajaUser() {

}
/**
 * Busqueda dinamica para la tabla de usuarios visible en pantalla.
 */
function dynamicSearch() {

    if ($("#filtro_criterio").length > 0) {
        var criterio = $("#filtro_criterio option:selected").text().toLowerCase();
        $("." + criterio).each(function() {
            var filtro = new RegExp($("#filtro_usuario").val(), "i");
            var actual = $(this);
            if (actual.text().toLowerCase().search(filtro) > -1) {
                //actual.attr("style","color:red");
                actual.parent().fadeIn();
            } else {
                //actual.attr("style","color:black");
                actual.parent().fadeOut();
            }
        });
    }
}
/**
 * 
 * @param {String} date fecha 
 * @param {Char} sp carracter separador
 * @returns {flipDate.flip|String}
 */
function flipDate(date, sp, spr) {
    var separador = sp || '-';
    var sp_retorno = spr || '-';
    var flip = date.split(sp);
    return flip[2] + sp_retorno + flip[1] + sp_retorno + flip[0];
}
//Cambio de password de un usuario dado
function changePassw(usu) {
    var usuario = usu || $("#usuario").text();
    $("#popUp").load("usuarios/UsersManager.php", { "action": "changePassword","usuario_pri":getNick(), "usuario": usuario }, function() {
        $("#popUp").dialog("open");
    });
}

function msj(id) {
    $(".inf_msj").html($("#" + id).attr("title"));
}
//Obtine los grupos a los que pertenece un usuario dado
function groups(usu) {
    var usuario = usu || $("#usuario").text();
    $("#popUp").load("usuarios/UsersManager.php", { "action": "getGroups", "usuario": usuario }, function() {
        $("#popUp").dialog("open");
    });
}
//Obtiene la sucurzal al que tertenece un usuario dado
function sucs(usu) {
    var usuario = usu || $("#usuario").text();
    $("#popUp").load("usuarios/UsersManager.php", { "action": "getSucs", "usuario": usuario, "usuario": usuario, "def_suc": $("#suc").val() },
        function() {
            $("#popUp").dialog("open");
        });
}
//Actualiza los grupos a los que pertenece un usuario
function saveG(num) {
    var usuario = $("#ch_usu").text();
    if (!$("#" + num).is(":checked")) {
        $.post("usuarios/UsersManager.php", { "action": "chGroup", "user": usuario, "group": num, "op": "d" });
    } else {
        $.post("usuarios/UsersManager.php", { "action": "chGroup", "user": usuario, "group": num, "op": "i" });
    }
}
//Actualiza las sucursales a los que pertenece un usuario
function saveSuc(num) {
    var usuario = $("#ch_usu").text();
    if (!$("#" + num).is(":checked")) {
        $.post("usuarios/UsersManager.php", { "action": "chSuc", "user": usuario, "suc": num, "op": "d" });
    } else {
        $.post("usuarios/UsersManager.php", { "action": "chSuc", "user": usuario, "suc": num, "op": "i" });
    }
}

function delRow() {
    var filas = $(".fila").length;
    var usuario = $("#usuario").text();
    $.post("usuarios/UsersManager.php", { "action": "delMeta", id_meta: filas, "usuario": usuario }, function() {
        getMetas();
    });
}

function addRow() {
    var usuario = $("#usuario").text();
    var filas = $(".fila").length;
    id_meta = filas + 1;
    $.post("usuarios/UsersManager.php", { "action": "addMeta", id_meta: id_meta, "usuario": usuario, meta_base: 0, sueldo_base: 0, meta_min: 0, pond: 90 }, function() {
        getMetas();
    });
}

function saveMeta(id) {
    var id_meta = parseInt(id.substring(5, 20));
    var usuario = $("#usuario").text();
    var meta_base = parseFloat($("#" + id).find(".meta_base").val().replace(/\./g, ''));
    var sueldo_base = parseFloat($("#" + id).find(".sueldo_base").val().replace(/\./g, ''));
    var meta_min = parseFloat($("#" + id).find(".meta_min").val().replace(/\./g, ''));
    var pond = parseFloat($("#" + id).find(".pond").val().replace(/\./g, ''));

    if (isNaN(meta_base) || isNaN(sueldo_base) || isNaN(meta_min) || isNaN(pond)) {
        errorMsg("Existen datos incorrectos");
    } else {
        $.post("usuarios/UsersManager.php", { "action": "saveMeta", id_meta: id_meta, "usuario": usuario, meta_base: meta_base, sueldo_base: sueldo_base, meta_min: meta_min, pond: pond });
    }
}

function setFiltros() {
    if (typeof(Storage) !== "undefined") {
        $("[id^='filtro_']").each(function() {
            if ($(this).attr('id') === 'filtro_estado') {
                Storage[$(this).attr('id')] = $("#filtro_estado").is(":checked");
            } else {
                Storage[$(this).attr('id')] = $(this).val();
            }
        });
    }
}

function limpiarFiltros() {
    if (Storage.def_filtro_suc !== undefined) {
        $("select#filtro_suc").val(Storage.def_filtro_suc);
        $("input#filtro_usuario").val(Storage.def_filtro_usuario);
        $("select#filtro_criterio").val(Storage.def_filtro_criterio);
        $("input#filtro_estado").prop('checked', Storage.def_filtro_estado);
        updateList();
        dynamicSearch();
        setFiltros();
    }
}