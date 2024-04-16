//import { name } from "ejs";
import { randomJS } from "./randomJudgingSesh.js";

let js = randomJS();
console.log("random JS:");
console.log(js);

console.log("random JS formatted: ");
for (let i = 0; i < 4; i++) {
  console.log(
    `Robot Room ${i + 1}: ${js[i].map((team) => team.name).join(", ")}`
  );
}
for (let i = 0; i < 4; i++) {
  console.log(
    `Project Room ${i + 1}: ${js[i + 4].map((team) => team.name).join(", ")}`
  );
}

let obj1 = { name: "team1" };
let obj2 = { name: "team2" };
let obj3 = { name: "team1" };
console.log(obj1.name == obj3.name);
console.log(obj1.name == obj2.name);

let array1 = [obj1, obj2, obj3];
let obj4 = { name: "team2" };
let obj5 = { name: "team3" };

if (array1.some((e) => e.name === obj4.name)) {
  console.log(array1.findIndex((e) => e.name == obj4.name));
}
if (array1.some((e) => e.name === obj5.name)) {
  console.log(array1.findIndex((e) => e.name == obj5.name));
}
