function test(child) {
  let failures = 0;
  try {
    for (let t = 1; t < child.length + 1; t++) {
      let temp = [];
      for (let i = 0; i < child.length; i++) {
        for (let j = 0; j < child[i].length; j++) {
          if (child[i][j].name === "team" + t) {
            let arr = [i, j, child[i][j]];
            temp.push(arr);
          }
        }
      }
      if (temp.length !== 3) {
        failures++;
      }
    }
  } catch (e) {
    console.log("Error in test");
    console.log(child);
  }
  if (failures > 0) {
    return "Failures";
  } else {
    return "All tests passed!";
  }
}

export { test };
