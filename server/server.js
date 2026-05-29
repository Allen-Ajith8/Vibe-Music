require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');

const app = express();
app.use(cors());

// Configure Google Auth
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'credentials.json'),
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

const AUDIO_ID = process.env.DRIVE_AUDIO_FOLDER_ID;
const IMAGES_ID = process.env.DRIVE_IMAGES_FOLDER_ID;
const LYRICS_ID = process.env.DRIVE_LYRICS_FOLDER_ID;

const mm = require('music-metadata');

// Fetches and matches files across the three folders
app.get('/api/songs', async (req, res) => {
  try {
    if (!AUDIO_ID) return res.status(400).json({ error: 'DRIVE_AUDIO_FOLDER_ID missing' });

    const [audioData, imgData, lrcData] = await Promise.all([
      drive.files.list({ q: `'${AUDIO_ID}' in parents`, fields: 'files(id, name, mimeType, size)' }),
      IMAGES_ID ? drive.files.list({ q: `'${IMAGES_ID}' in parents`, fields: 'files(id, name)' }) : { data: { files: [] } },
      LYRICS_ID ? drive.files.list({ q: `'${LYRICS_ID}' in parents`, fields: 'files(id, name)' }) : { data: { files: [] } }
    ]);

    const images = imgData.data.files || [];
    const lyrics = lrcData.data.files || [];

    const playlist = [];
    const batchSize = 5;
    for (let i = 0; i < audioData.data.files.length; i += batchSize) {
      const batch = audioData.data.files.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(async (audio) => {
        const baseName = audio.name.replace(/\.[^/.]+$/, "").trim();
        
        let artist = "Unknown Artist";
        let cleanTitle = baseName;
        
        if (baseName.includes(" - ")) {
          const parts = baseName.split(" - ");
          artist = parts[0].trim();
          cleanTitle = parts.slice(1).join(" - ").trim();
        }

        try {
          if (audio.mimeType.startsWith('audio/')) {
            const stream = await drive.files.get(
              { fileId: audio.id, alt: 'media' },
              { responseType: 'stream' }
            );
            
            const metadata = await mm.parseStream(stream.data, { mimeType: audio.mimeType }, { skipCovers: true });
            
            if (metadata.common.artist) artist = metadata.common.artist;
            if (metadata.common.title) cleanTitle = metadata.common.title;

            stream.data.destroy();
          }
        } catch (mmError) {
          console.warn(`Metadata extraction failed for ${audio.name}:`, mmError.message);
        }

        const matchedImage = images.find(img => img.name.replace(/\.[^/.]+$/, "").trim() === baseName);
        const matchedLyric = lyrics.find(lrc => lrc.name.replace(/\.[^/.]+$/, "").trim() === baseName);

        return {
          id: audio.id,
          name: audio.name,
          baseName: baseName,
          title: cleanTitle,
          artist: artist,
          mimeType: audio.mimeType,
          imageId: matchedImage ? matchedImage.id : null,
          lyricsId: matchedLyric ? matchedLyric.id : null
        };
      }));
      playlist.push(...batchResults);
    }

    res.json(playlist);
  } catch (error) {
    console.error('Error fetching songs from Drive:', error);
    res.status(500).json({ error: 'Failed to fetch songs from Google Drive.' });
  }
});

// GET /api/play/:id
app.get('/api/play/:id', async (req, res) => {
  try {
    const fileId = req.params.id;

    const metadata = await drive.files.get({
      fileId: fileId,
      fields: 'size, mimeType, name'
    });

    const fileSize = parseInt(metadata.data.size, 10);
    const mimeType = metadata.data.mimeType || 'audio/mpeg';

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    if (req.headers.range) {
      const rangeHeader = req.headers.range;
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      if (end >= fileSize) end = fileSize - 1;
      if (start >= fileSize) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
        return res.end();
      }

      const chunkSize = end - start + 1;

      res.status(206);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunkSize);

      const response = await drive.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'stream', headers: { Range: `bytes=${start}-${end}` } }
      );

      response.data
        .on('error', err => {
          console.error('Error streaming range data:', err);
          if (!res.headersSent) res.sendStatus(500);
        })
        .pipe(res);

    } else {
      res.status(200);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', fileSize);

      const response = await drive.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      response.data
        .on('end', () => console.log(`Done streaming ${fileId}`))
        .on('error', err => {
          console.error('Error streaming data:', err);
          if (!res.headersSent) res.sendStatus(500);
        })
        .pipe(res);
    }

  } catch (error) {
    console.error('Error fetching audio stream:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream audio from Drive.' });
    }
  }
});

// GET /api/image/:id
app.get('/api/image/:id', async (req, res) => {
    try {
        const response = await drive.files.get(
            { fileId: req.params.id, alt: 'media' },
            { responseType: 'stream' }
        );
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        response.data.pipe(res);
    } catch (e) {
        res.status(500).json({ error: 'Image proxy failed' });
    }
});

// GET /api/lyrics/:id
app.get('/api/lyrics/:id', async (req, res) => {
    try {
        const response = await drive.files.get(
            { fileId: req.params.id, alt: 'media' }
        );
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(response.data);
    } catch (e) {
        res.status(500).json({ error: 'Lyrics proxy failed' });
    }
});


// ==========================================
// 🚨 JARVIS REMOTE CONTROL MODULE
// ==========================================

let activeJarvisCommand = null;

// 1. Python Jarvis hits this endpoint to issue a command
app.get('/api/jarvis/play', (req, res) => {
    const songName = req.query.song;
    if (!songName) return res.status(400).json({ error: 'No song specified' });
    
    console.log(`[JARVIS OVERRIDE] Instructing frontend to play: ${songName}`);
    
    // Store the command in memory
    activeJarvisCommand = { 
        action: 'play', 
        targetSong: songName.toLowerCase(), 
        timestamp: Date.now() 
    };
    
    res.status(200).json({ status: "success", message: `Vibe Music will play ${songName}` });
});

// 2. React Frontend polls this endpoint to check for Jarvis commands
app.get('/api/jarvis/poll', (req, res) => {
    if (activeJarvisCommand) {
        // Send the command to React
        const commandToSend = activeJarvisCommand;
        // Clear it so the song doesn't keep restarting forever
        activeJarvisCommand = null; 
        res.json(commandToSend);
    } else {
        res.json({ action: 'none' });
    }
});

// ==========================================

const PORT = 3000;
app.listen(PORT, () => console.log(`🎵 VibeMusic Backend server running on port ${PORT}`));