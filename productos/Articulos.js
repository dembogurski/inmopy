var openForm = false;
var checks = ["art_venta", "art_inv", "art_compra"]; 
var buscadorArticulos =false;

function configurar(){
    $('#articulos').DataTable( {
        "language": {
            "lengthMenu": "Mostrar _MENU_ filas por pagina",
            "zeroRecords": "Ningun resultado - lo siento",
            "info": "Mostrando pagina _PAGE_ de _PAGES_",
            "infoEmpty": "Ningun registro disponible",
            "infoFiltered": "(filtrado de un total de _MAX_ registros)",
            "search":"Buscar",
	    "paginate": {
             "previous": "Anterior",
             "next": "Siguiente"
            }
        },
        responsive: true,
		"lengthMenu": [[10, 20, 50, 100, -1], [10, 20, 50, 100, "All"]],
		"pageLength": 20,
        dom: 'l<"toolbar">frtip',
        initComplete: function(){
           $("div.toolbar").html('<button type="button" id="add_button_articulos" onclick="addUI()">Nuevo Registro</button>');           
        },
        "autoWidth": false
    } );
    
    
    
    window.addEventListener('resize', function(event){
        if(openForm){
           centerForm();
        }
    });  
    
}  
function configurarCamposNumericos(){
    $(".form_number").on("keypress", function(evt) {
        var keycode = evt.charCode || evt.keyCode;    
        if (keycode == 46) {   
           errorMsg("Utilice Coma en vez de Punto para los campos numericos",8000);
           return false;
        }
    });    
}
  
