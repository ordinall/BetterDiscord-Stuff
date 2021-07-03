/**
 * @name SpotifyListenAlong
 * @author ordinall
 * @authorId 374663636347650049
 * @version 1.0.1
 * @description Enables Spotify Listen Along feature on Discord without Premium
 * @source https://github.com/ordinall/BetterDiscord-Stuff/tree/master/Plugins/SpotifyListenAlong/
 * @updateUrl https://raw.githubusercontent.com/ordinall/BetterDiscord-Stuff/master/Plugins/SpotifyListenAlong/SpotifyListenAlong.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "SpotifyListenAlong",
			"authors": [{
				"name": "ordinall",
				"discord_id": "374663636347650049",
				"github_username": "ordinall",
			}],
			"version": "1.0.1",
			"description": "Enables Spotify Listen Along feature on Discord without Premium",
			"github": "https://github.com/ordinall/BetterDiscord-Stuff/tree/master/Plugins/SpotifyListenAlong/",
			"github_raw": "https://raw.githubusercontent.com/ordinall/BetterDiscord-Stuff/master/Plugins/SpotifyListenAlong/SpotifyListenAlong.plugin.js"
		},
		"changelog": [
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
			const { DiscordModules, Patcher, WebpackModules } = Library;
			return class SpotifyListenAlong extends Plugin {
				constructor() {
					super();
				}

				start() {
					const { ActionTypes: { SPOTIFY_PROFILE_UPDATE: type } } = DiscordModules.DiscordConstants
					Patcher.instead(DiscordModules.DeviceStore, 'getProfile', ( _, [id, t] ) =>
						DiscordModules.Dispatcher.dispatch({
							type,
							accountId: id,
							isPremium: true
						})
					)
					Patcher.instead(WebpackModules.getByProps("isSpotifyPremium"), 'isSpotifyPremium', () => true)
				}

				stop() {
					Patcher.unpatchAll()
				}
			};
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();