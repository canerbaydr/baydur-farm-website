import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {generateKeyPairSync, sign, verify, createHash} from 'node:crypto';
import {handleRequest} from '../server/mail-worker.mjs';

const quote={requestId:'c92dc73f-174c-416c-8b92-50d6c34b88b4',business:'Test mutfak',person:'Teknik test',email:'test@example.com',phone:'00000000000',product:'Mikroyeşillik',quantity:'Test miktarı',city:'İzmir',district:'Menemen',address:'Gerçek adres değildir',discount_code:'BAYDUR10',message:'Teknik test; sipariş değildir.'};
const signing=generateKeyPairSync('rsa',{modulusLength:2048});
const publicJwk=signing.publicKey.export({format:'jwk'});
const env={GOOGLE_SCRIPT_URL:'https://script.google.com/macros/s/test/exec',MAIL_SIGNING_KEY:JSON.stringify(signing.privateKey.export({format:'jwk'}))};
function signedInput(quote,timestamp=Date.now()) {const payload=JSON.stringify({quote,timestamp});return {payload,signature:sign('sha256',Buffer.from(payload),signing.privateKey).toString('base64url')};}
function request(input=quote,origin='https://baydurfarm.com') {return new Request('https://mail.example/quote',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(input)});}

test('backend confirms a matching send result and forwards only validated fields',async()=>{
  let sent;
  const result=await handleRequest(request({...quote,to:'other@example.com',_cc:'other@example.com'}),env,{fetchImpl:async(url,options)=>{
    sent=JSON.parse(options.body);
    assert.equal(url,env.GOOGLE_SCRIPT_URL);
    return Response.json({success:true,requestId:quote.requestId});
  }});
  assert.equal(result.status,200);
  assert.equal((await result.json()).success,true);
  assert.equal(result.headers.get('Access-Control-Allow-Origin'),'https://baydurfarm.com');
  assert.equal(verify('sha256',Buffer.from(sent.payload),signing.publicKey,Buffer.from(sent.signature,'base64url')),true);
  assert.equal(JSON.parse(sent.payload).quote.to,undefined);
  assert.equal(JSON.parse(sent.payload).quote._cc,undefined);
});

test('backend rejects bad fields, spam, excessive data, foreign origins and rate limits',async()=>{
  const never=async()=>{throw new Error('should not call upstream');};
  for(const invalid of [{...quote,email:'a@example.com\r\nBcc:b@example.com'},{...quote,address:''},{...quote,_honey:'spam'},{...quote,message:'x'.repeat(17000)}]){
    assert.equal((await handleRequest(request(invalid),env,{fetchImpl:never})).status,400);
  }
  assert.equal((await handleRequest(request(quote,'https://other.example'),env,{fetchImpl:never})).status,403);
  assert.equal((await handleRequest(request(),{...env,MAIL_RATE_LIMIT:{limit:async()=>({success:false})}},{fetchImpl:never})).status,429);
});

test('backend never confirms a failed or mismatched Google response',async()=>{
  for(const result of [{success:false,code:'quota-exceeded'},{success:true,requestId:'other'},{}]){
    const response=await handleRequest(request(),env,{fetchImpl:async()=>Response.json(result)});
    assert.notEqual(response.status,200);
    assert.equal((await response.json()).success,false);
  }
  const response=await handleRequest(request(),env,{fetchImpl:async()=>new Response('Login required')});
  assert.equal(response.status,502);
});

function googleRuntime({quota=10,failSend=false}={}){
  const properties=new Map();
  const messages=[];
  let locked=false;
  const context={PropertiesService:{getScriptProperties:()=>({getProperty:k=>properties.get(k)||null,setProperty:(k,v)=>properties.set(k,v)})},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})},
    LockService:{getScriptLock:()=>({tryLock:()=>{locked=true;return true;},releaseLock:()=>{locked=false;}})},
    MailApp:{getRemainingDailyQuota:()=>quota,sendEmail:message=>{if(failSend)throw new Error('send failed');messages.push(message);}},
    Utilities:{base64DecodeWebSafe:value=>Array.from(Buffer.from(value,'base64url')),DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(_,value)=>Array.from(createHash('sha256').update(value).digest())}
  };
  vm.createContext(context);
  const source=readFileSync(new URL('../server/google-mail.gs',import.meta.url),'utf8').replace(/const MAIL_PUBLIC_KEY = .*;/,'const MAIL_PUBLIC_KEY = '+JSON.stringify(publicJwk)+';');
  vm.runInContext(source,context);
  return {post:(input)=>context.doPost({postData:{contents:JSON.stringify(input)}}),messages,isLocked:()=>locked};
}

test('Google sender fixes the recipient and deduplicates a retried request',()=>{
  const runtime=googleRuntime();
  const input=signedInput({...quote,to:'other@example.com'});
  assert.equal(runtime.post(input).success,true);
  assert.equal(runtime.post(input).success,true);
  assert.equal(runtime.messages.length,1);
  assert.equal(runtime.messages[0].to,'baydurfarm@gmail.com');
  assert.equal(runtime.messages[0].replyTo,'test@example.com');
  assert.ok(runtime.messages[0].body.includes('BAYDUR10'));
  assert.equal(runtime.isLocked(),false);
});

test('Google sender fails safely without permission, remaining quota or a successful send',()=>{
  const input=signedInput(quote);
  assert.equal(googleRuntime().post({...input,signature:'wrong'}).success,false);
  assert.equal(googleRuntime().post({...input,payload:input.payload+' '}).success,false);
  assert.equal(googleRuntime().post(signedInput(quote,Date.now()-600000)).code,'expired');
  assert.equal(googleRuntime({quota:0}).post(input).code,'quota-exceeded');
  const runtime=googleRuntime({failSend:true});
  assert.equal(runtime.post(input).success,false);
  assert.equal(runtime.isLocked(),false);
  assert.equal(runtime.messages.length,0);
});
