import { Intents } from "discord.js";
import { Config } from "./types";
import { ExtendedClient } from "./ExtendedClient";
import { commands } from "./commands";
import Keyv from "keyv";

export function runBot(keyv: Keyv<number>, config: Config) {
    const client = new ExtendedClient({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.DIRECT_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_PRESENCES,
            Intents.FLAGS.GUILD_MEMBERS,
        ],
        partials: ["CHANNEL"],
        userChangeCount: keyv,
        botOwner: config.botOwner,
    });
    client.on("ready", async (client) => {
        if (!(client instanceof ExtendedClient)) return;

        console.log(`Logged in as ${client.user.tag}!`);
        console.log(
            `Here's my invite: ${client.generateInvite({
                scopes: [
                    "bot",
                    "guilds.join",
                    "applications.commands",
                    "applications.store.update",
                ],
            })}`
        );

        // Trying to get rid of all undefined's
        console.log("Updating user list...");
        const users = client.users.cache;
        for (const [snowflake, user] of users) {
            if ((await client.userChangeCount.get(snowflake)) === undefined) {
                console.log(
                    `Adding ${user.tag} (${snowflake}) with a count of 0`
                );
                client.userChangeCount.set(snowflake, 0);
            }
        }
        console.log("Done!");

        await client.refreshSlashCommands(
            commands,
            config.appId,
            config.botToken
        );
    });
    // Add any users that join a guild that didn't exist before
    client.on("guildMemberAdd", async (member) => {
        if (!(member.client instanceof ExtendedClient)) {
            return;
        }
        if ((await client.userChangeCount.get(member.id)) === undefined) {
            console.log(
                `Member joined: Adding ${member.user.tag} (${member.id}) with a count of 0`
            );
            client.userChangeCount.set(member.id, 0);
        }
    });

    // Watch if a user changes their profile picture
    client.on("userUpdate", async (oldUser, newUser) => {
        if (oldUser.partial) {
            oldUser = await oldUser.fetch();
        }

        if (oldUser.avatar != newUser.avatar) {
            console.log(`${newUser.tag} has changed their avatar!`);
            if (oldUser.id !== newUser.id) {
                console.log(
                    `${newUser.tag} also somehow changed their id? Ignoring a probable error`
                );
                return;
            }
            const oldCount = await client.userChangeCount.get(newUser.id);

            if (oldCount === undefined) {
                console.log(
                    `${newUser.username}'s count undefined for some reason`
                );
                console.log(
                    `Adding ${newUser.tag} (${newUser.id}) with a count of 1`
                );
                client.userChangeCount.set(newUser.id, 1);
            } else {
                console.log(`Incrementing ${newUser.tag} (${newUser.id}) by 1`);
                client.userChangeCount.set(newUser.id, oldCount + 1);
            }
        } else {
            console.log(`${newUser.tag} changed something, idk what it was.`);
        }
    });

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        const command = commands.get(interaction.commandName);

        if (!command) {
            await interaction.reply({
                content: "Unknown command",
                ephemeral: true,
            });
            return;
        }

        try {
            await command.action(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    });

    client.on("guildCreate", async (guild) => {
        const members = await guild.members.fetch();
        for (const [_, member] of members) {
            if ((await client.userChangeCount.get(member.id)) === undefined) {
                console.log(
                    `Member joined: Adding ${member.user.tag} (${member.id}) with a count of 0`
                );
                client.userChangeCount.set(member.id, 0);
            }
        }
    });
    // client.on("messageCreate", (msg) => {
    //     if (msg.author.id != client.user?.id) {
    //         msg.author.send("Don't talk to me");
    //         const avatar = msg.author.avatarURL();
    //         if (avatar == null) {
    //             msg.author.send("no pfp?");
    //         } else {
    //             msg.author.send(avatar);
    //         }
    //     }
    // });

    client.login(config.botToken);
}

export default runBot;
