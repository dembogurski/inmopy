 
var decimales = 0;
var cant_articulos = 0;
var fila_art = 0;

var errores = 0;

var porc_valor_minimo = 25;         

var PORC_MINIMO_RETAZO = 20;

var cant_retazo = 0;

 
function configurar(){
    
    $("#filtros").on("keydown",function(e){
      var tecla = e.keyCode;
      if(tecla == "27"){
          $("#ui_articulos").fadeOut();
          $( "#ui_proveedores" ).fadeOut("fast");
      }    
    });
    $(".fecha").mask("99/99/9999");    
    for(var i = 1;i<8;i++){
       $("#tr_mod").append('<tr><td> <label id="label_'+i+'">Precio'+i+':</label></td><td><input type="text" class="num valores" id="mod_val_'+i+'" size="8" onkeypress="return onlyNumbers(event)"></td></tr>');
    }
    
    var ev = $("#estado_venta").html();
    $("#tr_mod").append('<tr><td> <label>Estado Venta:</label></td><td> <select id="new_estado_venta"  onchange="estadoVenta()">'+ev+'</select></td> </ >\n\
    <tr><td colspan="2" style="text-align:center"> <input type="button" id="preview" class="botones" value="Previsualizar" onclick="preview()" disabled="disabled">\n\
    &nbsp;<input type="button" id="apply" class="botones" value="Aplicar" onclick="aplicar()" disabled="disabled"> </td></tr>');
    
    $("#new_estado_venta").find(':first-child').remove();
    
    $("#mod_val_1").after('<img src="img/r_arrow.png" onclick="igualarValores()" width="20" height="12" style="transform: rotate(90deg);position:relative;margin-bottom: -2px;cursor:pointer">')
    
    var moneda = $("#moneda").val();
    $("#mod_val_1").change(function(){
        var pi_ini = $(this).val();
        
        var red50= redondearMoneda(pi_ini);
        
        $(this).val(red50);        
        var p1 = $(this).val();
        
        $("#mod_val_2").val(redondearMoneda( p1 - ((p1 * 3 ) / 100),moneda ));
        $("#mod_val_3").val(redondearMoneda( p1 - ((p1 * 5 ) / 100),moneda));
        $("#mod_val_4").val(redondearMoneda( p1 - ((p1 * 8 ) / 100),moneda));
        $("#mod_val_5").val(redondearMoneda( p1 - ((p1 * 10) / 100),moneda));
        $("#mod_val_6").val(redondearMoneda( p1 - ((p1 * 10) / 100),moneda));
        $("#mod_val_7").val(redondearMoneda( p1 - ((p1 * 10) / 100),moneda));
        checkVal($("#mod_val_1"));
    });
    $(".valores").not("#mod_val_1").change(function(){
        checkVal($(this));
    });
    $("#nombre_proveedor").blur(function(){
        if($(this).val().length == 0){
            $("#codigo_proveedor").val("%"); 
        }
    });
    $(".check_proveedor").trigger("click");
    $(".check_fecha_compra").trigger("click");
    $(".check_descrip").trigger("click");
    $(".check_descuentos").trigger("click");

    actualizarLista();
    ml_iniciarSugerencias();
    setHotKeyArticulo();  
    $.loadScript("js/DataTables/DataTables-1.10.18/js/jquery.dataTables.min.js");
    $.loadScript("js/DataTables/Responsive-2.2.2/js/dataTables.responsive.min.js");
    $.loadScript("proveedores/Proveedores.js?_=6666666666");
    $("#ui_articulos").width($("#ui_articulos").parent().width()) ;
    $("#new_estado_venta").val("Normal");
 }
  

function checkVal(obj){
    var v = $(obj).val();
    var moneda = $("moneda").val();
    var redond_50 = redondearMoneda( v,moneda );
    $(obj).val(redond_50);
    
    var err = 0;
    $(".valores").each(function(){        
        if($(this).val()=== ""){
            err++;
        }    
    });
    if(err > 0){
       $(".botones").prop("disabled",true);       
    }else{
       $("#preview").removeAttr("disabled");   
    }
}

