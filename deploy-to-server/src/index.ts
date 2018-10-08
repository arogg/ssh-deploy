import { execSync, StdioOptions, ExecSyncOptions, SpawnOptions, spawn, spawnSync } from "child_process";
import * as path from 'path';
import * as fs from 'fs-extra';
import * as util from 'util';
import * as rimraf from 'rimraf';
import * as zlib from 'zlib';
import * as tar from 'tar';
import { v4 as uuid } from 'uuid';
import { DeployFolderNameRemoteOptions, Scripts, Script } from "./deployServerOptions";
import * as lockFile from 'lockfile';

process.on('unhandledRejection', (reason, p) => {
    throw reason;
});

const rimrafPromise = util.promisify(rimraf);
const lockFileLock = util.promisify(lockFile.lock);
const lockFileUnlock = util.promisify(lockFile.unlock);

function runScript(_script: string | Script, options: ExecSyncOptions | SpawnOptions) {
    _script = typeof _script === 'string' ? { command: _script } : _script;
    const { command, async } = _script;
    if (!async) {
        execSync(command, options as ExecSyncOptions);
    } else {
        const parts = command.split(' ');
        const child = spawn(parts[0], parts.slice(1), {
            ...options as SpawnOptions,
            detached: true
        });
        child.unref();
    }
}

async function install(options: DeployFolderNameRemoteOptions[]) {
    const remoteTmp = path.resolve(__dirname, '..', '..');
    const remoteTmps = path.resolve(remoteTmp, '..');
    const lockFile = path.join(remoteTmps, '.lockfile');

    await lockFileLock(lockFile);

    if (!await fs.pathExists(path.join(remoteTmps, 'package.json'))) {
        execSync('npm init -y && npm i -D rimraf', { cwd: remoteTmps });
    }

    await lockFileUnlock(lockFile);

    const tmpDir = path.join(__dirname, '.tmp', uuid());
    await fs.mkdirp(tmpDir);

    const prepDir = path.join(tmpDir, 'prepare');
    await fs.mkdir(prepDir);

    const removedInstalls = path.join(tmpDir, 'removedInstalls');
    await fs.mkdir(removedInstalls);

    const inheritStdio: StdioOptions = ['ignore', 'inherit', 'inherit'];

    for (const { packFileName, scripts: _scripts } of options) {
        const { beforeDeploy } = _scripts || {} as Scripts;
        const packFile = path.join(remoteTmp, 'packages', packFileName);
        const prepSubDir = path.join(prepDir, packFileName);
        // todo await this:
        fs.createReadStream(packFile)
            .pipe(zlib.createUnzip()) // todo ok?
            .pipe(tar.Parse())
            .on('entry', async entry => {
                const path = entry.path;
                const isDir = 'Directory' === entry.type;
                // needed for npm packed files
                const pathWithOutPackage = /^package[\\/](.*)$/.exec(path)![1];
                const fullPath = path.join(prepSubDir, pathWithOutPackage);
                const directory = isDir ? fullPath : path.dirname(fullPath);
                await fs.mkdirp(directory);
                if (!isDir) { // should really make this an `if (isFile)` check...
                    entry.pipe(fs.createWriteStream(fullPath));
                }
            })

        if (beforeDeploy) {
            runScript(beforeDeploy, {
                cwd: prepSubDir,
                stdio: inheritStdio
            });
        }
    }

    for (const { packFileName, deployPath, scripts: _scripts } of options) {

        const { afterDeploy, beforeRemove } = _scripts || {} as Scripts;
        const prepSubDir = path.join(prepDir, packFileName);

        if (await fs.pathExists(deployPath)) {
            if (beforeRemove) {
                runScript(beforeRemove, {
                    cwd: deployPath,
                    stdio: inheritStdio
                })
            }

            await fs.move(deployPath, path.join(removedInstalls, packFileName));
        }

        await fs.move(prepSubDir, deployPath);

        if (afterDeploy) {
            runScript(afterDeploy, {
                cwd: deployPath,
                stdio: inheritStdio
            })
        }
    }

    await rimrafPromise(tmpDir);

    // cleanup
    setTimeout(() => {
        const which = require('npm-which')(remoteTmps);
        const rimrafBin = which.sync('rimraf');
        spawn(rimrafBin, [remoteTmp], { detached: true }).unref();
    }, 300); // timeout because we are deleting the directory we are in
}

install(require('./options.json'));