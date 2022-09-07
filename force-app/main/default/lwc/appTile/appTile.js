import { LightningElement, track, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import RECORDTYPEID from '@salesforce/schema/TR1__Job__c.RecordTypeId';
import getUsers from '@salesforce/apex/getUserDetails.getUsers';
import getPortalUserDetails from '@salesforce/apex/getPortalUserDetails.getUsers';
import JOB_DESC from '@salesforce/schema/TR1__Job__c.TR1__Client_Job_Description__c'

const _FIELDS = [RECORDTYPEID];

export default class AppTile extends LightningElement {
    @api job
    @api recordTypeName;
    @api details = false;
    @track record;
    @track error;
    @track currentStep = "1";
    @track fullPhotoUrl;
    @track isModalOpen = false;
    @track mapMarkers;
    @track zoomLevel = 10;

    Fields = [JOB_DESC];

    openModal() {
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true;
    }

    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
    }

    connectedCallback() {
        if(this.job) {
            this.mapMarkers = [
                {
                    location: {
                        Latitude: this.job.TR1__Account__r.BillingLatitude,
                        Longitude: this.job.TR1__Account__r.BillingLongitude,
                    },
                },
            ];
            switch(this.job.TR1__Stage__c) {
                case "Send Out":
                    this.currentStep = "1"
                    break;
                case "Application":
                    this.currentStep = "2"
                    break;
                case "Closing Report":
                    this.currentStep = "5"
                    break;
            }
        }
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
}