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
    if (msg.author.id === bot.user.id) return;
    let date = new Date(Date.now());
    if (msg.command && msg.channel.guild) {
        console.log(chalk.white(`[${date}]: `), cmdExC(`${msg.command.label} executed in ${msg.channel.guild.id} (${msg.channel.guild.name}) by ${msg.author.id} (${msg.author.username})`));
        logs.push(`[${date}]: ${msg.command.label} executed in ${msg.channel.guild.id} (${msg.channel.guild.name}) by ${msg.author.id} (${msg.author.username})`);
    } else if (msg.command) {
        console.log(chalk.white(`[${date}]: `), cmdExC(`${msg.command.label} executed in DM by ${msg.author.id} (${msg.author.username})`));
        logs.push(`[${date}]: ${msg.command.label} executed in DM by ${msg.author.id} (${msg.author.username})`);
    } else if (msg.channel.guild) {
        console.log(chalk.white(`[${date}]: `), msgRecC(`msgRecC in ${msg.channel.guild.id} (${msg.channel.guild.name}) by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`));
        logs.push(`[${date}]: msgRecC in ${msg.channel.guild.id} (${msg.channel.guild.name}) by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`);
    } else {
        console.log(chalk.white(`[${date}]: `), msgRecC(`msgRecC in DM by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`));
        logs.push(`[${date}]: msgRecC in DM by ${msg.author.id} (${msg.author.username}): ${msg.cleanContent}`);
    }
    updated = true;
});

bot.on('guildUnavailable', (g) => {
    console.log(chalk.white(`[${new Date(Date.now())}]: `), chalk.bold.yellow(`Guild unavailable: ${g.id} (${g.name})`));
    logs.push(`[${new Date(Date.now())}]: Guild unavailable: ${g.id} (${g.name})`);
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

let botGD = function (g) {
    if (g) {
        console.log(chalk.white(`[${new Date(Date.now())}]: `), chalk.bold.magenta(`Guild delete. ${g.name} | ${g.id}`));
        logs.push(`[${new Date(Date.now())}]: Guild delete. ${g.name} | ${g.id}`);
        updated = true;
    } else {
        console.log(chalk.white('Guild deleted.'));
        logs.push(`[${new Date(Date.now())}]: Guild delete.`);
        updated = true;
    }
}

module.exports.errC = errC;
module.exports.warnC = warnC;
module.exports.successC = successC;
module.exports.botG = botG;
module.exports.botGD = botGD;
