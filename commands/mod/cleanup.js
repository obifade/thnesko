'use strict';
const bot = require('./../../index.js');
const log = require('./../../logger.js');

bot.registerCommand('cleanup', (msg, args) => {
    if (args.length === 0) return `**${msg.author.username}**, I need to know how many messages to search through. Specify all for no limit (will delete all messages in the channel).`;
    if (args[0] !== 'all' && isNaN(args[0]) || parseInt(args[0]) < 1) return `**${msg.author.username}**, Invalid input. Please make sure the value following ${msg.prefix}cleanup is a number, no less than 1 or 'all'.`;
    if (args[0] === 'all') {
        let toDel = -1;
    } else {
        let toDel = args[0];
    }
    bot.purgeChannel(msg.channel.id, args[0]).then((num) => {
        bot.createMessage(msg.channel.id, `**${msg.author.username}**, deleted ${num} messages successfully.`).catch(error => log.errC(error));
    }).catch(error => log.errC(error));
}, {
    aliases: ['clean', 'purge'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'bulk delete.',
    fullDescription: 'bulk delete a custom amount of messages from a channel, or purge it entirely.',
    usage: '<number of messages to delete> (use \'all\' for no limit - will delete all messages)',
    guildOnly: true,
    requirements: {
        permissions: {
            'manageMessages': true,
        }
    },
    cooldown: 5000
});

bot.commands.cleanup.registerSubcommand('user', (msg, args) => {
    if (args.length === 0) return `**${msg.author.username}**, please pass the username and discriminator of the person you would like to clean. e.g. username#1234 or mention them.`;
    if (!args[args.length - 1] || args[args.length - 1] !== 'all' && isNaN(args[args.length - 1]) || parseInt(args[args.length - 1]) < 1) return `**${msg.author.username}**, Invalid input. Please make sure the value following ${msg.prefix}cleanup user <user> is a number and no less than 1 or 'all'.`;
    let user;
    let amount;
    let toDel;
    if (msg.mentions.length > 0) {
        user = msg.mentions[0];
        amount === 'all' ? toDel = -1 : toDel = args[1];
        bot.purgeChannel(msg.channel.id, toDel, (logMsg) => {
            if (logMsg.author.id === user.id) return true;
        }).then((num) => {
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, successfully deleted ${num} messages belonging to ${user.username}#${user.discriminator}.`).catch(error => log.errC(error));
        }).catch(error => log.errC(error));
    } else {
        amount = args.pop();
        let match = /#\d{4}/.exec(args.join(' '));
        if (!match) return `**${msg.author.username}**, invalid input. Pass either a username and discriminator or a mention.`;
        let member = msg.channel.guild.members.find(m => m.user.username === args.join(' ').substring(0, match.index) && m.user.discriminator === args.join(' ').substring(match.index + 1, args.join(' ').length));
        if (!member) {
            bot.getMessages(msg.channel.id, 100).then((messages) => {
                let filtered = messages.filter(m => m.author.username === args.join(' ').substring(0, match.index) && m.author.discriminator === args.join(' ').substring(match.index + 1, args.join(' ').length));
                if (filtered.length > 0) {
                    user = {
                        id: filtered[0].author.id,
                        username: filtered[0].author.username,
                        discriminator: filtered[0].author.discriminator
                    };
                    amount === 'all' ? toDel = -1 : toDel = args[1];
                    bot.purgeChannel(msg.channel.id, toDel, (logMsg) => {
                        if (logMsg.author.id === user.id) return true;
                    }).then((num) => {
                        bot.createMessage(msg.channel.id, `**${msg.author.username}**, successfully deleted ${num} messages belonging to ${user.username}#${user.discriminator}.`).catch(error => log.errC(error));
                    }).catch(error => log.errC(error));
                } else {
                    bot.createMessage(msg.channel.id, `**${msg.author.username}**, sorry, I couldn't find that person in your guild. Nor could I find any of their messages in the past 100 sent in this channel.`).catch(error => log.errC(error));
                }
            }).catch(error => log.errC(error));
        } else {
            user = member.user;
            amount === 'all' ? toDel = -1 : toDel = args[1];
            bot.purgeChannel(msg.channel.id, toDel, (logMsg) => {
                if (logMsg.author.id === user.id) return true;
            }).then((num) => {
                bot.createMessage(msg.channel.id, `**${msg.author.username}**, successfully deleted ${num} messages belonging to ${user.username}#${user.discriminator}.`).catch(error => log.errC(error));
            }).catch(error => log.errC(error));
        }
    }
}, {
    aliases: ['u'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'bulk delete (user).',
    fullDescription: 'bulk delete a custom amount of messages from a channel belonging to a specific user. If the member is no longer in your server, the bot will search through the last 100 messages for that user.',
    usage: '<user mention or username and discriminator> <number of messages to delete> (use \'all\' for no limit - will delete all messages)',
    guildOnly: true,
    requirements: {
        permissions: {
            'manageMessages': true,
        }
    },
    cooldown: 5000
});

bot.commands.cleanup.registerSubcommand('contains', (msg, args) => {
    if (args.length === 0) return `**${msg.author.username}**, I need to know what the messages you want deleting should contain.`;
    bot.purgeChannel(msg.channel.id, -1, (logMsg) => {
        if (logMsg.content === args.join(' ')) return true;
    }).then((num) => {
        bot.createMessage(msg.channel.id, `**${msg.author.username}**, searched through and deleted ${num} messages containing '${args.join(' ')}'.`).catch(error => log.errC(error));
    }).catch(error => log.errC(error));
}, {
    aliases: ['c'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'bulk delete (message contents).',
    fullDescription: 'bulk delete messages with specific contents.',
    usage: '<contents messages to be deleted should contain>',
    guildOnly: true,
    requirements: {
        permissions: {
            'manageMessages': true,
        }
    },
    cooldown: 5000
});

bot.commands.cleanup.registerSubcommand('bot', (msg, args) => {
    bot.purgeChannel(msg.channel.id, -1, (logMsg) => {
        if (logMsg.author.id === bot.user.id) return true;
    }).then((num) => {
        bot.createMessage(msg.channel.id, `**${msg.author.username}**, successfully deleted ${num} messages belonging to myself.`).catch(error => log.errC(error));
    }).catch(error => log.errC(error));
}, {
    aliases: ['b', 'self'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'bulk delete (bot).',
    fullDescription: 'bulk delete messages from a channel belonging to myself.',
    guildOnly: true,
    requirements: {
        permissions: {
            'manageMessages': true,
        }
    },
    cooldown: 10000
});
