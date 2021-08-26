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
    async (interaction) => {
        if (!(interaction.client instanceof ExtendedClient)) {
            interaction.reply(
                "Something went horribly wrong, tell the developer that the Client isn't an ExtendedClient"
            );
            return;
        }
        if (!interaction.guild) {
            interaction.reply("This command doesn't work outside of a guild");
            return;
        }

        const user = await interaction.options.getUser("user", true).fetch();
        const action = interaction.options.getString("action", true);
        let value = interaction.options.getInteger("value");

        let currentValue = await interaction.client.userChangeCount.get(
            user.id
        );
        if (!currentValue) {
            currentValue = 0;
        }
        if (!value) {
            value = 0;
        }
        switch (action) {
            case "add":
                interaction.client.userChangeCount.set(
                    user.id,
                    currentValue + value
                );
                await interaction.reply(
                    `Increased ${user.username}'s count by ${value}`
                );
                return;
            case "subtract":
                interaction.client.userChangeCount.set(
                    user.id,
                    currentValue - value
                );
                await interaction.reply(
                    `Decreased ${user.username}'s count by ${value}`
                );
                return;
            case "clear":
                interaction.client.userChangeCount.set(user.id, 0);
                await interaction.reply(`Cleared ${user.username}'s count`);
                return;
            case "set":
                break;
            default:
                await interaction.reply(`Unknown action : ${action}`);
                return;
        }
    }
);
