---
slug: zero-five-zero
title: v0.5.0
author: Eric Anderson
author_title: Front End Architect @ Palantir
author_url: https://github.com/ericanderson
author_image_url: https://avatars0.githubusercontent.com/u/120899?s=400&v=4
---

After years of 'alpha' status while being continuously used internally, I am proud to 
announce monorepolint v0.5.0.

A lot has changed to make MRL easier to use:

* Config file just uses function invocation over magic strings, providing type checking to not only the internal rules but also any other rule you want.
* This new system also makes it easier for you to build helpers for configuring large and  complete repositories.
* Massive performance imporvements have been developed after using MRL on a 1000+ package repository. Checking entire large repos with the internal rules now takes seconds instead of minutes.
* Writing rules has become much more straight forward.

Other noteable changes:

* MRL is now entirely ESM. 
* Node 16 support has been dropped due to it being EOL.
* Many more