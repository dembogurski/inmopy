var hoy = new Date;
var dia = hoy.getDate()<10?"0"+hoy.getDate():hoy.getDate();
var mes = (hoy.getMonth()+1)<10?"0"+(hoy.getMonth()+1):(hoy.getMonth()+1);
var anio = hoy.getFullYear();
var fecha_hoy = dia+"/"+mes+"/"+anio;
var fecha_serv = "";


function configurar(){
  fecha_serv = $("#_fecha_").val();
  $("#fecha").val(fecha_hoy);
  $("#desde").mask("99/99/2099");     
  $("#hasta").mask("99/99/2099");
  $("#compra").mask("99?ffff");
  $("#venta").mask("99?ffff");  
  $("#fecha").mask("99/99/2099");
  $("*[data-next]").keyup(function (e) {
        if (e.keyCode == 13) {  
            var next =  $(this).attr("data-next");
            $("#"+next).focus();  
        } 
    });
    setCurrent("rs");
    setCurrent("ps");
    setCurrent("us");
}

function loadCotizCambiosChaco(){
      $("#cambios_chaco").html("<img src='img/loading_fast.gif' width='18px' height='18px' >"); 
      $("#cambios_chaco").load("utils/CambiosChaco/CambiosChacoParser.class.php?suc="+getSuc(), function(){
          $("#cambios_chaco").fadeIn();
      });
      $("#cambios_chaco").click(function(){
          clics_cc++;
          if(clics_cc > 1){
             $(this).fadeOut();
          }
          setTimeout("clics_cc = 0;",2000);
      });
      $("#cambios_chaco").draggable();
  }
  
function actualizarCotizaciones(){
    var usuario = getNick(); 
    var session = getCookie(usuario).sesion;   
    var suc = getSuc();
    var desde = validDate( $("#desde").val()).fecha;
    var hasta = validDate( $("#hasta").val()).fecha;    
    load("finanzas/CotizacionesContables.class.php",{usuario:usuario,session:session,suc:suc,desde:desde,hasta:hasta});
}
function nuevaCotizacion(){
    $("#div_cotiz").fadeIn();
    $("#moneda").focus();
    $('html,body').animate({
           scrollTop: $('body').position().top += 150
    });
    configurar();
}
function cancelar(){
    $("#div_cotiz").fadeOut();
}
function checkCotiz(){
  var compra =  $("#compra").val();
  var venta =  $("#venta").val();
  if(compra <= 0 || venta <= 0){
      $("#guardar").attr("disabled",true);
  }else{
      $("#guardar").removeAttr("disabled");
  }
}
function checkDate(){
    var dif = difDate(fecha_serv,$("#fecha").val());
    //if(dif<0||dif>5){        
    if(dif>5){        
        $("#msg").addClass("error");
        $("#msg").html("<img src='img/warning_red_16.png' style='margin-bottom: -2px' />  La fecha <strong>NO</strong> debe ser mayor a 5 d&iacute;as, ni anterior a la de hoy.!!");
        $("#compra, #venta").attr("disabled","disabled");
        $("#guardar").attr("disabled","disabled");
    }else{
        $("#msg").removeClass("error");
        $("#msg").empty();
        $("#compra, #venta").removeAttr("disabled");
        if(($("#compra").val())>0&&($("#venta").val())>0){
            $("#guardar").removeAttr("disabled");
        }
    }
}
/**
 * 
 * @param {String} Fecha inicio
 * @param {String} Fecha fin
 * @param {String} Formato de la fecha, por defecto d/m/y
 * @param {String} Separador, por defecto /
 * @returns {Number} Diferencia en dias.
 */
function difDate(date1,date2,format,separator){
    var sep = separator || "/";
    var formato = format || "d/m/y";
    var iform = formato.split(sep);
    var d1 = date1.split(sep);
    var d2 = date2.split(sep);
    var m = 0;
    var d = 1;
    for(var a in iform){
        if(iform[a]==="m")m=a;
        if(iform[a]==="d")d=a;
    }
    return Math.floor(((new Date(d2[m]+"/"+d2[d]+"/"+d2[2]))-(new Date(d1[m]+"/"+d1[d]+"/"+d1[2])))/(1000*60*60*24));
}
function guardarCotizacion(){              
    var compra =  $("#compra").val();
    var venta =  $("#venta").val();
    var moneda = $("#moneda").val();
    var verifFecha = validDate($("#fecha").val());
    var fecha = (verifFecha.estado)?verifFecha.fecha:validDate(fecha_hoy).fecha;
    var suc = getSuc();
    $("#guardar").attr("disabled",true);    
    $.ajax({
        type: "POST",
        url: "finanzas/CotizacionesContables.class.php",
        data: {"action": "registrarCotizacion","suc": suc,"moneda":moneda,"compra":compra,"venta":venta,"fecha":fecha},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading.gif' width='22px' height='22px' >");                      
        },
        complete: function(objeto, exito) {
            if (exito == "success") { 
                $("#msg").html("Cotizacion establecida con exito, actualizando en 5 segundos...");
                setTimeout("actualizarCotizaciones()",2000); // Refresh                  
            }
        },
        error: function() {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });

}

function setCurrent(mon){
    $("."+mon).first().append("&nbsp;<img src='img/"+mon+".png' height='18' width='26'>"); 
    /*
var l = $("."+mon).length;		
var a = 0;
$("."+mon).each(function(){
  a++;   
  if(a == l){
    //$(this).css("background","orange"); 
    $(this).append("&nbsp;<img src='img/"+mon+".png' height='18' width='26'>"); 
  }
});*/    
}