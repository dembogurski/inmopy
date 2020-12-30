// Generar Factura a nombre del vendedor
function generarFactura(cliente, ruc, cod_cli, tipoDoc){
   var sendData = {"action":"crearFactura","usuario":getNick(),"cliente":cliente,"cod_cli":cod_cli,"ruc":ruc,"categoria":"5","suc":getSuc(),"moneda":"G$","cotiz":"1","tipo_doc":tipoDoc,"turno":"111"};
   
   //console.log(sendData);
   $.post("Ajax.class.php",sendData,function(data){        
       $($("#fact_"+$("input#factura").val()).find(".vendedor")).data("ticket",data);
       $(".fact_vend").show();
   },"text").fail(function(){
       $($("#fact_"+$("input#factura").val()).find(".vendedor")).data("ticket",-1);
   });
   
}
// Detalle
function fact2vendedor(target){
   $("#image_container").hide("slow");
   $("table#fact2vendedorForm").remove();
   var main = $(target.closest("tr"));
   var lote = main.attr("id").split('_')[1];
   var cantidad = $(main.find(".cantidad")).text();
   var precio = $(main.find(".lote")).data('precio');
   var codigo = $(main.find("span.descrip")).data('codigo');
   var descrip = $(main.find("span.descrip")).text();
   var estado_factura ='Cerrada';// $($("#fact_"+$("input#factura").val()).find("td.estado_factura")).text();
   var ticket = $($("#fact_"+$("input#factura").val()).find(".vendedor")).data("ticket");
   
   $(main.find("div.fact2vendFormContainer")).load("empaque/facturarVendedor.html", function(){
       $("#loteSalida").val(lote);
       $("#loteSalida").data("precio",precio);
       $("#loteSalida").data("codigo",codigo);
       $("#loteSalida").data("cantidad_ORG",cantidad);
       $("#loteSalida").data("descrip",descrip);
       $("#cantSalida").val(cantidad);
       $("#f2v_ticket").text(ticket);
       $("div.Cerrada, div.En_caja").hide(0,function(){$("div."+estado_factura).show();});
       if(!$("div.En_caja").is(":visible")){$("tr.f2v_entrada, td.advertencias").hide();}
   });
}

function fact2vendedorForm(){
   
   var table = $("<table/>",{"id":"fact2vendedorForm"});
   var tr = $("<tr/>");
   $("<td/>",{"text":"Lote salida"}).appendTo(tr);
   $("<input/>",{"id":"cantSalida"}).appendTo(tr);
   tr.appendTo(table);
   tr = $("<tr/>");
   $("<td/>",{"colspan":2,"text":"Lote entrada"}).appendTo(tr);
   tr.appendTo(table);
   $("<td/>",{"text":"Lote entrada"}).appendTo(tr);
   $("<input/>",{"id":"cantEntrada"}).appendTo(tr);
   tr.appendTo(table);
}

// Eliminar o reemplazar lote en el ticket del cliente (Cancelado la implementacion solo nota de credito)
function f2v_accion(eliminar){
   if(!eliminar && $("div.En_caja").is(":visible")){
       $("tr.f2v_entrada, td.advertencias").show();
   }else{
       $("tr.f2v_entrada, td.advertencias").hide();
   }
}
function f2v_aplicarProgreso(msj,type){
  var p = $("<p/>",{"class":type,"text":msj});
  $("td.advertencias").append(p);
  f2v_verifDev();
}
// Inicio de proceso de devolucion y facturacion
function f2v_aplicar(){
  $("td.advertencias").empty();
  $("td.advertencias").show();
  var target = $($("#fact_"+$("input.factura").val()).find(".vendedor"));
  var notacredito = parseInt(target.data("notacredito"));
  var datosEnv = {
    "action":"generarNotaCredito",
    "usuario":getNick(),
    "f_nro":$("input#factura").val(),
    "ticketSalida":$("input#factura").val(),
    "ticketEntrada":$("span#f2v_ticket").text(),
    "loteSalida":$("input#loteSalida").val(),
    "cantSalida":$("input#cantSalida").val()
  };
  // Si no se a generado una nota de credito lo crea
  if(notacredito == 0){
    $.post("empaque/FacturarVendedor.php",datosEnv,function(data){
      if(!data.error){
        f2v_aplicarProgreso("Se genero la nota de credito "+parseInt(data.n_nro),'ok');
        target.data("notacredito",parseInt(data.n_nro));        
        f2v_agreraDetalleNC(data.n_nro,datosEnv);
        
      }else{
        f2v_aplicarProgreso(data.error,'error');
      }
    },'json');
  }else{
    f2v_agreraDetalleNC(notacredito,datosEnv);
  }
}
// Agrega el lote en la nota de credito
function f2v_agreraDetalleNC(notacredito,datos){
  $.post("empaque/FacturarVendedor.php",{"action":"insertarLoteNotaCredito","lote":$("input#loteSalida").val(),"n_nro":notacredito,"f_nro":$("input#factura").val()},function(data){
    
    if(typeof(data.error)=='undefined'){
      f2v_aplicarProgreso("Se agrego "+$("input#loteSalida").val()+" a la N.C. "+notacredito,'ok');
      f2v_facturarVendedor(datos);
    }else{
      f2v_aplicarProgreso(data.error,'error');
    }
  },'json');
  
}
// Inserta el lote devuelo en un ticket al vendedor
function f2v_facturarVendedor(datos){
  $.post("empaque/FacturarVendedor.php",{"action":"facturar_vendedor","datos":JSON.stringify(datos)},function(data){
    if(typeof(data.error)=='undefined'){
      f2v_aplicarProgreso("Se inserto "+datos.loteSalida+" en el Ticket "+datos.ticketEntrada,'ok');
      // Establecer precios Ajax
      var establecerPrecioCat = {
        "action":"establecerPrecioCat",
        "factura":$("span#f2v_ticket").text(),
        "pref_pago":"Contado",
        "categoria":5,
        "tipo_doc":"C.I.",
        "cod_desc":0
      };
      $.post("Ajax.class.php",establecerPrecioCat,function(data){
        console.log(data);
      });
    }else{
      f2v_aplicarProgreso(data.error,'error');
    }
  },'json');
}

