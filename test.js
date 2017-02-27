'use strict';

let Wit = null;
let interactive = null;

var getWeather = function ( location) {
  var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + location + '&appid=f953e7b081a49dc14a56671ffa303848';
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  })
    .then(rsp => {
      var res = rsp.json();
      return res;
    })
    .then(json => {
      if (json.error && json.error.message) {
        throw new Error(json.error.message);
      }
      return json;
    });
}

try {
  // if running from repo
  Wit = require('../').Wit;
  interactive = require('../').interactive;
} catch (e) {
  Wit = require('node-wit').Wit;
  interactive = require('node-wit').interactive;
}

const accessToken = (() => {
  if (process.argv.length !== 3) {
    console.log('usage: node test.js K3RPEW3BXX5R3KSYZBGP5OV24K64SUSH');
    process.exit(1);
  }
  return process.argv[2];
})();

// Quickstart example
// See https://wit.ai/ar7hur/quickstart

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    return new Promise(function (resolve, reject) {
      console.log('sending...', JSON.stringify(response));
      return resolve();
    });
  },
  getForecast({context, entities}) {
    var location = firstEntityValue(entities, 'location');
    if (location) {
      return new Promise(function (resolve, reject) {
        return getWeather(location).then(weatherJson => {
		  var weatherDetails = '';
		  	
		  var temp = weatherJson.main.temp - 273.15;
		  weatherDetails = weatherDetails + 'Current temperature : ' + temp + ' C';
			
		  var humid = weatherJson.main.humidity;
		  weatherDetails = weatherDetails + ', Humidity : ' + humid + '%';
				
	      var cloud = weatherJson.clouds.all;
		  weatherDetails = weatherDetails + ', Cloud : ' +cloud + '%';
			
		  var desc = weatherJson.weather[0].description;
		  weatherDetails = weatherDetails + ', Overall weather : ' + desc;
			
		  weatherDetails = weatherDetails + ' in ' + location;
		  
          context.forecast = weatherDetails;
          delete context.missingLocation;
          return resolve(context);
        })
      });
    } else {
      context.missingLocation = true;
      delete context.forecast;
      return Promise.reject(context);
    }
    return context;
  },
};

const client = new Wit({ accessToken, actions });
interactive(client);
