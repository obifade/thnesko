'use strict';
const Eris = require('eris');
const auth = require('./auth.json');
const database = require('./database.json');
const bot = new Eris.CommandClient(auth.discordToken, {
    autoReconnect: true,
    getAllUsers: true,
    disableEvents: {
        'TYPING_START': true
    }
}, {
    defaultHelpCommand: false,
    description: 'Multi-purpose Discord bot built using Eris.',
    ignoreBots: true,
    ignoreSelf: true,
    name: 'thnesko',
    owner: 'obi-fade-kenobi',
    prefix: ';'
});
module.exports = bot;
const commands = require('require-all')(__dirname + '/commands');
const serverSettings = require('./serverSettings.js');
const log = require('./logger.js');

bot.on('ready', () => {
    log.successC(`Ready for: ${bot.guilds.size} server(s) with a total of ${bot.users.filter(u => !u.bot).length} user(s) and ${bot.users.filter(u => u.bot).length} bot(s)`);
    // account for guilds added whilst bot wasn't online
    let guilds = bot.guilds.map(g => g.id);
    for (let i = 0; i < guilds.length; i++) {
        if (!database.hasOwnProperty(guilds[i])) {
            serverSettings.databaseAdd(guilds[i]);
        }
    }
    // account for something which will probably never happen
    for (let guild in database) {
        if (guilds.indexOf(guild) < 0) delete database[guild];
    }
    // register guild prefixes
    for (let guild in database) {
        if (database[guild].hasOwnProperty('prefixChar')) {
            bot.registerGuildPrefix(guild, database[guild].prefixChar);
        }
    }
});

bot.registerCommand('help', (msg, args) => {
    let result = '';
    if (args.length > 0) {
        let cur = bot.commands[bot.commandAliases[args[0]] || args[0]];
        if (!cur) {
            return '**Command not found**';
        }
        var label = cur.label;
        for (let i = 1; i < args.length; i++) {
            cur = cur.subcommands[cur.subcommandAliases[args[i]] || args[i]];
            if (!cur) {
                return '**Command not found**';
            }
            label += ' ' + cur.label;
        }
        result += `**${msg.prefix}${label}** ${cur.usage}\n${cur.fullDescription}\n`;
        if (cur.cooldown) result += `**Cooldown:** ${cur.cooldown}ms`;
        if (Object.keys(cur.aliases).length > 0) {
            result += `\n\n**Aliases:** ${cur.aliases.join(', ')}`;
        }
        if (Object.keys(cur.subcommands).length > 0) {
            result += '\n\n**Subcommands:**';
            for (let subLabel in cur.subcommands) {
                if (cur.subcommands[subLabel].permissionCheck(msg)) {
                    result += `\n  **${subLabel}** - ${cur.subcommands[subLabel].description}`;
                    if (cur.cooldown) result += ` **Cooldown:** ${cur.cooldown}ms`;
                }
            }
        }
    } else {
        let generalCommands = '';
        let modCommands = '';
        let musicCommands = '';
        result += `${bot.commandOptions.name} - ${bot.commandOptions.description}\n`;
        if (bot.commandOptions.owner) {
            result += `by ${bot.commandOptions.owner}\n`;
        }
        result += '';
        for (label in bot.commands) {
            let cmdReq = bot.commands[label].requirements.permissions
            if (bot.commands[label].permissionCheck(msg)) {
                if (cmdReq.voiceConnect === true) {
                    musicCommands += `${msg.prefix}${label.toUpperCase()} - ${bot.commands[label].description.toLowerCase()}\n`;
                } else if (cmdReq.banMembers === true || cmdReq.kickMembers === true || cmdReq.manageMessages === true || cmdReq.manageGuild === true) {
                    modCommands += `${msg.prefix}${label.toUpperCase()} - ${bot.commands[label].description.toLowerCase()}\n`;
                } else {
                    generalCommands += `${msg.prefix}${label.toUpperCase()} - ${bot.commands[label].description.toLowerCase()}\n`;
                }
            }
        }
        if (musicCommands.length > 0) musicCommands = '\n**Music Commands:**\n' + musicCommands;
        if (modCommands.length > 0) modCommands = '\n**Mod Commands:**\n' + modCommands;
        if (generalCommands.length > 0) generalCommands = '\n**General Commands:**\n' + generalCommands;
        result += generalCommands;
        result += modCommands;
        result += musicCommands;
        result += `\nType ${msg.prefix}help <command> for more info on a command.\n\n*Note: if a command fails to execute with no response, you are most likely on a cooldown; use ;help <command name> to view cooldown times*`;
    }
    bot.getDMChannel(msg.author.id).then((c) => {
        bot.createMessage(c.id, result).catch(error => log.errC(error));
    }).catch(error => log.errC(error));
}, {
    description: 'bot help info',
    fullDescription: 'this command is used to view information of different bot commands, including this one.',
    aliases: ['thnesko'],
    caseInsensitive: true,
    deleteCommand: true,
    cooldown: 2000
});

bot.registerCommand('logout', (msg, args) => {
    bot.disconnect({
        autoreconnect: false
    });
    setTimeout(function () {
        process.exit(0);
    }, 2000);
}, {
    caseInsensitive: true,
    deleteCommand: false,
    requirements: {
        userIDs: '102443042027372544'
    }
});

bot.on('error', (err) => {
    log.errC(`Error: ${err}`);
    process.exit(0);
});

bot.on('warn', (message, id) => {
    log.warnC(`Warn: ${message}`);
});

bot.on("disconnect", () => {
    log.errC(`Disconnected.`);
    process.exit(0);
});

bot.connect();

process.on('unhandledRejection', (reason, p) => {
    log.warnC('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

process.on('uncaughtException', function (err) {
    // meew's hacky work around
    // handle ECONNRESETs caused by `next` or `destroy`
    if (err.code == 'ECONNRESET') {
        log.warnC('Got an ECONNRESET! This is *probably* not an error. Stacktrace:');
        log.errC(err.stack);
    } else {
        // normal error handling
        log.errC(err);
        log.errC(err.stack);
        process.exit(0);
    }
});

process.on('exit', (code) => {
    log.errC(`Exiting with code: ${code}`);
});
