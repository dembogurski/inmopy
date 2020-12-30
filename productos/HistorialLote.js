
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var ventana;
var audit;
var imagen;

function configurar(){
   $("#lote").focus();    
   $("#lote").change(function(){
        buscarDatos();
   }); 
   if(getSuc() !='00'){
       $("input#ordenProcesamiento").hide();
   }
   $("input#ordenProcesamiento").data("texto",$("input#ordenProcesamiento").val());
   $("input#ordenProcesamiento").css("color","green");
}

function showKeyPad(){
    //showNumpad("lote",buscarDatos,false);
    showRelative("lote",buscarDatos,false);
    var position = $("#lote").offset();   
    $('#n_keypad').css({ 'top'  : position.top -50 ,'left' : position.left -2});
}

function buscarDatos(){
    $("div#extraInfo").hide();
    $("input#ordenProcesamiento").val($("input#ordenProcesamiento").data("texto"));
    $("input#ordenProcesamiento").css("color","green");
    $("div#extraInfo").empty();
    $("#msg").html("<img src='img/loadingt.gif' >");    
    $("#imprimir, input#ordenProcesamiento, #fracciones").attr("disabled",true);
    $("#img").fadeOut("fast");
    $("#codigo, #h_precio1, #um, #suc, #ancho, #gramaje, #descrip, #stock, #padre, #fab_color_cod").val(""); 
    $(".fracciones").fadeOut();
    
    var suc = getSuc();
    if($("#only_suc").is(":checked")){
        suc = "%";
    }
    
    var sData = {
      "action":"buscarDatosDeCodigo",
      "lote":$("#lote").val(),
      "categoria":1,
      "suc":suc
    };
    var ult_precio = 0;
    $.post("Ajax.class.php",sData,function(data){
      $("#msg").html("<img src='img/ok.png'>");
      if(data.existe)  {
        $.each(data,function(key,val){
          var id = "#"+key.toLowerCase();
          var valor = val;
          switch(key){
            case 'stock':
            case 'ancho':    
            case 'gramaje':
            case 'precio':  
              ult_precio  = parseFloat(val);
              valor = parseFloat(val).format(2, 3, '.', ',');
            case 'descuento':
               var preciox = parseFloat( ult_precio - valor ).format(2, 3, '.', ',');
               $("#precio").val(preciox);
              break;
             
          }
          if(sData.suc != data.suc){
            $("#msg").addClass("error");
            $("#msg").html("Codigo no paso por su sucursal"); 
          }
          
          if($(id).length){
            $(id).val(valor)
          }
          
        });
        $("#estado_venta").removeAttr("class");
        $("#estado_venta").addClass($("#estado_venta").val());
        
        if(data.img != "" && data.img != undefined){
            var images_url = $("#images_url").val();
            $("#img").attr("src",images_url+"/"+data.img+".thum.jpg");
            /* $("#img").click(function(){
                verImagen();
            }); */
            $("#img").fadeIn(2500);
        }else{
            $("#img").off("click");
            $("#img").attr("src","img/no_image.png");
            $("#img").fadeIn(2500);
        }
        $("#h_precio1").val((parseFloat(data.Precio) - ((parseFloat(data.Precio)*parseFloat(data.Descuento))/100)).format(2, 3, '.', ','));
        $("#imprimir, #fracciones, #stock_comp").removeAttr("disabled");
        
         
        $("input#ordenProcesamiento").removeAttr("disabled");
        if($("#mnj_x_lotes")==="Si"){
           getFallas();
           
        }
      }else{
        $("#msg").addClass("error");
        $("#msg").html(data.mensaje);   
        $("#lote").focus(); 
        $("#lote").select();
        $("input#ordenProcesamiento").attr("disabled",true);
      }
    },"json");
}

function historialUbicaciones(){
    var codigo = $("#codigo").val();
    var lote = $("#lote").val(); 
    if(codigo != "" && lote != ""){
        var url = "productos/HistorialUbicaciones.class.php?codigo="+codigo+"&lote="+lote+"";
        var title = "Historial de Ubicaciones de Lote";
        var params = "width=980,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";

        if(!ventana){        
            ventana = window.open(url,title,params);
        }else{
            ventana.close();
            ventana = window.open(url,title,params);
        }     
    }
}

