

$(document).ready(function(){
  var papar_size = $("#papar_size").val();  
  var marginTop = 10;
  var marginBottom = 10;
  var marginLeft= 12;
  var marginRight = 12;
  
  var iniLength = parseInt(($("textarea.sub").val().length/50))+1;
  $("textarea.sub").attr("rows",iniLength);
  $("textarea.sub").css("height",(17*iniLength)+"px");
  $("textarea.sub").val($("textarea.sub").val().toUpperCase());

  $("textarea.sub").keyup(function(){
    var rows = parseInt(($(this).val().length/50)+1);
    $(this).attr("rows",rows);
    $(this).css("height",(17*rows)+"px");
    $(this).val($(this).val().toUpperCase());
  });

  if(papar_size == 9){
     marginTop = 4;
     marginBottom = 0;
     marginLeft= 20;
     marginRight = 20;
  }
  
  if(typeof( jsPrintSetup ) == "object") {  
    jsPrintSetup.setOption('marginTop', marginTop);
    jsPrintSetup.setOption('marginBottom', marginBottom);
    jsPrintSetup.setOption('marginLeft', marginLeft);
    jsPrintSetup.setOption('marginRight', marginRight);
    // set page header
    jsPrintSetup.setOption('headerStrLeft', '');
    jsPrintSetup.setOption('headerStrCenter', '');
    jsPrintSetup.setOption('headerStrRight', '');// &PT
    // set empty page footer
    jsPrintSetup.setOption('footerStrLeft', '');
    jsPrintSetup.setOption('footerStrCenter', '');
    jsPrintSetup.setOption('footerStrRight', '');
    jsPrintSetup.setOption("paperData",papar_size);
    // Suppress print dialog
    //jsPrintSetup.setSilentPrint(true);
    // Do Print
    jsPrintSetup.print();
    // Restore print dialog
    jsPrintSetup.setSilentPrint(false);
  }  
    
});

var id_auth = 0;

function getAutorizado(){
    id_auth++;
    var cod_cli = $("#cod_cli").val();
    $.ajax({
        type: "POST",
        url: "Pagare.class.php",
        data: {"action": "getAutorizado",CardCode:cod_cli, id_auth: id_auth},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#image_container").fadeOut();
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {            
            var CI = data.CI;
            var Nombre = data.Nombre;                 
            $("#nombre_auth").val(Nombre);
            $("#ci_auth").val(CI);    
            if(CI == ""){
                id_auth = 0;
                $("#lupa").fadeOut();                 
            }else{
                $("#lupa").fadeIn();
            }
            $("#msg").html(""); 
	    verifAutorizado();
        }
    });
}

function verifAutorizado(){
    var nombre = $.trim($("#nombre_auth").val());
    var RUC = $.trim($("#ci_auth").val());
    if((nombre + RUC).length > 0){
    $(".autorizado_no").addClass(function(){
        $(this).removeClass("autorizado_no");
        return "autorizado";
    });
    }else{
    $(".autorizado").addClass(function(){
        $(this).removeClass("autorizado");
        return "autorizado_no";
    });
    }
}

function zoomImage(){
    var w = $("#zoom_range").val();    
    $("#image_container").width(w);
    $("#img_zoom").width(w);    
}
function verFirma(){   
    var auth_ci = $("#ci_auth").val();    
    
    $("#image_container").html("");
      
    var cab = '<div style="width: 100%;text-align: right;background: white;">\n\
        <img src="../img/substract.png" style="margin-top:-4px"> <input id="zoom_range" onchange="zoomImage()" type="range" name="points"  min="60" max="1000"><img src="../img/add.png" style="margin-top:-4px;">\n\
        <img src="../img/close.png" style="margin-top:-18px;margin-left:100px" onclick=javascript:$("#image_container").fadeOut()>\n\
    </div>';
    
    $("#image_container").fadeIn();
    
    
    var left = 100; 
    //var top = $("#articulos").position().top;
    var top = 300;   
     
    $("#image_container").position({left:left,top:top});
    var path = "../img/autorizados/"+auth_ci+".jpg";
    
    var img = '<img src="'+ path +'" id="img_zoom" onclick=javascript:$("#image_container").fadeOut() width="500" >';
    $("#image_container").html( cab +" "+ img);
    $("#image_container").draggable();
}