function editUI(pk){
    $.ajax({
        type: "POST",
        url: "productos/Articulos.class.php",
        data: {action: "editUI" , pk: pk,  usuario: getNick()},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $(".form").html("");
             $("#msg_articulos").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito === "success") {                          
                var form = objeto.responseText;                  
                centerForm(); 
                $(".form").html(form);
                $("#msg_articulos").html("");                
                $( "#tabs" ).tabs(); 
                $( "#tabs" ).tabs({ active: 0 }); 
                configurarCamposNumericos();
                $(".modif").click(function () {
                    $("#articulos_update_button").prop("disabled",false);               
                });
                $(".nomodif").click(function () {
                    $("#articulos_update_button").prop("disabled",true);               
                });
                $("#add_barcode").keyup(function(){
                    var bar = $(this).val();
                    if(bar !== ""){
                        $("#add_barcode_button").prop("disabled",false);
                    }else{
                        $("#add_barcode_button").prop("disabled",true);
                    }
                }); 
                $("#add_barcode").change(function(){
                    var bar = $(this).val();
                    if(bar !== ""){
                       addBarcode();   
                    } 
                });
            }else{
                $("#msg_articulos").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        },
        error: function () {
           $("#msg_articulos").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });   
}
function getPropiedades(){
    var codigo = $("#form_codigo").val();
    $.ajax({
        type: "POST",
        url: "productos/Articulos.class.php",
        data: {action: "getPropiedades", codigo: codigo },
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_articulos").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {  
             $(".row_prop").remove();
             if(data.length > 0){
                 for(var i in data){
                    var cod_prop = data[i].cod_prop;
                    var descrip = data[i].descrip;
                    var valor_def = (data[i].valor_def).toString().split(",");
                    var valor = data[i].valor;
                    var elements = '<option style="min-width:40px" value="" ></option>';
                    valor_def.forEach(function(e) {
                        var selected = '';
                        if(e === valor){ 
                            selected = 'selected="selected"';
                        }   
                        elements+='<option style="min-width:40px" value='+e+' '+selected+'>'+e+'</option>';
                    });
                    
                    $("#art_propiedades").append("<tr class='row_prop' data-cod='"+cod_prop+"'><td  class='itemc'>"+cod_prop+"</td><td class='item'>"+descrip+"</td><td  class='itemc'><select class='prop_"+cod_prop+"' onchange='saveProp("+cod_prop+")'>"+elements+"</select></td></tr>");
                 }
                 $("#msg_articulos").html("");   
             }else{
                 $("#msg_articulos").html("Este articulo aun no tiene propiedades asignadas" );
             }              
        },
        error: function (e) {                 
            $("#msg_articulos").html("Error al obtener las propiedades del articulo" + e);   
            errorMsg("Error al obtener las propiedades del articulo  " + e, 10000);
        }
    }); 
}
function saveProp(cod_prop){
    var value = $(".prop_"+cod_prop).val();
    var codigo = $("#form_codigo").val();
    $("#msg_articulos").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
    $.post("productos/Articulos.class.php", { "action": "saveProp",codigo:codigo,cod_prop:cod_prop,value:value  }, function(data) {
         $("#msg_articulos").html(data ); 
    });
}
function getDatosInventario(){
    if($("#form_art_inv").is(":checked")){
    var codigo = $("#form_codigo").val();
        $.ajax({
            type: "POST",
            url: "productos/Articulos.class.php",
            data: {action: "getDatosInventario", codigo: codigo },
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg_articulos").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {  
                 $(".row_inv").remove();
                 
                 var TotalNormal = 0;
                 var TotalOferta = 0;
                 var TotalArribos = 0;
                 var StockRecuperado = 0;
                 var TotalPromocion = 0;
                 var TotalBloqueado = 0;
                 var TotalGlobal = 0;
                 
                 if(data.length > 0){
                     for(var i in data){
                        var suc = data[i].suc;
                        var nombre = data[i].nombre;
                        var StockNormal = data[i].StockNormal;
                        var StockOferta = data[i].StockOferta;
                        var StockArribos = data[i].StockArribos;
                        var StockRecuperado = data[i].StockRecuperado;
                        var StockPromocion = data[i].StockPromocion;
                        var StockBloqueado = data[i].StockBloqueado;
                        var StockTotal = data[i].StockTotal;
                        
                        TotalNormal += parseFloat(StockNormal);
                        TotalOferta += parseFloat(StockOferta);
                        TotalArribos+= parseFloat(StockArribos);
                        StockRecuperado += parseFloat(StockRecuperado);
                        TotalPromocion+=parseFloat(StockPromocion);
                        TotalBloqueado+=parseFloat(StockBloqueado);
                        TotalGlobal+=parseFloat(StockTotal);

                        $("#stock_x_suc").append("<tr class='row_inv'><td  class='itemc'>"+suc+"</td><td class='item'>"+nombre+"</td>\n\
                        <td  class='num'>"+StockNormal+"</td>\n\
                        <td  class='num'>"+StockOferta+"</td>\n\
                        <td  class='num'>"+StockArribos+"</td>\n\
                        <td  class='num'>"+StockRecuperado+"</td>\n\
                        <td  class='num'>"+StockPromocion+"</td>\n\
                        <td  class='num'>"+StockBloqueado+"</td>\n\
                        <td  class='num'>"+StockTotal+"</td></tr>");
                     }
                     $("#stock_x_suc").append("<tr class='row_inv' style='font-weight:bolder' ><td colspan='2'></td>\n\
                        <td  class='num'>"+TotalNormal+"</td>\n\
                        <td  class='num'>"+TotalOferta+"</td>\n\
                        <td  class='num'>"+TotalArribos+"</td>\n\
                        <td  class='num'>"+StockRecuperado+"</td>\n\
                        <td  class='num'>"+TotalPromocion+"</td>\n\
                        <td  class='num'>"+TotalBloqueado+"</td>\n\
                        <td  class='num'>"+TotalGlobal+"</td></tr>");
                    
                     $("#msg_articulos").html("");   
                     var um_inv = $("#form_um").val();
                     $("#um_inv_art").html("("+um_inv+")");
                 }else{
                     $("#msg_articulos").html("Este articulo aun no tiene stock" );
                 }
                $("#stock_x_suc").find("td.num").each(function(){
                    var v = parseFloat($(this).text()).format(2, 3, '.', ',');
                    $(this).text(v);   
                });
            },
            error: function (e) {                 
                $("#msg_articulos").html("Error al obtener las propiedades del articulo" + e);   
                errorMsg("Error al obtener las propiedades del articulo  " + e, 10000);
            }
        });     
    }else{
        $("#stock_x_suc").fadeOut(); 
    }
}

function getUsos(){
    getUsosAsignNoAsign("getUsosNoAsignados");
    getUsosAsignNoAsign("getUsosAsignados");
}

