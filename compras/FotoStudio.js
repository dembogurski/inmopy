
var counter = 0;

var Codigo = "";
var BaseType = 0;
var BaseEntry = 0;
var lotes_data = null;
var lotes_flag = false;
var data_next_time_flag = true;
var impresion_codigo_barras = false;

function configurar(){
    $("#tabs").tabs();
    $("#lote").focus();
    $("#lote").click(function(){
       $(this).select(); 
    });
    
   $("*[data-next]").keyup(function (e) {
        if (e.keyCode == 13) { 
            if(data_next_time_flag){
               data_next_time_flag = false;  
               var next =  $(this).attr("data-next");
               $("#"+next).focus();               
               setTimeout("setDefaultDataNextFlag()",600);
            }
        } 
    }); 
    $("#ip").blur(function() {
        var ip = $("#ip").val();
        setCookie("ip_camara", ip, 365);
    });
    if (getCookie("ip_camara").sesion == undefined) {
        setCookie("ip_camara", "localhost", 365);
    }else{
        $("#ip").val(getCookie("ip_camara").sesion);
    }
    $("#datos_precarga").click(function(){
        var checked = $("#datos_precarga").is(":checked");
        setCookie("datos_precarga", checked, 365);
    });
    var coockieChecked = JSON.parse( getCookie("datos_precarga").sesion);
    $("#datos_precarga").prop("checked",coockieChecked );
    getCamList();
}
function showKeyPad(id){
    //var pos = $("#"+id).position().top
    hideNumpad();
    showRelative(id,controlar,false,-49);
    $('#n_keypad').css({ 'left'  : $('#n_keypad').position().left - 4});
}
function controlar(){
    //var stock = $("#stock").val().replace(".","").replace(",",".") ; ;
    var ancho = $("#ancho").val();
    var gramaje_m = $("#gramaje_m").val();
    var imagen = $("#image_preview a").length;
    
    var kg = $("#kg_desc").val();
    
    
    
    if(/*stock > 0 &&*/ ancho > 0 && gramaje_m > 0 && imagen > 0){
        $("#guardar").removeAttr("disabled");
    }else{
        $("#guardar").prop("disabled",true);
    }   
    var gr_calc = ((kg * 1000) / (stock * ancho)).toFixed(2) ;
    $("#gr_calc").val(gr_calc);
}
function actualizarDatos(){
    var datos_precarga = $("#datos_precarga").is(":checked");
    var url = "";
    if(datos_precarga){
       url = "Entrada";   
    }
    
    $("#guardar").prop("disabled",true);
    var lote = $("#lote").val();
    var lotes = new Array();
    $(".afectados").each(function(){
        var checked = $(this).is(":checked");        
        if(checked){
           var lote_ = $(this).attr("data-lote"); 
           lotes.push(lote_);
        } 
    });
    if( lotes.length > 0){ 
        lotes = JSON.stringify(lotes);
        var ancho = $("#ancho").val();
        var gramaje_m = $("#gramaje_m").val();   
        var base64  = $("#base64").val();
        var thumnail64  = $("#thumnail64").val();

        $.ajax({
            type: "POST",
            url: "compras/FotoStudio.class.php",
            data: {"action": "actualizarLotes"+url,imagen:base64,thumnail:thumnail64,lote:lote,BaseType:BaseType,BaseEntry:BaseEntry, lotes: lotes,ancho:ancho,gramaje_m:gramaje_m},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#info_lotes").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                var mensaje = data.mesaje; 
                                
                $("#info_lotes").html(mensaje);             
                //$("#guardar").removeAttr("disabled");
                if(mensaje == "Ok"){
                    $( ".preview" ).effect( "scale", {percent: 10 }, 500,function(){  $( ".preview" ).remove(); 
                        setTimeout(function(){
                            limpiarTodo(); 
                            $("#image_preview").html("<br><br><h1>Ultima imagen guardada Lote: "+lote+" </h1><br><img src='"+url+"' class='preview'   width='640' height='360'  >");
                        },500);} );
                    
                    var url = data.url;                
                    
                    $("#lote").val("");
                    $("#lote").focus();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {          
               $("#info_lotes").html(xhr+" "+ajaxOptions+" "+thrownError);      
            }
        }); 
    } 
}
function limpiarTodo(){
    $('.empty').empty()
    $(".datos").val("");
    $('.fila').remove();
    $("#info_lotes").html("");
}
function buscarDatosLote(){
    var lote = $("#lote").val();
    var datos_precarga = $("#datos_precarga").is(":checked");
    var url = "";
    if(datos_precarga){
       url = "Entrada";   
    }
    $.ajax({
        type: "POST",
        url: "compras/FotoStudio.class.php",
        data: {"action": "getDatosLote"+url, "lote": lote},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#capturar").prop("disabled",true);                
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
            BaseType  = 0;
            BaseEntry = 0;
            Codigo = ""
            lotes_data = null;
            $(".buttons").prop("disabled",true);
            limpiarTodo();
        },
        success: function(data){ 
            var mensaje = data[0].Mensaje;
            $("#msg").attr("class","info");
            if( mensaje === "Ok" ){
                var Status = data[0].Estado; // 0 Liberado 1 Acceso Denegado, 2 Bloqueado
                 
                $("#codigo").val(data[0].Codigo); 
                $("#descrip").val(data[0].Descrip);
                $("#stock").val(  parseFloat( data[0].Stock  ).format(2, 3, '.', ',')   );
                $("#stock").attr("data-stock",parseFloat( data[0].Stock  ).format(2, 3, '.', ','));
                $("#color").val(data[0].Color);                
                $("#design").val(data[0].Design); 
                $("#padre").val(data[0].Padre); 
                $("#kg_desc").val((data[0].kg_desc) * 100 / 100 );
                $("#id_det").val(data[0].id_det);
                var gm = Math.round(data[0].GramajeM);
                if(gm == null || isNaN(gm)){
                    gm = "";
                }
                $("#gramaje_m").val(gm); 
                
                $("#ancho").val(data[0].Ancho);      
                
                BaseType  = data[0].BaseType;
                BaseEntry = data[0].BaseEntry;
                Codigo = data[0].Codigo;
                
                /*              
                var precio = data[0].Precio;
                var descuento = data[0].Descuento;
                if(descuento > 0){
                    precio = precio -((precio * descuento ) / 100);
                }
                var cotiz = 1;
                var precio = parseFloat(  (precio) / cotiz ).format(decimales, 3, '.', ',');
                
                var ancho = parseFloat(  data[0].Ancho ).format(2, 3, '.', ',');
                var gramaje = parseFloat(  data[0].Gramaje ).format(2, 3, '.', ','); 
                                              
                var factorPrecio = parseFloat(data[0].FactorPrecio);      */ 
                var um = data[0].UM; 
                               
                                
                $("#um").val(um);  
                $("#um").attr("data-um_prod",um);
                 
                
                var imagen = data[0].Img; 
                //$("#imagen_lote").fadeIn("fast");
                if(imagen != ""){
                   var images_url = $("#images_url").val();
                   $("#image_preview").html('<img src="'+images_url+"/"+imagen+'.thum.jpg" id="imagen_lote" alt="" style="margin-top:30px">');  
                }else{
                   $("#image_preview").html('<img src="img/no-image.png" id="imagen_lote" alt="">  ');  
                }                
                $("#msg").html("");                
                $("#capturar").removeAttr("disabled");
                
                var datos_precarga = $("#datos_precarga").is(":checked");                
                if(datos_precarga){
                   $("#imprimir").slideDown();        
                }
                
                getSimilaresEnBaseEntry();
            }else{
                $("#msg").addClass("error");
                $("#msg").html(mensaje);               
                $("#image_preview").html('<img src="img/no-image.png" id="imagen_lote" alt="">  ');  
                $("#lote").focus(); 
                $(".datos").val("");
                $("#imprimir").slideUp();        
                BaseType = 0;
                BaseEntry = 0;
            }
        }
    });   
     
}
function buscarPadre(){
   var padre = $("#padre").val();
   $("#lote").val(padre);
   buscarDatosLote();
}
function getSimilaresEnBaseEntry(){
     var lote = $("#lote").val();
    var datos_precarga = $("#datos_precarga").is(":checked");
    var url = "";
    if(datos_precarga){
       url = "Entrada";   
    }
     $.ajax({
        type: "POST",
        url: "compras/FotoStudio.class.php",
        data: {"action": "getLotesSimilares"+url, "lote": lote},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) { 
            lotes_data = data;
            
            var desplegar = false;
            var count = 0;
            for (var i in data) {                  
                var Obs = data[i].Obs;
                if(Obs != ""){
                    desplegar = true;
                }
                count++;
            }
            
            $("#info_lotes").html(count+ " lotes a ser actualizados &nbsp; <img id='arrow' src='img/arrow-right.png' onclick='desplegarSimilares(true)' style='margin-bottom: -9px'>");
            if(desplegar || lotes_flag){                
                desplegarSimilares(lotes_flag); 
            }
            $("#msg").html(""); 
        }
    });
}
function desplegarSimilares(option){  
    if(option){
        $("#lotes_identicos").fadeIn();
        $(".fila").remove();
        for (var i in lotes_data) {   
            var Lote = lotes_data[i].Lote;  
            var Stock = lotes_data[i].Stock; 
            var Nro_lote_fab = lotes_data[i].U_nro_lote_fab;
            var Obs = lotes_data[i].Obs;
            var Img = lotes_data[i].Img;
            var ColorDesc = lotes_data[i].ColorDesc;
            var checked = 'checked="checked"';
            if(Obs != ""){
                checked = "";
            }
            have_img = "";
            if(Img != null && $.trim(Img).length > 0){
                have_img = "<img src='img/image.png' title='"+Img+".jpg' >";
            } 
            $("#lotes_identicos").append("<tr class='fila'><td>"+Lote+"</td><td>"+Stock+"</td><td>"+Nro_lote_fab+"</td><td>"+ColorDesc+"</td><td>"+Obs+"</td><td>"+have_img+"</td><td> <input class='check_"+Lote+" afectados' data-lote='"+Lote+"' type='checkbox' "+checked+" ></td></tr>"); 
        }
        $("#arrow").attr("src","img/arrow-down.png");
        $("#arrow").attr("onclick","desplegarSimilares(false)");  
        lotes_flag = true;
    }else{
        lotes_flag = false;
        $("#lotes_identicos").fadeOut();
        $("#arrow").attr("src","img/arrow-right.png");
        $("#arrow").attr("onclick","desplegarSimilares(true)");  
    }
}    
function getCamList(){
    var ip = $("#ip").val();
     
    $.ajax({
        url: "http://"+ip+"/photo/gphoto.php?action=camList",        
        dataType:"jsonp",
        jsonp:"mycallback", 
        beforeSend: function () { 
           $("#msg").html("<img src='img/loading_fast.gif' width='20' height='20' > &nbsp;&nbsp;<label style='color:black;font-size:14px'>Conectado con: "+ip+"...  </label>  ");  
        }, 
        success:function(data){ 
              console.log(data);
              var msg = data.msg;
              if(msg == "Ok"){
                var model = data.model; 
                $("#camera").append("<option value='"+model+"'>"+model+"</option>");
                $("#msg").html(""); 
                $("#lote").removeAttr("disabled");
              }else{               
                $("#msg").html("<img src='img/nocamera.png' style='position:absolute' alt='' title='Error al identificar la camara.' >"); 
              }
        },
        error: function(xhr, testStatus, error) {
            $("#lote").prop("disabled",true);
            $("#msg").html("<img src='img/nocamera.png' style='position:absolute' alt='' title='Error al identificar la camara.' >");
            console.log('$.ajax() error' + xhr+"  "+testStatus+"  "+error);
        }
    });             
}

