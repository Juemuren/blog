---
title: 高斯随机数生成器：Box-Muller 变换的数学证明和代码实现
date: 2026-06-10
categories: 数学
tags:
  - 均匀分布
  - 正态分布
  - 指数分布
  - 概率积分变换
  - 逆变换采样
summary: 用极坐标变换推导 Box-Muller 算法，并给出一个 JavaScript 实现。
---

Box-Muller 算法可以把独立的均匀分布随机数变换为独立的正态分布随机数

> 设 $U_1, U_2 \stackrel{\text{i.i.d.}}{\sim} U(0,1)$，则 $\sqrt{-2\ln U_1} \cos(2\pi U_2)$ 和 $\sqrt{-2\ln U_1} \sin(2\pi U_2)$ 独立且都服从标准正态分布 $\mathcal{N}(0,1)$。

这种算法简单得令人难以置信，不过证明它的正确性其实并不困难：核心思路是对二维正态分布进行极坐标变换。只要注意到二维正态分布独特的对称性质，那么接下来的一切推导就都是普通和理所当然的。

## 数学证明

### 二维正态分布的极坐标表示

众所周知，一维正态分布的概率密度函数为

$$
f_X(x) = \frac{1}{\sqrt{2\pi}\sigma} e^{\frac{-(x-\mu)^2}{2\sigma^2}} \quad x\in\mathbb{R}
$$

令 $\mu=0, \sigma=1$ 就可以得到标准正态分布

$$
f_X(x) = \frac{1}{\sqrt{2\pi}} e^{-\frac{x^2}{2}}
$$

二维正态分布与一维的类似。设 $X, Y \stackrel{\text{i.i.d.}}{\sim} \mathcal{N}(0,1)$，则其联合概率密度函数为

$$
f_{X,Y}(x,y) = \frac{1}{2\pi} e^{-\frac{x^2+y^2}{2}} \quad (x,y)\in\mathbb{R}^2
$$

对随机变量作极坐标变换

$$
\begin{cases}
  X = R\cos\Theta \\
  Y = R\sin\Theta
\end{cases}
$$

得到

$$
\begin{cases}
  x(r, \theta) = r\cos\theta \\
  y(r, \theta) = r\sin\theta
\end{cases}
$$

其中

$$
\begin{cases}
  r\ge 0 \\
  \theta\in[0,2\pi)
\end{cases}
$$

变换的雅可比矩阵为

$$
J = \begin{bmatrix}
  \frac{\partial x}{\partial r} & \frac{\partial x}{\partial \theta} \\
  \frac{\partial y}{\partial r} & \frac{\partial y}{\partial \theta}
\end{bmatrix} = \begin{bmatrix}
  \cos\theta & -r\sin\theta \\
  \sin\theta & r\cos\theta
\end{bmatrix}
$$

雅可比行列式为

$$
|J| =
\begin{vmatrix}
  \cos\theta & -r\sin\theta \\
  \sin\theta & r\cos\theta
\end{vmatrix}
= r\cos^2\theta + r\sin^2\theta
= r
$$

得到 $R,\Theta$ 的联合概率密度

$$
\begin{align*}
  f_{R,\Theta}(r,\theta) &= f_{X,Y}(x(r,\theta),y(r, \theta)) |J| \\
  &= \frac{1}{2\pi} e^{-\frac{(r\cos\theta)^2+(r\sin\theta)^2}{2}}r \\
  &= \frac{1}{2\pi} r e^{-\frac{r^2}{2}}
\end{align*}
$$

即

$$
f_{R,\Theta}(r,\theta) = \frac{1}{2\pi} r e^{-\frac{r^2}{2}} \quad r\ge 0, \theta\in[0,2\pi)
$$

计算 $\Theta$ 的边缘密度

$$
f_\Theta(\theta) = \int_0^{\infty} f_{R,\Theta}(r,\theta) \mathrm{d}r = \int_0^{\infty} \frac{1}{2\pi} r e^{-\frac{r^2}{2}} \mathrm{d}r
$$

不过这里并不需要真的进行积分——显然积分的结果是个和 $\theta$ 无关的常数。于是 $f_\Theta(\theta)$ 在取值范围内为常数。又已知 $\theta\in[0,2\pi)$，所以

$$
\Theta \sim U(0,2\pi)
$$

计算 $R$ 的边缘密度

$$
f_R(r)
= \int_0^{2\pi} f_{R,\Theta}(r,\theta) \mathrm{d}\theta
= \int_0^{2\pi} \frac{1}{2\pi} r e^{-\frac{r^2}{2}} \mathrm{d}\theta
= r e^{-\frac{r^2}{2}}
$$

如果缺乏注意力的话，这里不太能够直接看出 $R$ 的分布。但这个概率密度函数和指数分布的 $f_X(x)=\lambda e^{-\lambda x}$ 有点相似，因此接下来再对 $R$ 进行换元。

令 $R = \sqrt{S}$，则 $r(s) = \sqrt{s}$，从而有

$$
\begin{align*}
  f_S(s)
  &= f_R(r(s)) \left| \frac{\mathrm{d}r}{\mathrm{d}s} \right| \\
  &= f_R(\sqrt{s}) \left| \frac{\mathrm{d}\sqrt{s}}{\mathrm{d}s} \right| \\
  &= \sqrt{s} e^{-\frac{s}{2}} \frac{1}{2\sqrt{s}} \\
  &= \frac{1}{2} e^{-\frac{s}{2}}
\end{align*}
$$

