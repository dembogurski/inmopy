
var data_next_time_flag = true;
var lotes = 0;
var counter = 0;

function configurar(){ 
    setHotKeyArticulo();  
    
    lotes = $(".disp").length;
     
    setTimeout("buscarPrecioYStockDisponible()",200);
    setTimeout("rotar()",1000); 
    
}
function rotar(){
    if($("#img_zoom").height() > $("#img_zoom").width() ){
          $("#img_zoom").css("transform","translateY(-50px )  rotate(-90deg) "); 
    }    
}
function buscarPrecioYStockDisponible(){
    if($(".lote").length > 0){ 
        $(".lote").each(function(){
          var lote = $(this).text();
          buscarStockComprometido(lote);
        });     
    }
}
function test(){
    console.log("test");
}
function galeria(){
    var codigo = $("#codigo").val();
    var term = $("#term").val();
    var cantidad = $("#cantidad").val();
    var suc = $("#suc").val();
    var design = $("#designs").val();
    var estado_venta = $("#estado_venta").val();
    var pantone = $("#color").val();
    
    $.ajax({
            type: "POST",
            url: "productos/GaleriaImagenes.class.php",
            data: {action: "galeria", codigo: codigo, term: term,cantidad:cantidad,suc:suc,design:design,estado_venta:estado_venta,pantone:pantone,usuario:getNick()},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                 $(".design_div").remove();
                 var path = $("#images_url").val();
                 var um = $("#um").val();
                 var um_nom = "Metros";
                 if(um == "Unid"){
                     um_nom = "Unidades";
                 }else if(um == "Kg"){
                     um_nom = "Kilos";
                 }
                 if(data.length > 0){
                    for (var i in data) {
                           var codigo = data[i].codigo;
                           var sector = data[i].sector;
                           var piezas = data[i].piezas;
                           var rollos = data[i].rollos;
                           var total_piezas = parseInt(piezas) + parseInt(rollos);
                           var total = parseFloat(data[i].total).format(2, 3, '.', ',');
                           var descrip = data[i].descrip;
                           var color = data[i].color;
                           var img = data[i].img;
                           var img_path = path+"/"+img+".thum.jpg";
                           if(img === ""){
                               img = "0/0";
                               img_path = "img/0.jpg";
                           }
                            
                           var ul = '<div data-img="' + img + '" data-img_path="' + img_path + '" class="design_div" onclick="showImageData(this)" >\n\
                               <div><label class="img_label">'+codigo+'</label>&nbsp;-&nbsp;'+sector+' </div>\n\
                               <div><label class="img_label">'+descrip+'</label></div>\n\
                               <div><label class="img_label">Color: </label>'+color+'</div>\n\
                               <div><label class="img_label">Piezas: </label>&nbsp;'+piezas+'&nbsp;&nbsp; <label class="img_label">Rollos</label>&nbsp; '+rollos+'.</div> \n\
                               <div><label class="img_label">Total: </label>&nbsp;'+total_piezas+'&nbsp;&nbsp;&nbsp; <label class="img_label">'+um_nom+': </label>&nbsp; '+total+'~</div>\n\
                               <img  class="imagen_design" src="'+img_path+'" />   \n\
                             </div>'; 

                           $("#galeria").append(ul);
                           //console.log(key+"  "+name+"  "+thums);

                    }
                  
              }else{
                  $("#galeria").append("<big class='design_div'>No se encontro ningun articulo correspondiente a los filtros...</big>");
              }
               
            },
            error: function (e) {                 
                $("#msg").html("Error al obtener Estampas:  " + e);   
                errorMsg("Error al obtener Estampas  " + e, 10000);
            }
    });   
}

