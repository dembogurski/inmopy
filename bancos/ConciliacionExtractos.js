/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function configurar(){
    $(".fecha").mask("99-99-9999");
    $(".fecha").datepicker({ dateFormat: 'dd-mm-yy' }); 
    var options = { 
            target:   '#output',   // target element(s) to be updated with server response 
            beforeSubmit:  beforeSubmit,  // pre-submit callback 
            success:       afterSuccess,  // post-submit callback 
            uploadProgress: OnProgress, //upload progress callback 
            resetForm: true        // reset the form after successful submit 
    }; 
		
    $('#MyUploadForm').submit(function() {  
         $("#cuenta_env").val($("#cuenta").val());
         $(this).ajaxSubmit(options);  			
         // always return false to prevent standard browser submit and page navigation 
         return false; 
    }); 
    $("#banco").val($("#bancos").val()); 
    setCuenta();
    $("#checkall").click(function(){  
        var estado = $(this).is(":checked");
        $(".checkb").prop('checked', estado);
        revisar();              
    });
    
 }
 
 function revisar(){
    if($('.checkb:checked').length > 0){
       $(".ext_menu").fadeIn();
    }else{
        $(".ext_menu").fadeOut();
    }      
 }
 
//function after succesful file upload (when server response)
function afterSuccess(){
    $('#submit-btn').show(); //hide submit button
    $('#loading-img').hide(); //hide submit button
    $('#progressbox').delay( 1000 ).fadeOut(); //hide progress bar
    //var filename = $("#output").html();
   // parseFile(filename);
}
function saveCuenta(){
    $("#cuenta_env").val($("#cuenta").val()); 
}
//function to check file size before uploading.
function beforeSubmit(){
    //check whether browser fully supports all File API
   if (window.File && window.FileReader && window.FileList && window.Blob){
		
		if( !$('#FileInput').val()){ //check empty input filed	
			$("#output").html("Me estas jodiendo. Seleccione un Archivo!");
			return false
		}
		
		var fsize = $('#FileInput')[0].files[0].size; //get file size
		var ftype = $('#FileInput')[0].files[0].type; // get file type
		

		//allow file types 
	    switch(ftype){            
                case 'text/plain':
                case 'application/vnd.ms-excel':                
                break;
            default:
                $("#output").html("<b>"+ftype+"</b> Tipo de archivo no soportado!");
				return false
        }
		
		//Allowed file size is less than 5 MB (1048576)
		if(fsize>5242880) 
		{
			$("#output").html("<b>"+bytesToSize(fsize) +"</b> Archivo demasiado grande! <br />El tamaño del archivo debe ser menor a 5 MB.");
			return false
		}
				
		$('#submit-btn').hide(); //hide submit button
		$('#loading-img').show(); //hide submit button
		$("#output").html("");  
	}
	else
	{
		//Output error to older unsupported browsers that doesn't support HTML5 File API
		$("#output").html("Please upgrade your browser, because your current browser lacks some new features we need!");
		return false;
	}
}

//progress bar function
function OnProgress(event, position, total, percentComplete){
    //Progress bar
    $('#progressbox').show();
    $('#progressbar').width(percentComplete + '%') //update progressbar percent complete
    $('#statustxt').html(percentComplete + '%'); //update status text
    if(percentComplete>50) {
        $('#statustxt').css('color','#000'); //change status text to white after 50%
    }
   
}

