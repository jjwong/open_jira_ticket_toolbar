import openNewTicket from "./main.js";

chrome.omnibox.onInputEntered.addListener((text) => {
  // Encode user input for special characters , / ? : @ & = + $ #
  openNewTicket(encodeURIComponent(text).trim(), "omnibox");
});
