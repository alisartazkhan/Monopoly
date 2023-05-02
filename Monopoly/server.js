//server

const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const WebSocket = require('ws'); // used to send messages to clients

const hostname = 'localhost';
const port = 3000;
const app = express();
app.use(cookieParser());
app.use(express.static('public_html'))
app.use('/local-files', express.static('/'));
app.use(express.json()) // for json
app.use(express.urlencoded({ extended: true })) // for form data


app.use(bodyParser.json());

//Connect to mongoDB server  
connection_string = 'mongodb://127.0.0.1/Monopoly';
mongoose.connect(connection_string, { useNewUrlParser: true });
mongoose.connection.on('error', () => {
  console.log('There was a problem connecting to mongoDB');
});

const { receiveMessageOnPort } = require('worker_threads');
const { match } = require('assert');
var Schema = mongoose.Schema;


var TurnSchema = new Schema({
  playerTurn: Number
});
const Turn = mongoose.model('Turn', TurnSchema);


var CardSchema = new Schema({ 
  id: Number,  // index in board list on client side
  color: String,
  name: String,
  price: Number,
  isPurchased: Boolean,
  ownerID: Number,    // id val of User Object
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
// User.deleteMany({})
// .then(() => console.log('Deleted all user data'))
// .catch((err) => console.log('Error deleting users:', err));

Turn.deleteMany({})
.then(() => {
  console.log('Deleted all turn data');
  var t = new Turn ({
    playerTurn: 0
  })
  t.save();
})
.catch((err) => console.log('Error deleting turns:', err));



const server = app.listen(port, () => {
  console.log('Server has started.');
})

// to prevent favicon error on browser
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

////////////////////////////////////////
const wss = new WebSocket.Server({ port: 3080 });
// Broadcast a message to all clients
// wss.clients.forEach((client) => {
//   if (client.readyState === WebSocket.OPEN) {
//     console.log('sending a message to clients')
//     client.send('Hello, clients!');
//   }
// });
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);
  // Send a welcome message to the newly connected client
  // ws.send('Welcome to the chat!');
  
  // When the server receives a message from a client, broadcast it to all connected clients
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    broadcastMessage(message);
  });

  // Removes the client from the set of connected clients when they disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});



app.get('/get/cards/', (req, res) => {
  Card.find({}).exec()
  .then((cards) => {
    res.end(JSON.stringify(cards, undefined, 2));
  })
  .catch((error) => {
    res.end("ERROR: get cards")
  });
});


/**
 * Checks if every user is ready
 */
