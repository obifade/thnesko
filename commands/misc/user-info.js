'use strict';
const bot = require('./../../index.js');
const log = require('./../../logger.js');

bot.registerCommand('userinfo', (msg, args) => {
    if (args.length === 0) {
        let response = `**${msg.author.username}**, \`\`\`xl\n` +
            `ID: ${msg.author.id.toLowerCase()}\n` +
            `USERNAME: ${msg.author.username.toLowerCase()}\n` +
            `DISCRIM: ${msg.author.discriminator}\n` +
            `CREATED AT: ${new Date(msg.author.createdAt)}\n` +
            `STATUS: ${msg.member.status.toLowerCase()}\n` +
            `----GUILD SPECIFIC INFO----\n` +
            `JOINED AT: ${new Date(msg.member.joinedAt)}\n`;
        let nick = msg.member.nick;
        if (nick) response += `NICKNAME: ${nick.toLowerCase()}\n`;
        let roleIDs = msg.member.roles;
        let roles = msg.channel.guild.roles.filter(r => roleIDs.indexOf(r.id) > -1);
        if (roles.length > 0) response += `ROLES: ${roles.map(r => r.name).join(' ').toLowerCase()}`;
        response += `\`\`\``;
        if (msg.author.avatar != null) response += `AVATAR: ${msg.author.avatarURL}\n`;
        bot.createMessage(msg.channel.id, response).catch(error => log.errC(error));
    } else {
        if (msg.mentions.length > 0) return `**${msg.author.username}**, please don't mention somebody to get their info, pass their username and discrim instead; like so: username#1234.`;
        let match = /#\d{4}/.exec(args.join(' '));
        if (!match) return `**${msg.author.username}**, invalid input. Pass a username and discriminator.`;
        let name = args.join(' ').substring(0, match.index);
        let discrim = args.join(' ').substring(match.index + 1, args.join(' ').length);
        let member = msg.channel.guild.members.find(m => m.user.username === name && m.user.discriminator === discrim);
        if (!member) return `**${msg.author.username}**, couldn't find such a user. e.g. username#1234`;
        let user = member.user;
        let response = `**${msg.author.username}**, \`\`\`xl\n` +
            `ID: ${user.id.toLowerCase()}\n` +
            `USERNAME: ${user.username.toLowerCase()}\n` +
            `DISCRIM: ${user.discriminator}\n` +
            `CREATED AT: ${new Date(user.createdAt)}\n` +
            `STATUS: ${msg.channel.guild.members.get(msg.author.id).status.toLowerCase()}\n` +
            `----GUILD SPECIFIC INFO----\n` +
            `JOINED AT: ${new Date(member.joinedAt)}\n`;
        let nick = member.nick;
        if (nick) response += `NICKNAME: ${nick.toLowerCase()}\n`;
        let roleIDs = member.roles;
        let roles = msg.channel.guild.roles.filter(r => roleIDs.indexOf(r.id) > -1);
        if (roles.length > 0) response += `ROLES: ${roles.map(r => r.name).join(' ').toLowerCase()}`;
        response += `\`\`\``;
        if (user.avatar != null) response += `AVATAR: ${user.avatarURL}\n`;
        bot.createMessage(msg.channel.id, response).catch(error => log.errC(error));
    }
}, {
    aliases: ['user-info', 'u-info'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'info on a user.',
    fullDescription: 'get various pieces of information about yourself or another user.',
    guildOnly: true,
    usage: '<username and discriminator of user> --optional, omit if viewing info of self',
    cooldown: 5000
});
