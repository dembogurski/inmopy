   
   var rs = 0; // Cotizacion en Reales Pesos y Dolares
   var ps = 0;
   var us = 0;
   var factura = 0;
   var mon_vuelto = "G$";
   var vuelto_gs = 0;
   var cotiz_vuelto = 1; // Cotizacion del Vuelto
   var global_cotiz = 1; 
   var errorVuelto = false;
   var TOPE_ENTREGA = 40;
   var clics_cc = 0;
   var ventana;
   var impresion_factura_cerrada = false;
   
function configurar(){

        $(".clicable").click(function(){ 
             var factura = $(this).parent().attr("id").substring(5,20);
             cobrarFactura(factura);
         });
         inicializarCursores("clicable"); 

         $(window).scroll(function(){
             $('#popup_caja').animate({top:$(window).scrollTop()+"px" },{queue: false, duration: 350});
         });
         $(".entrega").change(function(){
             var resto = 0;
             if($(this).attr("id")=="entrega_gs"){
                resto = $(this).val() % 50;    
             }
             if(resto > 0 ){
                 errorMsg("Ingrese en multiplos de 50 guaranies",8000)
             }
             var n = parseFloat( $(this).val() - resto ).format(2, 3, '.', ',') ;
             $(this).val( n  );
             if($(this).val() =="" || $(this).val() =="NaN" ){
                $(this).val( 0);
             } 
             setRef();
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
         $(".efectivo").on("focus",function(){  
            $(this).select()
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
         
         $("#nro_cheque").mask("9999?99999999").css("text-transform","uppercase");
         $("#nro_cuenta").mask("****?********",{placeholder:""});
         $("#voucher").mask("****?99999999",{placeholder:""});
         //$("#benef").mask("***?********************************************************************************************************************************************",{placeholder:""});
         $("#fecha_emision").mask("99/99/9999");
         $("#fecha_pago").mask("99/99/9999");
         $("#fecha_ret").mask("99/99/9999");
         $("#fecha_inicio").mask("9?99");
         
         $("#orden_benef").mask("***?*********************************************",{placeholder:""});
         $("#monto_orden").mask("9?999999999");
         $("#nro_orden").mask("9?999999999");
          
          
         
         $("select > option:nth-child(even)").css("background","#F0F0F5"); // Color Zebra para los Selects
         $("#benef").css("text-transform","uppercase"); // Beneficiario en el Cheque todo en Mayusculas
         $("#ui_add_cheque input").change(function(){ checkCheque() });
         
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
             }else if(tipo == "Criptomoneda"){
                 $("#tipo_nro").html("N&deg; Cupon:"); 
                 $("#voucher").unmask();
             }else{ // Retencion
                 $("#tipo_nro").html("N&deg; Retencion:"); 
             }
             var nombre =   $("#convenios option:selected").text();
             //$("#logo_tarjeta").attr("src","img/tarjetas/"+nombre+".png"); 
         });
         statusInfo();
         $( "#tabs" ).tabs();
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
  function showMult(id){
      
      var val = parseFloat($("#"+id).val() .replace(/\./g, '').replace(/\,/g, '.')); 
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
    var monto = float(id);  
    var monto_ref = float(id) * cotiz; 
    var suc = getSuc();
    var monedas_vuelto = $("#monedas_vuelto").val();
    var vuelto =   parseFloat(($("#vuelto_faltante").val()).replace(/\./g, '').replace(/\,/g, '.'));
    if($("#label_vuelto_faltante").text() === "Faltante:"){
        vuelto = 0;
        monedas_vuelto = "";
    }
     
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "agregarEfectivo", "nro_referencia": factura, "moneda": moneda,"monto":monto,"cotiz":cotiz,"monto_ref":monto_ref,"id_concepto":1,"campo":"f_nro",suc:suc,usuario:getNick(),moneda_vuelto:monedas_vuelto,vuelto:vuelto,cotiz_vuelto:cotiz_vuelto},
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
  function actualizarVuelto(){
    if($("#label_vuelto_faltante").text() === "Vuelto:"){
        var monedas_vuelto = $("#monedas_vuelto").val();
        var vuelto =   parseFloat(($("#vuelto_faltante").val()).replace(/\./g, '').replace(/\,/g, '.'));
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "actualizarVuelto", "factura": factura, "moneda": monedas_vuelto,"vuelto":vuelto,cotiz_vuelto:cotiz_vuelto},
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
  }
  function setDateCheque(){
      var tipo = $("#tipo").val();
      if(tipo == "Al_Dia"){
          $("#fecha_emision").val($(".fecha_hoy").val());
          $("#fecha_pago").val($(".fecha_hoy").val());  
          $("#fecha_emision").attr("readonly",true);
          $("#fecha_pago").attr("readonly",true);
      }else{
          $("#fecha_emision").val($(".fecha_hoy").val());
          $("#fecha_pago").val("");  
          $("#fecha_emision").removeAttr("readonly");
          $("#fecha_pago").removeAttr("readonly");
      }     
  }
  /**
   * Metodo que levanta la UI para cobrar una Factura Formas de cobro posibles Monedas Locales Tarjetas Credito y 
   * Debito,Cheques y Credito (Cuotas)
   * @param {type} factura
   * @returns {cobrarFactura}
   */
  function cobrarFactura(factura){
     
      $("#tabs").tabs( "enable");
      $("#tabs").tabs( "option", "active", 0 );
      this.factura = factura;
      var fecha = $("#fecha_"+factura).html(); 
      var cod_cli = $("#ruc_"+factura).attr("data-cod_cli"); 
      //var cod_desc = $("#ruc_"+factura).attr("data-cod_desc");        
      var ruc = $("#ruc_"+factura).html(); 
      var cliente = $("#cliente_"+factura).text(); 
      var cat = $("#cat_"+factura).html(); 
      var moneda = $("#moneda_"+factura).html(); 
      
      var clase = "Articulo";
      if($("#fact_"+factura).length > 0){
          clase = $("#fact_"+factura).prop("class").substring(13,30);    
      }
      $("#clase").val(clase);
      $("#clase").addClass(clase);
      
      
      var total_descuento = parseFloat(($("#total_desc_"+factura).text()).replace(/\./g, '').replace(/\,/g, '.'));
      var total_pagar =  $("#total_"+factura).html(); // En la moneda que sea
      
      
      if(impresion_factura_cerrada){
         fecha = $("#bfecha").val(); 
         cod_cli = $("#bcod_cli").val(); 
         cod_desc = $("#bcod_desc").val();        
         ruc = $("#bruc").val(); 
         cliente = $("#bcliente").val(); 
         cat = $("#bcat").val(); 
         moneda = $("#bmoneda").val();        
         total_descuento =  $("#bdescuento" ).val();
         total_pagar =  $("#btotal").val(); // En la moneda que sea    
         clase = $("#bclase").val();
      }
      
      var mon = moneda.replace("$","s").toLowerCase(); //console.log(mon);
      var total_pagar_moneda = total_pagar.replace(/\./g, '').replace(/\,/g, '.');
      
      // $CardCode
      
      if(cat < 3){ //Clientes con Categoria 1 y 2 No pueden insertar cheques diferidos
          //$("#tab_credito").fadeOut();
          $(".diferido").prop("disabled",true);                  
          
      }else{
          var limite = parseFloat($("#limite_credito").val());
          if(limite > 0){
            // $("#tab_credito").fadeIn();
             $(".diferido").removeAttr("disabled");
          }else{
             //$("#tab_credito").fadeOut()
             $(".diferido").prop("disabled",true); 
             errorMsg("Sin limite de credito asignado No se permiten cheques diferidos ni cuotas",50000);
          }          
      }
      
           
      $(".monedas").removeClass("moneda_factura");
      $(".loading_cotiz").fadeIn();       
      rs = float("cotiz_rs");
      ps = float("cotiz_ps");
      us = float("cotiz_us");
      
      cotiz_vuelto = 1;
      
      if(moneda == "G$"){
          global_cotiz = 1; 
      }else if(moneda == "U$"){
          global_cotiz = us;                 
      }else if(moneda == "R$"){
          global_cotiz = rs;                 
      }else if(moneda == "P$"){
          global_cotiz = ps;         
      } 
      
      var total_rs = parseFloat(((total_pagar_moneda * global_cotiz) / rs).toFixed(2));
      var resto_rs = ((total_pagar_moneda * global_cotiz) / rs) % parseFloat(((total_pagar_moneda * global_cotiz) / rs)).toFixed(2);      
      if(resto_rs > 0){ total_rs += 0.01 }
      
      var total_ps = parseFloat(((total_pagar_moneda * global_cotiz) / ps).toFixed(2));
      var resto_ps = ((total_pagar_moneda * global_cotiz) / ps) % parseFloat(((total_pagar_moneda * global_cotiz) / ps)).toFixed(2);      
      if(resto_ps > 0){ total_ps += 0.01 }
      
      var total_us = parseFloat(((total_pagar_moneda * global_cotiz) / us).toFixed(2));
      var resto_us = ((total_pagar_moneda * global_cotiz) / us) % parseFloat(((total_pagar_moneda * global_cotiz) / us)).toFixed(2);      
      if(resto_us > 0){ total_us += 0.01 }
      
      
      $("#total_gs").val(parseFloat( total_pagar_moneda * global_cotiz ).format(0, 3, '.', ',')); 
      
      $("#total_rs").val(parseFloat( total_rs).format(2, 3, '.', ','));
      $("#total_ps").val(parseFloat( total_ps).format(2, 3, '.', ','));
      $("#total_us").val(parseFloat( total_us).format(2, 3, '.', ','));      
      
      $("#total_"+mon).addClass("moneda_factura"); // Resaltarl la Moneda de la Factura
      
      $("#factura").val(factura);
      $("#fecha").val(fecha);
      
       
      $("#ruc_cliente").val(ruc);
      $("#codigo_cliente").val(cod_cli);  
      $("#nombre_cliente").val(cliente);
      $("#benef").val(cliente); 
      $("#categoria").val(cat); 
      $("#moneda").val(moneda);   
      $("#monedas_cuotas").val(moneda);      
    
      $("#popup_caja").slideDown("fast").css('top', "10px"); 
      
      
      $("#entrega_gs").focus();
       /*
      $("#total_rs").val("");
      $("#total_ps").val("");
      $("#total_us").val("");*/
      
        $("#total_rs").attr("title"," Cotiz: "+rs+" ");
        $("#total_ps").attr("title"," Cotiz: "+ps+" ");
        $("#total_us").attr("title"," Cotiz: "+us+" ");
        $("#total_rs").attr("data-info"," Cotiz: "+rs+" ");
        $("#total_ps").attr("data-info"," Cotiz: "+ps+" ");
        $("#total_us").attr("data-info"," Cotiz: "+us+" ");
        
        if(clase === "Servicio"){
            $("#tab_reservas").remove();
            //$("#tab_credito").remove();
            $("#tab_convenios").remove(); 
        }
        
 
        setTimeout('$(".loading_cotiz").fadeOut("fast")',1000);  
           
        getEfectivoFactura(factura); 
        getConveniosDeFactura(factura);
        getChequesDeFactura(factura);
        getCuotasDeFactura();
        getDatosConvenioFactura();
        
        getFacturasContables(); 
        acomodarPopup();
                
           
      $(window).resize(function(){acomodarPopup();});  
      getLimiteCredito();
      statusInfo(); 
  }
  
  function imprimirFacturaCerrada(){
      impresion_factura_cerrada = true;
      $("#ventas").remove();     
      $("#tabs input").prop("disabled",true);
      $("#cerrar_venta").remove();      
      $("#popup_print").fadeIn();
      $("#popup_print").draggable();
  }
  function cargarFactura(){
      var ticket = $("#bticket").val();
      cobrarFactura(ticket);      
  } 
  function buscarTicket(){
      var ticket = $("#bticket").val();
      $.ajax({
        type: "POST",
        url: "caja/VentasEnCaja.class.php",
        data: {"action": "buscarTicket", ticket: ticket,suc:getSuc()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_b").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#popup_print input:not('.mantain')").val("");
            $("#cargar_venta").prop("disabled",true);
        },
        success: function (data) {   
             
            if(data.cod_cli !== undefined){
                var bcod_cli = data.cod_cli;
                var ruc_cli = data.ruc_cli;
                var cliente = data.cliente;  
                var fecha = data.fecha;  
                var moneda = data.moneda;  
                var total = data.total;  
                var total_desc = data.total_desc;  
                var cod_desc = data.cod_desc;
                var fact_nro = data.fact_nro;
                var bcat = data.cat;
                var clase = data.clase;
                $("#bcliente").val(cliente);
                $("#bruc").val(ruc_cli);
                $("#bcat").val(bcat);
                $("#bfactura").val(fact_nro);
                $("#btotal").val(  (parseFloat(total)).format(2, 3, '.', ',') );
                $("#bdescuento").val( (parseFloat(total_desc)).format(2, 3, '.', ','));
                $("#bfecha").val(fecha);
                $("#bmoneda").val(moneda);
                $("#bcod_desc").val(cod_desc);
                $("#bcod_cli").val(bcod_cli);
                $("#bclase").val(clase);
                
                $("#cargar_venta").prop("disabled",false);
                $("#msg_b").html(""); 
            }else{
               $("#msg_b").html("Ticket no encontrado o no le pertenece a su sucursal.");  
            }
              
            
        }
    });
  }
  
  // Acomodar el ancho del popup
  function acomodarPopup(){
        var width_hijos=126;  // 126 = width de espacios
        $('#bottom_bar > *').width(function(i,w){width_hijos+=w;});
        var popup_width = $("#popup_caja").width(); 
        
        var wa = $("#work_area").width();
        if( popup_width < width_hijos ){ 
             $("#popup_caja").width(width_hijos+2);          
        }  
        var margin_left =  0;
        if(wa > ($("#popup_caja").width())){
             margin_left =  (wa - ($("#popup_caja").width()) ) / 2;
        } 
        $("#popup_caja").css("margin-left", margin_left );        
  }
  function getFacturasContables(){
   var suc = getSuc();   
   var tipo_fact = $("#tipo_fact").val();
   var moneda = $("#moneda").val();
   tipo_doc = "Factura";
   if(tipo_fact === "Conf"){
       tipo_doc = "Factura Conformada";
   }
  
   $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getFacturasContables", "suc": suc,tipo_fact:tipo_fact,tipo_doc:tipo_doc,moneda:moneda},
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
                    $("#imprimir_factura").fadeOut();
                    alert("Debe cargar Facturas Contables Pre Impresas en el sistema para poder Imprimir.");
                }else{
                    $("#imprimir_factura").fadeIn();
                    $("#imprimir_factura").removeAttr("disabled");
                }
            }
        });
  }
  
  function getDatosConvenioFactura(){
     $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getDatosConvenioFactura", factura: factura},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
             
           $("#nro_orden").val(data.nro_orden);
           $("#orden_benef").val(data.orden_cli);            
           $("#monto_orden").val(data.orden_valor);             
             
           $("#msg").html(""); 
        }
    }); 
  }
  function getConveniosDeFactura(nro_factura){
   $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getConvenios", "nro_referencia": nro_factura,"campo":"f_nro","id_concepto":1},
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg_convenio").html("Recuperando datos... <img src='img/loadingt.gif'>"); 
            },
            success: function(data) { 
                $(".conv_foot").remove();
                $("[class^='tr_convenios']").remove();
                var total = 0;
                for(var i in data){ 
                     var conv_cod = data[i].cod_conv;
                     var vouch = data[i].voucher;
                     var nombre = data[i].nombre;
                     var monto = data[i].monto;  
                     var monto_conv_formated = parseFloat( monto ).format(2, 3, '.', ',');  
                     total += parseFloat( monto ) ;
                     $("#lista_convenios") .append("<tr class='tr_convenios_"+vouch+"'><td class='itemc'>"+conv_cod+"</td>  <td class='item'>"+nombre+"</td> <td class='item'>"+vouch+"</td> <td class='num'>"+monto_conv_formated+"</td><td class='itemc'><img class='del_conv' title='Borrar Tarjeta' style='cursor:pointer' src='img/trash_mini.png' onclick=delConv('"+conv_cod+"','"+vouch+"');></td></tr>");                                       
                } 
                total = parseFloat(total).format(2, 3, '.', ',');  
                $("#lista_convenios") .append("<tr class='conv_foot'><td colspan='3' > </td><td style='text-align: center;font-weight: bolder;font-size: 13px' class='total_convenios'>"+total+"</td><td></td> </tr>");
                $("#msg_convenios").html("");    
                setRef();                  
            }
        });         
  }
  function getEfectivoFactura(nro_factura){
    $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getEfectivoFactura", "factura": nro_factura},
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg_efectivo").html("Recuperando datos... <img src='img/loadingt.gif'>"); 
            },
            success: function(data) {   
                for(var i in data){ 
                     var codigo = (data[i].codigo).toLowerCase().replace("$","s");
                     var monto = data[i].entrada;
                     $("#entrega_"+codigo).val( parseFloat( monto ).format(2, 3, '.', ',') );   
                     var vuelto = data[i].salida;
                     if(vuelto > 0){
                         mon_vuelto =   data[i].codigo ;                            
                     }
                }   
                setRef();
                $("#msg_efectivo").html(""); 
            }
    });       
  }
  function getChequesDeFactura(nro_factura){
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getChequesDeFactura", "factura": nro_factura},
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg_cheques").html("Recuperando datos... <img src='img/loadingt.gif'>"); 
            },
            success: function(data) { 
                $(".cheques_foot").remove();
                $(".tr_cheques").remove(); 
                
                var total = 0;
                for(var i in data){ 
                     var nro_cheque = data[i].nro_cheque;
                     var banco = data[i].banco;
                     var cuenta = data[i].cuenta;
                     var valor = data[i].valor;  
                     var cotiz = data[i].cotiz;                        
                     var valor_ref = data[i].valor_ref;  
                     var fecha_emis = data[i].fecha_emis;
                     var fecha_pago = data[i].fecha_pago;
                     var benef = data[i].benef;  
                     var moneda = data[i].moneda;                       
                     var valor_formated = parseFloat( valor ).format(0, 3, '.', ',');  
                     var valor_gs_formated = parseFloat( valor_ref ).format(0, 3, '.', ',');  
                     total += parseFloat( valor_ref ) ;
                     $("#lista_cheques") .append("<tr class='tr_"+nro_cheque+"  tr_cheques'><td>"+nro_cheque+"</td><td>"+banco+"</td><td>"+cuenta+"</td><td>"+benef+"</td><td  class='num' >"+valor_formated+"</td><td class='itemc'>"+moneda+"</td><td class='num'>"+cotiz+"</td><td class='num'>"+valor_gs_formated+"</td><td  class='itemc'>"+fecha_emis+"</td><td  class='itemc'>"+fecha_pago+"</td><td  class='itemc'><img class='del_chq' title='Borrar Cheque' style='cursor:pointer' src='img/trash_mini.png' onclick=delCheque('"+nro_cheque+"','"+factura+"');></td></tr>");                                       
                } 
                total = parseFloat(total).format(2, 3, '.', ',');  
                $("#lista_cheques") .append("<tr class='cheques_foot'><td colspan='7' > </td><td style='text-align: center;font-weight: bolder;font-size: 13px' class='total_cheques'>"+total+"</td><td></td> </tr>");
                $("#msg_cheques").html("");    
                setRef();                  
            }
        });       
  }
  function cancelar(){      
     $("[class^=tr_convenios]").remove();
     $("[class^=tr_cuotas]").remove();
     $("[class^=tr_cheques]").remove();
     $("#popup_caja").slideUp("slow"); 
  }
  
  function addConv(){
     $("#add_conv").attr("disabled",true); 
     var conv_cod = $("#convenios").val();
     var conv_nombre = $("#convenios option:selected").text();
     var voucher = $.trim($("#voucher").val());
     var monto_conv = float("monto_conv");
     var monto_conv_formated = $("#monto_conv").val();
     var suc = getSuc();
     
     var timbrado = $("#timbrado_ret").val();
     var fecha_ret = validDate($("#fecha_ret").val()).fecha;
     
     $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "agregarConvenio", "nro_referencia": factura, "conv_cod": conv_cod,"conv_nombre":conv_nombre,"voucher":voucher,"monto_conv":monto_conv,"campo":"f_nro","id_concepto":1,suc:suc,timbrado:timbrado,fecha_ret:fecha_ret},
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
                      data: {"action": "borrarConvenio", "nro_referencia": factura, "conv_cod": conv_cod,"voucher":voucher,"campo":"f_nro","id_concepto":1},
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
 
 function calcRefCheque(){
     var valor = float("valor_cheque");
     var moneda_chq = $("#monedas_cheque").val();
     if(   moneda_chq === "G$"){
         $("#cotiz_cheque").val("1,00");  
     }else{ // U$
         $("#cotiz_cheque").val(us);  
     }     
     var cotiz = float("cotiz_cheque");
     var valor_ref = valor * cotiz;
     var valor_ref_fortted = valor_ref.format(2, 3, '.', ','); 
     $("#valor_cheque_gs").val(valor_ref_fortted);
     checkCheque();     
 }
 function checkCheque(){
    var chq_num = $("#nro_cheque").val();
    var nro_cuenta = $("#nro_cuenta").val();
    var benef = $("#benef").val();
    var valor_gs = float("valor_cheque_gs");
    
    var emis =  $("#fecha_emision").val() ;  
    var pago =  $("#fecha_pago").val();  
    
    if(chq_num.length >= 3 && nro_cuenta.length > 3 &&  benef.length >= 3 && valor_gs > 0 && ( emis != "" && pago != "" && (chq_num < 2147483647 ) ) ){
        $("#add_cheque").removeAttr("disabled");        
    }else{
        $("#add_cheque").attr("disabled",true);
    }
    if((chq_num > 2147483647 )){
        alert("Valor del cheque demasiado grande");
        errorMsg("Valor del cheque demasiado grande",8000);
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
    var tipo = $("#tipo").val();
    var suc = getSuc();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {action: "agregarCheque", nro_cheque: nro_cheque, suc: suc,cuenta:cuenta,banco:banco,valor:valor,moneda:moneda,cotiz:cotiz,valor_ref:valor_gs,benef:benef,emision:emis,pago:pago,factura:factura,concepto:1,trans_num:factura,campo:"f_nro",tipo:tipo},
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
     $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "borrarChequeDeFactura", "nro_cheque": nro_cheque, "factura": factura},
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
 function getCuotasDeFactura(){
     // Este metodo toma NaN como Monto inicial por lo tanto solo devuelve las ya generadas
     $(".cuotas").remove();
     $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getCuotasDeFactura",factura:factura},
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg_cuotas").html("<img src='img/loading.gif' height='20px' width='20px' >"); 
            },
            success: function(data) {  
               $(".cuotas_foot").remove(); 
                    var total_moneda = 0;  
                    var total = 0;
                    for(var i in data){ 
                         var nro = data[i].id_cuota;
                         var moneda = data[i].moneda;
                         var monto = data[i].monto;
                         var tasa_interes = data[i].tasa_interes;  
                         var cotiz = data[i].cotiz;                        
                         var ret_iva = data[i].ret_iva;  
                         var monto_ref = data[i].monto_ref;
                         var valor_total = data[i].monto;
                         var vencimiento = data[i].vencimiento;  
                         var estado = data[i].estado;                       
                         var monto_ref_formated = parseFloat( monto_ref ).format(0, 3, '.', ',');  
                         //var valor_gs_formated = parseFloat( valor_ref ).format(0, 3, '.', ',');  
                         total += parseFloat( monto_ref ); 
                         total_moneda+= parseFloat( valor_total )
                         var paper_size = '<label>A4&nbsp;</label><input type="radio" value="9" name="paper_size_'+nro+'" checked="checked" >&nbsp;<label>Oficio</label><input type="radio" value="14" name="paper_size_'+nro+'" >'; 
                         $("#lista_cuotas") .append("<tr class='tr_"+nro+" cuotas tr_cuotas'><td class='itemc'>"+nro+"</td><td class='num' >"+monto+"</td><td class='itemc' >"+moneda+"</td><td class='num' >"+cotiz+"</td><td  class='itemc'>"+tasa_interes+"%</td><td  class='num' >"+ret_iva+"</td>\n\
                         <td class='num'>"+valor_total+"</td><td class='num'>"+monto_ref+"</td><td  class='itemc'>"+vencimiento+"</td><td  class='itemc'>"+paper_size+"<img id='img_"+nro+"' src='img/printer-01_32x32.png' width='22' height='20' style='cursor:pointer' onclick='imprimirPagare("+nro+")' > </td></tr>");                                       
                         $(".cuotas_bar").fadeIn();
                    } 
                    if(total > 0){
                        $("#tipo_factura").val("Credito");
                    }else{
                        $("#tipo_factura").val("Contado");
                    }
                    total = parseFloat(total).format(2, 3, '.', ',');  
                    total_moneda = parseFloat(total_moneda).format(2, 3, '.', ',');
                    $("#lista_cuotas").append("<tr class='cuotas_foot'><td colspan='6' > </td> <td style='text-align: right;font-weight: bolder;font-size: 13px' class='total_cuotas_moneda' >"+total_moneda+"</td> <td style='text-align: right;font-weight: bolder;font-size: 13px' class='total_cuotas'>"+total+"</td><td></td> </tr>");
                    $("#msg_cuotas").html("");    
                    setRef();            
                    $("#msg_cuotas").html(""); 
            }
        }); 
  
 }
  function setPlanPago( plan ){
      if(plan != 4){
         $("#n_cuotas").attr("disabled",true); 
      }else{
         $("#n_cuotas").removeAttr("disabled");
      }
      if(plan > 1){$("#generar_cuotas").val("Generar Cuotas");}else{$("#generar_cuotas").val("Generar Cuota");}
      calcRefCuota();
      $("#generar_cuotas").removeAttr("disabled");
  }
  function calcRefCuota(){
        var moneda_cuota = $("#monedas_cuotas").val();
        if(   moneda_cuota === "G$"){
            $("#cotiz_cuota").val("1,00");  
        }else{ // U$
            $("#cotiz_cuota").val(parseFloat(us).format(2, 3, '.', ','));  
        }     
        var cotiz = float("cotiz_cuota");
        var  faltante = float("vuelto_faltante");
        var plan = $('input[name=plan]:checked').val();
        var cuotas = plan;
        if(plan == 4){
             cuotas = $("#n_cuotas").val();
        }
        var valor_cuota = parseFloat((faltante / cotiz) / cuotas).format(2, 3, '.', ',');
        var moneda = $("#monedas_cuotas option:selected").text();
        $("#msg_valcuota").html(cuotas+" de "+valor_cuota+"  "+moneda);
  }
  function generarCuotas(){
    var cant_cuotas = $(".tr_cuotas").length;
    if(cant_cuotas < 1){
    $("#generar_cuotas").attr("disabled",true);  
    var moneda_cuota = $("#monedas_cuotas").val();
    var suc = getSuc();
    if(   moneda_cuota === "G$"){
        $("#cotiz_cuota").val("1,00");  
    }else{ // U$
        $("#cotiz_cuota").val(parseFloat(us).format(2, 3, '.', ','));  
    }     
    var cotiz = float("cotiz_cuota");
    var  faltante = float("vuelto_faltante");
    var plan = $('input[name=plan]:checked').val();
    var cuotas = plan;
    if(plan == 4){
         cuotas = $("#n_cuotas").val();
    }
    if(isNaN(cuotas)){
        cuotas = 0;
    }
    var valor_cuota = parseFloat((faltante / cotiz) / cuotas);// Este no se puede tomar por el redondeo
    var tax = 2.3; // 2%
    var interes = 0;  // Se Calcula 
    var fecha_inicio =  $("#fecha_inicio").val() ;
    
    var total_factura = float("total_gs");
    
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "generarCuotas",factura:factura,monto:valor_cuota, moneda: moneda_cuota, cuotas:cuotas,cotiz:cotiz,tax:tax,interes:interes,suc:suc,fecha_inicio:fecha_inicio,total_factura:total_factura},
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg_cuotas").html("<img src='img/loading.gif' height='20px' width='20px' >"); 
        },
        success: function(data) {  
           $(".cuotas_foot").remove(); 
                var total_moneda = 0;  
                var total = 0;
                for(var i in data){ 
                     var nro = data[i].id_cuota;
                     var moneda = data[i].moneda;
                     var monto = data[i].monto;
                     var tasa_interes = data[i].tasa_interes;  
                     var cotiz = data[i].cotiz;                        
                     var ret_iva = data[i].ret_iva;  
                     var monto_ref = data[i].monto_ref;
                     var valor_total = data[i].valor_total;
                     var vencimiento = data[i].vencimiento;  
                     var estado = data[i].estado;                       
                     var monto_ref_formated = parseFloat( monto_ref ).format(0, 3, '.', ',');  
                     //var valor_gs_formated = parseFloat( valor_ref ).format(0, 3, '.', ',');  
                     total += parseFloat( monto_ref ); 
                     total_moneda+= parseFloat( valor_total )
                     var paper_size = '<label>A4&nbsp;</label><input type="radio" value="9" name="paper_size_'+nro+'" checked="checked" >&nbsp;<label>Oficio</label><input type="radio" value="14" name="paper_size_'+nro+'" >'; 
                     $("#lista_cuotas") .append("<tr class='tr_"+nro+" cuotas tr_cuotas'><td class='itemc'>"+nro+"</td><td class='num' >"+monto+"</td><td class='itemc' >"+moneda+"</td><td class='num' >"+cotiz+"</td><td  class='itemc'>"+tasa_interes+"%</td><td  class='num' >"+ret_iva+"</td>\n\
                     <td class='num'>"+valor_total+"</td><td class='num'>"+monto_ref+"</td><td  class='itemc'>"+vencimiento+"</td><td  class='itemc'>"+paper_size+"<img id='img_"+nro+"' src='img/printer-01_32x32.png' width='22' height='20' style='cursor:pointer' onclick='imprimirPagare("+nro+")' > </td></tr>");                                       
                     $(".cuotas_bar").fadeIn();
                } 
                if(total > 0){
                    $("#tipo_factura").val("Credito");
                }else{
                    $("#tipo_factura").val("Contado");
                }
                total = parseFloat(total).format(2, 3, '.', ',');  
                total_moneda = parseFloat(total_moneda).format(2, 3, '.', ',');
                $("#lista_cuotas").append("<tr class='cuotas_foot'><td colspan='6' > </td> <td style='text-align: right;font-weight: bolder;font-size: 13px' class='total_cuotas_moneda' >"+total_moneda+"</td> <td style='text-align: right;font-weight: bolder;font-size: 13px' class='total_cuotas'>"+total+"</td><td></td> </tr>");
                $("#msg_cuotas").html("");    
                setRef();            
                $("#msg_cuotas").html(""); 
        }
    }); 
    }else{
      errorMsg("Elimine primero las cuotas existentes antes de generar nuevas",8000);
    }
  }
  
  function getReserva(){
    var ticket = $("#ticket_reserva").val();   
    var cod_cli = $("#codigo_cliente").val();  
    
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getValorReserva", "reserva": ticket,"cod_cli":cod_cli},
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg_reservas").html("Buscando datos de Reserva <img src='img/loading.gif' width='22px' height='22px' >"); 
        },
        success: function(data) {   
            var estado = data.estado;
            var expira = data.expira;
            if(estado != 'Error'){
                if(estado == 'Expirado'){
                   $("#msg_reservas").html("Este ticket ha vencido en la fecha : "+expira+" ");
                   $("#entrega_reserva").val(0);
                }else if(estado == 'Liberada'){
                    var valor =  parseFloat($.trim(data.valor)).format(2, 3, '.', ',');    
                    $("#entrega_reserva").val(valor);
                    $("#entrega_reserva").addClass("info");
                    $("#msg_reservas").html(""); 
                }else{ // Cualquier otro estado
                   $("#msg_reservas").addClass("error"); 
                   $("#msg_reservas").html("Esta reserva esta en estado : "+estado+" para que tenga efecto la reserva debe estar en Liberada");
                   $("#entrega_reserva").val(valor);  
                }
            }else{
              $("#msg_reservas").addClass("error");
              $("#msg_reservas").html(data.mensaje);  
              $("#entrega_reserva").val(0);
              $("#ticket_reserva").val(""); 
            }
             setRef(); 
        }
    });
  }  
  function imprimirPagare(nro){
      $("#img_"+nro).attr("src","img/printer-02_32x32.png");
      var ruc = $("#ruc_cliente").val();
      var suc = getSuc();
      var usuario = getNick();
      var papar_size = $('input[name=paper_size_'+nro+']:checked').val();
      var url = "caja/Pagare.class.php?factura="+factura+"&ruc="+ruc+"&suc="+suc+"&nro_pg="+nro+"&usuario="+usuario+"&papar_size="+papar_size;
      var title = "Impresion de Pagares";
      var params = "width=800,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
      
      if(typeof(showModalDialog) === "function"){ // Firefox         
         window.showModalDialog(url,title,params);             
      }else{
         window.open(url,title,params);        
      }
  }
   
  
  function imprimirFactura(){
     var factura_contable = $("#factura_contable").val();
     var tipo_factura = $("#tipo_factura").val();
     var pdv = $("#factura_contable option:selected").attr("data-pdv"); 
     var moneda = $("#moneda").val();
     
     if(factura_contable != ""){
         var ruc = $("#ruc_cliente").val();
         var cliente = encodeURI($("#nombre_cliente").val());
         var suc = getSuc();
         var usuario = getNick();
         var papar_size = 9; // Dedocratico A4
         var tipo_fact = $("#tipo_fact").val();
                  
         var url = "caja/ImpresorFactura.class.php?factura="+factura+"&ruc="+ruc+"&cliente="+cliente+"&suc="+suc+"&factura_legal="+factura_contable+"&usuario="+usuario+"&papar_size="+papar_size+"&tipo_factura="+tipo_factura+"&pdv="+pdv+"&man_pre="+tipo_fact+"&moneda="+moneda;
         var title ="Impresion de Facturas Contables";
         var params ="width=800,height=840,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
         if(typeof(showModalDialog) === "function"){ // Firefox
             window.showModalDialog(url,title,params);                      
         }else{
             window.open(url,title,params);                       
         }
         checkearEntregaParcial();
     }else{
         alert("Debe Pre cargar las Facturas Contables para poder Imprimir");
     }
  }
  function checkearEntregaParcial(){
      $.ajax({
        type: "POST",
        url: "caja/VentasEnCaja.class.php",
        data: {action: "checkearEntregaParcial","factura": factura, suc: getSuc(), usuario: getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
             var entrega = data.entrega;
             var tipo_factura = $("#tipo_factura").val();
             if(entrega > 0 && tipo_factura === 'Credito'){
                 getRecibosContables();
                 setTimeout("imprimirRecibo()",500);
             }
        },
        error: function (e) {                 
            $("#msg").html("Error al obtener Numeros de Recibos Pre Impresos:  " + e);   
            errorMsg("Error al obtener Numeros de Recibos Pre Impresos:  " + e, 10000);
        }
    }); 
  }
  function eliminarCuotas(){
      $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "eliminarCuotas", "factura": factura},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg_cuotas").html("<img src='img/loadingt.gif' >");                      
        },
        complete: function(objeto, exito) {
            if (exito == "success") {                          
                $(".cuotas").remove();   $(".total_cuotas").html("0"); $(".total_cuotas_moneda").html("0");  
                setRef();    
                $(".cuotas_bar").fadeOut();
                $("#msg_cuotas").html("Cuotas eliminadas puede generar de nuevo...");  
                $("#tipo_factura").val("Contado");
            }
        },
        error: function() {
            $("#msg_cuotas").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
  }
  
   
  /**
   * float dado un id le saca el valor y devuelve un Numero valido
   * en caso de no ser un numero devuelve 0
   * @param {String} id
   * @returns {Number}
   */
  
  function float(id){
        var n =  parseFloat($("#"+id).val().replace(/\./g, '').replace(/\,/g, '.'));
        if(isNaN(n)){
            return 0;
        }else{
            return n;
        }
  } 
  
  function setRef(){    
      vuelto_gs = 0;
      var entrega_gs = float("entrega_gs");
      
      var entrega_rs = float("entrega_rs") * rs;
      var entrega_ps = float("entrega_ps") * ps;
      var entrega_us = float("entrega_us") * us; 
                
      var total_entrega_efectivo =  entrega_gs + entrega_rs +  entrega_ps + entrega_us  ;
      
      var total_convenios = parseFloat($(".total_convenios").text().replace(/\./g, '').replace(/\,/g, '.'));
      
      var total_cheques =  parseFloat($(".total_cheques").text().replace(/\./g, '').replace(/\,/g, '.'));
      
      var total_cuotas = parseFloat($(".total_cuotas").text().replace(/\./g, '').replace(/\,/g, '.'));
      
      var reserva = float("entrega_reserva");
      
      var convenio = float("monto_orden"); 
        
      var total_pagar_gs  = float("total_gs");
      var vuelvo_faltante = total_pagar_gs - (total_entrega_efectivo + total_convenios + total_cheques + total_cuotas + reserva + convenio);
      vuelto_gs = vuelvo_faltante; 
      if(vuelvo_faltante <= 0){
         $("#label_vuelto_faltante").text("Vuelto:"); $("#vuelto_faltante").css("color","green");  $("#label_vuelto_faltante").css("color","green");  
         vuelvo_faltante*= -1; vuelto_gs*= -1;
         var total_gs = float("total_gs");
         
         if(vuelvo_faltante >  total_gs ){
            errorMsg("Vuelto no puede ser mayor al total",7000);
            $(".cerrar_venta").attr("disabled",true);
         }else{
            $(".cerrar_venta").removeAttr("disabled");
         }
              
      }else{
         $("#label_vuelto_faltante").text("Faltante:"); $("#vuelto_faltante").css("color","red"); $("#label_vuelto_faltante").css("color","red");  
         $(".cerrar_venta").attr("disabled",true);
      }        
      
      var total_entregado = total_entrega_efectivo + total_convenios + total_cheques + total_cuotas + reserva;

      /**
       * Habilitar cobro en cuotas
       * si la diferencia entre limite de credito y entrega en efectivo es igual o mayor a cero
       */
      
      var cat = parseFloat($("#categoria").val());
      var ruc = $("#ruc_cliente").val();
      var limite = parseFloat($("#limite_credito").val().replace(/\./g,''));
      
      if(!(cat < 3)  && (0 <= (total_entregado + limite)) ){
        if(limite > 0){
           $("#tab_credito").fadeIn();
        }else{  
           $("#tab_credito").fadeOut();
        }        
      }else{
        $("#tab_credito").fadeOut();
      }
      $("#monedas_vuelto").val(mon_vuelto); // Mostrar vuelto en lamoneda que que ya se pre cargo
      $("#total_entrega").val(total_entregado.format(2, 3, '.', ','));
      calcVuelto(0);
      //$("#vuelto_faltante").val(vuelvo_faltante.format(2, 3, '.', ','));   
            
  }
  function calcVuelto(update){
     var mv = $("#monedas_vuelto").val();
     var vuelto = vuelto_gs;
     cotiz_vuelto = 1;
     if(mv == 'R$'){
        vuelto = vuelto_gs / rs;  cotiz_vuelto = rs;
     }else if(mv == 'P$'){
        vuelto = vuelto_gs / ps;  cotiz_vuelto = ps;
     }else if(mv == 'U$'){
        vuelto = vuelto_gs / us;  cotiz_vuelto = us;
     } 
     $("#vuelto_faltante").val(vuelto.format(2, 3, '.', ',')); 
     console.log(update+" "+mv+"  "+vuelto+"   "+cotiz_vuelto);
     if(update){
        actualizarVuelto();
     }
  }
 
  function borrarDescuento(factura){
   var tipo_doc = $("#fact_"+factura).attr("data-tipo_doc");
   
   $("#alert_msg").html("Esta a punto de eliminar el Descuento, confirme este procedimiento.<br>Los Descuentos para Cat. 1 y 2 solo estan permitidos para pagos en Efectivo");
   $("#dialog-confirm").attr("title","Que desea hacer?");   
   $( "#dialog-confirm" ).dialog({
      resizable: false,
      height:180,
      width:360,
      modal: true,
      dialogClass:"ui-state-highlight",
      buttons: {
        "Cancelar": function() {
          $( this ).dialog( "close" );
        },  
        "Borrar Descuento": function() {                
                $.ajax({
                      type: "POST",
                      url: "Ajax.class.php",
                      data: {"action": "borrarDescuentoDeFactura", "factura": factura,tipo_doc:tipo_doc},
                      async: true,
                      dataType: "html",
                      beforeSend: function() {
                          $("#trash_desc_"+factura).html("<img src='img/loadingt.gif' width='22px' height='22px' >"); 
                          $("#alert_msg").html("El Descuento se esta eliminando espere...<img src='img/loadingt.gif' width='22px' height='22px' >");
                      },
                      complete: function(objeto, exito) {
                          if (exito == "success") {                          
                             $("#trash_desc_"+factura).html(""); 
                             var total_bruto =  $("#total_bruto_"+factura).html();
                             $("#total_"+factura).html(total_bruto);
                             $("#total_desc_"+factura).html("0");
                             $("#trash_desc_"+factura).fadeOut("slow");
                             $( "#dialog-confirm" ).dialog( "close" );
                          }
                      },
                      error: function() {
                          alert("Ocurrio un error en la comunicacion con el Servidor...");
                      }
                  });       
                } 
        },        
        close: function() {            
          $( this ).dialog( "destroy" );
        }
      });  
  }
  function  guardarDatosConvenio(){
      var orden_beneficiario = $("#orden_benef").val();
      var valor_orden = $("#monto_orden").val();
      var nro_orden = $("#nro_orden").val();
      if(isNaN(valor_orden)){
          valor_orden = 0;          
      }
      $("#msg_conv").html("Guardando datos...");  
      $.post("Ajax.class.php", {action: "guardarDatosConvenio", "factura": factura, orden_beneficiario: orden_beneficiario, valor_orden: valor_orden,nro_orden:nro_orden},function(data){
           $("#msg_conv").html(data);  
           setRef();
      });
  }
  function imprimirTicket(){
      var factura = $("#factura").val();
      var cliente = $("#nombre_cliente").val();
      var ruc = $("#ruc_cliente").val(); 
      var suc = getSuc();
      
      var moneda =  $("#moneda").val();
      
      $("#ticket_caja").remove(); // Si existe lo elimino
      var t = $('<iframe id="ticket_caja" name="ticket_caja" style="width:0px; height:0px; border: 0px" src="caja/TicketCaja.class.php?factura='+factura+'&cliente='+cliente+'&ruc='+ruc+'&suc='+suc+'&moneda='+moneda+'">');
      t.appendTo(".popup_caja");    
  }
  function cerrarVenta(){
    $("#cerrar_venta").attr("disabled",true);
    var usuario = getNick(); 
    var moneda_vuelto = $("#monedas_vuelto").val();
    var vuelto = float("vuelto_faltante");
    var tipo_factura = $("#tipo_factura").val();
    var  clase = $("#clase").val();
    
    var orden_beneficiario = $("#orden_benef").val();
    var valor_orden = $("#monto_orden").val();
    if((orden_beneficiario != "" && valor_orden <= 0) || valor_orden > 0 && orden_beneficiario == ""){
        errorMsg("Si la venta es de un Convenio revise los datos del Nro de Orden",20000);    
        return;
    }  
    
    if(vuelto > 0){
        var total_factura = parseFloat($("#total_gs").val().replace(/\./g, '').replace(/\,/g, '.'));   
        var total_convenios = parseFloat($(".total_convenios").text().replace(/\./g, '').replace(/\,/g, '.'));      
        var total_cheques =  parseFloat($(".total_cheques").text().replace(/\./g, '').replace(/\,/g, '.'));      
        var total_cuotas = parseFloat($(".total_cuotas").text().replace(/\./g, '').replace(/\,/g, '.'));
        var reserva = float("entrega_reserva");
        if((total_convenios + total_cheques + total_cuotas + reserva) >  (total_factura + ((total_factura * TOPE_ENTREGA) / 100)) ){
            errorMsg("La suma de Cheques, Tarjetas y cuotas no puede exeder el total de la factura + !",20000);
            return;
        } 
    }
    
    var ticket = $("#ticket_reserva").val();  
    var suc = getSuc();  parseFloat($("#total_gs").val().replace(/\./g, '').replace(/\,/g, '.'));   
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "cerrarVenta", "usuario": usuario, "factura": factura,"moneda_vuelto":moneda_vuelto,"vuelto":vuelto,"cotiz":cotiz_vuelto,"vuelto_gs":vuelto_gs,ticket_reserva:ticket,suc:suc,tipo_factura:tipo_factura,clase:clase},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $(".info").html("Cerrando Venta Favor Espere... <img src='img/loading.gif' width='22px' height='22px' >");                      
        },
        complete: function(objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText); 
                if(result == "Ok"){
                   $("#fact_"+factura).remove();
                   $("#popup_caja").slideUp("fast"); 
                   $(".entrega").val(""); 
                }else{
                    $(".info").html("Ocurrio un Error durante la transaccion, recargue la lista y vuelva a intentarlo, en caso de que siga el error contacte con el Adminitrador...");    
                    alert("Informe Tecnico: Factura: "+factura+" ["+result+"]");
                }
            }
        },
        error: function() {
            $("#.info").addClass("error");
            $("#.info").html("Ocurrio un error en la comunicacion con el Servidor, favor intente mas tarde...");
            $("#cerrar_venta").removeAttr("disabled");
        }
    }); 
  }
  
