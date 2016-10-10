'use strict';
const bot = require('./../../index.js');
const log = require('./../../logger.js');

bot.registerCommand('request', (msg, args) => {
    if (args.length === 0) return `**${msg.author.username}**, I need a suggestion to submit.`;
    if (!/^.{0,1000}$/.test(args.join(' '))) return `**${msg.author.username}**, suggestion submitted, thanks!`;
    bot.createMessage('205805400963022848', `Suggestion submit from *${msg.author.username} (ID: ${msg.author.id})* in *${msg.channel.guild.name} (ID: ${msg.channel.guild.id})* **${args.join(' ')}**`).then(() => {
        bot.createMessage(msg.channel.id, `**${msg.author.username}**, suggestion submitted, thanks!`).catch(error => log.errC(error));
    }).catch(error => log.errC(error));
}, {
    aliases: ['feature', 'suggestion', 'suggest'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'submit an idea.',
    fullDescription: 'use this command to submit a feature request. Abuse will result in you being blacklisted.',
    usage: '<suggestion>',
    cooldown: 20000
});
