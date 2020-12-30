var selected_currency = "";
var nro_pedido = 0;
var selected_invoice = "";
var selected_provider = "";

var actual_row = 0;
var actual_qty = 1;
   
var tipo_insersion = "insert";

function configurar(){
    $("#shipmenttable").dataTable({
      "pageLength": 50,
      "autoWidth": false,
      "lengthMenu": [ [5,10, 25, 50, 75,100,150,200,-1], [5,10, 25, 50,75,100,150,200, "All"] ],
      "order": [[ 0, 'asc' ], [ 4, 'dsc' ], [ 1, 'asc' ]],
      "columnDefs": [  { "width": "10%","type": "html"}  ],
      select: {
        blurable: true
      }
    });
    $("#shipmenttable_length").append("&nbsp;&nbsp;&nbsp;<b>Select Currency:</b>&nbsp;&nbsp; \n\
    <label style='font-size:16px;font-weight:bold'>Y$</label> &nbsp;<input type='radio' name='currency' value='Y$' onclick='selectCurrency()' >&nbsp;&nbsp;<label style='font-size:16px;font-weight:bold'>U$</label>&nbsp;<input type='radio' name='currency' value='U$' onclick='selectCurrency()' >");
    var checks = '<span style="border:solid red 1px;padding-top: 4;padding-bottom: 4"><b>&nbsp; Detail Filters: </b><label>Pending</label><input id="e_pending"  type="checkbox" checked="checked">\n\
                  <label>Partial</label><input id="e_partial"  type="checkbox" checked="checked" class="filtro">\n\
                  <label>Not Available</label><input id="e_na" type="checkbox" checked="checked" class="filtro">\n\
                  <label>Complete</label><input id="e_complete" type="checkbox" class="filtro"></span>';
    $("#shipmenttable_info").before("&nbsp;&nbsp;&nbsp;&nbsp;<input type='button' style='width: 120px' id='proceed' value='Proceed' onclick='proceder()' disabled='disabled'>&nbsp;&nbsp;"+checks)  
}
function selectCurrency(){
    selected_currency = $("input[name=currency]:checked").val();
    //var repl = curr.repplace("$","s");
    $(".fila_prov").each(function(){
        var prov_curr = $(this).attr("data-moneda");
        if(selected_currency == prov_curr){
            $(this).fadeIn();
        }else{
            $(this).fadeOut();
        }
    });
    $(".selectable").removeAttr("disabled");
    $("#proceed").removeAttr("disabled"); 
    $("#detalle_compra").html("Check Providers and click Proceed button...");
    infoMsg("Check Providers and click Proceed button...",10000);
} 
function proceder(){
   var v = $("#proceed").val();
   if(v == 'Proceed'){
        $(".selectable").each(function(){ 
            if(!$(this).is(":checked")){ 
                $(this).parent().parent().slideUp();                
            }else{
                $(this).parent().css("cursor","pointer");
                 
                $(this).parent().click(function(){ // td
                    $(".selected").removeClass("selected");
                    $(this).parent().addClass("selected"); // tr
                    
                    var nro = $(this).parent().attr("data-nro");
                    var proveedor = $(this).parent().attr("data-corp"); 
                    // Si cambia el Nro de Pedido debo buscar otro invoice
                    if(nro_pedido != nro){
                       getOpenInvoices(nro); 
                    }
                    nro_pedido = nro;
                    getArticulosCoprados(nro,proveedor);
                }); 
            }   
        });         
        $("#proceed").val("Show All Providers");
        $(".selectable").fadeOut();
        infoMsg("Check Detail Filters and Select a Provider...",10000);
   }else{
       $("input[type=checkbox]").each(function(){ 
            var prov_curr = $(this).parent().parent().attr("data-moneda");
            if(prov_curr == selected_currency){
                $(this).parent().parent().slideDown();
                $(this).parent().css("cursor","default");
                $(this).parent().off('click');
            }
        });
        $("#proceed").val("Proceed");
        $(".selectable").fadeIn();
   }
}
 
