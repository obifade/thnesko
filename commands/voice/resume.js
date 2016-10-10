'use strict';
const bot = require('./../../index.js');

bot.registerCommand('resume', (msg, args) => {
    if (msg.channel.guild.members.get(bot.user.id).voiceState.channelID === null) return `**${msg.author.username}**, I'm not connected to a channel.`;
    if (msg.member.voiceState.channelID === null || msg.member.voiceState.channelID !== msg.channel.guild.members.get(bot.user.id).voiceState.channelID) return `**${msg.author.username}**, you must be in the same channel as me to use this command.`;
    let connection = bot.voiceConnections.get(msg.channel.guild.id);
    if (!connection.playing) return `**${msg.author.username}**, I'm not currently playing anything.`;
    if (connection.paused) {
        connection.resume();
        return `**${msg.author.username}**, resumed playback.`;
    } else {
        return `**${msg.author.username}**, I'm not currently paused.`;
    }
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: 'resume music.',
    fullDescription: 'resume playback.',
    guildOnly: true,
    requirements: {
        permissions: {
            'voiceConnect': true,
        }
    },
    cooldown: 5000
});
