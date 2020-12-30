
 var mywindow = false;
 
 var punteados = new Array();
 var accion = "Ubicar";
 var mnj_x_lotes = "Si";
 
 var cuadMaximized = true;

function configurar(){
    $("#deposito").val(getSuc());
    var tipo = "";
    $("input[type=radio]:not(.accion)").click(function(){ 
       tipo = $(this).val();   
       var bcode = "";
       if(tipo == "Estante"){
           bcode = "&nbsp;&nbsp;<input type='text' id='bcode' size='14' onchange='selectCuad()' class='cuadbarcode' placeholder='Codigo Barras' >";
       }
       
       $("#tipo_ubic").html(tipo+":"+bcode);
       var nombre = $("#nombre").val();  
       $("#titulo_ubic").html(tipo+" "+nombre);
       
       buscarUbicaciones();
       $("#fila").val("");
       $("#col").val("");
       limpiarAreaCarga();
       
    });
    $(".accion").click(function(){ 
       accion = $(this).val();         
       if(accion == "Ubicar"){
           $("#img_ubic").attr("src","img/in_green.png");
           accion = "Ubicar";
       }else{
           $("#img_ubic").attr("src","img/out_red.png");
           accion = "Quitar";
       }
       limpiarAreaCarga();
    }); 
    
    $("#lote").change(function(){
        buscarDatosDeCodigo();
    });
    $("#pallet").focus(function(){
      $(this).select();  
    });  
    $("#pallet").change(function(){
       controlarUbicacionPallet();
    });  
    $("#lote").click(function(){
      $(this).select();  
    });
    if(tipo == "Estante"){
        $("#bcode").focus();
        $("#bcode").select();
    }
    
    $("#stock").change(function(){
        if(accion == "Ubicar"){
            registrarXCantidad();
        }else{
            quitar();
        }
    });
    
    getPlanos();
    if(is_mobile){
        $("#ubicar").width("99%");
        $("#ubicar").css("margin-bottom","4px");
          
        $("#ubic_table").css("padding","0px");
        $("#ubic_table").css("margin","0px");
        $("#porc_util").fadeOut();
        $("#graph_img").css("margin-left","0.5cm");
        $("#spaces").html("<br>");
        $("#ubicacion_div").css("border","0px");
        $("#area_trab_div").width("98%");
        setTimeout('$("#fila_suc").slideUp();',8000);
    }
    $("#estante").click();
    buscarUbicaciones();
}

