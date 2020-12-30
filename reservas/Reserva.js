

var decimales = 0;
var abm_cliente = null;
var fecha_nac = "0000-00-00";
var data_next_time_flag = true;
var porcentaje_minimo_senha_cliente = 30; // Sacar este Porcentaje de la Ficha del Cliente 

var mnj_x_lotes = "";

function configurar(){ 
    $("#ruc_cliente").focus();
    $("#ruc_cliente").click(function(){ $(this).select(); });
    $("#ruc_cliente").mask("999?ddddddd",{placeholder:""});
    $("#nombre_cliente").click(function(){ $(this).select(); }); 
    // Para cargar Ventas Abiertas
    $(".reserva_abierta").click(function(){ 
        var factura = $(this).attr("id").substring(5,20);
        cargarReserva(factura);
    }); 
    // Inicializa cursores para ventas abiertas
    inicializarCursores("clicable");  
    statusInfo();
    
}
function setDefaultDataNextFlag(){
    data_next_time_flag = true;
}
function preconfigurar(){
    $("*[data-next]").keyup(function (e) {
        if (e.keyCode == 13) { 
            if(data_next_time_flag){
               data_next_time_flag = false;   
               var next =  $(this).attr("data-next");
               $("#"+next).focus();               
               setTimeout("setDefaultDataNextFlag()",600);  
            }            
        } 
        chequearDatos();
    });  
    $(".numeros").change(function(){
        var decimals = 2;
        if($(this).attr("id")=="precio_venta" ){
            decimals = 0;
        }
        var n = parseFloat($(this).val() ).format(2, 3, '.', ',') ;
        $(this).val( n  );
        if($(this).val() =="" || $(this).val() =="NaN" ){
           $(this).val( 0);
        }
        chequearDatos();
     });
     chequearDatos();
     if($(".codigo_lote").length > 0){
        $("#finalizar").removeAttr("disabled");
    }
}

/**
 * 
 * @param {type} obj
 * @returns json 
 */
