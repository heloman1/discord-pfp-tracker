import { Client, ClientOptions, Collection } from "discord.js";
import Keyv from "keyv";
import { Command } from "./Command";
import { commands } from "./commands";

interface ExtendedClientOptions extends ClientOptions {
    userChangeCount: Keyv<number>;
}

export class ExtendedClient extends Client {
    commands: Collection<string, Command>;
    userChangeCount: Keyv<number>;
    constructor(options: ExtendedClientOptions) {
        super(options);
        this.commands = commands;
        this.userChangeCount = options.userChangeCount;
    }
}

export default ExtendedClient;
