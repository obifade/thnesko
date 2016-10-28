'use strict';
const bot = require('./../../index.js');
const log = require('./../../logger.js');

bot.registerCommand('kick', (msg, args) => {
    if (args.length === 0 || msg.mentions.length === 0 || args[0] !== `<@${msg.mentions[0].id}>`) return `**${msg.author.username}**, I need to know who to kick, tag them after ${msg.prefix}kick.`;
    if (msg.mentions.length > 1) return `**${msg.author.username}**, I can only kick one person at a time.`;
    if (msg.mentions[0].id === msg.channel.guild.ownerID) return `**${msg.author.username}**, this person is the owner of the server. No one can kick them.`;
    if (msg.mentions[0].id === bot.user.id) return `**${msg.author.username}**, bitch please. (seriously though, if you want to kick me, do it manually)`;
    let rolesOfKicker = msg.channel.guild.roles.filter(r => msg.member.roles.indexOf(r.id) > -1);
    let rolesOfKicked = msg.channel.guild.roles.filter(r => msg.channel.guild.members.get(msg.mentions[0].id).roles.indexOf(r.id) > -1);
    let highPositionOfKicker = 0;
    let highPositionOfKicked = 0;
    for (let i = 0; i < rolesOfKicker.length; i++) {
        if (rolesOfKicker[i].position > highPositionOfKicker) {
            highPositionOfKicker = rolesOfKicker[i].position;
        }
    }
    for (let i = 0; i < rolesOfKicked.length; i++) {
        if (rolesOfKicked[i].position > highPositionOfKicked) {
            highPositionOfKicked = rolesOfKicked[i].position;
        }
    }
    if (msg.author.id !== msg.channel.guild.ownerID) {
        if (highPositionOfKicked >= highPositionOfKicker) return `**${msg.author.username}**, this person is of equal or higher rank than you in the role hierarchy. If your role *should* be able to kick a person of this role, you need to re-order your role list.`;
    }
    let botRole = msg.channel.guild.roles.get(msg.channel.guild.members.get(bot.user.id).roles[0]).position;
    if (highPositionOfKicked >= botRole) return `**${msg.author.username}**, I cannot kick this person. They're of equal or higher rank than me. If you wish for me to be able to kick this person, move my role above theirs.`;
    bot.kickGuildMember(msg.channel.guild.id, msg.mentions[0].id).catch(error => log.errC(error));
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: 'kick a member.',
    fullDescription: 'kicks a member from the server.',
    usage: '<mention of user>',
    guildOnly: true,
    requirements: {
        permissions: {
            'kickMembers': true,
        }
    },
    cooldown: 3000
});