function selectCuad(){
    $("#bcode").focus(function(){
      $(this).select();  
    });
    $("#bcode").change(function(){
      $(this).select();  
    });

    var bcode = (($("#bcode").val()).trim()).toUpperCase();
    var array = bcode.split(" ");
    
    var nombre = array[1];    
    var fila = array[2];
    var col = array[3];

    $("#fila").val(fila);
    $("#col").val(col);
    $("#nombre").val(nombre);
    var filas =  $("#nombre").find(":selected").attr("data-filas");
    var cols =  $("#nombre").find(":selected").attr("data-cols");

    if(parseInt(filas)>=parseInt(fila) && parseInt(cols)>=parseInt(col)){
        $("#area_trab input").removeAttr("disabled");
        $("#listar").removeAttr("disabled");
        $("#ubicacion_div").hide();
        //seleccionarCuadrante(fila,col);
    }else{
        $("#area_trab input").attr("disabled","disabled");
        $("#listar").attr("disabled","disabled");
        dibujarUbicacion();
        //seleccionarCuadrante(fila,col);
    }

    if($( window ).width() < 1){
        $("#ubicacion_div").hide();
    }else{
        dibujarUbicacion();
        setTimeout(seleccionarCuadrante(fila,col),1000);
    }
    $("#content_table").html("");     
    //resumenCuadrante();
}
function seleccionarCuadrante(f,c){
    $(".cuadrante-selected").removeClass("cuadrante-selected");
    $("."+f+"_"+c+"").click();
    $("#content_table").html(""); 
    /*
    $(".cuadrante").each(function(){
       var fila = $(this).attr("data-fila"); 
       var col = $(this).attr("data-col");        
       if((fila === f) && (col === c)){
           $(this).addClass("cuadrante-selected");
       }
    });*/
}
function controlarUbicacionPallet(){
    
    var suc_ = getSuc();
    var tipo = $("[name=tipo]:checked").val();
    var nombre = $("#nombre").val();    
    var fila = $("#fila").val();
    var col = $("#col").val();
    
    var ubic_new = suc_+"-"+nombre+"-"+fila+"-"+col;
    
    var pallet = $("#pallet").val();
    if(pallet != "" && fila != "" && col != ""){
        $.ajax({
            type: "POST",
            url: "productos/Ubicar.class.php",
            data: {"action": "getPalletUbic", pallet: pallet},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg_codigo").html("Controlando ubicacion de Pallet...<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
               
                var U_suc = data[0].suc;
                if(U_suc != ""){                     
                    var U_nombre = data[0].nombre;
                    var U_fila = data[0].fila;
                    var U_col = data[0].col;

                    var ubic = U_suc+"-"+U_nombre+"-"+U_fila+"-"+U_col;

                    if( (U_suc == suc_) && (U_nombre == nombre) && (U_fila == fila)&& (U_col == col) && U_nombre != undefined ){

                    }else{
                       $("#ubic_actual").html(ubic); 
                       $("#ubic_new").html(ubic_new); 
                       
                       $( "#dialog-confirm" ).dialog({
                            resizable: false,
                            height:180,
                            width:460,
                            modal: true,
                            buttons: {
                              "Cancelar": function() {
                                 $("#pallet").val("");   
                                $( this ).dialog( "close" );
                              },  
                              "Confirmar Reubicar Pallet": function() {
                                 moverPallet(pallet,suc_,tipo,nombre,fila,col); 
                                 $( this ).dialog( "close" );                
                               } 
                              },        
                              close: function() {            
                                $( this ).dialog( "destroy" );
                              }
                        });
                       
                    }               
                }
                $("#msg_codigo").html(""); 
            }
        });
        resumenCuadrante();
    }
}
function moverPallet(pallet,suc,tipo,nombre,fila,col){
    $.ajax({
        type: "POST",
        url: "productos/Ubicar.class.php",
        data: {"action": "reubicarPallet",pallet:pallet, suc: suc, tipo:tipo,nombre:nombre,fila:fila,col:col,usuario:getNick()},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg_codigo").html("Reubicando Pallet...<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);
                $("#msg_codigo").html(result);
            }else{
                $("#msg_codigo").html("Error...");
            }
        },
        error: function () {
            $("#msg_codigo").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}
function limpiarAreaCarga(){
    $(".dato").val(""); 
    $("#imagen_lote").attr("src","img/no-image.png");          
}

function showKeyPad(){
    showRelative("lote",buscarDatosDeCodigo,false);
    var position = $("#lote").offset();     
   //console.log('top'  + position.top  +'left' + position.left);
    $('#n_keypad').css({ 'top'  : position.top -50 ,'left' : position.left -7});    
}