function getOpenInvoices(nro_pedido){    
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getOpenInvoices", usuario:getNick(),currency:selected_currency,nro_pedido:nro_pedido},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#invoices").html("Checking open Invoices for: "+nro_pedido+" <img src='img/loading_fast.gif' width='24px' height='24px' >"); 
        },
        success: function (data) { 
             if(data.length > 0 ){
                $("#invoices").html(""); 
                for(var i in data){   
                   var invoice = data[i].invoice; 
                   $("#invoices").append("<div class='invoice' id='"+invoice+"' onclick=getPacking('"+invoice+"')>"+invoice+"</div>"); 
                }
             }else{
                $("#invoices").html("");
                infoMsg("No Open Invoices for: "+nro_pedido+"");
             }
             $("#new_invoice").fadeIn();
        }
    });
}
function generarNuevoInvoice(){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "generateNewInvoice", "usuario": getNick(), nro_pedido: nro_pedido,moneda:selected_currency,},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#invoices").append("<div class='tmp_invoice'><img src='img/loading_fast.gif' width='22px' height='22px' ></div>"); 
                           
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var invoice = $.trim(objeto.responseText);  
                $(".tmp_invoice").remove();
                $("#invoices").append("<div class='invoice' id='"+invoice+"' onclick=getPacking('"+invoice+"')>"+invoice+"</div>"); 
            }
        },
        error: function () {
            errorMsg("An error occurred while the connection to server. Please check your internet conection...");
        }
    }); 
}
function getPacking(invoice){ 
   selected_invoice = invoice;
   $(".invoice").removeClass("selected_invoice");
   
   $("#"+invoice).addClass("selected_invoice");   
   $("#add_button").val("Add selected Items to Invoice: "+invoice);
   $("#add_button").fadeIn();
   $(".invoice_tools").fadeIn();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getPackingList",invoice: selected_invoice},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#div_packing").html("<img src='img/loading_fast.gif' width='22px' height='22px' >"); 
        },
        success: function (data) {  
             $("#div_packing").html('<table id="packing_list" border="1"  cellspacing="2" cellpadding="0" style="border-collapse:collapse;margin:0 auto;width: 100%;backgroud:white" >\n\
                <tr> <th colspan="12" style="background: #EEE8AA">Invoice: '+invoice+' - Detail of Packing List</th></tr>\n\
                <tr class="titulo"><th>Provider</th><th>Code</th><th>Description</th><th>Color</th><th>Color Cod.</th><th>Price</th><th>Bale</th><th>Quantity</th><th>Um</th> <th>Total</th><th>*</th></tr>  </table> ');
            var prov_ant = "";
            var clase = "zebra0";
            var j = 0;
            if(data.length > 0){                       
                for(var i in data){ 
                   var id_pack = data[i].id_pack;
                   //var id_det = data[i].id_det; 
                   var cod_prov = data[i].cod_prov;                    
                   var bale = data[i].bale; if(bale == null){bale = "";}
                   var piece = data[i].piece; if(piece == null){piece = "";}
                   var codigo = data[i].codigo;
                   var descrip = data[i].descrip;
                   var color = data[i].color;
                   var color_cod_fab = data[i].color_cod_fab;
                   var precio = data[i].precio;
                   var cantidad = data[i].cantidad;
                   var um = data[i].um;
                   var subtotal = data[i].subtotal;
                   
                   if(prov_ant != cod_prov && prov_ant != ""){  
                       j++;
                       var z = j%2;
                       clase = "zebra"+z;                       
                   } 
                   $("#packing_list").append("<tr id='pack_"+id_pack+"' class='prov_"+cod_prov+"' style='height:28px' onclick=selectPackRow('pack_"+id_pack+"')><td class='item "+clase+"'>"+cod_prov+"</td><td class='item "+clase+"'>"+codigo+"</td><td class='item editable' id='desc_"+id_pack+"'>"+descrip+"</td><td class='item'>"+color+"</td><td class='item "+clase+"'>"+color_cod_fab+"</td><td  class='num "+clase+" precio'>"+precio+"</td><td class='bale_"+cod_prov+"_"+bale+" itemc' id='bale_"+id_pack+"' onclick=showContextMenu('"+id_pack+"')>"+bale+"</td> <td id='qty_"+id_pack+"'  class='num' onclick=showContextMenu('"+id_pack+"')>"+cantidad+"</td><td  class='itemc "+clase+"'>"+um+"</td><td  class='num "+clase+" subtotal'>"+subtotal+"</td><td class='itemc'  id='del_"+id_pack+"'><img title='Delete Item from Packing List' style='cursor:pointer' class='rotate' src='img/trash_mini.png' onclick=deletePackingRow('"+id_pack+"')></td></tr>");
                   
                   prov_ant = cod_prov; 
                   
                }
                $("#packing_list").append("<tr> <td colspan='9' ></td> <td class='num' style='font-weight:bolder' id='total' onclick='sumPacking()' ></td></tr>");      
                sumPacking();
                verificarCheckBoxes();
                getGastosInvoice();
                getDistinctProviders();
                $('.editable').makeEditable();
            }else{                
                infoMsg("Packing List is Empty, Select products and add to the packing list.",25000);
            }
        }
    });
}


