require('dotenv').config();
const Client = require('./Client');
const client = new Client(process.env.TOKEN);
const fs = require('fs');
const hexToTerminal = require('./hexToTerminal');

// desired stuff
const desiredUser = {
    name: process.env.DESIDED_USERNAME,
    color: "#abcdef"
};

const desiredChannel = {
    "m": "ch",
    "_id": process.env.DESIRED_CHANNELID,
    "set": {
        "visible": true
    }
};

const desiredInitialChSet = {
    "color": process.env.DESIRED_CHANNELCOLOR,
    "color2": process.env.DESIRED_CHANNELCOLOR2,
    "chat": "true"
};

// variables
let didRunSetupDesired = false;

// command variables
const badUsers = [];
let listCommandUsed = 0;
const numberFormatter = new Intl.NumberFormat('en-US');
client.voteLocked = false;
client.colorLocked = false;
client.autoBan = false;
client.voteKickUsers = {};
client.voteBanUsers = {};
client.admins = process.env.ADMINS.split(',');

client.setColor = function (msg) {
    const parts = msg.split(" ");
    const color = parts[1];
    const color2 = parts[2];
    if (color && color.startsWith("#")) {
        const set = { color };
        if (color2 && color2.startsWith("#")) set.color2 = color2;
        this.chset(set);
    }
};

client.giveCrownTo = function (id) {
    this.sendArray([{ m: "chown", id }]);
};

function randomArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function getRooms() {
    return new Promise((resolve) => {
        const handler = (msg) => {
            if (msg.u) {
                client.removeListener('ls', handler);
                resolve(msg.u);
            }
        };
        client.on('ls', handler);
        client.sendArray([{ m: '+ls' }]);
        setTimeout(() => {
            client.removeListener('ls', handler);
            client.sendArray([{ m: '-ls' }]);
            resolve([]);
        }, 5000);
    });
}

const idRegex = /^[0-9a-f]{24}$/i;

// load file variables

// functions
function verbose(type = 'undefined', channel = 'MAIN', msg = 'please input a message!') {
    if (msg == 'please input a message!') return;
    const typeOverride = {
        INFO: '\x1b[34m[INFO]\x1b[0m',
        WARN: '\x1b[33m[WARN]\x1b[0m',
        ERROR: '\x1b[31m[ERROR]\x1b[0m',
        CRITICAL: '\x1b[1;31m[CRITICAL]\x1b[0m',
        undefined: '\x1b[90m[UNDEFINED]\x1b[0m'
    };

    type = (typeOverride[type]) ? typeOverride[type] : typeOverride['undefined'];
    console.log(`${type}[${channel}] ${msg}`)
}

/* 
COPYPASTE STUFF
verbose('INFO', 'MAIN', '')
verbose('WARN', 'MAIN', '')
verbose('ERROR', 'MAIN', '')
verbose('CRITICAL', 'MAIN', '')
verbose('undefined', 'MAIN', '')
*/

function setupRoom() {
    if (!client.channel) return verbose('CRITICAL', 'ROOM SETUP', 'client.channel object does not exist');
    if (client.channel.id !== desiredChannel._id)
        verbose('CRITICAL', 'ROOM SETUP', 'client is on the wrong channel!')
    client.sendArray([desiredChannel])
    return;
    if (msg.ch.crown.userId != client.user.id) return verbose('WARN', 'ROOM SETUP', 'client does not have the crown');
    if (didRunSetupDesired == true) return /*silently does not go*/;

    if (
        msg.ch.settings.color != desiredInitialChSet.color ||
        msg.ch.settings.color2 != desiredInitialChSet.color2 ||
        msg.ch.settings.chat != desiredInitialChSet.chat
    ) {
        //debug
        console.log([{
            m: 'chset',
            set: desiredInitialChSet
        }])
        verbose('WARN', 'ROOM SETUP', 'ran room setup!')
        didRunSetupDesired = true;
    }
}

