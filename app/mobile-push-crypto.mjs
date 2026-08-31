const encoder=new TextEncoder();
const bytesToBase64=(bytes)=>{let binary="";for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary).replaceAll("+","-").replaceAll("/","_").replace(/=+$/u,"");};
const base64ToBytes=(value)=>{const normalized=String(value).replaceAll("-","+").replaceAll("_","/");const binary=atob(normalized+"=".repeat((4-normalized.length%4)%4));return Uint8Array.from(binary,(char)=>char.charCodeAt(0));};

export async function hashPushToken(token){
  return bytesToBase64(new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(token))));
}

export async function encryptPushToken(token,secret){
  if(String(secret||"").length<32)throw new Error("MOBILE_PUSH_ENCRYPTION_KEY must contain at least 32 characters");
  const keyBytes=await crypto.subtle.digest("SHA-256",encoder.encode(String(secret)));
  const key=await crypto.subtle.importKey("raw",keyBytes,{name:"AES-GCM"},false,["encrypt"]);
  const nonce=crypto.getRandomValues(new Uint8Array(12));
  const ciphertext=await crypto.subtle.encrypt({name:"AES-GCM",iv:nonce},key,encoder.encode(token));
  return {ciphertext:bytesToBase64(new Uint8Array(ciphertext)),nonce:bytesToBase64(nonce)};
}

export async function decryptPushToken(ciphertext,nonce,secret){
  if(String(secret||"").length<32)throw new Error("MOBILE_PUSH_ENCRYPTION_KEY must contain at least 32 characters");
  const keyBytes=await crypto.subtle.digest("SHA-256",encoder.encode(String(secret)));
  const key=await crypto.subtle.importKey("raw",keyBytes,{name:"AES-GCM"},false,["decrypt"]);
  const plaintext=await crypto.subtle.decrypt({name:"AES-GCM",iv:base64ToBytes(nonce)},key,base64ToBytes(ciphertext));
  return new TextDecoder().decode(plaintext);
}
