import { test } from "./test.js";
function gradeTables(oldPool, POPULATION) {
  let grade = [];
  if (oldPool.length !== POPULATION) {
    console.log("Shock");
  }
  for (let i = 0; i < oldPool.length; i++) {
    let individualGrade = 0;
    let invalid = 1;
    for (let t = 1; t < 33; t++) {
      let arr = [];
      for (let j = 0; j < oldPool[i].length; j++) {
        for (let k = 0; k < oldPool[i][j].length; k++) {
          if (oldPool[i][j][k].name === "team" + t) {
            arr.push(k);
          }
        }
      }
      if (
        Math.abs(arr[0] - arr[1]) > 1 &&
        Math.abs(arr[0] - arr[2]) > 1 &&
        Math.abs(arr[1] - arr[2]) > 1
      ) {
        individualGrade++;
      } else {
        invalid = 0;
      }
    }
    var test1 = test(oldPool[i]);
    if (test1.includes("Failures")) {
      invalid = 0;
      console.log("failed in grade");
    }
    grade.push(individualGrade);
  }
  return grade;
}

export { gradeTables };
