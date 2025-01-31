"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[67],{9670:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>p,contentTitle:()=>a,default:()=>d,frontMatter:()=>c,metadata:()=>t,toc:()=>i});const t=JSON.parse('{"id":"rules/nested-workspaces","title":"nestedWorkspaces","description":"Enforce that all workspaces in the repo are represented by the workspaces field in package.json.","source":"@site/docs/rules/nested-workspaces.md","sourceDirName":"rules","slug":"/rules/nested-workspaces","permalink":"/docs/rules/nested-workspaces","draft":false,"unlisted":false,"editUrl":"https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/rules/nested-workspaces.md","tags":[],"version":"current","frontMatter":{"title":"nestedWorkspaces"},"sidebar":"docs","previous":{"title":"mustSatisfyPeerDependencies","permalink":"/docs/rules/must-satisfy-peer-dependencies"},"next":{"title":"oncePerPackage","permalink":"/docs/rules/once-per-package"}}');var r=n(612),o=n(9383);const c={title:"nestedWorkspaces"},a=void 0,p={},i=[{value:"Example",id:"example",level:3}];function l(e){const s={a:"a",code:"code",h3:"h3",p:"p",pre:"pre",...(0,o.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(s.p,{children:["Enforce that all workspaces in the repo are represented by the ",(0,r.jsx)(s.code,{children:"workspaces"})," field in ",(0,r.jsx)(s.code,{children:"package.json"}),".\nIn particular, this ensures that nested workspaces (e.g. ",(0,r.jsx)(s.code,{children:"packages/group/*"}),") are not missed."]}),"\n",(0,r.jsx)(s.h3,{id:"example",children:"Example"}),"\n",(0,r.jsx)(s.pre,{children:(0,r.jsx)(s.code,{className:"language-javascript",children:'import { nestedWorkspaces } from "@monorepolint/rules";\nexport default {\n  rules: [nestedWorkspaces({})],\n};\n'})}),"\n",(0,r.jsx)(s.p,{children:(0,r.jsx)(s.a,{href:"https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/nestedWorkspaces.ts",children:"rule source"})})]})}function d(e={}){const{wrapper:s}={...(0,o.R)(),...e.components};return s?(0,r.jsx)(s,{...e,children:(0,r.jsx)(l,{...e})}):l(e)}},9383:(e,s,n)=>{n.d(s,{R:()=>c,x:()=>a});var t=n(4344);const r={},o=t.createContext(r);function c(e){const s=t.useContext(o);return t.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function a(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:c(e.components),t.createElement(o.Provider,{value:s},e.children)}}}]);