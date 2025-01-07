import { test } from "./test.js";
function gradeTables(oldPool, POPULATION) {
  let grade = [];
  for (let i = 0; i < oldPool.length; i++) {
    let individualGrade = 0;
    for (let t = 1; t < 33; t++) {
      let arr = [];
      let arr2 = [];
      let invalid = 1;
      for (let j = 0; j < oldPool[i].length; j++) {
        for (let k = 0; k < oldPool[i][j].length; k++) {
          if (oldPool[i][j][k].name === "team" + t) {
            arr.push(k);
            arr2.push(j);
          }
        }
      }

      // CHECK IF VALID SCHEDULE
      if (
        Math.abs(arr[0] - arr[1]) > 3 &&
        Math.abs(arr[0] - arr[2]) > 3 &&
        Math.abs(arr[1] - arr[2]) > 3
      ) {
        individualGrade +=
          Math.abs(arr[0] - arr[1]) +
          Math.abs(arr[0] - arr[2]) +
          Math.abs(arr[1] - arr[2]);
      } else {
        invalid = 0;
      }
      // CHECK DIFFERENT TABLES
      if (arr2[0] === arr2[1] && arr2[1] === arr2[2] && arr2[2] === arr2[0]) {
        invalid = 0;
      } else if (
        arr2[0] === arr2[1] ||
        arr2[1] === arr2[2] ||
        arr2[2] === arr2[0]
      ) {
        individualGrade -= 2;
      } else {
        individualGrade += 3;
      }
      individualGrade = Math.floor(individualGrade / 2);
      if (invalid === 0) {
        individualGrade = 0;
      }
    }
    grade.push(individualGrade);
  }
  return grade;
}

export { gradeTables };
