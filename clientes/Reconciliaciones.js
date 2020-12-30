var total_checked = 0;
var rs = 0; // Cotizacion en Reales Pesos y Dolares
var ps = 0;
var us = 0;
var factura = 0;
var vuelto_gs = 0;
var cotiz_vuelto = 1; // Cotizacion del Vuelto
var moneda_cliente = "G$";
var TASA_INTERES_PUNITORIA = 27.6;  //  2 + 0.3 * 12
var puede_imprimir_recibo = true;
var permiso = false;

 var nro_rec = 0;// Se almacena aqui la ultima reconciliacion para posteriormente poder imprimirla

var decimales = 0;

var printing;

var flagImpresionChequesXCuotas = true;

var MAX_DIAS_ATRASO_CHEQUES = 0;
 
var dataToSend = null; 

function configurar(){
    
    $("#monedas_cheque").change(function(){
        var mon = $(this).val();
        if(mon == 'G$'){
            $("#valor_cheque_gs").prop("disabled",true);
            $("#valor_cheque_gs").attr("readonly",true);
        }else{
            $("#valor_cheque_gs").removeAttr("disabled");
            $("#valor_cheque_gs").removeAttr("readonly");
        }      
    });
    $("#valor_cheque_gs").change(function(){
        var valor = parseFloat($(this).val());
        var valor_ref_fortted = valor.format(2, 3, '.', ','); 
        $("#valor_cheque_gs").val(valor_ref_fortted);
        
        if($("#monedas_cheque").val()!='G$'){
           var cotiz = valor / $("#valor_cheque").val().replace(/\./g, '').replace(/\,/g, '.');
           $("#cotiz_cheque").val(cotiz.toFixed(2));
        }
    });
    $("#convenios").change(function(){
             var val = $(this).val();
             var tipo =   $("#convenios option:selected").attr("data-tipo");
             if(val == 17){ // Retenciones
                 $(".retencion").fadeIn();
             }else{
                 $(".retencion").fadeOut();
             }
             
             if(tipo == "Asociacion"){
                $("#tipo_nro").html("N&deg; Orden:"); 
             }else if(tipo == "Tarjeta Credito" || tipo == "Tarjeta Debito" ){
                 $("#tipo_nro").html("N&deg; Voucher:"); 
             }else{ // Retencion
                 $("#tipo_nro").html("N&deg; Retencion:"); 
             }
         });
    $("#fecha_cheque_diff").change(function(){
        var fh = $(".fecha_hoy").val().split("/");
        var hoy = fh[2]+"-"+fh[1]+"-"+fh[0];
        var fc = $(this).val().split("/");
        var fcp = fc[2]+"-"+fc[1]+"-"+fc[0];
        
        MAX_DIAS_ATRASO_CHEQUES = date_diff(hoy,fcp);
        if(date_diff(hoy,fcp) < -4){
           alert("Fecha del Cheque no puede superar los 5 dias hacia atras"); 
        }else{
           buscarCuotasCheque();
        }
        
    });
    if(is_mobile){
        $("#fecha_cheque_diff").prop('type','date'); //mask("99/99/9999");
        $(".").html();
    }else{
        $("#fecha_cheque_diff").mask("99/99/9999");
        $(".fecha").datepicker({ dateFormat: 'dd/mm/yy' }); 
    }
    
    // Si envio el ruc buscar automaticamente
    var ruc = $("#ruc_cliente").val(); 
    if(ruc != ""){   
        buscarCliente($("#ruc_cliente"));
    }
}
var date_diff = function(date1, date2) {
   dt1 = new Date(date1);
   dt2 = new Date(date2);
   return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
}

function getLimiteCredito(){
   var CardCode = $("#codigo_cliente").val();
   $.post( "Ajax.class.php",{ action: "getLimiteCreditoCliente",CardCode:CardCode}, function( data ) {
       //var es_funcionario = $("#nombre_cliente").val().indexOf("FUNCIONARI")>=0?true:false; 
       var Limite = parseFloat(data.Limite);
       var Cuotas = parseFloat(data.Cuotas);
       var Cheques = parseFloat(data.Cheques);
       var ChequesAlDiaNoProcesados = parseFloat(data.ChequesAlDiaNoProcesados);
       var EfectivoNoProc = parseFloat(data.EfectivoNoProc);
       var VentasNoProcesadas = parseFloat(data.VentasNoProcesadas);
       var CuotasAtrasadas = parseInt(data.CuotasAtrasadas);
       var CuotasAtrasadasPermitidas = parseInt(data.LIMITE_CUOTAS_ATRASADAS);
       
       var CantidadDeCuotas = parseInt(data.CANTIDAD_CUOTAS);
       var PlazoMaximo = parseInt(data.PLAZO_MAXIMO);
        
       
       var Diff = parseFloat(Limite - (Cuotas + Cheques + VentasNoProcesadas) + (EfectivoNoProc + ChequesAlDiaNoProcesados)); 
       $("#limite_credito").val( ( Diff).format(0, 3, '.', ',')); 
       if(Diff <= 0){
          $("#limite_credito").css("color","red"); 
       }else{
          $("#limite_credito").css("color","green");  
       }
       
   },'json'); 
}

function buscarCuotasCheque(){
    if( $("#nombre_cliente").val() != ""){
       if(permiso != "vem"){
            buscarCuotas(false);
       }else{
            buscarCuotas(true);
       } 
    }
}
 

function ocultar(){}
function mostrar(){ 
    setTimeout("puedeExonerarIntereses()",500);
     getLimiteCredito();   
}
function getFacturasContables(){
   var suc = getSuc();   
   var tipo_fact = $("#tipo_fact").val();
   var moneda = $("#moneda").val();
   $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getFacturasContables", "suc": suc,tipo_fact:tipo_fact,tipo_doc:"Recibo",moneda:moneda},
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#loading_facts").fadeIn();
            },
            success: function(data) {  
                $("#factura_contable").empty();
                var cont = 0;
                for(var i in data){ 
                     var fact_cont = data[i].fact_nro; 
                     var pdv_cod = data[i].pdv_cod; 
                     $("#factura_contable").append("<option value='"+fact_cont+"' data-pdv="+pdv_cod+">"+fact_cont+"</option>");  cont++;
                } 
                $("#loading_facts").fadeOut();
                if(cont == 0){
                    $("#imprimir_recibo").fadeOut();
                    alert("Debe cargar Recibos Contables Pre Impresos en el sistema para poder Imprimir.");
                }
            }
        });
  }
  function getFacturasContablesManuales(){
   var suc = getSuc();   
   var tipo_fact = "Manual";
   var moneda = $("#moneda").val();
   $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getFacturasContables", "suc": suc,tipo_fact:tipo_fact,tipo_doc:"Factura",moneda:moneda},
            async: true,
            dataType: "json",
            beforeSend: function() {
                
            },
            success: function(data) {  
                 
                var cont = 0;
                for(var i in data){ 
                     var fact_cont = data[i].fact_nro; 
                     var pdv_cod = data[i].pdv_cod; 
                     $("#facturas_manuales").append("<option value='"+fact_cont+"' data-pdv="+pdv_cod+">"+fact_cont+"</option>");  cont++;
                } 
                 
                if(cont == 0){ 
                    alert("Debe cargar Facturas Contables Manuales en el sistema para poder Continuar, Cancele este cobro y cargue las Facturas Manuales");   
                    showMenu();
                }
            }
        });
  }
  function setDateCheque(){
      var tipo = $("#tipo").val();
      if(tipo == "Al_Dia"){
          $("#fecha_emision").val($(".fecha_hoy").val());
          $("#fecha_pago").val($(".fecha_hoy").val());  
          $("#fecha_emision").attr("readonly",true);
          $("#fecha_pago").attr("readonly",true);
      }else{
          $("#fecha_emision").val("");
          $("#fecha_pago").val("");  
          $("#fecha_emision").removeAttr("readonly");
          $("#fecha_pago").removeAttr("readonly");
      }     
  } 
  
