import { LightningElement, wire, api, track } from 'lwc';
import getApps from '@salesforce/apex/getApplicationsCandidateId.getApplications';
import getsObjectDetails from '@salesforce/apex/getJobsClientParam.getJobs';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

import STAGE from '@salesforce/schema/TR1__Job__c.Job_Stage_Text__c';
import JOB_OBJECT from '@salesforce/schema/TR1__Job__c';

export default class AppsContainer extends LightningElement {
    @api recordId;
    @api jobs;
    @api NumberOfRecords = 5;
    @api applications;
    @api selectedItem;
    @api options;

    @track recordTypeId = '0125g000000MzwFAAS';
    @track selectedValue = '';
    @track selectedStage = '';
    @track selectedFunctionValue = '';
    @track selectedLocationValue = '';
    @track applied = false;
    @track finished = false;
    @track uniqArray = [];
    @track functionOptions = [];
    @track locationOptions = [];

    // @wire(getApps, { recordId: '$recordId' })
    // appData({data, error}) {
    //     if(data) {
    //         console.log(`Application Data: `, data);
    //         this.applications = data;
    //     } else if(error) {
    //         window.console.log('Error ===> ', JSON.stringify(error));
    //     }
    // }

    @wire(getsObjectDetails, { recordId: '$recordId', recordType: '$selectedValue', limitNo: '$NumberOfRecords' })
    recordObjectData({data, error}) {
        if(data){
            console.log(`data retured from apex class: `, data);
            this.jobs = data;
            this.createFunctionList(this.jobs);
            this.createLocationList(this.jobs);
        } else if(error) {
            window.console.log('Error ===> '+ JSON.stringify(error));
        }
    }

    // @wire(getPicklistValues, { recordTypeId: '0125g000000MzwFAAS', fieldApiName: STAGE })
    // returnedStageData({data1, error}) {
    //     if(data1) {
    //         console.log(`Data returned from getPicklistValues: `, data1)
    //         this.stageValues = data1;
    //     } else if(error) {
    //         window.console.log('Error ===> '+JSON.stringify(error));
    //     }
    // }

    @wire(getObjectInfo, { objectApiName: JOB_OBJECT })
    accObjectInfo({data, error}) {
        if(data) {
            console.log(`Value of data2 ==> `, data);
            let optionsValues = [];
            // map of record type Info
            const rtInfos = data.recordTypeInfos;

            // getting map values
            let rtValues = Object.values(rtInfos);

            for(let i = 0; i < rtValues.length; i++) {
                if(rtValues[i].name !== 'Master') {
                    optionsValues.push({
                        label: rtValues[i].name,
                        value: rtValues[i].recordTypeId
                    })
                }
            }

            this.options = optionsValues;
            console.log(`Options Values ==> `, this.options);
        }
        else if(error) {
            window.console.log('Error ===> '+ JSON.stringify(error));
        }
    }

    handleTileClick(evt) {
        console.log(`This is the evt: `, JSON.stringify(evt.detail));
        this.applied = true;
        this.finished = false;
        this.selectedItem =  JSON.parse(JSON.stringify(evt.detail));
        if(evt.detail.Id) {
            this.app_ID = evt.detail.Id;
        }
    }

    handleChange(event) {
        this.selectedValue = event.detail.value;
    }

    handleFunctionChange(event) {
        this.selectedFunctionValue = event.detail.value;
    }

    handleLocationChange(event) {
        this.selectedLocationValue = event.detail.value;
    }

    handleStageChange(event) {
        this.selectedStage = event.detail.value;
    }

    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
        this.applied = false;
        this.finished = false;
    }

    // Change Handlers.
    nameChangedHandler(event){
        this.strName = event.target.value;
    }
    numberChangedHandler(event){
        this.strAccountNumber = event.target.value;
    }
    phoneChangedHandler(event){
        this.strPhone = event.target.value;
    }

    appliedToJob(event) {
        this.finished = true;
    }

    createFunctionList(array) {
        let newArray = array.map(x => {
            return x.TR1__Division__c
        });
        if(newArray) {
            this.uniqArray = [...new Set(newArray)];
            let _functionOptions = [];
            for(let i = 0; i < this.uniqArray.length; i++) {
                _functionOptions.push({
                    label: this.uniqArray[i],
                    value: this.uniqArray[i]
                });
            }
            this.functionOptions = _functionOptions;
            console.log(`Function Options ==> `, JSON.stringify(this.functionOptions));
        }
    }

    createLocationList(array) {
        let newArray = array.map(x => {
            return x.TR1__City__c;
        });
        if(newArray) {
            let uniqArray = [...new Set(newArray)];
            let _locationOptions = [];
            for(let i = 0; i < uniqArray.length; i++) {
                _locationOptions.push({
                    label: uniqArray[i],
                    value: uniqArray[i]
                });
            }
            this.locationOptions = _locationOptions;
            console.log(`Location Options ==> `, JSON.stringify(this.locationOptions));
        }
    }
}