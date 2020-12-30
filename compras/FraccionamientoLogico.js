//var colores = [];

var id_pedido = "";
var codigo_actual = "";
var color_color_class = "";
var nro_nota_pedido = 0;
var actual_cod_cli = "";
var asignando = false;
var sucursales =  [];  
var prioridad_sucursales = ['02','01','06','24','25','05','04','10','30','00'];
var error_politica = 0;

var nros_de_pedido = new Array();

  
function configure(){    
    inicializarCursores("clicable");
    $(".clicable").click(function(){
        var id = $(this).parent().attr("id");
        cargarEntrada(id);
    });
     
    $("#lista_invoices").DataTable( {
        "language": {
            "lengthMenu": "Mostrando _MENU_ registros por pagina",
            "zeroRecords": "Ningun registro.",
            "info": "Mostrando _PAGE_ de _PAGES_ paginas",
            "infoEmpty": "No hay registros.",
            "infoFiltered": "(filtrado entre _MAX_ registros)",
            "sSearch":"Buscar", 
            "oPaginate": {
                "sFirst":    "Primero",
                "sLast":     "Último",
                "sNext":     "Siguiente",
                "sPrevious": "Anterior"
            } 
        },
        "order": [[ 0, "desc" ],[ 1, "asc" ]]
    } ); 
}
 

function cargarEntrada(id_ent){ 
    var usuario = getNick(); 
    var session = getCookie(usuario).sesion;  
    var sap_doc = $("#"+id_ent).attr("data-sap_doc");
    load("compras/FraccionamientoLogico.class.php",{usuario:usuario,session:session,id_ent:id_ent,sap_doc:sap_doc,accion:"cargar"},function(){
        cargarDetalleEntrada(id_ent); 
    }); 
}
function preseleccionar(id_ped,cliente_class,color_class,pedido){
    id_pedido = id_ped; 
    
    var sum = 0;
    var sum_ant = 0;
    var porc = pedido * 20 / 100;
    var rango_bajo = pedido - porc; 
    var rango_alto = pedido + porc;
 
    var array_lotes = new Array();
    
    $("#lotes ."+color_class).each(function(){
        var cant = parseFloat( $(this).next().text());
        var lote = parseFloat( $(this).prev().prev().text());
        
        if(sum <= pedido){  
            sum+=cant;            
            // Controlar si con la Nueva suma es > al pedido
            if(sum > pedido){ //console.log(2);
                // Controlar si la anterior esta mas dentro del rango que la actual
                var ab = pedido -  sum_ant;                
                var arr = sum - pedido;
                if (ab > arr) { // Me quedo con el de arriba xq la distancia es menor
                    array_lotes.push(lote);
                }else{
                   return false;  
                } 
                sum_ant+=cant;  
            }else{//console.log(3);
                // Agregar al array
                sum_ant+=cant;  
                array_lotes.push(lote);
            }  
        }else{
            sum_ant+=cant;  
            var ab = pedido -  sum_ant;                
            var arr = sum - pedido;
            if (ab > arr) { // Me quedo con el de arriba xq la distancia es menor
                array_lotes.push(lote);
            }else{
                return false;  
            } 
        }              
    });
    
    var cod_cli =  $("#id_ped_"+id_pedido).attr("data-cod_cli"); 
    var politica = parseInt($("#id_ped_"+id_pedido).attr("data-pol")); 
    if(politica == 0 &&  actual_cod_cli == "0") {
        alert("Error: Politica no definida para "+codigo_actual);
        return;
    }  
    
    var suc = $("#id_ped_"+id_pedido).find(".suc").text();
    
    array_lotes.forEach(function(lote) {        
        
        var t0 = new Array();
        var t1 = new Array();
        var destinos = new Array();
        
        $("#check_"+lote).prop("checked",true);  
        i++;
        if(cod_cli != "0"){
            var cant = $("#cant_"+lote).text(); 
            $("#pol_"+lote).val(cant);
            $("#dest_"+lote).val(suc);
            totalizar();
        }else{// Si es Minorista 0
            
            var rollo = parseFloat($("#cant_"+lote).text()); 
            // Aqui determinar cual es el mejor corte
            console.log("#Metraje del Rollo : "+rollo+"  Politica: "+politica);
             
            var sobrante = rollo;
            var hay_pieza = true;
            while(hay_pieza){
                                
                if(sobrante > 0 && sobrante < politica){
                  
                   t0.push(sobrante);                 
                   t1.push(sobrante);    
                   sobrante = sobrante - politica;                  
                   //console.log("Bif : 1");
                }else if(sobrante < 0){ 
                    //console.log("Bif : 2");
                   // Sacar del Ultimo y 
                   hay_pieza = false;
                }else{ // Sobrante > 0 y > politica
                   t0.push(politica);
                   t1.push(politica);
                   sobrante = sobrante - politica;
                   //console.log("Bif : 3");
                }
            } 
            var tam = t0.length;
            
            
            var vu = t0[tam-1];
            var vp = t0[tam-2];
            var div = (vu + vp) / 2;
            t1[tam-2]=div;
            t1[tam-1]=div;
            console.log("#Division: "+vp+"+"+vu+" = "+div);
            console.log("#["+t0+"]");
            console.log("#["+t1+"]");
             
            
            console.log("#Ultimo Valor: "+ vu + " Penultimo: "+vp);
            
            var desv1 = politica - vu;
            var desv2 = politica - (div); 
            
            console.log("#Desv1: "+ desv1 + "  Desv2: "+desv2);
            
            t0.forEach(function(x){
                destinos.push(suc);
            });
            
            if(desv1 < desv2){
                console.log("#Mejor Arreglo: "+t0);
                $("#pol_"+lote).val(t0);          
            }else{
                console.log("#Mejor Arreglo: "+t1);
                $("#pol_"+lote).val(t1);          
            }
            console.log("#Destinos: "+destinos);
            $("#dest_"+lote).val(destinos);  
            console.log("#---------------------------------------------------------------------------"); 
            
        }
        //$("#check_"+lote).parent().addClass("seleccionado");
    }); 
}

