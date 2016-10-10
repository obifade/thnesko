'use strict';
const bot = require('./../../index.js');
const axios = require('axios');
const log = require('./../../logger.js');

bot.registerCommand('roll', (msg, args) => {
    if (args.length === 0 || !/^\d+d{1}\d+/.test(args.join(' '))) return `**${msg.author.username}**, Invalid syntax. e.g. ;roll 1d6.`;
    let uri = encodeURIComponent(args.join(' '));
    axios.get('https://rolz.org/api/?' + uri + '.json').then((response) => {
        if (typeof response.data.result === 'string' && response.data.result.startsWith('invalid dice code')) {
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, ${response.data.result}`).catch(error => log.errC(error));
        } else {
            let roll = response.data;
            if (roll.details == null) bot.createMessage(msg.channel.id, `**${msg.author.username}**, ${roll.result}`).catch(error => log.errC(error));
            if (roll.details.length <= 100) bot.createMessage(msg.channel.id, `**${msg.author.username}**, 🎲 Your ${roll.input} resulted in ${roll.result} ${roll.details}`).catch(error => log.errC(error));
            else bot.createMessage(msg.channel.id, `**${msg.author.username}**, 🎲 Your ${roll.input} resulted in ${roll.result}.`).catch(error => log.errC(error));
        }
    }).catch((response) => {
        log.errC(response);
        if (response.status === 429) {
            log.errC(`rate limit hit: ${response}`);
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, wew, looks like it's rate limit time. Chill out on the command usage and retry later.`).catch(error => log.errC(error));
        } else if (response.status !== 200) {
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, sorry, I ran into a problem.`).catch(error => log.errC(error));
        }
    });
}, {
    aliases: ['dice'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'roll dice.',
    fullDescription: 'RPG dice roller.',
    usage: '<dice roll> e.g 1d6+2d4/2',
    cooldown: 5000
});
