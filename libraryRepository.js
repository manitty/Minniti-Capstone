require('./models.js')

// This class encapsulates CRUD operations for Media Library data
class LibraryRepository {
  constructor (userEmail) {
    this._userEmail = userEmail;
  }

  // Gets all media items owned by the user
  getAll(sortField, sortDir) {
    if(!sortField)
      sortField = 'title';
    if(!sortDir)
      sortDir = 1;

    return new Promise((resolve, reject) => {
      // Retrieve UserId based on email
      this._getUserId().then((userId) => {

        // Find all of User's MediaOrders
        MediaOrder.find({user: userId}, "_id").exec((err, mediaOrderIds) => {

          // Find all of MediaOrders' MediaOrderLines and populate media property
          MediaOrderLine.find({mediaOrder:{$in: mediaOrderIds}})
            .populate({path: 'media', populate: { path: 'mediaTpe'}})
            .exec((err2, mediaOrderLines) => {
              // Create collection of just the Media objects
              var media = mediaOrderLines.map((orderLine) => { return orderLine.media ;})
                                         .sort(this._makeSort(sortField, sortDir));
              resolve(media);
            });
        });
      });
    });
  }

  // Gets an individual media item
  get(id) {
    return new Promise((resolve, reject) => {
      this.getAll().then((ownedMediaItems) => {
        var mediaItem = ownedMediaItems.filter((m) => m._id == id);
        if(!mediaItem || mediaItem.length == 0)
          reject('User does not own this media item.');
        else
          resolve(mediaItem[0]);

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
      // Retrieve UserId based on email
      this._getUserId().then((userId) => {

        // Find all of User's MediaOrders
        MediaOrder.find({user: userId}, "_id").exec((err, mediaOrderIds) => {

          // Find all of MediaOrders' MediaOrderLines and populate media property
          MediaOrderLine.find({mediaOrder:{$in: mediaOrderIds}})
            .populate({path: 'media', match: matchCriteria})
            .exec((err2, mediaOrderLines) => {
              console.log(mediaOrderLines);
              // Create collection of just the Media objects
              var media = mediaOrderLines
                            .map((orderLine) => { return orderLine.media;}) // Map to just the media files
                            .filter((media) => { return media; }) // Filter out nulls (excluded by search matching)
                            .sort(this._makeSort(sortField, sortDir)); // Sort

              resolve(media);
            });
        });
      });
    });
  }

  _getUserId() {
    // Retrieve the _Id for the User record based on email
    return User.findOne({email: this._userEmail}, "_id").exec()
      .then((userId) => {
        return userId;
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

module.exports = LibraryRepository;
