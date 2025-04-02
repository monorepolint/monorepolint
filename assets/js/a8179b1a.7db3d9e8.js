"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[775],{6523:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>d,contentTitle:()=>i,default:()=>a,frontMatter:()=>r,metadata:()=>t,toc:()=>l});const t=JSON.parse('{"id":"rules/consistent-dependencies","title":"consistentDependencies","description":"Enforce dependency versions are consistent with workspace root.","source":"@site/docs/rules/consistent-dependencies.md","sourceDirName":"rules","slug":"/rules/consistent-dependencies","permalink":"/docs/rules/consistent-dependencies","draft":false,"unlisted":false,"editUrl":"https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/rules/consistent-dependencies.md","tags":[],"version":"current","frontMatter":{"title":"consistentDependencies"},"sidebar":"docs","previous":{"title":"bannedDependencies","permalink":"/docs/rules/banned-dependencies"},"next":{"title":"consistentVersions","permalink":"/docs/rules/consistent-versions"}}');var o=s(4489),c=s(9725);const r={title:"consistentDependencies"},i=void 0,d={},l=[{value:"Example",id:"example",level:3}];function p(e){const n={a:"a",code:"code",h3:"h3",p:"p",pre:"pre",...(0,c.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n.p,{children:"Enforce dependency versions are consistent with workspace root."}),"\n",(0,o.jsxs)(n.p,{children:["If your root package.json has a dependency on ",(0,o.jsx)(n.code,{children:'"somelib": "^1.0.0"'})," then all child projects that depend on somelib must also have that version listed."]}),"\n",(0,o.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-javascript",children:'import { consistentDependencies } from "@monorepolint/rules";\nexport default {\n  rules: [\n    consistentDependencies({}),\n  ],\n};\n'})}),"\n",(0,o.jsx)(n.p,{children:(0,o.jsx)(n.a,{href:"https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/consistentDependencies.ts",children:"rule source"})})]})}function a(e={}){const{wrapper:n}={...(0,c.R)(),...e.components};return n?(0,o.jsx)(n,{...e,children:(0,o.jsx)(p,{...e})}):p(e)}},9725:(e,n,s)=>{s.d(n,{R:()=>r,x:()=>i});var t=s(4349);const o={},c=t.createContext(o);function r(e){const n=t.useContext(c);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:r(e.components),t.createElement(c.Provider,{value:n},e.children)}}}]);