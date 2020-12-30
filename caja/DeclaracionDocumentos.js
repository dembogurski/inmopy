 
var imagen = "";
var canvas, contexto,pixeles,data;
var data_aux = new Array();
var w,h;
    


function configurar(){
   $(".fecha").mask("99-99-9999");
   $(".fecha").datepicker({ dateFormat: 'dd-mm-yy' });   
   $("#fuser").val(getNick());
   $("#fsuc").val(getSuc());   
   $("#fecha").change(function(){       
       listarDocumentos();       
   });
}

$(document).ready(function(){
   if($("#brillo").val() != undefined ){ 
   w = $("#img").width();
   h = $("#img").height();
   $("#canvas").attr("width",w);
   $("#canvas").attr("height",h);
   $("#cv_container").attr("width",w);
   $("#cv_container").attr("height",h);
   
   $("#escalar").val(w);
   
   setTimeout("cargarImagen()",500);    
   canvas = document.getElementById("canvas");
   contexto = canvas.getContext("2d");
   
   $("#brillo").change(function(){
       var v = parseInt($(this).val());       
       console.log(v);
       for(var i = 0;i < data.length;i=i+4){ 
            data[i] = data_aux[i] + v;
            data[i+1] = data_aux[i+1] + v;
            data[i+2] = data_aux[i+2] + v;   
       } 
       contexto.putImageData(pixeles,0,0);   
       data = pixeles.data;  
   });  
   $("#umbral").change(function(){
       var v = parseInt($(this).val());  
       console.log("Umbral: "+v);
       for(var i = 0;i < data.length;i=i+4){
            var mediacolor  = (data_aux[i] + data_aux[i+1] + data_aux[i+2] ) / 3 ;
            if(mediacolor >= v){
              data[i] = 255;
              data[i+1] = 255;
              data[i+2] = 255;  
          }else{
              data[i] = 0;
              data[i+1] = 0;
              data[i+2] = 0;  
          }   
           
       } 
       contexto.putImageData(pixeles,0,0);   
       data = pixeles.data; 
       //cargarImagen();
   }); 
   
   $("#escalar").change(function(){
       var v = parseInt($(this).val());
       console.log("Escalar: "+v);
       $("#canvas").width(v);
   });
   $("#rotar").change(function(){
       var v = parseInt($(this).val());
       console.log("Rotar: "+v);
       $("#canvas").css("transform", "rotate("+v+"deg)");
   });
   $("#recortarX").change(function(){
       var v = parseInt($(this).val());
        
       var x = $("#canvas").width()- v;
       var y = $("#canvas").height();
       
       $("#canvas").css("clip", "rect(0px,"+x+"px,"+y+"px,"+v+"px");
   });
   $("#recortarY").change(function(){
       var v = parseInt($(this).val());
        
       var x = $("#canvas").width();
       var y = $("#canvas").height() - v;
       
       $("#canvas").css("clip", "rect("+v+"px,"+x+"px,"+y+"px,0px");
   });
   $("#canvas").draggable();
   }
});

function cargarImagen(){
   $("#msg").html(""); 
   var img= new Image(); 
   
   img.src= $("#img").attr("src");
    
   contexto.drawImage(img,0,0);
     
   pixeles= contexto.getImageData(0,0,w,h);
   data = pixeles.data; 
   for(var i = 0; i < pixeles.data.length;i++){
      data_aux[i] = pixeles.data[i]; 
   }    
}
//context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

function loadImageFileAsURL(){ 
         
    $("#levantar").attr("disabled",true);
    var filesSelected = document.getElementById("image-picker").files;
    
    if (filesSelected.length > 0)  {
        var fileToLoad = filesSelected[0];  
        var fileReader = new FileReader(); 
        fileReader.onload = function(fileLoadedEvent){   
            $("#textAreaFileContents").val(fileLoadedEvent.target.result); 
            var base64 = $("#textAreaFileContents").val();     
            resizedataURL(base64, 1024, 1632);      
    
            $("#msg").html("Reduciendo el tama&ntilde;o...<img src='img/activity.gif' width='24px' height='8px' >");
           
        };        
        fileReader.readAsDataURL(fileToLoad);    
        $("#levantar").removeAttr("disabled");
    }else{
        alert("No se ha tomado ninguna imagen");
    }
}
var images = new Array();
var images_names = new Array();
function loadImageFileAsURLMultiple(){ 
    images.splice(0,images.length);
    images_names.splice(0,images_names.length);
    images = new Array();
    images_names = new Array();

    $("#levantar-mult").attr("disabled",true);
    var filesSelected = document.getElementById("image-picker-mult").files;
    
    $(".previews").remove();
    var tabla = $($("#work_area .tabla").get(1))
    var tr = $("<tr/>");
    var td = $("<td/>",{"class":"previews","style":"min-width:600px;text-align: center;"});

    for(var i = 0;i < filesSelected.length; i++ )  {
        var fileToLoad = filesSelected[i];  
        var filename =  (  document.getElementById("image-picker-mult").files[i].name).replace(".jpg","").replace(".jpeg",""); 
        images_names.push(filename);
        var fileReader = new FileReader(); 
        fileReader.onload = function(fileLoadedEvent){              
           images.push( fileLoadedEvent.target.result);
           
           $("<img/>",{
               "src":fileLoadedEvent.target.result,
               "height":"auto",
               "width":"100"
               
            }).appendTo(td);
        };        
        fileReader.readAsDataURL(fileToLoad);             
    }
    td.appendTo(tr);
    tr.appendTo(tabla);  
    $("#levantar-mult").removeAttr("disabled");
}

