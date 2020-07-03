import { createElement } from 'lwc';
import ShowToastEventName from 'lightning/platformShowToastEvent';
import SmartRecordCreate from 'c/smartRecordCreate';
import createRecord from '@salesforce/apex/SmartRecordCreateController.createRecord';
// Mocking imperative Apex method call
jest.mock(
    '@salesforce/apex/SmartRecordCreateController.createRecord',
    () => {
        return {
            default: jest.fn()
        };
    },
    { virtual: true }
);

const SUCCESS_RESPONSE = require('./data/createRecordResponse.json');

const fields = {
    ADDRESS: 'Address__c',
    PHONE: 'Phone',
    MOBILE_PHONE: 'MobilePhone',
    EMAIL: 'Email',
    WEBSITE: 'Website',
    ORG: 'Company'
};

// Sample error for imperative Apex call
const APEX_CONTACTS_ERROR = {
    body: { message: 'An internal server error has occurred' },
    ok: false,
    status: 400,
    statusText: 'Bad Request'
};

const APEX_PARAMETERS = {
    imageData: 'ZmlsZSBjb250ZW50cw==',
    objectname: 'Lead',
    fields: fields
};

describe('c-smart-record-create', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        // Prevent data saved on mocks from leaking between tests
        jest.clearAllMocks();
    });

    // Helper function to wait until the microtask queue is empty. This is needed for promise
    // timing when calling imperative Apex.
    function flushPromises() {
        // eslint-disable-next-line no-undef
        return new Promise((resolve) => setImmediate(resolve));
    }

    it('render smart record create component', () => {
        const element = createElement('c-smart-record-create', {
            is: SmartRecordCreate
        });
        element.buttonLabel = 'Create Lead';
        element.object = 'Lead';
        element.address = 'Address__c';
        element.phone = 'Phone';
        element.mobilephone = 'MobilePhone';
        element.email = 'Email';
        element.website = 'Website';
        element.company = 'Company';
        document.body.appendChild(element);
        return Promise.resolve().then(() => {
            const lightningInput = element.shadowRoot.querySelector(
                'lightning-input'
            );
            expect(lightningInput.label).toBe(element.buttonLabel);
            expect(lightningInput.type).toBe('file');
            expect(formFactorPropertyName).toBe('Large');
        });
    });

    it('change file input', () => {
        // The URL.createObjectURL is not implemented
        // JavaScript implementation of the WHATWG DOM used by jest doesn't implement this method
        global.URL.createObjectURL = jest.fn();
        const element = createElement('c-smart-record-create', {
            is: SmartRecordCreate
        });
        element.buttonLabel = 'Create Lead';
        element.object = 'Lead';
        element.address = 'Address__c';
        element.phone = 'Phone';
        element.mobilephone = 'MobilePhone';
        element.email = 'Email';
        element.website = 'Website';
        element.company = 'Company';
        document.body.appendChild(element);
        return Promise.resolve().then(() => {
            const lightningInput = element.shadowRoot.querySelector(
                'lightning-input'
            );
            // create a dummy file
            const fileContents = 'file contents';
            const file = new Blob([fileContents], { type: 'image/png' });
            lightningInput.files = [file];
            lightningInput.dispatchEvent(new CustomEvent('change'));
            Promise.resolve().then(() => {
                const image = element.shadowRoot.querySelector('.lgc-bg');
                expect(image.src).toBe(URL.createObjectURL(file));
            });
        });
    });

    it('click record create button', () => {
        // The URL.createObjectURL is not implemented
        // JavaScript implementation of the WHATWG DOM used by jest doesn't implement this method
        global.URL.createObjectURL = jest.fn();

        createRecord.mockImplementation(() =>
            Promise.resolve(SUCCESS_RESPONSE)
        );
        
        const element = createElement('c-smart-record-create', {
            is: SmartRecordCreate
        });
        element.buttonLabel = 'Create Lead';
        element.object = 'Lead';
        element.address = 'Address__c';
        element.phone = 'Phone';
        element.mobilephone = 'MobilePhone';
        element.email = 'Email';
        element.website = 'Website';
        element.company = 'Company';
        document.body.appendChild(element);

        // Mock handler for toast event
        const handler = jest.fn();
        // Add event listener to catch toast event
        element.addEventListener(ShowToastEventName, handler);

        const lightningInput = element.shadowRoot.querySelector(
            'lightning-input'
        );
        // create a dummy file
        const fileContents = 'file contents';
        const file = new Blob([fileContents], { type: 'image/png' });
        lightningInput.files = [file];
        lightningInput.dispatchEvent(new CustomEvent('change'));

        return Promise.resolve()
            .then(() => {
                const buttonElement = element.shadowRoot.querySelector(
                    'lightning-button'
                );
                buttonElement.click();
            })
            .then(() => {
                flushPromises().then(() => {
                    expect(createRecord).toHaveBeenCalled();
                });
            });
    });

    it('click record create button and error out', () => {
        // The URL.createObjectURL is not implemented
        // JavaScript implementation of the WHATWG DOM used by jest doesn't implement this method
        global.URL.createObjectURL = jest.fn();

        createRecord.mockRejectedValue(APEX_CONTACTS_ERROR);

        const element = createElement('c-smart-record-create', {
            is: SmartRecordCreate
        });
        element.buttonLabel = 'Create Lead';
        element.object = 'Lead';
        element.address = 'Address__c';
        element.phone = 'Phone';
        element.mobilephone = 'MobilePhone';
        element.email = 'Email';
        element.website = 'Website';
        element.company = 'Company';
        document.body.appendChild(element);

        // Mock handler for toast event
        const handler = jest.fn();
        // Add event listener to catch toast event
        element.addEventListener(ShowToastEventName, handler);

        const lightningInput = element.shadowRoot.querySelector(
            'lightning-input'
        );
        // create a dummy file
        const fileContents = 'file contents';
        const file = new Blob([fileContents], { type: 'image/png' });
        lightningInput.files = [file];
        lightningInput.dispatchEvent(new CustomEvent('change'));

        return Promise.resolve()
            .then(() => {
                const buttonElement = element.shadowRoot.querySelector(
                    'lightning-button'
                );
                buttonElement.click();
            })
            .then(() => {
                flushPromises().then(() => {
                    expect(handler).toHaveBeenCalled();
                });
            });
    });
});