function preview(){
    var modificar = $("#modificar").val();   
    $("#msg_lotes").html("<img src='img/loading_fast.gif' width='16px' height='16px'>"); 
    
    $(".modificado").removeClass("modificado");  
    $(".resultado").removeClass("resultado");  
    for(var i = 1;i <=7;i++){
       var px =  $("#mod_val_"+i).val();  
       if(isNaN(px)){
           errorMsg("No ha ingresado ningun valor en los campos de entrada de precios",10000);
           $("#mod_val_"+i).focus();
           return;
           break;
       }
    }                
    var estado_venta = $("#new_estado_venta").val();
    
    var selecteds = 0;
    
    var moneda = $("#moneda").val();
    
    if(modificar == "descuento_directo"){        
        $(".lote").each(function(){ 
            var check = $(this).parent().find(".seleccionable").is(":checked");
            if(check){
                selecteds++;
                for(var i = 1;i <=7;i++){
                    var px =  parseFloat($(this).parent().find(".p"+i).text().replace(/\./g, ''));  
                    var vx = redondearMoneda($("#mod_val_"+i).val(),moneda);
                    var precio_finalx = redondearMoneda(px - vx,moneda);
                    $(this).parent().find(".d"+i).text(vx).addClass("modificado");
                    $(this).parent().find(".estado_venta").text(estado_venta);                  
                    $(this).parent().find(".Normal, .Oferta, .Arribos, .Promocion, .Retazo .FP .Bloqueado").toggleClass(estado_venta);
                    $(this).parent().find(".pf"+i).text( precio_finalx ).addClass("resultado");    
                }
          }
        });          //.replace(/\./g, '').replace(/\,/g, '.');
    }else if(modificar == "precio_final_directo"){     
           var new_estado = $("#new_estado_venta").val();
            
           $(".lote").each(function(){ 
            var check = $(this).parent().find(".seleccionable").is(":checked");
            if(check){ 
                var stock = parseFloat($(this).parent().find(".stock").text());
                if(new_estado == "Retazo"){
                    if(stock <= cant_retazo){
                        selecteds++;    
                        for(var i = 1;i <=7;i++){                
                            var px =  parseFloat($(this).parent().find(".p"+i).text().replace(/\./g, ''));  
                            var vx = redondearMoneda($("#mod_val_"+i).val(),moneda);
                            $(this).parent().find(".pf"+i).text(  vx  ).addClass("modificado");  
                            $(this).parent().find(".estado_venta").text(estado_venta);
                            $(this).parent().find(".Normal, .Oferta, .Arribos, .Promocion, .Retazo").toggleClass(estado_venta);
                            $(this).parent().find(".d"+i).text( px - vx ).addClass("resultado"); 
                        } 
                    }else{
                        $(this).parent().find(".seleccionable").prop("checked",false);  
                        $(this).parent().find(".seleccionable").prop("disabled",true);  
                        errorMsg("hay piezas que no se pueden poner en retazo por que superan la cantidad minima",8000);
                    }                 
                    
                }else{
                    selecteds++;    
                    for(var i = 1;i <=7;i++){                
                        var px =  parseFloat($(this).parent().find(".p"+i).text().replace(/\./g, ''));  
                        var vx = redondearMoneda($("#mod_val_"+i).val(),moneda);
                        $(this).parent().find(".pf"+i).text(  vx  ).addClass("modificado");  
                        $(this).parent().find(".estado_venta").text(estado_venta);
                        $(this).parent().find(".Normal, .Oferta, .Arribos, .Promocion, .Retazo").toggleClass(estado_venta);
                        $(this).parent().find(".d"+i).text( px - vx ).addClass("resultado"); 
                    } 
                }
            }       
          });               
        //});              
    }else if(modificar == "porc_resp_costo"){     
        $(".lote").each(function(){ 
         var check = $(this).parent().find(".seleccionable").is(":checked");
            if(check){ 
                selecteds++;
                for(var i = 1;i <=7;i++){                
                    var preciox =  parseFloat($(this).parent().find(".p"+i).text().replace(/\./g, ''));   
                    var p_costox =  parseFloat($(this).parent().find(".p_costo").text().replace(/\./g, ''));  
                    var vx = $("#mod_val_"+i).val();
                    var precio_finalx = redondearMoneda(p_costox + (p_costox * vx / 100),moneda);
                    var descx = preciox -  precio_finalx;
                    $(this).parent().find(".pf"+i).text(  precio_finalx  ).addClass("modificado"); 
                    $(this).parent().find(".estado_venta").text(estado_venta);
                    $(this).parent().find(".Normal, .Oferta, .Arribos, .Promocion, .Retazo").toggleClass(estado_venta);
                    $(this).parent().find(".d"+i).text(  descx   ).addClass("resultado"); 
                }  
        }          
        });           
    }else if(modificar == "porc_resp_valmin"){       
        $(".lote").each(function(){ 
         var check = $(this).parent().find(".seleccionable").is(":checked");
            if(check){ 
                selecteds++;
                for(var i = 1;i <=7;i++){                
                    var preciox =  parseFloat($(this).parent().find(".p"+i).text().replace(/\./g, ''));   
                    var p_valmin =  parseFloat($(this).parent().find(".p_valmin").text().replace(/\./g, ''));  
                    var vx = $("#mod_val_"+i).val();
                    var precio_finalx = redondearMoneda(p_valmin + (p_valmin * vx / 100),moneda);
                    var descx = preciox -  precio_finalx;
                    $(this).parent().find(".pf"+i).text(  precio_finalx  ).addClass("modificado");  
                    $(this).parent().find(".estado_venta").text(estado_venta);
                    $(this).parent().find(".Normal, .Oferta, .Arribos, .Promocion, .Retazo").toggleClass(estado_venta);
                    $(this).parent().find(".d"+i).text(descx).addClass("resultado"); 
                } 
         }
       });               
    } 
    
    if(selecteds < 1){
        errorMsg("Debe seleccionar los lotes para previsualizar las modificaciones.",15000);
    }
    
    $("#msg_lotes").html(""); 
    $("#apply").removeAttr("disabled");
}
function aplicar(){
    
    var estado_venta = $("#new_estado_venta").val();
     
    
    var c = confirm("¿Confirma que desea modificar todos estos precios?");
    if(c){
    $(".botones").prop("disabled",true);     
    var data = new Array();
    $("#msg_lotes").html("<span style='background-color;lightskyblue;color:white'> Espere...<img src='img/loading_fast.gif' width='16px' height='16px'></span>"); 
    var cont = 0;    
    $(".lote").each(function(){ 
        var fila = $(this).parent();
        var check = fila.find(".seleccionable").is(":checked");
            if(check){
            fila.find(".result").html("<img class='updating' src='img/loading_fast.gif' width='16px' height='16px'>");    
            var array = new Array();
            var codigo = fila.find(".codigo").text();
            var lote = $(this).text();
            var descrip = fila.find(".descrip").text();
            var suc = fila.find(".suc").text();
            array.push(codigo,lote,descrip,suc);
            for(var i = 1;i <=7;i++){          
               var preciox = fila.find(".p"+i).text().replace(/\./g, '');
               array.push(preciox);
            }
            for(var i = 1;i <=7;i++){          
               var descx = fila.find(".d"+i).text();
               array.push(descx);
            }
            data.push(array);
            cont++;
       }
    });
    
    data = JSON.stringify(data);
     
    var moneda = $("#moneda").val();
    var um = $("#um").val();
    if(cont > 0){
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "actualizarDescuentosPorLote", data:data,estado_venta:estado_venta,usuario:getNick(),moneda:moneda,um:um},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg_lotes").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                var estado = data.estado; 
                var mensaje = data.mensaje;
                if(estado == "Ok"){
                   $("#msg_lotes").html("<span style='background-color:green;color:white'>"+mensaje+"</span>"); 
                   $(".updating").attr("src","img/ok.png");
                }else{
                   $("#msg_lotes").html("Ocurrio un error, vuelva a intentarlo o comuniquese con el Administrador.");  
                   $(".updating").attr("src","img/close.png");
                }                
            }
        });    
    }else{
        $("#msg_lotes").html("Debe marcar los lotes que desea modificar!"); 
        errorMsg("Debe marcar los lotes que desea modificar!",15000);
    }
    }
}
  
