use anyhow::{Context, Result, bail};
use rand::Rng;
use std::{collections::HashSet, fs, path::Path};

#[derive(Debug)]
pub struct WordPool {
    words: Vec<String>,
    posted: HashSet<String>,
}

impl WordPool {
    pub fn new(
        words: impl IntoIterator<Item = String>,
        posted: impl IntoIterator<Item = String>,
    ) -> Result<Self> {
        let words: Vec<_> = words
            .into_iter()
            .map(|w| w.trim().to_owned())
            .filter(|w| !w.is_empty())
            .collect();
        if words.is_empty() {
            bail!("word list is empty")
        }
        Ok(Self {
            words,
            posted: posted
                .into_iter()
                .map(|w| w.trim().to_owned())
                .filter(|w| !w.is_empty())
                .collect(),
        })
    }

    pub fn from_files(words: &Path, posted: &Path) -> Result<Self> {
        let words =
            fs::read_to_string(words).with_context(|| format!("read {}", words.display()))?;
        let posted = fs::read_to_string(posted).unwrap_or_default();
        Self::new(
            words.lines().map(str::to_owned),
            posted.lines().map(str::to_owned),
        )
    }

    pub fn choose<R: Rng + ?Sized>(&self, rng: &mut R) -> Option<&str> {
        let available = self.remaining();
        if available == 0 {
            return None;
        }
        let mut wanted = rng.random_range(0..available);
        self.words
            .iter()
            .filter(|word| !self.posted.contains(*word))
            .find(|_| {
                let hit = wanted == 0;
                wanted = wanted.saturating_sub(1);
                hit
            })
            .map(String::as_str)
    }

    pub fn mark_posted(&mut self, word: &str, path: &Path) -> Result<()> {
        if !self.posted.insert(word.to_owned()) {
            return Ok(());
        }
        let mut values: Vec<_> = self.posted.iter().cloned().collect();
        values.sort();
        if let Some(parent) = path
            .parent()
            .filter(|parent| !parent.as_os_str().is_empty())
        {
            fs::create_dir_all(parent)?;
        }
        let temporary = path.with_extension("tmp");
        if let Err(error) = fs::write(&temporary, values.join("\n") + "\n")
            .and_then(|()| fs::rename(&temporary, path))
        {
            self.posted.remove(word);
            let _ = fs::remove_file(temporary);
            return Err(error.into());
        }
        Ok(())
    }

    pub fn remaining(&self) -> usize {
        self.words
            .iter()
            .filter(|w| !self.posted.contains(*w))
            .count()
    }
}

pub fn english_words() -> Vec<String> {
    let mut words = am_wordlist::iter()
        .map(str::to_owned)
        .chain(
            static_lang_word_lists::ALL_WORD_LISTS
                .iter()
                .filter(|list| list.language() == Some("en"))
                .flat_map(|list| list.iter().map(str::to_owned)),
        )
        .filter(|word| word.chars().all(|character| character.is_alphabetic()))
        .collect::<Vec<_>>();
    words.sort();
    words.dedup();
    words
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::{SeedableRng, rngs::StdRng};
    #[test]
    fn rejects_empty_pool() {
        assert!(WordPool::new([], []).is_err());
    }
    #[test]
    fn trims_and_discards_blank_words() {
        assert_eq!(
            WordPool::new([" hi ".into(), "".into()], [])
                .unwrap()
                .remaining(),
            1
        );
    }
    #[test]
    fn never_chooses_posted_word() {
        let p = WordPool::new(["one".into(), "two".into()], ["one".into()]).unwrap();
        assert_eq!(p.choose(&mut StdRng::seed_from_u64(1)), Some("two"));
    }
    #[test]
    fn exhausted_pool_returns_none() {
        let p = WordPool::new(["one".into()], ["one".into()]).unwrap();
        assert_eq!(p.choose(&mut StdRng::seed_from_u64(1)), None);
    }
    #[test]
    fn posted_words_outside_the_current_dictionary_do_not_affect_selection() {
        let pool = WordPool::new(
            ["one".into(), "two".into()],
            ["removed-from-dictionary".into()],
        )
        .unwrap();
        let mut rng = StdRng::seed_from_u64(2);
        assert!(matches!(pool.choose(&mut rng), Some("one" | "two")));
        assert_eq!(pool.remaining(), 2);
    }
    #[test]
    fn mark_is_idempotent() {
        let d = tempfile::tempdir().unwrap();
        let path = d.path().join("posted");
        let mut p = WordPool::new(["one".into()], []).unwrap();
        p.mark_posted("one", &path).unwrap();
        p.mark_posted("one", &path).unwrap();
        assert_eq!(fs::read_to_string(path).unwrap(), "one\n");
    }
    #[test]
    fn mark_creates_parent_directories_atomically() {
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().join("state/posted.txt");
        let mut pool = WordPool::new(["one".into()], []).unwrap();
        pool.mark_posted("one", &path).unwrap();
        assert_eq!(fs::read_to_string(&path).unwrap(), "one\n");
        assert!(!path.with_extension("tmp").exists());
    }
    #[test]
    fn failed_persistence_does_not_mark_word_in_memory() {
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().join("posted");
        fs::create_dir(&path).unwrap();
        let mut pool = WordPool::new(["one".into()], []).unwrap();
        assert!(pool.mark_posted("one", &path).is_err());
        assert_eq!(pool.remaining(), 1);
    }
    #[test]
    fn reads_missing_posted_file() {
        let d = tempfile::tempdir().unwrap();
        let words = d.path().join("words");
        fs::write(&words, "one\ntwo\n").unwrap();
        assert_eq!(
            WordPool::from_files(&words, &d.path().join("missing"))
                .unwrap()
                .remaining(),
            2
        );
    }
    #[test]
    fn bundled_dictionary_is_substantial_and_clean() {
        let words = english_words();
        assert!(words.len() > 30_000, "only {} bundled words", words.len());
        assert!(
            words
                .iter()
                .all(|word| !word.is_empty() && word.chars().all(char::is_alphabetic))
        );
    }
}
