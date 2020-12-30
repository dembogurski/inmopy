
var codigo_temporada = 0;
var estante = 0;
var fila = 0;
var col = 0;    
var permiso_modificar = false;
var firingRPC = false;

var fila_art = 0;
var cant_articulos = 0;
var escribiendo = false;

var definiciones = new Array();
var rem_proc = new Array();
var pedir_proc = new Array();
var codigo_remitir = "";
var codigo_pedir = "";


$(function(){
    getTemporadas($("#estante").val() );
    getResumenArticulosXEstante($("#estante").val());
    estante = $("#estante").val();
    permiso_modificar = eval($("#permiso_modificar").val());   
    if(permiso_modificar){
      $("#add_remove_temporadas").fadeIn();  
    }
    $(".lotes_remitir_container").draggable();
    $(".lotes_pedir_container").draggable();
     
    $("#check_all_remitir").click(function(){
        var remitir = $("#total_req_remitir").val(); 
        $(".check_remitir").prop("checked",false);
        
        if($(this).is(":checked")){
           rem_proc = new Array();
            var total = 0;
            $(".check_remitir").each(function(){
                var color = $(this).parent().parent().find(".color").text();

                var stock = parseFloat($(this).parent().parent().find(".stock").text());

                if(rem_proc.indexOf(color) < 0){
                    if(total < remitir ){
                      total += stock;
                      $(this).prop("checked",true);
                      rem_proc.push(color);
                    }
                }
                $("#total_remitir").val(total.toFixed(2)); 
            }); 
            if(remitir > total){
                msg("Seleccione manualmente los colores faltantes a Remitir",15000);
                hideMsg(8);
                sumarMarcados();
            }
        }else{
            $("#total_remitir").val(0); 
        }         
    });
    $("#check_all_pedir").click(function(){
        var pedir = $("#total_req_pedir").val(); 
        $(".check_pedir").prop("checked",false);
        
        if($(this).is(":checked")){
           pedir_proc = new Array();
            var total = 0;
            $(".check_pedir").each(function(){
                var color = $(this).parent().parent().find(".color").text();

                var stock = parseFloat($(this).parent().parent().find(".stock").text());

                if(pedir_proc.indexOf(color) < 0){
                    if(total < pedir ){
                      total += stock;
                      $(this).prop("checked",true);
                      pedir_proc.push(color);
                    }
                }
                $("#total_pedir").val(total.toFixed(2)); 
            }); 
            sumarMarcadosPedir();
        }else{
            $("#total_remitir").val(0); 
            $(".resaltar").removeClass("resaltar");
        }         
    });
     
    
    
    //Animacion
    $(".camion_bar0").click(function(){
          var parentOffset = $(this).parent().offset(); 
                //or $(this).offset(); if you really just want the current element's offset
          /*var relX = e.pageX - parentOffset.left;
          var relY = e.pageY - parentOffset.top;*/
    });
  
});

function sumarMarcados(){
    var total = 0;
    var remitir = $("#total_req_remitir").val(); 
    $(".check_remitir").each(function(){
        if($(this).is(":checked")){
           var stock = parseFloat($(this).parent().parent().find(".stock").text());
           total += stock;
        }
    });
    $("#total_remitir").val(total.toFixed(2)); 
    if(remitir > total){
       $("#total_remitir").css("background","red");
    }else{
       $("#total_remitir").css("background","green");
    }        
}

function sumarMarcadosPedir(){
    var total = 0;
    var pedir = $("#total_req_pedir").val(); 
    $(".resaltar").removeClass("resaltar");
    $(".check_pedir").each(function(){
        if($(this).is(":checked")){
           var stock = parseFloat($(this).parent().parent().find(".stock").text()); 
           var pol = parseFloat($(this).parent().parent().find(".stock").next().text());
           var cant_pedir = parseFloat($(this).parent().parent().find(".stock").attr("data-pedir"));
           total += cant_pedir;
           
           if(stock > pol){
               $(this).parent().parent().find(".stock").next().addClass("resaltar");
           }else{
               $(this).parent().parent().find(".stock").addClass("resaltar");
           }
        }
    });
    $("#total_pedir").val(total.toFixed(2)); 
    if(total < pedir  ){
       $("#total_pedir").css("background","red");
    }else{
       $("#total_pedir").css("background","green");
    }        
}

function selectCuadrante(id){   
    $("#toolbar").fadeIn();
    var c = id.split("_");
    estante = c[0];
    fila = c[1];
    col = c[2];    
    $("#cuadrante").html(""+estante+"-"+fila+"-"+col);
    //getCuadProperties(estante,fila,col);    
    getCapacidadCuadrante(estante,fila,col,codigo_temporada);    
    getContenidoUbicacion();
    reestablecerColores();
    resaltarCuadrante(""+estante+"_"+fila+"_"+col,"#74b9ff");
}

