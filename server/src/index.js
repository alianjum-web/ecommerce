import './config/env.js'; // Load environment first
import connectDB from './db/index.js';
import { app } from './app.js';

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`⚙️ Server is running at port : ${PORT}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err);
    process.exit(1);
  }
};

startServer();