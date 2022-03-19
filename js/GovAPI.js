//api url so you add the query at the back of the link
  const api_url = 'https://data.gov.sg/api/action/datastore_search?resource_id=139a3035-e624-4f56-b63f-89ae28d4ae4c&q=BLK 512 HOUGANG AVENUE 10';

//function to send request
  async function getData(){
    const response = await fetch(api_url);
    const data = await response.json();

    //basically assigning the variables to the attributes in the data table for ease of access
    const{address, car_park_basement, car_park_decks, car_park_no, car_park_type, free_parking, gantry_height, night_parking, _full_count } = data.result.records[0];

    //To get the text into the actual website (PS idk how to make this part shorter lmao looks like cancer)
    document.getElementById('add').textContent = address;
    document.getElementById('basement').textContent = car_park_basement;
    document.getElementById('deck').textContent = car_park_decks;
    document.getElementById('num').textContent = car_park_no;
    document.getElementById('type').textContent = car_park_type;
    document.getElementById('free').textContent = free_parking;
    document.getElementById('height').textContent = gantry_height;
    document.getElementById('night').textContent = night_parking;
    document.getElementById('full').textContent = _full_count;

    console.log(data.result);
    //This part gives you ALL the records in a query (in an array of like 40+ results)
    console.log(data.result.records);

    //To filter out the first result in the array to work with
    console.log(data.result.records[0]);

    //To get a particular attribute (ie address) out of the first record (ie record [0])
    console.log(data.result.records[0].address);

  }


  getData();
