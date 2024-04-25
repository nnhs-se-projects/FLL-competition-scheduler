import { mergeStructure } from "../src/mergeStructure.js";

let maps = mergeStructure();
let times = [];
const seshDuration = 15;
const runDuration = 10;
let valid = true;

for (let i = 0; i < maps.length; i++) {
  times.add(maps[i].get("sesh1"));
  times.add(maps[i].get("sesh2"));
  times.add(maps[i].get("run1"));
  times.add(maps[i].get("run2"));
  times.add(maps[i].get("run3"));

  // check between each session and then the three runs
}
