


$(function(){
    
});


function procesar(){
   var data = $("#clock_data").val();    
   
    $.ajax({
        type: "POST",
        url: "ClockParser.class.php",
        data: {action: "procesar", data:data},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='../../img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) { 
            
             
            var parsed = "";
            
            for(var i in data){ 
                 
                
                var id = data[i].id;
                var name = data[i].name;
                var date = data[i].date;
                var hours = data[i].hours;
                var horas = "";
                hours.forEach(function(e){
                   horas+=e+" "; 
                });
                var line = ""+id+"   "+name+"   "+date+"  "+horas+"";
                
                console.log(line);
                
                parsed +=line+"\n";
            }
            $("#clock_result").val(parsed);   
            
        },
        error: function (e) {                 
            $("#msg").html("Error al xxx cuenta:  " + e);   
             
        }
    }); 
}