function tomarFoto(){
    var ip = $("#ip").val();
    var camera = $("#camera").val();
    //var lote = $("#lote").val();
    var file = $("#lote").val()+"-"+counter;
    $.ajax({
        url: "http://"+ip+"/photo/gphoto.php?cam_name="+camera+"&file="+file,            
        dataType:"jsonp",
        jsonp:"mycallback", 
        cache: false,
        beforeSend: function () { 
           $("#msg").html("<img src='img/loading_fast.gif' width='20' height='20' > &nbsp;&nbsp;<label style='color:black;font-size:14px'>Conectado con: "+ip+"...  </label>  ");  
        }, 
        success:function(data){ 
              $("#msg").html("<img src='img/loading_fast.gif' width='20' height='20' > &nbsp;&nbsp;<label style='color:black;font-size:14px'Cargando imagen</label>  ");  
              
              var randomic = Math.round( Math.random() * 1000); 
              var msg = data.msg;
              if(msg == "Ok"){
                var imagen = data.img;
                var base64 = data.base64;
                var thumnail64 = data.thumnail64;
               
                var url = 'http://'+ip+'/'+imagen+'?random='+randomic;
                
                $("#image_preview").html("<a href='"+url+"' >\n\
                  <img src='"+url+"' class='preview'   width='640' height='360'  >\n\
                </a>");
                 
                 $("#base64").val(base64);
                 $("#thumnail64").val(thumnail64);
               
                $(".thumbnails").append("<li><a href='"+url+"' data-standard='"+url+"' data-base64='"+base64+"' data-thumnail='"+thumnail64+"' >	<img src='"+url+"'  width='62' alt='' /></a></li>");
              
                var $easyzoom = $('.easyzoom').easyZoom();
                var api1 = $easyzoom.filter('.easyzoom--with-thumbnails').data('easyZoom');

		$('.thumbnails').on('click', 'a', function(e) {
			var $this = $(this); 
			e.preventDefault();
                        $('.preview').attr("src",$this.attr('href'));
                        $("#base64").val($this.attr('data-base64'));
                        $("#thumnail64").val($this.attr('data-thumnail'));
			// Use EasyZoom's `swap` method
			 api1.swap($this.data('standard'), $this.attr('href'));
		}); 
                controlar();
                $("#msg").html("");                 
              }else{               
                $("#msg").html("Error al conectar con la camara, parametros incorrectos."); 
              }
              counter++;
        },
        error: function(xhr, testStatus, error) {
            $("#msg").html("Puede que la camara se haya quedado sin bateria...");      
            errorMsg("Camara bloqueada, desbloque y vuelva a intentarlo: Mensaje Tecnico: "+error,10000)
            console.log('$.ajax() error' + xhr+"  "+testStatus+"  "+error);
        }
    });     
}

