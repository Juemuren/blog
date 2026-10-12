---
title: 函数复合的方向：前推与拉回
date: 2026-10-09
categories: 计算机科学
tags:
  - 函数复合
  - 前推
  - 拉回
summary: 介绍微分形式，以及外微分和对微分形式的积分。
---

## 函数的前推和拉回

前推（Pushforward）和拉回（Pullback）是函数复合的两个方向

- 前推：后复合（post-composition），将用于前推的函数作用在另一个函数的输出端
- 拉回：前复合（pre-composition），将用于拉回的函数作用在另一个函数的输入端

对于函数

$$
f:A\to B
$$

其诱导的前推为

$$
f^*(-)=f\circ -
$$

前推改变原函数的输出类型

$$
f^*:\operatorname{Hom}(X,A)\to\operatorname{Hom}(X,B)
$$

其诱导的拉回为

$$
f^*(-)=-\circ f
$$

拉回改变原函数的输入类型

$$
f^*:\operatorname{Hom}(B,Y)\to\operatorname{Hom}(A,Y)
$$

这里使用 TypeScript 实现对函数的前推和拉回

```ts
// 函数
type Fn<A, B> = (a: A) => B;

// 前推：后复合
function pushforward<A, B>(f: Fn<A, B>) {
  return <X>(g: Fn<X, A>): Fn<X, B> =>
    x => f(g(x));
}

// 拉回：前复合
function pullback<A, B>(f: Fn<A, B>) {
  return <Y>(g: Fn<B, Y>): Fn<A, Y> =>
    a => g(f(a));
}
```

{{< demo entry="demo/01-entry.ts" code="demo/01-push-pull.ts" >}}

### 函数前推和函数拉回的结合律

复合映射也可以诱导出前推和拉回。

设两个函数为

$$
f: B \to C
\qquad
g: A \to B
$$

二者的复合为

$$
f\circ g: A \to C
$$

复合映射诱导的前推为

$$
\begin{align*}
  (f\circ g)_*(-)
  &= (f \circ g) \circ - \\
  &= f \circ (g\circ -) \\
  &= f_*(g_*(-))
\end{align*}
$$

复合映射诱导的拉回为

$$
\begin{align*}
  (f\circ g)^*(-)
  &= - \circ (f \circ g) \\
  &= (- \circ f) \circ g \\
  &= g^*(f^*(-))
\end{align*}
$$

把左侧的复合也写为前推和拉回，得到

$$
(f_* g)_*(-) = f_*(g_*(-))
$$

$$
(g^* f)^*(-) = g^*(f^*(-))
$$

因此，复合本身的结合律给出了前推和拉回的结合律。

我们用 TypeScript 实现一个二元运算表示函数的复合

```ts
// 函数复合
function compose<A, B, C>(
  f: Fn<B, C>,
  g: Fn<A, B>
): Fn<A, C> {
  return a => f(g(a));
}
```

{{< demo entry="demo/02-entry.ts" code="demo/02-push-assoc.ts" >}}

{{< demo entry="demo/03-entry.ts" code="demo/03-pull-assoc.ts" >}}

### 函数前推和函数拉回的交换律

设函数为

$$
\begin{align*}
  h&: X\to Y \\
  f&: Y\to A \\
  g&: B\to X \\
\end{align*}
$$

那么有

$$
\begin{align*}
  f_*(g^*h)
  &=f \circ (h\circ g) \\
  &=(f \circ h)\circ g \\
  &=g^*(f_*T)
\end{align*}
$$

得到前推和拉回的交换律

$$
f_*(g^*h)=g^*(f_*h)
$$

即函数先前推再拉回等于先拉回再前推。

{{< demo entry="demo/04-entry.ts" code="demo/04-comm.ts" >}}

### 作为二元运算的前推和拉回

进一步把前推和拉回本身当作二元运算

$$
f*g:=f_*(g)
\qquad
f\star g:=f^*(g)
$$

结合律可以写为

$$
(f*g)*h
=f*(g*h)
$$

$$
(f\star g)\star h=f\star(g\star h)
$$

交换律可以写为

$$
g*f=f\star g
$$

用 TypeScript 实现两个二元运算分别表示前推和拉回

```ts
// 前推二元运算
function pushBin<A, B, C>(
  f: Fn<B, C>,
  g: Fn<A, B>
): Fn<A, C> {
  return pushforward(f)(g);
}

// 拉回二元运算
function pullBin<A, B, C>(
  f: Fn<A, B>,
  g: Fn<B, C>
): Fn<A, C> {
  return pullback(f)(g);
}
```

