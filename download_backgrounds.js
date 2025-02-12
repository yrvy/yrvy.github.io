const https = require('https');
const fs = require('fs');
const path = require('path');

const backgrounds = [
  {
    id: 'neon-city',
    url: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=1200&q=80',
  },
  {
    id: 'cozy-room',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
  },
  {
    id: 'space-station',
    url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80',
  },
  {
    id: 'enchanted-forest',
    url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&q=80',
  },
  {
    id: 'cyberpunk',
    url: 'https://images.unsplash.com/photo-1515705576963-95cad62945b6?w=1200&q=80',
  }
];

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filename);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filename, () => reject(err));
      });
    }).on('error', reject);
  });
};

async function downloadBackgrounds() {
  const dir = path.join(__dirname, 'public', 'backgrounds');
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  for (const bg of backgrounds) {
    const filename = path.join(dir, `${bg.id}.jpg`);
    console.log(`Downloading ${bg.id}...`);
    try {
      await downloadImage(bg.url, filename);
      console.log(`Downloaded ${bg.id}`);
    } catch (error) {
      console.error(`Error downloading ${bg.id}:`, error);
    }
  }
}

downloadBackgrounds().then(() => {
  console.log('All downloads completed');
}).catch(console.error); 