function setLabels(){
    var mod = $("#modificar").val();
    var label = "Desc";
    if(mod == "precio_final_directo"){
        label = "Precio"; 
    }else if(mod == "porc_resp_costo"){
        label = "%/Costo"; 
    }else if(mod == "porc_resp_valmin"){
        label = "%/Val Min"; 
    }
    for(var i = 1;i <= 7;i++){
        $("#label_"+i).text(label+""+i+":");         
    }
    
}
function selectRowArt(row) {
    $(".art_selected").removeClass("art_selected");
    $(".fila_art_" + row).addClass("art_selected");
    $(".cursor").remove();
    $($(".fila_art_" + row + " td").get(2)).append("<img class='cursor' src='img/l_arrow.png' width='18px' height='10px'>");
    escribiendo = false;   
} 


function seleccionarArticulo(obj){
    var codigo = $(obj).find(".codigo_busc").html();
    var sector = $(obj).find(".Sector").html(); 
    var nombre_com = $(obj).find(".NombreComercial").html();  
    var precio = $(obj).attr("data-precio");
    var um = $(obj).attr("data-um");
    $("#codigo").val(codigo);
    $("#descrip").val(nombre_com);
    $("#um").val(um);
    $("#ui_articulos").fadeOut();
    $("#precio_venta").val(precio);
    $("#precio_venta").focus();
    getColores();
    getMonedaListaPrecios();
}
function seleccionarProveedor(obj){
    var proveedor = $(obj).find(".proveedor").html(); 
    //var ruc = $(obj).find(".ruc").html();  
    var codigo = $(obj).find(".codigo").html(); 
 
    //$("#ruc_proveedor").val(ruc);
    $("#nombre_proveedor").val(proveedor);
    $("#codigo_proveedor").val(codigo); 
     
    $( "#ui_proveedores" ).fadeOut("fast");
    $("#msg").html(""); 
     
}
function mostrar(){}
 