function addToInvoice(){
    if(selected_invoice != ""){
        var ids = new Array();
        $(".compra_det_check").each(function(){
            if($(this).is(":checked")){
               var id = parseInt($(this).attr("id").substring(6,30)); 
               console.log(id);
               //var cod_lote = {'nro_pedido':nro_pedido,'codigo':codigo,'lote':lote,'descrip':descrip,'cant':cant};
               ids.push( id );  
               $(this).fadeOut();
               $(this).parent().append("<img src='img/loading_fast.gif' width='16px' height='16px' id='img_"+id+"' >");
            }
        });
        ids = JSON.stringify(ids);
        
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "addProductsToInoice", invoice: selected_invoice,provider:selected_provider,ids:ids},
            async: true,
            dataType: "json",
            beforeSend: function () {
                $("#msg").html("<img src='img/activity.gif' width='46px' height='8px' >"); 
            },
            success: function (data) {   
                  
                if(data.length > 0){                       
                    for(var i in data){   
                       var id_pack = data[i].id_pack;
                       var id_det = data[i].id_det;
                       var cod_prov = data[i].cod_prov;
                       var bale = data[i].bale; if(bale == null){bale = "";}
                       var piece = data[i].piece; if(piece == null){piece = "";}
                       var codigo = data[i].codigo;
                       var descrip = data[i].descrip;
                       var color = data[i].color;
                       var color_cod_fab = data[i].color_cod_fab;
                       var precio = data[i].precio;
                       var cantidad = data[i].cantidad;
                       var um = data[i].um;
                       var subtotal =  data[i].subtotal;                       
                       $("#packing_list").append("<tr id='pack_"+id_pack+"'  class='prov_"+cod_prov+"' style='height:28px'  onclick=selectPackRow('pack_"+id_pack+"')><td class='item noedit'>"+cod_prov+"</td> <td class='item noedit'>"+codigo+"</td><td class='item' contenteditable id='desc_"+id_pack+"' onchange='saveDescrip("+id_pack+")'>"+descrip+"</td><td class='item'>"+color+"</td><td class='item noedit'>"+color_cod_fab+"</td><td  class='num noedit precio'>"+precio+"</td><td class='bale_"+cod_prov+"_"+bale+" itemc' id='bale_"+id_pack+"' onclick=showContextMenu('"+id_pack+"')>"+bale+"</td> <td id='qty_"+id_pack+"'  class='num' onclick=showContextMenu('"+id_pack+"')>"+cantidad+"</td><td  class='itemc noedit'>"+um+"</td><td  class='num noedit subtotal'>"+subtotal+"</td><td class='itemc'  id='del_"+id_pack+"'><img title='Delete Item from Packing List' style='cursor:pointer' class='rotate' src='img/trash_mini.png' onclick=deletePackingRow('"+id_pack+"')></td></tr>");
                       
                       var cant = $("#cant_"+id_det).html();
                       $("#cant_env_"+id_det).html(cant);                       
                       $("#img_"+id_det).attr("src","img/ok.png");
                       $("#check_"+id_det).removeAttr("checked");
                       $("#check_"+id_det).fadeIn();
                       $("#state_"+id_det).removeClass("Pending Partial na").addClass("Complete");
                       $("#state_"+id_det).html("Complete");
                    }
                    $("#add_button").attr("disabled",true); 
                    sumPacking();
                }else{                
                    infoMsg("No products added to the Packing List.",25000);
                }
            }
        });
        
        
    }else{
        errorMsg("Please select an Invoice or create one to add Items.",12000);
    } 
}
function showContextMenu(id){
   actual_row = id; 
   actual_qty = 1;  
  
   $(".tmp_row").remove(); 
   $("#edit_bale").slideDown("slow");  
   var bale_no = $("#bale_"+id ).text();
   if(bale_no == ""){
       tipo_insersion = "insert";
   }else{
       tipo_insersion = "update"; 
   }
   $("#bale_no").val( bale_no ); 
   
   var off = $("#bale_"+id ).offset();  
   $("#qutyx").val( $("#qty_"+id ).text() );   
   $("#gross").html( $("#qty_"+id ).text() ); 
   $('#edit_bale').offset({top: off.top ,left: off.left});    
}
function deletePackingRow(id){ 
    var c = confirm("Are you sure that you want to delete this row?");
    if(c){
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "deletePackingRow", "usuario": getNick,id_pack : id},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#del_"+id).html("<img src='img/loading_fast.gif' width='16px' height='16px' >"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);
                if(result == "Ok"){
                    $("#del_"+id).html("<img src='img/ok.png' width='16px' height='16px' >"); 
                    $("#pack_"+id).children().css("text-decoration","line-through");                    
                    setTimeout(function(){
                        $("#pack_"+id).slideUp("5000").remove();
                    },5000); 
                }else{
                   errorMsg("Error deleting row cant connect to the Server...",10000); 
                }
            }
        },
        error: function () {
            $("#del_"+id).html("<img src='img/error.png' width='16px' height='16px' >"); 
            errorMsg("Error deleting row",10000);
        }
    });   
    }
}
 
