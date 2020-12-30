
/**
 * 
 * @autor: Doglas A. Dembogurski Feix
 * Date: 09-02-2015
 */

var sessionChecker;
var checkInterval = 5;
var hours,min,seg = 0;
var clock = 0;
var touch = false; // true if device is touch
var is_mobile = false;

$(function () {
    var suc = getCookie($("#nick").html()).suc;
    var user = $("#nick").html();

    $("body").append("<span class='clock'></span>");
    countDownClock(getCookie($("#nick").html()).expira);
    $(document).click(function () {
        lastInteract(); 
    });
    sessionChecker = setInterval("checkSession()", (checkInterval * 60 * 1000));
    $("#sucursales").change(function(){
       changeSucTo($("#sucursales option:selected").val());
       showMenu(); // Obligarle a que actualice lo que estaba haciendo
    });
    lastInteract();
    statusInfo();
    if (is_touch_device()) {
        touch = true;
        // Cargar aqui librerias para Touch
    }else{
        touch = false; 
    }  
    is_mobile =  JSON.parse($("#is_mobile").val());
    setTimeout("checkAvatar()",1000);  
    $(window).focus(function() {  
        if($("#sucursales option:selected").val() != getSuc()){
            setTimeout("informarCambioSuc()",200);
        }
    });
});
function informarCambioSuc(){
    var suc_ant = $("#sucursales option:selected").val();      
    var suc_act = getSuc();    
    if(suc_ant !== undefined){
        errorMsg("CUIDADO! Te has cambiado de "+suc_ant+" a "+suc_act+" en otra pesta&ntildea!!!",15000);
        changeSucTo(getSuc());
    }
}

function checkAvatar(){         
    $.post('Ajax.class.php', {"action": "getAvatar",usuario:getNick()}, function (data) {
        if(data == "false"){
           $("#avatar").css("background-image","url('img/usuarios/no_image.jpg')")
        } 
        $(".avatar").css("display","inline-block");
    }); 
}
function avatarClick(){
    $("#logOut").fadeIn(); 
    setTimeout(function(){ 
       $("#logOut").fadeOut("slow",function(){
           $("#logOut").css("margin","0.3cm 0 0 1cm"); 
       });
    },6000);
}

function is_touch_device() {
   return (('ontouchstart' in window)  || (navigator.MaxTouchPoints > 0)   || (navigator.msMaxTouchPoints > 0));
}

/*
 * Function to redirecto to the login
 */
function redirectToLogin() {
    window.location.href = "index.php";
}

/**
 * 
 * Verifica es estado de la sesion
 */
