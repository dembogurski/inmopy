var decimales = 0;
var cant_articulos = 0;
var fila_art = 0;

var id = 0;
var pack_id = 0;        

var stockComprometido = false;
var PORCENTAJE_PERMITIDO = 5; //5%
var PORCENTAJE_AJUSTE_PERMITIDO = 20; //10% si > 10 sino 20%      

var current_keypad_id = "";
var usuarios = new Array("douglas","fabiana");

var colores = ["#c0392b","#fbc531","#ffd32a","#3498db","#20bf6b","#6f1abd"];

var lotes_generados = new Array();     

var is_ref = false;
  
function configurar(){
   $("#lote").focus();    
   $("#lote").change(function(){
        buscarLote();
   });
   $(".numeric").change(function(){
       var v = $(this).val();
       if(isNaN(v)){
           $(this).val(0);
       }
   });
 
    setHotKeyArticulo();
     $("#ui_articulos").draggable();
    getPorcentajeAsingnaciones();
 }


function getPorcentajeAsingnaciones(){
    $(".porc_asign").each(function(){
        var codigo_fab = $(this).attr("data-codigo");
        var nro_emis = $(this).attr("data-nro_emis");
        var id_det = $(this).attr("data-id_det");
        var cantidad_fab = $(this).attr("data-cant");
        if(nro_emis !== ""){
           getPorcentajeAsingnacionXLinea(codigo_fab,nro_emis,id_det,cantidad_fab);
        }
    });   
}
 
function getPorcentajeAsingnacionXLinea(codigo_fab,nro_emis,id_det,cantidad_fab){
    $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {action: "getPorcentajeAsingnacionXLinea", suc: getSuc(), usuario: getNick(),codigo_fab:codigo_fab,nro_emis:nro_emis,id_det:id_det,cantidad_fab:cantidad_fab},
        async: true,
        dataType: "json",
        beforeSend: function () {
           // $("#porc_asign_"+nro_emis+"_"+id_det+"").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {  
            if(data.length > 0){
                var id_prod_ter = null;
                var tabla = "<table class='tabla_porc_asign' border='0'>";  
                for (var i in data) { // No mas de una por Cliente por Usuario
                   var MateriaPrima = data[i].MateriaPrima;   
                   var PorcAsignado = data[i].PorcAsignado;  
                   var ColorCalc = Math.floor((PorcAsignado / 20)  );
                   id_prod_ter = data[i].id_prod_ter;  
                   if(ColorCalc > 5){ ColorCalc= 5;}
                   var fondo = colores[ColorCalc];
                   tabla+="<tr><td class='cod_mat_pri' title='"+PorcAsignado+"%' onclick='getPorcentajeAsingnaciones()' >"+MateriaPrima+"</td><td style='padding:2px 0 2px 0;height:20px' title='"+PorcAsignado+"%'><div style='border:solid black 1px;witdh:100%;height:40%;margin-right:1px'><div style='width:"+PorcAsignado+"%;background-color:"+fondo+";height:100%' >&nbsp;</div><div></td></tr>"; 
                } 
                tabla+"</table>">
                $("#porc_asign_"+nro_emis+"_"+id_det+"").html(tabla);
                if(id_prod_ter !== null){
                    $("#proc_"+nro_emis+"_"+id_det+"").val("Procesado ["+id_prod_ter+"]");
                    $("#proc_"+nro_emis+"_"+id_det+"").attr("data-id_prod_ter",id_prod_ter);
                }else{
                    $("#proc_"+nro_emis+"_"+id_det+"").attr("data-id_prod_ter","0");
                }
            }
        },
        error: function (e) {                 
            $("#msg").html("Error al xxx cuenta:  " + e);   
            errorMsg("Error al xxx cuenta:  " + e, 10000);
        }
    }); 
}

