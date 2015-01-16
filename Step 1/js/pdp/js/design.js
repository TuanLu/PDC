var mst = jQuery.noConflict();
mst(document).ready(function ($) {
var m = $('#url_site').val().replace('index.php/','');
    PDPsetting.add_html();
    PDPsetting.init();  
    
    
////////////////////////////Change color function ///////////////////////////////
    function rgb2hex(rgb){
     rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
     return ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[3],10).toString(16)).slice(-2);
    }
   
    ///////////////////////////////////////active facebook////////////////////////
    if($('#fb_get_id').val()!=''){
        $('.add_artwork_tab').click();
        $('.tab_design_image .facebook_api').click();
    }
    $('#facebook_album').change(function(){
       var fid = $(this).val();
       $('#fb_image_list li:not(.'+fid+')').hide();
       $('#fb_image_list li.fb_album_'+fid).show();
    });
	
	/*******************PDP Artwork action********************************/
	var baseUrl = m;
	var mediaUrl = baseUrl + "media/pdp/images/artworks/";
    $('.content_designs').append('<span class="loading-img nodisplay">&nbsp;</span>');
	Paging = {
		init : function() {
			this.loadMoreImage();
			this.filterByCategory();
		},
		loadMoreImage : function() {
			$("#load_more_image").click(function() {
				//var currentPage = $("#current_page").val();
                var currentPage = $("#image_category_list li.active").attr("cr_act");
				//var category = Paging.getActiveCategory();
                var category = $('#image_category_list li.active span').attr("id");
				var pageSize = $("#default_page_size").val();
				$.ajax({
					type : "POST",
					url : baseUrl + "index.php/pdp/index/loadMoreImage",
					data : {current_page : currentPage, category : category, page_size : pageSize},
					beforeSend : function() {
						$('.content_designs .loading-img').show();
					},
					error : function() {
					
					}, 
					success : function(response) {
						if (response != "nomore") {
							//Increment current page by 1
							//$("#current_page").val(parseInt(currentPage) + 1);
                            $("#image_category_list li.active").attr("cr_act",parseInt(currentPage) + 1);
							var data = $.parseJSON(response);
							var item = "", colorImages;
							for (var i = 0; i < data.length; i++) {
								colorImages = data[i].color_img;
								if (colorImages != "") {
									colorImages = "fff__" + data[i].filename + "," + data[i].color_img;
								}
								item += "<li cat='"+ data[i].category +"'> <a class='selection_img' rel='clover'><img color='"+ colorImages +"' src='" + 
								mediaUrl + data[i].filename +"' id='img" + data[i].image_id + "' price='"+data[i].price+"' image_name='"+data[i].image_name+"' color_type='"+data[i].color_type+"'/></a> </li>";
							}
							$("#icon_list").append(item);
							
						} else {
							alert('No more items to load!');
						}
						$('.content_designs .loading-img').hide();
					}
				});
			});
		},
		filterByCategory : function() {
			/**Category click**/
			$("#image_category_list li").click(function() {
				/**Remove all selected item**/
				$('#image_category_list').slideToggle(0);
                if($(this).hasClass('active')){return;}
                var cat_name = $(this).find('span').html();
                $('label.design_label .pdp_selected_category').html(cat_name);
                $("#image_category_list li.active").removeClass('active');
				$(this).addClass('active');
                $('#icon_list li[cat!='+$(this).children('span').attr("id")+']').hide();
                $('#icon_list li[cat='+$(this).children('span').attr("id")+']').show();
                if(!$(this).hasClass("cat_loaded")){
                    $(this).addClass("cat_loaded");
                    var currentPage = 2,
                        category = $('#image_category_list li.active span').attr("id"),
				        pageSize = $("#default_page_size").val(),
                        page_size = parseInt(currentPage - 1) * parseInt(pageSize);
                    $.ajax({
    					type : "POST",
    					url : baseUrl + "index.php/pdp/index/loadMoreImage",
    					data : {current_page : 1, category : category, page_size : page_size},
    					beforeSend : function() {
    						$('.content_designs .loading-img').show();
    					},
    					error : function() {
    					
    					}, 
    					success : function(response) {
    						if (response != "nomore") {
    							var data = $.parseJSON(response);
    							var item = "", colorImages;
    							for (var i = 0; i < data.length; i++) {
									colorImages = data[i].color_img;
									if (colorImages != "") {
										colorImages = "fff__" + data[i].filename + "," + data[i].color_img;
									}
    								item += "<li cat='"+ data[i].category +"'> <a class='selection_img' rel='clover'><img color='"+ colorImages +"' src='" + 
    								mediaUrl + data[i].filename +"' id='img" + data[i].image_id + "' price='"+ data[i].price+"' image_name='"+data[i].image_name+"' color_type='"+data[i].color_type+"'/></a> </li>";
    							}
    							$("#icon_list").append(item);
    					        $("#image_category_list li.active").attr("cr_act",2);
    						} else {
    							alert('No more items to load!');
    						}
    						$('.content_designs .loading-img').hide();
    					}
    				});
                }
			});
		}
	}
	Paging.init();
	/**End PDP Artwork action**/
	
    /////////////////////Demo slider
