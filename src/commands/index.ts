import { readdirSync } from "fs";
import { fileURLToPath } from "url";
import { basename, dirname, join, extname } from "path";

import { Collection } from "discord.js";
import { Command } from "../lib/Command";

// emulate __dirname for ES Modules
const __dirname = dirname(fileURLToPath(import.meta.url));

const commandFiles = readdirSync(__dirname).filter(
    (filename) => extname(filename) === ".js" && filename !== "index.js"
);

let commands = new Collection<string, Command>();
for (const file of commandFiles) {
    const temp = await import(join(__dirname, file));
    if (!(temp.default instanceof Command)) {
        throw `${temp}'s default export is not a Command`;
    }
    commands.set(basename(file, extname(file)), temp.default);
}

export { commands };

export default { commands };
