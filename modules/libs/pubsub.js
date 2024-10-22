const {PubSub} = require('@google-cloud/pubsub');

class pubsub
{

    static async publishMessage(topic, message) {

        let promise =  new Promise( async (resolve, reject)=>{
            try{ 

                const psb = new PubSub();

                const data = JSON.stringify({
                    message: message,
                    timestamp: Date.now()
                });
                  
                psb.topic(topic).publish(Buffer.from(data));

                resolve();
            }
            catch(e) {
                reject(e);
            }
        })
        return promise;


    }  
}

module.exports = pubsub;