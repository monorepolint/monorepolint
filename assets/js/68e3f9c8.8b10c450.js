"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[62],{3246:(e,n,o)=>{o.r(n),o.d(n,{assets:()=>c,contentTitle:()=>a,default:()=>p,frontMatter:()=>r,metadata:()=>s,toc:()=>l});var i=o(7458),t=o(710);const r={title:"Configuration File"},a=void 0,s={id:"config",title:"Configuration File",description:"Monorepolint (mrl) requires a configuration file located at the root of your monorepo, named .monorepolint.config.mjs. This file serves as the central configuration for your project, allowing you to maintain consistency across your sub-projects.",source:"@site/docs/config.mdx",sourceDirName:".",slug:"/config",permalink:"/docs/config",draft:!1,unlisted:!1,editUrl:"https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/config.mdx",tags:[],version:"current",frontMatter:{title:"Configuration File"},sidebar:"docs",previous:{title:"Getting Started with Monorepolint",permalink:"/docs/"},next:{title:"Command Line Interface",permalink:"/docs/cli"}},c={},l=[{value:"Configuration File Format",id:"configuration-file-format",level:2},{value:"Built-in and Custom Rules",id:"built-in-and-custom-rules",level:2},{value:"Common Configuration Options",id:"common-configuration-options",level:2},{value:"Detailed Example",id:"detailed-example",level:2}];function d(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",p:"p",pre:"pre",...(0,t.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(n.p,{children:["Monorepolint (mrl) requires a configuration file located at the root of your monorepo, named ",(0,i.jsx)(n.code,{children:".monorepolint.config.mjs"}),". This file serves as the central configuration for your project, allowing you to maintain consistency across your sub-projects."]}),"\n",(0,i.jsxs)(n.admonition,{title:"Previous Configuration Format",type:"info",children:[(0,i.jsxs)(n.p,{children:["In earlier versions of monorepolint, the configuration file was named ",(0,i.jsx)(n.code,{children:"monorepolint.config.ts"}),". Due to difficulties in maintaining TypeScript configurations that type-checked properly, particularly in Visual Studio Code, this format has been removed."]}),(0,i.jsx)(n.p,{children:"If you prefer to use TypeScript for your configuration, consider creating a separate project and referencing it from your root configuration file."})]}),"\n",(0,i.jsx)(n.h2,{id:"configuration-file-format",children:"Configuration File Format"}),"\n",(0,i.jsx)(n.p,{children:"A monorepolint configuration file is a simple JavaScript file. To apply specific rules, simply import and invoke the corresponding functions:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-ts",metastring:'title=".monorepolint.config.mjs"',children:'import { alphabeticalDependencies } from "@monorepolint/rules";\n\nexport default {\n  rules: [alphabeticalDependencies({})],\n};\n'})}),"\n",(0,i.jsx)(n.h2,{id:"built-in-and-custom-rules",children:"Built-in and Custom Rules"}),"\n",(0,i.jsxs)(n.p,{children:["Built-in rules are just functions exported from ",(0,i.jsx)(n.code,{children:"@monorepolint/rules"}),". For information on creating custom rules, refer to the ",(0,i.jsx)(n.a,{href:"./writing-custom-rules",children:"Writing Custom Rules"})," documentation."]}),"\n",(0,i.jsx)(n.p,{children:":::"}),"\n",(0,i.jsx)(n.h2,{id:"common-configuration-options",children:"Common Configuration Options"}),"\n",(0,i.jsx)(n.p,{children:"Each rule configuration supports the following options:"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-ts",children:"type CommonOptions<T> {\n  /** Unique Per Rule **/\n  options?: T;\n\n  /**\n   * Package names or minimatch globs of package names\n   * allowing certain packages to be excluded from this rule.\n   * @default excluding no child packages.\n   **/\n  excludePackages?: string[] | undefined;\n\n  /**\n   * Package names or minimatch globs of package names\n   * for specifying specific packages this applies to.\n   * @default including all child packages.\n   **/\n  includePackages?: string[] | undefined;\n\n  /**\n   * Whether to include the root package for this rule\n   * @default false\n   */\n  includeWorkspaceRoot?: boolean | undefined;\n}\n"})}),"\n",(0,i.jsx)(n.h2,{id:"detailed-example",children:"Detailed Example"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-js",metastring:'title=".monorepolint.config.mjs"',children:'import {\n  alphabeticalDependencies,\n  alphabeticalScripts,\n  bannedDependencies,\n  consistentDependences,\n  packageOrder,\n  packageScript,\n} from "@monorepolint/rules";\n\nexport default {\n  rules: [\n    packageScript({\n      options: {\n        scripts: {\n          clean: "rm -rf build lib node_modules *.tgz",\n          test: "../../node_modules/.bin/jest --colors --passWithNoTests",\n        },\n      },\n    }),\n    packageOrder({}),\n    alphabeticalDependencies({}),\n    bannedDependencies({\n      options: {\n        bannedDependencies: ["lodash"],\n      },\n      includeWorkspaceRoot: true,\n    }),\n    consistentDependencies({}),\n  ],\n};\n'})}),"\n",(0,i.jsxs)(n.p,{children:["This will ensure that all projects have a ",(0,i.jsx)(n.code,{children:"clean"})," and ",(0,i.jsx)(n.code,{children:"test"})," task, that the order of the entries in package.json are sane, that dependencies and scripts are kept in alphabetical order, that lodash is banned from the project, and the last one ensures that if a package is listed in the root package.json, all packages in the workspace that list that dependency must match the same version."]})]})}function p(e={}){const{wrapper:n}={...(0,t.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(d,{...e})}):d(e)}},710:(e,n,o)=>{o.d(n,{Z:()=>s,a:()=>a});var i=o(2983);const t={},r=i.createContext(t);function a(e){const n=i.useContext(r);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function s(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:a(e.components),i.createElement(r.Provider,{value:n},e.children)}}}]);