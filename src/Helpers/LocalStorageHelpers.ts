export function getFromLocalStorage<T>(key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        const val = localStorage.getItem(key);
        const result = val ? JSON.parse(val) as T : undefined;
        resolve(result);
    });
}

export function setInLocalStorage<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
        localStorage.setItem(key, JSON.stringify(value));
        resolve();
    });
}