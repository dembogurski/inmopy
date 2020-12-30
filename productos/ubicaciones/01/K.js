var canvas;
var svg;
var colorFondo = '#95a5a6';
//var objetos =[];
 
$(function(){
    canvas = new fabric.Canvas('plano');
    EstanteBandejas3D( "K",5,8,50,120,50,120,canvas,"left",colorFondo );
});