function cerrarPopup(){
    $("#confec_background").slideUp();
    $("div#imgPopUpConfec").hide();
}
function procesarLotes(codigo,nro_emision,nro_orden,id_det){
        
        //var medida = $("#asigned_"+codigo+"-"+nro_emision).prev().prev().html();
        //$(".span_medida").html(medida);
        
        //$("#medida").val(medida);
        
        $("#nro_emision").val(nro_emision);
        $(".nro_emision_area_confec").html(nro_emision);        
        $("#nro_orden").val(nro_orden);
        //$(".nro_emision").html(nro_emision);
        $("#codigo_ref").val(codigo);
        $(".articulo").html(codigo);
        $("#nro_orden_id_det").val(id_det);
        
        $("#cant_fabricar").val($(".fabricar_"+nro_emision).html());
        
        
        var id_prod_ter = $("#proc_"+nro_emision+"_"+id_det+"").attr("data-id_prod_ter");
        $("#id_prod_ter").val(id_prod_ter);
     
        $("#tipo_design").val(   $("#tr_"+nro_emision+"_"+codigo+"").attr("data-tipo"));
    
        var anchor = $(".codigo_ped_"+nro_orden).attr("data-anchor");
        $("#anchor").val(anchor);
        
        var img_ref = $(".imagen_"+nro_orden+"_"+id_det).attr("src");
        
        $("#img_ref").attr("src",img_ref);       
        
        
        /*
        var w = $(window).width();
        var asw = $("#confec_popup").width();
        var esii = (w / 2) - (asw / 2);
        $("#confec_popup").offset({top:50,left: esii });*/
        $(".confec_form input[type='text']").val("");
        $("#lote").focus();     
        $("#confec_background").fadeIn(); 
        $("#codigo_om").html("");
        listarLotesAsignados(codigo,nro_emision,id_det);
}
 
function listarLotesAsignados(codigo,nro_emision,nro_orden_id_det){
     
    $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {"action": "listarLotesAsignados", nro_emision: nro_emision,codigo:codigo,nro_orden_id_det:nro_orden_id_det,usuario:getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $(".fila_asign").remove();
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            for (var i in data) { 
                var codigo = data[i].codigo;
                var lote = data[i].lote;
                var img = data[i].img;
                var descrip = data[i].descrip;   
                var color = data[i].color;
                var design = data[i].design;
                var cant_lote = data[i].cant_lote;
                var cortes = data[i].cortes;
                 
                var saldo = data[i].saldo!=null?data[i].saldo:"";
                 
                var medida  = data[i].largo != null?data[i].largo:"";
                 
                var  fila_orig = data[i].fila_orig;
                 
                 
                  
                var checked = $("#detailed").is(":checked");
                var mostrar = " style='display:none'"
                if(fila_orig == 1){
                    mostrar = "";
                }else if(fila_orig == 0 && checked ){
                    mostrar = "";
                }else{
                    mostrar = " style='display:none'"
                }  
                
                var proc = "";
                if(cortes > 0){
                    proc = " procesado";
                }
                
                $("#detalle_asign").append("<tr class='fila_asign fila_"+nro_emision+"_"+lote+" lote_"+lote+""+proc+"' "+mostrar+" ><td class='item codigo'>"+codigo+"</td><td data-img='"+img+"' class='item lote_confec' onclick='mostrarImagen($(this))'>"+lote+"</td><td  class='item descrip'>"+descrip+"</td><td  class='item color'>"+color+"</td><td  class='item design'>"+design+"</td><td  class='num stock'>"+cant_lote+"</td><td  class='num medida'>"+medida+"</td><td  class='num cortes'>"+cortes+"</td> <td id='saldo_lote_"+lote+"' class='num saldos'>"+saldo+"</td> <td class='msg_"+lote+"' > </td><td class='itemc'> </td></tr>");       
            }   
            $("#msg").html(""); 
            checkProgress();
            
        }
    });
}
function mostrarImagen(target){
    var baseURL = $("#images_url").val();
    var img = target.data('img');
    $("div#imgPopUpConfecContainer img.imagen").prop("src",baseURL+'/'+img+'.jpg');
    $("div#imgPopUpConfec").show();
}
function noImage(Obj){
    Obj.prop("src",$("#images_url").val()+"/0/0.jpg");
}
function cerrarImgPopUp(){
    $("div#imgPopUpConfec").hide();
}
function borrarCorte(nro_emision,lote){
    alert("Desabilitado temporalmente");
    /*
    $.ajax({
        type: "POST",
        url: "produccion/Fabrica.class.php",
        data: {"action": "borrarCorte", "usuario": getNick(), "nro_emision": nro_emision,lote:lote},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);
                if(result == "Ok"){
                    var codigo_ref = $("#codigo_ref" ).val();
                    listarLotesAsignados(codigo_ref,nro_emision);
                }else{
                    alert("Ocurrio un error en la comunicacion con el Servidor...");
                }
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
    
    */
}
function mostrarOcultarDetalles(){ 
    var codigo_ref = $("#codigo_ref").val();    
    var nro_emision = $("#nro_emision").val();
    var nro_orden_id_det = $("#nro_orden_id_det").val();
    listarLotesAsignados(codigo_ref,nro_emision,nro_orden_id_det);
}
/*
function buscarResumenAsignados(nro_orden,nro_emision,codigo){
    
    $.ajax({
        type: "POST",
        url: "produccion/OrdenFabric.class.php",
        data: {"action": "buscarResumenAsignados", nro_emision: nro_emision,codigo:codigo},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#asigned_"+codigo+"-"+nro_orden).html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            var asignado = data.asignado;
            $("#asigned_"+codigo+"-"+nro_emision).html(asignado); 
            var req = parseFloat( $("#asigned_"+codigo+"-"+nro_emision).prev().html().replace(".",""));
            var porc = req * PORCENTAJE_PERMITIDO / 100;
            var min = req - porc;
            var max = req + porc;

            if(asignado > min){
               $("#msg").html("Asignacion completa. <img src='img/ok.png'>");
               $("#asigned_"+codigo+"-"+nro_orden).addClass("correcto");
            }else{
              $("#msg").html("");  
              $("#asigned_"+codigo+"-"+nro_orden).removeClass("correcto");
            }
        }
    });
} */
 
