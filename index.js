require('dotenv').config();
const Client = require('./Client');
const client = new Client(process.env.TOKEN);

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

// functions
function verbose(type = 'undefined', channel = 'MAIN', msg = 'please input a message!') {
    if(msg == 'please input a message!') return;
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

client.start();
verbose('INFO', 'MAIN', 'client starting...')