function reconciliar(){
   
   $("#reconciliar").prop("disabled",true); 
   var CardCode = $("#codigo_cliente").val();
   var RUC = $("#ruc_cliente").val();
   var Cliente = $("#nombre_cliente").val();
   var moneda = $("#moneda").val();
   var notas = $("#notas").val();
   
    
   us = float("cotiz_us"); 
   
   var cotizmon = 1;
   if(moneda === "U$"){
       cotizmon = us;        
   }else{
       cotizmon = 1;
   }
    
   dataToSend = { 
     CardCode: CardCode, 
     RUC:RUC,
     Cliente:Cliente,
     usuario:getNick(),
     suc:getSuc(),
     moneda:moneda,
     cotiz:cotizmon,
     notas:notas,
     data: [] 
   }; 
   var i = 0;
   $(".checked").each(function(){
       var id =  ( $(this).attr("id")).toString().substring(6,30);  
        if($(this).is(":checked")){  
            
            $("#ct_"+id).css("background","#ECEDD7"); 
            $("#pagar_"+id).css("background","#ECEDD7"); 
             
            var Tipo = $(this).parent().parent().attr("data-tipo");
            var Factura_ = $(this).parent().next().next().next().html();
            var Cuota =  $(this).parent().parent().find(".cuota_"+id).html();
             
            var Total =  parseFloat(($("#pagar_"+id).val()).replace(/\./g, '').replace(/\,/g, '.')); 
 
            dataToSend.data[i]={Doc:Factura_, Tipo:Tipo,linea:Cuota,Total:Total}; 
            //console.log(Factura_+"  "+Cuota+"  "+Monto+"  "+i);
            i++;
        }  
    });
    
    $(".nc_checked").each(function(){
       var id =  ( $(this).attr("id")).toString().substring(6,30);  
        if($(this).is(":checked")){  
            
            $("#tr_"+id).css("background","#ECEDD7"); 
            $("#pagar_nc_"+id).css("background","#ECEDD7"); 
             
            var Tipo = $(this).parent().parent().attr("data-tipo");
            var nro_nc = $(this).parent().next().next().next().html();
             
             
            var Total =  parseFloat(($("#pagar_nc_"+id).val()).replace(/\./g, '').replace(/\,/g, '.')); 
 
            dataToSend.data[i]={Doc:nro_nc, Tipo:Tipo,linea:1,Total:Total}; 
            //console.log(Factura_+"  "+Cuota+"  "+Monto+"  "+i);
            i++;
        }  
    });
    $(".checked, .nc_checked").prop("disabled",true)
    var c = confirm("Esta operacion es irreversible, confirme para continuar...");
    if(c){
        $.ajax({
            type: "POST",
            url: "clientes/Reconciliaciones.class.php",
            data: {action: "reconciliar", suc: getSuc(), usuario: getNick(),datos:JSON.stringify(dataToSend)},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                if (data.mensaje === "Ok") {
                    nro_rec = data.recon_no;
                    $("#msg").html("Ok"); 
                    infoMsg("Reconciliacion exitosa puede imprimir un comprobante si lo desea",20000);
                    $("#imprimir_rec").fadeIn();
                } else {
                    $("#msg").html("Error al reconciliar ");   
                }                
            },
            error: function (e) {                 
                $("#msg").html("Error al reconciliar:  " + e);   
                errorMsg("Error al reconciliar:  " + e, 10000);
            }
        });         
    }   
}  

function imprimirComprobante(){
   if(nro_rec > 0){ 
        var params = "width=1024,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
        var url = "clientes/ComprobanteReconciliacion.class.php?nro_rec="+nro_rec+"";                 
        var title = "Comprobante de Reconciliacion";
        if(!printing){        
            printing = window.open(url,title,params);
        }else{
            printing.close();
            printing = window.open(url,title,params);
        }        
   } 
}

function generarCobro(){
   $(".area_impresion_recibos").fadeOut(); 
   puede_imprimir_recibo = true;
   var CardCode = $("#codigo_cliente").val();
   var RUC = $("#ruc_cliente").val();
   var Cliente = $("#nombre_cliente").val();
   var moneda = $("#moneda").val();
   $("#moneda_cobro").val(moneda);
       
   rs = float("cotiz_rs");
   ps = float("cotiz_ps");
   us = float("cotiz_us");
   
   var legales = 0;
   var ilegales = 0;
    
   var cotizmon = 1;
   if(moneda == "U$"){
       cotizmon = us;
       $("#tarjetas").fadeOut();
   }else if(moneda == "R$"){
       cotizmon = rs;
   }else if(moneda == "P$"){
       cotizmon = ps;
   }else{
       cotizmon = 1;
   }
   var interes = 0;
   total_checked = 0;
   
   configurarPopup(); 
   dataToSend = { 
     CardCode: CardCode, 
     RUC:RUC,
     Cliente:Cliente,
     usuario:getNick(),
     suc:getSuc(),
     moneda:moneda,
     cotiz:cotizmon,
     data: [] 
   }; 
  
   //$("#generar_cobro").attr("disabled",true);
   $(".checked").attr("disabled",true); 
   var i = 0;
   var total_intereses = 0;
   $(".checked").each(function(){
       var id =  ( $(this).attr("id")).toString().substring(6,30);   
       $("#pagar_"+id).attr("readonly",true); 
          
        if($(this).is(":checked")){ 
            
            
            $("#ct_"+id).css("background","#ECEDD7"); 
            $("#pagar_"+id).css("background","#ECEDD7"); 
            var FolioNum = $(this).parent().next().html();
            var Tipo = $(this).parent().parent().attr("data-tipo");
            var Factura_ = $(this).parent().next().next().next().html();
            var Cuota =  $(this).parent().parent().find(".cuota_"+id).html();
            var FechaFactura =  $(this).parent().parent().find(".fecha_fac_"+id).html();
            var Total =  parseFloat(($("#pagar_"+id).val()).replace(/\./g, '').replace(/\,/g, '.'));
            
            var Pagado = ($(this).parent().parent().find(".pagado_"+id).html()).replace(/\./g, '').replace(/\,/g, '.');
            var interes = ($(this).parent().parent().find(".interes_"+id).html()).replace(/\./g, '').replace(/\,/g, '.');
            if(FolioNum != ""){
                legales++;
            }else{
                ilegales++;
            }
            total_intereses += parseFloat( interes );
            total_checked+=Total; 
           
            var pago_actual = $("#pagar_"+id).val();
            var Monto = ( pago_actual ).replace(/\./g, '').replace(/\,/g, '.') - interes  ;
            
            var dia = FechaFactura.toString().substring(0,2);
            var mes = FechaFactura.toString().substring(3,5);
            var anio = FechaFactura.toString().substring(6,10);
            
            var FechaFacturaMySQL = anio+"-"+mes+"-"+dia;
 
            dataToSend.data[i]={Factura:Factura_,FolioNum:FolioNum,Tipo:Tipo,Cuota:Cuota,Monto:Monto,Total:Total,Pagado:Pagado,FechaFactura:FechaFacturaMySQL,Interes:interes}; 
            //console.log(Factura_+"  "+Cuota+"  "+Monto+"  "+i);
            i++;
        }  
    }); 
    if(total_intereses > 0){         
        $("#imprimir_recibo_termico").fadeOut();        
    }
    if(legales > 0 && ilegales > 0){
        var c = confirm("Algunas cuotas no contienen Factura Legal asociada, solo podra imprimir recibo por cuotas con Factura Legal asociada");  
        $(".doc_contable").fadeOut();
        if(!c){            
            return;
        }
    }else if(legales > 0 && ilegales === 0){
       $(".doc_contable").fadeIn();
    }else if(legales === 0 && ilegales > 0){ // No 
       $(".doc_contable").fadeOut();
    }
     
    
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "generarPagoRecibido",datos:JSON.stringify(dataToSend)},
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("<img src='img/activity.gif' width='46px' height='8px' >"); 
        },
        success: function(data) {
              
            decimales = 0;
            if(moneda != 'G$'){
                decimales = 2;
                $("#moneda_cobro").html("U$");
                $("#img_total_pagar_moneda").attr("src","img/us.png")
            }else{
                $("#img_total_pagar_moneda").attr("src","img/gs.png") 
                $("#moneda_cobro").html("Gs");
            }
            $("#nro_cobro").val(data); 
            $("#nro_cobro_popup").val(data);
            $("#total_moneda").val((total_checked).format(decimales, 3, '.', ','));
            $("#popup_caja").slideDown("fast").css('top', "10px"); 
            $("#benef").val( $("#nombre_cliente").val()  );  
            $("#ruc_cliente").attr("readonly",true);
            $("#nombre_cliente").attr("readonly",true);
            $("#total_intereses").val(total_intereses); 
            
            $("#fecha_cheque_diff").prop("disabled",true);
            
            if(MAX_DIAS_ATRASO_CHEQUES < 0){
                $("#tabs").tabs( "disable", 0);    
                $("#tabs").tabs( "disable", 1);    
                $("#tabs").tabs( "disable", 3);   
                $("#tab_cheques").trigger("click");
            }else{
                $("#tabs").tabs( "enable", 0);    
                $("#tabs").tabs( "enable", 1);    
                $("#tabs").tabs( "enable", 3);
            }
            $("#msg").html("");    
        }
    }); 
   
}

