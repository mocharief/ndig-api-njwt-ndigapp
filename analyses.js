// analyses.js

module.exports = function(AnalysedNews){
	var async = require('async');
	var summArr = new Array();

	getProvinceSummary = function (fn){
		summArr.length = 0;
		// Ambil list kota
		AnalysedNews.distinct("eventLocation.daerahTingkat1", function(err, provinces) {
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
					AnalysedNews.find({$and:[{"eventLocation.daerahTingkat1" : province},{"threatWarning": "low"}]}, function(err, lowthreats) {
						if (err)
							res.send(err);

						// callback(null, lowthreats.length);

						// ambil summari kategori
						AnalysedNews.distinct("queryCategory.main", {$and: [{"eventLocation.daerahTingkat1" : province}, {"threatWarning":"low"}]}, function(err, catSumm) {
							if (err)
								res.send(err);

							callback(null, {"nLow": lowthreats.length, "catSumm": catSumm});
						});
					});
				},
				function(callback) {
					// Ambil jumlah medium threats
					AnalysedNews.find({$and:[{"eventLocation.daerahTingkat1" : province},{"threatWarning": "medium"}]}, function(err, medthreats) {
						if (err)
							res.send(err);

						// callback(null, medthreats.length);

						// ambil summari kategori
						AnalysedNews.distinct("queryCategory.main", {$and: [{"eventLocation.daerahTingkat1" : province}, {"threatWarning":"medium"}]}, function(err, catSumm) {
							if (err)
								res.send(err);

							callback(null, {"nMed": medthreats.length, "catSumm": catSumm});
						});
					});
				},
				function(callback) {
					// Ambil jumlah high threats
					AnalysedNews.find({$and:[{"eventLocation.daerahTingkat1" : province},{"threatWarning": "high"}]}, function(err, highthreats) {
						if (err)
							res.send(err);

						// callback(null, highthreats.length);

						// ambil summari kategori
						AnalysedNews.distinct("queryCategory.main", {$and: [{"eventLocation.daerahTingkat1" : province}, {"threatWarning":"high"}]}, function(err, catSumm) {
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
				.where('eventLocation.daerahTingkat1', province)
				.select('eventLocation')
				.limit(1)
				.exec(function (err, docs) {
					newSumm.lokasi = province;
					newSumm.nLow = results[0].nLow;
					newSumm.nMed = results[1].nMed;
					newSumm.nHigh = results[2].nHigh;
					newSumm.lowCatSumm = results[0].catSumm;
					newSumm.medCatSumm = results[1].catSumm;
					newSumm.highCatSumm = results[2].catSumm;
					newSumm.lat = docs[0].eventLocation.latitude;
					newSumm.lon = docs[0].eventLocation.longitude;

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

	getSummary = function (fn){
		summArr.length = 0;
		// Ambil list kota
		AnalysedNews.distinct("eventLocation.namaTempat", function(err, allLocations) {
			if (err)
				res.send(err);

			getEachSummary(allLocations, fn);
		});
	}

	getEachSummary = function(locations, fn)
	{
		async.each(locations, function(location , eachcallback)
		{
			var newSumm = new Object();

			async.series([
				function(callback) {
					// Ambil jumlah low threats
					AnalysedNews.find({$and:[{"eventLocation.namaTempat" : location},{"threatWarning": "low"}]}, function(err, lowthreats) {
						if (err)
							res.send(err);

						callback(null, lowthreats.length);
					});
				},
				function(callback) {
					// Ambil jumlah medium threats
					AnalysedNews.find({$and:[{"eventLocation.namaTempat" : location},{"threatWarning": "medium"}]}, function(err, medthreats) {
						if (err)
							res.send(err);

						callback(null, medthreats.length);
					});
				},
				function(callback) {
					// Ambil jumlah high threats
					AnalysedNews.find({$and:[{"eventLocation.namaTempat" : location},{"threatWarning": "high"}]}, function(err, highthreats) {
						if (err)
							res.send(err);

						callback(null, highthreats.length);
					});
				}
			],
			// optional callback
			function(err, results) {
				// results is now equal to ['one', 'two']
				if (err) fn(err);

				// push the array
				AnalysedNews
				.where('eventLocation.namaTempat', location)
				.select('eventLocation')
				.limit(1)
				.exec(function (err, docs) {
					newSumm.lokasi = location;
					newSumm.nLow = results[0];
					newSumm.nMed = results[1];
					newSumm.nHigh = results[2];
					newSumm.lat = docs[0].eventLocation.latitude;
					newSumm.lon = docs[0].eventLocation.longitude;

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
		getSummary : function(fn){
			getSummary(fn);
		},
		getProvinceSummary : function(fn){
			getProvinceSummary(fn);
		}
	}
}