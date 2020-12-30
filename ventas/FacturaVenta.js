
//var abm_cliente = null;
var fecha_nac = "0000-00-00";
var data_next_time_flag = true;


var um_original = "";
var cantidad_original = 0;
var factorPrecio = 1;
var precioOriginal = 0;
var F = ""; // Codigo de Falla
var moneda_cliente = "G$";
var moneda = "G$";
var decimales = 0;
var operacion = "";  
var proforma;

var um_lista_precios = ['Mts'];
var um_cursor = 0;
   
var fallas = [];
var max_mts_fallas = 0;
var max_mts_fp = 0;

var art_inv = true; //Articulo de Inventario
var mnj_x_lotes = 'Si'

var PORC_VALOR_MINIMO = 1.25;

var UMBRAL_VENTA_MINORISTA = 370000;             

var UMBRAL_VENTA_MINORISTA_FORMATTED =  (UMBRAL_VENTA_MINORISTA).format(0, 3, '.', ',')


var CI_DIP = "C.I. Diplomatica";

var um_manual = false;
   


function inicializar(){
    
    $("#ruc_cliente").click(function(){ $(this).select(); });
      
    // Ruc para nuevo cliente
    $("#ruc_cliente").change(function(){
        var pais = $(this).val();
        if(pais != 'PY'){
            $("#ruc_cliente").mask("r99?rrrrrrr",{placeholder:""});
        }else{
            $("#ruc_cliente").mask("999?rrrrrrr",{placeholder:""});
        }
    });
    $("#nombre_cliente").click(function(){ 
        $(this).select();
        if(touch && (operacion == "crear")){
           showKeyboard(this,buscarClienteTouchNombre);   
        }        
    }); 
    // Para cargar Ventas Abiertas
    
    
    $("#cm_falla").focus(function(){
      selectFalla();
    });
    $("#cm_falla").click(function(){
       selectFalla();  
    });
       
        
    $("*[data-next]").keyup(function (e) {
        
        if (e.keyCode == 13) { 
            if(data_next_time_flag){
               data_next_time_flag = false;   
                                   
               if($(this).attr("id") == "nombre_cliente" || $(this).attr("id") == "ruc_cliente"){                   
                   buscarCliente(this);                  
               } 
               var next =  $(this).attr("data-next");
               $("#"+next).focus();               
               setTimeout("setDefaultDataNextFlag()",600);
            }
        } 
    });  
    $('.numeros:not("#cm_falla")').change(function(){
        var decimals = 2;
        if($(this).attr("id")=="precio_venta" || $(this).attr("id")=="cm_falla"  ){
            decimals = 0;
        }
        var n = parseFloat($(this).val() ).format(decimals, 3, '.', ',') ;
        $(this).val( n  );
        if($(this).val() =="" || $(this).val() =="NaN" ){
           $(this).val( 0);
        }
        chequearDatos();
     });
     $("#cm_falla").change(function(){
         chequearMtsFalla();
     });
     $(document).keyup(function (e) {
        
        if (e.keyCode > 111 && e.keyCode < 115) {  //F1:112 F2:113 F3:114  
           if( $("#cod_falla").text() !== ""){
              $("#cm_falla").focus();  
           }else{
              $("#msg_codigo").addClass("error");
              $("#msg_codigo").html("Esta Mercader&iacute;a no esta etiquetada con Fallas");
              setTimeout('$("#msg_codigo").html("")',14000);
           }
        }
  
        if(e.keyCode == 70){
            e.preventDefault(); 
            if(data_next_time_flag){
               data_next_time_flag = false;   
                if($("#fp").is(":checked")){ 
                    $("#fp").prop('checked', false);
                }else{
                    $("#fp").prop('checked', true); 
                }
                setTimeout("setDefaultDataNextFlag()",600);  
           } 
        }
          
     });
     //inicializarCursores("descrip"); 
     statusInfo();
     setTimeout('$("#ruc_cliente").focus()',500);
      
      /*
     if(moneda_cliente !== "G$" ){ 
         decimales = 2;
     }  */
     moneda = $("#moneda").val();
     if(moneda !== "G$" ){ 
         decimales = 2;
     } 
     if(touch){
       $("#cantidad").focus(function(){
          showNumpad("cantidad",setCantidad,false);
       });  
       $("#ruc_cliente").click(function(){
            if( !$(this).is('[readonly]')){
              showNumpad("ruc_cliente",buscarClienteTouch,true);
            }
       }); 
       $("#turno").click(function(){
           showNumpad("turno",setTurno,true);             
       });
       
     } 
     operacion = $("#operacion").val();
     if(touch && (operacion == "crear")){
          
        var abm_height = $("#abm_cliente").position().top + $("#abm_cliente").height();   
        $(".numpad").focus(function(){
            var id = $(this).attr("id");
            hideKeyboard();  
            var top = $(this).offset().top;
            var left = $(this).offset().left;             
            if(id == "fecha_nac"){
                $("#n_keypad .guion").val("/");
                $("#n_keypad .punto").val(".");
                showNumpad(id,checkFecha,true,0);  
            }else if(id == "ruc"){                
                $("#n_keypad .guion").val("-");
                $("#n_keypad .punto").val(".");
                showNumpad(id,checkRucCI,true,0);  
            }else{
                $("#n_keypad .guion").val("-");
                $("#n_keypad .punto").val(".");
                showNumpad(id,checkTelef,true,0);  
            }             
            $('#n_keypad').css({ 'top'  :top  ,'left' :left, 'margin-top': '-46px' });
        });
        $(".keyboard").click(function(){
            hideNumpad();
            showKeyboard(this,check,0,abm_height);
            if(!shift){    $(".capslock").trigger("click");     }    
        });
    } 
    var pref = $("#pref_pago").val();
    if(pref == "Contado" ){
        $("#contado").prop("checked",true);
        $("#tarjeta").prop("checked",false);
        $("#finalizar").prop("disabled",false); 
    }else if(pref == "Otros" ){
        $("#contado").prop("checked",false);
        $("#tarjeta").prop("checked",true);
        $("#finalizar").prop("disabled",false); 
    }else{
       $("#contado").prop("checked",false);
       $("#tarjeta").prop("checked",false); 
       $("#finalizar").prop("disabled",true); 
    }
    var cat = $("#categoria").val();
    if(cat > 2){
        getHistorialPrecios();
    }
    if($("#clase").val() == "Servicio"){   
        $(".area_insercion").css("background-color","#F5DA81");
    } 
           
}
function showKeyPad(){
    showNumpad("lote",buscarCodigo,false);
}
function setCantidad(){
    var c = $("#cantidad").val().replace(".",",");    
    $("#cantidad").val(c);
    chequearDatos();
}
function setTurno(){
   $("#boton_generar").focus(); 
}
function checkFecha(){
   checkDate($("#fecha_nac"));    
   hideKeyboard();    
}
function checkRucCI(){    
   checkRUC($("#ruc"));    
   hideKeyboard();    
}
function checkTelef(){
   checkTel($("#tel"));    
   hideKeyboard();    
}
function check(){
    checkNombre($("#nombre"));
    hideKeyboard();    
}
function nuevoCliente(){  
    $("[data-error]").removeAttr("data-error");  
    hideKeyboard();  
    var window_width = $(document).width()  / 2;
    var abm_width = $("#abm_cliente").width()  / 2;        
    var posx = (window_width - abm_width) ;   
    $("#abm_cliente").css({left:posx,top:36});   
    $( "#abm_cliente" ).fadeIn();   
    $("#ruc").val( $("#ruc_cliente").val() );
    $("#nombre").val( $("#nombre_cliente").val() );
}
function buscarClienteTouch(){
    buscarCliente($("#ruc_cliente"));
}
function buscarClienteTouchNombre(){
    buscarCliente($("#nombre_cliente"));
}

function ocultar(){
     $( "#boton_generar" ).fadeOut("fast"); 
}
function mostrar(){     
    getCotiz();    
    
    $("#boton_nuevo_cliente").fadeOut();
    if($.trim($("#turno").val()).replace(/\D/g,'').length > 0){
        $("#boton_generar").fadeIn(); 
    }
     getLimiteCredito();   
}
function cambiarMonedaFactura(){ 
    var mon = $("#moneda").val();
    if(mon == "G$"){
        moneda = "U$";$("#moneda").val("U$");
        getCotiz();
    }else{
        moneda = "G$";$("#moneda").val("G$");$("#cotiz").val("1");
    } 
    buscarFacturasDeCliente();
}
function verificarMoneda(){ 
    totalizar();
    
    var mon = $("#moneda").val();
    if(mon === "G$"){
         decimales = 0;
         $(".cotiz").fadeOut();
    }else{
       decimales = 2; 
       getCotiz();
       $(".cotiz").fadeIn(); 
    }
    getLimiteCredito();
}
function setDefaultDataNextFlag(){
    data_next_time_flag = true;
}
function selectFalla(){
    $("#cm_falla").select(); 
    if($("#fp").is(":checked") ){
         $("#msg_codigo").addClass("infoblue").html("Ingrese la sobra en Centimetros"); 
    }else{
         $("#msg_codigo").addClass("infoblue").html("Ingrese la falla en Centimetros"); 
    } 
}

function cerrar(){
   $( "#ui_clientes" ).fadeOut("fast");
   $( "#boton_generar" ).fadeOut("fast");      
}