function showKeyPad(id){
    showRelative(id,buscarLote,false);
}
function showKeyPadCortes(id){
    showRelative(id,calcAjuste,false);
}
function showKeyPadSaldo(id){
    current_keypad_id = id;
    showRelative(id,calcAjuste,false);
}
function showKeyPadOM(id){
    showRelative(id);
}

function calcAjuste(){
    //var descrip = $("#descrip").val();
     
    var stock = parseFloat($("#stock").val());
    if(stock <= 10){
        PORCENTAJE_AJUSTE_PERMITIDO = 20;
    }else{
        PORCENTAJE_AJUSTE_PERMITIDO = 10;
    }
    
    var cortes = parseFloat($("#cortes").val());
    if(isNaN(cortes)){
        $("#cortes").val("0");
        cortes = 0;
    }
    var medida = parseFloat($(".span_medida").html());
    
    var calc = cortes *  medida;
    $("#calc").html(calc.toFixed(2));
    
     
    var cant_om =  parseFloat( $("#cant_om").val());
    if(isNaN(cant_om)){
        cant_om = 0;
    }
    var diff = stock - (calc + cant_om  );
    
    console.log("stock "+stock +"  cant_om "+cant_om+"  calc " +calc +"    "  );
    
    diff = (diff).toFixed(2);
    $("#diff").val(diff);   
    
    if(cortes > 0){
       $("#agregar").prop("disabled",false);
    }else{
       $("#agregar").prop("disabled",true);
    }
    
     
}
 
 
function agregarCortes(){
         
        var nro_emision = $("#nro_emision").val();  
        var nro_orden = $("#nro_orden").val();
        var id_det = $("#nro_orden_id_det").val();
        var codigo = $("#codigo").val();  
        var lote = $("#lote").val();       
        var cortes = parseFloat($("#cortes").val());
        var medida = parseFloat($("#medida").val());
        
        var ajuste = parseFloat( $("#diff").val() );
        var cantidad_descontar =  parseFloat( cortes * medida  );
        
        var codigo_ref = $("#codigo_ref").val();
        var stock = $("#stock").val();
         

        if(isNaN(ajuste)){
            alert("Cargue un saldo o Saldo de Retazo si existe o 0 si es corte exacto");
            return;
        }            
         
        $.ajax({
            type: "POST",
            url: "produccion/Fabrica.class.php",
            data: {"action": "agregarCortes",usuario:getNick(),codigo_ref:codigo_ref, nro_emision: nro_emision,nro_orden:nro_orden,id_det:id_det,codigo:codigo,lote:lote,stock:stock,cantidad_descontar:cantidad_descontar,cortes:cortes,medida:medida,ajuste:ajuste,suc:getSuc(),is_ref:is_ref},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                 if(data.estado === "Ok"){
                     $("#agregar").prop("disabled",true);
                     $(".fila_"+nro_emision+"_"+lote).removeClass("encontrado");
                     $(".fila_"+nro_emision+"_"+lote).addClass("procesado");
                     $(".msg_"+lote).prev().html(ajuste);    
                      
                     $("#calc").html(""); 
                      
                     $(".msg_"+lote).prev().prev().prev().prev().html(cortes);
                     
                     $(".msg_"+lote).html("<img src='img/ok.png' width='16px' height='16px' >");
                     $("#msg").html("Ok");
                     $(".confec_form input[type=text]").val("");
                     $("#lote").focus();
                     $("#codigo_om").html("");
                     var codigo_ref = $("#codigo_ref").val();      
                     var id_det = $("#nro_orden_id_det").val(); 
                     listarLotesAsignados(codigo_ref,nro_emision,id_det);
                 }else{                                 
                    $("#msg").html(data);
                 }   
            }
        });    


    function newFunction() {
        return $("#codigo").val();
    }
}

