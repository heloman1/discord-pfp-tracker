import ping from "./ping";
import leaderboard from "./leaderboard";
import modify from "./modify";
import check from "./check";

import { Collection } from "discord.js";
import { Command } from "../Command";

export const commands = new Collection<string, Command>([
    [ping.name, ping],
    [leaderboard.name, leaderboard],
    [modify.name, modify],
    [check.name, check],
]);

export default { commands };
