
var mongoose = require('mongoose');
require('mongoose-type-email');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://indie:indiePWD@45.55.83.9:27017/indie_market',{ useMongoClient: true });

// Create all of the required Schemas and Models
createUserSchema();
createMediaTypeSchema();
createMediaSchema();
createMediaOrderSchema();
createMediaOrderLineSchema();

// Setup global db object
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


function createUserSchema(){
	//user Schema
	var UserSchema = mongoose.Schema({
			email			: {type: mongoose.SchemaTypes.Email, required: true, unique: true},
			username		: String,
			fname			: String,
			lname			: String,
			gender			: String,
			birthdate		: Date,
			description		: String,
			avatar			: String,
			country			: String,
			favoritegenre	: String,
			favoriteartist	: String,
			prefMedia		: String,
		});
	UserSchema.methods.saveProfileData = function (data) {
		//Data should be a json type with user fields as key
		var user = new User(data)
		user.save();
		return user;
	}
	User = mongoose.model('User', UserSchema);
}

function createMediaTypeSchema(){
	//MediaType Schema
	var MediaTypeSchema = mongoose.Schema({
			name			: String,
			fileType		: String
		});

		MediaTypeSchema.statics.getAll = function () {
			return new Promise((resolve, reject) => {
				this.find({}).sort({name:1}).exec(function(err, type) {
					resolve(type);
				});
		})
	}
	MediaType = mongoose.model('MediaType', MediaTypeSchema);
}

function createMediaSchema() {
	//Media Schema
	var MediaSchema = mongoose.Schema({
			mediaTpe		: {type: mongoose.Schema.Types.ObjectId, ref: 'MediaType' },
			title			: String,
			authors			: [{type: String}],
			publicationDate	: Date,
			url				: String,
			description		: String,
			price			: Number,
			duration		: Number,
		});
	MediaSchema.statics.getAllBy = function (filter, sort) {
		//filter should be a dict of Media collection fields as key and value desired set filter={} to get all Media
		//sort should a dict of field to sort by: sort = {title:1}
		return new Promise((resolve, reject) => {
			this.find(filter).sort(sort).exec(function(err, medias) {
				resolve(medias);
			});
		})
	}
	MediaSchema.statics.getAllArtiste = function () {
		return new Promise((resolve, reject) => {
			this.distinct('authors').exec(function(err, authors) {
				resolve(authors.sort());
			});
		})
	}
	Media = mongoose.model('Media', MediaSchema);
}

function createMediaOrderSchema() {
	// MediaOrder Schema
	var MediaOrderSchema = mongoose.Schema({
			user : {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
			dateOrder: Date,
			priceTotal: Number
	});

	MediaOrder = mongoose.model('MediaOrder', MediaOrderSchema);
}

function createMediaOrderLineSchema() {
	// MediaOrderLine
	var MediaOrderLineSchema = mongoose.Schema({
	  mediaOrder: {type: mongoose.Schema.Types.ObjectId, ref: 'MediaOrder'},
		media: {type: mongoose.Schema.Types.ObjectId, ref: 'Media'},
		price: Number,
		nbrDownload: Number,
		date: Date
	});

	MediaOrderLine = mongoose.model('MediaOrderLine', MediaOrderLineSchema);
}
