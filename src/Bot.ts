import { Intents } from "discord.js";
import fs from "fs";
import Keyv from "keyv";
import { ExtendedClient } from "./ExtendedClient";
import { commands, refreshSlashCommands } from "./commands";
interface Config {
    clientId: string;
    guildId: string;
    botToken: string;
    dbURI?: string;
}

function loadConfig(path: string): Config {
    const config = JSON.parse(fs.readFileSync(path).toString());

    if (!config.clientId) {
        throw "Please set the clientId";
    }
    if (!config.guildId) {
        throw "Please set the guildId";
    }
    if (!config.botToken) {
        throw `${configPath} must have a botToken`;
    }
    return config;
}

const configPath = "data/config.json";
const config = loadConfig(configPath);

function loadUserChangeCount(path?: string) {
    if (!path) {
        path = "sqlite://data/db.sqlite";
    }
    const userChangeCount = new Keyv<number>({
        adapter: "sqlite",
        uri: path,
        namespace: "userChangeCount",
    });
    userChangeCount.on("error", (err) => {
        console.error("Error when connecting to sqlite");
        throw err;
    });
    return userChangeCount;
}

const client = new ExtendedClient({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
    partials: ["CHANNEL"],
    userChangeCount: loadUserChangeCount(config.dbURI),
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
    console.log(`${newUser.tag} changed in some way!`);

    if (oldUser.avatar != newUser.avatar) {
        console.log("The avatar changed!");
        const oldCount = await client.userChangeCount.get(newUser.id);

        if (!oldCount) {
            console.log(
                `${newUser.username}'s count undefined for some reason`
            );
            console.log(
                `Adding ${newUser.tag} (${newUser.id}) with a count of 1`
            );
            client.userChangeCount.set(newUser.id, 1);
        } else {
            client.userChangeCount.set(newUser.id, oldCount + 1);
        }
    } else {
        console.log("The avatar is the same.");
    }
});


client.on("ready", async (client) => {
    if (!(client instanceof ExtendedClient)) {
        return;
    }
    // const guilds = client.guilds.cache;
    console.log(`Logged in as ${client.user?.tag}!`);
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

    console.log("Updating user list...");
    const users = client.users.cache;
    for (const [snowflake, user] of users) {
        if ((await client.userChangeCount.get(snowflake)) === undefined) {
            console.log(`Adding ${user.tag} (${snowflake}) with a count of 0`);
            client.userChangeCount.set(snowflake, 0);
        }
    }
    console.log("Done!");

    console.log("Refreshing Guild Commands...");

    await refreshSlashCommands(
        commands,
        config.clientId,
        config.guildId,
        config.botToken
    );
    console.log("Done!");
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
