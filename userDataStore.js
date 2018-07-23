// Adapted from "How to store user data in Electron" Cameron Nokes
// https://medium.com/@ccnokes/how-to-store-user-data-in-electron-3ba6bf66bc1e

const electron = require('electron');
const path = require('path');
const fs = require('fs');

class UserDataStore{
  constructor() {
    // Determine path to file stored in user's file storage
    const userDataPath = (electron.app || electron.remote.app)
                          .getPath('userData');
    this.path = path.join(userDataPath, 'userData.json');
    // Set data
    this.data = parseDataFile(this.path);
  }

  // Get value associated with the key provided
  get(key) {
      return this.data[key];
  }

  // Associate a value with the key provided
  set (key, val) {
    this.data[key] = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
    console.log(key + ": " + val);
  }
}

// Read the file and parse to JSON object
function parseDataFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (err) {
    return {};
  }
}

// Export data store object
module.exports = UserDataStore;
