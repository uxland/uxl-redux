import {constantBuilder} from '@uxland/uxl-utilities'
const actionNameBuilder = (prefix: string, separator?: string) => {
  const builder = constantBuilder(prefix, 'action', separator);
  return (name: string) => builder(name);
};
export default actionNameBuilder;