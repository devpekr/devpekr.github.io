---
title: 무료도메인 발급받고 오라클 클라우드 연결  
date: 2025-07-10 23:47:41
tags: [Blog]
categories: [Blog]
toc: true
---

## 개요
https://goodsaem.duckdns.org/ 접속하면 아래와 같은 화면이 나오도록 한다.
향후 github page에서 api로 데이터를 주고 받을때 https 설정이 필요하다.

<!-- https://tagassistant.google.com/#/?id=GTM-5VG62JT9&url=https%3A%2F%2Fgoodsaem.github.io%2Flmrxzo%2F&source=TAG_MANAGER&gtm_auth=Fbq6w8AAB7kTk9ynBhUBYg&gtm_preview=3 -->

![](../../images/f4ookb.jpg)

## 먼저 터미널로 접속한다.

![](../../images/oyz5f4.jpg)

## 패키지를 업데이트한다.

```bash
sudo apt-get update
```

## 아래와 같이 업데이트가 진행됨
```bash
1-ad-1.clouds.archive.ubuntu.com/ubuntu noble InReleas                                                                                                                                                                                                              e
Get:2 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-updates                                                                                                                                                                                                               InRelease [126 kB]
Get:3 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]
Get:4 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-backport                                                                                                                                                                                                              s InRelease [126 kB]
Get:5 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-updates/                                                                                                                                                                                                              main amd64 Packages [1237 kB]
Get:6 http://security.ubuntu.com/ubuntu noble-security/main amd64 Components [21                                                                                                                                                                                                              .5 kB]
Get:7 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-updates/                                                                                                                                                                                                              main Translation-en [253 kB]
Get:8 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-updates/                                                                                                                                                                                                              main amd64 Components [163 kB]
Get:9 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-updates/                                                                                                                                                                                                              universe amd64 Packages [1105 kB]
Get:10 http://security.ubuntu.com/ubuntu noble-security/universe amd64 Component                                                                                                                                                                                                              s [52.3 kB]
Get:11 http://security.ubuntu.com/ubuntu noble-security/restricted amd64 Compone                                                                                                                                                                                                              nts [212 B]
Get:12 http://security.ubuntu.com/ubuntu noble-security/multiverse amd64 Compone                                                                                                                                                                                                              nts [212 B]
Get:13 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-updates                                                                                                                                                                                                              /universe amd64 Components [376 kB]
Get:14 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-updates                                                                                                                                                                                                              /restricted amd64 Packages [1418 kB]
Get:15 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-updates                                                                                                                                                                                                              /restricted Translation-en [303 kB]
Get:16 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-updates                                                                                                                                                                                                              /restricted amd64 Components [212 B]
Get:17 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-updates                                                                                                                                                                                                              /multiverse amd64 Components [940 B]
Get:18 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-backpor                                                                                                                                                                                                              ts/main amd64 Components [7056 B]
Get:19 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-backpor                                                                                                                                                                                                              ts/universe amd64 Components [28.4 kB]
Get:20 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-backpor                                                                                                                                                                                                              ts/restricted amd64 Components [216 B]
Get:21 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-backpor                                                                                                                                                                                                              ts/multiverse amd64 Components [212 B]
Fetched 5345 kB in 5s (1046 kB/s)
Reading package lists... Done
```

## nginx 를 설치한다.

```bash
sudo apt-get install nginx -y
```

## 아래와 같이 설치가 진행됨

