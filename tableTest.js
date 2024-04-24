import { test } from "./test.js";
function tableTest(oldPool, POPULATION) {
  let grade = [];
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
        Math.abs(arr[0] - arr[1]) > 3 &&
        Math.abs(arr[0] - arr[2]) > 3 &&
        Math.abs(arr[1] - arr[2]) > 3
      ) {
        individualGrade++;
      } else {
        invalid = 0;
      }
    }

    grade.push(individualGrade);
  }
  return grade;
}

export { tableTest };
