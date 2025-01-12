/**
 * A type that represents either a single instance of a type `T` or an array of instances of type `T`.
 *
 *
 * @template T - The type of the elements.
 */
export type ArrayOrSingle<T> = T | T[];

/**
 * Represents a value that can be either of type `T` or a `Promise` that resolves to `T`.
 *
 * Useful for functions that return a value synchronously or asynchronously.
 *
 * @template T - The type of the value.
 */
export type Awaitable<T> = T | Promise<T>;

/**
 * Recursively makes all properties of a type optional.
 *
 * @template T - The type to be made deeply partial.
 */
export type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };

/**
 * Recursively makes all properties of an object type `T` readonly.
 *
 * @template T - The object type to be made deeply readonly.
 *
 * @remarks
 * This type uses TypeScript's mapped and conditional types to traverse all properties of `T`.
 * If a property is an object, it applies `DeepReadonly` recursively.
 * Otherwise, it makes the property readonly.
 *
 * @example
 * ```typescript
 * interface Example {
 *   a: number;
 *   b: {
 *     c: string;
 *   };
 * }
 *
 * const example: DeepReadonly<Example> = {
 *   a: 1,
 *   b: {
 *     c: 'hello'
 *   }
 * };
 *
 * // The following lines will cause TypeScript compilation errors
 * // example.a = 2;
 * // example.b.c = 'world';
 * ```
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Represents a dictionary where keys are strings and values are of type `T`.
 *
 * @template T - The type of the values in the dictionary.
 */
export type Dict<T> = { [key: string]: T };

/**
 * Represents an object with no properties.
 *
 * This type is useful when you need to explicitly define an empty object
 * in your type definitions.
 *
 * @example
 * // Valid usage:
 * const obj: EmptyObject = {};
 *
 * @example
 * // Invalid usage:
 * const obj: EmptyObject = { key: 'value' }; // Error: Type '{ key: string; }' is not assignable to type 'EmptyObject'.
 */
export type EmptyObject = Record<string, never>;

/**
 * Represents a type that transforms an object type `T` into a union of tuples,
 * where each tuple contains a key of `T` and its corresponding value.
 *
 *
 * @template T - The object type to be transformed.
 */
export type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T];

/**
 * ExcludeFromUnion is a utility type that removes types from a union.
 *
 *
 * @template T - The union type from which to exclude types.
 * @template U - The types to exclude from the union.
 *
 * @example
 * type Result = ExcludeFromUnion<'a' | 'b' | 'c', 'a'>; // Result is 'b' | 'c'
 */
export type ExcludeFromUnion<T, U> = T extends U ? never : T;

/**
 * Extracts types from a union that are assignable to a given type.
 *
 *
 * @template T - The union type to extract from.
 * @template U - The type to extract.
 * @returns A type that includes only the types from T that are assignable to U.
 */
export type ExtractFromUnion<T, U> = T extends U ? T : never;

/**
 * A utility type that extracts the keys of a given type `T`.
 *
 *
 * @template T - The type from which to extract the keys.
 */
export type KeysOf<T> = keyof T;

/**
 * Represents a type that can either be `Nullable` or `Optional`.
 *
 *
 * @template T - The type of the value that can be either `Nullable` or `Optional`.
 */
export type Maybe<T> = Nullable<T> | Optional<T>;

/**
 * Represents an array that is guaranteed to have at least one element.
 *
 *
 * @template T - The type of elements in the array.
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * A utility type that represents a value that can either be of type `T` or `null`.
 *
 *
 * @template T - The type of the value that can be nullable.
 */
export type Nullable<T> = T | null;

/**
 * Represents a type that can either be of type `T` or `undefined`.
 *
 * This is useful for cases where a value may or may not be present.
 *
 *
 * @template T - The type of the value that may be present.
 */
export type Optional<T> = T | undefined;

/**
 * Represents a function type where the parameters are partially applied.
 *
 *
 * @template T - A function type whose parameters will be partially applied.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PartialFunction<T extends (...args: any[]) => any> = (
  ...args: Partial<Parameters<T>>
) => ReturnType<T>;

/**
 * A utility type that makes all properties in `T` optional, except for the properties specified in `K` which remain required.
 *
 * @template T - The type to be partially made optional.
 * @template K - The keys of `T` that should remain required.
 */
export type PartialWithRequired<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Represents a plain object with string keys and values of any type.
 *
 *
 * @property {string} key - The key of the object.
 * @property {any} value - The value associated with the key.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PlainObject = { [key: string]: any };

/**
 * Represents the primitive types in TypeScript.
 *
 * This type alias includes the following primitive types:
 * - `string`
 * - `number`
 * - `boolean`
 * - `symbol`
 * - `bigint`
 *
 *
 *
 */
export type Primitive = string | number | boolean | symbol | bigint;

/**
 * Represents a type that allows either `T` or `U`, but not both.
 *
 * This utility type ensures that if `T` and `U` are both objects,
 * the resulting type will have properties from either `T` or `U`,
 * but not a mix of both. If `T` is an object, it will exclude
 * properties from `U` to avoid conflicts.
 *
 *
 * @template T - The first type.
 * @template U - The second type.
 */
export type XOR<T, U> = T | U extends object
  ? T extends object
    ? { [P in Exclude<keyof T, keyof U>]?: never } & U
    : T
  : T | U;
