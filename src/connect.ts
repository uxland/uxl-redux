import {Store} from "redux";
import {ConnectMixinFunction, Constructable, PropertyWatch} from "./types";

const connect: (defaultStore?: Store) => ConnectMixinFunction = defaultStore => <T extends Constructable<any> = any>(superClass: T): T =>
    class extends superClass{
        static get reduxDefaultStore(): Store | undefined{
            return defaultStore;
        }
        private static __uxlReduxWatchedProperties: {[key: string]: PropertyWatch};
        protected static get uxlReduxWatchedProperties(): {[key: string]: PropertyWatch}{
            if(!this.__uxlReduxWatchedProperties)
                this.__uxlReduxWatchedProperties = {};
            return this.__uxlReduxWatchedProperties;
        }
        public static watchProperty(name: PropertyKey, options: PropertyWatch){
            this.uxlReduxWatchedProperties[String(name)] = options;
        }
        connectedCallback(){

        }
        disconnectedCallback(){

        }
    };
export default connect;