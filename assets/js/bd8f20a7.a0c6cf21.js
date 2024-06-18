"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[690],{9548:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>l,contentTitle:()=>r,default:()=>p,frontMatter:()=>i,metadata:()=>c,toc:()=>d});var t=s(322),o=s(5674);const i={title:"consistentVersions"},r=void 0,c={id:"rules/consistent-versions",title:"consistentVersions",description:"Ensure that all packages use the same version of a dependency, when present in either dependencies or devDependencies.",source:"@site/docs/rules/consistent-versions.md",sourceDirName:"rules",slug:"/rules/consistent-versions",permalink:"/docs/rules/consistent-versions",draft:!1,unlisted:!1,editUrl:"https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/rules/consistent-versions.md",tags:[],version:"current",frontMatter:{title:"consistentVersions"},sidebar:"docs",previous:{title:"consistentDependencies",permalink:"/docs/rules/consistent-dependencies"},next:{title:"fileContents",permalink:"/docs/rules/file-contents"}},l={},d=[{value:"Options",id:"options",level:3},{value:"Example",id:"example",level:3}];function a(e){const n={a:"a",code:"code",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,o.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(n.p,{children:["Ensure that all packages use the same version of a dependency, when present in either ",(0,t.jsx)(n.code,{children:"dependencies"})," or ",(0,t.jsx)(n.code,{children:"devDependencies"}),".\nNote that this is different from ",(0,t.jsx)(n.a,{href:"#require-dependency",children:"require-dependency"})," which will require the dependency to exist\nfor all packages, not just enforce consistent versions when present."]}),"\n",(0,t.jsx)(n.h3,{id:"options",children:"Options"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"matchDependencyVersions"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsx)(n.li,{children:"Map from dependency name to version"}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,t.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-javascript",children:'import { consistentVersions } from "monorepolint/rules";\nexport default {\n  rules: [\n    consistentVersions({\n      options: {\n        matchDependencyVersions: {\n          lodash: "1.0.0",\n        },\n      },\n    }),\n  ],\n};\n'})}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.a,{href:"https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/consistentVersions.ts",children:"rule source"})})]})}function p(e={}){const{wrapper:n}={...(0,o.a)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(a,{...e})}):a(e)}},5674:(e,n,s)=>{s.d(n,{Z:()=>c,a:()=>r});var t=s(4400);const o={},i=t.createContext(o);function r(e){const n=t.useContext(i);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:r(e.components),t.createElement(i.Provider,{value:n},e.children)}}}]);