

function configurar(){
  $("#suc_actual").val(getSuc());  
  setCuenta();  
  $(".fecha").datepicker({ dateFormat: 'dd-mm-yy' }); 
  
  $(".sencible").change(function(){
      getEfectivo();
  });
  $(".modificable").change(function(){
      controlar();
  });
  $("#bancos").change(function(){
    var b = $(this).val();
    if(b == "019"){
        $("#nro_dep").prop("disabled",true);
        $("#fecha_dep").prop("disabled",true);
        $("#fecha_dep").val($("#cj_fecha").val());
        getUltimoIdMov(); 
    }else{
        $("#nro_dep").prop("disabled",false);
        $("#fecha_dep").prop("disabled",false);
    }
  });
  
  $("#cj_fecha").change(function(){
    var b = $("#bancos").val();
    if(b == "019"){
        $("#fecha_dep").val($(this).val());
        $("#fecha_dep").prop("disabled",true);
    }else{
        $("#fecha_dep").prop("disabled",false);
    }
  });
  
}
function getUltimoIdMov(){
    $.post("bancos/Depositos.class.php", { "action": "getUltimoIdMov"  }, function(data) {
        $("#nro_dep").val(data.id_mov ); 
    }, "json");
}
function controlar(){
     var cotiz = $("#cotiz").val();
     var nro_dep = $("#nro_dep").val();
     var existente =  parseFloat($("#efectivo").val().replace(/\./g,"").replace(",","."));
     var monto_dep = parseFloat($("#monto_dep").val());
     
    if(isNaN(cotiz) || (existente < monto_dep) || nro_dep.length < 2 || isNaN(monto_dep) || existente <= 0 || monto_dep <=0 ){
        $("#aceptar").prop("disabled",true);
    }else{
        $("#aceptar").removeAttr("disabled");
    }
}

function getEfectivo(){
    var fecha = validDate($("#cj_fecha").val()).fecha;
    var moneda = $("#cuenta option:selected").attr("data-moneda");
    $.ajax({
        type: "POST",
        url: "bancos/Depositos.class.php",
        data: {action: "getEfectivo", suc: getSuc(),moneda:moneda,fecha:fecha},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            
            var efectivo = parseFloat(data.Efectivo).format(2,3);
          
            $("#efectivo").val(efectivo);         
            
            $("#msg").html(""); 
        }
    }); 
    getCotiz();
    getDepositos();
}

function registrarDeposito(){
    $("#aceptar").prop("disabled",true);  
    var fecha = validDate($("#cj_fecha").val()).fecha;
    var moneda = $("#cuenta option:selected").attr("data-moneda");
    var efectivo = $("#efectivo").val();
    var monto_dep = $("#monto_dep").val();
    var nro_dep = $("#nro_dep").val();
    var fecha_dep = validDate($("#fecha_dep").val()).fecha;   
    var id_banco = $("#bancos").val();
    var cuenta = $("#cuenta").val();
    var cotiz = $("#cotiz").val();
    
    $.ajax({
        type: "POST",
        url: "bancos/Depositos.class.php",
        data: {"action": "registrarDeposito",id_banco:id_banco,cuenta:cuenta, fecha: fecha,moneda:moneda,efectivo:monto_dep,nro_dep:nro_dep,fecha_dep:fecha_dep,cotiz:cotiz,suc:getSuc(),usuario:getNick()},
        async: true,
        dataType: "html",
        beforeSend: function () {
             $("#msg").html("Guardando deposito...<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                $(".modificable").val(""); 
                getDepositos();
                getEfectivo();  
                if( $("#bancos").val() == "019"){
                    imprimirComprobante(cuenta);
                }
            }else{
                 $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        },
        error: function () {
           $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });  
}

function imprimirComprobante(cuenta){
    var suc = getSuc();
    var params = "width=400,height=400,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    var url = "bancos/ComprobanteDeposito.class.php?cuenta="+cuenta+"&suc="+suc+"&usuario="+getNick();                 
    var title = "Comprobante de Deposito";
    window.open(url,title,params);
}

function getDepositos(){
    var fecha = validDate($("#cj_fecha").val()).fecha;
    var moneda = $("#cuenta option:selected").attr("data-moneda");
    $.ajax({
        type: "POST",
        url: "bancos/Depositos.class.php",
        data: {"action": "getDepositos", fecha: fecha,suc:getSuc(),moneda:moneda},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $(".tr_dep").remove();
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   //m.id_banco,b.nombre,m.cuenta,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha,hora,suc,m.id_concepto,c.descrip AS concepto, entrada,salida,estado 
            for (var i in data) { 
                var id_banco = data[i].id_banco;
                var nombre = data[i].nombre;      
                var fecha = data[i].fecha;      
                var hora = data[i].hora;      
                var concepto = data[i].concepto;      
                var entrada = data[i].entrada; 
                var cuenta = data[i].cuenta;      
                var salida = data[i].salida;
                var estado = data[i].estado;
                $("#depositos").append("<tr class='tr_dep'><td class='itemc'>"+id_banco+"</td><td class='item'>"+nombre+"</td><td class='itemc'>"+cuenta+"</td><td class='itemc'>"+moneda+"</td><td class='itemc'>"+fecha+"</td><td class='itemc'>"+hora+"</td><td class='item'>"+concepto+"</td><td class='num'>"+entrada+"</td> <td class='num'>"+salida+"</td> <td class='itemc'>"+estado+"</td> </tr>");
            }   
            $("#msg").html(""); 
        }
    });
}

function setCuenta(){
    var banco = $("#bancos").val();
    $("#cuenta :not([class=cta_"+banco+"])").fadeOut();
    $("#cuenta .cta_"+banco+"").fadeIn();    
    $("#cuenta").val($(".cta_"+banco).val());
}
function getCotiz(){
    var moneda = $("#cuenta option:selected").attr("data-moneda");
    if(moneda != 'G$'){
    $.ajax({
        type: "POST",
        url: "bancos/Depositos.class.php",
        data: {"action": "getCotiz", "suc": getSuc(), moneda:moneda },
        async: true,
        dataType: "json",
        beforeSend: function() {},
        success: function(data) {   
            var compra = data[0].compra; 
            $("#cotiz").removeAttr("disabled");
            $("#cotiz").val(compra); 
        }
    });
    }else{
        $("#cotiz").val(1); 
        $("#cotiz").prop("disabled",true);
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
