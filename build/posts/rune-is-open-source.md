---
title: Rune is now open source
date: 2026-11-01
order: 1
category: Security
cover: rune
service: backend
summary: Our secrets manager is public under Apache 2.0. Why we built it, how it keeps secrets safe, and how to try it in five minutes.
---
Rune, the secrets manager we've been building, is now open source under the Apache 2.0 license. The first release candidate, **v1.0.0-RC**, is on [GitHub](https://github.com/runelock-io/rune), and the [Rune website](https://hyphen-ani.github.io/rune-web/) has the docs and a demo that runs in your browser.

This post explains why we built it, how it protects what you put in it, and where its limits are today.

## Why we built Rune

Almost every team we work with has the same problem. Database passwords live in `.env` files. API keys get pasted into chat to unblock someone. CI variables collect values nobody remembers adding. When someone leaves, nobody is sure which keys they had.

Large secrets platforms solve this, but they come with clusters to run, policies to learn and an operations burden that a small team can't justify. So the secrets stay where they are.

We wanted something in between: a tool a developer can install in a few minutes, that is still strict about the things that matter. Rune's own tagline says it best: *secrets management, without the ceremony.*

## What it does

Rune stores secrets encrypted, keeps them sealed until you decide otherwise, and hands them only to the tokens you allow. Release 1.0.0-RC includes:

- **Encrypted secrets** with create, read, update and delete from the CLI, web UI or HTTP API.
- **Seal and unseal**, so a stopped or sealed vault reveals nothing.
- **Namespaces** to keep production, staging and individual services apart.
- **Token RBAC** with read, write, delete and rotate permissions per namespace, plus token expiry.
- **Rotation**, manual or automated, with every version kept.
- **Audit logging** of every action, including the ones that were denied.
- **App and service identities**, and a **Spring Boot starter** for Java services.

## How it keeps secrets safe

A secrets tool is only as good as its security model, so here is Rune's in plain terms.

**Sealed by default.** When the server starts, the vault is sealed. Unsealing derives the vault key from your passphrase and a random per-vault salt. The passphrase is never stored; Rune checks it by decrypting a known record. The key lives only in memory, and sealing the vault or restarting the server wipes it.

**Encrypted at the record.** Every secret is encrypted with AES-256-GCM using a fresh random nonce on every write. Secret values in the database file on disk are stored only as ciphertext.

**Least privilege.** Tokens are 32 random bytes, shown once when created. Rune stores only their SHA-256 hash, so a copy of the database doesn't give anyone working tokens. Each token gets specific permissions in specific namespaces, and revoking one takes effect immediately.

**A history you can trust.** Each rotation keeps an encrypted version you can read back, and every request is logged with the time, actor, action, target and result.

> Encryption at rest protects stored secrets. It does not protect a machine that is already compromised while the vault is unsealed. No secrets tool can, so treat the host running Rune as sensitive.

## Try it in five minutes

Rune ships as two binaries, `rune-server` and the `rune` CLI, for macOS and Linux on amd64 and arm64. The install script downloads the release and moves both binaries into `/usr/local/bin`. It uses `sudo`, so read it first if that matters to you.

```bash
curl -fsSL https://raw.githubusercontent.com/runelock-io/rune/main/scripts/install.sh | sh
rune --version
```

Start the server. On the first run it asks you to set a passphrase and prints the root token once, so keep it somewhere safe.

```bash
rune-server
```

In a second terminal, log in, unseal and store your first secret:

```bash
rune login <root-token>
rune unseal
rune put db-password 'hunter2-but-longer'
rune get db-password
```

Then do it properly: give production its own namespace and give your service a token that can only read it.

```bash
rune namespace create production
rune put db-password '…' -n production
rune token create payments-api -n production:read
```

## Using it from a Java service

For Spring Boot 3 on Java 17 or later, add the starter:

```xml
<dependency>
  <groupId>io.rune</groupId>
  <artifactId>rune-spring-boot-starter</artifactId>
  <version>0.1.0</version>
</dependency>
```

Point it at your server and namespace:

```properties
rune.url=http://localhost:2710
rune.token=${RUNE_TOKEN}
rune.namespace=production
```

Then read secrets through `RuneClient.getSecret(namespace, key)`. By default the application fails fast at startup if Rune can't be reached, which is usually what you want.

## What Rune is not, yet

We'd rather you know the limits up front:

- **It's a release candidate.** Try it, break it and tell us. Test it properly before you trust it with production.
- **The server speaks plain HTTP on port 2710.** Run it on localhost or a private network, or put a TLS proxy in front of it.
- **There is no recovery path.** If you lose the passphrase, the secrets are gone. That is deliberate.
- **It runs on one machine.** High availability, remote storage and dynamic secrets are on the roadmap. Next up are Kubernetes secret mapping, an automatic secrets injector, secret rollback and rotation policies.

## Get involved

The code is on [GitHub](https://github.com/runelock-io/rune), the [docs](https://hyphen-ani.github.io/rune-web/docs.html) cover the CLI and HTTP API in detail, and [issues](https://github.com/runelock-io/rune/issues) are open for bugs and ideas.

If you'd like help introducing proper secrets management to your platform, with Rune or with something else, [talk to us](../contact.html).