function buscarDatosDeCodigo(){
    var lote = $("#lote").val();
    if(lote !== ""){
     
    $.ajax({
        type: "POST",
        url: "productos/Ubicar.class.php",
        data: {"action":"buscarDatosDeCodigo","lote":lote,"categoria":1,"suc":getSuc()}, 
        async:true,
        dataType: "json",
        beforeSend: function(){           
           $("#msg_codigo").html("<img src='img/loadingt.gif' >");             
        },
        success: function(data){ 
            var existe = data.existe;
            $("#msg_codigo").attr("class","info");
            if( existe === "true" ){
                
                var stock = parseFloat( data.stock  );
                 
                $("#codigo").val(data.codigo); 
                $("#descrip").val(data.descrip);
                $("#stock").val(  parseFloat( data.stock  ).format(2, 3, '.', ',')   );
                $("#stock").attr("data-stock",parseFloat( data.stock  ).format(2, 3, '.', ','));
                   
                var imagen = data.img; 
                $("#imagen_lote").fadeIn("fast");
                if(imagen != ""){
                    var images_url = $("#images_url").val();
                    $("#imagen_lote").attr("src",images_url+"/"+imagen+".thum.jpg"); 
                }else{
                   $("#imagen_lote").attr("src","img/no-image.png");                    
                }
                mnj_x_lotes = data.mnj_x_lotes;
                
                // Buscara en documentos 
                if(stock > 0){
                    var codigo = $("#codigo").val();
                    var ubicacion = $("#nombre").val();
                    var tipo = $("[name=tipo]:checked").val();
                    var fila = $("#fila").val();
                    var col = $("#col").val();
                    var pallet = $("#pallet").val();
                    var descrip = $("#descrip").val();
                    var obs = $("#obs").val();
                    
                    if(mnj_x_lotes == "Si"){
                        $("#stock").prop("readonly",true);
                        if(accion == "Ubicar"){
                           buscarCodigoEnDocumentos(lote, codigo, ubicacion, tipo, fila, col, pallet, descrip,obs,stock);
                        }else{
                           quitar();
                        }
                    }else{
                        $("#lote").val("");
                        
                        if(accion == "Ubicar"){
                           $("#stock").focus();
                           $("#stock").prop("readonly",false);
                           $("#msg_codigo").html("Ingrese la cantidad a ubicar."); 
                        }else{
                            quitar();
                        }                        
                        //registrarUbicacion("", codigo, ubicacion, tipo, fila, col, pallet, descrip,obs);   
                    }
                }else{
                    $("#msg_codigo").html("Stock Insuficiente para Ubicar Stock: "+ stock);  
                    errorMsg("Stock Insuficiente para Ubicar Stock: "+ stock,10000);
                }
                      
            }else{
                $("#msg_codigo").addClass("error");
                $("#msg_codigo").html("No existe este Codigo/Lote");                
                $("#imagen_lote").attr("src","img/no-image.png");
                $("#imagen_lote").fadeOut("fast");
                limpiarAreaCarga();
                $("#lote").focus(); 
                
            }
        },
        error: function(e){ 
           $("#msg_codigo").addClass("error");
           $("#msg_codigo").html("Error en la comunicacion con el servidor:  "+e);
        }
    }); 
    
   }
}
function buscarCodigoEnDocumentos(lote, codigo, ubicacion, tipo, fila, col, pallet, descrip,obs,stock){
    
    $.ajax({
            type: "POST",
            url: "productos/Ubicar.class.php",
            data: {"action": "buscarCodigoEnDocumentos", codigo: codigo,lote:lote,usuario:getNick(),suc:getSuc()},
            async: true,
            dataType: "json",
            beforeSend: function () { 
                $("#msg_codigo").html("Buscando Lote en documentos <img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   

                var mensaje = data.mensaje;
                if(mensaje=='Ok' ){  
                   $("#msg_codigo").addClass("info"); 
                   $("#msg_codigo").removeClass("alert"); 
                   registrarUbicacion(lote, codigo, ubicacion, tipo, fila, col, pallet, descrip,obs,stock);   
                }else{
                   
                   $("#msg_codigo").removeClass("info"); 
                   $("#msg_codigo").addClass("alert"); 
                   $("#msg_codigo").html("Articulo en Documentos:");   
                   var table = '<table border="1"  cellspacing="0" cellpadding="0" class="stock_comprometido">';                   
                   table+= '<tr class="titulo" ><th>Tipo</th><th>Nro</th><th>Fecha</th><th>Suc</th><th>Estado</th><th>Cant.</th></tr>';
                   for(var i in data){  
                     var td = data[i].TipoDocumento;
                     var nro = data[i].Nro;
                     var fecha = data[i].fecha;
                     var suc = data[i].suc;
                     var estado = data[i].estado;
                     var cantidad = data[i].cantidad; 
                     table+= "<tr style='background:white'><td class='item'>"+td+" </td><td class='item'>"+nro+" </td><td class='itemc'> "+fecha+" </td><td class='itemc'> "+suc+" </td><td class='itemc'> "+estado+" </td><td class='num'>"+cantidad+"</td></tr>";  
                   }
                   table+="</table>";
                   $("#msg_codigo").append(table);
                   playError(); 
                }
            }
    });     
}

function buscarUbicaciones(){
    var suc = getSuc();
    var tipo = $("[name=tipo]:checked").val();
    
    $.ajax({
        type: "POST",
        url: "productos/Ubicar.class.php",
        data: {"action": "getUbicaciones", suc: suc,tipo:tipo},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            $(".ubics").remove();
            for (var i in data) { 
                var nombre = data[i].nombre;
                var filas = data[i].filas;  
                var cols = data[i].cols;
                var sentido = data[i].sentido;
                $("#nombre").append("<option class='ubics' data-sentido='"+sentido+"' data-filas='"+filas+"' data-cols='"+cols+"'>"+nombre+"</option>");    
            } 
            $("#nombre").off("change");
            $("#nombre").click(function(){              
                dibujarUbicacion();
            });
            $("#msg").html(""); 
            dibujarUbicacion();             
        }
    }); 
}

