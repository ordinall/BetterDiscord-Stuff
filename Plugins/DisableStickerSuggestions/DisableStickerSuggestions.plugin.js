/**
 * @name DisableStickerSuggestions
 * @author ordinall
 * @authorId 374663636347650049
 * @version 1.0.0
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
			"version": "1.0.0",
			"description": "Disables sticker suggestions when typing emotes in the chat",
			"github": "https://github.com/ordinall/BetterDiscord-Stuff/tree/master/Plugins/DisableStickerSuggestions/",
			"github_raw": "https://raw.githubusercontent.com/ordinall/BetterDiscord-Stuff/master/Plugins/DisableStickerSuggestions/DisableStickerSuggestions.plugin.js"
		},
		"changelog": [
			{
				"title": "Initial Release",
				"type": "added",
				"items": [
					"This is the first release of the plugin :)"
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
			const title = "Library Missing";
			const ModalStack = BdApi.findModuleByProps("push", "update", "pop", "popWithKey");
			const TextElement = BdApi.findModuleByProps("Sizes", "Weights");
			const ConfirmationModal = BdApi.findModule(m => m.defaultProps && m.key && m.key() == "confirm-modal");
			if (!ModalStack || !ConfirmationModal || !TextElement) return BdApi.alert(title, `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
			ModalStack.push(function(props) {
				return BdApi.React.createElement(ConfirmationModal, Object.assign({
					header: title,
					children: [BdApi.React.createElement(TextElement, {color: TextElement.Colors.PRIMARY, children: [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`]})],
					red: false,
					confirmText: "Download Now",
					cancelText: "Cancel",
					onConfirm: () => {
						require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
							if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
							await new Promise(r => require("fs").writeFile(require("path").join(ContentManager.pluginsFolder, "0PluginLibrary.plugin.js"), body, r));
						});
					}
				}, props));
			});
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
					})
				}

				stop() {
					Patcher.unpatchAll()
				}
			};
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();