{{< demo entry="demo/05-entry.ts" code="demo/05-binop.ts" >}}

## 张量的前推和拉回

张量是线性代数里的术语，这里我们将其抽象为输入类型相同的多参数函数

$$
T(x_1, x_2, \cdots, x_n): X \times X \times \cdots \times X \to Y
$$

函数 $f:Y \to A$ 诱导出一个对张量的前推

$$
f_*T(x_1, x_2, \cdots, x_n) = f(T(x_1, x_2, \cdots, x_n))
$$

即把用于前推的函数作用在张量的输出上。前推后张量的类型变为

$$
f_*T: X \times X \times \cdots \times X \to A
$$

函数 $g: B \to X$ 诱导出一个对张量的拉回

$$
g^*T(b_1, b_2, \cdots, b_n) = T(g(b_1), g(b_2), \cdots, g(b_n))
$$

即把用于拉回的函数作用在张量的每个输入上。拉回后张量的类型变为

$$
g^*T: B \times B \times \cdots \times B \to Y
$$

使用 TypeScript 实现一个张量

```ts
// 张量
type Tensor<X, Y, Args extends X[]> =
  (...args: Args) => Y;

// 张量前推：作用于输出
function tensorPushforward<A, B>(f: Fn<A, B>) {
  return <X, Args extends X[]>(
    tensor: Tensor<X, A, Args>
  ): Tensor<X, B, Args> =>
    (...xs) => f(tensor(...xs));
}

// 张量拉回：作用于每个输入
function tensorPullback<A, B>(g: Fn<A, B>) {
  return <Y, Args extends B[]>(
    tensor: Tensor<B, Y, Args>
  ): Tensor<A, Y, { [K in keyof Args]: A }> =>
    (...xs) => tensor(...xs.map(g) as Args);
}
```

{{< demo entry="demo/06-entry.ts" code="demo/06-tensor.ts" >}}

### 张量前推的结合律

设张量为

$$
T:X^n\to Y
$$

两个函数为

$$
f:Y\to A
\qquad
g:A\to B
$$

复合函数 $g\circ f:Y\to B$ 诱导的前推为

$$
\begin{align*}
  (g\circ f)_*T(x_1,\cdots,x_n)
  &= (g\circ f)(T(x_1,\cdots,x_n)) \\
  &= g(f(T(x_1,\cdots,x_n))) \\
  &= g_*(f_*T)(x_1,\cdots,x_n)
\end{align*}
$$

因此

$$
(g\circ f)_*T=g_*(f_*T)
$$

将左侧的函数复合写为前推，得到张量前推的结合律

$$
(g_*f)_*T=g_*(f_*T)
$$

{{< demo entry="demo/07-entry.ts" code="demo/07-tensor-push-assoc.ts" >}}

### 张量拉回的结合律

设张量为

$$
T:X^n\to Y
$$

两个函数为

$$
h:D\to X
\qquad
k:C\to D
$$

复合函数 $h\circ k:D\to X$ 诱导的拉回为

$$
\begin{align*}
  (h\circ k)^*T(c_1,\cdots,c_n)
  &=T((h\circ k)(c_1),\cdots,(h\circ k)(c_n)) \\
  &=T(h(k(c_1)),\cdots,h(k(c_n))) \\
  &=h^*T(k(c_1),\cdots,k(c_n)) \\
  &=k^*(h^*T)(c_1,\cdots,c_n)
\end{align*}
$$

因此

$$
(h\circ k)^*T=k^*(h^*T)
$$

将左侧的函数复合写为拉回，得到张量拉回的结合律

$$
(k^*h)^*T=k^*(h^*T)
$$

{{< demo entry="demo/08-entry.ts" code="demo/08-tensor-pull-assoc.ts" >}}

### 张量前推和张量前推的交换律

设

$$
f:Y\to A
\qquad
g:B\to X
$$

那么有

$$
\begin{align*}
  f_*(g^*T)(b_1,\cdots,b_n)
  &=f(T(g(b_1),\cdots,g(b_n))) \\
  &=g^*(f_*T)(b_1,\cdots,b_n)
\end{align*}
$$

得到张量前推和张量拉回的交换律

$$
f_*(g^*T)=g^*(f_*T)
$$

即对张量先前推再拉回等于先拉回再前推。

{{< demo entry="demo/09-entry.ts" code="demo/09-tensor-comm.ts" >}}

## 函数加法

假设函数的值位于一个具有加法结构的集合中，例如实数

