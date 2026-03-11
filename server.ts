import express from "express";
import { createServer as createViteServer } from "vite";
import { YoutubeTranscript } from 'youtube-transcript';
import he from 'he';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/transcript", async (req, res) => {
    const { url, language } = req.body;

    if (!url) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    try {
      // Extract video ID from URL
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const videoIdMatch = url.match(regex);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (!videoId) {
        return res.status(400).json({ error: "Could not extract Video ID from URL. Please provide a valid YouTube URL." });
      }

      console.log(`Fetching transcript for video: ${videoId}`);
      
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: language || 'en'
      });

      // Combine transcript items and decode HTML entities
      const fullTranscript = transcriptItems
        .map(item => he.decode(item.text))
        .join(' ');

      res.json({ 
        transcript: fullTranscript,
        videoId: videoId
      });
    } catch (error: any) {
      console.error("Transcript error:", error);
      res.status(500).json({ 
        error: "Failed to fetch transcript. The video might not have captions available for the selected language.",
        details: error.message 
      });
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
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