function asignarLotes(){
    asignando = true;
    var cod_cli = $("#id_ped_"+id_pedido).attr("data-cod_cli");
    if(cod_cli != undefined){
    var nro_pedido = $("#id_ped_"+id_pedido).attr("data-nro_pedido");
    var suc = $("#id_ped_"+id_pedido).find(".suc").text();
    var presentacion = $("#id_ped_"+id_pedido).find(".presentacion").text();// Ya no importa esta Regla es solo para Mayoristas
    var array_lotes = new Array();
    var array_destinos = new Array();
    var array_colores = new Array();
    var array_cortes = new Array();
    var array_ids = new Array();
    var nro_compra = $("#ref").val();
    
    var error_suc = false;
    
    $("[class^='check_']").each( function(){
       var id = $(this).attr("id").substring(6,30); 
       var lote = $("#lote_"+id).text(); 
       
       var cortes =  $("#pol_"+id).val();
       var destino =  $("#dest_"+id).val();
       var color =  $(".color_"+id).text();
       if(destino == ""){
           error_suc = true;
       }
       if ( $(this).is(":checked")) {
          array_lotes.push(lote); 
          array_destinos.push(destino); 
          array_colores.push(color);
          array_cortes.push(cortes);
          array_ids.push(id);
          $("#check_"+lote).parent().html("<img src='img/loading_fast.gif' width='14px' height='14px' >")
       } 

    }); 
    if(!error_suc){

        array_lotes = JSON.stringify(array_lotes);
        array_destinos = JSON.stringify(array_destinos);
        array_cortes = JSON.stringify(array_cortes);
        array_colores = JSON.stringify(array_colores);

        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "designarOrdenProcesamiento",codigo:codigo_actual,array_lotes:array_lotes,array_cortes:array_cortes,array_colores:array_colores,usuario:getNick(),cod_cli:cod_cli,sucs:array_destinos,presentacion:presentacion,nro_compra:nro_compra,nro_pedido:nro_pedido },
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                for (var i in data) { 
                    //var lote = data[i];           
                    var id_l = array_ids[i];
                    $("#lote_"+id_l).parent().remove();
                }   
                $("#msg").html(""); 
                getLotesAsignadosACliente(cod_cli); console.log("cod_cli  "+cod_cli);
                getSumaAsignadaAClienteXColor("id_ped_"+id_pedido);  
            }
        });
    
    
    }else{
        errorMsg("Destinos incorrectos..",6000);
    }
    }else{
        errorMsg("Debe seleccionar un cliente",6000);
    }
    asignando = false; 
}
function editar(codigo,nro_pedido){
   codigo_actual = codigo;   
   nro_nota_pedido = nro_pedido;
   var sap_doc = $("#sap_doc").val();
   var nro_compra = $("#ref").val(); 
   
   var codigo_primer_cliente = "0";
   
   $(".botones_asign").attr("disabled",true);
   
   $(".codigo_descrip_selected").removeClass("codigo_descrip_selected");
   $("#"+codigo).parent().find("label").addClass("codigo_descrip_selected");
   var pedidos = JSON.stringify(nros_de_pedido);  
   $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getPedidosDeCompraXCodigo", nros_de_pedido: pedidos,codigo:codigo,nro_compra:nro_compra},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $(".fila_pedido").remove();
            $("#pedidos").append("<tr class='fila_pedido' colspan='4'><td>Cargando peidos. <img src='img/loading_fast.gif' width='16px' height='16px' ></td></tr>");              
        },
        success: function (data) {  
            $(".fila_pedido").remove();  //cod_cli,cliente,color,SUM(cantidad_pond) AS CantPedPond,Presentacion
            var cont_minorista = 0;
            for (var i in data) { 
                var nro_pedido = data[i].nro_pedido;   
                var id_ped = data[i].id_det;       
                var cod_cli = data[i].cod_cli;               
                var cliente = data[i].cliente;               
                var CantPedPond = parseFloat(data[i].CantPedPond).format(2,3,",",".");               
                var Color = data[i].Color;
                var color_class = hashCode(Color);
                var cliente_class = hashCode(cliente);
                var suc = data[i].suc;    
                var Presentacion = data[i].Presentacion;    
                var Politica = data[i].Politica;  
                var CantPedPondUnf = parseFloat(data[i].CantPedPond); 
                $("#pedidos").append("<tr id='id_ped_"+id_ped+"' class='fila_pedido' data-nro_pedido='"+nro_pedido+"' data-color='"+color_class+"' data-cod_cli='"+cod_cli+"' data-cli_class='"+cliente_class+"' data-pol='"+Politica+"'>\n\
                <td class='item "+cod_cli+"'>"+cliente+"</td><td class='itemc suc'>"+suc+"</td><td class='"+color_class+" item color'>"+Color+"</td><td class='num cant_pond'>"+CantPedPond+"</td><td class='asign num'>-</td><td class='itemc presentacion'>"+Presentacion+"</td><td class='itemc asignar'><img src='img/find.png' width='16px' heigth='16px' onclick=preseleccionar("+id_ped+","+cliente_class+","+color_class+","+CantPedPondUnf+") ></td></tr>"); 
                if(i == 0){
                    codigo_primer_cliente = cod_cli;
                }
                setTimeout( 'getSumaAsignadaAClienteXColor("id_ped_'+id_ped+'")'  ,1000);
                $(".botones_asign").removeAttr("disabled");
                if(cod_cli == "0" && suc == "00"){
                    cont_minorista++;
                } 
            }
            if(cont_minorista > 0){
                $("#add_minorista_button").prop("disabled",true);
            }else{
                 $("#add_minorista_button").removeAttr("disabled");
            } 
            $("#pedidos tr td").not(":last-child").click(function(){                   
                $(".concid").removeClass("concid");
                var color_class = $(this).parent().attr("data-color");  
                $("."+color_class).addClass("concid"); 
  
                $(".seleccionado").removeClass("seleccionado");
                $(this).parent().children('td:not(.concid)').not(":last-child").addClass("seleccionado"); 
                var cod_cli = $(this).parent().attr("data-cod_cli");  
                actual_cod_cli = cod_cli;
                if(actual_cod_cli == "0" && $(".selected_color").length > 0){
                   $("#asig_sist").removeAttr("disabled");                     
                }else{
                    $("#asig_sist").prop("disabled",true);     
                }
                color_color_class =  $(this).parent().find(".color").attr("class").split(" ")[0];// La primera es la clase algo asi 1331400269 corresponde al hash del color
                id_pedido =  $(this).parent().attr("id").substring(7,40);
                getLotesAsignadosACliente(cod_cli);
                
                if($("#lotes").hasClass("."+color_color_class)){
                    var pos = $("#lotes ."+color_color_class).position().top;
                    var lc = $("#lotes_container").offset().top;
                    var resta = parseInt(   pos - lc - 100 ) ;                 
                    $("#lotes_container").animate({scrollTop: resta }, 250);
                }
                 
                 
            }); 
            getLotesAsignadosACliente(codigo_primer_cliente);
        }
    });
    
   $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getLotesEntradaMercaderias", sap_doc: sap_doc,codigo:codigo,nro_compra:nro_compra},                   
        async: true,
        dataType: "json",
        beforeSend: function () {
            $(".fila_lote").remove();
            $("#lotes").append("<tr class='fila_lote'><td  colspan='5'>Cargando lotes. <img src='img/loading_fast.gif' width='16px' height='16px' ></td></tr>");            
        },
        success: function (data) {               
            $(".fila_lote").remove();             
            if(data.length>0){
                for (var i in data) {  
                    var Lote = data[i].Lote; 
                    var codigo = data[i].codigo;    
                    var Suc = data[i].Suc;               
                    var Stock = parseFloat(data[i].Stock).format(2,10,",","."); 
                    var aux = parseFloat(data[i].Stock).format(0,10,",",".");
           
                    if(eval(Stock) == eval(aux)){                         
                        Stock = aux;
                    }
                    var Color = (data[i].Color).replace("'","");  
                    var ColorOnly = $.trim(Color.substring(0, Color.indexOf("|")));
                    var color_class = hashCode(ColorOnly);
                    var Politica = 0;
                    if(data[i].Politica!= undefined ){ 
                        data[i].Politica 
                    }else{
                        Politica = Stock;
                    }                 
                    $("#lotes").append("<tr class='fila_lote' data-art='"+codigo+"' data-pol='"+Politica+"'><td class='item lote_e' id='lote_"+i+"' style='cursor:pointer'>"+Lote+"</td><td class='itemc'>"+Suc+"</td><td style='cursor:pointer' data-lote='"+Lote+"' data-index='"+i+"' onclick=selectColor('"+color_class+"') class='color_"+i+" "+color_class+" item seleccionable_color' >"+Color+"</td><td class='itemc' id='cant_"+i+"'>"+Stock+"</td> \n\
                    <td><input id='pol_"+i+"' class='politica' type='text' size='14' value='"+Politica+"' onchange='controlarPolitica("+i+")' ><input id='dest_"+i+"' class='sucursales' type='text' size='14' value='00' onchange='controlarPolitica("+i+")' >  </td>  \n\
                    <td class='itemc'><input type='checkbox' id='check_"+i+"' class='check_"+color_class+"' onclick='checkMinorista("+i+")' ></td></tr>"); //
                }
                $(".lote_e").click(function(){
                    $(this).parent().find(".seleccionable_color").addClass("selected_color");
                    $("#asig_sist").removeAttr("disabled");
                });
            }else{
               $(".fila_lote").remove();
               $("#lotes").append("<tr class='fila_lote'><td colspan='5'>Ya no quedan lotes por asignar.</td></tr>");   
            }
        }
    }); 
    error_politica = 0;
     
    $(".suc_pol").each(function(){
        var suc = $(this).text();    
        buscarPoliticaCodigoXSuc(codigo_actual,suc);         
    });
    
}
function selectColor(color_hash){
    if($("#lotes ."+color_hash).hasClass("selected_color")){
       $("#lotes .selected_color").removeClass("selected_color");
       $("#asig_sist").prop("disabled",true);
    }else{
       $("#lotes .selected_color").removeClass("selected_color");
       $("#lotes ."+color_hash).addClass("selected_color"); 
       $("#asig_sist").removeAttr("disabled");
    }     
}
function getSumaAsignadaAClienteXColor(id){
    var fila = $("#"+id); 
    var cant_pond = parseFloat(fila.find(".cant_pond").text());  
    var porc = Math.round((cant_pond * 20) / 100);
    
    var rango_alto = cant_pond + porc;
    var rango_bajo = cant_pond - porc;
    
    
    var cod_cli = fila.attr("data-cod_cli");  
    var suc = fila.find(".suc").text();  
    var nro_compra = $("#ref").val();
    var color = fila.find(".color").text();  
    var presentacion = fila.find(".presentacion").text(); 

     $.ajax({
         type: "POST",
         url: "Ajax.class.php",
         data: {"action": "getSumaAsignadaAClienteXColor", cod_cli: cod_cli,codigo:codigo_actual,nro_compra:nro_compra,color:color,suc:suc,presentacion:presentacion},
         async: true,
         dataType: "json",
         beforeSend: function () {
             fila.find(".asign").html("<img src='img/loading_fast.gif' width='14px' height='14px' >"); 
         },
         success: function (data) {  
             var asign = data[0].Asign;
             if(asign == null){
                 asign = 0;
             }
             fila.find(".asign").html(asign); 
             if(cant_pond == asign ){
                 fila.find(".asign").removeClass("inrange outrange").addClass("correct");
             }else if(asign >=rango_bajo && asign <= rango_alto){
                 fila.find(".asign").removeClass("correct outrange").addClass("inrange");
             }else{
                 fila.find(".asign").removeClass("correct inrange").addClass("outrange");
             }
         }
     });  
}
function autoAsignar(){
    
    var array = new Array();    
    // Encolar 
    $(".fila_pedido").each(function(){
        var id = $(this).attr("id");
        array.push(id); 
    });    
   setTimeoutAgain(array,0);
}

