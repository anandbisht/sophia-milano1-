/*
* 2007-2013 PrestaShop
*
* NOTICE OF LICENSE
*
* This source file is subject to the Academic Free License (AFL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/afl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to license@prestashop.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade PrestaShop to newer
* versions in the future. If you wish to customize PrestaShop for your
* needs please refer to http://www.prestashop.com for more information.
*
*  @author PrestaShop SA <contact@prestashop.com>
*  @copyright  2007-2013 PrestaShop SA
*  @license    http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*  International Registered Trademark & Property of PrestaShop SA
*/

/**
 * Update WishList Cart by adding, deleting, updating objects
 *
 * @return void
 */

function WishlistCart(id, action, id_product, id_product_attribute, quantity)
{
    
	$.ajax({
		type: 'GET',
		url:	baseDir + 'modules/blockwishlist/cart.php',
		async: true,
		cache: false,
		data: 'action=' + action + '&id_product=' + id_product + '&quantity=' + quantity + '&token=' + static_token + '&id_product_attribute=' + id_product_attribute,
		success: function(data)
		{
			if (action == 'add')
			{
				if(data=='You must be logged in to manage your wishlist.'){
					//send to Login Page to login to add product in wishlist
//					alert('You must be logged in to manage your wishlist.');
					//var backUrl = 'http://localhost/sparklemuse/index.php?id_product='+id_product+'&controller=product&id_lang=1';
					//var backUrl = 'index.php%3Fid_product%3D'+id_product+'%26controller%3Dproduct%26id_lang%3D1';
					//var backUrl = 'http%3A%2F%2Fsparklemuse.com%2Findex.php%3Fid_product%3D'+id_product+'%26controller%3Dproduct%26id_lang%3D1';
					var backUrl = encodeURIComponent(baseDir + 'modules/blockwishlist/cart.php?action=' + action + '&id_product=' + id_product + '&quantity=' + quantity + '&id_product_attribute=' + id_product_attribute + '&backtowishlist=1');
					window.location.href= baseDir +"index.php?controller=authentication&back="+backUrl;
					return false;
				}
				/*var $element = $('#bigpic');
				if (!$element.length)
					var $element = $('#wishlist_button');
				var $picture = $element.clone();
				var pictureOffsetOriginal = $element.offset();
				$picture.css({'position': 'absolute', 'top': pictureOffsetOriginal.top, 'left': pictureOffsetOriginal.left});
				var pictureOffset = $picture.offset();
				var wishlistBlockOffset = $('#wishlist_block').offset();

				$picture.appendTo('body');
				$picture.css({ 'position': 'absolute', 'top': $picture.css('top'), 'left': $picture.css('left') })
				.animate({ 'width': $element.attr('width')*0.66, 'height': $element.attr('height')*0.66, 'opacity': 0.2, 'top': wishlistBlockOffset.top + 30, 'left': wishlistBlockOffset.left + 15 }, 1000)
				.fadeOut(800);*/
			}
			/*document.getElementById("wishlist").innerHTML = "<span id='addtowishlistmsg'>Product add to wishlist.</span>";
			jQuery("html, body").animate({scrollTop: 0}, 1000);*/
			$('#add_to_wish_list').popup('show');
			return false;
		}
	});
}

/**
 * Change customer default wishlist
 *
 * @return void
 */
function WishlistChangeDefault(id, id_wishlist)
{
	$.ajax({
		type: 'GET',
		url:	baseDir + 'modules/blockwishlist/cart.php',
		async: true,
		data: 'id_wishlist=' + id_wishlist + '&token=' + static_token,
		cache: false,
		success: function(data)
		{
			$('#' + id).slideUp('normal');
			document.getElementById(id).innerHTML = data;
			$('#' + id).slideDown('normal');
		}
	});
}

/**
 * Buy Product
 *
 * @return void
 */
function WishlistBuyProduct(token, id_product, id_product_attribute, id_quantity, button, ajax)
{
	if(ajax)
		ajaxCart.add(id_product, id_product_attribute, false, button, 1, [token, id_quantity]);
	else
	{
		$('#' + id_quantity).val(0);
		WishlistAddProductCart(token, id_product, id_product_attribute, id_quantity)
		document.forms['addtocart' + '_' + id_product  + '_' + id_product_attribute].method='POST';
		document.forms['addtocart' + '_' + id_product  + '_' + id_product_attribute].action=baseUri + '?controller=cart';
		document.forms['addtocart' + '_' + id_product  + '_' + id_product_attribute].elements['token'].value = static_token;
		document.forms['addtocart' + '_' + id_product  + '_' + id_product_attribute].submit();
	}
	return (true);
}

