type Constructor<T> = new (...args: any[]) => T;

export function mapJsonToClass<T, U extends Record<string, any>>(
  json: U,
  clazz: Constructor<T>,
): T {
  const instance = new clazz();

  for (const key in json) {
    if (Object.prototype.hasOwnProperty.call(json, key)) {
      (instance as any)[key] = json[key];
    }
  }

  return instance;
}