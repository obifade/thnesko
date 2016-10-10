'use strict';
const bot = require('./../../index.js');
const queue = require('./join.js');

bot.registerCommand('stop', (msg, args) => {
    if (msg.channel.guild.members.get(bot.user.id).voiceState.channelID === null) return `**${msg.author.username}**, I'm not connected to a voice channel.`;
    if (msg.member.voiceState.channelID === null || msg.member.voiceState.channelID !== msg.channel.guild.members.get(bot.user.id).voiceState.channelID) return `**${msg.author.username}**, you must be in the same channel as me to use this command.`;
    let connection = bot.voiceConnections.get(msg.channel.guild.id);
    if (connection.playing) {
        queue[connection.id] = {};
        connection.stopPlaying();
        return `**${msg.author.username}**, stopped playback.`;
    } else {
        return `**${msg.author.username}**, I'm not playing anything.`;
    }
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: 'stop the music.',
    fullDescription: 'stop playback.',
    guildOnly: true,
    requirements: {
        permissions: {
            'voiceConnect': true,
        }
    },
    cooldown: 3000
});
