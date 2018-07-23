const UserDataStore = require('./UserDataStore');
const LibraryRepository = require('./libraryRepository');
const StoreRepository = require('./storeRepository');
const PurchaseHandler = require('./purchaseHandler');
require('./models.js')
const userDataStore = new UserDataStore();
const libraryRepository = new LibraryRepository(userDataStore.get('email'));
const storeRepository = new StoreRepository();
const purchaseHandler = new PurchaseHandler(userDataStore.get('email'));

function setUserProfile() {
	var email = userDataStore.get('email');
	var result = User.findOne({"email":email}).exec(function(err, user){
		if (err) return handleError(err);
		$('#fname').val(user.fname);
		$('#lname').val(user.lname);
		$('#email').val(user.email);
		$('#gender').val(user.gender);
		$('#avatar').attr('src', user.avatar);
		$('#description').val(user.description);
		$('#country').val(user.country);
		$('#favocountryritegenre').val(user.favocountryritegenre);
		$('#favoritegenre').val(user.favoritegenre);
		$('#favoriteartist').val(user.favoriteartist);
		setMediaUserType(user.prefMedia);
		})

}



function userMedia() {
	var searchText = $('#txtSearchLibrary').val();
	libraryRepository.getAll(searchText)
		.then(populateUserMediaList);
}

function populateUserMediaList(mediaItems) {
	var div = '';
	for (var i=0; i < mediaItems.length; i++) {
		media = mediaItems[i]
				div += '<div class="libitem" val="'+media._id+'">'+media.title+'<br><a href="'+media.url+'" download><span id="dl1" class="glyphicon glyphicon-download-alt"></a></span><span onclick="LibraryItemDetails(\'' + media._id + '\')" class="glyphicon glyphicon-align-justify"></span></div>'
	}
	$('#library').html(div);
}

function setMediaType() {
	MediaType.getAll().then(function (types) {
		var option = '<option value="__all__">All Media type</option>'
		for (var i=0; i < types.length; i++) {
			type = types[i]
			option += '<option id="'+type._id+'" value="'+type._id+'">'+type.name+'</option>'
		}
		$('.view-media-type').html(option);
	});
}
function setMediaUserType(defaultVal) {
	MediaType.getAll().then(function (types) {
		def = ''
		if(defaultVal=='__all__'){
			def = 'selected="true"'
		}
		var option = '<option '+def+' value="__all__">All Media type</option>'
		for (var i=0; i < types.length; i++) {
			type = types[i]
			def = ''
			if(defaultVal==type._id){
				def = 'selected="true"'
			}
			option += '<option '+def+' id="'+type._id+'" value="'+type._id+'">'+type.name+'</option>'
		}
		$('.user-view-media-type').html(option);
	});
}
function setArtiste() {
	Media.getAllArtiste().then(function (artiste) {
		var option = '<option value="__all__">All artiste</option>'
		for (var i=0; i < artiste.length; i++) {
			art = artiste[i]
			option += '<option value="'+art+'">'+art+'</option>'
		}
		$('.view-media-artiste').html(option);
	});
}
function setStoreMedia() {
	filter = {};
	var mediaType = $('#store-view-media-type').val();
	var artist = $('#stor-view-media-artiste').val();
	var view_by = $('#store-view-media-by').val();
	if (mediaType != '__all__' && mediaType != null){
		filter['mediaTpe'] = mediaType;
	}
	if (artist != '__all__' && artist != null){
		filter['authors'] = artist;
	}
	sort = {}
	if (view_by == 'mt'){
		sort['mediaTpe'] = 1;
	}
	else if(view_by == 'art'){
		sort['authors'] = 1;
	}
	sort['title'] = 1
	Media.getAllBy(filter, sort).then(function (medias) {
		if (view_by == 'mt'){
			populateStoreMediaListByType(medias);
		}
		else if(view_by == 'art'){
			populateStoreMediaListByArtist(medias);
		}
		else{
			populateStoreMediaList(medias)
		}
	});
}

