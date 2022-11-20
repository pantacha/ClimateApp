require('dotenv').config()

const {readInput, inquirerMenu, pause, listPlaces} = require('./helpers/inquirer');
const Searches = require('./models/searches');

const main = async () => {
    

    const searches = new Searches();
    let opt;

    do {

        opt = await inquirerMenu();
        
        switch (opt) {
            case 1:
                //Show message
                const term = await readInput('City: ');

                //Search places
                const places = await searches.city(term);

                //Select place
                const id = await listPlaces(places);
                if(id==='0') continue;

                const placeSelec = places.find((place) => place.id === id);

                //Save in DB
                const {name, lat, lng} = placeSelec;
                searches.includesHistorical(name);

                //Climate
                const climate = await searches.placeClimate(lat, lng);
                
                //Show results
                console.clear();
                console.log('\nCity information\n'.green);
                console.log('City:', name.green);
                console.log('Lat:', lat);
                console.log('Lng:', lng);
                console.log('Temperature:', climate.temp);
                console.log('Thermal sensation:', climate.therm);
                console.log('Pressure:', climate.pressure);
                console.log('What´s the weather like:', climate.desc.green);
            break;
            
            case 2:
                searches.historicalCapitalized.forEach((elem, id) => {

                    const idx = `${id+1}.`.green;
                    console.log(`${idx} ${elem}`);
                    
                });
            break;
            
        }

        if (opt!==0) {
            await pause();
        }
    } while (opt !== 0)
    //const text = await readInput();
}

main()