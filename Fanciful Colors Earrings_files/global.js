// Allows to set the same height on ui-block element
// for #category-list items.
$( '.prestashop-page' ).live( 'pageshow',function(event)
{

$('.scrollToTop').click(function(){
				$("html, body").animate({scrollTop: 0}, 1000);
				return false;
			});
$('#scrlBotm').click(function () {
                 $('html, body').animate({scrollTop: $(document).height()},1500);
                 return false;
             });

$('#quicklinkicon').click(function () {
				 
		if($("#quicklinklist").is(':visible'))
		{
		$('#arrow_image_ql').hide();
		$('#arrow_downimage_ql').show();
		$('#quicklinklist').hide();
		}
		else
		{
		$('#arrow_image_ql').show();
		$('#arrow_downimage_ql').hide();
		$('#quicklinklist').show();
		}
				 
     return false;
});


$('#havepromocode').click(function () {
				 
		if($("#promocodeEnterSection").is(':visible'))
		{
		$('.plusimgpromo').show();
		$('.minusimgpromo').hide();
		$('#promocodeEnterSection').hide();
		}
		else
		{
		$('.plusimgpromo').hide();
		$('.minusimgpromo').show();
		$('#promocodeEnterSection').show();
		}
				 
     return false;
});

$('#chngPass').click(function()
{

if($("#password_container").is(':visible'))
{
$('#arrow_image').hide();
$('#arrow_downimage').show();
$('#password_container').hide();
}
else
{
$('#arrow_image').show();
$('#arrow_downimage').hide();
$('#password_container').show();
}


}
);			 
	if ($('.ui-grid-a.same-height').length)
	{
		$('.ui-grid-a.same-height .ui-block-a').each(function()
		{
			if ($(this).height() != $(this).next('.ui-block-b').height())
			{
				var height1 = $(this).height();
				var height2 = $(this).next('.ui-block-b').height();
				if (height1 < height2) {
					$(this).height(height2).find('.ui-btn-inner.ui-li').height(height2);
					if ($(this).find('.ui-bar').length) {
						var less_h = [
							parseInt($(this).find('.ui-bar').css('padding-top')),
							parseInt($(this).find('.ui-bar').css('padding-bottom')),
							parseInt($(this).find('.ui-bar').css('border-top-width')),
							parseInt($(this).find('.ui-bar').css('border-bottom-width'))
						];
						$(this).find('.ui-bar').height(height2-less_h[0]-less_h[1]-less_h[2]-less_h[3]);
					}
				} else {
					$(this).next('.ui-block-b').height(height1).find('.ui-btn-inner.ui-li').height(height1);
				}
			}
		});
	}
});

$( '.prestashop-page' ).live( 'pageinit',function(event)
{
	if ($('.wrapper_pagination_mobile').length)
	{
		$('.wrapper_pagination_mobile').find('.disabled').live('click', function(e)
		{
			e.preventDefault();
			return false;
		});
	}
});