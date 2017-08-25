// RESTfull API NATIONAL DEFENSE INFORMATION GRID (NDIG)
// GopaL - 2016

// BASE SETUP
// =============================================================================
var express     = require('express');        // call express
var app         = express();                 // define our app using express
var bodyParser  = require('body-parser');
var Pesan       = require('./app/models/pesan');
var Twitter     = require('./app/models/twitter');
var Roles       = require('./app/models/roles');

var AnalysedInfo= require('./app/models/analysedinfo');
var summ        = require('./summary.js')(AnalysedInfo);
var util        = require('./util.js');
// var News     = require('./app/models/news');
// var Webpage  = require('./app/models/crawl_webpage');
var CryptoJS = require('crypto-js'); 

var mongoose    = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/pesanIntelDB'); // connect to our database
mongoose.connect('mongodb://localhost:27017/dias'); // connect to our database
// mongoose.connect('mongodb://192.168.1.8:27017/skmchatbot_message'); // connect to our database

// add package untuk sistem autentikasi njwt
var uuidV4      = require('uuid/v4');
var nJwt        = require('njwt');
var morgan      = require('morgan');
var cors        = require('cors');
var generateKey = uuidV4();
var User        = require('./app/models/user');
var signingKey  = generateKey;   

// configure app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure app to use morgan and cors
app.use(morgan('dev'));
app.use(cors());

// configure app to use cors
var corsOptions = {
   origin : "http://localhost:9000",
   allowedHeaders : ["*"],
   exposedHeaders : ["x-new-jwt"]
};

// add header
// app.all('/*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });
app.all('/*',cors(corsOptions));

// GLOBAL VARIABEL
var port = process.env.PORT || 9099;        // set our port
var START, END;
var encryptpass = 'NDIG-DIAS';
var MODE_DEVELOP = false;

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {    
    if(req.path !== ('/authenticate')) {
        if (MODE_DEVELOP === true) {
            var split = req.headers.token.split(' ');
            var token = split[1];
            if (token) {
                nJwt.verify(token, signingKey, function(err,verifiedJwt) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        req.body.roleId = verifiedJwt.body.role;
                        if (verifiedJwt.body.exp > Math.floor(Date.now()/1000)){
                            if ((verifiedJwt.body.exp-Math.floor(Date.now()/1000)) <= 60*60*2) {
                                var newToken = getToken(verifiedJwt.body, signingKey);
                                res.header({ 'x-new-jwt' : newToken });
                            }
                                next()
                        } else {
                            res.status(401).send(verifiedJwt);
                        }
                    }
                });
            } else {
                res.status(401).send('Error Token');
            }
            // next() // make sure we go to the next routes and don't stop here
        } else {
            var bytes = CryptoJS.AES.decrypt(req.url.substr(1), encryptpass);
            var decryptURI = bytes.toString(CryptoJS.enc.Utf8);
            var split = decryptURI.substr(1).slice(0, -1).split('?token=');
            var token = split[1];
            if(token) {
                nJwt.verify(token, signingKey, function(err, verifiedJwt) {
                    req.body.roleId = verifiedJwt.body.role
                    if (err) {
                        res.status(401).send(err);
                    } else {
                        if (verifiedJwt.body.exp > Math.floor(Date.now()/1000)){
                            if ((verifiedJwt.body.exp-Math.floor(Date.now()/1000)) <= 60*60*2) {
                                var newToken = getToken(verifiedJwt.body, signingKey);
                                res.header({ 'x-new-jwt' : newToken });
                            }
                                req.url = split[0].substr(4);
                                req.originalUrl = split[0];
                                req.verifiedJwt = verifiedJwt;
                                next();
                        } else {
                            res.status(401).send(verifiedJwt);
                        }
                        
                    }
                })
            } else {
                return res.status(403).send({ 
                success: false, 
                message: 'No token provided.'
                }); 
            }       
        }
    } else {
        next();
    }
    // do logging
    console.log('---Something is happening---', req.params);
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'heeloww! welcome to our api!' });   
});

// ROUTING NDIG START HERE
// =============================================================================

// -----------------------PESANS-----------------------------
// -----------------------PESANS-----------------------------
// -----------------------PESANS-----------------------------
// -----------------------PESANS-----------------------------