function getCotiz(){
  var moneda =  $("#moneda").val();
  if(moneda !== 'G$'){         
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {action:"getCotiz", suc: getSuc(),moneda:moneda },
            async: true,
            dataType: "json",
            beforeSend: function() {},
            success: function(data) {   
                if(moneda == 'U$'){
                   var dolares = data.Dolares.compra;   
                   $("#cotiz").val(dolares);
                }else if(moneda == 'R$'){
                   var reales = data.Reales.compra; 
                   $("#cotiz").val(reales);
                }else{
                   var pesos = data.Pesos.compra;
                   $("#cotiz").val(pesos);
                }             
            }
        });
    }    
}

function seleccionarCliente(obj){
    hideKeyboard();
    var cliente = $(obj).find(".cliente").html(); 
    var ruc = $(obj).find(".ruc").html();  
    var codigo = $(obj).find(".codigo").html();
    var cat = $(obj).find(".cat").html(); 
    var moneda = $(obj).find(".codigo").attr("data-moneda");
    var tipo_doc = $(obj).attr("data-tipo_doc");
    moneda_cliente = $(obj).find(".codigo").attr("data-moneda"); // Desabilitado temporalmente
    //moneda_cliente = "G$";
    
    $("#ruc_cliente").val(ruc);
    $("#nombre_cliente").val(cliente);
    $("#codigo_cliente").val(codigo);
    $("#categoria").val(cat);
    $("#tipo_doc").val(tipo_doc);
    $("#moneda").val(moneda); 
     
 
    getCotiz();
    //$("#cotiz").val(x);
    $( "#ui_clientes" ).fadeOut("fast");
    $("#msg").html(""); 
    $("#boton_nuevo_cliente").fadeOut();
    if($.trim($("#turno").val()).replace(/\D/g,'').length > 0){
        $("#boton_generar").fadeIn(); 
    } // Habilitar boton generar factura 
    $( "#turno").focus();
    getLimiteCredito();
}

function setFP(){
    var fp = $("#fp").is(":checked");    
    if(fp){        
       falla(true,"FP");$("#cm_falla").focus().select(); 
       max_mts_fp = 30;
    }else{  
       max_mts_fp = 0;
       $("#cod_falla").text(F); 
       if(F == ""){
            falla(false,F);
       }else{
          falla(true,F); 
       }
       $("#cm_falla").focus().select(); 
    }
}
    
function mostrarAreaDeCarga(factura){
    $("#msg").html("");
    $("#factura").val(factura); 
    $(".factura_inv").toggleClass("factura");
    $("#area_carga").fadeIn("fast");     
    $("#lote").focus();    
}

