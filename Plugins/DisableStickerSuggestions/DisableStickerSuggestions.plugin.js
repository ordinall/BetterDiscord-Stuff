/**
 * @name DisableStickerSuggestions
 * @description Disables sticker suggestions while typing messages and emotes in chat
 * @version 1.2.2
 * @author ordinall
 * @authorId 374663636347650049
 * @website https://github.com/ordinall/BetterDiscord-Stuff/tree/master/Plugins/DisableStickerSuggestions/
 * @source https://raw.githubusercontent.com/ordinall/BetterDiscord-Stuff/master/Plugins/DisableStickerSuggestions/DisableStickerSuggestions.plugin.js
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/
const config = {"info":{"name":"DisableStickerSuggestions","authors":[{"name":"ordinall","discord_id":"374663636347650049","github_username":"ordinall"}],"version":"1.2.2","description":"Disables sticker suggestions while typing messages and emotes in chat","github":"https://github.com/ordinall/BetterDiscord-Stuff/tree/master/Plugins/DisableStickerSuggestions/","github_raw":"https://raw.githubusercontent.com/ordinall/BetterDiscord-Stuff/master/Plugins/DisableStickerSuggestions/DisableStickerSuggestions.plugin.js"},"changelog":[{"title":"v1.2.2","items":["Fixed the plugin setting save issue"]}],"defaultConfig":[{"type":"switch","name":"Disable Sticker Suggestions while typing an emote","id":"disableEmojiSuggestions","value":true},{"type":"switch","name":"Disable Sticker Suggestions while typing a messsage","id":"disableMessageSuggestions","value":true}],"main":"index.js"};
class Dummy {
    constructor() {this._config = config;}
    start() {}
    stop() {}
}
 
if (!global.ZeresPluginLibrary) {
    BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
        confirmText: "Download Now",
        cancelText: "Cancel",
        onConfirm: () => {
            require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
            });
        }
    });
}
 
module.exports = !global.ZeresPluginLibrary ? Dummy : (([Plugin, Api]) => {
     const plugin = (Plugin, Library) => {

    const { Patcher, WebpackModules, Settings, DiscordModules } = Library;
    return class DisableStickerSuggestions extends Plugin {
        constructor() {
            super();
        }

        onStart() {
            Patcher.after(WebpackModules.find(m => m?.default?.displayName === "SlateTextAreaContextMenu"), "default", (_, [a, b, c], result) => {
                result.props.children.splice(0, 1);
            });
            Patcher.after(WebpackModules.find(m => m?.default?.displayName === "NativeTextAreaContextMenu"), "default", (_, [a, b, c], result) => {
                result.props.children.splice(0, 1);
            });
            // Patcher.after(WebpackModules.getByProps("ExpressionSuggestionsEnabled").ExpressionSuggestionsEnabled, "updateSetting", (_, [a]) => {
            // 	this.settings.disableMessageSuggestions = !a;
            // 	this.saveSettings();
            // });
            this.expressionModule = WebpackModules.getByProps("ExpressionSuggestionsEnabled");
            this.removeEmojiPatch = () => {};
            this.applyPatches();
        }

        applyPatches() {
            if (this.settings.disableEmojiSuggestions) {
                this.removeEmojiPatch = Patcher.after(WebpackModules.getByProps("queryStickers"), "queryStickers", (_, [a, b, c], result) => {
                    if (!(c == undefined || c == null)) {
                        return [];
                    } else {
                        return result;
                    }
                });
            }
            if (this.settings.disableMessageSuggestions == this.expressionModule.ExpressionSuggestionsEnabled.getSetting()) {
                this.expressionModule.ExpressionSuggestionsEnabled.updateSetting(!this.expressionModule.ExpressionSuggestionsEnabled.getSetting());
            }
        }

        removePatches() {
            this.removeEmojiPatch();
        }

        getSettingsPanel() {
            this.settings.disableMessageSuggestions = !this.expressionModule.ExpressionSuggestionsEnabled.getSetting();
            const panel = this.buildSettingsPanel();
            panel.addListener(() => {
                this.removePatches();
                this.applyPatches();
            });
            return panel.getElement();
        }

        onStop() {
            Patcher.unpatchAll()
        }
    };

};
     return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/