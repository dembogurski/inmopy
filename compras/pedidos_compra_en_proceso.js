
var nro_nota = 0;
var proveedor = "";
var tipo_prov = "";
var cod_articulo = "";
var corps_original_width = 100;

var selected_code = ""; // Codigo comprado de un corp Seleccionado

var codigo_ant = "";
var descrip_ant = "";

var colores = [];
var patterns = [];  // Nombres de los diseños
var pattern_codes = [];// Codigo de las carpetas que contienen los diseños

var comprando_id = 0;
var comprando_color = "";


var cant_articulos = 0;
var fila_art = 0;
var escribiendo = false;  
var editando_fila = 0;
var loadDesings = false;


var idbSupported = false;
var db; 

 
function configurar(){ 
    $(".form").change(function(){
        checkForm();
    }); 
    $("#fdescrip").keydown(function(e) {
        if(!$("#prod_nuevo").is(":checked")){ 
        var tecla = e.keyCode; //console.log(tecla);  
         
        if (tecla == 38) {
            (fila_art == 0) ? fila_art = cant_articulos-1 : fila_art--;
            selectRowArt(fila_art);
        }
        if (tecla == 40) {
            (fila_art == cant_articulos-1) ? fila_art = 0 : fila_art++;
            selectRowArt(fila_art);
        }
        if (tecla != 38 && tecla != 40 && tecla != 13 && tecla != 27) {
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
        if(tecla == 27){
            $("#ui_articulos").fadeOut();  
        }
    }
        if (tecla == 116) { // F5
            e.preventDefault(); 
        } 
          
    });
    $('.toggle-button').click(function() {
        $(this).toggleClass('toggle-button-selected'); 
        cambiarArticulo();        
    });
    
}

function checkForm(){
   var descrip =  $("#fdescrip").val(); 
   var color = $("#fcolor").val();
   var cantidad = $("#fcantidad").val();
   var precio = $("#fprecio").val();
   var gramaje = $("#fgramaje").val();
   var um = $("#fum").val();
     
   var flag = 5;
   
   if(descrip.length < 3){
      flag++;
      $("#fdescrip").addClass("incorrect");
   }else{
       flag--;
       $("#fdescrip").removeClass("incorrect");
   }
    
   if(color.length < 3){
      flag++;
      $("#fcolor").addClass("incorrect");
   }else{
       flag--;
       $("#fcolor").removeClass("incorrect");
   }
    
   if(cantidad <= 0){
      flag++;
      $("#fcantidad").addClass("incorrect");
   }else{
       flag--;
       $("#fcantidad").removeClass("incorrect");
   }
   
   if(precio <= 0){
      flag++;
      $("#fprecio").addClass("incorrect");
   }else{
       flag--;
       $("#fprecio").removeClass("incorrect");
   }
   if(um == "Unid"){ // Unidades no importa el Gramaje
       flag--;
       $("#fgramaje").removeClass("incorrect");
   }else if( gramaje > 0 ){ // Mts Yds Kg
       flag--;
       $("#fgramaje").removeClass("incorrect");
   }else{ // Mts Yds Kg gramaje debe ser > 0
       flag++;
       $("#fgramaje").removeClass("incorrect");
   }
    
   if(flag <= 0){
       if(um == "Kg" && gramaje <= 0){       
            $("#fgramaje").addClass("incorrect");
            $("#guardar").attr("disabled",true);
       }else{
            $("#guardar").removeAttr("disabled");
            $("#fgramaje").removeClass("incorrect");
       }
   }else{
       $("#guardar").attr("disabled",true);
   }
   
   
}
function configurarDB(){
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    if (!window.indexedDB) {
         window.alert("Su navegador no soporta IndexedDB una base de datos local para almacenamiento de datos, utilize otro navegador");
    }else{   
        idbSupported = true;
        var request = indexedDB.open("inmopy",3);
        
        request.onupgradeneeded = function(e) { // cuando es necesario crear las tablas de la base de datos
            db = e.target.result;            
            alert(db);
            if(!db.objectStoreNames.contains("compras")) {
              var  store = db.createObjectStore("compras", {keyPath: "id"}); // crear tabla                    
            }
        }
        request.onsuccess = function(e) {
           db = e.target.result;        
        }
        request.onerror = function(e) {
           console.log("Ha ocurrido algun error");
        }
        setInterval("procesarCola()",4000);
    }    
}
function seleccionarNota(nro,tipo_proveedor){
    $(".select_nota").attr("disabled",true);
    configurarDB();
    if(idbSupported){
        tipo_prov  = tipo_proveedor;
        $(".info_cli").slideUp("fast");
        $("#li_"+nro).removeClass("notas");
        $(".notas").slideUp();
        nro_nota = nro;
        $(".area_compra").fadeIn();
        mostrarProveedores(nro,tipo_prov);
        getArticulosAComprar();
        $("#li_"+nro).css("position","relative");

        $("#li_"+nro).animate({  
           top: "-=28"   
        }, 1500, function() {
            $("#li_"+nro).html("<b>N&deg;:</b> "+nro);
            $("#li_"+nro).animate({  
               width: "60"   
            } );
            $(".panel").fadeIn();
        }); 
        $("#formulario").draggable();
   }
   setTimeout("selectDesigns(false)",4000);
}
function setAutocomplete(){  
   $("#fcolor").autocomplete({
      source: colores 
   }); 
   $("#fdesign").autocomplete({
      source: patterns 
   }); 
} 
function setUm(){
    var um = $("#fum").val();
    var um_art = $(".attributos_"+ $("#articulos").val()).attr("data-um");
    if(um_art == "Mts"){
        if(um == "Mts"){
            $("#fum").val("Kg");
        }else if(um == "Kg"){
           $("#fum").val("Yds");
        }else{
           $("#fum").val("Mts");  
        } 
    }else{//Unid        
        $("#fum").val("Unid");
    } 
    checkForm();
}
function selectCorp(corp,prioridad){
   $(".corp").removeClass("corp_selected");
   $("#"+corp).addClass("corp_selected");
   proveedor = corp;
   
   $(".area_compra").fadeIn();
   
   getArticulosXCorp();
   
   $(".proveedor").html(""+corp);
   $(".proveedor").attr("data-prioridad",prioridad);
   $("#titulo_corp").html("Articulos comprados de "+corp);
   
   var lista = $(".lista").position();
  
   $(".proveedor").css("left",lista.left + 80 );
   $(".proveedor").css("top",lista.top);  
   $(".proveedor").fadeIn();
   //$(".proveedor").css("color","red");
   var color = "green";
   if(prioridad == 1){
       color = "green";
   }else if(prioridad == 2){
       color = "yellow";
   }else{
       color = "red";
   }
   setTimeout('$(".proveedor").css("background-color","'+color+'");',500);
}

function mostrarProveedores(nro,tipo_prov){
    $("#corps").fadeIn();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "mostrarProveedoresCompra",nro:nro,tipo_prov:tipo_prov},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >"); 
        },
        success: function (data) {   
            if(data.length > 0){                        
                var cont = 0;
                for(var i in data){
                    cont++;
                    var corp = (data[i].cod_prov).toString();    
                    var prioridad =  data[i].prioridad;
                    $("#corps").append('<input class="corp" id="'+corp+'" type="button" value="'+corp+'" onclick=selectCorp("'+corp+'",'+prioridad+') >');
                } 
                var cw = $("#corps").width();
                var btw = $(".corp").width();
                var diff = cw - btw;
                
                if(diff < 20){ // 5px
                   $("#corps").width(btw+30); 
                }
                corps_original_width = $("#corps").width();
            }              
                           
        }
    });
}
function getArticulosAComprar(){
    var filtro = $("#buscarArticulos").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getArticulosAComprar",  "nro": nro_nota,filtro:filtro},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#articulos").empty();
            $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >"); 
        },
        success: function (data) {   
            if(data.length > 0){ 
                var array = new Array();
                for(var i in data){                    
                    var codigo = data[i].codigo; 
                    var articulo = data[i].descrip; 
                    $("#articulos").append("<option class='attributos_"+codigo+"' data-ligamento='' data-estetica='' data-tipo='' data-acabado='' data-combinacion='' data-composicion='' data-ancho='' data-gramaje='' data-um=''  value='"+codigo+"'>"+articulo+"</value>"); 
                    array.push(codigo);
                }
                getAtributosDeArticulo(array);
                               
            }
            $("#msg").html("");
        }
    });
}
function getAtributosDeArticulo(array){
    var codigos = JSON.stringify(array);
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getAtributosDeArticulo", codigos: codigos},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            for (var i in data) { 
                var ItemCode = data[i].codigo;
                var Ligamento = data[i].ligamento;  
                var Estetica = data[i].estetica;  
                var Tipo = data[i].tipo;  
                var Acabado = data[i].acabado;  
                var Combinacion = data[i].combinacion;  
                var Composicion = data[i].composicion;  
                var Ancho = data[i].ancho;  
                var Gramaje = data[i].gramaje_prom; 
                var UM = data[i].um;  
                $(".attributos_"+ItemCode).attr("data-ligamento",Ligamento);
                $(".attributos_"+ItemCode).attr("data-estetica",Estetica);
                $(".attributos_"+ItemCode).attr("data-tipo",Tipo);
                $(".attributos_"+ItemCode).attr("data-acabado",Acabado);
                $(".attributos_"+ItemCode).attr("data-combinacion",Combinacion);
                $(".attributos_"+ItemCode).attr("data-composicion",Composicion);
                $(".attributos_"+ItemCode).attr("data-ancho",Ancho);
                $(".attributos_"+ItemCode).attr("data-gramaje",Gramaje);
                $(".attributos_"+ItemCode).attr("data-um",UM);
            }  //codigo, ligamento,estetica, tipo,acabado,combinacion,composicion,ancho,gramaje_prom, um
            getColoresAComprar(); 
            $("#msg").html(""); 
        }
    });
}
function getColoresAComprar(){
   var init_time = new Date().getTime() / 1000;
   var codigo = $("#articulos").val();
   showAttributes(codigo);
   $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getColoresDeArticulosAComprar",  "nro": nro_nota,codigo:codigo},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >");
            $(".colores").remove(); 
        },
        success: function (data) {   
            if(data.length > 0){  
                var j = 0;
                for(var i in data){
                    var id_res = data[i].id_res; 
                    var codigo = data[i].codigo; 
                    var color = data[i].color;
                    var cantidad = data[i].cantidad;
                    var precio_est = data[i].precio_est;
                    j++;
                    $("#colores").append("<tr id='cm_"+id_res+"' data-codigo="+codigo+" data-color='"+color+"' class='colores' style='cursor:pointer;height:22px' ><td class='item clicable' >"+color+"</td><td class='num' id='cant_"+id_res+"'>"+cantidad+"</td><td class='num' id='comprado_"+id_res+"'>---</td><td class='num' id='comprado_id_"+id_res+"'>---</td><td class='num'>"+precio_est+"</td></tr>"); 
                } 
                //inicializarCursores("clicable");
                getCantidadCompradaXColor();
                var end_time = new Date().getTime() / 1000;
                $("#color_range").attr("max",j*16);
                $(".colores").bind("touchstart click",function(){  
                     var id = $(this).attr("id").substring(3,40);
                     comprar(id); 
                });
                log("Compra Internacional","Get Colores "+codigo,init_time,end_time)
            }
            $("#msg").html("");
        } 
    });
    
}
function showAttributes(ItemCode){
  $(".fila_attributos").remove();  
  var Ligamento =   $(".attributos_"+ItemCode).attr("data-ligamento");
  var Estetica =    $(".attributos_"+ItemCode).attr("data-estetica");
  var Tipo =        $(".attributos_"+ItemCode).attr("data-tipo");
  var Acabado =     $(".attributos_"+ItemCode).attr("data-acabado");
  var Combinacion=  $(".attributos_"+ItemCode).attr("data-combinacion");
  var Composicion=  $(".attributos_"+ItemCode).attr("data-composicion");
  var Ancho =      parseFloat( $(".attributos_"+ItemCode).attr("data-ancho")).format(2, 3, '.', ',');
  var Gramaje =    parseFloat( $(".attributos_"+ItemCode).attr("data-gramaje")).format(2, 3, '.', ',');
  $("#attr_art").append("<tr class='fila_attributos'><td class='itemc'>"+Ligamento+"</td><td class='itemc'>"+Estetica+"</td><td class='itemc'>"+Tipo+"</td><td class='itemc'>"+Acabado+"</td><td class='itemc'>"+Combinacion+"</td><td class='itemc'>"+Composicion+"</td><td class='num'>"+Ancho+"</td><td class='num'>"+Gramaje+"</td></tr>");
}
function getCantidadCompradaXColor(){
    $('tr[id^=cm_]').each(function(){
        var color = $(this).attr("data-color");
        var id = $(this).attr("id").substring(3,60);         
        getCantidadCompradaColorSpecifico(color,id);
    }); 
}
function getCantidadCompradaColorSpecifico(color,id){
        var codigo = $("#articulos").val();
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getCantidadComprada", nro: nro_nota,codigo:codigo,color:color,id_res:id},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#comprado_"+id).html("<img src='img/loading_fast.gif' width='14px' height='14px' >"); 
            },
            success: function (data) {   
                var comprado_x_id =  parseFloat(data[0].comprado_x_id);
                var comprado_x_color =  parseFloat(data[0].comprado_x_color);
                if(comprado_x_id == null || isNaN(comprado_x_id)){
                    comprado_x_id = 0;
                }
                if(comprado_x_color == null || isNaN(comprado_x_color)){
                    comprado_x_color = 0;
                }
                
                $("#comprado_"+id).html(comprado_x_color); 
                $("#comprado_id_"+id).html(comprado_x_id); 
                var cant = parseFloat($("#cant_"+id).html()); 
                if(comprado_x_color < (cant * 20 / 100)){// console.log("<20%");
                    $("#comprado_"+id).css("background","red");                    
                }else if( (comprado_x_color > (cant * 20 / 100)) && (comprado_x_color < (cant * 70 / 100))) {   //console.log(">20% < 70");
                    $("#comprado_"+id).css("background","orange");  
                }else{ //> 70%
                    $("#comprado_"+id).css("background","lightgray");
                }
            }
        });
    }

