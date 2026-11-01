---
title: Plan on every pull request: safer Terraform on AWS with GitHub Actions and OIDC
date: 2026-11-01
order: 3
category: Cloud & DevOps
cover: terraform-aws
service: cloud
summary: Stop applying infrastructure from laptops. A practical setup for reviewed Terraform changes, shared state and AWS access with no stored keys.
---
Most infrastructure incidents don't start with a bad design. They start with a good change applied the wrong way: from someone's laptop, with a long-lived access key, against state that someone else changed an hour earlier.

The fix is a workflow where every change is written as code, reviewed as a plan, and applied by a pipeline that has no stored credentials. This post walks through the setup we use, based on our [AWS infrastructure-as-code lab build](../work/terraform-aws.html).

## The goal

By the end, your team works like this:

1. Someone opens a pull request that changes Terraform code.
2. The pipeline runs `terraform plan` and the reviewer sees exactly what will be created, changed or destroyed.
3. When the pull request is merged, the pipeline applies the change, after an approval for production.
4. Nobody needs AWS keys on their laptop, and the pipeline has none stored either.

## Step 1: put state somewhere shared and locked

Terraform's state file is its memory of what exists. If it lives on a laptop, nobody else can safely change anything. Store it in S3 with versioning and encryption turned on, and use locking so two runs can't write at the same time.

```hcl
terraform {
  backend "s3" {
    bucket         = "acme-terraform-state"
    key            = "network/prod.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

A DynamoDB table has been the standard lock for years. On Terraform 1.10 and later you can use S3's own locking instead by setting `use_lockfile = true` and dropping the table. Either way, turn on bucket versioning so a bad state write can be rolled back.

## Step 2: let GitHub prove who it is, instead of storing keys

GitHub Actions can issue a short-lived OpenID Connect (OIDC) token for each workflow run. AWS can trust that token and hand back temporary credentials that expire within the hour. No access key is ever created, so there is nothing to leak or rotate.

Create an IAM OIDC identity provider for `token.actions.githubusercontent.com`, then two roles:

- **terraform-plan**: read-only access plus access to the state bucket and lock. Pull requests use this.
- **terraform-apply**: the permissions needed to make changes. Only the `main` branch can use it.

The trust policy is what enforces that. This one lets only workflows running on `main` in one repository assume the apply role:

```json
{
  "Effect": "Allow",
  "Principal": {
    "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
  },
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
      "token.actions.githubusercontent.com:sub": "repo:acme/infrastructure:ref:refs/heads/main"
    }
  }
}
```

For the plan role, the subject for pull request runs is `repo:acme/infrastructure:pull_request`.

> Be strict with the `sub` condition. A trust policy that matches any repository, or any branch, turns a short-lived credential into a door anyone with a fork can knock on.

## Step 3: plan on pull requests, apply on merge

One workflow handles both. The `id-token: write` permission is what lets the job request the OIDC token.

```yaml
name: terraform
on:
  pull_request:
    paths: ["infra/**"]
  push:
    branches: [main]
    paths: ["infra/**"]

permissions:
  id-token: write
  contents: read
  pull-requests: write

jobs:
  plan:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: infra/envs/prod
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/terraform-plan
          aws-region: ap-south-1
      - uses: hashicorp/setup-terraform@v3
      - run: terraform fmt -check -recursive
      - run: terraform init -input=false
      - run: terraform validate
      - run: terraform plan -input=false -no-color

  apply:
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: production
    defaults:
      run:
        working-directory: infra/envs/prod
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/terraform-apply
          aws-region: ap-south-1
      - uses: hashicorp/setup-terraform@v3
      - run: terraform init -input=false
      - run: terraform apply -input=false -auto-approve
```

Two details make this safe in practice:

- **The `production` environment** has required reviewers in GitHub's settings. The apply job waits until someone approves it, even after the merge.
- **The plan is visible in the pull request.** The plan output appears in the job log; most teams also post it as a pull request comment so reviewers don't have to open the logs. Read the summary line, *Plan: 2 to add, 1 to change, 0 to destroy*, before anything else. A surprise in the destroy count is the most common thing review catches.

## Step 4: compose environments from modules

Keep reusable pieces in modules, such as network, compute, storage and identity, and assemble them per environment:

```text
infra/
  modules/
    network/
    compute/
    storage/
    iam/
  envs/
    dev/
    prod/
```

Each environment folder has its own state key and its own small set of inputs. Dev and production are built from the same code, so what you test is what you ship.

## Step 5: prove you can tear it down

Run `terraform destroy` on a non-production environment and build it again. If that works cleanly, you know your code describes everything that exists, and that nothing important was created by hand. It's also the cheapest way to keep dev environments from running all weekend.

## A checklist to take away

- State in S3 with versioning, encryption and locking.
- No AWS access keys in GitHub. OIDC roles only, with strict `sub` conditions.
- Separate plan and apply roles; plan is read-only.
- `fmt`, `validate` and `plan` on every pull request.
- Apply only from `main`, behind an environment approval for production.
- Modules composed per environment, and a teardown you have actually tested.

None of this needs a platform team. It's an afternoon of setup that pays for itself the first time a plan shows a deletion nobody intended. If you'd like us to set it up for your team, or review what you have, [get in touch](../contact.html).
