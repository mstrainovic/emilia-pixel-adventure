(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const co="183",Vc=0,Fo=1,Wc=2,nr=1,Xc=2,fs=3,ni=0,Kt=1,Cn=2,Pn=0,Gi=1,ms=2,No=3,Oo=4,qc=5,mi=100,Yc=101,$c=102,Kc=103,jc=104,Zc=200,Qc=201,Jc=202,eh=203,fa=204,pa=205,th=206,nh=207,ih=208,sh=209,rh=210,ah=211,oh=212,lh=213,ch=214,ma=0,ga=1,_a=2,Wi=3,xa=4,va=5,ya=6,Sa=7,$l=0,hh=1,dh=2,Dn=0,Kl=1,jl=2,Zl=3,Ql=4,Jl=5,ec=6,tc=7,nc=300,vi=301,Xi=302,Er=303,wr=304,xr=306,Ma=1e3,xn=1001,ba=1002,Pe=1003,uh=1004,Ps=1005,vt=1006,Tr=1007,_i=1008,tn=1009,ic=1010,sc=1011,gs=1012,ho=1013,In=1014,vn=1015,nn=1016,uo=1017,fo=1018,_s=1020,rc=35902,ac=35899,oc=1021,lc=1022,yn=1023,Gn=1026,xi=1027,po=1028,mo=1029,qi=1030,go=1031,_o=1033,ir=33776,sr=33777,rr=33778,ar=33779,Ea=35840,wa=35841,Ta=35842,Aa=35843,Ca=36196,Ra=37492,Pa=37496,Da=37488,Ia=37489,La=37490,Ua=37491,Fa=37808,Na=37809,Oa=37810,Ba=37811,ka=37812,za=37813,Ha=37814,Ga=37815,Va=37816,Wa=37817,Xa=37818,qa=37819,Ya=37820,$a=37821,Ka=36492,ja=36494,Za=36495,Qa=36283,Ja=36284,eo=36285,to=36286,fh=3200,cc=0,ph=1,ei="",pt="srgb",Yi="srgb-linear",ur="linear",tt="srgb",bi=7680,Bo=519,mh=512,gh=513,_h=514,xo=515,xh=516,vh=517,vo=518,yh=519,ko=35044,zo="300 es",Rn=2e3,xs=2001;function Sh(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function vs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Mh(){const i=vs("canvas");return i.style.display="block",i}const Ho={};function Go(...i){const e="THREE."+i.shift();console.log(e,...i)}function hc(i){const e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Le(...i){i=hc(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function je(...i){i=hc(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function fr(...i){const e=i.join(" ");e in Ho||(Ho[e]=!0,Le(...i))}function bh(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const Eh={[ma]:ga,[_a]:ya,[xa]:Sa,[Wi]:va,[ga]:ma,[ya]:_a,[Sa]:xa,[va]:Wi};class Zi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const Ot=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ar=Math.PI/180,no=180/Math.PI;function Ms(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ot[i&255]+Ot[i>>8&255]+Ot[i>>16&255]+Ot[i>>24&255]+"-"+Ot[e&255]+Ot[e>>8&255]+"-"+Ot[e>>16&15|64]+Ot[e>>24&255]+"-"+Ot[t&63|128]+Ot[t>>8&255]+"-"+Ot[t>>16&255]+Ot[t>>24&255]+Ot[n&255]+Ot[n>>8&255]+Ot[n>>16&255]+Ot[n>>24&255]).toLowerCase()}function Xe(i,e,t){return Math.max(e,Math.min(t,i))}function wh(i,e){return(i%e+e)%e}function Cr(i,e,t){return(1-t)*i+t*e}function es(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function $t(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class Ue{constructor(e=0,t=0){Ue.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Qi{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3],d=r[a+0],m=r[a+1],g=r[a+2],x=r[a+3];if(u!==x||l!==d||c!==m||h!==g){let f=l*d+c*m+h*g+u*x;f<0&&(d=-d,m=-m,g=-g,x=-x,f=-f);let p=1-o;if(f<.9995){const M=Math.acos(f),T=Math.sin(M);p=Math.sin(p*M)/T,o=Math.sin(o*M)/T,l=l*p+d*o,c=c*p+m*o,h=h*p+g*o,u=u*p+x*o}else{l=l*p+d*o,c=c*p+m*o,h=h*p+g*o,u=u*p+x*o;const M=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=M,c*=M,h*=M,u*=M}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[a],d=r[a+1],m=r[a+2],g=r[a+3];return e[t]=o*g+h*u+l*m-c*d,e[t+1]=l*g+h*d+c*u-o*m,e[t+2]=c*g+h*m+o*d-l*u,e[t+3]=h*g-o*u-l*d-c*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),u=o(r/2),d=l(n/2),m=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=d*h*u+c*m*g,this._y=c*m*u-d*h*g,this._z=c*h*g+d*m*u,this._w=c*h*u-d*m*g;break;case"YXZ":this._x=d*h*u+c*m*g,this._y=c*m*u-d*h*g,this._z=c*h*g-d*m*u,this._w=c*h*u+d*m*g;break;case"ZXY":this._x=d*h*u-c*m*g,this._y=c*m*u+d*h*g,this._z=c*h*g+d*m*u,this._w=c*h*u-d*m*g;break;case"ZYX":this._x=d*h*u-c*m*g,this._y=c*m*u+d*h*g,this._z=c*h*g-d*m*u,this._w=c*h*u+d*m*g;break;case"YZX":this._x=d*h*u+c*m*g,this._y=c*m*u+d*h*g,this._z=c*h*g-d*m*u,this._w=c*h*u-d*m*g;break;case"XZY":this._x=d*h*u-c*m*g,this._y=c*m*u-d*h*g,this._z=c*h*g+d*m*u,this._w=c*h*u+d*m*g;break;default:Le("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+o+u;if(d>0){const m=.5/Math.sqrt(d+1);this._w=.25/m,this._x=(h-l)*m,this._y=(r-c)*m,this._z=(a-s)*m}else if(n>o&&n>u){const m=2*Math.sqrt(1+n-o-u);this._w=(h-l)/m,this._x=.25*m,this._y=(s+a)/m,this._z=(r+c)/m}else if(o>u){const m=2*Math.sqrt(1+o-n-u);this._w=(r-c)/m,this._x=(s+a)/m,this._y=.25*m,this._z=(l+h)/m}else{const m=2*Math.sqrt(1+u-n-o);this._w=(a-s)/m,this._x=(r+c)/m,this._y=(l+h)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Xe(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class F{constructor(e=0,t=0,n=0){F.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Vo.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Vo.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),h=2*(o*t-r*s),u=2*(r*n-a*t);return this.x=t+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Rr.copy(this).projectOnVector(e),this.sub(Rr)}reflect(e){return this.sub(Rr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Rr=new F,Vo=new Qi;class ke{constructor(e,t,n,s,r,a,o,l,c){ke.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){const h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],m=n[5],g=n[8],x=s[0],f=s[3],p=s[6],M=s[1],T=s[4],w=s[7],R=s[2],S=s[5],A=s[8];return r[0]=a*x+o*M+l*R,r[3]=a*f+o*T+l*S,r[6]=a*p+o*w+l*A,r[1]=c*x+h*M+u*R,r[4]=c*f+h*T+u*S,r[7]=c*p+h*w+u*A,r[2]=d*x+m*M+g*R,r[5]=d*f+m*T+g*S,r[8]=d*p+m*w+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,d=o*l-h*r,m=c*r-a*l,g=t*u+n*d+s*m;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/g;return e[0]=u*x,e[1]=(s*c-h*n)*x,e[2]=(o*n-s*a)*x,e[3]=d*x,e[4]=(h*t-s*l)*x,e[5]=(s*r-o*t)*x,e[6]=m*x,e[7]=(n*l-c*t)*x,e[8]=(a*t-n*r)*x,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Pr.makeScale(e,t)),this}rotate(e){return this.premultiply(Pr.makeRotation(-e)),this}translate(e,t){return this.premultiply(Pr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Pr=new ke,Wo=new ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Xo=new ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Th(){const i={enabled:!0,workingColorSpace:Yi,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===tt&&(s.r=Hn(s.r),s.g=Hn(s.g),s.b=Hn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===tt&&(s.r=Vi(s.r),s.g=Vi(s.g),s.b=Vi(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===ei?ur:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return fr("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return fr("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Yi]:{primaries:e,whitePoint:n,transfer:ur,toXYZ:Wo,fromXYZ:Xo,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:pt},outputColorSpaceConfig:{drawingBufferColorSpace:pt}},[pt]:{primaries:e,whitePoint:n,transfer:tt,toXYZ:Wo,fromXYZ:Xo,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:pt}}}),i}const $e=Th();function Hn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Vi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Ei;class Ah{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ei===void 0&&(Ei=vs("canvas")),Ei.width=e.width,Ei.height=e.height;const s=Ei.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Ei}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=vs("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Hn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Hn(t[n]/255)*255):t[n]=Hn(t[n]);return{data:t,width:e.width,height:e.height}}else return Le("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Ch=0;class yo{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Ch++}),this.uuid=Ms(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Dr(s[a].image)):r.push(Dr(s[a]))}else r=Dr(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function Dr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Ah.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Le("Texture: Unable to serialize Texture."),{})}let Rh=0;const Ir=new F;class Lt extends Zi{constructor(e=Lt.DEFAULT_IMAGE,t=Lt.DEFAULT_MAPPING,n=xn,s=xn,r=vt,a=_i,o=yn,l=tn,c=Lt.DEFAULT_ANISOTROPY,h=ei){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Rh++}),this.uuid=Ms(),this.name="",this.source=new yo(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ue(0,0),this.repeat=new Ue(1,1),this.center=new Ue(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Ir).x}get height(){return this.source.getSize(Ir).y}get depth(){return this.source.getSize(Ir).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){Le(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Le(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==nc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ma:e.x=e.x-Math.floor(e.x);break;case xn:e.x=e.x<0?0:1;break;case ba:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ma:e.y=e.y-Math.floor(e.y);break;case xn:e.y=e.y<0?0:1;break;case ba:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Lt.DEFAULT_IMAGE=null;Lt.DEFAULT_MAPPING=nc;Lt.DEFAULT_ANISOTROPY=1;class xt{constructor(e=0,t=0,n=0,s=1){xt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],m=l[5],g=l[9],x=l[2],f=l[6],p=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-x)<.01&&Math.abs(g-f)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+x)<.1&&Math.abs(g+f)<.1&&Math.abs(c+m+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const T=(c+1)/2,w=(m+1)/2,R=(p+1)/2,S=(h+d)/4,A=(u+x)/4,v=(g+f)/4;return T>w&&T>R?T<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(T),s=S/n,r=A/n):w>R?w<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(w),n=S/s,r=v/s):R<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(R),n=A/r,s=v/r),this.set(n,s,r,t),this}let M=Math.sqrt((f-g)*(f-g)+(u-x)*(u-x)+(d-h)*(d-h));return Math.abs(M)<.001&&(M=1),this.x=(f-g)/M,this.y=(u-x)/M,this.z=(d-h)/M,this.w=Math.acos((c+m+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this.w=Xe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this.w=Xe(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Ph extends Zi{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:vt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new xt(0,0,e,t),this.scissorTest=!1,this.viewport=new xt(0,0,e,t),this.textures=[];const s={width:e,height:t,depth:n.depth},r=new Lt(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:vt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new yo(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class jt extends Ph{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class dc extends Lt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Pe,this.minFilter=Pe,this.wrapR=xn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Dh extends Lt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Pe,this.minFilter=Pe,this.wrapR=xn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class mt{constructor(e,t,n,s,r,a,o,l,c,h,u,d,m,g,x,f){mt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,h,u,d,m,g,x,f)}set(e,t,n,s,r,a,o,l,c,h,u,d,m,g,x,f){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=d,p[3]=m,p[7]=g,p[11]=x,p[15]=f,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new mt().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinant()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();const t=this.elements,n=e.elements,s=1/wi.setFromMatrixColumn(e,0).length(),r=1/wi.setFromMatrixColumn(e,1).length(),a=1/wi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const d=a*h,m=a*u,g=o*h,x=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=m+g*c,t[5]=d-x*c,t[9]=-o*l,t[2]=x-d*c,t[6]=g+m*c,t[10]=a*l}else if(e.order==="YXZ"){const d=l*h,m=l*u,g=c*h,x=c*u;t[0]=d+x*o,t[4]=g*o-m,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=m*o-g,t[6]=x+d*o,t[10]=a*l}else if(e.order==="ZXY"){const d=l*h,m=l*u,g=c*h,x=c*u;t[0]=d-x*o,t[4]=-a*u,t[8]=g+m*o,t[1]=m+g*o,t[5]=a*h,t[9]=x-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const d=a*h,m=a*u,g=o*h,x=o*u;t[0]=l*h,t[4]=g*c-m,t[8]=d*c+x,t[1]=l*u,t[5]=x*c+d,t[9]=m*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const d=a*l,m=a*c,g=o*l,x=o*c;t[0]=l*h,t[4]=x-d*u,t[8]=g*u+m,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=m*u+g,t[10]=d-x*u}else if(e.order==="XZY"){const d=a*l,m=a*c,g=o*l,x=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+x,t[5]=a*h,t[9]=m*u-g,t[2]=g*u-m,t[6]=o*h,t[10]=x*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Ih,e,Lh)}lookAt(e,t,n){const s=this.elements;return Qt.subVectors(e,t),Qt.lengthSq()===0&&(Qt.z=1),Qt.normalize(),Xn.crossVectors(n,Qt),Xn.lengthSq()===0&&(Math.abs(n.z)===1?Qt.x+=1e-4:Qt.z+=1e-4,Qt.normalize(),Xn.crossVectors(n,Qt)),Xn.normalize(),Ds.crossVectors(Qt,Xn),s[0]=Xn.x,s[4]=Ds.x,s[8]=Qt.x,s[1]=Xn.y,s[5]=Ds.y,s[9]=Qt.y,s[2]=Xn.z,s[6]=Ds.z,s[10]=Qt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],m=n[13],g=n[2],x=n[6],f=n[10],p=n[14],M=n[3],T=n[7],w=n[11],R=n[15],S=s[0],A=s[4],v=s[8],b=s[12],X=s[1],C=s[5],k=s[9],z=s[13],q=s[2],B=s[6],G=s[10],U=s[14],te=s[3],Z=s[7],ue=s[11],_e=s[15];return r[0]=a*S+o*X+l*q+c*te,r[4]=a*A+o*C+l*B+c*Z,r[8]=a*v+o*k+l*G+c*ue,r[12]=a*b+o*z+l*U+c*_e,r[1]=h*S+u*X+d*q+m*te,r[5]=h*A+u*C+d*B+m*Z,r[9]=h*v+u*k+d*G+m*ue,r[13]=h*b+u*z+d*U+m*_e,r[2]=g*S+x*X+f*q+p*te,r[6]=g*A+x*C+f*B+p*Z,r[10]=g*v+x*k+f*G+p*ue,r[14]=g*b+x*z+f*U+p*_e,r[3]=M*S+T*X+w*q+R*te,r[7]=M*A+T*C+w*B+R*Z,r[11]=M*v+T*k+w*G+R*ue,r[15]=M*b+T*z+w*U+R*_e,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],m=e[14],g=e[3],x=e[7],f=e[11],p=e[15],M=l*m-c*d,T=o*m-c*u,w=o*d-l*u,R=a*m-c*h,S=a*d-l*h,A=a*u-o*h;return t*(x*M-f*T+p*w)-n*(g*M-f*R+p*S)+s*(g*T-x*R+p*A)-r*(g*w-x*S+f*A)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],m=e[11],g=e[12],x=e[13],f=e[14],p=e[15],M=t*o-n*a,T=t*l-s*a,w=t*c-r*a,R=n*l-s*o,S=n*c-r*o,A=s*c-r*l,v=h*x-u*g,b=h*f-d*g,X=h*p-m*g,C=u*f-d*x,k=u*p-m*x,z=d*p-m*f,q=M*z-T*k+w*C+R*X-S*b+A*v;if(q===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const B=1/q;return e[0]=(o*z-l*k+c*C)*B,e[1]=(s*k-n*z-r*C)*B,e[2]=(x*A-f*S+p*R)*B,e[3]=(d*S-u*A-m*R)*B,e[4]=(l*X-a*z-c*b)*B,e[5]=(t*z-s*X+r*b)*B,e[6]=(f*w-g*A-p*T)*B,e[7]=(h*A-d*w+m*T)*B,e[8]=(a*k-o*X+c*v)*B,e[9]=(n*X-t*k-r*v)*B,e[10]=(g*S-x*w+p*M)*B,e[11]=(u*w-h*S-m*M)*B,e[12]=(o*b-a*C-l*v)*B,e[13]=(t*C-n*b+s*v)*B,e[14]=(x*T-g*R-f*M)*B,e[15]=(h*R-u*T+d*M)*B,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,u=o+o,d=r*c,m=r*h,g=r*u,x=a*h,f=a*u,p=o*u,M=l*c,T=l*h,w=l*u,R=n.x,S=n.y,A=n.z;return s[0]=(1-(x+p))*R,s[1]=(m+w)*R,s[2]=(g-T)*R,s[3]=0,s[4]=(m-w)*S,s[5]=(1-(d+p))*S,s[6]=(f+M)*S,s[7]=0,s[8]=(g+T)*A,s[9]=(f-M)*A,s[10]=(1-(d+x))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinant();if(r===0)return n.set(1,1,1),t.identity(),this;let a=wi.set(s[0],s[1],s[2]).length();const o=wi.set(s[4],s[5],s[6]).length(),l=wi.set(s[8],s[9],s[10]).length();r<0&&(a=-a),cn.copy(this);const c=1/a,h=1/o,u=1/l;return cn.elements[0]*=c,cn.elements[1]*=c,cn.elements[2]*=c,cn.elements[4]*=h,cn.elements[5]*=h,cn.elements[6]*=h,cn.elements[8]*=u,cn.elements[9]*=u,cn.elements[10]*=u,t.setFromRotationMatrix(cn),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=Rn,l=!1){const c=this.elements,h=2*r/(t-e),u=2*r/(n-s),d=(t+e)/(t-e),m=(n+s)/(n-s);let g,x;if(l)g=r/(a-r),x=a*r/(a-r);else if(o===Rn)g=-(a+r)/(a-r),x=-2*a*r/(a-r);else if(o===xs)g=-a/(a-r),x=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=m,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=Rn,l=!1){const c=this.elements,h=2/(t-e),u=2/(n-s),d=-(t+e)/(t-e),m=-(n+s)/(n-s);let g,x;if(l)g=1/(a-r),x=a/(a-r);else if(o===Rn)g=-2/(a-r),x=-(a+r)/(a-r);else if(o===xs)g=-1/(a-r),x=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=m,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const wi=new F,cn=new mt,Ih=new F(0,0,0),Lh=new F(1,1,1),Xn=new F,Ds=new F,Qt=new F,qo=new mt,Yo=new Qi;class Ln{constructor(e=0,t=0,n=0,s=Ln.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],d=s[6],m=s[10];switch(t){case"XYZ":this._y=Math.asin(Xe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,m),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Xe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Xe(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,m),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Xe(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,m),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Xe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-Xe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,m),this._y=0);break;default:Le("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return qo.makeRotationFromQuaternion(e),this.setFromRotationMatrix(qo,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Yo.setFromEuler(this),this.setFromQuaternion(Yo,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ln.DEFAULT_ORDER="XYZ";class uc{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Uh=0;const $o=new F,Ti=new Qi,Nn=new mt,Is=new F,ts=new F,Fh=new F,Nh=new Qi,Ko=new F(1,0,0),jo=new F(0,1,0),Zo=new F(0,0,1),Qo={type:"added"},Oh={type:"removed"},Ai={type:"childadded",child:null},Lr={type:"childremoved",child:null};class Ut extends Zi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Uh++}),this.uuid=Ms(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ut.DEFAULT_UP.clone();const e=new F,t=new Ln,n=new Qi,s=new F(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new mt},normalMatrix:{value:new ke}}),this.matrix=new mt,this.matrixWorld=new mt,this.matrixAutoUpdate=Ut.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new uc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ti.setFromAxisAngle(e,t),this.quaternion.multiply(Ti),this}rotateOnWorldAxis(e,t){return Ti.setFromAxisAngle(e,t),this.quaternion.premultiply(Ti),this}rotateX(e){return this.rotateOnAxis(Ko,e)}rotateY(e){return this.rotateOnAxis(jo,e)}rotateZ(e){return this.rotateOnAxis(Zo,e)}translateOnAxis(e,t){return $o.copy(e).applyQuaternion(this.quaternion),this.position.add($o.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ko,e)}translateY(e){return this.translateOnAxis(jo,e)}translateZ(e){return this.translateOnAxis(Zo,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Nn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Is.copy(e):Is.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),ts.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Nn.lookAt(ts,Is,this.up):Nn.lookAt(Is,ts,this.up),this.quaternion.setFromRotationMatrix(Nn),s&&(Nn.extractRotation(s.matrixWorld),Ti.setFromRotationMatrix(Nn),this.quaternion.premultiply(Ti.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(je("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Qo),Ai.child=e,this.dispatchEvent(Ai),Ai.child=null):je("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Oh),Lr.child=e,this.dispatchEvent(Lr),Lr.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Nn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Nn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Nn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Qo),Ai.child=e,this.dispatchEvent(Ai),Ai.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ts,e,Fh),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ts,Nh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),m=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),m.length>0&&(n.animations=m),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),e.pivot!==null&&(this.pivot=e.pivot.clone()),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}Ut.DEFAULT_UP=new F(0,1,0);Ut.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Hi extends Ut{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Bh={type:"move"};class Ur{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Hi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Hi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new F,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new F),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Hi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new F,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new F),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const x of e.hand.values()){const f=t.getJointPose(x,n),p=this._getHandJoint(c,x);f!==null&&(p.matrix.fromArray(f.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=f.radius),p.visible=f!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),m=.02,g=.005;c.inputState.pinching&&d>m+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=m-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Bh)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Hi;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const fc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},qn={h:0,s:0,l:0},Ls={h:0,s:0,l:0};function Fr(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ne{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=pt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,$e.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=$e.workingColorSpace){return this.r=e,this.g=t,this.b=n,$e.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=$e.workingColorSpace){if(e=wh(e,1),t=Xe(t,0,1),n=Xe(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Fr(a,r,e+1/3),this.g=Fr(a,r,e),this.b=Fr(a,r,e-1/3)}return $e.colorSpaceToWorking(this,s),this}setStyle(e,t=pt){function n(r){r!==void 0&&parseFloat(r)<1&&Le("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Le("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Le("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=pt){const n=fc[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Le("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Hn(e.r),this.g=Hn(e.g),this.b=Hn(e.b),this}copyLinearToSRGB(e){return this.r=Vi(e.r),this.g=Vi(e.g),this.b=Vi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=pt){return $e.workingToColorSpace(Bt.copy(this),e),Math.round(Xe(Bt.r*255,0,255))*65536+Math.round(Xe(Bt.g*255,0,255))*256+Math.round(Xe(Bt.b*255,0,255))}getHexString(e=pt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=$e.workingColorSpace){$e.workingToColorSpace(Bt.copy(this),t);const n=Bt.r,s=Bt.g,r=Bt.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=$e.workingColorSpace){return $e.workingToColorSpace(Bt.copy(this),t),e.r=Bt.r,e.g=Bt.g,e.b=Bt.b,e}getStyle(e=pt){$e.workingToColorSpace(Bt.copy(this),e);const t=Bt.r,n=Bt.g,s=Bt.b;return e!==pt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(qn),this.setHSL(qn.h+e,qn.s+t,qn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(qn),e.getHSL(Ls);const n=Cr(qn.h,Ls.h,t),s=Cr(qn.s,Ls.s,t),r=Cr(qn.l,Ls.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Bt=new Ne;Ne.NAMES=fc;class So{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ne(e),this.density=t}clone(){return new So(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class kh extends Ut{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ln,this.environmentIntensity=1,this.environmentRotation=new Ln,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const hn=new F,On=new F,Nr=new F,Bn=new F,Ci=new F,Ri=new F,Jo=new F,Or=new F,Br=new F,kr=new F,zr=new xt,Hr=new xt,Gr=new xt;class _n{constructor(e=new F,t=new F,n=new F){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),hn.subVectors(e,t),s.cross(hn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){hn.subVectors(s,t),On.subVectors(n,t),Nr.subVectors(e,t);const a=hn.dot(hn),o=hn.dot(On),l=hn.dot(Nr),c=On.dot(On),h=On.dot(Nr),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const d=1/u,m=(c*l-o*h)*d,g=(a*h-o*l)*d;return r.set(1-m-g,g,m)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Bn)===null?!1:Bn.x>=0&&Bn.y>=0&&Bn.x+Bn.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Bn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Bn.x),l.addScaledVector(a,Bn.y),l.addScaledVector(o,Bn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return zr.setScalar(0),Hr.setScalar(0),Gr.setScalar(0),zr.fromBufferAttribute(e,t),Hr.fromBufferAttribute(e,n),Gr.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(zr,r.x),a.addScaledVector(Hr,r.y),a.addScaledVector(Gr,r.z),a}static isFrontFacing(e,t,n,s){return hn.subVectors(n,t),On.subVectors(e,t),hn.cross(On).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return hn.subVectors(this.c,this.b),On.subVectors(this.a,this.b),hn.cross(On).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return _n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return _n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return _n.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return _n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return _n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;Ci.subVectors(s,n),Ri.subVectors(r,n),Or.subVectors(e,n);const l=Ci.dot(Or),c=Ri.dot(Or);if(l<=0&&c<=0)return t.copy(n);Br.subVectors(e,s);const h=Ci.dot(Br),u=Ri.dot(Br);if(h>=0&&u<=h)return t.copy(s);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(Ci,a);kr.subVectors(e,r);const m=Ci.dot(kr),g=Ri.dot(kr);if(g>=0&&m<=g)return t.copy(r);const x=m*c-l*g;if(x<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(Ri,o);const f=h*g-m*u;if(f<=0&&u-h>=0&&m-g>=0)return Jo.subVectors(r,s),o=(u-h)/(u-h+(m-g)),t.copy(s).addScaledVector(Jo,o);const p=1/(f+x+d);return a=x*p,o=d*p,t.copy(n).addScaledVector(Ci,a).addScaledVector(Ri,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class yi{constructor(e=new F(1/0,1/0,1/0),t=new F(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(dn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(dn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=dn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,dn):dn.fromBufferAttribute(r,a),dn.applyMatrix4(e.matrixWorld),this.expandByPoint(dn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Us.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Us.copy(n.boundingBox)),Us.applyMatrix4(e.matrixWorld),this.union(Us)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,dn),dn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ns),Fs.subVectors(this.max,ns),Pi.subVectors(e.a,ns),Di.subVectors(e.b,ns),Ii.subVectors(e.c,ns),Yn.subVectors(Di,Pi),$n.subVectors(Ii,Di),ai.subVectors(Pi,Ii);let t=[0,-Yn.z,Yn.y,0,-$n.z,$n.y,0,-ai.z,ai.y,Yn.z,0,-Yn.x,$n.z,0,-$n.x,ai.z,0,-ai.x,-Yn.y,Yn.x,0,-$n.y,$n.x,0,-ai.y,ai.x,0];return!Vr(t,Pi,Di,Ii,Fs)||(t=[1,0,0,0,1,0,0,0,1],!Vr(t,Pi,Di,Ii,Fs))?!1:(Ns.crossVectors(Yn,$n),t=[Ns.x,Ns.y,Ns.z],Vr(t,Pi,Di,Ii,Fs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,dn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(dn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(kn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),kn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),kn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),kn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),kn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),kn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),kn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),kn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(kn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const kn=[new F,new F,new F,new F,new F,new F,new F,new F],dn=new F,Us=new yi,Pi=new F,Di=new F,Ii=new F,Yn=new F,$n=new F,ai=new F,ns=new F,Fs=new F,Ns=new F,oi=new F;function Vr(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){oi.fromArray(i,r);const o=s.x*Math.abs(oi.x)+s.y*Math.abs(oi.y)+s.z*Math.abs(oi.z),l=e.dot(oi),c=t.dot(oi),h=n.dot(oi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const Et=new F,Os=new Ue;let zh=0;class Sn{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:zh++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=ko,this.updateRanges=[],this.gpuType=vn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Os.fromBufferAttribute(this,t),Os.applyMatrix3(e),this.setXY(t,Os.x,Os.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.applyMatrix3(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.applyMatrix4(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.applyNormalMatrix(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.transformDirection(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=es(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=$t(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=es(t,this.array)),t}setX(e,t){return this.normalized&&(t=$t(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=es(t,this.array)),t}setY(e,t){return this.normalized&&(t=$t(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=es(t,this.array)),t}setZ(e,t){return this.normalized&&(t=$t(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=es(t,this.array)),t}setW(e,t){return this.normalized&&(t=$t(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=$t(t,this.array),n=$t(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=$t(t,this.array),n=$t(n,this.array),s=$t(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=$t(t,this.array),n=$t(n,this.array),s=$t(s,this.array),r=$t(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==ko&&(e.usage=this.usage),e}}class pc extends Sn{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class mc extends Sn{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Ft extends Sn{constructor(e,t,n){super(new Float32Array(e),t,n)}}const Hh=new yi,is=new F,Wr=new F;class bs{constructor(e=new F,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Hh.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;is.subVectors(e,this.center);const t=is.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(is,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Wr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(is.copy(e.center).add(Wr)),this.expandByPoint(is.copy(e.center).sub(Wr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Gh=0;const sn=new mt,Xr=new Ut,Li=new F,Jt=new yi,ss=new yi,Pt=new F;class on extends Zi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Gh++}),this.uuid=Ms(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Sh(e)?mc:pc)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new ke().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return sn.makeRotationFromQuaternion(e),this.applyMatrix4(sn),this}rotateX(e){return sn.makeRotationX(e),this.applyMatrix4(sn),this}rotateY(e){return sn.makeRotationY(e),this.applyMatrix4(sn),this}rotateZ(e){return sn.makeRotationZ(e),this.applyMatrix4(sn),this}translate(e,t,n){return sn.makeTranslation(e,t,n),this.applyMatrix4(sn),this}scale(e,t,n){return sn.makeScale(e,t,n),this.applyMatrix4(sn),this}lookAt(e){return Xr.lookAt(e),Xr.updateMatrix(),this.applyMatrix4(Xr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Li).negate(),this.translate(Li.x,Li.y,Li.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Ft(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Le("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new yi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){je("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new F(-1/0,-1/0,-1/0),new F(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];Jt.setFromBufferAttribute(r),this.morphTargetsRelative?(Pt.addVectors(this.boundingBox.min,Jt.min),this.boundingBox.expandByPoint(Pt),Pt.addVectors(this.boundingBox.max,Jt.max),this.boundingBox.expandByPoint(Pt)):(this.boundingBox.expandByPoint(Jt.min),this.boundingBox.expandByPoint(Jt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&je('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new bs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){je("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new F,1/0);return}if(e){const n=this.boundingSphere.center;if(Jt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];ss.setFromBufferAttribute(o),this.morphTargetsRelative?(Pt.addVectors(Jt.min,ss.min),Jt.expandByPoint(Pt),Pt.addVectors(Jt.max,ss.max),Jt.expandByPoint(Pt)):(Jt.expandByPoint(ss.min),Jt.expandByPoint(ss.max))}Jt.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Pt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Pt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Pt.fromBufferAttribute(o,c),l&&(Li.fromBufferAttribute(e,c),Pt.add(Li)),s=Math.max(s,n.distanceToSquared(Pt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&je('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){je("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Sn(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let v=0;v<n.count;v++)o[v]=new F,l[v]=new F;const c=new F,h=new F,u=new F,d=new Ue,m=new Ue,g=new Ue,x=new F,f=new F;function p(v,b,X){c.fromBufferAttribute(n,v),h.fromBufferAttribute(n,b),u.fromBufferAttribute(n,X),d.fromBufferAttribute(r,v),m.fromBufferAttribute(r,b),g.fromBufferAttribute(r,X),h.sub(c),u.sub(c),m.sub(d),g.sub(d);const C=1/(m.x*g.y-g.x*m.y);isFinite(C)&&(x.copy(h).multiplyScalar(g.y).addScaledVector(u,-m.y).multiplyScalar(C),f.copy(u).multiplyScalar(m.x).addScaledVector(h,-g.x).multiplyScalar(C),o[v].add(x),o[b].add(x),o[X].add(x),l[v].add(f),l[b].add(f),l[X].add(f))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let v=0,b=M.length;v<b;++v){const X=M[v],C=X.start,k=X.count;for(let z=C,q=C+k;z<q;z+=3)p(e.getX(z+0),e.getX(z+1),e.getX(z+2))}const T=new F,w=new F,R=new F,S=new F;function A(v){R.fromBufferAttribute(s,v),S.copy(R);const b=o[v];T.copy(b),T.sub(R.multiplyScalar(R.dot(b))).normalize(),w.crossVectors(S,b);const C=w.dot(l[v])<0?-1:1;a.setXYZW(v,T.x,T.y,T.z,C)}for(let v=0,b=M.length;v<b;++v){const X=M[v],C=X.start,k=X.count;for(let z=C,q=C+k;z<q;z+=3)A(e.getX(z+0)),A(e.getX(z+1)),A(e.getX(z+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Sn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,m=n.count;d<m;d++)n.setXYZ(d,0,0,0);const s=new F,r=new F,a=new F,o=new F,l=new F,c=new F,h=new F,u=new F;if(e)for(let d=0,m=e.count;d<m;d+=3){const g=e.getX(d+0),x=e.getX(d+1),f=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),a.fromBufferAttribute(t,f),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,f),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(f,c.x,c.y,c.z)}else for(let d=0,m=t.count;d<m;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Pt.fromBufferAttribute(e,t),Pt.normalize(),e.setXYZ(t,Pt.x,Pt.y,Pt.z)}toNonIndexed(){function e(o,l){const c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h);let m=0,g=0;for(let x=0,f=l.length;x<f;x++){o.isInterleavedBufferAttribute?m=l[x]*o.data.stride+o.offset:m=l[x]*h;for(let p=0;p<h;p++)d[g++]=c[m++]}return new Sn(d,h,u)}if(this.index===null)return Le("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new on,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,n);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const d=c[h],m=e(d,n);l.push(m)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const m=c[u];h.push(m.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],u=r[c];for(let d=0,m=u.length;d<m;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}let Vh=0;class Es extends Zi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Vh++}),this.uuid=Ms(),this.name="",this.type="Material",this.blending=Gi,this.side=ni,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=fa,this.blendDst=pa,this.blendEquation=mi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ne(0,0,0),this.blendAlpha=0,this.depthFunc=Wi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Bo,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=bi,this.stencilZFail=bi,this.stencilZPass=bi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){Le(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Le(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Gi&&(n.blending=this.blending),this.side!==ni&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==fa&&(n.blendSrc=this.blendSrc),this.blendDst!==pa&&(n.blendDst=this.blendDst),this.blendEquation!==mi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Wi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Bo&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==bi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==bi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==bi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const zn=new F,qr=new F,Bs=new F,Kn=new F,Yr=new F,ks=new F,$r=new F;class Wh{constructor(e=new F,t=new F(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,zn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=zn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(zn.copy(this.origin).addScaledVector(this.direction,t),zn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){qr.copy(e).add(t).multiplyScalar(.5),Bs.copy(t).sub(e).normalize(),Kn.copy(this.origin).sub(qr);const r=e.distanceTo(t)*.5,a=-this.direction.dot(Bs),o=Kn.dot(this.direction),l=-Kn.dot(Bs),c=Kn.lengthSq(),h=Math.abs(1-a*a);let u,d,m,g;if(h>0)if(u=a*l-o,d=a*o-l,g=r*h,u>=0)if(d>=-g)if(d<=g){const x=1/h;u*=x,d*=x,m=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=r,u=Math.max(0,-(a*d+o)),m=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(a*d+o)),m=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-l),r),m=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),m=d*(d+2*l)+c):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-l),r),m=-u*u+d*(d+2*l)+c);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),m=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(qr).addScaledVector(Bs,d),m}intersectSphere(e,t){zn.subVectors(e.center,this.origin);const n=zn.dot(this.direction),s=zn.dot(zn)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,zn)!==null}intersectTriangle(e,t,n,s,r){Yr.subVectors(t,e),ks.subVectors(n,e),$r.crossVectors(Yr,ks);let a=this.direction.dot($r),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Kn.subVectors(this.origin,e);const l=o*this.direction.dot(ks.crossVectors(Kn,ks));if(l<0)return null;const c=o*this.direction.dot(Yr.cross(Kn));if(c<0||l+c>a)return null;const h=-o*Kn.dot($r);return h<0?null:this.at(h/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class dt extends Es{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ne(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ln,this.combine=$l,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const el=new mt,li=new Wh,zs=new bs,tl=new F,Hs=new F,Gs=new F,Vs=new F,Kr=new F,Ws=new F,nl=new F,Xs=new F;class qe extends Ut{constructor(e=new on,t=new dt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){Ws.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],u=r[l];h!==0&&(Kr.fromBufferAttribute(u,e),a?Ws.addScaledVector(Kr,h):Ws.addScaledVector(Kr.sub(t),h))}t.add(Ws)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),zs.copy(n.boundingSphere),zs.applyMatrix4(r),li.copy(e.ray).recast(e.near),!(zs.containsPoint(li.origin)===!1&&(li.intersectSphere(zs,tl)===null||li.origin.distanceToSquared(tl)>(e.far-e.near)**2))&&(el.copy(r).invert(),li.copy(e.ray).applyMatrix4(el),!(n.boundingBox!==null&&li.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,li)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,m=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,x=d.length;g<x;g++){const f=d[g],p=a[f.materialIndex],M=Math.max(f.start,m.start),T=Math.min(o.count,Math.min(f.start+f.count,m.start+m.count));for(let w=M,R=T;w<R;w+=3){const S=o.getX(w),A=o.getX(w+1),v=o.getX(w+2);s=qs(this,p,e,n,c,h,u,S,A,v),s&&(s.faceIndex=Math.floor(w/3),s.face.materialIndex=f.materialIndex,t.push(s))}}else{const g=Math.max(0,m.start),x=Math.min(o.count,m.start+m.count);for(let f=g,p=x;f<p;f+=3){const M=o.getX(f),T=o.getX(f+1),w=o.getX(f+2);s=qs(this,a,e,n,c,h,u,M,T,w),s&&(s.faceIndex=Math.floor(f/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,x=d.length;g<x;g++){const f=d[g],p=a[f.materialIndex],M=Math.max(f.start,m.start),T=Math.min(l.count,Math.min(f.start+f.count,m.start+m.count));for(let w=M,R=T;w<R;w+=3){const S=w,A=w+1,v=w+2;s=qs(this,p,e,n,c,h,u,S,A,v),s&&(s.faceIndex=Math.floor(w/3),s.face.materialIndex=f.materialIndex,t.push(s))}}else{const g=Math.max(0,m.start),x=Math.min(l.count,m.start+m.count);for(let f=g,p=x;f<p;f+=3){const M=f,T=f+1,w=f+2;s=qs(this,a,e,n,c,h,u,M,T,w),s&&(s.faceIndex=Math.floor(f/3),t.push(s))}}}}function Xh(i,e,t,n,s,r,a,o){let l;if(e.side===Kt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===ni,o),l===null)return null;Xs.copy(o),Xs.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Xs);return c<t.near||c>t.far?null:{distance:c,point:Xs.clone(),object:i}}function qs(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Hs),i.getVertexPosition(l,Gs),i.getVertexPosition(c,Vs);const h=Xh(i,e,t,n,Hs,Gs,Vs,nl);if(h){const u=new F;_n.getBarycoord(nl,Hs,Gs,Vs,u),s&&(h.uv=_n.getInterpolatedAttribute(s,o,l,c,u,new Ue)),r&&(h.uv1=_n.getInterpolatedAttribute(r,o,l,c,u,new Ue)),a&&(h.normal=_n.getInterpolatedAttribute(a,o,l,c,u,new F),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a:o,b:l,c,normal:new F,materialIndex:0};_n.getNormal(Hs,Gs,Vs,d.normal),h.face=d,h.barycoord=u}return h}class gc extends Lt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Pe,h=Pe,u,d){super(null,a,o,l,c,h,s,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class il extends Sn{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Ui=new mt,sl=new mt,Ys=[],rl=new yi,qh=new mt,rs=new qe,as=new bs;class Yh extends qe{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new il(new Float32Array(n*16),16),this.previousInstanceMatrix=null,this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,qh)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new yi),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ui),rl.copy(e.boundingBox).applyMatrix4(Ui),this.boundingBox.union(rl)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new bs),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ui),as.copy(e.boundingSphere).applyMatrix4(Ui),this.boundingSphere.union(as)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.previousInstanceMatrix!==null&&(this.previousInstanceMatrix=e.previousInstanceMatrix.clone()),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){const n=this.matrixWorld,s=this.count;if(rs.geometry=this.geometry,rs.material=this.material,rs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),as.copy(this.boundingSphere),as.applyMatrix4(n),e.ray.intersectsSphere(as)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ui),sl.multiplyMatrices(n,Ui),rs.matrixWorld=sl,rs.raycast(e,Ys);for(let a=0,o=Ys.length;a<o;a++){const l=Ys[a];l.instanceId=r,l.object=this,t.push(l)}Ys.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new il(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new gc(new Float32Array(s*this.count),s,this.count,po,vn));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const jr=new F,$h=new F,Kh=new ke;class pi{constructor(e=new F(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=jr.subVectors(n,t).cross($h.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(jr),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Kh.getNormalMatrix(e),s=this.coplanarPoint(jr).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ci=new bs,jh=new Ue(.5,.5),$s=new F;class Mo{constructor(e=new pi,t=new pi,n=new pi,s=new pi,r=new pi,a=new pi){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Rn,n=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],m=r[7],g=r[8],x=r[9],f=r[10],p=r[11],M=r[12],T=r[13],w=r[14],R=r[15];if(s[0].setComponents(c-a,m-h,p-g,R-M).normalize(),s[1].setComponents(c+a,m+h,p+g,R+M).normalize(),s[2].setComponents(c+o,m+u,p+x,R+T).normalize(),s[3].setComponents(c-o,m-u,p-x,R-T).normalize(),n)s[4].setComponents(l,d,f,w).normalize(),s[5].setComponents(c-l,m-d,p-f,R-w).normalize();else if(s[4].setComponents(c-l,m-d,p-f,R-w).normalize(),t===Rn)s[5].setComponents(c+l,m+d,p+f,R+w).normalize();else if(t===xs)s[5].setComponents(l,d,f,w).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ci.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ci.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ci)}intersectsSprite(e){ci.center.set(0,0,0);const t=jh.distanceTo(e.center);return ci.radius=.7071067811865476+t,ci.applyMatrix4(e.matrixWorld),this.intersectsSphere(ci)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if($s.x=s.normal.x>0?e.max.x:e.min.x,$s.y=s.normal.y>0?e.max.y:e.min.y,$s.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint($s)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class _c extends Lt{constructor(e=[],t=vi,n,s,r,a,o,l,c,h){super(e,t,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class an extends Lt{constructor(e,t,n,s,r,a,o,l,c){super(e,t,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class ys extends Lt{constructor(e,t,n=In,s,r,a,o=Pe,l=Pe,c,h=Gn,u=1){if(h!==Gn&&h!==xi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:e,height:t,depth:u};super(d,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new yo(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Zh extends ys{constructor(e,t=In,n=vi,s,r,a=Pe,o=Pe,l,c=Gn){const h={width:e,height:e,depth:1},u=[h,h,h,h,h,h];super(e,e,t,n,s,r,a,o,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class xc extends Lt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class ws extends on{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let d=0,m=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Ft(c,3)),this.setAttribute("normal",new Ft(h,3)),this.setAttribute("uv",new Ft(u,2));function g(x,f,p,M,T,w,R,S,A,v,b){const X=w/A,C=R/v,k=w/2,z=R/2,q=S/2,B=A+1,G=v+1;let U=0,te=0;const Z=new F;for(let ue=0;ue<G;ue++){const _e=ue*C-z;for(let pe=0;pe<B;pe++){const ze=pe*X-k;Z[x]=ze*M,Z[f]=_e*T,Z[p]=q,c.push(Z.x,Z.y,Z.z),Z[x]=0,Z[f]=0,Z[p]=S>0?1:-1,h.push(Z.x,Z.y,Z.z),u.push(pe/A),u.push(1-ue/v),U+=1}}for(let ue=0;ue<v;ue++)for(let _e=0;_e<A;_e++){const pe=d+_e+B*ue,ze=d+_e+B*(ue+1),gt=d+(_e+1)+B*(ue+1),ft=d+(_e+1)+B*ue;l.push(pe,ze,ft),l.push(ze,gt,ft),te+=6}o.addGroup(m,te,b),m+=te,d+=U}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ws(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class bo extends on{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);const r=[],a=[],o=[],l=[],c=new F,h=new Ue;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=t;u++,d+=3){const m=n+u/t*s;c.x=e*Math.cos(m),c.y=e*Math.sin(m),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[d]/e+1)/2,h.y=(a[d+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new Ft(a,3)),this.setAttribute("normal",new Ft(o,3)),this.setAttribute("uv",new Ft(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new bo(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class ut extends on{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,u=e/o,d=t/l,m=[],g=[],x=[],f=[];for(let p=0;p<h;p++){const M=p*d-a;for(let T=0;T<c;T++){const w=T*u-r;g.push(w,-M,0),x.push(0,0,1),f.push(T/o),f.push(1-p/l)}}for(let p=0;p<l;p++)for(let M=0;M<o;M++){const T=M+c*p,w=M+c*(p+1),R=M+1+c*(p+1),S=M+1+c*p;m.push(T,w,S),m.push(w,R,S)}this.setIndex(m),this.setAttribute("position",new Ft(g,3)),this.setAttribute("normal",new Ft(x,3)),this.setAttribute("uv",new Ft(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ut(e.width,e.height,e.widthSegments,e.heightSegments)}}class Eo extends on{constructor(e=.5,t=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);const o=[],l=[],c=[],h=[];let u=e;const d=(t-e)/s,m=new F,g=new Ue;for(let x=0;x<=s;x++){for(let f=0;f<=n;f++){const p=r+f/n*a;m.x=u*Math.cos(p),m.y=u*Math.sin(p),l.push(m.x,m.y,m.z),c.push(0,0,1),g.x=(m.x/t+1)/2,g.y=(m.y/t+1)/2,h.push(g.x,g.y)}u+=d}for(let x=0;x<s;x++){const f=x*(n+1);for(let p=0;p<n;p++){const M=p+f,T=M,w=M+n+1,R=M+n+2,S=M+1;o.push(T,w,S),o.push(w,R,S)}}this.setIndex(o),this.setAttribute("position",new Ft(l,3)),this.setAttribute("normal",new Ft(c,3)),this.setAttribute("uv",new Ft(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Eo(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}function $i(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(Le("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function Yt(i){const e={};for(let t=0;t<i.length;t++){const n=$i(i[t]);for(const s in n)e[s]=n[s]}return e}function Qh(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function vc(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:$e.workingColorSpace}const pr={clone:$i,merge:Yt};var Jh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ed=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Gt extends Es{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Jh,this.fragmentShader=ed,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=$i(e.uniforms),this.uniformsGroups=Qh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class td extends Gt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class nd extends Es{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ne(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ne(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=cc,this.normalScale=new Ue(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ln,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class id extends Es{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=fh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class sd extends Es{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Zr={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(al(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!al(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function al(i){try{const e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}class yc{constructor(e,t,n){const s=this;let r=!1,a=0,o=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){const m=c[u],g=c[u+1];if(m.global&&(m.lastIndex=0),m.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const rd=new yc;class wo{constructor(e){this.manager=e!==void 0?e:rd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){const n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}wo.DEFAULT_MATERIAL_NAME="__DEFAULT";const Fi=new WeakMap;class ad extends wo{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=Zr.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let u=Fi.get(a);u===void 0&&(u=[],Fi.set(a,u)),u.push({onLoad:t,onError:s})}return a}const o=vs("img");function l(){h(),t&&t(this);const u=Fi.get(this)||[];for(let d=0;d<u.length;d++){const m=u[d];m.onLoad&&m.onLoad(this)}Fi.delete(this),r.manager.itemEnd(e)}function c(u){h(),s&&s(u),Zr.remove(`image:${e}`);const d=Fi.get(this)||[];for(let m=0;m<d.length;m++){const g=d[m];g.onError&&g.onError(u)}Fi.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Zr.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}}class od extends wo{constructor(e){super(e)}load(e,t,n,s){const r=new Lt,a=new ad(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}}class Sc extends Ut{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ne(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}const Qr=new mt,ol=new F,ll=new F;class ld{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ue(512,512),this.mapType=tn,this.map=null,this.mapPass=null,this.matrix=new mt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Mo,this._frameExtents=new Ue(1,1),this._viewportCount=1,this._viewports=[new xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;ol.setFromMatrixPosition(e.matrixWorld),t.position.copy(ol),ll.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ll),t.updateMatrixWorld(),Qr.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Qr,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===xs||t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Qr)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Ks=new F,js=new Qi,bn=new F;let Mc=class extends Ut{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new mt,this.projectionMatrix=new mt,this.projectionMatrixInverse=new mt,this.coordinateSystem=Rn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ks,js,bn),bn.x===1&&bn.y===1&&bn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ks,js,bn.set(1,1,1)).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorld.decompose(Ks,js,bn),bn.x===1&&bn.y===1&&bn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ks,js,bn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}};const jn=new F,cl=new Ue,hl=new Ue;class gn extends Mc{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=no*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ar*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return no*2*Math.atan(Math.tan(Ar*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){jn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(jn.x,jn.y).multiplyScalar(-e/jn.z),jn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(jn.x,jn.y).multiplyScalar(-e/jn.z)}getViewSize(e,t){return this.getViewBounds(e,cl,hl),t.subVectors(hl,cl)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Ar*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class Ts extends Mc{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class cd extends ld{constructor(){super(new Ts(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class hd extends Sc{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.target=new Ut,this.shadow=new cd}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class dd extends Sc{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}const Ni=-90,Oi=1;class ud extends Ut{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new gn(Ni,Oi,e,t);s.layers=this.layers,this.add(s);const r=new gn(Ni,Oi,e,t);r.layers=this.layers,this.add(r);const a=new gn(Ni,Oi,e,t);a.layers=this.layers,this.add(a);const o=new gn(Ni,Oi,e,t);o.layers=this.layers,this.add(o);const l=new gn(Ni,Oi,e,t);l.layers=this.layers,this.add(l);const c=new gn(Ni,Oi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===Rn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===xs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let f=!1;e.isWebGLRenderer===!0?f=e.state.buffers.depth.getReversed():f=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(u,d,m),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class fd extends gn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class pd{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=md.bind(this),e.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e!==void 0?e:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}}function md(){this._document.hidden===!1&&this.reset()}class gd{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,Le("THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function dl(i,e,t,n){const s=_d(n);switch(t){case oc:return i*e;case po:return i*e/s.components*s.byteLength;case mo:return i*e/s.components*s.byteLength;case qi:return i*e*2/s.components*s.byteLength;case go:return i*e*2/s.components*s.byteLength;case lc:return i*e*3/s.components*s.byteLength;case yn:return i*e*4/s.components*s.byteLength;case _o:return i*e*4/s.components*s.byteLength;case ir:case sr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case rr:case ar:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case wa:case Aa:return Math.max(i,16)*Math.max(e,8)/4;case Ea:case Ta:return Math.max(i,8)*Math.max(e,8)/2;case Ca:case Ra:case Da:case Ia:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Pa:case La:case Ua:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Fa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Na:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Oa:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Ba:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case ka:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case za:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Ha:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Ga:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Va:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Wa:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Xa:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case qa:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Ya:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case $a:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Ka:case ja:case Za:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Qa:case Ja:return Math.ceil(i/4)*Math.ceil(e/4)*8;case eo:case to:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function _d(i){switch(i){case tn:case ic:return{byteLength:1,components:1};case gs:case sc:case nn:return{byteLength:2,components:1};case uo:case fo:return{byteLength:2,components:4};case In:case ho:case vn:return{byteLength:4,components:1};case rc:case ac:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:co}}));typeof window<"u"&&(window.__THREE__?Le("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=co);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function bc(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function xd(i){const e=new WeakMap;function t(o,l){const c=o.array,h=o.usage,u=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,h),o.onUploadCallback();let m;if(c instanceof Float32Array)m=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)m=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?m=i.HALF_FLOAT:m=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=i.SHORT;else if(c instanceof Uint32Array)m=i.UNSIGNED_INT;else if(c instanceof Int32Array)m=i.INT;else if(c instanceof Int8Array)m=i.BYTE;else if(c instanceof Uint8Array)m=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,h);else{u.sort((m,g)=>m.start-g.start);let d=0;for(let m=1;m<u.length;m++){const g=u[d],x=u[m];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++d,u[d]=x)}u.length=d+1;for(let m=0,g=u.length;m<g;m++){const x=u[m];i.bufferSubData(c,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var vd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,yd=`#ifdef USE_ALPHAHASH
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
#endif`,Sd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Md=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,bd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Ed=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,wd=`#ifdef USE_AOMAP
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
#endif`,Td=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Ad=`#ifdef USE_BATCHING
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
#endif`,Cd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Rd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Pd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Dd=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Id=`#ifdef USE_IRIDESCENCE
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
#endif`,Ld=`#ifdef USE_BUMPMAP
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
#endif`,Ud=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Fd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Nd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Od=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Bd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,kd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,zd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Hd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Gd=`#define PI 3.141592653589793
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
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
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
} // validated`,Vd=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Wd=`vec3 transformedNormal = objectNormal;
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
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Xd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,qd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Yd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,$d=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Kd="gl_FragColor = linearToOutputTexel( gl_FragColor );",jd=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Zd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Qd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Jd=`#ifdef USE_ENVMAP
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
#endif`,eu=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,tu=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,nu=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,iu=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,su=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ru=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,au=`#ifdef USE_GRADIENTMAP
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
}`,ou=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lu=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,cu=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,hu=`uniform bool receiveShadow;
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
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
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
#endif`,du=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
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
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
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
	#endif
#endif`,uu=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,fu=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,pu=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,mu=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,gu=`PhysicalMaterial material;
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
#endif`,_u=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
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
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
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
		float v = 0.5 / ( gv + gl );
		return v;
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
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
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
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
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
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
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
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
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
}`,xu=`
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
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
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
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,vu=`#if defined( RE_IndirectDiffuse )
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
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,yu=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Su=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Mu=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,bu=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Eu=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,wu=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Tu=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Au=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Cu=`#if defined( USE_POINTS_UV )
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
#endif`,Ru=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Pu=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Du=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Iu=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Lu=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Uu=`#ifdef USE_MORPHTARGETS
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
#endif`,Fu=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Nu=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
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
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Ou=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Bu=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ku=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,zu=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Hu=`#ifdef USE_NORMALMAP
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
#endif`,Gu=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Vu=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Wu=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Xu=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,qu=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Yu=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,$u=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Ku=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,ju=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Zu=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Qu=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Ju=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ef=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
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
#endif`,tf=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
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
#endif`,nf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
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
#endif`,sf=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
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
}`,rf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,af=`#ifdef USE_SKINNING
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
#endif`,of=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,lf=`#ifdef USE_SKINNING
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
#endif`,cf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,hf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,df=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,uf=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,ff=`#ifdef USE_TRANSMISSION
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
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,pf=`#ifdef USE_TRANSMISSION
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
#endif`,mf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,gf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,_f=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,xf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const vf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,yf=`uniform sampler2D t2D;
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
}`,Sf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Mf=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,bf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ef=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wf=`#include <common>
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
}`,Tf=`#if DEPTH_PACKING == 3200
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
}`,Af=`#define DISTANCE
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
}`,Cf=`#define DISTANCE
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
void main () {
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
}`,Rf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Pf=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Df=`uniform float scale;
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
}`,If=`uniform vec3 diffuse;
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
}`,Lf=`#include <common>
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
}`,Uf=`uniform vec3 diffuse;
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
}`,Ff=`#define LAMBERT
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
}`,Nf=`#define LAMBERT
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
}`,Of=`#define MATCAP
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
}`,Bf=`#define MATCAP
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
}`,kf=`#define NORMAL
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
}`,zf=`#define NORMAL
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
}`,Hf=`#define PHONG
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
}`,Gf=`#define PHONG
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
}`,Vf=`#define STANDARD
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
}`,Wf=`#define STANDARD
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
}`,Xf=`#define TOON
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
}`,qf=`#define TOON
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
}`,Yf=`uniform float size;
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
}`,$f=`uniform vec3 diffuse;
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
}`,Kf=`#include <common>
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
}`,jf=`uniform vec3 color;
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
}`,Zf=`uniform float rotation;
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
}`,Qf=`uniform vec3 diffuse;
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
}`,He={alphahash_fragment:vd,alphahash_pars_fragment:yd,alphamap_fragment:Sd,alphamap_pars_fragment:Md,alphatest_fragment:bd,alphatest_pars_fragment:Ed,aomap_fragment:wd,aomap_pars_fragment:Td,batching_pars_vertex:Ad,batching_vertex:Cd,begin_vertex:Rd,beginnormal_vertex:Pd,bsdfs:Dd,iridescence_fragment:Id,bumpmap_pars_fragment:Ld,clipping_planes_fragment:Ud,clipping_planes_pars_fragment:Fd,clipping_planes_pars_vertex:Nd,clipping_planes_vertex:Od,color_fragment:Bd,color_pars_fragment:kd,color_pars_vertex:zd,color_vertex:Hd,common:Gd,cube_uv_reflection_fragment:Vd,defaultnormal_vertex:Wd,displacementmap_pars_vertex:Xd,displacementmap_vertex:qd,emissivemap_fragment:Yd,emissivemap_pars_fragment:$d,colorspace_fragment:Kd,colorspace_pars_fragment:jd,envmap_fragment:Zd,envmap_common_pars_fragment:Qd,envmap_pars_fragment:Jd,envmap_pars_vertex:eu,envmap_physical_pars_fragment:du,envmap_vertex:tu,fog_vertex:nu,fog_pars_vertex:iu,fog_fragment:su,fog_pars_fragment:ru,gradientmap_pars_fragment:au,lightmap_pars_fragment:ou,lights_lambert_fragment:lu,lights_lambert_pars_fragment:cu,lights_pars_begin:hu,lights_toon_fragment:uu,lights_toon_pars_fragment:fu,lights_phong_fragment:pu,lights_phong_pars_fragment:mu,lights_physical_fragment:gu,lights_physical_pars_fragment:_u,lights_fragment_begin:xu,lights_fragment_maps:vu,lights_fragment_end:yu,logdepthbuf_fragment:Su,logdepthbuf_pars_fragment:Mu,logdepthbuf_pars_vertex:bu,logdepthbuf_vertex:Eu,map_fragment:wu,map_pars_fragment:Tu,map_particle_fragment:Au,map_particle_pars_fragment:Cu,metalnessmap_fragment:Ru,metalnessmap_pars_fragment:Pu,morphinstance_vertex:Du,morphcolor_vertex:Iu,morphnormal_vertex:Lu,morphtarget_pars_vertex:Uu,morphtarget_vertex:Fu,normal_fragment_begin:Nu,normal_fragment_maps:Ou,normal_pars_fragment:Bu,normal_pars_vertex:ku,normal_vertex:zu,normalmap_pars_fragment:Hu,clearcoat_normal_fragment_begin:Gu,clearcoat_normal_fragment_maps:Vu,clearcoat_pars_fragment:Wu,iridescence_pars_fragment:Xu,opaque_fragment:qu,packing:Yu,premultiplied_alpha_fragment:$u,project_vertex:Ku,dithering_fragment:ju,dithering_pars_fragment:Zu,roughnessmap_fragment:Qu,roughnessmap_pars_fragment:Ju,shadowmap_pars_fragment:ef,shadowmap_pars_vertex:tf,shadowmap_vertex:nf,shadowmask_pars_fragment:sf,skinbase_vertex:rf,skinning_pars_vertex:af,skinning_vertex:of,skinnormal_vertex:lf,specularmap_fragment:cf,specularmap_pars_fragment:hf,tonemapping_fragment:df,tonemapping_pars_fragment:uf,transmission_fragment:ff,transmission_pars_fragment:pf,uv_pars_fragment:mf,uv_pars_vertex:gf,uv_vertex:_f,worldpos_vertex:xf,background_vert:vf,background_frag:yf,backgroundCube_vert:Sf,backgroundCube_frag:Mf,cube_vert:bf,cube_frag:Ef,depth_vert:wf,depth_frag:Tf,distance_vert:Af,distance_frag:Cf,equirect_vert:Rf,equirect_frag:Pf,linedashed_vert:Df,linedashed_frag:If,meshbasic_vert:Lf,meshbasic_frag:Uf,meshlambert_vert:Ff,meshlambert_frag:Nf,meshmatcap_vert:Of,meshmatcap_frag:Bf,meshnormal_vert:kf,meshnormal_frag:zf,meshphong_vert:Hf,meshphong_frag:Gf,meshphysical_vert:Vf,meshphysical_frag:Wf,meshtoon_vert:Xf,meshtoon_frag:qf,points_vert:Yf,points_frag:$f,shadow_vert:Kf,shadow_frag:jf,sprite_vert:Zf,sprite_frag:Qf},le={common:{diffuse:{value:new Ne(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},envMapRotation:{value:new ke},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new Ue(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ne(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ne(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new Ne(16777215)},opacity:{value:1},center:{value:new Ue(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},An={basic:{uniforms:Yt([le.common,le.specularmap,le.envmap,le.aomap,le.lightmap,le.fog]),vertexShader:He.meshbasic_vert,fragmentShader:He.meshbasic_frag},lambert:{uniforms:Yt([le.common,le.specularmap,le.envmap,le.aomap,le.lightmap,le.emissivemap,le.bumpmap,le.normalmap,le.displacementmap,le.fog,le.lights,{emissive:{value:new Ne(0)},envMapIntensity:{value:1}}]),vertexShader:He.meshlambert_vert,fragmentShader:He.meshlambert_frag},phong:{uniforms:Yt([le.common,le.specularmap,le.envmap,le.aomap,le.lightmap,le.emissivemap,le.bumpmap,le.normalmap,le.displacementmap,le.fog,le.lights,{emissive:{value:new Ne(0)},specular:{value:new Ne(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:He.meshphong_vert,fragmentShader:He.meshphong_frag},standard:{uniforms:Yt([le.common,le.envmap,le.aomap,le.lightmap,le.emissivemap,le.bumpmap,le.normalmap,le.displacementmap,le.roughnessmap,le.metalnessmap,le.fog,le.lights,{emissive:{value:new Ne(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag},toon:{uniforms:Yt([le.common,le.aomap,le.lightmap,le.emissivemap,le.bumpmap,le.normalmap,le.displacementmap,le.gradientmap,le.fog,le.lights,{emissive:{value:new Ne(0)}}]),vertexShader:He.meshtoon_vert,fragmentShader:He.meshtoon_frag},matcap:{uniforms:Yt([le.common,le.bumpmap,le.normalmap,le.displacementmap,le.fog,{matcap:{value:null}}]),vertexShader:He.meshmatcap_vert,fragmentShader:He.meshmatcap_frag},points:{uniforms:Yt([le.points,le.fog]),vertexShader:He.points_vert,fragmentShader:He.points_frag},dashed:{uniforms:Yt([le.common,le.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:He.linedashed_vert,fragmentShader:He.linedashed_frag},depth:{uniforms:Yt([le.common,le.displacementmap]),vertexShader:He.depth_vert,fragmentShader:He.depth_frag},normal:{uniforms:Yt([le.common,le.bumpmap,le.normalmap,le.displacementmap,{opacity:{value:1}}]),vertexShader:He.meshnormal_vert,fragmentShader:He.meshnormal_frag},sprite:{uniforms:Yt([le.sprite,le.fog]),vertexShader:He.sprite_vert,fragmentShader:He.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:He.background_vert,fragmentShader:He.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ke}},vertexShader:He.backgroundCube_vert,fragmentShader:He.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:He.cube_vert,fragmentShader:He.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:He.equirect_vert,fragmentShader:He.equirect_frag},distance:{uniforms:Yt([le.common,le.displacementmap,{referencePosition:{value:new F},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:He.distance_vert,fragmentShader:He.distance_frag},shadow:{uniforms:Yt([le.lights,le.fog,{color:{value:new Ne(0)},opacity:{value:1}}]),vertexShader:He.shadow_vert,fragmentShader:He.shadow_frag}};An.physical={uniforms:Yt([An.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new Ue(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new Ne(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new Ue},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new Ne(0)},specularColor:{value:new Ne(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new Ue},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag};const Zs={r:0,b:0,g:0},hi=new Ln,Jf=new mt;function ep(i,e,t,n,s,r){const a=new Ne(0);let o=s===!0?0:1,l,c,h=null,u=0,d=null;function m(M){let T=M.isScene===!0?M.background:null;if(T&&T.isTexture){const w=M.backgroundBlurriness>0;T=e.get(T,w)}return T}function g(M){let T=!1;const w=m(M);w===null?f(a,o):w&&w.isColor&&(f(w,1),T=!0);const R=i.xr.getEnvironmentBlendMode();R==="additive"?t.buffers.color.setClear(0,0,0,1,r):R==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||T)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function x(M,T){const w=m(T);w&&(w.isCubeTexture||w.mapping===xr)?(c===void 0&&(c=new qe(new ws(1,1,1),new Gt({name:"BackgroundCubeMaterial",uniforms:$i(An.backgroundCube.uniforms),vertexShader:An.backgroundCube.vertexShader,fragmentShader:An.backgroundCube.fragmentShader,side:Kt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(R,S,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),hi.copy(T.backgroundRotation),hi.x*=-1,hi.y*=-1,hi.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(hi.y*=-1,hi.z*=-1),c.material.uniforms.envMap.value=w,c.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,c.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Jf.makeRotationFromEuler(hi)),c.material.toneMapped=$e.getTransfer(w.colorSpace)!==tt,(h!==w||u!==w.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,h=w,u=w.version,d=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):w&&w.isTexture&&(l===void 0&&(l=new qe(new ut(2,2),new Gt({name:"BackgroundMaterial",uniforms:$i(An.background.uniforms),vertexShader:An.background.vertexShader,fragmentShader:An.background.fragmentShader,side:ni,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=w,l.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,l.material.toneMapped=$e.getTransfer(w.colorSpace)!==tt,w.matrixAutoUpdate===!0&&w.updateMatrix(),l.material.uniforms.uvTransform.value.copy(w.matrix),(h!==w||u!==w.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,h=w,u=w.version,d=i.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function f(M,T){M.getRGB(Zs,vc(i)),t.buffers.color.setClear(Zs.r,Zs.g,Zs.b,T,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,T=1){a.set(M),o=T,f(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,f(a,o)},render:g,addToRenderList:x,dispose:p}}function tp(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,a=!1;function o(C,k,z,q,B){let G=!1;const U=u(C,q,z,k);r!==U&&(r=U,c(r.object)),G=m(C,q,z,B),G&&g(C,q,z,B),B!==null&&e.update(B,i.ELEMENT_ARRAY_BUFFER),(G||a)&&(a=!1,w(C,k,z,q),B!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(B).buffer))}function l(){return i.createVertexArray()}function c(C){return i.bindVertexArray(C)}function h(C){return i.deleteVertexArray(C)}function u(C,k,z,q){const B=q.wireframe===!0;let G=n[k.id];G===void 0&&(G={},n[k.id]=G);const U=C.isInstancedMesh===!0?C.id:0;let te=G[U];te===void 0&&(te={},G[U]=te);let Z=te[z.id];Z===void 0&&(Z={},te[z.id]=Z);let ue=Z[B];return ue===void 0&&(ue=d(l()),Z[B]=ue),ue}function d(C){const k=[],z=[],q=[];for(let B=0;B<t;B++)k[B]=0,z[B]=0,q[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:k,enabledAttributes:z,attributeDivisors:q,object:C,attributes:{},index:null}}function m(C,k,z,q){const B=r.attributes,G=k.attributes;let U=0;const te=z.getAttributes();for(const Z in te)if(te[Z].location>=0){const _e=B[Z];let pe=G[Z];if(pe===void 0&&(Z==="instanceMatrix"&&C.instanceMatrix&&(pe=C.instanceMatrix),Z==="instanceColor"&&C.instanceColor&&(pe=C.instanceColor)),_e===void 0||_e.attribute!==pe||pe&&_e.data!==pe.data)return!0;U++}return r.attributesNum!==U||r.index!==q}function g(C,k,z,q){const B={},G=k.attributes;let U=0;const te=z.getAttributes();for(const Z in te)if(te[Z].location>=0){let _e=G[Z];_e===void 0&&(Z==="instanceMatrix"&&C.instanceMatrix&&(_e=C.instanceMatrix),Z==="instanceColor"&&C.instanceColor&&(_e=C.instanceColor));const pe={};pe.attribute=_e,_e&&_e.data&&(pe.data=_e.data),B[Z]=pe,U++}r.attributes=B,r.attributesNum=U,r.index=q}function x(){const C=r.newAttributes;for(let k=0,z=C.length;k<z;k++)C[k]=0}function f(C){p(C,0)}function p(C,k){const z=r.newAttributes,q=r.enabledAttributes,B=r.attributeDivisors;z[C]=1,q[C]===0&&(i.enableVertexAttribArray(C),q[C]=1),B[C]!==k&&(i.vertexAttribDivisor(C,k),B[C]=k)}function M(){const C=r.newAttributes,k=r.enabledAttributes;for(let z=0,q=k.length;z<q;z++)k[z]!==C[z]&&(i.disableVertexAttribArray(z),k[z]=0)}function T(C,k,z,q,B,G,U){U===!0?i.vertexAttribIPointer(C,k,z,B,G):i.vertexAttribPointer(C,k,z,q,B,G)}function w(C,k,z,q){x();const B=q.attributes,G=z.getAttributes(),U=k.defaultAttributeValues;for(const te in G){const Z=G[te];if(Z.location>=0){let ue=B[te];if(ue===void 0&&(te==="instanceMatrix"&&C.instanceMatrix&&(ue=C.instanceMatrix),te==="instanceColor"&&C.instanceColor&&(ue=C.instanceColor)),ue!==void 0){const _e=ue.normalized,pe=ue.itemSize,ze=e.get(ue);if(ze===void 0)continue;const gt=ze.buffer,ft=ze.type,K=ze.bytesPerElement,se=ft===i.INT||ft===i.UNSIGNED_INT||ue.gpuType===ho;if(ue.isInterleavedBufferAttribute){const oe=ue.data,Be=oe.stride,Re=ue.offset;if(oe.isInstancedInterleavedBuffer){for(let Ie=0;Ie<Z.locationSize;Ie++)p(Z.location+Ie,oe.meshPerAttribute);C.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let Ie=0;Ie<Z.locationSize;Ie++)f(Z.location+Ie);i.bindBuffer(i.ARRAY_BUFFER,gt);for(let Ie=0;Ie<Z.locationSize;Ie++)T(Z.location+Ie,pe/Z.locationSize,ft,_e,Be*K,(Re+pe/Z.locationSize*Ie)*K,se)}else{if(ue.isInstancedBufferAttribute){for(let oe=0;oe<Z.locationSize;oe++)p(Z.location+oe,ue.meshPerAttribute);C.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=ue.meshPerAttribute*ue.count)}else for(let oe=0;oe<Z.locationSize;oe++)f(Z.location+oe);i.bindBuffer(i.ARRAY_BUFFER,gt);for(let oe=0;oe<Z.locationSize;oe++)T(Z.location+oe,pe/Z.locationSize,ft,_e,pe*K,pe/Z.locationSize*oe*K,se)}}else if(U!==void 0){const _e=U[te];if(_e!==void 0)switch(_e.length){case 2:i.vertexAttrib2fv(Z.location,_e);break;case 3:i.vertexAttrib3fv(Z.location,_e);break;case 4:i.vertexAttrib4fv(Z.location,_e);break;default:i.vertexAttrib1fv(Z.location,_e)}}}}M()}function R(){b();for(const C in n){const k=n[C];for(const z in k){const q=k[z];for(const B in q){const G=q[B];for(const U in G)h(G[U].object),delete G[U];delete q[B]}}delete n[C]}}function S(C){if(n[C.id]===void 0)return;const k=n[C.id];for(const z in k){const q=k[z];for(const B in q){const G=q[B];for(const U in G)h(G[U].object),delete G[U];delete q[B]}}delete n[C.id]}function A(C){for(const k in n){const z=n[k];for(const q in z){const B=z[q];if(B[C.id]===void 0)continue;const G=B[C.id];for(const U in G)h(G[U].object),delete G[U];delete B[C.id]}}}function v(C){for(const k in n){const z=n[k],q=C.isInstancedMesh===!0?C.id:0,B=z[q];if(B!==void 0){for(const G in B){const U=B[G];for(const te in U)h(U[te].object),delete U[te];delete B[G]}delete z[q],Object.keys(z).length===0&&delete n[k]}}}function b(){X(),a=!0,r!==s&&(r=s,c(r.object))}function X(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:b,resetDefaultState:X,dispose:R,releaseStatesOfGeometry:S,releaseStatesOfObject:v,releaseStatesOfProgram:A,initAttributes:x,enableAttribute:f,disableUnusedAttributes:M}}function np(i,e,t){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),t.update(h,n,1)}function a(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function o(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let m=0;for(let g=0;g<u;g++)m+=h[g];t.update(m,n,1)}function l(c,h,u,d){if(u===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let g=0;g<c.length;g++)a(c[g],h[g],d[g]);else{m.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,u);let g=0;for(let x=0;x<u;x++)g+=h[x]*d[x];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function ip(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(A){return!(A!==yn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const v=A===nn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==tn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==vn&&!v)}function l(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(Le("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),m=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),f=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),T=i.getParameter(i.MAX_VARYING_VECTORS),w=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),R=i.getParameter(i.MAX_SAMPLES),S=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:m,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:f,maxAttributes:p,maxVertexUniforms:M,maxVaryings:T,maxFragmentUniforms:w,maxSamples:R,samples:S}}function sp(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new pi,o=new ke,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const m=u.length!==0||d||n!==0||s;return s=d,n=u.length,m},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,m){const g=u.clippingPlanes,x=u.clipIntersection,f=u.clipShadows,p=i.get(u);if(!s||g===null||g.length===0||r&&!f)r?h(null):c();else{const M=r?0:n,T=M*4;let w=p.clippingState||null;l.value=w,w=h(g,d,T,m);for(let R=0;R!==T;++R)w[R]=t[R];p.clippingState=w,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,m,g){const x=u!==null?u.length:0;let f=null;if(x!==0){if(f=l.value,g!==!0||f===null){const p=m+x*4,M=d.matrixWorldInverse;o.getNormalMatrix(M),(f===null||f.length<p)&&(f=new Float32Array(p));for(let T=0,w=m;T!==x;++T,w+=4)a.copy(u[T]).applyMatrix4(M,o),a.normal.toArray(f,w),f[w+3]=a.constant}l.value=f,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,f}}const ti=4,ul=[.125,.215,.35,.446,.526,.582],gi=20,rp=256,os=new Ts,fl=new Ne;let Jr=null,ea=0,ta=0,na=!1;const ap=new F;class pl{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){const{size:a=256,position:o=ap}=r;Jr=this._renderer.getRenderTarget(),ea=this._renderer.getActiveCubeFace(),ta=this._renderer.getActiveMipmapLevel(),na=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=_l(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=gl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Jr,ea,ta),this._renderer.xr.enabled=na,e.scissorTest=!1,Bi(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===vi||e.mapping===Xi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Jr=this._renderer.getRenderTarget(),ea=this._renderer.getActiveCubeFace(),ta=this._renderer.getActiveMipmapLevel(),na=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:vt,minFilter:vt,generateMipmaps:!1,type:nn,format:yn,colorSpace:Yi,depthBuffer:!1},s=ml(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ml(e,t,n);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=op(r)),this._blurMaterial=cp(r,e,t),this._ggxMaterial=lp(r,e,t)}return s}_compileMaterial(e){const t=new qe(new on,e);this._renderer.compile(t,os)}_sceneToCubeUV(e,t,n,s,r){const l=new gn(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,m=u.toneMapping;u.getClearColor(fl),u.toneMapping=Dn,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new qe(new ws,new dt({name:"PMREM.Background",side:Kt,depthWrite:!1,depthTest:!1})));const x=this._backgroundBox,f=x.material;let p=!1;const M=e.background;M?M.isColor&&(f.color.copy(M),e.background=null,p=!0):(f.color.copy(fl),p=!0);for(let T=0;T<6;T++){const w=T%3;w===0?(l.up.set(0,c[T],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[T],r.y,r.z)):w===1?(l.up.set(0,0,c[T]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[T],r.z)):(l.up.set(0,c[T],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[T]));const R=this._cubeSize;Bi(s,w*R,T>2?R:0,R,R),u.setRenderTarget(s),p&&u.render(x,l),u.render(e,l)}u.toneMapping=m,u.autoClear=d,e.background=M}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===vi||e.mapping===Xi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=_l()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=gl());const r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;const o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;Bi(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,os)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){const s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;const l=a.uniforms,c=n/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=0+c*1.25,m=u*d,{_lodMax:g}=this,x=this._sizeLods[n],f=3*x*(n>g-ti?n-g+ti:0),p=4*(this._cubeSize-x);l.envMap.value=e.texture,l.roughness.value=m,l.mipInt.value=g-t,Bi(r,f,p,3*x,2*x),s.setRenderTarget(r),s.render(o,os),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,Bi(e,f,p,3*x,2*x),s.setRenderTarget(e),s.render(o,os)}_blur(e,t,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&je("blur direction must be either latitudinal or longitudinal!");const h=3,u=this._lodMeshes[s];u.material=c;const d=c.uniforms,m=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*m):2*Math.PI/(2*gi-1),x=r/g,f=isFinite(r)?1+Math.floor(h*x):gi;f>gi&&Le(`sigmaRadians, ${r}, is too large and will clip, as it requested ${f} samples when the maximum is set to ${gi}`);const p=[];let M=0;for(let A=0;A<gi;++A){const v=A/x,b=Math.exp(-v*v/2);p.push(b),A===0?M+=b:A<f&&(M+=2*b)}for(let A=0;A<p.length;A++)p[A]=p[A]/M;d.envMap.value=e.texture,d.samples.value=f,d.weights.value=p,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:T}=this;d.dTheta.value=g,d.mipInt.value=T-n;const w=this._sizeLods[s],R=3*w*(s>T-ti?s-T+ti:0),S=4*(this._cubeSize-w);Bi(t,R,S,3*w,2*w),l.setRenderTarget(t),l.render(u,os)}}function op(i){const e=[],t=[],n=[];let s=i;const r=i-ti+1+ul.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let l=1/o;a>i-ti?l=ul[a-i+ti-1]:a===0&&(l=0),t.push(l);const c=1/(o-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],m=6,g=6,x=3,f=2,p=1,M=new Float32Array(x*g*m),T=new Float32Array(f*g*m),w=new Float32Array(p*g*m);for(let S=0;S<m;S++){const A=S%3*2/3-1,v=S>2?0:-1,b=[A,v,0,A+2/3,v,0,A+2/3,v+1,0,A,v,0,A+2/3,v+1,0,A,v+1,0];M.set(b,x*g*S),T.set(d,f*g*S);const X=[S,S,S,S,S,S];w.set(X,p*g*S)}const R=new on;R.setAttribute("position",new Sn(M,x)),R.setAttribute("uv",new Sn(T,f)),R.setAttribute("faceIndex",new Sn(w,p)),n.push(new qe(R,null)),s>ti&&s--}return{lodMeshes:n,sizeLods:e,sigmas:t}}function ml(i,e,t){const n=new jt(i,e,t);return n.texture.mapping=xr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Bi(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function lp(i,e,t){return new Gt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:rp,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:vr(),fragmentShader:`

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
		`,blending:Pn,depthTest:!1,depthWrite:!1})}function cp(i,e,t){const n=new Float32Array(gi),s=new F(0,1,0);return new Gt({name:"SphericalGaussianBlur",defines:{n:gi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:vr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Pn,depthTest:!1,depthWrite:!1})}function gl(){return new Gt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:vr(),fragmentShader:`

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
		`,blending:Pn,depthTest:!1,depthWrite:!1})}function _l(){return new Gt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:vr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Pn,depthTest:!1,depthWrite:!1})}function vr(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class Ec extends jt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new _c(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new ws(5,5,5),r=new Gt({name:"CubemapFromEquirect",uniforms:$i(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Kt,blending:Pn});r.uniforms.tEquirect.value=t;const a=new qe(s,r),o=t.minFilter;return t.minFilter===_i&&(t.minFilter=vt),new ud(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}function hp(i){let e=new WeakMap,t=new WeakMap,n=null;function s(d,m=!1){return d==null?null:m?a(d):r(d)}function r(d){if(d&&d.isTexture){const m=d.mapping;if(m===Er||m===wr)if(e.has(d)){const g=e.get(d).texture;return o(g,d.mapping)}else{const g=d.image;if(g&&g.height>0){const x=new Ec(g.height);return x.fromEquirectangularTexture(i,d),e.set(d,x),d.addEventListener("dispose",c),o(x.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture){const m=d.mapping,g=m===Er||m===wr,x=m===vi||m===Xi;if(g||x){let f=t.get(d);const p=f!==void 0?f.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==p)return n===null&&(n=new pl(i)),f=g?n.fromEquirectangular(d,f):n.fromCubemap(d,f),f.texture.pmremVersion=d.pmremVersion,t.set(d,f),f.texture;if(f!==void 0)return f.texture;{const M=d.image;return g&&M&&M.height>0||x&&M&&l(M)?(n===null&&(n=new pl(i)),f=g?n.fromEquirectangular(d):n.fromCubemap(d),f.texture.pmremVersion=d.pmremVersion,t.set(d,f),d.addEventListener("dispose",h),f.texture):null}}}return d}function o(d,m){return m===Er?d.mapping=vi:m===wr&&(d.mapping=Xi),d}function l(d){let m=0;const g=6;for(let x=0;x<g;x++)d[x]!==void 0&&m++;return m===g}function c(d){const m=d.target;m.removeEventListener("dispose",c);const g=e.get(m);g!==void 0&&(e.delete(m),g.dispose())}function h(d){const m=d.target;m.removeEventListener("dispose",h);const g=t.get(m);g!==void 0&&(t.delete(m),g.dispose())}function u(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:u}}function dp(i){const e={};function t(n){if(e[n]!==void 0)return e[n];const s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&fr("WebGLRenderer: "+n+" extension not supported."),s}}}function up(i,e,t,n){const s={},r=new WeakMap;function a(u){const d=u.target;d.index!==null&&e.remove(d.index);for(const g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",a),delete s[d.id];const m=r.get(d);m&&(e.remove(m),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(u,d){return s[d.id]===!0||(d.addEventListener("dispose",a),s[d.id]=!0,t.memory.geometries++),d}function l(u){const d=u.attributes;for(const m in d)e.update(d[m],i.ARRAY_BUFFER)}function c(u){const d=[],m=u.index,g=u.attributes.position;let x=0;if(g===void 0)return;if(m!==null){const M=m.array;x=m.version;for(let T=0,w=M.length;T<w;T+=3){const R=M[T+0],S=M[T+1],A=M[T+2];d.push(R,S,S,A,A,R)}}else{const M=g.array;x=g.version;for(let T=0,w=M.length/3-1;T<w;T+=3){const R=T+0,S=T+1,A=T+2;d.push(R,S,S,A,A,R)}}const f=new(g.count>=65535?mc:pc)(d,1);f.version=x;const p=r.get(u);p&&e.remove(p),r.set(u,f)}function h(u){const d=r.get(u);if(d){const m=u.index;m!==null&&d.version<m.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function fp(i,e,t){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,m){i.drawElements(n,m,r,d*a),t.update(m,n,1)}function c(d,m,g){g!==0&&(i.drawElementsInstanced(n,m,r,d*a,g),t.update(m,n,g))}function h(d,m,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,m,0,r,d,0,g);let f=0;for(let p=0;p<g;p++)f+=m[p];t.update(f,n,1)}function u(d,m,g,x){if(g===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let p=0;p<d.length;p++)c(d[p]/a,m[p],x[p]);else{f.multiDrawElementsInstancedWEBGL(n,m,0,r,d,0,x,0,g);let p=0;for(let M=0;M<g;M++)p+=m[M]*x[M];t.update(p,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function pp(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:je("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function mp(i,e,t){const n=new WeakMap,s=new xt;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let d=n.get(o);if(d===void 0||d.count!==u){let X=function(){v.dispose(),n.delete(o),o.removeEventListener("dispose",X)};var m=X;d!==void 0&&d.texture.dispose();const g=o.morphAttributes.position!==void 0,x=o.morphAttributes.normal!==void 0,f=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],M=o.morphAttributes.normal||[],T=o.morphAttributes.color||[];let w=0;g===!0&&(w=1),x===!0&&(w=2),f===!0&&(w=3);let R=o.attributes.position.count*w,S=1;R>e.maxTextureSize&&(S=Math.ceil(R/e.maxTextureSize),R=e.maxTextureSize);const A=new Float32Array(R*S*4*u),v=new dc(A,R,S,u);v.type=vn,v.needsUpdate=!0;const b=w*4;for(let C=0;C<u;C++){const k=p[C],z=M[C],q=T[C],B=R*S*4*C;for(let G=0;G<k.count;G++){const U=G*b;g===!0&&(s.fromBufferAttribute(k,G),A[B+U+0]=s.x,A[B+U+1]=s.y,A[B+U+2]=s.z,A[B+U+3]=0),x===!0&&(s.fromBufferAttribute(z,G),A[B+U+4]=s.x,A[B+U+5]=s.y,A[B+U+6]=s.z,A[B+U+7]=0),f===!0&&(s.fromBufferAttribute(q,G),A[B+U+8]=s.x,A[B+U+9]=s.y,A[B+U+10]=s.z,A[B+U+11]=q.itemSize===4?s.w:1)}}d={count:u,texture:v,size:new Ue(R,S)},n.set(o,d),o.addEventListener("dispose",X)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let g=0;for(let f=0;f<c.length;f++)g+=c[f];const x=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",x),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function gp(i,e,t,n,s){let r=new WeakMap;function a(c){const h=s.render.frame,u=c.geometry,d=e.get(c,u);if(r.get(d)!==h&&(e.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){const m=c.skeleton;r.get(m)!==h&&(m.update(),r.set(m,h))}return d}function o(){r=new WeakMap}function l(c){const h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}const _p={[Kl]:"LINEAR_TONE_MAPPING",[jl]:"REINHARD_TONE_MAPPING",[Zl]:"CINEON_TONE_MAPPING",[Ql]:"ACES_FILMIC_TONE_MAPPING",[ec]:"AGX_TONE_MAPPING",[tc]:"NEUTRAL_TONE_MAPPING",[Jl]:"CUSTOM_TONE_MAPPING"};function xp(i,e,t,n,s){const r=new jt(e,t,{type:i,depthBuffer:n,stencilBuffer:s}),a=new jt(e,t,{type:nn,depthBuffer:!1,stencilBuffer:!1}),o=new on;o.setAttribute("position",new Ft([-1,3,0,-1,-1,0,3,-1,0],3)),o.setAttribute("uv",new Ft([0,2,0,0,2,0],2));const l=new td({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),c=new qe(o,l),h=new Ts(-1,1,1,-1,0,1);let u=null,d=null,m=!1,g,x=null,f=[],p=!1;this.setSize=function(M,T){r.setSize(M,T),a.setSize(M,T);for(let w=0;w<f.length;w++){const R=f[w];R.setSize&&R.setSize(M,T)}},this.setEffects=function(M){f=M,p=f.length>0&&f[0].isRenderPass===!0;const T=r.width,w=r.height;for(let R=0;R<f.length;R++){const S=f[R];S.setSize&&S.setSize(T,w)}},this.begin=function(M,T){if(m||M.toneMapping===Dn&&f.length===0)return!1;if(x=T,T!==null){const w=T.width,R=T.height;(r.width!==w||r.height!==R)&&this.setSize(w,R)}return p===!1&&M.setRenderTarget(r),g=M.toneMapping,M.toneMapping=Dn,!0},this.hasRenderPass=function(){return p},this.end=function(M,T){M.toneMapping=g,m=!0;let w=r,R=a;for(let S=0;S<f.length;S++){const A=f[S];if(A.enabled!==!1&&(A.render(M,R,w,T),A.needsSwap!==!1)){const v=w;w=R,R=v}}if(u!==M.outputColorSpace||d!==M.toneMapping){u=M.outputColorSpace,d=M.toneMapping,l.defines={},$e.getTransfer(u)===tt&&(l.defines.SRGB_TRANSFER="");const S=_p[d];S&&(l.defines[S]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=w.texture,M.setRenderTarget(x),M.render(c,h),x=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){r.dispose(),a.dispose(),o.dispose(),l.dispose()}}const wc=new Lt,io=new ys(1,1),Tc=new dc,Ac=new Dh,Cc=new _c,xl=[],vl=[],yl=new Float32Array(16),Sl=new Float32Array(9),Ml=new Float32Array(4);function Ji(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=xl[s];if(r===void 0&&(r=new Float32Array(s),xl[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Tt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function At(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function yr(i,e){let t=vl[e];t===void 0&&(t=new Int32Array(e),vl[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function vp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function yp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;i.uniform2fv(this.addr,e),At(t,e)}}function Sp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Tt(t,e))return;i.uniform3fv(this.addr,e),At(t,e)}}function Mp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;i.uniform4fv(this.addr,e),At(t,e)}}function bp(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Tt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),At(t,e)}else{if(Tt(t,n))return;Ml.set(n),i.uniformMatrix2fv(this.addr,!1,Ml),At(t,n)}}function Ep(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Tt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),At(t,e)}else{if(Tt(t,n))return;Sl.set(n),i.uniformMatrix3fv(this.addr,!1,Sl),At(t,n)}}function wp(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Tt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),At(t,e)}else{if(Tt(t,n))return;yl.set(n),i.uniformMatrix4fv(this.addr,!1,yl),At(t,n)}}function Tp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Ap(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;i.uniform2iv(this.addr,e),At(t,e)}}function Cp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Tt(t,e))return;i.uniform3iv(this.addr,e),At(t,e)}}function Rp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;i.uniform4iv(this.addr,e),At(t,e)}}function Pp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Dp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;i.uniform2uiv(this.addr,e),At(t,e)}}function Ip(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Tt(t,e))return;i.uniform3uiv(this.addr,e),At(t,e)}}function Lp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;i.uniform4uiv(this.addr,e),At(t,e)}}function Up(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(io.compareFunction=t.isReversedDepthBuffer()?vo:xo,r=io):r=wc,t.setTexture2D(e||r,s)}function Fp(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Ac,s)}function Np(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Cc,s)}function Op(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Tc,s)}function Bp(i){switch(i){case 5126:return vp;case 35664:return yp;case 35665:return Sp;case 35666:return Mp;case 35674:return bp;case 35675:return Ep;case 35676:return wp;case 5124:case 35670:return Tp;case 35667:case 35671:return Ap;case 35668:case 35672:return Cp;case 35669:case 35673:return Rp;case 5125:return Pp;case 36294:return Dp;case 36295:return Ip;case 36296:return Lp;case 35678:case 36198:case 36298:case 36306:case 35682:return Up;case 35679:case 36299:case 36307:return Fp;case 35680:case 36300:case 36308:case 36293:return Np;case 36289:case 36303:case 36311:case 36292:return Op}}function kp(i,e){i.uniform1fv(this.addr,e)}function zp(i,e){const t=Ji(e,this.size,2);i.uniform2fv(this.addr,t)}function Hp(i,e){const t=Ji(e,this.size,3);i.uniform3fv(this.addr,t)}function Gp(i,e){const t=Ji(e,this.size,4);i.uniform4fv(this.addr,t)}function Vp(i,e){const t=Ji(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Wp(i,e){const t=Ji(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Xp(i,e){const t=Ji(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function qp(i,e){i.uniform1iv(this.addr,e)}function Yp(i,e){i.uniform2iv(this.addr,e)}function $p(i,e){i.uniform3iv(this.addr,e)}function Kp(i,e){i.uniform4iv(this.addr,e)}function jp(i,e){i.uniform1uiv(this.addr,e)}function Zp(i,e){i.uniform2uiv(this.addr,e)}function Qp(i,e){i.uniform3uiv(this.addr,e)}function Jp(i,e){i.uniform4uiv(this.addr,e)}function em(i,e,t){const n=this.cache,s=e.length,r=yr(t,s);Tt(n,r)||(i.uniform1iv(this.addr,r),At(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=io:a=wc;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function tm(i,e,t){const n=this.cache,s=e.length,r=yr(t,s);Tt(n,r)||(i.uniform1iv(this.addr,r),At(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Ac,r[a])}function nm(i,e,t){const n=this.cache,s=e.length,r=yr(t,s);Tt(n,r)||(i.uniform1iv(this.addr,r),At(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||Cc,r[a])}function im(i,e,t){const n=this.cache,s=e.length,r=yr(t,s);Tt(n,r)||(i.uniform1iv(this.addr,r),At(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Tc,r[a])}function sm(i){switch(i){case 5126:return kp;case 35664:return zp;case 35665:return Hp;case 35666:return Gp;case 35674:return Vp;case 35675:return Wp;case 35676:return Xp;case 5124:case 35670:return qp;case 35667:case 35671:return Yp;case 35668:case 35672:return $p;case 35669:case 35673:return Kp;case 5125:return jp;case 36294:return Zp;case 36295:return Qp;case 36296:return Jp;case 35678:case 36198:case 36298:case 36306:case 35682:return em;case 35679:case 36299:case 36307:return tm;case 35680:case 36300:case 36308:case 36293:return nm;case 36289:case 36303:case 36311:case 36292:return im}}class rm{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Bp(t.type)}}class am{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=sm(t.type)}}class om{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const ia=/(\w+)(\])?(\[|\.)?/g;function bl(i,e){i.seq.push(e),i.map[e.id]=e}function lm(i,e,t){const n=i.name,s=n.length;for(ia.lastIndex=0;;){const r=ia.exec(n),a=ia.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){bl(t,c===void 0?new rm(o,i,e):new am(o,i,e));break}else{let u=t.map[o];u===void 0&&(u=new om(o),bl(t,u)),t=u}}}class or{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);lm(o,l,this)}const s=[],r=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function El(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const cm=37297;let hm=0;function dm(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const wl=new ke;function um(i){$e._getMatrix(wl,$e.workingColorSpace,i);const e=`mat3( ${wl.elements.map(t=>t.toFixed(4))} )`;switch($e.getTransfer(i)){case ur:return[e,"LinearTransferOETF"];case tt:return[e,"sRGBTransferOETF"];default:return Le("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Tl(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+dm(i.getShaderSource(e),o)}else return r}function fm(i,e){const t=um(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const pm={[Kl]:"Linear",[jl]:"Reinhard",[Zl]:"Cineon",[Ql]:"ACESFilmic",[ec]:"AgX",[tc]:"Neutral",[Jl]:"Custom"};function mm(i,e){const t=pm[e];return t===void 0?(Le("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Qs=new F;function gm(){$e.getLuminanceCoefficients(Qs);const i=Qs.x.toFixed(4),e=Qs.y.toFixed(4),t=Qs.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function _m(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ps).join(`
`)}function xm(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function vm(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function ps(i){return i!==""}function Al(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Cl(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const ym=/^[ \t]*#include +<([\w\d./]+)>/gm;function so(i){return i.replace(ym,Mm)}const Sm=new Map;function Mm(i,e){let t=He[e];if(t===void 0){const n=Sm.get(e);if(n!==void 0)t=He[n],Le('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return so(t)}const bm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Rl(i){return i.replace(bm,Em)}function Em(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Pl(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const wm={[nr]:"SHADOWMAP_TYPE_PCF",[fs]:"SHADOWMAP_TYPE_VSM"};function Tm(i){return wm[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const Am={[vi]:"ENVMAP_TYPE_CUBE",[Xi]:"ENVMAP_TYPE_CUBE",[xr]:"ENVMAP_TYPE_CUBE_UV"};function Cm(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":Am[i.envMapMode]||"ENVMAP_TYPE_CUBE"}const Rm={[Xi]:"ENVMAP_MODE_REFRACTION"};function Pm(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Rm[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Dm={[$l]:"ENVMAP_BLENDING_MULTIPLY",[hh]:"ENVMAP_BLENDING_MIX",[dh]:"ENVMAP_BLENDING_ADD"};function Im(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Dm[i.combine]||"ENVMAP_BLENDING_NONE"}function Lm(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Um(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=Tm(t),c=Cm(t),h=Pm(t),u=Im(t),d=Lm(t),m=_m(t),g=xm(r),x=s.createProgram();let f,p,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ps).join(`
`),f.length>0&&(f+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ps).join(`
`),p.length>0&&(p+=`
`)):(f=[Pl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ps).join(`
`),p=[Pl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Dn?"#define TONE_MAPPING":"",t.toneMapping!==Dn?He.tonemapping_pars_fragment:"",t.toneMapping!==Dn?mm("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",He.colorspace_pars_fragment,fm("linearToOutputTexel",t.outputColorSpace),gm(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ps).join(`
`)),a=so(a),a=Al(a,t),a=Cl(a,t),o=so(o),o=Al(o,t),o=Cl(o,t),a=Rl(a),o=Rl(o),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,f=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,p=["#define varying in",t.glslVersion===zo?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===zo?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const T=M+f+a,w=M+p+o,R=El(s,s.VERTEX_SHADER,T),S=El(s,s.FRAGMENT_SHADER,w);s.attachShader(x,R),s.attachShader(x,S),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function A(C){if(i.debug.checkShaderErrors){const k=s.getProgramInfoLog(x)||"",z=s.getShaderInfoLog(R)||"",q=s.getShaderInfoLog(S)||"",B=k.trim(),G=z.trim(),U=q.trim();let te=!0,Z=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(te=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,R,S);else{const ue=Tl(s,R,"vertex"),_e=Tl(s,S,"fragment");je("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+B+`
`+ue+`
`+_e)}else B!==""?Le("WebGLProgram: Program Info Log:",B):(G===""||U==="")&&(Z=!1);Z&&(C.diagnostics={runnable:te,programLog:B,vertexShader:{log:G,prefix:f},fragmentShader:{log:U,prefix:p}})}s.deleteShader(R),s.deleteShader(S),v=new or(s,x),b=vm(s,x)}let v;this.getUniforms=function(){return v===void 0&&A(this),v};let b;this.getAttributes=function(){return b===void 0&&A(this),b};let X=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return X===!1&&(X=s.getProgramParameter(x,cm)),X},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=hm++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=R,this.fragmentShader=S,this}let Fm=0;class Nm{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new Om(e),t.set(e,n)),n}}class Om{constructor(e){this.id=Fm++,this.code=e,this.usedTimes=0}}function Bm(i,e,t,n,s,r){const a=new uc,o=new Nm,l=new Set,c=[],h=new Map,u=n.logarithmicDepthBuffer;let d=n.precision;const m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(v){return l.add(v),v===0?"uv":`uv${v}`}function x(v,b,X,C,k){const z=C.fog,q=k.geometry,B=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?C.environment:null,G=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,U=e.get(v.envMap||B,G),te=U&&U.mapping===xr?U.image.height:null,Z=m[v.type];v.precision!==null&&(d=n.getMaxPrecision(v.precision),d!==v.precision&&Le("WebGLProgram.getParameters:",v.precision,"not supported, using",d,"instead."));const ue=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,_e=ue!==void 0?ue.length:0;let pe=0;q.morphAttributes.position!==void 0&&(pe=1),q.morphAttributes.normal!==void 0&&(pe=2),q.morphAttributes.color!==void 0&&(pe=3);let ze,gt,ft,K;if(Z){const et=An[Z];ze=et.vertexShader,gt=et.fragmentShader}else ze=v.vertexShader,gt=v.fragmentShader,o.update(v),ft=o.getVertexShaderID(v),K=o.getFragmentShaderID(v);const se=i.getRenderTarget(),oe=i.state.buffers.depth.getReversed(),Be=k.isInstancedMesh===!0,Re=k.isBatchedMesh===!0,Ie=!!v.map,Ct=!!v.matcap,Ye=!!U,Je=!!v.aoMap,st=!!v.lightMap,Ge=!!v.bumpMap,yt=!!v.normalMap,P=!!v.displacementMap,bt=!!v.emissiveMap,Qe=!!v.metalnessMap,at=!!v.roughnessMap,be=v.anisotropy>0,E=v.clearcoat>0,_=v.dispersion>0,I=v.iridescence>0,Y=v.sheen>0,j=v.transmission>0,W=be&&!!v.anisotropyMap,xe=E&&!!v.clearcoatMap,re=E&&!!v.clearcoatNormalMap,Ae=E&&!!v.clearcoatRoughnessMap,De=I&&!!v.iridescenceMap,Q=I&&!!v.iridescenceThicknessMap,ne=Y&&!!v.sheenColorMap,ve=Y&&!!v.sheenRoughnessMap,Se=!!v.specularMap,fe=!!v.specularColorMap,Ve=!!v.specularIntensityMap,D=j&&!!v.transmissionMap,ae=j&&!!v.thicknessMap,ie=!!v.gradientMap,ge=!!v.alphaMap,J=v.alphaTest>0,V=!!v.alphaHash,ye=!!v.extensions;let Fe=Dn;v.toneMapped&&(se===null||se.isXRRenderTarget===!0)&&(Fe=i.toneMapping);const ot={shaderID:Z,shaderType:v.type,shaderName:v.name,vertexShader:ze,fragmentShader:gt,defines:v.defines,customVertexShaderID:ft,customFragmentShaderID:K,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:d,batching:Re,batchingColor:Re&&k._colorsTexture!==null,instancing:Be,instancingColor:Be&&k.instanceColor!==null,instancingMorph:Be&&k.morphTexture!==null,outputColorSpace:se===null?i.outputColorSpace:se.isXRRenderTarget===!0?se.texture.colorSpace:Yi,alphaToCoverage:!!v.alphaToCoverage,map:Ie,matcap:Ct,envMap:Ye,envMapMode:Ye&&U.mapping,envMapCubeUVHeight:te,aoMap:Je,lightMap:st,bumpMap:Ge,normalMap:yt,displacementMap:P,emissiveMap:bt,normalMapObjectSpace:yt&&v.normalMapType===ph,normalMapTangentSpace:yt&&v.normalMapType===cc,metalnessMap:Qe,roughnessMap:at,anisotropy:be,anisotropyMap:W,clearcoat:E,clearcoatMap:xe,clearcoatNormalMap:re,clearcoatRoughnessMap:Ae,dispersion:_,iridescence:I,iridescenceMap:De,iridescenceThicknessMap:Q,sheen:Y,sheenColorMap:ne,sheenRoughnessMap:ve,specularMap:Se,specularColorMap:fe,specularIntensityMap:Ve,transmission:j,transmissionMap:D,thicknessMap:ae,gradientMap:ie,opaque:v.transparent===!1&&v.blending===Gi&&v.alphaToCoverage===!1,alphaMap:ge,alphaTest:J,alphaHash:V,combine:v.combine,mapUv:Ie&&g(v.map.channel),aoMapUv:Je&&g(v.aoMap.channel),lightMapUv:st&&g(v.lightMap.channel),bumpMapUv:Ge&&g(v.bumpMap.channel),normalMapUv:yt&&g(v.normalMap.channel),displacementMapUv:P&&g(v.displacementMap.channel),emissiveMapUv:bt&&g(v.emissiveMap.channel),metalnessMapUv:Qe&&g(v.metalnessMap.channel),roughnessMapUv:at&&g(v.roughnessMap.channel),anisotropyMapUv:W&&g(v.anisotropyMap.channel),clearcoatMapUv:xe&&g(v.clearcoatMap.channel),clearcoatNormalMapUv:re&&g(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ae&&g(v.clearcoatRoughnessMap.channel),iridescenceMapUv:De&&g(v.iridescenceMap.channel),iridescenceThicknessMapUv:Q&&g(v.iridescenceThicknessMap.channel),sheenColorMapUv:ne&&g(v.sheenColorMap.channel),sheenRoughnessMapUv:ve&&g(v.sheenRoughnessMap.channel),specularMapUv:Se&&g(v.specularMap.channel),specularColorMapUv:fe&&g(v.specularColorMap.channel),specularIntensityMapUv:Ve&&g(v.specularIntensityMap.channel),transmissionMapUv:D&&g(v.transmissionMap.channel),thicknessMapUv:ae&&g(v.thicknessMap.channel),alphaMapUv:ge&&g(v.alphaMap.channel),vertexTangents:!!q.attributes.tangent&&(yt||be),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!q.attributes.uv&&(Ie||ge),fog:!!z,useFog:v.fog===!0,fogExp2:!!z&&z.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||q.attributes.normal===void 0&&yt===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:oe,skinning:k.isSkinnedMesh===!0,morphTargets:q.morphAttributes.position!==void 0,morphNormals:q.morphAttributes.normal!==void 0,morphColors:q.morphAttributes.color!==void 0,morphTargetsCount:_e,morphTextureStride:pe,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:v.dithering,shadowMapEnabled:i.shadowMap.enabled&&X.length>0,shadowMapType:i.shadowMap.type,toneMapping:Fe,decodeVideoTexture:Ie&&v.map.isVideoTexture===!0&&$e.getTransfer(v.map.colorSpace)===tt,decodeVideoTextureEmissive:bt&&v.emissiveMap.isVideoTexture===!0&&$e.getTransfer(v.emissiveMap.colorSpace)===tt,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Cn,flipSided:v.side===Kt,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:ye&&v.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ye&&v.extensions.multiDraw===!0||Re)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return ot.vertexUv1s=l.has(1),ot.vertexUv2s=l.has(2),ot.vertexUv3s=l.has(3),l.clear(),ot}function f(v){const b=[];if(v.shaderID?b.push(v.shaderID):(b.push(v.customVertexShaderID),b.push(v.customFragmentShaderID)),v.defines!==void 0)for(const X in v.defines)b.push(X),b.push(v.defines[X]);return v.isRawShaderMaterial===!1&&(p(b,v),M(b,v),b.push(i.outputColorSpace)),b.push(v.customProgramCacheKey),b.join()}function p(v,b){v.push(b.precision),v.push(b.outputColorSpace),v.push(b.envMapMode),v.push(b.envMapCubeUVHeight),v.push(b.mapUv),v.push(b.alphaMapUv),v.push(b.lightMapUv),v.push(b.aoMapUv),v.push(b.bumpMapUv),v.push(b.normalMapUv),v.push(b.displacementMapUv),v.push(b.emissiveMapUv),v.push(b.metalnessMapUv),v.push(b.roughnessMapUv),v.push(b.anisotropyMapUv),v.push(b.clearcoatMapUv),v.push(b.clearcoatNormalMapUv),v.push(b.clearcoatRoughnessMapUv),v.push(b.iridescenceMapUv),v.push(b.iridescenceThicknessMapUv),v.push(b.sheenColorMapUv),v.push(b.sheenRoughnessMapUv),v.push(b.specularMapUv),v.push(b.specularColorMapUv),v.push(b.specularIntensityMapUv),v.push(b.transmissionMapUv),v.push(b.thicknessMapUv),v.push(b.combine),v.push(b.fogExp2),v.push(b.sizeAttenuation),v.push(b.morphTargetsCount),v.push(b.morphAttributeCount),v.push(b.numDirLights),v.push(b.numPointLights),v.push(b.numSpotLights),v.push(b.numSpotLightMaps),v.push(b.numHemiLights),v.push(b.numRectAreaLights),v.push(b.numDirLightShadows),v.push(b.numPointLightShadows),v.push(b.numSpotLightShadows),v.push(b.numSpotLightShadowsWithMaps),v.push(b.numLightProbes),v.push(b.shadowMapType),v.push(b.toneMapping),v.push(b.numClippingPlanes),v.push(b.numClipIntersection),v.push(b.depthPacking)}function M(v,b){a.disableAll(),b.instancing&&a.enable(0),b.instancingColor&&a.enable(1),b.instancingMorph&&a.enable(2),b.matcap&&a.enable(3),b.envMap&&a.enable(4),b.normalMapObjectSpace&&a.enable(5),b.normalMapTangentSpace&&a.enable(6),b.clearcoat&&a.enable(7),b.iridescence&&a.enable(8),b.alphaTest&&a.enable(9),b.vertexColors&&a.enable(10),b.vertexAlphas&&a.enable(11),b.vertexUv1s&&a.enable(12),b.vertexUv2s&&a.enable(13),b.vertexUv3s&&a.enable(14),b.vertexTangents&&a.enable(15),b.anisotropy&&a.enable(16),b.alphaHash&&a.enable(17),b.batching&&a.enable(18),b.dispersion&&a.enable(19),b.batchingColor&&a.enable(20),b.gradientMap&&a.enable(21),v.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.reversedDepthBuffer&&a.enable(4),b.skinning&&a.enable(5),b.morphTargets&&a.enable(6),b.morphNormals&&a.enable(7),b.morphColors&&a.enable(8),b.premultipliedAlpha&&a.enable(9),b.shadowMapEnabled&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.decodeVideoTextureEmissive&&a.enable(20),b.alphaToCoverage&&a.enable(21),v.push(a.mask)}function T(v){const b=m[v.type];let X;if(b){const C=An[b];X=pr.clone(C.uniforms)}else X=v.uniforms;return X}function w(v,b){let X=h.get(b);return X!==void 0?++X.usedTimes:(X=new Um(i,b,v,s),c.push(X),h.set(b,X)),X}function R(v){if(--v.usedTimes===0){const b=c.indexOf(v);c[b]=c[c.length-1],c.pop(),h.delete(v.cacheKey),v.destroy()}}function S(v){o.remove(v)}function A(){o.dispose()}return{getParameters:x,getProgramCacheKey:f,getUniforms:T,acquireProgram:w,releaseProgram:R,releaseShaderCache:S,programs:c,dispose:A}}function km(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function zm(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Dl(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Il(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(d){let m=0;return d.isInstancedMesh&&(m+=2),d.isSkinnedMesh&&(m+=1),m}function o(d,m,g,x,f,p){let M=i[e];return M===void 0?(M={id:d.id,object:d,geometry:m,material:g,materialVariant:a(d),groupOrder:x,renderOrder:d.renderOrder,z:f,group:p},i[e]=M):(M.id=d.id,M.object=d,M.geometry=m,M.material=g,M.materialVariant=a(d),M.groupOrder=x,M.renderOrder=d.renderOrder,M.z=f,M.group=p),e++,M}function l(d,m,g,x,f,p){const M=o(d,m,g,x,f,p);g.transmission>0?n.push(M):g.transparent===!0?s.push(M):t.push(M)}function c(d,m,g,x,f,p){const M=o(d,m,g,x,f,p);g.transmission>0?n.unshift(M):g.transparent===!0?s.unshift(M):t.unshift(M)}function h(d,m){t.length>1&&t.sort(d||zm),n.length>1&&n.sort(m||Dl),s.length>1&&s.sort(m||Dl)}function u(){for(let d=e,m=i.length;d<m;d++){const g=i[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:u,sort:h}}function Hm(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new Il,i.set(n,[a])):s>=r.length?(a=new Il,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function Gm(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new F,color:new Ne};break;case"SpotLight":t={position:new F,direction:new F,color:new Ne,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new F,color:new Ne,distance:0,decay:0};break;case"HemisphereLight":t={direction:new F,skyColor:new Ne,groundColor:new Ne};break;case"RectAreaLight":t={color:new Ne,position:new F,halfWidth:new F,halfHeight:new F};break}return i[e.id]=t,t}}}function Vm(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let Wm=0;function Xm(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function qm(i){const e=new Gm,t=Vm(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new F);const s=new F,r=new mt,a=new mt;function o(c){let h=0,u=0,d=0;for(let b=0;b<9;b++)n.probe[b].set(0,0,0);let m=0,g=0,x=0,f=0,p=0,M=0,T=0,w=0,R=0,S=0,A=0;c.sort(Xm);for(let b=0,X=c.length;b<X;b++){const C=c[b],k=C.color,z=C.intensity,q=C.distance;let B=null;if(C.shadow&&C.shadow.map&&(C.shadow.map.texture.format===qi?B=C.shadow.map.texture:B=C.shadow.map.depthTexture||C.shadow.map.texture),C.isAmbientLight)h+=k.r*z,u+=k.g*z,d+=k.b*z;else if(C.isLightProbe){for(let G=0;G<9;G++)n.probe[G].addScaledVector(C.sh.coefficients[G],z);A++}else if(C.isDirectionalLight){const G=e.get(C);if(G.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){const U=C.shadow,te=t.get(C);te.shadowIntensity=U.intensity,te.shadowBias=U.bias,te.shadowNormalBias=U.normalBias,te.shadowRadius=U.radius,te.shadowMapSize=U.mapSize,n.directionalShadow[m]=te,n.directionalShadowMap[m]=B,n.directionalShadowMatrix[m]=C.shadow.matrix,M++}n.directional[m]=G,m++}else if(C.isSpotLight){const G=e.get(C);G.position.setFromMatrixPosition(C.matrixWorld),G.color.copy(k).multiplyScalar(z),G.distance=q,G.coneCos=Math.cos(C.angle),G.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),G.decay=C.decay,n.spot[x]=G;const U=C.shadow;if(C.map&&(n.spotLightMap[R]=C.map,R++,U.updateMatrices(C),C.castShadow&&S++),n.spotLightMatrix[x]=U.matrix,C.castShadow){const te=t.get(C);te.shadowIntensity=U.intensity,te.shadowBias=U.bias,te.shadowNormalBias=U.normalBias,te.shadowRadius=U.radius,te.shadowMapSize=U.mapSize,n.spotShadow[x]=te,n.spotShadowMap[x]=B,w++}x++}else if(C.isRectAreaLight){const G=e.get(C);G.color.copy(k).multiplyScalar(z),G.halfWidth.set(C.width*.5,0,0),G.halfHeight.set(0,C.height*.5,0),n.rectArea[f]=G,f++}else if(C.isPointLight){const G=e.get(C);if(G.color.copy(C.color).multiplyScalar(C.intensity),G.distance=C.distance,G.decay=C.decay,C.castShadow){const U=C.shadow,te=t.get(C);te.shadowIntensity=U.intensity,te.shadowBias=U.bias,te.shadowNormalBias=U.normalBias,te.shadowRadius=U.radius,te.shadowMapSize=U.mapSize,te.shadowCameraNear=U.camera.near,te.shadowCameraFar=U.camera.far,n.pointShadow[g]=te,n.pointShadowMap[g]=B,n.pointShadowMatrix[g]=C.shadow.matrix,T++}n.point[g]=G,g++}else if(C.isHemisphereLight){const G=e.get(C);G.skyColor.copy(C.color).multiplyScalar(z),G.groundColor.copy(C.groundColor).multiplyScalar(z),n.hemi[p]=G,p++}}f>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=le.LTC_FLOAT_1,n.rectAreaLTC2=le.LTC_FLOAT_2):(n.rectAreaLTC1=le.LTC_HALF_1,n.rectAreaLTC2=le.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;const v=n.hash;(v.directionalLength!==m||v.pointLength!==g||v.spotLength!==x||v.rectAreaLength!==f||v.hemiLength!==p||v.numDirectionalShadows!==M||v.numPointShadows!==T||v.numSpotShadows!==w||v.numSpotMaps!==R||v.numLightProbes!==A)&&(n.directional.length=m,n.spot.length=x,n.rectArea.length=f,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.pointShadow.length=T,n.pointShadowMap.length=T,n.spotShadow.length=w,n.spotShadowMap.length=w,n.directionalShadowMatrix.length=M,n.pointShadowMatrix.length=T,n.spotLightMatrix.length=w+R-S,n.spotLightMap.length=R,n.numSpotLightShadowsWithMaps=S,n.numLightProbes=A,v.directionalLength=m,v.pointLength=g,v.spotLength=x,v.rectAreaLength=f,v.hemiLength=p,v.numDirectionalShadows=M,v.numPointShadows=T,v.numSpotShadows=w,v.numSpotMaps=R,v.numLightProbes=A,n.version=Wm++)}function l(c,h){let u=0,d=0,m=0,g=0,x=0;const f=h.matrixWorldInverse;for(let p=0,M=c.length;p<M;p++){const T=c[p];if(T.isDirectionalLight){const w=n.directional[u];w.direction.setFromMatrixPosition(T.matrixWorld),s.setFromMatrixPosition(T.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(f),u++}else if(T.isSpotLight){const w=n.spot[m];w.position.setFromMatrixPosition(T.matrixWorld),w.position.applyMatrix4(f),w.direction.setFromMatrixPosition(T.matrixWorld),s.setFromMatrixPosition(T.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(f),m++}else if(T.isRectAreaLight){const w=n.rectArea[g];w.position.setFromMatrixPosition(T.matrixWorld),w.position.applyMatrix4(f),a.identity(),r.copy(T.matrixWorld),r.premultiply(f),a.extractRotation(r),w.halfWidth.set(T.width*.5,0,0),w.halfHeight.set(0,T.height*.5,0),w.halfWidth.applyMatrix4(a),w.halfHeight.applyMatrix4(a),g++}else if(T.isPointLight){const w=n.point[d];w.position.setFromMatrixPosition(T.matrixWorld),w.position.applyMatrix4(f),d++}else if(T.isHemisphereLight){const w=n.hemi[x];w.direction.setFromMatrixPosition(T.matrixWorld),w.direction.transformDirection(f),x++}}}return{setup:o,setupView:l,state:n}}function Ll(i){const e=new qm(i),t=[],n=[];function s(h){c.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function a(h){n.push(h)}function o(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function Ym(i){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new Ll(i),e.set(s,[o])):r>=a.length?(o=new Ll(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const $m=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Km=`uniform sampler2D shadow_pass;
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
}`,jm=[new F(1,0,0),new F(-1,0,0),new F(0,1,0),new F(0,-1,0),new F(0,0,1),new F(0,0,-1)],Zm=[new F(0,-1,0),new F(0,-1,0),new F(0,0,1),new F(0,0,-1),new F(0,-1,0),new F(0,-1,0)],Ul=new mt,ls=new F,sa=new F;function Qm(i,e,t){let n=new Mo;const s=new Ue,r=new Ue,a=new xt,o=new id,l=new sd,c={},h=t.maxTextureSize,u={[ni]:Kt,[Kt]:ni,[Cn]:Cn},d=new Gt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ue},radius:{value:4}},vertexShader:$m,fragmentShader:Km}),m=d.clone();m.defines.HORIZONTAL_PASS=1;const g=new on;g.setAttribute("position",new Sn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new qe(g,d),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=nr;let p=this.type;this.render=function(S,A,v){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||S.length===0)return;this.type===Xc&&(Le("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=nr);const b=i.getRenderTarget(),X=i.getActiveCubeFace(),C=i.getActiveMipmapLevel(),k=i.state;k.setBlending(Pn),k.buffers.depth.getReversed()===!0?k.buffers.color.setClear(0,0,0,0):k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);const z=p!==this.type;z&&A.traverse(function(q){q.material&&(Array.isArray(q.material)?q.material.forEach(B=>B.needsUpdate=!0):q.material.needsUpdate=!0)});for(let q=0,B=S.length;q<B;q++){const G=S[q],U=G.shadow;if(U===void 0){Le("WebGLShadowMap:",G,"has no shadow.");continue}if(U.autoUpdate===!1&&U.needsUpdate===!1)continue;s.copy(U.mapSize);const te=U.getFrameExtents();s.multiply(te),r.copy(U.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/te.x),s.x=r.x*te.x,U.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/te.y),s.y=r.y*te.y,U.mapSize.y=r.y));const Z=i.state.buffers.depth.getReversed();if(U.camera._reversedDepth=Z,U.map===null||z===!0){if(U.map!==null&&(U.map.depthTexture!==null&&(U.map.depthTexture.dispose(),U.map.depthTexture=null),U.map.dispose()),this.type===fs){if(G.isPointLight){Le("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}U.map=new jt(s.x,s.y,{format:qi,type:nn,minFilter:vt,magFilter:vt,generateMipmaps:!1}),U.map.texture.name=G.name+".shadowMap",U.map.depthTexture=new ys(s.x,s.y,vn),U.map.depthTexture.name=G.name+".shadowMapDepth",U.map.depthTexture.format=Gn,U.map.depthTexture.compareFunction=null,U.map.depthTexture.minFilter=Pe,U.map.depthTexture.magFilter=Pe}else G.isPointLight?(U.map=new Ec(s.x),U.map.depthTexture=new Zh(s.x,In)):(U.map=new jt(s.x,s.y),U.map.depthTexture=new ys(s.x,s.y,In)),U.map.depthTexture.name=G.name+".shadowMap",U.map.depthTexture.format=Gn,this.type===nr?(U.map.depthTexture.compareFunction=Z?vo:xo,U.map.depthTexture.minFilter=vt,U.map.depthTexture.magFilter=vt):(U.map.depthTexture.compareFunction=null,U.map.depthTexture.minFilter=Pe,U.map.depthTexture.magFilter=Pe);U.camera.updateProjectionMatrix()}const ue=U.map.isWebGLCubeRenderTarget?6:1;for(let _e=0;_e<ue;_e++){if(U.map.isWebGLCubeRenderTarget)i.setRenderTarget(U.map,_e),i.clear();else{_e===0&&(i.setRenderTarget(U.map),i.clear());const pe=U.getViewport(_e);a.set(r.x*pe.x,r.y*pe.y,r.x*pe.z,r.y*pe.w),k.viewport(a)}if(G.isPointLight){const pe=U.camera,ze=U.matrix,gt=G.distance||pe.far;gt!==pe.far&&(pe.far=gt,pe.updateProjectionMatrix()),ls.setFromMatrixPosition(G.matrixWorld),pe.position.copy(ls),sa.copy(pe.position),sa.add(jm[_e]),pe.up.copy(Zm[_e]),pe.lookAt(sa),pe.updateMatrixWorld(),ze.makeTranslation(-ls.x,-ls.y,-ls.z),Ul.multiplyMatrices(pe.projectionMatrix,pe.matrixWorldInverse),U._frustum.setFromProjectionMatrix(Ul,pe.coordinateSystem,pe.reversedDepth)}else U.updateMatrices(G);n=U.getFrustum(),w(A,v,U.camera,G,this.type)}U.isPointLightShadow!==!0&&this.type===fs&&M(U,v),U.needsUpdate=!1}p=this.type,f.needsUpdate=!1,i.setRenderTarget(b,X,C)};function M(S,A){const v=e.update(x);d.defines.VSM_SAMPLES!==S.blurSamples&&(d.defines.VSM_SAMPLES=S.blurSamples,m.defines.VSM_SAMPLES=S.blurSamples,d.needsUpdate=!0,m.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new jt(s.x,s.y,{format:qi,type:nn})),d.uniforms.shadow_pass.value=S.map.depthTexture,d.uniforms.resolution.value=S.mapSize,d.uniforms.radius.value=S.radius,i.setRenderTarget(S.mapPass),i.clear(),i.renderBufferDirect(A,null,v,d,x,null),m.uniforms.shadow_pass.value=S.mapPass.texture,m.uniforms.resolution.value=S.mapSize,m.uniforms.radius.value=S.radius,i.setRenderTarget(S.map),i.clear(),i.renderBufferDirect(A,null,v,m,x,null)}function T(S,A,v,b){let X=null;const C=v.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(C!==void 0)X=C;else if(X=v.isPointLight===!0?l:o,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){const k=X.uuid,z=A.uuid;let q=c[k];q===void 0&&(q={},c[k]=q);let B=q[z];B===void 0&&(B=X.clone(),q[z]=B,A.addEventListener("dispose",R)),X=B}if(X.visible=A.visible,X.wireframe=A.wireframe,b===fs?X.side=A.shadowSide!==null?A.shadowSide:A.side:X.side=A.shadowSide!==null?A.shadowSide:u[A.side],X.alphaMap=A.alphaMap,X.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,X.map=A.map,X.clipShadows=A.clipShadows,X.clippingPlanes=A.clippingPlanes,X.clipIntersection=A.clipIntersection,X.displacementMap=A.displacementMap,X.displacementScale=A.displacementScale,X.displacementBias=A.displacementBias,X.wireframeLinewidth=A.wireframeLinewidth,X.linewidth=A.linewidth,v.isPointLight===!0&&X.isMeshDistanceMaterial===!0){const k=i.properties.get(X);k.light=v}return X}function w(S,A,v,b,X){if(S.visible===!1)return;if(S.layers.test(A.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&X===fs)&&(!S.frustumCulled||n.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,S.matrixWorld);const z=e.update(S),q=S.material;if(Array.isArray(q)){const B=z.groups;for(let G=0,U=B.length;G<U;G++){const te=B[G],Z=q[te.materialIndex];if(Z&&Z.visible){const ue=T(S,Z,b,X);S.onBeforeShadow(i,S,A,v,z,ue,te),i.renderBufferDirect(v,null,z,ue,S,te),S.onAfterShadow(i,S,A,v,z,ue,te)}}}else if(q.visible){const B=T(S,q,b,X);S.onBeforeShadow(i,S,A,v,z,B,null),i.renderBufferDirect(v,null,z,B,S,null),S.onAfterShadow(i,S,A,v,z,B,null)}}const k=S.children;for(let z=0,q=k.length;z<q;z++)w(k[z],A,v,b,X)}function R(S){S.target.removeEventListener("dispose",R);for(const v in c){const b=c[v],X=S.target.uuid;X in b&&(b[X].dispose(),delete b[X])}}}function Jm(i,e){function t(){let D=!1;const ae=new xt;let ie=null;const ge=new xt(0,0,0,0);return{setMask:function(J){ie!==J&&!D&&(i.colorMask(J,J,J,J),ie=J)},setLocked:function(J){D=J},setClear:function(J,V,ye,Fe,ot){ot===!0&&(J*=Fe,V*=Fe,ye*=Fe),ae.set(J,V,ye,Fe),ge.equals(ae)===!1&&(i.clearColor(J,V,ye,Fe),ge.copy(ae))},reset:function(){D=!1,ie=null,ge.set(-1,0,0,0)}}}function n(){let D=!1,ae=!1,ie=null,ge=null,J=null;return{setReversed:function(V){if(ae!==V){const ye=e.get("EXT_clip_control");V?ye.clipControlEXT(ye.LOWER_LEFT_EXT,ye.ZERO_TO_ONE_EXT):ye.clipControlEXT(ye.LOWER_LEFT_EXT,ye.NEGATIVE_ONE_TO_ONE_EXT),ae=V;const Fe=J;J=null,this.setClear(Fe)}},getReversed:function(){return ae},setTest:function(V){V?se(i.DEPTH_TEST):oe(i.DEPTH_TEST)},setMask:function(V){ie!==V&&!D&&(i.depthMask(V),ie=V)},setFunc:function(V){if(ae&&(V=Eh[V]),ge!==V){switch(V){case ma:i.depthFunc(i.NEVER);break;case ga:i.depthFunc(i.ALWAYS);break;case _a:i.depthFunc(i.LESS);break;case Wi:i.depthFunc(i.LEQUAL);break;case xa:i.depthFunc(i.EQUAL);break;case va:i.depthFunc(i.GEQUAL);break;case ya:i.depthFunc(i.GREATER);break;case Sa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ge=V}},setLocked:function(V){D=V},setClear:function(V){J!==V&&(J=V,ae&&(V=1-V),i.clearDepth(V))},reset:function(){D=!1,ie=null,ge=null,J=null,ae=!1}}}function s(){let D=!1,ae=null,ie=null,ge=null,J=null,V=null,ye=null,Fe=null,ot=null;return{setTest:function(et){D||(et?se(i.STENCIL_TEST):oe(i.STENCIL_TEST))},setMask:function(et){ae!==et&&!D&&(i.stencilMask(et),ae=et)},setFunc:function(et,Un,Fn){(ie!==et||ge!==Un||J!==Fn)&&(i.stencilFunc(et,Un,Fn),ie=et,ge=Un,J=Fn)},setOp:function(et,Un,Fn){(V!==et||ye!==Un||Fe!==Fn)&&(i.stencilOp(et,Un,Fn),V=et,ye=Un,Fe=Fn)},setLocked:function(et){D=et},setClear:function(et){ot!==et&&(i.clearStencil(et),ot=et)},reset:function(){D=!1,ae=null,ie=null,ge=null,J=null,V=null,ye=null,Fe=null,ot=null}}}const r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap;let h={},u={},d=new WeakMap,m=[],g=null,x=!1,f=null,p=null,M=null,T=null,w=null,R=null,S=null,A=new Ne(0,0,0),v=0,b=!1,X=null,C=null,k=null,z=null,q=null;const B=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let G=!1,U=0;const te=i.getParameter(i.VERSION);te.indexOf("WebGL")!==-1?(U=parseFloat(/^WebGL (\d)/.exec(te)[1]),G=U>=1):te.indexOf("OpenGL ES")!==-1&&(U=parseFloat(/^OpenGL ES (\d)/.exec(te)[1]),G=U>=2);let Z=null,ue={};const _e=i.getParameter(i.SCISSOR_BOX),pe=i.getParameter(i.VIEWPORT),ze=new xt().fromArray(_e),gt=new xt().fromArray(pe);function ft(D,ae,ie,ge){const J=new Uint8Array(4),V=i.createTexture();i.bindTexture(D,V),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let ye=0;ye<ie;ye++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(ae,0,i.RGBA,1,1,ge,0,i.RGBA,i.UNSIGNED_BYTE,J):i.texImage2D(ae+ye,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,J);return V}const K={};K[i.TEXTURE_2D]=ft(i.TEXTURE_2D,i.TEXTURE_2D,1),K[i.TEXTURE_CUBE_MAP]=ft(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),K[i.TEXTURE_2D_ARRAY]=ft(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),K[i.TEXTURE_3D]=ft(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),se(i.DEPTH_TEST),a.setFunc(Wi),Ge(!1),yt(Fo),se(i.CULL_FACE),Je(Pn);function se(D){h[D]!==!0&&(i.enable(D),h[D]=!0)}function oe(D){h[D]!==!1&&(i.disable(D),h[D]=!1)}function Be(D,ae){return u[D]!==ae?(i.bindFramebuffer(D,ae),u[D]=ae,D===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=ae),D===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=ae),!0):!1}function Re(D,ae){let ie=m,ge=!1;if(D){ie=d.get(ae),ie===void 0&&(ie=[],d.set(ae,ie));const J=D.textures;if(ie.length!==J.length||ie[0]!==i.COLOR_ATTACHMENT0){for(let V=0,ye=J.length;V<ye;V++)ie[V]=i.COLOR_ATTACHMENT0+V;ie.length=J.length,ge=!0}}else ie[0]!==i.BACK&&(ie[0]=i.BACK,ge=!0);ge&&i.drawBuffers(ie)}function Ie(D){return g!==D?(i.useProgram(D),g=D,!0):!1}const Ct={[mi]:i.FUNC_ADD,[Yc]:i.FUNC_SUBTRACT,[$c]:i.FUNC_REVERSE_SUBTRACT};Ct[Kc]=i.MIN,Ct[jc]=i.MAX;const Ye={[Zc]:i.ZERO,[Qc]:i.ONE,[Jc]:i.SRC_COLOR,[fa]:i.SRC_ALPHA,[rh]:i.SRC_ALPHA_SATURATE,[ih]:i.DST_COLOR,[th]:i.DST_ALPHA,[eh]:i.ONE_MINUS_SRC_COLOR,[pa]:i.ONE_MINUS_SRC_ALPHA,[sh]:i.ONE_MINUS_DST_COLOR,[nh]:i.ONE_MINUS_DST_ALPHA,[ah]:i.CONSTANT_COLOR,[oh]:i.ONE_MINUS_CONSTANT_COLOR,[lh]:i.CONSTANT_ALPHA,[ch]:i.ONE_MINUS_CONSTANT_ALPHA};function Je(D,ae,ie,ge,J,V,ye,Fe,ot,et){if(D===Pn){x===!0&&(oe(i.BLEND),x=!1);return}if(x===!1&&(se(i.BLEND),x=!0),D!==qc){if(D!==f||et!==b){if((p!==mi||w!==mi)&&(i.blendEquation(i.FUNC_ADD),p=mi,w=mi),et)switch(D){case Gi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ms:i.blendFunc(i.ONE,i.ONE);break;case No:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Oo:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:je("WebGLState: Invalid blending: ",D);break}else switch(D){case Gi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ms:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case No:je("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Oo:je("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:je("WebGLState: Invalid blending: ",D);break}M=null,T=null,R=null,S=null,A.set(0,0,0),v=0,f=D,b=et}return}J=J||ae,V=V||ie,ye=ye||ge,(ae!==p||J!==w)&&(i.blendEquationSeparate(Ct[ae],Ct[J]),p=ae,w=J),(ie!==M||ge!==T||V!==R||ye!==S)&&(i.blendFuncSeparate(Ye[ie],Ye[ge],Ye[V],Ye[ye]),M=ie,T=ge,R=V,S=ye),(Fe.equals(A)===!1||ot!==v)&&(i.blendColor(Fe.r,Fe.g,Fe.b,ot),A.copy(Fe),v=ot),f=D,b=!1}function st(D,ae){D.side===Cn?oe(i.CULL_FACE):se(i.CULL_FACE);let ie=D.side===Kt;ae&&(ie=!ie),Ge(ie),D.blending===Gi&&D.transparent===!1?Je(Pn):Je(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),a.setFunc(D.depthFunc),a.setTest(D.depthTest),a.setMask(D.depthWrite),r.setMask(D.colorWrite);const ge=D.stencilWrite;o.setTest(ge),ge&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),bt(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?se(i.SAMPLE_ALPHA_TO_COVERAGE):oe(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ge(D){X!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),X=D)}function yt(D){D!==Vc?(se(i.CULL_FACE),D!==C&&(D===Fo?i.cullFace(i.BACK):D===Wc?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):oe(i.CULL_FACE),C=D}function P(D){D!==k&&(G&&i.lineWidth(D),k=D)}function bt(D,ae,ie){D?(se(i.POLYGON_OFFSET_FILL),(z!==ae||q!==ie)&&(z=ae,q=ie,a.getReversed()&&(ae=-ae),i.polygonOffset(ae,ie))):oe(i.POLYGON_OFFSET_FILL)}function Qe(D){D?se(i.SCISSOR_TEST):oe(i.SCISSOR_TEST)}function at(D){D===void 0&&(D=i.TEXTURE0+B-1),Z!==D&&(i.activeTexture(D),Z=D)}function be(D,ae,ie){ie===void 0&&(Z===null?ie=i.TEXTURE0+B-1:ie=Z);let ge=ue[ie];ge===void 0&&(ge={type:void 0,texture:void 0},ue[ie]=ge),(ge.type!==D||ge.texture!==ae)&&(Z!==ie&&(i.activeTexture(ie),Z=ie),i.bindTexture(D,ae||K[D]),ge.type=D,ge.texture=ae)}function E(){const D=ue[Z];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function _(){try{i.compressedTexImage2D(...arguments)}catch(D){je("WebGLState:",D)}}function I(){try{i.compressedTexImage3D(...arguments)}catch(D){je("WebGLState:",D)}}function Y(){try{i.texSubImage2D(...arguments)}catch(D){je("WebGLState:",D)}}function j(){try{i.texSubImage3D(...arguments)}catch(D){je("WebGLState:",D)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(D){je("WebGLState:",D)}}function xe(){try{i.compressedTexSubImage3D(...arguments)}catch(D){je("WebGLState:",D)}}function re(){try{i.texStorage2D(...arguments)}catch(D){je("WebGLState:",D)}}function Ae(){try{i.texStorage3D(...arguments)}catch(D){je("WebGLState:",D)}}function De(){try{i.texImage2D(...arguments)}catch(D){je("WebGLState:",D)}}function Q(){try{i.texImage3D(...arguments)}catch(D){je("WebGLState:",D)}}function ne(D){ze.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),ze.copy(D))}function ve(D){gt.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),gt.copy(D))}function Se(D,ae){let ie=c.get(ae);ie===void 0&&(ie=new WeakMap,c.set(ae,ie));let ge=ie.get(D);ge===void 0&&(ge=i.getUniformBlockIndex(ae,D.name),ie.set(D,ge))}function fe(D,ae){const ge=c.get(ae).get(D);l.get(ae)!==ge&&(i.uniformBlockBinding(ae,ge,D.__bindingPointIndex),l.set(ae,ge))}function Ve(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},Z=null,ue={},u={},d=new WeakMap,m=[],g=null,x=!1,f=null,p=null,M=null,T=null,w=null,R=null,S=null,A=new Ne(0,0,0),v=0,b=!1,X=null,C=null,k=null,z=null,q=null,ze.set(0,0,i.canvas.width,i.canvas.height),gt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:se,disable:oe,bindFramebuffer:Be,drawBuffers:Re,useProgram:Ie,setBlending:Je,setMaterial:st,setFlipSided:Ge,setCullFace:yt,setLineWidth:P,setPolygonOffset:bt,setScissorTest:Qe,activeTexture:at,bindTexture:be,unbindTexture:E,compressedTexImage2D:_,compressedTexImage3D:I,texImage2D:De,texImage3D:Q,updateUBOMapping:Se,uniformBlockBinding:fe,texStorage2D:re,texStorage3D:Ae,texSubImage2D:Y,texSubImage3D:j,compressedTexSubImage2D:W,compressedTexSubImage3D:xe,scissor:ne,viewport:ve,reset:Ve}}function e0(i,e,t,n,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ue,h=new WeakMap;let u;const d=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(E,_){return m?new OffscreenCanvas(E,_):vs("canvas")}function x(E,_,I){let Y=1;const j=be(E);if((j.width>I||j.height>I)&&(Y=I/Math.max(j.width,j.height)),Y<1)if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){const W=Math.floor(Y*j.width),xe=Math.floor(Y*j.height);u===void 0&&(u=g(W,xe));const re=_?g(W,xe):u;return re.width=W,re.height=xe,re.getContext("2d").drawImage(E,0,0,W,xe),Le("WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+W+"x"+xe+")."),re}else return"data"in E&&Le("WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),E;return E}function f(E){return E.generateMipmaps}function p(E){i.generateMipmap(E)}function M(E){return E.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:E.isWebGL3DRenderTarget?i.TEXTURE_3D:E.isWebGLArrayRenderTarget||E.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function T(E,_,I,Y,j=!1){if(E!==null){if(i[E]!==void 0)return i[E];Le("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let W=_;if(_===i.RED&&(I===i.FLOAT&&(W=i.R32F),I===i.HALF_FLOAT&&(W=i.R16F),I===i.UNSIGNED_BYTE&&(W=i.R8)),_===i.RED_INTEGER&&(I===i.UNSIGNED_BYTE&&(W=i.R8UI),I===i.UNSIGNED_SHORT&&(W=i.R16UI),I===i.UNSIGNED_INT&&(W=i.R32UI),I===i.BYTE&&(W=i.R8I),I===i.SHORT&&(W=i.R16I),I===i.INT&&(W=i.R32I)),_===i.RG&&(I===i.FLOAT&&(W=i.RG32F),I===i.HALF_FLOAT&&(W=i.RG16F),I===i.UNSIGNED_BYTE&&(W=i.RG8)),_===i.RG_INTEGER&&(I===i.UNSIGNED_BYTE&&(W=i.RG8UI),I===i.UNSIGNED_SHORT&&(W=i.RG16UI),I===i.UNSIGNED_INT&&(W=i.RG32UI),I===i.BYTE&&(W=i.RG8I),I===i.SHORT&&(W=i.RG16I),I===i.INT&&(W=i.RG32I)),_===i.RGB_INTEGER&&(I===i.UNSIGNED_BYTE&&(W=i.RGB8UI),I===i.UNSIGNED_SHORT&&(W=i.RGB16UI),I===i.UNSIGNED_INT&&(W=i.RGB32UI),I===i.BYTE&&(W=i.RGB8I),I===i.SHORT&&(W=i.RGB16I),I===i.INT&&(W=i.RGB32I)),_===i.RGBA_INTEGER&&(I===i.UNSIGNED_BYTE&&(W=i.RGBA8UI),I===i.UNSIGNED_SHORT&&(W=i.RGBA16UI),I===i.UNSIGNED_INT&&(W=i.RGBA32UI),I===i.BYTE&&(W=i.RGBA8I),I===i.SHORT&&(W=i.RGBA16I),I===i.INT&&(W=i.RGBA32I)),_===i.RGB&&(I===i.UNSIGNED_INT_5_9_9_9_REV&&(W=i.RGB9_E5),I===i.UNSIGNED_INT_10F_11F_11F_REV&&(W=i.R11F_G11F_B10F)),_===i.RGBA){const xe=j?ur:$e.getTransfer(Y);I===i.FLOAT&&(W=i.RGBA32F),I===i.HALF_FLOAT&&(W=i.RGBA16F),I===i.UNSIGNED_BYTE&&(W=xe===tt?i.SRGB8_ALPHA8:i.RGBA8),I===i.UNSIGNED_SHORT_4_4_4_4&&(W=i.RGBA4),I===i.UNSIGNED_SHORT_5_5_5_1&&(W=i.RGB5_A1)}return(W===i.R16F||W===i.R32F||W===i.RG16F||W===i.RG32F||W===i.RGBA16F||W===i.RGBA32F)&&e.get("EXT_color_buffer_float"),W}function w(E,_){let I;return E?_===null||_===In||_===_s?I=i.DEPTH24_STENCIL8:_===vn?I=i.DEPTH32F_STENCIL8:_===gs&&(I=i.DEPTH24_STENCIL8,Le("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===In||_===_s?I=i.DEPTH_COMPONENT24:_===vn?I=i.DEPTH_COMPONENT32F:_===gs&&(I=i.DEPTH_COMPONENT16),I}function R(E,_){return f(E)===!0||E.isFramebufferTexture&&E.minFilter!==Pe&&E.minFilter!==vt?Math.log2(Math.max(_.width,_.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?_.mipmaps.length:1}function S(E){const _=E.target;_.removeEventListener("dispose",S),v(_),_.isVideoTexture&&h.delete(_)}function A(E){const _=E.target;_.removeEventListener("dispose",A),X(_)}function v(E){const _=n.get(E);if(_.__webglInit===void 0)return;const I=E.source,Y=d.get(I);if(Y){const j=Y[_.__cacheKey];j.usedTimes--,j.usedTimes===0&&b(E),Object.keys(Y).length===0&&d.delete(I)}n.remove(E)}function b(E){const _=n.get(E);i.deleteTexture(_.__webglTexture);const I=E.source,Y=d.get(I);delete Y[_.__cacheKey],a.memory.textures--}function X(E){const _=n.get(E);if(E.depthTexture&&(E.depthTexture.dispose(),n.remove(E.depthTexture)),E.isWebGLCubeRenderTarget)for(let Y=0;Y<6;Y++){if(Array.isArray(_.__webglFramebuffer[Y]))for(let j=0;j<_.__webglFramebuffer[Y].length;j++)i.deleteFramebuffer(_.__webglFramebuffer[Y][j]);else i.deleteFramebuffer(_.__webglFramebuffer[Y]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[Y])}else{if(Array.isArray(_.__webglFramebuffer))for(let Y=0;Y<_.__webglFramebuffer.length;Y++)i.deleteFramebuffer(_.__webglFramebuffer[Y]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let Y=0;Y<_.__webglColorRenderbuffer.length;Y++)_.__webglColorRenderbuffer[Y]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[Y]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}const I=E.textures;for(let Y=0,j=I.length;Y<j;Y++){const W=n.get(I[Y]);W.__webglTexture&&(i.deleteTexture(W.__webglTexture),a.memory.textures--),n.remove(I[Y])}n.remove(E)}let C=0;function k(){C=0}function z(){const E=C;return E>=s.maxTextures&&Le("WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+s.maxTextures),C+=1,E}function q(E){const _=[];return _.push(E.wrapS),_.push(E.wrapT),_.push(E.wrapR||0),_.push(E.magFilter),_.push(E.minFilter),_.push(E.anisotropy),_.push(E.internalFormat),_.push(E.format),_.push(E.type),_.push(E.generateMipmaps),_.push(E.premultiplyAlpha),_.push(E.flipY),_.push(E.unpackAlignment),_.push(E.colorSpace),_.join()}function B(E,_){const I=n.get(E);if(E.isVideoTexture&&Qe(E),E.isRenderTargetTexture===!1&&E.isExternalTexture!==!0&&E.version>0&&I.__version!==E.version){const Y=E.image;if(Y===null)Le("WebGLRenderer: Texture marked for update but no image data found.");else if(Y.complete===!1)Le("WebGLRenderer: Texture marked for update but image is incomplete");else{K(I,E,_);return}}else E.isExternalTexture&&(I.__webglTexture=E.sourceTexture?E.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,I.__webglTexture,i.TEXTURE0+_)}function G(E,_){const I=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&I.__version!==E.version){K(I,E,_);return}else E.isExternalTexture&&(I.__webglTexture=E.sourceTexture?E.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,I.__webglTexture,i.TEXTURE0+_)}function U(E,_){const I=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&I.__version!==E.version){K(I,E,_);return}t.bindTexture(i.TEXTURE_3D,I.__webglTexture,i.TEXTURE0+_)}function te(E,_){const I=n.get(E);if(E.isCubeDepthTexture!==!0&&E.version>0&&I.__version!==E.version){se(I,E,_);return}t.bindTexture(i.TEXTURE_CUBE_MAP,I.__webglTexture,i.TEXTURE0+_)}const Z={[Ma]:i.REPEAT,[xn]:i.CLAMP_TO_EDGE,[ba]:i.MIRRORED_REPEAT},ue={[Pe]:i.NEAREST,[uh]:i.NEAREST_MIPMAP_NEAREST,[Ps]:i.NEAREST_MIPMAP_LINEAR,[vt]:i.LINEAR,[Tr]:i.LINEAR_MIPMAP_NEAREST,[_i]:i.LINEAR_MIPMAP_LINEAR},_e={[mh]:i.NEVER,[yh]:i.ALWAYS,[gh]:i.LESS,[xo]:i.LEQUAL,[_h]:i.EQUAL,[vo]:i.GEQUAL,[xh]:i.GREATER,[vh]:i.NOTEQUAL};function pe(E,_){if(_.type===vn&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===vt||_.magFilter===Tr||_.magFilter===Ps||_.magFilter===_i||_.minFilter===vt||_.minFilter===Tr||_.minFilter===Ps||_.minFilter===_i)&&Le("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(E,i.TEXTURE_WRAP_S,Z[_.wrapS]),i.texParameteri(E,i.TEXTURE_WRAP_T,Z[_.wrapT]),(E===i.TEXTURE_3D||E===i.TEXTURE_2D_ARRAY)&&i.texParameteri(E,i.TEXTURE_WRAP_R,Z[_.wrapR]),i.texParameteri(E,i.TEXTURE_MAG_FILTER,ue[_.magFilter]),i.texParameteri(E,i.TEXTURE_MIN_FILTER,ue[_.minFilter]),_.compareFunction&&(i.texParameteri(E,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(E,i.TEXTURE_COMPARE_FUNC,_e[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Pe||_.minFilter!==Ps&&_.minFilter!==_i||_.type===vn&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){const I=e.get("EXT_texture_filter_anisotropic");i.texParameterf(E,I.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function ze(E,_){let I=!1;E.__webglInit===void 0&&(E.__webglInit=!0,_.addEventListener("dispose",S));const Y=_.source;let j=d.get(Y);j===void 0&&(j={},d.set(Y,j));const W=q(_);if(W!==E.__cacheKey){j[W]===void 0&&(j[W]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,I=!0),j[W].usedTimes++;const xe=j[E.__cacheKey];xe!==void 0&&(j[E.__cacheKey].usedTimes--,xe.usedTimes===0&&b(_)),E.__cacheKey=W,E.__webglTexture=j[W].texture}return I}function gt(E,_,I){return Math.floor(Math.floor(E/I)/_)}function ft(E,_,I,Y){const W=E.updateRanges;if(W.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,_.width,_.height,I,Y,_.data);else{W.sort((Q,ne)=>Q.start-ne.start);let xe=0;for(let Q=1;Q<W.length;Q++){const ne=W[xe],ve=W[Q],Se=ne.start+ne.count,fe=gt(ve.start,_.width,4),Ve=gt(ne.start,_.width,4);ve.start<=Se+1&&fe===Ve&&gt(ve.start+ve.count-1,_.width,4)===fe?ne.count=Math.max(ne.count,ve.start+ve.count-ne.start):(++xe,W[xe]=ve)}W.length=xe+1;const re=i.getParameter(i.UNPACK_ROW_LENGTH),Ae=i.getParameter(i.UNPACK_SKIP_PIXELS),De=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,_.width);for(let Q=0,ne=W.length;Q<ne;Q++){const ve=W[Q],Se=Math.floor(ve.start/4),fe=Math.ceil(ve.count/4),Ve=Se%_.width,D=Math.floor(Se/_.width),ae=fe,ie=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,Ve),i.pixelStorei(i.UNPACK_SKIP_ROWS,D),t.texSubImage2D(i.TEXTURE_2D,0,Ve,D,ae,ie,I,Y,_.data)}E.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,re),i.pixelStorei(i.UNPACK_SKIP_PIXELS,Ae),i.pixelStorei(i.UNPACK_SKIP_ROWS,De)}}function K(E,_,I){let Y=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(Y=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&(Y=i.TEXTURE_3D);const j=ze(E,_),W=_.source;t.bindTexture(Y,E.__webglTexture,i.TEXTURE0+I);const xe=n.get(W);if(W.version!==xe.__version||j===!0){t.activeTexture(i.TEXTURE0+I);const re=$e.getPrimaries($e.workingColorSpace),Ae=_.colorSpace===ei?null:$e.getPrimaries(_.colorSpace),De=_.colorSpace===ei||re===Ae?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,De);let Q=x(_.image,!1,s.maxTextureSize);Q=at(_,Q);const ne=r.convert(_.format,_.colorSpace),ve=r.convert(_.type);let Se=T(_.internalFormat,ne,ve,_.colorSpace,_.isVideoTexture);pe(Y,_);let fe;const Ve=_.mipmaps,D=_.isVideoTexture!==!0,ae=xe.__version===void 0||j===!0,ie=W.dataReady,ge=R(_,Q);if(_.isDepthTexture)Se=w(_.format===xi,_.type),ae&&(D?t.texStorage2D(i.TEXTURE_2D,1,Se,Q.width,Q.height):t.texImage2D(i.TEXTURE_2D,0,Se,Q.width,Q.height,0,ne,ve,null));else if(_.isDataTexture)if(Ve.length>0){D&&ae&&t.texStorage2D(i.TEXTURE_2D,ge,Se,Ve[0].width,Ve[0].height);for(let J=0,V=Ve.length;J<V;J++)fe=Ve[J],D?ie&&t.texSubImage2D(i.TEXTURE_2D,J,0,0,fe.width,fe.height,ne,ve,fe.data):t.texImage2D(i.TEXTURE_2D,J,Se,fe.width,fe.height,0,ne,ve,fe.data);_.generateMipmaps=!1}else D?(ae&&t.texStorage2D(i.TEXTURE_2D,ge,Se,Q.width,Q.height),ie&&ft(_,Q,ne,ve)):t.texImage2D(i.TEXTURE_2D,0,Se,Q.width,Q.height,0,ne,ve,Q.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){D&&ae&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ge,Se,Ve[0].width,Ve[0].height,Q.depth);for(let J=0,V=Ve.length;J<V;J++)if(fe=Ve[J],_.format!==yn)if(ne!==null)if(D){if(ie)if(_.layerUpdates.size>0){const ye=dl(fe.width,fe.height,_.format,_.type);for(const Fe of _.layerUpdates){const ot=fe.data.subarray(Fe*ye/fe.data.BYTES_PER_ELEMENT,(Fe+1)*ye/fe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,J,0,0,Fe,fe.width,fe.height,1,ne,ot)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,J,0,0,0,fe.width,fe.height,Q.depth,ne,fe.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,J,Se,fe.width,fe.height,Q.depth,0,fe.data,0,0);else Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else D?ie&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,J,0,0,0,fe.width,fe.height,Q.depth,ne,ve,fe.data):t.texImage3D(i.TEXTURE_2D_ARRAY,J,Se,fe.width,fe.height,Q.depth,0,ne,ve,fe.data)}else{D&&ae&&t.texStorage2D(i.TEXTURE_2D,ge,Se,Ve[0].width,Ve[0].height);for(let J=0,V=Ve.length;J<V;J++)fe=Ve[J],_.format!==yn?ne!==null?D?ie&&t.compressedTexSubImage2D(i.TEXTURE_2D,J,0,0,fe.width,fe.height,ne,fe.data):t.compressedTexImage2D(i.TEXTURE_2D,J,Se,fe.width,fe.height,0,fe.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):D?ie&&t.texSubImage2D(i.TEXTURE_2D,J,0,0,fe.width,fe.height,ne,ve,fe.data):t.texImage2D(i.TEXTURE_2D,J,Se,fe.width,fe.height,0,ne,ve,fe.data)}else if(_.isDataArrayTexture)if(D){if(ae&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ge,Se,Q.width,Q.height,Q.depth),ie)if(_.layerUpdates.size>0){const J=dl(Q.width,Q.height,_.format,_.type);for(const V of _.layerUpdates){const ye=Q.data.subarray(V*J/Q.data.BYTES_PER_ELEMENT,(V+1)*J/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,V,Q.width,Q.height,1,ne,ve,ye)}_.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,ne,ve,Q.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Se,Q.width,Q.height,Q.depth,0,ne,ve,Q.data);else if(_.isData3DTexture)D?(ae&&t.texStorage3D(i.TEXTURE_3D,ge,Se,Q.width,Q.height,Q.depth),ie&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,ne,ve,Q.data)):t.texImage3D(i.TEXTURE_3D,0,Se,Q.width,Q.height,Q.depth,0,ne,ve,Q.data);else if(_.isFramebufferTexture){if(ae)if(D)t.texStorage2D(i.TEXTURE_2D,ge,Se,Q.width,Q.height);else{let J=Q.width,V=Q.height;for(let ye=0;ye<ge;ye++)t.texImage2D(i.TEXTURE_2D,ye,Se,J,V,0,ne,ve,null),J>>=1,V>>=1}}else if(Ve.length>0){if(D&&ae){const J=be(Ve[0]);t.texStorage2D(i.TEXTURE_2D,ge,Se,J.width,J.height)}for(let J=0,V=Ve.length;J<V;J++)fe=Ve[J],D?ie&&t.texSubImage2D(i.TEXTURE_2D,J,0,0,ne,ve,fe):t.texImage2D(i.TEXTURE_2D,J,Se,ne,ve,fe);_.generateMipmaps=!1}else if(D){if(ae){const J=be(Q);t.texStorage2D(i.TEXTURE_2D,ge,Se,J.width,J.height)}ie&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ne,ve,Q)}else t.texImage2D(i.TEXTURE_2D,0,Se,ne,ve,Q);f(_)&&p(Y),xe.__version=W.version,_.onUpdate&&_.onUpdate(_)}E.__version=_.version}function se(E,_,I){if(_.image.length!==6)return;const Y=ze(E,_),j=_.source;t.bindTexture(i.TEXTURE_CUBE_MAP,E.__webglTexture,i.TEXTURE0+I);const W=n.get(j);if(j.version!==W.__version||Y===!0){t.activeTexture(i.TEXTURE0+I);const xe=$e.getPrimaries($e.workingColorSpace),re=_.colorSpace===ei?null:$e.getPrimaries(_.colorSpace),Ae=_.colorSpace===ei||xe===re?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ae);const De=_.isCompressedTexture||_.image[0].isCompressedTexture,Q=_.image[0]&&_.image[0].isDataTexture,ne=[];for(let V=0;V<6;V++)!De&&!Q?ne[V]=x(_.image[V],!0,s.maxCubemapSize):ne[V]=Q?_.image[V].image:_.image[V],ne[V]=at(_,ne[V]);const ve=ne[0],Se=r.convert(_.format,_.colorSpace),fe=r.convert(_.type),Ve=T(_.internalFormat,Se,fe,_.colorSpace),D=_.isVideoTexture!==!0,ae=W.__version===void 0||Y===!0,ie=j.dataReady;let ge=R(_,ve);pe(i.TEXTURE_CUBE_MAP,_);let J;if(De){D&&ae&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ge,Ve,ve.width,ve.height);for(let V=0;V<6;V++){J=ne[V].mipmaps;for(let ye=0;ye<J.length;ye++){const Fe=J[ye];_.format!==yn?Se!==null?D?ie&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,ye,0,0,Fe.width,Fe.height,Se,Fe.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,ye,Ve,Fe.width,Fe.height,0,Fe.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?ie&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,ye,0,0,Fe.width,Fe.height,Se,fe,Fe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,ye,Ve,Fe.width,Fe.height,0,Se,fe,Fe.data)}}}else{if(J=_.mipmaps,D&&ae){J.length>0&&ge++;const V=be(ne[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ge,Ve,V.width,V.height)}for(let V=0;V<6;V++)if(Q){D?ie&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,0,0,ne[V].width,ne[V].height,Se,fe,ne[V].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,Ve,ne[V].width,ne[V].height,0,Se,fe,ne[V].data);for(let ye=0;ye<J.length;ye++){const ot=J[ye].image[V].image;D?ie&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,ye+1,0,0,ot.width,ot.height,Se,fe,ot.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,ye+1,Ve,ot.width,ot.height,0,Se,fe,ot.data)}}else{D?ie&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,0,0,Se,fe,ne[V]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,Ve,Se,fe,ne[V]);for(let ye=0;ye<J.length;ye++){const Fe=J[ye];D?ie&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,ye+1,0,0,Se,fe,Fe.image[V]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+V,ye+1,Ve,Se,fe,Fe.image[V])}}}f(_)&&p(i.TEXTURE_CUBE_MAP),W.__version=j.version,_.onUpdate&&_.onUpdate(_)}E.__version=_.version}function oe(E,_,I,Y,j,W){const xe=r.convert(I.format,I.colorSpace),re=r.convert(I.type),Ae=T(I.internalFormat,xe,re,I.colorSpace),De=n.get(_),Q=n.get(I);if(Q.__renderTarget=_,!De.__hasExternalTextures){const ne=Math.max(1,_.width>>W),ve=Math.max(1,_.height>>W);j===i.TEXTURE_3D||j===i.TEXTURE_2D_ARRAY?t.texImage3D(j,W,Ae,ne,ve,_.depth,0,xe,re,null):t.texImage2D(j,W,Ae,ne,ve,0,xe,re,null)}t.bindFramebuffer(i.FRAMEBUFFER,E),bt(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Y,j,Q.__webglTexture,0,P(_)):(j===i.TEXTURE_2D||j>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,Y,j,Q.__webglTexture,W),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Be(E,_,I){if(i.bindRenderbuffer(i.RENDERBUFFER,E),_.depthBuffer){const Y=_.depthTexture,j=Y&&Y.isDepthTexture?Y.type:null,W=w(_.stencilBuffer,j),xe=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;bt(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,P(_),W,_.width,_.height):I?i.renderbufferStorageMultisample(i.RENDERBUFFER,P(_),W,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,W,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,xe,i.RENDERBUFFER,E)}else{const Y=_.textures;for(let j=0;j<Y.length;j++){const W=Y[j],xe=r.convert(W.format,W.colorSpace),re=r.convert(W.type),Ae=T(W.internalFormat,xe,re,W.colorSpace);bt(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,P(_),Ae,_.width,_.height):I?i.renderbufferStorageMultisample(i.RENDERBUFFER,P(_),Ae,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,Ae,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Re(E,_,I){const Y=_.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,E),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const j=n.get(_.depthTexture);if(j.__renderTarget=_,(!j.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),Y){if(j.__webglInit===void 0&&(j.__webglInit=!0,_.depthTexture.addEventListener("dispose",S)),j.__webglTexture===void 0){j.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,j.__webglTexture),pe(i.TEXTURE_CUBE_MAP,_.depthTexture);const De=r.convert(_.depthTexture.format),Q=r.convert(_.depthTexture.type);let ne;_.depthTexture.format===Gn?ne=i.DEPTH_COMPONENT24:_.depthTexture.format===xi&&(ne=i.DEPTH24_STENCIL8);for(let ve=0;ve<6;ve++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,ne,_.width,_.height,0,De,Q,null)}}else B(_.depthTexture,0);const W=j.__webglTexture,xe=P(_),re=Y?i.TEXTURE_CUBE_MAP_POSITIVE_X+I:i.TEXTURE_2D,Ae=_.depthTexture.format===xi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(_.depthTexture.format===Gn)bt(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Ae,re,W,0,xe):i.framebufferTexture2D(i.FRAMEBUFFER,Ae,re,W,0);else if(_.depthTexture.format===xi)bt(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Ae,re,W,0,xe):i.framebufferTexture2D(i.FRAMEBUFFER,Ae,re,W,0);else throw new Error("Unknown depthTexture format")}function Ie(E){const _=n.get(E),I=E.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==E.depthTexture){const Y=E.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),Y){const j=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,Y.removeEventListener("dispose",j)};Y.addEventListener("dispose",j),_.__depthDisposeCallback=j}_.__boundDepthTexture=Y}if(E.depthTexture&&!_.__autoAllocateDepthBuffer)if(I)for(let Y=0;Y<6;Y++)Re(_.__webglFramebuffer[Y],E,Y);else{const Y=E.texture.mipmaps;Y&&Y.length>0?Re(_.__webglFramebuffer[0],E,0):Re(_.__webglFramebuffer,E,0)}else if(I){_.__webglDepthbuffer=[];for(let Y=0;Y<6;Y++)if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[Y]),_.__webglDepthbuffer[Y]===void 0)_.__webglDepthbuffer[Y]=i.createRenderbuffer(),Be(_.__webglDepthbuffer[Y],E,!1);else{const j=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,W=_.__webglDepthbuffer[Y];i.bindRenderbuffer(i.RENDERBUFFER,W),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,W)}}else{const Y=E.texture.mipmaps;if(Y&&Y.length>0?t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),Be(_.__webglDepthbuffer,E,!1);else{const j=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,W=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,W),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,W)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ct(E,_,I){const Y=n.get(E);_!==void 0&&oe(Y.__webglFramebuffer,E,E.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),I!==void 0&&Ie(E)}function Ye(E){const _=E.texture,I=n.get(E),Y=n.get(_);E.addEventListener("dispose",A);const j=E.textures,W=E.isWebGLCubeRenderTarget===!0,xe=j.length>1;if(xe||(Y.__webglTexture===void 0&&(Y.__webglTexture=i.createTexture()),Y.__version=_.version,a.memory.textures++),W){I.__webglFramebuffer=[];for(let re=0;re<6;re++)if(_.mipmaps&&_.mipmaps.length>0){I.__webglFramebuffer[re]=[];for(let Ae=0;Ae<_.mipmaps.length;Ae++)I.__webglFramebuffer[re][Ae]=i.createFramebuffer()}else I.__webglFramebuffer[re]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){I.__webglFramebuffer=[];for(let re=0;re<_.mipmaps.length;re++)I.__webglFramebuffer[re]=i.createFramebuffer()}else I.__webglFramebuffer=i.createFramebuffer();if(xe)for(let re=0,Ae=j.length;re<Ae;re++){const De=n.get(j[re]);De.__webglTexture===void 0&&(De.__webglTexture=i.createTexture(),a.memory.textures++)}if(E.samples>0&&bt(E)===!1){I.__webglMultisampledFramebuffer=i.createFramebuffer(),I.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,I.__webglMultisampledFramebuffer);for(let re=0;re<j.length;re++){const Ae=j[re];I.__webglColorRenderbuffer[re]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,I.__webglColorRenderbuffer[re]);const De=r.convert(Ae.format,Ae.colorSpace),Q=r.convert(Ae.type),ne=T(Ae.internalFormat,De,Q,Ae.colorSpace,E.isXRRenderTarget===!0),ve=P(E);i.renderbufferStorageMultisample(i.RENDERBUFFER,ve,ne,E.width,E.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+re,i.RENDERBUFFER,I.__webglColorRenderbuffer[re])}i.bindRenderbuffer(i.RENDERBUFFER,null),E.depthBuffer&&(I.__webglDepthRenderbuffer=i.createRenderbuffer(),Be(I.__webglDepthRenderbuffer,E,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(W){t.bindTexture(i.TEXTURE_CUBE_MAP,Y.__webglTexture),pe(i.TEXTURE_CUBE_MAP,_);for(let re=0;re<6;re++)if(_.mipmaps&&_.mipmaps.length>0)for(let Ae=0;Ae<_.mipmaps.length;Ae++)oe(I.__webglFramebuffer[re][Ae],E,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+re,Ae);else oe(I.__webglFramebuffer[re],E,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+re,0);f(_)&&p(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(xe){for(let re=0,Ae=j.length;re<Ae;re++){const De=j[re],Q=n.get(De);let ne=i.TEXTURE_2D;(E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(ne=E.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ne,Q.__webglTexture),pe(ne,De),oe(I.__webglFramebuffer,E,De,i.COLOR_ATTACHMENT0+re,ne,0),f(De)&&p(ne)}t.unbindTexture()}else{let re=i.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(re=E.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(re,Y.__webglTexture),pe(re,_),_.mipmaps&&_.mipmaps.length>0)for(let Ae=0;Ae<_.mipmaps.length;Ae++)oe(I.__webglFramebuffer[Ae],E,_,i.COLOR_ATTACHMENT0,re,Ae);else oe(I.__webglFramebuffer,E,_,i.COLOR_ATTACHMENT0,re,0);f(_)&&p(re),t.unbindTexture()}E.depthBuffer&&Ie(E)}function Je(E){const _=E.textures;for(let I=0,Y=_.length;I<Y;I++){const j=_[I];if(f(j)){const W=M(E),xe=n.get(j).__webglTexture;t.bindTexture(W,xe),p(W),t.unbindTexture()}}}const st=[],Ge=[];function yt(E){if(E.samples>0){if(bt(E)===!1){const _=E.textures,I=E.width,Y=E.height;let j=i.COLOR_BUFFER_BIT;const W=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,xe=n.get(E),re=_.length>1;if(re)for(let De=0;De<_.length;De++)t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+De,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+De,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,xe.__webglMultisampledFramebuffer);const Ae=E.texture.mipmaps;Ae&&Ae.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,xe.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,xe.__webglFramebuffer);for(let De=0;De<_.length;De++){if(E.resolveDepthBuffer&&(E.depthBuffer&&(j|=i.DEPTH_BUFFER_BIT),E.stencilBuffer&&E.resolveStencilBuffer&&(j|=i.STENCIL_BUFFER_BIT)),re){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,xe.__webglColorRenderbuffer[De]);const Q=n.get(_[De]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Q,0)}i.blitFramebuffer(0,0,I,Y,0,0,I,Y,j,i.NEAREST),l===!0&&(st.length=0,Ge.length=0,st.push(i.COLOR_ATTACHMENT0+De),E.depthBuffer&&E.resolveDepthBuffer===!1&&(st.push(W),Ge.push(W),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Ge)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,st))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),re)for(let De=0;De<_.length;De++){t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+De,i.RENDERBUFFER,xe.__webglColorRenderbuffer[De]);const Q=n.get(_[De]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+De,i.TEXTURE_2D,Q,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,xe.__webglMultisampledFramebuffer)}else if(E.depthBuffer&&E.resolveDepthBuffer===!1&&l){const _=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function P(E){return Math.min(s.maxSamples,E.samples)}function bt(E){const _=n.get(E);return E.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function Qe(E){const _=a.render.frame;h.get(E)!==_&&(h.set(E,_),E.update())}function at(E,_){const I=E.colorSpace,Y=E.format,j=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||I!==Yi&&I!==ei&&($e.getTransfer(I)===tt?(Y!==yn||j!==tn)&&Le("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):je("WebGLTextures: Unsupported texture color space:",I)),_}function be(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(c.width=E.naturalWidth||E.width,c.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(c.width=E.displayWidth,c.height=E.displayHeight):(c.width=E.width,c.height=E.height),c}this.allocateTextureUnit=z,this.resetTextureUnits=k,this.setTexture2D=B,this.setTexture2DArray=G,this.setTexture3D=U,this.setTextureCube=te,this.rebindTextures=Ct,this.setupRenderTarget=Ye,this.updateRenderTargetMipmap=Je,this.updateMultisampleRenderTarget=yt,this.setupDepthRenderbuffer=Ie,this.setupFrameBufferTexture=oe,this.useMultisampledRTT=bt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function t0(i,e){function t(n,s=ei){let r;const a=$e.getTransfer(s);if(n===tn)return i.UNSIGNED_BYTE;if(n===uo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===fo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===rc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===ac)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===ic)return i.BYTE;if(n===sc)return i.SHORT;if(n===gs)return i.UNSIGNED_SHORT;if(n===ho)return i.INT;if(n===In)return i.UNSIGNED_INT;if(n===vn)return i.FLOAT;if(n===nn)return i.HALF_FLOAT;if(n===oc)return i.ALPHA;if(n===lc)return i.RGB;if(n===yn)return i.RGBA;if(n===Gn)return i.DEPTH_COMPONENT;if(n===xi)return i.DEPTH_STENCIL;if(n===po)return i.RED;if(n===mo)return i.RED_INTEGER;if(n===qi)return i.RG;if(n===go)return i.RG_INTEGER;if(n===_o)return i.RGBA_INTEGER;if(n===ir||n===sr||n===rr||n===ar)if(a===tt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===ir)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===sr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===rr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ar)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===ir)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===sr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===rr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ar)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ea||n===wa||n===Ta||n===Aa)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ea)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===wa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ta)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Aa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ca||n===Ra||n===Pa||n===Da||n===Ia||n===La||n===Ua)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ca||n===Ra)return a===tt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Pa)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Da)return r.COMPRESSED_R11_EAC;if(n===Ia)return r.COMPRESSED_SIGNED_R11_EAC;if(n===La)return r.COMPRESSED_RG11_EAC;if(n===Ua)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Fa||n===Na||n===Oa||n===Ba||n===ka||n===za||n===Ha||n===Ga||n===Va||n===Wa||n===Xa||n===qa||n===Ya||n===$a)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Fa)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Na)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Oa)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ba)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ka)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===za)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ha)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ga)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Va)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Wa)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Xa)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===qa)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ya)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===$a)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ka||n===ja||n===Za)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Ka)return a===tt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ja)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Za)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Qa||n===Ja||n===eo||n===to)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Qa)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ja)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===eo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===to)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===_s?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const n0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,i0=`
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

}`;class s0{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new xc(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Gt({vertexShader:n0,fragmentShader:i0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new qe(new ut(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class r0 extends Zi{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,d=null,m=null,g=null;const x=typeof XRWebGLBinding<"u",f=new s0,p={},M=t.getContextAttributes();let T=null,w=null;const R=[],S=[],A=new Ue;let v=null;const b=new gn;b.viewport=new xt;const X=new gn;X.viewport=new xt;const C=[b,X],k=new fd;let z=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let se=R[K];return se===void 0&&(se=new Ur,R[K]=se),se.getTargetRaySpace()},this.getControllerGrip=function(K){let se=R[K];return se===void 0&&(se=new Ur,R[K]=se),se.getGripSpace()},this.getHand=function(K){let se=R[K];return se===void 0&&(se=new Ur,R[K]=se),se.getHandSpace()};function B(K){const se=S.indexOf(K.inputSource);if(se===-1)return;const oe=R[se];oe!==void 0&&(oe.update(K.inputSource,K.frame,c||a),oe.dispatchEvent({type:K.type,data:K.inputSource}))}function G(){s.removeEventListener("select",B),s.removeEventListener("selectstart",B),s.removeEventListener("selectend",B),s.removeEventListener("squeeze",B),s.removeEventListener("squeezestart",B),s.removeEventListener("squeezeend",B),s.removeEventListener("end",G),s.removeEventListener("inputsourceschange",U);for(let K=0;K<R.length;K++){const se=S[K];se!==null&&(S[K]=null,R[K].disconnect(se))}z=null,q=null,f.reset();for(const K in p)delete p[K];e.setRenderTarget(T),m=null,d=null,u=null,s=null,w=null,ft.stop(),n.isPresenting=!1,e.setPixelRatio(v),e.setSize(A.width,A.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,n.isPresenting===!0&&Le("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,n.isPresenting===!0&&Le("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return d!==null?d:m},this.getBinding=function(){return u===null&&x&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(T=e.getRenderTarget(),s.addEventListener("select",B),s.addEventListener("selectstart",B),s.addEventListener("selectend",B),s.addEventListener("squeeze",B),s.addEventListener("squeezestart",B),s.addEventListener("squeezeend",B),s.addEventListener("end",G),s.addEventListener("inputsourceschange",U),M.xrCompatible!==!0&&await t.makeXRCompatible(),v=e.getPixelRatio(),e.getSize(A),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let oe=null,Be=null,Re=null;M.depth&&(Re=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,oe=M.stencil?xi:Gn,Be=M.stencil?_s:In);const Ie={colorFormat:t.RGBA8,depthFormat:Re,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Ie),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),w=new jt(d.textureWidth,d.textureHeight,{format:yn,type:tn,depthTexture:new ys(d.textureWidth,d.textureHeight,Be,void 0,void 0,void 0,void 0,void 0,void 0,oe),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{const oe={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,t,oe),s.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),w=new jt(m.framebufferWidth,m.framebufferHeight,{format:yn,type:tn,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1})}w.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),ft.setContext(s),ft.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return f.getDepthTexture()};function U(K){for(let se=0;se<K.removed.length;se++){const oe=K.removed[se],Be=S.indexOf(oe);Be>=0&&(S[Be]=null,R[Be].disconnect(oe))}for(let se=0;se<K.added.length;se++){const oe=K.added[se];let Be=S.indexOf(oe);if(Be===-1){for(let Ie=0;Ie<R.length;Ie++)if(Ie>=S.length){S.push(oe),Be=Ie;break}else if(S[Ie]===null){S[Ie]=oe,Be=Ie;break}if(Be===-1)break}const Re=R[Be];Re&&Re.connect(oe)}}const te=new F,Z=new F;function ue(K,se,oe){te.setFromMatrixPosition(se.matrixWorld),Z.setFromMatrixPosition(oe.matrixWorld);const Be=te.distanceTo(Z),Re=se.projectionMatrix.elements,Ie=oe.projectionMatrix.elements,Ct=Re[14]/(Re[10]-1),Ye=Re[14]/(Re[10]+1),Je=(Re[9]+1)/Re[5],st=(Re[9]-1)/Re[5],Ge=(Re[8]-1)/Re[0],yt=(Ie[8]+1)/Ie[0],P=Ct*Ge,bt=Ct*yt,Qe=Be/(-Ge+yt),at=Qe*-Ge;if(se.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(at),K.translateZ(Qe),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),Re[10]===-1)K.projectionMatrix.copy(se.projectionMatrix),K.projectionMatrixInverse.copy(se.projectionMatrixInverse);else{const be=Ct+Qe,E=Ye+Qe,_=P-at,I=bt+(Be-at),Y=Je*Ye/E*be,j=st*Ye/E*be;K.projectionMatrix.makePerspective(_,I,Y,j,be,E),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function _e(K,se){se===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(se.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let se=K.near,oe=K.far;f.texture!==null&&(f.depthNear>0&&(se=f.depthNear),f.depthFar>0&&(oe=f.depthFar)),k.near=X.near=b.near=se,k.far=X.far=b.far=oe,(z!==k.near||q!==k.far)&&(s.updateRenderState({depthNear:k.near,depthFar:k.far}),z=k.near,q=k.far),k.layers.mask=K.layers.mask|6,b.layers.mask=k.layers.mask&-5,X.layers.mask=k.layers.mask&-3;const Be=K.parent,Re=k.cameras;_e(k,Be);for(let Ie=0;Ie<Re.length;Ie++)_e(Re[Ie],Be);Re.length===2?ue(k,b,X):k.projectionMatrix.copy(b.projectionMatrix),pe(K,k,Be)};function pe(K,se,oe){oe===null?K.matrix.copy(se.matrixWorld):(K.matrix.copy(oe.matrixWorld),K.matrix.invert(),K.matrix.multiply(se.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(se.projectionMatrix),K.projectionMatrixInverse.copy(se.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=no*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(d===null&&m===null))return l},this.setFoveation=function(K){l=K,d!==null&&(d.fixedFoveation=K),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=K)},this.hasDepthSensing=function(){return f.texture!==null},this.getDepthSensingMesh=function(){return f.getMesh(k)},this.getCameraTexture=function(K){return p[K]};let ze=null;function gt(K,se){if(h=se.getViewerPose(c||a),g=se,h!==null){const oe=h.views;m!==null&&(e.setRenderTargetFramebuffer(w,m.framebuffer),e.setRenderTarget(w));let Be=!1;oe.length!==k.cameras.length&&(k.cameras.length=0,Be=!0);for(let Ye=0;Ye<oe.length;Ye++){const Je=oe[Ye];let st=null;if(m!==null)st=m.getViewport(Je);else{const yt=u.getViewSubImage(d,Je);st=yt.viewport,Ye===0&&(e.setRenderTargetTextures(w,yt.colorTexture,yt.depthStencilTexture),e.setRenderTarget(w))}let Ge=C[Ye];Ge===void 0&&(Ge=new gn,Ge.layers.enable(Ye),Ge.viewport=new xt,C[Ye]=Ge),Ge.matrix.fromArray(Je.transform.matrix),Ge.matrix.decompose(Ge.position,Ge.quaternion,Ge.scale),Ge.projectionMatrix.fromArray(Je.projectionMatrix),Ge.projectionMatrixInverse.copy(Ge.projectionMatrix).invert(),Ge.viewport.set(st.x,st.y,st.width,st.height),Ye===0&&(k.matrix.copy(Ge.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),Be===!0&&k.cameras.push(Ge)}const Re=s.enabledFeatures;if(Re&&Re.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){u=n.getBinding();const Ye=u.getDepthInformation(oe[0]);Ye&&Ye.isValid&&Ye.texture&&f.init(Ye,s.renderState)}if(Re&&Re.includes("camera-access")&&x){e.state.unbindTexture(),u=n.getBinding();for(let Ye=0;Ye<oe.length;Ye++){const Je=oe[Ye].camera;if(Je){let st=p[Je];st||(st=new xc,p[Je]=st);const Ge=u.getCameraImage(Je);st.sourceTexture=Ge}}}}for(let oe=0;oe<R.length;oe++){const Be=S[oe],Re=R[oe];Be!==null&&Re!==void 0&&Re.update(Be,se,c||a)}ze&&ze(K,se),se.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:se}),g=null}const ft=new bc;ft.setAnimationLoop(gt),this.setAnimationLoop=function(K){ze=K},this.dispose=function(){}}}const di=new Ln,a0=new mt;function o0(i,e){function t(f,p){f.matrixAutoUpdate===!0&&f.updateMatrix(),p.value.copy(f.matrix)}function n(f,p){p.color.getRGB(f.fogColor.value,vc(i)),p.isFog?(f.fogNear.value=p.near,f.fogFar.value=p.far):p.isFogExp2&&(f.fogDensity.value=p.density)}function s(f,p,M,T,w){p.isMeshBasicMaterial?r(f,p):p.isMeshLambertMaterial?(r(f,p),p.envMap&&(f.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(f,p),u(f,p)):p.isMeshPhongMaterial?(r(f,p),h(f,p),p.envMap&&(f.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(f,p),d(f,p),p.isMeshPhysicalMaterial&&m(f,p,w)):p.isMeshMatcapMaterial?(r(f,p),g(f,p)):p.isMeshDepthMaterial?r(f,p):p.isMeshDistanceMaterial?(r(f,p),x(f,p)):p.isMeshNormalMaterial?r(f,p):p.isLineBasicMaterial?(a(f,p),p.isLineDashedMaterial&&o(f,p)):p.isPointsMaterial?l(f,p,M,T):p.isSpriteMaterial?c(f,p):p.isShadowMaterial?(f.color.value.copy(p.color),f.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(f,p){f.opacity.value=p.opacity,p.color&&f.diffuse.value.copy(p.color),p.emissive&&f.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(f.map.value=p.map,t(p.map,f.mapTransform)),p.alphaMap&&(f.alphaMap.value=p.alphaMap,t(p.alphaMap,f.alphaMapTransform)),p.bumpMap&&(f.bumpMap.value=p.bumpMap,t(p.bumpMap,f.bumpMapTransform),f.bumpScale.value=p.bumpScale,p.side===Kt&&(f.bumpScale.value*=-1)),p.normalMap&&(f.normalMap.value=p.normalMap,t(p.normalMap,f.normalMapTransform),f.normalScale.value.copy(p.normalScale),p.side===Kt&&f.normalScale.value.negate()),p.displacementMap&&(f.displacementMap.value=p.displacementMap,t(p.displacementMap,f.displacementMapTransform),f.displacementScale.value=p.displacementScale,f.displacementBias.value=p.displacementBias),p.emissiveMap&&(f.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,f.emissiveMapTransform)),p.specularMap&&(f.specularMap.value=p.specularMap,t(p.specularMap,f.specularMapTransform)),p.alphaTest>0&&(f.alphaTest.value=p.alphaTest);const M=e.get(p),T=M.envMap,w=M.envMapRotation;T&&(f.envMap.value=T,di.copy(w),di.x*=-1,di.y*=-1,di.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(di.y*=-1,di.z*=-1),f.envMapRotation.value.setFromMatrix4(a0.makeRotationFromEuler(di)),f.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,f.reflectivity.value=p.reflectivity,f.ior.value=p.ior,f.refractionRatio.value=p.refractionRatio),p.lightMap&&(f.lightMap.value=p.lightMap,f.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,f.lightMapTransform)),p.aoMap&&(f.aoMap.value=p.aoMap,f.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,f.aoMapTransform))}function a(f,p){f.diffuse.value.copy(p.color),f.opacity.value=p.opacity,p.map&&(f.map.value=p.map,t(p.map,f.mapTransform))}function o(f,p){f.dashSize.value=p.dashSize,f.totalSize.value=p.dashSize+p.gapSize,f.scale.value=p.scale}function l(f,p,M,T){f.diffuse.value.copy(p.color),f.opacity.value=p.opacity,f.size.value=p.size*M,f.scale.value=T*.5,p.map&&(f.map.value=p.map,t(p.map,f.uvTransform)),p.alphaMap&&(f.alphaMap.value=p.alphaMap,t(p.alphaMap,f.alphaMapTransform)),p.alphaTest>0&&(f.alphaTest.value=p.alphaTest)}function c(f,p){f.diffuse.value.copy(p.color),f.opacity.value=p.opacity,f.rotation.value=p.rotation,p.map&&(f.map.value=p.map,t(p.map,f.mapTransform)),p.alphaMap&&(f.alphaMap.value=p.alphaMap,t(p.alphaMap,f.alphaMapTransform)),p.alphaTest>0&&(f.alphaTest.value=p.alphaTest)}function h(f,p){f.specular.value.copy(p.specular),f.shininess.value=Math.max(p.shininess,1e-4)}function u(f,p){p.gradientMap&&(f.gradientMap.value=p.gradientMap)}function d(f,p){f.metalness.value=p.metalness,p.metalnessMap&&(f.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,f.metalnessMapTransform)),f.roughness.value=p.roughness,p.roughnessMap&&(f.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,f.roughnessMapTransform)),p.envMap&&(f.envMapIntensity.value=p.envMapIntensity)}function m(f,p,M){f.ior.value=p.ior,p.sheen>0&&(f.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),f.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(f.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,f.sheenColorMapTransform)),p.sheenRoughnessMap&&(f.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,f.sheenRoughnessMapTransform))),p.clearcoat>0&&(f.clearcoat.value=p.clearcoat,f.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(f.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,f.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(f.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(f.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Kt&&f.clearcoatNormalScale.value.negate())),p.dispersion>0&&(f.dispersion.value=p.dispersion),p.iridescence>0&&(f.iridescence.value=p.iridescence,f.iridescenceIOR.value=p.iridescenceIOR,f.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],f.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(f.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,f.iridescenceMapTransform)),p.iridescenceThicknessMap&&(f.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,f.iridescenceThicknessMapTransform))),p.transmission>0&&(f.transmission.value=p.transmission,f.transmissionSamplerMap.value=M.texture,f.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap&&(f.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,f.transmissionMapTransform)),f.thickness.value=p.thickness,p.thicknessMap&&(f.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,f.thicknessMapTransform)),f.attenuationDistance.value=p.attenuationDistance,f.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(f.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(f.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,f.anisotropyMapTransform))),f.specularIntensity.value=p.specularIntensity,f.specularColor.value.copy(p.specularColor),p.specularColorMap&&(f.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,f.specularColorMapTransform)),p.specularIntensityMap&&(f.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,f.specularIntensityMapTransform))}function g(f,p){p.matcap&&(f.matcap.value=p.matcap)}function x(f,p){const M=e.get(p).light;f.referencePosition.value.setFromMatrixPosition(M.matrixWorld),f.nearDistance.value=M.shadow.camera.near,f.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function l0(i,e,t,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,T){const w=T.program;n.uniformBlockBinding(M,w)}function c(M,T){let w=s[M.id];w===void 0&&(g(M),w=h(M),s[M.id]=w,M.addEventListener("dispose",f));const R=T.program;n.updateUBOMapping(M,R);const S=e.render.frame;r[M.id]!==S&&(d(M),r[M.id]=S)}function h(M){const T=u();M.__bindingPointIndex=T;const w=i.createBuffer(),R=M.__size,S=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,w),i.bufferData(i.UNIFORM_BUFFER,R,S),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,T,w),w}function u(){for(let M=0;M<o;M++)if(a.indexOf(M)===-1)return a.push(M),M;return je("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(M){const T=s[M.id],w=M.uniforms,R=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let S=0,A=w.length;S<A;S++){const v=Array.isArray(w[S])?w[S]:[w[S]];for(let b=0,X=v.length;b<X;b++){const C=v[b];if(m(C,S,b,R)===!0){const k=C.__offset,z=Array.isArray(C.value)?C.value:[C.value];let q=0;for(let B=0;B<z.length;B++){const G=z[B],U=x(G);typeof G=="number"||typeof G=="boolean"?(C.__data[0]=G,i.bufferSubData(i.UNIFORM_BUFFER,k+q,C.__data)):G.isMatrix3?(C.__data[0]=G.elements[0],C.__data[1]=G.elements[1],C.__data[2]=G.elements[2],C.__data[3]=0,C.__data[4]=G.elements[3],C.__data[5]=G.elements[4],C.__data[6]=G.elements[5],C.__data[7]=0,C.__data[8]=G.elements[6],C.__data[9]=G.elements[7],C.__data[10]=G.elements[8],C.__data[11]=0):(G.toArray(C.__data,q),q+=U.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,k,C.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(M,T,w,R){const S=M.value,A=T+"_"+w;if(R[A]===void 0)return typeof S=="number"||typeof S=="boolean"?R[A]=S:R[A]=S.clone(),!0;{const v=R[A];if(typeof S=="number"||typeof S=="boolean"){if(v!==S)return R[A]=S,!0}else if(v.equals(S)===!1)return v.copy(S),!0}return!1}function g(M){const T=M.uniforms;let w=0;const R=16;for(let A=0,v=T.length;A<v;A++){const b=Array.isArray(T[A])?T[A]:[T[A]];for(let X=0,C=b.length;X<C;X++){const k=b[X],z=Array.isArray(k.value)?k.value:[k.value];for(let q=0,B=z.length;q<B;q++){const G=z[q],U=x(G),te=w%R,Z=te%U.boundary,ue=te+Z;w+=Z,ue!==0&&R-ue<U.storage&&(w+=R-ue),k.__data=new Float32Array(U.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=w,w+=U.storage}}}const S=w%R;return S>0&&(w+=R-S),M.__size=w,M.__cache={},this}function x(M){const T={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(T.boundary=4,T.storage=4):M.isVector2?(T.boundary=8,T.storage=8):M.isVector3||M.isColor?(T.boundary=16,T.storage=12):M.isVector4?(T.boundary=16,T.storage=16):M.isMatrix3?(T.boundary=48,T.storage=48):M.isMatrix4?(T.boundary=64,T.storage=64):M.isTexture?Le("WebGLRenderer: Texture samplers can not be part of an uniforms group."):Le("WebGLRenderer: Unsupported uniform value type.",M),T}function f(M){const T=M.target;T.removeEventListener("dispose",f);const w=a.indexOf(T.__bindingPointIndex);a.splice(w,1),i.deleteBuffer(s[T.id]),delete s[T.id],delete r[T.id]}function p(){for(const M in s)i.deleteBuffer(s[M]);a=[],s={},r={}}return{bind:l,update:c,dispose:p}}const c0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let En=null;function h0(){return En===null&&(En=new gc(c0,16,16,qi,nn),En.name="DFG_LUT",En.minFilter=vt,En.magFilter=vt,En.wrapS=xn,En.wrapT=xn,En.generateMipmaps=!1,En.needsUpdate=!0),En}class d0{constructor(e={}){const{canvas:t=Mh(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:m=tn}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;const x=m,f=new Set([_o,go,mo]),p=new Set([tn,In,gs,_s,uo,fo]),M=new Uint32Array(4),T=new Int32Array(4);let w=null,R=null;const S=[],A=[];let v=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Dn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const b=this;let X=!1;this._outputColorSpace=pt;let C=0,k=0,z=null,q=-1,B=null;const G=new xt,U=new xt;let te=null;const Z=new Ne(0);let ue=0,_e=t.width,pe=t.height,ze=1,gt=null,ft=null;const K=new xt(0,0,_e,pe),se=new xt(0,0,_e,pe);let oe=!1;const Be=new Mo;let Re=!1,Ie=!1;const Ct=new mt,Ye=new F,Je=new xt,st={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Ge=!1;function yt(){return z===null?ze:1}let P=n;function bt(y,L){return t.getContext(y,L)}try{const y={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${co}`),t.addEventListener("webglcontextlost",ye,!1),t.addEventListener("webglcontextrestored",Fe,!1),t.addEventListener("webglcontextcreationerror",ot,!1),P===null){const L="webgl2";if(P=bt(L,y),P===null)throw bt(L)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(y){throw je("WebGLRenderer: "+y.message),y}let Qe,at,be,E,_,I,Y,j,W,xe,re,Ae,De,Q,ne,ve,Se,fe,Ve,D,ae,ie,ge;function J(){Qe=new dp(P),Qe.init(),ae=new t0(P,Qe),at=new ip(P,Qe,e,ae),be=new Jm(P,Qe),at.reversedDepthBuffer&&d&&be.buffers.depth.setReversed(!0),E=new pp(P),_=new km,I=new e0(P,Qe,be,_,at,ae,E),Y=new hp(b),j=new xd(P),ie=new tp(P,j),W=new up(P,j,E,ie),xe=new gp(P,W,j,ie,E),fe=new mp(P,at,I),ne=new sp(_),re=new Bm(b,Y,Qe,at,ie,ne),Ae=new o0(b,_),De=new Hm,Q=new Ym(Qe),Se=new ep(b,Y,be,xe,g,l),ve=new Qm(b,xe,at),ge=new l0(P,E,at,be),Ve=new np(P,Qe,E),D=new fp(P,Qe,E),E.programs=re.programs,b.capabilities=at,b.extensions=Qe,b.properties=_,b.renderLists=De,b.shadowMap=ve,b.state=be,b.info=E}J(),x!==tn&&(v=new xp(x,t.width,t.height,s,r));const V=new r0(b,P);this.xr=V,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){const y=Qe.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){const y=Qe.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return ze},this.setPixelRatio=function(y){y!==void 0&&(ze=y,this.setSize(_e,pe,!1))},this.getSize=function(y){return y.set(_e,pe)},this.setSize=function(y,L,H=!0){if(V.isPresenting){Le("WebGLRenderer: Can't change size while VR device is presenting.");return}_e=y,pe=L,t.width=Math.floor(y*ze),t.height=Math.floor(L*ze),H===!0&&(t.style.width=y+"px",t.style.height=L+"px"),v!==null&&v.setSize(t.width,t.height),this.setViewport(0,0,y,L)},this.getDrawingBufferSize=function(y){return y.set(_e*ze,pe*ze).floor()},this.setDrawingBufferSize=function(y,L,H){_e=y,pe=L,ze=H,t.width=Math.floor(y*H),t.height=Math.floor(L*H),this.setViewport(0,0,y,L)},this.setEffects=function(y){if(x===tn){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(y){for(let L=0;L<y.length;L++)if(y[L].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}v.setEffects(y||[])},this.getCurrentViewport=function(y){return y.copy(G)},this.getViewport=function(y){return y.copy(K)},this.setViewport=function(y,L,H,O){y.isVector4?K.set(y.x,y.y,y.z,y.w):K.set(y,L,H,O),be.viewport(G.copy(K).multiplyScalar(ze).round())},this.getScissor=function(y){return y.copy(se)},this.setScissor=function(y,L,H,O){y.isVector4?se.set(y.x,y.y,y.z,y.w):se.set(y,L,H,O),be.scissor(U.copy(se).multiplyScalar(ze).round())},this.getScissorTest=function(){return oe},this.setScissorTest=function(y){be.setScissorTest(oe=y)},this.setOpaqueSort=function(y){gt=y},this.setTransparentSort=function(y){ft=y},this.getClearColor=function(y){return y.copy(Se.getClearColor())},this.setClearColor=function(){Se.setClearColor(...arguments)},this.getClearAlpha=function(){return Se.getClearAlpha()},this.setClearAlpha=function(){Se.setClearAlpha(...arguments)},this.clear=function(y=!0,L=!0,H=!0){let O=0;if(y){let N=!1;if(z!==null){const ce=z.texture.format;N=f.has(ce)}if(N){const ce=z.texture.type,me=p.has(ce),he=Se.getClearColor(),Me=Se.getClearAlpha(),we=he.r,Oe=he.g,We=he.b;me?(M[0]=we,M[1]=Oe,M[2]=We,M[3]=Me,P.clearBufferuiv(P.COLOR,0,M)):(T[0]=we,T[1]=Oe,T[2]=We,T[3]=Me,P.clearBufferiv(P.COLOR,0,T))}else O|=P.COLOR_BUFFER_BIT}L&&(O|=P.DEPTH_BUFFER_BIT),H&&(O|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),O!==0&&P.clear(O)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ye,!1),t.removeEventListener("webglcontextrestored",Fe,!1),t.removeEventListener("webglcontextcreationerror",ot,!1),Se.dispose(),De.dispose(),Q.dispose(),_.dispose(),Y.dispose(),xe.dispose(),ie.dispose(),ge.dispose(),re.dispose(),V.dispose(),V.removeEventListener("sessionstart",Ao),V.removeEventListener("sessionend",Co),si.stop()};function ye(y){y.preventDefault(),Go("WebGLRenderer: Context Lost."),X=!0}function Fe(){Go("WebGLRenderer: Context Restored."),X=!1;const y=E.autoReset,L=ve.enabled,H=ve.autoUpdate,O=ve.needsUpdate,N=ve.type;J(),E.autoReset=y,ve.enabled=L,ve.autoUpdate=H,ve.needsUpdate=O,ve.type=N}function ot(y){je("WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function et(y){const L=y.target;L.removeEventListener("dispose",et),Un(L)}function Un(y){Fn(y),_.remove(y)}function Fn(y){const L=_.get(y).programs;L!==void 0&&(L.forEach(function(H){re.releaseProgram(H)}),y.isShaderMaterial&&re.releaseShaderCache(y))}this.renderBufferDirect=function(y,L,H,O,N,ce){L===null&&(L=st);const me=N.isMesh&&N.matrixWorld.determinant()<0,he=Oc(y,L,H,O,N);be.setMaterial(O,me);let Me=H.index,we=1;if(O.wireframe===!0){if(Me=W.getWireframeAttribute(H),Me===void 0)return;we=2}const Oe=H.drawRange,We=H.attributes.position;let Te=Oe.start*we,nt=(Oe.start+Oe.count)*we;ce!==null&&(Te=Math.max(Te,ce.start*we),nt=Math.min(nt,(ce.start+ce.count)*we)),Me!==null?(Te=Math.max(Te,0),nt=Math.min(nt,Me.count)):We!=null&&(Te=Math.max(Te,0),nt=Math.min(nt,We.count));const St=nt-Te;if(St<0||St===1/0)return;ie.setup(N,O,he,H,Me);let _t,it=Ve;if(Me!==null&&(_t=j.get(Me),it=D,it.setIndex(_t)),N.isMesh)O.wireframe===!0?(be.setLineWidth(O.wireframeLinewidth*yt()),it.setMode(P.LINES)):it.setMode(P.TRIANGLES);else if(N.isLine){let Nt=O.linewidth;Nt===void 0&&(Nt=1),be.setLineWidth(Nt*yt()),N.isLineSegments?it.setMode(P.LINES):N.isLineLoop?it.setMode(P.LINE_LOOP):it.setMode(P.LINE_STRIP)}else N.isPoints?it.setMode(P.POINTS):N.isSprite&&it.setMode(P.TRIANGLES);if(N.isBatchedMesh)if(N._multiDrawInstances!==null)fr("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),it.renderMultiDrawInstances(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount,N._multiDrawInstances);else if(Qe.get("WEBGL_multi_draw"))it.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else{const Nt=N._multiDrawStarts,Ee=N._multiDrawCounts,Zt=N._multiDrawCount,Ke=Me?j.get(Me).bytesPerElement:1,ln=_.get(O).currentProgram.getUniforms();for(let Mn=0;Mn<Zt;Mn++)ln.setValue(P,"_gl_DrawID",Mn),it.render(Nt[Mn]/Ke,Ee[Mn])}else if(N.isInstancedMesh)it.renderInstances(Te,St,N.count);else if(H.isInstancedBufferGeometry){const Nt=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,Ee=Math.min(H.instanceCount,Nt);it.renderInstances(Te,St,Ee)}else it.render(Te,St)};function To(y,L,H){y.transparent===!0&&y.side===Cn&&y.forceSinglePass===!1?(y.side=Kt,y.needsUpdate=!0,Rs(y,L,H),y.side=ni,y.needsUpdate=!0,Rs(y,L,H),y.side=Cn):Rs(y,L,H)}this.compile=function(y,L,H=null){H===null&&(H=y),R=Q.get(H),R.init(L),A.push(R),H.traverseVisible(function(N){N.isLight&&N.layers.test(L.layers)&&(R.pushLight(N),N.castShadow&&R.pushShadow(N))}),y!==H&&y.traverseVisible(function(N){N.isLight&&N.layers.test(L.layers)&&(R.pushLight(N),N.castShadow&&R.pushShadow(N))}),R.setupLights();const O=new Set;return y.traverse(function(N){if(!(N.isMesh||N.isPoints||N.isLine||N.isSprite))return;const ce=N.material;if(ce)if(Array.isArray(ce))for(let me=0;me<ce.length;me++){const he=ce[me];To(he,H,N),O.add(he)}else To(ce,H,N),O.add(ce)}),R=A.pop(),O},this.compileAsync=function(y,L,H=null){const O=this.compile(y,L,H);return new Promise(N=>{function ce(){if(O.forEach(function(me){_.get(me).currentProgram.isReady()&&O.delete(me)}),O.size===0){N(y);return}setTimeout(ce,10)}Qe.get("KHR_parallel_shader_compile")!==null?ce():setTimeout(ce,10)})};let Mr=null;function Nc(y){Mr&&Mr(y)}function Ao(){si.stop()}function Co(){si.start()}const si=new bc;si.setAnimationLoop(Nc),typeof self<"u"&&si.setContext(self),this.setAnimationLoop=function(y){Mr=y,V.setAnimationLoop(y),y===null?si.stop():si.start()},V.addEventListener("sessionstart",Ao),V.addEventListener("sessionend",Co),this.render=function(y,L){if(L!==void 0&&L.isCamera!==!0){je("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(X===!0)return;const H=V.enabled===!0&&V.isPresenting===!0,O=v!==null&&(z===null||H)&&v.begin(b,z);if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),L.parent===null&&L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),V.enabled===!0&&V.isPresenting===!0&&(v===null||v.isCompositing()===!1)&&(V.cameraAutoUpdate===!0&&V.updateCamera(L),L=V.getCamera()),y.isScene===!0&&y.onBeforeRender(b,y,L,z),R=Q.get(y,A.length),R.init(L),A.push(R),Ct.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),Be.setFromProjectionMatrix(Ct,Rn,L.reversedDepth),Ie=this.localClippingEnabled,Re=ne.init(this.clippingPlanes,Ie),w=De.get(y,S.length),w.init(),S.push(w),V.enabled===!0&&V.isPresenting===!0){const me=b.xr.getDepthSensingMesh();me!==null&&br(me,L,-1/0,b.sortObjects)}br(y,L,0,b.sortObjects),w.finish(),b.sortObjects===!0&&w.sort(gt,ft),Ge=V.enabled===!1||V.isPresenting===!1||V.hasDepthSensing()===!1,Ge&&Se.addToRenderList(w,y),this.info.render.frame++,Re===!0&&ne.beginShadows();const N=R.state.shadowsArray;if(ve.render(N,y,L),Re===!0&&ne.endShadows(),this.info.autoReset===!0&&this.info.reset(),(O&&v.hasRenderPass())===!1){const me=w.opaque,he=w.transmissive;if(R.setupLights(),L.isArrayCamera){const Me=L.cameras;if(he.length>0)for(let we=0,Oe=Me.length;we<Oe;we++){const We=Me[we];Po(me,he,y,We)}Ge&&Se.render(y);for(let we=0,Oe=Me.length;we<Oe;we++){const We=Me[we];Ro(w,y,We,We.viewport)}}else he.length>0&&Po(me,he,y,L),Ge&&Se.render(y),Ro(w,y,L)}z!==null&&k===0&&(I.updateMultisampleRenderTarget(z),I.updateRenderTargetMipmap(z)),O&&v.end(b),y.isScene===!0&&y.onAfterRender(b,y,L),ie.resetDefaultState(),q=-1,B=null,A.pop(),A.length>0?(R=A[A.length-1],Re===!0&&ne.setGlobalState(b.clippingPlanes,R.state.camera)):R=null,S.pop(),S.length>0?w=S[S.length-1]:w=null};function br(y,L,H,O){if(y.visible===!1)return;if(y.layers.test(L.layers)){if(y.isGroup)H=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(L);else if(y.isLight)R.pushLight(y),y.castShadow&&R.pushShadow(y);else if(y.isSprite){if(!y.frustumCulled||Be.intersectsSprite(y)){O&&Je.setFromMatrixPosition(y.matrixWorld).applyMatrix4(Ct);const me=xe.update(y),he=y.material;he.visible&&w.push(y,me,he,H,Je.z,null)}}else if((y.isMesh||y.isLine||y.isPoints)&&(!y.frustumCulled||Be.intersectsObject(y))){const me=xe.update(y),he=y.material;if(O&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),Je.copy(y.boundingSphere.center)):(me.boundingSphere===null&&me.computeBoundingSphere(),Je.copy(me.boundingSphere.center)),Je.applyMatrix4(y.matrixWorld).applyMatrix4(Ct)),Array.isArray(he)){const Me=me.groups;for(let we=0,Oe=Me.length;we<Oe;we++){const We=Me[we],Te=he[We.materialIndex];Te&&Te.visible&&w.push(y,me,Te,H,Je.z,We)}}else he.visible&&w.push(y,me,he,H,Je.z,null)}}const ce=y.children;for(let me=0,he=ce.length;me<he;me++)br(ce[me],L,H,O)}function Ro(y,L,H,O){const{opaque:N,transmissive:ce,transparent:me}=y;R.setupLightsView(H),Re===!0&&ne.setGlobalState(b.clippingPlanes,H),O&&be.viewport(G.copy(O)),N.length>0&&Cs(N,L,H),ce.length>0&&Cs(ce,L,H),me.length>0&&Cs(me,L,H),be.buffers.depth.setTest(!0),be.buffers.depth.setMask(!0),be.buffers.color.setMask(!0),be.setPolygonOffset(!1)}function Po(y,L,H,O){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;if(R.state.transmissionRenderTarget[O.id]===void 0){const Te=Qe.has("EXT_color_buffer_half_float")||Qe.has("EXT_color_buffer_float");R.state.transmissionRenderTarget[O.id]=new jt(1,1,{generateMipmaps:!0,type:Te?nn:tn,minFilter:_i,samples:Math.max(4,at.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:$e.workingColorSpace})}const ce=R.state.transmissionRenderTarget[O.id],me=O.viewport||G;ce.setSize(me.z*b.transmissionResolutionScale,me.w*b.transmissionResolutionScale);const he=b.getRenderTarget(),Me=b.getActiveCubeFace(),we=b.getActiveMipmapLevel();b.setRenderTarget(ce),b.getClearColor(Z),ue=b.getClearAlpha(),ue<1&&b.setClearColor(16777215,.5),b.clear(),Ge&&Se.render(H);const Oe=b.toneMapping;b.toneMapping=Dn;const We=O.viewport;if(O.viewport!==void 0&&(O.viewport=void 0),R.setupLightsView(O),Re===!0&&ne.setGlobalState(b.clippingPlanes,O),Cs(y,H,O),I.updateMultisampleRenderTarget(ce),I.updateRenderTargetMipmap(ce),Qe.has("WEBGL_multisampled_render_to_texture")===!1){let Te=!1;for(let nt=0,St=L.length;nt<St;nt++){const _t=L[nt],{object:it,geometry:Nt,material:Ee,group:Zt}=_t;if(Ee.side===Cn&&it.layers.test(O.layers)){const Ke=Ee.side;Ee.side=Kt,Ee.needsUpdate=!0,Do(it,H,O,Nt,Ee,Zt),Ee.side=Ke,Ee.needsUpdate=!0,Te=!0}}Te===!0&&(I.updateMultisampleRenderTarget(ce),I.updateRenderTargetMipmap(ce))}b.setRenderTarget(he,Me,we),b.setClearColor(Z,ue),We!==void 0&&(O.viewport=We),b.toneMapping=Oe}function Cs(y,L,H){const O=L.isScene===!0?L.overrideMaterial:null;for(let N=0,ce=y.length;N<ce;N++){const me=y[N],{object:he,geometry:Me,group:we}=me;let Oe=me.material;Oe.allowOverride===!0&&O!==null&&(Oe=O),he.layers.test(H.layers)&&Do(he,L,H,Me,Oe,we)}}function Do(y,L,H,O,N,ce){y.onBeforeRender(b,L,H,O,N,ce),y.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),N.onBeforeRender(b,L,H,O,y,ce),N.transparent===!0&&N.side===Cn&&N.forceSinglePass===!1?(N.side=Kt,N.needsUpdate=!0,b.renderBufferDirect(H,L,O,N,y,ce),N.side=ni,N.needsUpdate=!0,b.renderBufferDirect(H,L,O,N,y,ce),N.side=Cn):b.renderBufferDirect(H,L,O,N,y,ce),y.onAfterRender(b,L,H,O,N,ce)}function Rs(y,L,H){L.isScene!==!0&&(L=st);const O=_.get(y),N=R.state.lights,ce=R.state.shadowsArray,me=N.state.version,he=re.getParameters(y,N.state,ce,L,H),Me=re.getProgramCacheKey(he);let we=O.programs;O.environment=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?L.environment:null,O.fog=L.fog;const Oe=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap;O.envMap=Y.get(y.envMap||O.environment,Oe),O.envMapRotation=O.environment!==null&&y.envMap===null?L.environmentRotation:y.envMapRotation,we===void 0&&(y.addEventListener("dispose",et),we=new Map,O.programs=we);let We=we.get(Me);if(We!==void 0){if(O.currentProgram===We&&O.lightsStateVersion===me)return Lo(y,he),We}else he.uniforms=re.getUniforms(y),y.onBeforeCompile(he,b),We=re.acquireProgram(he,Me),we.set(Me,We),O.uniforms=he.uniforms;const Te=O.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(Te.clippingPlanes=ne.uniform),Lo(y,he),O.needsLights=kc(y),O.lightsStateVersion=me,O.needsLights&&(Te.ambientLightColor.value=N.state.ambient,Te.lightProbe.value=N.state.probe,Te.directionalLights.value=N.state.directional,Te.directionalLightShadows.value=N.state.directionalShadow,Te.spotLights.value=N.state.spot,Te.spotLightShadows.value=N.state.spotShadow,Te.rectAreaLights.value=N.state.rectArea,Te.ltc_1.value=N.state.rectAreaLTC1,Te.ltc_2.value=N.state.rectAreaLTC2,Te.pointLights.value=N.state.point,Te.pointLightShadows.value=N.state.pointShadow,Te.hemisphereLights.value=N.state.hemi,Te.directionalShadowMatrix.value=N.state.directionalShadowMatrix,Te.spotLightMatrix.value=N.state.spotLightMatrix,Te.spotLightMap.value=N.state.spotLightMap,Te.pointShadowMatrix.value=N.state.pointShadowMatrix),O.currentProgram=We,O.uniformsList=null,We}function Io(y){if(y.uniformsList===null){const L=y.currentProgram.getUniforms();y.uniformsList=or.seqWithValue(L.seq,y.uniforms)}return y.uniformsList}function Lo(y,L){const H=_.get(y);H.outputColorSpace=L.outputColorSpace,H.batching=L.batching,H.batchingColor=L.batchingColor,H.instancing=L.instancing,H.instancingColor=L.instancingColor,H.instancingMorph=L.instancingMorph,H.skinning=L.skinning,H.morphTargets=L.morphTargets,H.morphNormals=L.morphNormals,H.morphColors=L.morphColors,H.morphTargetsCount=L.morphTargetsCount,H.numClippingPlanes=L.numClippingPlanes,H.numIntersection=L.numClipIntersection,H.vertexAlphas=L.vertexAlphas,H.vertexTangents=L.vertexTangents,H.toneMapping=L.toneMapping}function Oc(y,L,H,O,N){L.isScene!==!0&&(L=st),I.resetTextureUnits();const ce=L.fog,me=O.isMeshStandardMaterial||O.isMeshLambertMaterial||O.isMeshPhongMaterial?L.environment:null,he=z===null?b.outputColorSpace:z.isXRRenderTarget===!0?z.texture.colorSpace:Yi,Me=O.isMeshStandardMaterial||O.isMeshLambertMaterial&&!O.envMap||O.isMeshPhongMaterial&&!O.envMap,we=Y.get(O.envMap||me,Me),Oe=O.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,We=!!H.attributes.tangent&&(!!O.normalMap||O.anisotropy>0),Te=!!H.morphAttributes.position,nt=!!H.morphAttributes.normal,St=!!H.morphAttributes.color;let _t=Dn;O.toneMapped&&(z===null||z.isXRRenderTarget===!0)&&(_t=b.toneMapping);const it=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,Nt=it!==void 0?it.length:0,Ee=_.get(O),Zt=R.state.lights;if(Re===!0&&(Ie===!0||y!==B)){const Rt=y===B&&O.id===q;ne.setState(O,y,Rt)}let Ke=!1;O.version===Ee.__version?(Ee.needsLights&&Ee.lightsStateVersion!==Zt.state.version||Ee.outputColorSpace!==he||N.isBatchedMesh&&Ee.batching===!1||!N.isBatchedMesh&&Ee.batching===!0||N.isBatchedMesh&&Ee.batchingColor===!0&&N.colorTexture===null||N.isBatchedMesh&&Ee.batchingColor===!1&&N.colorTexture!==null||N.isInstancedMesh&&Ee.instancing===!1||!N.isInstancedMesh&&Ee.instancing===!0||N.isSkinnedMesh&&Ee.skinning===!1||!N.isSkinnedMesh&&Ee.skinning===!0||N.isInstancedMesh&&Ee.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&Ee.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&Ee.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&Ee.instancingMorph===!1&&N.morphTexture!==null||Ee.envMap!==we||O.fog===!0&&Ee.fog!==ce||Ee.numClippingPlanes!==void 0&&(Ee.numClippingPlanes!==ne.numPlanes||Ee.numIntersection!==ne.numIntersection)||Ee.vertexAlphas!==Oe||Ee.vertexTangents!==We||Ee.morphTargets!==Te||Ee.morphNormals!==nt||Ee.morphColors!==St||Ee.toneMapping!==_t||Ee.morphTargetsCount!==Nt)&&(Ke=!0):(Ke=!0,Ee.__version=O.version);let ln=Ee.currentProgram;Ke===!0&&(ln=Rs(O,L,N));let Mn=!1,ri=!1,Si=!1;const rt=ln.getUniforms(),It=Ee.uniforms;if(be.useProgram(ln.program)&&(Mn=!0,ri=!0,Si=!0),O.id!==q&&(q=O.id,ri=!0),Mn||B!==y){be.buffers.depth.getReversed()&&y.reversedDepth!==!0&&(y._reversedDepth=!0,y.updateProjectionMatrix()),rt.setValue(P,"projectionMatrix",y.projectionMatrix),rt.setValue(P,"viewMatrix",y.matrixWorldInverse);const Wn=rt.map.cameraPosition;Wn!==void 0&&Wn.setValue(P,Ye.setFromMatrixPosition(y.matrixWorld)),at.logarithmicDepthBuffer&&rt.setValue(P,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(O.isMeshPhongMaterial||O.isMeshToonMaterial||O.isMeshLambertMaterial||O.isMeshBasicMaterial||O.isMeshStandardMaterial||O.isShaderMaterial)&&rt.setValue(P,"isOrthographic",y.isOrthographicCamera===!0),B!==y&&(B=y,ri=!0,Si=!0)}if(Ee.needsLights&&(Zt.state.directionalShadowMap.length>0&&rt.setValue(P,"directionalShadowMap",Zt.state.directionalShadowMap,I),Zt.state.spotShadowMap.length>0&&rt.setValue(P,"spotShadowMap",Zt.state.spotShadowMap,I),Zt.state.pointShadowMap.length>0&&rt.setValue(P,"pointShadowMap",Zt.state.pointShadowMap,I)),N.isSkinnedMesh){rt.setOptional(P,N,"bindMatrix"),rt.setOptional(P,N,"bindMatrixInverse");const Rt=N.skeleton;Rt&&(Rt.boneTexture===null&&Rt.computeBoneTexture(),rt.setValue(P,"boneTexture",Rt.boneTexture,I))}N.isBatchedMesh&&(rt.setOptional(P,N,"batchingTexture"),rt.setValue(P,"batchingTexture",N._matricesTexture,I),rt.setOptional(P,N,"batchingIdTexture"),rt.setValue(P,"batchingIdTexture",N._indirectTexture,I),rt.setOptional(P,N,"batchingColorTexture"),N._colorsTexture!==null&&rt.setValue(P,"batchingColorTexture",N._colorsTexture,I));const Vn=H.morphAttributes;if((Vn.position!==void 0||Vn.normal!==void 0||Vn.color!==void 0)&&fe.update(N,H,ln),(ri||Ee.receiveShadow!==N.receiveShadow)&&(Ee.receiveShadow=N.receiveShadow,rt.setValue(P,"receiveShadow",N.receiveShadow)),(O.isMeshStandardMaterial||O.isMeshLambertMaterial||O.isMeshPhongMaterial)&&O.envMap===null&&L.environment!==null&&(It.envMapIntensity.value=L.environmentIntensity),It.dfgLUT!==void 0&&(It.dfgLUT.value=h0()),ri&&(rt.setValue(P,"toneMappingExposure",b.toneMappingExposure),Ee.needsLights&&Bc(It,Si),ce&&O.fog===!0&&Ae.refreshFogUniforms(It,ce),Ae.refreshMaterialUniforms(It,O,ze,pe,R.state.transmissionRenderTarget[y.id]),or.upload(P,Io(Ee),It,I)),O.isShaderMaterial&&O.uniformsNeedUpdate===!0&&(or.upload(P,Io(Ee),It,I),O.uniformsNeedUpdate=!1),O.isSpriteMaterial&&rt.setValue(P,"center",N.center),rt.setValue(P,"modelViewMatrix",N.modelViewMatrix),rt.setValue(P,"normalMatrix",N.normalMatrix),rt.setValue(P,"modelMatrix",N.matrixWorld),O.isShaderMaterial||O.isRawShaderMaterial){const Rt=O.uniformsGroups;for(let Wn=0,Mi=Rt.length;Wn<Mi;Wn++){const Uo=Rt[Wn];ge.update(Uo,ln),ge.bind(Uo,ln)}}return ln}function Bc(y,L){y.ambientLightColor.needsUpdate=L,y.lightProbe.needsUpdate=L,y.directionalLights.needsUpdate=L,y.directionalLightShadows.needsUpdate=L,y.pointLights.needsUpdate=L,y.pointLightShadows.needsUpdate=L,y.spotLights.needsUpdate=L,y.spotLightShadows.needsUpdate=L,y.rectAreaLights.needsUpdate=L,y.hemisphereLights.needsUpdate=L}function kc(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return k},this.getRenderTarget=function(){return z},this.setRenderTargetTextures=function(y,L,H){const O=_.get(y);O.__autoAllocateDepthBuffer=y.resolveDepthBuffer===!1,O.__autoAllocateDepthBuffer===!1&&(O.__useRenderToTexture=!1),_.get(y.texture).__webglTexture=L,_.get(y.depthTexture).__webglTexture=O.__autoAllocateDepthBuffer?void 0:H,O.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(y,L){const H=_.get(y);H.__webglFramebuffer=L,H.__useDefaultFramebuffer=L===void 0};const zc=P.createFramebuffer();this.setRenderTarget=function(y,L=0,H=0){z=y,C=L,k=H;let O=null,N=!1,ce=!1;if(y){const he=_.get(y);if(he.__useDefaultFramebuffer!==void 0){be.bindFramebuffer(P.FRAMEBUFFER,he.__webglFramebuffer),G.copy(y.viewport),U.copy(y.scissor),te=y.scissorTest,be.viewport(G),be.scissor(U),be.setScissorTest(te),q=-1;return}else if(he.__webglFramebuffer===void 0)I.setupRenderTarget(y);else if(he.__hasExternalTextures)I.rebindTextures(y,_.get(y.texture).__webglTexture,_.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){const Oe=y.depthTexture;if(he.__boundDepthTexture!==Oe){if(Oe!==null&&_.has(Oe)&&(y.width!==Oe.image.width||y.height!==Oe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");I.setupDepthRenderbuffer(y)}}const Me=y.texture;(Me.isData3DTexture||Me.isDataArrayTexture||Me.isCompressedArrayTexture)&&(ce=!0);const we=_.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(we[L])?O=we[L][H]:O=we[L],N=!0):y.samples>0&&I.useMultisampledRTT(y)===!1?O=_.get(y).__webglMultisampledFramebuffer:Array.isArray(we)?O=we[H]:O=we,G.copy(y.viewport),U.copy(y.scissor),te=y.scissorTest}else G.copy(K).multiplyScalar(ze).floor(),U.copy(se).multiplyScalar(ze).floor(),te=oe;if(H!==0&&(O=zc),be.bindFramebuffer(P.FRAMEBUFFER,O)&&be.drawBuffers(y,O),be.viewport(G),be.scissor(U),be.setScissorTest(te),N){const he=_.get(y.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+L,he.__webglTexture,H)}else if(ce){const he=L;for(let Me=0;Me<y.textures.length;Me++){const we=_.get(y.textures[Me]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+Me,we.__webglTexture,H,he)}}else if(y!==null&&H!==0){const he=_.get(y.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,he.__webglTexture,H)}q=-1},this.readRenderTargetPixels=function(y,L,H,O,N,ce,me,he=0){if(!(y&&y.isWebGLRenderTarget)){je("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Me=_.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&me!==void 0&&(Me=Me[me]),Me){be.bindFramebuffer(P.FRAMEBUFFER,Me);try{const we=y.textures[he],Oe=we.format,We=we.type;if(y.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+he),!at.textureFormatReadable(Oe)){je("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!at.textureTypeReadable(We)){je("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}L>=0&&L<=y.width-O&&H>=0&&H<=y.height-N&&P.readPixels(L,H,O,N,ae.convert(Oe),ae.convert(We),ce)}finally{const we=z!==null?_.get(z).__webglFramebuffer:null;be.bindFramebuffer(P.FRAMEBUFFER,we)}}},this.readRenderTargetPixelsAsync=async function(y,L,H,O,N,ce,me,he=0){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Me=_.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&me!==void 0&&(Me=Me[me]),Me)if(L>=0&&L<=y.width-O&&H>=0&&H<=y.height-N){be.bindFramebuffer(P.FRAMEBUFFER,Me);const we=y.textures[he],Oe=we.format,We=we.type;if(y.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+he),!at.textureFormatReadable(Oe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!at.textureTypeReadable(We))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Te=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,Te),P.bufferData(P.PIXEL_PACK_BUFFER,ce.byteLength,P.STREAM_READ),P.readPixels(L,H,O,N,ae.convert(Oe),ae.convert(We),0);const nt=z!==null?_.get(z).__webglFramebuffer:null;be.bindFramebuffer(P.FRAMEBUFFER,nt);const St=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await bh(P,St,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,Te),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,ce),P.deleteBuffer(Te),P.deleteSync(St),ce}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(y,L=null,H=0){const O=Math.pow(2,-H),N=Math.floor(y.image.width*O),ce=Math.floor(y.image.height*O),me=L!==null?L.x:0,he=L!==null?L.y:0;I.setTexture2D(y,0),P.copyTexSubImage2D(P.TEXTURE_2D,H,0,0,me,he,N,ce),be.unbindTexture()};const Hc=P.createFramebuffer(),Gc=P.createFramebuffer();this.copyTextureToTexture=function(y,L,H=null,O=null,N=0,ce=0){let me,he,Me,we,Oe,We,Te,nt,St;const _t=y.isCompressedTexture?y.mipmaps[ce]:y.image;if(H!==null)me=H.max.x-H.min.x,he=H.max.y-H.min.y,Me=H.isBox3?H.max.z-H.min.z:1,we=H.min.x,Oe=H.min.y,We=H.isBox3?H.min.z:0;else{const It=Math.pow(2,-N);me=Math.floor(_t.width*It),he=Math.floor(_t.height*It),y.isDataArrayTexture?Me=_t.depth:y.isData3DTexture?Me=Math.floor(_t.depth*It):Me=1,we=0,Oe=0,We=0}O!==null?(Te=O.x,nt=O.y,St=O.z):(Te=0,nt=0,St=0);const it=ae.convert(L.format),Nt=ae.convert(L.type);let Ee;L.isData3DTexture?(I.setTexture3D(L,0),Ee=P.TEXTURE_3D):L.isDataArrayTexture||L.isCompressedArrayTexture?(I.setTexture2DArray(L,0),Ee=P.TEXTURE_2D_ARRAY):(I.setTexture2D(L,0),Ee=P.TEXTURE_2D),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,L.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,L.unpackAlignment);const Zt=P.getParameter(P.UNPACK_ROW_LENGTH),Ke=P.getParameter(P.UNPACK_IMAGE_HEIGHT),ln=P.getParameter(P.UNPACK_SKIP_PIXELS),Mn=P.getParameter(P.UNPACK_SKIP_ROWS),ri=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,_t.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,_t.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,we),P.pixelStorei(P.UNPACK_SKIP_ROWS,Oe),P.pixelStorei(P.UNPACK_SKIP_IMAGES,We);const Si=y.isDataArrayTexture||y.isData3DTexture,rt=L.isDataArrayTexture||L.isData3DTexture;if(y.isDepthTexture){const It=_.get(y),Vn=_.get(L),Rt=_.get(It.__renderTarget),Wn=_.get(Vn.__renderTarget);be.bindFramebuffer(P.READ_FRAMEBUFFER,Rt.__webglFramebuffer),be.bindFramebuffer(P.DRAW_FRAMEBUFFER,Wn.__webglFramebuffer);for(let Mi=0;Mi<Me;Mi++)Si&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,_.get(y).__webglTexture,N,We+Mi),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,_.get(L).__webglTexture,ce,St+Mi)),P.blitFramebuffer(we,Oe,me,he,Te,nt,me,he,P.DEPTH_BUFFER_BIT,P.NEAREST);be.bindFramebuffer(P.READ_FRAMEBUFFER,null),be.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(N!==0||y.isRenderTargetTexture||_.has(y)){const It=_.get(y),Vn=_.get(L);be.bindFramebuffer(P.READ_FRAMEBUFFER,Hc),be.bindFramebuffer(P.DRAW_FRAMEBUFFER,Gc);for(let Rt=0;Rt<Me;Rt++)Si?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,It.__webglTexture,N,We+Rt):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,It.__webglTexture,N),rt?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,Vn.__webglTexture,ce,St+Rt):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,Vn.__webglTexture,ce),N!==0?P.blitFramebuffer(we,Oe,me,he,Te,nt,me,he,P.COLOR_BUFFER_BIT,P.NEAREST):rt?P.copyTexSubImage3D(Ee,ce,Te,nt,St+Rt,we,Oe,me,he):P.copyTexSubImage2D(Ee,ce,Te,nt,we,Oe,me,he);be.bindFramebuffer(P.READ_FRAMEBUFFER,null),be.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else rt?y.isDataTexture||y.isData3DTexture?P.texSubImage3D(Ee,ce,Te,nt,St,me,he,Me,it,Nt,_t.data):L.isCompressedArrayTexture?P.compressedTexSubImage3D(Ee,ce,Te,nt,St,me,he,Me,it,_t.data):P.texSubImage3D(Ee,ce,Te,nt,St,me,he,Me,it,Nt,_t):y.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,ce,Te,nt,me,he,it,Nt,_t.data):y.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,ce,Te,nt,_t.width,_t.height,it,_t.data):P.texSubImage2D(P.TEXTURE_2D,ce,Te,nt,me,he,it,Nt,_t);P.pixelStorei(P.UNPACK_ROW_LENGTH,Zt),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,Ke),P.pixelStorei(P.UNPACK_SKIP_PIXELS,ln),P.pixelStorei(P.UNPACK_SKIP_ROWS,Mn),P.pixelStorei(P.UNPACK_SKIP_IMAGES,ri),ce===0&&L.generateMipmaps&&P.generateMipmap(Ee),be.unbindTexture()},this.initRenderTarget=function(y){_.get(y).__webglFramebuffer===void 0&&I.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?I.setTextureCube(y,0):y.isData3DTexture?I.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?I.setTexture2DArray(y,0):I.setTexture2D(y,0),be.unbindTexture()},this.resetState=function(){C=0,k=0,z=null,be.reset(),ie.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Rn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=$e._getDrawingBufferColorSpace(e),t.unpackColorSpace=$e._getUnpackColorSpace()}}const Js=16,u0=4,f0=7,p0=.08,Fl=14,mr=180,m0=120,g0=80,gr="down",Rc="up",lr="left",ro="right",_0="/emilia-pixel-adventure/",x0=`${_0}Game Assets`;class v0{constructor(){this.manager=new yc,this.textureLoader=new od(this.manager),this.cache=new Map,this.totalItems=0,this.loadedItems=0,this.overlay=document.createElement("div"),this.overlay.id="loading-screen",this.overlay.innerHTML=`
      <div class="loading-content">
        <h1>Emilia's Pixel Adventure</h1>
        <div class="loading-bar-bg">
          <div class="loading-bar-fill" id="loading-bar"></div>
        </div>
        <p id="loading-text">Lade Spielwelt...</p>
      </div>
    `,document.body.appendChild(this.overlay),this.manager.onProgress=(e,t,n)=>{this.loadedItems=t,this.totalItems=n;const s=Math.round(t/n*100),r=document.getElementById("loading-bar"),a=document.getElementById("loading-text");r&&(r.style.width=s+"%"),a&&(a.textContent=`Lade Spielwelt... ${s}%`)}}loadTexture(e,t=!0){const n=`${x0}/${e}`;return this.cache.has(n)?Promise.resolve(this.cache.get(n)):new Promise((s,r)=>{this.textureLoader.load(n,a=>{t&&(a.magFilter=Pe,a.minFilter=Pe),a.colorSpace=pt,a.generateMipmaps=!1,this.cache.set(n,a),s(a)},void 0,a=>{console.error(`Failed to load: ${n}`,a),r(a)})})}loadSpriteSheet(e,t,n,s){return this.loadTexture(e).then(r=>{const a=r.image.width,o=r.image.height,l=Math.floor(a/t);return{texture:r,frameWidth:t,frameHeight:n,frameCount:s,cols:l,sheetWidth:a,sheetHeight:o}})}hideLoadingScreen(){const e=document.getElementById("loading-screen");e&&(e.style.opacity="0",setTimeout(()=>e.remove(),500))}onLoad(){return new Promise(e=>{this.manager.onLoad=()=>e()})}}class y0{constructor(){this.keys={},this._justPressed={},this._consumed={},this.mousePos={x:0,y:0},this.mouseClicked=!1,this.mouseDown=!1,this._clickConsumed=!1,window.addEventListener("keydown",e=>{this.keys[e.code]||(this._justPressed[e.code]=!0),this.keys[e.code]=!0}),window.addEventListener("keyup",e=>{this.keys[e.code]=!1}),window.addEventListener("mousemove",e=>{this.mousePos.x=e.clientX/window.innerWidth*2-1,this.mousePos.y=-(e.clientY/window.innerHeight)*2+1}),window.addEventListener("mousedown",()=>{this.mouseDown=!0,this.mouseClicked=!0,this._clickConsumed=!1}),window.addEventListener("mouseup",()=>{this.mouseDown=!1})}isKeyDown(e){return!!this.keys[e]}justPressed(e){return this._justPressed[e]&&!this._consumed[e]?(this._consumed[e]=!0,!0):!1}get moveX(){let e=0;return(this.isKeyDown("KeyA")||this.isKeyDown("ArrowLeft"))&&(e-=1),(this.isKeyDown("KeyD")||this.isKeyDown("ArrowRight"))&&(e+=1),e}get moveY(){let e=0;return(this.isKeyDown("KeyW")||this.isKeyDown("ArrowUp"))&&(e-=1),(this.isKeyDown("KeyS")||this.isKeyDown("ArrowDown"))&&(e+=1),e}get isRunning(){return this.isKeyDown("ShiftLeft")||this.isKeyDown("ShiftRight")}consumeClick(){return this.mouseClicked&&!this._clickConsumed?(this._clickConsumed=!0,!0):!1}endFrame(){this.mouseClicked=!1,this._clickConsumed=!1;for(const e in this._justPressed)this._justPressed[e]=!1;this._consumed={}}}class S0{constructor(e){this.game=e,this.currentScene="hub",this.transitioning=!1,this.fadeAlpha=0,this.fadeDirection=0,this.pendingTarget=null,this.pendingSpawn=null,this.fadeDuration=.4,this.fadeElapsed=0,this._switching=!1,this.overlay=document.createElement("div"),this.overlay.id="scene-fade",this.overlay.style.cssText=`
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #000; opacity: 0; pointer-events: none; z-index: 500;
      transition: none;
    `,document.body.appendChild(this.overlay)}checkExits(e,t){if(!this.transitioning&&!(!t||!t.exits)){for(const n of t.exits)if(e.x>=n.x&&e.x<n.x+n.w&&e.y>=n.y&&e.y<n.y+n.h){this.transition(n.target,n.spawnX,n.spawnY);return}}}transition(e,t,n){var s;this.transitioning||this._switching||(this.transitioning=!0,this._switching=!1,(s=window.__game)!=null&&s.audio&&window.__game.audio.playTransition(),this.pendingTarget=e,this.pendingSpawn={x:t!==void 0?t:null,y:n!==void 0?n:null},this.fadeDirection=1,this.fadeElapsed=0,this.fadeAlpha=0)}update(e){this.transitioning&&(this.fadeElapsed+=e,this.fadeDirection===1?(this.fadeAlpha=Math.min(1,this.fadeElapsed/this.fadeDuration),this.overlay.style.opacity=this.fadeAlpha,this.fadeAlpha>=1&&!this._switching&&(this._switching=!0,this._performSwitch().then(()=>{this._switching=!1,this.fadeDirection=-1,this.fadeElapsed=0}).catch(t=>{console.error("Scene switch failed:",t),this._switching=!1,this.fadeDirection=-1,this.fadeElapsed=0}))):this.fadeDirection===-1&&(this.fadeAlpha=Math.max(0,1-this.fadeElapsed/this.fadeDuration),this.overlay.style.opacity=this.fadeAlpha,this.fadeAlpha<=0&&(this.transitioning=!1,this.fadeDirection=0,this.overlay.style.opacity=0)))}async _performSwitch(){this.currentScene=this.pendingTarget,await this.game.loadScene(this.pendingTarget,this.pendingSpawn)}dispose(){this.overlay.parentNode&&this.overlay.parentNode.removeChild(this.overlay)}}class M0{constructor(){this.ctx=null,this.masterGain=null,this.musicGain=null,this.sfxGain=null,this.muted=localStorage.getItem("emilia_muted")==="true",this.masterVolume=.4,this.musicVolume=.35,this.sfxVolume=.5,this._initialized=!1,this._currentMusic=null,this._ambientNodes=[]}init(){if(!this._initialized)try{this.ctx=new(window.AudioContext||window.webkitAudioContext),this.masterGain=this.ctx.createGain(),this.masterGain.connect(this.ctx.destination),this.musicGain=this.ctx.createGain(),this.musicGain.connect(this.masterGain),this.sfxGain=this.ctx.createGain(),this.sfxGain.connect(this.masterGain),this._updateVolumes(),this._initialized=!0}catch(e){console.warn("AudioManager: Web Audio not available",e)}}_ensureCtx(){var e;return this._initialized||this.init(),((e=this.ctx)==null?void 0:e.state)==="suspended"&&this.ctx.resume(),this._initialized}_updateVolumes(){if(!this.masterGain)return;const e=this.muted?0:this.masterVolume;this.masterGain.gain.setTargetAtTime(e,this.ctx.currentTime,.05),this.musicGain.gain.setTargetAtTime(this.musicVolume,this.ctx.currentTime,.05),this.sfxGain.gain.setTargetAtTime(this.sfxVolume,this.ctx.currentTime,.05)}toggleMute(){return this.muted=!this.muted,localStorage.setItem("emilia_muted",this.muted),this._updateVolumes(),this.muted}_tone(e,t,n,s,r=.3,a=null){if(!this._ensureCtx())return null;const o=s||this.ctx.currentTime,l=a||this.sfxGain,c=this.ctx.createOscillator(),h=this.ctx.createGain();return c.type=t,c.frequency.setValueAtTime(e,o),c.connect(h),h.connect(l),h.gain.setValueAtTime(0,o),h.gain.linearRampToValueAtTime(r,o+.01),h.gain.linearRampToValueAtTime(r*.7,o+n*.3),h.gain.linearRampToValueAtTime(0,o+n),c.start(o),c.stop(o+n+.05),h}_noise(e,t,n=.1,s=2e3){if(!this._ensureCtx())return;const r=t||this.ctx.currentTime,a=this.ctx.sampleRate*e,o=this.ctx.createBuffer(1,a,this.ctx.sampleRate),l=o.getChannelData(0);for(let d=0;d<a;d++)l[d]=Math.random()*2-1;const c=this.ctx.createBufferSource();c.buffer=o;const h=this.ctx.createBiquadFilter();h.type="lowpass",h.frequency.setValueAtTime(s,r);const u=this.ctx.createGain();u.gain.setValueAtTime(n,r),u.gain.linearRampToValueAtTime(0,r+e),c.connect(h),h.connect(u),u.connect(this.sfxGain),c.start(r),c.stop(r+e+.01)}playSwordSwing(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;this._noise(.12,e,.08,3e3),this._tone(300,"triangle",.08,e,.1);const t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type="triangle",t.frequency.setValueAtTime(600,e),t.frequency.exponentialRampToValueAtTime(200,e+.1),n.gain.setValueAtTime(.08,e),n.gain.linearRampToValueAtTime(0,e+.12),t.connect(n),n.connect(this.sfxGain),t.start(e),t.stop(e+.15)}playPlayerHurt(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;this._tone(350,"square",.06,e,.08),this._tone(250,"square",.08,e+.06,.06),this._tone(200,"triangle",.1,e+.12,.05)}playPlayerDeath(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;[392,349,311,262,220].forEach((n,s)=>this._tone(n,"triangle",.25,e+s*.2,.1))}playHeal(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;[523,659,784,1047].forEach((t,n)=>this._tone(t,"sine",.2,e+n*.08,.1))}playItemPickup(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;this._tone(880,"square",.06,e,.08),this._tone(1175,"square",.1,e+.06,.06)}playChop(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;this._noise(.06,e,.1,1500),this._tone(180,"square",.05,e,.08),this._tone(120,"triangle",.08,e+.04,.05)}playMine(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;this._tone(800,"square",.03,e,.08),this._tone(600,"square",.03,e+.05,.06),this._noise(.04,e,.06,4e3)}playLevelUp(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;[523,659,784,1047,1319,1568].forEach((n,s)=>{this._tone(n,"square",.15,e+s*.1,.08),this._tone(n*.5,"triangle",.2,e+s*.1,.04)}),this._tone(1047,"sine",.5,e+.6,.06),this._tone(1319,"sine",.5,e+.6,.05),this._tone(1568,"sine",.5,e+.6,.05)}playDialogOpen(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;this._tone(523,"sine",.08,e,.1),this._tone(784,"sine",.1,e+.05,.08)}playTypeTick(){this._ensureCtx()&&this._tone(1200+Math.random()*200,"square",.02,this.ctx.currentTime,.03)}playDialogClose(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;this._tone(600,"sine",.08,e,.06),this._tone(400,"sine",.1,e+.05,.04)}playCraftSuccess(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;this._tone(523,"square",.1,e,.08),this._tone(659,"square",.1,e+.1,.08),this._tone(784,"square",.2,e+.2,.1),this._tone(1047,"triangle",.3,e+.2,.06)}playUIClick(){this._ensureCtx()&&this._tone(700,"square",.03,this.ctx.currentTime,.05)}playSlimeHit(){if(!this._ensureCtx())return;const e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type="sine",t.frequency.setValueAtTime(300,e),t.frequency.exponentialRampToValueAtTime(100,e+.15),n.gain.setValueAtTime(.12,e),n.gain.linearRampToValueAtTime(0,e+.15),t.connect(n),n.connect(this.sfxGain),t.start(e),t.stop(e+.2)}playSlimeDeath(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;this._tone(400,"sine",.05,e,.12),this._tone(600,"sine",.08,e+.05,.08),this._noise(.08,e+.05,.06,2e3)}playSkeletonHit(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;this._noise(.04,e,.08,5e3),this._tone(200,"square",.04,e,.06),this._noise(.03,e+.06,.06,4e3)}playSkeletonDeath(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;[300,250,180,120].forEach((t,n)=>{this._noise(.06,e+n*.08,.05,3e3),this._tone(t,"square",.06,e+n*.08,.04)})}playUnicornSparkle(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;[1047,1319,1568,2093].forEach((t,n)=>this._tone(t,"sine",.3-n*.05,e+n*.1,.06))}playUnicornPet(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;[659,784,988,1319,1568].forEach((n,s)=>{this._tone(n,"sine",.25,e+s*.12,.08),this._tone(n*2,"sine",.15,e+s*.12+.05,.03)})}playPlantHeal(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;[392,494,587,784].forEach((t,n)=>this._tone(t,"triangle",.2,e+n*.1,.08)),this._noise(.3,e,.03,1e3)}playEat(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;this._tone(250,"square",.05,e,.06),this._tone(300,"square",.05,e+.08,.06),this._tone(350,"square",.05,e+.16,.06)}playChestOpen(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;this._noise(.1,e,.04,800),this._tone(330,"triangle",.1,e+.08,.08),this._tone(523,"triangle",.15,e+.15,.1),this._tone(659,"sine",.2,e+.25,.08)}playFootstep(e="grass"){if(!this._ensureCtx())return;const t=this.ctx.currentTime;e==="stone"||e==="wood"?this._noise(.03,t,.03,3e3+Math.random()*1e3):this._noise(.04,t,.02,1200+Math.random()*600)}playMobAlert(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;this._tone(440,"square",.08,e,.06),this._tone(554,"square",.08,e+.08,.06),this._tone(659,"square",.12,e+.16,.08)}playTransition(){if(!this._ensureCtx())return;const e=this.ctx.currentTime;this._noise(.4,e,.05,600)}playMusic(e){var a;if(!this._ensureCtx()||((a=this._currentMusic)==null?void 0:a.scene)===e)return;this.stopMusic();const t=E0[e];if(!t)return;let n=!1,s=[];const r=()=>{if(n)return;const o=this.ctx.currentTime+.1;t.notes.forEach((h,u)=>{if(n)return;const d=o+u*t.noteLen;h>0&&(this._tone(h,t.wave||"triangle",t.noteLen*.85,d,t.vol||.07,this.musicGain),t.harmony&&this._tone(h*t.harmony,"sine",t.noteLen*.6,d,(t.vol||.07)*.3,this.musicGain))}),t.bass&&t.bass.forEach((h,u)=>{if(n||h<=0)return;const d=o+u*(t.noteLen*(t.notes.length/t.bass.length));this._tone(h,"triangle",t.noteLen*2,d,(t.vol||.07)*.5,this.musicGain)});const l=t.notes.length*t.noteLen*1e3+500,c=setTimeout(r,l);s.push(c)};r(),this._currentMusic={scene:e,stop:()=>{n=!0,s.forEach(o=>clearTimeout(o))}}}stopMusic(){this._currentMusic&&(this._currentMusic.stop(),this._currentMusic=null)}}const Nl=262,er=294,wn=330,Ol=349,Zn=392,ki=440,ui=494,Dt=523,Qn=587,kt=659,fi=698,en=784,zi=880,Bl=988,un=131,b0=147,cs=165,ra=175,Jn=196,aa=220,$=0,E0={menu:{notes:[wn,Zn,Dt,$,kt,$,Qn,Dt,ui,$,Zn,$,ki,ui,Dt,$],bass:[un,$,Jn,$,un,$,cs,$],noteLen:.35,wave:"triangle",vol:.06,harmony:1.5},hub:{notes:[Dt,kt,en,kt,Qn,fi,zi,fi,kt,en,Dt,$,Qn,ui,Dt,$,Zn,Dt,kt,Dt,ki,Dt,fi,$,Zn,ui,Qn,$,Dt,kt,en,$],bass:[un,$,Jn,$,ra,$,un,$,cs,$,Jn,$,un,$,Jn,$],noteLen:.22,wave:"square",vol:.05,harmony:1.5},forest:{notes:[wn,$,Zn,ki,ui,$,ki,Zn,wn,$,er,wn,Zn,$,$,$,ki,$,ui,Dt,Qn,$,Dt,ui,ki,$,Zn,$,wn,$,$,$],bass:[cs,$,$,$,aa,$,$,$,Jn,$,$,$,cs,$,$,$],noteLen:.28,wave:"triangle",vol:.05,harmony:1.25},dungeon:{notes:[wn,$,$,Ol,$,wn,$,er,$,$,wn,$,$,Nl,$,$,er,$,$,wn,$,Ol,$,wn,$,$,er,$,$,Nl,$,$],bass:[un,$,$,$,aa,$,$,$,b0,$,$,$,un,$,$,$],noteLen:.32,wave:"square",vol:.04,harmony:1.2},lake:{notes:[Dt,kt,en,$,zi,en,kt,$,fi,kt,Qn,$,Dt,$,$,$,kt,en,Dt,$,Qn,kt,fi,$,kt,Qn,Dt,$,$,$,$,$],bass:[un,$,ra,$,Jn,$,un,$],noteLen:.3,wave:"sine",vol:.05,harmony:2},unicorn_meadow:{notes:[en,$,kt,en,zi,$,en,kt,fi,en,zi,Bl,Dt*2,$,$,$,Bl,zi,en,$,kt,fi,en,$,zi,en,kt,$,Dt,$,$,$],bass:[un,$,Jn,$,ra,$,cs,$,aa,$,Jn,$,un,$,$,$],noteLen:.25,wave:"sine",vol:.06,harmony:2}},Pc=[{level:1,xpRequired:0,statBonus:{},rewards:[],unlockQuest:"first_steps"},{level:2,xpRequired:25,statBonus:{maxHp:10},rewards:[],unlockQuest:"wood_collector"},{level:3,xpRequired:40,statBonus:{speedPct:5},rewards:[],unlockQuest:"nature_healer"},{level:4,xpRequired:60,statBonus:{maxHp:10},rewards:[{itemId:"sword_bone",count:1}],unlockQuest:null},{level:5,xpRequired:100,statBonus:{damagePct:5},rewards:[{itemId:"heal_potion",count:2}],unlockQuest:"slime_hunter"},{level:6,xpRequired:200,statBonus:{maxHp:10},rewards:[{itemId:"cooked_meat",count:3}],unlockQuest:null},{level:7,xpRequired:280,statBonus:{},rewards:[{itemId:"sword_stone",count:1}],unlockQuest:"dungeon_explorer"},{level:8,xpRequired:370,statBonus:{maxHp:10,speedPct:5},rewards:[],unlockQuest:null},{level:9,xpRequired:480,statBonus:{damagePct:10},rewards:[{itemId:"heal_potion",count:3}],unlockQuest:"skeleton_slayer"},{level:10,xpRequired:600,statBonus:{maxHp:20},rewards:[{itemId:"veggie_soup",count:3}],unlockQuest:null},{level:11,xpRequired:750,statBonus:{speedPct:5},rewards:[],unlockQuest:"unicorn_friend"},{level:12,xpRequired:900,statBonus:{maxHp:10},rewards:[{itemId:"crystal",count:5}],unlockQuest:null},{level:13,xpRequired:1100,statBonus:{damagePct:10},rewards:[],unlockQuest:"master_crafter"},{level:14,xpRequired:1400,statBonus:{maxHp:20},rewards:[{itemId:"heal_potion",count:5}],unlockQuest:null},{level:15,xpRequired:1800,statBonus:{maxHp:10},rewards:[{itemId:"unicorn_tear",count:3}],unlockQuest:"meadow_hero"}],cr=15;function oa(i){var e;return i>=cr?1/0:((e=Pc[i])==null?void 0:e.xpRequired)||999999}const la={first_steps:{id:"first_steps",name:"Erste Schritte",description:"Sprich mit Mama Tanja",type:"talk",target:"mama_tanja",count:1,xpReward:20,itemReward:[{itemId:"berry",count:5}]},wood_collector:{id:"wood_collector",name:"Holzsammlerin",description:"Sammle 5 Holz",type:"collect",target:"wood",count:5,xpReward:30,itemReward:[{itemId:"wood",count:5}]},nature_healer:{id:"nature_healer",name:"Naturheilerin",description:"Heile 3 Pflanzen",type:"heal",target:"plant",count:3,xpReward:40,itemReward:[{itemId:"magic_herb",count:2}]},slime_hunter:{id:"slime_hunter",name:"Mutige Abenteurerin",description:"Besiege 5 Slimes",type:"kill",target:"slime",count:5,xpReward:60,itemReward:[{itemId:"heal_potion",count:2}]},dungeon_explorer:{id:"dungeon_explorer",name:"Dungeon-Forscherin",description:"Betrete den Dungeon",type:"visit",target:"dungeon",count:1,xpReward:50,itemReward:[{itemId:"iron_ore",count:3}]},skeleton_slayer:{id:"skeleton_slayer",name:"Skelett-Jaegerin",description:"Besiege 10 Skelette",type:"kill",target:"skeleton",count:10,xpReward:80,itemReward:[{itemId:"crystal",count:3}]},unicorn_friend:{id:"unicorn_friend",name:"Einhornfreundin",description:"Streichle ein Einhorn",type:"pet",target:"unicorn",count:1,xpReward:100,itemReward:[{itemId:"rainbow_flower",count:1}]},master_crafter:{id:"master_crafter",name:"Meister-Crafterin",description:"Crafte 5 Items",type:"craft",target:"any",count:5,xpReward:80,itemReward:[{itemId:"heal_potion",count:3}]},meadow_hero:{id:"meadow_hero",name:"Heldin der Wiese",description:"Erreiche Level 15",type:"reach_level",target:15,count:1,xpReward:0,itemReward:[{itemId:"unicorn_tear",count:5}]}};class w0{constructor(){this.level=1,this.xp=0,this.totalXp=0,this.xpToNext=oa(1),this.bonusMaxHp=0,this.bonusDamagePct=0,this.bonusSpeedPct=0,this.activeQuests={},this.completedQuests={},this.stats={mobsKilled:{},itemsCollected:{},plantsHealed:0,unicornsPetted:0,itemsCrafted:0,scenesVisited:{},npcsSpoken:{}},this.onLevelUp=null,this.onQuestComplete=null,this.onXpGain=null}addXp(e){if(!(this.level>=cr))for(this.xp+=e,this.totalXp+=e,this.onXpGain&&this.onXpGain(e);this.xp>=this.xpToNext&&this.level<cr;)this.xp-=this.xpToNext,this.level++,this._applyLevelUp()}_applyLevelUp(){const e=Pc[this.level-1];e&&(e.statBonus.maxHp&&(this.bonusMaxHp+=e.statBonus.maxHp),e.statBonus.damagePct&&(this.bonusDamagePct+=e.statBonus.damagePct),e.statBonus.speedPct&&(this.bonusSpeedPct+=e.statBonus.speedPct),this.xpToNext=oa(this.level),e.unlockQuest&&la[e.unlockQuest]&&!this.completedQuests[e.unlockQuest]&&(this.activeQuests[e.unlockQuest]={progress:0,completed:!1}),this._checkQuestType("reach_level",this.level,1),this.onLevelUp&&this.onLevelUp(this.level,e))}getMaxHp(){return 100+this.bonusMaxHp}getDamageMultiplier(){return 1+this.bonusDamagePct/100}getSpeedMultiplier(){return 1+this.bonusSpeedPct/100}getXpProgress(){return this.level>=cr?1:this.xp/this.xpToNext}applyToPlayer(e){e.maxHp=this.getMaxHp(),e.hp>e.maxHp&&(e.hp=e.maxHp)}reportKill(e){const t=e.startsWith("slime")?"slime":e.startsWith("skeleton")?"skeleton":e;this.stats.mobsKilled[e]=(this.stats.mobsKilled[e]||0)+1,this._checkQuestType("kill",t,1)}reportCollect(e,t=1){this.stats.itemsCollected[e]=(this.stats.itemsCollected[e]||0)+t,this._checkQuestType("collect",e,t)}reportHeal(){this.stats.plantsHealed++,this._checkQuestType("heal","plant",1)}reportPet(){this.stats.unicornsPetted++,this._checkQuestType("pet","unicorn",1)}reportCraft(){this.stats.itemsCrafted++,this._checkQuestType("craft","any",1)}reportVisit(e){this.stats.scenesVisited[e]=!0,this._checkQuestType("visit",e,1)}reportTalk(e){this.stats.npcsSpoken[e]=!0,this._checkQuestType("talk",e,1)}_checkQuestType(e,t,n){for(const[s,r]of Object.entries(this.activeQuests)){if(r.completed)continue;const a=la[s];!a||a.type!==e||(e==="reach_level"?this.level>=a.target&&(r.progress=a.count):(a.target===t||a.target==="any")&&(r.progress+=n),r.progress>=a.count&&!r.completed&&(r.completed=!0,this.completedQuests[s]=!0,this.addXp(a.xpReward),this.onQuestComplete&&this.onQuestComplete(a)))}}getActiveQuest(){for(const[e,t]of Object.entries(this.activeQuests))if(!t.completed)return{...la[e],progress:t.progress};return null}getSaveData(){return{level:this.level,xp:this.xp,totalXp:this.totalXp,bonusMaxHp:this.bonusMaxHp,bonusDamagePct:this.bonusDamagePct,bonusSpeedPct:this.bonusSpeedPct,activeQuests:this.activeQuests,completedQuests:this.completedQuests,stats:this.stats}}loadSaveData(e){e&&(this.level=e.level||1,this.xp=e.xp||0,this.totalXp=e.totalXp||0,this.bonusMaxHp=e.bonusMaxHp||0,this.bonusDamagePct=e.bonusDamagePct||0,this.bonusSpeedPct=e.bonusSpeedPct||0,this.activeQuests=e.activeQuests||{},this.completedQuests=e.completedQuests||{},this.stats=e.stats||this.stats,this.xpToNext=oa(this.level))}initNewGame(){this.activeQuests.first_steps={progress:0,completed:!1}}}function kl(i,e,t){return i+(e-i)*t}function zl(i,e,t){return Math.max(e,Math.min(t,i))}function ii(i,e,t,n){const s=t-i,r=n-e;return Math.sqrt(s*s+r*r)}class T0{constructor(){const e=window.innerWidth/window.innerHeight,t=Fl/2,n=t*e;this.cam=new Ts(-n,n,t,-t,.1,100),this.cam.position.set(0,0,50),this.cam.lookAt(0,0,0),this.targetX=0,this.targetY=0,this.mapWidth=50,this.mapHeight=40,window.addEventListener("resize",()=>this._onResize())}setMapBounds(e,t){this.mapWidth=e,this.mapHeight=t}follow(e,t,n){this.targetX=e,this.targetY=t;const s=1-Math.pow(1-p0,n*60);let r=kl(this.cam.position.x,e,s),a=kl(this.cam.position.y,-t,s);const o=(this.cam.right-this.cam.left)/2,l=(this.cam.top-this.cam.bottom)/2;r=zl(r,o,this.mapWidth-o),a=zl(a,-(this.mapHeight-l),-l),this.cam.position.x=r,this.cam.position.y=a}get three(){return this.cam}_onResize(){const e=window.innerWidth/window.innerHeight,t=Fl/2,n=t*e;this.cam.left=-n,this.cam.right=n,this.cam.top=t,this.cam.bottom=-t,this.cam.updateProjectionMatrix()}}class ao{constructor(e,t=150,n=null){this.frameCount=e.frameCount,this.sheetWidth=e.sheetWidth,this.sheetHeight=e.sheetHeight,this.frameWidth=e.frameWidth,this.frameHeight=e.frameHeight,this.texture=e.texture.clone(),this.texture.needsUpdate=!0,this.texture.magFilter=Pe,this.texture.minFilter=Pe,this.texture.generateMipmaps=!1,this.texture.colorSpace=pt,this.texture.wrapS=xn,this.texture.wrapT=xn,this.texture.repeat.set(1/this.frameCount,1),this.texture.offset.set(0,0);const s=this.frameWidth/16,r=this.frameHeight/16,a=new ut(s,r),o=new dt({map:this.texture,transparent:!0,alphaTest:.1,depthWrite:!1});n&&(o.color=n),this.mesh=new qe(a,o),this.currentFrame=0,this.animSpeed=t,this.elapsed=0,this.playing=!0,this.loop=!0,this.flippedX=!1}update(e){this.playing&&(this.elapsed+=e*1e3,this.elapsed>=this.animSpeed&&(this.elapsed-=this.animSpeed,this.currentFrame++,this.currentFrame>=this.frameCount&&(this.currentFrame=this.loop?0:this.frameCount-1,this.loop||(this.playing=!1)),this.texture.offset.x=this.currentFrame/this.frameCount))}flipX(e){this.flippedX!==e&&(this.flippedX=e,this.mesh.scale.x=e?-Math.abs(this.mesh.scale.x):Math.abs(this.mesh.scale.x))}setPosition(e,t,n=0){this.mesh.position.set(e,-t,n)}dispose(){this.mesh.geometry.dispose(),this.mesh.material.dispose(),this.texture.dispose()}}class A0{constructor(e){this.scene=e,this.groundGroup=new Hi,this.propGroup=new Hi,e.add(this.groundGroup),e.add(this.propGroup)}buildGround(e){this.clearGround();const{width:t,height:n,ground:s,tilesetTexture:r,tileDefs:a}=e,o=r.image.width,l=r.image.height,c=new ut(1,1),h={};for(let u=0;u<n;u++)for(let d=0;d<t;d++){const m=s[u][d];m!==-1&&(h[m]||(h[m]=[]),h[m].push({col:d,row:u}))}for(const[u,d]of Object.entries(h)){const m=a[u];if(!m)continue;const g=new nd({map:r.clone(),transparent:!0,alphaTest:.01,roughness:.95,metalness:0});g.map.magFilter=Pe,g.map.minFilter=Pe,g.map.generateMipmaps=!1,g.map.colorSpace=pt,g.map.repeat.set(Js/o,Js/l),g.map.offset.set(m.x*Js/o,1-(m.y+1)*Js/l);const x=new Yh(c,g,d.length),f=new Ut;d.forEach((p,M)=>{f.position.set(p.col+.5,-(p.row+.5),0),f.updateMatrix(),x.setMatrixAt(M,f.matrix)}),x.instanceMatrix.needsUpdate=!0,this.groundGroup.add(x)}}addProp(e,t,n,s,r,a=.1){const o=new ut(s,r),l=new dt({map:e,transparent:!0,alphaTest:.1,depthWrite:!1});l.map.magFilter=Pe,l.map.minFilter=Pe,l.map.generateMipmaps=!1,l.map.colorSpace=pt;const c=new qe(o,l);return c.position.set(t+s/2,-(n+r/2),a+n*.001),this.propGroup.add(c),c}addPropFromSheet(e,t,n,s,r,a,o,l,c){const h=e.image.width,u=e.image.height,d=e.clone();d.magFilter=Pe,d.minFilter=Pe,d.generateMipmaps=!1,d.colorSpace=pt,d.repeat.set(s/h,r/u),d.offset.set(t/h,1-(n+r)/u);const m=new ut(l,c),g=new dt({map:d,transparent:!0,alphaTest:.1,depthWrite:!1}),x=new qe(m,g);return x.position.set(a+l/2,-(o+c/2),.1+o*.001),this.propGroup.add(x),x}clearGround(){for(;this.groundGroup.children.length>0;){const e=this.groundGroup.children[0];e.geometry&&e.geometry.dispose(),e.material&&(e.material.map&&e.material.map.dispose(),e.material.dispose()),this.groundGroup.remove(e)}}clearProps(){for(;this.propGroup.children.length>0;){const e=this.propGroup.children[0];e.geometry&&e.geometry.dispose(),e.material&&(e.material.map&&e.material.map.dispose(),e.material.dispose()),this.propGroup.remove(e)}}dispose(){this.clearGround(),this.clearProps(),this.scene.remove(this.groundGroup),this.scene.remove(this.propGroup)}}class C0{constructor(e){this.width=e.width,this.height=e.height,this.ground=e.ground,this.collision=e.collision,this.props=e.props||[],this.npcs=e.npcs||[],this.exits=e.exits||[],this.tileDefs=e.tileDefs}isBlocked(e,t,n,s){const r=Math.floor(e),a=Math.floor(e+n),o=Math.floor(t),l=Math.floor(t+s);for(let c=o;c<=l;c++)for(let h=r;h<=a;h++)if(this.getTileCollision(h,c))return!0;return!1}getTileCollision(e,t){return e<0||e>=this.width||t<0||t>=this.height?!0:this.collision[t][e]===1}getGroundTile(e,t){return e<0||e>=this.width||t<0||t>=this.height?-1:this.ground[t][e]}}class Sr{constructor(){this.x=0,this.y=0,this.sprites={},this.activeSprite=null,this.activeAnim="",this.scene=null,this.shadow=null}addAnimation(e,t,n,s=null){const r=new ao(t,n,s);return this.sprites[e]=r,r.mesh.visible=!1,r}setAnimation(e){this.activeAnim!==e&&this.sprites[e]&&(this.activeSprite&&(this.activeSprite.mesh.visible=!1),this.activeAnim=e,this.activeSprite=this.sprites[e],this.activeSprite.mesh.visible=!0,this.activeSprite.currentFrame=0,this.activeSprite.elapsed=0,this.activeSprite.playing=!0)}addToScene(e){this.scene=e;for(const t of Object.values(this.sprites))e.add(t.mesh);this._createShadow(e)}removeFromScene(){if(this.scene){for(const e of Object.values(this.sprites))this.scene.remove(e.mesh);this.shadow&&this.scene.remove(this.shadow),this.scene=null}}_createShadow(e){const t=new bo(.6,12),n=new dt({color:0,transparent:!0,opacity:.2,depthWrite:!1});this.shadow=new qe(t,n),this.shadow.scale.set(1,.35,1),e.add(this.shadow)}updatePosition(){const e=.2+this.y*.001;for(const t of Object.values(this.sprites))t.setPosition(this.x,this.y,e);this.shadow&&this.shadow.position.set(this.x,-(this.y+.8),e-.05)}update(e){this.activeSprite&&this.activeSprite.update(e),this.updatePosition()}dispose(){this.removeFromScene();for(const e of Object.values(this.sprites))e.dispose();this.shadow&&(this.shadow.geometry.dispose(),this.shadow.material.dispose()),this.sprites={}}}const lt=32,ct=32,ca={};function oo(i){return ca[i]?Promise.resolve(ca[i]):new Promise((e,t)=>{const n=new Image;n.crossOrigin="anonymous",n.onload=()=>{ca[i]=n,e(n)},n.onerror=()=>t(new Error(`Failed to load: ${i}`)),n.src=i})}function ht(i,e,t,n,s,r=null){const a=document.createElement("canvas");a.width=t*n,a.height=s;const o=a.getContext("2d",{willReadFrequently:!0});if(o.drawImage(i,0,e*s,t*n,s,0,0,t*n,s),r&&r.swaps&&r.swaps.length>0){const c=o.getImageData(0,0,a.width,a.height),h=c.data;for(let u=0;u<h.length;u+=4)if(!(h[u+3]<10))for(const d of r.swaps){const[m,g,x,f]=d.from,[p,M,T]=d.to,w=Math.abs(h[u]-m),R=Math.abs(h[u+1]-g),S=Math.abs(h[u+2]-x);if(w<=f&&R<=f&&S<=f){const A=(h[u]+h[u+1]+h[u+2])/(m+g+x+1);h[u]=Math.min(255,Math.round(p*A)),h[u+1]=Math.min(255,Math.round(M*A)),h[u+2]=Math.min(255,Math.round(T*A));break}}o.putImageData(c,0,0)}const l=new an(a);return l.magFilter=Pe,l.minFilter=Pe,l.generateMipmaps=!1,l.colorSpace=pt,{texture:l,frameWidth:n,frameHeight:s,frameCount:t,sheetWidth:a.width,sheetHeight:a.height}}function R0(i,e){const t=[];return i&&(t.push({from:[100,65,35,40],to:i}),t.push({from:[70,40,20,30],to:[Math.max(0,i[0]-25),Math.max(0,i[1]-20),Math.max(0,i[2]-15)]})),e&&(t.push({from:[80,130,190,50],to:e}),t.push({from:[50,90,145,40],to:[Math.max(0,e[0]-30),Math.max(0,e[1]-30),Math.max(0,e[2]-30)]})),t.length>0?{swaps:t}:null}async function Dc(i={}){const{hairColor:e=null,clothColor:t=null}=i,n=R0(e,t),s="/emilia-pixel-adventure/",[r,a]=await Promise.all([oo(`${s}Cute_Fantasy_Free/Player/Player.png`),oo(`${s}Cute_Fantasy_Free/Player/Player_Actions.png`)]),o={};return o.idle_down=ht(r,0,6,lt,ct,n),o.idle_side=ht(r,1,6,lt,ct,n),o.idle_up=ht(r,2,6,lt,ct,n),o.walk_down=ht(r,3,6,lt,ct,n),o.walk_side=ht(r,4,6,lt,ct,n),o.walk_up=ht(r,5,6,lt,ct,n),o.hurt_down=ht(r,6,6,lt,ct,n),o.hurt_side=ht(r,7,6,lt,ct,n),o.hurt_up=ht(r,8,6,lt,ct,n),o.death=ht(r,9,6,lt,ct,n),o.run_down=o.walk_down,o.run_side=o.walk_side,o.run_up=o.walk_up,o.slice_down=ht(a,1,3,lt,ct,n),o.slice_side=ht(a,4,3,lt,ct,n),o.slice_up=ht(a,7,3,lt,ct,n),o.collect_down=ht(a,10,3,lt,ct,n),o.collect_side=ht(a,13,3,lt,ct,n),o.collect_up=ht(a,16,3,lt,ct,n),o.crush_down=o.collect_down,o.crush_side=o.collect_side,o.crush_up=o.collect_up,o}async function P0(i){const e=await oo(i),t={};return t.idle_down=ht(e,0,6,lt,ct),t.idle_side=ht(e,1,6,lt,ct),t.idle_up=ht(e,2,6,lt,ct),t.walk_down=ht(e,3,6,lt,ct),t.walk_side=ht(e,4,6,lt,ct),t.walk_up=ht(e,5,6,lt,ct),t.hurt_down=ht(e,6,6,lt,ct),t.hurt_side=ht(e,7,6,lt,ct),t.hurt_up=ht(e,8,6,lt,ct),t.death=ht(e,9,6,lt,ct),t.run_down=t.walk_down,t.run_side=t.walk_side,t.run_up=t.walk_up,t}async function D0(i,e){return Dc({hairColor:i,clothColor:e})}const lo={emilia:{hairColor:[15,10,5],clothColor:[220,130,170]},mama_tanja:{hairColor:[90,55,30],clothColor:[230,130,160]},papa_milos:{hairColor:[15,12,8],clothColor:[70,110,180]},marie:{hairColor:[180,140,60],clothColor:[255,180,50]},liam:{hairColor:[50,30,15],clothColor:[60,160,80]},oma:{hairColor:[180,175,170],clothColor:[160,100,140]},opa:{hairColor:[160,155,145],clothColor:[100,130,100]},baba:{hairColor:[100,50,25],clothColor:[190,70,60]},deda:{hairColor:[130,125,115],clothColor:[60,80,130]}};class I0 extends Sr{constructor(){super(),this.direction=gr,this.state="idle",this.hp=100,this.maxHp=100,this.invulnTimer=0,this.hitFlashTimer=0,this.inventory=null,this.hitbox={offsetX:-.3,offsetY:.3,width:.6,height:.5}}async loadAnimations(e){const t=lo.emilia,n=await Dc(t),s={idle:mr,walk:m0,run:g0,slice:80,collect:80,crush:80,hurt:120,death:200};for(const[r,a]of Object.entries(n)){const o=r.split("_")[0],l=s[o]||150;this.addAnimation(r,a,l)}this.setAnimation("idle_down")}update(e,t,n){var g,x;if(this.invulnTimer>0&&(this.invulnTimer-=e),this.hitFlashTimer>0&&(this.hitFlashTimer-=e,this.activeSprite&&(this.activeSprite.mesh.visible=Math.floor(this.hitFlashTimer*10)%2===0)),this.state==="attack"||this.state==="dead"){super.update(e);return}const s=t.moveX,r=t.moveY,a=t.isRunning;(s!==0||r!==0)&&(Math.abs(s)>Math.abs(r)?this.direction=s>0?ro:lr:this.direction=r>0?gr:Rc);const o=a?f0:u0,l=((x=(g=window.__game)==null?void 0:g.progression)==null?void 0:x.getSpeedMultiplier())||1,c=o*l;let h=s*c*e,u=r*c*e;if(s!==0&&r!==0){const f=1/Math.sqrt(2);h*=f,u*=f}if(n){const f=this.hitbox;h!==0&&n.isBlocked(this.x+h+f.offsetX,this.y+f.offsetY,f.width,f.height)&&(h=0),u!==0&&n.isBlocked(this.x+h+f.offsetX,this.y+u+f.offsetY,f.width,f.height)&&(u=0)}this.x+=h,this.y+=u,n&&(this.x=Math.max(.5,Math.min(n.width-.5,this.x)),this.y=Math.max(.5,Math.min(n.height-.5,this.y)));const d=s!==0||r!==0;this.state=d?a?"run":"walk":"idle";const m=this.direction===lr||this.direction===ro?"side":this.direction;this.setAnimation(`${this.state}_${m}`),this.activeSprite&&this.activeSprite.flipX(this.direction===lr),super.update(e)}takeDamage(e){this.invulnTimer>0||this.state==="dead"||(this.hp=Math.max(0,this.hp-e),this.invulnTimer=1,this.hitFlashTimer=.5,this._onDamage&&this._onDamage(e),this.hp<=0&&this.die())}die(){this.state="dead",setTimeout(()=>{this.hp=this.maxHp,this.state="idle",this.invulnTimer=2,this._onDeath&&this._onDeath()},2e3)}heal(e){this.hp=Math.min(this.maxHp,this.hp+e)}}class L0 extends Sr{constructor(e){super(),this.name=e.name,this.role=e.role,this.x=e.x,this.y=e.y,this.direction=e.direction||"down",this.nameLabel=null,this._labelColor=e.clothingColor||16766720,this._dialogs=e.dialogs||[],this._characterId=e.id}async loadAnimations(e){const t=lo[this._characterId]||lo.papa_milos,n=await D0(t.hairColor,t.clothColor),s=mr+Math.floor(Math.random()*80);n.idle_down&&this.addAnimation("idle",n.idle_down,s),n.idle_side&&this.addAnimation("idle_side",n.idle_side,s),n.idle_up&&this.addAnimation("idle_up",n.idle_up,s);const r=this.direction==="side"?"idle_side":this.direction==="up"?"idle_up":"idle";this.setAnimation(r)}addToScene(e){super.addToScene(e),this._createNameLabel(e)}_createNameLabel(e){const t=document.createElement("canvas");t.width=256,t.height=48;const n=t.getContext("2d");n.clearRect(0,0,256,48),n.font='bold 20px "Segoe UI", sans-serif',n.textAlign="center",n.textBaseline="middle";const r=n.measureText(this.name).width+20,a=28,o=(256-r)/2,l=(48-a)/2;n.fillStyle="rgba(0, 0, 0, 0.55)",n.beginPath(),n.arc(o+a/2,l+a/2,a/2,Math.PI/2,Math.PI*1.5),n.arc(o+r-a/2,l+a/2,a/2,-Math.PI/2,Math.PI/2),n.closePath(),n.fill();const c=new Ne(this._labelColor);n.strokeStyle=`#${c.getHexString()}`,n.lineWidth=2,n.stroke(),n.fillStyle="#ffffff",n.fillText(this.name,128,24);const h=new an(t);h.magFilter=vt,h.minFilter=vt;const u=new ut(3.5,.65),d=new dt({map:h,transparent:!0,depthWrite:!1});this.nameLabel=new qe(u,d),e.add(this.nameLabel)}updatePosition(){super.updatePosition(),this.nameLabel&&this.nameLabel.position.set(this.x,-this.y+1.8,.5+this.y*.001)}dispose(){this.nameLabel&&(this.nameLabel.parent&&this.nameLabel.parent.remove(this.nameLabel),this.nameLabel.geometry.dispose(),this.nameLabel.material.map.dispose(),this.nameLabel.material.dispose()),super.dispose()}}class U0 extends Sr{constructor(e,t,n,s){super(),this.mobType=e,this.def=t,this.x=n,this.y=s,this.spawnX=n,this.spawnY=s,this.hp=t.hp,this.maxHp=t.hp,this.damage=t.damage,this.speed=t.speed,this.detectionRange=t.detectionRange,this.drops=t.drops,this.aiState="idle",this.attackCooldown=0,this.hitFlashTimer=0,this.deathTimer=0,this.respawnTimer=0,this.idleWanderTimer=0,this.wanderDx=0,this.wanderDy=0,this.alive=!0,this.hpBarMesh=null,this.hpBarCanvas=null,this.hpBarCtx=null,this.showHpBar=!1}async loadAnimations(e){const t=this.def.spriteType||"slime",n=this.def.tint?new Ne(this.def.tint[0],this.def.tint[1],this.def.tint[2]):null;if(t==="skeleton")try{const r=await P0("/emilia-pixel-adventure/Cute_Fantasy_Free/Enemies/Skeleton.png");this.addAnimation("idle",r.idle_down,mr+20,n),r.walk_down&&this.addAnimation("run",r.walk_down,100,n),r.death&&this.addAnimation("death",r.death,150,n),this.setAnimation("idle")}catch(s){console.warn("Skeleton mob failed to load:",s)}else try{const s=await new Promise((a,o)=>{const l=new Image;l.onload=()=>a(l),l.onerror=o;const c="/emilia-pixel-adventure/";l.src=`${c}Cute_Fantasy_Free/Enemies/Slime_Green.png`}),r=(a,o,l,c)=>{const h=document.createElement("canvas");h.width=o*l,h.height=c,h.getContext("2d").drawImage(s,0,a*c,o*l,c,0,0,o*l,c);const d=new an(h);return d.magFilter=Pe,d.minFilter=Pe,d.generateMipmaps=!1,d.colorSpace=pt,{texture:d,frameWidth:l,frameHeight:c,frameCount:o,sheetWidth:o*l,sheetHeight:c}};this.addAnimation("idle",r(0,4,64,64),mr+40,n),this.addAnimation("run",r(1,8,64,64),100,n),this.addAnimation("death",r(2,8,64,64),150,n),this.setAnimation("idle")}catch(s){console.warn("Slime mob failed to load:",s)}}addToScene(e){super.addToScene(e),this._createHpBar(e)}_createHpBar(e){this.hpBarCanvas=document.createElement("canvas"),this.hpBarCanvas.width=64,this.hpBarCanvas.height=8,this.hpBarCtx=this.hpBarCanvas.getContext("2d");const t=new an(this.hpBarCanvas);t.magFilter=Pe,t.minFilter=Pe;const n=new ut(2,.3),s=new dt({map:t,transparent:!0,depthWrite:!1});this.hpBarMesh=new qe(n,s),this.hpBarMesh.visible=!1,e.add(this.hpBarMesh)}_updateHpBar(){if(!this.hpBarCtx||!this.hpBarMesh||(this.showHpBar=this.hp<this.maxHp&&this.alive,this.hpBarMesh.visible=this.showHpBar,!this.showHpBar))return;const e=this.hpBarCtx,t=64,n=8;e.clearRect(0,0,t,n),e.fillStyle="rgba(0,0,0,0.6)",e.fillRect(0,0,t,n);const s=this.hp/this.maxHp;e.fillStyle=s>.5?"#44cc44":s>.25?"#ccaa00":"#cc3333",e.fillRect(1,1,(t-2)*s,n-2),this.hpBarMesh.material.map.needsUpdate=!0,this.hpBarMesh.position.set(this.x,-this.y+1.5,.5+this.y*.001)}update(e,t,n){if(this.aiState==="respawning"){this.respawnTimer-=e,this.respawnTimer<=0&&this.respawn();return}if(this.aiState==="dead"){this.deathTimer-=e,this.deathTimer<=0&&(this.hide(),this.aiState="respawning",this.respawnTimer=5);return}this.hitFlashTimer>0&&(this.hitFlashTimer-=e,this.activeSprite&&(this.activeSprite.mesh.visible=Math.floor(this.hitFlashTimer*10)%2===0)),this.attackCooldown>0&&(this.attackCooldown-=e);const s=ii(this.x,this.y,t.x,t.y);switch(this.aiState){case"idle":this._doIdle(e,s);break;case"chase":this._doChase(e,t,s,n);break;case"attack":this._doAttack(e,t,s);break}this._updateHpBar(),super.update(e)}_doIdle(e,t){var r;if(this.setAnimation("idle"),t<this.detectionRange){this.aiState="chase",(r=window.__game)!=null&&r.audio&&window.__game.audio.playMobAlert();return}this.idleWanderTimer-=e,this.idleWanderTimer<=0&&(this.wanderDx=(Math.random()-.5)*.5,this.wanderDy=(Math.random()-.5)*.5,this.idleWanderTimer=2+Math.random()*3);const n=this.x+this.wanderDx*e,s=this.y+this.wanderDy*e;ii(n,s,this.spawnX,this.spawnY)<3&&(this.x=n,this.y=s)}_doChase(e,t,n,s){if(n>this.detectionRange*1.5){this.aiState="idle";return}if(n<1.2){this.aiState="attack";return}this.setAnimation(this.sprites.run?"run":"idle");const r=t.x-this.x,a=t.y-this.y,o=Math.sqrt(r*r+a*a);o>0&&(this.x+=r/o*this.speed*e,this.y+=a/o*this.speed*e,this.activeSprite&&this.activeSprite.flipX(r<0))}_doAttack(e,t,n){if(n>2){this.aiState="chase";return}this.setAnimation("idle"),this.attackCooldown<=0&&(t.takeDamage(this.damage),this.attackCooldown=1.5)}takeDamage(e){this.alive&&(this.hp-=e,this.hitFlashTimer=.4,this.hp<=0&&this.die())}die(){return this.alive=!1,this.aiState="dead",this.deathTimer=1,this.sprites.death&&(this.setAnimation("death"),this.activeSprite&&(this.activeSprite.loop=!1)),this.drops}hide(){for(const e of Object.values(this.sprites))e.mesh.visible=!1;this.hpBarMesh&&(this.hpBarMesh.visible=!1)}respawn(){this.x=this.spawnX,this.y=this.spawnY,this.hp=this.maxHp,this.alive=!0,this.aiState="idle",this.hitFlashTimer=0;for(const e of Object.values(this.sprites))e.mesh.visible=!1;this.sprites.idle&&(this.activeSprite=this.sprites.idle,this.activeSprite.mesh.visible=!0,this.activeSprite.playing=!0,this.activeSprite.loop=!0,this.activeSprite.currentFrame=0),this.activeAnim="idle"}dispose(){this.hpBarMesh&&(this.hpBarMesh.parent&&this.hpBarMesh.parent.remove(this.hpBarMesh),this.hpBarMesh.geometry.dispose(),this.hpBarMesh.material.map.dispose(),this.hpBarMesh.material.dispose()),super.dispose()}}class F0{constructor(){this.attackCooldown=0,this.attackDuration=.25,this.attackRange=1.5,this.isAttacking=!1,this.attackTimer=0,this._hitMobs=new Set}tryAttack(e,t){return this.isAttacking||this.attackCooldown>0?!1:t.justPressed("Space")||t.consumeClick()?(this.isAttacking=!0,this.attackTimer=this.attackDuration,this.attackCooldown=.3,this._hitMobs.clear(),e.state="attack",!0):!1}update(e,t,n){var r,a,o;this.attackCooldown>0&&(this.attackCooldown-=e);const s=[];if(this.isAttacking){if(this.attackTimer-=e,this.attackTimer>this.attackDuration*.4){const l=this._getAttackArea(t);for(const c of n)if(!(!c.alive||this._hitMobs.has(c))&&ii(l.x,l.y,c.x,c.y)<this.attackRange){const h=(r=t.inventory)==null?void 0:r.getSelectedItem(),u=(h==null?void 0:h.damage)||10,d=((o=(a=window.__game)==null?void 0:a.progression)==null?void 0:o.getDamageMultiplier())||1,m=Math.round(u*d);c.takeDamage(m),this._hitMobs.add(c),s.push(c)}}this.attackTimer<=0&&(this.isAttacking=!1,t.state="idle")}return s}_getAttackArea(e){const t={[gr]:{x:0,y:1.2},[Rc]:{x:0,y:-1.2},[lr]:{x:-1.2,y:0},[ro]:{x:1.2,y:0}},n=t[e.direction]||t[gr];return{x:e.x+n.x,y:e.y+n.y}}}const N0={wood:{id:"wood",name:"Holz",category:"resource",stackSize:99,color:"#8B5E3C"},stone:{id:"stone",name:"Stein",category:"resource",stackSize:99,color:"#888888"},iron_ore:{id:"iron_ore",name:"Eisenerz",category:"resource",stackSize:99,color:"#AA6633"},earth:{id:"earth",name:"Erde",category:"resource",stackSize:99,color:"#6B4226"},mushroom:{id:"mushroom",name:"Pilz",category:"resource",stackSize:99,color:"#CC8844"},crystal:{id:"crystal",name:"Kristall",category:"resource",stackSize:99,color:"#88CCFF"},bone:{id:"bone",name:"Knochen",category:"resource",stackSize:99,color:"#DDCCAA"},shell:{id:"shell",name:"Muschel",category:"resource",stackSize:99,color:"#FFCCDD"},fish:{id:"fish",name:"Fisch",category:"food",stackSize:20,color:"#4488CC"},meat:{id:"meat",name:"Fleisch",category:"food",stackSize:20,color:"#CC4444"},vegetable:{id:"vegetable",name:"Gemuese",category:"food",stackSize:20,color:"#44AA44"},berry:{id:"berry",name:"Beere",category:"food",stackSize:20,color:"#AA44AA"},seed_carrot:{id:"seed_carrot",name:"Karottensamen",category:"seed",stackSize:50,color:"#FF8800"},seed_tomato:{id:"seed_tomato",name:"Tomatensamen",category:"seed",stackSize:50,color:"#FF3333"},seed_pumpkin:{id:"seed_pumpkin",name:"Kuerbissamen",category:"seed",stackSize:50,color:"#FFAA00"},seed_crystal:{id:"seed_crystal",name:"Kristallsamen",category:"seed",stackSize:10,color:"#AADDFF"},unicorn_tear:{id:"unicorn_tear",name:"Einhorntraene",category:"magical",stackSize:5,color:"#EEDDFF"},rainbow_flower:{id:"rainbow_flower",name:"Regenbogenblume",category:"magical",stackSize:10,color:"#FF88FF"},magic_herb:{id:"magic_herb",name:"Magisches Kraut",category:"magical",stackSize:20,color:"#44FFAA"},bloom_petal:{id:"bloom_petal",name:"Bluetenblatt",category:"magical",stackSize:30,color:"#FFAACC"},sword_wood:{id:"sword_wood",name:"Holzschwert",category:"weapon",stackSize:1,color:"#AA8844",damage:15},sword_stone:{id:"sword_stone",name:"Steinschwert",category:"weapon",stackSize:1,color:"#888888",damage:25},sword_bone:{id:"sword_bone",name:"Knochenkeule",category:"weapon",stackSize:1,color:"#CCBBAA",damage:20},cooked_fish:{id:"cooked_fish",name:"Gebratener Fisch",category:"food_cooked",stackSize:10,color:"#DDAA44",healAmount:30},cooked_meat:{id:"cooked_meat",name:"Bratfleisch",category:"food_cooked",stackSize:10,color:"#DD6644",healAmount:40},veggie_soup:{id:"veggie_soup",name:"Gemuesesuppe",category:"food_cooked",stackSize:10,color:"#77BB44",healAmount:50},heal_potion:{id:"heal_potion",name:"Heiltrank",category:"potion",stackSize:5,color:"#FF4488",healAmount:100}};function Ki(i){return N0[i]||null}class O0{constructor(e=8,t=3,n=8){this.hotbarSize=e,this.mainRows=t,this.mainCols=n,this.totalSlots=e+t*n,this.slots=Array.from({length:this.totalSlots},()=>({itemId:null,count:0})),this.selectedHotbar=0,this.onChange=null}addItem(e,t=1){const n=Ki(e);if(!n)return t;let s=t;for(let r=0;r<this.totalSlots&&s>0;r++){const a=this.slots[r];if(a.itemId===e&&a.count<n.stackSize){const o=Math.min(s,n.stackSize-a.count);a.count+=o,s-=o}}for(let r=0;r<this.totalSlots&&s>0;r++){const a=this.slots[r];if(a.itemId===null){const o=Math.min(s,n.stackSize);a.itemId=e,a.count=o,s-=o}}return s<t&&this.onChange&&this.onChange(),s}removeItem(e,t=1){let n=t;for(let s=this.totalSlots-1;s>=0&&n>0;s--){const r=this.slots[s];if(r.itemId===e){const a=Math.min(n,r.count);r.count-=a,n-=a,r.count<=0&&(r.itemId=null,r.count=0)}}return n<t&&this.onChange&&this.onChange(),n===0}hasItem(e,t=1){let n=0;for(const s of this.slots)s.itemId===e&&(n+=s.count);return n>=t}countItem(e){let t=0;for(const n of this.slots)n.itemId===e&&(t+=n.count);return t}getSelectedItem(){const e=this.slots[this.selectedHotbar];return e.itemId?{...Ki(e.itemId),count:e.count}:null}selectHotbar(e){e>=0&&e<this.hotbarSize&&(this.selectedHotbar=e,this.onChange&&this.onChange())}getHotbarSlots(){return this.slots.slice(0,this.hotbarSize)}getMainSlots(){return this.slots.slice(this.hotbarSize)}}const ha={};function Ce(i,e,t,n,s,r,a=255){i.fillStyle=a<255?`rgba(${n},${s},${r},${a/255})`:`rgb(${n},${s},${r})`,i.fillRect(e,t,1,1)}function ee(i,e,t,n,s,r,a,o){i.fillStyle=`rgb(${r},${a},${o})`,i.fillRect(e,t,n,s)}function B0(i,e){const n={wood:()=>{ee(i,3,4,4,10,139,90,50),ee(i,5,2,6,3,100,65,35),ee(i,9,6,4,8,160,110,60),ee(i,3,4,4,1,170,125,70),Ce(i,5,8,90,55,30),Ce(i,11,10,130,85,45)},stone:()=>{ee(i,3,6,10,7,140,140,145),ee(i,5,4,6,3,155,155,160),ee(i,4,5,8,1,165,165,170),ee(i,3,12,10,1,110,110,115),Ce(i,6,7,170,170,175),Ce(i,9,9,120,120,125)},iron_ore:()=>{ee(i,3,5,10,8,130,130,135),ee(i,5,7,3,3,180,120,60),ee(i,9,6,2,2,190,130,70),ee(i,6,11,3,2,170,110,55),Ce(i,5,7,210,150,80)},earth:()=>{ee(i,2,6,12,7,100,65,35),ee(i,4,5,8,2,110,75,40),ee(i,3,12,10,1,80,50,25),Ce(i,6,8,120,80,45),Ce(i,9,10,85,55,30),Ce(i,5,5,60,120,40)},mushroom:()=>{ee(i,7,8,2,6,200,180,150),ee(i,4,4,8,5,200,130,70),ee(i,3,5,10,3,210,140,80),Ce(i,5,5,255,255,230),Ce(i,9,6,255,255,230)},crystal:()=>{ee(i,6,3,4,10,120,190,255),ee(i,5,5,6,6,140,200,255),ee(i,7,2,2,2,180,220,255),Ce(i,6,4,200,235,255),Ce(i,9,7,100,170,240),Ce(i,5,10,90,160,230)},bone:()=>{ee(i,4,7,8,2,230,215,190),ee(i,3,6,3,4,240,225,200),ee(i,10,6,3,4,240,225,200),Ce(i,3,6,250,240,220),Ce(i,11,6,250,240,220)},fish:()=>{ee(i,3,6,10,4,70,140,200),ee(i,5,5,6,1,80,150,210),ee(i,5,10,6,1,60,120,180),ee(i,12,5,2,6,60,130,190),Ce(i,4,7,30,30,50),Ce(i,4,7,255,255,255),ee(i,7,6,4,1,90,170,230)},meat:()=>{ee(i,4,5,8,6,200,65,55),ee(i,5,4,6,1,210,75,65),ee(i,5,11,6,1,170,50,40),ee(i,3,10,3,4,230,215,190),Ce(i,6,6,230,90,80),Ce(i,9,8,220,80,70)},vegetable:()=>{ee(i,5,5,6,7,70,170,70),ee(i,4,6,8,5,80,180,80),ee(i,6,3,4,3,50,140,50),Ce(i,7,2,40,120,40),Ce(i,6,7,100,200,100)},berry:()=>{ee(i,5,6,6,6,170,50,170),ee(i,4,7,8,4,180,60,180),ee(i,7,4,2,3,60,130,50),Ce(i,6,7,200,80,200),Ce(i,9,9,140,30,140)},sword_wood:()=>{ee(i,7,2,2,8,180,150,100),ee(i,6,1,4,1,200,170,120),ee(i,5,10,6,2,110,75,40),ee(i,7,12,2,2,90,60,35),Ce(i,7,2,220,190,140)},sword_stone:()=>{ee(i,7,2,2,8,160,160,170),ee(i,6,1,4,1,180,180,190),ee(i,5,10,6,2,110,75,40),ee(i,7,12,2,2,90,60,35),Ce(i,7,3,200,200,210)},sword_bone:()=>{ee(i,7,2,2,8,230,215,190),ee(i,6,1,4,2,240,225,200),ee(i,5,10,6,2,180,130,90),ee(i,7,12,2,2,160,110,70)},cooked_fish:()=>{ee(i,3,6,10,4,210,170,70),ee(i,5,5,6,1,220,180,80),ee(i,12,5,2,6,190,150,60),Ce(i,4,7,40,40,40),ee(i,7,6,3,1,230,200,100)},cooked_meat:()=>{ee(i,4,5,8,6,180,100,50),ee(i,5,4,6,1,200,120,60),ee(i,3,10,3,4,230,215,190),Ce(i,7,7,210,130,70)},veggie_soup:()=>{ee(i,3,6,10,6,120,90,60),ee(i,4,7,8,4,100,170,80),ee(i,5,5,6,2,140,100,70),Ce(i,6,8,130,190,100),Ce(i,9,9,110,160,70)},heal_potion:()=>{ee(i,6,3,4,2,160,160,170),ee(i,5,5,6,7,230,80,140),ee(i,4,6,8,5,240,90,150),Ce(i,6,6,255,120,170),Ce(i,5,11,200,60,120),ee(i,6,2,4,1,180,180,190)},unicorn_tear:()=>{ee(i,6,3,4,8,220,210,240),ee(i,7,2,2,1,240,230,255),ee(i,5,5,6,4,230,220,250),Ce(i,7,4,255,255,255),Ce(i,6,7,200,190,230),Ce(i,9,6,255,240,255)},rainbow_flower:()=>{Ce(i,7,3,255,100,100),Ce(i,9,4,255,200,50),Ce(i,9,6,100,200,100),Ce(i,7,7,100,150,255),Ce(i,5,6,200,100,255),Ce(i,5,4,255,150,200),ee(i,7,4,2,3,255,230,100),ee(i,7,8,2,5,60,130,50)},magic_herb:()=>{ee(i,7,8,2,5,50,110,40),ee(i,4,4,8,5,60,200,130),ee(i,5,3,6,2,70,220,150),Ce(i,6,4,100,240,170),Ce(i,9,6,40,170,110)},bloom_petal:()=>{ee(i,5,4,6,6,255,170,200),ee(i,6,3,4,1,255,190,210),ee(i,6,10,4,1,240,150,180),Ce(i,7,6,255,200,220),Ce(i,8,7,255,210,225)},shell:()=>{ee(i,4,6,8,5,255,200,215),ee(i,5,5,6,1,255,210,225),ee(i,3,10,10,1,240,180,195),Ce(i,6,7,255,220,230),Ce(i,9,8,240,190,205),ee(i,6,7,1,3,230,170,185)},seed_carrot:()=>{ee(i,6,6,4,4,200,140,70),ee(i,7,5,2,1,180,120,50),Ce(i,7,4,60,130,40),Ce(i,8,3,50,120,35)},seed_tomato:()=>{ee(i,6,6,4,4,180,80,60),ee(i,7,5,2,1,160,60,40),Ce(i,7,4,60,130,40)},seed_pumpkin:()=>{ee(i,6,6,4,4,200,160,60),ee(i,7,5,2,1,180,140,40),Ce(i,7,4,60,130,40)},seed_crystal:()=>{ee(i,6,6,4,4,150,200,230),ee(i,7,5,2,1,130,180,210),Ce(i,7,4,100,200,255)}}[e];if(n)n();else{const s=k0("#888888");ee(i,3,3,10,10,s[0],s[1],s[2]),ee(i,4,4,8,8,Math.min(255,s[0]+30),Math.min(255,s[1]+30),Math.min(255,s[2]+30))}}function k0(i){const e=i.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}function Ic(i){if(ha[i])return ha[i];const e=document.createElement("canvas");e.width=16,e.height=16;const t=e.getContext("2d");return B0(t,i),ha[i]=e,e}function _r(i){return Ic(i).toDataURL()}function z0(i){const e=Ic(i),t=new an(e);return t.magFilter=Pe,t.minFilter=Pe,t.generateMipmaps=!1,t}class H0{constructor(e,t,n,s,r){this.itemId=e,this.count=t,this.x=n,this.y=s,this.alive=!0,this.lifetime=60,this.bounceTimer=Math.random()*Math.PI*2,this.pickupDelay=.5,this.magnetRange=2;const a=z0(e),o=new ut(.7,.7),l=new dt({map:a,transparent:!0,alphaTest:.1,depthWrite:!1});this.mesh=new qe(o,l),this.mesh.position.set(n,-s,.25+s*.001),r.add(this.mesh),this.scene=r}update(e,t,n){if(!this.alive)return;if(this.lifetime-=e,this.lifetime<=0){this.destroy();return}this.pickupDelay-=e,this.bounceTimer+=e*4;const s=Math.abs(Math.sin(this.bounceTimer))*.25;if(this.mesh.position.y=-this.y+s,this.mesh.position.x=this.x,this.mesh.rotation.z=Math.sin(this.bounceTimer*.5)*.15,this.lifetime<5&&(this.mesh.material.opacity=this.lifetime/5),this.pickupDelay<=0){const r=ii(this.x,this.y,t.x,t.y);if(r<this.magnetRange){const a=t.x-this.x,o=t.y-this.y,l=Math.sqrt(a*a+o*o);if(l>.1&&(this.x+=a/l*8*e,this.y+=o/l*8*e),r<.5&&n.addItem(this.itemId,this.count)===0)return this.destroy(),!0}}return!1}destroy(){this.alive=!1,this.mesh.parent&&this.scene.remove(this.mesh),this.mesh.geometry.dispose(),this.mesh.material.map.dispose(),this.mesh.material.dispose()}}class G0{constructor(e){this.scene=e,this.drops=[]}spawnDrop(e,t,n,s){const a=(Math.random()-.5)*.8,o=(Math.random()-.5)*.8;this.drops.push(new H0(e,t,n+a,s+o,this.scene))}spawnMobDrops(e,t,n){for(const s of e)if(Math.random()<s.chance){const r=s.min+Math.floor(Math.random()*(s.max-s.min+1));r>0&&this.spawnDrop(s.itemId,r,t,n)}}update(e,t,n){const s=[];for(const r of this.drops)r.alive&&r.update(e,t,n)&&s.push(r);return this.drops=this.drops.filter(r=>r.alive),s}clear(){for(const e of this.drops)e.destroy();this.drops=[]}dispose(){this.clear()}}class V0{constructor(){this.container=document.createElement("div"),this.container.id="hud",this.container.innerHTML=`
      <div id="hud-stats-panel">
        <div id="hud-level-badge">Lv.1</div>
        <div id="hud-bars">
          <div id="hud-hp-container">
            <div id="hud-hp-icon">❤️</div>
            <div id="hud-hp-bar-bg"><div id="hud-hp-bar-fill"></div></div>
            <div id="hud-hp-text">100/100</div>
          </div>
          <div id="hud-xp-container">
            <div id="hud-xp-icon">⭐</div>
            <div id="hud-xp-bar-bg"><div id="hud-xp-bar-fill"></div></div>
            <div id="hud-xp-text">0/30</div>
          </div>
        </div>
      </div>
      <div id="hud-quest-tracker"></div>
      <div id="hud-info"></div>
      <div id="hud-mute" title="Sound An/Aus">🔊</div>
      <div id="hud-levelup" style="display:none">
        <div id="hud-levelup-text"></div>
      </div>
      <div id="hud-hotbar"></div>
      <div id="hud-tooltip"></div>
    `,document.body.appendChild(this.container),this._addStyles();const e=document.getElementById("hud-mute");e&&(localStorage.getItem("emilia_muted")==="true"&&(e.textContent="🔇"),e.addEventListener("click",()=>{var n;const t=(n=window.__game)==null?void 0:n.audio;if(t){const s=t.toggleMute();e.textContent=s?"🔇":"🔊"}}))}update(e){const t=Math.max(0,e.hp/e.maxHp*100),n=document.getElementById("hud-hp-bar-fill"),s=document.getElementById("hud-hp-text");n&&(n.style.width=t+"%",n.style.background=t>50?"#5a9e3a":t>25?"#cc8a20":"#cc3333"),s&&(s.textContent=`${Math.ceil(e.hp)}/${e.maxHp}`)}updateXp(e){const t=document.getElementById("hud-level-badge"),n=document.getElementById("hud-xp-bar-fill"),s=document.getElementById("hud-xp-text");t&&(t.textContent=`Lv.${e.level}`),n&&(n.style.width=e.getXpProgress()*100+"%"),s&&(e.level>=15?s.textContent="MAX":s.textContent=`${e.xp}/${e.xpToNext}`)}updateQuest(e){const t=document.getElementById("hud-quest-tracker");if(t){if(!e){t.style.display="none";return}t.style.display="block",t.innerHTML=`
      <div class="quest-title">${e.name}</div>
      <div class="quest-desc">${e.description} (${Math.min(e.progress,e.count)}/${e.count})</div>
    `}}showLevelUp(e,t){const n=document.getElementById("hud-levelup");if(!n)return;let s=`<div class="levelup-title">LEVEL UP!</div><div class="levelup-level">Level ${e}</div>`;if(t&&t.length>0){s+='<div class="levelup-rewards">';for(const r of t)s+=`<div class="levelup-reward">+ ${r.count}x ${r.itemId}</div>`;s+="</div>"}n.querySelector("#hud-levelup-text").innerHTML=s,n.style.display="flex",n.style.opacity="1",setTimeout(()=>{n.style.opacity="0"},3e3),setTimeout(()=>{n.style.display="none"},3500)}showQuestComplete(e){this.showInfo(`Quest abgeschlossen: ${e}!`)}updateHotbar(e){const t=document.getElementById("hud-hotbar");if(!t)return;const n=e.getHotbarSlots();let s="";for(let r=0;r<n.length;r++){const a=n[r],o=r===e.selectedHotbar?" hud-slot-selected":"",l=a.itemId?Ki(a.itemId):null;if(s+=`<div class="hud-slot${o}" data-slot="${r}" data-item="${a.itemId||""}">`,l){const c=_r(a.itemId);s+=`<img class="hud-slot-icon" src="${c}" alt="${l.name}" draggable="false">`,a.count>1&&(s+=`<div class="hud-slot-count">${a.count}</div>`)}s+=`<div class="hud-slot-key">${r+1}</div>`,s+="</div>"}t.innerHTML=s,t.querySelectorAll(".hud-slot").forEach(r=>{r.addEventListener("mouseenter",a=>{const o=r.getAttribute("data-item");if(o){const l=Ki(o);l&&this._showTooltip(l,a)}}),r.addEventListener("mouseleave",()=>this._hideTooltip()),r.addEventListener("mousemove",a=>{const o=document.getElementById("hud-tooltip");o&&o.style.display!=="none"&&(o.style.left=a.clientX+12+"px",o.style.top=a.clientY-40+"px")})})}_showTooltip(e,t){const n=document.getElementById("hud-tooltip");if(!n)return;const s=_r(e.id);let r="";e.damage?r=`Schaden: ${e.damage}`:e.healAmount?r=`Heilt: ${e.healAmount} HP`:r=e.category==="resource"?"Rohstoff":e.category==="food"?"Nahrung":e.category==="seed"?"Samen":e.category==="magical"?"Magisch":"",n.innerHTML=`
      <div class="tooltip-header">
        <img src="${s}" class="tooltip-icon" draggable="false">
        <span class="tooltip-name">${e.name}</span>
      </div>
      ${r?`<div class="tooltip-desc">${r}</div>`:""}
    `,n.style.display="block";let a=t.clientX+12,o=t.clientY-40;a+160>window.innerWidth&&(a=t.clientX-170),o<0&&(o=t.clientY+12),n.style.left=a+"px",n.style.top=o+"px"}_hideTooltip(){const e=document.getElementById("hud-tooltip");e&&(e.style.display="none")}showInfo(e){const t=document.getElementById("hud-info");t&&(t.textContent=e,t.style.opacity="1",clearTimeout(this._infoTimeout),this._infoTimeout=setTimeout(()=>{t.style.opacity="0"},3e3))}_addStyles(){if(document.getElementById("hud-styles"))return;const e=document.createElement("style");e.id="hud-styles",e.textContent=`
      #hud {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none; z-index: 100;
        font-family: 'Press Start 2P', 'Segoe UI', monospace;
        image-rendering: pixelated;
      }
      #hud-stats-panel {
        position: absolute; top: 10px; left: 10px;
        display: flex; align-items: flex-start; gap: 6px;
        background: rgba(20, 15, 10, 0.75);
        border: 2px solid #8B6914;
        padding: 6px 10px;
        border-radius: 2px;
        box-shadow: 0 2px 0 #4a3608;
      }
      #hud-level-badge {
        color: #FFD700; font-size: 10px; font-weight: bold;
        min-width: 38px; text-align: center;
        padding-top: 4px;
        text-shadow: 1px 1px 0 #4a3608;
      }
      #hud-bars { display: flex; flex-direction: column; gap: 3px; }
      #hud-hp-container, #hud-xp-container {
        display: flex; align-items: center; gap: 5px;
      }
      #hud-hp-icon, #hud-xp-icon { font-size: 12px; }
      #hud-mute {
        position: absolute; top: 10px; right: 10px;
        font-size: 20px; cursor: pointer; pointer-events: auto;
        background: rgba(20, 15, 10, 0.7);
        border: 2px solid #8B6914;
        padding: 4px 8px; border-radius: 2px;
        box-shadow: 0 2px 0 #4a3608;
        user-select: none;
        transition: transform 0.1s;
      }
      #hud-mute:hover { transform: scale(1.1); }
      #hud-mute:active { transform: scale(0.95); }
      #hud-hp-bar-bg, #hud-xp-bar-bg {
        width: 120px; height: 10px;
        background: #2a1a0a; border-radius: 1px;
        overflow: hidden;
        border: 1px solid #5a4020;
      }
      #hud-hp-bar-fill {
        height: 100%; width: 100%; background: #5a9e3a;
        transition: width 0.3s ease;
        box-shadow: inset 0 -2px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15);
      }
      #hud-xp-bar-fill {
        height: 100%; width: 0%; background: #4a8acc;
        transition: width 0.4s ease;
        box-shadow: inset 0 -2px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15);
      }
      #hud-hp-text, #hud-xp-text {
        color: #e8d8b0; font-size: 7px;
        min-width: 45px; letter-spacing: 0.5px;
      }
      #hud-quest-tracker {
        position: absolute; top: 10px; right: 50px;
        background: rgba(20, 15, 10, 0.7);
        border: 2px solid #6a5020;
        padding: 5px 10px; border-radius: 2px;
        display: none; max-width: 200px;
      }
      .quest-title { color: #FFD700; font-size: 7px; margin-bottom: 3px; }
      .quest-desc { color: #b8a880; font-size: 6px; }
      #hud-levelup {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: center;
        pointer-events: none; z-index: 300;
        transition: opacity 0.5s ease;
      }
      #hud-levelup-text {
        text-align: center;
        background: rgba(20, 15, 10, 0.85);
        border: 3px solid #FFD700;
        padding: 20px 40px; border-radius: 4px;
        box-shadow: 0 0 30px rgba(255,215,0,0.3);
      }
      .levelup-title {
        color: #FFD700; font-size: 18px;
        text-shadow: 0 0 10px rgba(255,215,0,0.5);
        margin-bottom: 8px;
      }
      .levelup-level { color: #fff; font-size: 12px; margin-bottom: 8px; }
      .levelup-rewards { margin-top: 8px; }
      .levelup-reward { color: #8fd4a0; font-size: 8px; margin: 3px 0; }
      #hud-info {
        position: absolute; top: 70px; left: 50%; transform: translateX(-50%);
        color: #FFD700; font-size: 10px;
        text-shadow: 1px 1px 0 #4a3608, 2px 2px 4px rgba(0,0,0,0.8);
        opacity: 0; transition: opacity 0.5s ease;
        letter-spacing: 1px;
      }
      #hud-hotbar {
        position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
        display: flex; gap: 3px;
        background: rgba(20, 15, 10, 0.6);
        border: 2px solid #6a5020;
        padding: 4px;
        border-radius: 2px;
      }
      .hud-slot {
        width: 44px; height: 44px;
        background: rgba(40, 30, 15, 0.7);
        border: 2px solid #5a4520;
        border-radius: 1px;
        position: relative;
        pointer-events: auto; cursor: pointer;
      }
      .hud-slot-selected {
        border-color: #FFD700;
        background: rgba(255,215,0,0.12);
        box-shadow: 0 0 6px rgba(255,215,0,0.3);
      }
      .hud-slot-icon {
        position: absolute; top: 5px; left: 5px;
        width: 26px; height: 26px;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
      }
      .hud-slot-count {
        position: absolute; bottom: 1px; right: 3px;
        color: #fff; font-size: 7px;
        text-shadow: 1px 1px 0 #000;
      }
      .hud-slot-key {
        position: absolute; top: 1px; right: 3px;
        color: rgba(200,180,140,0.4); font-size: 7px;
      }
      #hud-tooltip {
        display: none;
        position: fixed;
        background: rgba(20, 15, 10, 0.95);
        border: 2px solid #8B6914;
        border-radius: 2px;
        padding: 8px 10px;
        z-index: 200;
        pointer-events: none;
        min-width: 100px;
        box-shadow: 0 2px 0 #4a3608;
      }
      .tooltip-header {
        display: flex; align-items: center; gap: 6px;
      }
      .tooltip-icon {
        width: 20px; height: 20px;
        image-rendering: pixelated;
      }
      .tooltip-name {
        color: #FFD700; font-size: 9px;
      }
      .tooltip-desc {
        color: #b8a880; font-size: 7px; margin-top: 4px;
      }
    `,document.head.appendChild(e)}dispose(){this.container.parentNode&&this.container.remove();const e=document.getElementById("hud-styles");e&&e.remove()}}const W0={slime_green:{name:"Schleim",spriteType:"slime",tint:null,hp:15,damage:2,speed:1.3,detectionRange:3.5,drops:[{itemId:"mushroom",chance:.6,min:1,max:2},{itemId:"berry",chance:.4,min:1,max:2}],xp:10},slime_red:{name:"Feuer-Schleim",spriteType:"slime",tint:[1.4,.5,.5],hp:25,damage:3,speed:1.6,detectionRange:4,drops:[{itemId:"meat",chance:.5,min:1,max:1},{itemId:"crystal",chance:.2,min:1,max:1}],xp:18},slime_blue:{name:"Eis-Schleim",spriteType:"slime",tint:[.5,.7,1.5],hp:20,damage:3,speed:1.5,detectionRange:4,drops:[{itemId:"berry",chance:.6,min:1,max:3},{itemId:"magic_herb",chance:.2,min:1,max:1}],xp:14},slime_purple:{name:"Gift-Schleim",spriteType:"slime",tint:[1,.4,1.3],hp:30,damage:4,speed:1.4,detectionRange:4,drops:[{itemId:"mushroom",chance:.7,min:1,max:3},{itemId:"magic_herb",chance:.3,min:1,max:1}],xp:22},skeleton_base:{name:"Skelett",spriteType:"skeleton",tint:null,hp:25,damage:4,speed:1.6,detectionRange:4,drops:[{itemId:"bone",chance:.8,min:1,max:3},{itemId:"stone",chance:.3,min:1,max:1}],xp:15},skeleton_warrior:{name:"Skelett-Krieger",spriteType:"skeleton",tint:[.9,.8,.7],hp:35,damage:5,speed:1.5,detectionRange:4,drops:[{itemId:"bone",chance:.9,min:2,max:4},{itemId:"iron_ore",chance:.3,min:1,max:2},{itemId:"sword_bone",chance:.1,min:1,max:1}],xp:30},skeleton_mage:{name:"Skelett-Magier",spriteType:"skeleton",tint:[.7,.8,1.2],hp:30,damage:4,speed:1.5,detectionRange:4,drops:[{itemId:"bone",chance:.6,min:1,max:2},{itemId:"crystal",chance:.4,min:1,max:2},{itemId:"magic_herb",chance:.15,min:1,max:1}],xp:25}};class X0{constructor(e,t){this.type=e.resourceType,this.x=e.x,this.y=e.y,this.scene=t;const n={tree:{hitsNeeded:1,loot:"wood",lootMin:2,lootMax:4,respawn:15,color:5913114},rock:{hitsNeeded:1,loot:"stone",lootMin:1,lootMax:3,respawn:20,color:7829367},ore:{hitsNeeded:2,loot:"iron_ore",lootMin:1,lootMax:2,respawn:30,color:9065779},mushroom:{hitsNeeded:1,loot:"mushroom",lootMin:1,lootMax:3,respawn:15,color:11171652},earth:{hitsNeeded:1,loot:"earth",lootMin:1,lootMax:2,respawn:15,color:5913114}},s=n[this.type]||n.rock;this.hitsNeeded=s.hitsNeeded,this.lootId=s.loot,this.lootMin=s.lootMin,this.lootMax=s.lootMax,this.respawnTime=s.respawn,this.currentHits=0,this.depleted=!1,this.respawnTimer=0,this.interactRange=2;const r=this.type==="mushroom"||this.type==="earth"?.6:1,a=new ut(r,r),o=new dt({color:s.color,transparent:!0,opacity:.8,depthWrite:!1});this.mesh=new qe(a,o),this.mesh.position.set(this.x+.5,-(this.y+.5),.11+this.y*.001),t.add(this.mesh),this.promptMesh=this._createPrompt(),this.promptMesh.visible=!1,t.add(this.promptMesh)}_createPrompt(){const e=document.createElement("canvas");e.width=64,e.height=32;const t=e.getContext("2d");t.fillStyle="rgba(0,0,0,0.6)",t.fillRect(0,0,64,32),t.fillStyle="#FFD700",t.font="bold 16px sans-serif",t.textAlign="center",t.textBaseline="middle",t.fillText("[E]",32,16);const n=new an(e);n.magFilter=vt;const s=new ut(1,.5),r=new dt({map:n,transparent:!0,depthWrite:!1}),a=new qe(s,r);return a.position.set(this.x+.5,-(this.y-.5),.5),a}update(e,t,n){if(this.depleted)return this.respawnTimer-=e,this.respawnTimer<=0&&(this.depleted=!1,this.currentHits=0,this.mesh.material.opacity=.8,this.mesh.visible=!0),this.promptMesh.visible=!1,null;const s=t.x-(this.x+.5),r=t.y-(this.y+.5),o=Math.sqrt(s*s+r*r)<this.interactRange;return this.promptMesh.visible=o,o&&n.justPressed("KeyE")?this.gather():null}gather(){var t,n;this.currentHits++;const e=(t=window.__game)==null?void 0:t.audio;if(e&&(this.type==="tree"?e.playChop():this.type==="ore"||this.type==="rock"?e.playMine():e.playChop()),this.mesh.material.opacity=.5+.3*Math.sin(this.currentHits*3),this.currentHits>=this.hitsNeeded){this.depleted=!0,this.respawnTimer=this.respawnTime,this.mesh.visible=!1,this.promptMesh.visible=!1;const s=this.lootMin+Math.floor(Math.random()*(this.lootMax-this.lootMin+1)),r=(n=window.__game)==null?void 0:n.progression;return r&&(r.addXp(5),r.reportCollect(this.lootId,s)),{itemId:this.lootId,count:s,x:this.x+.5,y:this.y+.5}}return null}dispose(){this.mesh.parent&&this.scene.remove(this.mesh),this.promptMesh.parent&&this.scene.remove(this.promptMesh),this.mesh.geometry.dispose(),this.mesh.material.dispose(),this.promptMesh.geometry.dispose(),this.promptMesh.material.map.dispose(),this.promptMesh.material.dispose()}}class q0{constructor(e){this.scene=e,this.nodes=[]}createFromProps(e){const t=e.filter(n=>n.type==="resource");for(const n of t)this.nodes.push(new X0(n,this.scene))}update(e,t,n,s){for(const r of this.nodes){const a=r.update(e,t,n);a&&s&&s.spawnDrop(a.itemId,a.count,a.x,a.y)}}dispose(){for(const e of this.nodes)e.dispose();this.nodes=[]}}class Y0{constructor(e,t,n){this.x=e,this.y=t,this.healed=!1,this.healRange=2,this.scene=n;const s=new ut(.8,.8);this.mat=new dt({color:8934707,transparent:!0,opacity:.9,depthWrite:!1}),this.mesh=new qe(s,this.mat),this.mesh.position.set(e+.5,-(t+.5),.11+t*.001),n.add(this.mesh),this.healEffect=null}update(e,t,n){if(this.healed)return!1;const s=t.x-(this.x+.5),r=t.y-(this.y+.5);return Math.sqrt(s*s+r*r)<this.healRange&&n.justPressed("KeyF")?(this.heal(),!0):(this.mesh.rotation.z=Math.sin(Date.now()*.002)*.1,!1)}heal(){this.healed=!0,this.mat.color.set(4500036),this._showHealEffect(),setTimeout(()=>{this.healEffect&&(this.scene.remove(this.healEffect),this.healEffect=null)},2e3)}_showHealEffect(){const e=new Eo(.2,.5,16),t=new dt({color:4513279,transparent:!0,opacity:.8,side:Cn,depthWrite:!1});this.healEffect=new qe(e,t),this.healEffect.position.set(this.x+.5,-(this.y+.5),.3),this.scene.add(this.healEffect);let n=0;const s=()=>{n+=.03,!(n>1||!this.healEffect)&&(this.healEffect.scale.set(1+n*3,1+n*3,1),t.opacity=.8*(1-n),requestAnimationFrame(s))};s()}dispose(){this.mesh.parent&&this.scene.remove(this.mesh),this.healEffect&&this.healEffect.parent&&this.scene.remove(this.healEffect),this.mesh.geometry.dispose(),this.mesh.material.dispose()}}class $0{constructor(e){this.scene=e,this.plants=[],this.totalHealed=0,this.unicornUnlocked=!1,this.onUnlock=null}createFromProps(e){const t=e.filter(n=>n.type==="wilted_plant");for(const n of t)this.plants.push(new Y0(n.x,n.y,this.scene))}update(e,t,n,s){var r,a;for(const o of this.plants)o.update(e,t,n)&&(this.totalHealed++,(r=window.__game)!=null&&r.audio&&window.__game.audio.playPlantHeal(),(a=window.__game)!=null&&a.progression&&(window.__game.progression.addXp(10),window.__game.progression.reportHeal()),s&&s.showInfo(`Pflanze geheilt! +10 XP (${this.totalHealed}/10)`),this.totalHealed>=10&&!this.unicornUnlocked&&(this.unicornUnlocked=!0,s&&s.showInfo("Die Magische Wiese ist freigeschaltet!"),this.onUnlock&&this.onUnlock()))}clearPlants(){for(const e of this.plants)e.dispose();this.plants=[]}dispose(){this.clearPlants()}}class K0 extends Sr{constructor(e,t){super(),this.x=e,this.y=t,this.state="grazing",this.alertTimer=0,this.petCooldown=0,this.hasPetted=!1,this._createSprite()}_createSprite(){const e=document.createElement("canvas");e.width=256,e.height=64;const t=e.getContext("2d"),n=(c,h,u)=>{t.fillStyle=u,t.fillRect(c,h,1,1)},s=(c,h,u,d,m)=>{t.fillStyle=m,t.fillRect(c,h,u,d)};for(let c=0;c<4;c++){const h=c*64,u=c%2;s(h+22,28+u,20,14,"#f8f0ff"),s(h+20,30+u,24,10,"#fff5ff"),s(h+21,29+u,22,12,"#fdf8ff"),s(h+20,38+u,24,2,"#e8daf0"),s(h+22,40+u,20,1,"#ddd0e8");const d=40+u;s(h+24,d,3,5,"#f0e5f5"),s(h+28,d,3,5+(c===1?1:0),"#f0e5f5"),s(h+33,d,3,5+(c===2?1:0),"#f0e5f5"),s(h+37,d,3,5,"#f0e5f5"),s(h+24,d+4,3,2,"#e0b0c0"),s(h+28,d+4+(c===1?1:0),3,2,"#e0b0c0"),s(h+33,d+4+(c===2?1:0),3,2,"#e0b0c0"),s(h+37,d+4,3,2,"#e0b0c0"),s(h+36,20+u,16,14,"#fff5ff"),s(h+35,22+u,18,10,"#fdf8ff"),s(h+37,19+u,14,16,"#fff5ff"),s(h+47,28+u,3,2,"#ffb8cc"),s(h+44,24+u,4,4,"#4a3060"),s(h+45,24+u,2,2,"#6a4590"),n(h+46,24+u,"#ffffff"),n(h+44,26+u,"#8060a0"),s(h+43,14+u,3,6,"#FFD700"),s(h+44,12+u-c%2,2,3,"#FFEA00"),n(h+44,11+u-c%2,"#FFF3A0"),n(h+43,16+u,"#E5B800"),n(h+43,18+u,"#E5B800");const m=["#FF6B8A","#FFB347","#FFE066","#7BC67E","#5B9BD5","#9B7ED8"];for(let x=0;x<6;x++){const f=h+36-x*1,p=21+u+x*2;s(f,p,3,3,m[x]),c>=2&&n(f-1,p+1,m[x])}for(let x=0;x<5;x++){const f=h+20-x*2-c%2,p=30+u+x*2;s(f,p,3,3,m[x]),(c===1||c===3)&&n(f-1,p+1,m[x])}const g=[[h+52,16],[h+16,22],[h+50,36],[h+14,38]];for(let x=0;x<g.length;x++)if((c+x)%3===0){const[f,p]=g[x];t.fillStyle="rgba(255, 255, 180, 0.7)",n(f,p+u,"rgba(255, 255, 180, 0.8)"),n(f+1,p+u,"rgba(255, 220, 100, 0.6)")}s(h+40,18+u,3,4,"#fff0ff"),n(h+41,19+u,"#ffc0dd")}const r=new an(e);r.magFilter=Pe,r.minFilter=Pe,r.generateMipmaps=!1,r.colorSpace=pt;const a=r.clone();a.needsUpdate=!0,a.magFilter=Pe,a.minFilter=Pe,a.repeat.set(.25,1),a.offset.set(0,0);const o=new ut(4,4),l=new dt({map:a,transparent:!0,alphaTest:.1,depthWrite:!1});this._unicornMesh=new qe(o,l),this._unicornTex=a,this._animFrame=0,this._animTimer=0}addToScene(e){this.scene=e,e.add(this._unicornMesh)}removeFromScene(){this.scene&&this.scene.remove(this._unicornMesh)}update(e,t){var r;if(!t)return;this._animTimer+=e*1e3,this._animTimer>250&&(this._animTimer=0,this._animFrame=(this._animFrame+1)%4,this._unicornTex.offset.x=this._animFrame*.25);const n=.2+this.y*.001;this._unicornMesh.position.set(this.x,-this.y,n);const s=ii(this.x,this.y,t.x,t.y);switch(this.state){case"grazing":if(this.x+=Math.sin(Date.now()*5e-4+this.y)*.3*e,this.y+=Math.cos(Date.now()*7e-4+this.x)*.2*e,s<5)if(t.state==="run"){const a=this.x-t.x,o=this.y-t.y,l=Math.sqrt(a*a+o*o);l>0&&(this.x+=a/l*3*e,this.y+=o/l*3*e),this.state="alert",this.alertTimer=3}else s<2.5&&(this.state="friendly",(r=window.__game)!=null&&r.audio&&window.__game.audio.playUnicornSparkle());break;case"alert":this.alertTimer-=e,this.alertTimer<=0&&(this.state="grazing");break;case"friendly":if(s>4){this.state="grazing";return}this.petCooldown-=e;break}}canPet(e){return this.state==="friendly"&&this.petCooldown<=0&&ii(this.x,this.y,e.x,e.y)<2.5}pet(e){var s,r;if(!this.canPet(e))return null;this.petCooldown=30,e.heal(e.maxHp),(s=window.__game)!=null&&s.audio&&window.__game.audio.playUnicornPet(),(r=window.__game)!=null&&r.progression&&(window.__game.progression.addXp(25),window.__game.progression.reportPet());const t=["unicorn_tear","rainbow_flower","magic_herb"];return{itemId:t[Math.floor(Math.random()*t.length)],count:1,x:this.x,y:this.y}}dispose(){this.removeFromScene(),this._unicornMesh.geometry.dispose(),this._unicornMesh.material.map.dispose(),this._unicornMesh.material.dispose()}}class j0{constructor(e){this.scene=e,this.effects=[]}swordSlash(e,t,n){const s=.4+t*.001,r=document.createElement("canvas");r.width=64,r.height=64;const a=r.getContext("2d");a.strokeStyle="#ffffff",a.lineWidth=4,a.shadowColor="#ffffaa",a.shadowBlur=6,a.beginPath(),a.arc(32,32,22,-Math.PI*.7,Math.PI*.7),a.stroke(),a.strokeStyle="rgba(255, 255, 220, 0.8)",a.lineWidth=2,a.shadowBlur=3,a.beginPath(),a.arc(32,32,20,-Math.PI*.6,Math.PI*.6),a.stroke(),a.strokeStyle="rgba(255, 255, 180, 0.3)",a.lineWidth=8,a.shadowBlur=0,a.beginPath(),a.arc(32,32,24,-Math.PI*.7,Math.PI*.7),a.stroke();const o=new an(r);o.magFilter=vt,o.minFilter=vt;const l={down:{ox:0,oy:1,rot:0,startRot:-.5},up:{ox:0,oy:-1,rot:Math.PI,startRot:.5},left:{ox:-1,oy:0,rot:Math.PI*.5,startRot:-.5},right:{ox:1,oy:0,rot:-Math.PI*.5,startRot:.5}},c=l[n]||l.down,h=2.8,u=new ut(h,h),d=new dt({map:o,transparent:!0,opacity:.95,depthWrite:!1,blending:ms}),m=new qe(u,d);m.position.set(e+c.ox,-(t+c.oy),s),m.rotation.z=c.rot+c.startRot,this.scene.add(m),this.effects.push({mesh:m,age:0,maxAge:.18,_targetRot:c.rot-c.startRot,_startRot:c.rot+c.startRot,update:(g,x)=>{x.age+=g;const f=x.age/x.maxAge;m.rotation.z=x._startRot+(x._targetRot-x._startRot)*f;const p=.6+f*.5;m.scale.set(p,p,1),d.opacity=f>.6?.95*(1-(f-.6)/.4):.95}});for(let g=0;g<6;g++){const x=g*.02,f=c.rot+(g/5-.5)*Math.PI*.8,p=1.2+Math.random()*.3,M=e+c.ox+Math.cos(f)*p*.5,T=t+c.oy+Math.sin(f)*p*.5,w=new ut(.15,.15),R=new dt({color:16777215,transparent:!0,opacity:.8,depthWrite:!1,blending:ms}),S=new qe(w,R);S.position.set(M,-T,s+.01),this.scene.add(S),this.effects.push({mesh:S,age:-x,maxAge:.2,update:(A,v)=>{if(v.age+=A,v.age<0){S.visible=!1;return}S.visible=!0;const b=v.age/v.maxAge;R.opacity=Math.max(0,.8*(1-b));const X=.5+b*1.5;S.scale.set(X,X,1)}})}}waterSpray(e,t,n){const s={down:[0,1.2],up:[0,-1.2],left:[-1.2,0],right:[1.2,0]},[r,a]=s[n]||s.down;for(let o=0;o<12;o++){const l=(Math.random()-.5)*1.5,c=2+Math.random()*3,h=e+r*.3,u=t+a*.3,d=.15+Math.random()*.15,m=new ut(d,d),g=.6+Math.random()*.4,x=new dt({color:new Ne(.3,.6+Math.random()*.3,g),transparent:!0,opacity:.8,depthWrite:!1}),f=new qe(m,x);f.position.set(h,-u,.35),this.scene.add(f);const p=r*c+l*(a===0?0:1),M=a*c+l*(r===0?0:1);this.effects.push({mesh:f,age:0,maxAge:.5+Math.random()*.3,update:(T,w)=>{w.age+=T,f.position.x+=p*T,f.position.y-=M*T,f.position.y-=.5*T,x.opacity=Math.max(0,.8*(1-w.age/w.maxAge)),f.scale.set(1-w.age*.5,1-w.age*.5,1)}})}}hitSparks(e,t){for(let n=0;n<8;n++){const s=Math.PI*2*n/8+Math.random()*.3,r=3+Math.random()*4,a=new ut(.2,.2),o=Math.random()>.4,l=new dt({color:o?16777215:16768324,transparent:!0,opacity:1,depthWrite:!1}),c=new qe(a,l);c.position.set(e,-t,.4),this.scene.add(c),this.effects.push({mesh:c,age:0,maxAge:.3,update:(h,u)=>{u.age+=h,c.position.x+=Math.cos(s)*r*h,c.position.y+=Math.sin(s)*r*h,l.opacity=Math.max(0,1-u.age/u.maxAge)}})}}healSparkles(e,t){for(let n=0;n<10;n++){const s=(Math.random()-.5)*1.5,r=new ut(.15,.15),a=.4+Math.random()*.5,o=new dt({color:new Ne(.2,a,.2+Math.random()*.3),transparent:!0,opacity:1,depthWrite:!1}),l=new qe(r,o);l.position.set(e+s,-t,.35),this.scene.add(l);const c=1.5+Math.random()*2;this.effects.push({mesh:l,age:0,maxAge:1+Math.random()*.5,update:(h,u)=>{u.age+=h,l.position.y+=c*h,l.position.x+=Math.sin(u.age*5)*.3*h,o.opacity=Math.max(0,1-u.age/u.maxAge)}})}}pickupGlow(e,t){const n=new ut(1,1),s=new dt({color:16768324,transparent:!0,opacity:.6,depthWrite:!1}),r=new qe(n,s);r.position.set(e,-t,.35),this.scene.add(r),this.effects.push({mesh:r,age:0,maxAge:.4,update:(a,o)=>{o.age+=a;const l=o.age/o.maxAge;r.scale.set(1+l*2,1+l*2,1),s.opacity=Math.max(0,.6*(1-l))}})}startAmbientParticles(e,t,n="pollen"){const s={pollen:{count:25,color:[255,255,200],size:.12,speed:.3,alpha:.4},firefly:{count:15,color:[200,255,100],size:.15,speed:.5,alpha:.6},dust:{count:20,color:[200,180,150],size:.1,speed:.15,alpha:.25},magic:{count:30,color:[255,220,255],size:.14,speed:.4,alpha:.5}},r=s[n]||s.pollen;for(let a=0;a<r.count;a++){const o=new ut(r.size,r.size),l=new dt({color:new Ne(r.color[0]/255,r.color[1]/255,r.color[2]/255),transparent:!0,opacity:r.alpha*(.5+Math.random()*.5),depthWrite:!1}),c=new qe(o,l),h=(Math.random()-.5)*20,u=(Math.random()-.5)*14;c.position.set(e+h,-(t+u),.35+Math.random()*.1),this.scene.add(c);const d=Math.random()*Math.PI*2,m=l.opacity;this.effects.push({mesh:c,age:0,maxAge:1/0,_phase:d,_baseX:c.position.x,_baseY:c.position.y,_speed:r.speed,_baseOp:m,update:(g,x)=>{x.age+=g,c.position.x=x._baseX+Math.sin(x.age*x._speed+x._phase)*1.5,c.position.y=x._baseY+Math.cos(x.age*x._speed*.7+x._phase)*1,l.opacity=x._baseOp*(.5+.5*Math.sin(x.age*2+x._phase))}})}}footDust(e,t){for(let n=0;n<3;n++){const s=new ut(.15,.15),r=new dt({color:12298888,transparent:!0,opacity:.3,depthWrite:!1}),a=new qe(s,r);a.position.set(e+(Math.random()-.5)*.5,-(t+.8),.15),this.scene.add(a),this.effects.push({mesh:a,age:0,maxAge:.4,update:(o,l)=>{l.age+=o,a.position.y+=.5*o,a.scale.set(1+l.age*2,1+l.age*2,1),r.opacity=Math.max(0,.3*(1-l.age/l.maxAge))}})}}update(e){for(let t=this.effects.length-1;t>=0;t--){const n=this.effects[t];n.update(e,n),n.age>=n.maxAge&&(this.scene.remove(n.mesh),n.mesh.geometry.dispose(),n.mesh.material.dispose(),this.effects.splice(t,1))}}clear(){for(const e of this.effects)this.scene.remove(e.mesh),e.mesh.geometry.dispose(),e.mesh.material.dispose();this.effects=[]}dispose(){this.clear()}}const hr={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class As{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Z0=new Ts(-1,1,1,-1,0,1);class Q0 extends on{constructor(){super(),this.setAttribute("position",new Ft([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ft([0,2,0,0,2,0],2))}}const J0=new Q0;class Lc{constructor(e){this._mesh=new qe(J0,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Z0)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class dr extends As{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Gt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=pr.clone(e.uniforms),this.material=new Gt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new Lc(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class Hl extends As{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}}class eg extends As{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class tg{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new Ue);this._width=n.width,this._height=n.height,t=new jt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:nn}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new dr(hr),this.copyPass.material.blending=Pn,this.timer=new pd}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let s=0,r=this.passes.length;s<r;s++){const a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),a.needsSwap){if(n){const o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}Hl!==void 0&&(a instanceof Hl?n=!0:a instanceof eg&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new Ue);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class ng extends As{constructor(e,t,n=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new Ne}render(e,t,n){const s=e.autoClear;e.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=s}}const ig={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Ne(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class ji extends As{constructor(e,t=1,n,s){super(),this.strength=t,this.radius=n,this.threshold=s,this.resolution=e!==void 0?new Ue(e.x,e.y):new Ue(256,256),this.clearColor=new Ne(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new jt(r,a,{type:nn}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){const u=new jt(r,a,{type:nn});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);const d=new jt(r,a,{type:nn});d.texture.name="UnrealBloomPass.v"+h,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),a=Math.round(a/2)}const o=ig;this.highPassUniforms=pr.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Gt({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new Ue(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new F(1,1,1),new F(1,1,1),new F(1,1,1),new F(1,1,1),new F(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=pr.clone(hr.uniforms),this.blendMaterial=new Gt({uniforms:this.copyUniforms,vertexShader:hr.vertexShader,fragmentShader:hr.fragmentShader,premultipliedAlpha:!0,blending:ms,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Ne,this._oldClearAlpha=1,this._basic=new dt,this._fsQuad=new Lc(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new Ue(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(e,t,n,s,r){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=n.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=ji.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=ji.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(n),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){const t=[],n=e/3;for(let s=0;s<e;s++)t.push(.39894*Math.exp(-.5*s*s/(n*n))/n);return new Gt({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new Ue(.5,.5)},direction:{value:new Ue(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new Gt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}ji.BlurDirectionX=new Ue(1,0);ji.BlurDirectionY=new Ue(0,1);const sg={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new Ue(1/1024,1/512)}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec2 resolution;
		varying vec2 vUv;

		#define EDGE_STEP_COUNT 6
		#define EDGE_GUESS 8.0
		#define EDGE_STEPS 1.0, 1.5, 2.0, 2.0, 2.0, 4.0
		const float edgeSteps[EDGE_STEP_COUNT] = float[EDGE_STEP_COUNT]( EDGE_STEPS );

		float _ContrastThreshold = 0.0312;
		float _RelativeThreshold = 0.063;
		float _SubpixelBlending = 1.0;

		vec4 Sample( sampler2D  tex2D, vec2 uv ) {

			return texture( tex2D, uv );

		}

		float SampleLuminance( sampler2D tex2D, vec2 uv ) {

			return dot( Sample( tex2D, uv ).rgb, vec3( 0.3, 0.59, 0.11 ) );

		}

		float SampleLuminance( sampler2D tex2D, vec2 texSize, vec2 uv, float uOffset, float vOffset ) {

			uv += texSize * vec2(uOffset, vOffset);
			return SampleLuminance(tex2D, uv);

		}

		struct LuminanceData {

			float m, n, e, s, w;
			float ne, nw, se, sw;
			float highest, lowest, contrast;

		};

		LuminanceData SampleLuminanceNeighborhood( sampler2D tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData l;
			l.m = SampleLuminance( tex2D, uv );
			l.n = SampleLuminance( tex2D, texSize, uv,  0.0,  1.0 );
			l.e = SampleLuminance( tex2D, texSize, uv,  1.0,  0.0 );
			l.s = SampleLuminance( tex2D, texSize, uv,  0.0, -1.0 );
			l.w = SampleLuminance( tex2D, texSize, uv, -1.0,  0.0 );

			l.ne = SampleLuminance( tex2D, texSize, uv,  1.0,  1.0 );
			l.nw = SampleLuminance( tex2D, texSize, uv, -1.0,  1.0 );
			l.se = SampleLuminance( tex2D, texSize, uv,  1.0, -1.0 );
			l.sw = SampleLuminance( tex2D, texSize, uv, -1.0, -1.0 );

			l.highest = max( max( max( max( l.n, l.e ), l.s ), l.w ), l.m );
			l.lowest = min( min( min( min( l.n, l.e ), l.s ), l.w ), l.m );
			l.contrast = l.highest - l.lowest;
			return l;

		}

		bool ShouldSkipPixel( LuminanceData l ) {

			float threshold = max( _ContrastThreshold, _RelativeThreshold * l.highest );
			return l.contrast < threshold;

		}

		float DeterminePixelBlendFactor( LuminanceData l ) {

			float f = 2.0 * ( l.n + l.e + l.s + l.w );
			f += l.ne + l.nw + l.se + l.sw;
			f *= 1.0 / 12.0;
			f = abs( f - l.m );
			f = clamp( f / l.contrast, 0.0, 1.0 );

			float blendFactor = smoothstep( 0.0, 1.0, f );
			return blendFactor * blendFactor * _SubpixelBlending;

		}

		struct EdgeData {

			bool isHorizontal;
			float pixelStep;
			float oppositeLuminance, gradient;

		};

		EdgeData DetermineEdge( vec2 texSize, LuminanceData l ) {

			EdgeData e;
			float horizontal =
				abs( l.n + l.s - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.se - 2.0 * l.e ) +
				abs( l.nw + l.sw - 2.0 * l.w );
			float vertical =
				abs( l.e + l.w - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.nw - 2.0 * l.n ) +
				abs( l.se + l.sw - 2.0 * l.s );
			e.isHorizontal = horizontal >= vertical;

			float pLuminance = e.isHorizontal ? l.n : l.e;
			float nLuminance = e.isHorizontal ? l.s : l.w;
			float pGradient = abs( pLuminance - l.m );
			float nGradient = abs( nLuminance - l.m );

			e.pixelStep = e.isHorizontal ? texSize.y : texSize.x;

			if (pGradient < nGradient) {

				e.pixelStep = -e.pixelStep;
				e.oppositeLuminance = nLuminance;
				e.gradient = nGradient;

			} else {

				e.oppositeLuminance = pLuminance;
				e.gradient = pGradient;

			}

			return e;

		}

		float DetermineEdgeBlendFactor( sampler2D  tex2D, vec2 texSize, LuminanceData l, EdgeData e, vec2 uv ) {

			vec2 uvEdge = uv;
			vec2 edgeStep;
			if (e.isHorizontal) {

				uvEdge.y += e.pixelStep * 0.5;
				edgeStep = vec2( texSize.x, 0.0 );

			} else {

				uvEdge.x += e.pixelStep * 0.5;
				edgeStep = vec2( 0.0, texSize.y );

			}

			float edgeLuminance = ( l.m + e.oppositeLuminance ) * 0.5;
			float gradientThreshold = e.gradient * 0.25;

			vec2 puv = uvEdge + edgeStep * edgeSteps[0];
			float pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
			bool pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !pAtEnd; i++ ) {

				puv += edgeStep * edgeSteps[i];
				pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
				pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			}

			if ( !pAtEnd ) {

				puv += edgeStep * EDGE_GUESS;

			}

			vec2 nuv = uvEdge - edgeStep * edgeSteps[0];
			float nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
			bool nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !nAtEnd; i++ ) {

				nuv -= edgeStep * edgeSteps[i];
				nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
				nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			}

			if ( !nAtEnd ) {

				nuv -= edgeStep * EDGE_GUESS;

			}

			float pDistance, nDistance;
			if ( e.isHorizontal ) {

				pDistance = puv.x - uv.x;
				nDistance = uv.x - nuv.x;

			} else {

				pDistance = puv.y - uv.y;
				nDistance = uv.y - nuv.y;

			}

			float shortestDistance;
			bool deltaSign;
			if ( pDistance <= nDistance ) {

				shortestDistance = pDistance;
				deltaSign = pLuminanceDelta >= 0.0;

			} else {

				shortestDistance = nDistance;
				deltaSign = nLuminanceDelta >= 0.0;

			}

			if ( deltaSign == ( l.m - edgeLuminance >= 0.0 ) ) {

				return 0.0;

			}

			return 0.5 - shortestDistance / ( pDistance + nDistance );

		}

		vec4 ApplyFXAA( sampler2D  tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData luminance = SampleLuminanceNeighborhood( tex2D, texSize, uv );
			if ( ShouldSkipPixel( luminance ) ) {

				return Sample( tex2D, uv );

			}

			float pixelBlend = DeterminePixelBlendFactor( luminance );
			EdgeData edge = DetermineEdge( texSize, luminance );
			float edgeBlend = DetermineEdgeBlendFactor( tex2D, texSize, luminance, edge, uv );
			float finalBlend = max( pixelBlend, edgeBlend );

			if (edge.isHorizontal) {

				uv.y += edge.pixelStep * finalBlend;

			} else {

				uv.x += edge.pixelStep * finalBlend;

			}

			return Sample( tex2D, uv );

		}

		void main() {

			gl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv );

		}`},rg={uniforms:{tDiffuse:{value:null},offset:{value:1.2},darkness:{value:.3}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - 0.5) * 2.0;
      float vig = clamp(1.0 - dot(uv, uv) * darkness, 0.0, 1.0);
      vig = mix(1.0 - darkness * 0.5, 1.0, vig);
      texel.rgb *= vig;
      gl_FragColor = texel;
    }
  `},ag={uniforms:{tDiffuse:{value:null},tintColor:{value:new F(1,1,1)},tintStrength:{value:.15},brightness:{value:1},contrast:{value:1.05},saturation:{value:1.1}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform vec3 tintColor;
    uniform float tintStrength;
    uniform float brightness;
    uniform float contrast;
    uniform float saturation;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;

      // Brightness
      color *= brightness;

      // Contrast
      color = (color - 0.5) * contrast + 0.5;

      // Saturation
      float luma = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(vec3(luma), color, saturation);

      // Tint
      color = mix(color, color * tintColor, tintStrength);

      gl_FragColor = vec4(clamp(color, 0.0, 1.0), texel.a);
    }
  `};class og{constructor(e,t,n){this.composer=new tg(e);const s=new ng(t,n);this.composer.addPass(s),this.bloomPass=new ji(new Ue(window.innerWidth,window.innerHeight),.6,.5,.75),this.composer.addPass(this.bloomPass),this.colorGradePass=new dr(ag),this.composer.addPass(this.colorGradePass),this.vignettePass=new dr(rg),this.composer.addPass(this.vignettePass),this.fxaaPass=new dr(sg);const r=e.getPixelRatio();this.fxaaPass.material.uniforms.resolution.value.set(1/(window.innerWidth*r),1/(window.innerHeight*r)),this.composer.addPass(this.fxaaPass),this._onResize(e),window.addEventListener("resize",()=>this._onResize(e))}setSceneMood(e){const t={hub:{tint:[1.05,1,.92],tintStrength:.08,brightness:1.1,contrast:1.05,saturation:1.15,bloomStrength:.3},forest:{tint:[.9,1,.9],tintStrength:.12,brightness:1.05,contrast:1.08,saturation:1.2,bloomStrength:.25},dungeon:{tint:[.85,.8,1],tintStrength:.2,brightness:1,contrast:1.1,saturation:.95,bloomStrength:.7},lake:{tint:[.92,.97,1.08],tintStrength:.1,brightness:1.1,contrast:1,saturation:1.12,bloomStrength:.35},unicorn_meadow:{tint:[1.08,1.03,.92],tintStrength:.15,brightness:1.15,contrast:1,saturation:1.25,bloomStrength:.6}},n=t[e]||t.hub,s=this.colorGradePass.uniforms;s.tintColor.value.set(n.tint[0],n.tint[1],n.tint[2]),s.tintStrength.value=n.tintStrength,s.brightness.value=n.brightness,s.contrast.value=n.contrast,s.saturation.value=n.saturation,this.bloomPass.strength=n.bloomStrength}render(){this.composer.render()}_onResize(e){const t=window.innerWidth,n=window.innerHeight,s=e.getPixelRatio();this.composer.setSize(t,n),this.fxaaPass.material.uniforms.resolution.value.set(1/(t*s),1/(n*s)),this.bloomPass.resolution.set(t,n)}dispose(){}}class lg{constructor(){this.shakeIntensity=0,this.shakeDuration=0,this.shakeTimer=0,this.shakeOffsetX=0,this.shakeOffsetY=0,this.shakeDecay=.9,this.hitstopTimer=0,this.hitstopActive=!1,this.flashOverlay=null,this.flashTimer=0,this.flashDuration=0,this.flashColor="rgba(255, 0, 0, 0.3)",this._createFlashOverlay(),this.punchX=0,this.punchY=0,this.punchDecay=.85,this.bounceTargets=[],this._sineTable=new Float32Array(64);for(let e=0;e<64;e++)this._sineTable[e]=Math.sin(e*.49);this._shakeIndex=0}shake(e=.3,t=.2){this.shakeIntensity=Math.max(this.shakeIntensity,e),this.shakeDuration=Math.max(this.shakeDuration,t),this.shakeTimer=this.shakeDuration}shakeLight(){this.shake(.15,.12)}shakeMedium(){this.shake(.3,.2)}shakeHeavy(){this.shake(.6,.35)}hitstop(e=.06){this.hitstopTimer=e,this.hitstopActive=!0}get isFrozen(){return this.hitstopActive}flash(e="rgba(255, 50, 50, 0.35)",t=.15){this.flashColor=e,this.flashDuration=t,this.flashTimer=t,this.flashOverlay&&(this.flashOverlay.style.background=e,this.flashOverlay.style.opacity="1",this.flashOverlay.style.display="block")}damageFlash(){this.flash("rgba(255, 30, 30, 0.3)",.18),this.shakeLight()}whiteFlash(){this.flash("rgba(255, 255, 255, 0.5)",.1)}healFlash(){this.flash("rgba(50, 255, 100, 0.2)",.3)}punch(e,t,n=.5){this.punchX+=e*n,this.punchY+=t*n}scaleBounce(e,t=1.4,n=.25){e&&this.bounceTargets.push({mesh:e,timer:0,duration:n,baseScaleX:e.scale.x,baseScaleY:e.scale.y,scaleTo:t})}update(e,t){if(this.hitstopActive&&(this.hitstopTimer-=e,this.hitstopTimer<=0&&(this.hitstopActive=!1,this.hitstopTimer=0)),this.shakeTimer>0){this.shakeTimer-=e;const n=this.shakeTimer/this.shakeDuration,s=n*n;this._shakeIndex=(this._shakeIndex+3)%64;const r=this._sineTable[this._shakeIndex];this._shakeIndex=(this._shakeIndex+7)%64;const a=this._sineTable[this._shakeIndex];this.shakeOffsetX=r*this.shakeIntensity*s,this.shakeOffsetY=a*this.shakeIntensity*s,this.shakeTimer<=0&&(this.shakeIntensity=0,this.shakeOffsetX=0,this.shakeOffsetY=0)}if(this.punchX*=this.punchDecay,this.punchY*=this.punchDecay,Math.abs(this.punchX)<.001&&(this.punchX=0),Math.abs(this.punchY)<.001&&(this.punchY=0),t&&(t.position.x+=this.shakeOffsetX+this.punchX,t.position.y+=this.shakeOffsetY+this.punchY),this.flashTimer>0){this.flashTimer-=e;const n=Math.max(0,this.flashTimer/this.flashDuration);this.flashOverlay&&(this.flashOverlay.style.opacity=n.toString()),this.flashTimer<=0&&this.flashOverlay&&(this.flashOverlay.style.display="none")}for(let n=this.bounceTargets.length-1;n>=0;n--){const s=this.bounceTargets[n];s.timer+=e;const r=s.timer/s.duration;if(r>=1)s.mesh.scale.x=s.baseScaleX,s.mesh.scale.y=s.baseScaleY,this.bounceTargets.splice(n,1);else{const a=Math.sin(r*Math.PI)*(1-r),o=1+(s.scaleTo-1)*a;s.mesh.scale.x=s.baseScaleX*o,s.mesh.scale.y=s.baseScaleY*o}}}_createFlashOverlay(){this.flashOverlay=document.createElement("div"),this.flashOverlay.id="juice-flash",this.flashOverlay.style.cssText=`
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 150;
      display: none; opacity: 0;
      transition: none;
    `,document.body.appendChild(this.flashOverlay)}dispose(){this.flashOverlay&&this.flashOverlay.parentNode&&this.flashOverlay.remove(),this.bounceTargets=[]}}function cg(i,e,t=1.5,n=.15){const s=i.x-e.x,r=i.y-e.y,a=Math.sqrt(s*s+r*r);if(a===0)return;const o=s/a,l=r/a;i._knockbackVX=o*t/n,i._knockbackVY=l*t/n,i._knockbackTimer=n}function hg(i,e){if(!i._knockbackTimer||i._knockbackTimer<=0)return;i._knockbackTimer-=e;const t=Math.max(0,i._knockbackTimer);i.x+=i._knockbackVX*e*(t/.15),i.y+=i._knockbackVY*e*(t/.15),i._knockbackTimer<=0&&(i._knockbackVX=0,i._knockbackVY=0)}class dg{constructor(){this.container=document.createElement("div"),this.container.id="dialog-container",this.container.innerHTML=`
      <div id="dialog-bubble">
        <div id="dialog-name"></div>
        <div id="dialog-text"></div>
        <div id="dialog-hint">Klick zum Weiter / Schliessen</div>
      </div>
    `,this.container.style.display="none",document.body.appendChild(this.container),this._addStyles(),this.isOpen=!1,this.onClose=null,this._typewriteId=0,this._typewriting=!1,this.container.addEventListener("click",()=>{if(!(!this.isOpen||!this.onAdvance)){if(this._typewriting&&this._pendingText){this._typewriteId++,this._typewriting=!1;const e=document.getElementById("dialog-text");e&&(e.textContent=this._pendingText);return}this.onAdvance()}})}show(e,t,n){var a;this.isOpen=!0,this.container.style.display="flex",(a=window.__game)!=null&&a.audio&&window.__game.audio.playDialogOpen();const s=document.getElementById("dialog-name"),r=document.getElementById("dialog-text");s&&(s.textContent=e,s.style.color=n||"#FFD700"),r&&(r.textContent="",this._typewriteId++,this._pendingText=t,this._typewriting=!0,this._typewrite(r,t,0,this._typewriteId))}_typewrite(e,t,n,s){var r;s!==this._typewriteId||!this.isOpen||(n<t.length?(e.textContent+=t[n],n%3===0&&t[n]!==" "&&((r=window.__game)!=null&&r.audio)&&window.__game.audio.playTypeTick(),setTimeout(()=>this._typewrite(e,t,n+1,s),25)):this._typewriting=!1)}hide(){var e;this.isOpen=!1,this.container.style.display="none",(e=window.__game)!=null&&e.audio&&window.__game.audio.playDialogClose(),this.onClose&&this.onClose()}_addStyles(){if(document.getElementById("dialog-styles"))return;const e=document.createElement("style");e.id="dialog-styles",e.textContent=`
      #dialog-container {
        position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
        z-index: 200; pointer-events: auto; cursor: pointer;
        display: flex; justify-content: center;
      }
      #dialog-bubble {
        background: rgba(10, 10, 30, 0.9);
        border: 2px solid rgba(255, 215, 0, 0.5);
        border-radius: 16px;
        padding: 16px 24px;
        max-width: 500px; min-width: 300px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        font-family: 'Segoe UI', sans-serif;
      }
      #dialog-name {
        font-size: 16px; font-weight: bold;
        margin-bottom: 8px;
        color: #FFD700;
      }
      #dialog-text {
        font-size: 15px; color: #fff;
        line-height: 1.5;
        min-height: 40px;
      }
      #dialog-hint {
        font-size: 11px; color: rgba(255,255,255,0.35);
        text-align: right; margin-top: 8px;
      }
    `,document.head.appendChild(e)}dispose(){this.container.parentNode&&this.container.remove();const e=document.getElementById("dialog-styles");e&&e.remove()}}const ug={mama_tanja:"cooking",papa_milos:"workbench",opa:"sawmill",deda:"alchemy",baba:null};class fg{constructor(){this.ui=new dg,this.activeNPC=null,this.dialogIndex=0,this.interactRange=3.5,this.cooldown=0,this.onDialogEnd=null,this.ui.onAdvance=()=>this._advance()}update(e,t,n,s){if(this.cooldown>0&&(this.cooldown-=e),this.ui.isOpen||this.cooldown>0)return;let r=null,a=1/0;for(const o of n){const l=ii(t.x,t.y,o.x,o.y);l<this.interactRange&&l<a&&(r=o,a=l)}r&&s.justPressed("KeyE")&&this._startDialog(r)}_startDialog(e){var n;this.activeNPC=e,this.dialogIndex=0,(n=window.__game)!=null&&n.progression&&e._characterId&&window.__game.progression.reportTalk(e._characterId);const t=e._dialogs||["..."];t.length!==0&&this._showLine(e,t[0])}_advance(){if(!this.activeNPC)return;const e=this.activeNPC._dialogs||[];if(this.dialogIndex++,this.dialogIndex<e.length)this._showLine(this.activeNPC,e[this.dialogIndex]);else{const t=this.activeNPC._characterId,n=ug[t];this.ui.hide(),this.activeNPC,this.activeNPC=null,this.cooldown=.3,n&&this.onDialogEnd&&setTimeout(()=>{this.onDialogEnd(t,n)},200)}}_showLine(e,t){const n=e._labelColor?"#"+e._labelColor.toString(16).padStart(6,"0"):"#FFD700";this.ui.show(e.name,t,n)}get isActive(){return this.ui.isOpen}dispose(){this.ui.dispose()}}class pg{constructor(){this.container=document.createElement("div"),this.container.id="crafting-container",this.container.style.display="none",this.container.innerHTML=`
      <div id="crafting-panel">
        <div id="crafting-header">
          <span id="crafting-title">Werkbank</span>
          <button id="crafting-close">✕</button>
        </div>
        <div id="crafting-recipes"></div>
      </div>
    `,document.body.appendChild(this.container),this._addStyles(),this.isOpen=!1,this.currentStation=null,this.inventory=null,this.onCraft=null,document.getElementById("crafting-close").addEventListener("click",()=>this.hide()),this.container.addEventListener("click",e=>{e.target===this.container&&this.hide()})}show(e,t,n,s){this.isOpen=!0,this.currentStation=e,this.inventory=s,this.container.style.display="flex",document.getElementById("crafting-title").textContent=t,this._renderRecipes(n,s)}hide(){this.isOpen=!1,this.container.style.display="none",this.currentStation=null}_renderRecipes(e,t){const n=document.getElementById("crafting-recipes");if(n.innerHTML="",e.length===0){n.innerHTML='<div class="craft-empty">Keine Rezepte verfuegbar</div>';return}for(const s of e){const r=s.ingredients.every(o=>t.hasItem(o.itemId,o.count));Ki(s.result.itemId);const a=document.createElement("div");a.className="craft-recipe"+(r?"":" craft-disabled"),a.innerHTML=`
        <div class="craft-result">
          <img class="craft-icon" src="${_r(s.result.itemId)}" draggable="false">
          <div class="craft-result-info">
            <div class="craft-result-name">${s.name}</div>
            <div class="craft-result-count">×${s.result.count}</div>
          </div>
        </div>
        <div class="craft-ingredients">
          ${s.ingredients.map(o=>{const l=Ki(o.itemId),c=t.countItem(o.itemId);return`<span class="craft-ing ${c>=o.count?"":"craft-ing-missing"}">
              <img class="craft-ing-icon" src="${_r(o.itemId)}" draggable="false">
              ${(l==null?void 0:l.name)||o.itemId} ${c}/${o.count}
            </span>`}).join("")}
        </div>
        <button class="craft-btn" ${r?"":"disabled"}>Herstellen</button>
      `,r&&a.querySelector(".craft-btn").addEventListener("click",()=>{this.onCraft&&this.onCraft(s),this._renderRecipes(e,t)}),n.appendChild(a)}}_addStyles(){if(document.getElementById("crafting-styles"))return;const e=document.createElement("style");e.id="crafting-styles",e.textContent=`
      #crafting-container {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
        z-index: 300; pointer-events: auto;
      }
      #crafting-panel {
        background: rgba(15, 15, 35, 0.95);
        border: 2px solid rgba(255,215,0,0.4);
        border-radius: 16px;
        padding: 20px;
        min-width: 360px; max-width: 450px;
        max-height: 80vh; overflow-y: auto;
        font-family: 'Segoe UI', sans-serif;
      }
      #crafting-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 16px; padding-bottom: 8px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      #crafting-title { color: #FFD700; font-size: 20px; font-weight: bold; }
      #crafting-close {
        background: none; border: none; color: #888; font-size: 20px;
        cursor: pointer; padding: 4px 8px;
      }
      #crafting-close:hover { color: #fff; }
      .craft-recipe {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        padding: 12px; margin-bottom: 8px;
        display: flex; flex-direction: column; gap: 8px;
      }
      .craft-disabled { opacity: 0.5; }
      .craft-result { display: flex; align-items: center; gap: 10px; }
      .craft-icon { width: 32px; height: 32px; border-radius: 6px; image-rendering: pixelated; }
      .craft-result-name { color: #fff; font-weight: bold; font-size: 15px; }
      .craft-result-count { color: #aaa; font-size: 12px; }
      .craft-ingredients { display: flex; flex-wrap: wrap; gap: 6px; }
      .craft-ing {
        color: #aaa; font-size: 12px;
        display: flex; align-items: center; gap: 4px;
        background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;
      }
      .craft-ing-missing { color: #ff6666; }
      .craft-ing-icon { width: 16px; height: 16px; image-rendering: pixelated; vertical-align: middle; }
      .craft-ing-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
      .craft-btn {
        background: #2a6a2a; color: #fff; border: none; border-radius: 8px;
        padding: 8px 16px; font-size: 14px; font-weight: bold;
        cursor: pointer; align-self: flex-end;
      }
      .craft-btn:hover:not(:disabled) { background: #3a8a3a; }
      .craft-btn:disabled { background: #333; color: #666; cursor: not-allowed; }
      .craft-empty { color: #888; text-align: center; padding: 20px; }
    `,document.head.appendChild(e)}dispose(){this.container.parentNode&&this.container.remove();const e=document.getElementById("crafting-styles");e&&e.remove()}}const mg={workbench:[{id:"r_sword_wood",name:"Holzschwert",ingredients:[{itemId:"wood",count:3}],result:{itemId:"sword_wood",count:1}},{id:"r_sword_stone",name:"Steinschwert",ingredients:[{itemId:"stone",count:3},{itemId:"wood",count:1}],result:{itemId:"sword_stone",count:1}}],anvil:[{id:"r_sword_bone",name:"Knochenkeule",ingredients:[{itemId:"bone",count:5}],result:{itemId:"sword_bone",count:1}}],cooking:[{id:"r_cooked_fish",name:"Gebratener Fisch",ingredients:[{itemId:"fish",count:1}],result:{itemId:"cooked_fish",count:1}},{id:"r_cooked_meat",name:"Bratfleisch",ingredients:[{itemId:"meat",count:1}],result:{itemId:"cooked_meat",count:1}},{id:"r_veggie_soup",name:"Gemuesesuppe",ingredients:[{itemId:"vegetable",count:2}],result:{itemId:"veggie_soup",count:1}}],alchemy:[{id:"r_heal_potion",name:"Heiltrank",ingredients:[{itemId:"mushroom",count:2},{itemId:"magic_herb",count:1}],result:{itemId:"heal_potion",count:1}},{id:"r_unicorn_potion",name:"Einhorntraene-Trank",ingredients:[{itemId:"unicorn_tear",count:1},{itemId:"crystal",count:2}],result:{itemId:"heal_potion",count:3}}],sawmill:[{id:"r_planks",name:"Bretter",ingredients:[{itemId:"wood",count:2}],result:{itemId:"wood",count:4}}]};function gg(i){return mg[i]||[]}const _g={cooking:"Mama Tanjas Kueche",workbench:"Papa Milos' Werkbank",anvil:"Amboss",sawmill:"Opas Saege",alchemy:"Dedas Alchemie"};class xg{constructor(e,t){this.ui=new pg,this.inventory=e,this.hud=t,this.interactRange=4,this.cooldown=0,this.ui.onCraft=n=>this._doCraft(n)}update(e,t,n,s){if(this.cooldown>0&&(this.cooldown-=e),this.ui.isOpen||this.cooldown>0||!n||!n.props)return;const r=n.props.filter(o=>o.type==="station");let a=null;for(const o of r){const l=o.x+(o.w||1)/2,c=o.y+(o.h||1)/2;if(ii(t.x,t.y,l,c)<this.interactRange){a=o;break}}a&&s.justPressed("KeyE")&&(this._openStation(a.station),this.cooldown=.5)}openStation(e){const t=gg(e),n=_g[e]||e;this.ui.show(e,n,t,this.inventory)}_openStation(e){this.openStation(e)}_doCraft(e){var n,s;for(const r of e.ingredients)if(!this.inventory.removeItem(r.itemId,r.count))return;this.inventory.addItem(e.result.itemId,e.result.count)>0?this.hud.showInfo("Inventar voll!"):(this.hud.showInfo(`${e.name} hergestellt! +5 XP`),(n=window.__game)!=null&&n.audio&&window.__game.audio.playCraftSuccess(),(s=window.__game)!=null&&s.progression&&(window.__game.progression.addXp(5),window.__game.progression.reportCraft()))}get isActive(){return this.ui.isOpen}dispose(){this.ui.dispose()}}const tr="emilia_pixel_adventure_save";class vg{constructor(){this.autoSaveInterval=60,this.autoSaveTimer=this.autoSaveInterval}save(e){const t={version:2,timestamp:Date.now(),player:{hp:e.playerHp,scene:e.currentScene,x:e.playerX,y:e.playerY},inventory:e.inventorySlots,plantsHealed:e.plantsHealed,unicornUnlocked:e.unicornUnlocked,progression:e.progression};try{return localStorage.setItem(tr,JSON.stringify(t)),!0}catch(n){return console.warn("Save failed:",n),!1}}load(){try{const e=localStorage.getItem(tr);if(!e)return null;const t=JSON.parse(e);return t.version!==1&&t.version!==2?null:t}catch(e){return console.warn("Load failed:",e),null}}hasSave(){return!!localStorage.getItem(tr)}deleteSave(){localStorage.removeItem(tr)}update(e,t){this.autoSaveTimer-=e,this.autoSaveTimer<=0&&(this.autoSaveTimer=this.autoSaveInterval,this.save(t()))}}class yg{constructor(){this.container=document.createElement("div"),this.container.id="main-menu",this.container.innerHTML=`
      <div class="mm-content">
        <div class="mm-unicorn">🦄</div>
        <h1 class="mm-title">Emilia's Pixel Adventure</h1>
        <p class="mm-subtitle">Ein magisches Abenteuer</p>
        <div class="mm-buttons">
          <button id="mm-start" class="mm-btn mm-btn-primary">Neues Spiel</button>
          <button id="mm-continue" class="mm-btn mm-btn-secondary" style="display:none">Weiterspielen</button>
        </div>
        <div class="mm-controls">
          <p>WASD — Laufen &nbsp;|&nbsp; Shift — Rennen</p>
          <p>Leertaste — Angreifen &nbsp;|&nbsp; E — Interagieren</p>
          <p>F — Wasser-Magie &nbsp;|&nbsp; 1-8 — Hotbar</p>
        </div>
      </div>
    `,document.body.appendChild(this.container),this._addStyles()}show(e){this.container.style.display="flex";const t=document.getElementById("mm-continue");t&&(t.style.display=e?"block":"none")}hide(){this.container.style.opacity="0",setTimeout(()=>{this.container.style.display="none"},500)}onStart(e){document.getElementById("mm-start").addEventListener("click",e)}onContinue(e){document.getElementById("mm-continue").addEventListener("click",e)}_addStyles(){if(document.getElementById("mm-styles"))return;const e=document.createElement("style");e.id="mm-styles",e.textContent=`
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      #main-menu {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: linear-gradient(180deg, #1a3520 0%, #2d5a27 40%, #3a6b30 70%, #2a4820 100%);
        display: flex; align-items: center; justify-content: center;
        z-index: 1000;
        transition: opacity 0.5s ease;
        font-family: 'Press Start 2P', 'Segoe UI', monospace;
        image-rendering: pixelated;
      }
      .mm-content {
        text-align: center;
        background: rgba(0, 0, 0, 0.4);
        border: 4px solid #8B6914;
        border-radius: 4px;
        padding: 40px 60px;
        box-shadow: 0 0 0 2px #4a3608, 0 8px 32px rgba(0,0,0,0.5), inset 0 0 40px rgba(139,105,20,0.1);
      }
      .mm-unicorn {
        font-size: 56px; margin-bottom: 8px;
        animation: mm-float 3s ease-in-out infinite;
        filter: drop-shadow(0 4px 8px rgba(255,215,0,0.3));
      }
      @keyframes mm-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .mm-title {
        color: #FFD700; font-size: 22px; margin: 0;
        text-shadow: 2px 2px 0px #8B6914, 0 0 20px rgba(255,215,0,0.3);
        letter-spacing: 1px;
        line-height: 1.4;
      }
      .mm-subtitle {
        color: #b8d4a0; font-size: 10px;
        margin: 12px 0 28px;
        letter-spacing: 1px;
      }
      .mm-buttons { display: flex; flex-direction: column; gap: 12px; align-items: center; }
      .mm-btn {
        padding: 12px 32px; font-size: 12px; font-weight: bold;
        border: 3px solid; border-radius: 2px; cursor: pointer;
        transition: transform 0.1s, background 0.15s;
        min-width: 220px;
        font-family: 'Press Start 2P', monospace;
        image-rendering: pixelated;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .mm-btn:hover { transform: scale(1.03); filter: brightness(1.15); }
      .mm-btn:active { transform: scale(0.97); }
      .mm-btn-primary {
        background: #4a8c3f; color: #fff;
        border-color: #6ab85a #2d5a22 #2d5a22 #6ab85a;
        box-shadow: 0 3px 0 #1a3a14, 0 4px 12px rgba(0,0,0,0.3);
      }
      .mm-btn-secondary {
        background: #5a6aaa; color: #fff;
        border-color: #7a8acc #3a4a7a #3a4a7a #7a8acc;
        box-shadow: 0 3px 0 #2a3a6a, 0 4px 12px rgba(0,0,0,0.3);
      }
      .mm-controls {
        margin-top: 28px; color: rgba(180,210,160,0.5); font-size: 7px;
        line-height: 2.2; letter-spacing: 0.5px;
      }
    `,document.head.appendChild(e)}dispose(){this.container.parentNode&&this.container.remove();const e=document.getElementById("mm-styles");e&&e.remove()}}const Sg=[{id:"mama_tanja",name:"Mama Tanja",role:"Koechin",hairStyle:"medium",hairColor:5911840,clothingColor:16746666,x:8,y:8,direction:"down",dialogs:["Hallo mein Schatz! Hast du Hunger? Bring mir Fisch und ich koche dir etwas Leckeres!","Pass auf dich auf da draussen, Emilia! Und vergiss nicht zu essen!","Du bist die beste kleine Abenteurerin der Welt!"]},{id:"papa_milos",name:"Papa Milos",role:"Baumeister",hairStyle:"short",hairColor:1710618,clothingColor:4487116,x:30,y:8,direction:"down",dialogs:["Hey mala moja! Schau mal was ich gebaut habe! Soll ich dir auch was bauen?","Im Wald gibt es tolle Sachen zu entdecken — aber nimm dein Schwert mit!","Bring mir Holz und Steine, dann bauen wir zusammen etwas Tolles!"]},{id:"marie",name:"Marie",role:"Abenteurerin",hairStyle:"medium",hairColor:13934640,clothingColor:16768341,x:20,y:4,direction:"down",dialogs:["Emilia! Komm, lass uns den Wald erkunden! Ich hab was Tolles gefunden!","Psst! Ich glaub ich hab hinter dem grossen Baum etwas Magisches gesehen...","Hast du schon die leuchtenden Pilze in der Hoehle gesehen? Die sind so cool!"]},{id:"liam",name:"Liam",role:"Angler",hairStyle:"short",hairColor:4861984,clothingColor:5614182,x:20,y:28,direction:"up",dialogs:["Hey Emilia! Die Fische beissen heute besonders gut!","Wenn du eine Angel brauchst — dein Papa kann dir eine bauen!","Ich hab gehoert, dass im Wasser manchmal ein Einhorn trinken kommt..."]},{id:"oma",name:"Oma",role:"Gaertnerin",hairStyle:"bun",hairColor:12630192,clothingColor:11171788,x:8,y:22,direction:"down",dialogs:["Emilia, mein Sonnenschein! Schau mal, die Tomaten sind fast reif!","Vergiss nicht die Blumen zu giessen — sie brauchen dein magisches Wasser!","Wenn du Erde aus dem Wald holst, koennen wir ein neues Beet anlegen!"]},{id:"opa",name:"Opa",role:"Holzarbeiter",hairStyle:"short",hairColor:10064016,clothingColor:10057540,x:30,y:21,direction:"down",dialogs:["Na, meine Kleine! Holz ist das wichtigste Material — damit fing alles an!","Frueher hab ich ganz alleine dieses Dorf aus Holz gebaut, weisst du?","Bring mir Holz und ich saege dir die schoensten Bretter!"]},{id:"baba",name:"Baba",role:"Lagerfeuer",hairStyle:"bun",hairColor:9062960,clothingColor:13391172,x:18,y:16,direction:"side",dialogs:["Dobar dan, Emilia! Dodji ovamo, sedi pored vatre!","Baba hat Fleisch ueber dem Feuer — soll ich dir was braten, zlato moje?","Weisst du, frueher in Serbien hatten wir auch einen magischen Wald..."]},{id:"deda",name:"Deda",role:"Geschichtenerzaehler",hairStyle:"short",hairColor:7368808,clothingColor:4478344,x:32,y:11,direction:"side",dialogs:["Ah, Emilia! Mein Deda hat mir Geschichten von magischen Einhoernern erzaehlt...","Diese Pilze hier — die leuchten im Dunkeln! Damit machen wir einen Zaubertrank!","Donesi mi kristale iz pecine — pokazacu ti pravu magiju!"]}],Mg={0:{x:0,y:0},1:{x:1,y:0},2:{x:2,y:0},3:{x:3,y:0},4:{x:0,y:3},5:{x:1,y:3},6:{x:0,y:6},7:{x:1,y:6},8:{x:4,y:0},9:{x:0,y:9}},bg={oak_green:{model:1,srcX:0,srcY:0,srcW:64,srcH:64},oak_yellow:{model:1,srcX:64,srcY:0,srcW:64,srcH:64},oak_bare:{model:1,srcX:128,srcY:0,srcW:64,srcH:64},oak_ice:{model:1,srcX:192,srcY:0,srcW:64,srcH:64},oak_red:{model:1,srcX:0,srcY:64,srcW:64,srcH:64},oak_orange:{model:1,srcX:64,srcY:64,srcW:64,srcH:64},pine_dark:{model:2,srcX:0,srcY:0,srcW:43,srcH:48},pine_med:{model:2,srcX:43,srcY:0,srcW:43,srcH:48},pine_light:{model:2,srcX:86,srcY:0,srcW:42,srcH:48},pine_dark2:{model:2,srcX:0,srcY:48,srcW:43,srcH:48},pine_med2:{model:2,srcX:43,srcY:48,srcW:43,srcH:48},round_green:{model:3,srcX:0,srcY:0,srcW:64,srcH:53},round_dark:{model:3,srcX:64,srcY:0,srcW:64,srcH:53},round_autumn:{model:3,srcX:0,srcY:54,srcW:64,srcH:53},round_red:{model:3,srcX:64,srcY:54,srcW:64,srcH:53}},zt=40,Vt=32;function Gl(i,e,t){return Array.from({length:e},()=>Array(i).fill(t))}function Ze(i,e,t,n,s,r){for(let a=t;a<t+s&&a<i.length;a++)for(let o=e;o<e+n&&o<i[0].length;o++)a>=0&&o>=0&&(i[a][o]=r)}function Eg(i){let e=i;return()=>(e=e*16807%2147483647,(e-1)/2147483646)}function wg(){const i=Eg(42),e=Gl(zt,Vt,1),t=Gl(zt,Vt,0);for(let a=0;a<Vt;a++)for(let o=0;o<zt;o++){const l=i();e[a][o]=l<.4?1:l<.7?2:l<.9?3:0}Ze(t,0,0,zt,2,1),Ze(e,0,0,zt,2,0),Ze(t,0,Vt-2,zt,2,1),Ze(e,0,Vt-2,zt,2,0),Ze(t,0,0,2,Vt,1),Ze(e,0,0,2,Vt,0),Ze(t,zt-2,0,2,Vt,1),Ze(e,zt-2,0,2,Vt,0),Ze(t,18,0,4,2,0),Ze(e,18,0,4,2,4),Ze(t,18,Vt-2,4,2,0),Ze(e,18,Vt-2,4,2,4),Ze(t,zt-2,13,2,4,0),Ze(e,zt-2,13,2,4,4),Ze(e,19,2,2,Vt-4,4),Ze(e,2,14,zt-4,2,4),Ze(e,30,14,zt-32,2,4),Ze(e,17,12,6,6,5),Ze(e,6,5,5,4,6),Ze(t,6,5,5,1,1),Ze(t,6,5,1,4,1),Ze(t,10,5,1,4,1),Ze(e,28,5,5,4,6),Ze(t,28,5,5,1,1),Ze(t,28,5,1,4,1),Ze(t,32,5,1,4,1),Ze(e,5,20,8,6,8),Ze(e,28,20,5,4,7),Ze(e,31,10,4,3,9),Ze(t,34,10,1,3,1);const n=[{x:3,y:2,v:"pine_dark"},{x:7,y:2,v:"oak_green"},{x:11,y:2,v:"pine_med"},{x:15,y:2,v:"round_green"},{x:23,y:2,v:"round_dark"},{x:27,y:2,v:"pine_light"},{x:31,y:2,v:"oak_green"},{x:35,y:2,v:"pine_dark"},{x:3,y:28,v:"pine_dark2"},{x:7,y:28,v:"oak_orange"},{x:11,y:28,v:"round_green"},{x:15,y:28,v:"pine_med"},{x:23,y:28,v:"oak_green"},{x:27,y:28,v:"round_dark"},{x:31,y:28,v:"pine_dark"},{x:35,y:28,v:"oak_yellow"},{x:3,y:6,v:"pine_dark"},{x:3,y:11,v:"oak_green"},{x:3,y:17,v:"round_green"},{x:3,y:23,v:"pine_med"},{x:36,y:5,v:"round_dark"},{x:36,y:10,v:"pine_dark"},{x:36,y:19,v:"oak_green"},{x:36,y:24,v:"pine_med2"},{x:13,y:6,v:"oak_green"},{x:26,y:6,v:"round_green"},{x:13,y:24,v:"pine_med"},{x:26,y:24,v:"oak_yellow"},{x:20,y:8,v:"round_dark"},{x:20,y:24,v:"oak_green"}];for(const a of n){const o=Math.min(a.y,Vt-1),l=Math.min(a.x,zt-1);o>=0&&l>=0&&(t[o][l]=1)}const s=[...n.map(a=>({type:"tree",variant:a.v,x:a.x,y:a.y})),{type:"house",x:5,y:6},{type:"house",x:27,y:6},{type:"house",x:27,y:19},{type:"house",x:32,y:10},{type:"maple_tree",x:17,y:8},{type:"maple_tree",x:22,y:8},{type:"maple_tree",x:17,y:22},{type:"maple_tree",x:22,y:22},{type:"bonfire",x:19,y:14},{type:"station",station:"cooking",x:7,y:8,w:2,h:1},{type:"station",station:"workbench",x:29,y:8,w:2,h:1},{type:"station",station:"anvil",x:31,y:8,w:1,h:1},{type:"station",station:"sawmill",x:29,y:22,w:2,h:1},{type:"station",station:"alchemy",x:33,y:11,w:1,h:1},{type:"crop",x:6,y:22,cropType:0},{type:"crop",x:7,y:22,cropType:1},{type:"crop",x:8,y:22,cropType:2},{type:"crop",x:9,y:22,cropType:3},{type:"crop",x:10,y:22,cropType:4},{type:"crop",x:6,y:24,cropType:5},{type:"crop",x:7,y:24,cropType:6},{type:"crop",x:8,y:24,cropType:0},{type:"crop",x:9,y:24,cropType:1},{type:"crop",x:10,y:24,cropType:2},{type:"real_fence",x:5,y:21},{type:"real_fence",x:6,y:21},{type:"real_fence",x:7,y:21},{type:"real_fence",x:8,y:21},{type:"real_fence",x:9,y:21},{type:"real_fence",x:10,y:21},{type:"real_fence",x:11,y:21},{type:"real_fence",x:5,y:25},{type:"real_fence",x:6,y:25},{type:"real_fence",x:7,y:25},{type:"real_fence",x:8,y:25},{type:"real_fence",x:9,y:25},{type:"real_fence",x:10,y:25},{type:"real_fence",x:11,y:25},{type:"chest",x:9,y:9},{type:"chest",x:33,y:12},{type:"chicken",x:12,y:20},{type:"chicken",x:14,y:22},{type:"chicken",x:11,y:24},{type:"bush",x:16,y:12},{type:"bush",x:23,y:12},{type:"bush",x:16,y:18},{type:"bush",x:23,y:18},{type:"bush",x:5,y:14},{type:"bush",x:34,y:14},{type:"flower",x:18,y:10},{type:"flower",x:21,y:10},{type:"flower",x:18,y:20},{type:"flower",x:21,y:20},{type:"flower",x:8,y:14},{type:"flower",x:12,y:14},{type:"flower",x:27,y:14},{type:"flower",x:31,y:14},{type:"flower",x:15,y:6},{type:"flower",x:24,y:6},{type:"flower",x:15,y:26},{type:"flower",x:24,y:26},{type:"rock",x:7,y:12},{type:"rock",x:33,y:16},{type:"rock",x:14,y:27},{type:"rock",x:25,y:10},{type:"wilted_plant",x:14,y:12},{type:"wilted_plant",x:22,y:10},{type:"wilted_plant",x:26,y:18},{type:"wilted_plant",x:10,y:16},{type:"wilted_plant",x:19,y:24},{type:"wilted_plant",x:30,y:18}];for(const a of s)a.type==="station"&&Ze(t,a.x,a.y,a.w,a.h,1);const r=[{id:"north",x:18,y:0,w:4,h:2,target:"forest",spawnX:25,spawnY:37},{id:"south",x:18,y:Vt-2,w:4,h:2,target:"lake",spawnX:21,spawnY:4},{id:"east",x:zt-2,y:13,w:2,h:4,target:"dungeon",spawnX:4,spawnY:14}];return{width:zt,height:Vt,ground:e,collision:t,props:s,exits:r,npcs:Sg,tileDefs:Mg,playerSpawn:{x:20,y:15}}}const Ht=50,Mt=40;function Vl(i,e,t){return Array.from({length:e},()=>Array(i).fill(t))}function wt(i,e,t,n,s,r){for(let a=t;a<t+s&&a<i.length;a++)for(let o=e;o<e+n&&o<i[0].length;o++)a>=0&&o>=0&&(i[a][o]=r)}function rn(i,e,t,n,s){for(let r=t-n;r<=t+n;r++)for(let a=e-n;a<=e+n;a++)Math.sqrt((a-e)**2+(r-t)**2)<=n&&r>=0&&r<i.length&&a>=0&&a<i[0].length&&(i[r][a]=s)}function Tg(i){let e=i;return()=>(e=e*16807%2147483647,(e-1)/2147483646)}function Ag(){const i=Tg(7777),e=Vl(Ht,Mt,0),t=Vl(Ht,Mt,0);for(let h=0;h<Mt;h++)for(let u=0;u<Ht;u++){const d=i();h<Mt/2?e[h][u]=d<.5?0:d<.75?1:d<.9?3:2:e[h][u]=d<.3?0:d<.55?1:d<.8?2:3}wt(t,0,0,Ht,2,1),wt(e,0,0,Ht,2,0),wt(t,0,Mt-2,Ht,2,1),wt(e,0,Mt-2,Ht,2,0),wt(t,0,0,2,Mt,1),wt(e,0,0,2,Mt,0),wt(t,Ht-2,0,2,Mt,1),wt(e,Ht-2,0,2,Mt,0),wt(t,23,Mt-2,4,2,0),wt(e,23,Mt-2,4,2,4),wt(t,24,0,2,2,0),wt(e,24,0,2,2,8),wt(e,24,10,2,Mt-12,4),wt(e,8,20,34,2,4),wt(e,24,4,2,8,4),wt(e,8,14,2,7,4),wt(e,8,14,17,2,4),wt(e,25,20,12,2,4),wt(e,36,14,2,7,4);for(let h=0;h<Mt;h++)for(let u=0;u<Ht;u++)if(e[h][u]===4)for(let d=-1;d<=1;d++)for(let m=-1;m<=1;m++){const g=h+d,x=u+m;g>=0&&g<Mt&&x>=0&&x<Ht&&e[g][x]!==4&&e[g][x]!==5&&e[g][x]!==9&&i()<.3&&(e[g][x]=5)}rn(e,14,28,4,2),rn(e,14,28,2,8),rn(e,25,20,3,1),rn(e,37,14,3,2),rn(e,37,14,1,8),rn(e,12,8,3,1),rn(e,40,7,3,0),rn(e,40,7,2,5),rn(e,14,30,2,9),rn(t,14,30,1,1),rn(e,30,8,2,9),rn(t,30,8,1,1),wt(e,42,16,2,2,9);const n=["oak_green","oak_green","oak_green","pine_dark","pine_med","pine_light","round_green","round_dark","oak_yellow","pine_dark2"],s=["pine_dark","pine_dark","pine_dark2","pine_med","round_dark","oak_bare","oak_green"],r=[];for(let h=2;h<Ht-2;h+=3){if(h>=23&&h<=26)continue;const u=s[Math.floor(i()*s.length)];r.push({x:h,y:0+Math.floor(i()*2),v:u})}for(let h=2;h<Ht-2;h+=3){if(h>=22&&h<=27)continue;const u=n[Math.floor(i()*n.length)];r.push({x:h,y:Mt-2+Math.floor(i()*2),v:u})}for(let h=3;h<Mt-2;h+=3){const u=n[Math.floor(i()*n.length)];r.push({x:Math.floor(i()*2),y:h,v:u})}for(let h=3;h<Mt-2;h+=3){const u=n[Math.floor(i()*n.length)];r.push({x:Ht-2+Math.floor(i()*2),y:h,v:u})}const a=[{x:4,y:3},{x:7,y:4},{x:10,y:3},{x:16,y:5},{x:19,y:3},{x:22,y:5},{x:28,y:4},{x:33,y:3},{x:36,y:5},{x:43,y:3},{x:46,y:5},{x:5,y:8},{x:8,y:10},{x:15,y:7},{x:18,y:9},{x:34,y:8},{x:38,y:10},{x:44,y:8},{x:6,y:13},{x:13,y:12},{x:17,y:14},{x:21,y:13},{x:28,y:12},{x:33,y:14},{x:39,y:11},{x:44,y:13},{x:46,y:10},{x:3,y:16},{x:11,y:16},{x:18,y:16},{x:30,y:16},{x:42,y:16}];for(const h of a){const u=s[Math.floor(i()*s.length)];r.push({x:h.x,y:h.y,v:u})}const o=[{x:4,y:24},{x:8,y:26},{x:20,y:25},{x:30,y:24},{x:35,y:26},{x:42,y:25},{x:46,y:23},{x:6,y:30},{x:11,y:32},{x:18,y:30},{x:22,y:33},{x:28,y:31},{x:33,y:30},{x:38,y:33},{x:44,y:30},{x:4,y:35},{x:10,y:36},{x:16,y:34},{x:30,y:35},{x:36,y:36},{x:42,y:34},{x:46,y:36}];for(const h of o){const u=n[Math.floor(i()*n.length)];r.push({x:h.x,y:h.y,v:u})}r.push({x:24,y:2,v:"oak_green"});for(const h of r){const u=Math.min(Math.max(h.y,0),Mt-1),d=Math.min(Math.max(h.x,0),Ht-1);t[u][d]=1}const l=[...r.map(h=>({type:"tree",variant:h.v,x:h.x,y:h.y})),{type:"mob_spawn",mobType:"slime_green",x:10,y:26,id:"slime_s1"},{type:"mob_spawn",mobType:"slime_green",x:38,y:28,id:"slime_s2"},{type:"mob_spawn",mobType:"slime_blue",x:20,y:32,id:"slime_s3"},{type:"mob_spawn",mobType:"slime_red",x:12,y:8,id:"slime_n1"},{type:"mob_spawn",mobType:"slime_red",x:40,y:7,id:"slime_n2"},{type:"mob_spawn",mobType:"slime_purple",x:42,y:9,id:"slime_n3"},{type:"resource",resourceType:"tree",x:6,y:22,id:"rtree1"},{type:"resource",resourceType:"tree",x:32,y:25,id:"rtree2"},{type:"resource",resourceType:"tree",x:44,y:18,id:"rtree3"},{type:"resource",resourceType:"tree",x:14,y:10,id:"rtree4"},{type:"resource",resourceType:"rock",x:37,y:15,id:"rock1"},{type:"resource",resourceType:"rock",x:9,y:14,id:"rock2"},{type:"resource",resourceType:"rock",x:45,y:12,id:"rock3"},{type:"resource",resourceType:"mushroom",x:5,y:18,id:"mush1"},{type:"resource",resourceType:"mushroom",x:20,y:12,id:"mush2"},{type:"resource",resourceType:"mushroom",x:38,y:30,id:"mush3"},{type:"resource",resourceType:"mushroom",x:28,y:6,id:"mush4"},{type:"resource",resourceType:"earth",x:16,y:28,id:"earth1"},{type:"resource",resourceType:"earth",x:36,y:20,id:"earth2"},{type:"resource",resourceType:"earth",x:8,y:8,id:"earth3"},{type:"resource",resourceType:"earth",x:44,y:28,id:"earth4"},{type:"resource",resourceType:"earth",x:22,y:16,id:"earth5"},{type:"wilted_plant",x:12,y:24,id:"wilt1"},{type:"wilted_plant",x:36,y:18,id:"wilt2"},{type:"wilted_plant",x:8,y:32,id:"wilt3"},{type:"wilted_plant",x:40,y:24,id:"wilt4"},{type:"wilted_plant",x:18,y:10,id:"wilt5"},{type:"wilted_plant",x:30,y:14,id:"wilt6"},{type:"wilted_plant",x:24,y:30,id:"wilt7"},{type:"bush",x:22,y:20},{type:"bush",x:27,y:20},{type:"bush",x:24,y:18},{type:"bush",x:24,y:22},{type:"bush",x:10,y:20},{type:"bush",x:40,y:20},{type:"flower",x:13,y:27},{type:"flower",x:15,y:27},{type:"flower",x:13,y:29},{type:"flower",x:15,y:29},{type:"flower",x:36,y:13},{type:"flower",x:38,y:13},{type:"flower",x:37,y:15},{type:"rock",x:29,y:9},{type:"rock",x:31,y:9},{type:"rock",x:43,y:17},{type:"rock",x:7,y:15}],c=[{id:"south",x:23,y:Mt-2,w:4,h:2,target:"hub",spawnX:20,spawnY:4},{id:"north_secret",x:24,y:0,w:2,h:2,target:"unicorn_meadow",spawnX:12,spawnY:17,hidden:!0,requirement:"heal_10_plants"}];return{width:Ht,height:Mt,ground:e,collision:t,props:l,exits:c,playerSpawn:{x:25,y:37},tileDefs:null}}const hs=35,ds=30;function Wl(i,e,t){return Array.from({length:e},()=>Array(i).fill(t))}function Tn(i,e,t,n,s,r){for(let a=t;a<t+s&&a<i.length;a++)for(let o=e;o<e+n&&o<i[0].length;o++)a>=0&&o>=0&&(i[a][o]=r)}function Cg(i){let e=i;return()=>(e=e*16807%2147483647,(e-1)/2147483646)}function Rg(){var o;const i=Cg(9999),e=Wl(hs,ds,0),t=Wl(hs,ds,1);function n(l,c,h,u){Tn(e,l,c,h,u,9),Tn(t,l,c,h,u,0)}function s(l,c,h,u,d){const m=d;if(l===h){const g=Math.min(c,u),x=Math.max(c,u);Tn(e,l,g,m,x-g+1,9),Tn(t,l,g,m,x-g+1,0)}else if(c===u){const g=Math.min(l,h),x=Math.max(l,h);Tn(e,g,c,x-g+m,m,9),Tn(t,g,c,x-g+m,m,0)}}n(2,11,10,6),s(8,5,8,12,2),n(5,2,8,4),s(8,16,8,22,2),n(4,21,14,7),n(20,9,10,6),s(11,13,20,13,2),n(17,23,6,4),s(17,24,17,24,2),n(24,3,7,5),s(27,7,27,9,2),Tn(e,0,13,3,4,9),Tn(t,0,13,3,4,0);for(let l=0;l<ds;l++)for(let c=0;c<hs;c++)e[l][c]===9&&t[l][c]===0&&i()<.08&&(e[l][c]=5);Tn(e,22,11,5,3,9),Tn(t,23,12,3,1,1);const r=[{type:"torch",x:3,y:11},{type:"torch",x:10,y:11},{type:"torch",x:3,y:16},{type:"torch",x:10,y:16},{type:"torch",x:7,y:6},{type:"torch",x:10,y:8},{type:"torch",x:5,y:2},{type:"torch",x:12,y:2},{type:"torch",x:7,y:18},{type:"torch",x:10,y:20},{type:"torch",x:4,y:21},{type:"torch",x:17,y:21},{type:"torch",x:4,y:27},{type:"torch",x:17,y:27},{type:"torch",x:10,y:24},{type:"torch",x:20,y:9},{type:"torch",x:29,y:9},{type:"torch",x:20,y:14},{type:"torch",x:29,y:14},{type:"torch",x:15,y:12},{type:"torch",x:24,y:3},{type:"torch",x:30,y:3},{type:"torch",x:17,y:23},{type:"crystal",x:26,y:4,id:"crystal1"},{type:"crystal",x:28,y:4,id:"crystal2"},{type:"crystal",x:27,y:5,id:"crystal3"},{type:"crystal",x:25,y:6,id:"crystal4"},{type:"crystal",x:29,y:6,id:"crystal5"},{type:"crystal",x:16,y:24,id:"crystal6"},{type:"crystal",x:6,y:3,id:"crystal7"},{type:"crystal",x:28,y:12,id:"crystal8"},{type:"rock",x:22,y:10},{type:"rock",x:26,y:13},{type:"rock",x:21,y:13},{type:"mob_spawn",mobType:"skeleton_base",x:5,y:13,id:"skel1"},{type:"mob_spawn",mobType:"skeleton_base",x:9,y:15,id:"skel2"},{type:"mob_spawn",mobType:"skeleton_base",x:8,y:7,id:"skel3"},{type:"mob_spawn",mobType:"skeleton_warrior",x:9,y:3,id:"skel4"},{type:"mob_spawn",mobType:"skeleton_warrior",x:10,y:23,id:"skel5"},{type:"mob_spawn",mobType:"skeleton_mage",x:14,y:25,id:"skel6"},{type:"mob_spawn",mobType:"skeleton_base",x:24,y:11,id:"skel7"},{type:"resource",resourceType:"ore",x:4,y:22,id:"ore1"},{type:"resource",resourceType:"ore",x:16,y:22,id:"ore2"},{type:"resource",resourceType:"ore",x:7,y:5,id:"ore3"},{type:"resource",resourceType:"ore",x:20,y:25,id:"ore4"},{type:"resource",resourceType:"ore",x:30,y:7,id:"ore5"},{type:"resource",resourceType:"mushroom",x:5,y:26,id:"dmush1"},{type:"resource",resourceType:"mushroom",x:12,y:4,id:"dmush2"},{type:"resource",resourceType:"mushroom",x:21,y:24,id:"dmush3"},{type:"resource",resourceType:"crystal",x:19,y:23,id:"rcrystal1"},{type:"resource",resourceType:"crystal",x:29,y:10,id:"rcrystal2"},{type:"wilted_plant",x:6,y:14,id:"cwilt1"},{type:"wilted_plant",x:15,y:23,id:"cwilt2"},{type:"wilted_plant",x:8,y:24,id:"cwilt3"},{type:"wilted_plant",x:25,y:13,id:"cwilt4"},{type:"rock",x:6,y:5},{type:"rock",x:11,y:3},{type:"rock",x:5,y:27},{type:"rock",x:16,y:27},{type:"rock",x:9,y:21},{type:"rock",x:19,y:26},{type:"rock",x:7,y:2},{type:"rock",x:10,y:2}];for(const l of r)(l.type==="crystal"||l.type==="rock"&&((o=t[l.y])==null?void 0:o[l.x])===0)&&l.y>=0&&l.y<ds&&l.x>=0&&l.x<hs&&(t[l.y][l.x]=1);return{width:hs,height:ds,ground:e,collision:t,props:r,exits:[{id:"west",x:0,y:13,w:2,h:4,target:"hub",spawnX:37,spawnY:15}],playerSpawn:{x:4,y:14},tileDefs:null}}const Wt=45,Xt=35;function Xl(i,e,t){return Array.from({length:e},()=>Array(i).fill(t))}function fn(i,e,t,n,s,r){for(let a=t;a<t+s&&a<i.length;a++)for(let o=e;o<e+n&&o<i[0].length;o++)a>=0&&o>=0&&(i[a][o]=r)}function da(i){let e=i;return()=>(e=e*16807%2147483647,(e-1)/2147483646)}function Pg(){const i=da(1337),e=Xl(Wt,Xt,1),t=Xl(Wt,Xt,0);for(let g=0;g<Xt;g++)for(let x=0;x<Wt;x++){const f=i();e[g][x]=f<.35?1:f<.6?2:f<.85?3:0}fn(t,0,0,Wt,2,1),fn(e,0,0,Wt,2,0),fn(t,0,Xt-2,Wt,2,1),fn(e,0,Xt-2,Wt,2,0),fn(t,0,0,2,Xt,1),fn(e,0,0,2,Xt,0),fn(t,Wt-2,0,2,Xt,1),fn(e,Wt-2,0,2,Xt,0),fn(t,20,0,4,2,0),fn(e,20,0,4,2,4),fn(e,21,2,2,6,4);const n=22,s=19,r=11,a=7,o=da(999);for(let g=0;g<Xt;g++)for(let x=0;x<Wt;x++){const f=(x-n)/r,p=(g-s)/a,M=f*f+p*p,T=(o()-.5)*.15;M+T<.85&&(e[g][x]=10,t[g][x]=1)}const l=24,c=20;for(let g=c-2;g<=c+2;g++)for(let x=l-2;x<=l+2;x++){const f=x-l,p=g-c;f*f+p*p<=3&&(e[g][x]=2,t[g][x]=0)}const h=da(555);for(let g=2;g<Xt-2;g++)for(let x=2;x<Wt-2;x++){if(e[g][x]===10)continue;let f=!1;for(let p=-1;p<=1;p++)for(let M=-1;M<=1;M++)g+p>=0&&g+p<Xt&&x+M>=0&&x+M<Wt&&e[g+p][x+M]===10&&(f=!0);if(f)e[g][x]=5;else{let p=!1;for(let M=-2;M<=2;M++)for(let T=-2;T<=2;T++){const w=g+M,R=x+T;w>=0&&w<Xt&&R>=0&&R<Wt&&e[w][R]===10&&(p=!0)}p&&h()<.3&&(e[g][x]=8)}}const u=[{x:1,y:0,v:"pine_dark"},{x:5,y:1,v:"oak_green"},{x:9,y:0,v:"round_green"},{x:13,y:1,v:"pine_med"},{x:17,y:0,v:"oak_green"},{x:25,y:0,v:"round_dark"},{x:29,y:1,v:"pine_dark"},{x:33,y:0,v:"oak_green"},{x:37,y:1,v:"pine_med"},{x:41,y:0,v:"round_green"},{x:1,y:33,v:"pine_dark2"},{x:5,y:34,v:"oak_orange"},{x:10,y:33,v:"round_green"},{x:15,y:34,v:"pine_med"},{x:20,y:33,v:"oak_green"},{x:25,y:34,v:"round_dark"},{x:30,y:33,v:"pine_dark"},{x:35,y:34,v:"oak_yellow"},{x:40,y:33,v:"pine_med2"},{x:0,y:4,v:"pine_dark"},{x:1,y:7,v:"oak_green"},{x:0,y:10,v:"round_green"},{x:1,y:13,v:"pine_med"},{x:0,y:16,v:"oak_green"},{x:1,y:19,v:"round_dark"},{x:0,y:22,v:"pine_dark"},{x:1,y:25,v:"oak_red"},{x:0,y:28,v:"round_green"},{x:1,y:31,v:"pine_med"},{x:3,y:5,v:"round_green"},{x:3,y:11,v:"pine_dark"},{x:4,y:17,v:"oak_green"},{x:3,y:23,v:"round_autumn"},{x:4,y:29,v:"pine_med"},{x:43,y:4,v:"pine_dark"},{x:44,y:7,v:"round_dark"},{x:43,y:10,v:"oak_green"},{x:44,y:13,v:"pine_med"},{x:43,y:16,v:"round_green"},{x:44,y:19,v:"oak_yellow"},{x:43,y:22,v:"pine_dark"},{x:44,y:25,v:"oak_green"},{x:43,y:28,v:"round_dark"},{x:44,y:31,v:"pine_med2"},{x:41,y:6,v:"oak_green"},{x:40,y:12,v:"pine_dark"},{x:41,y:18,v:"round_green"},{x:40,y:24,v:"oak_orange"},{x:41,y:30,v:"pine_med"},{x:24,y:19,v:"oak_yellow"}];for(const g of u){const x=Math.min(g.y,Xt-1),f=Math.min(g.x,Wt-1);x>=0&&f>=0&&(t[x][f]=1)}const d=[...u.map(g=>({type:"tree",variant:g.v,x:g.x,y:g.y})),{type:"fishing_spot",x:13,y:15},{type:"fishing_spot",x:30,y:15},{type:"fishing_spot",x:22,y:27},{type:"npc_marker",npcId:"liam",x:14,y:14},{type:"bonfire",x:15,y:14},{type:"garden",x:6,y:10},{type:"garden",x:8,y:10},{type:"garden",x:6,y:12},{type:"garden",x:8,y:12},{type:"wilted_plant",x:12,y:22},{type:"wilted_plant",x:28,y:13},{type:"wilted_plant",x:18,y:26},{type:"wilted_plant",x:33,y:21},{type:"wilted_plant",x:10,y:18},{type:"resource",resourceType:"earth",x:5,y:8},{type:"resource",resourceType:"earth",x:37,y:8},{type:"resource",resourceType:"earth",x:7,y:28},{type:"resource",resourceType:"earth",x:35,y:26},{type:"resource",resourceType:"earth",x:20,y:30},{type:"bush",x:10,y:11},{type:"bush",x:33,y:11},{type:"bush",x:9,y:24},{type:"bush",x:34,y:24},{type:"bush",x:16,y:28},{type:"bush",x:28,y:28},{type:"flower",x:11,y:13},{type:"flower",x:12,y:16},{type:"flower",x:10,y:20},{type:"flower",x:13,y:23},{type:"flower",x:15,y:25},{type:"flower",x:19,y:27},{type:"flower",x:25,y:27},{type:"flower",x:29,y:25},{type:"flower",x:31,y:22},{type:"flower",x:33,y:18},{type:"flower",x:32,y:14},{type:"flower",x:30,y:12},{type:"flower",x:17,y:12},{type:"flower",x:26,y:12},{type:"flower",x:11,y:15},{type:"flower",x:14,y:24},{type:"flower",x:20,y:26},{type:"flower",x:24,y:26},{type:"flower",x:30,y:20},{type:"flower",x:31,y:16},{type:"rock",x:12,y:19},{type:"rock",x:32,y:17},{type:"rock",x:21,y:28}];return t[14][15]=1,{width:Wt,height:Xt,ground:e,collision:t,props:d,exits:[{id:"north",x:20,y:0,w:4,h:2,target:"hub",spawnX:20,spawnY:28}],playerSpawn:{x:21,y:4},tileDefs:null}}const pn=25,qt=20;function ql(i,e,t){return Array.from({length:e},()=>Array(i).fill(t))}function mn(i,e,t,n,s,r){for(let a=t;a<t+s&&a<i.length;a++)for(let o=e;o<e+n&&o<i[0].length;o++)a>=0&&o>=0&&(i[a][o]=r)}function Dg(i){let e=i;return()=>(e=e*16807%2147483647,(e-1)/2147483646)}function Ig(){const i=Dg(7777),e=ql(pn,qt,8),t=ql(pn,qt,0);for(let a=0;a<qt;a++)for(let o=0;o<pn;o++){const l=i();l<.65?e[a][o]=8:l<.8?e[a][o]=2:l<.92?e[a][o]=3:e[a][o]=1}mn(t,0,0,pn,1,1),mn(e,0,0,pn,1,2),mn(t,0,qt-1,pn,1,1),mn(e,0,qt-1,pn,1,2),mn(t,0,0,1,qt,1),mn(e,0,0,1,qt,2),mn(t,pn-1,0,1,qt,1),mn(e,pn-1,0,1,qt,2),mn(t,10,qt-1,4,1,0),mn(e,10,qt-1,4,1,8),mn(e,11,qt-3,2,3,2);const n=[{x:0,y:0,v:"oak_yellow"},{x:6,y:0,v:"round_autumn"},{x:12,y:0,v:"oak_yellow"},{x:18,y:0,v:"round_autumn"},{x:24,y:0,v:"oak_yellow"},{x:0,y:19,v:"round_autumn"},{x:4,y:19,v:"oak_yellow"},{x:8,y:19,v:"round_autumn"},{x:15,y:19,v:"oak_yellow"},{x:19,y:19,v:"round_autumn"},{x:24,y:19,v:"oak_yellow"},{x:0,y:5,v:"oak_yellow"},{x:0,y:10,v:"round_autumn"},{x:0,y:15,v:"oak_yellow"},{x:24,y:5,v:"round_autumn"},{x:24,y:10,v:"oak_yellow"},{x:24,y:15,v:"round_autumn"},{x:5,y:4,v:"oak_yellow"},{x:19,y:4,v:"round_autumn"},{x:4,y:14,v:"round_autumn"},{x:20,y:14,v:"oak_yellow"}];for(const a of n){const o=Math.min(a.y,qt-1),l=Math.min(a.x,pn-1);o>=0&&l>=0&&(t[o][l]=1)}const s=[...n.map(a=>({type:"tree",variant:a.v,x:a.x,y:a.y})),{type:"unicorn_spawn",x:7,y:7},{type:"unicorn_spawn",x:17,y:6},{type:"unicorn_spawn",x:12,y:13},{type:"crystal_flower",x:6,y:5},{type:"crystal_flower",x:18,y:5},{type:"crystal_flower",x:10,y:9},{type:"crystal_flower",x:14,y:9},{type:"crystal_flower",x:8,y:14},{type:"crystal_flower",x:16,y:14},{type:"crystal_flower",x:12,y:3},{type:"crystal_flower",x:12,y:16},{type:"rainbow_zone",x:8,y:6,w:9,h:7},{type:"flower",x:3,y:3},{type:"flower",x:7,y:2},{type:"flower",x:11,y:2},{type:"flower",x:15,y:2},{type:"flower",x:21,y:3},{type:"flower",x:2,y:6},{type:"flower",x:9,y:5},{type:"flower",x:14,y:4},{type:"flower",x:22,y:6},{type:"flower",x:3,y:9},{type:"flower",x:8,y:8},{type:"flower",x:16,y:8},{type:"flower",x:21,y:9},{type:"flower",x:5,y:11},{type:"flower",x:10,y:11},{type:"flower",x:14,y:11},{type:"flower",x:19,y:11},{type:"flower",x:2,y:13},{type:"flower",x:11,y:13},{type:"flower",x:13,y:12},{type:"flower",x:22,y:13},{type:"flower",x:6,y:16},{type:"flower",x:9,y:15},{type:"flower",x:15,y:16},{type:"flower",x:18,y:15},{type:"flower",x:3,y:17},{type:"flower",x:7,y:17},{type:"flower",x:12,y:17},{type:"flower",x:17,y:17},{type:"flower",x:21,y:17},{type:"flower",x:5,y:7},{type:"flower",x:19,y:7},{type:"flower",x:10,y:6},{type:"flower",x:14,y:6}],r=[{id:"south",x:10,y:qt-1,w:4,h:1,target:"forest",spawnX:10,spawnY:2}];return{width:pn,height:qt,ground:e,collision:t,props:s,exits:r,playerSpawn:{x:12,y:17},tileDefs:null}}const de=16,Ss=11;function ua(i){return new Promise((e,t)=>{const n=new Image;n.onload=()=>e(n),n.onerror=()=>t(new Error(`Failed to load: ${i}`)),n.src=i})}function us(i,e,t,n,s,r){const a=i.getImageData(e,t,de,de),o=a.data;for(let l=0;l<o.length;l+=4)o[l]=Math.min(255,Math.round(o[l]*n)),o[l+1]=Math.min(255,Math.round(o[l+1]*s)),o[l+2]=Math.min(255,Math.round(o[l+2]*r));i.putImageData(a,e,t)}function Lg(i,e,t){const n=["#ff7896","#ffc83c","#ff64ff","#ffff64","#96c8ff","#ffa0d2","#ff9650","#c882ff"],s=[[3,2],[9,4],[5,8],[12,3],[7,12],[2,10],[11,9],[14,6]];for(let r=0;r<6;r++){const[a,o]=s[r];i.fillStyle=n[r%n.length],i.fillRect(e+a,t+o,2,2),i.fillStyle="#552200",i.fillRect(e+a,t+o,1,1)}}function Yl(i,e,t,n){const s=n?[175,142,88]:[145,115,68];i.fillStyle=`rgb(${s[0]},${s[1]},${s[2]})`,i.fillRect(e,t,de,de),i.fillStyle="rgba(0,0,0,0.15)";for(let r=0;r<de;r+=4)i.fillRect(e,t+r,de,1);i.fillStyle=`rgba(${s[0]-20},${s[1]-20},${s[2]-15},0.25)`;for(let r=1;r<de;r+=3)i.fillRect(e+1,t+r,10,1);i.fillStyle="rgba(255,255,255,0.08)",i.fillRect(e+2,t+2,6,1),i.fillRect(e+2,t+6,8,1)}function Ug(i,e,t){i.fillStyle="#7a7d8a",i.fillRect(e,t,de,de),i.fillStyle="#5a5d6a",i.fillRect(e,t+7,de,1),i.fillRect(e+7,t,1,de),i.fillRect(e+3,t+8,1,8),i.fillRect(e+11,t,1,7),i.fillStyle="rgba(255,255,255,0.06)",i.fillRect(e+2,t+2,3,3),i.fillRect(e+9,t+10,3,3),i.fillStyle="rgba(0,0,0,0.06)",i.fillRect(e+10,t+2,2,2),i.fillRect(e+1,t+10,2,2)}async function Fg(){const i=document.createElement("canvas");i.width=Ss*de,i.height=de;const e=i.getContext("2d");try{const n="/emilia-pixel-adventure/",[s,r,a]=await Promise.all([ua(`${n}Cute_Fantasy_Free/Tiles/Grass_Middle.png`),ua(`${n}Cute_Fantasy_Free/Tiles/Path_Middle.png`),ua(`${n}Cute_Fantasy_Free/Tiles/Water_Middle.png`)]);e.drawImage(s,0,0,de,de,1*de,0,de,de),e.drawImage(s,0,0,de,de,0*de,0,de,de),us(e,0,0,.78,.82,.72),e.drawImage(s,0,0,de,de,2*de,0,de,de),us(e,2*de,0,1.15,1.12,1.05),e.drawImage(s,0,0,de,de,3*de,0,de,de),us(e,3*de,0,1,1.08,.85),e.drawImage(r,0,0,de,de,4*de,0,de,de),e.drawImage(r,0,0,de,de,5*de,0,de,de),us(e,5*de,0,.8,.78,.75),Yl(e,6*de,0,!1),Yl(e,7*de,0,!0),e.drawImage(s,0,0,de,de,8*de,0,de,de),us(e,8*de,0,1.05,1.1,.95),Lg(e,8*de,0),Ug(e,9*de,0),e.drawImage(a,0,0,de,de,10*de,0,de,de)}catch(n){console.warn("Asset tiles failed to load, using fallback colors:",n);const s=["#3a7830","#48903a","#55a042","#44953a","#be9e76","#9b8060","#917850","#af9258","#48903a","#9b9ea8","#3a7ab0"];for(let r=0;r<Ss;r++)e.fillStyle=s[r],e.fillRect(r*de,0,de,de)}const t=new an(i);return t.magFilter=Pe,t.minFilter=Pe,t.generateMipmaps=!1,t.colorSpace=pt,t}function Ng(){const i=document.createElement("canvas");i.width=Ss*de,i.height=de;const e=i.getContext("2d"),t=["#3a7830","#48903a","#55a042","#44953a","#be9e76","#9b8060","#917850","#af9258","#48903a","#9b9ea8","#3a7ab0"];for(let s=0;s<Ss;s++)e.fillStyle=t[s],e.fillRect(s*de,0,de,de);const n=new an(i);return n.magFilter=Pe,n.minFilter=Pe,n.generateMipmaps=!1,n.colorSpace=pt,n}const Uc={};for(let i=0;i<Ss;i++)Uc[i]={x:i,y:0};class Og{constructor(){this.scene=new kh,this.scene.background=new Ne(2972199),this.renderer=new d0({antialias:!1}),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.setPixelRatio(window.devicePixelRatio),this.renderer.outputColorSpace=pt,document.body.appendChild(this.renderer.domElement),this.camera=new T0,this.input=new y0,this.assetLoader=new v0,this.sceneManager=new S0(this),this.audio=new M0,this.progression=new w0,this.tileMapRenderer=null,this.combat=new F0,this.hud=new V0,this.dialog=new fg,this.dialog.onDialogEnd=(e,t)=>{this.crafting&&t&&this.crafting.openStation(t)},this.saveManager=new vg,this.itemDrops=null,this.vfx=null,this.crafting=null,this.player=null,this.npcs=[],this.mobs=[],this.unicorns=[],this.tileMap=null,this.resources=null,this.plantHealing=new $0(null),this._animatedSprites=[],this.inventory=new O0,this.inventory.addItem("sword_wood",1),this.inventory.onChange=()=>{this.hud.updateHotbar(this.inventory),this.audio.playItemPickup()},this.tilesetTexture=null,this.postProcessing=null,this.juice=new lg,this.ambientLight=null,this.dirLight=null,this.clock=new gd,this.running=!1,this.mapGenerators={hub:wg,forest:Ag,dungeon:Rg,lake:Pg,unicorn_meadow:Ig},this.sceneBgs={hub:2972199,forest:1718810,dungeon:1710634,lake:1718858,unicorn_meadow:3820074},window.addEventListener("resize",()=>{this.renderer.setSize(window.innerWidth,window.innerHeight)}),window.addEventListener("keydown",e=>{e.code>="Digit1"&&e.code<="Digit8"&&(this.inventory.selectHotbar(parseInt(e.code.slice(5))-1),this.audio.playUIClick()),e.code==="KeyQ"&&this._useSelectedItem()})}async init(){this.tilesetTexture=Ng();try{this.tilesetTexture=await Fg()}catch(n){console.warn("Async tileset failed, using sync fallback:",n)}this.crafting=new xg(this.inventory,this.hud),this.player=new I0,this.player.inventory=this.inventory,await this.player.loadAnimations(this.assetLoader),this.progression.onLevelUp=(n,s)=>{this.audio.playLevelUp(),this.hud.showLevelUp(n,s.rewards),this.progression.applyToPlayer(this.player);for(const r of s.rewards)this.inventory.addItem(r.itemId,r.count);this.hud.updateHotbar(this.inventory),this.hud.updateXp(this.progression)},this.progression.onQuestComplete=n=>{if(this.audio.playChestOpen(),this.hud.showQuestComplete(n.name),n.itemReward)for(const s of n.itemReward)this.inventory.addItem(s.itemId,s.count);this.hud.updateQuest(this.progression.getActiveQuest()),this.hud.updateHotbar(this.inventory)},this.progression.onXpGain=()=>{this.hud.updateXp(this.progression),this.hud.updateQuest(this.progression.getActiveQuest())},this.player._onDamage=n=>{this.juice.damageFlash(),this.juice.shakeLight(),this.audio.playPlayerHurt()},this.player._onDeath=()=>{this.audio.playPlayerDeath(),this.sceneManager.transition("hub",20,15),this.hud.showInfo("Emilia wacht im Dorf auf...")},this.assetLoader.hideLoadingScreen();const e=new yg,t=this.saveManager.hasSave();e.show(t),e.onStart(async()=>{this.audio.init(),this.audio.playUIClick(),this.progression.initNewGame(),e.hide(),await this._buildScene("hub",{x:20,y:15}),this.hud.updateHotbar(this.inventory),this.hud.updateXp(this.progression),this.hud.updateQuest(this.progression.getActiveQuest()),this.running=!0,this._loop()}),e.onContinue(async()=>{var s,r,a,o;this.audio.init(),this.audio.playUIClick(),e.hide();const n=this.saveManager.load();if(n){if(n.inventory)for(let u=0;u<n.inventory.length&&u<this.inventory.slots.length;u++)this.inventory.slots[u]=n.inventory[u];this.plantHealing.totalHealed=n.plantsHealed||0,this.plantHealing.unicornUnlocked=n.unicornUnlocked||!1,n.progression&&this.progression.loadSaveData(n.progression);const l=((s=n.player)==null?void 0:s.scene)||"hub",c=((r=n.player)==null?void 0:r.x)||20,h=((a=n.player)==null?void 0:a.y)||15;await this._buildScene(l,{x:c,y:h}),this.player.hp=((o=n.player)==null?void 0:o.hp)||100,this.progression.applyToPlayer(this.player)}else this.progression.initNewGame(),await this._buildScene("hub",{x:20,y:15});this.hud.updateHotbar(this.inventory),this.hud.updateXp(this.progression),this.hud.updateQuest(this.progression.getActiveQuest()),this.running=!0,this._loop()})}async loadScene(e,t){await this._buildScene(e,t)}async _buildScene(e,t){var u,d;this._clearScene(),this.scene.background=new Ne(this.sceneBgs[e]||2972199);const n=this.mapGenerators[e];if(!n){console.error(`Unknown scene: ${e}`);return}const s=n();this.tileMap=new C0(s),this.camera.setMapBounds(s.width,s.height),this.tileMapRenderer=new A0(this.scene),this.tileMapRenderer.buildGround({width:s.width,height:s.height,ground:s.ground,tilesetTexture:this.tilesetTexture,tileDefs:s.tileDefs||Uc}),await this._loadProps(s.props);const r={x:t.x!==null&&t.x!==void 0?t.x:((u=s.playerSpawn)==null?void 0:u.x)||10,y:t.y!==null&&t.y!==void 0?t.y:((d=s.playerSpawn)==null?void 0:d.y)||10};this.player.x=r.x,this.player.y=r.y,this.player.addToScene(this.scene),s.npcs&&await this._createNPCs(s.npcs),await this._createMobs(s.props),this.itemDrops=new G0(this.scene),this.vfx=new j0(this.scene);const a={hub:"pollen",forest:"firefly",dungeon:"dust",lake:"pollen",unicorn_meadow:"magic"};this.vfx.startAmbientParticles(r.x,r.y,a[e]||"pollen"),this.resources=new q0(this.scene),this.resources.createFromProps(s.props),this.plantHealing.scene=this.scene,this.plantHealing.clearPlants(),this.plantHealing.createFromProps(s.props),this.plantHealing.onUnlock=()=>{this.hud.showInfo("Die Magische Wiese ist jetzt erreichbar!")};const o=s.props.filter(m=>m.type==="unicorn_spawn");for(const m of o){const g=new K0(m.x,m.y);g.addToScene(this.scene),this.unicorns.push(g)}const l={hub:{ambient:16775406,ambientI:2,sun:16772812,sunI:1.5,fog:null},forest:{ambient:11193514,ambientI:1.5,sun:13426107,sunI:1.2,fog:[2771498,.008]},dungeon:{ambient:8943530,ambientI:1,sun:10061977,sunI:.6,fog:[2236979,.015]},lake:{ambient:13426175,ambientI:2,sun:16777215,sunI:1.5,fog:null},unicorn_meadow:{ambient:16772812,ambientI:2.2,sun:16768426,sunI:1.8,fog:null}},c=l[e]||l.hub;this.ambientLight=new dd(c.ambient,c.ambientI),this.scene.add(this.ambientLight),this.dirLight=new hd(c.sun,c.sunI),this.dirLight.position.set(10,15,20),this.scene.add(this.dirLight),c.fog?this.scene.fog=new So(c.fog[0],c.fog[1]):this.scene.fog=null,this.postProcessing||(this.postProcessing=new og(this.renderer,this.scene,this.camera.three)),this.postProcessing.setSceneMood(e);const h={hub:"Emilias Dorf",forest:"Der Gruene Wald",dungeon:"Die Kristallhoehle",lake:"Der Blaue See",unicorn_meadow:"Die Magische Wiese"};h[e]&&this.hud.showInfo(h[e]),this.audio.playMusic(e),this.progression.reportVisit(e)}_clearScene(){this.player&&this.player.removeFromScene();for(const t of this.npcs)t.dispose();this.npcs=[];for(const t of this.mobs)t.dispose();this.mobs=[];for(const t of this.unicorns)t.dispose();this.unicorns=[],this.resources&&(this.resources.dispose(),this.resources=null),this.plantHealing.clearPlants(),this.ambientLight&&(this.scene.remove(this.ambientLight),this.ambientLight=null),this.dirLight&&(this.scene.remove(this.dirLight),this.dirLight=null);for(const t of this._animatedSprites)t.mesh.parent&&this.scene.remove(t.mesh),t.dispose();this._animatedSprites=[],this.tileMapRenderer&&(this.tileMapRenderer.dispose(),this.tileMapRenderer=null),this.itemDrops&&(this.itemDrops.dispose(),this.itemDrops=null),this.vfx&&(this.vfx.dispose(),this.vfx=null);const e=[];this.scene.traverse(t=>{t!==this.scene&&t.type!=="Camera"&&e.push(t)});for(const t of e)t.parent===this.scene&&(this.scene.remove(t),t.geometry&&t.geometry.dispose(),t.material&&(t.material.map&&t.material.map.dispose(),t.material.dispose()))}async _loadProps(e){const t={};for(const S of[1,2,3])try{t[S]=await this.assetLoader.loadTexture(`Environment/Props/Static/Trees/Model_0${S}/Size_02.png`)}catch{}let n=null,s=null,r=null,a=null,o=null,l=null,c=null;const h=S=>{const v=`/emilia-pixel-adventure/Cute_Fantasy_Free/${S}`;return this.assetLoader.cache.has(v)?Promise.resolve(this.assetLoader.cache.get(v)):new Promise((b,X)=>{this.assetLoader.textureLoader.load(v,C=>{C.magFilter=Pe,C.minFilter=Pe,C.generateMipmaps=!1,C.colorSpace=pt,this.assetLoader.cache.set(v,C),b(C)},void 0,X)})};try{n=await h("Outdoor decoration/Oak_Tree.png")}catch{}try{s=await h("Outdoor decoration/Oak_Tree_Small.png")}catch{}try{r=await h("Outdoor decoration/Outdoor_Decor_Free.png")}catch{}try{a=await h("Outdoor decoration/House_1_Wood_Base_Blue.png")}catch{}try{o=await h("Outdoor decoration/Fences.png")}catch{}try{l=await h("Outdoor decoration/Bridge_Wood.png")}catch{}try{c=await h("Outdoor decoration/Chest.png")}catch{}let u=null;try{u=await this.assetLoader.loadSpriteSheet("Environment/Structures/Stations/Bonfire/Bonfire_01-Sheet.png",32,32,4)}catch{}let d=null;try{d=await this.assetLoader.loadTexture("Environment/Props/Static/Vegetation.png")}catch{}let m=null;try{m=await this.assetLoader.loadTexture("Environment/Props/Static/Farm.png")}catch{}let g=null,x=null,f=null,p=null,M=null,T=null,w=null;const R=S=>{const v=`/emilia-pixel-adventure/Farm RPG FREE 16x16 - Tiny Asset Pack/${S}`;return this.assetLoader.cache.has(v)?Promise.resolve(this.assetLoader.cache.get(v)):new Promise((b,X)=>{this.assetLoader.textureLoader.load(v,C=>{C.magFilter=Pe,C.minFilter=Pe,C.generateMipmaps=!1,C.colorSpace=pt,this.assetLoader.cache.set(v,C),b(C)},void 0,X)})};try{g=await R("Objects/House.png")}catch{console.warn("House not loaded")}try{x=await R("Objects/Fence's copiar.png")}catch{console.warn("Fence not loaded")}try{f=await R("Objects/Maple Tree.png")}catch{console.warn("Maple not loaded")}try{p=await R("Objects/Spring Crops.png")}catch{console.warn("Crops not loaded")}try{M=await R("Objects/Road copiar.png")}catch{}try{T=await R("Objects/chest.png")}catch{}try{const A="/emilia-pixel-adventure/Farm RPG FREE 16x16 - Tiny Asset Pack/Farm Animals/Baby Chicken Yellow.png";w={texture:await R("Farm Animals/Baby Chicken Yellow.png"),frameWidth:16,frameHeight:16,frameCount:4,sheetWidth:64,sheetHeight:48}}catch{console.warn("Chicken not loaded")}for(const S of e)switch(S.type){case"tree":n?this.tileMapRenderer.addProp(n,S.x-1,S.y-3.5,4,5,.1):s?this.tileMapRenderer.addPropFromSheet(s,0,0,32,48,S.x,S.y-1.5,2,3):this._placeTree(S,t);break;case"bonfire":if(u){const A=new ao(u,200);A.setPosition((S.x||0)+1,(S.y||0)+1,.15+(S.y||0)*.001),this.scene.add(A.mesh),this._animatedSprites.push(A)}break;case"station":this._placeStation(S);break;case"bush":r?this.tileMapRenderer.addPropFromSheet(r,0,0,16,16,S.x,S.y,1,1):d&&this.tileMapRenderer.addPropFromSheet(d,0,96,32,32,S.x,S.y-.5,1.5,1.5);break;case"flower":if(r){const A=Math.floor((S.x*7+S.y*3)%7);this.tileMapRenderer.addPropFromSheet(r,A*16,176,16,16,S.x,S.y,1,1)}else d&&this.tileMapRenderer.addPropFromSheet(d,16,224,16,16,S.x+.1,S.y+.1,.8,.8);break;case"garden":p?this.tileMapRenderer.addPropFromSheet(p,S.x*7%4*16,0,16,16,S.x,S.y,1,1):m&&this.tileMapRenderer.addPropFromSheet(m,S.x*7%4*16,0,16,16,S.x,S.y,1,1);break;case"fence":o?this.tileMapRenderer.addPropFromSheet(o,0,0,16,16,S.x,S.y,1,1):m&&this.tileMapRenderer.addPropFromSheet(m,224,16,16,32,S.x,S.y-.5,.8,1.5);break;case"rock":r?this.tileMapRenderer.addPropFromSheet(r,0,48,16,16,S.x,S.y,1,1):d&&this.tileMapRenderer.addPropFromSheet(d,0,176,16,16,S.x+.1,S.y+.1,.8,.8);break;case"house":a?this.tileMapRenderer.addProp(a,S.x,S.y-4,6,8,.1):g?this.tileMapRenderer.addPropFromSheet(g,128,16,96,96,S.x,S.y-2,6,6):this._placeHouse(S);break;case"maple_tree":f&&this.tileMapRenderer.addPropFromSheet(f,118,0,42,48,S.x-1,S.y-2.5,2.5,3);break;case"real_fence":o?this.tileMapRenderer.addPropFromSheet(o,16,0,16,16,S.x,S.y,1,1):x&&this.tileMapRenderer.addPropFromSheet(x,16,0,16,32,S.x,S.y-.5,1,2);break;case"cobble":if(M){const A=(S.x*3+S.y*7)%4*16;this.tileMapRenderer.addPropFromSheet(M,A%64,0,16,16,S.x,S.y,1,1)}break;case"crop":if(r){const A=[[64,64],[80,64],[96,64],[64,80],[80,80],[96,80],[0,80],[16,80],[32,80],[48,80]],v=(S.cropType||0)%A.length,[b,X]=A[v];this.tileMapRenderer.addPropFromSheet(r,b,X,16,16,S.x,S.y,1,1)}else if(p){const A=(S.cropType||0)%7*32,v=S.stage?S.stage*16:48;this.tileMapRenderer.addPropFromSheet(p,A,v,16,16,S.x,S.y,1,1)}break;case"chest":T&&this.tileMapRenderer.addPropFromSheet(T,0,0,16,16,S.x,S.y,1,1);break;case"chicken":if(w){const A=new ao(w,250);A.setPosition(S.x+.5,S.y+.5,.12+S.y*.001),this.scene.add(A.mesh),this._animatedSprites.push(A)}break}}_placeTree(e,t){const n=bg[e.variant];if(!n)return;const s=t[n.model];if(!s)return;const{srcX:r,srcY:a,srcW:o,srcH:l}=n,c=2.5,h=3,u=o/16,d=l/16,m=Math.min(c/u,h/d,1),g=u*m,x=d*m;let f=e.x-g/2+.5,p=e.y-x+1.2;this.tileMap&&(f=Math.max(0,Math.min(this.tileMap.width-g,f)),p=Math.max(0,p)),this.tileMapRenderer.addPropFromSheet(s,r,a,o,l,f,p,g,x)}_placeHouse(e){const t=e.w||4,n=e.h||3,s=e.roofColor||[140,60,50],r=e.wallColor||[200,180,140],a=document.createElement("canvas");a.width=64,a.height=64;const o=a.getContext("2d");o.fillStyle=`rgb(${r[0]},${r[1]},${r[2]})`,o.fillRect(4,24,56,36),o.fillStyle="rgba(0,0,0,0.15)",o.fillRect(4,48,56,12),o.fillStyle="rgba(0,0,0,0.08)";for(let d=30;d<60;d+=8)o.fillRect(4,d,56,1);o.fillStyle=`rgb(${s[0]-20},${s[1]-10},${s[2]-10})`,o.fillRect(26,38,12,22),o.fillStyle="#FFD700",o.fillRect(34,48,2,2),o.fillStyle="#AADDFF",o.fillRect(10,32,10,10),o.fillStyle="rgba(255,255,255,0.3)",o.fillRect(10,32,5,5),o.fillStyle=`rgb(${r[0]-30},${r[1]-30},${r[2]-30})`,o.fillRect(14,32,2,10),o.fillRect(10,36,10,2),o.fillStyle="#AADDFF",o.fillRect(44,32,10,10),o.fillStyle="rgba(255,255,255,0.3)",o.fillRect(44,32,5,5),o.fillStyle=`rgb(${r[0]-30},${r[1]-30},${r[2]-30})`,o.fillRect(48,32,2,10),o.fillRect(44,36,10,2),o.fillStyle=`rgb(${s[0]},${s[1]},${s[2]})`,o.beginPath(),o.moveTo(0,26),o.lineTo(32,4),o.lineTo(64,26),o.closePath(),o.fill(),o.fillStyle="rgba(255,255,255,0.12)",o.beginPath(),o.moveTo(8,24),o.lineTo(32,8),o.lineTo(40,14),o.lineTo(16,24),o.closePath(),o.fill();const l=new an(a);l.magFilter=Pe,l.minFilter=Pe;const c=new ut(t,n),h=new dt({map:l,transparent:!0,alphaTest:.1,depthWrite:!1}),u=new qe(c,h);u.position.set(e.x+t/2,-(e.y+n/2)+.5,.08+e.y*.001),this.scene.add(u)}_placeStation(e){const t={cooking:{color:13386820,label:"Kueche"},workbench:{color:8939059,label:"Werkbank"},anvil:{color:8947848,label:"Amboss"},sawmill:{color:11176004,label:"Saege"},alchemy:{color:8930474,label:"Alchemie"}}[e.station]||{color:6710886,label:e.station},n=new ut(e.w||1,e.h||1),s=new dt({color:t.color,transparent:!0,opacity:.7}),r=new qe(n,s);r.position.set(e.x+(e.w||1)/2,-(e.y+(e.h||1)/2),.12+e.y*.001),this.scene.add(r);const a=document.createElement("canvas");a.width=96,a.height=24;const o=a.getContext("2d");o.font="bold 14px sans-serif",o.textAlign="center",o.textBaseline="middle",o.fillStyle="rgba(0,0,0,0.5)",o.fillRect(0,0,96,24),o.fillStyle="#fff",o.fillText(t.label,48,13);const l=new an(a);l.magFilter=vt;const c=new ut(1.5,.4),h=new dt({map:l,transparent:!0,depthWrite:!1}),u=new qe(c,h);u.position.set(e.x+(e.w||1)/2,-(e.y-.5),.5),this.scene.add(u)}async _createNPCs(e){for(const t of e){const n=new L0(t);try{await n.loadAnimations(this.assetLoader),n.addToScene(this.scene),this.npcs.push(n)}catch(s){console.warn(`NPC ${t.name} failed:`,s)}}}async _createMobs(e){const t=e.filter(n=>n.type==="mob_spawn");for(const n of t){const s=W0[n.mobType];if(!s)continue;const r=new U0(n.mobType,s,n.x,n.y);try{await r.loadAnimations(this.assetLoader),r.addToScene(this.scene),this.mobs.push(r)}catch(a){console.warn(`Mob ${n.mobType} failed:`,a)}}}_loop(){var s,r;if(!this.running)return;requestAnimationFrame(()=>this._loop());const e=Math.min(this.clock.getDelta(),.1);if(this.sceneManager.update(e),this.sceneManager.transitioning){this.postProcessing?this.postProcessing.render():this.renderer.render(this.scene,this.camera.three),this.input.endFrame();return}if(this.juice.update(e,this.camera.three),this.juice.isFrozen){this.postProcessing?this.postProcessing.render():this.renderer.render(this.scene,this.camera.three),this.input.endFrame();return}const t=this.dialog.isActive||this.crafting.isActive;this.dialog.update(e,this.player,this.npcs,this.input),this.dialog.isActive||this.crafting.update(e,this.player,this.tileMap,this.input),t||this.player.update(e,this.input,this.tileMap),this.player.state!=="dead"&&!t&&this.combat.tryAttack(this.player,this.input)&&(this.audio.playSwordSwing(),this.vfx&&this.vfx.swordSlash(this.player.x,this.player.y,this.player.direction));const n=this.combat.update(e,this.player,this.mobs);for(const a of n){this.vfx&&this.vfx.hitSparks(a.x,a.y),this.juice.shakeMedium(),this.juice.hitstop(.05),cg(a,this.player,2,.15);const o=((s=a.def)==null?void 0:s.spriteType)==="slime";if(o?this.audio.playSlimeHit():this.audio.playSkeletonHit(),!a.alive&&this.itemDrops){this.itemDrops.spawnMobDrops(a.drops,a.x,a.y),this.juice.shakeHeavy(),o?this.audio.playSlimeDeath():this.audio.playSkeletonDeath();const l=((r=a.def)==null?void 0:r.xp)||10;this.progression.addXp(l),this.progression.reportKill(a.mobType),this.hud.showInfo(`+${l} XP`)}}!t&&this.input.justPressed("KeyF")&&this.vfx&&this.vfx.waterSpray(this.player.x,this.player.y,this.player.direction),this.camera.follow(this.player.x,this.player.y,e);for(const a of this.npcs)a.update(e);for(const a of this.mobs)hg(a,e),a.update(e,this.player,this.tileMap);this.itemDrops&&!t&&this.itemDrops.update(e,this.player,this.inventory).length>0&&(this.hud.updateHotbar(this.inventory),this.vfx&&this.vfx.pickupGlow(this.player.x,this.player.y)),this.resources&&this.resources.update(e,this.player,this.input,this.itemDrops),this.plantHealing.update(e,this.player,this.input,this.hud);for(const a of this.unicorns)if(a.update(e,this.player),a.canPet(this.player)&&this.input.isKeyDown("KeyE")){const o=a.pet(this.player);o&&this.itemDrops&&(this.itemDrops.spawnDrop(o.itemId,o.count,o.x,o.y),this.hud.showInfo("Das Einhorn hat dich geheilt!"),this.hud.updateHotbar(this.inventory),this.juice.healFlash())}this.vfx&&this.player.state==="run"&&Math.random()<.3&&this.vfx.footDust(this.player.x,this.player.y),this.vfx&&this.vfx.update(e);for(const a of this._animatedSprites)a.update(e);t||this.sceneManager.checkExits(this.player,this.tileMap),this.hud.update(this.player),this.saveManager.update(e,()=>({playerHp:this.player.hp,currentScene:this.sceneManager.currentScene,playerX:this.player.x,playerY:this.player.y,inventorySlots:this.inventory.slots,plantsHealed:this.plantHealing.totalHealed,unicornUnlocked:this.plantHealing.unicornUnlocked,progression:this.progression.getSaveData()})),this.input.endFrame(),this.postProcessing?this.postProcessing.render():this.renderer.render(this.scene,this.camera.three)}_useSelectedItem(){if(!this.player||this.player.state==="dead")return;const e=this.inventory.getSelectedItem();e&&e.healAmount&&this.player.hp<this.player.maxHp&&(this.player.heal(e.healAmount),this.inventory.removeItem(e.id,1),this.hud.updateHotbar(this.inventory),this.hud.showInfo(`${e.name} benutzt! +${e.healAmount} HP`),this.juice&&this.juice.healFlash(),this.audio.playEat(),this.audio.playHeal())}dispose(){this.running=!1,this._clearScene(),this.hud.dispose(),this.sceneManager.dispose(),this.renderer.dispose()}}const Fc=new Og;window.__game=Fc;Fc.init().catch(i=>{console.error("Game initialization failed:",i)});
