---
title: Postgre 디비 및 사용자 생성  
date: 2025-08-31 10:42:13
tags: [Blog]
categories: [Blog]
toc: true
---

- Postgre SQL 디비 생성 및 사용자 생성 방법

![](../../images/gfpe1m.jpg)

```sql
CREATE USER wp WITH PASSWORD 'wp';

CREATE DATABASE wpdb OWNER wp;

GRANT ALL PRIVILEGES ON DATABASE wpdb TO wp;
```

- DBeaver 설정방법

![](../../images/kemydf.jpg)