function dibujarUbicacion(){
    $("#content_table").html(""); 
     cuadMaximized = false;
     optimizarEspacio();
     var filas =  $("#nombre").find(":selected").attr("data-filas");
     var cols =  $("#nombre").find(":selected").attr("data-cols");
     var sentido =  $("#nombre").find(":selected").attr("data-sentido");
     var tipo = $("[name=tipo]:checked").val();
     
     var nombre = $("#nombre").val();  
     $("#titulo_ubic").html(tipo+" "+nombre);
     
     $(".fila").remove();
     for(var i = 1;i <=filas;i++){
        var fila = "<tr class='fila' >"; 
        if(sentido == "Normal"){
            for(var j = 1;j <= cols; j++){
                var idf = "";
                var idc = "";
                if(j == 1){
                    idf = "<label class='ident_fila'>"+i+"</label>";                
                }
                if(i == 1){
                    idc = "<label class='ident_col'>"+j+"</label>";
                }
                fila +="<td class='cuadrante "+i+"_"+j+"' data-fila='"+i+"' data-col='"+j+"' title='Fila: "+i+", Col: "+j+"' >  "+idf+""+idc+""+i+"-"+j+"</td>";  
            }   
        }else{
          for(var j = cols;j > 0 ; j--){
                var idf = "";
                var idc = "";
                if(j == cols){
                    idf = "<label class='ident_fila'>"+i+"</label>";                
                }
                if(i == 1){
                    idc = "<label class='ident_col'>"+j+"</label>";
                }
                fila +="<td class='cuadrante "+i+"_"+j+"' data-fila='"+i+"' data-col='"+j+"' title='Fila: "+i+", Col: "+j+"' >  "+idf+""+idc+""+i+"-"+j+"</td>";  
            }   
        }
        fila+="</tr>";
        $("#ubicacion").prepend(fila);
     }
     
     if(tipo === "Sector"){
         $("#ubicacion_div").addClass("sector_div");
         $("#ubicacion").addClass("sector");   
         $("#ubicacion").css("border-collapse","collapse");
         $(".cuadrante").css("border-width","1px");
         $(".cuadrante").css("border-style","solid");
         $("#ubicacion").css("box-shadow","none");
         $("#ubicacion").css("width","60%");
         $("#ubicacion").css("height","60%");          
     }else{
         $("#ubicacion_div").removeClass("sector_div");
         $("#ubicacion").removeClass("sector");        
         $("#ubicacion").css("border-collapse","initial");
         $(".cuadrante").css("border-width","0 0 4px 4px");
         $(".cuadrante").css("border-style","inset");
         $("#ubicacion").css("box-shadow","4px -4px 1px gray");
         $("#ubicacion").css("width","auto");
         $("#ubicacion").css("height","auto");  
     }
     
     $(".cuadrante").click(function(){
        var clase = "cuadrante-selected";
        if(tipo === "Sector"){
           clase = "sector-selected";
        } 
        if($(this).hasClass(clase)){
            $("."+clase).removeClass(clase);
            $("#fila").val("");
            $("#col").val("");
            $("#area_trab input").attr("disabled",true);
            $("#pallet").val("");
            $("#listar").attr("disabled",true);
            optimizarEspacio();
        }else{
            $("."+clase).removeClass(clase);
            $(this).addClass(clase);
            var fila = $(this).attr("data-fila");
            var col  = $(this).attr("data-col");
            $("#fila").val(fila);
            $("#col").val(col);
            $("#area_trab input").removeAttr("disabled");
            $("#pallet").val("");
            $("#listar").removeAttr("disabled");
            resumenCuadrante();   
            setTimeout("optimizarEspacio()",500);
        }
        if($( window ).width() < 720){
            $("#ubicacion_div").hide();
        }        
     }); 
     centrarIdentificadores(tipo);     
     $("#ubicacion_div").show(); 
}
function selectLote(){
    $("#lote").focus();
    $("#lote").select();
}
var codigo_ant = null;
var lote_ant = null;
var ubicacion_ant = null;
var tipo_ant  = null;
var fila_ant  = null;
var col_ant  = null;
var pallet_ant  = null;
var descrip_ant = null;
var obs_ant = null;
function revertir(){
    registrarUbicacion(lote_ant, codigo_ant, ubicacion_ant, tipo_ant, fila_ant, col_ant, pallet_ant, descrip_ant,obs_ant);
}
function registrarXCantidad(){
    var codigo = $("#codigo").val();
    var lote = $.trim($("#lote").val());
    var ubicacion = $("#nombre").val();
    var tipo = $("[name=tipo]:checked").val();
    var fila = $("#fila").val();
    var col = $("#col").val();
    var pallet = $("#pallet").val();
    var descrip = $("#descrip").val();
    var obs = $("#obs").val();
    var stock =  parseFloat($("#stock").val());
    if(isNaN(stock)){
        $("#msg_codigo").html("Ingrese un Numero");  
    }else{
        registrarUbicacion(lote, codigo, ubicacion, tipo, fila, col, pallet, descrip,obs,stock);
    }
    
}
 
