/**
 * @name DisableStickerSuggestions
 * @author ordinall
 * @authorId 374663636347650049
 * @version 1.2.0
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
			"version": "1.2.0",
			"description": "Disables sticker suggestions while typing messages and emotes in chat",
			"github": "https://github.com/ordinall/BetterDiscord-Stuff/tree/master/Plugins/DisableStickerSuggestions/",
			"github_raw": "https://raw.githubusercontent.com/ordinall/BetterDiscord-Stuff/master/Plugins/DisableStickerSuggestions/DisableStickerSuggestions.plugin.js"
		},
		"changelog": [
			{
				"title": "v1.2.0",
				"items": [
					"Fixed a problem which was introduced by discord",
					"Now the plugin settings and discord settings for sticker suggestion while typing are synced"
				]
			},
			{
				"title": "v1.1.1",
				"items": [
					"Fixed some text area still showing the sticker suggestions context menu entry (thanks again @Farcrada)"
				]
			},
			{
				"title": "v1.1.0",
				"items": [
					"Added support for another type of sticker suggestions i.e. when typing a message. (see plugin settings)",
					"Added a settings panel to toggle both suggestion types",
					"Removed sticker suggestion context menu entry (thanks @Farcrada)"
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
		defaultConfig: [
			{
				type: "switch",
				name: "Disable Sticker Suggestions while typing an emote",
				id: "disableEmojiSuggestions",
				value: true
			},
			{
				type: "switch",
				name: "Disable Sticker Suggestions while typing a messsage",
				id: "disableMessageSuggestions",
				value: true
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
			const { Patcher, WebpackModules, Settings, DiscordModules } = Library;
			return class DisableStickerSuggestions extends Plugin {
				constructor() {
					super();
				}

				start() {
					Patcher.after(WebpackModules.find(m => m?.default?.displayName === "SlateTextAreaContextMenu"), "default", (_, [a,b,c], result) => { 
						result.props.children.splice(0, 1);
					});
					Patcher.after(WebpackModules.find(m => m?.default?.displayName === "NativeTextAreaContextMenu"), "default", (_, [a,b,c], result) => { 
						result.props.children.splice(0, 1);
					});
					this.expressionModule = WebpackModules.getByProps("expressionSuggestionsEnabled");
					this.applyPatches();
				}

				applyPatches() {
					if (this.settings.disableEmojiSuggestions) {
						this.removeEmojiPatch = Patcher.after(WebpackModules.getByProps("queryStickers"), "queryStickers", (_, [a,b,c], result) => { 
							if ( !(c == undefined || c == null) ) {
								return { stickers : [] };
							} else {
								return result;
							}
						});
					}
					if(this.settings.disableMessageSuggestions == this.expressionModule.expressionSuggestionsEnabled) {
						let { ActionTypes: { EXPRESSION_SUGGESTIONS_TOGGLE: type } } =  DiscordModules.DiscordConstants;
						DiscordModules.Dispatcher.dispatch({
							type
						});
					}
				}

				removePatches() {
					this.removeEmojiPatch();
				}

				getSettingsPanel() {
					this.settings.disableMessageSuggestions = !this.expressionModule.expressionSuggestionsEnabled;
					const panel = this.buildSettingsPanel();
					panel.addListener(() => {
						this.removePatches();
						this.applyPatches();
					});
					return panel.getElement();
				}

				stop() {
					Patcher.unpatchAll()
				}
			};
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();