use std::env;

// use serenity::async_trait;
// use serenity::model::channel::Message;
// use serenity::prelude::*;
use ::serenity::{
    all::{Context, EventHandler, Message, Ready},
    async_trait,
};
use poise::{serenity_prelude as serenity, Framework};
struct Data {}
type Error = Box<dyn std::error::Error + Send + Sync>;
// type Context<'a> = poise::Context<'a, Data, Error>;
struct Handler;

#[async_trait]
impl EventHandler for Handler {
    async fn ready(&self, _ctx: Context, data_about_bot: Ready) {
        println!("Started!");
        // println!("{ctx:?}");

        let separator = if data_about_bot.user.discriminator.is_some() {
            "#"
        } else {
            ""
        };
        let discriminator = match data_about_bot.user.discriminator {
            Some(d) => d.to_string(),
            None => "".into(),
        };

        println!(
            "Name: {:?}{}{}",
            data_about_bot.user.name, separator, discriminator
        );
        println!(
            "Avatar: {}",
            data_about_bot.user.avatar_url().unwrap_or_default()
        );
        let guilds = data_about_bot.guilds.iter().map(|v| {
            // v.id.name(cache)
        });
        println!("{:?}", data_about_bot.guilds);
    }
    async fn message(&self, ctx: Context, msg: Message) {
        if msg.content == "!ping" {
            if let Err(why) = msg.channel_id.say(&ctx.http, "Pong!").await {
                println!("Error sending message: {why:?}");
            }
        }
    }
}

#[tokio::main]
async fn main() {
    // Login with a bot token from the environment
    let token = env::var("DISCORD_TOKEN").expect("Expected a token in the environment");
    // Set gateway intents, which decides what events the bot will be notified about
    let intents = serenity::GatewayIntents::non_privileged();

    let framework: Framework<Data, Error> = poise::Framework::builder()
        .options(poise::FrameworkOptions {
            ..Default::default()
        })
        .setup(|ctx, _ready, framework| Box::pin(async move { Ok(Data {}) }))
        .build();
    // .options(poise::FrameworkOptions {
    //     // commands: vec![age()],
    //     // ..Default::default()
    // })
    // .setup(|ctx, _ready, framework| {
    //     Box::pin(async move {
    //         poise::builtins::register_globally(ctx, &framework.options().commands).await?;
    //         Ok(Data {})
    //     })
    // })
    // .build();
    // Create a new instance of the Client, logging in as a bot.
    let mut client = serenity::Client::builder(&token, intents)
        .framework(framework)
        .event_handler(Handler)
        .await
        .expect("Err creating client");

    // Start listening for events by starting a single shard
    if let Err(why) = client.start().await {
        println!("Client error: {why:?}");
    }
}