function getFiltrosListaPrecios(){
    
    var um = $("#form_um").val();
    $.ajax({
        type: "POST",
        url: "productos/Articulos.class.php",
        data: {action: "getMonedaFromListaPrecios",um:um,"campo":"moneda"},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#lp_moneda").html("");
            $(".lp_row").remove();
            $("#msg_articulos").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            if (data.length > 0){
                for(var i in data){
                    var moneda = data[i].moneda;
                    $("#lp_moneda").append("<option value='"+moneda+"'>"+moneda+"</option>");
                }
                $("#msg_articulos").html("Ok"); 
            }    
            getUmFromListaPrecios($("#lp_moneda").val());
            $("#lp_moneda").change(function(){
                var moneda = $(this).val();
                getUmFromListaPrecios(moneda);
            });
             
        },
        
        error: function (e) {                 
            $("#msg_articulos").html("Error al obtener moneda:  " + e);   
            errorMsg("Error al obtener moneda:  " + e, 10000);
        }
    });    
}
function getUmFromListaPrecios(moneda){
    var um = $("#form_um").val();
    $.ajax({
        type: "POST",
        url: "productos/Articulos.class.php",
        data: {action: "getUmFromListaPrecios",moneda:moneda,um:um,},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#lp_um").html("");
            $(".lp_row").remove();
            $("#msg_articulos").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            if (data.length > 0){
                for(var i in data){
                    var um = data[i].um;
                    $("#lp_um").append("<option value='"+um+"'>"+um+"</option>");
                }
                $("#msg_articulos").html("Ok"); 
            }  
            getListaPrecios(); 
             
        },
        
        error: function (e) {                 
            $("#msg_articulos").html("Error al obtener moneda:  " + e);   
            errorMsg("Error al obtener moneda:  " + e, 10000);
        }
    });        
}

function getListaPrecios(){
    var codigo = $("#form_codigo").val();
    var moneda = $("#lp_moneda").val();
    var um = $("#lp_um").val();
    $.ajax({
        type: "POST",
        url: "productos/Articulos.class.php",
        data: {action: "getListaPrecios", suc: getSuc(), usuario: getNick(),codigo:codigo,moneda:moneda,um:um},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_articulos").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $(".lp_row").remove();
        },
        success: function (data) {   
                for(var i in data){
                    var num = data[i].num;
                    var moneda = data[i].moneda;
                    var um = data[i].um;
                    var descrip = data[i].descrip;
                    var factor = data[i].factor;
                    var regla_redondeo = data[i].regla_redondeo; 
                    var decimales = 2;
                    if(regla_redondeo == "SEDECO"){
                        decimales = 0;
                    }
                    var precio = parseFloat(data[i].precio).format(decimales, 3, '.', ',');
                    var monr = moneda.replace("$","s");
                    var pre_ref = num+"-"+monr+"-"+um;
                    var ref = data[i].ref;
                    
                    var  row = "first_row";
                    if (i > 0 ){
                         row = "";
                    }
                    
                    $("#lista_precios").append("<tr class='lp_row'><td class='itemc lista'>"+num+"</td><td class='itemc'>"+moneda+"</td><td class='itemc'>"+um+"</td><td class='item descrip_"+descrip+"'>"+descrip+"</td><td class='num' data-regla='"+regla_redondeo+"'>"+factor+"</td><td class='itemc' style='width:80px'><input type='text' data-num='"+num+"' data-moneda='"+moneda+"'  data-um='"+um+"' data-ref='"+ref+"'  class='precio_venta num precio_"+pre_ref+" "+row+"' value='"+precio+"' id='precio_"+num+"' onkeypress='return onlyNumbers(event)' ></td><td class='itemc ref'>"+ref+"</td><td class='itemc' id='msg_lp_"+num+"' > </td></tr>");
                }
                
                $(".ref").hover(function(){
                    var ref = $(this).html();
                    $(".descrip_"+ref).addClass("referencia");
                },
                function(){
                    $(".referencia").removeClass("referencia");
                });
               
                $(".first_row").change(function(){                    
                    var apply_factor = $("#apply_factor").is(":checked");
                    if(apply_factor){
                        cambiarPrecio();
                    }
                });     
                $(".precio_venta").click(function(){ 
                  $(this).select();
                });
                
            $("#msg_articulos").html("Ok"); 
        },
        error: function (e) {                 
            $("#msg_articulos").html("Error al obtener lista:  " + e);   
            errorMsg("Error al obtener lista:  " + e, 10000);
        }
    }); 
}

