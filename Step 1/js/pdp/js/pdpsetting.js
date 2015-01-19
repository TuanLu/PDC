var pdp_setting = jQuery.noConflict();
pdp_setting.fn.ForceNumericOnly = function () {
    return this.each(function () {
        pdp_setting(this).keydown(function (e) {
            var a = e.charCode || e.keyCode || 0;
            return (a == 8 || a == 9 || a == 46 || (a >= 37 && a <= 40) || (a >= 48 && a <= 57) || (a >= 96 && a <= 105))
        })
    })
};
pdp_setting(document).ready(function ($) {

function rgb2hex(rgb) {
    var check = rgb.split('(');
    if(check[0]=='rgb'){
        var hexDigits = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        function hex(x) {
        return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }else{
        return rgb;
    }
}
    var m = $('#url_site').val().replace('index.php/',''), 
    	canvas, 
    	pdp_history = [],
    	pdp_curved=[],
    	//Set more time if final image errors
    	defaultRenderTime = 1000,
        currencySym = $("#currency_symbol").val(),
    	allSidePanel = {},
    	renderTime;
    PDPsetting = {
        add_html: function(){
            $('body').prepend('<div class="pdploading nodisplay"><span>Please wait...</span></div>');   
            $('body').append('<div style="display:none;" class="nodisplay" id="save_original_img_text"></div><div id="pdp_canvas_result" class="nodisplay"></div>');
            $('#product-image-wrap').prepend('<img id="main_image" src="' + m + 'media/pdp/images/no_image.jpg" />');
			$('.wrapper_pdp').append($('.color_content'));
            $('.wrapper_pdp .wrap_pdp_design').append('<div id="pdp_info_item"><ul></ul></div>');
            $('.wrapper_pdp .wrap_pdp_design').append('<div id="pdp2_canvas_layer"><canvas id="pdp2_canvas_layer_cv"></canvas></div>')
        },
        edit_cart_item: function(json){
            
        },
        center_design_area: function(){
            $('#main_image').load(function(){
                var w_pdp = $('.wrap_pdp_design').width(),
                    width_design = $('#main_image').width(),
                    left_ini = parseInt((w_pdp - width_design) / 2);
                $('#product-image-wrap').css('margin-left', left_ini+'px');
            })
        },
        position_color: function(){
            var w_screen = $('body').width(),
                w_pdp = $('.wrapper_pdp').width(),
                w_color = $('.color_content_wrap').width(),
                left_sb = (w_screen - w_pdp)/2 - w_color + w_pdp;
            $('.color_content_wrap').css('left',left_sb+'px'); 
        },
        change_color: function(){
            $('#pdp_side_items li').each(function(){
                var side_name = $(this).attr('tab'),
                    pdp_media_url = $('#pdp_media_url').val(),
                    img_url = $('.design-color-image li.active').attr(side_name);                    
                $(this).attr('side_img',img_url).children('img').attr('src',pdp_media_url+img_url);
                $('.pdp_info_save[alt='+side_name+']').attr('side_img',img_url);
            });
            PDPsetting.change_image();
        },
        save_first_design: function(){
        
        },
        handle_files_select: function(d) {
            var g = d.target.files;
            for (var i = 0, f; f = g[i]; i++) {
                if (!f.type.match('image.*')) {
                    continue
                }
                var h = new FileReader();
                h.onload = (function (c) {
                    return function (e) {
                        var a = $('#lists_img_upload span').length;
                        var b = document.createElement('span');
                        b.innerHTML = ['<img id="img_up_' + a+++'" color="" class="thumb" src="', e.target.result, '" title="', escape(c.name), '"/>'].join('');
                        document.getElementById('lists_img_upload').insertBefore(b, null)
                    }
                })(f);
                h.readAsDataURL(f)
            }
            $('#files_upload').val("")
        },
        change_image: function(){
            var img_url = $('#pdp_side_items li.active').attr('side_img'),
                pdp_media_url = $('#pdp_media_url').val();
            $('#main_image').attr('src',pdp_media_url+img_url).load(function(){
                canvasEvents.renderall();
            });
        },
        change_side: function(){
            var _this = $('#pdp_side_items li.active'),
                img_url = _this.attr('side_img'),
                tab = _this.attr('tab'),
                json = $('#pdp_info_'+tab).val(),
                pdp_media_url = $('#pdp_media_url').val(),
                inlay = _this.attr('inlay').split(',');
            $('#main_image').attr('src',pdp_media_url+img_url);
            $('#wrap_inlay').css({
                "width": inlay[0] + 'px',
                "height": inlay[1] + 'px',
                "top": inlay[2] + 'px',
                "left": inlay[3] + 'px'
            }).show();
			//////////////////////////////Active current design///////////////////////////////////////////
			//PDPsetting.display_design_as_html(json);
        },
        display_design_as_html: function(json){
            //$('#wrap_inlay').html('');
        },
        init: function(){
            //////////////////////////////////////////////////////////////////////////////////////////
            canvasEvents = {
                objectSelected: function () {
                    var activeObject = canvas.getActiveObject();
                    canvasEvents.showinfo();
                    if (activeObject.type =='text') {
                        canvasEvents.changeToEditText(activeObject);
                    } else {
                        //canvasEvents.resetTextForm();
                        canvasEvents.changeToEditItem();
                    }
                    $('#pdp_info_item li.active').removeClass('active');
                    $('#pdp_info_item li[rel="'+activeObject.name+'"]').addClass('active');
                    $('#edit_item_wrap').addClass('active');
                    $('#edit_item_wrap .item:not(#edit_text, #color_item)').css('opacity',1);
                },
                removeShadow: function(){
                    var activeObject = canvas.getActiveObject();
                    if (!activeObject) return;
                    activeObject.setShadow('none');
                    canvasEvents.resetShadowForm();
                    canvasEvents.renderall();
                },
                showinfo: function(){
                    var activeObject = canvas.getActiveObject();
                    if (!activeObject) return;
                    $('#pdp_info_item').show();
                    $('#pdp_info_item .'+activeObject.name+ ' .item_size').html(parseInt(activeObject.currentWidth)+' x '+parseInt(activeObject.currentHeight));
                },
                makelistcolor: function(color,id){
                    if((color!='')&&(color!=undefined)){
                        color = color.split(',');
                    }else{
                        color = '';
                    }
                    $('.pdp_color_list ul').hide();
                    $('.pdp_color_list .pdp_color_png').show();
                    if($('.pdp_color_list .pdp_color_png').length == 0){
                        $('.pdp_color_list').append('<ul class="pdp_color_png"></ul>');
                        $('.pdp_color_png').on('click','a',function(){
                            $('.pdp_color_png .active').removeClass('active');
                            $(this).addClass('active');
                             var activeObject = canvas.getActiveObject(),
                                 top = activeObject.top,
                                 angle = activeObject.angle,
                                 width = activeObject.width,
                                 height = activeObject.height,
                                 scaleX = activeObject.scaleX,
                                 scaleY = activeObject.scaleY,
                                 left = activeObject.left,
                                 icolor = activeObject.icolor,
                                 id = activeObject.id,
                                 name = activeObject.name,
                                 url = m + 'media/pdp/images/artworks/' + $(this).attr('rel');
                             canvas.remove(activeObject);
                             fabric.Image.fromURL(url, function (image) {
                                image.set({
                                    left: left,
                                    top: top,
                                    angle: angle,
                                    scaleX: scaleX,
                                    scaleY: scaleY,
                                    icolor: icolor,
                                    id: id,
                                    isrc: url,
                                    name: name,
                                    width: width,
        							height: height,
                                    padding: setting.padding
                                });
        						//image.scaleToWidth(clipartSize.width);
                                image.transparentCorners = true;
                                image.cornerSize = 10;
                                //image.scale(scale).setCoords();
                                canvas.add(image).setActiveObject(image);
                                //pdp_history.push(JSON.stringify(canvas));
                            });
                             canvas.renderAll();
                        })
                    }
                    //$('.pdp_color_list ul.pdp_color_png').append('<li alt="'+id+'"><a rel="'+id+'" title="none">'+src+'</a></li>');
                    for(i=0;i<color.length;i++){
                       var icolor = color[i].split('__');
                       $('.pdp_color_list ul.pdp_color_png').append('<li alt="'+id+'"><a title="" rel="'+icolor[1]+'" style="background-color:#'+icolor[0]+'">'+icolor[1]+'</a></li>');
                    }
                    if($('ul.pdp_color_png li:visible').length ==0){
                        $('.nomore_color').show();
                    }else{
                        $('.nomore_color').hide();
                    }
                },
                addlayer_first_time: function(){
                    var html, final_pr = 0;
                    //PDPsetting.
                    $('#pdp_side_items li').each(function(){
                        var json = JSON.parse(pdp_history[$(this).index()]);
                        //var json = canvas.toJSON(['name','price','tcolor','isrc','icolor','id']);
                        var objects = json.objects, price = 0, side_act = $(this).attr('tab');
                        $('.layer_'+side_act+' .layer_pricing tbody').html('');
                        //json = JSON.parse(JSON.stringify(canvas.toJSON()));
                        //objects = json.objects;
                        //canvasEvents.load_json(pdp_history[$('#pdp_side_items li.active').index()]);
                        for (var i = 0; i < objects.length; i++) {
                            //objects[i].price = 32;
                            objects[i].left = 0;
                            objects[i].top = 0;
                            objects[i].angle = 0;
                            if((objects[i].name!=undefined)&&(objects[i].name!='null')){
                                item_name = objects[i].name;
                            }else{
                                item_name = 'item_'+side_act+i;
                            }
                            $('#pdp2_canvas_layer_cv').attr({
                                'width' : objects[i].width*objects[i].scaleX,
                                'height': objects[i].height*objects[i].scaleY
                            });
                            var pdp2_canvas_layer_cv = new fabric.Canvas('pdp2_canvas_layer_cv', {opacity: 1});
                                pdp2_canvas_layer_cv.clear();
                            var klass = fabric.util.getKlass(objects[i].type);
                            if (klass.async) {
                                klass.fromObject(objects[i], function (img) {
                                    pdp2_canvas_layer_cv.add(img);
                                });
                            } else {
                                pdp2_canvas_layer_cv.add(klass.fromObject(objects[i]));
                            }
                            if($('#pdc_product_config').length > 0){
                                var pdc_product_config = JSON.parse($('#pdc_product_config').val());
                                if(objects[i].text){
                                    if(pdc_product_config.text_price == ''){pdc_product_config.text_price = 0;}
                                    if((objects[i].price == undefined)) {objects[i].price = pdc_product_config.text_price;}
                                }else{
                                    if(pdc_product_config.clipart_price == ''){pdc_product_config.clipart_price = 0;}
                                    if((objects[i].price == undefined)) {objects[i].price = pdc_product_config.clipart_price;}
                                }
                            }else{
                                if(objects[i].price == undefined) {objects[i].price = 0;}
                            }
                            final_pr+=parseFloat(objects[i].price);
                            price +=parseFloat(objects[i].price);
                            if((objects[i].type=='path')||(objects[i].type=='path-group')||(objects[i].type=='image')){ 
                                html = '<tr class="pdp2_layer_item" rel="'+item_name+'">'+
                                    '<td class="item_type">'+parseInt(i+1)+'</td>'+
                                    '<td class="item_info"><img src="'+pdp2_canvas_layer_cv.toDataURL('png')+'"/></td>'+
                                    //'<td class="item_size">'+parseInt(objects[i].width)+' x '+parseInt(objects[i].height)+'</td>'+
                                    '<td class="item_price">'+ currencySym + parseFloat(objects[i].price).toFixed(2) +'</td>'+
                                    '<td><a class="item_delete" title="Remove"><i class="pi pi-trash-o"></i></a></td></tr>'
                                ;
                            }
                            if(objects[i].type=='text'){
                                html = '<tr class="pdp2_layer_item" rel="'+item_name+'">'+
                                    '<td class="item_type">'+parseInt(i+1)+'</td>'+
                                    '<td class="item_info">'+objects[i].text.substring(0,15)+'...</td>'+
                                    //'<td class="item_size">'+parseInt(objects[i].width)+' x '+parseInt(objects[i].height)+'</td>'+
                                    '<td class="item_price">'+ currencySym + parseFloat(objects[i].price).toFixed(2) +'</td>'+
                                    '<td><a class="item_delete" title="Remove"><i class="pi pi-trash-o"></i></a></td></tr>'
                                ;
                            }   
                            $('.layer_'+side_act+' tbody').append(html).parents('.layer_pricing').attr('pr',price);
                        }
                    });
                    $('#pdp_total_layer_price tfoot tr th:eq(2)').html(currencySym + final_pr.toFixed(2));
                    $('.item_delete').parent().remove();
                    var side_act = $('#pdp_side_items li.active').attr('tab');
                    //$('.prices prices_layer[tab="'+side_act+'"] label').click();
                    //var active = canvas.getActiveObject();
                    //if(active){$('#pdp_info_item ul li[rel="'+active.name+'"]').addClass('active')}
                },
                update_total_price_layer: function(){
                    var final_pr = 0;
                    $('.prices_layer').each(function(){
                        var pr = $(this).find('.layer_pricing').attr('pr');
                        if(pr == undefined){pr = 0;}
                        final_pr += parseFloat(pr);
                    });
                    $('.item_delete').parent().remove();
                    //$('.prices prices_layer[tab="'+side_act+'"] label]').click();
                    $('#pdp_total_layer_price .layer_pricing').attr('pr',final_pr.toFixed(2));
                    $('#pdp_total_layer_price .layer_pricing th:eq(2)').html(currencySym + final_pr.toFixed(2));
                },
                addlayer: function(){
                    var html, final_pr = 0;
                    var json = JSON.parse(pdp_history[$('#pdp_side_items li.active').index()]);
                    //var json = canvas.toJSON(['name','price','tcolor','isrc','icolor','id']);
                    var objects = json.objects, side_act = $('#pdp_side_items li.active').attr('tab');
                    $('.layer_'+side_act+' .layer_pricing tbody').html('');
                    //json = JSON.parse(JSON.stringify(canvas.toJSON()));
                    //objects = json.objects;
                    //canvasEvents.load_json(pdp_history[$('#pdp_side_items li.active').index()]);
                    $('.layer_'+side_act+' tbody').append(html).parents('.layer_pricing').attr('pr',final_pr);
                    for (var i = 0; i < objects.length; i++) {
                        //objects[i].price = 32;
                        objects[i].left = 0;
                        objects[i].top = 0;
                        objects[i].angle = 0;
                        if(objects[i].name!=undefined){
                            item_name = objects[i].name;
                        }else{
                            item_name = 'item_'+i;
                        }
                        $('#pdp2_canvas_layer_cv').attr({
                            'width' : objects[i].width*objects[i].scaleX,
                            'height': objects[i].height*objects[i].scaleY
                        });
                        var pdp2_canvas_layer_cv = new fabric.Canvas('pdp2_canvas_layer_cv', {opacity: 1});
                            pdp2_canvas_layer_cv.clear();
                        var klass = fabric.util.getKlass(objects[i].type);
                        if (klass.async) {
                            klass.fromObject(objects[i], function (img) {
                                pdp2_canvas_layer_cv.add(img);
                            });
                        } else {
                            pdp2_canvas_layer_cv.add(klass.fromObject(objects[i]));
                        }
                        if($('#pdc_product_config').length > 0){
                            var pdc_product_config = JSON.parse($('#pdc_product_config').val());
                            if(objects[i].text){
                                if(pdc_product_config.text_price == ''){pdc_product_config.text_price = 0;}
                                if((objects[i].price == undefined)) {objects[i].price = pdc_product_config.text_price;}
                            }else{
                                if(pdc_product_config.clipart_price == ''){pdc_product_config.clipart_price = 0;}
                                if((objects[i].price == undefined)) {objects[i].price = pdc_product_config.clipart_price;}
                            }
                        }else{
                            if(objects[i].price == undefined) {objects[i].price = 0;}
                        }
                        final_pr+=parseFloat(objects[i].price);
                        if((objects[i].type=='path')||(objects[i].type=='path-group')){ 
                            html = '<tr class="pdp2_layer_item" rel="'+item_name+'">'+
                                '<td class="item_type">'+parseInt(i+1)+'</td>'+
                                '<td class="item_info"><img src="'+pdp2_canvas_layer_cv.toDataURL('png')+'"/></td>'+
                                //'<td class="item_size">'+parseInt(objects[i].width)+' x '+parseInt(objects[i].height)+'</td>'+
                                '<td class="item_price">'+ currencySym + parseFloat(objects[i].price).toFixed(2) +'</td>'+
                                '<td><a class="item_delete" title="Remove"><i class="pi pi-trash-o"></i></a></td></tr>'
                            ;
                        }
                        if(objects[i].type=='image'){ 
                            html = '<tr class="pdp2_layer_item" rel="'+item_name+'">'+
                                '<td class="item_type">'+parseInt(i+1)+'</td>'+
                                '<td class="item_info"><img src="'+objects[i].isrc+'"/></td>'+
                                //'<td class="item_size">'+parseInt(objects[i].width)+' x '+parseInt(objects[i].height)+'</td>'+
                                '<td class="item_price">'+ currencySym + parseFloat(objects[i].price).toFixed(2) +'</td>'+
                                '<td><a class="item_delete" title="Remove"><i class="pi pi-trash-o"></i></a></td></tr>'
                            ;
                        }
                        if(objects[i].type=='text'){
                            html = '<tr class="pdp2_layer_item" rel="'+item_name+'">'+
                                '<td class="item_type">'+parseInt(i+1)+'</td>'+
                                '<td class="item_info">'+objects[i].text.substring(0,15)+'...</td>'+
                                //'<td class="item_size">'+parseInt(objects[i].width)+' x '+parseInt(objects[i].height)+'</td>'+
                                '<td class="item_price">'+ currencySym + parseFloat(objects[i].price).toFixed(2) +'</td>'+
                                '<td><a class="item_delete" title="Remove"><i class="pi pi-trash-o"></i></a></td></tr>'
                            ;
                        }
                        $('.layer_'+side_act+' tbody').append(html).parents('.layer_pricing').attr('pr',final_pr);
                    }
                    canvasEvents.update_total_price_layer();
                    //var active = canvas.getActiveObject();
                    //if(active){$('#pdp_info_item ul li[rel="'+active.name+'"]').addClass('active')}
                },
                activeobj: function(el){
                    var objects = canvas.getObjects();
                    if((el!='')&&(el!=undefined)){
                        for (var i = 0; i < objects.length; i++) {
                            if(objects[i].name==el){
                                canvas.setActiveObject(objects[i]);
                            }
                        }
                    }
                },
                resetShadowForm: function(){
                    $('#use_shadow').removeClass("active");
                    $('#h-shadow').val(0);
                    $('#v-shadow').val(0);
                    $('#t-blur').val(0);
                    $('#font_outline_color_value').css({"background-color":'#FFF','color':'#000'}).val('#FFFFFF');
                    $('.font_outline_color > div:not(.use_shadow)').hide();
                },
                addShadowItem: function(){
                    var activeObject = canvas.getActiveObject();
                    if (!activeObject) return;
                    setting_shadow = {
                        h_shadow: $('#h-shadow').val(),
                        v_shadow: $('#v-shadow').val(),
                        blur: $('#t-blur').val(),
                        color: $('#font_outline_color_value').val()
                    }
                    activeObject.setShadow({
                        color: setting_shadow.color,
                        blur: setting_shadow.blur,
                        offsetX: setting_shadow.v_shadow,
                        offsetY: setting_shadow.h_shadow
                    });
                    canvasEvents.renderall();
                },
                renderall: function(){
                    canvas.selection = false;
                    canvasEvents.save_history();
                    canvasEvents.save_design2();
                    canvas.calcOffset().renderAll();
                    canvasEvents.addlayer();
                },
                reset_canvas: function(tab){
                    var item_act = $('#pdp_side_items li[tab='+tab+']'),
                        item_img,
                        tab_index = $('#pdp_side_items li[tab='+tab+']').index(),
                        item_inlay;
                    if(item_act.length > 0){
                        item_img =  m+'media/pdp/images/'+item_act.attr('side_img');
                        $('#main_image').attr("src",item_img);
                        item_inlay = item_act.attr('inlay').split(',');
                        $('#wrap_inlay').html('<canvas id="canvas_area"></canvas>');
                        $('#wrap_inlay').css({
                           'width'  :   item_inlay[0]+'px', 
                           'height' :   item_inlay[1]+'px',
                           'top'    :   item_inlay[2]+'px', 
                           'left'   :   item_inlay[3]+'px', 
                        });
                        $('#canvas_area').attr({
                            'width':item_inlay[0],
                            'height':item_inlay[1]
                        });
                        canvas = new fabric.Canvas('canvas_area', { });
                        canvas.clear();
                        canvas.observe('object:selected', canvasEvents.objectSelected);
                        canvas.observe('object:modified', canvasEvents.renderall);
                        canvas.observe('object:modified', canvasEvents.showinfo);
                        canvas.observe('object:added', canvasEvents.renderall);
                        canvas.observe('before:selection:cleared', canvasEvents.objectUnselected);
                        canvasEvents.load_json(pdp_history[tab_index]);
                        canvasEvents.centerCanvas();
                        canvasEvents.renderall();
                    }
                },
                save_history: function(){
                    var index = $('#pdp_side_items li.active').index();
                    pdp_history[index] = JSON.stringify(canvas.toJSON(['name','price','tcolor','isrc','icolor','id']));
                    //console.log(JSON.parse(pdp_history[index]));
                    //console.log(JSON.stringify(canvas.toJSON()));
                },
                editShadowItem: function(){
                    var activeObject = canvas.getActiveObject();
                    if (!activeObject) return;
                    var shadow = activeObject.get("shadow");
                    if ((shadow != null)&&(shadow.color!='none')) {
                        setting_shadow = {
                            h_shadow: $('#h-shadow').val(),
                            v_shadow: $('#v-shadow').val(),
                            blur: $('#t-blur').val(),
                            color: $('#font_outline_color_value').val()
                        }
                        activeObject.setShadow({
                            color: setting_shadow.color,
                            blur: setting_shadow.blur,
                            offsetX: setting_shadow.v_shadow,
                            offsetY: setting_shadow.h_shadow
                        });
                    } else {
                        canvasEvents.resetShadowForm();
                    }
                    canvas.calcOffset().renderAll();
                    //canvasEvents.renderall();
                },
                changeToEditItem: function(){
                    var activeObject = canvas.getActiveObject();
                    if (!activeObject) return;
					//$('#tools').prop('checked', true); //Expand Tab Artwork
                    /* $('#color_item').css('opacity',1); */
                    /* $('#pdp_edit_text, #font_outline_colorpicker').hide(); */
                   /*  $('#edit_text').css('opacity','.5'); */
                    var opacity = activeObject.get('opacity');
                    $('#pdp_opacity_input').val(opacity*10);
                    var shadow = activeObject.get('shadow');
                    if(activeObject.tcolor==1){
                        $('.pdp_color_list ul.mCustomScrollbar').show();
                        $('.pdp_color_list ul').show();
                        $('.pdp_color_list ul.pdp_color_png').hide();
                        $('.nomore_color').hide();
                    }else{
                        var isrc = activeObject.isrc.split('/');
                        $('.pdp_color_list ul.mCustomScrollbar').hide();
                        $('.pdp_color_list ul').hide();
                        $('.pdp_color_list ul.pdp_color_png').show();
                        $('.pdp_color_png a.active').removeClass('active');
                        $('.pdp_color_png a[rel="'+isrc[isrc.length - 1]+'"]').addClass('active');
                        $('.pdp_color_png li').hide();
                        if((activeObject.icolor !='')&&(activeObject.icolor !=undefined)&&($('.pdp_color_png li[alt="'+activeObject.id+'"]').length==0)){
                            canvasEvents.makelistcolor(activeObject.icolor,activeObject.id);
                        }
                        $('.pdp_color_png li[alt="'+activeObject.id+'"]').show();
                        if($('ul.pdp_color_png li:visible').length ==0){
                            $('.nomore_color').show();
                        }else{
                            $('.nomore_color').hide();
                        }
                    }
                    if((shadow==null)||(shadow.color=='none')){
                        canvasEvents.resetShadowForm();
                    }else{
                        $('.font_outline_color > div:not(.use_shadow)').show();
                        $('#h-shadow').val(shadow.offsetY);
                        $('#v-shadow').val(shadow.offsetX);
                        $('#t-blur').val(shadow.blur);
                        $('#font_outline_color_value').val(shadow.color).css('background-color',shadow.color);
                        $('#use_shadow').addClass('active');
                    }
                },
                change_main_image : function(){
                    var side_tab = $('#pdp_side_items li.active').attr('tab'),
                        main_img = $('.pdp_design_color li.active').attr(side_tab),
                        pdp_media_url = $('#pdp_media_url').val();
                    $('#main_image').attr('src',pdp_media_url+main_img);
                },
                editText: function () {
                    var activeObject = canvas.getActiveObject();
                    if (!activeObject) return;
                    //if(activeObject.type != 'text') return;
                    var before_width = activeObject.width;
                    if(activeObject.type!='curvedText'){
                        activeObject.setText($('#pdp_edit_text_input').val());
                        /*if ($('#pdp_edit_text_input').val() != '') {
                            activeObject.setText($('#pdp_edit_text_input').val());
                        }else {
                            $('#edit_text').css('opacity','0.5');
                            canvasEvents.removeObject();
                        }*/
                    }
                    var after_with = activeObject.width;
                    $('#edit_item_wrap').show();
                    $('#edit_text').css('opacity',"1");
                    $('#font_outline_colorpicker').hide();
                    var color = $('#font_color').css('color'),
                        font_family = $('#select_font li.active').attr("rel"),
                        line_height = $('#pdp_edit_text_line_height_input').val()/10,
                        font_weight, 
                        font_style,
                        text_align,
                        pos_left = activeObject.get('left'),
                        pos_top = activeObject.get('top'),
                        font_size = $('#pdp_font_size_input').val(),
                        text_deco = '';
                    if ($('.pdp_edit_font_style .bold').hasClass("active")) {
                        font_weight = 'bold';
                    } else {
                        font_weight = '';
                    }
                    if ($('.pdp_edit_font_style .italic').hasClass("active"))              { font_style = 'italic';} else {font_style = '';}
                    if ($('.pdp_edit_font_style .underline').hasClass("active"))           { text_deco += ' underline ';}
                    if ($('.pdp_edit_font_style .overline').hasClass("active"))            { text_deco += ' overline ';}
                    if ($('.pdp_edit_font_style .line-through').hasClass("active"))        { text_deco += ' line-through ';}
                    if ($('#pdp_edit_text_style .align.align_left').hasClass("active"))    { text_align = 'left';}
                    if ($('#pdp_edit_text_style .align.align_right').hasClass("active"))   { text_align = 'right'; }
                    if ($('#pdp_edit_text_style .align.align_center').hasClass("active"))  { text_align = 'center';}
                    activeObject.set({
                        fill: color,
                        fontSize: font_size,
                        fontStyle: font_style,
                        fontWeight: font_weight,
                        textDecoration: text_deco,
                        fontFamily: font_family,
                        lineHeight: line_height,
                        textAlign: text_align,
                        //left: 0
                    });
                    if(text_align=='right'){
                        if(after_with > before_width){
                            var left_cr = parseFloat(activeObject.left) - after_with + before_width;
                            activeObject.set({
                                left: left_cr
                            })
                        }else{
                            var left_cr = parseFloat(activeObject.left) + before_width - after_with;
                            activeObject.set({
                                left: left_cr
                            })
                        }
                    }else if(text_align=='center'){
                        if(after_with > before_width){
                            var left_cr = parseFloat(activeObject.left) - (after_with - before_width)/2;
                            activeObject.set({
                                left: left_cr
                            })
                        }else{
                            var left_cr = parseFloat(activeObject.left) + (before_width - after_with)/2;
                            activeObject.set({
                                left: left_cr
                            })
                        }
                    }
                    if ($('#use_shadow').hasClass('active')) {
                        setting_shadow = {
                            h_shadow: $('#h-shadow').val(),
                            v_shadow: $('#v-shadow').val(),
                            blur: $('#t-blur').val(),
                            color: $('#font_outline_color_value').val()
                        }
                        activeObject.setShadow({
                            color: setting_shadow.color,
                            blur: setting_shadow.blur,
                            offsetX: setting_shadow.v_shadow,
                            offsetY: setting_shadow.h_shadow
                        });
                    }else{
                        canvasEvents.resetShadowForm();
                        activeObject.setShadow('none');
                    }
                    canvasEvents.renderall();
                },
                addText: function (text) {
                    $('#add_text').slideUp(300);
                    $('#add_text_input').val('');
                    $('#edit_text').css('opacity',"1");
                    $('#color_item').css('opacity',.5);
                    var color = $('#font_color').css('color'),
                        font_family = 'Arial',
                        font_weight, font_style,
                        text_deco = '',
                        pos_item = parseInt($('#pdp_info_item').attr('critem'));
                    color = '#111';
                    $('#pdp_info_item').attr('critem',pos_item+1);
					var pdc_product_config = {};
					pdc_product_config.text_price = 0;
					if ($('#pdc_product_config').length) {
						pdc_product_config = JSON.parse($('#pdc_product_config').val());
					}
                    var center = canvas.getCenter(),
                        textObj = new fabric.Text(text, {
                            fontFamily: font_family,
                            left: center.left,
                            top: center.top,
                            fontSize: 20,
                            textAlign: "left",
                            //perPixelTargetFind : true,
                            fill: color,
                            price: pdc_product_config.text_price,
                            name: 'item_'+pos_item,
                            lineHeight: '1.3',
                            fontStyle: "", //"", "normal", "italic" or "oblique"
                            fontWeight: "normal", //bold, normal, 400, 600, 800
                            textDecoration: "", //"", "underline", "overline" or "line-through"
                            shadow: '', //2px 2px 2px #fff
                            padding: setting.padding
                        });
                    textObj.lockUniScaling = false;
                    textObj.hasRotatingPoint = true;
                    textObj.transparentCorners = true;
                    textObj.cornerColor = setting.border;
                    canvas.add(textObj).setActiveObject(textObj);
                    canvasEvents.center();
                    canvasEvents.addlayer();
                    $('#use_shadow').click();
                    canvasEvents.renderall();
                },
                addTextCurved: function (text) {
                    $('#add_text').slideUp(300);
                    $('#add_text_input').val('');
                    $('#edit_text').css('opacity',"1");
                    $('#color_item').css('opacity',.5);
                    var color = '#111',
                        font_family = 'Arial',
                        font_weight, font_style,
                        text_deco = '';
                    var center = canvas.getCenter(),
                        CurvedText = new fabric.CurvedText(text,{
                            left: center.left,
                            top: center.top,
                            fontFamily: font_family,
                            textAlign: 'left',
                            'fill': color,
                            radius: 100,
                            perPixelTargetFind : true,
                            fontSize: 20,
                            spacing: 15,
                            lockUniScaling: true   
                        });
                    CurvedText.lockUniScaling = true;
                    CurvedText.hasRotatingPoint = true;
                    CurvedText.transparentCorners = true;
                    CurvedText.cornerColor = setting.border;
                    canvas.add(CurvedText).setActiveObject(CurvedText);
                    canvasEvents.center();
                    canvasEvents.renderall();
                },
                editCurvedText: function(a){
                    canvasEvents.renderall();
                },
                changeToEditText: function (a) {
					//console.log('test');
					$('#tab_text').prop('checked', true); //Expand Tab Edit/Transform Text
                    $('a[tab="pdp_edit_text_curved"]').hide();
                    /* $('#edit_text').css('opacity','1');
                    $('#edit_item_wrap').addClass('active');
                    $('#edit_item_wrap div.item').css('opacity',1); */
                    //$('.design_control .add_text').click();
                    /* $('#pdp_color_fill, #font_outline_colorpicker').hide();
                    $('#color_item').css('opacity',.5); */
                    if (!a) return false;
                    $('#pdp_edit_text_input').val(a.getText());
                    var font_family = a.get('fontFamily'),
                        font_size = a.get('fontSize'),
                        text_deco = a.get('textDecoration'),
                        font_style = a.get('fontStyle'),
                        text_align = a.get('textAlign'),
                        font_weight = a.get('fontWeight'),
                        color = a.get('fill'),
                        opacity = a.get('opacity'),
                        line_height = a.get('lineHeight'),
                        shadow = a.get('shadow');
                    $('#font_color').css('color',color);
                    $('#font_color_colorpicker_value').css('background-color',color).val(rgb2hex(color));
                    //colorpicker_text.setColor(rgb2hex(color));
                    if (shadow && (shadow != '')&&(shadow.color!='none')) {
                        $('.font_outline_color > div').show();
                        $('#use_shadow').addClass("active");
                        $('#h-shadow').val(shadow.offsetY);
                        $('#v-shadow').val(shadow.offsetX);
                        $('#t-blur').val(shadow.blur);
                        $('#font_outline_color_value').val(shadow.color).css('background-color',shadow.color);
                    } else {
                        canvasEvents.resetShadowForm();
                    }
                    $('#pdp_opacity_input').val(opacity*10);
                    $('.pdp_edit_text_tab_content').hide();
                    if(a.get('type')=='curvedText'){
                       $("#pdp2_curved_text").val(a.getText());
                       $('#pdp_edit_text_tab a.active').removeClass('active'); 
                       $('#pdp_edit_text_tab_content, a[tab=pdp_edit_text_tab_content]').hide();
                       $('.pdp_curved_text_control').show();
                       $('a[tab="pdp_edit_text_curved"], #pdp_edit_text_curved').addClass('active').show();
                    }else{
                        $('a[tab="pdp_edit_text_tab_content"]').addClass('active').show();
                        $('#pdp_edit_text_tab a[tab!="pdp_edit_text_curved"], #pdp_edit_text_tab_content').show();
                    }
                    $('.pdp_edit_font_style a, #pdp_edit_text_style a').removeClass("active");
                    $('#pdp_font_size_value').html(font_size+'px');
                    $('#pdp_font_line_height_value').html(line_height);
                    if(text_align=='right'){
                        $('#pdp_edit_text_style .align_right').addClass("active");
                    }else{
                        if(text_align=='center'){
                            $('#pdp_edit_text_style .align_center').addClass("active");
                        }else{
                            $('#pdp_edit_text_style .align_left').addClass("active");
                        }
                    }
                    
                    if (font_weight == 'bold') { $('.pdp_edit_font_style .bold').addClass("active"); }
                    if (font_style == 'italic') {
                        $('.pdp_edit_font_style .italic').addClass("active");
                    }
                    if (text_deco.indexOf('underline') > 0) {
                        $('.pdp_edit_font_style .underline').addClass("active");
                    }
                    if (text_deco.indexOf('overline') > 0) {
                        $('.pdp_edit_font_style .overline').addClass("active");
                    }
                    if (text_deco.indexOf('line-through') > 0) {
                        $('.pdp_edit_font_style .line-through').addClass("active");
                    }
                    $('#pdp_color').css("color",'#111');
                    if(color == '#111'){
                        $('#pdp_color_text li:eq(0) a').addClass("active");
                        //$('#pdp_color_text input').val('#111111');
                    }else{
                        $('#pdp_color_text li a').each(function(){
                           //if($(this).css('background-color')==color){
                                //$(this).addClass("active");
                           //}
                        });
                        //$('#pdp_color_text input').val('#'+rgb2hex(color));
                    }
                    $('#pdp_color_text_input').css('background-color', color);
                    $('#select_font li').removeClass("active");
                    $('#select_font li[rel="'+font_family+'"]').addClass("active");
                    //$('#select_font_span').html(font_family);
                    $('#pdp_edit_text_line_height_input').val(line_height*10);
                    $('#pdp_font_line_height_value').html(parseInt(line_height*10)+'px');
                    $('#pdp_font_size_input').val(font_size);
                    if(a.type=='curvedText'){
                        $('#use_curved').addClass('active');
                        $('.pdp_curved_text_control').show();
                    }else{
                        $('#use_curved').removeClass('active');
                        $('.pdp_curved_text_control').hide();
                    }
                },
                addSvg: function (el,pr,name,tcolor,icolor,id) {
                    fabric.loadSVGFromURL(el, function (objects, options) {
                        var loadedObject = fabric.util.groupSVGElements(objects, options),
                            center = canvas.getCenter(),
                            pos_item = parseInt($('#pdp_info_item').attr('critem'));
                        $('#pdp_info_item').attr('critem',pos_item+1);
                        if((pr =='')||((pr ==undefined))){pr=0;}
                        if((name =='')||((name ==undefined))){name='not_add';}
                        loadedObject.set({
                            //left: center.left,
                            //top: center.top,
                            perPixelTargetFind : true,
                            isrc: el,
                            price: pr,
                            tcolor: tcolor,
                            icolor: icolor,
                            name: name,
                            id: id,
                            fill: setting.color,
                            transparentCorners: true,
                            padding: setting.padding
                        });
						if (loadedObject.width > canvas.width) {
							loadedObject.scaleToWidth(canvas.width - 20);
						}
                        //if((loadedObject.path=='null')||((loadedObject.path==null))){
                            //loadedObject.set({icolor: 'svg'})
                        //}
                        loadedObject.setCoords();
                        canvas.centerObject(loadedObject);
                        loadedObject.hasRotatingPoint = true;
                        loadedObject.lockUniScaling = true;
                        canvas.add(loadedObject).setActiveObject(loadedObject);
                        //canvasEvents.center();
                        //console.log(canvas.toJSON(['name','price']));
                        canvasEvents.addlayer();
                    });
                },
                resetTextForm: function () {
                    $('#pdp_font_size_input').val(20);
                    $('#pdp_font_size_value').html('20px');
                    $('#pdp_edit_text_line_height_input').val(13);
                    $('#pdp_font_line_height_value').html('13px');
                    $('#use_shadow').attr("checked", false);
                    //$('.font_shape .h-shadow,.font_shape .v-shadow, .font_shape .blur, .font_shape .color').hide();
                    $('#add_text_action').show();
                    $("#edit_text_action, .pdp_edit_text_tab_content").hide();
                    $('#edit_text').css('opacity',0.5);
                    $('#add_text_input').val("");
                    $('#select_font_span').html("Arial").css("font-family", "Arial");
                    //$('#select_font_size').val("20");
                    $('#pdp_edit_text_tab_content').show();
                    //$('#h-shadow, #v-shadow, #t-blur').val(0);
                    //$('#font_color_div > div').css("backgroundColor", "#444");
                    $('#pdp_color_text input').val('#111111');
                    //$('#pdp_color_text #pdp_color_text_input').css('background-color','#111');
                    //$('#font_outline_color > div').css("backgroundColor", "#fff");
                    $('#font_outline_colorpicker').setColor('#FFFFFF');
                    $('#pdp_edit_text .active, #pdp_edit_text_style .active').removeClass("active");
                    $('#pdp_edit_text_tab a:eq(0),#pdp_edit_text_style .align_left').addClass('active');
                    $('#select_font li').removeClass("active");
                    $('#select_font li:eq(0)').addClass("active");
                    $('#use_curved').removeClass('active');
                    $('.pdp_curved_text_control').hide();
                },
                objectUnselected: function () {
                    //canvasEvents.resetTextForm();
                    $('#pdp_info_item li.active').removeClass('active');
                    //$('#pdp_info_item').hide();
                    $('.pdp_extra_item, .tab_content:not(#pdp_rotate_item), #font_outline_colorpicker').slideUp(400);
                    $('#edit_item_wrap .active').removeClass('active');
                    $('#edit_item_wrap').removeClass('active');
                    $('#edit_item_wrap div.item').css('opacity',.5);
                    //canvasEvents.save_design2();
                },
                clearSelected: function () {
                    this.objectUnselected();
                    canvas.deactivateAll().renderAll();
                    //canvasEvents.renderall();
                },
                centerX: function () {
                    var active = canvas.getActiveObject();
                    if (!active) return;
                    canvas.centerObjectH(active);
                    active.setCoords();
                    canvasEvents.renderall();
                },
                center: function () {
                    var active = canvas.getActiveObject();
                    if (!active) return;
                    canvas.centerObjectH(active);
                    canvas.centerObjectV(active);
                    active.setCoords();
                    canvasEvents.renderall();
                },                
                centerY: function () {
                    var active = canvas.getActiveObject();
                    if (!active) return;
                    canvas.centerObjectV(active);
                    active.setCoords();
                    canvasEvents.renderall();
                },
                rotateRight: function (canvas) {
                    var active = canvas.getActiveObject();
                    if (!active) return;
                    var angle = active.get('angle');
                    active.rotate(angle + 45);
                    active.setCoords();
                    canvasEvents.renderall();
                },
                rotateLeft: function (canvas) {
                    var active = canvas.getActiveObject();
                    if (!active) return;
                    var angle = active.get('angle');
                    active.rotate(angle - 45);
                    active.setCoords();
                    canvasEvents.renderall();
                },
                flipX: function () {
                    var active = canvas.getActiveObject();
                    if (!active) return;
                    active.flipX = active.flipX ? false : true;
                    active.setCoords();
                    canvasEvents.renderall();
                },
                flipY: function () {
                    var active = canvas.getActiveObject();
                    if (!active) return;
                    active.flipY = active.flipY ? false : true;
                    active.setCoords();
                    canvasEvents.renderall();
                },
                load_json: function (objs) {
                    var json = JSON.parse(objs);
                    var objects = json.objects;
                    canvas.clear();
                    $('#pdp_info_item').attr('critem',objects.length);
                    /*for (var i = 0; i < objects.length; i++) {
                        if(objects[i].type!='text'){
                            objects[i].perPixelTargetFind = true;
                        }
                        objects[i].name = 'item_'+i;
                        var klass = fabric.util.getKlass(objects[i].type);
                        if (klass.async) {
                            klass.fromObject(objects[i], function (img) {
                                canvas.add(img);
                            });
                        } else {
                            canvas.add(klass.fromObject(objects[i]));
                        }
                    }*/
					var isSampleHasText = false;
					objects.forEach(function(o) {
                        if (o.type == "text") {
							isSampleHasText = true;
							return;
						}
                    });
					//Make sure font already loaded before render canvas
					if (!$(".pdp_side_item_content.active.first-loaded").length && isSampleHasText) {
						var loadingText = new fabric.Text('Loading...', { 
							left: 0, 
							top: 0,
							fontSize: 25,
							shadow: 'rgba(0,0,0,0.3) 5px 5px 5px',
							fontFamily: 'Impact',
							stroke: '#fff',
							strokeWidth: 1
						});
						//canvas.add(loadingText);
						setTimeout(function() {
							canvas.remove(loadingText);
							canvasEvents.renderall();
							$(".pdp_side_item_content.active").addClass("first-loaded");
						}, defaultRenderTime);
					}
                    fabric.util.enlivenObjects(objects, function(objects) {
                        var origRenderOnAddRemove = canvas.renderOnAddRemove;
                        canvas.renderOnAddRemove = false;
                        objects.forEach(function(o) {
                            canvas.add(o);
                        });
                        canvas.renderOnAddRemove = origRenderOnAddRemove;
                        canvas.renderAll();
                    });
                },
                copyObject: function () {
                    var active = canvas.getActiveObject();
                    if (!active) return;
                    if (fabric.util.getKlass(active.type).async) {
                        active.clone(function (clone) {
                            clone.set({
                                transparentCorners: true,
                                cornerColor: setting.border
                            })
                            canvas.add(clone);
                        });
                    } else {
                        canvas.add(active.clone().set({
                            transparentCorners: true,
                            cornerColor: setting.border
                        }));
                    }
                    canvasEvents.addlayer();
                    canvasEvents.renderall();
                },
                removeObject: function () {
                    var active = canvas.getActiveObject();
                    if (active) {
                        $('#pdp_info_item li[rel="'+active.name+'"]').remove();
                        canvas.remove(active);
                        canvasEvents.renderall();
                    }
                },
                moveObject: function (direction) {
                    var active = canvas.getActiveObject();
                    if (active) {
                        if (direction == 'up') {
                            active.setTop(active.getTop() - 1).setCoords();
                            canvasEvents.renderall();
                        } else if (direction == 'down') {
                            active.setTop(active.getTop() + 1).setCoords();
                            canvasEvents.renderall();
                        } else if (direction == 'left') {
                            active.setLeft(active.getLeft() - 1).setCoords();
                            canvasEvents.renderall();
                        } else if (direction == 'right') {
                            active.setLeft(active.getLeft() + 1).setCoords();
                            canvasEvents.renderall();
                        }
                    }
                },
                applyFilter: function (index, filter) {
                    var obj = canvas.getActiveObject();
                    obj.filters[index] = filter;
                    obj.applyFilters(canvas.renderAll.bind(canvas));
                },
                changeTextColor: function (color) {
                    var activeObject = canvas.getActiveObject();
                    if(!activeObject) return;
                    if((activeObject.type =='text')||(activeObject.type=='path')){
                        if(color=='transparent'){
                            activeObject.set("fill", '#FFF');
                        }else{
                            activeObject.set("fill", color);
                        }
                        canvas.renderAll();
                    }
                },
                changeColor: function (color) {
                    var activeObject = canvas.getActiveObject();
                    if(!activeObject) return;
                    if((activeObject.type =='text')||(activeObject.type=='path')){
                        if(color=='transparent'){
                            activeObject.set("fill", '#FFF');
                        }else{
                            activeObject.set("fill", color);
                        }
                    }else{
                        if(color=='transparent'){
                            activeObject.set("fill", '#111');
                            //canvasEvents.applyFilter(12, false);
                        }else{
                            /*filters = new fabric.Image.filters.Tint({
                                color: color
                            }); */
                            activeObject.set("fill", color);
                            //canvasEvents.applyFilter(12, filters);
                        }
                    }
                    canvasEvents.renderall();
                },
                save_png: function(img_bg,inlay,index){
                    if (!fabric.Canvas.supports('toDataURL')) {
                        alert('This browser doesn\'t provide means to serialize canvas to an image');
                    } else {
                        canvasEvents.clearSelected();
                        var inlay_info = inlay.split(',');
                        //canvas_f.item(0).setVisible(0);
                        $('#pdp_result_2').html('<canvas id="canvas_export_2"></canvas>');
                        $('#canvas_export_2').attr({
                            'width': inlay_info[0],
                            'height': inlay_info[1]
                        });
                        var canvas_export_2 = new fabric.Canvas('canvas_export_2', {
                            opacity: 1
                        });
                        var json = JSON.parse(pdp_history[index]);
                        var objects = json.objects;
                        //console.log(pdp_history[index]);
                        for (var i = 0; i < objects.length; i++) {
                            var klass = fabric.util.getKlass(objects[i].type);
                            if (klass.async) {
                                klass.fromObject(objects[i], function (img) {
                                    canvas_export_2.add(img);
                                });
                            } else {
                                canvas_export_2.add(klass.fromObject(objects[i]));
                            }
                        };
                        canvas_export_2.renderAll();
                        $('#pdp_canvas_result').html('<canvas id="canvas_export"></canvas>');
                        $('#canvas_export').attr({
                            'width': inlay_info[4],
                            'height': inlay_info[5]
                        });
                        var canvas_export = new fabric.Canvas('canvas_export', {opacity: 1});
                        canvas_export.setBackgroundImage(img_bg, canvas_export.renderAll.bind(canvas_export));
                        fabric.Image.fromURL(canvas_export_2.toDataURL('png'), function (image) {
                            image.set({
                                //left: canvas_export_info.left_f,
                                //top: canvas_export_info.top_f,
                                left: parseFloat(inlay_info[3]),
                                top: parseFloat(inlay_info[2]),
                                width: inlay_info[0],
                                height: inlay_info[1],
                                angle: 0,
                                selectable: false
                            });
                            image.transparentCorners = true;
                            image.cornerSize = 10;
                            image.scale(1).setCoords();
                            canvas_export.add(image);
                        });
                        canvas_export.renderAll();
                        //imageObj.src = canvas_f.toDataURL('png');
                        $('#pdp_canvas_result').animate({'opacity': 1}, 600, function () {
                            $('#pdp_side_items li:eq('+index+')').children('img').attr('src',canvas_export.toDataURL('png'));
                        });
                    } 
                },
                isRenderFinished : function() {
                	//console.log("Is render finished?");
                	if ($("#pdp_side_items li.rendered").length == $("#pdp_side_items li").length) {
                		clearTimeout(renderTime);
                		//console.log("All side had been rendered! Next action.....");
                		canvasEvents.actionAfterRendered();
                		return;
                	}
                	renderTime = setTimeout(canvasEvents.isRenderFinished, defaultRenderTime);
                },
                resetBeforeRender : function() {
                	//Reset render
            		$("#pdp_side_items li").removeClass("rendered");
                },
                actionAfterRendered : function() {
                	//action can be occur: preview, save template, save design, share
                	var currentAction = $("#temp_action").val();
                	switch(currentAction) {
                		case "SAVE_ADMIN_TEMPLATE" :
                			canvasEvents.saveJsonFileAndImage();
                			break;
                		case "PREVIEW" :
                			$('#pdp2_zoom_content').remove();
							$('#pdp_design_popup').append('<div id="pdp2_zoom_content"><span class="inlay"></span><div id="pdp2_zoom_img"><img src="'+$('#pdp_side_items li.active img').attr('src')+'" /><span class="close"></span></div></div>');
            	   	        $('body').on("click", "#pdp2_zoom_content .close", function(){
								$('#pdp2_zoom_content').hide();
            	   	        });
            	   	        $('#pdp2_zoom_img img').attr('src',$('#pdp_side_items li.active img').attr('src'));
							$('#pdp2_zoom_content').show();
            	   	        $(".pdploading").hide();
                			break;
						case "SHARE" :
							canvasEvents.saveJsonBeforeShare();
							break;
						case "DOWNLOAD" :
							$('#pdp2_zoom_content').remove();
							$('#pdp_design_popup').append('<div id="pdp2_zoom_content"><span class="inlay"></span><div id="pdp2_zoom_img"><img src="'+$('#pdp_side_items li.active img').attr('src')+'" /><a id="export_image" href="">Press this button to download and close</a></div></div>');
            	   	        $('#pdp2_zoom_img img').attr('src',$('#pdp_side_items li.active img').attr('src'));
            	   	        $('#pdp2_zoom_content').show();
            	   	        $("#export_image").attr("href", $("#pdp_side_items .active img").attr("src"));
            	   	        var downloadName = "Customize-product-" + $("#current_product_id").val() + "-" + $("#pdp_side_items .active").attr("id") + ".png" ;
							$("#export_image").attr("download", downloadName);
							if ($("#is_backend").length) {
            	   	        	$("#pdp2_zoom_content_backend").remove();
            	   	        	$("body").append("<div id='pdp2_zoom_content_backend'></div>");
            	   	        	$("#pdp2_zoom_content_backend").html($('#pdp2_zoom_content').parent().html());
            	   	        }
							$("body").on("click", "#export_image", function() {
								//Front
								$('#pdp2_zoom_content').hide();
								$('#pdp2_zoom_content_backend').html("");
							});
							$(".pdploading").hide();
							break;
                		default : 
                			console.log("Current Action" + currentAction, "Do nothing");
                			break;
                	}
                },
                save_design2: function(isDrawAndSave){
                	if(isDrawAndSave !== true) {
                		return false;
                	}
                    var info_save = '';
                    if (!fabric.Canvas.supports('toDataURL')) {
                        alert('This browser doesn\'t provide means to serialize canvas to an image');
                    } else {
                    	canvasEvents.resetBeforeRender();
                    	//Reset panel
                    	allSidePanel = {};
                    	var json;
                    	$("#pdp_side_items li").each(function(index, side) {
                    		json = JSON.parse(pdp_history[index]);
                    		var bgImg = document.getElementById("thumbnail_" + this.id.replace("side_", ""));
                    		//console.log(bgImg.naturalWidth, bgImg.naturalHeight, bgImg.src);
                    		allSidePanel[this.id] = {
                        			'temp_canvas' : null,
                        			'final_canvas' : null,
                        			'json' : json,
                        			'background' : m + 'media/pdp/images/' + $(this).attr('side_img'),
                        			'inlay_info' : $(this).attr("inlay").split(","),
                        			'final_canvas_width' : bgImg.naturalWidth,
                        			'final_canvas_height' : bgImg.naturalHeight
                        	};
                    		canvasEvents.renderSide($(this), this.id, defaultRenderTime);
                    	});
                    	renderTime = setTimeout(canvasEvents.isRenderFinished, defaultRenderTime);
                    }
                },
                // Render canvas and export png file
                renderSide : function(sideSelector, sideId, renderTime) {
                	$(".pdploading").show();
                	//Remove canvas if exists;
                	//console.log("Start Render" + sideId);
                	$("#temp_canvas_" + sideId).remove();
                	$("#final_canvas_" + sideId).remove();
	                $('#pdp_canvas_result').append('<canvas id="temp_canvas_' + sideId + '"></canvas><canvas id="final_canvas_' + sideId + '"></canvas>');
	                
	                $("#final_canvas_" + sideId).attr({
                		'width' : allSidePanel[sideId]['final_canvas_width'],
                		'height': allSidePanel[sideId]['final_canvas_height']
                	});
	                
	                $("#temp_canvas_" + sideId).attr({
	                    'width' : allSidePanel[sideId]['inlay_info'][0],
	                    'height': allSidePanel[sideId]['inlay_info'][1]
	                });
	                allSidePanel[sideId]['final_canvas'] = new fabric.Canvas('final_canvas_' + sideId, {opacity: 1});
	                allSidePanel[sideId]['temp_canvas'] = new fabric.Canvas('temp_canvas_' + sideId, {opacity: 1});
	                allSidePanel[sideId]['final_canvas'].setBackgroundImage(allSidePanel[sideId]['background'], allSidePanel[sideId]['final_canvas'].renderAll.bind(allSidePanel[sideId]['final_canvas']));
	                var objects = allSidePanel[sideId]['json'].objects;
	                fabric.util.enlivenObjects(objects, function(objects) {
	                    var origRenderOnAddRemove = allSidePanel[sideId]['temp_canvas'].renderOnAddRemove;
	                    allSidePanel[sideId]['temp_canvas'].renderOnAddRemove = false;
	                    allSidePanel[sideId]['temp_canvas'].stateful = false;
	                    objects.forEach(function(o) {
	                    	allSidePanel[sideId]['temp_canvas'].add(o);
	                    });
	                    allSidePanel[sideId]['temp_canvas'].renderOnAddRemove = origRenderOnAddRemove;
	                });
	                // Need time for render temp canvas: 1000 milisecond for test
	                allSidePanel[sideId]['temp_canvas'].renderAll();
	                setTimeout(function() {
	                	fabric.Image.fromURL(allSidePanel[sideId]['temp_canvas'].toDataURL('png'), function (image2) {
	                        image2.set({
	                            left: parseFloat(allSidePanel[sideId]['inlay_info'][3]),
	                            top: parseFloat(allSidePanel[sideId]['inlay_info'][2]),
	                            width: allSidePanel[sideId]['inlay_info'][0],
	                            height: allSidePanel[sideId]['inlay_info'][1],
	                            angle: 0,
	                            selectable: false
	                        });
	                        image2.transparentCorners = true;
	                        image2.cornerSize = 10;
	                        image2.scale(1).setCoords();
	                        //Try to speed up render time
	                        allSidePanel[sideId]['final_canvas'].renderOnAddRemove = false;
	                        allSidePanel[sideId]['final_canvas'].stateful = false;
	                        allSidePanel[sideId]['final_canvas'].add(image2);
	                        // Need time for render canvas_export: 1000 milisecond for test
	                        allSidePanel[sideId]['final_canvas'].renderAll();
	    	                //$('#pdp_canvas_result').animate({'opacity': 1}, renderTime * 2, function () {
	    	                	sideSelector.children('img').attr('src', allSidePanel[sideId]['final_canvas'].toDataURL('png'));
	    	                	//console.log("Side "+ sideId +" rendered 100%");
	    	                	sideSelector.addClass("rendered");
	    	                	//console.log(allSidePanel[sideId]);
	    	                //});
	                    });
	                }, defaultRenderTime);
                },
                saveJsonFileAndImage : function() {
                	canvasEvents.clearSelected();
            	    //$('#main_image').animate({'opacity': 1}, 1000, function () {
            	        var f = $('#skin_url').val(),
            	            g = $('#base_dir').val(),i=0;
            	            mitem = parseInt($('#pdp_side_items li').length),
            	            dt = {
            	                items : []
            	            };
            			var allAjaxRequests = new Array();
            			$('#pdp_side_items li').each(function() {
            				var index = $(this).index(),
            	                d = $(this).children('img').attr('src'),
            	                b64 = d.split(':');
            				if(b64[0] == 'data'){
            					var data = {
            						base_dir: g,
            						data: d,
            						index : index
            					},
            					url = m + "js/pdp/saveanimage.php",
            					ajaxRequest = PDPAction.deferredRequest(url, data, function(response) {
            						var jsonData = JSON.parse(response);
            						$('#pdp_side_items li:eq('+jsonData.index+')').children('img').attr('src',jsonData.path);
            					});
            					allAjaxRequests.push(ajaxRequest);
            	            }	
            			});
            			$.when.apply(null, allAjaxRequests).done(function() {
            				$('#pdp_side_items li').each(function() {
            					item = {
            						side_name   : $(this).attr('label'),
            						side_img    : $(this).attr('side_img'),
            						json        : pdp_history[$(this).index()],
            						image_result: $(this).find('img').attr('src'),
                                    final_price  : $('#pdp_total_layer_price .layer_pricing').attr('pr')
            					}
            					dt.items.push(item);	 
            				});
            				//Save JSON File
            				var saveJsonUrl = m + 'index.php/pdp/index/saveJsonfile';
            				var jsonString = JSON.stringify(dt);
            				if (jsonString != "") {
            					var isValidJson = true;
            					try {
            						var jsonObject = JSON.parse(jsonString);
            					} catch(e) {
            						isValidJson = false;
            					}
            					if (isValidJson) {
            						//Backend area or frontend
            						var isBackend = false;
            						if ($("#is_backend").length) {
            							isBackend = true;
            						}
            						var sendJSON = PDPAction.deferredRequest(saveJsonUrl, { json_file : jsonString}, function(response) {
            							var jsonData = $.parseJSON(response);
            							$("input[name='extra_options']").val(jsonData.filename);
            						});
            						$.when(sendJSON).done(function(response) {
            							$('.pdploading').hide();
            							//Remove rendered class
            							//$("#pdp_side_items li").removeClass("rendered");
            							if (!isBackend) {
            								$('#pdp_design_popup').hide(500);
            								$('.product-view .product-img-box .product-image img').attr('src',$('#pdp_side_items li:eq(0)').children('img').attr('src'));
            								$('.product-view .product-img-box .product-image').append('<span class="loadinggif"></span>');
            								$('.product-view .product-img-box .product-image img').load(function(){
            									$('.product-view .product-img-box .product-image .loadinggif').remove();
            								});
            								if(mitem > 1){
            								    $('.more-views').remove(); 
            									if($('.product-view .product-img-box .pdp_more_view').length == 0){
            										$('.product-view .product-img-box').append('<div class="more-views"><h2>More View</h2><ul class="pdp_more_view"></ul></div>');
            									}else{
            										$('.pdp_more_view').html('');
            									}
            								}
            								$('#pdp_side_items li').each(function(){
            									$('.pdp_more_view').append('<li><img class="pdp-thumb" width="56" height="56" src="'+$(this).find('img').attr('src')+'" /></li>');
            								});
            								$('.pdp_more_view li img').click(function(){
            									$('.product-view .product-img-box .product-image img').attr('src',$(this).attr('src')); 
            								});
            								/********************************** RELOAD PRICE **********************************/
            								if ($("#product_price_config").length) {
            									var productPriceConfig = JSON.parse($("#product_price_config").val());
                								var extraPrice = parseFloat($('#pdp_total_layer_price .layer_pricing').attr('pr'));
                								productPriceConfig.productPrice = productPriceConfig.productPrice + extraPrice;
                								productPriceConfig.productOldPrice = productPriceConfig.productOldPrice + extraPrice;
                								optionsPrice = new Product.OptionsPrice(productPriceConfig);
                								try {
                									optionsPrice.reload();
                								} catch(error) {
                									console.log(error);
                								}
            								}
											/********************************** End RELOAD PRICE **********************************/
            							} else {
            								//Save file name as an template
            								var url = $("#url_site").val() + "pdp/index/saveAdminTemplate",
            									currentProductId = $("#current_product_id").val(),
            									data = {
            										product_id : currentProductId, 
            										pdp_design : $("input[name='extra_options']").val()
            									};
            								PDPAction.doRequest(url, data, function(response) {
            									//console.log('Done And Close Popup', response);
            									if (window.top.Windows !== undefined) {
            										window.top.Windows.closeAll();
            									} else {
            										$(".pdploading").hide();
            										//location.reload();
            									}
            	                                
            								});
            							}
            						});
            					}
            				}
            			});
            	    //});
                },
				saveJsonBeforeShare : function() {
					canvasEvents.clearSelected();
					var f = $('#skin_url').val(),
							g = $('#base_dir').val(),i=0;
							mitem = parseInt($('#pdp_side_items li').length),
                            price = $('#pdp_total_layer_price .layer_pricing').attr('pr'),
							dt = {
								items : []
							};
					var allAjaxRequests = new Array();
					$('#pdp_side_items li').each(function() {
						var index = $(this).index(),
							d = $(this).children('img').attr('src'),
							b64 = d.split(':');
						if(b64[0] == 'data'){
							var data = {
								base_dir: g,
								data: d,
								index : index
							},
							url = m + "js/pdp/saveanimage.php",
							ajaxRequest = PDPAction.deferredRequest(url, data, function(response) {
								var jsonData = JSON.parse(response);
								$('#pdp_side_items li:eq('+jsonData.index+')').children('img').attr('src',jsonData.path);
							});
							allAjaxRequests.push(ajaxRequest);
						}	
					});
					$.when.apply(null, allAjaxRequests).done(function() {
						$('#pdp_side_items li').each(function() {
							item = {
								side_name   : $(this).attr('label'),
								side_img    : $(this).attr('side_img'),
								json        : pdp_history[$(this).index()],
								image_result: $(this).find('img').attr('src')
							}
							dt.items.push(item);	 
						});
						//Save JSON File
						var saveJsonUrl = m + 'index.php/pdp/index/saveJsonfile';
						var jsonString = JSON.stringify(dt);
						if (jsonString != "") {
							var isValidJson = true;
							try {
								var jsonObject = JSON.parse(jsonString);
							} catch(e) {
								isValidJson = false;
							}
							if (isValidJson) {
								var sendJSON = PDPAction.deferredRequest(saveJsonUrl, { json_file : jsonString}, function(response) {
									var jsonData = $.parseJSON(response);
									$("input[name='share_json']").val(jsonData.filename);
								});
								$.when(sendJSON).done(function(response) {
									$('.pdploading').hide();
									//Save file name as an template
									var url = $("#save_design_url").val(),
										currentProductId = $("#current_product_id").val(),
										data = {
											product_id : currentProductId, 
											pdpdesign : $("input[name='share_json']").val(),
											url : $("#product_url").val()
										};
									PDPAction.doRequest(url, data, function(response) {
										//console.log('Done Save Before Share', response);
										var jsonData = $.parseJSON(response);
										var thumbnails = $.parseJSON(jsonData.final_images);
										//Reset pinterest share container
										$(".pinterest-share-thumbnail").html("");
										if(thumbnails.length) {
											$.each(thumbnails, function(index, thumb) {
												console.log(thumb);
												var sideThumb = '<img src="' + thumb.image + '"/>';
												$(".pinterest-share-thumbnail").append(sideThumb);
											});
										}
										//Update share url
										for(var i = 0; i < addthis.links.length; i++){
											//console.log(addthis);
											addthis.links[i].share.url = jsonData.url;
										}
										//Set pinterest thumbnail image
										var addthis_config = {
											image_container: ".pinterest-share-thumbnail"
											//image_include: "pinterest-thumb",
											//image_exclude: "pdp-thumb"
										}
										//$("#pinterest_image").attr("src", $("#pdp_side_items li.active img").attr("src"));
										//$("#pinterest_image").attr("title", title);
										$(".pdploading").hide();
										//$('.pdp_share_buttons').slideToggle(0);
										$(".pdp_share_buttons").animate({"height": "55px"}, "fast");
										setTimeout(function() {
											 $(".pdp_share_buttons").css({"opacity" : "1"});
										},700);
										$('.pdp_share_buttons').slideToggle('fast');
									});
									
								});
							}
						}
					});
				},
                save_design: function(index,w,h){
                    $('#save_design').addClass('loading');
                    var info_save = '';
                    if (!fabric.Canvas.supports('toDataURL')) {
                        alert('This browser doesn\'t provide means to serialize canvas to an image');
                    } else {
                        var img_bg  = m+'media/pdp/images/'+$('#pdp_side_items li:eq('+index+')').attr('side_img'),
                            inlay   = $('#pdp_side_items li:eq('+index+')').attr('inlay');
                        //window.open(canvas.toDataURL('png'));
                        canvasEvents.clearSelected();
                        var inlay_info = inlay.split(',');
                        $('#pdp_canvas_result').html('<canvas id="canvas_export"></canvas>');
                        $('#canvas_export').attr({
                            'width' : w,
                            'height': h
                        });
                        var canvas_export = new fabric.Canvas('canvas_export', {opacity: 1});
                        canvas_export.setBackgroundImage(img_bg, canvas_export.renderAll.bind(canvas_export));
                        fabric.Image.fromURL(canvas.toDataURL('png'), function (image) {
                            image.set({
                                //left: canvas_export_info.left_f,
                                //top: canvas_export_info.top_f,
                                left: parseFloat(inlay_info[3]),
                                top: parseFloat(inlay_info[2]),
                                width: inlay_info[0],
                                height: inlay_info[1],
                                angle: 0,
                                selectable: false
                            });
                            image.transparentCorners = true;
                            image.cornerSize = 10;
                            image.scale(1).setCoords();
                            canvas_export.add(image);
                        });
                        canvas_export.renderAll();
                        //imageObj.src = canvas_f.toDataURL('png');
                        $('#pdp_result').animate({'opacity': 1}, 600, function () {
                            $('#save_design').removeClass('loading');
                            $('#pdp_side_items li:eq('+index+')').children('img').attr('src',canvas_export.toDataURL('png'));
                            $('#pdp_result').html('');
                            //$('#pdp_result').append('<img width="120" src="' + canvas_export.toDataURL('png') + '">');
                        });
                    }
                },
                save_design_json: function(){
                    var string_json = {
                        title: $('.product-title').html(),
                        sides: []
                    };
                    $('#pdp_side_items li').each(function(){
                         var json = {
                            label: $(this).attr('label'),
                            inlay: $(this).attr('inlay'),
                            img: $(this).attr('side_img'),
                            thumnail: $(this).children('img').attr('src'),
                            canvas: pdp_history[$(this).index()]
                         };
                         string_json.sides.push(json);
                    });
        			return JSON.stringify(string_json);
                },
        		saveSampleDesign : function () {
        			$("#save_sample_design").click(function() {
        				var jsonString = canvasEvents.save_design_json();
        				$.ajax({
        					type : "POST",
        					url : $("#url_site").val() + "index.php/pdp/view/saveSampleDesign",
        					data : { json_string : jsonString},
        					beforeSend : function() {
        					
        					},
        					error : function() {
        						console.log("Something went wrong...!");
        					},
        					success : function(data) {
        						var jsonData = $.parseJSON(data);
        						if (jsonData.success) {
        							alert(jsonData.message);
        						}
        						if (jsonData.error) {
        							alert(jsonData.message);
        						}
        					}
        				});
        			});
        		},
                centerCanvas: function(){
                    var w_wrap = $('.wrapper_pdp').width(),
                        w_canvas = $('.wrap_inlay_center').width();
                    $('.wrap_inlay_center').css("margin-left",(w_wrap-w_canvas)/2+'px');
                },
				downloadSideImage : function() {
        			$("#download_image").click(function() {
        			    canvasEvents.renderall(); 
        				var currentAction = $("#temp_action").val("DOWNLOAD");
        	    	   	var activeSide = $("#pdp_side_items li.active");
        	    	   	var json = JSON.parse(pdp_history[activeSide.index()]);
        		   		var bgImg = document.getElementById("thumbnail_" + activeSide.attr("id").replace("side_", ""));
        		   		//console.log(bgImg.naturalWidth, bgImg.naturalHeight, bgImg.src);
        		   		allSidePanel[activeSide.attr("id")] = {
        		       			'temp_canvas' : null,
        		       			'final_canvas' : null,
        		       			'json' : json,
        		       			'background' : m + 'media/pdp/images/' + activeSide.attr('side_img'),
        		       			'inlay_info' : $(activeSide).attr("inlay").split(","),
        		       			'final_canvas_width' : bgImg.naturalWidth,
        		       			'final_canvas_height' : bgImg.naturalHeight
        		       	};
        		   		canvasEvents.resetBeforeRender();
        		   		//Render only active side, make other side as rendered
        		   		$("#pdp_side_items li").not(".active").addClass("rendered");
        		   		canvasEvents.renderSide(activeSide, activeSide.attr("id"), defaultRenderTime);
        		   		renderTime = setTimeout(canvasEvents.isRenderFinished, defaultRenderTime);
        			});
        		}()
            }
       ////////////////////////////////////Zoom////////////////////////////////////////////////////
       $('#pdp2_zoom').click(function(){
            canvasEvents.renderall();
    	   	var currentAction = $("#temp_action").val("PREVIEW");
    	   	var activeSide = $("#pdp_side_items li.active");
    	   	var json = JSON.parse(pdp_history[activeSide.index()]);
	   		var bgImg = document.getElementById("thumbnail_" + activeSide.attr("id").replace("side_", ""));
	   		//console.log(bgImg.naturalWidth, bgImg.naturalHeight, bgImg.src);
	   		allSidePanel[activeSide.attr("id")] = {
	       			'temp_canvas' : null,
	       			'final_canvas' : null,
	       			'json' : json,
	       			'background' : m + 'media/pdp/images/' + activeSide.attr('side_img'),
	       			'inlay_info' : $(activeSide).attr("inlay").split(","),
	       			'final_canvas_width' : bgImg.naturalWidth,
	       			'final_canvas_height' : bgImg.naturalHeight
	       	};
	   		canvasEvents.resetBeforeRender();
	   		//Render only active side, make other side as rendered
	   		$("#pdp_side_items li").not(".active").addClass("rendered");
	   		canvasEvents.renderSide(activeSide, activeSide.attr("id"), defaultRenderTime);
	   		renderTime = setTimeout(canvasEvents.isRenderFinished, defaultRenderTime);
       });
       //////////////////////////////////////////////////////////////////////
       $('#font_color_list li a[rel="000000"]').addClass('active');
       //////////////////////////////////////////////////////////////////////
       $('.pdp_design_color').prepend('<li id="pdp_color_ori" name="pdp_color_ori" class="active"></li>');
       $('.pdp_design_color li').click(function(){
            $('.pdp_design_color li.active').removeClass('active');
            $(this).addClass('active');
            $('#pdp_side_items li').each(function(){
                var cr_tab = $(this).attr('tab'),
                    img = $('.pdp_design_color li.active').attr(cr_tab);
                $(this).attr('side_img',img).children('img').attr('src',m + 'media/pdp/images/' + img);
            })
            PDPsetting.change_image();
       });
       //////////////////////////////////////////////////////////////////////
       $('#prices_layer tbody').on('click','tr',function(){
         if(!$(this).hasClass('active')){
            $('.prices_layer tbody tr.active').removeClass('active');
            $(this).addClass('active');
         }
         canvasEvents.activeobj($(this).attr('rel'));
      }); 
    var num_item_pdp_side_items = $('#pdp_side_items li').length;
    if(num_item_pdp_side_items==1){$('#pdp_rotate_item, #rotate-180').hide();}
    //////////////////////////////////Save FUNCTION/////////////////////////////////////////////////////////////////
    $('#save_design').click(function(e){
    	//Set action before render
    	$("#temp_action").val("SAVE_ADMIN_TEMPLATE");
        ///$("#pdp_side_items li").each(function(index, side) {
            //json = JSON.parse(pdp_history[index]);
            //console.log(json);
        //})
        //return false;
        canvasEvents.renderall();
    	canvasEvents.save_design2(true);
    });
    /////////////////////////////// SHARE FUNCTION /////////////////////
    $("body").on("click", "#pdp_share", function(e) {
		$("#temp_action").val("SHARE");
		canvasEvents.save_design2(true);
    });
            ///////////////////////////Setting////////////////////////
            setting = {
                color: '#000',
                border: '#88AFFB',
                padding: 5,
                cornerSize: 8,
                center_canvas : function(){
                    var w_pdp_wapper = $('.wrap_pdp_design').width();
                    $(".product-image").each(function(){
                        $(".product-image").hide();
                        $(this).show();
                        var w_canvas = $(this).find('.wrap_inlay_center img').width();
                        $(this).find('.wrap_inlay_center').css({'margin-left':(w_pdp_wapper-w_canvas)/2+'px','float':'left'}); 
                    });
                    $(".product-image:not(.act)").hide();
                    $(".product-image.act").show();
                    canvasEvents.renderall();
                },
                first_category: function(){
                    var first_item = $('#image_category_list li:eq(0) span').text();
                    $('.pdp_selected_category').html(first_item);
                },
                active_slider: function(){
                    $('#h-shadow').noUiSlider({
                		range: [-50,50],
                		start: [0],
                        handles: 1,
                        slide: function(){
                            canvasEvents.editShadowItem();
                        }
                	});  
                    $('#v-shadow').noUiSlider({
                		range: [-50,50],
                		start: [0],
                        handles: 1,
                        slide: function(){
                            canvasEvents.editShadowItem();
                        }
                	}); 
                    $('#t-blur').noUiSlider({
                		range: [0,50],
                		start: [0],
                        handles: 1,
                        slide: function(){
                            canvasEvents.editShadowItem();
                        }
                	}); 
                    $('#pdp_opacity_input').noUiSlider({
                		range: [0,10],
                		start: [10],
                        handles: 1,
                        slide: function(){
                          var opacity = $(this).val()/10;
                            var active = canvas.getActiveObject();
                            if(!active) return;
                            active.set("opacity",opacity);
                            if(active.type=='curvedText'){
                                active.setOpacity(active.text,opacity);
                            }
                            canvas.calcOffset().renderAll();
                        },
                        serialization: {
                    		
                    	}
                	});
                    $('#pdp_opacity_input,#v-shadow,#t-blur,#h-shadow').change(function(){
                        canvasEvents.renderall();
                	});
                    $('#pdp_font_size_input').noUiSlider({
                		range: [1,200],
                		start: [20],
                        handles: 1,
                        slide: function(){
                            //canvasEvents.editItem();
                            //canvasEvents.editText();
                            $('#pdp_font_size_value').html(parseInt($(this).val())+'px');
                        }
                	});
                    $('#pdp_font_size_input').change(function(){
                        canvasEvents.editText();
                    });
                    $('#font_color').hide().click(function(){
                        $('#font_color_colorpicker').toggle();
                    })
                    $('#font_color_colorpicker_value').click(function(){
                        $('#font_color_colorpicker').toggle();
                    })
                    $('#font_color_colorpicker_value').keyup(function(){
                        var color = $(this).val();
                        $(this).css('background-color',color);
                        canvasEvents.changeTextColor(color);
                    })
                    $('#pdp_edit_text_line_height_input').noUiSlider({
                		range: [1,100],
                		start: [13],
                        handles: 1,
                        slide: function(){
                            //canvasEvents.editItem();
                            canvasEvents.editText();
                            $('#pdp_font_line_height_value').html(parseInt($(this).val())+'px');
                        }
                	});
                    $('#font_outline_colorpicker').farbtastic(function(color) {
                        $("#font_outline_color_value").css("background-color", color);
                        canvasEvents.editShadowItem();
                        $("#font_outline_color_value").val(color);
                    });
                    $('#font_color_colorpicker').farbtastic(function(color) {
                        $("#font_color").css("color", color);
                        canvasEvents.changeTextColor(color);
                        //canvasEvents.editShadowItem();
                        $("#font_color_colorpicker_value").val(color).css('background-color',color);
                    });
                    //.farbtastic('#font_outline_color_value');
                }
            }
            setting.first_category();
            setting.active_slider();
            //document.getElementById('files_upload').addEventListener('change', PDPsetting.handle_files_select, false);
            $('.size_qty, #select_font_size, #h-shadow, #v-shadow, #t-blur').ForceNumericOnly();
            var first_item;
            if($('#pdp_side_items li.active').length > 0){
                first_item = $('#pdp_side_items li.active');
            }else{
                first_item = $('#pdp_side_items li:eq(0)')
            }
            $('#select_font li').each(function(){
                $(this).css('font-family',$(this).attr('rel'));
            });
            $('#select_font li').click(function () {
                $('#select_font li.active').removeClass("active");
                $(this).addClass("active");
                canvasEvents.editText();
            }); 
            PDPsetting.center_design_area();
            first_item.addClass('active');
            var inlay = first_item.attr('inlay').split(',');
            $('#wrap_inlay').css({
                "width" : inlay[0] + 'px',
                "height": inlay[1] + 'px',
                "top"   : inlay[2] + 'px',
                "left"  : inlay[3] + 'px'
            });
            /////////////////////////////////Setup the first Canvas//////////////////////////
            $('#canvas_area').attr({
                'width': inlay[0],
                'height': inlay[1]
            });
            canvas = new fabric.Canvas('canvas_area', { });
            //canvas.setOverlayImage
            $('#pdp_side_items li').each(function(){
                $('.wrapper_pdp').append($(this).children('img').clone().addClass('pdp_img_session_'+$(this).index()).removeAttr('width').hide());            
                //pdp_history[$(this).index()] = JSON.stringify(canvas);
                $('#pdp_color_ori').attr($(this).attr('tab'),$(this).attr('side_img'));
                pdp_history[$(this).index()] = JSON.stringify(canvas.toJSON(['name','price','tcolor','isrc','icolor','id']));
            });
            var pdp_current_design = "";
			if ($('input[name=pdp_design_string]').length) {
				if ($('input[name=pdp_design_string]').val() != "") {
					pdp_current_design = JSON.parse($('input[name=pdp_design_string]').val());
				}
			}
			if ($("#cart_item_id").length) {
				if ($("#cart_item_id").val() != "" || $("#wishlist_item_id").val() != "") {
					if($('#extra_options_value').val()) {
						pdp_current_design = JSON.parse($('#extra_options_value').val());
					}
				}
			}
            if((pdp_current_design!='')&&(pdp_current_design!= undefined)){
              $('.pdp_design_color li.active').removeClass('active');
              $('.pdp_design_color li['+$('#pdp_side_items li:eq(0)').attr('tab')+'="'+pdp_current_design.items[0].side_img+'"]').addClass('active');
              for(i=0;i<pdp_current_design.items.length;i++){
                pdp_history[i]=pdp_current_design.items[i].json;
                //$('#pdp_side_items li:eq('+i+') img').attr('src',pdp_current_design.items[i].image_result);
              }
            } 
            $('#main_image').addClass('loaded');
            $('#main_image').load(function(){
                if($('#main_image').hasClass('loaded')){
                    canvasEvents.load_json(pdp_history[0]);
                    $('#wrap_inlay').attr('tab',$('#pdp_side_items li:eq(0)').attr('tab'));
                    $('#main_image').removeClass('loaded');
                    $('.pdp_design_color li.active').click();
                    canvasEvents.addlayer_first_time();
                }
            });
            //canvasEvents.reset_canvas($('#pdp_side_items li:eq(0)').attr('tab'));
            //////////////////////////////////EDIT BOTTOM FUNCTION//////////////////////////////////////////////////////////
            $('#edit_item_wrap .item').click(function(){
               $('#edit_item_wrap .item.active').removeClass("active");
               if($(this).css("opacity")==1){
                   $(this).toggleClass("active");
                   var tab_act = $(this).attr("tab");
                   $('.pdp_extra_item:not(#'+tab_act+')').slideUp(500);
                   $('#'+tab_act).slideToggle(500);
               }else{
                   $('.pdp_extra_item').slideUp(500); 
               }
            });
            $('#pdp2_curved_text_reverse').click(function(){
        		var obj = canvas.getActiveObject();
        		if(obj){
        			obj.set('reverse',$(this).is(':checked')); 
        			canvasEvents.renderall();
        		}
        	});
            $('#pdp2_curved_text_radius').noUiSlider({
        		range: [1,200],
        		start: [100],
                handles: 1,
                slide: function(){
                    //canvasEvents.editItem();
                    //canvasEvents.editText();
                    $('#pdp2_curved_text_radius_value').val($(this).val());
                }
        	});
            $('#pdp2_curved_text_done').click(function(){
                var text = $('#pdp2_curved_text').val();
                var r = canvas.getActiveObject();
                if (!r) return;
                r.setText(text);
                canvasEvents.editText();
                canvasEvents.renderall();
            })
            $('#pdp2_curved_text_radius_value').ForceNumericOnly();
            $('#pdp2_curved_text_radius_value').change(function(){
                $('#pdp2_curved_text_radius').val($(this).val());
                canvasEvents.editText();
            })
            $('#pdp2_curved_text_spacing').noUiSlider({
        		range: [1,50],
        		start: [15],
                handles: 1,
                slide: function(){
                    //canvasEvents.editItem();
                    //canvasEvents.editText();
                    $('#pdp2_curved_text_spacing_value').val($(this).val());
                }
        	});
            $('#pdp2_curved_text_spacing_value').ForceNumericOnly();
            $('#pdp2_curved_text_spacing_value').change(function(){
                $('#pdp2_curved_text_spacing').val($(this).val());
                canvasEvents.editText();
            })
            $('#pdp2_curved_text_radius, #pdp2_curved_text_spacing').change(function(){
        		var obj = canvas.getActiveObject();
        		if(obj){
        		    if($(this).attr('id')=='pdp2_curved_text_radius'){
        		       obj.set('radius',$(this).val());
        		    }
        			if($(this).attr('id')=='pdp2_curved_text_spacing'){
        		       obj.set('spacing',$(this).val());
        		    }
        		    canvasEvents.renderall();
        		}
        	});
 /////////////////////////////////Add item to canvas//////////////////////////////////////////
            $('#icon_list, #lists_img_upload, #photos_album').on('click', 'img', function () {
                var url = $(this).attr("src"),
                    type_img = url.split('.'),
                    wimg = $(this).width(),
                    icolor = url.split('/'),
                    name = $(this).attr('image_name'),
                    id = $(this).attr('id'),
                    color_type = $(this).attr('color_type'),
                    color = $(this).attr('color');
                    himg = $(this).height();
                //canvasEvents.clearSelected();
                if(!$(this).hasClass('added_color')){
                    $(this).addClass('added_color');
                    if(color_type == 2){ canvasEvents.makelistcolor(color,id)}
                }
                var price = $(this).attr('price');
                if(price==undefined){
					var pdc_product_config = {};
					pdc_product_config.clipart_price = 0;
					if ($('#pdc_product_config').length) {
						pdc_product_config = JSON.parse($('#pdc_product_config').val());
					}
                    price = pdc_product_config.clipart_price;
                }
                $('#design_control .tab_content:not(#pdp_rotate_item)').slideUp(200);
                //$('#select_image').slideToggle(600);
                if ((type_img[type_img.length - 1] != 'svg')) {
                    fabric.Image.fromURL(url, function (image) {
						var clipartSize = scaleSize(canvas.width, canvas.height, image.width, image.height);
						//console.log(clipartSize.width, clipartSize.height);
                        image.set({
                            //left: 0,
                            //top: 0,
                            angle: 0,
                            price: price,
                            id: id,
                            isrc: url,
                            tcolor: color_type,
                            icolor: icolor[icolor.length - 1],
                            width: clipartSize.width,
							height: clipartSize.height,
                            padding: setting.padding
                        });
						//image.scaleToWidth(clipartSize.width);
                        image.transparentCorners = true;
                        image.cornerSize = 10;
                        image.scale(1).setCoords();
                        canvas.centerObject(image);
                        canvas.add(image).setActiveObject(image);
                        canvasEvents.addlayer();
                        //pdp_history.push(JSON.stringify(canvas));
                    });
                } else {
                    canvasEvents.addSvg(url,$(this).attr('price'),name,color_type,color,id);
                }
            });
			function scaleSize(maxW, maxH, currW, currH){
				var ratio = currH / currW;
				if(currW >= maxW && ratio <= 1){
					currW = maxW;
					currH = currW * ratio;
					//To show object controls inside canvas
					currH *= 0.9;
					currW *= 0.9;
				} else if( currH >= maxH){
					currH = maxH;
					currW = currH / ratio;
					currH *= 0.9;
					currW *= 0.9;
				}
				return {
					width: currW,
					height: currH
				};
			}
            ///////////////////////////////////////////////////////////Canvas setting/////////////////////////////////////////////////
            $('#edit_item_wrap').owlCarousel({
                items : 10, //10 items above 1000px browser width
                itemsDesktop : [1000,7], //5 items between 1000px and 901px
                itemsDesktopSmall : [900,4], // betweem 900px and 601px
                itemsTablet: [600,2], //2 items between 600 and 0
                itemsMobile : [340,1], // itemsMobile disabled - inherit from itemsTablet option
                lazyLoad : true,
                navigation : true,
                navigationText: ["&#xf053;","&#xf054;"],
            }); 
            /* $('.pdp_color_list ul').owlCarousel({
                items : 14, //10 items above 1000px browser width
                itemsDesktop : [1000,7], //5 items between 1000px and 901px
                itemsDesktopSmall : [900,4], // betweem 900px and 601px
                itemsTablet: [600,2], //2 items between 600 and 0
                itemsMobile : [340,1], // itemsMobile disabled - inherit from itemsTablet option
                lazyLoad : true,
                navigation : true,
                navigationText: ["&#xf053;","&#xf054;"],
            });  */
            /* $('#select_font').owlCarousel({
                items : 10, //10 items above 1000px browser width
                itemsDesktop : [1000,7], //5 items between 1000px and 901px
                itemsDesktopSmall : [900,4], // betweem 900px and 601px
                itemsTablet: [600,2], //2 items between 600 and 0
                itemsMobile : [340,1], // itemsMobile disabled - inherit from itemsTablet option
                lazyLoad : true,
                navigation : true,
                navigationText: ["&#xf053;","&#xf054;"],
            });  */
            $('.add_artwork > a').on('click',function(){
               $('.tab_content:not(#select_image, #pdp_rotate_item)').slideUp(0);
               $('#select_image').slideToggle(0);
            });
            $('.add_text > a').on('click',function(){
               $('#add_text').slideToggle(0);
               $('#font_outline_colorpicker').hide();
               $('.tab_content:not(#add_text, #pdp_rotate_item), .pdp_extra_item').slideUp(0);
               $('.pdp_text_list li.active').removeClass("active");
            });
            $('.pdp_close').click(function(){
               $(this).parents('.tab_content').slideUp(0); 
            });
            $('.pdp_text_list ul li').click(function(){
               $('.pdp_text_list ul li.active').removeClass("active");
               $('#add_text_input').val($(this).text());
               $(this).addClass("active"); 
            });
            $('.pdp_text_list ul li.active').click(function(){
               $('#add_text_action').click(); 
            });
            $('.pdp2_close').click(function(){
                $('#pdp_design_popup').hide();
            })
            //////////////////////////////////////////////////////Part 2//////////////////////////////////////////
            $('#pdp_side_items li').click(function(){
                canvasEvents.clearSelected();
                if($(this).hasClass('active')){ return };            
                //canvasEvents.save_design($('#pdp_side_items li.active').index(),$('#main_image').width(),$('#main_image').height());
                $('#pdp_side_items li.active').removeClass("active");
                $(this).addClass("active");
                var tab = $(this).attr("tab"),
                    tab_current = $('#wrap_inlay').attr('tab'),
                    tab_index = $('#pdp_side_items li[tab='+tab_current+']').index();
                if($('.product-image.act .wrap_inlay_center').attr("tab")!=tab){
                    //$('.product-image.act .wrap_inlay_center').attr("tab",tab);
                    $('#wrap_inlay').attr('tab',tab);
                    //pdp_history[tab_index] = JSON.stringify(canvas);
                    pdp_history[tab_index] = JSON.stringify(canvas.toJSON(['name','price','tcolor','isrc','icolor','id']));
                    canvasEvents.reset_canvas(tab);
                }
            });
            $('#rotate-180').click(function () {
                $('#pdp_rotate_item').slideToggle(400);
                $('.tab_content:not(#pdp_rotate_item)').slideUp(300);
            });
            ///////////////////////////////Text tab///////////////////////////
            $('#pdp_edit_text_tab a').click(function(){
               $('#pdp_edit_text_tab a.active').removeClass("active");
               $(this).addClass('active');
               $('.pdp_edit_text_tab_content').slideUp(300);
               $('#'+$(this).attr("tab")).slideDown(400);
            });
            $('.pdp_edit_font_style li a.text').click(function(){
                $(this).toggleClass("active");
                canvasEvents.editText();
            });
            $('#pdp_search_text').keyup(function(){
               var key = $(this).val().toUpperCase(); 
               $('.pdp_text_list li').each(function(){
                    if($(this).text().toUpperCase().indexOf(key)>=0){
                        $(this).show();
                    }else{
                        $(this).hide();
                    }
               });
            });
            $('#pdp_edit_text_style li a.align').click(function(){
                $('#pdp_edit_text_style li a.align.active').removeClass("active");
                $(this).addClass("active");
                canvasEvents.editText();
            });
            
            $('#pdp_font_size_value').ForceNumericOnly();
            $('#pdp_font_size_value').change(function(){
                $('#pdp_font_size_input').val($(this).val());
                var activeObject = canvas.getActiveObject();
                if(!activeObject) return;
                canvasEvents.editText();
            })
            /**
             * $('#pdp_font_size_input').bind("slider:changed", function (event, data) {
                $('#pdp_font_size_value').val($(this).val());
                var activeObject = canvas.getActiveObject();
                if(!activeObject) return;
                canvasEvents.editText();
            });
             */
            $('.wrapper_pdp .product-image').click(function () {
                $('.wrapper_pdp .product-image.act').removeClass('act');
                $(this).addClass('act');
            });
            $('.tshirt-size input').change(function () {
                if (($(this).val() == '') || ($(this).val() < 0)) {
                    $(this).val(0)
                };
                $(this).val(parseInt($(this).val()));
            });
            $('#design_control .control_tab .tab_main').click(function () {
                var a = $(this).attr("tab");
                $('#design_control .control_tab .tab_main.active').removeClass("active");
                $(this).addClass("active");
                //$('.tab_content:not(eq(0))').hide();
                $('.' + a).show()
            }); 
            $('.tab_design_image a').click(function () {
                $('.tab_design_image .active').removeClass("active");
                $(this).addClass("active");
                var tab_act = $(this).attr("tab-content");
                $('.content_tab > div').hide();
                $('.content_tab .' + tab_act).show();
            });
            
            $('#add_text_action').click(function () {
                var text1 = $('#add_text_input').val(),
                    text2 = $('.pdp_text_list li.active').text();
                if(text2!=''){
                    canvasEvents.addText(text2);
                }else{
                    if (text1 != '') {
                        canvasEvents.addText(text1);
                    }
                }
            });
            $('#add_text_curved_action').click(function () {
                var text1 = $('#add_text_input').val(),
                    text2 = $('.pdp_text_list li.active').text();
                if(text2!=''){
                    canvasEvents.addTextCurved(text2);
                }else{
                    if (text1 != '') {
                        canvasEvents.addTextCurved(text1);
                    }
                }
            });
            $('#use_shadow').click(function () {
                if(!$(this).hasClass('active')){
                    $('.font_outline_color > div').show();
                    canvasEvents.addShadowItem();
                    $(this).addClass("active");
                }else{
                    $('.font_outline_color > div:not(.use_shadow)').hide();
                    canvasEvents.removeShadow();
                    $(this).removeClass("active");
                }
                $('#font_outline_colorpicker').hide();        
            });
            $('.change_font .next_t').click(function () {
                var a = $(this).prev().val();
                $(this).prev().val(parseInt(a) + 1);
                canvasEvents.editText();
            });
            $('.change_font .prev_t').click(function () {
                var a = $(this).next().val();
                if (($(this).next().attr("id") == 't-blur') && (a == 0)) {} else {
                    if (($(this).next().attr("id") == 'select_font_size') && (a < 3)) {} else {
                        $(this).next().val(parseInt(a) - 1);
                    }
                }
                canvasEvents.editText();
            });
            $('#pdp_edit_text_input').keyup(function () {
                canvasEvents.editText();
            });
            $('#image_category_list, #select_image').show();
            var h_cate_list = $('#image_category_list').height();
            $('#image_category_list, #select_image').hide();
            $('.design_label').click(function(){
               $('#image_category_list').slideToggle(0); 
            });
            /*$('#image_category_list').hover(function(){
                $(this).stop(true,false).animate({'height': h_cate_list},600); 
            },function(){
               $(this).stop(true,false).animate({'height': '0px'},600,function(){
                    $(this).height(h_cate_list).hide();
               }); 
            }); */
            $('#font_outline_color').click(function(){
               $('#font_outline_colorpicker').slideToggle(300); 
            });
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////Change color function//////////////////////////////////////////////////////////////////////////////////////
            $('.inlay_div.color, .color_content_wrap .bt_done').click(function () {
                $('.color_content').hide();
                $('#pdp_color_text').removeClass('pdp_cr_color');
                $('.color_display').removeClass("act");
            });
            $('#pdp_color_text li a').click(function(){
                $('#pdp_color_text li a.active').removeClass("active");
                $(this).addClass("active");
                var color = $(this).css("background-color");
                canvasEvents.changeColor(color);
                
            });
            $('#pdp_color_item li a').click(function(){
                $('#pdp_color_item li a.active').removeClass("active");
                $(this).addClass("active");
                var color = $(this).css("background-color");
                canvasEvents.changeColor(color);
            });
            $('.color_content li a:not(.selected_color, .bt_done)').click(function () {
                $('.color_content li a.act').removeClass("act");
                $(this).addClass("act");
                var color;
                if($(this).hasClass("pdp_color_ori")){
                    color = 'ori';
                    $('#selected_color').val('');
                    $('.color_display.act').css('background-color', '#FFF');
                }else{
                    color = $(this).css("background-color");
                    $('#selected_color').val(rgb2hex(color));
                    $('.color_display.act').css('background-color', color);
                }
                $('a.selected_color').css("background-color", color);
                var activeObject = canvas.getActiveObject();
                if(!activeObject) return;
                if($('#pdp_color_text').hasClass('pdp_cr_color')){
                    $('#pdp_color_text input').val(rgb2hex(color));
                }
                if(activeObject.type =='text'){
                    canvasEvents.editText();
                }
                if($('#use_shadow').hasClass("active")){
                    canvasEvents.editShadowItem();
                    canvasEvents.renderall();
                }
                if($('#color_item').hasClass("active")){
                    canvasEvents.changeColor(color);
                }
            });
            $('#selected_color').change(function () {
                $('a.selected_color').css('background-color', '#' + $(this).val());
            });
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //////////////////////////////////////////////Z-index////////////////////////////////////////////////////////////////////////////
            var $sendBackwardsEl = $('#send-backwards');
            $sendBackwardsEl.on('click', function (canvas) {
                var activeObject = canvas.getActiveObject();
                if (activeObject) {
                    canvas.sendBackwards(activeObject);
                }
            });
            var $sendToBackEl = $('#send-to-back');
            $sendToBackEl.on('click', function (canvas) {
                var activeObject = canvas.getActiveObject();
                if (activeObject) {
                    canvas.sendToBack(activeObject);
                }
            });
            var $bringForwardEl = $('#bring-forward');
            $bringForwardEl.on('click', function (canvas) {
                var activeObject = canvas.getActiveObject();
                if (activeObject) {
                    canvas.bringForward(activeObject);
                }
            });
            var $bringToFrontEl = $('#bring-to-front');
            $bringToFrontEl.on('click', function (canvas) {
                var activeObject = canvas.getActiveObject();
                if (activeObject) {
                    canvas.bringToFront(activeObject);
                }
            });
            var $sendToBackEl = $('#move_to_back');
            $sendToBackEl.on('click', function () {
                var activeObject = canvas.getActiveObject();
                if (activeObject) {
                    canvas.sendToBack(activeObject);
                }
            });
            var $bringForwardEl = $('#move_to_front');
            $bringForwardEl.on('click', function () {
                var activeObject = canvas.getActiveObject();
                if (activeObject) {
                    canvas.bringForward(activeObject);
                }
            });
            $('#pdp_flip_x').on('click', canvasEvents.flipX);
            $('#pdp_flip_y').on('click', canvasEvents.flipY);
            //$('#rotateRight').on('click', canvasEvents.rotateRight);
            //$('#rotateLeft').on('click', canvasEvents.rotateLeft);
            $('#delete_item').on('click', canvasEvents.removeObject);
            $('#pdp_toolbox').on('click','.item_delete',canvasEvents.removeObject);
            $('#duplicate_item').on('click', canvasEvents.copyObject);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////Reset active/////////////////////////////////////////////////////////////////////
            $('html').on('click', function (e) {
                var target = $('#pdp_info_item, #canvas-container, #select_image, #add_text, #canvas_area, .pdp_extra_item, #pdp_opacity_item, .color_content, .control_tab, .canvas-container,#pdp_toolbox, .edit_area , #add_text, .p_rotate_wrap > div, .control_area, #edit_item_wrap').has(e.target).length;
                if (target === 0) {
                    canvasEvents.clearSelected();
                }
                var cl_target = $('#font_outline_colorpicker, #font_outline_color').has(e.target).length;
                if (cl_target===0){
                    $('#font_outline_colorpicker').slideUp(200);
                }
                var cl_target = $('#font_color_colorpicker, #font_color, .pdp_color_list').has(e.target).length;
                if (cl_target===0){
                    $('#font_color_colorpicker').slideUp(200);
                }
            });
            canvas.observe('object:selected', canvasEvents.objectSelected);
            canvas.observe('object:modified', canvasEvents.renderall);
            canvas.observe('object:modified', canvasEvents.showinfo);
            canvas.observe('object:added', canvasEvents.renderall);
            canvas.observe('before:selection:cleared', canvasEvents.objectUnselected);
            //canvas.observe('object:modified', 'canvasEvents.saveDesign'); 
            $(window).on('keydown', function (e) {
                var key = e.keyCode || e.which;
                if (key == 37) { // left arrow
                    canvasEvents.moveObject('left');
                    return false;
                } else if (key == 38) { // up arrow
                    canvasEvents.moveObject('up');
                    return false;
                } else if (key == 39) { // right arrow
                    canvasEvents.moveObject('right');
                    return false;
                } else if (key == 40) { // down arrow
                    canvasEvents.moveObject('down');
                    return false;
                } else if (key == 46) { // delete key
                    var hasFocus = $('#pdp_edit_text_input').is(':focus');
                    if(!hasFocus){
                        canvasEvents.removeObject();
                    }
                    return false;
                }
            });
            
            var pdpDesignString = $('#extra_options_value').val();
			if ($("#cart_item_id").val() == "" && $("#wishlist_item_id").val() == "") {
				if ($("input[name='pdp_design_string']").length) {
					if ($("input[name='pdp_design_string']").val() != "") {
						pdpDesignString = $("input[name='pdp_design_string']").val();
					}
				}
			}
            first_item.addClass("active");
            if(pdpDesignString != '' && pdpDesignString !== undefined){
                var json = JSON.parse(pdpDesignString);
                if(json.length > 0) {
                    for(i=0;i<json.length;i++){
                        $('#pdp_info_'+json[i].name).val(json[i].json);
                        $('.design-color-image li#'+json[i].color).click();
                    }
                }
            }else{
                PDPsetting.save_first_design();
            }
            PDPsetting.change_side();
        },
        init_cr_item: function(){
            if($('.wrap_inlay .item').length > 0) {
                if($('.design-color-image li.active').length > 0){
                    $('.design-color-image li.active').click();
                }else{
                    $('#list_color li.active').click();
                }
                $('.wrap_inlay .item').each(function () {
                    PDPsetting.init_design($(this));
                });
            }
        },
        init_design: function(__this){
            
        },
		hideShareButtons : function() {
			var targetClass;
			$("body").on("click", ".wrap_pdp_design", function(e) {
				targetClass = $(e.target).attr("class");
				if (targetClass) {
					if (targetClass.match("pdp_share_buttons") || targetClass.match("at300bs")) {
						return false;
					} else {
						//console.log("Else ", targetClass);
					}
				}
				$(".pdp_share_buttons").hide();
			});
		}()
    }
})