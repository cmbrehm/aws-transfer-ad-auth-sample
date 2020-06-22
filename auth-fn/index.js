const ldap=require('ldapjs');
const AD_DN=process.env.AD_ROOT


async function getGroupForUser(userId,pass) {
        const client = ldap.createClient({
        url: process.env.AD_URL
    })
    return new Promise((resolve,reject) => {
        const userDn=`CN=${userId},CN=Users,${AD_DN}`
        console.log("userDn",userDn)
        client.bind(userDn, pass, (err,_)=> {
            if(err)  {
                console.error("bind error",err);
                client.unbind((err)=>console.error("unbind err",err));
                reject(err);
            }
            client.search(userDn, {attributes: ["memberOf"]}, (err,res) =>{
                let group;

                if (err) {
                    console.error("search error",err);
                     client.unbind((err)=>console.error("unbind err",err));
                    reject(err)
                }
                res.on('searchEntry',(entry) => {
                    group = entry.toObject().memberOf;
                    //console.log('got group',group);
                })
                res.on('end',() => {
                    console.log("end");
                    client.unbind((err)=>console.error("unbind err",err));
                    resolve(group);
                })
                res.on('error', (err)=>{
                    console.error("search error",err);
                    client.unbind((err)=>console.error("unbind err",err));
                    reject(err)
                });
            })
        })        
    })

}

exports.handler = async (event) => {
    console.log("event",event);

    let userId=event.pathParameters.username.replace('+',' ');
    let pass = event.headers.Password;
    let group = await getGroupForUser(userId,pass);
    let groupName=group.substring(3,group.indexOf(',',4))
    console.log("groupName", groupName);
    return {            
        Role: process.env.USER_ROLE,
        Policy: {
            Version: '2012-10-17',
            Statement: [
                { 
                    Effect: "Allow",
                    Action: [
                        "s3:PutObject",
                        "s3:GetObject",
                        "s3:DeleteObject",
                        "s3:GetObjectVersion",
                        "s3:DeleteObjectVersion",
                        "s3:GetObjectACL",
                        "s3:PutObjectACL"
                    ],
                    Resource: '${transfer:HomeDirectory}'
                }
            ]        
        },
        HomeDirectory: `/${groupName}`
    }
}