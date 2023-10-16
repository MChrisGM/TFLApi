
class Route {
  constructor(obj){
    this.name = obj.name;
    this.direction = obj.direction;
    this.origin = obj.originationName;
    this.destination = obj.destinationName;
    this.type = obj.serviceType;
    this.originCode = obj.originator;
    this.destinationCode = obj.destination;
  }
}

class Tube {
  constructor(obj) {
    this.id = obj.id;
    this.name = obj.name;
    this.type = obj.modeName;
    this.disruptions = obj.disruptions;
    this.routes = obj.routeSections.map(route => new Route(route))
    this.trains = {};
  }
}

class Train {
  constructor(obj){
    this.id = obj.vehicleId;
    this.naptanId = obj.naptanId;
    this.stationName = obj.stationName;
    this.lineId = obj.lineId;
    this.platformName = obj.platformName;
    this.eta = obj.timeToStation;
    this.location = obj.currentLocation;
    this.towards = obj.towards;
    this.destination = obj.destinationName;
    this.destinationId = obj.destinationNaptanId;
    this.expected = obj.expectedArrival;
    this.type = obj.modeName;
  }
}

async function getInfo(){
  let tubes = await getTubes();
  let trains = {};
  for(let line of Object.values(tubes)){
    let data = await getTrains(line.id);
    if(data.statusCode == 429){
      console.log(data.message);
    }
    if(data.length > 0){
      for (let train of data){
        trains[train.naptanId] = new Train(train);
        tubes[trains[train.naptanId].lineId].trains[trains[train.naptanId].naptanId] = trains[train.naptanId];
      }
    }
  }
  return {tubes, trains};
}

function getTubes() {
  let url = "https://api.tfl.gov.uk/Line/Mode/tube/Route"
  let objects = {};
  return new Promise((resolve, reject) => {
    try{
      fetch(url)
      .then(res => res.json())
      .then(data => {
        if(data.length >0){
          data.forEach(route => {
            let routeObj = new Tube(route);
            objects[routeObj.id] = routeObj;
          })
          resolve(objects);
        }
      })
      .catch(err => {
        reject(err);
      })}
    catch(err){
      console.log(err);
    }
  });
}

function getTrains(id){
  let url = "https://api.tfl.gov.uk/Line/"+id+"/Arrivals"
  return new Promise((resolve, reject) => {
    try{
      fetch(url)
      .then(res => res.json())
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      })}
    catch(err){
      console.log(err);
    }
  });
}

async function parseTubes(){
  let tubes = await getTubes();
  return tubes
}

async function parseTrains(){
  let trains = {};
  for(let line of Object.values(tubes)){
    let data = await getTrains(line.id);
    if(data.statusCode == 429){
      console.log(data.message);
    }
    if(data.length > 0){
      for (let train of data){
        trains[train.naptanId] = new Train(train);
        tubes[trains[train.naptanId].lineId].trains[trains[train.naptanId].naptanId] = trains[train.naptanId];
      }
    }
  }
  return trains;
}

const express = require('express')
const app = express()
const port = 3000

let tubes = {};
let trains = {};

app.use(express.static('public'))

app.post('/tubes', (req, res) => {
  res.json(tubes)
})

app.listen(port, async() => {
  console.log(`App running on port ${port}`)

  let info = await getInfo();
  tubes = info.tubes;
  trains = info.trains;

  let updateTubes = setInterval( async () => {
    tubes = await parseTubes();
  }, 60 * 1000);

  let updateTrains = setInterval( async () => {
    trains = await parseTrains();
  }, 15 * 1000);

  // setInterval(() => {
  //   console.log("------------------Update------------------");
  //   console.log(tubes);

  // }, 3000);
})

