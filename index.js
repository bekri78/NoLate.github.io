
//url de base hors https





let placeSearch;
let autocomplete;
let adressefinal=[];
let key = "AIzaSyATaVEl_K2D9IcWPICwcog27_C1TsOQGr0"
let infoGare, infoBus, infotrain, infoVelo, infoPied, infoVoiture
let meilleurTime ;
var tempsPrepration;



//adresse 1
let adress1Lat = null;
let adress1Lng = null;

//adresse 2

let adress2Lat = null;
let adress2Lng= null;


const componentForm = {
  street_number: "short_name",
  route: "long_name",
  locality: "long_name",
  administrative_area_level_1: "short_name",
  country: "long_name",
  postal_code: "short_name",
};

function initAutocomplete() {
  // Create the autocomplete object, restricting the search predictions to
  // geographical location types.
  autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("autocomplete"),
    { types: ["geocode"],
    componentRestrictions: {country: 'fr'} }
  );
  
  // Avoid paying for data that you don't need by restricting the set of
  // place fields that are returned to just the address components.
  autocomplete.setFields(["address_component"]);
  // When the user selects an address from the drop-down, populate the
  // address fields in the form.
  autocomplete.addListener("place_changed", fillInAddress);
  
}

function fillInAddress() {

  
  // Get the place details from the autocomplete object.
  const place = autocomplete.getPlace();
  


  console.log(place.address_components)
  for (const component in componentForm) {
    document.getElementById(component).value = "";
    document.getElementById(component).disabled = false;
  }

  // Get each component of the address from the place details,
  // and then fill-in the corresponding field on the form.
  for (const component of place.address_components) {
    const addressType = component.types[0];
    if (componentForm[addressType]) {
      const val = component[componentForm[addressType]];
      document.getElementById(addressType).value = val;
      adressefinal.push(val) // push dans un tableau adresse exact google
  console.log(adressefinal)
    }
  }

  geocode()
}





function geocode (){
  
    var locationAdresse = adressefinal.toString();
    console.log(locationAdresse)
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationAdresse}&key=${key}`)
    .then(function(response){
    
      if( adress1Lat == null) {
        adress1Lat = response.data.results[0].geometry.location.lat
        adress1Lng = response.data.results[0].geometry.location.lng
        console.log("la premiere adresse dansle if: ",   adress1Lat, adress1Lng)
        document.getElementById("adresseNumber").innerHTML= 1
      }else if(adress1Lat  !== null){
  
        adress2Lat = response.data.results[0].geometry.location.lat
        adress2Lng = response.data.results[0].geometry.location.lng
        console.log( " la deuxième adresse dans le else if : ", adress2Lat, adress2Lng)
        document.getElementById("adresseNumber").innerHTML= 2
        itineraire()
      }else{
        console.log("stop")
      }
    })
    .catch(function(error){
      console.log(error)
      
    })
    
    locationAdresse=[]
    adressefinal=[]

  }
  
  function itineraire (){
    console.log("itineraire a ete appelé")
    console.log("adresse 1 dans itineraire ",   adress1Lat, adress1Lng)
    console.log("adresse 2 dans itineraire: ",   adress2Lat, adress2Lng)
   

      let itnineraireUrl = ` https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${adress1Lat},${adress1Lng}&destinations=${adress2Lat},${adress2Lng}&departure_time=now&mode=transit&key=${key}`
      fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(itnineraireUrl)}`)
    .then((response) => response.json())
    .then((result) => {
   
      let x = JSON.parse(result.contents)
      console.log(x)
      let timer = x.rows[0].elements[0].duration.text
    infotrain = x.rows[0].elements[0].duration.value
     document.getElementById("time").innerHTML = timer
     gare()
     
      })
      .catch(function(error){
        console.log("itineraire erreur ", error)
        
      })
    }
  
