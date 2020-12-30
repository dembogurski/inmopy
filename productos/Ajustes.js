
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var data_next_time_flag = true;
var ajustes_pendientes = true;
var cotizacion_dolar = false;
var supervisor = false;
var autorizado_por = "";
var stockComprometido = false;
var mnj_x_lotes = "Si";
var min = 0;
var max = 0;
var ventana;

function configurar(){
   $("#lote").focus();    
   $("#lote").change(function(){
        buscarDatos();
   });
   
   $("#stockreal").change(function(){
       var v = $(this).val();
       $(this).val(v.replace(/\,/g, '.'));
        calcAjuste();
   });
   $("*[data-next]").keyup(function (e) {
        if (e.keyCode == 13) { 
            if(data_next_time_flag){
               data_next_time_flag = false;  
               var next =  $(this).attr("data-next");
               $("#"+next).focus();               
               setTimeout("setDefaultDataNextFlag()",600);
            }
        } 
    });
   
    checkearCotizDolar();
}
function setDefaultDataNextFlag(){
    data_next_time_flag = true;
}
function showKeyPad(id){
    showNumpad(id,buscarDatos,false);
}
function showKeyPad2(id){
    showNumpad(id,calcAjuste,false);
}
function calcAjuste(){
   var stock =  parseFloat($("#stock").val().replace(/\./g, '').replace(/\,/g, '.') );   
   
   var PORCENTAJE = (stock * 10) / 100; 
   
   
   if(supervisor ){
      min = -1000;
      max = 1000;
   }else{
      min = stock - PORCENTAJE;
      max = stock + PORCENTAJE;
   } 
   var fuera_rango = false;   
   var stockreal =  parseFloat( $("#stockreal").val());
   var ajuste = (stockreal - stock).format(2, 30, '.', '');
   var ajusteTMP  = parseFloat(stockreal - stock);
   $("#ajuste").val(ajuste);
   
   
   console.log("stockreal "+stockreal+"  Min: "+min+"  Max:"+max+"  ajusteTML "+ ajusteTMP);
   
   if(ajusteTMP < 0){
       $("#ajuste").css("color","red");
       $(".aum").fadeOut("fast");
       $(".dism").fadeIn("fast");
       $("#operacion option[value='Disminucion en Entrada']").prop('selected', true);
       if(stockreal < min){
           fuera_rango = true;
       }
   }else{
       $("#ajuste").css("color","green");
       $(".aum").fadeIn("fast");
       $(".dism").fadeOut("fast");
       $("#operacion option[value='Aumento en Entrada']").prop('selected', true);   
       if(stockreal > max){
           fuera_rango = true;
       }
   }
   
   console.log("ajustes_pendientes !"+ajustes_pendientes+"  cotizacion_dolar: "+cotizacion_dolar+"  fuera_rango "+fuera_rango  );
   
   console.log(stockreal > 0 && !ajustes_pendientes && cotizacion_dolar+" supervisor "+supervisor); 
   
   if(stockreal > 0 && !ajustes_pendientes && cotizacion_dolar ){ // And otras reglas no bien definidas
       if(supervisor && $(".loteInfo").length == 0){
           $("#ajustar").removeAttr("disabled"); 
           $("#ajustar").fadeIn();
           $("#ajuste_supervisor").fadeOut();  
       }else{
            if(fuera_rango && $(".loteInfo").length == 0){
               errorMsg("Fuera del Rango del 10%, verificar datos.",40000);
               $("#ajustar").prop("disabled",true);
               $("#ajustar").fadeOut()
               $("#ajuste_supervisor").fadeIn();           
            }else{
               $("#ajuste_supervisor").fadeOut();  
               infoMsg("Dentro del rango.",8000); 
               if($(".loteInfo").length == 0){
                    $("#ajustar").removeAttr("disabled");
                    $("#ajustar").fadeIn();
                }
            } 
       }
   }else{
       if($(".loteInfo").length == 0){
            $("#ajustar").removeAttr("disabled");
            $("#ajustar").fadeIn();
       }   
   }       
}
function ajusteSupervisor(){
    var position_tr = $("#ajuste_supervisor").offset();
    var pie = $("#ajuste_supervisor").width() / 2; 
    var width = $("#verificar").width() / 2;
    var boton = $("#ajuste_supervisor").position(); 
    var top = position_tr.top;
    
    $("#verificar").css("margin-left",boton.left + pie - width); 
    $("#verificar").css("margin-top",top-44);      
    $("#verificar").fadeIn();    
    $("#passw").focus();
    
    $("#passw").keyup(function (e) {
        if (e.keyCode == 13) {  
            autorizarAjuste();
        } 
    });
}