function crearFactura(){   
    hideKeyboard();  
    var usuario = getNick();
    var suc = getSuc();
    var cod_cli = $("#codigo_cliente").val();
    var clase = $("#clase").val();  
     
    var moneda = $("#moneda").val();
    var cotiz = $("#cotiz").val();
     
    if(moneda != "G$"){
        decimales = 2;
    }
    
    var tipo_doc = $("#tipo_doc").val();   
    var turno = parseFloat($("#turno").val());
    if(isNaN(turno)){
        errorMsg("Debe ingresar el Numero de Turno",8000);
        return;
    }
    
    if(cod_cli !=""){
       $("#boton_generar").remove();
       $("#ruc_cliente").attr("readonly","true");
       $("#nombre_cliente").attr("readonly","true");
       $(".currency").css("opacity","0");
       $(".currency").unbind("click");
       $(".currency").removeAttr("onclick");
        $.ajax({
                type: "POST",
                url: "ventas/NuevaVenta.class.php",
                data: {"action":"crearFactura","usuario":usuario,"cod_cli":cod_cli,"suc":suc,"moneda":moneda,"cotiz":cotiz,turno:turno,"id":turnoData.id,"fecha":turnoData.fecha,"llamada":turnoData.llamada,clase:clase}, 
                async:true,
                dataType: "html",
                beforeSend: function(){
                    $("#msg").html("<img src='img/loading.gif' width='22px' height='22px' style='margin-bottom:-5px' >");                      
                }, 
                complete: function(objeto, exito){
                    if(exito=="success"){                                 
                      var factura =  $.trim(objeto.responseText) 
                      operacion = "editar";
                      $("#operacion").val("editar")
                      mostrarAreaDeCarga(factura);
                      $(".turno").fadeOut();
                      if($("#clase").val() == "Servicio"){   
                         $(".area_insercion").css("background-color","#F5DA81");
                      }
                      $("#clase").prop("disabled",true);
                     }
                },
                error: function(){
                     $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
                }
        });  
       
       
    }else{
       $("#msg").toggleClass("error");
       $("#msg").html("Debe seleccionar un cliente v&aacute;lido");
    }     
}
function getLotesMenores(lote,cantidad,stock){
    $.ajax({
        type: "POST",
        url: "ventas/NuevaVenta.class.php",
        data: {"action": "getLotesMenores", lote: lote,cantidad:cantidad,stock:stock,suc:getSuc(),usuario:getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            if(data.length > 0){
                var sucur = getSuc();
                $(".tr_cli_art").remove();                 
                $("#lista_articulos_cab").width($("#articulos").width()-20);
                $("#lista_articulos").width($("#articulos").width()-20);    
                for (var i in data) {
                    var BatchNum = data[i].lote;
                    var Quantity = ( parseFloat( data[i].stock)).format(2,3,'.',',');       
                    var img = data[i].img;
                    var ubicacion = data[i].ubicacion;
                    var miniimg = "<img src='img/image.png' onclick=cargarImagenLote('"+img+"')  style='cursor:pointer;'>";          
                    $("#lista_articulos").append("<tr class='tr_cli_art menores fila_articulo_"+i+"' title='Articulo identico de menor tamaño'><td class='item'><span class='codigo_lote'>"+BatchNum+"</span></td> <td class='itemc'><span class='itemc'>"+sucur+"</span> </td><td  class='num'><span class='num'>"+Quantity+"</span></td><td class='itemc'><span class='itemc'>"+ubicacion+"</span></td>  <td class='itemc'><span class='itemc'>"+miniimg+"</span></td></tr>");
                    //console.log(BatchNum+"  "+ Quantity +"+ "+img);
                }
                $("#art_menores").html("<img src='img/important.png' onclick='showMenores()' title='Hay lotes con mejores cantidades que este'  style='cursor:pointer;;margin-bottom:-10px'>");
            }else{
                $("#art_menores").html("");
            }
            $("#msg").html(""); 
        }
    }); 
}
function showMenores(){
    $(".info_titulo").css("background","yellow")
    $(".info_titulo").html("Sugerencia de cambio de lote");
    $(".similar").remove();               
    $("#articulos").fadeIn("fast");
}
function chequearDatos(){
    
    var lote = $("#lote").val();
    var codigo = $("#codigo").val();
    var stock = float("stock");
    var precio = float("precio_cat");
    var precio_venta = float("precio_venta");
    var cantidad = float("cantidad");
    var subtotal = (precio_venta * cantidad).format(decimales,20, '', '.');
    var subtotal_format = (precio_venta * cantidad).format(decimales,3, '.', ',');
    $("#subtotal").val(subtotal_format);
    
    var limiteCredito = parseFloat($("input#limite_credito").data('limite'));
    var limiteReal = parseFloat($("input#limite_credito").data('limiteReal'));
    var restantes = chequearLimite();
    var cm_falla = float("cm_falla");   
    var gramaje = float("gramaje");
    var ancho = float("ancho");
    var um = $("#um").val();   
    var fin_pieza = $("#estado_fp").html();

    $("input#limite_credito").val((limiteCredito - subtotal).format(0,3,'.',','));
    
    if(lote.length > 2 && codigo.length > 2  && stock > 0 && cantidad > 0){
        if(art_inv){// Y manejado por lotes 
           getLotesMenores(lote,cantidad,stock);
        }
    }

    if(lote.length > 2 && codigo.length > 2  && stock > 0 && (precio_venta >= precio) && (precio > 0) && ((stock >= cantidad) && (cantidad > 0) )  && restantes > 0 && cm_falla <=40 && fin_pieza != "FP" /*&& ((limiteCredito - subtotal) > 0 || limiteReal == 0) */){// 40 Cm con la Autorizacion de la Gerente
       
        if($("#um").val()==="Kg" && (gramaje == 0 || ancho == 0)){
            $("#msg_codigo").html("Error de Gramaje, verifique los datos Gramaje o Ancho incorrectos...");
            $("#add_code").attr("disabled",true); 
            $("#msg_codigo").attr("class","error");  
            return;
       }else{ 
          $("#add_code").removeAttr("disabled");  
       } 
    }else{  
       $("#add_code").attr("disabled",true);  
    }
     
    if(cantidad > 0 && (cantidad > stock)){
        errorMsg("Stock insuficiente...",10000);
        $("#cantidad").focus();
        $("#cantidad").select();
        $("#cantidad").addClass("error");
    }else{
        $("#cantidad").removeClass("error");
        if(mnj_x_lotes === "Si" && cantidad > 0){ // Solo buscar si es articulo de inventario y de venta
           getFallas();
        }
    }

    if((limiteCredito - subtotal) <= 0  && limiteReal > 0){
        errorMsg("Supero el limite de credito",10000);
        $("input#limite_credito").addClass("alerta");
    }else{
        $("input#limite_credito").removeClass("alerta");
    }

    if(restantes > 0){
        $("#msg_codigo").html("");
    }else{
       $("#msg_codigo").attr("class","error");  
       $("#msg_codigo").html("Ha llegado al Limite de piezas en esta Factura.");         
       $("#add_code").attr("disabled",true);  
       errorMsg("Ha llegado al Limite de piezas en esta Factura, Genere una nueva Factura.",10000);
    }
    //Habilitar o desabilitar FP
    var log10 =  parseFloat( (Math.log10(stock) + 0.3).toFixed(2)  );  

    var diff = stock - log10;

    //console.log("Log10 "+log10+"  Diff "+diff);
    if(cantidad >= diff){
        $(".fp").fadeIn();
    }else{
        $("#fp").removeAttr("checked");
        $(".fp").fadeOut();
        max_mts_fp = 0;
    }
     
}
function getFallas(){
    var codigo = $("#codigo").val();
    var lote = $("#lote").val();
    var stock =  parseFloat( $("#stock").val().replace(/\./g, '').replace(/\,/g, '.')  );
    var vender =  parseFloat( $("#cantidad").val().replace(/\./g, '').replace(/\,/g, '.')  );
    $.ajax({
        type: "POST",
        url: "ventas/FacturaVenta.class.php",
        data: {action: "getFallas", codigo: codigo, lote: lote,vender:vender},
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
            if(data.length > 0){
                fallas = data;
                max_mts_fallas = fallas.length * 30;
                
                falla(true,"F");
                
                $(".grafico_fallas").slideDown();                
                var porc_vender = parseInt((vender * 100) / stock);
                
                $('#total_vender').animate({  
                  width:''+porc_vender+'%'
                }, 2000, function() {
                   for(var i in data){
                    var  tipo_falla = data[i].tipo_falla;
                    var ubic_falla = data[i].ubic_falla;
                    var ubic_real = parseFloat(data[i].ubic_real);
                    var calc_pos_falla = parseInt((ubic_real * 100) / vender);
                    setTimeout( "showFalla("+calc_pos_falla+",'"+tipo_falla+"')",500);
                    //console.log("Falla: "+tipo_falla+"   Vender: "+vender+"  Ubic Falla "+ubic_real+"  Calc Pos "+calc_pos_falla);
                   } 
                });
                
                chequearMtsFalla();
                
            }else{
               $(".grafico_fallas").slideUp();
            }
        },
        error: function (e) {                 
            $("#msg").html("Error al obtener fallas:  " + e);   
            errorMsg("Error al obtener fallas:  " + e, 10000);
        }
    }); 
}
function chequearMtsFalla(){
    var cm_falla = float("cm_falla");  console.log(cm_falla);
    var stock = float("stock");
    var cantidad = float("cantidad");
    
    if(cm_falla > (max_mts_fallas + max_mts_fp) || cm_falla < 0   ){        
        $("#add_code").prop("disabled",true);
        $("#msg_codigo").attr("class","error");  
        $("#msg_codigo").html("Falla solo puede ser hasta 30cm x cada falla + 30cm por Fin de Pieza");  
        $("#cm_falla").va("");
    }else{
        $("#msg_codigo").html("");
        //chequearDatos(); 
    }
    if(cm_falla > 0 && ((cantidad + (cm_falla / 100)) > stock )){
        var restante = parseFloat((stock - cantidad) * 100);
        if(restante > (max_mts_fallas + max_mts_fp)){
            restante = (max_mts_fallas + max_mts_fp);
        }
        $("#cm_falla").val( (restante).format(2, 20, '', '.')) ;
    }
    
}
function chequearLimite(){
    var limite_detalles = float("limite_detalles");
    
    //var cant_detalles = $(".codigo_lote").length;
    
    var hashes = {};

    $(".hash").each(function(){
        var hs =  $(this).attr("data-hash"); 
        var c = hashes[hs]; 
        if(c == undefined){ c = 0 };        
        hashes[hs] = c + 1; 
    });
    var cant_detalles = Object.keys(hashes).length; 
     
    //var cant_detalles = $(".codigo_lote").length;
    
    var restantes = limite_detalles - cant_detalles;
    var  pref_pago = $('input[name=forma_pago]:checked').val(); 
    if( cant_detalles > 0 && (pref_pago !== undefined)  ){
        if( restantes >= 0 ){
           $("#finalizar").removeAttr("disabled"); 
        }else{
           errorMsg("Demasiados articulos, mueva algunos a otra factura...",10000); 
        }
    }else{
        $("#finalizar").attr("disabled",true);
    }
    return restantes;
}
function limpiarAreaCarga(){
   $(".dato:not('#um')").val(""); 
   $("#add_code").attr("disabled",true);  
   $("#fp").prop("checked",false);
}
var detdesc = null; // Solo para uso depurativo
function addCode(){
    $("#add_code").attr("disabled",true);
    var factura = $("#factura").val();
    var lote = $.trim($("#lote").val().toUpperCase());
    var codigo = $.trim($("#codigo").val());
    var stock = float("stock");
    var um = $("#um").val();
    var ancho = float("ancho");
    var tara = float("tara");
    var gramaje = float("gramaje");
    var descrip = $("#descrip").val();
    var precio = float("precio_cat");
    var precio_venta = float("precio_venta");
    var cantidad = float("cantidad");
    var subtotal = float("subtotal");
    var categoria = $("#categoria").val(); 
    var cod_falla = $("#cod_falla").text();
    var cm_falla = $("#cm_falla").val();
    var fp = $("#fp").is(":checked");
    var um_prod = $("#um").attr("data-um_prod");
    var tipo_doc = $("#tipo_doc").val();
    var estado_venta = $("#lote").data("estado_venta");
    if(precio > 0){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "agregarDetalleFactura",usuario:getNick(),suc:getSuc(),"factura":factura, "codigo": codigo,"lote":lote,"um":um,"descrip":descrip,"precio_venta":precio_venta,"cantidad":cantidad,"subtotal":subtotal,"cat":categoria,"cod_falla":cod_falla,"cm_falla":cm_falla,"gramaje":gramaje,"ancho":ancho,tara:tara,fp:fp,um_prod:um_prod,tipo_doc:tipo_doc,estado_venta:estado_venta,mnj_x_lotes:mnj_x_lotes},
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg_codigo").html("<img src='img/loadingt.gif'>");     
        },
        success: function(data) {   
            var mensaje = data.Mensaje;
            if(mensaje=="Ok"){
               $(".grafico_fallas").fadeOut();
               $("#msg_codigo").html("<img src='img/ok.png'>");                
               $("#lote").val("");
               $("#lote").focus();
               limpiarAreaCarga();
               var total = parseFloat(data.Total).format(decimales, 3, '.', ',') ; 
               var descuento = parseFloat(data.Descuento).format(decimales, 3, '.', ',') ; 
               var DescuentoNormal = parseFloat(data.DescuentoNormal).format(decimales, 3, '.', ',') ; 
               var cantf = cantidad.format(2, 3, '.', ',') ;  
               var preciof = precio_venta.format(decimales, 3, '.', ',') ;  
               var subtotalf = subtotal.format(decimales, 3, '.', ',') ;
               var total_sin_desc = parseFloat(data.Total_sin_desc) ; 
               var detalle_descuentos = data.DetalleDescuentos; 
               var desc_sedeco = parseFloat(data.DescuentoSEDECO).format(0, 3, '.', ',') ; 
               detdesc = detalle_descuentos;
               if(mnj_x_lotes === "No"){
                   lote = "";
               }
               appendDetail(codigo,lote,descrip,cantf,um,preciof,subtotalf,total,descuento,cod_falla,cm_falla,fp,estado_venta,desc_sedeco);
               var desc = parseFloat(data.DescuentoNormal) ;  
               
               
                 
               //$("#desc_sedeco").text(desc_sedeco); 
               //var porcentaje_descuento = parseFloat(data.Porc_desc) ; 
               if(categoria < 3){
                   if(total_sin_desc >= UMBRAL_VENTA_MINORISTA && desc > 50 && tipo_doc != CI_DIP ){
                       $("#msg_det").html("Descuento x compra > "+UMBRAL_VENTA_MINORISTA_FORMATTED+" Gs.");                                
                   }else{
                       $("#msg_det").html("");  
                   } 
               }
               
               corregirSubtotales(detalle_descuentos);  
               
               var restantes = chequearLimite();
               if(restantes <= 0){
                    $("#msg_codigo").attr("class","error"); 
                    $("#msg_codigo").html("Ha llegado al Limite de piezas en esta Factura."); 
                    $("#add_code").attr("disabled",true);  
                    errorMsg("Ha llegado al Limite de piezas en esta Factura, Genere una nueva Factura.",10000)
               }
               getLimiteCredito();
            }else{
               $("#msg_codigo").attr("class","error"); 
               $("#msg_codigo").html(mensaje); 
               $("#lote").focus();$("#lote").select();
               $("#add_code").attr("disabled",true);  
            }            
        }
    }); 
    }else{
        errorMsg("Precio no establecido para moneda: "+$("#moneda").val(),10000);
    }
}
function appendDetail(codigo,lote,descrip,cant,um,precio,subtotal,total,descuento,cod_falla,cm_falla,fp,estado_venta,desc_sedeco){       
    var falla = cm_falla!="0" &&  cm_falla!="" ? (cm_falla / 100)+"/F": "";
    if(fp){
      falla = cm_falla!="0" ? (cm_falla / 100)+"/F+FP": "0/FP";
    }    
    var h =   precio.toString().replace(".","").replace(",","");
    var hash = codigo+"_"+h;
  
    $(".tr_total_factura").remove();
    $("#detalle_factura").append('<tr id="tr_'+codigo+'-'+lote+'" class="hash" data-hash="'+hash+'" ><td class="item codigo_art">'+codigo+'</td> <td class="item codigo_lote" data-codigo="'+codigo+'" title="'+codigo+'" >'+lote+'</td><td class="item '+estado_venta+' descrip">'+descrip+'</td><td class="num cantidad">'+cant+'</td><td  class="itemc">'+um+'</td><td  class="itemc">'+falla+'</td><td class="num precio_venta">'+precio+'</td><td class="num descuento">0</td><td class="num subtotal_det">'+subtotal+'</td><td class="itemc"><img class="del_det trash" title="Borrar Esta Pieza" style="cursor:pointer" src="img/trash_mini.png" onclick=delDet("'+codigo+'","'+lote+'");></td></tr>');
    $("#detalle_factura").append('<tr class="tr_total_factura" style="font-weight: bolder"><td >&nbsp;Totales</td><td></td><td id="msg_det" style="text-align: center;font-size: 11" class="info"></td><td id="total_cantidades" style="text-align: right;" class="num"></td><td colspan="3" style="text-align: center"><label class="sedeco"><b>Redondeo SEDECO:</b></label>&nbsp;<label class="sedeco" id="desc_sedeco">'+desc_sedeco+'</label><b class="sedeco">&nbsp;G$.</b></td><td id="descuento_factura" style="text-align: right;" class="num descuento">'+descuento+'</td><td style="text-align: right;" id="total_factura" class="num">'+total+'&nbsp;'+moneda+'.</td><td style="text-align:center"><img src="img/medios_pago.png" height="18" width="18" style="cursor:pointer" onclick="verMonedasExtranjeras()"></td> </tr>');
}
function corregirSubtotales(detalle_descuentos){ 
   //console.log(detalle_descuentos.length);
   
   detalle_descuentos.forEach(function(e){
       var codigo = e.codigo;
       var lote = e.lote;
       var desc = parseFloat(  e.descuento) .format(1, 3, '.', ',') ;  
       var subtotal = parseFloat(e.subtotal).format(decimales, 3, '.', ',') ;
       //console.log(lote+"   "+desc+"   "+subtotal);
       $("#tr_"+codigo+"-"+lote).find(".descuento").html(desc);
       $("#tr_"+codigo+"-"+lote).find(".subtotal_det").html(subtotal);
   });
       
   totalizar();
} 
function totalizar(){    
    var total = 0;
    var total_descuento = 0;
    var total_cantidades = 0;
    $(".cantidad").each(function(){ 
        var cant =  parseFloat( $(this).text().replace(/\./g, '').replace(/\,/g, '.')  );
        var precio=  parseFloat(  $(this).next().next().next().text().replace(/\./g, '').replace(/\,/g, '.') ); 
        var descuento=  parseFloat(  $(this).next().next().next().next().text().replace(/\./g, '').replace(/\,/g, '.') ); 
        total_descuento +=descuento;
        var subtotal = parseFloat((cant * precio ) - descuento) ;    
        //console.info(cant +"  "+precio+ "  "+descuento +" = "+total_descuento);
        total += subtotal;  
        total_cantidades += cant;
    }); 
    //console.info("Total: "+total);
    //console.info("Total_descuento: "+total_descuento); 
    var desc_sedeco = parseFloat( $("#desc_sedeco").text()); 
    
     
    total -= desc_sedeco;
    
    var total_format = (total).format(decimales, 3, '.', ',');
    
    console.info("total_format  "+total_format+"    decimales: "+decimales); 
    var total_descuento_format = (total_descuento).format(1, 3, '.', ',');
    total_cantidades = (total_cantidades).format(2, 3, '.', ',');  
    
        
    $("#total_factura").html(""+total_format+"&nbsp;"+moneda+".");        
    $("#descuento_factura").html(total_descuento_format);
    $("#total_cantidades").html(total_cantidades);
    
    if($("[name=moneda_pago]:checked").length > 0){
        var mon = $("[name=moneda_pago]:checked").attr("id").substring(7,9);
        var cotiz = float("cotiz_"+mon);
        var total_me = (total / cotiz).format(2, 3, '.', ','); 
        $("#total_me").val(total_me+" "+mon.toUpperCase().replace("S","$")+".");     
    }
    if(desc_sedeco > 0){
        $(".sedeco").fadeIn();
    }else{
        $(".sedeco").fadeOut();
    }
    $("#lote").focus();
}
function delDet(codigo,lote){
 var tipo_doc = $("#tipo_doc").val();  
 var cod_desc = $("#cod_desc").val();
 $( "#dialog-confirm" ).dialog({
      resizable: false,
      height:140,
      modal: true,
      dialogClass:"ui-state-error",
      buttons: {
        "Cancelar": function() {
          $( this ).dialog( "close" );
        },  
        "Borrar esta Pieza": function() {
            $( this ).dialog( "close" );   
            var factura = $("#factura").val();
            var categoria = $("#categoria").val();
            $.ajax({
                type: "POST",
                url: "Ajax.class.php",
                data: {"action": "borrarDetalleFactura", "factura": factura,"codigo":codigo,"lote":lote,"cat":categoria,tipo_doc:tipo_doc,cod_desc:cod_desc},
                async: true,
                dataType: "json",
                beforeSend: function() {
                    $("#msg").html("<img src='img/loadingt.gif' > <img src='img/delete.png' >"); 
                },
                success: function(data) {   
                    var mensaje = data.Mensaje;
                    if(mensaje == "Ok"){
                        var total = parseFloat(data.Total).format(decimales, 3, '.', ',') ; 
                        var descuento = parseFloat(data.Descuento).format(decimales, 3, '.', ',') ; 
                         
                        if(isNaN(total)){
                            total = 0;
                            $("#desc_sedeco").text("0");
                            
                        }else{
                            var total_sin_desc = parseFloat(data.Total_sin_desc) ; 
                            var desc = parseFloat(data.Descuento) ; 
                            //var porcentaje_descuento = parseFloat(data.Porc_desc) ; 
                            if(categoria < 3){
                               if(total_sin_desc >= UMBRAL_VENTA_MINORISTA && desc > 0 && (tipo_doc != CI_DIP) ){
                                   $("#msg_det").html("Descuento x compra > "+UMBRAL_VENTA_MINORISTA_FORMATTED+" Gs.");                                
                               }else{
                                   $("#msg_det").html("");  
                               } 
                            }
                        }
                        var detalle_descuentos = data.DetalleDescuentos;
                        corregirSubtotales(detalle_descuentos);  
                        detdesc = detalle_descuentos;
                        $("#tr_"+codigo+"-"+lote).remove();
                         
                        chequearLimite();
                        $("#lote").focus();
                        $("#msg").html(""); 
                        getLimiteCredito();
                        totalizar();
                    }else{
                        alert("Mensaje: "+mensaje+"  Cierra la ventana.");
                    }
                }
            });
        } 
     },        
    Cancel: function() {
      $( this ).dialog( "close" );
    }
 });    
     
}
function cambiarUM(){
   um_manual = true; 
   if(um_cursor > um_lista_precios.length - 1){
       um_cursor = 0;
   } 
   var um_venta = um_lista_precios[um_cursor].um;
   $("#um").val(um_venta);
   var precio = um_lista_precios[um_cursor].precio;
   var descuento = um_lista_precios[um_cursor].descuento
   var preciox = redondear50(parseInt(precio - descuento));  
   if(moneda != "G$"){  // No se redondea si es USS
        preciox =  parseFloat(precio - descuento);
   } 
   var precio = parseFloat(  preciox  ).format(decimales, 3, '.', ',');
   $("#precio_cat").val(precio);
   $("#precio_cat").attr("data-precio",precio);
   $("#precio_venta").val(precio);
   um_cursor++;   
   
   // Calculo de las cantidades de Stcok por esta unidad de medida
   var um_prod = $("#um").attr("data-um_prod");
   var um_venta = $("#um").val();
   var gramaje = parseFloat($("#gramaje").val());
   var ancho = parseFloat($("#ancho").val().replace(",","."));
   var tara = parseFloat($("#tara").val());
   tara =0;
   
   var units = ["Mts","Unid","Kg"];
   
   var stock_disponible = parseFloat($("#stock").attr("data-stock_disponible"));  console.log("stock_disponible: "+stock_disponible);
   
   if((um_prod === um_venta) && (units.indexOf(um_venta) > -1)){
       $("#stock").val(parseFloat(  stock_disponible   ).format(2, 3, '.', ','));
   }else if((um_prod === "Mts") && (um_venta === "Kg")){
       var kg = (   ( (stock_disponible * gramaje * ancho ) / 1000 ) + (tara / 1000)   ).format(2, 3, '.', ',');
       $("#stock").val(kg);
   }else if((um_prod === "Kg") && (um_venta === "Mts")){
       var mts =  (((stock_disponible - (tara / 1000)) * 1000) / (gramaje * ancho)  );
       $("#stock").val(mts);
   }
   
}
function noUm(bool){
    if(bool){
       $("#change_um").css("opacity","1").css("cursor","pointer");
       $("#change_um").click(function(){
           cambiarUM();
       });
    }else{
       $("#change_um").css("opacity","0").css("cursor","not-allowed");
       $("#change_um").unbind("click");
       $("#change_um").removeAttr("onclick");
       um_original = "";
       cantidad_original = 0;
       factorPrecio = 1;
       precioOriginal = 0;
       falla(false,"F");
       $("#precio_cat").attr("data-precio",parseFloat( 0 ).format(2, 3, '.', ',')); 
       $("#msg_codigo").removeClass("infoblue").html("");
       
       $("#fp").removeAttr("checked");
    } 
}
function falla(bool,cod_falla){
   var visible = "hidden";
   bool?visible = "visible":"hidden";
   $(".grafico_fallas").fadeOut();       
   $(".falla").css("visibility",visible);  
   $("#cod_falla").text(cod_falla);
   $("#cm_falla").val("");
}