client.on('hi', msg => {
    // User Standards
    verbose('INFO', 'MAIN', 'client joined')
    verbose('INFO', 'MAIN', '[u] ' + JSON.stringify(msg.u))
    if (msg.u.name != desiredUser.name || msg.u.color != desiredUser.color) {
        client.sendArray([{
            m: 'userset',
            set: {
                name: desiredUser.name,
                color: desiredUser.color
            }
        }])
    }

    client.sendArray([desiredChannel]);
});

client.on('ch', msg => {
    // Persistent client.channel
    client.channel = msg.ch;
    verbose('INFO', 'ch', msg.ch.id)
    setupRoom();
});

client.on('ppl', msg => {
    /* 
    TODO:
    - do something with that.
    */
});


// Imported commands from GateKeeper, the good ol' bot from MPP!
client.on('a', msg => {
    if (!msg.a.startsWith("/")) return;

    const command = msg.a.substring(1).split(" ")[0];
    const input = msg.a.split(" ").slice(1).join(" ");
    const args = msg.a.split(" ").slice(1);
    const p = msg.p;
    const isOwner = client.isOwner();
    const isAdmin = client.admins.includes(p._id) || p.name === "ew";
    const isBot = p._id === client.getOwnParticipant()._id;

    if (badUsers.includes(p._id)) return;
    if (isBot) return;

    switch (command) {
        case 'help': {
            const base = "Commands are: /help, /about, /id" +
                (isOwner ? ", /votekick, /voteban, /roomcolor. Admin commands are: /votelock, /roomcolorlock, /unban, /kickban, /nocussing, /visibility, /autobanner, /crown." : ". Admin commands are: /votelock, /roomcolorlock, /gksay, /autobanner, /crown.");
            client.say(base);
            break;
        }

        case 'id': {
            client.say("Your _id is: " + p._id);
            break;
        }

        case 'about': {
            client.say(
                `This bot is made by daniel176, highly inspired on GateKeeper made by Anonygold!`
            );
            break;
        }

        case 'admin': {
            client.say(`You're ${isAdmin ? "" : "not "}an admin.`);
            break;
        }

        // --- Crown holder commands ---

        case 'votekick': {
            if (!isOwner) break;
            if (client.voteLocked) {
                client.say('Sorry, but this command is disabled right now.');
                break;
            }
            if (!input) {
                client.say("Usage: /votekick [User name or User _ID]");
                break;
            }
            let targetUser = Object.values(client.ppl).find(pp => pp.name === input);
            if (!targetUser && idRegex.test(input)) targetUser = { _id: input, name: input };
            if (!targetUser) {
                client.say("This user doesn't exist.");
                break;
            }
            const goodUsers = [client.getOwnParticipant(), ...client.admins.map(id => client.ppl[id]).filter(Boolean)];
            if (goodUsers.includes(targetUser)) {
                client.say(`Sorry, but you can't vote this user (${targetUser.name}) to get kicked.`);
                break;
            }
            const targetId = targetUser._id;
            if (!client.voteKickUsers[targetId]) {
                client.voteKickUsers[targetId] = { _ids: [], maxCount: 3 + Math.floor((client.channel ? client.channel.count : 0) / 10.5) };
            }
            if (client.voteKickUsers[targetId]._ids.includes(p._id)) {
                const moreNeeded = client.voteKickUsers[targetId].maxCount - client.voteKickUsers[targetId]._ids.length;
                client.say(`Sorry, but you have voted to kick this user (${targetUser.name}) already. ${moreNeeded} more user${moreNeeded == 1 ? "" : "s"} needed to get this user kicked.`);
            } else {
                client.voteKickUsers[targetId]._ids.push(p._id);
                const moreNeeded = client.voteKickUsers[targetId].maxCount - client.voteKickUsers[targetId]._ids.length;
                client.say(`You have voted to get this user (${targetUser.name}) kicked from this room. ${moreNeeded} more user${moreNeeded == 1 ? "" : "s"} needed to get this user kicked.`);
                if (client.voteKickUsers[targetId]._ids.length >= client.voteKickUsers[targetId].maxCount) {
                    client.voteKickUsers[targetId]._ids = [];
                    const inte = setInterval(() => client.kickBan(targetId, 0), 50);
                    setTimeout(() => clearInterval(inte), 5000);
                }
            }
            break;
        }

        case 'voteban': {
            if (!isOwner) break;
            if (client.voteLocked) {
                client.say('Sorry, but this command is disabled right now.');
                break;
            }
            if (!input) {
                client.say("Usage: /voteban [User name or User _ID]");
                break;
            }
            let targetUser = Object.values(client.ppl).find(pp => pp.name === input);
            if (!targetUser && idRegex.test(input)) targetUser = { _id: input, name: input };
            if (!targetUser) {
                client.say("This user doesn't exist.");
                break;
            }
            const goodUsers = [client.getOwnParticipant(), ...client.admins.map(id => client.ppl[id]).filter(Boolean)];
            if (goodUsers.includes(targetUser)) {
                client.say(`Sorry, but you can't vote this user (${targetUser.name}) to get banned for 60 minutes.`);
                break;
            }
            const targetId = targetUser._id;
            if (!client.voteBanUsers[targetId]) {
                client.voteBanUsers[targetId] = { _ids: [], maxCount: 3 + Math.floor((client.channel ? client.channel.count : 0) / 7.5) };
            }
            if (client.voteBanUsers[targetId]._ids.includes(p._id)) {
                const moreNeeded = client.voteBanUsers[targetId].maxCount - client.voteBanUsers[targetId]._ids.length;
                client.say(`Sorry, but you have voted to ban this user (${targetUser.name}) already. ${moreNeeded} more user${moreNeeded == 1 ? "" : "s"} needed to get this user banned for 60 minutes.`);
            } else {
                client.voteBanUsers[targetId]._ids.push(p._id);
                const moreNeeded = client.voteBanUsers[targetId].maxCount - client.voteBanUsers[targetId]._ids.length;
                client.say(`You have voted to get this user (${targetUser.name}) banned from this room. ${moreNeeded} more user${moreNeeded == 1 ? "" : "s"} needed to get this user banned for 60 minutes.`);
                if (client.voteBanUsers[targetId]._ids.length >= client.voteBanUsers[targetId].maxCount) {
                    client.voteBanUsers[targetId]._ids = [];
                    const inte = setInterval(() => client.kickBan(targetId, 3.6e6), 50);
                    setTimeout(() => clearInterval(inte), 5000);
                }
            }
            break;
        }

        case 'roomcolor': {
            if (!isOwner) break;
            if (client.colorLocked) {
                client.say('Sorry, but this command is disabled right now.');
                break;
            }
            if ((args[0] || "").startsWith("#")) {
                client.setColor(msg.a);
            } else {
                client.say("Usage: /roomcolor [hex color]");
            }
            break;
        }

        // --- Admin + Crown holder commands ---

        case 'unban': {
            if (!isOwner || !isAdmin) break;
            if (args[0]) {
                client.sendArray([{ m: "unban", _id: args[0] }]);
                client.say("Possibly unbanned.");
            } else {
                client.say("Usage: /unban [user _id]");
            }
            break;
        }

        case 'ban60': {
            if (!isOwner || !isAdmin) break;
            if (args[0]) {
                const goodUsers = [client.getOwnParticipant(), ...client.admins.map(id => client.ppl[id]).filter(Boolean)];
                if (goodUsers.some(u => u && u._id === args[0])) {
                    client.say("no");
                } else {
                    client.kickBan(args[0], 36e5);
                }
            } else {
                client.say("Usage: /ban60 [user _id]");
            }
            break;
        }

        case 'kickban': {
            if (!isOwner || !isAdmin) break;
            if (args.length < 2) {
                client.say("Usage: /kickban [minutes*] [_id's...] *0 for kick");
                break;
            }
            const ms = parseInt(args[0]) * 60 * 1000;
            const ids = args.slice(1);
            const goodUsers = [client.getOwnParticipant(), ...client.admins.map(id => client.ppl[id]).filter(Boolean)];
            ids.forEach((_id, nid) => {
                setTimeout(() => {
                    if (goodUsers.some(u => u && u._id === _id.toLowerCase())) {
                        const user = client.ppl[_id];
                        client.say((user ? user.name : _id) + " can't be banned.");
                    } else {
                        client.kickBan(_id.toLowerCase(), ms);
                    }
                }, nid * 1050);
            });
            break;
        }

        case 'nocussing': {
            if (!isOwner || !isAdmin) break;
            client.sendArray([{ m: "chset", set: { "no cussing": !client.channel.settings["no cussing"] } }]);
            break;
        }

        case 'visibility': {
            if (!isOwner || !isAdmin) break;
            client.sendArray([{ m: "chset", set: { "visible": !client.channel.settings["visible"] } }]);
            break;
        }

        // --- Admin only (no crown needed) ---

        case 'autobanner': {
            if (!isAdmin) break;
            client.say(`${client.autoBan ? "Dis" : "En"}abled autobanner.`);
            client.autoBan = !client.autoBan;
            break;
        }

        case 'votelock': {
            if (!isAdmin) break;
            client.say(`${client.voteLocked ? "En" : "Dis"}abled /votekick and /voteban command.`);
            client.voteLocked = !client.voteLocked;
            break;
        }

        case 'roomcolorlock': {
            if (!isAdmin) break;
            client.say(`${client.colorLocked ? "En" : "Dis"}abled /roomcolor command.`);
            client.colorLocked = !client.colorLocked;
            break;
        }

        default:
            break;
    }
});

