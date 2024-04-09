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
