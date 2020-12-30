/**
 * Ajustes de Entrada
 * @type Boolean|Boolean|Boolean
*/
var data_next_time_flag = true;
var ajustes_pendientes = true;
var cotizacion_dolar = false;
var intentos = 0;
var procesados = 0;

var supervisor = false;
var autorizado_por = "";

var prioridad_sucursales = ['02','01','06','24','25','05','04','10','30','00'];

var printing;

var falla_del_hijo = false;

var no_gramados = ["C0205","C0094","C0146","S0220","C0124","C0133","C0089","C0168","B0100","C0167","S0156","S0197","C0193","S0014","S0259","C0088","C0097","C0135","C0004","C0093","S0138","S0195","H0284","C0086","H0285","C0024","C0076","H0284","S0156","S0252","B0100","C0087","C0195","H0285","S0025","C0091","S0198","S0252","C0090"];

function configurar(){
    puertos();
   $("#lote").focus();   
   $("#stockreal").change(function(){
        calcAjuste();
   });
   $("*[data-next]").keyup(function (e) {
        if (e.keyCode == 13) { 
            if(data_next_time_flag){
               data_next_time_flag = false;  
               var next =  $(this).attr("data-next");
               $("#"+next).focus();               
               setTimeout("setDefaultDataNextFlag()",600);
            }
        } 
    });  
        
   $("#tabs").tabs();
   var balanza = getCookie("balanza").sesion;
   if(balanza == null){balanza = "localhost";}
   $("#balanza").val( balanza  ); // Poner balanza ultimamente utilizada
   var metrador = getCookie("metrador").sesion; 
   if(metrador == null){metrador = "localhost";};
   $("#metrador").val( metrador );
   
   $(".calc").change(function(){
       calcularGramaje();
   });
 
   configurePrinter();
   checkearCotizDolar();  
   
   var h1 = "<tr class='titulo'><th>Suc:</th>";
    var td = "<tr><th>Pol:</th>";
    for(var j = 0; j < prioridad_sucursales.length;j++ ){
       var suc = prioridad_sucursales[j];
        h1 += "<th class='suc_pol'>"+suc+"</th>";
        td += "<td class='polit_"+suc+" itemc' ></td>";  
    }    
    h1 += "</tr>";
    td += "</tr>";
    
    $("#pol_x_suc").append( h1 );
    $("#pol_x_suc").append( td ); 
    $("#verificar").draggable();
    $("#politicas_sucursales").draggable();
}
function showKeyPad(id){
    showRelative(id,buscarDatos,false);
    var position = $("#"+id).offset();      
    $('#n_keypad').css({ 'top'  : position.top -56 ,'left' : position.left -7});
}
function addHost(id){
    var ip = prompt("Ingrese el IP de la maquina a la que desea conectarse");
    if(ip != null ){
        $("#"+id).append("<option>"+ip+"</option>");
        $("#"+id).val(ip);
        leerMetrador();
    }
}
function showKeyPadGeneric(id){
    showRelative(id,calcularGramaje,false);     
    var position = $("#"+id).offset();      
    $('#n_keypad').css({ 'top'  : position.top -56 ,'left' : position.left -7});
}
function showKeyPadFallas(id){
     
    showRelative(id,guardarFallas,false);     
    var position = $("#"+id).offset();         
    $('#n_keypad').css({ 'top'  : position.top -56 ,'left' : position.left -7});
    
}
function guardarFallas(){
    $(".falla").each(function(){
       var f = $(this).val();
       if(f != "" && f != "---" && f > 0){
          registrarFalla($(this).attr("id"));    
       }
    });    
}
 
