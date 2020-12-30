var canvas;
var svg;
var colorFondo = '#95a5a6';
//var objetos =[];
 
$(function(){
    canvas = new fabric.Canvas('plano');
       
    var estante = 'Y';
    // C
    var top = 20; 
    var left = 0;
    
    var alto = 100;
    var ancho = 280;
    var y = 0;
    var nombre_estante = new fabric.Text("ESTANTE "+estante, {
        id:'NombreEstante',
        fontSize: 32,
        left: 40,
        top: 10 
   });
     canvas.add(nombre_estante);   
     for(var i = 1;i > 0 ;i--){  
        for(var j = 1;j > 0 ;j--){             
            var band = new Array();
            
            var rect = new fabric.Rect({
              id:"fondo_"+estante+"_"+i+"_"+j, 
              left: left  + (j * ancho) -200,
              top: top + (i * alto),
              fill: colorFondo,
              width: ancho - 10,
              height: alto - 1,
              angle: 0,
              stroke : 'black',
              strokeWidth : 4
            });
            
             var foot1 = new fabric.Rect({
              id:"foot_"+estante+"_"+i+"_"+j, 
              left: left  + (j * ancho) -200,
              top: top + (i * alto),
              fill: "black",
              width: 4,
              height: 140,
              angle: 0,
              stroke : 'black',
              strokeWidth : 4
            });
             var foot2 = new fabric.Rect({
              id:"foot_"+estante+"_"+i+"_"+j, 
              left: left + ancho  + (j * ancho) -210,
              top: top + (i * alto),
              fill: "black",
              width: 4,
              height: 140,
              angle: 0,
              stroke : 'black',
              strokeWidth : 4
            });
            band.push(rect,foot1,foot2); 
            
            var codigo = new fabric.Rect({
              id:"codigo_"+estante+"_"+i+"_"+j, 
              left: left + (ancho / 2)   + (j * ancho) -220,
              top: top + alto - 12 + (i * alto),
              fill: "white",
              width: 40,
              height: 14,
              angle: 0,
              stroke : 'black',
              strokeWidth : 1
            });
             
            
             band.push(codigo);
             
            var text = new fabric.Text(estante+"."+i+"."+j, {
               id:"texto_"+estante+"_"+i+"_"+j, 
               fontSize: 10,
               left: left + (ancho / 2)   + (j * ancho) -210,
               top: top + alto - 10 + (i * alto),
            });
            band.push(text);
            var g = new fabric.Group(band, {
              id:""+estante+"_"+i+"_"+j,
              left: left + (j * ancho) -80,
              top: top + 30 + y,
              cornerSize: 6,
              borderColor: 'gray',
              cornerColor: 'orange', 
              transparentCorners: false 
            }); 
             
            var timer = 0;
            g.on('mouseup', function() {
              var d = new Date();
              timer = d.getTime();
            });
            g.on('mousedown', function(e) {  
              var d = new Date();
              if ((d.getTime() - timer) < 300) {
                   var id = $(this).attr("id");   console.log("ID:  "+id);
                   selectCuadrante(id); 
              }
            }); 
            canvas.add(g);
            var timeoutTriggered = false;

            function stopDragging(element) {
              element.lockMovementX = true;
              element.lockMovementY = true;
            }

            function onMoving(e) {
              if (!timeoutTriggered) {
                setTimeout(function() {
                  stopDragging(e.target);
                }, 500);
                timeoutTriggered = true;
              }
            }
            canvas.on({
              'object:moving': onMoving
            });
        }
        y +=alto;
    } 
     canvas.on('selection:created', function () {
        cuadrantesSeleccionados();
     }); 
     canvas.on('selection:cleared', function () {
        liberarCuadrantes();
     });
});


