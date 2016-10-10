'use strict';
const bot = require('./../../index.js');
const axios = require('axios');
const log = require('./../../logger.js');

bot.registerCommand('overwatch', (msg, args) => {
    if (args.length !== 2) return `**${msg.author.username}**, please pass the appropriate arguments. Use ;help overwatch to see usage.`;
    if (!/^[^0-9]{1}[a-zA-Z0-9\u00E0-\u00FC]{2,12}#\d{4}$/.test(args[0])) return `**${msg.author.username}**, please pass a valid BattleTag and Identifier (BattleTag#1234).`;
    if (args[1] !== 'xbl' && args[1] !== 'psn' && args[1] !== 'pc') return `**${msg.author.username}**, please pass a valid platform. Either pc, xbl (xbox live), or psn (playstation network).`;
    bot.createMessage(msg.channel.id, `**${msg.author.username}**, searching...`).catch(error => log.errC(error));
    let url;
    switch (args[1]) {
        case 'pc':
            url = `https://owapi.net/api/v3/u/${args[0].replace('#', '-')}/stats`;
            break;
        case 'xbl':
            url = `https://owapi.net/api/v3/u/${args[0].replace('#', '-')}/stats?platform=xbl`;
            break;
        case 'psn':
            url = `https://owapi.net/api/v3/u/${args[0].replace('#', '-')}/stats?platform=psn`;
    }
    axios.get(url).then((response) => {
        if (response.data.us === null && response.data.eu === null && response.data.kr === null) {
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, no data was returned for that query. That BattleTag probably doesn't exist or the wrong platform or Identifier was specified.`);
        } else {
            let reg;
            if (response.data.us !== null) {
                reg = 'us';
            } else if (response.data.eu !== null) {
                reg = 'eu';
            } else if (response.data.kr !== null) {
                reg = 'kr';
            }
            let reply = '\n**QUICKPLAY**\n\n***Overall stats:***\n```xl\n';
            if (response.data[reg].stats.quickplay.overall_stats === undefined) {
                reply += 'No stats found.';
            } else {
                for (let stat in response.data[reg].stats.quickplay.overall_stats) {
                    reply += `${stat}: ${response.data[reg].stats.quickplay.overall_stats[stat]}\n`;
                }
            }
            reply += '```\n***Average stats:***\n```xl\n';
            if (response.data[reg].stats.quickplay.average_stats === undefined) {
                reply += 'No stats found.';
            } else {
                for (let stat in response.data[reg].stats.quickplay.average_stats) {
                    reply += `${stat}: ${response.data[reg].stats.quickplay.average_stats[stat].toFixed(4)}\n`;
                }
            }
            reply += '```\n**COMPETITIVE**\n\n***Overall stats:***\n```xl\n';
            if (response.data[reg].stats.competitive.overall_stats === undefined) {
                reply += 'No stats found.';
            } else {
                for (let stat in response.data[reg].stats.competitive.overall_stats) {
                    reply += `${stat}: ${response.data[reg].stats.competitive.overall_stats[stat]}\n`;
                }
            }
            reply += '```\n***Average stats:***\n```xl\n';
            if (response.data[reg].stats.competitive.average_stats === undefined) {
                reply += 'No stats found.';
            } else {
                for (let stat in response.data[reg].stats.competitive.average_stats) {
                    reply += `${stat}: ${response.data[reg].stats.competitive.average_stats[stat].toFixed(4)}\n`;
                }
            }
            reply += '```';
            reply = reply.replace(/_/g, ' ');
            reply = `__**Showing stats for, ${args[0]}**__\n` + reply;
            reply += '\n*Average stats are rounded to 4 decimal places.*\n';
            bot.getDMChannel(msg.author.id).then((c) => {
                bot.createMessage(c.id, `${reply}`).catch(error => log.errC(error));
            }).catch(error => log.errC(error));
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
    aliases: ['ow'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'summarised stats for Overwatch.',
    fullDescription: 'lookup the overall stats of a player in Overwatch.',
    usage: '<battle tag> (including Identifier) <platform> (pc, xbl, or psn)',
    cooldown: 5000
});

bot.commands.overwatch.registerSubcommand('achievements', (msg, args) => {
    if (args.length !== 2) return `**${msg.author.username}**, please pass the appropriate arguments. Use ;help overwatch to see usage.`;
    if (!/^[^0-9]{1}[a-zA-Z0-9\u00E0-\u00FC]{2,12}#\d{4}$/.test(args[0])) return `**${msg.author.username}**, please pass a valid BattleTag and Identifier (BattleTag#1234).`;
    if (args[1] !== 'xbl' && args[1] !== 'psn' && args[1] !== 'pc') return `**${msg.author.username}**, please pass a valid platform. Either pc, xbl (xbox live), or psn (playstation network).`;
    bot.createMessage(msg.channel.id, `**${msg.author.username}**, searching...`).catch(error => log.errC(error));
    let url;
    switch (args[1]) {
        case 'pc':
            url = `https://owapi.net/api/v3/u/${args[0].replace('#', '-')}/achievements`;
            break;
        case 'xbl':
            url = `https://owapi.net/api/v3/u/${args[0].replace('#', '-')}/achievements?platform=xbl`;
            break;
        case 'psn':
            url = `https://owapi.net/api/v3/u/${args[0].replace('#', '-')}/achievements?platform=psn`;
    }
    axios.get(url).then((response) => {
        if (response.data.us === null && response.data.eu === null && response.data.kr === null) {
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, no data was returned for that query. That Battle Tag probably doesn't exist or the wrong platform was specified.`);
        } else {
            let reg;
            if (response.data.us !== null) {
                reg = 'us';
            } else if (response.data.eu !== null) {
                reg = 'eu';
            } else if (response.data.kr !== null) {
                reg = 'kr';
            }
            let reply = `\n***Defense:***\n`;
            for (let achievement in response.data[reg].achievements.defense) {
                reply += `${achievement}: ${response.data[reg].achievements.defense[achievement]}\n`;
            }
            reply += `\n***Offense:***\n`;
            for (let achievement in response.data[reg].achievements.offense) {
                reply += `${achievement}: ${response.data[reg].achievements.offense[achievement]}\n`;
            }
            reply += `\n***Support:***\n`;
            for (let achievement in response.data[reg].achievements.support) {
                reply += `${achievement}: ${response.data[reg].achievements.support[achievement]}\n`;
            }
            reply += `\n***General:***\n`;
            for (let achievement in response.data[reg].achievements.general) {
                reply += `${achievement}: ${response.data[reg].achievements.general[achievement]}\n`;
            }
            reply += `\n***Tank:***\n`;
            for (let achievement in response.data[reg].achievements.tank) {
                reply += `${achievement}: ${response.data[reg].achievements.tank[achievement]}\n`;
            }
            reply += `\n***Maps:***\n`;
            for (let achievement in response.data[reg].achievements.maps) {
                reply += `${achievement}: ${response.data[reg].achievements.maps[achievement]}\n`;
            }
            reply = reply.replace(/_/g, ' ').replace(/true/g, '✓').replace(/false/g, '✗');
            reply = `__**Showing achievements for, ${args[0]}**__\n` + reply;
            bot.getDMChannel(msg.author.id).then((c) => {
                bot.createMessage(c.id, `${reply}`).catch(error => log.errC(error));
            }).catch(error => log.errC(error));
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
    aliases: ['achievement'],
    caseInsensitive: true,
    description: 'achievements for Overwatch.',
    fullDescription: 'lookup the achievements of a player in Overwatch.',
    usage: '<battle tag> (including Identifier) <platform> (pc, xbl, or psn)',
    cooldown: 5000
});