function populateStoreMediaList(mediaItems) {
	var div = '';
	for (var i=0; i < mediaItems.length; i++) {
		media = mediaItems[i]
		div += '<div class="storeitem" val="'+media._id+'">'+media.title+'<br><span onclick="purchase(\''+media._id+'\')" class="glyphicon glyphicon-usd">'+media.price+'</span><span onclick="StoreItemDetails(\'' + media._id + '\')" class="glyphicon glyphicon-align-justify"></span></div>';
	}
	$('#store-media').html(div);
}
function populateStoreMediaListByType(mediaItems) {
	var div = '';
	media_type = get_view_by('store-view-media-type');
	for (var key in media_type) {
		div2 = '';
		for (var i=0; i < mediaItems.length; i++) {
			media = mediaItems[i];
			if (media.mediaTpe==key){
				div2 += '<div class="storeitem" val="'+media._id+'">'+media.title+'<br><span onclick="purchase('+i+')" class="glyphicon glyphicon-usd">'+media.price+'</span><span onclick="StoreItemDetails('+i+')" class="glyphicon glyphicon-align-justify"></span></div>';
			}
		}
		if (div2!=''){
			div +='<div class="title">'+media_type[key]+'</div>';
			div +=div2
		}
	}
	$('#store-media').html(div);
}
function populateStoreMediaListByArtist(mediaItems) {
	var div = '';
	artist = get_view_by('stor-view-media-artiste');
	for (var key in artist) {
		div2 = '';
		for (var i=0; i < mediaItems.length; i++) {
			media = mediaItems[i];
			if (media.authors.indexOf(key)>-1){
				div2 += '<div class="storeitem" val="'+media._id+'">'+media.title+'<br><span onclick="purchase('+i+')" class="glyphicon glyphicon-usd">'+media.price+'</span><span onclick="StoreItemDetails('+i+')" class="glyphicon glyphicon-align-justify"></span></div>';
			}
		}
		if (div2!=''){
			div +='<div class="title">'+artist[key]+'</div>';
			div +=div2
		}
	}
	$('#store-media').html(div);
}
function get_view_by(elmt_id){
	var value = {}
	$("#"+elmt_id+" option").each(function()
	{
		if ($(this).attr('value') != '__all__'){
			value[$(this).attr('value')] = $(this).text()
		}
	});
	return value;
}

function purchase(id){
	if(id) {
		purchaseHandler.initiate(id).then(orderDetails => {
			// Populate Purchase Confirmation Screen
			var lstPurchasedItems = $('#lstPurchasedItems');
			lstPurchasedItems.empty();
			orderDetails.mediaItems.forEach(item => {
				lstPurchasedItems.append(`<li>${item.title}<span class="label label-info pull-right">$${item.price.toFixed(2)}</span></li>`);
			});

			$('#lblPurchaseTotalPrice').text(`$${orderDetails.totalPrice.toFixed(2)}`);

			// Setup purchase confirmation handler
			$('#frmPaymentInfo')[0].reset();
			$('#frmPaymentInfo').submit(evt => {
				// Prevent actual submit
				evt.preventDefault();
				// Unbind submit handler
				$('#frmPaymentInfo').off('submit');

				confirmPurchase(orderDetails);
			});

			// Show purchase confirmation screen
			hideAllContentScreens();
			$('#purchaseConfirmationContent').show();
		});
	}

	function confirmPurchase(orderDetails) {
		var frmPaymentInfo = $('#frmPaymentInfo');
		var paymentInfo = {
			firstName: frmPaymentInfo.find('[name="FirstName"]').val(),
			lastName: frmPaymentInfo.find('[name="LastName"]').val(),
			zipCode: frmPaymentInfo.find('[name="ZipCode"]').val(),
			cardNumber: frmPaymentInfo.find('[name="CardNumber"]').val()
		};

		purchaseHandler.confirm(orderDetails, paymentInfo).then(mediaOrder => {
			// Populate receipt screen
			$('#lblReceiptTotalPrice').text(`$${orderDetails.totalPrice.toFixed(2)}`);

			var lstReceiptItems = $('#lstReceiptItems');
			lstReceiptItems.empty();
			orderDetails.mediaItems.forEach(item => {
				lstReceiptItems.append(`<li><h3>${item.title}&nbsp;&nbsp;<a href="${item.url}" download><span class="glyphicon glyphicon-download-alt"></span></a></h3></li>`);
			});

			// Show receipt screen
			hideAllContentScreens();
			$('#receiptContent').show();
		});
	}
}

function cancelPurchase() {
	if(confirm('Are you sure?')){
		$('#frmPaymentInfo')[0].reset();
		hideAllContentScreens();
		storeFunction();
	}
}