function getTemporadas(estante ){
    var suc = $("#suc").val();
    
    $.ajax({
        type: "POST",
        url: "Estantes.class.php",
        data: {"action": "getTemporadas", suc: suc,estante:estante },
        async: true,
        dataType: "json",
        beforeSend: function () {
           // $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            $(".fila_temp").remove();
            var j = 1;
            for (var i in data) { 
                var temporada = data[i].temporada;  
                var desde = data[i].desde;
                var hasta = data[i].hasta;
                var temporada_actual = data[i].temporada_actual;
                var current_temp = "";
                var img_current = "";
                var indicator = "";
                if(temporada_actual == "1"){
                    current_temp = " current_temp"; 
                    img_current = "<img class='arrow' src='../../img/l_arrow.png' width='24' style='margin-right:-40px'>";
                    indicator = " pos";
                    codigo_temporada = temporada;
                }else{
                    current_temp = ""; 
                    img_current = "";
                }
                var disable = "disabled='disabled'";
                if(permiso_modificar){
                    disable = "";
                }
                var readonly_desde = "";
                var clase = 'fecha';
                if(temporada > 1){
                    readonly_desde = "readonly='readonly'";
                    clase = '';
                } 
                $("#temporadas_bloque").append("<tr class='fila_temp"+current_temp+"'>\n\
                <td class='temp' style='text-align:center' >"+temporada+"</td> \n\
                <td class='itemc temporada_"+temporada+"'> <input type='text' size='7' class='"+clase+" desde' value='"+desde+"' "+readonly_desde+" "+disable+"></td>\n\
                <td class='itemc'> <input type='text' size='7' class='fecha hasta' value='"+hasta+"' "+disable+"></td>\n\
                <td class='last_col"+indicator+"'>"+img_current+"</td></tr>");
                j++;
            }   
            $("#temporadas_bloque td").click(function(){
                $(".current_temp").removeClass("current_temp");
                $(this).parent().addClass("current_temp");
                var img = $(".pos").html(); 
                $(".pos").html("");
                $(".pos").removeClass("pos");
                codigo_temporada = $(this).parent().find(".temp").html();
                $(this).parent().children().last().html(img);
                $(this).parent().children().last().addClass("pos");
                getCapacidadCuadrante(estante,fila,col,codigo_temporada)
            }); 
            $(".fecha").mask("99-99");
            $(".desde").mask("99-99");
            if(permiso_modificar){ 
                
                //$(".fecha").datepicker({ dateFormat: 'dd-mm' });  
                $(".hasta").change(function(){
                    $(".hasta").each(function(){
                        var temp = $(this).parent().parent().find(".temp").html();
                        var desde = $(this).parent().parent().find(".desde").val();
                        var hasta = $(this).parent().parent().find(".hasta").val();
                        console.log(temp+"  "+desde+"  "+hasta);
                        updateTempDate(temporada,desde,hasta); 
                    });
                });
            }
        }        
    });
}
function getResumenArticulosXEstante(estante){
    var suc = $("#suc").val();
    
    $.ajax({
        type: "POST",
        url: "Estantes.class.php",
        data: {"action": "getResumenArticulosXEstante", suc: suc,estante:estante },
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#resumen_x_articulo").remove(".fila_resumen");
        },
        success: function (data) {   
            for (var i in data) { 
                var ItemCode = data[i].codigo;
                var ItemName = data[i].descrip;      
                var stock = data[i].stock;  
                var um = data[i].um;
                var Piezas = data[i].Piezas;
                $("#resumen_x_articulo").append("<tr class='fila_resumen' >\n\
                <td class='itemc resumen' style='width: 8%;cursor:pointer'>"+ItemCode+"</td><td class='item descrip_"+ItemCode+"' style='width: 23%'>"+ItemName+"</td>\n\
                <td class='num' style='width: 6%'>"+Piezas+"</td><td class='code_mts_"+ItemCode+" num' style='width: 9%' title='"+um+"'>"+stock+"</td>\n\
                <td class='def_"+ItemCode+" itemc  def' style='width: 8%'></td><td class='def_descrip_"+ItemCode+" item  def' style='width: 23%'></td>\n\
                <td class='def_pz_"+ItemCode+" num  def' style='width: 6%'></td><td class='def_mts_"+ItemCode+" num def' style='width: 9%'></td><td style='width: 4%' class='itemc dif_mts_"+ItemCode+" def'></td><td style='width: 4%' class='itemc dif_img_"+ItemCode+" def'></td></tr>");
            }
             
            
            agregarEventoClick();
             
            getDefinicionXTermorada();
        }
    });
}
function agregarEventoClick(){
    console.log("agregarEventoClick");
    $(".resumen").click(function(){
                var codigo = $(this).html();
                $(".selected_code").removeClass("selected_code");
                $(this).addClass("selected_code");
                $(this).next().addClass("selected_code");
                resaltarCuadrantesXCodigo(codigo);
    });    
}
function resaltarCuadrantesXCodigo(codigo){
    var suc = $("#suc").val();
    
    //Depende del Radio Button
    var tipo =  $("input[name='tipo']:checked"). val();
    
    var url = "getCuadrantesOcupadosXCodigo";
    
    if(tipo == "Temporada"){
        url = "getCuadrantesOcupadosXCodigoYtemporada";
    }
    
    $.ajax({
        type: "POST",
         url: "Estantes.class.php",
        data: {"action": url, suc: suc,estante:estante,codigo:codigo,temporada:codigo_temporada },
        
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='../../img/loading_fast.gif' width='16px' height='16px' >"); 
            reestablecerColores();
        },
        success: function (data) {   
            for (var i in data) { 
                var cuadrante = data[i].Cuadrante;
                resaltarCuadrante(cuadrante,"orange");                  
            }   
            $("#msg").html(""); 
        }
    });      
}
function definicionesPendientes(){
    var suc = $("#suc").val();
     
    $.ajax({
        type: "POST",
         url: "Estantes.class.php",
        data: {"action": "definicionesPendientes", suc: suc,estante:estante,temporada:codigo_temporada },
        
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='../../img/loading_fast.gif' width='16px' height='16px' >"); 
            reestablecerColores();
        },
        success: function (data) {   
            for (var i in data) { 
                var cuadrante = data[i].Cuadrante;
                resaltarCuadrante(cuadrante,"green");                  
            }   
            $("#msg").html(""); 
        }
    });      
}
function reestablecerColores(){
   var canvasObjects = canvas.getObjects();
    var ObjectsArray = new Array();

    for(obj in canvasObjects){ // console.log(canvasObjects[obj].get('type'));
        
        if(canvasObjects[obj].get('type')  === 'group'){
            ObjectsArray.push(canvasObjects[obj]);
            var groupObjects = canvasObjects[obj].getObjects();
            for(groupObj in groupObjects){
                 var g_id = groupObjects[groupObj].id;
                    //console.log(groupObj+"  id:"+  g_id);
                    if(g_id != undefined){
                        if( g_id.substring(0,6) == 'fondo_'    ) {
                            ObjectsArray.push(groupObjects[groupObj]); 
                            canvas.setActiveObject(groupObjects[groupObj]);
                            canvas.getActiveObject().set("fill", colorFondo);
                            canvas.renderAll();
                        } 
                    }
            }
        } 
    }
    canvas.renderAll();
    canvas.discardActiveObject();
}
function resaltarCuadrante(group_id,color){

    var canvasObjects = canvas.getObjects();
    var ObjectsArray = new Array();

    for(obj in canvasObjects){
        if(canvasObjects[obj].id  == group_id){
            ObjectsArray.push(canvasObjects[obj]);
            var groupObjects = canvasObjects[obj].getObjects();
            for(groupObj in groupObjects){
                
                if(groupObjects[groupObj].id == 'fondo_'+group_id){
                    ObjectsArray.push(groupObjects[groupObj]); 
                    canvas.setActiveObject(groupObjects[groupObj]);
                    canvas.getActiveObject().set("fill", color);
                    canvas.renderAll(); 
                }
            }
        } 
    }
    canvas.renderAll();
    canvas.discardActiveObject();
    return ObjectsArray;
}

