import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Initialize SQLite Database
const db = new Database("railway.db");

// Setup Database Schema
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    code TEXT UNIQUE,
    lat REAL,
    lng REAL
  );

  CREATE TABLE IF NOT EXISTS trains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    number TEXT UNIQUE,
    type TEXT
  );

  CREATE TABLE IF NOT EXISTS train_stops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_id INTEGER,
    station_id INTEGER,
    arrival_time TEXT,
    departure_time TEXT,
    stop_order INTEGER,
    FOREIGN KEY(train_id) REFERENCES trains(id) ON DELETE CASCADE,
    FOREIGN KEY(station_id) REFERENCES stations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS fares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_station_id INTEGER,
    to_station_id INTEGER,
    train_type TEXT,
    class TEXT,
    amount REAL,
    FOREIGN KEY(from_station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY(to_station_id) REFERENCES stations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS opinions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Admin User
const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!adminExists) {
  const hash = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("admin", hash);
}

// Seed Initial Data (if empty)
const stationCount = db.prepare("SELECT COUNT(*) as count FROM stations").get() as { count: number };
if (stationCount.count === 0) {
  const insertStation = db.prepare("INSERT INTO stations (name, code, lat, lng) VALUES (?, ?, ?, ?)");
  insertStation.run("Dhaka", "DA", 23.8103, 90.4125);
  insertStation.run("Chattogram", "CG", 22.3569, 91.7832);
  insertStation.run("Sylhet", "SY", 24.8949, 91.8687);
  insertStation.run("Rajshahi", "RJ", 24.3636, 88.6241);
  insertStation.run("Khulna", "KL", 22.8456, 89.5403);
  insertStation.run("Cumilla", "CU", 23.4607, 91.1809);

  const insertTrain = db.prepare("INSERT INTO trains (name, number, type) VALUES (?, ?, ?)");
  insertTrain.run("Subarna Express", "701", "Intercity");
  insertTrain.run("Parabat Express", "709", "Intercity");
  insertTrain.run("Silk City Express", "715", "Intercity");

  const insertStop = db.prepare("INSERT INTO train_stops (train_id, station_id, arrival_time, departure_time, stop_order) VALUES (?, ?, ?, ?, ?)");
  // Subarna (Dhaka to Chattogram)
  insertStop.run(1, 1, "15:00", "15:00", 1);
  insertStop.run(1, 6, "17:30", "17:35", 2);
  insertStop.run(1, 2, "20:30", "20:30", 3);

  // Parabat (Dhaka to Sylhet)
  insertStop.run(2, 1, "06:20", "06:20", 1);
  insertStop.run(2, 3, "13:00", "13:00", 2);

  const insertFare = db.prepare("INSERT INTO fares (from_station_id, to_station_id, train_type, class, amount) VALUES (?, ?, ?, ?, ?)");
  insertFare.run(1, 2, "Intercity", "Shuvon", 345);
  insertFare.run(1, 2, "Intercity", "AC Chair", 656);
  insertFare.run(1, 3, "Intercity", "Shuvon", 320);
  insertFare.run(1, 3, "Intercity", "AC Chair", 610);
}

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// API Routes
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1d" });
  res.cookie("token", token, { 
    httpOnly: true, 
    secure: true,
    sameSite: "none"
  });
  res.json({ message: "Logged in successfully" });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  res.json({ message: "Logged out successfully" });
});

app.get("/api/auth/me", authenticate, (req: any, res) => {
  res.json({ user: req.user });
});

// Public API
app.get("/api/stations", (req, res) => {
  const stations = db.prepare("SELECT * FROM stations").all();
  res.json(stations);
});

app.get("/api/stations/:id", (req, res) => {
  const station = db.prepare("SELECT * FROM stations WHERE id = ?").get(req.params.id);
  if (!station) return res.status(404).json({ error: "Station not found" });
  const trains = db.prepare(`
    SELECT t.id, t.name, t.number, ts.arrival_time, ts.departure_time
    FROM train_stops ts
    JOIN trains t ON ts.train_id = t.id
    WHERE ts.station_id = ?
    ORDER BY ts.arrival_time
  `).all(req.params.id);
  res.json({ ...station, trains });
});

