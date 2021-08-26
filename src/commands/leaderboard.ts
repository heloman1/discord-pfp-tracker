import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember } from "discord.js";
import { Command } from "../Command";
import ExtendedClient from "../ExtendedClient";

export default new Command(
    new SlashCommandBuilder()
        .setName("leaderboard")
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

        const memberCounts: {
            member: GuildMember;
            changeCount?: number;
        }[] = [];
        for (const [snowflake, member] of interaction.guild.members.cache) {
            memberCounts.push({
                member: member,
                changeCount: await interaction.client.userChangeCount.get(
                    snowflake
                ),
            });
        }
        memberCounts.sort((a, b) => {
            if (a.changeCount === b.changeCount) {
                return a.member.displayName.localeCompare(b.member.displayName);
            } else {
                // if both changeCount's are undefined
                // the above if statement would handle it
                if (a.changeCount === undefined) {
                    return 1;
                } else if (b.changeCount === undefined) {
                    return -1;
                }
                return b.changeCount - a.changeCount;
            }
        });

        const out = memberCounts
            .slice(0, 10)
            .map((val) => {
                return `${val.member.displayName} ${
                    val.member.user.bot ? "(Bot)" : ""
                } (${val.member.user.tag}) : ${val.changeCount}`;
            })
            .join("\n");
        await interaction.reply(`${out}`);
    }
);
