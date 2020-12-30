var nData = "";
$(function () {
     
    $(".list").click(function () {
        var user = $(this).attr('id');
        getUser(user);

    });
    $("#popUp").dialog({
        dialogClass:"ui-state-highlight",
        autoOpen: false,
        closeOnEscape: true,
        resizable: false,
        modal: true,
        width:'auto'
    });
    var menu3 = [
        {'Cambiar Contrase&ntilde;a':{
          onclick:function(menuItem,menu) { changePassw($(this).attr("id")); },	  
                title:'Cambiar Contrase&ntilde;a del usuario'
              }
        },
        {'Grupos':{
          onclick:function(menuItem,menu) { groups($(this).attr("id")); },
                title:'Cambiar grupos al que pertenece el usuario'
              }
        },
        {'Sucursales':{
          onclick:function(menuItem,menu) { sucs($(this).attr("id")); },
                title:'Cambiar sucursales a los que pertenece el usuario usuario'
              }
        }  
      ];
      $('#ajaxLoader').hide().ajaxStart( function() {
                $(this).show();
                console.log("Ajax Load");
            } ).ajaxStop ( function(){
                $(this).hide();
                console.log("Ajax Stop");
            });
   // $('.list').contextMenu(menu3,{shadow:false,className: 'contextMenu'});
});
//Busca la información de un usuario
function getUser(user) {
    $("#work_area").load("usuarios/UsersManager.php", {"action": "getPerfil", "user": user}, 
    function () {
        $("#estado").css("display", "none");
        var estado = $("#estado").val();
        var estados = ["Activo", "Inactivo"];
        var sl = "<select  disabled='disabled'>";
        for (var i in estados) {
            if (estados[i] === estado) {
                sl += "<option selected>" + estados[i] + "</option>";
            } else {
                sl += "<option>" + estados[i] + "</option>";
            }
        }
        sl += "</select>";
        $("#estado").parent("td").append(sl).change(
                function () {
                    activeSabe();
                    $("#estado").val($("option:selected").text());
                    $("#estado").attr("data-changed", "yes");
                });
        $("#doc").mask("999999?9999",{placeholder:""});
        $("#doc").change(function () {
            if (!validRUC(this.value)) {
                $(this).attr("data-err","si");
                $(this).next(".error").text("Caracteres Invalidos").css("color", "red");
            } else {
                $(this).attr("data-err","no");
                $(this).next(".error").text("Ok").css("color", "green");
            }
            activeSabe();
        });
        $("#nombre, #apellido").mask("***?**********************",{placeholder:""});
        $("#nombre, #apellido, #dir").change(function () {
            if (!validString(this.value)) {
                $(this).attr("data-err","si");
                $(this).next(".error").text("Caracteres Invalidos").css("color", "red");
            } else {
                $(this).attr("data-err","no");
                $(this).next(".error").text("Ok").css("color", "green");
            }
            activeSabe();
        });
        $("#email").change(function () {
            if (!validMail(this.value)) {
                $(this).attr("data-err","si");
                $(this).next(".error").text("Caracteres Invalidos").css("color", "red");
            } else {
                $(this).attr("data-err","no");
                $(this).next(".error").text("Ok").css("color", "green");
            }
            activeSabe();
        });
        $("#tel").mask("dddddd?ddddddd",{placeholder:""});
        $("#tel").change(function () {
            if (!validPhone(this.value)) {
                $(this).attr("data-err","si");
                $(this).next(".error").text("Caracteres Invalidos").css("color", "red");
            } else {
                $(this).attr("data-err","no");
                $(this).next(".error").text("Ok").css("color", "green");
            }
            activeSabe();
        });
        $("input[id^='fecha_']").mask("99/99/9999");
        $("input[id^='fecha_']").change(function () {
            if (!validDate(this.value).estado) {
                $(this).attr("data-err","si");
                $(this).next(".error").text("Fecha Invalida").css("color", "red");
            } else {
                $(this).attr("data-err","no");
                $(this).next(".error").text("Ok").css("color", "green");
            }
            activeSabe();
        });
         
        $("#suc").attr("disabled",true);    
        if($("#id_tipo").val()==""){
            $("#id_tipo").parent().parent().fadeOut();
        }
        $("#id_tipo").attr("disabled",true); 
        
        $("#limite_sesion").mask("99?99",{placeholder:""});
        $("#limite_sesion").change(function () {
            if (isNaN(this.value)) {
                $(this).attr("data-err","si");
                $(this).next(".error").text("Caracteres Invalidos").css("color", "red");
            } else {
                $(this).attr("data-err","no");
                $(this).next(".error").text("Ok").css("color", "green");                
            }
            activeSabe();            
        });
    });
}
function activeSabe(){
    var error = false;
    $("[data-err]").each(function(){if($(this).attr("data-err")==="si"){console.log("in");error = true;}});    
    if(!error){$("#action").removeAttr("disabled");console.log("ok");}else{$("#action").attr("disabled","");console.log("err");}
}
//accion boton volver
function volver(param) {
    var p = param || 0;
    if ($("#popUp").dialog("isOpen")) {
        $("#popUp").dialog("close");
    } else {
        
        if (p === 0) {
            showMenu();
        } else if (p === 1) {
            getUser($("#ch_usu").text());
        }
    }
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
// Actualiza la información de un usuario
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
            } else {
                data += id.attr("data-key") + '="' + id.val() + '",';
            }
        }
    }
    data = data.substr(0, data.lastIndexOf(','));
    $.post("usuarios/UsersManager.php", {"action": "updateUser", "data": data, "user": user}).done(function(){
        var w = $("#action").css("width");
        $("#action").val("OK!").css({color:"green",width:w});
        $("#action").fadeOut(1000,function(){
            $("#action").val("Guardar").css({color:"black"}).fadeIn("slow",function(){
                $("#action").attr("disabled",true);
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
    $("#popUp").load("usuarios/UsersManager.php", {"action": "newUser"},function(){
        $("#n_usuario").mask("uuu?uuuuuuuuuuuuu",{placeholder:""});
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
        $.post("usuarios/UsersManager.php", {action: "checkUser", usuario: usu}, function (data) {
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

    return {"estado": flag, "msj": err};
}
//Verifica la contraseña anterior
function checkOldPassw(pObjId) {
    var p1 = $("#" + pObjId).val();
    var usu = $("#ch_usu").text();
    $.post("usuarios/UsersManager.php", {action: "checkOldPassw", usuario: usu, passw: p1}, function (data) {
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
        if(p1.length<6){
            flag = false;
            err = "6 caracteres minimo!";
            $(".err_p").html(err);
        }else{
            $(".err_p").html('');
        }        
    } else {
        flag = false;
        err = "Las contrase&ntilde;as no son identicas";
        $(".err_p").html(err);
    }
    return {"estado": flag, "msj": err};
}
function checkValues() {
    if (checkUsu() && checkPassw("n_passw", "rp_passw").estado) {
        var user = $("#n_usuario").val();
        var password = $("#n_passw").val();
        $.post("usuarios/UsersManager.php", {action: "sigInUser", usuario: user, passw: password}, function (data) {
            if (data.exito === true) {
                $("#popUp").dialog("close");
                alert("El Usuario: " + user + "\r\nFue agregado Exitosamente a la Base de Datos");
            }
        }, "json");
    } else {

    }
}
// Chequea los valores para realizar el cambio de contraseña.
function checkValuesChPassw() {
    if (!checkOldPassw("o_passw") && checkPassw("chn_passw", "chrp_passw").estado) {
        var user = $("#ch_usu").text();
        var password = $("#chn_passw").val();
        $.post("usuarios/UsersManager.php", {action: "updatePassword", usuario: user, passw: password}, function (data) {
            if (data.exito === true) {
                alert("La contrase&ntilde;a fue modificada exitosamente");
            } else {
                alert("Error! " + data.msj);
            }
        }, "json");
    } else {
        alert("No");
    }

}
function bajaUser() {

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
    $("#popUp").load("usuarios/UsersManager.php", {"action": "changePassword", "usuario":usuario},function(){
        $("#popUp").dialog("open");
    });
}
function msj(id){
    $(".inf_msj").html($("#"+id).attr("title"));
}
//Obtine los grupos a los que pertenece un usuario dado
function groups(usu) {
    var usuario = usu || $("#usuario").text();
    $("#popUp").load("usuarios/UsersManager.php", {"action": "getGroups","usuario":usuario},function(){
        $("#popUp").dialog("open");
    });    
}
//Obtiene la sucurzal al que tertenece un usuario dado
function sucs(usu) {
    var usuario = usu || $("#usuario").text();
    $("#popUp").load("usuarios/UsersManager.php", {"action": "getSucs", "usuario":usuario,"usuario": usuario,"def_suc":$("#suc").val()},
    function(){
        $("#popUp").dialog("open");
    });
}
//Actualiza los grupos a los que pertenece un usuario
function saveG(num) {
    var usuario = $("#ch_usu").text();
    if (!$("#" + num).is(":checked")) {
        $.post("usuarios/UsersManager.php", {"action": "chGroup", "user": usuario, "group": num, "op": "d"});
    } else {
        $.post("usuarios/UsersManager.php", {"action": "chGroup", "user": usuario, "group": num, "op": "i"});
    }
}
//Actualiza las sucursales a los que pertenece un usuario
function saveSuc(num) {
    var usuario = $("#ch_usu").text();
    if (!$("#" + num).is(":checked")) {
        $.post("usuarios/UsersManager.php", {"action": "chSuc", "user": usuario, "suc": num, "op": "d"});
    } else {
        $.post("usuarios/UsersManager.php", {"action": "chSuc", "user": usuario, "suc": num, "op": "i"});
    }
}