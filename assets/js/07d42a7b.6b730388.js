"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[773],{843:(n,e,t)=>{t.r(e),t.d(e,{assets:()=>c,contentTitle:()=>o,default:()=>l,frontMatter:()=>r,metadata:()=>a,toc:()=>d});var i=t(7458),s=t(710);const r={title:"Tips and Tricks"},o=void 0,a={id:"tips-and-tricks",title:"Tips and Tricks",description:"Standardizing package.json Exports",source:"@site/docs/tips-and-tricks.md",sourceDirName:".",slug:"/tips-and-tricks",permalink:"/docs/tips-and-tricks",draft:!1,unlisted:!1,editUrl:"https://github.com/monorepolint/monorepolint/edit/main/packages/docs/docs/tips-and-tricks.md",tags:[],version:"current",frontMatter:{title:"Tips and Tricks"},sidebar:"docs",previous:{title:"Putting your Config in a Package",permalink:"/docs/guides/config-in-a-package"},next:{title:"alphabeticalDependencies",permalink:"/docs/rules/alphabetical-dependencies"}},c={},d=[{value:"Standardizing package.json Exports",id:"standardizing-packagejson-exports",level:2},{value:"Pre-formatting Generated Content with dprint",id:"pre-formatting-generated-content-with-dprint",level:2}];function p(n){const e={a:"a",code:"code",h2:"h2",p:"p",pre:"pre",...(0,s.a)(),...n.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(e.h2,{id:"standardizing-packagejson-exports",children:"Standardizing package.json Exports"}),"\n",(0,i.jsxs)(e.p,{children:["To maintain consistency across packages, it is recommended to define a standard for exports, such as mapping all files in the ",(0,i.jsx)(e.code,{children:"public/"})," directory as root exports. This can be achieved by using the following configuration:"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-ts",children:'  packageEntry({\n    options: {\n      entries: {\n        exports: {\n          ".": {\n            types: "./dist/index.d.ts",\n            import: "./dist/index.mjs",\n            require: "./dist/index.js",\n          },\n          "./*": {\n            types: "./dist/public/*.d.ts",\n            import: "./dist/public/*.mjs",\n            require: "./dist/public/*.js",\n          },\n        },\n      },\n    },\n  }),\n'})}),"\n",(0,i.jsxs)(e.p,{children:["This configuration can be combined with tools like ",(0,i.jsx)(e.code,{children:"tsup"})," to automatically bundle exports:"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-json",children:'{\n    ...\n    "entry": ["src/index.ts", "src/public/*.ts"]\n    ...\n}\n'})}),"\n",(0,i.jsx)(e.h2,{id:"pre-formatting-generated-content-with-dprint",children:"Pre-formatting Generated Content with dprint"}),"\n",(0,i.jsxs)(e.p,{children:["Pre-formatting generated content using ",(0,i.jsx)(e.a,{href:"https://dprint.dev/",children:"dprint"})," can be challenging since it cannot be used directly from node. However, it is possible to create wrappers by executing it in a shell:"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-js",children:'const formatWithDprint =\n  (contents, ext) =>\n  async (context) => {\n    const result =\n      child_process.spawnSync(\n        `pnpm exec dprint fmt --stdin foo.${ext}`,\n        {\n          input: contents,\n          encoding: "utf8",\n          shell: true,\n        }\n      );\n\n    if (result.error) {\n      throw result.error;\n    }\n    return result.stdout;\n  };\n'})}),"\n",(0,i.jsx)(e.p,{children:"By utilizing this wrapper, you can ensure that your files are properly formatted:"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-ts",children:'const tsupContents = formatWithDprint(\n  `\n  import { defineConfig } from "tsup";\n\n  export default defineConfig(async (options) =>\n  (await import("mytsup")).default(options)\n  );     \n`,\n  "js"\n);\n\n// ...\n\nreturn [\n  fileContents({\n    ...shared,\n    options: {\n      file: "tsup.config.js",\n      template: tsupContents,\n    },\n  }),\n];\n'})})]})}function l(n={}){const{wrapper:e}={...(0,s.a)(),...n.components};return e?(0,i.jsx)(e,{...n,children:(0,i.jsx)(p,{...n})}):p(n)}},710:(n,e,t)=>{t.d(e,{Z:()=>a,a:()=>o});var i=t(2983);const s={},r=i.createContext(s);function o(n){const e=i.useContext(r);return i.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function a(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(s):n.components||s:o(n.components),i.createElement(r.Provider,{value:e},n.children)}}}]);