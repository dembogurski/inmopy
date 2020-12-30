var canvas;
var svg;
var colorFondo = '#95a5a6';
//var objetos =[];
$(function(){
    canvas = new fabric.Canvas('plano');
    EstanteBandejas3D("V",5,4,10,120,50,120,canvas,"left",colorFondo );
});