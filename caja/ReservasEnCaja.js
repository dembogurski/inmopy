
   
   var rs = 0; // Cotizacion en Reales Pesos y Dolares
   var ps = 0;
   var us = 0;
   var reserva = 0;
   var vuelto_gs = 0;
   var cotiz_vuelto = 1; // Cotizacion del Vuelto
   
   function configurar(){
        $(".clicable").click(function(){ 
             var reserva = $(this).parent().attr("id").substring(8,20);
             cobrarReserva(reserva);
         });
         inicializarCursores("clicable"); 

         $(window).scroll(function(){
             $('#popup_caja').animate({top:$(window).scrollTop()+"px" },{queue: false, duration: 350});
         });
         $(".entrega").change(function(){
             var n = parseFloat($(this).val() ).format(2, 3, '.', ',') ;
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
         $(".entrega_conv").change(function(){
             var voucher = $.trim($("#voucher").val());
             var monto_conv = float("monto_conv");
             if(voucher !="" && monto_conv > 0){
                 $("#add_conv").removeAttr("disabled");
             }else{
                 $("#add_conv").attr("disabled",true);
             }        
         });
   
         
         $("#voucher").mask("****?99999999",{placeholder:""});
         //$("#nro_cheque").mask("*d9999?99999999").css("text-transform","uppercase");;
         //$("#nro_cuenta").mask("****?99999999",{placeholder:""});
         //$("#benef").mask("***?*******************************************",{placeholder:""});
         //$("#fecha_emision").mask("99/99/2099");
         //$("#fecha_pago").mask("99/99/2099");
         $("select > option:nth-child(even)").css("background","#F0F0F5"); // Color Zebra para los Selects
         //$("#benef").css("text-transform","uppercase"); // Beneficiario en el Cheque todo en Mayusculas
         //$("#ui_add_cheque input").change(function(){ checkCheque() });
         statusInfo();
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
    var monto = float(id);  
    var monto_ref = float(id) * cotiz; 
    var suc = getSuc();
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "agregarEfectivo", "nro_referencia": reserva, "moneda": moneda,"monto":monto,"cotiz":cotiz,"monto_ref":monto_ref,"id_concepto":3,"campo":"nro_reserva",suc:suc}, 
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
  /**
   * Metodo que levanta la UI para cobrar una Factura Formas de cobro posibles Monedas Locales Tarjetas Credito y 
   * Debito,Cheques y Credito (Cuotas)
   * @param {type} factura
   * @returns {cobrarFactura}
   */
  function cobrarReserva(reserva){   
      this.reserva = reserva;
      var fecha = $("#fecha_"+reserva).html(); 
      var cod_cli = $("#cod_cli_"+reserva).html();
      var ruc = $("#ruc_"+reserva).html(); 
      var cliente = $("#cliente_"+reserva).html(); 
      var cat = $("#cat_"+reserva).html(); 
      var total_gs =  $("#total_"+reserva).html(); 
      var minimo_gs =  $("#minimo_senia_ref_"+reserva).html(); 
      
      
      $("#reserva").val(reserva);
      $("#fecha").val(fecha);
      $("#ruc_cliente").val(ruc);
      $("#codigo_cliente").val(cod_cli);
      $("#nombre_cliente").val(cliente);
      $("#categoria").val(cat);
      $("#total_gs").val(total_gs); 
      $("#minimo_gs").val(minimo_gs); 
      
   
      var total_pagar_gs = minimo_gs.replace(/\./g, '').replace(/\,/g, '.');
      
      //var position = $("#ventas").offset().top;
      
      $("#popup_caja").slideDown("fast").css('top', "10px"); 
      
      $( "#tabs" ).tabs();
      $("#entrega_gs").focus();
      
      $("#total_rs").val("");
      $("#total_ps").val("");
      $("#total_us").val("");
      $(".loading_cotiz").fadeIn(); 
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getCotiz", "suc": getSuc() },
            async: true,
            dataType: "json",
            beforeSend: function() {},
            success: function(data) {   
                rs = data.Reales.compra;
                ps = data.Pesos.compra;
                us = data.Dolares.compra;
                $("#total_rs").attr("title"," Cotiz: "+rs+" ");
                $("#total_ps").attr("title"," Cotiz: "+ps+" ");
                $("#total_us").attr("title"," Cotiz: "+us+" ");
                $("#total_rs").attr("data-info"," Cotiz: "+rs+" ");
                $("#total_ps").attr("data-info"," Cotiz: "+ps+" ");
                $("#total_us").attr("data-info"," Cotiz: "+us+" ");
                
                $("#total_rs").val(redondear(total_pagar_gs/rs));
                $("#total_ps").val(redondear(total_pagar_gs/ps));
                $("#total_us").val(redondear(total_pagar_gs/us));
                $(".loading_cotiz").fadeOut("fast"); 
                
                statusInfo(); 
            }
        });
        /**
         * Anulado siempre verificar si tiene datos cargados
        var tieneEfectivo = $("#fact_"+factura+"").attr("data-efectivo_"+factura+""); 
        var tieneTarjeta = $("#fact_"+factura+"").attr("data-tarjeta_"+factura+""); 
        var tieneCheques = $("#fact_"+factura+"").attr("data-cheques_"+factura+""); 
        var tieneCuotas = $("#fact_"+factura+"").attr("data-credito_"+factura+""); 
        
        if(tieneEfectivo > 0){ getEfectivoFactura(factura); }
        if(tieneTarjeta > 0){getConveniosDeFactura(factura); }
        if(tieneCheques > 0){getChequesDeFactura(factura);}
        if(tieneCuotas > 0){getCuotasDeFactura();}*/
       getEfectivoReserva(reserva); 
       getConveniosDeReserva(reserva);
        
        
        //getFacturasContables(); 
        acomodarPopup();
           
      $(window).resize(function(){acomodarPopup()});  
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
 
  function getConveniosDeReserva(reserva){
   $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getConvenios", "nro_referencia": reserva,"campo":"nro_reserva","id_concepto":3}, 
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg_convenio").html("Recuperando datos... <img src='img/loadingt.gif'>"); 
            },
            success: function(data) { 
                $(".conv_foot").remove();
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
  function getEfectivoReserva(reserva){
    $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getEfectivoReserva", "reserva": reserva},
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
                }   
                setRef();
                $("#msg_efectivo").html(""); 
            }
    });       
  }
  
  function cancelar(){      
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
     $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "agregarConvenio", "nro_referencia": reserva, "conv_cod": conv_cod,"conv_nombre":conv_nombre,"voucher":voucher,"monto_conv":monto_conv,"campo":"nro_reserva","id_concepto":3,suc:suc},
        
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
                      data: {"action": "borrarConvenio", "nro_referencia": reserva, "conv_cod": conv_cod,"voucher":voucher,"campo":"nro_reserva","id_concepto":3},
                      async: true,
                      dataType: "html",
                      beforeSend: function() {
                          $("#msg_convenios").html("Borrando... <img src='img/loadingt.gif' width='22px' height='22px' >");                      
                      },
                      complete: function(objeto, exito) {
                          if (exito == "success") {                          
                              var result = parseFloat( objeto.responseText ).format(2, 3, '.', ',');  
                              
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
 /**
  * Funciones desabilitadas 
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
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {action: "agregarCheque", nro_cheque: nro_cheque, suc: suc,cuenta:cuenta,banco:banco,valor:valor,moneda:moneda,cotiz:cotiz,valor_ref:valor_gs,benef:benef,emision:emis,pago:pago,factura:factura},
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
                $("#lista_cheques").append("<tr class='tr_"+nro_cheque+"'><td>"+nro_cheque+"</td><td>"+nombre_banco+"</td><td>"+cuenta+"</td><td>"+benef+"</td><td  class='num' >"+valor_f+"</td><td class='itemc'>"+moneda+"</td><td class='num'>"+cotiz+"</td><td class='num'>"+valor_gs_f+"</td><td class='itemc'>"+emis+"</td><td class='itemc'>"+pago+"</td><td class='itemc'><img class='del_chq' title='Borrar Cheque' style='cursor:pointer' src='img/trash_mini.png' onclick=delCheque('"+nro_cheque+"','"+factura+"');></td></tr>");
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
                     $("#lista_cheques") .append("<tr class='tr_"+nro_cheque+"'><td>"+nro_cheque+"</td><td>"+banco+"</td><td>"+cuenta+"</td><td>"+benef+"</td><td  class='num' >"+valor_formated+"</td><td class='itemc'>"+moneda+"</td><td class='num'>"+cotiz+"</td><td class='num'>"+valor_gs_formated+"</td><td  class='itemc'>"+fecha_emis+"</td><td  class='itemc'>"+fecha_pago+"</td><td  class='itemc'><img class='del_chq' title='Borrar Cheque' style='cursor:pointer' src='img/trash_mini.png' onclick=delCheque('"+nro_cheque+"','"+factura+"');></td></tr>");                                       
                } 
                total = parseFloat(total).format(2, 3, '.', ',');  
                $("#lista_cheques") .append("<tr class='cheques_foot'><td colspan='7' > </td><td style='text-align: center;font-weight: bolder;font-size: 13px' class='total_cheques'>"+total+"</td><td></td> </tr>");
                $("#msg_cheques").html("");    
                setRef();                  
            }
        });       
  } 
  */
   
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
      
      //var total_cheques =  parseFloat($(".total_cheques").text().replace(/\./g, '').replace(/\,/g, '.'));      
      var total_cheques = 0;
      
      var valor_total_pagar_gs  = float("total_gs");
      
      var total_pagar_gs  = float("minimo_gs"); 
      
      
      
      var vuelvo_faltante = total_pagar_gs - (total_entrega_efectivo + total_convenios + total_cheques );
        
      vuelto_gs = vuelvo_faltante; 
      
      
      var total_entregado = total_entrega_efectivo + total_convenios + total_cheques ;
      
      console.log("total_entregado "+total_entregado+"   total_pagar_gs "+total_pagar_gs);
      
      if(total_entregado >= total_pagar_gs){   
          if(total_entregado > valor_total_pagar_gs){
             $("#label_vuelto_faltante").text("Vuelto:"); $("#vuelto_faltante").css("color","green");  $("#label_vuelto_faltante").css("color","green");  
             vuelvo_faltante = valor_total_pagar_gs - (total_entrega_efectivo + total_convenios + total_cheques );
             vuelto_gs = vuelvo_faltante; 
             vuelvo_faltante*= -1; vuelto_gs*= -1;
             $(".cerrar_reserva").removeAttr("disabled"); 
          }else{
             $("#label_vuelto_faltante").text("Vuelto:"); $("#vuelto_faltante").css("color","green");  $("#label_vuelto_faltante").css("color","green");  
             vuelvo_faltante = 0; vuelto_gs= 0;
             $(".cerrar_reserva").removeAttr("disabled");   
          }
      }else{
          $("#label_vuelto_faltante").text("Faltante:"); $("#vuelto_faltante").css("color","red"); $("#label_vuelto_faltante").css("color","red");  
          $(".cerrar_reserva").attr("disabled",true);
      }  
  
      
      $("#monedas_vuelto").val("G$"); // Mostrar Siempre el Vuelto en Gs si lo desea camia a otra moneda
      $("#total_entrega").val(total_entregado.format(2, 3, '.', ','));
      $("#vuelto_faltante").val(vuelvo_faltante.format(2, 3, '.', ','));      
      
  }
  function calcVuelto(){
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
  }
  
   
  
  function cerrarReserva(){
    $("#cerrar_reserva").attr("disabled",true);
    var usuario = getNick(); 
    var moneda_vuelto = $("#monedas_vuelto").val();
    var vuelto = float("vuelto_faltante");
    var total_entrega = float("total_entrega");
    var valor_total_pagar_gs  = float("total_gs");
    var suc = getSuc();        
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "cerrarReserva", "usuario": usuario, "reserva": reserva,"moneda_vuelto":moneda_vuelto,"vuelto":vuelto,"cotiz":cotiz_vuelto,"vuelto_gs":vuelto_gs,valor_total_pagar_gs:valor_total_pagar_gs,total_entrega:total_entrega,suc:suc},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $(".info").html("Cerrando Venta Favor Espere... <img src='img/loading.gif' width='22px' height='22px' >");                      
        },
        complete: function(objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText); 
                if(result == "Ok"){
                   $("#reserva_"+reserva).remove();
                   $("#popup_caja").slideUp("slow"); 
                   $(".entrega").val(""); 
                }
            }
        },
        error: function() {
            $("#.info").html("Ocurrio un error en la comunicacion con el Servidor, favor intente mas tarde...");
            $("#cerrar_reserva").removeAttr("disabled");
        }
    }); 
  }
  
  function liberarReserva(){
      var nro_reserva =$("#nro_reserva_liberar").val();
      $("#liberar").attr("disabled",true);
      if(isNaN(nro_reserva) || nro_reserva == ""){
          alert("Debe Ingresar un Numero de Reserva Valido para liberar!");
      }else{
          $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "liberarReserva", "nro_reserva": nro_reserva,usuario:getNick()},
            async: true,
            dataType: "html",
            beforeSend: function() {
                $("#msg").html("<img src='img/loading.gif' width='22px' height='22px' >");                      
            },
            complete: function(objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText);    
                    if(result == "Ok"){
                       $("#msg").html("Ok! Reserva liberada para la venta.");
                    }else{
                        $("#msg").html(result);
                    }
                }
            },
            error: function() {
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        }); 
      }
  }