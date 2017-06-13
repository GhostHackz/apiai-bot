'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;

const express = require('express');
const parser = require('body-parser');

const service = express();

service.use(parser.urlencoded({
	extended: true
}));

service.use(parser.json());

const UNRECOGNIZED_DEEP_LINK = 'deeplink.unknown';
const TELL_FACT = 'tell.fact';
const TELL_CAT_FACT = 'tell.cat.fact';

const CATEGORY_ARGUMENT = 'category';

const FACTS_CONTEXT = 'choose_fact-followup';
const CAT_CONTEXT = 'choose_cats-followup';
const DEFAULT_LIFESPAN = 5;
const END_LIFESPAN = 0;

const FACT_TYPE = {
	HISTORY: 'history',
	HEADQUARTERS: 'headquarters',
	CATS: 'cats'
};

const HISTORY_FACTS = new Set([
	'Google was founded in 1998.',
	'Google was founded by Larry Page and Sergey Brin.',
	'Google went public in 2004',
	'Google has more than 70 offices in more than 40 countries.'
]);

const HQ_FACTS = new Set([
	'Google\'s headquarters is in Mountain View, California.',
	'Google has over 30 cafeterias in its main campus.',
	'Google has over 10 fitness facilities in its main campus.'
]);

const CAT_FACTS = new Set([
	'Cats are pet animals.',
	'Cats have nine lives.',
	'Cats descend from other cats.'
]);

const GOOGLE_IMAGES = [
	[
		'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Search_GSA.2e16d0ba.fill-300x300.png',
		'Google App Logo'
	],
	[
		'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Google_Logo.max-900x900.png',
		'Google Logo'
	],
	[
		'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Dinosaur-skeleton-at-Google.max-900x900.jpg',
		'Stan the Dinosaur at Googleplex'
	],
	[
		'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Wide-view-of-Google-campus.max-900x900.jpg',
		'Googleplex'
	],
	[
		'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Bikes-on-the-Google-campus.2e16d0ba.fill-300x300.jpg',
		'Biking at Googleplex'
	]
];

const CAT_IMAGE = [
	'https://developers.google.com/web/fundamentals/accessibility/semantics-builtin/imgs/160204193356-01-cat-500.jpg',
	'Gray Cat'
];

const LINK_OUT_TEXT = 'Learn more';
const GOOGLE_LINK = 'https://www.google.com/about/';
const CATS_LINK = 'https://www.google.com/search?q=cats';
const NEXT_FACT_DIRECTIVE = 'Would you like to hear another fact?';
const CONFIRMATION_SUGGESTIONS = ['Sure', 'No thanks'];

const NO_INPUTS = [
	'I didn\'t hear that.',
	'If you\'re still there, say that again.',
	'We can stop here. See you soon.'
];

const MEOW_SRC = 'https://actions.google.com/sounds/v1/animals/cat_purr_close.ogg';

function getRandomImage(images) {
	let randomIndex = Math.floor(Math.random() * images.length);
	return images[randomIndex];
}

function getRandomFact(facts) {
	if (facts.size <= 0) {
		return null;
	}
	let randomIndex = (Math.random() * (facts.size - 1)).toFixed();
	let randomFactIndex = parseInt(randomIndex, 10);
	let counter = 0;
	let randomFact = '';
	for (let fact of facts.values()) {
		if (counter === randomFactIndex) {
			randomFact = fact;
			break;
		}
		counter++;
	}
	facts.delete(randomFact);
	return randomFact;
}