function configurarPopup(){
   
    $( "#tabs" ).tabs();
        $(".entrega").change(function(){
            // alert($(this).val());
             var n = parseFloat($(this).val()).format(2, 3, '.', ',') ;
             $(this).val( n  );
              console.log("Valor:" +n);
             if($(this).val() =="" || $(this).val() =="NaN" ){
                $(this).val( 0);
             } 
             if($(this).attr("id")!= "total_dep"){
                setRef();
             }
         });
         
         
         $("*[data-next]").keyup(function (e) {
             if (e.keyCode == 13) {
               var next =  $(this).attr("data-next");
               $("#"+next).focus();  
             } 
         }); 
         $(".efectivo").change(function(){
             showMult($(this).attr("id"));
         });
         $(".entrega_conv").change(function(){
             var voucher = $.trim($("#voucher").val());
             var monto_conv = float("monto_conv");
             if(voucher !="" && monto_conv > 0){
                 $("#add_conv").removeAttr("disabled");
             }else{
                 $("#add_conv").attr("disabled",true);
             }        
         });
         $(".plan_pago").click(function(){
             setPlanPago($(this).val());
         });
        if(is_mobile){
            $("#nro_cheque").prop('type','number');//mask("9999?99999999").css("text-transform","uppercase");
            $("#nro_cuenta").prop('type','number');//mask("****?99999999",{placeholder:""});
            $("#voucher").prop('type','number');//mask("****?99999999",{placeholder:""});
            //$("#benef").prop('type','number');//mask("***?*******************************************",{placeholder:""});
            $("#fecha_emision").prop('type','date');//mask("99/99/9999");
            $("#fecha_pago").prop('type','date');//mask("99/99/9999");
            $("#fecha_trasnf").prop('type','date');//mask("99/99/9999");         
            $("#fecha_inicio").prop('type','number');//mask("9?99");
            $("#fecha_ret").prop('type','date');//mask("99/99/9999");
            $("#orden_benef").prop('type','number');//mask("***?*********************************************",{placeholder:""});
            $("#monto_orden").prop('type','number');//mask("9?999999999");
            $("#nro_orden").prop('type','number');//mask("9?999999999");
            //$("#monto_conv").prop('type','number');//mask("9?999999999");
            //$("[id^='entrega_']").prop('type','number');//mask("9?999999999");
         }else{
             $("#nro_cheque").mask("9999?99999999").css("text-transform","uppercase");
             $("#nro_cuenta").mask("****?99999999",{placeholder:""});
             $("#voucher").mask("****?99999999",{placeholder:""});
             //$("#benef").mask("***?*******************************************",{placeholder:""});
             $("#fecha_emision").mask("99/99/9999");
             $("#fecha_pago").mask("99/99/9999");
             $("#fecha_trasnf").mask("99/99/9999");         
             $("#fecha_inicio").mask("9?99");
             $("#fecha_ret").mask("99/99/9999");
             $("#orden_benef").mask("***?*********************************************",{placeholder:""});
             $("#monto_orden").mask("9?999999999");
             $("#nro_orden").mask("9?999999999");
         }
         
         $("select > option:nth-child(even)").css("background","#F0F0F5"); // Color Zebra para los Selects
         $("#benef").css("text-transform","uppercase"); // Beneficiario en el Cheque todo en Mayusculas
         $("#ui_add_cheque input").change(function(){ checkCheque() });  
         getFacturasContables();
}

 
function setRef(){
      var moneda = $("#moneda").val();
      var entrega_gs = float("entrega_gs");
      
      var entrega_rs = float("entrega_rs") * rs;
      var entrega_ps = float("entrega_ps") * ps;
      var entrega_us = float("entrega_us") * us; 
      
      var cortiz = 1;
      if(moneda == "U$"){
          cotiz = float("cotiz_us");
      }else if(moneda == "G$"){
          cotiz = 1;
      }else{
          alert("Error sistema no soporta Pagos de Facturas que no sean Guaranies o Dolares");
          return;
      }
                
      var total_entrega_efectivo =  entrega_gs + entrega_rs +  entrega_ps + entrega_us  ;
      
      var total_convenios = parseFloat($(".total_convenios").text().replace(/\./g, '').replace(/\,/g, '.'));
      
      var total_cheques =  parseFloat($(".total_cheques").text().replace(/\./g, '').replace(/\,/g, '.'));
      
      var total_deposito =  parseFloat($("#total_dep").val().replace(/\./g, '').replace(/\,/g, '.'));
       
       
      
      var total_pagar  = float("total_moneda");
      var vuelvo_faltante = total_pagar - (total_entrega_efectivo + total_convenios + total_cheques  );
        
      var total_entregado = (total_entrega_efectivo + total_convenios + total_cheques + total_deposito) / cotiz;
      var diff = (total_entregado-total_pagar).format(2, 3, '.', ',');
             
      $("#total_entrega").val(total_entregado.format(2, 3, '.', ','));      
      
      if(total_entregado > total_pagar ){
          $("#msg_sobrante").html("El monto debe ser Exacto, ha sobrepasado "+moneda+". "+diff);
          $(".cerrar_cobro").attr("disabled",true);
      }else if(total_entregado === total_pagar && ($("input#cancelacion").is(":checked") || $("input#pago_cuenta").is(":checked"))){ 
           $(".cerrar_cobro").removeAttr("disabled");
      }else{
           $(".cerrar_cobro").attr("disabled",true);
          $("#msg_sobrante").html("");$("#finalizar").attr("disabled",true);
      }
      
}      
 
function imprimirReciboTermico(){     
    
    var nro_cobro = $("#nro_cobro").val();  
    var params = "width=400,height=400,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    var url = "https://190.128.150.70:2443/inmopy_sap/caja/ImpresorReciboTermico.class.php?nro_cobro="+nro_cobro+"&tipo=original";                 
    var title = "Recibo";
    if(!printing){        
        printing = window.open(url,title,params);
    }else{
        printing.close();
        printing = window.open(url,title,params);
    } 
}
 
 
function imprimirRecibo(){
     var nro_cobro = $("#nro_cobro").val();  
     var factura_contable = $("#factura_contable").val(); // Nro de Recibo en Realidad
     var tipo_factura = $("#tipo_fact").val();
     var pdv = $("#factura_contable option:selected").attr("data-pdv"); 
     var moneda = $("#moneda").val();
     var intereses = $("#total_intereses").val();
     var factura_manual = ""; 
     var cancelacion = $("input#cancelacion").is(":checked");
     var pago_cuenta =  $("input#pago_cuenta").is(":checked");

     if(factura_contable != ""){
         var ruc = $("#ruc_cliente").val();
         var cliente = $("#nombre_cliente").val();
         var suc = getSuc();
         var usuario = getNick();
         var papar_size = 9; // Dedocratico A4
         var tipo_fact = $("#tipo_fact").val();
         var title ="Impresion de Facturas Contables";
         var params ="width=800,height=840,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
         
         if(intereses > 0){
           $( "#facturas_manuales_div" ).dialog({
            resizable: false,
            height:160,
            modal: true,
            buttons: {
              "Cancelar": function() {
                 $( this ).dialog( "close" );
                         return;
              },  
              "Aceptar": function() {
                  $( this ).dialog( "close" ); 
                  factura_manual = $("#facturas_manuales").val();  
                  pdv = $("#facturas_manuales option:selected").attr("data-pdv"); 
                  var url = "caja/ImpresorRecibo.class.php?nro_cobro="+nro_cobro+"&ruc="+ruc+"&cliente="+cliente+"&suc="+suc+"&factura_legal="+factura_contable+"&usuario="+usuario+"&papar_size="+papar_size+"&tipo_factura="+tipo_factura+"&pdv="+pdv+"&moneda="+moneda+"&intereses="+intereses+"&factura_manual="+factura_manual+"&cancelacion="+cancelacion+"&pago_cuenta="+pago_cuenta;
                  if(typeof(showModalDialog) === "function"){   window.showModalDialog(url,title,params);  }else{   window.open(url,title,params);    }
              },        
              "Cerrar": function() {            
                $( this ).dialog( "destroy" );
                return;
              }
            }
            }); 
         }else{
           var url = "caja/ImpresorRecibo.class.php?nro_cobro="+nro_cobro+"&ruc="+ruc+"&cliente="+cliente+"&suc="+suc+"&factura_legal="+factura_contable+"&usuario="+usuario+"&papar_size="+papar_size+"&tipo_factura="+tipo_factura+"&pdv="+pdv+"&moneda="+moneda+"&intereses="+intereses+"&factura_manual="+factura_manual+"&cancelacion="+cancelacion+"&pago_cuenta="+pago_cuenta;  
           if(typeof(showModalDialog) === "function"){   window.showModalDialog(url,title,params);  }else{   window.open(url,title,params);    }  
         }            
          
     }else{
         alert("Debe Pre cargar las Facturas Contables para poder Imprimir");
     }
  }  
  