function cambiarPrecio(){
    //var precio =  parseFloat( $(".precio_venta").val());  
    $(".precio_venta").each(function () {
        var referencia = $(this).attr("data-ref");
        var precio = parseFloat( $(".precio_"+referencia).val().replace(/\./g, '').replace(/\,/g, '.'));console.log("precio: "+precio);
        var factor =  parseFloat( $(this).parent().prev().html());   console.log("Factor: "+factor);
        var regla_redondeo  = $(this).parent().prev().attr("data-regla");   console.log("regla_redondeo: "+regla_redondeo);
        var calc = precio * factor;
        var moneda = $("#lp_moneda").val();
        if(regla_redondeo == "SEDECO"){
            calc = parseFloat(redondearMoneda(calc,moneda)).format(0, 3, '.', ',') ;  
        }else if(regla_redondeo == "2_DEC_ARRIBA"){
            calc = parseFloat(Math.ceil(calc * 100)/100).format(2, 3, '.', ',') ;  
        }else if(regla_redondeo == "2_DEC_ABAJO"){
            calc = parseFloat(Math.floor(calc * 100)/100).format(2, 3, '.', ',') ;  
        }
        $(this).val(calc);
    }); 
}
function guardarListaPrecios(){
    var codigo = $("#form_codigo").val();
    $(".precio_venta").each(function () {        
        var num = $(this).attr("data-num");
        var moneda = $(this).attr("data-moneda");
        var um = $(this).attr("data-um");
        var precio = parseFloat($(this).val().replace(/\./g, '').replace(/\,/g, '.') );                 
        $("#msg_lp_"+num).html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
        $.post("productos/Articulos.class.php", { "action": "guardarListaPrecios",usuario:getNick(), codigo:codigo,num:num, moneda:moneda,um:um,precio:precio  }, function(data) {                        
            console.log(data);
            var lp = parseInt(data);
            $("#msg_lp_"+lp).html("<img src='img/ok.png' width='16px' height='16px' >");
        });
    }); 
}

function getListaMateriales(){
   var codigo = $("#form_codigo").val();
   $.ajax({
            type: "POST",
            url: "productos/Articulos.class.php",
            data: {action: "getListaMateriales",codigo:codigo},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $(".row_lista_mat").remove();
                $("#msg_articulos").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                if(data.length > 0){
                 for(var i in data){
                    
                    var articulo = data[i].articulo;
                    var ref = data[i].ref;
                    var descrip = data[i].descrip;
                    var um = data[i].um;
                    var cantidad = data[i].cantidad;
                    var rendimiento = data[i].rendimiento;
                    var precio_unit = data[i].precio_unit;
                    var sub_total = data[i].sub_total;
                    var checked = ref === "true"?'checked="checked"':"";
                     
                    $("#lista_materiales").append("<tr class='art_"+articulo+" row_lista_mat' data-cod='"+articulo+"'><td  class='itemc'>"+articulo+"</td><td  class='item'>"+descrip+"</td><td  class='num'>"+cantidad+"</td><td  class='itemc'>"+um+"</td><td  class='itemc'><input type='checkbox' class='ref_"+articulo+" referencia' "+checked+" onclick='return false;'  ></td><td  class='itemc'>"+rendimiento+"</td><td  class='num'>"+precio_unit+"</td><td  class='num'>"+sub_total+"</td><td class='itemc'><img src='img/trash_mini.png' style='cursor:pointer' onclick=deleteFromListaMat('"+articulo+"') ></td></tr>");
                 }
                 //$("#lista_materiales").append(lastRowListaMateriales);
                  
                 
                 $("#lista_articulos").draggable();
                 $("#msg_articulos").html("");  
                  
             }else{
                 $("#msg_articulos").html("Este articulo no tiene lista de materiales" );
                 //$("#lista_materiales").append(lastRowListaMateriales);
                  
                 $("#lista_articulos").draggable();
                  
             }                    
            },
            error: function (e) {                 
                $("#msg_articulos").html("Error al obtener Lista de Materiales:  " + e);   
                errorMsg("Error al obtener Lista de Materiales:  " + e, 10000);
            }
        }); 
}
function deleteFromListaMat(articulo){
    var c = confirm("Esta seguro que desea quitar este articulo de la lista de materiales?");
    if(c){
        var codigo = $("#form_codigo").val();
        $("#msg_"+articulo).html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        $.post("productos/Articulos.class.php", { "action": "deleteFromListaMat",codigo:codigo,articulo:articulo   }, function(data) {
            console.log(data);
            $(".art_"+articulo).remove();
            alert("Articulo eliminado de la Lista de Materiales");
        });
    }
}
function buscarArticulos(){
    if(!buscadorArticulos){
        $("#msg_articulos").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        $.post("productos/Articulos.class.php", { "action": "buscarArticulos",filtro:" a.cod_sector not in(107) "  }, function(data) {
            $("#lista_articulos").html(data ); 
            $("#msg_articulos").html("");
            $('#buscar_articulos').DataTable( {
             "language": {
                 "lengthMenu": "Mostrar _MENU_ filas por pagina",
                 "zeroRecords": "Ningun resultado - lo siento",
                 "info": "Mostrando pagina _PAGE_ de _PAGES_",
                 "infoEmpty": "Ningun registro disponible",
                 "infoFiltered": "(filtrado de un total de _MAX_ registros)",
                 "search":"Buscar",
                 "paginate": {
                  "previous": "Anterior",
                  "next": "Siguiente"
                 }
             },
             responsive: true,
                     "lengthMenu": [[10, 20, 50, 100, -1], [10, 20, 50, 100, "All"]],
                     "pageLength": 10,
             dom: 'l<"toolbar">frtip',
             initComplete: function(){
                $("div.toolbar").html('<button type="button" id="add_button_articulos" onclick="closeSearchUI()">Cancelar</button>');    
                configurarEventoDataTablesListaMat();
                $('input[type="search"]').change(function(){
                   configurarEventoDataTablesListaMat();
                });
             },
             "autoWidth": false
         } );
            $("#lista_articulos").fadeIn();
            
         }); 
         
        buscadorArticulos = true;
    }else{
        $("#lista_articulos").fadeIn();
    }
}