function autorizarAjuste(){
   var passw = $("#passw").val();
   var usuario =  getNick();
   var suc = getSuc();
   
    $.ajax({
        type: "POST",
        url: "productos/Ajustes.class.php",
        data: {"action": "checkPasswordAndTrustee", "usuario": usuario, "passw": passw,suc:suc},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg_pw").html("<img src='img/loading_fast.gif' width='20px' height='20px' >");                      
        },
        complete: function(objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText); 
                if(result != "Permiso denegado"){
                    $("#verificar").addClass("info");
                    $("#verificar").html("Autorizado! Puede Proceder al Ajuste"); 
                    $("#verificar").css("top",-40);
                    supervisor = true;
                    autorizado_por = result;
                    calcAjuste();
                    infoMsg("Autorizado! Puede Proceder al Ajuste",8000);
                    
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

function buscarDatos(){
    $("#warning").html(""); 
    $("#stockreal, #ajuste, #motivo").val('');
    $("#ajustar").attr('Disabled','Disabled')
   var lote = $("#lote").val();
   var suc = getSuc();
   $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action":"buscarDatosDeCodigo","lote":lote,"categoria":1,"suc":suc}, // Utilizo la misma funcion de Factura de Ventas
        async:true,
        dataType: "json",
        beforeSend: function(){ 
           $("#msg").html("<img src='img/loadingt.gif' >");  
           $("#msg").removeClass("error");
           $("#imprimir").attr("disabled",true);
           $("#img").fadeOut("fast");
           $("#codigo").val(""); 
           $("#um").val("");  
           $("#suc").val("");   
           $("#ancho").val("");  
           $("#gramaje").val("");  
           $("#descrip").val("");  
           $("#stock").val("");  
           $(".ajuste").fadeOut("fast");    
        },
        success: function(data){ 
            var existe = data.existe;
            $("#msg").attr("class","info");
            if( existe === "true" ){
                
                $("#codigo").val(data.codigo); 
                mnj_x_lotes = data.mnj_x_lotes; 
                var descripcion = data.descrip;
                if(mnj_x_lotes == "Si"){
                    descripcion += " - "+data.color
                }
                $("#descrip").val( descripcion );
                
                var stock = data.stock; 
                if(stock === null ){
                    stock = 0;
                }
                $("#stock").val(  parseFloat( stock  ).format(2, 3, '.', ',')   );
                
                var ancho = parseFloat(  data.ancho ).format(2, 3, '.', ',');
                var gramaje = parseFloat(  data.gramaje ).format(2, 3, '.', ',');
                var um = data.um_prod; 
                
                var img = data.img;  
                
                $("#um").val(um);  
                $("#suc").val(suc);   
                $("#ancho").val(ancho);  
                $("#gramaje").val(gramaje);  
                if(img != "" && img != undefined){
                    var images_url = $("#images_url").val();
                    $("#img").attr("src",images_url+"/"+img+".thum.jpg");
                    $("#img").fadeIn(2500);
                }else{
                    $("#img").attr("src","img/no_image.png");
                    $("#img").fadeIn(2500);
                }  
                // Verifica si el Stock esta comprometido
                $.post("Ajax.class.php",{"action":"buscarStockComprometido", "lote":lote,"suc":suc, "incluir_reservas":"Si"},function(data){
                    if(data.length && data.TipoDocumento == "Remedir"){
                        stockComprometido = true;
                        var table = $("<table/>",{"class":"loteInfo"});
                        var tr = $("<tr/>");
                        $.each(data,function(key,value){
                            $("<th/>",{"text":key}).appendTo(tr);
                        });
                        table.append(tr);
                        data.forEach(function(data){
                            var tr = $("<tr/>");
                            $.each(data,function(key,value){
                                $("<td/>",{"text":value}).appendTo(tr);
                            });
                            table.append(tr);
                        });                        
                        $("#warning").html("<img src='img/warning_red_16.png'>");
                        $("#warning").append(table);
                    }                
                },'json');              
         
                $("#msg").html("<img src='img/ok.png'>");  
                if(getSuc() == suc){
                   //buscarHistorialLote();
                   $(".ajuste").fadeIn("fast");  
                   data_next_time_flag = false;  
                   $("#stockreal").focus();
                   setTimeout("setDefaultDataNextFlag()",800);
                }else{
                    $("#msg").addClass("error");
                    $("#msg").html("Esta pieza no se encuentra en esta Sucursal!, Corrobore.");   
                }
            }else{
                $("#msg").addClass("error");
                $("#msg").html("Esta pieza no existe o no se encuentra en esta Sucursal!, Corrobore si se encuentra en la sucursal correcta!");   
                $("#lote").focus(); 
                $("#lote").select();
                $(".ajuste").fadeOut("fast");  
                $("#historial").html("");
            }
        },
        error: function(e){ 
           $("#msg").addClass("error");
           $("#msg").html("Error en la comunicacion con el servidor:  "+e);
           $("#imprimir").attr("disabled",true);
           $("#lote").select();
        }
    });
}
 
function checkearCotizDolar(){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "verificarCotizMoneda", "moneda": "U$"},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("Verificando cotizacion Dolar...<img src='img/loading_fast.gif' width='18px' height='18px' >");                      
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);  
                if(result == "0"){
                    cotizacion_dolar = false;
                    errorMsg("Se requiere establecer cotizacion del Dolar para el dia de la Fecha,contacte con Administracion.",100000);
                    $("#msg").html("Se requiere establecer cotizacion del Dolar para el dia de la Fecha,contacte con Administracion.");     
                    $("#msg").addClass("error");
                    
                }else{
                    cotizacion_dolar = true;
                    $("#msg").html("");    
                    $("#msg").removeClass("error");
                     
                }
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}
function buscarHistorialLote(){
    var codigo = $("#codigo").val();
    var lote = $("#lote").val();
    if(mnj_x_lotes === "No"){
       lote = "";
    }
    var suc = $('input[type="checkbox"]#traer_historial').is(":checked")?"%":$("#suc").val();     
    var url = "productos/HistorialMovimiento.class.php?lote="+lote+"&suc="+suc+"&codigo="+codigo;
    var title = "Historial de Movimiento de Lote";
    var params = "width=980,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    
    if(!ventana){        
        ventana = window.open(url,title,params);
    }else{
        ventana.close();
        ventana = window.open(url,title,params);
    } 
}

