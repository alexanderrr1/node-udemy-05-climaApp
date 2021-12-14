require('dotenv').config();

const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async() =>{

    console.clear();
    
    const busquedas = new Busquedas();

    let opt;

    do {
        
        opt = await inquirerMenu();

        switch(opt){

            case 1:
                const termino = await leerInput("Ciudad: ");
                
                // Buscar los lugares
                const lugares = await busquedas.ciudad( termino );
                
                // Seleccionar el lugar
                const id = await listarLugares(lugares);
                if( id === '0' ) continue;

                
                //Guardar en DB
                const lugarSel = lugares.find( lugar => lugar.id === id );
                busquedas.agregarHistorial(lugarSel.nombre)

                // Clima
                const clima = await busquedas.climaLugar( lugarSel.lat, lugarSel.lng ); 

                // Mostrar Resultados
                console.log("\nInformacion del lugar\n".green);
                console.log("Ciudad:", lugarSel.nombre.green);
                console.log("Lat:", lugarSel.lat);
                console.log("Lng:", lugarSel.lng);
                console.log("Temperatura:", clima.temp);
                console.log("Minima:", clima.min);
                console.log("Maxima:", clima.max);
                console.log("Como esta el clima:", clima.desc.green);
            break;

            case 2:
                busquedas.historialCapitalizado.forEach( (lugar, i ) => {
                    const idx = `${ i + 1 }.`.green;
                    console.log(`${ idx } ${ lugar }` );
                })
            break;

        }

        if( opt !== 0 ) await pausa();

    } while ( opt !== 0 );

}

main();