function WishlistAddProductCart(token, id_product, id_product_attribute, id_quantity)
{
	if ($('#' + id_quantity).val() <= 0)
		return (false);
	$.ajax({
		type: 'GET',
		url: baseDir + 'modules/blockwishlist/buywishlistproduct.php',
		data: 'token=' + token + '&static_token=' + static_token + '&id_product=' + id_product  + '&id_product_attribute=' + id_product_attribute,
		async: true,
		cache: false, 
		success: function(data)
		{
			if (data)
				alert(data);
			else
			{
				$('#' + id_quantity).val($('#' + id_quantity).val() - 1);
			}
		}
	});
	return (true);
}

/**
 * Show wishlist managment page
 *
 * @return void
 */
function WishlistManage(id, id_wishlist)
{
	$.ajax({
		type: 'GET',
		async: true,
		url: baseDir + 'modules/blockwishlist/managewishlist.php',
		data: 'id_wishlist=' + id_wishlist + '&refresh=' + false,
		cache: false,
		success: function(data)
		{
			$('#' + id).hide();
			document.getElementById(id).innerHTML = data;
			$('#' + id).fadeIn('slow');
		}
	});
}

/**
 * Show wishlist product managment page
 *
 * @return void
 */
function WishlistProductManage(id, action, id_wishlist, id_product, id_product_attribute, quantity, priority)
{
	$.ajax({
		type: 'GET',
		async: true,
		url: baseDir + 'modules/blockwishlist/managewishlist.php',
		data: 'action=' + action + '&id_wishlist=' + id_wishlist + '&id_product=' + id_product + '&id_product_attribute=' + id_product_attribute + '&quantity=' + quantity + '&priority=' + priority + '&refresh=' + true,
		cache: false,
		success: function(data)
		{
			if (action == 'delete')
				$('#wlp_' + id_product + '_' + id_product_attribute).fadeOut('fast');
			else if (action == 'update')
			{
				$('#wlp_' + id_product + '_' + id_product_attribute).fadeOut('fast');
				$('#wlp_' + id_product + '_' + id_product_attribute).fadeIn('fast');
			}
		}
	});
}
function productTotalAlert(product_id){
	delete tp;
	delete qw;
	delete pw;
	delete avail;
	delete totalproduct;
	delete cartproduct;

	var tp = $('#total_product_'+product_id).val();
	var qw = $('#quantity_wanted_'+product_id).val();
	var pw = $('#product_alert_'+product_id).val();
	var avail = $('#product_avail_'+product_id).val();
	
	var totalproduct = parseFloat(tp.replace(/,/g, ''));
	var cartproduct = parseFloat(qw.replace(/,/g, ''));
	if(totalproduct >= cartproduct){
		$('#popup-wrapper').html();
		$('#buy_block_'+product_id).submit();
		return false;
	}
	if(cartproduct >= totalproduct){
			if(pw == 0){
				$('#product_alert_'+product_id).attr('value', '1');	
				var oos_customer_email = '';
				var idCombination = '';
				var id_product_add_wishlist = '1';
				var addUrl = 'https://sparklemuse.com/index.php?process=add&fc=module&module=mailalerts&controller=actions&id_lang=1';
				$.ajax({
					type: 'POST',
					url: addUrl,
					data: 'id_product='+product_id+'&id_product_attribute='+idCombination+'&customer_email='+oos_customer_email+'&id_product_add_wishlist='+id_product_add_wishlist+'',
					success: function (msg) {
						
					}
				});
			}
			$('#quantity_wanted_'+product_id).attr('value', tp);
			$('#popup-wrapper').html();
			$('#popup-wrapper').html('<p class="popup_notification">Unfortunately we only have '+tp+' of these items in stock, and they have been added to your shopping bag. Please check the Alerts section of Your Account to be notified as soon as we have more items in stock.</p><br><br><a href="#" id="close-btn" class="closebtn">&nbsp;</a>&nbsp;&nbsp;&nbsp;<a href="#" onclick="myfunc('+product_id+')" id="confirm">Checkout</a>');
			$(function () {
				//clicker-new_{$product.id_product}
				$('#popup-wrapper').modalPopLite({ openButton: '#clicker-new_'+product_id, closeButton: '#close-btn', isModal: true });

			});
			
			return false;
	}
	return true;
}
function productTotalAlertOLD(product_id){

	var tp = $('#total_product_'+product_id).val();
	var qw = $('#quantity_wanted_'+product_id).val();
	
	if ($('#quantity_wanted_'+product_id).val() < $('#total_product_'+product_id).val()){
	//if(qw >= tp){
		
		var oos_customer_email = '';
		var idCombination = '';
		var id_product_add_wishlist = '1';
		var addUrl = 'https://sparklemuse.com/index.php?process=add&fc=module&module=mailalerts&controller=actions&id_lang=1';
		$.ajax({
			type: 'POST',
			url: addUrl,
			data: 'id_product='+product_id+'&id_product_attribute='+idCombination+'&customer_email='+oos_customer_email+'&id_product_add_wishlist='+id_product_add_wishlist+'',
			success: function (msg) {
				
			}
		});

		$('#quantity_wanted_'+product_id).attr('value', tp);
		$('#popup-wrapper').html();
		$('#popup-wrapper').html('<p class="popup_notification">Unfortunately we only have '+tp+' of these items in stock, and they have been added to your shopping bag. Please check the Alerts section of Your Account to be notified as soon as we have more items in stock.</p><br><br><a href="#" id="close-btn" class="closebtn">&nbsp;</a>&nbsp;&nbsp;&nbsp;<a href="#" onclick="myfunc('+product_id+')" id="confirm">Continue Shopping</a>');
		$(function () {
			//clicker-new_{$product.id_product}
		    $('#popup-wrapper').modalPopLite({ openButton: '#clicker-new_'+product_id, closeButton: '#close-btn', isModal: true });

		});
		
		return false;
	}
	if(qw >= tp){
		
		var oos_customer_email = '';
		var idCombination = '';
		var id_product_add_wishlist = '1';
		var addUrl = 'https://sparklemuse.com/index.php?process=add&fc=module&module=mailalerts&controller=actions&id_lang=1';
		$.ajax({
			type: 'POST',
			url: addUrl,
			data: 'id_product='+product_id+'&id_product_attribute='+idCombination+'&customer_email='+oos_customer_email+'&id_product_add_wishlist='+id_product_add_wishlist+'',
			success: function (msg) {
				
			}
		});

		$('#quantity_wanted_'+product_id).attr('value', tp);
		$('#popup-wrapper').html();
		$('#popup-wrapper').html('<p class="popup_notification">Unfortunately we only have a '+tp+' of these items in stock, and they have been added to your shopping bag. Please check the Alerts section of Your Account to be notified as soon as we have more items in stock.</p><br><br><a href="#" id="close-btn" class="closebtn">&nbsp;</a>&nbsp;&nbsp;&nbsp;<a href="#" onclick="myfunc('+product_id+')" id="confirm">Continue Shopping</a>');
		$(function () {
			//clicker-new_{$product.id_product}
		    $('#popup-wrapper').modalPopLite({ openButton: '#clicker-new_'+product_id, closeButton: '#close-btn', isModal: true });

		});
		
		return false;
	}
	return true;
}
/**
 * Delete wishlist
 *
 * @return boolean succeed
 */
