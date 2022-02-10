import {
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandStringOption,
    SlashCommandUserOption,
} from "@discordjs/builders";
import { Command } from "../Command";
import ExtendedClient from "../ExtendedClient";

export default new Command(
    new SlashCommandBuilder()
        .setName("modify")
        .addUserOption(
            new SlashCommandUserOption()
                .setName("user")
                .setRequired(true)
                .setDescription("User's actual name (and tag!)")
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("action")
                .addChoices([
                    ["add", "add"],
                    ["subtract", "subtract"],
                    ["clear", "clear"],
                    ["set", "set"],
                ])
                .setDescription("The action to do on this user")
                .setRequired(true)
        )
        .addIntegerOption(
            new SlashCommandIntegerOption()
                .setName("value")
                .setDescription("the amount")
        )
        .setDescription("Prints the top 10 profile picture changers"),
    async (intxn) => {
        const client = intxn.client;
        if (!(intxn.member?.user.id == client.botOwner?.id)) {
            intxn.reply(
                `You must be the creator of the bot to use this command`
            );
            return;
        }

        const user = await intxn.options.getUser("user", true).fetch();
        const action = intxn.options.getString("action", true);
        let value = intxn.options.getInteger("value");

        let currentValue = intxn.client.dbCache.data![user.id].total;

        if (!currentValue) {
            currentValue = 0;
        }
        if (!value) {
            value = 0;
        }
        switch (action) {
            case "add":
                client.dbCache.data![user.id].total += value;
                await intxn.reply(
                    `Increased ${user.username}'s count by ${value}`
                );
                break;
            case "subtract":
                client.dbCache.data![user.id].total -= value;
                await intxn.reply(
                    `Decreased ${user.username}'s count by ${value}`
                );
                break;
            case "clear":
                client.dbCache.data![user.id].total = 0;
                await intxn.reply(`Cleared ${user.username}'s count`);
                break;
            case "set":
                break;
            default:
                await intxn.reply(`Unknown action : ${action}`);
                return;
        }
        intxn.client.dbCache.write();
    }
);
