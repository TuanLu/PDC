var mst = jQuery.noConflict();
mst(document).ready(function($){
	/* Switch Font name */
	$('#font_menu').on('click', function(){
		$(this).toggleClass("showClose");
		$('#select_font').toggleClass("showme");
	});
	$('#select_font').on('click','li',function(){
		$('#font_menu').html('<span style="font-family: arial;">Font:</span> <i class="pi  pi-check"></i>'+$(this).attr('rel'));
		$('#font_menu').css('font-family',$(this).attr('rel')); 
	});
	/* Switch Text Color */
	$('#font_color').on('click', function(){
		$(this).toggleClass("showClose");
		$('#font_color_list').toggleClass("showme");
	});
	$('#font_color_list').on('click','li a',function(){
		$('#font_color').html('<i class="pi  pi-check"></i>'+$(this).attr('title'));
		$('#font_color').css('background-color','#'+$(this).attr('rel')); 
	});
	$("#select_font,#font_color_list,#pdp_color_item ul,#design_control .add_text_field .pdp_text_list ul,#icon_list").mCustomScrollbar({
        advanced: {
            updateOnContentResize: true
        },
        mouseWheelPixels: "200",
        theme: "dark-2"
    });
	/* Sharing Option */
	/* $('#pdp_share').on('click', function(){
		$('.pdp_share_buttons').slideToggle(0); 
	}); */
	/* Expand to full desktop preview design */
	$('.pdp2_expand').on('click',function(){
		$('#pdp_design_popup .wrapper_pdp').toggleClass('pdp_full_preview');
		$(this).toggleClass('pdp2_laptop');
	});
	//Expand and Clospand
	/*$("input[name='tab_tool']").click(function(e) {
		e.preventDefault();
	});*/
	/* Add CHECKED status to show the Tool Panel on large screen */
	if($(window).width()>989){
		 $('#tool_expand').prop('checked', true);
		 $('#design_control').removeClass('onSmallDevice');
	}else{
		 $('#design_control').addClass('onSmallDevice');
		 $('#tool_expand').prop('checked', false);
	}
	$( window ).resize(function() {
		if($(window).width()>989){
			 $('#tool_expand').prop('checked', true);
			 $('#design_control').removeClass('onSmallDevice');
		}else{
			 $('#tool_expand').prop('checked', false);
			 $('#design_control').addClass('onSmallDevice');
		} 
	});
	$('#product-image-wrap').on('click',function(){
		$('.showme').each(function(){
			$(this).removeClass('showme');
		});
		$('#sideview').prop('checked', false);
	});
	
	/* ========YOUR CUSTOM JAVASCRIPT CODE HERE=============== */
});
