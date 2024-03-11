function gradeTables(oldPool, POPULATION) {
  let grade = [];
  for (let i = 0; i < POPULATION; i++) {
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
    if (invalid === 1) {
      grade.push(individualGrade);
    } else {
      grade.push(0);
    }
  }
  return grade;
}

export { gradeTables };