$(document).ready(function () {
	//const userDataStore = new UserDataStore
	setMediaType();
	setArtiste();
	setStoreMedia();
	var email = userDataStore.get('email');
	$('#user_id').html(email+",<br/>");
	setUserProfile();
	userMedia();
	htmlbodyHeightUpdate()
	$( window ).resize(function() {
	  htmlbodyHeightUpdate()
	});
	$( window ).scroll(function() {
	  height2 = $('.main').height()
		htmlbodyHeightUpdate()
	});

	$('#txtSearchLibrary').keyup(debounce(300, SearchLibrary));
	$('#txtSearchStore').keyup(debounce(300, SearchStore));
	$('#user-profile').submit(function(e) {
		e.preventDefault();
		var data = {};
		var dataArray = $('#user-profile').serializeArray();
		for(var i=0;i<dataArray.length;i++){
			user = dataArray[i];
			data[user.name] = user.value;
		}
		email = data['email']
		User.findOne({email: email}, function(err, contact) {
			if(!err) {
				if(!contact) {
					contact = new User(data);
					contact.save();
				}else{
					contact.fname = data['fname'];
					contact.lname = data['lname'];
					//contact.email = data['email'];
					contact.gender = data['gender'];
					contact.avatar = data['avatar'];
					contact.description = $('#description').val();
					contact.country = data['country'];
					contact.favoritegenre = data['favoritegenre'];
					contact.favoriteartist = data['favoriteartist'];
					contact.prefMedia = data['prefMedia'];
					contact.save();
				}
			}
			else{console.log(err);}
		});
	 });
	// Default to Media Library View
	libraryFunction();
});

function logout() {
  userDataStore.set('isAuthorized', false);
  userDataStore.set('accessToken', null);
  userDataStore.set('idToken', null);
  userDataStore.set('refreshToken', null);
  userDataStore.set('email', null);

  alert('You have been logged out.');
  window.location = "loginpage.html";
}

function htmlbodyHeightUpdate(){
    var height3 = $( window ).height()
    var height1 = $('.nav').height()+50
    height2 = $('.main').height()
    if(height2 > height3){
      $('html').height(Math.max(height1,height3,height2)+10);
      $('body').height(Math.max(height1,height3,height2)+10);
    }
    else
    {
      $('html').height(Math.max(height1,height3,height2));
      $('body').height(Math.max(height1,height3,height2));
    }

  }

  function InsertDatabase(id) {
      var result;
      var connection = mysql.createConnection(
          {
              host        :   'localhost',
              user        :   'username',
              password    :   'password',
              database    :   'myDB'
          }
      );

      connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        var sql = "INSERT INTO customers (name, address) VALUES ('Company Inc', 'Highway 37')";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
        });
      });
  }

	function debounce(delay, f) {
			let lastHit = Date.now();

			return function(e) {
				lastHit = Date.now();

				setTimeout(() => {
					const now = Date.now();

					if(now - lastHit > delay)
						f(e);

				}, delay);
			};
	}

	function SearchLibrary() {
		var searchText = $('#txtSearchLibrary').val();

		libraryRepository.search(searchText, 'title', 1)
			.then(populateUserMediaList);
	}

	function SearchStore() {
		var searchText = $('#txtSearchStore').val();

		storeRepository.search(searchText, 'title', 1)
			.then(populateStoreMediaList);
	}


	function StoreItemDetails(id) {
		storeRepository.get(id)
			.then((results) => {
				showItemDetails(results);
			});
	}

