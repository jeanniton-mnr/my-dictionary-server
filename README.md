# EDictionary, formaly known as MyDictionary, server application

##  The API   

This application responds to request made by the client application. It primarely sends to type of data:   
1. The definition of a (input) word/lemma   
2. the suggestions for predictive words or close matches of (input) word/lemma  



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


Note:  
1. Sending a get request to route `/` will return an HTML page that tell if the web server application is running, its hostname and port.
2. On error, dictionary returns a JSON object with a key `error` which contains the error message `{error: "..."}`.


## Sample of data returned by the API:

### `/suggestion?lemma=love`:   
`{"corrected":false,"suggestions":["love","love's","loveall","lovecchio","loved","loveday","lovegrove","lovejoy","lovelace","lovelan"]}`


### `/define?lemma=love`:   
`{"lemma":"love","phoneme":"L AH1 V","classes":{"v":[{"definition":"have a great affection or liking for;","examples":["I love French food"," She loves her boss and works hard for him"],"synonyms":[],"antonyms":["hate","detest"]},{"definition":"get pleasure from;","examples":["I love cooking"],"synonyms":["enjoy"]},{"definition":"be enamored or in love with;","examples":["She loves her husband deeply"],"synonyms":[]},{"definition":"have sexual intercourse with;","examples":["This student sleeps with everyone in her dorm"," Adam knew Eve"," Were you ever intimate with this man?"],"synonyms":["sleep together","roll in the hay","make out","make love","sleep with","get laid","have sex","know","do it","be intimate","have intercourse","have it away","have it off","screw","fuck","jazz","eff","hump","lie with","bed","have a go at it","bang","get it on","bonk"]}],"n":[{"definition":"a strong positive emotion of regard and affection;","examples":["his love for his work"," children need a lot of love"],"synonyms":[],"antonyms":["hate","hatred"]},{"definition":"any object of warm affection or devotion;","examples":["the theater was her first love"," he has a passion for cock fighting",""],"synonyms":["passion"]},{"definition":"a beloved person; used as terms of endearment","examples":[""],"synonyms":["beloved","dear","dearest","honey"]},{"definition":"a deep feeling of sexual desire and attraction;","examples":["their love left them indifferent to their surroundings"," she was his first love"],"synonyms":["sexual love","erotic love"]},{"definition":"a score of zero in tennis or squash;","examples":["it was 40 love"],"synonyms":[]},{"definition":"sexual activities (often including sexual intercourse) between two people;","examples":["his lovemaking disgusted her"," he hadn't had any love in months"," he has a very complicated love life"],"synonyms":["sexual love","lovemaking","making love","love life"]}]}}`
