export function randomString(len = 16): string {
    const t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
        a = t.length;
    let n = "";
    for (let i = 0; i < len; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}