function getDefinicionXTermorada(){
    var suc = $("#suc").val();    
    $.ajax({
        type: "POST",
        url: "Estantes.class.php",
        data: {"action": "getResumenXTemporadaYEstante", suc: suc,estante:estante,temporada:codigo_temporada },
        async: true,
        dataType: "json",
        beforeSend: function () {
           definiciones = new Array();  
           $(".def").not(":empty").html("---");
           $(".faltante_de_temporada").remove();
        },
        success: function (data) { 
            definiciones = data;
            for (var i in data) { 
                var ItemCode = data[i].ItemCode;
                var ItemName = $(".descrip_"+ItemCode).html();      
                var MtsDefinido = data[i].Mts;      
                var Piezas = data[i].Piezas;
                
                if($(".def_"+ItemCode).length == 0){ 
                    $("#resumen_x_articulo > tbody > tr:first").before("<tr class='fila_resumen faltante_de_temporada' >\n\
                    <td class='itemc resumen undefined' style='width: 8%;cursor:pointer'>"+ItemCode+"</td><td class='item descrip_"+ItemCode+"' style='width: 23%'>"+ItemName+"</td>\n\
                    <td class='num' style='width: 6%'>0</td><td class='code_mts_"+ItemCode+" num' style='width: 9%'>0</td>\n\
                    <td class='def_"+ItemCode+" itemc  def' style='width: 8%'></td><td class='def_descrip_"+ItemCode+" item  def' style='width: 23%'></td>\n\
                    <td class='def_pz_"+ItemCode+" num  def' style='width: 6%'></td><td class='def_mts_"+ItemCode+" num def' style='width: 9%'></td><td style='width: 4%' class='itemc dif_mts_"+ItemCode+" def'></td><td style='width: 4%' class='itemc dif_img_"+ItemCode+" def'></td></tr>");
                } 
                
                $(".def_"+ItemCode).html(ItemCode);
                $(".def_descrip_"+ItemCode).html(ItemName);
                $(".def_mts_"+ItemCode).html(MtsDefinido);
                $(".def_pz_"+ItemCode).html(Piezas);
                var cant_actual_codigo = parseFloat($(".code_mts_"+ItemCode).html());
                var img = "<img src='../../img/in.png' height='18'>";      
                var diff = (MtsDefinido - cant_actual_codigo   ).toFixed(1);
                if(MtsDefinido == ""){
                    MtsDefinido = 0; 
                }
                if(cant_actual_codigo > MtsDefinido  ){
                    diff = diff*-1;
                    img = "<img src='../../img/red_arrow_right.png' height='22' class='arrow' onclick=remitir('"+ItemCode+"',"+diff+") >";
                    
                    diff = "<span style='color:green;font-weight:bolder' title='"+diff+" dem&aacute;s, debe sacar' >+"+diff+"</span>";
                }else{
                    img = "<img src='../../img/green_arrow_left.png' height='22' class='arrow' onclick=listaSolicitudTraslado('"+ItemCode+"',"+diff+")>";                    
                    diff = "<span style='color:red;font-weight:bolder' title='"+diff+" menos, debe reponer' >-"+diff+"</span>";
                }
                $(".dif_img_"+ItemCode).html(img);
                $(".dif_mts_"+ItemCode).html(diff);
            }  
            getNombresArticulosNoDefinidos();
            agregarEventoClick();
        }
    }); 
}
function remitir(codigo,cantidad){
    codigo_remitir = codigo;
    var pos = $(".def_"+codigo).position();
    $(".lotes_remitir_container").slideDown();
    $(".lotes_remitir_container").offset({top: pos.top + 26,left:pos.left});
    $("#codigo_art_rem").html(" Articulo:  "+codigo);
    $("#total_req_remitir").val(cantidad); 
    var suc = $("#suc").val();
    $.ajax({
        type: "POST",
        url: "Estantes.class.php",
        data: {"action": "remitir", codigo: codigo,cantidad:cantidad,suc:suc},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_remitir").html("<img src='../../img/loading_fast.gif' width='16px' height='16px' >"); 
            $(".fila_remito").remove();
        },
        success: function (data) {   
            for (var i in data) { 
                var Lote = data[i].lote;
                var Color = data[i].color;                 
                var Design = data[i].design;                 
                var Stock = data[i].stock;                 
                var Img = data[i].mg;                 
                var doc = data[i].doc;
                var check = "<input type='checkbox' class='check_remitir'>";
                var title = "";
                if(doc != undefined){
                    check = "<img src='../../img/warning_yellow_16.png' width='16px' height='16px' >";
                    var nro_ = data[i].nro_doc;
                    var suc_ = data[i].suc;
                    title = "En "+doc+" Nro: "+nro_+"  Suc: "+suc_;
                }
                $("#tabla_remision").append("<tr class='fila_remito' ><td class='item lote xlote_"+Lote+"'>"+Lote+"</td><td class='item color'>"+Color+"</td><td class='item'>"+Design+"</td><td class='num stock'>"+Stock+"</td> <td class='itemc check_"+Lote+"' title='"+title+"'>"+check+"</td></tr>");
            }   
            $("#msg_remitir").html(""); 
            $(".check_remitir").click(function(){
              sumarMarcados();
            });
            sumarMarcados();
        }
    });    
}
function remitirLotes(){
    var lotes = new Array();
    $(".check_remitir").each(function(){
        if($(this).is(":checked")){
           var lote = $(this).parent().parent().find(".lote").text();       
           lotes.push(lote);
        }
    });   
    var aux_lotes = lotes;
    if(lotes.length > 0){
        var c = confirm("Confirma que desea remitir estas piezas?");
        if(c){
            lotes = JSON.stringify(lotes);
            var suc = $("#suc").val();
            var usuario = $("#usuario").val();
            var destino = "00";
            $.ajax({
                type: "POST",
                url: "Estantes.class.php",
                data: {"action": "remitirLotes",usuario:usuario,codigo:codigo_remitir, lotes: lotes,suc:suc,destino:destino},
                async: true,
                dataType: "json",
                beforeSend: function () {
                    $("#msg_remitir").html("<img src='../../img/loading_fast.gif' width='16px' height='16px' >");
                    aux_lotes.forEach(function(l) {
                        $(".check_"+l).html("<img src='../../img/loading_fast.gif' width='14px' height='14px' >");
                    }); 
                },
                success: function (data) {   
                    for (var i in data) { 
                        var lote = data[i];
                        $(".check_"+lote).prop("title","Este Lote se acaba de cargar en un documento por otro usuario, recargue para mas info");
                        $(".check_"+lote).html("<img  src='../../img/warning_red_16.png' width='14px' height='14px' >");
                        $(".check_"+lote).removeClass("check_"+lote); 
                    }                    
                    aux_lotes.forEach(function(l) {
                        $(".check_"+l).html("<img src='../../img/ok.png' width='14px' height='14px' >");
                    }); 
                    
                    $("#msg_remitir").html("Los lotes se cargaron en una Remision Abierta!"); 
                }
            });   
        }        
    }else{
        alert("Seleccione los lotes que desea remitir...");
    }
}

