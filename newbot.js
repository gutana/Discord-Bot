class Bot {
    constructor(client) {
           this.version = "Discord Bot Version 0.0.1";
           this.lastUpdated = "Last updated October 28, 2018";

           this.lolurlBaseString = "https://na1.api.riotgames.com/"
           this.lolbyIdString = "lol/league/v3/positions/by-summoner/"
           this.lolByNameString = "lol/summoner/v3/summoners/by-name/"
           this.lolKeyQString = "?api_key="
           this.lolreg = new RegExp('^[0-9\\p{L} _\\.]+$')
           this.lolapi = "";

           client.user.setActivity("Zoe", { type: "PLAYING" })

            //logs servers
            console.log("\nConnection to Discord successful.\nConnected as " + client.user.tag + " to:\n");
            client.guilds.forEach((guild) => {
                console.log("Server: " + guild.name)
                guild.channels.forEach((channel) => {
                    console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
        })   
    })
    }
    
    async getIdWithSumName(sumName) {
        let getIDUrl = this.lolurlBaseString + this.lolByNameString + sumName + this.lolKeyQString + this.lolapi;

        const getId = await fetch(getIDUrl)
            .catch(err => console.error(err))
        const resp = await getId.json()
            .catch(err => console.error(err))

        console.log(await resp); 
        const id = await resp["id"]
        console.log("Found ID: " + id)
        return id; 
    }

    helpCommand(msg) {
        msg.channel.send(msg.author + " I am a bot. Currently, my only commands are: \n!help - returns commands and bot info\n!rank <user> - returns all ranked queue standings including promos\n!version - returns bot version\n\nIf you have any questions, or would like to request a feature, contact my master @Gutana.")
        msg.react("😂")
    }

    async getRank(sum, msg) {
        let getRankUrl = "";

        if (sum == "me") {
            // if (msg.author == gutDisc) {
            //     getRankUrl = this.lolurlBaseString + this.lolbyIdString + this.cigId + this.lolKeyQString + this.lolapi;
            //     console.log("TRYING " + getRankUrl); 
            // }
            // if (msg.author == sethDisc) {
            //     getRankUrl = this.lolurlBaseString + this.lolbyIdString + this.sethID + this.lolKeyQString + this.lolapi;
            // }
        } else {
            getRankUrl = this.lolurlBaseString + this.lolbyIdString + await this.getIdWithSumName(sum) + this.lolKeyQString + this.lolapi;
        }


        const getId = await fetch(getRankUrl)
            .catch(err => console.error(err))
        const resp = await getId.json()
            .catch(err => console.error(err))
    
    
        if (resp[0]) {
            let rank = resp[0]["playerOrTeamName"];
            rank += " is in:\n";
    
            for (let i = 0; i < resp.length; i++) {
                switch (resp[i]["queueType"]) {
                    case "RANKED_FLEX_TT":
                        rank += "3v3: "
                        break; 
                    case "RANKED_SOLO_5x5":
                        rank += "SOLO: "
                        break;
                    case "RANKED_FLEX_SR":
                        rank += "FLEX: "
                        break;
    
                }
    
                rank += resp[i]["tier"]
                rank += " "
                rank += resp[i]["rank"]
                rank += " "
                rank += resp[i]["leaguePoints"]
                
                rank += " LP - "
                rank += `${resp[i]["wins"]} wins / ${resp[i]["losses"]} losses `
                if (resp[i]["miniSeries"]) {
                    rank += `(${resp[i]["miniSeries"]["wins"]} - ${resp[i]["miniSeries"]["losses"]} in promos)`
                }
                rank += "\n";
            }
    
            return await rank;
        }
    }

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
    }

    versionCommand(msg) {
        if (msg) {
            msg.channel.send(this.version + "\n" + this.lastUpdated)
        } else {
            msg.channel.send("Unexpected error.")
        }
    }

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
                msg.channel.send("I'm not sure what you're trying to say, " + msg.author + 
                    "\nFor a full list of commands, type '!help'.") 
        }
    }
}

const Discord = require('discord.js');
const client = new Discord.Client(); 
const fetch = require('node-fetch')

const discapi = "E";

let cancerBot;

client.on('ready', () => {
    cancerBot = new Bot(client); 
})

client.on('message', (msg) => {
    if (msg.author == client.user) { return }

    if (msg.content.startsWith("!")) {
        cancerBot.processCommand(msg); 
    }
})

client.login(discapi); 