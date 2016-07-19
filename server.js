// RESTfull API NATIONAL DEFENSE INFORMATION GRID (NDIG)
// GopaL - 2016

// BASE SETUP
// =============================================================================
var express     = require('express');        // call express
var app         = express();                 // define our app using express
var bodyParser  = require('body-parser');
var Bear        = require('./app/models/bear');
var Pesan       = require('./app/models/pesan');

var mongoose    = require('mongoose');
mongoose.connect('mongodb://localhost:27017/pesanIntelDB'); // connect to our database

// configure app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// add header
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

var port = process.env.PORT || 9064;        // set our port


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'heeloww! welcome to our api!' });   
});



// ROUTING NDIG START HERE
// =============================================================================

// -----------------------PESANS-----------------------------
// A. mengakses semua pesan dan menyimpan pesan 
router.route('/pesans')

// A1. menyimpan pesan k DB
    .post(function(req, res) {        
        var pesan = new Pesan();      // create a new instance of the Pesan model
        pesan.dari      = req.body.dari;  // ngisi param
        pesan.type      = req.body.type;
        pesan.penerima  = req.body.penerima;
        pesan.date      = req.body.date;
        pesan.pesan     = req.body.pesan;

        // save the pesan and check for errors
        pesan.save(function(err, pesan) {
            if (err)
                res.send(err);
            res.json({ message: 'pesan '+pesan+' berhasil digenerate!' });
        });
    })

// A2. mengakses semua pesan
    .get(function(req, res) {
        Pesan.find(function(err, pesans) {
            if (err)
                res.send(err);
            res.json(pesans);
        });
    });


// -------------------------------------------------------------------
// B. mengakses pesan intel tertentu:
// B1. berdasarkan pengirim
router.route('/pesans/dari/:nama')
    .get(function(req, res) {
        Pesan.find({ 'dari': req.params.nama}, function (err, pesan) {
            if (err)
                res.send(err);
            res.json(pesan);
        });
    })

// B2. berdasarkan type
router.route('/pesans/type/:tipe')
    .get(function(req, res) {
        Pesan.find({ 'type': req.params.tipe}, function (err, pesan) {
            if (err)
                res.send(err);
            res.json(pesan);
        });
    })

// B3. berdasarkan tujuan
router.route('/pesans/ke/:nama')
    .get(function(req, res) {
        Pesan.find({ 'penerima': req.params.nama}, function (err, pesan) {
            if (err)
                res.send(err);
            res.json(pesan);
        });
    })

// B4. berdasarkan id tertentu
router.route('/pesans/:pesan_id')
    .get(function(req, res) {
        Pesan.findById(req.params.pesan_id, function(err, pesan) {
            if (err)
                res.send(err);
            res.json(pesan);
        });
    })



// -------------------------------------------------------------------
// C. update (put) pesan intel dgn id tertentu:
router.route('/pesans/put/:pesan_id')
   .put(function(req, res) {

        // use our bear model to find the bear we want
        Pesan.findById(req.params.pesan_id, function(err, pesan) {
            if (err)
                res.send(err);

            // update the pesan 
            pesan.dari      = req.body.dari;  
            pesan.type      = req.body.type;
            pesan.penerima  = req.body.penerima;
            pesan.date      = req.body.date;
            pesan.pesan     = req.body.pesan;

            // save the pesan
            pesan.save(function(err) {
                if (err)
                    res.send(err);
                res.json({ message: 'Pesan updated!' });
            });
        });
    })


// -------------------------------------------------------------------
// D. delete pesan intel dgn id tertentu
router.route('/pesans/delete/:pesan_id')
    .delete(function(req, res) {
        Pesan.remove({_id: req.params.pesan_id}, function(err, pesan) {
            if (err)
                res.send(err);
            res.json({ message: 'Pesan '+pesan+' successfully deleted' });
        });
    });













// add more route from another table or database here

















// =============================================================================
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log(" ");
console.log("===========================================================");
console.log("initializing National Defense Information Grid API service");
console.log("gopal's magic happens on port " + port);