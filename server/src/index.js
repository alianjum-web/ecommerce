
const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server is now running on http://localhost:${PORT}`)
);
