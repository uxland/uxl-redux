/*
import {connect, watch} from "../../src";
import {html, LitElement} from "lit-element/lit-element";

import configureStore from "redux-mock-store";

const assert = chai.assert;
const middlewares = [];
const mockStore = configureStore(middlewares)();
import * as sinon from "sinon";
import {customElement, property, query} from "lit-element";
import {MixinFunction} from "@uxland/uxl-utilities/types";

const fixtureElementName = "redux-mixin-fixture";
const defaultComponentName = "custom-element";
const getComponentName = (nameBase: string) => {
    let counter = 0;
    return () => `${nameBase}${++counter}`;
};
const getDefaultComponentName = getComponentName(defaultComponentName);

interface DefaultTestComponent {
    myProperty: string;
    header: HTMLHeadElement;
}

const propertySelector = sinon.spy(() => "Hello from redux state");
const addComponentToFixture = <T>(componentName: string) => {
    const container: HTMLDivElement = fixture(fixtureElementName);
    const component: T = <any>document.createElement(componentName);
    container.appendChild(<any>component);
    return component;
};
const createDefaultComponent: (selector?: (state) => any) => DefaultTestComponent & LitElement = (selector = propertySelector) => {
    const componentName = getDefaultComponentName();

    // @ts-ignore
    @customElement(componentName)
    class Component extends connect(mockStore)(LitElement) implements DefaultTestComponent {
        render(){
            return html `<h1 id="header">${this.myProperty}</h1>`
        }
        @watch(selector, {store: mockStore})
        myProperty: string;
        @query("#header") header: HTMLHeadElement;
    }
    return addComponentToFixture(componentName);
};
suite("redux mixin fixture", () => {
    // noinspection TypeScriptUnresolvedFunction
    setup(() => {
        propertySelector.resetHistory();
    });
    test("bind test", async() => {
        let component = createDefaultComponent();
        assert.isTrue(propertySelector.calledOnce);
        await component.updateComplete;
        assert.equal(component.header.innerText, "Hello from redux state");
    });
    test("update test", () => {
        createDefaultComponent();
        mockStore.dispatch({ type: "@@NOP" });
        assert.isTrue(propertySelector.calledTwice);
    });
    test("disconnect test", () => {
        let component: HTMLElement = <any>createDefaultComponent();
        assert.isTrue(propertySelector.calledOnce);
        component.parentElement.removeChild(component);
        mockStore.dispatch({ type: "@@NOP" });
        assert.isTrue(propertySelector.calledOnce);
    });
    test("property should change if selector changes", async() => {
        const message1 = "Hello from redux state";
        const message2 = "Hello again from redux state";
        const selector = sinon
            .stub()
            .onFirstCall()
            .returns(message1)
            .onSecondCall()
            .returns(message2);

        const component = createDefaultComponent(selector);
        await component.updateComplete;
        assert.equal(component.myProperty, message1);
        mockStore.dispatch({ type: "@@NOP" });
        await component.updateComplete;
        assert.isTrue(selector.calledTwice);
        assert.equal(component.myProperty, message2);
    });
    test("mixin test", async() => {
        const message1 = "Hello from mixin";
        const message2 = "Hello again from mixin";
        const mixinSelector = sinon
            .stub()
            .onFirstCall()
            .returns(message1)
            .onSecondCall()
            .returns(message2);
        const mixin: MixinFunction<any> = parent => {
            class Mixin extends connect(mockStore)(parent) {
                @watch(mixinSelector, {store: mockStore})
                mixinProperty: string;
            }
            return <any>Mixin;
        };
        const message3 = "Hello from component";
        const message4 = "Hello again from component";
        const selector = sinon
            .stub()
            .onFirstCall()
            .returns(message3)
            .onSecondCall()
            .returns(message4);
        // @ts-ignore
        @customElement("mixed-component")
        class Component extends mixin(LitElement) {

            render(){
                return html`<h1 id="header1">${this.componentProperty}</h1><h1 id="header2">${this.mixinProperty}</h1>`;
            }
            @watch(selector, {store: mockStore})
            @property({hasChanged(value: string, oldValue: string): boolean {
                return true;
                }})
            componentProperty: string;

            @query("#header1") header1: HTMLHeadElement;

            @query("#header2") header2: HTMLElement;

            componentPropertyChanged(current: string, old: string) {}
        }
        const component = <Component>addComponentToFixture("mixed-component");
        await component.updateComplete;
        assert.equal(component.mixinProperty, message1);
        assert.equal(component.componentProperty, message3);
        assert.equal(component.header1.innerText, message3);
        assert.equal(component.header2.innerText, message1);
        mockStore.dispatch({ type: "@@NOP" });
        await component.updateComplete;
        assert.isTrue(selector.calledTwice);
        assert.equal(component.mixinProperty, message2);
        assert.equal(component.componentProperty, message4);
        assert.equal(component.header1.innerText, message4);
        assert.equal(component.header2.innerText, message2);
    });
});
*/