function imprimirReciboPagoAnterior(){
    if(flagImpresionChequesXCuotas){
     var nro_cobro = $("#nro_cobro").val();  
     var factura_contable = $("#factura_contable").val(); // Nro de Recibo en Realidad
     var tipo_factura = $("#tipo_fact").val();
     var pdv = $("#factura_contable option:selected").attr("data-pdv"); 
     var moneda = $("#moneda").val();
     var intereses = $("#total_intereses_pago_anterior").val();
     var factura_manual = ""; 
     var cancelacion = $("input#cancelacion").is(":checked");
     var pago_cuenta =  $("input#pago_cuenta").is(":checked");

     if(factura_contable != ""){
         var ruc = $("#ruc_cliente").val();
         var cliente = $("#nombre_cliente").val();
         var suc = getSuc();
         var usuario = getNick();
         var papar_size = 9; // Dedocratico A4
          
         var title ="Impresion de Facturas Contables";
         var params ="width=800,height=840,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
         
         
         //intereses = 0;
         
         var url = "caja/ImpresorRecibo.class.php?nro_cobro="+nro_cobro+"&ruc="+ruc+"&cliente="+cliente+"&suc="+suc+"&factura_legal="+factura_contable+"&usuario="+usuario+"&papar_size="+papar_size+"&tipo_factura="+tipo_factura+"&pdv="+pdv+"&moneda="+moneda+"&intereses="+intereses+"&factura_manual="+factura_manual+"&cancelacion="+cancelacion+"&pago_cuenta="+pago_cuenta;  
           if(typeof(showModalDialog) === "function"){   window.showModalDialog(url,title,params);  }else{   window.open(url,title,params);    }  
         /* Marcos no quiere
         if(intereses > 0){
           $( "#facturas_manuales_div" ).dialog({
            resizable: false,
            height:160,
            modal: true,
            buttons: {
              "Cancelar": function() {
                 $( this ).dialog( "close" );
                         return;
              },  
              "Aceptar": function() {
                  $( this ).dialog( "close" ); 
                  factura_manual = $("#facturas_manuales").val();  
                  var url = "caja/ImpresorRecibo.class.php?nro_cobro="+nro_cobro+"&ruc="+ruc+"&cliente="+cliente+"&suc="+suc+"&factura_legal="+factura_contable+"&usuario="+usuario+"&papar_size="+papar_size+"&tipo_factura="+tipo_factura+"&pdv="+pdv+"&moneda="+moneda+"&intereses="+intereses+"&factura_manual="+factura_manual+"&cancelacion="+cancelacion+"&pago_cuenta="+pago_cuenta;
                  if(typeof(showModalDialog) === "function"){   window.showModalDialog(url,title,params);  }else{   window.open(url,title,params);    }
              },        
              "Cerrar": function() {            
                $( this ).dialog( "destroy" );
                return;
              }
            }
            }); 
         }else{
           var url = "caja/ImpresorRecibo.class.php?nro_cobro="+nro_cobro+"&ruc="+ruc+"&cliente="+cliente+"&suc="+suc+"&factura_legal="+factura_contable+"&usuario="+usuario+"&papar_size="+papar_size+"&tipo_factura="+tipo_factura+"&pdv="+pdv+"&moneda="+moneda+"&intereses="+intereses+"&factura_manual="+factura_manual+"&cancelacion="+cancelacion+"&pago_cuenta="+pago_cuenta;  
           if(typeof(showModalDialog) === "function"){   window.showModalDialog(url,title,params);  }else{   window.open(url,title,params);    }  
         }            
         */ 
     }else{
         alert("Debe Pre cargar las Facturas Contables para poder Imprimir");
     }
    }else{
        imprimirReciboXFactura();
    }
  } 
  
  function imprimirReciboXFactura(){
     var nro_cheque = $("#bcheque").val(); 
     var factura_contable = $("#factura_contable").val(); // Nro de Recibo en Realidad
     var tipo_factura = $("#tipo_fact").val();
     var pdv = $("#factura_contable option:selected").attr("data-pdv"); 
     var moneda = $("#moneda").val();
     var intereses = $("#total_intereses_pago_anterior").val();
     var factura_manual = ""; 
     var cancelacion = $("input#cancelacion").is(":checked");
     var pago_cuenta =  $("input#pago_cuenta").is(":checked");

     if(factura_contable != ""){
         var ruc = $("#ruc_cliente").val();
         var cliente = $("#nombre_cliente").val();
         var suc = getSuc();
         var usuario = getNick();
         var papar_size = 9; // Dedocratico A4
          
         var title ="Impresion de Facturas Contables";
         var params ="width=800,height=840,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
                  
         var url = "caja/ImpresorReciboCheque.class.php?nro_cheque="+nro_cheque+"&ruc="+ruc+"&cliente="+cliente+"&suc="+suc+"&factura_legal="+factura_contable+"&usuario="+usuario+"&papar_size="+papar_size+"&tipo_factura="+tipo_factura+"&pdv="+pdv+"&moneda="+moneda+"&intereses="+intereses+"&factura_manual="+factura_manual+"&cancelacion="+cancelacion+"&pago_cuenta="+pago_cuenta;  
         if(typeof(showModalDialog) === "function"){   window.showModalDialog(url,title,params);  }else{   window.open(url,title,params);    }  
                   
          
     }else{
         alert("Debe Pre cargar las Facturas Contables para poder Imprimir");
     }      
  }
function cerrar(){
   $("#popup_caja").fadeOut(); 
}  
 
  
  
function showMult(id){
      var val = parseFloat($("#"+id).val() );  
      var ter = id.substring(8,12);
      if(ter == "rs"){
          var mult_rs = (rs*val).format(2, 3, '.', ',');
          $("#mult_"+ter).text(" * "+rs+" = "+ mult_rs);
          guardarEfectivo(id,"R$",rs);
      }else if(ter == "ps"){
          var mult_ps = (ps*val).format(2, 3, '.', ',');
          $("#mult_"+ter).text(" * "+ps+" = "+ mult_ps);
          guardarEfectivo(id,"P$",ps);
      }else if(ter == "us"){
          var mult_us = (us*val).format(2, 3, '.', ',');
          $("#mult_"+ter).text(" * "+us+" = "+ mult_us);
          guardarEfectivo(id,"U$",us);
      }else{ //Guaranies
         guardarEfectivo(id,"G$",1);            
      }
  }
   
function guardarEfectivo(id,moneda,cotiz){
    var nro_cobro = $("#nro_cobro").val();   
    var monto = float(id);  
    var monto_ref = float(id) * cotiz; 
    var suc = getSuc();
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "agregarEfectivo", "nro_referencia": nro_cobro, "moneda": moneda,"monto":monto,"cotiz":cotiz,"monto_ref":monto_ref,"id_concepto":7,"campo":"trans_num",suc:suc},
            async: true,
            dataType: "html",
            beforeSend: function() {
                $("#msg_efectivo").html("Guardando... <img src='img/loadingt.gif' >");                      
            },
            complete: function(objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText);
                    $("#msg_efectivo").html(objeto.responseText+"<img src='img/ok.png' width='16px' height='16px' >"); 
                    setTimeout("$('#msg_efectivo').html('');",5000);
                }
            },
            error: function() {
                $("#msg_efectivo").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        }); 
    
  }

function seleccionarCliente(obj){
    var cliente = $(obj).find(".cliente").html(); 
    var ruc = $(obj).find(".ruc").html();  
    var codigo = $(obj).find(".codigo").html();
    var cat = $(obj).find(".cat").html(); 

    $("#ruc_cliente").val(ruc);
    $("#nombre_cliente").val(cliente);    
    $("#codigo_cliente").val(codigo);
    $("#categoria").val(cat);
    $( "#ui_clientes" ).fadeOut("fast");
    $("#msg").html(""); 
    setTimeout("puedeExonerarIntereses()",300);
    $(".titulo").children().css("padding-left","8px");
    $(".titulo").children().css("padding-right","8px");
    $(".num").children().css("padding-left","4px");
    $(".num").children().css("padding-right","4px");
     getLimiteCredito();   
}

