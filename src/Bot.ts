import { DMChannel, Intents } from "discord.js";
import { Config, LowDBSchema } from "./lib/types";
import ExtendedClient from "./lib/ExtendedClient.js";
import { commands } from "./commands";
import { LowSync } from "lowdb/lib";

export function runBot(lowdb: LowSync<LowDBSchema>, config: Config) {
    const client = new ExtendedClient({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.DIRECT_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_PRESENCES,
            Intents.FLAGS.GUILD_MEMBERS,
        ],
        partials: ["CHANNEL"],
        dbCache: lowdb,
        botOwner: config.botOwner,
    });
    client.on("ready", async (client) => {
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

        // People may have joined the server while the bot was (potentially) down
        // Do a sync just in case
        console.log("Syncing user list...");
        let modified = false;
        for (const [snowflake, user] of client.users.cache) {
            if (client.dbCache.data!.userData![snowflake] === undefined) {
                console.log(
                    `Adding ${user.tag} (${snowflake}) with a count of 0`
                );
                client.dbCache.data!.userData[snowflake] = { total: 0 };
                modified = true;
            }
        }
        if (modified) {
            client.dbCache.write();
        } else {
            console.log("Already synced...");
        }
        console.log("Done!");

        await client.refreshSlashCommands(commands);
    });
    // Add any users that join a guild that didn't exist before
    client.on("guildMemberAdd", async (member) => {
        if (client.dbCache.data!.userData[member.id] === undefined) {
            console.log(
                `Member joined: Adding ${member.user.tag} (${member.id}) with a count of 0`
            );
            client.dbCache.data!.userData[member.id].total = 0;
            client.dbCache.write();
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
                    `${newUser.tag} also somehow changed their id? Ignoring avatar change due to a probable error`
                );
                return;
            }

            if (client.dbCache.data!.userData[newUser.id].total === undefined) {
                console.log(
                    `${newUser.username}'s count undefined for some reason`
                );
                console.log(
                    `Adding ${newUser.tag} (${newUser.id}) with a count of 0`
                );
                client.dbCache.data!.userData[newUser.id].total = 0;
            }

            console.log(`Incrementing ${newUser.tag} (${newUser.id}) by 1`);
            client.dbCache.data!.userData[newUser.id].total += 1;
            client.dbCache.write();
        } else {
            console.log(
                `${newUser.tag} changed something, idk what it was, but it was no a pfp picture.`
            );
        }
    });

    // Owner Commands
    client.on("messageCreate", async (msg) => {
        const myself = msg.client.user;
        if (!myself) {
            throw "I am somehow not logged in, but recieving a message. (???)";
        }
        // Filter out messages created by myself
        if (msg.author.id === myself.id) return;

        // DM's only
        if (!(msg.channel instanceof DMChannel)) return;

        const responses = [
            "I hear you, I'm just ignoring you.",
            "Shush please.",
            "Why are you talking to me, be quiet.",
        ];

        // 20% chance to responds
        if (Math.random() <= 0.2) {
            // Choose a random response
            const choice = Math.floor(Math.random() * responses.length);
            msg.channel.send(responses[choice]);
        }
    });

    // Command Handling
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        const command = interaction.client.commandActions.get(
            interaction.commandName
        );

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
            if (client.dbCache.data!.userData[member.id] === undefined) {
                console.log(
                    `Member joined: Adding ${member.user.tag} (${member.id}) with a count of 0`
                );
                client.dbCache.data!.userData[member.id].total = 0;
                client.dbCache.write();
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
