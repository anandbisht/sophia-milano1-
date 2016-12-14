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


// TODO finish the customization behaviour

//global variables
var combinations = [];
var selectedCombination = [];
var globalQuantity = 0;
var colors = [];

//check if a function exists
function function_exists(function_name)
{
	if (typeof function_name == 'string')
		return (typeof window[function_name] == 'function');
	return (function_name instanceof Function);
}

//execute oosHook js code
function oosHookJsCode()
{
	for (var i = 0; i < oosHookJsCodeFunctions.length; i++)
	{
		if (function_exists(oosHookJsCodeFunctions[i]))
			setTimeout(oosHookJsCodeFunctions[i]+'()', 0);
	}
}

var ProductFn = (function()
{
	return {
		// PrestaShop internal settings
		currencySign:'',
		currencyRate:'',
		currencyFormat:'',
		currencyBlank:'',
		taxRate: 0,
		
		// Parameters
		id_product: '',
		productHasAttributes: false,
		quantitiesDisplayAllowed: false,
		quantityAvailable: 0,
		allowBuyWhenOutOfStock: false,
		availableNowValue: '',
		availableLaterValue: '',
		productPriceTaxExcluded: 0,
		reduction_percent: 0,
		reduction_price: 0,
		specific_price: 0,
		product_specific_price: [],
		globalQuantity: 0,
		
		specific_currency: false,
		group_reduction: '',
		default_eco_tax: 0,
		ecotaxTax_rate: 0,
		currentDate: '',
		maxQuantityToAllowDisplayOfLastQuantityMessage: 0,
		noTaxForThisProduct: false,
		displayPrice: 0,
		productReference: '',
		productAvailableForOrder: '',
		productShowPrice: '0',
		productUnitPriceRatio: '',
		
		productPriceWithoutReduction: '',
		productPrice: '',
		
		// Customizable field
		img_ps_dir: '',
		customizationFields: [],
		
		// Images
		img_prod_dir: '',
		combinationImages: [],
		
		// Translations
		doesntExist: '',
		doesntExistNoMore: '',
		doesntExistNoMoreBut: '',
		uploading_in_progress: '',
		fieldRequired: '',
		
		// Combinations attributes informations
		attributesCombinations: [],
		combinations: [],
		selectedCombination: {},
		
		original_url: '',
		already_init: false,
		
		init: function()
		{
			if (ProductFn.already_init) {
				return true;
			}
			ProductFn.already_init = true;
			if (jQuery('.attributes_group select').length || jQuery('.attributes_group input[type=radio]').length) {
				initAttrSelector();
			}
			ProductFn.checkMinimalQuantity();
			jQuery('#quantity_wanted').bind('keyup', function() {
				if (jQuery(this).val() != '') {
					ProductFn.checkMinimalQuantity();
				}
			});
			jQuery('#quantity_wanted').bind('blur', function() {
				ProductFn.checkMinimalQuantity();
			});
			
			checkUrl();
		},
		checkMinimalQuantity: function()
		{
			if (jQuery('#quantity_wanted').val() < ProductFn.selectedCombination.minimalQuantity)
			{
				jQuery('#quantity_wanted').css('border', '1px solid red');
				jQuery('#minimal_quantity_wanted_p').css({color: 'red', display: 'block'});
			}
			else
			{
				jQuery('#quantity_wanted').css('border', '1px solid #BDC2C9');
				jQuery('#minimal_quantity_wanted_p').css({color: '#374853'});
			}
		}
	}
	
	function initAttrSelector()
	{
		jQuery('.attributes_group select').change(function()
		{
			findCombination();
		});
		jQuery('.attributes_group input[type=radio]').click(function()
		{
			findCombination();
		});
	}
	
	// search the combinations' case of attributes and update displaying of availability, prices, ecotax, and image
	function findCombination(firstTime)
	{
		jQuery('#minimal_quantity_wanted_p').fadeOut();
		jQuery('#quantity_wanted').val(1);

		//create a temporary 'choice' array containing the choices of the customer
		var choice = new Array();
		jQuery('div#attributes select, div#attributes input[type=hidden], div#attributes input[type=radio]:checked').each(function(){
			choice.push(jQuery(this).val());
		});

		ProductFn.selectedCombination = new ProductCombination();
		var combinationFound = false;
		//testing every combination to find the conbination's attributes' case of the user
		for (var combination = 0; combination < ProductFn.combinations.length; ++combination)
		{
			var oCombination = ProductFn.combinations[combination];
			//verify if this combinaison is the same that the user's choice
			var combinationMatchForm = true;
			jQuery.each(oCombination.idsAttributes, function(key, value) {
				if (!in_array(value, choice)) {
					combinationMatchForm = false;
				}
			});

			if (combinationMatchForm)
			{
				combinationFound = true;
				//get the data of product with these attributes
				ProductFn.selectedCombination = oCombination;
				
				if (oCombination.minimalQuantity > 1)
				{
					jQuery('#minimal_quantity_label').html(oCombination.minimalQuantity);
					jQuery('#minimal_quantity_wanted_p').fadeIn();
					jQuery('#quantity_wanted').val(oCombination.minimalQuantity);
				}
				
				ProductFn.checkMinimalQuantity();
				
				// Is the hidden field for the form
				jQuery('#idCombination').val(oCombination.id);
				
				//get the data of product with these attributes
				ProductFn.quantityAvailable = oCombination.quantity;
				
				// show the large image in relation to the selected combination
				if (oCombination.idImage && oCombination.idImage != -1)
					ProductDisplay.image(firstTime);

				// show discounts values according to the selected combination
				if (oCombination.id && oCombination.id > 0)
				{
					ProductDisplay.discounts();
					ProductDisplay.refreshImages(oCombination.id);
				}
				
				//leave the loop because combination has been found
				break;
			}
		}
		if (!combinationFound)
		{
			//this combination doesn't exist (not created in back office)
			ProductFn.selectedCombination.unavailable = true;
		}
		//update the display
		ProductDisplay.update();
	}
	
	function saveCustomization()
	{
		jQuery('#quantityBackup').val(jQuery('#quantity_wanted').val());
		customAction = jQuery('#customizationForm').attr('action');
		jQuery('body select[id^="group_"]').each(function() {
			customAction = customAction.replace(new RegExp(this.id + '=\\d+'), this.id +'='+this.value);
		});
	
		jQuery.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			url: customAction + '?rand=' + new Date().getTime(),
			data: 'ajax=true&'+jQuery('#customizationForm').serialize(),
			dataType: 'json',
			async : true,
			success: function(data) {
				jQuery('#customizedDatas').fadeOut();
				jQuery('#customizedDatas').html(input_save_customized_datas);
				jQuery('#customizedDatas').fadeIn();
				if (!data.hasErrors)
				{
					jQuery('#customizationForm').find('.error').fadeOut(function(){
						jQuery(this).remove();
					});
					// display a confirmation message
					if (jQuery('#customizationForm').find('.success').val() == undefined)
						jQuery('#customizationForm').prepend("<p class='success'>"+data.conf+"</p>");
					else
						jQuery('#customizationForm.success').html("<p class='success'>"+data.conf+"</p>");
				}
				else
				{
					jQuery('#customizationForm').find('.success').fadeOut(function(){
						jQuery(this).remove();
					});
					// display an error message
					if (jQuery('#customizationForm').find('.error').val() == undefined)
					{
						jQuery('#customizationForm').prepend("<p class='error'></p>");
						for (var i = 0; i < data.errors.length; i++)
							jQuery('#customizationForm .error').html(jQuery('#customizationForm .error').html()+data.errors[i]+"<br />");
					}
					else
					{
						jQuery('#customizationForm .error').html('');
						for (var i = 0; i < data.errors.length; i++)
							jQuery('#customizationForm .error').html(jQuery('#customizationForm .error').html()+data.errors[i]+"<br />");
					}
				}
			}
		});
		return false;
	}
	
	function checkUrl()
	{
		var url = ProductFn.original_url;
		// if we need to load a specific combination
		if (url.indexOf('#/') != -1)
		{
			// get the params to fill from a "normal" url
			var params = url.substring(url.indexOf('#') + 1, url.length);
			var tabParams = params.split('/');
			var tabValues = new Array();
			if (tabParams[0] == '')
				tabParams.shift();
			for (i in tabParams)
				tabValues.push(tabParams[i].split('-'));
			//var product_id = jQuery('#product_page_product_id').val();
			// fill html with values
			var count = 0;
			for (z in tabValues)
				for (a in ProductFn.attributesCombinations)
					if (ProductFn.attributesCombinations[a].group == tabValues[z][0]
						&& ProductFn.attributesCombinations[a].attribute == tabValues[z][1])
					{
						count++;
						// add class 'selected' to the selected color
						jQuery('#attributes').find('input:radio[value='+ProductFn.attributesCombinations[a].id_attribute+']').attr('checked', 'checked').checkboxradio("refresh")
						jQuery('#attributes').find('input:hidden[name=group_'+ProductFn.attributesCombinations[a].id_attribute_group+']').val(ProductFn.attributesCombinations[a].id_attribute)
						jQuery('#attributes').find('select[name=group_'+ProductFn.attributesCombinations[a].id_attribute_group+']')
							.find('option[value='+ProductFn.attributesCombinations[a].id_attribute+']').attr('selected', 'selected').end().selectmenu('refresh');;
					}
			// find combination
			if (count > 0) {
				findCombination(true);
			}
			var jQueryurl = jQuery.mobile.path.parseUrl(ProductFn.original_url);
		}
	}
})();

