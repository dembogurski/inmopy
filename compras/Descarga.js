

var intentos = 0;
var actual_AbsEntry = 0;

var DocEntry = 0; // SAP DocEntry

var articulos = [];
var designs = [];
var mares = [];
var colores_fabrica = [];
var colores_comerciales = [];
var searching = false;

var modo_edicion = false;

var impresion_codigo_barras = false;

var showSearchBar = false;
var loadDesings = false;

var lotesFiltrados = new Array();

var filtroXColor = false;
 

function setAutocomplete() {} 

function setSearch(s) {
    searching = s;
}

function abrirCompra(nro_compra){ 
    load("compras/Descarga.class.php", {action:"abrirCompra", usuario: getNick(), session: (getCookie(getNick()).sesion), nro_compra: nro_compra },configure);
}
 
function configurar(){
 $(".lista_invoices").DataTable({
        "language": {
            "lengthMenu": "Mostrando _MENU_ registros por pagina",
            "zeroRecords": "Ningun registro.",
            "info": "Mostrando _PAGE_ de _PAGES_ paginas",
            "infoEmpty": "No hay registros.",
            "infoFiltered": "(filtrado entre _MAX_ registros)",
            "sSearch": "Buscar",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Ultimo",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            },
        }
    });
    
} 

function configure() {
    searching = false;
    $("#tabs").tabs().fadeIn("fast");
    DocEntry = $("#DocEntry").val();
    $(".filter").focus(function() {
        $(this).select();
    });
    $(".filter").keyup(function(e) {
        var tecla = e.keyCode;

        if (tecla == 13) {
            if ($(this).attr("id") == "search_q") {
                buscar();
            } else {
                filtrar();
            }
        }
    });
 

    // Prevent Ctrl F
    window.addEventListener("keydown", function(e) {
        if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {
            e.preventDefault();
            
            if (searching) {
                $("#search_bar").slideUp();
                setTimeout("setSearch(false)", 500);
            } else {
                mostrarBarraBusqueda();                 
                
                setTimeout("setSearch(true)", 500);
                
            }
            $("#search_q").focus();
            $("#search_q").select();
        }
    })

    /*$(window).scroll(function() {
        // $('#search_bar').animate({top:$(window).scrollTop()+"px" },{queue: false, duration: 350});            
    });*/
    // OVERWRITES old selecor
    jQuery.expr[':'].contains = function(a, i, m) {
        return jQuery(a).text().toUpperCase()
            .indexOf(m[3].toUpperCase()) >= 0;
    };
    //alert("Ready");
    $("#fuente").slider({
        value: 12,
        min: 7,
        max: 20,
        step: 1,
        slide: function(event, ui) {
            $("#font").text(ui.value);
            $("#productos *").css("font-size", ui.value);
            $("#cabecera  *").css("font-size", ui.value);
            $("#filtros  *").css("font-size", ui.value);
        }
    });
    $("#imagenes").slider({
        value: 14,
        min: 0,
        max: 30,
        step: 1,
        slide: function(event, ui) {
            var ratio = 1.2;
            $('.camara').css('width', ((ui.value + 4) * ratio) + '%');
            $('.camara').css('height', (ui.value + 4) + '%');
            $('.print, .printed').css("width", ui.value * ratio);
            $('.print, .printed').css("height", ui.value);
        }
    });
    $("#inputs").slider({
        value: 3,
        min: 1,
        max: 20,
        step: 1,
        slide: function(event, ui) { 
            $(".input").parent().css("width", ""+ui.value+"%"); 
            acomodarTitulos();
        }
    });
    $("#filtro_articulo").focus();
    $("#img_viewer").click(function() {
        $(this).slideUp();
        $(".tmp_obs").removeClass("tmp_obs");
    });

    configurePrinter();
    $("select > option:nth-child(even)").css("background", "#F0F0F5");
    $("#search_bar").draggable({         
        drag: function() {
            moveKeyBoard();
        },
        stop: function() {
            moveKeyBoard();
        }
    });
    $("#modif_gram").draggable();
    $("#fracc_form").draggable();
    getDesigns();
      
    $("#b_articulo").autocomplete({
      source: function(request, response) {

        $.ajax({
          type: 'get',
          url: 'compras/Descarga.class.php?action=buscarArticulos',
          data: { articulo: request.term },
          dataType: "json",
          minLength: 3,
          beforeSend: function() {            
            $(".loading_articulo").fadeIn();            
          },
          success: function(data){                                
               response($.map(data, function(item) {                 
                 return {
                     label: item.ItemName,
                     value: item.ItemCode
                 };
               }));
               $(".loading_articulo").fadeOut();            
          } 
         
       });       
     },
     select: function(event,ui){ 
        setTimeout(function(){$("#b_articulo").val(ui.item.label);},600);         
        $("#b_articulo").attr("data-codigo",ui.item.value);
     } 
    }); 
    
    $("#bcolor").autocomplete({
      source: function(request, response) {

        $.ajax({
          type: 'get',
          url: 'compras/Descarga.class.php?action=buscarColores',
          data: { color: request.term },
          dataType: "json",
          minLength: 3,
          beforeSend: function() {            
            $(".loading_color").fadeIn();            
          },
          success: function(data){                                
               response($.map(data, function(item) {                 
                 return {
                     label: item.Color,
                     value: item.Pantone
                 };
               }));
               $(".loading_color").fadeOut();            
          } 
         
       });       
     },
     select: function(event,ui){ 
        setTimeout(function(){$("#bcolor").val(ui.item.label);},600);         
        $("#bcolor").attr("data-pantone",ui.item.value);
     } 
    });
    // $("#filter_bar").draggable();        
    promedioGramajeAncho();
}

function swith(prefix){ // art_  des_ or sto_
     
    var src = $("#"+prefix+"_img").attr("src");
     
    if(src === "img/arrow_right.png"){
        $("#"+prefix+"_img").attr("src","img/arrow_down.png");
        $("."+prefix+"_max").addClass("minimiz_"+prefix); 
    }else{
        $("#"+prefix+"_img").attr("src","img/arrow_right.png");
        $("."+prefix+"_max").removeClass("minimiz_"+prefix); 
    }
    var i = 1;
    $('.tabla tr:first-child td').each(function(){
         var w = $(this).width();   
         $("#cabecera :nth-child("+i+")").width(""+w+"px").height("32px");
         i++; 
    });    
    $("#cabecera img").width("20px").height("20px");
    $("#cabecera").height("28px");
}
function cancelarEdicion(){
    limpiarForm();
    $("#toolbox").slideUp(function(){
        $("#search_bar").height("auto");
    });
    
}
function limpiarForm(){
    $("#toolbox input").not(":input[type=button]").val("");     
}
var procesados = 0;
function actualizarDatos(){
    procesados = 0;
    $("#bguardar").prop("disabled",true);
    
    var nro_compra = $("#nro_compra").val();
    var codigo = $("#b_articulo").attr("data-codigo");
    var descrip = $.trim($("#b_articulo").val());
    var design = $("#design").val();
    var color = $("#bcolor").val();
    var pantone = $("#bcolor").attr("data-pantone");
    var color_comb = $("#bcolor_comb").val();
    var fab_color_cod = $("#bfab_color_cod").val();
    var store_no = $("#bstoreno").val();
    var bag = $("#bbag").val();
    
    var filtro_articulo = $("#filtro_articulo").val();
    var c = 0;
    $("#toolbox input").not(":input[type=button]").each(function(){
       if($(this).val()!=""){
         c++;
       }
    });
    
    if(fab_color_cod.length > 0 && fab_color_cod.indexOf("-") == -1  ){
        alert("Si va a modificar Color Description el campo debe contener un guion!");
        $("#bguardar").removeAttr("disabled");
        return;
    }
    
    if(c > 0){ 
        
        var ids = new Array();
        
        if($(".selected_row").length > 0){
            
            $(".selected_row").each(function(){              
                var id = $(this).attr("id").substring(3,60);
                ids.push(id);
            });  
                ids = JSON.stringify(ids);
            $.ajax({
                type: "POST",
                url: "compras/Descarga.class.php",
                data: {"action": "actualizarDatos",ids:ids,nro_compra:nro_compra,usuario: getNick(),codigo:codigo,descrip:descrip,design:design,color:color,pantone:pantone,color_comb:color_comb,fab_color_cod:fab_color_cod,store_no:store_no,bag:bag,filtro_articulo:filtro_articulo },
                async: true,
                dataType: "html",
                timeout: 7000,
                beforeSend: function () {
                    $(".selected_row").each(function(){ 
                        $(this).children().first().append("<img class='loading_img' src='img/loading_fast.gif' width='16px' height='16px' >");  
                    });
                },
                complete: function (objeto, exito) {
                    if (exito == "success") {                          
                        var result = $.trim(objeto.responseText);   
                        if(result == "Ok"){                             
                            limpiarForm();                            
                            $(".loading_img").attr("src","img/ok.png");
                             
                        }else{                            
                             $(".loading_img").attr("src","img/warning_red_16.png");       
                        }
                        $("#bguardar").removeAttr("disabled");
                    }else if( exito ==="timeout"){
                        $(".loading_img").attr("src","img/warning_red_16.png"); 
                        $("#msg").html("Tiempo de espera agotado intente de nuevo...");
                        errorMsg("Tiempo de espera agotado, intente de nuevo!",6000);
                        $("#bguardar").removeAttr("disabled");
                    }
                },
                error: function () {
                    $("#msg").html("Ocurrio un error en la comunicacion con el Servidor...");
                }
            }); 

           
        }else{
             alert("Debe seleccionar las filas que desea modificar haciendo clic en ellas...");
             $("#bguardar").removeAttr("disabled");
        }
    }else{
        alert("Debe modificar al menos un campo del formulario si desea modificar algo.");
        $("#bguardar").removeAttr("disabled");
    }
}
 function mostrarBarraBusqueda(){
      $("#search_bar").slideDown(function (){
        var es = ($(document).width() / 2 ) - $("#search_bar").width() / 2; 
        $("#search_bar").offset({left:es,top:100}); 
     });
 }
 function selectRow(AbsEntry){
    if(modo_edicion){
        if($("#tr_"+AbsEntry).children().hasClass("selected_cell")){
           unSelectRow(AbsEntry);
        }else{
           $("#tr_"+AbsEntry).addClass("selected_row"); 
           $("#tr_"+AbsEntry).children().addClass("selected_cell"); 
        }
    }else{
        $(".selected_row").removeClass("selected_row");
        $(".selected_cell").removeClass("selected_cell");
    }
 }
 function unSelectRow(AbsEntry){
    $("#tr_"+AbsEntry).removeClass("selected_row");    
    $("#tr_"+AbsEntry).children().removeClass("selected_cell");    
 }

 function editarDatos(){
     if($("#editar").is(":checked")){
        modo_edicion = true;
        $("#toolbox").slideDown();
     }else{
        modo_edicion = false;
        $("#toolbox").slideUp(function(){
            $("#search_bar").height("auto");
        });
        
        $(".selected_row").removeClass("selected_row");
        $(".selected_cell").removeClass("selected_cell");
     }
 }
