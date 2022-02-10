export interface Config {
    appId: string;
    guildId: string;
    botToken: string;
    dbURI?: string;
    botOwner: string;
}

export type LowDBSchema = {
    version: 1;
    userData: { [key: string]: { total: number } };
};
