/** Show image in shopping cart page **/
var mst = jQuery.noConflict();
mst(document).ready(function($){

    /**
     * var optionImg = new Array();
     * $("#shopping-cart-table tr td:nth-child(2) .item-options dd dd").each(function(){
     *     optionImg.push($(this).text());
     * });
     * $("#shopping-cart-table tr td:nth-child(2) dl.item-options").each(function(index){
     *     //$(this).html(optionImg[index]);
     * });
     */
    //Change image in cart
    $('.design-option').each(function(){
        var src_final = $(this).val().split("ϣ"),
            id = $(this).attr("iid"),
            img_first = src_final[0].split(";"),
            inlay_f = img_first[3].split("-"),
            inlay_f_info = inlay_f[0].split(','),
            inlay_b_info = inlay_f[1].split(','),
            price = img_first[6];
        $('#price_'+id).html(price);
        var $_i =0;
        for(i=7;i<img_first.length;i++){
            var label = img_first[i].split('-');
            if(label[1]>0){
                if($_i++==0){
                    $('#info_size_'+id).append('<p>Size selected</p><ul></ul>');
                }
                $('#info_size_'+id).children('ul').append('<li><label>'+label[0]+'  </label><span>: '+label[1]+' item(s)</span></li>');
            };
        };    
        //$(this).parent().prev().find('a').attr("href",$('#pdp_uri_key').val()+'?id='+id);
        //$(this).parent().parent().next().find('a').attr("href",$('#pdp_uri_key').val()+'?id='+id);
        $('#view_'+id).append('<div id="img_f_result_'+id+'" class="img_result"></div><div id="img_b_result_'+id+'" class="img_result"></div>');
        $('#img_f_result_'+id).append('<img src="'+img_first[1]+'" alt="img_result_front" /><div class="wrap_inlay"></div>');
        $('#img_b_result_'+id).append('<img src="'+img_first[2]+'" alt="img_result_front" /><div class="wrap_inlay"></div>'); 
        $('#img_f_result_'+id+ ' .wrap_inlay').css({"position":"absolute","width":inlay_f_info[0],"height":inlay_f_info[1],"top":inlay_f_info[2]+'px',"left":inlay_f_info[3]+'px'});
        $('#img_b_result_'+id+ ' .wrap_inlay').css({"position":"absolute","width":inlay_b_info[0],"height":inlay_b_info[1],"top":inlay_b_info[2]+'px',"left":inlay_b_info[3]+'px'});
        for(ii=1;ii<src_final.length;ii++){
            var items = src_final[ii].split("╦");
            if(items[0]=='back'){
                if(items[6]!='text'){
                    $('#img_b_result_'+id+ ' .wrap_inlay').append('<div class="c_items" style="'+items[5]+'"><img style="'+items[6]+'" src="'+items[7]+'" alt="img" /></div>');
                }else{
                    $('#img_b_result_'+id+ ' .wrap_inlay').append('<div class="c_items" style="'+items[5]+'"><p style="'+items[7]+'">'+items[8]+'</p></div>');
                }
                
            }else{
                if(items[6]!='text'){
                    $('#img_f_result_'+id+ ' .wrap_inlay').append('<div class="c_items" style="'+items[5]+'"><img style="'+items[6]+'" src="'+items[7]+'" alt="img" /></div>');
                }else{
                    $('#img_f_result_'+id+ ' .wrap_inlay').append('<div class="c_items" style="'+items[5]+'"><p style="'+items[7]+'">'+items[8]+'</p></div>');
                }
            }
        }
        //$(this).parent().parent().parent().next('.edit_item').prepend('<a href="'+$('#pdp_uri_key').val()+'?id='+id+'">Edit</a>');
        //Remove link on name
        //$(this).parent().parent().prev().find("a").removeAttr("href");
        $('#th_view_'+id).append('<a href="#img_f_result_'+id+'" class="th_link inline group'+id+'">Click</a><a class="inline group'+id+'" href="#img_b_result_'+id+'">&nbsp;</a>');
        $('#click_b_'+id).addClass("th_link inline group"+id).attr("href",'#img_b_result_'+id);
        //$(this).parent().parent().prev().append('<a title="Click to view" class="inline group'+cart_i+'" href="#img_b_result_'+id+'"><img width="75" src="'+img_first[2]+'" /></a><p>Click to view</p>');
        //$(this).parent().remove();
        $('#wl_front_'+id).append($('#img_f_result_'+id));
        $('#wl_front_'+id+' .wrap_inlay').show();
        $(".group"+id).colorbox({rel:'group'+id});
        $(".inline").colorbox({inline:true, width:""});
    });  
});