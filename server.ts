import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("classroom.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS point_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    points INTEGER,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/students", (req, res) => {
    console.log("GET /api/students");
    try {
      const students = db.prepare("SELECT * FROM students ORDER BY points DESC").all();
      
      // For each student, get points per category
      const studentsWithCategories = students.map(student => {
        const categoryPoints = db.prepare(`
          SELECT category, SUM(points) as total 
          FROM point_history 
          WHERE student_id = ? 
          GROUP BY category
        `).all(student.id);
        
        return {
          ...student,
          categoryPoints: categoryPoints.reduce((acc, curr) => {
            acc[curr.category] = curr.total;
            return acc;
          }, {})
        };
      });
      
      res.json(studentsWithCategories);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/students", (req, res) => {
    const { name } = req.body;
    console.log("POST /api/students", name);
    if (!name) return res.status(400).json({ error: "Name is required" });
    try {
      const info = db.prepare("INSERT INTO students (name) VALUES (?)").run(name);
      res.json({ id: info.lastInsertRowid, name, points: 0 });
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/students/:id", (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    console.log("PATCH /api/students", id, name);
    try {
      db.prepare("UPDATE students SET name = ? WHERE id = ?").run(name, id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/students/:id/points", (req, res) => {
    const { id } = req.params;
    const { points, category } = req.body;
    console.log("POST /api/students/:id/points", id, points, category);
    
    try {
      const transaction = db.transaction(() => {
        db.prepare("UPDATE students SET points = points + ? WHERE id = ?").run(points, id);
        db.prepare("INSERT INTO point_history (student_id, points, category) VALUES (?, ?, ?)").run(id, points, category);
      });
      
      transaction();
      const student = db.prepare("SELECT * FROM students WHERE id = ?").get(id);
      res.json(student);
    } catch (error) {
      console.error("Error adding points:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/students/:id", (req, res) => {
    const { id } = req.params;
    console.log("DELETE /api/students", id);
    try {
      db.prepare("DELETE FROM students WHERE id = ?").run(id);
      db.prepare("DELETE FROM point_history WHERE student_id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/stats/categories", (req, res) => {
    console.log("GET /api/stats/categories");
    try {
      const stats = db.prepare(`
        SELECT category, SUM(points) as total 
        FROM point_history 
        GROUP BY category
      `).all();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/reset", (req, res) => {
    console.log("POST /api/reset");
    try {
      const transaction = db.transaction(() => {
        db.prepare("UPDATE students SET points = 0").run();
        db.prepare("DELETE FROM point_history").run();
      });
      transaction();
      console.log("Reset successful");
      res.json({ success: true });
    } catch (error) {
      console.error("Error resetting points:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