function calcTara(){
   var tara = $("#tara").val(); 
   var ftara = tara * 1000;
   $("#tara").val(ftara); 
   calcularGramaje(); 
}
function verPendientes(){
     
    var usuario = getNick();       
    var url = "compras/Fraccionar.class.php?action=verPendientes&usuario="+usuario+"";
    var title = "Mis Trabajos Pendientes";
    var params = "width=1000,height=800,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
     
    if(!printing){        
        printing = window.open(url,title,params);
    }else{
        printing.close();
        printing = window.open(url,title,params);
    }     
}
function calcularGramaje(){
    $("#verificar").slideUp(); 
    var codigo =  $("#codigo").val() ;
    var um =  $("#um").val();
    var tara = parseFloat($("#tara").val());
    var ancho = parseFloat($("#ancho").val());
    var metros = parseFloat($("#metros").val());
    var kg =  parseFloat($("#kg").val()); 
    var gramaje = redondear( ((kg - (tara / 1000)) * 1000 ) / (metros * ancho) );
    
    var gramaje_ref = parseFloat($("#gramaje_ref").val().replace(",",""));
    var rango_porc = gramaje_ref * 5 / 100;// 
    var gramaje_min =  gramaje_ref - rango_porc;
    var gramaje_max =  gramaje_ref + rango_porc;
    
    
    
    // Para el Saldo
    var stock_actual = parseFloat($("#stock").val().replace(".","").replace(",","."));   
    var saldo =  stock_actual - metros;
    if(!isNaN(saldo)){
        $("#saldo").val( parseFloat( saldo ).format(2, 3, '.', ',')    );
        if(saldo > 0){
            $("#saldo").css("color","blue");
            $("#fp").prop("checked",false);
        }else{
            $("#fp").prop("checked",true);
            $("#saldo").css("color","red");
        }
    }else{
        $("#saldo").val("");
    }
    //$(".falla").trigger("change");  
    if(!cotizacion_dolar){
        alertar("Cotizacion del Dolar debe ser Definida, contacte con Administracion");
        return;
    }
    
    if(isNaN(gramaje)){
        $("#gramaje_calc").val("");
    }else{
       $("#gramaje_calc").val(gramaje); 
    }    
    if(gramaje > 0){
        var codigos_que_no_se_graman = $.inArray(codigo,no_gramados) >= 0?true:false;
        var in_range = (gramaje >= gramaje_min && gramaje <= gramaje_max)?true:false;
        console.log("In Range :"+in_range);
        console.log("codigos_que_no_se_graman :"+codigos_que_no_se_graman);
        console.log("in_range y  codigos_que_no_se_graman :"+in_range && codigos_que_no_se_graman);
        if(um === 'Unid' || codigos_que_no_se_graman || in_range ){ 
            $("#fraccionar").removeAttr("disabled");
            $("#msg_trab").html("");
        }else{
            fraccionarComoSupervisor();
            $("#fraccionar").attr("disabled",true);
            alertar("Gramaje fuera de Rango: Min:"+(gramaje_min).toFixed(2)+"  Max:"+(gramaje_max.toFixed(2)));
            return;
        }        
    }else{
        $("#fraccionar").attr("disabled",true);
    }
    var ancho_lote =  parseFloat($("#anch").val().replace(",","."));
    if(!ancho.between(ancho_lote.min(10), ancho_lote.max(10)) && !isNaN(ancho) ){
        alertar("Atencion! compruebe que el Ancho este correcto.");
        if(ancho > 10){
           $("#fraccionar").attr("disabled",true);
        }
        return;
    }else{
        $("#msg_trab").html("");
    }
    var cant_fraccionar =  parseFloat($(".selected :nth-child(1)").text());
    if(!metros.between(cant_fraccionar.min(10), cant_fraccionar.max(10)) &&  !isNaN(metros)  && !isNaN(cant_fraccionar)  ){
        alertar("Cuidado! El corte no esta dentro del rango de la orden de fraccionamiento.");
        return;
    }else{
        $("#msg_trab").html("");
    }  
    if(!kg.between(0, 400 ) && !isNaN(kg)){
        $("#fraccionar").attr("disabled",true);
        alertar("Cuidado! El kilage parece ser incorrecto...");
        $("#kg").effect("shake");
        return;
    }else{
        $("#msg_trab").html("");
    }
   
}
function alertar(msg){ 
    $("#msg_trab").html("<label style='background:white;color:red;border:solid red 1px;font-size:13px;padding:2px 4px'><img style='margin-bottom:-3px' src='img/warning_yellow_16.png'>&nbsp;"+msg+"</label>");
    $("#msg_pw").html("<label style='background:white;color:red;border:solid red 1px;font-size:13px;padding:2px 4px'><img style='margin-bottom:-3px' src='img/warning_yellow_16.png'>&nbsp;"+msg+"</label>");    
}
function fraccionar(){
    if(!cotizacion_dolar){
        alertar("Cotizacion del Dolar debe ser Definida, contacte con Administracion");
        errorMsg("Cotizacion del Dolar debe ser Definida, contacte con Administracion",10000);
        return;
    }
    $("#fraccionar").attr("disabled",true);
    $("#fraccionar").css("color","green");
    $("#fraccionar").val("Fraccionando...");
    var lote = $("#lote").val();
    var codigo = $("#codigo").val();
    var tara = $("#tara").val();
    var ancho = $("#ancho").val();
    var metros = parseFloat($("#metros").val());
    var kg = $("#kg").val(); 
    var um = $("#um").val(); 
    var kg_desc = parseFloat($("#kg_desc").val().replace(",","")); 
    var gramaje = redondear( ((kg - (tara / 1000)) * 1000 ) / (metros * ancho) );
    var gramaje_rollo =  $("#gram").val();
    var presentacion =  $(".selected :nth-child(2)").text();
    var destino =  $(".selected :nth-child(3)").text();
    var total_fraccionado = parseFloat($("#total_fraccionados").text());
 
    
    var stock_actual = parseFloat($("#stock").val().replace(".","").replace(",","."));                  
    var stock_final = stock_actual - metros;
    
    var c = 0;
    var selected_pos = 0;
    $(".fila_cortes").each(function(){ 
      c++;
      if($(this).hasClass("selected")){
           selected_pos = c;
      }
    });
    var cant_cortes = $(".fila_cortes").length;
    if(selected_pos >= cant_cortes && cant_cortes > 0){        
        if(stock_final > 0){        
            var cons = confirm("Esta en el Ultimo Fraccionamiento?,\n\rMarcar el Rollo PADRE como Fin de Pieza?\nEl sistema realizara un ajuste -"+stock_final);
            if(cons){               
               $("#fp").prop("checked",true); 
            }else{
               $("#fp").prop("checked",false); 
            }
        }else{
            $("#fp").prop("checked",true);             
        }           
    }
    var fp = $("#fp").is(":checked");
  
    if(presentacion == ""){
        presentacion = "Pieza";
    }
    if(destino == ""){
        destino = "00";
    }
    $.ajax({
        type: "POST",
        url: "compras/Fraccionar.class.php",
        data: {"action": "fraccionar", codigo: codigo,lote:lote,tara:tara,ancho:ancho,fraccion:metros,kg:kg,gramaje:gramaje,usuario:getNick(),kg_desc:kg_desc,suc:getSuc(),um:um,gramaje_rollo:gramaje_rollo,presentacion:presentacion,destino:destino,total_fraccionado:total_fraccionado,fp:fp },
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg_trab").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");  
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                //var hijo = $.trim((objeto.responseText)).substring(2, 50);  
                var hijo = $.trim((objeto.responseText));  
                $(".selected").removeClass("selected");
                var user_ = getNick(); 
                $("#msg_trab").html(""); 
                $("#tr_total_fracc").before("<tr class='procesados' data-gramaje='"+gramaje+"' data-usuario='"+user_+"' ><td class='lotes'>"+hijo+"</td> <td class='lotes cant_frac'>"+metros+"</td><td class='lotes'>"+presentacion+"</td><td class='lotes'>"+destino+"</td><td class='lotes imp_"+hijo+"'> <input id='pb_"+hijo+"' type='button' value='Imprimir' onclick='imprimir("+hijo+")' data-print='0'> </td></tr>");
                procesados++;
                $(".fila_"+procesados).addClass("selected");
                medicionManualOrden();
                //$("#area_trab input[type=text]").val("");
                $("#area_trab input[type=text]:not(input[id=ancho])").val("");
                $(".txt_falla").val(""); // Redundante
                totalizar();
                moveScroll("+");
                
                $("#stock").val(  parseFloat( stock_final ).format(2, 3, '.', ','));
                $("#fraccionar").css("color","black");
                $("#fraccionar").val("Fraccionar");
                remitir(codigo,hijo,destino,metros,gramaje,ancho,tara,kg,kg_desc); 
                setTimeout( "imprimir('"+hijo+"')",3000);     
                
                 
                var gr = parseFloat($('.procesados[data-usuario="'+user_+'"]').first().attr("data-gramaje"));
                if(!isNaN(gr)){
                   $("#gramaje_ref").val(gr);
                }else{
                    $("#gramaje_ref").val( $("#gramaje_m").val() );
                }
                $("#msg").html("");
             
                $(".row_tipo_falla").remove();
                
            }
        },
        error: function () {
            $("#msg_trab").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });  
}