app.get('/isReady/', (req, res) => {
  let isReady = 'true';

  User.find().exec()
  .then((results) => {

    // console.log("All Users " + results);

    for (let i=0; i<results.length; i++){
      // console.log("iterating");

      User.findOne({id: i}).exec()
      .then((user) => {
        // console.log(user);
        // console.log(i + ": " + user.status);
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
      // console.log(user);
      res.end("Status Change: Success");
    }
  }).catch((error) => {
    res.end("ERROR: Changing Status")
  });
});

/**
 * Set user to ready
 */
app.get('/get/username/:userID', (req, res) => {
  let u = parseInt(req.params.userID);
  User.findOne({id: u}).exec()
    .then((user) => {
      res.end(user.username.toString());
    })
    .catch((error) => {
      console.log("ERROR: Finding username from userID");
      res.end("ERROR: Finding Username")
    });
});

/**
 * Set user to ready
 */
app.get('/get/userID/:username', (req, res) => {
  let u = req.params.username;
  console.log("Username: " + u + " clicked Roll Dice.");
  User.findOne({username: u}).exec()
    .then((user) => {
      console.log("UserID: " + user.id);
      res.end(user.id.toString());
    })
    .catch((error) => {
      console.log("ERROR: Finding user obj using username");
      res.end("ERROR: Finding User ID")
    });
});

/**
 * Set user to ready
 */
app.get('/update/turn/:turnID', (req, res) => {
  let playersTurn = req.params.turnID;
  Turn.findOne({}).exec()
    .then(async (turn) => {
      turn.playerTurn = parseInt(playersTurn);
      await turn.save();
      res.end("success");
      let message = {
        'type': 'update turn'
      }
      clients.forEach((client) => {
        console.log("state: "+client.readyState);
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    })
    .catch((error) => {
      console.log("ERROR: Updating turn");
      res.end("ERROR: Updating turn");
    });
});

// /**
//  * Set user to ready
//  */
// app.get('/getPlayers', (req, res) => {
//   User.find({}).exec()
//   .then((results) => {res.end(JSON.stringify(results));})
//   .catch((err) => {console.log("Cant get users list");})
// });

/**
 * get card object using cardID
 */
app.get('/get/property/:cardID', (req, res) => {
  console.log("enter get prop");
  const cardID = parseInt(req.params.cardID);
  Card.findOne({id: cardID}).exec()
    .then((card) => {
      if (card) {
        res.end(JSON.stringify(card));
      } else {
        res.send("Couldnt find card");
      }
    })
    .catch((error) => { 
      res.send("Couldnt find card");
    });
});


/**
 * get card objects that belong to a given player
 */
app.get('/get/properties/:playerID', (req, res) => {
  console.log("sending player properties");
  const playerID = parseInt(req.params.playerID);
  let properties = [];
  let p1 = User.findOne({id:playerID}).exec();
  let total = 0;
  p1.then((result) => {
    let propertyIds = result.listOfCardsOwned;
    console.log(propertyIds);
    for(let i=0; i< propertyIds.length; i++){
      let p  = Card.findOne({id:propertyIds[i]}).exec();
      p.then((result) => {
        properties.push(result);
        total += 1; // counts the # of properties of a player
        if( total === propertyIds.length){
          res.end(  JSON.stringify(properties, undefined, 2) );
        }
      });

      p.catch((error) => {
        console.log(error);
          res.end('FAILED TO RETURN PLAYER PROPERTIES');
      });
    }
  });

  p1.catch((error) => {
    console.log(error);
    res.end('FAILED TO RETURN PLAYER PROPERTIES');
  });
});


async function getAllPlayers(){
  return User.find({}).exec()
  .then((results) => {
    return results;
  })
  .catch((error) => {
    console.log("could get players from mongodb");
    return null;
  });
}
/**
 * updates player obj and card obj with new balance, and updates listOfCardsOwned, and ownerID in Card obj
 */
app.get('/update/pac/:playerID/:newBalance/:cardID', async (req, res) => {
  console.log("enter update player and card");
  const playerID = parseInt(req.params.playerID);
  const newBalance = parseInt(req.params.newBalance);
  const cardID = parseInt(req.params.cardID);
  var cName;
  
  try {
    const card = await Card.findOne({id: cardID}).exec();
    if (card) {
      card['ownerID'] = playerID;
      await card.save();
      cName = card.name;
      let isMonopoly = true;
      await Promise.all(card.otherCardsInSet.map(async (cID) => {
        const card2 = await Card.findOne({id: cID}).exec();
        if (card2.id != card.id && card2.ownerID != card.ownerID) {
          isMonopoly = false;
        }
      }));

      if (isMonopoly){
        console.log("Bought a monopoly")
        await Promise.all(card.otherCardsInSet.map(async (cID) => {
          const card2 = await Card.findOne({id: cID}).exec();
          card2.hasSet = true;
          card2.save();
        }));

      } else{
        console.log("Not a monopoly");
        }
      console.log('Updated ownerID in Card');
      console.log('isMonopoly:', isMonopoly); // log isMonopoly after the loop is done
    } else {
      console.log("Couldn't set ownerID in card");
    }}
    catch (err) {
      console.log("Couldn't set ownerID in card");
      res.send("Couldn't update card or user");
    }

    User.findOne({id: playerID}).exec()
    .then(async (user) => {
      if (user){
        if (!user['listOfCardsOwned'].includes(cardID)){
          user['balance'] = newBalance;  // change balance
          user['listOfCardsOwned'].push(cardID);  // add cardID to list of cards owned
          
          await user.save();
          console.log("Saved user balance and list of cards owned")
          res.send('Updated user balance and list of cards owned');
          let players = await getAllPlayers();
          let message = {
            'type':'update balances and owned cards',
            'players':players,
            'log': `${user.username} bought ${cName}!`
          }
          
          clients.forEach((client) => {
            console.log("state: "+client.readyState);
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(message));
            }
          });
          
        }
      }
    })
  .catch((err) => {
    console.log("Couldnt update user balance and list of cards owned")
    res.send("Couldnt update User");
  })
});

/**
 * 
 */
app.get('/update/balance/:to/:from/:rent', (req, res) => {
  const toID = parseInt(req.params.to);
  const fromID = parseInt(req.params.from);
  const rent = parseInt(req.params.rent)

  User.findOne({id: toID}).exec()
  .then(async (user) => {
    user['balance'] = user.balance + rent;
    await user.save();
    User.findOne({id: fromID}).exec()
    .then(async (user2)=> {
      user2['balance'] = user2.balance - rent;
      await user2.save();
      let players =  await getAllPlayers();
      let message = {
        'type':'update balance rent paid',
        'players':players,
        'log': `${user2.username} paid ${user.username} $${rent} in rent.`
      }
      clients.forEach((client) => {
        console.log("state: "+client.readyState);
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    })
    .catch((error) => {console.log('cant pay rent to owner in server')})
  })
  .catch((error) => {
    res.end("ERROR: get card using index")
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
 * Sends usercolor back to the client
 */
app.get('/update/balance/go/:userID', (req, res) => {
  let u = req.params.userID;
  User.findOne({id: u}).exec()
  .then(async (user) => {
    user['balance'] = user['balance'] + 200
    await user.save()

    let players = await getAllPlayers();
      let message = {
        'type':'update balance go',
        'players':players,
        'log': `${user.username} passed Go!`
      }

    clients.forEach((client) => {
      console.log("state: "+client.readyState);
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  })
  .catch((error) => {
    res.end("ERROR: adding money from passing go")
  });
});


//  Sends a list of players to the clients
app.get('/get/players', (req, res) => {
  // console.log('Sending all players');
  let p1 = User.find({}).exec()
  p1.then( (results) => { 
    res.end( JSON.stringify(results, undefined, 2) );
  });
  p1.catch( (error) => {
    // console.log(error);
    res.end('FAIL');
  });
});

app.get('/get/turn/', (req, res) => {
  Turn.findOne().exec()
    .then((turn) => {
      if (turn) {
        res.end(JSON.stringify(turn.playerTurn));
      } else {
        res.status(404).json({ error: 'No turn found' });
      }
    })
    .catch((error) => { 
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    });
});


//  updates player data based on local changes
app.post('/update/turn', (req, res) => {
  console.log('updating turn data in the db');
  // console.log(req.body);
  var pTurn = req.body;
  t.playerTurn = pTurn.turn;
  t.save();
  res.end('Updated Player Turn')
  
// inform all other clients about turn update
  
});

app.get('/update/location/:userID/:location', async (req, res) => {
  console.log("enter update location");
  const userID = parseInt(req.params.userID);
  const location = parseInt(req.params.location);
  User.findOne({id: userID}).exec()
    .then(async (user) => {
      if (user) {
        user.position = location;
        await user.save();
        console.log("user after updating location " + user)
        let players = await getAllPlayers();
        let message = {
        'type':'update location after dice roll',
        'players':players
      }
        clients.forEach((client) => {
          console.log("sending update location");
          if (client.readyState === WebSocket.OPEN) {
            console.log("PlayerList :" + message.players)
            client.send(JSON.stringify(message));
          }
        });
        res.send("Successfully updated player location.");
      }
    })
    .then((val) => {})
    .catch((error) => { 
      res.send("Couldnt update player location");
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
  // console.log("Saving a new user")
  let newUserToSave = req.body;
  let userData = null;
  userData = newUserToSave;

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
        balance: 1500,
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
          foundUser['balance'] = 1500;
          foundUser['position'] = 0;
          foundUser['listOfCardsOwned'] = [];
          foundUser.save();
          // delete all documents from the 'User' collection
          Card.deleteMany({})
          .then(() => {
            console.log('Deleted all cards');
            createAllCards();
          })
          .catch((err) => console.log('Error deleting cards:', err));
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

function createAllCards(){
  console.log('Recreating all the cards');
  let cardData = [
    [0,0,0,[],null, null],  // cardID, price, base rent, cards in set,
    [1,60,2,[1,2],"Medi", 'brown'],
    [2,60,4,[1,2],"Baltic",'brown'],
    [3,0,0,[],null,null],
    [4,200,50,[4,12,20,28],"Read RR","black"],
    [5,100,6,[5,6,7],"Oriental", "lightblue"],
    [6,100,6,[5,6,7],"Vermont", "lightblue"],
    [7,120,8,[5,6,7],"Conn", "lightblue"],
    [8,0,0,[],null,null],
    [9,140,10,[9,10,11],"Charles", "purple"],
    [10,140,10,[9,10,11],"States", "purple"],
    [11,160,12,[9,10,11],"Virginia", "purple"],
    [12,200,50,[4,12,20,28],"Penn RR","black"],
    [13,180,14,[13,14,15],"James", "orange"],
    [14,180,14,[13,14,15],"Tenn", "orange"],
    [15,200,16,[13,14,15],"New York", "orange"],
    [16,0,0,[],null,null],
    [17,220,18,[17,18,19],"Kent", "red"],
    [18,220,18,[17,18,19],"Indiana", "red"],
    [19,240,20,[17,18,19],"Ill", "red"],
    [20,200,50,[4,12,20,28],"B&O RR","black"],
    [21,260,22,[21,22,23],"Atl", "yellow"],
    [22,260,22,[21,22,23],"Vent", "yellow"],
    [23,280,24,[21,22,23],"Marvin", "yellow"],
    [24,0,0,[],null,null],
    [25,300,26,[25,26,27],"Pac", "green"],
    [26,300,26,[25,26,27],"North", "green"],
    [27,320,28,[25,26,27],"Penns", "green"],
    [28,200,50,[4,12,20,28],"Short RR","black"],
    [29,350,35,[29,31],"Park P", "blue"],
    [30,0,0,[],null,null],
    [31,400,50,[29,31],"Board", "blue"]
  ]
  for(let i=0; i<cardData.length; i++ ){
    let c = new Card({
      id: cardData[i][0],
      color: cardData[i][5],
      name: cardData[i][4],
      price: cardData[i][1],
      isPurchased: null,
      ownerID: null,    // id val of User Object
      hasSet: null,    // if owner purchased the all the cards in the set
      rent: cardData[i][2],
      visitors: [], // list of User id values currently on the card
      otherCardsInSet: cardData[i][3],  // id vals of other Cards in set
      numberOfHouses: null, 
      houseRentMultiplier: null
    });

    c.save();
  }

}

// delete all documents from the 'User' collection
Card.deleteMany({})
.then(() => {
  console.log('Deleted all cards');
  createAllCards();
})
.catch((err) => console.log('Error deleting cards:', err));














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