function filtrar() {
 
    var nro_compra = $("#nro_compra").val();
    var articulof = $("#filtro_articulo").val();
    var design = $("#filtro_desing").val();
    var mar = $("#filtro_mar").val();
    var color_desc = $("#q_color_desc").val();
    var color_com = $("#q_color_com").val();
    var j = 0;
    var estado = $("#estado").val();
    var origen = $("#origen").val();
    
    if(color_com != "%"){
        filtroXColor = true;
    }else{
        filtroXColor = false;
    }
    
    var readonly = "";
    if (estado !== "En_Transito") {
        readonly = "disabled='disabled'";
    }

    var solo_faltantes = 'No';
    if ($("#solo_faltantes").is(":checked")) {
        solo_faltantes = 'Si';
    }
    var totales = {};
    var totalKgsDescarga = 0;

    $.ajax({
        type: "POST",
        url: "compras/Descarga.class.php",
        data: { "action": "filtroEntradaMercaderias", nro_compra: nro_compra, articulo: articulof, design: design, mar: mar, color_desc: color_desc, color_com: color_com, solo_faltantes: solo_faltantes, suc: getSuc() },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#totales").fadeOut();
            $(".producto").remove();
            $(".tr_totales").remove();
            $(".total_descarga").remove()
            $("#msg").html("<img src='img/loading.gif' width='22px' height='22px' >");
            $("#filter_msg").html("<img src='img/loading.gif' width='18px' height='18px' >");
            lotesFiltrados = new Array();
        },
        success: function(data) {
       
            for (var i in data) {
                j++;
                var AbsEntry = data[i].AbsEntry;
                var Articulo = stringify(data[i].ItemName).split("-")[1];
                var Design = stringify(data[i].U_design);
                var mar = stringify(data[i].U_prov_mar);
                var bag = formatoIngles(data[i].U_bag, 0);
                var codigo = stringify(data[i].ItemCode);
                var lote = stringify(data[i].BatchNum);
                var um = stringify(data[i].U_umc);
                var um_prod = stringify(data[i].um_prod);
                var Color = stringify(data[i].U_color_comercial);
                var ColorDescription = stringify(data[i].ColorDescription);
                var kg_desc = formatoInglesOCero(data[i].U_kg_desc, 3);
                var U_quty_c_um = formatoIngles(data[i].U_quty_c_um, 2);
                var cantidad = formatoIngles(data[i].cantidad, 2);
                var Price = parseFloat(data[i].Price).format(2, 3, ".", ",");
                var Quantity_ticket = formatoInglesOCero(data[i].U_quty_ticket);
                var Ancho = formatoInglesOCero(data[i].U_ancho);
                var AnchoReal = formatoInglesOCero(data[i].U_ancho_real);
                
                var Gramaje_m = formatoInglesOCero(data[i].gramaje_m);
                var Gramaje = formatoInglesOCero(data[i].U_gramaje, 0);
                var Tara = formatoInglesOCero(data[i].tara, 0);
                var Printed = formatoIngles(data[i].U_printed, 0);
                var Img = data[i].U_img;
                var Obs = stringify(data[i].U_notas);
                var fraccion_de = data[i].fraccion_de;
                var Hash = data[i].DesignHash; // Set a Hash Here
                var mnj_x_lotes = data[i].mnj_x_lotes;
                
                lotesFiltrados.push(lote);
                
                if(lote == "" && mnj_x_lotes == "Si"){
                    alert("Los lotes deben ser Generados antes de proceder a la Descarga, contacte con compras");
                    $("#msg").html("");
                    $("#filter_msg").html("<img title='Generar Lotes antes de proceder a la descarga' src='img/warning_red_16.png' width='22px' height='22px' >");
                    return;
                }
                var img =  data[i].img;

                totalKgsDescarga += parseFloat(data[i].U_kg_desc);

                var totum = parseFloat(totales[um]);
                //console.log(um + "  " + totum);
                if (isNaN(totum)) { totum = 0; }
                totales[um] = totum + parseFloat(data[i].U_quty_c_um);

                var haveObs = "";

                var print_class = 'print';
                if (Printed < 1) {
                    Printed = "";
                } else {
                    print_class = 'printed';
                }
                if (Obs.length > 0) {
                    haveObs = "<img title='"+Obs+"' src='img/warning_yellow_16.png' width='14px' height='14px' >"
                }
                var clase = "";
                var disabled_print = 'disabled="disabled"';
                var complete_img = "";
                if (Quantity_ticket > 0 && kg_desc > 0 && Gramaje > 0 && Ancho > 0) {
                    clase = "complete";
                    disabled_print = '';
                    complete_img = "<img src='img/ok.png' width='18px' height='18px' >";
                }
                var sclass = "noedit";
                
                if(fraccion_de != null){
                    sclass = "noedit_son"; 
                }
                
                if(Gramaje_m == "" && origen == "Nacional"){
                  //  Gramaje_m = Gramaje;
                }
                var have_img = "";
                var have_img_class = "";
                if(img != null){
                    have_img = "<img src='img/image.png' title='"+img+".jpg' onclick=cargarImagenLote('"+img+"')  style='cursor:pointer;' >";
                }else{
                    have_img_class = "no_image";
                }
                                
                $("#productos").append("<tr onmousedown='selectRow("+ AbsEntry +")' class='producto fila_" + i + "' title='Articulo: " + Articulo + " " + AbsEntry + "' id='tr_" + AbsEntry + "' data-um='" + um_prod + "' data-umc='" + um + "' data-codigo='" + codigo + "' data-lote='" + AbsEntry + "' data-gramaje='" + Gramaje + "'  data-ancho='" + Ancho + "'  >\n\
                <td class='item "+sclass+"  "+have_img_class+" art_max' id='codigo_"+ AbsEntry +"'    > " + Articulo +"  </td>\n\
                <td class='item "+sclass+" buscar_" + AbsEntry + " design_" + Hash + " des_max' >" + Design + "</td>\n\
                <td class='item "+sclass+" buscar_" + AbsEntry + " sto_max'>" + mar + "</td>\n\
                <td class='itemc "+sclass+" bag buscar_" + AbsEntry + "'>" + bag + " </td>\n\
                <td class='item "+sclass+" buscar_" + AbsEntry + "' >" + ColorDescription + "</td>\n\
                <td class='item "+sclass+"  buscar_" + AbsEntry + "'>" + Color + " </td>\n\\n\
                <td class='itemc "+sclass+" buscar_" + AbsEntry + "'>" + Price + "</td> \n\
                <td class='itemc "+sclass+"'>" + um + "</td> \n\
                <td class='itemc "+sclass+" lote_" + Hash + " uniq_"+lote+"' id='lote_" + AbsEntry + "' data-hash='" + Hash + "'>" + lote + "</td> \n\
                <td class='itemc "+sclass+"  buscar_" + AbsEntry + "' id='each_quty_" + AbsEntry + "'  ondblclick='selectQuantity(" + AbsEntry + ")' >" + cantidad + "</td>\n\
                <td class='itemc'><input type='text' value='" + Quantity_ticket + "' class='input numero input_" + AbsEntry + " " + clase + " focusable' id='qty_ticket_" + AbsEntry + "' onchange=saveLine(" + AbsEntry + ",'Si') " + readonly + " onkeyup='return onlyNumbers(event)' onclick='setCurrentLine(" + AbsEntry + ")'  ></td>\n\
                <td class='itemc'><input type='text' value='" + kg_desc + "' title='Presione c para capturar el Kg' class='input numero input_" + AbsEntry + " " + clase + " focusable' id='kg_desc_" + AbsEntry + "' " + readonly + " onchange=saveLine(" + AbsEntry + ",'Si') onkeyup='return onlyNumbersAndCaptureKg(event,this.id)' onclick='setCurrentLine(" + AbsEntry + ")'  ></td>\n\
                <td class='itemc'><input type='text' value='" + AnchoReal + "' title='Ingrese el Ancho Real' class='input numero input_" + AbsEntry + " " + clase + " focusable ancho_real_" + Hash + "' id='ancho_real_" + AbsEntry + "' " + readonly + " onchange=saveLine(" + AbsEntry + ",'Si')    onclick='setCurrentLine(" + AbsEntry + ")'  ></td>\n\
                <td class='itemc'><input type='text' value='" + Gramaje_m + "' class='input numero input_" + AbsEntry + " " + clase + " focusable gram_" + Hash + "' id='gramaje_" + AbsEntry + "' onchange=saveLine(" + AbsEntry + ",'Si')  onkeyup='return onlyNumbers(event)' onclick='setCurrentLine(" + AbsEntry + ")' ></td>\n\\n\
                <td class='itemc'><input type='text' value='" + Tara + "' class='input numero input_" + AbsEntry + " " + clase + " focusable tara_" + Hash + "' id='tara_" + AbsEntry + "' onchange=saveLine(" + AbsEntry + ",'Si')  onkeyup='return onlyNumbers(event)' onclick='setCurrentLine(" + AbsEntry + ")' >  </td>\n\
                <td class='itemc'><input type='button' style='font-size:10px' class='" + print_class + " focusable' id='print_" + AbsEntry + "' value='" + Printed + "' " + readonly + " onclick='imprimirCodigoBarras(" + AbsEntry + "," + lote + ")' " + disabled_print + " > "+have_img+" </td>\n\
                <td class='itemc observ' id='obs_" + AbsEntry + "' onclick='setObs(" + AbsEntry + ")' style='cursor:pointer' data-obs='" + Obs + "' >" + haveObs + "</td>\n\
                <td class='itemc msg_complete' id='msg_" + AbsEntry + "'  style='cursor:pointer' onclick=saveLine(" + AbsEntry + ",'Si')>" + complete_img + "</td></tr>");

            }
            $("#msg").html("");
            $("#buscar").removeAttr("disabled");

            totalKgsDescarga = redondear(totalKgsDescarga);
            $("#productos").append("<tr class='total_descarga' ><td colspan='11'></td><td>" + totalKgsDescarga + "</td><td colspan='3'></td></tr>");

            var totalMts = totales["Mts"];
            var totalKgs = totales["Kgs"];
            var totalYds = totales["Yds"];
            var totalUnid = totales["Unid"];


            $("#tMts").html(totalMts);
            $("#tKgs").html(totalKgs);
            $("#tYds").html(totalYds);
            $("#tUnid").html(totalUnid);

            var totHtml = $("#totales").html();

            $("#productos").append("<tr class='tr_totales'><td colspan='6'></td><td colspan='9'>" + totHtml + "</td></tr>");

            $("#msg_filter").html("" + j + " registros");
            $("#filter_msg").html("" + j + "..");
            if (j < 28) { // Para que la cabecera se acomode
                $("#packing_head").css("width", "100%");
            } else {
                $("#packing_head").css("width", "99%");
            }

            if (j > 0) {

                enableNavigationByArrows();
                $(".numero").focus(function() {
                    $(this).css("border", "1px solid #CCCCFF");
                    var id = $(this).attr("id");
                    var AbsEntry_ = id.substring(11, 30);
                    var codigo = $("#tr_" + AbsEntry).attr("data-codigo");
                    
                    if (id.substring(0, 11) == "qty_ticket_") {                        
                        $("#each_quty_" + AbsEntry_).css("border", "solid red 2px");
                    }
                    $(this).select();
                    if (id.substring(0, 8) == "gramaje_"){
                        $('#actual_gramaje').val($(this).val()); 
                        
                        console.log(gramajeRef(codigo));
                    }
                    if (id.substring(0, 11) == "ancho_real_"){
                        console.log(anchoRef(codigo));
                    } 
                });
                $(".numero").blur(function() {
                    $(this).css("border", "0px solid white");
                    var id = $(this).attr("id");
                    var valor = $(this).val();
                    if (id.substring(0, 11) == "qty_ticket_") {
                        var AbsEntry_ = id.substring(11, 30);
                        $("#each_quty_" + AbsEntry_).css("border", "solid gray 1px");
                    }
                    
                     /*
                    if (valor > 0) {
                        if (id.substring(0, 11) == "ancho_real_") {      
                            var data_hash = $(this).parent().parent().attr("data-hash");   console.log("ID: "+id+"   hash: "+data_hash);
                            if ($("#reply").is(":checked")) {
                                //$(".ancho_" + data_hash + ":not(.complete)").val(valor);
                                $(".ancho_" + data_hash + ":not(.complete)").addClass("parcial_complete");
                            } else {
                                $(this).addClass("parcial_complete");
                            }
                        }
                        if (id.substring(0, 8) == "gramaje_"){
                            var data_hash = $(this).parent().parent().attr("data-hash"); console.log("ID: "+id+"   hash: "+data_hash);
                            if ($("#reply").is(":checked")) {
                                //$(".gramaje_" + data_hash + ":not(.complete)").val(valor);
                                $(".gramaje_" + data_hash + ":not(.complete)").addClass("parcial_complete");
                            } else {
                                $(this).addClass("parcial_complete");
                            }
                        }
                        if (id.substring(0, 5) == "tara_"){
                            var data_hash = $(this).parent().parent().attr("data-hash"); console.log("ID: "+id+"   hash: "+data_hash);
                            if ($("#reply").is(":checked")) {
                                //$(".tara_" + data_hash + ":not(.complete)").val(valor);
                                $(".tara_" + data_hash + ":not(.complete)").addClass("parcial_complete");
                            } else {
                                $(this).addClass("parcial_complete");
                            }
                        }
                    }*/

                });

                $(".msg_complete").hover(function() {
                    $(this).children().fadeOut();
                    $(this).addClass("save");
                }, function() {
                    $(this).removeClass("save");
                    $(this).children().fadeIn();
                });

                $(".camara").mouseover(function() {

                    if ($("#reply").is(":checked")) {
                        var h = $(this).attr("data-hash");
                        $(".design_" + h).addClass("setPhoto");
                        $(".lote_" + h).addClass("setPhoto");
                    }

                }).mouseout(function() {
                    if ($("#reply").is(":checked")) {
                        var h = $(this).attr("data-hash");
                        $(".design_" + h).removeClass("setPhoto");
                        $(".lote_" + h).removeClass("setPhoto");
                    }
                });
                $("#search_q").focus();
                
                clasificarPiezas(); // Verifica si es para Procesamiento o para Almacenaje
                
            } else {
                $("#msg").html("Ningun resultado...");
                $("#filter_msg").html("0");
            }
        }
    });
}
// Verifica si es para Procesamiento o para Almacenaje
function clasificarPiezas(){
    var filtrados = JSON.stringify(lotesFiltrados);
    $.ajax({
        type: "POST",
        url: "compras/Descarga.class.php",
        data: {"action": "clasificarPiezas", lotes: filtrados},
        async: true,
        dataType: "json",
        beforeSend: function () {
          $("#msg").html("   Clasificando rollos... <img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
            for (var i in data) { 
                var lote = data[i].lote;
                var presentacion = data[i].presentacion;
                var suc = data[i].suc;
                var ordenes = data[i].ordenes;
                var abs = $(".uniq_"+lote).attr("id").substring(5,30);
                
                if(presentacion == "Pieza" ){
                   $(".uniq_"+lote).addClass("procesar"); 
                   //$("#obs_"+abs).append("<img src='img/truck_"+suc+".png'  height='22px' alt='Rem:"+suc+"' > ");
                   if( ordenes > 1){
                       $("#obs_"+abs).append("<img src='img/machine-device-working.png' width='16px' height='16px' > ");
                   }else{
                      $("#obs_"+abs).append("<img src='img/truck_"+suc+".png'  height='22px' alt='Rem:"+suc+"' > ");
                   }
                }else{
                   $(".uniq_"+lote).addClass("reservar"); 
                   $("#obs_"+abs).append("<img src='img/truck_"+suc+".png'  height='22px' alt='Rem:"+suc+"' > ");
                }
                
                
            }   
            $("#msg").html(""); 
        }
    });
    
   
   acomodarTitulos();
    
}
function acomodarTitulos(){
    var child = 1;
    $("#productos tr").first().find("td").each(function(){
        var w =  $(this).width();
        var v = $(this).css("display");
        $("#cabecera th:nth-child("+child+")").width(w);
        //console.log(v+"  -->  "+w);
        child++;
    });       
}

function buscarOld() {
    $("#msg").html("Buscando...");
    $(".first_found").removeClass("first_found");
    $(".second_found").removeClass("second_found");
    var count0 = 0;
    var count1 = 0;
    var words = $.trim($("#search_q").val());
    var first_word = $.trim((words.split(" ")[0]).toUpperCase());
    var element_found = "";
    //console.log
    $('td:contains("' + first_word + '")').each(function() {
        var AbsEntry = ($(this).parent().attr("id")).substring(3, 30);
        var firstcomplete = $(".input_" + AbsEntry).val().length;
        if (firstcomplete == 0) {
            $(this).addClass("first_found"); // Primera palabra ha sido encontrada

            if (count0 == 0) { element_found = $("#qty_ticket_" + AbsEntry); };
            count0++;
            $.each(words.split(" "), function(i, word) {
                var upper_word = $.trim(word.toUpperCase());

                if (i > 0) {
                    $(".buscar_" + AbsEntry + ":contains('" + upper_word + "')").each(function() {
                        var complete = $(".input_" + AbsEntry).val().length;
                        if (complete == 0) {
                            $(this).addClass("second_found");
                            if (count1 == 0) {
                                element_found = $("#qty_ticket_" + AbsEntry);
                            }
                            count1++;
                        }
                    });
                }
            });
        }
    });
    if (count0 > 0) {
        $("#msg").html(count0 + " - " + count1 + " coincidencias / ");
        var position_top = element_found.position().top;
        //var tabletop = $(".tabla").position().top;

        var k_pos = 100; // Arbitrarian Const 200 px
        $(".fixed-table-container-inner").animate({ scrollTop: position_top - k_pos }, 200, function() {
            element_found.focus().select();
        });


    } else {
        $("#msg").html("0 coincidencias");
    }
}
// Mod JACK
var index = 0;

function buscar() {
    $("#msg").html("Buscando...");
    $(".first_found").removeClass("first_found");
    $(".second_found").removeClass("second_found");
    var count0 = 0;
    var count1 = 0;
    index = 0;
    $("#index").text(index+1);
    var words = $.trim($("#search_q").val()).split(" ");
        //var bagSearch = (words.length > 1) ? '.bag' : '';
    if(words != ""){
        var first_word = $.trim((words[0]).toUpperCase());

         var bagSearch = (words.length >10) ? '.bag' : '';

        var element_found = "";

        $('tr.producto td' + bagSearch + ':contains("' + first_word + '")').each(function() {
            if (($.trim($(this).text()) === first_word && words.length > 1) || words.length === 1) {

                var AbsEntry =$($(this).parent()).attr("data-lote");
                var firstcomplete = $(".input_" + AbsEntry).val();
                var fPorCompletar = $("input#porCompletar").is(":checked");

                if ((eval(firstcomplete)===undefined && fPorCompletar) || !fPorCompletar) {
                    $(this).addClass("first_found"); // Primera palabra ha sido encontrada

                    if (count0 == 0) { element_found = $("#qty_ticket_" + AbsEntry); };
                    count0++;
                    $.each(words, function(i, word) {
                        var upper_word = $.trim(word.toUpperCase());

                        if (i > 0) {
                            $(".buscar_" + AbsEntry + ":contains('" + upper_word + "')").each(function() {
                                var complete = $(".input_" + AbsEntry).val().length;
                                if (complete == 0) {
                                    $(this).addClass("second_found");
                                    if (count1 == 0) {
                                        element_found = $("#qty_ticket_" + AbsEntry);
                                    }
                                    count1++;
                                }
                            });
                        }
                    });
                }
            }
        });
        if (count0 > 0) {
            $("#msg").removeClass("error");
            $("#msg").addClass("info");
            if(count1 > 0){            
               $("#msg").html("   "+count0 + " coincidencias " + count1 + " sub coincidencias");
            }else{
                $("#msg").html("   "+count0 + " coincidencias " );
            }        
            resSig();
        } else {    
            $("#msg").addClass("error");    
            $("#msg").html("0 coincidencias");
        }
    }
}
function hideDesigns() {
    $("#designs_container").fadeOut();
}
function setQtyTicket(){ 
    var bqty_ticket = $("#bqty_ticket").val();
    if(!isNaN(bqty_ticket)){ 
        $("#qty_ticket_"+getId()).val(bqty_ticket);
        $("#bkg_desc").focus();
    }
}
function setKg(){
    var bkg_desc = parseFloat($("#bkg_desc").val());
    if(!isNaN(bkg_desc)){         
        $("#kg_desc_"+getId()).val(bkg_desc);
        $("#bgramaje_m").focus();
        setTimeout(showKeyPad("bgramaje_m"),500);
    }
}
function setAncho(){
    var bancho = $("#bancho").val();
    if(!isNaN(bancho)){        
        $("#ancho_real_"+getId()).val(bancho);
        $("#bgramaje_m").focus();
    }
}
function setGramaje(){
    var bgramaje_m = $("#bgramaje_m").val();
    if(!isNaN(bgramaje_m)){        
        $("#gramaje_"+getId()).val(bgramaje_m);
        $("#save_img").focus();
    }
}
function moveKeyBoard(){
    var left = $("#search_bar").position().left;
    var top = $("#search_bar").position().top;
    var height = $("#search_bar").height();
    var ypos = top + height;
    $("#n_keypad").css({left:left,top:ypos}); 
}
function capturarKg(){     
    leerDatosBalanza(getId());    
}
function imprimirLoteEntrada(){    
     var qty = $("#qty_ticket_"+getId()).val();
     if(qty != ""){
        $("#print_"+getId()).trigger("click");
     }else{
         alert("Guarde los datos antes de Imprimir!");
     }
}
function getId(){
    return  $(".current").attr("id").substring(3,60);    
}
function showKeyPad(id){
    
    if($("#num_keyb").is(":checked")){
       var function_name = $("#"+id).attr("onchange").substring(0,$("#"+id).attr("onchange").indexOf("()"));
       var fn =  eval(function_name);
       showNumpad(id,fn,false); 
       moveKeyBoard();
    }
}
function selectQuantity(id){
    setCurrentLine(id);
    $(".qtySelected").removeClass("qtySelected");
    $("#each_quty_"+id).addClass("qtySelected");    
    $("#fracc").fadeIn(function(){       
        setTimeout('$("#fracc").fadeOut()',6000);
        if($("#fracc_form").is(":visible")){
           $("#fracc").trigger("click"); 
        }
    });
}

function fraccionarUI(){
    var id = getId();
    var x = $("#each_quty_"+id).offset().left;
    var y = $("#each_quty_"+id).offset().top;
    var ypos = y + $("#each_quty_"+id).height(); 
    $("#fracc_form").offset({left:x,top:ypos}); 
        
    $("#fracc_form").fadeIn(function (){        
        var lote = $("#lote_"+id).html();
        var cant = $("#each_quty_"+id).html();
        $("#fracc_lote").html(lote);
        $("#fracc_cant").html(cant);
    });
    var lote = $("#lote_"+id).html();
    $.ajax({
        type: "POST",
        url: "compras/Descarga.class.php",
        data: {"action": "verificarOrdenProcesamiento", lote: lote},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {   
           var cant = data[0].cant;
           if(cant > 0 ){
               $("#button_frac").prop("disabled",true);
               alert("Lote con orden de Procesamiento,contactar con compras para eliminar orden de procesamiento");
               $("#msg").html("Lote con orden de Procesamiento."); 
           }else{
              $("#button_frac").prop("disabled",false);
              $("#msg").html("");
           }   
        }
    });
    
}
function fraccionar(){
    var cantidades = $.trim( $("#fracciones").val());
    var id_ent =  $("#nro_compra").val();
    $.ajax({
        type: "POST",
        url: "compras/Descarga.class.php",
        data: {"action": "fraccionar",id_ent:id_ent, id_det: getId(),cantidades:cantidades},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        success: function (data) {                
            var estado = data.Estado;
            if(estado == "Ok"){
                alert("Fraccionamiento correcto, volviendo a filtrar para ver los resultados...");
                $(".fracc_data").html("").val("");                
                $("#fracc_form").fadeOut();
                filtrar();
                $("#msg").html(""); 
            }else{                
                $("#msg").html("Error al Fraccionar"); 
            }            
            
        }
    });
}
function sumarFracciones(){
    var cant_orig = parseFloat($("#fracc_cant").html());
    var qtys = $("#fracciones").val().split("\n");
    var sum = 0;
    $.each(qtys,function(){sum+=parseFloat(this) || 0;});    
    $("#fracc_suma").html(sum);
    if(sum > cant_orig){
         $("#fracc_suma").addClass("sobrefraccion");  
    }else{
        $("#fracc_suma").removeClass("sobrefraccion"); 
    }
}
function cerrarFracForm(){
    $("#fracc_form").fadeOut();
}
function setCurrentLine(id){
    $(".current").removeClass("current");
    $("#tr_"+id).addClass("current");
}
function resAnt() {
    $(".current").removeClass("current");
    $($($(".first_found")).parent()).removeClass("current");
    var container = $(".fixed-table-container-inner");
    //var scrollTo = $($(".first_found").get(index));
    var target = ($(".second_found").length>0)?$(".second_found"):$(".first_found");
    var scrollTo = ($(".second_found").length>0)?$($(".second_found").get(index)) : $($(".first_found").get(index));
    if(scrollTo.length > 0){
        $(scrollTo.parent()).addClass("current");
        $("#index").text(index+1);
        container.scrollTop(
            scrollTo.offset().top - container.offset().top + container.scrollTop()        
        );
        $($(scrollTo.parent()).find("[id^=qty_ticket_]")).focus().select();
        //index = (index === 0) ? $(".first_found").length - 1 : index - 1;
        index = (index === 0) ? target.length - 1 : index - 1;
    }
}

function resSig() {
    $(".current").removeClass("current");
    $($($(".first_found")).parent()).removeClass("current");
    var container = $(".fixed-table-container-inner");
    //var scrollTo = $($(".first_found").get(index));
    var target = ($(".second_found").length>0)?$(".second_found"):$(".first_found");
    var scrollTo = ($(".second_found").length>0)?$($(".second_found").get(index)) : $($(".first_found").get(index));
    if(scrollTo.length > 0){
        $(scrollTo.parent()).addClass("current");
        $("#index").text(index+1);
        container.scrollTop(
            scrollTo.offset().top - container.offset().top + container.scrollTop()
        );
        $($(scrollTo.parent()).find("[id^=qty_ticket_]")).focus().select();
        //index = (index === 0) ? $(".first_found").length - 1 : index - 1
        index = (index + 1 === target.length) ? 0 : index + 1;
    }
}

function mostrarBotonFinalizar() {
    $("#cerrar").fadeIn("fast");
    setTimeout('$("#cerrar").fadeOut()', 6000);
}
function guardarTodo(){
    $(".msg_complete").trigger("click");
}

function finalizar() {
    // Controlar que todo este Correcto
    $("#cerrar").attr("disabled", true);
    setTimeout('$("#cerrar").removeAttr("disabled")', 6000);
    
    var nro_compra = $("#nro_compra").val();

    $.ajax({
        type: "POST",
        url: "compras/Descarga.class.php",
        data: { "action": "controlarEntradaMercaderiasNoDescargadas", "usuario": getNick(), nro_compra: nro_compra },
        async: true,
        dataType: "json",
        beforeSend: function() {
            $("#msg_cab").fadeIn();
            $("#msg_cab").html("<img src='img/loading_fast.gif' width='16px' height='16px' >&nbsp;Controlando mercaderias no procesadas...");
        },
        success: function(data) {
            var no_procesados = data[0].no_procesados;
            var no_recibidos = data[0].no_recibidos;
            var recibidos = data[0].recibidos;
            var total = data[0].total;
            var en_stock = data[0].en_stock;
            $("#msg_cab").html("<b>Total: </b>" + total + "   <b>Recibidos: </b>" + recibidos + "  <b>No recibidos:</b>" + no_recibidos + "  <b>No Procesados:</b>" + no_procesados+"  Stock: "+en_stock+"/"+total);
            $("#msg_cab").removeClass("msg_info");
            if (no_procesados > 0) {
                errorMsg("Hay " + no_procesados + "  mercaderias sin procesar, en caso de no recibir debe filtrar y marcarlas como 'No recibida' para ajustar el Stock", 15000);
                $("#set_no_recibido").fadeIn();
            } else if(total > en_stock) {
                errorMsg("No ha recibido el total de piezas de la factura. Recibidos  "+en_stock+"/"+total, 30000);
            }else {               
                infoMsg("Ok, puede Cerrar la descarga", 10000);
                $("#cerrar_descarga").fadeIn();
            }
        },
        error: function() {
            $("#msg_cab").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });
}

function noRecibida() {
    var c = confirm("Confirme que no ha recibido las mercaderias que no estan con los datos completos");
    if (c) {
        $(".producto").each(function() {      
            var AbsEntry = $(this).prop("id").substring(3, 16);
            var qty_ticket = parseFloat($("#qty_ticket_" + AbsEntry).val());
            var kg_desc = parseFloat($("#kg_desc_" + AbsEntry).val());
            if (isNaN(qty_ticket) && isNaN(kg_desc) ) {
                saveLine(AbsEntry, "No");
            }
        });
        $("#set_no_recibido").attr("disabled", true);
    } else {
        $("#set_no_recibido").fadeOut();
    }
}

function recepcionCompleta() {
    $("#cerrar_descarga").attr("disabled", true);
     
    var nro_compra = $("#nro_compra").val();
    $.ajax({
        type: "POST",
        url: "compras/Descarga.class.php",
        data: { "action": "cambiarEstado", "usuario": getNick(), nro_compra: nro_compra,estado:"Recibida" },
        async: true,
        dataType: "html",
        beforeSend: function() {
            $("#msg_cab").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
        },
        complete: function(objeto, exito) {
            if (exito == "success") {
                var result = $.trim(objeto.responseText);
                if(result == "Ok"){                   
                    $("#msg_cab").html(result);
                    setTimeout("showMenu()", 4000);                   
                }else{
                    $("#msg_cab").html(result);
                    var ventana;
                    $.post("compras/Descarga.class.php",{ "action": "lotesSinFotos", "nro_compra": nro_compra},function(lista){
                    var table = $("<table/>").css({
                        "border-collapse":"collapse",
                        "margin":"0 auto"
                    });
                    var showCab = true;
                    lista.forEach(function(fila){
                        var columnas = 0;
                        var tr = $("<tr/>");
                        var trh = $("<tr/>");
                        $.each(fila, function(key,value){
                        if(showCab){
                            $("<th/>",{"text":key.replace(/_/g," ")}).appendTo(trh);
                            columnas ++;
                        }
                        $("<td/>",{"text":value}).appendTo(tr);
                        });
                        if(showCab){
                        $($("<tr/>").append($("<th>",{"colspan":columnas,"text":"Lotes Sin Foto"}))).appendTo(table);
                        trh.appendTo(table);
                        showCab = false;
                        }
                        tr.appendTo(table);
                    });
                    
                    var title="Lista de lotes sin Color";
                    var params = "width=800,height=760,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
                    
                    if(!ventana){
                        ventana = window.open('',title,params);
                    }else{
                        ventana.close();
                        ventana = window.open('',title,params);
                    }
                    ventana.document.title = title;
                    $("body",ventana.document).append(table);
                    $("th,td",ventana.document).css({"border":"solid 1px gray"});
                    $("th",ventana.document).css({"text-transform":"capitalize"});
                    
                    },"json");
                }
            }
        },
        error: function() {
            $("#msg_cab").html("Ocurrio un error en la comunicacion con el Servidor...");
        }
    });
}

function deducirGramaje(um, ancho, kg, cantidad) {
    var gramaje = 1;
    if (um === "Mts") {
        //console.log
        gramaje = redondear((kg * 1000) / (cantidad * ancho));
    } else if (um === "Yds") {
        gramaje = redondear((kg * 1000) / ((cantidad * 0.9144) * ancho));
    } else { //Unid
        gramaje = 1;
    }
    return gramaje;
}

function saveCurrentLine(){
    var AbsEntry = $(".current").attr("id").substring(3,60);
    saveLine(AbsEntry, "Si");
}
function completarGramaje(AbsEntry){
    var hash = $("#lote_"+AbsEntry).attr("data-hash");
    var gramaje = $("#gramaje_"+AbsEntry).val();
    var ancho_real = $("#ancho_real_"+AbsEntry).val();
    var tara = $("#tara_"+AbsEntry).val();
    
    $(".gram_"+hash).each(function(){
        var gram = $(this).val();
        var currentAbsEntry = $(this).attr("id").substring(8,60);
        if(gram === ""){
            $(this).val(gramaje);     
        }
        var ancho_estab = $("#ancho_real_"+currentAbsEntry).val();
          
        if(ancho_estab === ""){  
            $("#ancho_real_"+currentAbsEntry).val(ancho_real);
        }
        
        var tara_estab = $("#tara_"+currentAbsEntry).val();
        if(tara_estab === ""){
            $("#tara_"+currentAbsEntry).val(tara);
        }        
    });
 
    
}
function replaceRange(s, start, end, substitute) {
    return s.substring(0, start) + substitute + s.substring(end);
}

var actualizarPromedios = false;

function saveLine(AbsEntry, recibido) {
    var id_ent = $("#nro_compra").val();
    
    var each_quty  = parseFloat($("#each_quty_" + AbsEntry).html());
    var qty_ticket = $("#qty_ticket_" + AbsEntry).val();
    var kg_desc = $("#kg_desc_" + AbsEntry).val();
    var ancho = parseFloat($("#tr_" + AbsEntry).attr("data-ancho"));
    var ancho_real = $("#ancho_real_"+AbsEntry).val();
    var gramaje = $("#tr_" + AbsEntry).attr("data-gramaje"); // Solo para KG    
    var gramaje_muestra = $("#gramaje_" + AbsEntry).val();
    var tara = $("#tara_" + AbsEntry).val();
    
    var um_prod = $("#tr_" + AbsEntry).attr("data-um");
    var umc = $("#tr_" + AbsEntry + " :nth-child(8)").text();
    var estado = $("#estado").val();
    var codigo = $("#tr_" + AbsEntry).attr("data-codigo");
    var lote = $("#tr_" + AbsEntry + " :nth-child(9)").text();
    if(qty_ticket == ""){
        return;
    }
    
    /* 
    var an_min =   ancho - ((ancho * 10) / 100);
    var an_max =   ancho + ((ancho * 10) / 100);
     */
    // console.log(an_min +"  "+an_max+"     ancho_real  "+ancho_real);
    
    /*
    if(!(ancho_real > an_min && ancho_real < an_max)){
       var obss = $("#obs_" + AbsEntry).attr("data-obs");
       var posi = obss.indexOf("-|");
       var posf = obss.indexOf("|-");
         
       var newstr = " -| Ancho de carga: "+ancho+", Ancho Real Medido: "+ancho_real+" |- ";
       var remplazar = replaceRange(obss, posi-1, posf+2,"");
        
       $("#obs_" + AbsEntry).attr("data-obs",remplazar + newstr);
    }*/

    // Verificar Ancho
    var anRef = anchoRef(codigo);
    if (ancho_real.trim() !==''){
        var anch = (anRef.ancho_real==0)?parseFloat($("#tr_" + AbsEntry).data("ancho")):anRef.ancho_real;  
        var rango = (anRef.rango == 0)?((anch*10)/100):anRef.rango; 
        var an_max =   parseFloat((anch + rango).toFixed(2));
        var an_min =   parseFloat((anch - rango).toFixed(2));
        var currentAncho = $($("#tr_" + AbsEntry).find("[id^=ancho_real_]"));
        //console.log("Ancho: "+anch+"   an_min "+an_min+"    max "+an_max  );
        if((parseFloat(ancho_real)>an_max || parseFloat(ancho_real)<an_min) && !currentAncho.hasClass("ignorar")){
            var mensaje = "Alerta Ancho Fuera de Rango!\nEl el valor ingresado esta fuera de rango habitual para este producto\nMin:"+an_min+"  Max:"+an_max+", Promedio:"+anch+"\nConfirme que el valor es correcto";
            if(confirm(mensaje)){
                currentAncho.addClass("ignorar");
                actualizarPromedios = true;
            }else{
                setTimeout(function(){
                    currentAncho.val('');
                    currentAncho.focus().select();
                },500);
                return;
            }
        }
    }
    if(anRef.ancho_real === 0){
        actualizarPromedios = true;
    }

    // Verificar gramaje
    var grmRef = gramajeRef(codigo);
    if (gramaje_muestra.trim() !==''){
        var grm = (grmRef.gramaje_m == 0)?parseFloat($("#tr_" + AbsEntry).data("gramaje")):grmRef.gramaje_m;
        var rango = (grmRef.rango == 0)?((grm*10)/100):grmRef.rango;
        var grm_max =   parseFloat((grm +rango).toFixed(2));
        var grm_min =   parseFloat((grm -rango).toFixed(2));
        var currentGramajeM = $($("#tr_" + AbsEntry).find("[id^=gramaje]"));

        //console.log("Gramaje: "+grm+"   an_min "+grm_min+"    max "+grm_max  );
        
        if((parseFloat(gramaje_muestra)>grm_max || parseFloat(gramaje_muestra)<grm_min) && !currentGramajeM.hasClass("ignorar")){
            var mensaje = "Alerta Gramaje Fuera de Rango!\nEl el valor ingresado esta fuera de rango habitual para este producto\nMin:"+grm_min+"  Max:"+grm_max+"  , Promedio:"+grm+"\nConfirme que el valor es correcto";
            if(confirm(mensaje)){
                currentGramajeM.addClass("ignorar");
                actualizarPromedios = true;
            }else{
                setTimeout(function(){
                    currentGramajeM.val('');
                    currentGramajeM.focus().select();
                },500)
                return;
            }
        }
    }
    if(grmRef.gramaje_m === 0){
        actualizarPromedios = true;
    }
    
    var obs = $("#obs_" + AbsEntry).attr("data-obs");
     
    var each_quty_min = each_quty - (each_quty * 20 / 100);
    var each_quty_max = each_quty + (each_quty * 20 / 100);
    
    
    if(!( (qty_ticket > each_quty_min) && (qty_ticket < each_quty_max)) && (recibido == "Si")){
        alert("Qty Ticket Fuera del Rango del 20% sobre E.Qty,   Q.Ticket no se encuentra entre   "+each_quty_min.toFixed(2) + "  y "+each_quty_max);
        return;
    }

    if (umc != "Kg") {
        gramaje = deducirGramaje(umc, ancho, kg_desc, qty_ticket);
        //console.log(gramaje);
    }
    var currents = $(".current").length;
    
    if(currents == 1 || recibido == "No"){
      if (estado === "En_Transito") {

        if ((qty_ticket > 0 && kg_desc > 0 &&  gramaje_muestra > 0 && ancho_real > 0) || (recibido == "No")) {

            if (kg_desc > 200) {
                $("#kg_desc_" + AbsEntry).parent().addClass("error_field");
                errorMsg("Ha Ingresado un Kilaje muy alto favor corregir...", 8000);
            } else {
                $("#kg_desc_" + AbsEntry).parent().removeClass("error_field");

                $("#print_" + AbsEntry).removeAttr("disabled");
                var printed = $("#print_" + AbsEntry).val();
                $("#print_" + AbsEntry).focus();

                var start = new Date().getTime();

                $.ajax({
                    type: "POST",
                    url: "compras/Descarga.class.php",
                    data: { "action": "actualizarLote",id_ent:id_ent, usuario: getNick(), suc: getSuc(), AbsEntry: AbsEntry, qty_ticket: qty_ticket, kg_desc: kg_desc, ancho: ancho, gramaje: gramaje,gramaje_muestra:gramaje_muestra, obs: obs, printed: printed, um_prod: um_prod, umc: umc, codigo: codigo, lote: lote,ancho_real:ancho_real, recibido: recibido ,tara:tara},
                    async: true,
                    dataType: "html",
                    beforeSend: function() {
                        $("#msg_" + AbsEntry).html("<img src='img/loading_fast.gif' width='18px' height='18px' >");
                        $("#save_img").attr("src","img/clock.gif");
                        // $("#save_img").prop("disabled",true); 
                    },
                    complete: function(objeto, exito) {
                        if (exito == "success") {
                            var result = $.trim(objeto.responseText);
                            if (result == "1") {
                                var time = (new Date().getTime()) - start;
                                $("#msg_" + AbsEntry).html("<img src='img/ok.png' width='18px' height='18px' >");
                                $("#msg_" + AbsEntry).attr("title", "Procesamento en " + String(time) + " milissegundos...");
                                $(".input_" + AbsEntry).removeClass("parcial_complete");
                                $(".input_" + AbsEntry).addClass("complete");
                                $("#bqty_ticket").val("");
                                $("#bkg_desc").val("");
                                $("#bgramaje_m").val("");
                                $("#img_balanza").attr("src","img/balanza1.png");  
                                $("#print_barcode").focus(); 
                                completarGramaje(AbsEntry);
                            } else {
                                if(result != "0"){
                                    alert("ATENCION!: " + result + " en lote : "+ lote);     
                                }else{ 
                                   alert("ATENCION! Ocurrio un Error al tratar de guardar los datos del lote: " + lote);                                
                               }
                               $("#msg_" + AbsEntry).html("<img src='img/warning_red_16.png' width='18px' height='18px' >");     
                               $("#msg_" + AbsEntry).attr("title", result);
                               $(".input_" + AbsEntry).removeClass("complete");
                            }
                            $("#save_img").attr("src","img/save.png");
                            
                        }
                        if(actualizarPromedios){
                            promedioGramajeAncho();
                        }
                        $(".ignorar").removeClass("ignorar");
                    },
                    error: function() {
                        $("#msg_" + AbsEntry).html("<img src='img/warning_red_16.png' width='18px' height='18px' >");
                        $("#msg_" + AbsEntry).attr("title", "Error en la comunicacion con el Servidor...");
                        $(".input_" + AbsEntry).removeClass("complete");
                        alert("ATENCION! Ocurrio un Error al tratar de guardar los datos del lote: " + lote);
                    }
                });
            }
        }
    } else {
        alert("Compra en " + estado + " para Editar debe estar en 'Abierta'.");
    }
    }else{
        alert("Seleccione al menos una fila y no mas de una para Guardar.");
    }
}

function setObs(AbsEntry) {
    var estado = $("#estado").val();
    if (estado !== "En_Transito") {
        $("#observ").attr("disabled", true);
    } else {
        $("#observ").removeAttr("disabled");
    }
    actual_AbsEntry = AbsEntry;

    $(".tmp_obs").removeClass("tmp_obs");
    
    var p = $("#tr_" + AbsEntry);

    var h = $("#tr_" + AbsEntry).height();
    var tr = p.position();

    var obs = $("#obs_" + AbsEntry).attr("data-obs");
    $("#obs_" + AbsEntry).addClass("tmp_obs");
    $("#obs").slideDown("slow");
    $("#observ").val($.trim(obs));
    $('#obs').animate({ top: tr.top + h + 60 + "px" }, { queue: false, duration: 150 });
}

function saveObs() {
    var obs = $("#observ").val();
    $("#obs_" + actual_AbsEntry).attr("data-obs", obs);
    if (obs.length > 0) {
        $(".tmp_obs").html("...");
    } else {
        $(".tmp_obs").html("");
    }
    $("#obs").slideUp("fast");
    saveLine(actual_AbsEntry, "Si");
}

function closeObs() {
    $("#obs").slideUp("slow");
}

function imprimirCodigoBarras(AbsEntry, lote) {
   
    var id_ent = $("#nro_compra").val();
    var printer = $("#printers").val();
    var silent_print = $("#silent_print").is(":checked");
    var auto_close_window = $("#auto_close_window").is(":checked");
    var codigo = $("#tr_"+AbsEntry).attr("data-codigo");
    
    
    if (typeof(jsPrintSetup) == "object") {
        jsPrintSetup.setSilentPrint(silent_print);
    }

    $("#print_" + AbsEntry).removeClass("print");
    $("#print_" + AbsEntry).addClass("printed");
    var motivo = "Primera Impresion";

    var impresiones = $("#print_" + AbsEntry).val();
    if (impresiones > 0) {
        motivo = prompt('Motivo de la Re-Impresion');
        if(motivo == null){
            return false;
        }else{
            if((motivo.trim()).length == 0){
                do{
                    motivo = prompt('Debe especificar un Motivo!');
                }while(motivo != null && (motivo.trim()).length == 0);
                if(motivo == null){
                    return false;
                }
            }
        }
        /* var c = confirm("Este codigo ya se imprimio " + impresiones + " veces, esta seguro de que desea Reimprimir?");
        //errorMsg("Atencion! Remimpresion de codigo!",8000);
        if (!c) {
            return false;
        } */
    }
    if (impresiones == "") {
        impresiones = 0;
    }
    impresiones++;
    $("#print_" + AbsEntry).val(impresiones)
    saveLine(AbsEntry, "Si");

    var suc = getSuc();
    var usuario = getNick();

    var umc = $("#tr_" + AbsEntry).attr("data-umc");
    var quty_ticket = $("#qty_ticket_" + AbsEntry).val();
    if (umc == "Kg") {
        quty_ticket = $("#kg_desc_" + AbsEntry).val();
    } else if (umc == "Yds") {
        umc = "Mts";
        quty_ticket = redondear(parseFloat($("#qty_ticket_" + AbsEntry).val() * 0.9144));
    }
    var etiqueta_cuidados = $("#etiqueta_cuidados").is(":checked");
    var url = "barcodegen/BarcodePrinterDescargaLoteVirtual.class.php?id_ent="+id_ent+"&AbsEntry="+AbsEntry+"&lote=" + lote + "&codigo="+codigo+"&usuario=" + usuario + "&printer=" + printer + "&silent_print=" + silent_print + "&auto_close_window="+auto_close_window+"&etiqueta=etiqueta_10x5&umc=" + umc + "&cant_c=" + quty_ticket+"&etiqueta_cuidados="+etiqueta_cuidados+"&motivo="+motivo;
    var title = "Impresion de Codigos de Barras";
    var params = "width=800,height=480,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=yes";
    if (impresion_codigo_barras) {
        impresion_codigo_barras.close();
    }
    impresion_codigo_barras = window.open(url, title, params);
}

/**
 * @description Muestra numeros en formato ingles
 * @param {type} numero
 * @param {type} dec
 * @returns {Number}
 * 
 */
function formatoIngles(numero, dec) {
    if (dec == undefined) { dec = 2; }
    if (isNaN(numero) || numero == null || numero == '') {
        return 0;
    } else {
        return parseFloat(numero).format(dec, 12, "", ".");
    }
}

function formatoInglesOCero(numero, dec) {
    if (dec == undefined) { dec = 2; }
    if (isNaN(numero) || numero == 0) {
        return "";
    } else {
        return parseFloat(numero).format(dec, 12, "", ".");
    }
}

function enableNavigationByArrows() {
    $('#productos').unbind("keydown");
    $('#productos').off("keydown");

    $('#productos').keydown(function(e) {
        var $table = $(this);
        var $active = $('input:focus,select:focus', $table);
        var $next = null;
        var focusableQuery = 'input:visible,select:visible';
        var position = parseInt($active.closest('td').index()) + 1;


        switch (e.keyCode) {
            case 37: // <Left>
                $next = $active.parent('td').prev().find(focusableQuery);
                break;
            case 38: // <Up>                    
                $next = $active.closest('tr').prev().find('td:nth-child(' + position + ')').find(focusableQuery);
                break;
            case 39: // <Enter>                 
                $next = $active.closest('td').next().find(focusableQuery);
                break;
            case 40: // <Down>
                $next = $active.closest('tr').next().find('td:nth-child(' + position + ')').find(focusableQuery);
                break;
            case 13: // <Enter>    
                focusableQuery = 'input';
                $next = $active.closest('td').next().find(focusableQuery);
                //console.log("Next: "+$next.attr("id")+"  Active: "+$active.attr("id"));
                break;
        }

        if ($next && $next.length) {            
            $next.focus();
            var nextID = $next.attr("id");
            if(nextID.substring(0,6) == "print_"){
                $next.trigger("click");
            }
            
        }
        //var hora = Date().split(" ")[4];
        //console.log(hora);
    });
}

function onlyNumbers(e) {
    //e.preventDefault();
    var tecla = new Number()

    if (window.event) {
        tecla = e.keyCode;
    } else if (e.which) {
        tecla = e.which;
    } else {
        return true;
    }

    if (tecla === "13") {
        return false;
    }

    if ((tecla >= "97") && (tecla <= "122")) {
        return false;
    }
}

function onlyNumbersAndCaptureKg(e, id) {
    //e.preventDefault();
    var tecla = new Number();
    //console.log("tecla "+tecla);
    if (window.event) {
        tecla = e.keyCode;
    } else if (e.which) {
        tecla = e.which;
    } else {
        return true;
    }
    /* No es necesario esto
    if (tecla == "13") {
        if (id.substring(0, 8) == "kg_desc_") {
            var print_id = id.substring(8, 20); 
            $("print_" + print_id).focus();
        }
    }*/
    //console.log(e.keyCode+"  "+ e.which);
    tecla = parseInt(tecla);
    if ((tecla >= 64) && (tecla <= 122)) {
        //console.log(e.keyCode + " Tecla " + tecla);
        if (tecla == 67) { // c or C 
            leerDatosBalanza(id);
            return false;
        }
        return false;
    }

}

function stringify(str) {
    if (str == null) {
        return "";
    } else {
        return str;
    }
}


function leerDatosBalanza(id) {
    var min_kg_desc = parseFloat($("#min_kg_desc").val());
    $("#" + id).val("- - - - -");

    intentos++;
    var ip_domain = $("#ip").val();
       $("#img_balanza").attr("src","img/balanza2.png");  

    $.ajax({
        url: "http://" + ip_domain + "/serial/Indicador_LR22.php",
        dataType: "jsonp",
        jsonp: "mycallback",
        success: function(data) {
            var kg = data.peso;
            var estado = data.estado;
            var kilogramo = parseFloat(kg);
            if (estado == "estable" && kilogramo > min_kg_desc) {
                if (kg == "") {
                    if (intentos < 5) {
                        leerDatosBalanza(id);
                    } else {
                        intentos = 0;
                    }
                } else {
                    $("#bkg_desc").val(parseFloat(kg));
                    $("#kg_desc_" + id).val(kg); 
                    $("#" + id).css("color", "green");
                    $("#" + id).css("background-color", "white");
                    setKg();
                }
                $("#img_balanza").attr("src","img/balanza3.png");  
            } else {
                $("#" + id).val("");
                $("#" + id).css("background-color", "red");
                $("#" + id).select();
                errorMsg("Lectura de Balanza Inestable!", 8000);
                $("#img_balanza").attr("src","img/balanza1.png");  
                if(kilogramo <= min_kg_desc){
                    $(".not_found").trigger('play');      
                }
            }
        }

    });

}
/*
function foto(lote,AbsEntry){
     var estado = $("#estado").val();
    
    if(estado === "En Transito"){
        var reply = true; 
        var AbsEntrys = "";
        if($("#reply").is(":checked")){
            var h = $("#lote_"+AbsEntry).attr("data-hash");
            $(".lote_"+h).each(function(){

                var abse= $(this).parent().attr("id").substring(3,40);  
                AbsEntrys = AbsEntrys+","+abse;
            });
            AbsEntrys = AbsEntrys.substring(1,AbsEntrys.length);
        }else{
            AbsEntrys = AbsEntry;
            reply = false;
        }       
        window.open("compras/Camara.class.php?lote="+lote+"&AbsEntry="+AbsEntry+"&AbsEntrys="+AbsEntrys+"&reply="+reply,"Captura de Imagen","width=1020,height=760,scrollbars=yes");
    }else{
       alert("Compra en "+estado+" para Editar debe estar en 'En Transito'.");
    }
 }*/
function contarCaracteres() {
    var cant = $("#observ").val().length;
    var rest = 200 - cant;
    $("#rest").text(rest + " restantes");
}

function scrollWindows(pixels) {
    $('html,body').animate({
        scrollTop: pixels
    }, 250);
}

function configurePrinter() {
    if(typeof( jsPrintSetup ) == "object") {  
        if(jsPrintSetup.getPrintersList() == null){
            alert("Sr. Usuario haga clic en el boton 'Permitir' que se encuentra en la parte superior derecha, y recargue la pagina.");
            return;
        } 
        var printer_list = (jsPrintSetup.getPrintersList()).split(",");
        $.each(printer_list,function(number){
           $("#printers").append('<option>'+printer_list[number]+'</option>');
        });      
        //jsPrintSetup.definePaperSize(100, 100, "Etiqueta_Marijoa_6x4", "Etiqueta_Marijoa_6x4", "Etiqueta_Marijoa_6x4", 60, 40, jsPrintSetup.kPaperSizeMillimeters);  
      
   
        jsPrintSetup.definePaperSize(101, 101, "Custom", "Etiqueta_Marijoa 10x5", "Etiqueta Marijoa 10x5", 100, 50, jsPrintSetup.kPaperSizeMillimeters); 
        jsPrintSetup.setPaperSizeData(101);
      
        var printer = getCookie("printer").sesion;
        $("#printers").val(printer);

        var sp =  getCookie("silent_print").sesion ;
        if(sp == "true"){
           $("#silent_print").prop("checked",true); 
        }else{
           $("#silent_print").prop("checked",false); 
        }

        $("#silent_print").click(function(){
          var print_silent = $(this).is(":checked"); 
          setDirectPrint();
          jsPrintSetup.setSilentPrint(print_silent);          
        });
        
        var ac =  getCookie("auto_close_window").sesion ;
        if(ac == "true"){
           $("#auto_close_window").prop("checked",true); 
        }else{
           $("#auto_close_window").prop("checked",false); 
        }
        
        $("#auto_close_window").click(function(){
          var auto_close_window = $(this).is(":checked"); 
          setAutoClosePrinter(); 
        });
        
   
    }else{       
       //alert("Este navegador necesita de un Plug in 'js print setup' para mejor funcionamiento, se abrira una ventana para instalarlo presione permitir, posteriormente reinicie su navegador y vuelva a intentarlo, si el problema persiste contacte con el administrador del sistema :D");
       //var jsps = "https://192.168.2.252/tools/pc_esscentials/navegadores/moz_addon/js_print_setup-0.9.5.1-fx.xpi";
       //window.open(jsps,'_blank', 'width=500,height=160');       
    } 
}

function getDesigns() {
      var codigo = $("#filtro_articulo").val();   
      var nro_compra = $("#nro_compra").val();
     $.ajax({
         type: "POST",
         url: "compras/Descarga.class.php",
         data: {"action": "getDesigns",nro_compra:nro_compra, codigo: codigo},
         async: true,
         dataType: "json",
         beforeSend: function () {             
            $("#loading_design").fadeIn();
         },
         success: function (data) {   
             $(".design_filter").remove();
             for (var i in data) {                  
                 var design = data[i].design;
                 $("#filtro_desing").append("<option class='design_filter' value='"+design+"'>"+design+"</option>");                 
             }  
             getStoreNo();
             $("#loading_design").fadeOut();
             $("#msg").html(""); 
         }
     }); 
}
function getStoreNo() {
      var codigo = $("#filtro_articulo").val();   
      var nro_compra = $("#nro_compra").val();
      var design = $("#filtro_desing").val();
       
     $.ajax({
         type: "POST",
         url: "compras/Descarga.class.php",
         data: {"action": "getStoreNo",nro_compra:nro_compra, codigo: codigo,design:design},
         async: true,
         dataType: "json",
         beforeSend: function () {             
            $("#loading_store").fadeIn();
         },
         success: function (data) {   
             $(".filtro_mar").remove();
             for (var i in data) {                  
                 var store_no = data[i].store_no;
                 $("#filtro_mar").append("<option class='filtro_mar' value='"+store_no+"'>"+store_no+"</option>");                 
             }  
             getColorDesc();
             $("#loading_store").fadeOut();
             $("#msg").html(""); 
         }
     }); 
}

function getColorDesc() {
      var codigo = $("#filtro_articulo").val();   
      var nro_compra = $("#nro_compra").val();
      var design = $("#filtro_desing").val();
      var store_no = $("#filtro_mar").val();
       
     $.ajax({
         type: "POST",
         url: "compras/Descarga.class.php",
         data: {"action": "getColorDesc",nro_compra:nro_compra, codigo: codigo,design:design,store_no:store_no},
         async: true,
         dataType: "json",
         beforeSend: function () {             
            $("#loading_color_desc").fadeIn();
         },
         success: function (data) {   
             $(".q_color_desc").remove();
             for (var i in data) {                  
                 var color_desc = data[i].color_desc;
                 $("#q_color_desc").append("<option class='q_color_desc' value='"+color_desc+"'>"+color_desc+"</option>");                 
             }  
             getColorCom();
             $("#loading_color_desc").fadeOut();
             $("#msg").html(""); 
         }
     }); 
}
function getColorCom() {
      var codigo = $("#filtro_articulo").val();   
      var nro_compra = $("#nro_compra").val();
      var design = $("#filtro_desing").val();
      var store_no = $("#filtro_mar").val();
      var color_desc = $("#q_color_desc").val();
      
     $.ajax({
         type: "POST",
         url: "compras/Descarga.class.php",
         data: {"action": "getColorComercial",nro_compra:nro_compra, codigo: codigo,design:design,store_no:store_no,color_desc:color_desc},
         async: true,
         dataType: "json",
         beforeSend: function () {             
            $("#loading_color_com").fadeIn();
         },
         success: function (data) {   
             $(".q_color_com").remove();
             for (var i in data) {                  
                 var color_com = data[i].color;
                 $("#q_color_com").append("<option class='q_color_com' value='"+color_com+"'>"+color_com+"</option>");                 
             }  
             $("#loading_color_com").fadeOut();
             $("#msg").html(""); 
         }
     }); 
}

function selectDesigns(ObjTarget) {
     
    if (!loadDesings) {
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: { "action": "getDesignsImages" },
            async: true,
            dataType: "json",
            beforeSend: function() {
                $("#msg").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");
            },
            success: function(data) {
                //console.log(data);
                for (var i in data) {
                    var key = data[i].key;
                    var name = data[i].name;
                    var thums = data[i].thumnails;
                    var ul = '<ul id="' + key + '" data-name="' + name + '" >';
                    for (var i = 0; i < thums.length; ++i) {
                        var img = thums[i];
                        var class_ = "";
                        if (i == 0) {
                            class_ = "class='lastitem'";
                        }
                        ul += '<li ' + class_ + '><img title="' + name + '" src="img/PATTERNS/' + key + '/' + img + '" height="46"  ></li>';
                    }

                    ul += '</ul>';
                    $("#designs_container").append(ul);
                    //console.log(key+"  "+name+"  "+thums);

                }
                $("#designs_container li").click(function() {
                    var name = $(this).parent().attr("data-name");     
                    $("#design").val(name);
                    $("#designs_container").fadeOut();
                });
                loadDesings = true;
                $("#msg").html("");
            }
        });
    }
    var window_width = $(document).width() / 2;
    var desing_width = $("#designs_container").width() / 2;
    var posx = (window_width - desing_width);
    posx = posx + "px";
    $("#designs_container").css({ left: posx, top: 50 });
    $("#designs_container").fadeIn();
}

