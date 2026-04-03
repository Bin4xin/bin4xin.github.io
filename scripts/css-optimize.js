const { readFileSync, writeFileSync, promises: fsPromises } = require('fs');
const { glob } = require('glob');
const Critters = require('critters');
const path = require('path');

// 自定义读取函数：将绝对路径（以 / 开头）映射到 _site 目录下
const customReadFile = async (filePath) => {
    // 如果路径是绝对路径（以 / 开头），将其转换为相对于项目根目录的路径，并加上 _site 前缀
    if (filePath.startsWith('/')) {
        // 去掉开头的 /，例如 /assets/css/style.css -> assets/css/style.css
        const relativePath = filePath.slice(1);
        const sitePath = path.join('_site', relativePath);
        // 检查文件是否存在
        const fs = require('fs');
        if (fs.existsSync(sitePath)) {
            return fsPromises.readFile(sitePath, 'utf-8');
        } else {
            console.warn(`Custom readFile: ${sitePath} not found, falling back to ${filePath}`);
        }
    }
    // 其他情况（相对路径或 fallback）使用默认行为
    return fsPromises.readFile(filePath, 'utf-8');
};

const critter = new Critters({
    inlineThreshold: 0,   // 内联所有关键 CSS
    minify: true,
    preload: 'media',     // 使用 media="print" onload 异步加载
    base: '_site',        // 相对路径的基准目录
    readFile: customReadFile,  // 注入自定义读取函数
});

(async () => {
    const files = await glob('_site/**/*.html');
    for (const file of files) {
        const html = readFileSync(file, 'utf-8');
        try {
            const result = await critter.process(html);
            writeFileSync(file, result);
            console.log(`Optimized ${file}`);
        } catch (err) {
            console.error(`Failed to optimize ${file}:`, err.message);
            // 可以选择继续或退出
            // process.exit(1);
        }
    }
})();