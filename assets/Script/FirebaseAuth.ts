const API_KEY = "AIzaSyBJxJHD8fMuG3KPRAcaCqqy2CtzjQbxlv8";
const AUTH_URL = "https://identitytoolkit.googleapis.com/v1/accounts";

export default class FirebaseAuth {

    static signUp(email: string, password: string, displayName: string): Promise<string> {
        return FirebaseAuth._post(`${AUTH_URL}:signUp?key=${API_KEY}`, {
            email, password, returnSecureToken: true
        }).then((res: any) =>
            FirebaseAuth._post(`${AUTH_URL}:update?key=${API_KEY}`, {
                idToken: res.idToken,
                displayName,
                returnSecureToken: false
            }).then(() => displayName)
        );
    }

    static signIn(email: string, password: string): Promise<string> {
        return FirebaseAuth._post(`${AUTH_URL}:signInWithPassword?key=${API_KEY}`, {
            email, password, returnSecureToken: true
        }).then((res: any) => res.displayName || email.split("@")[0]);
    }

    private static _post(url: string, body: object): Promise<any> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onload = () => {
                try {
                    const d = JSON.parse(xhr.responseText);
                    if (xhr.status >= 200 && xhr.status < 300) resolve(d);
                    else reject(new Error(d?.error?.message || "HTTP " + xhr.status));
                } catch (e) { reject(e); }
            };
            xhr.onerror = () => reject(new Error("Network error"));
            xhr.send(JSON.stringify(body));
        });
    }
}
