import { randomTable } from "./newRandomTables.js";
import { randomJS } from "./judgingRooms/randomJudgingSesh.js";

let tables = randomTable();
let judgingRooms = randomJS();
let mapArray = [];
let t1 = new Map();
let t2 = new Map();
let t3 = new Map();
let t4 = new Map();
let t5 = new Map();
let t6 = new Map();
let t7 = new Map();
let t8 = new Map();
let t9 = new Map();
let t10 = new Map();
let t11 = new Map();
let t12 = new Map();
let t13 = new Map();
let t14 = new Map();
let t15 = new Map();
let t16 = new Map();
let t17 = new Map();
let t18 = new Map();
let t19 = new Map();
let t20 = new Map();
let t21 = new Map();
let t22 = new Map();
let t23 = new Map();
let t24 = new Map();
let t25 = new Map();
let t26 = new Map();
let t27 = new Map();
let t28 = new Map();
let t29 = new Map();
let t30 = new Map();
let t31 = new Map();
let t32 = new Map();
mapArray.push(t1);
mapArray.push(t2);
mapArray.push(t3);
mapArray.push(t4);
mapArray.push(t5);
mapArray.push(t6);
mapArray.push(t7);
mapArray.push(t8);
mapArray.push(t9);
mapArray.push(t10);
mapArray.push(t11);
mapArray.push(t12);
mapArray.push(t13);
mapArray.push(t14);
mapArray.push(t15);
mapArray.push(t16);
mapArray.push(t17);
mapArray.push(t18);
mapArray.push(t19);
mapArray.push(t20);
mapArray.push(t21);
mapArray.push(t22);
mapArray.push(t23);
mapArray.push(t24);
mapArray.push(t25);
mapArray.push(t26);
mapArray.push(t27);
mapArray.push(t28);
mapArray.push(t29);
mapArray.push(t30);
mapArray.push(t31);
mapArray.push(t32);

for (let i = 1; i < 33; i++) {
  let count = 0;
  let tableCount = 0;
  for (let room = 0; room < judgingRooms.length; room++) {
    if (judgingRooms[room].some((e) => e.name === "team" + i)) {
      let pr = judgingRooms[room].findIndex((e) => e.name == "team" + i);
      if (count == 0) {
        mapArray[i - 1].set("sesh1", judgingRooms[room][pr].startT);
        count++;
      } else if (count == 1) {
        mapArray[i - 1].set("sesh2", judgingRooms[room][pr].startT);
      }
    }
  }
  for (let k = 0; k < tables.length; k++) {
    for (let j = 0; j < tables[k].length; j++) {
      if (tables[k][j].name === "team" + i) {
        if (tableCount == 0) {
          mapArray[i - 1].set("run1", tables[k][j].start);
          tableCount++;
        } else if (tableCount == 1) {
          mapArray[i - 1].set("run2", tables[k][j].start);
          tableCount++;
        } else if (tableCount == 2) {
          mapArray[i - 1].set("run3", tables[k][j].start);
        }
      }
    }
  }
}
console.log(mapArray);
