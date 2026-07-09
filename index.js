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
function setupRoom() {
    if (!client.channel || client.channel.id != desiredChannel) return;
    if (msg.ch.crown.userId != client.user.id) return;
    if (didRunSetupDesired == true) return;

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

    setTimeout(() => {
        setupRoom();
    }, 1000);
});

client.on('ch', msg => {
    // Set to desired (first-run)
});

client.on('ppl', msg => {
    /* 
    TODO:
    - do something with that.
    */
});

client.start();