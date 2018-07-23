require('./models.js')

// This class handles all purchase operations for the Media Store
class PurchaseHandler {
  constructor (userEmail) {
    this._userEmail = userEmail;

    this.OrderDetails = class {
        constructor (mediaIds, mediaItems, totalPrice) {
          this._mediaIds = mediaIds;
          this._mediaItems = mediaItems;
          this._totalPrice = totalPrice;
        }

        get mediaIds() {
          return this._mediaIds;
        }

        get mediaItems() {
          return this._mediaItems;
        }

        get totalPrice() {
          return this._totalPrice;
        }
    }
  }

  // Initiates a purchase action and returns an 'OrderDetails' object containing
  // the media items to purchase and total price
  initiate (mediaIds) {
    return new Promise((resolve, reject) => {
      if(!mediaIds || mediaIds.length == 0)
        reject('Must include one or more IDs in the mediaIds parameter');
      else {
        if(!(mediaIds instanceof Array))
          mediaIds = [mediaIds];

        Media.find({_id: { $in: mediaIds }}).exec((err, mediaItems) => {
           if(err)
             reject(err);
           else {
             if(!mediaItems || mediaItems.length == 0)
              reject('Media Items not found');
            else {
                let totalPrice =
                mediaItems
                  .map((m) => m.price) // Map objects to prices
                  .reduce((a,b) => a + b); // Sum the prices

               totalPrice = Math.round(totalPrice * 100) / 100;

               let orderDetails = new this.OrderDetails(mediaIds, mediaItems, totalPrice);
               resolve(orderDetails);
             }
           }
        });
      }
    });
  }

  // Completes a purchase when provided with an OrderDetails object and the user's
  // PaymentInfo. Returns the created MediaOrder document.
  confirm (orderDetails, paymentInfo) {
    return new Promise((resolve, reject) => {
      if(!orderDetails)
        reject('orderDetails are required to confirm purchase');
      else if(!paymentInfo)
        reject('paymentInfo is required to confirm purchase');
      else {
        console.log(this);

        this._getUserId().then((userId) => {
          let order = new MediaOrder({
            user: userId,
            priceTotal: orderDetails.totalPrice,
            dateOrder: Date.now()
          });

          order.save((erro, result) => {
            if(erro)
              reject(erro);
            else {
              let orderLinePromises = [];

              orderDetails.mediaItems.forEach((mediaItem) => {
                let mediaOrderLine = new MediaOrderLine({
                  mediaOrder: order._id,
                  media: mediaItem._id,
                  price: mediaItem.price,
                  nbrDownload:0,
                  date: Date.now()
                });
                orderLinePromises.push(mediaOrderLine.save());
              });

              Promise.all(orderLinePromises).then(resolve, reject);
            }
          });
        }, reject);
      }
    });
  }


  _getUserId() {
    // Retrieve the _Id for the User record based on email
    return User.findOne({email: this._userEmail}, "_id").exec()
      .then((userId) => {
        return userId;
      });
  }
}

module.exports = PurchaseHandler;