function configurarEventoDataTablesListaMat(){
    console.log("Config Lista mat");
    $('#lista_articulos td').click(function () {
        var articulo = $(this).parent().attr("data-codigo");       
        if( $(".art_"+articulo).length > 0 ){
            errorMsg("Este articulo ya esta en la lista de materiales");
        }else{
            var descrip = $(".descrip_"+articulo).text();
            var um = $(".um_"+articulo).text();
            var precio_costo = $(this).parent().attr("data-precio_costo");
            $("#lista_materiales").append("<tr class='art_"+articulo+" row_lista_mat' data-articulo="+articulo+"><td class='itemc' >"+articulo+"</td><td>"+descrip+"</td><td class='itemc' ><input type='number' step='any' size='4' class='cant_"+articulo+" input_lista_mat num'  ></td><td class='itemc'>"+um+"</td><td class='itemc'><input type='checkbox' class='ref_"+articulo+" referencia'> </td><td class='itemc'><input type='number' size='4' class='rend_"+articulo+" itemc input_lista_mat' value='1' ></td><td class='itemc'><input type='number' step='any' size='8' class='p_costo_"+articulo+" input_lista_mat num' style='width:60px' value='"+precio_costo+"' ></td><td class='subtotal_"+articulo+" subt num'></td><td class='itemc' id='msg_"+articulo+"'></td></tr>");
            infoMsg("Ingrese la cantidad Requerida y/o el Rendimiento para guardar",8000);
            $(".cant_"+articulo).focus();
            configurarEventosFilaMateriales();
        }  
    });    
}

