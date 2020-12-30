var arqueoPopUp;


function configurar(){
  $(".fecha").mask("99/99/9999");
  $(".fecha").datepicker({ dateFormat: 'dd/mm/yy' }); 
  $("#desde").focus(); 
  //getPDVs();
  $("#tipo").change(function(){
      var tipo = $(this).val();  
      if( tipo == "cheques"){
          $("#tipo_cheq").fadeIn();
      }else{
          $("#tipo_cheq").fadeOut();
      }

      if( tipo == "tarjetas"){
          $("#tipo_conv").fadeIn();
      }else{
          $("#tipo_conv").fadeOut();
      }
      $("#boton_generar").val($("#tipo option:selected").text());
  });
}

function generarReporte(){
    var desde = validDate($("#desde").val()).fecha;
    var hasta = validDate($("#hasta").val()).fecha;
    var suc = $("#suc").val();
    var moneda = $("#moneda").val();
    var tipo = $("#tipo").val();
    var paper_size = $('input[name=paper_size]:checked').val();
    var usuario = getNick();
    var params = "width=1024,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";    
    var url = "";
    var title = "";        
    var tipo_cheq = $("#tipo_cheq").val();
    
	switch(tipo){
		case "efectivo":
			url = "caja/reportes/Efectivo.class.php?desde="+desde+"&hasta="+hasta+"&suc="+suc+"&moneda="+moneda+"&paper_size="+paper_size+"&usuario="+usuario;
			title = "Flujo de Efectivo";
			break;
		case "tarjetas":
			url = "caja/reportes/Tarjetas.class.php?desde="+desde+"&hasta="+hasta+"&suc="+suc+"&moneda="+moneda+"&paper_size="+paper_size+"&usuario="+usuario+"&tipo="+$("select#tipo_conv").val();
			title = "Registro de Tarjetas Convenios";        
			break;
		case "cheques":
			url = "caja/reportes/Cheques.class.php?desde="+desde+"&hasta="+hasta+"&suc="+suc+"&moneda="+moneda+"&paper_size="+paper_size+"&usuario="+usuario+"&tipo_cheq="+tipo_cheq;
			title = "Registro de Cheques";        
			break;
		case "cuotas":
			url = "caja/reportes/Cuotas.class.php?desde="+desde+"&hasta="+hasta+"&suc="+suc+"&moneda="+moneda+"&paper_size="+paper_size+"&usuario="+usuario;
			title = "Registro de Cheques";   
			break;
		case "arqueo":
			url = "caja/reportes/Arqueo.class.php?desde="+desde+"&hasta="+hasta+"&suc="+suc+"&moneda="+moneda+"&paper_size="+paper_size+"&usuario="+usuario;
			title = "Arqueo de Caja";
			break;
                case "verificar_cobros":
			url = "caja/reportes/ArqueoCobrosDet.class.php?action=showCobros&args="+suc+","+desde+","+hasta+"";
			title = "Verificar Cobros";
			break;        
                case "verificar_ventas":
			url = "caja/reportes/ArqueoVentasDet.class.php?action=getVentasData&args="+suc+","+desde+","+hasta+"";
			title = "Verificar Ventas";
			break;           
	}        //caja/reportes/ArqueoVentasDet.class.php?action=getVentasData&args=25,2019-06-13,2019-06-13
        
    if(!arqueoPopUp){
        arqueoPopUp = window.open(url,title,params);
    }else{
        arqueoPopUp.close();
        arqueoPopUp = window.open(url,title,params);
    }
    
    
}
function abrirContadorBilletes(id){
    var usuario = getNick();
    var audit = $("#auditor").val();
    var params = "width=800,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    var url = "caja/control_billetes/ControlBilletes.class.php?id="+id+"&usuario="+usuario+"&audit="+audit;
    var title = "Control de Billetes";     
    window.open(url,title,params);    
}

function getPDVs(){
    var suc = $("#suc").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
         data: {"action": "getPDVs", suc:suc},
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("<img src='img/activity.gif' width='46px' height='8px' >"); 
        },
        success: function(data) { 
            var op = "";
            for(var i in data){ 
               var pdv_cod = data[i].pdv_cod;
               var pdv_ubic = data[i].pdv_ubic;
               op += "<option value='"+pdv_cod+"'>"+pdv_cod+"-"+pdv_ubic+"</option>";
            }
            $("#pdv").html(op);
        }
    });
}

function nuevoContadorBilletes(){
    var position = $("#btn_nuevo_cont").position();
    var bwidth = $("#btn_nuevo_cont").width();
    var width = $("#nuevo_cont").width();
    var diff = (width - bwidth ) / 2; 
    var top = position.top - 180; 
    $("#nuevo_cont").css("margin-left",position.left - diff); 
    $("#nuevo_cont").css("margin-top",-78);  
    $("#nuevo_cont").fadeIn("fast"); 
    $("#msg").html("");
}
function cancelarNuevoCont(){
    $("#nuevo_cont").fadeOut("fast"); 
}
function generar(){
    var fecha = validDate($("#fecha_cont").val()).fecha;
    var suc = $("#suc").val();
    var pdv = $("#pdv").val();
    var cajero = getNick();
    var tipo = $("#tipo_cont").val();
    
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "generarContadorBilletes", "cajero": cajero, "suc": suc,fecha:fecha,pdv:'001',tipo:tipo},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading.gif' width='22px' height='22px' >");                      
        },
        complete: function(objeto, exito) {
            if (exito == "success") {                                          
                $("#msg").html("");
                $("#nuevo_cont").fadeOut("fast"); 
                contadorBilletes();
            }
        },
        error: function() {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });    
}
function contadorBilletes(){
    var suc = $("#suc").val();
    var desde = validDate($("#desde").val()).fecha;
    var hasta = validDate($("#hasta").val()).fecha;
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "contadoresDeBilletes", suc:suc,desde:desde,hasta:hasta},
        async: true,
        dataType: "json",
        beforeSend: function() {
            //$("#contador_billetes").html("<img src='img/activity.gif' width='46px' height='8px' >"); 
        },
        success: function(data) {
            $(".filacont").remove();
            var c = 0;
            for(var i in data){ 
               var id = data[i].id_cont; 
               var pdv_cod = data[i].pdv_cod;
               var suc = data[i].suc;
               var fecha = data[i].fecha;
               var tipo = data[i].tipo;
               var auditor = data[i].auditor;
               var cierre = data[i].cierre;
               var estado = data[i].estado; 
               c++; // :D c++
               $("#cont_bill").append("<tr class='filacont' style='cursor:pointer;background:white' id='"+id+"'><td class='itemc'>"+id+"</td><td class='itemc'>"+suc+"</td><td class='itemc'>"+pdv_cod+"</td><td class='itemc'>"+fecha+"</td><td class='itemc'>"+tipo+"</td><td class='itemc'>"+auditor+"</td><td class='itemc'>"+cierre+"</td><td class='itemc'>"+estado+"</td></tr>");
            }
            $("#contador_billetes").fadeIn();
            inicializarCursores("itemc");
            $(".filacont").click(function(){
                var id =  $(this).attr("id");
                abrirContadorBilletes(id);
            });
            if(c == 0){
                $("#msg_no").addClass("errorgrave");
                $("#msg_no").html("  No hay ningun Contador de Billetes para Esta Fecha. Puede crear uno en el boton de Abajo. "); 
                setTimeout('$("#msg_no").html("");',8000);
            }
        }
    });    
}

function replicar(){
    $("input#hasta").val($("input#desde").val());
}