app.get("/api/trains", (req, res) => {
  const trains = db.prepare("SELECT * FROM trains").all();
  res.json(trains);
});

app.get("/api/trains/:id", (req, res) => {
  const train = db.prepare("SELECT * FROM trains WHERE id = ?").get(req.params.id);
  if (!train) return res.status(404).json({ error: "Train not found" });
  const stops = db.prepare(`
    SELECT s.id as station_id, s.name as station_name, s.lat, s.lng, ts.arrival_time, ts.departure_time, ts.stop_order
    FROM train_stops ts
    JOIN stations s ON ts.station_id = s.id
    WHERE ts.train_id = ?
    ORDER BY ts.stop_order
  `).all(req.params.id);
  res.json({ ...train, stops });
});

app.get("/api/fares", (req, res) => {
  const fares = db.prepare(`
    SELECT f.id, s1.name as from_station, s2.name as to_station, f.train_type, f.class, f.amount
    FROM fares f
    JOIN stations s1 ON f.from_station_id = s1.id
    JOIN stations s2 ON f.to_station_id = s2.id
  `).all();
  res.json(fares);
});

app.post("/api/opinions", (req, res) => {
  const { name, email, message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });
  db.prepare("INSERT INTO opinions (name, email, message) VALUES (?, ?, ?)").run(name, email, message);
  res.json({ message: "Opinion submitted successfully" });
});

// Admin API
app.get("/api/admin/opinions", authenticate, (req, res) => {
  const opinions = db.prepare("SELECT * FROM opinions ORDER BY created_at DESC").all();
  res.json(opinions);
});