function buscarArticulo(){
    var articulo = $("#descrip").val();
    var cat = 1;
    if(articulo.length > 0){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "buscarArticulos", "articulo": articulo,"cat":cat},
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#ui_proveedores").fadeOut(); 
        },
        success: function(data) { 
            
            if(data.length > 0){
                limpiarListaArticulos();
                var k = 0;
                for(var i in data){        
                    k++;
                    var codigo = data[i].codigo;
                    var sector = data[i].sector;
                    var descrip = data[i].descrip; 
                    var precio =  parseFloat(  (data[i].precio) ).format(0, 3, '.', ',');
                    var ancho = parseFloat(data[i].ancho).format(2, 3, '.', ',');
                    var composicion = data[i].composicion;
                    var um = data[i].um;         
                                                                         
                    $("#lista_articulos") .append("<tr class='tr_art_data fila_art_"+i+"' data-precio="+precio+" data-um="+um+"><td class='item clicable_art'><span class='codigo_busc' >"+codigo+"</span></td>\n\
                    <td class='item clicable_art'><span class='Sector'>"+sector+"</span> \n\
                    </td><td class='item clicable_art'><span class='NombreComercial'>"+descrip+"</span></td> \n\
                    <td class='num clicable_art'>"+ancho+"</td>\n\
                    <td class='item clicable_art'>"+composicion+"</td>\n\
                    <td class='num clicable_art'>"+precio+"</td>\n\
                    </tr>");
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
    }else{
         $("#codigo").val(""); 
    }
} 
function limpiarListaArticulos(){    
    $(".tr_art_data").each(function () {   
       $(this).remove();
    });    
} 
function cerrar(){}  

function limpiarCampos(){
   $(".fecha").val("");     
   $("#codigo").val("%"); 
   $("#descrip").val(""); 
   $("#lotes").val("");
   $("#codigo_proveedor").val("%"); 
   $("#nombre_proveedor").val("");    
}
function ocultar(clase){
    $("."+clase).toggle();
}
function selecccionar(){
   var all = $("#select_all").is(":checked");
   if(all){       
      $(".seleccionable").prop('checked',true);
   }else{   
       $(".seleccionable").prop('checked',false);
   }
}
function verLotes(){
    
    //$("#btn_preview").prop("disabled",true);
    $("#new_estado_venta").val("Normal"); 
    var codigo = $("#codigo").val();
    var lotes = $("#lotes").val();
    var cod_prov = $("#codigo_proveedor").val();
    var estado_venta = $("#estado_venta").val(); 
    var terminacion = $("#term").val();      
    var ColorCod = $("select#filtroColores option:selected").val(); 
    
    if(terminacion === "%"){
        terminacion = '';
    }
    var terminacion_padre = $("#term_padre").val();
    if(terminacion_padre === "%"){
        terminacion_padre = '';
    }
    
    var stock_min = $("#stock_min").val();
    var stock_max = $("#stock_max").val();
    
    var moneda = $("#moneda").val(); 
    var um = $("#um").val(); 
    errores = 0;
    porc_valor_minimo = parseFloat($("#porc_val_min").val());
    
    var dec = 0;
    if(moneda !== "G$"){
        dec = 2;
    }
    
    
    var suc = $("#sucs").val();
    
    $(".fila > td").css("background","rgb(110,110,110)");
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "filtroManejoLotes", cod_prov:cod_prov,estado_venta:estado_venta,um:um,moneda:moneda,codigo:codigo,lotes:lotes,suc:suc,terminacion:terminacion,terminacion_padre:terminacion_padre,ColorCod:ColorCod,stock_min:stock_min,stock_max:stock_max,usuario:getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            //$("#pder").slideUp(); 
        },
        success: function (data) { 
            $(".fila").remove();    
            var cant = 0;
            var displayColores = ($("th.colores").is(":visible"))?"":"style='display:none'";
            var displayPrecioFinal = ($("th.colores").is(":visible"))?"style='display:none'":"display:block";
             
            $("input[id^=mod_val_]").val("");
            for (var i in data) { 
                //var NroDoc = data[i].NroDoc;
                //var CardName = data[i].CardName;                
                 
                var Codigo = data[i].codigo;  
                var Descrip = data[i].descrip;  
                var Lote = data[i].lote;  
                var Suc = data[i].suc;  
                var Stock =  parseFloat(data[i].stock).format(2,3,".",","); 
                
                var pantone = data[i].pantone;  
                var color = data[i].color;   
                var cod_catalogo  = data[i].cod_catalogo;
                var color_cod_fabric  = data[i].color_cod_fabric;
                
                var PrecioCosto = parseFloat(data[i].precio_costo).format(dec,3,".",",");
                 
                var gramaje =  parseFloat(data[i].gramaje).format(3,10,"","."); 
                var ancho = parseFloat(data[i].ancho).format(3,10,"","."); 
                var precio_costo = parseFloat( data[i].precio_costo);
                  
                var ValorMinimo = parseFloat(data[i].valor_minimo).format(dec,3,".",",");
                
                var Precio1 = parseFloat(data[i]["precio_1"]).format(dec,3,".",",");
                var Precio2 = parseFloat(data[i]["precio_2"]).format(dec,3,".",",");
                var Precio3 = parseFloat(data[i]["precio_3"]).format(dec,3,".",",");
                var Precio4 = parseFloat(data[i]["precio_4"]).format(dec,3,".",",");
                var Precio5 = parseFloat(data[i]["precio_5"]).format(dec,3,".",",");
                var Precio6 = parseFloat(data[i]["precio_6"]).format(dec,3,".",",");
                var Precio7 = parseFloat(data[i]["precio_7"]).format(dec,3,".",",");
                
                var desc_1 = parseFloat(data[i].desc_1).format(dec,3,0,0);
                var desc_2 = parseFloat(data[i].desc_2).format(dec,3,0,0);
                var desc_3 = parseFloat(data[i].desc_3).format(dec,3,0,0);
                var desc_4 = parseFloat(data[i].desc_4).format(dec,3,0,0);
                var desc_5 = parseFloat(data[i].desc_5).format(dec,3,0,0);
                var desc_6 = parseFloat(data[i].desc_6).format(dec,3,0,0);
                var desc_7 = parseFloat(data[i].desc_7).format(dec,3,0,0);     

                 
                 
                
                var pf1 = (parseFloat( redondearMoneda(data[i]["precio_1"] - data[i]["desc_1"] ))).format(dec,3,0,0);
                var pf2 = (parseFloat( redondearMoneda(data[i]["precio_2"] - data[i]["desc_2"] ))).format(dec,3,0,0);
                var pf3 = (parseFloat( redondearMoneda(data[i]["precio_3"] - data[i]["desc_3"] ))).format(dec,3,0,0);
                var pf4 = (parseFloat( redondearMoneda(data[i]["precio_4"] - data[i]["desc_4"] ))).format(dec,3,0,0);
                var pf5 = (parseFloat( redondearMoneda(data[i]["precio_5"] - data[i]["desc_5"] ))).format(dec,3,0,0);
                var pf6 = (parseFloat( redondearMoneda(data[i]["precio_6"] - data[i]["desc_6"] ))).format(dec,3,0,0);
                var pf7 = (parseFloat( redondearMoneda(data[i]["precio_7"] - data[i]["desc_7"] ))).format(dec,3,0,0);
                var EstadoVenta = data[i].estado_venta;
                
                var check_proveedor = $(".check_proveedor").is(":checked");
                var check_fecha_compra = $(".check_fecha_compra").is(":checked");
                var check_descrip = $(".check_descrip").is(":checked");
                var check_descuentos = $(".check_descuentos").is(":checked");
                
                var hide_prov = "table-cell";
                if(check_proveedor){
                    hide_prov = "none";
                }
                var hide_fc = "table-cell";
                if(check_fecha_compra){
                    hide_fc = "none";
                }
                var hide_descrip= "table-cell";
                if(check_descrip){
                    hide_descrip = "none";
                }
                var hide_descuentos= "table-cell";
                if(check_descuentos){
                    hide_descuentos = "none";
                }
                var resaltar = "";
                if(precio_costo === 0){
                    errores++;
                    resaltar = "resaltar";
                }
                var permisos_extras = "";
                if(!$(".permisos_extras").is(":visible")){
                    permisos_extras = "style='display:none'";
                }    
                
                $(".lotes").append("<tr id='tr_"+Codigo+"-"+Lote+"' class='fila' data-fila='"+i+"' data-gramaje='"+gramaje+"' data-ancho='"+ancho+"'>\n\
                                        <td class='item codigo'>"+Codigo+"</td>\n\
                                        <td class='item descrip' style='display:"+hide_descrip+"'>"+Descrip+"</td>\n\
                                        <td class='item lote' title='"+Descrip+"' style='cursor:pointer'  title='' onclick=getHistorialPrecios('"+Codigo+"','"+Lote+"') >"+Lote+"</td>\n\
                                        <td class='itemc suc'>"+Suc+"</td>\n\
                                        <td class='num stock'>"+Stock+"</td>\n\
                                        <td class='num p_costo "+resaltar+"'"+permisos_extras+">"+PrecioCosto+"</td>\n\
                                        <td class='num p_valmin' "+permisos_extras+">"+ValorMinimo+"</td>\n\
                                        <td class='price_1_"+i+" num p1' data-precio='"+Precio1+"'  >"+Precio1+"</td>\n\
                                        <td class='price_2_"+i+" num p2' data-precio='"+Precio2+"'  >"+Precio2+"</td>\n\
                                        <td class='price_3_"+i+" num p3' data-precio='"+Precio3+"'  >"+Precio3+"</td>\n\
                                        <td class='price_4_"+i+" num p4' data-precio='"+Precio4+"'  >"+Precio4+"</td>\n\
                                        <td class='price_5_"+i+" num p5' data-precio='"+Precio5+"'  >"+Precio5+"</td>\n\
                                        <td class='price_6_"+i+" num p6' data-precio='"+Precio6+"'  >"+Precio6+"</td>\n\
                                        <td class='price_7_"+i+" num p7' data-precio='"+Precio7+"'  >"+Precio7+"</td>\n\
                                        <td class='price_1_"+i+" num d1 descuentos' style='display:"+hide_descuentos+"'>"+desc_1+"</td>\n\
                                        <td class='price_2_"+i+" num d2 descuentos' style='display:"+hide_descuentos+"'>"+desc_2+"</td>\n\
                                        <td class='price_3_"+i+" num d3 descuentos' style='display:"+hide_descuentos+"'>"+desc_3+"</td>\n\
                                        <td class='price_4_"+i+" num d4 descuentos' style='display:"+hide_descuentos+"'>"+desc_4+"</td>\n\
                                        <td class='price_5_"+i+" num d5 descuentos' style='display:"+hide_descuentos+"'>"+desc_5+"</td>\n\
                                        <td class='price_6_"+i+" num d6 descuentos' style='display:"+hide_descuentos+"'>"+desc_6+"</td>\n\
                                        <td class='price_7_"+i+" num d7 descuentos' style='display:"+hide_descuentos+"'>"+desc_7+"</td>\n\
                                        <td class='price_1_"+i+" num pf1 precios filtroLista' "+displayPrecioFinal+" data-precio_final='"+pf1+"'  >"+pf1+"</td>\n\
                                        <td class='price_2_"+i+" num pf2 precios filtroLista' "+displayPrecioFinal+" data-precio_final='"+pf2+"'  >"+pf2+"</td>\n\
                                        <td class='price_3_"+i+" num pf3 precios filtroLista' "+displayPrecioFinal+" data-precio_final='"+pf3+"'  >"+pf3+"</td>\n\
                                        <td class='price_4_"+i+" num pf4 precios filtroLista' "+displayPrecioFinal+" data-precio_final='"+pf4+"'  >"+pf4+"</td>\n\
                                        <td class='price_5_"+i+" num pf5 precios filtroLista' "+displayPrecioFinal+" data-precio_final='"+pf5+"'  >"+pf5+"</td>\n\
                                        <td class='price_6_"+i+" num pf6 precios filtroLista' "+displayPrecioFinal+" data-precio_final='"+pf6+"'  >"+pf6+"</td>\n\
                                        <td class='price_7_"+i+" num pf7 precios filtroLista' "+displayPrecioFinal+" data-precio_final='"+pf7+"'  >"+pf7+"</td>\n\
                                        <td class='colores item filtroLista' "+displayColores+">"+pantone+"</td>\n\
                                        <td class='colores item filtroLista color' "+displayColores+">"+color+"</td>\n\\n\
                                        <td class='colores item filtroLista' "+displayColores+">"+cod_catalogo+"-"+color_cod_fabric+"</td>\n\
                                        <td class='itemc estado_venta "+EstadoVenta+"'>"+EstadoVenta+"</td>\n\
                                        <td class='result itemc'><input type='checkbox' class='seleccionable' ></td>\n\
                                    </tr>");
                cant++;            
        }
        $("[class^=price]").hover(function(){
           $(".resalt").removeClass("resalt");
           var c = $(this).attr("class").split(" ")[0];           
           $("."+c).addClass("resalt");
        });
        
        if(errores > 0){
            errorMsg("Existen codigos con Precio de Costo incorrecto",15000);
        }
        if(cant > 0){
            $("#msg").html(""); 
        }else{
            $("#msg").html("Ningun resultado, verifique los filtros..."); 
        }
        if($("th.colores").is(":visible")){
            $("div#editarColor").slideDown();
        }else{
            $("div#pder").slideDown();
        }
        $("#btn_preview").removeAttr("disabled");
    }
    });
       
}     

