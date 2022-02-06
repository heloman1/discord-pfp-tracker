import { Client, ClientOptions, Collection, User } from "discord.js";
import { Command } from "./Command";
import { commands } from "./commands";

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { LowSync } from "lowdb/lib";
import { LowDBSchema } from "./types";
interface ExtendedClientOptions extends ClientOptions {
    dbCache: LowSync<LowDBSchema>;
    botOwner: string;
}

declare module "./ExtendedClient" {
    interface Client {
        fetchOwner(botOwner: string): void;
        refreshSlashCommands(
            commands: Collection<string, Command>,
            appId: string,
            token: string
        ): void;
    }
}
export class ExtendedClient extends Client {
    commands: Collection<string, Command>;
    dbCache: LowSync<LowDBSchema>;
    botOwner?: User;
    constructor(options: ExtendedClientOptions) {
        super(options);
        this.commands = commands;
        this.dbCache = options.dbCache;
        this.fetchOwner(options.botOwner);
    }

    async fetchOwner(botOwner: string) {
        this.botOwner = await this.users.fetch(botOwner);
    }
    private SlashCommandRest: REST | undefined;
    async refreshSlashCommands(
        commands: Collection<string, Command>,
        appId: string,
        token: string
    ) {
        if (!this.SlashCommandRest) {
            this.SlashCommandRest = new REST({ version: "9" }).setToken(token);
        }
        const payload = commands.map((command) => {
            return command.commandBuilder.toJSON();
        });
        try {
            console.log("Refreshing Slash Commands...");
            for (const [id, guild] of await this.guilds.fetch()) {
                await this.SlashCommandRest.put(
                    Routes.applicationGuildCommands(appId, id),
                    {
                        body: payload,
                    }
                );
            }
            console.log("Done!");
        } catch (error) {
            console.error(error);
        }
    }
}

export default ExtendedClient;