function savePieces(){
    var errors = 0;
    
    $(".frac_row").each(function(){
       var bale = $(this).parent().prev().find(".bale").val(); 
       if($(this).val()=="" || $(this).val()=="0" || bale == "" || bale == "0"){
           errors++;
       } 
    });
    
    if(errors > 0){
        var c = confirm("Empty Quantities was found, remove these empty rows?");
        if(c){
           $(".frac_row").each(function(){
                if($(this).attr("id")!="qutyx"){  
                    var bale = $(this).parent().prev().find(".bale").val();  
                    if($(this).val()=="" || $(this).val()=="0" || bale == "" || bale == "0"){
                      $(this).parent().parent().remove();
                    } 
                }
          }); 
          errors = 0;
          infoMsg("Ok, empty rows removed now you can Save Pieces...",15000);
        } 
    }else{          
            $("#save_bale").attr("disabled",true);            
            var bales = new Array();
            var fracciones = new Array();
            $(".frac_row").each(function(){ 
                var vbale = $(this).parent().prev().find(".bale").val();
                var vfrac = $(this).val();
                bales.push(vbale);
                fracciones.push(vfrac);               
            });   
            fracciones = JSON.stringify(fracciones);
            bales = JSON.stringify(bales);
            
            var curret_id = actual_row;
            var clase = $("#pack_"+curret_id).children().hasClass("zebra0");
            if(clase == true){
                clase = "zebra0";
            }else{
                clase = "zebra1";
            }
            $.ajax({
                type: "POST",
                url: "Ajax.class.php",
                data: {"action": "dividePackingListPiece", packing_id:actual_row,bales:bales, quantities:fracciones,tipo_insersion:tipo_insersion},
                async: true,
                dataType: "json",
                beforeSend: function () {
                    $(".tmp_row").html("<img src='img/loading_fast.gif' width='16px' height='16px' >");       
                },
                success: function (data) {   
                    var first_qty = parseFloat($("#qutyx").val()).format(2, 3, '', '.');
                    $("#qty_"+actual_row).html(first_qty);
                    var price = parseFloat($("#bale_"+actual_row).prev().html());
                    var subtot = parseFloat(price * first_qty).format(2, 3, '', '.');
                    $("#qty_"+actual_row).next().next().html(subtot);  
                    $("#bale_"+actual_row).html($("#bale_no").val());    
                    if(data.length > 0){                         
                         
                        for(var i in data){   
                           var id_pack = data[i].id_pack;
                           var id_det = data[i].id_det;
                           var cod_prov = data[i].cod_prov;
                           var bale = data[i].bale;
                           var piece = data[i].piece;
                           var codigo = data[i].codigo;
                           var descrip = data[i].descrip;
                           var color = data[i].color;
                           var color_cod_fab = data[i].color_cod_fab;
                           var precio = data[i].precio;
                           var cantidad = data[i].cantidad;
                           var um = data[i].um;
                           var subtotal = parseFloat(data[i].subtotal).format(2, 3, ',', '.');                            
                           $("#pack_"+curret_id).after("<tr id='pack_"+id_pack+"' style='height:28px' class='prov_"+cod_prov+" child'  onclick=selectPackRow('pack_"+id_pack+"')><td class='item "+clase+"'>"+cod_prov+"</td> <td class='item "+clase+"'>"+codigo+"</td><td class='item' contenteditable id='desc_"+id_pack+"' onchange='saveDescrip("+id_pack+")'>"+descrip+"</td><td class='item'>"+color+"</td><td class='item "+clase+"'>"+color_cod_fab+"</td><td  class='num "+clase+" precio'>"+precio+"</td><td class='bale_"+cod_prov+"_"+bale+" itemc' id='bale_"+id_pack+"' onclick=showContextMenu('"+id_pack+"')>"+bale+"</td> <td id='qty_"+id_pack+"'  class='num' onclick=showContextMenu('"+id_pack+"')>"+cantidad+"</td><td  class='itemc "+clase+"'>"+um+"</td><td  class='num "+clase+" subtotal'>"+subtotal+"</td><td class='itemc' id='del_"+id_pack+"'><img title='Delete Item from Packing List' style='cursor:pointer' class='rotate' src='img/trash_mini.png' onclick=deletePackingRow('"+id_pack+"')></td></tr>");
                           curret_id = id_pack;
                        } 
                      
                    }else{                
                        infoMsg("No products added to the Packing List.",25000);
                    }
                    $(".tmp_row").remove();
                    $("#save_bale").removeAttr("disabled");
                    $("#edit_bale").slideUp("slow");  
                    $("#save_bale").removeAttr("disabled");                    
                    sumPacking();
                    setBalesColor();
                }
            }); 
             
         
     
} 
}
function addPiece(){
    var pieces = parseInt($("#pieces_to_add").val());
    if(!isNaN(pieces)){ 
        var tope =  parseInt(actual_qty + pieces);
        var qutyx = $("#qutyx").val();
       console.log(qutyx);  
        // Buscar el valor del bale anterior a este
        var bale_ant = $("#prepend_this").prev().find(".bale").val();
        while(actual_qty < tope ){     
            actual_qty++;          
            $("#prepend_this").before('<tr class="tmp_row"><td><input class="itemc bale" type="text" onkeypress="return onlyNumbers(event)" size="6" value="'+bale_ant+'"></td> <td><input type="text" class="frac_row num" value="'+qutyx+'" size="6" onkeypress="return onlyNumbers(event)" ></td></tr>');    
        }
        $(".frac_row").keyup(function(e){
            if (e.keyCode == 13) {
              $(this).parent().parent().next().find(".frac_row").focus().select(); 
            } 
       });
        $(".bale").change(function(){  
            var v = $(this).val();
            var longitud = $(".bale").length; 
            var indice =  $(".bale").index($(this)); 
            for(var i = indice;i < longitud;i++){
               $($(".bale").get(i)).val(v);     
            } 
        });
        
        $(".frac_row").change(function(){
          var $ant = $(this).parent().parent().prev().find(".frac_row");  
          var v =  $ant.val()
          if(v != undefined && (v == "" || isNaN(v)) ){
              errorMsg("Error: Quantities must be a Number and can`t be empty.",8000 );
              $ant.focus(); 
              $ant.addClass("error_field");
          }else{
             $ant.removeClass("error_field"); 
          }
          var xv = $(this).val();
          if(isNaN(xv)){
              $(this).addClass("error_field");
              $(this).val("");
          }else{
              $(this).removeClass("error_field"); 
          }
        });
        
    }
}
function getArticulosCoprados(nro,proveedor){ 
    selected_provider = proveedor;
    var pending = $("#e_pending").is(":checked");
    var partial = $("#e_partial").is(":checked");
    var na = $("#e_na").is(":checked");
    var complete = $("#e_complete").is(":checked");
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getDetalleCompraForShipmentTable", nro:nro, prov:proveedor, pending:pending, partial:partial, na:na,complete:complete},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#content").html("<img src='img/loading.gif' width='30px' height='30px' >"); 
        },
        success: function (data) {   
            $("#content").html('<table id="detalle_compra" border="1"  cellspacing="2" cellpadding="0" style="border-collapse:collapse;margin:0 auto;width: 100%" >\n\
            <tr> <th colspan="10" style="background: #EEE8AA">Detail of '+proveedor+'</th></tr>\n\
            <tr class="titulo"><th>Code</th><th>Description</th><th>Color</th><th>Color Cod.</th><th>Price</th><th>Quantity</th><th>Um</th><th>Quty.Shipped</th> <th>State</th> <th>*</th></tr>  </table> ');
            var c = 0;            
            for(var i in data){   
               var id_det = data[i].id_det;
               var codigo = data[i].codigo;
               var ColorCod = data[i].ColorCod;
               var descrip = data[i].descrip;
               var color = data[i].color;
               var precio = data[i].precio;
               var cantidad = data[i].cantidad;
               var um = data[i].um;
               var subtotal = data[i].subtotal;  
               var cant_env = data[i].cant_enviada; 
               var estado = data[i].estado; 
               var class_color = '';
               var checked = 'checked="checked"';
               if(estado == 'N/A'){
                  class_color = 'na';
                  checked = '';
               }else {
                  class_color = estado;
               }
               if(estado == 'Complete'){ 
                  checked = '';
               }
               c++;
               $("#detalle_compra").append("<tr id='tr_"+id_det+"'><td class='itemc'>"+codigo+"</td><td class='item'>"+descrip+"</td><td class='item'>"+color+"</td><td class='item'>"+ColorCod+"</td><td  class='num' title='"+subtotal+"'>"+precio+"</td><td  class='num' id='cant_"+id_det+"'>"+cantidad+"</td><td  class='itemc'>"+um+"</td><td class='num' id='cant_env_"+id_det+"'>"+cant_env+"</td><td  class='itemc "+class_color+"' id='state_"+id_det+"' data-state='"+estado+"' style='cursor:pointer' onclick='cambiarEstadoItem("+id_det+")' >"+estado+"</td><td  class='itemc'><input type='checkbox' class='compra_det_check' id='check_"+id_det+"' "+checked+" onclick='verificarCheckBoxes()' ></td></tr>");
            } 
            $("#detalle_compra").append("<tr><td colspan='10' style='text-align:right;'><input type='button' id='add_button' value='Add to Invoice "+selected_invoice+"' class='add_button' onclick='addToInvoice()' ></td></tr>");
            
            if(selected_invoice!= "" && c > 0){
               $("#add_button").fadeIn("slow");    
            }
            
            $("#midle_container").height($("#detalle_compra").height());
        }
    });
}
function enmascararTd(id){
   var valor = "";
   if( $("#"+id).children().length > 0 ) {
      valor =  $("#"+id).children().val();      
   }else{
      valor = $("#"+id).html();  
      $("#"+id).html("");
      $("#"+id).append("<input  type='text' class='editable_row' id='in_"+id+"'  value='"+valor+"' size='10' onblur=desenmascarar('"+id+"') onchange=desenmascarar('"+id+"') >"); 
      $( "#in_"+id ).datepicker({ dateFormat: 'dd-mm-yy' }); 
   }     
}
function enmascararVol(id){
   var valor = "";
   if( $("#"+id).children().length > 0 ) {
      valor =  $("#"+id).children().val();      
   }else{
      valor = $("#"+id).html();  
      $("#"+id).html("");
      $("#"+id).append("<input  type='text' class='editable_row' id='in_vol_"+id+"'   value='"+valor+"' size='10' onblur=desenmascarar('"+id+"') onchange=desenmascarar('"+id+"') >");        
   }     
}
function setVal(id,valor){  
   $("#"+id).html($.trim(valor));
}
function desenmascarar(id){  
   if( $("#"+id).children().length > 0 ) {
      var  valor =  $("#"+id).children().val(); 
      setTimeout("setVal('"+id+"','"+valor+"')",500);  
      actualizarFila(id);
   } 
}


