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
    let data = sample_data();
    if name == "--gallery" {
        return render_gallery(&data);
    }
    let path = std::env::args()
        .nth(2)
        .unwrap_or_else(|| "sample.png".into());
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

fn sample_data() -> WordData {
    WordData {
        word: "serendipity".into(),
        part_of_speech: "noun".into(),
        definition:
            "The occurrence and development of events by chance in a happy or beneficial way."
                .into(),
        example: Some("Finding the book was a moment of pure serendipity.".into()),
        ipa: Some("ˌsɛrənˈdɪpɪti".into()),
        etymology: Some("Coined from The Three Princes of Serendip".into()),
        origin_language: Some("Persian".into()),
    }
}

fn render_gallery(data: &WordData) -> Result<()> {
    let directory = std::path::Path::new("docs/designs");
    std::fs::create_dir_all(directory)?;
    let mut markdown = String::from(
        "# Design gallery\n\nAll 44 card designs rendered with the same sample entry. Generated with `cargo run --bin render-sample -- --gallery`.\n\n| Design | Preview |\n| --- | --- |\n",
    );
    for design in ALL_DESIGNS {
        let filename = format!("{}.svg", design.name);
        std::fs::write(
            directory.join(&filename),
            design.render(data, "@englishwordbot.bsky.social", 800, 800)?,
        )?;
        markdown.push_str(&format!(
            "| `{}` | <img src=\"designs/{}\" width=\"360\" alt=\"{} word card design\"> |\n",
            design.name, filename, design.name
        ));
    }
    std::fs::write("docs/DESIGN_GALLERY.md", markdown)?;
    Ok(())
}