function LibraryItemDetails(id) {
	libraryRepository.get(id)
		.then((results) => {
			showItemDetails(results);
		});
}

	function showItemDetails(mediaItem) {
		$('#lblMediaDetailsTitle').empty().append(mediaItem.title);

		var lstMediaDetailsAuthors = $('#lstMediaDetailsAuthors');
		lstMediaDetailsAuthors.empty();
		mediaItem.authors.forEach((a) => {
			lstMediaDetailsAuthors.append(`<li>${a}</li>`);
		})

		$('#pMediaDetailsPubDate').empty().append(mediaItem.publicationDate.toDateString());
		$('#pMediaDetailsType').empty().append(mediaItem.mediaTpe.name);
		var duration = formatDuration(mediaItem.duration);
		$('#pMediaDetailsDuration').empty().append(duration);
		$('#pMediaDetailsDesc').empty().append(mediaItem.description);

		$('#divMediaDetails').show();
	}

	function closeItemDetails() {
		$('#divMediaDetails').hide();
	}

	function formatDuration(dur) {
		var mins = Math.trunc(dur);
		var secs = Math.round((dur - mins) * 60);

		if(secs == 60) {
			mins++;
			secs = 0;
		}

		if(mins >= 60){
			var hours = Math.trunc(mins / 60);
			mins = mins % 60;
			return `${hours}:${f(mins)}:${f(secs)}`;
		}
		else {
			return `${f(mins)}:${f(secs)}`;
		}

		function f(n) {
			if(n == 0)
				return "00";
			else if(n < 10)
				return "0" + n;
			else
				return n.toString();
		}
	}

	$('.disabled').click(function(e){
	 e.preventDefault();
	})


	document.getElementById("Home").addEventListener("click", homeFunction);
	document.getElementById("Store").addEventListener("click", storeFunction);
	document.getElementById("Library").addEventListener("click", libraryFunction);
	document.getElementById("Profile").addEventListener("click", profileFunction);
	document.getElementById("Settings").addEventListener("click", settingsFunction);
	var home = document.getElementById('homeContent');
	var store = document.getElementById('storeContent');
	var library = document.getElementById('libraryContent');
	var profile = document.getElementById('profileContent');
	var settings = document.getElementById('settingsContent');
	var home1 = document.getElementById('Home');
	var store1 = document.getElementById('Store');
	var library1 = document.getElementById('Library');
	var profile1 = document.getElementById('Profile');
	var settings1 = document.getElementById('Settings');

	var purchaseConfirmationContent = $('#purchaseConfirmationContent');
	var receiptContent = $("#receiptContent");


	function homeFunction() {
			if (home.style.display === 'none') {
					home.style.display = 'block';
					store.style.display = 'none';
					library.style.display = 'none';
					profile.style.display = 'none';
					settings.style.display = 'none';
					home1.classList.add("active");
					store1.classList.remove("active");
					library1.classList.remove("active");
					profile1.classList.remove("active");
					settings1.classList.remove("active");
					purchaseConfirmationContent.hide();
					receiptContent.hide();
			}else{
				return;
			}
	}

	function storeFunction() {
			if (store.style.display === 'none') {
					home.style.display = 'none';
					library.style.display = 'none';
					profile.style.display = 'none';
					settings.style.display = 'none';
					store.style.display = 'block';
					home1.classList.remove("active");
					store1.classList.add("active");
					library1.classList.remove("active");
					profile1.classList.remove("active");
					settings1.classList.remove("active");
					purchaseConfirmationContent.hide();
					receiptContent.hide();

					// Clear search and update media listing
					$('#txtSearchStore').val('');
					setStoreMedia();
			}else{
				return;
			}
	}

	function libraryFunction() {
			if (library.style.display === 'none') {
					store.style.display = 'none';
					home.style.display = 'none';
					profile.style.display = 'none';
					settings.style.display = 'none';
					library.style.display = 'block';
					home1.classList.remove("active");
					store1.classList.remove("active");
					library1.classList.add("active");
					profile1.classList.remove("active");
					settings1.classList.remove("active");
					purchaseConfirmationContent.hide();
					receiptContent.hide();

					// Clear search and update media listing
					$('#txtSearchLibrary').val('');
					userMedia();
			}else{
				return;
			}
	}

	function profileFunction() {
			if (profile.style.display === 'none') {
					store.style.display = 'none';
					home.style.display = 'none';
					library.style.display = 'none';
					settings.style.display = 'none';
					profile.style.display = 'block';

					home1.classList.remove("active");
					store1.classList.remove("active");
					library1.classList.remove("active");
					profile1.classList.add("active");
					settings1.classList.remove("active");
					purchaseConfirmationContent.hide();
					receiptContent.hide();

			}else{
				return;
			}
	}

	function friendsFunction() {
			if (friends.style.display === 'none') {
					store.style.display = 'none';
					home.style.display = 'none';
					profile.style.display = 'none';
					library.style.display = 'none';
					settings.style.display = 'none';
					home1.classList.remove("active");
					store1.classList.remove("active");
					library1.classList.remove("active");
					profile1.classList.remove("active");
					settings1.classList.remove("active");
					purchaseConfirmationContent.hide();
					receiptContent.hide();

			}else{
				return;
			}
	}

	function settingsFunction() {
			if (settings.style.display === 'none') {
					store.style.display = 'none';
					home.style.display = 'none';
					profile.style.display = 'none';
					library.style.display = 'none';
					settings.style.display = 'block';
					home1.classList.remove("active");
					store1.classList.remove("active");
					library1.classList.remove("active");
					profile1.classList.remove("active");
					settings1.classList.add("active");
					purchaseConfirmationContent.hide();
					receiptContent.hide();
			}else{
				return;
			}
	}

	function hideAllContentScreens(){
		$('#homeContent').hide();
		$('#storeContent').hide();
		$('#libraryContent').hide();
		$('#profileContent').hide();
		$('#settingsContent').hide();
		purchaseConfirmationContent.hide();
		receiptContent.hide();
	}

function openAbout() {
	const remote = require('electron').remote;
	const BrowserWindow = remote.BrowserWindow;

	var win = new BrowserWindow({ width: 270, height: 270 });
	win.loadURL('file://' + __dirname + '/about.html');
}
