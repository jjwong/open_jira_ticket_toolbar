const JIRA_HISTORY_KEY = 'pages';

class JHistoryService {

    static getPages = () => {
        return toPromise((resolve, reject) => {
            chrome.storage.local.get([JIRA_HISTORY_KEY], (result) => {
                console.log('Retrieved name: ' + result.myKey.name);
                if (chrome.runtime.lastError)
                    reject(chrome.runtime.lastError);

                const researches = result.pages ?? [];
                resolve(researches);
            });
        });
    }

    static savePage = async (title, url) => {
        const pages = await this.getPages();
        const updatedPages = [...pages, { title, url }];

        return toPromise((resolve, reject) => {

            chrome.storage.local.set({ [JIRA_HISTORY_KEY]: updatedPages }, () => {
                if (chrome.runtime.lastError)
                    reject(chrome.runtime.lastError);
                resolve(updatedPages);
            });
        });
    }

    static clearPages = () => {
        return toPromise((resolve, reject) => {
            chrome.storage.local.remove([JIRA_HISTORY_KEY], () => {
                if (chrome.runtime.lastError)
                    reject(chrome.runtime.lastError);
                resolve();
            });
        });
    }
}