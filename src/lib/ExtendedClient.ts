import { Client, ClientOptions, Collection, User } from "discord.js";
import { Command } from "./Command";
import { commands } from "../commands";

import { LowSync } from "lowdb/lib";
import { LowDBSchema } from "./types";
interface ExtendedClientOptions extends ClientOptions {
    dbCache: LowSync<LowDBSchema>;
    botOwner: string;
}

declare module "discord.js" {
    interface Client {
        botOwner?: User;
        fetchOwner(botOwner: string): void;
        refreshSlashCommands(
            commands: Collection<string, Command>,
            appId: string,
            token: string
        ): Promise<void>;
        dbCache: LowSync<LowDBSchema>;
    }
}
export class ExtendedClient<
    Ready extends boolean = boolean
> extends Client<Ready> {
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

    async refreshSlashCommands(
        commands: Collection<string, Command>,
        appId: string,
        token: string
    ) {
        const slashCommandData = commands.map(
            (command) => command.slashCommandData
        );
        try {
            console.log("Refreshing Slash Commands...");
            await this.guilds.fetch();
            this.guilds.cache.forEach((guild) =>
                slashCommandData.forEach(
                    async (commandData) =>
                        await guild.commands.create(commandData)
                )
            );
            console.log("Done!");
        } catch (error) {
            console.error(error);
        }
    }
}

export default ExtendedClient;
