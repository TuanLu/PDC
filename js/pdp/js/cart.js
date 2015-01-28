/** Show image in shopping cart page **/
var mst = jQuery.noConflict();
mst(document).ready(function($){
    //var displayType = $("#display_type").val();
    //if (displayType != "full") {
        $('.pdp_cart_item').each(function(){
            var cart_id = $(this).attr('alt'),first=0;
            $(this).find('.pdp_side').each(function(){
                var pdp_side = $(this).attr('alt');
                if(first++==0){
                    $(this).parent().parent().parent().prev().find("a").attr("title","Click to view").addClass('inline group'+cart_id).attr("height",'auto').attr('href','#pdp_cart_view_'+pdp_side+'_'+cart_id);
                }else{
                    $(this).parent().parent().parent().prev().append('<a title="Click to view" class="nodisplay inline group'+cart_id+'" href="#pdp_cart_view_'+pdp_side+'_'+cart_id+'"></a>');
                }
            })
            $(this).parent().parent().prev().append('<p>Click to view</p>');
            //$(this).parent().remove();
            $(".group"+cart_id).colorbox({rel:'group'+cart_id});
            $(".inline").colorbox({inline:true, width:""});
        });
    //}
});