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