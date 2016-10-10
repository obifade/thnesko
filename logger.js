"use strict";
const bot = require('./index.js');
const fs = require('fs');
const chalk = require('chalk');
const cmdExC = chalk.bold.cyan;
const msgRecC = chalk.bold.blue;
let logs = [];
let updated = false;
let writing = false;

setInterval(function () {
    if (updated === true) {
        if (writing) return;
        writing = true;
        let data = logs.join(`,\n`);
        data += `,\n`;
        fs.appendFile('./logs.txt', data, (err) => {
            if (err) throw `[${new Date(Date.now())}]: Error writing to log: ${err}`;
            console.log(chalk.white(`[${new Date(Date.now())}]: `), chalk.bold.green('Wrote to logs successfully'));
            logs = [];
            updated = false;
            writing = false;
        });
    }
}, 15000);

bot.on('messageCreate', (msg) => {
    let date = new Date(Date.now());
    if ((!bot.commandOptions.ignoreSelf || msg.author.id !== bot.user.id) && (!bot.commandOptions.ignoreBots || !msg.author.bot) && (msg.prefix = bot.checkPrefix(msg))) {
        let args = msg.content.replace(/<@!/g, "<@").substring(msg.prefix.length).split(" ");
        let label = args.shift();
        label = bot.commandAliases[label] || label;
        let command;
        if (msg.channel.guild && (command = bot.commands[label]) !== undefined || msg.channel.guild && ((command = bot.commands[label.toLowerCase()]) !== undefined && command.caseInsensitive)) { // Command executed in guild
            console.log(chalk.white(`[${date}]: `), cmdExC(`${command.label} executed in ${msg.channel.guild.id} (${msg.channel.guild.name}) by ${msg.author.id} (${msg.author.username})`));
            logs.push(`[${date}]: ${command.label} executed in ${msg.channel.guild.id} (${msg.channel.guild.name}) by ${msg.author.id} (${msg.author.username})`);
        } else if ((command = bot.commands[label]) !== undefined || ((command = bot.commands[label.toLowerCase()]) !== undefined && command.caseInsensitive)) { // Command executed in DM
            console.log(chalk.white(`[${date}]: `), cmdExC(`${command.label} executed in DM by ${msg.author.id} (${msg.author.username})`));
            logs.push(`[${date}]: ${command.label} executed in DM by ${msg.author.id} (${msg.author.username})`);
        } else if (msg.author.id !== bot.user.id && msg.channel.guild) { // Message recieved in guild starting with prefix
            console.log(chalk.white(`[${date}]: `), msgRecC(`msgRecC in ${msg.channel.guild.id} (${msg.channel.guild.name}) by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`));
            logs.push(`[${date}]: msgRecC in ${msg.channel.guild.id} (${msg.channel.guild.name}) by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`);
        } else if (msg.author.id !== bot.user.id) { // DM recieved starting with prefix
            console.log(chalk.white(`[${date}]: `), msgRecC(`msgRecC in DM by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`));
            logs.push(`[${date}]: msgRecC in DM by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`);
        }
    } else if (msg.author.id !== bot.user.id && msg.channel.guild) { // Message recieved in guild
        console.log(chalk.white(`[${date}]: `), msgRecC(`msgRecC in ${msg.channel.guild.id} (${msg.channel.guild.name}) by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`));
        logs.push(`[${date}]: msgRecC in ${msg.channel.guild.id} (${msg.channel.guild.name}) by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`);
    } else if (msg.author.id !== bot.user.id) { // DM recieved
        console.log(chalk.white(`[${date}]: `), msgRecC(`msgRecC in DM by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`));
        logs.push(`[${date}]: msgRecC in DM by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`);
    }
    updated = true;
});

let errC = function (error) {
    console.log(chalk.white(`[${new Date(Date.now())}]: `), chalk.bold.red(`${error}`));
    logs.push(`[${new Date(Date.now())}]: (ERROR) ${error}`);
    updated = true;
}

let warnC = function (msg) {
    console.log(chalk.white(`[${new Date(Date.now())}]: `), chalk.bold.yellow(`${msg}`));
    logs.push(`[${new Date(Date.now())}]: (WARN) ${msg}`);
    updated = true;
}

let successC = function (res) {
    console.log(chalk.white(`[${new Date(Date.now())}]: `), chalk.bold.green(`${res}`));
    logs.push(`[${new Date(Date.now())}]: ${res}`);
    updated = true;
}

let botG = function (g) {
    console.log(chalk.white(`[${new Date(Date.now())}]: `), chalk.bold.magenta(`Guild created. ${g.name} | ${g.id}`));
    logs.push(`[${new Date(Date.now())}]: Guild created. ${g.name} | ${g.id}`);
    updated = true;
}

let botGD = function (g, u) {
    if (u) {
        console.log(chalk.white(`[${new Date(Date.now())}]: `), chalk.bold.magenta(`Guild unavailable. ${g.name} | ${g.id}`));
        logs.push(`[${new Date(Date.now())}]: Guild unavailable. ${g.name} | ${g.id}`);
        updated = true;
    } else {
        console.log(chalk.white(`[${new Date(Date.now())}]: `), chalk.bold.magenta(`Guild delete. ${g.name} | ${g.id}`));
        logs.push(`[${new Date(Date.now())}]: Guild delete. ${g.name} | ${g.id}`);
        updated = true;
    }
}

module.exports.errC = errC;
module.exports.warnC = warnC;
module.exports.successC = successC;
module.exports.botG = botG;
module.exports.botGD = botGD;
