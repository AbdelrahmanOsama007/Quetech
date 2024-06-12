const express = require("express");
const sequelize = require("./Config/database");
const User = require("./Models/user");
const userRoutes = require("./Routes/userRoutes");
// const { registerUser, loginUser } = require("./controllers/authController");

const app = express();
app.use(express.json());

app.use("/user", userRoutes);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    // sequelize.sync({ force: true }).then(() => {
    //   console.log("Tables created succcessfully");
    // });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
