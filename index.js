'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const service = express();

service.use(bodyParser.urlencoded({
	extended: true
}));

service.use(bodyParser.json());

service.post('/ga-webhook', function(req, res) {
	var speech = req.body.result && req.body.result.parameters && req.body.result.parameters.echoText ? req.body.result.parameters.echoText : "Oops! Something went wrong, please try again!"
	return res.json({
		speech: speech,
		displayText: speech,
		source: 'GhostHackzAI'
	});
});

service.listen((process.env.PORT || 5000), function() {
	console.log("Server is running and listening your request!");
});
