import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent set to 'aistudio-build' for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Chat API Route proxying Gemini requests safely server-side
app.post("/api/chat", async (req: express.Request, res: express.Response) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Reconstruct chat with previous history if exists
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `You are the EcoClean Smart City Coordinator, an advanced AI waste management assistant.
Your goal is to guide citizens and administrators on how to keep the city clean and operate the EcoClean system.

When answering, adopt a highly helpful, eco-conscious, and futuristic tone. 
Keep answers concise, actionable, and visual.
- Segregation: Explain that plastics and recycling go to 'Plastic', food/plants go to 'Organic', electronics go to 'E-Waste', chemicals/batteries go to 'Hazardous', and mixed waste goes to 'General'.
- Lodging reports: Explain that citizens can use the "Report an Issue" / "Lodge Incident" form to pinpoint waste coordinates, select categories, optionally drag/drop photos, and view automated routing to the relevant department.
- Real-Time Fleet Tracking: Explain that the Eco-Command dispatching terminal triggers smart fleet dispatch. Emptied bins are reset to 10% capacity.
- Green Points (GP): Explain how citizens earn 50 GP per report, and extra rewards for joining clean-up campaigns on the Cooperation Hub!`,
      },
      history: history || []
    });

    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI response" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve Vite dev server or static distribution files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