function getHistorialPrecios(codigo,lote){
    var c = $(".cab_"+codigo+"_"+lote+"").length;
    $("#tr_"+codigo+"-"+lote+"").find(".lote").addClass("show_hist");     
    if(c == 0){
        $.ajax({
            type: "POST",
            url: "productos/ManejoLotes.class.php",
            data: {action: "getHistorialPrecios",codigo:codigo,lote:lote},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   //fecha, suc, codigo, lote, num AS cat, moneda, um,
                if (data.length > 0) {
                    $(".cab_"+codigo+"_"+lote+"").remove();
                    
                             
                    var hist_cab = "<tr class='cab_"+codigo+"_"+lote+"'><td colspan='2'></td><td colspan='20' > \n\
                     <table class='hist_"+codigo+"_"+lote+"'  border='1' style='border-collapse:collapse;width:100%;background-color:white'>\n\
                        <tr><th class='titulo' colspan='9'>Historial Precios</th></tr>\n\
                       <tr>  <th>Usuario</th><th>fecha</th> <th>Suc</th>  <th>Cat</th> <th>Moneda</th>  <th>Um</th>  <th>Precio.Ant.</th>  <th>Precio Final</th><th>Estado Venta</th></tr>\n\
                     </table></td></tr>";
                     $("#tr_"+codigo+"-"+lote).after(hist_cab);
                     for(var i in data){
                        var user = data[i].usuario;
                        var fecha = data[i].fecha;
                        var suc = data[i].suc;
                        var cat = data[i].cat;
                        var moneda = data[i].moneda;
                        var dec = 0;
                        if(moneda == "U$"){
                            dec = 2;
                        }
                        var um = data[i].um;
                        var precio_final_ant = parseFloat(data[i].precio_final_ant).format(dec,3,0,0);    
                        var precio_final_actual = parseFloat(data[i].precio_final_actual).format(dec,3,0,0);    
                        var estado_venta = data[i].estado_venta;

                        $(".hist_"+codigo+"_"+lote+"").append("<tr><td class='itemc'>"+user+"</td><td class='itemc'>"+fecha+"</td><td class='itemc'>"+suc+"</td><td class='itemc'>"+cat+"</td>\n\
                        <td class='itemc'>"+moneda+"</td><td class='itemc'>"+um+"</td><td class='num'>"+precio_final_ant+"</td><td class='num'>"+precio_final_actual+"</td><td class='itemc "+estado_venta+"'>"+estado_venta+"</td></tr>");
                     }
                } else {
                    var hist_cab = "<tr class='cab_"+codigo+"_"+lote+"'><td colspan='22' style='text-align:center;background:lightgray' > Sin historial de modificaciones </td></tr>";
                    $("#tr_"+codigo+"-"+lote).after(hist_cab);
                }                
                $("#msg").html("");   
            },
            error: function (e) {                 
                $("#msg").html("Error al xxx cuenta:  " + e);   
                errorMsg("Error al xxx cuenta:  " + e, 10000);
            }
        }); 
    }else{
        $(".cab_"+codigo+"_"+lote+"").slideUp(function(){           
            $(".cab_"+codigo+"_"+lote+"").remove();
        });
        $("#tr_"+codigo+"-"+lote+"").find(".lote").removeClass("show_hist");
    }
}