function buscarLote(){
   $("#warning").html(""); 
   $("#stockreal, #ajuste, #motivo").val('');
   $("#ajustar").attr('Disabled','Disabled')
   var lote = $("#lote").val();
   
   $(".encontrado").removeClass("encontrado");
   if($(".lote_"+lote).hasClass("procesado")){
       alert("Este lote ya ha sido procesado");
   }else{
        if($(".lote_"+lote).length > 0){
            if($(".lote_"+lote).hasClass("procesado")){
                alert("Este lote ya ha sido procesado");
            }else{
            
                var codigo = $(".lote_"+lote).find(".codigo").html();
                $(".lote_"+lote).addClass("encontrado");
                $("#codigo").val( codigo );
                $("#stock").val( $(".lote_"+lote).find(".stock").html());
                $("#descrip").val( $(".lote_"+lote).find(".descrip").html());
                $("#design").val( $(".lote_"+lote).find(".design").html());
                $("#color").val( $(".lote_"+lote).find(".color").html());
                $("#msg").removeClass("noencontrado");
                var rowpos = $(".lote_"+lote).position();
                $('#container_design').scrollTop(rowpos.top-30);

                buscarMedida(codigo); 
            }
        }else{        
            $(".lote_"+lote).removeClass("encontrado");
            $("#msg").addClass("noencontrado");
            $("#msg").html("Lote no encontrado o no asignado.");       
            $(".confec_form input[type=text]:not('#lote')").val("");
            $("#lote").focus();
            $("#lote").select();
        }
        $("#cortes").focus();   
         
   }
}
function buscarMedida(codigo_mat_prima){
    var articulo_fabricar =$(".articulo").html();
    $.ajax({
        type: "POST",
        url: "produccion/Fabrica.class.php",
        data: {"action": "buscarMedida",  articulo_fabricar:articulo_fabricar,codigo_mat_prima:codigo_mat_prima,usuario:getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");     
        },
        success: function (data) {               
            var cantidad = data[0].cantidad; 
            $("#medida").val(cantidad);
            var cant = parseFloat(cantidad);
            $(".span_medida").html(cant);
            
            var rendimiento = parseFloat(data[0].rendimiento);
            $("#rendimiento").val(rendimiento);
            
            var ref = data[0].ref; 
            is_ref = ref;
            if(ref === "false"){
                var stock = parseFloat($("#stock").val());
                var fabricar = parseFloat($("#cant_fabricar").val());
                var medida = parseFloat($("#medida").val());
                var cortes = fabricar;    
                
                var ajuste = parseFloat(stock - (cortes * medida));
                $("#cortes").val(cortes.toFixed(2));
                $("#diff").val(ajuste.toFixed(2)); 
                $("#agregar").removeAttr("disabled");
                $(".span_ajuste").html("Saldo:");
            }else{
                $(".span_ajuste").html("Ajuste:");
            }        
            calcTotalArtOM();
            $("#msg").html(""); 
        }
    });
    
}
 

