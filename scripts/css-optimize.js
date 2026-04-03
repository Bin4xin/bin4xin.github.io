const { readFileSync, writeFileSync } = require('fs');
const { glob } = require('glob');
// 需要安装 glob: npm install glob
const Critters = require('critters');

const critter = new Critters({
    inlineThreshold: 0,   // 内联所有关键 CSS
    minify: true,
    preload: 'media',     // 使用 media="print" onload 异步加载
});

(async () => {
    const files = await glob('_site/**/*.html');
    for (const file of files) {
        const html = readFileSync(file, 'utf-8');
        const result = await critter.process(html);
        writeFileSync(file, result);
        console.log(`Optimized ${file}`);
    }
})();