```bash
 sudo apt-get install nginx -y
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following additional packages will be installed:
  nginx-common
Suggested packages:
  fcgiwrap nginx-doc ssl-cert
The following NEW packages will be installed:
  nginx nginx-common
0 upgraded, 2 newly installed, 0 to remove and 34 not upgraded.
Need to get 564 kB of archives.
After this operation, 1596 kB of additional disk space will be used.
Get:1 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-updates/main amd64 nginx-common all 1.24.0-2ubuntu7.4 [43.4 kB]
Get:2 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-updates/main amd64 nginx amd64 1.24.0-2ubuntu7.4 [521 kB]
Fetched 564 kB in 3s (210 kB/s)
Preconfiguring packages ...
Selecting previously unselected package nginx-common.
(Reading database ... 115013 files and directories currently installed.)
Preparing to unpack .../nginx-common_1.24.0-2ubuntu7.4_all.deb ...
Unpacking nginx-common (1.24.0-2ubuntu7.4) ...
Selecting previously unselected package nginx.
Preparing to unpack .../nginx_1.24.0-2ubuntu7.4_amd64.deb ...
Unpacking nginx (1.24.0-2ubuntu7.4) ...
Setting up nginx-common (1.24.0-2ubuntu7.4) ...
Created symlink /etc/systemd/system/multi-user.target.wants/nginx.service → /usr/lib/systemd/system/nginx.service.
Setting up nginx (1.24.0-2ubuntu7.4) ...
 * Upgrading binary nginx                                                                                                                                                                                                                                                              [ OK ]
Processing triggers for man-db (2.12.0-4build2) ...
Scanning processes...
Scanning candidates...
Scanning linux images...

Pending kernel upgrade!
Running kernel version:
  6.8.0-1026-oracle
Diagnostics:
  The currently running kernel version is not the expected kernel version 6.8.0-1028-oracle.

Restarting the system to load the new kernel will not be handled automatically, so you should consider rebooting.

Restarting services...

Service restarts being deferred:
 /etc/needrestart/restart.d/dbus.service
 systemctl restart systemd-logind.service
 systemctl restart unattended-upgrades.service

No containers need to be restarted.

No user sessions are running outdated binaries.

No VM guests are running outdated hypervisor (qemu) binaries on this host.
```

## nginx 상태를 확인한다.
```bash
systemctl status nginx.service
```

```bash
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; preset: enabled)
     Active: active (running) since Thu 2025-07-10 14:50:12 UTC; 55s ago
       Docs: man:nginx(8)
    Process: 95287 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
    Process: 95297 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
   Main PID: 95333 (nginx)
      Tasks: 3 (limit: 1086)
     Memory: 2.4M (peak: 5.3M)
        CPU: 246ms
     CGroup: /system.slice/nginx.service
             ├─95333 "nginx: master process /usr/sbin/nginx -g daemon on; master_process on;"
             ├─95336 "nginx: worker process"
             └─95337 "nginx: worker process"

Jul 10 14:50:12 ubuntu-20250629 systemd[1]: Starting nginx.service - A high performance web server and a reverse proxy server...
Jul 10 14:50:12 ubuntu-20250629 systemd[1]: Started nginx.service - A high performance web server and a reverse proxy server.
```

## nginx 서비스를 등록한다.

```bash
sudo systemctl enable nginx
```

```bash
Synchronizing state of nginx.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.
Executing: /usr/lib/systemd/systemd-sysv-install enable nginx
```

## 오라클 클라우드에 80/443 포트를 오픈한다.

- 네트워킹 > 가상 클라우드 네트워크를 선택한다.

![](../../images/sctft2.jpg)

- VCN 이름을 클릭한다

![](../../images/bf0j6p.jpg)

- 보안 탭을 클릭 후 이름을 클릭한다.

![](../../images/kjk67q.jpg)

- 보안 규칙 탭을 클릭한다.

![](../../images/l5y61g.jpg)

- 규칙 추가 버튼 클릭 >  소스 0.0.0.0/0 입력 > 대상포트범위 80,443 입력 > 설명 http,https 입력

![](../../images/fog6h9.jpg)

- Duck DNS 회원가입을 sub domain을 지정하고 goodsaem 아이피를 입력한다.

https://www.duckdns.org/

![](../../images/eh21u9.jpg)

---

## 방화벽 서비스를 오픈한다. (80/443 포트 오픈)

```bash
sudo iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT

```

## http 접속
http://goodsaem.duckdns.org/


## https 설정을 진행한다.
- 
- 우선 업데이트

```bash
sudo apt update
````

```bash
Hit:1 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble InRelease
Hit:2 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-updates InRelease
Hit:3 http://security.ubuntu.com/ubuntu noble-security InRelease
Hit:4 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble-backports InRelease
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
34 packages can be upgraded. Run 'apt list --upgradable' to see them.
```

- certbot 및 python3-certbot-nginx 설치

```bash
sudo apt install certbot python3-certbot-nginx
```

- 설치 중간에 Y 를 선택한다.

```bash
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following additional packages will be installed:
  python3-acme python3-certbot python3-configargparse python3-icu python3-josepy python3-parsedatetime python3-rfc3339