function puedeExonerarIntereses(){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {action: "checkTrustee",usuario:getNick(),id_permiso:"3.1.6"},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                permiso = $.trim(objeto.responseText);  
                if(permiso != "vem"){
                    buscarCuotas(false);
                }else{
                    buscarCuotas(true);
                } 
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
     
}
function buscarCuotas(permiso){
      
    var CardCode =  $("#codigo_cliente").val();
    var fecha_cheque_diff = validDate($("#fecha_cheque_diff").val()).fecha;
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "verCuentasCliente", CardCode: CardCode,usuario:getNick(),fecha_cheque_diferido:fecha_cheque_diff},
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading.gif' width='20px' height='20px' >"); 
        },
        success: function(data) {   
             $(".cuotas").remove();  
                
                var total_deuda = 0;
                for(var i in data){ 
                      
                    //var U_suc = data[i].U_suc;
                    var factura = data[i].factura;
                    
                    var Tipo = data[i].Tipo;
                    var id_cuota = data[i].id_cuota;
                    var fecha_factura = data[i].fecha_factura;
                    var vencimiento = data[i].vencimiento;
                    var fecha_ult_pago = data[i].fecha_ult_pago;
                    
                    var DiasAtraso = data[i].DiasAtraso;
                    var FolioNum = data[i].FolioNum;
                    var Exonerada = data[i].Exonerada;
                    if(FolioNum == null){
                         FolioNum = "N/A";
                    }
                    var moneda = data[i].moneda;
                    decimales = 0; 
                       
                    if(moneda != 'G$'){
                       decimales = 2;                         
                    }
                    
                    var monto = parseFloat(data[i].monto).format(decimales, 3, '.', ',') ;
                    
                    
                    var PagosPendientes = parseInt(data[i].PagosPendientes); // Pagos anteriormente enviados no pendientes de sincronizacion con SAP
                    
                    var selectable = "";
                    var pending = "";
                    var title = "";
                    if(PagosPendientes > 0){
                         selectable = 'disabled="disabled"';
                         pending = " pendiente";
                         title = "Procesado, Pendiente de Aprobacion!";
                    }else{
                         selectable = "";
                         pending = "";
                         title = "";
                    }
                    
                     var readonly = '';
                     var pagado = eval(data[i].pagado); 
                     var Total = data[i].monto;
                     
                     var faltante =  parseFloat(Total - pagado) ; 
                     var interes = 0; 
                     var interes_unformat = 0;
                     if(DiasAtraso > 0 && Exonerada == "0" ){
                        DiasAtraso;
                        interes = (faltante * DiasAtraso * (TASA_INTERES_PUNITORIA / 100) ) / 365; 
                        var exceso = interes % 50;
                        interes = interes - exceso;
                        interes_unformat = interes;
                        interes = parseFloat(interes).format(decimales, 3, '.', ',');
                        
                     }                     
                      faltante +=  interes_unformat;
                       
                      faltante = (faltante).format(decimales, 3, '.', ',') ;
                      
                      var pagado = parseFloat(data[i].pagado).format(decimales, 3, '.', ',');
                       
                    
                    var exonerar = "";
                    if(permiso){     
                        if(Exonerada == "0"){  
                           exonerar = "<td style='text-align:center;width: 5%'><input type='button' value='Exonerar' onclick='exonerar("+factura+","+id_cuota+",1)'></td>";
                        }else{
                           exonerar = "<td style='text-align:center;width: 5%'><input type='button' value='No Exonerar' onclick='exonerar("+factura+","+id_cuota+",0)'></td>";
                        }
                    }
                      
                    var color = 'black';
                    if(DiasAtraso > 0){
                        color = 'red';
                    }
                    $("#lista_cuotas").find("tr:last").before("<tr id='ct_"+factura+"-"+id_cuota+"' class='cuotas "+pending+"' data-tipo='"+Tipo+"' title='"+title+"'> \n\
                    <td class='itemc checkable' style='background:white'>"+Tipo+"&nbsp;<input id='check_"+factura+"-"+id_cuota+"' "+selectable+" style='cursor:pointer' class='checked' type='checkbox'>  </td> \n\
                    <td class='item folio_"+factura+"-"+id_cuota+"'>"+FolioNum+"</td><td class='itemc moneda_"+factura+"-"+id_cuota+"' >"+moneda+"</td><td class='itemc ref_"+factura+"-"+id_cuota+"'>"+factura+"</td> <td  class='itemc cuota_"+factura+"-"+id_cuota+"'>"+id_cuota+"</td> <td class='itemc fecha_fac_"+factura+"-"+id_cuota+"'>"+fecha_factura+"</td> <td  class='itemc venc_"+factura+"-"+id_cuota+"'>"+vencimiento+"</td><td  class='itemc up_"+factura+"-"+id_cuota+"'>"+fecha_ult_pago+"</td> <td  class='itemc da_"+factura+"-"+id_cuota+"' style='color:"+color+"'>"+DiasAtraso+"</td> <td  class='num monto_"+factura+"-"+id_cuota+"'>"+monto+"</td> <td  class='num pagado_"+factura+"-"+id_cuota+"'>"+pagado+"</td> <td  class='num interes_"+factura+"-"+id_cuota+"'>"+interes+"</td> <td class='num'> <input type='text' size='10' class='editable num' "+selectable+" "+readonly+" maxlength='16' data-max='"+faltante+"' value='"+faltante+"' size='14' class='num total_pagar' id= 'pagar_"+factura+"-"+id_cuota+"'  style='width:100%'> </td> "+exonerar+" </tr>"); 
                    total_deuda += parseFloat(data[i].monto);
                } 
                $(".editable").change(function(){
                    var val = parseFloat($(this).val());
                    var max = parseFloat($(this).attr("data-max").replace(/\./g, '').replace(/\,/g, '.'));
                    
                    
                    var tipo = $(this).parent().parent().attr("data-tipo");                    
                    if( val > max ){                          
                        $(this).val($(this).attr("data-max"));
                        errorMsg("Cuidado monto incorrecto!",6000);
                    }else{
                        if(val.toString().indexOf(".") > -1){
                            $(this).val(val.toString().replace(/\./g, ','));
                        }
                    }        
                    var id = $(this).parent().parent().attr("id").substring(3,60);
                    $("#check_"+id).prop("checked",true); 
                    sumar();
                });
                
                $("#total_deuda").html(parseFloat(total_deuda).format(decimales, 3, '.', ',') );                
            $("#msg").html(""); 
            //inicializarCursores("checkable");
            $(".total_pagar").change(function(){
                var total_pagar = ( $(this).val()).replace(/\./g, '').replace(/\,/g, '.');
                var total_latin_format =  $(this).parent().prev().prev().html();
                var total = ($(this).parent().prev().prev().html()).replace(/\./g, '').replace(/\,/g, '.');
                 
                if(isNaN(total_pagar) || (total_pagar > total)){
                    $(this).val(total_latin_format);
                }else{
                    var latin_format = parseFloat(total_pagar).format(decimales, 3, '.', ',') ;
                    $(this).val(latin_format);
                } 
                sumar();
            });
           
            $(".checked").click(function(){
                 sumar();
            });
             
           getNotasCreditoCliente();
           
        }
    });
}