function remitir(codigo,lote,destino,metros,gramaje,ancho,tara,kg,kg_desc){

    if(destino != "00" && destino != ""){
        var descrip = $("#descrip").val();
        var um = $("#um").val();
        $.ajax({
            type: "POST",
            url: "compras/Fraccionar.class.php",
            data: {"action": "remitir", "usuario": getNick(), "origen": getSuc(),destino:destino,codigo:codigo,lote:lote,descrip:descrip,um:um,cant:metros,cant_compra:metros,gramaje:gramaje,ancho:ancho,tara:tara,kg_desc:kg_desc},
            async: true,
            dataType: "html",
            beforeSend: function () {
                $("#msg").html("Cargando pieza en Remision Abierta...<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            complete: function (objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText);   
                    $("#msg").html(result); 
                }
            },
            error: function () {
                $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        }); 
    }
}
 

/* @deprecated */
function generarEntradasFaltantes(){
   /*
   $.post( "compras/Fraccionar.class.php",{ action: "generarEntradasFaltantes"}, function( data ) {  
        console.log("Controlando Entradas Faltantes");
   });  */
}

function buscarDatos(){
   var lote = $("#lote").val();
   var suc = getSuc();
   var operador = getNick();
   $.ajax({
        type: "POST",        
        url: "Ajax.class.php",         
        data: {"action":"buscarDatosDeCodigo","lote":lote,"suc":suc,operador:operador}, // Utilizo la misma funcion de Factura de Ventas
        async:true,
        dataType: "json",
        beforeSend: function(){ 
           $("#msg").html("<img src='img/loadingt.gif' >");  
           $("#msg").removeClass("error");
           $("#imprimir").attr("disabled",true);
           $("#img").fadeOut("fast");
           $("#codigo").val(""); 
           $("#um").val("");  
           $("#suc").val("");   
           $("#anch").val("");  
           $("#gram").val("");  
           $("#gramaje_m").val("");  
           $("#descrip").val("");
           $("#kg_desc").val("");
           $("#stock").val("");  
           $(".ajuste").fadeOut("fast");    
           $(".fila_cortes").remove();
           $("#area_frac").fadeOut();
           $(".txt_falla").val("");
           $("#area_trab input[type=text]").val("");   
           $("#fp").prop("checked",false); 
           $("#estado").val("");
        },
        success: function(data){ 
            var existe = data.existe;
            $("#msg").attr("class","info");
            if( existe === "true" ){
                var Status = data.estado_venta;
                var codigo = data.codigo;
                $("#codigo").val(codigo); 
                $("#descrip").val( data.descrip );
                $("#stock").val(  parseFloat( data.stock  ).format(2, 3, '.', ',')   );
                $("#estado").val(Status);
                var ancho = parseFloat(  data.ancho ).format(2, 3, '.', ',');
                var gramaje = parseFloat(  data.gramaje ).format(0, 3, '.', ',');
                var gramaje_m = parseFloat(  data.gramaje_m ).format(0, 3, ',', '.');
                var kg_desc = parseFloat(  data.kg_desc ).format(3, 3, ',', '.');
                var um = data.um_prod; 
                var suc = data.suc;  
                var img = data.img;  
                var PrecioCosto = parseFloat(  data.costo_prom );
                
                $("#um").val(um);  
                $("#suc").val(suc);   
                $("#anch").val(ancho);  
                $("#gram").val(gramaje);  
                $("#gramaje_m").val(gramaje_m);  
                $("#gramaje_ref").val(gramaje_m);  
                $("#kg_desc").val(kg_desc);  
                
                if(img != "" && img != undefined){
                    var images_url = $("#images_url").val();
                    $("#img").attr("src",images_url+"/"+img+".thum.jpg");
                    $("#img").fadeIn(2500);
                }else{
                    $("#img").attr("src","img/no_image.png");
                    $("#img").fadeIn(2500);
                }                
         
                $("#msg").html("<img src='img/ok.png'>");  
                if(PrecioCosto > 0){               
                    if(getSuc() == suc){
                       buscarPoliticaDistribucion();

                       data_next_time_flag = false;  

                       //setTimeout("setDefaultDataNextFlag()",800);
                    }else{
                        $("#msg").addClass("error");
                        $("#msg").html("Esta pieza no se encuentra en esta Sucursal!, Corrobore.");   
                    }
                }else{
                     $("#msg").addClass("error");
                     $("#msg").html("Precio de costo no definido para este codigo: "+data.codigo); 
                }
 
                getPoliticaCortesXCodigo();
                getFallas(lote);
                registrarInicioOperacion();
                if(Status == "FP"  || Status == "Bloqueado"){
                    $("#estado").addClass("error");
                }else{
                    $("#estado").removeClass("error");
                }
                    
            }else{                
                $("#msg").addClass("error");
                $("#msg").html("Codigo no encontrado");   
                $("#lote").focus(); 
                $("#lote").select();                 
                $(".fila_cortes").remove();
                $(".procesados").remove();
            }
            buscarStockComprometido();
        },
        error: function(e){ 
           $("#msg").addClass("error");
           $("#msg").html("Error en la comunicacion con el servidor:  "+e);
           $("#imprimir").attr("disabled",true);
           $("#lote").select();
        }
    });
}

function registrarInicioOperacion(){
    var codigo = $("#codigo").val(); 
    var lote = $("#lote").val(); 
    $.post( "compras/Fraccionar.class.php",{ action: "registrarInicioOperacion",codigo:codigo,lote:lote,operador:getNick()}, function( data ) {  
         
    });
}

function setMetrador(libre){ // False cuando tiene Hijos
    var msj='';  
    if($(".selected").length > 0){
        msj = "mtsSetterMsj";
    }else{
        msj = "mtsSetterMsjLibre";
    }
    $("td#"+msj).empty();
    $("td#"+msj).removeClass("error");
    $("td#"+msj).html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 

    var boton = $("<button/>",{"onclick":"setMetrador(false)"});
    
    var cant_orden_proc = $("tr.fila_cortes").length;
    
    var mts = $("input#cl_medida").val();
    
    if(cant_orden_proc > 0 && libre == false){
        $("table#corteSinOrdenFrac").css("display","none");   
        if($("tr.fila_cortes").length == $("tr.fila_cortes").index($("tr.selected"))+1){
            mts =  '9999,99';
        }else{
            mts = $(".selected td").first().text();
        }
        
    }else{
        $("table#corteSinOrdenFrac").css("display","block");         
    }
    if(libre){
        mts =  '9999,99';
    }
         
    //var mts = (libre || ($("tr.fila_cortes").length == $("tr.fila_cortes").index($("tr.selected"))+1))?'9999,99':($("table#corteSinOrdenFrac").css("display") == 'none')? $($(".selected td").get(0)).text() : $("input#cl_medida").val();
    
    
    var ip_domain = $("#metrador").val();
    var puerto = $("#puerto").val();
    var url = "http://"+ip_domain+"/serial/CP20.php";
    var param = {"action":"set","port":puerto,"mts":mts};
    
    $.get(url,param,function(data){           
        if(data){                    
          if(data.error){
              $("td#"+msj).html(data.error);
              boton.text("Volver a Enviar Valores");
              $("td#"+msj).append(boton);
              $("td#"+msj).addClass("error");
          }else{
              $("td#"+msj).html("Iniciar Medicion");
          }
        }else{
              $("td#"+msj).html("Error al setear medida "+mts+", en metrador " );
              boton.text("Volver a Enviar Valores");
              $("td#"+msj).append(boton);
              $("td#"+msj).addClass("error");
          }
    },"jsonp").fail(function(){
        $("td#"+msj).html("Error de comunicacion IP:"+ip_domain+", Puerto:"+puerto);
        boton.text("Volver a Verificar");
        $("td#"+msj).append(boton);
        $("td#"+msj).addClass("error");
    })
    
}

var tmpArray = new Array();

function leerMetrador(destino){ //ttyS0
    tmpArray.splice(0,tmpArray.length);
    tmpArray = new Array();         
    var ip_domain = $("#metrador").val();
    var port = $("#puerto").val();      
    getMetradorData(ip_domain,port,1,destino);     
}

function getMetradorData(ip_domain,port,intentos,destino){  console.log("destino "+destino)
    $("#"+destino).val(""); 
    if(intentos < 4){
         
    $.ajax({
            url : "http://"+ip_domain+"/serial/CP20.php?action=get&port="+port,
            dataType:"jsonp",
            jsonp:"mycallback", 
            beforeSend: function () {               
               $("#msg_trab").html("<img src='img/loading_fast.gif' width='20' height='20' > &nbsp;&nbsp;<label style='color:green;font-size:18px'>Leyendo: "+intentos+"...  </label>  ");  
            }, 
            success:function(data){ 
                if(Object.keys(data).length>0 && !data.error){
                    var metros = data.metros;   
                     
                    if(metros > 0){ 
                        //console.log(tmpArray);
                        tmpArray.push(metros);
                        if(tmpArray.length === 3){
                            //console.log("Tam "+tmpArray.length);
                            var val0 = tmpArray[0];
                            var val1 = tmpArray[1];
                            var val2 = tmpArray[2];

                            //console.log(val0+"  "+val1+"  "+val0+"  Destino: "+destino); 
                            if((val0 == val1) && (val0 == val2)  ){
                                $("#"+destino).val(val0);    
                                $("#msg_trab").html("<img src='img/Circle_Green.png' width='20' height='20' style='margin-bottom: -3px' >&nbsp;&nbsp;<label style='color:green;font-size:18px'>"+val0+"</label>");                                         
                                calcularGramaje();  
                                if(destino.substr(0,4) == "txtf"  ){
                                    registrarFalla(destino);
                                }
                            }else{
                                $("#msg_trab").html("<label style='color:red;font-size:18px'>Lectura inconsistente! volver a intentar</label>");
                                $("#"+destino).val("");    
                                //alert("Lectura de metrador inconsistente! volver a intentar");
                            }   
                        }else{ 
                            intentos++;
                            $("#msg_trab").html("<img src='img/loading_fast.gif' width='20' height='20' > &nbsp;&nbsp;<label style='color:green;font-size:18px'>Leyendo: "+intentos+"...  </label>  ");  
                            getMetradorData(ip_domain,port,intentos,destino);
                        }

                        
                    }else{
                        $("#msg_trab").html("<img src='img/Circle_Green.png' width='20' height='20' style='margin-bottom: -3px'>&nbsp;&nbsp;<label style='color:red;font-size:18px'>Metrador en 0.00</label>");       
                        $("#"+destino).val("---");    
                    }
                }else{
                    $("#msg_trab").html("<label style='color:red;font-size:18px'>"+data.error+"</label>");
                    $("#"+destino).val("");    
                }
            }
    }); 
 }
}
 
function registrarFalla(Fx){
    console.log("Registrando Falla "+Fx);
    if(falla_del_hijo){
        getFallas($("#lote").val());
        falla_del_hijo = false;
    }
    var mts = $("#"+Fx).val();
    var tf = Fx.substring(3,10);
    var tipo_falla = tf.charAt(0).toUpperCase() + tf.slice(1);
    var padre = $("#lote").val();
    var codigo = $("#codigo").val();
     
    
    $.ajax({
        type: "POST",
         url: "compras/Fraccionar.class.php",
        data: {action: "registrarFalla", suc: getSuc(),codigo:codigo,padre:padre,usuario: getNick(),tipo_falla:tipo_falla,mts:mts, suc: getSuc(), usuario: getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            if (data.mensaje === "Ok") {
                $("#msg").html("Ok");    
                $("#"+Fx).val("");
                getFallas($("#lote").val());
            } else {
                $("#msg").html("Error al registrar falla " +data);   
            }                 
        },
        error: function (e) {                 
           $("#msg").html(">Error al registrar falla:  "  + e);   
           errorMsg(">Error al registrar falla:  " + e, 10000);
        }
    }); 
}

function getFallasHijo(lote){
    falla_del_hijo = true;
    getFallas(lote);
}

function getFallas(lote){
   
  var codigo = $("#codigo").val(); 
    $.ajax({
        type: "POST",
        url: "compras/Fraccionar.class.php",
        data: {action: "getFallas", suc: getSuc(), usuario: getNick(),codigo:codigo,lote:lote},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $(".row_tipo_falla").remove();
        },
        success: function (data) {  
            var del_falla = $("#del_falla").val();
            for(var i in data){
                var nro_falla = data[i].nro_falla;
                var tipo_falla = data[i].tipo_falla;
                var mts = data[i].mts;
                $("#fallas").append("<tr id='falla_"+nro_falla+"' class='row_tipo_falla'><td class='itemc tipo'>"+tipo_falla+"</td><td class='itemc mts_falla'>"+mts+"</td><td class='itemc' style='display:"+del_falla+";width:30px;cursor;pointer' ><img src='img/trash_mini.png' onclick='delFalla("+nro_falla+")'></td></tr>");
            }
            $("#msg").html("");
        },
        error: function (e) {                 
            $("#msg").html("Error alobtener fallas  " + e);   
            errorMsg("Error alobtener fallas  " + e, 10000);
        }
    }); 
}