function buscarCliente(obj){
    
    var q = $(obj).val()+"%";
    var campo = "CardName";  
      
    if($(obj).attr("id") == "ruc_cliente"){
        campo = "LicTradNum";
    }
    $("#msg").html("<img src='img/activity.gif' width='46px' height='8px' >"); 
    
    
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action":"buscarClientes","campo":campo,"criterio":q,"limite":30}, 
        async:true,
        dataType: "json",
        beforeSend: function(){
            $("#msg").html("<img src='img/activity.gif' width='46px' height='8px' >"); 
        },
        success: function(data){ 

               
               if(data.length > 0){
                   if(data.length > 1){
                        limpiarLista(); // Borro los anteriores
                        $( "#boton_generar" ).fadeOut("fast");
                        var cont = 0;
                        for(var i in data){
                           cont++;
                           var codigo = data[i].Codigo;
                           var cliente = data[i].Cliente;
                           var ruc = data[i].RUC;
                           var cat = data[i].Cat;                            
                           $("#lista_clientes") .append("<tr class='tr_cli_data'><td class='item'><span class='codigo'>"+codigo+"</span></td>   <td class='item'><span class='ruc'>"+ruc+"</span> </td><td  class='item'><span class='cliente'>"+cliente+"</span></td>  <td class='itemc'><span class='cat'>"+cat+"</span></td></tr>");                                                      
                        } 
                        $("#lista_clientes").append("<tr class='cli_data_foot'><td   style='text-align:center' colspan='4'> <input type='button' value='Nuevo' onclick='nuevoCliente()' > <input type='button' value='Cerrar' onclick='cerrar()' > </td></tr>"); 
                        $("#msg").html(""+cont+" resultados"); 
                        $("#msg").toggleClass("info"); 
                        $( "#ui_clientes" ).fadeIn("fast");
                        
                        $(".tr_cli_data").click(function(){                            
                                var cliente = $(this).find(".cliente").html(); 
                                var ruc = $(this).find(".ruc").html();  
                                var codigo = $(this).find(".codigo").html();
                                var cat = $(this).find(".cat").html(); 

                                $("#ruc_cliente").val(ruc);
                                $("#nombre_cliente").val(cliente);
                                $("#codigo_cliente").val(codigo);
                                $("#categoria").val(cat);
                                $( "#ui_clientes" ).fadeOut("fast");
                                $("#msg").html(""); 
                                $("#boton_generar").fadeIn(); // Habilitar boton generar factura
                        
                      }); 
                      inicializarCursores("item");  // Indico para que muestre la flechita al pasar por encima
                   }else{ // Un unico resultado
                       //$( clientes ).dialog( "close" );
                       $( "#ui_clientes" ).fadeOut("fast");
                       var codigo = data[0].Codigo;
                       var cliente = data[0].Cliente;
                       var ruc = data[0].RUC;
                       var cat = data[0].Cat;
                       $("#ruc_cliente").val(ruc);
                       $("#codigo_cliente").val(codigo);
                       $("#nombre_cliente").val(cliente);
                       $("#categoria").val(cat);
                       $("#msg").html(""); 
                       $("#turno").focus();
                       $("#boton_generar").fadeIn();
                       
                       //$("#nombre_cliente").attr("readonly","true");
                   }                    
               }else{
                  limpiarLista(); 
                  $("#msg").toggleClass("error"); 
                  $("#codigo_cliente").val("");
                  $("#msg").html("Sin resultados"); 
                  $("#lista_clientes").append("<tr class='cli_data_foot'><td style='text-align:center' colspan='4'> <input type='button' value='Nuevo' onclick='nuevoCliente()' > <input type='button' value='Cerrar' onclick='cerrar()' > </td></tr>"); 
                  $( "#ui_clientes" ).fadeIn("fast");
                  // Desabilitar boton generar factura
                  $("#boton_generar").fadeOut();
               }
               
           
        },
        error: function(e){ 
           $("#msg").addClass("error");
           $("#msg").html("Error en la comunicacion con el servidor:  "+ e);
        }
    });   
        
    
}
function ocultar(){
     $( "#boton_generar" ).fadeOut("fast"); 
}
function cerrar(){
   $( "#ui_clientes" ).fadeOut("fast");
   $( "#boton_generar" ).fadeOut("fast");   
}
function nuevoCliente() {   
    /* hideKeyboard(); */ 
    var window_width = $(document).width()  / 2;
    var abm_width = $("#abm_cliente").width()  / 2;        
    var posx = (window_width - abm_width) ;   
    $("#abm_cliente").css({left:posx,top:36});   
    $( "#abm_cliente" ).fadeIn();  
    $("#ruc").val( $("#ruc_cliente").val() );
    $("#nombre").val( $("#nombre_cliente").val() );
}
function registrarCliente(){
    
   var usuario = getNick(); 
   var ruc = $.trim($("#ruc").val());
   var nombre = $.trim( $("#nombre").val());
   var tel = $.trim($("#tel").val());
   var fecha_nac = $("#fecha_nac").val();
   var pais = $("#pais").val();
   var ciudad = $.trim($("#ciudad").val());
   var dir = $.trim($("#dir").val());
   var ocupacion = $.trim($("#ocupacion").val());
   var situacion = $.trim($("#situacion").val());
   
   if(validRUC(ruc) && validString(nombre,3) && validPhone(tel,6)){
        $(".ui-dialog-buttonset").children().first().attr("disabled",true);
        $("#msg_cliente").removeClass("error"); 
        $("#msg_cliente").html("");
            $.ajax({
                type: "POST",
                url: "Ajax.class.php",
                data: {"action":"nuevoCliente","usuario":usuario,"ruc":ruc,"nombre":nombre,"tel":tel,"fecha_nac":fecha_nac,"pais":pais,"ciudad":ciudad,"dir":dir,"ocupacion":ocupacion,"situacion":situacion}, 
                async:true,
                dataType: "html",
                beforeSend: function(){
                    $("#msg").html("<img src='img/loading.gif' width='22px' height='22px' >"); 
                    $("#msg_cliente").html("<img src='img/loading.gif' width='30px' height='30px' >"); 
                }, 
                complete: function(objeto, exito){
                    if(exito=="success"){                          
                        if($.trim(objeto.responseText) == "0true"){
                            $("#msg").html("Cliente "+nombre+" registrado con exito.");                            
                            abm_cliente.dialog( "close" );
                        } else{
                            $("#msg_cliente").html("Ocurrio un Error al intentar registrar el cliente"); 
                            $("#msg").html("Error al intentar registrar el cliente"); 
                        }
                                                   
                    }
                }
        });  
    }else{
        $("#msg_cliente").html("Los campos RUC, Nombre y Telefono son requeridos o contenen errores");
        $("#msg_cliente").addClass("error"); 
    }  
   //console.log(usuario+"  "+ruc+"  "+nombre+"  "+tel+"  "+fecha_nac+"  "+pais+"  "+ciudad+"  "+dir);
}


