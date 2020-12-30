/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var decimales = 2;
var arqueoPopUp;

function configurar(){     
    $("#suc").val(getSuc());  
    $(".fecha").mask("99-99-9999");
    $(".fecha").datepicker({ dateFormat: 'dd-mm-yy' }); 
    $("#concepto").focus(); 
  //getPDVs();
  $("#concepto").change(function(){
      var tipo = $("#concepto option:selected").attr("data-tipo");  
      console.log(tipo);
      if( tipo == "E"){           
          $("#tipo_mov").removeClass("S");
          $("#tipo_mov").addClass("E");
      }else{
         $("#tipo_mov").removeClass("E"); 
          $("#tipo_mov").addClass("S");
      } 
  });
  $("#moneda").change(function(){
      getCotiz();
  });
  $(".valor").change(function(){
     var monto =   parseFloat($("#monto").val()).format(decimales,3,'.',',');     
     $("#monto").val(  monto );
     setRef();     
  });
};
function setRef(){
    var monto = parseFloat( ($("#monto").val() ).replace(/\./g, '') .replace(/\,/g, '.') ); 
    var cotiz = $("#cotiz").val();
    var gs = parseFloat(monto * cotiz).format(2,3,'.',',');    
    $("#valor_gs").val(gs); 
    var gs_non_formatted = monto * cotiz;
    if(gs_non_formatted > 0){
        $("#gen_mov").removeAttr("disabled");
    }else{
         $("#gen_mov").prop("disabled",true);
    }
}

function onlyNumbers(e){
        //e.preventDefault();
	var tecla=new Number();
	if(window.event) {
		tecla = e.keyCode;
	}else if(e.which) {
		tecla = e.which;
	}else {
	   return true;
	}
        if(tecla === "13"){
            this.select();
        }
        //console.log(e.keyCode+"  "+ e.which);
	if((tecla >= "97") && (tecla <= "122")){
		return false;
	}
}

function getCotiz(){
    var moneda = $("#moneda").val();
    $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {action:"getCotiz", suc: getSuc(),moneda:moneda },
            async: true,
            dataType: "json",
            beforeSend: function() {},
            success: function(data) {   
                setDecs();
                if(moneda == 'U$'){
                   var dolares = data.Dolares.compra;   
                   $("#cotiz").val(dolares);                   
                }else if(moneda == 'R$'){
                   var reales = data.Reales.compra; 
                   $("#cotiz").val(reales);
                }else if(moneda == 'P$'){ 
                   var pesos = data.Pesos.compra;
                   $("#cotiz").val(pesos);
                }else{
                    $("#cotiz").val("1");  
                    decimales = 0;
                }           
                setRef();
            }
        });
}

function setDecs(){
    decimales = $("#decs").val();
    $("#decval").html(decimales); 
}

function generarMovimiento(){
    $("#gen_mov").prop("disabled",true);
    var concepto = $("#concepto").val();
    var tipo = $("#concepto option:selected").attr("data-tipo");  
    var monto =     parseFloat(($("#monto").val() ).replace(/\./g, '') .replace(/\,/g, '.') ); 
    var monto_ref = parseFloat(($("#valor_gs").val() ).replace(/\./g, '') .replace(/\,/g, '.') ); 
    var moneda = $("#moneda").val();
    var cotiz = $("#cotiz").val();
    var fecha = validDate($("#desde").val()).fecha;
    $.ajax({
        type: "POST",
        url: "caja/IngresoEgreso.class.php",
        data: {"action": "generarMovimiento", "usuario": getNick(), "suc": getSuc(),concepto:concepto,tipo:tipo,monto:monto,monto_ref:monto_ref,cotiz:cotiz,moneda:moneda,fecha:fecha},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);  
                limpiar();
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });     
}

function limpiar(){
     $(".valor").val("");
}

function generarReporte(){
    var desde = validDate($("#desde").val()).fecha;
    var hasta = validDate($("#desde").val()).fecha;
    var suc = getSuc();
    var moneda = $("#moneda").val();
     
    var paper_size = 14;
    var usuario = getNick();
    var params = "width=800,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    var url = "caja/reportes/Efectivo.class.php?desde="+desde+"&hasta="+hasta+"&suc="+suc+"&moneda="+moneda+"&paper_size="+paper_size+"&usuario="+usuario;
    var title = "Flujo de Efectivo";
       
    if(!arqueoPopUp){
        arqueoPopUp = window.open(url,title,params);
    }else{
        arqueoPopUp.close();
        arqueoPopUp = window.open(url,title,params);
    }
    
    
}