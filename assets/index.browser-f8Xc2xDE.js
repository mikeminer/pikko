var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,o)=>(o=n==null?{}:e(i(n)),s(r||!n||!n.__esModule||!a.call(n,`default`)?t(o,`default`,{value:n,enumerable:!0}):o,n)),l=8078012,u=8078026,d=8078027;function f(e){return Array.isArray(e)?`%5B`+e.map(f).join(`%2C%20`)+`%5D`:typeof e==`bigint`?`${e}n`:encodeURIComponent(String(e!=null&&Object.getPrototypeOf(e)===null?{...e}:e))}function p([e,t]){return`${e}=${f(t)}`}function m(e){let t=Object.entries(e).map(p).join(`&`);return btoa(t)}function h(e,t={}){{let n=`Solana error #${e}; Decode this error by running \`npx @solana/errors decode -- ${e}`;return Object.keys(t).length&&(n+=` '${m(t)}'`),`${n}\``}}var g=class extends Error{cause=this.cause;context;constructor(...[e,t]){let n,r;t&&Object.entries(Object.getOwnPropertyDescriptors(t)).forEach(([t,i])=>{t===`cause`?r={cause:i.value}:(n===void 0&&(n={__code:e}),Object.defineProperty(n,t,i))});let i=h(e,n);super(i,r),this.context=Object.freeze(n===void 0?{__code:e}:n),this.name=`SolanaError`}};function _(e,t){return`fixedSize`in t?t.fixedSize:t.getSizeFromValue(e)}function v(e){return Object.freeze({...e,encode:t=>{let n=new Uint8Array(_(t,e));return e.write(t,n,0),n}})}function y(e){return Object.freeze({...e,decode:(t,n=0)=>e.read(t,n)[0]})}function b(e,t,n=t){if(!t.match(RegExp(`^[${e}]*$`)))throw new g(l,{alphabet:e,base:e.length,value:n})}function x(e){let t=e.isWellFormed;if(!(typeof t==`function`&&t.call(e)))for(let t=0;t<e.length;t++){let n=e.charCodeAt(t);if(n<55296||n>57343)continue;let r=e.charCodeAt(t+1);if(n<=56319&&r>=56320&&r<=57343){t++;continue}throw new g(d,{index:t,value:e})}}function S(e,t=0){let n=e.length,r=t;for(;r<n;){let t=e[r],i,a=128,o=191;if(t<128){r++;continue}if(t>=194&&t<=223)i=1;else if(t>=224&&t<=239)i=2,t===224&&(a=160),t===237&&(o=159);else if(t>=240&&t<=244)i=3,t===240&&(a=144),t===244&&(o=143);else return r;let s=r;r++;for(let t=0;t<i;t++,r++){if(r>=n)return s;let i=e[r];if(!(t===0?i>=a&&i<=o:i>=128&&i<=191))return s}}return-1}function C(e,t=0){let n=S(e,t);if(n!==-1)throw new g(u,{bytes:e,offset:n})}var ee=e=>v({getSizeFromValue:t=>{let[n,r]=T(t,e[0]);if(!r)return t.length;let i=te(r,e);return n.length+Math.ceil(i.toString(16).length/2)},write(t,n,r){if(b(e,t),t===``)return r;let[i,a]=T(t,e[0]);if(!a)return n.set(new Uint8Array(i.length).fill(0),r),r+i.length;let o=te(a,e),s=[];for(;o>0n;)s.unshift(Number(o%256n)),o/=256n;let c=[...Array(i.length).fill(0),...s];return n.set(c,r),r+c.length}}),w=e=>y({read(t,n){let r=n===0||n<=-t.byteLength?t:t.slice(n);if(r.length===0)return[``,t.length];let i=r.findIndex(e=>e!==0);i=i===-1?r.length:i;let a=e[0].repeat(i);return i===r.length?[a,t.length]:[a+E(r.slice(i).reduce((e,t)=>e*256n+BigInt(t),0n),e),t.length]}});function T(e,t){let[n,r]=e.split(RegExp(`((?!${t}).*)`));return[n,r]}function te(e,t){let n=BigInt(t.length),r=0n;for(let i of e)r*=n,r+=BigInt(t.indexOf(i));return r}function E(e,t){let n=BigInt(t.length),r=[];for(;e>0n;)r.unshift(t[Number(e%n)]),e/=n;return r.join(``)}var ne=`123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`,re=()=>ee(ne),ie=()=>w(ne),ae=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`,D=32768;function oe(e){let t=``;for(let n=0;n<e.length;n+=D)t+=String.fromCharCode(...e.subarray(n,n+D));return t}var O=()=>v({getSizeFromValue:e=>{try{return atob(e).length}catch{throw new g(l,{alphabet:ae,base:64,value:e})}},write(e,t,n){try{let r=atob(e).split(``).map(e=>e.charCodeAt(0));return t.set(r,n),r.length+n}catch{throw new g(l,{alphabet:ae,base:64,value:e})}}}),se=()=>y({read(e,t=0){return[btoa(oe(e.subarray(t))),e.length]}}),ce=e=>e.replace(/\u0000/g,``),le=globalThis.TextDecoder,ue=globalThis.TextEncoder,de=(e={})=>{let t;return v({getSizeFromValue:e=>(t||=new ue).encode(e).length,write:(n,r,i)=>{e.fatal&&x(n);let a=(t||=new ue).encode(n);return r.set(a,i),i+a.length}})},fe=(e={})=>{let t;return y({read(n,r){t||=new le(`utf-8`,{fatal:e.fatal??!1,ignoreBOM:e.ignoreBOM??!1});let i=e.fatal?pe(t,n,r):t.decode(n.slice(r));return!e.ignoreBOM&&t.ignoreBOM===void 0&&i.charCodeAt(0)===65279&&(i=i.slice(1)),e.removeNullCharacters!==!1&&(i=ce(i)),[i,n.length]}})};function pe(e,t,n){let r=t.slice(n);if(!e.fatal)return C(t,n),e.decode(r);try{return e.decode(r)}catch{throw new g(u,{bytes:t,offset:S(t,n)})}}function me(e){return se().decode(de().encode(e))}function k(e,t){let n=se().decode(e);return t?n.replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``):n}function A(e){return O().encode(e)}function he(e){return ie().decode(e)}function ge(e){return re().encode(e)}function _e(e){return he(A(e))}function ve(e){return k(new Uint8Array(e))}function ye(e){return he(e)}function be(e){return ge(e)}function j(e){return k(e)}function M(e){return A(e)}function xe(e){return fe().decode(e)}function Se(e){return de().encode(e)}var Ce=`solana:mainnet`,we=function(e,t,n,r){if(n===`a`&&!r)throw TypeError(`Private accessor was defined without a getter`);if(typeof t==`function`?e!==t||!r:!t.has(e))throw TypeError(`Cannot read private member from an object whose class did not declare it`);return n===`m`?r:n===`a`?r.call(e):r?r.value:t.get(e)},Te=function(e,t,n,r,i){if(r===`m`)throw TypeError(`Private method is not writable`);if(r===`a`&&!i)throw TypeError(`Private accessor was defined without a setter`);if(typeof t==`function`?e!==t||!i:!t.has(e))throw TypeError(`Cannot write private member to an object whose class did not declare it`);return r===`a`?i.call(e,n):i?i.value=n:t.set(e,n),n},Ee;function De(e){let t=({register:t})=>t(e);try{window.dispatchEvent(new Oe(t))}catch(e){console.error(`wallet-standard:register-wallet event could not be dispatched
`,e)}try{window.addEventListener(`wallet-standard:app-ready`,({detail:e})=>t(e))}catch(e){console.error(`wallet-standard:app-ready event listener could not be added
`,e)}}var Oe=class extends Event{get detail(){return we(this,Ee,`f`)}get type(){return`wallet-standard:register-wallet`}constructor(e){super(`wallet-standard:register-wallet`,{bubbles:!1,cancelable:!1,composed:!1}),Ee.set(this,void 0),Te(this,Ee,e,`f`)}preventDefault(){throw Error(`preventDefault cannot be called`)}stopImmediatePropagation(){throw Error(`stopImmediatePropagation cannot be called`)}stopPropagation(){throw Error(`stopPropagation cannot be called`)}};Ee=new WeakMap;var ke=e=>e/2**32|0,Ae=e=>e>>>0;function je(e,t,n,r){let i=ke(n),a=Ae(n);e.setUint32(t,r?a:i,r),e.setUint32(t+4,r?i:a,r)}function Me(e){return e instanceof Uint8Array||ArrayBuffer.isView(e)&&e.constructor.name===`Uint8Array`&&`BYTES_PER_ELEMENT`in e&&e.BYTES_PER_ELEMENT===1}var Ne=e=>e?`"${e}" `:``;function Pe(e,t=``){if(typeof e!=`number`)throw TypeError(Ne(t)+`expected number, got `+typeof e);if(!Number.isSafeInteger(e)||e<0)throw RangeError(Ne(t)+`expected integer >= 0, got `+e);return e}function N(e,t,n=``){if(Me(e)&&(t===void 0||e.length===t))return e;t!==void 0&&Pe(t,`length`);let r=Me(e),i=t===void 0?``:` of length ${t}`,a=r?`length=${e.length}`:`type=${typeof e}`,o=Ne(n)+`expected Uint8Array`+i+`, got `+a;throw r?RangeError(o):TypeError(o)}var Fe=(e,t)=>{if(typeof e!=`object`||!e||Array.isArray(e))throw TypeError((t===`object`?``:`"${t}" `)+`expected object, got type=`+typeof e)},Ie=(e,t)=>{Fe(e,t);let n=Object.getPrototypeOf(e);if(n!==Object.prototype&&n!==null)throw TypeError(`"${t}" expected plain object`);if(Object.hasOwn(e,`__proto__`))throw TypeError(`"${t}.__proto__" is not allowed`)};function Le(e,t=!0){if(e.destroyed)throw Error(`hash was destroyed`);if(t&&e.finished)throw Error(`digest() was already called`)}function Re(e,t){N(e,void 0,`output`);let n=t.outputLen;if(!(e.length>=n))throw RangeError(`"output" expected length >= `+n)}function ze(...e){for(let t=0;t<e.length;t++)e[t].fill(0)}function Be(e){return new DataView(e.buffer,e.byteOffset,e.byteLength)}function P(e,t){return e<<32-t|e>>>t}var Ve=typeof Uint8Array.from([]).toHex==`function`&&typeof Uint8Array.fromHex==`function`,He=Array.from({length:256},(e,t)=>t.toString(16).padStart(2,`0`));function F(e){if(N(e),Ve)return e.toHex();let t=``;for(let n=0;n<e.length;n++)t+=He[e[n]];return t}function Ue(e){return e>=48&&e<=57?e-48:e>=65&&e<=70?e-55:e>=97&&e<=102?e-87:void 0}function We(e){if(typeof e!=`string`)throw TypeError(`hex string expected, got `+typeof e);if(Ve)try{return Uint8Array.fromHex(e)}catch(e){throw e instanceof SyntaxError?RangeError(e.message):e}let t=e.length,n=t/2;if(t%2)throw RangeError(`hex string expected, got unpadded hex of length `+t);let r=new Uint8Array(n);for(let t=0,i=0;t<n;t++,i+=2){let n=Ue(e.charCodeAt(i)),a=Ue(e.charCodeAt(i+1));if(n===void 0||a===void 0){let t=e[i]+e[i+1];throw RangeError(`hex string expected, got non-hex character "`+t+`" at index `+i)}r[t]=n*16+a}return r}function Ge(...e){let t=0;for(let n=0;n<e.length;n++){let r=e[n];N(r),t+=r.length}let n=new Uint8Array(t);for(let t=0,r=0;t<e.length;t++){let i=e[t];n.set(i,r),r+=i.length}return n}function Ke(e,t,n=`opts`){return Ie(e,`defaults`),t!==void 0&&Ie(t,n),Object.assign(Object.create(null),e,t)}function qe(e,t={}){if(typeof e!=`function`)throw TypeError(`"hashCons" expected function, got type=`+typeof e);t=Ke({},t,`info`);let n=(t,n)=>e(n).update(t).digest(),r=e(void 0);return n.outputLen=r.outputLen,n.blockLen=r.blockLen,n.canXOF=r.canXOF,n.create=t=>e(t),Object.assign(n,t),Object.freeze(n)}function Je(e=32){Pe(e,`bytesLength`);let t=typeof globalThis==`object`?globalThis.crypto:null;if(typeof t?.getRandomValues!=`function`)throw Error(`crypto.getRandomValues must be defined`);if(e>65536)throw RangeError(`"bytesLength" expected <= 65536, got ${e}`);return t.getRandomValues(new Uint8Array(e))}var Ye=e=>({oid:Uint8Array.from([6,9,96,134,72,1,101,3,4,2,e])});function Xe(e,t,n){return e&t^~e&n}function Ze(e,t,n){return e&t^e&n^t&n}var Qe=class{blockLen;outputLen;canXOF=!1;padOffset;isLE;buffer;view;finished=!1;length=0;pos=0;destroyed=!1;constructor(e,t,n,r){this.blockLen=e,this.outputLen=t,this.padOffset=n,this.isLE=r,this.buffer=new Uint8Array(e),this.view=Be(this.buffer)}update(e){Le(this),N(e);let{view:t,buffer:n,blockLen:r}=this,i=e.length,a=!1;for(let o=0;o<i;){let s=Math.min(r-this.pos,i-o);if(s===r){let t=Be(e);for(;r<=i-o;o+=r)this.process(t,o);a=!0;continue}n.set(o===0&&s===i?e:e.subarray(o,o+s),this.pos),this.pos+=s,o+=s,this.pos===r&&(this.process(t,0),this.pos=0,a=!0)}return this.length+=e.length,a&&this.roundClean(),this}digestInto(e){Le(this),Re(e,this),this.finished=!0;let{buffer:t,view:n,blockLen:r,isLE:i}=this,{pos:a}=this;t[a++]=128,t.fill(0,a),this.padOffset>r-a&&(this.process(n,0),t.fill(0)),je(n,r-8,this.length*8,i),this.process(n,0),this.roundClean();let o=e===t?n:Be(e),s=this.outputLen,c=s/4,l=this.get();if(s%4||c>l.length)throw Error(`invalid outputLen`);for(let e=0;e<c;e++)o.setUint32(4*e,l[e],i)}digest(){let{buffer:e,outputLen:t}=this;this.digestInto(e);let n=e.slice(0,t);return this.destroy(),n}_cloneIntoMeta(e){let{buffer:t,length:n,finished:r,destroyed:i,pos:a}=this;return e.destroyed=i,e.finished=r,e.length=n,e.pos=a,a&&e.buffer.set(t),e}clone(){return this._cloneInto()}},$e=Uint32Array.from([1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225]),et=Uint32Array.from([1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298]),I=new Uint32Array(64),tt=class extends Qe{A=0;B=0;C=0;D=0;E=0;F=0;G=0;H=0;constructor(e,t){super(64,e,8,!1),this.A=t[0]|0,this.B=t[1]|0,this.C=t[2]|0,this.D=t[3]|0,this.E=t[4]|0,this.F=t[5]|0,this.G=t[6]|0,this.H=t[7]|0}get(){let{A:e,B:t,C:n,D:r,E:i,F:a,G:o,H:s}=this;return[e,t,n,r,i,a,o,s]}set(e,t,n,r,i,a,o,s){this.A=e|0,this.B=t|0,this.C=n|0,this.D=r|0,this.E=i|0,this.F=a|0,this.G=o|0,this.H=s|0}_cloneInto(e){return(e||=new this.constructor).set(...this.get()),this._cloneIntoMeta(e)}process(e,t){for(let n=0;n<16;n++,t+=4)I[n]=e.getUint32(t,!1);for(let e=16;e<64;e++){let t=I[e-15],n=I[e-2],r=P(t,7)^P(t,18)^t>>>3,i=P(n,17)^P(n,19)^n>>>10;I[e]=i+I[e-7]+r+I[e-16]|0}let{A:n,B:r,C:i,D:a,E:o,F:s,G:c,H:l}=this;for(let e=0;e<64;e++){let t=P(o,6)^P(o,11)^P(o,25),u=l+t+Xe(o,s,c)+et[e]+I[e]|0,d=(P(n,2)^P(n,13)^P(n,22))+Ze(n,r,i)|0;l=c,c=s,s=o,o=a+u|0,a=i,i=r,r=n,n=u+d|0}n=n+this.A|0,r=r+this.B|0,i=i+this.C|0,a=a+this.D|0,o=o+this.E|0,s=s+this.F|0,c=c+this.G|0,l=l+this.H|0,this.set(n,r,i,a,o,s,c,l)}roundClean(){ze(I)}destroy(){this.destroyed=!0,this.set(0,0,0,0,0,0,0,0),ze(this.buffer)}},nt=class extends tt{constructor(){super(32,$e)}},rt=qe(()=>new nt,Ye(1));function it(e,t,n=()=>{}){if(!Array.isArray(e))throw TypeError(`"${t}" expected array, got type=${typeof e}`);for(let r=0;r<e.length;r++)n(e[r],`${t}[${r}]`);return e}var L=(e,t,n)=>N(e,t,n),at=Pe;function R(e,t=`object`){if(typeof e!=`object`||!e||Array.isArray(e))throw TypeError(t===`object`?`expected valid options object`:`"${t}" expected object, got type=${typeof e}`);return e}function ot(e,t){if(typeof e!=`function`)throw TypeError(`"${t}" is invalid: expected function, got ${typeof e}`);return e}var st=F,ct=(...e)=>Ge(...e),lt=e=>We(e),ut=Me,dt=e=>Je(e),ft=BigInt(0),pt=BigInt(1),mt=e=>e?`"${e}" `:``;function ht(e,t=``){if(typeof e!=`boolean`)throw TypeError(mt(t)+`expected boolean, got type=`+typeof e);return e}function gt(e){if(typeof e==`bigint`){if(!z(e))throw RangeError(`positive bigint expected, got `+e)}else at(e);return e}function _t(e,t=``){if(typeof e!=`number`){let n=t&&`"${t}" `;throw TypeError(n+`expected number, got type=`+typeof e)}if(!Number.isSafeInteger(e)){let n=t&&`"${t}" `;throw RangeError(n+`expected safe integer, got `+e)}}function vt(e){if(typeof e!=`string`)throw TypeError(`hex string expected, got `+typeof e);return e===``?ft:BigInt(`0x`+e)}function yt(e){return vt(F(e))}function bt(e){return vt(F(Ct(N(e)).reverse()))}function xt(e,t){if(Pe(t),t===0)throw Error(`zero output length is invalid`);e=gt(e);let n=t*2,r=e.toString(16);if(r.length>n)throw RangeError(`number is too large`);return We(r.padStart(n,`0`))}function St(e,t){return xt(e,t).reverse()}function Ct(e){return Uint8Array.from(L(e))}function wt(e){if(typeof e!=`string`)throw TypeError(`ascii string expected, got `+typeof e);return Uint8Array.from(e,(t,n)=>{let r=t.charCodeAt(0);if(t.length!==1||r>127)throw RangeError(`string contains non-ASCII character "${e[n]}" with code ${r} at position ${n}`);return r})}function z(e){return typeof e==`bigint`&&ft<=e}function Tt(e,t,n){return z(e)&&z(t)&&z(n)&&t<=e&&e<n}function Et(e,t,n,r){if(!Tt(t,n,r))throw RangeError(`expected valid `+e+`: `+n+` <= n < `+r+`, got `+t)}function Dt(e){if(e<ft)throw Error(`expected non-negative bigint, got `+e);return e===ft?0:e.toString(2).length}var Ot=e=>(_t(e,`n`),(pt<<BigInt(e))-pt);function kt(e,t={},n={},r=`object`){R(e,r),R(t,`fields`),R(n,`optFields`);function i(t,n,i){let a=r===`object`?`param "${String(t)}"`:`"${r}.${String(t)}"`,o=e[t];if(!Object.hasOwn(e,t)&&(i?o!==void 0:n!==`function`))throw TypeError(`${a} is invalid: expected own property`);if(i&&o===void 0)return;let s=typeof o;if(s!==n||o===null)throw TypeError(`${a} is invalid: expected ${n}, got ${s}`)}let a=(e,t)=>Object.entries(e).forEach(([e,n])=>i(e,n,t));a(t,!1),a(n,!0)}var B=BigInt(0),V=BigInt(1),H=BigInt(2),At=BigInt(3),jt=BigInt(4),Mt=BigInt(5),Nt=BigInt(7),Pt=BigInt(8),Ft=BigInt(9),It=BigInt(15),Lt=BigInt(16),Rt=BigInt(`0x10000000000000000`);function U(e,t){if(t<=B)throw Error(`mod: expected positive modulus, got `+t);let n=e%t;return n>=B?n:t+n}function zt(e,t,n){if(n<=V)throw Error(`pow: expected modulus > 1, got `+n);if(typeof t!=`bigint`)throw TypeError(`invalid exponent: expected bigint, got `+typeof t);if(t<B)throw Error(`invalid exponent, negatives unsupported`);if(t===B)return V;if(t===V)return e;let r=e%n;if(r<B&&(r+=n),t<Rt){let e=V;for(;t>B;)t&V&&(e=e*r%n),r=r*r%n,t>>=V;return e}let i=[];for(;t>B;)i.push(Number(t&It)),t>>=jt;let a=Array(16);a[0]=V,a[1]=r;for(let e=2;e<16;e++)a[e]=a[e-1]*r%n;let o=a[i[i.length-1]];for(let e=i.length-2;e>=0;e--){o=o*o%n,o=o*o%n,o=o*o%n,o=o*o%n;let t=i[e];t!==0&&(o=o*a[t]%n)}return o}function W(e,t,n){if(n<=V)throw Error(`pow2: expected modulus > 1, got `+n);if(t<B)throw Error(`pow2: expected non-negative exponent, got `+t);let r=e;for(;t-->B;)r*=r,r%=n;return r}function Bt(e,t){if(e===B)throw Error(`invert: expected non-zero number`);if(t<=V)throw Error(`invert: expected modulus > 1, got `+t);let n=U(e,t),r=t,i=B,a=V;for(;n!==B;){let e=r/n,t=r-n*e,o=i-a*e;r=n,n=t,i=a,a=o}if(r!==V)throw Error(`invert: does not exist`);return U(i,t)}function Vt(e,t,n){let r=e;if(!r.eql(r.sqr(t),n))throw Error(`Cannot find square root`)}function Ht(e,t){if((e&V)===B)throw Error(t+`: expected odd modulus, got `+e)}function Ut(e,t){let n=e,r=(n.ORDER+V)/jt,i=n.pow(t,r);return Vt(n,i,t),i}function Wt(e,t){let n=e,r=(n.ORDER-Mt)/Pt,i=n.mul(t,H),a=n.pow(i,r),o=n.mul(t,a),s=n.mul(n.mul(o,H),a),c=n.mul(o,n.sub(s,n.ONE));return Vt(n,c,t),c}function Gt(e){let t=tn(e),n=Kt(e),r=n(t,t.neg(t.ONE)),i=n(t,r),a=n(t,t.neg(r)),o=(e+Nt)/Lt;return((e,t)=>{let n=e,s=n.pow(t,o),c=n.mul(s,r),l=n.mul(s,i),u=n.mul(s,a),d=n.eql(n.sqr(c),t),f=n.eql(n.sqr(l),t);s=n.cmov(s,c,d),c=n.cmov(u,l,f);let p=n.eql(n.sqr(c),t),m=n.cmov(s,c,p);return Vt(n,m,t),m})}function Kt(e){if(e<At)throw Error(`sqrt is not defined for small field`);Ht(e,`tonelliShanks`);let t=e-V,n=0;for(;t%H===B;)t/=H,n++;let r=H,i=tn(e);for(;Zt(i,r)===1;)if(r++>1e3)throw Error(`Cannot find square root: probably non-prime P`);if(n===1)return Ut;let a=i.pow(r,t),o=(t+V)/H;return function(e,r){let i=e;if(i.is0(r))return r;if(Zt(i,r)!==1)throw Error(`Cannot find square root`);let s=n,c=i.mul(i.ONE,a),l=i.pow(r,t),u=i.pow(r,o);for(;!i.eql(l,i.ONE);){if(i.is0(l))throw Error(`Cannot find square root: probably non-prime P`);let e=1,t=i.sqr(l);for(;!i.eql(t,i.ONE);)if(e++,t=i.sqr(t),e===s)throw Error(`Cannot find square root`);let n=V<<BigInt(s-e-1),r=i.pow(c,n);s=e,c=i.sqr(r),l=i.mul(l,c),u=i.mul(u,r)}return u}}function qt(e){return Ht(e,`Fp.sqrt`),e%jt===At?Ut:e%Pt===Mt?Wt:e%Lt===Ft?Gt(e):Kt(e)}var Jt=[`create`,`isValid`,`is0`,`neg`,`inv`,`sqrt`,`sqr`,`eql`,`add`,`sub`,`mul`,`pow`,`div`,`addN`,`subN`,`mulN`,`sqrN`];function Yt(e){if(R(e,`field`),typeof e.ORDER!=`bigint`)throw TypeError(`param "ORDER" is invalid: expected bigint, got `+typeof e.ORDER);_t(e.BYTES,`BYTES`),_t(e.BITS,`BITS`);for(let t of Jt)ot(e[t],`field.`+t);if(e.BYTES<1||e.BITS<1)throw Error(`invalid field: expected BYTES/BITS > 0`);if(e.ORDER<=V)throw Error(`invalid field: expected ORDER > 1, got `+e.ORDER);return e}function Xt(e,t,n=!1){Yt(e),it(t,`nums`),ht(n,`passZero`);let r=e,i=Array(t.length).fill(n?r.ZERO:void 0),a=t.reduce((e,t,n)=>r.is0(t)?e:(i[n]=e,r.mul(e,t)),r.ONE),o=r.inv(a);return t.reduceRight((e,t,n)=>r.is0(t)?e:(i[n]=r.mul(e,i[n]),r.mul(e,t)),o),i}function Zt(e,t){Yt(e);let n=e;Ht(n.ORDER,`FpLegendre`);let r=(n.ORDER-V)/H,i=n.pow(t,r),a=n.eql(i,n.ONE),o=n.eql(i,n.ZERO),s=n.eql(i,n.neg(n.ONE));if(!a&&!o&&!s)throw Error(`invalid Legendre symbol result`);return a?1:o?0:-1}function Qt(e,t){if(t!==void 0&&at(t),e<=B)throw Error(`invalid n length: expected positive n, got `+e);if(t!==void 0&&t<1)throw Error(`invalid n length: expected positive bit length, got `+t);let n=Dt(e);if(t!==void 0&&t<n)throw Error(`invalid n length: expected nBitLength (${t}) >= bitLen(n) (${n})`);let r=t===void 0?n:t;return{nBitLength:r,nByteLength:Math.ceil(r/8)}}var $t=new WeakMap,en=class{ORDER;BITS;BYTES;isLE;ZERO=B;ONE=V;_lengths;_mod;constructor(e,t={}){if(e<=V)throw Error(`invalid field: expected ORDER > 1, got `+e);let n;this.isLE=!1,typeof t==`object`&&t&&(typeof t.BITS==`number`&&(n=t.BITS),typeof t.sqrt==`function`&&Object.defineProperty(this,"sqrt",{value:t.sqrt,enumerable:!0}),typeof t.isLE==`boolean`&&(this.isLE=t.isLE),t.allowedLengths&&(this._lengths=Object.freeze(t.allowedLengths.slice())),typeof t.modFromBytes==`boolean`&&(this._mod=t.modFromBytes));let{nBitLength:r,nByteLength:i}=Qt(e,n);if(i>2048)throw Error(`invalid field: expected ORDER of <= 2048 bytes`);this.ORDER=e,this.BITS=r,this.BYTES=i,Object.freeze(this)}create(e){return U(e,this.ORDER)}isValid(e){if(typeof e!=`bigint`)throw TypeError(`invalid field element: expected bigint, got `+typeof e);return B<=e&&e<this.ORDER}is0(e){return e===B}isValidNot0(e){return!this.is0(e)&&this.isValid(e)}isOdd(e){return(e&V)===V}neg(e){return U(-e,this.ORDER)}eql(e,t){return e===t}sqr(e){return U(e*e,this.ORDER)}add(e,t){return U(e+t,this.ORDER)}sub(e,t){return U(e-t,this.ORDER)}mul(e,t){return U(e*t,this.ORDER)}pow(e,t){return zt(e,t,this.ORDER)}div(e,t){return U(e*Bt(t,this.ORDER),this.ORDER)}sqrN(e){return e*e}addN(e,t){return e+t}subN(e,t){return e-t}mulN(e,t){return e*t}inv(e){return Bt(e,this.ORDER)}sqrt(e){let t=$t.get(this);return t||$t.set(this,t=qt(this.ORDER)),t(this,e)}toBytes(e){return this.isLE?St(e,this.BYTES):xt(e,this.BYTES)}fromBytes(e,t=!1){L(e);let{_lengths:n,BYTES:r,isLE:i,ORDER:a,_mod:o}=this;if(n){if(e.length<1||!n.includes(e.length)||e.length>r)throw Error(`Field.fromBytes: expected `+n+` bytes, got `+e.length);let t=new Uint8Array(r);t.set(e,i?0:t.length-e.length),e=t}if(e.length!==r)throw Error(`Field.fromBytes: expected `+r+` bytes, got `+e.length);let s=i?bt(e):yt(e);if(o&&(s=U(s,a)),!t&&!this.isValid(s))throw Error(`invalid field element: outside of range 0..ORDER`);return s}invertBatch(e){return Xt(this,e,!0)}cmov(e,t,n){return ht(n,`condition`),n?t:e}};function tn(e,t={}){return Object.freeze(en.prototype),new en(e,t)}function nn(e){if(typeof e!=`bigint`)throw Error(`field order must be bigint`);if(e<=V)throw Error(`field order must be greater than 1`);let t=Dt(e-V);return Math.ceil(t/8)}function rn(e){let t=nn(e);return t+Math.ceil(t/2)}function an(e,t,n=!1){L(e);let r=e.length,i=nn(t),a=Math.max(rn(t),16);if(r<a||r>1024)throw Error(`expected `+a+`-1024 bytes of input, got `+r);let o=U(n?bt(e):yt(e),t-V)+V;return n?St(o,i):xt(o,i)}var on=BigInt(0),sn=BigInt(1),cn=BigInt(4),ln=16,un=128,dn=5,fn=2**31;function pn(e){let t=e;if(typeof t!=`function`)throw TypeError(`"Point" expected constructor, got type=`+typeof e);ot(t.fromAffine,`Point.fromAffine`),ot(t.fromBytes,`Point.fromBytes`),ot(t.fromHex,`Point.fromHex`),R(t.BASE,`Point.BASE`),R(t.ZERO,`Point.ZERO`),Yt(t.Fp),Yt(t.Fn)}function mn(e,t){pn(e),vn(t,e);let n=Xt(e.Fp,t.map(e=>e.Z));return t.map((t,r)=>e.fromAffine(t.toAffine(n[r])))}function hn(e,t,n=1){if(!Number.isSafeInteger(e)||e<n||e>t)throw Error(`invalid window size, expected [`+n+`..`+t+`], got W=`+e)}function gn(e,t){let n=e*(4*t+128);if(n>fn)throw Error(`invalid window size: table would need ~`+Math.ceil(n/2**20)+` MiB, max `+fn/2**20+` MiB`)}function _n(e,t){if(e!==void 0){ot(e,`randomBytes`);try{let n=e(t);if(!ut(n)||n.length!==t)return}catch{return}return e}}function vn(e,t){it(e,`points`),e.forEach((e,n)=>{if(!(e instanceof t))throw Error(`invalid point at index `+n)})}function yn(e,t,n){if(!Array.isArray(e))throw Error(`array of scalars expected`);e.forEach((e,r)=>{if(!(n===void 0?t.isValid(e):z(e)&&e<n))throw Error(`invalid scalar at index `+r)})}var bn=new WeakMap;function xn(e){return bn.get(e)||1}function Sn(e,t){let n=e.double(),r=[e];for(let e=1;e<t;e++)r.push(r[e-1].add(n));return r}function Cn(e,t){let n=2**t,r=n/2,i=BigInt(n-1),a=[];for(;e>on;){let t=0;e&sn&&(t=Number(e&i),t>=r&&(t-=n),e-=BigInt(t)),a.push(t),e>>=sn}return a}function wn(e,t,n){let r=2**t,i=r/2,a=BigInt(r-1),o=BigInt(t),s=[];for(let t=0;t<n;t++){let t=Number(e&a);e>>=o,t>i&&(t-=r,e+=sn),s.push(t)}if(e!==on)throw Error(`invalid wnaf`);return s}function Tn(e,t,n){let r=0;for(let e of n)r=Math.max(r,e.length);let i=e;for(let e=r-1;e>=0;e--){e!==r-1&&(i=i.double());for(let r=0;r<n.length;r++){let a=n[r][e];if(a){let e=t[r][Math.abs(a)-1>>1];i=i.add(a<0?e.negate():e)}}}return i}var En=class{Point;BASE;ZERO;randomBytes;wnafPrecomputes=new WeakMap;baseCanBeBlinded;bits;constructor(e,t){pn(e),this.randomBytes=_n(t,ln),this.Point=e,this.BASE=e.BASE,this.ZERO=e.ZERO,this.bits=e.Fn.BITS}buildWnafTable(e,t,n){let r=Math.ceil(n/t)+1,i=2**(t-1),a=[],o=e;for(let e=0;e<r;e++){let e=o;for(let t=0;t<i;t++)a.push(e),e=e.add(o);o=a[a.length-1].double()}return{W:t,bits:n,windows:r,comp:a}}wnafCachedCT(e,t){let{W:n,windows:r,comp:i}=e,a=2**(n-1),o=wn(t,n,r),s=this.ZERO,c=this.BASE;for(let e=0;e<r;e++){let t=o[e],n=e*a,r=Math.abs(t)-1,l=i[n];for(let e=1;e<a;e++)l=e===r?i[n+e]:l;let u=l.negate();t===0?c=c.add(i[n]):s=s.add(t<0?u:l)}return{p:s,f:c}}getWnafPrecomputes(e,t,n,r){let i=this.wnafPrecomputes.get(t),a=i?.find(t=>t.W===e&&t.bits===n);return a||(a=this.buildWnafTable(t,e,n),typeof r==`function`&&(a={...a,comp:r(a.comp)}),i||(i=[],this.wnafPrecomputes.set(t,i)),i.push(a)),a}assertPoint(e){if(!(e instanceof this.Point))throw TypeError(`"point" expected Point instance, got type=`+typeof e)}validateMulInput(e,t){if(this.assertPoint(e),!Tt(t,sn,this.Point.Fn.ORDER))throw Error(`invalid scalar`)}runCT(e,t,n,r){let i=xn(e);return i===1?this.fixedWindowCT(e,t,n):this.wnafCachedCT(this.getWnafPrecomputes(i,e,n,r),t)}mulCT(e,t,n){return this.validateMulInput(e,t),this.runCT(e,t,this.bits,n)}mulCTBlinded(e,t,n){if(this.validateMulInput(e,t),this.randomBytes===void 0)throw Error(`randomBytes is required for scalar blinding`);let r=this.Point.Fn.BITS+un,i=this.randomBytes(ln);if(!ut(i)||i.length!==ln)throw Error(`randomBytes returned invalid byte array`);i[0]=i[0]&63|128;let a=t+yt(i)*this.Point.Fn.ORDER;return this.runCT(e,a,r,n)}fixedWindowCT(e,t,n){let r=dn,i=Ot(r),a=Array(32);a[0]=this.ZERO;for(let t=1;t<32;t++)a[t]=a[t-1].add(e);let o=Math.ceil(n/r),s=this.ZERO;for(let e=o-1;e>=0;e--){if(e!==o-1)for(let e=0;e<r;e++)s=s.double();let n=Number(t>>BigInt(e*r)&i),c=a[0];for(let e=1;e<32;e++)c=e===n?a[e]:c;s=s.add(c)}return{p:s,f:s}}shouldBlind(e,t){return this.randomBytes===void 0?!1:t===sn||e===this.BASE&&(this.baseCanBeBlinded===void 0&&(this.baseCanBeBlinded=this.mulUnsafe(this.BASE,this.Point.Fn.ORDER).is0()),this.baseCanBeBlinded)}mulSecret(e,t,n,r){return this.shouldBlind(e,n)?this.mulCTBlinded(e,t,r):this.mulCT(e,t,r)}mulUnsafe(e,t,n){if(this.assertPoint(e),!z(t))throw Error(`invalid scalar`);let r=xn(e);if(r===1||t>=this.Point.Fn.ORDER)return Dn(this.Point,[e],[t],!0);let i=this.getWnafPrecomputes(r,e,this.bits,n);return this.wnafCachedCT(i,t).p}setWindowSize(e,t){this.assertPoint(e),hn(t,this.bits),gn((Math.ceil((this.bits+un)/t)+1)*2**(t-1),this.Point.Fp.BYTES),bn.set(e,t),this.wnafPrecomputes.delete(e)}hasWindowSize(e){return xn(e)!==1}};function Dn(e,t,n,r=!1){if(pn(e),vn(t,e),ht(r,`allowOversized`),yn(n,e.Fn,r?e.Fn.ORDER**cn:void 0),t.length!==n.length)throw Error(`arrays of points and scalars must have equal length`);let i=t.map(e=>Sn(e,4)),a=n.map(e=>Cn(e,4));return Tn(e.ZERO,i,a)}function On(e,t,n){if(t){if(t.ORDER!==e)throw Error(`Field.ORDER must match order: Fp == p, Fn == n`);return Yt(t),t}return tn(e,{isLE:n})}function kn(e,t,n={},r){if(e!==`weierstrass`&&e!==`edwards`)throw Error(`expected curve type "weierstrass" or "edwards"`);if(r===void 0&&(r=e===`edwards`),!t||typeof t!=`object`)throw Error(`expected valid ${e} CURVE object`);kt(n);for(let e of[`p`,`n`,`h`]){let n=t[e];if(!(z(n)&&n!==on))throw Error(`CURVE.${e} must be positive bigint`)}let i=On(t.p,n.Fp,r),a=On(t.n,n.Fn,r),o=[`Gx`,`Gy`,`a`,e===`weierstrass`?`b`:`d`];for(let e of o)if(!i.isValid(t[e]))throw Error(`CURVE.${e} must be valid field element of CURVE.Fp`);return t=Object.freeze(Object.assign({},t)),{CURVE:t,Fp:i,Fn:a}}function An(e,t){return function(n){let r=e(n);return{secretKey:r,publicKey:t(r)}}}var jn=(e,t)=>(e+(e>=0?t:-t)/Pn)/t;function Mn(e,t,n){Et(`scalar`,e,G,n);let[[r,i],[a,o]]=t,s=jn(o*e,n),c=jn(-i*e,n),l=e-s*r-c*a,u=-s*i-c*o,d=l<G,f=u<G;d&&(l=-l),f&&(u=-u);let p=Ot(Math.ceil(Dt(n)/2))+Nn;if(l<G||l>=p||u<G||u>=p)throw Error(`splitScalar (endomorphism): failed for k`);return{k1neg:d,k1:l,k2neg:f,k2:u}}var G=BigInt(0),Nn=BigInt(1),Pn=BigInt(2),Fn=BigInt(3),In=BigInt(4);function Ln(e,t={}){let n=kn(`weierstrass`,e,t),r=n.Fp,i=n.Fn,a=n.CURVE,{h:o,n:s}=a;kt(t,{},{allowInfinityPoint:`boolean`,clearCofactor:`function`,isTorsionFree:`function`,fromBytes:`function`,toBytes:`function`,endo:`object`,randomBytes:`function`});let{endo:c,allowInfinityPoint:l,clearCofactor:u,isTorsionFree:d,fromBytes:f,toBytes:p}=t,m=t.randomBytes===void 0?dt:t.randomBytes;if(c&&(!r.is0(a.a)||typeof c.beta!=`bigint`||!Array.isArray(c.basises)))throw Error(`invalid endo: expected "beta": bigint and "basises": array`);let h=c?{beta:c.beta,basises:c.basises.map(e=>[...e])}:void 0,g=zn(r,i);function _(){if(!r.isOdd)throw Error(`compression is not supported: Field does not have .isOdd()`)}function v(e,t,n){if(t.is0()){if(!l)throw Error(`bad point: ZERO`);return Uint8Array.of(0)}let{x:i,y:a}=t.toAffine(),o=r.toBytes(i);return ht(n,`isCompressed`),n?(_(),ct(Rn(!r.isOdd(a)),o)):ct(Uint8Array.of(4),o,r.toBytes(a))}function y(e){L(e,void 0,`Point`);let{publicKey:t,publicKeyUncompressed:n}=g,i=e.length,a=e[0],o=e.subarray(1);if(l&&i===1&&a===0)return{x:r.ZERO,y:r.ZERO};if(i===t&&(a===2||a===3)){let e=r.fromBytes(o);if(!r.isValid(e))throw Error(`bad point: is not on curve, wrong x`);let t=ee(e),n;try{n=r.sqrt(t)}catch(e){let t=e instanceof Error?`: `+e.message:``;throw Error(`bad point: is not on curve, sqrt error`+t)}_();let i=r.isOdd(n);return(a&1)==1!==i&&(n=r.neg(n)),{x:e,y:n}}if(i===n&&a===4){let e=r.BYTES,t=r.fromBytes(o.subarray(0,e)),n=r.fromBytes(o.subarray(e,e*2));if(!w(t,n))throw Error(`bad point: is not on curve`);return{x:t,y:n}}throw Error(`bad point: got length ${i}, expected compressed=${t} or uncompressed=${n}`)}let b=p===void 0?v:p,x=f===void 0?y:f,S=r.mul(a.b,Fn),C=r.is0(a.a)?e=>r.ZERO:e=>r.mul(a.a,e);function ee(e){let t=r.sqr(e),n=r.mul(t,e);return r.add(r.add(n,r.mul(e,a.a)),a.b)}function w(e,t){let n=r.sqr(t),i=ee(e);return r.eql(n,i)}if(!w(a.Gx,a.Gy))throw Error(`bad curve params: generator point`);let T=r.mul(r.pow(a.a,Fn),In),te=r.mul(r.sqr(a.b),BigInt(27));if(r.is0(r.add(T,te)))throw Error(`bad curve params: a or b`);function E(e,t,n=!1){if(!r.isValid(t)||n&&r.is0(t))throw Error(`bad point coordinate ${e}`);return typeof t==`object`&&t?r.create(t):t}function ne(e){if(!(e instanceof D))throw Error(`Weierstrass Point expected`)}function re(e){if(!h||!h.basises)throw Error(`no endo`);return Mn(e,h.basises,i.ORDER)}function ie(e,t,n,a){if(!i.isValid(a))throw RangeError(`invalid scalar: out of range`);if(h){let{k1neg:i,k1:o,k2neg:s,k2:c}=re(a),l=new D(r.mul(n.X,h.beta),n.Y,n.Z);e.push(i?n.negate():n,s?l.negate():l),t.push(o,c)}else e.push(n),t.push(a)}let ae=new WeakSet;class D{static BASE=new D(a.Gx,a.Gy,r.ONE);static ZERO=new D(r.ZERO,r.ONE,r.ZERO);static Fp=r;static Fn=i;X;Y;Z;constructor(e,t,n){this.X=E(`x`,e),this.Y=E(`y`,t,!0),this.Z=E(`z`,n),Object.freeze(this)}static CURVE(){return a}static fromAffine(e){let{x:t,y:n}=e||{};if(!e||!r.isValid(t)||!r.isValid(n))throw Error(`invalid affine point`);if(e instanceof D)throw Error(`projective point not allowed`);return r.is0(t)&&r.is0(n)?D.ZERO:new D(t,n,r.ONE)}static fromBytes(e){let t=D.fromAffine(x(L(e,void 0,`point`)));return t.assertValidity(),t}static fromHex(e){return D.fromBytes(lt(e))}get x(){return this.toAffine().x}get y(){return this.toAffine().y}precompute(e=6,t=!0){return O.setWindowSize(this,e),t||this.multiply(Fn),this}assertValidity(){let e=this;if(e.is0()){if(l&&r.is0(e.X)&&r.eql(e.Y,r.ONE)&&r.is0(e.Z))return;throw Error(`bad point: ZERO`)}if(ae.has(e))return;let{x:t,y:n}=e.toAffine();if(!r.isValid(t)||!r.isValid(n))throw Error(`bad point: x or y not field elements`);if(!w(t,n))throw Error(`bad point: equation left != right`);if(!e.isTorsionFree())throw Error(`bad point: not in prime-order subgroup`);ae.add(e)}hasEvenY(){let{y:e}=this.toAffine();if(!r.isOdd)throw Error(`Field doesn't support isOdd`);return!r.isOdd(e)}equals(e){ne(e);let{X:t,Y:n,Z:i}=this,{X:a,Y:o,Z:s}=e,c=r.eql(r.mul(t,s),r.mul(a,i)),l=r.eql(r.mul(n,s),r.mul(o,i));return c&&l}negate(){return new D(this.X,r.neg(this.Y),this.Z)}double(){let{X:e,Y:t,Z:n}=this,i=r.ZERO,a=r.ZERO,o=r.ZERO,s=r.mul(e,e),c=r.mul(t,t),l=r.mul(n,n),u=r.mul(e,t);return u=r.add(u,u),o=r.mul(e,n),o=r.add(o,o),i=C(o),a=r.mul(S,l),a=r.add(i,a),i=r.sub(c,a),a=r.add(c,a),a=r.mul(i,a),i=r.mul(u,i),o=r.mul(S,o),l=C(l),u=r.sub(s,l),u=C(u),u=r.add(u,o),o=r.add(s,s),s=r.add(o,s),s=r.add(s,l),s=r.mul(s,u),a=r.add(a,s),l=r.mul(t,n),l=r.add(l,l),s=r.mul(l,u),i=r.sub(i,s),o=r.mul(l,c),o=r.add(o,o),o=r.add(o,o),new D(i,a,o)}add(e){ne(e);let{X:t,Y:n,Z:i}=this,{X:a,Y:o,Z:s}=e,c=r.ZERO,l=r.ZERO,u=r.ZERO,d=r.mul(t,a),f=r.mul(n,o),p=r.mul(i,s),m=r.add(t,n),h=r.add(a,o);m=r.mul(m,h),h=r.add(d,f),m=r.sub(m,h),h=r.add(t,i);let g=r.add(a,s);return h=r.mul(h,g),g=r.add(d,p),h=r.sub(h,g),g=r.add(n,i),c=r.add(o,s),g=r.mul(g,c),c=r.add(f,p),g=r.sub(g,c),u=C(h),c=r.mul(S,p),u=r.add(c,u),c=r.sub(f,u),u=r.add(f,u),l=r.mul(c,u),f=r.add(d,d),f=r.add(f,d),p=C(p),h=r.mul(S,h),f=r.add(f,p),p=r.sub(d,p),p=C(p),h=r.add(h,p),d=r.mul(f,h),l=r.add(l,d),d=r.mul(g,h),c=r.mul(m,c),c=r.sub(c,d),d=r.mul(m,f),u=r.mul(g,u),u=r.add(u,d),new D(c,l,u)}subtract(e){return ne(e),this.add(e.negate())}is0(){return this.equals(D.ZERO)}multiply(e){if(!i.isValidNot0(e))throw RangeError(`invalid scalar: out of range`);let{p:t,f:n}=O.mulSecret(this,e,o,oe);return oe([t,n])[0]}multiplyUnsafe(e){let t=this,n=e;if(!i.isValid(n))throw RangeError(`invalid scalar: out of range`);if(n===G||t.is0())return D.ZERO;if(n===Nn)return t;if(O.hasWindowSize(this))return O.mulUnsafe(t,n,oe);let r=[],a=[];return ie(r,a,t,n),Dn(D,r,a)}mulAddUnsafe(e,t,n){ne(t);let r=[],i=[];return ie(r,i,this,e),ie(r,i,t,n),Dn(D,r,i)}toAffine(e){let t=this,n=e;if(n!=null&&!r.isValid(n))throw RangeError(`"invertedZ" expected valid field element`);let{X:i,Y:a,Z:o}=t;if(r.eql(o,r.ONE))return{x:i,y:a};let s=t.is0();n??=s?r.ONE:r.inv(o);let c=r.mul(i,n),l=r.mul(a,n),u=r.mul(o,n);if(s)return{x:r.ZERO,y:r.ZERO};if(!r.eql(u,r.ONE))throw Error(`invZ was invalid`);return{x:c,y:l}}isTorsionFree(){return o===Nn?!0:d?d(D,this):O.mulUnsafe(this,s).is0()}clearCofactor(){return o===Nn?this:u?u(D,this):this.multiplyUnsafe(o)}isSmallOrder(){return o===Nn?this.is0():this.clearCofactor().is0()}toBytes(e=!0){return ht(e,`isCompressed`),this.assertValidity(),b(D,this,e)}toHex(e=!0){return st(this.toBytes(e))}toString(){return`<Point ${this.is0()?`ZERO`:this.toHex()}>`}}let oe=e=>mn(D,e),O=new En(D,m);return O.bits>=6&&D.BASE.precompute(6),Object.freeze(D.prototype),Object.freeze(D),D}function Rn(e){return Uint8Array.of(e?2:3)}function zn(e,t){return{secretKey:t.BYTES,publicKey:1+e.BYTES,publicKeyUncompressed:1+2*e.BYTES,publicKeyHasPrefix:!0,signature:2*t.BYTES}}var Bn={p:BigInt(`0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f`),n:BigInt(`0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141`),h:BigInt(1),a:BigInt(0),b:BigInt(7),Gx:BigInt(`0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798`),Gy:BigInt(`0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8`)},Vn={beta:BigInt(`0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee`),basises:[[BigInt(`0x3086d221a7d46bcde86c90e49284eb15`),-BigInt(`0xe4437ed6010e88286f547fa90abfe4c3`)],[BigInt(`0x114ca50f7a8e2f3f657c1108d9d44cfd8`),BigInt(`0x3086d221a7d46bcde86c90e49284eb15`)]]},Hn=BigInt(0),Un=BigInt(2);function Wn(e){let t=Bn.p,n=BigInt(3),r=BigInt(6),i=BigInt(11),a=BigInt(22),o=BigInt(23),s=BigInt(44),c=BigInt(88),l=e*e*e%t,u=l*l*e%t,d=W(W(W(u,n,t)*u%t,n,t)*u%t,Un,t)*l%t,f=W(d,i,t)*d%t,p=W(f,a,t)*f%t,m=W(p,s,t)*p%t,h=W(W(W(W(W(W(m,c,t)*m%t,s,t)*p%t,n,t)*u%t,o,t)*f%t,r,t)*l%t,Un,t);if(!K.eql(K.sqr(h),e))throw Error(`Cannot find square root`);return h}var K=tn(Bn.p,{sqrt:Wn}),q=Ln(Bn,{Fp:K,endo:Vn}),Gn=Object.create(null);function Kn(e,...t){let n=Gn[e];if(n===void 0){let t=rt(wt(e));n=ct(t,t),Gn[e]=n}return rt(ct(n,...t))}var qn=e=>e.toBytes(!0).slice(1),Jn=({x:e})=>K.toBytes(e),Yn=e=>!K.isOdd(e);function Xn(e){let{Fn:t,BASE:n}=q,r=t.fromBytes(L(e,32,`secretKey`)),i=n.multiply(r).toAffine();return{scalar:Yn(i.y)?r:t.neg(r),bytes:Jn(i)}}function Zn(e){let t=K;if(!t.isValidNot0(e))throw Error(`invalid x: Fail if x ≥ p`);let n=t.sqr(e),r=t.add(t.mulN(n,e),BigInt(7)),i=t.sqrt(r);Yn(i)||(i=t.neg(i));let a=q.fromAffine({x:e,y:i});return a.assertValidity(),a}var J=yt;function Qn(...e){return q.Fn.create(J(Kn(`BIP0340/challenge`,...e)))}function $n(e){return Xn(e).bytes}function er(e,t,n=Je(32)){let{Fn:r,BASE:i}=q,a=Ct(L(e,void 0,`message`)),{bytes:o,scalar:s}=Xn(t),c=L(n,32,`auxRand`),l=Kn(`BIP0340/nonce`,r.toBytes(s^J(Kn(`BIP0340/aux`,c))),o,a),u=r.create(J(l));if(u===Hn)throw Error(`sign failed: k is zero`);let d=i.multiply(u).toAffine(),f=Yn(d.y)?u:r.neg(u),p=Jn(d),m=Qn(p,o,a),h=new Uint8Array(64);if(h.set(p,0),h.set(r.toBytes(r.create(f+m*s)),32),!tr(h,a,o))throw Error(`sign: Invalid signature produced`);return h}function tr(e,t,n){let{Fp:r,Fn:i,BASE:a}=q,o=L(e,64,`signature`),s=L(t,void 0,`message`),c=L(n,32,`publicKey`);try{let e=Zn(J(c)),t=o.subarray(0,32),n=J(t);if(!r.isValidNot0(n))return!1;let l=J(o.subarray(32,64));if(!i.isValidNot0(l))return!1;let u=Qn(t,qn(e),s),d=a.mulAddUnsafe(l,e,i.neg(u)),{x:f,y:p}=d.toAffine();return!(d.is0()||!Yn(p)||!r.eql(f,n))}catch{return!1}}var nr=(()=>{let e=e=>(e=e===void 0?Je(48):e,an(L(e,48,`seed`),Bn.n));return Object.freeze({keygen:An(e,$n),getPublicKey:$n,sign:er,verify:tr,Point:q,utils:Object.freeze({randomSecretKey:e,taggedHash:Kn,lift_x:Zn,pointToBytes:qn}),lengths:Object.freeze({secretKey:32,publicKey:32,publicKeyHasPrefix:!1,signature:64,seed:48})})})();function rr(e){let t=`${e.domain} wants you to sign in with your Solana account:\n`;t+=`${e.address}`,e.statement&&(t+=`\n\n${e.statement}`);let n=[];if(e.uri&&n.push(`URI: ${e.uri}`),e.version&&n.push(`Version: ${e.version}`),e.chainId&&n.push(`Chain ID: ${e.chainId}`),e.nonce&&n.push(`Nonce: ${e.nonce}`),e.issuedAt&&n.push(`Issued At: ${e.issuedAt}`),e.expirationTime&&n.push(`Expiration Time: ${e.expirationTime}`),e.notBefore&&n.push(`Not Before: ${e.notBefore}`),e.requestId&&n.push(`Request ID: ${e.requestId}`),e.resources){n.push(`Resources:`);for(let t of e.resources)n.push(`- ${t}`)}return n.length&&(t+=`\n\n${n.join(`
`)}`),t}var Y={ERROR_ASSOCIATION_PORT_OUT_OF_RANGE:`ERROR_ASSOCIATION_PORT_OUT_OF_RANGE`,ERROR_REFLECTOR_ID_OUT_OF_RANGE:`ERROR_REFLECTOR_ID_OUT_OF_RANGE`,ERROR_FORBIDDEN_WALLET_BASE_URL:`ERROR_FORBIDDEN_WALLET_BASE_URL`,ERROR_SECURE_CONTEXT_REQUIRED:`ERROR_SECURE_CONTEXT_REQUIRED`,ERROR_SESSION_CLOSED:`ERROR_SESSION_CLOSED`,ERROR_SESSION_TIMEOUT:`ERROR_SESSION_TIMEOUT`,ERROR_WALLET_NOT_FOUND:`ERROR_WALLET_NOT_FOUND`,ERROR_INVALID_PROTOCOL_VERSION:`ERROR_INVALID_PROTOCOL_VERSION`,ERROR_BROWSER_NOT_SUPPORTED:`ERROR_BROWSER_NOT_SUPPORTED`,ERROR_LOOPBACK_ACCESS_BLOCKED:`ERROR_LOOPBACK_ACCESS_BLOCKED`,ERROR_ASSOCIATION_CANCELLED:`ERROR_ASSOCIATION_CANCELLED`,ERROR_ILLEGAL_TRANSPORT_STATE:`ERROR_ILLEGAL_TRANSPORT_STATE`},X=class extends Error{data;code;constructor(...e){let[t,n,r]=e;super(n),this.code=t,this.data=r,this.name=`SolanaMobileWalletAdapterError`}},ir=class extends Error{data;code;jsonRpcMessageId;constructor(...e){let[t,n,r,i]=e;super(r),this.code=n,this.data=i,this.jsonRpcMessageId=t,this.name=`SolanaMobileWalletAdapterProtocolError`}},ar=20012;function or(){let e=nr.utils.randomSecretKey();return{privateKey:e,publicKey:F(nr.getPublicKey(e))}}async function sr(e){let t=await crypto.subtle.exportKey(`raw`,e);return F(rt(new Uint8Array(t)))}function cr(e,t,n,r,i){return JSON.stringify([0,e,t,n,r,i])}function lr(e,t,n,r,i){let a=cr(e,t,n,r,i);return F(rt(new TextEncoder().encode(a)))}function ur(e,t,n,r){let i=F(nr.getPublicKey(r)),a=Math.floor(Date.now()/1e3),o=lr(i,a,e,n,t);return{id:o,pubkey:i,created_at:a,kind:e,tags:n,content:t,sig:F(nr.sign(We(o),r))}}function dr(e){if(lr(e.pubkey,e.created_at,e.kind,e.tags,e.content)!==e.id)return!1;try{return nr.verify(We(e.sig),We(e.id),We(e.pubkey))}catch{return!1}}async function fr(e,t){let n=await crypto.subtle.exportKey(`raw`,e),r=await crypto.subtle.sign({hash:`SHA-256`,name:`ECDSA`},t,n),i=new Uint8Array(n.byteLength+r.byteLength);return i.set(new Uint8Array(n),0),i.set(new Uint8Array(r),n.byteLength),i}function pr(e){return rr(e)}function mr(e){return me(pr(e)).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}var hr=`solana:signTransactions`,gr=`solana:cloneAuthorization`;function _r(e,t){return new Proxy({},{get(n,r){return r===`then`?null:(n[r]??(n[r]=async function(n){let{method:i,params:a}=vr(r,n,e),o=await t(i,a);return i===`authorize`&&a.sign_in_payload&&!o.sign_in_result&&(o.sign_in_result=await br(a.sign_in_payload,o,t)),yr(r,o,e)}),n[r])},defineProperty(){return!1},deleteProperty(){return!1}})}function vr(e,t,n){let r=t,i=e.toString().replace(/[A-Z]/g,e=>`_${e.toLowerCase()}`).toLowerCase();switch(e){case`authorize`:{let e=r,{chain:t}=e;if(n===`legacy`){switch(t){case`solana:testnet`:t=`testnet`;break;case`solana:devnet`:t=`devnet`;break;case`solana:mainnet`:t=`mainnet-beta`;break;default:t=e.cluster}e.cluster=t,r=e}else{switch(t){case`testnet`:case`devnet`:t=`solana:${t}`;break;case`mainnet-beta`:t=`solana:mainnet`}e.chain=t,r=e}}case`reauthorize`:{let{auth_token:e,identity:t}=r;if(e)switch(n){case`legacy`:i=`reauthorize`,r={auth_token:e,identity:t};break;default:i=`authorize`}break}}return{method:i,params:r}}function yr(e,t,n){if(e===`getCapabilities`){let e=t;switch(n){case`legacy`:{let t=[hr];return e.supports_clone_authorization===!0&&t.push(gr),{...e,features:t}}case`v1`:return{...e,supports_sign_and_send_transactions:!0,supports_clone_authorization:e.features.includes(gr)}}}return t}async function br(e,t,n){let r=e.domain??window.location.host,i=t.accounts[0].address,a=mr({...e,domain:r,address:_e(i)}),o=A((await n(`sign_messages`,{addresses:[i],payloads:[a]})).signed_payloads[0]),s=k(o.slice(0,o.length-64)),c=k(o.slice(o.length-64));return{address:i,signed_message:s.length==0?a:s,signature:c}}function xr(e){if(e>=4294967296)throw Error(`Outbound sequence number overflow. The maximum sequence number is 32-bytes.`);let t=new ArrayBuffer(4);return new DataView(t).setUint32(0,e,!1),new Uint8Array(t)}var Sr=12;async function Cr(e,t,n){let r=xr(t),i=new Uint8Array(Sr);crypto.getRandomValues(i);let a=await crypto.subtle.encrypt(Tr(r,i),n,Se(e)),o=new Uint8Array(r.byteLength+i.byteLength+a.byteLength);return o.set(new Uint8Array(r),0),o.set(new Uint8Array(i),r.byteLength),o.set(new Uint8Array(a),r.byteLength+i.byteLength),o}async function wr(e,t){let n=e.slice(0,4),r=e.slice(4,16),i=e.slice(16),a=await crypto.subtle.decrypt(Tr(n,r),t,i);return xe(new Uint8Array(a))}function Tr(e,t){return{additionalData:e,iv:t,name:`AES-GCM`,tagLength:128}}async function Er(){return await crypto.subtle.generateKey({name:`ECDSA`,namedCurve:`P-256`},!1,[`sign`])}async function Dr(){return await crypto.subtle.generateKey({name:`ECDH`,namedCurve:`P-256`},!1,[`deriveKey`,`deriveBits`])}function Or(){return kr(49152+Math.floor(Math.random()*16384))}function kr(e){if(e<49152||e>65535)throw new X(Y.ERROR_ASSOCIATION_PORT_OUT_OF_RANGE,`Association port number must be between 49152 and 65535. ${e} given.`,{port:e});return e}function Ar(e){return e.replace(/[/+=]/g,e=>({"/":`_`,"+":`-`,"=":`.`})[e])}var jr=`solana-wallet`;function Mr(e){return e.replace(/(^\/+|\/+$)/g,``).split(`/`)}function Nr(e,t){let n=null;if(t){try{n=new URL(t)}catch{}if(n?.protocol!==`https:`)throw new X(Y.ERROR_FORBIDDEN_WALLET_BASE_URL,"Base URLs supplied by wallets must be valid `https` URLs")}n||=new URL(`${jr}:/`);let r=e.startsWith(`/`)?e:[...Mr(n.pathname),...Mr(e)].join(`/`);return new URL(r,n)}async function Pr(e,t,n,r=[`v1`]){let i=kr(t),a=ve(await crypto.subtle.exportKey(`raw`,e)),o=Nr(`v1/associate/local`,n);return o.searchParams.set(`association`,Ar(a)),o.searchParams.set(`port`,`${i}`),r.forEach(e=>{o.searchParams.set(`v`,e)}),o}async function Fr(e,t,n,r,i=[`v1`]){let a=ve(await crypto.subtle.exportKey(`raw`,e)),o=Nr(`v1/associate/remote`,r);return o.searchParams.set(`association`,Ar(a)),o.searchParams.set(`reflector`,`${t}`),o.searchParams.set(`id`,`${k(n,!0)}`),i.forEach(e=>{o.searchParams.set(`v`,e)}),o}async function Ir(e,t,n,r,i,a=[`v1`]){let o=ve(await crypto.subtle.exportKey(`raw`,e)),s=Nr(`v1/associate/${t}/nostr`,i);return s.searchParams.set(`association`,Ar(o)),s.searchParams.set(`relay`,n),s.searchParams.set(`pubkey`,r),a.forEach(e=>{s.searchParams.set(`v`,e)}),s}async function Lr(e,t){let n=JSON.stringify(e),r=e.id;return Cr(n,r,t)}async function Rr(e,t){let n=await wr(e,t),r=JSON.parse(n);if(Object.hasOwnProperty.call(r,`error`))throw new ir(r.id,r.error.code,r.error.message);return r}async function zr(e,t,n){let[r,i]=await Promise.all([crypto.subtle.exportKey(`raw`,t),crypto.subtle.importKey(`raw`,e.slice(0,65),{name:`ECDH`,namedCurve:`P-256`},!1,[])]),a=await crypto.subtle.deriveBits({name:`ECDH`,public:i},n,256),o=await crypto.subtle.importKey(`raw`,a,`HKDF`,!1,[`deriveKey`]);return await crypto.subtle.deriveKey({name:`HKDF`,hash:`SHA-256`,salt:new Uint8Array(r),info:new Uint8Array},o,{name:`AES-GCM`,length:128},!1,[`encrypt`,`decrypt`])}async function Br(e,t){let n=await wr(e,t),r=JSON.parse(n),i=`legacy`;if(Object.hasOwnProperty.call(r,`v`))switch(r.v){case 1:case`1`:case`v1`:i=`v1`;break;case`legacy`:i=`legacy`;break;default:throw new X(Y.ERROR_INVALID_PROTOCOL_VERSION,`Unknown/unsupported protocol version: ${r.v}`)}return{protocol_version:i}}var Vr={Firefox:0,Other:1};function Hr(){return navigator.userAgent.indexOf(`Firefox/`)===-1?Vr.Other:Vr.Firefox}function Ur(){return new Promise((e,t)=>{function n(){clearTimeout(i),window.removeEventListener(`blur`,r)}function r(){n(),e()}window.addEventListener(`blur`,r);let i=setTimeout(()=>{n(),t()},3e3)})}var Wr=null;function Gr(e){(Wr==null||!Wr.isConnected)&&(Wr=document.createElement(`iframe`),Wr.style.display=`none`,document.body.appendChild(Wr)),Wr.contentWindow.location.href=e.toString()}async function Kr(e){if(e.protocol===`https:`)window.location.assign(e);else try{switch(Hr()){case Vr.Firefox:Gr(e);break;case Vr.Other:{let t=Ur();window.location.assign(e),await t;break}}}catch{throw new X(Y.ERROR_WALLET_NOT_FOUND,`Found no installed wallet that supports the mobile wallet protocol.`)}}async function qr(e,t){let n=Or();return await Kr(await Pr(e,n,t)),n}async function Jr(e,t,n,r,i){let a=await Ir(e,t,n,r,i);return t==`local`&&await Kr(a),a}var Yr={retryDelayScheduleMs:[150,150,200,500,500,750,750,1e3],timeoutMs:3e4},Xr=3e4,Zr=`com.solana.mobilewalletadapter.v1`,Qr=`com.solana.mobilewalletadapter.v1.base64`;function $r(){if(typeof window>`u`||window.isSecureContext!==!0)throw new X(Y.ERROR_SECURE_CONTEXT_REQUIRED,"The mobile wallet adapter protocol must be used in a secure context (`https`).")}function ei(e){let t;try{t=new URL(e)}catch{throw new X(Y.ERROR_FORBIDDEN_WALLET_BASE_URL,`Invalid base URL supplied by wallet`)}if(t.protocol!==`https:`)throw new X(Y.ERROR_FORBIDDEN_WALLET_BASE_URL,"Base URLs supplied by wallets must be valid `https` URLs")}function ti(e){return new DataView(e).getUint32(0,!1)}function ni(e){let t=new Uint8Array(e),n=e.byteLength,r=0,i=0,a;do{if(i>=n||i>10)throw RangeError(`Failed to decode varint`);a=t[i++],r|=(a&127)<<7*i}while(a>=128);return{value:r,offset:i}}function ri(e){let{value:t,offset:n}=ni(e);return new Uint8Array(e.slice(n,n+t))}async function ii(e){$r();let t=await Er(),n=`ws://localhost:${await qr(t.publicKey,e?.baseUri)}/solana-wallet`,r,i=(()=>{let e=[...Yr.retryDelayScheduleMs];return()=>e.length>1?e.shift():e[0]})(),a=1,o=0,s={__type:`disconnected`},c,l=!1,u;return{close:()=>{c.close(),u()},wallet:new Promise((e,d)=>{let f={},p=e=>{for(let t of Object.keys(f)){let n=Number(t),r=f[n];delete f[n],r.reject(e)}},m=async()=>{if(s.__type!==`connecting`){console.warn(`Expected adapter state to be \`connecting\` at the moment the websocket opens. Got \`${s.__type}\`.`);return}c.removeEventListener(`open`,m);let{associationKeypair:e}=s,t=await Dr();c.send(await fr(t.publicKey,e.privateKey)),s={__type:`hello_req_sent`,associationPublicKey:e.publicKey,ecdhPrivateKey:t.privateKey}},h=e=>{e.wasClean?s={__type:`disconnected`}:d(new X(Y.ERROR_SESSION_CLOSED,`The wallet session dropped unexpectedly (${e.code}: ${e.reason}).`,{closeEvent:e})),p(new X(Y.ERROR_SESSION_CLOSED,`The wallet session closed before a response was received (${e.code}: ${e.reason}).`,{closeEvent:e})),v()},g=async e=>{p(new X(Y.ERROR_SESSION_CLOSED,`The wallet session encountered a transport error before a response was received.`,{closeEvent:new CloseEvent(`transport error`)})),v(),Date.now()-r>=Yr.timeoutMs?d(new X(Y.ERROR_SESSION_TIMEOUT,`Failed to connect to the wallet websocket at ${n}.`)):(await new Promise(e=>{let t=i();y=window.setTimeout(e,t)}),b())},_=async n=>{let r=await n.data.arrayBuffer();switch(s.__type){case`connecting`:{if(r.byteLength!==0){d(new X(Y.ERROR_ILLEGAL_TRANSPORT_STATE,`Encountered unexpected message while connecting`));return}let e=await Dr();c.send(await fr(e.publicKey,t.privateKey)),s={__type:`hello_req_sent`,associationPublicKey:t.publicKey,ecdhPrivateKey:e.privateKey};break}case`connected`:if(r.byteLength===0)break;try{let e=ti(r.slice(0,4));if(e!==o+1)throw new X(Y.ERROR_ILLEGAL_TRANSPORT_STATE,`Encrypted message has invalid sequence number`);o=e;let t=await Rr(r,s.sharedSecret),n=f[t.id];if(!n)break;delete f[t.id],n.resolve(t.result)}catch(e){if(e instanceof ir){let t=f[e.jsonRpcMessageId];if(!t)break;delete f[e.jsonRpcMessageId],t.reject(e)}else p(e),c.close()}break;case`hello_req_sent`:{if(r.byteLength===0){let e=await Dr();c.send(await fr(e.publicKey,t.privateKey)),s={__type:`hello_req_sent`,associationPublicKey:t.publicKey,ecdhPrivateKey:e.privateKey};break}let n=await zr(r,s.associationPublicKey,s.ecdhPrivateKey),i=r.slice(65),u=i.byteLength===0?{protocol_version:`legacy`}:await(async()=>{let e=ti(i.slice(0,4));return e===o+1?(o=e,Br(i,n)):(d(new X(Y.ERROR_ILLEGAL_TRANSPORT_STATE,`Encrypted message has invalid sequence number`)),c.close(),{protocol_version:`v1`})})();s={__type:`connected`,sharedSecret:n,sessionProperties:u};let p=_r(u.protocol_version,async(e,t)=>{let r=a++;return c.send(await Lr({id:r,jsonrpc:`2.0`,method:e,params:t??{}},n)),new Promise((t,n)=>{f[r]={resolve(r){switch(e){case`authorize`:case`reauthorize`:{let{wallet_uri_base:e}=r;if(e!=null)try{ei(e)}catch(e){n(e);return}break}}t(r)},reject:n}})});l=!0;try{e(p)}catch(e){d(e)}break}}};u=()=>{c.removeEventListener(`message`,_),v(),l||d(new X(Y.ERROR_SESSION_CLOSED,`The wallet session was closed before connection.`,{closeEvent:new CloseEvent(`socket was closed before connection`)}))};let v,y,b=()=>{v&&v(),s={__type:`connecting`,associationKeypair:t},r===void 0&&(r=Date.now()),c=new WebSocket(n,[Zr]),c.addEventListener(`open`,m),c.addEventListener(`close`,h),c.addEventListener(`error`,g),c.addEventListener(`message`,_),v=()=>{window.clearTimeout(y),c.removeEventListener(`open`,m),c.removeEventListener(`close`,h),c.removeEventListener(`error`,g),c.removeEventListener(`message`,_)}};b()})}}async function ai(e){$r();let t=await Er(),n=`wss://${e?.remoteHostAuthority}/reflect`,r,i=(()=>{let e=[...Yr.retryDelayScheduleMs];return()=>e.length>1?e.shift():e[0]})(),a=1,o=0,s,c={__type:`disconnected`},l,u,d=async e=>s==`base64`?A(await e.data).buffer:await e.data.arrayBuffer(),f=await new Promise((a,o)=>{let f=async()=>{if(c.__type!==`connecting`){console.warn(`Expected adapter state to be \`connecting\` at the moment the websocket opens. Got \`${c.__type}\`.`);return}s=l.protocol.includes(Qr)?`base64`:`binary`,l.removeEventListener(`open`,f)},p=e=>{e.wasClean?c={__type:`disconnected`}:o(new X(Y.ERROR_SESSION_CLOSED,`The wallet session dropped unexpectedly (${e.code}: ${e.reason}).`,{closeEvent:e})),u()},m=async e=>{u(),Date.now()-r>=Yr.timeoutMs?o(new X(Y.ERROR_SESSION_TIMEOUT,`Failed to connect to the wallet websocket at ${n}.`)):(await new Promise(e=>{let t=i();g=window.setTimeout(e,t)}),_())},h=async n=>{let r=await d(n);if(c.__type===`connecting`){if(r.byteLength==0){o(new X(Y.ERROR_ILLEGAL_TRANSPORT_STATE,`Encountered unexpected message while connecting`)),l.close();return}let n=ri(r);c={__type:`reflector_id_received`,reflectorId:n};let i=await Fr(t.publicKey,e.remoteHostAuthority,n,e?.baseUri);l.removeEventListener(`message`,h),a(i)}},g,_=()=>{u&&u(),c={__type:`connecting`,associationKeypair:t},r===void 0&&(r=Date.now()),l=new WebSocket(n,[Zr,Qr]),l.addEventListener(`open`,f),l.addEventListener(`close`,p),l.addEventListener(`error`,m),l.addEventListener(`message`,h),u=()=>{window.clearTimeout(g),l.removeEventListener(`open`,f),l.removeEventListener(`close`,p),l.removeEventListener(`error`,m),l.removeEventListener(`message`,h)}};_()}),p=!1,m;return{associationUrl:f,close:()=>{l.close(),m()},wallet:new Promise((e,n)=>{let r={},i=e=>{for(let t of Object.keys(r)){let n=Number(t),i=r[n];delete r[n],i.reject(e)}},f=async u=>{let f=await d(u);switch(c.__type){case`reflector_id_received`:{if(f.byteLength!==0){n(new X(Y.ERROR_ILLEGAL_TRANSPORT_STATE,`Encountered unexpected message while awaiting reflection`)),l.close();return}let e=await Dr(),r=await fr(e.publicKey,t.privateKey);s==`base64`?l.send(k(r)):l.send(r),c={__type:`hello_req_sent`,associationPublicKey:t.publicKey,ecdhPrivateKey:e.privateKey};break}case`connected`:if(f.byteLength===0)break;try{let e=ti(f.slice(0,4));if(e!==o+1)throw new X(Y.ERROR_ILLEGAL_TRANSPORT_STATE,`Encrypted message has invalid sequence number`);o=e;let t=await Rr(f,c.sharedSecret),n=r[t.id];if(!n)break;delete r[t.id],n.resolve(t.result)}catch(e){if(e instanceof ir){let t=r[e.jsonRpcMessageId];if(!t)break;delete r[e.jsonRpcMessageId],t.reject(e)}else i(e),l.close()}break;case`hello_req_sent`:{let t=await zr(f,c.associationPublicKey,c.ecdhPrivateKey),i=f.slice(65),u=i.byteLength===0?{protocol_version:`legacy`}:await(async()=>{let e=ti(i.slice(0,4));return e===o+1?(o=e,Br(i,t)):(n(new X(Y.ERROR_ILLEGAL_TRANSPORT_STATE,`Encrypted message has invalid sequence number`)),l.close(),{protocol_version:`v1`})})();c={__type:`connected`,sharedSecret:t,sessionProperties:u};let d=_r(u.protocol_version,async(e,n)=>{let i=a++,o=await Lr({id:i,jsonrpc:`2.0`,method:e,params:n??{}},t);return s==`base64`?l.send(k(o)):l.send(o),new Promise((t,n)=>{r[i]={resolve(r){switch(e){case`authorize`:case`reauthorize`:{let{wallet_uri_base:e}=r;if(e!=null)try{ei(e)}catch(e){n(e);return}break}}t(r)},reject:n}})});p=!0;try{e(d)}catch(e){n(e)}break}}};l.addEventListener(`message`,f),l.addEventListener(`close`,()=>i(new X(Y.ERROR_SESSION_CLOSED,`The wallet session closed before a response was received.`,{closeEvent:new CloseEvent(`session closed`)}))),l.addEventListener(`error`,()=>i(new X(Y.ERROR_SESSION_CLOSED,`The wallet session encountered a transport error before a response was received.`,{closeEvent:new CloseEvent(`transport error`)}))),m=()=>{l.removeEventListener(`message`,f),u(),p||n(new X(Y.ERROR_SESSION_CLOSED,`The wallet session was closed before connection.`,{closeEvent:new CloseEvent(`socket was closed before connection`)}))}})}}async function oi(e){$r();let t=await Er(),{privateKey:n,publicKey:r}=or(),i=await Jr(t.publicKey,e.connectionType,e.relayDomain,r,e.baseUri),a=await sr(t.publicKey),o=crypto.randomUUID(),s=JSON.stringify([`REQ`,o,{kinds:[ar],"#d":[a]}]),c=`wss://${e.relayDomain}`,l=Date.now(),u=(()=>{let e=[...Yr.retryDelayScheduleMs];return()=>e.length>1?e.shift():e[0]})(),d=1,f=0,p={__type:`disconnected`},m,h=!1,g,_=(e,t)=>{let r=ur(ar,e,[[`d`,a],[`p`,t]],n);m.send(JSON.stringify([`EVENT`,r]))},v=()=>{if(p.__type==`connected`||p.__type==`hello_req_sent`){let e=ur(ar,``,[[`d`,a],[`p`,p.walletNostrPubkey],[`msg`,`SESSION_END`]],n);m.send(JSON.stringify([`EVENT`,e]))}m.close()},y={close:()=>{v(),g()},wallet:new Promise((i,o)=>{let y={},b,x=e=>{for(let t of Object.keys(y)){let n=Number(t),r=y[n];delete y[n],r.reject(e)}},S=async()=>{if(p.__type!==`connecting`){console.warn(`Expected adapter state to be \`connecting\` at the moment the websocket opens. Got \`${p.__type}\`.`);return}m.removeEventListener(`open`,S),m.send(s),b=window.setInterval(()=>{Object.keys(y).length>0&&m.send(s)},Xr),p={__type:`subscribed`,dappNostrPrivateKey:n,dappNostrPubkey:r,sessionIdentifier:a}},C=e=>{e.wasClean?p={__type:`disconnected`}:o(new X(Y.ERROR_SESSION_CLOSED,`The Nostr subscription dropped unexpectedly (${e.code}: ${e.reason}).`,{closeEvent:e})),x(new X(Y.ERROR_SESSION_CLOSED,`The wallet session closed before a response was received (${e.code}: ${e.reason}).`,{closeEvent:e})),T()},ee=async()=>{x(new X(Y.ERROR_SESSION_CLOSED,`The wallet session encountered a transport error before a response was received.`,{closeEvent:new CloseEvent(`transport error`)})),T(),Date.now()-l>=Yr.timeoutMs?o(new X(Y.ERROR_SESSION_TIMEOUT,`Failed to connect to the Nostr relay at ${e.relayDomain}.`)):(await new Promise(e=>{let t=u();te=window.setTimeout(e,t)}),E())},w=async e=>{let n;try{if(n=JSON.parse(e.data),!Array.isArray(n))throw Error()}catch{o(new X(Y.ERROR_ILLEGAL_TRANSPORT_STATE,`Invalid Nostr message received: `+e.data)),v();return}let r=n[0];if(r===`CLOSED`)x(new X(Y.ERROR_SESSION_CLOSED,`The Nostr relay closed the session subscription before a response was received.`,{closeEvent:new CloseEvent(`session closed`)})),T();else if(r===`EVENT`){let e=n[2];if(!e||!dr(e))return;if(e.pubkey===p.walletNostrPubkey&&e.tags.some(([e,t])=>e===`msg`&&t===`SESSION_END`)){let e=new X(Y.ERROR_SESSION_CLOSED,`The wallet ended the session.`,{closeEvent:new CloseEvent(`session ended by wallet`)});o(e),x(e),m.close();return}switch(p.__type){case`subscribed`:{if(e.content.length!==0){o(new X(Y.ERROR_ILLEGAL_TRANSPORT_STATE,`Encountered unexpected message while awaiting reflection`)),v();return}let n=e.pubkey,r=await Dr(),i=k(await fr(r.publicKey,t.privateKey));_(i,n),p={__type:`hello_req_sent`,associationPublicKey:t.publicKey,ecdhPrivateKey:r.privateKey,walletNostrPubkey:n};break}case`hello_req_sent`:{if(e.pubkey!==p.walletNostrPubkey||e.content===``)return;let t=A(e.content).buffer,n=await zr(t,p.associationPublicKey,p.ecdhPrivateKey),r=t.slice(65),a=r.byteLength===0?{protocol_version:`legacy`}:await(async()=>{let e=ti(r.slice(0,4));return e===f+1?(f=e,Br(r,n)):(o(new X(Y.ERROR_ILLEGAL_TRANSPORT_STATE,`Encrypted message has invalid sequence number`)),v(),{protocol_version:`v1`})})();p={__type:`connected`,sharedSecret:n,sessionProperties:a,walletNostrPubkey:p.walletNostrPubkey};let s=_r(a.protocol_version,async(e,t)=>{let r=d++,i=await Lr({id:r,jsonrpc:`2.0`,method:e,params:t??{}},n);return _(k(i),p.walletNostrPubkey),new Promise((t,n)=>{y[r]={resolve(r){switch(e){case`authorize`:case`reauthorize`:{let{wallet_uri_base:e}=r;if(e!=null)try{ei(e)}catch(e){n(e);return}break}}t(r)},reject:n}})});h=!0;try{i(s)}catch(e){o(e)}break}case`connected`:if(e.pubkey!==p.walletNostrPubkey||e.content===``)return;try{let t=A(e.content).buffer,n=ti(t.slice(0,4));if(n!==f+1)throw new X(Y.ERROR_ILLEGAL_TRANSPORT_STATE,`Encrypted message has invalid sequence number`);f=n;let r=await Rr(t,p.sharedSecret),i=y[r.id];if(!i)break;delete y[r.id],i.resolve(r.result)}catch(e){if(e instanceof ir){let t=y[e.jsonRpcMessageId];if(!t)break;delete y[e.jsonRpcMessageId],t.reject(e)}else x(e),v()}}}};g=()=>{m.removeEventListener(`message`,w),T(),x(new X(Y.ERROR_SESSION_CLOSED,`The wallet session was closed before a response was received.`,{closeEvent:new CloseEvent(`session closed`)})),h||o(new X(Y.ERROR_SESSION_CLOSED,`The wallet session was closed before connection.`,{closeEvent:new CloseEvent(`socket was closed before connection`)}))};let T,te,E=()=>{T&&T(),p={__type:`connecting`,associationKeypair:t},m=new WebSocket(c),m.addEventListener(`open`,S),m.addEventListener(`close`,C),m.addEventListener(`error`,ee),m.addEventListener(`message`,w),T=()=>{window.clearInterval(b),window.clearTimeout(te),m.removeEventListener(`open`,S),m.removeEventListener(`close`,C),m.removeEventListener(`error`,ee),m.removeEventListener(`message`,w)}};E()})};return e.connectionType==`local`?y:{...y,associationUrl:i}}var si=`solana:signAndSendTransaction`,ci=`solana:signIn`,li=`solana:signMessage`,ui=`solana:signTransaction`,di=`standard:connect`,fi=`standard:disconnect`,pi=`standard:events`,mi=o(((e,t)=>{t.exports=function(){return typeof Promise==`function`&&Promise.prototype&&Promise.prototype.then}})),Z=o((e=>{var t,n=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];e.getSymbolSize=function(e){if(!e)throw Error(`"version" cannot be null or undefined`);if(e<1||e>40)throw Error(`"version" should be in range from 1 to 40`);return e*4+17},e.getSymbolTotalCodewords=function(e){return n[e]},e.getBCHDigit=function(e){let t=0;for(;e!==0;)t++,e>>>=1;return t},e.setToSJISFunction=function(e){if(typeof e!=`function`)throw Error(`"toSJISFunc" is not a valid function.`);t=e},e.isKanjiModeEnabled=function(){return t!==void 0},e.toSJIS=function(e){return t(e)}})),hi=o((e=>{e.L={bit:1},e.M={bit:0},e.Q={bit:3},e.H={bit:2};function t(t){if(typeof t!=`string`)throw Error(`Param is not a string`);switch(t.toLowerCase()){case`l`:case`low`:return e.L;case`m`:case`medium`:return e.M;case`q`:case`quartile`:return e.Q;case`h`:case`high`:return e.H;default:throw Error(`Unknown EC Level: `+t)}}e.isValid=function(e){return e&&e.bit!==void 0&&e.bit>=0&&e.bit<4},e.from=function(n,r){if(e.isValid(n))return n;try{return t(n)}catch{return r}}})),gi=o(((e,t)=>{function n(){this.buffer=[],this.length=0}n.prototype={get:function(e){let t=Math.floor(e/8);return(this.buffer[t]>>>7-e%8&1)==1},put:function(e,t){for(let n=0;n<t;n++)this.putBit((e>>>t-n-1&1)==1)},getLengthInBits:function(){return this.length},putBit:function(e){let t=Math.floor(this.length/8);this.buffer.length<=t&&this.buffer.push(0),e&&(this.buffer[t]|=128>>>this.length%8),this.length++}},t.exports=n})),_i=o(((e,t)=>{function n(e){if(!e||e<1)throw Error(`BitMatrix size must be defined and greater than 0`);this.size=e,this.data=new Uint8Array(e*e),this.reservedBit=new Uint8Array(e*e)}n.prototype.set=function(e,t,n,r){let i=e*this.size+t;this.data[i]=n,r&&(this.reservedBit[i]=!0)},n.prototype.get=function(e,t){return this.data[e*this.size+t]},n.prototype.xor=function(e,t,n){this.data[e*this.size+t]^=n},n.prototype.isReserved=function(e,t){return this.reservedBit[e*this.size+t]},t.exports=n})),vi=o((e=>{var t=Z().getSymbolSize;e.getRowColCoords=function(e){if(e===1)return[];let n=Math.floor(e/7)+2,r=t(e),i=r===145?26:Math.ceil((r-13)/(2*n-2))*2,a=[r-7];for(let e=1;e<n-1;e++)a[e]=a[e-1]-i;return a.push(6),a.reverse()},e.getPositions=function(t){let n=[],r=e.getRowColCoords(t),i=r.length;for(let e=0;e<i;e++)for(let t=0;t<i;t++)e===0&&t===0||e===0&&t===i-1||e===i-1&&t===0||n.push([r[e],r[t]]);return n}})),yi=o((e=>{var t=Z().getSymbolSize,n=7;e.getPositions=function(e){let r=t(e);return[[0,0],[r-n,0],[0,r-n]]}})),bi=o((e=>{e.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};var t={N1:3,N2:3,N3:40,N4:10};e.isValid=function(e){return e!=null&&e!==``&&!isNaN(e)&&e>=0&&e<=7},e.from=function(t){return e.isValid(t)?parseInt(t,10):void 0},e.getPenaltyN1=function(e){let n=e.size,r=0,i=0,a=0,o=null,s=null;for(let c=0;c<n;c++){i=a=0,o=s=null;for(let l=0;l<n;l++){let n=e.get(c,l);n===o?i++:(i>=5&&(r+=t.N1+(i-5)),o=n,i=1),n=e.get(l,c),n===s?a++:(a>=5&&(r+=t.N1+(a-5)),s=n,a=1)}i>=5&&(r+=t.N1+(i-5)),a>=5&&(r+=t.N1+(a-5))}return r},e.getPenaltyN2=function(e){let n=e.size,r=0;for(let t=0;t<n-1;t++)for(let i=0;i<n-1;i++){let n=e.get(t,i)+e.get(t,i+1)+e.get(t+1,i)+e.get(t+1,i+1);(n===4||n===0)&&r++}return r*t.N2},e.getPenaltyN3=function(e){let n=e.size,r=0,i=0,a=0;for(let t=0;t<n;t++){i=a=0;for(let o=0;o<n;o++)i=i<<1&2047|e.get(t,o),o>=10&&(i===1488||i===93)&&r++,a=a<<1&2047|e.get(o,t),o>=10&&(a===1488||a===93)&&r++}return r*t.N3},e.getPenaltyN4=function(e){let n=0,r=e.data.length;for(let t=0;t<r;t++)n+=e.data[t];return Math.abs(Math.ceil(n*100/r/5)-10)*t.N4};function n(t,n,r){switch(t){case e.Patterns.PATTERN000:return(n+r)%2==0;case e.Patterns.PATTERN001:return n%2==0;case e.Patterns.PATTERN010:return r%3==0;case e.Patterns.PATTERN011:return(n+r)%3==0;case e.Patterns.PATTERN100:return(Math.floor(n/2)+Math.floor(r/3))%2==0;case e.Patterns.PATTERN101:return n*r%2+n*r%3==0;case e.Patterns.PATTERN110:return(n*r%2+n*r%3)%2==0;case e.Patterns.PATTERN111:return(n*r%3+(n+r)%2)%2==0;default:throw Error(`bad maskPattern:`+t)}}e.applyMask=function(e,t){let r=t.size;for(let i=0;i<r;i++)for(let a=0;a<r;a++)t.isReserved(a,i)||t.xor(a,i,n(e,a,i))},e.getBestMask=function(t,n){let r=Object.keys(e.Patterns).length,i=0,a=1/0;for(let o=0;o<r;o++){n(o),e.applyMask(o,t);let r=e.getPenaltyN1(t)+e.getPenaltyN2(t)+e.getPenaltyN3(t)+e.getPenaltyN4(t);e.applyMask(o,t),r<a&&(a=r,i=o)}return i}})),xi=o((e=>{var t=hi(),n=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],r=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];e.getBlocksCount=function(e,r){switch(r){case t.L:return n[(e-1)*4+0];case t.M:return n[(e-1)*4+1];case t.Q:return n[(e-1)*4+2];case t.H:return n[(e-1)*4+3];default:return}},e.getTotalCodewordsCount=function(e,n){switch(n){case t.L:return r[(e-1)*4+0];case t.M:return r[(e-1)*4+1];case t.Q:return r[(e-1)*4+2];case t.H:return r[(e-1)*4+3];default:return}}})),Si=o((e=>{var t=new Uint8Array(512),n=new Uint8Array(256);(function(){let e=1;for(let r=0;r<255;r++)t[r]=e,n[e]=r,e<<=1,e&256&&(e^=285);for(let e=255;e<512;e++)t[e]=t[e-255]})(),e.log=function(e){if(e<1)throw Error(`log(`+e+`)`);return n[e]},e.exp=function(e){return t[e]},e.mul=function(e,r){return e===0||r===0?0:t[n[e]+n[r]]}})),Ci=o((e=>{var t=Si();e.mul=function(e,n){let r=new Uint8Array(e.length+n.length-1);for(let i=0;i<e.length;i++)for(let a=0;a<n.length;a++)r[i+a]^=t.mul(e[i],n[a]);return r},e.mod=function(e,n){let r=new Uint8Array(e);for(;r.length-n.length>=0;){let e=r[0];for(let i=0;i<n.length;i++)r[i]^=t.mul(n[i],e);let i=0;for(;i<r.length&&r[i]===0;)i++;r=r.slice(i)}return r},e.generateECPolynomial=function(n){let r=new Uint8Array([1]);for(let i=0;i<n;i++)r=e.mul(r,new Uint8Array([1,t.exp(i)]));return r}})),wi=o(((e,t)=>{var n=Ci();function r(e){this.genPoly=void 0,this.degree=e,this.degree&&this.initialize(this.degree)}r.prototype.initialize=function(e){this.degree=e,this.genPoly=n.generateECPolynomial(this.degree)},r.prototype.encode=function(e){if(!this.genPoly)throw Error(`Encoder not initialized`);let t=new Uint8Array(e.length+this.degree);t.set(e);let r=n.mod(t,this.genPoly),i=this.degree-r.length;if(i>0){let e=new Uint8Array(this.degree);return e.set(r,i),e}return r},t.exports=r})),Ti=o((e=>{e.isValid=function(e){return!isNaN(e)&&e>=1&&e<=40}})),Ei=o((e=>{var t=`[0-9]+`,n=`[A-Z $%*+\\-./:]+`,r=`(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+`;r=r.replace(/u/g,`\\u`);var i=`(?:(?![A-Z0-9 $%*+\\-./:]|`+r+`)(?:.|[\r
]))+`;e.KANJI=new RegExp(r,`g`),e.BYTE_KANJI=RegExp(`[^A-Z0-9 $%*+\\-./:]+`,`g`),e.BYTE=new RegExp(i,`g`),e.NUMERIC=new RegExp(t,`g`),e.ALPHANUMERIC=new RegExp(n,`g`);var a=RegExp(`^`+r+`$`),o=RegExp(`^[0-9]+$`),s=RegExp(`^[A-Z0-9 $%*+\\-./:]+$`);e.testKanji=function(e){return a.test(e)},e.testNumeric=function(e){return o.test(e)},e.testAlphanumeric=function(e){return s.test(e)}})),Q=o((e=>{var t=Ti(),n=Ei();e.NUMERIC={id:`Numeric`,bit:1,ccBits:[10,12,14]},e.ALPHANUMERIC={id:`Alphanumeric`,bit:2,ccBits:[9,11,13]},e.BYTE={id:`Byte`,bit:4,ccBits:[8,16,16]},e.KANJI={id:`Kanji`,bit:8,ccBits:[8,10,12]},e.MIXED={bit:-1},e.getCharCountIndicator=function(e,n){if(!e.ccBits)throw Error(`Invalid mode: `+e);if(!t.isValid(n))throw Error(`Invalid version: `+n);return n>=1&&n<10?e.ccBits[0]:n<27?e.ccBits[1]:e.ccBits[2]},e.getBestModeForData=function(t){return n.testNumeric(t)?e.NUMERIC:n.testAlphanumeric(t)?e.ALPHANUMERIC:n.testKanji(t)?e.KANJI:e.BYTE},e.toString=function(e){if(e&&e.id)return e.id;throw Error(`Invalid mode`)},e.isValid=function(e){return e&&e.bit&&e.ccBits};function r(t){if(typeof t!=`string`)throw Error(`Param is not a string`);switch(t.toLowerCase()){case`numeric`:return e.NUMERIC;case`alphanumeric`:return e.ALPHANUMERIC;case`kanji`:return e.KANJI;case`byte`:return e.BYTE;default:throw Error(`Unknown mode: `+t)}}e.from=function(t,n){if(e.isValid(t))return t;try{return r(t)}catch{return n}}})),Di=o((e=>{var t=Z(),n=xi(),r=hi(),i=Q(),a=Ti(),o=7973,s=t.getBCHDigit(o);function c(t,n,r){for(let i=1;i<=40;i++)if(n<=e.getCapacity(i,r,t))return i}function l(e,t){return i.getCharCountIndicator(e,t)+4}function u(e,t){let n=0;return e.forEach(function(e){let r=l(e.mode,t);n+=r+e.getBitsLength()}),n}function d(t,n){for(let r=1;r<=40;r++)if(u(t,r)<=e.getCapacity(r,n,i.MIXED))return r}e.from=function(e,t){return a.isValid(e)?parseInt(e,10):t},e.getCapacity=function(e,r,o){if(!a.isValid(e))throw Error(`Invalid QR Code version`);o===void 0&&(o=i.BYTE);let s=(t.getSymbolTotalCodewords(e)-n.getTotalCodewordsCount(e,r))*8;if(o===i.MIXED)return s;let c=s-l(o,e);switch(o){case i.NUMERIC:return Math.floor(c/10*3);case i.ALPHANUMERIC:return Math.floor(c/11*2);case i.KANJI:return Math.floor(c/13);case i.BYTE:default:return Math.floor(c/8)}},e.getBestVersionForData=function(e,t){let n,i=r.from(t,r.M);if(Array.isArray(e)){if(e.length>1)return d(e,i);if(e.length===0)return 1;n=e[0]}else n=e;return c(n.mode,n.getLength(),i)},e.getEncodedBits=function(e){if(!a.isValid(e)||e<7)throw Error(`Invalid QR Code version`);let n=e<<12;for(;t.getBCHDigit(n)-s>=0;)n^=o<<t.getBCHDigit(n)-s;return e<<12|n}})),Oi=o((e=>{var t=Z(),n=1335,r=21522,i=t.getBCHDigit(n);e.getEncodedBits=function(e,a){let o=e.bit<<3|a,s=o<<10;for(;t.getBCHDigit(s)-i>=0;)s^=n<<t.getBCHDigit(s)-i;return(o<<10|s)^r}})),ki=o(((e,t)=>{var n=Q();function r(e){this.mode=n.NUMERIC,this.data=e.toString()}r.getBitsLength=function(e){return 10*Math.floor(e/3)+(e%3?e%3*3+1:0)},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(e){let t,n,r;for(t=0;t+3<=this.data.length;t+=3)n=this.data.substr(t,3),r=parseInt(n,10),e.put(r,10);let i=this.data.length-t;i>0&&(n=this.data.substr(t),r=parseInt(n,10),e.put(r,i*3+1))},t.exports=r})),Ai=o(((e,t)=>{var n=Q(),r=`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`.split(``);function i(e){this.mode=n.ALPHANUMERIC,this.data=e}i.getBitsLength=function(e){return 11*Math.floor(e/2)+e%2*6},i.prototype.getLength=function(){return this.data.length},i.prototype.getBitsLength=function(){return i.getBitsLength(this.data.length)},i.prototype.write=function(e){let t=0;for(;t+2<=this.data.length;t+=2){let n=r.indexOf(this.data[t])*45;n+=r.indexOf(this.data[t+1]),e.put(n,11)}this.data.length%2&&e.put(r.indexOf(this.data[t]),6)},t.exports=i})),ji=o(((e,t)=>{var n=Q();function r(e){this.mode=n.BYTE,this.data=typeof e==`string`?new TextEncoder().encode(e):new Uint8Array(e)}r.getBitsLength=function(e){return e*8},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(e){for(let t=0,n=this.data.length;t<n;t++)e.put(this.data[t],8)},t.exports=r})),Mi=o(((e,t)=>{var n=Q(),r=Z();function i(e){this.mode=n.KANJI,this.data=e}i.getBitsLength=function(e){return e*13},i.prototype.getLength=function(){return this.data.length},i.prototype.getBitsLength=function(){return i.getBitsLength(this.data.length)},i.prototype.write=function(e){let t=0;for(;t<this.data.length;t++){let n=r.toSJIS(this.data[t]);if(n>=33088&&n<=40956)n-=33088;else if(n>=57408&&n<=60351)n-=49472;else throw Error(`Invalid SJIS character: `+this.data[t]+`
Make sure your charset is UTF-8`);n=(n>>>8&255)*192+(n&255),e.put(n,13)}},t.exports=i})),Ni=o(((e,t)=>{var n={single_source_shortest_paths:function(e,t,r){var i={},a={};a[t]=0;var o=n.PriorityQueue.make();o.push(t,0);for(var s,c,l,u,d,f,p,m,h;!o.empty();)for(l in s=o.pop(),c=s.value,u=s.cost,d=e[c]||{},d)d.hasOwnProperty(l)&&(f=d[l],p=u+f,m=a[l],h=a[l]===void 0,(h||m>p)&&(a[l]=p,o.push(l,p),i[l]=c));if(r!==void 0&&a[r]===void 0){var g=[`Could not find a path from `,t,` to `,r,`.`].join(``);throw Error(g)}return i},extract_shortest_path_from_predecessor_list:function(e,t){for(var n=[],r=t;r;)n.push(r),e[r],r=e[r];return n.reverse(),n},find_path:function(e,t,r){var i=n.single_source_shortest_paths(e,t,r);return n.extract_shortest_path_from_predecessor_list(i,r)},PriorityQueue:{make:function(e){var t=n.PriorityQueue,r={},i;for(i in e||={},t)t.hasOwnProperty(i)&&(r[i]=t[i]);return r.queue=[],r.sorter=e.sorter||t.default_sorter,r},default_sorter:function(e,t){return e.cost-t.cost},push:function(e,t){var n={value:e,cost:t};this.queue.push(n),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return this.queue.length===0}}};t!==void 0&&(t.exports=n)})),Pi=o((e=>{var t=Q(),n=ki(),r=Ai(),i=ji(),a=Mi(),o=Ei(),s=Z(),c=Ni();function l(e){return unescape(encodeURIComponent(e)).length}function u(e,t,n){let r=[],i;for(;(i=e.exec(n))!==null;)r.push({data:i[0],index:i.index,mode:t,length:i[0].length});return r}function d(e){let n=u(o.NUMERIC,t.NUMERIC,e),r=u(o.ALPHANUMERIC,t.ALPHANUMERIC,e),i,a;return s.isKanjiModeEnabled()?(i=u(o.BYTE,t.BYTE,e),a=u(o.KANJI,t.KANJI,e)):(i=u(o.BYTE_KANJI,t.BYTE,e),a=[]),n.concat(r,i,a).sort(function(e,t){return e.index-t.index}).map(function(e){return{data:e.data,mode:e.mode,length:e.length}})}function f(e,o){switch(o){case t.NUMERIC:return n.getBitsLength(e);case t.ALPHANUMERIC:return r.getBitsLength(e);case t.KANJI:return a.getBitsLength(e);case t.BYTE:return i.getBitsLength(e)}}function p(e){return e.reduce(function(e,t){let n=e.length-1>=0?e[e.length-1]:null;return n&&n.mode===t.mode?(e[e.length-1].data+=t.data,e):(e.push(t),e)},[])}function m(e){let n=[];for(let r=0;r<e.length;r++){let i=e[r];switch(i.mode){case t.NUMERIC:n.push([i,{data:i.data,mode:t.ALPHANUMERIC,length:i.length},{data:i.data,mode:t.BYTE,length:i.length}]);break;case t.ALPHANUMERIC:n.push([i,{data:i.data,mode:t.BYTE,length:i.length}]);break;case t.KANJI:n.push([i,{data:i.data,mode:t.BYTE,length:l(i.data)}]);break;case t.BYTE:n.push([{data:i.data,mode:t.BYTE,length:l(i.data)}])}}return n}function h(e,n){let r={},i={start:{}},a=[`start`];for(let o=0;o<e.length;o++){let s=e[o],c=[];for(let e=0;e<s.length;e++){let l=s[e],u=``+o+e;c.push(u),r[u]={node:l,lastCount:0},i[u]={};for(let e=0;e<a.length;e++){let o=a[e];r[o]&&r[o].node.mode===l.mode?(i[o][u]=f(r[o].lastCount+l.length,l.mode)-f(r[o].lastCount,l.mode),r[o].lastCount+=l.length):(r[o]&&(r[o].lastCount=l.length),i[o][u]=f(l.length,l.mode)+4+t.getCharCountIndicator(l.mode,n))}}a=c}for(let e=0;e<a.length;e++)i[a[e]].end=0;return{map:i,table:r}}function g(e,o){let c,l=t.getBestModeForData(e);if(c=t.from(o,l),c!==t.BYTE&&c.bit<l.bit)throw Error(`"`+e+`" cannot be encoded with mode `+t.toString(c)+`.
 Suggested mode is: `+t.toString(l));switch(c===t.KANJI&&!s.isKanjiModeEnabled()&&(c=t.BYTE),c){case t.NUMERIC:return new n(e);case t.ALPHANUMERIC:return new r(e);case t.KANJI:return new a(e);case t.BYTE:return new i(e)}}e.fromArray=function(e){return e.reduce(function(e,t){return typeof t==`string`?e.push(g(t,null)):t.data&&e.push(g(t.data,t.mode)),e},[])},e.fromString=function(t,n){let r=h(m(d(t,s.isKanjiModeEnabled())),n),i=c.find_path(r.map,`start`,`end`),a=[];for(let e=1;e<i.length-1;e++)a.push(r.table[i[e]].node);return e.fromArray(p(a))},e.rawSplit=function(t){return e.fromArray(d(t,s.isKanjiModeEnabled()))}})),Fi=o((e=>{var t=Z(),n=hi(),r=gi(),i=_i(),a=vi(),o=yi(),s=bi(),c=xi(),l=wi(),u=Di(),d=Oi(),f=Q(),p=Pi();function m(e,t){let n=e.size,r=o.getPositions(t);for(let t=0;t<r.length;t++){let i=r[t][0],a=r[t][1];for(let t=-1;t<=7;t++)if(!(i+t<=-1||n<=i+t))for(let r=-1;r<=7;r++)a+r<=-1||n<=a+r||(t>=0&&t<=6&&(r===0||r===6)||r>=0&&r<=6&&(t===0||t===6)||t>=2&&t<=4&&r>=2&&r<=4?e.set(i+t,a+r,!0,!0):e.set(i+t,a+r,!1,!0))}}function h(e){let t=e.size;for(let n=8;n<t-8;n++){let t=n%2==0;e.set(n,6,t,!0),e.set(6,n,t,!0)}}function g(e,t){let n=a.getPositions(t);for(let t=0;t<n.length;t++){let r=n[t][0],i=n[t][1];for(let t=-2;t<=2;t++)for(let n=-2;n<=2;n++)t===-2||t===2||n===-2||n===2||t===0&&n===0?e.set(r+t,i+n,!0,!0):e.set(r+t,i+n,!1,!0)}}function _(e,t){let n=e.size,r=u.getEncodedBits(t),i,a,o;for(let t=0;t<18;t++)i=Math.floor(t/3),a=t%3+n-8-3,o=(r>>t&1)==1,e.set(i,a,o,!0),e.set(a,i,o,!0)}function v(e,t,n){let r=e.size,i=d.getEncodedBits(t,n),a,o;for(a=0;a<15;a++)o=(i>>a&1)==1,a<6?e.set(a,8,o,!0):a<8?e.set(a+1,8,o,!0):e.set(r-15+a,8,o,!0),a<8?e.set(8,r-a-1,o,!0):a<9?e.set(8,15-a-1+1,o,!0):e.set(8,15-a-1,o,!0);e.set(r-8,8,1,!0)}function y(e,t){let n=e.size,r=-1,i=n-1,a=7,o=0;for(let s=n-1;s>0;s-=2)for(s===6&&s--;;){for(let n=0;n<2;n++)if(!e.isReserved(i,s-n)){let r=!1;o<t.length&&(r=(t[o]>>>a&1)==1),e.set(i,s-n,r),a--,a===-1&&(o++,a=7)}if(i+=r,i<0||n<=i){i-=r,r=-r;break}}}function b(e,n,i){let a=new r;i.forEach(function(t){a.put(t.mode.bit,4),a.put(t.getLength(),f.getCharCountIndicator(t.mode,e)),t.write(a)});let o=(t.getSymbolTotalCodewords(e)-c.getTotalCodewordsCount(e,n))*8;for(a.getLengthInBits()+4<=o&&a.put(0,4);a.getLengthInBits()%8!=0;)a.putBit(0);let s=(o-a.getLengthInBits())/8;for(let e=0;e<s;e++)a.put(e%2?17:236,8);return x(a,e,n)}function x(e,n,r){let i=t.getSymbolTotalCodewords(n),a=i-c.getTotalCodewordsCount(n,r),o=c.getBlocksCount(n,r),s=o-i%o,u=Math.floor(i/o),d=Math.floor(a/o),f=d+1,p=u-d,m=new l(p),h=0,g=Array(o),_=Array(o),v=0,y=new Uint8Array(e.buffer);for(let e=0;e<o;e++){let t=e<s?d:f;g[e]=y.slice(h,h+t),_[e]=m.encode(g[e]),h+=t,v=Math.max(v,t)}let b=new Uint8Array(i),x=0,S,C;for(S=0;S<v;S++)for(C=0;C<o;C++)S<g[C].length&&(b[x++]=g[C][S]);for(S=0;S<p;S++)for(C=0;C<o;C++)b[x++]=_[C][S];return b}function S(e,n,r,a){let o;if(Array.isArray(e))o=p.fromArray(e);else if(typeof e==`string`){let t=n;if(!t){let n=p.rawSplit(e);t=u.getBestVersionForData(n,r)}o=p.fromString(e,t||40)}else throw Error(`Invalid data`);let c=u.getBestVersionForData(o,r);if(!c)throw Error(`The amount of data is too big to be stored in a QR Code`);if(!n)n=c;else if(n<c)throw Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+c+`.
`);let l=b(n,r,o),d=new i(t.getSymbolSize(n));return m(d,n),h(d),g(d,n),v(d,r,0),n>=7&&_(d,n),y(d,l),isNaN(a)&&(a=s.getBestMask(d,v.bind(null,d,r))),s.applyMask(a,d),v(d,r,a),{modules:d,version:n,errorCorrectionLevel:r,maskPattern:a,segments:o}}e.create=function(e,r){if(e===void 0||e===``)throw Error(`No input text`);let i=n.M,a,o;return r!==void 0&&(i=n.from(r.errorCorrectionLevel,n.M),a=u.from(r.version),o=s.from(r.maskPattern),r.toSJISFunc&&t.setToSJISFunction(r.toSJISFunc)),S(e,a,i,o)}})),Ii=o((e=>{function t(e){if(typeof e==`number`&&(e=e.toString()),typeof e!=`string`)throw Error(`Color should be defined as hex string`);let t=e.slice().replace(`#`,``).split(``);if(t.length<3||t.length===5||t.length>8)throw Error(`Invalid hex color: `+e);(t.length===3||t.length===4)&&(t=Array.prototype.concat.apply([],t.map(function(e){return[e,e]}))),t.length===6&&t.push(`F`,`F`);let n=parseInt(t.join(``),16);return{r:n>>24&255,g:n>>16&255,b:n>>8&255,a:n&255,hex:`#`+t.slice(0,6).join(``)}}e.getOptions=function(e){e||={},e.color||(e.color={});let n=e.margin===void 0||e.margin===null||e.margin<0?4:e.margin,r=e.width&&e.width>=21?e.width:void 0,i=e.scale||4;return{width:r,scale:r?4:i,margin:n,color:{dark:t(e.color.dark||`#000000ff`),light:t(e.color.light||`#ffffffff`)},type:e.type,rendererOpts:e.rendererOpts||{}}},e.getScale=function(e,t){return t.width&&t.width>=e+t.margin*2?t.width/(e+t.margin*2):t.scale},e.getImageWidth=function(t,n){let r=e.getScale(t,n);return Math.floor((t+n.margin*2)*r)},e.qrToImageData=function(t,n,r){let i=n.modules.size,a=n.modules.data,o=e.getScale(i,r),s=Math.floor((i+r.margin*2)*o),c=r.margin*o,l=[r.color.light,r.color.dark];for(let e=0;e<s;e++)for(let n=0;n<s;n++){let u=(e*s+n)*4,d=r.color.light;if(e>=c&&n>=c&&e<s-c&&n<s-c){let t=Math.floor((e-c)/o),r=Math.floor((n-c)/o);d=l[+!!a[t*i+r]]}t[u++]=d.r,t[u++]=d.g,t[u++]=d.b,t[u]=d.a}}})),Li=o((e=>{var t=Ii();function n(e,t,n){e.clearRect(0,0,t.width,t.height),t.style||={},t.height=n,t.width=n,t.style.height=n+`px`,t.style.width=n+`px`}function r(){try{return document.createElement(`canvas`)}catch{throw Error(`You need to specify a canvas element`)}}e.render=function(e,i,a){let o=a,s=i;o===void 0&&(!i||!i.getContext)&&(o=i,i=void 0),i||(s=r()),o=t.getOptions(o);let c=t.getImageWidth(e.modules.size,o),l=s.getContext(`2d`),u=l.createImageData(c,c);return t.qrToImageData(u.data,e,o),n(l,s,c),l.putImageData(u,0,0),s},e.renderToDataURL=function(t,n,r){let i=r;i===void 0&&(!n||!n.getContext)&&(i=n,n=void 0),i||={};let a=e.render(t,n,i),o=i.type||`image/png`,s=i.rendererOpts||{};return a.toDataURL(o,s.quality)}})),Ri=o((e=>{var t=Ii();function n(e,t){let n=e.a/255,r=t+`="`+e.hex+`"`;return n<1?r+` `+t+`-opacity="`+n.toFixed(2).slice(1)+`"`:r}function r(e,t,n){let r=e+t;return n!==void 0&&(r+=` `+n),r}function i(e,t,n){let i=``,a=0,o=!1,s=0;for(let c=0;c<e.length;c++){let l=Math.floor(c%t),u=Math.floor(c/t);!l&&!o&&(o=!0),e[c]?(s++,c>0&&l>0&&e[c-1]||(i+=o?r(`M`,l+n,.5+u+n):r(`m`,a,0),a=0,o=!1),l+1<t&&e[c+1]||(i+=r(`h`,s),s=0)):a++}return i}e.render=function(e,r,a){let o=t.getOptions(r),s=e.modules.size,c=e.modules.data,l=s+o.margin*2,u=o.color.light.a?`<path `+n(o.color.light,`fill`)+` d="M0 0h`+l+`v`+l+`H0z"/>`:``,d=`<path `+n(o.color.dark,`stroke`)+` d="`+i(c,s,o.margin)+`"/>`,f=`viewBox="0 0 `+l+` `+l+`"`,p=`<svg xmlns="http://www.w3.org/2000/svg" `+(o.width?`width="`+o.width+`" height="`+o.width+`" `:``)+f+` shape-rendering="crispEdges">`+u+d+`</svg>
`;return typeof a==`function`&&a(null,p),p}})),zi=c(o((e=>{var t=mi(),n=Fi(),r=Li(),i=Ri();function a(e,r,i,a,o){let s=[].slice.call(arguments,1),c=s.length,l=typeof s[c-1]==`function`;if(!l&&!t())throw Error(`Callback required as last argument`);if(l){if(c<2)throw Error(`Too few arguments provided`);c===2?(o=i,i=r,r=a=void 0):c===3&&(r.getContext&&o===void 0?(o=a,a=void 0):(o=a,a=i,i=r,r=void 0))}else{if(c<1)throw Error(`Too few arguments provided`);return c===1?(i=r,r=a=void 0):c===2&&!r.getContext&&(a=i,i=r,r=void 0),new Promise(function(t,o){try{t(e(n.create(i,a),r,a))}catch(e){o(e)}})}try{let t=n.create(i,a);o(null,e(t,r,a))}catch(e){o(e)}}e.create=n.create,e.toCanvas=a.bind(null,r.render),e.toDataURL=a.bind(null,r.renderToDataURL),e.toString=a.bind(null,function(e,t,n){return i.render(e,n)})}))(),1),Bi=`SolanaMobileWalletAdapterDefaultAuthorizationCache`;function Vi(){let e;try{e=window.localStorage}catch{}return{async clear(){if(e)try{e.removeItem(Bi)}catch{}},async get(){if(e)try{let t=JSON.parse(e.getItem(Bi));if(t&&t.accounts){let e=t.accounts.map(e=>({...e,publicKey:`publicKey`in e?new Uint8Array(Object.values(e.publicKey)):be(e.address)}));return{...t,accounts:e}}return t||void 0}catch{}},async set(t){if(e)try{e.setItem(Bi,JSON.stringify(t))}catch{}}}}function Hi(){return{async select(e){return e.length===1?e[0]:e.includes(`solana:mainnet`)?Ce:e[0]}}}var Ui=`
<div class="mobile-wallet-adapter-embedded-modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div data-modal-close style="position: absolute; width: 100%; height: 100%;"></div>
	<div class="mobile-wallet-adapter-embedded-modal-card">
		<div>
			<button data-modal-close class="mobile-wallet-adapter-embedded-modal-close">
				<svg width="14" height="14">
					<path d="M 6.7125,8.3036995 1.9082,13.108199 c -0.2113,0.2112 -0.4765,0.3168 -0.7957,0.3168 -0.3192,0 -0.5844,-0.1056 -0.7958,-0.3168 C 0.1056,12.896899 0,12.631699 0,12.312499 c 0,-0.3192 0.1056,-0.5844 0.3167,-0.7958 L 5.1212,6.7124995 0.3167,1.9082 C 0.1056,1.6969 0,1.4317 0,1.1125 0,0.7933 0.1056,0.5281 0.3167,0.3167 0.5281,0.1056 0.7933,0 1.1125,0 1.4317,0 1.6969,0.1056 1.9082,0.3167 L 6.7125,5.1212 11.5167,0.3167 C 11.7281,0.1056 11.9933,0 12.3125,0 c 0.3192,0 0.5844,0.1056 0.7957,0.3167 0.2112,0.2114 0.3168,0.4766 0.3168,0.7958 0,0.3192 -0.1056,0.5844 -0.3168,0.7957 L 8.3037001,6.7124995 13.1082,11.516699 c 0.2112,0.2114 0.3168,0.4766 0.3168,0.7958 0,0.3192 -0.1056,0.5844 -0.3168,0.7957 -0.2113,0.2112 -0.4765,0.3168 -0.7957,0.3168 -0.3192,0 -0.5844,-0.1056 -0.7958,-0.3168 z" />
				</svg>
			</button>
		</div>
		<div class="mobile-wallet-adapter-embedded-modal-content"></div>
	</div>
</div>
`,Wi=`
.mobile-wallet-adapter-embedded-modal-container {
    display: flex; /* Use flexbox to center content */
    justify-content: center; /* Center horizontally */
    align-items: center; /* Center vertically */
    position: fixed; /* Stay in place */
    z-index: 2147483647; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
    overflow-y: auto; /* enable scrolling */
}

.mobile-wallet-adapter-embedded-modal-card {
    display: flex;
    flex-direction: column;
    margin: auto 20px;
    max-width: 780px;
    padding: 20px;
    border-radius: 24px;
    background: #ffffff;
    font-family: "Inter Tight", "PT Sans", Calibri, sans-serif;
    transform: translateY(-200%);
    animation: slide-in 0.5s forwards;
}

@keyframes slide-in {
    100% { transform: translateY(0%); }
}

.mobile-wallet-adapter-embedded-modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    cursor: pointer;
    background: #e4e9e9;
    border: none;
    border-radius: 50%;
}

.mobile-wallet-adapter-embedded-modal-close:focus-visible {
    outline-color: red;
}

.mobile-wallet-adapter-embedded-modal-close svg {
    fill: #546266;
    transition: fill 200ms ease 0s;
}

.mobile-wallet-adapter-embedded-modal-close:hover svg {
    fill: #fff;
}
`,Gi=`
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
`,Ki=class{#e=null;#t={};#n=!1;dom=null;constructor(){this.init=this.init.bind(this),this.#e=document.getElementById(`mobile-wallet-adapter-embedded-root-ui`)}async init(){console.log(`Injecting modal`),this.#r()}open=()=>{console.debug(`Modal open`),this.#i(),this.#e&&(this.#e.style.display=`flex`)};close=(e=void 0)=>{console.debug(`Modal close`),this.#a(),this.#e&&(this.#e.style.display=`none`),this.#t.close?.forEach(t=>t(e))};addEventListener(e,t){return this.#t[e]?.push(t)||(this.#t[e]=[t]),()=>this.removeEventListener(e,t)}removeEventListener(e,t){this.#t[e]=this.#t[e]?.filter(e=>t!==e)}#r(){if(document.getElementById(`mobile-wallet-adapter-embedded-root-ui`)){this.#e||=document.getElementById(`mobile-wallet-adapter-embedded-root-ui`);return}this.#e=document.createElement(`div`),this.#e.id=`mobile-wallet-adapter-embedded-root-ui`,this.#e.innerHTML=Ui,this.#e.style.display=`none`;let e=this.#e.querySelector(`.mobile-wallet-adapter-embedded-modal-content`);e&&(e.innerHTML=this.contentHtml);let t=document.createElement(`style`);t.id=`mobile-wallet-adapter-embedded-modal-styles`,t.textContent=Wi+this.contentStyles;let n=document.createElement(`div`);n.innerHTML=Gi,this.dom=n.attachShadow({mode:`closed`}),this.dom.appendChild(t),this.dom.appendChild(this.#e),document.body.appendChild(n)}#i(){!this.#e||this.#n||([...this.#e.querySelectorAll(`[data-modal-close]`)].forEach(e=>e?.addEventListener(`click`,this.close)),window.addEventListener(`load`,this.close),document.addEventListener(`keydown`,this.#o),this.#n=!0)}#a(){this.#n&&(window.removeEventListener(`load`,this.close),document.removeEventListener(`keydown`,this.#o),this.#e&&([...this.#e.querySelectorAll(`[data-modal-close]`)].forEach(e=>e?.removeEventListener(`click`,this.close)),this.#n=!1))}#o=e=>{e.key===`Escape`&&this.close(e)}},qi=`To use mobile wallet adapter, you must have a compatible mobile wallet application installed on your device.`,Ji=`This browser appears to be incompatible with mobile wallet adapter. Open this page in a compatible mobile browser app and try again.`,Yi=class extends Ki{contentStyles=Zi;contentHtml=Xi;initWithError(e){super.init(),this.populateError(e)}populateError(e){let t=this.dom?.getElementById(`mobile-wallet-adapter-error-message`),n=this.dom?.getElementById(`mobile-wallet-adapter-error-action`);if(t){if(e.name===`SolanaMobileWalletAdapterError`)switch(e.code){case`ERROR_WALLET_NOT_FOUND`:t.innerHTML=qi,n&&n.addEventListener(`click`,()=>{window.location.href=`https://solanamobile.com/wallets`});return;case`ERROR_BROWSER_NOT_SUPPORTED`:t.innerHTML=Ji,n&&(n.style.display=`none`);return}t.innerHTML=`An unexpected error occurred: ${e.message}`}else console.log(`Failed to locate error dialog element`)}},Xi=`
<svg class="mobile-wallet-adapter-embedded-modal-error-icon" xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" fill="#000000"><path d="M 280,-80 Q 197,-80 138.5,-138.5 80,-197 80,-280 80,-363 138.5,-421.5 197,-480 280,-480 q 83,0 141.5,58.5 58.5,58.5 58.5,141.5 0,83 -58.5,141.5 Q 363,-80 280,-80 Z M 824,-120 568,-376 Q 556,-389 542.5,-402.5 529,-416 516,-428 q 38,-24 61,-64 23,-40 23,-88 0,-75 -52.5,-127.5 Q 495,-760 420,-760 345,-760 292.5,-707.5 240,-655 240,-580 q 0,6 0.5,11.5 0.5,5.5 1.5,11.5 -18,2 -39.5,8 -21.5,6 -38.5,14 -2,-11 -3,-22 -1,-11 -1,-23 0,-109 75.5,-184.5 Q 311,-840 420,-840 q 109,0 184.5,75.5 75.5,75.5 75.5,184.5 0,43 -13.5,81.5 Q 653,-460 629,-428 l 251,252 z m -615,-61 71,-71 70,71 29,-28 -71,-71 71,-71 -28,-28 -71,71 -71,-71 -28,28 71,71 -71,71 z"/></svg>
<div class="mobile-wallet-adapter-embedded-modal-title">We can't find a wallet.</div>
<div id="mobile-wallet-adapter-error-message" class="mobile-wallet-adapter-embedded-modal-subtitle"></div>
<div>
    <button data-error-action id="mobile-wallet-adapter-error-action" class="mobile-wallet-adapter-embedded-modal-error-action">
        Find a wallet
    </button>
</div>
`,Zi=`
.mobile-wallet-adapter-embedded-modal-content {
    text-align: center;
}

.mobile-wallet-adapter-embedded-modal-error-icon {
    margin-top: 24px;
}

.mobile-wallet-adapter-embedded-modal-title {
    margin: 18px 100px auto 100px;
    color: #000000;
    font-size: 2.75em;
    font-weight: 600;
}

.mobile-wallet-adapter-embedded-modal-subtitle {
    margin: 30px 60px 40px 60px;
    color: #000000;
    font-size: 1.25em;
    font-weight: 400;
}

.mobile-wallet-adapter-embedded-modal-error-action {
    display: block;
    width: 100%;
    height: 56px;
    /*margin-top: 40px;*/
    font-size: 1.25em;
    /*line-height: 24px;*/
    /*letter-spacing: -1%;*/
    background: #000000;
    color: #FFFFFF;
    border-radius: 18px;
}

/* Smaller screens */
@media all and (max-width: 600px) {
    .mobile-wallet-adapter-embedded-modal-title {
        font-size: 1.5em;
        margin-right: 12px;
        margin-left: 12px;
    }
    .mobile-wallet-adapter-embedded-modal-subtitle {
        margin-right: 12px;
        margin-left: 12px;
    }
}
`;async function Qi(){if(typeof window<`u`){let e=window.navigator.userAgent.toLowerCase(),t=new Yi;e.includes(`wv`)?t.initWithError({name:`SolanaMobileWalletAdapterError`,code:`ERROR_BROWSER_NOT_SUPPORTED`,message:``}):t.initWithError({name:`SolanaMobileWalletAdapterError`,code:`ERROR_WALLET_NOT_FOUND`,message:``}),t.open()}}function $i(){return async()=>{Qi()}}var ea=class extends Ki{contentStyles=na;contentHtml=ta;initWithCallback(e){super.init(),this.#e(e)}#e(e){let t=this.dom?.getElementById(`mobile-wallet-adapter-launch-action`),n=async()=>{t?.removeEventListener(`click`,n),this.close(),e()};t?.addEventListener(`click`,n)}},ta=`
<svg class="mobile-wallet-adapter-embedded-modal-launch-icon" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.6 48C7.2 48 0 40.8 0 26.4V21.6C0 7.2 7.2 0 21.6 0H26.4C40.8 0 48 7.2 48 21.6V26.4C48 40.8 40.8 48 26.4 48H21.6Z" fill="#15994E"/>
    <mask id="mask0_189_522" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="8" y="8" width="32" height="32">
        <rect x="8" y="8" width="32" height="32" fill="#D9D9D9"/>
    </mask>
    <g mask="url(#mask0_189_522)">
        <mask id="mask1_189_522" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="8" y="8" width="32" height="32">
            <rect x="8" y="8" width="32" height="32" fill="#D9D9D9"/>
        </mask>
        <g mask="url(#mask1_189_522)">
            <path d="M22.1092 26.1208L19.4498 23.4615C19.1736 23.1851 18.8253 23.0468 18.4048 23.0468C17.9846 23.0468 17.6363 23.1851 17.3598 23.4615C17.0836 23.7377 16.9468 24.0861 16.9495 24.5065C16.9522 24.9267 17.0916 25.275 17.3678 25.5512L21.0405 29.2238C21.3463 29.5276 21.7031 29.6795 22.1108 29.6795C22.5184 29.6795 22.8742 29.5276 23.1782 29.2238L30.5918 21.8098C30.8683 21.5336 31.0065 21.1867 31.0065 20.7692C31.0065 20.3514 30.8683 20.0044 30.5918 19.7282C30.3156 19.4517 29.9673 19.3135 29.5468 19.3135C29.1266 19.3135 28.7784 19.4517 28.5022 19.7282L22.1092 26.1208ZM23.9998 37.6042C22.113 37.6042 20.3425 37.2473 18.6885 36.5335C17.0343 35.8197 15.5954 34.8512 14.3718 33.6278C13.1485 32.4043 12.18 30.9654 11.4662 29.3112C10.7524 27.6572 10.3955 25.8867 10.3955 23.9998C10.3955 22.113 10.7524 20.3425 11.4662 18.6885C12.18 17.0343 13.1485 15.5954 14.3718 14.3718C15.5954 13.1485 17.0343 12.18 18.6885 11.4662C20.3425 10.7524 22.113 10.3955 23.9998 10.3955C25.8867 10.3955 27.6572 10.7524 29.3112 11.4662C30.9654 12.18 32.4043 13.1485 33.6278 14.3718C34.8512 15.5954 35.8197 17.0343 36.5335 18.6885C37.2473 20.3425 37.6042 22.113 37.6042 23.9998C37.6042 25.8867 37.2473 27.6572 36.5335 29.3112C35.8197 30.9654 34.8512 32.4043 33.6278 33.6278C32.4043 34.8512 30.9654 35.8197 29.3112 36.5335C27.6572 37.2473 25.8867 37.6042 23.9998 37.6042Z" fill="white"/>
        </g>
    </g>
</svg>
<div class="mobile-wallet-adapter-embedded-modal-title">Ready to connect!</div>
<div>
    <button data-modal-action id="mobile-wallet-adapter-launch-action" class="mobile-wallet-adapter-embedded-modal-launch-action">
        Connect Wallet
    </button>
</div>
`,na=`
.mobile-wallet-adapter-embedded-modal-close {
    display: none;
}
.mobile-wallet-adapter-embedded-modal-content {
    text-align: center;
    min-width: 300px;
}
.mobile-wallet-adapter-embedded-modal-launch-icon {
    margin-top: 24px;
}
.mobile-wallet-adapter-embedded-modal-title {
    margin: 18px 100px 30px 100px;
    color: #000000;
    font-size: 2.75em;
    font-weight: 600;
}
.mobile-wallet-adapter-embedded-modal-launch-action {
    display: block;
    width: 100%;
    height: 56px;
    font-size: 1.25em;
    background: #000000;
    color: #FFFFFF;
    border-radius: 18px;
}
/* Smaller screens */
@media all and (max-width: 600px) {
    .mobile-wallet-adapter-embedded-modal-title {
        font-size: 1.5em;
        margin-right: 12px;
        margin-left: 12px;
    }
}
`,ra=class extends Ki{contentStyles=aa;get contentHtml(){let e=pa()?`Long press the app icon on your home screen to open site settings`:`Tap the lock or settings icon in the address bar to open site settings`;return ia.replace(`{{PERMISSION_INSTRUCTION_DETAIL}}`,e)}async init(){super.init(),this.#e()}#e(){let e=this.dom?.getElementById(`mobile-wallet-adapter-launch-action`),t=async n=>{e?.removeEventListener(`click`,t),this.close(n)};e?.addEventListener(`click`,t)}},ia=`
<div class="mobile-wallet-adapter-embedded-modal-header">
    Local Wallet Connection
</div>
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.6 48C7.2 48 0 40.8 0 26.4V21.6C0 7.2 7.2 0 21.6 0H26.4C40.8 0 48 7.2 48 21.6V26.4C48 40.8 40.8 48 26.4 48H21.6Z" fill="#ED1515"/>
    <mask id="mask0_147_1364" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="8" y="8" width="32" height="32">
        <rect x="8" y="8" width="32" height="32" fill="#D9D9D9"/>
    </mask>
    <g mask="url(#mask0_147_1364)">
        <path d="M20.1398 36.2705C19.7363 36.2705 19.3508 36.1945 18.9835 36.0425C18.6162 35.8907 18.2916 35.674 18.0098 35.3922L12.6072 29.9895C12.3254 29.7077 12.1086 29.3832 11.9568 29.0158C11.8048 28.6485 11.7288 28.2631 11.7288 27.8595V20.1395C11.7288 19.736 11.8048 19.3505 11.9568 18.9832C12.1086 18.6158 12.3254 18.2913 12.6072 18.0095L18.0098 12.6068C18.2916 12.3251 18.6162 12.1083 18.9835 11.9565C19.3508 11.8045 19.7363 11.7285 20.1398 11.7285H27.8598C28.2634 11.7285 28.6488 11.8045 29.0162 11.9565C29.3835 12.1083 29.708 12.3251 29.9898 12.6068L35.3925 18.0095C35.6743 18.2913 35.891 18.6158 36.0428 18.9832C36.1948 19.3505 36.2708 19.736 36.2708 20.1395V27.8595C36.2708 28.2631 36.1948 28.6485 36.0428 29.0158C35.891 29.3832 35.6743 29.7077 35.3925 29.9895L29.9898 35.3922C29.708 35.674 29.3835 35.8907 29.0162 36.0425C28.6488 36.1945 28.2634 36.2705 27.8598 36.2705H20.1398ZM20.1732 33.2372H27.8265L33.2375 27.8262V20.1728L27.8265 14.7618H20.1732L14.7622 20.1728V27.8262L20.1732 33.2372ZM23.9998 25.9538L26.7868 28.7408C27.0473 29.0013 27.3729 29.1302 27.7638 29.1275C28.1549 29.1248 28.4807 28.9933 28.7412 28.7328C29.0016 28.4724 29.1318 28.1466 29.1318 27.7555C29.1318 27.3646 29.0016 27.039 28.7412 26.7785L25.9542 23.9995L28.7412 21.2125C29.0016 20.9521 29.1318 20.6264 29.1318 20.2355C29.1318 19.8444 29.0016 19.5186 28.7412 19.2582C28.4807 18.9977 28.1549 18.8675 27.7638 18.8675C27.3729 18.8675 27.0473 18.9977 26.7868 19.2582L23.9998 22.0452L21.2128 19.2582C20.9524 18.9977 20.628 18.8675 20.2398 18.8675C19.8514 18.8675 19.5269 18.9977 19.2665 19.2582C19.006 19.5186 18.8758 19.8444 18.8758 20.2355C18.8758 20.6264 19.006 20.9521 19.2665 21.2125L22.0455 23.9995L19.2585 26.7865C18.998 27.047 18.8692 27.3713 18.8718 27.7595C18.8745 28.148 19.006 28.4724 19.2665 28.7328C19.5269 28.9933 19.8527 29.1235 20.2438 29.1235C20.6347 29.1235 20.9604 28.9933 21.2208 28.7328L23.9998 25.9538Z" fill="black"/>
    </g>
</svg>
<div class="mobile-wallet-adapter-embedded-modal-title">
    Your wallet connection is blocked
</div>
<div id="mobile-wallet-adapter-local-launch-message" class="mobile-wallet-adapter-embedded-modal-subtitle">
    Visit site settings in the address bar and allow "Apps on Device".
</div>

<div class="mobile-wallet-adapter-embedded-modal-divider"><hr></div>
<div class="mobile-wallet-adapter-embedded-modal-footer">
    <div class="mobile-wallet-adapter-embedded-modal-details">
        <!-- Clickable header (label associated with the checkbox) -->
      	<label for="collapsible-1" class="mobile-wallet-adapter-embedded-modal-details-collapsible-header">
            <!-- Hidden checkbox to track state -->
            <input type="checkbox" id="collapsible-1" class="mobile-wallet-adapter-embedded-modal-details-collapsible-input">
            <span class="mobile-wallet-adapter-embedded-modal-details-collapsible-header-label">
              See details
            </span>
            <svg class="mobile-wallet-adapter-embedded-modal-details-collapsible-header-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="mask0_147_1382" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                <rect width="24" height="24" fill="#D9D9D9"/>
              </mask>
              <g mask="url(#mask0_147_1382)">
                <path d="M11.9999 17.0811C11.8506 17.0811 11.7087 17.0563 11.5741 17.0067C11.4395 16.957 11.3162 16.8762 11.2042 16.7643L6.57924 12.1393C6.36801 11.9281 6.26656 11.667 6.27489 11.3561C6.28322 11.0453 6.39301 10.7842 6.60424 10.573C6.81547 10.3618 7.08069 10.2561 7.39989 10.2561C7.71909 10.2561 7.9843 10.3618 8.19554 10.573L11.9999 14.3773L15.8292 10.548C16.0405 10.3368 16.3015 10.2353 16.6124 10.2436C16.9233 10.252 17.1843 10.3618 17.3955 10.573C17.6068 10.7842 17.7124 11.0494 17.7124 11.3686C17.7124 11.6878 17.6068 11.9531 17.3955 12.1643L12.7955 16.7643C12.6836 16.8762 12.5603 16.957 12.4257 17.0067C12.2911 17.0563 12.1492 17.0811 11.9999 17.0811Z" fill="black"/>
              </g>
            </svg>
      	</label>
        
        <!-- Content to show/hide -->
        <ul class="mobile-wallet-adapter-embedded-modal-details-collapsible-content">
            <li>{{PERMISSION_INSTRUCTION_DETAIL}}</li>
            <li>Allow "Apps on Device"</li>
        </ul>
    </div>
</div>
<div>
    <button data-modal-action id="mobile-wallet-adapter-launch-action" class="mobile-wallet-adapter-embedded-modal-launch-action">
        Got it
    </button>
</div>
`,aa=`
.mobile-wallet-adapter-embedded-modal-close {
    display: none;
}
.mobile-wallet-adapter-embedded-modal-content {
    text-align: center;
}
.mobile-wallet-adapter-embedded-modal-header {
    margin: 18px auto 30px auto;
    color: #7D9093;
    font-size: 1.0em;
    font-weight: 500;
}
.mobile-wallet-adapter-embedded-modal-title {
    margin: 18px 100px auto 100px;
    color: #000000;
    font-size: 2.75em;
    font-weight: 600;
}
.mobile-wallet-adapter-embedded-modal-subtitle {
    margin: 12px 60px 30px 60px;
    color: #7D9093;
    font-size: 1.25em;
    font-weight: 400;
}
.mobile-wallet-adapter-embedded-modal-details-collapsible-header {
    display: flex;
    flex-direction: row;
  	justify-content: space-between;
    margin: 10px auto 10px auto;
    color: #000000;
    font-size: 1.5em;
    font-weight: 600;
    cursor: pointer; /* Show pointer on hover */
    transition: background 0.2s ease; /* Smooth background change */
}
.mobile-wallet-adapter-embedded-modal-details-collapsible-header-icon {
  	transition: rotate 0.3s ease;
}
.mobile-wallet-adapter-embedded-modal-details-collapsible-input {
  	display: none; /* Hide the checkbox */
}
.mobile-wallet-adapter-embedded-modal-details-collapsible-content {
    margin: 0px auto 40px auto;
    max-height: 0px; /* Collapse content */
    overflow: hidden; /* Hide overflow when collapsed */
    transition: max-height 0.3s ease; /* Smooth transition */
}
.mobile-wallet-adapter-embedded-modal-details-collapsible-content li {
    margin: 20px auto;
    color: #000000;
    font-size: 1.25em;
    font-weight: 400;
    text-align: left;
}
/* When checkbox is checked, show content */
.mobile-wallet-adapter-embedded-modal-details-collapsible-header:has(> input:checked) ~ .mobile-wallet-adapter-embedded-modal-details-collapsible-content {
  	max-height: 300px;
}
.mobile-wallet-adapter-embedded-modal-details-collapsible-header:has(> input:checked) > .mobile-wallet-adapter-embedded-modal-details-collapsible-header-icon {
  	rotate: 180deg;
}
.mobile-wallet-adapter-embedded-modal-launch-action {
    display: block;
    width: 100%;
    height: 56px;
    /*margin-top: 40px;*/
    font-size: 1.25em;
    /*line-height: 24px;*/
    /*letter-spacing: -1%;*/
    background: #000000;
    color: #FFFFFF;
    border-radius: 18px;
}
/* Smaller screens */
@media all and (max-width: 600px) {
    .mobile-wallet-adapter-embedded-modal-title {
        font-size: 1.75em;
        margin-right: 12px;
        margin-left: 12px;
    }
    .mobile-wallet-adapter-embedded-modal-subtitle {
        margin-right: 12px;
        margin-left: 12px;
    }
}
`,oa=class extends Ki{contentStyles=ca;contentHtml=sa;async init(){super.init(),this.#e()}#e(){let e=this.dom?.getElementById(`mobile-wallet-adapter-launch-action`),t=async()=>{e?.removeEventListener(`click`,t);try{await fetch(`http://localhost`)}catch{}this.close()};e?.addEventListener(`click`,t)}},sa=`
<div class="mobile-wallet-adapter-embedded-modal-title">Allow connections to your wallet</div>
<div id="mobile-wallet-adapter-local-launch-message" class="mobile-wallet-adapter-embedded-modal-subtitle">
    Tap "Allow" on the next screen
</div>
<svg class="mobile-wallet-adapter-embedded-modal-permission-prompt-mock" xmlns="http://www.w3.org/2000/svg" width="281" height="83" viewBox="0 0 281 83" fill="none">
    <rect width="281" height="83" rx="22" fill="#F0F3F5"/>
    <path d="M254.194 64L252.626 56.657H254.047L254.866 61.452L254.985 62.278H255.02L255.146 61.452L255.993 57.497H257.4L258.254 61.431L258.373 62.278H258.415L258.534 61.431L259.346 56.657H260.718L259.143 64H257.673L256.826 59.961L256.693 59.093H256.651L256.511 59.961L255.664 64H254.194Z" fill="black"/>
    <path d="M248.837 64.231C248.147 64.231 247.54 64.07 247.017 63.748C246.495 63.426 246.086 62.978 245.792 62.404C245.498 61.83 245.351 61.1673 245.351 60.416V60.241C245.351 59.4897 245.498 58.827 245.792 58.253C246.086 57.679 246.495 57.2333 247.017 56.916C247.54 56.594 248.147 56.433 248.837 56.433C249.528 56.433 250.135 56.594 250.657 56.916C251.18 57.2333 251.588 57.679 251.882 58.253C252.176 58.827 252.323 59.4897 252.323 60.241V60.416C252.323 61.1673 252.176 61.83 251.882 62.404C251.588 62.978 251.18 63.426 250.657 63.748C250.135 64.07 249.528 64.231 248.837 64.231ZM248.837 62.824C249.43 62.824 249.897 62.607 250.237 62.173C250.583 61.7343 250.755 61.1417 250.755 60.395V60.262C250.755 59.5107 250.583 58.918 250.237 58.484C249.897 58.05 249.43 57.833 248.837 57.833C248.249 57.833 247.783 58.05 247.437 58.484C247.092 58.918 246.919 59.5107 246.919 60.262V60.395C246.919 61.1417 247.092 61.7343 247.437 62.173C247.783 62.607 248.249 62.824 248.837 62.824Z" fill="black"/>
    <path d="M242.298 64.231C241.467 64.231 240.814 63.993 240.338 63.517C239.866 63.0364 239.631 62.3737 239.631 61.529V53.78H241.178V61.389C241.178 62.3317 241.591 62.803 242.417 62.803C242.65 62.803 242.865 62.7587 243.061 62.67C243.257 62.5814 243.464 62.4367 243.684 62.236L244.538 63.377C244.225 63.6664 243.884 63.881 243.516 64.021C243.152 64.161 242.746 64.231 242.298 64.231ZM237.51 55.061V53.78H240.611V55.061H237.51Z" fill="black"/>
    <path d="M234.463 64.231C233.633 64.231 232.979 63.993 232.503 63.517C232.032 63.0364 231.796 62.3737 231.796 61.529V53.78H233.343V61.389C233.343 62.3317 233.756 62.803 234.582 62.803C234.816 62.803 235.03 62.7587 235.226 62.67C235.422 62.5814 235.63 62.4367 235.849 62.236L236.703 63.377C236.391 63.6664 236.05 63.881 235.681 64.021C235.317 64.161 234.911 64.231 234.463 64.231ZM229.675 55.061V53.78H232.776V55.061H229.675Z" fill="black"/>
    <path d="M221.442 64L224.557 53.976H226.132L229.233 64H227.581L225.642 56.972L225.341 55.761H225.299L225.005 56.972L223.073 64H221.442ZM222.835 61.634L223.255 60.29H227.371L227.805 61.634H222.835Z" fill="black"/>
    <path d="M178.261 64L175.034 60.066V60.024L178.121 56.657H180.011L176.504 60.423V59.632L180.165 64H178.261ZM173.543 64V53.78H175.097V64H173.543Z" fill="#7D9093" fill-opacity="0.5"/>
    <path d="M169.306 64.224C168.588 64.224 167.958 64.0653 167.416 63.748C166.88 63.426 166.462 62.9803 166.163 62.411C165.865 61.837 165.715 61.1673 165.715 60.402V60.248C165.715 59.4873 165.862 58.8223 166.156 58.253C166.45 57.679 166.863 57.2333 167.395 56.916C167.927 56.594 168.546 56.433 169.25 56.433C169.978 56.433 170.59 56.6056 171.084 56.951C171.579 57.2917 171.955 57.777 172.211 58.407L170.874 58.995C170.72 58.6123 170.508 58.323 170.237 58.127C169.967 57.9263 169.633 57.826 169.236 57.826C168.63 57.826 168.149 58.0383 167.794 58.463C167.444 58.883 167.269 59.4616 167.269 60.199V60.465C167.269 61.1837 167.454 61.7577 167.822 62.187C168.196 62.6163 168.69 62.831 169.306 62.831C169.712 62.831 170.06 62.733 170.349 62.537C170.639 62.341 170.877 62.0423 171.063 61.641L172.379 62.285C172.188 62.6957 171.941 63.0457 171.637 63.335C171.334 63.6243 170.986 63.846 170.594 64C170.202 64.1493 169.773 64.224 169.306 64.224Z" fill="#7D9093" fill-opacity="0.5"/>
    <path d="M161.003 64.231C160.312 64.231 159.706 64.07 159.183 63.748C158.66 63.426 158.252 62.978 157.958 62.404C157.664 61.83 157.517 61.1673 157.517 60.416V60.241C157.517 59.4897 157.664 58.827 157.958 58.253C158.252 57.679 158.66 57.2333 159.183 56.916C159.706 56.594 160.312 56.433 161.003 56.433C161.694 56.433 162.3 56.594 162.823 56.916C163.346 57.2333 163.754 57.679 164.048 58.253C164.342 58.827 164.489 59.4897 164.489 60.241V60.416C164.489 61.1673 164.342 61.83 164.048 62.404C163.754 62.978 163.346 63.426 162.823 63.748C162.3 64.07 161.694 64.231 161.003 64.231ZM161.003 62.824C161.596 62.824 162.062 62.607 162.403 62.173C162.748 61.7343 162.921 61.1417 162.921 60.395V60.262C162.921 59.5107 162.748 58.918 162.403 58.484C162.062 58.05 161.596 57.833 161.003 57.833C160.415 57.833 159.948 58.05 159.603 58.484C159.258 58.918 159.085 59.5107 159.085 60.262V60.395C159.085 61.1417 159.258 61.7343 159.603 62.173C159.948 62.607 160.415 62.824 161.003 62.824Z" fill="#7D9093" fill-opacity="0.5"/>
    <path d="M154.463 64.231C153.633 64.231 152.979 63.993 152.503 63.517C152.032 63.0364 151.796 62.3737 151.796 61.529V53.78H153.343V61.389C153.343 62.3317 153.756 62.803 154.582 62.803C154.816 62.803 155.03 62.7587 155.226 62.67C155.422 62.5814 155.63 62.4367 155.849 62.236L156.703 63.377C156.391 63.6664 156.05 63.881 155.681 64.021C155.317 64.161 154.911 64.231 154.463 64.231ZM149.675 55.061V53.78H152.776V55.061H149.675Z" fill="#7D9093" fill-opacity="0.5"/>
    <path d="M142.24 64V53.976H145.544C146.421 53.976 147.112 54.1953 147.616 54.634C148.12 55.0726 148.372 55.6583 148.372 56.391V56.566C148.372 57.0886 148.246 57.5366 147.994 57.91C147.742 58.2833 147.38 58.5586 146.909 58.736V58.792C147.492 58.9226 147.947 59.2003 148.274 59.625C148.605 60.045 148.771 60.5606 148.771 61.172V61.361C148.771 61.893 148.645 62.3573 148.393 62.754C148.145 63.1506 147.795 63.4586 147.343 63.678C146.895 63.8926 146.365 64 145.754 64H142.24ZM143.794 62.656H145.572C146.085 62.656 146.482 62.5253 146.762 62.264C147.042 62.0026 147.182 61.6293 147.182 61.144V60.99C147.182 60.5046 147.037 60.1313 146.748 59.87C146.463 59.604 146.05 59.471 145.509 59.471H143.36V58.183H145.32C145.791 58.183 146.153 58.064 146.405 57.826C146.657 57.588 146.783 57.2496 146.783 56.811V56.685C146.783 56.2416 146.657 55.9033 146.405 55.67C146.157 55.4366 145.796 55.32 145.32 55.32H143.794V62.656Z" fill="#7D9093" fill-opacity="0.5"/>
    <rect x="18" y="17" width="246" height="7" rx="3.5" fill="#7D9093" fill-opacity="0.26"/>
    <rect x="18" y="33" width="82" height="7" rx="3.5" fill="#7D9093" fill-opacity="0.26"/>
</svg>
<div>
    <button data-modal-action id="mobile-wallet-adapter-launch-action" class="mobile-wallet-adapter-embedded-modal-launch-action">
        Continue to Allow
    </button>
</div>
`,ca=`
.mobile-wallet-adapter-embedded-modal-close {
    display: none;
}
.mobile-wallet-adapter-embedded-modal-content {
    text-align: center;
}
.mobile-wallet-adapter-embedded-modal-title {
    margin: 18px 100px auto 100px;
    color: #000000;
    font-size: 2.75em;
    font-weight: 600;
}
.mobile-wallet-adapter-embedded-modal-subtitle {
    margin: 20px 60px 40px 60px;
    color: #7D9093;
    font-size: 1.25em;
    font-weight: 400;
}
.mobile-wallet-adapter-embedded-modal-permission-prompt-mock {
    width: 90%;
    height: auto;
    margin: 0 auto 30px auto;
    display: block;
}
.mobile-wallet-adapter-embedded-modal-launch-action {
    display: block;
    width: 100%;
    height: 56px;
    font-size: 1.25em;
    background: #000000;
    color: #FFFFFF;
    border-radius: 18px;
}
/* Smaller screens */
@media all and (max-width: 600px) {
    .mobile-wallet-adapter-embedded-modal-title {
        font-size: 1.5em;
        margin-right: 12px;
        margin-left: 12px;
    }
    .mobile-wallet-adapter-embedded-modal-subtitle {
        margin-right: 12px;
        margin-left: 12px;
    }
}
`;function la(){return typeof window<`u`&&window.isSecureContext&&typeof document<`u`&&/android/i.test(navigator.userAgent)}function ua(){return typeof window<`u`&&window.isSecureContext&&typeof document<`u`&&!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}function da(e){return/(WebView|Version\/.+(Chrome)\/(\d+)\.(\d+)\.(\d+)\.(\d+)|; wv\).+(Chrome)\/(\d+)\.(\d+)\.(\d+)\.(\d+))/i.test(e)}function fa(e){return e.includes(`Solana Mobile Web Shell`)}function pa(){let e=typeof document<`u`&&document.referrer.startsWith(`android-app://`);if(typeof window>`u`)return e;let t=window.matchMedia(`(display-mode: standalone)`).matches,n=window.matchMedia(`(display-mode: fullscreen)`).matches,r=window.matchMedia(`(display-mode: minimal-ui)`).matches;return e||t||n||r}function ma(e){return e===`localhost`||e.endsWith(`.localhost`)||e===`[::1]`||/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(e)}function ha(){return typeof window<`u`&&!!window.location&&ma(window.location.hostname)}async function ga(){if(typeof navigator<`u`&&fa(navigator.userAgent)||ha())return!0;try{return(await navigator.permissions.query({name:`loopback-network`})).state===`granted`}catch(e){return!!(e instanceof TypeError&&(e.message.includes(`loopback-network`)||e.message.includes(`local-network-access`)))}}async function _a(){if(!(typeof navigator<`u`&&fa(navigator.userAgent))&&!ha())try{let e=await navigator.permissions.query({name:`loopback-network`});if(e.state===`granted`)return;if(e.state===`denied`){let e=new ra;throw e.init(),e.open(),new X(Y.ERROR_LOOPBACK_ACCESS_BLOCKED,`Local Network Access permission denied`)}if(e.state===`prompt`){let t=new oa;if(await new Promise((n,r)=>{t.addEventListener(`close`,e=>{e&&r(new X(Y.ERROR_ASSOCIATION_CANCELLED,`Wallet connection cancelled by user`,{event:e}))}),e.onchange=()=>{e.onchange=null,n(e.state)},t.init(),t.open()})===`granted`){let e=new ea;await new Promise((t,n)=>{e.addEventListener(`close`,e=>{e&&n(new X(Y.ERROR_ASSOCIATION_CANCELLED,`Wallet connection cancelled by user`,{event:e}))}),e.initWithCallback(async()=>{t(!0)}),e.open()});return}return await _a()}throw new X(Y.ERROR_LOOPBACK_ACCESS_BLOCKED,`Local Network Access permission unknown`)}catch(e){if(e instanceof TypeError&&(e.message.includes(`loopback-network`)||e.message.includes(`local-network-access`)))return;throw e instanceof X?e:new X(Y.ERROR_LOOPBACK_ACCESS_BLOCKED,e instanceof Error?e.message:`Local Network Access permission unknown`)}}var va=`
<div class="mobile-wallet-adapter-embedded-loading-indicator" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div data-modal-close style="position: absolute; width: 100%; height: 100%;"></div>
    <div class="mobile-wallet-adapter-embedded-loading-container">
        <div class="mobile-wallet-adapter-embedded-loading-animation"></div>
    </div>
</div>
`,ya=`
.mobile-wallet-adapter-embedded-loading-indicator {
    display: flex; /* Use flexbox to center content */
    justify-content: center; /* Center horizontally */
    align-items: start; /* Center vertically */
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
    overflow-y: auto; /* enable scrolling */
}

.mobile-wallet-adapter-embedded-loading-container {
    display: flex;
    margin: auto;
}

.mobile-wallet-adapter-embedded-loading-animation {
    position: relative;
    left: -9999px;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: var(--spinner-color);
    color: var(--spinner-color);
    box-shadow: 9984px 0 0 0 var(--spinner-color), 
                9999px 0 0 0 var(--spinner-color), 
                10014px 0 0 0 var(--spinner-color);
    animation: dot-typing 1.5s infinite linear;
}

@keyframes dot-typing {
    0% {
        box-shadow: 9984px 0 0 0 var(--spinner-color), 
                    9999px 0 0 0 var(--spinner-color), 
                    10014px 0 0 0 var(--spinner-color);
    }
    16.667% {
        box-shadow: 9984px -10px 0 0 var(--spinner-color), 
                    9999px 0 0 0 var(--spinner-color), 
                    10014px 0 0 0 var(--spinner-color);
    }
    33.333% {
        box-shadow: 9984px 0 0 0 var(--spinner-color), 
                    9999px 0 0 0 var(--spinner-color), 
                    10014px 0 0 0 var(--spinner-color);
    }
    50% {
        box-shadow: 9984px 0 0 0 var(--spinner-color), 
                    9999px -10px 0 0 var(--spinner-color), 
                    10014px 0 0 0 var(--spinner-color);
    }
    66.667% {
        box-shadow: 9984px 0 0 0 var(--spinner-color), 
                    9999px 0 0 0 var(--spinner-color), 
                    10014px 0 0 0 var(--spinner-color);
    }
    83.333% {
        box-shadow: 9984px 0 0 0 var(--spinner-color), 
                    9999px 0 0 0 var(--spinner-color), 
                    10014px -10px 0 0 var(--spinner-color);
    }
    100% {
        box-shadow: 9984px 0 0 0 var(--spinner-color), 
                    9999px 0 0 0 var(--spinner-color), 
                    10014px 0 0 0 var(--spinner-color);
    }
}
`,ba=class{#e=null;#t={};#n=!1;dom=null;constructor(){this.init=this.init.bind(this),this.#e=document.getElementById(`mobile-wallet-adapter-embedded-root-ui`)}async init(){console.log(`Injecting modal`),this.#r()}open=()=>{console.debug(`Modal open`),this.#i(),this.#e&&(this.#e.style.display=`flex`)};close=(e=void 0)=>{console.debug(`Modal close`),this.#a(),this.#e&&(this.#e.style.display=`none`),this.#t.close?.forEach(t=>t(e))};addEventListener(e,t){return this.#t[e]?.push(t)||(this.#t[e]=[t]),()=>this.removeEventListener(e,t)}removeEventListener(e,t){this.#t[e]=this.#t[e]?.filter(e=>t!==e)}#r(){if(this.dom)return;this.#e=document.createElement(`div`),this.#e.id=`mobile-wallet-adapter-embedded-root-ui`,this.#e.innerHTML=va,this.#e.style.display=`none`;let e=document.createElement(`style`);e.id=`mobile-wallet-adapter-embedded-modal-styles`,e.textContent=ya;let t=document.createElement(`div`);this.dom=t.attachShadow({mode:`closed`}),t.style.setProperty(`--spinner-color`,`#FFFFFF`),this.dom.appendChild(e),this.dom.appendChild(this.#e),document.body.appendChild(t)}#i(){!this.#e||this.#n||([...this.#e.querySelectorAll(`[data-modal-close]`)].forEach(e=>e?.addEventListener(`click`,e=>{this.close(e)})),window.addEventListener(`load`,this.close),document.addEventListener(`keydown`,this.#o),this.#n=!0)}#a(){this.#n&&(window.removeEventListener(`load`,this.close),document.removeEventListener(`keydown`,this.#o),this.#e&&([...this.#e.querySelectorAll(`[data-modal-close]`)].forEach(e=>e?.removeEventListener(`click`,this.close)),this.#n=!1))}#o=e=>{e.key===`Escape`&&this.close(e)}},xa=class extends Ki{contentStyles=Ca;contentHtml=Sa;async initWithQR(e){super.init(),this.populateQRCode(e)}async populateQRCode(e){let t=this.dom?.getElementById(`mobile-wallet-adapter-embedded-modal-qr-code-container`);if(t){let n=await zi.toCanvas(e,{width:200,margin:0});t.firstElementChild===null?t.appendChild(n):t.replaceChild(n,t.firstElementChild);let r=this.dom?.getElementById(`mobile-wallet-adapter-embedded-modal-qr-placeholder`);r&&(r.style.display=`none`)}else console.error(`QRCode Container not found`)}},Sa=`
<div class="mobile-wallet-adapter-embedded-modal-qr-content">
    <div>
        <svg class="mobile-wallet-adapter-embedded-modal-icon" width="100%" height="100%">
            <circle r="52" cx="53" cy="53" fill="#99b3be" stroke="#000000" stroke-width="2"/>
            <path d="m 53,82.7305 c -3.3116,0 -6.1361,-1.169 -8.4735,-3.507 -2.338,-2.338 -3.507,-5.1625 -3.507,-8.4735 0,-3.3116 1.169,-6.1364 3.507,-8.4744 2.3374,-2.338 5.1619,-3.507 8.4735,-3.507 3.3116,0 6.1361,1.169 8.4735,3.507 2.338,2.338 3.507,5.1628 3.507,8.4744 0,3.311 -1.169,6.1355 -3.507,8.4735 -2.3374,2.338 -5.1619,3.507 -8.4735,3.507 z m 0.007,-5.25 c 1.8532,0 3.437,-0.6598 4.7512,-1.9793 1.3149,-1.3195 1.9723,-2.9058 1.9723,-4.7591 0,-1.8526 -0.6598,-3.4364 -1.9793,-4.7512 -1.3195,-1.3149 -2.9055,-1.9723 -4.7582,-1.9723 -1.8533,0 -3.437,0.6598 -4.7513,1.9793 -1.3148,1.3195 -1.9722,2.9058 -1.9722,4.7591 0,1.8527 0.6597,3.4364 1.9792,4.7512 1.3195,1.3149 2.9056,1.9723 4.7583,1.9723 z m -28,-33.5729 -3.85,-3.6347 c 4.1195,-4.025 8.8792,-7.1984 14.2791,-9.52 5.4005,-2.3223 11.2551,-3.4834 17.5639,-3.4834 6.3087,0 12.1634,1.1611 17.5639,3.4834 5.3999,2.3216 10.1596,5.495 14.2791,9.52 l -3.85,3.6347 C 77.2999,40.358 73.0684,37.5726 68.2985,35.5514 63.5292,33.5301 58.4296,32.5195 53,32.5195 c -5.4297,0 -10.5292,1.0106 -15.2985,3.0319 -4.7699,2.0212 -9.0014,4.8066 -12.6945,8.3562 z m 44.625,10.8771 c -2.2709,-2.1046 -4.7962,-3.7167 -7.5758,-4.8361 -2.7795,-1.12 -5.7983,-1.68 -9.0562,-1.68 -3.2579,0 -6.2621,0.56 -9.0125,1.68 -2.7504,1.1194 -5.2903,2.7315 -7.6195,4.8361 L 32.5189,51.15 c 2.8355,-2.6028 5.9777,-4.6086 9.4263,-6.0174 3.4481,-1.4087 7.133,-2.1131 11.0548,-2.1131 3.9217,0 7.5979,0.7044 11.0285,2.1131 3.43,1.4088 6.5631,3.4146 9.3992,6.0174 z"/>
        </svg>
        <div class="mobile-wallet-adapter-embedded-modal-title">Remote Mobile Wallet Adapter</div>
    </div>
    <div>
        <div>
            <h4 class="mobile-wallet-adapter-embedded-modal-qr-label">
                Open your wallet and scan this code
            </h4>
        </div>
        <div id="mobile-wallet-adapter-embedded-modal-qr-code-container" class="mobile-wallet-adapter-embedded-modal-qr-code-container">
            <div id="mobile-wallet-adapter-embedded-modal-qr-placeholder" class="mobile-wallet-adapter-embedded-modal-qr-placeholder"></div>
        </div>
    </div>
</div>
<div class="mobile-wallet-adapter-embedded-modal-divider"><hr></div>
<div class="mobile-wallet-adapter-embedded-modal-footer">
    <div class="mobile-wallet-adapter-embedded-modal-subtitle">
        Follow the instructions on your device. When you're finished, this screen will update.
    </div>
    <div class="mobile-wallet-adapter-embedded-modal-progress-badge">
        <div>
            <div class="spinner">
                <div class="leftWrapper">
                    <div class="left">
                        <div class="circle"></div>
                    </div>
                </div>
                <div class="rightWrapper">
                    <div class="right">
                        <div class="circle"></div>
                    </div>
                </div>
            </div>
        </div>
        <div>Waiting for scan</div>
    </div>
</div>
`,Ca=`
.mobile-wallet-adapter-embedded-modal-qr-content {
    display: flex; 
    margin-top: 10px;
    padding: 10px;
}

.mobile-wallet-adapter-embedded-modal-qr-content > div:first-child {
    display: flex;
    flex-direction: column;
    flex: 2;
    margin-top: auto;
    margin-right: 30px;
}

.mobile-wallet-adapter-embedded-modal-qr-content > div:nth-child(2) {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-left: auto;
}

.mobile-wallet-adapter-embedded-modal-footer {
    display: flex;
    padding: 10px;
}

.mobile-wallet-adapter-embedded-modal-icon {}

.mobile-wallet-adapter-embedded-modal-title {
    color: #000000;
    font-size: 2.5em;
    font-weight: 600;
}

.mobile-wallet-adapter-embedded-modal-qr-label {
    text-align: right;
    color: #000000;
}

.mobile-wallet-adapter-embedded-modal-qr-code-container {
    margin-left: auto;
}

.mobile-wallet-adapter-embedded-modal-qr-placeholder {
    margin-left: auto;
    min-width: 200px;
    min-height: 200px;
    background: linear-gradient(-60deg, #F7F8F8 30%, #ECEEEE 50%, #F7F8F8 70%);
    background-size: 200%;
    animation: placeholderAnimate 2.7s linear infinite;
    border-radius: 12px;
}

.mobile-wallet-adapter-embedded-modal-divider {
    margin-top: 20px;
    padding-left: 10px;
    padding-right: 10px;
}

.mobile-wallet-adapter-embedded-modal-divider hr {
    border-top: 1px solid #D9DEDE;
}

.mobile-wallet-adapter-embedded-modal-subtitle {
    margin: auto;
    margin-right: 60px;
    padding: 20px;
    color: #6E8286;
}

.mobile-wallet-adapter-embedded-modal-progress-badge {
    display: flex;
    background: #F7F8F8;
    height: 56px;
    min-width: 200px;
    margin: auto;
    padding-left: 20px;
    padding-right: 20px;
    border-radius: 18px;
    color: #A8B6B8;
    align-items: center;
}

.mobile-wallet-adapter-embedded-modal-progress-badge > div:first-child {
    margin-left: auto;
    margin-right: 20px;
}

.mobile-wallet-adapter-embedded-modal-progress-badge > div:nth-child(2) {
    margin-right: auto;
}

/* Smaller screens */
@media all and (max-width: 600px) {
    .mobile-wallet-adapter-embedded-modal-card {
        text-align: center;
    }
    .mobile-wallet-adapter-embedded-modal-qr-content {
        flex-direction: column;
    }
    .mobile-wallet-adapter-embedded-modal-qr-content > div:first-child {
        margin: auto;
    }
    .mobile-wallet-adapter-embedded-modal-qr-content > div:nth-child(2) {
        margin: auto;
        flex: 2 auto;
    }
    .mobile-wallet-adapter-embedded-modal-footer {
        flex-direction: column;
    }
    .mobile-wallet-adapter-embedded-modal-icon {
        display: none;
    }
    .mobile-wallet-adapter-embedded-modal-title {
        font-size: 1.5em;
    }
    .mobile-wallet-adapter-embedded-modal-subtitle {
        margin-right: unset;
    }
    .mobile-wallet-adapter-embedded-modal-qr-label {
        text-align: center;
    }
    .mobile-wallet-adapter-embedded-modal-qr-code-container {
        margin: auto;
    }
    .mobile-wallet-adapter-embedded-modal-qr-placeholder {
        margin: auto;
    }
}

/* QR Placeholder */
@keyframes placeholderAnimate {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* Spinner */
@keyframes spinLeft {
    0% {
        transform: rotate(20deg);
    }
    50% {
        transform: rotate(160deg);
    }
    100% {
        transform: rotate(20deg);
    }
}
@keyframes spinRight {
    0% {
        transform: rotate(160deg);
    }
    50% {
        transform: rotate(20deg);
    }
    100% {
        transform: rotate(160deg);
    }
}
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(2520deg);
    }
}

.spinner {
    position: relative;
    width: 1.5em;
    height: 1.5em;
    margin: auto;
    animation: spin 10s linear infinite;
}
.spinner::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
.right, .rightWrapper, .left, .leftWrapper {
    position: absolute;
    top: 0;
    overflow: hidden;
    width: .75em;
    height: 1.5em;
}
.left, .leftWrapper {
    left: 0;
}
.right {
    left: -12px;
}
.rightWrapper {
    right: 0;
}
.circle {
    border: .125em solid #A8B6B8;
    width: 1.25em; /* 1.5em - 2*0.125em border */
    height: 1.25em; /* 1.5em - 2*0.125em border */
    border-radius: 0.75em; /* 0.5*1.5em spinner size 8 */
}
.left {
    transform-origin: 100% 50%;
    animation: spinLeft 2.5s cubic-bezier(.2,0,.8,1) infinite;
}
.right {
    transform-origin: 100% 50%;
    animation: spinRight 2.5s cubic-bezier(.2,0,.8,1) infinite;
}
`,wa=`data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik03IDIuNUgxN0MxNy44Mjg0IDIuNSAxOC41IDMuMTcxNTcgMTguNSA0VjIwQzE4LjUgMjAuODI4NCAxNy44Mjg0IDIxLjUgMTcgMjEuNUg3QzYuMTcxNTcgMjEuNSA1LjUgMjAuODI4NCA1LjUgMjBWNEM1LjUgMy4xNzE1NyA2LjE3MTU3IDIuNSA3IDIuNVpNMyA0QzMgMS43OTA4NiA0Ljc5MDg2IDAgNyAwSDE3QzE5LjIwOTEgMCAyMSAxLjc5MDg2IDIxIDRWMjBDMjEgMjIuMjA5MSAxOS4yMDkxIDI0IDE3IDI0SDdDNC43OTA4NiAyNCAzIDIyLjIwOTEgMyAyMFY0Wk0xMSA0LjYxNTM4QzEwLjQ0NzcgNC42MTUzOCAxMCA1LjA2MzEgMTAgNS42MTUzOFY2LjM4NDYyQzEwIDYuOTM2OSAxMC40NDc3IDcuMzg0NjIgMTEgNy4zODQ2MkgxM0MxMy41NTIzIDcuMzg0NjIgMTQgNi45MzY5IDE0IDYuMzg0NjJWNS42MTUzOEMxNCA1LjA2MzEgMTMuNTUyMyA0LjYxNTM4IDEzIDQuNjE1MzhIMTFaIiBmaWxsPSIjRENCOEZGIi8+Cjwvc3ZnPgo=`,Ta=`Mobile Wallet Adapter`,Ea=`Remote Mobile Wallet Adapter`,Da=[si,ui,li,ci],Oa=3e4;function ka(e,t){return e?.length===t?.length&&(e??[]).every((e,n)=>e===t?.[n])}function Aa(e){if(`solana:signAndSendTransaction`in e)return e[si].supportedTransactionVersions;if(`solana:signTransaction`in e)return e[ui].supportedTransactionVersions}function $(e){return e instanceof Error?e.message:`Unknown error`}var ja=class{#e={};#t=`1.0.0`;#n=Ta;#r=`https://solanamobile.com/wallets`;#i=wa;#a;#o;#s;#c=!1;#l=0;#u=[];#d;#f;#p;#m;get version(){return this.#t}get name(){return this.#n}get url(){return this.#r}get icon(){return this.#i}get chains(){return this.#u}get features(){return{[di]:{version:`1.0.0`,connect:this.#v},[fi]:{version:`1.0.0`,disconnect:this.#C},[pi]:{version:`1.0.0`,on:this.#h},[li]:{version:`1.0.0`,signMessage:this.#j},[ci]:{version:`1.0.0`,signIn:this.#M},...this.#f}}get accounts(){return this.#o?.accounts??[]}constructor({appIdentity:e,authorizationCache:t=Vi(),chains:n,chainSelector:r=Hi(),onWalletNotFound:i=$i(),nostrRelay:a}){this.#s=t,this.#a=e,this.#u=n,this.#d=r,this.#p=i,this.#m=a,this.#f={[si]:{version:`1.0.0`,supportedTransactionVersions:[`legacy`,0],signAndSendTransaction:this.#k},[ui]:{version:`1.0.0`,supportedTransactionVersions:[`legacy`,0],signTransaction:this.#A}}}get connected(){return!!this.#o}get isAuthorized(){return!!this.#o}get currentAuthorization(){return this.#o}get cachedAuthorizationResult(){return this.#s.get()}#h=(e,t)=>(this.#e[e]?.push(t)||(this.#e[e]=[t]),()=>this.#_(e,t));#g(e,...t){this.#e[e]?.forEach(e=>e.apply(null,t))}#_(e,t){this.#e[e]=this.#e[e]?.filter(e=>t!==e)}#v=async({silent:e}={})=>{if(this.#c||this.connected)return{accounts:this.accounts};this.#c=!0;try{if(e){let e=await this.#s.get();if(e)await this.#x(e.capabilities),await this.#b(e);else return{accounts:this.accounts}}else await this.#y()}catch(e){throw Error($(e),{cause:e})}finally{this.#c=!1}return{accounts:this.accounts}};#y=async e=>{try{let t=await this.#s.get();if(t)return this.#b(t),t;let n=await this.#d.select(this.#u);return await this.#w(async t=>{let[r,i]=await Promise.all([t.getCapabilities(),t.authorize({chain:n,identity:this.#a,sign_in_payload:e})]),a=this.#E(i.accounts),o={...i,accounts:a,chain:n,capabilities:r};return Promise.all([this.#x(r),this.#s.set(o),this.#b(o)]),o})}catch(e){throw Error($(e),{cause:e})}};#b=async e=>{let t=this.#o==null||this.#o?.accounts.length!==e.accounts.length||this.#o.accounts.some((t,n)=>t.address!==e.accounts[n].address);this.#o=e,t&&this.#g(`change`,{accounts:this.accounts})};#x=async e=>{let t=e.features.includes(`solana:signTransactions`),n=e.supports_sign_and_send_transactions,r=`solana:signAndSendTransaction`in this.features!==n||`solana:signTransaction`in this.features!==t||!ka(Aa(this.#f),e.supported_transaction_versions);this.#f={...(n||!n&&!t)&&{"solana:signAndSendTransaction":{version:`1.0.0`,supportedTransactionVersions:e.supported_transaction_versions,signAndSendTransaction:this.#k}},...t&&{"solana:signTransaction":{version:`1.0.0`,supportedTransactionVersions:e.supported_transaction_versions,signTransaction:this.#A}}},r&&this.#g(`change`,{features:this.features})};#S=async(e,t,n)=>{try{let[r,i]=await Promise.all([this.#o?.capabilities??await e.getCapabilities(),e.authorize({auth_token:t,identity:this.#a,chain:n})]),a=this.#E(i.accounts),o={...i,accounts:a,chain:n,capabilities:r};Promise.all([this.#s.set(o),this.#b(o)])}catch(e){throw this.#C(),Error($(e),{cause:e})}};#C=async()=>{this.#s.clear(),this.#c=!1,this.#l++,this.#o=void 0,this.#g(`change`,{accounts:this.accounts})};#w=async e=>{let t=this.#o?.wallet_uri_base,n=t?{baseUri:t}:void 0,r=this.#l,i=new ba;try{let t=!0,r,a=await ga(),o=await Promise.race([(async()=>{!a&&!this.#m&&await _a()})().then(async()=>{i.init();let{wallet:r,close:o}=!a&&this.#m?await oi({...n,connectionType:`local`,relayDomain:this.#m}):await ii(n);t=!1,i.addEventListener(`close`,e=>{e&&o()}),i.open();let s=await e(await r);return i.close(),o(),s}),new Promise((e,n)=>{r=setTimeout(()=>{t&&n(new X(Y.ERROR_ASSOCIATION_CANCELLED,`Wallet connection timed out`,{event:void 0}))},Oa)})]);return clearTimeout(r),o}catch(e){throw i.close(),this.#l!==r&&await new Promise(()=>{}),e instanceof Error&&e.name===`SolanaMobileWalletAdapterError`&&e.code===`ERROR_WALLET_NOT_FOUND`&&await this.#p(this),e}};#T=()=>{if(!this.#o)throw Error(`Wallet not connected`);return{authToken:this.#o.auth_token,chain:this.#o.chain}};#E=e=>e.map(e=>{let t=M(e.address);return{address:ye(t),publicKey:t,label:e.label,icon:e.icon,chains:e.chains??this.#u,features:e.features??Da}});#D=async e=>{let{authToken:t,chain:n}=this.#T();try{let r=e.map(e=>j(e));return await this.#w(async e=>(await this.#S(e,t,n),(await e.signTransactions({payloads:r})).signed_payloads.map(M)))}catch(e){throw Error($(e),{cause:e})}};#O=async(e,t)=>{let{authToken:n,chain:r}=this.#T();try{return await this.#w(async i=>{let[a]=await Promise.all([i.getCapabilities(),this.#S(i,n,r)]);if(a.supports_sign_and_send_transactions){let n=j(e);return(await i.signAndSendTransactions({...t,payloads:[n]})).signatures.map(M)[0]}throw Error(`connected wallet does not support signAndSendTransaction`)})}catch(e){throw Error($(e),{cause:e})}};#k=async(...e)=>{let t=[];for(let n of e){let e=await this.#O(n.transaction,n.options);t.push({signature:e})}return t};#A=async(...e)=>(await this.#D(e.map(({transaction:e})=>e))).map(e=>({signedTransaction:e}));#j=async(...e)=>{let{authToken:t,chain:n}=this.#T(),r=e.map(({account:e})=>j(new Uint8Array(e.publicKey))),i=e.map(({message:e})=>j(e));try{return await this.#w(async e=>(await this.#S(e,t,n),(await e.signMessages({addresses:r,payloads:i})).signed_payloads.map(M).map(e=>({signedMessage:e,signature:e.slice(-64)}))))}catch(e){throw Error($(e),{cause:e})}};#M=async(...e)=>{let t=[];if(e.length>1)for(let n of e)t.push(await this.#N(n));else return[await this.#N(e[0])];return t};#N=async e=>{this.#c=!0;try{let t=await this.#y({...e,domain:e?.domain??window.location.host});if(!t.sign_in_result)throw Error(`Sign in failed, no sign in result returned by wallet`);let n=t.sign_in_result.address,r=t.accounts.find(e=>e.address==n);return{account:{...r??{address:ye(M(n))},publicKey:M(n),chains:r?.chains??this.#u,features:r?.features??t.capabilities.features},signedMessage:M(t.sign_in_result.signed_message),signature:M(t.sign_in_result.signature)}}catch(e){throw Error($(e),{cause:e})}finally{this.#c=!1}}},Ma=class{#e={};#t=`1.0.0`;#n=Ea;#r=`https://solanamobile.com/wallets`;#i=wa;#a;#o;#s;#c=!1;#l=0;#u=[];#d;#f;#p;#m;#h;get version(){return this.#t}get name(){return this.#n}get url(){return this.#r}get icon(){return this.#i}get chains(){return this.#u}get features(){return{[di]:{version:`1.0.0`,connect:this.#y},[fi]:{version:`1.0.0`,disconnect:this.#w},[pi]:{version:`1.0.0`,on:this.#g},[li]:{version:`1.0.0`,signMessage:this.#M},[ci]:{version:`1.0.0`,signIn:this.#N},...this.#f}}get accounts(){return this.#o?.accounts??[]}constructor(e){let{appIdentity:t,authorizationCache:n=Vi(),chains:r,chainSelector:i=Hi(),onWalletNotFound:a=$i()}=e;this.#s=n,this.#a=t,this.#u=r,this.#d=i,this.#m=`remoteHostAuthority`in e?{kind:`reflector`,domain:e.remoteHostAuthority}:{kind:`nostr`,domain:e.nostrRelay},this.#p=a,this.#f={[si]:{version:`1.0.0`,supportedTransactionVersions:[`legacy`,0],signAndSendTransaction:this.#A},[ui]:{version:`1.0.0`,supportedTransactionVersions:[`legacy`,0],signTransaction:this.#j}}}get connected(){return!!this.#h&&!!this.#o}get isAuthorized(){return!!this.#o}get currentAuthorization(){return this.#o}get cachedAuthorizationResult(){return this.#s.get()}#g=(e,t)=>(this.#e[e]?.push(t)||(this.#e[e]=[t]),()=>this.#v(e,t));#_(e,...t){this.#e[e]?.forEach(e=>e.apply(null,t))}#v(e,t){this.#e[e]=this.#e[e]?.filter(e=>t!==e)}#y=async(e={})=>{if(this.#c||this.connected)return{accounts:this.accounts};this.#c=!0;try{await this.#b()}catch(e){throw Error($(e),{cause:e})}finally{this.#c=!1}return{accounts:this.accounts}};#b=async e=>{try{let t=await this.#s.get();if(t)return this.#x(t),t;this.#h&&=void 0;let n=await this.#d.select(this.#u);return await this.#T(async t=>{let[r,i]=await Promise.all([t.getCapabilities(),t.authorize({chain:n,identity:this.#a,sign_in_payload:e})]),a=this.#D(i.accounts),o={...i,accounts:a,chain:n,capabilities:r};return Promise.all([this.#S(r),this.#s.set(o),this.#x(o)]),o})}catch(e){throw Error($(e),{cause:e})}};#x=async e=>{let t=this.#o==null||this.#o?.accounts.length!==e.accounts.length||this.#o.accounts.some((t,n)=>t.address!==e.accounts[n].address);this.#o=e,t&&this.#_(`change`,{accounts:this.accounts})};#S=async e=>{let t=e.features.includes(`solana:signTransactions`),n=e.supports_sign_and_send_transactions||e.features.includes(`solana:signAndSendTransaction`),r=`solana:signAndSendTransaction`in this.features!==n||`solana:signTransaction`in this.features!==t||!ka(Aa(this.#f),e.supported_transaction_versions);this.#f={...n&&{"solana:signAndSendTransaction":{version:`1.0.0`,supportedTransactionVersions:e.supported_transaction_versions,signAndSendTransaction:this.#A}},...t&&{"solana:signTransaction":{version:`1.0.0`,supportedTransactionVersions:e.supported_transaction_versions,signTransaction:this.#j}}},r&&this.#_(`change`,{features:this.features})};#C=async(e,t,n)=>{try{let[r,i]=await Promise.all([this.#o?.capabilities??await e.getCapabilities(),e.authorize({auth_token:t,identity:this.#a,chain:n})]),a=this.#D(i.accounts),o={...i,accounts:a,chain:n,capabilities:r};Promise.all([this.#s.set(o),this.#x(o)])}catch(e){throw this.#w(),Error($(e),{cause:e})}};#w=async()=>{this.#h?.close(),this.#s.clear(),this.#c=!1,this.#l++,this.#o=void 0,this.#h=void 0,this.#_(`change`,{accounts:this.accounts})};#T=async e=>{let t=this.#o?.wallet_uri_base,n=t?{baseUri:t}:void 0,r=this.#l,i=new xa;if(this.#h)return e(this.#h.wallet);try{i.init(),i.open();let{associationUrl:t,close:r,wallet:a}=this.#m.kind==`reflector`?await ai({...n,remoteHostAuthority:this.#m.domain}):await oi({...n,connectionType:`remote`,relayDomain:this.#m.domain}),o=i.addEventListener(`close`,e=>{e&&r()});return i.populateQRCode(t.toString()),this.#h={close:r,wallet:await a},o(),i.close(),await e(this.#h.wallet)}catch(e){throw i.close(),this.#l!==r&&await new Promise(()=>{}),e instanceof Error&&e.name===`SolanaMobileWalletAdapterError`&&e.code===`ERROR_WALLET_NOT_FOUND`&&await this.#p(this),e}};#E=()=>{if(!this.#o)throw Error(`Wallet not connected`);return{authToken:this.#o.auth_token,chain:this.#o.chain}};#D=e=>e.map(e=>{let t=M(e.address);return{address:ye(t),publicKey:t,label:e.label,icon:e.icon,chains:e.chains??this.#u,features:e.features??Da}});#O=async e=>{let{authToken:t,chain:n}=this.#E();try{return await this.#T(async r=>(await this.#C(r,t,n),(await r.signTransactions({payloads:e.map(j)})).signed_payloads.map(M)))}catch(e){throw Error($(e),{cause:e})}};#k=async(e,t)=>{let{authToken:n,chain:r}=this.#E();try{return await this.#T(async i=>{let[a]=await Promise.all([i.getCapabilities(),this.#C(i,n,r)]);if(a.supports_sign_and_send_transactions)return(await i.signAndSendTransactions({...t,payloads:[j(e)]})).signatures.map(M)[0];throw Error(`connected wallet does not support signAndSendTransaction`)})}catch(e){throw Error($(e),{cause:e})}};#A=async(...e)=>{let t=[];for(let n of e){let e=await this.#k(n.transaction,n.options);t.push({signature:e})}return t};#j=async(...e)=>(await this.#O(e.map(({transaction:e})=>e))).map(e=>({signedTransaction:e}));#M=async(...e)=>{let{authToken:t,chain:n}=this.#E(),r=e.map(({account:e})=>j(new Uint8Array(e.publicKey))),i=e.map(({message:e})=>j(e));try{return await this.#T(async e=>(await this.#C(e,t,n),(await e.signMessages({addresses:r,payloads:i})).signed_payloads.map(M).map(e=>({signedMessage:e,signature:e.slice(-64)}))))}catch(e){throw Error($(e),{cause:e})}};#N=async(...e)=>{let t=[];if(e.length>1)for(let n of e)t.push(await this.#P(n));else return[await this.#P(e[0])];return t};#P=async e=>{this.#c=!0;try{let t=await this.#b({...e,domain:e?.domain??window.location.host});if(!t.sign_in_result)throw Error(`Sign in failed, no sign in result returned by wallet`);let n=t.sign_in_result.address,r=t.accounts.find(e=>e.address==n);return{account:{...r??{address:ye(M(n))},publicKey:M(n),chains:r?.chains??this.#u,features:r?.features??t.capabilities.features},signedMessage:M(t.sign_in_result.signed_message),signature:M(t.sign_in_result.signature)}}catch(e){throw Error($(e),{cause:e})}finally{this.#c=!1}}};function Na(e){if(typeof window>`u`){console.warn(`MWA not registered: no window object`);return}if(!window.isSecureContext){console.warn(`MWA not registered: secure context required (https)`);return}let t=navigator.userAgent;la()&&(!da(t)||fa(t))?De(new ja(e)):ua()&&(`nostrRelay`in e||e.remoteHostAuthority!==void 0)?`nostrRelay`in e?De(new Ma({...e,nostrRelay:e.nostrRelay})):De(new Ma({...e,remoteHostAuthority:e.remoteHostAuthority})):console.warn(`MWA not registered: device or environment not supported`)}export{ja as LocalSolanaMobileWalletAdapterWallet,Ma as RemoteSolanaMobileWalletAdapterWallet,Ea as SolanaMobileWalletAdapterRemoteWalletName,Ta as SolanaMobileWalletAdapterWalletName,Vi as createDefaultAuthorizationCache,Hi as createDefaultChainSelector,$i as createDefaultWalletNotFoundHandler,Qi as defaultErrorModalWalletNotFoundHandler,Na as registerMwa};