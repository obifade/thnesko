"use strict";
const bot = require('./index.js');
const chalk = require('chalk');
const cmdExC = chalk.bold.cyan;
const msgRecC = chalk.bold.blue;

bot.on('messageCreate', (msg) => {
    if ((!bot.commandOptions.ignoreSelf || msg.author.id !== bot.user.id) && (!bot.commandOptions.ignoreBots || !msg.author.bot) && (msg.prefix = bot.checkPrefix(msg))) {
        let args = msg.content.replace(/<@!/g, "<@").substring(msg.prefix.length).split(" ");
        let label = args.shift();
        label = bot.commandAliases[label] || label;
        let command;
        if (msg.channel.guild && (command = bot.commands[label]) !== undefined || msg.channel.guild && ((command = bot.commands[label.toLowerCase()]) !== undefined && command.caseInsensitive)) { // Command executed in guild
            console.log(chalk.white(`[${new Date(Date.now())}]: `), cmdExC(`${command.label} executed in ${msg.channel.guild.id} (${msg.channel.guild.name}) by ${msg.author.id} (${msg.author.username})`));
        } else if ((command = bot.commands[label]) !== undefined || ((command = bot.commands[label.toLowerCase()]) !== undefined && command.caseInsensitive)) { // Command executed in DM
            console.log(chalk.white(`[${new Date(Date.now())}]: `), cmdExC(`${command.label} executed in DM by ${msg.author.id} (${msg.author.username})`));
        } else if (msg.author.id !== bot.user.id && msg.channel.guild) { // Message recieved in guild starting with prefix
            console.log(chalk.white(`[${new Date(Date.now())}]: `), msgRecC(`msgRecC in ${msg.channel.guild.id} (${msg.channel.guild.name}) by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`));
        } else if (msg.author.id !== bot.user.id) { // DM recieved starting with prefix
            console.log(chalk.white(`[${new Date(Date.now())}]: `), msgRecC(`msgRecC in DM by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`));
        }
    } else if (msg.author.id !== bot.user.id && msg.channel.guild) { // Message recieved in guild
        console.log(chalk.white(`[${new Date(Date.now())}]: `), msgRecC(`msgRecC in ${msg.channel.guild.id} (${msg.channel.guild.name}) by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`));
    } else if (msg.author.id !== bot.user.id) { // DM recieved
        console.log(chalk.white(`[${new Date(Date.now())}]: `), msgRecC(`msgRecC in DM by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`));
    }
});

let errC = function (error) {
    console.log(chalk.white(`[${new Date(Date.now())}]: `), chalk.bold.red(`${error}`));
}

let warnC = function (msg) {
    console.log(chalk.white(`[${new Date(Date.now())}]: `), chalk.bold.yellow(`${msg}`));
}

let successC = function (res) {
    console.log(chalk.white(`[${new Date(Date.now())}]: `), chalk.bold.green(`${res}`));
}

let botG = function (g) {
    console.log(chalk.white(`[${new Date(Date.now())}]: `), chalk.bold.magenta(`Guild created. ${g.name} | ${g.id}`));
}

let botGD = function (g, u) {
    u ? console.log(chalk.white(`[${new Date(Date.now())}]: `), chalk.bold.magenta(`Guild unavailable. ${g.name} | ${g.id}`)) : console.log(chalk.white(`[${new Date(Date.now())}]: `), chalk.bold.magenta(`Guild delete. ${g.name} | ${g.id}`));
}

module.exports.errC = errC;
module.exports.warnC = warnC;
module.exports.successC = successC;
module.exports.botG = botG;
module.exports.botGD = botGD;
