/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function configurar(){    
    $(".desde_hasta").mask("99-99-9999");
    $(".desde_hasta").datepicker({ dateFormat: 'dd-mm-yy' }); 
    $(".calculate").change( function(){ calcHoras() });
    getRegistrosXFejeXSuc();
}

function calcHoras(){
    
    var tipo_permiso = $("#tipo_permiso").val();
    if(tipo_permiso == "xhora"){
        $("#fecha_hasta").prop("disabled",true);
        $("#fecha_hasta").val( $("#fecha_desde").val());
        $("#fecha_ret").val( $("#fecha_hasta").val());
        $("#hora_ret").val( $("#hora_hasta").val());
        $("#hora_desde").prop("min","07:00");
        $("#hora_hasta").prop("max","18:00");
        $("#fecha_ret").prop("disabled",true);
        $("#hora_ret").prop("disabled",true);
        $("#hora_desde").fadeIn();
        $("#hora_hasta").fadeIn();
    }else{
        $("#fecha_hasta").prop("disabled",false);
        $("#hora_desde").prop("min","00:00");
        $("#hora_desde").val("00:00");
        $("#hora_hasta").prop("max","23:59");
        $("#hora_hasta").val("23:59");
        $("#fecha_ret").prop("disabled",false);
        $("#hora_ret").prop("disabled",false);
        $("#hora_desde").fadeOut();
        $("#hora_hasta").fadeOut();
    }
    var fdesde = validDate($("#fecha_desde").val()).fecha;
    var hdesde = $("#hora_desde").val();
    var fhasta = validDate($("#fecha_hasta").val()).fecha;
    var hhasta = $("#hora_hasta").val();
             
    var fecha_desde = new Date(fdesde+" "+hdesde);
    var fecha_hasta = new Date(fhasta+" "+hhasta);
    //console.log("fecha_desde: "+fecha_desde+"   fecha_hasta: "+fecha_hasta);
    
    if(fhasta != "NaN-NaN-NaN"){    
        var horas = diff_hours(fecha_hasta, fecha_desde).format(2, 3, ',', '.'); 
        var dias = diff_days(fecha_hasta, fecha_desde) ; 

        var fecha_retorno = $("#fecha_ret").val();

        console.log("dias "+dias);
        console.log("horas "+horas);

        var calc_horas = 0;  
        if(tipo_permiso == "xhora"){
            calc_horas = horas;
            $("#total_horas").val(calc_horas);
        }else{
            calc_horas = (dias * 8).format(2, 3, '', '.');
            $("#total_horas").val(calc_horas);
            horas = calc_horas;
        }
        
        if($("#tipo_lic").val() == "Con Descuento"){
            var valor_hora = $("#valor_hora").val();               
            var valor_desc = (horas * valor_hora).format(2, 3, '.', ','); 
            $("#valor_desc").val(valor_desc); 
        }else{
            $("#valor_desc").val("0"); 
        }
    }
}

function registrar(){
   
   var text = $("#registrar").val(); 
   if(text === "Registrar"){
    
   var func = $("#usuario").val();    
   var motivo = $("#motivo").val();    
   var desde = $("#fecha_desde").val()+" "+$("#hora_desde").val();    
   var hasta = $("#fecha_hasta").val()+" "+$("#hora_hasta").val();       
   var fecha_ret = $("#fecha_ret").val()+" "+$("#hora_ret").val();          
  
   
   var tipo = $("#tipo_lic").val();
   var horas = $("#total_horas").val();    
   var valor_desc = parseFloat($("#valor_desc").val().replace(/\./g,"").replace(",","."));
   var tipo_permiso = $("#tipo_permiso :selected").text();
   var error =false;
   if(motivo.length < 10){
       errorMsg("Este motivo '"+motivo+"' no parece ser valido",10000);
       error = true;
       return;
   }
   
   if(desde.length < 10 || hasta.length < 10 || fecha_ret.length < 10 ){
       errorMsg("Fechas incorrectas, corrobore!",10000);
       error = true;
       return;
   }
   if(!error){
    $.ajax({
        type: "POST",
        url: "usuarios/RegistroAusencias.class.php",
        data: {"action": "registrarPedidoAusencia",jefe:getNick(),func: func,motivo:motivo,desde:desde,hasta:hasta,fecha_ret:fecha_ret,tipo:tipo,horas:horas,valor_desc:valor_desc,suc:getSuc(),tipo_permiso:tipo_permiso},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            var estado = data.estado; 
            $("#msg").html(estado);
            limpiarForm();
            getRegistrosXFejeXSuc();
            $("#registrar").val("Volver");
        }
    });
   }
   }else{
      showMenu();
   }
}
function limpiarForm(){
    $(".tabla  input:not('#valor_hora')").val("");
    $("#motivo").val(""); 
}