function buscarCodigo(){   
    var FP = "";
    limpiarAreaCarga();
    var lote = $("#lote").val();
    var suc = getSuc();    
    var categoria = $("#categoria").val();
    var moneda = $("#moneda").val();
    var um = $("#um").val();   
    
    if(lote != ""){
       
    $("#info").fadeIn("fast"); 
         
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action":"buscarDatosDeCodigo","lote":lote,"categoria":categoria,"suc":suc,moneda:moneda,um:um}, 
        async:true,
        dataType: "json",
        beforeSend: function(){
           noUm(0);
           $("#msg_codigo").html("<img src='img/loadingt.gif' >");             
        },
        success: function(data){ 
            var existe = data.existe;
            $("#msg_codigo").attr("class","info");
            if( existe === "true" ){
                var Status = data.estado_venta; // Bloqueado,Normal,Oferta,Arribos,FP
                var stock = data.stock; 
                $("#codigo").val(data.codigo); 
                var color = data.color;
                var descrip = data.descrip;
                if(color !== '' && color != undefined){
                    descrip+="-"+color;
                }
                $("#descrip").val(descrip);
                $("#stock").val(  parseFloat( data.stock  ).format(2, 3, '.', ',')   );
                $("#stock").attr("data-stock",parseFloat( stock  ).format(2, 3, '.', ','));
                $("#stock").attr("data-stock_disponible",   stock     );
                $("#lote").prop("title","Codigo Art: "+stock)
                $("#lote").data("estado_venta",Status);
                $("#descrip").prop("title","Codigo Art: "+data.codigo);                
                $("#um").val(data.um_venta); 
                
                art_inv =   JSON.parse(data.art_inv);
                mnj_x_lotes =   data.mnj_x_lotes ;
                
                if(Status != 'FP' && Status != 'Bloqueado'){
                   $("#cantidad").removeAttr("disabled")
                }else{
                    $("#cantidad").attr("disabled",true);
                }
                  
                
                var precio = data.precio;
                var descuento = data.descuento;
                 
                um_lista_precios = data.um_lista_precios;
                
                
                if(um_lista_precios.length > 1){
                    noUm(1);
                }else{
                    noUm(0);
                }
                
                
                var preciox = redondear50(parseInt(precio - descuento));  
                if(moneda != "G$"){  // No se redondea si es USS
                     preciox =  parseFloat(precio - descuento);
                } 
                var precio = parseFloat(  preciox  ).format(decimales, 3, '.', ',');
                
                console.log("preciox "+preciox+"  precio "+precio);
                
                var ancho = parseFloat(  data.ancho ).format(2, 3, '.', ',');
                var gramaje = parseFloat(  data.gramaje ).format(2, 3, '.', ',');
                var tara = parseFloat(  data.tara ).format(2, 3, '.', ',');
                
                if(Status == "FP"){
                   FP = "FP";
                   $("#estado_fp").fadeIn();
                }else{
                   FP = "";
                   $("#estado_fp").fadeOut();
                }                  
                    
                cantidad_original = data.stock;
                precioOriginal = data.precio;
                /*
                   if(((um==="Mts" && categoria > 4) || um==="Kg") && data.ancho > 0 && data.gramaje > 0 ){  
                }*/
                                
                um_prod = data.um_prod;// Global para poder trabajar con las unidades de medida
                $("#um").attr("data-um_prod",data.um_prod);
                $("#ancho").val(ancho);  
                $("#gramaje").val(gramaje);  
                $("#tara").val(tara);  
                
                $("#precio_cat").val(precio);
                $("#precio_cat").attr("data-precio",precio);
                $("#precio_venta").val(precio);
                
                 
                $("#estado_fp").html(FP);  
                $("#cantidad").focus();
                $("#cantidad").select();                 
                data_next_time_flag = false;
                if(Status !='Bloqueado' && Status !='FP'){
                   $("#msg_codigo").html("<img src='img/ok.png'>"); 
                   if( art_inv ){buscarStockComprometido(lote);}
                }else{
                   $("#msg_codigo").addClass("error");
                   $("#msg_codigo").html("Codigo Bloqueado para Ventas! Consulte con compras...");    
                }
                
                var imagen = data.img; 
                $("#imagen_lote").fadeIn("fast");
                if(imagen != ""){
                    var images_url = $("#images_url").val();
                    $("#imagen_lote").attr("src",images_url+"/"+imagen+".thum.jpg"); 
                    $("#imagen_lote").click(function(){ cargarImagenLote(imagen);});
                }else{
                   $("#imagen_lote").attr("src","img/no-image.png"); 
                   $("#imagen_lote").off("click");
                }                
                
                if(data.um_venta != um && um != "" && um_manual){
                    $("#msg_codigo").addClass("error");
                    $("#msg_codigo").html("No se ha definido precios para esta unidad de Medida: "+um);  
                    errorMsg("No se ha definido precios para esta unidad de Medida: "+um,12000);  
                }else{
                    um_manual = false;
                } 
                
                setTimeout("setDefaultDataNextFlag()",500);
               
            }else{
                $("#msg_codigo").addClass("error");
                $("#msg_codigo").html("Codigo no encontrado o Bloqueado");                
                $("#imagen_lote").attr("src","img/no-image.png");
                $("#imagen_lote").fadeOut("fast");
                //limpiarAreaCarga();
                $("#lote").focus(); 
                $("#info").fadeOut("fast"); 
            }
        },
        error: function(e){ 
           $("#msg_codigo").addClass("error");
           $("#msg_codigo").html("Error en la comunicacion con el servidor:  "+e);
        }
    });
    }else{
         $("#info").fadeOut("fast");
    } 
}
function showFalla(calc_pos_falla,tipo_falla){
    $('#total_vender').append("<div style='margin-left:"+calc_pos_falla+"%'> <span class='falla_indic' >"+tipo_falla+"</span></div> ");
}


