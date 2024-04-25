"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[318],{8139:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>a,contentTitle:()=>i,default:()=>d,frontMatter:()=>r,metadata:()=>c,toc:()=>l});var o=t(7458),s=t(3784);const r={title:"Writing Custom Rules"},i=void 0,c={id:"writing-custom-rules",title:"Writing Custom Rules",description:"Custom rules are simply functions that return the correct shape (RuleModule from @monorepolint/config).",source:"@site/docs/writing-custom-rules.md",sourceDirName:".",slug:"/writing-custom-rules",permalink:"/docs/writing-custom-rules",draft:!1,unlisted:!1,editUrl:"https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/writing-custom-rules.md",tags:[],version:"current",frontMatter:{title:"Writing Custom Rules"},sidebar:"docs",previous:{title:"Command Line Interface",permalink:"/docs/cli"},next:{title:"Putting your Config in a Package",permalink:"/docs/guides/config-in-a-package"}},a={},l=[];function u(e){const n={code:"code",p:"p",pre:"pre",...(0,s.a)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)(n.p,{children:["Custom rules are simply functions that return the correct shape (",(0,o.jsx)(n.code,{children:"RuleModule"})," from ",(0,o.jsx)(n.code,{children:"@monorepolint/config"}),")."]}),"\n",(0,o.jsxs)(n.p,{children:["For example, let's ban lodash with a rule using the ",(0,o.jsx)(n.code,{children:"makeRule"})," helper:"]}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{className:"language-ts",children:'\nimport { makeRule } from "@monorepolint/rules/util";\n\nexport type Options = undefined; // Change this to an interface and have whatever rules you want\n\nexport const noLodash = makeRule<Options>({\n  name: "noLodash",\n  check: (context) => {\n    const packageJson = context.getPackageJson();\n    if (!packageJson["dependencies"]) return;\n\n    if ("lodash" in packageJson["dependencies"]) {\n      context.addError({\n        message: "No lodash for you!",\n        file: context.getPackageJsonPath(),\n        fixer: () => {\n          const freshPackageJson = { ...context.getPackageJson() };\n          delete freshPackageJson.dependencies!["lodash"];\n          context.host.writeJson(context.getPackageJsonPath(), freshPackageJson);\n        },\n      });\n    }\n  },\n  validateOptions: () => {/* no options, no validation! */},\n});\n\n'})})]})}function d(e={}){const{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,o.jsx)(n,{...e,children:(0,o.jsx)(u,{...e})}):u(e)}},3784:(e,n,t)=>{t.d(n,{Z:()=>c,a:()=>i});var o=t(2983);const s={},r=o.createContext(s);function i(e){const n=o.useContext(r);return o.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:i(e.components),o.createElement(r.Provider,{value:n},e.children)}}}]);