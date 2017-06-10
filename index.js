'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;

const NAME_ACTION = 'make_name';
const COLOR_ARGUMENT = 'color';
const NUMBER_ARGUMENT = 'number';

exports.mainThread = (request, response) => {
	const app = new App({request, response});
	console.log('Request headers: ' + JSON.stringify(request.headers));
	console.log('Request body: ' + JSON.stringify(request.body));

	function makeName(app) {
		let number = app.getArgument(NUMBER_ARGUMENT);
		let color = app.getArgument(COLOR_AURGUMENT);
		app.tell('Alright your silly name is ' + color + ' ' + number + '! I hope you like it. See you next time.');
	}

	let actionMap = new Map();
	actionMap.set(NAME_ACTION, makeName);

	app.handleRequest(actionMap);
};
