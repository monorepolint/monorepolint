"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[991],{1147:(e,r,o)=>{o.r(r),o.d(r,{assets:()=>l,contentTitle:()=>c,default:()=>u,frontMatter:()=>i,metadata:()=>n,toc:()=>a});const n=JSON.parse('{"id":"rules/force-error","title":"forceError","description":"The forceError rule is designed to induce an intentional error condition, which can serve as a foundational component for other rules or as an effective debugging tool.","source":"@site/docs/rules/force-error.md","sourceDirName":"rules","slug":"/rules/force-error","permalink":"/docs/rules/force-error","draft":false,"unlisted":false,"editUrl":"https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/rules/force-error.md","tags":[],"version":"current","frontMatter":{"title":"forceError"},"sidebar":"docs","previous":{"title":"fileContents","permalink":"/docs/rules/file-contents"},"next":{"title":"mustSatisfyPeerDependencies","permalink":"/docs/rules/must-satisfy-peer-dependencies"}}');var t=o(4489),s=o(9725);const i={title:"forceError"},c=void 0,l={},a=[{value:"Overview",id:"overview",level:2},{value:"Usage",id:"usage",level:3},{value:"Reference",id:"reference",level:2}];function d(e){const r={a:"a",code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",...(0,s.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(r.p,{children:["The ",(0,t.jsx)(r.code,{children:"forceError"})," rule is designed to induce an intentional error condition, which can serve as a foundational component for other rules or as an effective debugging tool."]}),"\n",(0,t.jsx)(r.h2,{id:"overview",children:"Overview"}),"\n",(0,t.jsxs)(r.p,{children:["The ",(0,t.jsx)(r.code,{children:"forceError"})," rule is helpful as a building block for other rules or as a debugging tool."]}),"\n",(0,t.jsx)(r.h3,{id:"usage",children:"Usage"}),"\n",(0,t.jsxs)(r.p,{children:["Below is an example of how to implement the ",(0,t.jsx)(r.code,{children:"forceError"})," rule in your project:"]}),"\n",(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-javascript",children:'import { forceError } from "@monorepolint/rules";\n\nexport default {\n  rules: [\n    forceError({\n      options: {\n        customMessage: "Let\'s always trigger an error",\n      },\n    }),\n  ],\n};\n'})}),"\n",(0,t.jsx)(r.h2,{id:"reference",children:"Reference"}),"\n",(0,t.jsxs)(r.p,{children:["For more information and to view the source code of this rule, please visit the ",(0,t.jsx)(r.a,{href:"https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/forceError.ts",children:"rule source"})," in the monorepolint repository."]})]})}function u(e={}){const{wrapper:r}={...(0,s.R)(),...e.components};return r?(0,t.jsx)(r,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},9725:(e,r,o)=>{o.d(r,{R:()=>i,x:()=>c});var n=o(4349);const t={},s=n.createContext(t);function i(e){const r=n.useContext(s);return n.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function c(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:i(e.components),n.createElement(s.Provider,{value:r},e.children)}}}]);