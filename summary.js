// analyses.js

module.exports = function(AnalysedNews){
	var async = require('async');
	var summArr = new Array();

	var kategori = require("./data/documentCategories.json");

	getProvinceSummary = function (fn){
		summArr.length = 0;
		// Ambil list kota
		AnalysedNews.distinct("eventDaerahTk1", function(err, provinces) {
			if (err)
				res.send(err);

			getEachProvSummary(provinces, fn);
		});
	}

	getEachProvSummary = function(provinces, fn)
	{
		async.each(provinces, function(province , eachcallback)
		{
			var newSumm = new Object();

			async.series([
				function(callback) {
					// Ambil jumlah low threats
					AnalysedNews.find({$and:[{"eventDaerahTk1" : province},{"threatWarning": "low"}]}, function(err, lowthreats) {
						if (err)
							res.send(err);

						// callback(null, lowthreats.length);

						// ambil summari kategori
						AnalysedNews.distinct("categoryMain", {$and: [{"eventDaerahTk1" : province}, {"threatWarning":"low"}]}, function(err, catSumm) {
							if (err)
								res.send(err);

							callback(null, {"nLow": lowthreats.length, "catSumm": catSumm});
						});
					});
				},
				function(callback) {
					// Ambil jumlah medium threats
					AnalysedNews.find({$and:[{"eventDaerahTk1" : province},{"threatWarning": "medium"}]}, function(err, medthreats) {
						if (err)
							res.send(err);

						// callback(null, medthreats.length);

						// ambil summari kategori
						AnalysedNews.distinct("categoryMain", {$and: [{"eventDaerahTk1" : province}, {"threatWarning":"medium"}]}, function(err, catSumm) {
							if (err)
								res.send(err);

							callback(null, {"nMed": medthreats.length, "catSumm": catSumm});
						});
					});
				},
				function(callback) {
					// Ambil jumlah high threats
					AnalysedNews.find({$and:[{"eventDaerahTk1" : province},{"threatWarning": "high"}]}, function(err, highthreats) {
						if (err)
							res.send(err);

						// callback(null, highthreats.length);

						// ambil summari kategori
						AnalysedNews.distinct("categoryMain", {$and: [{"eventDaerahTk1" : province}, {"threatWarning":"high"}]}, function(err, catSumm) {
							if (err)
								res.send(err);

							callback(null, {"nHigh": highthreats.length, "catSumm": catSumm});
						});
					});
				}
			],
			// optional callback
			function(err, results) {
				// results is now equal to ['one', 'two']
				if (err) fn(err);

				// push the array
				AnalysedNews
				.where('eventDaerahTk1', province)
				.select('eventLat eventLon') 		// hanya mengambil field eventLat dan eventLon
				.limit(1)
				.exec(function (err, docs) {
					newSumm.lokasi = province;
					newSumm.nLow = results[0].nLow;
					newSumm.nMed = results[1].nMed;
					newSumm.nHigh = results[2].nHigh;
					newSumm.lowCatSumm = results[0].catSumm;
					newSumm.medCatSumm = results[1].catSumm;
					newSumm.highCatSumm = results[2].catSumm;
					newSumm.lat = docs[0].eventLat;
					newSumm.lon = docs[0].eventLon;

					summArr.push(newSumm);
				
					// tell the each async that the operation for each item is finished
					eachcallback();
				});
			});
		}, 
		function(err){
			if (err)
				fn(err);
			else
				fn(summArr);
		});
	}

	getCategorySummary = function (fn){
		summArr.length = 0;

		// Ambil list kota
		AnalysedNews.distinct("eventDaerahTk1", function(err, provinces) {
			if (err)
				res.send(err);

			getProvCatSummary(provinces, fn);
		});
	}

	getProvCatSummary = function(provinces, fn)
	{
		async.each(provinces, function(province , eachcallback)
		{
			var newSumm = new Object();
			var catList = new Array();

			// iterate the array of kategori
			async.each(kategori, function(kat, katcallback) {
			    // Perform operation on file here.
			    // console.log('Processing category ' + kat);
			    AnalysedNews.find({$and:[{"eventDaerahTk1" : province},{"categoryMain": kat.main.name}]}, function(err, data) {
					if (err)
						res.send(err);

					var catSum = new Object();
					catSum.name = kat.main.name;
					catSum.n = data.length;

					catList.push(catSum);

					katcallback();
				});
			}, 
			function(err) {
			    // if any of the file processing produced an error, err would equal that error
			    if( err ) {
			      // One of the iterations produced an error.
			      // All processing will now stop.
			      console.log('Something wrong when processing category query');
			    }

			    AnalysedNews
				.where('eventDaerahTk1', province)
				.select('eventLat eventLon') 		// hanya mengambil field eventLat dan eventLon
				.limit(1)
				.exec(function (err, docs) {
					newSumm.lokasi = province;
					newSumm.lat = docs[0].eventLat;
					newSumm.lon = docs[0].eventLon;
					newSumm.category = catList;

					summArr.push(newSumm);
				
					// tell the each async that the operation for each item is finished
					eachcallback();
				});
			});

		}, 
		function(err){
			if (err)
				fn(err);
			else
				fn(summArr);
		});
	}

	/*make some functions as public */
	return {
		getProvinceSummary : function(fn){
			getProvinceSummary(fn);
		},
		getCategorySummary : function(fn){
			getCategorySummary(fn);
		}
	}
}