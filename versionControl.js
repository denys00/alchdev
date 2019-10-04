function versionCheck() {
    if (!settings.version) return;

    if (settings.version === 'last') settings.version = '0.5.2';

    var updates = {
        "0.5.2": "version0_5_2.js",
        "a0.6": "version0_6.js"
    }

    var scripts = updates[settings.version];

    if (!scripts) return;

    var script = document.createElement("script");
    script.src = "https://denys00.github.io/alchdev/" + scripts;
    script.defer = true;

    document.head.appendChild(script);
}

versionCheck();
$('title').text($('title').text().replace('Алхимия 0.5 beta', 'Алхимия 0.5.2 patched'));