#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use nexus_db::embedded::database::Database;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// App state: manages multiple open databases
pub struct AppState {
    pub databases: Mutex<HashMap<String, Arc<Database>>>, // name -> Database
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(AppState {
            databases: Mutex::new(HashMap::new()),
        })
        .invoke_handler(tauri::generate_handler![
            // Database lifecycle
            commands::db_create,
            commands::db_open,
            commands::db_close,
            commands::db_list,
            commands::db_stats,
            // Node CRUD
            commands::node_create,
            commands::node_get,
            commands::node_update,
            commands::node_delete,
            commands::node_list,
            // Edge CRUD
            commands::edge_create,
            commands::edge_get,
            commands::edge_update,
            commands::edge_delete,
            commands::edge_list,
            // Schema
            commands::schema_get,
            // NQL
            commands::nql_execute,
        ])
        .run(tauri::generate_context!())
        .expect("error while running NexusDB Explorer");
}