function actualizarFila(id){
   var nro = $("#"+id).parent().attr("data-nro") ;  
   var corp = $("#"+id).parent().attr("data-corp") ;  
   // Sacar todas las Mascaras
   /* $(".delivery_date").each(function(){ 
       desenmascarar( $(this).parent().attr("id"));  
   });*/
    
   var ini = id.substring(0,4);
   var id_ = id; 
   if(ini == "vol_"){
       id_ = id.substring(4,80);
   } 
  console.info("id: "+id_);
   var delivery = "";
   if( $("#"+id_).children().length > 0 ) {
      delivery =  $("#"+id_).children().val();  
      if(delivery == ""){
         delivery = $("#"+id_).text();  
      }
      console.info("Hijo "+delivery);
   }else{
      delivery = $("#"+id_).html();   
      console.info("td "+delivery);
   }
    
   
   
    var volumen = 0;
   if( $("#vol_"+id_).children().length > 0 ) {
      volumen =  $("#vol_"+id_).children().val();  
      if(volumen == ""){
         volumen = $("#vol_"+id_).text();  
      }
   }else{
      volumen =  $("#vol_"+id_).text() ;  
   } 
   /*
   if(inNaN(volumen)){
       volumen = 0;
   } */
   
    
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "updateShipmentTable", nro:nro,corp:corp,delivery_date:delivery,volume:volumen },
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#"+id_).css("border","solid red 1px");    
            $("#vol_"+id_).css("border","solid red 1px"); 
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText);   
                $("#"+id_).css("border","solid gray 1px");    
                $("#vol_"+id_).css("border","solid gray 1px"); 
            }
        },
        error: function () {
            errorMsg("An error occurred during the connection with the server, please solve conection problems...",10000);
        }
    });   
   
}
function cambiarEstadoItem(id){
   var initial_state = $("#state_"+id).attr("data-state");
   var state = $("#state_"+id).html();
   var set_state = initial_state;
   if(initial_state != state){
       set_state = initial_state;
   }else{
       if(state == "N/A"){
           set_state = "Pending";
       }else{
          set_state = "N/A";
          $("#check_"+id).removeAttr("checked");
       }
   }
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "cambiarEstadoItemCompraInternacional", id:id,estado: set_state},
        async: true,
        dataType: "html",
        beforeSend: function () {
            $("#state_"+id).html("<img src='img/loading_fast.gif' width='16px' height='16px' >");                      
        },
        complete: function (objeto, exito) {
            if (exito == "success") {                          
                var result = $.trim(objeto.responseText); 
                $("#state_"+id).html(result);       
                var class_color = '';
                if(result == 'N/A'){
                  class_color = 'na';
                }else {
                  class_color = result;
                }
                $("#state_"+id).removeClass("Pending Partial na");
                $("#state_"+id).addClass(class_color); 
            }else{
                errorMsg("An Error ocurred while the connection to the Server... Please check your internet conection");
            }
        },
        error: function () {
            $("state_"+id).html(initial_state);       
            errorMsg("An Error ocurred while the connection to the Server... Please check your internet conection");
        }
    }); 
}
function verificarCheckBoxes(){
    var c = 0;
    $(".compra_det_check").each(function(){         
        if($(this).is(":checked")){ 
            c++; 
            var id = $(this).attr("id").substring(6,60);   
            var estado = $("#state_"+id).text();  
            if(estado == "Complete"){
                var cant_env = parseFloat( $("#cant_env_"+id).text() );
                var cant = parseFloat( $("#cant_"+id).text() );
                if(cant_env >= cant){
                   $("#cant_env_"+id).addClass("qty_error"); 
                   $("#cant_"+id).addClass("qty_error"); 
                   errorMsg("Warning! Some Items Quantity Shipped are greather than Purchased quantities, will be add with 0 to the Packing.",20000);   
                } else{
                    $("#cant_env_"+id).removeClass("qty_error"); 
                    $("#cant_"+id).removeClass("qty_error"); 
                }              
            }
        }
    });
    if(c > 0){
       $("#add_button").removeAttr("disabled");
    }else{
       $("#add_button").attr("disabled",true);  
    }
}

