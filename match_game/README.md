# Assignment 3

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Dependencies
Endpoints are targeting server from https://github.com/olehougaard/gameserver. Thus, the server must be installed and running to use the app. 

You need to remember to run `npm install` on both projects too

There is a dependency on bootstrap for the css that may need to be installed seperately if it is not done so when running `npm install`
For this you can run `npm install bootstrap@4.6.2`

## Access
Login with credentials admin/secret or create a new user.

Database can be seen in the local copy of https://github.com/olehougaard/gameserver/data/data.json when the apps are running

## Higscores
Highscores are not populated with dummy data so you need to play a few games to see that it works.

# To DO
- [ ] make code in service classes more uniform 
- [ ] remove depenendancy on sessionStoarge and only use redux store for state
- [ ] fix error message for logging in 
- [ ] add user settings in game to change board size or letters
- [ ] make board UX more fun
- [ ] add games like snake or space invaders 
