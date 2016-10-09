'use strict';
const bot = require('./../../index.js');
const ytdl = require('ytdl-core');
const database = require('./../../database.json');
const log = require('./../../logger.js');
const queue = {};

bot.registerCommand('join', (msg, args) => {
    if (msg.channel.guild.members.get(bot.user.id).voiceState.channelID !== null) return `**${msg.author.username}**, I'm already connected to a channel in this server.`;
    if (msg.member.voiceState.channelID === null) return `**${msg.author.username}**, you must be connected to a voice channel in this server to use this command.`;
    bot.joinVoiceChannel(msg.member.voiceState.channelID).then((connection) => {
        queue[connection.id] = {};
        connection.on('error', error => log.errC(error));
        connection.on('end', () => {
            if (queue[connection.id].type === 'playlist') {
                if (database[msg.channel.guild.id].serverPlaylist.length > queue[connection.id].index + 1) {
                    queue[connection.id].index += 1;
                    connection.play(ytdl(database[connection.id].serverPlaylist[queue[connection.id].index], {
                        filter: 'audioonly'
                    }));
                    bot.createMessage(queue[connection.id].channel, `Now playing, ${database[connection.id].playlistInfo[queue[connection.id].index]}, from the server playlist.`).catch(error => log.errC(error));
                } else {
                    bot.createMessage(queue[connection.id].channel, `Finished playing from the server playlist.`).catch(error => log.errC(error));
                    queue[connection.id] = {};
                }
            } else if (queue[connection.id].type === 'queue') {
                if (queue[connection.id].info && queue[connection.id].info.length >= 1) {
                    connection.play(ytdl(queue[connection.id].info[0].link, {
                        filter: 'audioonly'
                    }));
                    bot.createMessage(queue[connection.id].info[0].channel, `Now playing, ${queue[connection.id].info[0].title}, from the queue.`).catch(error => log.errC(error));
                    queue[connection.id].info.splice(0, 1);
                } else {
                    queue[connection.id] = {};
                }
            } else if (queue[connection.id].type === 'leaving') {
                delete queue[connection.id];
                bot.leaveVoiceChannel(connection.channelID);
            }
        });
        connection.on('debug', (message) => {
            log.warnC(`Voice debug message: ${message}`);
        });
        connection.on('warn', (message) => {
            log.warnC(`Voice warning: ${message}`);
        });
        bot.createMessage(msg.channel.id, `Joined ${msg.channel.guild.channels.get(connection.channelID).name} for ${msg.author.username}. Ready for ;play.`).catch(error => log.errC(error));
    }).catch(error => log.errC(error));
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: 'join a voice channel.',
    fullDescription: 'make the bot join a voice channel, preparing for the sounds of music.',
    serverOnly: true,
    requirements: {
        permissions: {
            'voiceConnect': true,
        }
    },
    cooldown: 5000
});

module.exports = queue;
