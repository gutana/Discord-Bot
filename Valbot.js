const Discord = require('discord.js');
const client = new Discord.Client({ intents: ['DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILDS']}); 

const fs = require('fs');
const fetch = require('node-fetch');

/*
TODO:
    - Be able to sign up a player, get their name and tagline, and convert
        that into a puuid 
    - With puuid in hand, can look up the match. 
*/

class Bot 
{    
    constructor() {
        this.version = "0.0.1";
        this.lastUpdated = "June 30, 2022";
        //this.getValContent(); // Use this to get the Act/Episode ID. 
        this.ActID =  "79f9d00f-433a-85d6-dfc3-60aef115e699";

        let keys = new Object();

        this.getKeyFromFile('keys/disc.key')
        .then((key) => {
            client.login(key);
        });
    };   

    async getKeyFromFile(path) {
        if (this.keys) {
            return this.keys[path];
        } else {
            return await fs.readFileSync(path, 'utf-8', (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    this.keys[path] = data;
                    console.log("API key read from " + path + ": " + this.keys[path]);
                }
            });
        }
    }

    async getValContent() {
        var headers; 
        let token = await this.getKeyFromFile('keys/val.key')
        .then((token) => {
            headers = { "X-Riot-Token": token  };
        })
        var resp = await fetch("https://na.api.riotgames.com/val/content/v1/contents", {method: 'GET', headers: headers});
        this.valContentJSON = await resp.json();
    }

    helpCommand(msg) {
        msg.channel.send("I am a bot. Currently, my only commands are: \n!help - returns commands and bot info\n!version - returns bot version\n\nIf you have any questions, or would like to request a feature, contact my master @gutana.")
        msg.react("😂");
    };

    versionCommand(msg) {
        if (msg) {
            msg.channel.send("Val Bot version: " + this.version + "\n" + "Last updated: " + this.lastUpdated)
        } else {
            msg.channel.send("Unexpected error.")
        }
    };

    processCommand(msg) {
        let fullCommand = msg.content.substr(1); // Splices off the '!'
        let splitCommand = fullCommand.split(" ");
        let primaryCommand = splitCommand[0]; // The first word after the '!'
        let args = splitCommand.slice(1);     // Everything else 
    
        switch (primaryCommand) {
            case "help":
                this.helpCommand(msg)
                break
            case "version":
                this.versionCommand(msg)
                break
            default:
                if (primaryCommand) {
                    msg.channel.send("I'm not sure what you're trying to say, " + msg.author.username + "\nFor a full list of commands, type '!help'.");
                }
                console.log("Unable to process command: \"" + msg.content + "\" by " + msg.author.username);
        }
    };
}

let valBot = new Bot();

client.on('ready', () => { // the client logs in inside the Bot constructor, and then this is called
    console.log("Logged in as " + client.user.tag);
});

client.on('messageCreate', (msg) => {
    if (msg.author == client.user) { return; }

    if (msg.content.startsWith("!")) {
        valBot.processCommand(msg); 
    }
});