function levantarDocumentoMult(){
    $("#levantar-mult").attr("disabled",true);
    var cant = images_names.length;
    var current = 0;
    var fecha = $("#fecha").val();
    if( fecha != "" ){
    $("#msg").html("");
    for(var i = 0;i < images_names.length; i++ )  {
        var img = images[i];
        var filename = images_names[i];    
        var form_data = new FormData();
        form_data.append('file', $('#image-picker-mult').prop('files')[i]);
        form_data.append('action', "levantarDocumento");
        form_data.append("suc",getSuc());
        form_data.append("usuario",getNick());
        form_data.append("fecha",fecha);
        form_data.append("filename",filename);
        form_data.append("i",i);
       
        $.ajax({
            type: "POST",
            url: "caja/DeclaracionDocumentos.class.php",
            data: form_data,
            async: true,
            cache: false,
            contentType: false,
            processData: false,
            dataType: "json",
            beforeSend: function () {
                $("#msg").append("<span class='upload_"+i+"'>Levantando "+filename+" <img src='img/loading_fast.gif' width='16px' height='16px' ></span><br>"); 
            },
            success: function (data) {   
                var mensaje = data.mesaje; 
                var x = data.i;                 
                //$("#guardar").removeAttr("disabled");
                if(mensaje == "Ok"){ 
                    var file = data.name;
                    $(".upload_"+x).html(">> "+file+": <img src='img/ok.png' width='16px' height='16px' >" );                     
                    current++;
                    console.log("Cant: "+cant+" current: "+current);
                    if(current == cant){
                       listarDocumentos();
                    }
                }else{
                   $(".upload_"+x).html(">>"+filename+"Error: "+data.error);           
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {          
               $(".upload_"+i).html(xhr+" "+ajaxOptions+" "+thrownError);      
            }
        });         
    } 
   }else{
       alert("Seleccione una Fecha");
   }
}

/* function levantarDocumentoMult(){
    $("#levantar-mult").attr("disabled",true);
    var cant = images_names.length;
    var current = 0;
    var fecha = $("#fecha").val();
    if( fecha != "" ){
    $("#msg").html("");
    for(var i = 0;i < images_names.length; i++ )  {
        var img = images[i];
        var filename = images_names[i];
        $.ajax({
            type: "POST",
            url: "caja/DeclaracionDocumentos.class.php",
            data: {"action": "levantarDocumento",imagen:img,suc:getSuc(),usuario:getNick(),fecha:fecha,filename:filename,i:i},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").append("<span class='upload_"+i+"'>Levantando "+filename+" <img src='img/loading_fast.gif' width='16px' height='16px' ></span><br>"); 
            },
            success: function (data) {   
                var mensaje = data.mesaje; 
                var x = data.i;                 
                //$("#guardar").removeAttr("disabled");
                if(mensaje == "Ok"){ 
                    var file = data.name;
                    $(".upload_"+x).html(">> "+file+": <img src='img/ok.png' width='16px' height='16px' >" );                     
                    current++;
                    console.log("Cant: "+cant+" current: "+current);
                    if(current == cant){
                       listarDocumentos();
                    }
                }else{
                   $(".upload_"+x).html(">>"+filename+"Error: "+data.error);           
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {          
               $(".upload_"+i).html(xhr+" "+ajaxOptions+" "+thrownError);      
            }
        });         
    } 
   }else{
       alert("Seleccione una Fecha");
   }
} */     

function levantarDocumento(){
    //var base64 = $("#textAreaFileContents").val();
     
   // var imagen =resizedataURL(base64, 1024, 1632);
     
    var fecha = $("#fecha").val();
    if(imagen != "" && fecha != "" ){
    $("#levantar").prop("disabled",true);         
    var filename =  (  document.getElementById("image-picker").files[0].name).replace(".jpg","").replace(".jpeg","");     
    
    $.ajax({
            type: "POST",
            url: "caja/DeclaracionDocumentos.class.php",
            data: {"action": "levantarDocumento",imagen:imagen,suc:getSuc(),usuario:getNick(),fecha:fecha,filename:filename},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {   
                var mensaje = data.mesaje; 
                                
                $("#msg").html(mensaje);             
                //$("#guardar").removeAttr("disabled");
                if(mensaje == "Ok"){                       
                    $("#msg").html(""); 
                    $("#textAreaFileContents").val("");
                    imagen = "";
                    listarDocumentos();
                }else{
                    $("#msg").html("Error: "+data.error); 
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {          
               $("#msg").html(xhr+" "+ajaxOptions+" "+thrownError);      
            }
        }); 
    }else{
       errorMsg("Seleccione una fecha y Tome una foto del documento",8000);
    }
}

function openFile(url){
    var w = $(document).width();
    var h = $(document).height();
    var cursor = 0;
    var files = new Array();
    var c = 0;
    $(".preview").each(function(){
       var src = $(this).attr("data-src");
       files.push(src);
       if(src == url){
           cursor = c;
       }
       c++; 
    });
    
    files = JSON.stringify(files);
    
    var params = "width="+w+",height="+h+",scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=yes";    
    var title = "Previsualizar";
    var path = "caja/DeclaracionDocumentos.class.php?action=abrirDocumento&url="+url+"&cursor="+cursor+"&files="+files;
    var p = window.open(path,title,params);
}
function siguiente(){
    var cursor = parseInt($("#cursor").val()) + 1;
    if(cursor == archivos.length){
        cursor = 0;
    }
    abrir(cursor);
}
function anterior(){
    var cursor = parseInt($("#cursor").val()) - 1;
    if(cursor < 0){
        cursor = archivos.length -1;
    }
    abrir(cursor);
}

function abrir(cursor){
    var w = $(document).width();
    var h = $(document).height();
    
    var files = JSON.stringify(archivos);
    
    var url = archivos[cursor];
    
    var params = "width="+w+",height="+h+",scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=yes";    
    var title = "Previsualizar";
    var path = "DeclaracionDocumentos.class.php?action=abrirDocumento&url="+url+"&cursor="+cursor+"&files="+files;
    var p = window.open(path,title,params);        
}

function listarDocumentos(){
    var fecha = $("#fecha").val();
    $.ajax({
            type: "POST",
            url: "caja/DeclaracionDocumentos.class.php",
            data: {"action": "listarDocumentos", suc:getSuc() ,fecha:fecha},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $(".preview").remove();
                $("#archivos").html("Cargando Miniaturas...<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            success: function (data) {       
                $("#archivos").html("");
                
                console.log(data);
                
                for (var i in data) { 
                   var url = data[i].path;
                   var thumnail = data[i].thumnail;
                   //infoMsg(thumnail,25000);
                   $("#archivos").append("<img src='"+thumnail+"' class='preview' data-src='"+url+"' onclick=openFile('"+url+"') alt='Imagen' crossorigin='anonymous' >");  
                }              
                   
            },
            error: function (xhr, ajaxOptions, thrownError) {          
               $("#archivos").html(xhr+" "+ajaxOptions+" "+thrownError);      
            }
        }); 
}
//resizedataURL(base64, 1024, 1632);
function resizedataURL(datas, wantedWidth, wantedHeight)  {
        // We create an image to receive the Data URI
        var img = document.createElement('img');
        
        // When the event "onload" is triggered we can resize the image.
        img.onload = function() {        
                // We create a canvas and get its context.
                
                var originalwidth = img.width;
                var originalheight = img.height;
                if(originalwidth > originalheight ){
                    wantedWidth = 1632;
                    wantedHeight = 1024;
                }                
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');

                // We set the dimensions at the wanted size.
                canvas.width = wantedWidth;
                canvas.height = wantedHeight;

                // We resize the image with the canvas method drawImage();
                ctx.drawImage(this, 0, 0, wantedWidth, wantedHeight);

                imagen = canvas.toDataURL();
              //console.log(dataURI);
                /////////////////////////////////////////
                // Use and treat your Data URI here !! //
                /////////////////////////////////////////
                $("#msg").html(document.getElementById("image-picker").files[0].name);
                $("#levantar").removeAttr("disabled");
                $("#levantar").focus();
                
            };

        // We put the Data URI in the image's src attribute
        img.src = datas;
         
}
    
function reload(){
    window.location.reload();
}
function imprimir(){
    $(".preview_toolbar").slideUp(function(){
        self.print();
    });    
}

    
