// Chalkboard theme — Rust example
// Lifetimes, macros, traits, generics, pattern matching

use std::collections::HashMap;
use std::fmt;

// ── Traits ────────────────────────────────────────────────────────────────────

pub trait Summarise {
    fn summary(&self) -> String;
    fn preview(&self) -> &str {
        "No preview available"
    }
}

// ── Structs ───────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct Article<'a> {
    pub title: &'a str,
    pub body: String,
    pub author: String,
    pub word_count: usize,
}

impl<'a> Article<'a> {
    pub fn new(title: &'a str, body: impl Into<String>, author: impl Into<String>) -> Self {
        let body = body.into();
        let word_count = body.split_whitespace().count();
        Self { title, body, author: author.into(), word_count }
    }
}

impl<'a> Summarise for Article<'a> {
    fn summary(&self) -> String {
        format!("{} — by {} ({} words)", self.title, self.author, self.word_count)
    }
}

impl<'a> fmt::Display for Article<'a> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}\n{}", self.title, self.body)
    }
}

// ── Enum with data ────────────────────────────────────────────────────────────

#[derive(Debug)]
pub enum ApiError {
    NotFound(String),
    Unauthorized,
    RateLimit { retry_after: u64 },
    Network(std::io::Error),
}

impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NotFound(msg) => write!(f, "Not found: {msg}"),
            Self::Unauthorized => write!(f, "Unauthorized"),
            Self::RateLimit { retry_after } => write!(f, "Rate limited; retry after {retry_after}s"),
            Self::Network(e) => write!(f, "Network error: {e}"),
        }
    }
}

// ── Generic function with lifetime ───────────────────────────────────────────

pub fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() >= y.len() { x } else { y }
}

// ── Result + ? operator ───────────────────────────────────────────────────────

pub fn parse_config(input: &str) -> Result<HashMap<String, String>, ApiError> {
    let mut map = HashMap::new();

    for line in input.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        let (key, value) = line.split_once('=')
            .ok_or_else(|| ApiError::NotFound(format!("Malformed line: {line}")))?;
        map.insert(key.trim().to_string(), value.trim().to_string());
    }

    Ok(map)
}

// ── Macros ───────────────────────────────────────────────────────────────────

macro_rules! hashmap {
    ($($k:expr => $v:expr),* $(,)?) => {{
        let mut m = std::collections::HashMap::new();
        $(m.insert($k, $v);)*
        m
    }};
}

// ── Unsafe block ─────────────────────────────────────────────────────────────

pub fn raw_sum(ptr: *const i32, len: usize) -> i32 {
    // SAFETY: caller guarantees ptr..ptr+len is valid & aligned
    unsafe {
        (0..len).map(|i| *ptr.add(i)).sum()
    }
}

// ── Attribute macros ──────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_longest() {
        assert_eq!(longest("hello", "world!"), "world!");
    }

    #[test]
    fn test_parse_config() {
        let input = "host = localhost\nport = 3000\n# comment\n";
        let config = parse_config(input).unwrap();
        assert_eq!(config["host"], "localhost");
        assert_eq!(config["port"], "3000");
    }
}

fn main() {
    let article = Article::new(
        "Chalkboard 2026",
        "A green theme for VS Code, agentic workflows, and the command line.",
        "henryallsuch",
    );

    println!("{}", article.summary());

    let defaults = hashmap! {
        "env"  => "production",
        "port" => "3000",
    };

    for (k, v) in &defaults {
        println!("{k}: {v}");
    }
}
