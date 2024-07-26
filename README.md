# Setup

Make sure you have nix installed on your system:
https://nixos.org/download.html

To install ansible/pulumi/sops and related tooling use:

```sh
nix-shell env.nix
```

# Overview

This repo provisions the infrastructer needed to manage pulumi state within AWS (replacing pulumi cloud).This repo specifically is managed by pulumi cloud (to prevent a circular dependency)

## How to connect a pulumi project

Put the s3 backend as the pulumi backend in your url.
Example `Pulumi.yaml`

```yml
name: mycoolproject
runtime: nodejs
description: mycoolproject is very cool
backend:
  url: s3://pulumi-state-pulumi-state1231231231231231231231/mycoolproject/staging?region=eu-central-1&awssdk=v3
```

For each config/stack put the kms url as the secret provider:

```yml
secretsprovider: awskms:///arn:aws:kms:eu-central-1:123123123123:key/123123-123123-123123123-123123-123123123
encryptedkey: blaasdlasldasldalsdalsdlasdlasdl
config:
  aws:allowedAccountIds:
    - "123123123"
```

## Pulumi

Select a stack to edit

```sh
pulumi stack select
```

Then after changing the code you can preview changes with

```sh
pulumi preview
```

and when you want to roll out your changes run

```sh
pulumi up
```

# Lint

## prettier

We use prettier for formatting on the whole codebase:

```
npm run lint
```

to format all docs:

```
npm run format
```