// Verifica el lote de reemplazo para el tiecket del cliente (Cancelado la implementacion solo nota de credito)
function f2v_verifLote(lote){
    $("#informacion").removeClass("error");
    $("td.advertencias, #informacion").empty();
    var suc = getSuc();
    var categoria = $("#categoria").val();
    var salidaCodigo = $("#loteSalida").data("codigo");
    var salidaPrecio = parseFloat($("#loteSalida").data("precio"));
    var salidaCantidad = $("#loteSalida").data("cantidad_ORG");
    var salidaDescrip = $("#loteSalida").data("descrip");
    $("select#fallaEntrada").empty();
    
    if (lote != "" && !isNaN(lote)) {
      $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: { "action": "buscarDatosDeCodigo", "lote": lote, "categoria": categoria, "suc": suc },
        async: true,
        dataType: "json",
        beforeSend: function() {                
          $("#informacion").html("<img src='img/loadingt.gif' >");
        },
        success: function(data) {
    
          if(data.length > 0 && data[0].existe){
            var stockReal = parseFloat(data[0].Stock);
            var codigo = data[0].Codigo;
            var descrip = data[0].Descrip;
            var UM = data[0].UM;
            var precio = parseFloat(data[0].Precio);
    
            $.each(data[0],function(key, value){
              if(/^F[1-9]{1}$/.exec(key)!==null){
                if(parseFloat(value) > 0){
                  $("select#fallaEntrada").append($("<option/>",{"text":key}));
                }
              }
            });

            if($("select#fallaEntrada option").length == 0){
                $(".fallaEntrada *").attr("Disabled",true);
            }else{
                $(".fallaEntrada *").attr("Disabled",false);
            }

            $("input#precioEntrada").val(precio);
            $("#loteEntrada").data("codigo",codigo);
            $("#loteEntrada").data("descrip",descrip);
            $("#loteEntrada").data("precio",precio);
            $("#loteEntrada").data("UM",UM);
    
            var verif = {};
    
            verif['Codigo'] = (salidaCodigo == codigo)?'':'Cod.Originel:'+salidaCodigo+', Cod.Nuevo:'+codigo;
            verif['Descrip'] = (salidaDescrip == descrip)?'':'Art.Originel:'+salidaDescrip+', Art.Nuevo:'+descrip;
            verif['Precio'] = (salidaPrecio == precio)?'':'Precio Originel:'+salidaPrecio+', Precio Nuevo:'+precio;
    
            var diferencias ='';
            $.each(verif,function(key, value){diferencias += value.length>0?(diferencias.length>0?'<br>'+value:value):'';});
            // Buscar Stock Comprometido
            $.post("Ajax.class.php", { "action": "buscarStockComprometido", "lote": lote, "suc": getSuc(), "incluir_reservas": "No" },function(data){
              if(data.length > 0){
                var comprometido = 0.00;
                data.forEach(function(doc, i){
                  comprometido += parseFloat(doc.cantidad);                            
                });
                var msj = ((stockReal - comprometido)>0)?("Stock utilizable: "+ (stockReal - comprometido).toFixed(2)+"<br>"+descrip):"Stock insuficiente"
                $("#informacion").html(msj);
                $("td.advertencias").html(((diferencias.length>0)?'<h3>Se encontraron Diferencias Verifique</h3>'+diferencias:''));
              }else{
                var msj = ((stockReal - comprometido)>0)?("Stock utilizable: "+ (stockReal).toFixed(2)+"<br>"+descrip):"Stock insuficiente";
                $("#informacion").html(msj);
                $("td.advertencias").html(((diferencias.length>0)?'<h3>Se encontraron Diferencias Verifique</h3>'+diferencias:''));
              }
    
            },'json').fail(function(){
              $("#informacion").addClass("error");
              $("#informacion").html("Error en la comunicacion con el servidor:  " + e);    
            });
          }else{
            $("#informacion").addClass("error");
            $("#informacion").html(data[0].Mensaje);
          }
        },
        error: function(e) {
          $("#informacion").addClass("error");
          $("#informacion").html("Error en la comunicacion con el servidor:  " + e);
        }
      });
    }else{
      if(isNaN(lote)){
        $("#informacion").addClass("error");
        $("#informacion").html("Numero de lote contiene caracteres invalidos");
      }
    }
}
// Verifica cuales ya fueron devueltos de este ticket
function f2v_verifDev(){
  $("button[id^='f2vadd_']").removeAttr("disabled");
  $.post("empaque/FacturarVendedor.php",{"action":"verifDev","f_nro":$("input#factura").val()},function(data){
    data.forEach(function(value,i){
      $("button#f2vadd_"+value).attr("disabled",true);    
    });
  },"json");
}