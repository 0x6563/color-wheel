import{H as d,s as E}from"./index.99c573a5.js";const c=[];function p(e,t=d){let s;const o=new Set;function l(n){if(E(e,n)&&(e=n,s)){const u=!c.length;for(const a of o)a[1](),c.push(a,e);if(u){for(let a=0;a<c.length;a+=2)c[a][0](c[a+1]);c.length=0}}}function i(n){l(n(e))}function r(n,u=d){const a=[n,u];return o.add(a),o.size===1&&(s=t(l)||d),n(e),()=>{o.delete(a),o.size===0&&s&&(s(),s=null)}}return{set:l,update:i,subscribe:r}}var g;const m=((g=globalThis.__sveltekit_1iplsab)==null?void 0:g.base)??"/color-wheel";var k;const w=((k=globalThis.__sveltekit_1iplsab)==null?void 0:k.assets)??m,A="1680843751216",I="sveltekit:snapshot",y="sveltekit:scroll",x="sveltekit:index",b={tap:1,hover:2,viewport:3,eager:4,off:-1};function O(e){let t=e.baseURI;if(!t){const s=e.getElementsByTagName("base");t=s.length?s[0].href:e.URL}return t}function U(){return{x:pageXOffset,y:pageYOffset}}function f(e,t){return e.getAttribute(`data-sveltekit-${t}`)}const _={...b,"":b.hover};function v(e){let t=e.assignedSlot??e.parentNode;return(t==null?void 0:t.nodeType)===11&&(t=t.host),t}function L(e,t){for(;e&&e!==t;){if(e.nodeName.toUpperCase()==="A"&&e.hasAttribute("href"))return e;e=v(e)}}function N(e,t){let s;try{s=new URL(e instanceof SVGAElement?e.href.baseVal:e.href,document.baseURI)}catch{}const o=e instanceof SVGAElement?e.target.baseVal:e.target,l=!s||!!o||S(s,t)||(e.getAttribute("rel")||"").split(/\s+/).includes("external")||e.hasAttribute("download");return{url:s,external:l,target:o}}function V(e){let t=null,s=null,o=null,l=null,i=null,r=null,n=e;for(;n&&n!==document.documentElement;)o===null&&(o=f(n,"preload-code")),l===null&&(l=f(n,"preload-data")),t===null&&(t=f(n,"keepfocus")),s===null&&(s=f(n,"noscroll")),i===null&&(i=f(n,"reload")),r===null&&(r=f(n,"replacestate")),n=v(n);return{preload_code:_[o??"off"],preload_data:_[l??"off"],keep_focus:t==="off"?!1:t===""?!0:null,noscroll:s==="off"?!1:s===""?!0:null,reload:i==="off"?!1:i===""?!0:null,replace_state:r==="off"?!1:r===""?!0:null}}function h(e){const t=p(e);let s=!0;function o(){s=!0,t.update(r=>r)}function l(r){s=!1,t.set(r)}function i(r){let n;return t.subscribe(u=>{(n===void 0||s&&u!==n)&&r(n=u)})}return{notify:o,set:l,subscribe:i}}function R(){const{set:e,subscribe:t}=p(!1);let s;async function o(){clearTimeout(s);const l=await fetch(`${w}/_app/version.json`,{headers:{pragma:"no-cache","cache-control":"no-cache"}});if(l.ok){const r=(await l.json()).version!==A;return r&&(e(!0),clearTimeout(s)),r}else throw new Error(`Version check failed: ${l.status}`)}return{subscribe:t,check:o}}function S(e,t){return e.origin!==location.origin||!e.pathname.startsWith(t)}function P(e){e.client}const Y={url:h({}),page:h({}),navigating:p(null),updated:R()};export{x as I,b as P,y as S,I as a,N as b,V as c,U as d,m as e,L as f,O as g,P as h,S as i,Y as s};
