import { Command } from "../lib/Command";

export default new Command(
    { name: "ping", description: "Replies with Pong!" },
    async (interaction) => {
        await interaction.reply("Pong!");
    }
);
