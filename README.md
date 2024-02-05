# Block Explorer UI

This project is a GUI for the Block Explorer. You can use it to go through blocks, transactions, accounts, witnesses.

## Getting Started

To run the application you have to install Node JS (16.14.2 or higher is preferable). Then after getting the repo use:

```bash
npm install
```

After some time you can start the application with:

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) with your browser to see the result.

## Tech stack

Right now the application is using:

* Next JS as basic framework for managing GUI, routes, env variables and so on.
* React for components and UI project.
* Tailwind for styles.
* Shadcn UI for generic presentational components.
* React Query for managing data from API.
* Typescript.

## Ongoing state

The Block Explorer recrated the old functionalities of previous GUI. We are in the moment when we start working on the new functionalities. The project is dockerize, so you can see CI deployment there: [Link](http://hive-staging.pl.syncad.com:5000/).

## Git workflow

* For your issue, task or changes you want to make, create a branch. The custom branch name is `USER_NAME/BRANCH_NAME`
* After finishing work open PR for `develop` branch. If you made a lot of changes, squash the commits.
* If you're local branch is outdated, use `rebase` to get the newest develop.

## Dockerisation

### Build

To build a Docker image of the app run the following command:

```bash
scripts/build_instance.sh "$(pwd)"
```

All the options available can be displayed by running `scripts/build_instance.sh --help`.

### Running

To run a Docker container, use the following command:

```bash
scripts/run_instance.sh \
    --image="registry.gitlab.syncad.com/hive/block_explorer_ui:latest" \
    --api-endpoint="https://hafbe.openhive.network/rpc" \
    --hive-blog-api-endpoint="https://api.hive.blog" \
    --port="5000" \
    --name="block_explorer_ui" \
    --detach
```

It will start the Block Explorer UI on port 5000.
The container will delete itself once stopped.

All the options available can be displayed by running `scripts/run_instance.sh --help`.

Alternatively, you can use the [Composefile](docker/docker-compose.yml) - ports will be the same as above:

```bash
pushd docker
docker compose up --detach
```

If you wish to change parameters (like API endpoints or port) when using the [Composefile](docker/docker-compose.yml),
edit the accompanying [.env file](docker/.env)

To stop and delete the container use command `docker compose down`.

## Testing

### E2E

The automatic tests are built on Playwright.
To run tests use one of the following commands:

```bash
npm run pw:test:local
npm run pw:test:local:chromium
npm run pw:test:local:firefox
npm run pw:test:local:webkit
```

Running the tests only works locally at this moment.
