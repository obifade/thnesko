'use strict';
const bot = require('./../../index.js');
const axios = require('axios');
const log = require('./../../logger.js');

bot.registerCommand('define', (msg, args) => {
    if (args.length === 0) return `**${msg.author.username}**, I need a word to define.`;
    let uri = encodeURIComponent(args.join(' '));
    axios.get(`http://api.pearson.com/v2/dictionaries/ldoce5/entries?headword=${uri}&limit=5`).then((response) => {
        if (response.data.results.length > 0 && response.data.status === 200) {
            let result = `**${msg.author.username}**, definitions for, ${args.join(' ')}:\n`;
            for (let i = 0; i < response.data.count; i++) {
                result += `${i + 1}: ${response.data.results[i].senses[0].definition[0]}\n`;
            }
            bot.createMessage(msg.channel.id, `${result}`).catch(error => log.errC(error));
        } else {
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, sorry, I couldn't find anything for that word.`).catch(error => log.errC(error));
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
    aliases: ['definition', 'definitions', 'meaning'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'define a word.',
    fullDescription: 'get the definition(s) of a word from the Longman Dictionary of Contemporary English (5th edition).',
    usage: '<word>',
    cooldown: 5000
});

bot.registerCommand('synonyms', (msg, args) => {
    if (args.length === 0) return `**${msg.author.username}**, I need a word to get synonyms for.`;
    let uri = encodeURIComponent(args.join(' '));
    axios.get(`https://api.datamuse.com/words?ml=${uri}`).then((response) => {
        if (response.data.length > 0) {
            let result = '';
            if (response.data.length < 5) {
                for (let i = 0; i < response.data.length; i++) {
                    result += `${i + 1}: ${response.data[i].word}\n`;
                }
            } else {
                for (let i = 0; i < 5; i++) {
                    result += `${i + 1}: ${response.data[i].word}\n`;
                }
            }
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, synonyms for, ${args.join(' ')}:\n${result}`).catch(error => log.errC(error));
        } else {
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, sorry, I couldn't find any synonyms for that word.`).catch(error => log.errC(error));
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
    aliases: ['synonym'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'synonyms of a word.',
    fullDescription: 'get the synonym(s) of a word.',
    usage: '<word>',
    cooldown: 5000
});
