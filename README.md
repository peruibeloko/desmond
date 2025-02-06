# Dead Simple Multiplayer Communication

Handles the most common necessities for an average multiplayer game implementation:

- Lobby creation and sharing
- Player management
- Round logic
- Real time communication (WebSockets)

The focus here is not on the game logic itself, but rather the more tedious part of handling the communication of game events, such as a player joining, a poll vote, a round end and such.

Runs on [Deno](https://deno.com/).