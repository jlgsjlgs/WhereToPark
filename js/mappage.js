getCarparkLocations(); //STARTS EVERYTHING IN MAPPAGE.JS

const api_govforgmap = 'https://data.gov.sg/api/action/datastore_search?resource_id=139a3035-e624-4f56-b63f-89ae28d4ae4c&limit=5000';

var resultLatLng = new Array();
var resultCarparkName = new Array();
var carparkdis = new Map();
/////////////////////////
var markers = [];
////////////////////////////
function closeSidebar(){
    document.getElementsByClassName('sidebar')[0].style.display="none"; //hide
    document.getElementById('sidebarnext').style.display="none"; //hide
    // document.getElementById('map').style.width="100%";
    // document.getElementById('map').style.height="55rem";
}
function openCPDisplay(){
    document.getElementsByClassName('sidebar')[0].style.display="block"; //display
    document.getElementById('sidebarnext').style.display="none";
    document.getElementById('carparkDisplays').style.display="block";
}
function calculatePrice(int){
    if(int < 0){
        document.getElementById('price-result').textContent = "Invalid hours, please try again"
    }else{
        const d = new Date();
        let rate = 0.6 * 2;
        let cnum = document.getElementById('sdCNum').textContent;
        console.log(cnum);
        if ((centralcpark.get(cnum) != null) && (d.getDay() != 0) && (7< d.getHours()) && (d.getHours() <17)){
            rate = 1.2 * 2; // per hour instead of per 30 mins
        }
        document.getElementById('price-result').textContent = "$" + parseFloat(rate*int).toFixed(2); 
    }    
}

function getCarparkLocations(){
    var request = new XMLHttpRequest();
    request.open('GET', 'https://data.gov.sg/api/action/datastore_search?resource_id=139a3035-e624-4f56-b63f-89ae28d4ae4c&limit=5000', true);
    request.onload = function() {
        ggdata = JSON.parse(this.response);

        var cv = new SVY21();
        for (let i=0; i<ggdata.result.records.length; i++){
            let temp = cv.computeLatLon(ggdata.result.records[i].y_coord, ggdata.result.records[i].x_coord);
            let tempName = ggdata.result.records[i].car_park_no;
            resultLatLng.push(temp);
            resultCarparkName.push(tempName);
        }
        initMap();
    }
    request.send();
}

