import { createLobby } from "./Lobby.ts";

const db = await Deno.openKv();

const lobby = createLobby(db, {
  foo: 'asd'
});

lobby.foo = 'sfdfsdf'