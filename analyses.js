// analyses.js

module.exports = function(Threat){
	var async = require('async');
	var summArr = new Array();

	getSummary = function (fn){
		summArr.length = 0;
		// Ambil list kota
		Threat.distinct("eventLocation.namaTempat", function(err, allLocations) {
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
					Threat.find({$and:[{"eventLocation.namaTempat" : location},{"threatWarning": "low"}]}, function(err, lowthreats) {
						if (err)
							res.send(err);

						callback(null, lowthreats.length);
					});
				},
				function(callback) {
					// Ambil jumlah medium threats
					Threat.find({$and:[{"eventLocation.namaTempat" : location},{"threatWarning": "medium"}]}, function(err, medthreats) {
						if (err)
							res.send(err);

						callback(null, medthreats.length);
					});
				},
				function(callback) {
					// Ambil jumlah high threats
					Threat.find({$and:[{"eventLocation.namaTempat" : location},{"threatWarning": "high"}]}, function(err, highthreats) {
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
				Threat
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
		}
	}
}