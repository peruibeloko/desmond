type Entry<T> = Deno.KvEntry<T> | Promise<Deno.KvEntry<T>> | Deno.KvEntryMaybe<T> | Promise<Deno.KvEntryMaybe<T>>;

export const getValue = <T>(entry: Entry<T>) => {
  if (entry instanceof Promise) {
    return entry.then(data => data.value);
  }
  entry.value;
};

export const guaranteed = <T>(entry: Deno.KvEntryMaybe<T>) => {
  return entry as {
    key: Deno.KvKey;
    value: T;
    versionstamp: string;
  };
};