function quitar(){
    var codigo = $("#codigo").val();
    var lote = $("#lote").val();
    var ubicacion = $("#nombre").val();
    
    var fila = $("#fila").val();
    var col = $("#col").val();
    var pallet = $("#pallet").val();
    var stock = $("#stock").val();
    
    $.ajax({
        type: "POST",
        url: "productos/Ubicar.class.php",
        data: {action: "quitar", suc: getSuc(), usuario: getNick(),codigo:codigo,lote:lote,ubicacion:ubicacion,fila:fila,col:col,pallet:pallet,stock:stock,mnj_x_lotes:mnj_x_lotes},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_codigo").html("Quitando... <img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#msg_codigo").css("color","green");
        },
        success: function (data) {   
            if (data.mensaje === "Ok") {
                $("#msg_codigo").html("Ok"); 
                $("#lote").focus();
            }else if(data.mensaje == "No Ubicado"){
                $("#msg_codigo").html("No Ubicado<br>");  
                if(data.ultimo_reg != null){
                    $("#msg_codigo").append("Quitado por "+data.ultimo_reg);                  
                }
            } else {
                $("#msg_codigo").html(data.mensaje);   
                $("#msg_codigo").css("color","red");
                var arr = data.cuadrantes;
                $("#msg_codigo").append("<div>Ubicaciones donde se encuentra</div>");
                $("#msg_codigo").append("<div>Cuad.- Fila-Col -> Cantidad</div>");
                for(var i in arr){
                   var nombre = arr[i].nombre;
                   var fila = arr[i].fila;
                   var col = arr[i].col;
                   var cant = arr[i].cantidad;
                   $("#msg_codigo").append("<div style='font-weight:bolder'>"+nombre+"-"+fila+"-"+col+"  ->  "+cant+"</div>");
                }                
            }                
        },
        error: function (e) {                 
            $("#msg_codigo").html("Error al quitar codigo... " + e);   
            errorMsg("Error al xxx cuenta:  " + e, 10000);
        }
    });  
    
}
 
