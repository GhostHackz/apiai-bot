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

service.post('/ai-management-system', function(request, response) {
	const app = new App({request, response});
	console.log('Request headers: ' + JSON.stringify(request.headers));
	console.log('Request body: ' + JSON.stringify(request.body));
	
	function aiGreet(app) {
		app.ask('Hey! How are you?');
	}
	
	function aiDate(app) {
		const date = date-time.create();
		date.format('Y-m-d H:M:S');
		
		app.tell(new Date(date.now()));
	}
	
	const actionMap = new Map();
	actionMap.set('ai.greet', aiGreet);
	actionMap.set('ai.date', aiDate);
	
	app.handleRequest(actionMap);
});

service.listen((process.env.PORT || 5000), function() {
	console.log("Server is up and running!");
});