// A. mengakses semua pesan dan menyimpan pesan 
router.route('/rawpesans')

// A1. menyimpan pesan k DB
    .post(function(req, res) {        
        var pesan = new Pesan();      // create a new instance of the Pesan model
        pesan.dari      = req.body.dari;  // ngisi param
        pesan.type      = req.body.type;
        pesan.date      = req.body.date;
        pesan.category  = req.body.category;
        pesan.laporan   = req.body.pesan;

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
            // Encrypt
            res.json({ data: encryptData(pesans, encryptpass), secta: true });
        });
    });


// -------------------------------------------------------------------
// B. mengakses pesan intel tertentu:
// B1. berdasarkan pengirim
router.route('/rawpesans/dari/:nama')
    .get(function(req, res) {
        Pesan.find({ 'dari': {$regex:req.params.nama, $options: 'i'}}, function (err, pesan) {
            if (err) 
                res.send(err);
            // Encrypt
            res.json({ data: encryptData(pesan, encryptpass), secta: true });
        });
    })

// B2. berdasarkan type
router.route('/rawpesans/type/:tipe')
    .get(function(req, res) {
        Pesan.find({ 'type': req.params.tipe}, function (err, pesan) {
            if (err)
                res.send(err);
            // Encrypt
            res.json({ data: encryptData(pesan, encryptpass), secta: true });
        });
    })

// B3. berdasarkan id tertentu
router.route('/rawpesans/:pesan_id')
    .get(function(req, res) {
        Pesan.findById(req.params.pesan_id, function(err, pesan) {
            if (err) 
                res.send(err);
            // Encrypt
            res.json({ data: encryptData(pesan, encryptpass), secta: true });
        });
    })

   .put(function(req, res) {
        Pesan.findById(req.params.pesan_id, function(err, pesan) {
            if (err)
                res.send(err);

            // update the pesan 
            pesan.dari      = pesan.dari;  // ngisi param
            pesan.type      = pesan.type;
            pesan.date      = pesan.date;
            pesan.category  = pesan.category;
            pesan.laporan   = pesan.laporan;
            pesan.lokasi    = req.body.lokasi;

            // var pesan = new Pesan();      // create a new instance of the Pesan model
            // pesan.dari      = req.body.dari;  // ngisi param
            // pesan.type      = req.body.type;
            // pesan.date      = req.body.date;
            // pesan.category  = req.body.category;
            // pesan.laporan   = req.body.pesan;


            // save the pesan
            pesan.save(function(err) {
                if (err)
                    res.send(err);
                res.json({ message: 'Pesan updated!' });
            });
        });
    })


// B4. berdasarkan date tertentu
// router.route('/rawpesans/:st/:fn')
//     .get(function(req, res) {
//         START = new Date(req.params.st);
//         END = new Date(req.params.fn);
//         END.setDate(END.getDate() + 1);
//         Pesan.find({'date': {$gt: START, $lte: END}}, function(err, pesan) {
//             if (err)
//                 res.send(err);
//             res.json(pesan);
//         });
//     })

// B4.5 berdasarkan filter param date
router.route('/rawpesans/filter/:paramwaktu')
    .get(function(req, res) {
        var nPrev;
        if (req.params.paramwaktu == "lastday"){nPrev=1};
        if (req.params.paramwaktu == "lastweek"){nPrev=7};
        if (req.params.paramwaktu == "lastmonth"){nPrev=30};
        if (req.params.paramwaktu == "lastyear"){nPrev=365};
        var thePrevDate = util.getNPrevDate(nPrev);
        
        Pesan.find({'date': {$gte: thePrevDate}}, function(err, pesan) {
            if (err) 
                res.send(err);
            // Encrypt
            res.json({ data: encryptData(pesan, encryptpass), secta: true });
        });
    })

// B5. berdasarkan isi pesan (ANALISIS ISI PESAN INTEL)
router.route('/rawpesans/isi/:pesan')
    .get(function(req, res) {
        Pesan.find({ 'pesan': {$regex:req.params.pesan, $options: 'i'}}, function (err, pesan) {
            if (err)
                res.send(err);
            // Encrypt
            res.json({ data: encryptData(pesan, encryptpass), secta: true });
        });
    })


