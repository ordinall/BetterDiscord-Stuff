/**
 * @name SpotifyStatus
 * @author ordinall
 * @authorId 374663636347650049
 * @version 1.0.0
 * @description Shows the song name in status as "Listening to xxxx" instead of default "Listening to Spotify"
 * @source https://github.com/ordinall/BetterDiscord-Stuff/tree/master/Plugins/SpotifyStatus/
 * @updateUrl https://raw.githubusercontent.com/ordinall/BetterDiscord-Stuff/master/Plugins/SpotifyStatus/SpotifyStatus.plugin.js
 */

module.exports = (_ => {
    const config = {
        "info": {
            "name": "SpotifyStatus",
            "authors": [{
                "name": "ordinall",
                "discord_id": "374663636347650049",
                "github_username": "ordinall",
            }],
            "version": "1.0.0",
            "description": "Shows the song name in status as \"Listening to xxxx\" instead of default \"Listening to Spotify\"",
            "github": "https://github.com/ordinall/BetterDiscord-Stuff/tree/master/Plugins/SpotifyStatus/",
            "github_raw": "https://raw.githubusercontent.com/ordinall/BetterDiscord-Stuff/master/Plugins/SpotifyStatus/SpotifyStatus.plugin.js"
        },
        "main": "index.js"
    };
    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal(
                "Library plugin is needed",
                [`The library plugin needed for ${config.info.name} is missing. Please click Download to install it.`], 
                {
                    confirmText: "Download",
                    cancelText: "Cancel",
                    onConfirm: () => {
                        require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                            if (error) {
                                return BdApi.showConfirmationModal("Error Downloading",
                                    [
                                        "Library plugin download failed. Manually install plugin library from the link below.",
                                        BdApi.React.createElement("a", { href: "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", target: "_blank" }, "Plugin Link")
                                    ],
                                );
                            }
                            await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                        });
                    }
                }
            );
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {
            const { Patcher, WebpackModules } = Library;
            return class SpotifyStatus extends Plugin {
                constructor() {
                    super();
                }

                start() {
                    Patcher.after(WebpackModules.getByIndex(663953), "default", (_, [activities, t], res) => {
                        if(Array.isArray(res) && res.length == 2 && res[0] == "Listening to ") {
                            for(const activity of activities){
                                if(activity.type == 2) {
                                    res[1].props.children[0] = activity.details;
                                    return res;
                                }
                            }
                        }
                    });
                }

                stop() {
                    Patcher.unpatchAll()
                }
            };
        };
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();