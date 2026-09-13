use crate::cache::JsonCache;
use regex::Regex;
use serde::{Deserialize, Serialize};

const USER_AGENT: &str = "englishwordbot/2.0 (https://bsky.app/profile/englishwordbot.bsky.social)";

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WordData {
    pub word: String,
    pub part_of_speech: String,
    pub definition: String,
    pub example: Option<String>,
    pub ipa: Option<String>,
    pub etymology: Option<String>,
    pub origin_language: Option<String>,
}

pub struct Dictionary {
    client: reqwest::Client,
    dictionary_base: String,
    wiktionary_base: String,
    cache: JsonCache,
}

impl Dictionary {
    pub fn new(cache: JsonCache) -> Self {
        Self::with_endpoints(
            cache,
            "https://api.dictionaryapi.dev",
            "https://en.wiktionary.org",
        )
    }

    pub fn with_endpoints(
        cache: JsonCache,
        dictionary_base: impl Into<String>,
        wiktionary_base: impl Into<String>,
    ) -> Self {
        Self {
            client: reqwest::Client::builder()
                .user_agent(USER_AGENT)
                .build()
                .expect("valid HTTP client"),
            dictionary_base: dictionary_base.into(),
            wiktionary_base: wiktionary_base.into(),
            cache,
        }
    }

    pub async fn fetch(&mut self, word: &str) -> Option<WordData> {
        if let Some(value) = self.cache.get::<Option<WordData>>(word) {
            return value;
        }
        let mut result = self.dictionary_api(word).await;
        if result.is_none() {
            result = self.wiktionary_definition(word).await;
        }
        if let Some(data) = result
            .as_mut()
            .filter(|d| d.ipa.is_none() || d.etymology.is_none())
            && let Some((ipa, etymology)) = self.wiktionary_enrichment(word).await
        {
            data.ipa = data.ipa.take().or(ipa);
            data.etymology = data.etymology.take().or(etymology);
            data.origin_language = data
                .origin_language
                .take()
                .or_else(|| data.etymology.as_deref().and_then(detect_origin_language));
        }
        if let Err(error) = self.cache.insert(word, &result) {
            eprintln!("failed to cache {word}: {error:#}");
        }
        result
    }

    async fn dictionary_api(&self, word: &str) -> Option<WordData> {
        let url = format!(
            "{}/api/v2/entries/en/{}",
            self.dictionary_base,
            encode_segment(word)
        );
        let json: serde_json::Value = self
            .client
            .get(url)
            .send()
            .await
            .ok()?
            .error_for_status()
            .ok()?
            .json()
            .await
            .ok()?;
        let entry = json.as_array()?.first()?;
        let meaning = entry.get("meanings")?.as_array()?.first()?;
        let definition = meaning.get("definitions")?.as_array()?.first()?;
        let origin = entry
            .get("origin")
            .and_then(|v| v.as_str())
            .map(str::to_owned);
        let phonetic = entry.get("phonetic").and_then(|v| v.as_str()).or_else(|| {
            entry
                .get("phonetics")?
                .as_array()?
                .iter()
                .find_map(|p| p.get("text")?.as_str())
        });
        Some(WordData {
            word: word.into(),
            part_of_speech: meaning
                .get("partOfSpeech")
                .and_then(|v| v.as_str())
                .unwrap_or_default()
                .into(),
            definition: definition.get("definition")?.as_str()?.into(),
            example: definition
                .get("example")
                .and_then(|v| v.as_str())
                .map(str::to_owned),
            ipa: phonetic.map(clean_ipa),
            origin_language: origin.as_deref().and_then(detect_origin_language),
            etymology: origin,
        })
    }

    async fn wiktionary_definition(&self, word: &str) -> Option<WordData> {
        let url = format!(
            "{}/api/rest_v1/page/definition/{}",
            self.wiktionary_base,
            encode_segment(word)
        );
        let json: serde_json::Value = self
            .client
            .get(url)
            .send()
            .await
            .ok()?
            .error_for_status()
            .ok()?
            .json()
            .await
            .ok()?;
        let english = json.get("en")?.as_array()?.first()?;
        let definition = english.get("definitions")?.as_array()?.first()?;
        Some(WordData {
            word: word.into(),
            part_of_speech: english
                .get("partOfSpeech")
                .and_then(|v| v.as_str())
                .unwrap_or_default()
                .into(),
            definition: strip_html(definition.get("definition")?.as_str()?),
            example: definition
                .get("examples")
                .and_then(|v| v.as_array())
                .and_then(|v| v.first())
                .and_then(|v| v.as_str())
                .map(strip_html),
            ipa: None,
            etymology: None,
            origin_language: None,
        })
    }

