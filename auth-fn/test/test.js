process.env.AD_ROOT='DC=brehmcla,DC=amazon,DC=com'
process.env.AD_URL='ldap://172.31.20.155'

const app = require('../index.js');
const assert = require('assert')
const event = {
  pathParameters: {
    username: "gary"
  },
  headers: {
    Password: 'sC08Fz&87iv@xkF'
  }
};

describe('transfer-auth',()=>{
  describe('#handler', ()=> {
    it('should work', async()=>{
        let resp = await app.handler(event);
        console.log("resp",resp);
        assert(!!resp);
    })
    it('shoud err on bad password',async()=>{
      let e=Object.assign({}, event);
      e.headers.Password="xxxx";
      try {
        let r= await app.handler(e);
        console.log("got resp", JSON.stringify(r));
        throw new Error("got response");
      } catch (err) {
        console.log("got error",err)
        assert(!!err);
        assert.notEqual(err.message,"got response");
      }
    })
  })
})