function igualarValores(){
   var mod_val_1 = $("#mod_val_1").val(); 
   for(var i = 2;i <=7;i++){
      $("#mod_val_"+i).val(mod_val_1);       
   }  
   checkVal($("#mod_val_1"));
}

function setHotKeyArticulo(){   
    $("#descrip").keydown(function(e) {
        
        var tecla = e.keyCode; //console.log(tecla);  
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
        if(tecla == 27){
           $("#ui_articulos").fadeOut(); 
        }  
        if (tecla == 116) { // F5
            e.preventDefault(); 
        } 
          
    });
}
 function getColores() {
     var codigo = $("#codigo").val();
     var suc = $("#sucs").val();
     $("#filtroColores").empty();
     
     $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {action: "coloresXArticulo", codigo: codigo, usuario: getNick(),suc:suc},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $(".info_colores").remove();
            $($("#filtroColores").parent()).append("<img src='img/loading_fast.gif' width='16px' height='16px'>");
        },
        success: function (data) {   
            if(data.length > 0 ){
               $("#filtroColores").append('<option value="%">% - Todos</option>'); 
               for(var i in data){
                   var pantone = data[i].pantone;
                   var color = data[i].color;
                   $("#filtroColores").append('<option value="'+pantone+'">'+color+' - '+pantone+'</option>');
               } 
               $($("#filtroColores").parent().find("img")).remove();
               $("#filtroColores > option:nth-child(even)").css("background","#F0F0F5"); // Color Zebra para los Selects
            }else{
                $($("#filtroColores").parent().find("img")).remove();
                $($("#filtroColores").parent()).append("<label class='info_colores'>No hay colores</label>");
            }         
        },
        error: function (e) {                 
            $($("#filtroColores").parent().find("img")).remove();
            errorMsg("Error al obtener colores  " + e, 10000);
        }
    }); 
     
     
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

