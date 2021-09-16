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

        const user = (
            await interaction.guild.members.search({
                query: "TBI",
                limit: 1,
            })
        ).first();

        if (!user) {
            await interaction.reply(`Hmm, I didn't find anybody`);
        } else {
            await interaction.reply(
                `${
                    user.displayName
                } has changed their profile picture ${await interaction.client.userChangeCount.get(
                    user.id
                )} times!`
            );
        }
    }
);
