'use strict';
const bot = require('./../../index.js');
const os = require('os');

bot.registerCommand('uptime', (msg, args) => {
    let uptime = bot.uptime / 1000;
    let response = `${Math.floor(uptime / 86400)}d : `;
    uptime %= 86400;
    response += `${Math.floor(uptime / 3600)}h : `;
    uptime %= 3600;
    response += `${Math.floor(uptime / 60)}m : `;
    response += `${Math.floor(uptime % 60)}s`;
    return `**${msg.author.username}**, here is my uptime - ${response}`;
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: 'uptime of the bot.',
    fullDescription: 'how long the bot has been online.',
    cooldown: 10000
});

bot.commands.uptime.registerSubcommand('server', (msg, args) => {
    let uptime = os.uptime();
    let response = `${Math.floor(uptime / 86400)}d : `;
    uptime %= 86400;
    response += `${Math.floor(uptime / 3600)}h : `;
    uptime %= 3600;
    response += `${Math.floor(uptime / 60)}m : `;
    response += `${Math.floor(uptime % 60)}s`;
    return `**${msg.author.username}**, here is the uptime of the server - ${response}`;
}, {
    caseInsensitive: true,
    description: 'uptime of the server.',
    fullDescription: 'how long the server has been online.',
    cooldown: 10000
});
