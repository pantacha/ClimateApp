const fs = require('fs');

const axios = require('axios');

class Searches {

    historical = [];
    dbPath = './db/database.json';

    constructor(){
        this.readDB();
    }

    get historicalCapitalized() {
        return this.historical.map(elem => {
            let words = elem.split(' ');
            words = words.map((letter) => {
                return letter[0].toUpperCase()+letter.substring(1);
            })
            return words.join(' ');
        })
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5
        }
    }

    get paramsWeather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric'
        }
    }

    async city(name = '') {

        try {
            //Http request
            const instance = axios.create({
                 baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${name}.json`,
                 params: this.paramsMapbox
             })
            const resp = await instance.get();
            const places = await resp.data.features.map((place) => {
                return {
                    id : place.id,
                    name: place.place_name,
                    lng: place.center[0],
                    lat: place.center[1],
                }
            });
            return places;

        } catch (error) {
            return [];
        }
    }

    async placeClimate(lat, lon) {

        try {
            const instanc = axios.create({
                 baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                 params: {...this.paramsWeather, lat, lon}
             })
            const resp = await instanc.get();
            const {main, weather} = resp.data;
            console.log(resp);
            return {
                temp: main.temp,
                desc: weather[0].description,
                pressure: main.pressure,
                therm: main.feels_like,
            }
        } catch (error) {
            console.log(error);
        }
    }

    includesHistorical(place='') {
        
        if(this.historical.includes(place.toLocaleLowerCase())) {
            return;
        }

        this.historical = this.historical.splice(0,5);

        this.historical.unshift(place.toLocaleLowerCase());

        //Save in DB
        this.saveDB();

    }

    saveDB() {
        
        const payload = {
            historical: this.historical
        }

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    readDB() {
        
        if(!fs.existsSync(this.dbPath)) {
            return;
        }

        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
        const data = JSON.parse(info);

        this.historical = data.historical;

    }

}

module.exports = Searches;