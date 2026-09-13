use anyhow::Result;
use english_word_bot::{
    design::{ALL_DESIGNS, by_name},
    dictionary::WordData,
    image::render_png,
};
fn main() -> Result<()> {
    let name = std::env::args()
        .nth(1)
        .unwrap_or_else(|| ALL_DESIGNS[0].name.into());
    let path = std::env::args()
        .nth(2)
        .unwrap_or_else(|| "sample.png".into());
    let data = WordData {
        word: "serendipity".into(),
        part_of_speech: "noun".into(),
        definition:
            "The occurrence and development of events by chance in a happy or beneficial way."
                .into(),
        example: None,
        ipa: Some("ˌsɛrənˈdɪpɪti".into()),
        etymology: Some("Coined from The Three Princes of Serendip".into()),
        origin_language: Some("Persian".into()),
    };
    std::fs::write(
        path,
        render_png(
            by_name(&name).ok_or_else(|| anyhow::anyhow!("unknown design: {name}"))?,
            &data,
            "@englishwordbot.bsky.social",
        )?,
    )?;
    Ok(())
}