function buscarStockComprometido(lote){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "buscarStockComprometido", lote: lote,suc:getSuc(),"incluir_reservas":"No"},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#stock_comprometido").html("");
            $("#stock_compr").html("");
        },
        success: function (data) {   
            var comprometido = 0;
            var st_comp = "<table class='stock_comprometido' border='1'>";
            st_comp+="";
            if(data.length > 0){
                var st_comp = "<table class='tabla_stock_comprometido' border='1'>";
                st_comp+="<tr><th colspan='6' style='background:lightskyblue;'>Stock Comprometido</th><th style='text-align:center;background:white'>X</th></tr>";
                st_comp+="<tr class='titulo' style='font-size:10px'><th>Doc</th><th>Factura</th><th>Usuario</th><th>Fecha</th><th>Suc</th><th>Estado</th><th>Cantidad</th><tr>";
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
                 
                var stock_limpio = float("stock") - comprometido;
                $("#stock").val(  parseFloat( stock_limpio  ).format(2, 3, '.', ',')   );
                $("#stock").attr("data-stock_disponible",   stock_limpio     );
                $("#stock_compr").html("<img src='img/warning_red_16.png' onclick='verStockComprometido()' title='Alguien mas tiene cargada esta pieza en una Factura!'>");
                $("#stock_comprometido").html(st_comp);
                $(".tabla_stock_comprometido").click(function(){
                    verStockComprometido();
                });
            }
            $("#msg").html(""); 
        }
    });
}
function verStockComprometido(){
    $("#stock_comprometido").toggle();
}
function scrollCliente(sign){
    $('#cli_content').animate({
        scrollTop: ""+sign+"=250px"
    });
}
function recargar(){
    cargarFactura($("#factura").val());
}
function establecerPrecioCat(factura,pref_pago,categoria,cod_desc){
    var tipo_doc = $("#tipo_doc").val();    
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "establecerPrecioCat", "factura": factura, "pref_pago": pref_pago,categoria:categoria,tipo_doc:tipo_doc,cod_desc:cod_desc,moneda:moneda},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);
                if(result === 'Ok'){
                    cargarFactura(factura);
                    $("#msg").html(result); 
                }else{
                    alert(result);
                }
                totalizar();
            }
        },
        error: function () {
           errorMsg("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}
function cargarFactura(factura){  console.log("cargarFactura FacturaVenta");
    var usuario = getNick(); 
    var session = getCookie(usuario).sesion;    
    load("ventas/FacturaVenta.class.php",{usuario:usuario,session:session,factura:factura,suc:getSuc()}, function(){    
        $("#area_carga").fadeIn("fast",function(){           
        setTimeout( "verificarMoneda()",500); 
    });   
    } );
}
function setPrefPago(){
    var cod_desc = $("#cod_desc").val();    
    var tipo_doc = $("#tipo_doc").val();    
    var factura = $("#factura").val();
    $("#finalizar").attr("disabled",true);
    var pref_pago = $('input[name=forma_pago]:checked').val();
    var categoria = $("#categoria").val();
    var msg_pref = "Preferencia de pago establecida a Contado";
    
    
    if(pref_pago==="Otros"){
        
        if(cod_desc == 2){
            errorMsg("Solo ser permite pagos al Contado para Ventas discriminadas!",10000);
            return;   
        }else if(cod_desc == 3){
            if(categoria < 3){
                establecerPrefPago(factura,pref_pago,categoria,tipo_doc,msg_pref);
            }else{
               var c = confirm("Pagando con Tarjeta o Cheque Diferido se eliminaran los descuentos y se establecera el Precio 2, Esta seguro que desea continuar?");
               if(c){
                 $("#cod_desc").val(0);
                 establecerPrecioCat(factura,pref_pago,2,0);            
               }
            }
        }else{
            
           if(categoria > 2){ //Cat 3-7
              $.post( "Ajax.class.php",{ action: "setPrefPagoOnly",factura:factura,pref_pago:pref_pago}, function( data ) {
                establecerPrecioCat(factura,pref_pago,2,0);    
              });              
           } else{   
               msg_pref = "Preferencia de pago establecida...";
               if(categoria < 2){  // Cat 1
                  establecerPrefPago(factura,pref_pago,categoria,tipo_doc,msg_pref);
               }else{ // Cat 2
                  borrarDescuentos(); 
                   
                  establecerPrecioCat(factura,pref_pago,1,0);    
               }
           }
        }        
    }else{// Contado  
       if(categoria > 2){
           if(cod_desc < 2){ // 0 Sin descuento 1 
               $.post( "Ajax.class.php",{ action: "setPrefPagoOnly",factura:factura,pref_pago:pref_pago}, function( data ) {
                 establecerPrecioCat(factura,pref_pago,categoria,0);  
                  
               });          
           }else{// 2 Discriminadas y 3 Mayoristas
               establecerPrefPago(factura,pref_pago,categoria,tipo_doc,msg_pref); 
           }
       }else{ 
         establecerPrefPago(factura,pref_pago,categoria,tipo_doc,msg_pref); 
       }
      
    } 
}
function establecerPrefPago(factura,pref_pago,categoria,tipo_doc,msg_pref){
    $.ajax({
                type: "POST",
                url: "Ajax.class.php",
                data: {"action": "setPrefPago", "factura": factura,"pref_pago":pref_pago,"categoria":categoria,tipo_doc:tipo_doc},
                async: true,
                dataType: "json",
                beforeSend: function() {
                    $("#msg_codigo").html("<img src='img/loadingt.gif' >"); 
                    $("#desc_sedeco").text("0"); 
                },
                success: function(data) {   
                    var mensaje = data.Mensaje;
                    if(mensaje == "Ok"){
                    var total = parseFloat(data.Total).format(0, 3, '.', ',') ; 
                    var descuento = parseFloat(data.Descuento).format(0, 3, '.', ',') ; 
                    var desc_sedeco = parseFloat(data.DescuentoSEDECO).format(0, 3, '.', ',') ; 
                    $("#desc_sedeco").text(desc_sedeco);  
                    if(isNaN(data.Total)){  console.warn("data.Total is NaN");
                        total = 0;
                        corregirSubtotales(new Array());
                    }else{
                        var total_sin_desc = parseFloat(data.Total_sin_desc) ; 
                        var desc = parseFloat(data.Descuento) ; 
                        var porcentaje_descuento = parseFloat(data.Porc_desc) ; 
                        
                        console.log("total_sin_desc: "+total_sin_desc+"  desc "+desc+"  "+porcentaje_descuento);
                        if(categoria < 3){  
                           if(total_sin_desc >= UMBRAL_VENTA_MINORISTA && desc > 0 && tipo_doc != CI_DIP ){
                               $("#msg_det").html("Descuento x compra > "+UMBRAL_VENTA_MINORISTA_FORMATTED+" Gs.");                                
                           }else{
                               $("#msg_det").html("");  
                           }  
                        }
                        var detalle_descuentos = data.DetalleDescuentos;
                        corregirSubtotales(detalle_descuentos); console.log("corregirSubtotales   "   );
                    } 
                    
                    $("#msg_codigo").addClass("info");
                    $("#msg_codigo").html(msg_pref); 
                    $("#finalizar").removeAttr("disabled");
                }else{
                    alert(mensaje);
                }
                }
            });                
}

function finalizar(){
   totalizar(); 
   var tipo_doc = $("#tipo_doc").val();
   var items = $(".hash").length;
   var total_factura =   $("#total_factura").html().substring(0,$("#total_factura").text().indexOf("$")-2);
   var descuento = $("#descuento_factura").html(); 
   if( items > 0){ 
   $("#finalizar").attr("disabled",true);
   var factura = $("#factura").val();
   var cliente = $("#nombre_cliente").val();
   var ruc = $("#ruc_cliente").val(); 
   var suc = getSuc();
   var pref_pago = $('input[name=forma_pago]:checked').val();
   
   var total_moneda_ext = "";
   var moneda_ext = "";
        
   if($("[name=moneda_pago]:checked").length > 0){
        var mon = $("[name=moneda_pago]:checked").attr("id").substring(7,9);
        var cotiz = float("cotiz_"+mon);
        var total = $("#total_factura").html().substring(0,$("#total_factura").text().indexOf("$")-2).replace(/\./g, '');
        var total_me = (total / cotiz).format(2, 3, '.', ','); 
        $("#total_me").val(total_me+" "+mon.toUpperCase().replace("S","$")+".");  
        total_moneda_ext = total_me;
        moneda_ext = mon.toUpperCase().replace("S","s"); 
    }
   
   var t = $('<iframe id="ticket" name="ticket" style="width:0px; height:0px; border: 0px" src="ventas/TicketVenta.class.php?factura='+factura+'&cliente='+cliente+'&ruc='+ruc+'&suc='+suc+'&pref_pago='+pref_pago+'&total_factura='+total_factura+'&descuento='+descuento+'&total_moneda_ext='+total_moneda_ext+'&moneda_ext='+moneda_ext+'" ></iframe>');
  // t.appendTo("#work_area");
   
   //window.open("ventas/Ticket.class.php?factura="+factura+"&cliente="+cliente+"&ruc="+ruc+"&suc="+suc+"","Ticket de Venta","width=400,height=560,scrollbars=yes"); 
    var show_menu = true;
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "finalizarVenta", "factura": factura,"pref_pago":pref_pago, usuario:getNick(),tipo_doc:tipo_doc},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg_codigo").html("<img src='img/loadingt.gif'>");                      
        },
        complete: function(objeto, exito) {
            if (exito == "success") { 
                var result =  $.trim(objeto.responseText).replace(/\|/g,"\n");
                
                if(result == "Ok"){
                    t.appendTo("#work_area");
                    $("#msg_codigo").html("La Factura ha sido enviada a caja..."); 
                    $("#alert_msg").html("Impresion de Ticket en Progreso...<br>&iquest;Qual es su siguiente paso&quest;");
                    $("#dialog-confirm").attr("title","Que desea hacer?");
                    $( "#dialog-confirm" ).dialog({
                       resizable: false,
                       height:140,
                       width:380,
                       modal: true,
                       dialogClass:"ui-state-highlight",
                       buttons: {
                         "Volver al Menu": function() {                      
                            $( this ).dialog( "close" );   
                         },
                         "Reimprimir Ticket": function() {                      
                             $("#work_area").remove("#ticket");
                             t.appendTo("#work_area");
                         },
                         "Crear nueva Factura": function() {                                
                             show_menu = false;
                             $( this ).dialog( "close" );  
                             genericLoad("ventas/NuevaVenta.class.php");    
                         } 
                      },        
                     close: function() {
                                        
                        $(this).dialog("destroy");
                        if(show_menu){  showMenu(); }
                     }
                    });  
                     setTimeout("volverAlMenu()",20000);
                }else{
                    alert("Hubieron algunos errores en el Procesamiento: Favor verifique la informacion de abajo: \n"+result);
                }   
            }
        },
        error: function() {
            $("#msg_codigo").html("Ocurrio un error en la comunicacion con el Servidor intente de nuevo...");
            $("#finalizar").removeAttr("disabled");
        }
    });  
   }else{
       errorMsg("Debe cargar al menos un Articulo para poder cerrar!",10000);  
   } 
}
function volverAlMenu(){
    try {      
       $("#dialog-confirm").dialog("destroy");      
        showMenu();   
    }catch(err) {
       // Ya se cerro antes  
    }
}
function borrarDescuentos(){
  $(".descuento").each(function(){
       $(this).html(0);
  }); 
  totalizar();
}
function discriminarPrecios(){
     var tipo_doc = $("#tipo_doc").val();
     var factura = $("#factura").val();
     var categoria = $("#categoria").val();
     if(categoria < 3){
     $("#cod_desc").val(2); // Ver tabla descuentos
     
     resaltarSimilares(); 
     $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "discriminarPrecios",factura:factura,usuario: getNick(), tipo_doc: tipo_doc,suc:getSuc()},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#discriminar").attr("disabled",true);
            $("#msg_codigo").html("Discriminando...<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);
                if(result === 'Ok'){
                    $("#msg_codigo").html(result+" El vendedor puede Finalizar...");
                    borrarDescuentos();
                    alert("Se recargara la factura para actualizar la vista");
                    recargar();
                }else{
                    alert(result);
                }
            }else{
                $("#msg_codigo").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        },
        error: function () {
            $("#msg_codigo").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
    }else{
       errorMsg("No se puede Discriminar Precios para categoria > 2, utilize Venta Mayorista!",10000);   
    }        
}
function resaltarSimilares(){
    $(".same_code").removeClass("same_code");  
    var aplicar_a = $("#replicarXCod").val();
    
    $(".codigo_lote, .precio_venta").mouseover(function(){    
        $(".similar").removeClass("similar");  
        if(aplicar_a === "lote"){
            $(this).parent().addClass("similar"); 
        }else if(aplicar_a === "codigo"){
            var codigo = $(this).parent().find(".codigo_art").text(); 
            $("[data-codigo="+codigo+"]").each(function(){
                 $(this).parent().addClass("similar");
            }); 
        }else{
            var codigo = $(this).parent().find(".codigo_art").text(); 
            var descrip = $(this).parent().find(".descrip").text(); 
            $("[data-codigo="+codigo+"]").each(function(){
                var each_descrip = $(this).parent().find(".descrip").text(); 
                if(each_descrip === descrip){
                   $(this).parent().addClass("similar");
                }
            });
        }
         
    });
     
    $("#detalle_factura").mouseout(function(){
       $(".similar").removeClass("similar");
    });       
}
// UI Modificar
function ventaMayorista(){     
    
    var c = confirm("Se borraran los descuentos por linea para Modificar los Precios por Grupo de Articulos, este procedimiento no es reversible.");
    if(c){
    
    $("#mayorista").attr("disabled",true);
    $("#discriminar").attr("disabled",true);    
    infoMsg("Haga clic en los Precios...",10000);
    $("#cod_desc").val(3); // Ver tabla descuentos
    borrarDescuentos(); 
    resaltarSimilares(); 
     
    
    $(".codigo_lote, .precio_venta").click( function(){      
        var aplicar_a = $("#replicarXCod").val();
        var codigo = $(this).parent().find(".codigo_art").text(); 
        var descrip = $(this).parent().find(".descrip").text(); 
         
        $(".same_code").removeClass("same_code");  
        if(aplicar_a === "lote"){
            $(this).parent().addClass("same_code"); 
        }else if(aplicar_a === "codigo"){
            codigo = $(this).parent().find(".codigo_art").text(); 
            $("[data-codigo="+codigo+"]").each(function(){
                 $(this).parent().addClass("same_code");
            }); 
        }else{
            codigo = $(this).parent().find(".codigo_art").text(); 
            descrip = $(this).parent().find(".descrip").text(); 
            $("[data-codigo="+codigo+"]").each(function(){
                var each_descrip = $(this).parent().find(".descrip").text();  
                if(each_descrip === descrip){ 
                   $(this).parent().addClass("same_code");
                } 
            });
        }
        
            
        
        $("#loteActual").val($($(this).closest('tr')).prop("id"));

        var precio =parseFloat( $(this).html().replace(/\./g,"").replace(/,/g,"."));//parseFloat( $(this).html().replace(".",""));

        $("#codigo_en_edicion").val(codigo);
        $("#codigo_en_edicion").attr("data-precio_edit",precio);
        $("#descrip_en_edicion").val(descrip);
        
        
        var position_tr = $(this).offset();
        var pie = $(this).width() / 2; 
        var width = $("#div_pv_mayorista").width() / 2;
        var boton = $(this).position(); 
        var top = position_tr.top;
        
        
        $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getPrecioPromedioCodigo", codigo : codigo},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) { 
              
            var AvgPrice = precio;
              
            if(data.length > 0 ){                 
                AvgPrice =  parseFloat(data[0].AvgPrice).format(0, 30, '.', ',') ;                      
            }else{
                AvgPrice = precio;
            }
           
            
            $("#p_valmin").val( AvgPrice * PORC_VALOR_MINIMO);
            $("[data-codigo="+codigo+"]").each(function(){
                 //  $(this).parent().addClass("same_code");
                   $(this).parent().attr("data-precio_promedio",AvgPrice);             
             }); 
              
            $("#msg").html("");  

            $("#div_pv_mayorista").css("margin-left",boton.left + pie - width); 
            $("#div_pv_mayorista").css("margin-top",top-44);      
            $("#div_pv_mayorista").fadeIn();   
            $("#pv_mayorista").val(precio);
            
            //console.log($("#pv_mayorista").val());
            
            $("#pv_mayorista").change(function(){
                if($("#redondear50").is(":checked")){
                   //console.log($("#pv_mayorista").val());
                   var v = $(this).val().replace(".","").replace(",",".");
                   var red = redondear50(v);
                   $("#pv_mayorista").val(red)
                }
            });            
            $("#pv_mayorista").focus();
            $("#div_pv_mayorista").draggable();
        }
       });                
    });     
    }
}
function getHistorialPrecios(){
    var cod_cli = $("#codigo_cliente").val();
    var factura = $("#factura").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getPrecioVentaAnterior", cod_cli: cod_cli,factura:factura},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            for (var i in data) { 
                var codigo = data[i].codigo;
                var precio = data[i].precio;
                $('tr[data-hash^="'+codigo+'"]').each(function(){
                   $(this).find(".precio_venta").attr("title","Ultimo precio de venta "+precio+" Gs");      
                });
            }   
            $("#msg").html(""); 
            setAnchorTitle();
        }
    });
     
}
function actualizarPrecioMayorista(){
    
    var codigo = $("#codigo_en_edicion").val();
    //var precio = $("#codigo_en_edicion").attr("data-precio_edit");
    
    var nuevo_precio = float( "pv_mayorista");
    var valor_minimo = parseFloat( $("#p_valmin").val() );
    
    if(nuevo_precio < valor_minimo && !$("input#modPrecioBajoMinimo").is(":checked")){
        errorMsg("Precio bajo el minimo!",7000); 
        return;
    }    
    if(isNaN(nuevo_precio)){
        errorMsg("Ingrese un precio valido!",7000);
        return;   
    }    
     
    //var nuevo_precio = parseFloat($("#pv_mayorista").val());   
    var nuevo_precio_formatted = $("#pv_mayorista").val();//  parseFloat($("#pv_mayorista").val()).format(3, 2, ',', '.') ; 
    var modif_oferta = $("#edit_precio_oferta").is(":checked"); 
    var precios_bajo_minimo = 0;
    var precios_bajos = 0;
    
    $(".same_code").each(function(){
        var precio_venta_linea = parseFloat($(this).find(".precio_venta").text().replace(/\./g,"").replace(/,/g,".") );     
         
        //if(precio_venta_linea >= valor_minimo  && precio_venta_linea >  nuevo_precio    ){ // Solo si esta arriba del minimo
        if(nuevo_precio >= valor_minimo || $("input#modPrecioBajoMinimo").is(":checked")){    
           if(modif_oferta){
              $(this).find(".precio_venta").html(nuevo_precio_formatted);
              $(this).find(".descuento").html("0");
              $(this).find(".precio_venta").css("background","lightskyblue");
           }else if (precio_venta_linea > nuevo_precio){
               $(this).find(".precio_venta").html(nuevo_precio_formatted);
               $(this).find(".descuento").html("0");
               $(this).find(".precio_venta").css("background","lightskyblue");
           }else{
               precios_bajos++;
           }
        }else{
            $(this).parent().find(".precio_venta").css("background","orange");
            precios_bajo_minimo++;
        }  
    });   
     if(precios_bajos > 0){
        errorMsg("Algunos Precios no se modificaran porque ya estan por debajo del asignado asignando, si desea modificar los mismos marque Igualar todos los Precios!",20000); 
    }  
    if(precios_bajo_minimo > 0){
        infoMsg("Algunos Precios no se modificaran porque ya estan debajo del Minimo!",20000); 
    }    
    
    //corregirSubtotales(new Array());
    //totalizar();
    
    var master = new Array();
    $(".same_code").each(function(){
       var codigo = $(this).find(".codigo_lote").attr("data-codigo"); 
       var lote = $(this).find(".codigo_lote").text();       
       var precio = parseFloat($(this).find(".precio_venta").text().replace(/\./g, '').replace(/,/g, '.') ); 
       var arr = {"codigo":codigo,"lote":lote,"precio":precio}; 
       master.push(arr);
    }); 
     
    master = JSON.stringify(master);
    var factura = $("#factura").val();
    $("#msg").html("Venta Mayorista"); 
   
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "actualizarPrecioMayorista", factura: factura,master:master,usuario:getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_codigo").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {              
            $("#msg_codigo").html("Ok Precios Modificados."); 
            corregirSubtotales(data.DetalleDescuentos);          
            
        }
    });
    $("#div_pv_mayorista").fadeOut();        
}   
 