function setTimeoutAgain(array,index){
    if(asignando){ // Esperar unos instantes hasta que termine
         var t = setTimeout(function() { setTimeoutAgain(array,index ); },500);
    }else{
        if(index < array.length){
            var id = array[index];
            if(id !== undefined){
                $("#"+id).find(".asignar").prev().trigger( "click");
                $("#"+id).find(".asignar img").trigger( "click"); 

                setTimeout(asignarLotes(),500); 

                var t = setTimeout(function() {
                     setTimeoutAgain(array,index + 1);
                },1500);
            }
        }else{
          $("#"+codigo_actual).trigger( "click");   
        }
    }    
} 
function getLotesAsignadosACliente(cod_cli){
    var nro_compra = $("#ref").val(); 
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getLotesAsignadosACliente", nro_compra: nro_compra,cod_cli:cod_cli,codigo:codigo_actual},                   
        async: true,
        dataType: "json",  
        beforeSend: function () {
            $(".fila_lote_cliente").remove();
            $("#lote_cli").append("<tr class='fila_lote_cliente'  ><td colspan='6'>Cargando lotes asignados. <img src='img/loading_fast.gif' width='16px' height='16px' ></td></tr>");            
        },
        success: function (data) {  
            $(".fila_lote_cliente").remove();
            var old_color = "";
            var total_cantidad = 0;
            for (var i in data) {  
                var id_orden = data[i].id_orden;     
                //var cod_cli = data[i].cod_cli;  
                var Lote = data[i].lote;               
                var Suc = data[i].suc;        
                var color = data[i].color;          
                var cantidad = parseFloat(data[i].cantidad).format(2,3,",",".");     
                var color_class = hashCode(color);
                var presentacion = data[i].presentacion;                                             
                $("#"+Lote).parent().remove();
                var concid = "";
                
                if(color_class == color_color_class){
                    concid = " concid";
                }
                
                if(old_color != color && old_color != ""){
                    $("#lotes_cli").append("<tr class='fila_lote_cliente' > <td colspan='2' > </td> <td class='itemc' style='font-weight:bolder'>"+total_cantidad+"</td><td colspan='2' > </td> </tr>"); 
                    total_cantidad = 0;
                }
                total_cantidad = total_cantidad + parseFloat(data[i].cantidad);
                $("#lotes_cli").append("<tr class='fila_lote_cliente' data-id_orden='"+id_orden+"' ><td class='item'>"+Lote+"</td><td class='item "+color_class+" "+concid+"'>"+color+"</td><td class='itemc'>"+cantidad+"</td><td class='itemc' >"+presentacion+"</td><td class='itemc' id='op_"+id_orden+"' data-suc='"+Suc+"' onclick='cambiarSucursal("+id_orden+")' >"+Suc+"</td><td class='itemc'><input type='checkbox' class='asigned_"+Lote+"' ></td></tr>"); 
                old_color = color;
            }   
            $("#lotes_cli").append("<tr class='fila_lote_cliente' > <td colspan='2' > </td> <td class='itemc' style='font-weight:bolder'>"+total_cantidad+"</td><td colspan='2' > </td> </tr>"); 
             
        }
    }); 
}
function cargarDetalleEntrada(id_ent){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getArticulosEntradaMercaderias", id_ent: id_ent},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#articulos").html("Cargando articulos. <img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {  
             $("#articulos").html("");  
            for (var i in data) {  
                var nro_pedido = data[i].nro_pedido;  
                nro_nota_pedido = nro_pedido; // Siempre es la misma no puede ser mas de una
                if(nros_de_pedido.indexOf(nro_pedido) < 0 ){
                   nros_de_pedido.push(nro_pedido);
                }
                var codigo = data[i].codigo;               
                var descrip = data[i].descrip;  
                if($(".cod_"+codigo).length < 1){
                   $("#articulos").append("<div class='col_art' > <input type='radio' id='"+codigo+"' class='codigo_descrip cod_"+codigo+"' name='radio_art' onclick=editar('"+codigo+"',"+nro_pedido+")><label class='codigo_descrip' onclick=editar('"+codigo+"',"+nro_pedido+") for='"+codigo+"'>"+codigo+" - "+descrip+" </label></div>"); 
                }
            }   
            $("#msg").html("");  
        }
    });  
    
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
    
    $(".rezizable").resizable();
    
}
function checkAll(){
    var checked = $("#checkall").is(":checked");
    if(actual_cod_cli !== ""){
        if(checked){
            $("input[id^='check_']").each(function(){
                $(this).trigger("click");
            });
        }else{
            $("input[id^='check_']").each(function(){
                $(this).removeAttr("checked"); 
            });
        }
    }else{
        errorMsg("Seleccione un cliente para asignar los lotes...",12000);
    }
    totalizar();
}
function checkAllAsigned(){
    var checked = $("#checkall_asigned").is(":checked");
    if(checked){
        $("input[class^='asigned_']").each(function(){
            $(this).prop("checked",true); 
        });
    }else{
        $("input[class^='asigned_']").each(function(){
            $(this).removeAttr("checked"); 
        });
    }
}
function hashCode(str){
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function borrarLotesAsignados(){
    var ref = $("#ref").val(); 
    $("input[class^='asigned_']").each(function(){
        if( $(this).is(":checked")){  
            
           var lote = $(this).attr('class').substring(8,30);
               console.log(lote);  
            
            var suc = $(this).parent().prev().text();
            
            $.ajax({
                type: "POST",
                url: "Ajax.class.php",
                data: {"action": "borrarLotesAsignados",ref:ref,codigo:codigo_actual,lote:lote,suc:suc},
                async: true,
                dataType: "html",
                beforeSend: function () {
                    $(".asigned_"+lote).parent().append("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
                },
                complete: function (objeto, exito) {
                    if (exito == "success") {                          
                        var result = $.trim(objeto.responseText);  
                        if(result == "Ok"){                            
                           $(".asigned_"+lote).parent().parent().remove();
                        }else{
                            $(".asigned_"+lote).parent().html("<img src='img/error.png' width='16px' height='16px' >"); 
                        }                        
                    }
                },
                error: function () {
                    $(".asigned_"+lote).parent().html("<img src='img/error.png' width='16px' height='16px' >"); 
                }
            }); 
           
        } 
    });
    
} 
function addPedidoMinorista(suc){
    var pedidos = JSON.stringify(nros_de_pedido);
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "addPedidoMinoristaProduccion", "usuario": getNick(),codigo:codigo_actual,nros_pedido:pedidos,suc:suc},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);
                if(result == "Ok"){
                    $("#msg").html("Ok pedido agregado");
                    editar(codigo_actual,nro_nota_pedido); 
                }else{
                    $("#msg").html("");
                    errorMsg("Ya existe un pedido para Produccion para este Articulo",14000);
                }
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}
function asignacionAsistida(){
   if( actual_cod_cli == ""){
       errorMsg("Debe seleccionar un cliente para calcular las asignaciones...",10000);
       return;
   }
   if(error_politica > 0){
      errorMsg("Una o mas sucursales no tiene definida pilitica de corte para este Articulo",10000);
      $("#asig_sist").attr("disabled",true);
      return; 
   }
   var x = 0;
   var hay_suc = true;
   var tamano = prioridad_sucursales.length-1;
   
   $(".selected_color").each(function(){
        var lote = $(this).attr("data-lote");        
        var rollo = parseInt($("#cant_"+lote).text());
        var index = $(this).attr("data-index");
        console.log("Cant: "+rollo);
        
        var t0 = new Array();
        var t1 = new Array();
        var destinos = new Array();
        var sobrante = rollo;
        
        for(var i = x;i < tamano;i++){
            var suc = prioridad_sucursales[i];
            var politica = parseInt( $(".polit_"+suc).first().text() );
             
            console.log("__________"+politica);
                 
            if(sobrante > 0 && sobrante < politica){

               t0.push(sobrante);                 
               t1.push(sobrante);  
               destinos.push(suc);
               sobrante = sobrante - politica;  x++;
               //console.log("Bif : 1");
            }else if(sobrante <= 0){ 
                //console.log("Bif : 2");
               // Sacar del Ultimo y 
               break;                
            }else{ // Sobrante > 0 y > politica
               t0.push(politica);
               t1.push(politica);
               destinos.push(suc);
               sobrante = sobrante - politica;  x++;
               //console.log("Bif : 3");
            }
            
        }
        var t =  prioridad_sucursales.length;
        console.log("x  tam "+t);
        if(sobrante > 0){
           t0.push(sobrante);
           t1.push(sobrante);
           destinos.push('00');
        }
        
        var tam = t0.length;
                        
        var vu = t0[tam-1];
        var vp = t0[tam-2];
        var div = redondear((vu + vp) / 2) ;
        t1[tam-2]=div;
        t1[tam-1]=div;
        //console.log("#Division: "+vp+"+"+vu+" = "+div);
        //console.log("#["+t0+"]");
        //console.log("#["+t1+"]");

        //console.log("#Ultimo Valor: "+ vu + " Penultimo: "+vp);

        var desv1 = politica - vu;
        var desv2 = politica - (div); 

        //console.log("#Desv1: "+ desv1 + "  Desv2: "+desv2);

        if(desv1 < desv2){
            //console.log("#Mejor Arreglo: "+t0);
            $("#pol_"+index).val(t0);              
        }else{
            //console.log("#Mejor Arreglo: "+t1);
            $("#pol_"+index).val(t1);          
        }
        $("#dest_"+index).val(destinos);     
        //$("#check_"+lote).prop("checked",true);
        controlarPolitica(lote);
        if(x == tamano){             
            hay_suc = false;
            return hay_suc;
            //x = 0;
        }
        
   });
    
   
}
function checkMinorista(i){
     
        var politica = parseInt($("#id_ped_"+id_pedido).attr("data-pol"));   
        var suc =  $("#id_ped_"+id_pedido).find(".suc").text();
        if(politica == 0){             
            errorMsg("Error: Politica no definida para "+codigo_actual,12000);
            return;
        }
        
        var t0 = new Array();
        var t1 = new Array();
        var destinos = new Array();
        
        var presentacion = $("#id_ped_"+id_pedido).find(".presentacion").text();
         
        //i++;
        if(actual_cod_cli != "0" || presentacion == "Rollo"){
            var cant = $("#cant_"+i).text(); 
            $("#pol_"+i).val(cant);
            $("#dest_"+i).val(suc);
            totalizar();
            return true;
        }else{// Si es Minorista 0
            
            var rollo = parseFloat($("#cant_"+i).text()); 
            // Aqui determinar cual es el mejor corte
            console.log("#Metraje del Rollo : "+rollo+"  Politica: "+politica);
             
            var sobrante = rollo;
            if(rollo > politica){
            var hay_pieza = true;
            while(hay_pieza){
                                
                if(sobrante > 0 && sobrante < politica){
                  
                   t0.push(sobrante);                 
                   t1.push(sobrante);    
                   sobrante = sobrante - politica;
                   //console.log("Bif : 1");
                }else if(sobrante <= 0){ 
                    //console.log("Bif : 2");
                   // Sacar del Ultimo y 
                   hay_pieza = false;
                }else{ // Sobrante > 0 y > politica
                   t0.push(politica);
                   t1.push(politica);
                   sobrante = sobrante - politica;
                   //console.log("Bif : 3");
                }
            } 
            var tam = t0.length;
            
            
            var vu = t0[tam-1];
            var vp = t0[tam-2];
            var div = redondear((vu + vp) / 2) ;
            t1[tam-2]=div;
            t1[tam-1]=div;
            console.log("#Division: "+vp+"+"+vu+" = "+div);
            console.log("#["+t0+"]");
            console.log("#["+t1+"]");
             
            
            console.log("#Ultimo Valor: "+ vu + " Penultimo: "+vp);
            
            var desv1 = politica - vu;
            var desv2 = politica - (div); 
            
            console.log("#Desv1: "+ desv1 + "  Desv2: "+desv2);
            
            if(desv1 < desv2){
                console.log("#Mejor Arreglo: "+t0);
                $("#pol_"+i).val(t0);          
            }else{
                console.log("#Mejor Arreglo: "+t1);
                $("#pol_"+i).val(t1);          
            }
            }else{
               $("#pol_"+i).val(rollo);
            }
            
            t0.forEach(function(x){
                destinos.push(suc);
            });
            
            $("#dest_"+i).val(destinos);  
            console.log("#---------------------------------------------------------------------------"); 
            totalizar();
        } 
        console.log(" i - "+i); 
        controlarPolitica(i);
}
function totalizar(){
    var sum = 0;
    $("[class^='check_']").each( function(){
       var lote = $(this).attr("id").substring(6,30); 
         if ( $(this).is(":checked")) {
             var cortes =  $("#pol_"+lote).val().split(",");
             cortes.forEach(function(corte){
                sum+=parseFloat(corte); 
             });
         }
    });
     sum = sum * 100 / 100; 
    $("#total").val(redondear(sum));     
}
function controlarPolitica(i){
     
    var cant = parseFloat($("#pol_"+i).parent().prev().text());
    var cortes = $("#pol_"+i).val().split(",");
    var destinos = $("#dest_"+i).val().split(",");
    var cant_rollo =  parseFloat($("#cant_"+i).text());
     
    
    var sum = 0;
    cortes.forEach(function(corte){
       sum+=parseFloat(corte); 
    });
    sum = parseFloat( sum.toFixed(2)); 
    if(sum !== cant){
        $("#pol_"+i).parent().addClass("input_err");
        $("#pol_"+i).parent().next().find("input").removeAttr("checked");
    }else if(cortes.length !== destinos.length){
        $("#pol_"+i).parent().addClass("input_err");
        $("#pol_"+i).parent().next().find("input").removeAttr("checked");
        errorMsg("La cantidad de destinos debe coincidir con la cantidad de cortes",12000);
    }else{            
        $("#pol_"+i).parent().removeClass("input_err");
        $("#pol_"+i).parent().next().find("input").prop("checked",true);
    }
    var faltante = parseFloat( cant_rollo - sum);
    console.log("Cant: "+cant+" Cant Rollo: "+ cant_rollo+"  Suma:"+sum+" Faltante: "+faltante);
    $("#faltante").val(redondear(faltante));     
    $("#unit").val(redondear(sum));     
    totalizar();
}
function moverASuc(id_orden){
    /*var c = confirm("Confirme que desea mover esta asignacion a otra sucursal");    
    if(c){ */
        var suc = $(".select_"+id_orden).val();   
        
        $.post( "Ajax.class.php",{ action: "cambiarSucursalAsignacion",id_orden:id_orden,suc:suc}, function( data ) {           
            $("#op_"+id_orden).html(suc);
        });
        
    //}
}

function cambiarSucursal(id_orden){
   var select = "<select class='select_"+id_orden+"' onchange='moverASuc("+id_orden+")' onblur='moverASuc("+id_orden+")' style='width:99%'>";
   var default_suc = $("#op_"+id_orden).attr("data-suc");
   
   select+="<option value='"+default_suc+"' >"+default_suc+"</option>";
   sucursales.forEach(function(suc){
      select+="<option value='"+suc+"'>"+suc+"</option>"; 
   });
   select+="</select>"; 
   $("#op_"+id_orden).html(select);
}
function buscarPoliticaCodigoXSuc(codigo,suc){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "buscarPoliticaCodigoXSuc", "codigo": codigo, "suc": suc},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $(".polit_"+suc).html("<img src='img/loading_fast.gif' width='14px' height='14px' >");   
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);
                if(result == 0){
                   $(".polit_"+suc).html("<img src='img/important.png' width='12px' height='12px' >");   
                   error_politica++;
                }else{
                   $(".polit_"+suc).html(result);                    
                }
            }
        },
        error: function () {
            $(".polit_"+suc).html("<img src='img/close.png' width='14px' height='14px' >");
        }
    }); 
}