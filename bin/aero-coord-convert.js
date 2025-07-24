// File: bin/coord-convert.js
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
  const dmsRegex = /([\d.]+)°\s*([\d.]+)[′']\s*([\d.]+)[″"]?\s*([NSEW])/;
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

function showFormats() {
  console.log(`\n有効な座標入力形式は以下のとおりです:\n`);
  console.log(`  - DMS形式:        34° 01′ 59.740″ N`);
  console.log(`  - Compact形式:    354555N`);
  console.log(`  - 10進形式:       34.03104, -118.81083\n`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askInput(prompt, handler) {
  rl.question(prompt, input => {
    if (input.trim().toLowerCase() === 'exit') return rl.close();
    try {
      handler(input);
    } catch (err) {
      console.log(`\n⚠️ エラー: ${err.message}`);
      showFormats();
      askInput(prompt, handler);
    }
  });
}

console.log(`\n=== 座標変換ユーティリティ ===`);
console.log(`"exit" と入力すると終了します。`);

askInput("\n緯度を入力してください:
> ", latInput => {
  let lat;
  if (latInput.includes(',') && latInput.includes('.')) {
    ({ lat } = parseDecimal(latInput));
    askInput("経度を入力してください:
> ", lonInput => {
      const { lon } = parseDecimal(latInput);
      askFormat(lat, lon);
    });
  } else if (latInput.match(/[°′″]/)) {
    lat = parseDMS(latInput);
    askInput("経度をDMS形式で入力してください:
> ", lonInput => {
      const lon = parseDMS(lonInput);
      askFormat(lat, lon);
    });
  } else if (latInput.match(/^\d{6}[NS]$/)) {
    lat = parseCompactDMS(latInput);
    askInput("経度をCompact形式で入力してください（例：1402308E）:
> ", lonInput => {
      const lon = parseCompactDMS(lonInput);
      askFormat(lat, lon);
    });
  } else {
    throw new Error("入力形式が不明です。");
  }
});

function askFormat(lat, lon) {
  rl.question("\nどの形式に変換しますか？（decimal/dms/compact/all）:
> ", fmt => {
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