function getRegistrosXFejeXSuc(){
    $.ajax({
        type: "POST",
        url: "usuarios/RegistroAusencias.class.php",
        data: {"action": "getRegistrosXFejeXSuc", suc: getSuc(),jefe:getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {  
            $(".fila").remove();
            for (var i in data) { 
                var id_aus = data[i].id_aus;                        
                var jefe = data[i].jefe;
                var usuario = data[i].usuario;
                var fecha_reg = data[i].fecha_reg;
                var fecha_desde = data[i].fecha_desde;
                var fecha_hasta = data[i].fecha_hasta;
                var fecha_retorno = data[i].fecha_retorno;
                var motivo = data[i].motivo;
                var valor_descuento = data[i].valor_descuento;
                var tipo_lic = data[i].tipo_lic;
                var tipo_perm = data[i].tipo_perm;
                var horas = data[i].horas;
                $("#registro").append("<tr class='fila'><td class='itemc'>"+id_aus+"</td><td class='itemc'>"+jefe+"</td><td class='itemc'>"+usuario+"</td><td class='itemc'>"+fecha_reg+"</td><td class='itemc'>"+fecha_desde+"</td><td class='itemc'>"+fecha_hasta+"</td><td class='itemc'>"+fecha_retorno+"</td><td class='itemc'>"+horas+"</td><td class='itemc'>"+tipo_lic+"</td><td class='itemc'>"+tipo_perm+"</td><td>"+motivo+"</td><td class='num'>"+valor_descuento+"</td>\n\
                <td class='itemc' style='width:40px'><img style='cursor:pointer' src='img/printer_mini.png' onclick='imprimir("+id_aus+")'></td> <td class='itemc'> <img src='img/trash_mini.png' class='trash' onclick='delDet("+id_aus+")'> </td> </tr>");
            }   
            $("#msg").html(""); 
        }
    });
}
function imprimir(id){
    var params = "width=800,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    var url = "usuarios/RegistroAusencias.class.php?action=imprimir&id="+id+"&user="+getNick();
    var title = "Autorizacion de Permiso";     
    window.open(url,title,params);       
}
function delDet(id){
    var c = confirm("Confirma borrar este registro?");
    if(c){
        $.ajax({
            type: "POST",
            url: "usuarios/RegistroAusencias.class.php",
            data: {"action": "borrarRegistro", "id": id},
            async: true,
            dataType: "html",
            beforeSend: function () {
                $("#msg").html("Eliminando registro espere...<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            complete: function (objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText);  
                    $("#msg").html(result); 
                    getRegistrosXFejeXSuc();
                }
            },
            error: function () {
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        }); 
    }
}

function diff_hours(dt2, dt1){    
    var diff =(dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60);
    return Math.abs( diff   );
}

function diff_days(dt2, dt1){   
    console.log("Fecha recibida: "+dt2);
    console.log("Fecha recibida: "+dt1);
    var diff =(dt2.getTime() - dt1.getTime());
    diff =  diff / (1000 * 3600 * 24) ; 
    return   Math.round(diff) ;
}

var ventana;
function verReporte(){
    var desde = $("#fecha_desde").val();    
    var hasta = $("#fecha_hasta").val(); 
    var targetSuc = $("#target_suc").val();  
    
    var nro_cobro = $("#nro_cobro").val();  
    var params = "width=1024,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    var url = "reportes/RegistroAusencias.class.php?desde="+desde+"&hasta="+hasta+"&usuario="+getNick()+"&suc="+targetSuc;
    var title = "Registro de Ausencias";
    if(!ventana){        
        ventana = window.open(url,title,params);
    }else{
        ventana.close();
        ventana = window.open(url,title,params);
    }  
}