'use strict';
const bot = require('./../../index.js');
const log = require('./../../logger.js');

bot.registerCommand('serverinfo', (msg, args) => {
    let response = `**${msg.author.username}**, \`\`\`xl\n` +
        `NAME: ${msg.channel.guild.name.toLowerCase()}\n` +
        `ID: ${msg.channel.guild.id}\n` +
        `OWNER: ${msg.channel.guild.members.get(msg.channel.guild.ownerID).user.username.toLowerCase()} (ID: ${msg.channel.guild.ownerID})\n` +
        `CREATED AT: ${new Date(msg.channel.guild.createdAt)}\n` +
        `DEFAULT CHANNEL: ${msg.channel.guild.defaultChannel.name}\n`;
    let afkChannel = msg.channel.guild.channels.get(msg.channel.guild.afkChannelID);
    if (afkChannel) response += `AFK CHANNEL: ${afkChannel.name.toLowerCase()}\n`;
    let channels = msg.channel.guild.channels.filter(c => c);
    response += `TEXT CHANNELS: ${channels.filter(c => c.type === 0).map(c => c.name).join(', ').toLowerCase()}\n` +
        `VOICE CHANNELS: ${channels.filter(c => c.type === 2).map(c => c.name).join(', ').toLowerCase()}\n` +
        `NUMBER OF MEMBERS: ${msg.channel.guild.members.filter(m => !m.user.bot).length}\n` +
        `NUMBER OF BOTS: ${msg.channel.guild.members.filter(m => m.user.bot).length}\n` +
        `REGION: ${msg.channel.guild.region.toLowerCase()}\n`;
    let roles = msg.channel.guild.roles;
    response += `ROLES: ${roles.map(m => m.name).join(', ').toLowerCase()}\`\`\``;
    if (msg.channel.guild.icon != null) response += `ICON: https://cdn.discordapp.com/icons/${msg.channel.guild.id}/${msg.channel.guild.icon}.jpg\n`;
    bot.createMessage(msg.channel.id, response).catch(error => log.errC(error));
}, {
    aliases: ['server-info', 's-info'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'info on a server.',
    fullDescription: 'get various pieces of information about the server.',
    guildOnly: true,
    cooldown: 5000
});