    async fn wiktionary_enrichment(&self, word: &str) -> Option<(Option<String>, Option<String>)> {
        let url = format!(
            "{}/w/api.php?action=parse&page={}&prop=wikitext&format=json&formatversion=2",
            self.wiktionary_base,
            encode_segment(word)
        );
        let json: serde_json::Value = self
            .client
            .get(url)
            .send()
            .await
            .ok()?
            .error_for_status()
            .ok()?
            .json()
            .await
            .ok()?;
        let source = english_section(json.pointer("/parse/wikitext")?.as_str()?);
        Some((extract_ipa(source), extract_etymology(source)))
    }
}

fn encode_segment(value: &str) -> String {
    value
        .bytes()
        .flat_map(|b| {
            if b.is_ascii_alphanumeric() || b"-._~".contains(&b) {
                vec![b as char]
            } else {
                format!("%{b:02X}").chars().collect()
            }
        })
        .collect()
}
fn clean_ipa(value: &str) -> String {
    value
        .trim_matches(|c| matches!(c, '/' | '[' | ']'))
        .to_owned()
}
fn strip_html(value: &str) -> String {
    Regex::new("<[^>]+>")
        .unwrap()
        .replace_all(value, "")
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}
fn english_section(value: &str) -> &str {
    let Some((_, after)) = value.split_once("==English==") else {
        return value;
    };
    after
        .split_once("\n==")
        .map_or(after, |(section, _)| section)
}
fn extract_ipa(value: &str) -> Option<String> {
    Regex::new(r"\{\{IPA\|en\|([^}|]+)")
        .unwrap()
        .captures(value)
        .map(|c| clean_ipa(c[1].trim()))
}
fn extract_etymology(value: &str) -> Option<String> {
    let capture = Regex::new(r"(?s)===\s*Etymology(?:\s+\d+)?\s*===\s*\n(.*?)(?:\n===|\z)")
        .unwrap()
        .captures(value)?;
    let links = Regex::new(r"\[\[(?:[^]|]+\|)?([^]]+)\]\]")
        .unwrap()
        .replace_all(&capture[1], "$1");
    let templates = Regex::new(r"\{\{[^}]*\}\}")
        .unwrap()
        .replace_all(&links, "");
    let tags = Regex::new(r"<[^>]+>").unwrap().replace_all(&templates, "");
    let text = tags
        .replace("'''", "")
        .replace("''", "")
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ");
    (text.len() >= 10).then(|| {
        if text.chars().count() > 240 {
            format!("{}...", text.chars().take(237).collect::<String>())
        } else {
            text
        }
    })
}
fn detect_origin_language(value: &str) -> Option<String> {
    const LANGS: &[&str] = &[
        "Proto-Indo-European",
        "Late Latin",
        "Vulgar Latin",
        "Medieval Latin",
        "Latin",
        "Ancient Greek",
        "Greek",
        "Old French",
        "Middle French",
        "Anglo-Norman",
        "French",
        "Old English",
        "Middle English",
        "Anglo-Saxon",
        "Old High German",
        "Proto-Germanic",
        "German",
        "Italian",
        "Spanish",
        "Portuguese",
        "Dutch",
        "Arabic",
        "Hebrew",
        "Sanskrit",
        "Persian",
        "Japanese",
        "Chinese",
        "Hindi",
        "Old Norse",
        "Norse",
        "Scottish Gaelic",
        "Irish",
        "Celtic",
        "Gaelic",
    ];
    LANGS
        .iter()
        .filter_map(|lang| value.find(lang).map(|pos| (pos, *lang)))
        .min_by_key(|x| x.0)
        .map(|(_, lang)| lang.into())
}