function listaSolicitudTraslado(codigo,cantidad){
    codigo_pedir = codigo;
    var pos = $(".def_"+codigo).offset();
    $(".lotes_pedir_container").slideDown();
    $(".lotes_pedir_container").offset({top: pos.top + 26,left:pos.left});
    $("#codigo_art_pedir").html(" Articulo:  "+codigo);
    $("#total_req_pedir").val(cantidad); 
    var suc = $("#suc").val();
    $.ajax({
        type: "POST",
        url: "Estantes.class.php",
        data: {"action": "getArticulosDisponiblesDeposito", codigo: codigo,cantidad:cantidad,suc:"00"},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_pedir").html("<img src='../../img/loading_fast.gif' width='16px' height='16px' >"); 
            $(".fila_pedidos").remove();
        },
        success: function (data) {   
            for (var i in data) { 
                var Lote = data[i].Lote;
                var Color = data[i].Color;                 
                var Design = data[i].Design;                 
                var Stock = parseFloat(data[i].Stock);                 
                var Img = data[i].Img;                 
                var Politica = parseFloat(data[i].Pol);    
                var doc = data[i].doc;
                var check = "<input type='checkbox' class='check_pedir'>";
                var title = "";
                if(doc != undefined){
                    check = "<img src='../../img/warning_yellow_16.png' width='16px' height='16px' >";
                    var nro_ = data[i].nro_doc;
                    var suc_ = data[i].suc;
                    title = "En "+doc+" Nro: "+nro_+"  Suc: "+suc_;
                }
                var cant_pedir = Stock;
                if(Stock > Politica  ){
                    cant_pedir = Politica;
                }
                console.log(""+Stock +" > "+Politica +"  = "+cant_pedir);
                $("#tabla_pedidos").append("<tr class='fila_pedidos' ><td class='item lote'>"+Lote+"</td><td class='item color'>"+Color+"</td><td class='item'>"+Design+"</td><td class='num stock' data-pedir='"+cant_pedir+"'>"+Stock+"</td><td  class='num'>"+Politica+"</td><td class='itemc check_pedir"+Lote+"' title='"+title+"'>"+check+"</td></tr>");
            }
            $(".check_pedir").click(function(){
               sumarMarcadosPedir();
            });
            sumarMarcadosPedir();
            $("#msg_pedir").html(""); 
        }
    });
}
function generarPedidoLotes(){
 var lotes = new Array();
 var cant_pedir_array = new Array();
    $(".check_pedir").each(function(){
        if($(this).is(":checked")){
           var lote = $(this).parent().parent().find(".lote").text();       
           var cant_pedir = $(this).parent().parent().find(".stock").attr("data-pedir");       
           lotes.push(lote);
           cant_pedir_array.push(cant_pedir);
        }
    });   
    var aux_lotes = lotes;
    if(lotes.length > 0){
        var c = confirm("Confirma que desea solicitar estas piezas?");
        if(c){
            lotes = JSON.stringify(lotes);
            cant_pedir_array = JSON.stringify(cant_pedir_array);
            var suc = $("#suc").val();
            var usuario = $("#usuario").val();
            var destino = "00";
            $.ajax({
                type: "POST",
                url: "Estantes.class.php",
                data: {"action": "generarPedidoLotes",usuario:usuario,codigo:codigo_pedir, lotes: lotes,cant_pedir:cant_pedir_array,suc:suc,destino:destino},
                async: true,
                dataType: "json",
                beforeSend: function () {
                    $("#msg_pedir").html("<img src='../../img/loading_fast.gif' width='16px' height='16px' >");
                    aux_lotes.forEach(function(l) {
                        $(".check_pedir"+l).html("<img src='../../img/loading_fast.gif' width='14px' height='14px' >");
                    }); 
                },
                success: function (data) {   
                    for (var i in data) { 
                        var lote = data[i];
                        $(".check_pedir"+lote).prop("title","Este Lote se acaba de cargar en un documento por otro usuario, recargue para mas info");
                        $(".check_pedir"+lote).html("<img  src='../../img/warning_red_16.png' width='14px' height='14px' >");
                        $(".check_pedir"+lote).removeClass("check_pedir"+lote); 
                    }                    
                    aux_lotes.forEach(function(l) {
                        $(".check_pedir"+l).html("<img src='../../img/ok.png' width='14px' height='14px' >");
                    });                     
                    $("#msg_pedir").html("Los lotes se cargaron en una Remision Abierta!"); 
                }
            });   
        }        
    }else{
        alert("Seleccione los lotes que desea solicitar el traslado...");
    }    
} 