function checkAll(){
    $(".afectados").each(function(){
        var check = $(this).is(":checked");
        $(this).prop("checked",!check);
    });  
}
 
  
function setDefaultDataNextFlag(){
    data_next_time_flag = true;
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
            //this.select();
        }
        //console.log(e.keyCode+"  "+ e.which);
	if((tecla >= "97") && (tecla <= "122")){
		return false;
	}
} 

function imprimirCodigoBarras() {
  var lote = $("#lote").val(); 
  var AbsEntry = $("#id_det").val()
  
  var id_ent = BaseEntry;
    var printer = $("#printers").val();
    var silent_print = $("#silent_print").is(":checked");
    if (typeof(jsPrintSetup) == "object") {
        jsPrintSetup.setSilentPrint(silent_print);
    }
  
    var suc = getSuc();
    var usuario = getNick();

    var umc = $("#um").val(); 
    var quty_ticket =$("#stock").val(); 
            
    
    var url = "barcodegen/BarcodePrinterDescargaLoteVirtual.class.php?id_ent="+id_ent+"&AbsEntry="+AbsEntry+"&lote=" + lote + "&usuario=" + usuario + "&printer=" + printer + "&silent_print=" + silent_print + "&etiqueta=etiqueta_10x5&umc=" + umc + "&cant_c=" + quty_ticket;
    var title = "Impresion de Codigos de Barras";
    var params = "width=800,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=yes";
    if (impresion_codigo_barras) {
        impresion_codigo_barras.close();
    }
    impresion_codigo_barras = window.open(url, title, params);
}