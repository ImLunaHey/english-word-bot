use anyhow::{Context, Result, bail};
use bluesky_bot::{AspectRatio, Bot, BotConfig, Image, PostEmbed, PostPayload};
use english_word_bot::{
    cache::JsonCache,
    design::design_for,
    dictionary::Dictionary,
    image::render_png,
    words::{WordPool, english_words},
};
use rand::rng;
use std::{
    env,
    path::{Path, PathBuf},
    time::Duration,
};

struct Config {
    username: String,
    password: String,
    posted_path: PathBuf,
    cache_path: Option<PathBuf>,
    interval: Duration,
}

impl Config {
    fn from_env() -> Result<Self> {
        let username = env::var("BLUESKY_USERNAME").context("BLUESKY_USERNAME must be set")?;
        let password = env::var("BLUESKY_PASSWORD").context("BLUESKY_PASSWORD must be set")?;
        let posted_path = env::var("POSTED_WORD_LIST_PATH")
            .unwrap_or_else(|_| "./postedWords.txt".into())
            .into();
        let cache_path = env::var("WORD_CACHE_PATH").ok().map(Into::into);
        let seconds = env::var("POST_INTERVAL_SECONDS")
            .ok()
            .map(|v| v.parse())
            .transpose()
            .context("POST_INTERVAL_SECONDS must be an integer")?
            .unwrap_or(600);
        if seconds == 0 {
            bail!("POST_INTERVAL_SECONDS must be greater than zero")
        }
        Ok(Self {
            username,
            password,
            posted_path,
            cache_path,
            interval: Duration::from_secs(seconds),
        })
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();
    let config = Config::from_env()?;
    let bot = Bot::new(BotConfig::default());
    bot.login(&config.username, &config.password).await?;
    eprintln!("bot logged in as {}", config.username);

    let words = english_words();
    let posted = std::fs::read_to_string(&config.posted_path).unwrap_or_default();
    let mut pool = WordPool::new(words, posted.lines().map(str::to_owned))?;
    let mut dictionary = Dictionary::new(JsonCache::open(config.cache_path.as_ref())?);
    let watermark = format!("@{}", config.username);

    loop {
        tokio::select! {
            ()=tokio::time::sleep(config.interval)=>{},
            result=tokio::signal::ctrl_c()=>{result?;break;}
        }
        if let Err(error) = post_next(
            &bot,
            &mut pool,
            &mut dictionary,
            &config.posted_path,
            &watermark,
        )
        .await
        {
            eprintln!("post cycle failed: {error:#}");
        }
    }
    Ok(())
}

async fn post_next(
    bot: &Bot,
    pool: &mut WordPool,
    dictionary: &mut Dictionary,
    posted_path: &Path,
    watermark: &str,
) -> Result<()> {
    for _ in 0..10 {
        let Some(word) = pool.choose(&mut rng()).map(str::to_owned) else {
            bail!("all words have been posted")
        };
        let Some(data) = dictionary.fetch(&word).await else {
            pool.mark_posted(&word, posted_path)?;
            eprintln!("skipped word (no data): {word}");
            continue;
        };
        let png = render_png(design_for(&word), &data, watermark)?;
        let blob = bot.upload_blob(png, "image/png").await?;
        let mut payload = PostPayload::new("");
        payload.embed = Some(PostEmbed::Images {
            images: vec![Image {
                image: blob,
                alt: format!("The word \"{word}\" on a stylized background"),
                aspect_ratio: Some(AspectRatio {
                    width: 800,
                    height: 800,
                }),
            }],
        });
        bot.post(payload).await?;
        pool.mark_posted(&word, posted_path)?;
        eprintln!("posted word: {word}");
        return Ok(());
    }
    bail!("could not find a postable word in 10 attempts")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Mutex;
    static ENV_LOCK: Mutex<()> = Mutex::new(());
    #[test]
    fn requires_credentials() {
        let _g = ENV_LOCK.lock().unwrap();
        unsafe {
            env::remove_var("BLUESKY_USERNAME");
            env::remove_var("BLUESKY_PASSWORD")
        };
        assert!(Config::from_env().is_err())
    }
    #[test]
    fn rejects_zero_interval() {
        let _g = ENV_LOCK.lock().unwrap();
        unsafe {
            env::set_var("BLUESKY_USERNAME", "x");
            env::set_var("BLUESKY_PASSWORD", "x");
            env::set_var("POST_INTERVAL_SECONDS", "0")
        };
        assert!(Config::from_env().is_err());
        unsafe { env::remove_var("POST_INTERVAL_SECONDS") }
    }
}
