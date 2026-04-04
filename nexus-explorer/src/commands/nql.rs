use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct NqlRequest {
    pub db_name: String,
    pub query: String,
}

#[derive(Serialize, Deserialize)]
pub struct NqlResult {
    pub success: bool,
    pub message: String,
    pub data: Option<serde_json::Value>,
}

#[tauri::command]
pub fn nql_execute(_db_name: String, _query: String) -> Result<NqlResult, String> {
    // NQL execution requires the full graph engine.
    // Return a stub indicating this for now.
    Ok(NqlResult {
        success: false,
        message: "NQL execution requires the full graph engine. Use Node/Edge CRUD operations in embedded mode.".to_string(),
        data: None,
    })
}
