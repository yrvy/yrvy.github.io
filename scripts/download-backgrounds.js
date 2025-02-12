import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const images = {
  'cozy-room.jpg': 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0',
  'neon-city.jpg': 'https://images.unsplash.com/photo-1545147986-a9d6f2ab03b5',
  'lofi-cafe.jpg': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
  'retro-arcade.jpg': 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
  'night-sky.jpg': 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e',
  'jazz-club.jpg': 'https://images.unsplash.com/photo-1511192336575-5a79af67a629'
};

const downloadImage = (url, filename) => {
  const dir = path.join(__dirname, '../public/backgrounds');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filepath = path.join(dir, filename);
  const file = fs.createWriteStream(filepath);

  https.get(url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${filename}`);
    });
  }).on('error', err => {
    fs.unlink(filepath);
    console.error(`Error downloading ${filename}:`, err.message);
  });
};

Object.entries(images).forEach(([filename, url]) => {
  downloadImage(url, filename);
}); 