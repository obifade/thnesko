'use strict';
const bot = require('./../../index.js');
const log = require('./../../logger.js');

bot.registerCommand('ban', (msg, args) => {
    if (args.length === 0 || msg.mentions.length === 0 || args[0] !== `<@${msg.mentions[0].id}>`) return `**${msg.author.username}**, I need to know who to ban - tag them after ${msg.prefix}ban.`;
    if (msg.mentions.length > 1) return `**${msg.author.username}**, I can only ban one person at a time.`;
    if (msg.mentions[0].id === msg.channel.guild.ownerID) return `**${msg.author.username}**, this person is the owner of the server. No one can ban them.`;
    if (msg.mentions[0].id === bot.user.id) return `**${msg.author.username}**, bitch please. (seriously though, if you want to ban me, do it manually)`;
    let rolesOfBanner = msg.channel.guild.roles.filter(r => msg.member.roles.indexOf(r.id) > -1);
    let rolesOfBanned = msg.channel.guild.roles.filter(r => msg.channel.guild.members.get(msg.mentions[0].id).roles.indexOf(r.id) > -1);
    let highPositionOfBanner = 0;
    let highPositionOfBanned = 0;
    for (let i = 0; i < rolesOfBanner.length; i++) {
        if (rolesOfBanner[i].position > highPositionOfBanner) {
            highPositionOfBanner = rolesOfBanner[i].position;
        }
    }
    for (let i = 0; i < rolesOfBanned.length; i++) {
        if (rolesOfBanned[i].position > highPositionOfBanned) {
            highPositionOfBanned = rolesOfBanned[i].position;
        }
    }
    if (msg.author.id !== msg.channel.guild.ownerID) {
        if (highPositionOfBanned >= highPositionOfBanner) return `**${msg.author.username}**, this person is of equal or higher rank than you in the role hierarchy. If your role *should* be able to ban a person of this role, you need to re-order your role list.`;
    }
    let botRole = msg.channel.guild.roles.get(msg.channel.guild.members.get(bot.user.id).roles[0]).position;
    if (highPositionOfBanned >= botRole) return `**${msg.author.username}**, I cannot ban this person. They're of equal or higher rank than me. If you wish for me to be able to ban this person, move my role above theirs.`;
    bot.banGuildMember(msg.channel.guild.id, msg.mentions[0].id, 7).catch(error => log.errC(error));
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: 'ban a member.',
    fullDescription: 'ban a member from the server. Will delete 7 days worth of their messages.',
    usage: '<mention of user>',
    guildOnly: true,
    requirements: {
        permissions: {
            'banMembers': true,
        }
    },
    cooldown: 3000
});

bot.registerCommand('softban', (msg, args) => {
    if (args.length === 0 || msg.mentions.length === 0 || args[0] !== `<@${msg.mentions[0].id}>`) return `**${msg.author.username}**, I need to know who to softban - tag them after ${msg.prefix}softban.`;
    if (msg.mentions.length > 1) return `**${msg.author.username}**, I can only softban one person at a time.`;
    if (msg.mentions[0].id === msg.channel.guild.ownerID) return `**${msg.author.username}**, this person is the owner of the server. No one can softban them.`;
    if (msg.mentions[0].id === bot.user.id) return `**${msg.author.username}**, bitch please. (use ;cleanup bot)`;
    let rolesOfBanner = msg.channel.guild.roles.filter(r => msg.member.roles.indexOf(r.id) > -1);
    let rolesOfBanned = msg.channel.guild.roles.filter(r => msg.channel.guild.members.get(msg.mentions[0].id).roles.indexOf(r.id) > -1);
    let highPositionOfBanner = 0;
    let highPositionOfBanned = 0;
    for (let i = 0; i < rolesOfBanner.length; i++) {
        if (rolesOfBanner[i].position > highPositionOfBanner) {
            highPositionOfBanner = rolesOfBanner[i].position;
        }
    }
    for (let i = 0; i < rolesOfBanned.length; i++) {
        if (rolesOfBanned[i].position > highPositionOfBanned) {
            highPositionOfBanned = rolesOfBanned[i].position;
        }
    }
    if (msg.author.id !== msg.channel.guild.ownerID) {
        if (highPositionOfBanned >= highPositionOfBanner) return `**${msg.author.username}**, this person is of equal or higher rank than you in the role hierarchy. If your role *should* be able to softban a person of this role, you need to re-order your role list.`;
    }
    let botRole = msg.channel.guild.roles.get(msg.channel.guild.members.get(bot.user.id).roles[0]).position;
    if (highPositionOfBanned >= botRole) return `**${msg.author.username}**, I cannot softban this person. They're of equal or higher rank than me. If you wish for me to be able to softban this person, move my role above theirs.`;
    bot.banGuildMember(msg.channel.guild.id, msg.mentions[0].id, 7).then(() => {
        bot.unbanGuildMember(msg.channel.guild.id, msg.mentions[0].id).catch(error => log.errC(error));
    }).catch(error => log.errC(error));
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: 'softban a member.',
    fullDescription: 'softban a member from the server - ban then unban, deleting 7 days worth of messages.',
    usage: '<mention of user>',
    guildOnly: true,
    requirements: {
        permissions: {
            'banMembers': true,
        }
    },
    cooldown: 3000
});
