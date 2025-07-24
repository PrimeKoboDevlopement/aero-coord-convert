#!/usr/bin/env node

const readline = require('readline');

function toDMS(decimal, type = 'lat') {
  const dir = decimal < 0
    ? (type === 'lat' ? 'S' : 'W')
    : (type === 'lat' ? 'N' : 'E');
  decimal = Math.abs(decimal);
  const deg = Math.floor(decimal);
  const minFloat = (decimal - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = ((minFloat - min) * 60).toFixed(3);
  return `${deg}° ${min}′ ${sec}″ ${dir}`;
}

function toCompactDMS(decimal, type = 'lat') {
  const dir = decimal < 0
    ? (type === 'lat' ? 'S' : 'W')
    : (type === 'lat' ? 'N' : 'E');
  decimal = Math.abs(decimal);
  const deg = Math.floor(decimal);
  const minFloat = (decimal - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.round((minFloat - min) * 60);
  return `${String(deg).padStart(2, '0')}${String(min).padStart(2, '0')}${String(sec).padStart(2, '0')}${dir}`;
}

function parseDecimal(str) {
  const [lat, lon] = str.split(',').map(s => parseFloat(s.trim()));
  if (isNaN(lat) || isNaN(lon)) throw new Error('Invalid decimal input');
  return { lat, lon };
}

function parseDMS(str) {
  const dmsRegex = /(\d+)°\s*(\d+)[′']\s*([\d.]+)[″"]?\s*([NSEW])/;
  const match = str.match(dmsRegex);
  if (!match) throw new Error(`Invalid DMS: ${str}`);
  const [, deg, min, sec, dir] = match;
  let dec = +deg + +min / 60 + +sec / 3600;
  if (dir === 'S' || dir === 'W') dec *= -1;
  return dec;
}

function parseCompactDMS(str) {
  const match = str.match(/^(\d{2})(\d{2})(\d{2})([NSWE])$/);
  if (!match) throw new Error(`Invalid Compact DMS: ${str}`);
  const [, deg, min, sec, dir] = match;
  let dec = +deg + +min / 60 + +sec / 3600;
  if (dir === 'S' || dir === 'W') dec *= -1;
  return dec;
}

// Format selector
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("座標を入力してください（例：34° 01′ 59.740″ N、または 354555N、または 34.03,-118.81）:\n> ", input => {
  let lat, lon;
  try {
    if (input.includes(',') && input.includes('.')) {
      ({ lat, lon } = parseDecimal(input));
    } else if (input.match(/[°′″]/)) {
      lat = parseDMS(input);
      rl.question("経度も同様にDMS形式で入力してください:\n> ", input2 => {
        lon = parseDMS(input2);
        askFormat(lat, lon);
      });
      return;
    } else if (input.match(/^\d{6}[NS]/)) {
      lat = parseCompactDMS(input);
      rl.question("経度も同様にCompact形式で入力してください（例：1402308E）:\n> ", input2 => {
        lon = parseCompactDMS(input2);
        askFormat(lat, lon);
      });
      return;
    } else {
      throw new Error("形式が不明です。");
    }
    askFormat(lat, lon);
  } catch (e) {
    console.error(e.message);
    rl.close();
  }
});

function askFormat(lat, lon) {
  console.log(`\n入力された座標（10進）: ${lat}, ${lon}\n`);
  rl.question("どの形式に変換しますか？（decimal/dms/compact/all）:\n> ", fmt => {
    fmt = fmt.trim().toLowerCase();
    switch (fmt) {
      case 'decimal':
        console.log(`Decimal: ${lat.toFixed(6)}, ${lon.toFixed(6)}`);
        break;
      case 'dms':
        console.log(`DMS: ${toDMS(lat, 'lat')}, ${toDMS(lon, 'lon')}`);
        break;
      case 'compact':
        console.log(`Compact: ${toCompactDMS(lat, 'lat')}, ${toCompactDMS(lon, 'lon')}`);
        break;
      case 'all':
        console.log(`Decimal: ${lat.toFixed(6)}, ${lon.toFixed(6)}`);
        console.log(`DMS: ${toDMS(lat, 'lat')}, ${toDMS(lon, 'lon')}`);
        console.log(`Compact: ${toCompactDMS(lat, 'lat')}, ${toCompactDMS(lon, 'lon')}`);
        break;
      default:
        console.log("無効な選択です");
    }
    rl.close();
  });
}
