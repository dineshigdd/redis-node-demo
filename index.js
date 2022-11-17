import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import { createClient } from 'redis';


const app = express();
const port = process.env.PORT || 8080;

const client = createClient();
await client.connect();




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});




//read from Redis, if there is no posts, Data will be fetched from API.
//if there is data in Redis, this data will be returned
app.get('/getredis', ( req, res ) => {
       client.get('posts').then( data => {
          if( data!= null ){          
            res.json( "Read from redis<br /><br />"+ data );
          }else{
                fetch('https://jsonplaceholder.typicode.com/posts/1')
                  .then((response) =>  response.json())
                  .then(
                    ( APIData ) => {                      
                      
                      client.set( 'posts' , JSON.stringify( APIData ));
                      res.json( "API Data<br /><br />"+
                        JSON.stringify(  APIData ) 
                        )
                }
              )
      
          }
        
        });
});


//clearing the redis cache
app.get("/clear", ( req, res ) =>{
       
  client.flushAll().then( ( reply ) => {    
  res.json( reply)

})
})

app.get('/getredis', async ( req, res ) => {
  const data = await client.get('posts');
  
     if( data ){          
       res.json( "Read from redis<br /><br />"+ data );
     }else{
           fetch('https://jsonplaceholder.typicode.com/posts/1')
             .then( response =>  response.json())
             .then( APIData  => {                      
                 
                 client.set( 'posts' , JSON.stringify( APIData ));
                 res.json( "API Data<br /><br />"+
                   JSON.stringify(  APIData ) 
                   )
           }
         )
 
     }
   
  
});




app.listen(port);
console.log('Server started at http://localhost:' + port);