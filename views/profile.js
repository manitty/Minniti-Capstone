require('./models.js')
const session = require('electron').session;

function getUserConnected(){
	session.defaultSession.cookies.get('email', function(error, email) {
		if (email){
			var result = User.findOne({"email":email}).exec(function(err, user){
				if (err) return handleError(err);
				//set user value in the form
				$('#inputEmail').val(user.email);
				//console.log(user);
				return 
			})
		}
	});

	
}
function createUser(data){
	var result = User.findOne({"email":email}).exec(function(err, user){
		if (err) return handleError(err);
		if (user){
			User.update({}, update, opts, function(error) {
				if (err) return handleError(error);
			});
		}
		else{
			User.save(data);
		}
		//console.log(user);
		return
	})
}

$(document).ready(function () {
	getUserConnected()
  });
