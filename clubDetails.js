import { LightningElement,wire } from 'lwc';
import {registerListener,unregisterAllListeners} from 'c/pubsub';
import {CurrentPageReference} from 'lightning/navigation';
import getResponse from '@salesforce/apex/RestCallOut.getResponse';



export default class ClubDetails extends LightningElement {
    @wire (CurrentPageReference) pageRef;
    teamDetails={};
    showTeamDetails = false;
    teamId;showSquad=false;
    squad;

    connectedCallback() {
        //called from footballWorld Comp
       
        registerListener('clubDetails', this.handleMessage, this);
        registerListener('closeClubDetails',this.closeClubSection,this);

    }
    
    handleMessage(eventValue) {
        console.log('clubDetails',JSON.stringify(eventValue));
        this.teamDetails =  eventValue;
        this.teamId = this.teamDetails.id;
        this.showTeamDetails= true; 
    }

    onClickSquad(){
       if (!this.showSquad) {
             const str = 'teams/'+this.teamId;
             getResponse({ str : str})
              .then(response=>{
                console.log('Squad -', JSON.parse(response));     
                this.squad = JSON.parse(response);
                this.showSquad=true; 
             })     
             .catch(error=>{
                console.log('Error---',JSON.stringify(error));
            }); 
        } else {this.showSquad = false;}
        
    }


    closeClubSection(){
        this.showTeamDetails= false; 
        this.showSquad = false;
    }

    onClickFixtures(){
        alert ('this feature is coming soon!!!!');
    }
    
   
    
    disconnectedCallback(){
        unregisterAllListeners(this);
    }

}