import { execSync, StdioOptions } from "child_process";
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import * as util from 'util';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as rimraf from 'rimraf';
import { DeployFolderRemoteOptions, DeployFolderNameRemoteOptions } from "../deploy-to-server/dist/deployServerOptions";

const client = require('scp2');
const SSH = require('simple-ssh');

const TMP_DIR = path.join(os.tmpdir(), '524d7250-680b-4501-8558-121b5a3c31d1');

const lowlvlClient = new client.Client();
lowlvlClient.write = util.promisify(lowlvlClient.write);
client.scp = util.promisify(client.scp);
const rimrafPromise = util.promisify(rimraf);

/**
 * Represents a folder to be deployed
 */
export interface DeployFolder extends DeployFolderRemoteOptions {
    /**
     * The path to the local folder that will be deployed to the server.
     */
    localPath: string;
}

/**
 * Options for the deployment
 */
export interface DeployOptions {
    /**
     * The host to deploy to, e.g. example.com
     */
    host: string;
    /**
     * A custom SSH port. If not provided, the standard SSH port (22) will be used
     */
    port?: number;
    /**
     * The private key (contents, not path) to be used for SSH authentication. Will take precedence over provided username/password
     */
    privateKey?: string;
    /**
     * The username to use for SSH authentication, if a private key is not provided
     */
    username?: string;
    /**
     * The password to use for SSH authentication, if a private key is not provided
     */
    password?: string;
    /**
     * One a more folders to deploy. If an array is specified, the deployments and script executions will take place in the corresponding order
     */
    deploy: DeployFolder | DeployFolder[];
}

/**
 * Deploy one or multiple folders via SSH to another location. Customizable with scripts that can be run at different stages of the deployment process.
 * @param options The options for this deployment run
 */
export async function deploy(options: DeployOptions) {
    
    const { host, port, privateKey, username: _username, password: _password, deploy } = options;
    const deploys = Array.isArray(deploy) ? deploy : [deploy];
    const username = privateKey ? undefined : _username;
    const password = privateKey ? undefined : _password;

    async function execRemotelyInheritStdio(cmd: string): Promise<{ stdout: string, stderr: string }> {
        const ssh = new SSH({
            host,
            port,
            key: privateKey,
            user: username,
            pass: password
        });

        let stdout = '';
        let stderr = '';

        await new Promise((resolve, reject) => {
            ssh.exec(cmd, {
                exit: function (code: number) {
                    if (code)
                        return reject('Exit code ' + code);
                    resolve();
                },
                out: (msg: string) => {
                    stdout += msg + '\n';
                    console.log(msg);
                },
                err: (msg: string) => {
                    stderr += msg + '\n';
                    console.error(msg);
                }
            }).start();
        });

        return { stdout, stderr };
    }

    async function copyFilesToRemote(copyFiles: CopyFile[]) {

        const portStr = typeof port === 'undefined' ? '' : `:${port}`;

        for (const { file, remoteRelPathParts } of copyFiles) {
            const dest = serverPath.join(remoteTmp, ...remoteRelPathParts); // todo what about dirs

            await client.scp(
                file,
                `${username}:${password}@${host}${portStr}:${dest}`
            );
        }
    }

    async function writeJSONToRemote(remoteRel: string[], obj: any) {
        const dest = serverPath.join(remoteTmp, ...remoteRel);
        await lowlvlClient.write({
            destination: dest,
            content: Buffer.from(JSON.stringify(obj, null, 4), 'utf8')
        });
    }

    lowlvlClient.defaults({
        port,
        host,
        privateKey,
        username,
        password
    });

    const { stdout } = await execRemotelyInheritStdio('node -e "console.log(require(\'os\').tmpdir())"');
    const rmtOsTmpDir = stdout.trim();
    const serverPath = rmtOsTmpDir.indexOf('\\') !== -1
        ? path.win32 as typeof path
        : path.posix as typeof path;
    const tmpId = uuid();
    const remoteTmps = serverPath.join(rmtOsTmpDir, '844dd78c-3e85-45f3-bbf8-f04118c0e55d');
    const remoteTmp = serverPath.join(remoteTmps, tmpId);
    /**
     * Directory structure of remoteTmps:
     * - <guid 1>/
     * ...
     * - <guid N>/
     *   - packages/<tgz files...> // npm packed files copied to server via SSH
     *   - deploy-to-server/
     *     - package.json
     *     - package-lock.json
     *     - dist/
     *       - index.js // executed via SSH on server
     *       - <other project files..)
     *       - .tmp/
     *         - prepare/ // before deployment will prepare deployments here
     *         - removedInstalls/ // removed old deployments that have been replaced by new deployments
     *     - node_modules/
     */

    const inheritStdio: StdioOptions = ['ignore', 'inherit', 'inherit'];

    interface CopyFile {
        file: string;
        remoteRelPathParts: string[];
    }

    const tmpPackFiles = path.join(TMP_DIR, uuid());
    const copyFiles: CopyFile[] = [];
    const remoteOptions: DeployFolderNameRemoteOptions[] = [];

    // pack all deployments
    for (const { localPath, ...deployOptions } of deploys) {

        let result;
        try {
            result = execSync(`npm pack "${localPath}"`, { stdio: inheritStdio, cwd: tmpPackFiles }).toString();
        } catch (e) {
            throw new Error(`Error running 'npm pack' on project directory '${localPath}'`); // todo own error and pass inner ex
        }
        const lines = result.split('\n');
        const packFileName = lines[lines.length - 1].trim();

        copyFiles.push({
            file: path.join(tmpPackFiles, packFileName),
            remoteRelPathParts: ['packages', packFileName]
        });

        remoteOptions.push({
            packFileName,
            ...deployOptions
        })
    }

    const dplyDir = path.resolve(__dirname, '..', 'deploy-to-server');

    copyFiles.push({
        file: path.join(dplyDir, 'dist'),
        remoteRelPathParts: ['deploy-to-server', 'dist']
    });

    ['package.json', 'package-lock.json'].forEach(f => {
        copyFiles.push({
            file: path.resolve(dplyDir, f),
            remoteRelPathParts: ['deploy-to-server', f]
        });
    })

    // copy deployments and options for server node program to server
    await copyFilesToRemote(copyFiles);
    await writeJSONToRemote(['deploy-to-server', 'dist', 'options.json'], remoteOptions);
    lowlvlClient.close();

    await rimrafPromise(tmpPackFiles);

    // run remote node deployment program and do npm i for it
    await execRemotelyInheritStdio(`cd "${serverPath.join(remoteTmp, 'deploy-to-server')}" && npm i --production && cd dist && node index.js`);
}
