global class RestCallOut {

    @AuraEnabled(cacheable=true)
    public static string getResponse(String str) {
        System.debug('Method called----'); 
       Http http = new Http();
       HttpRequest request = new HttpRequest();
       String url = 'https://api.football-data.org/v2/'+str;
       system.debug('url--'+url);
       request.setEndpoint(url);
       request.setHeader('Content-Type', 'application/json');
       request.setHeader('X-Auth-Token', '3b3a5451c8d44f609342178e3652f9b5');
       request.setMethod('GET');
  
       HttpResponse response =  http.send(request);
       System.debug('getReview Response---'+response.getBody());
       System.debug('Response Code---'+response.getStatusCode()); 
     
       return response.getBody();
  
    }
  
    
  
  }