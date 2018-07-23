require('./models.js')

function run() {
  createMediaTypes()
  .then(createMediaItems);
  // No need to create orders now that store purchases work
  //.then(createOrders);
}

function createMediaTypes() {
  return new Promise((resolve, reject) => {
    // Clear all existing Media Types
    MediaType.remove().exec(function(){

      var musicPromises = [];

      // Create all Media Types
      var music = new MediaType({name: 'Music', fileType: 'mp3'});
      musicPromises.push(music.save());

      var audio = new MediaType({name: 'Audio', fileType: 'mp3'});
      musicPromises.push(audio.save());

      var audiobook = new MediaType({name: 'Audiobook', fileType: 'mp3'});
      musicPromises.push(audiobook.save());

      var video = new MediaType({name: 'Video', fileType: 'avi'});
      musicPromises.push(video.save());

      var software = new MediaType({name: 'Software', fileType: 'exe,app,jar'});
      musicPromises.push(software.save());

      Promise.all(musicPromises).then(resolve);
    });
  });
}

function createMediaItems() {
  return new Promise((resolve, reject) => {

    Media.remove().exec(function() {
      var audioBookPromise = MediaType.findOne({name:'Audiobook'}).exec();
      var audioPromise = MediaType.findOne({name:'Audio'}).exec();

      Promise.all([audioBookPromise, audioPromise]).then(function(results) {
        var audioBookMediaType = results[0];
        var audioMediaType = results[1];;

        var audioBookId = audioBookMediaType._id;
        var audioId = audioMediaType._id;

        var savePromises = [];

        var test1 = new Media({
            mediaTpe: audioBookId,
            title: "The Chronicles of Blarnia",
            authors: ['Michael Scoot', 'Jam Helpart'],
            publicationDate: '5/13/1942',
            url: 'test1.mp3',
            description: 'Be amazed by Mr. Scoot\'s whimsical tale of adventure and unrequited love as he transports you to Blarnia.',
            price: 3.50,
            duration: 12.76
        });
        savePromises.push(test1.save());

        var test2 = new Media({
            mediaTpe: audioBookId,
            title: "Zorku Lqzeekhlik: An Extraterrestrial Autobiography",
            authors: ['Zorku Lqzeekhlik', 'Kayly Rajnigandhi Kapuri', 'Crele Batone'],
            publicationDate: '5/13/2015',
            url: 'test2.mp3',
            description: 'Our first contact and supreme overlord Zorku Lqzeekhlik finally tells his story for all to read. His surprisingly humble upbringing on Snarlicon 7 will pull at your heartstrings and provide some real insight into the Snarflorx\'s policy decisions here on Earth. (Praise Zorku <3 )',
            price: 12.99,
            duration: 8.51
        });
        savePromises.push(test2.save());

        var test3 = new Media({
            mediaTpe: audioBookId,
            title: "Loaded Baked Potato Soup for the \'Murican Soul",
            authors: ['Tony Flanderston'],
            publicationDate: '8/30/2012',
            url: 'test4.mp3',
            description: 'Uplifting, Inspiring, and Patriotic as Heck!',
            price: 7.55,
            duration: 21.0
        });
        savePromises.push(test3.save());

        var test4 = new Media({
            mediaTpe: audioId,
            title: "The Sounds of the Airport",
            authors: ['Palm Beastly'],
            publicationDate: '5/13/2016',
            url: 'test4.mp3',
            description: 'The soothing sound of jet engines, air traffic radio, and disgruntled passengers at Washington Dulles International Airport. You\'ll swear you can smell the jet fuel.',
            price: 11.12,
            duration: 31.42
        });
        savePromises.push(test4.save());

        Promise.all(savePromises).then(resolve);
      });
    });
  });
}

function createOrders() {
  return new Promise((resolve, reject) => {
    // Clear all MediaOrderLines
    var clearOrderLinesPromise = MediaOrderLine.remove().exec();

    // Clear all MediaOrders
    var clearOrdersPromise = MediaOrder.remove().exec();

    // Get all users
    var usersPromise = User.find().exec();

    // Get audiobook MediaType
    var audioBookTypePromise = MediaType.find({name: 'Audiobook'}).exec();

    // Get audioBooks
    Promise.all([usersPromise, audioBookTypePromise, clearOrderLinesPromise, clearOrdersPromise])
      .then((results) => {
        var users = results[0];
        var audioBookTypeId = results[1][0]._id;

        // Find the audiobooks
        Media.find({mediaTpe: audioBookTypeId}).exec((err, audiobooks) => {
          // For each user, create a MediaOrder
          users.forEach((usr) => {
            var order = new MediaOrder({
              user: usr,
              priceTotal: 100,
              dateOrder: '1/1/2017'
            });

            order.save(() =>{

              // For each Media Order and Audiobook create MediaOrderLine
              audiobooks.forEach((audiobook) => {
                var mediaOrderLine = new MediaOrderLine({
                  mediaOrder: order._id,
                  media: audiobook._id,
                  price: audiobook.price,
                  nbrDownload: 0,
                  date: '1/1/2017'
                });
                mediaOrderLine.save();
              });
            });
          });
        });
    });
  });
}

module.exports = run;
