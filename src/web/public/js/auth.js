/**
 * Sends the credentials from the Google Sign-In popup to the server for authentication
 *
 * @param {Object} res - the response object from the Google Sign-In popup
 */

// eslint-disable-next-line no-unused-vars
async function handleCredentialResponse(res) {
  const response = await fetch("/auth", {
    // send the googleUser's id_token which has all the data we want to the server with a POST request
    method: "POST",
    body: JSON.stringify({
      credential: res.credential,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Check if the response contains a redirect URL
  if (response.ok) {
    try {
      const data = await response.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        window.location.href = "/overview";
      }
    } catch (e) {
      // If response is not JSON, redirect to overview
      window.location.href = "/overview";
    }
  } else {
    window.location.href = "/overview";
  }
}
