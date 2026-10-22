(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={M10_menu_loop:105.01,M11_breakfast_loop:105,M12_lunch_loop:110.04,M13_snack_loop:126.01,M14_dinner_loop:128.01,M17_mart_loop:104.04,B01_mediterranean:110,B02_polish_pantry:120,B03_street_food:100,B04_breakfast:104,B06_christmas:110,B07_halloween:120,B08_spring_easter:108,B09_summer_beach:110},t=[261.63,293.66,329.63,392,440,523.25,587.33,659.25,783.99,880,1046.5],n=new class{ctx=null;master;musicBus;sfxBus;lowpass;shelf;streamDest=null;manifest=null;manifestP=null;buffers=new Map;loopPoints=new Map;music=null;oneShotMusic=null;muted=!1;lastPick=new Map;habit=`neutral`;async unlock(){if(!this.ctx){let e=window.AudioContext||window.webkitAudioContext;if(!e)return;this.ctx=new e,this.master=this.ctx.createGain(),this.master.gain.value=+!this.muted,this.master.connect(this.ctx.destination);try{this.streamDest=this.ctx.createMediaStreamDestination(),this.master.connect(this.streamDest)}catch{this.streamDest=null}this.lowpass=this.ctx.createBiquadFilter(),this.lowpass.type=`lowpass`,this.lowpass.frequency.value=2e4,this.shelf=this.ctx.createBiquadFilter(),this.shelf.type=`highshelf`,this.shelf.frequency.value=3500,this.shelf.gain.value=0,this.musicBus=this.ctx.createGain(),this.musicBus.gain.value=.9,this.musicBus.connect(this.lowpass).connect(this.shelf).connect(this.master),this.sfxBus=this.ctx.createGain(),this.sfxBus.connect(this.master)}if(this.ctx.state!==`running`)try{await this.ctx.resume()}catch{}this.loadManifest()}get running(){return!!this.ctx&&this.ctx.state===`running`}suspend(){this.ctx?.suspend()}setMuted(e){this.muted=e,this.ctx&&this.master.gain.setTargetAtTime(+!e,this.ctx.currentTime,.05)}loadManifest(){return this.manifestP??=fetch(`audio/manifest.json`).then(e=>e.json()).then(e=>this.manifest=e).catch(()=>this.manifest={sounds:{}}),this.manifestP}has(e){return!!this.manifest?.sounds[e]}load(e){let t=this.buffers.get(e);return t||(t=(async()=>{let t=(await this.loadManifest()).sounds[e];if(!t||!this.ctx)return null;try{let n=await(await fetch(t.url)).arrayBuffer(),r=await this.ctx.decodeAudioData(n);return t.loop&&this.loopPoints.set(e,this.alignLoop(r,t)),r}catch{return null}})(),this.buffers.set(e,t)),t}preload(e){return Promise.all(e.map(e=>this.load(e)))}alignLoop(e,t){let n=t.loop.lengthSamples/t.sampleRate,r=e.sampleRate/t.sampleRate,i=Math.round(t.loop.lengthSamples*r),a=e.length-i;if(a<=2)return[0,Math.min(n,e.duration)];let o=atob(t.loop.signature1024),s=new Int16Array(o.length/2);for(let e=0;e<s.length;e++)s[e]=(o.charCodeAt(e*2)|o.charCodeAt(e*2+1)<<8)<<16>>16;let c=Math.floor(s.length*r),l=new Float32Array(c);for(let e=0;e<c;e++){let t=e/r,n=Math.floor(t),i=t-n;l[e]=((s[n]??0)*(1-i)+(s[n+1]??0)*i)/32768}let u=e.getChannelData(0),d=e.numberOfChannels>1?e.getChannelData(1):u,f=0,p=-1/0,m=Math.min(a,8192);for(let e=0;e<=m;e++){let t=0,n=0;for(let r=0;r<c;r+=2){let i=(u[e+r]+d[e+r])*.5;t+=i*l[r],n+=i*i}let r=t/Math.sqrt(n+1e-9);r>p&&(p=r,f=e)}let h=f/e.sampleRate;return[h,h+n]}async playMusic(e,t=.8){if(!this.ctx||this.music?.id===e)return;let n=await this.load(e);if(!n||!this.ctx||this.music?.id===e)return;this.stopMusic(t);let r=this.ctx.createBufferSource();r.buffer=n;let i=this.loopPoints.get(e);i&&(r.loop=!0,r.loopStart=i[0],r.loopEnd=i[1]),r.playbackRate.value=this.habit===`junk`?.965:1;let a=this.ctx.createGain();a.gain.setValueAtTime(0,this.ctx.currentTime),a.gain.linearRampToValueAtTime(1,this.ctx.currentTime+t),r.connect(a).connect(this.musicBus),r.start(this.ctx.currentTime,i?i[0]:0),this.music={id:e,src:r,gain:a,startedAt:this.ctx.currentTime-0}}stopMusic(e=.6){if(!this.ctx||!this.music)return;let{src:t,gain:n}=this.music;n.gain.cancelScheduledValues(this.ctx.currentTime),n.gain.setValueAtTime(n.gain.value,this.ctx.currentTime),n.gain.linearRampToValueAtTime(0,this.ctx.currentTime+e),t.stop(this.ctx.currentTime+e+.05),this.music=null}currentMusic(){return this.music?.id??null}async playTrack(e,t=1,n){this.stopTrack();let r=await this.load(e);if(!r||!this.ctx)return()=>{};let i=this.ctx.createBufferSource();i.buffer=r;let a=this.ctx.createGain();return a.gain.value=t,i.connect(a).connect(this.musicBus),i.onended=()=>{this.oneShotMusic?.src===i&&(this.oneShotMusic=null),n?.()},i.start(),this.oneShotMusic={src:i,gain:a},()=>this.stopTrack()}stopTrack(){if(!this.ctx||!this.oneShotMusic)return;let{src:e,gain:t}=this.oneShotMusic;t.gain.setTargetAtTime(0,this.ctx.currentTime,.1);try{e.stop(this.ctx.currentTime+.4)}catch{}this.oneShotMusic=null}setHabit(e){if(this.habit=e,!this.ctx)return;let t=this.ctx.currentTime;this.lowpass.frequency.setTargetAtTime(e===`junk`?1300:2e4,t,.4),this.shelf.gain.setTargetAtTime(e===`healthy`?3.5:0,t,.4),this.music&&this.music.src.playbackRate.setTargetAtTime(e===`junk`?.965:1,t,.5)}async play(e,t=1,n=1){if((!this.ctx||this.muted)&&!this.ctx)return;let r=await this.load(e);if(!r||!this.ctx)return;let i=this.ctx.createBufferSource();i.buffer=r,i.playbackRate.value=n;let a=this.ctx.createGain();a.gain.value=t,i.connect(a).connect(this.sfxBus),i.start()}playOneOf(e,t=1){let n=e.filter(e=>this.has(e));if(!n.length)return Promise.resolve();let r=e.join(`|`),i=this.lastPick.get(r),a=n.length>1?n.filter(e=>e!==i):n,o=a[Math.floor(Math.random()*a.length)];return this.lastPick.set(r,o),this.play(o,t)}voice(e,t,n=!1){let r=e===`yum`&&t===`it`?4:3,i=Array.from({length:r},(n,r)=>`${e}_${t}_${r+1}`);return e===`bleah`&&n?this.playOneOf([`bleah_${t}_2`,`bleah_${t}_3`]):this.playOneOf(i)}tone(e,t,n,r=`sine`,i=.25,a){if(!this.ctx)return;let o=this.ctx.createOscillator(),s=this.ctx.createGain();o.type=r,o.frequency.setValueAtTime(e,t),a&&o.frequency.exponentialRampToValueAtTime(a,t+n),s.gain.setValueAtTime(1e-4,t),s.gain.exponentialRampToValueAtTime(i,t+.008),s.gain.exponentialRampToValueAtTime(1e-4,t+n),o.connect(s).connect(this.sfxBus),o.start(t),o.stop(t+n+.02)}marimba(e,t,n=.22){this.tone(e,t,.45,`sine`,n),this.tone(e*4,t,.08,`sine`,n*.25)}combo(e){if(!this.ctx)return;let n=this.ctx.currentTime,r=Math.min(5,Math.max(1,e));for(let e=0;e<r;e++)this.marimba(t[2+e],n+e*.07,.16);r>=5&&this.tone(t[9],n+.4,.6,`triangle`,.08)}habitJunk(){if(!this.ctx)return;let e=this.ctx.currentTime;this.tone(220,e,.9,`sawtooth`,.12,70),this.tone(110,e+.05,1,`triangle`,.18,55),this.tone(880,e+.1,.8,`sine`,.05,300)}palateReset(){if(!this.ctx)return;let e=this.ctx.currentTime;this.tone(180,e,.25,`sine`,.25,720),[0,2,4,5,7].forEach((n,r)=>this.marimba(t[n+2],e+.25+r*.08,.18)),this.tone(t[9],e+.7,.8,`triangle`,.1)}rainbow(){if(!this.ctx)return;let e=this.ctx.currentTime;t.forEach((t,n)=>this.tone(t,e+n*.06,.5,`triangle`,.08))}fanfare(){if(!this.ctx)return;let e=this.ctx.currentTime;[[523.25,0],[659.25,.12],[783.99,.24],[1046.5,.4]].forEach(([t,n])=>{this.tone(t,e+n,.5,`square`,.05),this.tone(t/2,e+n,.5,`triangle`,.1)})}sugarRush(){if(!this.ctx)return;let e=this.ctx.currentTime;for(let n=0;n<12;n++)this.tone(t[n%t.length]*1.5,e+n*.035,.08,`square`,.04);this.tone(900,e+.5,.9,`sine`,.08,120)}pop(e=700){this.ctx&&this.tone(e,this.ctx.currentTime,.12,`sine`,.12,e*1.6)}tick(e=!1){if(!this.ctx)return;let t=this.ctx.currentTime;this.tone(e?1600:1250,t,.06,`triangle`,e?.18:.12)}beatPeriod(){let t=this.music?.id;return 60/(t&&e[t]?e[t]:120)}},r=1e3,i=1001,a=1002,o=1003,s=1004,c=1005,l=1006,u=1007,d=1008,f=1009,p=1010,m=1011,h=1012,g=1013,_=1014,v=1015,y=1016,b=1017,x=1018,S=1020,C=35902,w=35899,T=1021,E=1022,D=1023,O=1026,k=1027,A=1028,ee=1029,te=1030,ne=1031,j=1033,re=33776,M=33777,ie=33778,ae=33779,oe=35840,se=35841,ce=35842,le=35843,ue=36196,N=37492,de=37496,fe=37488,pe=37489,me=37490,he=37491,ge=37808,_e=37809,ve=37810,ye=37811,be=37812,xe=37813,Se=37814,Ce=37815,we=37816,Te=37817,Ee=37818,De=37819,Oe=37820,ke=37821,Ae=36492,je=36494,Me=36495,Ne=36283,Pe=36284,P=36285,Fe=36286,Ie=2300,Le=2301,F=2302,Re=2303,I=2400,ze=2401,Be=2402,Ve=3200,He=`srgb`,Ue=`srgb-linear`,We=`linear`,Ge=`srgb`,Ke=7680,qe=35044,Je=2e3;function Ye(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Xe(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Ze(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Qe(){let e=Ze(`canvas`);return e.style.display=`block`,e}var $e={};function et(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function tt(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function L(...e){e=tt(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function R(...e){e=tt(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function nt(...e){let t=e.join(` `);t in $e||($e[t]=!0,L(...e))}function rt(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var it={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},at=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},ot=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),st=1234567,ct=Math.PI/180,lt=180/Math.PI;function ut(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(ot[e&255]+ot[e>>8&255]+ot[e>>16&255]+ot[e>>24&255]+`-`+ot[t&255]+ot[t>>8&255]+`-`+ot[t>>16&15|64]+ot[t>>24&255]+`-`+ot[n&63|128]+ot[n>>8&255]+`-`+ot[n>>16&255]+ot[n>>24&255]+ot[r&255]+ot[r>>8&255]+ot[r>>16&255]+ot[r>>24&255]).toLowerCase()}function z(e,t,n){return Math.max(t,Math.min(n,e))}function dt(e,t){return(e%t+t)%t}function ft(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function pt(e,t,n){return e===t?0:(n-e)/(t-e)}function mt(e,t,n){return(1-n)*e+n*t}function ht(e,t,n,r){return mt(e,t,1-Math.exp(-n*r))}function gt(e,t=1){return t-Math.abs(dt(e,t*2)-t)}function _t(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function vt(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function yt(e,t){return e+Math.floor(Math.random()*(t-e+1))}function bt(e,t){return e+Math.random()*(t-e)}function xt(e){return e*(.5-Math.random())}function St(e){e!==void 0&&(st=e);let t=st+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Ct(e){return e*ct}function wt(e){return e*lt}function Tt(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function Et(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function Dt(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function Ot(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:L(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function kt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}function At(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}var jt={DEG2RAD:ct,RAD2DEG:lt,generateUUID:ut,clamp:z,euclideanModulo:dt,mapLinear:ft,inverseLerp:pt,lerp:mt,damp:ht,pingpong:gt,smoothstep:_t,smootherstep:vt,randInt:yt,randFloat:bt,randFloatSpread:xt,seededRandom:St,degToRad:Ct,radToDeg:wt,isPowerOfTwo:Tt,ceilPowerOfTwo:Et,floorPowerOfTwo:Dt,setQuaternionFromProperEuler:Ot,normalize:At,denormalize:kt},B=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Mt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:L(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(z(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},V=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Pt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Pt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Nt.copy(this).projectOnVector(e),this.sub(Nt)}reflect(e){return this.sub(Nt.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Nt=new V,Pt=new Mt,H=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return nt(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(Ft.makeScale(e,t)),this}rotate(e){return nt(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(Ft.makeRotation(-e)),this}translate(e,t){return nt(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(Ft.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Ft=new H,It=new H().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Lt=new H().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Rt(){let e={enabled:!0,workingColorSpace:Ue,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=Bt(e.r),e.g=Bt(e.g),e.b=Bt(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Vt(e.r),e.g=Vt(e.g),e.b=Vt(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?We:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return nt(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return nt(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Ue]:{primaries:t,whitePoint:r,transfer:We,toXYZ:It,fromXYZ:Lt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:He},outputColorSpaceConfig:{drawingBufferColorSpace:He}},[He]:{primaries:t,whitePoint:r,transfer:Ge,toXYZ:It,fromXYZ:Lt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:He}}}),e}var zt=Rt();function Bt(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Vt(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Ht,Ut=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ht===void 0&&(Ht=Ze(`canvas`)),Ht.width=e.width,Ht.height=e.height;let t=Ht.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Ht}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Ze(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Bt(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Bt(t[e]/255)*255):t[e]=Bt(t[e]);return{data:t,width:e.width,height:e.height}}return L(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Wt=0,Gt=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Wt++}),this.uuid=ut(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Kt(r[t].image)):e.push(Kt(r[t]))}else e=Kt(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Kt(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Ut.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(L(`Texture: Unable to serialize Texture.`),{})}var qt=0,Jt=new V,Yt=class e extends at{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=i,a=i,o=l,s=d,c=D,u=f,p=e.DEFAULT_ANISOTROPY,m=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:qt++}),this.uuid=ut(),this.name=``,this.source=new Gt(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=a,this.magFilter=o,this.minFilter=s,this.anisotropy=p,this.format=c,this.internalFormat=null,this.type=u,this.offset=new B(0,0),this.repeat=new B(1,1),this.center=new B(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new H,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Jt).x}get height(){return this.source.getSize(Jt).y}get depth(){return this.source.getSize(Jt).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){L(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){L(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case r:e.x-=Math.floor(e.x);break;case i:e.x=e.x<0?0:1;break;case a:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case r:e.y-=Math.floor(e.y);break;case i:e.y=e.y<0?0:1;break;case a:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Yt.DEFAULT_IMAGE=null,Yt.DEFAULT_MAPPING=300,Yt.DEFAULT_ANISOTROPY=1;var Xt=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this.w=z(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this.w=z(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Zt=class extends at{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:l,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Xt(0,0,e,t),this.scissorTest=!1,this.viewport=new Xt(0,0,e,t),this.textures=[];let r=new Yt({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:l,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Gt(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},Qt=class extends Zt{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},$t=class extends Yt{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=o,this.minFilter=o,this.wrapR=i,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},en=class extends Yt{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=o,this.minFilter=o,this.wrapR=i,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},tn=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/nn.setFromMatrixColumn(e,0).length(),i=1/nn.setFromMatrixColumn(e,1).length(),a=1/nn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(an,e,on)}lookAt(e,t,n){let r=this.elements;return ln.subVectors(e,t),ln.lengthSq()===0&&(ln.z=1),ln.normalize(),sn.crossVectors(n,ln),sn.lengthSq()===0&&(Math.abs(n.z)===1?ln.x+=1e-4:ln.z+=1e-4,ln.normalize(),sn.crossVectors(n,ln)),sn.normalize(),cn.crossVectors(ln,sn),r[0]=sn.x,r[4]=cn.x,r[8]=ln.x,r[1]=sn.y,r[5]=cn.y,r[9]=ln.y,r[2]=sn.z,r[6]=cn.z,r[10]=ln.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],ee=r[10],te=r[14],ne=r[3],j=r[7],re=r[11],M=r[15];return i[0]=a*x+o*T+s*k+c*ne,i[4]=a*S+o*E+s*A+c*j,i[8]=a*C+o*D+s*ee+c*re,i[12]=a*w+o*O+s*te+c*M,i[1]=l*x+u*T+d*k+f*ne,i[5]=l*S+u*E+d*A+f*j,i[9]=l*C+u*D+d*ee+f*re,i[13]=l*w+u*O+d*te+f*M,i[2]=p*x+m*T+h*k+g*ne,i[6]=p*S+m*E+h*A+g*j,i[10]=p*C+m*D+h*ee+g*re,i[14]=p*w+m*O+h*te+g*M,i[3]=_*x+v*T+y*k+b*ne,i[7]=_*S+v*E+y*A+b*j,i[11]=_*C+v*D+y*ee+b*re,i[15]=_*w+v*O+y*te+b*M,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=nn.set(r[0],r[1],r[2]).length(),o=nn.set(r[4],r[5],r[6]).length(),s=nn.set(r[8],r[9],r[10]).length();i<0&&(a=-a),rn.copy(this);let c=1/a,l=1/o,u=1/s;return rn.elements[0]*=c,rn.elements[1]*=c,rn.elements[2]*=c,rn.elements[4]*=l,rn.elements[5]*=l,rn.elements[6]*=l,rn.elements[8]*=u,rn.elements[9]*=u,rn.elements[10]*=u,t.setFromRotationMatrix(rn),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=Je,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Je,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},nn=new V,rn=new tn,an=new V(0,0,0),on=new V(1,1,1),sn=new V,cn=new V,ln=new V,un=new tn,dn=new Mt,fn=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(z(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-z(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(z(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-z(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(z(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-z(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:L(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return un.makeRotationFromQuaternion(e),this.setFromRotationMatrix(un,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return dn.setFromEuler(this),this.setFromQuaternion(dn,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};fn.DEFAULT_ORDER=`XYZ`;var pn=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&(1<<e|0))}},mn=0,hn=new V,gn=new Mt,_n=new tn,vn=new V,yn=new V,bn=new V,xn=new Mt,Sn=new V(1,0,0),Cn=new V(0,1,0),wn=new V(0,0,1),Tn={type:`added`},En={type:`removed`},Dn={type:`childadded`,child:null},On={type:`childremoved`,child:null},kn=class e extends at{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:mn++}),this.uuid=ut(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new V,n=new fn,r=new Mt,i=new V(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new tn},normalMatrix:{value:new H}}),this.matrix=new tn,this.matrixWorld=new tn,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new pn,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return gn.setFromAxisAngle(e,t),this.quaternion.multiply(gn),this}rotateOnWorldAxis(e,t){return gn.setFromAxisAngle(e,t),this.quaternion.premultiply(gn),this}rotateX(e){return this.rotateOnAxis(Sn,e)}rotateY(e){return this.rotateOnAxis(Cn,e)}rotateZ(e){return this.rotateOnAxis(wn,e)}translateOnAxis(e,t){return hn.copy(e).applyQuaternion(this.quaternion),this.position.add(hn.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Sn,e)}translateY(e){return this.translateOnAxis(Cn,e)}translateZ(e){return this.translateOnAxis(wn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(_n.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?vn.copy(e):vn.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),yn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?_n.lookAt(yn,vn,this.up):_n.lookAt(vn,yn,this.up),this.quaternion.setFromRotationMatrix(_n),r&&(_n.extractRotation(r.matrixWorld),gn.setFromRotationMatrix(_n),this.quaternion.premultiply(gn.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(R(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Tn),Dn.child=e,this.dispatchEvent(Dn),Dn.child=null):R(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(En),On.child=e,this.dispatchEvent(On),On.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),_n.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),_n.multiply(e.parent.matrixWorld)),e.applyMatrix4(_n),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Tn),Dn.child=e,this.dispatchEvent(Dn),Dn.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(yn,e,bn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(yn,xn,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};kn.DEFAULT_UP=new V(0,1,0),kn.DEFAULT_MATRIX_AUTO_UPDATE=!0,kn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var An=class extends kn{constructor(){super(),this.isGroup=!0,this.type=`Group`}},jn={type:`move`},Mn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new An,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new An,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new V,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new V),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new An,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new V,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new V,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(jn)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new An;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Nn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Pn={h:0,s:0,l:0},Fn={h:0,s:0,l:0};function In(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var U=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=He){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,zt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=zt.workingColorSpace){return this.r=e,this.g=t,this.b=n,zt.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=zt.workingColorSpace){if(e=dt(e,1),t=z(t,0,1),n=z(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=In(i,r,e+1/3),this.g=In(i,r,e),this.b=In(i,r,e-1/3)}return zt.colorSpaceToWorking(this,r),this}setStyle(e,t=He){function n(t){t!==void 0&&parseFloat(t)<1&&L(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:L(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);L(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=He){let n=Nn[e.toLowerCase()];return n===void 0?L(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Bt(e.r),this.g=Bt(e.g),this.b=Bt(e.b),this}copyLinearToSRGB(e){return this.r=Vt(e.r),this.g=Vt(e.g),this.b=Vt(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=He){return zt.workingToColorSpace(Ln.copy(this),e),Math.round(z(Ln.r*255,0,255))*65536+Math.round(z(Ln.g*255,0,255))*256+Math.round(z(Ln.b*255,0,255))}getHexString(e=He){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=zt.workingColorSpace){zt.workingToColorSpace(Ln.copy(this),t);let n=Ln.r,r=Ln.g,i=Ln.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=zt.workingColorSpace){return zt.workingToColorSpace(Ln.copy(this),t),e.r=Ln.r,e.g=Ln.g,e.b=Ln.b,e}getStyle(e=He){zt.workingToColorSpace(Ln.copy(this),e);let t=Ln.r,n=Ln.g,r=Ln.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(Pn),this.setHSL(Pn.h+e,Pn.s+t,Pn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Pn),e.getHSL(Fn);let n=mt(Pn.h,Fn.h,t),r=mt(Pn.s,Fn.s,t),i=mt(Pn.l,Fn.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ln=new U;U.NAMES=Nn;var Rn=class e{constructor(e,t=1,n=1e3){this.isFog=!0,this.name=``,this.color=new U(e),this.near=t,this.far=n}clone(){return new e(this.color,this.near,this.far)}toJSON(){return{type:`Fog`,name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},zn=class extends kn{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new fn,this.environmentIntensity=1,this.environmentRotation=new fn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Bn=new V,Vn=new V,Hn=new V,Un=new V,Wn=new V,Gn=new V,Kn=new V,qn=new V,Jn=new V,Yn=new V,Xn=new Xt,Zn=new Xt,Qn=new Xt,$n=class e{constructor(e=new V,t=new V,n=new V){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Bn.subVectors(e,t),r.cross(Bn);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Bn.subVectors(r,t),Vn.subVectors(n,t),Hn.subVectors(e,t);let a=Bn.dot(Bn),o=Bn.dot(Vn),s=Bn.dot(Hn),c=Vn.dot(Vn),l=Vn.dot(Hn),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Un)!==null&&Un.x>=0&&Un.y>=0&&Un.x+Un.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Un)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Un.x),s.addScaledVector(a,Un.y),s.addScaledVector(o,Un.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return Xn.setScalar(0),Zn.setScalar(0),Qn.setScalar(0),Xn.fromBufferAttribute(e,t),Zn.fromBufferAttribute(e,n),Qn.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Xn,i.x),a.addScaledVector(Zn,i.y),a.addScaledVector(Qn,i.z),a}static isFrontFacing(e,t,n,r){return Bn.subVectors(n,t),Vn.subVectors(e,t),Bn.cross(Vn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Bn.subVectors(this.c,this.b),Vn.subVectors(this.a,this.b),Bn.cross(Vn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Wn.subVectors(r,n),Gn.subVectors(i,n),qn.subVectors(e,n);let s=Wn.dot(qn),c=Gn.dot(qn);if(s<=0&&c<=0)return t.copy(n);Jn.subVectors(e,r);let l=Wn.dot(Jn),u=Gn.dot(Jn);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(Wn,a);Yn.subVectors(e,i);let f=Wn.dot(Yn),p=Gn.dot(Yn);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Gn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Kn.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Kn,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Wn,a).addScaledVector(Gn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},er=class{constructor(e=new V(1/0,1/0,1/0),t=new V(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(nr.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(nr.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=nr.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,nr):nr.fromBufferAttribute(r,t),nr.applyMatrix4(e.matrixWorld),this.expandByPoint(nr);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),rr.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),rr.copy(e.boundingBox)),rr.applyMatrix4(e.matrixWorld),this.union(rr)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,nr),nr.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ur),dr.subVectors(this.max,ur),ir.subVectors(e.a,ur),ar.subVectors(e.b,ur),or.subVectors(e.c,ur),sr.subVectors(ar,ir),cr.subVectors(or,ar),lr.subVectors(ir,or);let t=[0,-sr.z,sr.y,0,-cr.z,cr.y,0,-lr.z,lr.y,sr.z,0,-sr.x,cr.z,0,-cr.x,lr.z,0,-lr.x,-sr.y,sr.x,0,-cr.y,cr.x,0,-lr.y,lr.x,0];return!mr(t,ir,ar,or,dr)||(t=[1,0,0,0,1,0,0,0,1],!mr(t,ir,ar,or,dr))?!1:(fr.crossVectors(sr,cr),t=[fr.x,fr.y,fr.z],mr(t,ir,ar,or,dr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,nr).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(nr).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(tr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),tr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),tr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),tr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),tr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),tr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),tr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),tr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(tr),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},tr=[new V,new V,new V,new V,new V,new V,new V,new V],nr=new V,rr=new er,ir=new V,ar=new V,or=new V,sr=new V,cr=new V,lr=new V,ur=new V,dr=new V,fr=new V,pr=new V;function mr(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){pr.fromArray(e,a);let o=i.x*Math.abs(pr.x)+i.y*Math.abs(pr.y)+i.z*Math.abs(pr.z),s=t.dot(pr),c=n.dot(pr),l=r.dot(pr);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var hr=new V,gr=new B,_r=0,vr=class extends at{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:_r++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=qe,this.updateRanges=[],this.gpuType=v,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)gr.fromBufferAttribute(this,t),gr.applyMatrix3(e),this.setXY(t,gr.x,gr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)hr.fromBufferAttribute(this,t),hr.applyMatrix3(e),this.setXYZ(t,hr.x,hr.y,hr.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)hr.fromBufferAttribute(this,t),hr.applyMatrix4(e),this.setXYZ(t,hr.x,hr.y,hr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)hr.fromBufferAttribute(this,t),hr.applyNormalMatrix(e),this.setXYZ(t,hr.x,hr.y,hr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)hr.fromBufferAttribute(this,t),hr.transformDirection(e),this.setXYZ(t,hr.x,hr.y,hr.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=kt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=At(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=kt(t,this.array)),t}setX(e,t){return this.normalized&&(t=At(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=kt(t,this.array)),t}setY(e,t){return this.normalized&&(t=At(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=kt(t,this.array)),t}setZ(e,t){return this.normalized&&(t=At(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=kt(t,this.array)),t}setW(e,t){return this.normalized&&(t=At(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=At(t,this.array),n=At(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=At(t,this.array),n=At(n,this.array),r=At(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=At(t,this.array),n=At(n,this.array),r=At(r,this.array),i=At(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}},yr=class extends vr{constructor(e,t,n){super(new Uint16Array(e),t,n)}},br=class extends vr{constructor(e,t,n){super(new Uint32Array(e),t,n)}},xr=class extends vr{constructor(e,t,n){super(new Float32Array(e),t,n)}},Sr=new er,Cr=new V,wr=new V,Tr=class{constructor(e=new V,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?Sr.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Cr.subVectors(e,this.center);let t=Cr.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(Cr,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(wr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Cr.copy(e.center).add(wr)),this.expandByPoint(Cr.copy(e.center).sub(wr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Er=0,Dr=new tn,Or=new kn,kr=new V,Ar=new er,jr=new er,Mr=new V,Nr=class e extends at{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Er++}),this.uuid=ut(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(Ye(e)?br:yr)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new H().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Dr.makeRotationFromQuaternion(e),this.applyMatrix4(Dr),this}rotateX(e){return Dr.makeRotationX(e),this.applyMatrix4(Dr),this}rotateY(e){return Dr.makeRotationY(e),this.applyMatrix4(Dr),this}rotateZ(e){return Dr.makeRotationZ(e),this.applyMatrix4(Dr),this}translate(e,t,n){return Dr.makeTranslation(e,t,n),this.applyMatrix4(Dr),this}scale(e,t,n){return Dr.makeScale(e,t,n),this.applyMatrix4(Dr),this}lookAt(e){return Or.lookAt(e),Or.updateMatrix(),this.applyMatrix4(Or.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(kr).negate(),this.translate(kr.x,kr.y,kr.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new xr(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&L(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new er);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){R(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new V(-1/0,-1/0,-1/0),new V(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Ar.setFromBufferAttribute(n),this.morphTargetsRelative?(Mr.addVectors(this.boundingBox.min,Ar.min),this.boundingBox.expandByPoint(Mr),Mr.addVectors(this.boundingBox.max,Ar.max),this.boundingBox.expandByPoint(Mr)):(this.boundingBox.expandByPoint(Ar.min),this.boundingBox.expandByPoint(Ar.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&R(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Tr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){R(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new V,1/0);return}if(e){let n=this.boundingSphere.center;if(Ar.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];jr.setFromBufferAttribute(n),this.morphTargetsRelative?(Mr.addVectors(Ar.min,jr.min),Ar.expandByPoint(Mr),Mr.addVectors(Ar.max,jr.max),Ar.expandByPoint(Mr)):(Ar.expandByPoint(jr.min),Ar.expandByPoint(jr.max))}Ar.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Mr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Mr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Mr.fromBufferAttribute(a,t),o&&(kr.fromBufferAttribute(e,t),Mr.add(kr)),r=Math.max(r,n.distanceToSquared(Mr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&R(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){R(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new vr(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new V,s[e]=new V;let c=new V,l=new V,u=new V,d=new B,f=new B,p=new B,m=new V,h=new V;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new V,y=new V,b=new V,x=new V;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new vr(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new V,i=new V,a=new V,o=new V,s=new V,c=new V,l=new V,u=new V;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Mr.fromBufferAttribute(e,t),Mr.normalize(),e.setXYZ(t,Mr.x,Mr.y,Mr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new vr(a,r,i)}if(this.index===null)return L(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},Pr=new V,Fr=new V,Ir=new H,Lr=class{constructor(e=new V(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Pr.subVectors(n,t).cross(Fr.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(Pr),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Ir.getNormalMatrix(e),r=this.coplanarPoint(Pr).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Rr=0,zr=class extends at{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Rr++}),this.uuid=ut(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new U(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ke,this.stencilZFail=Ke,this.stencilZPass=Ke,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){L(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){L(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new U().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new Lr().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new B().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new B().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Br=new V,Vr=new V,Hr=new V,Ur=new V,Wr=class{constructor(e=new V,t=new V(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Br)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Br.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Br.copy(this.origin).addScaledVector(this.direction,t),Br.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Vr.copy(e).add(t).multiplyScalar(.5),Hr.copy(t).sub(e).normalize(),Ur.copy(this.origin).sub(Vr);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Hr),o=Ur.dot(this.direction),s=-Ur.dot(Hr),c=Ur.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Vr).addScaledVector(Hr,d),f}intersectSphere(e,t){if(e.radius<0)return null;Br.subVectors(e.center,this.origin);let n=Br.dot(this.direction),r=Br.dot(Br)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Br)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,ee,te,ne;if(y>=b&&y>=x?(w=s,D=u,A=p,ne=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,ee=_,te=v):(S=l,C=c,T=f,E=d,O=h,k=m,ee=v,te=_)):b>=x?(w=c,D=d,A=m,ne=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,ee=v,te=g):(S=s,C=l,T=u,E=f,O=p,k=h,ee=g,te=v)):(w=l,D=f,A=h,ne=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,ee=g,te=_):(S=c,C=s,T=d,E=u,O=m,k=p,ee=_,te=g)),w===0)return null;let j=S/w,re=C/w,M=1/w,ie=T-j*D,ae=E-re*D,oe=O-j*A,se=k-re*A,ce=ee-j*ne,le=te-re*ne,ue=ce*se-le*oe,N=ie*le-ae*ce,de=oe*ae-se*ie;if(r){if(ue<0||N<0||de<0)return null}else if((ue<0||N<0||de<0)&&(ue>0||N>0||de>0))return null;let fe=ue+N+de;if(fe===0)return null;let pe=M*(ue*D+N*A+de*ne);return(fe>0?pe<0:pe>0)?null:this.at(pe/fe,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Gr=class extends zr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new U(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new fn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Kr=new tn,qr=new Wr,Jr=new Tr,Yr=new V,Xr=new V,Zr=new V,Qr=new V,$r=new V,ei=new V,ti=new V,ni=new V,ri=class extends kn{constructor(e=new Nr,t=new Gr){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){ei.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&($r.fromBufferAttribute(s,e),a?ei.addScaledVector($r,r):ei.addScaledVector($r.sub(t),r))}t.add(ei)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Jr.copy(n.boundingSphere),Jr.applyMatrix4(i),qr.copy(e.ray).recast(e.near),!(Jr.containsPoint(qr.origin)===!1&&(qr.intersectSphere(Jr,Yr)===null||qr.origin.distanceToSquared(Yr)>(e.far-e.near)**2))&&(Kr.copy(i).invert(),qr.copy(e.ray).applyMatrix4(Kr),(n.boundingBox===null||qr.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,qr)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=ai(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=ai(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=ai(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=ai(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function ii(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;ni.copy(s),ni.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(ni);return l<n.near||l>n.far?null:{distance:l,point:ni.clone(),object:e}}function ai(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Xr),e.getVertexPosition(c,Zr),e.getVertexPosition(l,Qr);let u=ii(e,t,n,r,Xr,Zr,Qr,ti);if(u){let e=new V;$n.getBarycoord(ti,Xr,Zr,Qr,e),i&&(u.uv=$n.getInterpolatedAttribute(i,s,c,l,e,new B)),a&&(u.uv1=$n.getInterpolatedAttribute(a,s,c,l,e,new B)),o&&(u.normal=$n.getInterpolatedAttribute(o,s,c,l,e,new V),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new V,materialIndex:0};$n.getNormal(Xr,Zr,Qr,t.normal),u.face=t,u.barycoord=e}return u}var oi=class extends Yt{constructor(e=null,t=1,n=1,r,i,a,s,c,l=o,u=o,d,f){super(null,a,s,c,l,u,r,i,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},si=class extends vr{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ci=new tn,li=new tn,ui=[],di=new er,fi=new tn,pi=new ri,mi=new Tr,hi=class extends ri{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new si(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,fi)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new er),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ci),di.copy(e.boundingBox).applyMatrix4(ci),this.boundingBox.union(di)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Tr),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ci),mi.copy(e.boundingSphere).applyMatrix4(ci),this.boundingSphere.union(mi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(pi.geometry=this.geometry,pi.material=this.material,pi.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),mi.copy(this.boundingSphere),mi.applyMatrix4(n),e.ray.intersectsSphere(mi)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,ci),li.multiplyMatrices(n,ci),pi.matrixWorld=li,pi.raycast(e,ui);for(let e=0,n=ui.length;e<n;e++){let n=ui[e];n.instanceId=i,n.object=this,t.push(n)}ui.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new si(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new oi(new Float32Array(r*this.count),r,this.count,A,v));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},gi=new Tr,_i=new B(.5,.5),vi=new V,yi=class{constructor(e=new Lr,t=new Lr,n=new Lr,r=new Lr,i=new Lr,a=new Lr){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Je,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),gi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),gi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(gi)}intersectsSprite(e){return gi.center.set(0,0,0),gi.radius=.7071067811865476+_i.distanceTo(e.center),gi.applyMatrix4(e.matrixWorld),this.intersectsSphere(gi)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(vi.x=r.normal.x>0?e.max.x:e.min.x,vi.y=r.normal.y>0?e.max.y:e.min.y,vi.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(vi)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},bi=class extends Yt{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},xi=class extends Yt{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Si=class extends Yt{constructor(e,t,n=_,r,i,a,s=o,c=o,l,u=O,d=1){if(u!==1026&&u!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},r,i,a,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Gt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Ci=class extends Si{constructor(e,t=_,n=301,r,i,a=o,s=o,c,l=O){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,r,i,a,s,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},wi=class extends Yt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Ti=class e extends Nr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new xr(c,3)),this.setAttribute(`normal`,new xr(l,3)),this.setAttribute(`uv`,new xr(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new V;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Ei=class e extends Nr{constructor(e=1,t=1,n=4,r=8,i=1){super(),this.type=`CapsuleGeometry`,this.parameters={radius:e,height:t,capSegments:n,radialSegments:r,heightSegments:i},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),r=Math.max(3,Math.floor(r)),i=Math.max(1,Math.floor(i));let a=[],o=[],s=[],c=[],l=t/2,u=Math.PI/2*e,d=t,f=2*u+d,p=n*2+i,m=r+1,h=new V,g=new V;for(let _=0;_<=p;_++){let v=0,y=0,b=0,x=0;if(_<=n){let t=_/n,r=t*Math.PI/2;y=-l-e*Math.cos(r),b=e*Math.sin(r),x=-e*Math.cos(r),v=t*u}else if(_<=n+i){let r=(_-n)/i;y=-l+r*t,b=e,x=0,v=u+r*d}else{let t=(_-n-i)/n,r=t*Math.PI/2;y=l+e*Math.sin(r),b=e*Math.cos(r),x=e*Math.sin(r),v=u+d+t*u}let S=Math.max(0,Math.min(1,v/f)),C=0;_===0?C=.5/r:_===p&&(C=-.5/r);for(let e=0;e<=r;e++){let t=e/r,n=t*Math.PI*2,i=Math.sin(n),a=Math.cos(n);g.x=-b*a,g.y=y,g.z=b*i,o.push(g.x,g.y,g.z),h.set(-b*a,x,b*i),h.normalize(),s.push(h.x,h.y,h.z),c.push(t+C,S)}if(_>0){let e=(_-1)*m;for(let t=0;t<r;t++){let n=e+t,r=e+t+1,i=_*m+t,o=_*m+t+1;a.push(n,r,i),a.push(r,o,i)}}}this.setIndex(a),this.setAttribute(`position`,new xr(o,3)),this.setAttribute(`normal`,new xr(s,3)),this.setAttribute(`uv`,new xr(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},Di=class e extends Nr{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new V,l=new B;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new xr(a,3)),this.setAttribute(`normal`,new xr(o,3)),this.setAttribute(`uv`,new xr(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},W=class e extends Nr{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new xr(u,3)),this.setAttribute(`normal`,new xr(d,3)),this.setAttribute(`uv`,new xr(f,2));function _(){let a=new V,_=new V,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new B,m=new V,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Oi=class e extends W{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},ki=class e extends Nr{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new xr(i,3)),this.setAttribute(`normal`,new xr(i.slice(),3)),this.setAttribute(`uv`,new xr(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new V,r=new V,i=new V;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new V;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new V;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new V,t=new V,n=new V,r=new V,o=new B,s=new B,c=new B;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},Ai=class e extends ki{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=1/n,i=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-r,-n,0,-r,n,0,r,-n,0,r,n,-r,-n,0,-r,n,0,r,-n,0,r,n,0,-n,0,-r,n,0,-r,-n,0,r,n,0,r];super(i,[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9],e,t),this.type=`DodecahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},ji=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){L(`Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new B:new V);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new V,r=[],i=[],a=[],o=new V,s=new tn;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new V)}i[0]=new V,a[0]=new V;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(z(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(z(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Mi=class extends ji{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new B){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Ni=class extends Mi{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function Pi(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var Fi=new V,Ii=new V,Li=new Pi,Ri=new Pi,zi=new Pi,Bi=class extends ji{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new V){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(Ii.subVectors(r[0],r[1]).add(r[0]),c=Ii);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(Fi.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=Fi),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),Li.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),Ri.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),zi.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(Li.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),Ri.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),zi.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(Li.calc(s),Ri.calc(s),zi.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new V().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Vi(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function Hi(e,t){let n=1-e;return n*n*t}function Ui(e,t){return 2*(1-e)*e*t}function Wi(e,t){return e*e*t}function Gi(e,t,n,r){return Hi(e,t)+Ui(e,n)+Wi(e,r)}function Ki(e,t){let n=1-e;return n*n*n*t}function qi(e,t){let n=1-e;return 3*n*n*e*t}function Ji(e,t){return 3*(1-e)*e*e*t}function Yi(e,t){return e*e*e*t}function Xi(e,t,n,r,i){return Ki(e,t)+qi(e,n)+Ji(e,r)+Yi(e,i)}var Zi=class extends ji{constructor(e=new B,t=new B,n=new B,r=new B){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new B){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(Xi(e,r.x,i.x,a.x,o.x),Xi(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Qi=class extends ji{constructor(e=new V,t=new V,n=new V,r=new V){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new V){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(Xi(e,r.x,i.x,a.x,o.x),Xi(e,r.y,i.y,a.y,o.y),Xi(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},$i=class extends ji{constructor(e=new B,t=new B){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new B){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new B){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ea=class extends ji{constructor(e=new V,t=new V){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new V){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new V){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ta=class extends ji{constructor(e=new B,t=new B,n=new B){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new B){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(Gi(e,r.x,i.x,a.x),Gi(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},na=class extends ji{constructor(e=new V,t=new V,n=new V){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new V){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(Gi(e,r.x,i.x,a.x),Gi(e,r.y,i.y,a.y),Gi(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ra=Object.freeze({__proto__:null,ArcCurve:Ni,CatmullRomCurve3:Bi,CubicBezierCurve:Zi,CubicBezierCurve3:Qi,EllipseCurve:Mi,LineCurve:$i,LineCurve3:ea,QuadraticBezierCurve:ta,QuadraticBezierCurve3:na,SplineCurve:class extends ji{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new B){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(Vi(o,s.x,c.x,l.x,u.x),Vi(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new B().fromArray(n))}return this}}}),ia=class e extends Nr{constructor(e=[new B(0,-.5),new B(.5,0),new B(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type=`LatheGeometry`,this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=z(r,0,Math.PI*2);let i=[],a=[],o=[],s=[],c=[],l=1/t,u=new V,d=new B,f=new V,p=new V,m=new V,h=0,g=0;for(let t=0;t<=e.length-1;t++)switch(t){case 0:h=e[t+1].x-e[t].x,g=e[t+1].y-e[t].y,f.x=g*1,f.y=-h,f.z=g*0,m.copy(f),f.normalize(),s.push(f.x,f.y,f.z);break;case e.length-1:s.push(m.x,m.y,m.z);break;default:h=e[t+1].x-e[t].x,g=e[t+1].y-e[t].y,f.x=g*1,f.y=-h,f.z=g*0,p.copy(f),f.x+=m.x,f.y+=m.y,f.z+=m.z,f.normalize(),s.push(f.x,f.y,f.z),m.copy(p)}for(let i=0;i<=t;i++){let f=n+i*l*r,p=Math.sin(f),m=Math.cos(f);for(let n=0;n<=e.length-1;n++){u.x=e[n].x*p,u.y=e[n].y,u.z=e[n].x*m,a.push(u.x,u.y,u.z),d.x=i/t,d.y=n/(e.length-1),o.push(d.x,d.y);let r=s[3*n+0]*p,l=s[3*n+1],f=s[3*n+0]*m;c.push(r,l,f)}}for(let n=0;n<t;n++)for(let t=0;t<e.length-1;t++){let r=t+n*e.length,a=r,o=r+e.length,s=r+e.length+1,c=r+1;i.push(a,o,c),i.push(s,c,o)}this.setIndex(i),this.setAttribute(`position`,new xr(a,3)),this.setAttribute(`uv`,new xr(o,2)),this.setAttribute(`normal`,new xr(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.points,t.segments,t.phiStart,t.phiLength)}},aa=class e extends Nr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new xr(p,3)),this.setAttribute(`normal`,new xr(m,3)),this.setAttribute(`uv`,new xr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},G=class e extends Nr{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new V,d=new V,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new xr(p,3)),this.setAttribute(`normal`,new xr(m,3)),this.setAttribute(`uv`,new xr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},oa=class e extends Nr{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2,a=0,o=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);let s=[],c=[],l=[],u=[],d=new V,f=new V,p=new V;for(let s=0;s<=n;s++){let m=a+s/n*o;for(let a=0;a<=r;a++){let o=a/r*i;f.x=(e+t*Math.cos(m))*Math.cos(o),f.y=(e+t*Math.cos(m))*Math.sin(o),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(o),d.y=e*Math.sin(o),p.subVectors(f,d).normalize(),l.push(p.x,p.y,p.z),u.push(a/r),u.push(s/n)}}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,a=(r+1)*(e-1)+t,o=(r+1)*e+t;s.push(n,i,o),s.push(i,a,o)}this.setIndex(s),this.setAttribute(`position`,new xr(c,3)),this.setAttribute(`normal`,new xr(l,3)),this.setAttribute(`uv`,new xr(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}},sa=class e extends Nr{constructor(e=new na(new V(-1,-1,0),new V(-1,1,0),new V(1,1,0)),t=64,n=1,r=8,i=!1){super(),this.type=`TubeGeometry`,this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:r,closed:i};let a=e.computeFrenetFrames(t,i);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new V,s=new V,c=new B,l=new V,u=[],d=[],f=[],p=[];m(),this.setIndex(p),this.setAttribute(`position`,new xr(u,3)),this.setAttribute(`normal`,new xr(d,3)),this.setAttribute(`uv`,new xr(f,2));function m(){for(let e=0;e<t;e++)h(e);h(i===!1?t:0),_(),g()}function h(i){l=e.getPointAt(i/t,l);let c=a.normals[i],f=a.binormals[i];for(let e=0;e<=r;e++){let t=e/r*Math.PI*2,i=Math.sin(t),a=-Math.cos(t);s.x=a*c.x+i*f.x,s.y=a*c.y+i*f.y,s.z=a*c.z+i*f.z,s.normalize(),d.push(s.x,s.y,s.z),o.x=l.x+n*s.x,o.y=l.y+n*s.y,o.z=l.z+n*s.z,u.push(o.x,o.y,o.z)}}function g(){for(let e=1;e<=t;e++)for(let t=1;t<=r;t++){let n=(r+1)*(e-1)+(t-1),i=(r+1)*e+(t-1),a=(r+1)*e+t,o=(r+1)*(e-1)+t;p.push(n,i,o),p.push(i,a,o)}}function _(){for(let e=0;e<=t;e++)for(let n=0;n<=r;n++)c.x=e/t,c.y=n/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(t){return new e(new ra[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}};function ca(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(ua(i))i.isRenderTargetTexture?(L(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(ua(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function la(e){let t={};for(let n=0;n<e.length;n++){let r=ca(e[n]);for(let e in r)t[e]=r[e]}return t}function ua(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function da(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function fa(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:zt.workingColorSpace}var pa={clone:ca,merge:la},ma=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ha=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ga=class extends zr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ma,this.fragmentShader=ha,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ca(e.uniforms),this.uniformsGroups=da(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new U().setHex(r.value);break;case`v2`:this.uniforms[n].value=new B().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new V().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new Xt().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new H().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new tn().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},_a=class extends ga{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},va=class extends zr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new U(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new U(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new B(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new fn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},ya=class extends va{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:``,PHYSICAL:``},this.type=`MeshPhysicalMaterial`,this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new B(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return z(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new U(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new U(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new U(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:``,PHYSICAL:``},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}},ba=class extends zr{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type=`MeshLambertMaterial`,this.color=new U(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new U(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new B(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new fn,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},xa=class extends zr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=Ve,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Sa=class extends zr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ca(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function wa(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var Ta=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},Ea=class extends Ta{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:I,endingEnd:I}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case ze:i=e,o=2*t-n;break;case Be:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case ze:a=e,s=2*n-t;break;case Be:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Da=class extends Ta{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Oa=class extends Ta{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},ka=class extends Ta{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=Ma(n,t,g,y,r);i[p]=Aa(x,o,_,b,m)}return i}};function Aa(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function ja(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function Ma(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=Aa(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=ja(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var Na=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Ca(t,this.TimeBufferType),this.values=Ca(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ca(e.times,Array),values:Ca(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),wa(e.settings)&&(n.settings={inTangents:Ca(e.settings.inTangents,Array),outTangents:Ca(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Oa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Da(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ea(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new ka(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Ie:t=this.InterpolantFactoryMethodDiscrete;break;case Le:t=this.InterpolantFactoryMethodLinear;break;case F:t=this.InterpolantFactoryMethodSmooth;break;case Re:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return L(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ie;case this.InterpolantFactoryMethodLinear:return Le;case this.InterpolantFactoryMethodSmooth:return F;case this.InterpolantFactoryMethodBezier:return Re}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;wa(this.settings)&&(Pa(this.settings.inTangents,e),Pa(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(R(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(R(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){R(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){R(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Xe(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){R(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===F,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,wa(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function Pa(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}Na.prototype.ValueTypeName=``,Na.prototype.TimeBufferType=Float32Array,Na.prototype.ValueBufferType=Float32Array,Na.prototype.DefaultInterpolation=Le;var Fa=class extends Na{constructor(e,t,n){super(e,t,n)}};Fa.prototype.ValueTypeName=`bool`,Fa.prototype.ValueBufferType=Array,Fa.prototype.DefaultInterpolation=Ie,Fa.prototype.InterpolantFactoryMethodLinear=void 0,Fa.prototype.InterpolantFactoryMethodSmooth=void 0;var Ia=class extends Na{constructor(e,t,n,r){super(e,t,n,r)}};Ia.prototype.ValueTypeName=`color`;var La=class extends Na{constructor(e,t,n,r){super(e,t,n,r)}};La.prototype.ValueTypeName=`number`;var Ra=class extends Ta{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Mt.slerpFlat(i,0,a,c-o,a,c,s);return i}},za=class extends Na{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Ra(this.times,this.values,this.getValueSize(),e)}};za.prototype.ValueTypeName=`quaternion`,za.prototype.InterpolantFactoryMethodSmooth=void 0;var Ba=class extends Na{constructor(e,t,n){super(e,t,n)}};Ba.prototype.ValueTypeName=`string`,Ba.prototype.ValueBufferType=Array,Ba.prototype.DefaultInterpolation=Ie,Ba.prototype.InterpolantFactoryMethodLinear=void 0,Ba.prototype.InterpolantFactoryMethodSmooth=void 0;var Va=class extends Na{constructor(e,t,n,r){super(e,t,n,r)}};Va.prototype.ValueTypeName=`vector`;var Ha=class extends kn{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new U(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Ua=class extends Ha{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(kn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new U(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Wa=new tn,Ga=new V,Ka=new V,qa=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new B(512,512),this.mapType=f,this.map=null,this.mapPass=null,this.matrix=new tn,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new yi,this._frameExtents=new B(1,1),this._viewportCount=1,this._viewports=[new Xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Ga.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ga),Ka.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ka),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){Wa.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Wa,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Wa)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ja=new V,Ya=new Mt,Xa=new V,Za=class extends kn{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new tn,this.projectionMatrix=new tn,this.projectionMatrixInverse=new tn,this.coordinateSystem=Je,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ja,Ya,Xa),Xa.x===1&&Xa.y===1&&Xa.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ja,Ya,Xa.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ja,Ya,Xa),Xa.x===1&&Xa.y===1&&Xa.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ja,Ya,Xa.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Qa=new V,$a=new B,eo=new B,to=class extends Za{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=lt*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(ct*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return lt*2*Math.atan(Math.tan(ct*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Qa.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Qa.x,Qa.y).multiplyScalar(-e/Qa.z),Qa.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Qa.x,Qa.y).multiplyScalar(-e/Qa.z)}getViewSize(e,t){return this.getViewBounds(e,$a,eo),t.subVectors(eo,$a)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(ct*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},no=class extends qa{constructor(){super(new to(90,1,.5,500)),this.isPointLightShadow=!0}},ro=class extends Ha{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type=`PointLight`,this.distance=n,this.decay=r,this.shadow=new no}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},io=class extends Za{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},ao=class extends qa{constructor(){super(new io(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},oo=class extends Ha{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(kn.DEFAULT_UP),this.updateMatrix(),this.target=new kn,this.shadow=new ao}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},so=-90,co=1,lo=class extends kn{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new to(so,co,e,t);r.layers=this.layers,this.add(r);let i=new to(so,co,e,t);i.layers=this.layers,this.add(i);let a=new to(so,co,e,t);a.layers=this.layers,this.add(a);let o=new to(so,co,e,t);o.layers=this.layers,this.add(o);let s=new to(so,co,e,t);s.layers=this.layers,this.add(s);let c=new to(so,co,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},uo=class extends to{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},fo=`\\[\\]\\.:\\/`,po=RegExp(`[\\[\\]\\.:\\/]`,`g`),mo=`[^\\[\\]\\.:\\/]`,ho=`[^`+fo.replace(`\\.`,``)+`]`,go=`((?:WC+[\\/:])*)`.replace(`WC`,mo),_o=`(WCOD+)?`.replace(`WCOD`,ho),vo=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,mo),yo=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,mo),bo=RegExp(`^`+go+_o+vo+yo+`$`),xo=[`material`,`materials`,`bones`,`map`],So=class{constructor(e,t,n){let r=n||Co.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Co=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(po,``)}static parseTrackName(e){let t=bo.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);xo.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){L(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){R(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){R(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){R(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){R(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){R(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;R(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Co.Composite=So,Co.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Co.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Co.prototype.GetterByBindingType=[Co.prototype._getValue_direct,Co.prototype._getValue_array,Co.prototype._getValue_arrayElement,Co.prototype._getValue_toArray],Co.prototype.SetterByBindingTypeAndVersioning=[[Co.prototype._setValue_direct,Co.prototype._setValue_direct_setNeedsUpdate,Co.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Co.prototype._setValue_array,Co.prototype._setValue_array_setNeedsUpdate,Co.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Co.prototype._setValue_arrayElement,Co.prototype._setValue_arrayElement_setNeedsUpdate,Co.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Co.prototype._setValue_fromArray,Co.prototype._setValue_fromArray_setNeedsUpdate,Co.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var wo=new tn,To=class{constructor(e,t,n=0,r=1/0){this.ray=new Wr(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new pn,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):R(`Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return wo.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(wo),this}intersectObject(e,t=!0,n=[]){return Do(e,this,n,t),n.sort(Eo),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)Do(e[r],this,n,t);return n.sort(Eo),n}};function Eo(e,t){return e.distance-t.distance}function Do(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)Do(r[e],t,n,!0)}}(class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}});function Oo(e,t,n,r){let i=ko(r);switch(n){case T:return e*t;case A:return e*t/i.components*i.byteLength;case ee:return e*t/i.components*i.byteLength;case te:return e*t*2/i.components*i.byteLength;case ne:return e*t*2/i.components*i.byteLength;case E:return e*t*3/i.components*i.byteLength;case D:return e*t*4/i.components*i.byteLength;case j:return e*t*4/i.components*i.byteLength;case re:case M:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case ie:case ae:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case se:case le:return Math.max(e,16)*Math.max(t,8)/4;case oe:case ce:return Math.max(e,8)*Math.max(t,8)/2;case ue:case N:case fe:case pe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case de:case me:case he:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ge:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case _e:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case ve:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case ye:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case be:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case xe:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Se:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Ce:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case we:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Te:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Ee:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case De:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Oe:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case ke:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Ae:case je:case Me:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Ne:case Pe:return Math.ceil(e/4)*Math.ceil(t/4)*8;case P:case Fe:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function ko(e){switch(e){case f:case p:return{byteLength:1,components:1};case h:case m:case y:return{byteLength:2,components:1};case b:case x:return{byteLength:2,components:4};case _:case g:case v:return{byteLength:4,components:1};case C:case w:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`186`}})),typeof window<`u`&&(window.__THREE__?L(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`186`);function Ao(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function jo(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var K={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},q={common:{diffuse:{value:new U(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new H}},envmap:{envMap:{value:null},envMapRotation:{value:new H},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new H}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new H}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new H},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new H},normalScale:{value:new B(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new H},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new H}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new H}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new H}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new U(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new V},probesMax:{value:new V},probesResolution:{value:new V}},points:{diffuse:{value:new U(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0},uvTransform:{value:new H}},sprite:{diffuse:{value:new U(16777215)},opacity:{value:1},center:{value:new B(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}}},Mo={basic:{uniforms:la([q.common,q.specularmap,q.envmap,q.aomap,q.lightmap,q.fog]),vertexShader:K.meshbasic_vert,fragmentShader:K.meshbasic_frag},lambert:{uniforms:la([q.common,q.specularmap,q.envmap,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.fog,q.lights,{emissive:{value:new U(0)},envMapIntensity:{value:1}}]),vertexShader:K.meshlambert_vert,fragmentShader:K.meshlambert_frag},phong:{uniforms:la([q.common,q.specularmap,q.envmap,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.fog,q.lights,{emissive:{value:new U(0)},specular:{value:new U(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:K.meshphong_vert,fragmentShader:K.meshphong_frag},standard:{uniforms:la([q.common,q.envmap,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.roughnessmap,q.metalnessmap,q.fog,q.lights,{emissive:{value:new U(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:K.meshphysical_vert,fragmentShader:K.meshphysical_frag},toon:{uniforms:la([q.common,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.gradientmap,q.fog,q.lights,{emissive:{value:new U(0)}}]),vertexShader:K.meshtoon_vert,fragmentShader:K.meshtoon_frag},matcap:{uniforms:la([q.common,q.bumpmap,q.normalmap,q.displacementmap,q.fog,{matcap:{value:null}}]),vertexShader:K.meshmatcap_vert,fragmentShader:K.meshmatcap_frag},points:{uniforms:la([q.points,q.fog]),vertexShader:K.points_vert,fragmentShader:K.points_frag},dashed:{uniforms:la([q.common,q.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:K.linedashed_vert,fragmentShader:K.linedashed_frag},depth:{uniforms:la([q.common,q.displacementmap]),vertexShader:K.depth_vert,fragmentShader:K.depth_frag},normal:{uniforms:la([q.common,q.bumpmap,q.normalmap,q.displacementmap,{opacity:{value:1}}]),vertexShader:K.meshnormal_vert,fragmentShader:K.meshnormal_frag},sprite:{uniforms:la([q.sprite,q.fog]),vertexShader:K.sprite_vert,fragmentShader:K.sprite_frag},background:{uniforms:{uvTransform:{value:new H},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:K.background_vert,fragmentShader:K.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new H}},vertexShader:K.backgroundCube_vert,fragmentShader:K.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:K.cube_vert,fragmentShader:K.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:K.equirect_vert,fragmentShader:K.equirect_frag},distance:{uniforms:la([q.common,q.displacementmap,{referencePosition:{value:new V},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:K.distance_vert,fragmentShader:K.distance_frag},shadow:{uniforms:la([q.lights,q.fog,{color:{value:new U(0)},opacity:{value:1}}]),vertexShader:K.shadow_vert,fragmentShader:K.shadow_frag}};Mo.physical={uniforms:la([Mo.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new H},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new H},clearcoatNormalScale:{value:new B(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new H},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new H},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new H},sheen:{value:0},sheenColor:{value:new U(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new H},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new H},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new H},transmissionSamplerSize:{value:new B},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new H},attenuationDistance:{value:0},attenuationColor:{value:new U(0)},specularColor:{value:new U(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new H},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new H},anisotropyVector:{value:new B},anisotropyMap:{value:null},anisotropyMapTransform:{value:new H}}]),vertexShader:K.meshphysical_vert,fragmentShader:K.meshphysical_frag};var No={r:0,b:0,g:0},Po=new tn,Fo=new H;Fo.set(-1,0,0,0,1,0,0,0,1);function Io(e,t,n,r,i,a){let o=new U(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new ri(new Ti(1,1,1),new ga({name:`BackgroundCubeMaterial`,uniforms:ca(Mo.backgroundCube.uniforms),vertexShader:Mo.backgroundCube.vertexShader,fragmentShader:Mo.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Po.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Fo),l.material.toneMapped=zt.getTransfer(i.colorSpace)!==Ge,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new ri(new aa(2,2),new ga({name:`BackgroundMaterial`,uniforms:ca(Mo.background.uniforms),vertexShader:Mo.background.vertexShader,fragmentShader:Mo.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=zt.getTransfer(i.colorSpace)!==Ge,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(No,fa(e)),n.buffers.color.setClear(No.r,No.g,No.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function Lo(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Ro(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function zo(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(L(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&L(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function Bo(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Lr,s=new H,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var Vo=4,Ho=6,Uo=20,Wo=256,Go=new io,Ko=new U,qo=null,Jo=0,Yo=0,Xo=!1,Zo=new V,Qo=new V,$o=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Zo}=i;qo=this._renderer.getRenderTarget(),Jo=this._renderer.getActiveCubeFace(),Yo=this._renderer.getActiveMipmapLevel(),Xo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=os(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=as(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(qo,Jo,Yo),this._renderer.xr.enabled=Xo,e.scissorTest=!1,ns(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),qo=this._renderer.getRenderTarget(),Jo=this._renderer.getActiveCubeFace(),Yo=this._renderer.getActiveMipmapLevel(),Xo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:l,minFilter:l,generateMipmaps:!1,type:y,format:D,colorSpace:Ue,depthBuffer:!1},r=ts(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ts(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=es(r)),this._blurMaterial=is(r,e,t),this._ggxMaterial=rs(r,e,t)}return r}_compileMaterial(e){let t=new ri(new Nr,e);this._renderer.compile(t,Go)}_sceneToCubeUV(e,t,n,r,i){let a=new to(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(Ko),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ri(new Ti,new Gr({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(Ko),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;ns(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=os()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=as());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;ns(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,Go)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-Vo?n-d+Vo:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,ns(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,Go),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,ns(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,Go)}_blur(e,t,n,r){let i=this._pingPongRenderTarget,a=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,i,t,n,a),this._blurPass(i,e,n,n,a)}_blurPass(e,t,n,r,i){let a=this._renderer,o=this._blurMaterial,s=this._lodMeshes[r];s.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=i,c.mipInt.value=this._lodMax-n;let l=this._sizeLods[r];ns(t,3*l*(r>this._lodMax-Vo?r-this._lodMax+Vo:0),4*(this._cubeSize-l),3*l,2*l),a.setRenderTarget(t),a.render(s,Go)}};function es(e){let t=[],n=[],r=e,i=e-Vo+1+Ho;for(let e=0;e<i;e++){let e=2**r;t.push(e);let i=1/(e-2),a=-i,o=1+i,s=[a,a,o,a,o,o,a,a,o,o,a,o],c=new Float32Array(108),l=new Float32Array(108);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];c.set(r,18*e);for(let t=0;t<6;t++){let n=s[t*2]*2-1,r=s[t*2+1]*2-1;e===0?Qo.set(1,r,n):e===1?Qo.set(-n,1,-r):e===2?Qo.set(-n,r,1):e===3?Qo.set(-1,r,-n):e===4?Qo.set(-n,-1,r):Qo.set(n,r,-1),Qo.toArray(l,(e*6+t)*3)}}let u=new Nr;u.setAttribute(`position`,new vr(c,3)),u.setAttribute(`outputDirection`,new vr(l,3)),n.push(new ri(u,null)),r>Vo&&r--}return{lodMeshes:n,sizeLods:t}}function ts(e,t,n){let r=new Qt(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function ns(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function rs(e,t,n){return new ga({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:Wo,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:ss(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function is(e,t,n){return new ga({name:`SphericalGaussianBlur`,defines:{SAMPLES:Uo,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:ss(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function as(){return new ga({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:ss(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function os(){return new ga({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ss(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function ss(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var cs=class extends Qt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new bi(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Ti(5,5,5),i=new ga({name:`CubemapFromEquirect`,uniforms:ca(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new ri(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=l),new lo(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function ls(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new cs(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new $o(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new $o(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function us(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&nt(`WebGLRenderer: `+e+` extension not supported.`),t}}}function ds(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?br:yr)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function fs(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function ps(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:R(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function ms(e,t,n){let r=new WeakMap,i=new Xt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new $t(h,p,m,u);g.type=v,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new B(p,m)},r.set(o,d);function y(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function hs(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var gs={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function _s(e,t,n,r,i,a){let o=new Qt(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=new Nr;l.setAttribute(`position`,new xr([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute(`uv`,new xr([0,2,0,0,2,0],2));let u=new _a({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new ri(l,u),f=new io(-1,1,1,-1,0,1),p=null,m=null,h=!1,g,_=null,v=[],b=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<v.length;n++){let r=v[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){v=e,b=v.length>0&&v[0].isRenderPass===!0;let t=o.width,n=o.height;v.length>0&&s===null&&(s=new Qt(t,n,{type:y,depthBuffer:!1,stencilBuffer:!1}),c=new Qt(t,n,{type:y,depthBuffer:!1,stencilBuffer:!1}));for(let e=0;e<v.length;e++){let r=v[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(h||e.toneMapping===0&&v.length===0)return!1;if(_=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return b===!1&&e.setRenderTarget(o),g=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return b},this.end=function(e,t){e.toneMapping=g,h=!0;let n=o,r=s;for(let i=0;i<v.length;i++){let a=v[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(p!==e.outputColorSpace||m!==e.toneMapping){p=e.outputColorSpace,m=e.toneMapping,u.defines={},zt.getTransfer(p)===`srgb`&&(u.defines.SRGB_TRANSFER=``);let t=gs[m];t&&(u.defines[t]=``),u.needsUpdate=!0}u.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(_),e.render(d,f),_=null,h=!1},this.isCompositing=function(){return h},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var vs=new Yt,ys=new Si(1,1),bs=new $t,xs=new en,Ss=new bi,Cs=[],ws=[],Ts=new Float32Array(16),Es=new Float32Array(9),Ds=new Float32Array(4);function Os(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Cs[i];if(a===void 0&&(a=new Float32Array(i),Cs[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function ks(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function As(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function js(e,t){let n=ws[t];n===void 0&&(n=new Int32Array(t),ws[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Ms(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Ns(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(ks(n,t))return;e.uniform2fv(this.addr,t),As(n,t)}}function Ps(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(ks(n,t))return;e.uniform3fv(this.addr,t),As(n,t)}}function Fs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(ks(n,t))return;e.uniform4fv(this.addr,t),As(n,t)}}function Is(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(ks(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),As(n,t)}else{if(ks(n,r))return;Ds.set(r),e.uniformMatrix2fv(this.addr,!1,Ds),As(n,r)}}function Ls(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(ks(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),As(n,t)}else{if(ks(n,r))return;Es.set(r),e.uniformMatrix3fv(this.addr,!1,Es),As(n,r)}}function Rs(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(ks(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),As(n,t)}else{if(ks(n,r))return;Ts.set(r),e.uniformMatrix4fv(this.addr,!1,Ts),As(n,r)}}function zs(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Bs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(ks(n,t))return;e.uniform2iv(this.addr,t),As(n,t)}}function Vs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(ks(n,t))return;e.uniform3iv(this.addr,t),As(n,t)}}function Hs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(ks(n,t))return;e.uniform4iv(this.addr,t),As(n,t)}}function Us(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Ws(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(ks(n,t))return;e.uniform2uiv(this.addr,t),As(n,t)}}function Gs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(ks(n,t))return;e.uniform3uiv(this.addr,t),As(n,t)}}function Ks(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(ks(n,t))return;e.uniform4uiv(this.addr,t),As(n,t)}}function qs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(ys.compareFunction=n.isReversedDepthBuffer()?518:515,a=ys):a=vs,n.setTexture2D(t||a,i)}function Js(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||xs,i)}function Ys(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Ss,i)}function Xs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||bs,i)}function Zs(e){switch(e){case 5126:return Ms;case 35664:return Ns;case 35665:return Ps;case 35666:return Fs;case 35674:return Is;case 35675:return Ls;case 35676:return Rs;case 5124:case 35670:return zs;case 35667:case 35671:return Bs;case 35668:case 35672:return Vs;case 35669:case 35673:return Hs;case 5125:return Us;case 36294:return Ws;case 36295:return Gs;case 36296:return Ks;case 35678:case 36198:case 36298:case 36306:case 35682:return qs;case 35679:case 36299:case 36307:return Js;case 35680:case 36300:case 36308:case 36293:return Ys;case 36289:case 36303:case 36311:case 36292:return Xs}}function Qs(e,t){e.uniform1fv(this.addr,t)}function $s(e,t){let n=Os(t,this.size,2);e.uniform2fv(this.addr,n)}function ec(e,t){let n=Os(t,this.size,3);e.uniform3fv(this.addr,n)}function tc(e,t){let n=Os(t,this.size,4);e.uniform4fv(this.addr,n)}function nc(e,t){let n=Os(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function rc(e,t){let n=Os(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function ic(e,t){let n=Os(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function ac(e,t){e.uniform1iv(this.addr,t)}function oc(e,t){e.uniform2iv(this.addr,t)}function sc(e,t){e.uniform3iv(this.addr,t)}function cc(e,t){e.uniform4iv(this.addr,t)}function lc(e,t){e.uniform1uiv(this.addr,t)}function uc(e,t){e.uniform2uiv(this.addr,t)}function dc(e,t){e.uniform3uiv(this.addr,t)}function fc(e,t){e.uniform4uiv(this.addr,t)}function pc(e,t,n){let r=this.cache,i=t.length,a=js(n,i);ks(r,a)||(e.uniform1iv(this.addr,a),As(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?ys:vs;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function mc(e,t,n){let r=this.cache,i=t.length,a=js(n,i);ks(r,a)||(e.uniform1iv(this.addr,a),As(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||xs,a[e])}function hc(e,t,n){let r=this.cache,i=t.length,a=js(n,i);ks(r,a)||(e.uniform1iv(this.addr,a),As(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Ss,a[e])}function gc(e,t,n){let r=this.cache,i=t.length,a=js(n,i);ks(r,a)||(e.uniform1iv(this.addr,a),As(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||bs,a[e])}function _c(e){switch(e){case 5126:return Qs;case 35664:return $s;case 35665:return ec;case 35666:return tc;case 35674:return nc;case 35675:return rc;case 35676:return ic;case 5124:case 35670:return ac;case 35667:case 35671:return oc;case 35668:case 35672:return sc;case 35669:case 35673:return cc;case 5125:return lc;case 36294:return uc;case 36295:return dc;case 36296:return fc;case 35678:case 36198:case 36298:case 36306:case 35682:return pc;case 35679:case 36299:case 36307:return mc;case 35680:case 36300:case 36308:case 36293:return hc;case 36289:case 36303:case 36311:case 36292:return gc}}var vc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Zs(t.type)}},yc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=_c(t.type)}},bc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},xc=/(\w+)(\])?(\[|\.)?/g;function Sc(e,t){e.seq.push(t),e.map[t.id]=t}function Cc(e,t,n){let r=e.name,i=r.length;for(xc.lastIndex=0;;){let a=xc.exec(r),o=xc.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Sc(n,l===void 0?new vc(s,e,t):new yc(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new bc(s),Sc(n,e)),n=e}}}var wc=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Cc(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Tc(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Ec=37297,Dc=0;function Oc(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var kc=new H;function Ac(e){zt._getMatrix(kc,zt.workingColorSpace,e);let t=`mat3( ${kc.elements.map(e=>e.toFixed(4))} )`;switch(zt.getTransfer(e)){case We:return[t,`LinearTransferOETF`];case Ge:return[t,`sRGBTransferOETF`];default:return L(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function jc(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Oc(e.getShaderSource(t),r)}return i}function Mc(e,t){let n=Ac(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var Nc={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Pc(e,t){let n=Nc[t];return n===void 0?(L(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Fc=new V;function Ic(){return zt.getLuminanceCoefficients(Fc),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Fc.x.toFixed(4)}, ${Fc.y.toFixed(4)}, ${Fc.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Lc(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Bc).join(`
`)}function Rc(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function zc(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Bc(e){return e!==``}function Vc(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Hc(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Uc=/^[ \t]*#include +<([\w\d./]+)>/gm;function Wc(e){return e.replace(Uc,Kc)}var Gc=new Map;function Kc(e,t){let n=K[t];if(n===void 0){let e=Gc.get(t);if(e!==void 0)n=K[e],L(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`)}return Wc(n)}var qc=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Jc(e){return e.replace(qc,Yc)}function Yc(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Xc(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var Zc={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function Qc(e){return Zc[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var $c={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function el(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:$c[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var tl={302:`ENVMAP_MODE_REFRACTION`};function nl(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:tl[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var rl={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function il(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:rl[e.combine]||`ENVMAP_BLENDING_NONE`}function al(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function ol(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Qc(n),l=el(n),u=nl(n),d=il(n),f=al(n),p=Lc(n),m=Rc(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Bc).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Bc).join(`
`),_.length>0&&(_+=`
`)):(g=[Xc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Bc).join(`
`),_=[Xc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:K.tonemapping_pars_fragment,n.toneMapping===0?``:Pc(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,K.colorspace_pars_fragment,Mc(`linearToOutputTexel`,n.outputColorSpace),Ic(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Bc).join(`
`)),o=Wc(o),o=Vc(o,n),o=Hc(o,n),s=Wc(s),s=Vc(s,n),s=Hc(s,n),o=Jc(o),s=Jc(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Tc(i,i.VERTEX_SHADER,y),S=Tc(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=jc(i,x,`vertex`),n=jc(i,S,`fragment`);R(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):L(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new wc(i,h),T=zc(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Ec)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Dc++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var sl=0,cl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new ll(e),t.set(e,n)),n}},ll=class{constructor(e){this.id=sl++,this.code=e,this.usedTimes=0}};function ul(e){return e===1030||e===37490||e===36285}function dl(e,t,n,r,i,a){let o=new pn,s=new cl,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&L(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=Mo[C];D=e.vertexShader,O=e.fragmentShader}else{D=i.vertexShader,O=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),k=e.id,A=t.id}let ee=e.getRenderTarget(),te=e.state.buffers.depth.getReversed(),ne=h.isInstancedMesh===!0,j=h.isBatchedMesh===!0,re=!!i.map,M=!!i.matcap,ie=!!x,ae=!!i.aoMap,oe=!!i.lightMap,se=!!i.bumpMap&&i.wireframe===!1,ce=!!i.normalMap,le=!!i.displacementMap,ue=!!i.emissiveMap,N=!!i.metalnessMap,de=!!i.roughnessMap,fe=i.anisotropy>0,pe=i.clearcoat>0,me=i.dispersion>0,he=i.retroreflectivity>0,ge=i.iridescence>0,_e=i.sheen>0,ve=i.transmission>0,ye=fe&&!!i.anisotropyMap,be=pe&&!!i.clearcoatMap,xe=pe&&!!i.clearcoatNormalMap,Se=pe&&!!i.clearcoatRoughnessMap,Ce=ge&&!!i.iridescenceMap,we=ge&&!!i.iridescenceThicknessMap,Te=_e&&!!i.sheenColorMap,Ee=_e&&!!i.sheenRoughnessMap,De=!!i.specularMap,Oe=!!i.specularColorMap,ke=!!i.specularIntensityMap,Ae=ve&&!!i.transmissionMap,je=ve&&!!i.thicknessMap,Me=!!i.gradientMap,Ne=!!i.alphaMap,Pe=i.alphaTest>0,P=!!i.alphaHash,Fe=!!i.extensions,Ie=0;i.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(Ie=e.toneMapping);let Le={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:O,defines:i.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:j,batchingColor:j&&h._colorsTexture!==null,instancing:ne,instancingColor:ne&&h.instanceColor!==null,instancingMorph:ne&&h.morphTexture!==null,outputColorSpace:ee===null?e.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:zt.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:re,matcap:M,envMap:ie,envMapMode:ie&&x.mapping,envMapCubeUVHeight:S,aoMap:ae,lightMap:oe,bumpMap:se,normalMap:ce,displacementMap:le,emissiveMap:ue,normalMapObjectSpace:ce&&i.normalMapType===1,normalMapTangentSpace:ce&&i.normalMapType===0,packedNormalMap:ce&&i.normalMapType===0&&ul(i.normalMap.format),metalnessMap:N,roughnessMap:de,anisotropy:fe,anisotropyMap:ye,clearcoat:pe,clearcoatMap:be,clearcoatNormalMap:xe,clearcoatRoughnessMap:Se,dispersion:me,retroreflection:he,iridescence:ge,iridescenceMap:Ce,iridescenceThicknessMap:we,sheen:_e,sheenColorMap:Te,sheenRoughnessMap:Ee,specularMap:De,specularColorMap:Oe,specularIntensityMap:ke,transmission:ve,transmissionMap:Ae,thicknessMap:je,gradientMap:Me,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Ne,alphaTest:Pe,alphaHash:P,combine:i.combine,mapUv:re&&m(i.map.channel),aoMapUv:ae&&m(i.aoMap.channel),lightMapUv:oe&&m(i.lightMap.channel),bumpMapUv:se&&m(i.bumpMap.channel),normalMapUv:ce&&m(i.normalMap.channel),displacementMapUv:le&&m(i.displacementMap.channel),emissiveMapUv:ue&&m(i.emissiveMap.channel),metalnessMapUv:N&&m(i.metalnessMap.channel),roughnessMapUv:de&&m(i.roughnessMap.channel),anisotropyMapUv:ye&&m(i.anisotropyMap.channel),clearcoatMapUv:be&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:xe&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Se&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:Ce&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:we&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:Te&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:Ee&&m(i.sheenRoughnessMap.channel),specularMapUv:De&&m(i.specularMap.channel),specularColorMapUv:Oe&&m(i.specularColorMap.channel),specularIntensityMapUv:ke&&m(i.specularIntensityMap.channel),transmissionMapUv:Ae&&m(i.transmissionMap.channel),thicknessMapUv:je&&m(i.thicknessMap.channel),alphaMapUv:Ne&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(ce||fe),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(re||Ne),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&ce===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:te,skinning:h.isSkinnedMesh===!0,hasPositionAttribute:v.attributes.position!==void 0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ie,decodeVideoTexture:re&&i.map.isVideoTexture===!0&&zt.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ue&&i.emissiveMap.isVideoTexture===!0&&zt.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Fe&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Fe&&i.extensions.multiDraw===!0||j)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Le.vertexUv1s=c.has(1),Le.vertexUv2s=c.has(2),Le.vertexUv3s=c.has(3),c.clear(),Le}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=Mo[t];n=pa.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new ol(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function fl(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function pl(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function ml(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function hl(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||pl),r.length>1&&r.sort(t||ml),i.length>1&&i.sort(t||ml)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function gl(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new hl,e.set(t,[i])):n>=r.length?(i=new hl,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function _l(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new V,color:new U};break;case`SpotLight`:n={position:new V,direction:new V,color:new U,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new V,color:new U,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new V,skyColor:new U,groundColor:new U};break;case`RectAreaLight`:n={color:new U,position:new V,halfWidth:new V,halfHeight:new V}}return e[t.id]=n,n}}}function vl(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var yl=0;function bl(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function xl(e){let t=new _l,n=vl(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new V);let i=new V,a=new tn,o=new tn;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(bl);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=q.LTC_FLOAT_1,r.rectAreaLTC2=q.LTC_FLOAT_2):(r.rectAreaLTC1=q.LTC_HALF_1,r.rectAreaLTC2=q.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=yl++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function Sl(e){let t=new xl(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function Cl(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Sl(e),t.set(n,[a])):r>=i.length?(a=new Sl(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var wl=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Tl=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,El=[new V(1,0,0),new V(-1,0,0),new V(0,1,0),new V(0,-1,0),new V(0,0,1),new V(0,0,-1)],Dl=[new V(0,-1,0),new V(0,-1,0),new V(0,0,1),new V(0,0,-1),new V(0,-1,0),new V(0,-1,0)],Ol=new tn,kl=new V,Al=new V;function jl(e,t,n){let r=new yi,i=new B,a=new B,s=new Xt,c=new xa,u=new Sa,d={},f=n.maxTextureSize,p={0:1,1:0,2:2},m=new ga({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new B},radius:{value:4}},vertexShader:wl,fragmentShader:Tl}),h=m.clone();h.defines.HORIZONTAL_PASS=1;let g=new Nr;g.setAttribute(`position`,new vr(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new ri(g,m),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let S=this.type;this.render=function(t,n,c){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||t.length===0)return;this.type===2&&(L(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.state;m.setBlending(0),m.buffers.depth.getReversed()===!0?m.buffers.color.setClear(0,0,0,0):m.buffers.color.setClear(1,1,1,1),m.buffers.depth.setTest(!0),m.setScissorTest(!1);let h=S!==this.type;h&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let u=0,d=t.length;u<d;u++){let d=t[u],p=d.shadow;if(p===void 0){L(`WebGLShadowMap:`,d,`has no shadow.`);continue}if(p.autoUpdate===!1&&p.needsUpdate===!1)continue;i.copy(p.mapSize);let g=p.getFrameExtents();i.multiply(g),a.copy(p.mapSize),(i.x>f||i.y>f)&&(i.x>f&&(a.x=Math.floor(f/g.x),i.x=a.x*g.x,p.mapSize.x=a.x),i.y>f&&(a.y=Math.floor(f/g.y),i.y=a.y*g.y,p.mapSize.y=a.y));let b=e.state.buffers.depth.getReversed();if(p.camera._reversedDepth=b,p.map===null||h===!0){if(p.map!==null&&(p.map.depthTexture!==null&&(p.map.depthTexture.dispose(),p.map.depthTexture=null),p.map.dispose()),this.type===3){if(d.isPointLight){L(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}p.map=new Qt(i.x,i.y,{format:te,type:y,minFilter:l,magFilter:l,generateMipmaps:!1}),p.map.texture.name=d.name+`.shadowMap`,p.map.depthTexture=new Si(i.x,i.y,v),p.map.depthTexture.name=d.name+`.shadowMapDepth`,p.map.depthTexture.format=O,p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=o,p.map.depthTexture.magFilter=o}else d.isPointLight?(p.map=new cs(i.x),p.map.depthTexture=new Ci(i.x,_)):(p.map=new Qt(i.x,i.y),p.map.depthTexture=new Si(i.x,i.y,_)),p.map.depthTexture.name=d.name+`.shadowMap`,p.map.depthTexture.format=O,this.type===1?(p.map.depthTexture.compareFunction=b?518:515,p.map.depthTexture.minFilter=l,p.map.depthTexture.magFilter=l):(p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=o,p.map.depthTexture.magFilter=o);p.camera.updateProjectionMatrix()}p.map.isWebGLCubeRenderTarget!==!0&&(p.map.width!==i.x||p.map.height!==i.y)&&p.map.setSize(i.x,i.y);let x=p.map.isWebGLCubeRenderTarget?6:p.getViewportCount();d.isPointLight!==!0&&p.updateMatrices(d,c);for(let t=0;t<x;t++){let i=p.getCamera(t);if(d.isPointLight){let e=p.camera,n=p.matrix,r=d.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),kl.setFromMatrixPosition(d.matrixWorld),e.position.copy(kl),Al.copy(e.position),Al.add(El[t]),e.up.copy(Dl[t]),e.lookAt(Al),e.updateMatrixWorld(),n.makeTranslation(-kl.x,-kl.y,-kl.z),Ol.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),p._frustum.setFromProjectionMatrix(Ol,e.coordinateSystem,e.reversedDepth)}if(p.map.isWebGLCubeRenderTarget)e.setRenderTarget(p.map,t),e.clear();else{t===0&&(e.setRenderTarget(p.map),e.clear());let n=p.getViewport(t);s.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),m.viewport(s)}r=p.getFrustum(t),T(n,c,i,d,this.type)}p.isPointLightShadow!==!0&&this.type===3&&C(p,c),p.needsUpdate=!1}S=this.type,x.needsUpdate=!1,e.setRenderTarget(u,d,p)};function C(n,r){let a=t.update(b);m.defines.VSM_SAMPLES!==n.blurSamples&&(m.defines.VSM_SAMPLES=n.blurSamples,h.defines.VSM_SAMPLES=n.blurSamples,m.needsUpdate=!0,h.needsUpdate=!0),n.mapPass===null?n.mapPass=new Qt(i.x,i.y,{format:te,type:y}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),m.uniforms.shadow_pass.value=n.map.depthTexture,m.uniforms.resolution.value.set(n.map.width,n.map.height),m.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,m,b,null),h.uniforms.shadow_pass.value=n.mapPass.texture,h.uniforms.resolution.value.set(n.map.width,n.map.height),h.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,h,b,null)}function w(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?u:c,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=d[e];r===void 0&&(r={},d[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,E)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?p[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function T(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=w(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=w(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)T(c[e],i,a,o,s)}function E(e){e.target.removeEventListener(`dispose`,E);for(let t in d){let n=d[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Ml(e,t){function n(){let t=!1,n=new Xt,r=null,i=new Xt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?N(e.DEPTH_TEST):de(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=it[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?N(e.STENCIL_TEST):de(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new U(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,ee=null,te=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),ne=!1,j=0,re=e.getParameter(e.VERSION);re.indexOf(`WebGL`)===-1?re.indexOf(`OpenGL ES`)!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),ne=j>=2):(j=parseFloat(/^WebGL (\d)/.exec(re)[1]),ne=j>=1);let M=null,ie={},ae=e.getParameter(e.SCISSOR_BOX),oe=e.getParameter(e.VIEWPORT),se=new Xt().fromArray(ae),ce=new Xt().fromArray(oe);function le(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ue={};ue[e.TEXTURE_2D]=le(e.TEXTURE_2D,e.TEXTURE_2D,1),ue[e.TEXTURE_CUBE_MAP]=le(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ue[e.TEXTURE_2D_ARRAY]=le(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ue[e.TEXTURE_3D]=le(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),N(e.DEPTH_TEST),o.setFunc(3),ye(!1),be(1),N(e.CULL_FACE),_e(0);function N(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function de(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function fe(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function pe(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function me(t){return h!==t&&(e.useProgram(t),h=t,!0)}let he={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};he[103]=e.MIN,he[104]=e.MAX;let ge={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function _e(t,n,r,i,a,o,s,c,l,u){if(t===0){g===!0&&(de(e.BLEND),g=!1);return}if(g===!1&&(N(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:R(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:R(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:R(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:R(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}return}a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(he[n],he[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(ge[r],ge[i],ge[o],ge[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function ve(t,n){t.side===2?de(e.CULL_FACE):N(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ye(r),t.blending===1&&t.transparent===!1?_e(0):_e(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),Se(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?N(e.SAMPLE_ALPHA_TO_COVERAGE):de(e.SAMPLE_ALPHA_TO_COVERAGE)}function ye(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function be(t){t===0?de(e.CULL_FACE):(N(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function xe(t){t!==k&&(ne&&e.lineWidth(t),k=t)}function Se(t,n,r){t?(N(e.POLYGON_OFFSET_FILL),(A!==n||ee!==r)&&(A=n,ee=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):de(e.POLYGON_OFFSET_FILL)}function Ce(t){t?N(e.SCISSOR_TEST):de(e.SCISSOR_TEST)}function we(t){t===void 0&&(t=e.TEXTURE0+te-1),M!==t&&(e.activeTexture(t),M=t)}function Te(t,n,r){r===void 0&&(r=M===null?e.TEXTURE0+te-1:M);let i=ie[r];i===void 0&&(i={type:void 0,texture:void 0},ie[r]=i),(i.type!==t||i.texture!==n)&&(M!==r&&(e.activeTexture(r),M=r),e.bindTexture(t,n||ue[t]),i.type=t,i.texture=n)}function Ee(){let t=ie[M];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function De(){try{e.compressedTexImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Oe(){try{e.compressedTexImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function ke(){try{e.texSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ae(){try{e.texSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function je(){try{e.compressedTexSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Me(){try{e.compressedTexSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ne(){try{e.texStorage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Pe(){try{e.texStorage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function P(){try{e.texImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Fe(){try{e.texImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ie(t){return d[t]===void 0?e.getParameter(t):d[t]}function Le(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function F(t){se.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),se.copy(t))}function Re(t){ce.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ce.copy(t))}function I(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function ze(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Be(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},M=null,ie={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new U(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,ee=null,se.set(0,0,e.canvas.width,e.canvas.height),ce.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:N,disable:de,bindFramebuffer:fe,drawBuffers:pe,useProgram:me,setBlending:_e,setMaterial:ve,setFlipSided:ye,setCullFace:be,setLineWidth:xe,setPolygonOffset:Se,setScissorTest:Ce,activeTexture:we,bindTexture:Te,unbindTexture:Ee,compressedTexImage2D:De,compressedTexImage3D:Oe,texImage2D:P,texImage3D:Fe,pixelStorei:Le,getParameter:Ie,updateUBOMapping:I,uniformBlockBinding:ze,texStorage2D:Ne,texStorage3D:Pe,texSubImage2D:ke,texSubImage3D:Ae,compressedTexSubImage2D:je,compressedTexSubImage3D:Me,scissor:F,viewport:Re,reset:Be}}function Nl(e,t,n,f,p,m,h){let g=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,_=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),v=new B,y=new WeakMap,b=new Set,x,S=new WeakMap,C=!1;try{C=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function w(e,t){return C?new OffscreenCanvas(e,t):Ze(`canvas`)}function T(e,t,n){let r=1,i=Ie(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);x===void 0&&(x=w(n,a));let o=t?w(n,a):x;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),L(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&L(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function E(e){return e.generateMipmaps}function D(t){e.generateMipmap(t)}function O(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function A(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];L(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||L(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?We:zt.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function ee(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,L(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function te(e,t){return E(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function ne(e){let t=e.target;t.removeEventListener(`dispose`,ne),re(t),t.isVideoTexture&&y.delete(t),t.isHTMLTexture&&b.delete(t)}function j(e){let t=e.target;t.removeEventListener(`dispose`,j),ie(t)}function re(e){let t=f.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=S.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&M(e),Object.keys(r).length===0&&S.delete(n)}f.remove(e)}function M(t){let n=f.get(t);e.deleteTexture(n.__webglTexture);let r=t.source,i=S.get(r);delete i[n.__cacheKey],h.memory.textures--}function ie(t){let n=f.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),f.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let r=t.textures;for(let t=0,n=r.length;t<n;t++){let n=f.get(r[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),h.memory.textures--),f.remove(r[t])}f.remove(t)}let ae=0;function oe(){ae=0}function se(){return ae}function ce(e){ae=e}function le(){let e=ae;return e>=p.maxTextures&&L(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+p.maxTextures),ae+=1,e}function ue(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function N(t,r){let i=f.get(t);if(t.isVideoTexture&&P(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&i.__version!==t.version){let e=t.image;if(e===null)L(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)L(`WebGLRenderer: Texture marked for update but image is incomplete`);else{xe(i,t,r);return}}else t.isExternalTexture&&(i.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,i.__webglTexture,e.TEXTURE0+r)}function de(t,r){let i=f.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&i.__version!==t.version){xe(i,t,r);return}t.isExternalTexture&&(i.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,i.__webglTexture,e.TEXTURE0+r)}function fe(t,r){let i=f.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&i.__version!==t.version){xe(i,t,r);return}n.bindTexture(e.TEXTURE_3D,i.__webglTexture,e.TEXTURE0+r)}function pe(t,r){let i=f.get(t);if(t.isCubeDepthTexture!==!0&&t.version>0&&i.__version!==t.version){Se(i,t,r);return}n.bindTexture(e.TEXTURE_CUBE_MAP,i.__webglTexture,e.TEXTURE0+r)}let me={[r]:e.REPEAT,[i]:e.CLAMP_TO_EDGE,[a]:e.MIRRORED_REPEAT},he={[o]:e.NEAREST,[s]:e.NEAREST_MIPMAP_NEAREST,[c]:e.NEAREST_MIPMAP_LINEAR,[l]:e.LINEAR,[u]:e.LINEAR_MIPMAP_NEAREST,[d]:e.LINEAR_MIPMAP_LINEAR},ge={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function _e(n,r){if(r.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(r.magFilter===1006||r.magFilter===1007||r.magFilter===1005||r.magFilter===1008||r.minFilter===1006||r.minFilter===1007||r.minFilter===1005||r.minFilter===1008)&&L(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,me[r.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,me[r.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,me[r.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,he[r.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,he[r.minFilter]),r.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,ge[r.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(r.magFilter===1003||r.minFilter!==1005&&r.minFilter!==1008||r.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(r.anisotropy>1||f.get(r).__currentAnisotropy){let i=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,i.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(r.anisotropy,p.getMaxAnisotropy())),f.get(r).__currentAnisotropy=r.anisotropy}}}function ve(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,ne));let i=n.source,a=S.get(i);a===void 0&&(a={},S.set(i,a));let o=ue(n);if(o!==t.__cacheKey){a[o]===void 0&&(a[o]={texture:e.createTexture(),usedTimes:0},h.memory.textures++,r=!0),a[o].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&M(n)),t.__cacheKey=o,t.__webglTexture=a[o].texture}return r}function ye(e,t,n){return Math.floor(Math.floor(e/n)/t)}function be(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=ye(n.start,r.width,4),c=ye(t.start,r.width,4);n.start<=i+1&&a===c&&ye(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function xe(t,r,i){let a=e.TEXTURE_2D;(r.isDataArrayTexture||r.isCompressedArrayTexture)&&(a=e.TEXTURE_2D_ARRAY),r.isData3DTexture&&(a=e.TEXTURE_3D);let o=ve(t,r),s=r.source;n.bindTexture(a,t.__webglTexture,e.TEXTURE0+i);let c=f.get(s);if(s.version!==c.__version||o===!0){if(n.activeTexture(e.TEXTURE0+i),!(typeof ImageBitmap<`u`&&r.image instanceof ImageBitmap)){let t=zt.getPrimaries(zt.workingColorSpace),i=r.colorSpace===``?null:zt.getPrimaries(r.colorSpace),a=r.colorSpace===``||t===i?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,r.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,r.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,a)}n.pixelStorei(e.UNPACK_ALIGNMENT,r.unpackAlignment);let t=T(r.image,!1,p.maxTextureSize);t=Fe(r,t);let l=m.convert(r.format,r.colorSpace),u=m.convert(r.type),d=A(r.internalFormat,l,u,r.normalized,r.colorSpace,r.isVideoTexture);_e(a,r);let f,h=r.mipmaps,g=r.isVideoTexture!==!0,_=c.__version===void 0||o===!0,v=s.dataReady,y=te(r,t);if(r.isDepthTexture)d=ee(r.format===k,r.type),_&&(g?n.texStorage2D(e.TEXTURE_2D,1,d,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,d,t.width,t.height,0,l,u,null));else if(r.isDataTexture){if(h.length>0){g&&_&&n.texStorage2D(e.TEXTURE_2D,y,d,h[0].width,h[0].height);for(let t=0,r=h.length;t<r;t++)f=h[t],g?v&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,l,u,f.data):n.texImage2D(e.TEXTURE_2D,t,d,f.width,f.height,0,l,u,f.data);r.generateMipmaps=!1}else g?(_&&n.texStorage2D(e.TEXTURE_2D,y,d,t.width,t.height),v&&be(r,t,l,u)):n.texImage2D(e.TEXTURE_2D,0,d,t.width,t.height,0,l,u,t.data)}else if(r.isCompressedTexture){if(r.isCompressedArrayTexture){g&&_&&n.texStorage3D(e.TEXTURE_2D_ARRAY,y,d,h[0].width,h[0].height,t.depth);for(let i=0,a=h.length;i<a;i++)if(f=h[i],r.format!==1023){if(l!==null){if(g){if(v){if(r.layerUpdates.size>0){let t=Oo(f.width,f.height,r.format,r.type);for(let a of r.layerUpdates){let r=f.data.subarray(a*t/f.data.BYTES_PER_ELEMENT,(a+1)*t/f.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,f.width,f.height,1,l,r)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,f.width,f.height,t.depth,l,f.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,d,f.width,f.height,t.depth,0,f.data,0,0)}else L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else g?v&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,f.width,f.height,t.depth,l,u,f.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,d,f.width,f.height,t.depth,0,l,u,f.data);r.layerUpdates.size>0&&r.clearLayerUpdates()}else{g&&_&&n.texStorage2D(e.TEXTURE_2D,y,d,h[0].width,h[0].height);for(let t=0,i=h.length;t<i;t++)f=h[t],r.format===1023?g?v&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,l,u,f.data):n.texImage2D(e.TEXTURE_2D,t,d,f.width,f.height,0,l,u,f.data):l===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):g?v&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,l,f.data):n.compressedTexImage2D(e.TEXTURE_2D,t,d,f.width,f.height,0,f.data)}}else if(r.isDataArrayTexture){if(g){if(_&&n.texStorage3D(e.TEXTURE_2D_ARRAY,y,d,t.width,t.height,t.depth),v){if(r.layerUpdates.size>0){let i=Oo(t.width,t.height,r.format,r.type);for(let a of r.layerUpdates){let r=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,l,u,r)}r.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,l,u,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,d,t.width,t.height,t.depth,0,l,u,t.data)}else if(r.isData3DTexture)g?(_&&n.texStorage3D(e.TEXTURE_3D,y,d,t.width,t.height,t.depth),v&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,l,u,t.data)):n.texImage3D(e.TEXTURE_3D,0,d,t.width,t.height,t.depth,0,l,u,t.data);else if(r.isFramebufferTexture){if(_){if(g)n.texStorage2D(e.TEXTURE_2D,y,d,t.width,t.height);else{let r=t.width,i=t.height;for(let t=0;t<y;t++)n.texImage2D(e.TEXTURE_2D,t,d,r,i,0,l,u,null),r>>=1,i>>=1}}}else if(r.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),b.add(r),n.onpaint=e=>{let t=e.changedElements;for(let e of b)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(h.length>0){if(g&&_){let t=Ie(h[0]);n.texStorage2D(e.TEXTURE_2D,y,d,t.width,t.height)}for(let t=0,r=h.length;t<r;t++)f=h[t],g?v&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,l,u,f):n.texImage2D(e.TEXTURE_2D,t,d,l,u,f);r.generateMipmaps=!1}else if(g){if(_){let r=Ie(t);n.texStorage2D(e.TEXTURE_2D,y,d,r.width,r.height)}v&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,l,u,t)}else n.texImage2D(e.TEXTURE_2D,0,d,l,u,t);E(r)&&D(a),c.__version=s.version,r.onUpdate&&r.onUpdate(r)}t.__version=r.version}function Se(t,r,i){if(r.image.length!==6)return;let a=ve(t,r),o=r.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+i);let s=f.get(o);if(o.version!==s.__version||a===!0){n.activeTexture(e.TEXTURE0+i);let t=zt.getPrimaries(zt.workingColorSpace),c=r.colorSpace===``?null:zt.getPrimaries(r.colorSpace),l=r.colorSpace===``||t===c?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,r.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,r.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,r.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,l);let u=r.isCompressedTexture||r.image[0].isCompressedTexture,d=r.image[0]&&r.image[0].isDataTexture,f=[];for(let e=0;e<6;e++)!u&&!d?f[e]=T(r.image[e],!0,p.maxCubemapSize):f[e]=d?r.image[e].image:r.image[e],f[e]=Fe(r,f[e]);let h=f[0],g=m.convert(r.format,r.colorSpace),_=m.convert(r.type),v=A(r.internalFormat,g,_,r.normalized,r.colorSpace),y=r.isVideoTexture!==!0,b=s.__version===void 0||a===!0,x=o.dataReady,S=te(r,h);_e(e.TEXTURE_CUBE_MAP,r);let C;if(u){y&&b&&n.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let t=0;t<6;t++){C=f[t].mipmaps;for(let i=0;i<C.length;i++){let a=C[i];r.format===1023?y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,i,0,0,a.width,a.height,g,_,a.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,i,v,a.width,a.height,0,g,_,a.data):g===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,i,0,0,a.width,a.height,g,a.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,i,v,a.width,a.height,0,a.data)}}}else{if(C=r.mipmaps,y&&b){C.length>0&&S++;let t=Ie(f[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,t.width,t.height)}for(let t=0;t<6;t++)if(d){y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,f[t].width,f[t].height,g,_,f[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,f[t].width,f[t].height,0,g,_,f[t].data);for(let r=0;r<C.length;r++){let i=C[r].image[t].image;y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,v,i.width,i.height,0,g,_,i.data)}}else{y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,f[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,g,_,f[t]);for(let r=0;r<C.length;r++){let i=C[r];y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,g,_,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,v,g,_,i.image[t])}}}E(r)&&D(e.TEXTURE_CUBE_MAP),s.__version=o.version,r.onUpdate&&r.onUpdate(r)}t.__version=r.version}function Ce(t,r,i,a,o,s){let c=m.convert(i.format,i.colorSpace),l=m.convert(i.type),u=A(i.internalFormat,c,l,i.normalized,i.colorSpace),d=f.get(r),p=f.get(i);if(p.__renderTarget=r,!d.__hasExternalTextures){let t=Math.max(1,r.width>>s),i=Math.max(1,r.height>>s);o===e.TEXTURE_3D||o===e.TEXTURE_2D_ARRAY?n.texImage3D(o,s,u,t,i,r.depth,0,c,l,null):n.texImage2D(o,s,u,t,i,0,c,l,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),Pe(r)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,a,o,p.__webglTexture,0,Ne(r)):(o===e.TEXTURE_2D||o>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&o<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,a,o,p.__webglTexture,s),n.bindFramebuffer(e.FRAMEBUFFER,null)}function we(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=ee(n.stencilBuffer,a),s=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;Pe(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Ne(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Ne(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,s,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let a=t[i],o=m.convert(a.format,a.colorSpace),s=m.convert(a.type),c=A(a.internalFormat,o,s,a.normalized,a.colorSpace);Pe(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Ne(n),c,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Ne(n),c,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,c,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Te(t,r,i){let a=r.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(r.depthTexture&&r.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let o=f.get(r.depthTexture);if(o.__renderTarget=r,(!o.__webglTexture||r.depthTexture.image.width!==r.width||r.depthTexture.image.height!==r.height)&&(r.depthTexture.image.width=r.width,r.depthTexture.image.height=r.height,r.depthTexture.needsUpdate=!0),a){if(o.__webglInit===void 0&&(o.__webglInit=!0,r.depthTexture.addEventListener(`dispose`,ne)),o.__webglTexture===void 0){o.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,o.__webglTexture),_e(e.TEXTURE_CUBE_MAP,r.depthTexture);let t=m.convert(r.depthTexture.format),i=m.convert(r.depthTexture.type),a;r.depthTexture.format===1026?a=e.DEPTH_COMPONENT24:r.depthTexture.format===1027&&(a=e.DEPTH24_STENCIL8);for(let n=0;n<6;n++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0,a,r.width,r.height,0,t,i,null)}}else N(r.depthTexture,0);let s=o.__webglTexture,c=Ne(r),l=a?e.TEXTURE_CUBE_MAP_POSITIVE_X+i:e.TEXTURE_2D,u=r.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(r.depthTexture.format===1026)Pe(r)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,u,l,s,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,u,l,s,0);else if(r.depthTexture.format===1027)Pe(r)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,u,l,s,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,u,l,s,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function Ee(t){let r=f.get(t),i=t.isWebGLCubeRenderTarget===!0;if(r.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(r.__depthDisposeCallback&&r.__depthDisposeCallback(),e){let t=()=>{delete r.__boundDepthTexture,delete r.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),r.__depthDisposeCallback=t}r.__boundDepthTexture=e}if(t.depthTexture&&!r.__autoAllocateDepthBuffer){if(i)for(let e=0;e<6;e++)Te(r.__webglFramebuffer[e],t,e);else{let e=t.texture.mipmaps;e&&e.length>0?Te(r.__webglFramebuffer[0],t,0):Te(r.__webglFramebuffer,t,0)}}else if(i){r.__webglDepthbuffer=[];for(let i=0;i<6;i++)if(n.bindFramebuffer(e.FRAMEBUFFER,r.__webglFramebuffer[i]),r.__webglDepthbuffer[i]===void 0)r.__webglDepthbuffer[i]=e.createRenderbuffer(),we(r.__webglDepthbuffer[i],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=r.__webglDepthbuffer[i];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let i=t.texture.mipmaps;if(i&&i.length>0?n.bindFramebuffer(e.FRAMEBUFFER,r.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,r.__webglFramebuffer),r.__webglDepthbuffer===void 0)r.__webglDepthbuffer=e.createRenderbuffer(),we(r.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,i=r.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,i),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,i)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function De(t,n,r){let i=f.get(t);n!==void 0&&Ce(i.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),r!==void 0&&Ee(t)}function Oe(t){let r=t.texture,i=f.get(t),a=f.get(r);t.addEventListener(`dispose`,j);let o=t.textures,s=t.isWebGLCubeRenderTarget===!0,c=o.length>1;if(c||(a.__webglTexture===void 0&&(a.__webglTexture=e.createTexture()),a.__version=r.version,h.memory.textures++),s){i.__webglFramebuffer=[];for(let t=0;t<6;t++)if(r.mipmaps&&r.mipmaps.length>0){i.__webglFramebuffer[t]=[];for(let n=0;n<r.mipmaps.length;n++)i.__webglFramebuffer[t][n]=e.createFramebuffer()}else i.__webglFramebuffer[t]=e.createFramebuffer()}else{if(r.mipmaps&&r.mipmaps.length>0){i.__webglFramebuffer=[];for(let t=0;t<r.mipmaps.length;t++)i.__webglFramebuffer[t]=e.createFramebuffer()}else i.__webglFramebuffer=e.createFramebuffer();if(c)for(let t=0,n=o.length;t<n;t++){let n=f.get(o[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),h.memory.textures++)}if(t.samples>0&&Pe(t)===!1){i.__webglMultisampledFramebuffer=e.createFramebuffer(),i.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,i.__webglMultisampledFramebuffer);for(let n=0;n<o.length;n++){let r=o[n];i.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,i.__webglColorRenderbuffer[n]);let a=m.convert(r.format,r.colorSpace),s=m.convert(r.type),c=A(r.internalFormat,a,s,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),l=Ne(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,l,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,i.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(i.__webglDepthRenderbuffer=e.createRenderbuffer(),we(i.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(s){n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture),_e(e.TEXTURE_CUBE_MAP,r);for(let n=0;n<6;n++)if(r.mipmaps&&r.mipmaps.length>0)for(let a=0;a<r.mipmaps.length;a++)Ce(i.__webglFramebuffer[n][a],t,r,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,a);else Ce(i.__webglFramebuffer[n],t,r,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);E(r)&&D(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(c){for(let r=0,a=o.length;r<a;r++){let a=o[r],s=f.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,s.__webglTexture),_e(c,a),Ce(i.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+r,c,0),E(a)&&D(c)}n.unbindTexture()}else{let o=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(o=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(o,a.__webglTexture),_e(o,r),r.mipmaps&&r.mipmaps.length>0)for(let n=0;n<r.mipmaps.length;n++)Ce(i.__webglFramebuffer[n],t,r,e.COLOR_ATTACHMENT0,o,n);else Ce(i.__webglFramebuffer,t,r,e.COLOR_ATTACHMENT0,o,0);E(r)&&D(o),n.unbindTexture()}t.depthBuffer&&Ee(t)}function ke(e){let t=e.textures;for(let r=0,i=t.length;r<i;r++){let i=t[r];if(E(i)){let t=O(e),r=f.get(i).__webglTexture;n.bindTexture(t,r),D(t),n.unbindTexture()}}}let Ae=[],je=[];function Me(t){if(t.samples>0){if(Pe(t)===!1){let r=t.textures,i=t.width,a=t.height,o=e.COLOR_BUFFER_BIT,s=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,c=f.get(t),l=r.length>1;if(l)for(let t=0;t<r.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,c.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,c.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,c.__webglMultisampledFramebuffer);let u=t.texture.mipmaps;u&&u.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,c.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,c.__webglFramebuffer);for(let n=0;n<r.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(o|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(o|=e.STENCIL_BUFFER_BIT)),l){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,c.__webglColorRenderbuffer[n]);let t=f.get(r[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,i,a,0,0,i,a,o,e.NEAREST),_===!0&&(Ae.length=0,je.length=0,Ae.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&(Ae.push(s),je.push(s),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,je)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Ae))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),l)for(let t=0;t<r.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,c.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,c.__webglColorRenderbuffer[t]);let i=f.get(r[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,c.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,i,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,c.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&_){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function Ne(e){return Math.min(p.maxSamples,e.samples)}function Pe(e){let n=f.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function P(e){let t=h.render.frame;y.get(e)!==t&&(y.set(e,t),e.update())}function Fe(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(zt.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&L(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):R(`WebGLTextures: Unsupported texture color space:`,n)),t}function Ie(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(v.width=e.naturalWidth||e.width,v.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(v.width=e.displayWidth,v.height=e.displayHeight):(v.width=e.width,v.height=e.height),v}this.allocateTextureUnit=le,this.resetTextureUnits=oe,this.getTextureUnits=se,this.setTextureUnits=ce,this.setTexture2D=N,this.setTexture2DArray=de,this.setTexture3D=fe,this.setTextureCube=pe,this.rebindTextures=De,this.setupRenderTarget=Oe,this.updateRenderTargetMipmap=ke,this.updateMultisampleRenderTarget=Me,this.setupDepthRenderbuffer=Ee,this.setupFrameBufferTexture=Ce,this.useMultisampledRTT=Pe,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function Pl(e,t){function n(n,r=``){let i,a=zt.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Fl=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Il=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Ll=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new wi(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new ga({vertexShader:Fl,fragmentShader:Il,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ri(new aa(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Rl=class extends at{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,p=null,m=null,h=typeof XRWebGLBinding<`u`,g=new Ll,v={},y=t.getContextAttributes(),b=null,x=null,C=[],w=[],T=new B,E=null,A=null,ee=new to;ee.viewport=new Xt;let te=new to;te.viewport=new Xt;let ne=[ee,te],j=new uo,re=null,M=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new Mn,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new Mn,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new Mn,C[e]=t),t.getHandSpace()};function ie(e){let t=w.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ae(){r.removeEventListener(`select`,ie),r.removeEventListener(`selectstart`,ie),r.removeEventListener(`selectend`,ie),r.removeEventListener(`squeeze`,ie),r.removeEventListener(`squeezestart`,ie),r.removeEventListener(`squeezeend`,ie),r.removeEventListener(`end`,ae),r.removeEventListener(`inputsourceschange`,oe);for(let e=0;e<C.length;e++){let t=w[e];t!==null&&(w[e]=null,C[e].disconnect(t))}re=null,M=null,g.reset();for(let e in v)delete v[e];if(e.setRenderTarget(b),p=null,d=null,u=null,r=null,x=null,pe.stop(),n.isPresenting=!1,e.setPixelRatio(E),e.setSize(T.width,T.height,!1),A!==null){let e=A.camera;e.fov=A.fov,e.zoom=A.zoom,e.updateProjectionMatrix(),A=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?p:d},this.getBinding=function(){return u===null&&h&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(b=e.getRenderTarget(),r.addEventListener(`select`,ie),r.addEventListener(`selectstart`,ie),r.addEventListener(`selectend`,ie),r.addEventListener(`squeeze`,ie),r.addEventListener(`squeezestart`,ie),r.addEventListener(`squeezeend`,ie),r.addEventListener(`end`,ae),r.addEventListener(`inputsourceschange`,oe),y.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(T),h&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;y.depth&&(o=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=y.stencil?k:O,a=y.stencil?S:_);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),x=new Qt(d.textureWidth,d.textureHeight,{format:D,type:f,depthTexture:new Si(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),x=new Qt(p.framebufferWidth,p.framebufferHeight,{format:D,type:f,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),pe.setContext(r),pe.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function oe(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=w.indexOf(n);r>=0&&(w[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=w.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=w.length){w.push(n),r=e;break}else if(w[e]===null){w[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}let se=new V,ce=new V;function le(e,t,n){se.setFromMatrixPosition(t.matrixWorld),ce.setFromMatrixPosition(n.matrixWorld);let r=se.distanceTo(ce),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ue(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;g.texture!==null&&(g.depthNear>0&&(t=g.depthNear),g.depthFar>0&&(n=g.depthFar)),j.near=te.near=ee.near=t,j.far=te.far=ee.far=n,(re!==j.near||M!==j.far)&&(r.updateRenderState({depthNear:j.near,depthFar:j.far}),re=j.near,M=j.far),j.layers.mask=e.layers.mask|6,ee.layers.mask=j.layers.mask&-5,te.layers.mask=j.layers.mask&-3;let i=e.parent,a=j.cameras;ue(j,i);for(let e=0;e<a.length;e++)ue(a[e],i);a.length===2?le(j,ee,te):j.projectionMatrix.copy(ee.projectionMatrix),A===null&&e.isPerspectiveCamera&&(A={camera:e,fov:e.fov,zoom:e.zoom}),N(e,j,i)};function N(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=lt*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return j},this.getFoveation=function(){if(d!==null||p!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(j)},this.getCameraTexture=function(e){return v[e]};let de=null;function fe(t,i){if(l=i.getViewerPose(c||a),m=i,l!==null){let t=l.views;p!==null&&(e.setRenderTargetFramebuffer(x,p.framebuffer),e.setRenderTarget(x));let i=!1;t.length!==j.cameras.length&&(j.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(x,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(x))}let o=ne[n];o===void 0&&(o=new to,o.layers.enable(n),o.viewport=new Xt,ne[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(j.matrix.copy(o.matrix),j.matrix.decompose(j.position,j.quaternion,j.scale)),i===!0&&j.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&h){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&g.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&h){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new wi,v[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=w[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}de&&de(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),m=null}let pe=new Ao;pe.setAnimationLoop(fe),this.setAnimationLoop=function(e){de=e},this.dispose=function(){}}},zl=new tn,Bl=new H;Bl.set(-1,0,0,0,1,0,0,0,1);function Vl(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,fa(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(zl.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(Bl),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Hl(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(g(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,v));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return R(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)p(t[n],e,n,a);else p(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(t,n,r,i){if(h(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=_(i);m(i,t.__data,e),typeof i!=`number`&&typeof i!=`boolean`&&!i.isMatrix3&&!ArrayBuffer.isView(i)&&(e+=a.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function m(e,t,n){typeof e==`number`||typeof e==`boolean`?t[0]=e:e.isMatrix3?(t[0]=e.elements[0],t[1]=e.elements[1],t[2]=e.elements[2],t[3]=0,t[4]=e.elements[3],t[5]=e.elements[4],t[6]=e.elements[5],t[7]=0,t[8]=e.elements[6],t[9]=e.elements[7],t[10]=e.elements[8],t[11]=0):ArrayBuffer.isView(e)?t.set(new e.constructor(e.buffer,e.byteOffset,t.length)):e.toArray(t,n)}function h(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:ArrayBuffer.isView(i)?i.slice():i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function g(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=_(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function _(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?L(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):L(`WebGLRenderer: Unsupported uniform value type.`,e),t}function v(t){let n=t.target;n.removeEventListener(`dispose`,v);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function y(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:y}}var Ul=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Wl=null;function Gl(){return Wl===null&&(Wl=new oi(Ul,16,16,te,y),Wl.name=`DFG_LUT`,Wl.minFilter=l,Wl.magFilter=l,Wl.wrapS=i,Wl.wrapT=i,Wl.generateMipmaps=!1,Wl.needsUpdate=!0),Wl}var Kl=class{constructor(e={}){let{canvas:t=Qe(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:p=!1,outputBufferType:m=f}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);g=n.getContextAttributes().alpha}else g=a;let v=m,C=new Set([j,ne,ee]),w=new Set([f,_,h,S,b,x]),T=new Uint32Array(4),E=new Int32Array(4),D=new V,O=null,k=null,A=[],te=[],re=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let M=this,ie=!1,ae=null,oe=null,se=null,ce=null;this._outputColorSpace=He;let le=0,ue=0,N=null,de=-1,fe=null,pe=new Xt,me=new Xt,he=null,ge=new U(0),_e=0,ve=t.width,ye=t.height,be=1,xe=null,Se=null,Ce=new Xt(0,0,ve,ye),we=new Xt(0,0,ve,ye),Te=!1,Ee=new yi,De=!1,Oe=!1,ke=new tn,Ae=new V,je=new Xt,Me={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ne=!1;function Pe(){return N===null?be:1}let P=n;function Fe(e,n){return t.getContext(e,n)}let Ie,Le,F,Re,I,ze,Be,Ve,Ue,We,Ge,Ke,qe,Ye,Xe,Ze,$e,tt,nt,it,at,ot,st;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r186`),t.addEventListener(`webglcontextlost`,ut,!1),t.addEventListener(`webglcontextrestored`,z,!1),t.addEventListener(`webglcontextcreationerror`,dt,!1),P===null){let t=`webgl2`;if(P=Fe(t,e),P===null)throw Fe(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}ct()}catch(e){throw t.removeEventListener(`webglcontextlost`,ut,!1),t.removeEventListener(`webglcontextrestored`,z,!1),t.removeEventListener(`webglcontextcreationerror`,dt,!1),R(`WebGLRenderer: `+e.message),e}function ct(){Ie=new us(P),Ie.init(),at=new Pl(P,Ie),Le=new zo(P,Ie,e,at),F=new Ml(P,Ie),Le.reversedDepthBuffer&&p&&F.buffers.depth.setReversed(!0),oe=P.createFramebuffer(),se=P.createFramebuffer(),ce=P.createFramebuffer(),Re=new ps(P),I=new fl,ze=new Nl(P,Ie,F,I,Le,at,Re),Be=new ls(M),Ve=new jo(P),ot=new Lo(P,Ve),Ue=new ds(P,Ve,Re,ot),We=new hs(P,Ue,Ve,ot,Re),tt=new ms(P,Le,ze),Xe=new Bo(I),Ge=new dl(M,Be,Ie,Le,ot,Xe),Ke=new Vl(M,I),qe=new gl,Ye=new Cl(Ie),$e=new Io(M,Be,F,We,g,s),Ze=new jl(M,We,Le),st=new Hl(P,Re,Le,F),nt=new Ro(P,Ie,Re),it=new fs(P,Ie,Re),Re.programs=Ge.programs,M.capabilities=Le,M.extensions=Ie,M.properties=I,M.renderLists=qe,M.shadowMap=Ze,M.state=F,M.info=Re}v!==1009&&(re=new _s(v,t.width,t.height,o,r,i));let lt=new Rl(M,P);this.xr=lt,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let e=Ie.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Ie.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return be},this.setPixelRatio=function(e){e!==void 0&&(be=e,this.setSize(ve,ye,!1))},this.getSize=function(e){return e.set(ve,ye)},this.setSize=function(e,n,r=!0){if(lt.isPresenting){L(`WebGLRenderer: Can't change size while VR device is presenting.`);return}ve=e,ye=n,t.width=Math.floor(e*be),t.height=Math.floor(n*be),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),re!==null&&re.setSize(t.width,t.height),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(ve*be,ye*be).floor()},this.setDrawingBufferSize=function(e,n,r){ve=e,ye=n,be=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(v===1009){R(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);return}if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){L(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}re.setEffects(e||[])},this.getCurrentViewport=function(e){return e.copy(pe)},this.getViewport=function(e){return e.copy(Ce)},this.setViewport=function(e,t,n,r){e.isVector4?Ce.set(e.x,e.y,e.z,e.w):Ce.set(e,t,n,r),F.viewport(pe.copy(Ce).multiplyScalar(be).round())},this.getScissor=function(e){return e.copy(we)},this.setScissor=function(e,t,n,r){e.isVector4?we.set(e.x,e.y,e.z,e.w):we.set(e,t,n,r),F.scissor(me.copy(we).multiplyScalar(be).round())},this.getScissorTest=function(){return Te},this.setScissorTest=function(e){F.setScissorTest(Te=e)},this.setOpaqueSort=function(e){xe=e},this.setTransparentSort=function(e){Se=e},this.getClearColor=function(e){return e.copy($e.getClearColor())},this.setClearColor=function(){$e.setClearColor(...arguments)},this.getClearAlpha=function(){return $e.getClearAlpha()},this.setClearAlpha=function(){$e.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(N!==null){let t=N.texture.format;e=C.has(t)}if(e){let e=N.texture.type,t=w.has(e),n=$e.getClearColor(),r=$e.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(T[0]=i,T[1]=a,T[2]=o,T[3]=r,P.clearBufferuiv(P.COLOR,0,T)):(E[0]=i,E[1]=a,E[2]=o,E[3]=r,P.clearBufferiv(P.COLOR,0,E))}else r|=P.COLOR_BUFFER_BIT}t&&(r|=P.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&P.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),ae=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,ut,!1),t.removeEventListener(`webglcontextrestored`,z,!1),t.removeEventListener(`webglcontextcreationerror`,dt,!1),$e.dispose(),qe.dispose(),Ye.dispose(),I.dispose(),Be.dispose(),We.dispose(),ot.dispose(),st.dispose(),Ge.dispose(),lt.dispose(),lt.removeEventListener(`sessionstart`,vt),lt.removeEventListener(`sessionend`,yt),bt.stop()};function ut(e){e.preventDefault(),et(`WebGLRenderer: Context Lost.`),ie=!0}function z(){et(`WebGLRenderer: Context Restored.`),ie=!1;let e=Re.autoReset,t=Ze.enabled,n=Ze.autoUpdate,r=Ze.needsUpdate,i=Ze.type;ct(),Re.autoReset=e,Ze.enabled=t,Ze.autoUpdate=n,Ze.needsUpdate=r,Ze.type=i}function dt(e){R(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function ft(e){let t=e.target;t.removeEventListener(`dispose`,ft),pt(t)}function pt(e){mt(e),I.remove(e)}function mt(e){let t=I.get(e).programs;t!==void 0&&(t.forEach(function(e){Ge.releaseProgram(e)}),e.isShaderMaterial&&Ge.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Me);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=At(e,t,n,r,i);F.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ue.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;ot.setup(i,r,s,n,c);let h,g=nt;if(c!==null&&(h=Ve.get(c),g=it,g.setIndex(h)),i.isMesh)r.wireframe===!0?(F.setLineWidth(r.wireframeLinewidth*Pe()),g.setMode(P.LINES)):g.setMode(P.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),F.setLineWidth(e*Pe()),i.isLineSegments?g.setMode(P.LINES):i.isLineLoop?g.setMode(P.LINE_LOOP):g.setMode(P.LINE_STRIP)}else i.isPoints?g.setMode(P.POINTS):i.isSprite&&g.setMode(P.TRIANGLES);if(i.isBatchedMesh){if(Ie.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Ve.get(c).bytesPerElement:1,o=I.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(P,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function ht(e,t,n,r){ae!==null&&e.isNodeMaterial&&ae.setObject(r,e),De===!0&&Xe.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Et(e,t,r),e.side=0,e.needsUpdate=!0,Et(e,t,r),e.side=2):Et(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),ae!==null&&ae.renderStart(e,t,n),k=Ye.get(n),k.init(t),te.push(k),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(k.pushLight(e),e.castShadow&&k.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(k.pushLight(e),e.castShadow&&k.pushShadow(e))}),k.setupLights(),ae!==null&&ae.updateLights(k.state.lightsArray),Oe=this.localClippingEnabled,De=Xe.init(this.clippingPlanes,Oe),De===!0&&Xe.setGlobalState(this.clippingPlanes,t),ae!==null&&Ze.render(k.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];ht(o,n,t,e),r.add(o)}else ht(i,n,t,e),r.add(i)}}),k=te.pop(),ae!==null&&ae.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){let t=I.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}Ie.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let gt=null;function _t(e){gt&&gt(e)}function vt(){bt.stop()}function yt(){bt.start()}let bt=new Ao;bt.setAnimationLoop(_t),typeof self<`u`&&bt.setContext(self),this.setAnimationLoop=function(e){gt=e,lt.setAnimationLoop(e),e===null?bt.stop():bt.start()},lt.addEventListener(`sessionstart`,vt),lt.addEventListener(`sessionend`,yt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){R(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(ie===!0)return;ae!==null&&ae.renderStart(e,t);let n=lt.enabled===!0&&lt.isPresenting===!0,r=re!==null&&(N===null||n)&&re.begin(M,N);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),lt.enabled===!0&&lt.isPresenting===!0&&(re===null||re.isCompositing()===!1)&&(lt.cameraAutoUpdate===!0&&lt.updateCamera(t),t=lt.getCamera()),e.isScene===!0&&e.onBeforeRender(M,e,t,N),k=Ye.get(e,te.length),k.init(t),k.state.textureUnits=ze.getTextureUnits(),te.push(k),ke.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),Ee.setFromProjectionMatrix(ke,Je,t.reversedDepth),Oe=this.localClippingEnabled,De=Xe.init(this.clippingPlanes,Oe),O=qe.get(e,A.length),O.init(),A.push(O),lt.enabled===!0&&lt.isPresenting===!0){let e=M.xr.getDepthSensingMesh();e!==null&&xt(e,t,-1/0,M.sortObjects)}xt(e,t,0,M.sortObjects),O.finish(),ae!==null&&ae.updateLights(k.state.lightsArray),M.sortObjects===!0&&O.sort(xe,Se),Ne=lt.enabled===!1||lt.isPresenting===!1||lt.hasDepthSensing()===!1,Ne&&$e.addToRenderList(O,e),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),De===!0&&Xe.beginShadows();let i=k.state.shadowsArray;if(Ze.render(i,e,t),De===!0&&Xe.endShadows(),(r&&re.hasRenderPass())===!1){let n=O.opaque,r=O.transmissive;if(k.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];Ct(n,r,e,a)}Ne&&$e.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];St(O,e,n,n.viewport)}}else r.length>0&&Ct(n,r,e,t),Ne&&$e.render(e),St(O,e,t)}N!==null&&ue===0&&(ze.updateMultisampleRenderTarget(N),ze.updateRenderTargetMipmap(N)),r&&re.end(M),e.isScene===!0&&e.onAfterRender(M,e,t),ot.resetDefaultState(),de=-1,fe=null,te.pop(),te.length>0?(k=te[te.length-1],ze.setTextureUnits(k.state.textureUnits),De===!0&&Xe.setGlobalState(M.clippingPlanes,k.state.camera)):k=null,A.pop(),O=A.length>0?A[A.length-1]:null,ae!==null&&ae.renderEnd()};function xt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)k.pushLightProbeGrid(e);else if(e.isLight)k.pushLight(e),e.castShadow&&k.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||e.intersectsFrustum(Ee)){r&&je.setFromMatrixPosition(e.matrixWorld).applyMatrix4(ke);let i=We.update(e),a=e.material;a.visible&&O.push(e,i,a,n,je.z,null,t)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||e.intersectsFrustum(Ee))){let i=We.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),je.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),je.copy(e.boundingSphere.center)),je.applyMatrix4(e.matrixWorld).applyMatrix4(ke)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&O.push(e,i,c,n,je.z,s,t)}}else a.visible&&O.push(e,i,a,n,je.z,null,t)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)xt(i[e],t,n,r)}function St(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;k.setupLightsView(n),De===!0&&Xe.setGlobalState(M.clippingPlanes,n),r&&F.viewport(pe.copy(r)),i.length>0&&wt(i,t,n),a.length>0&&wt(a,t,n),o.length>0&&wt(o,t,n),F.buffers.depth.setTest(!0),F.buffers.depth.setMask(!0),F.buffers.color.setMask(!0),F.setPolygonOffset(!1)}function Ct(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(k.state.transmissionRenderTarget[r.id]===void 0){let e=Ie.has(`EXT_color_buffer_half_float`)||Ie.has(`EXT_color_buffer_float`);k.state.transmissionRenderTarget[r.id]=new Qt(1,1,{generateMipmaps:!0,type:e?y:f,minFilter:d,samples:Math.max(4,Le.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:zt.workingColorSpace})}let a=k.state.transmissionRenderTarget[r.id],o=r.viewport||pe;a.setSize(o.z*M.transmissionResolutionScale,o.w*M.transmissionResolutionScale);let s=M.getRenderTarget(),c=M.getActiveCubeFace(),l=M.getActiveMipmapLevel();M.setRenderTarget(a),M.getClearColor(ge),_e=M.getClearAlpha(),_e<1&&M.setClearColor(16777215,.5),M.clear(),Ne&&$e.render(n);let u=M.toneMapping;M.toneMapping=0;let p=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),k.setupLightsView(r),De===!0&&Xe.setGlobalState(M.clippingPlanes,r),wt(e,n,r),ze.updateMultisampleRenderTarget(a),ze.updateRenderTargetMipmap(a),Ie.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,Tt(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(ze.updateMultisampleRenderTarget(a),ze.updateRenderTargetMipmap(a))}M.setRenderTarget(s,c,l),M.setClearColor(ge,_e),p!==void 0&&(r.viewport=p),M.toneMapping=u}function wt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&Tt(o,t,n,s,l,c)}}function Tt(e,t,n,r,i,a){ae!==null&&i.isNodeMaterial&&ae.setObject(e,i),e.onBeforeRender(M,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(M,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,M.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,M.renderBufferDirect(n,t,r,i,e,a),i.side=2):M.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(M,t,n,r,i,a)}function Et(e,t,n){t.isScene!==!0&&(t=Me);let r=I.get(e),i=k.state.lights,a=k.state.shadowsArray,o=i.state.version,s=Ge.getParameters(e,i.state,a,t,n,k.state.lightProbeGridArray),c=Ge.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Be.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,ft),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return Ot(e,s),d}else s.uniforms=Ge.getUniforms(e),ae!==null&&e.isNodeMaterial&&ae.build(e,n,s),e.onBeforeCompile(s,M),d=Ge.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Xe.uniform),Ot(e,s),r.needsLights=B(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=k.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function Dt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=wc.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function Ot(e,t){let n=I.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function kt(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];D.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(D))return n}return null}function At(e,t,n,r,i){t.isScene!==!0&&(t=Me),ze.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=N===null?M.outputColorSpace:N.isXRRenderTarget===!0?N.texture.colorSpace:zt.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Be.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(N===null||N.isXRRenderTarget===!0)&&(h=M.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=I.get(r),y=k.state.lights;if(De===!0&&(Oe===!0||e!==fe)){let t=e===fe&&r.id===de;Xe.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Xe.numPlanes||v.numIntersection!==Xe.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=k.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let x=v.currentProgram;b===!0&&(x=Et(r,t,i),ae&&r.isNodeMaterial&&ae.onUpdateProgram(r,x,v));let S=!1,C=!1,w=!1,T=x.getUniforms(),E=v.uniforms;if(F.useProgram(x.program)&&(S=!0,C=!0,w=!0),r.id!==de&&(de=r.id,C=!0),v.needsLights){let e=kt(k.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,C=!0)}if(S||fe!==e){F.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),T.setValue(P,`projectionMatrix`,e.projectionMatrix),T.setValue(P,`viewMatrix`,e.matrixWorldInverse);let t=T.map.cameraPosition;t!==void 0&&t.setValue(P,Ae.setFromMatrixPosition(e.matrixWorld)),Le.logarithmicDepthBuffer&&T.setValue(P,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&T.setValue(P,`isOrthographic`,e.isOrthographicCamera===!0),fe!==e&&(fe=e,C=!0,w=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&T.setValue(P,`sunShadowMap`,y.state.sunShadowMap,ze),y.state.directionalShadowMap.length>0&&T.setValue(P,`directionalShadowMap`,y.state.directionalShadowMap,ze),y.state.spotShadowMap.length>0&&T.setValue(P,`spotShadowMap`,y.state.spotShadowMap,ze),y.state.pointShadowMap.length>0&&T.setValue(P,`pointShadowMap`,y.state.pointShadowMap,ze)),i.isSkinnedMesh){T.setOptional(P,i,`bindMatrix`),T.setOptional(P,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),T.setValue(P,`boneTexture`,e.boneTexture,ze))}i.isBatchedMesh&&(T.setOptional(P,i,`batchingTexture`),T.setValue(P,`batchingTexture`,i._matricesTexture,ze),T.setOptional(P,i,`batchingIdTexture`),T.setValue(P,`batchingIdTexture`,i._indirectTexture,ze),T.setOptional(P,i,`batchingColorTexture`),i._colorsTexture!==null&&T.setValue(P,`batchingColorTexture`,i._colorsTexture,ze));let D=n.morphAttributes;if((D.position!==void 0||D.normal!==void 0||D.color!==void 0)&&tt.update(i,n,x),(C||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,T.setValue(P,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(E.envMapIntensity.value=t.environmentIntensity),E.dfgLUT!==void 0&&(E.dfgLUT.value=Gl()),C){if(T.setValue(P,`toneMappingExposure`,M.toneMappingExposure),v.needsLights&&jt(E,w),a&&r.fog===!0&&Ke.refreshFogUniforms(E,a),Ke.refreshMaterialUniforms(E,r,be,ye,k.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;E.probesSH.value=e.texture,E.probesMin.value.copy(e.boundingBox.min),E.probesMax.value.copy(e.boundingBox.max),E.probesResolution.value.copy(e.resolution)}wc.upload(P,Dt(v),E,ze)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(wc.upload(P,Dt(v),E,ze),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&T.setValue(P,`center`,i.center),T.setValue(P,`modelViewMatrix`,i.modelViewMatrix),T.setValue(P,`normalMatrix`,i.normalMatrix),T.setValue(P,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];st.update(n,x),st.bind(n,x)}}return x}function jt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function B(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return le},this.getActiveMipmapLevel=function(){return ue},this.getRenderTarget=function(){return N},this.setRenderTargetTextures=function(e,t,n){let r=I.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),I.get(e.texture).__webglTexture=t,I.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=I.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){N=e,le=t,ue=n;let r=null,i=!1,a=!1;if(e){let o=I.get(e);if(o.__useDefaultFramebuffer!==void 0){F.bindFramebuffer(P.FRAMEBUFFER,o.__webglFramebuffer),pe.copy(e.viewport),me.copy(e.scissor),he=e.scissorTest,F.viewport(pe),F.scissor(me),F.setScissorTest(he),de=-1;return}if(o.__webglFramebuffer===void 0)ze.setupRenderTarget(e);else if(o.__hasExternalTextures)ze.rebindTextures(e,I.get(e.texture).__webglTexture,I.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&I.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);ze.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=I.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&ze.useMultisampledRTT(e)===!1?I.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,pe.copy(e.viewport),me.copy(e.scissor),he=e.scissorTest}else pe.copy(Ce).multiplyScalar(be).floor(),me.copy(we).multiplyScalar(be).floor(),he=Te;if(n!==0&&(r=oe),F.bindFramebuffer(P.FRAMEBUFFER,r)&&F.drawBuffers(e,r),F.viewport(pe),F.scissor(me),F.setScissorTest(he),i){let r=I.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=I.get(e.textures[t]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=I.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,t.__webglTexture,n)}de=-1};function Mt(e){let t=I.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=Le.textureFormatReadable(e.format),t.__typeReadable=Le.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){F.bindFramebuffer(P.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s);let u=Mt(o);if(u.__formatReadable===!1){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&P.readPixels(t,n,r,i,at.convert(c),at.convert(l),a)}finally{let e=N===null?null:I.get(N).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){F.bindFramebuffer(P.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s);let d=Mt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,f),P.bufferData(P.PIXEL_PACK_BUFFER,a.byteLength,P.STREAM_READ),P.readPixels(t,n,r,i,at.convert(l),at.convert(u),0),P.bindBuffer(P.PIXEL_PACK_BUFFER,null);let p=N===null?null:I.get(N).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,p);let m=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await rt(P,m,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,f),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,a),P.bindBuffer(P.PIXEL_PACK_BUFFER,null),P.deleteBuffer(f),P.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;ze.setTexture2D(e,0),P.copyTexSubImage2D(P.TEXTURE_2D,n,0,0,o,s,i,a),F.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=at.convert(t.format),_=at.convert(t.type),v;t.isData3DTexture?(ze.setTexture3D(t,0),v=P.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(ze.setTexture2DArray(t,0),v=P.TEXTURE_2D_ARRAY):(ze.setTexture2D(t,0),v=P.TEXTURE_2D),F.activeTexture(P.TEXTURE0),F.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,t.flipY),F.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),F.pixelStorei(P.UNPACK_ALIGNMENT,t.unpackAlignment);let y=F.getParameter(P.UNPACK_ROW_LENGTH),b=F.getParameter(P.UNPACK_IMAGE_HEIGHT),x=F.getParameter(P.UNPACK_SKIP_PIXELS),S=F.getParameter(P.UNPACK_SKIP_ROWS),C=F.getParameter(P.UNPACK_SKIP_IMAGES);F.pixelStorei(P.UNPACK_ROW_LENGTH,h.width),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,h.height),F.pixelStorei(P.UNPACK_SKIP_PIXELS,l),F.pixelStorei(P.UNPACK_SKIP_ROWS,u),F.pixelStorei(P.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=I.get(e),r=I.get(t),h=I.get(n.__renderTarget),g=I.get(r.__renderTarget);F.bindFramebuffer(P.READ_FRAMEBUFFER,h.__webglFramebuffer),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,I.get(e).__webglTexture,i,d+n),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,I.get(t).__webglTexture,a,m+n)),P.blitFramebuffer(l,u,o,s,f,p,o,s,P.DEPTH_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||I.has(e)){let n=I.get(e),r=I.get(t);F.bindFramebuffer(P.READ_FRAMEBUFFER,se),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,ce);for(let e=0;e<c;e++)w?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,n.__webglTexture,i),T?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,r.__webglTexture,a),i===0?T?P.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):P.copyTexSubImage2D(v,a,f,p,l,u,o,s):P.blitFramebuffer(l,u,o,s,f,p,o,s,P.COLOR_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?P.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h);F.pixelStorei(P.UNPACK_ROW_LENGTH,y),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,b),F.pixelStorei(P.UNPACK_SKIP_PIXELS,x),F.pixelStorei(P.UNPACK_SKIP_ROWS,S),F.pixelStorei(P.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&P.generateMipmap(v),F.unbindTexture()},this.initRenderTarget=function(e){I.get(e).__webglFramebuffer===void 0&&ze.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?ze.setTextureCube(e,0):e.isData3DTexture?ze.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?ze.setTexture2DArray(e,0):ze.setTexture2D(e,0),F.unbindTexture()},this.resetState=function(){le=0,ue=0,N=null,F.reset(),ot.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Je}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=zt._getDrawingBufferColorSpace(e),t.unpackColorSpace=zt._getUnpackColorSpace()}},ql=null,Jl=null;function Yl(){if(typeof MediaRecorder>`u`)return null;for(let e of[`video/mp4;codecs=avc1`,`video/webm;codecs=vp9,opus`,`video/webm;codecs=vp8,opus`,`video/webm`,`video/mp4`])if(MediaRecorder.isTypeSupported(e))return e;return null}function Xl(e){return!!Yl()&&typeof e.captureStream==`function`}function Zl(){Jl=null}function Ql(e,t,r=4){if(!ql&&Xl(e)&&(!Jl?.mega||t))try{let i=e.captureStream(30),a=n.streamDest?.stream.getAudioTracks()[0];a&&i.addTrack(a);let o=Yl(),s=[],c=new MediaRecorder(i,{mimeType:o,videoBitsPerSecond:25e5});c.ondataavailable=e=>{e.data.size&&s.push(e.data)},c.onstop=()=>{ql=null,i.getVideoTracks().forEach(e=>e.stop()),s.length&&(Jl={blob:new Blob(s,{type:o.split(`;`)[0]}),mega:t})},ql=c,c.start(),setTimeout(()=>{c.state!==`inactive`&&c.stop()},r*1e3)}catch{ql=null}}function $l(){return Jl?.blob??null}var eu={version:`0.3`,date:`2026-10-04`,notes:[`24 country bags x 20 foods (10 healthy grade A/B + 10 'sometimes' grade D/E) = 480 foods. v0.3 adds Indonesia, Russia, Ukraine, Philippines (one per added language). Starter Bag in PIKKO-GAME-DESIGN.md section 8.`,`Traditional sweets, fried street food and party dishes are 'sometimes foods', never 'bad' foods: present them with respect.`,`kcal values are APPROXIMATE per typical portion and must be verified (USDA FoodData Central / CREA / IZZ / national tables) and reviewed by a paediatric nutritionist.`,`Grades are the internal Pikko Score, not the official Nutri-Score.`,`Polish names need native-speaker review. Local dish names are kept where they are the common name.`,`Logos use colour palettes inspired by each country, not flags or national emblems (some countries restrict commercial use of flags).`,`mint is null until the developer supplies the Pump.fun CA and it passes Token-2022 / extension / route verification.`],foodColumns:[`id`,`en`,`it`,`pl`,`kcal`,`portionQty`,`portionUnit`,`grade`,`category`],categories:{healthy:[`veg`,`fruit`,`protein`,`grain`,`legume`,`nuts`,`dairy`,`water`],junk:[`sugar`,`fried`,`fizzy`,`salty`,`fatty`,`ultra`]},accessRule:{type:`anyActiveLock`,minOriginalSeconds:0,minRemainingSeconds:0,aggregation:`sum`,minimumTokens:`TBD`},bags:[{id:`italy`,order:1,country:`IT`,mint:null,name:{en:`Italy`,it:`Italia`,pl:`Włochy`},accessory:{en:`Chef's hat`,it:`Cappello da chef`,pl:`Czapka kucharska`},accessoryKind:`chef`,fact:{en:`Italy: the Mediterranean diet — vegetables, beans, olive oil and pasta — is UNESCO heritage.`,it:`Italia: la dieta mediterranea — verdure, legumi, olio d'oliva e pasta — è patrimonio UNESCO.`,pl:`Włochy: dieta śródziemnomorska — warzywa, strączki, oliwa i makaron — jest dziedzictwem UNESCO.`},palette:[`#009246`,`#ffffff`,`#ce2b37`],stripes:`v`,bg:`#fbe3d6`,logo:`logos/italy.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_IT_italy_1024.png`,foods:[[`it_minestrone`,`Minestrone`,`Minestrone`,`Zupa minestrone`,100,300,`g`,`A`,`veg`],[`it_pasta_fagioli`,`Pasta and beans`,`Pasta e fagioli`,`Makaron z fasolą`,300,300,`g`,`B`,`legume`],[`it_caprese`,`Caprese salad`,`Insalata caprese`,`Sałatka caprese`,230,150,`g`,`B`,`dairy`],[`it_ribollita`,`Ribollita (Tuscan bread soup)`,`Ribollita`,`Ribollita (toskańska zupa)`,200,300,`g`,`A`,`veg`],[`it_sardines`,`Grilled sardines`,`Sarde alla griglia`,`Grillowane sardynki`,210,100,`g`,`A`,`protein`],[`it_fennel_orange`,`Fennel and orange salad`,`Insalata di finocchi e arance`,`Sałatka z kopru włoskiego i pomarańczy`,90,200,`g`,`A`,`veg`],[`it_bruschetta`,`Tomato bruschetta`,`Bruschetta al pomodoro`,`Bruschetta z pomidorami`,120,60,`g`,`B`,`grain`],[`it_farro_salad`,`Farro salad`,`Insalata di farro`,`Sałatka z orkiszu`,260,200,`g`,`A`,`grain`],[`it_figs`,`Fresh figs`,`Fichi freschi`,`Świeże figi`,74,100,`g`,`A`,`fruit`],[`it_grilled_veg`,`Grilled vegetables`,`Verdure grigliate`,`Grillowane warzywa`,90,200,`g`,`A`,`veg`],[`it_panzerotto`,`Fried panzerotto`,`Panzerotto fritto`,`Smażony panzerotto`,450,180,`g`,`E`,`fried`],[`it_arancino`,`Arancino`,`Arancino`,`Arancino (smażona kula ryżowa)`,400,200,`g`,`D`,`fried`],[`it_cannolo`,`Cannolo`,`Cannolo siciliano`,`Cannolo sycylijskie`,350,120,`g`,`E`,`sugar`],[`it_tiramisu`,`Tiramisu`,`Tiramisù`,`Tiramisu`,420,150,`g`,`E`,`sugar`],[`it_fritto_misto`,`Mixed fried seafood`,`Fritto misto`,`Smażone owoce morza`,500,200,`g`,`D`,`fried`],[`it_pizza_fritta`,`Fried pizza`,`Pizza fritta`,`Smażona pizza`,550,250,`g`,`E`,`fried`],[`it_merendina`,`Packaged snack cake`,`Merendina confezionata`,`Ciastko z paczki`,150,35,`g`,`E`,`sugar`],[`it_zeppola`,`Cream zeppola`,`Zeppola alla crema`,`Zeppola z kremem`,300,100,`g`,`E`,`sugar`],[`it_mortadella`,`Mortadella sandwich`,`Panino alla mortadella`,`Kanapka z mortadelą`,450,180,`g`,`D`,`ultra`],[`it_bombolone`,`Cream-filled bombolone`,`Bombolone alla crema`,`Bombolone z kremem`,330,90,`g`,`E`,`sugar`]]},{id:`poland`,order:2,country:`PL`,mint:null,name:{en:`Poland`,it:`Polonia`,pl:`Polska`},accessory:{en:`Łowicz folk scarf`,it:`Foulard folk di Łowicz`,pl:`Chusta łowicka`},accessoryKind:`scarf`,fact:{en:`Poland: pickles and sauerkraut are fermented winter classics, full of friendly bacteria.`,it:`Polonia: cetrioli e crauti fermentati sono classici dell'inverno, pieni di batteri buoni.`,pl:`Polska: kiszone ogórki i kapusta to zimowa klasyka pełna dobrych bakterii.`},palette:[`#ffffff`,`#dc143c`],stripes:`h`,bg:`#fde4e8`,logo:`logos/poland.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_PL_poland_1024.png`,foods:[[`pl_kasza`,`Buckwheat groats`,`Grano saraceno`,`Kasza gryczana`,140,150,`g`,`A`,`grain`],[`pl_ogorki`,`Fermented pickles`,`Cetrioli fermentati`,`Ogórki kiszone`,12,100,`g`,`B`,`veg`],[`pl_barszcz`,`Clear beetroot soup`,`Zuppa di barbabietola`,`Barszcz czerwony`,50,250,`ml`,`A`,`veg`],[`pl_twarozek`,`Cottage cheese with radish`,`Fiocchi di latte con ravanelli`,`Twarożek z rzodkiewką`,160,150,`g`,`A`,`dairy`],[`pl_kapusta`,`Sauerkraut`,`Crauti`,`Kapusta kiszona`,20,100,`g`,`A`,`veg`],[`pl_kefir`,`Kefir`,`Kefir`,`Kefir`,130,250,`ml`,`A`,`dairy`],[`pl_sledz`,`Marinated herring`,`Aringa marinata`,`Śledź marynowany`,190,100,`g`,`B`,`protein`],[`pl_mizeria`,`Cucumber yogurt salad`,`Insalata di cetrioli e yogurt`,`Mizeria`,60,150,`g`,`A`,`veg`],[`pl_chleb_zytni`,`Rye sourdough bread`,`Pane di segale a lievito madre`,`Chleb żytni na zakwasie`,100,40,`g`,`B`,`grain`],[`pl_buraczki`,`Beet salad`,`Insalata di barbabietole`,`Buraczki`,70,150,`g`,`A`,`veg`],[`pl_paczek`,`Rose-jam pączek`,`Pączek alla rosa (bombolone polacco)`,`Pączek z różą`,300,80,`g`,`E`,`sugar`],[`pl_zapiekanka`,`Zapiekanka`,`Zapiekanka (baguette gratinata)`,`Zapiekanka`,500,250,`g`,`E`,`ultra`],[`pl_kielbasa`,`Grilled sausage`,`Salsiccia alla griglia`,`Kiełbasa z grilla`,450,150,`g`,`D`,`fatty`],[`pl_schabowy`,`Breaded pork cutlet`,`Cotoletta di maiale impanata`,`Kotlet schabowy`,500,200,`g`,`D`,`fried`],[`pl_pierogi_smazone`,`Fried pierogi with cracklings`,`Pierogi fritti con ciccioli`,`Smażone pierogi ze skwarkami`,550,250,`g`,`D`,`fried`],[`pl_oranzada`,`Orangeade soda`,`Aranciata gassata`,`Oranżada`,140,330,`ml`,`E`,`fizzy`],[`pl_ptasie_mleczko`,`Chocolate marshmallow bites`,`Marshmallow al cioccolato`,`Ptasie mleczko`,120,30,`g`,`E`,`sugar`],[`pl_kremowka`,`Cream slice`,`Millefoglie alla crema`,`Kremówka`,350,120,`g`,`E`,`sugar`],[`pl_placki`,`Fried potato pancakes`,`Frittelle di patate`,`Placki ziemniaczane`,400,200,`g`,`D`,`fried`],[`pl_gofr`,`Waffle with whipped cream`,`Waffle con panna`,`Gofr z bitą śmietaną`,450,150,`g`,`E`,`sugar`]]},{id:`japan`,order:3,country:`JP`,mint:null,name:{en:`Japan`,it:`Giappone`,pl:`Japonia`},accessory:{en:`Hachimaki headband`,it:`Fascia hachimaki`,pl:`Opaska hachimaki`},accessoryKind:`band`,fact:{en:`Japan: washoku — rice, miso soup, fish and vegetables — is UNESCO heritage (2013).`,it:`Giappone: il washoku — riso, zuppa di miso, pesce e verdure — è patrimonio UNESCO (2013).`,pl:`Japonia: washoku — ryż, zupa miso, ryby i warzywa — jest dziedzictwem UNESCO (2013).`},palette:[`#ffffff`,`#bc002d`],stripes:`disc`,bg:`#fde8ea`,logo:`logos/japan.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_JP_japan_1024.png`,foods:[[`jp_edamame`,`Edamame`,`Edamame`,`Edamame`,120,100,`g`,`A`,`legume`],[`jp_miso_soup`,`Miso soup`,`Zuppa di miso`,`Zupa miso`,40,250,`ml`,`A`,`veg`],[`jp_salmon_nigiri`,`Salmon nigiri`,`Nigiri al salmone`,`Nigiri z łososiem`,120,70,`g`,`A`,`protein`],[`jp_sashimi`,`Sashimi`,`Sashimi`,`Sashimi`,130,100,`g`,`A`,`protein`],[`jp_seaweed_salad`,`Seaweed salad`,`Insalata di alghe`,`Sałatka z wodorostów`,70,100,`g`,`B`,`veg`],[`jp_onigiri`,`Onigiri`,`Onigiri`,`Onigiri`,180,110,`g`,`B`,`grain`],[`jp_hiyayakko`,`Chilled tofu`,`Tofu freddo (hiyayakko)`,`Tofu na zimno`,110,150,`g`,`A`,`legume`],[`jp_cold_soba`,`Cold soba noodles`,`Soba fredda`,`Zimny makaron soba`,280,250,`g`,`A`,`grain`],[`jp_matcha_tea`,`Unsweetened matcha`,`Tè matcha senza zucchero`,`Matcha bez cukru`,5,250,`ml`,`A`,`water`],[`jp_cucumber_maki`,`Cucumber maki`,`Maki al cetriolo`,`Maki z ogórkiem`,140,120,`g`,`A`,`veg`],[`jp_tempura`,`Tempura`,`Tempura`,`Tempura`,450,180,`g`,`D`,`fried`],[`jp_tonkatsu`,`Tonkatsu`,`Tonkatsu (cotoletta fritta)`,`Tonkatsu`,500,200,`g`,`D`,`fried`],[`jp_instant_ramen`,`Instant ramen`,`Ramen istantaneo`,`Zupka błyskawiczna ramen`,450,85,`g`,`E`,`ultra`],[`jp_karaage`,`Karaage fried chicken`,`Pollo fritto karaage`,`Kurczak karaage`,400,150,`g`,`D`,`fried`],[`jp_mochi_icecream`,`Mochi ice cream`,`Mochi gelato`,`Lody mochi`,200,90,`g`,`E`,`sugar`],[`jp_dorayaki`,`Dorayaki`,`Dorayaki`,`Dorayaki`,280,100,`g`,`E`,`sugar`],[`jp_takoyaki`,`Takoyaki`,`Takoyaki`,`Takoyaki`,400,180,`g`,`D`,`fried`],[`jp_melon_pan`,`Melon pan`,`Melon pan`,`Melon pan`,380,100,`g`,`E`,`sugar`],[`jp_matcha_frappe`,`Sweet matcha frappé`,`Frappè al matcha zuccherato`,`Słodkie frappé matcha`,400,400,`ml`,`E`,`sugar`],[`jp_mayo_roll`,`Tempura mayo roll`,`Uramaki tempura e maionese`,`Rolka z tempurą i majonezem`,550,250,`g`,`D`,`fried`]]},{id:`mexico`,order:4,country:`MX`,mint:null,name:{en:`Mexico`,it:`Messico`,pl:`Meksyk`},accessory:{en:`Papel picado bib`,it:`Bavaglino papel picado`,pl:`Śliniaczek papel picado`},accessoryKind:`none`,fact:{en:`Mexico: traditional Mexican cuisine is UNESCO heritage (2010) — corn, beans and chili at its heart.`,it:`Messico: la cucina tradizionale messicana è patrimonio UNESCO (2010) — mais, fagioli e peperoncino al centro.`,pl:`Meksyk: tradycyjna kuchnia meksykańska jest dziedzictwem UNESCO (2010) — kukurydza, fasola i chili.`},palette:[`#006847`,`#ffffff`,`#ce1126`],stripes:`v`,bg:`#e2f2ea`,logo:`logos/mexico.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_MX_mexico_1024.png`,foods:[[`mx_guacamole`,`Guacamole`,`Guacamole`,`Guacamole`,160,100,`g`,`A`,`veg`],[`mx_pico_de_gallo`,`Pico de gallo`,`Pico de gallo`,`Pico de gallo`,25,100,`g`,`A`,`veg`],[`mx_frijoles`,`Pot beans (frijoles de olla)`,`Fagioli in pentola (frijoles de olla)`,`Fasola z garnka (frijoles de olla)`,230,200,`g`,`A`,`legume`],[`mx_fish_taco`,`Grilled fish taco`,`Taco di pesce alla griglia`,`Taco z grillowaną rybą`,180,120,`g`,`A`,`protein`],[`mx_mango_chile`,`Mango with chili and lime`,`Mango con peperoncino e lime`,`Mango z chili i limonką`,90,150,`g`,`A`,`fruit`],[`mx_nopales`,`Cactus salad`,`Insalata di nopales`,`Sałatka z kaktusa`,40,150,`g`,`A`,`veg`],[`mx_sopa_tortilla`,`Tortilla soup`,`Zuppa di tortilla`,`Zupa tortilla`,200,300,`ml`,`B`,`veg`],[`mx_jicama`,`Jicama sticks`,`Bastoncini di jicama`,`Paluszki z jicamy`,38,100,`g`,`A`,`veg`],[`mx_ceviche_mx`,`Mexican fish ceviche`,`Ceviche messicano`,`Meksykańskie ceviche`,140,150,`g`,`A`,`protein`],[`mx_calabacitas`,`Calabacitas (squash and corn)`,`Calabacitas (zucchine e mais)`,`Calabacitas (cukinia z kukurydzą)`,110,200,`g`,`A`,`veg`],[`mx_churros`,`Churros with chocolate`,`Churros con cioccolata`,`Churros z czekoladą`,450,150,`g`,`E`,`fried`],[`mx_chimichanga`,`Chimichanga`,`Chimichanga`,`Chimichanga`,650,300,`g`,`D`,`fried`],[`mx_quesadilla`,`Extra-cheese fried quesadilla`,`Quesadilla fritta extra formaggio`,`Smażona quesadilla z dużą ilością sera`,550,200,`g`,`D`,`fatty`],[`mx_concha`,`Concha sweet bread`,`Concha (pan dulce)`,`Concha (słodka bułka)`,380,100,`g`,`E`,`sugar`],[`mx_tres_leches`,`Tres leches cake`,`Torta tres leches`,`Ciasto tres leches`,400,150,`g`,`E`,`sugar`],[`mx_torta_chorizo`,`Chorizo torta sandwich`,`Torta al chorizo`,`Kanapka torta z chorizo`,650,300,`g`,`D`,`fatty`],[`mx_flautas`,`Fried flautas`,`Flautas fritte`,`Smażone flautas`,450,180,`g`,`D`,`fried`],[`mx_horchata`,`Sweet horchata`,`Horchata zuccherata`,`Słodka horchata`,250,350,`ml`,`D`,`sugar`],[`mx_bunuelos`,`Buñuelos with syrup`,`Buñuelos con sciroppo`,`Buñuelos z syropem`,350,120,`g`,`E`,`fried`],[`mx_elote_mayo`,`Corn with mayo and cheese`,`Elote con maionese e formaggio`,`Kukurydza z majonezem i serem`,250,180,`g`,`D`,`fatty`]]},{id:`usa`,order:5,country:`US`,mint:null,name:{en:`United States`,it:`Stati Uniti`,pl:`Stany Zjednoczone`},accessory:{en:`Diner paper cap`,it:`Cappellino di carta da diner`,pl:`Papierowa czapka z dinera`},accessoryKind:`cap`,fact:{en:`USA: corn, beans and squash — the 'Three Sisters' — were grown together by Native American farmers.`,it:`Stati Uniti: mais, fagioli e zucca — le 'Tre Sorelle' — erano coltivati insieme dai popoli nativi.`,pl:`USA: kukurydza, fasola i dynia — „Trzy Siostry” — uprawiano razem u rdzennych Amerykanów.`},palette:[`#b22234`,`#ffffff`,`#3c3b6e`],stripes:`us`,bg:`#e3e6f3`,logo:`logos/usa.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_US_usa_1024.png`,foods:[[`us_turkey_wrap`,`Turkey wrap`,`Wrap al tacchino`,`Wrap z indykiem`,300,220,`g`,`B`,`protein`],[`us_cobb_light`,`Light Cobb salad`,`Cobb salad leggera`,`Lekka sałatka Cobb`,350,300,`g`,`B`,`veg`],[`us_baked_potato`,`Baked potato with yogurt`,`Patata al forno con yogurt`,`Pieczony ziemniak z jogurtem`,220,250,`g`,`A`,`veg`],[`us_omelette`,`Egg-white veggie omelette`,`Omelette di albumi e verdure`,`Omlet z białek z warzywami`,150,200,`g`,`A`,`protein`],[`us_bean_chili`,`Lean bean chili`,`Chili di fagioli magro`,`Chili z fasolą`,280,250,`g`,`B`,`legume`],[`us_coleslaw`,`Yogurt coleslaw`,`Coleslaw allo yogurt`,`Surówka coleslaw z jogurtem`,80,120,`g`,`B`,`veg`],[`us_waldorf`,`Light Waldorf salad`,`Insalata Waldorf leggera`,`Lekka sałatka Waldorf`,180,180,`g`,`B`,`fruit`],[`us_chicken_sandwich`,`Wholewheat grilled chicken sandwich`,`Panino integrale con pollo`,`Pełnoziarnista kanapka z kurczakiem`,380,220,`g`,`B`,`protein`],[`us_succotash`,`Corn and bean succotash`,`Succotash di mais e fagioli`,`Succotash z kukurydzy i fasoli`,160,150,`g`,`A`,`legume`],[`us_corn_cob`,`Corn on the cob`,`Pannocchia lessa`,`Gotowana kolba kukurydzy`,90,100,`g`,`A`,`veg`],[`us_mac_cheese`,`Mac and cheese`,`Mac and cheese`,`Makaron z serem`,500,300,`g`,`D`,`fatty`],[`us_chicken_waffles`,`Fried chicken and waffles`,`Pollo fritto e waffle`,`Kurczak w panierce z goframi`,800,350,`g`,`E`,`fried`],[`us_apple_pie`,`Apple pie à la mode`,`Torta di mele con gelato`,`Szarlotka z lodami`,500,200,`g`,`E`,`sugar`],[`us_fried_steak`,`Chicken-fried steak with gravy`,`Bistecca impanata con salsa gravy`,`Panierowany stek z sosem`,700,300,`g`,`D`,`fried`],[`us_root_beer_float`,`Root beer float`,`Root beer float`,`Root beer z lodami`,300,400,`ml`,`E`,`fizzy`],[`us_biscuits_gravy`,`Biscuits and gravy`,`Biscuits con gravy`,`Bułeczki z sosem gravy`,600,300,`g`,`E`,`fatty`],[`us_cheesesteak`,`Philly cheesesteak`,`Panino Philly cheesesteak`,`Kanapka Philly cheesesteak`,700,300,`g`,`D`,`fatty`],[`us_jalapeno_poppers`,`Jalapeño poppers`,`Jalapeño poppers fritti`,`Smażone jalapeño poppers`,400,150,`g`,`E`,`fried`],[`us_bbq_ribs`,`Sticky BBQ ribs`,`Costine BBQ glassate`,`Żeberka w słodkim sosie BBQ`,750,350,`g`,`D`,`fatty`],[`us_brownie`,`Chocolate brownie`,`Brownie al cioccolato`,`Brownie czekoladowe`,250,60,`g`,`E`,`sugar`]]},{id:`india`,order:6,country:`IN`,mint:null,name:{en:`India`,it:`India`,pl:`Indie`},accessory:{en:`Marigold garland`,it:`Ghirlanda di calendule`,pl:`Girlanda z aksamitek`},accessoryKind:`lei`,fact:{en:`India: many dishes are built on lentils (dal) and spices like turmeric and cumin.`,it:`India: tanti piatti nascono da lenticchie (dal) e spezie come curcuma e cumino.`,pl:`Indie: wiele potraw opiera się na soczewicy (dal) i przyprawach jak kurkuma i kumin.`},palette:[`#ff9933`,`#ffffff`,`#138808`],stripes:`h`,bg:`#fff0de`,logo:`logos/india.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_IN_india_1024.png`,foods:[[`in_dal`,`Lentil dal`,`Dal di lenticchie`,`Dal z soczewicy`,250,250,`g`,`A`,`legume`],[`in_chana_masala`,`Chana masala`,`Chana masala`,`Chana masala`,280,250,`g`,`A`,`legume`],[`in_tandoori`,`Tandoori chicken`,`Pollo tandoori`,`Kurczak tandoori`,250,150,`g`,`A`,`protein`],[`in_raita`,`Raita`,`Raita`,`Raita`,60,100,`g`,`A`,`dairy`],[`in_veg_curry`,`Light vegetable curry`,`Curry di verdure leggero`,`Lekkie curry warzywne`,200,250,`g`,`A`,`veg`],[`in_roti`,`Wholewheat roti`,`Roti integrale`,`Pełnoziarniste roti`,110,40,`g`,`B`,`grain`],[`in_brown_basmati`,`Brown basmati rice`,`Riso basmati integrale`,`Brązowy ryż basmati`,170,150,`g`,`B`,`grain`],[`in_palak_paneer`,`Palak paneer`,`Palak paneer`,`Palak paneer`,300,250,`g`,`B`,`dairy`],[`in_moong_salad`,`Sprouted moong salad`,`Insalata di germogli di moong`,`Sałatka z kiełków mung`,120,150,`g`,`A`,`legume`],[`in_baingan`,`Baingan bharta (smoky eggplant)`,`Baingan bharta (melanzane affumicate)`,`Baingan bharta (wędzony bakłażan)`,140,200,`g`,`A`,`veg`],[`in_samosa`,`Samosa`,`Samosa`,`Samosy`,500,200,`g`,`D`,`fried`],[`in_pakora`,`Pakora`,`Pakora`,`Pakory`,400,150,`g`,`D`,`fried`],[`in_gulab_jamun`,`Gulab jamun`,`Gulab jamun`,`Gulab jamun`,300,100,`g`,`E`,`sugar`],[`in_jalebi`,`Jalebi`,`Jalebi`,`Jalebi`,450,100,`g`,`E`,`sugar`],[`in_butter_chicken`,`Creamy butter chicken`,`Butter chicken cremoso`,`Kremowy kurczak maślany`,600,300,`g`,`D`,`fatty`],[`in_butter_naan`,`Garlic butter naan`,`Naan al burro e aglio`,`Naan z masłem czosnkowym`,350,110,`g`,`D`,`fatty`],[`in_mango_lassi`,`Sweet mango lassi`,`Lassi dolce al mango`,`Słodkie lassi mango`,300,350,`ml`,`E`,`sugar`],[`in_bhatura`,`Fried bhatura`,`Bhatura fritto`,`Smażone bhatura`,450,150,`g`,`D`,`fried`],[`in_barfi`,`Barfi`,`Barfi`,`Barfi`,250,60,`g`,`E`,`sugar`],[`in_kulfi`,`Kulfi`,`Kulfi`,`Kulfi`,200,90,`g`,`E`,`sugar`]]},{id:`france`,order:7,country:`FR`,mint:null,name:{en:`France`,it:`Francia`,pl:`Francja`},accessory:{en:`Beret`,it:`Basco`,pl:`Beret`},accessoryKind:`beret`,fact:{en:`France: the French gastronomic meal is UNESCO heritage (2010) — starter, main, cheese, dessert.`,it:`Francia: il pasto gastronomico francese è patrimonio UNESCO (2010) — antipasto, piatto, formaggio, dolce.`,pl:`Francja: francuski posiłek gastronomiczny jest dziedzictwem UNESCO (2010) — przystawka, danie, ser, deser.`},palette:[`#0055a4`,`#ffffff`,`#ef4135`],stripes:`v`,bg:`#e2eaf6`,logo:`logos/france.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_FR_france_1024.png`,foods:[[`fr_ratatouille`,`Ratatouille`,`Ratatouille`,`Ratatouille`,150,250,`g`,`A`,`veg`],[`fr_nicoise`,`Salade niçoise`,`Insalata nizzarda`,`Sałatka nicejska`,300,300,`g`,`B`,`protein`],[`fr_lentilles`,`Puy lentil salad`,`Insalata di lenticchie du Puy`,`Sałatka z soczewicy z Puy`,200,200,`g`,`A`,`legume`],[`fr_moules`,`Moules marinières`,`Cozze alla marinara`,`Małże po marynarsku`,200,250,`g`,`A`,`protein`],[`fr_haricots`,`Green beans`,`Fagiolini (haricots verts)`,`Fasolka szparagowa`,45,150,`g`,`A`,`veg`],[`fr_papillote`,`Fish en papillote`,`Pesce al cartoccio`,`Ryba pieczona w papilocie`,180,150,`g`,`A`,`protein`],[`fr_fromage_blanc`,`Fromage blanc`,`Fromage blanc (formaggio fresco)`,`Fromage blanc (twarożek)`,110,150,`g`,`A`,`dairy`],[`fr_potage`,`Vegetable potage`,`Vellutata di verdure`,`Zupa krem z warzyw`,120,300,`ml`,`A`,`veg`],[`fr_pot_au_feu`,`Pot-au-feu`,`Pot-au-feu (bollito con verdure)`,`Pot-au-feu (gotowana wołowina z warzywami)`,350,350,`g`,`B`,`protein`],[`fr_endives`,`Endive and walnut salad`,`Insalata di indivia e noci`,`Sałatka z cykorii i orzechów`,150,150,`g`,`A`,`veg`],[`fr_croissant`,`Butter croissant`,`Croissant al burro`,`Croissant maślany`,230,60,`g`,`D`,`sugar`],[`fr_pain_chocolat`,`Pain au chocolat`,`Pain au chocolat`,`Pain au chocolat`,270,70,`g`,`E`,`sugar`],[`fr_croque`,`Croque-monsieur`,`Croque-monsieur`,`Croque-monsieur`,450,180,`g`,`D`,`fatty`],[`fr_crepe_choco`,`Chocolate spread crêpe`,`Crêpe alla crema spalmabile`,`Naleśnik z kremem czekoladowym`,450,150,`g`,`E`,`sugar`],[`fr_macarons`,`Macarons`,`Macarons`,`Makaroniki`,280,60,`g`,`E`,`sugar`],[`fr_eclair`,`Chocolate éclair`,`Éclair al cioccolato`,`Ekler czekoladowy`,260,100,`g`,`E`,`sugar`],[`fr_quiche`,`Quiche lorraine`,`Quiche lorraine`,`Quiche lotaryńska`,450,150,`g`,`D`,`fatty`],[`fr_tartiflette`,`Tartiflette`,`Tartiflette`,`Tartiflette`,600,300,`g`,`D`,`fatty`],[`fr_millefeuille`,`Mille-feuille`,`Millefoglie francese`,`Mille-feuille`,400,120,`g`,`E`,`sugar`],[`fr_grenadine`,`Grenadine syrup drink`,`Bibita allo sciroppo di granatina`,`Napój z syropem grenadyna`,150,250,`ml`,`E`,`sugar`]]},{id:`spain`,order:8,country:`ES`,mint:null,name:{en:`Spain`,it:`Spagna`,pl:`Hiszpania`},accessory:{en:`Red and yellow scarf`,it:`Sciarpa rossa e gialla`,pl:`Czerwono-żółty szalik`},accessoryKind:`scarf`,fact:{en:`Spain: the world's biggest producer of olive oil — the base of Mediterranean cooking.`,it:`Spagna: è il primo produttore mondiale di olio d'oliva, base della cucina mediterranea.`,pl:`Hiszpania: największy producent oliwy na świecie — podstawy kuchni śródziemnomorskiej.`},palette:[`#aa151b`,`#f1bf00`,`#aa151b`],stripes:`h3`,bg:`#fdf1cf`,logo:`logos/spain.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_ES_spain_1024.png`,foods:[[`es_gazpacho`,`Gazpacho`,`Gazpacho`,`Gazpacho`,100,250,`ml`,`A`,`veg`],[`es_salmorejo`,`Salmorejo`,`Salmorejo`,`Salmorejo`,180,200,`ml`,`B`,`veg`],[`es_pisto`,`Pisto (vegetable stew)`,`Pisto (verdure stufate)`,`Pisto (duszone warzywa)`,150,200,`g`,`A`,`veg`],[`es_pulpo`,`Galician octopus`,`Polpo alla galiziana`,`Ośmiornica po galicyjsku`,250,200,`g`,`B`,`protein`],[`es_boquerones`,`Marinated anchovies`,`Alici marinate (boquerones)`,`Marynowane sardele (boquerones)`,100,80,`g`,`B`,`protein`],[`es_pan_tomate`,`Bread with tomato`,`Pane con pomodoro (pan con tomate)`,`Chleb z pomidorem`,150,80,`g`,`B`,`grain`],[`es_ensalada_mixta`,`Mixed salad`,`Insalata mista`,`Sałatka mieszana`,120,200,`g`,`A`,`veg`],[`es_esparragos`,`White asparagus`,`Asparagi bianchi`,`Białe szparagi`,30,120,`g`,`A`,`veg`],[`es_naranja`,`Valencia orange`,`Arancia di Valencia`,`Pomarańcza z Walencji`,62,130,`g`,`A`,`fruit`],[`es_garbanzos`,`Chickpeas with spinach`,`Ceci con spinaci`,`Ciecierzyca ze szpinakiem`,250,250,`g`,`A`,`legume`],[`es_churros_es`,`Churros with hot chocolate`,`Churros con cioccolata calda`,`Churros z gorącą czekoladą`,500,200,`g`,`E`,`fried`],[`es_bravas`,`Patatas bravas`,`Patatas bravas`,`Patatas bravas`,400,200,`g`,`D`,`fried`],[`es_bocadillo_calamares`,`Fried squid sandwich`,`Panino con calamari fritti`,`Kanapka z kalmarami`,550,250,`g`,`D`,`fried`],[`es_croquetas`,`Croquettes`,`Crocchette (croquetas)`,`Krokiety (croquetas)`,300,120,`g`,`D`,`fried`],[`es_magdalenas`,`Packaged muffins`,`Magdalenas confezionate`,`Babeczki z paczki`,200,60,`g`,`E`,`sugar`],[`es_ensaimada`,`Ensaimada`,`Ensaimada`,`Ensaimada`,400,100,`g`,`E`,`sugar`],[`es_torrijas`,`Torrijas`,`Torrijas (pane fritto dolce)`,`Torrijas (słodkie smażone pieczywo)`,350,120,`g`,`E`,`fried`],[`es_bocadillo_chorizo`,`Chorizo sandwich`,`Panino al chorizo`,`Kanapka z chorizo`,500,200,`g`,`D`,`fatty`],[`es_horchata_chufa`,`Tiger-nut horchata`,`Horchata de chufa`,`Horchata z cibory`,250,350,`ml`,`E`,`sugar`],[`es_crema_catalana`,`Crema catalana`,`Crema catalana`,`Krem kataloński`,300,150,`g`,`E`,`sugar`]]},{id:`greece`,order:9,country:`GR`,mint:null,name:{en:`Greece`,it:`Grecia`,pl:`Grecja`},accessory:{en:`Olive wreath`,it:`Corona d'ulivo`,pl:`Wieniec oliwny`},accessoryKind:`wreath`,fact:{en:`Greece: a real Greek salad has no lettuce — tomato, cucumber, onion, olives and feta.`,it:`Grecia: la vera insalata greca non ha lattuga — pomodoro, cetriolo, cipolla, olive e feta.`,pl:`Grecja: prawdziwa sałatka grecka nie ma sałaty — pomidor, ogórek, cebula, oliwki i feta.`},palette:[`#0d5eaf`,`#ffffff`],stripes:`h5`,bg:`#e0ecf9`,logo:`logos/greece.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_GR_greece_1024.png`,foods:[[`gr_horiatiki`,`Greek salad`,`Insalata greca`,`Sałatka grecka`,250,250,`g`,`B`,`veg`],[`gr_tzatziki`,`Tzatziki with cucumber`,`Tzatziki con cetriolo`,`Tzatziki z ogórkiem`,120,180,`g`,`A`,`dairy`],[`gr_fasolada`,`Fasolada bean soup`,`Fasolada (zuppa di fagioli)`,`Fasolada (zupa fasolowa)`,250,300,`ml`,`A`,`legume`],[`gr_gemista`,`Stuffed tomatoes and peppers`,`Gemista (pomodori e peperoni ripieni)`,`Gemista (faszerowane pomidory i papryki)`,250,300,`g`,`A`,`veg`],[`gr_horta`,`Wild greens with lemon`,`Horta (verdure selvatiche al limone)`,`Horta (dzikie warzywa z cytryną)`,60,150,`g`,`A`,`veg`],[`gr_fava`,`Yellow split pea purée`,`Fava (crema di piselli gialli)`,`Fava (pasta z żółtego groszku)`,180,150,`g`,`A`,`legume`],[`gr_tsipoura`,`Grilled sea bream`,`Orata alla griglia`,`Grillowana dorada`,200,150,`g`,`A`,`protein`],[`gr_kalamata`,`Kalamata olives`,`Olive Kalamata`,`Oliwki Kalamata`,45,30,`g`,`B`,`veg`],[`gr_yogurt_honey`,`Greek yogurt with honey and walnuts`,`Yogurt greco con miele e noci`,`Jogurt grecki z miodem i orzechami`,200,170,`g`,`B`,`dairy`],[`gr_dolmades`,`Dolmades (stuffed vine leaves)`,`Dolmades (foglie di vite ripiene)`,`Dolmades (gołąbki w liściach winorośli)`,180,120,`g`,`B`,`grain`],[`gr_gyros`,`Gyros pita with fries`,`Pita gyros con patatine`,`Pita gyros z frytkami`,600,300,`g`,`D`,`fatty`],[`gr_baklava`,`Baklava`,`Baklava`,`Baklawa`,330,80,`g`,`E`,`sugar`],[`gr_loukoumades`,`Loukoumades (honey doughnuts)`,`Loukoumades (frittelle al miele)`,`Loukoumades (pączki w miodzie)`,350,100,`g`,`E`,`fried`],[`gr_spanakopita`,`Spanakopita`,`Spanakopita (sfoglia agli spinaci)`,`Spanakopita (ciasto ze szpinakiem)`,300,120,`g`,`D`,`fatty`],[`gr_moussaka`,`Moussaka`,`Moussaka`,`Musaka`,500,300,`g`,`D`,`fatty`],[`gr_bougatsa`,`Bougatsa`,`Bougatsa (sfoglia alla crema)`,`Bougatsa (ciasto z kremem)`,350,130,`g`,`E`,`sugar`],[`gr_galaktoboureko`,`Galaktoboureko`,`Galaktoboureko`,`Galaktoboureko`,350,130,`g`,`E`,`sugar`],[`gr_saganaki`,`Fried cheese saganaki`,`Saganaki (formaggio fritto)`,`Saganaki (smażony ser)`,350,100,`g`,`D`,`fried`],[`gr_pastitsio`,`Pastitsio`,`Pastitsio (pasticcio al forno)`,`Pastitsio (zapiekanka makaronowa)`,550,300,`g`,`D`,`fatty`],[`gr_kourabiedes`,`Kourabiedes butter cookies`,`Kourabiedes (biscotti al burro)`,`Kurabiedes (maślane ciasteczka)`,250,50,`g`,`E`,`sugar`]]},{id:`turkey`,order:10,country:`TR`,mint:null,name:{en:`Türkiye`,it:`Turchia`,pl:`Turcja`},accessory:{en:`Red-and-white apron`,it:`Grembiule bianco e rosso`,pl:`Biało-czerwony fartuch`},accessoryKind:`none`,fact:{en:`Türkiye: red lentil soup (mercimek çorbası) is a warm everyday classic.`,it:`Turchia: la zuppa di lenticchie rosse (mercimek çorbası) è un classico di tutti i giorni.`,pl:`Turcja: zupa z czerwonej soczewicy (mercimek çorbası) to codzienna klasyka.`},palette:[`#e30a17`,`#ffffff`],stripes:`h`,bg:`#fde2e3`,logo:`logos/turkey.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_TR_turkey_1024.png`,foods:[[`tr_mercimek`,`Red lentil soup`,`Zuppa di lenticchie rosse`,`Zupa z czerwonej soczewicy`,180,300,`ml`,`A`,`legume`],[`tr_coban`,`Shepherd's salad`,`Insalata del pastore (çoban)`,`Sałatka pasterska (çoban)`,90,200,`g`,`A`,`veg`],[`tr_cacik`,`Cacık (yogurt and cucumber)`,`Cacık (yogurt e cetriolo)`,`Cacık (jogurt z ogórkiem)`,80,200,`ml`,`A`,`dairy`],[`tr_imam_bayildi`,`Imam bayıldı (stuffed eggplant)`,`Imam bayıldı (melanzane ripiene)`,`Imam bayıldı (faszerowany bakłażan)`,250,250,`g`,`B`,`veg`],[`tr_ezme`,`Ezme (spicy tomato dip)`,`Ezme (salsa di pomodoro piccante)`,`Ezme (pikantna pasta pomidorowa)`,60,100,`g`,`A`,`veg`],[`tr_kuru_fasulye`,`White bean stew`,`Stufato di fagioli bianchi`,`Gulasz z białej fasoli`,300,300,`g`,`B`,`legume`],[`tr_bulgur`,`Bulgur pilaf`,`Pilaf di bulgur`,`Pilaw z bulguru`,220,200,`g`,`A`,`grain`],[`tr_levrek`,`Grilled sea bass`,`Branzino alla griglia`,`Grillowany labraks`,200,150,`g`,`A`,`protein`],[`tr_ayran`,`Ayran (yogurt drink)`,`Ayran (bevanda di yogurt)`,`Ajran (napój jogurtowy)`,80,250,`ml`,`A`,`dairy`],[`tr_apricots_dried`,`Dried apricots`,`Albicocche secche di Malatya`,`Suszone morele z Malatyi`,70,30,`g`,`B`,`fruit`],[`tr_doner`,`Döner wrap`,`Kebab döner arrotolato`,`Döner w tortilli`,600,300,`g`,`D`,`fatty`],[`tr_kunefe`,`Künefe`,`Künefe`,`Künefe`,450,150,`g`,`E`,`sugar`],[`tr_lokum`,`Turkish delight`,`Lokum (delizia turca)`,`Rachatłukum`,160,50,`g`,`E`,`sugar`],[`tr_pide`,`Cheese pide`,`Pide al formaggio`,`Pide z serem`,550,250,`g`,`D`,`fatty`],[`tr_kokorec`,`Kokoreç sandwich`,`Panino kokoreç`,`Kanapka kokoreç`,500,250,`g`,`D`,`fatty`],[`tr_sucuk`,`Sucuk sausage sandwich`,`Panino con salsiccia sucuk`,`Kanapka z kiełbasą sucuk`,450,180,`g`,`D`,`ultra`],[`tr_tulumba`,`Tulumba (fried syrup dough)`,`Tulumba (frittelle allo sciroppo)`,`Tulumba (smażone ciasto w syropie)`,350,100,`g`,`E`,`fried`],[`tr_kazandibi`,`Kazandibi milk pudding`,`Kazandibi (budino caramellato)`,`Kazandibi (karmelizowany budyń)`,300,150,`g`,`E`,`sugar`],[`tr_islak_burger`,`Wet burger (ıslak)`,`Hamburger bagnato (ıslak)`,`Mokry burger (ıslak)`,350,130,`g`,`D`,`ultra`],[`tr_revani`,`Revani semolina cake`,`Revani (torta di semolino)`,`Revani (ciasto z kaszy manny)`,350,120,`g`,`E`,`sugar`]]},{id:`china`,order:11,country:`CN`,mint:null,name:{en:`China`,it:`Cina`,pl:`Chiny`},accessory:{en:`Red and gold headband`,it:`Fascia rossa e oro`,pl:`Czerwono-złota opaska`},accessoryKind:`band`,fact:{en:`China: steaming is one of the oldest cooking methods — it keeps flavour with very little oil.`,it:`Cina: la cottura al vapore è tra le più antiche — conserva il gusto con pochissimo olio.`,pl:`Chiny: gotowanie na parze to jedna z najstarszych metod — zachowuje smak przy minimum oleju.`},palette:[`#de2910`,`#ffde00`],stripes:`h2`,bg:`#fde4dc`,logo:`logos/china.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_CN_china_1024.png`,foods:[[`cn_steamed_fish`,`Steamed fish with ginger`,`Pesce al vapore con zenzero`,`Ryba na parze z imbirem`,180,150,`g`,`A`,`protein`],[`cn_bok_choy`,`Garlic bok choy`,`Bok choy all'aglio`,`Bok choy z czosnkiem`,60,150,`g`,`A`,`veg`],[`cn_congee`,`Congee (rice porridge)`,`Congee (porridge di riso)`,`Congee (kleik ryżowy)`,120,300,`g`,`B`,`grain`],[`cn_tofu_stirfry`,`Tofu and vegetable stir-fry`,`Tofu saltato con verdure`,`Tofu smażone z warzywami`,200,250,`g`,`A`,`legume`],[`cn_jiaozi`,`Steamed vegetable dumplings`,`Ravioli al vapore di verdure`,`Pierożki na parze z warzywami`,220,150,`g`,`B`,`grain`],[`cn_hot_sour`,`Hot and sour soup`,`Zuppa agropiccante`,`Zupa kwaśno-ostra`,120,300,`ml`,`B`,`veg`],[`cn_cucumber_salad`,`Smashed cucumber salad`,`Insalata di cetrioli schiacciati`,`Sałatka z tłuczonych ogórków`,60,150,`g`,`A`,`veg`],[`cn_lotus_root`,`Lotus root salad`,`Insalata di radice di loto`,`Sałatka z korzenia lotosu`,80,120,`g`,`A`,`veg`],[`cn_tea_egg`,`Tea egg`,`Uovo al tè`,`Jajko w herbacie`,78,50,`g`,`A`,`protein`],[`cn_oolong`,`Oolong tea`,`Tè oolong`,`Herbata oolong`,2,250,`ml`,`A`,`water`],[`cn_sweet_sour_pork`,`Sweet and sour pork`,`Maiale in agrodolce`,`Wieprzowina słodko-kwaśna`,500,250,`g`,`D`,`fried`],[`cn_spring_rolls`,`Fried spring rolls`,`Involtini primavera fritti`,`Smażone sajgonki`,300,120,`g`,`D`,`fried`],[`cn_fried_rice`,`Fried rice with sausage`,`Riso fritto con salsiccia`,`Smażony ryż z kiełbasą`,450,300,`g`,`D`,`fatty`],[`cn_egg_tart`,`Egg tarts`,`Tortine all'uovo`,`Babeczki z budyniem`,220,70,`g`,`E`,`sugar`],[`cn_mooncake`,`Mooncake`,`Torta della luna`,`Ciastko księżycowe`,400,100,`g`,`E`,`sugar`],[`cn_youtiao`,`Youtiao (fried dough sticks)`,`Youtiao (bastoni di pasta fritta)`,`Youtiao (smażone paluchy)`,300,80,`g`,`E`,`fried`],[`cn_sesame_balls`,`Sesame balls`,`Palline di sesamo fritte`,`Kulki sezamowe`,300,100,`g`,`E`,`fried`],[`cn_char_siu_bao`,`Char siu bao (BBQ pork bun)`,`Char siu bao (panino al maiale)`,`Char siu bao (bułka z wieprzowiną)`,250,100,`g`,`D`,`ultra`],[`cn_chow_mein`,`Fried chow mein noodles`,`Noodle fritti chow mein`,`Smażony makaron chow mein`,450,300,`g`,`D`,`fatty`],[`cn_crispy_duck`,`Crispy duck with pancakes`,`Anatra croccante con crêpes`,`Chrupiąca kaczka z naleśnikami`,450,200,`g`,`D`,`fatty`]]},{id:`korea`,order:12,country:`KR`,mint:null,name:{en:`South Korea`,it:`Corea del Sud`,pl:`Korea Południowa`},accessory:{en:`K-pop headset`,it:`Cuffie K-pop`,pl:`Słuchawki K-pop`},accessoryKind:`headset`,fact:{en:`Korea: kimjang — making kimchi together for winter — is UNESCO heritage (2013).`,it:`Corea: il kimjang — preparare insieme il kimchi per l'inverno — è patrimonio UNESCO (2013).`,pl:`Korea: kimjang — wspólne robienie kimchi na zimę — jest dziedzictwem UNESCO (2013).`},palette:[`#cd2e3a`,`#ffffff`,`#0047a0`],stripes:`h`,bg:`#e6ecf7`,logo:`logos/korea.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_KR_korea_1024.png`,foods:[[`kr_bibimbap`,`Bibimbap`,`Bibimbap`,`Bibimbap`,550,400,`g`,`B`,`grain`],[`kr_kimchi`,`Kimchi`,`Kimchi`,`Kimchi`,23,100,`g`,`A`,`veg`],[`kr_doenjang`,`Soybean paste stew`,`Stufato di pasta di soia (doenjang)`,`Gulasz z pasty sojowej (doenjang)`,150,300,`ml`,`A`,`legume`],[`kr_namul`,`Seasoned vegetables (namul)`,`Verdure condite (namul)`,`Przyprawione warzywa (namul)`,60,100,`g`,`A`,`veg`],[`kr_mackerel_kr`,`Grilled mackerel`,`Sgombro alla griglia`,`Grillowana makrela`,300,150,`g`,`A`,`protein`],[`kr_sundubu`,`Soft tofu stew`,`Stufato di tofu morbido`,`Gulasz z miękkiego tofu`,200,350,`ml`,`A`,`legume`],[`kr_kimbap`,`Vegetable kimbap`,`Kimbap di verdure`,`Kimbap warzywny`,300,200,`g`,`B`,`grain`],[`kr_miyeok`,`Seaweed soup`,`Zuppa di alghe (miyeok-guk)`,`Zupa z wodorostów (miyeok-guk)`,60,300,`ml`,`A`,`veg`],[`kr_boricha`,`Roasted barley tea`,`Tè d'orzo tostato`,`Herbata z prażonego jęczmienia`,0,250,`ml`,`A`,`water`],[`kr_korean_pear`,`Korean pear`,`Pera coreana`,`Gruszka koreańska`,100,200,`g`,`A`,`fruit`],[`kr_fried_chicken_kr`,`Korean fried chicken`,`Pollo fritto coreano`,`Koreański smażony kurczak`,600,250,`g`,`D`,`fried`],[`kr_tteokbokki`,`Tteokbokki`,`Tteokbokki (gnocchi di riso piccanti)`,`Tteokbokki (ostre kluski ryżowe)`,400,250,`g`,`D`,`ultra`],[`kr_ramyeon`,`Spicy instant ramyeon`,`Ramyeon istantaneo piccante`,`Ostre zupki ramyeon`,500,120,`g`,`E`,`ultra`],[`kr_hotteok`,`Hotteok (sweet pancake)`,`Hotteok (frittella dolce)`,`Hotteok (słodki placek)`,230,80,`g`,`E`,`sugar`],[`kr_bingsu`,`Bingsu with condensed milk`,`Bingsu con latte condensato`,`Bingsu z mlekiem skondensowanym`,450,300,`g`,`E`,`sugar`],[`kr_corn_dog_kr`,`Korean sugar corn dog`,`Corn dog coreano allo zucchero`,`Koreański corn dog w cukrze`,400,150,`g`,`E`,`fried`],[`kr_budae`,`Army stew with sausages`,`Stufato budae con salsicce`,`Gulasz budae z parówkami`,550,400,`g`,`D`,`ultra`],[`kr_banana_milk`,`Banana milk`,`Latte alla banana`,`Mleko bananowe`,200,240,`ml`,`E`,`sugar`],[`kr_honey_butter_chips`,`Honey-butter chips`,`Patatine miele e burro`,`Chipsy miodowo-maślane`,280,50,`g`,`E`,`salty`],[`kr_gyeran_ppang`,`Egg bread`,`Pane all'uovo (gyeran-ppang)`,`Chlebek z jajkiem (gyeran-ppang)`,250,90,`g`,`D`,`sugar`]]},{id:`thailand`,order:13,country:`TH`,mint:null,name:{en:`Thailand`,it:`Thailandia`,pl:`Tajlandia`},accessory:{en:`Jasmine garland`,it:`Ghirlanda di gelsomino`,pl:`Girlanda z jaśminu`},accessoryKind:`lei`,fact:{en:`Thailand: Thai cooking balances four tastes — sour, sweet, salty and spicy.`,it:`Thailandia: la cucina thai bilancia quattro sapori — aspro, dolce, salato e piccante.`,pl:`Tajlandia: kuchnia tajska łączy cztery smaki — kwaśny, słodki, słony i ostry.`},palette:[`#a51931`,`#f4f5f8`,`#2d2a4a`],stripes:`th`,bg:`#e9e7f3`,logo:`logos/thailand.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_TH_thailand_1024.png`,foods:[[`th_tom_yum`,`Tom yum soup`,`Zuppa tom yum`,`Zupa tom yum`,100,300,`ml`,`A`,`veg`],[`th_som_tam`,`Green papaya salad`,`Insalata di papaya verde`,`Sałatka z zielonej papai`,120,200,`g`,`A`,`veg`],[`th_larb`,`Larb chicken salad`,`Insalata di pollo larb`,`Sałatka larb z kurczakiem`,220,200,`g`,`A`,`protein`],[`th_tom_kha`,`Tom kha coconut soup`,`Zuppa al cocco tom kha`,`Zupa kokosowa tom kha`,250,300,`ml`,`B`,`veg`],[`th_pla_pao`,`Herb-grilled fish`,`Pesce alla griglia alle erbe`,`Ryba grillowana z ziołami`,200,150,`g`,`A`,`protein`],[`th_pomelo_salad`,`Pomelo salad`,`Insalata di pomelo`,`Sałatka z pomelo`,120,200,`g`,`A`,`fruit`],[`th_jasmine_rice`,`Steamed jasmine rice`,`Riso jasmine al vapore`,`Ryż jaśminowy na parze`,200,150,`g`,`B`,`grain`],[`th_morning_glory`,`Stir-fried morning glory`,`Spinacio d'acqua saltato`,`Smażony szpinak wodny`,80,150,`g`,`A`,`veg`],[`th_mango_fresh`,`Fresh mango`,`Mango fresco`,`Świeże mango`,90,150,`g`,`A`,`fruit`],[`th_coconut_water`,`Fresh coconut water`,`Acqua di cocco fresca`,`Świeża woda kokosowa`,60,330,`ml`,`B`,`water`],[`th_pad_thai`,`Pad thai`,`Pad thai`,`Pad thai`,600,350,`g`,`D`,`fatty`],[`th_mango_sticky`,`Mango sticky rice`,`Riso glutinoso al mango`,`Kleisty ryż z mango`,450,250,`g`,`D`,`sugar`],[`th_cha_yen`,`Thai milk tea`,`Tè thai al latte`,`Tajska herbata z mlekiem`,250,350,`ml`,`E`,`sugar`],[`th_por_pia`,`Fried spring rolls (por pia)`,`Involtini fritti (por pia)`,`Smażone sajgonki (por pia)`,300,120,`g`,`D`,`fried`],[`th_moo_ping`,`Sweet grilled pork skewers`,`Spiedini di maiale dolci`,`Słodkie szaszłyki wieprzowe`,300,120,`g`,`D`,`fatty`],[`th_roti_condensed`,`Roti with condensed milk`,`Roti con latte condensato`,`Roti z mlekiem skondensowanym`,450,150,`g`,`E`,`sugar`],[`th_kluay_tod`,`Fried bananas`,`Banane fritte`,`Smażone banany`,300,150,`g`,`E`,`fried`],[`th_gai_tod`,`Thai fried chicken`,`Pollo fritto thai`,`Tajski smażony kurczak`,450,200,`g`,`D`,`fried`],[`th_coconut_icecream`,`Coconut ice cream with toppings`,`Gelato al cocco con guarnizioni`,`Lody kokosowe z dodatkami`,300,150,`g`,`E`,`sugar`],[`th_khanom_chan`,`Layered sweet (khanom chan)`,`Dolce a strati (khanom chan)`,`Warstwowy deser (khanom chan)`,200,80,`g`,`E`,`sugar`]]},{id:`vietnam`,order:14,country:`VN`,mint:null,name:{en:`Vietnam`,it:`Vietnam`,pl:`Wietnam`},accessory:{en:`Nón lá conical hat`,it:`Cappello conico nón lá`,pl:`Stożkowy kapelusz nón lá`},accessoryKind:`cone_hat`,fact:{en:`Vietnam: meals come with a plate of fresh herbs — mint, basil, coriander — to add yourself.`,it:`Vietnam: i pasti arrivano con un piatto di erbe fresche — menta, basilico, coriandolo — da aggiungere.`,pl:`Wietnam: do posiłku podaje się talerz świeżych ziół — mięty, bazylii, kolendry.`},palette:[`#da251d`,`#ffff00`],stripes:`star`,bg:`#fde6dc`,logo:`logos/vietnam.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_VN_vietnam_1024.png`,foods:[[`vn_pho`,`Beef pho`,`Phở di manzo`,`Zupa phở z wołowiną`,450,500,`g`,`B`,`grain`],[`vn_goi_cuon`,`Fresh spring rolls`,`Involtini freschi (gỏi cuốn)`,`Świeże sajgonki (gỏi cuốn)`,160,150,`g`,`A`,`veg`],[`vn_canh_chua`,`Sour fish soup`,`Zuppa agra di pesce (canh chua)`,`Kwaśna zupa rybna (canh chua)`,150,350,`ml`,`A`,`protein`],[`vn_ca_kho`,`Caramelised clay-pot fish`,`Pesce caramellato in coccio`,`Ryba karmelizowana w glinianym garnku`,250,150,`g`,`B`,`protein`],[`vn_banh_cuon`,`Steamed rice rolls`,`Involtini di riso al vapore`,`Rolki ryżowe na parze`,250,200,`g`,`B`,`grain`],[`vn_herb_plate`,`Fresh herb plate`,`Piatto di erbe fresche`,`Talerz świeżych ziół`,20,80,`g`,`A`,`veg`],[`vn_tofu_tomato`,`Tofu in tomato sauce`,`Tofu al pomodoro`,`Tofu w sosie pomidorowym`,200,200,`g`,`A`,`legume`],[`vn_dragon_fruit`,`Dragon fruit`,`Frutto del drago`,`Pitaja`,90,150,`g`,`A`,`fruit`],[`vn_tra_da`,`Iced green tea`,`Tè verde freddo (trà đá)`,`Mrożona zielona herbata (trà đá)`,2,250,`ml`,`A`,`water`],[`vn_chao_ga`,`Chicken rice porridge`,`Porridge di riso al pollo (cháo gà)`,`Kleik ryżowy z kurczakiem (cháo gà)`,200,300,`g`,`A`,`grain`],[`vn_banh_mi`,`Bánh mì with pâté and mayo`,`Bánh mì con paté e maionese`,`Bánh mì z pasztetem i majonezem`,500,250,`g`,`D`,`ultra`],[`vn_cha_gio`,`Fried spring rolls (chả giò)`,`Involtini fritti (chả giò)`,`Smażone sajgonki (chả giò)`,350,120,`g`,`D`,`fried`],[`vn_che_ba_mau`,`Three-colour sweet dessert`,`Dolce dei tre colori (chè ba màu)`,`Deser trzech kolorów (chè ba màu)`,300,250,`g`,`E`,`sugar`],[`vn_banh_xeo`,`Crispy fried pancake`,`Crêpe croccante fritta (bánh xèo)`,`Chrupiący smażony naleśnik (bánh xèo)`,450,250,`g`,`D`,`fried`],[`vn_xoi_man`,`Sticky rice with sausage`,`Riso glutinoso con salsiccia`,`Kleisty ryż z kiełbasą`,450,250,`g`,`D`,`fatty`],[`vn_banh_tieu`,`Hollow fried doughnut`,`Ciambella fritta vuota (bánh tiêu)`,`Pusty smażony pączek (bánh tiêu)`,250,70,`g`,`E`,`fried`],[`vn_nem_chua_ran`,`Fried fermented pork rolls`,`Involtini di maiale fritti`,`Smażone roladki wieprzowe`,350,120,`g`,`D`,`fried`],[`vn_sugarcane`,`Sugarcane juice`,`Succo di canna da zucchero`,`Sok z trzciny cukrowej`,180,300,`ml`,`E`,`sugar`],[`vn_flan_vn`,`Flan with condensed milk`,`Flan con latte condensato`,`Flan z mlekiem skondensowanym`,250,120,`g`,`E`,`sugar`],[`vn_banh_phong_tom`,`Prawn crackers`,`Nuvolette di gamberi`,`Chipsy krewetkowe`,270,50,`g`,`E`,`fried`]]},{id:`brazil`,order:15,country:`BR`,mint:null,name:{en:`Brazil`,it:`Brasile`,pl:`Brazylia`},accessory:{en:`Green and yellow headband`,it:`Fascia verde e oro`,pl:`Zielono-żółta opaska`},accessoryKind:`band`,fact:{en:`Brazil: rice and beans (arroz com feijão) are eaten almost every day — a perfect protein team.`,it:`Brasile: riso e fagioli (arroz com feijão) si mangiano quasi ogni giorno — una squadra perfetta di proteine.`,pl:`Brazylia: ryż z fasolą (arroz com feijão) je się prawie codziennie — idealna para białek.`},palette:[`#009c3b`,`#ffdf00`,`#002776`],stripes:`br`,bg:`#e0f4e6`,logo:`logos/brazil.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_BR_brazil_1024.png`,foods:[[`br_arroz_feijao`,`Rice and beans`,`Riso e fagioli (arroz com feijão)`,`Ryż z fasolą (arroz com feijão)`,350,300,`g`,`A`,`legume`],[`br_moqueca`,`Fish moqueca`,`Moqueca di pesce`,`Moqueca rybna`,350,300,`g`,`B`,`protein`],[`br_acai_puro`,`Pure açaí (no sugar)`,`Açaí puro (senza zucchero)`,`Czyste açaí (bez cukru)`,120,200,`g`,`A`,`fruit`],[`br_palmito`,`Heart of palm salad`,`Insalata di cuori di palma`,`Sałatka z serc palmy`,60,150,`g`,`A`,`veg`],[`br_couve`,`Sautéed collard greens`,`Cavolo nero saltato (couve)`,`Smażony jarmuż (couve)`,80,100,`g`,`A`,`veg`],[`br_mandioca`,`Boiled cassava`,`Manioca bollita`,`Gotowany maniok`,200,150,`g`,`B`,`veg`],[`br_mamao`,`Papaya`,`Papaya`,`Papaja`,60,150,`g`,`A`,`fruit`],[`br_caju`,`Cashew fruit`,`Frutto dell'anacardio (caju)`,`Owoc nerkowca (caju)`,50,100,`g`,`A`,`fruit`],[`br_frango_grelhado`,`Grilled chicken`,`Pollo alla griglia`,`Grillowany kurczak`,250,150,`g`,`A`,`protein`],[`br_agua_coco`,`Coconut water`,`Acqua di cocco`,`Woda kokosowa`,60,330,`ml`,`B`,`water`],[`br_coxinha`,`Coxinha`,`Coxinha (crocchetta di pollo)`,`Coxinha (krokiet z kurczakiem)`,300,100,`g`,`D`,`fried`],[`br_pastel`,`Pastel de feira`,`Pastel fritto`,`Smażony pastel`,400,150,`g`,`E`,`fried`],[`br_brigadeiro`,`Brigadeiros`,`Brigadeiros`,`Brigadeiros`,240,50,`g`,`E`,`sugar`],[`br_pao_queijo`,`Cheese bread`,`Pão de queijo`,`Pão de queijo (serowe bułeczki)`,300,100,`g`,`D`,`fatty`],[`br_feijoada`,`Feijoada with pork`,`Feijoada con maiale`,`Feijoada z wieprzowiną`,700,400,`g`,`D`,`fatty`],[`br_picanha`,`Picanha with farofa`,`Picanha con farofa`,`Picanha z farofą`,700,300,`g`,`D`,`fatty`],[`br_guarana`,`Guaraná soda`,`Bibita al guaraná`,`Napój guarana`,140,350,`ml`,`E`,`fizzy`],[`br_acai_tigela`,`Açaí bowl with condensed milk`,`Açaí bowl con latte condensato`,`Açaí bowl z mlekiem skondensowanym`,600,400,`g`,`E`,`sugar`],[`br_beijinho`,`Beijinho coconut sweets`,`Beijinho (dolcetti al cocco)`,`Beijinho (kokosowe słodycze)`,240,50,`g`,`E`,`sugar`],[`br_pudim`,`Pudim (milk flan)`,`Pudim (budino al latte)`,`Pudim (mleczny flan)`,300,120,`g`,`E`,`sugar`]]},{id:`peru`,order:16,country:`PE`,mint:null,name:{en:`Peru`,it:`Perù`,pl:`Peru`},accessory:{en:`Chullo knit hat`,it:`Cappello chullo`,pl:`Czapka chullo`},accessoryKind:`beanie`,fact:{en:`Peru: thousands of potato varieties grow in the Andes — the potato comes from here.`,it:`Perù: sulle Ande crescono migliaia di varietà di patate — la patata viene da qui.`,pl:`Peru: w Andach rosną tysiące odmian ziemniaków — to stąd pochodzą ziemniaki.`},palette:[`#d91023`,`#ffffff`,`#d91023`],stripes:`v`,bg:`#fde3e5`,logo:`logos/peru.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_PE_peru_1024.png`,foods:[[`pe_ceviche_pe`,`Peruvian ceviche`,`Ceviche peruviano`,`Peruwiańskie ceviche`,140,150,`g`,`A`,`protein`],[`pe_quinoa_salad`,`Quinoa salad`,`Insalata di quinoa`,`Sałatka z komosą ryżową`,240,200,`g`,`A`,`grain`],[`pe_choclo_queso`,`Andean corn with cheese`,`Mais andino con formaggio`,`Andyjska kukurydza z serem`,250,200,`g`,`B`,`veg`],[`pe_solterito`,`Solterito (bean and cheese salad)`,`Solterito (insalata di fave e formaggio)`,`Solterito (sałatka z bobu i sera)`,200,200,`g`,`A`,`legume`],[`pe_sopa_quinoa`,`Quinoa soup`,`Zuppa di quinoa`,`Zupa z komosy ryżowej`,180,300,`ml`,`A`,`grain`],[`pe_aguaymanto`,`Golden berries`,`Alchechengi (aguaymanto)`,`Miechunka (aguaymanto)`,50,100,`g`,`A`,`fruit`],[`pe_lucuma`,`Lúcuma fruit`,`Frutto di lúcuma`,`Owoc lukuma`,100,100,`g`,`A`,`fruit`],[`pe_tiradito`,`Tiradito`,`Tiradito (pesce crudo marinato)`,`Tiradito (marynowana surowa ryba)`,150,150,`g`,`A`,`protein`],[`pe_anticuchos`,`Anticuchos skewers`,`Spiedini anticuchos`,`Szaszłyki anticuchos`,250,150,`g`,`B`,`protein`],[`pe_palta_rellena`,`Stuffed avocado`,`Avocado ripieno`,`Faszerowane awokado`,250,200,`g`,`B`,`veg`],[`pe_lomo_saltado`,`Lomo saltado with fries`,`Lomo saltado con patatine`,`Lomo saltado z frytkami`,650,350,`g`,`D`,`fatty`],[`pe_salchipapa`,`Salchipapa`,`Salchipapa (wurstel e patatine)`,`Salchipapa (parówki z frytkami)`,600,300,`g`,`E`,`fried`],[`pe_picarones`,`Picarones with syrup`,`Picarones con sciroppo`,`Picarones z syropem`,450,150,`g`,`E`,`fried`],[`pe_chicha_dulce`,`Sweet chicha morada`,`Chicha morada zuccherata`,`Słodka chicha morada`,160,350,`ml`,`E`,`sugar`],[`pe_gaseosa`,`Golden soda`,`Bibita dorata gassata`,`Złoty napój gazowany`,150,350,`ml`,`E`,`fizzy`],[`pe_alfajores`,`Alfajores`,`Alfajores`,`Alfajores`,200,50,`g`,`E`,`sugar`],[`pe_pollo_brasa`,`Rotisserie chicken with fries`,`Pollo allo spiedo con patatine`,`Kurczak z rożna z frytkami`,800,400,`g`,`D`,`fried`],[`pe_turron_pepa`,`Turrón de Doña Pepa`,`Turrón de Doña Pepa`,`Turrón de Doña Pepa`,350,100,`g`,`E`,`sugar`],[`pe_papa_rellena`,`Fried stuffed potato`,`Patata ripiena fritta`,`Smażony faszerowany ziemniak`,350,180,`g`,`D`,`fried`],[`pe_suspiro`,`Suspiro limeño`,`Suspiro limeño`,`Suspiro limeño`,400,150,`g`,`E`,`sugar`]]},{id:`morocco`,order:17,country:`MA`,mint:null,name:{en:`Morocco`,it:`Marocco`,pl:`Maroko`},accessory:{en:`Red and green scarf`,it:`Sciarpa rossa e verde`,pl:`Czerwono-zielony szalik`},accessoryKind:`scarf`,fact:{en:`Morocco: couscous is UNESCO heritage (2020), shared by Morocco, Algeria, Tunisia and Mauritania.`,it:`Marocco: il couscous è patrimonio UNESCO (2020), condiviso da Marocco, Algeria, Tunisia e Mauritania.`,pl:`Maroko: kuskus jest dziedzictwem UNESCO (2020), wspólnym dla Maroka, Algierii, Tunezji i Mauretanii.`},palette:[`#c1272d`,`#006233`],stripes:`star`,bg:`#fbe3e0`,logo:`logos/morocco.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_MA_morocco_1024.png`,foods:[[`ma_harira`,`Harira soup`,`Zuppa harira`,`Zupa harira`,250,350,`ml`,`A`,`legume`],[`ma_tagine_veg`,`Vegetable tagine`,`Tajine di verdure`,`Tadżin warzywny`,250,300,`g`,`A`,`veg`],[`ma_zaalouk`,`Zaalouk (eggplant salad)`,`Zaalouk (insalata di melanzane)`,`Zaalouk (sałatka z bakłażana)`,120,150,`g`,`A`,`veg`],[`ma_couscous`,`Seven-vegetable couscous`,`Couscous alle sette verdure`,`Kuskus z siedmioma warzywami`,450,350,`g`,`B`,`grain`],[`ma_taktouka`,`Taktouka (pepper and tomato)`,`Taktouka (peperoni e pomodoro)`,`Taktouka (papryka z pomidorami)`,100,150,`g`,`A`,`veg`],[`ma_loubia`,`White bean stew`,`Loubia (stufato di fagioli)`,`Loubia (gulasz z fasoli)`,280,250,`g`,`A`,`legume`],[`ma_sardines_chermoula`,`Sardines with chermoula`,`Sarde alla chermoula`,`Sardynki z chermoulą`,220,120,`g`,`A`,`protein`],[`ma_mint_tea`,`Mint tea without sugar`,`Tè alla menta senza zucchero`,`Herbata miętowa bez cukru`,2,250,`ml`,`A`,`water`],[`ma_medjool`,`Medjool dates`,`Datteri Medjool`,`Daktyle Medjool`,200,72,`g`,`B`,`fruit`],[`ma_orange_cinnamon`,`Orange salad with cinnamon`,`Arance alla cannella`,`Pomarańcze z cynamonem`,90,180,`g`,`A`,`fruit`],[`ma_sweet_mint_tea`,`Very sweet mint tea`,`Tè alla menta molto zuccherato`,`Bardzo słodka herbata miętowa`,120,250,`ml`,`E`,`sugar`],[`ma_chebakia`,`Chebakia (honey sesame cookies)`,`Chebakia (biscotti al miele)`,`Chebakia (ciastka sezamowe w miodzie)`,400,80,`g`,`E`,`sugar`],[`ma_pastilla`,`Sweet chicken pastilla`,`Pastilla dolce di pollo`,`Słodka pastilla z kurczakiem`,500,200,`g`,`D`,`fatty`],[`ma_msemen`,`Msemen with honey`,`Msemen al miele`,`Msemen z miodem`,400,120,`g`,`E`,`sugar`],[`ma_sfenj`,`Sfenj (doughnut)`,`Sfenj (ciambella fritta)`,`Sfenj (pączek)`,300,80,`g`,`E`,`fried`],[`ma_briouats`,`Fried honey briouats`,`Briouats fritti al miele`,`Smażone briouaty w miodzie`,350,100,`g`,`E`,`fried`],[`ma_merguez`,`Merguez sandwich with fries`,`Panino merguez con patatine`,`Kanapka z merguez i frytkami`,650,300,`g`,`D`,`fatty`],[`ma_kaab_ghazal`,`Gazelle horns`,`Corna di gazzella`,`Rogi gazeli`,250,60,`g`,`E`,`sugar`],[`ma_ghriba`,`Ghriba cookies`,`Biscotti ghriba`,`Ciasteczka ghriba`,200,50,`g`,`E`,`sugar`],[`ma_harcha`,`Harcha with butter and jam`,`Harcha con burro e marmellata`,`Harcha z masłem i dżemem`,400,120,`g`,`D`,`sugar`]]},{id:`uk`,order:18,country:`GB`,mint:null,name:{en:`United Kingdom`,it:`Regno Unito`,pl:`Wielka Brytania`},accessory:{en:`Yellow rain hat`,it:`Cappello da pioggia giallo`,pl:`Żółty kapelusz przeciwdeszczowy`},accessoryKind:`fisher_hat`,fact:{en:`United Kingdom: tea is the favourite drink — try it with milk and no sugar.`,it:`Regno Unito: il tè è la bevanda preferita — provalo con latte e senza zucchero.`,pl:`Wielka Brytania: herbata to ulubiony napój — spróbuj z mlekiem, bez cukru.`},palette:[`#012169`,`#ffffff`,`#c8102e`],stripes:`cross`,bg:`#e2e6f2`,logo:`logos/uk.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_GB_uk_1024.png`,foods:[[`gb_porridge_berries`,`Porridge with berries`,`Porridge con frutti di bosco`,`Owsianka z owocami`,250,250,`g`,`A`,`grain`],[`gb_jacket_potato`,`Jacket potato with beans`,`Patata al cartoccio con fagioli`,`Pieczony ziemniak z fasolką`,350,350,`g`,`B`,`veg`],[`gb_mushy_peas`,`Mushy peas`,`Purè di piselli (mushy peas)`,`Puree z groszku (mushy peas)`,120,150,`g`,`A`,`legume`],[`gb_roast_chicken`,`Roast chicken and vegetables`,`Pollo arrosto con verdure`,`Pieczony kurczak z warzywami`,400,350,`g`,`A`,`protein`],[`gb_mackerel_salad`,`Smoked mackerel salad`,`Insalata di sgombro affumicato`,`Sałatka z wędzonej makreli`,300,200,`g`,`A`,`protein`],[`gb_leek_soup`,`Leek and potato soup`,`Zuppa di porri e patate`,`Zupa porowo-ziemniaczana`,180,300,`ml`,`A`,`veg`],[`gb_cucumber_sandwich`,`Wholemeal cucumber sandwich`,`Tramezzino integrale al cetriolo`,`Pełnoziarnista kanapka z ogórkiem`,150,80,`g`,`B`,`grain`],[`gb_kent_strawberries`,`Kent strawberries`,`Fragole del Kent`,`Truskawki z Kentu`,48,150,`g`,`A`,`fruit`],[`gb_watercress`,`Watercress salad`,`Insalata di crescione`,`Sałatka z rukwi wodnej`,30,80,`g`,`A`,`veg`],[`gb_tea_milk`,`Tea with milk, no sugar`,`Tè con latte senza zucchero`,`Herbata z mlekiem bez cukru`,30,250,`ml`,`A`,`water`],[`gb_fish_chips`,`Fish and chips`,`Fish and chips`,`Ryba z frytkami`,800,400,`g`,`D`,`fried`],[`gb_full_english`,`Full English breakfast`,`Colazione inglese completa`,`Pełne angielskie śniadanie`,900,450,`g`,`D`,`fatty`],[`gb_sausage_roll`,`Sausage roll`,`Sfogliatina alla salsiccia`,`Rogalik z kiełbasą`,350,100,`g`,`E`,`ultra`],[`gb_scotch_egg`,`Scotch egg`,`Scotch egg (uovo impanato fritto)`,`Jajko po szkocku`,300,120,`g`,`D`,`fried`],[`gb_chip_butty`,`Chip butty`,`Panino con patatine (chip butty)`,`Kanapka z frytkami (chip butty)`,550,200,`g`,`E`,`fried`],[`gb_fried_choc_bar`,`Deep-fried chocolate bar`,`Barretta di cioccolato fritta`,`Smażony baton czekoladowy`,450,80,`g`,`E`,`fried`],[`gb_sticky_toffee`,`Sticky toffee pudding`,`Sticky toffee pudding`,`Sticky toffee pudding`,500,150,`g`,`E`,`sugar`],[`gb_scones`,`Scones with jam and cream`,`Scones con marmellata e panna`,`Scones z dżemem i śmietaną`,450,150,`g`,`E`,`sugar`],[`gb_mince_pies`,`Mince pies`,`Mince pies (tortine natalizie)`,`Mince pies (świąteczne babeczki)`,250,60,`g`,`E`,`sugar`],[`gb_steak_pie`,`Steak and ale pie`,`Pasticcio di manzo`,`Pasztecik z wołowiną`,600,250,`g`,`D`,`fatty`]]},{id:`germany`,order:19,country:`DE`,mint:null,name:{en:`Germany`,it:`Germania`,pl:`Niemcy`},accessory:{en:`Black-red-gold scarf`,it:`Sciarpa nero-rosso-oro`,pl:`Czarno-czerwono-złoty szalik`},accessoryKind:`scarf`,fact:{en:`Germany: hundreds of kinds of bread — wholegrain rye is a fibre champion.`,it:`Germania: centinaia di tipi di pane — la segale integrale è campionessa di fibre.`,pl:`Niemcy: setki rodzajów chleba — razowy żytni to mistrz błonnika.`},palette:[`#000000`,`#dd0000`,`#ffce00`],stripes:`h3`,bg:`#fdf0cf`,logo:`logos/germany.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_DE_germany_1024.png`,foods:[[`de_linsen`,`Lentil stew`,`Stufato di lenticchie (Linseneintopf)`,`Gulasz z soczewicy (Linseneintopf)`,300,300,`g`,`A`,`legume`],[`de_vollkornbrot`,`Wholegrain rye bread`,`Pane integrale di segale`,`Razowy chleb żytni`,110,50,`g`,`B`,`grain`],[`de_quark`,`Herb quark`,`Quark alle erbe`,`Twarożek z ziołami (Kräuterquark)`,120,150,`g`,`A`,`dairy`],[`de_spargel`,`White asparagus with potatoes`,`Asparagi bianchi con patate`,`Białe szparagi z ziemniakami`,200,300,`g`,`A`,`veg`],[`de_forelle`,`Baked trout`,`Trota al forno`,`Pieczony pstrąg`,220,150,`g`,`A`,`protein`],[`de_rotkohl`,`Braised red cabbage`,`Cavolo rosso stufato`,`Duszona czerwona kapusta`,80,150,`g`,`A`,`veg`],[`de_gurkensalat`,`Cucumber salad`,`Insalata di cetrioli`,`Sałatka z ogórków`,50,150,`g`,`A`,`veg`],[`de_kohlrabi`,`Kohlrabi sticks`,`Bastoncini di cavolo rapa`,`Paluszki z kalarepy`,27,100,`g`,`A`,`veg`],[`de_erbsensuppe`,`Pea soup`,`Zuppa di piselli`,`Zupa grochowa`,250,300,`ml`,`B`,`legume`],[`de_gruenkohl`,`Kale (no sausage)`,`Cavolo riccio (senza salsiccia)`,`Jarmuż (bez kiełbasy)`,80,150,`g`,`A`,`veg`],[`de_currywurst`,`Currywurst with fries`,`Currywurst con patatine`,`Currywurst z frytkami`,750,350,`g`,`D`,`fatty`],[`de_bratwurst`,`Bratwurst in a bun`,`Bratwurst nel panino`,`Bratwurst w bułce`,450,180,`g`,`D`,`fatty`],[`de_schnitzel`,`Schnitzel with fries`,`Cotoletta (Schnitzel) con patatine`,`Sznycel z frytkami`,800,400,`g`,`D`,`fried`],[`de_butterbrezel`,`Butter pretzel`,`Brezel al burro`,`Precel z masłem`,350,110,`g`,`D`,`salty`],[`de_black_forest`,`Black Forest cake`,`Torta Foresta Nera`,`Tort Szwarcwaldzki`,400,130,`g`,`E`,`sugar`],[`de_berliner`,`Berliner (jam doughnut)`,`Berliner (bombolone alla marmellata)`,`Berliner (pączek z dżemem)`,300,80,`g`,`E`,`sugar`],[`de_apfelstrudel`,`Apple strudel with cream`,`Strudel di mele con panna`,`Strudel jabłkowy ze śmietaną`,400,180,`g`,`E`,`sugar`],[`de_leberkaese`,`Leberkäse roll`,`Panino con Leberkäse`,`Bułka z Leberkäse`,500,180,`g`,`D`,`ultra`],[`de_lebkuchen`,`Lebkuchen gingerbread`,`Lebkuchen (pan di zenzero)`,`Lebkuchen (piernik)`,200,50,`g`,`E`,`sugar`],[`de_spezi`,`Cola-orange soda mix`,`Mix di cola e aranciata`,`Mieszanka coli z oranżadą`,150,330,`ml`,`E`,`fizzy`]]},{id:`nigeria`,order:20,country:`NG`,mint:null,name:{en:`Nigeria`,it:`Nigeria`,pl:`Nigeria`},accessory:{en:`Green and white scarf`,it:`Sciarpa verde e bianca`,pl:`Zielono-biały szalik`},accessoryKind:`scarf`,fact:{en:`Nigeria: the world's biggest producer of yams — a staple boiled, pounded or roasted.`,it:`Nigeria: è il primo produttore mondiale di igname — si mangia bollito, pestato o arrosto.`,pl:`Nigeria: największy producent pochrzynu na świecie — je się go gotowanego, tłuczonego lub pieczonego.`},palette:[`#008751`,`#ffffff`,`#008751`],stripes:`v`,bg:`#dff2e8`,logo:`logos/nigeria.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_NG_nigeria_1024.png`,foods:[[`ng_efo_riro`,`Efo riro (spinach stew)`,`Efo riro (stufato di spinaci)`,`Efo riro (gulasz ze szpinaku)`,250,250,`g`,`B`,`veg`],[`ng_moi_moi`,`Moi moi (steamed bean pudding)`,`Moi moi (sformato di fagioli al vapore)`,`Moi moi (budyń z fasoli na parze)`,200,150,`g`,`A`,`legume`],[`ng_okra_soup`,`Okra soup`,`Zuppa di okra`,`Zupa z okry`,150,300,`ml`,`A`,`veg`],[`ng_pepper_soup`,`Fish pepper soup`,`Zuppa di pesce piccante`,`Ostra zupa rybna`,180,350,`ml`,`A`,`protein`],[`ng_garden_egg`,`Garden eggs (African eggplant)`,`Garden eggs (melanzane africane)`,`Garden eggs (afrykański bakłażan)`,25,100,`g`,`A`,`veg`],[`ng_ogi`,`Ogi (fermented corn porridge)`,`Ogi (porridge di mais fermentato)`,`Ogi (fermentowany kleik kukurydziany)`,120,250,`g`,`A`,`grain`],[`ng_yam_sauce`,`Boiled yam with tomato sauce`,`Igname bollito con salsa di pomodoro`,`Gotowany pochrzyn z sosem pomidorowym`,300,250,`g`,`B`,`veg`],[`ng_tilapia`,`Grilled tilapia`,`Tilapia alla griglia`,`Grillowana tilapia`,220,180,`g`,`A`,`protein`],[`ng_ewa`,`Stewed beans (ewa)`,`Fagioli stufati (ewa)`,`Duszona fasola (ewa)`,300,250,`g`,`B`,`legume`],[`ng_kunu`,`Tiger-nut milk (kunu aya)`,`Latte di zigolo (kunu aya)`,`Mleko z cibory (kunu aya)`,150,300,`ml`,`B`,`nuts`],[`ng_puff_puff`,`Puff-puff`,`Puff-puff (frittelle dolci)`,`Puff-puff (słodkie pączki)`,350,100,`g`,`E`,`fried`],[`ng_chin_chin`,`Chin chin`,`Chin chin (biscottini fritti)`,`Chin chin (smażone chrupki)`,250,50,`g`,`E`,`fried`],[`ng_meat_pie`,`Meat pie`,`Pasticcio di carne`,`Pasztecik z mięsem`,350,120,`g`,`D`,`fatty`],[`ng_party_jollof`,`Party jollof with fried chicken`,`Jollof da festa con pollo fritto`,`Imprezowy jollof ze smażonym kurczakiem`,800,450,`g`,`D`,`fatty`],[`ng_dodo`,`Fried plantain (dodo)`,`Platano fritto (dodo)`,`Smażony banan plantan (dodo)`,300,150,`g`,`D`,`fried`],[`ng_akara`,`Akara (bean fritters)`,`Akara (frittelle di fagioli)`,`Akara (placki z fasoli)`,300,120,`g`,`D`,`fried`],[`ng_buns_ng`,`Fried buns`,`Panini dolci fritti`,`Smażone bułeczki`,350,100,`g`,`E`,`fried`],[`ng_malt_drink`,`Sweet malt drink`,`Bevanda al malto zuccherata`,`Słodki napój słodowy`,200,330,`ml`,`E`,`sugar`],[`ng_zobo_sweet`,`Zobo with lots of sugar`,`Zobo molto zuccherato`,`Bardzo słodkie zobo`,150,350,`ml`,`E`,`sugar`],[`ng_agege`,`Agege bread with butter`,`Pane agege con burro`,`Chleb agege z masłem`,400,150,`g`,`E`,`ultra`]]},{id:`indonesia`,order:21,country:`ID`,mint:null,name:{en:`Indonesia`,it:`Indonesia`,pl:`Indonezja`},accessory:{en:`Batik headband (iket)`,it:`Fascia batik (iket)`,pl:`Opaska batikowa (iket)`},accessoryKind:`band`,fact:{en:`Indonesia: tempeh, a fermented soybean cake born in Java, is packed with protein and fibre.`,it:`Indonesia: il tempeh, un panetto di soia fermentata nato a Giava, è ricco di proteine e fibre.`,pl:`Indonezja: tempeh, sfermentowana kostka sojowa z Jawy, jest pełen białka i błonnika.`},palette:[`#ce1126`,`#ffffff`],stripes:`h`,bg:`#fde4e4`,logo:`logos/indonesia.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_ID_indonesia_1024.png`,foods:[[`id_gado_gado`,`Gado-gado (veg with peanut sauce)`,`Gado-gado (verdure con salsa di arachidi)`,`Gado-gado (warzywa z sosem orzechowym)`,350,300,`g`,`B`,`veg`],[`id_tempeh`,`Grilled tempeh`,`Tempeh alla griglia`,`Grillowany tempeh`,200,100,`g`,`A`,`legume`],[`id_sayur_asem`,`Sayur asem (tamarind veg soup)`,`Sayur asem (zuppa di verdure al tamarindo)`,`Sayur asem (zupa warzywna z tamaryndowcem)`,90,300,`g`,`A`,`veg`],[`id_ikan_bakar`,`Grilled fish (ikan bakar)`,`Pesce alla griglia (ikan bakar)`,`Grillowana ryba (ikan bakar)`,220,180,`g`,`A`,`protein`],[`id_soto_ayam`,`Soto ayam (chicken turmeric soup)`,`Soto ayam (zuppa di pollo e curcuma)`,`Soto ayam (zupa z kurczakiem i kurkumą)`,250,350,`ml`,`B`,`protein`],[`id_pepes_ikan`,`Pepes ikan (fish steamed in banana leaf)`,`Pepes ikan (pesce al vapore in foglia di banano)`,`Pepes ikan (ryba gotowana w liściu bananowca)`,180,150,`g`,`A`,`protein`],[`id_urap`,`Urap (veg with grated coconut)`,`Urap (verdure con cocco grattugiato)`,`Urap (warzywa z wiórkami kokosa)`,150,200,`g`,`A`,`veg`],[`id_karedok`,`Karedok (raw veg salad)`,`Karedok (insalata di verdure crude)`,`Karedok (sałatka z surowych warzyw)`,200,200,`g`,`B`,`veg`],[`id_manggis`,`Mangosteen`,`Mangostano`,`Mangostan`,60,100,`g`,`A`,`fruit`],[`id_nasi_merah`,`Red rice`,`Riso rosso`,`Czerwony ryż`,180,150,`g`,`A`,`grain`],[`id_martabak_manis`,`Sweet martabak with chocolate`,`Martabak dolce al cioccolato`,`Słodki martabak z czekoladą`,600,200,`g`,`E`,`sugar`],[`id_gorengan`,`Gorengan (fried snacks)`,`Gorengan (frittelle miste)`,`Gorengan (smażone przekąski)`,400,150,`g`,`E`,`fried`],[`id_krupuk`,`Krupuk crackers`,`Cracker krupuk`,`Krakersy krupuk`,250,50,`g`,`E`,`salty`],[`id_es_teler`,`Es teler (sweet iced fruit cocktail)`,`Es teler (macedonia ghiacciata dolce)`,`Es teler (słodki mrożony koktajl owocowy)`,350,350,`ml`,`E`,`sugar`],[`id_mie_instan`,`Instant fried noodles`,`Noodle fritti istantanei`,`Smażony makaron instant`,450,100,`g`,`E`,`ultra`],[`id_ayam_kremes`,`Crispy fried chicken (ayam kremes)`,`Pollo fritto croccante (ayam kremes)`,`Chrupiący smażony kurczak (ayam kremes)`,550,250,`g`,`D`,`fried`],[`id_nasi_goreng`,`Nasi goreng with fried egg`,`Nasi goreng con uovo fritto`,`Nasi goreng z jajkiem sadzonym`,650,350,`g`,`D`,`fatty`],[`id_rendang`,`Beef rendang`,`Rendang di manzo`,`Rendang wołowy`,500,200,`g`,`D`,`fatty`],[`id_teh_manis`,`Very sweet iced tea`,`Tè freddo molto zuccherato`,`Bardzo słodka mrożona herbata`,180,350,`ml`,`E`,`sugar`],[`id_seblak`,`Seblak (spicy cracker soup)`,`Seblak (zuppa piccante di cracker)`,`Seblak (pikantna zupa z krakersami)`,450,300,`g`,`D`,`salty`]]},{id:`russia`,order:22,country:`RU`,mint:null,name:{en:`Russia`,it:`Russia`,pl:`Rosja`},accessory:{en:`Ushanka fur hat`,it:`Colbacco ushanka`,pl:`Uszanka`},accessoryKind:`ushanka`,fact:{en:`Russia: shchi, a cabbage soup, has warmed families through cold winters for centuries.`,it:`Russia: lo shchi, una zuppa di cavolo, scalda le famiglie negli inverni freddi da secoli.`,pl:`Rosja: szczi, zupa z kapusty, od wieków rozgrzewa rodziny w mroźne zimy.`},palette:[`#ffffff`,`#1c57a5`,`#d52b1e`],stripes:`h`,bg:`#e4ecfa`,logo:`logos/russia.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_RU_russia_1024.png`,foods:[[`ru_shchi`,`Shchi (cabbage soup)`,`Shchi (zuppa di cavolo)`,`Szczi (zupa z kapusty)`,80,300,`ml`,`A`,`veg`],[`ru_grechka`,`Buckwheat with mushrooms`,`Grano saraceno ai funghi`,`Kasza gryczana z grzybami`,200,200,`g`,`A`,`grain`],[`ru_vinegret`,`Vinegret (beet and veg salad)`,`Vinegret (insalata di barbabietole e verdure)`,`Winegret (sałatka z buraków)`,130,200,`g`,`A`,`veg`],[`ru_ukha`,`Ukha (fish soup)`,`Ukha (zuppa di pesce)`,`Ucha (zupa rybna)`,150,350,`ml`,`A`,`protein`],[`ru_tvorog`,`Tvorog with berries`,`Tvorog con frutti di bosco`,`Twaróg z jagodami`,180,180,`g`,`A`,`dairy`],[`ru_ryazhenka`,`Ryazhenka (baked fermented milk)`,`Ryazhenka (latte fermentato cotto)`,`Riażenka (pieczone mleko fermentowane)`,170,250,`ml`,`B`,`dairy`],[`ru_okroshka`,`Okroshka (cold veg soup)`,`Okroshka (zuppa fredda di verdure)`,`Okroszka (chłodnik warzywny)`,150,300,`ml`,`B`,`veg`],[`ru_baked_apples`,`Baked apples`,`Mele al forno`,`Pieczone jabłka`,120,200,`g`,`A`,`fruit`],[`ru_borodinsky`,`Borodinsky rye bread`,`Pane di segale Borodinsky`,`Chleb borodiński`,100,40,`g`,`B`,`grain`],[`ru_griby`,`Pickled mushrooms`,`Funghi marinati`,`Marynowane grzyby`,40,100,`g`,`B`,`veg`],[`ru_blini`,`Blini with condensed milk`,`Blini con latte condensato`,`Bliny z mlekiem skondensowanym`,450,180,`g`,`E`,`sugar`],[`ru_pirozhki`,`Fried pirozhki`,`Pirozhki fritti`,`Smażone pirożki`,400,150,`g`,`D`,`fried`],[`ru_belyashi`,`Belyashi (fried meat buns)`,`Belyashi (panini fritti di carne)`,`Bielasze (smażone bułki z mięsem)`,450,150,`g`,`E`,`fried`],[`ru_chebureki`,`Chebureki (fried meat pastries)`,`Chebureki (sfogliate fritte di carne)`,`Czebureki (smażone pierogi z mięsem)`,500,180,`g`,`E`,`fried`],[`ru_olivier`,`Olivier salad with mayonnaise`,`Insalata Olivier con maionese`,`Sałatka Olivier z majonezem`,400,200,`g`,`D`,`fatty`],[`ru_pelmeni`,`Pelmeni with sour cream and butter`,`Pelmeni con panna acida e burro`,`Pielmieni ze śmietaną i masłem`,550,250,`g`,`D`,`fatty`],[`ru_syrniki`,`Fried syrniki with jam`,`Syrniki fritti con marmellata`,`Smażone syrniki z dżemem`,450,180,`g`,`D`,`sugar`],[`ru_medovik`,`Medovik (honey cake)`,`Medovik (torta al miele)`,`Miodownik (tort miodowy)`,450,120,`g`,`E`,`sugar`],[`ru_shawarma`,`Shawarma wrap`,`Shawarma`,`Szawarma`,650,350,`g`,`D`,`fatty`],[`ru_kartoshka`,`Kartoshka (chocolate cake ball)`,`Kartoshka (dolcetto al cioccolato)`,`Kartoszka (czekoladowe ciastko)`,300,80,`g`,`E`,`sugar`]]},{id:`ukraine`,order:23,country:`UA`,mint:null,name:{en:`Ukraine`,it:`Ucraina`,pl:`Ukraina`},accessory:{en:`Vinok flower crown`,it:`Corona di fiori vinok`,pl:`Wianek (vinok)`},accessoryKind:`vinok`,fact:{en:`Ukraine: the culture of Ukrainian borscht cooking is UNESCO heritage in need of urgent safeguarding (2022).`,it:`Ucraina: la cultura della preparazione del borsch ucraino è patrimonio UNESCO da salvaguardare con urgenza (2022).`,pl:`Ukraina: kultura gotowania ukraińskiego barszczu jest dziedzictwem UNESCO wymagającym pilnej ochrony (2022).`},palette:[`#0057b7`,`#ffd700`],stripes:`h`,bg:`#fff6cc`,logo:`logos/ukraine.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_UA_ukraine_1024.png`,foods:[[`ua_borshch`,`Ukrainian borscht`,`Borsch ucraino`,`Barszcz ukraiński`,120,350,`ml`,`A`,`veg`],[`ua_holubtsi`,`Holubtsi (cabbage rolls)`,`Holubtsi (involtini di cavolo)`,`Hołubci (gołąbki)`,250,250,`g`,`B`,`veg`],[`ua_varenyky`,`Potato varenyky`,`Varenyky di patate`,`Pierogi (wareniki) z ziemniakami`,300,200,`g`,`B`,`grain`],[`ua_uzvar`,`Uzvar (dried-fruit drink, no sugar)`,`Uzvar (bevanda di frutta secca, senza zucchero)`,`Uzwar (napój z suszu, bez cukru)`,60,250,`ml`,`B`,`fruit`],[`ua_kapusniak`,`Kapusniak (sauerkraut soup)`,`Kapusniak (zuppa di crauti)`,`Kapuśniak`,90,300,`ml`,`A`,`veg`],[`ua_syr_zelen`,`Fresh cheese with herbs`,`Formaggio fresco alle erbe`,`Twarożek z ziołami`,160,150,`g`,`A`,`dairy`],[`ua_river_fish`,`Baked river fish`,`Pesce di fiume al forno`,`Pieczona ryba rzeczna`,200,180,`g`,`A`,`protein`],[`ua_pickled_tomatoes`,`Pickled tomatoes`,`Pomodori in salamoia`,`Kiszone pomidory`,30,150,`g`,`B`,`veg`],[`ua_pumpkin_kasha`,`Pumpkin and millet porridge`,`Porridge di zucca e miglio`,`Kasza jaglana z dynią`,200,250,`g`,`A`,`grain`],[`ua_bean_salad`,`Bean and vegetable salad`,`Insalata di fagioli e verdure`,`Sałatka z fasoli i warzyw`,220,200,`g`,`A`,`legume`],[`ua_salo`,`Salo on rye bread`,`Salo (lardo) su pane di segale`,`Słonina na chlebie żytnim`,500,100,`g`,`D`,`fatty`],[`ua_pampushky`,`Sweet fried pampushky`,`Pampushky dolci fritti`,`Słodkie smażone pampuszki`,400,120,`g`,`E`,`fried`],[`ua_kyiv_cake`,`Kyiv cake`,`Torta Kyiv`,`Tort kijowski`,450,120,`g`,`E`,`sugar`],[`ua_deruny`,`Deruny with sour cream`,`Deruny (frittelle di patate) con panna acida`,`Deruny ze śmietaną`,450,200,`g`,`D`,`fried`],[`ua_chicken_kyiv`,`Chicken Kyiv`,`Pollo alla Kyiv`,`Kotlet po kijowsku`,600,250,`g`,`D`,`fried`],[`ua_varenyky_cherry`,`Sour-cherry varenyky with sugar`,`Varenyky alle amarene con zucchero`,`Wareniki z wiśniami i cukrem`,400,200,`g`,`E`,`sugar`],[`ua_banosh`,`Banosh with bacon and bryndza`,`Banosh con pancetta e bryndza`,`Banosz z boczkiem i bryndzą`,600,250,`g`,`D`,`fatty`],[`ua_makivnyk`,`Makivnyk (poppy-seed roll)`,`Makivnyk (rotolo ai semi di papavero)`,`Makownik`,400,100,`g`,`E`,`sugar`],[`ua_halushky`,`Halushky with pork cracklings`,`Halushky con ciccioli`,`Haluszki ze skwarkami`,550,250,`g`,`D`,`fatty`],[`ua_lviv_syrnyk`,`Lviv cheesecake`,`Cheesecake di Leopoli`,`Sernik lwowski`,420,120,`g`,`E`,`sugar`]]},{id:`philippines`,order:24,country:`PH`,mint:null,name:{en:`Philippines`,it:`Filippine`,pl:`Filipiny`},accessory:{en:`Salakot hat`,it:`Cappello salakot`,pl:`Kapelusz salakot`},accessoryKind:`salakot`,fact:{en:`Philippines: sinigang, a sour tamarind soup full of vegetables, is a beloved comfort food.`,it:`Filippine: il sinigang, una zuppa agra al tamarindo piena di verdure, è un piatto del cuore.`,pl:`Filipiny: sinigang, kwaśna zupa z tamaryndowcem pełna warzyw, to ukochane domowe danie.`},palette:[`#0038a8`,`#fcd116`,`#ce1126`],stripes:`h`,bg:`#e3ebff`,logo:`logos/philippines.svg`,tokenLogoPng:`PIKKO_TOKEN_LOGOS/PIKKO_PH_philippines_1024.png`,foods:[[`ph_sinigang`,`Sinigang (sour tamarind soup)`,`Sinigang (zuppa agra al tamarindo)`,`Sinigang (kwaśna zupa z tamaryndowcem)`,150,350,`ml`,`A`,`veg`],[`ph_pinakbet`,`Pinakbet (vegetable stew)`,`Pinakbet (stufato di verdure)`,`Pinakbet (gulasz warzywny)`,160,250,`g`,`A`,`veg`],[`ph_tinola`,`Tinola (chicken ginger soup)`,`Tinola (zuppa di pollo e zenzero)`,`Tinola (zupa z kurczakiem i imbirem)`,200,350,`ml`,`A`,`protein`],[`ph_talong_salad`,`Grilled eggplant salad`,`Insalata di melanzane grigliate`,`Sałatka z grillowanego bakłażana`,80,150,`g`,`A`,`veg`],[`ph_inihaw_isda`,`Grilled fish (inihaw na isda)`,`Pesce alla griglia (inihaw na isda)`,`Grillowana ryba (inihaw na isda)`,220,180,`g`,`A`,`protein`],[`ph_monggo`,`Ginisang monggo (mung bean stew)`,`Ginisang monggo (stufato di fagioli mung)`,`Ginisang monggo (gulasz z fasoli mung)`,250,250,`g`,`A`,`legume`],[`ph_kinilaw`,`Kinilaw (fish cured in vinegar)`,`Kinilaw (pesce marinato nell'aceto)`,`Kinilaw (ryba marynowana w occie)`,150,150,`g`,`B`,`protein`],[`ph_lumpiang_sariwa`,`Fresh lumpia`,`Lumpia fresco`,`Świeża lumpia`,200,150,`g`,`B`,`veg`],[`ph_mangga`,`Philippine mango`,`Mango filippino`,`Mango filipińskie`,100,165,`g`,`A`,`fruit`],[`ph_saging`,`Boiled saba banana`,`Banana saba bollita`,`Gotowany banan saba`,110,100,`g`,`A`,`fruit`],[`ph_lechon`,`Lechon (roast pork with crackling)`,`Lechon (maialino arrosto)`,`Lechon (pieczone prosię)`,600,200,`g`,`D`,`fatty`],[`ph_sisig`,`Sizzling sisig`,`Sisig sfrigolante`,`Skwierczący sisig`,550,200,`g`,`D`,`fatty`],[`ph_chicharon`,`Chicharon (pork rinds)`,`Chicharon (cotenne fritte)`,`Chicharon (smażone skórki wieprzowe)`,300,50,`g`,`E`,`salty`],[`ph_halo_halo`,`Halo-halo`,`Halo-halo (dessert ghiacciato)`,`Halo-halo (deser z kruszonym lodem)`,400,350,`g`,`E`,`sugar`],[`ph_turon`,`Turon (sugared banana roll)`,`Turon (involtino di banana caramellato)`,`Turon (smażony rożek z bananem)`,300,100,`g`,`E`,`fried`],[`ph_banana_cue`,`Banana cue`,`Banana cue (banane caramellate)`,`Banana cue (karmelizowane banany)`,280,120,`g`,`E`,`sugar`],[`ph_spaghetti_ph`,`Sweet spaghetti with hot dog`,`Spaghetti dolci con wurstel`,`Słodkie spaghetti z parówką`,600,300,`g`,`D`,`ultra`],[`ph_kwek_kwek`,`Kwek-kwek (battered quail eggs)`,`Kwek-kwek (uova di quaglia in pastella fritte)`,`Kwek-kwek (jajka przepiórcze w cieście)`,300,100,`g`,`E`,`fried`],[`ph_pancit_instant`,`Instant pancit canton`,`Pancit canton istantaneo`,`Pancit canton instant`,400,80,`g`,`E`,`ultra`],[`ph_longsilog`,`Longsilog (sausage, fried rice, egg)`,`Longsilog (salsiccia, riso fritto, uovo)`,`Longsilog (kiełbaska, smażony ryż, jajko)`,750,350,`g`,`D`,`fatty`]]}]},tu=[`en`,`it`,`pl`,`es`,`fr`,`de`,`pt`,`el`,`tr`,`ar`,`hi`,`zh`,`ja`,`ko`,`th`,`vi`,`id`,`ru`,`uk`,`fil`],nu={en:{native:`English`,dir:`ltr`,locale:`en-GB`,bag:`uk`},it:{native:`Italiano`,dir:`ltr`,locale:`it-IT`,bag:`italy`},pl:{native:`Polski`,dir:`ltr`,locale:`pl-PL`,bag:`poland`},es:{native:`Español`,dir:`ltr`,locale:`es`,bag:`spain`},fr:{native:`Français`,dir:`ltr`,locale:`fr-FR`,bag:`france`},de:{native:`Deutsch`,dir:`ltr`,locale:`de-DE`,bag:`germany`},pt:{native:`Português`,dir:`ltr`,locale:`pt-BR`,bag:`brazil`},el:{native:`Ελληνικά`,dir:`ltr`,locale:`el-GR`,bag:`greece`},tr:{native:`Türkçe`,dir:`ltr`,locale:`tr-TR`,bag:`turkey`},ar:{native:`العربية`,dir:`rtl`,locale:`ar-MA`,bag:`morocco`},hi:{native:`हिन्दी`,dir:`ltr`,locale:`hi-IN`,bag:`india`},zh:{native:`中文`,dir:`ltr`,locale:`zh-CN`,bag:`china`},ja:{native:`日本語`,dir:`ltr`,locale:`ja-JP`,bag:`japan`},ko:{native:`한국어`,dir:`ltr`,locale:`ko-KR`,bag:`korea`},th:{native:`ไทย`,dir:`ltr`,locale:`th-TH`,bag:`thailand`},vi:{native:`Tiếng Việt`,dir:`ltr`,locale:`vi-VN`,bag:`vietnam`},id:{native:`Bahasa Indonesia`,dir:`ltr`,locale:`id-ID`,bag:`indonesia`},ru:{native:`Русский`,dir:`ltr`,locale:`ru-RU`,bag:`russia`},uk:{native:`Українська`,dir:`ltr`,locale:`uk-UA`,bag:`ukraine`},fil:{native:`Filipino`,dir:`ltr`,locale:`fil-PH`,bag:`philippines`}},ru=[`en`,`it`,`pl`],iu=e=>ru.includes(e),au=e=>e===`A`||e===`B`,ou=e=>e===`D`||e===`E`,su=e=>t=>({id:t[0],name:{en:t[1],it:t[2],pl:t[3]},kcal:t[4],qty:t[5],unit:t[6],grade:t[7],cat:t[8],bag:e}),cu=[[`apple`,`Apple`,`Mela`,`Jabłko`,95,180,`g`,`A`,`fruit`],[`banana`,`Banana`,`Banana`,`Banan`,105,120,`g`,`A`,`fruit`],[`carrot`,`Carrot`,`Carota`,`Marchewka`,25,60,`g`,`A`,`veg`],[`broccoli`,`Broccoli`,`Broccoli`,`Brokuł`,35,100,`g`,`A`,`veg`],[`strawberries`,`Strawberries`,`Fragole`,`Truskawki`,48,150,`g`,`A`,`fruit`],[`orange`,`Orange`,`Arancia`,`Pomarańcza`,62,130,`g`,`A`,`fruit`],[`tomato`,`Tomato`,`Pomodoro`,`Pomidor`,22,120,`g`,`A`,`veg`],[`kiwi`,`Kiwi`,`Kiwi`,`Kiwi`,42,70,`g`,`A`,`fruit`],[`blueberries`,`Blueberries`,`Mirtilli`,`Borówki`,57,100,`g`,`A`,`fruit`],[`yogurt`,`Plain yogurt`,`Yogurt bianco`,`Jogurt naturalny`,75,125,`g`,`A`,`dairy`],[`egg`,`Boiled egg`,`Uovo sodo`,`Jajko na twardo`,78,50,`g`,`A`,`protein`],[`almonds`,`Almonds`,`Mandorle`,`Migdały`,175,30,`g`,`A`,`nuts`],[`avocado`,`Avocado`,`Avocado`,`Awokado`,160,100,`g`,`A`,`veg`],[`salmon`,`Salmon`,`Salmone`,`Łosoś`,205,100,`g`,`A`,`protein`],[`chickpeas`,`Chickpeas`,`Ceci`,`Ciecierzyca`,165,100,`g`,`A`,`legume`],[`oats`,`Porridge`,`Porridge d'avena`,`Owsianka`,150,40,`g`,`A`,`grain`],[`wholebread`,`Wholegrain bread`,`Pane integrale`,`Chleb pełnoziarnisty`,75,30,`g`,`B`,`grain`],[`donut`,`Glazed donut`,`Ciambella glassata`,`Donut z lukrem`,250,65,`g`,`E`,`sugar`],[`fries`,`French fries`,`Patatine fritte`,`Frytki`,365,117,`g`,`E`,`fried`],[`cheeseburger`,`Cheeseburger`,`Cheeseburger`,`Cheeseburger`,300,120,`g`,`D`,`fatty`],[`cola`,`Cola`,`Cola`,`Cola`,140,330,`ml`,`E`,`fizzy`],[`chips`,`Crisps`,`Patatine in busta`,`Chipsy`,160,30,`g`,`E`,`salty`],[`chocobar`,`Chocolate bar`,`Barretta al cioccolato`,`Baton czekoladowy`,240,45,`g`,`E`,`sugar`],[`hotdog`,`Hot dog`,`Hot dog`,`Hot dog`,290,100,`g`,`E`,`ultra`],[`nuggets`,`Chicken nuggets`,`Crocchette di pollo`,`Nuggetsy`,270,100,`g`,`D`,`fried`],[`pizza`,`Pepperoni pizza`,`Pizza al salame`,`Pizza z salami`,300,110,`g`,`D`,`ultra`],[`juice`,`Fruit juice`,`Succo di frutta`,`Sok owocowy`,90,200,`ml`,`C`,`sugar`],[`fitbar`,`"Fitness" bar`,`Barretta "fitness"`,`Baton „fit”`,180,40,`g`,`D`,`ultra`],[`milkshake`,`Milkshake`,`Frappè`,`Koktajl mleczny`,420,350,`ml`,`E`,`sugar`]],lu=su(`base`)([`water`,`Water`,`Acqua`,`Woda`,0,250,`ml`,`A`,`water`]),uu={id:`base`,order:0,country:`PIKKO`,mint:null,name:{en:`Starter Bag`,it:`Busta Base`,pl:`Torba Startowa`},accessory:{en:`Classic bib`,it:`Bavaglino classico`,pl:`Klasyczny śliniaczek`},accessoryKind:`none`,fact:{en:`Eat the rainbow: every colour brings different vitamins.`,it:`Mangia i colori: ogni colore porta vitamine diverse.`,pl:`Jedz kolorowo: każdy kolor to inne witaminy.`},palette:[`#d7263d`,`#f6f1e7`],logo:`logos/base.svg`,foods:cu.map(su(`base`))},du=[uu,...eu.bags.map(e=>({id:e.id,order:e.order,country:e.country,mint:e.mint,name:e.name,accessory:e.accessory,accessoryKind:e.accessoryKind,fact:e.fact,palette:e.palette,logo:e.logo,foods:e.foods.map(su(e.id))}))],fu=new Map;for(let e of du)for(let t of e.foods)fu.set(t.id,t);fu.set(lu.id,lu);function pu(e){let t=du.find(t=>t.id===e);if(!t)throw Error(`Unknown bag ${e}`);return t}var mu=[[/cola_bottle/,`bottle`,[`#3b1a0e`,`#d01f2a`]],[/sports_drink/,`bottle`,[`#2aa7ff`,`#ffffff`]],[/energy_drink/,`can`,[`#1d1d1d`,`#9bff2e`]],[/potion_soda/,`can`,[`#7b3fa0`,`#c9a0ff`]],[/oranzada|orange soda/,`can`,[`#ff8c1a`,`#ffffff`]],[/\bcola\b|large_soda|^cola/,`can`,[`#c8102e`,`#ffffff`]],[/root_beer/,`glass`,[`#4a2414`,`#f5efe4`]],[/coconut_water/,`glass`,[`#f4f1e8`,`#ffffff`],`white`],[/infused_water|sparkling_lemon|^water/,`glass`,[`#d8f1ff`,`#ffffff`]],[/green_tea|matcha_tea/,`mug`,[`#9db55a`,`#f5f1e6`]],[/rosehip/,`mug`,[`#c0392b`,`#f5f1e6`]],[/bubble_tea/,`cup`,[`#c9a27e`,`#3b2a20`]],[/slushie/,`cup`,[`#3fa9f5`,`#e63946`]],[/frappe|shake|milkshake|hot_choc|choc_milk/,`cup`,[`#6b3e26`,`#fff6e8`]],[/green_smoothie/,`glass`,[`#7dbb3c`,`#ffffff`],`green`],[/lassi|pina_colada|punch|eggnog|horchata|lemonade|iced_tea|juice/,`glass`,[`#ffb347`,`#ffffff`]],[/kefir|milk_carton|^milk/,`glass`,[`#f6f3ea`,`#ffffff`],`white`],[/barszcz/,`soup`,[`#8e1b2e`,`#f1ede4`],`red`],[/gazpacho/,`soup`,[`#d9452b`,`#f1ede4`],`red`],[/pumpkin_soup/,`soup`,[`#f28c28`,`#f1ede4`],`orange`],[/miso/,`soup`,[`#c8a165`,`#2b2b2b`]],[/black_bean_soup/,`soup`,[`#3b2a20`,`#f1ede4`],`purple`],[/tortilla_soup/,`soup`,[`#c2512f`,`#f1ede4`],`red`],[/mushroom_soup|barley/,`soup`,[`#9b7b55`,`#f1ede4`],`white`],[/chowder/,`soup`,[`#efe6d2`,`#f1ede4`]],[/minestrone/,`soup`,[`#c4643b`,`#f1ede4`],`orange`],[/pineapple(?!_)|^pineapple/,`pineapple`,[`#e9b44c`,`#3a7d2c`],`yellow`],[/watermelon/,`melonslice`,[`#e63946`,`#2d6a4f`],`red`],[/banana|plantain(?!_chips)/,`banana`,[`#f7d84a`,`#5c4426`],`yellow`],[/avocado(?!_toast)/,`avocado`,[`#4f772d`,`#e9edc9`],`green`],[/apple(?!_pie|_chips|_fritters|_doughnut|_pb|_cheddar)|caramel_apple|baked_apple/,`fruit`,[`#c0262d`,`#5c4426`],`red`],[/pear/,`fruit`,[`#c9d65a`,`#5c4426`],`green`],[/peach|apricot/,`fruit`,[`#ffb07c`,`#5c4426`],`orange`],[/orange|mandarin|clementine/,`fruit`,[`#ff8c1a`,`#3a7d2c`],`orange`],[/plum|fig/,`fruit`,[`#5b2a5e`,`#5c4426`],`purple`],[/pomegranate/,`fruit`,[`#a4161a`,`#5c4426`],`red`],[/persimmon/,`fruit`,[`#f47b20`,`#3a7d2c`],`orange`],[/kiwi/,`fruit`,[`#8a6d3b`,`#7cb518`],`green`],[/cherry_tomatoes/,`berries`,[`#e5383b`,`#3a7d2c`],`red`],[/tomato/,`fruit`,[`#e5383b`,`#3a7d2c`],`red`],[/melon(?!_pan)/,`fruit`,[`#e9c46a`,`#a7c957`],`orange`],[/lychee/,`fruit`,[`#e07a7a`,`#f8f4e3`],`white`],[/guava/,`fruit`,[`#a7c957`,`#f28482`],`green`],[/passion_fruit/,`fruit`,[`#5e2750`,`#f9c74f`],`purple`],[/mango(?!_sticky|_chili)|candied_mango/,`fruit`,[`#ffb703`,`#e85d04`],`orange`],[/mango_chili/,`bowl`,[`#ffb703`,`#d62828`],`orange`],[/papaya/,`fruit`,[`#f77f00`,`#2b2d42`],`orange`],[/dragon_fruit/,`fruit`,[`#e0218a`,`#f8f4e3`],`purple`],[/starfruit/,`fruit`,[`#f9c74f`,`#a7c957`],`yellow`],[/coconut/,`fruit`,[`#6f4e37`,`#fbf7ef`],`white`],[/strawberr/,`berries`,[`#d62828`,`#3a7d2c`],`red`],[/blueberr/,`berries`,[`#3a4a8c`,`#1d2d5c`],`purple`],[/raspberr/,`berries`,[`#c9184a`,`#3a7d2c`],`red`],[/blackberr/,`berries`,[`#2b2d42`,`#3a7d2c`],`purple`],[/cherries/,`berries`,[`#9d0208`,`#3a7d2c`],`red`],[/grapes/,`berries`,[`#6a4c93`,`#3a7d2c`],`purple`],[/dates|dried_apricot/,`nuts`,[`#7a4a1d`,`#c98b4a`],`orange`],[/carrot|parsnip/,`carrot`,[`#f77f00`,`#3a7d2c`],`orange`],[/broccoli|brussels|kale(?!_chips)/,`tree`,[`#3a7d2c`,`#6a994e`],`green`],[/cauliflower/,`tree`,[`#f1ead6`,`#6a994e`],`white`],[/celery|asparagus|green_beans|snap_peas/,`sticks`,[`#80b918`,`#4f772d`],`green`],[/jicama|kohlrabi/,`sticks`,[`#f3efe0`,`#c9d65a`],`white`],[/veggie_hummus|yogurt_veg_dip/,`sticks`,[`#f77f00`,`#80b918`],`orange`],[/radish/,`berries`,[`#e63946`,`#f8f4e3`],`red`],[/zucchini|cucumber|ogorki/,`tuber`,[`#4f772d`,`#a7c957`],`green`],[/bell_peppers|stuffed_peppers/,`fruit`,[`#d62828`,`#3a7d2c`],`red`],[/eggplant|baingan/,`tuber`,[`#4a2c4f`,`#3a7d2c`],`purple`],[/artichoke/,`tree`,[`#6a994e`,`#a7c957`],`green`],[/sweet_potato|sweet_fries/,`tuber`,[`#e07a2c`,`#8c3f1a`],`orange`],[/potato(?!_pancake)|roasted_pumpkin|plantain/,`tuber`,[`#e8c27a`,`#a0703c`],`yellow`],[/porcini|mushroom/,`tuber`,[`#a0703c`,`#f1e3c8`],`white`],[/corn(?!_dog)|elote|succotash/,`tuber`,[`#f7c948`,`#a7c957`],`yellow`],[/peas|edamame|fava/,`berries`,[`#80b918`,`#4f772d`],`green`],[/seaweed_snack|seaweed/,`leaves`,[`#2d6a4f`,`#1b4332`],`green`],[/salad|mizeria|coleslaw|buraczki|kapusta|sauerkraut|cabbage|nopales|pico|panzanella|kale_chips/,`leaves`,[`#6a994e`,`#e5383b`],`green`],[/pisanka/,`egg`,[`#e63946`,`#ffbe0b`],`white`],[/scrambled|omelette/,`mound`,[`#f7d84a`,`#fff3c4`],`yellow`],[/egg_muffin/,`muffin`,[`#f7d84a`,`#6a994e`],`yellow`],[/deviled|^egg|boiled egg/,`egg`,[`#f8f4e9`,`#f7c948`],`white`],[/sushi|nigiri|maki|onigiri/,`sushi`,[`#f8f4e9`,`#f28c6b`],`white`],[/sashimi|salmon|trout/,`fillet`,[`#f4845f`,`#fbe4d6`]],[/sardines|mackerel|herring|sledz|anchovies|carp|sea_bass|cod|tuna_steak/,`fillet`,[`#b8c4cc`,`#f5ebe0`]],[/mussels|clams/,`shells`,[`#1d1d2c`,`#f4a261`]],[/shrimp_skewer|chicken_skewer|kebab_skewer|skewer/,`skewer`,[`#d9a066`,`#e85d04`]],[/shrimp/,`fried`,[`#f4845f`,`#fbe4d6`]],[/octopus|ceviche/,`bowl`,[`#f5cac3`,`#80b918`]],[/chicken_breast|turkey_breast|tandoori|baked_cod|roast/,`fillet`,[`#d9a066`,`#f1d6a8`]],[/nuggets|tempura|karaage|fritto|calamari|fish_fingers|mozzarella_sticks|wings|tots|pakora|fried_fish|fish_balls|onion_rings|jalapeno|pizza_rolls|flautas|churros|banana_fritters|apple_fritters|placki|fried_dough|plantain_chips/,`fried`,[`#d4892c`,`#f3c677`]],[/schabowy|tonkatsu|chicken_fried_steak|cutlet|steak/,`fillet`,[`#c98b4a`,`#7a4a1d`]],[/ribs|bacon|kielbasa|sausage|fry_up|maple_bacon|jerky|pork_rinds/,`skewer`,[`#8c3f1a`,`#d9a066`]],[/hotdog|corn_dog|wurstel/,`hotdog`,[`#d9a066`,`#c0392b`]],[/burger|cheeseburger/,`burger`,[`#d9a066`,`#6b3e26`]],[/sandwich|panino|bagel|cheesesteak|lobster_roll|zapiekanka|biscuits_gravy|tuna_mayo|chicken_waffles/,`burger`,[`#e8c27a`,`#c0392b`]],[/wrap|burrito|kebab|piadina|fajita|taco|chimichanga|quesadilla/,`wrap`,[`#e8c27a`,`#6a994e`]],[/pizza/,`pizza`,[`#e8b04b`,`#c0392b`]],[/fries/,`fries`,[`#f3c677`,`#d62828`]],[/nachos|chips|crisps|puffs|crackers(?!_cheese)|prawn_crackers|popcorn_snack/,`chipsbag`,[`#f7c948`,`#d62828`]],[/donut|doughnut|bombolone|paczek|gofr|waffle/,`donut`,[`#d9a066`,`#f2b5d4`]],[/gulab|takoyaki|mochi|arancino|energy_balls|struffoli|ptasie|melon_pan|coconut_macaroons/,`ball`,[`#c8823b`,`#f3e2c0`]],[/chocobar|choc_wafer|wafer|candy_bar|protein_bar|cereal_bar|fitbar|torrone|barfi|fudge|dark_chocolate|chocolate_bar|kingsize/,`bar`,[`#5a3420`,`#c8a165`]],[/cookie|gingerbread|rice_cakes|rusks|pancake|crackers_cheese|biscotti|frosted_cookies|sopapillas|dorayaki|roti|naan|bhatura/,`discs`,[`#d9a066`,`#f3e2c0`]],[/muffin|cupcake|cinnamon_roll|brioche|croissant|whoopie/,`muffin`,[`#c98b4a`,`#f2b5d4`]],[/tiramisu|cake|pie|panettone|pandoro|colomba|babka|makowiec|kremowka|mazurek|strudel|brownie|cannolo|zeppola|merendina|tres_leches|pastiera|casatiello|pudding(?!_cup)/,`cake`,[`#f3e2c0`,`#6b3e26`]],[/cone|gelato|froyo|sundae|icecream|ice_cream|shave_ice|kulfi/,`cone`,[`#f9dcc4`,`#c8823b`]],[/popsicle|icepop|ice pop/,`popsicle`,[`#ff6b6b`,`#d9a066`]],[/candy|gummy|jelly|licorice|lollipop|marshmallow|sour|fruit_snacks|maple_candy|chocolate_skull|chocolate_santa|chocolate_bunny|choc_egg|creme_egg|candy_cane|smores|choc_peanuts|candied/,`candy`,[`#ff4d6d`,`#ffd60a`]],[/pudding_cup|chia|yogurt|skyr|raita|tzatziki|twarog|cottage|ricotta|parfait/,`bowl`,[`#f8f4e9`,`#e63946`],`white`],[/bread|toast|bruschetta|pita|chleb|crackers/,`bread`,[`#c98b4a`,`#f3e2c0`]],[/almonds|walnuts|hazelnuts|pistachios|nuts|trail_mix|seeds|chestnuts|peanuts|roasted_chickpeas|popcorn/,`nuts`,[`#b07d4b`,`#e8c27a`]],[/chickpea|lentil|dal|chana|beans|bean|hummus|moong|tofu|hiyayakko/,`bowl`,[`#d9b26f`,`#6a994e`]],[/oats|porridge|muesli|cereal|kasza|quinoa|rice|soba|pasta|spaghetti|ramen|noodles|mac_cheese|polenta|fondue/,`bowl`,[`#e8c27a`,`#c0392b`]],[/curry|paneer|chili|guacamole|bharta|butter_chicken|smoothie_bowl|poke|bowl/,`bowl`,[`#e07a2c`,`#6a994e`]]],hu={bruschetta:[`bread`,[`#c98b4a`,`#d62828`],`red`],spaghetti_pomodoro:[`bowl`,[`#e8c27a`,`#c0392b`],`red`],fennel_orange_salad:[`leaves`,[`#e9edc9`,`#ff8c1a`],`orange`],apple_pie_alamode:[`cake`,[`#d9a066`,`#f8f4e9`]],apple_doughnut:[`donut`,[`#c98b4a`,`#e8c27a`]],melon_pan:[`ball`,[`#e8c27a`,`#c98b4a`]],mango_chili_lime:[`bowl`,[`#ffb703`,`#d62828`],`orange`],coconut_macaroons:[`ball`,[`#f8f4e9`,`#c98b4a`]],mango_sticky_rice:[`bowl`,[`#f8f4e9`,`#ffb703`]],apple_chips:[`chipsbag`,[`#f3e2c0`,`#c0262d`],`red`],orange_cheese_crackers:[`chipsbag`,[`#ff8c1a`,`#f7c948`]],apple_fritters:[`fried`,[`#d4892c`,`#f3e2c0`]],strudel_cream:[`cake`,[`#d9a066`,`#f8f4e9`]],chickpeas:[`bowl`,[`#d9b26f`,`#6a994e`],`yellow`],twarog_rzodkiewka:[`bowl`,[`#f8f4e9`,`#e63946`],`white`],spinach_strawberry:[`leaves`,[`#3a7d2c`,`#d62828`],`green`],roasted_chickpeas:[`nuts`,[`#d9b26f`,`#b07d4b`],`yellow`],honey_peanuts:[`nuts`,[`#c98b4a`,`#e8c27a`]],pumpkin_seeds:[`nuts`,[`#6a994e`,`#e9edc9`],`green`],roasted_chestnuts:[`nuts`,[`#6b3e26`,`#e8c27a`],`white`],cheesesteak:[`burger`,[`#e8c27a`,`#8c3f1a`]],cream_cheese_bagel:[`burger`,[`#c98b4a`,`#f4845f`]],cheese_fondue:[`soup`,[`#f7d84a`,`#e8c27a`]],icecream_sandwich:[`discs`,[`#3b2a20`,`#f8f4e9`]],fish_and_chips:[`fried`,[`#d4892c`,`#f3c677`]],crackers_cheese:[`discs`,[`#e8c27a`,`#f7d84a`],`yellow`],watermelon:[`melonslice`,[`#e63946`,`#2d6a4f`],`red`],cola_icepop:[`popsicle`,[`#4a2414`,`#d9a066`]],mizeria:[`bowl`,[`#f8f4e9`,`#80b918`],`green`],placki_ziemniaczane:[`fried`,[`#d4892c`,`#f3c677`]],corn_dog:[`hotdog`,[`#d4892c`,`#c0392b`]],candy_corn:[`candy`,[`#ffbe0b`,`#fb5607`]],tzatziki_cucumber:[`bowl`,[`#f8f4e9`,`#80b918`],`white`],cucumber_maki:[`sushi`,[`#f8f4e9`,`#80b918`],`green`],kettle_corn:[`nuts`,[`#f7e7b4`,`#c98b4a`]],air_popcorn:[`nuts`,[`#fff8e1`,`#f7e7b4`],`white`],butter_popcorn:[`nuts`,[`#f7d84a`,`#fff8e1`]],caramel_popcorn:[`nuts`,[`#c8823b`,`#f7e7b4`]],chleb_zytni:[`bread`,[`#7a4a1d`,`#c98b4a`],`yellow`],double_bacon_burger:[`burger`,[`#d9a066`,`#6b3e26`]],pierogi_smazone:[`fried`,[`#e8c27a`,`#c98b4a`]],chia_pudding:[`bowl`,[`#e9e4d8`,`#6a4c93`],`white`],pudding_cup:[`bowl`,[`#c8823b`,`#f8f4e9`]],olives:[`berries`,[`#4f5d2f`,`#2b2d1a`],`green`],panzerotto:[`fried`,[`#d4892c`,`#c0392b`]],frozen_lasagna:[`cake`,[`#e8b04b`,`#c0392b`]],fruit_cup:[`berries`,[`#ffb703`,`#d62828`],`orange`],fresh_spring_rolls:[`wrap`,[`#f8f4e9`,`#80b918`],`green`],fried_chicken_bucket:[`fried`,[`#c8823b`,`#f3c677`]],choc_crepe:[`wrap`,[`#e8c27a`,`#5a3420`]],scrambled_eggs:[`mound`,[`#f7d84a`,`#fff3c4`],`yellow`],egg_white_omelette:[`mound`,[`#fff8e1`,`#80b918`],`white`],jumbo_pretzel:[`donut`,[`#8c3f1a`,`#f7d84a`]],energy_gel:[`bar`,[`#2aa7ff`,`#f8f4e9`]],samosa:[`fried`,[`#d4892c`,`#f3c677`]],jalebi:[`candy`,[`#ff8c1a`,`#ffd60a`]],luncheon_musubi:[`sushi`,[`#f8f4e9`,`#e07a7a`]],crab_sticks_mayo:[`sticks`,[`#f4845f`,`#f8f4e9`]],cheese_stick:[`sticks`,[`#f8f4e9`,`#f7d84a`],`white`],lunch_kit:[`chipsbag`,[`#2aa7ff`,`#f7c948`]],upside_down_cake:[`cake`,[`#f7d84a`,`#c8823b`]],cottage_pineapple:[`bowl`,[`#f8f4e9`,`#f7d84a`],`white`],ogorki_kiszone:[`tuber`,[`#4f772d`,`#a7c957`],`green`],dried_apricots:[`nuts`,[`#f4a261`,`#e07a2c`],`orange`],dates:[`nuts`,[`#5c3317`,`#8c5a2b`],`purple`],boiled_shrimp:[`fried`,[`#f4845f`,`#fbe4d6`]],kale_chips:[`leaves`,[`#2d6a4f`,`#80b918`],`green`],sweet_juice_box:[`bottle`,[`#ff9f1c`,`#ffffff`]],milk_carton:[`bottle`,[`#f8f4e9`,`#2aa7ff`],`white`],smoothie_bowl:[`bowl`,[`#c9184a`,`#ffb703`],`purple`],greek_yogurt_fruit:[`bowl`,[`#f8f4e9`,`#d62828`],`white`],overnight_oats:[`bowl`,[`#e8c27a`,`#3a4a8c`],`yellow`],frosted_cereal:[`bowl`,[`#f7d84a`,`#ff4d6d`]],instant_ramen:[`bowl`,[`#f7d84a`,`#e85d04`]],beet_hummus:[`bowl`,[`#a4133c`,`#f8f4e9`],`purple`],sauteed_porcini:[`tuber`,[`#a0703c`,`#f1e3c8`],`white`]};Object.assign(hu,{grilled_veg:[`leaves`,[`#4f772d`,`#e63946`],`green`],sopa_tortilla:[`soup`,[`#c2512f`,`#f7c948`],`red`],bunuelos:[`discs`,[`#d9a066`,`#8c3f1a`]],omelette:[`mound`,[`#fff3c4`,`#80b918`],`yellow`],ratatouille:[`bowl`,[`#c0392b`,`#6a994e`],`red`],moules:[`shells`,[`#1d1d2c`,`#f4a261`],`white`],papillote:[`fillet`,[`#f1e3c8`,`#80b918`],`white`],fromage_blanc:[`bowl`,[`#f8f4e9`,`#d62828`],`white`],potage:[`soup`,[`#e9a03b`,`#6a994e`],`orange`],pot_au_feu:[`soup`,[`#a0703c`,`#f77f00`],`orange`],pain_chocolat:[`bread`,[`#d9a066`,`#5a3420`]],croque:[`burger`,[`#e8c27a`,`#f7d84a`]],crepe_choco:[`wrap`,[`#e8c27a`,`#5a3420`]],macarons:[`discs`,[`#f7a1c4`,`#a7c957`]],eclair:[`bar`,[`#5a3420`,`#e8c27a`]],quiche:[`cake`,[`#f7d84a`,`#d9a066`]],tartiflette:[`bowl`,[`#f7d84a`,`#8c3f1a`]],millefeuille:[`cake`,[`#f3e2c0`,`#fff8ee`]],grenadine:[`glass`,[`#d62828`,`#ffffff`]],salmorejo:[`soup`,[`#e85d04`,`#f8f4e9`],`orange`],pisto:[`bowl`,[`#c0392b`,`#f7c948`],`red`],bravas:[`fried`,[`#e8b04b`,`#d62828`]],croquetas:[`fried`,[`#c8823b`,`#f3c677`]],ensaimada:[`donut`,[`#e8c27a`,`#ffffff`]],torrijas:[`bread`,[`#c8823b`,`#f3e2c0`]],crema_catalana:[`bowl`,[`#f7d84a`,`#8c3f1a`]],horta:[`leaves`,[`#2d6a4f`,`#f7d84a`],`green`],tsipoura:[`fillet`,[`#b8c4cc`,`#f5ebe0`]],kalamata:[`berries`,[`#3b2a4a`,`#6b8e3a`],`purple`],dolmades:[`sticks`,[`#4f772d`,`#6a994e`],`green`],baklava:[`bar`,[`#d9a066`,`#6a994e`]],moussaka:[`cake`,[`#e8c27a`,`#4a2c4f`]],bougatsa:[`cake`,[`#e8c27a`,`#fff8ee`]],galaktoboureko:[`cake`,[`#f3e2c0`,`#d9a066`]],saganaki:[`bar`,[`#e8b04b`,`#f7d84a`]],pastitsio:[`cake`,[`#f3e2c0`,`#8c3f1a`]],bulgur:[`bowl`,[`#d9b26f`,`#e63946`],`yellow`],levrek:[`fillet`,[`#b8c4cc`,`#f5ebe0`]],kunefe:[`cake`,[`#f28c28`,`#6a994e`]],lokum:[`candy`,[`#ff8fa3`,`#ffffff`]],pide:[`pizza`,[`#e8b04b`,`#f7d84a`]],tulumba:[`fried`,[`#d4892c`,`#f3c677`]],steamed_fish:[`fillet`,[`#f1ead6`,`#80b918`],`white`],bok_choy:[`leaves`,[`#80b918`,`#f1ead6`],`green`],jiaozi:[`ball`,[`#f8f4e9`,`#80b918`]],tea_egg:[`egg`,[`#8c5a2b`,`#f7c948`],`white`],oolong:[`mug`,[`#b5651d`,`#f5f1e6`]],spring_rolls:[`fried`,[`#d4892c`,`#f3c677`]],egg_tart:[`muffin`,[`#d9a066`,`#f7d84a`]],youtiao:[`sticks`,[`#d4892c`,`#e8b04b`]],sesame_balls:[`ball`,[`#d9a066`,`#f3e2c0`]],char_siu_bao:[`ball`,[`#f8f4e9`,`#c0392b`]],bibimbap:[`bowl`,[`#f8f4e9`,`#f77f00`],`orange`],kimchi:[`leaves`,[`#e63946`,`#f7c948`],`red`],namul:[`leaves`,[`#80b918`,`#f7c948`],`green`],kimbap:[`sushi`,[`#1f3b2a`,`#f77f00`],`green`],fried_chicken_kr:[`fried`,[`#c0392b`,`#f3c677`]],tteokbokki:[`sticks`,[`#d62828`,`#f8f4e9`]],ramyeon:[`bowl`,[`#f7d84a`,`#d62828`]],bingsu:[`cone`,[`#f8f4e9`,`#d62828`]],tom_yum:[`soup`,[`#e85d04`,`#80b918`],`orange`],pla_pao:[`fillet`,[`#b8c4cc`,`#80b918`]],morning_glory:[`leaves`,[`#2d6a4f`,`#d62828`],`green`],pad_thai:[`bowl`,[`#e8b04b`,`#80b918`]],cha_yen:[`glass`,[`#f28c28`,`#ffffff`]],por_pia:[`fried`,[`#d4892c`,`#f3c677`]],gai_tod:[`fried`,[`#c8823b`,`#f3c677`]],khanom_chan:[`bar`,[`#80b918`,`#f7a1c4`]],pho:[`soup`,[`#d9a35b`,`#80b918`],`white`],goi_cuon:[`wrap`,[`#f8f4e9`,`#80b918`],`green`],ca_kho:[`bowl`,[`#8c3f1a`,`#f7d84a`]],herb_plate:[`leaves`,[`#2d6a4f`,`#80b918`],`green`],tra_da:[`glass`,[`#c9d65a`,`#ffffff`]],banh_mi:[`hotdog`,[`#e8b04b`,`#80b918`]],cha_gio:[`fried`,[`#d4892c`,`#f3c677`]],che_ba_mau:[`glass`,[`#80b918`,`#f7a1c4`]],nem_chua_ran:[`fried`,[`#d4892c`,`#e63946`]],flan_vn:[`bowl`,[`#f7c948`,`#8c3f1a`]],moqueca:[`soup`,[`#f77f00`,`#f8f4e9`],`orange`],acai_puro:[`bowl`,[`#5b2a6e`,`#f8f4e9`],`purple`],couve:[`leaves`,[`#2d6a4f`,`#4f772d`],`green`],mandioca:[`tuber`,[`#f3efe0`,`#8c5a2b`],`white`],caju:[`fruit`,[`#f28c28`,`#8c5a2b`],`orange`],frango_grelhado:[`fillet`,[`#d9a066`,`#f1d6a8`]],coxinha:[`ball`,[`#d4892c`,`#f3c677`]],pastel:[`fried`,[`#e8b04b`,`#f3c677`]],brigadeiro:[`candy`,[`#5a3420`,`#ff4d6d`]],feijoada:[`soup`,[`#2b1d14`,`#e8c27a`]],picanha:[`skewer`,[`#8c3f1a`,`#d9a066`]],guarana:[`can`,[`#2d6a4f`,`#d62828`]],pudim:[`bowl`,[`#f7c948`,`#8c3f1a`]],aguaymanto:[`berries`,[`#f7c948`,`#e8b04b`],`yellow`],lucuma:[`fruit`,[`#6a994e`,`#f7c948`],`yellow`],tiradito:[`fillet`,[`#f8f4e9`,`#f28c28`],`white`],salchipapa:[`fries`,[`#f3c677`,`#d62828`]],picarones:[`donut`,[`#d4892c`,`#8c3f1a`]],chicha_dulce:[`glass`,[`#4b2a5e`,`#ffffff`]],gaseosa:[`bottle`,[`#f7d84a`,`#3a86ff`]],alfajores:[`discs`,[`#e8c27a`,`#8c3f1a`]],turron_pepa:[`bar`,[`#d9a066`,`#ff4d6d`]],suspiro:[`bowl`,[`#f3e2c0`,`#8c3f1a`]],harira:[`soup`,[`#c0392b`,`#d9b26f`],`red`],tagine_veg:[`bowl`,[`#f77f00`,`#80b918`],`orange`],couscous:[`bowl`,[`#e8c27a`,`#f77f00`],`yellow`],mint_tea:[`glass`,[`#c9d65a`,`#80b918`]],sweet_mint_tea:[`glass`,[`#b5a03b`,`#80b918`]],pastilla:[`cake`,[`#d9a066`,`#ffffff`]],msemen:[`discs`,[`#e8c27a`,`#c8823b`]],briouats:[`fried`,[`#d4892c`,`#f3c677`]],kaab_ghazal:[`banana`,[`#f3e2c0`,`#d9a066`]],harcha:[`discs`,[`#e8c27a`,`#d62828`]],tea_milk:[`mug`,[`#c98b4a`,`#f5f1e6`]],full_english:[`mound`,[`#8c3f1a`,`#f7d84a`]],scotch_egg:[`egg`,[`#c8823b`,`#f7c948`]],chip_butty:[`burger`,[`#e8c27a`,`#f3c677`]],fried_choc_bar:[`bar`,[`#d4892c`,`#5a3420`]],quark:[`bowl`,[`#f8f4e9`,`#80b918`],`white`],erbsensuppe:[`soup`,[`#80b918`,`#f8f4e9`],`green`],bratwurst:[`hotdog`,[`#e8b04b`,`#a0522d`]],butterbrezel:[`donut`,[`#8c3f1a`,`#f7e7b4`]],leberkaese:[`burger`,[`#e8b04b`,`#e07a7a`]],efo_riro:[`bowl`,[`#2d6a4f`,`#d62828`],`green`],okra_soup:[`soup`,[`#4f772d`,`#e8c27a`],`green`],pepper_soup:[`soup`,[`#c0392b`,`#f1ead6`],`red`],tilapia:[`fillet`,[`#8c9aa5`,`#f5ebe0`]],kunu:[`glass`,[`#f3efe0`,`#ffffff`],`white`],puff_puff:[`ball`,[`#d4892c`,`#f3e2c0`]],chin_chin:[`nuts`,[`#d9a066`,`#e8b04b`]],party_jollof:[`bowl`,[`#e2572c`,`#c8823b`]],buns_ng:[`ball`,[`#c8823b`,`#f3e2c0`]],malt_drink:[`bottle`,[`#3b1a0e`,`#f7c948`]],zobo_sweet:[`glass`,[`#7b1e3a`,`#ffffff`]],ribollita:[`soup`,[`#8c5a2b`,`#4f772d`],`green`],twarozek:[`bowl`,[`#f8f4e9`,`#e63946`],`white`],placki:[`fried`,[`#d4892c`,`#f3c677`]],apple_pie:[`cake`,[`#d9a066`,`#f8f4e9`]],pan_tomate:[`bread`,[`#c98b4a`,`#d62828`],`red`],garbanzos:[`bowl`,[`#d9b26f`,`#2d6a4f`],`yellow`],tzatziki:[`bowl`,[`#f8f4e9`,`#80b918`],`white`],fava:[`bowl`,[`#f7d84a`,`#6a994e`],`yellow`],gyros:[`wrap`,[`#e8c27a`,`#8c3f1a`]],spanakopita:[`cake`,[`#e8b04b`,`#2d6a4f`]],cacik:[`bowl`,[`#f8f4e9`,`#80b918`],`white`],ezme:[`bowl`,[`#d62828`,`#80b918`],`red`],ayran:[`glass`,[`#f8f4e9`,`#ffffff`],`white`],hot_sour:[`soup`,[`#8c5a2b`,`#f7d84a`]],sweet_sour_pork:[`fried`,[`#e85d04`,`#f3c677`]],fried_rice:[`bowl`,[`#e8c27a`,`#c0392b`]],boricha:[`mug`,[`#c98b4a`,`#f5f1e6`]],miyeok:[`soup`,[`#2d6a4f`,`#f1ead6`],`green`],corn_dog_kr:[`hotdog`,[`#d4892c`,`#f7f1e1`]],budae:[`soup`,[`#d62828`,`#f7d84a`]],banana_milk:[`bottle`,[`#f7d84a`,`#ffffff`]],som_tam:[`leaves`,[`#a7c957`,`#d62828`],`green`],tom_kha:[`soup`,[`#f8f4e9`,`#d62828`],`white`],coconut_icecream:[`cone`,[`#f8f4e9`,`#d9a066`]],canh_chua:[`soup`,[`#e8b04b`,`#80b918`],`yellow`],tofu_tomato:[`bowl`,[`#d62828`,`#f8f4e9`],`red`],xoi_man:[`bowl`,[`#f8f4e9`,`#c0392b`]],agua_coco:[`glass`,[`#f4f1e8`,`#ffffff`],`white`],beijinho:[`candy`,[`#f8f4e9`,`#d62828`]],pollo_brasa:[`fried`,[`#c8823b`,`#f3c677`]],papa_rellena:[`fried`,[`#d4892c`,`#f3c677`]],leek_soup:[`soup`,[`#e9edc9`,`#6a994e`],`white`],cucumber_sandwich:[`burger`,[`#c98b4a`,`#80b918`],`green`],scones:[`muffin`,[`#e8c27a`,`#d62828`]],sausage_roll:[`bread`,[`#e8b04b`,`#c98b4a`]],steak_pie:[`cake`,[`#c98b4a`,`#5a3420`]],fish_chips:[`fried`,[`#d4892c`,`#f3c677`]],mushy_peas:[`bowl`,[`#80b918`,`#4f772d`],`green`],gurkensalat:[`leaves`,[`#a7c957`,`#f8f4e9`],`green`],apfelstrudel:[`cake`,[`#d9a066`,`#f8f4e9`]],ogi:[`bowl`,[`#f3efe0`,`#f7d84a`],`white`],yam_sauce:[`tuber`,[`#f3efe0`,`#d62828`],`white`],akara:[`fried`,[`#d4892c`,`#f3c677`]],id_gado_gado:[`bowl`,[`#80b918`,`#c98b4a`],`green`],id_tempeh:[`bar`,[`#e9d8a6`,`#c98b4a`],`white`],id_sayur_asem:[`soup`,[`#c9a227`,`#f1ede4`],`yellow`],id_ikan_bakar:[`fillet`,[`#b5651d`,`#f3c677`]],id_soto_ayam:[`soup`,[`#f2b134`,`#f1ede4`],`yellow`],id_pepes_ikan:[`wrap`,[`#3a7d2c`,`#f8f4e9`],`green`],id_urap:[`leaves`,[`#2d6a4f`,`#f8f4e9`],`green`],id_karedok:[`bowl`,[`#80b918`,`#a0522d`],`green`],id_manggis:[`fruit`,[`#4a1942`,`#3a7d2c`],`purple`],id_nasi_merah:[`bowl`,[`#8b3a3a`,`#f1ede4`],`red`],id_martabak_manis:[`cake`,[`#d4892c`,`#5a3420`]],id_gorengan:[`fried`,[`#d4892c`,`#f3c677`]],id_krupuk:[`discs`,[`#f3e6c4`,`#f7d58a`]],id_es_teler:[`glass`,[`#a8e6cf`,`#fff6e8`]],id_mie_instan:[`bowl`,[`#f2c14e`,`#d62828`]],id_ayam_kremes:[`fried`,[`#c8823b`,`#f3c677`]],id_nasi_goreng:[`bowl`,[`#b5651d`,`#ffd166`]],id_rendang:[`bowl`,[`#5a2e14`,`#8b4513`]],id_teh_manis:[`glass`,[`#a0522d`,`#ffffff`]],id_seblak:[`soup`,[`#d62828`,`#f3c677`]],ru_shchi:[`soup`,[`#b5a642`,`#f1ede4`],`green`],ru_grechka:[`bowl`,[`#7a4a1d`,`#e8d3b0`],`yellow`],ru_vinegret:[`bowl`,[`#8e1b2e`,`#f2b134`],`red`],ru_ukha:[`soup`,[`#f2d891`,`#f1ede4`],`yellow`],ru_tvorog:[`bowl`,[`#f8f4e9`,`#6a4c93`],`white`],ru_ryazhenka:[`glass`,[`#e8c9a0`,`#ffffff`],`white`],ru_okroshka:[`soup`,[`#e9e4d8`,`#80b918`],`green`],ru_baked_apples:[`fruit`,[`#c0392b`,`#f3c677`],`red`],ru_borodinsky:[`bread`,[`#3b2414`,`#7a4a1d`],`yellow`],ru_griby:[`bowl`,[`#8b5a2b`,`#d9b26f`],`white`],ru_blini:[`discs`,[`#e8b04a`,`#fff6e8`]],ru_pirozhki:[`fried`,[`#d4892c`,`#f3c677`]],ru_belyashi:[`fried`,[`#c8823b`,`#f3c677`]],ru_chebureki:[`fried`,[`#e0b36b`,`#c8823b`]],ru_olivier:[`bowl`,[`#f3efe0`,`#80b918`]],ru_pelmeni:[`bowl`,[`#f3efe0`,`#ffffff`]],ru_syrniki:[`discs`,[`#d9a35b`,`#c1121f`]],ru_medovik:[`cake`,[`#d9a35b`,`#fff6e8`]],ru_shawarma:[`wrap`,[`#e0b36b`,`#80b918`]],ru_kartoshka:[`ball`,[`#5a3420`,`#f8f4e9`]],ua_borshch:[`soup`,[`#a4161a`,`#f1ede4`],`red`],ua_holubtsi:[`wrap`,[`#a7c957`,`#d62828`],`green`],ua_varenyky:[`shells`,[`#f3efe0`,`#e8d3b0`],`white`],ua_uzvar:[`glass`,[`#8b4513`,`#ffffff`],`orange`],ua_kapusniak:[`soup`,[`#d9c46b`,`#f1ede4`],`green`],ua_syr_zelen:[`bowl`,[`#f8f4e9`,`#3a9d3a`],`white`],ua_river_fish:[`fillet`,[`#c0c0c0`,`#f3c677`]],ua_pickled_tomatoes:[`fruit`,[`#d62828`,`#3a7d2c`],`red`],ua_pumpkin_kasha:[`bowl`,[`#f28c28`,`#f1ede4`],`orange`],ua_bean_salad:[`bowl`,[`#8b2e1a`,`#80b918`],`red`],ua_salo:[`bread`,[`#f8f4e9`,`#3b2414`]],ua_pampushky:[`ball`,[`#d4892c`,`#c1121f`]],ua_kyiv_cake:[`cake`,[`#e8c9a0`,`#5a3420`]],ua_deruny:[`fried`,[`#d4892c`,`#f3c677`]],ua_chicken_kyiv:[`fried`,[`#c8823b`,`#f3c677`]],ua_varenyky_cherry:[`shells`,[`#f3efe0`,`#8e1b2e`]],ua_banosh:[`bowl`,[`#f2d891`,`#c1440e`]],ua_makivnyk:[`cake`,[`#2b2b2b`,`#d9a35b`]],ua_halushky:[`bowl`,[`#f3efe0`,`#8b4513`]],ua_lviv_syrnyk:[`cake`,[`#f6e7c1`,`#5a3420`]],ph_sinigang:[`soup`,[`#c8b46a`,`#f1ede4`],`green`],ph_pinakbet:[`bowl`,[`#7a4a1d`,`#80b918`],`green`],ph_tinola:[`soup`,[`#e9d8a6`,`#80b918`],`yellow`],ph_talong_salad:[`bowl`,[`#5a2a6e`,`#d62828`],`purple`],ph_inihaw_isda:[`fillet`,[`#b5651d`,`#f3c677`]],ph_monggo:[`bowl`,[`#6b8e23`,`#f1ede4`],`green`],ph_kinilaw:[`bowl`,[`#f8f4e9`,`#d62828`],`white`],ph_lumpiang_sariwa:[`wrap`,[`#f8f4e9`,`#80b918`],`green`],ph_mangga:[`fruit`,[`#ffb703`,`#3a7d2c`],`orange`],ph_saging:[`banana`,[`#e9d8a6`,`#6b8e23`],`yellow`],ph_lechon:[`fillet`,[`#a0522d`,`#d4892c`]],ph_sisig:[`bowl`,[`#7a4a1d`,`#ffd166`]],ph_chicharon:[`fried`,[`#e0b36b`,`#c8823b`]],ph_halo_halo:[`cup`,[`#8e44ad`,`#fff6e8`]],ph_turon:[`fried`,[`#c8823b`,`#f3c677`]],ph_banana_cue:[`skewer`,[`#c8823b`,`#e9d8a6`]],ph_spaghetti_ph:[`bowl`,[`#d62828`,`#f2c14e`]],ph_kwek_kwek:[`skewer`,[`#f28c28`,`#f3c677`]],ph_pancit_instant:[`bowl`,[`#f2c14e`,`#d4892c`]],ph_longsilog:[`bowl`,[`#c1440e`,`#ffd166`]]});var gu=new Map;function _u(e){let t=gu.get(e.id);if(t)return t;let n=`${e.id} ${e.name.en.toLowerCase()}`,r=null,i=hu[e.id]??hu[e.id.replace(/^[a-z]{2}_/,``)];if(i&&(r={shape:i[0],colors:i[1],group:i[2]??null}),!r){for(let[e,t,i,a]of mu)if(e.test(n)){r={shape:t,colors:i,group:a??null};break}}return r||={shape:`mound`,colors:au(e.grade)?[`#6a994e`,`#e9c46a`]:[`#8c5a2b`,`#f3c677`],group:null},au(e.grade)&&!r.group&&(r={...r,group:vu(e)}),au(e.grade)||(r={...r,group:null}),gu.set(e.id,r),r}function vu(e){switch(e.cat){case`veg`:return`green`;case`fruit`:return`red`;case`dairy`:return`white`;case`grain`:return`yellow`;case`legume`:return`yellow`;default:return null}}var yu=`pikko.v1.`,bu={get(e,t){try{let n=localStorage.getItem(yu+e);return n===null?t:JSON.parse(n)}catch{return t}},set(e,t){try{localStorage.setItem(yu+e,JSON.stringify(t))}catch{}}},xu={en:{subtitle:`Yum or Bleah!`,play:`Play`,classic_desc:`Feed Pikko until the belly is full`,daily:`Daily menu`,daily_desc:`Same 20 rounds for everyone today`,zen:`Pikko Zen`,zen_desc:`No timer, gentle dodges — for little ones`,mart:`Pikko Mart`,recipes:`Recipe book`,settings:`Settings`,back:`Back`,close:`Close`,language:`Language`,sound:`Sound`,on:`On`,off:`Off`,quality:`Graphics`,q_high:`High`,q_medium:`Medium`,q_low:`Low`,pause:`Pause`,resume:`Resume`,restart:`Restart`,quit:`Main menu`,drag_hint:`Drag a food to Pikko`,key_hint:`Keys: 1 / 2 to choose, Enter to feed`,belly:`Belly`,score:`Score`,round:`Round {n}`,phase_breakfast:`Breakfast`,phase_lunch:`Lunch`,phase_snack:`Snack`,phase_dinner:`Dinner`,combo:`Healthy streak ×{n}`,rainbow:`Rainbow bonus!`,bored:`Pikko is bored of {food}`,time_up:`Time's up! Pikko picks…`,habit_junk:`Pikko got used to junk!`,habit_healthy:`Pikko loves healthy food now!`,palate_reset:`Palate reset! +300`,habit_fact:`Taste adapts! In real life it takes weeks, not 3 bites.`,water:`Fresh water! +25`,choice:`Smart choice +{n}`,color_new:`New colour +50`,victory:`Healthy day! Pikko wins!`,defeat:`Ouch… too much junk today!`,perfect_day:`Perfect day! +1000`,outcome_rule:`You win when at least half of the belly is filled with healthy food.`,results:`Day summary`,kcal_eaten:`kcal eaten`,bites_one:`{n} bite`,bites_other:`{n} bites`,healthy_share:`healthy kcal`,best_combo:`best streak`,play_again:`Play again`,share_receipt:`Share Pikko's receipt`,save_receipt:`Save receipt`,share_text:`Copy result`,copied:`Copied!`,challenge:`Challenge a friend`,bleah_cam:`Bleah Cam clip`,bleah_cam_save:`Save clip`,local_best:`Local best`,new_best:`New local best!`,trial_banner:`TRIAL — score not saved`,trial_end:`Trial over! Unlock the bag in Pikko Mart to keep playing.`,mart_title:`Pikko Mart`,mart_sub:`Every shopping bag is a country: 20 foods to discover, 10 healthy and 10 "sometimes".`,country_start:`Food trip: {country}!`,mart_free:`Free`,mart_trial:`Try (5 rounds)`,mart_play:`Play this bag`,mart_unlock:`Unlock…`,mart_soon:`Token coming soon — trial only`,mart_locked:`Locked`,mart_unlocked_until:`Unlocked until {date}`,mart_accessory:`Pikko wears: {acc}`,mart_foods:`{h} healthy · {j} junk`,adult_title:`Grown-ups area`,adult_q:`Ask a grown-up! What is {a} × {b}?`,adult_wrong:`Not quite — ask a grown-up 🙂`,adult_ok:`OK`,connect:`Connect wallet`,connected:`Connected: {w}`,disconnect:`Disconnect`,open_in_phantom:`Open in Phantom`,phantom_missing:`No Solana wallet found. On Android use Chrome with Seed Vault Wallet, Solflare or Phantom, or open this page in the Phantom app.`,wallet_connecting:`Waiting for your wallet…`,wallet_detected:`Detected: {name}`,wallet_none:`No wallet detected`,wallet_rejected:`Connection cancelled.`,mode_label:`Mode`,mode_title:`Who is playing?`,mode_kids:`Kids mode`,mode_kids_d:`Simple and safe: no promotions. Bags open with an adult's help.`,mode_adult:`Grown-ups mode`,mode_adult_d:`Every bag is open, with promotions in free play.`,promo_label:`Promotion`,promo_body:`OnlyFridge Club: a 3D nightclub on Solana. Dance, mix drinks and sing karaoke. Free to enter.`,promo_continue:`Continue playing`,promo_discover:`Discover OnlyFridge Club`,sponsor_label:`Paid placement`,sponsor_disclaimer:`Not financial advice.`,sponsor_empty_cta:`Promote your token on DevFridge Scan`,mart_adult_note:`Grown-ups mode: every bag is open, with a promotion before each round and a sponsor card above the game. Kids mode has no promotions: an adult unlocks bags with a DevFridge lock or pays per round.`,pay_title:`Pay per round`,pay_desc:`{amount} SOL for ONE round of this bag, sent from your wallet to {to}. No refunds; network fee extra. Adults only.`,pay_button:`Pay {amount} SOL and play`,pay_waiting:`Approve in your wallet, then wait for the confirmation…`,pay_ok:`Payment confirmed. Have fun!`,pay_failed:`Payment not confirmed, so nothing started. If your wallet sent it, check its history.`,pay_rejected:`Payment cancelled.`,pay_nosend:`This wallet cannot send from the game. Try Phantom, Solflare or the Seeker wallet.`,wallet_inapp:`This looks like an in-app browser, which can't connect wallets. Open this page in Chrome.`,wallet_open_chrome:`Open in Chrome`,wallet_copy_link:`Copy link`,wallet_link_copied:`Link copied. Paste it in Chrome.`,wallet_notfound_help:`No wallet answered. Open this page in Chrome (not an in-app browser) and check that a Solana wallet app is installed.`,wallet_blocked_help:`Your browser blocked the wallet connection. In Chrome, allow local network access for this site and try again.`,check_failed:`Couldn't verify — try again`,checking:`Checking the lock on Solana…`,recheck:`Check again`,lock_on_devfridge:`Lock on DevFridge ↗`,scan_link:`Token report on DevFridge Scan ↗`,onboarding:`This bag opens with a lock. Connect your Solana wallet and lock {token} on DevFridge to unlock {bag} while your lock is active. The game checks that lock on Solana. Choose your unlock date carefully: there is no early withdrawal. When you redeem after expiry, DevFridge takes 2% of the redeemed vault amount to buy and burn PASTA, the token that supports the ecosystem’s developer. Network fees are separate. Check token compatibility and redemption routing before you lock.`,not_configured_note:`The token for this bag is not configured yet, so it can only be tried. Locking is never done inside the game.`,pass_note:`Until the country tokens launch, ONE active DevFridge lock of {amount} PASTA unlocks EVERY bag in the game.`,tut_how:`How to play`,tut_next:`Next`,tut_back:`Back`,tut_skip:`Skip`,tut_start:`Let's play!`,tut_again:`Replay tutorial`,tut_count:`{n} / {t}`,tut_coach_skip:`Skip tutorial`,tut1_t:`Meet Pikko!`,tut1_b:`Pikko is always hungry. Each round you get 2 foods: drag one to his mouth, or press 1 / 2 and Enter. Healthy food makes him happy. Junk food makes him pull a disgusted face and dodge.`,tut2_t:`Fill the belly`,tut2_b:`Everything he eats fills his belly with kcal. You win the day if at least half of the belly is healthy food. A day goes from breakfast to dinner, and each round has a timer: if it runs out, Pikko chooses by himself.`,tutP1:`Try it! Drag the food you think is healthy to Pikko's mouth.`,tutP1_good:`Yum! Healthy food makes Pikko happy and earns you points. Light, healthy foods give more bites, so more points.`,tutP1_bad:`Bleah! That was junk food: Pikko makes a face and you earn few points. The healthy one was the other!`,tutP2:`Now feed the junk food on purpose and watch Pikko. He may dodge: just try again!`,tutP2_junk:`See his face? Junk food is always penalized, and it stains his bib.`,tutP2_healthy:`Healthy again, great! Next time try the junk food to see Pikko's disgusted face.`,tut3_t:`Pikko's palate`,tut3_b:`Eat junk 3 times in a row and Pikko gets used to it: then he makes faces at healthy food too! Feed him 3 healthy foods in a row to reset his palate (+300). Even when he is used to junk, junk food is still penalized.`,tut4_t:`Points and bonuses`,tut4_b:`Points follow the kcal he eats. Chain healthy foods for a combo, eat every color of the rainbow for a bonus, and choose the smarter food in a pair for a choice bonus. Don't repeat the same food: Pikko gets bored. Every 8 rounds a glass of water appears: a free power-up!`,tut5_t:`Game modes`,tut5_b:`Classic: 40 rounds. Daily menu: the same 20 rounds for everyone today. Pikko Zen: no timer and gentle dodging, great for little ones.`,tut6_t:`Pikko Mart`,tut6_b:`In the Mart every shopping bag is a country: 20 foods to discover, 10 healthy and 10 "sometimes" foods, with a fun fact. Try any bag for 5 rounds. Your Recipe Book collects every food you meet.`,tut7_t:`Unlocking bags (grown-ups)`,tut7_b:`Bags unlock with a token lock on DevFridge (devfridge.cool) and a Solana wallet (Phantom, Solflare or Seed Vault). For now, ONE active lock of {amount} PASTA unlocks ALL bags; later each country gets its own token. The game only checks your lock: you lock on DevFridge, never inside the game. There is no early withdrawal, and on redemption DevFridge takes 2% to buy and burn PASTA. This is not financial advice.`,tut8_t:`Share your day`,tut8_b:`After each day you get Pikko's receipt to share, a text result to copy, a challenge link for friends and a Bleah Cam clip of his funniest face.`,tut9_t:`You're ready!`,tut9_b:`Eat every color, choose light and healthy foods, and have fun! Educational game, not medical advice.`,ux_only_note:`Access checks in the browser are a convenience, not protection.`,recipes_title:`Recipe book`,recipes_count:`{n} / {t} foods discovered`,recipes_empty:`Feed Pikko to fill your recipe book!`,disclaimer:`Educational game — not medical advice. Calorie values are approximate.`,loading:`Loading…`,tap_start:`Tap to start`,webgl_lost:`Restoring graphics…`,webgl_missing:`This device cannot show 3D graphics (WebGL).`,receipt_cashier:`Cashier: Pikko`,receipt_total:`TOTAL`,receipt_points:`POINTS`,receipt_thanks:`Thank you! Eat the rainbow 🌈`,share_title:`PIKKO — Yum or Bleah!`,song:`Pikko song`,song_stop:`Stop song`,kid_mode:`Kids mode (hide crypto)`,credits:`Credits`,blockout_note:`Food models are procedural placeholders until the HD models are produced.`,fact_water:`Water: zero calories, full of freshness.`,fact_juice:`Juice: fruit without the fibre — whole fruit is better.`,cat_veg:`Veggies: fibre and vitamins, few calories.`,cat_fruit:`Fruit: natural sugar plus fibre.`,cat_protein:`Protein helps build strong muscles.`,cat_grain:`Whole grains give long-lasting energy.`,cat_legume:`Legumes: plant protein and fibre.`,cat_nuts:`Healthy fats: good, but rich in calories.`,cat_dairy:`Calcium for bones and teeth.`,cat_water:`Fresh and zero calories.`,cat_sugar:`A 'sometimes food': lots of added sugar.`,cat_fried:`Fried: lots of fat in one bite.`,cat_fizzy:`Fizzy drinks: sugar you can't even see.`,cat_salty:`Very salty: it makes you thirsty.`,cat_fatty:`Lots of saturated fat: a 'sometimes food'.`,cat_ultra:`Ultra-processed: homemade is better!`},it:{subtitle:`Gnam o Bleah!`,play:`Gioca`,classic_desc:`Dai da mangiare a Pikko finché la pancia è piena`,daily:`Menu del giorno`,daily_desc:`Gli stessi 20 round per tutti, oggi`,zen:`Pikko Zen`,zen_desc:`Niente timer, schivate dolci — per i più piccoli`,mart:`Pikko Mart`,recipes:`Ricettario`,settings:`Impostazioni`,back:`Indietro`,close:`Chiudi`,language:`Lingua`,sound:`Audio`,on:`Sì`,off:`No`,quality:`Grafica`,q_high:`Alta`,q_medium:`Media`,q_low:`Bassa`,pause:`Pausa`,resume:`Riprendi`,restart:`Ricomincia`,quit:`Menu principale`,drag_hint:`Trascina un cibo da Pikko`,key_hint:`Tasti: 1 / 2 per scegliere, Invio per dare`,belly:`Pancia`,score:`Punti`,round:`Round {n}`,phase_breakfast:`Colazione`,phase_lunch:`Pranzo`,phase_snack:`Merenda`,phase_dinner:`Cena`,combo:`Serie sana ×{n}`,rainbow:`Bonus arcobaleno!`,bored:`Pikko si è stufato di {food}`,time_up:`Tempo scaduto! Sceglie Pikko…`,habit_junk:`Pikko si è viziato col junk!`,habit_healthy:`Pikko si è abituato al sano!`,palate_reset:`Palato resettato! +300`,habit_fact:`Il palato si abitua! Nella realtà ci vogliono settimane, non 3 bocconi.`,water:`Acqua fresca! +25`,choice:`Scelta furba +{n}`,color_new:`Nuovo colore +50`,victory:`Giornata sana! Pikko ha vinto!`,defeat:`Ahi… troppo junk oggi!`,perfect_day:`Giornata perfetta! +1000`,outcome_rule:`Vinci se almeno metà della pancia è piena di cibo sano.`,results:`Resoconto della giornata`,kcal_eaten:`kcal mangiate`,bites_one:`{n} boccone`,bites_other:`{n} bocconi`,healthy_share:`kcal sane`,best_combo:`serie migliore`,play_again:`Gioca ancora`,share_receipt:`Condividi lo scontrino di Pikko`,save_receipt:`Salva scontrino`,share_text:`Copia risultato`,copied:`Copiato!`,challenge:`Sfida un amico`,bleah_cam:`Clip Bleah Cam`,bleah_cam_save:`Salva clip`,local_best:`Record locale`,new_best:`Nuovo record locale!`,trial_banner:`PROVA — punti non salvati`,trial_end:`Prova finita! Sblocca la busta nel Pikko Mart per continuare.`,mart_title:`Pikko Mart`,mart_sub:`Ogni busta della spesa è un Paese: 20 cibi da scoprire, 10 sani e 10 "da ogni tanto".`,country_start:`Viaggio del gusto: {country}!`,mart_free:`Gratis`,mart_trial:`Prova (5 round)`,mart_play:`Gioca questa busta`,mart_unlock:`Sblocca…`,mart_soon:`Token in arrivo — solo prova`,mart_locked:`Bloccata`,mart_unlocked_until:`Sbloccata fino al {date}`,mart_accessory:`Pikko indossa: {acc}`,mart_foods:`{h} sani · {j} junk`,adult_title:`Area adulti`,adult_q:`Chiedi a un adulto! Quanto fa {a} × {b}?`,adult_wrong:`Non proprio — chiedi a un adulto 🙂`,adult_ok:`OK`,connect:`Collega wallet`,connected:`Collegato: {w}`,disconnect:`Scollega`,open_in_phantom:`Apri in Phantom`,phantom_missing:`Nessun wallet Solana trovato. Su Android usa Chrome con Seed Vault Wallet, Solflare o Phantom, oppure apri questa pagina nell'app Phantom.`,wallet_connecting:`In attesa del wallet…`,wallet_detected:`Rilevato: {name}`,wallet_none:`Nessun wallet rilevato`,wallet_rejected:`Collegamento annullato.`,mode_label:`Modalità`,mode_title:`Chi sta giocando?`,mode_kids:`Modalità bambini`,mode_kids_d:`Semplice e sicura: niente promozioni. Le buste si aprono con l'aiuto di un adulto.`,mode_adult:`Modalità adulti`,mode_adult_d:`Ogni busta è aperta, con le promozioni nel gioco gratuito.`,promo_label:`Promozione`,promo_body:`OnlyFridge Club: un nightclub 3D su Solana. Balla, mixa drink e canta il karaoke. Ingresso gratuito.`,promo_continue:`Continua a giocare`,promo_discover:`Scopri OnlyFridge Club`,sponsor_label:`Spazio a pagamento`,sponsor_disclaimer:`Non è un consiglio finanziario.`,sponsor_empty_cta:`Promuovi il tuo token su DevFridge Scan`,mart_adult_note:`Modalità adulti: ogni busta è aperta, con una promozione prima di ogni partita e una scheda sponsor sopra il gioco. La modalità bambini non ha promozioni: un adulto sblocca le buste con un lock DevFridge o paga a partita.`,pay_title:`Paga a partita`,pay_desc:`{amount} SOL per UNA partita con questa busta, inviati dal tuo wallet a {to}. Nessun rimborso; commissione di rete a parte. Solo per adulti.`,pay_button:`Paga {amount} SOL e gioca`,pay_waiting:`Approva nel wallet, poi attendi la conferma…`,pay_ok:`Pagamento confermato. Buon divertimento!`,pay_failed:`Pagamento non confermato, quindi non è partito nulla. Se il wallet lo ha inviato, controlla la cronologia.`,pay_rejected:`Pagamento annullato.`,pay_nosend:`Questo wallet non può inviare dal gioco. Prova Phantom, Solflare o il wallet del Seeker.`,wallet_inapp:`Sembra un browser integrato in un'app, che non può collegare i wallet. Apri questa pagina in Chrome.`,wallet_open_chrome:`Apri in Chrome`,wallet_copy_link:`Copia link`,wallet_link_copied:`Link copiato. Incollalo in Chrome.`,wallet_notfound_help:`Nessun wallet ha risposto. Apri questa pagina in Chrome (non in un browser integrato) e controlla che sia installata un'app wallet Solana.`,wallet_blocked_help:`Il browser ha bloccato la connessione al wallet. In Chrome consenti l'accesso alla rete locale per questo sito e riprova.`,check_failed:`Verifica non riuscita, riprova`,checking:`Controllo il lock su Solana…`,recheck:`Ricontrolla`,lock_on_devfridge:`Blocca su DevFridge ↗`,scan_link:`Report del token su DevFridge Scan ↗`,onboarding:`Questa busta si apre con un lock. Collega il tuo wallet Solana e blocca {token} su DevFridge per sbloccare {bag} finché il lock è attivo. Il gioco controlla il lock su Solana. Scegli bene la data di sblocco: non è possibile ritirare prima. Quando riscatti dopo la scadenza, DevFridge trattiene il 2% dell’importo del vault per comprare e bruciare PASTA, il token che sostiene lo sviluppatore dell’ecosistema. Le commissioni di rete sono a parte. Prima di bloccare, verifica la compatibilità del token e la possibilità di riscattarlo.`,not_configured_note:`Il token di questa busta non è ancora configurato: per ora si può solo provare. Il lock non si fa mai dentro il gioco.`,pass_note:`Finché non partono i token dei Paesi, UN solo lock attivo di {amount} PASTA su DevFridge sblocca TUTTE le buste del gioco.`,tut_how:`Come si gioca`,tut_next:`Avanti`,tut_back:`Indietro`,tut_skip:`Salta`,tut_start:`Giochiamo!`,tut_again:`Rivedi il tutorial`,tut_count:`{n} / {t}`,tut_coach_skip:`Salta il tutorial`,tut1_t:`Ecco Pikko!`,tut1_b:`Pikko ha sempre fame. A ogni round hai 2 cibi: trascinane uno verso la sua bocca, oppure premi 1 / 2 e Invio. Il cibo sano lo rende felice. Il cibo spazzatura gli fa fare una smorfia di disgusto e lo fa scansare.`,tut2_t:`Riempi la pancia`,tut2_b:`Tutto quello che mangia riempie la pancia di kcal. Vinci la giornata se almeno metà della pancia è cibo sano. Il giorno va dalla colazione alla cena e ogni round ha un timer: se scade, Pikko sceglie da solo.`,tutP1:`Prova! Trascina verso la bocca di Pikko il cibo che pensi sia sano.`,tutP1_good:`Gnam! Il cibo sano rende Pikko felice e ti dà punti. I cibi leggeri e sani danno più bocconi, quindi più punti.`,tutP1_bad:`Bleah! Era cibo spazzatura: Pikko fa la smorfia e ottieni pochi punti. Quello sano era l'altro!`,tutP2:`Ora dai apposta il cibo spazzatura e guarda Pikko. Potrebbe scansarsi: riprova!`,tutP2_junk:`Hai visto la sua faccia? Il cibo spazzatura è sempre penalizzato e gli macchia il bavaglino.`,tutP2_healthy:`Ancora sano, bravo! La prossima volta prova il cibo spazzatura per vedere la smorfia di Pikko.`,tut3_t:`Il palato di Pikko`,tut3_b:`Se mangia cibo spazzatura 3 volte di fila, Pikko si abitua: poi fa la smorfia anche davanti al cibo sano! Dagli 3 cibi sani di fila per rimettere a posto il palato (+300). Anche quando è abituato, il cibo spazzatura viene comunque penalizzato.`,tut4_t:`Punti e bonus`,tut4_b:`I punti seguono le kcal che mangia. Concatena cibi sani per fare una combo, mangia tutti i colori dell'arcobaleno per un bonus e scegli il cibo migliore della coppia per il bonus scelta. Non ripetere lo stesso cibo: Pikko si annoia. Ogni 8 round arriva un bicchiere d'acqua: un potenziamento gratis!`,tut5_t:`Modalità di gioco`,tut5_b:`Classica: 40 round. Menu del giorno: oggi gli stessi 20 round per tutti. Pikko Zen: niente timer e scansate delicate, ideale per i più piccoli.`,tut6_t:`Pikko Mart`,tut6_b:`Nel Mart ogni busta della spesa è un Paese: 20 cibi da scoprire, 10 sani e 10 "da ogni tanto", con una curiosità. Prova qualsiasi busta per 5 round. Il Ricettario raccoglie ogni cibo che incontri.`,tut7_t:`Sbloccare le buste (per gli adulti)`,tut7_b:`Le buste si sbloccano con un lock di token su DevFridge (devfridge.cool) e un wallet Solana (Phantom, Solflare o Seed Vault). Per ora UN solo lock attivo di {amount} PASTA sblocca TUTTE le buste; più avanti ogni Paese avrà il suo token. Il gioco controlla solo il tuo lock: il lock si fa su DevFridge, mai dentro il gioco. Non si può ritirare prima e al riscatto DevFridge trattiene il 2% per comprare e bruciare PASTA. Non è un consiglio finanziario.`,tut8_t:`Condividi la tua giornata`,tut8_b:`A fine giornata ricevi lo scontrino di Pikko da condividere, il risultato in testo da copiare, un link sfida per gli amici e un clip della Bleah Cam con la sua smorfia più buffa.`,tut9_t:`Sei pronto!`,tut9_b:`Mangia tutti i colori, scegli cibi leggeri e sani e divertiti! Gioco educativo, non un consiglio medico.`,ux_only_note:`I controlli di accesso nel browser sono una comodità, non una protezione.`,recipes_title:`Ricettario`,recipes_count:`{n} / {t} cibi scoperti`,recipes_empty:`Dai da mangiare a Pikko per riempire il ricettario!`,disclaimer:`Gioco educativo, non è un consiglio medico. I valori delle calorie sono approssimativi.`,loading:`Caricamento…`,tap_start:`Tocca per iniziare`,webgl_lost:`Ripristino grafica…`,webgl_missing:`Questo dispositivo non può mostrare la grafica 3D (WebGL).`,receipt_cashier:`Cassiere: Pikko`,receipt_total:`TOTALE`,receipt_points:`PUNTI`,receipt_thanks:`Grazie! Mangia i colori 🌈`,share_title:`PIKKO — Gnam o Bleah!`,song:`Canzone di Pikko`,song_stop:`Ferma canzone`,kid_mode:`Modalità bambini (nascondi crypto)`,credits:`Crediti`,blockout_note:`I modelli dei cibi sono segnaposto procedurali, in attesa dei modelli HD.`,fact_water:`Acqua: zero calorie, tanta freschezza.`,fact_juice:`Succo: frutta senza fibre — meglio il frutto intero.`,cat_veg:`Verdura: fibre e vitamine, poche calorie.`,cat_fruit:`Frutta: zuccheri naturali più fibre.`,cat_protein:`Le proteine aiutano i muscoli.`,cat_grain:`I cereali integrali danno energia che dura.`,cat_legume:`Legumi: proteine vegetali e fibre.`,cat_nuts:`Grassi buoni: ottimi, ma ricchi di calorie.`,cat_dairy:`Calcio per ossa e denti.`,cat_water:`Fresca e zero calorie.`,cat_sugar:`Cibo da ogni tanto: tanti zuccheri aggiunti.`,cat_fried:`Fritto: tanti grassi in un boccone.`,cat_fizzy:`Bibite gassate: zucchero che non vedi.`,cat_salty:`Molto salato: fa venire sete.`,cat_fatty:`Tanti grassi saturi: da ogni tanto.`,cat_ultra:`Ultra-processato: meglio fatto in casa!`},pl:{subtitle:`Mniam czy Fuj!`,play:`Graj`,classic_desc:`Karm Pikka, aż brzuszek będzie pełny`,daily:`Menu dnia`,daily_desc:`Te same 20 rund dla wszystkich dzisiaj`,zen:`Pikko Zen`,zen_desc:`Bez zegara, łagodne uniki — dla najmłodszych`,mart:`Pikko Mart`,recipes:`Książka przepisów`,settings:`Ustawienia`,back:`Wstecz`,close:`Zamknij`,language:`Język`,sound:`Dźwięk`,on:`Wł.`,off:`Wył.`,quality:`Grafika`,q_high:`Wysoka`,q_medium:`Średnia`,q_low:`Niska`,pause:`Pauza`,resume:`Wznów`,restart:`Od nowa`,quit:`Menu główne`,drag_hint:`Przeciągnij jedzenie do Pikka`,key_hint:`Klawisze: 1 / 2 wybór, Enter karmienie`,belly:`Brzuszek`,score:`Wynik`,round:`Runda {n}`,phase_breakfast:`Śniadanie`,phase_lunch:`Obiad`,phase_snack:`Podwieczorek`,phase_dinner:`Kolacja`,combo:`Zdrowa seria ×{n}`,rainbow:`Bonus tęczy!`,bored:`Pikko ma dość: {food}`,time_up:`Koniec czasu! Pikko wybiera…`,habit_junk:`Pikko przyzwyczaił się do śmieciowego jedzenia!`,habit_healthy:`Pikko polubił zdrowe jedzenie!`,palate_reset:`Smak zresetowany! +300`,habit_fact:`Smak się przyzwyczaja! W prawdziwym życiu trwa to tygodnie, nie 3 kęsy.`,water:`Świeża woda! +25`,choice:`Mądry wybór +{n}`,color_new:`Nowy kolor +50`,victory:`Zdrowy dzień! Pikko wygrywa!`,defeat:`Auć… dziś za dużo śmieciowego jedzenia!`,perfect_day:`Idealny dzień! +1000`,outcome_rule:`Wygrywasz, gdy co najmniej połowa brzuszka to zdrowe jedzenie.`,results:`Podsumowanie dnia`,kcal_eaten:`zjedzonych kcal`,bites_one:`{n} kęs`,bites_few:`{n} kęsy`,bites_many:`{n} kęsów`,bites_other:`{n} kęsa`,healthy_share:`zdrowe kcal`,best_combo:`najlepsza seria`,play_again:`Zagraj jeszcze`,share_receipt:`Udostępnij paragon Pikka`,save_receipt:`Zapisz paragon`,share_text:`Kopiuj wynik`,copied:`Skopiowano!`,challenge:`Wyzwij znajomego`,bleah_cam:`Klip Bleah Cam`,bleah_cam_save:`Zapisz klip`,local_best:`Rekord lokalny`,new_best:`Nowy rekord lokalny!`,trial_banner:`PRÓBA — wynik niezapisany`,trial_end:`Koniec próby! Odblokuj torbę w Pikko Mart, aby grać dalej.`,mart_title:`Pikko Mart`,mart_sub:`Każda torba na zakupy to kraj: 20 potraw do odkrycia, 10 zdrowych i 10 „od święta”.`,country_start:`Podróż smaków: {country}!`,mart_free:`Za darmo`,mart_trial:`Wypróbuj (5 rund)`,mart_play:`Graj tą torbą`,mart_unlock:`Odblokuj…`,mart_soon:`Token wkrótce — tylko próba`,mart_locked:`Zablokowana`,mart_unlocked_until:`Odblokowana do {date}`,mart_accessory:`Pikko nosi: {acc}`,mart_foods:`zdrowe: {h} · śmieciowe: {j}`,adult_title:`Strefa dorosłych`,adult_q:`Zapytaj dorosłego! Ile to {a} × {b}?`,adult_wrong:`Nie całkiem — zapytaj dorosłego 🙂`,adult_ok:`OK`,connect:`Połącz portfel`,connected:`Połączono: {w}`,disconnect:`Rozłącz`,open_in_phantom:`Otwórz w Phantom`,phantom_missing:`Nie znaleziono portfela Solana. Na Androidzie użyj Chrome z Seed Vault Wallet, Solflare lub Phantom albo otwórz tę stronę w aplikacji Phantom.`,wallet_connecting:`Czekam na portfel…`,wallet_detected:`Wykryto: {name}`,wallet_none:`Nie wykryto portfela`,wallet_rejected:`Połączenie anulowane.`,mode_label:`Tryb`,mode_title:`Kto gra?`,mode_kids:`Tryb dziecięcy`,mode_kids_d:`Prosto i bezpiecznie: bez promocji. Torby otwiera dorosły.`,mode_adult:`Tryb dorosłych`,mode_adult_d:`Każda torba jest otwarta, z promocjami w darmowej grze.`,promo_label:`Promocja`,promo_body:`OnlyFridge Club: klub nocny 3D na Solanie. Tańcz, mieszaj drinki i śpiewaj karaoke. Wstęp wolny.`,promo_continue:`Graj dalej`,promo_discover:`Poznaj OnlyFridge Club`,sponsor_label:`Miejsce płatne`,sponsor_disclaimer:`To nie jest porada finansowa.`,sponsor_empty_cta:`Wypromuj swój token w DevFridge Scan`,mart_adult_note:`Tryb dorosłych: każda torba jest otwarta, z promocją przed każdą rundą i kartą sponsora nad grą. Tryb dziecięcy nie ma promocji: dorosły odblokowuje torby blokadą DevFridge lub płaci za rundę.`,pay_title:`Płać za rundę`,pay_desc:`{amount} SOL za JEDNĄ rundę z tą torbą, wysłane z Twojego portfela na {to}. Bez zwrotów; opłata sieciowa dodatkowo. Tylko dla dorosłych.`,pay_button:`Zapłać {amount} SOL i graj`,pay_waiting:`Zatwierdź w portfelu, potem poczekaj na potwierdzenie…`,pay_ok:`Płatność potwierdzona. Miłej zabawy!`,pay_failed:`Płatność niepotwierdzona, więc nic nie ruszyło. Jeśli portfel ją wysłał, sprawdź historię.`,pay_rejected:`Płatność anulowana.`,pay_nosend:`Ten portfel nie może wysyłać z gry. Spróbuj Phantom, Solflare lub portfela Seeker.`,wallet_inapp:`To wygląda na przeglądarkę wbudowaną w aplikację, która nie połączy portfeli. Otwórz tę stronę w Chrome.`,wallet_open_chrome:`Otwórz w Chrome`,wallet_copy_link:`Kopiuj link`,wallet_link_copied:`Link skopiowany. Wklej go w Chrome.`,wallet_notfound_help:`Żaden portfel nie odpowiedział. Otwórz tę stronę w Chrome (nie w przeglądarce wbudowanej) i sprawdź, czy masz aplikację portfela Solana.`,wallet_blocked_help:`Przeglądarka zablokowała połączenie z portfelem. W Chrome zezwól tej stronie na dostęp do sieci lokalnej i spróbuj ponownie.`,check_failed:`Nie udało się sprawdzić, spróbuj ponownie`,checking:`Sprawdzam blokadę w sieci Solana…`,recheck:`Sprawdź ponownie`,lock_on_devfridge:`Zablokuj w DevFridge ↗`,scan_link:`Raport tokena w DevFridge Scan ↗`,onboarding:`Ta torba otwiera się dzięki blokadzie. Połącz portfel Solana i zablokuj {token} w DevFridge, aby odblokować {bag} na czas trwania blokady. Gra sprawdza blokadę w sieci Solana. Wybierz datę odblokowania rozważnie: nie ma możliwości wcześniejszej wypłaty. Przy wypłacie po wygaśnięciu DevFridge pobiera 2% kwoty z sejfu, aby kupić i spalić PASTA, token wspierający twórcę ekosystemu. Opłaty sieciowe są osobne. Przed zablokowaniem sprawdź zgodność tokena i możliwość wypłaty.`,not_configured_note:`Token tej torby nie jest jeszcze skonfigurowany, więc można ją tylko wypróbować. Blokady nigdy nie robi się w grze.`,pass_note:`Dopóki nie ruszą tokeny krajów, JEDNA aktywna blokada {amount} PASTA w DevFridge odblokowuje WSZYSTKIE torby w grze.`,tut_how:`Jak grać`,tut_next:`Dalej`,tut_back:`Wstecz`,tut_skip:`Pomiń`,tut_start:`Gramy!`,tut_again:`Powtórz samouczek`,tut_count:`{n} / {t}`,tut_coach_skip:`Pomiń samouczek`,tut1_t:`Poznaj Pikka!`,tut1_b:`Pikko jest zawsze głodny. W każdej rundzie masz 2 jedzenia: przeciągnij jedno do jego buzi albo naciśnij 1 / 2 i Enter. Zdrowe jedzenie go cieszy. Śmieciowe jedzenie sprawia, że robi minę z obrzydzeniem i się odsuwa.`,tut2_t:`Napełnij brzuszek`,tut2_b:`Wszystko, co zje, napełnia brzuszek kcal. Wygrywasz dzień, jeśli co najmniej połowa brzuszka to zdrowe jedzenie. Dzień trwa od śniadania do kolacji, a każda runda ma licznik: gdy się skończy, Pikko wybiera sam.`,tutP1:`Spróbuj! Przeciągnij do buzi Pikka jedzenie, które uważasz za zdrowe.`,tutP1_good:`Pycha! Zdrowe jedzenie cieszy Pikka i daje punkty. Lekkie, zdrowe jedzenie to więcej kęsów, czyli więcej punktów.`,tutP1_bad:`Fuj! To było śmieciowe jedzenie: Pikko robi minę, a ty dostajesz mało punktów. Zdrowe było to drugie!`,tutP2:`Teraz celowo daj mu śmieciowe jedzenie i patrz na Pikka. Może się odsunąć: spróbuj jeszcze raz!`,tutP2_junk:`Widzisz jego minę? Śmieciowe jedzenie zawsze jest karane i brudzi mu śliniak.`,tutP2_healthy:`Znowu zdrowo, świetnie! Następnym razem spróbuj śmieciowego jedzenia, żeby zobaczyć minę Pikka.`,tut3_t:`Podniebienie Pikka`,tut3_b:`Jeśli zje śmieciowe jedzenie 3 razy z rzędu, Pikko się do niego przyzwyczai: wtedy robi miny nawet do zdrowego jedzenia! Daj mu 3 zdrowe jedzenia z rzędu, by zresetować podniebienie (+300). Nawet gdy jest przyzwyczajony, śmieciowe jedzenie nadal jest karane.`,tut4_t:`Punkty i bonusy`,tut4_b:`Punkty zależą od kcal, które zje. Łącz zdrowe jedzenie w kombo, jedz wszystkie kolory tęczy dla bonusu i wybieraj mądrzejsze jedzenie z pary dla bonusu za wybór. Nie powtarzaj tego samego: Pikko się nudzi. Co 8 rund pojawia się szklanka wody: darmowy bonus!`,tut5_t:`Tryby gry`,tut5_b:`Klasyczny: 40 rund. Menu dnia: dziś te same 20 rund dla wszystkich. Pikko Zen: bez licznika i z delikatnym unikaniem, idealny dla maluchów.`,tut6_t:`Pikko Mart`,tut6_b:`W Marcie każda torba z zakupami to kraj: 20 potraw do odkrycia, 10 zdrowych i 10 „od czasu do czasu”, z ciekawostką. Wypróbuj dowolną torbę przez 5 rund. Książka przepisów zbiera każde jedzenie, które spotkasz.`,tut7_t:`Odblokowywanie toreb (dla dorosłych)`,tut7_b:`Torby odblokowuje blokada tokenów w DevFridge (devfridge.cool) i portfel Solana (Phantom, Solflare lub Seed Vault). Na razie JEDNA aktywna blokada {amount} PASTA odblokowuje WSZYSTKIE torby; później każdy kraj dostanie własny token. Gra tylko sprawdza twoją blokadę: blokujesz w DevFridge, nigdy w grze. Nie ma wcześniejszej wypłaty, a przy wypłacie DevFridge pobiera 2%, by kupić i spalić PASTA. To nie jest porada finansowa.`,tut8_t:`Pochwal się dniem`,tut8_b:`Po każdym dniu dostajesz paragon Pikka do udostępnienia, wynik tekstowy do skopiowania, link z wyzwaniem dla znajomych i klip Bleah Cam z jego najśmieszniejszą miną.`,tut9_t:`Jesteś gotowy!`,tut9_b:`Jedz wszystkie kolory, wybieraj lekkie i zdrowe jedzenie i baw się dobrze! Gra edukacyjna, nie porada medyczna.`,ux_only_note:`Sprawdzanie dostępu w przeglądarce to wygoda, a nie zabezpieczenie.`,recipes_title:`Książka przepisów`,recipes_count:`odkryte potrawy: {n} / {t}`,recipes_empty:`Karm Pikka, aby wypełnić książkę przepisów!`,disclaimer:`Gra edukacyjna, nie porada medyczna. Wartości kalorii są przybliżone.`,loading:`Ładowanie…`,tap_start:`Dotknij, aby zacząć`,webgl_lost:`Przywracanie grafiki…`,webgl_missing:`To urządzenie nie wyświetli grafiki 3D (WebGL).`,receipt_cashier:`Kasjer: Pikko`,receipt_total:`RAZEM`,receipt_points:`PUNKTY`,receipt_thanks:`Dziękujemy! Jedz kolorowo 🌈`,share_title:`PIKKO — Mniam czy Fuj!`,song:`Piosenka Pikka`,song_stop:`Zatrzymaj piosenkę`,kid_mode:`Tryb dziecięcy (ukryj krypto)`,credits:`Autorzy`,blockout_note:`Modele jedzenia to proceduralne zamienniki do czasu powstania modeli HD.`,fact_water:`Woda: zero kalorii, pełno świeżości.`,fact_juice:`Sok: owoce bez błonnika — lepszy cały owoc.`,cat_veg:`Warzywa: błonnik i witaminy, mało kalorii.`,cat_fruit:`Owoce: naturalny cukier i błonnik.`,cat_protein:`Białko pomaga budować mocne mięśnie.`,cat_grain:`Pełne ziarna dają energię na długo.`,cat_legume:`Strączki: białko roślinne i błonnik.`,cat_nuts:`Zdrowe tłuszcze: dobre, ale kaloryczne.`,cat_dairy:`Wapń dla kości i zębów.`,cat_water:`Świeża i bez kalorii.`,cat_sugar:`Jedzenie od święta: dużo dodanego cukru.`,cat_fried:`Smażone: dużo tłuszczu w jednym kęsie.`,cat_fizzy:`Napoje gazowane: cukier, którego nie widać.`,cat_salty:`Bardzo słone: chce się pić.`,cat_fatty:`Dużo tłuszczów nasyconych: od święta.`,cat_ultra:`Wysoko przetworzone: lepiej domowe!`}},Su=`modulepreload`,Cu=function(e,t){return new URL(e,t).href},wu={},Tu=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=Cu(t,n),t=s(t),t in wu)return;wu[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:Su,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},Eu=Object.assign({"./locales/ar.json":()=>Tu(()=>import(`./ar-DagVqgl3.js`).then(e=>e.default),[],import.meta.url),"./locales/de.json":()=>Tu(()=>import(`./de-roguJ977.js`).then(e=>e.default),[],import.meta.url),"./locales/el.json":()=>Tu(()=>import(`./el-BTU00Lif.js`).then(e=>e.default),[],import.meta.url),"./locales/es.json":()=>Tu(()=>import(`./es-D6TGsduE.js`).then(e=>e.default),[],import.meta.url),"./locales/fil.json":()=>Tu(()=>import(`./fil-BDEJB0Np.js`).then(e=>e.default),[],import.meta.url),"./locales/fr.json":()=>Tu(()=>import(`./fr-CXXkxLZh.js`).then(e=>e.default),[],import.meta.url),"./locales/hi.json":()=>Tu(()=>import(`./hi-A5-IfiKI.js`).then(e=>e.default),[],import.meta.url),"./locales/id.json":()=>Tu(()=>import(`./id-DMarbUiy.js`).then(e=>e.default),[],import.meta.url),"./locales/ja.json":()=>Tu(()=>import(`./ja-CjV1aKC4.js`).then(e=>e.default),[],import.meta.url),"./locales/ko.json":()=>Tu(()=>import(`./ko-DKVAEDPH.js`).then(e=>e.default),[],import.meta.url),"./locales/pt.json":()=>Tu(()=>import(`./pt-By2A-_HN.js`).then(e=>e.default),[],import.meta.url),"./locales/ru.json":()=>Tu(()=>import(`./ru-Cl-02wWB.js`).then(e=>e.default),[],import.meta.url),"./locales/th.json":()=>Tu(()=>import(`./th-CNmJGpMv.js`).then(e=>e.default),[],import.meta.url),"./locales/tr.json":()=>Tu(()=>import(`./tr-B2XkDCMd.js`).then(e=>e.default),[],import.meta.url),"./locales/uk.json":()=>Tu(()=>import(`./uk-DU4eef21.js`).then(e=>e.default),[],import.meta.url),"./locales/vi.json":()=>Tu(()=>import(`./vi-uTthvzih.js`).then(e=>e.default),[],import.meta.url),"./locales/zh.json":()=>Tu(()=>import(`./zh-DENSzHgN.js`).then(e=>e.default),[],import.meta.url)}),Du=new Map,Ou=`en`;function ku(){let e=bu.get(`lang`);if(e&&tu.includes(e))return e;for(let e of navigator.languages??[navigator.language||`en`]){let t=e.split(`-`)[0].toLowerCase(),n=t===`tl`?`fil`:t;if(tu.includes(n))return n}return`en`}function Au(){return Ou}async function ju(e){if(!iu(e)&&!Du.has(e)){let t=Eu[`./locales/${e}.json`];t?Du.set(e,await t()):e=`en`}Ou=e,bu.set(`lang`,e),document.documentElement.lang=e,document.documentElement.dir=nu[e].dir}var Mu=()=>ju(ku());function Nu(){return iu(Ou)?Ou:`en`}function J(e,t={}){return((iu(Ou)?xu[Ou][e]:Du.get(Ou)?.ui[e])??xu.en[e]??e).replace(/\{(\w+)\}/g,(e,n)=>n in t?String(t[n]):`{${n}}`)}function Pu(e,t){let n=new Intl.PluralRules(nu[Ou].locale).select(t);return J((iu(Ou)?xu[Ou]:Du.get(Ou)?.ui??{})[`${e}_${n}`]===void 0?`${e}_other`:`${e}_${n}`,{n:Iu(t)})}var Fu=new Map;function Iu(e){return Fu.has(Ou)||Fu.set(Ou,new Intl.NumberFormat(nu[Ou].locale)),Fu.get(Ou).format(Math.round(e))}function Lu(e){return iu(Ou)?e.name[Ou]:Du.get(Ou)?.foods[e.id]??e.name.en}function Ru(e){return iu(Ou)?e.name[Ou]:Du.get(Ou)?.bags[e.id]?.name??e.name.en}function zu(e){return iu(Ou)?e.accessory[Ou]:Du.get(Ou)?.bags[e.id]?.accessory??e.accessory.en}function Bu(e){return iu(Ou)?e.fact[Ou]:Du.get(Ou)?.bags[e.id]?.fact??e.fact.en}function Vu(e){return e.id===`water`?J(`fact_water`):e.id===`juice`?J(`fact_juice`):`${e.bag===`base`?``:`${Ru(pu(e.bag))} · `}${Lu(e)} · ${Iu(e.kcal)} kcal / ${e.qty} ${e.unit}. ${J(`cat_`+e.cat)}`}function Hu(e){return new Intl.DateTimeFormat(nu[Ou].locale,{dateStyle:`medium`,timeStyle:`short`}).format(new Date(e*1e3))}function Uu(e,t){let n=document.createElement(`canvas`);return n.width=e,n.height=t,[n,n.getContext(`2d`)]}function Wu(e){let t=e>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function Gu(){let e=1024,[t,n]=Uu(e,512),[i,a]=Uu(e,512),o=Wu(7);n.fillStyle=`#b07a48`,n.fillRect(0,0,e,512),a.fillStyle=`#808080`,a.fillRect(0,0,e,512);for(let t=0;t<5;t++){let r=t*512/5,i=.85+o()*.3;n.fillStyle=`rgba(${Math.round(150*i)},${Math.round(100*i)},${Math.round(58*i)},0.55)`,n.fillRect(0,r,e,512/5);for(let t=0;t<70;t++){let t=r+o()*(512/5),i=2+o()*6,s=.004+o()*.01,c=o()*10,l=o()<.5;n.strokeStyle=l?`rgba(70,40,18,${.08+o()*.18})`:`rgba(235,190,140,${.05+o()*.1})`,a.strokeStyle=l?`rgba(40,40,40,${.2+o()*.3})`:`rgba(200,200,200,${.1+o()*.2})`,n.lineWidth=a.lineWidth=.6+o()*1.8,n.beginPath(),a.beginPath();for(let r=0;r<=e;r+=8){let e=t+Math.sin(r*s+c)*i+Math.sin(r*s*3.1+c)*i*.3;r===0?(n.moveTo(r,e),a.moveTo(r,e)):(n.lineTo(r,e),a.lineTo(r,e))}n.stroke(),a.stroke()}if(o()<.6){let t=o()*e,i=r+(.3+o()*.4)*(512/5);for(let e=0;e<6;e++)n.strokeStyle=`rgba(60,32,14,${.25-e*.03})`,n.beginPath(),n.ellipse(t,i,6+e*5,3+e*2.2,0,0,Math.PI*2),n.stroke()}n.fillStyle=`rgba(40,22,10,0.55)`,n.fillRect(0,r,e,2),a.fillStyle=`#202020`,a.fillRect(0,r,e,2)}let s=new xi(t);s.colorSpace=He,s.wrapS=s.wrapT=r,s.anisotropy=8;let c=new xi(i);return c.wrapS=c.wrapT=r,{map:s,bump:c}}function Ku(e=[`#f6f1e7`,`#d7263d`]){let[t,n]=Uu(256,256),i=()=>{n.fillStyle=e[0],n.fillRect(0,0,256,256),n.globalAlpha=.55,n.fillStyle=e[1];for(let e=0;e<8;e+=2)n.fillRect(e*32,0,32,256),n.fillRect(0,e*32,256,32);n.globalAlpha=1,n.fillStyle=`rgba(0,0,0,0.05)`;for(let e=0;e<256;e+=2)n.fillRect(0,e,256,1);n.fillStyle=`rgba(0,0,0,0.18)`,n.fillRect(0,0,256,4),n.fillRect(0,252,256,4)};i();let a=new xi(t);a.colorSpace=He,a.wrapS=a.wrapT=r,a.repeat.set(2,1);let o=Wu(11);return{tex:a,stain(e){let t=30+o()*196,r=40+o()*176,i=8+o()*16;n.fillStyle=e,n.globalAlpha=.55,n.beginPath();for(let e=0;e<Math.PI*2;e+=.5){let a=i*(.7+o()*.5),s=t+Math.cos(e)*a,c=r+Math.sin(e)*a;e===0?n.moveTo(s,c):n.lineTo(s,c)}n.closePath(),n.fill(),n.globalAlpha=1,a.needsUpdate=!0},clean(){i(),a.needsUpdate=!0}}}function qu(){let[e,t]=Uu(128,128),n=t.createRadialGradient(64,64,0,64,64,64);return n.addColorStop(0,`rgba(0,0,0,0.55)`),n.addColorStop(.5,`rgba(0,0,0,0.25)`),n.addColorStop(1,`rgba(0,0,0,0)`),t.fillStyle=n,t.fillRect(0,0,128,128),new xi(e)}function Ju(){let[e,t]=Uu(128,128),n=t.createImageData(128,128),i=Wu(3);for(let e=0;e<16384;e++){let t=110+i()*40;n.data[e*4]=n.data[e*4+1]=n.data[e*4+2]=t,n.data[e*4+3]=255}t.putImageData(n,0,0);let a=new xi(e);return a.wrapS=a.wrapT=r,a.repeat.set(3,3),a}function Yu(){let[e,t]=Uu(256,256);t.fillStyle=`#e9e1d2`,t.fillRect(0,0,256,256);let n=Wu(5);for(let e=0;e<256;e+=2)t.fillStyle=`rgba(120,100,80,${.05+n()*.08})`,t.fillRect(0,e,256,1),t.fillStyle=`rgba(120,100,80,${.04+n()*.06})`,t.fillRect(e,0,1,256);let i=new xi(e);return i.colorSpace=He,i.wrapS=i.wrapT=r,i.repeat.set(3,2),i}function Xu(e){let[t,n]=Uu(128,128),i=128/e.length;e.forEach((e,t)=>{n.fillStyle=e,n.fillRect(t*i,0,i+1,128)});let a=new xi(t);return a.colorSpace=He,a.wrapS=a.wrapT=r,a.repeat.set(3,1),a}var Zu=null,Qu=new Map;function Y(e,t=.6,n={}){let r=`${e}|${t}|${JSON.stringify(n)}`,i=Qu.get(r);return i||(Zu??=Ju(),i=new ya({color:e,roughness:t,bumpMap:Zu,bumpScale:.6,...n}),Qu.set(r,i)),i}var $u=e=>Y(e,.25,{clearcoat:.6,clearcoatRoughness:.3}),ed=()=>Y(`#f7f4ee`,.18,{clearcoat:1,clearcoatRoughness:.08}),td=()=>Y(`#ffffff`,.04,{transparent:!0,opacity:.28,clearcoat:1,depthWrite:!1}),nd=e=>Y(e,.3,{metalness:.85});function X(e,t,n=0,r=0,i=0,a=0,o=0,s=0,c=1,l=1,u=1){let d=new ri(e,t);return d.position.set(n,r,i),d.rotation.set(a,o,s),d.scale.set(c,l,u),d.castShadow=!0,d.receiveShadow=!0,d}function rd(e){let t=0;for(let n=0;n<e.length;n++)t=t*31+e.charCodeAt(n)>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}var id=[`#ff4d6d`,`#ffd60a`,`#3a86ff`,`#80ed99`,`#ffffff`,`#c77dff`];function ad(e=.36,t=.2){return new ia([new B(0,0),new B(e*.55,0),new B(e*.6,.02),new B(e*.85,t*.4),new B(e,t),new B(e*.94,t),new B(e*.8,t*.45),new B(e*.5,t*.12),new B(0,t*.1)],40)}var od={fruit(e,t,n,r){let i=r.id===`kiwi`,a=X(new G(.3,40,28),i?Y(t[0],.95):$u(t[0]),0,.27,0,0,0,0,1,.9,1);e.add(a),r.id.includes(`apple`)||r.id===`pear`||r.id===`peach`?(e.add(X(new W(.012,.018,.12,8),Y(`#5c4426`,.8),.01,.56,0,0,0,.2)),e.add(X(new G(.06,16,8),Y(`#3a7d2c`,.5),.07,.58,0,0,0,-.6,1.4,.25,.7))):/orange|mandarin|clementine|tomato|pepper|persimmon/.test(r.id)&&e.add(X(new W(.05,.05,.02,6),Y(t[1]??`#3a7d2c`,.6),0,.53,0)),r.id===`pear`&&a.scale.set(.85,1.15,.85),/mango|papaya|guava|melon(?!_)/.test(r.id)&&a.scale.set(1.2,.85,.9)},berries(e,t,n){e.add(X(ad(.36,.16),ed()));for(let r=0;r<14;r++){let i=n()*Math.PI*2,a=n()*.22,o=.07+n()*.03;e.add(X(new G(o,16,12),$u(r%5==4&&t[1]?t[1]:t[0]),Math.cos(i)*a,.14+n()*.1,Math.sin(i)*a,0,0,0,1,1.15,1))}},banana(e,t){let n=new Bi([new V(-.32,.18,0),new V(-.15,.08,0),new V(.12,.08,0),new V(.32,.2,0)]);e.add(X(new sa(n,32,.075,8,!1),Y(t[0],.5))),e.add(X(new G(.075,12,8),Y(t[0],.5),-.32,.18,0)),e.add(X(new W(.02,.03,.06,6),Y(t[1],.8),.34,.22,0,0,0,-.9))},carrot(e,t){e.add(X(new Oi(.1,.62,20),Y(t[0],.65),0,.1,0,0,0,Math.PI/2));for(let n=-1;n<=1;n++)e.add(X(new Oi(.02,.22,6),Y(t[1],.6),-.4,.12+n*.03,n*.03,0,0,Math.PI/2+n*.3))},tree(e,t,n){e.add(X(new W(.06,.09,.3,12),Y(t[1],.7),0,.15,0));for(let r=0;r<16;r++){let r=n()*Math.PI*2,i=n()*.17;e.add(X(new G(.09+n()*.04,12,10),Y(t[0],.9),Math.cos(r)*i,.34+n()*.1,Math.sin(r)*i))}},sticks(e,t,n){e.add(X(new W(.16,.14,.3,24,1,!0),td(),0,.15,0));for(let r=0;r<7;r++){let i=r/7*Math.PI*2;e.add(X(new W(.025,.03,.55,8),Y(r%3==2&&t[1]?t[1]:t[0],.6),Math.cos(i)*.07,.3,Math.sin(i)*.07,Math.sin(i)*.2,0,Math.cos(i)*.2+(n()-.5)*.2))}},bowl(e,t,n){e.add(X(ad(),ed())),e.add(X(new W(.32,.25,.04,32),Y(t[0],.75),0,.17,0));for(let r=0;r<7;r++){let r=n()*Math.PI*2,i=n()*.22;e.add(X(new G(.035+n()*.025,10,8),Y(t[1],.5),Math.cos(r)*i,.2,Math.sin(r)*i,0,0,0,1,.7,1))}},soup(e,t,n){e.add(X(ad(.38,.2),ed())),e.add(X(new W(.34,.26,.03,40),Y(t[0],.12,{clearcoat:1}),0,.17,0));for(let r=0;r<4;r++){let r=n()*Math.PI*2,i=n()*.2;e.add(X(new G(.03,8,6),Y(t[1],.6),Math.cos(r)*i,.19,Math.sin(r)*i,0,0,0,1,.4,1))}},glass(e,t){e.add(X(new W(.17,.14,.6,32,1,!0),td(),0,.3,0)),e.add(X(new W(.155,.13,.48,32),Y(t[0],.2,{transparent:!0,opacity:.88}),0,.25,0)),e.add(X(new W(.015,.015,.55,8),Y(`#ff4d6d`,.4),.06,.48,0,0,0,-.25))},cup(e,t){e.add(X(new W(.18,.13,.55,32),Y(t[0],.5),0,.275,0)),e.add(X(new W(.185,.185,.12,32,1,!0),Y(`#ffffff`,.6),0,.35,0)),e.add(X(new G(.17,24,12,0,Math.PI*2,0,Math.PI/2),Y(t[1]??`#fff6e8`,.7),0,.55,0)),e.add(X(new W(.02,.02,.5,8),Y(`#3a86ff`,.4),.05,.75,0,0,0,-.15))},can(e,t){e.add(X(new W(.15,.15,.46,40),nd(t[0]),0,.23,0)),e.add(X(new W(.152,.152,.14,40,1,!0),Y(t[1],.4),0,.24,0)),e.add(X(new W(.13,.15,.03,40),nd(`#cfd3d6`),0,.475,0)),e.add(X(new oa(.03,.008,6,16),nd(`#cfd3d6`),.04,.495,0,Math.PI/2))},bottle(e,t){e.add(X(new W(.15,.15,.5,32),Y(t[0],.15,{transparent:!0,opacity:.85,clearcoat:1}),0,.25,0)),e.add(X(new W(.06,.15,.16,32),Y(t[0],.15,{transparent:!0,opacity:.85}),0,.58,0)),e.add(X(new W(.155,.155,.16,32,1,!0),Y(t[1],.5),0,.28,0)),e.add(X(new W(.065,.065,.07,16),Y(`#f8f8f8`,.5),0,.69,0))},mug(e,t){e.add(X(new W(.2,.18,.36,32,1,!0),Y(t[1],.25,{clearcoat:1,side:2}),0,.18,0)),e.add(X(new W(.18,.18,.02,32),Y(t[1],.3),0,.01,0)),e.add(X(new W(.19,.19,.01,32),Y(t[0],.1,{clearcoat:1}),0,.3,0)),e.add(X(new oa(.09,.025,10,20,Math.PI),Y(t[1],.3),.2,.18,0,0,0,-Math.PI/2))},donut(e,t,n,r){if(e.add(X(new oa(.2,.11,20,36),Y(t[0],.75),0,.11,0,Math.PI/2,0,0,1,1,.9)),r.id!==`jumbo_pretzel`){e.add(X(new oa(.2,.112,16,36,Math.PI*2),$u(t[1]),0,.14,0,Math.PI/2,0,0,1,1,.55));for(let t=0;t<18;t++){let r=n()*Math.PI*2,i=.13+n()*.14;e.add(X(new Ei(.008,.03,2,4),Y(id[t%id.length],.4),Math.cos(r)*i,.22,Math.sin(r)*i,Math.PI/2,0,n()*3))}}},ball(e,t){for(let[n,r,i]of[[-.12,.13,.05],[.13,.13,.04],[0,.13,-.13],[0,.31,-.02]])e.add(X(new G(.14,24,16),Y(t[0],.7),n,r,i)),e.add(X(new G(.142,24,12,0,Math.PI*2,0,1.1),$u(t[1]),n,r+.005,i))},burger(e,t,n,r){if(!/burger/.test(r.id)){e.add(X(new Ti(.6,.08,.42),Y(t[0],.85),0,.04,0)),e.add(X(new Ti(.62,.05,.44),Y(t[1],.6),0,.105,0)),e.add(X(new Ti(.63,.025,.45),Y(`#6a994e`,.6),0,.14,0)),e.add(X(new Ti(.6,.08,.42),Y(t[0],.85),0,.19,0));return}e.add(X(new W(.28,.26,.09,32),Y(t[0],.8),0,.045,0)),e.add(X(new W(.3,.3,.08,32),Y(`#5a3420`,.9),0,.13,0)),e.add(X(new Ti(.46,.015,.46),Y(`#ffbe0b`,.5),0,.18,0,0,.6,0)),e.add(X(new W(.31,.31,.02,24),Y(`#6a994e`,.6),0,.2,0)),e.add(X(new G(.29,32,16,0,Math.PI*2,0,Math.PI/2),Y(t[0],.6,{clearcoat:.4}),0,.21,0,0,0,0,1,.7,1));for(let t=0;t<14;t++){let t=n()*Math.PI*2,r=n()*.2;e.add(X(new G(.012,6,4),Y(`#fff3d6`,.5),Math.cos(t)*r,.21+Math.sqrt(Math.max(0,.0841-r*r))*.7,Math.sin(t)*r,0,0,0,1.6,.6,1))}},wrap(e,t){e.add(X(new W(.13,.13,.55,28),Y(t[0],.85),0,.13,0,0,0,Math.PI/2)),e.add(X(new Di(.12,24),Y(t[1],.6),.276,.13,0,0,Math.PI/2,0)),e.add(X(new W(.135,.135,.2,28,1,!0),Y(`#f1ead6`,.9,{side:2}),-.15,.13,0,0,0,Math.PI/2))},hotdog(e,t){e.add(X(new Ei(.11,.42,6,16),Y(t[0],.8),0,.1,0,0,0,Math.PI/2,1,1,1.25)),e.add(X(new Ei(.06,.52,6,16),$u(t[1]),0,.18,0,0,0,Math.PI/2));let n=Array.from({length:12},(e,t)=>new V(-.25+t*.045,.245,Math.sin(t*1.4)*.04));e.add(X(new sa(new Bi(n),40,.012,6),Y(`#ffd60a`,.4)))},pizza(e,t,n){let r=new W(.5,.5,.05,24,1,!1,-.4,.8);e.add(X(r,Y(t[0],.85),-.25,.025,0,0,Math.PI/2,0)),e.add(X(new W(.46,.46,.02,24,1,!1,-.38,.76),Y(`#f4d58d`,.6),-.25,.06,0,0,Math.PI/2,0)),e.add(X(new oa(.48,.035,8,12,.8),Y(t[0],.8),-.25,.05,0,Math.PI/2,0,Math.PI/2-.4));for(let r=0;r<4;r++)e.add(X(new W(.045,.045,.012,16),Y(t[1],.5),-.1+n()*.3,.075,(n()-.5)*.15))},fries(e,t,n){let r=X(new W(.2,.14,.32,4,1,!0),Y(t[1],.5,{side:2}),0,.16,0,0,Math.PI/4,0);e.add(r);for(let r=0;r<16;r++)e.add(X(new Ti(.035,.36,.035),Y(t[0],.6),(n()-.5)*.18,.3+n()*.08,(n()-.5)*.18,(n()-.5)*.4,0,(n()-.5)*.4))},chipsbag(e,t,n){let r=Y(t[1],.28,{metalness:.45,clearcoat:.9});e.add(X(new Ti(.5,.56,.16,6,6,2),r,0,.36,0)),e.add(X(new W(.08,.08,.5,20,1),r,0,.36,0,0,0,Math.PI/2,1,1,.9));for(let t of[.09,.63])e.add(X(new Ti(.52,.05,.05),r,0,t,0));e.add(X(new Di(.11,24),Y(t[0],.45),0,.38,.165));for(let r=0;r<4;r++)e.add(X(new Di(.06,7),Y(t[0],.6,{side:2}),.3+n()*.15,.02,.15+n()*.1,-Math.PI/2+n()*.4,0,n()*3))},bar(e,t){e.add(X(new Ti(.56,.06,.2),Y(t[1],.3,{metalness:.2}),-.08,.03,0));for(let n=0;n<4;n++)e.add(X(new Ti(.1,.07,.18),Y(t[0],.45),.08+n*.105,.04,0))},discs(e,t){for(let n=0;n<4;n++)e.add(X(new W(.22,.22,.05,32),Y(t[0],.8),0,.025+n*.07,0,0,n*.3,0)),n<3&&e.add(X(new W(.2,.2,.02,32),Y(t[1],.5),0,.06+n*.07,0))},cake(e,t){let n=.9;for(let r=0;r<3;r++)e.add(X(new W(.45,.45,.08,20,1,!1,0,n),Y(r%2?t[1]:t[0],r%2?.5:.85),-.2,.04+r*.085,0,0,-.9/2+Math.PI/2,0));e.add(X(new W(.45,.45,.03,20,1,!1,0,n),Y(`#fff8ee`,.5),-.2,.27,0,0,-.9/2+Math.PI/2,0)),e.add(X(new G(.05,12,8),$u(`#c1121f`),.1,.32,0))},muffin(e,t){e.add(X(new W(.2,.15,.2,18),Y(`#f1e3c8`,.9),0,.1,0)),e.add(X(new G(.23,28,16,0,Math.PI*2,0,Math.PI/2),Y(t[0],.8),0,.19,0,0,0,0,1,.75,1)),e.add(X(new G(.17,24,12,0,Math.PI*2,0,Math.PI/2),$u(t[1]),0,.3,0,0,0,0,1,.5,1))},cone(e,t){e.add(X(new Oi(.14,.45,20),Y(t[1],.8),0,.26,0,Math.PI,0,0)),e.add(X(new G(.17,24,16),Y(t[0],.6),0,.55,0)),e.add(X(new G(.14,24,16),Y(`#ffffff`,.55),.02,.72,0))},popsicle(e,t){e.add(X(new Ei(.12,.3,6,16),$u(t[0]),0,.36,0,0,0,0,1,1,.55)),e.add(X(new Ti(.05,.25,.015),Y(t[1],.8),0,.1,0))},candy(e,t,n){for(let t=0;t<9;t++){let r=n()*Math.PI*2,i=n()*.2,a=id[t%id.length],o=Math.cos(r)*i,s=Math.sin(r)*i,c=.06+(t>5?.09:0);e.add(X(new G(.06,14,10),$u(a),o,c,s,0,n()*3,0,1.4,1,1)),e.add(X(new Oi(.04,.06,8),$u(a),o+.1,c,s,0,0,Math.PI/2)),e.add(X(new Oi(.04,.06,8),$u(a),o-.1,c,s,0,0,-Math.PI/2))}},nuts(e,t,n){e.add(X(ad(.3,.14),ed()));for(let r=0;r<22;r++){let i=n()*Math.PI*2,a=n()*.19;e.add(X(new G(.045,10,8),Y(r%3?t[0]:t[1],.7),Math.cos(i)*a,.12+n()*.07,Math.sin(i)*a,n(),n(),n(),1.5,.9,1))}},egg(e,t,n,r){if(r.id===`deviled_eggs`){for(let n of[-.14,.14])e.add(X(new G(.13,20,12,0,Math.PI*2,Math.PI/2,Math.PI/2),Y(t[0],.4),n,.13,0,0,0,0,1.3,1,1)),e.add(X(new G(.07,14,10),Y(t[1],.7),n,.13,0,0,0,0,1,.5,1));return}e.add(X(new G(.17,28,20),$u(t[0]),0,.22,0,0,0,0,1,1.3,1)),r.id===`pisanka_egg`&&e.add(X(new oa(.168,.02,8,32),$u(t[1]),0,.22,0,Math.PI/2))},fillet(e,t){e.add(X(new G(.3,28,16),Y(t[0],.55,{clearcoat:.3}),0,.07,0,0,0,0,1.3,.25,.7));for(let n=-2;n<=2;n++)e.add(X(new Ti(.02,.01,.3),Y(t[1],.6),n*.1,.14,0,0,.3,0));e.add(X(new G(.035,10,8),Y(`#3a7d2c`,.6),.25,.14,.08,0,0,0,1.6,.3,1))},skewer(e,t){e.add(X(new W(.01,.01,.75,6),Y(`#c9a66b`,.8),0,.12,0,0,0,Math.PI/2));for(let n=0;n<5;n++)e.add(X(new Ti(.1,.1,.1),Y(n%2?t[1]:t[0],.75),-.24+n*.12,.12,0,.3*n,.5,.2*n))},fried(e,t,n){for(let r=0;r<7;r++){let i=r/7*Math.PI*2,a=r===6?0:.16;e.add(X(new Ai(.1,1),Y(t[0],.9),Math.cos(i)*a,.08+(r===6?.08:0),Math.sin(i)*a,n(),n(),n(),1.3,.8,1))}e.add(X(new W(.08,.07,.07,16),ed(),.3,.035,.2)),e.add(X(new W(.07,.07,.01,16),$u(`#c1121f`),.3,.07,.2))},bread(e,t,n,r){if(e.add(X(new Ti(.42,.06,.36),Y(t[1]??`#f3e2c0`,.95),0,.03,0)),e.add(X(new Ti(.44,.065,.02),Y(t[0],.9),0,.03,.19)),e.add(X(new Ti(.44,.065,.02),Y(t[0],.9),0,.03,-.19)),r.id===`bruschetta`)for(let t=0;t<8;t++)e.add(X(new Ti(.06,.04,.06),$u(`#d62828`),(n()-.5)*.3,.08,(n()-.5)*.25))},sushi(e,t){for(let n of[-.14,.14])e.add(X(new Ei(.08,.14,4,12),Y(t[0],.9),n,.08,0,0,0,Math.PI/2,1,1,1.1)),e.add(X(new Ti(.28,.035,.17),$u(t[1]),n,.17,0))},avocado(e,t){e.add(X(new G(.25,28,18,0,Math.PI*2,Math.PI/2,Math.PI/2),Y(t[0],.6),0,.2,0,0,0,0,.85,.8,1.15)),e.add(X(new Di(.24,28),Y(t[1],.5),0,.201,0,-Math.PI/2,0,0,.85,1.15,1)),e.add(X(new G(.09,20,14),$u(`#6b3e26`),0,.2,.03))},tuber(e,t){e.add(X(new G(.2,28,18),Y(t[0],.55),0,.16,0,0,0,.2,1.6,.8,.85)),e.add(X(new W(.03,.04,.08,8),Y(t[1],.7),.33,.2,0,0,0,-1.2))},pineapple(e,t){e.add(X(new G(.2,24,18),Y(t[0],.9),0,.28,0,0,0,0,1,1.4,1));for(let n=0;n<8;n++)e.add(X(new Oi(.03,.28,6),Y(t[1],.6),Math.cos(n)*.04,.66,Math.sin(n)*.04,Math.sin(n)*.4,0,Math.cos(n)*.4))},melonslice(e,t){e.add(X(new W(.4,.4,.12,32,1,!1,0,Math.PI),Y(t[0],.5),0,.2,0,Math.PI/2,0,0)),e.add(X(new oa(.4,.04,8,32,Math.PI),Y(t[1],.5),0,.2,0,0,0,Math.PI));for(let t=0;t<6;t++)e.add(X(new G(.02,8,6),Y(`#111`,.3),-.2+t*.08,.32+Math.sin(t)*.03,.062,0,0,0,1,1.6,.6))},shells(e,t,n){for(let r=0;r<7;r++){let i=r/7*Math.PI*2;e.add(X(new G(.1,16,10,0,Math.PI*2,0,Math.PI/2),$u(t[0]),Math.cos(i)*.17,.06+n()*.04,Math.sin(i)*.17,Math.PI,i,0,1.4,.5,.9)),e.add(X(new G(.06,10,8),Y(t[1],.5),Math.cos(i)*.17,.07,Math.sin(i)*.17,0,0,0,1.3,.5,.8))}},mound(e,t,n){e.add(X(new G(.3,28,14,0,Math.PI*2,0,Math.PI/2),Y(t[0],.8),0,0,0,0,0,0,1,.55,1));for(let r=0;r<6;r++)e.add(X(new G(.03,8,6),Y(t[1],.6),(n()-.5)*.35,.12+n()*.04,(n()-.5)*.35))},leaves(e,t,n){e.add(X(ad(.38,.18),ed()));for(let r=0;r<12;r++){let i=n()*Math.PI*2,a=n()*.2;e.add(X(new G(.1,12,8),Y(r%4==3?t[1]:t[0],.6),Math.cos(i)*a,.18+n()*.08,Math.sin(i)*a,n()*2,n()*2,n()*2,1.3,.2,.8))}}},sd=.78,cd=.95;function ld(e){let t=_u(e),n=new An;(od[t.shape]??od.mound)(n,t.colors,rd(e.id),e);let r=new er().setFromObject(n),i=r.getSize(new V),a=Math.min(sd/Math.max(i.x,i.z,.01),cd/Math.max(i.y,.01),1.6),o=new An,s=r.getCenter(new V);return n.position.set(-s.x,-r.min.y,-s.z),o.add(n),o.scale.setScalar(a),o.userData.foodId=e.id,o.userData.crumbColor=t.colors[0],o.userData.height=i.y*a,o}function ud(e){e.traverse(e=>{e.isMesh&&e.geometry.dispose()})}var dd=2e3,fd={A:1.5,B:1.2,C:1,D:.5,E:.25},pd=.1,md=.5,hd=[`red`,`orange`,`yellow`,`green`,`purple`,`white`],gd=1e3;function _d(){return{kcal:0,kcalHealthy:0,kcalJunk:0,score:0,bites:0,combo:0,bestCombo:0,habit:`neutral`,consecHealthy:0,consecJunk:0,eaten:{},colors:[],rainbow:!1,resets:0,water:0,log:[],ended:!1,perfectDay:!1,outcome:null}}var vd={A:0,B:1,C:2,D:3,E:4};function yd(e,t){return au(e)?t===`junk`?`yum_reluctant`:`yum`:ou(e)?t===`healthy`?`bleah_mega`:t===`junk`?`greedy`:`bleah`:`meh`}function bd(e,t){return t===`junk`?au(e):ou(e)}function xd(e,t,n,r){if(e.ended)throw Error(`Run already ended`);let i=e.habit,a=t.grade,o=au(a),s=ou(a),c=fd[a],l=o?Math.min(2,1+pd*e.combo):1,u=e.eaten[t.id]??0,d=u+1>=3,f=d?.5:1,p=s&&i!==`neutral`?md:1,m=0;if(n&&!r.timeout){let e=vd[n.grade]-vd[a];e>0&&(m=25*e)}let h=Math.round(100*c*l*f*p)+m;o?e.combo+=1:s&&(e.combo=0),e.bestCombo=Math.max(e.bestCombo,e.combo);let g=0,_=0;o&&r.colorGroup&&!e.colors.includes(r.colorGroup)&&(e.colors.push(r.colorGroup),g=50,!e.rainbow&&hd.every(t=>e.colors.includes(t))&&(e.rainbow=!0,_=500));let v=0;o?(e.consecHealthy+=1,e.consecJunk=0,e.consecHealthy>=3&&e.habit!==`healthy`&&(e.habit===`junk`&&(v=300,e.resets+=1),e.habit=`healthy`)):s&&(e.consecJunk+=1,e.consecHealthy=0,e.consecJunk>=3&&(e.habit=`junk`)),h+=g+_+v,e.kcal+=t.kcal,o&&(e.kcalHealthy+=t.kcal),s&&(e.kcalJunk+=t.kcal),e.eaten[t.id]=u+1,e.bites+=1;let y=yd(a,i),b=0;return e.kcal>=2e3?e.ended=!0:r.round>=40&&(e.ended=!0,e.perfectDay=!0,b=gd,h+=b),e.score+=h,e.log.push({id:t.id,grade:a,kcal:t.kcal,points:h,reaction:y,timeout:!!r.timeout}),e.ended&&(e.outcome=Cd(e)),{points:h,gradeMult:c,comboMult:l,repeatMult:f,habitMult:p,choiceBonus:m,colorBonus:g,rainbowBonus:_,resetBonus:v,perfectDayBonus:b,reaction:y,habitBefore:i,habitAfter:e.habit,bored:d,ended:e.ended}}function Sd(e){return e.water+=1,e.score+=25,25}function Cd(e){return e.kcal<=0||e.kcalHealthy/e.kcal>=.5?`victory`:`defeat`}function wd(e){e.ended||(e.ended=!0,e.outcome=Cd(e))}var Td={breakfast:0,lunch:8,snack:7,dinner:6},Ed={breakfast:1,lunch:2,snack:2,dinner:3};function Dd(e){return e<=5?`breakfast`:e<=15?`lunch`:e<=22?`snack`:`dinner`}function Od(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function kd(e){let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619);return t>>>0}function Ad(e=new Date){let t=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`,n=Date.UTC(2026,9,1),r=Math.max(1,Math.floor((Date.UTC(e.getFullYear(),e.getMonth(),e.getDate())-n)/864e5)+1);return{seed:kd(`pikko-daily-${t}`),label:t,number:r}}function jd(e){let t=uu.foods,n=e&&e!==`base`?pu(e).foods:[];return{bagHealthy:n.filter(e=>au(e.grade)),bagJunk:n.filter(e=>ou(e.grade)),baseHealthy:t.filter(e=>au(e.grade)),baseJunk:t.filter(e=>ou(e.grade)),baseNeutral:t.filter(e=>e.grade===`C`),bagShare:n.length?.7:0}}var Md=(e,t)=>t[Math.floor(e()*t.length)%t.length];function Nd(e,t,n,r,i){let a=e()<t.bagShare,o=n===`healthy`?a?[t.bagHealthy,t.baseHealthy]:[t.baseHealthy,t.bagHealthy]:a?[t.bagJunk,t.baseJunk]:[t.baseJunk,t.bagJunk];for(let t of[!0,!1])for(let n of o){let a=n.filter(e=>!r.has(e.id)&&(!t||!i||i(e)));if(a.length)return Md(e,a)}return Md(e,o[0].length?o[0]:o[1])}function Pd(e,t,n,r,i){let a=Dd(t),o=new Set(i),s=e(),c,l,u=t=>{let n=Nd(e,r,`healthy`,o,t);return o.add(n.id),n},d=t=>{let n=Nd(e,r,`junk`,o,t);return o.add(n.id),n};switch(a){case`breakfast`:c=u(e=>e.grade===`A`),l=d(e=>e.grade===`E`);break;case`lunch`:c=u(),l=d();break;case`snack`:s<.5?(c=u(),l=d(e=>e.kcal<=c.kcal*1.6+60)):s<.7&&r.baseNeutral.length&&!o.has(r.baseNeutral[0].id)?(c=u(),l=r.baseNeutral[0],o.add(l.id)):(c=u(),l=d());break;default:s<.4?(c=u(),l=u(e=>Math.abs(e.kcal-c.kcal)>40)):s<.7&&n!==`junk`?(c=d(),l=d()):(c=u(),l=d())}return c.id===l.id&&(l=d()),e()<.5?[c,l]:[l,c]}var Fd={breakfast:`M11_breakfast_loop`,lunch:`M12_lunch_loop`,snack:`M13_snack_loop`,dinner:`M14_dinner_loop`},Id=1.15,Ld=class{stage;pikko;ev;run=_d();cfg={mode:`classic`,bagId:`base`,trial:!1};round=0;phase=`breakfast`;slots=[];water=null;timerLeft=0;timerMax=0;active=!1;paused=!1;selected=-1;dailyNumber=0;maxRounds=40;rng=Math.random;pool=jd(null);recent=new Set;busy=!1;queue=[];clock=0;drag=null;raycaster=new To;ndc=new B;dragPlane=new Lr;brain={mode:`idle`,dodges:0,max:1,targetX:0,cooldown:0,sighed:!1};crumbs=[];lastTick=0;touch=!1;pikkoBlob;constructor(e,t,n){this.stage=e,this.pikko=t,this.ev=n,e.scene.add(t.root),this.pikkoBlob=e.addBlob(new V(0,.005,.05),1.9);let r=e.renderer.domElement;r.addEventListener(`pointerdown`,e=>this.onDown(e)),r.addEventListener(`pointermove`,e=>this.onMove(e)),r.addEventListener(`pointerup`,e=>this.onUp(e)),r.addEventListener(`pointercancel`,e=>this.onUp(e))}start(e){this.cleanup(),this.cfg=e,this.run=_d(),this.round=0,this.recent.clear(),this.queue=[],this.busy=!1,this.paused=!1,this.active=!0;let t=Ad();this.dailyNumber=t.number;let r=e.mode===`daily`?t.seed:e.seed??Math.random()*2**32>>>0;if(this.cfg.seed=r,this.rng=Od(r),this.pool=jd(e.bagId),this.maxRounds=e.script?e.script.length:e.trial?5:e.mode===`daily`?20:40,this.pikko.reset(),this.pikko.setAccessory(e.bagId),this.pikko.doHop(1.2),n.setHabit(`neutral`),Zl(),n.play(`fridge_open`,.8),this.later(.5,()=>void n.play(`fridge_click`,.9)),this.later(.6,()=>void n.play(`vox_hop`,.9)),this.later(.9,()=>void n.play(`land`,.7)),this.later(1.1,()=>this.nextRound()),n.preload([`M11_breakfast_loop`,`M12_lunch_loop`,`crunch_1`,`crunch_2`,`chew`,`gulp`,`plate_slide`,`plate_lift`,`plate_drop`,`dodge_s`,`dodge_m`,`squeak`,`yum_${Nu()}_1`,`bleah_${Nu()}_1`]),n.playMusic(Fd.breakfast),this.ev.hud(),e.bagId!==`base`){let t=pu(e.bagId);this.ev.toast(J(`country_start`,{country:Ru(t)}),`big`),this.later(.3,()=>this.ev.fact(`🌍 ${Bu(t)}`,null))}}advance(){this.nextRound()}quit(){this.active=!1,this.cfg.script&&(this.cfg={...this.cfg,script:void 0}),this.cleanup()}cleanup(){for(let e of[...this.slots,...this.water?[this.water]:[]])this.stage.scene.remove(e.obj),ud(e.obj);this.slots=[],this.water=null,this.drag=null;for(let e of this.crumbs)this.stage.scene.remove(e.mesh);this.crumbs=[]}later(e,t){this.queue.push({at:this.clock+e,fn:t})}nextRound(){if(!this.active)return;if(this.round>=this.maxRounds&&!this.run.ended){if(this.cfg.script)return;wd(this.run),this.endDay();return}this.round+=1;let e=Dd(this.round);(e!==this.phase||this.round===1)&&(this.phase=e,n.playMusic(Fd[e]),this.round>1&&this.ev.toast(J(`phase_`+e),`big`),n.preload([Fd[Dd(Math.min(40,this.round+6))]]));let t=this.cfg.script?this.cfg.script[this.round-1].map(e=>fu.get(e)):Pd(this.rng,this.round,this.run.habit,this.pool,this.recent);this.recent=new Set(t.map(e=>e.id));for(let e of this.slots)this.stage.scene.remove(e.obj),ud(e.obj);this.slots=t.map((e,t)=>this.spawn(e,this.stage.plateAnchors[t],t===0?-1:1)),this.round%8==0&&!this.water&&(this.water=this.spawn(lu,this.stage.waterAnchor,0,!0)),n.play(`plate_slide`,.6);let r=this.cfg.mode===`zen`;this.timerMax=r?0:Td[e],this.timerLeft=this.timerMax,this.brain={mode:`idle`,dodges:0,max:r?1:Ed[e],targetX:0,cooldown:0,sighed:!1},this.selected=-1,this.busy=!1,this.ev.hud()}spawn(e,t,n,r=!1){let i=ld(e),a=new V(t.x+n*4,t.y+.1,t.z-1.5);return i.position.copy(a),this.stage.scene.add(i),{food:e,obj:i,home:new V(t.x,.06,t.z),pos:a.clone(),state:`in`,t:0,from:a,water:r}}pointerRay(e){let t=this.stage.renderer.domElement.getBoundingClientRect();this.ndc.set((e.clientX-t.left)/t.width*2-1,-((e.clientY-t.top)/t.height)*2+1),this.raycaster.setFromCamera(this.ndc,this.stage.camera)}pickable(){return[...this.slots,...this.water?[this.water]:[]].filter(e=>e.state===`idle`||e.state===`return`)}onDown(e){if(this.touch=e.pointerType===`touch`,!this.active||this.paused||this.busy||this.drag)return;n.unlock(),this.pointerRay(e);let t=null,r=1/0;for(let e of this.pickable()){let n=this.raycaster.intersectObject(e.obj,!0);n.length&&n[0].distance<r&&(t=e,r=n[0].distance)}if(!t)for(let e of this.pickable()){let n=e.home.clone().project(this.stage.camera),i=Math.hypot(n.x-this.ndc.x,(n.y-this.ndc.y)*(this.stage.camera.aspect>1?1:1.4));i<.22&&i<r&&(t=e,r=i)}if(!t)return;this.drag={slot:t,pointerId:e.pointerId},t.state=`drag`;try{this.stage.renderer.domElement.setPointerCapture(e.pointerId)}catch{}let i=this.pikko.mouthWorld();this.dragPlane.setFromNormalAndCoplanarPoint(new V(0,.35,1).normalize(),new V(0,i.y-.25,.9)),n.play(`plate_lift`,.6),this.onMove(e)}onMove(e){if(!this.drag||e.pointerId!==this.drag.pointerId)return;this.pointerRay(e);let t=new V;this.raycaster.ray.intersectPlane(this.dragPlane,t)&&(t.y=Math.max(.15,t.y-.15),this.drag.slot.from.copy(t))}onUp(e){if(!this.drag||e.pointerId!==this.drag.pointerId)return;let t=this.drag.slot;this.drag=null,this.inMouth(t.pos)?this.feed(t,!1):(t.state=`return`,t.t=0,t.from.copy(t.pos),n.play(`plate_drop`,.5))}key(e){if(!(!this.active||this.paused||this.busy)){if(e===`1`||e===`ArrowLeft`)this.selected=0;else if(e===`2`||e===`ArrowRight`)this.selected=1;else if(e===`Enter`||e===` `){let e=this.slots[this.selected>=0?this.selected:0];if(!e||e.state!==`idle`)return;e.state=`key`,e.t=0,e.from.copy(e.pos)}this.ev.hud()}}inMouth(e){let t=this.pikko.mouthWorld(),n=this.touch?.62:.45;return e.distanceTo(t)<n}feed(e,t){if(this.busy&&!t)return;if(this.busy=!0,this.timerMax=0,e.state=`fly`,e.t=0,e.from.copy(e.pos),this.pikko.setTarget({mouthOpen:1,lean:.6}),e.water){this.later(.22,()=>this.drinkWater(e));return}let n=this.slots.find(t=>t!==e)??null;this.later(.22,()=>this.bite(e,n?.food??null,t)),n&&n.state!==`fly`&&(n.state=`out`,n.t=0,n.from.copy(n.pos))}drinkWater(e){e.state=`eaten`,Sd(this.run),n.play(`gulp`,.9),n.play(`vox_content`,.8),this.ev.toast(J(`water`),`good`),this.ev.fact(Vu(lu),!0),this.pikko.setTarget({mouthOpen:0,smile:1,squint:.6}),this.pikko.splash(.5),this.stage.scene.remove(e.obj),ud(e.obj),this.water=null,this.busy=!1,this.later(.6,()=>this.baseline()),this.ev.hud()}bite(e,t,n){e.state=`eaten`;let r=e.food,i=!this.run.eaten[r.id],a=xd(this.run,r,t,{timeout:n,colorGroup:_u(r).group,round:this.round});i&&this.ev.discovered(r),this.crumbsAt(this.pikko.mouthWorld(),e.obj.userData.crumbColor),this.stage.scene.remove(e.obj),ud(e.obj),this.pikko.levelTarget=Math.min(1,this.run.kcal/2e3);let o=this.run.kcal?this.run.kcalHealthy/this.run.kcal:1;this.pikko.liquidTarget.set(`#6e4322`).lerp(new U(`#b9d86a`),o),this.pikko.splash(1),ou(r.grade)&&this.pikko.stain(e.obj.userData.crumbColor),this.react(a.reaction,r,a),this.feedback(a,r),this.cfg.script||this.ev.fact(Vu(r),au(r.grade)?!0:!ou(r.grade)&&null),this.ev.hud();let s=a.reaction===`bleah_mega`?2.3:a.reaction===`bleah`?1.9:1.5;this.cfg.script?(this.later(Math.min(s,.8),()=>this.ev.scriptBite?.(a,r,this.round)),this.later(s,()=>this.ev.scriptReady?.())):a.ended?this.later(s,()=>this.endDay()):this.later(s,()=>this.nextRound())}feedback(e,t){e.choiceBonus&&this.ev.toast(J(`choice`,{n:e.choiceBonus}),`good`),this.run.combo>=2&&au(t.grade)&&(this.ev.toast(J(`combo`,{n:Math.min(2,1+this.run.combo*.1).toFixed(1)}),`good`),n.combo(Math.min(5,this.run.combo-1))),e.colorBonus&&this.ev.toast(J(`color_new`),`good`),e.rainbowBonus&&(this.ev.toast(J(`rainbow`),`big`),n.rainbow(),this.pikko.setTarget({bloom:1})),e.bored&&this.ev.toast(J(`bored`,{food:Lu(t)}),`bad`),e.habitAfter!==e.habitBefore&&(n.setHabit(e.habitAfter),e.habitAfter===`junk`&&(this.ev.toast(J(`habit_junk`),`bad`),n.habitJunk(),this.later(.9,()=>void n.play(`vox_yawn`,.8)),this.ev.fact(J(`habit_fact`),null)),e.habitAfter===`healthy`&&(e.resetBonus?(this.ev.toast(J(`palate_reset`),`big`),n.palateReset(),this.later(.5,()=>void n.play(`vox_proud`,.9)),this.ev.fact(J(`habit_fact`),!0)):this.ev.toast(J(`habit_healthy`),`good`))),e.perfectDayBonus&&(this.ev.toast(J(`perfect_day`),`big`),n.fanfare())}react(e,t,r){let i=this.pikko,a=Nu(),o=(e,t=.15,n=.35)=>{for(let r=0;r<e;r++)this.later(r*t,()=>i.setTarget({mouthOpen:r%2?n:.02}))};switch(i.setTarget({lean:0}),e){case`yum`:{let e=t.cat===`fruit`?[`juice_1`,`juice_2`]:[`crunch_1`,`crunch_2`];n.playOneOf(t.cat===`veg`||t.cat===`fruit`||t.cat===`nuts`?e:[`chew`]),o(6),i.setTarget({smile:1,squint:.7,puff:.3,droop:-.25,brow:.4}),this.later(.15,()=>void n.voice(`yum`,a)),this.later(.95,()=>{i.setTarget({mouthOpen:0,puff:0}),n.play(`gulp`,.6),i.splash(.6)}),(t.cat===`protein`||this.run.combo>=3)&&(this.later(1,()=>i.setTarget({armR:-2.4})),this.later(1.45,()=>i.setTarget({armR:-.35}))),this.run.combo>=5&&i.setTarget({bloom:1}),this.later(1.05,()=>i.doHop(.7));break}case`yum_reluctant`:i.setTarget({smile:-.6,lids:.45,turn:.35,droop:.6,brow:.9}),n.play(`vox_lazy_sigh`,.8),o(5,.24,.25),this.later(1.2,()=>{i.setTarget({smile:.4,turn:0,lids:.1,brow:.3}),n.play(`vox_content`,.8)});break;case`bleah`:case`bleah_mega`:{let r=e===`bleah_mega`;if(Ql(this.stage.renderer.domElement,r),i.setTarget({puff:.9,mouthOpen:0,smile:-.4,lids:.3,brow:-.6}),n.play(`chew`,.6),t.cat===`fizzy`&&n.play(`fizz_can`,.7),this.later(.35,()=>{i.setTarget({puff:0,tongue:1,cross:.9,tint:1,smile:-1,shake:r?1.4:1,droop:1,mouthOpen:.45,armL:r?2.6:1.2,armR:r?-2.6:-1.2,brow:-1,squint:.5}),n.voice(`bleah`,a,r),n.play(`squeak`,.4),r&&this.stage.shake(1.2)}),t.cat===`sugar`&&this.later(.5,()=>n.sugarRush()),t.cat===`fizzy`)for(let e=0;e<3;e++)this.later(1+e*.3,()=>{i.doHop(.35),n.play(`vox_hiccup`,.5)});this.later(r?1.6:1.3,()=>i.setTarget({tongue:0,cross:0,shake:0,tint:.25,mouthOpen:0,armL:.35,armR:-.35,brow:-.3,squint:0}));break}case`greedy`:i.setTarget({mouthOpen:1,smile:.7,lids:.2,droop:.9,brow:.1}),o(8,.11,.5),n.play(`chew`,.8),this.later(1,()=>{n.play(`gulp`,.7),i.setTarget({mouthOpen:0,lids:.5,smile:0})}),this.later(1.2,()=>void n.play(`vox_lazy_sigh`,.7)),t.cat===`sugar`&&this.later(.3,()=>n.sugarRush());break;default:o(4),n.play(`vox_curious`,.7),i.setTarget({smile:.2})}this.later(e===`bleah_mega`?2.2:1.7,()=>this.baseline())}baseline(){let e=this.run.habit;this.pikko.setTarget({mouthOpen:0,tongue:0,puff:0,cross:0,shake:0,turn:0,lean:0,squint:e===`healthy`?.25:0,tint:0,lids:e===`junk`?.35:0,smile:e===`junk`?0:.7,droop:e===`junk`?.85:e===`healthy`?-.2:0,armL:.35,armR:-.35,bloom:e===`healthy`||this.run.rainbow?.8:0,brow:e===`junk`?.6:.2})}crumbsAt(e,t){let n=new va({color:t,roughness:.8});for(let t=0;t<10;t++){let t=new ri(new G(.025+Math.random()*.02,6,4),n);t.position.copy(e),this.stage.scene.add(t),this.crumbs.push({mesh:t,v:new V((Math.random()-.5)*2.5,1+Math.random()*1.5,.6+Math.random()),life:1.2})}}endDay(){if(!this.active)return;this.active=!1,this.busy=!0;for(let e of this.slots)e.state=`out`,e.t=0,e.from.copy(e.pos);this.water&&(this.water.state=`out`,this.water.t=0,this.water.from.copy(this.water.pos)),n.stopMusic(.8);let e=this.pikko;this.run.outcome===`victory`?(e.setTarget({armL:1.4,armR:-1.4,smile:1,squint:.8,bloom:1,droop:-.3,puff:.6,brow:.5}),this.later(.5,()=>{n.play(`end_victory`,1),e.setTarget({mouthOpen:.8,puff:0}),this.stage.shake(.5)}),this.later(1.6,()=>{e.setTarget({mouthOpen:0,armR:-2.4}),e.doHop(1),n.fanfare()})):(e.setTarget({armL:1.5,armR:-1.5,lean:.5,tint:.7,lids:.55,smile:-1,droop:1,brow:1}),this.later(.4,()=>void n.play(`end_defeat_${Nu()}`,1)),this.later(.6,()=>e.setTarget({shake:.5})),this.later(2.2,()=>e.setTarget({shake:0}))),this.later(3.2,()=>{this.busy=!1,this.ev.ended(this.run,this.cfg)})}update(e){if(this.paused)return;this.clock+=e;let t=this.queue.filter(e=>e.at<=this.clock);this.queue=this.queue.filter(e=>e.at>this.clock);for(let e of t)e.fn();if(this.active&&!this.busy&&this.timerMax>0&&this.slots.every(e=>e.state!==`in`)){this.timerLeft-=e;let t=n.beatPeriod();if(this.timerLeft<3&&this.clock-this.lastTick>=t&&(this.lastTick=this.clock,n.tick(this.timerLeft<1)),this.timerLeft<=0){this.timerLeft=0;let e=this.slots.filter(e=>e.state===`idle`||e.state===`return`||e.state===`drag`);if(this.drag&&=null,e.length){this.ev.toast(J(`time_up`),`bad`);let t=e[Math.floor(this.rng()*e.length)];this.feed(t,!0)}}}this.updateSlots(e),this.updateBrain(e);for(let t of this.crumbs)t.life-=e,t.v.y-=6*e,t.mesh.position.addScaledVector(t.v,e),t.mesh.position.y<.02&&(t.mesh.position.y=.02,t.v.multiplyScalar(.3));this.crumbs=this.crumbs.filter(e=>e.life>0||(this.stage.scene.remove(e.mesh),e.mesh.geometry.dispose(),!1))}updateSlots(e){let t=this.pikko.mouthWorld();for(let n of[...this.slots,...this.water?[this.water]:[]]){switch(n.t+=e,n.state){case`in`:{let e=Math.min(1,n.t/.55),t=1-(1-e)**3;n.pos.lerpVectors(n.from,n.home,t),n.pos.y+=Math.sin(e*Math.PI)*.3,e>=1&&(n.state=`idle`);break}case`idle`:n.pos.lerp(n.home,1-Math.exp(-10*e)),n.obj.rotation.y+=e*.25;break;case`drag`:n.pos.lerp(n.from,1-Math.exp(-18*e));break;case`return`:{let e=Math.min(1,n.t/.35);n.pos.lerpVectors(n.from,n.home,1-(1-e)**2),n.pos.y+=Math.sin(e*Math.PI)*.25,e>=1&&(n.state=`idle`);break}case`key`:{let e=Math.min(1,n.t/.6);n.pos.lerpVectors(n.from,t,e*.92),bd(n.food.grade,this.run.habit)&&this.brain.mode!==`resigned`&&this.brain.dodges<this.brain.max&&e>.5?(this.dodge(n.pos),n.state=`return`,n.t=0,n.from.copy(n.pos)):e>=1&&this.feed(n,!1);break}case`fly`:{let e=Math.min(1,n.t/.22);n.pos.lerpVectors(n.from,t,e),n.obj.scale.setScalar(Math.max(.15,1-e*.7)*(n.obj.userData.baseScale??=n.obj.scale.x));break}case`out`:{let e=Math.min(1,n.t/.5);n.pos.set(n.from.x+Math.sign(n.from.x||1)*e*4,n.from.y,n.from.z-e*1.5),e>=1&&(n.obj.visible=!1);break}}n.obj.position.copy(n.pos)}}dodge(e){let t=this.brain;t.dodges+=1,t.cooldown=this.cfg.mode===`zen`?1:.6;let r=this.pikko.root.position.x,i=r-e.x>=0?1:-1;Math.abs(r+i*.9)>Id&&(i=-i),t.targetX=jt.clamp(r+i*.9,-1.15,Id),this.pikko.setTarget({lean:-.6,mouthOpen:0,smile:-.5,armL:2.2,armR:-2.2,squint:.5,turn:-i*.4,brow:-.8}),n.playOneOf([`dodge_s`,`dodge_m`]),n.play(`squeak`,.4),t.dodges>=t.max&&this.later(.6,()=>{t.mode=`resigned`})}updateBrain(e){let t=this.brain;t.cooldown=Math.max(0,t.cooldown-e);let r=this.pikko.root;if(r.position.x+=(t.targetX-r.position.x)*(1-Math.exp(-7*e)),this.pikkoBlob.position.x=r.position.x,!this.active||this.busy)return;let i=this.drag?.slot;if(!i){t.mode!==`idle`&&(t.mode=`idle`,this.baseline()),this.busy||(t.targetX*=1-Math.min(1,e*.6));return}let a=this.pikko.mouthWorld(),o=i.pos.distanceTo(a),s=!i.water&&bd(i.food.grade,this.run.habit);if(s&&t.mode!==`resigned`&&t.dodges<t.max)o<1.7&&(t.mode!==`suspicious`&&(t.mode=`suspicious`,n.play(`vox_nervous`,.5)),this.pikko.setTarget({lean:-.5,squint:.6,smile:-.6,mouthOpen:0,turn:(i.pos.x-r.position.x)*-.3,brow:-.7})),o<.95&&t.cooldown<=0&&this.dodge(i.pos);else if(s)t.sighed||(t.sighed=!0,n.play(`vox_lazy_sigh`,.7)),this.pikko.setTarget({lean:.1,mouthOpen:o<1.2?.55:.2,smile:-.4,lids:.4,armL:.35,armR:-.35,turn:0,brow:.9});else{let n=jt.clamp(1.6-o,0,1);this.pikko.setTarget({lean:n*.7,mouthOpen:n,smile:.9,lids:0,squint:0,turn:(i.pos.x-r.position.x)*.25,armL:.35+n*.6,armR:-.35-n*.6,brow:.5}),t.targetX+=(i.pos.x-r.position.x)*e*.8,t.targetX=jt.clamp(t.targetX,-1.15,Id)}}setPaused(e){this.paused=e,e&&this.drag&&(this.drag.slot.state=`return`,this.drag.slot.t=0,this.drag.slot.from.copy(this.drag.slot.pos),this.drag=null)}labelData(){let e=this.stage.renderer.domElement.getBoundingClientRect();return this.slots.filter(e=>e.state===`idle`||e.state===`return`||e.state===`drag`).map((t,n)=>{let r=t.home.clone().add(new V(0,-.05,.62)).project(this.stage.camera);return{x:(r.x+1)/2*e.width,y:(1-r.y)/2*e.height,food:t.food,sel:this.selected===n}})}},Rd=function(e,t,n,r){if(n===`a`&&!r)throw TypeError(`Private accessor was defined without a getter`);if(typeof t==`function`?e!==t||!r:!t.has(e))throw TypeError(`Cannot read private member from an object whose class did not declare it`);return n===`m`?r:n===`a`?r.call(e):r?r.value:t.get(e)},zd=function(e,t,n,r,i){if(r===`m`)throw TypeError(`Private method is not writable`);if(r===`a`&&!i)throw TypeError(`Private accessor was defined without a setter`);if(typeof t==`function`?e!==t||!i:!t.has(e))throw TypeError(`Cannot write private member to an object whose class did not declare it`);return r===`a`?i.call(e,n):i?i.value=n:t.set(e,n),n},Bd,Vd=void 0,Hd=new Set;function Ud(e){Jd=void 0,Hd.add(e)}function Wd(e){Jd=void 0,Hd.delete(e)}var Gd={};function Kd(){if(Vd||(Vd=Object.freeze({register:qd,get:Yd,on:Xd}),typeof window>`u`))return Vd;let e=Object.freeze({register:qd});try{window.addEventListener(`wallet-standard:register-wallet`,({detail:t})=>t(e))}catch(e){console.error(`wallet-standard:register-wallet event listener could not be added
`,e)}try{window.dispatchEvent(new Qd(e))}catch(e){console.error(`wallet-standard:app-ready event could not be dispatched
`,e)}return Vd}function qd(...e){return e=e.filter(e=>!Hd.has(e)),e.length?(e.forEach(e=>Ud(e)),Gd.register?.forEach(t=>Zd(()=>t(...e))),function(){e.forEach(e=>Wd(e)),Gd.unregister?.forEach(t=>Zd(()=>t(...e)))}):()=>{}}var Jd;function Yd(){return Jd||=[...Hd],Jd}function Xd(e,t){return Gd[e]?.push(t)||(Gd[e]=[t]),function(){Gd[e]=Gd[e]?.filter(e=>t!==e)}}function Zd(e){try{e()}catch(e){console.error(e)}}var Qd=class extends Event{get detail(){return Rd(this,Bd,`f`)}get type(){return`wallet-standard:app-ready`}constructor(e){super(`wallet-standard:app-ready`,{bubbles:!1,cancelable:!1,composed:!1}),Bd.set(this,void 0),zd(this,Bd,e,`f`)}preventDefault(){throw Error(`preventDefault cannot be called`)}stopImmediatePropagation(){throw Error(`stopImmediatePropagation cannot be called`)}stopPropagation(){throw Error(`stopPropagation cannot be called`)}};Bd=new WeakMap;var $d=`123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`;function ef(e){let t=0n;for(let n of e){let e=$d.indexOf(n);if(e<0)throw Error(`invalid base58`);t=t*58n+BigInt(e)}let n=0;for(let t of e)if(t===`1`)n++;else break;let r=t===0n?``:t.toString(16),i=r.length%2?`0${r}`:r,a=new Uint8Array(n+i.length/2);for(let e=0;e<i.length;e+=2)a[n+e/2]=parseInt(i.slice(e,e+2),16);return a}function tf(e){let t=0n;for(let n of e)t=t<<8n|BigInt(n);let n=``;for(;t>0n;)n=$d[Number(t%58n)]+n,t/=58n;let r=0;for(let t of e)if(t===0)r++;else break;return`1`.repeat(r)+n}function nf(e){let t=ef(e);if(t.length!==32)throw Error(`expected 32 bytes`);return t}var rf=new Uint8Array(32);function af(e,t,n,r){if(e===t)throw Error(`same account`);if(n<=0n||n>=1n<<64n)throw Error(`bad amount`);let i=new Uint8Array(12),a=new DataView(i.buffer);a.setUint32(0,2,!0),a.setBigUint64(4,n,!0);let o=[Uint8Array.of(1),new Uint8Array(64),Uint8Array.of(1,0,1),Uint8Array.of(3),nf(e),nf(t),rf,nf(r),Uint8Array.of(1),Uint8Array.of(2),Uint8Array.of(2,0,1),Uint8Array.of(12),i],s=new Uint8Array(o.reduce((e,t)=>e+t.length,0)),c=0;for(let e of o)s.set(e,c),c+=e.length;return s}function of(e){return e.includes(`Solana Mobile Web Shell`)?!1:e.toLowerCase().includes(`wv`)||/WebView|Version\/[\d.]+.*Chrome\/\d/i.test(e)}var sf=e=>/Chrome\//.test(e)&&!/EdgA|OPR\/|SamsungBrowser|Firefox|DuckDuckGo|Vivaldi|YaBrowser|UCBrowser|MiuiBrowser/i.test(e);function cf(e){let t=e?.name===`SolanaMobileWalletAdapterError`?e.code:void 0;return t===`ERROR_WALLET_NOT_FOUND`||t===`ERROR_BROWSER_NOT_SUPPORTED`?Object.assign(Error(`wallet_not_found`),{cause:e}):t===`ERROR_LOOPBACK_ACCESS_BLOCKED`?Object.assign(Error(`wallet_blocked`),{cause:e}):e}var lf=`Seeker (Android)`,uf=e=>e===`Mobile Wallet Adapter`?lf:e,df=/^[1-9A-HJ-NP-Za-km-z]{32,44}$/,ff=e=>e.chains.some(e=>e.startsWith(`solana:`))&&`standard:connect`in e.features,pf=e=>typeof e==`string`&&/^data:image\/(svg\+xml|png|webp|jpeg|gif);/.test(e)?e:null;function mf(e){let t=e.find(e=>e.chains.some(e=>e.startsWith(`solana:`)))??e[0];return t&&df.test(t.address)?t.address:null}function hf(e){let t=new Set,n=null,r=null,i=null,a=!1,o=e=>{n=e,t.forEach(t=>t(e))},s=()=>{let t=new Set;return e.registry.get().filter(e=>ff(e)&&!t.has(e.name)&&!!t.add(e.name))};function c(){let t=s().map(e=>({id:`std:${e.name}`,name:e.name,label:uf(e.name),icon:pf(e.icon),kind:`standard`}));return e.legacy()?.isPhantom&&!t.some(e=>e.name===`Phantom`)&&t.push({id:`phantom`,name:`Phantom`,label:`Phantom`,icon:null,kind:`phantom`}),t}function l(t){let n=[e.registry.on(`register`,t),e.registry.on(`unregister`,t)];return()=>n.forEach(e=>e())}async function u(e){let t=e.features[`standard:connect`],n;try{n=await t.connect()}catch(e){throw cf(e)}let a=mf(n.accounts.length?n.accounts:e.accounts);if(!a)throw Error(`wallet_no_account`);return r?.(),r=e.features[`standard:events`]?.on(`change`,e=>{e.accounts&&o(e.accounts.length?mf(e.accounts):null)})??null,i={kind:`standard`,wallet:e},a}async function d(){let t=e.legacy();if(!t)throw Error(`wallet_missing`);a||(a=!0,t.on(`accountChanged`,e=>{i?.kind===`phantom`&&o(e?e.toString():null)}),t.on(`disconnect`,()=>{i?.kind===`phantom`&&o(null)}));let n=(await t.connect()).publicKey.toString();if(!df.test(n))throw Error(`wallet_no_account`);return i={kind:`phantom`},n}async function f(t){await e.ready?.();let n=c(),r=t?n.find(e=>e.id===t):n.length===1?n[0]:void 0;if(!r)throw Error(n.length?`wallet_choice`:`wallet_missing`);let i=r.kind===`standard`?await u(s().find(e=>`std:${e.name}`===r.id)):await d();return o(i),i}async function p(){let t=i;i=null,r?.(),r=null;try{t?.kind===`standard`?await t.wallet.features[`standard:disconnect`]?.disconnect():t?.kind===`phantom`&&await e.legacy()?.disconnect()}finally{o(null)}}let m=()=>n===null||!i?null:i.kind===`phantom`?`Phantom`:uf(i.wallet.name),h=()=>/Android|iPhone|iPad|iPod/i.test(e.userAgent()),g=()=>/Android/i.test(e.userAgent()),_=()=>of(e.userAgent()),v=()=>sf(e.userAgent())&&!_();function y(){let t=new URL(e.href());return`intent://${t.host}${t.pathname}${t.search}#Intent;scheme=${t.protocol.replace(`:`,``)};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(t.href)};end`}let b=()=>e.href();function x(){let t=new URL(e.href());return`https://phantom.app/ul/browse/${encodeURIComponent(t.href)}?ref=${encodeURIComponent(t.origin)}`}async function S(e){if(n===null||i?.kind!==`standard`)throw Error(`wallet_no_send`);let t=i.wallet.features[`solana:signAndSendTransaction`],r=i.wallet.accounts.find(e=>e.address===n);if(!t||!r)throw Error(`wallet_no_send`);let a=r.chains.find(e=>e===`solana:mainnet`)??`solana:mainnet`,[o]=await t.signAndSendTransaction({account:r,transaction:e,chain:a});if(!o?.signature||o.signature.length!==64)throw Error(`wallet_no_send`);return tf(o.signature)}return{options:c,onOptionsChange:l,connect:f,disconnect:p,connectedLabel:m,signAndSend:S,isMobile:h,isAndroid:g,inAppBrowser:_,usesChrome:v,openInChromeUrl:y,pageUrl:b,openInPhantomUrl:x,wallet:()=>n,onWalletChange(e){return t.add(e),()=>t.delete(e)}}}var gf=null,_f=null;function vf(){return gf??=(async()=>{if(typeof window<`u`&&window.isSecureContext&&/Android/i.test(navigator.userAgent))try{let e=await Tu(()=>import(`./index.browser-f8Xc2xDE.js`),[],import.meta.url),t=new URL(`./`,document.baseURI);e.registerMwa({appIdentity:{name:`PIKKO`,uri:t.href,icon:`icon-512.png`},authorizationCache:e.createDefaultAuthorizationCache(),chains:[`solana:mainnet`],chainSelector:e.createDefaultChainSelector(),onWalletNotFound:async()=>{}})}catch(e){console.warn(`Mobile Wallet Adapter unavailable`,e)}})(),gf}function yf(){return _f??=hf({registry:Kd(),legacy:()=>window.phantom?.solana??null,userAgent:()=>navigator.userAgent,href:()=>window.location.href,ready:()=>gf??Promise.resolve()}),_f}var bf=()=>yf().options(),xf=e=>yf().onOptionsChange(e),Sf=e=>yf().connect(e),Cf=()=>yf().disconnect(),wf=()=>yf().wallet(),Tf=()=>yf().connectedLabel(),Ef=e=>yf().signAndSend(e),Df=()=>yf().isMobile(),Of=()=>yf().inAppBrowser(),kf=()=>yf().openInChromeUrl(),Af=()=>yf().pageUrl(),jf=()=>yf().openInPhantomUrl(),Mf=`#ff6b35`,Nf={mouthOpen:0,smile:.6,lids:0,squint:0,tongue:0,puff:0,tint:0,droop:0,bloom:0,armL:.35,armR:-.35,lean:0,squash:1,shake:0,cross:0,turn:0,brow:.2},Pf={italy:[`#ffffff`,`#f1ece2`],france:[`#22223b`,`#22223b`],greece:[`#6b8e3a`,`#3b2a4a`],india:[`#ff9f1c`,`#ffbf69`],thailand:[`#ffffff`,`#f7d84a`],korea:[`#222222`,`#ff4d6d`],uk:[`#ffd60a`,`#f4a261`],vietnam:[`#e9c46a`,`#a0703c`],peru:[`#d91023`,`#ffffff`,`#f7d84a`,`#2a9d8f`],usa:[`#ffffff`,`#b22234`],indonesia:[`#7b3f00`,`#e0a526`],russia:[`#5c4632`,`#8a6d52`],ukraine:[`#d62828`,`#ffd23f`,`#f8f4e9`,`#4361ee`,`#ff8fa3`],philippines:[`#d9b26f`,`#8b5a2b`]},Ff={mexico:[`#ff006e`,`#ffbe0b`,`#3a86ff`,`#80ed99`,`#8338ec`],turkey:[`#ffffff`,`#e30a17`,`#ffffff`,`#e30a17`]};function If(e,t=.5,n={}){return new ya({color:e,roughness:t,...n})}function Lf(e,t,n=!0){let r=new ri(e,t);return r.castShadow=n,r.receiveShadow=n,r}var Rf=[[0,0],[.5,.01],[.64,.08],[.72,.26],[.74,.5],[.71,.78],[.66,1.02],[.6,1.26],[.52,1.48],[.4,1.66],[.23,1.78],[0,1.82]];function zf(e){for(let t=1;t<Rf.length;t++){let[n,r]=Rf[t-1],[i,a]=Rf[t];if(e<=a)return n+(i-n)*(e-r)/(a-r||1)}return 0}var Bf=class e{root=new An;body=new An;bodyMat;lidMats=[];mouth=new An;mouthInner;tongue;teeth;smileLine;lidsTop=[];lidsBottom=[];pupils=[];brows=[];cheeks=[];sprout=new An;sproutTip=new An;leafMat;flower=new An;arms=[];liquidMat;liquidPlane=new Lr(new V(0,-1,0),0);accessory=new An;bibMesh;gingham=Ku();bibMat;expr={...Nf};target={...Nf};level=0;levelTarget=0;liquidColor=new U(`#b9d86a`);liquidTarget=new U(`#b9d86a`);wobble=0;wobbleV=0;sproutV=0;sproutA=0;time=0;blinkAt=2;blinkT=-1;hop=0;hopV=0;reducedMotion=!1;static HEIGHT=1.82;static MOUTH_Y=1.07;static BELLY_Y=.46;static BELLY_R=.25;constructor(t){this.root.add(this.body),this.bodyMat=If(Mf,.48,{clearcoat:.22,clearcoatRoughness:.5,sheen:.35,sheenColor:new U(`#ffd0b0`),sheenRoughness:.6});let n=new Bi(Rf.map(([e,t])=>new V(e,t,0)),!1,`centripetal`).getPoints(80).map(e=>new B(Math.max(0,e.x),e.y));n[0].set(0,0),n[n.length-1].set(0,Rf[Rf.length-1][1]);let r=Lf(new ia(n,96),this.bodyMat);this.body.add(r);for(let e of[-1,1]){let t=Lf(new Ei(.11,.16,6,16),this.bodyMat);t.rotation.x=Math.PI/2,t.position.set(e*.27,.07,.2);let n=Lf(new Ei(.112,.16,6,16),If(`#f1ece2`,.9));n.rotation.x=Math.PI/2,n.scale.set(1,1,.35),n.position.set(e*.27,.02,.2),this.body.add(t,n)}let i=zf(e.BELLY_Y),a=Lf(new Di(e.BELLY_R,48),If(`#3b1d10`,.9),!1);a.position.set(0,e.BELLY_Y,i+.012),this.liquidMat=If(`#b9d86a`,.15,{clearcoat:1,emissive:new U(`#2a3a10`),emissiveIntensity:.25,clippingPlanes:[this.liquidPlane]});let o=Lf(new Di(e.BELLY_R*.98,48),this.liquidMat,!1);o.position.set(0,e.BELLY_Y,i+.018);let s=t?If(`#ffffff`,.05,{transmission:1,thickness:.15,ior:1.45,clearcoat:1,transparent:!0}):If(`#ffffff`,.04,{transparent:!0,opacity:.22,clearcoat:1,depthWrite:!1}),c=Lf(new G(e.BELLY_R+.01,40,20,0,Math.PI*2,0,Math.PI/2),s,!1);c.rotation.x=Math.PI/2,c.scale.set(1,.3,1),c.position.set(0,e.BELLY_Y,i+.012);let l=Lf(new oa(e.BELLY_R+.02,.03,12,48),If(`#c94a1e`,.45,{clearcoat:.3}));l.position.set(0,e.BELLY_Y,i+.004),this.body.add(a,o,c,l),this.bibMat=If(`#ffffff`,.85,{map:this.gingham.tex,side:2}),this.bibMesh=Lf(new W(.705,.735,.22,32,1,!0,-.75,1.5),this.bibMat),this.bibMesh.position.y=.86,this.bibMesh.scale.set(1.012,1,1.012),this.body.add(this.bibMesh);let u=1.3;for(let e of[-1,1]){let t=e*.24,n=Math.sqrt(Math.max(0,zf(u)**2-t*t))-.03,r=new An;r.position.set(t,u,n),r.rotation.y=e*.33;let i=Lf(new G(.105,32,24),If(`#0b0b0d`,.08,{clearcoat:1,clearcoatRoughness:.03}),!1);i.scale.set(1,1.12,.62);let a=new An;a.add(i);let o=new Gr({color:`#ffffff`}),s=Lf(new G(.026,12,8),o,!1);s.position.set(-.03,.04,.06),s.scale.set(1,1,.4);let c=Lf(new G(.012,10,6),o,!1);c.position.set(.035,-.035,.062),c.scale.set(1,1,.4),a.add(s,c),r.add(a),this.pupils.push(a);let l=this.bodyMat.clone();this.lidMats.push(l);let d=Lf(new G(.118,28,14,0,Math.PI*2,0,Math.PI/2),l,!1);d.scale.set(1,1.1,.7);let f=new An;f.add(d);let p=Lf(new G(.118,28,14,0,Math.PI*2,Math.PI/2,Math.PI/2),l,!1);p.scale.set(1,1.1,.7);let m=new An;m.add(p),r.add(f,m),this.lidsTop.push(f),this.lidsBottom.push(m),this.body.add(r);let h=Lf(new Di(.075,24),new Gr({color:`#ff8fa3`,transparent:!0,opacity:.55,depthWrite:!1}),!1),g=1.1,_=e*.4,v=Math.sqrt(Math.max(0,zf(g)**2-_*_))+.004;h.position.set(_,g,v),h.rotation.y=Math.atan2(_,v),this.cheeks.push(h),this.body.add(h);let y=Lf(new Ei(.02,.11,4,10),If(`#4a0d16`,.5),!1);y.rotation.z=Math.PI/2;let b=1.47,x=e*.24;y.position.set(x,b,Math.sqrt(Math.max(0,zf(b)**2-x*x))+.005),y.userData.side=e,y.userData.y=b,this.brows.push(y),this.body.add(y)}let d=zf(e.MOUTH_Y)-.01;this.mouth.position.set(0,e.MOUTH_Y,d),this.mouthInner=Lf(new G(.2,32,16),If(`#5c0f1a`,.7),!1),this.mouthInner.scale.set(1,.05,.35),this.mouthInner.position.z=.02,this.tongue=Lf(new G(.1,24,12),If(`#f28c9a`,.45,{clearcoat:.5}),!1),this.tongue.scale.set(1,.4,.8),this.teeth=Lf(new Ti(.11,.045,.03),If(`#ffffff`,.2,{clearcoat:1}),!1),this.smileLine=Lf(new oa(.13,.022,10,28,Math.PI),If(`#4a0d16`,.55),!1),this.smileLine.rotation.z=Math.PI,this.smileLine.position.z=.035,this.mouth.add(this.mouthInner,this.tongue,this.teeth,this.smileLine),this.body.add(this.mouth),this.leafMat=If(`#5bbf3a`,.45,{side:2,sheen:.3});let f=Lf(new sa(new Bi([new V(0,0,0),new V(.02,.12,0),new V(.05,.26,0)]),16,.022,8),this.leafMat);this.sprout.add(f),this.sprout.position.set(0,1.8,0),this.sproutTip.position.set(.05,.26,0);for(let e of[-1,1]){let t=Lf(new G(.1,20,10),this.leafMat);t.scale.set(1.2,.18,.7),t.position.set(e*.1,.03,0),t.rotation.z=e*.45,this.sproutTip.add(t)}for(let e=0;e<5;e++){let t=Lf(new G(.035,12,8),If(`#fff3f8`,.5),!1),n=e/5*Math.PI*2;t.position.set(Math.cos(n)*.04,.1,Math.sin(n)*.04),t.scale.set(1,.5,1),this.flower.add(t)}let p=Lf(new G(.025,10,8),If(`#ffd60a`,.4),!1);p.position.y=.11,this.flower.add(p),this.flower.scale.setScalar(.001),this.sproutTip.add(this.flower),this.sprout.add(this.sproutTip),this.body.add(this.sprout);for(let e of[-1,1]){let t=new An;t.position.set(e*.68,.82,.05);let n=Lf(new Ei(.075,.2,6,14),this.bodyMat);n.position.y=-.15,t.add(n),this.arms.push(t),this.body.add(t)}this.body.add(this.accessory)}mouthWorld(e=new V){return this.mouth.getWorldPosition(e)}stain(e){this.gingham.stain(e)}cleanBib(){this.gingham.clean()}setAccessory(e){this.accessory.clear();let t;try{t=pu(e)}catch{t=pu(`base`)}let n={kind:t.accessoryKind||`none`,colors:Pf[t.id]??t.palette,bib:Ff[t.id]};n.bib?this.bibMat.map=Xu(n.bib):(this.gingham=Ku(),this.bibMat.map=this.gingham.tex),this.bibMat.needsUpdate=!0;let[r,i]=n.colors;this.sprout.position.y=1.8+(n.kind===`chef`?.42:n.kind===`cone_hat`?.12:n.kind===`salakot`?.1:n.kind===`ushanka`?.14:0);let a=(e,t,n,r,i,a=0,o=0,s=0,c=1,l=1,u=1,d=.6)=>{let f=Lf(e,If(t,d));return f.position.set(n,r,i),f.rotation.set(a,o,s),f.scale.set(c,l,u),this.accessory.add(f),f};switch(n.kind){case`straw_hat`:case`fisher_hat`:a(new W(.62,.62,.02,40),r,0,1.72,0,.05,0,0,1,1,1,.9),a(new W(.3,.36,.22,32),r,0,1.83,0,.05,0,0,1,1,1,.9),a(new W(.365,.365,.05,32,1,!0),i,0,1.75,0);break;case`cap`:a(new G(.42,32,16,0,Math.PI*2,0,Math.PI/2),r,0,1.6,0,0,0,0,1,.7,1),a(new W(.3,.3,.02,24,1,!1,-1,2),i,0,1.62,.25,.15);break;case`santa`:a(new Oi(.36,.6,32),r,.05,1.98,0,0,0,-.25),a(new oa(.34,.07,12,32),i,0,1.68,0,Math.PI/2),a(new G(.08,16,12),i,.24,2.2,0);break;case`band`:a(new oa(.53,.05,10,48),r,0,1.5,0,Math.PI/2,0,0,1,1,1.6),a(new G(.06,12,8),i,0,1.5,.55);break;case`headset`:a(new oa(.5,.03,8,40,Math.PI),r,0,1.48,0);for(let e of[-1,1])a(new W(.13,.13,.08,24),r,e*.52,1.42,0,0,0,Math.PI/2);a(new W(.1,.1,.09,24),i,.56,1.42,0,0,0,Math.PI/2,1,1,1,.3);break;case`ears`:for(let e of[-1,1])a(new Ei(.08,.35,6,12),r,e*.18,1.98,0,0,0,-e*.2),a(new Ei(.045,.28,6,12),i,e*.18,1.98,.05,0,0,-e*.2);break;case`glasses3d`:case`sunglasses`:for(let e of[-1,1]){let t=a(new Di(.12,24),n.kind===`glasses3d`?e<0?r:i:r,e*.24,1.31,zf(1.31)+.06,0,e*.3,0,1,.85,1,.1);t.material.transparent=!0,t.material.opacity=n.kind===`glasses3d`?.65:.92}a(new Ti(.62,.035,.02),n.kind===`glasses3d`?`#ffffff`:i,0,1.39,zf(1.39)+.06);break;case`lei`:for(let e=0;e<18;e++){let t=e/18*Math.PI*2;a(new G(.065,12,8),e%2?r:i,Math.cos(t)*.69,.78+Math.sin(t*2)*.01,Math.sin(t)*.69)}break;case`scarf`:for(let e=0;e<n.colors.length;e++)a(new oa(.7,.045,10,48),n.colors[e],0,.98-e*.05,0,Math.PI/2);break;case`pumpkin`:a(new G(.46,24,16,0,Math.PI*2,0,Math.PI*.55),r,0,1.52,0,0,0,0,1,.85,1),a(new W(.04,.05,.14,8),i,0,1.92,0);break;case`acorn`:a(new G(.34,28,14,0,Math.PI*2,0,Math.PI/2),r,0,1.64,0,0,0,0,1,.7,1,.95),a(new W(.025,.03,.12,8),i,0,1.92,0);break;case`mug`:a(new W(.2,.18,.26,28),r,.05,1.86,0,0,0,-.15,1,1,1,.2),a(new W(.18,.18,.01,28),i,.07,1.99,0,0,0,-.15),a(new oa(.07,.02,8,16,Math.PI),r,.28,1.86,0,0,0,-Math.PI/2-.15);break;case`chef`:a(new W(.3,.27,.32,32),r,0,1.86,0,0,0,0,1,1,1,.9);for(let e=0;e<6;e++){let t=e/6*Math.PI*2;a(new G(.17,16,12),r,Math.cos(t)*.17,2.06,Math.sin(t)*.17,0,0,0,1,.8,1,.9)}a(new G(.2,16,12),r,0,2.1,0,0,0,0,1,.8,1,.9);break;case`beret`:a(new G(.42,32,16),r,.06,1.74,0,0,0,-.18,1,.32,1,.95),a(new W(.015,.02,.07,8),r,.06,1.88,0);break;case`wreath`:a(new oa(.47,.018,6,48),`#7a5a32`,0,1.58,0,Math.PI/2);for(let e=0;e<22;e++){let t=e/22*Math.PI*2;a(new G(.1,12,8),r,Math.cos(t)*.48,1.6+e%2*.03,Math.sin(t)*.48,0,-t,e%2?.6:-.6,1.7,.3,.75,.6)}for(let e of[.9,1.4,1.9])a(new G(.05,10,8),i??`#3b2a4a`,Math.cos(e)*.5,1.6,Math.sin(e)*.5,0,0,0,1,1.25,1,.3);break;case`cone_hat`:a(new Oi(.72,.36,40,1,!0),r,0,1.86,0,0,0,0,1,1,1,.85),a(new oa(.715,.012,6,48),i??`#a0703c`,0,1.69,0,Math.PI/2);break;case`beanie`:a(new G(.46,32,16,0,Math.PI*2,0,Math.PI/2),r,0,1.56,0,0,0,0,1,.75,1,.95),n.colors.slice(1).forEach((e,t)=>a(new oa(.455-t*.04,.025,8,40),e,0,1.6+t*.07,0,Math.PI/2));for(let e of[-1,1])a(new Ei(.06,.18,4,10),r,e*.47,1.45,.02,0,0,e*.2);a(new G(.08,12,10),n.colors[2]??r,0,1.92,0);break;case`ushanka`:a(new G(.47,32,16,0,Math.PI*2,0,Math.PI/2),r,0,1.56,0,0,0,0,1,.8,1,1),a(new oa(.47,.09,12,48),i,0,1.58,0,Math.PI/2,0,0,1,1,1,1),a(new Ti(.5,.2,.1),i,0,1.7,.43,-.35,0,0,1,1,1,1);for(let e of[-1,1])a(new Ei(.1,.24,6,12),i,e*.58,1.42,.04,0,0,e*.18,1,1,.8,1);break;case`salakot`:a(new G(.66,40,16,0,Math.PI*2,0,Math.PI/2),r,0,1.7,0,0,0,0,1,.42,1,.9),a(new oa(.655,.02,6,48),i,0,1.7,0,Math.PI/2),a(new Oi(.06,.12,12),i,0,2.03,0);break;case`vinok`:a(new oa(.47,.03,6,48),`#3a7d2c`,0,1.58,0,Math.PI/2);for(let e=0;e<14;e++){let t=e/14*Math.PI*2;a(new G(.1,14,10),n.colors[e%n.colors.length],Math.cos(t)*.48,1.62,Math.sin(t)*.48,0,0,0,1,.75,1,.7)}for(let e of[-1,1])a(new Ti(.06,.55,.012),e<0?`#0057b7`:`#ffd700`,e*.08,1.3,-.5,.25,0,e*.12);break;case`backpack`:a(new Ti(.6,.6,.25),r,0,.75,-.72,0,0,0,1,1,1,.8),a(new Ti(.4,.2,.08),i,0,.62,-.87)}}doHop(e=1){this.hopV=3.2*e}update(t,n){this.time+=t;let r=e=>1-Math.exp(-e*t),i=this.expr,a=this.target;for(let e of Object.keys(i))i[e]+=(a[e]-i[e])*r(e===`armL`||e===`armR`?10:12);this.time>this.blinkAt&&this.blinkT<0&&(this.blinkT=0);let o=0;this.blinkT>=0&&(this.blinkT+=t,o=Math.sin(Math.min(1,this.blinkT/.16)*Math.PI),this.blinkT>.16&&(this.blinkT=-1,this.blinkAt=this.time+2.5+Math.random()*3)),this.hopV-=14*t,this.hop=Math.max(0,this.hop+this.hopV*t),this.hop===0&&this.hopV<0&&(this.hopV=0);let s=this.reducedMotion?.3:1,c=1+Math.sin(this.time*2.2)*.012*s,l=i.shake*s;this.body.position.set((Math.random()-.5)*l*.05,this.hop*.25,0),this.body.scale.set(1/Math.sqrt(i.squash)*(2-c),i.squash*c,1/Math.sqrt(i.squash)*(2-c)),this.body.rotation.set(i.lean*.35,i.turn,(Math.random()-.5)*l*.04);let u=Math.min(1,i.lids+o);for(let e=0;e<2;e++){this.lidsTop[e].rotation.x=-1.45+u*1.45,this.lidsBottom[e].rotation.x=1.45-i.squint*.9,this.pupils[e].position.x=(e===0?1:-1)*i.cross*.04;let t=this.brows[e],n=t.userData.side;t.rotation.set(0,0,Math.PI/2-n*i.brow*.45),t.position.y=t.userData.y+i.brow*.02-u*.03,this.lidMats[e].color.copy(this.bodyMat.color)}let d=Math.max(0,Math.min(1,i.mouthOpen));this.mouthInner.scale.set(1+i.puff*.1,.05+d*.75,.35),this.mouthInner.visible=d>.04,this.teeth.visible=d>.15,this.teeth.position.set(0,.04+d*.1,.06),this.tongue.visible=d>.1||i.tongue>.05,this.tongue.position.set(0,-.03-d*.06-i.tongue*.08,.02+i.tongue*.12),this.tongue.scale.set(1,.4+i.tongue*.3,.8+i.tongue*.6),this.smileLine.visible=d<.12,this.smileLine.rotation.z=i.smile>=0?Math.PI:0,this.smileLine.scale.set(1+i.puff*.2,Math.max(.15,Math.abs(i.smile)),1),this.smileLine.position.set(0,i.smile>=0?.03:-.06,.035);for(let e of this.cheeks)e.scale.setScalar(1+i.puff*.7);this.bodyMat.color.set(Mf).lerp(new U(`#a5c25a`),i.tint*.38),this.arms[0].rotation.z=-i.armL,this.arms[1].rotation.z=-i.armR;let f=i.droop*1.1+Math.sin(this.time*1.7)*.05*s;this.sproutV+=((f-this.sproutA)*60-this.sproutV*6)*t,this.sproutV+=-this.hopV*t*.8,this.sproutA+=this.sproutV*t,this.sprout.rotation.z=-this.sproutA*.6,this.sproutTip.rotation.z=-this.sproutA*.9,this.leafMat.color.set(`#5bbf3a`).lerp(new U(`#b0a24a`),Math.max(0,Math.min(1,i.droop))),this.flower.scale.setScalar(Math.max(.001,i.bloom)),this.level+=(this.levelTarget-this.level)*r(3),this.wobbleV+=(-this.wobble*40-this.wobbleV*3)*t,this.wobble+=this.wobbleV*t,this.liquidColor.lerp(this.liquidTarget,r(2)),this.liquidMat.color.copy(this.liquidColor);let p=new V(0,e.BELLY_Y-e.BELLY_R+this.level*e.BELLY_R*2,0);this.body.localToWorld(p);let m=new V(Math.sin(this.wobble)*.6,-1,0).normalize();this.liquidPlane.setFromNormalAndCoplanarPoint(m,p)}splash(e=1){this.wobbleV+=2.5*e}reset(){this.expr={...Nf},this.target={...Nf},this.levelTarget=0,this.level=0,this.liquidTarget.set(`#b9d86a`),this.liquidColor.set(`#b9d86a`),this.root.position.set(0,0,0),this.cleanBib()}setTarget(e){Object.assign(this.target,e)}neutral(){this.target={...Nf}}},Vf=class extends zn{constructor(){super(),this.name=`RoomEnvironment`,this.position.y=-3.5;let e=new Ti;e.deleteAttribute(`uv`);let t=new va({side:1}),n=new va,r=new ro(16777215,900,28,2);r.position.set(.418,16.199,.3),this.add(r);let i=new ri(e,t);i.position.set(-.757,13.219,.717),i.scale.set(31.713,28.305,28.591),this.add(i);let a=new hi(e,n,6),o=new kn;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);let s=new ri(e,Hf(50));s.position.set(-16.116,14.37,8.208),s.scale.set(.1,2.428,2.739),this.add(s);let c=new ri(e,Hf(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let l=new ri(e,Hf(17));l.position.set(14.904,12.198,-1.832),l.scale.set(.15,4.265,6.331),this.add(l);let u=new ri(e,Hf(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let d=new ri(e,Hf(20));d.position.set(3.235,11.486,-12.541),d.scale.set(2.5,2,.1),this.add(d);let f=new ri(e,Hf(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function Hf(e){return new ba({color:0,emissive:16777215,emissiveIntensity:e})}var Uf=class{host;renderer;scene=new zn;camera=new to(40,1,.1,60);plates=[];plateAnchors=[new V,new V];waterAnchor=new V(0,0,2.15);key;fridgeLight;blobTex=qu();portrait=!1;view=`title`;quality=`high`;camBase=new V;camLook=new V;shakeT=0;constructor(e){this.host=e,this.renderer=new Kl({antialias:!0,powerPreference:`high-performance`}),this.renderer.outputColorSpace=He,this.renderer.toneMapping=4,this.renderer.toneMappingExposure=1,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=2,this.renderer.localClippingEnabled=!0,e.appendChild(this.renderer.domElement),this.renderer.domElement.id=`game-canvas`;let t=new $o(this.renderer);this.scene.environment=t.fromScene(new Vf,.04).texture,this.scene.environmentIntensity=.55,t.dispose(),this.scene.background=new U(`#f3e7d6`),this.scene.fog=new Rn(`#f3e7d6`,9,22),this.key=new oo(`#fff4e6`,2.2),this.key.position.set(3.5,6.5,4.5),this.key.castShadow=!0,this.key.shadow.mapSize.set(2048,2048),this.key.shadow.camera.left=-4,this.key.shadow.camera.right=4,this.key.shadow.camera.top=4,this.key.shadow.camera.bottom=-3,this.key.shadow.camera.near=1,this.key.shadow.camera.far=20,this.key.shadow.bias=-4e-4,this.key.shadow.normalBias=.02,this.key.shadow.radius=4,this.scene.add(this.key),this.scene.add(new Ua(`#fff6ea`,`#7a5a3a`,.45)),this.fridgeLight=new ro(`#ffe2b0`,6,7,1.6),this.fridgeLight.position.set(0,2.6,-1.8),this.scene.add(this.fridgeLight),this.buildTable(),this.buildFridge(),this.buildPlates(),this.resize(),new ResizeObserver(()=>this.resize()).observe(e)}buildTable(){let{map:e,bump:t}=Gu();e.repeat.set(2,1.4),t.repeat.copy(e.repeat);let n=new ri(new Ti(12,.3,7),new ya({map:e,bumpMap:t,bumpScale:1.2,roughness:.5,clearcoat:.25,clearcoatRoughness:.45}));n.position.set(0,-.15,.6),n.receiveShadow=!0,this.scene.add(n);let r=new ri(new aa(4.2,1.6),new va({map:Yu(),roughness:.95}));r.rotation.x=-Math.PI/2,r.position.set(0,.002,1.65),r.receiveShadow=!0,this.scene.add(r);let i=new ri(new aa(30,12),new va({color:`#efe2cf`,roughness:.95}));i.position.set(0,4,-4.2),this.scene.add(i);let a=new ri(new aa(30,1.6),new va({color:`#d9e6e2`,roughness:.4}));a.position.set(0,.8,-4.19),this.scene.add(a)}buildFridge(){let e=new An;e.position.set(-.2,0,-2.6);let t=new ya({color:`#f4f1ea`,roughness:.35,clearcoat:.6}),n=new va({color:`#fdf6e8`,roughness:.6,emissive:new U(`#ffe8c2`),emissiveIntensity:.35}),r=2.6,i=4.2,a=1.1,o=(t,n,r,i,a,o,s)=>{let c=new ri(new Ti(t,n,r),s);return c.position.set(i,a,o),e.add(c),c};o(r,.12,a,0,i,0,t),o(.12,i,a,-2.6/2,i/2,0,t),o(.12,i,a,r/2,i/2,0,t),o(r,i,.1,0,i/2,-1.1/2,n);for(let e of[1.2,2.2,3.2]){let t=o(2.3600000000000003,.04,.9500000000000001,0,e,0,new ya({color:`#ffffff`,roughness:.05,transparent:!0,opacity:.35}));t.castShadow=!1}let s=[`#e63946`,`#ffb703`,`#80b918`,`#f1faee`,`#ff8c1a`,`#3a86ff`],c=0;for(let t of[1.22,2.22,3.22])for(let n=-.9;n<=.9;n+=.45){let r=s[c++%s.length],i=.25+c*37%10/30,a=new ri(new W(.12,.12,i,16),new va({color:r,roughness:.4}));a.position.set(n,t+i/2,-.15),e.add(a)}let l=new ri(new Ti(r,i,.12),t);l.geometry.translate(r/2,0,0),l.position.set(r/2,i/2,a/2),l.rotation.y=-1.25,e.add(l),this.scene.add(e)}buildPlates(){let e=new ia([new B(0,0),new B(.5,0),new B(.55,.02),new B(.62,.04),new B(.78,.08),new B(.8,.09),new B(.76,.095),new B(.6,.06),new B(0,.055)],64),t=new ya({color:`#fbf9f4`,roughness:.15,clearcoat:1,clearcoatRoughness:.05});for(let n=0;n<2;n++){let n=new An,r=new ri(e,t);r.castShadow=!0,r.receiveShadow=!0,n.add(r);let i=this.blobMesh(1.9);i.position.y=.003,n.add(i),this.plates.push(n),this.scene.add(n)}}blobMesh(e){let t=new ri(new aa(e,e),new Gr({map:this.blobTex,transparent:!0,depthWrite:!1,opacity:.6}));return t.rotation.x=-Math.PI/2,t.renderOrder=1,t}addBlob(e,t){let n=this.blobMesh(t);return n.position.copy(e),this.scene.add(n),n}resize(){let e=Math.max(1,this.host.clientWidth),t=Math.max(1,this.host.clientHeight),n=this.quality===`high`?2:this.quality===`medium`?1.5:1;if(this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,n)),this.renderer.setSize(e,t,!1),this.camera.aspect=e/t,this.portrait=e/t<.9,this.portrait)this.camera.fov=52,this.camBase.set(0,3.4,7.4),this.camLook.set(0,.95,.9),this.plateAnchors[0].set(-.88,0,2.05),this.plateAnchors[1].set(.88,0,2.05),this.waterAnchor.set(0,0,3);else{let n=e/t>1.9;this.camera.fov=n?46:40,this.camBase.set(0,3.2,6.3),this.camLook.set(0,.75,.95),this.plateAnchors[0].set(-1.55,0,1.55),this.plateAnchors[1].set(1.55,0,1.55),this.waterAnchor.set(0,0,2.25)}this.view===`title`&&(this.portrait?(this.camBase.set(0,1.9,7.6),this.camLook.set(0,.2,0)):(this.camBase.set(1.1,1.6,4.6),this.camLook.set(.9,1,0))),this.camera.updateProjectionMatrix(),this.plates.forEach((e,t)=>{e.position.copy(this.plateAnchors[t]),e.visible=this.view===`game`})}setView(e){this.view=e,this.resize()}setQuality(e){this.quality=e,this.renderer.shadowMap.enabled=e!==`low`,this.key.castShadow=e!==`low`;let t=e===`high`?2048:1024;this.key.shadow.mapSize.x!==t&&(this.key.shadow.mapSize.set(t,t),this.key.shadow.map?.dispose(),this.key.shadow.map=null),this.scene.traverse(e=>{let t=e.material;t&&(t.needsUpdate=!0)}),this.resize()}shake(e=1){this.shakeT=Math.max(this.shakeT,.35*e)}render(e,t){this.shakeT=Math.max(0,this.shakeT-e);let n=t?0:this.shakeT*.06;this.camera.position.set(this.camBase.x+(Math.random()-.5)*n,this.camBase.y+(Math.random()-.5)*n,this.camBase.z),this.camera.lookAt(this.camLook),this.renderer.render(this.scene,this.camera)}},Wf=[`italy`,`poland`,`japan`,`mexico`,`usa`,`india`,`france`,`spain`,`greece`,`turkey`,`china`,`korea`,`thailand`,`vietnam`,`brazil`,`peru`,`morocco`,`uk`,`germany`,`nigeria`,`indonesia`,`russia`,`ukraine`,`philippines`].map(e=>({bagId:e,mint:null,decimals:null,minimumTokens:null,verified:!1})),Gf={bagId:`*`,mint:`39kMeX4HVRW9qbbiHSPbRQ9xeXUF18GrNP6gL61Ppump`,decimals:6,minimumTokens:`5000000`,verified:!0,aggregation:`single`},Kf={minOriginalSeconds:0,minRemainingSeconds:0,aggregation:`sum`,maxAgeSeconds:90,recheckIntervalMs:6e4},qf={app:`https://devfridge.cool`,scan:`https://scan.devfridge.cool`,checkApi:`https://scan.devfridge.cool/api/sdk/check`,docsFridge:`https://docs.devfridge.cool/fridge`,program:`9RY54dNPYTzDyh3TfFqDdt2b2KMM56KW1tw9erRTGQo6`};function Jf(e){return!!(e.verified&&e.mint&&e.decimals!==null&&e.minimumTokens)}var Yf=(1n<<64n)-1n;function Xf(e,t){if(typeof e!=`string`||e.length>100||!/^\d+(\.\d+)?$/.test(e))throw Error(`Use a decimal token string without commas`);if(!Number.isInteger(t)||t<0||t>255)throw Error(`Verify token decimals`);let[n,r=``]=e.split(`.`);if(r.length>t)throw Error(`Too many decimal places`);let i=BigInt(n)*10n**BigInt(t)+BigInt(r.padEnd(t,`0`)||`0`);if(i<=0n||i>Yf)throw Error(`Amount must fit a positive Solana token balance`);return i}function Zf(e,t,n=Math.floor(Date.now()/1e3)){let{wallet:r,mint:i,minimumRaw:a,minOriginalSeconds:o=0,minRemainingSeconds:s=0,maxAgeSeconds:c=90,aggregation:l=`sum`}=t;if(![`sum`,`single`].includes(l))throw Error(`Choose sum or single-lock aggregation`);if(!r||!i||typeof a!=`bigint`||a<=0n||a>Yf)throw Error(`Configure a verified wallet, mint and positive raw minimum`);for(let e of[n,o,s,c])if(!Number.isSafeInteger(e)||e<0)throw Error(`Invalid time policy`);if(!e||e.wallet!==r||e.mint!==i||!Array.isArray(e.activeLocks))throw Error(`Lock evidence identity mismatch`);if(!Number.isSafeInteger(e.ts)||e.ts>n+5||n-e.ts>c)throw Error(`Lock evidence is stale or has an invalid timestamp`);let u=new Set,d=0n,f=0n,p=null,m=Math.min(n+c+1,e.ts+c+1);for(let t of e.activeLocks){if(!t||typeof t.address!=`string`||!t.address||u.has(t.address))throw Error(`Missing or duplicate lock address`);if(u.add(t.address),t.depositor!==r||t.mint!==i)throw Error(`Lock owner or mint mismatch`);if(typeof t.amount!=`string`||!/^\d{1,20}$/.test(t.amount)||BigInt(t.amount)>Yf)throw Error(`Invalid raw lock amount`);if(!Number.isSafeInteger(t.createdAt)||!Number.isSafeInteger(t.unlockAt)||t.createdAt<0||t.createdAt>n+5||t.unlockAt<=t.createdAt)throw Error(`Invalid lock times`);if(t.unlockAt<=n||t.unlockAt-n<s||t.unlockAt-t.createdAt<o)continue;let e=BigInt(t.amount);d+=e,f=e>f?e:f,p=p===null?t.unlockAt:Math.max(p,t.unlockAt),m=Math.min(m,t.unlockAt,t.unlockAt-s+1)}return{eligible:(l===`single`?f:d)>=a,totalRaw:d,largestRaw:f,nextCheckAt:m,latestUnlockAt:p}}function Qf(e){return Wf.find(t=>t.bagId===e)??null}var $f=()=>Jf(Gf)?Gf:null;function ep(e){return e===`base`?[]:[$f(),Qf(e)].filter(e=>!!e&&Jf(e))}var tp=e=>e===`base`||ep(e).length>0,np=new Map,rp=0;async function ip(e,t,n,r){if(Date.now()<rp)return{kind:`unavailable`,reason:`rate_limited`};let i=`${t}:${e.mint}:${n}`,a=np.get(i);if(a)return a;let o=(async()=>{try{let i=await r(`${qf.checkApi}?wallet=${encodeURIComponent(t)}&mint=${encodeURIComponent(e.mint)}`,{signal:AbortSignal.timeout(15e3)});if(i.status===429)return rp=Date.now()+6e4,{kind:`unavailable`,reason:`rate_limited`};if(!i.ok)return{kind:`unavailable`,reason:`http_${i.status}`};let a=await i.json(),o=Math.floor(Date.now()/1e3),s=Zf(a,{wallet:t,mint:e.mint,minimumRaw:Xf(e.minimumTokens,e.decimals),minOriginalSeconds:Kf.minOriginalSeconds,minRemainingSeconds:Kf.minRemainingSeconds,maxAgeSeconds:Kf.maxAgeSeconds,aggregation:e.aggregation??Kf.aggregation},o);return s.eligible?{kind:`unlocked`,until:s.latestUnlockAt,checkedAt:o,nextCheckAt:s.nextCheckAt,via:n}:{kind:`locked`,checkedAt:o}}catch(e){return{kind:`unavailable`,reason:e instanceof Error?e.message:`error`}}finally{np.delete(i)}})();return np.set(i,o),o}async function ap(e,t=fetch){let n=$f();return n?e?ip(n,e,`pass`,t):{kind:`no_wallet`}:{kind:`not_configured`}}async function op(e,t,n=fetch){if(e===`base`)return{kind:`free`};let r=ep(e);if(!r.length)return{kind:`not_configured`};if(!t)return{kind:`no_wallet`};let i=await Promise.all(r.map(e=>ip(e,t,e===Gf?`pass`:`bag`,n))),a=i.filter(e=>e.kind===`unlocked`);return a.length?a.reduce((e,t)=>(t.until??0)>(e.until??0)?t:e):i.find(e=>e.kind===`unavailable`)??{kind:`locked`,checkedAt:Math.floor(Date.now()/1e3)}}var sp=`AXomB2bpJ7F3EFVPQwrwBV4yVE7bazshZaVa64KhGCfE`,cp=1000000n,lp=`0.001`,up=`https://solana-rpc.publicnode.com`,dp=e=>e&&typeof e==`object`?e:null;function fp(e,t,n){let r=dp(e),i=dp(r?.meta);if(!r||!i||i.err!==null)return!1;let a=r.blockTime;if(typeof a!=`number`)return!1;let o=n/1e3-a;if(o>300||o<-120)return!1;let s=dp(dp(r.transaction)?.message)?.instructions;return Array.isArray(s)?s.some(e=>{let n=dp(e),r=dp(n?.parsed),i=dp(r?.info);if(!n||n.program!==`system`||r?.type!==`transfer`||!i)return!1;let a=i.lamports;return i.source===t&&i.destination===`AXomB2bpJ7F3EFVPQwrwBV4yVE7bazshZaVa64KhGCfE`&&typeof a==`number`&&Number.isSafeInteger(a)&&BigInt(a)>=1000000n}):!1}async function pp(e,t){let n;try{let e=dp(dp(await t.rpc(`getLatestBlockhash`,[{commitment:`confirmed`}]))?.value);if(typeof e?.blockhash!=`string`)return{ok:!1,reason:`rpc`};n=e.blockhash,ef(n)}catch{return{ok:!1,reason:`rpc`}}let r;try{r=await t.send(af(e,sp,cp,n))}catch(e){return{ok:!1,reason:e instanceof Error&&e.message===`wallet_no_send`?`no_send`:`rejected`}}if(t.used.has(r))return{ok:!1,reason:`used`};for(let e=0;e<30;e++){try{let e=dp(await t.rpc(`getSignatureStatuses`,[[r],{searchTransactionHistory:!0}])),n=Array.isArray(e?.value)?dp(e.value[0]):null;if(n&&n.err)return{ok:!1,reason:`not_confirmed`};if(n&&(n.confirmationStatus===`confirmed`||n.confirmationStatus===`finalized`))break}catch{}if(e===29)return{ok:!1,reason:`not_confirmed`};await t.sleep(2e3)}try{if(!fp(await t.rpc(`getTransaction`,[r,{encoding:`jsonParsed`,commitment:`confirmed`,maxSupportedTransactionVersion:0}]),e,t.now()))return{ok:!1,reason:`mismatch`}}catch{return{ok:!1,reason:`rpc`}}return t.used.add(r),{ok:!0,signature:r}}async function mp(e,t,n=fetch){let r=await n(up,{method:`POST`,credentials:`omit`,referrerPolicy:`no-referrer`,signal:AbortSignal.timeout(15e3),headers:{"content-type":`application/json`},body:JSON.stringify({jsonrpc:`2.0`,id:1,method:e,params:t})});if(!r.ok)throw Error(`rpc ${r.status}`);let i=dp(await r.json());if(!i||i.error)throw Error(`rpc error`);return i.result}var hp=e=>document.querySelector(e);function Z(e,t={},...n){let r=document.createElement(e);for(let[e,n]of Object.entries(t))e===`class`?r.className=n:r.setAttribute(e,n);for(let e of n)e!==null&&e!==!1&&r.append(typeof e==`string`?document.createTextNode(e):e);return r}function Q(e,t,r,i={}){let a=Z(`button`,{class:t,type:`button`,...i});return typeof e==`string`?a.textContent=e:a.append(...e),a.addEventListener(`click`,()=>{n.unlock(),r()}),a}var gp=`https://scan.devfridge.cool`;`${gp}`;var _p=`123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`;function vp(e){if(typeof e!=`string`||e.length<32||e.length>44)return!1;let t=0n;for(let n of e){let e=_p.indexOf(n);if(e<0)return!1;t=t*58n+BigInt(e)}let n=0;for(let t of e)if(t===`1`)n++;else break;let r=t===0n?0:Math.ceil(t.toString(16).length/2);return n+r===32}function yp(e,t){if(typeof e!=`string`)return``;let n=e.replace(/<[^>]*>/g,` `).replace(/[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u180e\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff\ufff9-\ufffb]/g,` `).replace(/\s+/g,` `).trim();return Array.from(n).slice(0,t).join(``)}var bp=/[\u0000-\u0020\u007f-\u009f\\]/,xp=/^(localhost|.*\.localhost|.*\.local|.*\.internal|.*\.lan|metadata\.google\.internal)$/i;function Sp(e){if(typeof e!=`string`||e.length>2048||bp.test(e))return!1;let t;try{t=new URL(e)}catch{return!1}if(t.protocol!==`https:`||t.username||t.password||t.hash||t.port)return!1;let n=t.hostname.toLowerCase();return!(!n.includes(`.`)||xp.test(n)||/^\d+(\.\d+){3}$/.test(n)||n.includes(`:`)||n.startsWith(`[`))}function Cp(e,t){if(typeof e!=`string`||e.length>2048||bp.test(e))return null;let n;try{n=new URL(e,gp)}catch{return null}if(n.origin!==`https://scan.devfridge.cool`||n.pathname!==`/api/logo`||n.username||n.password||n.hash||n.port)return null;let r=[...n.searchParams.keys()];if(new Set(r).size!==r.length||r.some(e=>![`cid`,`path`,`mint`,`url`,`v`].includes(e)))return null;let i=n.searchParams.get(`cid`),a=n.searchParams.get(`url`),o=n.searchParams.get(`path`),s=i!==null&&/^[A-Za-z0-9]{46,90}$/.test(i),c=a!==null&&Sp(a);if(!s&&!c||i!==null&&!s||a!==null&&!c||o!==null&&(o.length>512||!o.startsWith(`/`)||o.startsWith(`//`)||/[?#\\\u0000-\u001f]/.test(o)))return null;let l=new URL(`/api/logo`,gp);return s&&l.searchParams.set(`cid`,i),o!==null&&l.searchParams.set(`path`,o),c&&l.searchParams.set(`url`,a),l.searchParams.set(`mint`,t),l.searchParams.set(`v`,`3`),l.href}function wp(e,t){if(!e||typeof e!=`object`)return null;let n=e.mint;if(!vp(n))return null;let r=e.expiresAt;return!Number.isSafeInteger(r)||r<=t?null:{mint:n,name:yp(e.name,64)||`Token ${n.slice(0,4)}`,symbol:yp(e.symbol,16).replace(/^\$+/,``).trim()||n.slice(0,4),logo:Cp(e.image??e.logo??null,n),url:`${gp}/t/${n}`,expiresAt:r}}function Tp(e,t){let n=[],r=new Set;for(let i of e.slice(0,256)){let e=wp(i,t);if(e&&!r.has(e.mint)&&(r.add(e.mint),n.push(e),n.length>=12))break}return n}function Ep(e,t){return!e||typeof e!=`object`||!Array.isArray(e.sponsors)?[]:Tp(e.sponsors,t)}var Dp=65536,Op=null;async function kp(e,t){try{let n=await e(`/api/sponsors`,{credentials:`omit`,redirect:`error`,referrerPolicy:`no-referrer`,signal:AbortSignal.timeout(4e3),headers:{accept:`application/json`}});if(!n.ok||!/application\/json/i.test(n.headers.get(`content-type`)??``))return{kind:`empty`};let r=await n.text();if(r.length>Dp)return{kind:`empty`};let i=Ep(JSON.parse(r),t());return i.length?{kind:`sponsor`,sponsor:i[Math.floor(Math.random()*i.length)]}:{kind:`empty`}}catch{return{kind:`empty`}}}function Ap(e=fetch,t=Date.now){return Op??=kp(e,t),Op}function jp(e,t=Date.now()){return e.kind===`sponsor`&&e.sponsor.expiresAt<=t?{kind:`empty`}:e}var Mp=`https://club.devfridge.cool/download/onlyfridge-club`,Np=`https://scan.devfridge.cool/#feature`;function Pp(e,t){return!t&&!e.script}function Fp(e){return e.kidMode?!1:e.screen===`title`||e.lastRunPromoted&&(e.screen===`none`||e.screen===`pause`||e.screen===`results`)}function Ip(e,t){let n=new Map;for(let t of e.log)n.set(t.id,(n.get(t.id)??0)+1);let r=[...n.entries()],i=360+r.length*30+260,a=document.createElement(`canvas`);a.width=540,a.height=i;let o=a.getContext(`2d`);o.fillStyle=`#fffdf8`,o.beginPath(),o.moveTo(0,12);for(let e=0;e<=540;e+=18)o.lineTo(e,e%36==0?0:12);o.lineTo(540,i-12);for(let e=540;e>=0;e-=18)o.lineTo(e,e%36==0?i:i-12);o.closePath(),o.fill();let s=`"Courier New", ui-monospace, monospace`,c=60;o.textAlign=`center`,o.fillStyle=`#ff6b35`,o.font=`900 52px system-ui, sans-serif`,o.fillText(`PIKKO MART`,270,c),c+=36,o.fillStyle=`#2a1d14`,o.font=`700 20px ${s}`,o.fillText(J(`subtitle`),270,c),c+=30,o.font=`16px ${s}`,o.fillText(`${t.modeLabel}${t.dailyTag?` · `+t.dailyTag:``}`,270,c),c+=24,o.fillText(new Date().toLocaleString(),270,c),c+=20;let l=()=>{o.fillText(`-`.repeat(40),270,c),c+=26};l(),o.textAlign=`left`,o.font=`18px ${s}`;for(let[e,t]of r){let n=fu.get(e);if(!n)continue;let r=`${au(n.grade)?`+`:ou(n.grade)?`!`:` `} ${t>1?t+`x `:``}${Lu(n)}`;r.length>30&&(r=r.slice(0,29)+`…`),o.fillStyle=au(n.grade)?`#2f7d1e`:ou(n.grade)?`#8c5a2b`:`#2a1d14`,o.fillText(r,30,c),o.textAlign=`right`,o.fillText(`${Iu(n.kcal*t)} kcal`,510,c),o.textAlign=`left`,c+=30}o.fillStyle=`#2a1d14`,o.textAlign=`center`,l(),o.textAlign=`left`,o.font=`700 22px ${s}`,o.fillText(J(`receipt_total`),30,c),o.textAlign=`right`,o.fillText(`${Iu(e.kcal)} kcal`,510,c),c+=32,o.textAlign=`left`,o.fillText(J(`receipt_points`),30,c),o.textAlign=`right`,o.fillText(Iu(e.score),510,c),c+=32,o.textAlign=`center`,o.font=`900 26px system-ui, sans-serif`,o.fillStyle=e.outcome===`victory`?`#2f7d1e`:`#8c5a2b`,o.fillText(e.outcome===`victory`?J(`victory`):J(`defeat`),270,c+6),c+=40,o.fillStyle=`#2a1d14`;let u=90,d=e.score+e.kcal;for(;u<450;){d=d*1103515245+12345>>>0;let e=1+d%4;o.fillRect(u,c,e,50),u+=e+2+(d>>3)%3}return c+=76,o.font=`16px ${s}`,o.fillText(J(`receipt_cashier`),270,c),c+=24,o.fillText(J(`receipt_thanks`),270,c),a}function Lp(e,t){let n=e.log.map(e=>au(e.grade)?`🟢`:ou(e.grade)?`🟤`:`🟡`).join(``);return`PIKKO ${t} ${e.outcome===`victory`?`🌱`:`🤢`} ${Iu(e.score)}\n${n}`}var Rp=[[`donut`,`apple`],[`broccoli`,`chocobar`]],zp=`tutorial.done`,Bp=[`italy`,`japan`,`mexico`,`india`,`peru`,`poland`],Vp=[{kind:`card`,id:`tut1`,icon:`🥕`,illus:()=>Wp()},{kind:`card`,id:`tut2`,icon:`🫙`,illus:()=>Gp()},{kind:`practice`,round:1},{kind:`practice`,round:2},{kind:`card`,id:`tut3`,icon:`👅`,illus:()=>Kp()},{kind:`card`,id:`tut4`,icon:`🌈`,illus:()=>qp()},{kind:`card`,id:`tut5`,icon:`🎮`,illus:()=>Jp()},{kind:`card`,id:`tut6`,icon:`🛒`,illus:()=>Yp()},{kind:`card`,id:`tut7`,icon:`🍝`,illus:()=>Xp(),adultsOnly:!0},{kind:`card`,id:`tut8`,icon:`🧾`,illus:()=>Zp()},{kind:`card`,id:`tut9`,icon:`🌱`,illus:()=>Qp()}],$=(e,t=``)=>Z(`span`,{class:`tut-chip ${t}`.trim()},e),Hp=()=>Z(`span`,{class:`tut-arrow`,"aria-hidden":`true`},`➜`),Up=(...e)=>Z(`div`,{class:`tut-line`},...e);function Wp(){return Z(`div`,{class:`tut-illus`},Up($(`🍎`),Hp(),$(`😋`),$(`+`),$(`🌱`)),Up($(`🍩`),Hp(),$(`🤢`,`bad`),$(`💨`)))}function Gp(){let e=Z(`div`,{class:`tut-belly`,"aria-hidden":`true`},Z(`i`,{class:`h`}),Z(`i`,{class:`j`}),Z(`b`,{class:`half`}));return Z(`div`,{class:`tut-illus`},Z(`div`,{class:`tut-belly-head`},`🫙 ${Iu(dd)} kcal`),e,Up($(`🌱 50%+`,`good`),Hp(),$(`🏆`)))}function Kp(){return Z(`div`,{class:`tut-illus`},Up($(`🍩🍩🍩`),Hp(),$(`🥦`),$(`🤢`,`bad`)),Up($(`🥦🥦🥦`),Hp(),$(`✨ +300`,`good`)))}function qp(){return Z(`div`,{class:`tut-illus`},Up($(`🔥 ×3`),$(`🌈`),$(`💧`),$(`🥦🍅🥕`)),Up($(`😴`,`bad`),$(`=`,``),$(`🍎🍎🍎`)))}function Jp(){return Z(`div`,{class:`tut-illus`},Up($(`▶ 40`)),Up($(`📅 20`),$(`🌿 ∞`)))}function Yp(){let e=Z(`div`,{class:`tut-logos`});for(let t of Bp)e.append(Z(`img`,{src:`logos/${t}.svg`,alt:``,width:`56`,height:`56`}));return Z(`div`,{class:`tut-illus`},e,Up($(`🌍 24 × 20`),$(`🧪 5`)))}function Xp(){return Z(`div`,{class:`tut-illus`},Up($(`🍝 PASTA`),Hp(),$(`🔒`),Hp(),$(`🔓 🛒`)))}function Zp(){return Z(`div`,{class:`tut-illus`},Up($(`🧾`),$(`📋`),$(`🎯`),$(`🎬`)))}function Qp(){return Z(`div`,{class:`tut-illus`},Up($(`🥦`),$(`🍅`),$(`🥕`),$(`🍋`)),Up($(`😋`,`good`)))}var $p=class{host;index=0;steps=[];opts=null;coach=hp(`#coach`);coachText=``;constructor(e){this.host=e}get running(){return this.opts!==null}start(e){this.opts=e,this.steps=Vp.filter(t=>t.kind===`practice`?e.practice:!(t.adultsOnly&&this.host.kidMode())),this.index=0,this.render()}finish(){let e=this.opts;e&&(this.opts=null,this.hideCoach(),this.host.game.cfg.script&&this.host.stopPractice(),bu.set(zp,!0),e.onDone())}onBite(e,t,n){if(!this.opts)return;let r=au(t.grade),i=n===1?r?`tutP1_good`:`tutP1_bad`:r?`tutP2_healthy`:`tutP2_junk`;this.showCoach(J(i),!1)}onReady(){this.opts&&this.coachText&&this.showCoach(this.coachText,!0)}go(e){let t=this.steps[this.index];if(this.index=Math.max(0,Math.min(this.steps.length,this.index+e)),e<0)for(;this.index>0&&this.steps[this.index].kind===`practice`;)this.index--;let n=this.steps[this.index];if(t?.kind===`practice`&&n?.kind!==`practice`&&(this.hideCoach(),this.host.stopPractice()),this.index>=this.steps.length){this.finish();return}this.render()}render(){let e=this.steps[this.index];e.kind===`card`?(this.hideCoach(),this.renderCard(e)):this.renderPractice(e)}renderCard(e){let t=this.index===this.steps.length-1,n=this.steps.length,r=Z(`div`,{class:`tut-dots`,"aria-hidden":`true`});for(let e=0;e<n;e++)r.append(Z(`i`,{class:e===this.index?`on`:e<this.index?`seen`:``}));let i=J(`${e.id}_b`,{amount:Iu(Number(Gf.minimumTokens))}),a=Z(`div`,{class:`card tut stack`,role:`dialog`,"aria-modal":`true`,"aria-label":J(`tut_how`)},Z(`div`,{class:`row tut-top`},Z(`span`,{class:`chip`},J(`tut_count`,{n:this.index+1,t:n})),t?null:Q(J(`tut_skip`),`btn ghost small`,()=>this.finish())),Z(`div`,{class:`tut-icon`,"aria-hidden":`true`},e.icon),Z(`h2`,{},J(`${e.id}_t`)),e.illus(),Z(`p`,{class:`tut-body`},i),r,Z(`div`,{class:`row tut-nav`},this.index>0?Q(J(`tut_back`),`btn ghost`,()=>this.go(-1)):null,Q(t?`🌱 ${J(`tut_start`)}`:J(`tut_next`),`btn`,()=>this.go(1))));this.host.open(Z(`div`,{},a))}renderPractice(e){let t=this.host.game;!t.active||!t.cfg.script?(this.host.closeScreen(),this.host.startPractice(Rp)):t.advance(),this.showCoach(J(e.round===1?`tutP1`:`tutP2`),!1)}showCoach(e,t){this.coachText=e;let n=this.steps.length,r=Z(`div`,{class:`tut-coach`,role:`status`},Z(`div`,{class:`tut-coach-top`},Z(`span`,{class:`chip`},J(`tut_count`,{n:this.index+1,t:n})),Q(J(`tut_skip`),`btn ghost small`,()=>this.finish())),Z(`p`,{},e),t?Q(J(`tut_next`),`btn`,()=>this.go(1)):null);this.coach.replaceChildren(r),this.coach.hidden=!1}hideCoach(){this.coachText=``,this.coach.replaceChildren(),this.coach.hidden=!0}},em=class{host;screen=hp(`#screen`);hud=hp(`#hud`);labels=hp(`#labels`);toasts=hp(`#toasts`);factEl=null;factTimer=0;songStop=null;lastFocus=null;sponsorEl=hp(`#sponsor`);sponsorState=null;lastRunPromoted=!1;current=`none`;tutorial;constructor(e){this.host=e,this.tutorial=new $p({game:e.game,kidMode:()=>e.settings.kidMode,open:e=>this.open(e,`tutorial`),closeScreen:()=>this.close(),startPractice:e=>this.launch({mode:`zen`,bagId:`base`,trial:!1,script:e}),stopPractice:()=>{this.hud.hidden=!0,this.labels.replaceChildren(),this.host.stopGame()}})}showTutorial(e,t=!0){this.tutorial.start({practice:t,onDone:e})}tutorialBite(e,t,n){this.tutorial.onBite(e,t,n)}tutorialReady(){this.tutorial.onReady()}begin(e){bu.get(`tutorial.done`,!1)?this.run(e):this.showTutorial(()=>this.run(e))}launch(e){this.lastRunPromoted=Pp(e,this.host.settings.kidMode),this.host.start(e)}run(e){Pp(e,this.host.settings.kidMode)?this.promo(e):this.launch(e)}promo(e){let t=!1,n=Z(`div`,{class:`card stack promo`},Z(`span`,{class:`chip`},`📣 ${J(`promo_label`)}`),Z(`h2`,{},`🍸 OnlyFridge Club`),Z(`p`,{},J(`promo_body`)),Q(`▶ ${J(`promo_continue`)}`,`btn`,()=>{t||(t=!0,this.launch(e))}),Z(`a`,{class:`btn ghost small`,href:Mp,target:`_blank`,rel:`noopener noreferrer`},J(`promo_discover`)),Q(J(`quit`),`btn ghost small`,()=>{t=!0,this.close(),this.host.toTitle()}));this.open(Z(`div`,{},n),`promo`)}syncSponsor(){let e=Fp({kidMode:this.host.settings.kidMode,screen:this.current,lastRunPromoted:this.lastRunPromoted});if(hp(`#app`).classList.toggle(`has-sponsor`,e),this.sponsorEl.hidden=!e,e){if(!this.sponsorState){this.sponsorEl.replaceChildren(),Ap().then(e=>{this.sponsorState=e,this.syncSponsor()});return}this.renderSponsor()}}renderSponsor(){let e=jp(this.sponsorState??{kind:`empty`}),t=e.kind===`sponsor`?e.sponsor:null,n=t?.logo?(()=>{let e=Z(`img`,{class:`mark`,src:t.logo,alt:``,referrerpolicy:`no-referrer`,loading:`lazy`});return e.addEventListener(`error`,()=>{e.replaceWith(Z(`span`,{class:`mark`},`🪙`))},{once:!0}),e})():Z(`span`,{class:`mark`},t?`🪙`:`📣`),r=t?[Z(`b`,{},`$${t.symbol}`),` ${t.name}`,Z(`small`,{},`${J(`sponsor_label`)} · ${J(`sponsor_disclaimer`)}`)]:[Z(`b`,{},`YOUR AD HERE`),Z(`small`,{},J(`sponsor_empty_cta`))],i=Z(`a`,{class:`sponsor-card`,href:t?t.url:Np,target:`_blank`,rel:`sponsored noopener noreferrer`,referrerpolicy:`no-referrer`},n,Z(`span`,{class:`txt`},...r));i.addEventListener(`click`,e=>{e.preventDefault();let n=jp(this.sponsorState??{kind:`empty`});this.current===`none`&&this.host.game.active&&this.pause(),window.open(n.kind===`sponsor`?n.sponsor.url:Np,`_blank`,`noopener,noreferrer`),t&&n.kind===`empty`&&this.renderSponsor()}),this.sponsorEl.replaceChildren(i)}setMode(e){this.host.settings.kidMode=e,this.host.settings.modeChosen=!0,this.host.applySettings()}modePicker(e){this.hud.hidden=!0,this.host.setView(`title`);let t=Z(`div`,{class:`card stack`},Z(`h2`,{},`👋 ${J(`mode_title`)}`),Z(`div`,{class:`menu stack`},Q([Z(`span`,{},`🧒 ${J(`mode_kids`)}`),Z(`small`,{},J(`mode_kids_d`))],`btn green`,()=>{this.setMode(!0),e()}),Q([Z(`span`,{},`🧑 ${J(`mode_adult`)}`),Z(`small`,{},J(`mode_adult_d`))],`btn`,()=>this.adultGate(()=>{this.setMode(!1),e()},()=>this.modePicker(e)))));this.open(Z(`div`,{},t),`mode`)}switchMode(e){this.host.settings.kidMode?this.adultGate(()=>{this.setMode(!1),e()},e):(this.setMode(!0),e())}modeButton(e){let t=this.host.settings.kidMode;return Q(`${t?`🧒`:`🧑`} ${J(t?`mode_kids`:`mode_adult`)} ⇄`,`btn ghost small mode-switch`,()=>this.switchMode(e),{"aria-label":`${J(`mode_label`)}: ${J(t?`mode_kids`:`mode_adult`)}`})}open(e,t,n=!0){this.lastFocus=document.activeElement,this.screen.replaceChildren(e),e.classList.add(`panel`),n&&e.classList.add(`dim`),this.current=t,this.syncSponsor(),e.querySelector(`button, select, input`)?.focus({preventScroll:!0})}close(){this.screen.replaceChildren(),this.current=`none`,this.syncSponsor(),this.lastFocus?.focus?.({preventScroll:!0})}title(){if(!this.host.settings.modeChosen){this.modePicker(()=>this.title());return}this.hud.hidden=!0,this.labels.replaceChildren();let e=Z(`div`,{class:`title-panel`}),t=Z(`div`,{class:`top-right langs`},Q(`🌐 ${nu[Au()].native}`,``,()=>this.languages(),{"aria-label":J(`language`),"aria-haspopup":`dialog`})),r=Z(`div`,{class:`top-left`},Q(`⚙️`,`icon-btn`,()=>this.settings(),{"aria-label":J(`settings`)}),Q(`❓`,`icon-btn`,()=>this.showTutorial(()=>this.title()),{"aria-label":J(`tut_how`),title:J(`tut_how`)}),Q(this.songStop?`⏹`:`🎵`,`icon-btn`,()=>void this.toggleSong(),{"aria-label":this.songStop?J(`song_stop`):J(`song`)})),i=bu.get(`best.classic`,0)??0,a=Z(`div`,{class:`menu stack`},Q([Z(`span`,{},`▶ ${J(`play`)}`),Z(`small`,{},J(`classic_desc`))],`btn`,()=>this.begin({mode:`classic`,bagId:`base`,trial:!1})),Q([Z(`span`,{},`📅 ${J(`daily`)}`),Z(`small`,{},J(`daily_desc`))],`btn green`,()=>this.begin({mode:`daily`,bagId:`base`,trial:!1})),Z(`div`,{class:`row three`},Q(`🌿 ${J(`zen`)}`,`btn ghost small`,()=>this.begin({mode:`zen`,bagId:`base`,trial:!1}),{title:J(`zen_desc`)}),Q(`🛒 ${J(`mart`)}`,`btn ghost small`,()=>this.mart()),Q(`📖 ${J(`recipes`)}`,`btn ghost small`,()=>this.recipes())),this.modeButton(()=>this.title()),Z(`div`,{class:`fine`},i?`${J(`local_best`)}: ${Iu(i)} · `:``,J(`disclaimer`)));e.append(r,t,Z(`h1`,{class:`logo`},Z(`img`,{src:`pikko-logo.svg`,alt:`PIKKO`})),Z(`div`,{class:`sub`},J(`subtitle`)),a),this.open(e,`title`,!1),this.host.setView(`title`),n.playMusic(`M10_menu_loop`)}languages(){let e=Z(`div`,{class:`lang-grid`});for(let t of tu){let n=du.find(e=>e.id===nu[t].bag);e.append(Q([...n?[Z(`img`,{class:`lang-bag`,src:n.logo,alt:``})]:[],Z(`b`,{},nu[t].native),Z(`small`,{},t.toUpperCase())],`lang-btn${t===Au()?` on`:``}`,()=>{ju(t).then(()=>this.title())},{lang:t,dir:nu[t].dir,"aria-pressed":String(t===Au())}))}let t=Z(`div`,{class:`card stack`},Z(`div`,{class:`row`,style:`justify-content:space-between`},Z(`h2`,{},`🌐 ${J(`language`)}`),Q(J(`close`),`btn ghost small`,()=>this.title())),e);this.open(Z(`div`,{},t),`languages`)}async toggleSong(){if(this.songStop){this.songStop(),this.songStop=null,n.playMusic(`M10_menu_loop`),this.title();return}n.stopMusic(.4),this.songStop=await n.playTrack(`M01_theme_it_demoA`,1,()=>{this.songStop=null,this.current===`title`&&(n.playMusic(`M10_menu_loop`),this.title())}),this.title()}showHud(){this.hud.hidden=!1,this.host.setView(`game`)}renderHud(e){let t=e.run;this.hud.replaceChildren();let n=Z(`div`,{class:`belly-bar`,role:`meter`,"aria-valuemin":`0`,"aria-valuemax":String(dd),"aria-valuenow":String(t.kcal),"aria-label":J(`belly`)});for(let e of t.log){let t=Z(`div`,{class:`seg ${au(e.grade)?`h`:ou(e.grade)?`j`:`c`}`});t.style.width=`${Math.min(100,e.kcal/dd*100)}%`,n.append(t)}n.append(Z(`div`,{class:`half`}));let r=Z(`div`,{class:`hud-top`},Q(`⏸`,`icon-btn`,()=>this.pause(),{"aria-label":J(`pause`)}),Z(`div`,{class:`belly`},Z(`div`,{class:`belly-head`},Z(`span`,{},`🫙 ${J(`belly`)}`),Z(`span`,{},`${Iu(t.kcal)} / ${Iu(dd)} kcal`)),n),Z(`div`,{class:`score-box`},Z(`div`,{class:`v`},Iu(t.score)),Z(`div`,{class:`l`},J(`score`)))),i=t.habit===`junk`?Z(`span`,{class:`chip habit-junk`},`🍟 ${J(`habit_junk`)}`):t.habit===`healthy`?Z(`span`,{class:`chip habit-healthy`},`🌱 ${J(`habit_healthy`)}`):null,a=Z(`div`,{class:`hud-sub`},Z(`span`,{class:`chip`},`${J(`phase_`+e.phase)} · ${J(`round`,{n:e.round})}${e.cfg.mode===`daily`?` / ${e.maxRounds}`:``}`),e.cfg.trial?Z(`span`,{class:`chip trial`},J(`trial_banner`)):null,i);if(this.hud.append(r,a),e.timerMax>0){let t=Z(`div`,{class:`timer${e.timerLeft<3?` warn`:``}`,id:`timer`},Z(`i`));this.hud.append(t)}let o=Z(`div`,{class:`hint`},matchMedia(`(pointer: fine)`).matches?`${J(`drag_hint`)} · ${J(`key_hint`)}`:J(`drag_hint`));e.round<=2&&!e.cfg.script&&this.hud.append(o),this.factEl=Z(`div`,{class:`fact`}),this.hud.append(this.factEl)}updateTimer(e){let t=document.getElementById(`timer`);if(!t)return;let n=t.firstElementChild;n.style.width=`${e.timerMax?Math.max(0,e.timerLeft/e.timerMax*100):0}%`,t.classList.toggle(`warn`,e.timerLeft<3)}updateLabels(e){let t=e.active?e.labelData():[];for(;this.labels.children.length>t.length;)this.labels.lastElementChild.remove();for(;this.labels.children.length<t.length;)this.labels.append(Z(`div`,{class:`plate-label`}));t.forEach((e,t)=>{let n=this.labels.children[t],r=`${e.food.id}|${Au()}`;n.dataset.key!==r&&(n.dataset.key=r,n.replaceChildren(Z(`span`,{},Lu(e.food)),Z(`small`,{},`${Iu(e.food.kcal)} kcal · ${e.food.qty} ${e.food.unit}`)));let i=this.labels.clientHeight||window.innerHeight;n.style.left=`${e.x}px`,n.style.top=`${Math.min(e.y,i-96)}px`,n.classList.toggle(`sel`,e.sel)})}toast(e,t=``){let n=Z(`div`,{class:`toast ${t}`},e);for(this.toasts.append(n),setTimeout(()=>n.remove(),1700);this.toasts.children.length>4;)this.toasts.firstElementChild.remove()}fact(e,t){this.factEl&&(this.factEl.textContent=e,this.factEl.className=`fact show ${t===!0?`good`:t===!1?`bad`:``}`,clearTimeout(this.factTimer),this.factTimer=window.setTimeout(()=>this.factEl?.classList.remove(`show`),3200))}pause(){if(this.host.setPaused(!0),this.host.game.cfg.script){let e=Z(`div`,{class:`card stack`},Z(`h2`,{},J(`pause`)),Q(J(`resume`),`btn`,()=>{this.close(),this.host.setPaused(!1)}),Q(J(`tut_coach_skip`),`btn ghost`,()=>{this.close(),this.host.setPaused(!1),this.tutorial.finish()}));this.open(Z(`div`,{},e),`pause`);return}let e=Z(`div`,{class:`card stack`},Z(`h2`,{},J(`pause`)),Q(J(`resume`),`btn`,()=>{this.close(),this.host.setPaused(!1)}),Q(J(`restart`),`btn ghost`,()=>{this.close(),this.host.start({...this.host.game.cfg,seed:(this.host.game.cfg.mode,void 0)})}),Q(`❓ ${J(`tut_how`)}`,`btn ghost`,()=>this.showTutorial(()=>this.pause(),!1)),Q(J(`settings`),`btn ghost`,()=>this.settings(()=>this.pause())),Q(J(`quit`),`btn ghost`,()=>{this.close(),this.host.toTitle()}));this.open(Z(`div`,{},e),`pause`)}results(e,t,n){this.hud.hidden=!0,this.labels.replaceChildren();let r=e.kcal?Math.round(e.kcalHealthy/e.kcal*100):100,i=t.mode===`daily`?J(`daily`):t.mode===`zen`?J(`zen`):J(`play`),a=t.mode===`daily`?`#${n.daily}`:t.bagId===`base`?``:(()=>{let e=du.find(e=>e.id===t.bagId);return e?Ru(e):``})(),o=Ip(e,{modeLabel:i,dailyTag:a}),s=Z(`img`,{class:`receipt-img`,alt:J(`share_receipt`)});o.toBlob(e=>{e&&(s.src=URL.createObjectURL(e))});let c=Z(`div`,{class:`stack`},Q(`▶ ${J(`play_again`)}`,`btn`,()=>this.run({...t,seed:void 0})),Z(`div`,{class:`row`},Q(`🧾 ${J(`share_receipt`)}`,`btn green small`,()=>void this.shareReceipt(o)),Q(`📋 ${J(`share_text`)}`,`btn ghost small`,()=>void this.copyText(Lp(e,a||i))),t.mode===`daily`?null:Q(`🎯 ${J(`challenge`)}`,`btn ghost small`,()=>void this.copyText(`${J(`share_title`)}\n${location.origin}${location.pathname}?seed=${t.seed}`)),$l()?Q(`🎬 ${J(`bleah_cam_save`)}`,`btn ghost small`,()=>this.saveClip()):null),Q(J(`quit`),`btn ghost`,()=>{this.close(),this.host.toTitle()})),l=Z(`div`,{class:`card results`},Z(`h2`,{},J(`results`)),Z(`div`,{class:`outcome ${e.outcome}`},e.outcome===`victory`?`🌱 ${J(`victory`)}`:`🤢 ${J(`defeat`)}`),Z(`p`,{},J(`outcome_rule`)),Z(`div`,{class:`big`},Iu(e.score)),t.trial?Z(`div`,{class:`note`},J(`trial_end`)):Z(`div`,{class:`fine`},n.newBest?`🏆 ${J(`new_best`)}`:`${J(`local_best`)}: ${Iu(n.best)}`),Z(`div`,{class:`stats`},Z(`div`,{class:`stat`},Z(`b`,{},Iu(e.kcal)),Z(`span`,{},J(`kcal_eaten`))),Z(`div`,{class:`stat`},Z(`b`,{},`${r}%`),Z(`span`,{},J(`healthy_share`))),Z(`div`,{class:`stat`},Z(`b`,{},`×${e.bestCombo}`),Z(`span`,{},J(`best_combo`)))),Z(`div`,{class:`fine`},Pu(`bites`,e.bites)),s,c);this.open(Z(`div`,{},l),`results`)}async shareReceipt(e){let t=await new Promise(t=>e.toBlob(t,`image/png`));if(!t)return;let n=new File([t],`pikko-receipt.png`,{type:`image/png`});try{if(navigator.canShare?.({files:[n]})){await navigator.share({files:[n],title:J(`share_title`)});return}}catch{return}this.download(t,`pikko-receipt.png`)}async copyText(e){try{await navigator.clipboard.writeText(e),this.toast(J(`copied`),`good`)}catch{window.prompt(``,e)}}saveClip(){let e=$l();e&&(n.play(`shutter`,.8),this.download(e,`pikko-bleah.${e.type.includes(`mp4`)?`mp4`:`webm`}`))}download(e,t){let n=Z(`a`,{href:URL.createObjectURL(e),download:t});document.body.append(n),n.click(),n.remove()}mart(e=`base`){n.playMusic(`M17_mart_loop`),n.play(`mart_cart`,.5);let t=Z(`div`,{class:`mart-grid`}),r=nu[Au()].bag,i=e=>e.id===`base`?0:e.id===r?1:2;for(let a of[...du].sort((e,t)=>i(e)-i(t))){let i=tp(a.id),o=bu.get(`unlocked.${a.id}`),s=!!o&&(o.until===null||o.until*1e3>Date.now()),c=!this.host.settings.kidMode,l=`${a.id===r?`📍 `:``}${a.id===`base`?J(`mart_free`):c||s?`🔓`:i?`🔒`:`⏳`}`;t.append(Q([Z(`span`,{class:`tag`},l),Z(`img`,{class:`bag-logo`,src:a.logo,alt:``,loading:`lazy`}),Z(`b`,{},Ru(a)),Z(`small`,{},J(`mart_foods`,{h:a.foods.filter(e=>au(e.grade)).length,j:a.foods.filter(e=>ou(e.grade)).length}))],`bag${a.id===`base`?` free`:``}${a.id===r?` home`:``}`,()=>{n.play(`mart_bag`,.7),this.mart(a.id)},{"aria-pressed":String(a.id===e),"aria-label":Ru(a)}))}let a=du.find(t=>t.id===e),o={italy:`B01_mediterranean`,poland:`B02_polish_pantry`}[e];o?n.playMusic(o):n.playMusic(`M17_mart_loop`);let s=Z(`div`,{class:`card`},Z(`div`,{class:`row`,style:`justify-content:space-between`},Z(`h2`,{},`🛒 ${J(`mart_title`)}`),Q(J(`close`),`btn ghost small`,()=>this.host.toTitle())),Z(`p`,{},J(`mart_sub`)),this.host.settings.kidMode?null:Z(`div`,{class:`note`},`📣 ${J(`mart_adult_note`)}`),t,this.bagDetail(a));this.open(Z(`div`,{},s),`mart`),e!==`base`&&s.querySelector(`.bag-detail`)?.scrollIntoView({block:`start`}),this.syncPass(e)}lastPassSync=0;async syncPass(e){let t=wf();if(!t||!$f()||Date.now()-this.lastPassSync<6e4)return;this.lastPassSync=Date.now();let n=await ap(t);if(n.kind!==`unlocked`&&n.kind!==`locked`)return;let r=JSON.stringify(du.map(e=>bu.get(`unlocked.${e.id}`)));this.cachePass(n),r!==JSON.stringify(du.map(e=>bu.get(`unlocked.${e.id}`)))&&this.current===`mart`&&this.mart(e)}cachePass(e){for(let t of du)t.id===`base`||Qf(t.id)?.verified||bu.set(`unlocked.${t.id}`,e.kind===`unlocked`?{until:e.until}:null)}bagDetail(e){let t=Z(`div`,{class:`foods-preview`});for(let n of e.foods)t.append(Z(`span`,{class:au(n.grade)?`h`:ou(n.grade)?`j`:``},Lu(n)));let n=Z(`div`,{class:`bag-detail stack`},Z(`div`,{class:`bag-head`},Z(`img`,{class:`bag-logo-big`,src:e.logo,alt:Ru(e)}),Z(`div`,{},Z(`h2`,{},Ru(e)),Z(`div`,{class:`fine`,style:`text-align:start`},J(`mart_accessory`,{acc:zu(e)})))),Z(`div`,{class:`note`},`🌍 ${Bu(e)}`),t);if(e.id===`base`)return n.append(Q(`▶ ${J(`mart_play`)}`,`btn`,()=>this.run({mode:`classic`,bagId:`base`,trial:!1}))),n;if(!this.host.settings.kidMode)return n.append(Q(`▶ ${J(`mart_play`)}`,`btn`,()=>this.run({mode:`classic`,bagId:e.id,trial:!1}))),n;let r=tp(e.id),i=bu.get(`unlocked.${e.id}`);return n.append(Q(`🧪 ${J(`mart_trial`)}`,`btn green`,()=>this.run({mode:`classic`,bagId:e.id,trial:!0}))),r&&i&&n.append(Q(`▶ ${J(`mart_play`)}`,`btn`,()=>void this.playLive(e))),n.append(Q(`🔓 ${J(`mart_unlock`)}`,`btn ghost`,()=>this.adultGate(()=>this.unlock(e)))),r||n.append(Z(`div`,{class:`note`},`⏳ ${J(`mart_soon`)}`)),n}async playLive(e){(await op(e.id,wf())).kind===`unlocked`?this.run({mode:`classic`,bagId:e.id,trial:!1}):this.unlock(e)}adultGate(e,t=()=>this.mart()){let n=6+Math.floor(Math.random()*4),r=6+Math.floor(Math.random()*4),i=Z(`input`,{type:`number`,inputmode:`numeric`,"aria-label":J(`adult_q`,{a:n,b:r})}),a=Z(`p`,{}),o=Z(`div`,{class:`card stack`},Z(`h2`,{},`🔐 ${J(`adult_title`)}`),Z(`p`,{},J(`adult_q`,{a:n,b:r})),i,a,Z(`div`,{class:`row`},Q(J(`adult_ok`),`btn`,()=>{Number(i.value)===n*r?e():a.textContent=J(`adult_wrong`)}),Q(J(`back`),`btn ghost`,t)));this.open(Z(`div`,{},o),`adult`)}unlock(e){let t=$f()??Qf(e.id),n=tp(e.id),r=Z(`p`,{"aria-live":`polite`}),i=Z(`div`,{class:`row`}),a=t=>{u(),i.replaceChildren();let c=wf();if(c){let e=Tf();i.append(Z(`span`,{class:`chip`},J(`connected`,{w:`${e?`${e} · `:``}${c.slice(0,4)}…${c.slice(-4)}`})),Q(J(`disconnect`),`btn ghost small`,()=>{Cf().then(()=>a(null))})),n&&i.append(Q(J(`recheck`),`btn small`,()=>void s()))}else{let e=bf(),t=Of()&&!e.some(e=>e.kind===`phantom`||e.name!==`Mobile Wallet Adapter`);if(i.append(Z(`span`,{class:`chip wallet-found`},t?`⚠️ ${J(`wallet_inapp`)}`:e.length?`✅ ${J(`wallet_detected`,{name:e.map(e=>e.label).join(` · `)})}`:`⚠️ ${J(`wallet_none`)}`)),t&&i.append(Z(`a`,{class:`btn small`,href:kf()},J(`wallet_open_chrome`)),Q(J(`wallet_copy_link`),`btn ghost small`,()=>{navigator.clipboard.writeText(Af()).then(()=>{r.textContent=J(`wallet_link_copied`)},()=>{window.prompt(``,Af())})})),e.length>1)for(let t of e)i.append(Q([...t.icon?[Z(`img`,{class:`wallet-icon`,src:t.icon,alt:``})]:[],Z(`span`,{},t.label)],`btn small`,()=>void o(t.id)));else i.append(Q(J(`connect`),`btn small`,()=>void o()));(!e.length||t)&&Df()&&i.append(Z(`a`,{class:`btn ghost small`,href:jf()},J(`open_in_phantom`)))}t&&(t.kind===`checking`?r.textContent=J(`checking`):t.kind===`unlocked`?(r.textContent=J(`mart_unlocked_until`,{date:t.until?Hu(t.until):`—`}),t.via===`pass`?this.cachePass(t):bu.set(`unlocked.${e.id}`,{until:t.until})):t.kind===`locked`?(r.textContent=J(`mart_locked`),bu.set(`unlocked.${e.id}`,null),$f()&&this.cachePass(t)):t.kind===`unavailable`?r.textContent=J(`check_failed`):t.kind===`not_configured`&&(r.textContent=J(`mart_soon`)))},o=async e=>{r.textContent=J(`wallet_connecting`);try{await Sf(e),r.textContent=``,a(null),n&&await s()}catch(e){let t=e instanceof Error?e.message:``,n=e?.code??e?.cause?.code;r.textContent=t===`wallet_missing`?J(`phantom_missing`):t===`wallet_not_found`?J(`wallet_notfound_help`):t===`wallet_blocked`?J(`wallet_blocked_help`):`${J(`wallet_rejected`)}${typeof n==`string`&&/^ERROR_[A-Z_]+$/.test(n)?` (${n})`:``}`}},s=async()=>{a({kind:`checking`}),a(await op(e.id,wf()))},c=Z(`p`,{"aria-live":`polite`}),l=Q(`💳 ${J(`pay_button`,{amount:lp})}`,`btn small`,()=>void f()),u=()=>{l.disabled=!wf()},d={has:e=>(bu.get(`paid.sigs`,[])??[]).includes(e),add:e=>bu.set(`paid.sigs`,[...bu.get(`paid.sigs`,[])??[],e].slice(-50))},f=async()=>{let t=wf();if(!t)return;l.disabled=!0,c.textContent=J(`pay_waiting`);let n=await pp(t,{rpc:(e,t)=>mp(e,t),send:e=>Ef(e),now:Date.now,sleep:e=>new Promise(t=>setTimeout(t,e)),used:d});if(n.ok){c.textContent=J(`pay_ok`),this.run({mode:`classic`,bagId:e.id,trial:!1});return}c.textContent=n.reason===`rejected`?J(`pay_rejected`):n.reason===`no_send`?J(`pay_nosend`):J(`pay_failed`),u()},p=n&&t?`${Iu(Number(t.minimumTokens))}${t===Gf?` PASTA`:``} (${t.mint})`:`—`,m=Z(`div`,{class:`card stack`},Z(`h2`,{},`🔓 ${Ru(e)}`),Z(`p`,{class:`onboard`},J(`onboarding`,{token:p,bag:Ru(e)})),n?null:Z(`div`,{class:`note`},J(`not_configured_note`)),t===Gf?Z(`div`,{class:`note`},`🍝 ${J(`pass_note`,{amount:Iu(Number(Gf.minimumTokens))})}`):null,i,r,Z(`div`,{class:`note stack`},Z(`b`,{},`💳 ${J(`pay_title`)}`),Z(`p`,{title:sp},J(`pay_desc`,{amount:lp,to:`${sp.slice(0,4)}…${sp.slice(-4)}`})),l,c),Z(`div`,{class:`row`},Z(`a`,{class:`btn ghost small`,href:qf.app,target:`_blank`,rel:`noopener`},J(`lock_on_devfridge`)),Z(`a`,{class:`btn ghost small`,href:n&&t?.mint?`${qf.scan}/?mint=${t.mint}`:qf.scan,target:`_blank`,rel:`noopener`},J(`scan_link`))),Z(`div`,{class:`fine`},J(`ux_only_note`)),Q(J(`back`),`btn ghost`,()=>this.mart(e.id)));this.open(Z(`div`,{},m),`unlock`),a(null);let h=xf(()=>{this.current===`unlock`?wf()||a(null):h()})}recipes(){let e=bu.get(`recipes`,{})??{},t=du.flatMap(e=>e.foods),n=Z(`div`,{class:`recipes-grid`}),r=Object.keys(e).filter(e=>fu.has(e));for(let t of du){let i=r.filter(e=>fu.get(e).bag===t.id);if(i.length){n.append(Z(`div`,{class:`recipe-country`},Z(`img`,{src:t.logo,alt:``}),Z(`b`,{},`${Ru(t)} · ${i.length}/${t.foods.length}`)));for(let t of i){let r=fu.get(t);n.append(Z(`div`,{class:`recipe ${au(r.grade)?`h`:ou(r.grade)?`j`:``}`},`${Lu(r)} ×${e[t]}`))}}}let i=Z(`div`,{class:`card`},Z(`div`,{class:`row`,style:`justify-content:space-between`},Z(`h2`,{},`📖 ${J(`recipes_title`)}`),Q(J(`close`),`btn ghost small`,()=>this.host.toTitle())),Z(`p`,{},J(`recipes_count`,{n:r.length,t:t.length})),r.length?n:Z(`p`,{},J(`recipes_empty`)));this.open(Z(`div`,{},i),`recipes`)}settings(e){let t=this.host.settings,n=Z(`select`,{"aria-label":J(`language`)});for(let e of tu)n.append(Z(`option`,{value:e,...e===Au()?{selected:``}:{}},nu[e].native));n.addEventListener(`change`,()=>{ju(n.value).then(()=>this.settings(e))});let r=Z(`select`,{"aria-label":J(`quality`)});for(let e of[`high`,`medium`,`low`])r.append(Z(`option`,{value:e,...e===t.quality?{selected:``}:{}},J(`q_`+e)));r.addEventListener(`change`,()=>{t.quality=r.value,this.host.applySettings()});let i=Q(t.sound?`🔊 ${J(`on`)}`:`🔇 ${J(`off`)}`,`btn ghost small`,()=>{t.sound=!t.sound,this.host.applySettings(),this.settings(e)}),a=Z(`div`,{class:`card stack`},Z(`h2`,{},`⚙️ ${J(`settings`)}`),Z(`label`,{class:`field`},J(`language`),n),Z(`div`,{class:`switch`},Z(`span`,{},J(`sound`)),i),Z(`label`,{class:`field`},J(`quality`),r),Z(`div`,{class:`switch`},Z(`span`,{},J(`mode_label`)),this.modeButton(()=>this.settings(e))),Q(`❓ ${J(`tut_again`)}`,`btn ghost small`,()=>this.showTutorial(()=>this.settings(e))),Z(`p`,{class:`fine`},J(`blockout_note`)),Z(`p`,{class:`fine`},J(`disclaimer`)),Q(J(`back`),`btn`,()=>e?e():this.host.toTitle()));this.open(Z(`div`,{},a),`settings`)}};function tm(e){let t=bu.get(`recipes`,{})??{},n=!t[e.id];return t[e.id]=(t[e.id]??0)+1,bu.set(`recipes`,t),n}var nm=document.getElementById(`boot`),rm=document.getElementById(`boot-msg`);await Mu();function im(){try{let e=document.createElement(`canvas`);return!!(e.getContext(`webgl2`)||e.getContext(`webgl`))}catch{return!1}}im()?(rm.textContent=J(`loading`),am()):rm.textContent=J(`webgl_missing`);function am(){let e={sound:!0,quality:om(),kidMode:!0,...bu.get(`settings`,{})??{}},t=new Uf(document.getElementById(`stage`)),r=matchMedia(`(prefers-reduced-motion: reduce)`),i=new Bf(e.quality===`high`);i.reducedMotion=r.matches;let a,o=new Ld(t,i,{hud:()=>a.renderHud(o),toast:(e,t)=>a.toast(e,t),fact:(e,t)=>a.fact(e,t),scriptBite:(e,t,n)=>a.tutorialBite(e,t,n),scriptReady:()=>a.tutorialReady(),discovered:e=>{tm(e)&&n.play(`page_turn`,.5)},ended:(e,t)=>{let r=0,i=!1;if(!t.trial){let n=t.mode===`daily`?`best.daily.${o.dailyNumber}`:t.bagId===`base`?`best.${t.mode}`:`best.bag.${t.bagId}`;r=bu.get(n,0)??0,e.score>r&&(bu.set(n,e.score),i=r>0,r=e.score)}n.playTrack(`M18_results`,.8),a.results(e,t,{best:r,newBest:i,daily:o.dailyNumber})}}),s={game:o,settings:e,start(e){n.unlock(),n.stopTrack(),a.close(),a.showHud(),o.start(e)},applySettings(){bu.set(`settings`,e),n.setMuted(!e.sound),t.setQuality(e.quality)},toTitle(){o.quit(),i.reset(),i.setAccessory(`base`),n.stopTrack(),a.title()},setPaused(e){o.setPaused(e)},setView(e){t.setView(e)},stopGame(){o.quit(),i.reset(),i.setAccessory(`base`),n.stopTrack(),n.playMusic(`M10_menu_loop`),t.setView(`title`)}};a=new em(s),t.setQuality(e.quality),i.setAccessory(`base`),vf(),window.addEventListener(`keydown`,e=>{if(e.key===`Escape`){a.current===`none`&&o.active?a.pause():a.current===`pause`&&(a.close(),s.setPaused(!1));return}a.current===`none`&&[`1`,`2`,`ArrowLeft`,`ArrowRight`,`Enter`,` `].includes(e.key)&&(e.preventDefault(),o.key(e.key))}),document.addEventListener(`visibilitychange`,()=>{document.hidden&&(n.suspend(),o.active&&a.current===`none`&&a.pause())}),window.addEventListener(`pointerdown`,()=>{n.running||n.unlock()},{passive:!0});let c=t.renderer.domElement;c.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),s.setPaused(!0),nm.hidden=!1,rm.textContent=J(`webgl_lost`)}),c.addEventListener(`webglcontextrestored`,()=>{nm.hidden=!0,o.active&&a.pause()});let l=performance.now(),u=0,d=1/60,f=e=>{if(requestAnimationFrame(f),document.hidden){l=e;return}let n=Math.min(.1,(e-l)/1e3);l=e,u+=n;let s=0;for(;u>=d&&s<5;)o.update(d),u-=d,s++;s===5&&(u=0),n=Math.max(n,1e-4),i.update(n,t.camera),t.render(n,r.matches),a.updateLabels(o),o.active&&a.updateTimer(o)};requestAnimationFrame(f),rm.replaceChildren();let p=document.createElement(`button`);p.className=`btn`,p.textContent=J(`tap_start`),rm.append(p),p.focus();let m=new URLSearchParams(location.search),h=Number(m.get(`seed`));p.addEventListener(`click`,async()=>{await n.unlock(),n.setMuted(!e.sound),nm.hidden=!0,Number.isFinite(h)&&h>0?a.run({mode:`classic`,bagId:`base`,trial:!1,seed:h>>>0}):a.title()},{once:!0})}function om(){let e=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent),t=navigator.hardwareConcurrency||4;return!e&&t>=6?`high`:e&&t<=4?`low`:`medium`}