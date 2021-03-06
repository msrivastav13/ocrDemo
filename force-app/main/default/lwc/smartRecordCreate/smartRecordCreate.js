import { LightningElement, api } from 'lwc';
import createRecord from '@salesforce/apex/SmartRecordCreateController.createRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SmartRecordCreate extends LightningElement {
    @api buttonLabel;
    @api object;
    @api address;
    @api phone;
    @api mobilephone;
    @api email;
    @api website;
    @api company;

    fileName;
    fileuploaded;
    previewURL;
    buttonDisabled;
    base64Data = '';

    fields = {
        ADDRESS: '',
        PHONE: '',
        MOBILE_PHONE: '',
        EMAIL: '',
        WEBSITE: '',
        ORG: ''
    };

    startSpinning = false;

    constructor() {
        super();
        this.buttonDisabled = true;
        this.startSpinning = false;
    }

    handleFileChange(event) {
        if (event.target.files.length > 0) {
            this.filesUploaded = event.target.files[0];
            this.fileName = event.target.files[0].name;
            this.previewURL = URL.createObjectURL(event.target.files[0]);
            this.buttonDisabled = false;
        }
    }

    handleClick() {
        this.startSpinning = true;
        const toBase64 = (file) =>
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
            });
        let fileContent;
        toBase64(this.filesUploaded)
            .then((result) => {
                fileContent = result;
                const base64Constant = 'base64,';
                const base64ImageValue =
                    fileContent.indexOf(base64Constant) + base64Constant.length;
                this.base64Data = fileContent.substring(base64ImageValue);
                this.fields = {
                    ADDRESS: this.address,
                    PHONE: this.phone,
                    MOBILE_PHONE: this.mobilephone,
                    EMAIL: this.email,
                    WEBSITE: this.website,
                    ORG: this.company
                };
                this.createObjectRecord();
            })
            .catch((error) => {
                const evt = new ShowToastEvent({
                    title: 'Record Creation Failed',
                    message: error,
                    variant: 'error'
                });
                this.dispatchEvent(evt);
                this.startSpinning = false;
            });
    }

    createObjectRecord() {
        createRecord({
            imageData: this.base64Data,
            objectname: this.object,
            fields: this.fields
        })
            .then((resultRecord) => {
                // eslint-disable-next-line no-alert
                const evt = new ShowToastEvent({
                    title: 'Record Creation is Successful',
                    // eslint-disable-next-line dot-notation
                    message:
                        'Record Created with RecordId ' + resultRecord.recordId,
                    variant: 'success'
                });
                this.dispatchEvent(evt);
                this.startSpinning = false;
            })
            .catch((error) => {
                const evt = new ShowToastEvent({
                    title: 'Record Creation Failed',
                    message: error.body.message,
                    variant: 'error'
                });
                this.dispatchEvent(evt);
                this.startSpinning = false;
            });
    }
}
