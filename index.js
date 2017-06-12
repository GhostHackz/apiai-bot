'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;

const express = require('express');
const parser = require('body-parser');
const date-time = require('node-datetime');

const service = express();

service.use(parser.urlencoded({
	extended: true
}));

service.use(parser.json());

const CAT_SOUND = 'https://actions.google.com/sounds/v1/animals/cat_purr_close.ogg';
const DOG_SOUND = 'https://actions.google.com/sounds/v1/animals/dog_growling.ogg';
const MOUSE_SOUND = 'https://actions.google.com/sounds/v1/animals/mouse_squeaking.ogg';

service.post('/ai-management-system', function(request, response) {
	const app = new App({request, response});
	console.log('Request headers: ' + JSON.stringify(request.headers));
	console.log('Request body: ' + JSON.stringify(request.body));
	
	function catSound(app) {
		let catSpeech = 'Alright, here\'s a cat sound.<audio src="${CAT_SOUND}"></audio>';
		app.ask('<speak>${catSpeech}</speak>');
	}
	
	function dogSound(app) {
		let dogSpeech = 'Alright, here\'s a dog sound.<audio src="${DOG_SOUND}"></audio>';
		app.ask('<speak>${dogSpeech}</speak>');
	}
	
	function mouseSound(app) {
		let mouseSpeech = 'Alright, here\'s a mouse sound.<audio src="${MOUSE_SOUND}"></audio>';
		app.ask('<speak>${mouseSpeech}</speak>');
	}
	
	const actionMap = new Map();
	actionMap.set('ai.cat-sound', catSound);
	actionMap.set('ai.dog-sound', dogSound);
	actionMap.set('ai.mouse-sound', mouseSound);
	
	app.handleRequest(actionMap);
});

service.listen((process.env.PORT || 5000), function() {
	console.log("Server is up and running!");
});
