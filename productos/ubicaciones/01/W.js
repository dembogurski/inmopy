var canvas;
var svg;
var colorFondo = '#95a5a6';
//var objetos =[];
 
$(function(){
    canvas = new fabric.Canvas('plano');
       
    var estante = 'W';
    // C
    var top = 20; 
    var left = 100;
    
    var alto = 100;
    var ancho = 400;
    var y = 0;
    var nombre_estante = new fabric.Text("ESTANTE "+estante, {
        id:'NombreEstante',
        fontSize: 32,
        left: 40,
        top: 10 
   });
     canvas.add(nombre_estante);   
     for(var i = 5;i > 0 ;i--){  
        for(var j = 1;j < 2 ;j++){             
            var band = new Array();
            
            var rect = new fabric.Rect({
              id:"fondo_"+estante+"_"+i+"_"+j, 
              left: left + (j * ancho) ,
              top: top + (i * alto),
              fill: colorFondo,
              width: ancho-1,
              height: alto - 1,
              angle: 0,
              stroke : 'black',
              strokeWidth : 1
            });
             
            band.push(rect); 
              
            var pol = new fabric.Polygon([
                {x: 0 , y: 0 },
                {x: 40 , y: 0 },
                {x: 40 , y: 10 },
                {x: 0 , y: 10 } ], { 
                  id:"polig_"+estante+"_"+i+"_"+j, 
                  angle: 0,
                  fill: 'white',              
                  stroke: 'black',
                  strokeWidth: 1,
                  left: left + (ancho / 2)  -15  + (j * ancho)  ,
                  top: top + alto + (i * alto) - 10
                }
            );
            
            band.push(pol);
            
            
             
            var text = new fabric.Text(estante+"."+i+"."+j, {
               id:"texto_"+estante+"_"+i+"_"+j, 
               fontSize: 10,
               left: left + (ancho / 2)- 5 + (j * ancho)  ,
               top: top + alto - 10 + (i * alto),
            });
            band.push(text);
            var g = new fabric.Group(band, {
              id:""+estante+"_"+i+"_"+j,               
              left: left +   (j * ancho)   ,
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
        }
         
        y +=alto;
    } 
    var foot1 = new fabric.Rect({   
              id:"foot_"+estante+"_"+i+"_"+j,   
              left: left + 392,
              top: top + 20,
              fill: "white",
              width: 8 ,
              height: alto * 5.5 ,
              angle: 0,
              stroke : 'black',
              strokeWidth : 1
            });
            var foot2 = new fabric.Rect({   
              id:"foot_"+estante+"_"+i+"_"+j,     
              left: left + ancho + 400 ,
              top: top + 20,
              fill: "white",
              width: 8 ,
              height: alto * 5.5 ,
              angle: 0,
              stroke : 'black',
              strokeWidth : 1
            });
            canvas.add(foot1,foot2); 
            
     canvas.on('selection:created', function () {
        cuadrantesSeleccionados();
     }); 
     canvas.on('selection:cleared', function () {
        liberarCuadrantes();
     });
});

