import { Command } from "../lib/Command";

export default new Command(
    {
        name: "modify",
        description:
            "OWNER ONLY - Allows arbitrary modification of the numbers, just in case",
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

    async ({ client, member, options, reply }) => {
        if (!member) {
            reply(
                "I have no idea why I cannot read your member id. Because of that, I can't tell if you are the owner, and therefore am assuming you are not."
            );
            return;
        }
        if (!(member.user.id === client.botOwner.id)) {
            reply(`You must be the bot owner to use this command`);
            return;
        }

        const userArg = await options.getUser("user", true).fetch();
        const actionArg = options.getString("action", true);
        const valueArg = options.getInteger("value") || 0;

        switch (actionArg) {
            case "add":
                client.dbCache.data!.userData[userArg.id].total += valueArg;
                await reply(
                    `Increased ${userArg.username}'s count by ${valueArg}`
                );
                break;
            case "subtract":
                client.dbCache.data!.userData[userArg.id].total -= valueArg;
                await reply(
                    `Decreased ${userArg.username}'s count by ${valueArg}`
                );
                break;
            case "clear":
                client.dbCache.data!.userData[userArg.id].total = 0;
                await reply(`Cleared ${userArg.username}'s count`);
                break;
            case "set":
                break;
            default:
                await reply(`Unknown action : ${actionArg}`);
                return;
        }
        client.dbCache.write();
    },
    true
);