function gare (){

  let gareProche =`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${adress1Lat},${adress1Lng}&rankby=distance&type=train_station&key=${key} `
  fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(gareProche)}`)
  .then((response) => response.json())
  .then((result) => {
   let recupInfoGare = JSON.parse(result.contents)
   infoGare = recupInfoGare.results[0]["name"]
   console.log(infoGare)

 document.getElementById("gareLaPlusProche").innerHTML = infoGare
initMap()
 
   })
}




function initMap() {
    const directionsRenderer = new google.maps.DirectionsRenderer();
    const directionsService = new google.maps.DirectionsService();
    const map = new google.maps.Map(document.getElementById("map"), {
        
      zoom: 7,
      center: { lat: 41.85, lng: -87.65 },
    });
    directionsRenderer.setMap(map);
    directionsRenderer.setPanel(document.getElementById("right-panel"));
    // const control = document.getElementById("floating-panel");
    // control.style.display = "block";
    // map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
  
    
    calculateAndDisplayTrain(directionsService, directionsRenderer);
   calculateAndDisplayRoute2(directionsService )
   calculateAndDisplayBicycle3(directionsService )
   calculateAndDisplayWalking5(directionsService )
    // calculateAndDisplayBus4(directionsService )

    infoWindow = new google.maps.InfoWindow();
  const locationButton = document.createElement("button");
  locationButton.textContent = "Click pour Votre postiion";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            
          };
          infoWindow.setPosition(pos);
          infoWindow.setContent("Votre Position.");
          infoWindow.open(map);
          map.setCenter(pos);
          map.setZoom(12)
          
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });
}
// TRAIN
  function  calculateAndDisplayTrain(directionsService, directionsRenderer) {
    const start = infoGare
    const end =  {lat: adress2Lat, lng: adress2Lng}
    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.TRANSIT,
        
    
      },
   
      (response, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(response);
        
          console.log("par le train",response)
     
          let heureDepartTrain =  response.routes[0].legs[0].departure_time.text
          let arrivee = response.routes[0].legs[0].arrival_time.text

          let infoHeuretransport = `PROCHAIN DEPART A ${heureDepartTrain} arrivée prevu a ${arrivee}`
          document.getElementById('depart1').innerHTML = infoHeuretransport
          
         
         
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }

  // VOITURE
  function calculateAndDisplayRoute2(directionsService) {
    const start = {lat: adress1Lat, lng: adress1Lng}
    const end =  {lat: adress2Lat, lng: adress2Lng}
    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
        
    
      },
   
      (response, status) => {
        if (status === "OK") {
        //   directionsRenderer.setDirections(response);

          console.log("par voiture",response)
          let route =   response.routes[0].legs[0].duration.text
          infoVoiture =  response.routes[0].legs[0].duration.value
          document.getElementById("voiture").innerHTML = route 
          var seconds = Math.round(new Date() / 1000)
          console.log(seconds)
     let totosecondeVoiture = infoVoiture + seconds
     console.log(totosecondeVoiture)
     let ArrivéeVoiture = new Date(totosecondeVoiture * 1000).toISOString().substr(11, 8)
          document.getElementById("arriveVoiture").innerHTML = ArrivéeVoiture
          
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }
  

  //VELO
  function calculateAndDisplayBicycle3(directionsService) {
    const start = {lat: adress1Lat, lng: adress1Lng}
    const end =  {lat: adress2Lat, lng: adress2Lng}
    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.BICYCLING,
        
    
      },
   
      (response, status) => {
        if (status === "OK") {
        //   directionsRenderer.setDirections(response);

          console.log("en velo",response)
          let velo =   response.routes[0].legs[0].duration.text
          document.getElementById("velo").innerHTML = velo
          infoVelo =  response.routes[0].legs[0].duration.value
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }
  
//A PIED

  function calculateAndDisplayWalking5(directionsService) {
    const start = {lat: adress1Lat, lng: adress1Lng}
    const end =  {lat: adress2Lat, lng: adress2Lng}
    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.WALKING,
        
    
      },
   
      (response, status) => {
        if (status === "OK") {
     
          console.log("a pied",response)
          let pied =   response.routes[0].legs[0].duration.text
          document.getElementById("pied").innerHTML = pied
          infoPied =  response.routes[0].legs[0].duration.value
           
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }



  
function nativia (){

    let username = '58249dcd-3769-4a99-9d86-53902427531e';
let password = '';
    let gareProche =`https://${username}@api.navitia.io/v1/coverage/fr-idf/journeys?from=${adress1Lng}%3B${adress1Lat}&to=${adress2Lng}%3B${adress2Lat}&count=2&`
    
  
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(gareProche)}`, {
       

    })
    .then((response) => response.json())
    .then((result) => {
     let recupInoNativia = JSON.parse(result.contents)
    let tempsNativia = recupInoNativia.journeys[0].duration
    let tempsConverti= moment.unix(tempsNativia).utc().format('H [h] m [minutes] ')
    document.getElementById("nativia").innerHTML = tempsConverti
 
recommendation()
   
 
   
     })
     .catch(function(error){
        console.log("itineraire erreur ", error)
        
      })
  }


  function recommendation(){
      console.log("je suis dans recommandation")
    var myArray = [
        {"ID": 1, "Time": infoVoiture, mode: 'Voiture'},
        {"ID": 2, "Time": infotrain , mode: 'TRANSPORT'},
        {"ID": 3, "Time": infoVelo, mode: 'VELO'},
        {"ID": 4, "Time": infoPied, mode: 'A PIED'}
    ]
    let [min] = myArray.reduce(([prevMin], {Time})=>
       [Math.min(prevMin, Time)], [Infinity]);
    console.log("Min Time:", min);
    let minimum = min


    for(var i=0; i<myArray.length; i++) {
        for(key in myArray[i]) {
          if(myArray[i]["Time"] === minimum) {
           let meilleurMode = myArray[i]["mode"]
           meilleurTime= myArray[i]["Time"]
           
           const phraseRecommande = ` Nole late vous recommende prendre le mode de transport : ${meilleurMode}`
            document.getElementById("recommendation").innerHTML =  phraseRecommande
          }
        }
      }

  }


  $("input[name=time]").clockpicker({       
    placement: 'bottom',
    align: 'left',
    autoclose: true,
    default: 'now',
    donetext: "Select",
    init: function() { 
                              console.log("colorpicker initiated");
                          },
                    
                          afterDone: function() {
                              console.log( $("input[name=time]").val());
                              tempsPrepration =$("input[name=time]").val()
                          }
  });
  


  