// -------------------------------------------------------------------
// C. update (put) pesan intel dgn id tertentu:
// router.route('/rawpesans/put/:pesan_id')
//    .put(function(req, res) {

//         // use our bear model to find the bear we want
//         Pesan.findById(req.params.pesan_id, function(err, pesan) {
//             if (err)
//                 res.send(err);

//             // update the pesan 
//             pesan.dari      = req.body.dari;  
//             pesan.type      = req.body.type;
//             pesan.penerima  = req.body.penerima;
//             pesan.date      = req.body.date;
//             pesan.pesan     = req.body.pesan;

//             // save the pesan
//             pesan.save(function(err) {
//                 if (err)
//                     res.send(err);
//                 res.json({ message: 'Pesan updated!' });
//             });
//         });
//     })

// -------------------------------------------------------------------
// D. delete pesan intel dgn id tertentu
// router.route('/rawpesans/delete/:pesan_id')
//     .delete(function(req, res) {
//         Pesan.remove({_id: req.params.pesan_id}, function(err, pesan) {
//             if (err)
//                 res.send(err);
//             res.json({ message: 'Pesan '+pesan+' successfully deleted' });
//         });
//     });




// -----------------------TWITTER-----------------------------
// -----------------------TWITTER-----------------------------
// -----------------------TWITTER-----------------------------
// -----------------------TWITTER-----------------------------
// mengakses semua twitter dan menyimpan twitter
router.route('/rawtwitters')
   .post(function(req, res) {        
        var twitter = new Twitter();      // create a new instance of the Pesan model
        twitter.user        = req.body.user;  // ngisi param
        twitter.location    = req.body.location;
        twitter.geolocation = req.body.geolocation;
        twitter.date        = req.body.date;
        twitter.tweet       = req.body.tweet;

        // save the pesan and check for errors
        twitter.save(function(err, twit) {
            if (err)
                res.send(err);
            res.json({ message: 'tweet '+twit+' berhasil digenerate!' });
        });
    })

    .get(function(req, res) {
        Twitter.find(function(err, twit) {
            if (err)
                res.send(err);
            // Encrypt
            res.json({ data: encryptData(twit, encryptpass), secta: true });
        });
    });




// // -------------------------------------------------------------------
// // B. mengakses pesan Twitter tertentu:
// // B1. berdasarkan pengirim
// router.route('/twitters/user/:nama')
//     .get(function(req, res) {
//         Twitter.find({ 'user': {$regex:req.params.nama, $options: 'i'}}, function (err, twitter) {
//             if (err)
//                 res.send(err);
//             res.json(twitter);
//         });
//     })

// // B2. berdasarkan lokasi
// router.route('/twitters/location/:loc')
//     .get(function(req, res) {
//         Twitter.find({ 'location': {$regex:req.params.loc, $options: 'i'}}, function (err, twitter) {
//             if (err)
//                 res.send(err);
//             res.json(twitter);
//         });
//     })

// // B3. berdasarkan id tertentu
// router.route('/twitters/:pesan_id')
//     .get(function(req, res) {
//         Twitter.findById(req.params.pesan_id, function(err, twitter) {
//             if (err)
//                 res.send(err);
//             res.json(twitter);
//         });
//     })

// // B4. berdasarkan isi tweet
// router.route('/twitters/isi/:kata')
//     .get(function(req, res) {
//         Twitter.find({ 'tweet': {$regex:req.params.kata, $options: 'i'}}, function (err, twitter) {
//             if (err)
//                 res.send(err);
//             res.json(twitter);
//         });
//     })



// -----------------------ANALYSED INFO-----------------------------
// -----------------------ANALYSED INFO-----------------------------
// -----------------------ANALYSED INFO-----------------------------
// -----------------------ANALYSED INFO-----------------------------


// A1. mengakses semua analysed info (hasil analisa dias)
router.route('/analysedinfo')
    .get(function(req, res) {
        // var intel = new Intel();      // create a new instance of the Intel model
        AnalysedInfo.find(function(err, news) {
            if (err)
                res.send(err);
            // Encrypt
            res.json({ data: encryptData(news, encryptpass), secta: true });
        });
    });