function buscarArticulosSimilares(){
  var lote = $("#lote").val();
  if(lote.length > 0){
  
  $(".tr_cli_art").remove(); 
  $("#lista_articulos_cab").width($("#articulos").width()-20);
  $("#lista_articulos").width($("#articulos").width()-20);    
  
  $("#articulos").fadeIn("fast");
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "buscarArticulosSimilares", lote: lote, suc: "%"},
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg_codigo").html("<img src='img/loading.gif' width='22px' height='22px' >");                      
            },      
            success: function(data) {   
                if(data.length > 0){
                    for(var i in data){
                       var codigo_lote = data[i].lote;
                       var suc = data[i].suc;                    
                       var stock = parseFloat(data[i].stock);
                       var img = data[i].img;
                       var NroCompra = data[i].id_compra;
                       var tipo = data[i].Tipo;    
                       var miniimg = "";
                        

                       if(img != ""){
                           miniimg = "<img src='img/image.png' onclick=cargarImagenLote('"+img+"')  style='cursor:pointer;'>";                          
                       }else{
                           miniimg = "";                        
                       }
                       var clase = "";
                       if(tipo == "Hijo"){
                           clase = "fraccionado";
                       }
                       $("#lista_articulos").append("<tr class='tr_cli_art similar fila_articulo_"+i+"' title='Nro Compra: "+NroCompra+"'><td class='item "+clase+"'><span class='codigo_lote'>"+codigo_lote+"</span></td> <td class='itemc'><span class='itemc'>"+suc+"</span> </td><td  class='num'><span class='num'>"+stock+"</span></td>  <td class='itemc'><span class='itemc'>"+miniimg+"</span></td></tr>");                                                      
                    }
                }else{
                   $("#lista_articulos").remove(".tr_cli_art"); 
                   $("#msg_codigo").html(""); 
                } 
                $("#msg_codigo").html(""); 
           },
           error: function() {
                $("#msg_codigo").html("");             
           }

        }); 
    }else{
        $("#msg_codigo").html("Debe ingresar un lote para buscar similares."); 
        $("#lote").focus();
    }
}
function zoomImage(){
    var w = $("#zoom_range").val();    
    $("#image_container").width(w);
    $("#img_zoom").width(w);    
}
function cargarImagenLote(img){   
    $("#image_container").html("");
    var images_url = $("#images_url").val();
    
    var cab = '<div style="width: 100%;text-align: right;background: white;">\n\
        <img src="img/substract.png" style="margin-top:-4px"> <input id="zoom_range" onchange="zoomImage()" type="range" name="points"  min="60" max="1000"><img src="img/add.png" style="margin-top:-4px;">\n\
        <img src="img/close.png" style="margin-top:-18px;margin-left:100px" onclick=javascript:$("#image_container").fadeOut()>\n\
    </div>';
    
    $("#image_container").fadeIn();
    
    
    var width = $("#articulos").width() + 20; 
    var top = $("#articulos").position().top;
    if(top < 100){
        top = 100;
    }
    $("#image_container").offset({left:width,top:top});
    var path = images_url+"/"+img+".jpg";
    
    var img = '<img src="'+ path +'" id="img_zoom" onclick=javascript:$("#image_container").fadeOut() width="500" >';
    $("#image_container").html( cab +" "+ img);
    $("#image_container").draggable();
}
function cerrarListaArticulos(){
   $("#articulos").fadeOut("fast"); 
   $(".info_titulo").html("Articulos de la misma Compra");
}

