import fs from "fs";
import Keyv from "keyv";
import { Config } from "./types";
import { runBot } from "./Bot";
function loadConfig(path: string): Config {
    const config = JSON.parse(fs.readFileSync(path).toString());

    if (!config.appId) {
        throw "Please set the appId";
    }
    if (!config.guildId) {
        throw "Please set the guildId";
    }
    if (!config.botToken) {
        throw `${configPath} must have a botToken`;
    }
    return config;
}

function loadUserChangeCount(path?: string) {
    if (!path) {
        path = "sqlite://data/db.sqlite";
    }
    const userChangeCount = new Keyv<number>({
        adapter: "sqlite",
        uri: path,
        namespace: "userChangeCount",
    });
    userChangeCount.on("error", (err) => {
        console.error("Error when connecting to sqlite");
        throw err;
    });
    return userChangeCount;
}

const configPath = "data/config.json";
const config = loadConfig(configPath);
const db = loadUserChangeCount(config.dbURI);

runBot(db, config);