function getNotasCreditoCliente(){
    var CardCode = $("#codigo_cliente").val();
    if(CardCode !== ""){
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {action: "getNotasCreditoCliente", suc: getSuc(), usuario: getNick(), CardCode:CardCode},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                $(".fila_nc").remove();  
                
                var total_valor_nc = 0;
                var total_saldo = 0;
                for(var i in data){ 
                      
                    var Tipo = data[i].tipo;  
                    var nro_nc = data[i].n_nro;  
                    
                    var FolioNum = data[i].fact_nro;
                    var fecha = data[i].fecha; 
                    var user = data[i].usuario;
                    
                    var clase = data[i].clase;
                    if(FolioNum == null){
                         FolioNum = "N/A";
                    }
                    var moneda = data[i].moneda;
                    decimales = 0; 
                       
                    if(moneda != 'G$'){
                       decimales = 2;                         
                    }
                    var notas = data[i].notas;
                    var total_uf = parseFloat(data[i].total);
                    var saldo_uf = parseFloat(data[i].saldo); 
                    total_valor_nc += total_uf;
                    total_saldo += saldo_uf;
                    
                    var total = parseFloat(data[i].total).format(decimales, 3, '.', ',') ;
                    var saldo = parseFloat(data[i].saldo).format(decimales, 3, '.', ',') ;
                    
                    var exonerar = ""; // Solo para complementar el espacio
                    if(permiso){     
                        exonerar = "<td style='text-align:center;width: 5%'> &nbsp;</td>"; 
                    }
                    
                    $("#lista_notas_credito").find("tr:last").before("<tr class='fila_nc' id='tr_"+nro_nc+"' data-tipo='"+Tipo+"'>\n\
                    <td class='itemc checkable' style='background:white'>"+Tipo+"&nbsp;<input id='check_"+nro_nc+"' data-nc='"+nro_nc+"'  style='cursor:pointer' class='nc_checked' type='checkbox'>  </td>\n\
                    <td class='itemc'>"+FolioNum+"</td><td class='item'>"+moneda+"</td><td class='itemc'>"+nro_nc+"</td><td class='itemc'>"+fecha+"</td><td class='itemc'>"+user+"</td><td class='itemc'>"+clase+"</td>\n\
                    <td class='item' style='width:220px'>"+notas+"</td><td class='num total_nc'>"+total+"</td><td class='num saldo_nc'>"+saldo+"</td>\n\
                    <td class='num'> <input type='text' size='10' class='editable_nc num'  maxlength='16' data-max='"+saldo+"' value='"+saldo+"' size='14' class='num total_pagar' id= 'pagar_nc_"+nro_nc+"'  style='width:100%'> </td> "+exonerar+"</tr>");
                } 
                
                $("#valor_total_nc").html(parseFloat(total_valor_nc).format(decimales, 3, '.', ',') );
                $("#saldo_nc").html(parseFloat(total_saldo).format(decimales, 3, '.', ',') );
                $("#msg").html("");
                $(".nc_checked").click(function(){
                 sumarNC();
                });
                $(".editable_nc").change(function(){
                    var val = parseFloat($(this).val());
                    var max = parseFloat($(this).attr("data-max").replace(/\./g, '').replace(/\,/g, '.'));
                    
                                        
                    if( val > max ){                          
                        $(this).val($(this).attr("data-max"));
                        errorMsg("Cuidado monto incorrecto!",6000);
                    }else{
                        if(val.toString().indexOf(".") > -1){
                            $(this).val(val.toString().replace(/\./g, ','));
                        }
                    }        
                    var id = $(this).parent().parent().attr("id").substring(3,60);
                    $("#check_"+id).prop("checked",true); 
                    sumarNC();
                });
            },
            error: function (e) {                 
                $("#msg").html("Error al xxx cuenta:  " + e);   
                errorMsg("Error al xxx cuenta:  " + e, 10000);
            }
        }); 
    }
}

function compararSumas(){
    var total_cuotas = parseFloat(($("#total_a_pagar").html()).replace(/\./g, '').replace(/\,/g, '.'));  
    var total_nc = parseFloat(($("#total_a_pagar_nc").html()).replace(/\./g, '').replace(/\,/g, '.'));  
    var diff = total_cuotas - total_nc;
    $("#diff").html(diff.format(decimales, 3, '.', ','));
    if(diff === 0 &&  total_cuotas > 0 && total_nc > 0  ){
        $("#reconciliar").prop("disabled",false);
        $("#diff").css("color","black");
        $("#diff").css("font-weight","normal");
        $("#diff").append("<img src='img/ok.png' class='ok'>");
        $("#status").slideDown();
        infoMsg("Ok...",4000);
    }else{
        $("#reconciliar").prop("disabled",true);
        $(".ok").remove();
        $("#diff").css("color","red");
        $("#diff").css("font-weight","bolder");
        errorMsg("La direrencia debe ser 0 para poder reconciliar",4000);
    }
}

function sumarNC(){
   var total_valor_nc = 0;
   var total_saldo = 0; 
   $(".total_nc").each(function(){
       var v =  parseFloat(($(this).html()).replace(/\./g, '').replace(/\,/g, '.')); 
       total_valor_nc += v;
       var s =  parseFloat(($(this).next().html()).replace(/\./g, '').replace(/\,/g, '.')); 
       total_saldo  += s;
   }); 
   
   $("#valor_total_nc").html(parseFloat(total_valor_nc).format(decimales, 3, '.', ',') );
   $("#saldo_nc").html(parseFloat(total_saldo).format(decimales, 3, '.', ',') );
   
   var total_nc_checked = 0;
   $(".nc_checked").each(function(){
        if($(this).is(":checked")){  
            var nro = $(this).attr("data-nc");
            var valor_rec = parseFloat( $("#pagar_nc_"+nro).val() .replace(/\./g, '').replace(/\,/g, '.')); 
            total_nc_checked += valor_rec;
        }
    });
    $(".total_a_pagar_nc").html(parseFloat(total_nc_checked).format(decimales, 3, '.', ',') );
    compararSumas(); 
}

function sumar(){
    var total_checked = 0;
    var total_interes = 0;
    var cant = 0;
    $(".checked").each(function(){
        if($(this).is(":checked")){  
         var FolioNum = $(this).parent().next().html();
         if(FolioNum != ""){
            cant++;
         }
         
         if(cant > 7){
             $(this).attr("checked",false);
             alert("Solo puede seleccionar 7 Cuotas para emision de Recibo Legal");
         }else{
            var id =  ( $(this).attr("id")).toString().substring(6,30);   
            var total = parseFloat(($("#pagar_"+id).val()).replace(/\./g, '').replace(/\,/g, '.'));
            var moneda = $(this).parent().next().next().html();            
            var interes = parseFloat(($("#pagar_"+id).parent().prev() .html()).replace(/\./g, '').replace(/\,/g, '.'));    
            
            if(total <= interes){
                alert("El monto de Entrega o de pago no puede ser Menor al Interes, de ser necesario distribuya los pagos");
                return;
            }
                
            $("#moneda").val(moneda);
            
            if(interes === 0){
               total_checked+=total; 
            }
            total_interes+=interes; 
         } 
        }
    });
    //if(total_checked > 0){
        if(total_interes > 0){
           $("#alerta_intereses").slideDown(); 
           $("#msg_intereses").slideDown();
           $("#suma_interes").html(total_interes.format(decimales, 3, '.', ',')); 
           
        }else{
           $("#msg_intereses").slideUp();
           $("#alerta_intereses").slideUp();
        }
        /*
    }else{
        $("#msg_intereses").slideUp();
        $("#alerta_intereses").slideUp();
    }*/
    $(".total_a_pagar").html(total_checked.format(decimales, 3, '.', ','));
    compararSumas(); 
}

function exonerar(DocNum,id_cuota,exonerar){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "exonerarIntereses", "usuario": getNick(), "suc": getSuc(),DocNum:DocNum,id_cuota:id_cuota,exonerar:exonerar},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);       
                $("#msg").html(result);
                 buscarCuotas(true);
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}

function previewFacturaXIntereses(){
  var CardCode = $("#codigo_cliente").val();
   var RUC = $("#ruc_cliente").val();
   var Cliente = $("#nombre_cliente").val();
   var moneda = $("#moneda").val();
   $("#moneda_cobro").val(moneda);
       
   rs = float("cotiz_rs");
   ps = float("cotiz_ps");
   us = float("cotiz_us");
   
   var legales = 0;
   var ilegales = 0;
    
   var cotizmon = 1;
   if(moneda === "U$"){
       cotizmon = us;
       $("#tarjetas").fadeOut();
   }else if(moneda === "R$"){
       cotizmon = rs;
   }else if(moneda === "P$"){
       cotizmon = ps;
   }else{
       cotizmon = 1;
   }  
  dataToSend = { 
     CardCode: CardCode, 
     RUC:RUC,
     Cliente:Cliente,
     usuario:getNick(),
     suc:getSuc(),
     moneda:moneda,
     cotiz:cotizmon,
     data: [] 
   }; 
  
   //$("#generar_cobro").attr("disabled",true);
   $(".checked").attr("disabled",true); 
   
   $(".fila_intereses").remove();
   
   var i = 0;
   var total_intereses = 0;
   $(".checked").each(function(){
       var id =  ( $(this).attr("id")).toString().substring(6,30);   
       $("#pagar_"+id).attr("readonly",true); 
       
              
        if($(this).is(":checked")){ 
             
            $("#ct_"+id).css("background","#ECEDD7"); 
            $("#pagar_"+id).css("background","#ECEDD7"); 
            var FolioNum = $(this).parent().next().html();
            var Tipo = $(this).parent().parent().attr("data-tipo");
            var Factura_ = $(this).parent().next().next().next().html();
            var Cuota =  $(this).parent().parent().find(".cuota_"+id).html();
            var FechaFactura =  $(this).parent().parent().find(".fecha_fac_"+id).html();
            var Total = ($(this).parent().parent().find(".monto_"+id).html()).replace(/\./g, '').replace(/\,/g, '.');
            var Pagado = ($(this).parent().parent().find(".pagado_"+id).html()).replace(/\./g, '').replace(/\,/g, '.');
            var interes = ($(this).parent().parent().find(".interes_"+id).html()).replace(/\./g, '').replace(/\,/g, '.');
            if(FolioNum !== ""){
                legales++;
            }else{
                ilegales++;
            }
            total_intereses += parseFloat( interes );
           
            var pago_actual = $("#pagar_"+id).val();
            var Monto = ( pago_actual ).replace(/\./g, '').replace(/\,/g, '.') - interes  ;
            
            var dia = FechaFactura.toString().substring(0,2);
            var mes = FechaFactura.toString().substring(3,5);
            var anio = FechaFactura.toString().substring(6,10);
            
            var FechaFacturaMySQL = anio+"-"+mes+"-"+dia;
            var format_int = (parseFloat( interes )).format(2, 3, '.', ',');
            
            if(interes > 0){
                dataToSend.data[i]={Factura:Factura_,FolioNum:FolioNum,Tipo:Tipo,Cuota:Cuota,Monto:Monto,Total:Total,Pagado:Pagado,FechaFactura:FechaFacturaMySQL,Interes:interes}; 
                $("#table_detalle_intereses").append("<tr class='fila_intereses'><td class='itemc'>"+Factura_+"</td><td class='itemc'>"+Cuota+"</td><td class='num'>"+format_int+"</td></tr>");
                i++;
            }
        }  
    });     
    var format_total_intereses = (total_intereses).format(2, 3, '.', ','); 
    $("#table_detalle_intereses").append("<tr class='fila_intereses'><td class='item'> </td><td class='item'> </td><td class='num' style='font-weight:bold'>"+format_total_intereses+"</td></tr>");
    $("#table_detalle_intereses").append("<tr class='fila_intereses'><td class='itemc' colspan='3'><input type='button' value='Cancelar' onclick='cancelarGenerarFactura()'>  <input type='button' value='Confirmar Generar Factura' onclick='generarFacturaXIntereses()'> </td> </tr>");
    $("#detalle_intereses").fadeIn();
    var mitad = $("#detalle_intereses").width() / 2;
    var window_w_2 = $(window).width() / 2;
    $("#detalle_intereses").offset({left:window_w_2 - mitad,top:120});
}

