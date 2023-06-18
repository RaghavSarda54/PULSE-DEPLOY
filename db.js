const mongoose = require("mongoose");
const mongoURL =
  "mongodb+srv://raghavsarda7023597686:34ZUQizniWC8VTI4@cluster0.syieetd.mongodb.net/Coordinates?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit the process with a failure
  }
};

module.exports = connectDB;
