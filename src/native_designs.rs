use crate::dictionary::WordData;
use std::fmt::Write;

pub struct Context<'a> {
    pub data: &'a WordData,
    pub watermark: &'a str,
    pub width: u32,
    pub height: u32,
}

pub fn render(name: &str, context: &Context<'_>) -> Option<String> {
    Some(match name {
        "editorial-dictionary" => editorial_dictionary(context),
        "etymology-breakdown" => etymology_breakdown(context),
        "bold-poster" => bold_poster(context),
        "risograph-stamp" => risograph_stamp(context),
        "letter-grid" => letter_grid(context),
        "word-in-context" => word_in_context(context),
        "brutalist-mono" => brutalist_mono(context),
        "soft-pastel-modern" => soft_pastel_modern(context),
        "terminal-output" => terminal_output(context),
        "receipt" => receipt(context),
        "diagnostic-readout" => diagnostic_readout(context),
        "lexicon-specimen" => lexicon_specimen(context),
        "split-panel-editorial" => split_panel_editorial(context),
        "ticket-stub" => ticket_stub(context),
        "log-output" => log_output(context),
        "passport-stamp" => passport_stamp(context),
        "concert-poster" => concert_poster(context),
        "tax-form" => tax_form(context),
        "vinyl-record" => vinyl_record(context),
        "patient-chart" => patient_chart(context),
        "boarding-pass" => boarding_pass(context),
        "wanted-poster" => wanted_poster(context),
        "field-journal" => field_journal(context),
        "qa-site" => qa_site(context),
        "library-catalog" => library_catalog(context),
        "pull-request" => pull_request(context),
        "lab-report" => lab_report(context),
        "vocabulary-certificate" => vocabulary_certificate(context),
        "encyclopedia-entry" => encyclopedia_entry(context),
        "police-lineup" => police_lineup(context),
        "recipe-card" => recipe_card(context),
        "subway-map" => subway_map(context),
        "patent-filing" => patent_filing(context),
        "wikipedia-infobox" => wikipedia_infobox(context),
        "postcard" => postcard(context),
        "polaroid" => polaroid(context),
        "cryptic-crossword" => cryptic_crossword(context),
        "vhs-title-card" => vhs_title_card(context),
        "sticky-note-pile" => sticky_note_pile(context),
        "telegram" => telegram(context),
        "postage-stamp" => postage_stamp(context),
        "movie-poster" => movie_poster(context),
        "tea-bag-tag" => tea_bag_tag(context),
        "periodic-element" => periodic_element(context),
        _ => return None,
    })
}

struct Svg {
    body: String,
    width: u32,
    height: u32,
}

