var canvas;
var svg;
var colorFondo = '#dcdde1';
//var objetos =[];

$(function () {
    canvas = new fabric.Canvas('plano');

    var estante = 'E';
    // C
    var top = 10;
    var left = 300;

    var alto = 340;
    var ancho = 240;
    var y = 0;
    var i = 1;
    var j = 1;
    var nombre_estante = new fabric.Text("PORTA REPASADORES " + estante, {
        id: 'NombreEstante',
        fontSize: 32,
        left: 40,
        top: 10
    });
    canvas.add(nombre_estante);

    var band = new Array();

    var rect = new fabric.Rect({
        id: "fondo_" + estante + "_" + i + "_" + j,
        left: left,
        top: top,
        fill: colorFondo,
        width: ancho,
        height: alto,
        angle: 0,
        stroke: 'gray',
        strokeWidth: 3
    });

    band.push(rect);

    var codigo = new fabric.Rect({
        id: "codigo_" + estante + "_" + i + "_" + j,
        left: left + (ancho / 2) - 20,
        top: top + -4,
        fill: "white",
        width: 40,
        height: 14,
        angle: 0,
        stroke: 'black',
        strokeWidth: 1
    });

    band.push(codigo);

    var text = new fabric.Text(estante + "." + i + "." + j, {
        id: "texto_" + estante + "_" + i + "_" + j,
        fontSize: 10,
        left: left + (ancho / 2) - 12,
        top: top + -2,
    });
    band.push(text);

    for (var k = 0; k < 5; k++) {
        for (var l = 0; l < 6; l++) {
            var agujero = new fabric.Circle({
                id: "agujero_" + k + "_" + estante + "_" + i + "_" + j,
                radius: 6,
                fill: "black",
                top: top + 12 + (l * 50),
                left: left + 20 + (k * 46)
            });
            var randcolor = '#'+Math.floor(Math.random()*16777215).toString(16);
            var rep = new fabric.Rect({
                id: "repasador_" + estante + "_" + k + "_" + l,
                top: top + 20 + (l * 50),
                left: left + 14 + (k * 46),
                fill: randcolor,
                width: 24,
                height: 36,
                angle: 0,
                stroke: 'gray',
                strokeWidth: 1
            });
            randcolor = '#'+Math.floor(Math.random()*16777215).toString(16);
            var rep2 = new fabric.Rect({
                id: "repasador_" + estante + "_" + k + "_" + l,
                top: top + 22 + (l * 50),
                left: left + 12 + (k * 46),
                fill: randcolor,
                width: 24,
                height: 36,
                angle: 0,
                stroke: 'gray',
                strokeWidth: 1
            });
            randcolor = '#'+Math.floor(Math.random()*16777215).toString(16);
            var rep3 = new fabric.Rect({
                id: "repasador_" + estante + "_" + k + "_" + l,
                top: top + 24 + (l * 50),
                left: left + 10 + (k * 46),
                fill: randcolor,
                width: 24,
                height: 36,
                angle: 0,
                stroke: 'gray',
                strokeWidth: 1
            });

            band.push(agujero,rep,rep2,rep3);
        }
    }

    var g = new fabric.Group(band, {
        id: "" + estante + "_" + i + "_" + j,
        left: left + (j * ancho) - 80,
        top: top + 30 + y,
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
    var timeoutTriggered = false;

    function stopDragging(element) {
        element.lockMovementX = true;
        element.lockMovementY = true;
    }

    function onMoving(e) {
        if (!timeoutTriggered) {
            setTimeout(function () {
                stopDragging(e.target);
            }, 500);
            timeoutTriggered = true;
        }
    }
    canvas.on({
        'object:moving': onMoving
    });

    y += alto;

    canvas.on('selection:created', function () {
        cuadrantesSeleccionados();
    });
    canvas.on('selection:cleared', function () {
        liberarCuadrantes();
    });
});