function cerrarVentanaRemision(){
     $(".lotes_remitir_container").slideUp();
}
function cerrarVentanaPedidos(){
    $(".lotes_pedir_container").slideUp();
}
function getNombresArticulosNoDefinidos(){
   var x = "";
    $('.undefined').each(function(index, obj){
      x+="'"+$(this).text()+"',";
    });
    var codigos = x.substring(0,x.length - 1);   
    if($('.undefined').length > 0){
        $.ajax({
            type: "POST",
             url: "Estantes.class.php",
            data: {"action": "getNombresDeArticulos", codigos: codigos},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $(".undefined").next().html("<img src='../../img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                for (var i in data) { 
                    var ItemCode = data[i].codigo;
                    var ItemName = data[i].descrip; 
                    $(".descrip_"+ItemCode).html(ItemName);
                }    
            }
        });
    }
}
function updateTempDate(temporada,desde,hasta){
     
    var suc = $("#suc").val();
    var usuario = $("#usuario").val();
    $.ajax({
        type: "POST",
        url: "Estantes.class.php",
        data: {"action": "updateTempDate",desde:desde,hasta:hasta, "usuario": usuario,estante:estante, "suc": suc,temporada:temporada},
        async: true,
        dataType: "html",
        beforeSend: function () {
            msg("<img src='../../img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);   
                if(result == "Ok"){
                    getTemporadas(estante );
                    hideMsg(0);
                }else{
                    msg("Error:" + result);
                    hideMsg(15000);
                }
            }
        },
        error: function () {
            msg("Ocurrio un error en la comunicacion con el Servidor intente nuevamente");
            hideMsg(15000);
        }
    });     
    
}
function addSubTemporada(signo){
    var suc = $("#suc").val();
    var usuario = $("#usuario").val();
    var utemp = $(".temp").last().html();
    var conf = true;
    if(signo == "-"){
        var c = confirm("Esta seguro de eliminar una temporada? Solo podra eliminar si no hay cuadrantes reservados por esta temporada");
        if(!c){
            conf = false;
        }
    }
    if(conf){
        if(signo == "+" && $(".hasta").last().val() == "00-00"){
            alert("Error la Ultima Temporada no puede ser 00-00 para poder calcular el inicio de la siguiente.");
            return;
        }
        $.ajax({
            type: "POST",
            url: "Estantes.class.php",
            data: {"action": "addSubTemporada",signo:signo, "usuario": usuario,estante:estante, "suc": suc,temporada:utemp},
            async: true,
            dataType: "html",
            beforeSend: function () {
                msg("<img src='../../img/loading_fast.gif' width='16px' height='16px' >");              
            },
            complete: function (objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText);   
                    if(result == "Ok"){
                        getTemporadas(estante );
                        hideMsg(0);
                    }else{
                        msg("No se puede eliminar! Hay cuadrantes con esta Temporada asignada");
                        hideMsg(15);
                    }
                }
            },
            error: function () {
                msg("Ocurrio un error en la comunicacion con el Servidor intente nuevamente");
            }
        }); 
    }
}
function msg(msg){
    $("#msg").html(msg);
    $("#msg").slideDown();
}
function hideMsg(seconds){ 
    seconds = seconds * 1000;
    setTimeout(function(){ 
       $("#msg").html("").slideUp(); 
    },seconds);
}
function getContenidoUbicacion(){
    var mostrar = $("#buscar_contenido").is(":checked");  //console.log(mostrar+"  "+firingRPC);
    if(!firingRPC && mostrar){
    var suc = $("#suc").val();
    $.ajax({
        type: "POST",
        url: "Estantes.class.php",
        data: {"action": "verContenidoUbicacion",suc:suc, estante: estante,fila:fila,col:col,pallet:'%'},
        async: true,
        dataType: "json",
        beforeSend: function () {
             
            $("#cuad_content").empty();
            var cab = '<table border="1" id="content_table" cellspacing="0" cellpadding="0"   >\n\
                        <tr><th colspan="6" class="titulo">'+suc+'  '+estante+' Fila: '+fila+'  Col: '+col+' </th></tr>\n\
                        <tr class="titulo_contenido"><th>Codigo</th><th>Lote</th><th>Descrip</th><th>Color</th><th>Stock</th><th style="cursor:pointer" title="En o Fuera de la Temporada seleccionada" onclick="getContenidoUbicacion()">T.</th></tr>\n\
                        <tr><td style="text-align:center" colspan="6" id="loading" >  Cargando...<img src="../../img/loading_fast.gif" width="16px" height="16px" ></td></tr></table>';
            $("#cuad_content").append(cab); 
            firingRPC = true;
        },
        success: function (data) { 
            var j = 0; 
            var totalStock = 0;
            var codigo_temp = $("#codigo").html();
            for (var i in data) {
                //var Pallet = data[i].Pallet;
                var Codigo = data[i].codigo;        
                var Lote = data[i].lote;
                var Color = data[i].color;
                var Descrip = data[i].descrip;
                var Stock = data[i].stock;
                totalStock += parseFloat(stock);
                if(Stock == ".00"){
                   Stock = "0.00";    
                }   
                var img_temp =  '';
                if(codigo_temp == Codigo){
                    img_temp = '<img src="../../img/ok.png" title="Dentro de la Temporada Seleccionada"  >';
                }else if(codigo_temp == ""){
                    img_temp = 'No def.';
                }else{
                    img_temp = '<img src="../../img/warning_red_16.png" width="15px" title="Fuera de la Temporada Seleccionada"  >';
                }
                $("#content_table").append("<tr class='cuad_content'><td  class='itemc'>"+Codigo+"</td><td  class='itemc'>"+Lote+"</td><td  class='item'>"+Descrip+"</td><td  class='item'>"+Color+"</td><td  class='num'>"+Stock+"</td><td class='itemc'>"+img_temp+"</td></tr>");                 
                j++;
            }
            totalStock = (totalStock).format(1,3);
            $("#content_table").append("<tr class='cuad_content'><td class='itemc' colspan='2' ><b>"+j+" Items</b></td><td  class='itemc'></td><td  class='item'></td><td  class='num' ><b>"+totalStock+"</b></td><td></td></tr>"); 
            if(j > 0){
                $("#content_table").append("<tr class='impresora'><td colspan='6' style='text-align:center;'><img src='../../img/printer-01_32x32.png' style='cursor:pointer' onclick='printCuadContent()' height='24' width='26'></td></tr>");
            }
            $("#loading").html(""); 
            firingRPC = false;
        } 
    });
  }else{
      $("#cuad_content").empty();
  }
}

