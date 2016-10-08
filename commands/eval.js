'use strict';
const bot = require('./../index.js');
const database = require('./../database.json');
const now = require('performance-now');
const util = require('util');

// stolen from https://github.com/Kraigie/craig-bot/blob/master/commands/eval.js
bot.registerCommand('eval', (msg, args) => {
    let before = now();

    try {
        let evald = eval(args.join(' '));
        evald = util.inspect(evald);

        if (evald && evald.length > 1800) evald = evald.substring(0, 1800);
        let after = now();

        let retStr = `\`\`\`javascript\n` +
            `Input: ${args.join(' ')}\n` +
            `Output: ${evald}\n` +
            `Time: ${(after - before).toFixed(3)} ms\`\`\``;

        return retStr;
    } catch (err) {
        let after = now();

        let retStr = `\`\`\`javascript\n` +
            `Input: ${args.join(' ')}\n` +
            `Error: ${err}\n` +
            `Time: ${(after - before).toFixed(3)} ms\`\`\``;

        return retStr;
    }
}, {
    caseInsensitive: true,
    deleteCommand: true,
    requirements: {
        userIDs: '102443042027372544'
    }
});
