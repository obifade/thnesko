'use strict';
const bot = require('./../../index.js');
const auth = require('./../../auth.json');
const ytdl = require('ytdl-core');
const axios = require('axios');
const database = require('./../../database.json');
const log = require('./../../logger.js');
const queue = require('./join.js');

bot.registerCommand('play', (msg, args) => {
    if (msg.channel.guild.members.get(bot.user.id).voiceState.channelID === null) return `**${msg.author.username}**, I must be in a voice channel first. Use ${msg.prefix}join.`;
    if (msg.member.voiceState.channelID === null || msg.member.voiceState.channelID !== msg.channel.guild.members.get(bot.user.id).voiceState.channelID) return `**${msg.author.username}**, you must be in the same channel as me to use this command.`;
    if (args.length === 0) return `**${msg.author.username}**, please give me something to search for and play. Alternatively, type playlist after play to listen to the server playlist.`;
    let connection = bot.voiceConnections.get(msg.channel.guild.id);
    if (connection.playing && queue[connection.id].type === 'playlist') return `**${msg.author.username}**, I'm currently playing from the playlist, wait for it to finish or use ${msg.prefix}stop.`;
    if (queue[connection.id].info && queue[connection.id].info.length > 50) return `**${msg.author.username}**, sorry, your queue currently exceeds the maximum of 50 songs.`;
    let params = {
        key: auth.ytKey,
        q: args.join(' '),
        maxResults: 1,
        part: 'snippet',
        safeSearch: 'none',
        type: 'video'
    };
    axios.get('https://www.googleapis.com/youtube/v3/search', {
        params
    }).then((response) => {
        if (response.data.items.length > 0) {
            if (response.data.items[0].snippet.liveBroadcastContent === 'none') {
                let url = `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`;
                let title = response.data.items[0].snippet.title;
                url.replace(/'/g, '');
                title.replace(/'/g, '');
                if (connection.playing) {
                    if (!queue[connection.id].info) queue[connection.id].info = [];
                    let info = {
                        'link': url,
                        'title': title,
                        'channel': msg.channel.id
                    };
                    queue[connection.id].info.push(info);
                    bot.createMessage(msg.channel.id, `**${msg.author.username}**, added, ${title}, to the queue.`).catch(error => log.errC(error));

                } else {
                    bot.createMessage(msg.channel.id, `Now playing, ${title}, for **${msg.author.username}**.`).catch(error => log.errC(error));
                    connection.play(ytdl(url, {
                        filter: 'audioonly'
                    }));
                    queue[connection.id].type = 'queue';
                }
            } else {
                bot.createMessage(msg.channel.id, `**${msg.author.username}**, that's a livestream... I don't do livestreams.`).catch(error => log.errC(error));
            }
        } else {
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, there were no results returned for that search.`).catch(error => log.errC(error));
        }
    }).catch((response) => {
        log.errC(response);
        bot.createMessage(msg.channel.id, `**${msg.author.username}**, sorry, I ran into a problem searching for that.`).catch(error => log.errC(error));
    });
}, {
    aliases: ['p'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'play music.',
    fullDescription: 'play music from YouTube or add it to the queue if something is already playing.',
    usage: '<search query>',
    guildOnly: true,
    requirements: {
        permissions: {
            'voiceConnect': true,
        }
    },
    cooldown: 3000
});

bot.commands.play.registerSubcommand('playlist', (msg, args) => {
    if (msg.channel.guild.members.get(bot.user.id).voiceState.channelID === null) return `**${msg.author.username}**, I must be in a voice channel first. Use ${msg.prefix}join.`;
    if (msg.member.voiceState.channelID === null || msg.member.voiceState.channelID !== msg.channel.guild.members.get(bot.user.id).voiceState.channelID) return `**${msg.author.username}**, you must be in the same channel as me to use this command.`;
    let connection = bot.voiceConnections.get(msg.channel.guild.id);
    if (connection.playing && queue[connection.id].type === 'playlist') return `**${msg.author.username}**, I'm already playing from the playlist.`;
    if (connection.playing && queue[connection.id].type === 'queue') return `**${msg.author.username}**, I'm currently playing form the queue, wait for it to finish or use ${msg.prefix}stop.`;
    if (database[msg.channel.guild.id].serverPlaylist.length < 1) return `**${msg.author.username}**, your playlist is currently empty. Use ;playlist add to add songs to it.`;
    queue[connection.id] = {};
    queue[connection.id].index = 0;
    queue[connection.id].type = 'playlist';
    queue[connection.id].channel = msg.channel.id;
    if (database[msg.channel.guild.id].serverPlaylist.length > 1) { // Shuffle the playlist and info array in sync
        let l = database[msg.channel.guild.id].serverPlaylist.length,
            i = 0,
            rnd,
            tmp1,
            tmp2;
        while (i < l) {
            rnd = Math.floor(Math.random() * i);
            tmp1 = database[msg.channel.guild.id].serverPlaylist[i];
            tmp2 = database[msg.channel.guild.id].playlistInfo[i];
            database[msg.channel.guild.id].serverPlaylist[i] = database[msg.channel.guild.id].serverPlaylist[rnd];
            database[msg.channel.guild.id].playlistInfo[i] = database[msg.channel.guild.id].playlistInfo[rnd];
            database[msg.channel.guild.id].serverPlaylist[rnd] = tmp1;
            database[msg.channel.guild.id].playlistInfo[rnd] = tmp2;
            i += 1;
        }
    }
    connection.play(ytdl(database[msg.channel.guild.id].serverPlaylist[0], {
        filter: 'audioonly'
    }));
    bot.createMessage(msg.channel.id, `Now playing, ${database[msg.channel.guild.id].playlistInfo[0]}, from the server playlist for **${msg.author.username}**.`).catch(error => log.errC(error));
}, {
    caseInsensitive: true,
    description: 'play music.',
    fullDescription: 'play music from the server playlist.',
    requirements: {
        permissions: {
            'voiceConnect': true,
        }
    },
    cooldown: 3000
});
