var s;
var nodeColor = '#f00';
var c = {"0":"#FFFF00","50":"#FAD201","100":"#FFA420","150":"#FF7514","200":"#FF2301","250":"#F80000","300":"#E72512","350":"#A12312","350":"#9B111E"};

$(document).ready(function(){
     s = new sigma('container'); 
     getGrafo();
     $(".fecha").mask("99-99-9999");
     $(".fecha").datepicker({ dateFormat: 'dd-mm-yy' }); 
});

function getGrafo(){
    $.ajax({
        type: "POST",
        url: "GrafoNodos.class.php",
        data: {"action": "getGrafo"},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='../img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            for (var i in data) { 
                var nodo = data[i].nodo;
                var x = data[i].x;  
                var y = data[i].y;  
                var size = data[i].size;  
                //var adya = data[i].adya;  
                console.log("Nodo: "+nodo+" x: "+x+"  y:"+y+" size "+size);
                nodeColor ='#f00';
                if(nodo == "00"){
                    nodeColor = 'black'
                }else{
                    nodeColor ='#f00';
                }
                    s.graph.addNode({                
                     id: nodo,
                     label: nodo,                
                     x: x,
                     y: y,
                     size: size,
                     color: nodeColor,
                     borderColor: '#000',
                     borderWidth: 2
                   });
               
            }   
             
            s.refresh();
            $("#msg").html("Ok"); 
        }
    });
    
    var listener = new sigma.plugins.dragNodes(s, s.renderers[0]);

    //listener.bind('startdrag', function(event) {  console.log(event);    });
    listener.bind('drag', function(event) {
        var node = event.data.node.label;
        var x = Math.round(event.data.node.x);
        var y = Math.round(event.data.node.y);
        //console.log("Node "+node+" "+x+" "+y);        
    });
    //listener.bind('drop', function(event) {  console.log(event);});
    listener.bind('dragend', function(event) {  
        var nodo = event.data.node.id;
        var x = Math.round(event.data.node.x);
        var y = Math.round(event.data.node.y);  
        //cambiarPosicionNodo(nodo,x,y);
        unir(nodo);
    });
    //listener.bind('click', function(event) {  console.log(event);    });
    getListaAdyacencias();
}

var nodoA = null;
var nodoB = null;

function unir(nodo){
    if(nodoA == null){
        nodoA = nodo;
        $("#nodoA").val(nodoA);
    }else{
        if(nodo != nodoA){
           nodoB = nodo;
           $("#nodoB").val(nodoB);
           //addListaAdyacencia();
        }
    } 
}
function addListaAdyacencia(){
    $.ajax({
        type: "POST",
         url: "GrafoNodos.class.php",
        data: {"action": "addListaAdyacencia", "nodoA": nodoA, "nodoB": nodoB},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText); 
                nodoA = null;
                nodoB = null;
                $("#msg").html(result);
            }
        },
        error: function () {
            $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    }); 
}

function getListaAdyacencias(){
   $.ajax({
        type: "POST",
        url: "GrafoNodos.class.php",
        data: {"action": "getListaAdyacencias"},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='../img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) { 
            var tiempo = 0;
            for (var i in data) { 
                var nodo = data[i].nodo;
                var adya = data[i].adya; 
                setTimeout("addEdge('"+nodo+"','"+adya+"')",tiempo);
                //addEdge(nodo,adya); 
                tiempo+=10;      
            }   
            
            $("#msg").html("Ok"); 
        }
    });    
}
function addEdge(nodo,adya){
   var keyId =  nodo+"-"+adya;
   s.graph.addEdge({                
        id: keyId,
         "source": nodo,
         "target": adya,
         color: '#666'  
   });
   console.log("Nodo: "+nodo+" adya: "+adya+""); 
   s.refresh();   
}
function cambiarPosicionNodo(nodo,x,y){     
    console.log("Node "+nodo+" "+x+" "+y);     
    var suc = $("#suc").val();
    $.ajax({
        type: "POST",
        url: "GrafoNodos.class.php",
        data: {"action": "cambiarPosicionNodo",suc:suc,nodo:nodo,x:x,y:y},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("Cambiando posicino del Nodo: "+nodo+" "+x+" "+y+" <img src='../img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            var e = data.estado;
            $("#msg").html(e); 
        }
    });
}
function getFechaEn(id){
    var a = $("#"+id).val().split("-");
    return a[2]+"-"+a[1]+"-"+a[0];
} 
function verEstadisticas(){
    var desde = getFechaEn("desde");
    var hasta = getFechaEn("hasta");
    $.ajax({
        type: "POST",
        url: "GrafoNodos.class.php",
        data: {"action": "verEstadisticas",desde:desde,hasta:hasta},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='../img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {
            opacarNodos();
            for (var i in data) { 
                var nodo = data[i].nodo;
                var pedidos = data[i].pedidos;      
                s.graph.nodes().forEach(function(n) {    // empty node array         
                    if(n.id == nodo){                                                
                        //n.color = '#00F';
                        var resto = pedidos -  pedidos % 50;
                        if(resto > 350){
                            resto = 350;
                        }
                        n.color = c[resto];
                        n.label = n.id+" - ("+pedidos+" piezas)";
                    }
                }); 
                s.refresh();                
            }   
            $("#msg").html(""); 
        }
    });
}

function getRuta(){
    var origen = $("#nodoA").val().toUpperCase();
    var destino = $("#nodoB").val().toUpperCase();
    if(origen != null && destino != null  ){
        $.ajax({
            type: "POST",
            url: "SolicitudesTraslado.class.php",
            data: {"action": "getRutaMasCorta", origen:origen, destino: destino},
            async: true,
            dataType: "html",
            beforeSend: function () {
                $("#msg").html("Buscando ruta mas corta. <img src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            complete: function (objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText); 
                    $("#msg").html("Ir de: "+origen+ "<b> &rarr;</b> "+destino+"<br>"+result); 
                    var ruta = result.replace("Ruta: ","").replace(/\ /g,"").split(",");
                    resaltarNodos(ruta);
                }
            },
            error: function () {
                $("#msg").html("Error en la conexion"); 
            }
        });    
    } else{
       $("#msg").html("Ir de: "+origen+ "<b> &rarr;</b> "+destino+"");  
    }  
}

function opacarNodos(){
    s.graph.nodes().forEach(function(n) {  
        n.label = n.id;
        if(n.id !== "00"){                
            n.color = '#D3D3D3';
        }else{
            n.color = 'black';                             
        }
    });    
}
function reset(){
    s.graph.nodes().forEach(function(n) {  
        n.label = n.id;
        if(n.id !== "00"){                
            n.color = nodeColor;
        }else{
            n.color = 'black';                             
        }
    });    
}

function resaltarNodos(ruta){
    reset();
    s.refresh();      
    s.graph.nodes().forEach(function(n) {    
        if(ruta.indexOf(n.id) > -1){  
            n.color = '#0f0';  
        }
    }); 
    s.refresh();    
    nodoA = null;
    nodoB = null;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}