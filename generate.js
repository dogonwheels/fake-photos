const Canvas = require('canvas');
const fs = require('fs')
const config = require('./config');

if (!fs.existsSync(config.outputPath)) {
  fs.mkdirSync(config.outputPath);
}

const buckets = {};
const start = new Date(config.start).getTime() / 1000;
const end = new Date(config.end).getTime() / 1000;

let outstanding = 0;
let time = start;

const tick = setInterval(() => {
  if (outstanding > 5) {
    return;
  }

  if (time < end) {
    const date = new Date(time * 1000);
    const year = date.getUTCFullYear();
    const month = date.getMonth() + 1;

    const photos = parseInt((Math.random() < config.cameraChancePerDay) ? (Math.random() + 0.5) * config.averagePhotosPerDay : 0);

    const key = `${year}-${month}`;
    const basePath = config.outputPath + key;

    if (buckets[key] !== undefined) {
      buckets[key] += photos;
    } else {
      console.log(`${key}`);
      buckets[key] = photos;
      if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
      }
    }

    console.log(`  ${date} - ${photos}`);

    for (let photo = 0; photo < photos; photo++) {
      const timeTaken = time + (12 * 60 * 60) + parseInt((Math.random() - 0.5) * (18 * 60 * 60));
      outstanding++;
      createPhoto({
        basePath,
        time: timeTaken,
        portrait: Math.random() < config.portraitChance,
        cropped: Math.random() < config.cropChance
      });
    }

    time += 24 * 60 * 60;
  } else {
    clearInterval(tick);
  }
}, 100);

function createPhoto({ time, portrait, cropped, basePath }) {
  const dimension = Math.ceil(500 + (1000 * Math.random()));
  const otherDimension = Math.ceil(cropped ? dimension * (Math.random() + 0.5) : dimension * 0.66);

  const width = portrait ? otherDimension : dimension;
  const height = portrait ? dimension : otherDimension;
  const text = `${time}\n${width} x ${height}`;
  const clockTime = new Date(time * 1000);

  console.log(`    ${clockTime} ${clockTime.getUTCHours()}:${clockTime.getUTCMinutes()} - ${width} x ${height}`);

  saveImage({
    stream: createRandomImage({ width, height, text }),
    time,
    basePath
  });
}

function createRandomImage({ width, height, text }) {
  const canvas = new Canvas(width, height)
  const ctx = canvas.getContext('2d');

  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);

  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, width, height);

  const size = height / 12;

  ctx.font = `${size}px Lucida Grande`;
  ctx.fillStyle = 'white';
  ctx.textAlign ='center';

  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowOffsetX = size / 20;
  ctx.shadowOffsetY = size / 20;

  ctx.fillText(text, width / 2, height / 2);

  return canvas.jpegStream({ quality: 40 });
}

function saveImage({ stream, time, basePath }) {
  const path = `${basePath}/img_${time}.jpg`
  const out = fs.createWriteStream(path)

  stream.on('data', (chunk) => out.write(chunk));
  stream.on('end', () => { out.end(); });

  out.on('finish', () => { fs.utimes(path , time, time, (result) => {
    console.log(`    ! ${path}`);
    outstanding--;
  }); });
}


