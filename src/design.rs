use crate::{dictionary::WordData, native_designs};
use anyhow::{Result, bail};

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct Design {
    pub name: &'static str,
    requirement: Requirement,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum Requirement {
    None,
    Etymology,
    Example,
    Origin,
}

macro_rules! designs {
    ($($name:literal => $requirement:ident),+ $(,)?) => {
        pub const ALL_DESIGNS: &[Design] = &[$(Design {
            name: $name,
            requirement: Requirement::$requirement,
        }),+];
    };
}

designs! {
    "editorial-dictionary" => None,
    "etymology-breakdown" => Etymology,
    "bold-poster" => None,
    "risograph-stamp" => None,
    "letter-grid" => None,
    "word-in-context" => Example,
    "brutalist-mono" => None,
    "soft-pastel-modern" => None,
    "terminal-output" => None,
    "receipt" => None,
    "diagnostic-readout" => None,
    "lexicon-specimen" => None,
    "split-panel-editorial" => None,
    "ticket-stub" => None,
    "log-output" => None,
    "passport-stamp" => None,
    "concert-poster" => None,
    "tax-form" => None,
    "vinyl-record" => None,
    "patient-chart" => None,
    "boarding-pass" => None,
    "wanted-poster" => None,
    "field-journal" => None,
    "qa-site" => None,
    "library-catalog" => None,
    "pull-request" => None,
    "lab-report" => None,
    "vocabulary-certificate" => None,
    "encyclopedia-entry" => None,
    "police-lineup" => None,
    "recipe-card" => None,
    "subway-map" => Origin,
    "patent-filing" => None,
    "wikipedia-infobox" => None,
    "postcard" => None,
    "polaroid" => None,
    "cryptic-crossword" => None,
    "vhs-title-card" => None,
    "sticky-note-pile" => None,
    "telegram" => None,
    "postage-stamp" => None,
    "movie-poster" => None,
    "tea-bag-tag" => None,
    "periodic-element" => None,
}

impl Design {
    pub fn can_render(self, data: &WordData) -> bool {
        match self.requirement {
            Requirement::None => true,
            Requirement::Etymology => data.etymology.is_some(),
            Requirement::Example => data.example.is_some(),
            Requirement::Origin => data.origin_language.is_some(),
        }
    }

    pub fn render(
        self,
        data: &WordData,
        watermark: &str,
        width: u32,
        height: u32,
    ) -> Result<String> {
        if !self.can_render(data) {
            bail!("design {} cannot render the supplied word data", self.name);
        }
        native_designs::render(
            self.name,
            &native_designs::Context {
                data,
                watermark,
                width,
                height,
            },
        )
        .ok_or_else(|| anyhow::anyhow!("native renderer missing for {}", self.name))
    }
}

pub fn design_for(data: &WordData) -> Design {
    let eligible = ALL_DESIGNS
        .iter()
        .copied()
        .filter(|design| design.can_render(data))
        .collect::<Vec<_>>();
    eligible[hash(&data.word) as usize % eligible.len()]
}

pub fn by_name(name: &str) -> Option<Design> {
    ALL_DESIGNS
        .iter()
        .copied()
        .find(|design| design.name == name)
}

fn hash(value: &str) -> u32 {
    value.chars().fold(0u32, |hash, character| {
        hash.wrapping_mul(31).wrapping_add(character as u32)
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn word() -> WordData {
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

    #[test]
    fn exposes_all_original_designs() {
        assert_eq!(ALL_DESIGNS.len(), 44);
        let mut names = ALL_DESIGNS
            .iter()
            .map(|design| design.name)
            .collect::<Vec<_>>();
        names.sort_unstable();
        names.dedup();
        assert_eq!(names.len(), 44);
    }

    #[test]
    fn respects_original_render_requirements() {
        let mut data = word();
        data.example = None;
        data.etymology = None;
        data.origin_language = None;
        assert!(!by_name("word-in-context").unwrap().can_render(&data));
        assert!(!by_name("etymology-breakdown").unwrap().can_render(&data));
        assert!(!by_name("subway-map").unwrap().can_render(&data));
        assert!(by_name("bold-poster").unwrap().can_render(&data));
    }

    #[test]
    fn selection_is_deterministic_and_eligible() {
        let data = word();
        assert_eq!(design_for(&data), design_for(&data));
        assert!(design_for(&data).can_render(&data));
    }

    #[test]
    fn native_renderer_produces_svg() {
        let svg = by_name("receipt")
            .unwrap()
            .render(&word(), "@test", 800, 800)
            .unwrap();
        assert!(svg.contains("<svg"));
        assert!(svg.contains("<text"));
    }

    #[test]
    fn every_registered_design_has_a_native_renderer() {
        for design in ALL_DESIGNS {
            let svg = design.render(&word(), "@test", 800, 800).unwrap();
            assert!(svg.starts_with("<svg"), "{}", design.name);
            assert!(svg.ends_with("</svg>"), "{}", design.name);
            assert!(svg.matches("<text").count() >= 3, "{}", design.name);
        }
    }

    #[test]
    fn checked_in_gallery_matches_native_renderer_snapshots() {
        let date = regex::Regex::new(r"20\d{2}(?:[-·.]\d{2}[-·.]\d{2})?").unwrap();
        for design in ALL_DESIGNS {
            let rendered = design
                .render(&word(), "@englishwordbot.bsky.social", 800, 800)
                .unwrap();
            let path = format!(
                "{}/docs/designs/{}.svg",
                env!("CARGO_MANIFEST_DIR"),
                design.name
            );
            let snapshot = std::fs::read_to_string(&path).unwrap_or_else(|error| {
                panic!("missing snapshot for {} at {path}: {error}", design.name)
            });
            assert_eq!(
                date.replace_all(&rendered, "DATE"),
                date.replace_all(&snapshot, "DATE"),
                "gallery snapshot drifted for {}",
                design.name
            );
        }
    }

    #[test]
    fn native_layouts_are_structurally_distinct() {
        let mut outputs = ALL_DESIGNS
            .iter()
            .map(|design| design.render(&word(), "@test", 800, 800).unwrap())
            .collect::<Vec<_>>();
        outputs.sort_unstable();
        outputs.dedup();
        assert_eq!(outputs.len(), ALL_DESIGNS.len());
    }

    #[test]
    fn native_renderer_escapes_all_external_text() {
        let mut data = word();
        data.word = "<&\"'>".into();
        data.definition = "unsafe <script>& text".into();
        for design in ALL_DESIGNS.iter().filter(|design| design.can_render(&data)) {
            let svg = design.render(&data, "<&", 800, 800).unwrap();
            assert!(!svg.contains("<script>"), "{}", design.name);
            assert!(!svg.contains("<&"), "{}", design.name);
        }
    }
}
