/* Wetterstationen Euregio Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true
}).setView([ibk.lat, ibk.lng], 11);

// thematische Layer
let themaLayer = {
    stations: L.featureGroup(),
    temperature: L.featureGroup()
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "Relief avalanche.report": L.tileLayer(
        "https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
        attribution: `© <a href="https://lawinen.report">CC BY avalanche.report</a>`,
        maxZoom: 12,
    }).addTo(map),
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery")
}, {
    "Wetterstationen": themaLayer.stations,
    "Temperatur": themaLayer.temperature.addTo(map)
}).addTo(map);

//das Layer Kontroll pannel ist mit dieser Erweiterung immer geöffnet bei Öffnen der Website
layerControl.expand()

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

//
function getColor(value,ramp){
    for (let rule of ramp){
        if(value >= rule.min && value < rule.max){
            return rule.color;
        }
    }
}
console.log(getColor(-40,COLORS.temperature))
// Funktion, die Wetterstationen mit Icons und Popups implemetiert
function writeStationLayer(jsondata) {
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/wifi.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            let mas = feature.geometry.coordinates[2]
            let date_time = new Date(prop.date);
            let WG;
            if (prop.WG) {
                WG = (prop.WG * 3.6).toFixed(1);
            } else {
                WG = "-";
            }
            //let WG = (prop.WG)?(prop.WG*3.6).toFixed(1):"-";
            layer.bindPopup(`
            <h1>${prop.name}, ${mas} m ü.A. </h1><ul>
                <li>Lufttemperatur (Grad °): ${prop.LT || "-"} </li>
                <li>relative Luftfeuchte (%): ${prop.RH || "-"} </li>
                <li>Windgeschwindigkeit (km/h): ${WG}</li>
                <li>Schneehöhe (cm): ${prop.HS || "-"}</li>
            </ul></>
            <span>${date_time.toLocaleString()}</span>
        `);
        }
    }).addTo(themaLayer.stations)
}

//Funktion, die Temperatur darstellt 
function writeTemperatureLayer(jsondata) {
    L.geoJSON(jsondata, {
        // in der if Abfrage werden Daten vom feature abgefragt, wenn Bedingung stimmt wird ein true zurückgegeben, sodass der Filter dieses Objekt NICHT filtert
        filter: function(feature){
            if(feature.properties.LT > -50 && feature.properties.LT < 50){
                return true
            }
        },
        pointToLayer: function (feature, latlng) {
            let color = getColor(feature.properties.LT,COLORS.temperature)
            return L.marker(latlng, {
                icon: L.divIcon({
                    // mit der classname option kriegt jedes Element die Klasse zugewiesen
                    className:"aws-div-icon",
                    //span ist ein Bereich, der nur für eine Zeile gilt
                    html:`<span style="background-color:${color}">${feature.properties.LT.toFixed(2)}</span>`
                })
            });
        },
    }).addTo(themaLayer.temperature)
}

// Darstellung der Wetterstationen
async function loadStations(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    writeStationLayer(jsondata);
    writeTemperatureLayer(jsondata);
}

loadStations("https://static.avalanche.report/weather_stations/stations.geojson");