'use strict';
const bot = require('./../../index.js');
const os = require('os');

bot.registerCommand('uptime', (msg, args) => {
    return `**${msg.author.username}**, ${Math.floor(bot.uptime / 86400000)}d : ${Math.floor((bot.uptime / 3600000) % 24)}h : ${Math.floor((bot.uptime / 60000) % 60)}m : ${Math.floor((bot.uptime / 1000) % 60)}s`;
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: 'uptime of the bot.',
    fullDescription: 'how long the bot has been online.',
    cooldown: 10000
});

bot.commands.uptime.registerSubcommand('server', (msg, args) => {
    return `**${msg.author.username}**, ${Math.floor(os.uptime / 86400)}d : ${Math.floor((os.uptime / 3600) % 24)}h : ${Math.floor((os.uptime / 60) % 60)}m : ${Math.floor((os.uptime / 60) % 60)}s`;
}, {
    caseInsensitive: true,
    description: 'uptime of the server.',
    fullDescription: 'how long the server has been online.',
    cooldown: 10000
});
