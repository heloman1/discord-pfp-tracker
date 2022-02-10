import {
    SlashCommandBuilder,
    SlashCommandUserOption,
} from "@discordjs/builders";
import { Command } from "../Command";
import ExtendedClient from "../ExtendedClient";

export default new Command(
    new SlashCommandBuilder()
        .setName("check")
        .addUserOption(
            new SlashCommandUserOption()
                .setName("user")
                .setRequired(true)
                .setDescription("A user to check!")
        )
        .setDescription(
            "Prints the number of times a user has changed their profile picture"
        ),
    async (interaction) => {
        if (!interaction.guild) {
            interaction.reply("This command doesn't work outside of a guild");
            return;
        }

        const searchUser = interaction.options.getUser("user")?.username;
        if (!searchUser) {
            await interaction.reply(
                `Uh, how did you run this command without a user?`
            );
            return;
        }

        const user = (
            await interaction.guild.members.search({
                query: searchUser,
                limit: 1,
            })
        ).first();

        if (!user) {
            await interaction.reply(`Hmm, I didn't find anybody`);
        } else {
            const changeCount = interaction.client.dbCache.data![user.id].total;
            await interaction.reply(
                `${
                    user.displayName
                } has changed their profile picture ${changeCount} time${
                    changeCount === 1 ? "" : "s"
                }!`
            );
        }
    }
);
