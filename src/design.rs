use crate::dictionary::WordData;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct Design {
    pub name: &'static str,
    background: &'static str,
    ink: &'static str,
    accent: &'static str,
    layout: u8,
}

macro_rules! designs { ($($name:literal,$bg:literal,$ink:literal,$accent:literal,$layout:literal);+ $(;)?) => { pub const ALL_DESIGNS:&[Design]=&[$(Design{name:$name,background:$bg,ink:$ink,accent:$accent,layout:$layout}),+]; }; }

designs! {
"editorial-dictionary","#f2ead8","#16130f","#a6292d",0;
"etymology-breakdown","#171717","#f4efe5","#dc8f40",1;
"bold-poster","#ffdd00","#101010","#e43b2f",2;
"risograph-stamp","#efe7d5","#153d78","#e63946",3;
"letter-grid","#d9d2c3","#252525","#d5523f",2;
"word-in-context","#f9f6ef","#292929","#477b6c",0;
"brutalist-mono","#f0f0e8","#0b0b0b","#ff3c00",3;
"soft-pastel-modern","#f3e8ef","#372d3b","#a5618b",0;
"terminal-output","#0b1116","#c6d4c5","#65d46e",1;
"receipt","#eee9dc","#191919","#555555",3;
"diagnostic-readout","#101b24","#d8e8ef","#22c4d6",1;
"lexicon-specimen","#161b22","#e7edf3","#e2a84a",0;
"split-panel-editorial","#e9e1d1","#181818","#c34234",2;
"ticket-stub","#17344a","#fff3dc","#efb949",3;
"log-output","#11151b","#d8dee9","#6db5ff",1;
"passport-stamp","#ded7c5","#24344a","#a23a34",3;
"concert-poster","#25172e","#f4e8ce","#e84a78",2;
"tax-form","#dce7dd","#1d3124","#4c7157",3;
"vinyl-record","#121212","#f0ddbd","#d85042",2;
"patient-chart","#e7eee9","#26332d","#b43e3e",3;
"boarding-pass","#e8e2d3","#152940","#db6d35",3;
"wanted-poster","#d6b77a","#2b190b","#7d291b",2;
"field-journal","#d5ccb2","#2b3126","#72805c",0;
"qa-site","#f5f5f5","#252525","#e57925",1;
"library-catalog","#d9c59e","#322619","#8e3c31",3;
"pull-request","#0d1117","#c9d1d9","#3fb950",1;
"lab-report","#e7edf0","#17252c","#2486a3",3;
"vocabulary-certificate","#f4ead0","#342719","#9e773a",0;
"encyclopedia-entry","#f3f0e7","#282520","#8a2020",0;
"police-lineup","#e7e7df","#171717","#275a84",2;
"recipe-card","#f3e7d1","#493428","#b55236",3;
"subway-map","#f2f0e8","#222222","#df3f35",1;
"patent-filing","#e9e5da","#202020","#365d76",3;
"wikipedia-infobox","#f8f8f8","#202122","#3366cc",0;
"postcard","#dce9ed","#27353b","#d55448",2;
"polaroid","#e9e6df","#272727","#c84d50",2;
"cryptic-crossword","#f0eee4","#111111","#777777",3;
"vhs-title-card","#16111c","#f2ebf4","#f04bc0",1;
"sticky-note-pile","#eee8dc","#28251f","#e6b52e",2;
"telegram","#d8d0b9","#29251c","#9c3431",3;
"postage-stamp","#b95045","#fff5df","#54211d",3;
"movie-poster","#15121b","#f6e8c9","#d83d39",2;
"tea-bag-tag","#e5ddc7","#3d3327","#8c6d3c",3;
"periodic-element","#162227","#e7f0ec","#55c79a",1
}

