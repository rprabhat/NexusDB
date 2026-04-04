use crate::AppState;
use nexus_db::embedded::transaction::ReadTransaction;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Serialize, Deserialize)]
pub struct DbInfo {
    pub name: String,
    pub path: String,
    pub is_open: bool,
    pub node_count: usize,
    pub edge_count: usize,
}

#[derive(Serialize, Deserialize)]
pub struct DbStats {
    pub node_count: usize,
    pub edge_count: usize,
}

#[tauri::command]
pub fn db_create(
    state: tauri::State<AppState>,
    name: String,
    path: String,
) -> Result<String, String> {
    let db = nexus_db::embedded::database::Database::open(&path).map_err(|e| e.to_string())?;
    let mut dbs = state.databases.lock().map_err(|e| e.to_string())?;
    dbs.insert(name.clone(), Arc::new(db));
    Ok(format!("Database '{}' created at {}", name, path))
}

#[tauri::command]
pub fn db_open(
    state: tauri::State<AppState>,
    name: String,
    path: String,
) -> Result<String, String> {
    let db = nexus_db::embedded::database::Database::open(&path).map_err(|e| e.to_string())?;
    let mut dbs = state.databases.lock().map_err(|e| e.to_string())?;
    dbs.insert(name.clone(), Arc::new(db));
    Ok(format!("Database '{}' opened", name))
}

#[tauri::command]
pub fn db_close(state: tauri::State<AppState>, name: String) -> Result<String, String> {
    let mut dbs = state.databases.lock().map_err(|e| e.to_string())?;
    if dbs.remove(&name).is_some() {
        Ok(format!("Database '{}' closed", name))
    } else {
        Err(format!("Database '{}' not found", name))
    }
}

#[tauri::command]
pub fn db_list(state: tauri::State<AppState>) -> Result<Vec<String>, String> {
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    Ok(dbs.keys().cloned().collect())
}

#[tauri::command]
pub fn db_stats(state: tauri::State<AppState>, name: String) -> Result<DbStats, String> {
    let dbs = state.databases.lock().map_err(|e| e.to_string())?;
    let db = dbs
        .get(&name)
        .ok_or_else(|| format!("Database '{}' not found", name))?;
    let tx = db.read_transaction().map_err(|e| e.to_string())?;
    let nodes = tx.scan_nodes().map_err(|e| e.to_string())?;
    let edges = tx.scan_edges().map_err(|e| e.to_string())?;
    Ok(DbStats {
        node_count: nodes.len(),
        edge_count: edges.len(),
    })
}
