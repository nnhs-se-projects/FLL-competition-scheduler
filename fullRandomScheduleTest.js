import { createFullSchedule, score } from "./fullRandomSchedule.js";

for (let i = 0; i < 100; i++) {
  console.log("Test " + i);
  let schedule = createFullSchedule();
  if (schedule !== null) {
    if (score(schedule) == 0) {
      console.log("test failed");
    } else {
      console.log("schedule score: " + score(schedule));
    }
  } else {
    i--;
  }
}
console.log("test passed");