$$
f,g:X\to\mathbb R
$$

定义函数的加法为逐点乘法

$$
(f + g)(x):=f(x) + g(x)
\qquad
\forall x\in X
$$

TypeScript 实现为

```ts
function add<X>(
  f: Fn<X, number>,
  g: Fn<X, number>
): Fn<X, number> {
  return x => f(x) + g(x);
}
```

### 拉回保持加法

设

$$
h:Y\to X
$$

由 $h$ 诱导的拉回满足

$$
\begin{align*}
  h^*(f + g)(y)
  &=(f + g)(h(y)) \\
  &=f(h(y)) + g(h(y)) \\
  &=(h^*f)(y) + (h^*g)(y)
\end{align*}
$$

因此拉回保持函数加法

$$
h^*(f + g)=h^*f + h^*g
$$

{{< demo entry="demo/10-entry.ts" code="demo/10-pull-add.ts" >}}

### 前推不一定保持加法

前推通常不保持加法。

函数先相加后前推

$$
\begin{align*}
  f_*(u+v)(x)
  &=f(u(x)+v(x))
\end{align*}
$$

函数先前推后相加

$$
\begin{align*}
(f_*u+f_*v)(x)
&=f(u(x))+f(v(x))
\end{align*}
$$

若想

$$
f_*(u+v)=f_*u+f_*v
$$

则要求

$$
f(u + v) = f(u)+f(v)
$$

这并不是所有函数都满足的性质。一个简单的反例是

$$
f(x)=x^2
$$

取

$$
u(x)=x
\qquad
v(x)=1
$$

左侧为

$$
f_*(u+v)(x)=(x+1)^2
$$

右侧为

$$
(f_*u+f_*v)(x)=x^2+1
$$

当 $x=1$ 时二者就不相等。

{{< demo entry="demo/11-entry.ts" code="demo/11-push-add.ts" >}}

## 函数乘法

假设函数的值位于一个具有乘法结构的集合中，例如实数

$$
f,g:X\to\mathbb R
$$

定义函数的乘法为逐点乘法

$$
(f\times g)(x):=f(x) \times g(x)
\qquad
\forall x\in X
$$

TypeScript 实现为

```ts
function mul<X>(
  f: Fn<X, number>,
  g: Fn<X, number>
): Fn<X, number> {
  return x => f(x) * g(x);
}
```

### 拉回保持乘法

设

$$
h:Y\to X
$$

由 $h$ 诱导的拉回满足

$$
\begin{align*}
  h^*(f\times g)(y)
  &=(f\times g)(h(y)) \\
  &=f(h(y)) \times g(h(y)) \\
  &=(h^*f)(y) \times (h^*g)(y)
\end{align*}
$$

因此拉回保持函数乘法

$$
h^*(f\times g)=h^*f\times h^*g
$$

代码示例为

```ts
const f = (x: number) => x + 1;
const g = (x: number) => x * x;
const h = (x: number) => x * 2;

// 先相乘后拉回
const lhs = pullback(h)(
  mul(f, g)
);

// 先拉回后相乘
const rhs = mul(
  pullback(h)(f),
  pullback(h)(g)
);

console.log(lhs(3)); // 252
console.log(rhs(3)); // 252
```

### 前推不一定保持乘法

前推通常不保持乘法。

函数先相乘后前推

$$
\begin{align*}
  f_*(u\times v)(x)
  &=f(u(x)\times v(x))
\end{align*}
$$

函数先前推后相乘

$$
\begin{align*}
(f_*u\times f_*v)(x)
&=f(u(x))\times f(v(x))
\end{align*}
$$

若想

$$
f_*(u\times v)=f_*u\times f_*v
$$

则要求

$$
f(u \times v) = f(u) \times f(v)
$$

这并不是所有函数都满足的性质。一个简单的反例是

$$
f(x)=x+1
$$

取

$$
u(x)=x
\qquad
v(x)=1
$$

左侧为

$$
f_*(u\times v)(x)=x+2
$$

右侧为

$$
(f_*u\times f_*v)(x)=2x+2
$$

当 $x=1$ 时二者就不相等。

代码示例为

```ts
const f = (x: number) => x + 1;
const u = (x: number) => x;
const v = (x: number) => 1;

const left = pushforward(f)(
  mul(u, v)
);
const right = mul(
  pushforward(f)(u),
  pushforward(f)(v)
);

console.log(left(1)); // 2
console.log(right(1)); // 4
```

## 张量加法和张量乘法

<!-- TODO ## 推广到张量上 -->
