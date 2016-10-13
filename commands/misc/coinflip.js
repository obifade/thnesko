'use strict';
const bot = require('./../../index.js');

bot.registerCommand('coinflip', (msg, args) => {
  return `**${msg.author.username}**, it's a **${Math.random() < 0.5 ? "heads" : "tails"}**.`;
}, {
    aliases: ['flip', 'coin', 'toss'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'heads or tails.',
    fullDescription: 'flip a coin.',
    cooldown: 3000
});
