/**
 * @name DisableStickerSuggestions
 * @author ordinall
 * @authorId 374663636347650049
 * @version 1.0.2
 * @description Disables sticker suggestions when typing emotes in the chat
 * @source https://github.com/ordinall/BetterDiscord-Stuff/tree/master/Plugins/DisableStickerSuggestions/
 * @updateUrl https://raw.githubusercontent.com/ordinall/BetterDiscord-Stuff/master/Plugins/DisableStickerSuggestions/DisableStickerSuggestions.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "DisableStickerSuggestions",
			"authors": [{
				"name": "ordinall",
				"discord_id": "374663636347650049",
				"github_username": "ordinall",
			}],
			"version": "1.0.2",
			"description": "Disables sticker suggestions when typing emotes in the chat",
			"github": "https://github.com/ordinall/BetterDiscord-Stuff/tree/master/Plugins/DisableStickerSuggestions/",
			"github_raw": "https://raw.githubusercontent.com/ordinall/BetterDiscord-Stuff/master/Plugins/DisableStickerSuggestions/DisableStickerSuggestions.plugin.js"
		},
		"changelog": [
			{
				"title": "v1.0.2",
				"items": [
					"Move sticker option downward under grammar options."
				]
			},
			{
				"title": "v1.0.1",
				"items": [
					"Fixed missing library modal"
				]
			},
			{
				"title": "Initial Release",
				"items": [
					"This is the initial release of the plugin :)"
				]
			}
		],
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
			return class DisableStickerSuggestions extends Plugin {
				constructor() {
					super();
				}

				start() {
					Patcher.after(WebpackModules.getByProps("queryStickers"), "queryStickers", (_, [a,b,c], result) => { 
						if ( !(c == undefined || c == null) ) {
							return { stickers : [] };
						} else {
							return result;
						}
					});
					
					//Move sticker option downward under grammar options
					Patcher.after(WebpackModules.find(m => m?.default?.displayName === "SlateTextAreaContextMenu"), "default", (_, [a,b,c], result) => { 
						//Move the option, `splice()` is in-place which is nice
            					//Index where we want it     v  v     No deletion
            					result.props.children.splice(2, 0,
                					//Remove our first option and return it ([0])
                					result.props.children.splice(0, 1)[0]);
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
