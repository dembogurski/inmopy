
var ventana;



function  historial(lote,suc){
    /*var lote = $("#lote").val();
    var suc = $("#suc").val();
    */
    var url = "HistorialMovimiento.class.php?lote="+lote+"&suc=%";
    var title = "Historial de Movimiento de Lote";
    var params = "width=980,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    
    if(!ventana){        
        ventana = window.open(url,title,params);
    }else{
        ventana.close();
        ventana = window.open(url,title,params);
    }  
}

function optimizar(){
    var ventas_band = 0;
    $(".lote").each(function(){
       var lote = $(this).html();
       var cant = $(".bath_"+lote).length;
       console.log(lote+"    "+cant);
       
       var ventas = parseInt($(this).attr("data-ventas"));
       if(ventas > ventas_band){
           $(".flag").removeClass("flag");
           $(this).parent().parent().addClass('flag');
           ventas_band = ventas;
       }
       if(cant > 1){
           $(".id_"+lote+"_00").slideUp();
       }
    });  
    $(".Hermano:not(.flag)").slideUp();
    $(".Similar:not(.flag)").slideUp();
    $("#flip").attr("src","../img/add.png");
}

function flip(){
    var src = $("#flip").attr("src");
    if(src == "../img/substract.png"){
        $("#flip").attr("src","../img/add.png");
        $(".check:checkbox:checked").parent().parent().slideUp();
    }else{
        $("#flip").attr("src","../img/substract.png");
        $(".Hermano").slideDown();
        $(".Similar").slideDown();
    }
}

function calc(){
    var kg = parseFloat($("#kg").val());
    var tara = parseFloat($("#tara").val());
    var ancho = parseFloat($("#ancho").val());
    var gramaje = parseFloat($("#gramaje").val());
    var tara_neta = tara > 0?tara / 1000:0;
    var mts = ((kg - tara_neta) * 1000 )  / (gramaje * ancho) ;
    
    console.log(mts);
    
    $("#mts").val(mts.toFixed(2));
}

