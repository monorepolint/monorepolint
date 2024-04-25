"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[718],{3682:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>l,contentTitle:()=>o,default:()=>a,frontMatter:()=>t,metadata:()=>c,toc:()=>d});var i=r(322),s=r(5674);const t={title:"requireDependency"},o=void 0,c={id:"rules/require-dependency",title:"requireDependency",description:"Require all packages to declare dependencies with specified versions.",source:"@site/docs/rules/require-dependency.md",sourceDirName:"rules",slug:"/rules/require-dependency",permalink:"/docs/rules/require-dependency",draft:!1,unlisted:!1,editUrl:"https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/rules/require-dependency.md",tags:[],version:"current",frontMatter:{title:"requireDependency"},sidebar:"docs",previous:{title:"packageScript",permalink:"/docs/rules/package-script"},next:{title:"standardTsconfig",permalink:"/docs/rules/standard-tsconfig"}},l={},d=[{value:"Options",id:"options",level:3},{value:"Example",id:"example",level:3}];function p(e){const n={a:"a",code:"code",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,s.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.p,{children:"Require all packages to declare dependencies with specified versions."}),"\n",(0,i.jsx)(n.p,{children:"Often useful when using a third party tool like webpack or babel that expects a\nlocal entry."}),"\n",(0,i.jsx)(n.h3,{id:"options",children:"Options"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"dependencies"})," (Optional)","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Map of dependency name to version"}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"devDependencies"})," (Optional)","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Map of dependency name to version"}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"peerDependencies"})," (Optional)","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Map of dependency name to version"}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"optionalDependencies"})," (Optional)","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Map of dependency name to version"}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-javascript",children:'import { requireDependency } from "monorepolint/rules";\nexport default {\n  rules: [\n    requireDependency({\n      options: {\n        devDependencies: {\n          typescript: "^3.8.3",\n        },\n      },\n    }),\n  ],\n};\n'})}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/requireDependency.ts",children:"rule source"})})]})}function a(e={}){const{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(p,{...e})}):p(e)}},5674:(e,n,r)=>{r.d(n,{Z:()=>c,a:()=>o});var i=r(4400);const s={},t=i.createContext(s);function o(e){const n=i.useContext(t);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),i.createElement(t.Provider,{value:n},e.children)}}}]);