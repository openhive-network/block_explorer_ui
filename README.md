# Block Explorer UI

This project is a GUI for the Block Explorer. You can use it to go through blocks, transactions, accounts, witnesses. 

## Getting Started

To run the application you have to install Node JS (16.14.2 or higher is preferable). Then after getting the repo use:

```
npm install
```

After some time you can start the application with:

```
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) with your browser to see the result.


## Tech stack

Right now the application is using
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


