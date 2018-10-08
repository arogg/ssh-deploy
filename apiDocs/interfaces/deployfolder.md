[API Documentation](../README.md) > [DeployFolder](../interfaces/deployfolder.md)

# Interface: DeployFolder

Represents a folder to be deployed

## Hierarchy

 `DeployFolderRemoteOptions`

**↳ DeployFolder**

## Index

### Properties

* [deployPath](deployfolder.md#deploypath)
* [localPath](deployfolder.md#localpath)
* [scripts](deployfolder.md#scripts)

---

## Properties

<a id="deploypath"></a>

###  deployPath

**● deployPath**: *`string`*

*Inherited from DeployFolderRemoteOptions.deployPath*

*Defined in deploy-to-server/dist/deployServerOptions.d.ts:43*

The directory on the server to deploy to

___
<a id="localpath"></a>

###  localPath

**● localPath**: *`string`*

*Defined in dist/index.d.ts:9*

The path to the local folder that will be deployed to the server.

___
<a id="scripts"></a>

### `<Optional>` scripts

**● scripts**: *[Scripts](scripts.md)*

*Inherited from DeployFolderRemoteOptions.scripts*

*Defined in deploy-to-server/dist/deployServerOptions.d.ts:47*

Define scripts that will run at different stages of the deployment process.

___

