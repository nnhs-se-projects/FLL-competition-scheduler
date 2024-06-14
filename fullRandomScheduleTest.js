import { createFullSchedule, scoreSchedule } from "./fullRandomSchedule.js";

for (let i = 0; i < 100; i++) {
  console.log("Test " + i);
  let schedule = createFullSchedule();
  console.log("schedule score: " + scoreSchedule(schedule));
}
console.log("test passed");
