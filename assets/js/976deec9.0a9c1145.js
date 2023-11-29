"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[484],{8100:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>o,contentTitle:()=>c,default:()=>p,frontMatter:()=>i,metadata:()=>a,toc:()=>d});var t=s(7458),r=s(710);const i={title:"mustSatisfyPeerDependencies"},c=void 0,a={id:"rules/must-satisfy-peer-dependencies",title:"mustSatisfyPeerDependencies",description:"Ensures that packages satisfy peer dependency requirements declared by their dependencies.",source:"@site/docs/rules/must-satisfy-peer-dependencies.md",sourceDirName:"rules",slug:"/rules/must-satisfy-peer-dependencies",permalink:"/docs/rules/must-satisfy-peer-dependencies",draft:!1,unlisted:!1,editUrl:"https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/rules/must-satisfy-peer-dependencies.md",tags:[],version:"current",frontMatter:{title:"mustSatisfyPeerDependencies"},sidebar:"docs",previous:{title:"fileContents",permalink:"/docs/rules/file-contents"},next:{title:"nestedWorkspaces",permalink:"/docs/rules/nested-workspaces"}},o={},d=[{value:"Options",id:"options",level:3},{value:"Example",id:"example",level:3}];function l(e){const n={a:"a",code:"code",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,r.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.p,{children:"Ensures that packages satisfy peer dependency requirements declared by their dependencies."}),"\n",(0,t.jsx)(n.h3,{id:"options",children:"Options"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"skipUnparseableRanges"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsx)(n.li,{children:"If true, warn and skip dependency ranges that are unparseable. Otherwise, throw. Default is false."}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"dependencyWhitelist"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsx)(n.li,{children:"An array of package names indicating which peer dependencies must be satisfied."}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,t.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-javascript",children:'import { mustSatisfyPeerDependencies } from "monorepolint/rules";\nexport default {\n  rules: [\n    mustSatisfyPeerDependencies({\n      options: {\n        skipUnparseableRanges: false,\n        dependencyWhitelist: [\n          "react",\n          "react-dom",\n        ],\n      },\n    }),\n  ],\n};\n'})}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.a,{href:"https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/mustSatisfyPeerDependencies.ts",children:"rule source"})})]})}function p(e={}){const{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(l,{...e})}):l(e)}},710:(e,n,s)=>{s.d(n,{Z:()=>a,a:()=>c});var t=s(2983);const r={},i=t.createContext(r);function c(e){const n=t.useContext(i);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:c(e.components),t.createElement(i.Provider,{value:n},e.children)}}}]);