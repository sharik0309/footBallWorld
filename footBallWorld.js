import { LightningElement,wire,api } from 'lwc';
import getResponse from '@salesforce/apex/RestCallOut.getResponse';
import {fireEvent} from 'c/pubsub';
import {CurrentPageReference} from 'lightning/navigation';


    //   https://api.football-data.org/v2/competitions?plan=TIER_ONE

const columns = [
    { label: 'Club', fieldName: 'team.name' },
    { label: 'Played', fieldName: 'playedGames' },
    { label: 'Won', fieldName: 'won'  },
    { label: 'Draw', fieldName: 'draw' },
    { label: 'Lost', fieldName: 'lost' },
    { label: 'Points', fieldName: 'points' },
    { label: 'Goals for', fieldName: 'goalsFor' },
    { label: 'Goal Against', fieldName: 'goalsAgainst' },
    { label: 'Goal Diff', fieldName: 'goalDifference' },
]; 

export default class FootBallWorld extends LightningElement {

    casesSpinner = false;
    param;selected='neutral';
    onButton = true;topScorer;showTopScorer=false;isModalOpen=false;
    showComp = false; compDetailShow = false; showTeamsList =false;
    CompDetails; compId; teamList; teamDetails;showTeamDetails;
    playerDetails;showPointsTable=false;pointsTable;compCode;
    showfixture = false; fixtures; showResults=false;result;

    @wire (CurrentPageReference) pageRef;

    onClickCompetition() {
        this.casesSpinner = true;
      if (!this.showComp) { //display component if its hidden
        getResponse({ str : 'competitions?plan=TIER_ONE'}) // show only tier 1 teams
       .then(response=>{
            this.showComp = true;
            this.data = JSON.parse(response); 
            this.casesSpinner = false;
        })
       .catch(error=>{
        console.log('Error---',JSON.stringify(error));
        });
      } else { //hide component if it is visible
               this.showComp = false;this.compDetailShow= false;
               this.showTeamsList = false; this.showTeamDetails=false;
               this.showPointsTable=false; this.showResults = false;
               this.showfixture = false;
               fireEvent(this.pageRef,'closeClubDetails',false);
        }
    } 
    
    selectionChangeHandler(event){
       
        const selectedId = event.target.value;
        console.log('Comp ID-',selectedId);
        const index = this.data.competitions.findIndex(x => x.code === selectedId);  //get array postion of selcted item
        this.CompDetails = this.data.competitions[index];
        this.compId = this.CompDetails.id;
        this.compCode = this.CompDetails.code;

        this.compDetailShow= true; 
        this.showTeamDetails = false;
        this.showTopScorer = false;
        this.showPointsTable = false;

        const str = 'competitions/'+this.compId+'/teams';
        this.casesSpinner = true;
        getResponse({ str : str})
         .then(response=>{
          console.log('Teams-', JSON.parse(response));     
          this.teamList = JSON.parse(response);
          this.showTeamsList = true;
          this.casesSpinner = false;
        })
        .catch(error=>{
           console.log('Error---',JSON.stringify(error));
       }); 
    }

    selectionShowTeams(event){
        const selectedId = event.target.value;
        console.log('Team ID-',selectedId);
        const index = this.teamList.teams.findIndex(x => x.tla ===selectedId); 
       // this.teamDetails = this.teamList.teams[index];
        const clubDetails = this.teamList.teams[index];
        //this.showTeamDetails=true;
        fireEvent(this.pageRef,'clubDetails',clubDetails);
       
    }
   
    onMouseOver(){
        if (this.onButton) { this.selected= 'success';this.onButton = false;}
          else {this.selected= 'neutral';this.onButton = true;}      
    }

    topScorerClick(){
      
        if (!this.showTopScorer) {
            this.casesSpinner = true;
         const str = 'competitions/'+this.compId+'/scorers';
         getResponse({ str : str})
          .then(response=>{
            console.log('Top Scrore-', JSON.parse(response));     
            this.topScorer = JSON.parse(response);
            this.showTopScorer=true; 
            this.casesSpinner = false;
         })
         .catch(error=>{
            console.log('Error---',JSON.stringify(error));
        }); 
       } else {this.showTopScorer = false;}
    }

    playerOnClick(event){ 
        const selectedId = event.target.id;
        const selectedIdd = selectedId.substring(0,selectedId.length-3);
        const index = this.topScorer.scorers.findIndex(x => x.player.name ===selectedIdd); 
        this.playerDetails = this.topScorer.scorers[index];
        this.isModalOpen=true;  
    }

    onClickPointsTable() {
       if (!this.showPointsTable){
        this.casesSpinner = true;
         const str = 'competitions/'+this.compId+'/standings';
         getResponse({ str : str})
          .then(response=>{
            const table = JSON.parse(response);
            this.pointsTable = table.standings[0];
            console.log('Points table-', this.pointsTable); 
            this.showTopScorer = false
            this.showPointsTable=true;
            this.showfixture=false
            this.casesSpinner = false;
         })
         .catch(error=>{
          console.log('Error---',JSON.stringify(error));
        }); 
       } else {this.showPointsTable=false;}
    }

    onClickfixtures(){
        if (!this.showfixture){
            this.casesSpinner = true;
        const str = 'competitions/'+this.compCode+'/matches?status=SCHEDULED';
        getResponse({ str : str})
        .then(response=>{
          const fixtures = JSON.parse(response);
          this.fixtures = fixtures;
          this.showfixture = true;
          this.showPointsTable=false;
          this.casesSpinner = false;
          // this.pointsTable = table.standings[0];
          //this.showTopScorer = false
          //this.showPointsTable=true;
       })
       .catch(error=>{
        console.log('Error---',JSON.stringify(error));
      }); 
      } else {this.showfixture=false;}
    }

    onClickResults(){
        if (!this.showResults){
            this.casesSpinner = true;
        const str = 'competitions/'+this.compCode+'/matches?status=FINISHED';
        getResponse({ str : str})
        .then(response=>{
          const result = JSON.parse(response);
          console.log('result=='+JSON.stringify(result));
          this.result = result;
          this.showResults=true;
          this.showfixture = false;
          this.showPointsTable=false;
          this.casesSpinner = false;
       })
       .catch(error=>{
        console.log('Error---',JSON.stringify(error));
      }); 
      } else {this.showResults=false;}
    }

    closeModal() {
       this.isModalOpen = false;
    } 

    
    
    // Making Callout using Fetch
    /*
    handleCurrencyConversion(str) {
        fetch('https://api.football-data.org/v2/'+str, // End point URL
        {
            // Request type
            method:"GET",
            
            headers:{
                // content type
                "Content-Type": "application/json",
                // adding your access token 
                "X-Auth-Token": "3b3a5451c8d44f609342178e3652f9b5",
            }
        })
        .then((response) => {
            
            console.log('Response  ===> '+JSON.stringify(response));
            this.data = JSON.parse(response);
            
        })
        .catch(error => {
            console.log('callout error ===> '+JSON.stringify(error));
        })
    } */ 
}