
/**
 * 
 * @autor: Doglas A. Dembogurski Feix
 * Date: 04-02-2015
 */
var hashpos = 0;
var hash = "";
var touch = false; // true if device is touch
var isMobile = false; //initiate as false
var load_keyboard_script = false;
var show_passw = false;


$(document).ready(function () {

    $("#login_password").keyup(function (e) {
        if (e.keyCode == 13) {
            if ($(".login_button").attr("id") == "login_button") {
                dologin();
            } else {
                doRelogin();
            }            
        }
        if($(this).val().length > 2){
            $(".eye").fadeIn();
        }else{
            $(".eye").fadeOut();
        }
    });
    $("#login_usuario").keyup(function (e) {
        if (e.keyCode == 13) {
            var usuario = $("#login_usuario").val();
            if (usuario.indexOf("-") > 0) {
                $("#login_usuario").val(usuario.toString().substring(0, hashpos));
            }
            $("#login_usuario").css("color", "black");

            if ($(".login_button").attr("id") == "login_button") {
                dologin();
            } else {
                doRelogin();
            }
        }
    });     
    $(".eye").click(function(){
        if(!show_passw){
            $("#login_password").prop("type","text");            
            $(".eye").attr("src","img/open_eye.png");
            show_passw = true;
        }else{
            $("#login_password").prop("type","password"); 
            $(".eye").attr("src","img/closed_eye.png");
            show_passw = false;
        }
    });
    // Cerca de la Ventana
    var login_height = $(".login").position().top + $(".login").height() + 40;   
      
    $("#login_usuario").click(function(){
        if(touch){
            showKeyboard(this,dologin,0,login_height);
        }
    });
    $("#login_password").click(function(){   
        if(touch){
            showKeyboard(this,dologin,0,login_height);
        }
    });

    $("#login_usuario").focus();
    hashpos = 0;
    hash = "";
    if (is_touch_device() && !is_mobile() ) { // Touch but not Mobile        
        touch = true;        
        $("#toggle_touch").attr("src","img/keyboard_basic_green.png");
        if(!load_keyboard_script) { $.getScript('utils/keyboard.js'); }
    }else{
        touch = false; 
    }
     
});
// device detection
function is_mobile(){
   if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))){ isMobile = true; return true; }else{
    return false;
   }
}

function dologin() {
    var usuario = $("#login_usuario").val();
    var password = $("#login_password").val();
    if (hashpos > 0) {
        usuario += "-" + hash.trim();
    }

    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "login", "usuario": usuario, "password": password},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_login").html("<img src='img/activity.gif' width='46px' height='8px' >");
        },
        success: function (data) { // console.log(data);if(usuario == "douglas"){ alert(data);}
            if (data.estado == "Ok") {                
                $("#session").val(data.serial);
                $("#login_password").val("");
                $("#sucursal").val(data.suc);
                var db_user = data.usuario;  // Tiene que ser como esta en la base de datos
                $("#login_usuario").val(db_user);
                setCookie(db_user, data.serial, 10);
                setCookie('suc_' + db_user, data.suc, 10);
                setCookie('expira_' + db_user, data.expira, 10);
                setCookie('logInTime_' + db_user, new Date(), 10);
                document.loginform.submit();
            } else {
                $("#msg_login").addClass("msg_err");
                $("#login_password").select();
                hashpos = 0;
                hash = "";
                $("#msg_login").html("Usuario o contrase&ntilde;a incorrecta.");                
                $( ".login input[type=text], input[type=password]" ).effect( "shake" );
            }
        },
        error: function (x, status, error) {
            $("#msg_login").addClass("msg_err");
            $("#msg_login").html("Error en la comunicacion con el servidor:  " + status+ "<br>  "+error);
        }
    });
}
/**
 * Vuelve a activar una sesion del mismo dia o redirecciona al index.php
 * 
 */
function doRelogin() {
    var usuario = $("#login_usuario").val();
    var password = $("#login_password").val();
    var session = getCookie($("#nick").html()).sesion;
    var expira = getCookie($("#nick").html()).expira;
     
    if (hashpos > 0) {
        usuario += "-" + hash.trim();
    }

    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "reLogin", "usuario": usuario, "password": password, "session": session, "expira": expira},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_login").html("<img src='img/activity.gif' width='46px' height='8px'  >");
        },
        success: function (data) {
            if (data.estado == "Ok") {
                var db_user = data.usuario;
                var expira = data.expira;
                setCookie('expira_' + db_user, expira, 2);
                setCookie('logInTime_' + db_user, new Date(), 2);
                lastInteract();
                checkSession();
                $("#relogin").remove();
                $(".header").css("z-index", "1");
                $("#back_arrow").fadeIn("slow");
                $("#msg_login").html("");
            } else if (data.estado == "error") {
                $("#msg_login").addClass("msg_err");
                $("#msg_login").html("Usuario o contrase&ntilde;a incorrecta.");
            } else {
                redirectToLogin();
            }
        },
        error: function (e) {
            $("#msg_login").addClass("msg_err");
            $("#msg_login").html("Error en la comunicacion con el servidor:  " + e.message);
        }
    });
}
function toggleTouch(){
    touch = !touch;
    if(touch){
        $("#toggle_touch").attr("src","img/keyboard_basic_green.png");   
        if(!load_keyboard_script) { $.getScript('utils/keyboard.js'); }
    }else{
        hideKeyboard();
        $("#toggle_touch").attr("src","img/keyboard_basic_red-disabled.png");
    }    
} 
function is_touch_device() {
   return (('ontouchstart' in window)  || (navigator.MaxTouchPoints > 0)   || (navigator.msMaxTouchPoints > 0));
}

function validar(e) {
    var k = (document.all) ? e.keyCode : e.which;
    var caracter = String.fromCharCode(k);

    //console.log( hash+ "   "+  String.fromCharCode(k) +"   "+k);

    var usuario = $("#login_usuario").val();

    if (usuario.indexOf("-") > 0 ) {
        $("#login_usuario").css("color", "white");
        if (caracter != " ") {
            hash = hash + "" + caracter;
        }
    }

    if (k == 32) {
        hashpos = usuario.length;
        $("#login_usuario").val(usuario + "-");
        e.keyCode = 0;
        return false;
    }
}
function userBlur(){
    if(is_mobile()){  
        var usuario = $("#login_usuario").val(); 
        var pos = usuario.indexOf(" ");          
        if (pos > 0 ) {
            $("#login_usuario").css("color", "white");
            hashpos = usuario.indexOf(" ");
            hash = usuario.substring(hashpos,100);
            $("#login_usuario").val($("#login_usuario").val().replace(" ","-")); 
            dologin();
        }    
    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();     
    document.cookie = cname + "=" + cvalue + "; " + expires;
     
}