service.post('/ai-processing-system', function(request, response) {
	const app = new App({request, response});
	console.log('Request headers: ' + JSON.stringify(request.headers));
	console.log('Request body: ' + JSON.stringify(request.body));
	
	function unhandledDeepLinks(app) {
		if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
			app.ask(app.buildRichResponse().addSimpleResponse('Welcome to GhostHackzAI! I would really rather not talk about ' + app.getRawInput() + '. Would not you rather talk about Google? I can tell you about its history or its headquarters. Which one do you want to hear about?').addSuggestions(['History', 'Headquarters']), NO_INPUTS);
		} else {
			app.ask('Welcome to GhostHackzAI! I would really rather not talk about ' + app.getRawInput() + '. Would not you rather talk about Google? I can tell you about its history or its headquarters. Which one do you want to hear about?', NO_INPUTS);
		}
	}
	
	function tellFact(app) {
		let historyFacts = app.data.historyFacts ? new Set(app.data.historyFacts) : HISTORY_FACTS;
		let hqFacts = app.data.hqFacts ? new Set(app.data.hqFacts) : HQ_FACTS;
		
		if (historyFacts.size === 0 && hqFacts.size === 0) {
			app.tell('I think you heard all the facts!' + 'Thanks for listening!');
			return;
		}
	
		let factCategory = app.getArgument(CATEGORY_ARGUMENT);
	
		if (factCategory === FACT_TYPE.HISTORY) {
			let fact = getRandomFact(historyFacts);
			if (fact === null) {
				if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
					let suggestions = ['Headquarters'];
					if (!app.data.catFacts || app.data.catFacts.length > 0) {
						suggestions.push('Cats');
					}
					app.ask(app.buildRichResponse().addSimpleResponse(noFactsLeft(app, factCategory, FACT_TYPE.HEADQUARTERS)).addSuggestions(suggestions), NO_INPUTS);
				} else {
					app.ask(noFactsLeft(app, factCategory, FACT_TYPE.HEADQUARTERS), NO_INPUTS);
				}
				return;
			}
			
			let factPrefix = 'Sure, here is a history fact.';
			app.data.historyFacts = Array.from(historyFacts);
			if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
				let image = getRandomImage(GOOGLE_IMAGES);
				app.ask(app.buildRichResponse().addSimpleResponse(factPrefix).addBasicCard(app.buildBasicCard(fact).addButton(LINK_OUT_TEXT, GOOGLE_LINK).setImage(image[0], image[1])).addSimpleResponse(NEXT_FACT_DIRECTIVE).addSuggestions(CONFIRMATION_SUGGESTIONS), NO_INPUTS);
			} else {
				app.ask(factPrefix + fact + NEXT_FACT_DIRECTIVE, NO_INPUTS);
			}
			return;
		} else if (factCategory === FACT_TYPE.HEADQUARTERS) {
			let fact = getRandomFact(hqFacts);
			if (fact === null) {
				if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
					let suggestions = ['History'];
					if (!app.data.catFacts || app.data.catFacts.length > 0) {
						suggestions.push('Cats');
					}
					app.ask(app.buildRichResponse().addSimpleResponse(noFactsLeft(app, factCategory, FACT_TYPE.HISTORY)).addSuggestions(suggestions), NO_INPUTS);
				} else {
					app.ask(noFactsLeft(app, factCategory, FACT_TYPE.HISTORY), NO_INPUTS);
				}
				return;
			}
			
			let factPrefix = 'Okay, here is a headquarters fact.';
			app.data.hqFacts = Array.from(hqFacts);
			if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
				let image = getRandomImage(GOOGLE_IMAGES);
				app.ask(app.buildRichResponse().addSimpleResponse(factPrefix).addBasicCard(app.buildBasicCard(fact).setImage(image[0], image[1]).addButton(LINK_OUT_TEXT, GOOGLE_LINK)).addSimpleResponse(NEXT_FACT_DIRECTIVE).addSuggestions(CONFIRMATION_SUGGESTIONS), NO_INPUTS);
			} else {
				app.ask(factPrefix + fact + NEXT_FACT_DIRECTIVE, NO_INPUTS);
			}
			return;
		} else {
			if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
				app.ask(app.buildRichResponse().addSimpleResponse('Sorry, I didn\'t understand. I can tell you about Google\'s history or its headquarters. Which one do you want to hear about?').addSuggestions(['History', 'Headquarters']), NO_INPUTS);
			} else {
				app.ask('Sorry, I didn\'t understand. I can tell you about Google\'s history or its headquarters. Which one do you want to hear about?', NO_INPUTS);
			}
		}
	}
	
	function tellCatFact(app) {
		let catFacts = app.data.catFacts ? new Set(app.data.catFacts) : CAT_FACTS;
		let fact = getRandomFact(catFacts);
		if (fact === null) {
			app.setContext(FACTS_CONTEXT, DEFAULT_LIFESPAN, {});
			app.setContent(CAT_CONTEXT, END_LIFESPAN, {});
			if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
				app.ask(app.buildRichResponse().addSimpleResponse('Looks like you have heard all there is to know about cats. Would you like to hear about Google?', NO_INPUTS).addSuggestions(CONFIRMATION_SUGGESTIONS));
			} else {
				app.ask('Looks like you have heard all there is to know about cats. Would you like to hear about Google?', NO_INPUTS);
			}
			return;
		}
		
		app.data.catFacts = Array.from(catFacts);
		let factPrefix = 'Alright, here is a cat fact. <audio src="' + MEOW_SRC + '"></audio>';
		if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
			app.ask(app.buildRichResponse().addSimpleResponse('<speak>' + factPrefix + '</speak>').addBasicCard(app.buildBasicCard(fact).setImage(CAT_IMAGE[0], CAT_IMAGE[1]).addButton(LINK_OUT_TEXT, CATS_LINK)).addSimpleResponse(NEXT_FACT_DIRECTIVE).addSuggestions(CONFIRMATION_SUGGESTIONS), NO_INPUTS);
		} else {
			app.ask('<speak>' + factPrefix + ' ' + fact + ' ' + NEXT_FACT_DIRECTIVE + '</speak>', NO_INPUTS);
		}
		return;
	}
	
	function noFactsLeft(app, currentCategory, redirectCategory) {
		let parameters = {};
		parameters[CATEGORY_ARGUMENT] = redirectCategory;
		
		app.setContext(FACTS_CONTEXT, DEFAULT_LIFESPAN, parameters);
		let response = 'Looks like you have heard all there is to know about the ' + currentCategory + ' of Google. I could tell you about its ' + redirectCategory + ' instead.';
		if (!app.data.catFacts || app.data.catFacts.length > 0) {
			response += 'By the way, I can tell you about cats too.';
		}
		response += 'So what would you like to hear about?';
		return response;
	}
	
	const actionMap = new Map();
	actionMap.set(UNRECOGNIZED_DEEP_LINK, unhandledDeepLinks);
	actionMap.set(TELL_FACT, tellFact);
	actionMap.set(TELL_CAT_FACT, tellCatFact);
	
	app.handleRequest(actionMap);
});

service.listen((process.env.PORT || 5000), function() {
	console.log('Server is up and running!');
});