function delFalla(nro_falla){
   var tipo = $("#falla_"+nro_falla).find(".tipo").text();
   var mts = $("#falla_"+nro_falla).find(".mts_falla").text();
   var c = confirm("Confirma que desea elimnar esta falla "+tipo+" en "+mts+" ?");
   if(c){
      $.post( "compras/Fraccionar.class.php",{ action: "eliminarFalla",nro_falla:nro_falla,usuario:getNick()}, function( data ) {  
         getFallas($("#lote").val());
      });
   }
}
function leerDatosBalanza(id){ console.log("ID: "+id+"");
    intentos++;          
    var ip_domain = $("#balanza").val();
     
    $.ajax({
        url : "http://"+ip_domain+"/serial/Indicador_LR22.php",
        dataType:"jsonp",
        jsonp:"mycallback", 
        beforeSend: function () {
           $("#"+id).val("");            
           $("#msg_trab").html("<img src='img/loading_fast.gif' width='20' height='20' > &nbsp;&nbsp;<label style='color:black;font-size:14px'>Conectado con: "+ip_domain+"...  </label>    "+intentos);  
        }, 
        success:function(data){
            var dato = data.peso;
            var estado = data.estado; 
            
            //$("#"+id).val(dato);  
             
            if(estado == "estable"){
                if(dato == ""){
                    if(intentos < 4){
                       leerDatosBalanza(id);
                    }else{
                      $("#msg_trab").html("<img src='img/Circle_Red.png' width='20' height='20' style='margin-bottom: -3px'>&nbsp;<label style='color:red;font-size:18px'>ERROR... </label>No se puede conectar con la balanza...");
                      intentos = 0;
                    }
                }else{
                  $("#msg_trab").html("<img src='img/Circle_Green.png' width='20' height='20' style='margin-bottom: -3px' >&nbsp;&nbsp;<label style='color:green;font-size:20px'>Estable</label>");
                  intentos = 0;
                  $("#"+id).val(dato);  
                  if(id == "tara"){
                      calcTara();
                  }else{
                      calcularGramaje(); 
                  }
                } 

            }else{
               $("#msg_trab").html("<img src='img/Circle_Red.png' width='20' height='20' style='margin-bottom: -3px'>&nbsp;&nbsp;<label style='color:red;font-size:20px'>Inestable</label>");
               intentos = 0;
            }
        }
    });                
}   