function buscarArticulo(){
    var articulo_fabricar = $("#codigo_ref").val();
    var codigo_mat_prima =  $("#codigo").val();
     
    var cat = 1;
    fila_art = 0;
    
    if(codigo_mat_prima != ""){
        $.ajax({
            type: "POST",
            url: "produccion/Fabrica.class.php",
            data: {"action": "buscarArticulosOtraMedida", "codigo_mat_prima": codigo_mat_prima,articulo_fabricar:articulo_fabricar,"cat":cat},
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function(data) { 

                if(data.length > 0){
                    limpiarListaArticulos();
                    var k = 0;
                    for(var i in data){        
                        k++;
                        var codigo =  (data[i].codigo).toString().toUpperCase();
                        var sector = data[i].sector;
                        var descrip = data[i].descrip; 
                        var precio =  parseFloat(  (data[i].precio) ).format(0, 3, '.', ',');

                        var produc_largo = parseFloat(data[i].produc_largo).format(2, 3, '.', ',');
                        var produc_ancho = parseFloat(data[i].produc_ancho).format(2, 3, '.', ',');
                        var produc_alto = parseFloat(data[i].produc_alto).format(2, 3, '.', ','); 

                        //var especificaciones = data[i].especificaciones;
                        var um = data[i].um;  

                        var medidas = produc_largo +" x "+produc_ancho; 

                        $("#lista_articulos") .append("<tr style='font-size:18px' class='tr_art_data fila_art_"+i+"' data-sector="+sector+" data-ancho="+produc_ancho+" data-largo="+produc_largo+" data-precio="+precio+" data-um="+um+"><td style='height:30px' class='itemc clicable_art'><span class='codigo' >"+codigo+"</span></td>\n\
                        </td><td class='item clicable_art'><span class='NombreComercial'>"+descrip+"</span></td> \n\
                        <td class='itemc clicable_art'>"+medidas+"</td></tr>");
                        cant_articulos = k;
                    }  
                    inicializarCursores("clicable_art"); 
                    $("#ui_articulos").fadeIn();
                    $(".tr_art_data").click(function(){                            
                          seleccionarArticulo(this); 
                    });
                    $("#msg").html(""); 
                }else{
                    $("#msg").html("Sin resultados..."); 
                }
            }
        });
    }
     
} 
function limpiarListaArticulos(){    
    $(".tr_art_data").each(function () {   
       $(this).remove();
    });    
} 
 
function setDefaultDataNextFlag(){
    data_next_time_flag = true;
}
function setHotKeyArticulo(){
     
    $("#codigo_om").keydown(function(e) {
        
        var tecla = e.keyCode;  console.log(tecla);  
        if (tecla == 38) {
            (fila_art == 0) ? fila_art = cant_articulos-1 : fila_art--;
            selectRowArt(fila_art);
        }
        if (tecla == 40) {
            (fila_art == cant_articulos-1) ? fila_art = 0 : fila_art++;
            selectRowArt(fila_art);
        }
        if (tecla != 38 && tecla != 40 && tecla != 13) {
            buscarArticulo();
            escribiendo = true;            
        }
        if (tecla == 13) {
           if(!escribiendo){ 
             seleccionarArticulo(".fila_art_"+fila_art); 
           }else{
               setTimeout("escribiendo = false;",1000);
           }
        }
        if (tecla == 116) { // F5
            e.preventDefault(); 
        } 
          
    });
}
function selectRowArt(row) {
    $(".art_selected").removeClass("art_selected");
    $(".fila_art_" + row).addClass("art_selected");
    $(".cursor").remove();
    $($(".fila_art_" + row + " td").get(2)).append("<img class='cursor' src='img/l_arrow.png' width='18px' height='10px'>");
    escribiendo = false;   
} 

function selectArt(id){
    $(".pack_selected").removeClass("pack_selected");
    $("#"+id).addClass("pack_selected");    
}
function calcTotalArtOM(){
    var codigo_actual = $("#codigo").val();
    var lote_actual = $("#lote").val();
    var suma = 0;
    $(".pack").each(function(){
        var codigo =  $(this).attr("data-codigo") ;
        var lote_ref =  $(this).attr("data-lote_ref") ;
        var largo = parseFloat($(this).attr("data-largo"));
        if(codigo_actual === codigo && lote_actual == lote_ref){
           suma += largo;
        }
    });
    $("#cant_om").val((suma).toFixed(2));
    calcAjuste();   
}
function eliminarArticulo(id){
    $("#"+id).remove();
    calcTotalArtOM();
}



