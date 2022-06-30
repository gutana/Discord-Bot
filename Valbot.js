const fs = require('fs');

class Bot 
{    
    constructor() {
        this.version = "0.0.1";
        this.lastUpdated = "June 30, 2022";
        this.getValContent();
    };   

    getDiscKey() {
        this.discAPIKey = fs.readFileSync('keys/disc.key', 'utf-8', (err, data) => {
            if (err) {
                console.error(err);        
            } else {
                this.discAPIKey = data;
                console.log("Discord API key read: " + this.discAPIKey);
            };
        });
        return this.discAPIKey;
    }

    getValKey() {
        this.valAPIKey = fs.readFileSync('keys/val.key', 'utf-8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                this.valAPIKey = data;
                console.log("Valorant API key read: " + this.valAPIKey);
            };
        });
        return this.valAPIKey;
    }

    async getValContent() {
        var headers = {
                "X-Riot-Token": this.getValKey()
        };
        this.valContent = await fetch("https://na.api.riotgames.com/val/content/v1/contents", {method: 'GET', headers: headers});
    }

    helpCommand(msg) {
        msg.channel.send("I am a bot. Currently, my only commands are: \n!help - returns commands and bot info\n!rank <user> - returns all ranked queue standings including promos\n!version - returns bot version\n\nIf you have any questions, or would like to request a feature, contact my master @gutana.")
        msg.react("😂");
    };

    async rankCommand(msg, args) {
        let rank;

        let sumName = args[0];

        if (args[1]) {
            sumName += "_";
            sumName += args[1];
            if (args[2]) {
                sumName += "_";
                sumName += args[2]; 
            }
        }

        if (!sumName) {
            msg.channel.send(msg.author + " To use this command, provide a summoner name. Ex: '!rank doublelift' \nPlease note that this is only available for NA at the moment")
            return; 
        }

        console.log(sumName + " requested rank.")

        if (sumName != "me") {
            rank = await this.getRank(sumName, msg);
        
            if (await rank) {
                msg.channel.send(rank)
            }
        }

        setTimeout(function () {
            if (!rank) {
                msg.channel.send("Sorry, " + msg.author + ", something is wrong with the name you provided or rito is experiencing difficulties.")
                console.error(`Error finding rank for ${sumName}`)
            }
        }, 5000);
    };

    versionCommand(msg) {
        if (msg) {
            msg.channel.send("Val Bot version: " + this.version + "\n" + "Last updated: " + this.lastUpdated)
        } else {
            msg.channel.send("Unexpected error.")
        }
    };

    processCommand(msg) {
        let fullCommand = msg.content.substr(1)
        let splitCommand = fullCommand.split(" ")
        let primaryCommand = splitCommand[0]
        let args = splitCommand.slice(1)
    
    
        switch (primaryCommand) {
            case "help":
                this.helpCommand(msg)
                break
            case "rank":
                this.rankCommand(msg, args)
                break
            case "version":
                this.versionCommand(msg)
                break
            default:
                msg.channel.send("I'm not sure what you're trying to say, " + msg.author.username + 
                    "\nFor a full list of commands, type '!help'.") 
        }
    };
}

const Discord = require('discord.js');
const client = new Discord.Client({ intents: ['DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILDS']}); 
const fetch = require('node-fetch');
const { get } = require('http');

let valBot = new Bot();

client.on('ready', () => {
    console.log("Logged in as " + client.user.tag);
});

client.login(valBot.getDiscKey()); 

client.on('messageCreate', (msg) => {
    if (msg.author == client.user) { return; }

    if (msg.content.startsWith("!")) {
        valBot.processCommand(msg); 
    }
});
