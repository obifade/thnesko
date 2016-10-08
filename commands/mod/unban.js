'use strict';
const bot = require('./../../index.js');
const log = require('./../../logger.js');

bot.registerCommand('unban', (msg, args) => {
    if (args.length === 0) return `**${msg.author.username}**, I need to know who to unban, type their username and discriminator after ;unban.`;
    let match = /#\d{4}/.exec(args.join(' '));
    if (!match) return `**${msg.author.username}**, invalid input. Pass a username and discriminator. (If you don't know these, unban them in server settings or use a better mod bot)`;
    bot.getGuildBans(msg.channel.guild.id).then((bans) => {
        let name = args.join(' ').substring(0, match.index);
        let discrim = args.join(' ').substring(match.index + 1, args.join(' ').length);
        let toUnban = bans.find(u => u.username === name && u.discriminator === discrim);
        if (!toUnban) {
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, that user doesn't seem to be banned. Ensure you typed their username and discriminator correctly. Like so: username#1234`).catch(error => log.errC(error));
        } else {
            bot.unbanGuildMember(msg.channel.guild.id, toUnban.id).catch(error => log.errC(error));
        }
    }).catch(error => log.errC(error));
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: 'unban a member.',
    fullDescription: 'unban a member from the server.',
    usage: '<username and discriminator of user to unban> (not a nickname)',
    serverOnly: true,
    requirements: {
        permissions: {
            'banMembers': true,
        }
    },
    cooldown: 3000
});
