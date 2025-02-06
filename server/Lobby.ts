import { getPlayer } from './Player.ts';
import { getValue, guaranteed } from "./utils.ts";

const generateLobbyCode = () => {
  const AVAILABLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let code = '';

  for (let i = 0; i < 6; i++) {
    code += AVAILABLE_CHARS[Math.random() * AVAILABLE_CHARS.length];
  }

  return code;
};

class Lobby<T> {
  #db;
  #code;
  #keys;

  constructor(db: Deno.Kv, lobbyData: T) {
    this.#db = db;
    this.#code = generateLobbyCode();
    this.#keys = {
      lobby: ['lobbies', this.#code],
      players: ['lobbies', this.#code, 'players']
    };

    this.#db.set(this.#keys.lobby, lobbyData);
    this.#db.set(this.#keys.players, []);
  }

  // #region Lobby methods
  getCode() {
    return this.#code;
  }

  async joinLobby<T>(playerData: T) {
    const playerId = crypto.randomUUID();
    await this.#db.set([...this.#keys.players, playerId], playerData);
    return playerId;
  }

  async closeLobby() {
    const entries = this.#db.list({ prefix: this.#keys.players });

    for await (const { key } of entries) {
      this.#db.delete(key);
    }
  }

  async size() {
    const players = this.#db.list({ prefix: this.#keys.players });
    let size = 0;
    for await (const _ of players) size++;
    return size;
  }
  // #endregion

  // #region Player methods
  async listPlayers<T>() {
    const entries = this.#db.list({ prefix: this.#keys.players });

    const players: T[] = [];
    for await (const { value: player } of entries) players.push(player as T);
    return players;
  }

  async getPlayer<T extends object>(playerId: string) {
    const { key } = await this.#db.get([...this.#keys.players, playerId]);
    return getPlayer<T>(this.#db, key);
  }
  // #endregion
}

type GameLobby<T> = Lobby<T> & T;

export const createLobby = <T>(db: Deno.Kv, lobbyData: T): GameLobby<T> => {
  const lobby = new Lobby(db, lobbyData);
  const key = ['lobbies', lobby.getCode()]

  const getLobbyData = () =>
    db
      .get<T>(key)
      .then(data => guaranteed(data))
      .then(data => getValue(data));

  for (const prop in lobbyData) {
    Object.assign(lobby, prop, {
      get [prop]() {
        return getLobbyData().then(data => (data!)[prop]);
      },
      set [prop](value: T[keyof T]) {
        db.set(key, { ...getLobbyData(), [prop]: value });
      }
    });
  }

  return lobby as GameLobby<T>;
};
