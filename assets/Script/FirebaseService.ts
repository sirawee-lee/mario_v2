const { ccclass } = cc._decorator;

const PROJECT_ID = "mario-509a8";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

@ccclass
export default class FirebaseService {

    static submitScore(playerName: string, score: number): Promise<void> {
        const url = `${BASE_URL}/leaderboard`;
        const body = JSON.stringify({
            fields: {
                name:      { stringValue: playerName },
                score:     { integerValue: String(score) },
                timestamp: { integerValue: String(Date.now()) }
            }
        });

        return new Promise((resolve, reject) => {
            cc.loader.getXMLHttpRequest().then !== undefined
                ? FirebaseService._fetch(url, "POST", body, resolve, reject)
                : FirebaseService._fetch(url, "POST", body, resolve, reject);
        });
    }

    static getLeaderboard(): Promise<{name: string, score: number}[]> {
        const url = `${BASE_URL}/leaderboard?pageSize=100`;

        return new Promise((resolve, reject) => {
            FirebaseService._fetch(url, "GET", null, (data: any) => {
                const docs = data.documents || [];
                const results = docs.map((doc: any) => ({
                    name:  doc.fields?.name?.stringValue  || "???",
                    score: parseInt(doc.fields?.score?.integerValue || "0")
                }));
                results.sort((a: any, b: any) => b.score - a.score);
                resolve(results.slice(0, 10));
            }, reject);
        });
    }

    private static _fetch(url: string, method: string, body: string | null, resolve: Function, reject: Function) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try { resolve(JSON.parse(xhr.responseText)); }
                catch { resolve({}); }
            } else {
                reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText}`));
            }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(body);
    }
}
