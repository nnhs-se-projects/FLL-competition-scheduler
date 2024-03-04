function gradeTables(newPool, POPULATION) {
  let grade = [];
  for (let i = 0; i < POPULATION; i++) {
    for (let t = 1; t < 33; i++) {
      let arr = [];
      let individualGrade = 0;
      for (let j = 0; j < newPool[i].length; j++) {
        for (let k = 0; k < newPool[i][j].length; k++) {
          if (newPool[i][j][k].name === "team" + t) {
            arr.push(k);
          }
        }
      }
      if (
        Math.abs(arr[0] - arr[1]) > 2 &&
        Math.abs(arr[0] - arr[2]) > 2 &&
        Math.abs(arr[1] - arr[2]) > 2
      ) {
        individualGrade += 1;
      } else {
        grade.push(0);
      }
    }
    grade.push(individualGrade);
  }
  return grade;
}

export { gradeTables };