function getCapacidadCuadrante(estante,fila,col,temporada){
   var suc = $("#suc").val(); 
   //var usuario = $("#usuario").val();
   getDefinicionXTermorada(estante);
   if(fila > 0 && col > 0){
   $.ajax({
        type: "POST",
        url: "Estantes.class.php",
        data: {"action": "getCapacidadCuadrante", suc: suc,estante:estante,temporada:temporada,fila:fila,col:col },
        async: true,
        dataType: "json",
        beforeSend: function () {
           $("#save").attr("src","../../img/loading_fast.gif");
        },
        success: function (data) {   
            $(".fila_cap").remove();
            $(".add_minus").remove();
            
            var j = 0;
            var disabled="disabled='disabled'";
            if(permiso_modificar){
                disabled='';
            }
            for (var i in data) {  
                var codigo = data[i].codigo;  
                var descrip = data[i].descrip;
                var desde = data[i].desde;
                var hasta = data[i].hasta;
                var um = data[i].um;
                var capacidad = data[i].capacidad;
                var piezas = data[i].piezas;
                 
                $(".art_search").before("<tr id='art_"+j+"' class='fila_cap'><td class='itemc' >"+temporada+"</td> \n\
                <td   class='codigo itemc'>"+codigo+"</td> \n\
                <td><input type='text' style='width:100%'  class='descrip item' value='"+descrip+"' size='30' onchange='buscarArticulo(this)' "+disabled+" ></td>\n\
                </td> <td class='itemc'>"+desde+"</td><td class='itemc'  >"+hasta+"</td> <td  class='itemc'>\n\
                <input type='text'  class='capacidad num' value='"+capacidad+"' size='8' "+disabled+" ></td>\n\
                <td class='itemc um' style='cursor:pointer' onclick='changeUm()'>"+um+"</td>\n\
                <td class='itemc'><input type='text'   class='piezas num' value='"+piezas+"' size='4' "+disabled+" ></td>\n\
                <td class='itemc'> <img src='../../img/save-mini.png' class='save' onclick='saveArticuloEnTemporada("+temporada+",this)' style='cursor:pointer' ></td></tr>");
                j++;
            } 
            j--;
            $(".art_search").before("<tr class='add_minus' >\n\
             <td class='itemc' colspan='9' >\n\
              <img src='../../img/button-add_blue.png' id='add' onclick='agregarArticulo()'  title='Agregar Articulo a Cuadrante' style='cursor:pointer;width:36px' > &nbsp;&nbsp;&nbsp;\n\
              <img src='../../img/button_minus_blue.png' id='add' onclick='quitarArticulo()'  title='Quitar Articulo a Cuadrante' style='cursor:pointer;width:36px' > \n\
            </td>   </tr>");
             
            $(".fila_cap input").change(function(){
                $("#save").attr("src","../../img/save-mini.png");
            });
            enterPiezas();   
            hideMsg(0);
            setHotKeyArticulo(); 
        }
        
    });    
    }
}