function getLimiteCredito(){
    var CardCode = $("#codigo_cliente").val();
    $.post( "Ajax.class.php",{ action: "getLimiteCreditoCliente",CardCode:CardCode}, function( data ) {
       var es_funcionario = $("#nombre_cliente").val().indexOf("FUNCIONARI")>=0?true:false; 
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
       
       if(CantidadDeCuotas == 1 ){
           $("#p2").prop("disabled",true);
           $("#p3").prop("disabled",true);           
           $("#pn").prop("disabled",true);           
       }else if(CantidadDeCuotas == 2 ){           
           $("#p3").prop("disabled",true);           
           $("#pn").prop("disabled",true);           
       }else if(CantidadDeCuotas == 3 ){                      
           $("#pn").prop("disabled",true);           
       }else if(CantidadDeCuotas > 3 ){    
           $(".cuota_x").prop("disabled",false);
           $(".cuota_x").fadeIn();  console.log( "  for ");
           for(var i = (CantidadDeCuotas + 1 );i <= 60;i++  ){                
               $(".n_cuota_"+i ).prop("disabled",true);
               $(".n_cuota_"+i ).fadeOut();
           }
       }
       
       if(PlazoMaximo == 30 ){
           $("#p2").prop("disabled",true);
           $("#p3").prop("disabled",true);           
           $("#pn").prop("disabled",true);           
       }else if(PlazoMaximo == 60 ){           
           $("#p3").prop("disabled",true);           
           $("#pn").prop("disabled",true);           
       }else if(PlazoMaximo == 90 ){                      
           $("#pn").prop("disabled",true);           
       } 
       
       console.log("Limite "+Limite);       
       console.log("CantidadDeCuotas "+CantidadDeCuotas);
       console.log("PlazoMaximo "+PlazoMaximo);
       //console.log("Limite "+Limite);
       
       var Diff = parseFloat(Limite - (Cuotas + Cheques + VentasNoProcesadas) + (EfectivoNoProc + ChequesAlDiaNoProcesados)); 
       var deuda_actual = (Cuotas + Cheques + VentasNoProcesadas) + (EfectivoNoProc + ChequesAlDiaNoProcesados);
       
       $("#limite_credito").val( ( Diff).format(0, 3, '.', ','));
       
       var limite_vs_cant_cuotas_y_diff = ( Limite > 0 && CantidadDeCuotas > 0 && Diff >= 0 );
       var cuotas_atrasadas_vs_permitidas = (CuotasAtrasadas < CuotasAtrasadasPermitidas) || (CuotasAtrasadas == 0); 
        console.log("CuotasAtrasadas "+CuotasAtrasadas+"  CuotasAtrasadasPermitidas  "+CuotasAtrasadasPermitidas);
         
        console.log("limite_vs_cant_cuotas_y_diff:  "  +limite_vs_cant_cuotas_y_diff + " cuotas_atrasadas_vs_permitidas  "+ cuotas_atrasadas_vs_permitidas +"  Diff  "+Diff+"  Deuda actual = "+deuda_actual+"  ");
        
        var clase = $("#clase").val();
        
        if((( Limite > 0 && CantidadDeCuotas > 0 && Diff >= 0 ) && (cuotas_atrasadas_vs_permitidas))   || (es_funcionario)  || (clase == "Servicio") ){
            $("#tab_credito").fadeIn();             
        }else{
            $("#tab_credito").fadeOut();
        }
        
        $(".limite_credito").fadeIn();
        if(Diff <= 0){
           $("#limite_credito").css("color","red"); 
        }else{
           $("#limite_credito").css("color","green");  
        } 
        if(CantidadDeCuotas != null){
            if(PlazoMaximo != ""){
               $("#msg_cuotas").html("Cantidad de cuotas: "+CantidadDeCuotas+" Plazo maximo: "+PlazoMaximo+" dias");
               $("#msg_cuotas").css("background","red").css("color","white");
            }
        }
                
        //var CardCode = $("#codigo_cliente").val();
        
        if(CuotasAtrasadas > CuotasAtrasadasPermitidas && getSuc() != "00" &&  !es_funcionario   ){
           //$("#tab_credito").fadeOut();
           errorMsg("Cliente tiene "+CuotasAtrasadas+" cuotas atrasadas...",25000); 
        }
        var pref_pago = $(".pref_pago_"+factura).text();
        if(pref_pago == "Contado"){
            $("#tab_tarjetas").remove();
        }   
    },'json'); 
}  

