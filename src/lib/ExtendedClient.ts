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
        commandActions: Collection<string, Command>;
        dbCache: LowSync<LowDBSchema>;
        botOwner: User;
        fetchOwner(botOwner: string): void;
        refreshSlashCommands(
            commands: Collection<string, Command>
        ): Promise<void>;
    }
}
export class ExtendedClient<
    Ready extends boolean = boolean
> extends Client<Ready> {
    constructor(options: ExtendedClientOptions) {
        super(options);
        this.commandActions = commands;
        this.dbCache = options.dbCache;
        this.botOwner = this.botOwner;
    }

    async refreshSlashCommands(commands: Collection<string, Command>) {
        const slashCommandData = commands.map(
            (command) => command.slashCommandData
        );
        // This should be changed to use the slower, global version
        // If this ever gets added to more than a single digits number
        // of servers
        try {
            console.log("Refreshing Slash Commands...");
            await this.guilds.fetch();
            for (const [_snowflake, guild] of this.guilds.cache) {
                for (const command of slashCommandData) {
                    await guild.commands.create(command);
                }
            }
            console.log("Done!");
        } catch (error) {
            console.error(error);
        }
    }
}

export default ExtendedClient;
