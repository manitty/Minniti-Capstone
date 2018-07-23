require('./models.js')

// This class encapsulates CRUD operations for Media Store data
class StoreRepository {
  constructor () {
  }

  // Gets all media items owned by the user
  getAll(sortField, sortDir) {
    if(!sortField)
      sortField = 'title';
    if(!sortDir)
      sortDir = 1;

    return new Promise((resolve, reject) => {
      Media.find().populate('mediaTpe').exec((err, mediaItems) => {
        if(err)
          reject(err);
        else {
          var sortedMediaItems = mediaItems.sort(this._makeSort(sortField, sortDir));
          resolve(sortedMediaItems);
        }
      });
    });
  }

  // Gets an individual media item
  get(id) {
    return new Promise((resolve, reject) => {
      Media.findOne({_id: id}).populate('mediaTpe').exec((err, mediaItem) => {
        if(err)
          reject(err);
        else if(!mediaItem)
          reject('Media Item not found.');
        else
          resolve(mediaItem);
      });
    });
  }

  // Searches the Media items owned by the user
  search(searchText, sortField, sortDir) {
    if(!sortField)
      sortField = 'title';
    if(!sortDir)
      sortDir = 1;

    let matchCriteria = {
      $or: [
        { title: {$regex: searchText, '$options': 'i'}},
        { description: {$regex: searchText, '$options': 'i'}},
        { authors: {$regex: searchText, '$options': 'i'}}
      ]
    };

    return new Promise((resolve, reject) => {
      Media.find(matchCriteria).exec((err, mediaItems) => {
        if(err)
          reject(err);
        else
          resolve(mediaItems);
      });
    });
  }

  _makeSort(sortField, sortDir) {
    if(sortDir < 0)
      sortDir = -1;
    else
      sortDir = 1;

    return function(a, b) {
       if(a[sortField] > b[sortField])
         return sortDir;
       else if(a[sortField] < b[sortField])
         return -sortDir;
       else
         return 0;
    }
  }

}

module.exports = StoreRepository;