function showImageData(obj){
    
    var img = $(obj).attr("data-img");
    var codigo = $("#codigo").val();
    var term = $("#term").val();
    var cantidad = $("#cantidad").val();
    var suc = $("#suc").val();
    var design = $("#designs").val();
    var estado_venta = $("#estado_venta").val();
    var pantone = $("#color").val();
    
    var img_width = 360;
    
    var cookw = getCookie("img_with").sesion;
    if(cookw !== undefined){
       img_width = parseInt(cookw);
    }
     
    var data = "usuario="+getNick()+"&codigo="+codigo+"&term="+term+"&cantidad="+cantidad+"&suc="+suc+"&design="+design+"&estado_venta="+estado_venta+"&pantone="+pantone+"&img="+img+"&img_width="+img_width;
    var mobile_window = window.open("productos/GaleriaImagenes.class.php?action=showImageData&"+data, "Galeria", "width=auto,height=auto");
    
    /*$("#fondo_imagen").click(function(){
      closeImage();
    });  */  
}
 
function zoomImage(){
    var w = $("#zoom_range").val();    
    
    if(w > $(window).width() ){
        w = $(window).width();
    }
    w = parseInt(w);
    
    var contw = w + 6;
    //$("#image_container").width( contw );
     
    $("#img_zoom").width(w);   
    
    var imgh = $(".large_image").height();
    
    if(imgh < 320){
        imgh = 320;
    }
     
    //var left = ($(window).width() / 2) - ($("#image_container").width() / 2);
   
    
    var  top = parseInt(getCookie("gallery_pos_top").sesion);
    var  left = parseInt(getCookie("gallery_pos_left").sesion);
    if(isNaN(top)){   top = 0;   }
    if(isNaN(left)){   left = 0;   }
    
      console.log(w);
    window.opener.setCookie("img_with",w,365);
}
function closeImage(){
    $("#image_container").fadeOut();
    $("#fondo_imagen").fadeOut(); 
}
function openImage(img){
    var path = $("#images_url").val();
    var  url = path+"/"+img+".jpg";
    window.open(url);
}
 

function buscarEstadoVenta(){
    var codigo = $("#codigo").val();
    var term = $("#term").val();
    var cantidad = $("#cantidad").val();
    $.ajax({
        type: "POST",
        url: "productos/GaleriaImagenes.class.php",
        data: {action: "buscarEstadoVenta", codigo: codigo, term: term,cantidad:cantidad},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            var um = $("#um").val();
            $("#estado_venta").html("");
           
            if (data.length > 0) {      
                $("#estado_venta").append("<option value='*-FP'>Todos - FP</option>");   
                $("#estado_venta").append("<option value='*+FP'>Todos + FP</option>");    
                  
                for(var i in data){
                   var estado = data[i].estado_venta;                     
                   $("#estado_venta").append("<option value='"+estado+"'>"+estado+"</option>");   
                }      
                
                $("#msg").html("Ok"); 
                buscarSucursales();
            } else {
                $("#msg").html("Error al obtener sucursales:  ");   
            }                
        },
        error: function (e) {                 
            $("#msg").html("Error al obtener sucursales:  " + e);   
            errorMsg("Error al obtener sucursales:  " + e, 10000);
        }
    });         
}

