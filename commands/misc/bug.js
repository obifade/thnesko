'use strict';
const bot = require('./../../index.js');
const log = require('./../../logger.js');

bot.registerCommand('bug', (msg, args) => {
    if (args.length === 0) return `**${msg.author.username}**, I need a bug report to submit.`;
    if (!/^.{0,1000}$/.test(args.join(' '))) return `**${msg.author.username}**, bug submitted, thanks!`;
    bot.createMessage('205805362320769024', `Bug submit from *${msg.author.username} (ID: ${msg.author.id})* in *${msg.channel.guild.name} (ID: ${msg.channel.guild.id})* **${args.join(' ')}**`).then(() => {
        bot.createMessage(msg.channel.id, `**${msg.author.username}**, bug submitted, thanks!`).catch(error => log.errC(error));
    }).catch(error => log.errC(error));
}, {
    aliases: ['report'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'error error.',
    fullDescription: 'use this command to submit a bug. Abuse will result in you being blacklisted.',
    usage: '<bug report>',
    cooldown: 20000
});

bot.registerCommand('respond', (msg, args) => {
    if (args.length === 0) return `**${msg.author.username}**, pass a user ID asshole.`;
    bot.getDMChannel(args[0]).then((c) => {
        args.splice(0, 1);
        bot.createMessage(c.id, `${args.join(' ')}`).catch(error => log.errC(error));
    }).catch(error => log.errC(error));
}, {
    caseInsensitive: true,
    deleteCommand: true,
    requirements: {
        userIDs: '102443042027372544'
    }
});
