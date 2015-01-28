var frontendPopup = jQuery.noConflict();
frontendPopup(function($) {

	var baseUrl = $("#base_url").val(),
		currentProductId = $("#current_product_id").val(),
		designPageUrl = baseUrl + "pdp/view/getDesignPage/",
		tempUrl,
        w_window = $(window).width();
	LoadDesign = {
		load : function() {
			$(".design-btn .design-product").on("click", function() {
				if (!$(this).hasClass("loaded")) {
					var cartItemId = $("#cart_item_id").val(),
						wishlistItemId = $("#wishlist_item_id").val(),
						shareId = $("#pdp_design_share").val();
					tempUrl = designPageUrl + "product-id/" + currentProductId;
					designPageUrl = tempUrl; 
					if (cartItemId != "") {
						tempUrl = designPageUrl + "/item-id/" + cartItemId;
						designPageUrl = tempUrl;
					}
					if (shareId != "") {
						tempUrl = designPageUrl + "/share-id/" + shareId;
						designPageUrl = tempUrl;
					}
					if (wishlistItemId) {
						tempUrl = designPageUrl + "/wishlist-id/" + wishlistItemId;
						designPageUrl = tempUrl;
					}
				    LoadDesign.sendRequest(designPageUrl, LoadDesign.prepareDesignPage);					
				} else {
					//show popup here
					$('#pdp_design_popup').show();
				}
			});
		}(),
		init : function() {
			var action = $("#pdp_design_action").val(),
				shareId = $("#pdp_design_share").val(),
				cartItemId = $("#cart_item_id").val(),
				wishlistItemId = $("#wishlist_item_id").val();
			if (action != "" || shareId != "" || cartItemId != "" || wishlistItemId != "") {
				//Validate product form
				var addToCartForm = new VarienForm('product_addtocart_form', true);
				if (addToCartForm.validator.validate()) {
					$(window).load(function(){
						$(".design-btn .design-product").click();
					});
				}
			}
		}(),
		sendRequest : function(url, callback) {
			$.ajax({
				type : "GET",
				url : url,
				beforeSend : function () {
					//console.log("Sending request...");
					$(".pdp_loading").show();
				},
				success : function(data) {
					callback(data);
					$(".pdp_loading").hide();
				}
			});
		},
		prepareDesignPage : function(data) {
			$(".design-btn .design-product").addClass('loaded');
			$("#pdp_design_popup").html(data);
			$('#pdp_design_popup').appendTo('body');
            $('#pdp_design_popup').append('<div class="overlay"></div>');
			/* $(".pdp_share_buttons").show(); */
			var w_pdp = $('#cboxLoadedContent').width();
            PDPsetting.center_design_area(w_pdp);
			//PDPsetting.init(); 
            //$('#pdp_design_popup > .overlay').click(function(){
            //    $('#pdp_design_popup').hide();
            //});
		},
		hidePdpCustomOption : function() {
			$('#product-options-wrapper dl dt').each(function(){
				if($(this).children('label').text() == 'pdpinfo'){
					$(this).hide();
					$(this).next("dd").addClass("pdp_info").hide();
				}
			});
		}(),
		updatePDPCustomOption : function(design) {
			$("#product-options-wrapper .pdp_info input").val(design);
            $("input[name='extra_options']").val(design);
		},
		showSampleImage : function() {
			if($("#sample_images").length) {
				var sampleImageStr = $("#sample_images").val();
				if (sampleImageStr) {
					var sampleImageJson = JSON.parse(sampleImageStr);
					if (sampleImageJson[0].image_result) {
						$('.product-view .product-img-box .product-image img').attr('src', sampleImageJson[0].image_result);
					}
					if (sampleImageJson.length > 1) {
						$('.more-views').remove();
						if($('.product-view .product-img-box .pdp_more_view').length == 0){
							$('.product-view .product-img-box').append('<div class="more-views"><h2>More Views</h2><ul class="pdp_more_view"></ul></div>');
						}else{
							$('.pdp_more_view').html('');
						}
						$.each(sampleImageJson, function(index, image) {
							$('.pdp_more_view').append('<li><img title="' + image.side_name + '" width="56" height="56" src="'+ image.image_result +'" /></li>');
						});
						$('.pdp_more_view li img').click(function(){
							$('.product-view .product-img-box .product-image img').attr('src',$(this).attr('src')); 
						});
					}
				}
			}
		}()
	}
});