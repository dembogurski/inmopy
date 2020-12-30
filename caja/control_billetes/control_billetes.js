/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function(){  
   $(".bill").each(function(){  
      var val=   parseFloat($(this).val()).format(0, 3, '.', ',') ; 
      $(this).val(val);
   });
   $(".mon").each(function(){  
      var val=   parseFloat($(this).val()).format(2, 3, '.', ',') ; 
       $(this).val(val);
   });   
   $(".bill").attr("disabled","disabled");
   $(".tbill").attr("disabled","disabled");
   $(".mon").attr("disabled","disabled");
   $(".cant").focus(function(){  $(this).select();  });
   $(".cant").blur(function(){
       var cant = $(this).val();
       if(isNaN(cant) || cant == ""){
          $(this).val(0);
          cant = 0;
       } 
        var moneda = $(this).parents("table").attr("id");
        var id_mult = $(this).parent().prev().children().attr("id");
        var clase =  $(this).parent().prev().children().attr("class");
        var mult = float(id_mult);
        var decimals = 0;
        if(clase == "mon"){
            decimals = 2;
        } 
        var total = (cant  * mult).format(decimals, 3, '.', ',') ; 
        $(this).parent().next().children().val(total);

        save(moneda,id_mult,cant,mult);
        sumar(moneda);
        
   });
   sumar("Gs");
   sumar("Rs");
   sumar("Ps");
   sumar("Us");
   var estado = $("#estado").html();
   if(estado == "Cerrado"){
       $("#cerrar").remove();  
       $(".cant").attr("readonly","readonly");
       $(".cant").attr("disabled","disabled");
       $(".cotiz").attr("disabled","disabled");
       $(".cotiz").attr("disabled","disabled");
       var audit = $("#audit").val();
       if(audit == "true"){
           $("#firmar").fadeIn();
       }
   } 
   
   setTimeout(function(){
      $("#mensaje").slideDown("slow");
      setTimeout(function(){
      $("#mensaje").slideUp("slow"); 
      },7000);
   },4000);
   
});

function sumar(moneda){ 
   var total = 0; 
   $("#"+moneda).find(".tbill").each(function(){ 
       var valor =  parseFloat($(this).val().replace(/\./g, '').replace(/\,/g, '.')); 
       if(isNaN(valor)){ valor = 0; }
       total += valor;
   });
   var mlower = moneda.toLowerCase();
   var dec = 2;
   if(moneda == "Gs"){
       dec = 0;
   }
   $("#total_"+mlower).val(parseFloat(total.toFixed(2)).format(dec, 3, '.', ',') );
   
   var tgs = float("total_gs");
   var trs = float("total_rs") *  float("cotiz_rs");
   var tps = float("total_ps") *  float("cotiz_ps");
   var tus = float("total_us") *  float("cotiz_us");
   
   var total_global = tgs + trs + tps + tus;
   $("#total_all").val(parseFloat(total_global.toFixed(2)).format(dec, 3, '.', ',') );
   
   if(moneda != "Gs"){ 
     var cot =  float("cotiz_"+mlower);
     guardarCotiz("cotiz_"+mlower,cot,total_global);  
   }else{
     guardarCotiz("cotiz_"+mlower,1,total_global);    
   }
}
function guardarCotiz(cotiz_x,valor,total){
    var id = $("#nro").val();
    $.ajax({
        type: "POST",
        url: "../../Ajax.class.php",
        data: {"action": "guardarCotizControlBilletes",id: id,cotiz_x: cotiz_x,valor: valor,total:total,usuario: getNick()},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg").html("<img src='../../img/loading_fast.gif' width='20px' height='20px' >");                    
        },
        complete: function(objeto, exito) {
            if (exito == "success") {                          
                $("#msg").html("<img src='../../img/ok.png' >");                                     
            }
        },
        error: function() {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}

function save(moneda,identif,cant,valor){
    var id = $("#nro").val();
    var usuario = window.opener.getNick();
    $.ajax({
        type: "POST",
        url: "../../Ajax.class.php",
        data: {"action": "guardarMoneda", id: id, moneda: moneda,identif:identif,cant:cant,valor:valor,usuario: usuario},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg").html("<img src='../../img/loading_fast.gif' width='20px' height='20px' >");                      
        },
        complete: function(objeto, exito) {
            if (exito == "success") {                          
                 $("#msg").html("<img src='../../img/ok.png' >");                   
            }
        },
        error: function() {
            $("#msg").addClass("errorgrave");
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}
function cerrarControl(){
    var id = $("#nro").val();
    $.ajax({
        type: "POST",
        url: "../../Ajax.class.php",
        data: {"action": "cerrarControlBilletes", id: id,usuario: getNick()},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#estado").html("<img src='../../img/loading_fast.gif' width='20px' height='20px' >");                      
        },
        complete: function(objeto, exito) {
            if (exito == "success") {                          
                 $("#msg").html("<img src='../../img/ok.png' >");     
                 $("#estado").html("Cerrado");   
                 $("#cerrar").remove();
                 window.location.reload();
            }
        },
        error: function() {
            $("#msg").addClass("errorgrave");
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });     
}
function getPassword(){
    var position = $("#pie").position();
    var pie = $("#pie").width() / 2; 
    var width = $("#verificar").width() / 2;
     
    var top = position.top - 140; 
    $("#verificar").css("margin-left",position.left + pie - width); 
    $("#verificar").css("margin-top",-180);      
    $("#verificar").fadeIn();    
    $("#passw").focus();
}
function firmarControl(){
   var id = $("#nro").val(); 
   var passw = $("#passw").val();
   var usuario =  $("#usuario").val();
    $.ajax({
        type: "POST",
        url: "../../Ajax.class.php",
        data: {"action": "firmarControlBilletes", "usuario": usuario, "passw": passw, id: id},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg_pw").html("<img src='../../img/loading_fast.gif' width='20px' height='20px' >");                      
        },
        complete: function(objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText); 
                if(result == "Ok"){
                    $("#verificar").addClass("info");
                    $("#verificar").html("Verificado! La Ventana se Cerrara en 5 Segundos!!!");
                    window.opener.lista_contadores.click();
                    setTimeout("self.close()",5000);
                }else{
                   $("#msg_pw").addClass("errorgrave"); 
                   $("#msg_pw").html(result);
                }
            }
        },
        error: function() {
            $("#msg_pw").addClass("errorgrave");
            $("#msg_pw").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}

Number.prototype.format = function(n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
    num = this.toFixed(Math.max(0, ~~n));
    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};

function float(id){
    var n =  parseFloat($("#"+id).val().replace(/\./g, '').replace(/\,/g, '.'));
    if(isNaN(n)){
        return 0;
    }else{
        return n;
    }
 }