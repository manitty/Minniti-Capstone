const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring')
const UserDataStore = require('./userDataStore.js')
const {net} = require('electron')
require('./models.js')

function createUser(data){
	var result = User.findOne({"email":data.email}).exec(function(err, user){
		if (err) return console.log(err);
		if (user){
			console.log('Skipped existing User');
		}
		else{
			var user = new User(data)
			user.save();
			console.log('User created');
		}
		return
	})
}

function handleUser(accessToken, userDataStore){
	https.get( "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token="+accessToken, (res) => {
		let rawData = '';
		res.on('data', function (chunk) {
			rawData += chunk;
			const parsedData = JSON.parse(rawData);
			user = {
				'email':parsedData.email,
				'fname':parsedData.given_name,
				'lname':parsedData.family_name,
				'avatar':parsedData.picture,
				'gender':parsedData.gender,
			}
			//store user email
			userDataStore.set('email', parsedData.email);
			createUser(user)
		});
	});
}

class AuthReceiver {
  //postAuthorize is a callback used when the authentication token has been successfully received
  constructor(postAuthorize) {
    const hostname = '127.0.0.1';
    const port = 495;

    const tokenBaseUrl = 'www.googleapis.com';
    const tokenPath = '/oauth2/v4/token';
    const clientID = '51906025800-4l9g3513tb97hbg3rvd5uaq5eqrik9m0.apps.googleusercontent.com';
    const clientSecret = 'QirvtiC_tip1F9RU1aEJB-ID';
    const codeVerifier = 'b9MIKE4nAkQ_f8hn4fp_B53JFj-fjhWaG-Z-3WYWrzq0GBjn.GX43MYsPDGTO2KCU';

    // Persists user's data
    const userDataStore = new UserDataStore();

    // Create a small web server to receive redirect from Google Sign-In
    const server = http.createServer((req, res) => {
      var reqUrl = url.parse(req.url, true);
      var path = reqUrl.path;

      // URL is http://127.0.0.1:495/auth
      if(path.startsWith('/auth')){
          var authCode = reqUrl.query.code;

          const tokenReqData = {
            code: authCode,
            client_id: clientID,
            client_secret: clientSecret,
            code_verifier: codeVerifier,
            redirect_uri: 'http://127.0.0.1:495/auth',
            grant_type: 'authorization_code'
          };
          const tokenReqDataString = querystring.stringify(tokenReqData);
          const tokenReqOptions = {
            hostname: tokenBaseUrl,
            path: tokenPath,
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(tokenReqDataString)
            }
          };

          // Use the auth code to request the access token
          const tokenReq = https.request(tokenReqOptions, (res) => {
            res.setEncoding('utf8');

            // Append the data chunks together
            let rawData = '';
            res.on('data', function (chunk) {
              rawData += chunk;
            });

            // When response is complete, parse the token data
            res.on('end', () => {
              try {
                const parsedData = JSON.parse(rawData);

                console.log('authorized!');
                // Save the tokens for use and mark user as authorized
                userDataStore.set('isAuthorized', true);
                userDataStore.set('accessToken', parsedData.access_token);
                userDataStore.set('idToken', parsedData.id_token);
                userDataStore.set('refreshToken', parsedData.refresh_token === undefined
                                                ? null : parsedData.refresh_token)

                handleUser(parsedData.access_token, userDataStore)
				postAuthorize();
              } catch (err){
                // Clear tokens and mark user as not authorized
                userDataStore.set('isAuthorized', false);
                userDataStore.set('accessToken', null);
                userDataStore.set('idToken', null);
                userDataStore.set('refreshToken', null);
                console.error(err.message);
              }
            });
          });

          tokenReq.write(tokenReqDataString);
          tokenReq.end();

          // If authorization is successful, the application will redirect before this is displayed.
          res.setHeader('Content-Type', 'text/plain');
          res.end('If you\'re seeing this, something failed in the Authorization process...\n');
      }
      else {
        res.statusCode = 404;
      }
    });

    // Start up the server
    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
  }
}

module.exports = AuthReceiver;
