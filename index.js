'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;

exports.aiManagementSystem = (request, response) => {
	const app = new App({request, response});
	console.log('Request headers: ' + JSON.stringify(request.headers));
	console.log('Request body: ' + JSON.stringify(request.body));
	
	function aiAction(app) {
		app.ask('Hello, World!');
	}
	
	const actionMap = new Map();
	actionMap.set('sample.action', aiAction);
	
	app.handleRequest(actionMap);
};
	