function irAreaCobros(){
    var ruc = $("#ruc_cliente").val();
    var url = "GenericOpen.class.php?url=caja/CobroCuotas.class.php&parameters=ruc_cli="+ruc+"";
    var title = "Area de Cobros";
    var params = "width=1024,height=800,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
     
    if(!ventana){        
        ventana = window.open(url,title,params);
    }else{
        ventana.close();
        ventana = window.open(url,title,params);
    }     
}

function completar(id){
   var total =   parseFloat(($("#total_"+id).val()).replace(/\./g, '').replace(/\,/g, '.'));
   var entrega_actual =   parseFloat(($("#entrega_"+id).val()).replace(/\./g, '').replace(/\,/g, '.'));
   if(entrega_actual > 0){
       $("#entrega_"+id).val(0);
       //$("#comp_"+id).val("&#x25C0;");
   }else{ 
       $("#entrega_"+id).val(total);
       //$("#comp_"+id).val("&#x25BC;");
   } 
   $("#entrega_"+id).trigger("change");
}

function completarTarjeta(){
    var total =   parseFloat(($("#total_gs").val()).replace(/\./g, '').replace(/\,/g, '.'));
    var entrega_actual =   parseFloat(($("#total_entrega").val()).replace(/\./g, '').replace(/\,/g, '.'));    
    var diff = parseFloat(total - entrega_actual);
    $("#monto_conv").val(diff);
    $("#entrega_gs").trigger("change");
}