function zoomImage(){
    var w = $("#zoom_range").val();    
    $("#image_container").width(w);
    $("#img_zoom").width(w);    
}
function cargarImagenLote(img){   
    $("#image_container").html("");
    var images_url = $("#images_url").val();
    
    var cab = '<div style="width: 100%;text-align: right;background: white;">\n\
        <img src="img/substract.png" style="margin-top:-4px"> <input id="zoom_range" onchange="zoomImage()" type="range" name="points"  min="60" max="1000"><img src="img/add.png" style="margin-top:-4px;">\n\
        <img src="img/close.png" style="margin-top:-18px;margin-left:100px" onclick=javascript:$("#image_container").fadeOut()>\n\
    </div>';
    
    $("#image_container").fadeIn();
    
    
    var left = ($(document).width()/2) - 250; 
    var top = 100;
    
    $("#image_container").offset({left:left,top:top});
    var path = images_url+"/"+img+".jpg";
    
    var img = '<img src="'+ path +'" id="img_zoom" onclick=javascript:$("#image_container").fadeOut() width="500" >';
    $("#image_container").html( cab +" "+ img);
    $("#image_container").draggable();
}
function sincronizarImagenesFaltantes(){
    var ids = new Array();
    $(".no_image").each(function(){
         var AbsEntry = $(this).attr("id").substring(7,20);          
         ids.push(AbsEntry);         
    }); 
    var nro_compra = $("#nro_compra").val();
    ids = JSON.stringify(ids);
    $.ajax({
        type: "POST",
        url: "compras/Descarga.class.php",
        data: {"action": "sincronizarImagenesFaltantes", ids: ids,nro_compra:nro_compra},
        async: true,
        dataType: "json",
        beforeSend: function () {
           $(".rotate").attr("src","img/loading_fast.gif");
        },
        success: function (data) {   
            for (var i in data) { 
                var id = data[i].id;
                var img = data[i].img;                 
                if(img != null){
                    $("#codigo_"+id).append( "<img src='img/image.png' title='"+img+".jpg' onclick=cargarImagenLote('"+img+"')  style='cursor:pointer;' >"); 
                    $("#codigo_"+id).removeClass("no_image");
                }
            }   
            $(".rotate").attr("src","img/refresh-32.png");
        }
    });
}