//function to format bites bit.ly/19yoIPO
function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Bytes';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}
 
 
function parseFile(filename){
    var file = filename.substring(6,100);
    $.ajax({
        type: "POST",
        url: "bancos/ConciliacionExtractos.class.php",
        data: {"action": "parseFile", "filename": file},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);   
                console.log(result);
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
} 

function setCuenta(){
    var banco = $("#bancos").val();
    $("#cuenta :not([class=cta_"+banco+"])").fadeOut();
    $("#cuenta .cta_"+banco+"").fadeIn();    
    $("#cuenta").val($(".cta_"+banco).val());
    $("#banco").val($("#bancos").val());
    $("#cuenta_env").val($(".cta_"+banco).val()); 
}
function getExtractos(){
   var banco = $("#bancos").val();
   var cuenta = $("#cuenta").val();
   var desde = validDate($("#desde").val()).fecha;
   var hasta = validDate($("#hasta").val()).fecha;
   
    $.ajax({
        type: "POST",
        url: "bancos/ConciliacionExtractos.class.php",
        data: {"action": "getExtractos", banco: banco,cuenta:cuenta,desde:desde,hasta:hasta},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $(".fila_extracto").remove();            
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            for (var i in data) { 
                var id_ext = data[i].id_ext;
                var fecha_reg = data[i].fecha_reg;
                var fecha_trans = data[i].fecha_trans;   
                var cod_mov = data[i].cod_mov;
                var concepto = data[i].concepto;
                var debe = parseFloat(data[i].debe).format(2, 3, '.', ',') ;
                var haber = parseFloat(data[i].haber).format(2, 3, '.', ',') ;
                var confirmado = data[i].confirmado;
                var e_sap = parseInt(data[i].e_sap);
                var can_check = "";
                var error_class = "";
                if(e_sap > 0 ){
                    can_check = "";
                    e_sap = '<img src="img/ok.png">';
                }else{
                    can_check = "<input type='checkbox' id='check_"+id_ext+"' class='check_"+id_ext+" checkb' onclick='revisar()'>";
                }
                if(debe == 0 && haber == 0){
                    can_check = "";
                    error_class = "error";
                }
                $("#preview").append("<tr class='fila_extracto' id='ext_"+id_ext+"'><td class='itemc'>"+fecha_reg+"</td><td class='itemc'>"+fecha_trans+"</td><td class='item'>"+cod_mov+"</td><td class='item'>"+concepto+"</td><td class='num "+error_class+"'>"+debe+"</td><td class='num "+error_class+"'>"+haber+"</td><td class='itemc conf_"+id_ext+"'  >"+confirmado+"</td><td class='itemc'>"+e_sap+"</td><td class='itemc'>"+can_check+"</td></tr>");
            }  
            $("#ext_menu").width($("#preview").width());
            $("#msg").html(""); 
        }
    });
   
}
 
function confirmar(){
   var ids = new Array(); 
   $('.checkb:checked').each(function(){
      var id = $(this).attr("id").substring(6,30); 
      ids.push(id);
      $('.conf_'+id).html("<img src='img/loading_fast.gif'>");      
   });  
   function setSave(id_ext){
       $('.conf_'+id_ext).html("<img src='img/save-mini.png'>"); 
   }
    var idsend  = JSON.stringify(ids);
    $.ajax({
        type: "POST",
        url: "bancos/ConciliacionExtractos.class.php",
        data: {"action": "confirmar", "ids": idsend},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);
                if(result == "Ok"){                     
                    ids.forEach(setSave);
                }
                $("#msg").html("Ok Movimientos confirmados, la sincronizacion puede tardar entre 5 a 20 segundos");
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
   
}
function eliminar(){
    var c = confirm("Confirma que desea eliminar estos registros?");
    if(c){
    var ids = new Array(); 
    $('.checkb:checked').each(function(){
       var id = $(this).attr("id").substring(6,30);        
       ids.push(id);
       $('.conf_'+id).html("<img src='img/delete.png'>");      
    }); 
    function rem(id_ext){
        $('#ext_'+id_ext).remove();
    }
    var idsend = JSON.stringify(ids);
    
     $.ajax({
           type: "POST",
           url: "bancos/ConciliacionExtractos.class.php",
           data: {"action": "eliminar", "ids": idsend},
           async: true,
           dataType: "html",
           beforeSend: function () {
               $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
           },
           complete: function (objeto, exito) {
               if (exito == "success") {                          
                   var result = $.trim(objeto.responseText);
                   if(result == "Ok"){
                      ids.forEach(rem);
                   }
                   $("#msg").html("Ok movimientos eliminados.");
               }
           },
           error: function () {
               $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
           }
       });         
    }
}