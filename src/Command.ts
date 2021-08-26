import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Interaction } from "discord.js";

export type Action = (interaction: CommandInteraction) => Promise<void>;

/**
 * A data class that holds a {@link SlashCommandBuilder} and the associated function ({@link Action}) to be run
 */
export class Command {
    public get name(): string {
        return this.commandBuilder.name;
    }

    commandBuilder: SlashCommandBuilder;
    action: Action;
    constructor(commandBuilder: SlashCommandBuilder, action: Action) {
        this.commandBuilder = commandBuilder;
        this.action = action;
    }
}