let autocomplete;
let map;
function initMap() {

    let mapOptions = {center: {lat: 1.3483, lng: 103.6831},
        zoom: 15};
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Initialize custom markers for all the carparks
    const iconBase = "https://developers.google.com/maps/documentation/javascript/examples/full/images/";
    const icons = {
        parking: {
        icon: iconBase + "parking_lot_maps.png",
        },
    };

    var tempitem = sessionStorage.getItem("locationmarker");
    
    var radiusdist;
    if (sessionStorage.getItem("simulate") === "1"){
        radiusdist = 2;
    } else {
        radiusdist = 1;
    }
    sessionStorage.removeItem("simulate");


    if (tempitem != null) {
        sessionStorage.removeItem("locationmarker");
        var searchresult = JSON.parse(tempitem);
        const locationmarker = new google.maps.Marker({
            position: searchresult.geometry.location,
            title: searchresult.name,
            map: map
        });
        map.panTo(locationmarker.position);

        for (let i = 0; i < resultLatLng.length; i++) {
            const marker = new google.maps.Marker({
                position: new google.maps.LatLng(resultLatLng[i].lat, resultLatLng[i].lon),
                title: resultCarparkName[i],
                icon: icons["parking"].icon,
                map: map,
            });

            if (haversine_distance(locationmarker, marker) > radiusdist){
                marker.setMap(null);
            } else {
                markers.push(marker);
                carparkdis.set(marker.title, haversine_distance(locationmarker,marker));
            }
        }

    } else {
        for (let i = 0; i < resultLatLng.length; i++) {
            const marker = new google.maps.Marker({
                position: new google.maps.LatLng(resultLatLng[i].lat, resultLatLng[i].lon),
                title: resultCarparkName[i],
                icon: icons["parking"].icon,
                map: map,
            });
            markers.push(marker);
        }
    }

    var request = new XMLHttpRequest()
    request.open('GET','https://api.data.gov.sg/v1/transport/carpark-availability', true);

    request.onload = function () {
        var data1 = JSON.parse(this.response);
        const hMap = new Map(); //creating hashmap

        let len2 = data1.items[0].carpark_data.length; //length of second api
        let index2;

        for(let i=0; i<len2;i++){ //adding the data of second API into hMap-> key: carpark num & value = index of element in array
            hMap.set(data1.items[0].carpark_data[i].carpark_number,i); //data1.items[0].carpark_data[i].carpark_number
        }

        for (let i=0; i<markers.length; i++){
            const marker = markers[i];
            marker.addListener("click", () => {
                let selectedcarparkNum = marker.getTitle();  // When you click on a marker, it retrieves the label (carpark no.)
                for (let i = 0; i < ggdata.result.records.length; i++){  // checks against api
                    if (selectedcarparkNum == ggdata.result.records[i].car_park_no){
                        foundindex = i;
                        index2 = hMap.get(selectedcarparkNum);
                    }
                }

                //rates
                let index1 = centralcpark.get(selectedcarparkNum);
                if(index1==null) {
                    document.getElementsByClassName('sdCPrice')[0].textContent="$0.60\r\n30mins";
                } else {
                    document.getElementsByClassName('sdCPrice')[0].textContent=  `$1.20\r\n30mins (Mon to Sat 7am to 5pm)
                    $0.60\r\n30mins (Other hours)`;                      
                }


                let displayAddress = ggdata.result.records[foundindex].address;
                let displayCPNum = ggdata.result.records[foundindex].car_park_no;
                let displayCPType = ggdata.result.records[foundindex].car_park_type;
                let displayNightParking = ggdata.result.records[foundindex].night_parking;
                let displayGantryHeight  =  ggdata.result.records[foundindex].gantry_height;
                let displayCPBasement = ggdata.result.records[foundindex].car_park_basement;
                let displayCPDecks = ggdata.result.records[foundindex].car_park_decks;
                let displayFreeParking = ggdata.result.records[foundindex].free_parking
                let displaySlots = data1.items[0].carpark_data[index2].carpark_info[0].lots_available;

                if (document.getElementById("checkbox1").checked == false){
                    document.getElementById('carparkDisplays').style.display="none"; //hide
                    document.getElementById('sidebarnext').style.display="block"; //display
                    document.getElementById('sdCNum').textContent=selectedcarparkNum;
                    document.getElementById('sdnAddt').textContent = displayAddress;
                    document.getElementById('sdnBasement').textContent="Basement: "+displayCPBasement;
                    document.getElementById('sdnDecks').textContent="No. of decks: "+displayCPDecks;
                    document.getElementById('sdnCPType').textContent="Carpark Type: "+displayCPType;
                    document.getElementById('sdnGHeight').textContent="Gantry Height: "+displayGantryHeight;
                    document.getElementById('sdnNPark').textContent="Night Parking: "+displayNightParking;
                    document.getElementById('sdnFPark').textContent="Free Parking: "+displayFreeParking;
                    document.getElementById('sdnAvail').textContent="Lots Available: "+ data1.items[0].carpark_data[index2].carpark_info[0].lots_available +" slots";
 

                // Current APi

                document.getElementById("getDirectionButton").addEventListener("click", function(){
                    var cv1 = new SVY21();
                    let templatlng = cv1.computeLatLon(ggdata.result.records[foundindex].y_coord, ggdata.result.records[foundindex].x_coord);
                    let templat = templatlng.lat;
                    let templng = templatlng.lon;
                    let tempurl = "https://www.google.com/maps/search/?api=1&query=" + templat + "," + templng;
                    location.href = tempurl;
                })

                    // Outputting to console
                    // console.log("Address:", displayAddress);
                    // console.log("Car Park No.:", displayCPNum);
                    // console.log("Car Park Type:", displayCPType);
                    // console.log("Night Parking Available:", displayNightParking);
                    // console.log("Gantry Height:", displayGantryHeight, "m");
                    // console.log("Is there a basement level:", displayCPBasement);
                    // Changing the text on sidebar
                    
                    document.getElementById('checkbox1').addEventListener('click', function(){
                        console.log("clicked"+ i);
                        document.querySelector('.compare-btn').style.display='none';
                        document.querySelector('.add-section').style.display='none';
                        if(document.getElementById('checkbox1').checked){
                            console.log("checked" + i);
                            // store main carpark info here (after checking box)
                            sessionStorage.setItem('main_displayAddress', displayAddress);
                            sessionStorage.setItem('main_displayCPType', displayCPType);
                            sessionStorage.setItem('main_displayCPDecks', displayCPDecks);
                            sessionStorage.setItem('main_displayCPBasement', displayCPBasement);
                            sessionStorage.setItem('main_displayGantryHeight', displayGantryHeight);
                            sessionStorage.setItem('main_displayNightParking', displayNightParking);
                            sessionStorage.setItem('main_displayFreeParking', displayFreeParking);
                            sessionStorage.setItem('main_displaySlots', displaySlots);


                            
                            





                            console.log('MAIN_Storeddd' + sessionStorage.getItem('main_displayAddress'));
        
                            document.querySelector('.compare-btn').style.display='block';
                            document.querySelector('.add-section').style.display='block';
                            
                        };
                    });
                } else{
                    // Display Info on the modal HERE
                    console.log("CLICKED")
                    let main_displayAddress = sessionStorage.getItem('main_displayAddress');
                    let main_displayCPType = sessionStorage.getItem('main_displayCPType');
                    let main_displayCPDecks  = sessionStorage.getItem('main_displayCPDecks');
                    let main_displayCPBasement  = sessionStorage.getItem('main_displayCPBasement');
                    let main_displayGantryHeight  = sessionStorage.getItem('main_displayGantryHeight');
                    let main_displayNightParking  = sessionStorage.getItem('main_displayNightParking');
                    let main_displayFreeParking  = sessionStorage.getItem('main_displayFreeParking');
                    let main_displaySlots  = sessionStorage.getItem('main_displaySlots');




                    console.log('main='+main_displayAddress);
                    console.log('compare='+displayAddress);

                    document.getElementById('compare_addr').textContent = displayAddress;


                    document.getElementById('compare-btn').addEventListener('click', function (){
                        document.querySelector('.bg-modal').style.display="flex";
                        
                        console.log('getStored_Main' + sessionStorage.getItem('main_displayAddress'));
                        console.log('getCompared' + sessionStorage.getItem('main_displayAddress'));
                        // Main carpark of the modal
                        document.getElementById('main_displayAddress_modal').textContent = main_displayAddress;
                        document.getElementById('main_displayCPType_modal').textContent = main_displayCPType;
                        document.getElementById('main_displayCPDecks_modal').textContent = main_displayCPDecks;
                        document.getElementById('main_displayCPBasement_modal').textContent = main_displayCPBasement;
                        document.getElementById('main_displayGantryHeight_modal').textContent = main_displayGantryHeight;
                        document.getElementById('main_displayNightParking_modal').textContent = main_displayNightParking;
                        document.getElementById('main_displayFreeParking_modal').textContent = main_displayFreeParking;
                        document.getElementById('main_displaySlots_modal').textContent = main_displaySlots;

                        // compared carpark info of modal
                        console.log('display'+ displayAddress);
                        document.getElementById('compare_displayAddress_modal').textContent = displayAddress;
                        document.getElementById('compare_displayCPType_modal').textContent = displayCPType;
                        document.getElementById('compare_displayCPDecks_modal').textContent = displayCPDecks;
                        document.getElementById('compare_displayCPBasement_modal').textContent = displayCPBasement;
                        document.getElementById('compare_displayGantryHeight_modal').textContent = displayGantryHeight;
                        document.getElementById('compare_displayNightParking_modal').textContent = displayNightParking;
                        document.getElementById('compare_displayFreeParking_modal').textContent = displayFreeParking;
                        document.getElementById('compare_displaySlots_modal').textContent = displaySlots;
                
                    });
                    document.getElementById('btn-modal-close').addEventListener('click', function(){
                        document.querySelector('.bg-modal').style.display='none';
                    });
                }


                // Changing the text on sidebar
            });

        }
    }
    request.send();
}