function guardarDatosCompra(){
    $("#guardar").attr("disabled",true);
    $("#msg_mon").html("");
     
    var unique_id = $("#unique_id").val();
    if($("#guardar").val()=="Aceptar"){ // Nuevo
       unique_id = genID(); 
    }else{
        $(editando_fila).remove();
    }
    var codigo = $("#fcodigo").val();
    var descrip = $("#fdescrip").val();
    var catalogo = $("#fcod_cat").val();    
    var fab_color_cod = $("#fcolor_cod_fab").val();
    var um = $("#fum").val();
    var color = $("#fcolor").val();
    var color_comb = $("#fcolor_comb").val();
    var cantidad = $("#fcantidad").val();
    var precio = $("#fprecio").val();
    var design = $("#fdesign").val();
    var comp = $("#fcomp").val();
    var gramaje = $("#fgramaje").val();
    var ancho = $("#fancho").val();
    var moneda = $("#moneda").val();    
    var imagen = $("#textAreaFileContents").val();    
    
    
    /*
     * 1-Encolar en DB Local
     * 2-Procesar Cola
     * 3-Por cada elemento verificar su estado, caso: Not Sending cambiar estado a Sending y continuar, caso: Sending, pasar a la siguiente unidad de cola 
     */
    if($("#guardar").val()=="Modificar"){ 
        cerrarFormulario();
    }   
    var data = {id:unique_id,action:"guardarDatosCompraPorCorp",id_pedido:comprando_id, nro: nro_nota,corp:proveedor, codigo:codigo ,descrip:descrip,catalogo:catalogo,fab_color_cod:fab_color_cod,um:um,color:color, color_comb:color_comb,cantidad:cantidad,precio:precio,design:design,comp:comp,gramaje:gramaje,ancho:ancho,moneda:moneda,imagen:imagen};
    $("#msg_form").html("Agregando...<img src='img/loading_fast.gif' width='18px' height='18px' >"); 
    encolar(data);
    
    
}

