# Restore Loaded Tabs

Restore Loaded Tabs remembers which Firefox tabs are loaded and which are unloaded. After Firefox restarts, it reloads only the tabs that were loaded before shutdown and leaves the others unloaded.

The extension runs locally, does not read page contents, and does not collect or transmit data.

- [Website](https://d3sox.github.io/restore-loaded-tabs/)
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

## Test locally

1. Open `about:debugging` in Firefox.
2. Select **This Firefox**.
3. Select **Load Temporary Add-on**.
4. Choose `manifest.json` from this directory.

Temporary add-ons are removed when Firefox exits. To test behavior across a full restart, upload the extension to AMO as an unlisted version, install the signed XPI, and restart Firefox.

## Package for AMO

Run this command from the project directory:

```sh
zip -9 restore-loaded-tabs-1.0.0.zip manifest.json background.js icons/icon.svg
```

Upload the resulting ZIP in the [AMO Developer Hub](https://addons.mozilla.org/developers/). Choose a listed submission to publish it on AMO or an unlisted submission for private testing.

No separate source archive or build instructions are needed because the submitted files are the original, readable source files and there is no build step.

Suggested reviewer notes:

> The extension stores each tab's loaded or discarded state with `browser.sessions.setTabValue`. On browser startup, it compares that saved state with the restored tabs. It reloads tabs previously marked as loaded and discards non-active tabs previously marked as unloaded. No page contents are accessed, and no data leaves Firefox.

## Release checklist

1. Update `version` in `manifest.json`.
2. Update the version in the ZIP filename.
3. Run `web-ext lint`.
4. Create the ZIP with the command above.
5. Upload it to AMO.
