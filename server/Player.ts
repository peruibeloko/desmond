import { getValue, guaranteed } from './utils.ts';

class Player<T> {
  #db;
  #key;

  constructor(db: Deno.Kv, key: Deno.KvKey) {
    this.#db = db;
    this.#key = key;
  }

  leaveLobby() {
    this.#db.delete(this.#key);
  }
}

type PlayerInstance<T> = Player<T> & T;

export const getPlayer = async <PlayerData extends object>(db: Deno.Kv, key: Deno.KvKey) => {
  const { value: playerEntry } = await db.get(key);
  const player = new Player<PlayerData>(db, key);

  const getPlayerData = () =>
    db
      .get<PlayerData>(key)
      .then(data => guaranteed(data))
      .then(data => getValue(data));

  for (const prop in playerEntry as PlayerData) {
    Object.assign(player, prop, {
      get [prop]() {
        return getPlayerData().then(data => (data as PlayerData)[prop]);
      },
      set [prop](value: PlayerData[keyof PlayerData]) {
        db.set(key, { ...getPlayerData(), [prop]: value });
      }
    });
  }

  return player as PlayerInstance<PlayerData>;
};
