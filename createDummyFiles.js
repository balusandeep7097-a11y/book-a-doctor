const fs = require('fs');
const path = require('path');

// 1x1 PNG transparent pixel hex representation
const pngHex = '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c63000100000500010d0a2db40000000049454e44ae426082';
const pngBuffer = Buffer.from(pngHex, 'hex');

fs.writeFileSync(path.join(__dirname, 'report.png'), pngBuffer);
console.log('Dummy report.png created successfully!');
