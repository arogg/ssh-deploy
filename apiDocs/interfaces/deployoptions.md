[API Documentation](../README.md) > [DeployOptions](../interfaces/deployoptions.md)

# Interface: DeployOptions

Options for the deployment

## Hierarchy

**DeployOptions**

## Index

### Properties

* [deploy](deployoptions.md#deploy)
* [host](deployoptions.md#host)
* [password](deployoptions.md#password)
* [port](deployoptions.md#port)
* [privateKey](deployoptions.md#privatekey)
* [username](deployoptions.md#username)

---

## Properties

<a id="deploy"></a>

###  deploy

**● deploy**: * [DeployFolder](deployfolder.md) &#124; [DeployFolder](deployfolder.md)[]
*

*Defined in dist/index.d.ts:38*

One a more folders to deploy. If an array is specified, the deployments and script executions will take place in the corresponding order

___
<a id="host"></a>

###  host

**● host**: *`string`*

*Defined in dist/index.d.ts:18*

The host to deploy to, e.g. example.com

___
<a id="password"></a>

### `<Optional>` password

**● password**: * `undefined` &#124; `string`
*

*Defined in dist/index.d.ts:34*

The password to use for SSH authentication, if a private key is not provided

___
<a id="port"></a>

### `<Optional>` port

**● port**: * `undefined` &#124; `number`
*

*Defined in dist/index.d.ts:22*

A custom SSH port. If not provided, the standard SSH port (22) will be used

___
<a id="privatekey"></a>

### `<Optional>` privateKey

**● privateKey**: * `undefined` &#124; `string`
*

*Defined in dist/index.d.ts:26*

The private key (contents, not path) to be used for SSH authentication. Will take precedence over provided username/password

___
<a id="username"></a>

### `<Optional>` username

**● username**: * `undefined` &#124; `string`
*

*Defined in dist/index.d.ts:30*

The username to use for SSH authentication, if a private key is not provided

___

