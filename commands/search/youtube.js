'use strict';
const bot = require('./../../index.js');
const axios = require('axios');
const auth = require('./../../auth.json');
const log = require('./../../logger.js');

bot.registerCommand('youtube', (msg, args) => {
    if (args.length === 0) return `**${msg.author.username}**, you need to give me something to search for.`;
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
            let url = `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`;
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, here's the first video I found: ${url}`).catch(error => log.errC(error));
        } else {
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, there were no results returned for that search.`).catch(error => log.errC(error));
        }
    }).catch((response) => {
        log.errC(response);
        bot.createMessage(msg.channel.id, `**${msg.author.username}**, sorry, I ran into a problem.`).catch(error => log.errC(error));
    });
}, {
    aliases: ['yt', 'video', 'vid'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'YouTube search.',
    fullDescription: 'search YouTube for something and return the first video, feeling lucky, punk?',
    serverOnly: true,
    usage: '<search query>',
    cooldown: 3000
});