function cancelarGenerarFactura(){
   $("#detalle_intereses").fadeOut();
}

function generarFacturaXIntereses(){
   
    $.ajax({
        type: "POST",
        url: "caja/CobroCuotas.class.php",
        data: {action: "generarFacturaXIntereses", suc: getSuc(), usuario: getNick(),datos:JSON.stringify(dataToSend)},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            if (data.mensaje === "Ok") {
                
                $("#detalle_intereses").fadeOut();
                $("#msg_intereses").fadeOut();
                $("#msg").html("Dirijase a Caja y Cobre la Factura por Intereses");
                alert("Se ha creado una Factura en Caja, procesa al cobro de la misma \n para que desaparezcan los Intereses de las Cuotas Pendientes.");
            } else {
                $("#msg").html("Error al Generar la Factura por Intereses pongase en contacto con el Administrador.");   
            }                
        },
        error: function (e) {                 
            $("#msg").html("Error al Generar la Factura por Intereses pongase en contacto con el Administrador.");   
            errorMsg("Error al Generar la Factura por Intereses pongase en contacto con el Administrador." + e, 10000);
        }
    }); 
   
    
}

function cobroCuotasUI(){
   $("#popup_caja").slideDown("fast",function(){ 
       $(this).css('top', "80px"); 
   });   
}
function calcRefCheque(){
     var valor = float("valor_cheque");
     var moneda_chq = $("#monedas_cheque").val();
     if(   moneda_chq === "G$"){
         $("#cotiz_cheque").val("1,00");  
     }else{ // U$
         $("#cotiz_cheque").val(us);
     }     
     var cotiz = isNaN( $("#cotiz_cheque").val())?float("cotiz_cheque"):$("#cotiz_cheque").val();
     var valor_ref = valor * cotiz;
     var valor_ref_fortted = valor_ref.format(2, 3, '.', ','); 

     console.log(valor_ref_fortted);

     $("#valor_cheque_gs").val(valor_ref_fortted);
     checkCheque();     
 }
 function buscarDatosCheque(){
    var chq_num = $("#nro_cheque").val();
    $.post("Ajax.class.php",{"action":"obtenerDatosCheque","chq_nro":chq_num},function(data){  
        $("#nro_cheque").val(data.nro_cheque);
        $("#nro_cuenta").val(data.cuenta);
        $("#bancos").val(data.id_banco);
        $("#tipo").val(data.tipo);
        $("#benef").val(data.benef);
        $("#fecha_emis").val(data.fecha_emis);
        $("#fecha_pago").val(data.fecha_pago);
        $("#valor_cheque").val('0,00');
        $("#monedas_cheque").val(data.m_cod);
    },"json");
 }
function checkCheque(){
   var chq_num = $("#nro_cheque").val();
   var nro_cuenta = $("#nro_cuenta").val();
   var benef = $("#benef").val();
   var valor_gs = float("valor_cheque_gs");
   if(chq_num.length >= 3 && nro_cuenta.length > 3 &&  benef.length >= 3 && valor_gs > 0){
       $("#add_cheque").removeAttr("disabled");
   }else{
       $("#add_cheque").attr("disabled",true);
   }
}

function addCheque(){
   $("#add_cheque").attr("disabled",true); 
   var nro_cheque = $("#nro_cheque").val().toUpperCase() ;
   var cuenta = $("#nro_cuenta").val();
   var banco = $("#bancos").val();
   var nombre_banco = $("#bancos option:selected").text();
   var benef = $("#benef").val().toUpperCase();
   var valor = float("valor_cheque");  
   var moneda = $("#monedas_cheque").val();
   var cotiz = float("cotiz_cheque");  
   var valor_gs = float("valor_cheque_gs");  
   var emis = validDate($("#fecha_emision").val()).fecha;  
   var pago = validDate($("#fecha_pago").val()).fecha;  
   var suc = getSuc();
   var trans_num = $("#nro_cobro").val();
   var tipo = $("#tipo").val();

   $.ajax({
       type: "POST",
       url: "Ajax.class.php",
       data: {action: "agregarCheque", nro_cheque: nro_cheque, suc: suc,cuenta:cuenta,banco:banco,valor:valor,moneda:moneda,cotiz:cotiz,valor_ref:valor_gs,benef:benef,emision:emis,pago:pago,factura:null,concepto:8,trans_num:trans_num,campo:"trans_num","tipo":tipo},
       async: true,
       dataType: "html",
       beforeSend: function() {
           $("#msg_cheques").html("<img src='img/loading.gif' width='22px' height='22px' >");                      
       },
       complete: function(objeto, exito) {
           if (exito == "success") {                          
               var total_cheques = parseFloat($.trim(objeto.responseText)).format(0, 3, '.', ',');
               var valor_f = parseFloat(valor).format(0, 3, '.', ',');
               var valor_gs_f = parseFloat(valor_gs).format(0, 3, '.', ',');

               $("#msg_cheques").html(""); 
               $(".cheques_foot").remove();
               $("#lista_cheques").append("<tr class='tr_"+nro_cheque+" tr_cheques'><td>"+nro_cheque+"</td><td>"+nombre_banco+"</td><td>"+cuenta+"</td><td>"+benef+"</td><td  class='num' >"+valor_f+"</td><td class='itemc'>"+moneda+"</td><td class='num'>"+cotiz+"</td><td class='num'>"+valor_gs_f+"</td><td class='itemc'>"+emis+"</td><td class='itemc'>"+pago+"</td><td class='itemc'><img class='del_chq' title='Borrar Cheque' style='cursor:pointer' src='img/trash_mini.png' onclick=delCheque('"+nro_cheque+"','"+factura+"');></td></tr>");
               $("#lista_cheques").append("<tr class='cheques_foot'><td colspan='7' > </td><td style=';font-weight: bolder;font-size: 13px' class='total_cheques num'>"+total_cheques+"</td><td></td> </tr>")
               setRef();
               $("#nro_cheque").val("").focus();
               $("#nro_cuenta").val();
               $("#bancos").val(1);
               $("#bancos option:selected").text();
               $("#benef").val("");
               $("#valor_cheque").val("");  ; 
               $("#cotiz_cheque").val("");  ;  
               $("#valor_cheque_gs").val("");  ;  
               $("#fecha_emision").val("");  
               $("#fecha_pago").val(""); 
               $("#add_cheque").removeAttr("disabled");
           }
       },
       error: function() {
           $("#msg_cheques").html("Ocurrio un error en la comunicacion con el Servidor, intente de nuevo en algunos instantes o contacte con el Administrador.");
       }
   });  
}

