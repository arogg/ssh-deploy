[API Documentation](../README.md) > [Scripts](../interfaces/scripts.md)

# Interface: Scripts

Define scripts to run at different stages of the deployment process.

## Hierarchy

**Scripts**

## Index

### Properties

* [afterDeploy](scripts.md#afterdeploy)
* [beforeDeploy](scripts.md#beforedeploy)
* [beforeRemove](scripts.md#beforeremove)

---

## Properties

<a id="afterdeploy"></a>

### `<Optional>` afterDeploy

**● afterDeploy**: * `string` &#124; [Script](script.md)
*

*Defined in deploy-to-server/dist/deployServerOptions.d.ts:34*

Run in the deployment directory, after the directory has been moved to it's final deployment location. Could e.g. be used to start an express server (with the {@link Script#async} option)

___
<a id="beforedeploy"></a>

### `<Optional>` beforeDeploy

**● beforeDeploy**: * `string` &#124; [Script](script.md)
*

*Defined in deploy-to-server/dist/deployServerOptions.d.ts:30*

Run in a directory before it is deployed to the final deployment location. This script is run for every deployment before any other scripts in the [Scripts](scripts.md) object are run. Could e.g. be used to install npm modules.

___
<a id="beforeremove"></a>

### `<Optional>` beforeRemove

**● beforeRemove**: * `string` &#124; [Script](script.md)
*

*Defined in deploy-to-server/dist/deployServerOptions.d.ts:26*

Run just before the old deployment is removed. The scripts current working directory is the deployment directory location. Could e.g. be used to stop a webserver.

___

