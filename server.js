const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// ------------------------
// HOME PAGE TEST ROUTE
// ------------------------
app.get("/", (req, res) => {
    res.send("Server is running...");
});

// Load JSON data
function loadData() {
    return JSON.parse(fs.readFileSync("data.json", "utf-8"));
}

// Save JSON data
function saveData(data) {
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}

// ------------------------
// LOGIN API
// ------------------------
app.post("/login", (req, res) => {
    let db = loadData();
    let { username, password } = req.body;

    let user = db.users.find(u => u.username === username && u.password === password);

    if (user) {
        res.send({ success: true, message: "Login successful" });
    } else {
        res.send({ success: false, message: "Invalid credentials" });
    }
});

// ------------------------
// GET SWEETS
// ------------------------
app.get("/sweets", (req, res) => {
    let db = loadData();
    res.send(db.sweets);
});

// ------------------------
// PLACE ORDER
// ------------------------
app.post("/order", (req, res) => {
    let db = loadData();
    
    db.orders.push({
        id: db.orders.length + 1,
        items: req.body.items,
        time: new Date()
    });

    saveData(db);

    res.send({ success: true, message: "Order placed successfully" });
});

// ------------------------
// START SERVER
// ------------------------
app.listen(5000, () => {
    console.log("Backend running on http://localhost:5000");
});

