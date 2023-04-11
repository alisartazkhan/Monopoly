



const express = require('express');
const app = express();
app.use(express.json());
const port = 3000;
app.use(express.static('public_html'));
app.listen(port, () =>
console.log(`App listening at http://localhost:${port}`));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));




const mongoose = require('mongoose');

const { receiveMessageOnPort } = require('worker_threads');
const connection_string = 'mongodb://127.0.0.1/finalproject1';

mongoose.connect(connection_string, { useNewUrlParser: true });
mongoose.connection.on('error', () =>{
  console.log("There was a problem connecting to MongoDB.");
});



var SpaceSchema = new mongoose.Schema( 
  { name: String,
    //owned: Boolean,
    //owner: String,
    cost: Number,
    //visitors: [Number] 
})

const Space = mongoose.model('Space', SpaceSchema);


Space.deleteMany({})
  .then(() => console.log('All documents removed from collection'))
  .catch(err => console.error(err));


app.post("/add/space/", (req,res) => {
    //console.log("hi")
    console.log(req.body)
    var testItem1 = new Space( { 
      name: req.body.name,
      cost: req.body.cost,});
    let p = testItem1.save();
    // User.updateOne({username: req.params.username},  {$push: {listings: testItem1}}).exec();
    //console.log(User.findOne({ username: 'd' }).exec());
})