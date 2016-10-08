'use strict';
const bot = require('./../../index.js');
const google = require('google');
const log = require('./../../logger.js');

bot.registerCommand('google', (msg, args) => {
    if (args.length === 0) return `**${msg.author.username}**, you need to give me something to search for.`;
    google(args.join(' '), function (err, res) {
        if (err || !res || !res.links || res.links.length === 0) {
            log.errC(err);
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, sorry, I couldn't find anything for that or there was an error.`).catch(error => log.errC(error));
        } else {
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, <${res.links[0].link}>\n"${res.links[0].description}"`).catch(error => log.errC(error));
        }
    });
}, {
    aliases: ['search', 'g', 'lookup'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'Google it.',
    fullDescription: 'search Google for something and return the first link, feeling lucky, punk?',
    serverOnly: true,
    usage: '<search query>',
    cooldown: 3000
});
