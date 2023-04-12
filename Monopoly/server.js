const express = require('express');
const app = express();
app.use(express.json());
const port = 3000;
app.use(express.static('C:/Users/17023/Documents/GitHub/Monopoly/Monopoly/public_html', (req, res, next) => {
    console.log(`Serving static files from ${req.baseUrl}`);
    next();
  }));
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
  { id: Number,
    name: String,
    //owned: Boolean,
    //owner: String,
    cost: Number,
    color: String,
    //visitors: [Number] 
})

const Space = mongoose.model('Space', SpaceSchema);


Space.deleteMany({})
  .then(() => console.log('All documents removed from collection'))
  .catch(err => console.error(err));


app.post("/add/space/create", (req,res) => {

    nameList = ["Go","NV Park","NV Rest","NV Villa","Jail","UT Park","UT Rest","UT Villa","Free",
    "CA Park", "CA Rest", "CA Villa", "Go to Jail","AZ Park","AZ Rest","AZ Villa"];
    colorList =["Grey","Blue","Blue","Blue","Grey","Red","Red","Red","Grey","Yellow","Yellow","Yellow","Grey"
    ,"Green","Green","Green"]
    costList = [0,100,100,120,0,120,120,140,0,200,200,220,0,250,250,300];

    for (var i = 0; i <= 15; i++) {
        var id = i.toString(10);
    //console.log("hi")
    console.log(req.body)
    var testItem1 = new Space( { 
      id: i,
      name: nameList[i],
      cost: costList[i],
      color: colorList[i]});
    let p = testItem1.save();
    // User.updateOne({username: req.params.username},  {$push: {listings: testItem1}}).exec();
    //console.log(User.findOne({ username: 'd' }).exec());
    }
})


app.get('/get/spaces/:id', (req, res) => {
  let p1 = Space.find({id:req.params.id}).exec();
    p1.then( (results) => {
      res.end(JSON.stringify(results));
      //console.log(resultString)
    });
    p1.catch( (error) => {
      console.log(error);
      res.end("FAIL")
    })
  });
