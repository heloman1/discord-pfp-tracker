import ping from "./ping";
import leaderboard from "./leaderboard";
import modify from "./modify";

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Collection } from "discord.js";
import { Command } from "../Command";

export const commands = new Collection<string, Command>([
    [ping.name, ping],
    [leaderboard.name, leaderboard],
    [modify.name, modify],
]);

let rest: REST | undefined;
export async function refreshSlashCommands(
    commands: Collection<string, Command>,
    appId: string,
    guildId: string,
    token: string
) {
    if (!rest) {
        rest = new REST({ version: "9" }).setToken(token);
    }
    const payload = commands.map((command) => {
        return command.commandBuilder.toJSON();
    });
    try {
        console.log("Refreshing Slash Commands...");
        await rest.put(Routes.applicationGuildCommands(appId, guildId), {
            body: payload,
        });
        console.log("Done!");
    } catch (error) {
        console.error(error);
    }
}

export default { commands, refreshSlashCommands };
