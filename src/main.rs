use std::env;

use serde::{Deserialize, Serialize};
// use serenity::async_trait;
// use serenity::model::channel::Message;
// use serenity::prelude::*;
use ::serenity::{
    all::{EventHandler, Message, Ready},
    async_trait,
};
use poise::{serenity_prelude as serenity, Framework};
use surrealdb::{
    engine::local::{Db, Mem},
    sql::Thing,
    Surreal,
};

/**
My extra data to be passed into the context
*/
struct Data {
    db: Surreal<Db>,
}

type Error = Box<dyn std::error::Error + Send + Sync>;
type Context<'a> = poise::Context<'a, Data, Error>;
struct Handler;

const DB_NAMESPACE: &str = "tracie";
const DB_DATABASE: &str = "tracie";

async fn event_handler(
    ctx: &serenity::Context,
    event: &serenity::FullEvent,
    _framework: poise::FrameworkContext<'_, Data, Error>,
    data: &Data,
) -> Result<(), Error> {
    match event {
        serenity::FullEvent::Ready { data_about_bot } => {
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
        serenity::FullEvent::Message { new_message: msg } => {
            // let a = ctx.data.read().await.get::<Data>();
            if msg.content == "!ping" {
                if let Err(why) = msg.channel_id.say(&ctx.http, "Pong!").await {
                    println!("Error sending message: {why:?}");
                }
            }
        }
        _ => {}
    }
    Ok(())
}


#[tokio::main]
async fn main() -> Result<(), Error> {
    let db = Surreal::new::<Mem>(()).await?;
    db.use_ns(DB_NAMESPACE).use_db(DB_DATABASE).await?;
    // let r: surrealdb::Result<()> = async {
    //     // Create a new person with a random id
    //     let created: Vec<Record> = db
    //         .create("person")
    //         .content(Person {
    //             title: "Founder & CEO",
    //             name: Name {
    //                 first: "Tobie",
    //                 last: "Morgan Hitchcock",
    //             },
    //             marketing: true,
    //         })
    //         .await?;
    //     dbg!(created);

    //     let meta = db.query(r#"DEFINE field name_starts_with_t ON person DEFAULT <future> { string::startsWith(@first, "T") }"#).await.unwrap();
    //     // Update a person record with a specific id
    //     let updated: Option<Record> = db
    //         .update(("person", "jaime"))
    //         .merge(Responsibility { marketing: true })
    //         .await?;
    //     dbg!(updated);

    //     // Select all people records
    //     let people: Vec<Record> = db.select("person").await?;
    //     dbg!(people);

    //     // Perform a custom advanced query
    //     let groups = db
    //         .query("SELECT marketing, count() FROM type::table($table) GROUP BY marketing")
    //         .bind(("table", "person"))
    //         .await?;
    //     dbg!(groups);

    //     let everything = db.query("SELECT * from person").await?;
    //     dbg!(everything);

    //     Ok(())
    // }
    // .await;
    // println!("{:?}", r);
    // return;

    // Login with a bot token from the environment
    let token = env::var("DISCORD_TOKEN").expect("Expected a token in the environment");
    // Set gateway intents, which decides what events the bot will be notified about
    let intents = serenity::GatewayIntents::non_privileged();

    let framework: Framework<Data, Error> = poise::Framework::builder()
        .options(poise::FrameworkOptions {
            event_handler: |ctx, event, framework, data| {
                Box::pin(event_handler(ctx, event, framework, data))
            },
            ..Default::default()
        })
        .setup(|ctx, _ready, framework| Box::pin(async move { Ok(Data { db }) }))
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
        // .event_handler(Handler)
        .await?;

    // Start listening for events by starting a single shard
    if let Err(why) = client.start().await {
        println!("Client error: {why:?}");
    }
    Ok(())
}