/*
function verFoto(lote,AbsEntry){
    $("#img_viewer").html("<img src='files/prod_images/"+lote+".jpg' width='200' height='140'>");
    
    var p  = $(".img_"+AbsEntry);
    var h = $(".img_"+AbsEntry ).height(); 
    $("#img_viewer").slideDown("slow");   
    
    var p = $(".img_"+AbsEntry ); 
    var h = $(".img_"+AbsEntry ).height();
    var im = p.position();  
    $('#img_viewer').animate({top: im.top + h +60+"px",left:im.left - 200 +"px" },{queue: false, duration: 150}); 
    $(".tmp_obs").removeClass("tmp_obs");
    $(".img_"+AbsEntry).addClass("tmp_obs"); 
}
*/

/**
 * Control ancho, gramaje
 */
var promedios = {};

function promedioGramajeAncho(){
    var param = {
        "action":"promedioAnchosGramajes",
        "id_ent":$("#nro_compra").val()
    };
    promedios = {};
    $.post("compras/Descarga.class.php",param,function(data){
        promedios = data;
        actualizarPromedios = false;
    },"json");
}
// Devuelve el promedio de los anchos registrados
function anchoRef(codigoArticulo){
    if(promedios[codigoArticulo].anchos.promedioDown.lotes > promedios[codigoArticulo].anchos.promedioUp.lotes){
        return promedios[codigoArticulo].anchos.promedioDown;
    }else{
        return promedios[codigoArticulo].anchos.promedioUp;
    }
}
// Devuelve el promedio de los gramajes registrados
function gramajeRef(codigoArticulo){
    if(promedios[codigoArticulo].gramajes.promedioDown.lotes > promedios[codigoArticulo].gramajes.promedioUp.lotes){
        return promedios[codigoArticulo].gramajes.promedioDown;
    }else{
        return promedios[codigoArticulo].gramajes.promedioUp;
    }
}
function modificarGramajeUI(){
    if(filtroXColor){
        //$("#modif_gram").fadeIn();
        $('#actual_gramaje').val($('[id^="gramaje_"]').val());
        $("#modif_gram").slideDown(function (){
          var es = ($(document).width() / 2 ) - $("#modif_gram").width() / 2; 
          $("#modif_gram").offset({left:es,top:100}); 
        });
    }else{
       errorMsg("Debe filtrar por color para poder modificar los gramajes",10000);
    }   
}