现在和指数分布的概率密度完全一样了。因此 $S$ 服从 $\lambda=1/2$ 的指数分布，即

$$
S \sim \operatorname{Exp}(1/2)
$$

下一步就是把均匀分布的随机变量变为指数分布的随机变量。

### 随机变量逆变换

将随机变量 $X$ 变为 $Y$ 的通用公式为

$$
Y=F_Y^{-1}(F_X(X))
$$

该公式分为两个部分。首先对源分布 $X$ 进行概率积分变换 $F_X(X)$ 得到均匀分布 $U$

$$
P(\textcolor{red}{F_X(X)} \le u) = P(X \le F_X^{-1}(u)) = F_X(F_X^{-1}(u)) = u = P(\textcolor{red}{U} \le u)
$$

再对均匀分布 $U$ 进行逆变换采样 $F_Y^{-1}(U)$ 得到目标分布 $Y$

$$
P(\textcolor{red}{F_Y^{-1}(U)} \le y) = P(U \le F_Y(y)) = F_Y(y) = P(\textcolor{red}{Y} \le y)
$$

由于源分布已经是均匀分布 $U(0,1)$，因此接下来只需计算指数分布的累积分布函数 $F_S$ ，然后再求其反函数 $F_S^{-1}$ 即可。

对于 $\operatorname{Exp}(1/2)$，其累积分布函数为

$$
\begin{align*}
  F_S(s) &= \int_0^{s} f_S(s) \mathrm{d}s \\
  &= \int_0^{s} \frac{1}{2} e^{-\frac{s}{2}} \mathrm{d}s \\
  &= [-e^{-\frac{t}{2}}]_0^s \\
  &= 1 - e^{-\frac{s}{2}}
\end{align*}
$$

推导其反函数

$$
\begin{align*}
  e^{-\frac{s}{2}} &= 1 - F_S \\
  -\frac{s}{2} &= \ln(1 - F_S) \\
  s &= -2\ln(1 - F_S)
\end{align*}
$$

即

$$
F_S^{-1}(u)=-2\ln(1-u) \quad u\in[0,1)
$$

设 $U_1 \sim U(0,1)$，于是有

$$
S = F_S^{-1}(U_1)=-2\ln(1-U_1)
$$

由 $1-U_1 \sim U(0,1)$ 进一步得到

$$
S = -2\ln U_1
$$

而之前已经得到 $\Theta \sim U(0,2\pi)$。设 $U_2 \sim U(0,1)$，则

$$
\Theta = 2\pi U_2
$$

于是

$$
\begin{cases}
  R = \sqrt{S} = \sqrt{-2\ln U_1} \\
  \Theta = 2\pi U_2
\end{cases}
$$

带入

$$
\begin{cases}
  X = R\cos\Theta \\
  Y = R\sin\Theta
\end{cases}
$$

得到最终结果

$$
\begin{align*}
  X &= \sqrt{-2\ln U_1}\cos(2\pi U_2) \\
  Y &= \sqrt{-2\ln U_1}\sin(2\pi U_2)
\end{align*}
$$

显然，若 $U_1$ 与 $U_2$ 独立，则 $X$ 与 $Y$ 独立。这样就成功用一对独立的均匀分布随机数生成了独立的高斯分布随机数。

## 代码实现

由于我就是在 [最近做的一个 Web 项目](https://github.com/juemuren/piano-lab/) 中用到了 Box-Muller 算法（这也是写本文的原因），因此这里给出该算法的 JavaScript 实现。

> 其实 JavaScript 的 `Math.random()` 能够生成 $U(0,1)$ 随机数，但该方法不允许设置种子，导致缺少很多乐趣，所以我这里先实现了一个基于线性同余的均匀随机数生成器。

```js
function createUniformRandomGenerator(seed) {
  let state = seed >>> 0;

  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function createGaussianRandomGenerator(seed) {
  const getUniformRandom = createUniformRandomGenerator(seed);
  let spare = null;

  return () => {
    if (spare !== null) {
      const value = spare;
      spare = null;
      return value;
    }

    let u_1 = getUniformRandom();
    while (u_1 === 0) {
      u_1 = getUniformRandom();
    }
    const u_2 = getUniformRandom();

    const r = Math.sqrt(-2 * Math.log(u_1));
    const theta = 2 * Math.PI * u_2;

    spare = r * Math.sin(theta);
    return r * Math.cos(theta);
  };
}
```

实现中有两个需要注意的点

1. 由于不能对 $0$ 取对数，因此当 `u_1` 随机到 $0$ 时需要重试
2. 由于算法一次调用生成两个随机数，但只返回一个，所以用 `spare` 缓存另一个，这样偶数次调用时就不会重复计算了

调用示例

```js
SEED=114514
COUNT=5

const g = createGaussianRandomGenerator(SEED)
for (let i = 0; i < COUNT; i++) console.log(g())
```

输出为

```txt
0.6756921337282962
0.7153015025880592
-1.090593327207687
-0.43173865912412884
2.1300190649693405
```

### 运行演示

本文选择给出 JavaScript 实现，其实还有一个好处：每个能浏览网页的设备，事实上都有 JavaScript 的运行环境。对于桌面端，只需在浏览器里按下 `F12` 打开 `DevTools`，然后找到 [控制台（Console）面板](https://developer.chrome.google.cn/docs/devtools/overview?hl=zh-cn#console)，再把上面的两段代码复制进去就能运行了

![浏览器控制台截图](./浏览器控制台截图.png)

移动端的话没法打开 `DevTools`，可以尝试运行下面的示例

{{< demo src="demo/main.js" >}}
