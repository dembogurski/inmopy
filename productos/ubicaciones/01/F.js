var canvas;
var svg;
var colorFondo = '#95a5a6';
//var objetos =[];

$(function () {
    canvas = new fabric.Canvas('plano');

    var estante = 'F';
    // C
    var top = 120;
    var left = 600;

    var alto = 220;
    var ancho = 90;
    var y = 0;
    var i = 1;
    var nombre_estante = new fabric.Text("ESTANTE " + estante, {
        id: 'NombreEstante',
        fontSize: 32,
        left: 40,
        top: 10
    });
    canvas.add(nombre_estante);

    for (var j = 9; j < 14; j++) {
        var band = new Array();

        var rect = new fabric.Rect({
            id: "fondo_" + estante + "_" + i + "_" + j,
            left: left + (j * ancho) + 200,
            top: top + (i * alto),
            fill: colorFondo,
            width: ancho - 1,
            height: alto - 1,
            angle: 0,
            stroke: 'black',
            strokeWidth: 1
        });
        band.push(rect);
        for (var t = 1; t < 4; t++) {
            var tabla = new fabric.Rect({
                id: "tabla_" + estante + "_" + t + "_" + j,
                left: left + (j * ancho) + 200,
                top: top + 215 +(t * 60),
                fill: "gray",
                width: ancho - 1,
                height: 3,
                angle: 0,
                stroke: 'black',
                strokeWidth: 1
            });
            band.push(tabla);
        }

        

        var pol = new fabric.Polygon([
            {x: 0, y: 0},
            {x: 90, y: 0},
            {x: 90, y: 10},
            {x: 0, y: 10}], {
            id: "polig_" + estante + "_" + i + "_" + j,
            angle: 0,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 1,
            left: left + (j * ancho) + 200,
            top: top - 4 + (i * alto)
        }
        );

        band.push(pol);

        var text = new fabric.Text(estante + "." + i + "." + j, {
            id: "texto_" + estante + "_" + i + "_" + j,
            fontSize: 10,
            left: left + (ancho / 2) - 5 + (j * ancho) + 200,
            top: top - 2 + (i * alto),
        });
        band.push(text);

        var g = new fabric.Group(band, {
            id: "" + estante + "_" + i + "_" + j,
            left: left + ((10 * ancho) - (j * ancho)) - 300,
            top: top + 250 + y,
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
                console.log("ID:  " + id);
                selectCuadrante(id);
            }
        });
        canvas.add(g);

    }
    var altura = 224;  //+50
    var posx = 482; //+ 50
    var posy = 320  // -50;
    var estanteria = 3;
    for (var j = 8; j > 0; j--) {
        drawPoligon(estante, altura, 90, posx, posy, i, j, -50,estanteria);
        altura += 50;
        posx += 90;
        posy -= 50;
        estanteria++;
    }

    canvas.on('selection:created', function () {
        cuadrantesSeleccionados();
    });
    canvas.on('selection:cleared', function () {
        liberarCuadrantes();
    });
});


function drawPoligon(estante, altura, ancho, posx, posy, i, j, inclinacion,estanteria) {
    var band = new Array();
    var pol = new fabric.Polygon([
        {x: 0, y: 0}, {x: ancho, y: inclinacion},
        {x: ancho, y: altura}, {x: 0, y: altura}], {
        id: "fondo_" + estante + "_" + i + "_" + j,
        angle: 0,
        fill: colorFondo,
        stroke: 'black',
        strokeWidth: 1,
        left: 0,
        top: 0
    });
    var codigo = new fabric.Polygon([
        {x: 0, y: 0}, {x: ancho, y: inclinacion},
        {x: ancho, y: inclinacion + 10}, {x: 0, y: 10}], {
        id: "polig_" + estante + "_" + i + "_" + j,
        angle: 0,
        fill: "white",
        stroke: 'black',
        strokeWidth: 1,
        left: 0,
        top: 0
    });
    var text = new fabric.Text(estante + "." + i + "." + j, {
        id: "texto_" + estante + "_" + i + "_" + j,
        fontSize: 10,
        left: (ancho / 2) - 16,
        top: +34,
        angle: -30
    });
    band.push(pol, codigo, text);
    
    for (var t = 1; t <= estanteria; t++) {
            var tabla = new fabric.Rect({
                id: "tabla_" + estante + "_" + t + "_" + j,
                left: 2 ,
                top: (t * 60) +48,
                fill: "gray",
                width: ancho - 1,
                height: 3,
                angle: 0,
                stroke: 'black',
                strokeWidth: 1
            });
            band.push(tabla);
    }

    var g = new fabric.Group(band, {
        id: "" + estante + "_" + i + "_" + j,
        left: posx,
        top: posy,
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
            console.log("ID:  " + id);
            selectCuadrante(id);
        }
    });
    canvas.add(g);
}

