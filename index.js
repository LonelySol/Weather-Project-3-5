const express = require('express');
const fetch = require('node-fetch');
const Datastore = require('nedb');
const { request, response } = require('express');
const database = new Datastore('public/logs/database.db');
database.loadDatabase();
require('dotenv').config({path: '.env'});

const app = express();
app.listen(3000, () => console.log('Listening at port 3000'));
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

//get data from database
app.get('/database', (request, response) => {
    database.find({}, (err, data) => {
        if (err) {
            response.end();
            return;
        } 
        response.json(data);
    });
});

//get lat, lon, use that data for API calls
app.get('/weather/:sent_geodata', async(request, response) => {
    const sent_geodata = request.params.sent_geodata.split(',');
    const lat = sent_geodata[0];
    const lon = sent_geodata[1];
    //console.log(lat, lon);
    const weather_data = await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&lang=ja&units=metric`);
    const weather = await weather_data.json();
    //console.log(weather);
    response.json(weather);
});

//get input-city, use that data for API calls
app.get('/city-weather/:input_city', async(request, response) => {
    const sent_inputcity = request.params.input_city;
    console.log(sent_inputcity);
    const city_weather_data = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${sent_inputcity}&appid=${process.env.WEATHER_API_KEY}&lang=ja&units=metric`);
    const city_weather = await city_weather_data.json();
    response.json(city_weather);
});

//get data from client, store it in database
app.post('/client', (request, response) => {
    const client_data = request.body;
    const timeStamp = Date.now();
    client_data.timeStamp = timeStamp;
    database.insert(client_data);
});

//send the api keys
app.get('/keys', (request, response) => {
    const weather_key = process.env.WEATHER_API_KEY;
    const mapbox_key = process.env.MAPBOX_API_KEY
    const keys = {
        openweather: weather_key,
        mapbox: mapbox_key
    }
    response.json(keys);
})