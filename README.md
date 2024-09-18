# Block Explorer UI

This project is a GUI for the Block Explorer. You can use it to go through blocks, transactions, accounts, witnesses.

## Getting Started

To run the application you have to install Node JS (18.20.0 or higher is preferable). Then after getting the repo use:

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
* Wax as a helping library to handle blockchain issues in applications, like formatting, assets and communication with servers


## Git workflow

* For your issue, task or changes you want to make, create a branch. The custom branch name is `USER_NAME/BRANCH_NAME`
* After finishing work open PR for `develop` branch. If you made a lot of changes, squash the commits.
* If you're local branch is outdated, use `rebase` to get the newest develop.
* The maintener of Block Explorer will later merge `develop` into `master`.
* `master` branch is our production, `develop` is development staging branch.

## Deployment

The Block Explorer has two instances of deployment.

* [https://testexplore.openhive.network](https://testexplore.openhive.network) – staging made from `develop` branch.
* [https://explore.openhive.network](https://testexplore.openhive.network) – production made from `master` branch.

The deployment is done manually in pipelines.

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
    --api-endpoint="https://hafbe.openhive.network" \
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

## About Wax usage

There are two big part of Block Explorer that are handled by Wax library:

1. The communication with servers. See `services/FetchingService.ts` and `types/Rest.ts`. In the `Rest.ts` file the structure of REST API is definied both properties and responses. Every call to backend, both Hive Node and Explorer API (HAF and HAFBE) is done through Wax.
2. Formatters. Assets are changed from NAI form into formatted string. Every operation displayed in UI is formatted by our custom formatters using Wax. 
