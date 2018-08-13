import { reduxMixin } from "../../src/redux-mixin";
import { html, LitElement } from "@polymer/lit-element/lit-element";

import configureStore from "redux-mock-store";

const assert = chai.assert;
const middlewares = [];
const mockStore = configureStore(middlewares)();
import * as sinon from "sinon";
import { customElement, item, property } from "@uxland/uxl-polymer2-ts";

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

const propertySelector = sinon.spy(state => "Hello from redux state");
const addComponentToFixture = <T>(componentName: string) => {
    const container: HTMLDivElement = fixture(fixtureElementName);
    const component: T = <any>document.createElement(componentName);
    container.appendChild(<any>component);
    return component;
};
const createDefaultComponent: (selector?: (state) => any) => DefaultTestComponent & LitElement = (selector = propertySelector) => {
    const componentName = getDefaultComponentName();

    @customElement(componentName)
    class Component extends reduxMixin(mockStore)(LitElement) implements DefaultTestComponent {
        _render(props: Component){
            return html `<h1 id="header">${props.myProperty}</h1>`
        }
        @property({ statePath: selector})
        myProperty: string;
        @item("header") header: HTMLHeadElement;
    }
    return addComponentToFixture(componentName);
};

suite("redux mixin fixture", () => {
    // noinspection TypeScriptUnresolvedFunction
    setup(() => {
        propertySelector.resetHistory();
    });
    test("bind test", () => {
        let component = createDefaultComponent();
        assert.isTrue(propertySelector.calledOnce);
        assert.equal(component.header.innerText, "Hello from redux state");
    });
    test("update test", () => {
        let component = createDefaultComponent();
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
        await component.renderComplete;
        assert.equal(component.myProperty, message1);
        mockStore.dispatch({ type: "@@NOP" });
        await component.renderComplete;
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
        const mixin = parent => {
            class Mixin extends reduxMixin(mockStore)(parent) {
                @property({ statePath: mixinSelector})
                mixinProperty: string;
            }
            return Mixin;
        };
        const message3 = "Hello from component";
        const message4 = "Hello again from component";
        const selector = sinon
            .stub()
            .onFirstCall()
            .returns(message3)
            .onSecondCall()
            .returns(message4);
        @customElement("mixed-component")
        class Component extends mixin(LitElement) {

            _render(props: Component){
                return html`<h1 id="header1">${props.componentProperty}</h1><h1 id="header2">${props.mixinProperty}</h1>`;
            }
            @property({ statePath: selector, observer: "componentPropertyChanged" })
            componentProperty: string;

            @item("header1") header1: HTMLHeadElement;

            @item("header2") header2: HTMLElement;

            componentPropertyChanged(current: string, old: string) {}
        }
        const component = <Component>addComponentToFixture("mixed-component");
        await component.renderComplete;
        assert.equal(component.mixinProperty, message1);
        assert.equal(component.componentProperty, message3);
        assert.equal(component.header1.innerText, message3);
        assert.equal(component.header2.innerText, message1);
        mockStore.dispatch({ type: "@@NOP" });
        await component.renderComplete;
        assert.isTrue(selector.calledTwice);
        assert.equal(component.mixinProperty, message2);
        assert.equal(component.componentProperty, message4);
        assert.equal(component.header1.innerText, message4);
        assert.equal(component.header2.innerText, message2);
    });
});