function encolar(data){
    var request = db.transaction("compras", "readwrite");
    var store = request.objectStore("compras");
    store.add(data);
    $("#msg_form").html("<img src='img/ok.png' width='18px' height='18px' >"); 
    request.onsuccess = function(event) {                 
        //procesarCola();           
    };         
    request.onerror = function(event) {
        alert("Error al agregar datos a la base de datos local.");         
    } 
    limpiarForm();
    setTimeout('$("#msg_form").html("")',3000);    
}
function procesarCola(){
    var store = db.transaction("compras").objectStore("compras");    
    store.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {            
            enviarDatos(cursor.key,cursor.value)            
            cursor.continue();
        } 
    };  
}
function enviarDatos(id,data){
    data.id = id;
    var init_time = new Date().getTime() / 1000;
    // Verifico si le estado del ID
    var estado = $(".estado_"+id).val();
    if(estado == undefined || estado == "Error" || estado == "Timeout"){
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: data,
            async: true,
            timeout: 6000,
            dataType: "json",
            beforeSend: function () {                 
                $("#compras_x_corp").append('<tr class="fila_compra estado_'+id+'"  id="fc_'+data.id_pedido+'"><td class="item catalog">'+data.catalogo+'-'+data.fab_color_cod+'</td>\n\
                    <td class="item color">'+data.color+'</td><td class="item">'+data.color_comb+'</td>\n\
                    <td class="num">'+data.cantidad+'</td><td class="item design">'+data.design+'</td><td class="item">'+data.comp+'</td>\n\
                    <td class="num">'+data.ancho+'</td><td class="num">'+data.gramaje+'</td><td class="itemc"><img class="img_'+id+'" src="img/clock.gif" width="14px" height="14px" ></td></tr>');            
            },
            success: function (data) {   
                var Status = data.Status; 
                var id_det = data.id_det; 
                if(Status == "Ok"){  
                    if(comprando_color != ""){
                       getCantidadCompradaColorSpecifico(comprando_color,comprando_id);
                    } 
                    var end_time = new Date().getTime() / 1000;
                    log("Compra Internacional","Guardar Articulo "+data.codigo,init_time,end_time)
                    desencolar(id);
                }else{                   
                   // Intentar nuevamente
                   console.log("Error..."+request +" "+status+" "+ err);
                }
            },
            error: function(request, status, err) {
                if (status == "timeout") {
                    // timeout -> reload the page and try again
                    console.log("Error timeout..."+request +" "+status+" "+ err);
                } else {
                    // another error occured  
                    alert("error: " +request +" "+status+" "+ err);
                }
            }
        });        
    }else{
        
    }    
    //console.log(JSON.stringify(data));
}
function desencolar(id){
    $(".img_"+id).attr("src","img/ok.png");
    var request = db.transaction(["compras"], "readwrite").objectStore("compras").delete(id);
   
    request.onsuccess = function(event) {
      console.log("prasad entry has been removed from your database.");
    };
}