function buscarPoliticaDistribucion(){
    procesados = 0;
    var lote = $("#lote").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getPoliticaDistribucion", lote: lote},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) { 
            $(".fila_cortes").remove();
            if(data.length > 0){
                $("table#corteSinOrdenFrac").hide();
                $("table#cortes").show();
                
                for (var i in data) { 
                    var id_orden = data[i].id_orden;
                    var color = data[i].color;
                    var cantidad = data[i].cantidad; 
                    var presentacion = data[i].presentacion; 
                    var suc = data[i].suc; 
                    var obs = data[i].obs;
                    if(presentacion == "Pieza"){
                        presentacion = "Tablita";
                    }else{
                        presentacion = "Tubo";
                    }
                        
                    $("#cortes").append("<tr class='fila_cortes fila_"+i+"' > <td class='lotes'>"+cantidad+"</td><td class='lotes "+presentacion+"'>"+presentacion+"</td><td class='lotes'><span class='suc_span'>"+suc+"</span></td></tr>");
                    if(obs.length > 3 ){
                        $("#cortes").append("<tr class='fila_"+i+"' > <td  colspan='3' class='fila_obs'>"+obs+"</td></tr>");
                    }                        
                } 
                
                medicionManualOrden();
                
                var stock_actual = parseFloat($("#stock").val().replace(".","").replace(",","."));   
                if(stock_actual > 0){
                    $("#area_frac").fadeIn(function(){
                        $("#fraccionados").fadeIn();    
                        $(".scrollButtons").fadeIn();
                        getListaHijos();
                    }); 
                }else{
                    $("#fraccionados").fadeIn();    
                    $(".scrollButtons").fadeIn();
                    getListaHijos();
                }
                $("#msg").html(""); 
            }else{
                $("table#cortes").hide();
                $("table#corteSinOrdenFrac").show();
                $("#area_frac").fadeIn(function(){
                    $("#fraccionados").fadeIn();    
                    $(".scrollButtons").fadeIn();
                    getListaHijos();
                });
            }
        }
    });
}