function float(id){
    var n =  parseFloat($("#"+id).val().replace(/\./g, '').replace(/\,/g, '.'));
    if(isNaN(n)){
        return 0;
    }else{
        return n;
    }
}
function floatp(id){
    var n = parseFloat($("#"+id).val());
    if(isNaN(n)){return 0; }else{ return n; }
}
function hideKeyboard(){
   $("#virtual_keyboard").fadeOut();
}
function verMonedasExtranjeras(){
   if(moneda === "G$"){ // Para otras no se muestra
      totalizar();
      $("#moneda_extrangera").toggle();
      $("#cotizaciones").toggle("slide");   
   }
}
 function setAnchorTitle() {
     $('td[title!=""]').each(function() {
         var a = $(this);
         a.hover(
             function() {
                 showAnchorTitle(a, a.data('title'));
             },
             function() {
                 hideAnchorTitle();
             }
         ).data('title', a.attr('title')).removeAttr('title');
     });
 }

 function showAnchorTitle(element, text) {
     var offset = element.offset();
     $('#anchorTitle').css({
         'top': (offset.top + element.outerHeight() - 40) + 'px',
         'left': offset.left + 'px'
     }).html(text).show();
 }

 function hideAnchorTitle() {
     $('#anchorTitle').hide();
 }