function agregarArticuloOM(){
     
    var codigo_ref = $("#codigo_ref").val();
    var codigo = $("#codigo").val();
    var lote = $("#lote").val();
    var largo = parseFloat($("#add_cant_om").val());      
    var medida_consumo = parseFloat($("#medida").val());
    
   
    
        if(largo === medida_consumo){
            alert("No deberia de agregar saldos de la misma medida que esta cortando.");
        }else{         
            if(codigo !== "" &&   !isNaN(parseFloat($("#add_cant_om").val()))){
                
                var c = confirm("Confirme que desea Fraccionar esta pieza en "+largo+"");
                if(c){
                var nro_emision = $("#nro_emision").val();
                var nro_orden = $("#nro_orden").val();
                var nro_orden_id_det = $("#nro_orden_id_det").val();
                $.ajax({
                    type: "POST",
                    url: "produccion/Fabrica.class.php",
                    data: {action: "agregarCorteOtraMedida",nro_emision:nro_emision,nro_orden:nro_orden,id_det:nro_orden_id_det, suc: getSuc(), usuario: getNick(),codigo_ref:codigo_ref,codigo:codigo,lote:lote,largo:largo,medida_consumo:medida_consumo},             
                    async: true,
                    dataType: "json",
                    beforeSend: function () {
                        $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
                    },
                    success: function (data) {   
                        if (data.mensaje === "Ok") {
                            $("#msg").html("Ok"); 
                            var nuevo_lote = data.nuevo_lote;
                            var pack = "<div class='pack' onclick=selectArt('pack_"+pack_id+"') data-codigo='"+codigo+"' data-lote_ref="+lote+" data-largo='"+largo+"' data-lote="+nuevo_lote+"  id='pack_"+pack_id+"' ><div style='width:86%;float:left;font-size:16px'>  <span>"+codigo+"</span>&nbsp;-&nbsp;<span>"+largo+"m.</span> </div> </div>";


                            $("#codigo_om").append(pack);
                            //$("#descrip_om").val(sector+"-"+nombre_com);

                            //$("#cant_om").val($(obj).attr("data-largo"));
                            $("#ui_articulos").fadeOut();   
                            $("#cantidad").focus();
                             pack_id++; 
                            calcTotalArtOM();
                            $("#add_cant_om").val("");



                        } else {
                            $("#msg").html("Error al :  ");   
                        }                
                    },
                    error: function (e) {                 
                        $("#msg").html("Error al fraccionar:  " + e);   
                        errorMsg("Error al fraccionar:  " + e, 10000);
                    }
                });  
                }

            }else{
                errorMsg("Debe ingresar una cantidad valida",3000);
            }
        }
    
}

function checkProgress(){
   var filas = $(".fila_asign").length;
   var procesados = $(".procesado").length;
   if(filas === procesados){
       var id_prod_ter = parseInt($("#id_prod_ter").val());
       if(id_prod_ter > 0){ 
           $("#generar_prod_ter").fadeOut();
       }else{
          $("#generar_prod_ter").fadeIn();
       }
       $("#agregar").fadeOut();
   }else{
       $("#generar_prod_ter").fadeOut();
       $("#agregar").fadeIn();
   }
   getSaldosYProductoTerminado();
}
 
