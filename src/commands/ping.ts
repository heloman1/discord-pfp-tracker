import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";

export default new Command(
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
    async (interaction) => {
        await interaction.reply("Pong!");
    }
);
