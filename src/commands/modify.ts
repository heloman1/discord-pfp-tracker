import { Command } from "../Command";

export default new Command(
    {
        name: "modify",
        description: "Prints the top 10 profile picture changers",
        options: [
            {
                name: "user",
                description: "User's name (and tag!)",
                type: "USER",
                required: true,
            },
            {
                name: "action",
                description: "The action to do on this user",
                type: "STRING",
                choices: [
                    { name: "add", value: "add" },
                    { name: "subtract", value: "subtract" },
                    { name: "clear", value: "clear" },
                    { name: "set", value: "set" },
                ],
                required: true,
            },
            { name: "value", description: "the amount", type: "INTEGER" },
        ],
    },

    async (intxn) => {
        const client = intxn.client;
        if (!(intxn.member?.user.id == client.botOwner?.id)) {
            intxn.reply(
                `You must be the creator of the bot to use this command`
            );
            return;
        }

        const userArg = await intxn.options.getUser("user", true).fetch();
        const actionArg = intxn.options.getString("action", true);
        const valueArg = intxn.options.getInteger("value") || 0;

        switch (actionArg) {
            case "add":
                client.dbCache.data![userArg.id].total += valueArg;
                await intxn.reply(
                    `Increased ${userArg.username}'s count by ${valueArg}`
                );
                break;
            case "subtract":
                client.dbCache.data![userArg.id].total -= valueArg;
                await intxn.reply(
                    `Decreased ${userArg.username}'s count by ${valueArg}`
                );
                break;
            case "clear":
                client.dbCache.data![userArg.id].total = 0;
                await intxn.reply(`Cleared ${userArg.username}'s count`);
                break;
            case "set":
                break;
            default:
                await intxn.reply(`Unknown action : ${actionArg}`);
                return;
        }
        intxn.client.dbCache.write();
    }
);
