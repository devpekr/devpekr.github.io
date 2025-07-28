---
title: 캘린더 프로젝트  
date: 2025-07-20 09:48:51
tags: [Blog]
categories: [Blog]
toc: true
---

```bash
Microsoft Windows [Version 10.0.26100.4484]
(c) Microsoft Corporation. All rights reserved.

C:\calendar>quasar create frontend

 · For scaffolding an official Quasar project please use this instead:

   npm init quasar
     (or)
   yarn create quasar
     (or)
   pnpm create quasar
     (or)
   bun create quasar

 · For scaffolding a custom starter kit please use this instead:

   npm install -g @quasar/legacy-create
     (or)
   yarn global add @quasar/legacy-create
     (or)
   pnpm add -g @quasar/legacy-create
     (or)
   bun install -g @quasar/legacy-create

     ...and then:
   quasar-legacy-create <project-name> <kit-name> [--branch <version-name>]


C:\calendar>npm init quasar
Need to install the following packages:
create-quasar@2.0.5
Ok to proceed? (y)


> npx
> create-quasar



 .d88888b.
d88P" "Y88b
888     888
888     888 888  888  8888b.  .d8888b   8888b.  888d888
888     888 888  888     "88b 88K          "88b 888P"
888 Y8b 888 888  888 .d888888 "Y8888b. .d888888 888
Y88b.Y8b88P Y88b 888 888  888      X88 888  888 888
 "Y888888"   "Y88888 "Y888888  88888P' "Y888888 888
       Y8b

√ What would you like to build? » App with Quasar CLI, let's go!
√ Project folder: ... frontend
√ Pick script type: » Javascript
√ Pick Quasar App CLI variant: » Quasar App CLI with Vite
√ Package name: ... frontend
√ Project product name: (must start with letter if building mobile apps) ... calendar
√ Project description: ... calendar
√ Pick a Vue component style: » Composition API with <script setup>
√ Pick your CSS preprocessor: » Sass with SCSS syntax
√ Check the features needed for your project: » Linting (vite-plugin-checker + ESLint), State Management (Pinia), axios, vue-i18n
√ Add Prettier for code formatting? ... yes

 Quasar • Generating files...

 - index.html
 - postcss.config.js
 - public/favicon.ico
 - public/icons/favicon-128x128.png
 - public/icons/favicon-16x16.png
 - public/icons/favicon-32x32.png
 - public/icons/favicon-96x96.png
 - quasar.config.js
 - README.md
 - src/App.vue
 - src/assets/quasar-logo-vertical.svg
 - src/boot/.gitkeep
 - src/components/EssentialLink.vue
 - src/layouts/MainLayout.vue
 - src/pages/ErrorNotFound.vue
 - src/pages/IndexPage.vue
 - src/router/index.js
 - src/router/routes.js
 - .editorconfig
 - .gitignore
 - .npmrc
 - .vscode/extensions.json
 - .vscode/settings.json
 - jsconfig.json
 - package.json
 - src/css/app.scss
 - src/css/quasar.variables.scss
 - src/boot/axios.js
 - src/boot/i18n.js
 - src/i18n/en-US/index.js
 - src/i18n/index.js
 - eslint.config.js
 - .prettierrc.json
 - src/stores/example-store.js
 - src/stores/index.js

 Quasar •  SUCCESS  • The project has been scaffolded

√ Install project dependencies? (recommended) » Yes, use npm


> frontend@0.0.1 postinstall
> quasar prepare


 .d88888b.
d88P" "Y88b
888     888
888     888 888  888  8888b.  .d8888b   8888b.  888d888
888     888 888  888     "88b 88K          "88b 888P"
888 Y8b 888 888  888 .d888888 "Y8888b. .d888888 888
Y88b.Y8b88P Y88b 888 888  888      X88 888  888 888
 "Y888888"   "Y88888 "Y888888  88888P' "Y888888 888
       Y8b

 App • Using quasar.config.js in "esm" format
 App • Generated tsconfig.json and types files in .quasar directory
 App • The app is now prepared for linting, type-checking, IDE integration, etc.

added 519 packages, and audited 520 packages in 2m

137 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities



> frontend@0.0.1 format
> prettier --write "**/*.{js,vue,scss,html,md,json}" --ignore-path .gitignore

.prettierrc.json 44ms
.vscode/extensions.json 3ms
.vscode/settings.json 2ms
eslint.config.js 19ms
index.html 40ms
jsconfig.json 1ms
package-lock.json 139ms (unchanged)
package.json 12ms
postcss.config.js 7ms
quasar.config.js 16ms
README.md 42ms
src/App.vue 6ms (unchanged)
src/boot/axios.js 13ms (unchanged)
src/boot/i18n.js 4ms
src/components/EssentialLink.vue 13ms
src/css/app.scss 23ms (unchanged)
src/css/quasar.variables.scss 7ms
src/i18n/en-US/index.js 2ms
src/i18n/index.js 1ms
src/layouts/MainLayout.vue 29ms
src/pages/ErrorNotFound.vue 15ms
src/pages/IndexPage.vue 8ms
src/router/index.js 8ms
src/router/routes.js 3ms
src/stores/example-store.js 4ms
src/stores/index.js 2ms (unchanged)


warning: in the working copy of '.editorconfig', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of '.gitignore', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of '.npmrc', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of '.prettierrc.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of '.vscode/extensions.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of '.vscode/settings.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'eslint.config.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'index.html', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'jsconfig.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package-lock.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'postcss.config.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'quasar.config.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/App.vue', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/assets/quasar-logo-vertical.svg', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/boot/axios.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/boot/i18n.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/EssentialLink.vue', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/css/app.scss', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/css/quasar.variables.scss', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/i18n/en-US/index.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/i18n/index.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/layouts/MainLayout.vue', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/ErrorNotFound.vue', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/IndexPage.vue', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/router/index.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/router/routes.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/stores/example-store.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/stores/index.js', LF will be replaced by CRLF the next time Git touches it
 Quasar • Initialized Git repository �

 To get started:

   cd frontend
   quasar dev # or: yarn quasar dev # or: npx quasar dev

 Documentation can be found at: https://quasar.dev

 Quasar is relying on donations to evolve. We'd be very grateful if you can
 read our manifest on "Why donations are important": https://quasar.dev/why-donate
 Donation campaign: https://donate.quasar.dev
 Any amount is very welcome.
 If invoices are required, please first contact Razvan Stoenescu.

 Please give us a star on Github if you appreciate our work:
   https://github.com/quasarframework/quasar

 Enjoy! - Quasar Team


```

```bash
npm install vue-cal
```