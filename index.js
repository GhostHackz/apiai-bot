'use strict';

const TwitterPackage = require('twitter');
const express = require('express');
const parser = require('body-parser');

const service = express();

service.use(parser.urlencoded({
	extended: true
}));

service.use(parser.json());

const keys = require('./keys');

const Twitter = new TwitterPackage(keys);

service.post('/twitter-webhook', function(request, response) {
	const tweet = request.tweetText;
	if (tweet) {
		response.send(true);
	}
	
	Twitter.post('statuses/update', {status: tweet}, function(error, tweet, response) {
		if (error) {
			console.log(error);
		}
		console.log(tweet.text);
		console.log(response);
	});
});

service.listen((process.env.PORT || 5000), function() {
	console.log('Server is up and listening!');
});
