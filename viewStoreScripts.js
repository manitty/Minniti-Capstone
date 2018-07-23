const StoreRepository = require('./storeRepository');
require("./models.js")
const storeRepository = new StoreRepository();

function setMediaType() {
	MediaType.getAll().then(function (types) {
		var option = '<option value="__all__">All Media type</option>'
		for (var i=0; i < types.length; i++) {
			type = types[i]
			option += '<option value="'+type._id+'">'+type.name+'</option>'
		}
		$('.view-media-type').html(option);
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
		div += '<div class="storeitem" val="'+media._id+'">'+media.title+'<br><span class="glyphicon glyphicon-usd">'+media.price+'</span><span onclick="StoreItemDetails('+i+')" class="glyphicon glyphicon-align-justify"></span></div>';
	}
	$('#view-store-media').html(div);
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
	$('#view-store-media').html(div);
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
	$('#view-store-media').html(div);
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

$(document).ready(function () {
	setMediaType();
	setArtiste();
	setStoreMedia();

	htmlbodyHeightUpdate()
	$( window ).resize(function() {
	  htmlbodyHeightUpdate()
	});
	$( window ).scroll(function() {
	  height2 = $('.main').height()
		htmlbodyHeightUpdate()
	});

	$('#txtSearchStore').keyup(debounce(300, SearchStore));

});

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

function SearchStore() {
	var searchText = $('#txtSearchStore').val();

	storeRepository.search(searchText, 'title', 1)
		.then(populateStoreMediaList);
}

function StoreItemDetails(id) {
	storeRepository.get(id)
		.then((results) => {
			console.log(results);
			$('#StoreResults').val(results);
		});
}