Suggested packages:
  python-certbot-doc python3-certbot-apache python-acme-doc python-certbot-nginx-doc
The following NEW packages will be installed:
  certbot python3-acme python3-certbot python3-certbot-nginx python3-configargparse python3-icu python3-josepy
  python3-parsedatetime python3-rfc3339
0 upgraded, 9 newly installed, 0 to remove and 34 not upgraded.
Need to get 1097 kB of archives.
After this operation, 5699 kB of additional disk space will be used.
Do you want to continue? [Y/n] y
Get:1 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble/universe amd64 python3-josepy all 1.14.0-1 [22.1 kB]
Get:2 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble/universe amd64 python3-rfc3339 all 1.1-4 [6744 B]
Get:3 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble/universe amd64 python3-acme all 2.9.0-1 [48.5 kB]
Get:4 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble/universe amd64 python3-configargparse all 1.7-1 [31.7                                                                                                                                                                 kB]
Get:5 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble/universe amd64 python3-parsedatetime all 2.6-3 [32.8 k                                                                                                                                                                B]
Get:6 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble/universe amd64 python3-certbot all 2.9.0-1 [267 kB]
Get:7 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble/universe amd64 certbot all 2.9.0-1 [89.2 kB]
Get:8 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble/universe amd64 python3-certbot-nginx all 2.9.0-1 [66.0                                                                                                                                                                 kB]
Get:9 http://ap-chuncheon-1-ad-1.clouds.archive.ubuntu.com/ubuntu noble/main amd64 python3-icu amd64 2.12-1build2 [534 kB]
Fetched 1097 kB in 2s (625 kB/s)
Preconfiguring packages ...
Selecting previously unselected package python3-josepy.
(Reading database ... 115061 files and directories currently installed.)
Preparing to unpack .../0-python3-josepy_1.14.0-1_all.deb ...
Unpacking python3-josepy (1.14.0-1) ...
Selecting previously unselected package python3-rfc3339.
Preparing to unpack .../1-python3-rfc3339_1.1-4_all.deb ...
Unpacking python3-rfc3339 (1.1-4) ...
Selecting previously unselected package python3-acme.
Preparing to unpack .../2-python3-acme_2.9.0-1_all.deb ...
Unpacking python3-acme (2.9.0-1) ...
Selecting previously unselected package python3-configargparse.
Preparing to unpack .../3-python3-configargparse_1.7-1_all.deb ...
Unpacking python3-configargparse (1.7-1) ...
Selecting previously unselected package python3-parsedatetime.
Preparing to unpack .../4-python3-parsedatetime_2.6-3_all.deb ...
Unpacking python3-parsedatetime (2.6-3) ...
Selecting previously unselected package python3-certbot.
Preparing to unpack .../5-python3-certbot_2.9.0-1_all.deb ...
Unpacking python3-certbot (2.9.0-1) ...
Selecting previously unselected package certbot.
Preparing to unpack .../6-certbot_2.9.0-1_all.deb ...
Unpacking certbot (2.9.0-1) ...
Selecting previously unselected package python3-certbot-nginx.
Preparing to unpack .../7-python3-certbot-nginx_2.9.0-1_all.deb ...
Unpacking python3-certbot-nginx (2.9.0-1) ...
Selecting previously unselected package python3-icu.
Preparing to unpack .../8-python3-icu_2.12-1build2_amd64.deb ...
Unpacking python3-icu (2.12-1build2) ...
Setting up python3-configargparse (1.7-1) ...
Setting up python3-parsedatetime (2.6-3) ...
Setting up python3-icu (2.12-1build2) ...
Setting up python3-josepy (1.14.0-1) ...
Setting up python3-rfc3339 (1.1-4) ...
Setting up python3-acme (2.9.0-1) ...
Setting up python3-certbot (2.9.0-1) ...
Setting up certbot (2.9.0-1) ...
Created symlink /etc/systemd/system/timers.target.wants/certbot.timer → /usr/lib/systemd/system/certbot.timer.
Setting up python3-certbot-nginx (2.9.0-1) ...
Processing triggers for man-db (2.12.0-4build2) ...
Scanning processes...
Scanning candidates...
Scanning linux images...