function getSaldosYProductoTerminado(){
    var nro_emision = $("#nro_emision").val();
    $.ajax({
        type: "POST",
        url: "produccion/Fabrica.class.php",
        data: {action: "getSaldosYProductoTerminado",nro_emision:nro_emision, suc: getSuc(), usuario: getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#codigo_om").html("");
        },
        success: function (data) {   
            for (var i in data) { 
                var tipo = data[i].tipo;                     
                var codigo = data[i].codigo;       
                var lote = data[i].lote;     
                var cant = data[i].cant;  
                var lote_ref = data[i].lote_ref;
                
                if(tipo === "Saldo"){
                    var pack = "<div class='pack' onclick=selectArt('pack_"+pack_id+"') data-codigo='"+codigo+"' data-lote_ref="+lote_ref+" data-largo='"+cant+"' data-lote="+lote+"  id='pack_"+pack_id+"' ><div style='width:86%;float:left;font-size:16px'>  <span>"+codigo+"</span>&nbsp;-&nbsp;<span>"+cant+"m.</span></div>";
                    pack_id++;
                    $("#codigo_om").append(pack);
                }else{
                    lotes_generados.push(lote);
                    $("#imprimir_lotes").fadeIn();
                }
            }
            
            $("#msg").html(""); 
        },
        error: function (e) {                 
            $("#msg").html("Error al obtener saldos:  " + e);   
            errorMsg("Error al obtener saldos:  " + e, 10000);
        }
    });  
}

function imprimirReciboProduccion(){
     //lotes_generados
     
    var lotes = lotes_generados.toString();
    var random = Math.random() * 5000;
    var url = "barcodegen/BarcodePrinter.class.php?codes="+lotes+"&usuario="+getNick()+"&random="+random;
    
    var title = "Impresion de Codigos de Barras";
    var params = "width=800,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    window.open(url,title,params);      
}

function generarProductoTerminado(){
    $("#generar_prod_ter").prop("disabled",true);
    var nro_emision = $("#nro_emision").val();  
    var nro_orden = $("#nro_orden").val();
    var id_det = $("#nro_orden_id_det").val();
    var codigo_ref= $("#codigo_ref").val();
    
    $.ajax({
        type: "POST",
        url: "produccion/Fabrica.class.php",
        data: {action: "generarProductoTerminado",codigo_ref:codigo_ref, suc: getSuc(), usuario: getNick(),nro_orden:nro_orden,id_det:id_det,nro_emision:nro_emision},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            if (data.estado === "Ok") {
                $("#id_prod_ter").val(data.id_prod_ter);
                checkProgress();
                $("#msg").html("Ok"); 
            } else {
                $("#msg").html("Error al :  ");   
            }                
        },
        error: function (e) {                 
            $("#msg").html("Error al xxx cuenta:  " + e);   
            errorMsg("Error al xxx cuenta:  " + e, 10000);
        }
    }); 
    
}

function finalizarEmision(nro_emision){
    $.ajax({
        type: "POST",
        url: "produccion/Fabrica.class.php",
        data: {"action": "finalizarEmision", "nro_emision": nro_emision,"usuario":getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#finalizar_"+nro_emision).prop("disabled",true);
        },
        success: function (data) {                
            var mensaje =  data.mensaje;
          
            if(mensaje === "Ok"){
                 genericLoad("produccion/Fabrica.class.php");
            }else{
                alert("Error al finalizar produccion");  
            }
            
        }
    });
}
 

function buscarDatosDeOrden(){
    var nro_emision = $("#nro_emision").val();
    $.ajax({
        url: "produccion/Fabrica.class.php",
        data: {"action": "buscarDatosDeOrden", "nro_emision": nro_emision},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("Recuperando datos de Orden de Produccion.  <img src='img/loading_fast.gif' width='16px' height='16px' > "); 
        },
        success: function (data) {
            $(".fila_td").remove();
            var nro_orden = data[0].nro_orden;
            var cod_cli = data[0].cod_cli;
            var cliente = data[0].cliente;
            var usuario = data[0].usuario;
            var fecha = data[0].fecha;
            $(".datos_orden").append("<tr class='fila_td'> \n\
                    <td><b>Nro Orden:</b>"+nro_orden+"</td>\n\
                    <td><b>Cod Cliente:</b>"+cod_cli+"</td>\n\
                    <td><b>Cliente:</b>"+cliente+"</td>\n\
                    <td><b>Usuario:</b>"+usuario+"</td>\n\
                    <td><b>Fecha:</b>"+fecha+"</td> </tr>");
             //o.nro_orden,cod_cli,cliente,o.usuario,DATE_FORMAT(o.fecha,'%d-%m-%Y') AS fecha
            
            $("#msg").html(""); 
        }
    });
}

