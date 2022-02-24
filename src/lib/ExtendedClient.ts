import {
    ApplicationCommand,
    ApplicationCommandDataResolvable,
    Client,
    ClientOptions,
    Collection,
} from "discord.js";
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

/**
 * This will update the client's registered application commands with the given
 * list newCommands.
 * @param client
 * @param newCommands
 * @param options Whether to only do global commands, guild commands, or both
 */
async function syncCommands(
    client: ExtendedClient,
    newCommands: Collection<string, Command>,
    options: { guildCommands: boolean; globalCommands: boolean }
) {
    // TODO: Do I need to handle command edits differently?
    // Because typescript was being weird when unioning types
    // (GenericCommandManager)
    type GCM = {
        fetch: () => Promise<Collection<string, ApplicationCommand<{}>>>;
        create: (
            command: ApplicationCommandDataResolvable
        ) => Promise<ApplicationCommand<{}>>;
        cache: Collection<string, ApplicationCommand>;
    };
    async function deleteOldCommands<CM extends GCM>(commandManager: CM) {
        await commandManager.fetch();
        for (const [_, command] of commandManager.cache) {
            if (!newCommands.has(command.name)) {
                console.log(
                    `Removing "${command.name}" from "${command.guild?.name}"`
                );
                command.delete();
            }
        }
    }
    async function addNewCommands<CM extends GCM>(commandManager: CM) {
        for (const [_name, command] of newCommands) {
            // Register new commands
            if (!command.ownerOnly) {
                await commandManager.create(command.slashCommandData);
            }
        }
    }
    if (options.guildCommands) {
        await client.guilds.fetch();
        for (const [_, guild] of client.guilds.cache) {
            deleteOldCommands(guild.commands);
            // Edit existing commandss
            addNewCommands(guild.commands);
        }
    }
    if (options.globalCommands) {
        // console.log("Commands may take up to an hour to refresh");
        const botCommands = client.application?.commands;
        if (!botCommands)
            throw "this.application is not defined? Did you somehow run this before logging in?";

        deleteOldCommands(botCommands);
        addNewCommands(botCommands);
    }
}

function clearAllGuildCommands(client: ExtendedClient) {
    syncCommands(client, new Collection(), {
        globalCommands: false,
        guildCommands: true,
    });
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
            console.log("NOTE: Updating using guild commands (DEV)");
            console.log(
                "      (Faster but must be done for every server separately)"
            );

            syncCommands(this, newCommands, {
                globalCommands: false,
                guildCommands: true,
            });
        } else {
            console.log("NOTE: Updating using global commands");
            console.log("      New commands will take up to an hour to sync");
            console.log("      Guild specific commands will be cleared");

            syncCommands(this, newCommands, {
                globalCommands: true,
                guildCommands: false,
            });
            clearAllGuildCommands(this);
        }
        console.log("Done!");
    }
}

export default ExtendedClient;
