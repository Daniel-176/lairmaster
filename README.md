# LairMaster, a MultiplayerPiano.net bot

This is a bot for multiplayerpiano that yourself can set-up it to keep your room!

# How-To get a bot on MPP?!

To get a bot on MPP, you must apply for a bot token on it's oficial [discord server](https://discord.gg/multiplayerpiano-net-855962146802499604)

# This bot's origin

This bot's commands is highly inspirated on the GateKeeper bot made by Anonygold, a veteran in MPP.

##### although most of it's commands is mirrored from it's code

### GateKeeper's Backstory

The GateKeeper was a multiplayerpiano bot that was used by some people that wanted to keep it's rooms alive, without needing to keep their computer turned on 24/7, so Anonygold made this bot.

It was used in highly populated rooms, so it had the functionality of managing it, with the commands `/kickban`, `/roomcolor`, `/ban60` and goes on...

# Bot features

Section documentation W.I.P

# Setting bot up

### Download the source code and install nodejs

[LairMaster source code](https://github.com/Daniel-176/lairmaster/archive/refs/heads/main.zip)

[NodeJS](https://nodejs.org/en/download/current)

### Extracting and running

Although nodejs is installed, you must extract the bot source-code to a folder and rename .env.example to .env, and open it to configure your brand new crown keeper.

**If you can't see the .env.example or .env file in the folder, try turning on "View Hidden Files" and "View File Extensions" in your OS**

*.env configuration*

```env
# Bot user settings
TOKEN=
DESIDED_USERNAME=Foo's Keeper
DESIRED_USERCOLOR=abcdef

# Channel stuff
DESIRED_CHANNELID=Foo's Lair
DESIRED_CHANNELCOLOR=5f0000
DESIRED_CHANNELCOLOR2=2b0000

# Set bot/room managers (separated by commas)
ADMINS=

# example: ADMINS=userid1,userid2,userid3
```

You can set the bot username, color and the channel it will keep.

**To get admin permissions on the bot or the room crown perms, you must put your id on the ADMINS= list.**

#### You must put your bot token to the TOKEN variable, or else you will ban yourself for a day from MPP.

### To run:

Open a terminal in the bot code folder, and run those commands.

```npm install```

```node index.js```

If everything has been set-up well, the bot will run and appear in the right room