function registrarUbicacion(lote, codigo, ubicacion, tipo, fila, col, pallet, descrip,obs,stock){
    codigo_ant = codigo;
    lote_ant = lote;
    descrip_ant = descrip;
    obs_ant = obs;
    var posicion_punteo = punteados.indexOf(lote);
    var tamanio_array = punteados.length;
    if( posicion_punteo  > -1){
        var diff = (tamanio_array -1) - posicion_punteo  ;
        if(mnj_x_lotes == "Si"){
           alert("Lote Punteado hace: "+diff+" punteos hacia atras. Controle la Ubicacion Anterior");
        }
    }
    
    if(fila == "" || col == ""){
        errorMsg("Debe seleccionar un Cuadrante!",8000);
        return;
    }else{    
        $.ajax({
            type: "POST",
            url: "productos/Ubicar.class.php",
            data: {"action": "ubicar",usuario:getNick(), codigo: codigo,lote:lote,suc:getSuc(),ubicacion:ubicacion,tipo:tipo,fila:fila,col:col,pallet:pallet,obs:obs,stock:stock},
            async: true,
            dataType: "json",
            beforeSend: function () { 
                $("#msg_codigo").html("Registrando... <img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   

                var mensaje = data.mensaje;
                if(mensaje == 'Ok' ){
                   
                   ubicacion_ant = data.ubicacion_ant;
                   tipo_ant  = data.tipo_ant;
                   fila_ant  = data.fila_ant;
                   col_ant  = data.col_ant;
                   pallet_ant  = data.pallet_ant;
                   obst_ant  = data.obs_ant;
                   var lb_pallet = "";
                   if(pallet_ant != ""){
                       lb_pallet = "Pallet: "+pallet_ant;
                   }
                   if(ubicacion_ant != undefined){
                      var rev = '     <input type="button" value="&larr; Revertir" onclick="revertir()">    ';
                      $("#ant").html(rev+"           "+ubicacion_ant+"-"+fila_ant+"-"+col_ant+"  "+lb_pallet+" ");
                   }
                    
                   $("#msg_codigo").html( "<img src='img/ok.png'> Codigo: "+codigo+"   Lote:  "+ lote +" "+descrip);                  
                   resumenCuadrante();
                   punteados.push(lote);
                   playSaved();
                   setTimeout("selectLote()",1000);
                }else{
                   $("#msg_codigo").html(mensaje);  
                }
            }
        });
    }
}

function optimizarEspacio(){
    if(cuadMaximized){
      $(".cuadrante:not(.cuadrante-selected)").fadeOut();
      
      $("#ubicacion_div").css("width","20%");
      $("#ubicacion_div").css("min-width","auto");
      $("#ubicacion_div").css("height","auto");
      $("#area_trab_div").attr("style","float:left");
      cuadMaximized = false;
    }else{
        $(".cuadrante").fadeIn();
        $("#area_trab_div").attr("style","float:right");
        $("#ubicacion_div").css("width","60%");
        $("#ubicacion_div").css("min-width","480px");
        $("#ubicacion_div").css("height","380px");
        cuadMaximized = true;
    }
}

function resumenCuadrante(){
     
    var ubicacion = $("#nombre").val();
    
    var fila = $("#fila").val();
    var col = $("#col").val();
    var pallet = $("#pallet").val();
    $.ajax({
        type: "POST",
        url: "productos/Ubicar.class.php",
        data: {action: "resumenCuadrante", ubicacion:ubicacion,fila:fila,col:col,pallet:pallet, suc: getSuc(), usuario: getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#resumen_cuad").html(""); 
        },
        success: function (data) {   
            if (data.length > 0) {
                for(var i in data){
                    var cant = data[i].cant;
                    var stock = data[i].stock;
                    var um = data[i].um;
                    $("#resumen_cuad").append("<div class='resume'><b>Cant.:</b>"+cant+",&nbsp;&nbsp;&nbsp;&nbsp; "+stock+" <b>"+um+"</b></div>"); 
                }
                
            } else {
                $("#resumen_cuad").html("Vacio");   
            }                
        },
        error: function (e) {                 
            $("#resumen_cuad").html("Error al obtner resumen  ");   
            errorMsg("Error al obtner resumen  " + e, 10000);
        }
    }); 
}

function playAlert() {   
    var audio = new Audio('files/sounds/button-4.wav');
    audio.play();   
}
function playError() {   
    var audio = new Audio('files/sounds/beep-05.wav');
    audio.play();   
}
function playSaved() {   
    var audio = new Audio('files/sounds/beep-02.wav');
    audio.play();   
} 
function centrarIdentificadores(tipo){
    if(tipo === "Sector"){
        var w =  parseInt($(".cuadrante").width() / 2);
        var h =  parseInt($(".cuadrante").height() / 2 );  
        w = w - 10;
        h = h + 10;      
        $(".ident_col").css("margin",h+"px 0 0 "+w+"px"); 
    }else{
       $(".ident_col").css("margin","40px 0 0 10px");  
    }
}
 
function verContenido(){
    var ubicacion = $("#nombre").val();
    var tipo = $("[name=tipo]:checked").val();
    var fila = $("#fila").val();
    var col = $("#col").val();
    var pallet = $("#pallet").val();
    var suc = getSuc();
    $.ajax({
        type: "POST",
        url: "productos/Ubicar.class.php",
        data: {"action": "verContenidoUbicacion",suc:suc, ubicacion: ubicacion,tipo:tipo,fila:fila,col:col,pallet:pallet},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_codigo").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#cuad_content").empty();
            
            var cabecera = '<div  class="titulo" style="text-align:center;font-size:18px;font-weight:bolder">'+suc+' '+tipo+' '+ubicacion+' Fila: '+fila+'  Col: '+col+'</div>';
              
            $("#cuad_content").append(cabecera); 
            
        },
        success: function (data) {   
            
            var tabla = '<table border="1" id="content_table" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse">';
            var cab_tabla ='<tr><th>Codigo</th><th>Lote</th><th>Descrip</th><th>Color</th><th>Almacenado</th><th>Stock Actual</th></tr></table>';
            var k = 0; 
            var totalStock = 0;
            for (var i in data) {
                var pallet = data[i].pallet;              
                var articulos  = data[i].articulos;
                var pallet_title = "Sin Pallet";
                if(pallet != ""){
                    pallet_title = "PALLET Nro:";
                }
                var cab_pallet = "<tr><td colspan='6' class='vacio'></td></tr><tr><th colspan='6' class='pallet_head'>"+pallet_title+"  "+pallet+"</th></tr>";
                
                $("#cuad_content").append(tabla); 
                $("#content_table").append(cab_pallet); 
                $("#content_table").append(cab_tabla); 
                for (var j in articulos) {
                   var codigo = articulos[j].codigo; 
                   var lote = articulos[j].lote; 
                   var descrip = articulos[j].descrip; 
                   var color = articulos[j].color; 
                   var almacenado = articulos[j].almacenado; 
                   var StockActual = articulos[j].StockActual; 
                   totalStock += parseFloat(almacenado);
                   $("#content_table").append("<tr class='cuad_content'><td class='itemc'>"+codigo+"</td><td  class='itemc'>"+lote+"</td><td  class='item'>"+descrip+"</td><td  class='item'>"+color+"</td><td  class='num'>"+almacenado+"</td><td  class='num'>"+StockActual+"</td></tr>");                 
                } 
                k++;
           }
            j++; 
            totalStock = (totalStock).format(1,3);
            $("#content_table").append("<tr class='cuad_content'><td class='itemc' colspan='3' ><b>"+j+" Items</b></td><td  class='itemc'></td><td  class='item'></td><td  class='num' ><b>"+totalStock+"</b></td></tr>"); 
            if(k > 0){
                $("#content_table").append("<tr class='impresora'><td colspan='6' style='text-align:center;'><img src='img/printer-01_32x32.png' style='cursor:pointer' onclick='printCuadContent()' height='24' width='26'></td></tr>");
            }
            $("#msg_codigo").html(""); 
        }
    });
}
function printCuadContent(){
    Popup($("#cuad_content").html());
}
function getPorcentajeUtilizado(){
    var estante = $("#nombre").val(); 
    $.ajax({
        type: "POST",
         url: "productos/Ubicar.class.php",
        data: {"action": "getPorcentajeUtilizado", suc: getSuc(),"estante":estante},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_codigo").html("Calculando % espere <img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            var max = 0;
            var k = 0;
            for (var i in data) { 
                var fila = data[i].U_fila;
                var col = data[i].U_col;                 
                var Piezas = data[i].Piezas;
                if(k == 0){
                    max = Piezas;
                }
                k++;
                var porc = Math.round((Piezas * 100) / max);
                $("."+fila+"_"+col).html("<div class='utilizado' style='height:"+porc+"%'>"+porc+"%</div>");
                $("."+fila+"_"+col).css("vertical-align","bottom");
                $("#msg_codigo").html(fila+"-"+col+"  "+k);                  
            }   
            $("#msg_codigo").html(""); 
        }
    });
}

