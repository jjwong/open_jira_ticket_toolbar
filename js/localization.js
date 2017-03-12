function loadLocalization() {
  chrome.storage.sync.get({"useLanguage": "en" }, function (result) {
    $("[data-localize]").localize("localization/application", { language: result.useLanguage });
  });
}

function removeError() {
  if (document.getElementById("error")) {
    document.getElementById("error").remove();
  }
}

function removeSuccess() {
  if (document.getElementById("success")) {
    document.getElementById("success").remove();
  }
}