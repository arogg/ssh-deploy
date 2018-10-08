# ssh-deploy

Easily deploy your project(s) to a server, and run custom commands on deployment via SSH. Tries to atomically deploy files.

## Usage

```javascript
const { deploy } = require('ssh-deploy');

deploy({
    // the site to update to via SSH
    host: 'my-site.com',
    // optional SSH port
    port: 4242,
    // optional, otherwise specify username/password
    privateKey: require('fs').readFileSync('mykey', 'utf8'),
    deploy: [
        {
            // deploy from
            localPath: '/my/projects/www',
            // to directory on server
            deployPath: '/opt/www'
        },
        {
            // deploy from
            localPath: '/my/projects/webserver',
            // to directory on server
            deployPath: '/opt/webserver',
            scripts: {
                // prepare our installation
                beforeDeploy: 'npm install --production',
                // kill webserver of old installation
                beforeRemove: 'node dist/webserver.js --kill',
                afterDeploy: {
                    // run our new webserver
                    command: 'node dist/webserver.js',
                    // don't wait for this command to finish
                    async: true
                }
            }
        }
    ]
});
```

## Requirements

- SSH enabled on the server
- node installed on the server

## Explanation

- will `npm pack` each directory you want to deploy (according to *npm* and the directory's *package.json* rules) before transferring all the packed files (one per directory to deploy) via SSH to a directory in the OS's temp directory of the server
- will then run a `node` script via SSH in that temp directory
- this script will do the following
    - for each packed file
        - unpack it
        - run the `beforeDeploy` command in the unpacked directory
    - for each unpacked directory
        - if corresponding `deployPath` directory exists (old installation), run `beforeRemove` command in it
        - move old `deployPath` to the temp directory (do not delete it yet, want to deploy as atomically and fast as possible)
        - move the unpacked directory to `deployPath` location
        - run `afterDeploy` command in `deployPath`
    - delete the temp directory (cleanup)


## API

The API documentation can be found [here](apiDocs/README.md).

## Advice

- make sure your package.json files are configured correctly so that any deployments work flawlessly
- use the `async` flag for any commands that will not end on their own (see Usage example)

## TypeScript

Works out of the box with TypeScript.

## License

MIT