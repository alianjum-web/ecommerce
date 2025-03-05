dotenv.config();
const uri = process.env.MONGODB_URI;
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is now running on http://localhost:${PORT}`));