/**
 *     $("#range_1").noUiSlider({
 * 		range: [10,40],
 * 		start: [20,30],
 *         handles: 1,
 *         serialization: {
 *     		to: $('#rang_1_val')
 *     	}
 * 	});
 */
	/****************** Upload Custom Image Section *************************/
    $('#fileToUpload').hover(function () {
        if (!$(this).hasClass("active")) {
            document.getElementById('fileToUpload').addEventListener('change', handleFileSelect, false);
            $(this).addClass("active")
        }
    });
	function uploadCustomImage () {
		var form = $("#upload_custom_image");
		uploadProgress(0);
		var formData = new FormData();
		$.each(queue, function(i, item) {
			if (item.upload) formData.append(item.name, item.file);
		});
		//Reset queue array
		while(queue.length > 0) { 
			queue.pop();
		}
		var uploadUrl = $("#upload_images_form").attr("action");
		$.ajax({
			url: uploadUrl,
			data: formData,
			cache: false,
			contentType: false,
			processData: false,
			type: 'POST',
			success: function(data){
				uploadProgress(100);
				if (data != "") {
					showUploadedImage(data);
				}
			},
			xhr: function() {
				xhr = $.ajaxSettings.xhr()
				xhr.upload.onprogress = uploadProgress
				xhr.upload.onloadend = uploadProgress
				return xhr
			}
		});
	}
	$("#upload_custom_img_btn").click(function(){
		if (!queue.length) {
			return false;
		}
		if(!$("#agreement").is(":checked")) {
        	alert($("#agreement_warming").val());
        	return false;
        }
		uploadCustomImage();
	});
	var queue = [];
	function handleFileSelect(d) {
        var g = d.target.files; 
		var name = d.target.name;
		$.each(g,function(i,file){
			if (file.type.match("image/")) {
				queue.push({name:name,file:file,upload:true});
				//uploadCustomImage();
				
			} else {
				alert("Please upload a file in one of the following formats: .svg, .jpg, .png, .jpeg, .bmp, .gif");
				document.getElementById("upload_images_form").reset();
			}
			
		});
    }
	function percentage(i,total){
		return Math.round(total?i * 100 / total:100).toString() + '%'
	}
	function uploadProgress(evt){
		var t=$.type(evt),
			pcent=t=='object'&&evt.lengthComputable?percentage(evt.loaded,evt.total):
				  t=="number"?evt+'%':
				  t=="string"?evt:
				  "0%";
				  //console.log(pcent);
        $('#response').html(pcent);
        if(pcent=='100%'){
            $('#response').hide();
        } else {
			$('#response').show();
		}
	}
	function showUploadedImage(response) {
		var images = $.parseJSON(response);
		if (images.length) {
			$.each(images, function(index, imgSrc) {
				$("#lists_img_upload").append("<span><img color='' src='" + imgSrc + "' alt='Custom Upload Image'/></span>");
			});
		}
		document.getElementById("upload_images_form").reset();
	}
	/****************** End Upload Custom Image Section *************************/
	/*** Add To Cart + Add To Wishlist**/
	PDPAction = {
		doRequest : function (url, data, callback) {
			$.ajax({
				type : "POST",
				url : url,
				data : data,
				beforeSend : function() {
					$('.pdploading').show();
				},
				error : function() {
					console.log("Something went wrong...");
				}, 
				success : function(response) {
					callback(response);
					$('.pdploading').hide();
				}
			});
		},
		deferredRequest : function (url, data, callback) {
			var def = $.Deferred();
			return $.ajax({
				type : "POST",
				url : url,
				data : data,
				beforeSend : function() {
					$('.pdploading').show();
				},
				error : function() {
					console.log("Something went wrong...");
				}, 
				success : function(response) {
					callback(response);
					//$('.pdploading').hide();
					def.resolve();
				}
			});
			//return def.promise();
		},
        save_json_file: function(jsonString){
			/* var url = m + 'index.php/pdp/index/saveJsonfile',
			data = {json_file : jsonString};
            PDPAction.doRequest(url, data, function(response) {
                var jsonData = $.parseJSON(response);
				$("input[name='extra_options']").val(jsonData.filename);
                console.log(jsonData);
            }); */
        },
	    save_cr_design: function(add_to){
            var json_array = {
                    inlay   : $('#pdp_side_items li.active').attr('inlay'),
                    side    : $('#pdp_side_items li.active').attr('tab'),
                    img     : $('#pdp_side_items li.active').attr('side_img'),
                    items   : []
                };
            var f = $('#skin_url').val(),
                g = $('#base_dir').val(),
                ml = $('#media_url').val(),
                tab = $('#pdp_side_items li.active').attr('tab'),
                bof, item_info, 
                productId = $('#product_id').val();
            resetTextForm();
            var editid = $('#edit_id').val();
            var i__ = 0;
            $(".product-image .active").removeClass("active");
            return json_array;
        },
        pdp_add_to: function() {
    		//Check customer logged in or not
            var json_final = [];
            $('.pdp_info_save').each(function(){
                var side_name = $(this).attr('alt'),
                    side_img = $('#pdp_side_items li[tab='+side_name+']').attr('side_img');
                    json_obj = {
                    name: side_name,
                    img: side_img,
                    json: $(this).val()
                }
                if($('.design-color-image li.active').length > 0){
                   json_obj.color = $('.design-color-image li.active').attr('id');
                }
                json_final.push(json_obj);
            });
    		var jsonString = JSON.stringify(json_final),
    			pdpBtnAction = $("#pdp_btn_action").val();
    		switch (pdpBtnAction) {
				case "pdp_add_to_cart" :
					LoadDesign.updatePDPCustomOption(jsonString);
					$('#pdp_design_popup').hide();
					$(".add-to-cart .btn-cart").click();
					break;
				case "pdp_add_to_wishlist" :
					LoadDesign.updatePDPCustomOption(jsonString);
					$('#pdp_design_popup').hide();
					if ($("#wishlist_item_id").val() != "") {
						//Update wishlist
						//Cause add to compare and update wishlist have the same class : link-compare
						//So find the correct link to click
						$(".add-to-links .link-compare").each(function() {
							if($(this).attr('onclick') != "") {
								$(this).click();
								return;
							}
						});
						//link-compare
					} else {
						$(".add-to-links .link-wishlist").click();
					}
					break;
				case "pdp_save_admin_sample" : 
					var url = $("#url_site").val() + "pdp/index/saveAdminTemplate";
						currentProductId = $("#current_product_id").val(),
						data = {product_id : currentProductId, pdp_design : jsonString};
					this.doRequest(url, data, function() {
						//alert('Done');
					});
					break;
				case "save_before_share" : 
					this.saveBeforeShare(jsonString);
					break;
                case "save_design_btn" :
                    LoadDesign.updatePDPCustomOption(jsonString);
					$("#pdp_design_popup .overlay").click();
                    break;
			}
    	},
		saveBeforeShare : function (jsonString) {
			var url = $("#save_design_url").val(),
				productUrl = $("#product_url").val(),
				postData = {pdpdesign: jsonString, url : productUrl};
				this.doRequest(url, postData, this.activeAddThis);
		},
		activeAddThis : function(response) {
			var jsonData = $.parseJSON(response);
			//Update share url
			for(var i = 0; i < addthis.links.length; i++){
				//console.log(addthis);
				addthis.links[i].share.url = jsonData.url;
			}
			//Active add this share button
			$(".social-bottom .overlay-btn").addClass('send-back');
		},
		pdpBtnClick : function () {
			$(".pdp-btn").on("click", function() {
				$("#pdp_btn_action").val($(this).attr('id'));
				PDPAction.save_cr_design('done');
			});
		},
		loadFonts : function() {
			var loadFontUrl = baseUrl + "index.php/pdp/index/loadFonts";
			$.ajax({
				type : "GET",
				url : loadFontUrl,
				beforeSend : function() {
					//$('.pdploading').show();
					console.log("Load Font");
				},
				error : function() {
					console.log("Something went wrong...");
				}, 
				success : function(response) {
					//$('.pdploading').hide();
					$(".fonts-container").html(response);
				}
			});
		}
	}
    PDPAction.pdpBtnClick();
	//PDPAction.loadFonts();
	/*** End Add To Cart + Add To Wishlist**/
});