/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$2=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$4=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$4.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce(((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1]),t[0]);return new n$3(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$3,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$3(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach((t=>t.hostConnected?.()));}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()));}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i){if(void 0!==t){const e=this.constructor,h=this[t];if(i??=e.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(e._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach((t=>this._$ET(t,this[t]))),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.1");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$1=t$1.trustedTypes,s$1=i$1?i$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,e="$lit$",h=`lit$${Math.random().toFixed(9).slice(2)}$`,o$2="?"+h,n$1=`<${o$2}>`,r$2=document,l=()=>r$2.createComment(""),c=t=>null===t||"object"!=typeof t&&"function"!=typeof t,a=Array.isArray,u=t=>a(t)||"function"==typeof t?.[Symbol.iterator],d="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,_=/>/g,m=RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),p=/'/g,g=/"/g,$=/^(?:script|style|textarea|title)$/i,y=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=y(1),T=Symbol.for("lit-noChange"),E=Symbol.for("lit-nothing"),A=new WeakMap,C=r$2.createTreeWalker(r$2,129);function P(t,i){if(!a(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==s$1?s$1.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,o=[];let r,l=2===i?"<svg>":3===i?"<math>":"",c=f;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,y=0;for(;y<s.length&&(c.lastIndex=y,u=c.exec(s),null!==u);)y=c.lastIndex,c===f?"!--"===u[1]?c=v:void 0!==u[1]?c=_:void 0!==u[2]?($.test(u[2])&&(r=RegExp("</"+u[2],"g")),c=m):void 0!==u[3]&&(c=m):c===m?">"===u[0]?(c=r??f,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?m:'"'===u[3]?g:p):c===g||c===p?c=m:c===v||c===_?c=f:(c=m,r=void 0);const x=c===m&&t[i+1].startsWith("/>")?" ":"";l+=c===f?s+n$1:d>=0?(o.push(a),s.slice(0,d)+e+s.slice(d)+h+x):s+h+(-2===d?i:x);}return [P(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),o]};class N{constructor({strings:t,_$litType$:s},n){let r;this.parts=[];let c=0,a=0;const u=t.length-1,d=this.parts,[f,v]=V(t,s);if(this.el=N.createElement(f,n),C.currentNode=this.el.content,2===s||3===s){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=C.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(e)){const i=v[a++],s=r.getAttribute(t).split(h),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:c,name:e[2],strings:s,ctor:"."===e[1]?H:"?"===e[1]?I:"@"===e[1]?L:k}),r.removeAttribute(t);}else t.startsWith(h)&&(d.push({type:6,index:c}),r.removeAttribute(t));if($.test(r.tagName)){const t=r.textContent.split(h),s=t.length-1;if(s>0){r.textContent=i$1?i$1.emptyScript:"";for(let i=0;i<s;i++)r.append(t[i],l()),C.nextNode(),d.push({type:2,index:++c});r.append(t[s],l());}}}else if(8===r.nodeType)if(r.data===o$2)d.push({type:2,index:c});else {let t=-1;for(;-1!==(t=r.data.indexOf(h,t+1));)d.push({type:7,index:c}),t+=h.length-1;}c++;}}static createElement(t,i){const s=r$2.createElement("template");return s.innerHTML=t,s}}function S(t,i,s=t,e){if(i===T)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=c(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=S(t,h._$AS(t,i.values),h,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??r$2).importNode(i,true);C.currentNode=e;let h=C.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let i;2===l.type?i=new R(h,h.nextSibling,this,t):1===l.type?i=new l.ctor(h,l.name,l.strings,this,t):6===l.type&&(i=new z(h,this,t)),this._$AV.push(i),l=s[++n];}o!==l?.index&&(h=C.nextNode(),o++);}return C.currentNode=r$2,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class R{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S(this,t,i),c(t)?t===E||null==t||""===t?(this._$AH!==E&&this._$AR(),this._$AH=E):t!==this._$AH&&t!==T&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):u(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==E&&c(this._$AH)?this._$AA.nextSibling.data=t:this.T(r$2.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=N.createElement(P(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new M(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=A.get(t.strings);return void 0===i&&A.set(t.strings,i=new N(t)),i}k(t){a(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new R(this.O(l()),this.O(l()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){for(this._$AP?.(false,true,i);t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class k{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=E,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=E;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=S(this,t,i,0),o=!c(t)||t!==this._$AH&&t!==T,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=S(this,e[s+n],i,n),r===T&&(r=this._$AH[n]),o||=!c(r)||r!==this._$AH[n],r===E?t=E:t!==E&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class H extends k{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===E?void 0:t;}}class I extends k{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==E);}}class L extends k{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=S(this,t,i,0)??E)===T)return;const s=this._$AH,e=t===E&&s!==E||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==E&&(s===E||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t);}}const j=t$1.litHtmlPolyfillSupport;j?.(N,R),(t$1.litHtmlVersions??=[]).push("3.3.1");const B=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new R(i.insertBefore(l(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=B(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return T}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o$1=s.litElementPolyfillSupport;o$1?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.1");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=t=>(e,o)=>{ void 0!==o?o.addInitializer((()=>{customElements.define(t,e);})):customElements.define(t,e);};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$1=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n({...r,state:true,attribute:false})}

/**
 * Validates a regex pattern and provides user-friendly error messages
 */
class PatternValidator {
    /**
     * Validates a regex pattern string
     * @param pattern The regex pattern to validate
     * @returns Validation result with error details if invalid
     */
    static validatePattern(pattern) {
        // Check for empty or whitespace-only patterns
        if (!pattern || pattern.trim().length === 0) {
            return {
                valid: false,
                error: {
                    type: 'pattern',
                    message: 'Pattern cannot be empty',
                    details: 'Please provide a valid regular expression pattern'
                }
            };
        }
        // Check for potentially dangerous patterns
        const dangerousPatterns = [
            /\(\?\#.*\)/, // Comments that might contain code
            /\(\?\{.*\}\)/, // Code execution patterns
            /eval\(/i, // Eval function calls
            /function\(/i, // Function definitions
            /\<script/i // Script tags
        ];
        for (const dangerous of dangerousPatterns) {
            if (dangerous.test(pattern)) {
                return {
                    valid: false,
                    error: {
                        type: 'pattern',
                        message: 'Pattern contains potentially unsafe content',
                        details: 'Regular expressions cannot contain code execution patterns for security reasons'
                    }
                };
            }
        }
        // Check for excessively complex patterns that might cause performance issues
        if (pattern.length > 500) {
            return {
                valid: false,
                error: {
                    type: 'pattern',
                    message: 'Pattern is too long',
                    details: 'Regular expression patterns should be under 500 characters for performance reasons'
                }
            };
        }
        // Check for patterns with excessive nesting that could cause catastrophic backtracking
        const nestingLevel = this.calculateNestingLevel(pattern);
        if (nestingLevel > 10) {
            return {
                valid: false,
                error: {
                    type: 'pattern',
                    message: 'Pattern is too complex',
                    details: 'Regular expression has too many nested groups which could cause performance issues'
                }
            };
        }
        // Attempt to compile the regex pattern
        try {
            const compiledPattern = new RegExp(pattern, 'i');
            console.log(`RegexQueryCard: Compiled pattern "${pattern}" with flags "i"`);
            // Test the pattern with a simple string to catch some runtime issues
            try {
                compiledPattern.test('test.entity_id');
            }
            catch (runtimeError) {
                return {
                    valid: false,
                    error: {
                        type: 'pattern',
                        message: 'Pattern causes runtime error',
                        details: `The pattern fails during execution: ${runtimeError instanceof Error ? runtimeError.message : 'Unknown error'}`
                    }
                };
            }
            return {
                valid: true,
                compiledPattern
            };
        }
        catch (syntaxError) {
            return {
                valid: false,
                error: {
                    type: 'pattern',
                    message: this.getReadableErrorMessage(syntaxError),
                    details: syntaxError instanceof Error ? syntaxError.message : 'Invalid regular expression syntax'
                }
            };
        }
    }
    /**
     * Validates both include and exclude patterns
     * @param includePattern The main regex pattern
     * @param excludePattern Optional exclude pattern
     * @returns Combined validation result
     */
    static validatePatterns(includePattern, excludePattern) {
        var _a, _b;
        // Validate the main pattern
        const includeResult = this.validatePattern(includePattern);
        if (!includeResult.valid) {
            return includeResult;
        }
        // Validate exclude pattern if provided
        if (excludePattern && excludePattern.trim().length > 0) {
            const excludeResult = this.validatePattern(excludePattern);
            if (!excludeResult.valid) {
                return {
                    valid: false,
                    error: {
                        type: 'pattern',
                        message: `Exclude pattern error: ${(_a = excludeResult.error) === null || _a === void 0 ? void 0 : _a.message}`,
                        details: (_b = excludeResult.error) === null || _b === void 0 ? void 0 : _b.details
                    }
                };
            }
        }
        return includeResult;
    }
    /**
     * Provides suggestions for common pattern mistakes
     * @param pattern The pattern to analyze
     * @returns Array of helpful suggestions
     */
    static getPatternSuggestions(pattern) {
        const suggestions = [];
        // Check for common mistakes
        if (pattern.includes('.') && !pattern.includes('\\.')) {
            suggestions.push('Use \\. to match literal dots in entity IDs (e.g., "sensor\\.temperature" instead of "sensor.temperature")');
        }
        if (pattern.includes('*') && !pattern.includes('.*')) {
            suggestions.push('Use .* for wildcard matching instead of just * (e.g., "sensor.*" instead of "sensor*")');
        }
        if (!pattern.startsWith('^') && !pattern.includes('|')) {
            suggestions.push('Consider starting with ^ to match from the beginning of entity IDs (e.g., "^sensor\\." instead of "sensor\\.")');
        }
        if (!pattern.endsWith('$') && !pattern.includes('|')) {
            suggestions.push('Consider ending with $ to match to the end of entity IDs for more precise matching');
        }
        if (pattern.includes('\\\\')) {
            suggestions.push('Double backslashes (\\\\) might not be necessary - use single backslashes for escaping');
        }
        // Suggest common entity patterns
        if (pattern.length < 5) {
            suggestions.push('Common patterns: "^sensor\\." (all sensors), ".*_temperature$" (temperature entities), "^light\\." (all lights)');
        }
        return suggestions;
    }
    /**
     * Calculates the nesting level of groups in a regex pattern
     * @param pattern The regex pattern
     * @returns Maximum nesting depth
     */
    static calculateNestingLevel(pattern) {
        let maxDepth = 0;
        let currentDepth = 0;
        let inCharClass = false;
        let escaped = false;
        for (let i = 0; i < pattern.length; i++) {
            const char = pattern[i];
            if (escaped) {
                escaped = false;
                continue;
            }
            if (char === '\\') {
                escaped = true;
                continue;
            }
            if (char === '[') {
                inCharClass = true;
                continue;
            }
            if (char === ']' && inCharClass) {
                inCharClass = false;
                continue;
            }
            if (!inCharClass) {
                if (char === '(') {
                    currentDepth++;
                    maxDepth = Math.max(maxDepth, currentDepth);
                }
                else if (char === ')') {
                    currentDepth = Math.max(0, currentDepth - 1);
                }
            }
        }
        return maxDepth;
    }
    /**
     * Converts technical regex errors to user-friendly messages
     * @param error The regex compilation error
     * @returns User-friendly error message
     */
    static getReadableErrorMessage(error) {
        if (!(error instanceof Error)) {
            return 'Invalid regular expression';
        }
        const message = error.message.toLowerCase();
        if (message.includes('unterminated character class')) {
            return 'Unclosed character class - missing closing bracket ]';
        }
        if (message.includes('unterminated group')) {
            return 'Unclosed group - missing closing parenthesis )';
        }
        if (message.includes('invalid group')) {
            return 'Invalid group syntax - check parentheses and group modifiers';
        }
        if (message.includes('invalid escape')) {
            return 'Invalid escape sequence - check backslash usage';
        }
        if (message.includes('invalid quantifier')) {
            return 'Invalid quantifier - check usage of *, +, ?, {n,m}';
        }
        if (message.includes('nothing to repeat')) {
            return 'Quantifier has nothing to repeat - check placement of *, +, ?';
        }
        if (message.includes('invalid range')) {
            return 'Invalid character range in character class - check [a-z] syntax';
        }
        // Default fallback
        return 'Invalid regular expression syntax';
    }
    /**
     * Tests a pattern against sample entity IDs to verify it works as expected
     * @param pattern The regex pattern to test
     * @param sampleEntities Array of sample entity IDs to test against
     * @returns Test results with matches and non-matches
     */
    static testPattern(pattern, sampleEntities) {
        var _a;
        const validation = this.validatePattern(pattern);
        if (!validation.valid || !validation.compiledPattern) {
            return {
                matches: [],
                nonMatches: sampleEntities,
                error: (_a = validation.error) === null || _a === void 0 ? void 0 : _a.message
            };
        }
        const matches = [];
        const nonMatches = [];
        for (const entityId of sampleEntities) {
            try {
                if (validation.compiledPattern.test(entityId)) {
                    matches.push(entityId);
                }
                else {
                    nonMatches.push(entityId);
                }
            }
            catch (testError) {
                nonMatches.push(entityId);
            }
        }
        return { matches, nonMatches };
    }
}

/**
 * Handles entity discovery and regex matching for the card
 */
class EntityMatcher {
    constructor(hass) {
        this.lastMatchTime = 0;
        this.cachedResults = new Map();
        this.cacheTimeout = 5000; // 5 seconds cache
        this.hass = hass;
    }
    /**
     * Updates the Home Assistant instance
     * @param hass New Home Assistant instance
     */
    updateHass(hass) {
        this.hass = hass;
        // Clear cache when hass instance changes
        this.cachedResults.clear();
    }
    /**
     * Discovers and matches entities based on regex patterns
     * @param options Matching options including patterns and filters
     * @returns Promise resolving to match results
     */
    async matchEntities(options) {
        var _a, _b;
        const startTime = performance.now();
        // Create cache key
        const cacheKey = this.createCacheKey(options);
        // Check cache first
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            // Validate the main pattern
            const patternValidation = PatternValidator.validatePattern(options.pattern);
            if (!patternValidation.valid || !patternValidation.compiledPattern) {
                return {
                    entities: [],
                    totalCount: 0,
                    matchedCount: 0,
                    error: ((_a = patternValidation.error) === null || _a === void 0 ? void 0 : _a.message) || 'Invalid pattern',
                    performanceMetrics: {
                        matchingTime: performance.now() - startTime,
                        entityCount: 0
                    }
                };
            }
            // Validate exclude pattern if provided
            let excludeRegex;
            if (options.excludePattern && options.excludePattern.trim().length > 0) {
                const excludeValidation = PatternValidator.validatePattern(options.excludePattern);
                if (!excludeValidation.valid || !excludeValidation.compiledPattern) {
                    return {
                        entities: [],
                        totalCount: 0,
                        matchedCount: 0,
                        error: `Exclude pattern error: ${((_b = excludeValidation.error) === null || _b === void 0 ? void 0 : _b.message) || 'Invalid exclude pattern'}`,
                        performanceMetrics: {
                            matchingTime: performance.now() - startTime,
                            entityCount: 0
                        }
                    };
                }
                excludeRegex = excludeValidation.compiledPattern;
            }
            // Get all entities from Home Assistant
            const allEntities = this.getAllEntities();
            const totalCount = allEntities.length;
            console.log(`RegexQueryCard: Matching pattern "${options.pattern}" against ${totalCount} entities`);
            // Filter entities based on patterns
            const matchedEntities = this.filterEntities(allEntities, patternValidation.compiledPattern, excludeRegex, options.includeUnavailable || false);
            console.log(`RegexQueryCard: Found ${matchedEntities.length} matches for pattern "${options.pattern}"`);
            if (matchedEntities.length > 0) {
                console.log('RegexQueryCard: Sample matches:', matchedEntities.slice(0, 3).map(e => e.entity_id));
            }
            // Limit results if specified
            const limitedEntities = options.maxResults
                ? matchedEntities.slice(0, options.maxResults)
                : matchedEntities;
            const result = {
                entities: limitedEntities,
                totalCount,
                matchedCount: matchedEntities.length,
                performanceMetrics: {
                    matchingTime: performance.now() - startTime,
                    entityCount: totalCount
                }
            };
            // Cache the result
            this.cacheResult(cacheKey, result);
            return result;
        }
        catch (error) {
            return {
                entities: [],
                totalCount: 0,
                matchedCount: 0,
                error: `Entity matching failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                performanceMetrics: {
                    matchingTime: performance.now() - startTime,
                    entityCount: 0
                }
            };
        }
    }
    /**
     * Gets all entities from Home Assistant states
     * @returns Array of entity IDs and their corresponding entities
     */
    getAllEntities() {
        if (!this.hass || !this.hass.states) {
            console.warn('RegexQueryCard: No hass or hass.states available');
            return [];
        }
        const entities = [];
        for (const [entityId, entity] of Object.entries(this.hass.states)) {
            // Skip entities that don't have proper structure
            if (!entity || !entity.entity_id) {
                continue;
            }
            entities.push({ entityId, entity });
        }
        console.log(`RegexQueryCard: Found ${entities.length} total entities`);
        if (entities.length > 0) {
            console.log('RegexQueryCard: Sample entity IDs:', entities.slice(0, 5).map(e => e.entityId));
        }
        return entities;
    }
    /**
     * Filters entities based on include and exclude patterns
     * @param entities Array of entities to filter
     * @param includePattern Compiled regex for inclusion
     * @param excludePattern Optional compiled regex for exclusion
     * @param includeUnavailable Whether to include unavailable entities
     * @returns Filtered array of EntityMatch objects
     */
    filterEntities(entities, includePattern, excludePattern, includeUnavailable = false) {
        const matches = [];
        for (const { entityId, entity } of entities) {
            try {
                // Skip unavailable entities if not requested
                if (!includeUnavailable && this.isEntityUnavailable(entity)) {
                    continue;
                }
                // Test against include pattern
                if (!includePattern.test(entityId)) {
                    continue;
                }
                // Test against exclude pattern if provided
                if (excludePattern && excludePattern.test(entityId)) {
                    continue;
                }
                // Create EntityMatch object
                const entityMatch = {
                    entity_id: entityId,
                    entity: entity,
                    display_name: this.getEntityDisplayName(entity),
                    sort_value: this.getEntitySortValue(entity, 'name') // Default sort by name
                };
                matches.push(entityMatch);
            }
            catch (error) {
                // Skip entities that cause errors during processing
                console.warn(`Error processing entity ${entityId}:`, error);
                continue;
            }
        }
        return matches;
    }
    /**
     * Determines if an entity is unavailable
     * @param entity The entity to check
     * @returns True if entity is unavailable
     */
    isEntityUnavailable(entity) {
        const unavailableStates = ['unavailable', 'unknown', 'none', ''];
        return unavailableStates.includes(entity.state.toLowerCase());
    }
    /**
     * Gets the display name for an entity
     * @param entity The entity
     * @returns Display name (friendly name or entity ID)
     */
    getEntityDisplayName(entity) {
        // Try to get friendly name from attributes
        if (entity.attributes && entity.attributes.friendly_name) {
            return entity.attributes.friendly_name;
        }
        // Fall back to entity ID, but make it more readable
        return entity.entity_id
            .split('.')
            .map(part => part.replace(/_/g, ' '))
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' - ');
    }
    /**
     * Gets the sort value for an entity based on sort criteria
     * @param entity The entity
     * @param sortBy Sort criteria
     * @returns Sort value
     */
    getEntitySortValue(entity, sortBy) {
        switch (sortBy) {
            case 'name':
                return this.getEntityDisplayName(entity).toLowerCase();
            case 'state':
                return entity.state.toLowerCase();
            case 'last_changed':
                return new Date(entity.last_changed).getTime();
            case 'entity_id':
                return entity.entity_id.toLowerCase();
            default:
                return entity.entity_id.toLowerCase();
        }
    }
    /**
     * Creates a cache key for the given options
     * @param options Matching options
     * @returns Cache key string
     */
    createCacheKey(options) {
        return JSON.stringify({
            pattern: options.pattern,
            excludePattern: options.excludePattern || '',
            includeUnavailable: options.includeUnavailable || false,
            maxResults: options.maxResults || 0,
            stateCount: Object.keys(this.hass.states || {}).length
        });
    }
    /**
     * Gets cached result if available and not expired
     * @param cacheKey Cache key
     * @returns Cached result or undefined
     */
    getCachedResult(cacheKey) {
        const cached = this.cachedResults.get(cacheKey);
        if (!cached) {
            return undefined;
        }
        // Check if cache is expired
        const now = Date.now();
        if (now - this.lastMatchTime > this.cacheTimeout) {
            this.cachedResults.delete(cacheKey);
            return undefined;
        }
        return cached;
    }
    /**
     * Caches a result
     * @param cacheKey Cache key
     * @param result Result to cache
     */
    cacheResult(cacheKey, result) {
        this.lastMatchTime = Date.now();
        this.cachedResults.set(cacheKey, result);
        // Limit cache size
        if (this.cachedResults.size > 10) {
            const firstKey = this.cachedResults.keys().next().value;
            if (firstKey) {
                this.cachedResults.delete(firstKey);
            }
        }
    }
    /**
     * Clears the entity matching cache
     */
    clearCache() {
        this.cachedResults.clear();
    }
    /**
     * Gets the current cache size
     */
    getCacheSize() {
        return this.cachedResults.size;
    }
    /**
     * Gets statistics about current entities
     * @returns Entity statistics
     */
    getEntityStats() {
        const allEntities = this.getAllEntities();
        const stats = {
            totalEntities: allEntities.length,
            availableEntities: 0,
            domains: {}
        };
        for (const { entityId, entity } of allEntities) {
            // Count available entities
            if (!this.isEntityUnavailable(entity)) {
                stats.availableEntities++;
            }
            // Count by domain
            const domain = entityId.split('.')[0];
            stats.domains[domain] = (stats.domains[domain] || 0) + 1;
        }
        return stats;
    }
    /**
     * Tests patterns against current entities to provide feedback
     * @param pattern Pattern to test
     * @param excludePattern Optional exclude pattern
     * @returns Test results with sample matches
     */
    async testPatterns(pattern, excludePattern) {
        try {
            const result = await this.matchEntities({
                pattern,
                excludePattern,
                maxResults: 10 // Limit for testing
            });
            if (result.error) {
                return {
                    sampleMatches: [],
                    totalMatches: 0,
                    error: result.error
                };
            }
            return {
                sampleMatches: result.entities.map(e => e.entity_id),
                totalMatches: result.matchedCount
            };
        }
        catch (error) {
            return {
                sampleMatches: [],
                totalMatches: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Gets suggested patterns based on available entities
     * @returns Array of suggested patterns with descriptions
     */
    getSuggestedPatterns() {
        const stats = this.getEntityStats();
        const suggestions = [];
        // Suggest patterns based on available domains
        for (const [domain, count] of Object.entries(stats.domains)) {
            if (count > 0) {
                suggestions.push({
                    pattern: `^${domain}\\.`,
                    description: `All ${domain} entities`,
                    matchCount: count
                });
            }
        }
        // Sort by match count (most common domains first)
        suggestions.sort((a, b) => b.matchCount - a.matchCount);
        return suggestions.slice(0, 8); // Return top 8 suggestions
    }
}

/**
 * Handles entity sorting and limiting functionality
 */
class EntitySorter {
    /**
     * Sorts and limits entities based on configuration
     * @param entities Array of entities to sort
     * @param config Sorting configuration
     * @returns Sorted and limited entities with metadata
     */
    static sortAndLimitEntities(entities, config) {
        const startTime = performance.now();
        const originalCount = entities.length;
        try {
            // Update sort values for all entities based on sort criteria
            const entitiesWithSortValues = entities.map(entity => (Object.assign(Object.assign({}, entity), { sort_value: this.getSortValue(entity, config.sortBy) })));
            // Sort entities
            const sortedEntities = this.sortEntities(entitiesWithSortValues, config);
            // Apply entity limit if specified
            const limitedEntities = config.maxEntities && config.maxEntities > 0
                ? sortedEntities.slice(0, config.maxEntities)
                : sortedEntities;
            return {
                entities: limitedEntities,
                totalCount: originalCount,
                limitedCount: limitedEntities.length,
                sortedBy: config.sortBy,
                sortOrder: config.sortOrder,
                performanceMetrics: {
                    sortingTime: performance.now() - startTime,
                    originalCount
                }
            };
        }
        catch (error) {
            console.error('Error sorting entities:', error);
            // Return original entities if sorting fails
            const limitedEntities = config.maxEntities && config.maxEntities > 0
                ? entities.slice(0, config.maxEntities)
                : entities;
            return {
                entities: limitedEntities,
                totalCount: originalCount,
                limitedCount: limitedEntities.length,
                sortedBy: config.sortBy,
                sortOrder: config.sortOrder,
                performanceMetrics: {
                    sortingTime: performance.now() - startTime,
                    originalCount
                }
            };
        }
    }
    /**
     * Sorts entities based on configuration
     * @param entities Entities with updated sort values
     * @param config Sort configuration
     * @returns Sorted entities
     */
    static sortEntities(entities, config) {
        // Use custom sort function if provided
        if (config.customSortFunction) {
            return [...entities].sort(config.customSortFunction);
        }
        // Standard sorting
        return [...entities].sort((a, b) => {
            const result = this.compareEntities(a, b, config.sortBy);
            return config.sortOrder === 'desc' ? -result : result;
        });
    }
    /**
     * Compares two entities for sorting
     * @param a First entity
     * @param b Second entity
     * @param sortBy Sort criteria
     * @returns Comparison result (-1, 0, 1)
     */
    static compareEntities(a, b, sortBy) {
        const aValue = a.sort_value;
        const bValue = b.sort_value;
        // Handle null/undefined values
        if (aValue == null && bValue == null)
            return 0;
        if (aValue == null)
            return 1;
        if (bValue == null)
            return -1;
        // Type-specific comparison
        switch (sortBy) {
            case 'name':
                return this.compareStrings(aValue, bValue);
            case 'state':
                return this.compareStates(aValue, bValue, a.entity, b.entity);
            case 'last_changed':
                return this.compareNumbers(aValue, bValue);
            default:
                return this.compareStrings(String(aValue), String(bValue));
        }
    }
    /**
     * Compares two strings for sorting
     * @param a First string
     * @param b Second string
     * @returns Comparison result
     */
    static compareStrings(a, b) {
        return a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: 'base'
        });
    }
    /**
     * Compares two numbers for sorting
     * @param a First number
     * @param b Second number
     * @returns Comparison result
     */
    static compareNumbers(a, b) {
        return a - b;
    }
    /**
     * Compares entity states with intelligent handling of different state types
     * @param aState First state value
     * @param bState Second state value
     * @param aEntity First entity (for context)
     * @param bEntity Second entity (for context)
     * @returns Comparison result
     */
    static compareStates(aState, bState, aEntity, bEntity) {
        // Convert states to comparable values
        const aComparable = this.getComparableStateValue(aState, aEntity);
        const bComparable = this.getComparableStateValue(bState, bEntity);
        // Compare based on type
        if (typeof aComparable === 'number' && typeof bComparable === 'number') {
            return aComparable - bComparable;
        }
        return this.compareStrings(String(aComparable), String(bComparable));
    }
    /**
     * Converts a state value to a comparable format
     * @param state State value
     * @param entity Entity for context
     * @returns Comparable value
     */
    static getComparableStateValue(state, entity) {
        const stateStr = String(state).toLowerCase();
        // Handle numeric states
        const numericValue = parseFloat(stateStr);
        if (!isNaN(numericValue)) {
            return numericValue;
        }
        // Handle boolean-like states
        const booleanStates = {
            'on': 1,
            'off': 0,
            'true': 1,
            'false': 0,
            'open': 1,
            'closed': 0,
            'locked': 1,
            'unlocked': 0,
            'home': 1,
            'away': 0,
            'available': 1,
            'unavailable': 0,
            'unknown': -1
        };
        if (stateStr in booleanStates) {
            return booleanStates[stateStr];
        }
        // Handle special states
        if (stateStr === 'unavailable' || stateStr === 'unknown') {
            return -999; // Sort unavailable/unknown to end
        }
        // Return string for text comparison
        return stateStr;
    }
    /**
     * Gets the sort value for an entity based on sort criteria
     * @param entity Entity to get sort value for
     * @param sortBy Sort criteria
     * @returns Sort value
     */
    static getSortValue(entity, sortBy) {
        switch (sortBy) {
            case 'name':
                return entity.display_name.toLowerCase();
            case 'state':
                return entity.entity.state;
            case 'last_changed':
                return new Date(entity.entity.last_changed).getTime();
            default:
                return entity.entity_id.toLowerCase();
        }
    }
    /**
     * Creates a multi-level sort configuration
     * @param primarySort Primary sort criteria
     * @param secondarySort Optional secondary sort criteria
     * @param tertiarySort Optional tertiary sort criteria
     * @returns Custom sort function
     */
    static createMultiLevelSort(primarySort, secondarySort, tertiarySort) {
        return (a, b) => {
            // Update sort values for primary sort
            const aPrimary = this.getSortValue(a, primarySort.sortBy);
            const bPrimary = this.getSortValue(b, primarySort.sortBy);
            let result = this.compareEntities(Object.assign(Object.assign({}, a), { sort_value: aPrimary }), Object.assign(Object.assign({}, b), { sort_value: bPrimary }), primarySort.sortBy);
            if (primarySort.sortOrder === 'desc') {
                result = -result;
            }
            // If primary sort is equal, try secondary sort
            if (result === 0 && secondarySort) {
                const aSecondary = this.getSortValue(a, secondarySort.sortBy);
                const bSecondary = this.getSortValue(b, secondarySort.sortBy);
                result = this.compareEntities(Object.assign(Object.assign({}, a), { sort_value: aSecondary }), Object.assign(Object.assign({}, b), { sort_value: bSecondary }), secondarySort.sortBy);
                if (secondarySort.sortOrder === 'desc') {
                    result = -result;
                }
                // If secondary sort is equal, try tertiary sort
                if (result === 0 && tertiarySort) {
                    const aTertiary = this.getSortValue(a, tertiarySort.sortBy);
                    const bTertiary = this.getSortValue(b, tertiarySort.sortBy);
                    result = this.compareEntities(Object.assign(Object.assign({}, a), { sort_value: aTertiary }), Object.assign(Object.assign({}, b), { sort_value: bTertiary }), tertiarySort.sortBy);
                    if (tertiarySort.sortOrder === 'desc') {
                        result = -result;
                    }
                }
            }
            return result;
        };
    }
    /**
     * Applies intelligent limiting based on entity importance
     * @param entities Sorted entities
     * @param maxEntities Maximum number of entities
     * @param prioritizeAvailable Whether to prioritize available entities
     * @returns Limited entities with priority handling
     */
    static intelligentLimit(entities, maxEntities, prioritizeAvailable = true) {
        if (entities.length <= maxEntities) {
            return entities;
        }
        if (!prioritizeAvailable) {
            return entities.slice(0, maxEntities);
        }
        // Separate available and unavailable entities
        const available = [];
        const unavailable = [];
        for (const entity of entities) {
            const state = entity.entity.state.toLowerCase();
            if (state === 'unavailable' || state === 'unknown') {
                unavailable.push(entity);
            }
            else {
                available.push(entity);
            }
        }
        // Prioritize available entities
        const result = [];
        // Add available entities first
        const availableToAdd = Math.min(available.length, maxEntities);
        result.push(...available.slice(0, availableToAdd));
        // Fill remaining slots with unavailable entities if needed
        const remainingSlots = maxEntities - result.length;
        if (remainingSlots > 0) {
            result.push(...unavailable.slice(0, remainingSlots));
        }
        return result;
    }
    /**
     * Groups entities by a specific criteria before sorting
     * @param entities Entities to group and sort
     * @param groupBy Grouping criteria
     * @param sortConfig Sort configuration for each group
     * @returns Grouped and sorted entities
     */
    static groupAndSort(entities, groupBy, sortConfig) {
        // Group entities
        const groups = {};
        for (const entity of entities) {
            let groupKey;
            switch (groupBy) {
                case 'domain':
                    groupKey = entity.entity_id.split('.')[0];
                    break;
                case 'state':
                    groupKey = entity.entity.state;
                    break;
                case 'area':
                    groupKey = entity.entity.attributes.area_id || 'no_area';
                    break;
                default:
                    groupKey = 'default';
            }
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(entity);
        }
        // Sort each group
        const sortedGroups = {};
        for (const [groupKey, groupEntities] of Object.entries(groups)) {
            const sortResult = this.sortAndLimitEntities(groupEntities, sortConfig);
            sortedGroups[groupKey] = sortResult.entities;
        }
        return sortedGroups;
    }
    /**
     * Validates sort configuration
     * @param config Sort configuration to validate
     * @returns Validation result with any errors
     */
    static validateSortConfig(config) {
        const errors = [];
        // Validate sortBy
        const validSortBy = ['name', 'state', 'last_changed'];
        if (!validSortBy.includes(config.sortBy)) {
            errors.push(`Invalid sortBy value: ${config.sortBy}. Must be one of: ${validSortBy.join(', ')}`);
        }
        // Validate sortOrder
        const validSortOrder = ['asc', 'desc'];
        if (!validSortOrder.includes(config.sortOrder)) {
            errors.push(`Invalid sortOrder value: ${config.sortOrder}. Must be one of: ${validSortOrder.join(', ')}`);
        }
        // Validate maxEntities
        if (config.maxEntities !== undefined) {
            if (!Number.isInteger(config.maxEntities) || config.maxEntities < 0) {
                errors.push('maxEntities must be a non-negative integer');
            }
            if (config.maxEntities > 1000) {
                errors.push('maxEntities should not exceed 1000 for performance reasons');
            }
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * Gets performance-optimized sort configuration for large entity sets
     * @param entityCount Number of entities to sort
     * @returns Optimized sort configuration
     */
    static getOptimizedSortConfig(entityCount) {
        if (entityCount > 500) {
            // For large sets, use simpler sorting and limit results
            return {
                sortBy: 'name', // Name sorting is generally fastest
                maxEntities: 100 // Limit to prevent UI performance issues
            };
        }
        if (entityCount > 100) {
            return {
                maxEntities: 200
            };
        }
        // No optimization needed for small sets
        return {};
    }
}

/**
 * Main card component that extends LitElement with Home Assistant card interface
 */
let HaRegexQueryCard = class HaRegexQueryCard extends i {
    constructor() {
        super(...arguments);
        // Internal card state - reactive state
        this._cardState = {
            entities: [],
            loading: false,
            error: undefined,
            pattern_valid: true
        };
        // Connection state tracking
        this._connected = false;
        // Last known entity count for change detection
        this._lastEntityCount = 0;
        // Entity state tracking for change detection
        this._entityStates = new Map();
        // Update frequency control
        this._lastUpdateTime = 0;
        this._minUpdateInterval = 1000; // Minimum 1 second between updates
        // Performance monitoring
        this._performanceMetrics = {
            lastRenderTime: 0,
            entityCount: 0,
            updateCount: 0
        };
    }
    /**
     * Provides default configuration for card picker
     * Required by LovelaceCard interface
     */
    static getStubConfig() {
        return {
            type: 'custom:ha-regex-query-card',
            pattern: '.*',
            title: 'All Entities (Debug)',
            display_type: 'list',
            sort_by: 'name',
            max_entities: 10
        };
    }
    /**
     * Sets the card configuration
     * Required by LovelaceCard interface
     */
    setConfig(config) {
        console.log('RegexQueryCard: setConfig called with:', config);
        if (!config) {
            throw new Error('Invalid configuration');
        }
        if (!config.pattern) {
            throw new Error('Pattern is required');
        }
        if (!config.type || config.type !== 'custom:ha-regex-query-card') {
            throw new Error('Invalid card type');
        }
        // Validate display_type
        const displayType = config.display_type || 'list';
        if (!['list', 'grid'].includes(displayType)) {
            throw new Error('display_type must be "list" or "grid"');
        }
        // Validate columns for grid display
        if (displayType === 'grid' && config.columns) {
            if (config.columns < 1 || config.columns > 6) {
                throw new Error('columns must be between 1 and 6');
            }
        }
        // Validate sort options
        if (config.sort_by && !['name', 'state', 'last_changed'].includes(config.sort_by)) {
            throw new Error('sort_by must be "name", "state", or "last_changed"');
        }
        if (config.sort_order && !['asc', 'desc'].includes(config.sort_order)) {
            throw new Error('sort_order must be "asc" or "desc"');
        }
        // Validate max_entities
        if (config.max_entities && (config.max_entities < 1 || config.max_entities > 1000)) {
            throw new Error('max_entities must be between 1 and 1000');
        }
        this.config = Object.assign(Object.assign({ 
            // Set defaults
            columns: 3, sort_by: 'name', sort_order: 'asc', show_name: true, show_state: true, show_icon: true }, config), { display_type: config.display_type || 'list' });
        // Reset state when config changes
        this._cardState = {
            entities: [],
            loading: false,
            error: undefined,
            pattern_valid: true
        };
        // Trigger entity update if we have hass
        if (this.hass) {
            console.log('RegexQueryCard: Hass available, scheduling entity update');
            this._scheduleEntityUpdate();
        }
        else {
            console.log('RegexQueryCard: No hass available yet');
        }
    }
    /**
     * Gets the card size for layout purposes
     * Required by LovelaceCard interface
     */
    getCardSize() {
        if (!this.config || this._cardState.loading) {
            return 1; // Minimum size during loading
        }
        const entityCount = this._cardState.entities.length;
        if (entityCount === 0) {
            return 1; // Empty state
        }
        // Calculate size based on display mode
        if (this.config.display_type === 'grid') {
            const columns = this.config.columns || 3;
            const rows = Math.ceil(entityCount / columns);
            return Math.max(1, Math.min(rows + 1, 10)); // +1 for header, max 10
        }
        else {
            // List mode: each entity takes about 0.5 card units
            const listSize = Math.ceil(entityCount * 0.5) + 1; // +1 for header
            return Math.max(1, Math.min(listSize, 15)); // Max 15 for very long lists
        }
    }
    /**
     * Called when the element is connected to the DOM
     */
    connectedCallback() {
        super.connectedCallback();
        console.log('RegexQueryCard: connectedCallback - element connected to DOM');
        this._connected = true;
        // Initialize entity matcher if we have hass
        if (this.hass) {
            console.log('RegexQueryCard: Hass available in connectedCallback, initializing');
            this._initializeEntityMatcher();
            this._subscribeToStateChanges();
        }
        else {
            console.log('RegexQueryCard: No hass in connectedCallback');
        }
    }
    /**
     * Called when the element is disconnected from the DOM
     */
    disconnectedCallback() {
        super.disconnectedCallback();
        this._connected = false;
        // Clear any pending timers
        if (this._updateTimer) {
            clearTimeout(this._updateTimer);
            this._updateTimer = undefined;
        }
        // Unsubscribe from state changes
        this._unsubscribeFromStateChanges();
    }
    /**
     * Called when properties change
     */
    updated(changedProps) {
        super.updated(changedProps);
        console.log('RegexQueryCard: updated called with changed props:', Array.from(changedProps.keys()));
        // Handle hass changes
        if (changedProps.has('hass')) {
            console.log('RegexQueryCard: Hass property changed');
            this._handleHassChange(changedProps);
        }
        // Handle config changes
        if (changedProps.has('config')) {
            console.log('RegexQueryCard: Config property changed');
            this._handleConfigChange();
        }
    }
    /**
     * Handles Home Assistant instance changes
     */
    _handleHassChange(changedProps) {
        const oldHass = changedProps === null || changedProps === void 0 ? void 0 : changedProps.get('hass');
        if (!this.hass) {
            this._cardState = Object.assign(Object.assign({}, this._cardState), { loading: false, error: 'Home Assistant not available' });
            this._unsubscribeFromStateChanges();
            return;
        }
        // Initialize or update entity matcher
        if (!this._entityMatcher) {
            this._initializeEntityMatcher();
        }
        else {
            this._entityMatcher.updateHass(this.hass);
        }
        // Subscribe to state changes if this is a new hass instance
        if (!oldHass || oldHass !== this.hass) {
            this._subscribeToStateChanges();
        }
        // Check for entity changes
        this._checkForEntityChanges();
        // Clear connection errors
        if (this._cardState.error === 'Home Assistant not available') {
            this._cardState = Object.assign(Object.assign({}, this._cardState), { error: undefined });
        }
    }
    /**
     * Handles configuration changes
     */
    _handleConfigChange() {
        if (this.config && this.hass) {
            this._scheduleEntityUpdate();
        }
    }
    /**
     * Initializes the entity matcher
     */
    _initializeEntityMatcher() {
        if (!this.hass)
            return;
        this._entityMatcher = new EntityMatcher(this.hass);
        this._lastEntityCount = Object.keys(this.hass.states || {}).length;
        // Trigger initial entity update
        if (this.config) {
            this._scheduleEntityUpdate();
        }
    }
    /**
     * Schedules an entity update with debouncing
     */
    _scheduleEntityUpdate() {
        if (this._updateTimer) {
            clearTimeout(this._updateTimer);
        }
        this._updateTimer = window.setTimeout(() => {
            this._updateEntities();
        }, 100); // 100ms debounce
    }
    /**
     * Updates the entity list based on current configuration
     */
    async _updateEntities() {
        console.log('RegexQueryCard: _updateEntities called');
        if (!this.config || !this._entityMatcher || !this._connected) {
            console.log('RegexQueryCard: Skipping update - missing config, matcher, or not connected', {
                hasConfig: !!this.config,
                hasMatcher: !!this._entityMatcher,
                connected: this._connected
            });
            return;
        }
        console.log('RegexQueryCard: Starting entity update with pattern:', this.config.pattern);
        // Throttle updates to prevent excessive re-rendering
        const now = Date.now();
        if (now - this._lastUpdateTime < this._minUpdateInterval) {
            console.log('RegexQueryCard: Throttling update');
            return;
        }
        this._lastUpdateTime = now;
        // Set loading state
        this._cardState = Object.assign(Object.assign({}, this._cardState), { loading: true, error: undefined });
        try {
            // Match entities using the configured pattern
            const matchResult = await this._entityMatcher.matchEntities({
                pattern: this.config.pattern,
                excludePattern: this.config.exclude_pattern,
                includeUnavailable: false,
                maxResults: this.config.max_entities
            });
            console.log('RegexQueryCard: Match result:', {
                entityCount: matchResult.entities.length,
                totalCount: matchResult.totalCount,
                error: matchResult.error
            });
            if (matchResult.error) {
                this._cardState = Object.assign(Object.assign({}, this._cardState), { loading: false, error: matchResult.error, pattern_valid: false, entities: [] });
                return;
            }
            // Sort the matched entities
            const sortResult = EntitySorter.sortAndLimitEntities(matchResult.entities, {
                sortBy: this.config.sort_by || 'name',
                sortOrder: this.config.sort_order || 'asc',
                maxEntities: this.config.max_entities
            });
            const sortedEntities = sortResult.entities;
            // Update performance metrics
            this._performanceMetrics = {
                lastRenderTime: matchResult.performanceMetrics.matchingTime,
                entityCount: sortedEntities.length,
                updateCount: this._performanceMetrics.updateCount + 1
            };
            // Update entity state tracking
            this._updateEntityStateTracking(sortedEntities);
            // Update state with successful results
            this._cardState = {
                entities: sortedEntities,
                loading: false,
                error: undefined,
                pattern_valid: true
            };
        }
        catch (error) {
            console.error('Error updating entities:', error);
            this._cardState = Object.assign(Object.assign({}, this._cardState), { loading: false, error: error instanceof Error ? error.message : 'Unknown error occurred', pattern_valid: false, entities: [] });
        }
    }
    /**
     * Subscribes to Home Assistant state changes
     */
    _subscribeToStateChanges() {
        if (!this.hass || !this.hass.connection) {
            return;
        }
        // Unsubscribe from previous subscription
        this._unsubscribeFromStateChanges();
        try {
            // Subscribe to state changes
            this._unsubscribeStateChanges = this.hass.connection.subscribeEvents((event) => this._handleStateChanged(event), 'state_changed');
        }
        catch (error) {
            console.warn('Failed to subscribe to state changes:', error);
        }
    }
    /**
     * Unsubscribes from Home Assistant state changes
     */
    _unsubscribeFromStateChanges() {
        if (this._unsubscribeStateChanges && typeof this._unsubscribeStateChanges === 'function') {
            this._unsubscribeStateChanges();
            this._unsubscribeStateChanges = undefined;
        }
    }
    /**
     * Handles individual state change events
     */
    _handleStateChanged(event) {
        if (!this.config || !event.data) {
            return;
        }
        const { entity_id} = event.data;
        // Check if this entity might be relevant to our pattern
        if (this._isEntityRelevant(entity_id)) {
            // Schedule an update, but debounced
            this._scheduleEntityUpdate();
        }
    }
    /**
     * Checks if an entity is potentially relevant to our current pattern
     */
    _isEntityRelevant(entityId) {
        var _a;
        if (!((_a = this.config) === null || _a === void 0 ? void 0 : _a.pattern)) {
            return false;
        }
        try {
            // Quick check if entity might match our pattern
            const regex = new RegExp(this.config.pattern, 'i');
            return regex.test(entityId);
        }
        catch (error) {
            // If pattern is invalid, assume all entities are relevant
            return true;
        }
    }
    /**
     * Checks for entity additions and removals
     */
    _checkForEntityChanges() {
        if (!this.hass) {
            return;
        }
        const currentEntityCount = Object.keys(this.hass.states || {}).length;
        // If entity count changed significantly, update immediately
        if (Math.abs(currentEntityCount - this._lastEntityCount) > 0) {
            this._lastEntityCount = currentEntityCount;
            this._scheduleEntityUpdate();
        }
    }
    /**
     * Updates entity state tracking for change detection
     */
    _updateEntityStateTracking(entities) {
        const newStates = new Map();
        for (const entityMatch of entities) {
            newStates.set(entityMatch.entity_id, entityMatch.entity.state);
        }
        this._entityStates = newStates;
    }
    /**
     * Checks if any tracked entity states have changed
     */
    _hasEntityStatesChanged(entities) {
        for (const entityMatch of entities) {
            const oldState = this._entityStates.get(entityMatch.entity_id);
            if (oldState !== entityMatch.entity.state) {
                return true;
            }
        }
        return false;
    }
    /**
     * Gets performance metrics for debugging
     */
    getPerformanceMetrics() {
        var _a, _b;
        return Object.assign(Object.assign({}, this._performanceMetrics), { cacheSize: ((_b = (_a = this._entityMatcher) === null || _a === void 0 ? void 0 : _a.getCacheSize) === null || _b === void 0 ? void 0 : _b.call(_a)) || 0, lastUpdateTime: this._lastUpdateTime, connectedTime: this._connected ? Date.now() - this._lastUpdateTime : 0 });
    }
    /**
     * Forces a refresh of entity data
     */
    async refreshEntities() {
        if (this._entityMatcher) {
            this._entityMatcher.clearCache();
        }
        this._lastUpdateTime = 0; // Reset throttle
        await this._updateEntities();
    }
    /**
     * Renders the card content
     */
    render() {
        if (!this.config) {
            return x `
        <ha-card>
          <div class="card-content">
            <div class="error">
              Card configuration is required
            </div>
          </div>
        </ha-card>
      `;
        }
        return x `
      <ha-card>
        ${this.config.title ? x `
          <div class="card-header">
            <div class="name">${this.config.title}</div>
          </div>
        ` : ''}
        
        <div class="card-content">
          ${this._renderCardContent()}
        </div>
      </ha-card>
    `;
    }
    /**
     * Renders the main card content based on current state
     */
    _renderCardContent() {
        var _a;
        console.log('RegexQueryCard: _renderCardContent called with state:', {
            loading: this._cardState.loading,
            error: this._cardState.error,
            entityCount: this._cardState.entities.length,
            entities: this._cardState.entities.slice(0, 3).map(e => e.entity_id)
        });
        // Show loading state
        if (this._cardState.loading) {
            console.log('RegexQueryCard: Rendering loading state');
            return x `
        <div class="loading">
          <ha-circular-progress active></ha-circular-progress>
          <div class="loading-text">Loading entities...</div>
        </div>
      `;
        }
        // Show error state
        if (this._cardState.error) {
            console.log('RegexQueryCard: Rendering error state:', this._cardState.error);
            return x `
        <div class="error">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <div class="error-text">${this._cardState.error}</div>
        </div>
      `;
        }
        // Show empty state
        if (this._cardState.entities.length === 0) {
            console.log('RegexQueryCard: Rendering empty state - no entities');
            return x `
        <div class="empty">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <div class="empty-text">
            No entities match the pattern "${(_a = this.config) === null || _a === void 0 ? void 0 : _a.pattern}"
          </div>
        </div>
      `;
        }
        // Show entities based on display mode
        console.log('RegexQueryCard: Rendering entities');
        return this._renderEntities();
    }
    /**
     * Renders entities using the entity renderer component
     */
    _renderEntities() {
        return x `
      <ha-regex-entity-renderer
        .hass=${this.hass}
        .config=${this.config}
        .entities=${this._cardState.entities}
        .loading=${this._cardState.loading}
        .error=${this._cardState.error}
        @hass-more-info=${this._handleEntityMoreInfo}
        @entity-action=${this._handleEntityAction}
      ></ha-regex-entity-renderer>
    `;
    }
    /**
     * Handles entity more-info events from the renderer
     */
    _handleEntityMoreInfo(event) {
        // Re-dispatch the event to bubble up to Home Assistant
        const newEvent = new CustomEvent('hass-more-info', {
            detail: event.detail,
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(newEvent);
    }
    /**
     * Handles entity action events from the renderer
     */
    _handleEntityAction(event) {
        const { type, entity_id, error } = event.detail;
        if (type === 'success') {
            // Optionally show success feedback
            console.debug(`Entity action successful for ${entity_id}`);
        }
        else if (type === 'error') {
            // Handle action errors
            console.error(`Entity action failed for ${entity_id}:`, error);
            // Optionally show error toast or notification
            // This could be extended to show user-visible error messages
        }
        // Re-dispatch for external handling if needed
        const newEvent = new CustomEvent('regex-card-entity-action', {
            detail: event.detail,
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(newEvent);
    }
};
/**
 * Card styles
 */
HaRegexQueryCard.styles = i$3 `
    :host {
      display: block;
    }

    ha-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .card-header {
      padding: 16px 16px 0;
    }

    .card-header .name {
      font-size: 1.2em;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .card-content {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    /* Loading state */
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      color: var(--secondary-text-color);
    }

    .loading-text {
      margin-top: 16px;
      font-size: 0.9em;
    }

    /* Error state */
    .error {
      display: flex;
      align-items: center;
      padding: 16px;
      background: var(--error-color, #f44336);
      color: white;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .error ha-icon {
      margin-right: 8px;
      --mdc-icon-size: 20px;
    }

    .error-text {
      flex: 1;
      font-size: 0.9em;
    }

    /* Empty state */
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      color: var(--secondary-text-color);
      text-align: center;
    }

    .empty ha-icon {
      --mdc-icon-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 0.9em;
      line-height: 1.4;
    }

    /* Responsive design */
    @media (max-width: 600px) {
      .card-content {
        padding: 12px;
      }
    }
  `;
__decorate([
    n({ attribute: false })
], HaRegexQueryCard.prototype, "hass", void 0);
__decorate([
    n({ attribute: false })
], HaRegexQueryCard.prototype, "config", void 0);
__decorate([
    r()
], HaRegexQueryCard.prototype, "_cardState", void 0);
HaRegexQueryCard = __decorate([
    t('ha-regex-query-card')
], HaRegexQueryCard);
// Register with Home Assistant's card registry
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'ha-regex-query-card',
    name: 'Regex Query Card',
    description: 'Display entities matching regex patterns',
    preview: false,
    documentationURL: 'https://github.com/t8bloom1/ha-regex-query-card',
    getConfigElement: () => document.createElement('ha-regex-query-card-editor'),
    getStubConfig: () => ({
        type: 'custom:ha-regex-query-card',
        pattern: '.*',
        title: 'All Entities (Debug)',
        display_type: 'list',
        sort_by: 'name',
        max_entities: 10
    })
});
console.info(`%c  REGEX-QUERY-CARD  %c  v1.0.1  `, 'color: orange; font-weight: bold; background: black', 'color: white; font-weight: bold; background: dimgray');

export { HaRegexQueryCard };
//# sourceMappingURL=ha-regex-query-card.js.map
