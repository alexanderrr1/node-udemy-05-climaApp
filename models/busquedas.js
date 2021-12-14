const fs = require('fs');
const axios = require('axios');

class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor() {
        this.leerDB();
    }

    get historialCapitalizado() {
        return this.historial.map( lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map( palabra => palabra[0].toUpperCase() + palabra.substring(1));
            return palabras.join(' ');
        })
    }

    get paramsMapbox() {
        return {
            'access_token' : process.env.MAPBOX_KEY,
            'limit' : 5,
            'language' : 'es'
        }
    }

    get paramsWeather() {
        return {
            'appid' : process.env.OPENWEAHTER_KEY,
            'units': 'metric',
            'lang': 'es',
        }
    }

    async ciudad( lugar = '') {

        try {

            // Peticion HTTP
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox,
            });

            const resp = await instance.get();

            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }));

        } catch (error) {
            return [];
        }

    };

    async climaLugar(lat, lon) {

        try {

            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsWeather, lat, lon }
            });
            
            const resp = await instance.get();

            let {temp, temp_min, temp_max} = resp.data.main;
            let {description} = resp.data.weather[0];

            return {
                desc: description,
                min: temp_min,
                max: temp_max,
                temp: temp,
            };

        } catch(e) {
            console.log(e);
        }

    };

    agregarHistorial( lugar = '' ) {

        //TODO: Prevenir duplicados
        if( this.historial.includes(lugar.toLocaleLowerCase())){
            return;
        }

        this.historial = this.historial.splice(0 , 5);

        this.historial.unshift(lugar.toLocaleLowerCase());
        
        //Grabar en DB
        this.guardarDB();

    }

    guardarDB() {

        const payload = {
            historial: this.historial
        }

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB() {

        if(!fs.existsSync(this.dbPath)) return;

        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
        const data = JSON.parse(info);

        this.historial = data.historial; 

    }

}

module.exports = Busquedas;