function getGastosInvoice(){
    $("#footer").fadeIn();
    $.ajax({
        type: "POST",
        url: "Ajax.class.php",
        data: {"action": "getInvoiceExpenses", invoice: selected_invoice,n_nro:nro_pedido},
        async: true,
        dataType: "json",
        beforeSend: function () {
            $("#expenses").html("<img src='img/loading_fast.gif' width='24px' height='24px' >"); 
        },
        success: function (data) {   
            $("#expenses").html('<table class="gastos" border="1" cellspacing="0" cellpadding="0" style="width: 100%;border-collapse: collapse">\n\
            <th>Expense</th><th>Value</th></table>');
              for(var i in data){ 
                var nro_gasto = data[i].nro_gasto;
                var cod_gasto = data[i].cod_gasto; 
                var nombre_gasto = data[i].nombre_gasto;   
                var valor = data[i].valor; 
                $(".gastos").append('<tr><td>'+nombre_gasto+'</td><td><input type="text" id="gasto_'+cod_gasto+'" data-id="'+nro_gasto+'" class="num expense" size="14" value="'+valor+'" onkeypress="return onlyNumbers(event)" onchange="actualizarGastosYTotalInvoice()">'+selected_currency+'&nbsp;</td></tr>');             
              }
              $("#gasto_10").attr("readonly",true);
              getNotes();
        }
    });    
}
function actualizarGastosYTotalInvoice(){
   var total_productos = parseFloat($("#total").text().replace(",",""));
   var gastos_portuarios_origen = parseFloat($("#gasto_8").val().replace(",",""));
   var gastos_consolidacion = parseFloat($("#gasto_12").val());
   var parcial = total_productos + gastos_portuarios_origen + gastos_consolidacion;
   var comision = (parcial * 4 / 100).format(2, 10, '', '.');
   $("#gasto_10").val(comision);
   $(".expense").each(function(){
       var id = $(this).attr("data-id");
       var value = $(this).val();
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "updateInvoiceExpenses",invoice:selected_invoice,id: id, value: value},
            async: true,
            dataType: "html",
            beforeSend: function () {
                $("#gasto_"+id).parent().append("<img class='tmp' src='img/loading_fast.gif' width='16px' height='16px' >"); 
            },
            complete: function (objeto, exito) {
                if (exito == "success") {                          
                    $(".tmp").attr("src","img/ok.png");                       
                }
            },
            error: function () {
                $(".tmp").attr("src","img/warning_red_16.png");
            }
        }); 
   });
}
function updateNotes(){
    $("#msg_obs").html("Saving Notes... <img src='img/loading_fast.gif' width='16px' height='16px' >"); 
    var notes = $("#inv_obs").val();
    $.post( "Ajax.class.php",{ action: "updateInvoiceNotes",invoice:selected_invoice,notes:notes}, function( data ) {
         $("#msg_obs").html("<img src='img/ok.png' width='16px' height='16px' >");      
    });  
}
function getNotes(){
  $("#msg_obs").html("Loading Notes... <img src='img/loading_fast.gif' width='16px' height='16px' >");   
  $.post( "Ajax.class.php",{ action: "getInvoiceNotes",invoice:selected_invoice}, function( data ) {
       $("#inv_obs").val(data);
       $("#msg_obs").html(""); 
  }); 
}
function  selectPackRow(id){
    $(".selected_packing_row").removeClass("selected_packing_row");    
    $("#"+id).addClass("selected_packing_row");
}
function cancel(){
    $("#edit_bale").slideUp("fast");  
}
function onlyNumbers(e){
        //e.preventDefault();
	var tecla=new Number();
	if(window.event) {
		tecla = e.keyCode;
	}else if(e.which) {
		tecla = e.which;
	}else {
	   return true;
	}
        if(tecla == "13"){           
            this.select();
        }
        //console.log(e.keyCode+"  "+ e.which);
	if((tecla >= "97") && (tecla <= "122")){
		return false;
	}
} 
function sumPacking(){
    var sum = 0;
    $('.subtotal').each(function(){
        sum += parseFloat($(this).text());  //Or this.innerHTML, this.innerText
    });
    $("#total").html((sum).format(2, 3, '', '.'));
} 
function getDistinctProviders(){
    var allClassName = $("[class^='prov_']").map(function(){
        return this.className.split(" ")[0].substring(5,100);     
    }).get();
    var uniqueClassName = $.unique(allClassName);    
    $("#div_distinct_corps").html("");
    for(var i = 0;i < uniqueClassName.length ; i++){
        var corp = uniqueClassName[i];
        $("#div_distinct_corps").append("<input type='checkbox' id='chk_"+corp+"' onclick=toggleProvider('"+corp+"') checked='checked' title='Hide/Unhide' ><label title='Click CheckBox to Hide/Unhide Provider in Packing List' class='chebox_prov'>"+corp+"</label>&nbsp;");
    }
    setBalesColor();
}
function setBalesColor(){
    var allClassName = $("[class^='bale_']").map(function(){
        return this.className.split(" ")[0];     
    }).get();
    var uniqueBalesClassName = $.unique(allClassName);    
    
    for(var i = 0;i < uniqueBalesClassName.length ; i++){
        var bale = uniqueBalesClassName[i]; 
        var j = i%2;
        $("."+bale).addClass("bale"+j);
    }
}
function toggleProvider(prov){
    var chk = $("#chk_"+prov).is(":checked");
    if(chk){
        $(".prov_"+prov).fadeIn();
        infoMsg(prov+" has been displayed.",6000);
    }else{
        $(".prov_"+prov).fadeOut();
        infoMsg(prov+" has been hidden.",6000);
    }
}

