/**
 * Client-side JavaScript for authentication
 */

// This function is called when the Google Sign-In button is clicked
async function handleCredentialResponse(response) {
  // Send the credential to the server
  const res = await fetch("/auth/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      credential: response.credential,
    }),
  });

  // Check if the response contains a redirect URL
  if (res.ok) {
    try {
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        window.location.href = "/overview";
      }
    } catch (e) {
      // If response is not JSON, just redirect to overview
      window.location.href = "/overview";
    }
  }
}
