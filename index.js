
class Tube {
  constructor(obj) {
    this.id = obj.id;
    this.name = obj.name;
    this.type = obj.modeName;
    this.disruptions = obj.disruptions;
    this.routes = obj.routeSections.map(route => new Route(route))
    let self = this;
    this.timings = this.getTimings(self);
  }

  getTimings(self){
    function getData(self){
      let url = "https://api.tfl.gov.uk/Line/"+self.id+"/Arrivals"
      return new Promise((resolve, reject) => {
        fetch(url)
          .then(res => res.json())
          .then(data => {
            resolve(data);
          })
          .catch(err => {
            reject(err);
          })
      });
    }
    let data = getData(self);
    return data
    
  }
}

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

function getTubes() {
  let url = "https://api.tfl.gov.uk/Line/Mode/tube/Route"
  let objects = {};
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        data.forEach(route => {
          let routeObj = new Tube(route);
          objects[routeObj.id] = routeObj;
        })
        resolve(objects);
      })
      .catch(err => {
        reject(err);
      })
  });
}

// function getTube(){
//   let url = "https://api.tfl.gov.uk/line/mode/tube"
//   return new Promise((resolve, reject) => {
//     fetch(url)
//       .then(res => res.json())
//       .then(data => {
//         resolve(data);
//       })
//       .catch(err => {
//         reject(err);
//       })
//   });
// }

async function main(){
  let tubes = await getTubes()

  // console.log(routes['bakerloo'])
  // console.log(await getTube())
  console.log(tubes)

  console.log(tubes['bakerloo'].timings)
}

main();


