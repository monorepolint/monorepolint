"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[249],{221:(e,n,t)=>{t.r(n),t.d(n,{default:()=>b});t(4344);var i=t(851),a=t(5980),s=t(4136),l=t(1219),r=t(5741),o=t(9045),c=t(2521),d=t(7393),u=t(612);function m(e){const{nextItem:n,prevItem:t}=e;return(0,u.jsxs)("nav",{className:"pagination-nav docusaurus-mt-lg","aria-label":(0,c.T)({id:"theme.blog.post.paginator.navAriaLabel",message:"Blog post page navigation",description:"The ARIA label for the blog posts pagination"}),children:[t&&(0,u.jsx)(d.A,Object.assign({},t,{subLabel:(0,u.jsx)(c.A,{id:"theme.blog.post.paginator.newerPost",description:"The blog post button label to navigate to the newer/previous post",children:"Newer post"})})),n&&(0,u.jsx)(d.A,Object.assign({},n,{subLabel:(0,u.jsx)(c.A,{id:"theme.blog.post.paginator.olderPost",description:"The blog post button label to navigate to the older/next post",children:"Older post"}),isNext:!0}))]})}function g(){var e,n;const{assets:t,metadata:i}=(0,l.e7)(),{title:s,description:r,date:o,tags:c,authors:d,frontMatter:m}=i,{keywords:g}=m,f=null!=(e=t.image)?e:m.image;return(0,u.jsxs)(a.be,{title:null!=(n=m.title_meta)?n:s,description:r,keywords:g,image:f,children:[(0,u.jsx)("meta",{property:"og:type",content:"article"}),(0,u.jsx)("meta",{property:"article:published_time",content:o}),d.some((e=>e.url))&&(0,u.jsx)("meta",{property:"article:author",content:d.map((e=>e.url)).filter(Boolean).join(",")}),c.length>0&&(0,u.jsx)("meta",{property:"article:tag",content:c.map((e=>e.label)).join(",")})]})}var f=t(105);function h(){const e=(0,l.J_)();return(0,u.jsx)(f.A,{children:(0,u.jsx)("script",{type:"application/ld+json",children:JSON.stringify(e)})})}var p=t(1639),v=t(6669);function x(e){let{sidebar:n,children:t}=e;const{metadata:i,toc:a}=(0,l.e7)(),{nextItem:s,prevItem:c,frontMatter:d}=i,{hide_table_of_contents:g,toc_min_heading_level:f,toc_max_heading_level:h}=d;return(0,u.jsxs)(r.A,{sidebar:n,toc:!g&&a.length>0?(0,u.jsx)(p.A,{toc:a,minHeadingLevel:f,maxHeadingLevel:h}):void 0,children:[(0,u.jsx)(v.A,{metadata:i}),(0,u.jsx)(o.A,{children:t}),(s||c)&&(0,u.jsx)(m,{nextItem:s,prevItem:c})]})}function b(e){const n=e.content;return(0,u.jsx)(l.in,{content:e.content,isBlogPostPage:!0,children:(0,u.jsxs)(a.e3,{className:(0,i.A)(s.G.wrapper.blogPages,s.G.page.blogPostPage),children:[(0,u.jsx)(g,{}),(0,u.jsx)(h,{}),(0,u.jsx)(x,{sidebar:e.sidebar,children:(0,u.jsx)(n,{})})]})})}},6669:(e,n,t)=>{t.d(n,{A:()=>v});t(4344);var i=t(851),a=t(2521),s=t(105),l=t(612);function r(){return(0,l.jsx)(a.A,{id:"theme.contentVisibility.unlistedBanner.title",description:"The unlisted content banner title",children:"Unlisted page"})}function o(){return(0,l.jsx)(a.A,{id:"theme.contentVisibility.unlistedBanner.message",description:"The unlisted content banner message",children:"This page is unlisted. Search engines will not index it, and only users having a direct link can access it."})}function c(){return(0,l.jsx)(s.A,{children:(0,l.jsx)("meta",{name:"robots",content:"noindex, nofollow"})})}function d(){return(0,l.jsx)(a.A,{id:"theme.contentVisibility.draftBanner.title",description:"The draft content banner title",children:"Draft page"})}function u(){return(0,l.jsx)(a.A,{id:"theme.contentVisibility.draftBanner.message",description:"The draft content banner message",children:"This page is a draft. It will only be visible in dev and be excluded from the production build."})}var m=t(4136),g=t(481);function f(e){let{className:n}=e;return(0,l.jsx)(g.A,{type:"caution",title:(0,l.jsx)(d,{}),className:(0,i.A)(n,m.G.common.draftBanner),children:(0,l.jsx)(u,{})})}function h(e){let{className:n}=e;return(0,l.jsx)(g.A,{type:"caution",title:(0,l.jsx)(r,{}),className:(0,i.A)(n,m.G.common.unlistedBanner),children:(0,l.jsx)(o,{})})}function p(e){return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(c,{}),(0,l.jsx)(h,Object.assign({},e))]})}function v(e){let{metadata:n}=e;const{unlisted:t,frontMatter:i}=n;return(0,l.jsxs)(l.Fragment,{children:[(t||i.unlisted)&&(0,l.jsx)(p,{}),i.draft&&(0,l.jsx)(f,{})]})}},1639:(e,n,t)=>{t.d(n,{A:()=>u});var i=t(8910),a=(t(4344),t(851)),s=t(3029);const l={tableOfContents:"tableOfContents_HSmF",docItemContainer:"docItemContainer_W4yh"};var r=t(612);const o=["className"],c="table-of-contents__link toc-highlight",d="table-of-contents__link--active";function u(e){let{className:n}=e,t=(0,i.A)(e,o);return(0,r.jsx)("div",{className:(0,a.A)(l.tableOfContents,"thin-scrollbar",n),children:(0,r.jsx)(s.A,Object.assign({},t,{linkClassName:c,linkActiveClassName:d}))})}},3029:(e,n,t)=>{t.d(n,{A:()=>x});var i=t(8910),a=t(4344),s=t(6207);const l=["parentIndex"];function r(e){const n=e.map((e=>Object.assign({},e,{parentIndex:-1,children:[]}))),t=Array(7).fill(-1);n.forEach(((e,n)=>{const i=t.slice(2,e.level);e.parentIndex=Math.max(...i),t[e.level]=n}));const a=[];return n.forEach((e=>{const{parentIndex:t}=e,s=(0,i.A)(e,l);t>=0?n[t].children.push(s):a.push(s)})),a}function o(e){let{toc:n,minHeadingLevel:t,maxHeadingLevel:i}=e;return n.flatMap((e=>{const n=o({toc:e.children,minHeadingLevel:t,maxHeadingLevel:i});return function(e){return e.level>=t&&e.level<=i}(e)?[Object.assign({},e,{children:n})]:n}))}function c(e){const n=e.getBoundingClientRect();return n.top===n.bottom?c(e.parentNode):n}function d(e,n){var t;let{anchorTopOffset:i}=n;const a=e.find((e=>c(e).top>=i));if(a){var s;return function(e){return e.top>0&&e.bottom<window.innerHeight/2}(c(a))?a:null!=(s=e[e.indexOf(a)-1])?s:null}return null!=(t=e[e.length-1])?t:null}function u(){const e=(0,a.useRef)(0),{navbar:{hideOnScroll:n}}=(0,s.p)();return(0,a.useEffect)((()=>{e.current=n?0:document.querySelector(".navbar").clientHeight}),[n]),e}function m(e){const n=(0,a.useRef)(void 0),t=u();(0,a.useEffect)((()=>{if(!e)return()=>{};const{linkClassName:i,linkActiveClassName:a,minHeadingLevel:s,maxHeadingLevel:l}=e;function r(){const e=function(e){return Array.from(document.getElementsByClassName(e))}(i),r=function(e){let{minHeadingLevel:n,maxHeadingLevel:t}=e;const i=[];for(let a=n;a<=t;a+=1)i.push("h"+a+".anchor");return Array.from(document.querySelectorAll(i.join()))}({minHeadingLevel:s,maxHeadingLevel:l}),o=d(r,{anchorTopOffset:t.current}),c=e.find((e=>o&&o.id===function(e){return decodeURIComponent(e.href.substring(e.href.indexOf("#")+1))}(e)));e.forEach((e=>{!function(e,t){t?(n.current&&n.current!==e&&n.current.classList.remove(a),e.classList.add(a),n.current=e):e.classList.remove(a)}(e,e===c)}))}return document.addEventListener("scroll",r),document.addEventListener("resize",r),r(),()=>{document.removeEventListener("scroll",r),document.removeEventListener("resize",r)}}),[e,t])}var g=t(9555),f=t(612);function h(e){let{toc:n,className:t,linkClassName:i,isChild:a}=e;return n.length?(0,f.jsx)("ul",{className:a?void 0:t,children:n.map((e=>(0,f.jsxs)("li",{children:[(0,f.jsx)(g.A,{to:"#"+e.id,className:null!=i?i:void 0,dangerouslySetInnerHTML:{__html:e.value}}),(0,f.jsx)(h,{isChild:!0,toc:e.children,className:t,linkClassName:i})]},e.id)))}):null}const p=a.memo(h),v=["toc","className","linkClassName","linkActiveClassName","minHeadingLevel","maxHeadingLevel"];function x(e){let{toc:n,className:t="table-of-contents table-of-contents__left-border",linkClassName:l="table-of-contents__link",linkActiveClassName:c,minHeadingLevel:d,maxHeadingLevel:u}=e,g=(0,i.A)(e,v);const h=(0,s.p)(),x=null!=d?d:h.tableOfContents.minHeadingLevel,b=null!=u?u:h.tableOfContents.maxHeadingLevel,j=function(e){let{toc:n,minHeadingLevel:t,maxHeadingLevel:i}=e;return(0,a.useMemo)((()=>o({toc:r(n),minHeadingLevel:t,maxHeadingLevel:i})),[n,t,i])}({toc:n,minHeadingLevel:x,maxHeadingLevel:b});return m((0,a.useMemo)((()=>{if(l&&c)return{linkClassName:l,linkActiveClassName:c,minHeadingLevel:x,maxHeadingLevel:b}}),[l,c,x,b])),(0,f.jsx)(p,Object.assign({toc:j,className:t,linkClassName:l},g))}}}]);