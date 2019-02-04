import {constantBuilder} from "@uxland/uxl-utilities/constant-builder";

export const actionNameBuilder = (prefix: string, separator?: string) => {
  const builder = constantBuilder(prefix, 'action', separator);
  return (name: string) => builder(name);
};
