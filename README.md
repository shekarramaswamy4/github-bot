# github-bot

This repo is a demo of how a Github bot can summarize and review pull requests. The actual code of the bot is in `github-app`, and is deployed as a Github App using the [probot library](https://probot.github.io/).

The code in github-app also spins up a local webserver as well as a webhook proxy using `smee.io`.

There are two key piece of functionality to the bot:

- Autosummarization of python files that were in a PR. When a PR is opened, the `shekar-bot` automatically summarizes the changes
- Approval of a PR on demand. If you type in `shekar-bot review`, `shekar-bot` will automatically approve the PR with a friendly comment.

## Demo

## How it works

![Local development flow](./local-dev.png)

First, a repo must allow access to the Github app. This is as simple as going to repo settings -> Github apps. The Github app acts as an authenticated agent to send webhooks and take actions on github resources.

On PR creation and special comments, a webhook is sent from the app to the specified url in the app.

The webhook is then processed by a target server and actions are taken appropriately.

## Running + Testing locally

Pull the repo, and run `yarn dev` in the `github-app` directory.

You have two options to develop the bot:

- ask me for the .env file to try it out on this repository
- use the same source code, but spin up a github app in your own repository

## Known Limitations

Since this is a Github App, it isn't possible to actually mention the bot using the "@" symbol. This could take away the "magic" of a separate AI agent, but only marginally so in my opinion. Additionally, in my experience, companies are more hesitant to allow full access to a "bot user" masquerading as a real user.

The alternative was to create a full fledged separate user and automate their actions, which requires a bit more work as you'd need to handle oauth in a separate webserver. However, the code itself would largely stay the same.

Between a Github app and a separate oauth'd user, the core code and functionality would approximately be equivalent. As a result, I decided to use a Github app as an MVP because it would be quicker to implement.

## Deploying in an customer's environment

Here are the steps that would be needed if we were to "sell" this to an end customer:

-
