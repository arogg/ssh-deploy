/**
 * @ignore
 */
export interface DeployServerOptions {
    installDir: string;
    packFileName: string;
    startFile: string;
}

export interface Script {
    /**
     * The command to run
     */
    command: string;
    /**
     * Do not wait for the command to finish
     */
    async?: boolean;
}

/**
 * Define scripts to run at different stages of the deployment process.
 */
export interface Scripts {
    /**
     * Run just before the old deployment is removed. The scripts current working directory is the deployment directory location. Could e.g. be used to stop a webserver.
     */
    beforeRemove?: string | Script;
    /**
     * Run in a directory before it is deployed to the final deployment location. This script is run for every deployment before any other scripts in the {@link Scripts} object are run. Could e.g. be used to install npm modules.
     */
    beforeDeploy?: string | Script;
    /**
     * Run in the deployment directory, after the directory has been moved to it's final deployment location. Could e.g. be used to start an express server (with the {@link Script#async} option)
     */
    afterDeploy?: string | Script;
}

/**
 * @ignore
 */
export interface DeployFolderRemoteOptions {
    /**
     * The directory on the server to deploy to
     */
    deployPath: string;
    /**
     * Define scripts that will run at different stages of the deployment process.
     */
    scripts?: Scripts;
}

/**
 * @ignore
 */
export interface DeployFolderNameRemoteOptions extends DeployFolderRemoteOptions {
    packFileName: string;
}