var ProductDisplay = (function()
{
	return {
		idDefaultImage: 0,
		//update display of the discounts table
		discounts: function()
		{
			jQuery('#quantityDiscount table tbody tr').each(function() {
				if ((jQuery(this).attr('id') != 'quantityDiscount_0') &&
					(jQuery(this).attr('id') != 'quantityDiscount_'+ProductFn.selectedCombination.id) &&
					(jQuery(this).attr('id') != 'noQuantityDiscount'))
					jQuery(this).fadeOut('slow');
			 });
		
			if (jQuery('#quantityDiscount_'+ProductFn.selectedCombination.id).length != 0) {
				jQuery('#quantityDiscount_'+ProductFn.selectedCombination.id).show();
				jQuery('#noQuantityDiscount').hide();
			} else
				jQuery('#noQuantityDiscount').show();
		},
		refreshImages: function(id_product_attribute)
		{
			// Change the current product images regarding the combination selected
			/*jQuery('#thumbs_list_frame').scrollTo('li:eq(0)', 700, {axis:'x'});*/
			jQuery('.thumbs_list li').hide();
			id_product_attribute = parseInt(id_product_attribute);
		
			if (typeof(ProductFn.combinationImages) != 'undefined' && typeof(ProductFn.combinationImages[id_product_attribute]) != 'undefined')
			{
				for (var i = 0; i < ProductFn.combinationImages[id_product_attribute].length; i++)
					jQuery('#thumbnail_' + parseInt(ProductFn.combinationImages[id_product_attribute][i])).show();
			}
			if (i > 0)
			{
				/*var thumb_width = jQuery('#thumbs_list_frame >li').width()+parseInt(jQuery('#thumbs_list_frame >li').css('marginRight'));
				jQuery('#thumbs_list_frame').width((parseInt((thumb_width)* i) + 3) + 'px'); //  Bug IE6, needs 3 pixels more ?*/
			}
			else
			{
				jQuery('#thumbnail_' + ProductDisplay.idDefaultImage).show();
				ProductDisplay.image(jQuery('#thumbnail_'+ ProductDisplay.idDefaultImage +' a'));
			}
			//jQuery('#thumbs_list').trigger('goto', 0);
			//serialScrollFixLock('', '', '', '', 0);// SerialScroll Bug on goto 0 ?
		},
		//update display of the large image
		image: function(jQueryel, no_animation)
		{
			jQueryel = jQuery('#thumbnail_'+ProductFn.selectedCombination.idImage+' img');
			
			if (typeof(no_animation) == 'undefined')
				no_animation = false;
			if (jQueryel.data('large'))
			{
				var newSrc = jQueryel.data('large').replace('thickbox','large');
				if (jQuery('#bigpic').attr('src') != newSrc)
				{
					jQuery('#bigpic').fadeOut((no_animation ? 0 : 'fast'), function() {
						jQuery(this).attr('src', newSrc).show();
					});
				}
				jQuery('.view_product .thumbs_list li a').removeClass('shown');
				jQueryel.addClass('shown');
			}
		},
		
		quantityIsAvailable: function()
		{
			//show the choice of quantities
			jQuery('#quantity_wanted_p:hidden').show('slow');

			//show the "add to cart" button ONLY if it was hidden
			jQuery('#add_to_cart:hidden').fadeIn(600);

			//hide availability date
			/* =============================================
			 * Don't exists ??
			jQuery('#availability_date_label').hide();
			jQuery('#availability_date_value').hide();
			============================================= */

			//availability value management
			if (ProductFn.availableNowValue != '')
			{
				//update the availability statut of the product
				jQuery('#availability_value').removeClass('warning_inline');
				jQuery('#availability_value').text(ProductFn.availableNowValue);
				jQuery('#availability_statut:hidden').show();
			}
			else
			{
				//hide the availability value
				jQuery('#availability_statut:visible').hide();
			}

			//'last quantities' message management
			if (!ProductFn.allowBuyWhenOutOfStock)
			{
				if (ProductFn.quantityAvailable <= ProductFn.maxQuantityToAllowDisplayOfLastQuantityMessage)
				jQuery('#last_quantities').show('slow');
				else
					jQuery('#last_quantities').hide('slow');
			}

			if (ProductFn.quantitiesDisplayAllowed)
			{
				jQuery('#pQuantityAvailable:hidden').show('slow');
				jQuery('#quantityAvailable').text(ProductFn.quantityAvailable);

				if (ProductFn.quantityAvailable < 2) // we have 1 or less product in stock and need to show "item" instead of "items"
				{
					jQuery('#quantityAvailableTxt').show();
					jQuery('#quantityAvailableTxtMultiple').hide();
				}
				else
				{
					jQuery('#quantityAvailableTxt').hide();
					jQuery('#quantityAvailableTxtMultiple').show();
				}
			}
		},
		quantityIsNotAvailable: function()
		{
			//hide 'last quantities' message if it was previously visible
			jQuery('#last_quantities:visible').hide('slow');
	
			//hide the quantity of pieces if it was previously visible
			jQuery('#pQuantityAvailable:visible').hide('slow');
	
			//hide the choice of quantities
			if (!ProductFn.allowBuyWhenOutOfStock)
				jQuery('#quantity_wanted_p:visible').hide('slow');
	
			//display that the product is unavailable with theses attributes
			if (!ProductFn.selectedCombination['unavailable'])
				jQuery('#availability_value').text(ProductFn.doesntExistNoMore + (ProductFn.globalQuantity > 0 ? ' ' + ProductFn.doesntExistNoMoreBut : '')).addClass('warning_inline');
			else
			{
				jQuery('#availability_value').text(doesntExist).addClass('warning_inline');
				jQuery('#oosHook').hide();
			}
			jQuery('#availability_statut:hidden').show();
			
			//display availability date
			if (ProductFn.selectedCombination.length)
			{
				var available_date = ProductFn.selectedCombination['available_date'];
				tab_date = available_date.split('-');
				var time_available = new Date(tab_date[2], tab_date[1], tab_date[0]);
				time_available.setMonth(time_available.getMonth()-1);
				var now = new Date();
				// date displayed only if time_available
				if (now.getTime() < time_available.getTime())
				{
					jQuery('#availability_date_value').text(ProductFn.selectedCombination['available_date']);
					jQuery('#availability_date_label').show();
					jQuery('#availability_date_value').show();
				}
				else
				{
					jQuery('#availability_date_label').hide();
					jQuery('#availability_date_value').hide();
				}
			}
			//show the 'add to cart' button ONLY IF it's possible to buy when out of stock AND if it was previously invisible
			if (ProductFn.allowBuyWhenOutOfStock && !ProductFn.selectedCombination['unavailable'] && ProductFn.productAvailableForOrder == 1)
			{
				jQuery('#add_to_cart:hidden').fadeIn(600);
	
				if (ProductFn.availableLaterValue != '')
				{
					jQuery('#availability_value').text(ProductFn.availableLaterValue);
					jQuery('p#availability_statut:hidden').show('slow');
				}
				else
					jQuery('p#availability_statut:visible').hide('slow');
			}
			else
			{
				jQuery('#add_to_cart:visible').fadeOut(600);
				jQuery('p#availability_statut:hidden').show('slow');
			}
	
			if (ProductFn.productAvailableForOrder == 0)
				jQuery('p#availability_statut:visible').hide();
		},
		combinationRef: function()
		{
			if (ProductFn.selectedCombination.reference || ProductFn.productReference)
			{
				if (ProductFn.selectedCombination.reference)
					jQuery('#product_reference span').text(ProductFn.selectedCombination.reference);
				else if (ProductFn.productReference)
					jQuery('#product_reference span').text(ProductFn.productReference);
				jQuery('#product_reference:hidden').show('slow');
			}
			else
				jQuery('#product_reference:visible').hide('slow');
		},
		price: function()
		{
			// retrieve price without group_reduction in order to compute the group reduction after
			// the specific price discount (done in the JS in order to keep backward compatibility)
			if (!ProductFn.displayPrice && !ProductFn.noTaxForThisProduct)
			{
				var priceTaxExclWithoutGroupReduction = ps_round(ProductFn.productPriceTaxExcluded, 6) * (1 / ProductFn.group_reduction);
			} else {
				var priceTaxExclWithoutGroupReduction = ps_round(ProductFn.productPriceTaxExcluded, 6) * (1 / ProductFn.group_reduction);
			}
			var combination_add_price = ProductFn.selectedCombination.price * ProductFn.group_reduction;
	
			var tax = (ProductFn.taxRate / 100) + 1;
	
			var display_specific_price;
			if (ProductFn.selectedCombination.specific_price)
			{
				display_specific_price = ProductFn.selectedCombination.specific_price.price;
				if (ProductFn.selectedCombination.specific_price.reduction_type == 'percentage')
				{
					jQuery('#reduction_amount').hide();
					jQuery('#reduction_percent_display').html('-' + parseFloat(ProductFn.selectedCombination.specific_price.reduction_percent) + '%');
					jQuery('#reduction_percent').show();
				} else if (ProductFn.selectedCombination.specific_price.reduction_type == 'amount') {		
					jQuery('#reduction_percent').hide();
					jQuery('#reduction_amount').show();
				} else {
					jQuery('#reduction_percent').hide();
					jQuery('#reduction_amount').hide();
				}
			}
			else
			{
				display_specific_price = ProductFn.product_specific_price.price;
				if (ProductFn.product_specific_price.reduction_type == 'percentage')
					jQuery('#reduction_percent_display').html(ProductFn.product_specific_price.specific_price.reduction_percent);
			}
			
			if (ProductFn.product_specific_price.reduction_type != '' || ProductFn.selectedCombination.specific_price.reduction_type != '')
				jQuery('#discount_reduced_price,#old_price').show();
			else
				jQuery('#discount_reduced_price,#old_price').hide();
			
			if (ProductFn.product_specific_price.reduction_type == 'percentage' || ProductFn.selectedCombination.specific_price.reduction_type == 'percentage')
				jQuery('#reduction_percent').show();
			else
				jQuery('#reduction_percent').hide();
			if (ProductFn.display_specific_price)
				jQuery('#not_impacted_by_discount').show();
			else
				jQuery('#not_impacted_by_discount').hide();
						
			var taxExclPrice = 0;
			if (ProductFn.display_specific_price) {
				taxExclPrice = ProductFn.specific_currency ? ProductFn.display_specific_price : ProductFn.display_specific_price * ProductFn.currencyRate;
			} else {
				taxExclPrice = priceTaxExclWithoutGroupReduction;
			}
			taxExclPrice += ProductFn.selectedCombination['price'] * ProductFn.currencyRate
	
			if (ProductFn.display_specific_price)
				ProductFn.productPriceWithoutReduction = priceTaxExclWithoutGroupReduction + selectedCombination['price'] * currencyRate; // Need to be global => no var
	
			if (!ProductFn.displayPrice && !ProductFn.noTaxForThisProduct)
			{
				ProductFn.productPrice = taxExclPrice * tax; // Need to be global => no var
				if (ProductFn.display_specific_price)
					ProductFn.productPriceWithoutReduction = ps_round(ProductFn.productPriceWithoutReduction * tax, 2);
			}
			else
			{
				ProductFn.productPrice = ps_round(taxExclPrice, 2); // Need to be global => no var
				if (ProductFn.display_specific_price)
					ProductFn.productPriceWithoutReduction = ps_round(ProductFn.productPriceWithoutReduction, 2);
			}
	
			var reduction = 0;
			if (ProductFn.selectedCombination.specific_price.reduction_price || ProductFn.selectedCombination.specific_price.reduction_percent)
			{
				ProductFn.selectedCombination.specific_price.reduction_price = (ProductFn.specific_currency ? ProductFn.selectedCombination.specific_price.reduction_price : ProductFn.selectedCombination.specific_price.reduction_price * ProductFn.currencyRate);
				reduction = ProductFn.productPrice * (parseFloat(ProductFn.selectedCombination.specific_price.reduction_percent) / 100) + ProductFn.selectedCombination.specific_price.reduction_price;
				if (ProductFn.selectedCombination.specific_price.reduction_price && (ProductFn.displayPrice || ProductFn.noTaxForThisProduct))
					reduction = ps_round(reduction / tax, 6);
			}
			else if (ProductFn.product_specific_price.reduction_price || ProductFn.product_specific_price.reduction_percent)
			{
				ProductFn.product_specific_price.reduction_price = (ProductFn.specific_currency ? ProductFn.product_specific_price.reduction_price : ProductFn.product_specific_price.reduction_price * ProductFn.currencyRate);
				reduction = ProductFn.productPrice * (parseFloat(ProductFn.product_specific_price.reduction_percent) / 100) + ProductFn.product_specific_price.reduction_price;
				if (ProductFn.product_specific_price.reduction_price && (ProductFn.displayPrice || ProductFn.noTaxForThisProduct))
					reduction = ps_round(reduction / tax, 6);
			}
	
			if (!ProductFn.display_specific_price)
				ProductFn.productPriceWithoutReduction = ProductFn.productPrice * ProductFn.group_reduction;
	
	
			ProductFn.productPrice -= reduction;
			var tmp = ProductFn.productPrice * ProductFn.group_reduction;
			ProductFn.productPrice = ps_round(ProductFn.productPrice * ProductFn.group_reduction, 2);
	
			var ecotaxAmount = !ProductFn.displayPrice ? ps_round(ProductFn.selectedCombination.ecotax * (1 + ProductFn.ecotaxTax_rate / 100), 2) : ProductFn.selectedCombination.ecotax;
			ProductFn.productPrice += ecotaxAmount;
			ProductFn.productPriceWithoutReduction += ecotaxAmount;
	
			//productPrice = ps_round(productPrice * currencyRate, 2);
			var our_price = '';
			if (ProductFn.productPrice > 0) {
				our_price = formatCurrency(ProductFn.productPrice, ProductFn.currencyFormat, ProductFn.currencySign, ProductFn.currencyBlank);
			} else {
				our_price = formatCurrency(0, ProductFn.currencyFormat, ProductFn.currencySign, ProductFn.currencyBlank);
			}
			jQuery('#our_price_display').text(our_price);
			
	
			jQuery('#old_price_display').text(formatCurrency(ProductFn.productPriceWithoutReduction, ProductFn.currencyFormat, ProductFn.currencySign, ProductFn.currencyBlank));
			if (ProductFn.productPriceWithoutReduction > ProductFn.productPrice)
				jQuery('#old_price,#old_price_display,#old_price_display_taxes').show();
			else
				jQuery('#old_price,#old_price_display,#old_price_display_taxes').hide();
			// Special feature: "Display product price tax excluded on product page"
			if (!ProductFn.noTaxForThisProduct)
				var productPricePretaxed = ProductFn.productPrice / tax;
			else
				var productPricePretaxed = ProductFn.productPrice;
			jQuery('#pretaxe_price_display').text(formatCurrency(productPricePretaxed, ProductFn.currencyFormat, ProductFn.currencySign, ProductFn.currencyBlank));
			// Unit price
			ProductFn.productUnitPriceRatio = parseFloat(ProductFn.productUnitPriceRatio);
			if (ProductFn.productUnitPriceRatio > 0 )
			{
				var newUnitPrice = (productPrice / parseFloat(productUnitPriceRatio)) + selectedCombination['unit_price'];
				jQuery('#unit_price_display').text(formatCurrency(newUnitPrice, currencyFormat, currencySign, currencyBlank));
			}
	
			// Ecotax
			var ecotaxAmount = !ProductFn.displayPrice ? ps_round(ProductFn.selectedCombination.ecotax * (1 + ProductFn.ecotaxTax_rate / 100), 2) : ProductFn.selectedCombination.ecotax;
			jQuery('#ecotax_price_display').text(formatCurrency(ecotaxAmount, ProductFn.currencyFormat, ProductFn.currencySign, ProductFn.currencyBlank));
		},
		//update display of the availability of the product AND the prices of the product
		update: function()
		{
			if (!ProductFn.selectedCombination.unavailable
				&& ProductFn.quantityAvailable > 0
				&& ProductFn.productAvailableForOrder == 1) {
				this.quantityIsAvailable();
			} else {
				this.quantityIsNotAvailable();
			}
			this.combinationRef();
			
			//update display of the the prices in relation to tax, discount, ecotax, and currency criteria
			if (!ProductFn.selectedCombination.unavailable && ProductFn.productShowPrice == 1)
			{
				this.price();
			}
		}
	}
})();