impl Design {
    pub fn render(self, data: &WordData, watermark: &str, width: u32, height: u32) -> String {
        let word = escape(&data.word);
        let definition = wrap(&truncate(&data.definition, 160), 44)
            .into_iter()
            .enumerate()
            .map(|(index, line)| {
                format!(
                    r#"<tspan x="400" dy="{}">{}</tspan>"#,
                    if index == 0 { 0 } else { 34 },
                    escape(&line)
                )
            })
            .collect::<String>();
        let part = escape(&data.part_of_speech);
        let ipa = escape(data.ipa.as_deref().unwrap_or("pronunciation unavailable"));
        let origin = escape(data.origin_language.as_deref().unwrap_or("origin unknown"));
        let mark = escape(watermark);
        let decoration = match self.layout {
            0 => format!(
                r#"<line x1="70" y1="174" x2="730" y2="174" stroke="{}" stroke-width="4"/><circle cx="690" cy="115" r="32" fill="none" stroke="{}" stroke-width="3"/>"#,
                self.accent, self.accent
            ),
            1 => format!(
                r#"<rect x="48" y="48" width="704" height="704" rx="12" fill="none" stroke="{}" stroke-width="2"/><path d="M48 208H752M48 624H752" stroke="{}" stroke-width="2"/>"#,
                self.accent, self.accent
            ),
            2 => format!(
                r#"<path d="M0 0H800V92H0ZM0 704H800V800H0Z" fill="{}"/><rect x="60" y="130" width="680" height="500" fill="none" stroke="{}" stroke-width="8"/>"#,
                self.accent, self.ink
            ),
            _ => format!(
                r#"<rect x="45" y="45" width="710" height="710" fill="none" stroke="{}" stroke-width="3"/><path d="M45 145H755M45 655H755" stroke="{}" stroke-width="1" stroke-dasharray="8 6"/>"#,
                self.ink, self.accent
            ),
        };
        format!(
            r#"<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 800 800"><rect width="800" height="800" fill="{bg}"/>{decoration}<g fill="{ink}" font-family="Liberation Sans"><text x="70" y="105" font-size="18" letter-spacing="3">{name}</text><text x="400" y="310" font-size="{word_size}" font-weight="bold" text-anchor="middle">{word}</text><text x="400" y="365" font-size="22" text-anchor="middle" fill="{accent}">{part} · /{ipa}/</text><text x="400" y="435" font-size="25" text-anchor="middle" font-family="Liberation Serif">{definition}</text><text x="70" y="690" font-size="16">{origin}</text><text x="730" y="690" font-size="16" text-anchor="end">{mark}</text></g></svg>"#,
            bg = self.background,
            ink = self.ink,
            accent = self.accent,
            name = self.name,
            word_size = fit_size(&data.word),
            decoration = decoration
        )
    }
}

pub fn design_for(word: &str) -> Design {
    ALL_DESIGNS[hash(word) as usize % ALL_DESIGNS.len()]
}
pub fn by_name(name: &str) -> Option<Design> {
    ALL_DESIGNS.iter().copied().find(|d| d.name == name)
}
fn hash(value: &str) -> u32 {
    value
        .chars()
        .fold(0u32, |h, c| h.wrapping_mul(31).wrapping_add(c as u32))
}
fn fit_size(word: &str) -> u32 {
    match word.chars().count() {
        0..=8 => 92,
        9..=12 => 72,
        13..=16 => 58,
        _ => 44,
    }
}
fn truncate(value: &str, max: usize) -> String {
    if value.chars().count() <= max {
        return value.into();
    }
    format!(
        "{}…",
        value.chars().take(max - 1).collect::<String>().trim_end()
    )
}
fn wrap(value: &str, max: usize) -> Vec<String> {
    let mut lines = Vec::new();
    let mut current = String::new();
    for word in value.split_whitespace() {
        if !current.is_empty() && current.chars().count() + 1 + word.chars().count() > max {
            lines.push(std::mem::take(&mut current));
        }
        if !current.is_empty() {
            current.push(' ')
        }
        current.push_str(word);
    }
    if !current.is_empty() {
        lines.push(current)
    }
    lines
}
fn escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

#[cfg(test)]
mod tests {
    use super::*;
    fn word() -> WordData {
        WordData {
            word: "serendipity".into(),
            part_of_speech: "noun".into(),
            definition: "The occurrence of events by chance in a happy way.".into(),
            example: None,
            ipa: Some("ˌsɛrənˈdɪpɪti".into()),
            etymology: Some("Coined from a Persian tale".into()),
            origin_language: Some("Persian".into()),
        }
    }
    #[test]
    fn has_all_44_designs() {
        assert_eq!(ALL_DESIGNS.len(), 44)
    }
    #[test]
    fn names_are_unique() {
        let mut n = ALL_DESIGNS.iter().map(|d| d.name).collect::<Vec<_>>();
        n.sort();
        n.dedup();
        assert_eq!(n.len(), 44)
    }
    #[test]
    fn every_design_renders_valid_svg_shell() {
        for d in ALL_DESIGNS {
            let s = d.render(&word(), "@bot", 800, 800);
            assert!(s.starts_with("<svg"), "{}", d.name);
            assert!(s.ends_with("</svg>"));
            assert!(s.contains("serendipity"));
        }
    }
    #[test]
    fn escapes_untrusted_text() {
        let mut w = word();
        w.word = "<&\"'".into();
        let s = ALL_DESIGNS[0].render(&w, "@x", 800, 800);
        assert!(s.contains("&lt;&amp;&quot;&apos;"))
    }
    #[test]
    fn deterministic_selection() {
        assert_eq!(design_for("hello"), design_for("hello"))
    }
    #[test]
    fn names_can_be_looked_up() {
        assert_eq!(by_name("receipt").unwrap().name, "receipt");
        assert!(by_name("nope").is_none())
    }
    #[test]
    fn long_words_use_smaller_type() {
        assert!(fit_size("pneumonoultramicroscopicsilicovolcanoconiosis") < fit_size("word"))
    }
    #[test]
    fn truncation_is_unicode_safe() {
        assert_eq!(truncate("éééé", 3), "éé…")
    }
    #[test]
    fn wraps_on_word_boundaries() {
        assert_eq!(
            wrap("one two three four", 7),
            vec!["one two", "three", "four"]
        )
    }
}