function buscarSucursales(){
    var codigo = $("#codigo").val();
    var term = $("#term").val();
    var cantidad = $("#cantidad").val();
    var estado_venta = $("#estado_venta").val();
    $.ajax({
        type: "POST",
        url: "productos/GaleriaImagenes.class.php",
        data: {action: "buscarSucursales", codigo: codigo, term: term,cantidad:cantidad,estado_venta:estado_venta},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            var um = $("#um").val();
            $("#suc").html("");
           
            if (data.length > 0) {      
                $("#suc").append("<option value='%'>Todas</option>");
                $("#suc").append("<optgroup label='Suc    -    Piezas    -    Total "+um+"'>");
                
                for(var i in data){
                   var suc = data[i].suc; 
                   var piezas = data[i].piezas; 
                   var total = parseFloat(data[i].total).format(1, 3, '.', ','); 
                   $("#suc").append("<option value='"+suc+"'>"+suc+"&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp; "+piezas+"&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;"+total+" "+um+" </option>");   
                }      
                $("#suc").append("</optgroup>");
                $("#msg").html("Ok"); 
                buscarDesigns();
            } else {
                $("#msg").html("Error al obtener sucursales:  ");   
            }                
        },
        error: function (e) {                 
            $("#msg").html("Error al obtener sucursales:  " + e);   
            errorMsg("Error al obtener sucursales:  " + e, 10000);
        }
    });     
}
function buscarDesigns(){
    var codigo = $("#codigo").val();
    var term = $("#term").val();
    var cantidad = $("#cantidad").val();
    var suc = $("#suc").val();
    var estado_venta = $("#estado_venta").val();
    $.ajax({
        type: "POST",
        url: "productos/GaleriaImagenes.class.php",
        data: {action: "buscarDesigns", codigo: codigo, term: term,cantidad:cantidad,suc:suc,estado_venta:estado_venta},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
             
            $("#designs").html("");
           
            if (data.length > 0) {      
                $("#designs").append("<option value='%'>Todos</option>"); 
                for(var i in data){
                   var design = data[i].design;  
                   $("#designs").append("<option value='"+design+"'>"+design+"</option>");   
                }      
                buscarColores();
                $("#msg").html("Ok"); 
            } else {
                $("#msg").html("Error al obtener diseños:  ");   
            }                
        },
        error: function (e) {                 
            $("#msg").html("Error al obtener diseños:  " + e);   
            errorMsg("Error al obtener diseños:  " + e, 10000);
        }
    });         
}
function buscarColores(){
    var codigo = $("#codigo").val();
    var term = $("#term").val();
    var cantidad = $("#cantidad").val();
    var suc = $("#suc").val();
    var design = $("#designs").val();
    var estado_venta = $("#estado_venta").val();
    $.ajax({
        type: "POST",
        url: "productos/GaleriaImagenes.class.php",
        data: {action: "buscarColores", codigo: codigo, term: term,cantidad:cantidad,suc:suc,design:design,estado_venta:estado_venta},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            var um = $("#um").val();
            $("#color").html("");
           
            if (data.length > 0) {      
                $("#color").append("<option value='%'>Todos</option>"); 
                $("#color").append("<optgroup label='Color    -    Piezas    -    Total "+um+"'>");
                for(var i in data){
                   var pantone = data[i].pantone;  
                   var color = data[i].color;  
                   var piezas = data[i].piezas;  
                   var total = data[i].total;  
                   $("#color").append("<option value='"+pantone+"'>"+color+"&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp; "+piezas+"&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;"+total+" "+um+" </option>");   
                }      
                $("#color").append("</optgroup>");
                $("#msg").html("Ok"); 
            } else {
                $("#msg").html("Error al obtener colores:  ");   
            }                
        },
        error: function (e) {                 
            $("#msg").html("Error al obtener colores:  " + e);   
            errorMsg("Error al obtener colores:  " + e, 10000);
        }
    });         
    
}


