
var fallas = [];
var max_mts_fallas = 0;
var myUnits = 'Mts';

function configurar(){
   $("#lote").focus();    
   $("#lote").change(function(){
        buscarDatos();
   }); 
   
   $(".cm_mts").click(function(){
      var v = $(this).val();
      if(v == "CM"){
          $(this).val("Mts");
      }else{
          $(this).val("CM");
      }
      $(".falla").trigger("change");
   });
   

    $(".falla").change(function(){
        var stock = parseFloat($("#stock").val().replace(",","."));

        var id = $(this).attr("id").substring(3,20);
        var falla = $(this).val();
        var vb = $(".cm_"+id).val();
        if(vb == "CM"){
            var porc = redondear((falla / 100) * 100 / stock);
            $("#"+id).val(porc);
        }else{    
            var porc =  redondear((falla * 100) / stock);
            $("#"+id).val(porc);
        } 
         
    });
    
    $(".calc").change(function(){
        var stock = parseFloat($("#stock").val().replace(",","."));
        var tara = parseFloat($("#tara").val());
        var ancho_m = parseFloat($("#ancho_m").val());
        var kg  = parseFloat($("#kg_real").val());
        
        var gramaje = parseFloat((( kg -(tara/1000)) * 1000) / (stock * ancho_m)).format(2, 20, '', '.')   ;
        $("#gramaje_calc").val(gramaje);           
    });
    $("#estado_venta").change(function(){
        $(this).removeAttr("class")
        var clase = $("#estado_venta option:selected").attr("class"); 
        $(this).addClass(clase)
    });
    // slider
    
    var myRange = document.querySelector('#regla');
    var myValue = document.querySelector('#valor_regla');
    
    //var off = myRange.offsetWidth / (parseInt(myRange.max) - parseInt(myRange.min));
    //var px =  ((myRange.valueAsNumber - parseInt(myRange.min)) * off) - (myValue.offsetParent.offsetWidth / 2);

    //myValue.parentElement.style.left = px + 'px';
    //myValue.parentElement.style.top = myRange.offsetHeight + 'px';
    myValue.innerHTML = myRange.value + ' ' + myUnits;

    myRange.oninput =function(){
    //var px = ((myRange.valueAsNumber - parseInt(myRange.min)) * off) - (myValue.offsetWidth / 2);
    myValue.innerHTML = myRange.value + ' ' + myUnits;
    //myValue.parentElement.style.left = px + 'px';
   };
   
}

function verFallas(){
    if(!$(".grafico_fallas").is(":visible")){
        var stock = parseFloat($("#stock").val().replace(",","."));
        $("#max_mts").html(stock);
        $("#regla").prop("max",stock);
    }
    $(".grafico_fallas").fadeToggle();
    $("#area_agregar_fallas").fadeToggle();
    
}