//Bind After Connection
setTimeout(() => {
    client.on('participant added', msg => {
        // console.log(msg)

        // You should uncoment those lines if you don't want bots

        // if (msg.tag && msg.tag.text == "BOT") {
        //     client.kickBan(msg._id, 60 * 60 * 1000)
        // }
        verbose('INFO', hexToTerminal('P+', '#00ff00'), hexToTerminal(`[${msg.id}] ${msg.name}`, msg.color))
    })

    client.on('participant update-2', msg => {
        let changedVars = [];
        if(msg.old.color != msg.new.color) changedVars.push('color');
        if(msg.old.name != msg.new.name) changedVars.push('name');
        changedVars = changedVars.toString();

        switch (changedVars) {
            case 'color,name':
                verbose(
                    'INFO', 
                    hexToTerminal('P', '#ffae00'), 
                    `[${msg.id}] ` +
                    hexToTerminal(`(${msg.old.color})${msg.old.name}`, msg.old.color) +
                    ' changed its name and color to ' +
                    hexToTerminal(`(${msg.new.color})${msg.new.name}`, msg.new.color)
                )
                break;
            case 'color':
                verbose(
                    'INFO', 
                    hexToTerminal('P', '#ffae00'), 
                    `[${msg.id}] ` +
                    hexToTerminal(`(${msg.old.color})${msg.old.name}`, msg.old.color) +
                    ' changed its color to ' +
                    hexToTerminal(`(${msg.new.color})${msg.new.name}`, msg.new.color)
                )
                break;
            case 'name':
                verbose(
                    'INFO', 
                    hexToTerminal('P', '#ffae00'), 
                    `[${msg.id}] ` +
                    hexToTerminal(`(${msg.old.color})${msg.old.name}`, msg.old.color) +
                    ' changed its name to ' +
                    hexToTerminal(`(${msg.new.color})${msg.new.name}`, msg.new.color)
                )
                break;
            default:
                break;
        }
    })

    client.on('participant removed', msg => {
        // console.log(msg)
        verbose('INFO', hexToTerminal('P-', '#ff0000'), hexToTerminal(`[${msg.id}] ${msg.name}`, msg.color))
    })
}, 5000);

client.on('a', msg => {
    msg.a = msg.a.replaceAll(/\p{Cf}/gu, '');
    console.log(`${hexToTerminal('[CHAT]', '#00ff00')}[${msg.p.id}] ${hexToTerminal(`${msg.p.name}: `, msg.p.color)} ${msg.a}`)
});

client.start();
verbose('INFO', 'MAIN', 'client starting...')