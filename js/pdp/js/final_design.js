var mst = jQuery.noConflict();
mst(document).ready(function($) {
	var allCanvas = {},
		defaultRenderTime = 1000;
	PDCExport = {
		init : function() {
			this.removeWidthSideList();
			this.initCanvas();
			PDCExport.renderToCanvas();
			setTimeout(function() {
				$.each(allCanvas, function() {
					this.renderAll();
					
				});
			}, defaultRenderTime);
			//this.addControls();
		},
		initCanvas : function() {
			var listCanvas = new Array(),
				canvasItem,
				designAreaSize;
			$(".pdp_side_item_content").each(function() {
				canvasItem = "";
				designAreaSize = $(this).attr("inlay").split(",");
				canvasItem += "<div class='canvas-wrapper' style='position: relative;'>";
				canvasItem += "<img  class='side_img' src='" + $(this).find("img").attr("src") + "'/>";
				canvasItem += "<div class='wrap_inlay'>";
				canvasItem += "<canvas id='canvas_"+ $(this).attr("tab") +"'></canvas>";
				canvasItem += "</div>";
				canvasItem += "</div>";
				$(".pdc-canvas").append(canvasItem);
				
				$('#canvas_' + $(this).attr("tab")).closest(".wrap_inlay").css({
					'width' : designAreaSize[0] + 'px',
					'height' : designAreaSize[1] + 'px',
					'top' : designAreaSize[2] + 'px',
					'left' : designAreaSize[3] + 'px',
					'position' : 'absolute',
					//'border' : '1px dotted #ccc'
				});
				$("#canvas_" + $(this).attr("tab")).attr({
					'width' : designAreaSize[0],
					'height' : designAreaSize[1],
				});
			});
		},
		renderToCanvas : function() {
			var jsonContent = $.parseJSON($("#final_design_json").val()),
				stringToObject;
			$.each(jsonContent.items, function() {				
				var sideObject = $(".pdp_side_item_content[side_img='" + this.side_img + "']");
				var canvasId = "canvas_" + sideObject.attr("tab");
				allCanvas[canvasId] = new fabric.Canvas(canvasId);
				//allCanvas[canvasId].loadFromJSON(this.json);
				allCanvas[canvasId].loadFromJSON(this.json, allCanvas[canvasId].renderAll.bind(allCanvas[canvasId]), function(o, object) {
					object.set({
						selectable: false
					});
					//Remove shadow if not setting, prevent duplicate text while export svg
					if (object.shadow !== null) {
						if (parseInt(object.shadow.toObject().offsetX) == 0 
	                		&& parseInt(object.shadow.toObject().offsetY) == 0
	                		&& object.shadow.toObject().color == "#FFFFFF") {
							object.set({
								shadow: null
							});
	                	}
					}
				});
				/*var objects = $.parseJSON(this.json).objects;
                fabric.util.enlivenObjects(objects, function(objects) {
                    var origRenderOnAddRemove = allCanvas[canvasId].renderOnAddRemove;
                    allCanvas[canvasId].renderOnAddRemove = false;
                    allCanvas[canvasId].stateful = false;
                    objects.forEach(function(o) {
                    	allCanvas[canvasId].add(o);
                    });
                    allCanvas[canvasId].renderOnAddRemove = origRenderOnAddRemove;
                    allCanvas[canvasId].renderAll();
                });*/
				
			});
		},
		removeWidthSideList : function() {
			$(".pdp-side-img").removeAttr("width");
		},
		addControls : function() {
			$(".canvas-wrapper").append($(".export_controls").html());
		},
		downloadSVG : function() {
			$(".download-svg").click(function() {
				PDCExport.exportDesign("svg");
			});
		}(),
		downloadPDF : function() {
			$(".download-pdf").click(function() {
				//alert("Check if svg ready");
				PDCExport.exportDesign("pdf");
			});
		}(),
		downloadPng : function() {
			$(".download-png").click(function() {
				/*var canvasId = $(this).closest(".canvas-wrapper").find("canvas").attr("id");
				var png = allCanvas[canvasId].toDataURL({format: 'png',multiplier: 1});
				console.log(png);*/
				PDCExport.exportDesign("png");
			});
		}(),
		downloadPngBackground : function() {
			var images = new Array(),
				downloadUrl = $("#base_url").val() + "pdp/print/downloadPngBg",
				data;
			
			$(".download-png-bg").click(function() {
				$(".pdp_wrap .item-options img").each(function() {
					var imageSrc = this.src.split("/").splice(-1)[0];
					images.push(imageSrc);
				});
				data = {
					'type' : 'pgn-bg',
					'product_id' : $("#product_id").val(),
					'order_id' : $("#order_id").val(),
					'item_id' : $("#item_id").val(),
					'images' : JSON.stringify(images)
				}
				PDCExport.doRequest(downloadUrl, data, function(downloadRsp) {
					var jsonRsp = $.parseJSON(downloadRsp);
					if (jsonRsp.status == "download") {
						window.location = jsonRsp.path;
						$('.pdploading').hide();
					} else {
						alert("Can not download files! Something went wrong!");
					}
				});
				
			});
		}(),
		exportDesign : function(type) {
			var data, url;
			var downloadAble = false;
			url = $("#base_url").val() + "pdp/print/exportDesign";
			var allAjaxRequests = new Array(),
				imageString;
			$.each(allCanvas, function(side, canvasObject) {
				if(!canvasObject._objects.length) {
					return;
				}
				if (type == "png") {
					imageString = canvasObject.toDataURL({format: "png", multiplier: 2});
				} else if (type == "svg" || type == "pdf") {
					imageString = canvasObject.toSVG()
				}
				data = {
					'type' : type,
					'side' : side,
					'product_id' : $("#product_id").val(),
					'order_id' : $("#order_id").val(),
					'item_id' : $("#item_id").val(),
					'image_string' : imageString
				}
				ajaxRequest = PDCExport.deferredRequest(url, data, function(response) {
					var jsonData = $.parseJSON(response);
					if(jsonData.status == "success") {
						downloadAble = true;
					} else {
						downloadAble = false;
						alert(jsonData.message);
					}
				});
				allAjaxRequests.push(ajaxRequest);
			});
			$.when.apply(null, allAjaxRequests).done(function() {
				if(downloadAble) {
					//Make Download
					if (type == "pdf") {
						//Render pdf before download
						var pdfUrl = $("#base_url").val() + "pdp/print/downloadPdf";
						PDCExport.doRequest(pdfUrl, data, function(downloadRsp) {
							var jsonRsp;
							try {
								jsonRsp = $.parseJSON(downloadRsp);
								if (jsonRsp.status == "download") {
									window.location = jsonRsp.path;
									$('.pdploading').hide();
								} else {
									alert("Can not download files! Something went wrong!");
								}
							} catch(error) {
								alert(downloadRsp);
							}
						});
					} else {
						var downloadUrl = $("#base_url").val() + "pdp/print/downloadDesign";
						PDCExport.doRequest(downloadUrl, data, function(downloadRsp) {
							var jsonRsp = $.parseJSON(downloadRsp);
							if (jsonRsp.status == "download") {
								window.location = jsonRsp.path;
								$('.pdploading').hide();
							} else {
								alert("Can not download files! Something went wrong!");
							}
						});
					}
				} else {
					alert("Can not download zip file");
				}
			});
		},
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
					//$('.pdploading').hide();
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
		}
	}
	PDCExport.init();
});