(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{101:function(e,n,r){"use strict";r.r(n),r.d(n,"frontMatter",(function(){return c})),r.d(n,"metadata",(function(){return i})),r.d(n,"rightToc",(function(){return p})),r.d(n,"default",(function(){return s}));var t=r(2),a=r(6),o=(r(0),r(133)),c={title:":package-order"},i={id:"rules/package-order",title:":package-order",description:"Standardize entry order in package.json.",source:"@site/docs/rules/package-order.md",permalink:"/docs/rules/package-order",editUrl:"https://github.com/monorepolint/monorepolint/edit/master/packages/docs/docs/rules/package-order.md",sidebar:"docs",previous:{title:":package-entry",permalink:"/docs/rules/package-entry"},next:{title:":package-script",permalink:"/docs/rules/package-script"}},p=[{value:"Options",id:"options",children:[]},{value:"Example",id:"example",children:[]}],l={rightToc:p};function s(e){var n=e.components,r=Object(a.a)(e,["components"]);return Object(o.b)("wrapper",Object(t.a)({},l,r,{components:n,mdxType:"MDXLayout"}),Object(o.b)("p",null,"Standardize entry order in package.json."),Object(o.b)("h3",{id:"options"},"Options"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"order")," (Optional)",Object(o.b)("ul",{parentName:"li"},Object(o.b)("li",{parentName:"ul"},"Either a comparator function on keys or an array of expected package order. If a a key is missing from this array, it will be at the bottom of the package.json. If missing, uses a default ordering found below.")))),Object(o.b)("h3",{id:"example"},"Example"),Object(o.b)("pre",null,Object(o.b)("code",Object(t.a)({parentName:"pre"},{className:"language-javascript"}),'module.exports = {\n  rules: {\n    ":package-order": {\n      options: {\n        order: [\n          "name",\n          "version",\n          "author",\n          "contributors",\n          "url",\n          "license",\n          "private",\n          "engines",\n          "bin",\n          "main",\n          "module",\n          "typings",\n          "style",\n          "sideEffects",\n          "workspaces",\n          "husky",\n          "lint-staged",\n          "files",\n          "scripts",\n          "resolutions",\n          "dependencies",\n          "peerDependencies",\n          "devDependencies",\n          "optionalDependencies",\n          "publishConfig",\n        ],\n      },\n    },\n  },\n};\n')),Object(o.b)("p",null,Object(o.b)("a",Object(t.a)({parentName:"p"},{href:"https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/packageOrder.ts"}),"rule source")))}s.isMDXComponent=!0},133:function(e,n,r){"use strict";r.d(n,"a",(function(){return u})),r.d(n,"b",(function(){return m}));var t=r(0),a=r.n(t);function o(e,n,r){return n in e?Object.defineProperty(e,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[n]=r,e}function c(e,n){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),r.push.apply(r,t)}return r}function i(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?c(Object(r),!0).forEach((function(n){o(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):c(Object(r)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))}))}return e}function p(e,n){if(null==e)return{};var r,t,a=function(e,n){if(null==e)return{};var r,t,a={},o=Object.keys(e);for(t=0;t<o.length;t++)r=o[t],n.indexOf(r)>=0||(a[r]=e[r]);return a}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(t=0;t<o.length;t++)r=o[t],n.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=a.a.createContext({}),s=function(e){var n=a.a.useContext(l),r=n;return e&&(r="function"==typeof e?e(n):i(i({},n),e)),r},u=function(e){var n=s(e.components);return a.a.createElement(l.Provider,{value:n},e.children)},d={inlineCode:"code",wrapper:function(e){var n=e.children;return a.a.createElement(a.a.Fragment,{},n)}},b=a.a.forwardRef((function(e,n){var r=e.components,t=e.mdxType,o=e.originalType,c=e.parentName,l=p(e,["components","mdxType","originalType","parentName"]),u=s(r),b=t,m=u["".concat(c,".").concat(b)]||u[b]||d[b]||o;return r?a.a.createElement(m,i(i({ref:n},l),{},{components:r})):a.a.createElement(m,i({ref:n},l))}));function m(e,n){var r=arguments,t=n&&n.mdxType;if("string"==typeof e||t){var o=r.length,c=new Array(o);c[0]=b;var i={};for(var p in n)hasOwnProperty.call(n,p)&&(i[p]=n[p]);i.originalType=e,i.mdxType="string"==typeof e?e:t,c[1]=i;for(var l=2;l<o;l++)c[l]=r[l];return a.a.createElement.apply(null,c)}return a.a.createElement.apply(null,r)}b.displayName="MDXCreateElement"}}]);