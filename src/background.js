import browser from "webextension-polyfill";

//browser.runtime.onInstalled.addListener(() => {
//  console.log("Installed!");
//});

async function clearSiteData(url) {
  const urlObj = new URL(url);
  const domain = urlObj.hostname;

  // Clear cookies
  browser.cookies.getAll({ domain }).then((cookies) => {
    cookies.forEach((cookie) => {
      const url = `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`;
      browser.cookies.remove({ url, name: cookie.name });
    });
  });

  // Clear local storage
  const [tab] = await browser.tabs.query({ url: `*://${domain}/*` });
  if (tab) {
    browser.tabs.executeScript(tab.id, {
      code: `window.localStorage.clear();`,
    }).catch((error) => {
      console.error('Failed to clear local storage:', error);
    });
  }
}

function hasQueryParameter(url, parameterName, value) {
  const urlObj = new URL(url);
  const params = new URLSearchParams(urlObj.search);
  const paramValue = params.get(parameterName)
  console.log(paramValue);
  return paramValue === value ? true : false;
}

async function loginPage(tab) {
  return browser.tabs.executeScript(tab.id, {
    file: "/src/contentScripts/loginPage.js",
    runAt: "document_idle",
  });
}

let activeTab = undefined;

async function loginProcessRun() {
  return clearSiteData("https://hh.ru/account/login")
    .then(() => browser.tabs.create({ url: "https://hh.ru/account/login" }))
    .then(tab => {
      activeTab = tab;
      loginPage(tab)
    })
    .catch(error => {
      console.error('Error during login process:', error);
    });
}

function handleUpdated(tabId, changeInfo, tabInfo) {
  if (activeTab === undefined) {
    return;
  }
  if (activeTab.id !== tabId) {
    return;
  }
  if (changeInfo.url) {
    console.log(`Updated tab: ${tabId}`);
    console.log("Changed attributes: ", changeInfo);
    if (hasQueryParameter(changeInfo.url, "hhtmFrom", "account_login")) {
      console.log('found account_login in url:', changeInfo.url);
    }
  }
}

browser.tabs.onUpdated.addListener(handleUpdated);

browser.runtime.onMessage.addListener((message, _, sendResponse) => {
  switch (message.action) {
    case 'getEmail':
      return browser.storage.local.get('email');
    case 'getPassword':
      return browser.storage.local.get('password');
    case 'getMapData': // todo probably will not work
      return browser.storage.local.get('myMapData').then(data => {
        if (data.myMapData) {
          let myMap = new Map(Object.entries(data.myMapData));
          return Array.from(myMap.entries());
        } else {
          return [];
        }
      });
    case 'startLoginProcess':
      loginProcessRun();
      break;
    // Add more cases here if needed
    default:
      return Promise.resolve({ status: "error", message: "Unknown action" });
  }

  return false;
});