function checkSession() {
    var usuData =  getCookie($("#nick").html());
    var ahora = new Date();
    var fechaExpiracion = new Date(new Date(usuData.tiempoInicio).getTime() + (usuData.expira * 60 * 1000)); 

    if ((fechaExpiracion.getTime() - ahora.getTime()) > 0) {
        if (Math.floor((parseInt(new Date().getTime()) - parseInt($("body").data("lastInteract"))) / 1000 / 60) < checkInterval) {
            $.post('Ajax.class.php', {"action": "updateSession", "usuario": getNick(), "session": usuData.sesion, "expira": usuData.expira});
            countDownClock(getCookie($("#nick").html()).expira);
            document.cookie = "logInTime_" + getNick() + "=" + ahora + ";" + 2;
        }
    } else {
        if ($("#relogin").length === 0) {
            if(getSuc()== undefined){
                redirectToLogin();
            }else{
                relogin();
            }
        }
    }
}
//Guarda un log con la fecha en milisegundos.
function lastInteract() {
    var now = new Date().getTime();
    $("body").data("lastInteract", now); 
}
//Cierra la sesion
function logOut() {
    var usuData = getCookie($("#nick").html());
    $.post('Ajax.class.php', {"action": "closeSession", "usuario": usuData.usuario, "session": usuData.sesion}, function (data) {
        if (data.estado === 'Exito')
            redirectToLogin();
    }, 'json');
}
function getTimeStamp() {
    var now = new Date();
    return ((now.getDate()) + '-' + (((now.getMonth() + 1) < 10) ? ("0" + (now.getMonth() + 1)) : (now.getMonth() + 1)) + '-' +
            now.getFullYear() + " " +
            now.getHours() + ':' +
            ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' +
            ((now.getSeconds() < 10) ? ("0" + now.getSeconds()) : (now.getSeconds())));
}
//Carga el formulario de para inicio de sesion en el main
function relogin() {    
    var usuData = getCookie($("#nick").html());    
    $(".header").css("z-index", "-1");
    $("#back_arrow").fadeOut("slow");
    $(".relogin_div").remove(); //Quitar si ya hay una
    $("body").append($("<div id='relogin' class='relogin_div' style='z-index:1000'></div>").load("index.php?relogin=true&usuario="+getNick()));
     
    $.post('Ajax.class.php', {"action": "closeSession", "usuario": usuData.usuario, "session": usuData.sesion});
    setTimeout("$('.msg').html(getTimeStamp())", 2000);   
}
//Muesta informacion en una barra de estado
function statusInfo() {
     var close = null;
     var status = "";
     var inf = "";
    $("*[data-info]").hover(function () {       
        inf = $(this).attr("data-info");   
        if(status === inf){
            close = setTimeout(function(){$("#status").fadeOut("slow");},3000);            
        }
        if (inf !== "" && status !== inf) {
            $("#status").show();
            $("#status").text(inf);
            status = inf;
            clearTimeout(close);
        }
    });
     $("*[data-info]").click(function () { 
          close = setTimeout(function(){$("#status").fadeOut("slow");},3000);
     });
}
function errorMsg(error,time){ 
    $("#status").html(error);  
    $("#status").css("background","red");
    $("#status").css("color","white"); 
    $("#status").show();
    setTimeout(function(){$("#status").fadeOut("slow",function(){
       $("#status").css("background","yellow");
       $("#status").css("color","black")     
    });},time);    
}
function infoMsg(info,time){
    $("#status").html(info);    
    $("#status").css("background","#3366ff");
    $("#status").css("color","white");
    $("#status").show();
    setTimeout(function(){$("#status").fadeOut("slow",function(){
       $("#status").css("background","yellow");
       $("#status").css("color","black")     
    });},time);   
}

function changeSucTo(suc){  
    if(suc != undefined){
        var usuario =$("#nick").text(); 
        var help =  $("#sucursal").attr("title").replace(/\d{2}$/,suc);
        $("#sucursal").attr("title",help);
        $("#sucursal").attr("data-info",help);
        $("#sucursal").text("("+suc+")");    
        document.cookie = "suc_"+usuario+"="+suc;
        $("#sucursales").val(getSuc());
        $.post("usuarios/UsersManager.php",{"action":"updateUser","data":"suc='"+suc+"'","user":usuario},function(){
            sucIdentity(suc);
        });
    }
}

function sucIdentity(suc){
    var corp = /00|03/;
    var corpUsers = /pablinos|saide|juliom/i;
    var title = '';
    var emp = '';
    if (suc == '30') {
        title = 'La Retaceria';
        emp = 'LA RETACERIA';
    }else if(corp.test(suc) || corpUsers.test(getNick())){
        title = emp = 'CORPORACION TEXTIL S.A.';
    }else{
        title = 'Marijoa Tejidos';
        emp = 'MARIJOA';
    }
    $("title").text(title);
    $(".emp").text(emp);
}

function countDownClock(minutes){
  if(clock>0)clearInterval(clock);
  hours = (minutes>59)?(minutes/60).toFixed(0):0;
  min = minutes-hours*60;
  seg = 0;
  startCountDown();
}

function startCountDown(){
  var strH,strM,strS = "";  
  clock = setInterval(function(){
    if(seg==0){seg = 59;if(min==0&&hours>0){min = 59;hours--;}else{min--;}}else{seg--;}
    if(!(hours+min+seg)){clearInterval(clock);}
    strH = (hours>9)?hours:"0"+hours;
    strM = (min>9)?min:"0"+min;
    strS = (seg>9)?seg:"0"+seg;
    $(".clock").html(strH+":"+strM+"."+strS);    
  },1000);
}
