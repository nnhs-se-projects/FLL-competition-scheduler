import { randomMerge } from "./mergedSchedule.js";

function testRandomMerge() {
  let maps = randomMerge();
  const seshDuration = 15;
  let valid = true;

  for (let i = 0; i < maps.length; i++) {
    let times = [];
    times.push(maps[i].get("sesh1"));
    times.push(maps[i].get("sesh2"));
    times.push(maps[i].get("run1"));
    times.push(maps[i].get("run2"));
    times.push(maps[i].get("run3"));

    for (let k = 0; k < 3; k++) {
      let difference1 = Math.abs(times[0] - times[2 + k]);
      let difference2 = Math.abs(times[1] - times[2 + k]);
      if (difference1 < seshDuration || difference2 < seshDuration) {
        valid = false;
      }
    }
    if (valid === false) {
      break;
    }
  }

  return valid;
}

for (let i = 0; i < 1000; i++) {
  let test = testRandomMerge();
  if (test === true) {
    console.log(maps);
  }
}
