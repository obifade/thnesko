'use strict';
const bot = require('./../../index.js');
const axios = require('axios');
const log = require('./../../logger.js');

bot.registerCommand('xkcd', (msg, args) => {
    if (args.length > 0 && isNaN(args[0])) return `**${msg.author.username}**, please pass me a comic number or ;xkcd to get the current comic.`;
    let idURL = args[0] ? args[0] + '/' : '';
    axios.get(`http://xkcd.com/${idURL}info.0.json`).then((response) => {
        bot.createMessage(msg.channel.id, `**${msg.author.username}**, ${response.data.title} \n ${response.data.alt} \n ${response.data.img}`).catch(error => log.errC(error));
    }).catch((response) => {
        if (response.response.status === 404) {
            log.errC(`rate limit hit: ${response}`);
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, I couldn't find a comic of that number. It is likely higher than the current.`).catch(error => log.errC(error));
        } else {
            log.errC(response);
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, sorry, I ran into a problem.`).catch(error => log.errC(error));
        }
    });
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: 'return a custom or the current XKCD comic.',
    fullDescription: 'a webcomic of romance, sarcasm, math, and language.',
    serverOnly: true,
    usage: '<comic number> --optional, omit if you want the current comic',
    cooldown: 3000
});
