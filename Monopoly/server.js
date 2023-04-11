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



// database to store user data & game status

// this is the link to my mongodb cloud database
// it can run both remotely and locally
let connection = 'mongodb+srv://khyokubjonov:L5E5Imuo8EWo9rzf@khojiakbardb.pfv0hgx.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected...'))
    .catch((err) => console.log(err));
var Schema = mongoose.Schema;

// what collections do we need ???

// UserSchema
var UserSchema = new Schema({ 
    username: String,
    // password will be hashed when storing
    password: String, 
    // more attributes to be added
});
var User = mongoose.model("UserData", UserSchema);
app.listen(port, () => {
  console.log('Server has started.');
})



//  (POST) Should add a user to the database. The username and password should be sent as POST parameter(s).
app.post('/add/user/', (req, res) => {
    console.log("Saving a new user")
    let newUserToSave = req.body;
    console.log(req.url);
    console.log(req.body);
    let userData = null;
    try{
      userData = JSON.parse(newUserToSave);
    }catch (e){
      userData = newUserToSave;
    }
    let p3 = User.find({username: userData.username, 
                        password: userData.password}).exec();
    p3.then((results) => {
      console.log(results);
      if(results.length ==0){
        let salt = generateSalt();
        let secureHash = '$' + salt+ '$' + cryptoHash(userData.password, salt)
        let newUser = new User({username:userData.username, 
                                password: secureHash });
        let p1 = newUser.save();
        p1.then( (doc) => { 
          res.end('SAVED SUCCESSFULLY');
        });
        p1.catch( (err) => { 
          console.log(err);
          res.end('FAIL');
        });
      }else{
        res.end("Invalid credentials");
      }
    })
  })
// authenticates the user login 
app.get('/account/login/:USERNAME/:PASSWORD', (req, res) => {
    console.log("validating login"); 
    let u = req.params.USERNAME;
    let p = req.params.PASSWORD;
    console.log(u + ' ' + p);
    console.log(req.body);
    const regex = /^\$([A-Za-z0-9]+)\$/;
    let p1 = User.find({username: u}).exec();
    p1.then((results => {
      if(results.length >0){
        let authenticated = false;
        results.forEach((foundUser) => {
        const storedPassword = foundUser.password;
        const salt = storedPassword.match(regex)[1]; // extract the salt from the stored password
        console.log(salt);
        const hashedPassword = cryptoHash(p, salt); // hash the salted password
        const storedPasswordWithoutSalt = storedPassword.replace(regex, ''); // remove the salt from the stored password
        if (hashedPassword === storedPasswordWithoutSalt) {
          authenticated = true;
        }
      });
      if (authenticated) {
        // user authenticated
        // res.redirect('/waiting_room.html');
        res.end('SUCCESS')
      } else {
        // invalid password
        res.end('LOGIN FAILED DUE TO INCORRECT PASSWORD');
      }
        
      }else{
        res.end('LOGIN FAILED');
      }
    }))
  });


/**
 * hashes a given string using MD5
 * @param {*} string 
 * @returns new string that resulted from hashing
 */
function cryptoHash(string, salt){
  const hash = crypto.createHash('md5').update(salt + string).digest('hex');
  return hash;
}

/**
 * 
 * @returns generates a salt for user password
 */
function generateSalt(){
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
