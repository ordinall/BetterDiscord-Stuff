/**
 * @name SpotifyListenAlong
 * @description Enables Spotify Listen Along feature on Discord without Premium
 * @version 1.1.0
 * @author ordinall
 * @authorId 374663636347650049
 * @website https://github.com/ordinall/BetterDiscord-Stuff/tree/master/Plugins/SpotifyListenAlong/
 * @source https://raw.githubusercontent.com/ordinall/BetterDiscord-Stuff/master/Plugins/SpotifyListenAlong/SpotifyListenAlong.plugin.js
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
const config = {"info":{"name":"SpotifyListenAlong","authors":[{"name":"ordinall","discord_id":"374663636347650049","github_username":"ordinall"}],"version":"1.1.0","description":"Enables Spotify Listen Along feature on Discord without Premium","github":"https://github.com/ordinall/BetterDiscord-Stuff/tree/master/Plugins/SpotifyListenAlong/","github_raw":"https://raw.githubusercontent.com/ordinall/BetterDiscord-Stuff/master/Plugins/SpotifyListenAlong/SpotifyListenAlong.plugin.js"},"changelog":[{"title":"v1.1.0","items":["Fixed for the major discord electron update (thanks @d0gkiller87)"]}],"main":"index.js"};
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

    const { Patcher, WebpackModules } = Library;

    return class SpotifyListenAlong extends Plugin {
        constructor() {
            super();
        }

        onStart() {
            const DeviceStore = WebpackModules.getByProps('getActiveSocketAndDevice');   
            if (DeviceStore?.getActiveSocketAndDevice) {
                Patcher.after(
                    DeviceStore,
                    'getActiveSocketAndDevice',
                    (_, args, ret) => {
                        if ( ret?.socket ) ret.socket.isPremium = true;
                        return ret;
                    }
                );
            }
        }

        onStop() {
            Patcher.unpatchAll()
        }
    };

};
     return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/