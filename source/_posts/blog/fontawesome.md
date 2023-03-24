---
title: hexo 에서 fontawesome 사용하기
date: 2023-03-23 21:40:32
tags: [fontawesome]
category: [블로그,hexo]
toc: true
---

{% asset_img fontawesome.png hexo에 fontawesome 아이콘 사용하기 %}

### {% fa home %} 개요
Hexo에서 Font Awesome 사용하는 방법은 여러가지가 있다.
쉬운 방법은 플러그인을 설치하는 방법이고 두번째는 fontawesome css를 테마에 추가하여 사용하는 방법이다.
둘다 정리 해본다.

### {% fa circle-plus %} 첫번째 방법 플러그인 설치
플러그인을 이용하는 방법이다. 
{% fa link %} 참고한 사이트
[fontawesom 플러그인 설치](https://openbase.com/js/hexo-tag-fontawesome "fontawesom 플러그인 설치")


#### 설치
아래 명령어를 입력하여 플러그인을 설치한다.
```shell
npm i hexo-tag-fontawesome --save
```

#### 사용법
아래와 같이 fa 하고 아이콘 이름을 넣고 옵션을 추가하면 된다.
```html
{% fa [icon-name] [options…] %}
```

아래는 사용법이다. (코드와 예시) 보다 자세한 사용법은 fontawesome 사이트를 참고할것.
[fontawesome 스타일링](https://fontawesome.com/docs/web/style/styling "fontawesom 스타일링")

##### 기본
```html
{% fa user %} 유저 아이콘 출력
```
{% fa user %} 유저 아이콘 출력

##### 아이콘 크기
```html
{% fa user 2xs %} 유저 아이콘 크기 2xs
{% fa user xs %} 유저 아이콘 크기 xs
{% fa user sm %} 유저 아이콘 크기 sm
{% fa user %} 유저 아이콘 크기 기본
{% fa user lg %} 유저 아이콘 크기 lg
{% fa user xl %} 유저 아이콘 크기 xl
{% fa user 2xl %} 유저 아이콘 크기 2xl
```
- {% fa user 2xs %} 유저 아이콘 크기 2xs
- {% fa user xs %} 유저 아이콘 크기 xs
- {% fa user sm %} 유저 아이콘 크기 sm
- {% fa user %} 유저 아이콘 크기 기본
- {% fa user lg %} 유저 아이콘 크기 lg
- {% fa user xl %} 유저 아이콘 크기 xl
- {% fa user 2xl %} 유저 아이콘 크기 2xl

##### 아이콘 유형
```html
{% fa user solid  %} 유저 아이콘 solid
{% fa user regular %} 유저 아이콘 regular
```
- {% fa user solid  %} 유저 아이콘 solid
- {% fa user regular %} 유저 아이콘 regular

##### 아이콘 회전
```html
{% fa coffee %} 무회전
{% fa coffee rotate-90 %} 90도 회전
{% fa coffee rotate-180 %} 180도 회전
{% fa coffee rotate-270 %} 270도 회전
{% fa coffee flip-horizontal %} 수평방향 회전
{% fa coffee flip-vertical %} 수직방향 회전
{% fa coffee flip-both %} 수평수직방향 회전
```
- {% fa coffee %} 무회전
- {% fa coffee rotate-90 %} 90도 회전
- {% fa coffee rotate-180 %} 180도 회전
- {% fa coffee rotate-270 %} 270도 회전
- {% fa coffee flip-horizontal %} 수평방향 회전
- {% fa coffee flip-vertical %} 수직방향 회전
- {% fa coffee flip-both %} 수평수직방향 회전

##### 아이콘 스타일링
```html
<span style="font-size: 3em; color: Tomato;">
  {% fa camera %}
</span>

<span style="font-size: 48px; color: Dodgerblue;">
    {% fa camera %}
</span>

<span style="font-size: 3rem;">
  <span style="color: Mediumslateblue;">
    {% fa camera %}
  </span>
</span>
```
<span style="font-size: 3em; color: Tomato;">
  {% fa camera %}
</span>

<span style="font-size: 48px; color: Dodgerblue;">
  {% fa camera %}
</span>

<span style="font-size: 3rem;">
  <span style="color: Mediumslateblue;">
    {% fa camera %}
  </span>
</span>

##### 아이콘 애니메이션
```html
{% fa circle-plus beat %}
{% fa heart beat %}
```

{% fa circle-plus beat %}
{% fa heart beat %}

---

### {% fa circle-plus %} 두번째 방법 css 직접 설치
첫번째 방벙은 아이콘을 간단하게 넣을수 있으나 정교한 style 링이 되지 않았다.
두번째 방법을 이용하면 아래와 같이 애니매이션 효과에 추가 속성을 추가할수 있다.

<div class="fa-3x" style="padding-left:14px;color:red">
  <i class="fa-solid fa-circle-plus fa-beat"></i>
  <i class="fa-solid fa-heart fa-beat"></i>
  <i class="fa-solid fa-heart fa-beat" style="--fa-animation-duration: 0.5s;" ></i>
  <i class="fa-solid fa-heart fa-beat" style="--fa-animation-duration: 2s;"></i>
  <i class="fa-solid fa-heart fa-beat" style="--fa-beat-scale: 2.0;"></i>
</div>

#### 설치
사용중인 테마파일의 head.ejs 에 아래와 같은 내용을 입력한다.
cdn 경우에는 계속 바뀔수 있으므로 fontawesome cdn 으로 검색 해서 최신버전으로 설치한다. 

{% asset_img fontawesome2.png head.ejs %}

```html 4번째줄추가 http://www.naver.com link [mark:4]
... 중략
<%- css('css/style') %>
<%- css('https://cdn.jsdelivr.net/font-iropke-batang/1.2/font-iropke-batang.css') %>
<%- css('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css') %>

<%- js('libs/jquery/3.5.0/jquery.min') %>
<%- partial('plugin/scripts', { isHead: true }) %>
... 중략
```

#### 사용법
아래와 같이 html 태그를 사용하고 class를 지정해주면 사용가능
상세내용은 fontawesome 사이트를 참고할것

##### 기본
```html
<div>
<i class="fa-solid fa-user"></i>
<i class="fa-regular fa-user"></i>
<i class="fa-sharp fa-solid fa-user"></i>
<i class="fa-sharp fa-regular fa-user"></i>
<i class="fa-brands fa-github-square"></i>
</div>
```

<div>
<i class="fa-solid fa-user"></i>
<i class="fa-regular fa-user"></i>
<i class="fa-sharp fa-solid fa-user"></i>
<i class="fa-sharp fa-regular fa-user"></i>
<i class="fa-brands fa-github-square"></i>
</div>

##### 회전
```html
<div class="fa-3x">
<i class="fa-solid fa-snowboarding"></i>
<i class="fa-solid fa-snowboarding fa-rotate-90"></i>
<i class="fa-solid fa-snowboarding fa-rotate-180"></i>
<i class="fa-solid fa-snowboarding fa-rotate-270"></i>
<i class="fa-solid fa-snowboarding fa-flip-horizontal"></i>
<i class="fa-solid fa-snowboarding fa-flip-vertical"></i>
<i class="fa-solid fa-snowboarding fa-flip-both"></i>
</div>
```
<div class="fa-3x">
<i class="fa-solid fa-snowboarding"></i>
<i class="fa-solid fa-snowboarding fa-rotate-90"></i>
<i class="fa-solid fa-snowboarding fa-rotate-180"></i>
<i class="fa-solid fa-snowboarding fa-rotate-270"></i>
<i class="fa-solid fa-snowboarding fa-flip-horizontal"></i>
<i class="fa-solid fa-snowboarding fa-flip-vertical"></i>
<i class="fa-solid fa-snowboarding fa-flip-both"></i>
</div>

##### 중첩
아래는 Font Awesome 아이콘을 중첩하는 방법에 대해서 정리한 내용이다.

1. 중첩할 두 아이콘의 부모 HTML 요소에 fa-stack 클래스를 추가한다.
2. 첫 번째 아이콘에 fa-stack-1x 클래스를 추가
3. 두 번째 아이콘에 fa-stack-2x 클래스를 추가
4. 선택적으로, 첫 번째 아이콘에 fa-inverse 클래스를 추가하여 두 번째 아이콘과 겹치는 부분을 knock-out(배경과 겹치는 부분을 비워놓는) 효과를 줄수있다.

```html
<span class="fa-stack">
  <i class="fas fa-circle fa-stack-2x"></i>
  <i class="fas fa-flag fa-stack-1x fa-inverse"></i>
</span>
```

<span class="fa-stack">
  <i class="fas fa-circle fa-stack-2x"></i>
  <i class="fas fa-flag fa-stack-1x fa-inverse"></i>
</span>


**중첩 예제**

```html
<span class="fa-stack fa-2x">
    <i class="fa-solid fa-square fa-stack-2x"></i>
    <i class="fab fa-twitter fa-stack-1x fa-inverse"></i>
</span>
<span class="fa-stack fa-2x">
    <i class="fa-solid fa-circle fa-stack-2x"></i>
    <i class="fa-solid fa-flag fa-stack-1x fa-inverse"></i>
</span>
<span class="fa-stack fa-2x">
    <i class="fa-solid fa-camera fa-stack-1x"></i>
    <i class="fa-solid fa-ban fa-stack-2x" style="color:Tomato"></i>
</span>
<span class="fa-stack fa-2x">
    <i class="fa-solid fa-square fa-stack-2x"></i>
    <i class="fa-solid fa-terminal fa-stack-1x fa-inverse"></i>
</span>
<span class="fa-stack fa-4x">
    <i class="fa-solid fa-square fa-stack-2x"></i>
    <i class="fa-solid fa-terminal fa-stack-1x fa-inverse"></i>
</span>
```


<span class="fa-stack fa-2x">
    <i class="fa-solid fa-square fa-stack-2x"></i>
    <i class="fab fa-twitter fa-stack-1x fa-inverse"></i>
  </span>
  <span class="fa-stack fa-2x">
    <i class="fa-solid fa-circle fa-stack-2x"></i>
    <i class="fa-solid fa-flag fa-stack-1x fa-inverse"></i>
  </span>
  <span class="fa-stack fa-2x">
    <i class="fa-solid fa-camera fa-stack-1x"></i>
    <i class="fa-solid fa-ban fa-stack-2x" style="color:Tomato"></i>
  </span>
  <span class="fa-stack fa-2x">
    <i class="fa-solid fa-square fa-stack-2x"></i>
    <i class="fa-solid fa-terminal fa-stack-1x fa-inverse"></i>
  </span>
  <span class="fa-stack fa-4x">
    <i class="fa-solid fa-square fa-stack-2x"></i>
    <i class="fa-solid fa-terminal fa-stack-1x fa-inverse"></i>
  </span>

### {% fa wifi %} 마무리
이제 hexo에서 아이콘을 사용할수 있다. 2가지 방식다 장단점이 있어 간단하게 사용할때는 첫번째
방법을 사용하고 좀더 효과를 주고 싶을때는 두번째 방법을 사용하는걸 추천한다.