function agregarArticulo(){  
    var id = $(".fila_cap").length - 1;
    var new_id = id + 1;
    var clone = $("#art_"+id).clone();    
    clone.prop("id","art_"+new_id);
    $("#art_"+id).after(clone); 
    $("#art_"+new_id).find("input").val("");
    $("#art_"+new_id).find(".codigo").html("");   
    $("#art_"+new_id).find(".save").attr("src","../../img/save-mini.png");   
    enterPiezas();   
    setHotKeyArticulo(); 
}
function enterPiezas(){
   $(".piezas").keyup(function(e) {
        if (e.keyCode === 13) {
            $(this).parent().parent().find(".save").click();    
        }
   });    
}
function quitarArticulo(){                       
    var suc = $("#suc").val(); 
    var id = $(".fila_cap").length - 1; 
    if(id > -1){
       var codigo = $("#art_"+id).find(".codigo").html(); 
       
       $.ajax({
        type: "POST",
        url: "Estantes.class.php",
        data: {"action": "quitarArticulo", "suc": suc,estante:estante,fila:fila,col:col,codigo:codigo,temporada:codigo_temporada},
        async: true,
        dataType: "html",
        beforeSend: function () {  
            $("#"+id).find(".save").attr("src","../../img/loading_fast.gif");
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);    
                if(result == "Ok"){
                   $("#art_"+id).remove(); 
                }else{
                   $("#"+id).find(".save").attr("src","../../img/error.png");
                }
            }
        },
        error: function () {
            $("#"+id).find(".save").attr("src","../../img/warning_red_16.png");
        }
     });  
    }
}


function saveArticuloEnTemporada(temporada,obj){
   var id = obj.parentNode.parentNode.id;
   var suc = $("#suc").val(); 
   var usuario = $("#usuario").val();
   var codigo = $("#"+id).find(".codigo").text();
   var capacidad = $("#"+id).find(".capacidad").val(); 
   var piezas = $("#"+id).find(".piezas").val();  
   var um = $("#"+id).find(".um").text(); 
    
    $.ajax({
        type: "POST",
        url: "Estantes.class.php",
        data: {"action": "guardarArticuloEntemporada", "usuario": usuario, "suc": suc,estante:estante,fila:fila,col:col,codigo:codigo,capacidad:capacidad,piezas:piezas,um:um,temporada:temporada},
        async: true,
        dataType: "html",
        beforeSend: function () {  
            $("#"+id).find(".save").attr("src","../../img/loading_fast.gif");
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);    
                if(result == "Ok"){
                    $("#"+id).find(".save").attr("src","../../img/ok.png");
                }else{
                   $("#"+id).find(".save").attr("src","../../img/error.png");
                }
            }
        },
        error: function () {
            $("#"+id).find(".save").attr("src","../../img/warning_red_16.png");
        }
    });  
}
function sigTemporada(){
    var temps = parseInt($(".last_col").length);
    var current = parseInt($(".fila_cap").children().first().html());
    
    if(current === temps){
        current = 1;
    }else{
        current++;
    }
    $(".temporada_"+current).click();
}

var selected_obj = null;
var selected_descrip = null;
function buscarArticulo(obj){ 
    
    if(obj === null){
        obj = $(".descrip").get(0);    
    }
    
    selected_descrip = obj;
    selected_obj = obj.parentNode.parentNode.id;  
 
    var articulo = $(obj).val();
    console.log("buscarArticulo   "+articulo+"  "+selected_obj);
    
    if (articulo.length > 0) {
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "buscarArticulos", "articulo": articulo, "cat": 1 },
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg").html("<img src='../../img/loading_fast.gif' width='16px' height='16px' >");
            },
            success: function(data) {

                if (data.length > 0) {
                    limpiarListaArticulos();
                    var k = 0;
                    for (var i in data) {
                        k++;
                        var ItemCode = data[i].codigo;
                        var Sector = data[i].sector;
                        var NombreComercial = data[i].descrip;
                        var Precio = parseFloat((data[i].precio)).format(0, 3, '.', ',');
                        var UM = data[i].um;
                        var Ancho = parseFloat((data[i].ancho)).format(2, 3, ',', '.');
                        var Gramaje = parseFloat((data[i].gramaje)).format(0, 3, '.', ',');
                        var PrecioCosto = parseFloat((data[i].PrecioCosto)).format(0, 3, '.', ',');
                        var Composicion = data[i].composicion;
                        $("#lista_articulos").append("<tr class='tr_art_data fila_art_" + i + "' data-precio='" + Precio + "' data-precio_costo='" + PrecioCosto + "' data-um='" + UM + "' data-ancho='" + Ancho + "' data-gramaje='" + Gramaje + "' data-comp='" + Composicion + "'><td class='item clicable_art'><span class='codigo' >" + ItemCode + "</span></td>   <td class='item clicable_art'><span class='Sector'>" + Sector + "</span> </td><td  class='item clicable_art'><span class='NombreComercial'>" + NombreComercial + "</span></td><td class='num clicable_art'><span>" + Ancho + "</span></td><td class='num clicable_art'><span>" + Precio + "</span></td></tr>");
                        cant_articulos = k;
                    }
                    inicializarCursores("clicable_art");
                    $("#ui_articulos").fadeIn();
                    $(".tr_art_data").click(function() {
                        seleccionarArticulo(this);
                    });
                    $("#msg").html("");
                    
                } else {
                    $("#msg").html("Sin resultados...");
                }
            }
        }); 
}
}
function seleccionarArticulo(obj) {
    var codigo = $(obj).find(".codigo").html();
    var sector = $(obj).find(".Sector").html();
    var nombre_com = $(obj).find(".NombreComercial").html();
    var precio = $(obj).attr("data-precio");
    var precio_costo = $(obj).attr("data-precio_costo");
    var ancho = $(obj).attr("data-ancho");
    var gramaje = $(obj).attr("data-gramaje");
    var um = $(obj).attr("data-um");
    var composicion = $(obj).attr("data-comp");
    if (isNaN(gramaje)) {
        gramaje = "";
    }
    if (isNaN(ancho)) {
        ancho = "";
    }
    $("#"+selected_obj).find(".codigo").html(codigo);
    $("#"+selected_obj).find(".descrip").val(nombre_com);
    $("#"+selected_obj).find(".um").html(um);    
    $("#ui_articulos").fadeOut(); 
}
function limpiarListaArticulos() {
    $(".tr_art_data").each(function() {
        $(this).remove();
    });
}
function inicializarCursores(clase){
    $("."+clase).mouseover(function(){
        $(".cursor").remove(); // Le saco a todos los que tienen
        $(this).append("<img class='cursor' src='../../img/l_arrow.png' width='18px' height='10px'>");
    }).mouseleave(function(){
        $(this).children('.cursor').remove();
    });   
}

