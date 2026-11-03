import test from 'node:test';
import assert from 'node:assert/strict';
import {buildQuoteEmail, submitQuote} from '../assets/quote-form.js';

const values = {
  business: 'Test & Mutfak', person: 'Teknik test', email: 'test@example.com',
  phone: '00000000000', product: 'Mikroyeşillikler', quantity: 'Test miktarı',
  city: 'İzmir', district: 'Menemen', address: 'Gerçek adres değildir',
  discount_code: 'BAYDUR10', message: 'İlk satır\nİkinci satır & detay',
  _subject: 'Baydur Farm - Teknik test', _template: 'table', _honey: '',
  _next: 'https://baydurfarm.com/?sent=1#iletisim'
};
const response = result => ({ok: true, json: async () => result});

test('accepts a confirmed response and sends reply and source information without redirect', async () => {
  let sent;
  await submitQuote(values, {sourceUrl:'https://baydurfarm.com/', fetchImpl: async (url, options) => {
    sent = JSON.parse(options.body);
    assert.equal(url, 'https://formsubmit.co/ajax/baydurfarm@gmail.com');
    assert.equal(options.method, 'POST');
    assert.equal(options.credentials, 'omit');
    return response({success:'true', message:'The form was submitted successfully.'});
  }});
  assert.equal(sent._replyto, values.email);
  assert.equal(sent._url, 'https://baydurfarm.com/');
  assert.equal(sent._next, undefined);
  assert.equal(sent.discount_code, 'BAYDUR10');
  assert.equal(sent.message, values.message);
});

test('does not report delivery for errors, activation, or an invalid response', async () => {
  for (const result of [
    {success:false}, {success:'false'}, {},
    {success:true, message:'Please activate your form.'},
    {success:true, message:'Confirm your email before using this form.'}
  ]) {
    await assert.rejects(submitQuote(values, {fetchImpl:async()=>response(result)}));
  }
  await assert.rejects(submitQuote(values, {fetchImpl:async()=>({ok:false,status:522})}));
  await assert.rejects(submitQuote(values, {fetchImpl:async()=>({ok:true,json:async()=>{throw new SyntaxError('HTML error page')}})}));
  await assert.rejects(submitQuote(values, {fetchImpl:async()=>{throw new TypeError('Network failure')}}));
});

test('a stalled service times out and aborts the request', async () => {
  let signal;
  await assert.rejects(submitQuote(values, {timeoutMs:10,fetchImpl:async(_, options)=>{
    signal=options.signal;
    return new Promise(()=>{});
  }}), /delivery-timeout/);
  assert.equal(signal.aborted,true);
});

test('a populated honeypot is never submitted or reported as delivered', async () => {
  let called=false;
  await assert.rejects(submitQuote({...values,_honey:'spam'}, {fetchImpl:async()=>{called=true;return response({success:true})}}));
  assert.equal(called,false);
});

test('email alternatives preserve every quote field and Unicode in each language', () => {
  for (const language of ['tr','en','de','es','fr']) {
    const email=buildQuoteEmail(values,language);
    const gmail=new URL(email.gmail);
    assert.equal(gmail.searchParams.get('to'),'baydurfarm@gmail.com');
    assert.equal(gmail.searchParams.get('su'),email.subject);
    assert.equal(gmail.searchParams.get('body'),email.body);
    for (const key of ['business','person','email','phone','product','quantity','city','district','address','discount_code','message']) {
      assert.ok(email.body.includes(values[key]), key);
    }
    assert.equal(decodeURIComponent(email.mailto.split('&body=')[1]), email.body);
    assert.ok(!email.body.includes('_next'));
  }
});
