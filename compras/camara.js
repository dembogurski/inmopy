
var last_code = "";

$(document).ready(function() {


    // Camera
    $("#webcam").scriptcam({
        showMicrophoneErrors: false,
        onError: onError,
        cornerRadius: 0,
        width: 640,
        height: 480,
        cornerColor: 'e3e5e2',
        onWebcamReady: onWebcamReady,
         path: '../js/ScriptCam/',
        //uploadImage:'images/upload.gif',
        onPictureAsBase64: base64_tofield_and_image,
        onError: oopsError
    });

    var replicar = $("#replicarimg").val();  
    if(replicar == "true"){
        $("#label_replicar").css("color","green");
        $("#label_replicar").html("Si &nbsp;<img src='../img/ok.png'>");
    }else{
        $("#label_replicar").css("color","red");
        $("#label_replicar").html("No &nbsp; <img src='../img/important.png'> ");
    }
});
function base64_tofield() {
    $('#formfield').val($.scriptcam.getFrameAsBase64());
};
function base64_toimage() {
    $('#base64').val($.scriptcam.getFrameAsBase64());
    $('#image').attr("src", "data:image/png;base64," + $.scriptcam.getFrameAsBase64());
    $('#guardar').removeAttr("disabled");
}
;
function base64_tofield_and_image(b64) {
    $('#base64').val(b64);
    $('#image').attr("src", "data:image/png;base64," + b64);
}
;
function changeCamera() {
    $.scriptcam.changeCamera($('#cameraNames').val());
}
function onError(errorId, errorMsg) {
    $("#capturar").attr("disabled", true);
    $("#msg_img").html("<label style='color:red;font-size:18px;font-weight:bolder'>&nbsp;&nbsp;" + errorMsg + "...</label>");
}
function onWebcamReady(cameraNames, camera, microphoneNames, microphone, volume) {
    $.each(cameraNames, function(index, text) {
        $('#cameraNames').append($('<option style="font-size:12px;"></option>').val(index).html(text))
    });
    $('#cameraNames').val(camera);
}
function oopsError(errorId, errorMsg) {
    // alert(errorId+" "+errorMsg);
    if (errorId == 3) {
        $("#msg_img").html("<label style='color:red;font-size:18px;font-weight:bolder'>&nbsp;&nbsp;No se ha encontrado ninguna camara...</label>");
    } else {
        $("#msg_img").html("<label style='color:red;font-size:18px;font-weight:bolder'>&nbsp;&nbsp;" + errorMsg + "...</label>");
    }
}
  
function info() {
    getCodeInfo();
}
function getCodeInfo() {
    var codigo = $("#codigo").val();

    $.ajax({
        type: "POST",
        url: "include/Ajax.class.php",
        data: "action=get_code_info&codigo=" + codigo + "",
        async: true,
        dataType: "html",
        beforeSend: function(objeto) {
            $("#descrip").html("<label>Buscando... </label> <img src='images/working.gif'  >");
        },
        complete: function(objeto, exito) {
            if (exito == "success") {
                $("#descrip").html(objeto.responseText);

                if (jQuery.trim(objeto.responseText) == "Codigo No Existe!!!") {

                    $("#codigo").focus();
                    $("#codigo").select();
                    $("#similares").html("");
                } else {
                    cantProductosSimilares();
                }
            }
        }
    });
}


function guardarImagen() {
    //var base64  = $.scriptcam.getFrameAsBase64();

    var base64 = $("#base64").val();
    var AbsEntry = $("#AbsEntry").val();
    var AbsEntrys = $("#AbsEntrys").val();

    var base64img =  $.scriptcam.getFrameAsBase64();
    var lote = $("#lote").val();
      
    var replicar = $("#replicar").val();
     

        $.ajax({
            type: "POST",
            url: "../Ajax.class.php",
            data: {action:"guardarImagenBase64",base64img:base64img ,lote:lote ,replicar:replicar,AbsEntry:AbsEntry,AbsEntrys:AbsEntrys},
             
            async: true,
            dataType: "html",
            beforeSend: function(objeto) {                                
                $("#msg_img").html("<label>&nbsp;&nbsp;&nbsp;Guardando imagen... </label> <img src='../img/loadingt.gif' >");
            },
          
            timeout: 8000,
            complete: function(objeto, exito) {
                if (exito == "success") {  
                                 
                 var arr = $.trim((objeto.responseText)).substring(1,60).split(",");
                   
                   var estado = arr[0].split(":")[1];
                   var imagen = arr[1].split(":")[1];
 
                    if(estado == "Ok"){
                   
                         $("#msg_img").html("&nbsp;&nbsp;&nbsp;Ok imagen guardada..." + imagen);
                    
                        var abs = AbsEntrys.split(",");
                        for(var i = 0; i < abs.length; i++){
                           var absent =   abs[i] ; 
                           window.opener.$(".img_" + absent ).val(imagen);
                           window.opener.$(".img_" + absent ).addClass("complete");                           
                        }
                        
                       if(last_code != lote){ // Si el codigo es distinto que el anterior
                            last_code = lote;       
                            $('#ultimas').find('tr').each(function() {
                                $(this).prepend('<td ><img src="../files/prod_images/' + imagen + '.jpg" width="80px" height="60px" style="cursor:pointer" onclick=verImagenGuardada("../files/prod_images/' + imagen + '.jpg")></td>').fadeIn('slow');
                            });
                            $('#ultimas tr').find('th:last, td:last').fadeOut("slow");
                            $('#ultimas tr').find('th:last, td:last').remove();   
                        }else{
                            $('#ultimas tr').find('th:first, td:first').remove();   
                            $('#ultimas').find('tr').each(function(){
                                 $(this).prepend('<td ><img id="temporal" src="" width="80px" height="60px"></td>').fadeIn('slow'); 
                            }); 
                            $("#temporal").attr("src","data:image/png;base64,"+base64);
                            $("#msg_img").html("&nbsp;&nbsp;&nbsp;Ok imagen remplazada..." +imagen);   
                        }

                            $("#guardar").attr("disabled",true);
                         
                        
                    }else{
                         $("#msg_img").html("Ocurrio un error durante la conexion con el Servidor... Intente de nuevo mas tarde si el problema persiste contacte con el Administrador (1)" );
                    } 
                }
            },
            error: function() {                
                $("#msg_img").html("Ocurrio un error durante la conexion con el Servidor... Intente de nuevo mas tarde si el problema persiste contacte con el Administrador (2)" );
            }       
                    
                 
                 
            
        });
     

}
function verImagenGuardada(url) {
    window.open(url, "Imagen", "width=640, height=480");
}

function cerrar() {  
    self.close();
}