function guardarDatosLote(){
   var codigo = $("#codigo").val();
   var lote = $("#lote").val();
   var descrip = $("#descrip").val();
   
   var tara = $("#tara").val();
   var estado_venta = $("#estado_venta").val();
   
   var kg = $("#kg_real").val();
   
   var ancho  = parseFloat($("#ancho").val().replace(",",".")); 
   var ancho_m = $("#ancho_m").val(); 
   var gramaje =  parseFloat($("#gramaje").val().replace(",",".")); 
   var gramaje_calc = $("#gramaje_calc").val(); 
   var obs = $("#obs").val();
   
   if(ancho == ancho_m){
     ancho_m = "";     
   }
   if(gramaje == gramaje_calc){
       gramaje_calc = "";
   }
   if(lote.length < 2 || codigo.length < 2){
       return;
   }
    
   $.ajax({
        type: "POST",
        url: "productos/ActualizarLotes.class.php",
        data: {"action": "actualizarLote", "usuario": getNick(), "suc": getSuc(),codigo:codigo, lote:lote, descrip:descrip,tara:tara,estado_venta:estado_venta,ancho:ancho_m,gramaje:gramaje_calc,kg:kg,obs:obs},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText); 
                if(result == "Ok"){
                  $("#msg").html('Ok!, los datos se actualizaran en unos segundos.');
                  $("#actualizar").html('<img src="img/refresh-32.png" title="Recargar" data-info="Recargar" class="rotate" style="height: 26px;width: 26px; margin-bottom: -8px;cursor: pointer" onclick="buscarDatos()")>');
                  $("#guardar").attr("disabled",true);
                }else{
                  $("#msg").html("Error: "+result);
                }
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}

function showKeyPad(){
    showRelative("lote",buscarDatos,false,-50);
}

function buscarDatos(){
   var lote = $("#lote").val();
   var suc = getSuc();
   $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action":"buscarDatosDeCodigo","lote":lote,"categoria":1,"suc":suc}, // Utilizo la misma funcion de Factura de Ventas
        async:true,
        dataType: "json",
        beforeSend: function(){ 
           $("#msg").html("<img src='img/loadingt.gif' >");    
           $("#imprimir").attr("disabled",true);
           $(".falla").attr("disabled",true);
           $("#img").fadeOut("fast");
           $("#codigo").val(""); 
           $("#um").val("");  
           $("#suc").val("");   
           $("#ancho").val("");  
           $("#ancho_m").val("");  
           $("#gramaje").val("");
           $("#gramaje_calc").val("");           
           $("#descrip").val("");  
           $("#stock").val("");    
           $("#fp").val("");  
           $("#tara").val(""); 
           $("#padre").val(""); 
        },
        success: function(data){ 
            var existe = data.existe;
            $("#msg").attr("class","info");
            if( existe === "true" ){
                $("#codigo").val(data.codigo); 
                $("#descrip").val(data.descrip);
                $("#estado_venta").val(data.estado_venta);
                $("#stock").val(  parseFloat( data.stock  ).format(2, 3, '.', ',')   );
                var stock_ =  data.stock;
                var ancho = parseFloat(  data.ancho ).format(2, 3, '.', ',');
                var ancho_ =  parseFloat( data.ancho).format(2, 3, '', '.')  ;
                var gramaje = parseFloat(  data.gramaje ).format(2, 3, '.', ',');
                var gramaje_ = parseFloat( data.gramaje).format(2, 10, '', '.');
                var kg_rec = parseFloat( data.kg_desc).format(2, 10, '', '.');
                var padre = data.padre;
                var um = data.um_prod; 
                var suc = data.suc;  
                var img = data.img;  
                
                //var FP = data.FP;
                var tara = data.tara;
                myUnits = um;
                                
                $("#um").val(um);  
                $("#suc").val(suc);   
                $("#ancho").val(ancho);  
                $("#ancho_m").val(  ancho_    ); 
                $("#gramaje").val(gramaje); 
                $("#gramaje_calc").val(gramaje_);
                $("#kg_rec").val(kg_rec);
                $("#padre").val(padre);  
                
                var kg_calc = parseFloat((( ( stock_ * gramaje_ *  ancho_ ) ) / 1000) + (tara / 1000) ).format(3, 3, ',', '.');   
                $("#kg_real").val(kg_calc);
                
                if(img != "" && img != undefined){
                    var images_url = $("#images_url").val();
                    $("#img").attr("src",images_url+"/"+img+".thum.jpg");
                    $("#img").fadeIn(2500);
                }else{
                    $("#img").attr("src","img/no_image.png");
                    $("#img").fadeIn(2500);
                }                
         
                $("#msg").html("<img src='img/ok.png'>");  
                if(getSuc() == suc){
                   $("#imprimir").removeAttr("disabled");
                }else{
                    $("#msg").addClass("error");
                    $("#msg").html("Esta pieza no se encuentra en esta Sucursal!, Corrobore.");   
                }
                
                $("#tara").val(tara);
                
                if(parseFloat(stock_) > 0){
                    $("#guardar").removeAttr("disabled");
                    getFallas(); 
                }else{
                  getStockDeOtraSucursal();
                }
                var permiso_fallas = $("#permiso_fallas").val();
                if(permiso_fallas == "true"){
                    $("#ver_fallas").fadeIn();
                }else{
                    $("#ver_fallas").fadeOut();
                }    
            }else{
                $("#msg").addClass("error");
                $("#msg").html("Codigo no existe");   
                $("#lote").focus(); 
                $("#lote").select();
                $("#imprimir").attr("disabled",true);
                $("#guardar").attr("disabled",true);                 
            }
        },
        error: function(e){ 
           $("#msg").addClass("error");
           $("#msg").html("Error en la comunicacion con el servidor:  "+e);
           $("#imprimir").attr("disabled",true);
           $("#lote").select();
           $("#guardar").attr("disabled",true);
        }
    });
}

