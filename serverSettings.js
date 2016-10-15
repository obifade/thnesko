'use strict';
const bot = require('./index.js');
const database = require('./database.json');
const auth = require('./auth.json');
const fs = require('fs');
const axios = require('axios');
const log = require('./logger.js');
let writing = false;
let updated = false;

setInterval(function () {
    if (updated === true) {
        if (writing) return;
        writing = true;
        fs.writeFile('./database.json', JSON.stringify(database, null, 2), (err) => {
            if (err) throw `[${new Date(Date.now())}]: Error writing to database: ${err}`;
            log.successC(`Database write successful.`);
            updated = false;
            writing = false;
        });
    }
}, 15000);

// ---------------------------------------------------- database entry management ----------------------------------------------------

let databaseAdd = function (guild) {
    if (database.hasOwnProperty(guild)) return;
    database[guild] = {
        'welcomeAnnouncement': false,
        'welcomeText': 'welcome to the server!',
        'privateWelcome': false,
        'leaveAnnouncement': false,
        'modAnnouncement': false,
        'serverPlaylist': [],
        'playlistInfo': [],
        'tags': {}
    }
    updated = true;
}

module.exports.databaseAdd = databaseAdd;

bot.on('guildCreate', (guild) => {
    databaseAdd(guild.id);
    log.botG(guild);
});

bot.on('guildDelete', (guild) => {
    if (!guild) return;
    log.botGD(guild);
    if (!database.hasOwnProperty(guild.id)) return;
    delete database[guild.id];
    updated = true;
});

// ---------------------------------------------------- announcements ----------------------------------------------------

bot.on('guildMemberRemove', (guild, member) => {
    if (database[guild.id].leaveAnnouncement === false) return;
    if (!member) return;
    bot.createMessage(guild.defaultChannel.id, `[${new Date(Date.now())}] **${member.user.username} (ID:${member.user.id})**, has left the server.`).catch(error => log.errC(error));
});

bot.on('guildBanAdd', (guild, user) => {
    if (database[guild.id].modAnnouncement === false) return;
    if (!user) return;
    bot.createMessage(guild.defaultChannel.id, `[${new Date(Date.now())}] **${user.username} (ID:${user.id})**, has been banned from the server.`).catch(error => log.errC(error));
});

bot.on('guildBanRemove', (guild, user) => {
    if (database[guild.id].modAnnouncement === false) return;
    if (!user) return;
    bot.createMessage(guild.defaultChannel.id, `[${new Date(Date.now())}] **${user.username} (ID:${user.id})**, has been unbanned from the server.`).catch(error => log.errC(error));
});

bot.on('guildMemberAdd', (guild, member) => {
    if (database[guild.id].welcomeAnnouncement === false) return;
    if (!member) return;
    if (database[guild.id].privateWelcome === true) {
        bot.getDMChannel(member.user.id).then((channel) => {
            bot.createMessage(channel.id, `**${member.user.username}**, ${database[guild.id].welcomeText} - sent from the guys over at ${guild.name}`).catch(error => log.errC(error));
        }).catch(error => log.errC(error));
    } else {
        bot.createMessage(guild.defaultChannel.id, `**${member.user.username}**, ${database[guild.id].welcomeText}`).catch(error => log.errC(error));
    }
});

// ---------------------------------------------------- announcement management ----------------------------------------------------

