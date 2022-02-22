import { ApplicationCommandData, CommandInteraction } from "discord.js";

export type Action = (interaction: CommandInteraction) => Promise<void>;

/**
 * A data class that holds {@link ApplicationCommandData} and the associated function ({@link Action}) to be run
 */
export class Command {
    slashCommandData: ApplicationCommandData;
    ownerOnly: boolean;
    action: Action;
    constructor(
        slashCommandData: ApplicationCommandData,
        action: Action,
        ownerOnly = false
    ) {
        this.slashCommandData = slashCommandData;
        this.action = action;
        this.ownerOnly = ownerOnly;
    }
}