function configurarEventosFilaMateriales(){
 $(".input_lista_mat, .referencia").change(function(){
    var articulo = $(this).parent().parent().attr("data-articulo");                
    addToListaMat(articulo);
 });   
} 
function addToListaMat(articulo){
     
    var codigo = $("#form_codigo").val();
    var cantidad = $(".cant_"+articulo).val();
    var mtr = $(".ref_"+articulo).is(":checked");
    var rend = $(".rend_"+articulo).val();
    var p_costo = $(".p_costo_"+articulo).val();
    var subtotal = parseFloat(cantidad * p_costo);
    
    if(cantidad == "" || rend == ""){
        errorMsg("Ingrese la cantidad para guardar",6000);
    }else{
        $(".subtotal_"+articulo).html(subtotal);

        $.ajax({
            type: "POST",
            url: "productos/Articulos.class.php",
            data: {action: "addToListaMat",codigo:codigo,articulo:articulo,cantidad:cantidad,mtr:mtr,rend:rend,p_costo:p_costo  },
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg_"+articulo).html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                if (data.mensaje === "Ok") {
                   $("#msg_"+articulo).html("<img src='img/ok.png' width='16px' height='16px' >"); 
                } else {
                   $("#msg_"+articulo).html("<img src='img/warning_red_16.png' width='16px' height='16px' >"); 
                }                
            },
            error: function (e) {                 
                $("#msg").html("Error al xxx cuenta:  " + e);   
                errorMsg("Error al xxx cuenta:  " + e, 10000);
            }
        }); 
    }
     
}
function closeSearchUI(){
    $("#lista_articulos").fadeOut();
}
function getUsosAsignNoAsign(tipo_uso){
    
    var codigo = $("#form_codigo").val();
    $.ajax({
        type: "POST",
        url: "productos/Articulos.class.php",
        data: {action: tipo_uso, codigo: codigo },
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg_articulos").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {  
             $(".row_uso_"+tipo_uso).remove();
             if(data.length > 0){
                 for(var i in data){
                    var cod_uso = data[i].ID;
                    var descrip = data[i].descrip;
                     
                    $("#"+tipo_uso).append("<tr class='row_uso_"+tipo_uso+"' data-cod='"+cod_uso+"'><td  class='itemc'>"+cod_uso+"</td><td  class='item'>"+descrip+"</td></tr>");
                 }
                 $("#msg_articulos").html("");  
                 $(".row_uso_"+tipo_uso+"").click(function(){
                        if($(this).hasClass("selected_"+tipo_uso)){
                            $(this).removeClass("selected_"+tipo_uso);
                        }else{
                            $(this).addClass("selected_"+tipo_uso);
                        }
                 });
             }else{
                 $("#msg_articulos").html("Este articulo aun no tiene usos asignados" );
             }              
        },
        error: function (e) {                 
            $("#msg_articulos").html("Error al obtener los usos del articulo" + e);   
            errorMsg("Error al obtener los usos del articulo  " + e, 10000);
        }
    });     
}
function asignar(){
    var codigo = $("#form_codigo").val();
    var lista = listaSeleccionados("getUsosNoAsignados"); 
    if(lista.length >0){ 
        var ids = JSON.stringify(lista);
        $.ajax({
            type: "POST",
            url: "productos/Articulos.class.php",
            data: {action: "asignar",codigo:codigo,ids:ids},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg_articulos").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                if (data.mensaje === "Ok") {
                    $("#msg_articulos").html("Ok"); 
                    $("#getUsosAsignados").append($(".selected_getUsosNoAsignados"));
                } else {
                    $("#msg_articulos").html("Error al asignar");   
                }                
            },
            error: function (e) {                 
                $("#msg_articulos").html("Error al asignar:  " + e);   
                errorMsg("Error al asignar:  " + e, 10000);
            }
        }); 
    }
}

function desasignar(){
    var codigo = $("#form_codigo").val();
    var lista = listaSeleccionados("getUsosAsignados"); 
    if(lista.length >0){ 
        var ids = JSON.stringify(lista);
        $.ajax({
            type: "POST",
            url: "productos/Articulos.class.php",
            data: {action: "desasignar",codigo:codigo,ids:ids},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg_articulos").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                if (data.mensaje === "Ok") {
                    $("#msg_articulos").html("Ok"); 
                    $("#getUsosNoAsignados").append($(".selected_getUsosAsignados"));
                } else {
                    $("#msg_articulos").html("Error al asignar");   
                }                
            },
            error: function (e) {                 
                $("#msg_articulos").html("Error al asignar:  " + e);   
                errorMsg("Error al asignar:  " + e, 10000);
            }
        }); 
    }
}

function listaSeleccionados(tipo_uso){
    var ids = new Array();
    $(".selected_"+tipo_uso).each(function(){
       var id =$(this).attr("data-cod");  
       ids.push(id);        
    }); 
    return ids;
}

