/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function configurar(){
   $( "#desde" ).datepicker({ dateFormat: 'dd-mm-yy' }); 
   $( "#hasta" ).datepicker({ dateFormat: 'dd-mm-yy' });   
}

function buscarPedidos(){
    var desde = validDate(  $("#desde").val() ).fecha;
    var hasta = validDate(  $("#hasta").val() ).fecha;
     
    var check = $("#usuarios").is(":checked");
    var usuario = getNick();
    if(check){
        usuario = '%';
    } 
    
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getDetalleNotasPedidoNacionalCompras", "desde": desde,"hasta": hasta, "suc": getSuc(),estado:'%',usuario:usuario},
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg").html("<img src='img/loading_fast.gif' width='18px' height='18px' >"); 
        },
        success: function(data) {  
            $(".fila_pedido").remove(); 
            $(".fila_total_pedido").remove(); 
            var estado = $("#estado").val();
            
            var j = 0;
            var old_descrip = '*';
            var old_color = '*';
            var old_hash = '';
            var zebra = 1;
            
            var filas = "";
            var suma = 0;
            
            for(var i in data){  
                j++;
                var id = data[i].id;  
                var nro =  data[i].n_nro ; 
                var pobs = data[i].pobs;
                var suc =  data[i].suc ; 
                var usuario =  data[i].usuario ; 
                var codigo =  data[i].codigo  ;
                var lote =  data[i].lote;
                var descrip = data[i].descrip;
                var color = data[i].color;
                var um = data[i].um_prod;
                var cantidad = parseFloat(data[i].cantidad);
                var precio_venta = parseFloat(data[i].precio_venta).format(0,3,".",","); 
                var obs = data[i].obs;
                var mayorista = data[i].mayorista;               
                var estado = data[i].estado;
                var urge = data[i].urge;
                var hash = data[i].hash;
                var fecha = data[i].fecha;
                var clase =  estado.replace(/\s/g, '_').toLowerCase();
                var urgente = '';
                var may_class = '';
                if(urge == "Si"){
                    urgente = 'urge';
                }
                if(mayorista == "Si"){
                    may_class = 'despachado';
                }
                if( (color != old_color && old_color != '*') || (descrip != old_descrip && old_descrip  != '*' )     ){ // Cambio el Color
                     
                    if(zebra == 0){
                        zebra = 1;
                    }else{
                        zebra = 0;
                    }                    
                    suma = 0;
                }
                suma = suma + cantidad;
                filas+="<tr class='fila_pedido fila_"+i+" zebra"+zebra+" "+hash+"' data-hash='"+hash+"' title='Haga Click para seleccionar' id='tr_"+id+"' data-nro="+nro+">\n\
                <td class='item noedit'>"+nro+"</td>\n\
                <td class='item noedit'>"+pobs+"</td>\n\
                <td class='item noedit' >"+usuario+"</td>\n\
                <td class='item noedit' >"+suc+"</td>\n\
                <td class='item noedit' >"+fecha+"</td>\n\
                <td class='item codigo' ><a title='' class='codigo_"+id+"' style='color:black' data-codigo="+codigo+" href='#' >"+codigo+"</a></td>\n\
                <td class='item noedit'>"+lote+" </td>\n\
                <td class='item noedit'>"+descrip+" </td>\n\
                <td class='item noedit'>"+color+" </td>\n\
                <td class='num noedit'>"+cantidad+" </td>\n\\n\
                <td class='itemc noedit'>"+um+" </td>\n\
                <td class='num noedit'>"+precio_venta+" </td>\n\
                <td class='itemc noedit "+may_class+"'>"+mayorista+" </td>\n\
                <td class='itemc noedit "+urgente+"'>"+urge+" </td>\n\
                <td class='itemc noedit'>"+obs+" </td>\n\
                <td class='itemc noedit "+clase+"' ><a id='estado_"+id+"' title='' style='text-decoration:none' clase='"+clase+"'    href='#' >"+estado+"</a></td>";     
                old_color = color;
                old_descrip = descrip;
                old_hash = hash;
           }
          
           
           $("#nacionales").append(filas);
           /* $(".fila_pedido").click(function(){
               var h = $(this).attr("data-hash"); 
               if($(this).hasClass("selected")){                  
                   $("."+h).removeClass("selected");
                   $(".check_"+h).prop("checked",false);
                   $(".check_"+h).removeClass("selected_check");
               }else{                
                   $("."+h).addClass("selected");
                   $(".check_"+h).prop("checked",true);
                   $(".check_"+h).addClass("selected_check");
               }
           }); */
           getHistorialTracking();          
           $("#msg").html("");
        }    
    });
}
function setAnchorTitle(){
    $('a[title!=""]').each(function() { 
        var a = $(this); 
        a.hover(
            function() {
                showAnchorTitle(a, a.data('title'));
            },
            function() {
                hideAnchorTitle();
            }
        ).data('title', a.attr('title')).removeAttr('title');
    }); 
     
}
function showAnchorTitle(element, text) { 
    var offset = element.offset(); 
    var izq = offset.left -300;
    $('#anchorTitle').css({
        'top'  : (offset.top + element.outerHeight() + 4) + 'px',
        'left' : izq + 'px'
    }).html(text).show(); 
} 
function hideAnchorTitle() {
    $('#anchorTitle').hide();
}
function getHistorialTracking(){
    $("a[class^='codigo_']").each(function() {         
        var title = $(this).attr("title");
         
        if(title == ""){
            var id = $(this).parent().parent().attr("id").substring(3,20);    
            $.ajax({
                type: "POST",
                url: "Ajax.class.php",
                data: {"action": "getHistorialTracking", id: id},
                async: false,
                dataType: "html",
                beforeSend: function() {
                    $(".codigo_"+id).attr('title',"<img src='img/loading.gif' width='22px' height='22px' >");   
                    $("#estado_"+id).attr('title',"<img src='img/loading.gif' width='22px' height='22px' >");   
                },
                complete: function(objeto, exito) {
                    if (exito == "success") {                          
                        var result = $.trim(objeto.responseText);
                        $("#estado_"+id).attr('title',result);      
                        $(".codigo_"+id).attr('title',result); 
                        setAnchorTitle();
                    }
                },
                error: function() {
                    $(".codigo_"+id).attr("Ocurrio un error en la comunicacion con el Servidor al obtener historial de precios");
                    $("#estado_"+id).attr("Ocurrio un error en la comunicacion con el Servidor al obtener historial de precios");
                }
            });     
        }        
    }); 
     
}