// A2. DASHBOARD - FILTER - SOURCE 
// paramsource = [all, news, twitter, intel]
// paramwaktu = [lastday, lastweek, lastmonth, lastyear]
router.route('/analysedinfo/filter/:paramwaktu/source/:paramsource')
    .get(function(req, res) {
        var nPrev;
        if (req.params.paramwaktu == "lastday"){nPrev=1};
        if (req.params.paramwaktu == "lastweek"){nPrev=7};
        if (req.params.paramwaktu == "lastmonth"){nPrev=30};
        if (req.params.paramwaktu == "lastyear"){nPrev=365};
        var thePrevDate = util.getNPrevDate(nPrev);
        
        if (req.params.paramsource == "all"){
            AnalysedInfo.find({'eventDateDate': {$gte: thePrevDate}}, function (err, info) {
                if (err)
                    res.send(err);
                // Encrypt
                res.json({ data: encryptData(info, encryptpass), secta: true });
            });
        } 
        else {
            AnalysedInfo.find({
                $and: [
                      {'dataSource': req.params.paramsource},
                      {'eventDateDate': {$gte: thePrevDate}} //sama dengan date.month bulan ini
                ]
            }, function (err, info) {
                if (err)
                    res.send(err);
                // Encrypt
                res.json({ data: encryptData(info, encryptpass), secta: true });
            });
        }
    });


// A3. CATEGORY - FILTER - SOURCE 
// paramCat = lihat documentCategories.json
// paramLev = [low, med, high]

// router.route('/analysedinfo/category/:paramcat')
//     .get(function(req, res) {
//         AnalysedInfo.find({ 'categoryMain': req.params.paramcat}, function (err, info) {
//             if (err)
//                 res.send(err);
//             res.json(info);
//         });
//     });

router.route('/analysedinfo/category/:paramcat/filter/:paramwaktu/source/:paramsource')
    .get(function(req, res) {
        var nPrev;
        if (req.params.paramwaktu == "lastday"){nPrev=1};
        if (req.params.paramwaktu == "lastweek"){nPrev=7};
        if (req.params.paramwaktu == "lastmonth"){nPrev=30};
        if (req.params.paramwaktu == "lastyear"){nPrev=365};
        var thePrevDate = util.getNPrevDate(nPrev);
        
        if (req.params.paramsource == "all"){
            AnalysedInfo.find({
                $and: [
                      {'categoryMain': req.params.paramcat},
                      {'eventDateDate': {$gte: thePrevDate}} //sama dengan date.month bulan ini
                ]
            }, function (err, info) {
                if (err)
                    res.send(err);
                // Encrypt
                res.json({ data: encryptData(info, encryptpass), secta: true });
            });
        } 
        else {
            AnalysedInfo.find({
                $and: [
                      {'categoryMain': req.params.paramcat},
                      {'dataSource': req.params.paramsource},
                      {'eventDateDate': {$gte: thePrevDate}} //sama dengan date.month bulan ini
                ]
            }, function (err, info) {
                if (err)
                    res.send(err);
                // Encrypt
                res.json({ data: encryptData(info, encryptpass), secta: true });
            });
        }
    });


// A4. THREATLEVEL - FILTER - SOURCE 
// paramCat = lihat documentCategories.json
// paramLev = [low, med, high]

// router.route('/analysedinfo/threatlevel/:paramlev')
//     .get(function(req, res) {
//         AnalysedInfo.find({ 'threatWarning': req.params.paramlev}, function (err, info) {
//             if (err)
//                 res.send(err);
//             res.json(info);
//         });
//     });

router.route('/analysedinfo/threatlevel/:paramlev/filter/:paramwaktu/source/:paramsource')
    .get(function(req, res) {
        var nPrev;
        if (req.params.paramwaktu == "lastday"){nPrev=1};
        if (req.params.paramwaktu == "lastweek"){nPrev=7};
        if (req.params.paramwaktu == "lastmonth"){nPrev=30};
        if (req.params.paramwaktu == "lastyear"){nPrev=365};
        var thePrevDate = util.getNPrevDate(nPrev);
        
        if (req.params.paramsource == "all"){
            AnalysedInfo.find({
                $and: [
                      {'threatWarning': req.params.paramlev},
                      {'eventDateDate': {$gte: thePrevDate}} //sama dengan date.month bulan ini
                ]
            }, function (err, info) {
                if (err)
                    res.send(err);
                // Encrypt
                res.json({ data: encryptData(info, encryptpass), secta: true });
            });
        } 
        else {
            AnalysedInfo.find({
                $and: [
                      {'threatWarning': req.params.paramlev},
                      {'dataSource': req.params.paramsource},
                      {'eventDateDate': {$gte: thePrevDate}} //sama dengan date.month bulan ini
                ]
            }, function (err, info) {
                if (err)
                    res.send(err);
                // Encrypt
                res.json({ data: encryptData(info, encryptpass), secta: true });
            });
        }
    });



