function loadLocalization() {
  chrome.storage.sync.get({ useLanguage: "en" }, function (result) {
    $("[data-localize]").localize("localization/application", {
      language: result.useLanguage,
    });

    const elements = Array.from(document.querySelectorAll("[data-localize]"));
    for (const e of elements) {
      const text = e.dataset.i18n;
      e.textContent = translate(text);
    }
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

document.addEventListener("DOMContentLoaded", loadLocalization);
