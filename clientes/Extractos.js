var printing;

$(function(){
    var tipo_vista  = $("#tipo_vista").val();
    
    if(tipo_vista === "vista_cliente"){
        $("#switch_view").prop("checked",true);
        switch_view();
    }
        
    
});
function switch_view(){  
    var ch = $("#switch_view").is(":checked");
     
    if(ch){
        $(".switch").addClass("oculto");
        $(".det_pago_vacio").prop("colspan","11");          
        $(".det_cab").prop("colspan","6");
        $(".det_total").prop("colspan","6");
        $(".det_total_vacio").prop("colspan","7");     
        $(".titulo_extracto").prop("colspan","10");    
        $(".cli_data").prop("colspan","8");
        $(".orin_sp_vacio").prop("colspan","2");
    }else{
        $(".oculto").removeClass("oculto");
        $(".det_pago_vacio").prop("colspan","12");
        $(".det_cab").prop("colspan","9");      
        $(".det_total").prop("colspan","9");     
        $(".det_total_vacio").prop("colspan","6");     
        
        $(".titulo_extracto").prop("colspan","14");
        $(".cli_data").prop("colspan","13");
        $(".orin_sp_vacio").prop("colspan","3");         
        
    }    
}

function configurar(){
    $(".fecha").mask("99-99-9999");
    $(".fecha").datepicker({ dateFormat: 'dd-mm-yy' }); 
    $("#nombre_cliente").focus(); 
    $("#estado").change(function(){
        var e = $(this).val();
        if(e == "Pendiente"){
            
        }else if (e == "Cancelada"){
            
        }else{
            
        }
    });
}

function reporteDeudores(){
    var title = "Reporte de Deudores";   
    var params = "width=800,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no"; 
    
    var user = getNick();
    var codigo_cliente = $("#codigo_cliente").val();
    if(codigo_cliente === ""){
        codigo_cliente = "%";
    }
    var url = "reportes/Deudores.class.php?user="+user+"&codigo_cliente="+codigo_cliente+""; 
    window.open(url,title,params);     
}

function verDetalleCuenta(){
    var CardCode = $("#codigo_cliente").val();
    var ruc_cliente = $("#ruc_cliente").val();
    var nombre_cliente = $("#nombre_cliente").val();
      
    
    var desde =  $("#desde").val();
    var hasta =  $("#hasta").val();
    var estado = $("#estado").val();
    var order = $("#order").val();
    
    if(desde == "NaN-NaN-NaN"){
        $("#desde").addClass("error_field");
        return;
    }else{
       $("#desde").removeClass("error_field"); 
    }
    if(hasta == "NaN-NaN-NaN"){
       $("#hasta").addClass("error_field");
       return;
    }else{
       $("#hasta").removeClass("error_field"); 
    }
    if(CardCode == ""){
        $("#nombre_cliente").addClass("error_field");
        return;
    }else{
       $("#nombre_cliente").removeClass("error_field"); 
    }
    var paper_size = $('input[name=paper_size]:checked').val();
    var usuario = getNick();
    var params = "width=800,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    
    var vista_cliente = $("#vista_cliente").is(":checked");
    
    var title = "Extracto de Cuenta de Cliente";  
    var URL = 'Extractos.class.php';
    if($("select#tipoRep option:selected").text() === 'Resumido'){
        var URL = 'ExtractosRes.php';
    }  
    var url = "clientes/"+URL+"?action=verExtracto&desde="+desde+"&hasta="+hasta+"&CardCode="+CardCode+"&estado="+estado+"&ruc_cliente="+ruc_cliente+"&cliente="+nombre_cliente+"&paper_size="+paper_size+"&usuario="+usuario+"&order="+order+"&suc="+getSuc()+"&vista_cliente="+vista_cliente;
			 
    window.open(url,title,params);        
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
     
}
function ocultar(){}
function mostrar(){}

function nuevoCliente (){
    errorMsg("No se debe crear clientes por aqui.",6000); 
    $( "#ui_clientes" ).fadeOut("fast"); 
}
function cerrar(){
    $( "#ui_clientes" ).fadeOut("fast"); 
}

function mostrarDocumento(nro_rec,tipo){
    if(tipo === "RC"){ 
        var params = "width=1024,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
        var url = "ComprobanteReconciliacion.class.php?nro_rec="+nro_rec+"";                 
        var title = "Comprobante de Reconciliacion";
        if(!printing){        
            printing = window.open(url,title,params);
        }else{
            printing.close();
            printing = window.open(url,title,params);
        }        
   } 
}

