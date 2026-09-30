const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `[MongoDB] Connected Successfully: ${conn.connection.host}/${conn.connection.name}`
    );
  } catch (error) {
    console.error(`[MongoDB] Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;