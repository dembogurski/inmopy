var canvas;
var svg;
var colorFondo = '#95a5a6';
//var objetos =[];
 
$(function(){
    canvas = new fabric.Canvas('plano');
       
    var estante = 'D';
    // C
    var top = 20; 
    var left = 0;
    
    var alto = 60;
    var ancho = 120;
    var y = 0;
    var nombre_estante = new fabric.Text("ESTANTE "+estante, {
        id:'NombreEstante',
        fontSize: 32,
        left: 40,
        top: 10 
   });
     canvas.add(nombre_estante);   
     for(var i = 7;i > 0 ;i--){  
        for(var j = 1;j < 5 ;j++){             
            var band = new Array();
            
            var rect = new fabric.Rect({
              id:"fondo_"+estante+"_"+i+"_"+j, 
              left: left + (j * ancho) -200,
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
                {x: 119 , y: 0 },
                {x: 119 , y: 10 },
                {x: 0 , y: 10 } ], { 
                  id:"polig_"+estante+"_"+i+"_"+j, 
                  angle: 0,
                  fill: 'white',              
                  stroke: 'black',
                  strokeWidth: 1,
                  left: left + (j * ancho) -200,
                  top: top + 50 + (i * alto) 
                }
            );
            
            band.push(pol);
             
            var text = new fabric.Text(estante+"."+i+"."+j, {
               id:"texto_"+estante+"_"+i+"_"+j, 
               fontSize: 10,
               left: left + (ancho / 2)- 5 + (j * ancho) -200,
               top: top + alto - 10 + (i * alto),
            });
            band.push(text);
            var g = new fabric.Group(band, {
              id:""+estante+"_"+i+"_"+j,
               
              left: left + ((10 * ancho) - (j * ancho)) -300,
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
            
            if((i < 8 && j > 2 )  || (  (i < 7 )      )    ){
                 if((i  == 6 && j  == 1 )){
                      console.log("Fila "+i+" Col "+j);
                 }else{
                     canvas.add(g); 
                 } 
            } 
            
           
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

