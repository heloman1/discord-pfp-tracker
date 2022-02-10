import { SlashCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandData, CommandInteraction } from "discord.js";

export type Action = (interaction: CommandInteraction) => Promise<void>;

/**
 * A data class that holds a {@link SlashCommandBuilder} and the associated function ({@link Action}) to be run
 */
export class Command {
    public get name(): string {
        return this.slashCommandData.name;
    }

    slashCommandData: ApplicationCommandData;
    action: Action;
    constructor(slashCommandData: ApplicationCommandData, action: Action) {
        this.slashCommandData = slashCommandData;
        this.action = action;
    }
}