function modificarGramaje(){
 var gramaje_actual = $('#actual_gramaje').val();
 var gramaje_nuevo = parseFloat($('#nuevo_gramaje').val());   
 
 if(gramaje_nuevo > 0 ){
     
    var c = confirm("Confirme modificar todos los valores de gramaje que tienen "+gramaje_actual+" por:  "+gramaje_nuevo); 
    if(c){
        $('[id^="gramaje_"]').each(function(){
          var v = $(this).val();     
          if(v == gramaje_actual){    
              var id = $(this).attr("id").substring(8,60); 
              $(this).val(gramaje_nuevo); 
              saveLine(id,"Si");
          }
        });   
    }
 }
}
function cancelarModificarGramaje(){    
    $('#actual_gramaje').val("");
    $('#nuevo_gramaje').val(""); 
    $("#modif_gram").slideUp();
}

function cambiarBalanza(){
  var ip = $("#balanza").val();   
  setCookie("balanza",ip,365);
}
function cambiarMetrador(){
  var ip = $("#metrador").val();   
  setCookie("metrador",ip,365);
  puertos();  
}
function cambiarImpresora(){
    var printer = $("#printers").val();
    setCookie("printer",printer,365);
}
function setDirectPrint(){
    var checked = $("#silent_print").is(":checked");
    setCookie("silent_print",checked,365);
}
function setAutoClosePrinter(){
    var checked = $("#auto_close_window").is(":checked");
    setCookie("auto_close_window",checked,365);
}