// -----------------------SUMMARY-----------------------------
// -----------------------SUMMARY-----------------------------
// -----------------------SUMMARY-----------------------------
// -----------------------SUMMARY-----------------------------


// mengakses summari analysed info tiap provinsi
router.route('/threatsummary')
    .get(function(req, res) {
        console.log("Accessing /threatsummary");
        summ.getProvinceSummary(function(summary) {
            // Encrypt
            res.json({ data: encryptData(summary, encryptpass), secta: true });
        });
    });

// mengakses summari category dari analysed info tiap provinsi
router.route('/categorysummary')
    .get(function(req, res) {
        console.log("Accessing /categorysummary");
        summ.getCategorySummary(function(summary) {
            // Encrypt
            res.json({ data: encryptData(summary, encryptpass), secta: true });
        });
    });



// -----------------------PIECHART-----------------------------
// -----------------------PIECHART-----------------------------
// -----------------------PIECHART-----------------------------
// -----------------------PIECHART-----------------------------


// PIECHART - FILTER - SOURCE 
// paramwaktu = [lastday, lastweek, lastmonth, lastyear]
// paramsource = [all, news, twitter, intel]
router.route('/piechart/filter/:paramwaktu/source/:paramsource')
    .get(function(req, res) {
        console.log("Accessing /piechart with filter " + req.params.paramwaktu + " and source " + req.params.paramsource); 
        summ.getPiechartSummary(function(summary) {
            // Encrypt
            res.json({ data: encryptData(summary, encryptpass), secta: true });
        }, req.params.paramwaktu, req.params.paramsource);
    });


// PIECHART - CATEGORY - FILTER - SOURCE 
// paramCat = lihat documentCategories.json
// paramsource = [all, news, twitter, intel]
router.route('/piechart/category/:paramcat/filter/:paramwaktu/source/:paramsource')
    .get(function(req, res) {
        console.log("Accessing /piechart with category " + req.params.paramcat + " and filter " + req.params.paramwaktu + " and source " + req.params.paramsource); 
        summ.getPiechartCategorySummary(function(summary) {
            // Encrypt
            res.json({ data: encryptData(summary, encryptpass), secta: true });
        }, req.params.paramcat, req.params.paramwaktu, req.params.paramsource);
    });


// PIECHART - THREATLEVEL - FILTER - SOURCE 
// paramLev = [low, med, high]
// paramwaktu = [lastday, lastweek, lastmonth, lastyear]
// paramsource = [all, news, twitter, intel]
router.route('/piechart/threatlevel/:paramlev/filter/:paramwaktu/source/:paramsource')
    .get(function(req, res) {
        console.log("Accessing /piechart with threat level " + req.params.paramlev + " and filter " + req.params.paramwaktu + " and source " + req.params.paramsource); 
        summ.getPiechartThreatSummary(function(summary) {
            // Encrypt
            res.json({ data: encryptData(summary, encryptpass), secta: true });
        }, req.params.paramlev, req.params.paramwaktu, req.params.paramsource);
    });



// -----------------------LINECHART-----------------------------
// -----------------------LINECHART-----------------------------
// -----------------------LINECHART-----------------------------
// -----------------------LINECHART-----------------------------


// LINECHART - FILTER - SOURCE 
// paramsource = [all, news, twitter, intel]
// paramwaktu = [lastday, lastweek, lastmonth, lastyear]
router.route('/linechart/filter/:paramwaktu/source/:paramsource')
    .get(function(req, res) {
        console.log("Accessing /linechart with filter " + req.params.paramwaktu + " and source " + req.params.paramsource); 
        summ.getLinechartSummary(function(summary) {
            // Encrypt
            res.json({ data: encryptData(summary, encryptpass), secta: true });
        }, req.params.paramwaktu, req.params.paramsource);
    });


