let githubRepLink = "https://cheasea.github.io/alchdev/";

function loadScripts(scripts) {
  if (!scripts) return;
  if (scripts.length === 0) return;

  let link = scripts.shift();
  let script = document.createElement("script");
  script.src = githubRepLink + link;
  script.defer = true;
  document.head.appendChild(script);

  script.onload = function () {
    loadScripts(scripts);
  };
}

function versionCheck() {
  if (!settings.version) return;

  if (settings.version === "last") settings.version = "0.5.2";

  let updates = {
    "0.5.2": ["version0_5_2.js"],
    "0.6": [
      "velocity.js",
      "selection.js",
      "counterParser.js",
      "version0_6/conditions.js",
      "version0_6/alch.js",
      "version0_6/selectable.js"
    ],
  };

  let scripts = updates[settings.version];

  loadScripts(scripts);
}

versionCheck();
$("title").text(
  $("title").text().replace("Алхимия 0.5 beta", "Алхимия 0.6 beta")
);

let winterLogo = false;

if (winterLogo) {
  $("#ingamelogo").css(
    "background",
    `url('${githubRepLink}winterlogo.png') fixed left top no-repeat`
  );
}
