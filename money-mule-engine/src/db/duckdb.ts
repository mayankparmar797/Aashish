import duckdb from "duckdb";

const DB_PATH = "data/processed/mule-engine.duckdb";

let database: duckdb.Database | null = null;

export function getDatabase(): duckdb.Database {
  if (!database) {
    database = new duckdb.Database(DB_PATH);
  }

  return database;
}

export function closeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!database) {
      resolve();
      return;
    }

    database.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      database = null;
      resolve();
    });
  });
}