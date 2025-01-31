"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[718],{3301:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>i,contentTitle:()=>a,default:()=>d,frontMatter:()=>c,metadata:()=>r,toc:()=>l});const r=JSON.parse('{"id":"rules/package-entry","title":"packageEntry","description":"source","source":"@site/docs/rules/package-entry.md","sourceDirName":"rules","slug":"/rules/package-entry","permalink":"/docs/rules/package-entry","draft":false,"unlisted":false,"editUrl":"https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/rules/package-entry.md","tags":[],"version":"current","frontMatter":{"title":"packageEntry"},"sidebar":"docs","previous":{"title":"oncePerPackage","permalink":"/docs/rules/once-per-package"},"next":{"title":"packageOrder","permalink":"/docs/rules/package-order"}}');var s=t(612),o=t(9383);const c={title:"packageEntry"},a=void 0,i={},l=[{value:"Options",id:"options",level:3},{value:"Example",id:"example",level:3}];function p(e){const n={a:"a",code:"code",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,o.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/packageEntry.ts",children:"source"})}),"\n",(0,s.jsx)(n.p,{children:"Standardize arbitrary entries in package.json."}),"\n",(0,s.jsx)(n.h3,{id:"options",children:"Options"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"entries"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"An object of expected key value pairs for the package.json"}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"entriesExists"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"An array of expected keys to exist in package.json (without any value enforcement)"}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-javascript",children:'import { packageEntry } from "@monorepolint/rules";\nexport default {\n  rules: [\n    packageEntry({\n      options: {\n        entries: {\n          author: "Eric L Anderson (https://github.com/ericanderson)",\n        },\n        entriesExists: ["bugs"],\n      },\n    }),\n  ],\n};\n'})})]})}function d(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(p,{...e})}):p(e)}},9383:(e,n,t)=>{t.d(n,{R:()=>c,x:()=>a});var r=t(4344);const s={},o=r.createContext(s);function c(e){const n=r.useContext(o);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:c(e.components),r.createElement(o.Provider,{value:n},e.children)}}}]);