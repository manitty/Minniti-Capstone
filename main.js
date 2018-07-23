const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const AuthReceiver = require('./authReceiver');
const UserDataStore = require('./userDataStore');

// Populate the database with test data
// (Uncomment to rebuild database)
//require('./populateDatabase.js')();

let win

// Small NodeJS server used to receive authorization code and tokens from Google Sign-In
const authReceiver = new AuthReceiver(postAuthorize);
// UserDataStore persists data tied to the current application user
const userDataStore = new UserDataStore();

function createWindow(){

  win = new BrowserWindow({width:1200,height:1200})

  let userIsAuthorized = userDataStore.get('isAuthorized');

  if(userIsAuthorized)
    showHome();
  else
    showLogin();

  win.webContents.openDevTools()

  win.on('closed', () =>{
    win=null
  })
}

function showLogin() {
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'loginpage.html'),
    protocol: 'file:',
    slashes: true
  }))
}

function showHome() {
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'home.html'),
    protocol: 'file:',
    slashes: true
  }));
}

function postAuthorize() {
  showHome();
}

app.on('ready', createWindow)