function getLimiteCredito(){
   //$("#boton_generar").fadeOut();
   var CardCode = $("#codigo_cliente").val();
   $.post( "Ajax.class.php",{ action: "getLimiteCreditoCliente",CardCode:CardCode,usuario:getNick()}, function( data ) {
       var Limite = parseFloat(data.Limite);
       var Cuotas = parseFloat(data.Cuotas);
       var Cheques = parseFloat(data.Cheques);
       var ChequesAlDiaNoProcesados = parseFloat(data.ChequesAlDiaNoProcesados);
       var EfectivoNoProc = parseFloat(data.EfectivoNoProc);
       var VentasNoProcesadas = parseFloat(data.VentasNoProcesadas);
       
       
       var Diff = Limite - (Cuotas + Cheques + VentasNoProcesadas) + (EfectivoNoProc + ChequesAlDiaNoProcesados) ;      
       if(Limite > 0){
            $("#limite_credito").val( ( Diff).format(0, 3, '.', ','));
            $("#limite_credito").data("limite", Diff);
            $("#limite_credito").data("limiteReal", Limite);
            $(".limite_credito").fadeIn();
            if(Diff <= 0){
                $("#limite_credito").css("color","red"); 
                $("input#limite_credito").addClass("alerta");
                //Hacer Desaparecer cuando supera el Limite
                //$("#boton_generar").fadeOut();
                $("#msg").html("Limite de Credito excedido, solo ventas al contado!").css("color","red");
            }else{
                $("#limite_credito").css("color","green");  
                $("input#limite_credito").removeClass("alerta");
                if($.trim($("#turno").val()).replace(/\D/g,'').length > 0){// Solo numeros
                    $("#boton_generar").fadeIn();
                }
            } 
            var CuotasAtrasadas = parseFloat(data.CuotasAtrasadas); 
            if(CuotasAtrasadas > 0){
                $("#msg").html("Solo contado! Cliente con "+CuotasAtrasadas+" Cuotas atrasadas!");
                $("#msg").css("background","orange");
                errorMsg("Solo contado! Cliente con "+CuotasAtrasadas+" Cuotas atrasadas!",18000);
            }
            setTimeout('$("#lote").focus()',500);  
       }else{// Sin no tiene Limite no mostramos
            if($.trim($("#turno").val()).replace(/\D/g,'').length > 0){
                $("#boton_generar").fadeIn(); 
            }
            $("#limite_credito").val('0');
            $("#limite_credito").data("limite", 0);
            $("#limite_credito").data("limiteReal", 0);
       }
   },'json'); 
}
 
/**
 * Dado un valor devuelve otro en funcion del % 50 Ej.:  14521 --> 14500,  14532 --> 14550    
 * Resolucion 347 SEDECO
 * @param {type} valor
 * @returns {redondeo50.valor_redondeado}  
 */
function redondear50(valor){ 
    var moneda = $("#moneda").val();
    if(moneda == "G$"){
        var resto = valor % 50;    
        var valor_redondear = 0;
        if(resto >= 25 ){
            valor_redondear = parseInt(50 - resto);          
        }else{
            valor_redondear = resto * -1;        
        }  
        var valor_redondeado =  parseInt(valor) + parseInt(valor_redondear);   
        if(valor_redondeado > 0){
            return valor_redondeado; 
        }else{
            return 0;
        } 
    }else{
        return 0;
    }
}
function facturaProforma(){
    var factura = $("#factura").val();
    var ruc = $("#ruc_cliente").val();
    var cliente = $("#nombre_cliente").val();
    var suc = getSuc();
    var usuario = getNick();
    var papar_size = 9; // Dedocratico A4
    var moneda = $("#moneda").val(); 

    var url = "ventas/FacturaProforma.class.php?factura="+factura+"&ruc="+ruc+"&cliente="+cliente+"&suc="+suc+"&usuario="+usuario+"&papar_size="+papar_size+"&moneda="+moneda;
    var title ="Impresion de Facturas Contables";
    var params ="width=800,height=840,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    if(!proforma) {  
       proforma =  window.open(url,title,params);                         
    }else{
       proforma.close();
       window.open(url,title,params);                       
    }
}
function imprimirDetalle(){
    var factura = $("#factura").val();    
    var user = getNick();
    var url = "ventas/ImprimirFactura.class.php?factura="+factura+"&user="+user;
    var title ="Impresion de Facturas";
    var params ="width=800,height=840,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    if(!proforma) {  
       proforma =  window.open(url,title,params);                         
    }else{
       proforma.close();
       window.open(url,title,params);                       
    }
}

var turnoData = {};
function verifTurno(){
    turnoData = {
        "id":"",
        "fecha":"",
        "llamada":""
    };
    var suc = getSuc();
    var paneles = {
        "01":"192.168.6.6",
        "02":"192.168.7.170",
        "06":"192.168.5.50"
    };

    if($.trim($("#turno").val()).replace(/\D/g,'').length == 0){
        $("#boton_generar").fadeOut(); 
    }

    if(Object.keys(paneles).indexOf(suc) > -1 && $.trim($("#turno").val()).replace(/\D/g,'').length > 0 && !isNaN($.trim($("#turno").val()).replace(/\D/g,''))){
        $("#msg").empty();
        $("#msg").removeClass("error");
        if(parseInt($.trim($("#turno").val()).replace(/\D/g,''))<100){
            $.ajax({
                url: "http://" + paneles[suc] + "/get_data.php",
                // The name of the callback parameter, as specified by the YQL service
                jsonp: "callback",
                // Tell jQuery we're expecting JSONP
                dataType: "jsonp",
                // Tell YQL what we want and that we want JSON
                data: {
                  "action":"getTurno",
                  "turno":$.trim($("#turno").val()).replace(/\D/g,''),
                  "format": "json"
                },
                // Work with the response
                success: function( response ) {
                    turnoData = response; // server response
                    $("#boton_generar").fadeIn(); 
                    verifTurnoNFactura(turnoData.id);
                }
                ,
                error: function () {
                    errorMsg("Ocurrio un error en la comunicacion con el Panel de Turnos...",8000);
                    $("#boton_generar").fadeIn(); 
                }
                ,
                timeout: 1500
            });
        }else{
            $("#boton_generar").fadeIn(); 
        }
    }else{
        $("#boton_generar").fadeIn(); 
    }
}

function verifTurnoNFactura(turno_id){
    if( parseInt(turno_id) > 0 ){
        var sData = {
            "action":"verifTurnoNFactura",
            "turno_id":turno_id,
            "suc":getSuc()
        };
        $.post("ventas/NuevaVenta.class.php",sData,function(data){
            if(data.f_nro !== ''){
                $("#msg").addClass("error");
                $("#msg").text("El turno ya fue usado en el ticket "+data.f_nro);
            }
        },"json");
    }
}


function soloNumero(target){
    target.val($.trim($("#turno").val()).replace(/\D/g,''));
    if($.trim($("#turno").val()).replace(/\D/g,'').length == 0){
        $("#boton_generar").fadeOut(); 
    }
}