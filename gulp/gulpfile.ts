import * as gulp from 'gulp';
import * as fs from 'fs-extra';
import * as path from 'path';

gulp.task('update-readme', async () => {
    const content = (await fs.readFile(path.join('doc', 'usage.js'))).toString().trim();
    const rmPath = path.join('..', 'README.md');
    const md = (await fs.readFile(rmPath)).toString();
    const newContent = md.replace(/^([\s\S]*?\busage\s+```javascript\r?\n)[\s\S]*?(\r?\n```[\s\S]*)/i, (m, before, after) => {
        return before + content + after;
    });
    await fs.writeFile(rmPath, newContent);
});