function showHideChilds(bool){
    $("#fraccionados").toggle(bool);
    $(".scrollButtons").toggle(bool);
} 
function moveScroll(sign){
    $('#work_area').animate({
       scrollTop: ""+sign+"=100px"
    });
}
function getListaHijos(){  
    
    var lote = $("#lote").val();
     
    $.ajax({
        type: "POST",
        url: "compras/Fraccionar.class.php",
        data: {"action": "getFraccionados", lote: lote},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $(".procesados").remove();
            $("#msg_trab").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) { 
            $(".selected").removeClass("selected");
            var setGrRef = false;
            for (var i in data) { 
                var hijo = data[i].lote;
                var suc_destino = data[i].suc_destino; 
                var cantidad = data[i].cantidad; 
                var presentacion = data[i].presentacion;  
                var usuario = data[i].usuario;
                var gramaje = data[i].gramaje;
                
                if(!setGrRef && (usuario === getNick())){
                    $("#gramaje_ref").val(gramaje),
                    setGrRef = true;
                }
                
                if(presentacion === "Pieza"){
                    presentacion = "Tablita";
                }else{
                    presentacion = "Tubo";
                }
                $("#tr_total_fracc").before("<tr class='procesados' data-gramaje='"+gramaje+"' data-usuario='"+usuario+"' ><td class='lotes hijo' onclick='getFallasHijo("+hijo+")' >"+hijo+"</td> <td class='lotes cant_frac'>"+cantidad+"</td><td class='lotes'>"+presentacion+"</td><td class='lotes'>"+suc_destino+"</td><td class='lotes imp_"+hijo+"'> <input id='pb_"+hijo+"' type='button' value='Imprimir' onclick='imprimir("+hijo+")' data-print='1' > </td></tr>");
                procesados++;
            } 
            var orden = $(".fila_cortes").length;
            var j = orden -1;
            if(procesados >= orden){
               $(".fila_"+j).addClass("passed"); 
            }else{
               $(".fila_"+procesados).addClass("selected");
               medicionManualOrden();
            }
            totalizar();
            $("#msg_trab").html(""); 
        }
    });
     
}

function medicionLibre(){
    setMetrador(true);
    setTimeout("setMetrador(true)",500);
    setTimeout("setMetrador(true)",1000);    
}

function medicionManualOrden(){
    setMetrador(false);
    setTimeout("setMetrador(false)",500);
    setTimeout("setMetrador(false)",1000);
}
function separarBotones(){
    $("td[class^='lotes imp_']:even").css("text-align","right");
    $("td[class^='lotes imp_']:odd").css("text-align","left");
}
function cambiarBalanza(){
  var ip = $("#balanza").val();   
  setCookie("balanza",ip,365);
}
function cambiarMetrador(){
  var ip = $("#metrador").val();   
  setCookie("metrador",ip,365);
  puertos();  
}
function cambiarImpresora(){
    var printer = $("#printers").val();
    setCookie("printer",printer,365);
}
function setDirectPrint(){
    var checked = $("#silent_print").is(":checked");
    setCookie("silent_print",checked,365);
}
function totalizar(){
   var total = 0;
   $(".cant_frac").each(function(){
       var v = parseFloat($(this).text());
       total +=v;
   });
   total = redondear(total,2);
   $("#total_fraccionados").html(total);
   separarBotones();
}
Number.prototype.between = function(a, b) {
  var inclusive = true;
  var min = Math.min(a, b), max = Math.max(a, b);
  return inclusive ? this >= min && this <= max : this > min && this < max;
};

