//javascript for carpark card displays (incl govAPIRef code)
myStorage = window.localStorage;
const app = document.getElementById('carparkDisplays')

const container = document.createElement('div')
container.setAttribute('class', 'container')
 
app.appendChild(container)
const hMap = new Map(); //creating hashmap

// const api_url = 'https://data.gov.sg/api/action/datastore_search?resource_id=139a3035-e624-4f56-b63f-89ae28d4ae4c&'
const api_url = 'https://data.gov.sg/api/action/datastore_search?resource_id=139a3035-e624-4f56-b63f-89ae28d4ae4c&limit=5000'
//function to send request
  async function getData(){
    const response = await fetch(api_url);
    const data = await response.json();
    //console.log(data);
    //basically assigning the variables to the attributes in the data table for ease of access
    const{address, car_park_basement, car_park_decks, car_park_no, car_park_type, free_parking, gantry_height, night_parking, _full_count } = data.result.records[0];

    

    //create new request
    var request = new XMLHttpRequest()

    //open reequest line to API and limit to 10 records
    request.open('GET','https://api.data.gov.sg/v1/transport/carpark-availability', true);

    //access the JSON data
    request.onload = function () {
      var data1 = JSON.parse(this.response);
      // console.log(data1.items[0].carpark_data[0].carpark_info[0].lots_available + '1st'); //2nd api change carpark_data[i] for the array
      // console.log(data.result.records[0]); //1st api change records[i] for the array

      let len1 = data.result.records.length; //length of first api
      let len2 = data1.items[0].carpark_data.length; //length of second api
      console.log(len1); //34 for 478 YISHUN ST 42
      console.log(len2); //1963

      //hashmap to store all the carparks that have exceptions in carpark pricing
      const centralcpark= new Map();
      centralcpark.set('ACB', 0);
      centralcpark.set('BBB', 1);
      centralcpark.set('BRB1',2);
      centralcpark.set('CY', 3);
      centralcpark.set('DUXM', 4);
      centralcpark.set('HLM', 5);
      centralcpark.set('KAB', 6);
      centralcpark.set('KAM', 7);
      centralcpark.set('KAS', 8);
      centralcpark.set('PRM', 9);
      centralcpark.set('SLS', 10);
      centralcpark.set('SR1', 11);
      centralcpark.set('SR2', 12);
      centralcpark.set('TPM', 13);
      centralcpark.set('UCS', 14);
      centralcpark.set('WCB', 15);

      const removerepeats= new Map();
      for(let i=0; i<len2;i++){ //adding the data of second API into hMap-> key: carpark num & value = index of element in array
        hMap.set(data1.items[0].carpark_data[i].carpark_number,i); //data1.items[0].carpark_data[i].carpark_number
      }

      const firstAPIhmap = new Map();
      for (let i=0; i<len1;i++){
        firstAPIhmap.set(data.result.records[i].car_park_no, i);
      }

      for(let u=0; u<markers.length; u++){  // for how many markers are shown
        console.log('test for marker' + u);
        
        tempcarparkindex= firstAPIhmap.get(markers[u].title);

          let cNum = data.result.records[tempcarparkindex].car_park_no;
          if (cNum == markers[u].title){
            if(removerepeats.get(cNum)!=null)
            continue;
          removerepeats.set(data.result.records[tempcarparkindex].car_park_no,tempcarparkindex);
          localStorage.setItem(data.result.records[tempcarparkindex].car_park_no,tempcarparkindex);
          let index = hMap.get(cNum); 

          if(index==null)
            continue;

          const card = document.createElement('div')
          card.setAttribute('class', 'card')
          card.setAttribute('id', cNum)
          container.appendChild(card)

          card.addEventListener("click",function(){ clickHandler(card.id); });

          //creating 3diff divs-header, body, footer + the lines in between
          const header = document.createElement('div');
          header.setAttribute('class','header');
  
          const body = document.createElement('div');
          body.setAttribute('class','body');
        
          const footer = document.createElement('div');
          footer.setAttribute('class','footer');
  
          const hr1 = document.createElement('hr');
          const hr2 = document.createElement('hr');
          
          card.appendChild(header);
          card.appendChild(hr1);
          card.appendChild(body);
          card.appendChild(hr2);
          card.appendChild(footer);
  

          //header content
          const cName = document.createElement('h1');
          const cAvail = document.createElement('h1');
          cName.textContent = data.result.records[tempcarparkindex].car_park_no
          cAvail.textContent = data1.items[0].carpark_data[index].carpark_info[0].lots_available +' spaces'
          
          header.appendChild(cName)
          header.appendChild(cAvail)    
        

          //body content
          const bodyL = document.createElement('div')
          bodyL.setAttribute('class','bodyL')
          const bodyR = document.createElement('div')
          bodyR.setAttribute('class','bodyR')
          body.appendChild(bodyL)
          body.appendChild(bodyR)

          //bodyL
          let index1= centralcpark.get(cNum);
          if(index1==null)
          {
          const cPrice=document.createElement('h1')
          cPrice.setAttribute('style','white-space: pre;')
          cPrice.textContent="$0.60\r\n30mins"
          cPrice.setAttribute('class', 'cPrice')
          bodyL.appendChild(cPrice);
          }
          else
          {
          const cPrice=document.createElement('h1');
          cPrice.setAttribute('style','white-space: pre;')
          cPrice.textContent=`$1.20\r\n30mins (Mon to Sat 7am to 5pm)
                              $0.60\r\n30mins (Other hours)`;
                              cPrice.setAttribute('class', 'cPrice')
                              bodyL.appendChild(cPrice);
          }

          //bodyR
          //walking icon
          const walkingIcon = document.createElement('img')
          walkingIcon.src = 'https://img.favpng.com/11/19/25/logo-walking-symbol-clip-art-png-favpng-uBp8dvZ4FWCLZKf9DRijTa36a.jpg'
          walkingIcon.setAttribute('class', 'walkingIcon')
          bodyR.appendChild(walkingIcon);
        
          //text 
          const walkDist = document.createElement('h1')
          walkDist.setAttribute('style','white-space: pre;')
          walkDist.textContent='1 min\r\nto destination'
          bodyR.appendChild(walkDist);

          //footer content
          if(data.result.records[tempcarparkindex].gantry_height!=0){ //some carparks have gantry height as 0, hence we do not display the following for them
            //carpark icon
            const carIcon = document.createElement('img')
            carIcon.src = 'img/carparkHeight_icon.png'
            carIcon.setAttribute('class', 'carIcon')
            footer.appendChild(carIcon);

            //height text
            const cHeight = document.createElement('h1');
            cHeight.textContent = data.result.records[tempcarparkindex].gantry_height;
            footer.appendChild(cHeight);
          }
          }
          

        }
      
        function clickHandler(cnum){
          var i=hMap.get(cnum)
          document.getElementById('carparkDisplays').style.display = "none";
          document.getElementById('sidebarnext').style.display = "block";
          const slots=document.getElementById('slots')
          const payy=document.getElementById('payy')
          slots.textContent=data1.items[0].carpark_data[i].carpark_info[0].lots_available
          let index1= centralcpark.get(cnum);
        if(index1==null)
        {
         payy.textContent="Rates: "+"$0.60 / 30mins"
        }
        else
        {
         payy.textContent="Rates: "+`$1.20 / 30mins (Mon to Sat 7am to 5pm)
                          $0.60 / 30mins (Other hours)`;
        }
        document.getElementById('cparknumm').textContent=cnum;
        }

      }   
    request.send();
  }
getData();