function addUI(){
    $.ajax({
        type: "POST",
        url: "productos/Articulos.class.php",
        data: {action: "addUI" ,  usuario: getNick()},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $(".form").html("");
             $("#msg_articulos").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito === "success") {                          
                var form = objeto.responseText;                  
                centerForm(); 
                $(".form").html(form);
                $("#msg_articulos").html("");     
                $( "#tabs" ).tabs(); 
                $( "#tabs" ).tabs({ active: 0 });
                $("#form_cod_sector").change(function(){
                     generarCodigo();
                });
                generarCodigo();
                configurarCamposNumericos();
            }else{
                $("#msg_articulos").html("Ocurrio un error en la comunicacion con el Servidor...");
            }
        },
        error: function () {
           $("#msg_articulos").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });   
}

function generarCodigo(){
    var cod_sector = $("#form_cod_sector").val();
    $.ajax({
        type: "POST",
        url: "productos/Articulos.class.php",
        data: {action: "generarCodigo",cod_sector:cod_sector, suc: getSuc(), usuario: getNick()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
           
            $("#msg_articulos").html(""); 
            var codigo = data[0].codigo;
            $("#form_codigo").val(codigo);
            $("#msg_codigo").html("Codigo Probable");
                          
        },
        error: function (e) {                 
            $("#msg_articulos").html("Error al generar codigo:  " + e);   
            errorMsg("Error al generar codigo:  " + e, 10000);
        }
    }); 
}

function centerForm(){
   var w = $(document).width();
   var h = $(document).height();
   $(".form").width(w);
   $(".form").height(h);   
   $(".form").fadeIn();
   openForm = true; 
}

function addData(form){
   
   var data = {}; 
   
   var table = form.substring(4,60);     
   $("#"+form+" [id^='form_']").each(function(){
     
     var pk = $(this).hasClass("PRI");
     var column_name = $(this).attr("id").substring(5,60);
     var val = $(this).val(); 
     var req = $(this).attr("required");
      
     if(req === "required" && val === ""){
         $(this).addClass("required");     
     }else{
         $(this).removeClass("required");     
     }
     var index = checks.indexOf(column_name);
     if(index >= 0){  
         val = $(this).is(":checked");
     }
     data[column_name]=val;
     
  });  
  if(data["costo_prom"]===""){
      data["costo_prom"]="0";
  }
  
  if($(".required").length === 0 ){
    var master = {                  
          data:data         
    };
    $.ajax({
          type: "POST",
          url: "productos/Articulos.class.php",
          data: {action: "addData" , master: master,  usuario: getNick()},        
          async: true,
          dataType: "json",
          beforeSend: function () {
              $("#msg_articulos").addClass("error");
              $("#"+form+" input[id="+table+"_save_button]").prop("disabled",true);
              $("#msg_articulos").html("Insertando... <img src='img/loading_fast.gif'  >");
          },
          success: function (data) {   

              if(data.mensaje === "Ok"){ 
                  $("#msg_articulos").html(data.mensaje);
                  $("#"+form+" input[id="+table+"_close_button]").fadeIn();
                  $("#form_codigo").val(data.codigo);
                  alert("Se ha registrado el articulo con el codigo "+data.codigo+" se levantara la ventana para edicion de Propiedades y Usos");
                  editUI(data.codigo);
              }else{
                  $("#"+form+" input[id="+table+"_save_button]").prop("disabled",false);
                  $("#msg_articulos").html(data.mensaje+" Rellene los campos requeridos y vuelva a intentarlo si el problema persiste contacte con el Administrador del sistema.");
              }           
          },
          error: function (err) { 
            $("#msg_articulos").addClass("error");
            $("#"+form+" input[id="+table+"_save_button]").prop("disabled",false);
            $("#msg_articulos").html('Error al Registrar: Rellene los campos requeridos y vuelva a intentarlo.<a href="javascript:showTechnicalError()">Mas info</a>\n\
            <div class="technical_info">'+err.responseText+'</div>');         
          }
      });  
     }else{
      $("#msg_articulos").addClass("error");  
      $("#msg_articulos").html("Rellene los campos requeridos...");
    }
}

