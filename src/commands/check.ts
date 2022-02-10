import { Command } from "../Command";

export default new Command(
    {
        name: "check",
        description:
            "Prints the number of times a user has changed their profile picture",
        options: [
            {
                name: "user",
                required: true,
                description: "A user to check",
                type: "USER",
            },
        ],
    },
    async (interaction) => {
        if (!interaction.guild) {
            interaction.reply("This command doesn't work outside of a guild");
            return;
        }

        const userArg = interaction.options.getUser("user")?.username;
        if (!userArg) {
            await interaction.reply(
                `Uh, how did you run this command without a user?`
            );
            return;
        }

        const user = (
            await interaction.guild.members.search({
                query: userArg,
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