function changeUm(){
    var um = $("#um").html();
    if(um == "Mts"){
        $("#um").html("Unid");
    }else{
        $("#um").html("Mts");
    }
} 
function setHotKeyArticulo() {
    $(".descrip").keydown(function(e) {

        var tecla = e.keyCode;   console.log("setHotKeyArticulo keydown"+tecla);
        if (tecla == 27) {
            $("#ui_articulos").fadeOut();
            escribiendo = false;
        }
        if (tecla == 38) {
            (fila_art == 0) ? fila_art = cant_articulos - 1: fila_art--;
            selectRowArt(fila_art);
        }
        if (tecla == 40) {
            (fila_art == cant_articulos - 1) ? fila_art = 0: fila_art++;
            selectRowArt(fila_art);
        }
        if (tecla != 38 && tecla != 40 && tecla != 13 && tecla != 9) { //9 Tab 38-40 Flechas Arriba abajo
            buscarArticulo(selected_descrip);
            escribiendo = true;
        }
        if (tecla == 13) {
            if (!escribiendo) {
                seleccionarArticulo(".fila_art_" + fila_art);
            } else {
                setTimeout("escribiendo = false;", 1000);
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
    $($(".fila_art_" + row + " td").get(2)).append("<img class='cursor' src='../../img/l_arrow.png' width='18px' height='10px'>");
    escribiendo = false;
}
function setAltura(){
   var alt =  $("#altura").val(); 
   $(".contenedor_resumen").height(alt);
}
 
 function Copy() {
	// clone what are you copying since you
	// may want copy and paste on different moment.
	// and you do not want the changes happened
	// later to reflect on the copy.
	canvas.getActiveObject().clone(function(cloned) {
		_clipboard = cloned;
	});
}

function Paste() {
	// clone again, so you can do multiple copies.
	_clipboard.clone(function(clonedObj) {
		canvas.discardActiveObject();
		clonedObj.set({
			left: clonedObj.left + 10,
			top: clonedObj.top + 10,
			evented: true,
		});
                clonedObj.item(0).fill = "orange";
		if (clonedObj.type === 'activeSelection') {
			// active selection needs a reference to the canvas.
			clonedObj.canvas = canvas;
			clonedObj.forEachObject(function(obj) {
				canvas.add(obj);
			});
			// this should solve the unselectability
			clonedObj.setCoords();
		} else {
			canvas.add(clonedObj);
		}
		_clipboard.top += 10;
		_clipboard.left += 10;
		canvas.setActiveObject(clonedObj);
		canvas.requestRenderAll();
	});
}
function cuadrantesSeleccionados(){
    $("#temp_actual").html(codigo_temporada);
    $(".fila_copiar").remove();
    var i = 1;
    $(".temp").each(function(){
       var temp = $(this).text();
       if(codigo_temporada != temp){
           i++;
           $("#copiar").append("<tr class='fila_copiar'><td class='copy_temp' style='text-align:center;font-weight:bolder;cursor:pointer' onclick='clonarTemporada("+temp+")'>"+temp+"</td></tr>");
       }
    });
    $("#defrowspan").prop("rowspan",i);
    $("#copiar").fadeIn();
    var activeGroup = canvas.getActiveObject();
    console.log(activeGroup);
    
    if (activeGroup && activeGroup.id == undefined) {
        var activeObjects = activeGroup.getObjects();
        var grupo = "";
        var show = true;
        for (var i in activeObjects) {            
            var g_id = activeObjects[i].id.split("_");  
            if(g_id[0] != "NombreEstante"){  console.log(g_id);
               grupo +=g_id[0]+"."+g_id[1]+"."+g_id[2]+", ";
            } 
            if(g_id[0] == "fondo" || g_id[0] == "texto" || g_id[0] == "polig"   ){ // console.log( "g_id[0]:   "+ g_id[0]);
                show = false;
                break;
            }
        } 
        if(show){
           $("#seleccionados").html("<b>Grupo:</b>:"+grupo);
        }
    } 
}
function liberarCuadrantes(){
    $("#seleccionados").html("");
} 
function clonarTemporada(temp){
    var c = confirm("Confirme copiar definiciones para el grupo seleccionado de temporada "+codigo_temporada+" a "+temp);
    if(c){
        var activeGroup = canvas.getActiveObject();
        var cuadrantes = new Array();
        if (activeGroup) {
            var activeObjects = activeGroup.getObjects();
            for (var i in activeObjects) {            
                var g_id = activeObjects[i].id; 
                if(g_id !== "NombreEstante"){
                   cuadrantes.push(g_id); 
                }
            }        
        } 
        
        cuadrantes = JSON.stringify(cuadrantes);
        var suc = $("#suc").val();
         var usuario = $("#usuario").val();
        $.ajax({
            type: "POST",
            url: "Estantes.class.php",
            data: {"action": "clonarTemporada", suc:suc, cuadrantes: cuadrantes,temp_de:codigo_temporada,temp_a:temp,usuario:usuario},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#seleccionados").html("Copiando o actualizando definiciones existentes...<img src='../../img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                $("#seleccionados").html("");   
                for (var i in data) { 
                    var cuadrante = data[i].cuadrante;
                    var estado = data[i].estado; 
                    $("#seleccionados").append(cuadrante+" &rarr; "+estado+"<br>"); 
                }   
                
            }
        });
    }
}
