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
    stations: L.featureGroup()
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "Relief avalanche.report": L.tileLayer(
        "https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
        attribution: `© <a href="https://lawinen.report">CC BY avalanche.report</a>`,
        maxZoom:12,
    }).addTo(map),
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery")
}, {
    "Wetterstationen": themaLayer.stations.addTo(map)
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// Darstellung der Wetterstationen
async function showStations(url) {
    let response = await fetch(url);
    let jsondata = await response.json()

    // Wetterstationen mit Icons und Popups implementieren
    // PROBLEM: Um eine Rundung der Werte der Windgeschwindigkeit zu erreichen, wurde die FixedTo() Funktion eingebaut. Wenn keine Messwerte vorhanden sind, wird jedoch 'NaN' angezeigt, anstatt der festgelegten Fehlermeldung 
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
            if(prop.WG){
                WG=(prop.WG*3.6).toFixed(1);
            }else{
                WG="-";
            }
            //let WG = (prop.WG)?(prop.WG*3.6).toFixed(1):"-";
            console.log(mas)
            layer.bindPopup(`
                <h1>${prop.name}, ${mas} m ü.A. </h1><ul>
                    <li>Lufttemperatur (Grad °): ${prop.LT || "-"} </li>
                    <li>relative Luftfeuchte (%): ${prop.RH || "-"} </li>
                    <li>Windgeschwindigkeit (km/h): ${WG}</li>
                    <li>Schneehöhe (cm): ${prop.HS || "-"}</li>
                </ul></>
                <!-- -->
                <span>${date_time.toLocaleString()}</span>
            `);
        }
    }).addTo(themaLayer.stations)
}
showStations("https://static.avalanche.report/weather_stations/stations.geojson");