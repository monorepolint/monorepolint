"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[945],{8581:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>r,default:()=>p,frontMatter:()=>i,metadata:()=>o,toc:()=>a});const o=JSON.parse('{"id":"rules/file-contents","title":"fileContents","description":"Enforce that each package has a file with certain contents enforced by either a template or generator.","source":"@site/docs/rules/file-contents.md","sourceDirName":"rules","slug":"/rules/file-contents","permalink":"/docs/rules/file-contents","draft":false,"unlisted":false,"editUrl":"https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/rules/file-contents.md","tags":[],"version":"current","frontMatter":{"title":"fileContents"},"sidebar":"docs","previous":{"title":"consistentVersions","permalink":"/docs/rules/consistent-versions"},"next":{"title":"forceError","permalink":"/docs/rules/force-error"}}');var s=t(4489),l=t(9725);const i={title:"fileContents"},r=void 0,c={},a=[{value:"Options",id:"options",level:3},{value:"Example",id:"example",level:3}];function d(e){const n={a:"a",code:"code",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,l.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.p,{children:"Enforce that each package has a file with certain contents enforced by either a template or generator."}),"\n",(0,s.jsx)(n.h3,{id:"options",children:"Options"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"file"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Name of the file"}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"generator"})," (Optional)","\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Function that can generate the file"}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"template"})," (Optional)","\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Expected file contents"}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"templateFile"})," (Optional)","\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Path to a file to use as a template"}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["Exactly one of ",(0,s.jsx)(n.code,{children:"generator"}),", ",(0,s.jsx)(n.code,{children:"template"}),", or ",(0,s.jsx)(n.code,{children:"templateFile"})," needs to be specified."]}),"\n",(0,s.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:'import { fileContents } from "@monorepolint/rules";\nexport default {\n  rules: [\n    fileContents({\n      options: {\n        file: "jest.config.js",\n        templateFile: "./templates/jest.config.js",\n      },\n    }),\n    fileContents({\n      options: {\n        file: "foo.txt",\n        template: "Hi mom",\n      },\n    }),\n    fileContents({\n      options: {\n        file: "badFile.txt",\n        template: undefined, // delete file\n      },\n    }),\n    // TODO: Generator example\n  ],\n};\n'})}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/fileContents.ts",children:"rule source"})})]})}function p(e={}){const{wrapper:n}={...(0,l.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}},9725:(e,n,t)=>{t.d(n,{R:()=>i,x:()=>r});var o=t(4349);const s={},l=o.createContext(s);function i(e){const n=o.useContext(l);return o.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:i(e.components),o.createElement(l.Provider,{value:n},e.children)}}}]);