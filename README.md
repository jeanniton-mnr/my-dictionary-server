# EDictionary, formaly known as MyDictionary, server application

##  The API   

This application respond to request made by the application. It primarely sends to type of data:   
1. The definition of a (input) word/lemma   
2. the suggestions for predictive words or close matches of (input) word   



### API
0.
      GET `/` : Will return an HTML page. See below note.

1.   
      GET `/define`:
        Parameters:
            String `lemma` The input from which to compute the definitions data.     
      
      POST `/`:
        Will redirect the request from the value of the `action=define` from the `parameters`. 

2.   
      GET `/suggestions`:   
      Parameters:      
                `String` `lemma` The input from which to compute the suggestions.


Note: Sending a get request to route `/` will return an HTML page that tell if the web server application is running, its hostname and port.
