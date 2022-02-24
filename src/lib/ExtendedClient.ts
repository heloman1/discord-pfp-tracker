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

    async refreshSlashCommands(newCommands: Collection<string, Command>) {
        // This should be changed to use the slower, global version
        // If this ever gets added to more than a single digits number
        // of servers

        console.log("Refreshing Slash Commands...");
        if (process.env.ENVIRONMENT === "DEV") {
            console.log(
                "DEVMODE: fast refreshing using guild-specific commands"
            );
            try {
                await this.guilds.fetch();
                for (const [_snowflake, guild] of this.guilds.cache) {
                    // Remove old commands
                    await guild.commands.fetch();
                    for (const [_snowflake, command] of guild.commands.cache) {
                        // If the guild has an unrecognized command, delete it
                        if (!newCommands.has(command.name)) {
                            console.log(
                                `NOTE: Removing "${command.name}" from "${command.guild?.name}"`
                            );
                            command.delete();
                        }
                    }
                    for (const [_name, command] of newCommands) {
                        if (!command.ownerOnly) {
                            await guild.commands.create(
                                command.slashCommandData
                            );
                        }
                    }
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            console.log("NOTE: Commands may take up to an hour to refresh");
            const botCommands = this.application?.commands;
            if (!botCommands)
                throw "this.application is not defined? Did you somehow run this before logging in?";

            for (const [_id, command] of botCommands.cache) {
                if (!newCommands.has(command.name)) {
                    console.log(`NOTE: Removing "${command.name}"`);
                    command.delete();
                }
            }

            for (const [_id, command] of newCommands) {
                if (!command.ownerOnly) {
                    await botCommands.create(command.slashCommandData);
                }
            }
        }
        console.log("Done!");
    }
}

export default ExtendedClient;