app.post("/api/admin/stations", authenticate, (req, res) => {
  const { name } = req.body;
  const code = req.body.code || null;
  const lat = req.body.lat || null;
  const lng = req.body.lng || null;
  try {
    const result = db.prepare("INSERT INTO stations (name, code, lat, lng) VALUES (?, ?, ?, ?)").run(name, code, lat, lng);
    res.json({ id: result.lastInsertRowid, name, code, lat, lng });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/admin/stations/:id", authenticate, (req, res) => {
  const { name } = req.body;
  const code = req.body.code || null;
  const lat = req.body.lat || null;
  const lng = req.body.lng || null;
  try {
    db.prepare("UPDATE stations SET name = ?, code = ?, lat = ?, lng = ? WHERE id = ?").run(name, code, lat, lng, req.params.id);
    res.json({ id: req.params.id, name, code, lat, lng });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/admin/stations/:id", authenticate, (req, res) => {
  try {
    db.transaction(() => {
      // Delete related train stops first
      db.prepare("DELETE FROM train_stops WHERE station_id = ?").run(req.params.id);
      // Delete related fares
      db.prepare("DELETE FROM fares WHERE from_station_id = ? OR to_station_id = ?").run(req.params.id, req.params.id);
      // Delete the station
      db.prepare("DELETE FROM stations WHERE id = ?").run(req.params.id);
    })();
    res.json({ message: "Station deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete station" });
  }
});

app.post("/api/admin/trains", authenticate, (req, res) => {
  const { name, number, type } = req.body;
  try {
    const result = db.prepare("INSERT INTO trains (name, number, type) VALUES (?, ?, ?)").run(name, number, type);
    res.json({ id: result.lastInsertRowid, name, number, type });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/admin/trains/:id", authenticate, (req, res) => {
  const { name, number, type } = req.body;
  try {
    db.prepare("UPDATE trains SET name = ?, number = ?, type = ? WHERE id = ?").run(name, number, type, req.params.id);
    res.json({ id: req.params.id, name, number, type });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/admin/trains/:id", authenticate, (req, res) => {
  try {
    db.transaction(() => {
      // Delete related train stops first
      db.prepare("DELETE FROM train_stops WHERE train_id = ?").run(req.params.id);
      // Delete the train
      db.prepare("DELETE FROM trains WHERE id = ?").run(req.params.id);
    })();
    res.json({ message: "Train deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete train" });
  }
});

app.post("/api/admin/fares", authenticate, (req, res) => {
  const { from_station_id, to_station_id, train_type, class: trainClass, amount } = req.body;
  try {
    const result = db.prepare("INSERT INTO fares (from_station_id, to_station_id, train_type, class, amount) VALUES (?, ?, ?, ?, ?)").run(from_station_id, to_station_id, train_type, trainClass, amount);
    res.json({ id: result.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/admin/fares/:id", authenticate, (req, res) => {
  const { from_station_id, to_station_id, train_type, class: trainClass, amount } = req.body;
  try {
    db.prepare("UPDATE fares SET from_station_id = ?, to_station_id = ?, train_type = ?, class = ?, amount = ? WHERE id = ?").run(from_station_id, to_station_id, train_type, trainClass, amount, req.params.id);
    res.json({ id: req.params.id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/admin/fares/:id", authenticate, (req, res) => {
  db.prepare("DELETE FROM fares WHERE id = ?").run(req.params.id);
  res.json({ message: "Fare deleted" });
});

app.get("/api/admin/train_stops", authenticate, (req, res) => {
  const stops = db.prepare(`
    SELECT ts.id, ts.train_id, ts.station_id, t.name as train_name, s.name as station_name, ts.arrival_time, ts.departure_time, ts.stop_order
    FROM train_stops ts
    JOIN trains t ON ts.train_id = t.id
    JOIN stations s ON ts.station_id = s.id
    ORDER BY t.name, ts.stop_order
  `).all();
  res.json(stops);
});

app.post("/api/admin/train_stops", authenticate, (req, res) => {
  const { 
    train_id, new_train_name, new_train_number, new_train_type,
    station_id, new_station_name,
    arrival_time, departure_time, stop_order 
  } = req.body;
  
  try {
    let final_train_id = train_id;
    let final_station_id = station_id;

    db.transaction(() => {
      if (train_id === "new") {
        const trainResult = db.prepare("INSERT INTO trains (name, number, type) VALUES (?, ?, ?)").run(new_train_name, new_train_number, new_train_type);
        final_train_id = trainResult.lastInsertRowid;
      }

      if (station_id === "new") {
        const stationResult = db.prepare("INSERT INTO stations (name) VALUES (?)").run(new_station_name);
        final_station_id = stationResult.lastInsertRowid;
      }

      const result = db.prepare("INSERT INTO train_stops (train_id, station_id, arrival_time, departure_time, stop_order) VALUES (?, ?, ?, ?, ?)").run(final_train_id, final_station_id, arrival_time, departure_time, stop_order);
    })();
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/admin/train_stops/:id", authenticate, (req, res) => {
  const { 
    train_id, new_train_name, new_train_number, new_train_type,
    station_id, new_station_name,
    arrival_time, departure_time, stop_order 
  } = req.body;
  
  try {
    let final_train_id = train_id;
    let final_station_id = station_id;

    db.transaction(() => {
      if (train_id === "new") {
        const trainResult = db.prepare("INSERT INTO trains (name, number, type) VALUES (?, ?, ?)").run(new_train_name, new_train_number, new_train_type);
        final_train_id = trainResult.lastInsertRowid;
      }

      if (station_id === "new") {
        const stationResult = db.prepare("INSERT INTO stations (name) VALUES (?)").run(new_station_name);
        final_station_id = stationResult.lastInsertRowid;
      }

      db.prepare("UPDATE train_stops SET train_id = ?, station_id = ?, arrival_time = ?, departure_time = ?, stop_order = ? WHERE id = ?").run(final_train_id, final_station_id, arrival_time, departure_time, stop_order, req.params.id);
    })();
    
    res.json({ id: req.params.id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/admin/train_stops/:id", authenticate, (req, res) => {
  db.prepare("DELETE FROM train_stops WHERE id = ?").run(req.params.id);
  res.json({ message: "Stop deleted" });
});

app.delete("/api/admin/opinions/:id", authenticate, (req, res) => {
  db.prepare("DELETE FROM opinions WHERE id = ?").run(req.params.id);
  res.json({ message: "Opinion deleted" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
