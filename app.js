require("dotenv").config();
const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');

var now = new Date();

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    firstPage = true;
    res.render("index", { firstPage: true, error: '', weatherData: [] });
});

app.post('/', (req, res) => {
    var city = req.body.cityName;
    var changeCity = false;
    if (city.toLowerCase() === 'satu barba') {
        city = 'Marghita';
        changeCity = true;
    }

    if (city.toLowerCase() === 'markt allhau') {
        city = 'Oberwart'
        changeCity = true;
    }

    const apiKey = process.env.API_KEY;
    const unit = 'metric'
    const url = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&appid=' + apiKey + '&units=' + unit;

    https.get(url, (response) => {
        const { statusCode } = response;
        const contentType = response.headers['content-type'];
        let error;

        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                `Expected application/json but received ${contentType}`);
        }
        if (error) {
            response.resume();
            res.render('index', { firstPage: true, error: "Enter a valid city name" });
            return;
        }
        response.setEncoding('utf8');
        let rawData = '';
        response.on('data', (chunk) => { rawData += chunk; });
        response.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                console.log(parsedData.list[0].dt_txt.split(' ')[1])
                res.render('index', { firstPage: false, weatherData: parsedData.list, today: now.getDay(), city: parsedData.city.name });
            } catch (e) {
                res.render('index', { firstPage: true, error: e.message });
            }
        });
    }).on('error', (e) => {
        res.render('index', { firstPage: true, error: e.message });
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});