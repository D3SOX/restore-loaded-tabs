<h1><img src="icons/icon.svg" alt="" width="40" height="40" align="left">Restore Loaded Tabs</h1>

Restore Loaded Tabs remembers which Firefox tabs are loaded and which are unloaded. After Firefox restarts, it reloads only the tabs that were loaded before shutdown and leaves the others unloaded.

The extension runs locally, does not read page contents, and does not collect or transmit data.

- [Website](https://restore-loaded-tabs.d3sox.me/)
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/restore-loaded-tabs/)

## Requirements

- Firefox 140 or later
- **Settings > General > Startup > Open previous windows and tabs** enabled
- `browser.sessionstore.restore_on_demand` set to `true`, which is the Firefox default

Private windows are not restored by Firefox.

## How it works

Firefox exposes whether a tab is loaded through its `discarded` state. The extension stores that state on the tab using the Firefox sessions API. Firefox preserves the value when it restores the tab in a later browser session.

On startup, the extension:

1. Loads tabs that were previously loaded.
2. Leaves previously unloaded tabs unloaded.
3. Unloads non-active tabs that Firefox loaded despite their previous state.

It waits briefly for Firefox to finish creating restored windows and tabs before applying the saved state.

The extension requests only the `sessions` permission. It has no host permissions and cannot access page contents.

## Package for AMO

Run this command from the project directory:

```sh
zip -9 restore-loaded-tabs-1.0.0.zip manifest.json background.js icons/icon.svg
```

Upload the resulting ZIP in the [AMO Developer Hub](https://addons.mozilla.org/developers/). Choose a listed submission to publish it on AMO or an unlisted submission for private testing.

No separate source archive or build instructions are needed because the submitted files are the original, readable source files and there is no build step.

## Release checklist

1. Update `version` in `manifest.json`.
2. Update the version in the ZIP filename.
3. Run `web-ext lint`.
4. Create the ZIP with the command above.
5. Upload it to AMO.

## Acknowledgment

This extension was written with GPT-5.6 Sol in Codex.
