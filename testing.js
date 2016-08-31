var DEBUG_MODE = 'staging';

var SERVER_URL = 'https://www.weld.io/';
if (DEBUG_MODE === 'staging') {
	SERVER_URL = 'https://weld-staging.herokuapp.com/';
}
else if (DEBUG_MODE) {
	SERVER_URL = 'http://localhost:9000/';
}

$(document).ready(function() {
		var user = {
			'quickSite': {
				'image': {
					'base64': ''
				}
			}
		};

		// Create a picturefile object out of the uploaded image
		var getPictureFile = function() {
			var file = document.getElementById('getimage').files[0];
			var reader = new FileReader();

			reader.onload = function(e) {
				var dataURL = reader.result;
				var justBase64 = dataURL.split('base64,')[1];
				user.quickSite.image.base64 = justBase64;
			};

			reader.readAsDataURL(file);
			$('#custom-file-upload').empty().append('<i class="fa fa-check-circle" aria-hidden="true"></i> Image successfully uploaded');
		};

		// Listen for a change in image input
		$('#getimage').on('change', getPictureFile);

		var autofillDomain = function() {
			// TODO: Add if conditional on domain field filled, otherwise use userName
     	
			user.quickSite.domain = $('input[name=userName]').val().toLowerCase().replace(/[\s]/g, '');
			$('input[name=userDomain]').val(user.quickSite.domain).trigger("change");
		};

		var searchDomain = function(user) {
    	user.quickSite = user.quickSite || {};
			user.quickSite.domain = $('input[name=userDomain]').val().replace(' ', '-');
			// Invoke the searchDomainSE from here and pass it the user
			searchDomainSE(user);
		};

		// Listen for a change in the username input and run autofillDomain every 1 sec.
		$('input[name=userName]').on('change', autofillDomain);

		// Listen for a change in the domainname input and run autofillDomain every 1 sec.
		$('input[name=userDomain]').on('change', searchDomain);

		// Add .se button
    var addButton = function (dom) {
    	$('#buttondiv').append('<button id="' + dom + 'Button" class="quicksite-button" type="button" disabled="false">Select ' + user.quickSite.domain + '.' + dom + '</button>').removeClass('nopadding redbutton');
        // Listen for domain selection and add ToS link to domain-terms
				console.log('#' + dom + 'Button');
        $("#" + dom + "Button").on('click', function () {
					console.log("Hi!");
					$(this).addClass('greenbutton');
					$(this).siblings().removeClass('greenbutton');
					
					$('#domain-terms').attr("href", "https://www.iis.se/domaner/registrera/se/villkor/").text('Terms for the .' + dom + ' domain');
					// $('#accept-terms').toggleClass('hidden');
					user.quickSite.domain = user.quickSite.domain.replace(/(.se|.nu)/g, '');
					user.quickSite.domain = user.quickSite.domain + '.' + dom;
        }); 
    };
		
    // Add .nu button
    var addNuButton = function () {
    	$('#buttondiv').append('<button id="nuButton" class="quicksite-button" type="button"></button><br />');
				$('#nuButton').prop("disabled", false).html('Select ' + user.quickSite.domain + '.nu').removeClass('redbutton');// TODO: Fix bug where it removes button on 2nd search
        // Listen for .NU domain selection and add ToS link to domain-terms
        $('#nuButton').on('click', function () {
					$(this).addClass('greenbutton');
					$(this).siblings().removeClass('greenbutton');
					$('#domain-terms').attr("href", "https://www.iis.se/docs/terms-and-conditions-nu.pdf").text('Terms for the .NU domain');
					// $('#accept-terms').toggleClass('hidden');
					user.quickSite.domain = user.quickSite.domain.replace(/(.se|.nu)/g, '');
					user.quickSite.domain = user.quickSite.domain + '.nu';
        });
    };
    
    // Show 'unavailable' button and hide ToS & Signup button
    var seNotAvailable = function () {
    	$('#buttondiv').empty();
     		$('#buttondiv').append('<button id="seButton" class="quicksite-button" type="button"></button><br />')
				$('#seButton').addClass('redbutton').html(user.quickSite.domain + '.se is unavailable').prop("disabled", true); 
        $('#accept-terms').addClass('hidden');
        $('#create-page-button').addClass('hidden');
    };
    
    var nuNotAvailable = function () {
    	$('#buttondiv').append('<button id="nuButton" class="quicksite-button" type="button"></button><br />');
				$('#nuButton').addClass('redbutton').html(user.quickSite.domain + '.nu is unavailable').prop("disabled", true).addClass('redbutton');
        // TODO: Make sure it doesn't hide the ToS and button when .SE available
        $('#accept-terms').addClass('hidden');
        $('#create-page-button').addClass('hidden');
    };

		// Listen for checkbox being checked and add the register button:
		$('.accept-domain-checkbox').change(function() {
			$('#create-page-button').toggleClass('hidden');
		});

		var searchDomainSE = _.throttle(function(user) {
				// TODO: Change to the production server
			var searchDomainUrl = "//domain-production-weld.herokuapp.com/api/lookup/" + user.quickSite.domain + '.se';
			$.get(searchDomainUrl, function (data, textStatus, jqXHR) {
				$('#buttondiv').empty();
     		addButton('se');
				searchDomainNU(user);
			})
			.fail(function(err) {
      	seNotAvailable();
				searchDomainNU(user);
			});
		}, 3000);

		// After searching for a .SE domain, proceed to search for a .NU domain
		var searchDomainNU = function(user) {
			// TODO: Handle the show/hide of buttons
			// TODO: Change to the production server
			var searchDomainUrlNu = "https://domain-production-weld.herokuapp.com/api/lookup/" + user.quickSite.domain + '.nu';
			$.get(searchDomainUrlNu, function (data, textStatus, jqXHR) {
      	addButton('nu');
			})
			.fail(function(err) {
        nuNotAvailable();
			});
      };

	// process the form
	$('form').submit(function(e) {
			e.preventDefault();

			// FILLING IN THE USER OBJECT:
			user.orgnr = $('input[name=userPersonalNumber]').val();
			user.name = $('input[name=userName]').val();
			user.email = $('input[name=userEmail]').val();
			user.phone = $('input[name=userPhone]').val();
			user.address1 = $('input[name=userAddress]').val();
			user.city = '{{user-city}}' || 'Stockholm';
			user.zipcode = $('input[name=userZipcode]').val();
			user.countrycode = '{{user-countrycode}}' || 'se';
			user.tags = ["Sthlm Tech Fest 2016"];

			// FILLING IN THE USER.QUICKSITE OBJECT:
			var quickSiteTemplate = {
				debug: true, // = don't register a real domain
				name: "{{user.name}}'s website", // Note: you can use string templates and reference the entire `user` object
				description: "Come and meet {{user.name}}!",
				template: "qsg-template",
				elementData: {
						"text-12": { data: { text: "My text" } },
						"text-27": { data: { text: "{{user.name}}'s website" } },
						"image-19": { data: { imageSource: "{{UPLOADED_IMAGE}}" } },
				},
			};

			// Merge quickSiteTemplate into user.quickSite without overwriting
			$.extend(user.quickSite, quickSiteTemplate);

			var register = function() {
				console.log("user in register: ", user);
				
				// TODO: Add HTTP POST below:
				
				console.log("User sent: ", user);
				var registerUrl = SERVER_URL + 'api/users'; 
				$.post(registerUrl, user)
					.done(function(data) {
						console.log("Data received: ", data);
						$(thisElement).trigger('change', ['success', {type: 'user', data: data}]);
					})
					.fail(function(err) {
						console.log("Error registering: ", err.responseText, err);
						$('#errorSpan').toggleClass('hidden').html(err.responseJSON.message); // TODO: Make it dynamically insert the error message
						$(thisElement).trigger('change', ['error', {type: 'error', data: err}]);
					})
				;
			};
			register();
	});

});