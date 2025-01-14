"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[78],{5984:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>a,default:()=>d,frontMatter:()=>r,metadata:()=>s,toc:()=>l});const s=JSON.parse('{"id":"rules/package-script","title":"packageScript","description":"Standardize package scripts. This is a separate rule from Package Entries to make it easy to have multiple package script rules apply to one package.","source":"@site/docs/rules/package-script.md","sourceDirName":"rules","slug":"/rules/package-script","permalink":"/docs/rules/package-script","draft":false,"unlisted":false,"editUrl":"https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/rules/package-script.md","tags":[],"version":"current","frontMatter":{"title":"packageScript"},"sidebar":"docs","previous":{"title":"packageOrder","permalink":"/docs/rules/package-order"},"next":{"title":"requireDependency","permalink":"/docs/rules/require-dependency"}}');var i=t(612),o=t(5070);const r={title:"packageScript"},a=void 0,c={},l=[{value:"Options",id:"options",level:3},{value:"Example",id:"example",level:3}];function p(e){const n={a:"a",code:"code",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,o.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.p,{children:"Standardize package scripts. This is a separate rule from Package Entries to make it easy to have multiple package script rules apply to one package."}),"\n",(0,i.jsx)(n.h3,{id:"options",children:"Options"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"scripts"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["A map of string to one of:","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"A string for the expected value (short hand)"}),"\n",(0,i.jsxs)(n.li,{children:["An object like ",(0,i.jsx)(n.code,{children:"{ options: string[], fixValue?: string }"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"options"})," is the allowed options for this value"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"fixValue"})," is what will be set if none of the options match"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-javascript",children:'import { packageScript } from "@monorepolint/rules";\nexport default {\n  rules: [\n    packageScript({\n      options: {\n        scripts: {\n          clean:\n            "rm -rf build lib node_modules *.tgz",\n          compile:\n            "../../node_modules/.bin/tsc",\n          goodbye: {\n            options: [undefined],\n            fixValue: undefined, // fix removes value\n          },\n          "any-of-these-no-auto-fix": {\n            options: ["a", "b", "c"],\n          },\n          "any-of-these-auto-fix-to-c":\n            {\n              options: ["a", "b", "c"],\n              fixValue: "c",\n            },\n        },\n      },\n    }),\n  ],\n};\n'})}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/packageScript.ts",children:"rule source"})})]})}function d(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(p,{...e})}):p(e)}},5070:(e,n,t)=>{t.d(n,{R:()=>r,x:()=>a});var s=t(4344);const i={},o=s.createContext(i);function r(e){const n=s.useContext(o);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:r(e.components),s.createElement(o.Provider,{value:n},e.children)}}}]);