function WishlistDelete(id, id_wishlist, msg)
{
	var res = confirm(msg);
	if (res == false)
		return (false);
	$.ajax({
		type: 'GET',
		async: true,
		url: baseDir + 'modules/blockwishlist/mywishlist.php',
		cache: false,
		data: 'deleted&id_wishlist=' + id_wishlist,
		success: function(data)
		{
			$('#' + id).fadeOut('slow');
		}
	});
}

/**
 * Hide/Show bought product
 *
 * @return void
 */
function WishlistVisibility(bought_class, id_button)
{
	if ($('#hide' + id_button).css('display') == 'none')
	{
		$('.' + bought_class).slideDown('fast');
		$('#show' + id_button).hide();
		$('#hide' + id_button).css('display', 'block');
	}
	else
	{
		$('.' + bought_class).slideUp('fast');
		$('#hide' + id_button).hide();
		$('#show' + id_button).css('display', 'block');
	}
}

/**
 * Send wishlist by email
 *
 * @return void
 */
function WishlistSend(id, id_wishlist, id_email)
{
	$.post(baseDir + 'modules/blockwishlist/sendwishlist.php',
	{ token: static_token,
	  id_wishlist: id_wishlist,
	  email1: $('#' + id_email + '1').val(),
	  email2: $('#' + id_email + '2').val(),
	  email3: $('#' + id_email + '3').val(),
	  email4: $('#' + id_email + '4').val(),
	  email5: $('#' + id_email + '5').val(),
	  email6: $('#' + id_email + '6').val(),
	  email7: $('#' + id_email + '7').val(),
	  email8: $('#' + id_email + '8').val(),
	  email9: $('#' + id_email + '9').val(),
	  email10: $('#' + id_email + '10').val() },
	function(data)
	{
		if (data)
			alert(data);
		else
			WishlistVisibility(id, 'hideSendWishlist');
	});
}