function addBarcode(){
    var codigo = $("#form_codigo").val();
    var barcode = $("#add_barcode").val();
    var cant = $(".barc_"+barcode).length;
    if(cant > 0){
        alert("Codigo de barras ya ha sido registrado con anterioridad");
        $(".barc_"+barcode).css("background","orange");
    }else{
        $.ajax({
            type: "POST",
            url: "productos/Articulos.class.php",
            data: {action: "addBarcode", codigo: codigo, barcode: barcode},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg_articulos").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                if (data.resultado > 0) {
                    $("#msg_articulos").html("Ok"); 
                    $("#add_barcode").val("");
                    getCodigoBarras();
                } else {
                    $("#msg_articulos").html("Error al registrar codigo puede que ya este registrado.");   
                }                
            },
            error: function (e) {                 
                $("#msg_articulos").html("Error al registrar codigo de barras  ");   
                errorMsg("Error al registrar codigo de barras  " + e, 10000);
            }
        });  
    }
}

function getCodigoBarras(){
    var codigo = $("#form_codigo").val();
    $.ajax({
        type: "POST",
        url: "productos/Articulos.class.php",
        data: {action: "getCodigoBarras", codigo:codigo},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            $(".barcode_line").remove();
            for(var i in data){
                var barc =   data[i].barcode ;    
                $("#artBarcodes").append("<tr class='barcode_line'><td class='item barcode_"+i+" barc_"+barc+"'>"+barc+"</td><td class='itemc'> <img style='cursor:pointer' src='img/trash_mini.png' width='16px' onclick=deleteBarcode("+i+")   ></td></tr>");
            }             
        },
        error: function (e) {                 
            $("#msg").html("Error al xxx cuenta:  " + e);   
            errorMsg("Error al xxx cuenta:  " + e, 10000);
        }
    });    
}

function deleteBarcode(i){
    var barcode = $(".barcode_"+i).html();
    var codigo = $("#form_codigo").val();
    $.ajax({
        type: "POST",
        url: "productos/Articulos.class.php",
        data: {action: "deleteBarcode", codigo:codigo,barcode:barcode},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
           getCodigoBarras();    
        },
        error: function (e) {                 
            $("#msg").html("Error al xxx cuenta:  " + e);   
            errorMsg("Error al xxx cuenta:  " + e, 10000);
        }
    }); 
}

function showTechnicalError(){
    $(".technical_info").fadeToggle();
}

function updateData(form){
  var update_data = {};
  var primary_keys = {};  
  var table = form.substring(5,60);   
  $("#"+form+" [id^='form_']").each(function(){
       
     var pk = $(this).hasClass("PRI");
     var column_name = $(this).attr("id").substring(5,60);
     var val = $(this).val();
     var req = $(this).attr("required");
      
     if(req === "required" && val === ""){
         $(this).addClass("required");     
     }else{
         $(this).removeClass("required");     
     }
     var index = checks.indexOf(column_name);
     if(index >= 0){  
         val = $(this).is(":checked");
     }
     
     if(pk){
         primary_keys[column_name]=val;
     }else{
         update_data[column_name]=val;
     } 
     
  });
  if($(".required").length == 0 ){
        var master ={                  
              primary_keys:primary_keys,
              update_data:update_data
        };
        $.ajax({
              type: "POST",
              url: "productos/Articulos.class.php",
              data: {action: "updateData" , master: master,  usuario: getNick()},        
              async: true,
              dataType: "json",
              beforeSend: function () {
                  $("#"+form+" input[id="+table+"_update_button]").prop("disabled",true);
                  $("#msg_articulos").html("Actualizando... <img src='img/loading_fast.gif'  >");
              },
              success: function (data) {                
                  if(data.mensaje === "Ok"){ 
                      $("#msg_articulos").html(data.mensaje);
                      $("#"+form+" input[id="+table+"_close_button]").fadeIn();
                  }else{
                      $("#"+form+" input[id="+table+"_update_button]").prop("disabled",false);
                      $("#msg_articulos").html(data.mensaje+' intente nuevamente si el problema persiste contacte con el Administrador del sistema.<a href="javascript:showTechnicalError()">Mas info</a><div class="technical_info">'+data.query+'</div>');
                  }           
              },
              error: function (err) { 
                $("#msg_articulos").addClass("error");
                $("#msg_articulos").html('Error al Registrar: Verifique los datos y vuelva a intentarlo.<a href="javascript:showTechnicalError()">Mas info</a>\n\
                <div class="technical_info">'+err.responseText+'</div>');         
              }
        }); 
  }else{
    $("#msg_articulos").addClass("error");  
    $("#msg_articulos").html("Rellene los campos requeridos...");
  }
}

function closeForm(){
    $(".form").html("");
    $(".form").fadeOut();
    openForm = false;
}