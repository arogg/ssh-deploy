
#  API Documentation

## Index

### Interfaces

* [DeployFolder](interfaces/deployfolder.md)
* [DeployOptions](interfaces/deployoptions.md)
* [Script](interfaces/script.md)
* [Scripts](interfaces/scripts.md)

### Functions

* [deploy](#deploy)

---

## Functions

<a id="deploy"></a>

###  deploy

▸ **deploy**(options: *[DeployOptions](interfaces/deployoptions.md)*): `Promise`<`void`>

*Defined in dist/index.d.ts:44*

Deploy one or multiple folders via SSH to another location. Customizable with scripts that can be run at different stages of the deployment process.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [DeployOptions](interfaces/deployoptions.md) |  The options for this deployment run |

**Returns:** `Promise`<`void`>

___

