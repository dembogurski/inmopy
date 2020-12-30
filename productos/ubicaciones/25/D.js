var canvas;
var svg;
var colorFondo = '#95a5a6';
//var objetos =[];
 
$(function(){
    canvas = new fabric.Canvas('plano');
    EstanteBandejas3D("D",4,6,10,120,50,120,canvas,"left",colorFondo );
});