function delCheque(nro_cheque,factura){
    var trans_num = $("#nro_cobro").val();
    $.ajax({
       type: "POST",
       url: "Ajax.class.php",
       data: {"action": "borrarChequeDeCobros", "nro_cheque": nro_cheque, "trans_num": trans_num},
       async: true,
       dataType: "html",
       beforeSend: function() {
           $("#msg_cheques").html("<img src='img/loading.gif' width='16px' height='16px' >");                      
       },
       complete: function(objeto, exito) {
           if (exito == "success") {                          
               var total = $.trim(objeto.responseText);
               var valor_total = parseFloat(total).format(0, 3, '.', ',');
               $(".total_cheques").html(valor_total); 
               $(".tr_"+nro_cheque).remove();
               $("#msg_cheques").html("");
               setRef();
           }
       },
       error: function() {
           $("#msg_cheques").html("Ocurrio un error en la comunicacion con el Servidor...");
       }
   }); 
}

function addConv(){
    $("#add_conv").attr("disabled",true); 
    var conv_cod = $("#convenios").val();
    var conv_nombre = $("#convenios option:selected").text();
    var voucher = $.trim($("#voucher").val());
    var monto_conv = float("monto_conv");
    var monto_conv_formated = $("#monto_conv").val();
    var suc = getSuc();

    var trans_num = $("#nro_cobro").val();
    
    var timbrado = $("#timbrado_ret").val();
     var fecha_ret = validDate($("#fecha_ret").val()).fecha;

    $.ajax({
       type: "POST",
       url: "Ajax.class.php",
       data: {"action": "agregarConvenio", "nro_referencia": trans_num, "conv_cod": conv_cod,"conv_nombre":conv_nombre,"voucher":voucher,"monto_conv":monto_conv,"campo":"trans_num","id_concepto":8,suc:suc,timbrado:timbrado,fecha_ret:fecha_ret},
       async: true,
       dataType: "html",
       beforeSend: function() {
           $("#msg_convenios").html("Guardando... <img src='img/loadingt.gif' width='22px' height='22px' >");                      
       },
       complete: function(objeto, exito) {
           if (exito == "success") {                          
               var result = parseFloat( objeto.responseText ).format(2, 3, '.', ',');  

               $(".conv_foot").remove();
               $("#lista_convenios") .append("<tr class='tr_convenios_"+voucher+"'><td class='itemc'>"+conv_cod+"</td>  <td class='item'>"+conv_nombre+"</td> <td class='item'>"+voucher+"</td> <td class='num'>"+monto_conv_formated+"</td><td class='itemc'><img class='del_conv' title='Borrar Tarjeta' style='cursor:pointer' src='img/trash_mini.png' onclick=delConv('"+conv_cod+"','"+voucher+"');></td></tr>");
               $("#lista_convenios") .append("<tr class='conv_foot'><td colspan='3' > </td><td style='text-align: center;font-weight: bolder;font-size: 13px' class='total_convenios'>"+result+"</td><td></td> </tr>");
               $("#msg_convenios").html("");   
               $("#voucher").val("");
               $("#monto_conv").val("");
               setRef();
           }
       },
       error: function() {
           $("#msg_convenios").html("Ocurrio un error en la comunicacion con el Servidor...");
       }
   });    

 }

function delConv(conv_cod,voucher){  

   $("#add_conv").attr("disabled",true); 
   var trans_num = $("#nro_cobro").val();

   $( "#dialog-confirm" ).dialog({
     resizable: false,
     height:140,
     modal: true,
     buttons: {
       "Cancelar": function() {
         $( this ).dialog( "close" );
       },  
       "Borrar este Cobro": function() {
               $( this ).dialog( "close" );
               $.ajax({
                     type: "POST",
                     url: "Ajax.class.php",
                     data: {"action": "borrarConvenio", "nro_referencia": trans_num, "conv_cod": conv_cod,"voucher":voucher,"campo":"trans_num","id_concepto":8},
                     async: true,
                     dataType: "html",
                     beforeSend: function() {
                         $("#msg_convenios").html("Borrando... <img src='img/loadingt.gif' width='22px' height='22px' >");                      
                     },
                     complete: function(objeto, exito) {
                         if (exito == "success") {                          
                             var result = parseFloat( objeto.responseText ).format(2, 3, '.', ',');  
                             $("#add_conv").removeAttr("disabled");
                             $(".conv_foot").remove();               
                             $("#lista_convenios") .append("<tr class='conv_foot'><td colspan='3' > </td><td style='text-align: center;font-weight: bolder;font-size: 13px' class='total_convenios'>"+result+"</td><td></td> </tr>");
                             $("#msg_convenios").html("");  
                             $(".tr_convenios_"+voucher).remove();
                             setRef();
                         }
                     },
                     error: function() {
                         $("#msg_convenios").html("Ocurrio un error en la comunicacion con el Servidor...");
                     }
                 });       
               } 
       },        
       close: function() {            
         $( this ).dialog( "destroy" );
       }
     });

}

function setCuenta(){
   $("#nro_cuenta_dep").val($("#bancos_dep option:selected").attr("data-cuenta")); 
}

function addDep(){
    var nro_cobro = $("#nro_cobro").val();
    var fecha_tranf = $("#fecha_trasnf").val();
    var nro_dep = $("#nro_dep").val();
    var banco = $("#bancos_dep").val();
    var cuenta_dep = $("#nro_cuenta_dep").val();
    var total_dep = $("#total_dep").val();    
    var suc = getSuc();
    if(fecha_tranf != "" && nro_dep != "" && cuenta_dep != "" && total_dep > 0){
       
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "agregarDepositoPorCobroCuota", trans_num:nro_cobro,suc:suc,fecha_tranf:fecha_tranf,nro_dep:nro_dep,banco:banco,cuenta:cuenta_dep,total:total_dep},
            async: true,
            dataType: "html",
            beforeSend: function() {
                $("#msg_transf").html("<img src='img/loading.gif' width='22px' height='22px' >");                      
            },
            complete: function(objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText);  
                    if(result=="Ok" ){
                        $("#del_dep").fadeIn();
                        $("#msg_transf").html("Ok");   
                        setRef();
                    }else{
                         $("#msg_transf").html("Ocurrio un error en la comunicacion con el Servidor...");         
                    }
                }
            },
            error: function() {
                $("#msg_transf").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        });   
    }else{
        $("#msg_transf").addClass("error");
        $("#msg_transf").html("Todos los campos deben estar completos...");
    }
}
function seleccionarFacturaManual(){
    $("#facturas_manuales_div").fadeOut();
}

function float(id){
     var n =  parseFloat($("#"+id).val().replace(/\./g, '').replace(/\,/g, '.'));
     if(isNaN(n)){
         return 0;
     }else{
         return n;
     }
}
/*
function recuperarNroCobro(){
    var nro_cheque = $("#bcheque").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "recuperarNroCobro", nro_cheque: nro_cheque},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {
            if(data.length > 0){
                
                var concepto = data[0].id_concepto;
                var chequedv = data[0].nro_cheque; 
                $("#bcheque").val(chequedv);
                
                $("#codigo_cliente").val( data[0].codigo_cliente);
                $("#ruc_cliente").val( data[0].ruc_cli);
                $("#nombre_cliente").val(data[0].cliente);
                var valor = parseFloat( data[0].valor).format(0, 3, '.', ','); 
                $("#valor_cheque_factura").val( valor );
                
                jQuery('#imprimir_recibo').unbind('click');
                jQuery("#imprimir_recibo").off('click');
                
                if(concepto == "1"){// Factura
                     flagImpresionChequesXCuotas = false; 
                     $("#tipo_transac").html("Cheque recibido por Factura"); 
                     $("#tipo_transac").addClass("xFactura");
                     $("#tipo_transac").removeClass("xCuota");
                     var totalFactura = parseFloat( data[0].TotalFactura).format(0, 3, '.', ',');  
                     $("#total_factura").val(totalFactura);
                }else{                                                                
                    $("#nro_cobro").val(data[0].nro_cobro);
                    $("#total_intereses_pago_anterior").val(data[0].intereses);                      
                    $("#tipo_transac").html("Cheque recibido por Cobro de Cuotas"); 
                    $("#tipo_transac").removeClass("xFactura");
                    $("#tipo_transac").addClass("xCuota");
                    flagImpresionChequesXCuotas = true;
                } 
                var documentos = $("#area_documentos_contables").clone();
                $("#area_documentos_contables").remove();
                $("#clon_documentos_contables").html(documentos);
                getFacturasContables();
                $("#cuotas_content" ).fadeOut();
                $("#area_cobro_options").fadeIn();
            }else{
                $("#area_cobro_options").fadeOut();
                $("#codigo_cliente").val("");
                $("#ruc_cliente").val("");
                $("#nombre_cliente").val("");
                $("#nro_cobro").val("");
            }
            $("#msg").html(""); 
        }
    });
}
*/