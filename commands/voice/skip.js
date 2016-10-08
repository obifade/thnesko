'use strict';
const bot = require('./../../index.js');
const database = require('./../../database.json');
const queue = require('./join.js');

bot.registerCommand('skip', (msg, args) => {
    if (msg.channel.guild.members.get(bot.user.id).voiceState.channelID === null) return `**${msg.author.username}**, I'm not connected to a voice channel.`;
    if (msg.member.voiceState.channelID === null || msg.member.voiceState.channelID !== msg.channel.guild.members.get(bot.user.id).voiceState.channelID) return `**${msg.author.username}**, you must be in the same channel as me to use this command.`;
    let connection = bot.voiceConnections.get(msg.channel.guild.id);
    if (!connection.playing) return `**${msg.author.username}**, there's nothing to skip to.`;
    if (queue[connection.id].type === 'queue') {
        if (!queue[connection.id].info || queue[connection.id].info.length < 1) return `**${msg.author.username}**, there's nothing in the queue to skip to.`;
        connection.stopPlaying();
        return `**${msg.author.username}**, skipped to the next track in the queue.`;
    } else if (queue[connection.id].type === 'playlist') {
        if (database[msg.channel.guild.id].serverPlaylist.length <= queue[connection.id].index + 1) return `**${msg.author.username}**, there's nothing in your playlist to skip to.`;
        connection.stopPlaying();
        return `**${msg.author.username}**, skipped to the next track in the playlist.`;
    }
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: 'skip a track.',
    fullDescription: 'skip to the next track in the queue or playlist.',
    serverOnly: true,
    requirements: {
        permissions: {
            'voiceConnect': true,
        }
    },
    cooldown: 3000
});
