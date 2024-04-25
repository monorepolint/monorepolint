"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[643],{5919:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>l,contentTitle:()=>c,default:()=>p,frontMatter:()=>o,metadata:()=>r,toc:()=>d});var t=s(7458),i=s(3784);const o={title:"standardTsconfig"},c=void 0,r={id:"rules/standard-tsconfig",title:"standardTsconfig",description:"Special case of the File Contents rule for typescript configs. Using a template file for the typescript config, auto discover ands adds project references to the config",source:"@site/docs/rules/standard-tsconfig.md",sourceDirName:"rules",slug:"/rules/standard-tsconfig",permalink:"/docs/rules/standard-tsconfig",draft:!1,unlisted:!1,editUrl:"https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/rules/standard-tsconfig.md",tags:[],version:"current",frontMatter:{title:"standardTsconfig"},sidebar:"docs",previous:{title:"requireDependency",permalink:"/docs/rules/require-dependency"}},l={},d=[{value:"Options",id:"options",level:3},{value:"Example",id:"example",level:3}];function a(e){const n={a:"a",code:"code",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,i.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.p,{children:"Special case of the File Contents rule for typescript configs. Using a template file for the typescript config, auto discover ands adds project references to the config"}),"\n",(0,t.jsx)(n.h3,{id:"options",children:"Options"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"file"})," (Optional)","\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:["Name of the file. Defaults to ",(0,t.jsx)(n.code,{children:"tsconfig.json"}),"."]}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"generator"})," (Optional)","\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsx)(n.li,{children:"Function that can generate the config"}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"tsconfigReferenceFile"})," (Optional)","\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:["String to append to each project reference path. Useful if project references have a non-standard ",(0,t.jsx)(n.code,{children:"tsconfig.json"})," path. Ex: ",(0,t.jsx)(n.code,{children:"tsconfig.build.json"}),"."]}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"template"})," (Optional)","\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsx)(n.li,{children:"Expected config contents"}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"templateFile"})," (Optional)","\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsx)(n.li,{children:"Path to a file to use as a template"}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"excludedReferences"})," (Optional)","\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsx)(n.li,{children:"List of references to exclude"}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"additionalReferences"})," (Optional)","\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:["List of additional references to include beyond the ones coming from explicit dependencies in ",(0,t.jsx)(n.code,{children:"package.json"})]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,t.jsxs)(n.p,{children:["Exactly one of ",(0,t.jsx)(n.code,{children:"generator"}),", ",(0,t.jsx)(n.code,{children:"template"}),", or ",(0,t.jsx)(n.code,{children:"templateFile"})," needs to be specified."]}),"\n",(0,t.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-javascript",children:'import { standardTsconfig } from "monorepolint/rules";\nexport default {\n  rules: [\n    standardTsconfig({\n      options: {\n        templateFile:\n          "./templates/tsconfig.json",\n      },\n    }),\n  ],\n};\n'})}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.a,{href:"https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/standardTsconfig.ts",children:"rule source"})})]})}function p(e={}){const{wrapper:n}={...(0,i.a)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(a,{...e})}):a(e)}},3784:(e,n,s)=>{s.d(n,{Z:()=>r,a:()=>c});var t=s(2983);const i={},o=t.createContext(i);function c(e){const n=t.useContext(o);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:c(e.components),t.createElement(o.Provider,{value:n},e.children)}}}]);