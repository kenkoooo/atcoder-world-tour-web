use futures::executor::block_on;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::env;
use std::fs;
use std::fs::File;
use std::path::Path;

const GP30: [u64; 30] = [
    100, 75, 60, 50, 45, 40, 36, 32, 29, 26, 24, 22, 20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7,
    6, 5, 4, 3, 2, 1,
];

fn main() {
    simple_logger::init_with_level(log::Level::Info).unwrap();
    let args: Vec<String> = env::args().collect();
    let contest_list_path = &args[1];
    let output = &args[2];
    let output = Path::new(output);
    assert!(output.is_dir(), "{} is not dir", output.to_str().unwrap());
    let output = output.join("result.json");

    let contests: Vec<ContestInfo> =
        serde_json::from_str(&fs::read_to_string(contest_list_path).unwrap()).unwrap();

    let contest_count = contests.len() as f64;
    let mut user_map = BTreeMap::new();
    for contest in contests.into_iter() {
        let standings = block_on(fetch_standings(&contest.id)).unwrap();
        for s in standings
            .standings
            .into_iter()
            .filter(|s| s.total_result.count > 0)
        {
            let user_id = s.screen_name;
            user_map
                .entry(user_id.clone())
                .or_insert_with(|| User::new(user_id))
                .result
                .insert(contest.id.clone(), s.rank);
        }
        for writer in contest.writers.into_iter() {
            user_map
                .entry(writer.clone())
                .or_insert_with(|| User::new(writer))
                .writer
                .push(contest.id.clone());
        }
    }

    let v = user_map
        .into_iter()
        .map(|(_, mut user)| {
            let writer_count = user.writer.len() as f64;
            let point_sum = user
                .result
                .values()
                .filter(|&&rank| rank <= 30)
                .map(|&s| GP30[s - 1])
                .sum::<u64>() as f64;
            let point = point_sum * contest_count / (contest_count - writer_count);
            user.point = point;
            user
        })
        .filter(|user| user.point > 0.0)
        .map(|mut user| {
            let user_info = block_on(fetch_user_info(&user.id)).unwrap();
            user.user_info = Some(user_info);
            user
        })
        .collect::<Vec<_>>();

    let output = File::create(output).unwrap();
    serde_json::to_writer(output, &v).unwrap();
}

async fn fetch_standings(contest_id: &str) -> Result<Standings, surf::Exception> {
    let url = format!("https://atcoder.jp/contests/{}/standings/json", contest_id);
    log::info!("Fetching {}", url);
    let standings = surf::get(url).recv_json::<Standings>().await?;
    Ok(standings)
}

async fn fetch_user_info(user: &str) -> Result<UserInfo, surf::Exception> {
    let url = format!("https://atcoder.jp/users/{}", user);
    log::info!("Fetching {}", url);
    let html = surf::get(url).recv_string().await?;
    let selector = scraper::Selector::parse("div.col-sm-3").unwrap();
    let document = scraper::Html::parse_document(&html);
    let t = document.select(&selector).next().unwrap();
    let image_url = t
        .select(&scraper::Selector::parse("img.avatar").unwrap())
        .next()
        .unwrap()
        .value()
        .attr("src")
        .unwrap()
        .to_owned();
    let country = t
        .select(&scraper::Selector::parse("table.dl-table").unwrap())
        .next()
        .unwrap()
        .select(&scraper::Selector::parse("td").unwrap())
        .next()
        .unwrap()
        .text()
        .next()
        .unwrap()
        .trim()
        .to_owned();

    Ok(UserInfo { image_url, country })
}

#[derive(Serialize)]
struct User {
    id: String,
    result: BTreeMap<String, usize>,
    writer: Vec<String>,
    point: f64,
    user_info: Option<UserInfo>,
}

#[derive(Serialize)]
struct UserInfo {
    image_url: String,
    country: String,
}

impl User {
    fn new(id: String) -> Self {
        Self {
            id,
            result: BTreeMap::new(),
            writer: Vec::new(),
            point: 0.0,
            user_info: None,
        }
    }
}

#[derive(Deserialize)]
struct StandingsEntry {
    #[serde(rename = "UserScreenName")]
    screen_name: String,

    #[serde(rename = "Rank")]
    rank: usize,

    #[serde(rename = "TotalResult")]
    total_result: TotalResult,
}

#[derive(Deserialize)]
struct TotalResult {
    #[serde(rename = "Count")]
    count: usize,
}

#[derive(Deserialize)]
struct Standings {
    #[serde(rename = "StandingsData")]
    standings: Vec<StandingsEntry>,
}

#[derive(Deserialize)]
struct ContestInfo {
    id: String,
    writers: Vec<String>,
}
