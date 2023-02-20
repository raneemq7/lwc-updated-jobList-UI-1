import { LightningElement, track, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import RECORDTYPEID from '@salesforce/schema/TR1__Job__c.RecordTypeId';
import getUsers from '@salesforce/apex/getUserDetails.getUsers';
import getPortalUserDetails from '@salesforce/apex/getPortalUserDetails.getUsers';
import JOB_DESC from '@salesforce/schema/TR1__Job__c.TR1__Client_Job_Description__c';
import {NavigationMixin} from "lightning/navigation";

const _FIELDS = [RECORDTYPEID];

export default class AppTile extends NavigationMixin(LightningElement) {
    @api job
    @api jobdetailpageapiname;
    @api recordTypeName;
    @api details = false;
    @track record;
    @track error;
    @track currentStep = "1";
    @track fullPhotoUrl;
    @track isModalOpen = false;
    // @track mapMarkers;
    // @track zoomLevel = 10;
    @track _mostAdvancedStage;
    stageObject = {'Internal Interview': '1', 'Application': '1', 'Screening': '2', 'Preonboarding': '2', 'Submittal': '3', 'Send Out': '3', 'Onboarding': '4', 'TR1__ATSv2_Offer': '4', 'Closing Report': '5', 'default': '1'};

    Fields = [JOB_DESC];

    openModal() {
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true;
    }

    closeModal() {
        // to close modal set isModalOpen track value as false
        this.isModalOpen = false;
    }

    connectedCallback() {
        if(this.job) {
            this._mostAdvancedStage = (this.job.TR1__Most_Advanced_Stage__c ? this.job.TR1__Most_Advanced_Stage__c : this.job.TR1__Stage__c);
            console.log(`Most Advanced Stage: `, this._mostAdvancedStage);
            this.mapMarkers = [
                {
                    location: {
                        Latitude: this.job.TR1__Account__r.BillingLatitude,
                        Longitude: this.job.TR1__Account__r.BillingLongitude,
                    },
                },
            ];
            if(this._mostAdvancedStage) {
                this.currentStep = this.getStep(this._mostAdvancedStage);
                console.log(`Current Step: `, this.currentStep);
            }
        }
    }

    getStep(stage) {
        const stages = this.stageObject;
        return (stages[stage || stages['default']]);
    }

    @wire(getRecord, { recordId: '$job.Id', fields: _FIELDS })
    wiredAccount({ error, data }) {
      if (data) {
        this.record = data;
        this.recordTypeName = data.recordTypeInfo.name;
        this.error = undefined;
      } else if (error) {
        this.error = error;
        console.log(`recordTile Error: `, error);
        this.record = undefined;
      }
    }

    @wire(getUsers, { recordId: '$job.OwnerId' })
    wiredAccount({ error, data }) {
      if (data) {
        let [_object] = data 
        if(_object) {
            this.fullPhotoUrl = `/sfsites/c/${_object.FullPhotoUrl.split("/sfsites/c/").pop()}`;
            console.log(`User Photo URL`, this.fullPhotoUrl);
            //profilephoto/7295g0000004ogH/F
            //<img data-aura-rendered-by="3:287;a" src="/sfsites/c/profilephoto/7295g0000004ogW/M" class="circularPhoto" alt="ainsleygrover">
            this.error = undefined;
        } else {
            this.fullPhotoUrl = this.job.Recruiter_Headshot__c
        }
      } else if (error) {
        this.error = error;
        this.fullPhotoUrl = 'https://i.imgur.com/lL45vaX.png';
        console.log(`recordTile Error: `, error);
        this.record = undefined;
      }
    }

    // @wire(getPortalUserDetails, { recordId: '$application.TR1__Job__r.OwnerId' })
    // userDataReturned({ error, data }) {
    //     if (data) {
    //       let [_object] = data 
    //       console.log(`candidateHomeContainer Data: `, _object);
    //       if(_object) {
    //           if(_object.FullPhotoUrl) {
    //             this.fullPhotoUrl = `${_object.FullPhotoUrl.split("/sfsites/c/").pop()}`;
    //             console.log(`User Photo URL`, this.fullPhotoUrl);
    //           } else {
    //             this.fullPhotoUrl = "https://i.imgur.com/lL45vaX.png"
    //           }
    //       } else {
    //         this.fullPhotoUrl = "https://i.imgur.com/lL45vaX.png"
    //       }
    //       this.error = undefined;
    //     } else if (error) {
    //       this.error = error;
    //       console.log(`recordTile Error: `, error);
    //       this.record = undefined;
    //     }
    // }

    tileClick() {
        console.log(`tileClick: `, JSON.parse(JSON.stringify(this.job)));
        const job = JSON.parse(JSON.stringify(this.job));
        const event = new CustomEvent('tileclick', {
            // detail contains only primitives
            detail: job
        });
        // Fire the event from c-tile
        this.dispatchEvent(event);
    }

    expandDetails() {
        if(this.details) {
            this.details = false;
        } else {
            this.details = true;
        }
    }

    navigateToInternalPage() {
        // Use the basePath from the Summer '20 module to construct the URL
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'applicationsList__c'
            }
        });
    }

    navigateToJobDetailPage() {
        console.log(`I'm firing`);
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: this.jobdetailpageapiname
            },
            state: {
                recordId: this.job.Id
            }
        });
    }
}