function  historial(){
    
    var codigo = $("#codigo").val();
    var lote = $("#lote").val();
    
    var mnj_x_lotes = $("#mnj_x_lotes").val();
    if(mnj_x_lotes ==="No"){
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

function fracciones(){
   $(".fracciones").fadeIn();
   var lote = $("#lote").val();
    $.ajax({
        type: "POST",
        url: "productos/HistorialLote.class.php",
        data: {"action": "fracciones", lote: lote},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $(".fraccion").remove();
        },
        success: function (data) {   
            //usuario,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,hora, codigo,lote,cantidad,um,motivo,tara,gramaje,ancho ,kg_desc
            
            for (var i in data) { 
                var usuario = data[i].usuario;
                var fecha = data[i].fecha;
                var hora = data[i].hora;
                var codigo = data[i].codigo;
                var lote = data[i].lote;
                var cantidad = data[i].cantidad;
                var um  = data[i].um ;
                var motivo = data[i].motivo;
                var tara = data[i].tara;
                var gramaje = data[i].gramaje;
                var ancho = data[i].ancho;
                var kg_desc = data[i].kg_desc;
                $(".fracciones").append("<tr class='fraccion'>\n\
                    <td>"+usuario+"</td>\n\
                    <td>"+fecha+"</td>\n\
                    <td>"+hora+"</td>\n\
                    <td>"+codigo+"</td>\n\
                    <td>"+lote+"</td>\n\
                    <td class='num'>"+cantidad+"</td>\n\
                    <td>"+um+"</td>\n\
                    <td>"+motivo+"</td>\n\
                    <td>"+tara+"</td>\n\
                    <td>"+gramaje+"</td>\n\
                    <td>"+ancho+"</td>\n\
                    <td>"+kg_desc+"</td>\n\
                </td>");
                //var nro_gasto = data[i].nro_gasto;
                //var cod_gasto = data[i].cod_gasto;                 
            }   
            $("#msg").html(""); 
        }
    });
}

function verImagen(){
  var codigo = $("#codigo").val();
  
  if(codigo != ""){
      var img = $("#img").attr("src");
      
      var url = img.toString().replace(".thum","");
      var title = "Imagen asociada al Lote";
      var params = "width=980,height=600,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";    
      if(!imagen){        
          imagen = window.open(url,title,params);
      }else{
         imagen.close();
         imagen = window.open(url,title,params);
      }  
   }
}

function verOrdenProcesamiento(){
    if($("div#extraInfo").is(":visible") && $("div#extraInfo *").length > 0){
        $("div#extraInfo").hide();
        $("input#ordenProcesamiento").val($("input#ordenProcesamiento").data("texto"));
        $("input#ordenProcesamiento").css("color","green");
    }else{       
        $("div#extraInfo").empty();
        var codigo = $("#codigo").val();
        var lote = $("input#lote").val();
        var sendParam = { "action": "enReservaJSON",codigo:codigo, "lote": lote };
        var tabla = $("<table/>",{"class":"ordenProc"});
        var ths = ['Destino','Cliente','Cantidad','Fecha','Usuario', 'Estado', 'Obs'];
        var trh = $("<tr/>");
        for(th in ths){
            $("<th/>",{"text":ths[th]}).appendTo(trh);
        }
        trh.appendTo(tabla);
        $.post("productos/GaleriaImagenes.class.php", sendParam, function(data) {
            if(data.length > 0){
            $.each(data, function(clave, valor){
                var tr = $("<tr/>");
                $.each(valor, function(_clave, _valor){
                   $("<td/>",{"text":_valor}).appendTo(tr);
                });
                tr.appendTo(tabla);
            });
            }else{
            $("<tr><td align='center' colspan='2'><b>Sin Resultados</b></td></tr>").appendTo(tabla);
            }
            tabla.appendTo("div#extraInfo");
            $("input#ordenProcesamiento").val("Ocultar Orden de Procesamiento");
            $("input#ordenProcesamiento").css("color","red");
            $("div#extraInfo").show();
        },"json");
    }
}

function auditar(){
    var lote = $("#lote").val();
    if(lote.length > 2){
        var url = "productos/Audit.class.php?lote="+lote+"&suc="+getSuc();
        var title = "Auditoria de Lotes";
        var params = "width=980,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";

        if(!audit){        
            audit = window.open(url,title,params);
        }else{
            audit.close();
            audit = window.open(url,title,params);
        }  
    }
}

function getFallas(){
    var codigo = $("#codigo").val();
    var lote = $("#lote").val();
    var stock =  parseFloat( $("#stock").val().replace(/\./g, '').replace(/\,/g, '.')  );
    //var vender =  parseFloat( $("#cantidad").val().replace(/\./g, '').replace(/\,/g, '.')  );
    var vender = stock;
    $.ajax({
        type: "POST",
        url: "ventas/FacturaVenta.class.php",
        data: {action: "getFallas", codigo: codigo, lote: lote,vender:stock}, // Para mostrar todas las fallas que ya tiene
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $(".falla_indic").remove();
            fallas = [];
            max_mts_fallas = 0;
            falla(false,"F"); 
        },
        success: function (data) { 
            if(data.length > 0){  console.log("data.length "+data.length);
                $("#max_mts").html(stock); 
                $("#regla").prop("max",stock);
                 
                fallas = data;
                max_mts_fallas = fallas.length * 30;
                
                falla(true,"F");
                
                $(".grafico_fallas").slideDown();                
                var porc_vender = parseInt((vender * 100) / stock);
                
                $('#total_vender').animate({  
                  width:''+porc_vender+'%'
                }, 1000, function() {
                    for(var i in data){
                       var  tipo_falla = data[i].tipo_falla;
                       var ubic_falla = data[i].ubic_falla;
                       var ubic_real = parseFloat(data[i].ubic_real);
                       var calc_pos_falla = parseInt((ubic_real * 100) / vender);
                       var  user = data[i].usuario;  
                       var  fecha = data[i].fecha;                               
                       setTimeout( "showFalla("+calc_pos_falla+",'"+tipo_falla+"',"+ubic_real+",'"+user+"','"+fecha+"')",500);
                       //console.log("Falla: "+tipo_falla+"   Vender: "+vender+"  Ubic Falla "+ubic_real+"  Calc Pos "+calc_pos_falla);
                    } 
                });
                $(".datalist_opt").remove();
                for(var i = 0;i < stock;i+=0.25){
                   $("#ticks").append("<option class='datalist_opt' value="+i+" label="+i+">");
                }
                $("#msg").html("");    
                var permiso_fallas = true; // Solo se puede visualizar aqui
                if(permiso_fallas ){
                    $("#area_agregar_fallas").fadeIn();
                }else{
                    $("#area_agregar_fallas").fadeOut();
                }
            }else{
               $("#area_agregar_fallas").fadeOut();  
               $(".grafico_fallas").slideUp();
               $("#msg").html("");    
            }
        },
        error: function (e) {                 
            $("#msg").html("Error al obtener fallas:  " + e);   
            errorMsg("Error al obtener fallas:  " + e, 10000);
        }
    }); 
}
function showFalla(calc_pos_falla,tipo_falla,ubic_real,usuario,fecha){
    $('#total_vender').append("<div style='margin-left:"+calc_pos_falla+"%'> <span title='"+usuario+" - "+fecha+" ' class='falla_indic' >"+tipo_falla+"</span></div> ");
    $('#total_vender').append("<div style='margin-left:"+calc_pos_falla+"%'> <span class='falla_pos' >"+ubic_real+"</span></div> ");
}
function falla(bool,cod_falla){
   var visible = "hidden";
   bool?visible = "visible":"hidden";
   $(".grafico_fallas").fadeOut();       
   $(".falla").css("visibility",visible);  
   $("#cod_falla").text(cod_falla);
   $("#cm_falla").val("");
}