function dropInvoice(){
    var c = confirm("Are you sure that you want to delete this Invoice?");
    if(c){
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "dropInvoice", invoice: selected_invoice},
            async: true,
            dataType: "html",
            beforeSend: function () {
                infoMsg("Checking if invoice is empty!",5000);
            },
            complete: function (objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText); 
                    if(result == "Ok"){
                       infoMsg("Invoice has been successfully deleted.",10000); 
                       $("#"+selected_invoice).remove();
                       selected_invoice = ""; 
                    }else{
                       errorMsg("Can`t delete Invoice, Invoice must be empty to drop it.",20000); 
                    }
                }
            },
            error: function () {
                errorMsg("An Error ocurred while the connection to the Server... Please check your internet conection"); 
            }
        }); 
    }
}
function closeInvoice(){
    var c = confirm("Are you sure that you want to close this Invoice?");
    if(c){
        $.ajax({
            type: "POST",
            url: "Ajax.class.php",
            data: {"action": "closeInvoice", invoice: selected_invoice},
            async: true,
            dataType: "html",
            beforeSend: function () {
                infoMsg("Checking if invoice is empty!",5000);
            },
            complete: function (objeto, exito) {
                if (exito == "success") {                          
                    var result = $.trim(objeto.responseText); 
                    if(result == "Ok"){
                       infoMsg("Invoice has been successfully closed.",10000); 
                       $("#"+selected_invoice).remove();
                       selected_invoice = ""; 
                    }else{
                       errorMsg("Can`t close Invoice, Invoice cant be empty to close it.",20000); 
                    }
                }
            },
            error: function () {
                errorMsg("An Error ocurred while the connection to the Server... Please check your internet conection"); 
            }
        }); 
    }
}
function printInvoice(){ 
    var url = "compras/Invoice.class.php?invoice="+selected_invoice+"";
    var title ="Invoice";
    var params ="width=800,height=840,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    window.open(url,title,params);
}
function printPackingList(){ 
    var url = "compras/PackingList.class.php?invoice="+selected_invoice+"";
    var title ="Packing List of Invoice No: "+selected_invoice+"";
    var params ="width=800,height=840,scrollbars=yes,menubar=yes,alwaysRaised = yes,modal=yes,location=no";
    window.open(url,title,params);
} 
function saveDescrip(id_pack,new_descrip){
   $.post( "Ajax.class.php",{ action: "changePackingListDescription",id_pack:id_pack,descrip:new_descrip,usuario:getNick()}, function( data ) {
      infoMsg(data,10000);    
   },'text');    
}
$.fn.makeEditable = function() {
  $(this).on('dblclick',function(){
    if($(this).find('input').is(':focus')) return this;
    var cell = $(this);
    var content = $(this).html();
    $(this).html('<input type="text" value="' + $(this).html() + '" style="width:98%" />')
      .find('input')
      .trigger('focus')
      .on({
        'blur': function(){
          $(this).trigger('closeEditable');
        },
        'keyup':function(e){
          if(e.which == '13'){ // enter
            $(this).trigger('saveEditable');
          } else if(e.which == '27'){ // escape
            $(this).trigger('closeEditable');
          }
        },
        'closeEditable':function(){
          cell.html(content);          
        },
        'saveEditable':function(){
          if(content != $(this).val()){  
             content = $(this).val();             
             var id_pack = cell.attr("id").substring(5,60);
             saveDescrip(id_pack,content);
          }
          $(this).trigger('closeEditable');
        }
    });
  });
return this;
}
