import {reduxMixin} from "../../src/redux-mixin";
import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

import configureStore from 'redux-mock-store'

const assert = chai.assert;
const middlewares = []
const mockStore = configureStore(middlewares)();
import * as sinon from 'sinon';
import {customElement, item, property} from "uxl-polymer2-ts";

const fixtureElementName = 'utilities-fixture';
const defaultComponentName = 'custom-element';
const getComponentName = (nameBase: string) => {
    let counter = 0;
    return () => `${nameBase}${++counter}`;
};
const getDefaultComponentName = getComponentName(defaultComponentName);

interface DefaultTestComponent extends PolymerElement {
    myProperty: string;
    header: HTMLHeadElement;

    onMyPropertyChanged(current: string, old: string);
}

const propertySelector = sinon.spy((state) => 'Hello from redux state');
const addComponentToFixture = <T>(componentName: string) =>{
    const container: HTMLDivElement = fixture(fixtureElementName);
    const component: T = <any>document.createElement(componentName);
    container.appendChild(<any>component);
    return component;
};
const createDefaultComponent: (selector?: (state) => any) => DefaultTestComponent = (selector = propertySelector) => {
    const componentName = getDefaultComponentName();

    @customElement(componentName)
    class Component extends reduxMixin(mockStore)(PolymerElement) implements DefaultTestComponent {
        static get template() {
            return html `<h1 id="header">[[myProperty]]</h1>`;
        }
        @property({statePath: selector, observer: 'onMyPropertyChanged'})
        myProperty: string;
        @item('header')
        header: HTMLHeadElement;

        onMyPropertyChanged(current: string, old: string) {

        };
    }
    return addComponentToFixture(componentName);

};

suite('redux mixin fixture', () => {
    // noinspection TypeScriptUnresolvedFunction
    setup(() => {
        propertySelector.resetHistory();
    });
    test('bind test', () => {
        let component = createDefaultComponent();
        assert.isTrue(propertySelector.calledOnce);
        assert.equal(component.header.innerText, 'Hello from redux state');
    });
    test('update test', () => {
        let component = createDefaultComponent();
        mockStore.dispatch({type: '@@NOP'});
        assert.isTrue(propertySelector.calledTwice);
    });
    test('disconnect test', () => {
        let component: HTMLElement = <any>createDefaultComponent();
        assert.isTrue(propertySelector.calledOnce);
        component.parentElement.removeChild(component);
        mockStore.dispatch({type: '@@NOP'});
        assert.isTrue(propertySelector.calledOnce)
    });
    test('property should not change if selector does not change', () => {
        let component = createDefaultComponent();
        const spy = sinon.spy(component, 'onMyPropertyChanged');
        mockStore.dispatch({type: '@@NOP'});
        assert.isFalse(spy.called);
    });
    test('property should change if selector changes', () => {
        const message1 = 'Hello from redux state';
        const message2 = 'Hello again from redux state';
        const selector = sinon.stub().onFirstCall().returns(message1).onSecondCall().returns(message2);

        const component = createDefaultComponent(selector);
        const spy = sinon.spy(component, 'onMyPropertyChanged');
        assert.equal(component.myProperty, message1);
        mockStore.dispatch({type: '@@NOP'});
        assert.isTrue(selector.calledTwice);
        assert.isTrue(spy.calledWith(message2, message1));
        assert.equal(component.myProperty, message2);

    });
    test('mixin test', () => {
        const message1 = 'Hello from mixin';
        const message2 = 'Hello again from mixin';
        const mixinSelector = sinon.stub().onFirstCall().returns(message1).onSecondCall().returns(message2);
        const mixin = parent =>{

          class Mixin extends reduxMixin(mockStore)(parent){
              @property({statePath: mixinSelector, observer: 'mixinPropertyChanged'})
              mixinProperty: string;
              mixinPropertyChanged(current: string, previous: string){

              }
          }
          return Mixin;
        };
        const message3 = 'Hello from component';
        const message4 = 'Hello again from component';
        const selector = sinon.stub().onFirstCall().returns(message3).onSecondCall().returns(message4);
        @customElement('mixed-component')
        class Component extends mixin(PolymerElement){
            static get template() {
                return html `<h1 id="header1">[[componentProperty]]</h1><h1 id="header2">[[mixinProperty]]</h1>`;
            }
            @property({statePath: selector, observer: 'componentPropertyChanged'})
            componentProperty: string;

            @item('header1')
            header1: HTMLHeadElement;

            @item('header2')
            header2: HTMLElement;

            componentPropertyChanged(current: string, old: string) {

            };
        }
        const component = <Component>addComponentToFixture('mixed-component');
        const mixinSpy = sinon.spy(component, 'mixinPropertyChanged');
        const componentSpy = sinon.spy(component, 'componentPropertyChanged');
        assert.equal(component.mixinProperty, message1);
        assert.equal(component.componentProperty, message3);
        assert.equal(component.header1.innerText, message3);
        assert.equal(component.header2.innerText, message1);
        mockStore.dispatch({type: '@@NOP'});
        assert.isTrue(selector.calledTwice);
        assert.isTrue(mixinSpy.calledWith(message2, message1));
        assert.isTrue(componentSpy.calledWith(message4, message3));
        assert.equal(component.mixinProperty, message2);
        assert.equal(component.componentProperty, message4);
        assert.equal(component.header1.innerText, message4);
        assert.equal(component.header2.innerText, message2);
    });
});