#[cfg(test)]
mod tests {
    use super::*;
    use wiremock::{
        Mock, MockServer, ResponseTemplate,
        matchers::{method, path},
    };
    #[test]
    fn cleans_ipa_delimiters() {
        assert_eq!(clean_ipa("/həˈləʊ/"), "həˈləʊ");
        assert_eq!(clean_ipa("[test]"), "test")
    }
    #[test]
    fn strips_html_and_space() {
        assert_eq!(strip_html("a <i>small</i>  test"), "a small test")
    }
    #[test]
    fn encodes_url_segments() {
        assert_eq!(encode_segment("ice cream?"), "ice%20cream%3F")
    }
    #[test]
    fn extracts_english_only() {
        assert_eq!(
            english_section("==French==\nx\n==English==\ny\n==German==\nz").trim(),
            "y"
        )
    }
    #[test]
    fn extracts_ipa_template() {
        assert_eq!(extract_ipa("{{IPA|en|/wɜːd/|a=US}}"), Some("wɜːd".into()))
    }
    #[test]
    fn missing_ipa_is_none() {
        assert_eq!(extract_ipa("nothing"), None)
    }
    #[test]
    fn extracts_simple_etymology() {
        assert_eq!(
            extract_etymology("===Etymology===\nFrom [[Latin]] word.\n===Noun==="),
            Some("From Latin word.".into())
        )
    }
    #[test]
    fn short_etymology_is_rejected() {
        assert_eq!(
            extract_etymology("===Etymology===\nShort\n===Noun==="),
            None
        )
    }
    #[test]
    fn detects_earliest_language() {
        assert_eq!(
            detect_origin_language("From French, ultimately Latin"),
            Some("French".into())
        )
    }
    #[test]
    fn longer_language_name_wins_at_same_position() {
        assert_eq!(
            detect_origin_language("Late Latin"),
            Some("Late Latin".into())
        )
    }
    #[tokio::test]
    async fn parses_dictionary_api_response() {
        let server = MockServer::start().await;
        Mock::given(method("GET")).and(path("/api/v2/entries/en/hello")).respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!([{"phonetic":"/həˈləʊ/","origin":"Old English greeting","meanings":[{"partOfSpeech":"noun","definitions":[{"definition":"A greeting.","example":"Hello there."}]}]}]))).mount(&server).await;
        Mock::given(method("GET"))
            .respond_with(ResponseTemplate::new(404))
            .mount(&server)
            .await;
        let mut dictionary =
            Dictionary::with_endpoints(JsonCache::disabled(), server.uri(), server.uri());
        let result = dictionary.fetch("hello").await.unwrap();
        assert_eq!(result.definition, "A greeting.");
        assert_eq!(result.ipa.as_deref(), Some("həˈləʊ"));
        assert_eq!(result.origin_language.as_deref(), Some("Old English"));
    }
    #[tokio::test]
    async fn falls_back_to_wiktionary_definition() {
        let server = MockServer::start().await;
        Mock::given(method("GET")).and(path("/api/rest_v1/page/definition/test")).respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({"en":[{"partOfSpeech":"noun","definitions":[{"definition":"A <b>trial</b>.","examples":["A test."]}]}]}))).mount(&server).await;
        Mock::given(method("GET"))
            .respond_with(ResponseTemplate::new(404))
            .mount(&server)
            .await;
        let mut dictionary =
            Dictionary::with_endpoints(JsonCache::disabled(), server.uri(), server.uri());
        let result = dictionary.fetch("test").await.unwrap();
        assert_eq!(result.definition, "A trial.");
        assert_eq!(result.example.as_deref(), Some("A test."));
    }
    #[tokio::test]
    async fn returns_none_when_both_sources_fail() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .respond_with(ResponseTemplate::new(503))
            .mount(&server)
            .await;
        assert!(
            Dictionary::with_endpoints(JsonCache::disabled(), server.uri(), server.uri())
                .fetch("missing")
                .await
                .is_none()
        );
    }
    #[tokio::test]
    async fn cached_null_avoids_network() {
        let server = MockServer::start().await;
        let dir = tempfile::tempdir().unwrap();
        let cache_path = dir.path().join("cache.json");
        let mut cache = JsonCache::open(Some(&cache_path)).unwrap();
        cache.insert("missing", &Option::<WordData>::None).unwrap();
        assert!(
            Dictionary::with_endpoints(cache, server.uri(), server.uri())
                .fetch("missing")
                .await
                .is_none()
        );
        assert!(server.received_requests().await.unwrap().is_empty());
    }
}
