'use strict';
const bot = require('./../../index.js');

bot.registerCommand('uptime', (msg, args) => {
    let date = new Date(bot.uptime);
    return `**${msg.author.username}**: ${date.getHours()}h : ${date.getMinutes()}m : ${date.getSeconds()}s`;
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: 'uptime of the bot.',
    fullDescription: 'how long the bot has been online.',
    cooldown: 10000
});
