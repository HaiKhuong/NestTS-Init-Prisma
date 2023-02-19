/** Process a deep search to remove all **null** or **undefined** field
 * @param data Object to cleanup
 * @param options More configs to control the return value
 */
export function cleanup<T>(data: T, options?: { returnEmpty?: boolean }): T;

/** Process a deep search to remove all **null** or **undefined** item from array
 * @param data Object to cleanup
 * @param options More configs to control the return value
 */
export function cleanup<T>(data: Array<T>, options?: { returnEmpty?: boolean }): Array<T>;

export function cleanup<T>(data: T, options?: { returnEmpty?: boolean }) {
  let entries: unknown[];

  if (Array.isArray(data)) {
    entries = data.filter((v) => v != null).map((v) => (v === Object(v) || Array.isArray(v) ? cleanup(v, options) : v));

    if (options?.returnEmpty) {
      return entries as T[];
    }

    entries = entries.filter((e) => e != null);
    if (entries.length <= 0) return undefined;
    return entries as T[];
  } else {
    entries = Object.entries(data)
      .filter((v) => v != null)
      .map(([k, v]) => [k, v === Object(v) || Array.isArray(v) ? cleanup(v, options) : v]);

    if (options?.returnEmpty) {
      return Object.fromEntries(entries as any[]) as T;
    }

    entries = entries.filter((v) => v != null);
    if (entries.length <= 0) return undefined;
    return Object.fromEntries(entries as any[]) as T;
  }
}