function buscarStockComprometido(){
    var lote = $("#lote").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "buscarStockComprometido", lote: lote,suc:getSuc(),"incluir_reservas":"Si","incluir_pedidos":"Si"},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("Buscando stock comprometido!<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#stock_comprometido").html("");
            $("#stock_compr").html("");
        },
        success: function (data) {   
            var comprometido = 0;
            var st_comp = "<table class='stock_comprometido' border='1'>";
            st_comp+="";
            if(data.length > 0){
                var st_comp = "<table class='tabla_stock_comprometido' border='1'>";
                st_comp+="<tr><th colspan='6' style='background:orange;'>Stock Comprometido</th><th style='text-align:center;background:white' onclick='closeStockComp()'>X</th></tr>";
                st_comp+="<tr class='titulo' style='font-size:10px'><th>Doc</th><th>N�</th><th>Usuario</th><th>Fecha</th><th>Suc</th><th>Estado</th><th>Cantidad</th><tr>";
                for (var i in data) {
                    var tipodoc = data[i].TipoDocumento;
                    var nro = data[i].Nro;
                    var usuario_ = data[i].usuario;
                    var fecha = data[i].fecha;
                    var suc = data[i].suc;
                    var estado = data[i].estado;
                    var cantidad = data[i].cantidad;
                    comprometido += parseFloat(cantidad);
                    st_comp+="<tr style='background:white'><td>"+tipodoc+"</td><td>"+nro+"</td><td>"+usuario_+"</td><td>"+fecha+"</td><td class='itemc'>"+suc+"</td><td>"+estado+"</td><td class='num'>"+cantidad+"</td></tr>";
                }   
                
                $("#stock_comprometido").html(st_comp);
                $("#area_trab").fadeOut();
                $("#stock_comprometido").fadeIn();
                $("#msg").html("No se puede fraccionar, vea tabla de Stock Comprometido"); 
            }else{
                $("#msg").html(""); 
                $("#area_trab").fadeIn();
            }
            
        }
    });     
} 

function closeStockComp(){
    $("#stock_comprometido").html("");
    $("#stock_comprometido").fadeOut();
}