function Popup(data) {
    if(mywindow){
        mywindow.close();
    }
    mywindow = window.open('', 'Contenido de Cuadrante', 'height=400,width=600');
    mywindow.document.write('<html><head><title></title>');
    mywindow.document.write('<link rel="stylesheet" href="productos/ubicar.css" type="text/css" />'); 
    mywindow.document.write('<link rel="stylesheet" href="css/main.css" type="text/css" />');
    mywindow.document.write('<style type="text/css">.test { color:red; } </style></head><body>');
    mywindow.document.write(data);
    mywindow.document.write('</body></html>');
    mywindow.document.close();
    mywindow.print();                        
}

function verGrafo(){
    var params = "width=1024,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    var url = "produccion/GrafoNodos.class.php?suc=00";    
    window.open(url,"Grafo de Nodos Depositos Produccion",params);
}

function getPlanos(){
    var suc = getSuc();
    $.ajax({
        type: "POST",
        url: "json/conf_planos.json",
        data: {},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#panos").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {               
             $("#planos").html("  Planos:  ");
            data[suc].planos.forEach(function(e) {
                 $("#planos").append("<a href=javascript:verPlano('"+e.Template+"') >"+e.codigo+"</a>&nbsp;&nbsp;");    
            });
            
            
            $("#panos").html(""); 
        }
    });
}
function verPlano(plano){
    var suc = getSuc(); 
    var usuario = getNick();
    var params = "width=1024,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    var url = "productos/ubicaciones/Planos.class.php?usuario="+usuario+"&suc="+suc+"&template="+plano+"&";    
    window.open(url,"Plano "+plano+" Suc: "+suc,params);
}