function mostrar(){       
    $("#boton_nuevo_cliente").fadeOut();
    $("#boton_generar").fadeIn();
}

/**
 * Limpia la lista de Clientes
 * @returns {nada}
 */
function limpiarLista(){    
    $(".tr_cli_data").each(function () {   
       $(this).remove();
    }); 
    $(".cli_data_foot").remove();
}
    
function mostrarAreaDeCarga(reserva){   
    $("#msg").html("");
    $("#reserva").val(reserva); 
    $(".reserva_inv").toggleClass("reserva");  
    $("#area_carga").fadeIn("fast");     
    $("#lote").focus();     
    preconfigurar();    
}

function crearReserva(){   
    var usuario = getNick();
    var suc = getSuc(usuario);
    var cod_cli = $("#codigo_cliente").val();
    var categoria = $("#categoria").val();
    var ruc = $("#ruc_cliente").val();
    var cliente = $("#nombre_cliente").val();
    
    if(cod_cli !=""){
       $("#boton_generar").remove();
       $("#ruc_cliente").attr("readonly","true");
       $("#nombre_cliente").attr("readonly","true");
        $.ajax({
                type: "POST",
                url: "Ajax.class.php",
                data: {"action":"crearReserva","usuario":usuario,"cliente":cliente,"cod_cli":cod_cli,"ruc":ruc,"categoria":categoria,"suc":suc}, 
                async:true,
                dataType: "html",
                beforeSend: function(){
                    $("#msg").html("<img src='img/loading.gif' width='22px' height='22px' style='margin-bottom:-5px' >");                      
                }, 
                complete: function(objeto, exito){
                    if(exito=="success"){                          
                      var reserva =  $.trim(objeto.responseText) 
                      mostrarAreaDeCarga(reserva);
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

function chequearDatos(){
    var lote = $("#lote").val();
    var codigo = $("#codigo").val();
    var stock = float("stock");
    var precio = float("precio_cat");
    var precio_venta = float("precio_venta");
    var cantidad = float("cantidad");
    var subtotal = (precio_venta * cantidad).format(0, 3, '.', ',') ;
    $("#subtotal").val(subtotal);
     
    if(lote.length > 2 && codigo.length > 2  && stock > 0 && (precio_venta >= precio) && precio > 0 && cantidad  >  0 && (cantidad <= stock)  ){ //&& $(".loteInfo").length == 0
       $("#add_code").removeAttr("disabled");        
    }else{
       $("#add_code").attr("disabled",true);  
       return;
    }    
    if($(".codigo_lote").length > 0){
        $("#finalizar").removeAttr("disabled");
    }else{
        $("#finalizar").attr("disabled",true);
    }
}
 
function limpiarAreaCarga(){
   $(".dato").val(""); 
   $("#add_code").attr("disabled",true);  
}
function addCode(){
    $("#add_code").attr("disabled",true);
    var reserva = $("#reserva").val();
    var lote = $("#lote").val();
    var codigo = $("#codigo").val();
    var stock = float("stock");
    var um = $("#um").val();
    var descrip = $("#descrip").val();
    var precio = float("precio_cat");
    var precio_venta = float("precio_venta");
    var cantidad = float("cantidad");
    var subtotal = float("subtotal");
    var categoria = $("#categoria").val(); // Not in Use for Reservas
    if(mnj_x_lotes === "No"){
        lote = "";
    }
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "agregarDetalleReserva","reserva":reserva, "codigo": codigo,"lote":lote,"um":um,"descrip":descrip,"precio_venta":precio_venta,"cantidad":cantidad,"subtotal":subtotal,"cat":categoria},
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg_codigo").html("<img src='img/loadingt.gif'>"); 
        },
        success: function(data) {   
            var mensaje = data.Mensaje;
            if(mensaje=="Ok"){
               $("#msg_codigo").html("<img src='img/ok.png'>");                
               $("#lote").val("");
               $("#lote").focus();
               limpiarAreaCarga();
               var total = parseFloat(data.Total).format(0, 3, '.', ',') ; 
               var senha = parseFloat((data.Total * porcentaje_minimo_senha_cliente) / 100 ).format(0, 3, '.', ',') ;   
               var cantf = cantidad.format(2, 3, '.', ',') ;  
               var preciof = precio.format(0, 3, '.', ',') ;  
               var subtotalf = subtotal.format(0, 3, '.', ',') ; 

               appendDetail(codigo,lote,descrip,cantf,um,preciof,subtotalf,total,senha);
                
            }else{
               $("#msg_codigo").attr("class","error"); 
               $("#msg_codigo").html(mensaje); 
               $("#lote").focus();$("#lote").select();
               $("#add_code").attr("disabled",true);  
            }            
        }
    }); 
}
function appendDetail(codigo,lote,descrip,cant,um,precio,subtotal,total,senha){
    $(".tr_total_reserva").remove(); 
    $("#detalle_reserva").append('<tr id="tr_'+lote+'"><td class="item">'+codigo+'</td> <td class="item codigo_lote">'+lote+'</td><td class="item">'+descrip+'</td><td class="num cantidad">'+cant+'</td><td  class="itemc">'+um+'</td><td class="num">'+precio+'</td> <td class="num">'+subtotal+'</td><td class="itemc"><img class="del_det" title="Borrar Esta Pieza" style="cursor:pointer" src="img/trash_mini.png" onclick=delDet("'+codigo+'","'+lote+'")></td></tr>');
    $("#detalle_reserva").append('<tr class="tr_total_reserva" style="font-weight: bolder"><td >&nbsp;Totales</td><td colspan="5" id="msg_det" style="text-align: center;font-size: 11" class="info"></td> <td style="text-align: right;" id="total_reserva" class="num">'+total+'&nbsp;Gs.</td><td></td> </tr>');
    $("#detalle_reserva").append('<tr class="tr_total_reserva" style="font-weight: bolder"><td >&nbsp;Se&ntilde;a</td><td colspan="5" id="msg_det" style="text-align: center;font-size: 11" class="info"></td> <td style="text-align: right;" id="total_senha" class="num">'+senha+'&nbsp;Gs.</td><td></td> </tr>');
    $("#finalizar").removeAttr("disabled");
}
function corregirSubtotales(porc){ 
   $(".cantidad").each(function(){ 
        var cant =  parseFloat( $(this).text().replace(/\,/g, '.') ); 
        var precio=  parseFloat(  $(this).next().next().text().replace(/\./g, '') );    
        
        var descuento = (cant * precio * porc) / 100;  
        
        var subtotal = ((cant * precio) - descuento).format(0, 3, '.', ',');
        //console.log("Precio: ",precio,"  Desc: "+descuento+"  Sub: "+subtotal);
        
        var descf = parseFloat(descuento).format(0, 3, '.', ',') ;
        $(this).next().next().next().html(  descf   );
        $(this).next().next().next().next().html( subtotal   );
   });   
} 
function delDet(codigo,lote){ 
 var reserva = $("#reserva").val();  
 
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
             
            $.ajax({
                type: "POST",
                url: "Ajax.class.php",
                data: {"action": "borrarDetalleReserva", "reserva": reserva,"codigo":codigo,"lote":lote},
                async: true,
                dataType: "json",
                beforeSend: function() {
                    $("#msg").html("<img src='img/loadingt.gif' > <img src='img/delete.png' >"); 
                },
                success: function(data) {   
                    var total = parseFloat(data.Total).format(0, 3, '.', ',') ; 
                    var senha = parseFloat((data.Total * porcentaje_minimo_senha_cliente) / 100 ).format(0, 3, '.', ',') ;   
                    
                    if(isNaN(total)){
                        total = 0;
                    } 
                    $("#tr_"+lote).remove();
                    $("#total_reserva").html(""+total+"&nbsp;Gs."); 
                    $("#total_senha").html(""+senha+"&nbsp;Gs.");
                    $("#msg").html(""); 
                    if($(".codigo_lote").length > 0){
                        $("#finalizar").removeAttr("disabled");
                    }else{
                        $("#finalizar").attr("disabled",true);
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
function buscarCodigo(){    
   
    limpiarAreaCarga();
    var lote = $("#lote").val();
    var suc = getSuc();    
    var categoria = $("#categoria").val();
    var stockComprometido = false;
    var um = $("#um").val();
         
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action":"buscarDatosDeCodigo","lote":lote,"categoria":categoria,"suc":suc,usuario:getNick()}, // No enviar Unidad de Medida dejar que el sistema decida
        async:true,
        dataType: "json",
        beforeSend: function(){
            $("#msg_codigo").html("<img src='img/loadingt.gif' >");  
        },
        success: function(data){ 
            var existe = data.existe;
            $("#msg_codigo").attr("class","info");
            if( existe === "true" ){
                $("#codigo").val(data.codigo);      
                $("#descrip").val(data.descrip);
                var stock = parseFloat( data.stock  );
                $("#stock").val(  parseFloat( data.stock  ).format(2, 3, '.', ',')   );
                
                var precio = data.precio;
                var descuento = data.descuento;   
                 
                um_lista_precios = data.um_lista_precios;
                
                var preciox = redondear50(parseInt(precio - descuento));  
                if(moneda != "G$"){  // No se redondea si es USS
                     preciox =  parseFloat(precio - descuento);
                } 
                var precio = parseFloat(  preciox  ).format(decimales, 3, '.', ',');
                
                //var precio = parseFloat(Math.round(data.precio - (data.precio * data.descuento) / 100));//parseFloat(  data.Precio ).format(0, 3, '.', ',');
                $("#um").val(data.um_prod);  
                $("#precio_cat").val(precio);
                $("#precio_venta").val(precio);
                 
                 mnj_x_lotes = data.mnj_x_lotes;
                 
                // Verifica si el Stock esta comprometido
                $.post("Ajax.class.php",{"action":"buscarStockComprometido", "lote":lote,"suc":suc, "incluir_reservas":"Si"},function(data){
                    if(data.length){
                        stockComprometido = true;
                        var table = $("<table/>",{"class":"loteInfo"});
                        var tr = $("<tr/>");
                        $.each(data,function(key,value){
                            $("<th/>",{"text":key}).appendTo(tr);
                        });
                        table.append(tr);
                        var comprometido = 0;
                        data.forEach(function(data){
                            var tr = $("<tr/>");
                            $.each(data,function(key,value){
                                $("<td/>",{"text":value}).appendTo(tr);
                            });
                            table.append(tr);
                            comprometido += parseFloat(data.cantidad);
                        });                        
                        $("#msg_codigo").html("<img src='img/warning_red_16.png'>");
                        $("#msg_codigo").append(table);
                        stock = stock - comprometido;
                        $("#stock").val(  parseFloat(  stock  ).format(2, 3, '.', ',')   );
                    }                
                },'json');
                if(!stockComprometido){
                    $("#precio_venta").focus();
                    $("#precio_venta").select();                 
                    data_next_time_flag = false;
                    $("#msg_codigo").html("<img src='img/ok.png'>"); 
                    setTimeout("setDefaultDataNextFlag()",500);
                }
            }else{
                $("#msg_codigo").addClass("error");
                $("#msg_codigo").html("Error");                
                //limpiarAreaCarga();
                $("#lote").focus(); 
            }
        },
        error: function(e){ 
           $("#msg_codigo").addClass("error");
           $("#msg_codigo").html("Error en la comunicacion con el servidor:  "+e);
        }
    });  
    
}

 

function finalizar(){
   $("#finalizar").attr("disabled",true);
   var reserva = $("#reserva").val();
   var cliente = $("#nombre_cliente").val();
   var ruc = $("#ruc_cliente").val(); 
   var suc = getSuc(); 
   
   //window.open("ventas/Ticket.class.php?factura="+factura+"&cliente="+cliente+"&ruc="+ruc+"&suc="+suc+"","Ticket de Venta","width=400,height=560,scrollbars=yes"); 
    
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "finalizarReserva", "reserva": reserva},
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg_codigo").html("<img src='img/loadingt.gif'>");                      
        },
        success: function(data) {   
            if(data.estado == "Ok"){                     
                var t = $('<iframe id="ticket" name="ticket" style="width:0px; height:0px; border: 0px" src="ventas/TicketReserva.class.php?reserva='+reserva+'&cliente='+cliente+'&ruc='+ruc+'&suc='+suc+'">');
                t.appendTo("#work_area");
                
                // 
            }else{
                alert("Error:  "+data.error);
            }   
        },
        error: function() {
            $("#msg_codigo").html("Ocurrio un error en la comunicacion con el Servidor intente de nuevo...");
            $("#finalizar").removeAttr("disabled");
        }        
    });  
    alert("La Reserva ha sido enviada a caja...\nImpresion de Ticket en Progreso...");
    setTimeout("showMenu()",500);
}
function seleccionarCliente(obj){
    var cliente = $(obj).find(".cliente").html(); 
    var ruc = $(obj).find(".ruc").html();  
    var codigo = $(obj).find(".codigo").html();
    var cat = $(obj).find(".cat").html(); 
    var moneda = $(obj).find(".codigo").attr("data-moneda");
    //moneda_cliente = $(obj).find(".codigo").attr("data-moneda");
 
    $("#ruc_cliente").val(ruc);
    $("#nombre_cliente").val(cliente);
    $("#codigo_cliente").val(codigo);
    $("#categoria").val(cat);
    
    if(moneda !== "G$" ){ 
        decimales = 2;
    } 

   
    //$("#cotiz").val(x);
    $( "#ui_clientes" ).fadeOut("fast");
    $("#msg").html(""); 
    $("#boton_generar").fadeIn(); // Habilitar boton generar factura 
}

function float(id){
    var n =  parseFloat($("#"+id).val().replace(/\./g, '').replace(/\,/g, '.'));
    if(isNaN(n)){
        return 0;
    }else{
        return n;
    }
 }


 /**
 * Dado un valor devuelve otro en funcion del % 50 Ej.:  14521 --> 14500,  14532 --> 14550    
 * Resolucion 347 SEDECO
 * @param {type} valor
 * @returns {redondeo50.valor_redondeado}  
 */
function redondear50(valor){ 
     
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
