"use strict";

const STATE_KEY = "restore-loaded-tabs.state";
const LOADED = "loaded";
const UNLOADED = "unloaded";

let reconciling = true;
let reconciliationStarted = false;
const pendingStates = new Map();
let quietTimer;
let deadlineTimer;

async function writeState(tabId, loaded) {
  try {
    await browser.sessions.setTabValue(
      tabId,
      STATE_KEY,
      loaded ? LOADED : UNLOADED,
    );
  } catch {
    // The tab may have closed before the asynchronous write completed.
  }
}

function rememberState(tabId, loaded) {
  if (reconciling) {
    pendingStates.set(tabId, loaded);
    return;
  }

  void writeState(tabId, loaded);
}

browser.tabs.onCreated.addListener((tab) => {
  if (tab.id !== undefined) {
    rememberState(tab.id, !tab.discarded);
  }

  scheduleReconciliation();
});

browser.tabs.onAttached.addListener(() => {
  scheduleReconciliation();
});

browser.windows.onCreated.addListener(() => {
  scheduleReconciliation();
});

browser.tabs.onActivated.addListener(({ tabId }) => {
  rememberState(tabId, true);
});

browser.tabs.onUpdated.addListener(
  (tabId, changeInfo) => {
    if (typeof changeInfo.discarded === "boolean") {
      rememberState(tabId, !changeInfo.discarded);
    }
  },
  { properties: ["discarded"] },
);

async function readState(tabId) {
  try {
    return await browser.sessions.getTabValue(tabId, STATE_KEY);
  } catch {
    return undefined;
  }
}

async function reconcileTab(tab) {
  if (tab.id === undefined) {
    return;
  }

  const previousState = await readState(tab.id);

  if (previousState === LOADED && tab.discarded) {
    await browser.tabs.reload(tab.id);
    return;
  }

  if (previousState === UNLOADED && !tab.discarded && !tab.active) {
    await browser.tabs.discard(tab.id);
    return;
  }

  if (previousState !== LOADED && previousState !== UNLOADED) {
    await writeState(tab.id, !tab.discarded);
  }
}

async function reconcileTabs() {
  if (reconciliationStarted) {
    return;
  }

  reconciliationStarted = true;
  clearTimeout(quietTimer);
  clearTimeout(deadlineTimer);

  try {
    const tabs = await browser.tabs.query({});
    pendingStates.clear();
    await Promise.allSettled(tabs.map(reconcileTab));

    const currentTabs = await browser.tabs.query({});
    await Promise.allSettled(
      currentTabs.map((tab) =>
        tab.id === undefined
          ? Promise.resolve()
          : writeState(tab.id, !tab.discarded),
      ),
    );
  } finally {
    reconciling = false;

    const writes = [...pendingStates].map(([tabId, loaded]) =>
      writeState(tabId, loaded),
    );
    pendingStates.clear();
    await Promise.allSettled(writes);
  }
}

function scheduleReconciliation() {
  if (!reconciling || reconciliationStarted) {
    return;
  }

  clearTimeout(quietTimer);
  quietTimer = setTimeout(() => void reconcileTabs(), 1000);
}

scheduleReconciliation();
deadlineTimer = setTimeout(() => void reconcileTabs(), 10000);
