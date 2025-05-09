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

- Next JS as basic framework for managing GUI, routes, env variables and so on.
- React for components and UI project.
- Tailwind for styles.
- Shadcn UI for generic presentational components.
- React Query for managing data from API.
- Typescript.
- Wax as a helping library to handle blockchain issues in applications, like formatting, assets and communication with servers

## Git workflow

- For your issue, task or changes you want to make, create a branch. The custom branch name is `USER_NAME/BRANCH_NAME`
- After finishing work open PR for `develop` branch. If you made a lot of changes, squash the commits.
- If you're local branch is outdated, use `rebase` to get the newest develop.
- The maintener of Block Explorer will later merge `develop` into `master`.
- `master` branch is our production, `develop` is development staging branch.

## Deployment

The Block Explorer has two instances of deployment.

- [https://testexplore.openhive.network](https://testexplore.openhive.network) – staging made from `develop` branch.
- [https://explore.openhive.network](https://testexplore.openhive.network) – production made from `master` branch.

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
    --api-endpoint="https://api.hive.blog" \
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

## Steps to Configure New Theme Colors for Rebranding

1. In the root directory of the project, edit the file named .env. This file will store the environment variables needed by the application.

2. Add Required Environment Variables For Theme Colors, the application supports both light and dark theme colors. Define colors for each theme using these variables. Each color variable can be specified as an RGB value (e.g., rgb(255, 255, 255)), hex code (e.g., #FFFFFF), or named color (e.g., blue).

3. For the Light Theme Variables, set:

   REACT_APP_COLOR_BACKGROUND_START_RGB_LIGHT - Start gradient color for the background
   REACT_APP_COLOR_BACKGROUND_END_RGB_LIGHT - End gradient color for the background
   REACT_APP_COLOR_TEXT_LIGHT - Text color
   REACT_APP_COLOR_BACKGROUND_LIGHT - General background color
   REACT_APP_COLOR_ROW_EVEN_LIGHT - Color for even rows
   REACT_APP_COLOR_ROW_ODD_LIGHT - Color for odd rows
   REACT_APP_COLOR_ROW_HOVER_LIGHT - Row hover color
   REACT_APP_COLOR_BUTTON_LIGHT - Button color
   REACT_APP_COLOR_BUTTON_TEXT_LIGHT - Button text color
   REACT_APP_COLOR_BUTTON_HOVER_LIGHT - Button hover color
   REACT_APP_COLOR_SWITCH_BUTTON_LIGHT - Switch button color
   REACT_APP_COLOR_SWITCH_OFF_LIGHT - Switch color when off
   REACT_APP_COLOR_SWITCH_ON_LIGHT - Switch color when on

4. For the Dark Theme Variables, set:

   REACT_APP_COLOR_BACKGROUND_START_RGB_DARK - Start gradient color for the background in dark mode
   REACT_APP_COLOR_BACKGROUND_END_RGB_DARK - End gradient color for the background in dark mode
   REACT_APP_COLOR_TEXT_DARK - Text color in dark mode
   REACT_APP_COLOR_BACKGROUND_DARK - General background color in dark mode
   REACT_APP_COLOR_ROW_EVEN_DARK - Color for even rows in dark mode
   REACT_APP_COLOR_ROW_ODD_DARK - Color for odd rows in dark mode
   REACT_APP_COLOR_ROW_HOVER_DARK - Row hover color in dark mode
   REACT_APP_COLOR_BUTTON_DARK - Button color in dark mode
   REACT_APP_COLOR_BUTTON_TEXT_DARK - Button text color in dark mode
   REACT_APP_COLOR_BUTTON_HOVER_DARK - Button hover color in dark mode
   REACT_APP_COLOR_SWITCH_BUTTON_DARK - Switch button color in dark mode
   REACT_APP_COLOR_SWITCH_OFF_DARK - Switch color when off in dark mode
   REACT_APP_COLOR_SWITCH_ON_DARK - Switch color when on in dark mode

5. Restart the Application
   After adding or updating values in the .env file, restart the application to apply the changes.

**Notes**
Do not commit your .env file to version control to avoid exposing sensitive information. You can customize the color values to suit your design needs, but be sure to follow the naming pattern provided for easy reference.
