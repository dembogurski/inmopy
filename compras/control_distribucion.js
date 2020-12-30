/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var data_next_time_flag = true;
var ajustes_pendientes = true;
var cotizacion_dolar = false;

function configurar(){
   $("#lote").focus();    
   $("#lote").change(function(){
        buscarDatos();
   });
   
   $("#stockreal").change(function(){
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
}
function showKeyPad(id){
    showNumpad(id,buscarDatos,false);
}
function buscarDatos(){
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
            var mensaje = data[0].Mensaje;
            $("#msg").attr("class","info");
            if( mensaje === "Ok" ){
                $("#codigo").val(data[0].Codigo); 
                $("#descrip").val( data[0].Descrip );
                $("#stock").val(  parseFloat( data[0].Stock  ).format(2, 3, '.', ',')   );
                
                var ancho = parseFloat(  data[0].Ancho ).format(2, 3, '.', ',');
                var gramaje = parseFloat(  data[0].Gramaje ).format(2, 3, '.', ',');
                var um = data[0].UM; 
                var suc = data[0].Suc;  
                var img = data[0].Img;  
                
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
         
                $("#msg").html("<img src='img/ok.png'>");  
                if(getSuc() == suc){
                   buscarPoliticaDistribucion();
                    
                   data_next_time_flag = false;  
                    
                   //setTimeout("setDefaultDataNextFlag()",800);
                }else{
                    $("#msg").addClass("error");
                    $("#msg").html("Esta pieza no se encuentra en esta Sucursal!, Corrobore.");   
                }
            }else{
                $("#msg").addClass("error");
                $("#msg").html(mensaje);   
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

function buscarPoliticaDistribucion(){
    var lote = $("#lote").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getPoliticaDistribucion", lote: lote},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) { 
            $(".fila_cortes").remove();
            for (var i in data) { 
                var id_orden = data[i].id_orden;
                var color = data[i].color;
                var cantidad = data[i].cantidad; 
                var presentacion = data[i].presentacion; 
                var suc = data[i].suc;  
                $("#cortes").append("<tr class='fila_cortes' style='background:white'><td>"+lote+"</td><td class='itemc'>"+cantidad+"</td><td class='itemc'>"+presentacion+"</td><td class='itemc'>"+suc+"</td></tr>");
            }   
            $("#msg").html(""); 
        }
    });
}