Pending kernel upgrade!
Running kernel version:
  6.8.0-1026-oracle
Diagnostics:
  The currently running kernel version is not the expected kernel version 6.8.0-1028-oracle.

Restarting the system to load the new kernel will not be handled automatically, so you should consider rebooting.

Restarting services...

Service restarts being deferred:
 /etc/needrestart/restart.d/dbus.service
 systemctl restart systemd-logind.service
 systemctl restart unattended-upgrades.service

No containers need to be restarted.

No user sessions are running outdated binaries.

No VM guests are running outdated hypervisor (qemu) binaries on this host.
```

- certbot으로 https 인증서를 발급 받는다.

``` bash
sudo certbot --nginx -d goodsaem.duckdns.org
```

- 인증서 발급 > 이메일 주소 입력 xxxxxxx@gmail.com > y y 
```bash
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Enter email address (used for urgent renewal and security notices)
 (Enter 'c' to cancel): xxxxxxx@gmail.com

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please read the Terms of Service at
https://letsencrypt.org/documents/LE-SA-v1.5-February-24-2025.pdf. You must
agree in order to register with the ACME server. Do you agree?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: y

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Would you be willing, once your first certificate is successfully issued, to
share your email address with the Electronic Frontier Foundation, a founding
partner of the Let's Encrypt project and the non-profit organization that
develops Certbot? We'd like to send you email about our work encrypting the web,
EFF news, campaigns, and ways to support digital freedom.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: y
Account registered.
Requesting a certificate for goodsaem.duckdns.org

Certbot failed to authenticate some domains (authenticator: nginx). The Certificate Authority reported these problems:
  Domain: goodsaem.duckdns.org
  Type:   connection
  Detail: 13.209.73.95: Fetching http://goodsaem.duckdns.org/.well-known/acme-challenge/6FFLaN0ZhktyncVNMnJNNFRAmx3x_hNw5mRyTo                                                                                                                                                                Yoglw: Timeout during connect (likely firewall problem)

Hint: The Certificate Authority failed to verify the temporary nginx configuration changes made by Certbot. Ensure the listed                                                                                                                                                                 domains point to this nginx server and that it is accessible from the internet.

Some challenges have failed.
Ask for help or search for solutions at https://community.letsencrypt.org. See the logfile /var/log/letsencrypt/letsencrypt.lo                                                                                                                                                                g or re-run Certbot with -v for more details.
```

- http로 접속 되는지 확인함

```bash
curl -s http://goodsaem.duckdns.org
```
  
```html
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

- Let's Encrypt에서 SSL 인증서를 발급받아 Nginx 서버에 자동으로 설정

```bash
sudo certbot --nginx -d goodsaem.duckdns.org
```

```bash
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Requesting a certificate for goodsaem.duckdns.org

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/goodsaem.duckdns.org/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/goodsaem.duckdns.org/privkey.pem
This certificate expires on 2025-10-08.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

Deploying certificate
Successfully deployed certificate for goodsaem.duckdns.org to /etc/nginx/sites-enabled/default
Congratulations! You have successfully enabled HTTPS on https://goodsaem.duckdns.org

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
 * Donating to EFF:                    https://eff.org/donate-le
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

- 아래 명령어로 포트가 오픈되어 있는지 확인한다.
```bash
sudo iptables -L -n -v | grep 80

sudo iptables -L -n -v | grep 443
```

- Let's Encrypt 인증서 자동 갱신이 정상적으로 작동하는지 테스트

```bash
sudo certbot renew --dry-run
```

- 성공적으로 갱신됨

```bash
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Processing /etc/letsencrypt/renewal/goodsaem.duckdns.org.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Account registered.
Simulating renewal of an existing certificate for goodsaem.duckdns.org




- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Congratulations, all simulated renewals succeeded:
  /etc/letsencrypt/live/goodsaem.duckdns.org/fullchain.pem (success)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

## 최종확인
https://goodsaem.duckdns.org/ 접속

![](../../images/f4ookb.jpg)