//Function to calculate distance between 2 markers on GMaps (For radius purposes)
function haversine_distance(mk1, mk2) {
    var R = 6371.0710; // Radius of the Earth in miles
    var rlat1 = mk1.position.lat() * (Math.PI/180); // Convert degrees to radians
    var rlat2 = mk2.position.lat() * (Math.PI/180); // Convert degrees to radians
    var difflat = rlat2-rlat1; // Radian difference (latitudes)
    var difflon = (mk2.position.lng()-mk1.position.lng()) * (Math.PI/180); // Radian difference (longitudes)

    var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
    return d;
}

//Convert X-Y Coordinates over to LatLng for Google Maps
var SVY21 = (function(){
    // Ref: http://www.linz.govt.nz/geodetic/conversion-coordinates/projection-conversions/transverse-mercator-preliminary-computations/index.aspx
    
    // WGS84 Datum
    this.a = 6378137;
    this.f = 1 / 298.257223563;

    // SVY21 Projection
    // Fundamental point: Base 7 at Pierce Resevoir.
    // Latitude: 1 22 02.9154 N, longitude: 103 49 31.9752 E (of Greenwich).

    // Known Issue: Setting (oLat, oLon) to the exact coordinates specified above
		// results in computation being slightly off. The values below give the most 
    // accurate represenation of test data.
    this.oLat = 1.366666;     // origin's lat in degrees
    this.oLon = 103.833333;   // origin's lon in degrees
    this.oN = 38744.572;      // false Northing
		this.oE = 28001.642;      // false Easting
    this.k = 1;               // scale factor

    this.init = function(){
  
        this.b = this.a * (1 - this.f);
        this.e2 = (2 * this.f) - (this.f * this.f);
        this.e4 = this.e2 * this.e2;
        this.e6 = this.e4 * this.e2;
        this.A0 = 1 - (this.e2 / 4) - (3 * this.e4 / 64) - (5 * this.e6 / 256);
        this.A2 = (3. / 8.) * (this.e2 + (this.e4 / 4) + (15 * this.e6 / 128));
        this.A4 = (15. / 256.) * (this.e4 + (3 * this.e6 / 4));
        this.A6 = 35 * this.e6 / 3072;
		};
		this.init();

    this.computeSVY21 = function(lat, lon){
        //Returns a pair (N, E) representing Northings and Eastings in SVY21.

        var latR = lat * Math.PI / 180;
        var sinLat = Math.sin(latR);
        var sin2Lat = sinLat * sinLat;
        var cosLat = Math.cos(latR);
        var cos2Lat = cosLat * cosLat;
        var cos3Lat = cos2Lat * cosLat;
        var cos4Lat = cos3Lat * cosLat;
        var cos5Lat = cos4Lat * cosLat;
        var cos6Lat = cos5Lat * cosLat;
        var cos7Lat = cos6Lat * cosLat;

        var rho = this.calcRho(sin2Lat);
        var v = this.calcV(sin2Lat);
        var psi = v / rho;
        var t = Math.tan(latR);
        var w = (lon - this.oLon) * Math.PI / 180;

        var M = this.calcM(lat);
        var Mo = this.calcM(this.oLat);

        var w2 = w * w;
        var w4 = w2 * w2;
        var w6 = w4 * w2;
        var w8 = w6 * w2;

        var psi2 = psi * psi;
        var psi3 = psi2 * psi;
        var psi4 = psi3 * psi;

        var t2 = t * t;
        var t4 = t2 * t2;
        var t6 = t4 * t2;

        //	Compute Northing
        var nTerm1 = w2 / 2 * v * sinLat * cosLat;
        var nTerm2 = w4 / 24 * v * sinLat * cos3Lat * (4 * psi2 + psi - t2);
        var nTerm3 = w6 / 720 * v * sinLat * cos5Lat * ((8 * psi4) * (11 - 24 * t2) - (28 * psi3) * (1 - 6 * t2) + psi2 * (1 - 32 * t2) - psi * 2 * t2 + t4);
        var nTerm4 = w8 / 40320 * v * sinLat * cos7Lat * (1385 - 3111 * t2 + 543 * t4 - t6);
        var N = this.oN + this.k * (M - Mo + nTerm1 + nTerm2 + nTerm3 + nTerm4);

        //	Compute Easting
        var eTerm1 = w2 / 6 * cos2Lat * (psi - t2);
        var eTerm2 = w4 / 120 * cos4Lat * ((4 * psi3) * (1 - 6 * t2) + psi2 * (1 + 8 * t2) - psi * 2 * t2 + t4);
        var eTerm3 = w6 / 5040 * cos6Lat * (61 - 479 * t2 + 179 * t4 - t6);
        var E = this.oE + this.k * v * w * cosLat * (1 + eTerm1 + eTerm2 + eTerm3);

        return {N:N, E:E};
		};

		
		
		this.calcM = function(lat, lon){
        var latR = lat * Math.PI / 180;
        return this.a * ((this.A0 * latR) - (this.A2 * Math.sin(2 * latR)) + (this.A4 * Math.sin(4 * latR)) - (this.A6 * Math.sin(6 * latR)));
		};
				
    this.calcRho = function(sin2Lat){
        var num = this.a * (1 - this.e2);
        var denom = Math.pow(1 - this.e2 * sin2Lat, 3. / 2.);
        return num / denom;
		};

    this.calcV = function(sin2Lat){
        var poly = 1 - this.e2 * sin2Lat;
        return this.a / Math.sqrt(poly);
		};
		
		
		
    this.computeLatLon = function(N, E){
        //	Returns a pair (lat, lon) representing Latitude and Longitude.
        

        var Nprime = N - this.oN;
        var Mo = this.calcM(this.oLat);
        var Mprime = Mo + (Nprime / this.k);
        var n = (this.a - this.b) / (this.a + this.b);
        var n2 = n * n;
        var n3 = n2 * n;
        var n4 = n2 * n2;
        var G = this.a * (1 - n) * (1 - n2) * (1 + (9 * n2 / 4) + (225 * n4 / 64)) * (Math.PI / 180);
        var sigma = (Mprime * Math.PI) / (180. * G);
        
        var latPrimeT1 = ((3 * n / 2) - (27 * n3 / 32)) * Math.sin(2 * sigma);
        var latPrimeT2 = ((21 * n2 / 16) - (55 * n4 / 32)) * Math.sin(4 * sigma);
        var latPrimeT3 = (151 * n3 / 96) * Math.sin(6 * sigma);
        var latPrimeT4 = (1097 * n4 / 512) * Math.sin(8 * sigma);
        var latPrime = sigma + latPrimeT1 + latPrimeT2 + latPrimeT3 + latPrimeT4;

        var sinLatPrime = Math.sin(latPrime);
        var sin2LatPrime = sinLatPrime * sinLatPrime;

        var rhoPrime = this.calcRho(sin2LatPrime);
        var vPrime = this.calcV(sin2LatPrime);
        var psiPrime = vPrime / rhoPrime;
        var psiPrime2 = psiPrime * psiPrime;
        var psiPrime3 = psiPrime2 * psiPrime;
        var psiPrime4 = psiPrime3 * psiPrime;
        var tPrime = Math.tan(latPrime);
        var tPrime2 = tPrime * tPrime;
        var tPrime4 = tPrime2 * tPrime2;
        var tPrime6 = tPrime4 * tPrime2;
        var Eprime = E - this.oE;
        var x = Eprime / (this.k * vPrime);
        var x2 = x * x;
        var x3 = x2 * x;
        var x5 = x3 * x2;
        var x7 = x5 * x2;

        // Compute Latitude
        var latFactor = tPrime / (this.k * rhoPrime);
        var latTerm1 = latFactor * ((Eprime * x) / 2);
        var latTerm2 = latFactor * ((Eprime * x3) / 24) * ((-4 * psiPrime2) + (9 * psiPrime) * (1 - tPrime2) + (12 * tPrime2));
        var latTerm3 = latFactor * ((Eprime * x5) / 720) * ((8 * psiPrime4) * (11 - 24 * tPrime2) - (12 * psiPrime3) * (21 - 71 * tPrime2) + (15 * psiPrime2) * (15 - 98 * tPrime2 + 15 * tPrime4) + (180 * psiPrime) * (5 * tPrime2 - 3 * tPrime4) + 360 * tPrime4);
        var latTerm4 = latFactor * ((Eprime * x7) / 40320) * (1385 - 3633 * tPrime2 + 4095 * tPrime4 + 1575 * tPrime6);
        var lat = latPrime - latTerm1 + latTerm2 - latTerm3 + latTerm4;

        // Compute Longitude
        var secLatPrime = 1. / Math.cos(lat);
        var lonTerm1 = x * secLatPrime;
        var lonTerm2 = ((x3 * secLatPrime) / 6) * (psiPrime + 2 * tPrime2);
        var lonTerm3 = ((x5 * secLatPrime) / 120) * ((-4 * psiPrime3) * (1 - 6 * tPrime2) + psiPrime2 * (9 - 68 * tPrime2) + 72 * psiPrime * tPrime2 + 24 * tPrime4);
        var lonTerm4 = ((x7 * secLatPrime) / 5040) * (61 + 662 * tPrime2 + 1320 * tPrime4 + 720 * tPrime6);
        var lon = (this.oLon * Math.PI / 180) + lonTerm1 - lonTerm2 + lonTerm3 - lonTerm4;

        return {lat: lat / (Math.PI / 180), lon: lon / (Math.PI / 180)};
		};

});


