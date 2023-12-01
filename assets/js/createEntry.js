/**
 * contains client-side JavaScript function
 *  (primarily event handlers to fetch data from the Node server)
 */

const submitButton = document.querySelector("input.submit");
submitButton.addEventListener("click", () => {
  // get the values entered by the user
  const date = document.querySelector("input.date").value;
  const habitOfMind = document.querySelector("input.HoM").value;
  const content = document.querySelector("textarea.content").value;
  console.log(date + "; " + habitOfMind + "; " + content);

  // for now, redirect to the home page
  window.location = "/";
});
