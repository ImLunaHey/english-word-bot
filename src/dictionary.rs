use crate::cache::JsonCache;
use regex::Regex;
use serde::{Deserialize, Serialize};

const USER_AGENT: &str = "englishwordbot/2.0 (https://bsky.app/profile/englishwordbot.bsky.social)";
const CACHE_VERSION: &str = "v3";

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
        let cache_key = format!("{CACHE_VERSION}:{word}");
        if let Some(value) = self.cache.get::<Option<WordData>>(&cache_key) {
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
        if let Err(error) = self.cache.insert(cache_key, &result) {
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
        let source = self.wiktionary_wikitext(word).await?;
        let section = english_section(&source);
        let mut enrichment = (extract_ipa(section), extract_etymology(section));
        if (enrichment.0.is_none()
            || enrichment
                .1
                .as_deref()
                .and_then(detect_origin_language)
                .is_none())
            && let Some(target) = extract_enrichment_target(section)
            && target != word
            && let Some(target_source) = self.wiktionary_wikitext(&target).await
        {
            let target_section = english_section(&target_source);
            enrichment.0 = enrichment.0.or_else(|| extract_ipa(target_section));
            let target_etymology = extract_etymology(target_section);
            if enrichment
                .1
                .as_deref()
                .and_then(detect_origin_language)
                .is_none()
            {
                enrichment.1 = target_etymology;
            }
        }
        Some(enrichment)
    }

    async fn wiktionary_wikitext(&self, word: &str) -> Option<String> {
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
        json.pointer("/parse/wikitext")?.as_str().map(str::to_owned)
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
    // A language starts with exactly two '=' characters. Subsections such as
    // `===Etymology===` must stay in the English section.
    let end = after
        .match_indices("\n==")
        .find_map(|(index, _)| (!after[index + 3..].starts_with('=')).then_some(index));
    end.map_or(after, |index| &after[..index])
}
fn extract_ipa(value: &str) -> Option<String> {
    Regex::new(r"\{\{IPA\|en\|([^}|]+)")
        .unwrap()
        .captures(value)
        .map(|c| clean_ipa(c[1].trim()))
}
fn extract_enrichment_target(value: &str) -> Option<String> {
    for pattern in [
        r"\{\{(?:infl of|inflection of)\|en\|([^|}]+)",
        r"(?i)See\s+\{\{m\|en\|([^|}]+)",
    ] {
        if let Some(capture) = Regex::new(pattern).unwrap().captures(value) {
            return Some(capture[1].trim().to_owned());
        }
    }
    None
}
fn extract_etymology(value: &str) -> Option<String> {
    let capture = Regex::new(r"(?s)===\s*Etymology(?:\s+\d+)?\s*===\s*\n(.*?)(?:\n===|\z)")
        .unwrap()
        .captures(value)?;
    let origin_template = Regex::new(r"\{\{(?:der|inh|bor|lbor|obor)\|en\|([^|}]+)\|").unwrap();
    let mention_template = Regex::new(r"\{\{m\|([^|}]+)\|").unwrap();
    let languages = origin_template.replace_all(&capture[1], |captures: &regex::Captures| {
        language_name(&captures[1]).unwrap_or("").to_owned() + " "
    });
    let languages = mention_template.replace_all(&languages, |captures: &regex::Captures| {
        language_name(&captures[1]).unwrap_or("").to_owned() + " "
    });
    let links = Regex::new(r"\[\[(?:[^]|]+\|)?([^]]+)\]\]")
        .unwrap()
        .replace_all(&languages, "$1");
    let templates = Regex::new(r"\{\{[^}]*\}\}")
        .unwrap()
        .replace_all(&links, "");
    let tags = Regex::new(r"<[^>]+>").unwrap().replace_all(&templates, "");
    let text = tags
        .replace("}}", "")
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

fn language_name(code: &str) -> Option<&'static str> {
    Some(match code {
        "enm" => "Middle English",
        "ang" => "Old English",
        "dum" => "Middle Dutch",
        "nl" => "Dutch",
        "de" => "German",
        "gmh" => "Middle High German",
        "goh" => "Old High German",
        "gem-pro" => "Proto-Germanic",
        "la" => "Latin",
        "it" => "Italian",
        "fr" => "French",
        "fro" => "Old French",
        "frm" => "Middle French",
        "grc" => "Ancient Greek",
        "el" => "Greek",
        "ine-pro" => "Proto-Indo-European",
        "non" => "Old Norse",
        "es" => "Spanish",
        "pt" => "Portuguese",
        "ar" => "Arabic",
        "he" => "Hebrew",
        "sa" => "Sanskrit",
        "fa" => "Persian",
        "ja" => "Japanese",
        "zh" => "Chinese",
        "hi" => "Hindi",
        "ga" => "Irish",
        "gd" => "Scottish Gaelic",
        _ => return None,
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
        "English",
        "Anglo-Saxon",
        "Old High German",
        "Proto-Germanic",
        "German",
        "Italian",
        "Spanish",
        "Portuguese",
        "Dutch",
        "Middle Dutch",
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
        matchers::{method, path, query_param},
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
    fn english_section_keeps_pronunciation_and_etymology_subsections() {
        let source = "==English==\n===Etymology===\nFrom [[Old English]].\n===Pronunciation===\n{{IPA|en|/kɒkni/}}\n===Noun===\nA person.\n==French==\nother";
        let section = english_section(source);
        assert!(section.contains("===Etymology==="));
        assert!(section.contains("{{IPA|en|/kɒkni/}}"));
        assert!(!section.contains("French"));
    }
    #[test]
    fn posted_word_regressions_extract_enrichment() {
        let cockney =
            "==English==\n===Etymology===\nSee {{m|en|Cockney}}.\n===Pronunciation===\n===Noun===";
        let swabbing =
            "==English==\n===Verb===\n{{head|en|verb form}}\n# {{infl of|en|swab||ing-form}}";
        assert_eq!(
            extract_enrichment_target(english_section(cockney)).as_deref(),
            Some("Cockney")
        );
        assert_eq!(
            extract_enrichment_target(english_section(swabbing)).as_deref(),
            Some("swab")
        );
    }
    #[test]
    fn preserves_languages_encoded_in_etymology_templates() {
        let source = "===Etymology===\nBack-formation from {{der|en|enm|swabber}}, from {{der|en|dum|zwabber}}.\n===Noun===";
        let etymology = extract_etymology(source).unwrap();
        assert!(etymology.contains("Middle English"));
        assert!(etymology.contains("Middle Dutch"));
        assert_eq!(
            detect_origin_language(&etymology).as_deref(),
            Some("Middle English")
        );
    }
    #[test]
    fn extracts_latin_origin_from_wiktionary_templates() {
        let source = "===Etymology===\nFrom earlier [[nauseat]], from {{der|en|la|nauseātus}}, from {{m|la|nauseō}}, from {{der|en|grc|ναυσία}}.\n===Verb===";
        let etymology = extract_etymology(source).unwrap();
        assert!(etymology.contains("Latin"));
        assert!(etymology.contains("Ancient Greek"));
        assert_eq!(detect_origin_language(&etymology).as_deref(), Some("Latin"));
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
    async fn enriches_an_inflected_word_from_its_lemma() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/api/v2/entries/en/swabbing"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!([{
                "meanings":[{"partOfSpeech":"verb","definitions":[{"definition":"Cleaning with a swab."}]}]
            }])))
            .mount(&server)
            .await;
        Mock::given(method("GET"))
            .and(path("/w/api.php"))
            .and(query_param("page", "swabbing"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
                "parse":{"wikitext":"==English==\n===Verb===\n{{infl of|en|swab||ing-form}}"}
            })))
            .mount(&server)
            .await;
        Mock::given(method("GET"))
            .and(path("/w/api.php"))
            .and(query_param("page", "swab"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
                "parse":{"wikitext":"==English==\n===Etymology===\nBack-formation from {{der|en|enm|swabber}}.\n===Pronunciation===\n{{IPA|en|/swɒb/}}\n===Noun==="}
            })))
            .mount(&server)
            .await;
        let mut dictionary =
            Dictionary::with_endpoints(JsonCache::disabled(), server.uri(), server.uri());
        let result = dictionary.fetch("swabbing").await.unwrap();
        assert_eq!(result.ipa.as_deref(), Some("swɒb"));
        assert_eq!(result.origin_language.as_deref(), Some("Middle English"));
    }
    #[tokio::test]
    async fn enriches_nauseating_from_nauseate_latin_etymology() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/api/v2/entries/en/nauseating"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!([{
                "phonetic":"/ˈnɔːzieɪtɪŋ/",
                "meanings":[{"partOfSpeech":"adjective","definitions":[{"definition":"Causing nausea."}]}]
            }])))
            .mount(&server)
            .await;
        for (page, wikitext) in [
            (
                "nauseating",
                "==English==\n===Adjective===\nCausing nausea.\n===Verb===\n{{infl of|en|nauseate||ing-form}}",
            ),
            (
                "nauseate",
                "==English==\n===Etymology===\nFrom [[nauseat]], from {{der|en|la|nauseātus}}, from {{der|en|grc|ναυσία}}.\n===Pronunciation===\n{{IPA|en|/ˈnɔziˌeɪt/}}\n===Verb===",
            ),
        ] {
            Mock::given(method("GET"))
                .and(path("/w/api.php"))
                .and(query_param("page", page))
                .respond_with(
                    ResponseTemplate::new(200)
                        .set_body_json(serde_json::json!({"parse":{"wikitext":wikitext}})),
                )
                .mount(&server)
                .await;
        }
        let mut dictionary =
            Dictionary::with_endpoints(JsonCache::disabled(), server.uri(), server.uri());
        let result = dictionary.fetch("nauseating").await.unwrap();
        assert_eq!(result.origin_language.as_deref(), Some("Latin"));
        assert!(result.etymology.unwrap().contains("Latin"));
    }
    #[tokio::test]
    async fn follows_a_wiktionary_see_reference_for_enrichment() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/api/v2/entries/en/cockney"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!([{
                "meanings":[{"partOfSpeech":"noun","definitions":[{"definition":"A Londoner."}]}]
            }])))
            .mount(&server)
            .await;
        for (page, wikitext) in [
            (
                "cockney",
                "==English==\n===Etymology===\nSee {{m|en|Cockney}}.\n===Noun===",
            ),
            (
                "Cockney",
                "==English==\n===Etymology===\nFrom {{inh|en|enm|cokenay}}.\n===Pronunciation===\n{{IPA|en|/ˈkɒk.ni/}}\n===Noun===",
            ),
        ] {
            Mock::given(method("GET"))
                .and(path("/w/api.php"))
                .and(query_param("page", page))
                .respond_with(
                    ResponseTemplate::new(200)
                        .set_body_json(serde_json::json!({"parse":{"wikitext":wikitext}})),
                )
                .mount(&server)
                .await;
        }
        let mut dictionary =
            Dictionary::with_endpoints(JsonCache::disabled(), server.uri(), server.uri());
        let result = dictionary.fetch("cockney").await.unwrap();
        assert_eq!(result.ipa.as_deref(), Some("ˈkɒk.ni"));
        assert_eq!(result.origin_language.as_deref(), Some("Middle English"));
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
        cache
            .insert("v3:missing", &Option::<WordData>::None)
            .unwrap();
        assert!(
            Dictionary::with_endpoints(cache, server.uri(), server.uri())
                .fetch("missing")
                .await
                .is_none()
        );
        assert!(server.received_requests().await.unwrap().is_empty());
    }
}