function imprimirRecibo(){
      
     var nro_recibo = $("#recibos_contables").val(); // Nro de Recibo en Realidad 
     var pdv = $("#recibos_contables option:selected").attr("data-pdv"); 
     
     var factura = $("#factura").val(); 
      
     if(nro_recibo !== ""){ 
         var suc = getSuc();
         var usuario = getNick();
         var papar_size = 9; // Dedocratico A4
          
         var title ="Impresion de Facturas Contables";
         var params ="width=800,height=840,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
         
         
           $( "#recibos_div" ).dialog({
                resizable: false,
                height:160,
                modal: true,
                buttons: {
                  "Cerrar": function() {            
                    $( this ).dialog( "destroy" );
                    return;
                  },  
                  "Cancelar": function() {
                       $( this ).dialog( "close" );
                       return;
                   },   
                  "Imprimir Recibo": function() {
                      $( this ).dialog( "close" ); 
                      nro_recibo = $("#recibos_contables").val();                         
                      var url = "caja/ImpresorReciboCaja.class.php?nro_recibo="+nro_recibo+"&pdv_cod="+pdv+"&factura="+factura+"&usuario="+usuario+"&suc="+suc;
                      if(typeof(showModalDialog) === "function"){   window.showModalDialog(url,title,params);  }else{   window.open(url,title,params);    }
                  } 
                }
            }); 
                  
          
     }else{
         alert("Debe Pre cargar las Facturas Contables para poder Imprimir");
     }
  }  
  
  function getRecibosContables(){
   var suc = getSuc();   
   var tipo_fact = "Pre-Impresa";
   var moneda = $("#moneda").val();
   $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getFacturasContables", "suc": suc,tipo_fact:tipo_fact,tipo_doc:"Recibo",moneda:moneda},
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#recibos_contables").empty();
            },
            success: function(data) {  
                 
                var cont = 0;
                for(var i in data){ 
                     var fact_cont = data[i].fact_nro; 
                     var pdv_cod = data[i].pdv_cod; 
                     $("#recibos_contables").append("<option value='"+fact_cont+"' data-pdv="+pdv_cod+">"+fact_cont+"</option>");  cont++;
                } 
                 
                if(cont == 0){ 
                    alert("Debe cargar Recibos Contables Pre Impresos en el sistema para poder Continuar");   
                }
            }
        });
  }