bot.registerCommand('leave-announcement', (msg, args) => {
    let currentState;
    database[msg.channel.guild.id].leaveAnnouncement === true ? currentState = 'enabled' : currentState = 'disabled';
    if (args.length === 0 || args[0] !== 'enable' && args[0] !== 'disable') return `**${msg.author.username}** please specify whether you want to enable or disable the leave message. Leave messages are currently ${currentState}.`;
    if (args[0] === 'enable' && currentState === 'enabled') {
        return `**${msg.author.username}** leave messages are already enabled for this server.`;
    } else if (args[0] === 'enable') {
        database[msg.channel.guild.id].leaveAnnouncement = true;
        updated = true;
        return `**${msg.author.username}** enabled leave messages for this server.`;
    }
    if (args[0] === 'disable' && currentState === 'disabled') {
        return `**${msg.author.username}** leave messages are already disabled for this server.`;
    } else if (args[0] === 'disable') {
        database[msg.channel.guild.id].leaveAnnouncement = false;
        updated = true;
        return `**${msg.author.username}**, disabled leave messages for this server.`;
    }
}, {
    aliases: ['leave-message', 'leave-announcements'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'leave message.',
    fullDescription: 'enable or disable the leave message.',
    usage: '<enable> OR <disable>',
    guildOnly: true,
    requirements: {
        permissions: {
            'manageGuild': true,
        }
    },
    cooldown: 3000
});

bot.registerCommand('mod-announcement', (msg, args) => {
    let currentState;
    database[msg.channel.guild.id].modAnnouncement === true ? currentState = 'enabled' : currentState = 'disabled';
    if (args.length === 0 || args[0] !== 'enable' && args[0] !== 'disable') return `**${msg.author.username}**, please specify whether you want to enable or disable the announcements. Mod announcements are currently ${currentState}.`;
    if (args[0] === 'enable') {
        if (currentState === 'enabled') return `**${msg.author.username}**, mod announcements are already enabled for this server.`;
        database[msg.channel.guild.id].modAnnouncement = true;
        updated = true;
        return `**${msg.author.username}**, enabled mod announcements for this server.`;
    } else if (args[0] === 'disable') {
        if (currentState === 'disabled') return `**${msg.author.username}**, mod announcements are already disabled for this server.`;
        database[msg.channel.guild.id].modAnnouncement = false;
        updated = true;
        return `**${msg.author.username}**, disabled mod announcements for this server.`;
    }
}, {
    aliases: ['mod-actions', 'mod-announcements', 'mod-message'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'ban and unban announcements.',
    fullDescription: 'enable or disable the announcements for mod actions. Includes: bans and unbans',
    usage: '<enable> OR <disable>',
    guildOnly: true,
    requirements: {
        permissions: {
            'manageGuild': true,
        }
    },
    cooldown: 3000
});

bot.registerCommand('welcome', (msg, args) => {
    let currentState;
    database[msg.channel.guild.id].welcomeAnnouncement === true ? currentState = 'enabled' : currentState = 'disabled';
    if (args.length === 0) return `**${msg.author.username}**, please specify whether you want to enable or disable the welcome message. Your welcome message is currently ${currentState}.`;
    if (args[0] === 'enable') {
        if (currentState === 'enabled') return `**${msg.author.username}**, welcome messages are already enabled for this server.`;
        database[msg.channel.guild.id].welcomeAnnouncement = true;
        updated = true;
        return `**${msg.author.username}**, enabled welcome messages for this server.`;
    } else if (args[0] === 'disable') {
        if (currentState === 'disabled') return `**${msg.author.username}**, welcome messages are already disabled for this server.`;
        database[msg.channel.guild.id].welcomeAnnouncement = false;
        updated = true;
        return `**${msg.author.username}**, disabled welcome messages for this server.`;
    } else if (args[0] === 'private') {
        if (database[msg.channel.guild.id].privateWelcome === true) return `**${msg.author.username}**, welcome messages are already private for this server.`;
        database[msg.channel.guild.id].privateWelcome = true;
        updated = true;
        return `**${msg.author.username}**, enabled private welcome messages for this server.`;
    } else if (args[0] === 'public') {
        if (database[msg.channel.guild.id].privateWelcome === false) return `**${msg.author.username}**, welcome messages are already public for this server.`;
        database[msg.channel.guild.id].privateWelcome = false;
        updated = true;
        return `**${msg.author.username}**, enabled public welcome messages for this server.`;
    }
}, {
    aliases: ['welcome-announcements', 'welcome-announcement', 'welcome-message'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'welcome messages.',
    fullDescription: 'enable or disable the welcome message.',
    usage: '<enable> OR <disable>',
    guildOnly: true,
    requirements: {
        permissions: {
            'manageGuild': true,
        }
    },
    cooldown: 3000
});

bot.commands.welcome.registerSubcommand('set', (msg, args) => {
    if (args.length === 0) {
        database[msg.channel.guild.id].welcomeText = 'welcome to the server!';
        updated = true;
        return `**${msg.author.username}**, the welcome message for this server has been reset to the default.`;
    } else {
        database[msg.channel.guild.id].welcomeText = args.join(' ');
        updated = true;
        return `**${msg.author.username}**, the welcome message for this server has been changed to '<username> ${args.join(' ')}'.`;
    }
}, {
    caseInsensitive: true,
    description: 'hello there, creature of earth.',
    fullDescription: 'set a custom welcome message. ALL welcome messages start with the username of the person who joined, this cannot be changed, so bare that in mind.',
    usage: '<welcome message>',
    requirements: {
        permissions: {
            'manageGuild': true,
        }
    },
    cooldown: 3000
});

// ---------------------------------------------------- prefix ----------------------------------------------------

bot.registerCommand('prefix', (msg, args) => {
    if (!database[msg.channel.guild.id].hasOwnProperty('prefixChar')) return `**${msg.author.username}**, this server isn't using a custom prefix.`;
    return `**${msg.author.username}**, (${database[msg.channel.guild.id].prefixChar}), is the current server prefix.`;
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: ';/.><#@][] All the prefixes.',
    fullDescription: 'set a custom prefix for your server. It is advisable this isn\'t a commonly used character to prevent accidental triggering.',
    guildOnly: true,
    requirements: {
        permissions: {
            'manageGuild': true,
        }
    },
    cooldown: 3000
});

bot.commands.prefix.registerSubcommand('set', (msg, args) => {
    if (args.length === 0) return `**${msg.author.username}**, please pass the prefix you would like to change to.`;
    if (!/^['!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]$/.test(args[0])) return `**${msg.author.username}**, sorry, that is not accepted as a prefix. use ;help prefix to see the list of accepeted.`;
    if (args[0] === ';') return `**${msg.author.username}**, that is the default prefix. Use ;prefix remove to change back to this if you're using a custom prefix.`;
    database[msg.channel.guild.id].prefixChar = args[0];
    bot.registerGuildPrefix(msg.channel.guild.id, args[0]);
    updated = true;
    return `**${msg.author.username}**, changed the custom prefix for this server to (${args[0]}).`;
}, {
    caseInsensitive: true,
    description: 'Allowed: !"#$%&\'()*+,-./:;<=>?@[\\/]^_`{|}~',
    fullDescription: 'set a custom prefix for your server. It is advisable this isn\'t a commonly used character to prevent accidental triggering.',
    usage: '<newPrefix>',
    requirements: {
        permissions: {
            'manageGuild': true,
        }
    },
    cooldown: 3000
});

bot.commands.prefix.registerSubcommand('remove', (msg, args) => {
    if (!database[msg.channel.guild.id].hasOwnProperty('prefixChar')) return `**${msg.author.username}**, this server isn't using a custom prefix.`;
    delete database[msg.channel.guild.id].prefixChar;
    bot.registerGuildPrefix(msg.channel.guild.id, ';');
    updated = true;
    return `**${msg.author.username}**, removed the custom prefix for this server.`;
}, {
    caseInsensitive: true,
    description: 'remove custom prefix.',
    fullDescription: 'remove the custom prefix for your server and use the default bot prefix.',
    requirements: {
        permissions: {
            'manageGuild': true,
        }
    },
    cooldown: 3000
});

// ---------------------------------------------------- playlist ----------------------------------------------------

bot.registerCommand('playlist', (msg, args) => {
    if (database[msg.channel.guild.id].serverPlaylist.length === 0) return `**${msg.author.username}**, your guild playlist is currently empty.`;
    let reply = [];
    let playlist = [];
    for (let i = 0; i < database[msg.channel.guild.id].playlistInfo.length; i++) {
        playlist.push(`[${i + 1}] ${database[msg.channel.guild.id].playlistInfo[i]} | `);
        if (playlist.join(' ').length >= 1700) {
            reply.push(playlist);
            playlist = [];
        }
    }
    if (playlist.length > 0) reply.push(playlist);
    let num = 0;
    let sendPlaylist = function () {
        bot.createMessage(msg.channel.id, `\`\`\`xl\n${reply[num].join(' ')}\n\`\`\``).then((msg) => {
            num += 1;
            if (num < reply.length) setTimeout(sendPlaylist, 1000);
        }).catch(error => log.errC(error));
    }
    bot.createMessage(msg.channel.id, `**${msg.author.username}**, here is your server playlist:\n\`\`\`xl\n${reply[0].join(' ')}\`\`\``).then((msg) => {
        num += 1;
        if (num < reply.length) setTimeout(sendPlaylist, 1000);
    }).catch(error => log.errC(error));
}, {
    caseInsensitive: true,
    deleteCommand: true,
    description: 'view the server playlist.',
    fullDescription: 'review the contents of your server playlist.',
    guildOnly: true,
    requirements: {
        permissions: {
            'voiceConnect': true,
        }
    },
    cooldown: 3000
});

bot.commands.playlist.registerSubcommand('add', (msg, args) => {
    if (database[msg.channel.guild.id].serverPlaylist.length > 150) return `**${msg.author.username}**, sorry, your guild playlist has reached the maximum of 150 songs. Consider removing some using ;playlist remove <#number>.`;
    if (args.length === 0) return `**${msg.author.username}**, please add a song by the title or from a YouTube playlist with ;playlist add playlist <playlist name>.`;
    if (args[0] === 'playlist') {
        args.splice(0, 1);
        if (args.length < 1) return `**${msg.author.username}**, please specify the name of the playlist you wish to add from.`;
        let params = {
            key: auth.ytKey,
            q: args.join(' '),
            maxResults: 1,
            part: 'snippet',
            type: 'playlist'
        };
        axios.get('https://www.googleapis.com/youtube/v3/search', {
            params
        }).then((response) => {
            if (response.data.items.length < 1) {
                bot.createMessage(msg.channel.id, `**${msg.author.username}**, there were no results returned for that search.`).catch(error => log.errC(error));
            } else {
                let title = response.data.items[0].snippet.title
                let params = {
                    key: auth.ytKey,
                    maxResults: 50,
                    part: 'snippet',
                    playlistId: response.data.items[0].id.playlistId
                };
                axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
                    params
                }).then((response) => {
                    if (response.data.items.length < 1) {
                        bot.createMessage(msg.channel.id, `**${msg.author.username}**, that seems to be an empty playlist.`).catch(error => log.errC(error));
                    } else {
                        for (let i = 0; i < response.data.items.length; i++) {
                            if (database[msg.channel.guild.id].serverPlaylist.length >= 150) break;
                            database[msg.channel.guild.id].serverPlaylist.push(`https://www.youtube.com/watch?v=${response.data.items[i].snippet.resourceId.videoId}`);
                            database[msg.channel.guild.id].playlistInfo.push(`${response.data.items[i].snippet.title.replace(/'/g, '')}`);
                        }
                        updated = true;
                        bot.createMessage(msg.channel.id, `**${msg.author.username}**, added songs from the YouTube playlist, ${title}, to the server playlist.`).catch(error => log.errC(error));
                    }
                }).catch((response) => {
                    log.errC(response);
                    bot.createMessage(msg.channel.id, `**${msg.author.username}**, sorry, I ran into a problem searching for that.`).catch(error => log.errC(error));
                });
            }
        }).catch((response) => {
            log.errC(response);
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, sorry, I ran into a problem searching for that.`).catch(error => log.errC(error));
        });
    } else {
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
                if (response.data.items[0].snippet.liveBroadcastContent === 'none') {
                    let url = `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`;
                    let title = response.data.items[0].snippet.title;
                    database[msg.channel.guild.id].serverPlaylist.push(url);
                    database[msg.channel.guild.id].playlistInfo.push(title.replace(/'/g, ''));
                    bot.createMessage(msg.channel.id, `**${msg.author.username}**, added - ${title.replace(/'/g, '')} - to the server playlist.`).catch(error => log.errC(error));
                    updated = true;
                } else {
                    bot.createMessage(msg.channel.id, `**${msg.author.username}**, that's a livestream... I don't do livestreams.`).catch(error => log.errC(error));
                }
            } else {
                bot.createMessage(msg.channel.id, `**${msg.author.username}**, there were no results returned for that search.`).catch(error => log.errC(error));
            }
        }).catch((response) => {
            log.errC(response);
            bot.createMessage(msg.channel.id, `**${msg.author.username}**, sorry, I ran into a problem searching for that.`).catch(error => log.errC(error));
        });
    }
}, {
    caseInsensitive: true,
    description: 'bring the music to the playlist.',
    fullDescription: 'add a song to the server playlist.',
    usage: '<song name> OR playlist <playlist name> e.g. ;playlist add playlist <name> (max of 50 songs from a single playlist)',
    requirements: {
        permissions: {
            'voiceConnect': true,
        }
    },
    cooldown: 3000
});

bot.commands.playlist.registerSubcommand('remove', (msg, args) => {
    if (database[msg.channel.guild.id].serverPlaylist.length === 0) return `**${msg.author.username}**, your guild playlist is currently empty.`;
    if (args.length === 0 || isNaN(args[0])) return `**${msg.author.username}**, please specify the song to remove by the valid playlist index number. use ;playlist to view your playlist.`;
    if (args[0] > database[msg.channel.guild.id].serverPlaylist.length || args[0] <= 0) return `**${msg.author.username}**, please specify a valid playlist number.`;
    bot.createMessage(msg.channel.id, `**${msg.author.username}**, removed ${database[msg.channel.guild.id].playlistInfo[args[0] - 1]} from the server playlist.`).catch(error => log.errC(error));
    database[msg.channel.guild.id].serverPlaylist.splice(args[0] - 1, 1);
    database[msg.channel.guild.id].playlistInfo.splice(args[0] - 1, 1);
    updated = true;
}, {
    caseInsensitive: true,
    description: 'remove music form the playlist.',
    fullDescription: 'remove a song from the server playlist.',
    usage: '<song number>',
    requirements: {
        permissions: {
            'voiceConnect': true,
        }
    },
    cooldown: 3000
});

bot.commands.playlist.registerSubcommand('clear', (msg, args) => {
    if (database[msg.channel.guild.id].serverPlaylist.length === 0) return `**${msg.author.username}**, your guild playlist is currently empty.`;
    database[msg.channel.guild.id].serverPlaylist = [];
    database[msg.channel.guild.id].playlistInfo = [];
    updated = true;
    return `**${msg.author.username}**, cleared this server's playlist.`;
}, {
    caseInsensitive: true,
    description: 'clear your playlist.',
    fullDescription: 'clears your playlist entirely.',
    requirements: {
        permissions: {
            'voiceConnect': true,
            'manageGuild': true,
        }
    },
    cooldown: 5000
});

// ---------------------------------------------------- server tags ----------------------------------------------------

bot.registerCommand('tag', (msg, args) => {
    if (Object.keys(database[msg.channel.guild.id].tags).length === 0) return `**${msg.author.username}**, your guild currently has no tags.`;
    if (args.length === 0) return `**${msg.author.username}**, please specify the tag you wish to use. If you're not sure, use ;tag search to search for a tag.`;
    if (!database[msg.channel.guild.id].tags.hasOwnProperty(args.join(' ').toLowerCase())) return `**${msg.author.username}**, no such tag found.`;
    return database[msg.channel.guild.id].tags[args.join(' ').toLowerCase()].tag;
}, {
    aliases: ['tags'],
    caseInsensitive: true,
    deleteCommand: true,
    description: 'use one of your server tags.',
    fullDescription: 'allows you to use one of your guild tags.',
    usage: '<tag name>',
    guildOnly: true,
    cooldown: 3000
});

bot.commands.tag.registerSubcommand('add', (msg, args) => {
    if (Object.keys(database[msg.channel.guild.id].tags).length >= 20) return `**${msg.author.username}**, your guild currently exceeds the maximum of 20 tags.`;
    if (args.length === 0 || args.length < 3 || args.indexOf('|') < 0) return `**${msg.author.username}**, please specify the tag name and what the tag should return separated by a vertical bar. e.g. ;tag add <tag name> | <tag>`;
    if (msg.attachments.length > 0) return `**${msg.author.username}**, I don't currently support adding attachments as tags; if you wish to use an image as a tag, upload it to an image hosting service and use the link.`;
    let tagName = args.slice(0, args.indexOf('|')).join(' ').toLowerCase();
    let tagContents = args.slice(args.indexOf('|') + 1, args.length).join(' ');
    let tagOwner = `${msg.author.id}`;
    if (database[msg.channel.guild.id].tags.hasOwnProperty(tagName)) return `**${msg.author.username}**, a tag with this name already exists.`;
    if (tagName === tagContents.toLowerCase()) return `**${msg.author.username}**, the tag name and tag contents cannot be the same.`;
    database[msg.channel.guild.id].tags[tagName] = {
        tag: tagContents,
        owner: tagOwner,
        created: Date.now()
    };
    updated = true;
    return `**${msg.author.username}**, added the tag, ${tagName}, with the contents, ${tagContents}.`;
}, {
    caseInsensitive: true,
    description: 'add a tag.',
    fullDescription: 'add a tag to your server tags.',
    usage: '<tag name> | <tag contents>',
    cooldown: 3000
});

bot.commands.tag.registerSubcommand('remove', (msg, args) => {
    if (Object.keys(database[msg.channel.guild.id].tags).length === 0) return `**${msg.author.username}**, your guild currently has no tags.`;
    if (args.length === 0) return `**${msg.author.username}**, please specify the name of the tag you wish to remove.`;
    if (!database[msg.channel.guild.id].tags.hasOwnProperty(args.join(' ').toLowerCase())) return `**${msg.author.username}**, no such tag found.`;
    let perms = msg.member.permission.json;
    if (!perms.manageMessages && msg.author.id !== database[msg.channel.guild.id].tags[args.join(' ').toLowerCase()].owner) return `**${msg.author.username}**, you cannot remove a tag you do not own or do not have the manageMessages permission.`;
    delete database[msg.channel.guild.id].tags[args.join(' ').toLowerCase()];
    updated = true;
    return `**${msg.author.username}**, removed the tag, ${args.join(' ').toLowerCase()}.`;
}, {
    caseInsensitive: true,
    description: 'remove a tag.',
    fullDescription: 'remove a tag you own from your server tags.',
    usage: '<tag name>',
    cooldown: 3000
});

bot.commands.tag.registerSubcommand('search', (msg, args) => {
    if (Object.keys(database[msg.channel.guild.id].tags).length === 0) return `**${msg.author.username}**, your guild currently has no tags.`;
    if (args.length === 0) return `**${msg.author.username}**, please specify the name of the tag you wish to search for.`;
    if (!database[msg.channel.guild.id].tags.hasOwnProperty(args.join(' ').toLowerCase())) return `**${msg.author.username}**, no such tag found.`;
    if (msg.author.id !== database[msg.channel.guild.id].tags[args.join(' ').toLowerCase()].owner) return `**${msg.author.username}**, you cannot remove a tag you do not own.`;
    let result = `\`\`\`\n`;
    result += `Tag Name: ${args.join(' ').toLowerCase()}\n`;
    result += `Tag: ${database[msg.channel.guild.id].tags[args.join(' ').toLowerCase()].tag}\n`;
    result += `Owner(ID): ${database[msg.channel.guild.id].tags[args.join(' ').toLowerCase()].owner}\n`;
    let ownerMember = msg.channel.guild.members.get(database[msg.channel.guild.id].tags[args.join(' ').toLowerCase()].owner);
    if (ownerMember) result += `Owner(username): ${ownerMember.user.username}#${ownerMember.user.discriminator}\n`;
    result += `Created at: ${new Date(database[msg.channel.guild.id].tags[args.join(' ').toLowerCase()].created)}`;
    result += '\n```';
    return `**${msg.author.username}**, info for that tag:\n${result}`;
}, {
    caseInsensitive: true,
    description: 'search for a tag.',
    fullDescription: 'search a tag from your server tags. Will return info on that tag if found.',
    usage: '<tag name>',
    cooldown: 3000
});

bot.commands.tag.registerSubcommand('clear', (msg, args) => {
    if (Object.keys(database[msg.channel.guild.id].tags).length === 0) return `**${msg.author.username}**, your guild currently has no tags.`;
    for (let tag in database[msg.channel.guild.id].tags) delete database[msg.channel.guild.id].tags[tag];
    updated = true;
    return `**${msg.author.username}**, cleared the tags for this server.`;
}, {
    caseInsensitive: true,
    description: 'clear tags.',
    fullDescription: 'remove all tags from the server.',
    requirements: {
        permissions: {
            'manageGuild': true,
        }
    },
    cooldown: 5000
});