impl Svg {
    fn new(width: u32, height: u32, background: &str) -> Self {
        Self {
            body: format!(r##"<rect width="100%" height="100%" fill="{background}"/>"##),
            width,
            height,
        }
    }

    fn raw(&mut self, value: impl AsRef<str>) {
        self.body.push_str(value.as_ref());
    }

    #[allow(clippy::too_many_arguments)]
    fn text(
        &mut self,
        value: &str,
        x: f32,
        y: f32,
        size: f32,
        family: &str,
        weight: &str,
        anchor: &str,
        fill: &str,
    ) {
        let _ = write!(
            self.body,
            r##"<text x="{x:.2}" y="{y:.2}" font-size="{size:.2}" font-family="{family}" font-weight="{weight}" text-anchor="{anchor}" dominant-baseline="middle" fill="{fill}">{}</text>"##,
            escape(value)
        );
    }

    fn finish(self) -> String {
        format!(
            r##"<svg width="{}" height="{}" viewBox="0 0 {} {}" xmlns="http://www.w3.org/2000/svg">{}</svg>"##,
            self.width, self.height, self.width, self.height, self.body
        )
    }
}

fn escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

fn truncate(value: &str, max: usize) -> String {
    if value.chars().count() <= max {
        value.to_owned()
    } else {
        format!(
            "{}…",
            value
                .chars()
                .take(max.saturating_sub(1))
                .collect::<String>()
        )
    }
}

fn wrap(value: &str, max: usize) -> Vec<String> {
    let mut lines = Vec::new();
    let mut current = String::new();
    for word in value.split_whitespace() {
        if !current.is_empty() && current.chars().count() + word.chars().count() + 1 > max {
            lines.push(std::mem::take(&mut current));
        }
        if !current.is_empty() {
            current.push(' ');
        }
        current.push_str(word);
    }
    if !current.is_empty() {
        lines.push(current);
    }
    lines
}

fn fit_size(value: &str, max_width: f32, maximum: f32, minimum: f32) -> f32 {
    (max_width / (value.chars().count().max(1) as f32 * 0.58)).clamp(minimum, maximum)
}

fn hash(value: &str) -> u32 {
    value.chars().fold(0_u32, |hash, character| {
        hash.wrapping_mul(31).wrapping_add(character as u32)
    })
}

fn entry_number(word: &str) -> u32 {
    hash(word) % 9000 + 1000
}

fn century(etymology: Option<&str>) -> String {
    let Some(value) = etymology else {
        return "—".into();
    };
    let year = value
        .split(|character: char| !character.is_ascii_digit())
        .find(|part| part.len() == 4)
        .and_then(|part| part.parse::<u32>().ok());
    year.filter(|year| (1000..=2100).contains(year))
        .map(|year| format!("{}C", year.div_ceil(100)))
        .unwrap_or_else(|| "—".into())
}

fn editorial_dictionary(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#f4efe6");
    let center = c.width as f32 / 2.0;
    s.text(
        "AN ENGLISH DICTIONARY",
        center,
        82.0,
        14.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#8a7a5c",
    );
    s.raw(format!(
        r##"<line x1="80" y1="110" x2="{}" y2="110" stroke="#c9b896" stroke-width=".5"/>"##,
        c.width - 80
    ));
    let size = fit_size(&c.data.word, c.width as f32 - 160.0, 110.0, 50.0);
    let y = c.height as f32 * 0.42;
    s.text(
        &c.data.word,
        center,
        y,
        size,
        "Liberation Serif",
        "normal",
        "middle",
        "#2a2317",
    );
    let sub = [
        (!c.data.part_of_speech.is_empty()).then_some(c.data.part_of_speech.as_str()),
        c.data.ipa.as_deref(),
    ]
    .into_iter()
    .flatten()
    .collect::<Vec<_>>()
    .join(" · ");
    if !sub.is_empty() {
        s.text(
            &sub,
            center,
            y + size / 2.0 + 40.0,
            22.0,
            "Liberation Serif",
            "normal",
            "middle",
            "#6b5d42",
        );
    }
    for (index, line) in wrap(&c.data.definition, 48).into_iter().take(3).enumerate() {
        s.text(
            &line,
            center,
            y + size / 2.0 + 90.0 + index as f32 * 32.0,
            22.0,
            "Liberation Serif",
            "normal",
            "middle",
            "#4a3f28",
        );
    }
    s.text(
        c.watermark,
        center,
        c.height as f32 - 40.0,
        14.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#8a7a5c",
    );
    s.finish()
}

fn etymology_breakdown(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#1a1a1a");
    let center = c.width as f32 / 2.0;
    let colors = ["#d4a574", "#b8d4a5", "#c9a5d4", "#a5c9d4"];
    let segments = split_morphemes(&c.data.word);
    let full = segments.join(" · ");
    let size = fit_size(&full, c.width as f32 - 120.0, 90.0, 40.0);
    s.text(
        &c.data
            .origin_language
            .as_deref()
            .map(|v| format!("{} ROOTS", v.to_uppercase()))
            .unwrap_or_else(|| "ETYMOLOGY".into()),
        center,
        80.0,
        12.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#888888",
    );
    let total = full.chars().count() as f32 * size * 0.58;
    let mut cursor = center - total / 2.0;
    for (index, segment) in segments.iter().enumerate() {
        let width = segment.chars().count() as f32 * size * 0.58;
        s.text(
            segment,
            cursor,
            c.height as f32 * 0.45,
            size,
            "Liberation Sans",
            "bold",
            "start",
            colors[index % 4],
        );
        s.text(
            &segment.to_uppercase(),
            cursor + width / 2.0,
            c.height as f32 * 0.65,
            12.0,
            "Liberation Mono",
            "normal",
            "middle",
            colors[index % 4],
        );
        cursor += width;
        if index + 1 < segments.len() {
            s.text(
                " · ",
                cursor,
                c.height as f32 * 0.45,
                size,
                "Liberation Sans",
                "bold",
                "start",
                "#888888",
            );
            cursor += size * 1.74;
        }
    }
    s.text(
        c.watermark,
        center,
        c.height as f32 - 40.0,
        14.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#888888",
    );
    s.finish()
}

fn split_morphemes(word: &str) -> Vec<String> {
    for suffix in ["ology", "ation", "ment", "ness", "able", "ing", "ed", "ly"] {
        if word.len() > suffix.len() + 2 && word.ends_with(suffix) {
            return vec![
                word[..word.len() - suffix.len()].to_owned(),
                suffix.to_owned(),
            ];
        }
    }
    vec![word.to_owned()]
}

fn bold_poster(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#f0ee2a");
    let chars = c.data.word.chars().collect::<Vec<_>>();
    let lines = chars
        .chunks(14)
        .map(|chunk| chunk.iter().collect::<String>())
        .collect::<Vec<_>>();
    let longest = lines
        .iter()
        .map(|line| line.chars().count())
        .max()
        .unwrap_or(1);
    let size = fit_size(&"x".repeat(longest), c.width as f32 - 100.0, 220.0, 80.0);
    let line_height = size * 0.92;
    let start = (c.height as f32 - line_height * lines.len() as f32) / 2.0 + line_height / 2.0;
    s.text(
        &c.data.part_of_speech.to_uppercase(),
        50.0,
        50.0,
        13.0,
        "Liberation Mono",
        "normal",
        "start",
        "#1a1a1a",
    );
    s.text(
        "NO. 0001",
        c.width as f32 - 50.0,
        50.0,
        13.0,
        "Liberation Mono",
        "normal",
        "end",
        "#1a1a1a",
    );
    for (index, line) in lines.iter().enumerate() {
        s.text(
            line,
            50.0,
            start + index as f32 * line_height,
            size,
            "Liberation Sans",
            "bold",
            "start",
            "#1a1a1a",
        );
    }
    s.text(
        "ENGLISHWORDBOT",
        50.0,
        c.height as f32 - 50.0,
        13.0,
        "Liberation Mono",
        "normal",
        "start",
        "#1a1a1a",
    );
    s.text(
        c.watermark,
        c.width as f32 - 50.0,
        c.height as f32 - 50.0,
        13.0,
        "Liberation Mono",
        "normal",
        "end",
        "#1a1a1a",
    );
    s.finish()
}

fn risograph_stamp(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#f5e6d3");
    s.raw(format!(r##"<rect x="60" y="60" width="{}" height="{}" fill="none" stroke="#c44d3c" stroke-width="3" rx="6"/><rect x="68" y="68" width="{}" height="{}" fill="none" stroke="#c44d3c" stroke-width=".8" rx="3"/>"##, c.width - 120, c.height - 120, c.width - 136, c.height - 136));
    let center = c.width as f32 / 2.0;
    let size = fit_size(&c.data.word, c.width as f32 - 100.0, 100.0, 50.0);
    let y = c.height as f32 / 2.0;
    s.text(
        "★  WORD OF THE MOMENT  ★",
        center,
        y - size / 2.0 - 50.0,
        14.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#c44d3c",
    );
    s.text(
        &c.data.word,
        center,
        y,
        size,
        "Liberation Serif",
        "normal",
        "middle",
        "#2d4a2b",
    );
    s.raw(format!(
        r##"<line x1="{}" y1="{}" x2="{}" y2="{}" stroke="#c44d3c"/>"##,
        center - 50.0,
        y + size / 2.0 + 25.0,
        center + 50.0,
        y + size / 2.0 + 25.0
    ));
    s.text(
        &truncate(c.data.definition.split('.').next().unwrap_or_default(), 60),
        center,
        y + size / 2.0 + 50.0,
        18.0,
        "Liberation Serif",
        "normal",
        "middle",
        "#5a4a2e",
    );
    s.text(
        c.watermark,
        center,
        c.height as f32 - 40.0,
        13.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#c44d3c",
    );
    s.finish()
}

fn letter_grid(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#fafaf7");
    let letters = c.data.word.chars().collect::<Vec<_>>();
    let columns = letters.len().clamp(1, 8);
    let rows = letters.len().div_ceil(columns);
    let tile = (((c.width - 120) as f32 - 10.0 * (columns - 1) as f32) / columns as f32).min(120.0);
    let grid_width = tile * columns as f32 + 10.0 * (columns - 1) as f32;
    let grid_height = tile * rows as f32 + 10.0 * (rows - 1) as f32;
    let start_x = (c.width as f32 - grid_width) / 2.0;
    let start_y = (c.height as f32 - grid_height) / 2.0 - 20.0;
    for (index, letter) in letters.iter().enumerate() {
        let x = start_x + (index % columns) as f32 * (tile + 10.0);
        let y = start_y + (index / columns) as f32 * (tile + 10.0);
        s.raw(format!(
            r##"<rect x="{x}" y="{y}" width="{tile}" height="{tile}" fill="#2d2d2d" rx="6"/>"##
        ));
        s.text(
            &letter.to_uppercase().to_string(),
            x + tile / 2.0,
            y + tile / 2.0,
            tile * 0.55,
            "Liberation Sans",
            "bold",
            "middle",
            "#fafaf7",
        );
    }
    s.text(
        &c.data.word,
        60.0,
        c.height as f32 - 80.0,
        16.0,
        "Liberation Sans",
        "bold",
        "start",
        "#222222",
    );
    s.text(
        &format!("{} letters · {}", letters.len(), c.data.part_of_speech),
        c.width as f32 - 60.0,
        c.height as f32 - 80.0,
        14.0,
        "Liberation Sans",
        "bold",
        "end",
        "#888888",
    );
    s.text(
        c.watermark,
        c.width as f32 / 2.0,
        c.height as f32 - 40.0,
        13.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#888888",
    );
    s.finish()
}

fn word_in_context(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#f7f3ed");
    let example = format!("“{}”", c.data.example.as_deref().unwrap_or_default());
    let lines = wrap(&example, 38);
    let start = 160.0;
    for (index, line) in lines.iter().enumerate() {
        let y = start + index as f32 * 38.0;
        if line.to_lowercase().contains(&c.data.word.to_lowercase()) {
            s.raw(format!(
                r##"<rect x="76" y="{}" width="{}" height="34" fill="#f0d97a"/>"##,
                y - 18.0,
                (line.chars().count() as f32 * 14.0).min(c.width as f32 - 152.0)
            ));
        }
        s.text(
            line,
            80.0,
            y,
            26.0,
            "Liberation Serif",
            "normal",
            "start",
            "#2a2317",
        );
    }
    let rule_y = start + lines.len() as f32 * 38.0 + 30.0;
    s.raw(format!(r##"<line x1="80" y1="{rule_y}" x2="{}" y2="{rule_y}" stroke="#c4b896" stroke-width=".5"/>"##, c.width - 80));
    s.text(
        &c.data.word,
        80.0,
        rule_y + 40.0,
        28.0,
        "Liberation Sans",
        "bold",
        "start",
        "#2a2317",
    );
    s.text(
        &format!(
            "{} · {}",
            c.data.part_of_speech,
            truncate(&c.data.definition, 50)
        ),
        80.0,
        rule_y + 70.0,
        14.0,
        "Liberation Sans",
        "bold",
        "start",
        "#6b5d42",
    );
    s.text(
        c.watermark,
        c.width as f32 / 2.0,
        c.height as f32 - 40.0,
        13.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#6b5d42",
    );
    s.finish()
}

fn brutalist_mono(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#e8e6df");
    s.raw(format!(r##"<line x1="0" y1="70" x2="{}" y2="70" stroke="#1a1a1a" stroke-width="1.5"/><line x1="0" y1="{}" x2="{}" y2="{}" stroke="#1a1a1a" stroke-width="1.5"/>"##, c.width, c.height - 70, c.width, c.height - 70));
    s.text(
        "SPECIMEN/0001",
        50.0,
        35.0,
        13.0,
        "Liberation Mono",
        "normal",
        "start",
        "#1a1a1a",
    );
    s.text(
        &chrono::Utc::now().format("%Y.%m.%d").to_string(),
        c.width as f32 - 50.0,
        35.0,
        13.0,
        "Liberation Mono",
        "normal",
        "end",
        "#1a1a1a",
    );
    let size = fit_size(&c.data.word, c.width as f32 - 100.0, 110.0, 50.0);
    s.text(
        &c.data.word,
        50.0,
        c.height as f32 / 2.0 - 20.0,
        size,
        "Liberation Sans",
        "bold",
        "start",
        "#1a1a1a",
    );
    s.text(
        &format!(
            "[{}] {}",
            c.data.part_of_speech.to_uppercase(),
            truncate(&c.data.definition, 70).to_uppercase()
        ),
        50.0,
        c.height as f32 / 2.0 + size / 2.0 + 10.0,
        13.0,
        "Liberation Mono",
        "normal",
        "start",
        "#1a1a1a",
    );
    s.text(
        &c.data
            .origin_language
            .as_deref()
            .unwrap_or("—")
            .to_uppercase(),
        50.0,
        c.height as f32 - 35.0,
        13.0,
        "Liberation Mono",
        "normal",
        "start",
        "#1a1a1a",
    );
    s.text(
        c.watermark,
        c.width as f32 - 50.0,
        c.height as f32 - 35.0,
        13.0,
        "Liberation Mono",
        "normal",
        "end",
        "#1a1a1a",
    );
    s.finish()
}

fn soft_pastel_modern(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#fef6ec");
    let part = if c.data.part_of_speech.is_empty() {
        "WORD".into()
    } else {
        c.data.part_of_speech.to_uppercase()
    };
    let pill_width = 36.0 + part.chars().count() as f32 * 8.0;
    s.raw(format!(
        r##"<rect x="80" y="80" width="{pill_width}" height="32" rx="16" fill="#f4d4a8"/>"##
    ));
    s.text(
        &part,
        80.0 + pill_width / 2.0,
        96.0,
        14.0,
        "Liberation Sans",
        "bold",
        "middle",
        "#6b4423",
    );
    let size = fit_size(&c.data.word, c.width as f32 - 160.0, 100.0, 50.0);
    let y = c.height as f32 / 2.0 - 20.0;
    s.text(
        &c.data.word,
        80.0,
        y,
        size,
        "Liberation Sans",
        "bold",
        "start",
        "#4a3520",
    );
    if let Some(ipa) = &c.data.ipa {
        s.text(
            &format!("/{ipa}/"),
            80.0,
            y + size / 2.0 + 30.0,
            18.0,
            "Liberation Serif",
            "normal",
            "start",
            "#8b6f4e",
        );
    }
    s.text(
        &truncate(&c.data.definition, 75),
        80.0,
        y + size / 2.0 + 70.0,
        16.0,
        "Liberation Sans",
        "bold",
        "start",
        "#5a4530",
    );
    s.text(
        c.watermark,
        80.0,
        c.height as f32 - 80.0,
        13.0,
        "Liberation Mono",
        "normal",
        "start",
        "#8b6f4e",
    );
    s.text(
        "★",
        c.width as f32 - 80.0,
        c.height as f32 - 80.0,
        18.0,
        "Liberation Sans",
        "normal",
        "middle",
        "#8b6f4e",
    );
    s.finish()
}

fn terminal_output(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#0a0e14");
    s.raw(format!(r##"<rect width="{}" height="36" fill="#1a1f28"/><circle cx="22" cy="18" r="6" fill="#ff5f56"/><circle cx="44" cy="18" r="6" fill="#ffbd2e"/><circle cx="66" cy="18" r="6" fill="#27c93f"/>"##, c.width));
    s.text(
        "~/words/today",
        86.0,
        18.0,
        13.0,
        "Liberation Mono",
        "normal",
        "start",
        "#888888",
    );
    let mut y = 72.0;
    s.text(
        "$ define",
        22.0,
        y,
        16.0,
        "Liberation Mono",
        "normal",
        "start",
        "#5fb3d7",
    );
    s.text(
        &format!("\"{}\"", c.data.word),
        118.0,
        y,
        16.0,
        "Liberation Mono",
        "normal",
        "start",
        "#f4c478",
    );
    y += 28.0;
    s.text(
        "→ querying wiktionary...",
        22.0,
        y,
        16.0,
        "Liberation Mono",
        "normal",
        "start",
        "#888888",
    );
    y += 56.0;
    terminal_row(&mut s, &mut y, "word:", &c.data.word, "#f5f3ec");
    terminal_row(&mut s, &mut y, "type:", &c.data.part_of_speech, "#f4c478");
    if let Some(ipa) = &c.data.ipa {
        terminal_row(&mut s, &mut y, "ipa:", &format!("/{ipa}/"), "#a8c98a");
    }
    terminal_row(
        &mut s,
        &mut y,
        "def:",
        &truncate(&c.data.definition.to_lowercase(), 38),
        "#f5f3ec",
    );
    if let Some(origin) = &c.data.origin_language {
        terminal_row(&mut s, &mut y, "from:", &origin.to_lowercase(), "#5fb3d7");
    }
    y += 28.0;
    s.text(
        "$",
        22.0,
        y,
        16.0,
        "Liberation Mono",
        "normal",
        "start",
        "#5fb3d7",
    );
    s.raw(format!(r##"<rect x="42" y="{}" width="8" height="18" fill="#c8d4e0"/><line x1="0" y1="{}" x2="{}" y2="{}" stroke="#1a1f28"/>"##, y - 9.0, c.height - 32, c.width, c.height - 32));
    s.text(
        &format!(
            "{} · {}",
            c.watermark.trim_start_matches('@'),
            entry_number(&c.data.word)
        ),
        22.0,
        c.height as f32 - 16.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#555555",
    );
    s.finish()
}

fn terminal_row(svg: &mut Svg, y: &mut f32, label: &str, value: &str, color: &str) {
    svg.text(
        label,
        22.0,
        *y,
        16.0,
        "Liberation Mono",
        "normal",
        "start",
        "#d782e8",
    );
    svg.text(
        value,
        118.0,
        *y,
        16.0,
        "Liberation Mono",
        "normal",
        "start",
        color,
    );
    *y += 28.0;
}

fn receipt(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#4a4a4a");
    let w = (c.width as f32 * 0.78).round();
    let h = (c.height as f32 * 0.86).round();
    let x = (c.width as f32 - w) / 2.0;
    let top = (c.height as f32 - h) / 2.0;
    let left = x + 28.0;
    let right = x + w - 28.0;
    s.raw(format!(r##"<rect x="{}" y="{}" width="{w}" height="{h}" fill="rgba(0,0,0,.25)"/><rect x="{x}" y="{top}" width="{w}" height="{h}" fill="#fafaf2"/>"##, x + 6.0, top + 6.0));
    let center = c.width as f32 / 2.0;
    let mut y = top + 32.0;
    s.text(
        "ENGLISHWORDBOT",
        center,
        y,
        16.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#1a1a1a",
    );
    y += 18.0;
    s.text(
        "EST. 2024 · BSKY.SOCIAL",
        center,
        y,
        10.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#555555",
    );
    y += 18.0;
    let rule = |svg: &mut Svg, yy: f32| {
        svg.raw(format!(r##"<line x1="{left}" y1="{yy}" x2="{right}" y2="{yy}" stroke="#999" stroke-dasharray="6 4"/>"##))
    };
    rule(&mut s, y);
    y += 16.0;
    s.text(
        &format!("ORDER #{}", entry_number(&c.data.word)),
        left,
        y,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#555555",
    );
    y += 16.0;
    s.text(
        &format!("{} · 14:20", chrono::Utc::now().format("%Y-%m-%d")),
        left,
        y,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#555555",
    );
    y += 18.0;
    rule(&mut s, y);
    y += 16.0;
    s.text(
        &format!("1× {}", c.data.word.to_uppercase()),
        left,
        y,
        13.0,
        "Liberation Mono",
        "normal",
        "start",
        "#1a1a1a",
    );
    if let Some(part) = c.data.part_of_speech.chars().next() {
        s.text(
            &format!("({part}.)"),
            right,
            y,
            13.0,
            "Liberation Mono",
            "normal",
            "end",
            "#1a1a1a",
        );
    }
    y += 16.0;
    if let Some(ipa) = &c.data.ipa {
        s.text(
            &format!("/{ipa}/"),
            left + 14.0,
            y,
            10.0,
            "Liberation Mono",
            "normal",
            "start",
            "#555555",
        );
        y += 14.0;
    }
    for line in wrap(&truncate(&c.data.definition, 100), 32)
        .into_iter()
        .take(3)
    {
        s.text(
            &line,
            left + 14.0,
            y,
            10.0,
            "Liberation Mono",
            "normal",
            "start",
            "#555555",
        );
        y += 14.0;
    }
    y += 6.0;
    rule(&mut s, y);
    y += 16.0;
    for (label, value) in [
        ("LETTERS", c.data.word.chars().count().to_string()),
        (
            "ORIGIN",
            c.data
                .origin_language
                .as_deref()
                .unwrap_or("—")
                .to_uppercase(),
        ),
        ("CENTURY", century(c.data.etymology.as_deref())),
    ] {
        s.text(
            label,
            left,
            y,
            11.0,
            "Liberation Mono",
            "normal",
            "start",
            "#1a1a1a",
        );
        s.text(
            &value,
            right,
            y,
            11.0,
            "Liberation Mono",
            "normal",
            "end",
            "#1a1a1a",
        );
        y += 16.0;
    }
    y += 6.0;
    s.raw(format!(
        r##"<line x1="{left}" y1="{y}" x2="{right}" y2="{y}" stroke="#1a1a1a" stroke-width="2"/>"##
    ));
    y += 18.0;
    s.text(
        "★  THANK YOU  ★",
        center,
        y,
        11.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#1a1a1a",
    );
    y += 22.0;
    s.text(
        "||||| || |||| ||| || |||||",
        center,
        y,
        12.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#1a1a1a",
    );
    y += 22.0;
    s.text(
        c.watermark,
        center,
        y,
        9.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#555555",
    );
    s.finish()
}

fn diagnostic_readout(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#0a1a14");
    s.text(
        "| WORD DIAGNOSTIC v0.4.28",
        28.0,
        36.0,
        13.0,
        "Liberation Mono",
        "normal",
        "start",
        "#6affb0",
    );
    s.text(
        "14:20:07",
        c.width as f32 - 28.0,
        36.0,
        13.0,
        "Liberation Mono",
        "normal",
        "end",
        "#4a7a5a",
    );
    s.raw(format!(
        r##"<line x1="28" y1="52" x2="{}" y2="52" stroke="#1a3a2a"/>"##,
        c.width - 28
    ));
    let mut y = 76.0;
    diagnostic_row(&mut s, &mut y, "[ scanning ]".into(), "#4a7a5a");
    diagnostic_row(
        &mut s,
        &mut y,
        format!(">TARGET: {}", c.data.word),
        "#6affb0",
    );
    diagnostic_row(
        &mut s,
        &mut y,
        format!("  └─ length......{} chars", c.data.word.chars().count()),
        "#4a7a5a",
    );
    diagnostic_row(
        &mut s,
        &mut y,
        format!("  └─ syllables...{}", approximate_syllables(&c.data.word)),
        "#4a7a5a",
    );
    y += 8.0;
    if let Some(ipa) = &c.data.ipa {
        diagnostic_row(&mut s, &mut y, format!(">PHONETIC: /{ipa}/"), "#f4c478");
        y += 8.0;
    }
    diagnostic_row(
        &mut s,
        &mut y,
        format!(">CLASS: {}", c.data.part_of_speech),
        "#6affb0",
    );
    diagnostic_row(
        &mut s,
        &mut y,
        format!(">DEF: {}", truncate(&c.data.definition, 56)),
        "#c8d4c0",
    );
    if let Some(origin) = &c.data.origin_language {
        diagnostic_row(&mut s, &mut y, format!(">ORIGIN: {origin}"), "#6affb0");
    }
    y += 32.0;
    diagnostic_row(&mut s, &mut y, "[ analysis complete ]".into(), "#4a7a5a");
    s.text(
        "|",
        28.0,
        y,
        14.0,
        "Liberation Mono",
        "normal",
        "start",
        "#4a7a5a",
    );
    s.raw(format!(
        r##"<rect x="48" y="{}" width="7" height="14" fill="#6affb0"/>"##,
        y - 7.0
    ));
    s.text(
        c.watermark,
        c.width as f32 - 28.0,
        c.height as f32 - 24.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#4a7a5a",
    );
    s.finish()
}

fn diagnostic_row(svg: &mut Svg, y: &mut f32, text: String, color: &str) {
    svg.text(
        &text,
        28.0,
        *y,
        14.0,
        "Liberation Mono",
        "normal",
        "start",
        color,
    );
    *y += 24.0;
}

fn approximate_syllables(word: &str) -> usize {
    let mut previous = false;
    let mut count = 0;
    for character in word.to_lowercase().chars() {
        let vowel = "aeiouy".contains(character);
        if vowel && !previous {
            count += 1;
        }
        previous = vowel;
    }
    count.max(1)
}

fn lexicon_specimen(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#2a2820");
    s.text(
        &format!("SPECIMEN №{}", entry_number(&c.data.word)),
        36.0,
        50.0,
        12.0,
        "Liberation Mono",
        "normal",
        "start",
        "#d4a574",
    );
    s.text(
        "ENGLISH LEXICON DEPT.",
        c.width as f32 - 36.0,
        50.0,
        12.0,
        "Liberation Mono",
        "normal",
        "end",
        "#d4a574",
    );
    let size = fit_size(&c.data.word, c.width as f32 - 72.0, 88.0, 38.0);
    let word_y = c.height as f32 * 0.42;
    s.text(
        &c.data.word,
        36.0,
        word_y,
        size,
        "Liberation Serif",
        "normal",
        "start",
        "#f4ead8",
    );
    let mut y = word_y + size / 2.0 + 88.0;
    for (label, value) in [
        ("CLASS", c.data.part_of_speech.clone()),
        (
            "PHON",
            c.data
                .ipa
                .as_deref()
                .map(|v| format!("/{v}/"))
                .unwrap_or_else(|| "—".into()),
        ),
        (
            "DERIV",
            truncate(c.data.etymology.as_deref().unwrap_or("—"), 38),
        ),
        ("SENSE", truncate(&c.data.definition, 38)),
        ("EPOCH", century(c.data.etymology.as_deref())),
    ] {
        s.text(
            label,
            36.0,
            y,
            12.0,
            "Liberation Mono",
            "normal",
            "start",
            "#6a5a3a",
        );
        s.text(
            &value,
            106.0,
            y,
            fit_size(&value, c.width as f32 - 142.0, 12.0, 9.0),
            "Liberation Mono",
            "normal",
            "start",
            if label == "SENSE" {
                "#f4ead8"
            } else {
                "#c8baa0"
            },
        );
        y += 24.0;
    }
    s.raw(format!(
        r##"<line x1="36" y1="{}" x2="{}" y2="{}" stroke="#5a4a2a"/>"##,
        c.height - 70,
        c.width - 36,
        c.height - 70
    ));
    s.text(
        c.watermark,
        c.width as f32 - 36.0,
        c.height as f32 - 42.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#6a5a3a",
    );
    s.finish()
}

fn split_panel_editorial(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#f5f1e4");
    let half = c.width as f32 / 2.0;
    s.raw(format!(
        r##"<rect width="{half}" height="{}" fill="#1a1a1a"/>"##,
        c.height
    ));
    s.text(
        &format!("ENTRY · {}", entry_number(&c.data.word)),
        32.0,
        50.0,
        12.0,
        "Liberation Mono",
        "normal",
        "start",
        "#d4a574",
    );
    let lines = split_word(&c.data.word);
    let size = fit_size(
        lines.iter().max_by_key(|line| line.len()).unwrap(),
        half - 64.0,
        64.0,
        28.0,
    );
    let start = c.height as f32 / 2.0 - size * lines.len() as f32 / 2.0 - 30.0;
    for (index, line) in lines.iter().enumerate() {
        s.text(
            line,
            32.0,
            start + index as f32 * size + size / 2.0,
            size,
            "Liberation Serif",
            "normal",
            "start",
            "#f5f1e4",
        );
    }
    if let Some(ipa) = &c.data.ipa {
        s.text(
            &format!("/{ipa}/"),
            32.0,
            start + size * lines.len() as f32 + 24.0,
            12.0,
            "Liberation Mono",
            "normal",
            "start",
            "#d4a574",
        );
    }
    s.text(
        "EWB.BSKY",
        32.0,
        c.height as f32 - 36.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#888888",
    );
    let x = half + 32.0;
    let mut y = 56.0;
    for (label, content) in [
        ("DEFINITION", c.data.definition.as_str()),
        ("ETYMOLOGY", c.data.etymology.as_deref().unwrap_or("—")),
        ("CLASS", c.data.part_of_speech.as_str()),
    ] {
        s.text(
            label,
            x,
            y,
            12.0,
            "Liberation Mono",
            "normal",
            "start",
            "#c44d3c",
        );
        y += 22.0;
        for line in wrap(content, 32).into_iter().take(3) {
            s.text(
                &line,
                x,
                y,
                14.0,
                "Liberation Serif",
                "normal",
                "start",
                "#1a1a1a",
            );
            y += 22.0;
        }
        y += 6.0;
        s.raw(format!(
            r##"<line x1="{x}" y1="{y}" x2="{}" y2="{y}" stroke="#c4b896"/>"##,
            c.width - 32
        ));
        y += 14.0;
    }
    s.text(
        c.watermark,
        c.width as f32 - 32.0,
        c.height as f32 - 36.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#3a3a2a",
    );
    s.finish()
}

fn split_word(word: &str) -> Vec<String> {
    if word.chars().count() <= 10 {
        return vec![word.into()];
    }
    let chars = word.chars().collect::<Vec<_>>();
    let middle = chars.len().div_ceil(2);
    vec![
        chars[..middle].iter().collect(),
        chars[middle..].iter().collect(),
    ]
}

fn ticket_stub(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#2d3a4a");
    let h = (c.height as f32 * 0.75).round();
    let top = (c.height as f32 - h) / 2.0;
    let w = c.width as f32 - 80.0;
    let stub = (w / 3.0).round();
    let main = w - stub;
    let stub_x = 40.0 + main;
    s.raw(format!(r##"<rect x="48" y="{}" width="{w}" height="{h}" fill="rgba(0,0,0,.35)"/><rect x="40" y="{top}" width="{main}" height="{h}" fill="#f4ead0"/><rect x="{stub_x}" y="{top}" width="{stub}" height="{h}" fill="#c44d3c"/><line x1="{stub_x}" y1="{top}" x2="{stub_x}" y2="{}" stroke="#2d3a4a" stroke-dasharray="4 4"/>"##, top + 8.0, top + h));
    let left = 64.0;
    let right = 40.0 + main - 24.0;
    let header_y = top + 28.0;
    s.text(
        "ADMIT ONE · WORD OF THE DAY",
        left,
        header_y,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#8a6a3a",
    );
    s.raw(format!(
        r##"<line x1="{left}" y1="{}" x2="{right}" y2="{}" stroke="#c4a474"/>"##,
        header_y + 16.0,
        header_y + 16.0
    ));
    let size = fit_size(&c.data.word, main - 48.0, 56.0, 26.0);
    let word_y = header_y + 66.0;
    s.text(
        &c.data.word,
        left,
        word_y,
        size,
        "Liberation Serif",
        "normal",
        "start",
        "#2a1a0a",
    );
    s.text(
        &format!(
            "{} · /{}/",
            c.data.part_of_speech,
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        left,
        word_y + size / 2.0 + 22.0,
        12.0,
        "Liberation Mono",
        "normal",
        "start",
        "#6a4a2a",
    );
    s.text(
        &format!("“{}”", truncate(&c.data.definition, 56)),
        left,
        top + h * 0.66,
        14.0,
        "Liberation Serif",
        "normal",
        "start",
        "#4a2a1a",
    );
    let footer = top + h - 22.0;
    s.text(
        &format!("SEC. {}", c.data.part_of_speech.to_uppercase()),
        left,
        footer,
        10.0,
        "Liberation Mono",
        "normal",
        "start",
        "#8a6a3a",
    );
    s.text(
        &format!("SEAT {}", century(c.data.etymology.as_deref())),
        right,
        footer,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#8a6a3a",
    );
    let cx = stub_x + stub / 2.0;
    s.text(
        "★",
        cx,
        top + h / 2.0,
        58.0,
        "Liberation Sans",
        "normal",
        "middle",
        "#f5f1e4",
    );
    s.raw(format!(r##"<g transform="translate({} {}) rotate(-90)"><text text-anchor="middle" dominant-baseline="middle" font-family="Liberation Mono" font-size="11" fill="#f5f1e4">NO. {} · EWB</text></g><g transform="translate({} {}) rotate(-90)"><text text-anchor="middle" dominant-baseline="middle" font-family="Liberation Mono" font-size="9" fill="#f5f1e4">{}</text></g>"##, cx, top + 110.0, entry_number(&c.data.word), cx, top + h - 110.0, escape(c.watermark.trim_start_matches('@'))));
    s.finish()
}

fn log_output(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#1a1a1a");
    s.raw(format!(
        r##"<rect width="{}" height="32" fill="#2a2a2a"/>"##,
        c.width
    ));
    s.text(
        "[ word.log ]",
        22.0,
        16.0,
        12.0,
        "Liberation Mono",
        "normal",
        "start",
        "#888888",
    );
    s.text(
        "v v v",
        c.width as f32 - 22.0,
        16.0,
        12.0,
        "Liberation Mono",
        "normal",
        "end",
        "#4a4a4a",
    );
    let logs = [
        (
            "14:20:01",
            "INFO",
            format!("fetching word #{}", entry_number(&c.data.word)),
        ),
        ("14:20:02", "OK", format!("word: \"{}\"", c.data.word)),
        ("14:20:02", "INFO", "querying wiktionary...".into()),
        ("14:20:03", "OK", "200 — definition retrieved".into()),
    ];
    let mut y = 60.0;
    for (time, level, message) in logs {
        s.text(
            time,
            22.0,
            y,
            13.0,
            "Liberation Mono",
            "normal",
            "start",
            "#4a4a4a",
        );
        let tag = if level == "OK" { "#2a8a4a" } else { "#2a4a8a" };
        s.raw(format!(
            r##"<rect x="105" y="{}" width="50" height="16" fill="{tag}"/>"##,
            y - 8.0
        ));
        s.text(
            level,
            130.0,
            y,
            10.0,
            "Liberation Mono",
            "normal",
            "middle",
            "white",
        );
        s.text(
            &message,
            167.0,
            y,
            13.0,
            "Liberation Mono",
            "normal",
            "start",
            "#c8c8c8",
        );
        y += 24.0;
    }
    y += 12.0;
    let block_top = y;
    let block_h = 170.0;
    s.raw(format!(r##"<rect x="22" y="{block_top}" width="{}" height="{block_h}" fill="#0a0a0a"/><rect x="22" y="{block_top}" width="3" height="{block_h}" fill="#f4c478"/>"##, c.width - 44));
    y += 30.0;
    s.text(
        &c.data.word,
        46.0,
        y,
        fit_size(&c.data.word, c.width as f32 - 92.0, 32.0, 18.0),
        "Liberation Sans",
        "bold",
        "start",
        "#f5f3ec",
    );
    y += 38.0;
    s.text(
        &format!(
            "{} · /{}/",
            c.data.part_of_speech,
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        46.0,
        y,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#888888",
    );
    y += 25.0;
    for line in wrap(&truncate(&c.data.definition, 110), 50)
        .into_iter()
        .take(2)
    {
        s.text(
            &line,
            46.0,
            y,
            13.0,
            "Liberation Sans",
            "bold",
            "start",
            "#c8c8c8",
        );
        y += 18.0;
    }
    if let Some(origin) = &c.data.origin_language {
        s.text(
            &format!("// from {origin}"),
            46.0,
            y + 8.0,
            11.0,
            "Liberation Mono",
            "normal",
            "start",
            "#6affb0",
        );
    }
    s.text(
        c.watermark,
        c.width as f32 - 22.0,
        c.height as f32 - 16.0,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#4a4a4a",
    );
    s.finish()
}

fn passport_stamp(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#d8cfb8");
    let x = 60.0;
    let top = 120.0;
    let w = c.width as f32 - 120.0;
    let h = c.height as f32 - 220.0;
    let left = 88.0;
    let right = x + w - 28.0;
    s.raw(format!(
        r##"<rect x="{x}" y="{top}" width="{w}" height="{h}" fill="#e8dec5" stroke="#8a7a5a"/>"##
    ));
    s.text(
        "DEPT. OF LEXICOGRAPHY",
        left,
        top + 28.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#5a4a2a",
    );
    s.text(
        &format!("NO. {}", entry_number(&c.data.word)),
        right,
        top + 28.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#5a4a2a",
    );
    s.raw(format!(r##"<line x1="{left}" y1="{}" x2="{right}" y2="{}" stroke="#8a7a5a" stroke-dasharray="6 4"/>"##, top + 46.0, top + 46.0));
    s.text(
        "SURNAME / NOM",
        left,
        top + 78.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#8a7a5a",
    );
    let size = fit_size(&c.data.word, w - 76.0, 32.0, 16.0);
    let word_y = top + 116.0;
    s.text(
        &c.data.word.to_uppercase(),
        left,
        word_y,
        size,
        "Liberation Mono",
        "normal",
        "start",
        "#2a1a0a",
    );
    s.text(
        &format!(
            "CLASS · {}   /   PHON · /{}/",
            c.data.part_of_speech.to_uppercase(),
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        left,
        word_y + size / 2.0 + 22.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#5a4a2a",
    );
    let mut y = word_y + size / 2.0 + 70.0;
    for (label, value) in [
        (
            "NATIONALITY",
            c.data
                .origin_language
                .as_deref()
                .unwrap_or("—")
                .to_uppercase(),
        ),
        ("DATE OF ENTRY", century(c.data.etymology.as_deref())),
        ("MEANING", truncate(&c.data.definition.to_uppercase(), 38)),
    ] {
        s.text(
            label,
            left,
            y,
            11.0,
            "Liberation Mono",
            "normal",
            "start",
            "#8a7a5a",
        );
        s.text(
            &value,
            left + 130.0,
            y,
            11.0,
            "Liberation Mono",
            "normal",
            "start",
            "#2a1a0a",
        );
        y += 22.0;
    }
    let stamp_x = x + w - 60.0;
    let stamp_y = top + h * 0.55;
    s.raw(format!(r##"<g transform="translate({stamp_x} {stamp_y}) rotate(-12)"><rect x="-65" y="-18" width="130" height="36" fill="none" stroke="#c44d3c" stroke-width="2.5"/><rect x="-61" y="-14" width="122" height="28" fill="none" stroke="#c44d3c"/><text text-anchor="middle" dominant-baseline="middle" font-family="Liberation Mono" font-size="14" fill="#c44d3c">APPROVED</text></g>"##));
    s.text(
        &c.watermark.to_uppercase(),
        c.width as f32 / 2.0,
        c.height as f32 - 46.0,
        11.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#5a4a2a",
    );
    s.finish()
}

fn concert_poster(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#17131f");
    s.raw(format!(r##"<rect x="0" y="0" width="{}" height="118" fill="#e84a78"/><path d="M55 175L745 105M55 690L745 620" stroke="#e84a78" stroke-width="14"/>"##, c.width));
    s.text(
        "ONE WORD · ONE NIGHT ONLY",
        50.0,
        55.0,
        17.0,
        "Liberation Mono",
        "bold",
        "start",
        "#17131f",
    );
    s.text(
        &format!("NO. {}", entry_number(&c.data.word)),
        c.width as f32 - 50.0,
        55.0,
        15.0,
        "Liberation Mono",
        "normal",
        "end",
        "#17131f",
    );
    let size = fit_size(
        &c.data.word.to_uppercase(),
        c.width as f32 - 110.0,
        104.0,
        42.0,
    );
    s.text(
        &c.data.word.to_uppercase(),
        55.0,
        315.0,
        size,
        "Liberation Sans",
        "bold",
        "start",
        "#f4e8ce",
    );
    s.text(
        &format!(
            "{}  /{}/",
            c.data.part_of_speech.to_uppercase(),
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        58.0,
        390.0,
        18.0,
        "Liberation Mono",
        "normal",
        "start",
        "#e84a78",
    );
    for (n, line) in wrap(&truncate(&c.data.definition, 105), 45)
        .into_iter()
        .take(3)
        .enumerate()
    {
        s.text(
            &line,
            58.0,
            465.0 + n as f32 * 28.0,
            20.0,
            "Liberation Serif",
            "normal",
            "start",
            "#f4e8ce",
        );
    }
    s.text(
        c.data
            .origin_language
            .as_deref()
            .unwrap_or("UNKNOWN ORIGIN"),
        58.0,
        620.0,
        14.0,
        "Liberation Mono",
        "normal",
        "start",
        "#e84a78",
    );
    s.text(
        c.watermark,
        c.width as f32 - 50.0,
        c.height as f32 - 45.0,
        12.0,
        "Liberation Mono",
        "normal",
        "end",
        "#f4e8ce",
    );
    s.finish()
}

fn tax_form(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#dce7dd");
    s.raw(format!(r##"<rect x="42" y="42" width="{}" height="{}" fill="none" stroke="#1d3124" stroke-width="3"/><line x1="42" y1="145" x2="{}" y2="145" stroke="#1d3124" stroke-width="2"/>"##, c.width - 84, c.height - 84, c.width - 42));
    s.text(
        "FORM EWB-1040",
        62.0,
        73.0,
        15.0,
        "Liberation Mono",
        "bold",
        "start",
        "#1d3124",
    );
    s.text(
        &chrono::Utc::now().format("%Y").to_string(),
        c.width as f32 - 62.0,
        73.0,
        15.0,
        "Liberation Mono",
        "normal",
        "end",
        "#1d3124",
    );
    s.text(
        "DECLARATION OF LEXICAL INCOME",
        62.0,
        112.0,
        22.0,
        "Liberation Sans",
        "bold",
        "start",
        "#1d3124",
    );
    let mut y = 182.0;
    for (number, label, value) in [
        ("1", "WORD OR PHRASE", c.data.word.clone()),
        ("2", "PART OF SPEECH", c.data.part_of_speech.clone()),
        (
            "3",
            "PRONUNCIATION",
            c.data
                .ipa
                .as_deref()
                .map(|v| format!("/{v}/"))
                .unwrap_or_else(|| "—".into()),
        ),
        (
            "4",
            "LANGUAGE OF ORIGIN",
            c.data.origin_language.clone().unwrap_or_else(|| "—".into()),
        ),
    ] {
        s.text(
            number,
            62.0,
            y,
            12.0,
            "Liberation Mono",
            "bold",
            "start",
            "#4c7157",
        );
        s.text(
            label,
            92.0,
            y,
            11.0,
            "Liberation Mono",
            "normal",
            "start",
            "#4c7157",
        );
        s.raw(format!(
            r##"<rect x="62" y="{}" width="{}" height="45" fill="none" stroke="#4c7157"/>"##,
            y + 16.0,
            c.width - 124
        ));
        s.text(
            &value,
            76.0,
            y + 39.0,
            fit_size(&value, c.width as f32 - 152.0, 22.0, 12.0),
            "Liberation Sans",
            "bold",
            "start",
            "#1d3124",
        );
        y += 84.0;
    }
    s.text(
        "5  DEFINITION / DEDUCTION",
        62.0,
        y,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#4c7157",
    );
    y += 34.0;
    for line in wrap(&c.data.definition, 58).into_iter().take(3) {
        s.text(
            &line,
            76.0,
            y,
            15.0,
            "Liberation Serif",
            "normal",
            "start",
            "#1d3124",
        );
        y += 24.0;
    }
    s.text(
        "Under penalties of perjury, this word is certified valid.",
        62.0,
        c.height as f32 - 82.0,
        10.0,
        "Liberation Mono",
        "normal",
        "start",
        "#4c7157",
    );
    s.text(
        c.watermark,
        c.width as f32 - 62.0,
        c.height as f32 - 62.0,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#1d3124",
    );
    s.finish()
}

fn vinyl_record(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#181818");
    let cx = 196.0;
    let cy = 400.0;
    s.raw(format!(
        r##"<circle cx="{cx}" cy="{cy}" r="168" fill="#050505"/>"##
    ));
    for radius in (65..160).step_by(11) {
        s.raw(format!(r##"<circle cx="{cx}" cy="{cy}" r="{radius}" fill="none" stroke="#272727" stroke-width="1"/>"##));
    }
    s.raw(format!(r##"<circle cx="{cx}" cy="{cy}" r="70" fill="#cc4f3d"/><circle cx="{cx}" cy="{cy}" r="12" fill="#050505"/>"##));
    s.text(
        "SIDE A",
        cx,
        cy - 48.0,
        11.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#f0ddbd",
    );
    s.text(
        &c.data.word,
        cx,
        cy - 25.0,
        15.0,
        "Liberation Serif",
        "normal",
        "middle",
        "#f0ddbd",
    );
    let x = 388.0;
    s.text(
        &format!("EWB RECORDS · LP·{}", entry_number(&c.data.word)),
        x,
        65.0,
        12.0,
        "Liberation Mono",
        "normal",
        "start",
        "#cc4f3d",
    );
    s.text(
        &c.data.word,
        x,
        102.0,
        fit_size(&c.data.word, c.width as f32 - x - 45.0, 34.0, 18.0),
        "Liberation Serif",
        "normal",
        "start",
        "#f0ddbd",
    );
    s.text(
        &format!(
            "{} · /{}/",
            c.data.part_of_speech,
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        x,
        136.0,
        13.0,
        "Liberation Mono",
        "normal",
        "start",
        "#aaa097",
    );
    s.raw(format!(
        r##"<line x1="{x}" y1="157" x2="{}" y2="157" stroke="#4a382a"/>"##,
        c.width - 28
    ));
    s.text(
        "TRACKLIST",
        x,
        181.0,
        12.0,
        "Liberation Sans",
        "bold",
        "start",
        "#aaa097",
    );
    for (n, line) in wrap(&c.data.definition, 30).into_iter().take(2).enumerate() {
        s.text(
            &format!("{}. {line}", n + 1),
            x,
            208.0 + n as f32 * 24.0,
            14.0,
            "Liberation Serif",
            "normal",
            "start",
            "#d2c09e",
        );
    }
    s.text(
        c.watermark,
        c.width as f32 - 35.0,
        c.height as f32 - 35.0,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#604d38",
    );
    s.finish()
}

fn patient_chart(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#e7eee9");
    s.raw(format!(r##"<rect x="74" y="52" width="{}" height="{}" fill="#f7faf8" stroke="#26332d" stroke-width="3"/><path d="M300 52V112H500V52" fill="none" stroke="#b43e3e" stroke-width="4"/>"##, c.width - 148, c.height - 104));
    s.text(
        "LEXICAL PATIENT CHART",
        98.0,
        145.0,
        14.0,
        "Liberation Mono",
        "bold",
        "start",
        "#26332d",
    );
    s.text(
        &format!("ID {}", entry_number(&c.data.word)),
        c.width as f32 - 98.0,
        145.0,
        12.0,
        "Liberation Mono",
        "normal",
        "end",
        "#63726a",
    );
    s.raw(format!(
        r##"<line x1="98" y1="165" x2="{}" y2="165" stroke="#b43e3e"/>"##,
        c.width - 98
    ));
    s.text(
        "PATIENT",
        98.0,
        200.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#63726a",
    );
    s.text(
        &c.data.word,
        98.0,
        240.0,
        fit_size(&c.data.word, c.width as f32 - 196.0, 46.0, 23.0),
        "Liberation Serif",
        "bold",
        "start",
        "#26332d",
    );
    let mut y = 300.0;
    for (label, value) in [
        ("CLASS", c.data.part_of_speech.as_str()),
        ("PHONETICS", c.data.ipa.as_deref().unwrap_or("—")),
        ("ORIGIN", c.data.origin_language.as_deref().unwrap_or("—")),
    ] {
        s.text(
            label,
            98.0,
            y,
            11.0,
            "Liberation Mono",
            "normal",
            "start",
            "#63726a",
        );
        s.text(
            value,
            245.0,
            y,
            14.0,
            "Liberation Sans",
            "normal",
            "start",
            "#26332d",
        );
        y += 38.0;
    }
    s.text(
        "DIAGNOSIS",
        98.0,
        430.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#b43e3e",
    );
    for (n, line) in wrap(&c.data.definition, 48).into_iter().take(3).enumerate() {
        s.text(
            &line,
            98.0,
            464.0 + n as f32 * 25.0,
            16.0,
            "Liberation Serif",
            "normal",
            "start",
            "#26332d",
        );
    }
    s.raw(r##"<path d="M100 620h85l22-35 28 70 32-50 25 15h180" fill="none" stroke="#b43e3e" stroke-width="3"/>"##);
    s.text(
        c.watermark,
        c.width as f32 - 98.0,
        c.height as f32 - 78.0,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#63726a",
    );
    s.finish()
}

fn boarding_pass(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#152940");
    let x = 35.0;
    let top = 145.0;
    let w = c.width as f32 - 70.0;
    let h = 510.0;
    let split = 585.0;
    s.raw(format!(r##"<rect x="{x}" y="{top}" width="{w}" height="{h}" rx="8" fill="#e8e2d3"/><line x1="{split}" y1="{top}" x2="{split}" y2="{}" stroke="#db6d35" stroke-width="2" stroke-dasharray="9 8"/>"##, top + h));
    s.text(
        "EWB AIR · BOARDING PASS",
        68.0,
        184.0,
        13.0,
        "Liberation Mono",
        "bold",
        "start",
        "#152940",
    );
    s.text(
        "LEX",
        split + 32.0,
        184.0,
        22.0,
        "Liberation Sans",
        "bold",
        "start",
        "#db6d35",
    );
    s.text(
        "PASSENGER / WORD",
        68.0,
        235.0,
        10.0,
        "Liberation Mono",
        "normal",
        "start",
        "#6b7480",
    );
    s.text(
        &c.data.word.to_uppercase(),
        68.0,
        275.0,
        fit_size(&c.data.word, 480.0, 44.0, 20.0),
        "Liberation Sans",
        "bold",
        "start",
        "#152940",
    );
    s.text(
        &format!(
            "FROM  {}",
            c.data
                .origin_language
                .as_deref()
                .unwrap_or("UNKNOWN")
                .to_uppercase()
        ),
        68.0,
        350.0,
        12.0,
        "Liberation Mono",
        "normal",
        "start",
        "#152940",
    );
    s.text(
        "TO  ENGLISH",
        335.0,
        350.0,
        12.0,
        "Liberation Mono",
        "normal",
        "start",
        "#152940",
    );
    s.text(
        &format!("CLASS  {}", c.data.part_of_speech.to_uppercase()),
        68.0,
        410.0,
        12.0,
        "Liberation Mono",
        "normal",
        "start",
        "#152940",
    );
    s.text(
        &format!("GATE  {}", century(c.data.etymology.as_deref())),
        335.0,
        410.0,
        12.0,
        "Liberation Mono",
        "normal",
        "start",
        "#152940",
    );
    for (n, line) in wrap(&truncate(&c.data.definition, 95), 52)
        .into_iter()
        .take(2)
        .enumerate()
    {
        s.text(
            &line,
            68.0,
            490.0 + n as f32 * 25.0,
            16.0,
            "Liberation Serif",
            "normal",
            "start",
            "#152940",
        );
    }
    s.text(
        "✈",
        split + 77.0,
        290.0,
        52.0,
        "Liberation Sans",
        "normal",
        "middle",
        "#db6d35",
    );
    s.text(
        &entry_number(&c.data.word).to_string(),
        split + 77.0,
        390.0,
        16.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#152940",
    );
    s.text(
        c.watermark,
        68.0,
        top + h - 35.0,
        10.0,
        "Liberation Mono",
        "normal",
        "start",
        "#6b7480",
    );
    s.finish()
}

fn wanted_poster(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#d6b77a");
    s.raw(format!(r##"<rect x="42" y="42" width="{}" height="{}" fill="none" stroke="#2b190b" stroke-width="8"/><rect x="57" y="57" width="{}" height="{}" fill="none" stroke="#7d291b" stroke-width="2"/>"##, c.width - 84, c.height - 84, c.width - 114, c.height - 114));
    s.text(
        "WANTED",
        c.width as f32 / 2.0,
        115.0,
        58.0,
        "Liberation Serif",
        "bold",
        "middle",
        "#2b190b",
    );
    s.text(
        "FOR LEXICAL DISTINCTION",
        c.width as f32 / 2.0,
        160.0,
        15.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#7d291b",
    );
    s.raw(format!(
        r##"<line x1="75" y1="185" x2="{}" y2="185" stroke="#7d291b" stroke-width="3"/>"##,
        c.width - 75
    ));
    let size = fit_size(&c.data.word, c.width as f32 - 130.0, 82.0, 35.0);
    s.text(
        &c.data.word.to_uppercase(),
        c.width as f32 / 2.0,
        315.0,
        size,
        "Liberation Serif",
        "bold",
        "middle",
        "#2b190b",
    );
    s.text(
        &format!(
            "{} · /{}/",
            c.data.part_of_speech.to_uppercase(),
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        c.width as f32 / 2.0,
        375.0,
        15.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#7d291b",
    );
    s.text(
        "DESCRIPTION",
        c.width as f32 / 2.0,
        440.0,
        13.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#7d291b",
    );
    for (n, line) in wrap(&c.data.definition, 48).into_iter().take(3).enumerate() {
        s.text(
            &line,
            c.width as f32 / 2.0,
            475.0 + n as f32 * 27.0,
            18.0,
            "Liberation Serif",
            "normal",
            "middle",
            "#2b190b",
        );
    }
    s.text(
        &format!("REWARD: KNOWLEDGE · FILE {}", entry_number(&c.data.word)),
        c.width as f32 / 2.0,
        625.0,
        14.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#7d291b",
    );
    s.text(
        c.watermark,
        c.width as f32 / 2.0,
        700.0,
        11.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#2b190b",
    );
    s.finish()
}

fn field_journal(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#d5ccb2");
    for y in (105..730).step_by(35) {
        s.raw(format!(
            r##"<line x1="45" y1="{y}" x2="755" y2="{y}" stroke="#72805c" stroke-opacity=".3"/>"##
        ));
    }
    s.raw(r##"<line x1="105" y1="30" x2="105" y2="770" stroke="#9b5749" stroke-width="2"/><line x1="125" y1="30" x2="125" y2="770" stroke="#9b5749"/>"##);
    s.text(
        &format!("FIELD NOTE · {}", entry_number(&c.data.word)),
        145.0,
        70.0,
        12.0,
        "Liberation Mono",
        "normal",
        "start",
        "#72805c",
    );
    let size = fit_size(&c.data.word, c.width as f32 - 200.0, 64.0, 28.0);
    s.text(
        &c.data.word,
        145.0,
        180.0,
        size,
        "Liberation Serif",
        "bold",
        "start",
        "#2b3126",
    );
    s.text(
        &format!(
            "{}  /{}/",
            c.data.part_of_speech,
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        145.0,
        230.0,
        15.0,
        "Liberation Mono",
        "normal",
        "start",
        "#72805c",
    );
    s.text(
        "OBSERVATION",
        145.0,
        300.0,
        12.0,
        "Liberation Mono",
        "bold",
        "start",
        "#9b5749",
    );
    for (n, line) in wrap(&c.data.definition, 48).into_iter().take(4).enumerate() {
        s.text(
            &line,
            145.0,
            338.0 + n as f32 * 35.0,
            19.0,
            "Liberation Serif",
            "normal",
            "start",
            "#2b3126",
        );
    }
    s.text(
        "PROVENANCE",
        145.0,
        520.0,
        12.0,
        "Liberation Mono",
        "bold",
        "start",
        "#9b5749",
    );
    for (n, line) in wrap(
        c.data.etymology.as_deref().unwrap_or("Origin unrecorded."),
        52,
    )
    .into_iter()
    .take(3)
    .enumerate()
    {
        s.text(
            &line,
            145.0,
            558.0 + n as f32 * 30.0,
            16.0,
            "Liberation Serif",
            "normal",
            "start",
            "#2b3126",
        );
    }
    s.text(
        c.watermark,
        c.width as f32 - 55.0,
        c.height as f32 - 45.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#72805c",
    );
    s.finish()
}

fn qa_site(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#f5f5f5");
    s.raw(format!(r##"<rect width="{}" height="56" fill="#252525"/><rect x="55" y="85" width="{}" height="{}" fill="white" stroke="#d6d9dc"/>"##, c.width, c.width - 110, c.height - 140));
    s.text(
        "english.stackexchange",
        28.0,
        28.0,
        16.0,
        "Liberation Sans",
        "bold",
        "start",
        "#f5f5f5",
    );
    s.text(
        "Ask Question",
        c.width as f32 - 28.0,
        28.0,
        12.0,
        "Liberation Sans",
        "normal",
        "end",
        "#e57925",
    );
    s.raw(r##"<path d="M90 160l18-22 18 22M90 225l18 22 18-22" fill="none" stroke="#777" stroke-width="5"/>"##);
    s.text(
        "44",
        108.0,
        193.0,
        14.0,
        "Liberation Sans",
        "bold",
        "middle",
        "#777777",
    );
    s.text(
        &format!("What does “{}” mean?", c.data.word),
        155.0,
        130.0,
        fit_size(&c.data.word, c.width as f32 - 220.0, 28.0, 18.0),
        "Liberation Sans",
        "normal",
        "start",
        "#0074cc",
    );
    s.text(
        &format!(
            "I encountered the word /{}/ and would like its definition and origin.",
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        155.0,
        185.0,
        14.0,
        "Liberation Sans",
        "normal",
        "start",
        "#252525",
    );
    s.raw(format!(
        r##"<line x1="155" y1="225" x2="{}" y2="225" stroke="#d6d9dc"/>"##,
        c.width - 85
    ));
    s.text(
        "✓  Accepted answer",
        155.0,
        270.0,
        14.0,
        "Liberation Sans",
        "bold",
        "start",
        "#45a163",
    );
    for (n, line) in wrap(&c.data.definition, 55).into_iter().take(4).enumerate() {
        s.text(
            &line,
            155.0,
            310.0 + n as f32 * 27.0,
            17.0,
            "Liberation Sans",
            "normal",
            "start",
            "#252525",
        );
    }
    s.text(
        &format!(
            "origin: {}",
            c.data.origin_language.as_deref().unwrap_or("unknown")
        ),
        155.0,
        455.0,
        13.0,
        "Liberation Sans",
        "normal",
        "start",
        "#5f6a72",
    );
    s.text(
        c.watermark,
        c.width as f32 - 85.0,
        c.height as f32 - 85.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#5f6a72",
    );
    s.finish()
}

fn library_catalog(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#d9c59e");
    s.raw(format!(r##"<rect x="75" y="65" width="{}" height="{}" rx="8" fill="#ead9b5" stroke="#322619" stroke-width="4"/><rect x="285" y="88" width="230" height="55" fill="#d9c59e" stroke="#8e3c31" stroke-width="3"/>"##, c.width - 150, c.height - 130));
    s.text(
        "LIBRARY CATALOG",
        c.width as f32 / 2.0,
        115.0,
        14.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#322619",
    );
    s.raw(format!(
        r##"<line x1="100" y1="175" x2="{}" y2="175" stroke="#8e3c31" stroke-width="2"/>"##,
        c.width - 100
    ));
    let mut y = 215.0;
    for (label, value) in [
        ("HEADWORD", c.data.word.clone()),
        ("CLASS", c.data.part_of_speech.clone()),
        ("PRON.", c.data.ipa.as_deref().unwrap_or("—").into()),
        (
            "ORIGIN",
            c.data.origin_language.as_deref().unwrap_or("—").into(),
        ),
    ] {
        s.text(
            label,
            110.0,
            y,
            11.0,
            "Liberation Mono",
            "normal",
            "start",
            "#8e3c31",
        );
        s.text(
            &value,
            225.0,
            y,
            if label == "HEADWORD" { 30.0 } else { 15.0 },
            if label == "HEADWORD" {
                "Liberation Serif"
            } else {
                "Liberation Sans"
            },
            if label == "HEADWORD" {
                "bold"
            } else {
                "normal"
            },
            "start",
            "#322619",
        );
        y += if label == "HEADWORD" { 62.0 } else { 42.0 };
    }
    s.text(
        "SCOPE NOTE",
        110.0,
        y + 5.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#8e3c31",
    );
    for (n, line) in wrap(&c.data.definition, 46).into_iter().take(3).enumerate() {
        s.text(
            &line,
            225.0,
            y + 5.0 + n as f32 * 25.0,
            16.0,
            "Liberation Serif",
            "normal",
            "start",
            "#322619",
        );
    }
    s.text(
        &format!("CARD {}", entry_number(&c.data.word)),
        110.0,
        c.height as f32 - 105.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#8e3c31",
    );
    s.text(
        c.watermark,
        c.width as f32 - 110.0,
        c.height as f32 - 105.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#322619",
    );
    s.finish()
}

fn pull_request(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#0d1117");
    s.raw(format!(r##"<rect width="{}" height="52" fill="#161b22"/><line x1="0" y1="52" x2="{}" y2="52" stroke="#30363d"/><rect x="38" y="86" width="112" height="34" rx="17" fill="#238636"/>"##, c.width, c.width));
    s.text(
        "◉  english-word-bot / words",
        24.0,
        26.0,
        13.0,
        "Liberation Sans",
        "bold",
        "start",
        "#c9d1d9",
    );
    s.text(
        "Open",
        94.0,
        103.0,
        14.0,
        "Liberation Sans",
        "bold",
        "middle",
        "white",
    );
    s.text(
        &format!("Add “{}” #{}", c.data.word, entry_number(&c.data.word)),
        38.0,
        155.0,
        fit_size(&c.data.word, c.width as f32 - 76.0, 28.0, 18.0),
        "Liberation Sans",
        "normal",
        "start",
        "#c9d1d9",
    );
    s.text(
        "englishwordbot wants to merge 1 commit into main",
        38.0,
        195.0,
        13.0,
        "Liberation Sans",
        "normal",
        "start",
        "#8b949e",
    );
    s.raw(format!(
        r##"<line x1="38" y1="225" x2="{}" y2="225" stroke="#30363d"/>"##,
        c.width - 38
    ));
    s.text(
        "Conversation",
        38.0,
        260.0,
        13.0,
        "Liberation Sans",
        "bold",
        "start",
        "#c9d1d9",
    );
    s.text(
        "Commits  1",
        180.0,
        260.0,
        13.0,
        "Liberation Sans",
        "normal",
        "start",
        "#8b949e",
    );
    s.text(
        "Checks  ✓",
        290.0,
        260.0,
        13.0,
        "Liberation Sans",
        "normal",
        "start",
        "#8b949e",
    );
    s.raw(format!(r##"<rect x="38" y="300" width="{}" height="230" rx="6" fill="#0d1117" stroke="#30363d"/><rect x="38" y="300" width="{}" height="45" rx="6" fill="#161b22"/>"##, c.width - 76, c.width - 76));
    s.text(
        "englishwordbot commented",
        58.0,
        323.0,
        12.0,
        "Liberation Sans",
        "bold",
        "start",
        "#c9d1d9",
    );
    s.text(
        &format!(
            "{}  /{}/",
            c.data.word,
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        58.0,
        382.0,
        24.0,
        "Liberation Sans",
        "bold",
        "start",
        "#c9d1d9",
    );
    for (n, line) in wrap(&c.data.definition, 62).into_iter().take(3).enumerate() {
        s.text(
            &line,
            58.0,
            425.0 + n as f32 * 26.0,
            15.0,
            "Liberation Sans",
            "normal",
            "start",
            "#c9d1d9",
        );
    }
    s.raw(format!(
        r##"<rect x="38" y="565" width="{}" height="65" rx="6" fill="#12261e" stroke="#238636"/>"##,
        c.width - 76
    ));
    s.text(
        "✓  All checks have passed",
        60.0,
        597.0,
        15.0,
        "Liberation Sans",
        "bold",
        "start",
        "#3fb950",
    );
    s.text(
        c.watermark,
        c.width as f32 - 38.0,
        c.height as f32 - 35.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#8b949e",
    );
    s.finish()
}

fn lab_report(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#e7edf0");
    s.raw(format!(r##"<rect x="62" y="42" width="{}" height="{}" fill="#f9fbfc" stroke="#17252c" stroke-width="2"/><line x1="62" y1="145" x2="{}" y2="145" stroke="#2486a3" stroke-width="3"/>"##, c.width - 124, c.height - 84, c.width - 62));
    s.text(
        "LEXICAL ANALYSIS LABORATORY",
        84.0,
        72.0,
        14.0,
        "Liberation Mono",
        "bold",
        "start",
        "#17252c",
    );
    s.text(
        &format!("REPORT {}", entry_number(&c.data.word)),
        c.width as f32 - 84.0,
        72.0,
        12.0,
        "Liberation Mono",
        "normal",
        "end",
        "#2486a3",
    );
    s.text(
        "SPECIMEN IDENTIFICATION",
        84.0,
        118.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#2486a3",
    );
    let size = fit_size(&c.data.word, c.width as f32 - 168.0, 55.0, 25.0);
    s.text(
        &c.data.word,
        84.0,
        205.0,
        size,
        "Liberation Serif",
        "bold",
        "start",
        "#17252c",
    );
    s.text(
        &format!(
            "{} · /{}/",
            c.data.part_of_speech,
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        84.0,
        250.0,
        14.0,
        "Liberation Mono",
        "normal",
        "start",
        "#2486a3",
    );
    let mut y = 310.0;
    for (heading, body) in [
        ("OBSERVATION", c.data.definition.as_str()),
        (
            "PROVENANCE",
            c.data
                .etymology
                .as_deref()
                .unwrap_or("No etymology recorded."),
        ),
    ] {
        s.text(
            heading,
            84.0,
            y,
            11.0,
            "Liberation Mono",
            "bold",
            "start",
            "#2486a3",
        );
        y += 33.0;
        for line in wrap(body, 55).into_iter().take(3) {
            s.text(
                &line,
                84.0,
                y,
                16.0,
                "Liberation Serif",
                "normal",
                "start",
                "#17252c",
            );
            y += 26.0;
        }
        y += 26.0;
    }
    s.raw(r##"<path d="M590 82h38v45l48 82a28 28 0 01-24 42h-86a28 28 0 01-24-42l48-82V82Z" fill="none" stroke="#2486a3" stroke-width="3"/>"##);
    s.text(
        "STATUS: VERIFIED",
        84.0,
        c.height as f32 - 82.0,
        12.0,
        "Liberation Mono",
        "bold",
        "start",
        "#2486a3",
    );
    s.text(
        c.watermark,
        c.width as f32 - 84.0,
        c.height as f32 - 82.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#17252c",
    );
    s.finish()
}

fn vocabulary_certificate(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#f4ead0");
    s.raw(format!(r##"<rect x="32" y="32" width="{}" height="{}" fill="none" stroke="#9e773a" stroke-width="5"/><rect x="50" y="50" width="{}" height="{}" fill="none" stroke="#342719"/>"##, c.width - 64, c.height - 64, c.width - 100, c.height - 100));
    s.text(
        "CERTIFICATE OF VOCABULARY",
        c.width as f32 / 2.0,
        105.0,
        20.0,
        "Liberation Serif",
        "bold",
        "middle",
        "#342719",
    );
    s.text(
        "THIS CERTIFIES THAT THE WORD",
        c.width as f32 / 2.0,
        175.0,
        11.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#9e773a",
    );
    s.text(
        &c.data.word,
        c.width as f32 / 2.0,
        285.0,
        fit_size(&c.data.word, c.width as f32 - 150.0, 72.0, 32.0),
        "Liberation Serif",
        "normal",
        "middle",
        "#342719",
    );
    s.raw(format!(
        r##"<line x1="110" y1="330" x2="{}" y2="330" stroke="#9e773a"/>"##,
        c.width - 110
    ));
    s.text(
        &format!(
            "has been duly recognized as a {} of the English language",
            c.data.part_of_speech
        ),
        c.width as f32 / 2.0,
        375.0,
        15.0,
        "Liberation Serif",
        "normal",
        "middle",
        "#342719",
    );
    for (n, line) in wrap(&c.data.definition, 52).into_iter().take(3).enumerate() {
        s.text(
            &line,
            c.width as f32 / 2.0,
            430.0 + n as f32 * 27.0,
            17.0,
            "Liberation Serif",
            "normal",
            "middle",
            "#342719",
        );
    }
    s.raw(r##"<circle cx="400" cy="625" r="55" fill="none" stroke="#9e773a" stroke-width="7"/><circle cx="400" cy="625" r="42" fill="none" stroke="#9e773a"/><path d="M370 665l-18 70 48-27 48 27-18-70" fill="#9e773a"/>"##);
    s.text(
        "EWB",
        400.0,
        625.0,
        15.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#342719",
    );
    s.text(
        &format!("No. {}", entry_number(&c.data.word)),
        82.0,
        700.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#9e773a",
    );
    s.text(
        c.watermark,
        c.width as f32 - 82.0,
        700.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#342719",
    );
    s.finish()
}

fn encyclopedia_entry(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#f3f0e7");
    s.text(
        "THE CONCISE ENCYCLOPEDIA OF WORDS",
        64.0,
        62.0,
        13.0,
        "Liberation Mono",
        "normal",
        "start",
        "#8a2020",
    );
    s.text(
        &format!("VOL. E · {}", entry_number(&c.data.word)),
        c.width as f32 - 64.0,
        62.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#686158",
    );
    s.raw(format!(
        r##"<line x1="64" y1="86" x2="{}" y2="86" stroke="#8a2020" stroke-width="2"/>"##,
        c.width - 64
    ));
    s.text(
        &c.data.word,
        64.0,
        155.0,
        fit_size(&c.data.word, c.width as f32 - 128.0, 52.0, 25.0),
        "Liberation Serif",
        "bold",
        "start",
        "#282520",
    );
    s.text(
        &format!(
            "{}  /{}/",
            c.data.part_of_speech,
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        64.0,
        200.0,
        14.0,
        "Liberation Serif",
        "normal",
        "start",
        "#8a2020",
    );
    s.raw(r##"<line x1="510" y1="225" x2="510" y2="620" stroke="#b9b2a5"/><rect x="535" y="235" width="185" height="190" fill="#e5dfd2" stroke="#8a2020"/>"##);
    s.text(
        &c.data
            .word
            .chars()
            .next()
            .unwrap_or('A')
            .to_uppercase()
            .to_string(),
        627.0,
        330.0,
        105.0,
        "Liberation Serif",
        "bold",
        "middle",
        "#8a2020",
    );
    let mut y = 255.0;
    for line in wrap(&c.data.definition, 43).into_iter().take(7) {
        s.text(
            &line,
            64.0,
            y,
            17.0,
            "Liberation Serif",
            "normal",
            "start",
            "#282520",
        );
        y += 27.0;
    }
    s.text(
        "ETYMOLOGY",
        64.0,
        490.0,
        11.0,
        "Liberation Mono",
        "bold",
        "start",
        "#8a2020",
    );
    for (n, line) in wrap(
        c.data
            .etymology
            .as_deref()
            .unwrap_or("Origin not recorded."),
        43,
    )
    .into_iter()
    .take(4)
    .enumerate()
    {
        s.text(
            &line,
            64.0,
            525.0 + n as f32 * 24.0,
            14.0,
            "Liberation Serif",
            "normal",
            "start",
            "#4d4841",
        );
    }
    s.raw(format!(
        r##"<line x1="64" y1="655" x2="{}" y2="655" stroke="#8a2020"/>"##,
        c.width - 64
    ));
    s.text(
        c.watermark,
        c.width as f32 - 64.0,
        690.0,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#686158",
    );
    s.finish()
}

fn police_lineup(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#e7e7df");
    for (index, y) in (170..=670).step_by(100).enumerate() {
        s.raw(format!(r##"<line x1="38" y1="{y}" x2="762" y2="{y}" stroke="#171717" stroke-width="2"/><text x="48" y="{}" font-family="Liberation Mono" font-size="10" fill="#275a84">{}′</text>"##, y - 7, index + 2));
    }
    s.text(
        "LEXICAL IDENTIFICATION UNIT",
        44.0,
        62.0,
        14.0,
        "Liberation Mono",
        "bold",
        "start",
        "#275a84",
    );
    s.text(
        &format!("CASE {}", entry_number(&c.data.word)),
        c.width as f32 - 44.0,
        62.0,
        12.0,
        "Liberation Mono",
        "normal",
        "end",
        "#275a84",
    );
    s.text(
        &c.data.word.to_uppercase(),
        c.width as f32 / 2.0,
        330.0,
        fit_size(&c.data.word, c.width as f32 - 150.0, 74.0, 32.0),
        "Liberation Sans",
        "bold",
        "middle",
        "#171717",
    );
    s.text(
        &format!(
            "AKA: {} · /{}/",
            c.data.part_of_speech.to_uppercase(),
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        c.width as f32 / 2.0,
        390.0,
        14.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#275a84",
    );
    for (n, line) in wrap(&c.data.definition, 50).into_iter().take(3).enumerate() {
        s.text(
            &line,
            c.width as f32 / 2.0,
            470.0 + n as f32 * 27.0,
            17.0,
            "Liberation Serif",
            "normal",
            "middle",
            "#171717",
        );
    }
    s.raw(r##"<rect x="250" y="610" width="300" height="70" fill="#171717"/>"##);
    s.text(
        &format!("{}  ·  EWB", entry_number(&c.data.word)),
        400.0,
        645.0,
        18.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#e7e7df",
    );
    s.text(
        c.watermark,
        c.width as f32 - 44.0,
        730.0,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#275a84",
    );
    s.finish()
}

fn recipe_card(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#f3e7d1");
    s.raw(format!(r##"<rect x="55" y="75" width="{}" height="{}" rx="10" fill="#fff8ea" stroke="#493428" stroke-width="3"/><line x1="55" y1="175" x2="{}" y2="175" stroke="#b55236" stroke-width="3"/><line x1="220" y1="175" x2="220" y2="{}" stroke="#b55236"/>"##, c.width - 110, c.height - 150, c.width - 55, c.height - 75));
    s.text(
        "RECIPE FOR A WORD",
        80.0,
        112.0,
        18.0,
        "Liberation Serif",
        "bold",
        "start",
        "#493428",
    );
    s.text(
        &format!("SERVES {} LETTERS", c.data.word.chars().count()),
        c.width as f32 - 80.0,
        112.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#b55236",
    );
    s.text(
        "INGREDIENTS",
        80.0,
        210.0,
        11.0,
        "Liberation Mono",
        "bold",
        "start",
        "#b55236",
    );
    for (n, segment) in split_morphemes(&c.data.word).iter().enumerate() {
        s.text(
            &format!("{}× {segment}", n + 1),
            80.0,
            250.0 + n as f32 * 32.0,
            15.0,
            "Liberation Serif",
            "normal",
            "start",
            "#493428",
        );
    }
    s.text(
        &c.data.word,
        250.0,
        235.0,
        fit_size(&c.data.word, c.width as f32 - 330.0, 48.0, 22.0),
        "Liberation Serif",
        "bold",
        "start",
        "#493428",
    );
    s.text(
        &format!(
            "{} · /{}/",
            c.data.part_of_speech,
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        250.0,
        280.0,
        13.0,
        "Liberation Mono",
        "normal",
        "start",
        "#b55236",
    );
    s.text(
        "METHOD",
        250.0,
        335.0,
        11.0,
        "Liberation Mono",
        "bold",
        "start",
        "#b55236",
    );
    for (n, line) in wrap(&c.data.definition, 39).into_iter().take(5).enumerate() {
        s.text(
            &line,
            250.0,
            375.0 + n as f32 * 28.0,
            16.0,
            "Liberation Serif",
            "normal",
            "start",
            "#493428",
        );
    }
    s.text(
        &format!(
            "ORIGIN: {}",
            c.data.origin_language.as_deref().unwrap_or("chef's secret")
        ),
        250.0,
        565.0,
        12.0,
        "Liberation Mono",
        "normal",
        "start",
        "#b55236",
    );
    s.text(
        c.watermark,
        c.width as f32 - 80.0,
        c.height as f32 - 105.0,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#493428",
    );
    s.finish()
}

fn subway_map(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#181818");
    s.raw(format!(r##"<rect x="28" y="24" width="170" height="24" fill="#f6c36b"/><line x1="28" y1="56" x2="{}" y2="56" stroke="#444"/>"##, c.width - 28));
    s.text(
        "> LEXICON LINE",
        44.0,
        36.0,
        13.0,
        "Liberation Sans",
        "bold",
        "start",
        "#181818",
    );
    s.text(
        &chrono::Utc::now().format("%Y·%m·%d").to_string(),
        c.width as f32 - 28.0,
        36.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#777777",
    );
    s.text(
        "NOW ARRIVING AT",
        28.0,
        84.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#f6c36b",
    );
    s.text(
        &c.data.word,
        28.0,
        116.0,
        fit_size(&c.data.word, c.width as f32 - 56.0, 38.0, 20.0),
        "Liberation Sans",
        "bold",
        "start",
        "#f5f1e8",
    );
    s.text(
        &format!(
            "/{}/ · {}",
            c.data.ipa.as_deref().unwrap_or("—"),
            c.data.part_of_speech
        ),
        28.0,
        151.0,
        12.0,
        "Liberation Mono",
        "normal",
        "start",
        "#aaa",
    );
    let y = 204.0;
    s.raw(format!(r##"<line x1="58" y1="{y}" x2="{}" y2="{y}" stroke="#f6c36b" stroke-width="4"/><circle cx="58" cy="{y}" r="10" fill="#666"/><circle cx="{}" cy="{y}" r="12" fill="#f6c36b" stroke="#eee" stroke-width="2"/>"##, c.width - 58, c.width - 58));
    s.text(
        &c.data
            .origin_language
            .as_deref()
            .unwrap_or("UNKNOWN")
            .to_uppercase(),
        38.0,
        235.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#777",
    );
    s.text(
        "ENGLISH · TODAY · HERE",
        c.width as f32 - 38.0,
        235.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#f6c36b",
    );
    s.raw(format!(r##"<rect x="28" y="270" width="{}" height="100" fill="#2d2923"/><rect x="28" y="270" width="3" height="100" fill="#f6c36b"/>"##, c.width - 56));
    for (n, line) in wrap(&c.data.definition, 58).into_iter().take(3).enumerate() {
        s.text(
            &line,
            48.0,
            307.0 + n as f32 * 23.0,
            15.0,
            "Liberation Sans",
            "bold",
            "start",
            "#f5f1e8",
        );
    }
    s.text(
        "NEXT STOP: TBD",
        28.0,
        c.height as f32 - 34.0,
        10.0,
        "Liberation Mono",
        "normal",
        "start",
        "#777",
    );
    s.text(
        &format!(
            "{} · NO.{}",
            c.watermark.trim_start_matches('@'),
            entry_number(&c.data.word)
        ),
        c.width as f32 - 28.0,
        c.height as f32 - 34.0,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#777",
    );
    s.finish()
}

fn patent_filing(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#e9e5da");
    s.raw(format!(r##"<rect x="52" y="42" width="{}" height="{}" fill="none" stroke="#202020" stroke-width="2"/><rect x="620" y="65" width="90" height="55" fill="none" stroke="#365d76" stroke-width="3"/>"##, c.width - 104, c.height - 84));
    s.text(
        "UNITED STATES LEXICAL PATENT",
        76.0,
        78.0,
        14.0,
        "Liberation Mono",
        "bold",
        "start",
        "#202020",
    );
    s.text(
        "FIG. 1",
        665.0,
        92.0,
        13.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#365d76",
    );
    s.raw(format!(
        r##"<line x1="76" y1="142" x2="{}" y2="142" stroke="#365d76"/>"##,
        c.width - 76
    ));
    s.text(
        &format!("PATENT NO. EWB-{}", entry_number(&c.data.word)),
        76.0,
        175.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#365d76",
    );
    s.text(
        &c.data.word,
        76.0,
        240.0,
        fit_size(&c.data.word, c.width as f32 - 152.0, 58.0, 26.0),
        "Liberation Serif",
        "bold",
        "start",
        "#202020",
    );
    s.text(
        &format!(
            "A {} PRONOUNCED /{}/",
            c.data.part_of_speech.to_uppercase(),
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        76.0,
        290.0,
        13.0,
        "Liberation Mono",
        "normal",
        "start",
        "#365d76",
    );
    s.text(
        "ABSTRACT",
        76.0,
        355.0,
        12.0,
        "Liberation Mono",
        "bold",
        "start",
        "#365d76",
    );
    for (n, line) in wrap(&c.data.definition, 56).into_iter().take(4).enumerate() {
        s.text(
            &line,
            76.0,
            392.0 + n as f32 * 27.0,
            16.0,
            "Liberation Serif",
            "normal",
            "start",
            "#202020",
        );
    }
    s.text(
        "CLAIMS",
        76.0,
        525.0,
        12.0,
        "Liberation Mono",
        "bold",
        "start",
        "#365d76",
    );
    s.text(
        &format!(
            "1. A word originating in {}.",
            c.data
                .origin_language
                .as_deref()
                .unwrap_or("an unspecified language")
        ),
        76.0,
        560.0,
        15.0,
        "Liberation Serif",
        "normal",
        "start",
        "#202020",
    );
    s.text(
        "2. The meaning substantially as described above.",
        76.0,
        590.0,
        15.0,
        "Liberation Serif",
        "normal",
        "start",
        "#202020",
    );
    s.text(
        c.watermark,
        c.width as f32 - 76.0,
        c.height as f32 - 68.0,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#365d76",
    );
    s.finish()
}

fn wikipedia_infobox(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#f8f8f8");
    s.text(
        "WIKIPEDIA",
        42.0,
        44.0,
        24.0,
        "Liberation Serif",
        "bold",
        "start",
        "#202122",
    );
    s.text(
        "The Free Encyclopedia",
        42.0,
        67.0,
        10.0,
        "Liberation Sans",
        "normal",
        "start",
        "#54595d",
    );
    s.raw(format!(
        r##"<line x1="42" y1="90" x2="{}" y2="90" stroke="#a2a9b1"/>"##,
        c.width - 42
    ));
    s.text(
        &c.data.word,
        42.0,
        135.0,
        fit_size(&c.data.word, 395.0, 42.0, 22.0),
        "Liberation Serif",
        "normal",
        "start",
        "#202122",
    );
    let box_x = 470.0;
    s.raw(format!(r##"<rect x="{box_x}" y="120" width="280" height="450" fill="#f8f9fa" stroke="#a2a9b1"/><rect x="480" y="132" width="260" height="45" fill="#eaecf0"/>"##));
    s.text(
        &c.data.word,
        610.0,
        154.0,
        18.0,
        "Liberation Sans",
        "bold",
        "middle",
        "#202122",
    );
    s.raw(r##"<rect x="495" y="195" width="230" height="155" fill="#eaecf0"/>"##);
    s.text(
        &c.data
            .word
            .chars()
            .next()
            .unwrap_or('W')
            .to_uppercase()
            .to_string(),
        610.0,
        273.0,
        90.0,
        "Liberation Serif",
        "bold",
        "middle",
        "#3366cc",
    );
    let mut y = 380.0;
    for (label, value) in [
        ("Part of speech", c.data.part_of_speech.as_str()),
        ("Pronunciation", c.data.ipa.as_deref().unwrap_or("—")),
        ("Origin", c.data.origin_language.as_deref().unwrap_or("—")),
        ("Entry", "English lexicon"),
    ] {
        s.text(
            label,
            490.0,
            y,
            11.0,
            "Liberation Sans",
            "bold",
            "start",
            "#202122",
        );
        s.text(
            value,
            615.0,
            y,
            11.0,
            "Liberation Sans",
            "normal",
            "start",
            "#202122",
        );
        y += 38.0;
    }
    let mut body_y = 205.0;
    for line in wrap(&c.data.definition, 47).into_iter().take(8) {
        s.text(
            &line,
            42.0,
            body_y,
            16.0,
            "Liberation Serif",
            "normal",
            "start",
            "#202122",
        );
        body_y += 27.0;
    }
    s.text(
        "Etymology",
        42.0,
        455.0,
        27.0,
        "Liberation Serif",
        "normal",
        "start",
        "#202122",
    );
    s.raw(r##"<line x1="42" y1="476" x2="445" y2="476" stroke="#a2a9b1"/>"##);
    for (n, line) in wrap(
        c.data
            .etymology
            .as_deref()
            .unwrap_or("No etymology is available."),
        47,
    )
    .into_iter()
    .take(5)
    .enumerate()
    {
        s.text(
            &line,
            42.0,
            510.0 + n as f32 * 24.0,
            14.0,
            "Liberation Serif",
            "normal",
            "start",
            "#202122",
        );
    }
    s.text(
        c.watermark,
        c.width as f32 - 42.0,
        c.height as f32 - 35.0,
        10.0,
        "Liberation Sans",
        "normal",
        "end",
        "#54595d",
    );
    s.finish()
}

fn postcard(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#dce9ed");
    s.raw(format!(r##"<rect x="38" y="95" width="{}" height="{}" fill="#f8f1df" stroke="#27353b" stroke-width="3"/><line x1="430" y1="125" x2="430" y2="{}" stroke="#d55448" stroke-width="2"/>"##, c.width - 76, c.height - 190, c.height - 125));
    s.text(
        "GREETINGS FROM THE LEXICON",
        68.0,
        140.0,
        14.0,
        "Liberation Mono",
        "bold",
        "start",
        "#d55448",
    );
    s.text(
        &c.data.word,
        68.0,
        225.0,
        fit_size(&c.data.word, 325.0, 52.0, 24.0),
        "Liberation Serif",
        "bold",
        "start",
        "#27353b",
    );
    s.text(
        &format!(
            "{} · /{}/",
            c.data.part_of_speech,
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        68.0,
        270.0,
        13.0,
        "Liberation Mono",
        "normal",
        "start",
        "#d55448",
    );
    for (n, line) in wrap(&c.data.definition, 34).into_iter().take(5).enumerate() {
        s.text(
            &line,
            68.0,
            330.0 + n as f32 * 28.0,
            17.0,
            "Liberation Serif",
            "normal",
            "start",
            "#27353b",
        );
    }
    s.raw(r##"<rect x="625" y="135" width="78" height="96" fill="none" stroke="#d55448" stroke-width="5"/>"##);
    s.text(
        "EWB",
        664.0,
        183.0,
        17.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#d55448",
    );
    s.text(
        "TO:",
        468.0,
        305.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#d55448",
    );
    s.text(
        "THE ENGLISH LANGUAGE",
        500.0,
        355.0,
        15.0,
        "Liberation Mono",
        "normal",
        "start",
        "#27353b",
    );
    s.raw(r##"<line x1="470" y1="385" x2="710" y2="385" stroke="#d55448"/><line x1="470" y1="430" x2="710" y2="430" stroke="#d55448"/><line x1="470" y1="475" x2="710" y2="475" stroke="#d55448"/>"##);
    s.text(
        &c.data
            .origin_language
            .as_deref()
            .unwrap_or("ORIGIN UNKNOWN")
            .to_uppercase(),
        470.0,
        460.0,
        12.0,
        "Liberation Mono",
        "normal",
        "start",
        "#27353b",
    );
    s.text(
        c.watermark,
        c.width as f32 - 68.0,
        c.height as f32 - 125.0,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#d55448",
    );
    s.finish()
}

fn polaroid(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#b9b6af");
    s.raw(r##"<g transform="rotate(-3 400 400)"><rect x="130" y="55" width="540" height="690" fill="rgba(0,0,0,.22)" transform="translate(9 10)"/><rect x="130" y="55" width="540" height="690" fill="#f4f1e9"/><rect x="168" y="95" width="464" height="445" fill="#2d3740"/>"##);
    s.text(
        &c.data.word,
        400.0,
        270.0,
        fit_size(&c.data.word, 410.0, 58.0, 25.0),
        "Liberation Serif",
        "bold",
        "middle",
        "#f4f1e9",
    );
    s.text(
        &format!("/{}/", c.data.ipa.as_deref().unwrap_or("—")),
        400.0,
        325.0,
        15.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#d55448",
    );
    for (n, line) in wrap(&c.data.definition, 39).into_iter().take(3).enumerate() {
        s.text(
            &line,
            400.0,
            385.0 + n as f32 * 25.0,
            15.0,
            "Liberation Serif",
            "normal",
            "middle",
            "#f4f1e9",
        );
    }
    s.text(
        &format!(
            "{} · {} · {}",
            c.data.word,
            c.data.part_of_speech,
            chrono::Utc::now().format("%Y")
        ),
        175.0,
        595.0,
        17.0,
        "Liberation Serif",
        "normal",
        "start",
        "#272727",
    );
    s.text(
        c.watermark,
        625.0,
        690.0,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#777",
    );
    s.raw("</g>");
    s.finish()
}

fn cryptic_crossword(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#f0eee4");
    let cell = 52.0;
    let start_x = 62.0;
    let start_y = 70.0;
    for row in 0..10 {
        for col in 0..10 {
            let x = start_x + col as f32 * cell;
            let y = start_y + row as f32 * cell;
            let black = (row * 7 + col * 3 + hash(&c.data.word) as usize).is_multiple_of(11);
            s.raw(format!(r##"<rect x="{x}" y="{y}" width="{cell}" height="{cell}" fill="{}" stroke="#111"/>"##, if black { "#111" } else { "#fffdf5" }));
        }
    }
    s.text(
        "CRYPTIC LEXICON",
        610.0,
        95.0,
        15.0,
        "Liberation Mono",
        "bold",
        "start",
        "#111",
    );
    s.text(
        &format!("CLUE {}", entry_number(&c.data.word)),
        610.0,
        130.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#777",
    );
    s.text(
        &format!("{} letters", c.data.word.chars().count()),
        610.0,
        175.0,
        13.0,
        "Liberation Sans",
        "bold",
        "start",
        "#111",
    );
    for (n, line) in wrap(&c.data.definition, 20).into_iter().take(7).enumerate() {
        s.text(
            &line,
            610.0,
            220.0 + n as f32 * 24.0,
            14.0,
            "Liberation Serif",
            "normal",
            "start",
            "#111",
        );
    }
    let answer = c.data.word.to_uppercase();
    s.text(
        &answer,
        400.0,
        635.0,
        fit_size(&answer, 670.0, 42.0, 22.0),
        "Liberation Mono",
        "bold",
        "middle",
        "#111",
    );
    s.text(
        c.watermark,
        c.width as f32 - 60.0,
        715.0,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#777",
    );
    s.finish()
}

fn vhs_title_card(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#16111c");
    for offset in [0.0, 8.0, 16.0] {
        s.raw(format!(
            r##"<path d="M0 {}H800M0 {}H800" stroke="#f04bc0" stroke-width="3" opacity="{}"/>"##,
            86.0 + offset,
            690.0 + offset,
            0.85 - offset / 30.0
        ));
    }
    s.raw(r##"<rect x="74" y="145" width="652" height="465" fill="#0c0910" stroke="#f04bc0" stroke-width="2"/>"##);
    s.text(
        "PLAY ▶",
        100.0,
        180.0,
        14.0,
        "Liberation Mono",
        "normal",
        "start",
        "#f2ebf4",
    );
    s.text(
        "SP",
        700.0,
        180.0,
        14.0,
        "Liberation Mono",
        "normal",
        "end",
        "#f2ebf4",
    );
    s.text(
        &c.data.word.to_uppercase(),
        400.0,
        315.0,
        fit_size(&c.data.word, 560.0, 70.0, 30.0),
        "Liberation Sans",
        "bold",
        "middle",
        "#f2ebf4",
    );
    s.text(
        &format!(
            "{}  /{}/",
            c.data.part_of_speech.to_uppercase(),
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        400.0,
        375.0,
        14.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#f04bc0",
    );
    for (n, line) in wrap(&c.data.definition, 46).into_iter().take(3).enumerate() {
        s.text(
            &line,
            400.0,
            440.0 + n as f32 * 27.0,
            17.0,
            "Liberation Serif",
            "normal",
            "middle",
            "#f2ebf4",
        );
    }
    s.text(
        &format!("{} 14:20:07", chrono::Utc::now().format("%Y-%m-%d")),
        100.0,
        570.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#777",
    );
    s.text(
        c.watermark,
        c.width as f32 - 74.0,
        745.0,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#f04bc0",
    );
    s.finish()
}

fn sticky_note_pile(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#eee8dc");
    s.raw(r##"<g transform="rotate(5 400 400)"><rect x="155" y="120" width="510" height="510" fill="#e9a7b3"/></g><g transform="rotate(-4 400 400)"><rect x="105" y="155" width="520" height="520" fill="#9cc9c0"/></g><g transform="rotate(1.5 400 400)"><rect x="135" y="115" width="530" height="540" fill="#f4d35e"/><path d="M565 115h100v100Z" fill="#d8ae2d"/></g>"##);
    s.text(
        &format!("note #{}", entry_number(&c.data.word)),
        180.0,
        165.0,
        12.0,
        "Liberation Mono",
        "normal",
        "start",
        "#78651f",
    );
    s.text(
        &c.data.word,
        180.0,
        270.0,
        fit_size(&c.data.word, 440.0, 60.0, 27.0),
        "Liberation Serif",
        "bold",
        "start",
        "#28251f",
    );
    s.text(
        &format!(
            "{} · /{}/",
            c.data.part_of_speech,
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        180.0,
        315.0,
        14.0,
        "Liberation Mono",
        "normal",
        "start",
        "#78651f",
    );
    for (n, line) in wrap(&c.data.definition, 40).into_iter().take(5).enumerate() {
        s.text(
            &line,
            180.0,
            375.0 + n as f32 * 29.0,
            18.0,
            "Liberation Serif",
            "normal",
            "start",
            "#28251f",
        );
    }
    s.text(
        &chrono::Utc::now().format("%Y-%m-%d").to_string(),
        180.0,
        590.0,
        12.0,
        "Liberation Serif",
        "normal",
        "start",
        "#78651f",
    );
    s.text(
        c.watermark,
        620.0,
        610.0,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#78651f",
    );
    s.finish()
}

fn telegram(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#d8d0b9");
    s.raw(format!(r##"<rect x="45" y="65" width="{}" height="{}" fill="#e9e2cc" stroke="#29251c" stroke-width="4"/><line x1="68" y1="145" x2="{}" y2="145" stroke="#9c3431" stroke-width="2" stroke-dasharray="12 7"/>"##, c.width - 90, c.height - 130, c.width - 68));
    s.text(
        "TELEGRAM",
        c.width as f32 / 2.0,
        108.0,
        31.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#29251c",
    );
    s.text(
        &format!(
            "NO {} · FILED {} · 14:20",
            entry_number(&c.data.word),
            chrono::Utc::now().format("%Y·%m·%d")
        ),
        68.0,
        175.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#9c3431",
    );
    s.text(
        "TO: THE ENGLISH-SPEAKING PUBLIC",
        68.0,
        220.0,
        13.0,
        "Liberation Mono",
        "bold",
        "start",
        "#29251c",
    );
    s.text(
        "STOP",
        c.width as f32 - 68.0,
        220.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#9c3431",
    );
    s.text(
        &c.data.word.to_uppercase(),
        68.0,
        305.0,
        fit_size(&c.data.word, c.width as f32 - 136.0, 58.0, 26.0),
        "Liberation Mono",
        "bold",
        "start",
        "#29251c",
    );
    s.text(
        &format!(
            "{} /{}/ STOP",
            c.data.part_of_speech.to_uppercase(),
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        68.0,
        355.0,
        14.0,
        "Liberation Mono",
        "normal",
        "start",
        "#9c3431",
    );
    let message = format!(
        "{} STOP ORIGIN {} STOP",
        c.data.definition.to_uppercase(),
        c.data
            .origin_language
            .as_deref()
            .unwrap_or("UNKNOWN")
            .to_uppercase()
    );
    for (n, line) in wrap(&message, 55).into_iter().take(6).enumerate() {
        s.text(
            &line,
            68.0,
            420.0 + n as f32 * 29.0,
            16.0,
            "Liberation Mono",
            "normal",
            "start",
            "#29251c",
        );
    }
    s.raw(format!(
        r##"<line x1="68" y1="650" x2="{}" y2="650" stroke="#9c3431" stroke-dasharray="12 7"/>"##,
        c.width - 68
    ));
    s.text(
        c.watermark,
        c.width as f32 - 68.0,
        690.0,
        11.0,
        "Liberation Mono",
        "normal",
        "end",
        "#29251c",
    );
    s.finish()
}

fn postage_stamp(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#b95045");
    let mut perforations = String::new();
    for p in (70..=730).step_by(28) {
        let _ = write!(
            perforations,
            r##"<circle cx="{p}" cy="55" r="9" fill="#f5e7cf"/><circle cx="{p}" cy="745" r="9" fill="#f5e7cf"/><circle cx="55" cy="{p}" r="9" fill="#f5e7cf"/><circle cx="745" cy="{p}" r="9" fill="#f5e7cf"/>"##
        );
    }
    s.raw(perforations);
    s.raw(r##"<rect x="72" y="72" width="656" height="656" fill="#b95045" stroke="#fff5df" stroke-width="4"/><circle cx="400" cy="390" r="235" fill="none" stroke="#fff5df" stroke-width="6"/><circle cx="400" cy="390" r="210" fill="none" stroke="#54211d" stroke-width="2"/>"##);
    s.text(
        "ENGLISH LEXICON POST",
        400.0,
        145.0,
        14.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#fff5df",
    );
    s.text(
        &c.data.word.to_uppercase(),
        400.0,
        345.0,
        fit_size(&c.data.word, 390.0, 55.0, 24.0),
        "Liberation Serif",
        "bold",
        "middle",
        "#fff5df",
    );
    s.text(
        &format!(
            "{} · /{}/",
            c.data.part_of_speech.to_uppercase(),
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        400.0,
        395.0,
        13.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#54211d",
    );
    for (n, line) in wrap(&c.data.definition, 36).into_iter().take(4).enumerate() {
        s.text(
            &line,
            400.0,
            455.0 + n as f32 * 25.0,
            15.0,
            "Liberation Serif",
            "normal",
            "middle",
            "#fff5df",
        );
    }
    s.text(
        &entry_number(&c.data.word).to_string(),
        660.0,
        115.0,
        25.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#fff5df",
    );
    s.text(
        c.watermark,
        400.0,
        685.0,
        10.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#fff5df",
    );
    s.finish()
}

fn movie_poster(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#15121b");
    s.raw(format!(r##"<rect width="{}" height="115" fill="#d83d39"/><rect y="660" width="{}" height="140" fill="#d83d39"/><path d="M70 155L730 625M730 155L70 625" stroke="#d83d39" stroke-width="65" opacity=".13"/>"##, c.width, c.width));
    s.text(
        "A LEXICON PICTURES PRESENTATION",
        400.0,
        55.0,
        15.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#15121b",
    );
    s.text(
        &c.data.word.to_uppercase(),
        400.0,
        300.0,
        fit_size(&c.data.word, 650.0, 88.0, 35.0),
        "Liberation Sans",
        "bold",
        "middle",
        "#f6e8c9",
    );
    s.text(
        &format!(
            "THE {} THAT CHANGED EVERYTHING",
            c.data.part_of_speech.to_uppercase()
        ),
        400.0,
        365.0,
        14.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#d83d39",
    );
    for (n, line) in wrap(&c.data.definition, 48).into_iter().take(4).enumerate() {
        s.text(
            &line,
            400.0,
            445.0 + n as f32 * 27.0,
            17.0,
            "Liberation Serif",
            "normal",
            "middle",
            "#f6e8c9",
        );
    }
    s.text(
        "COMING SOON TO A CONVERSATION NEAR YOU",
        400.0,
        710.0,
        14.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#15121b",
    );
    s.text(
        c.watermark,
        400.0,
        758.0,
        10.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#15121b",
    );
    s.finish()
}

fn tea_bag_tag(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#e5ddc7");
    s.raw(r##"<line x1="400" y1="0" x2="400" y2="145" stroke="#3d3327" stroke-width="3"/><path d="M245 145H555L615 245V650L555 710H245L185 650V245Z" fill="#f2ead8" stroke="#3d3327" stroke-width="5"/><circle cx="400" cy="188" r="14" fill="none" stroke="#8c6d3c" stroke-width="4"/>"##);
    s.text(
        "ENGLISH BREAKFAST",
        400.0,
        255.0,
        12.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#8c6d3c",
    );
    s.text(
        &c.data.word,
        400.0,
        350.0,
        fit_size(&c.data.word, 350.0, 52.0, 23.0),
        "Liberation Serif",
        "bold",
        "middle",
        "#3d3327",
    );
    s.text(
        &format!(
            "{} · /{}/",
            c.data.part_of_speech,
            c.data.ipa.as_deref().unwrap_or("—")
        ),
        400.0,
        395.0,
        13.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#8c6d3c",
    );
    for (n, line) in wrap(&c.data.definition, 35).into_iter().take(4).enumerate() {
        s.text(
            &line,
            400.0,
            455.0 + n as f32 * 25.0,
            15.0,
            "Liberation Serif",
            "normal",
            "middle",
            "#3d3327",
        );
    }
    s.raw(r##"<line x1="235" y1="590" x2="565" y2="590" stroke="#8c6d3c" stroke-width="3"/>"##);
    s.text(
        "STEEP IN CONVERSATION",
        400.0,
        625.0,
        11.0,
        "Liberation Mono",
        "bold",
        "middle",
        "#8c6d3c",
    );
    s.text(
        c.watermark,
        400.0,
        675.0,
        9.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#3d3327",
    );
    s.finish()
}

fn periodic_element(c: &Context<'_>) -> String {
    let mut s = Svg::new(c.width, c.height, "#162227");
    s.raw(r##"<rect x="88" y="48" width="624" height="704" fill="#1e3036" stroke="#55c79a" stroke-width="7"/>"##);
    s.text(
        &entry_number(&c.data.word).to_string(),
        125.0,
        112.0,
        34.0,
        "Liberation Mono",
        "normal",
        "start",
        "#55c79a",
    );
    s.text(
        "LEX",
        675.0,
        105.0,
        16.0,
        "Liberation Mono",
        "bold",
        "end",
        "#55c79a",
    );
    s.raw(r##"<line x1="125" y1="155" x2="675" y2="155" stroke="#55c79a" stroke-width="2"/>"##);
    let symbol = c.data.word.chars().take(2).collect::<String>();
    s.text(
        &symbol[..].to_uppercase(),
        400.0,
        310.0,
        145.0,
        "Liberation Sans",
        "bold",
        "middle",
        "#e7f0ec",
    );
    s.text(
        &c.data.word,
        400.0,
        405.0,
        fit_size(&c.data.word, 500.0, 45.0, 23.0),
        "Liberation Sans",
        "normal",
        "middle",
        "#55c79a",
    );
    s.text(
        &c.data.part_of_speech.to_uppercase(),
        400.0,
        455.0,
        14.0,
        "Liberation Mono",
        "normal",
        "middle",
        "#9fb6b0",
    );
    for (n, line) in wrap(&c.data.definition, 45).into_iter().take(4).enumerate() {
        s.text(
            &line,
            400.0,
            525.0 + n as f32 * 27.0,
            16.0,
            "Liberation Serif",
            "normal",
            "middle",
            "#e7f0ec",
        );
    }
    s.raw(r##"<line x1="125" y1="650" x2="675" y2="650" stroke="#55c79a" stroke-width="2"/>"##);
    s.text(
        &format!(
            "ORIGIN · {}",
            c.data
                .origin_language
                .as_deref()
                .unwrap_or("UNKNOWN")
                .to_uppercase()
        ),
        125.0,
        690.0,
        11.0,
        "Liberation Mono",
        "normal",
        "start",
        "#9fb6b0",
    );
    s.text(
        c.watermark,
        675.0,
        690.0,
        10.0,
        "Liberation Mono",
        "normal",
        "end",
        "#9fb6b0",
    );
    s.finish()
}