function buscarArticulo(){
    var articulo = $("#descrip").val();
    var cat = $("#categoria").val();
    
    fila_art = 0;
    if(articulo.length > 0){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "buscarArticulos", "articulo": articulo,"cat":cat},
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
                    var descrip = data[i].descrip; 
                    var sector = data[i].sector; 
                    var composicion = data[i].composicion; 
                    var um = data[i].um; 
                    var Precio =  parseFloat(  (data[i].precio) ).format(0, 3, '.', ',');
                                                                
                    $("#lista_articulos") .append("<tr class='tr_art_data fila_art_"+i+"'   data-precio="+Precio+" data-um="+um+" data-sector='"+sector+"' data-composicion='"+composicion+"'><td class='item clicable_art'><span class='codigo' >"+codigo+"</span></td>\n\
                    </td><td class='item clicable_art'><span class='descrip'>"+descrip+"</span></td>  <td class='num clicable_art'>"+Precio+"</td> </tr>");
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

function triggerUp(){
    (fila_art == 0) ? fila_art = cant_articulos-1 : fila_art--;
     selectRowArt(fila_art);
}
function triggerDown(){
    (fila_art == cant_articulos-1) ? fila_art = 0 : fila_art++;
    selectRowArt(fila_art);
}

function setHotKeyArticulo(){
     
    $("#descrip").keydown(function(e) {
        
        var tecla = e.keyCode;  //console.log(tecla);  
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


function seleccionarArticulo(obj){
    var codigo = $(obj).find(".codigo").html();
    var sector = $(obj).attr("data-sector"); 
    var composicion = $(obj).attr("data-composicion"); 
    var descrip = $(obj).find(".descrip").html();  
    var precio = $(obj).attr("data-precio");
    var um = $(obj).attr("data-um");
    var largo = $(obj).attr("data-largo"); 
    $("#codigo").val(codigo);
    $("#codigo").attr("data-sector",sector); 
    $("#codigo").attr("data-composicion",composicion); 
    $("#codigo").attr("data-descrip",descrip); 
    $("#descrip").val(descrip);
    $("#um").val(um);
    $("#largo").val(largo);
    $("#ui_articulos").fadeOut(); 
    $("#design").val("");
    $("#img_design").html("<img src='img/0.jpg' height='60'>");
    $("#cantidad").focus();
    $("#cantidad").select();
    buscarEstadoVenta();
}
function verStockComprometido(lote){
    $(".stock_comprometido_"+lote).toggle();
}
function buscarStockComprometido(lote){
    $.ajax({
        type: "POST",
        url: "../Ajax.class.php",
        data: {"action": "buscarStockComprometido", lote: lote,suc:getSuc(),"incluir_reservas":"No"},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $(".estado_"+lote).html("<img src='../img/loading_fast.gif' width='16px' height='16px' >");  
        },
        success: function (data) {   
            var comprometido = 0; 
             
             
            if(data.length > 0){            
                var st_comp = "<div class='comp_container stock_comprometido_"+lote+"'><table class='table_stock_compr' border='1'  >";
                st_comp+="<tr><th colspan='6' style='background:lightskyblue;'>Stock Comprometido</th><th style='text-align:center;background:white'>X</th></tr>";
                st_comp+="<tr class='titulo' style='font-size:10px'><th>Nro</th><th>Doc</th><th>Usuario</th><th>Fecha</th><th>Suc</th><th>Estado</th><th>Cantidad</th><tr>";
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
                st_comp+="</table></div>";
                var stock =  parseFloat( $(".stock_"+lote).text().replace(/\./g, '').replace(/\,/g, '.')  ); 
                var stock_limpio = parseFloat(stock - comprometido);
                
                
                $(".disponible_"+lote).html(  parseFloat( stock_limpio  ).format(2, 3, '.', ',')   );
                
                $(".estado_"+lote).html("<img src='../img/important.png' style='cursor:pointer;width:16px' onclick='verStockComprometido("+lote+")' title='Esta pieza se encuentra en otro documento!'>"+st_comp);
                 
                $(".stock_comprometido_"+lote).click(function(){
                    verStockComprometido(lote);
                });
            }else{
                var stock =  parseFloat( $(".stock_"+lote).text().replace(/\./g, '').replace(/\,/g, '.')  ); 
                 
                $(".disponible_"+lote).html( stock   );
                $(".estado_"+lote).html("Libre");  
            }
            counter++;
            
            if(counter == lotes){
                totalizar();
            }
            $("#msg").html(""); 
        }
    });
    getPrecio1(lote);
}
function totalizar(){
    var total_disp =0;
    $(".disp").each(function(){
       var v = parseFloat($(this).text());
       total_disp += 0 + v;  
       //console.log(v);
    });
    total_disp =(total_disp).format(2, 3, '.', ',');
    $("#total_disp").html(total_disp); 
    $("#cant_piezas").html(lotes); 
    
}

function getPrecio1(lote){
    var codigo = $("#h_codigo").html();
    $.ajax({
        type: "POST",
        url: "GaleriaImagenes.class.php",
        data: {action: "getPrecio1", codigo: codigo, lote: lote},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
             if(data.length > 0){
                 var precio_final1 = parseFloat(data[0].precio_final).format(0, 3, '.', ',');
                 $(".precio_"+lote).html(precio_final1);
             }           
        },
        error: function (e) {                 
            $("#msg").html("Error al obtener precio 1  " + e);   
             
        }
    }); 
}