function limpiarForm(){
    $("#guardar").val("Aceptar");
    $("#fcolor_cod_fab").val("");
    $("#fcolor").val("");
    $("#fcolor_comb").val("");
    
    $("#fdesign").val("");
    //$("#fcomp").val("");
    //$("#fancho").val("");
    //$("#fgramaje").val("");    
    $("#fcantidad").val("");
    $("#image-picker").val("");
    $("#textAreaFileContents").val("");
    $("#fcolor_cod_fab").focus();
}
function centrarYMostrar(){
    var w = $(window).width() / 2;
    var fw = $("#formulario").width() / 2; 
    var xpos = w - fw;
    $("#formulario").css("left",xpos);
    $("#formulario").slideDown("fast");
}
function comprar(id){
   
   if(proveedor != ""){                 
        centrarYMostrar();
        
        var color = $("#cm_"+id).attr("data-color");
        if(id==0){
            color = "";
        }
        comprando_id = id;
        comprando_color = color;
        
        var ancho =  ($(".fila_attributos :nth-child(7)").text()).replace(",",".");
        var gramaje =  ($(".fila_attributos :nth-child(8)").text()).replace(",",".");
        if(isNaN(gramaje)){
            gramaje = "";
        }
        var comp =   $(".fila_attributos :nth-child(6)").text();
        $("#fcodigo").val($("#articulos").val()); 
        $("#fdescrip").val($("#articulos option:selected" ).text());
        $("#fcolor").val(color); 
        $("#fancho").val(ancho); 
        $("#fcomp").val(comp); 
        $("#fgramaje").val(gramaje); 
        $("#fdescrip").attr("readonly",true);
          
        var um_art = $(".attributos_"+ $("#articulos").val()).attr("data-um");
         
        if(um_art == "Mts"){
            $("#fum").val("Mts");
        }else{//Unid
            $("#fum").val("Unid");
        }
        
        setAutocomplete();        
        
   }else{
      alert("Debe seleccionar un proveedor");
      errorMsg("Seleccione un proveedor o cree uno nuevo si no hay ninguno...",10000);
   }   
}
function cerrarFormulario(){
   $("#unique_id").val(""); 
   $("#guardar").val("Aceptar");
   $("#formulario").slideUp("fast"); 
   editando_fila = 0;
}
function getArticulosXCorp(){
     if(proveedor != ""){
         $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getArticulosCompradosXCorp", "nro": nro_nota,corp:proveedor},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >"); 
                $(".fila_compra").remove();
            },
            success: function (data) {   
                $( ".ui-widget-content" ).remove();
                for(var i in data){                  
                    var codigo = data[i].codigo;  
                    var descrip = data[i].descrip;  
                    $( "#articulos_x_corp" ).append('<li class="ui-widget-content" style="cursor:pointer" id="'+codigo+'">'+codigo+' - '+descrip+'</li>');
                }    
                $( "#articulos_x_corp" ).selectable({
                    selecting: function( event, ui ) {
                       selected_code = ui.selecting.id;
                       setTimeout("getComprasXCorp()",100); 
                    }        
                });             
                $("#msg").html(""); 
               } 
        });
     }
}
function getComprasXCorp(){
     
    if(proveedor != ""){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getColoresCompradosXCorp", "nro": nro_nota,codigo:selected_code,corp:proveedor},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >");
            $(".fila_compra").remove();
        },
        success: function (data) {   
            if(data.length > 0){                                        
                for(var i in data){
                    var unique_id = data[i].unique_id; 
                    var codigo = data[i].codigo; 
                    var id_det = data[i].id_det; 
                    var descrip = data[i].descrip; 
                    var cod_catalogo = data[i].cod_catalogo; 
                    var fab_color_cod = data[i].fab_color_cod; 
                    var color = data[i].color;
                    var cantidad = data[i].cantidad;
                    var color_comb = data[i].color_comb; 
                    if(color_comb == null ){ color_comb = "";}
                    var design = data[i].design; 
                    var precio = data[i].precio; 
                    var um = data[i].um; 
                    if(design == null ){ design = "";}
                    var composicion = data[i].composicion;
                    var ancho = data[i].ancho;
                    var gramaje = data[i].gramaje;                   
                    $("#compras_x_corp").append("<tr class='fila_compra' id='fc_"+id_det+"' data-codigo='"+codigo+"' data-um='"+um+"' data-precio='"+precio+"' data-unique_id='"+unique_id+"' data-descrip='"+descrip+"'><td class='item catalog' >"+cod_catalogo+"-"+fab_color_cod+"</td> <td class='item color'>"+color+"</td>\n\
                    <td class='item'>"+color_comb+"</td><td class='num'>"+cantidad+"</td><td class='item design'>"+design+"</td><td class='item'>"+composicion+"</td><td class='num'>"+ancho+"</td><td class='num'>"+gramaje+"</td>\n\
                    <td class='itemc'><img title='Editar' style='cursor:pointer;' src='img/edit.png' heigth='24' width='16' onclick='editar("+id_det+")'>&nbsp;&nbsp;\n\
                    <img title='Eliminar esta compra' style='cursor:pointer;' src='img/trash_mini.png' heigth='24' width='16' onclick='eliminarCompra("+id_det+")'></td></tr>"); 
                } 
            }
            $("#msg").html("");
        }
    }); 
    }
}
function newCorp(){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "nuevoProveedorDeCompra", "nro": nro_nota,usuario:getNick(),tipo_prov:tipo_prov},
        async: true,
        dataType: "html",
        beforeSend: function () { 
            $("#corps").prepend("<img src='img/loading_fast.gif' width='22px' height='22px' class='loading' >");
        },
        complete: function (objeto, exito) {
            if (exito == "success") {    
                $(".loading").remove();
                var corp = $.trim(objeto.responseText);                       
                $("#corps").prepend('<input class="corp" id="'+corp+'" type="button" value="'+corp+'" onclick=selectCorp("'+corp+'",1) >');
                $("#"+corp).css("color","red");                 
                setTimeout('$("#'+corp+'").css("color","black");',5000);
            }
        },
        error: function () {
            errorMsg("Ocurrio un error en la comunicacion con el Servidor...",10000);
        }
    }); 
}
function ocultarProveedores(){
   var oc =  $("#ocultarProv").val(); 
   
   if(oc == "+"){ // Abierto
       $(".lista_corps").fadeIn();
       $("#ocultarProv").val("-"); 
       $(".new_corp").removeAttr("disabled");   
       $(".new_corp").fadeIn();
   }else{    // Cerrado
       $(".new_corp").attr("disabled",true); 
       $(".new_corp").fadeOut();
       $("#ocultarProv").val("+"); 
       $(".lista_corps").fadeOut();      
   }
}

