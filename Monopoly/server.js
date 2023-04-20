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

//Connect to mongoDB server  
connection_string = 'mongodb://127.0.0.1/Monopoly';
mongoose.connect(connection_string, { useNewUrlParser: true });
mongoose.connection.on('error', () => {
  console.log('There was a problem connecting to mongoDB');
});

const { receiveMessageOnPort } = require('worker_threads');
var Schema = mongoose.Schema;


var BoardSchema = new Schema({
  boardState: [Number],  // id values of players and where they are on the board. Write -1 for cards w no player  [-1,1,-1,2,-1,3,-1,4]
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
  position: Number, // index value of board list
  color: String,
  status: String,   // ready or not ready
  listOfCardsOwned: [Number],    // list of id values of cards
  numberOfHouses: Number,
});
var User = mongoose.model("UserData", UserSchema);

// delete all documents from the 'User' collection
User.deleteMany({})
.then(() => console.log('Deleted all user data'))
.catch((err) => console.log('Error deleting users:', err));

app.listen(port, () => {
  console.log('Server has started.');
})



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


/**
 * Checks if every user is ready
 */
app.get('/isReady/', (req, res) => {
  let isReady = 'true';

  User.find().exec()
  .then((results) => {

    console.log("All Users " + results);

    for (let i=0; i<results.length; i++){
      // console.log("iterating");

      User.findOne({id: i}).exec()
      .then((user) => {
        // console.log(user);
        console.log(i + ": " + user.status);
        if (user.status === "NR"){
          console.log(user.id + " is NR");
          isReady = 'false';
        }
        if (i === results.length-1) {
          res.end(isReady);
        }
      }).catch((error) => {
        res.end("ERROR: get card using index")
      });
    }
  });
  
});


/**
 * Set user to ready
 */
app.get('/set/ready/:username', (req, res) => {
  let u = req.params.username;
  User.findOne({username: u}).exec()
  .then((user) => {
    if (user.status === "NR"){
      user['status'] = 'R';
      user.save();
      console.log(user);
      res.end("Status Change: Success");
    }
  }).catch((error) => {
    res.end("ERROR: Changing Status")
  });
});
  

/**
 * Sends usercolor back to the client
 */
app.get('/get/user_color/:username', (req, res) => {
  let u = req.params.username;
  console.log(u);
  User.findOne({username: u}).exec()
  .then((user) => {
    console.log(user);
    res.end(user.color);
  })
  .catch((error) => {
    res.end("ERROR: get card using index")
  });
});


/**
 * Sends a list of players to the clients
 */
app.get('/get/players/', (req, res) => {
  console.log('Sending all players');
  let p1 = User.find({}).exec()
  p1.then( (results) => { 
    res.end( JSON.stringify(results, undefined, 2) );
  });
  p1.catch( (error) => {
    console.log(error);
    res.end('FAIL');
  });
});

var user_Id = 0;   // users start from 0 index
const user_colors = ['red', 'blue', 'green', 'yellow'];


//  (POST) Should add a user to the database. The username and password should be sent as POST parameter(s).
const myPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{:;'\"?><,./\[\]\\|\-=]).{5,}/;
app.post('/add/user/', (req, res) => {
  if (user_Id > 3){
    res.end("max limit reached");
  }
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
        id: user_Id,
        username: userData.username,
        password: secureHash,
        balace: 1000,
        position: 0,
        color: user_colors[user_Id % user_colors.length],
        status: "NR",
        listOfCardsOwned: [],
        numberOfHouses: 0
      });
      let p1 = newUser.save();
      p1.then((doc) => {
        console.log('new user saved.')
        res.end('SAVED SUCCESSFULLY');
        user_Id += 1;
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
          foundUser['status'] = "NR";
          foundUser.save();
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
 * @returns generates a salt for   a user password
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