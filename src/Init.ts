import fs from "fs";
import { Config, LowDBSchema } from "./lib/types";
import { runBot } from "./Bot.js";
import { JSONFileSync, LowSync } from "lowdb";
const configLoc = "data/config.json";
const defaultDBLoc = "data/db.json";

function loadConfig(path: string): Config {
    const config: Config = JSON.parse(fs.readFileSync(path).toString());

    if (!config.appId) {
        throw "Please set the appId";
    }
    if (!config.guildId) {
        throw "Please set the guildId";
    }
    if (!config.botToken) {
        throw `${configLoc} must have a botToken`;
    }
    if (!config.botOwner) {
        throw "Please set the botOwner";
    }
    if (!config.dbURI) {
        console.log(`NOTE: dbURI not set, using default location (${path})`);
    }

    return config;
}

function loadDb(path: string) {
    const db = new LowSync<LowDBSchema>(new JSONFileSync(path));
    db.read();
    if (!db.data) {
        db.data = {};
    }
    return db;
}

const config = loadConfig(configLoc);
const db = loadDb(config.dbURI || defaultDBLoc);

runBot(db, config);
