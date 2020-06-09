(window.webpackJsonp=window.webpackJsonp||[]).push([[25],{124:function(e,n,t){"use strict";t.r(n),t.d(n,"frontMatter",(function(){return c})),t.d(n,"metadata",(function(){return a})),t.d(n,"rightToc",(function(){return s})),t.d(n,"default",(function(){return l}));var r=t(2),o=t(6),i=(t(0),t(133)),c={title:":consistent-versions"},a={id:"rules/consistent-versions",title:":consistent-versions",description:"Ensure that all packages use the same version of a dependency, when present in either dependencies or devDependencies.",source:"@site/docs/rules/consistent-versions.md",permalink:"/docs/rules/consistent-versions",editUrl:"https://github.com/monorepolint/monorepolint/edit/master/packages/docs/docs/rules/consistent-versions.md",sidebar:"docs",previous:{title:":consistent-dependencies",permalink:"/docs/rules/consistent-dependencies"},next:{title:":file-contents",permalink:"/docs/rules/file-contents"}},s=[{value:"Options",id:"options",children:[]},{value:"Example",id:"example",children:[]}],p={rightToc:s};function l(e){var n=e.components,t=Object(o.a)(e,["components"]);return Object(i.b)("wrapper",Object(r.a)({},p,t,{components:n,mdxType:"MDXLayout"}),Object(i.b)("p",null,"Ensure that all packages use the same version of a dependency, when present in either ",Object(i.b)("inlineCode",{parentName:"p"},"dependencies")," or ",Object(i.b)("inlineCode",{parentName:"p"},"devDependencies"),".\nNote that this is different from ",Object(i.b)("a",Object(r.a)({parentName:"p"},{href:"#require-dependency"}),"require-dependency")," which will require the dependency to exist\nfor all packages, not just enforce consistent versions when present."),Object(i.b)("h3",{id:"options"},"Options"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("inlineCode",{parentName:"li"},"matchDependencyVersions"),Object(i.b)("ul",{parentName:"li"},Object(i.b)("li",{parentName:"ul"},"Map from dependency name to version")))),Object(i.b)("h3",{id:"example"},"Example"),Object(i.b)("pre",null,Object(i.b)("code",Object(r.a)({parentName:"pre"},{className:"language-javascript"}),'module.exports = {\n  rules: {\n    ":consistent-versions": {\n      options: {\n        matchDependencyVersions: {\n          "@types/react": "^16.9.19",\n          "@types/react-dom": "^16.9.5",\n        },\n      },\n    },\n  },\n};\n')),Object(i.b)("p",null,Object(i.b)("a",Object(r.a)({parentName:"p"},{href:"https://github.com/monorepolint/monorepolint/blob/master/packages/rules/src/consistentVersions.ts"}),"rule source")))}l.isMDXComponent=!0},133:function(e,n,t){"use strict";t.d(n,"a",(function(){return u})),t.d(n,"b",(function(){return m}));var r=t(0),o=t.n(r);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function c(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?c(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):c(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,r,o=function(e,n){if(null==e)return{};var t,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var p=o.a.createContext({}),l=function(e){var n=o.a.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},u=function(e){var n=l(e.components);return o.a.createElement(p.Provider,{value:n},e.children)},d={inlineCode:"code",wrapper:function(e){var n=e.children;return o.a.createElement(o.a.Fragment,{},n)}},b=o.a.forwardRef((function(e,n){var t=e.components,r=e.mdxType,i=e.originalType,c=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=l(t),b=r,m=u["".concat(c,".").concat(b)]||u[b]||d[b]||i;return t?o.a.createElement(m,a(a({ref:n},p),{},{components:t})):o.a.createElement(m,a({ref:n},p))}));function m(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var i=t.length,c=new Array(i);c[0]=b;var a={};for(var s in n)hasOwnProperty.call(n,s)&&(a[s]=n[s]);a.originalType=e,a.mdxType="string"==typeof e?e:r,c[1]=a;for(var p=2;p<i;p++)c[p]=t[p];return o.a.createElement.apply(null,c)}return o.a.createElement.apply(null,t)}b.displayName="MDXCreateElement"}}]);