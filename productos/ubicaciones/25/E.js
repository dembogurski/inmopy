var canvas;
var svg;
var colorFondo = '#F8EFBA';
//var objetos =[];

$(function () {
    canvas = new fabric.Canvas('plano');

    var estante = 'J';

    var top = 10;
    var left = 120;

    var alto = 400;
    var ancho = 500;
    var y = 0;
    var x = 6; var cant = 1;
    var i = 1;
    var j = 1;

    var nombre_estante = new fabric.Text("PORTA ROLLOS " + estante, {
        id: 'NombreEstante',
        fontSize: 32,
        left: 40,
        top: 10
    });
    canvas.add(nombre_estante);

    var band = new Array();

    var foot1 = new fabric.Rect({
        id: "foot_" + estante + "_" + i + "_" + j,
        left: 0,
        top: 40,
        fill: "white",
        width: 10,
        height: alto ,
        angle: 0,
        stroke: 'black',
        strokeWidth: 1
    });
    var foot2 = new fabric.Rect({
        id: "foot_" + estante + "_" + i + "_" + j,
        left: ancho,
        top: 40,
        fill: "white",
        width: 10,
        height: alto  ,
        angle: 0,
        stroke: 'black',
        strokeWidth: 1
    });
    band.push(foot1, foot2);
     
     for(var k = 0;k<8;k++){
        var randcolor = '#'+Math.floor(Math.random()*16777215).toString(16);
        
        var rect = new fabric.Rect({
            id:"fondo_"+estante+"_"+i+"_"+j, 
            left: 10,
            top: top + 40 + (k * 50),
            fill: "white", 
            width: ancho-10,
            height: 10,
            angle: 0,
            stroke : 'black',
            strokeWidth : 1
            });
        
        band.push(rect); 
        /*
        var rollo = new fabric.Circle({
        id:"rollo_"+k+"_"+estante+"_"+i+"_"+j, 
        radius: 12,
        fill: "darkgray",
        top: top + 180 + (k * 30),
        left: left + ((32 * ancho) - (j * ancho))+ 2  
        });

        band.push(rollo); */
     } 
 

    var text = new fabric.Text(estante + "." + i + "." + j, {
        id: "texto_" + estante + "_" + i + "_" + j,
        fontSize: 20,
        left:( ancho / 2) - 20,
        top: 0,
        angle: 0
    });

    console.log(" left +  (j * ancho)  " + left + " " + j * ancho);
    band.push(text);
    
    var g = new fabric.Group(band, {
        id: "" + estante + "_" + i + "_" + j,
        left: 380,
        top: top + 10,
        cornerSize: 6,
        borderColor: 'gray',
        cornerColor: 'orange',
        transparentCorners: false
    });

    var timer = 0;
    g.on('mouseup', function () {
        var d = new Date();
        timer = d.getTime();
    });
    g.on('mousedown', function (e) {
        var d = new Date();
        if ((d.getTime() - timer) < 300) {
            var id = $(this).attr("id");
            selectCuadrante(id);
        }
    });
    canvas.add(g);

    canvas.on('selection:created', function () {
        cuadrantesSeleccionados();
    });
    canvas.on('selection:cleared', function () {
        liberarCuadrantes();
    });
});