function cambiarMoneda(){
    var moneda = $("#moneda").val();
 
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "cambiarMonedaCorp", "moneda": moneda, "nro": nro_nota,corp:proveedor},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg_mon").html("<img src='img/loading_fast.gif' width='18px' height='18px' >");                        
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);   
                $("#msg_mon").html(result); 
                setTimeout('$("#msg_mon").html("")',5000);     
            }
        },
        error: function () {
            $("#msg_mon").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}


function guardarImagen(){
    var imagen = $("#textAreaFileContents").val();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "saveImageBase64Test", "imagen": imagen},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading.gif' width='22px' height='22px' >");                      
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);                       
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}
function eliminarCompra(id_det){
    var catalog = $("#fc_"+id_det).find(".catalog").html();
    var color = $("#fc_"+id_det).find(".color").html();
    var design = $("#fc_"+id_det).find(".design").html();
    if(catalog == undefined){ catalog = "Sin Catalogo";}
    if(color == undefined){ color = "Sin Color Definido";}
    if(design == undefined){ design = "";}
    
    $("#msg_delete").html("Esta seguro de que desea eliminar esta fila de compra: "+catalog+" "+color+" "+design+" ?");
    
    $( "#dialog-confirm" ).dialog({
      resizable: false,
      height:140,
      modal: true,
      buttons: {
        "Eliminar registro": function() {
          $.ajax({
                type: "POST",
                url: "Ajax.class.php",
                data: {"action": "eliminarRegistroCompra", id_det:id_det, nro: nro_nota},
                async: true,
                dataType: "html",
                beforeSend: function () {
                    $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >");                      
                },
                complete: function (objeto, exito) {
                    if (exito == "success") {                          
                        var result = $.trim(objeto.responseText);  
                        if(result=="Ok"){
                            $("#fc_"+id_det).remove();
                            $("#msg").html(result);  
                        }else{
                          $("#msg").html("Ocurrio un error en la comunicacion con el Servidor intente mas tarde o contacte con el Administrador...");  
                        }
                    }
                },
                error: function () {
                    $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
                }
            });   
          $( this ).dialog( "close" );
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      }
    });
    
}
function editar(id_det){
   var fila = $("#fc_"+id_det);
   editando_fila = fila;
   $("#fcodigo").val(fila.attr("data-codigo")); 
   $("#fdescrip").val(fila.attr("data-descrip")); 
   $("#fcod_cat").val($("#fc_"+id_det+"  :nth-child(1)").text().split("-")[0]); 
   $("#fcolor_cod_fab").val($("#fc_"+id_det+"  :nth-child(1)").text().split("-")[1]);      
   $("#fcolor").val($("#fc_"+id_det+" :nth-child(2)").text());
   $("#fcolor_comb").val($("#fc_"+id_det+" :nth-child(3)").text());
   $("#fcantidad").val($("#fc_"+id_det+" :nth-child(4)").text());
   $("#fprecio").val(fila.attr("data-precio"));
   $("#fgramaje").val($("#fc_"+id_det+" :nth-child(8)").text());
   $("#fancho").val($("#fc_"+id_det+" :nth-child(7)").text());
   $("#fcomp").val($("#fc_"+id_det+" :nth-child(6)").text());
   $("#fdesign").val($("#fc_"+id_det+" :nth-child(5)").text());
   $("#fum").val(fila.attr("data-um"));
   $("#unique_id").val(fila.attr("data-unique_id")); 
   $("#guardar").val("Modificar");
   centrarYMostrar();
} 

function loadImageFileAsURL(){ 
    
    $("#msg_form").html("Aguarde un momento...  <img src='img/loading_fast.gif' width='16px' height='16px' >");
    $("#guardar").attr("disabled",true);
    var filesSelected = document.getElementById("image-picker").files;
    
    if (filesSelected.length > 0)  {
        var fileToLoad = filesSelected[0];  
        var fileReader = new FileReader(); 
        fileReader.onload = function(fileLoadedEvent){           
            //var textAreaFileContents = document.getElementById("textAreaFileContents");     
            //textAreaFileContents.innerHTML = fileLoadedEvent.target.result;
            $("#textAreaFileContents").val(fileLoadedEvent.target.result);
            checkForm();
        };        
        fileReader.readAsDataURL(fileToLoad);         
    }else{
        alert("No se ha tomado ninguna imagen");
    }
    checkForm();
    $("#msg_form").html("");
}
function setPrioridad(){
    var prior = $(".proveedor").attr("data-prioridad");
    var corp = $(".proveedor").html();
    
    var color = "";
    var prioridad = prior;
    if(prior == 1){        
        color = "yellow"; 
        prioridad = 2;
    }else if(prior == 2){         
        color = "red";   
        prioridad = 3;        
    }else{        
        color = "green";  
        prioridad = 1;
    }
    
    $("#"+corp).click(function(){
        selectCorp(corp,prioridad);
    });
     $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "cambiarPrioridadProveedor", nro:nro_nota, corp: proveedor,prioridad:prioridad },
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >");                      
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);    
                $("#msg").html(result);
                $(".proveedor").attr("data-prioridad",prioridad);
                $(".proveedor").css("background-color",color);
            }
        },
        error: function () {
            errorMsg("Ocurrio un error en la comunicacion con el Servidor, compruebe su conexion.");
        }
    });  
}
function productoNuevo(){
   if($("#prod_nuevo").is(":checked")){ 
        codigo_ant = $("#fcodigo").val();
        descrip_ant = $("#fdescrip").val();
        $("#fcodigo").val(""); 
        $("#fdescrip").val("");
        $("#fdescrip").removeAttr("readonly");
        $("#fdescrip").focus();
        checkForm();
   }else{
       $("#fcodigo").val(codigo_ant); 
       $("#fdescrip").val(descrip_ant);
       $("#fcod_cat").focus();
   }
}
function cambiarArticulo(){
   
    if($(".toggle-button").hasClass("toggle-button-selected")){ 
        //$("#prod_nuevo").removeAttr("checked");
        codigo_ant = $("#fcodigo").val();
        descrip_ant = $("#fdescrip").val();
        $("#codigo").val(""); 
        $("#fdescrip").val("");
        $("#fdescrip").attr("placeholder","Busque aqui");
        $("#fdescrip").removeAttr("readonly");
        $("#fdescrip").focus();
    }else{
       $("#fcodigo").val(codigo_ant); 
       $("#fdescrip").val(descrip_ant);
       $("#fcod_cat").focus();
    }
}
function buscarArticulo(){
    var articulo = $("#fdescrip").val();
    
    if(articulo.length > 0){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "buscarArticulos", "articulo": articulo,"cat":1},
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msgart").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function(data) { 
            
            if(data.length > 0){
                limpiarListaArticulos();
                var k = 0;
                for(var i in data){        
                    k++;
                    var ItemCode = data[i].codigo;
                    var Sector = data[i].sector;
                    var NombreComercial = data[i].descrip; 
                    var Precio =  parseFloat(  (data[i].precio) ).format(0, 3, '.', ',');
                    var Ancho = parseFloat(data[i].ancho).format(2, 3, '.', ',');
                    var Composicion = data[i].composicion;
                    var UM = data[i].um;
                    
                    $("#lista_articulos") .append("<tr class='tr_art_data fila_art_"+i+"' data-precio="+Precio+" data-um="+UM+"><td class='item clicable_art'><span class='codigo' >"+ItemCode+"</span></td>\n\
                    <td class='item clicable_art'><span class='Sector'>"+Sector+"</span> \n\
                    </td><td colspan='2'  class='item clicable_art'><span class='NombreComercial'>"+NombreComercial+"</span></td> \n\
                    <td class='num clicable_art'>"+Ancho+"</td>\n\
                    <td class='item clicable_art'>"+Composicion+"</td>\n\
                    <td class='num clicable_art'>"+Precio+"</td>\n\
                    </tr>");                                                      
                    cant_articulos = k;
                }  
                inicializarCursores("clicable_art"); 
                $("#ui_articulos").fadeIn();
                $(".tr_art_data").bind("touchstart click",function(){                            
                      seleccionarArticulo(this); 
                });
                $("#msgart").html(""); 
            }else{
                $("#msgart").html("Sin resultados..."); 
                $(".tr_art_data").remove();
                setTimeout(function(){
                    $("#msgart").html(""); 
                },5000);
            }
        }
    });
    }
} 
function seleccionarArticulo(obj){
    var codigo = $(obj).find(".codigo").html();
    var sector = $(obj).find(".Sector").html(); 
    var nombre_com = $(obj).find(".NombreComercial").html();  
    var precio = $(obj).attr("data-precio");
    var um = $(obj).attr("data-um");
    $("#fcodigo").val(codigo);
    $("#fdescrip").val(sector+"-"+nombre_com); 
    $("#ui_articulos").fadeOut();  
    $("#otro_art").removeAttr("checked");
}
function cerrarNotaDePedido(nro){
    var obs = prompt("Confirme el CIERRE DEFINITIVO dejando una Observacion! o deje en Blanco para Cancelar");
    
    if(obs != null){
        $("#msg_del").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
        infoMsg("Cerrando nota de Pedido Favor espere...",8000);
        $.post( "Ajax.class.php",{ action: "cerrarNotaPedidoCompra",nro:nro,obs:obs,usuario:getNick()}, function( data ) {
            infoMsg(data,10000);   
            $("#msg_del").html(data);
        },'text');  
    } 
}
function limpiarListaArticulos(){    
    $(".tr_art_data").each(function () {   
       $(this).remove();
    });    
} 
function selectRowArt(row) {
    $(".art_selected").removeClass("art_selected");
    $(".fila_art_" + row).addClass("art_selected");
    $(".cursor").remove();
    $($(".fila_art_" + row + " td").get(2)).append("<img class='cursor' src='img/l_arrow.png' width='18px' height='10px'>");
    escribiendo = false;   
} 
function cerrarUIArticulos(){
    $("#ui_articulos").fadeOut();
}
function setColorsHeight(){
    var h = $("#color_range").val();
    $("#color_div").height(h);
}
function selectDesigns(show){
    
    if(!loadDesings){
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "getDesignsImages"},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<br><img src='img/loading_fast.gif' width='16px' height='16px' >Loading long list of design patterns, please wait.");
                $("#msg").addClass("info");
            },
            success: function (data) { 
                //console.log(data);
                var l = data.length;
                var j = 0;
                for (var i in data) { 
                   var key = data[i].key;
                   var name = data[i].name;
                   var thums = data[i].thumnails;
                   var ul = '<ul id="'+key+'" data-name="'+name+'" >';
                   for (var i = 0; i < thums.length; ++i) {
                       var img = thums[i];
                       var class_ = "";
                       if(i == 0 ){
                           class_ = "class='lastitem'";      
                       }
                       ul += '<li '+class_+'><img title="'+key+'" src="img/PATTERNS/'+key+'/'+img+'" height="46"  ></li>'; 
                       $("#msg").html("Design: "+key+"/"+img);
                   }

                   ul += '</ul>';
                   $("#designs_container").append(ul);
                   //console.log(key+"  "+name+"  "+thums);

                }                
                $("#designs_container li").click(function() {
                    var name = $(this).parent().attr("data-name");
                    $("#fdesign").val(name);
                    $("#designs_container").fadeOut();
                });
                
                loadDesings = true;
                $("#msg").html("Load complete..."); 
            }
        });
    }
    var window_width = $(document).width()  / 2;
    var desing_width = $("#designs_container").width()  / 2;   
    var  posx = (window_width - desing_width) ;        
    posx = posx+"px";  
    $("#designs_container").css({left:posx,top:50}); 
    
    if(show){$("#designs_container").fadeIn();}   
}
function hideDesigns(){
    $("#designs_container").fadeOut();
}
function verResumenCompra(){     
    var usuario = getNick();
    var tipo_res = $("#tipo_res").val();
    var url = "compras/ResumenCompra.class.php?nro="+nro_nota+"&usuario="+usuario+"&tipo_res="+tipo_res;
    var title = "Resumen Compra Internacional";
    var params = "width=800,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=no,location=no";
    window.open(url,title,params);  
}
function gallery(){     
    
    var url = "files/compras/index.php?path="+nro_nota+"/"+proveedor+"&provider="+proveedor+"";
    var title = "Galeria de Compras Internacionales";
    var params = "width=800,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=no,location=yes";
    window.open(url,title,params);  
}
function genID(){
    return Date.now();
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
         
        if(tecla == "13"){             
            var id = e.target.id; 
            var tabindex = $("#"+id).attr('tabindex');
            tabindex++; //increment tabindex            
            $('input[tabindex='+tabindex+']').focus();
        }
        //console.log(e.keyCode+"  "+ e.which);
	if((tecla >= "97") && (tecla <= "122")){
		return false;
	}
} 

function log(type,action,init_time,end_time){
    var usuario = getNick();
    $.post("Ajax.class.php", {action: "logConectividad", init_time: init_time, end_time: end_time,usuario:usuario,nro:nro_nota,tipo:type,accion:action});
}


