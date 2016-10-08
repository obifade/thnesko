'use strict';
const bot = require('./../../index.js');
const _cleverbot = require('cleverbot-node');
const cleverbot = new _cleverbot;
const log = require('./../../logger.js');

bot.registerCommand('cleverbot', (msg, args) => {
    if (args.length === 0) return `**${msg.author.username}** what's up, fam?`;
    _cleverbot.prepare(function () {
        cleverbot.write(args.join(' '), function (response) {
            if (response) {
                bot.createMessage(msg.channel.id, `**${msg.author.username}**, "*${args.join(' ')}*" -\n${response.message}`).catch(error => log.errC(error));
            } else {
                log.errC('Error with cleverbot');
                bot.createMessage(msg.channel.id, `**${msg.author.username}**, sorry, I ran into a problem.`).catch(error => log.errC(error));
            }
        });
    });
}, {
    aliases: ['ask', '8ball'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'no, the cheese does not drive.',
    fullDescription: 'ask Cleverbot something and have it reply.',
    serverOnly: true,
    usage: '<statement>',
    cooldown: 2000
});
