'use strict';
const bot = require('./../../index.js');

bot.registerCommand('uptime', (msg, args) => {
    return `**${msg.author.username}**, ${Math.floor(bot.uptime / 864000000)}d : ${Math.floor((bot.uptime / 3600000) % 24)}h : ${Math.floor((bot.uptime / 60000) % 60)}m : ${Math.floor((bot.uptime / 1000) % 60)}s`;
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: 'uptime of the bot.',
    fullDescription: 'how long the bot has been online.',
    cooldown: 10000
});
