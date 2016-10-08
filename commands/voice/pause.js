'use strict';
const bot = require('./../../index.js');

bot.registerCommand('pause', (msg, args) => {
    if (msg.channel.guild.members.get(bot.user.id).voiceState.channelID === null) return `**${msg.author.username}**, I'm not connected to a voice channel.`;
    if (msg.member.voiceState.channelID === null || msg.member.voiceState.channelID !== msg.channel.guild.members.get(bot.user.id).voiceState.channelID) return `**${msg.author.username}**, you must be in the same channel as me to use this command.`;
    let connection = bot.voiceConnections.get(msg.channel.guild.id);
    if (!connection.playing) return `**${msg.author.username}**, I'm not currently playing anything.`;
    if (connection.paused) {
        return `**${msg.author.username}**, I'm already paused.`;
    } else {
        connection.pause();
        return `**${msg.author.username}**, paused playback.`;
    }
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: 'pause audio.',
    fullDescription: 'pause playback.',
    serverOnly: true,
    requirements: {
        permissions: {
            'voiceConnect': true,
        }
    },
    cooldown: 5000
});