function buscarEmision(){
    buscarDatosDeOrden();
    var nro_emision = $("#nro_emision").val();
    $.ajax({
        url: "produccion/Fabrica.class.php",
        data: {"action": "planillaProduccion", "nro_emision": nro_emision},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("Recuperando Planilla de Produccion.  <img src='img/loading_fast.gif' width='16px' height='16px' > "); 
        },
        success: function (data) {
            //id_res,codigo,lote,descrip,color,design,cant_frac AS unidades,usuario
            $(".fila").remove();
            for (var i in data) { 
                var id_res = data[i].id_res;
                var fecha = data[i].fecha;     
                var usuario = data[i].usuario;  
                var codigo = data[i].codigo;       
                var lote = data[i].lote;        
                var descrip = data[i].descrip;                
                var design = data[i].design;        
                var unidades = data[i].unidades; 
                $(".planilla").append("<tr class='fila'><td class='itemc'>"+id_res+"</td><td class='item'>"+usuario+"</td><td class='itemc'>"+fecha+"</td><td class='item'>"+codigo+"</td><td class='item'>"+lote+"</td><td class='item'>"+descrip+"</td><td class='item'>"+design+"</td><td class='num'>"+unidades+"</td><td class='itemc'><img src='img/printer-01_32x32.png'  onclick='imprimirlote("+lote+",null)' style='margin:2px;width:26px;cursor:pointer'></td></tr>");   
            }   
            $("#msg").html(""); 
        }
    });
}
/*
function imprimirCodigoRef(){
    var codigo = $("#codigo_ref").val();
    imprimirCodigo(codigo);
}*/
function imprimirCodigoOM(){
    var codigo_om = $(".pack_selected" ).attr("data-codigo");
    var lote_om = $(".pack_selected" ).attr("data-lote");
    var metraje = parseFloat($(".pack_selected" ).attr("data-largo"));
    if(codigo_om !== undefined && metraje !== undefined){
        imprimirlote(lote_om);
    }else{
        alert("Elija un codigo de otra medida antes de imprimir");
    }
}
function imprimirlote(lote,metros){    
    var suc = getSuc();
    var usuario = getNick();   
    var random = parseInt( Math.random() * 1000);
    //var metros = $("#saldo_lote_"+lote).html();
    var url = "barcodegen/BarcodePrinter.class.php?codes="+lote+"&usuario="+usuario+"&random="+random;
    if(metros != null){    
       url = "barcodegen/BarcodePrinter.class.php?codes="+lote+"&usuario="+usuario+"&metros="+metros+"&random="+random;;
    }
    var title = "Impresion de Codigos de Barras";
    var params = "width=800,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    window.open(url,title,params);  
}
 

function imprimirCodigo(codigo,metros){
    var random = parseInt( Math.random() * 1000);
    var url = "produccion/Fabrica.class.php?action=imprimirCodigo&codigo="+codigo+"&metros="+metros+"&usuario="+getNick()+"&random="+random; 
    var title = "Impresion de Codigos y Medidas";
    var params = "width=400,height=500,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    window.open(url,title,params);  
}

function zoomImage(){
    var w = $("#zoom_range").val();    
    $("#image_container").width(w);
    $("#img_zoom").width(w);    
}
function cargarImagenLote(img, obj){   
    $("#image_container").html("");
    var images_url = $("#images_url").val();
    
    var cab = '<div style="width: 100%;text-align: right;background: white;">\n\
        <img src="img/substract.png" style="margin-top:-4px"> <input id="zoom_range" onchange="zoomImage()" type="range" name="points"  min="60" max="1000"><img src="img/add.png" style="margin-top:-4px;">\n\
        <img src="img/close.png" style="margin-top:-18px;margin-left:100px" onclick=javascript:$("#image_container").fadeOut()>\n\
    </div>';
    
    $("#image_container").fadeIn();
    
    
    var width = $(obj).width() + 20; 
    var top = $(obj).position().top;
    if(top < 100){
        top = 100;
    }
    $("#image_container").offset({left:width,top:top});
    var path = images_url+"/"+img+".jpg";
    
    var img = '<img src="'+ path +'" id="img_zoom" onclick=javascript:$("#image_container").fadeOut() width="500" >';
    $("#image_container").html( cab +" "+ img);
    $("#image_container").draggable();
}