var mst=jQuery.noConflict();
mst(document).ready(function(){
	mst('.color-box').colpick({
		//colorScheme:'dark',
		layout:'rgbhex',
		color:'fff',
		onSubmit:function(hsb,hex,rgb,el) {
			mst(el).css('background-color', '#'+hex);
			mst(el).colpickHide();
		}
	})
	.css('background-color', '#fff');
	
	//
	mst('.pdp2-scrollbar-hor').tinyscrollbar({
		trackSize    : false,
		thumbSize    : false 
	});
	mst('.pdp2-scrollbar-ver').tinyscrollbar({ axis: "x"});
	//Dropdown
	mst(".pdp2-dropdown ul").hide();
	
	mst(".pdp2-dropdown h3").click( function(event){		
        event.stopPropagation();
		mst(".pdp2-dropdown ul").not(mst(this).next("ul")).hide();
        mst(this).next("ul").slideToggle( "fast" );
		mst(this).parent().toggleClass( "show" );
    }); 

    mst(document).click( function(){
        mst(".pdp2-dropdown ul").hide();
    });
	//
	mst('.pdp2-dropdown ul li').hover(
		function(){
			mst(this).addClass('over');
		},
		function(){
			mst(this).removeClass('over');
		}
	);
	/* Span hover tool icon */
	mst('.pdp2-btn-item').hover(
		function(){
			mst(this).addClass('over');
		},
		function(){
			mst(this).removeClass('over');
		}
	);
	
	//End Dropdown
	
	//Tabs
	mst('.pdp2-tabs .pdp2-tab-links a').on('click', function(e)  {
        var currentAttrValue = mst(this).attr('href');
        mst('.pdp2-tabs ' + currentAttrValue).show().siblings().hide();
        mst(this).parent('li').addClass('active').siblings().removeClass('active');
        e.preventDefault();
    });
	/* Fancy Box */
	mst('.pdp2-fancybox').fancybox();
	
	mst('.pdp2-option-cancel').on('click', function(e)  {
		mst.fancybox.close();
	});
	/* Get Preview Graphics when hover over icon */
	var $g_icon = mst('.pdp2-grap li a img');
	var $g_view = mst(".pdp2-grap-show");
	$g_icon.hover(function(event){
		event.preventDefault();
		$g_view.show();
		$g_view.find('img').attr('src',mst(this).attr('data-preview'));
	},function(){
		$g_view.hide();
		$g_view.find('img').attr('src','images/blank.gif');
	});

	/* According  */
		mst('.pdp2-tab-links .pdp2-according').click(function()
		{
			mst(this).parent().next('.pdp2-tab-content').slideToggle(100);
			mst(this).toggleClass('open');
		});
		mst('.pdp2-right-bottom .pdp2-according').click(function()
		{
			mst(this).parent().next('.pdp2-button-action').slideToggle(100);
			mst(this).toggleClass('open');
		});
		mst('.pdp2-right-side .pdp2-according').click(function()
		{
			mst(this).parent().next('.pdp2-slide-content').slideToggle(100);
			mst(this).toggleClass('open');
		});
});