Number.prototype.min = function(v){          
    return this - (this * v / 100);
};
Number.prototype.max = function(v){          
    return this + (this * v / 100);
};
function checkearCotizDolar(){
      
    $.ajax({
        type: "POST",
        url: "finanzas/CotizacionesContables.class.php",
        data: {action: "getCotizContable", "moneda": "U$"},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {  
            if(data.length > 0){
               cotizacion_dolar = true;                                 
            }else{
               cotizacion_dolar = false;
            }
            $("#msg").html("");           
        },
        error: function (e) {                 
           $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
            errorMsg("Ocurrio un error en la comunicacion con el Servidor...  " + e, 10000);
        }
    }); 
    
    
}
function imprimir(lote){            
    var printed = parseInt($("#pb_"+lote).attr("data-print"));
    if(printed > 0){
        var c = confirm("Este Lote ya se imprimio antes esta seguro de que desea REIMPRIMIR?");
        if(!c){
            return;
        }
    }
    var printer = $("#printers").val();
    var silent_print = $("#silent_print").is(":checked");
    if(typeof( jsPrintSetup ) == "object") {  
        jsPrintSetup.setSilentPrint(silent_print);
    }   
    var etiqueta_cuidados = $("#etiquetaCuidado").is(":checked");
    var auto_close_window = $("#auto_close_window").is(":checked");
    
    var random = parseInt(Math.random() * 1000);
    
    var suc = getSuc();
    var usuario = getNick();       
    var url = "barcodegen/BarcodePrinter.class.php?codes="+lote+"&usuario="+usuario+"&suc="+getSuc()+"&moneda=G$&printer="+printer+"&silent_print="+silent_print+"&buscar_destino=true&etiqueta_cuidados="+etiqueta_cuidados+"&auto_close_window="+auto_close_window+"&random="+random;
    var title = "Impresion de Codigos de Barras";
    var params = "width=800,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
     
    if(!printing){        
        printing = window.open(url,title,params);
    }else{
        printing.close();
        printing = window.open(url,title,params);
    } 
    printed++;
    $("#pb_"+lote).attr("data-print",printed);
}

function  imprimirEtiquetaCuidados(){
    var tamanho = $("select#tamanho option:selected").text();
    var lote = $("#lote").val();
    var printer = $("#printers").val();
    var silent_print = $("#silent_print").is(":checked");
    if(typeof( jsPrintSetup ) == "object") {  
        jsPrintSetup.setSilentPrint(silent_print);
    }
     
    var suc = getSuc();
    var usuario = getNick();
       
    var url = "barcodegen/EtiquetaCuidados.class.php?codes="+lote+"&usuario="+usuario+"&printer="+printer+"&silent_print="+silent_print+"&etiqueta=etiqueta_6x4";
    var title = "Impresion de Codigos de Barras";
    var params = "width=800,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    if(!printing){        
        printing = window.open(url,title,params);
    }else{
        printing.close();
        printing = window.open(url,title,params);
    } 
    
}

function buscarStockComprometido(){
    var lote = $("#lote").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "buscarStockComprometido", lote: lote,suc:getSuc(),"incluir_reservas":"No","incluir_pedidos":"No","incluir_orden_proc":"No"},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("Buscando stock comprometido!<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#stock_comprometido").html("");
            $("#stock_compr").html("");
        },
        success: function (data) {   
            var comprometido = 0;
            var st_comp = "<table class='stock_comprometido' border='1'>";
            st_comp+="";
            if(data.length > 0){
                var st_comp = "<table class='tabla_stock_comprometido' border='1'>";
                st_comp+="<tr><th colspan='6' style='background:orange;'>Stock Comprometido</th><th style='text-align:center;background:white' onclick='closeStockComp()'>X</th></tr>";
                st_comp+="<tr class='titulo' style='font-size:10px'><th>Doc</th><th>N�</th><th>Usuario</th><th>Fecha</th><th>Suc</th><th>Estado</th><th>Cantidad</th><tr>";
                for (var i in data) {
                    var tipodoc = data[i].TipoDocumento;
                    var nro = data[i].Nro;
                    var usuario_ = data[i].usuario;
                    var fecha = data[i].fecha;
                    var suc = data[i].suc;
                    var estado = data[i].estado;
                    var cantidad = data[i].cantidad;
                    comprometido += parseFloat(cantidad);
                    st_comp+="<tr style='background:white'><td>"+tipodoc+"</td><td>"+nro+"</td><td>"+usuario_+"</td><td>"+fecha+"</td><td class='itemc'>"+suc+"</td><td>"+estado+"</td><td class='num'>"+cantidad+"</td></tr>";
                }   
                
                $("#stock_comprometido").html(st_comp);
                $("#area_trab").fadeOut();
                $("#stock_comprometido").fadeIn();
                $("#msg").html("No se puede fraccionar, vea tabla de Stock Comprometido"); 
            }else{
                $("#msg").html(""); 
                $("#area_trab").fadeIn();
            }
            
        }
    });     
} 
function closeStockComp(){
    $("#stock_comprometido").html("");
    $("#stock_comprometido").fadeOut();
}
function configurePrinter(){
    if(typeof( jsPrintSetup ) == "object") {  
        if(jsPrintSetup.getPrintersList() == null){
            alert("Sr. Usuario haga clic en el boton 'Permitir' que se encuentra en la parte superior derecha, y recargue la pagina.");
            return;
        } 
        var printer_list = (jsPrintSetup.getPrintersList()).split(",");
        $.each(printer_list,function(number){
           $("#printers").append('<option>'+printer_list[number]+'</option>');
        });      
        jsPrintSetup.definePaperSize(100, 100, "Etiqueta_Marijoa_6x4", "Etiqueta_Marijoa_6x4", "Etiqueta_Marijoa_6x4", 60, 40, jsPrintSetup.kPaperSizeMillimeters);  
      
        //jsPrintSetup.definePaperSize(101, 101, "Custom", "Etiqueta_Marijoa 10x5", "Etiqueta Marijoa 10x5", 100, 50, jsPrintSetup.kPaperSizeMillimeters);  
        
    /*
        jsPrintSetup.setOption('marginTop', -4);
        jsPrintSetup.setOption('marginBottom', 0);
        jsPrintSetup.setOption('marginLeft', 16);
        jsPrintSetup.setOption('marginRight', 0);*/
        jsPrintSetup.setPaperSizeData(100);
      
        var printer = getCookie("printer").sesion;
        $("#printers").val(printer);

        var sp =  getCookie("silent_print").sesion ;
        if(sp == "true"){
           $("#silent_print").prop("checked",true); 
        }else{
           $("#silent_print").prop("checked",false); 
        }

        $("#silent_print").click(function(){
          var print_silent = $(this).is(":checked");           
          setDirectPrint();
          jsPrintSetup.setSilentPrint(print_silent);
        });
   
    }else{       
       //alert("Este navegador necesita de un Plug in 'js print setup' para mejor funcionamiento, se abrira una ventana para instalarlo presione permitir, posteriormente reinicie su navegador y vuelva a intentarlo, si el problema persiste contacte con el administrador del sistema :D");
       //var jsps = "https://192.168.2.252/tools/pc_esscentials/navegadores/moz_addon/js_print_setup-0.9.5.1-fx.xpi";
       //window.open(jsps,'_blank', 'width=500,height=160');       
    } 
}

