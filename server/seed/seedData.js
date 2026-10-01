const { loadAndSeedDataset } = require("./datasetLoader");

/**
 * Seed Entrypoint: Ingests the Kaggle DataCo Supply Chain & Telematics Dataset
 * from /server/data into MongoDB Atlas.
 */
loadAndSeedDataset()
  .then((res) => {
    console.log(`\n======================================================`);
    console.log(`[Seeder] Dataset Ingestion Complete!`);
    console.log(`[Seeder] Source: ${res.metadata.source} (${res.metadata.datasetName})`);
    console.log(`[Seeder] Ingested ${res.shipmentsCount} Shipments across commercial trade lanes.`);
    console.log(`[Seeder] Ingested ${res.vehiclesCount} Fleet Assets with live GPS telemetry.`);
    console.log(`[Seeder] Ingested ${res.driversCount} Verified Commercial Drivers.`);
    console.log(`======================================================\n`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("[Seeder] Error loading dataset:", err);
    process.exit(1);
  });
