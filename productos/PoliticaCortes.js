var polCurrentSuc;

function configurar(){
    $( "#dialog-confirm" ).dialog({
      resizable: false,
      height: "auto",
      width: 400,
      modal: true,
      autoOpen: false,
      buttons: {
        "Confirmar": function() {
            copyAllPol();
            $( this ).dialog( "close" );
        },
        "Cancelar": function() {
            $( this ).dialog( "close" );
        }
      }
    });
}

function getPol(){
    $("[id^='check_']").remove();
    $("#pol_loader").css("visibility","visible");
    $(".press_Pieza").html("---");
    $(".press_Rollo").html("---");
    $(".pol").val('');
    polCurrentSuc = $("#pol_suc option:selected").val();
    $.post("productos/PoliticaCortes.class.php",{"action":"get_table_data","args":polCurrentSuc},    
    function(tableData){
        $(".suc").text(polCurrentSuc);
        $.each(tableData,function(i,data){
            $("#col_"+data.U_codigo+" .pol").val(data.U_politica);
            var present = data.U_presentacion;
            if(present === null || present === ""){
                present = "N/D";
            }
            $("#press_"+data.U_codigo).html(present);
            $("#press_"+data.U_codigo).addClass("press_"+data.U_presentacion); 
        });      
        $("#pol_loader").css("visibility","hidden");
    },"json");
    setTimeout("getPolRef()",1500);    
}

function savePress(codigo){    
    var press = $("#press_"+codigo).html();
    if(press === "Pieza"){  
      $("#press_"+codigo).html("Rollo");  
      $("#press_"+codigo).removeClass("press_Pieza");
      $("#press_"+codigo).addClass("press_Rollo");  
      guardarPresentacion(codigo,"Rollo");
    }else{
      $("#press_"+codigo).html("Pieza");  
      $("#press_"+codigo).removeClass("press_Rollo");
      $("#press_"+codigo).addClass("press_Pieza"); 
      guardarPresentacion(codigo,"Pieza");
    }
}

function guardarPresentacion(codigo,presentacion){
    var suc = $("#pol_suc").val();
    
    $.post("productos/PoliticaCortes.class.php",{"action":"save_press","args":suc+','+codigo+','+presentacion},
    function(){   },"json");    
}

function getPolRef(){  
    checkPolRefVisibility();
    $("#pol_loader").css("visibility","visible");
    $("#copyAll").val(polCurrentSuc+" << " + $("#pol_ref option:selected").val());
    $(".pol_ref").unbind("click");
    $.post("productos/PoliticaCortes.class.php",{"action":"get_table_data","args":($("#pol_ref option:selected").val())},
    function(tableData){
        $(".pol_ref").empty();        
        $.each(tableData,function(i,data){
            $("#ref_"+data.U_codigo).html(data.U_politica);            
            $("#ref_"+data.U_codigo).bind("click",function(){
                $("#"+data.U_codigo).val($("#ref_"+data.U_codigo).html());
                savePol($("#"+data.U_codigo));
            });
        });
        $("#pol_loader").css("visibility","hidden");
    },"json");    
}

function savePol(ref){    
    var r = ref.attr('id');
    var loader = $('<img src="img/loader_transparent.gif" height="12" width="12" />');
    loader.attr("class","save_pol_loader");
    var checkMark = $("<span id='check_"+r+"' style='color:green;'>&#x2714;</span>");
    $("#check_"+r).remove();
    if(isNaN(ref.val())){
        alert(ref.val()+' no es un numero.');
    }else{
        ref.after(loader);
        $.post("productos/PoliticaCortes.class.php",{"action":"save_pol","args":r+','+ref.val()+','+polCurrentSuc},
        function(){
            $(".save_pol_loader").remove();
            ref.after(checkMark);
        },"json");
    }
}

function copyAllPol(){    
    $(".pol_ref:not(:empty)").each(function(){
        var ref = $(this).attr("id").split('_')[1];
        $("#"+ref).val($(this).text());
    });
    //guardar en db
    $.post("productos/PoliticaCortes.class.php",{"action":"copyAll","args":$("#pol_ref option:selected").val()+','+polCurrentSuc},
    function(data){
        $.each(data.cods,function(k,v){
            var id = v;
            $("#check_"+id).remove();
            var checkMark = $("<span id='check_"+id+"' style='color:green;'>&#x2714;</span>");
            $("#"+id).after(checkMark);            
        });
        alert(data.msj);
    },"json");    
}
function copyAllPol_(){
    $("#pol_from").text($("#pol_ref option:selected").val());
    $("#pol_to").text(polCurrentSuc);    
    $( "#dialog-confirm" ).dialog( "open" );
}
function checkPolRefVisibility(){
    if(polCurrentSuc==$("#pol_ref option:selected").val()){
        $(".copyAll").attr('disabled','disabled');
    }else{
        $(".copyAll").removeAttr('disabled');
        //$(".pol_ref").css("display","table-cell");
    }
}
