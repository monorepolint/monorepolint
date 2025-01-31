"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[466],{2241:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>a,contentTitle:()=>i,default:()=>d,frontMatter:()=>c,metadata:()=>o,toc:()=>l});const o=JSON.parse('{"id":"writing-custom-rules","title":"Writing Custom Rules","description":"Custom rules are simply functions that return the correct shape (RuleModule from @monorepolint/config).","source":"@site/docs/writing-custom-rules.md","sourceDirName":".","slug":"/writing-custom-rules","permalink":"/docs/writing-custom-rules","draft":false,"unlisted":false,"editUrl":"https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/writing-custom-rules.md","tags":[],"version":"current","frontMatter":{"title":"Writing Custom Rules"},"sidebar":"docs","previous":{"title":"Command Line Interface","permalink":"/docs/cli"},"next":{"title":"Archetypes and Large Monorepos","permalink":"/docs/guides/archetypes"}}');var s=t(612),r=t(9383);const c={title:"Writing Custom Rules"},i=void 0,a={},l=[];function u(e){const n={code:"code",p:"p",pre:"pre",...(0,r.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(n.p,{children:["Custom rules are simply functions that return the correct shape (",(0,s.jsx)(n.code,{children:"RuleModule"})," from ",(0,s.jsx)(n.code,{children:"@monorepolint/config"}),")."]}),"\n",(0,s.jsxs)(n.p,{children:["For example, let's ban lodash with a rule using the ",(0,s.jsx)(n.code,{children:"makeRule"})," helper:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:'import { makeRule } from "@monorepolint/rules/util";\n\nexport type Options = undefined; // Change this to an interface and have whatever rules you want\n\nexport const noLodash = makeRule<Options>({\n  name: "noLodash",\n  check: (context) => {\n    const packageJson = context.getPackageJson();\n    if (!packageJson["dependencies"]) return;\n\n    if ("lodash" in packageJson["dependencies"]) {\n      context.addError({\n        message: "No lodash for you!",\n        file: context.getPackageJsonPath(),\n        fixer: () => {\n          const freshPackageJson = { ...context.getPackageJson() };\n          delete freshPackageJson.dependencies!["lodash"];\n          context.host.writeJson(\n            context.getPackageJsonPath(),\n            freshPackageJson,\n          );\n        },\n      });\n    }\n  },\n  validateOptions: () => {/* no options, no validation! */},\n});\n'})})]})}function d(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(u,{...e})}):u(e)}},9383:(e,n,t)=>{t.d(n,{R:()=>c,x:()=>i});var o=t(4344);const s={},r=o.createContext(s);function c(e){const n=o.useContext(r);return o.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:c(e.components),o.createElement(r.Provider,{value:n},e.children)}}}]);