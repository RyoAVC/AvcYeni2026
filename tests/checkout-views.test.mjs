import test from 'node:test';
import assert from 'node:assert/strict';
import {checkoutView,passwordView,resultView} from '../app/checkout-views.mjs';
import {initializeCheckoutTestDatabase} from '../scripts/checkout-test-database.mjs';
import {createMockHttpHandler} from '../app/checkout-mock-http.mjs';
const options=[{slug:'start',name:'Start',price_amount_kurus:4999900,license_duration_days:30}];
test('test labels are explicitly environment gated, even if preview flag is passed',()=>{
 for(const env of [{NODE_ENV:'production'},{}, {NODE_ENV:'staging'}]) {
  for(const html of [checkoutView(options,env),passwordView(env),resultView('paid',env,true)]){
   assert.doesNotMatch(html,/Geliştirme önizlemesi|TASARIM ÖNİZLEMESİ|İZOLE MOCK TEST/);
  }
 }
 assert.match(checkoutView(options,{NODE_ENV:'test'}),/Geliştirme önizlemesi/);
});
test('brand assets, form labels, accessible feedback and password confirmation are present',()=>{
 const html=checkoutView(options,{NODE_ENV:'test'});
 assert.match(html,/alt="Avcı E-Ticaret"/);assert.match(html,/name="domain"/);
 assert.match(html,/aria-live="polite"/);assert.match(html,/name="viewport"/);
 assert.match(passwordView({}),/id="confirm"/);
 assert.match(resultView('failed',{}),/Ödeme tamamlanamadı/);
 assert.match(resultView('constructor',{}),/Sipariş bulunamadı/);
});
test('result ignores forged status query; mock and design previews are unavailable in production',async()=>{
 const db=initializeCheckoutTestDatabase();
 try {
  const testHandler=createMockHttpHandler({db,env:{NODE_ENV:'test',CHECKOUT_MOCK_MODE:'1'}});
  const result=await testHandler(new Request('http://127.0.0.1/checkout/sonuc?durum=paid'));
  assert.match(await result.text(),/Sipariş bulunamadı/);
  const prod=createMockHttpHandler({db,env:{NODE_ENV:'production',CHECKOUT_MOCK_MODE:'1'}});
  assert.equal((await prod(new Request('http://127.0.0.1/checkout/onizleme?durum=paid'))).status,404);
  for(const file of ['style.css','ui.js','logo.png','geist.woff2','geist-ext.woff2']) assert.equal((await testHandler(new Request('http://127.0.0.1/checkout-assets/'+file))).status,200);
 }finally{db.close();}
});