/**
 * Tipo de modificaciÃ³n
 */

function actualizarLista(){
    $("#msg_lotes").html("<span style='background-color:orange;color:white'> Esto podria tardar unos minutos<img src='img/loading_fast.gif' width='16px' height='16px'></span>"); 
    var target = $("select#ml_tipoMod option:selected").val();
    $(".filtroLista").hide(0,function(){
        $("."+target).fadeIn();
        $("#msg_lotes").html("<span style='background-color:orange;color:white'>ATENCION! Tips de Velocidad: Antes de Filtrar elija que es lo que desea modificar y despues haga clic en 'Ver Lista de Lotes'.</span>"); 
    });
}
function ml_buscarColor(){    
    var colorRef = $("input#ml_cambioColor").val();
    $("ul#ml_listaColores").empty();
    if((colorRef.trim()).length>2){
        $("div#bc_loader").show(0);
        $.post("productos/ManejoLotes.class.php",{"action":"buscarColores","search":colorRef}, function(data){
            $.each(data, function(key,value){
                $("<li/>",{
                    "text":value,
                    "data-codigo":key,
                    "hover":function(){$("ul#ml_listaColores li").removeClass("selected");},
                    "onclick":"ml_setColor($(this))"
                }).appendTo("ul#ml_listaColores");
            });
            $("div#bc_loader").hide(0);
        },'json');
    }
    $("ul#ml_listaColores").show(0);
}
function ml_setColor(target){
    $("input#ml_cambioColor").val(target.text());
    $("input#ml_cambioColor").data('codigo',target.data('codigo'));
    $("ul#ml_listaColores").hide(0);
}
function ml_buscarToggle(){
    if(!$("ul#ml_listaColores").is(":visible")){
        $("ul#ml_listaColores").show(0);
    }
}
function ml_iniciarSugerencias(){
    $("input#ml_cambioColor").unbind();
    $("input#ml_cambioColor").bind({
        keydown: function(e) {
            var options = $("ul#ml_listaColores li").length-1;
            var current = $("ul#ml_listaColores li.selected").index();
            $("ul#ml_listaColores li").removeClass("selected");
            var next = 0;
            switch(e.which){
                case 38:// Flecha arriba
                    if(!$("ul#ml_listaColores").is(":visible")){$("ul#ml_listaColores").show(0);}
                    next = (current == -1)?options:current-1;
                    var target = $("ul#ml_listaColores li").get(next);
                    $(target).addClass("selected");
                    $("input#ml_cambioColor").val($(target).text());
                    $("input#ml_cambioColor").data('codigo',$(target).data('codigo'));
                break;
                case 40:// Flecha abajo
                    if(!$("ul#ml_listaColores").is(":visible")){$("ul#ml_listaColores").show(0);}
                    next = (current == options)?0:current+1;
                    var target = $("ul#ml_listaColores li").get(next);
                    $(target).addClass("selected");
                    $("input#ml_cambioColor").val($(target).text());
                    $("input#ml_cambioColor").data('codigo',$(target).data('codigo'));
                    //console.log('current'+current+', option:'+options+', '+next+', '+target.text());
                break;
                case 13:// Enter
                    $("ul#ml_listaColores").hide(0);
                    break;
                default:
                    ml_buscarColor();
                    break;
            }
        }
    });
}

