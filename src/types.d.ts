export interface Config {
    appId: string;
    guildId: string;
    botToken: string;
    dbURI?: string;
    botOwner: string;
}

export type LowDBSchema = {
    [key: string]: { total: number };
};
