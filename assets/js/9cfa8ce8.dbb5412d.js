"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[764],{7275:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>d,contentTitle:()=>c,default:()=>p,frontMatter:()=>r,metadata:()=>t,toc:()=>l});const t=JSON.parse('{"id":"rules/banned-dependencies","title":"bannedDependencies","description":"Overview","source":"@site/docs/rules/banned-dependencies.md","sourceDirName":"rules","slug":"/rules/banned-dependencies","permalink":"/docs/rules/banned-dependencies","draft":false,"unlisted":false,"editUrl":"https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/rules/banned-dependencies.md","tags":[],"version":"current","frontMatter":{"title":"bannedDependencies"},"sidebar":"docs","previous":{"title":"alphabeticalScripts","permalink":"/docs/rules/alphabetical-scripts"},"next":{"title":"consistentDependencies","permalink":"/docs/rules/consistent-dependencies"}}');var i=s(612),o=s(5070);const r={title:"bannedDependencies"},c=void 0,d={},l=[{value:"Overview",id:"overview",level:2},{value:"Options",id:"options",level:3},{value:"Example",id:"example",level:3},{value:"Reference",id:"reference",level:3}];function a(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,o.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h2,{id:"overview",children:"Overview"}),"\n",(0,i.jsx)(n.p,{children:"The bannedDependencies lint rule is designed to prevent the usage of certain, potentially problematic, dependencies within your project. This rule is highly customizable, allowing you to specify exact dependencies or use glob patterns to disallow a wider range of dependencies."}),"\n",(0,i.jsx)(n.p,{children:"Due to performance considerations, it is now recommended to use the bannedDependencies option with exact and glob keys to specify disallowed dependencies. The previously used approach of providing an array of globs or using bannedDependencyExactMatches is deprecated."}),"\n",(0,i.jsx)(n.p,{children:"By default, this rule will not transitively check dependencies."}),"\n",(0,i.jsx)(n.p,{children:"It is possible to ban transitive dependencies with this rule, but given\nthe current performance characteristics, it is not recommended and thus not\ndocumented."}),"\n",(0,i.jsx)(n.h3,{id:"options",children:"Options"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"bannedDependencies: { glob: [], exact: []}"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["Define an array of dependency globs to ban using the ",(0,i.jsx)(n.code,{children:"glob"})," key for globs and the ",(0,i.jsx)(n.code,{children:"exact"})," key for exact matches (performance benefits)."]}),"\n",(0,i.jsx)(n.li,{children:"Note: this option used to accept an array of globs, but that approach is now deprecated."}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-javascript",children:'import { bannedDependencies } from "@monorepolint/rules";\n\nexport default {\n  rules: [\n    bannedDependencies({\n      options: {\n        bannedDependencies: {\n          exact: ["lodash"],\n          glob: ["lodash-*"],\n        },\n      },\n    }),\n  ],\n};\n'})}),"\n",(0,i.jsx)(n.h3,{id:"reference",children:"Reference"}),"\n",(0,i.jsxs)(n.p,{children:["For more information and to view the source code of this rule, please visit the ",(0,i.jsx)(n.a,{href:"https://github.com/monorepolint/monorepolint/blob/main/packages/rules/src/bannedDependencies.ts",children:"rule source"})," on the Monorepo Lint repository."]})]})}function p(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(a,{...e})}):a(e)}},5070:(e,n,s)=>{s.d(n,{R:()=>r,x:()=>c});var t=s(4344);const i={},o=t.createContext(i);function r(e){const n=t.useContext(o);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:r(e.components),t.createElement(o.Provider,{value:n},e.children)}}}]);