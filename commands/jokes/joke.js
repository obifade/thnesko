const bot = require('./../../index.js');
const axios = require('axios');
const log = require('./../../logger.js');

bot.registerCommand('joke', (msg, args) => {
    axios.get('http://tambal.azurewebsites.net/joke/random').then((response) => {
        bot.createMessage(msg.channel.id, `**${msg.author.username}**, ${response.data.joke}`).catch(error => log.errC(error));
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
    caseInsensitive: true,
    deleteCommand: true,
    description: 'What did one bot say to the other bot? (╯°□°）╯︵ ┻━┻ To which the bot replied, ┬─┬﻿ ノ( ゜-゜ノ).',
    fullDescription: 'get a random joke, so random, I don\'t even know what kind of jokes they are to even tell you.',
    cooldown: 3000
});

bot.commands.joke.registerSubcommand('yomamma', (msg, args) => {
    axios.get('http://api.yomomma.info/').then((response) => {
        if (!response.data.joke) {
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, sorry, I ran into a problem.`).catch(error => log.errC(error));
        } else {
            if (msg.mentions.length === 0) {
                bot.createMessage(msg.channel.id, `**${msg.author.username}**, ${response.data.joke}`).catch(error => log.errC(error));
            } else {
                bot.createMessage(msg.channel.id, `**${msg.channel.guild.members.get(msg.mentions[0].id).user.username}**, ${response.data.joke}`).catch(error => log.errC(error));
            }
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
    aliases: ['yo-mamma'],
    caseInsensitive: true,
    description: 'yo-mamma joke.',
    fullDescription: 'yo mamma so fat...',
    usage: '<mention of someone to insult> --optional (laugh with them, not at them)',
    cooldown: 3000
});

bot.commands.joke.registerSubcommand('chuck', (msg, args) => {
    axios.get('http://api.icndb.com/jokes/random').then((response) => {
        if (response.data.type !== 'success') {
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, sorry, I ran into a problem.`).catch(error => log.errC(error));
        } else {
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, ${response.data.value.joke}`).catch(error => log.errC(error));
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
    caseInsensitive: true,
    description: 'Chuck Norris jokes.',
    fullDescription: 'get a random joke Chuck Norris joke.',
    cooldown: 3000
});
