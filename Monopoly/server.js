const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const hostname = 'localhost';
const port = 3000;
const app = express();
app.use(cookieParser());
app.use(express.static('public_html'))
app.use('/local-files', express.static('/'));
app.use(express.json()) // for json
app.use(express.urlencoded({ extended: true })) // for form data


app.use(bodyParser.urlencoded({ extended: false }));

// database to store user data & game status

// connecting to the mongoDB database
const connection_string = 'mongodb://127.0.0.1/Monopoly';
mongoose.connect(connection_string, { useNewUrlParser: true });
mongoose.connection.on('error', () => {
  console.log('There was a problem connecting to mongoDB');
});

var Schema = mongoose.Schema;


var BoardSchema = new Schema({
  boardState: [Number],  // id values of cards. Index no. corresponds to id val
  numberOfPlayers: Number,
  players: [Number]     // id values of users
});
const Board = mongoose.model('Board', BoardSchema);


var CardSchema = new Schema({ 
  id: Number,  // index in board list on client side
  color: String,
  name: String,
  price: Number,
  isPurchased: Boolean,
  ownerID: String,    // id val of User Object
  hasSet: Boolean,    // if owner purchased the all the cards in the set
  rent: Number,
  visitors: [Number], // list of User id values currently on the card
  otherCardsInSet: [Number],  // id vals of other Cards in set
  numberOfHouses: Number, 
  houseRentMultiplier: Number   // Rent = Rent + noOfHouses*houseRentMultiplier
});
const Card = mongoose.model('Card', CardSchema);


// UserSchema
var UserSchema = new Schema({
  id: Number,
  username: String,
  password: String, // password will be hashed when storing
  balance: Number,
  color: String,
  status: String,   // ready or not ready
  listOfCardsOwned: [Number],    // list of id values of cards
  numberOfHouses: Number,
});
var User = mongoose.model("UserData", UserSchema);



app.listen(port, () => {
  console.log('Server has started.');
})


Space.deleteMany({})
  .then(() => console.log('All documents removed from collection'))
  .catch(err => console.error(err));


// app.post("/add/space/create", (req,res) => {

//     nameList = ["Go","NV Park","NV Rest","NV Villa","Jail","UT Park","UT Rest","UT Villa","Free",
//     "CA Park", "CA Rest", "CA Villa", "Go to Jail","AZ Park","AZ Rest","AZ Villa"];
//     colorList =["Grey","Blue","Blue","Blue","Grey","Red","Red","Red","Grey","Yellow","Yellow","Yellow","Grey"
//     ,"Green","Green","Green"]
//     costList = [0,100,100,120,0,120,120,140,0,200,200,220,0,250,250,300];

//     for (var i = 0; i <= 15; i++) {
//         var id = i.toString(10);
//     //console.log("hi")
//     console.log(req.body)
//     var testItem1 = new Space( { 
//       id: i,
//       name: nameList[i],
//       cost: costList[i],
//       color: colorList[i]});
//     let p = testItem1.save();
//     // User.updateOne({username: req.params.username},  {$push: {listings: testItem1}}).exec();
//     //console.log(User.findOne({ username: 'd' }).exec());
//     }
// })


// app.get('/get/spaces/:id', (req, res) => {
//   let p1 = Space.find({id:req.params.id}).exec();
//     p1.then( (results) => {
//       res.end(JSON.stringify(results));
//       //console.log(resultString)
//     });
//     p1.catch( (error) => {
//       console.log(error);
//       res.end("FAIL")
//     })
//   });



// what collections do we need ???

app.get('', (req, res) => {
  res.end()
});


app.post('/add/card/', (res, req) => {

});


app.get('/get/boardState', (req, res) => {
  Board.findOne().exec()
    .then((board) => {
      if (board) {
        res.end(JSON.stringify(board.boardState));
      } else {
        res.status(404).json({ error: 'No board found' });
      }
    })
    .catch((error) => { 
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

app.get('/get/numberOfPlayers', (req, res) => {
  Board.findOne().exec()
    .then((board) => {
      if (board) {
        res.end(JSON.stringify(board.numberOfPlayers));
      } else {
        res.status(404).json({ error: 'No board found' });
      }
    })
    .catch((error) => { 
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// CHECK IF THIS WORKs
app.post('/add/card', (req, res) => {
  var cardObj = JSON.parse(req.body);
  var newCard = new Card(cardObj);
  newCard.save();
});


// CHECK IF THIS WORKs
app.get('/get/card/:index', (req, res) => {
  var index = req.params.index;
  Card.findOne({id: index}).exec()
  .then((card) => {
    res.end(JSON.stringify(card));
  })
  .catch((error) => {
    res.end("ERROR: get card using index")
  });
});

//  (POST) Should add a user to the database. The username and password should be sent as POST parameter(s).
const myPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{:;'\"?><,./\[\]\\|\-=]).{5,}/;
app.post('/add/user/', (req, res) => {
  console.log("Saving a new user")
  let newUserToSave = req.body;
  let userData = null;
  try {
    userData = JSON.parse(newUserToSave);
  } catch (e) {
    userData = newUserToSave;
  }

  let p3 = User.find({
    username: userData.username,
  }).exec();
  p3.then((results) => {
    // console.log(results);
    if (results.length == 0) {
      let salt = generateSalt();
      let secureHash = '$' + salt + '$' + cryptoHash(userData.password, salt)
      let newUser = new User({
        username: userData.username,
        password: secureHash
      });
      let p1 = newUser.save();
      p1.then((doc) => {
        console.log('new user saved.')
        res.end('SAVED SUCCESSFULLY');
      });
      p1.catch((err) => {
        console.log(err);
        res.end('FAILED');
      });
    } else {
      res.end("username is unavailable");
    }
  })

})
// authenticates the user login 
app.get('/account/login/:USERNAME/:PASSWORD', (req, res) => {
  let u = req.params.USERNAME;
  let p = req.params.PASSWORD;
  const regex = /^\$([A-Za-z0-9]+)\$/;
  let p1 = User.find({ username: u }).exec();
  p1.then((results => {
    if (results.length > 0) {
      let authenticated = false;
      results.forEach((foundUser) => {
        const storedPassword = foundUser.password;
        const salt = storedPassword.match(regex)[1]; // extract the salt from the stored password
        const hashedPassword = cryptoHash(p, salt); // hash the salted password
        const storedPasswordWithoutSalt = storedPassword.replace(regex, ''); // remove the salt from the stored password
        if (hashedPassword === storedPasswordWithoutSalt) {
          authenticated = true;
        }
      });
      if (authenticated) {
        res.end('SUCCESS');
      } else {
        res.end('Incorrect username or password');
      }

    } else {
      res.end('Login failed');
    }
  }))
});


/**
 * hashes a given string using MD5
 * @param {*} string 
 * @returns new string that resulted from hashing
 */
function cryptoHash(string, salt) {
  const hash = crypto.createHash('md5').update(salt + string).digest('hex');
  return hash;
}

/**
 * 
 * @returns generates a salt for user password
 */
function generateSalt() {
  const minLength = 10;
  const maxLength = 20;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}