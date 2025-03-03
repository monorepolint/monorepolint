"use strict";(self.webpackChunk_monorepolint_docs=self.webpackChunk_monorepolint_docs||[]).push([[48],{6021:(e,t,n)=>{n.r(t),n.d(t,{default:()=>ve});var a=n(4344),i=n(851),o=n(6298),s=n(7270),l=n(8617),c=n(8396),r=n(6680),d=n(9509),u=n(2131);const m={backToTopButton:"backToTopButton_IufP",backToTopButtonShow:"backToTopButtonShow__NGz"};var b=n(612);function h(){const{shown:e,scrollToTop:t}=function(e){let{threshold:t}=e;const[n,i]=(0,a.useState)(!1),o=(0,a.useRef)(!1),{startScroll:s,cancelScroll:l}=(0,d.gk)();return(0,d.Mq)(((e,n)=>{let{scrollY:a}=e;const s=null==n?void 0:n.scrollY;s&&(o.current?o.current=!1:a>=s?(l(),i(!1)):a<t?i(!1):a+window.innerHeight<document.documentElement.scrollHeight&&i(!0))})),(0,u.$)((e=>{e.location.hash&&(o.current=!0,i(!1))})),{shown:n,scrollToTop:()=>s(0)}}({threshold:300});return(0,b.jsx)("button",{"aria-label":(0,r.T)({id:"theme.BackToTopButton.buttonAriaLabel",message:"Scroll back to top",description:"The ARIA label for the back to top button"}),className:(0,i.A)("clean-btn",s.G.common.backToTopButton,m.backToTopButton,e&&m.backToTopButtonShow),type:"button",onClick:t})}var p=n(94),x=n(2905),j=n(5496),f=n(9773),g=n(8560);function v(e){return(0,b.jsx)("svg",Object.assign({width:"20",height:"20","aria-hidden":"true"},e,{children:(0,b.jsxs)("g",{fill:"#7a7a7a",children:[(0,b.jsx)("path",{d:"M9.992 10.023c0 .2-.062.399-.172.547l-4.996 7.492a.982.982 0 01-.828.454H1c-.55 0-1-.453-1-1 0-.2.059-.403.168-.551l4.629-6.942L.168 3.078A.939.939 0 010 2.528c0-.548.45-.997 1-.997h2.996c.352 0 .649.18.828.45L9.82 9.472c.11.148.172.347.172.55zm0 0"}),(0,b.jsx)("path",{d:"M19.98 10.023c0 .2-.058.399-.168.547l-4.996 7.492a.987.987 0 01-.828.454h-3c-.547 0-.996-.453-.996-1 0-.2.059-.403.168-.551l4.625-6.942-4.625-6.945a.939.939 0 01-.168-.55 1 1 0 01.996-.997h3c.348 0 .649.18.828.45l4.996 7.492c.11.148.168.347.168.55zm0 0"})]})}))}const _="collapseSidebarButton_egAv",C="collapseSidebarButtonIcon_QCZj";function A(e){let{onClick:t}=e;return(0,b.jsx)("button",{type:"button",title:(0,r.T)({id:"theme.docs.sidebar.collapseButtonTitle",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),"aria-label":(0,r.T)({id:"theme.docs.sidebar.collapseButtonAriaLabel",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),className:(0,i.A)("button button--secondary button--outline",_),onClick:t,children:(0,b.jsx)(v,{className:C})})}var k=n(6082),S=n(8910),N=n(3199);const T=Symbol("EmptyContext"),I=a.createContext(T);function y(e){let{children:t}=e;const[n,i]=(0,a.useState)(null),o=(0,a.useMemo)((()=>({expandedItem:n,setExpandedItem:i})),[n]);return(0,b.jsx)(I.Provider,{value:o,children:t})}var w=n(4357),B=n(4916),L=n(2526),E=n(8711);const H=["item","onItemClick","activePath","level","index"];function M(e){let{collapsed:t,categoryLabel:n,onClick:a}=e;return(0,b.jsx)("button",{"aria-label":t?(0,r.T)({id:"theme.DocSidebarItem.expandCategoryAriaLabel",message:"Expand sidebar category '{label}'",description:"The ARIA label to expand the sidebar category"},{label:n}):(0,r.T)({id:"theme.DocSidebarItem.collapseCategoryAriaLabel",message:"Collapse sidebar category '{label}'",description:"The ARIA label to collapse the sidebar category"},{label:n}),"aria-expanded":!t,type:"button",className:"clean-btn menu__caret",onClick:a})}function P(e){let{item:t,onItemClick:n,activePath:o,level:c,index:r}=e,d=(0,S.A)(e,H);const{items:u,label:m,collapsible:h,className:p,href:x}=t,{docs:{sidebar:{autoCollapseCategories:j}}}=(0,f.p)(),g=function(e){const t=(0,E.A)();return(0,a.useMemo)((()=>e.href&&!e.linkUnlisted?e.href:!t&&e.collapsible?(0,l.Nr)(e):void 0),[e,t])}(t),v=(0,l.w8)(t,o),_=(0,B.ys)(x,o),{collapsed:C,setCollapsed:A}=(0,w.u)({initialState:()=>!!h&&(!v&&t.collapsed)}),{expandedItem:k,setExpandedItem:y}=function(){const e=(0,a.useContext)(I);if(e===T)throw new N.dV("DocSidebarItemsExpandedStateProvider");return e}(),P=function(e){void 0===e&&(e=!C),y(e?null:r),A(e)};return function(e){let{isActive:t,collapsed:n,updateCollapsed:i}=e;const o=(0,N.ZC)(t);(0,a.useEffect)((()=>{t&&!o&&n&&i(!1)}),[t,o,n,i])}({isActive:v,collapsed:C,updateCollapsed:P}),(0,a.useEffect)((()=>{h&&null!=k&&k!==r&&j&&A(!0)}),[h,k,r,A,j]),(0,b.jsxs)("li",{className:(0,i.A)(s.G.docs.docSidebarItemCategory,s.G.docs.docSidebarItemCategoryLevel(c),"menu__list-item",{"menu__list-item--collapsed":C},p),children:[(0,b.jsxs)("div",{className:(0,i.A)("menu__list-item-collapsible",{"menu__list-item-collapsible--active":_}),children:[(0,b.jsx)(L.A,Object.assign({className:(0,i.A)("menu__link",{"menu__link--sublist":h,"menu__link--sublist-caret":!x&&h,"menu__link--active":v}),onClick:h?e=>{null==n||n(t),x?P(!1):(e.preventDefault(),P())}:()=>{null==n||n(t)},"aria-current":_?"page":void 0,role:h&&!x?"button":void 0,"aria-expanded":h&&!x?!C:void 0,href:h?null!=g?g:"#":g},d,{children:m})),x&&h&&(0,b.jsx)(M,{collapsed:C,categoryLabel:m,onClick:e=>{e.preventDefault(),P()}})]}),(0,b.jsx)(w.N,{lazy:!0,as:"ul",className:"menu__list",collapsed:C,children:(0,b.jsx)(q,{items:u,tabIndex:C?-1:0,onItemClick:n,activePath:o,level:c+1})})]})}var G=n(1046),O=n(4086);const R="menuExternalLink_mZhz",W=["item","onItemClick","activePath","level","index"];function D(e){let{item:t,onItemClick:n,activePath:a,level:o}=e,c=(0,S.A)(e,W);const{href:r,label:d,className:u,autoAddBaseUrl:m}=t,h=(0,l.w8)(t,a),p=(0,G.A)(r);return(0,b.jsx)("li",{className:(0,i.A)(s.G.docs.docSidebarItemLink,s.G.docs.docSidebarItemLinkLevel(o),"menu__list-item",u),children:(0,b.jsxs)(L.A,Object.assign({className:(0,i.A)("menu__link",!p&&R,{"menu__link--active":h}),autoAddBaseUrl:m,"aria-current":h?"page":void 0,to:r},p&&{onClick:n?()=>n(t):void 0},c,{children:[d,!p&&(0,b.jsx)(O.A,{})]}))},d)}const F="menuHtmlItem_xeAC";function z(e){let{item:t,level:n,index:a}=e;const{value:o,defaultStyle:l,className:c}=t;return(0,b.jsx)("li",{className:(0,i.A)(s.G.docs.docSidebarItemLink,s.G.docs.docSidebarItemLinkLevel(n),l&&[F,"menu__list-item"],c),dangerouslySetInnerHTML:{__html:o}},a)}const V=["item"];function U(e){let{item:t}=e,n=(0,S.A)(e,V);switch(t.type){case"category":return(0,b.jsx)(P,Object.assign({item:t},n));case"html":return(0,b.jsx)(z,Object.assign({item:t},n));default:return(0,b.jsx)(D,Object.assign({item:t},n))}}const Y=["items"];function Z(e){let{items:t}=e,n=(0,S.A)(e,Y);const a=(0,l.Y)(t,n.activePath);return(0,b.jsx)(y,{children:a.map(((e,t)=>(0,b.jsx)(U,Object.assign({item:e,index:t},n),t)))})}const q=(0,a.memo)(Z),Q="menu_V_Ck",X="menuWithAnnouncementBar_mXAu";function J(e){let{path:t,sidebar:n,className:o}=e;const l=function(){const{isActive:e}=(0,k.M)(),[t,n]=(0,a.useState)(e);return(0,d.Mq)((t=>{let{scrollY:a}=t;e&&n(0===a)}),[e]),e&&t}();return(0,b.jsx)("nav",{"aria-label":(0,r.T)({id:"theme.docs.sidebar.navAriaLabel",message:"Docs sidebar",description:"The ARIA label for the sidebar navigation"}),className:(0,i.A)("menu thin-scrollbar",Q,l&&X,o),children:(0,b.jsx)("ul",{className:(0,i.A)(s.G.docs.docSidebarMenu,"menu__list"),children:(0,b.jsx)(q,{items:n,activePath:t,level:1})})})}const K="sidebar_glJC",$="sidebarWithHideableNavbar_ZSht",ee="sidebarHidden_z2HW",te="sidebarLogo_U5Nw";function ne(e){let{path:t,sidebar:n,onCollapse:a,isHidden:o}=e;const{navbar:{hideOnScroll:s},docs:{sidebar:{hideable:l}}}=(0,f.p)();return(0,b.jsxs)("div",{className:(0,i.A)(K,s&&$,o&&ee),children:[s&&(0,b.jsx)(g.A,{tabIndex:-1,className:te}),(0,b.jsx)(J,{path:t,sidebar:n}),l&&(0,b.jsx)(A,{onClick:a})]})}const ae=a.memo(ne);var ie=n(1355),oe=n(4976);const se=e=>{let{sidebar:t,path:n}=e;const a=(0,oe.M)();return(0,b.jsx)("ul",{className:(0,i.A)(s.G.docs.docSidebarMenu,"menu__list"),children:(0,b.jsx)(q,{items:t,activePath:n,onItemClick:e=>{"category"===e.type&&e.href&&a.toggle(),"link"===e.type&&a.toggle()},level:1})})};function le(e){return(0,b.jsx)(ie.GX,{component:se,props:e})}const ce=a.memo(le);function re(e){const t=(0,j.l)(),n="desktop"===t||"ssr"===t,a="mobile"===t;return(0,b.jsxs)(b.Fragment,{children:[n&&(0,b.jsx)(ae,Object.assign({},e)),a&&(0,b.jsx)(ce,Object.assign({},e))]})}const de={expandButton:"expandButton_lQcn",expandButtonIcon:"expandButtonIcon_h3aw"};function ue(e){let{toggleSidebar:t}=e;return(0,b.jsx)("div",{className:de.expandButton,title:(0,r.T)({id:"theme.docs.sidebar.expandButtonTitle",message:"Expand sidebar",description:"The ARIA label and title attribute for expand button of doc sidebar"}),"aria-label":(0,r.T)({id:"theme.docs.sidebar.expandButtonAriaLabel",message:"Expand sidebar",description:"The ARIA label and title attribute for expand button of doc sidebar"}),tabIndex:0,role:"button",onKeyDown:t,onClick:t,children:(0,b.jsx)(v,{className:de.expandButtonIcon})})}const me={docSidebarContainer:"docSidebarContainer_tFtf",docSidebarContainerHidden:"docSidebarContainerHidden_PDBl",sidebarViewport:"sidebarViewport_Sy2y"};function be(e){var t;let{children:n}=e;const i=(0,c.t)();return(0,b.jsx)(a.Fragment,{children:n},null!=(t=null==i?void 0:i.name)?t:"noSidebar")}function he(e){let{sidebar:t,hiddenSidebarContainer:n,setHiddenSidebarContainer:o}=e;const{pathname:l}=(0,x.zy)(),[c,r]=(0,a.useState)(!1),d=(0,a.useCallback)((()=>{c&&r(!1),!c&&(0,p.O)()&&r(!0),o((e=>!e))}),[o,c]);return(0,b.jsx)("aside",{className:(0,i.A)(s.G.docs.docSidebarContainer,me.docSidebarContainer,n&&me.docSidebarContainerHidden),onTransitionEnd:e=>{e.currentTarget.classList.contains(me.docSidebarContainer)&&n&&r(!0)},children:(0,b.jsx)(be,{children:(0,b.jsxs)("div",{className:(0,i.A)(me.sidebarViewport,c&&me.sidebarViewportHidden),children:[(0,b.jsx)(re,{sidebar:t,path:l,onCollapse:d,isHidden:c}),c&&(0,b.jsx)(ue,{toggleSidebar:d})]})})})}const pe={docMainContainer:"docMainContainer_u3qQ",docMainContainerEnhanced:"docMainContainerEnhanced_Cwi4",docItemWrapperEnhanced:"docItemWrapperEnhanced_ikFu"};function xe(e){let{hiddenSidebarContainer:t,children:n}=e;const a=(0,c.t)();return(0,b.jsx)("main",{className:(0,i.A)(pe.docMainContainer,(t||!a)&&pe.docMainContainerEnhanced),children:(0,b.jsx)("div",{className:(0,i.A)("container padding-top--md padding-bottom--lg",pe.docItemWrapper,t&&pe.docItemWrapperEnhanced),children:n})})}const je={docRoot:"docRoot_ngfC",docsWrapper:"docsWrapper_mdyH"};function fe(e){let{children:t}=e;const n=(0,c.t)(),[i,o]=(0,a.useState)(!1);return(0,b.jsxs)("div",{className:je.docsWrapper,children:[(0,b.jsx)(h,{}),(0,b.jsxs)("div",{className:je.docRoot,children:[n&&(0,b.jsx)(he,{sidebar:n.items,hiddenSidebarContainer:i,setHiddenSidebarContainer:o}),(0,b.jsx)(xe,{hiddenSidebarContainer:i,children:t})]})]})}var ge=n(8010);function ve(e){const t=(0,l.B5)(e);if(!t)return(0,b.jsx)(ge.A,{});const{docElement:n,sidebarName:a,sidebarItems:r}=t;return(0,b.jsx)(o.e3,{className:(0,i.A)(s.G.page.docsDocPage),children:(0,b.jsx)(c.V,{name:a,items:r,children:(0,b.jsx)(fe,{children:n})})})}},8010:(e,t,n)=>{n.d(t,{A:()=>l});n(4344);var a=n(851),i=n(6680),o=n(6545),s=n(612);function l(e){let{className:t}=e;return(0,s.jsx)("main",{className:(0,a.A)("container margin-vert--xl",t),children:(0,s.jsx)("div",{className:"row",children:(0,s.jsxs)("div",{className:"col col--6 col--offset-3",children:[(0,s.jsx)(o.A,{as:"h1",className:"hero__title",children:(0,s.jsx)(i.A,{id:"theme.NotFound.title",description:"The title of the 404 page",children:"Page Not Found"})}),(0,s.jsx)("p",{children:(0,s.jsx)(i.A,{id:"theme.NotFound.p1",description:"The first paragraph of the 404 page",children:"We could not find what you were looking for."})}),(0,s.jsx)("p",{children:(0,s.jsx)(i.A,{id:"theme.NotFound.p2",description:"The 2nd paragraph of the 404 page",children:"Please contact the owner of the site that linked you to the original URL and let them know their link is broken."})})]})})})}}}]);