var config = false;
var selected_class = false;
var margin = "";
var valor_margen = 0;
 

$(document).ready(function(){
    
    var printer = $("#printer").val();
    var silent =   $("#silent_print").val() ;    
    var auto_close_window =  $("#auto_close_window").val() ;    
    
    $(document).keydown(function(e) {
        //
        var key = e.keyCode || e.which;  console.log(key); 
        
        if(key === 121) { //F10                        
          e.preventDefault();
          config = !config;
          if(config){ 
             $(".config_popup").fadeIn();   
             if($(".etiqueta").length){
                selected_class =   $(".etiqueta").attr("class").split(" ")[0];  
                $("."+selected_class).addClass("selected"); 
             }
         }else{
             $(".config_popup").fadeOut();
             $(".selected").removeClass("selected");
             selected_class = false;
             //$("."+selected_class).addClass("selected");
         }
        }
     });
     $(".etiqueta").click(function(){
        if(config){ 
            $(".selected").removeClass("selected"); 
            selected_class = $(this).data("name");
            console.log("click "+selected_class);
            $("."+selected_class).addClass("selected");
            //$("."+selected_class).css("background","orange");
        } 
    });  
    
         setTimeout(function () {
             if(  silent == "true"){      
                window.print(); 
             }
         }, 500);
    

    window.onfocus = function () { 
        
            setTimeout(function () { 
                if(auto_close_window == "true"){    
                   window.close(); 
                }
            }, 500);
        
    };
    posicionarFallas(); 
    
});

function posicionarFallas(){
    $("#falla").offset({left:$(".articulo").offset().left + 30});
}

function setMargin(marg,signo){ 
    margin = marg ;
    console.log(margin+" "+signo);
    
    valor_margen = parseInt( $("."+selected_class).css("margin-"+marg).replace("px","")); 
    if(signo === "+"){
        valor_margen  +=5; 
    }else{
        valor_margen  -=5; 
    }
    console.log(selected_class+"  "+margin+"  "+valor_margen);
      
    console.log(">> "+margin+"  "+valor_margen);
    $("."+selected_class).css("margin-"+margin,valor_margen+"px");
    posicionarFallas();
    saveInDB();
}             
 
function saveInDB(){
    var mtop = parseInt($("."+selected_class).css("margin-top"));
    var mright = parseInt($("."+selected_class).css("margin-right"));
    var mbottom = parseInt($("."+selected_class).css("margin-bottom"));
    var mleft = parseInt($("."+selected_class).css("margin-left"));
    var ip = $("#ip").val();
    
    var all_margin = mtop+"px "+mright+"px "+mbottom+"px "+mleft+"px"; 
    console.log(all_margin);
    
    var key = (selected_class+"_"+ip).toString();
    $.ajax({
        type: "POST",
        url: "BarcodePrinter.class.php",
        data: { "action": "saveMargins","clave":key,"margins":all_margin},
        async:true,
        dataType: "html",
        beforeSend: function(objeto){  
            //$("#work_area").html("<img id='loading' src='img/loading.gif'>");
        },
        complete: function(objeto, exito){
            if(exito=="success"){ 
                //$("#work_area").html(objeto.responseText  );  

            }
        }
    });  
}
