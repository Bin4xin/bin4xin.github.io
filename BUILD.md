# Build

## 常规Git Push操作

- 命令行：

```bash
git add .
git commit -m "[`date +%Y/%m/%d/%T`]<移除::.DS_Store>: commit by `git config --global --list|grep user.name|awk -F"=" '{print $2}'`"
#Linux
#[`date +%Y/%m/%d/%T`]Linux时间戳；
#<移除::.DS_Store> 需要修改的；思路为：<[操作:移除/修复/更新/etc..]::本次上传修改的文件/.DS_Store>
#commit by `git config --global --list|grep user.name|awk -F"=" '{print $2}'` 取出操作人

#Windows
> (推荐windows Git Bash) git commit -m "[`date +%Y/%m/%d/%T`]<测试::GitBash on MSWin>: commit by `git config --global --list|grep user.name|awk -F"=" '{print $2}'`"
#[SCS-1.0-dev bfc8df8] [2021/12/07/13:59:59]<测试::GitBash on MSWin>: commit by sentryCyberSec
git push -u origin main
```

全新的仓库若希望修改默认的master分支可以：`git branch -M main`修改分支名称master为main。

## Git全局禁止一些文件上传到仓库

- 如`.DS_Store`

1. 将 `.DS_Store` 加入全局的 `.gitignore` 文件，执行命令：

```bash
echo .DS_Store >> ~/.gitignore_global
```

2. 将这个全局的 `.gitignore` 文件加入Git的全局config文件中，执行命令：

```bash
git config --global core.excludesfile ~/.gitignore_global
```