//Actualizar color
function ml_actualizarColor(){
    $("span#ml_actualizarColorMsj").empty();
    var lotes = [];
    if( $("input[type=checkbox].seleccionable:checked").length == 0 ){
        $("span#ml_actualizarColorMsj").text("Seleccione el o los lotes a actualizar !");
    }else{
        if( $("input#ml_cambioColor").data("codigo").trim().length == 0 || typeof($("input#ml_cambioColor").data("codigo")) == "undefined" ){
            $("span#ml_actualizarColorMsj").text("Seleccione un Color !");
        }else{
            $("div#bc_loader").show(0);
            $($("input[type=checkbox].seleccionable:checked").closest("tr")).each(function(){
                lotes.push($(this).find("td.lote").text());
            });
            var pantone = $("input#ml_cambioColor").data("codigo");
            var color = $("input#ml_cambioColor").val();
            
            $.post("productos/ManejoLotes.class.php",{"action":"actualizarColor","usuario":getNick(),"padreEHijos":$("input#padreEHijos").is(":checked"), "lotes":JSON.stringify(lotes), "ColorCod":pantone}, function(data){
                var msj= data.msj;
                var rows_afected = data.rows_afected;
                
                $("span#ml_actualizarColorMsj").text(msj+"<br>"+rows_afected+" lotes modificados");
                $("div#bc_loader").hide(0);
                $("input#btn_preview").removeAttr("disabled");
                
                if(data.rows_afected > 0){
                    $($("input[type=checkbox].seleccionable:checked").closest("tr")).each(function(){
                      $(this).find("td.color").text(color) ;
                    });
                }
                
            },'json');
        }
    }
}
 
function getMonedaListaPrecios(){
    var codigo = $("#codigo").val();
    $.ajax({
        type: "POST",
        url: "productos/ManejoLotes.class.php",
        data: {action: "getMonedaListaPrecios", codigo: codigo },
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {  
            $("#moneda").empty();
            for(var i in data){
                var moneda = data[i].moneda;
                $("#moneda").append("<option value='"+moneda+"'>"+moneda+"</option>"); 
            }  
            $("#msg").html(""); 
            getUmListaPrecios();
        },
        error: function (e) {                 
            $("#msg").html("Error al xxx cuenta:  " + e);   
            errorMsg("Error al xxx cuenta:  " + e, 10000);
        }
    }); 
} 

function getUmListaPrecios(){
    var codigo = $("#codigo").val();
    var moneda = $("#moneda").val();
    if(codigo == "%" && $(".fila").length > 0){
        codigo = $(".codigo").html();
    }
    if(codigo != "%"){
    $.ajax({
        type: "POST",
        url: "productos/ManejoLotes.class.php",
        data: {action: "getUmListaPrecios", codigo: codigo,moneda:moneda },
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            $("#um").empty();
            for(var i in data){
                var um = data[i].um;
                $("#um").append("<option value='"+um+"'>"+um+"</option>");  
            }  
            $("#msg").html(""); 
        },
        error: function (e) {                 
            $("#msg").html("Error al xxx cuenta:  " + e);   
            errorMsg("Error al xxx cuenta:  " + e, 10000);
        }
    }); 
    }
} 
 


function estadoVenta(){
    var estado = $("#new_estado_venta").val();
    $(".seleccionable").prop("disabled",false);   
    switch(estado){
        case "Retazo":
            var moneda = $("#moneda").val();
            if(moneda == "G$"){            
                var articulos = [];
                $(".codigo").each(function(){
                var articulo = $(this).text();
                if(articulos.indexOf(articulo) == -1){
                    articulos.push(articulo);
                }
                });
                if(articulos.length > 1){
                    $("#new_estado_venta").val("%");
                    alert("No puede pasar a retazo lotes de diferentes articulos");
                }else{
                    if(articulos.length == 0){
                        $("#new_estado_venta").val("%");
                    }else{
                        buscarPrecioRetazo();
                    }
                }
            }else{
                $("#new_estado_venta").val("%");
                alert("Solo se puede poner precio de retazo a moneda G$. ");
                var c = confirm("Desea filtrar para la moneda G$?");
                if(c){
                    $("#moneda").val("G$");
                    verLotes();
                }else{
                    $("#new_estado_venta").val("%");
                }
            }
            break;
        default:
            /* $(".botones").prop("disabled",true);
            $("input[id^=mod_val_]").val(''); */
            $("input[id^=mod_val_]").each(function(){
                checkVal($(this));
            });
        break;
    }
}

function buscarPrecioRetazo(){
     var codigo = $("#codigo").val();
     if(codigo == "%"){
        codigo = $(".codigo").first().html();
     }
     $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {action: "getPrecioRetazo", codigo:codigo},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            cant_retazo = parseFloat(data.cant_retazo);
            var precio_retazo = redondearMoneda(parseFloat(data.precio_retazo),'G$');           
            if(precio_retazo > 0 && cant_retazo > 0){
                $("#modificar").val('precio_final_directo');
                $("input[id^=mod_val_]").val(precio_retazo);
                setLabels();
            }
            $("#msg").html(""); 
        },
        error: function (e) {                 
            $("#msg").html("Error al obtener precio y cantidad de retazo  " + e);   
            errorMsg("Error al obtener precio y cantidad de retazo   " + e, 10000);
        }
    });  

    $("input[id^=mod_val_]").each(function(){
        checkVal($(this));
    });
}