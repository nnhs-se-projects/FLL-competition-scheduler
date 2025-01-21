import {
  createFullSchedule,
  printSchedule,
  scoreSchedule,
} from "./fullRandomSchedule.js";

for (let i = 0; i < 100; i++) {
  console.log("Test " + i);
  let schedule = createFullSchedule();
  console.log("schedule score: " + scoreSchedule(schedule));
  printSchedule(schedule);
}
console.log("test passed");