function ProductCombination(id)
{
	if (typeof id == 'undefined') {
		id = 0;
	}
	this.id = id;
	this.idsAttributes = [];
	this.quantity = 0;
	this.price = 0;
	this.ecotax = ProductFn.default_eco_tax;
	this.idImage = 0,
	this.reference = '';
	this.unitPrice = 0;
	this.minimalQuantity = 0;
	this.availableDate = '';
	this.specific_price = new SpecificPriceCombination();
	this.unavailable = false;
}

function AttributeCombination(idAttribute)
{
	this.id_attribute = idAttribute;
	this.attribute = '';
	this.group = '';
	this.id_attribute_group = '';
}

function SpecificPriceCombination()
{
	this.reduction_percent = 0;
	this.reduction_price = 0;
	this.price = 0;
	this.reduction_type = '';
}


// Disable for this page the JQM hash behaviour,
// this allow to get the product attributes in the url.
jQuery(document).bind("mobileinit", function(){
	ProductFn.original_url = window.location+'';
	jQuery.extend(jQuery.mobile , {
		hashListeningEnabled: false,
	});
});

jQuery( '.prestashop-page' ).live( 'pageshow',function(event)
{
	initProductPage();
	if (jQuery('.btn-cart').length)
	{
		if (jQuery('.btn-cart').hasClass('disabled'))
		{
			jQuery('.btn-cart').parent().addClass('disabled');
			jQuery('.btn-cart').live('click', function(e)
			{
				e.preventDefault();
				return false;
			});
		}
	}
	ProductFn.init();

	jQuery('img[data-large]').click(function() {
		/*jQuery.scrollTo('0');*/
		window.scrollTo(0,260);
	});
	jQuery('img[data-large]').touchGallery({
		getSource: function()
		{
			return jQuery(this).data('large');
		}
	});

});

$(document).ready(function() {
	
	$('#product_qty_down').click(function(){
		if($('#quantity_wanted').val()> 0){
			var quantity_wanted = parseInt($('#quantity_wanted').val()) - 1;
			$('#quantity_wanted').val(quantity_wanted);
		}
	});
	
	$('#product_qty_up').click(function(){
		
		var quantity_wanted = parseInt($('#quantity_wanted').val()) + 1;
		$('#quantity_wanted').val(quantity_wanted);
	});
	
	$('#our_gurantee').click(function(){
		$('#gurantee_text').show();
		$('#gurantee_close_div').show();
		$('#gurantee_block_div').css('background-color','#f6f6f6');
	});
	
	$('#our_gurantee_close').click(function(){
		$('#gurantee_text').hide();
		$('#gurantee_close_div').hide();
		$('#gurantee_block_div').css('background-color','#ffffff');
	});
	
	
});