function getFallas(){
    var codigo = $("#codigo").val();
    var lote = $("#lote").val();
    var stock =  parseFloat( $("#stock").val().replace(/\./g, '').replace(/\,/g, '.')  );
    //var vender =  parseFloat( $("#cantidad").val().replace(/\./g, '').replace(/\,/g, '.')  );
    var vender = stock;
    $.ajax({
        type: "POST",
        url: "ventas/FacturaVenta.class.php",
        data: {action: "getFallas", codigo: codigo, lote: lote,vender:stock}, // Para mostrar todas las fallas que ya tiene
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $(".fallas").remove();
            fallas = [];
            max_mts_fallas = 0;
            falla(false,"F"); 
        },
        success: function (data) { 
            if(data.length > 0){  
                $("#max_mts").html(stock); 
                $("#regla").prop("max",stock);
                 
                fallas = data;
                max_mts_fallas = fallas.length * 30;
                
                //falla(true,"F");
                
                $(".grafico_fallas").slideDown();                
               
                 
                var porc_vender = 100;
                
                $('#total_vender').animate({  
                  width:''+porc_vender+'%'
                }, 1000, function() {
                    for(var i in data){
                       var  tipo_falla = data[i].tipo_falla;
                       var ubic_falla = data[i].ubic_falla;
                       var ubic_real = parseFloat(data[i].ubic_real);
                       var calc_pos_falla = parseInt((ubic_real * 100) / vender);
                       setTimeout( "showFalla("+calc_pos_falla+",'"+tipo_falla+"',"+ubic_real+")",500);
                       //console.log("Falla: "+tipo_falla+"   Vender: "+vender+"  Ubic Falla "+ubic_real+"  Calc Pos "+calc_pos_falla);
                    } 
                });
                $(".datalist_opt").remove();
                
                var division = 0.25;
                /*
                if(stock > 20){
                    division = 0.5;
                }
                if(stock > 40){
                    division = 1;
                }*/
                
                for(var i = 0;i < stock;i+=division){
                   $("#ticks").append("<option class='datalist_opt' value="+i+" label="+i+">");                    
                }
                $("#msg").html("");    
                var permiso_fallas = $("#permiso_fallas").val();
                if(permiso_fallas == "true"){
                    $("#area_agregar_fallas").fadeIn();
                }else{
                    $("#area_agregar_fallas").fadeOut();
                }
                //$("#tabla_fallas").width("99%");
            }else{
               $("#area_agregar_fallas").fadeOut();  
               $(".grafico_fallas").slideUp();
               $("#msg").html("");    
            }
        },
        error: function (e) {                 
            $("#msg").html("Error al obtener fallas:  " + e);   
            errorMsg("Error al obtener fallas:  " + e, 10000);
        }
    }); 
}
function showFalla(calc_pos_falla,tipo_falla,ubic_real){
    $('#total_vender').append("<div class='fallas' style='margin-left:"+calc_pos_falla+"%'> <span class='falla_indic' >"+tipo_falla+"</span></div> ");
    $('#total_vender').append("<div class='fallas' style='margin-left:"+calc_pos_falla+"%'> <span class='falla_pos' >"+ubic_real+"</span></div> ");
}
function falla(bool,cod_falla){
   var visible = "hidden";
   bool?visible = "visible":"hidden";
   $(".grafico_fallas").fadeOut();       
   $(".falla").css("visibility",visible);  
   $("#cod_falla").text(cod_falla);
   $("#cm_falla").val("");
}
 
function getStockDeOtraSucursal(){
    var codigo = $("#codigo").val();
    var lote = $("#lote").val();
    var um =  $("#um").val(); 
    $.ajax({
        type: "POST",
        url: "productos/ActualizarLotes.class.php",
        data: {"action": "getStockDeOtraSucursal", codigo: codigo,lote:lote,suc:getSuc()},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("Verificando en Stock  <img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            $("#msg_alt").html(""); 
        },
        success: function (data) {   
          if( data.length > 0 ) { 
                var Suc_ = data.Suc;
                var Stock = parseFloat(data.Stock); 
                $("#msg_alt").html("Este lote ya no se encuentra en su Sucursal. No puede Modificar.  [ Suc: "+Suc_+"  Stock: "+Stock+" "+um+" ]<br>Consulte el Historial para mas informaci&oacute;n"); 
          }else{
              $("#guardar").removeAttr("disabled");
              $(".falla").removeAttr("disabled");   
          }   
          $("#msg").html(""); 
        }
    });
} 

function modificarAnchoYGramaje(){
    $("#upd_gramaje").fadeToggle();
}
function  historial(){
    var lote = $("#lote").val();
    var suc = '%';//$("#suc").val(); 
    var codigo = $("#codigo").val();
    
    var url = "productos/HistorialMovimiento.class.php?codigo="+codigo+"&lote="+lote+"&suc="+suc+"";
    var title = "Historial de Movimiento de Lote";
    var params = "width=980,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    window.open(url,title,params);    
}

function registrarFalla(){    
    var suc =  $("#suc").val(); 
    var codigo = $("#codigo").val();
    var lote = $("#lote").val();
    var tipo_falla =  $("input[name='fx']:checked").val();
    var mts = $("#regla").val();
    var padre= $("#padre").val();
    
    if(tipo_falla != undefined && mts > 0){
        $.ajax({
            type: "POST",
            url: "productos/ActualizarLotes.class.php",
            data: {action: "registrarFalla",codigo:codigo, lote:lote,padre:padre, suc: getSuc(), usuario: getNick(),tipo_falla:tipo_falla,mts:mts },
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                if (data.mensaje === "Ok") {
                    $("#msg").html("Ok");
                    getFallas();
                } else {
                    $("#msg").html("Error al :  ");   
                }                
            },
            error: function (e) {                 
                $("#msg").html("Error regsitrar falla:  " + e);   
                errorMsg("Error al registrar falla:  " + e, 10000);
            }
        }); 
    }else{
        alert("Elija un metraje > 0 y un tipo de Falla F1, F2 o F3!");
    }
}