// LINECHART - CATEGORY - FILTER - SOURCE 
// paramCat = lihat documentCategories.json
// paramsource = [all, news, twitter, intel]
router.route('/linechart/category/:paramcat/filter/:paramwaktu/source/:paramsource')
    .get(function(req, res) {
        console.log("Accessing /linechart with category " + req.params.paramcat + " and filter " + req.params.paramwaktu + " and source " + req.params.paramsource); 
        summ.getLinechartCategorySummary(function(summary) {
            // Encrypt
            res.json({ data: encryptData(summary, encryptpass), secta: true });
        }, req.params.paramcat, req.params.paramwaktu, req.params.paramsource);
    });


// LINECHART - THREATLEVEL - FILTER - SOURCE 
// paramLev = [low, med, high]
// paramwaktu = [lastday, lastweek, lastmonth, lastyear]
// paramsource = [all, news, twitter, intel]
router.route('/linechart/threatlevel/:paramlev/filter/:paramwaktu/source/:paramsource')
    .get(function(req, res) {
        console.log("Accessing /linechart with threat level " + req.params.paramlev + " and filter " + req.params.paramwaktu + " and source " + req.params.paramsource); 
        summ.getLinechartThreatSummary(function(summary) {
            // Encrypt
            res.json({ data: encryptData(summary, encryptpass), secta: true });
        }, req.params.paramlev, req.params.paramwaktu, req.params.paramsource);
    });


// -----------------------USER AUTHENTICATION-----------------------------
// -----------------------USER AUTHENTICATION-----------------------------
// -----------------------USER AUTHENTICATION-----------------------------
// -----------------------USER AUTHENTICATION-----------------------------
router.route('/usermanagement/signup')
    // Router Signup
    .post(function(req, res) {
    //if (port === corsOptions.port){
        if(!req.body.username || !req.body.password || !req.body.role){
            res.status(209)
                .send('Please insert the user data!');
        } else {
            var newUser = new User({
                username: req.body.username,
                password: req.body.password,
                role: req.body.role
            });

            newUser.save(function(err, newUser){
                if(err){
                    return res.status(409)
                        .send('Username already exists!')
                }
                res.send(newUser.username + ' created!')
            });
        }
    //} else {
    //    res.status(403).send('This is CORS-enabled for only http://localhost:' + corsOptions.port);
    //}
    });

// Router get data user dari mongoDB
router.route('/usermanagement/account-data')
    .get(function(req, res) {
        var roleId = req.body.roleId;
        Roles.findById(roleId, function(err, role){
            if (err) {
                res.status(404).send(err);
            } else {
                if(role.viewUserManage === true) {
                    // Encrypt
                    User.find({}, function(err, users) {
                        if (err) {
                            res.status(404).send(err);
                        } else {
                            res.json ({ data: encryptData(users, encryptpass), secta: true });
                        }
                    })
                } else {
                    res.status(403).send('YOU ARE FORBIDDEN!');
                }
            }
        })
    });

// Router update data user
router.route('/usermanagement/update/:id')
    .get(function(req, res){
        User.findById(req.params.id, function(err,user){
            if(err){
                res.status(404).send(err);
            } else {
                res.send(user);
            }
        })
    })
    
    .put(function(req, res) {
        User.findById(req.params.id, function(err, user){
            if (err) {
                res.status(404).send(err);
            } else {
                if(!req.body.username || !req.body.role || !req.body.password ) {
                    res.status(209)
                    .send('Please insert the user data!');
                } else {
                    user.username = req.body.username;
                    user.password = req.body.password;
                    user.role = req.body.role;

                    user.save(function(err, user){
                        if(err){
                            return err;
                        }
                        res.send('Succesfully updated');
                    });
                }
            }
        })
    })

// Router Delete user
router.route('/usermanagement/delete/:id')
        .delete(function(req, res){
        User.findByIdAndRemove(req.params.id, function(err,user){
            if(err){
                res.status(404).send(err);
            } else {
                res.json({
                    msg: 'Account ' + user.username + ' successfully deleted',
                    id: user.id
                });
            }
        })
    })

