---
title: Hexo 에 글 포함하기 
date: 2025-06-22 22:09:10
tags: [일상]
category: [일반글]
---

# Hexo 에 글 포함하기
Hexo 로 글을 쓰다가 이전글을 포함해서 글을 쓰는 경우가 생겼다.
예를 들어 vue 설치 글을 쓴다고 가정하자. 그럼 우선 node.js 를 설치를 진행해야 한다.
node.js 설치하는 문서는 이미 만들었다고 가정한다면  보통의 경우에는 vue 설치 과정만
설명을 하고 node.js 설치하는 방법은 링크를 걸어 보여주도록 한다. 하지만 이건
페이지를 벗어나야 되기 때문에 좋은 방법은 아니라고 생각한다.

신규 쓰는 페이지에 다른 페이지 내용을 포함할수 있을까? 그러면 블로거는 글을
중복해서 쓸필요가 없어지고 블로그를 이용하는 사용자도 한번에 읽어 나가니까
편하지 않을까 ?

쉽게 include 가 될까? 한번 해보자!!! 

![https://goodsaem.github.io/](../../images/xmg036.jpg)

소개글을 include 해보자

{% incl inc %}

## 계속 테스트
계속 테스트를 해보았지만 되지 않는다..
다른 방법으로 내일 다시 시도해 봐야 겠다..

## 결국성공

이곳저곳 소스를 수정하여 결국 성공했다..

---
## 필요한 라이브러리부터 추가

```
npm install markdown-it
```

## scripts에 incl-tag.js 추가

```js incl-tag.js
const fs = require('fs');
const path = require('path');
const md = require('markdown-it')();

hexo.extend.tag.register('incl', function(args) {
    const name = args[0];
    const filePath = path.join(hexo.source_dir, '_includes', `${name}.md`);
    if (!fs.existsSync(filePath)) {
        return `<!-- include not found: ${name} -->`;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return md.render(content);
}, { async: false });

```

## package.json 파일에 prehexo 추가
```json package.json
... 중략 ...
  "scripts": {
    "prehexo": "node scripts/incl-tag.js",
    "build": "hexo generate",
    "clean": "hexo clean",
    "deploy": "hexo deploy",
    "server": "hexo server"
  },
... 중략 ...  
```

## 인클루드 하고자하는 페이지에서 _includes 에 있는 inc 파일 include
```md markdown
{% incl inc %}
```

## inc.md
```markdown
---
# inc.md

여기부터는 inc.md 파일 내용이다.

```bash bash

디렉토리 구조는 아래와 같다.

source
  ├─_includes
      inc.md
```

여기까지 inc.md 파일 내용이다.

---


```