// Obtiene la lista de puertos
function puertos(){
    var mIP;
    $("#puerto").empty();
    if(Object.keys(getCookie("metrador")).length > 0){
        mIP = getCookie("metrador").sesion;
        var cookieMetrador = getCookie("metrador").sesion;
        var existeMetrador = false;
        $("select#metrador option").each(function(){
          if($(this).text() == cookieMetrador){
            existeMetrador = true;
          }
        });
        
        if(!existeMetrador){
          $("<option/>",{"text":cookieMetrador,"value":cookieMetrador}).appendTo("select#metrador")
        }
    }else{
        mIP = $("#metrador").val();
    }
    
    $.get("http://"+mIP+"/serial/CP20.php",{"action":"getPorts"},function(data){
        if(Object.keys(data).length>0){
          $.each(data,function(key, value){
              if(value === 'ttyUSB0'){
				  $("<option/>",{"value":value,"text":key, "selected":"selected"}).appendTo("#puerto");
              }else{
                  $("<option/>",{"value":value,"text":key}).appendTo("#puerto");
              }
          });
        }else{
            $("<option/>",{"value":"error","text":"Error "+mIP}).appendTo("#puerto");
        }
      },"jsonp").fail(function(){
        $("<option/>",{"value":"error","text":"Error "+mIP}).appendTo("#puerto");
      });
}
 
function getPoliticaCortesXCodigo(){
    var codigo = $("#codigo").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {action: "getPoliticaCortesXCodigo", "codigo": codigo, suc: getSuc(), usuario: getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("[class^=polit_]").html("<img src='img/important.png' width='12px' height='12px' >");            
        },
        success: function (data) {   
            if(data.length > 0){
                data.forEach(function(e){
                   var suc = e.suc; 
                   var pol = e.politica;
                   $(".polit_"+suc).html(pol);                          
                });
            }
        },
        error: function (e) {   
            errorMsg("Error al obtener Politicas de Cortes:  " + e, 10000);
        }
    }); 
}


function fraccionarComoSupervisor(){
    //$("#verificar").offset({top:0 ,  left:0});
    var w = window.screen.width  / 2;
    var h = window.screen.height  / 2;
    
    var largo = $("#verificar").width();
    var alto = $("#verificar").height()  ;
    
    $("#verificar").slideDown(); 
    
    // $("#verificar").offset({top:h - (alto * 2) ,  left:w - (largo / 2)}).slideDown(); 
    
    $("#passw").focus();
    
    $("#passw").keyup(function (e) {
        if (e.keyCode == 13) {  
            autorizarFraccionamiento();
        } 
    });
}

function autorizarFraccionamiento(){
   var passw = $("#passw").val();
   var usuario =  getNick();
   var suc = getSuc();
   
    $.ajax({
        type: "POST",
        url: "productos/Ajustes.class.php",
        data: {"action": "checkPasswordAndTrustee", "usuario": usuario, "passw": passw,suc:suc},
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg_pw").html("<img src='img/loading_fast.gif' width='20px' height='20px' >");                      
        },
        complete: function(objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText); 
                if(result != "Permiso denegado"){
                    $("#verificar").slideUp();
                    $("#passw").val("");  
                    supervisor = true;
                    autorizado_por = result; 
                    infoMsg("Autorizado! Puede Proceder al Fraccionamiento",8000);
                    $("#fraccionar").removeAttr("disabled");
                }else{
                   $("#msg_pw").addClass("errorgrave"); 
                   $("#msg_pw").html(result);
                }
            }
        },
        error: function() {
            $("#msg_pw").addClass("errorgrave");
            $("#msg_pw").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });     
}