// Router Login    
router.post('/authenticate', function(req, res){
    User.findOne({
        username: req.body.username
    }, function(err, user){
        if(err) throw err;

        if(!user){
            res.status(404)
                .send('Authentication failed! Email not found');
        } else if(user){
            if(req.body.password === user.password) {
                    var token = getToken(user, signingKey);
                    res.json ({ token : token });
            } else {
                    res.status(404)
                        .send('Authentication failed! Wrong password');
            }
        }
    });
});

// function get token using njwt
function getToken(user, secretKey) {
    var claims = {
        iss: "NDIG-DIAS",
        sub: user.username,
        username: user.username,
        role: user.role,
        _id: user._id,
    };
    var jwt = nJwt.create(claims, secretKey);
    jwt.setExpiration(Date.now() + (60*60*10*1000)); //(second * minute * 1000) in milisecond
    var token = jwt.compact();
    return token;
}

// function encyrypt data
function encryptData(data, encryptpass) {
    if (MODE_DEVELOP === true) {
        return data;
    } else {
        var encryptData = CryptoJS.AES.encrypt(JSON.stringify(data), encryptpass);
        return encryptData.toString();
    }
}

// ----------------------------ROlE MANAGEMENT----------------------------------
// ----------------------------ROlE MANAGEMENT----------------------------------
// ----------------------------ROlE MANAGEMENT----------------------------------
// ----------------------------ROlE MANAGEMENT----------------------------------

router.post('/rolemanagement/create', function(req,res) {
        if(!req.body.rolename) {
            res.status(209)
                .send('Please Insert Data')
        } else {
            var newRole = new Roles({
                rolename: req.body.rolename,
                viewDashboard: req.body.viewDashboard,
                viewCategory: req.body.viewCategory,
                viewThreat: req.body.viewThreat,
                viewIntel: req.body.viewIntel,
                viewNews: req.body.viewNews,
                viewUserManage: req.body.viewUserManage,
                viewCRUD: req.body.viewCRUD
            });

            newRole.save(function(err, newRole) {
                if(err) {
                    return err;
                }
                res.send(newRole)
            });
        }
})

router.get('/rolemanagement/role-data', function(req, res) {
    var roleId = req.body.roleId
    Roles.findById(roleId, function(err, role){
        if (err) {
            res.status(404).send(err)
        } else {
            if(role.viewUserManage === true){
                Roles.find({}, function(err, roles){
                    if (err){
                        res.status(404).send(err);
                    } else {
                        // Encrypt    
                        res.json({ data: encryptData(roles, encryptpass), secta: true });
                    }
                })
            } else {
                res.status(403).send('YOU ARE FORBIDDEN!');
            }
        }
    })
})

router.route('/rolemanagement/update/:id')
    .get(function(req,res) {
            Roles.findById(req.params.id, function(err, roles){
                if(err){
                    res.status(404).send(err);
                } else {
                    res.send(roles);
                }
            })
    })

    .put(function(req, res) {
            Roles.findById(req.params.id, function(err, roles) {
                if(err) {
                    res.status(404).send(err);
                } else {
                    if(!req.body.rolename) {
                        res.status(209)
                        .send('Please insert the user data!');
                    } else {
                        roles.rolename = req.body.rolename,
                        roles.viewDashboard = req.body.viewDashboard,
                        roles.viewCategory = req.body.viewCategory,
                        roles.viewThreat = req.body.viewThreat,
                        roles.viewIntel = req.body.viewIntel,
                        roles.viewNews = req.body.viewNews,
                        roles.viewUserManage = req.body.viewUserManage,
                        roles.viewCRUD = req.body.viewCRUD
                        
                        roles.save(function(err, roles){
                            if(err){
                                return err;
                            }
                            res.send(roles.rolename + ' succesfully updated');
                        });
                    }
                }
            })
    })

router.delete('/rolemanagement/delete/:id', function(req, res) {
    var id_role = req.params.id;
        Roles.findById(id_role, function (err, role){
            if(role != '') {
                User.find({role: id_role}, function(err, user) {
                if(user != '') {           
                    res.status(400).send('Failed to delete this role');
                    } else {
                        role.remove();
                        res.send('Role ' + role.rolename + ' deleted');
                    }
                })
            } else {
                res.status(404).send('Role not found');
            }
        })
})

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
