use anyhow::{Context, Result};
use serde::{Serialize, de::DeserializeOwned};
use serde_json::{Map, Value};
use std::{
    fs,
    path::{Path, PathBuf},
};

#[derive(Debug, Default)]
pub struct JsonCache {
    path: Option<PathBuf>,
    values: Map<String, Value>,
}

impl JsonCache {
    pub fn disabled() -> Self {
        Self::default()
    }

    pub fn open(path: Option<impl Into<PathBuf>>) -> Result<Self> {
        let Some(path) = path.map(Into::into) else {
            return Ok(Self::disabled());
        };
        let values = match fs::read_to_string(&path) {
            Ok(text) => serde_json::from_str(&text).unwrap_or_default(),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => Map::new(),
            Err(error) => return Err(error).with_context(|| format!("read {}", path.display())),
        };
        Ok(Self {
            path: Some(path),
            values,
        })
    }

    pub fn get<T: DeserializeOwned>(&self, key: &str) -> Option<T> {
        self.values
            .get(key)
            .and_then(|value| serde_json::from_value(value.clone()).ok())
    }

    pub fn insert<T: Serialize>(&mut self, key: impl Into<String>, value: &T) -> Result<()> {
        self.values.insert(key.into(), serde_json::to_value(value)?);
        self.save()
    }

    fn save(&self) -> Result<()> {
        let Some(path) = &self.path else {
            return Ok(());
        };
        if let Some(parent) = path.parent().filter(|p| *p != Path::new("")) {
            fs::create_dir_all(parent)?;
        }
        let temporary = path.with_extension("tmp");
        fs::write(&temporary, serde_json::to_vec_pretty(&self.values)?)?;
        fs::rename(temporary, path)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn disabled_cache_never_returns_values() {
        let mut c = JsonCache::disabled();
        c.insert("a", &1).unwrap();
        assert_eq!(c.get::<i32>("a"), Some(1));
    }
    #[test]
    fn missing_file_starts_empty() {
        let dir = tempfile::tempdir().unwrap();
        let c = JsonCache::open(Some(dir.path().join("x.json"))).unwrap();
        assert_eq!(c.get::<String>("x"), None);
    }
    #[test]
    fn values_survive_reopen() {
        let dir = tempfile::tempdir().unwrap();
        let p = dir.path().join("x.json");
        JsonCache::open(Some(&p))
            .unwrap()
            .insert("answer", &42)
            .unwrap();
        assert_eq!(
            JsonCache::open(Some(p)).unwrap().get::<i32>("answer"),
            Some(42)
        );
    }
    #[test]
    fn malformed_json_is_treated_as_empty() {
        let dir = tempfile::tempdir().unwrap();
        let p = dir.path().join("x.json");
        fs::write(&p, "nope").unwrap();
        assert_eq!(JsonCache::open(Some(p)).unwrap().get::<i32>("x"), None);
    }
    #[test]
    fn creates_parent_directories() {
        let dir = tempfile::tempdir().unwrap();
        let p = dir.path().join("a/b/x.json");
        JsonCache::open(Some(&p))
            .unwrap()
            .insert("x", &true)
            .unwrap();
        assert!(p.exists());
    }
}