function ajustar(){
   $("#ajustar").attr("disabled",true); 
   var codigo = $("#codigo").val();
   var lote = $("#lote").val();
   var suc = getSuc();     
   
   var stock =  parseFloat($("#stock").val().replace(/\./g, '').replace(/\,/g, '.') );   
   var stockreal =  parseFloat( $("#stockreal").val());
   var ajuste =  parseFloat((stockreal - stock).format(2, 30, '', '.'));      
   var signo = "+";
   var final = 0;
   var ajuste_pos = ajuste;
   
   if(ajuste < 0){  
       signo = "-"; 
       ajuste_pos = ajuste_pos * -1;
   } 
   final = stock + ajuste;   
    
   var oper = $("#operacion").val();
   var motivo = $("#motivo").val();
   var um = $("#um").val(); 
   
   var usuario_ajuste = getNick();
   if(autorizado_por != ""){
       usuario_ajuste = autorizado_por;
   }
   if(mnj_x_lotes === "No"){
       lote = "";
   }
   if(motivo.length > 10){    
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "registarAjuste", codigo: codigo,lote:lote,stock:stock,ajuste:ajuste_pos,final:final,signo:signo,suc:suc,oper:oper,motivo:motivo,um:um,usuario:usuario_ajuste},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >"); 
        },
        success: function (data) { 
            if(data.estado == 'Ok'){
                $("#msg").html("Ok"); 
                infoMsg("El ajuste ha sido registrado con exito, se procesara en unos instantes...",60000) 
                setTimeout("buscarDatos()",1000);
                $("#lote").attr("disabled",true);
                $(".ajuste").attr("disabled",true); 
                autorizado_por = "";
            }else{                
                $("#msg").html(data.info);
                errorMsg("Atencion! "+data.info,30000);
            }
            var estado = data.estado; 
        }
    });
   }else{
      alert("Debe ingresar un motivo valido!!!");
      errorMsg("Debe ingresar un motivo valido!!!",10000);
   }
   
}
