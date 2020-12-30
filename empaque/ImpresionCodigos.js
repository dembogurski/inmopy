/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var imagen;

function configurar(){
   $("#lote").focus();    
   $("#lote").change(function(){
        buscarDatos();
   });
   
   if(typeof( jsPrintSetup ) == "object") {  
       if(jsPrintSetup.getPrintersList() == null){
            alert("Sr. Usuario haga clic en el boton 'Permitir' que se encuentra en la parte superior derecha, y recargue la pagina.");
            return;
        }
           
        var printer_list = (jsPrintSetup.getPrintersList()).split(",");
        $.each(printer_list,function(number){
           $("#printers").append('<option>'+printer_list[number]+'</option>');
        });      
       jsPrintSetup.definePaperSize(100, 100, "Custom", "Etiqueta_Marijoa", "Etiqueta Marijoa", 60, 40, jsPrintSetup.kPaperSizeMillimeters);  
       jsPrintSetup.setPaperSizeData(100);

        $("#silent_print").click(function(){
          var print_silent = $(this).is(":checked"); 
          jsPrintSetup.setSilentPrint(print_silent);
        });
      
   }else{
     // alert("Este navegador necesita de un Plug in 'js print setup' para mejor funcionamiento, considere instalarlo en Herramientas -> Complementos Busque 'js print setup' e instalelo, posteriormente reinicie su navegador y vuelva a intentarlo, si el problema persiste contacte con el administrador del sistema :D");
   }
   $("select#tamanho").change(function(){
       var poliamida = $("select#tamanho option:selected").text().indexOf("Poliamida");
       if(poliamida > -1){
          $("#imprimir_etiq_cuidados").prop("disabled",false);    
          $(".medidas").fadeIn();
       }else{
          $("#imprimir_etiq_cuidados").prop("disabled",true);
          $(".medidas").fadeOut();
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
           //$("#imprimir").attr("disabled",true);
           $(".botones").attr("disabled",true);
           $("#img").fadeOut("fast");
           $("#codigo").val(""); 
           $("#um").val("");  
           $("#suc").val("");   
           $("#ancho").val("");  
           $("#gramaje").val("");  
           $("#descrip").val("");  
           $("#stock").val("");   
        },
        success: function(data){ 
            var existe = data.existe;
            $("#msg").attr("class","info");
            if( existe === "true" ){
                $("#codigo").val(data.codigo); 
                $("#descrip").val(data.descrip);
                $("#stock").val(  parseFloat( data.stock  ).format(2, 3, '.', ',')   );
                
                var ancho = parseFloat(  data.ancho ).format(2, 3, '.', ',');
                var gramaje = parseFloat(  data.gramaje ).format(2, 3, '.', ',');
                var um = data.um; 
                var suc = data.suc;  
                var img = data.img;  
                
                $("#um").val(um);  
                $("#suc").val(suc);   
                $("#ancho").val(ancho);  
                $("#gramaje").val(gramaje);  
                if(img != "" && img != undefined){
                    var images_url = $("#images_url").val();
                    $("#img").attr("src",images_url+"/"+img+".thum.jpg");
                    $("#img").click(function(){
                        verImagen();
                    });
                    $("#img").fadeIn(2500);
                }else{
                    $("#img").attr("src","img/no_image.png");
                    $("#img").off("click");
                }                
         
                $("#msg").html("<img src='img/ok.png'>");  
                if(getSuc() == suc){
                   // $("#imprimir").removeAttr("disabled");
                   $(".botones").removeAttr("disabled");
                }else{
                    $("#msg").addClass("error");
                    $("#msg").html("Esta pieza no se encuentra en esta Sucursal!, Corrobore.");   
                }
                getImagenCuidadoArticulo();
            }else{
                $("#msg").addClass("error");
                $("#msg").html("No se ha encontrado datos de esta pieza!");   
                $("#lote").focus(); 
                $("#lote").select();
                $(".botones").attr("disabled",true);
                
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
function getImagenCuidadoArticulo(){
    
    var codigo = $("#codigo").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {action: "getImagenCuidadoArticulo", codigo: codigo, usuario: getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            if (data.length > 0) {
                var imagen = data[0].imagen;
                $("#imprimir_etiq_cuidados").attr("onclick","imprimirEtiquetaCuidados('"+imagen+"')");
            } else {
                $("#imprimir_etiq_cuidados").attr("onclick","imprimirEtiquetaCuidados('cuidado_no_definido.jpg')");
            }  
            $("#msg").html(""); 
        },
        error: function (e) {                 
            $("#msg").html("Error obtener imagen de cuidado  " + e);   
            errorMsg("Error obtener imagen de cuidado:  " + e, 10000);
        }
    }); 
}

function  imprimirCodigoBarras(){
    var tamanho = $("select#tamanho option:selected").text();
    var lote = $("#lote").val();
    var printer = $("#printers").val();
      
    var silent_print = $("#silent_print").is(":checked");
    if(typeof( jsPrintSetup ) == "object") {  
        jsPrintSetup.setSilentPrint(silent_print);
    }   
    var auto_close_window = $("#auto_close_window").is(":checked");
    var suc = getSuc();
    var usuario = getNick();
       
    var url = "barcodegen/BarcodePrinter.class.php?codes="+lote+"&usuario="+usuario+"&printer="+printer+"&silent_print="+silent_print+"&etiqueta=etiqueta_"+tamanho+"&auto_close_window="+auto_close_window;
    var title = "Impresion de Codigos de Barras";
    var params = "width=800,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    window.open(url,title,params);    
}


function  imprimirEtiquetaCuidados(imagen){
    var tamanho = $("select#tamanho option:selected").text();
    var tam = $("#tamanho option:selected").val();
    var medidas = $("#medidas").val();
   
    var auto_close_window = $("#auto_close_window").is(":checked");
    var printer = $("#printers").val();
    var silent_print = $("#silent_print").is(":checked");
    if(typeof( jsPrintSetup ) == "object") {  
        jsPrintSetup.setSilentPrint(silent_print);
    }
     
    var suc = getSuc();
    var usuario = getNick();
    var subtipo = "";
    if(tamanho == "Poliamida 100% Poliester" || tamanho == "Poliamida 100% Algodon"  || tamanho == "Poliamida 50% Poliester 50% Algodon"){
        subtipo = "Continua";
    }
       
    var url = "barcodegen/EtiquetaCuidados"+subtipo+".class.php?tipo="+imagen+"&usuario="+usuario+"&printer="+printer+"&silent_print="+silent_print+"&etiqueta=etiqueta_"+tamanho+"_cuidados&auto_close_window="+auto_close_window+"&tam="+tam+"&medidas="+medidas;
    var title = "Impresion de Codigos de Barras";
    var params = "width=800,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    window.open(url,title,params);    
}

function showForm(){
    if($("#print_stacks").is(":checked")){
        $("#stacks").fadeIn();
    }else{
        $("#stacks").fadeOut();
    }    
}
function printStacks(){
    var inicio =  $("#stack_ini").val();
    var fin =  $("#stack_fin").val();
    var url = "barcodegen/Stacks.class.php?inicio="+inicio+"&fin="+fin+"";
    var title = "Impresion de Codigos de Barras Stacks";
    var params = "width=800,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    window.open(url,title,params); 
}