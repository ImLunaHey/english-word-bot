use crate::{design::Design, dictionary::WordData};
use anyhow::{Context, Result};

pub const DESIGN_SIZE: u32 = 800;
pub const RENDER_SCALE: u32 = 3;
pub const RENDER_SIZE: u32 = DESIGN_SIZE * RENDER_SCALE;

pub fn render_png(design: Design, data: &WordData, watermark: &str) -> Result<Vec<u8>> {
    let svg = design.render(data, watermark, DESIGN_SIZE, DESIGN_SIZE);
    let mut options = resvg::usvg::Options::default();
    options
        .fontdb_mut()
        .load_font_data(include_bytes!("../fonts/LiberationSans-Regular.ttf").to_vec());
    options
        .fontdb_mut()
        .load_font_data(include_bytes!("../fonts/LiberationSans-Bold.ttf").to_vec());
    options
        .fontdb_mut()
        .load_font_data(include_bytes!("../fonts/LiberationSerif-Regular.ttf").to_vec());
    let tree = resvg::usvg::Tree::from_str(&svg, &options).context("parse generated SVG")?;
    let mut pixmap = resvg::tiny_skia::Pixmap::new(RENDER_SIZE, RENDER_SIZE)
        .context("allocate render buffer")?;
    resvg::render(
        &tree,
        resvg::tiny_skia::Transform::from_scale(RENDER_SCALE as f32, RENDER_SCALE as f32),
        &mut pixmap.as_mut(),
    );
    pixmap.encode_png().context("encode PNG")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{design::ALL_DESIGNS, dictionary::WordData};
    fn word() -> WordData {
        WordData {
            word: "test".into(),
            part_of_speech: "noun".into(),
            definition: "A procedure intended to establish quality.".into(),
            example: None,
            ipa: Some("tɛst".into()),
            etymology: None,
            origin_language: None,
        }
    }
    #[test]
    fn produces_png_at_expected_dimensions() {
        let p = render_png(ALL_DESIGNS[0], &word(), "@test").unwrap();
        assert_eq!(&p[..8], b"\x89PNG\r\n\x1a\n");
        assert_eq!(
            u32::from_be_bytes(p[16..20].try_into().unwrap()),
            RENDER_SIZE
        );
        assert_eq!(
            u32::from_be_bytes(p[20..24].try_into().unwrap()),
            RENDER_SIZE
        )
    }
    #[test]
    fn every_design_rasterizes() {
        for design in ALL_DESIGNS {
            assert!(
                render_png(*design, &word(), "@test").unwrap().len() > 10_000,
                "{}",
                design.name
            )
        }
    }
}
