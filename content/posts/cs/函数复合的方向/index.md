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
    (x) =>
      f(g(x));
}

// 拉回：前复合
function pullback<A, B>(f: Fn<A, B>) {
  return <Y>(g: Fn<B, Y>): Fn<A, Y> =>
    (a) =>
      g(f(a));
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
function compose<A, B, C>(f: Fn<B, C>, g: Fn<A, B>): Fn<A, C> {
  return (a) => f(g(a));
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
function pushBin<A, B, C>(f: Fn<B, C>, g: Fn<A, B>): Fn<A, C> {
  return pushforward(f)(g);
}

// 拉回二元运算
function pullBin<A, B, C>(f: Fn<A, B>, g: Fn<B, C>): Fn<A, C> {
  return pullback(f)(g);
}
```

{{< demo entry="demo/05-entry.ts" code="demo/05-binop.ts" >}}

## 张量的前推和拉回

张量是线性代数里的术语，这里我们将其抽象为输入类型相同的多参数函数

$$
T: X \times X \times \cdots \times X \to Y
$$

或者简记为

$$
T: X^n \to Y
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

使用 TypeScript 实现张量。这里选择把张量作为一个普通对象，包含阶数和映射

```ts
// 张量类型
type Tensor<Args extends unknown[], Y> = {
  readonly rank: Args["length"];
  readonly apply: (...args: Args) => Y;
};

// 张量构造器
function tensor<Args extends unknown[], Y>(
  rank: Args["length"],
  apply: (...args: Args) => Y,
): Tensor<Args, Y> {
  return { rank, apply };
}
```

也可以把张量作为一个函数对象，通过 `Object.assign` 设置阶数。后者可读性会稍差一点，好处是可以像普通函数一样使用张量

```ts
// 张量类型
export type Tensor<Args extends unknown[], Y> = ((...args: Args) => Y) & {
  readonly rank: Args["length"];
};

// 张量构造器
export function tensor<Args extends unknown[], Y>(
  rank: Args["length"],
  fn: (...args: Args) => Y,
): Tensor<Args, Y> {
  return Object.assign(fn, { rank });
}
```

我们使用可读性更好的普通对象版本，分别实现对张量的前推和拉回

```ts
// 张量前推：作用于输出
function tensorPushforward<Y, A>(f: (y: Y) => A) {
  return <Args extends unknown[]>(T: Tensor<Args, Y>): Tensor<Args, A> =>
    tensor(T.rank, (...xs: Args) => f(T.apply(...xs)));
}

// 张量拉回：作用于每个输入
function tensorPullback<B, X>(g: (b: B) => X) {
  return <Args extends X[], Y>(T: Tensor<Args, Y>) => {
    type Bs = { [K in keyof Args]: B };
    return tensor(T.rank as Bs["length"], (...bs: Bs) =>
      T.apply(...(bs.map(g) as Args)),
    );
  };
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
function add<X>(f: Fn<X, number>, g: Fn<X, number>): Fn<X, number> {
  return (x) => f(x) + g(x);
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
function mul<X>(f: Fn<X, number>, g: Fn<X, number>): Fn<X, number> {
  return (x) => f(x) * g(x);
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

{{< demo entry="demo/12-entry.ts" code="demo/12-pull-mul.ts" >}}

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

这要求用于前推的函数本身满足满足这一性质——但显然并非函数都满足。一个简单的反例是

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
f_*(u\times v)(x)=x+1
$$

右侧为

$$
(f_*u\times f_*v)(x)=2x+2
$$

当 $x=1$ 时二者就不相等。

{{< demo entry="demo/13-entry.ts" code="demo/13-push-mul.ts" >}}

## 张量加法和张量乘法

对于张量，我们可以定义两种加法和两种乘法。

### 第一种张量加法和张量乘法

第一种加法和乘法类似于函数的加法和乘法，逐点定义为

$$
(T+S)(x_1, \cdots, x_n) = T(x_1, \cdots, x_n) + S(x_1, \cdots, x_n)
\qquad
\forall (x_1, \cdots, x_n)\in X^n
$$

$$
(T\times S)(x_1, \cdots, x_n) = T(x_1, \cdots, x_n)\times S(x_1, \cdots, x_n)
\qquad
\forall (x_1, \cdots, x_n) \in X^n
$$

这要求两个张量的类型相同，并且值位于一个具有加法结构和乘法结构的集合中，比如实数

$$
T,S: X^n \to \mathbb{R}
$$

因此，两个 $n$ 阶张量相加或相乘，得到的是一个 $n$ 阶张量。并且，这种张量加法和张量乘法与函数加法和函数乘法没有什么区别。

对于

$$
f: A \to X
$$

拉回保持张量加法

$$
\begin{align*}
  f^*(T+S)(a_1, \cdots, a_n)
  &= (T+S)(f(a_1), \cdots, f(a_n))\\
  &= T(f(a_1), \cdots, f(a_n)) + S(f(a_1), \cdots, f(a_n))\\
  &=f^*T(a_1, \cdots, a_n)+f^*S(a_1, \cdots, a_n)
\end{align*}
$$

拉回保持张量乘法

$$
\begin{align*}
  f^*(T\times S)(a_1, \cdots, a_n)
  &= (T\times S)(f(a_1), \cdots, f(a_n))\\
  &= T(f(a_1), \cdots, f(a_n)) \times S(f(a_1), \cdots, f(a_n))\\
  &=f^*T(a_1, \cdots, a_n) \times f^*S(a_1, \cdots, a_n)
\end{align*}
$$

对于

$$
g: \mathbb{R} \to B
$$

前推不一定保持张量加法。$g_*(T+S)$ 和 $g_*T + g_*S$ 分别展开为

$$
\begin{cases}
  (g_*(T+S))(x_1, \cdots, x_n)
  =g(T(x_1, \cdots, x_n)+S(x_1, \cdots, x_n)) \\
  \\
  (g_*T + g_*S)(x_1, \cdots, x_n)
  =g(T(x_1, \cdots, x_n)) + g(S(x_1, \cdots, x_n))
\end{cases}
$$

而 $g(T+S) = g(T) + g(S)$ 不是所有的 $g$ 都满足。

前推不一定保持张量乘法。$g_*(T\times S)$ 和 $g_*T \times g_*S$ 分别展开为

$$
\begin{cases}
  (g_*(T\times S))(x_1, \cdots, x_n)
  =g(T(x_1, \cdots, x_n) \times S(x_1, \cdots, x_n)) \\
  \\
  (g_*T \times g_*S)(x_1, \cdots, x_n)
  =g(T(x_1, \cdots, x_n)) \times g(S(x_1, \cdots, x_n))
\end{cases}
$$

而 $g(T\times S) = g(T) \times g(S)$ 不是所有的 $g$ 都满足。

### 第二种张量加法和张量乘法

第二种张量加法和张量乘法允许两个张量的类型不同

$$
T: X^n \to \mathbb{R}
\qquad
S: Y^m \to \mathbb{R}
$$

第二种加法称为张量和，对 $\forall (x_1, \cdots, x_n)\in X^n, (y_1, \cdots, y_n)\in Y^m$ 逐点定义为

$$
(T\oplus S)(x_1, \cdots, x_n, y_1, \cdots, y_m)
= T(x_1, \cdots, x_n) + S(y_1, \cdots, y_m)
$$

第二种乘法称为张量积，对 $\forall (x_1, \cdots, x_n)\in X^n, (y_1, \cdots, y_n)\in Y^m$ 逐点定义为

$$
(T\otimes S)(x_1, \cdots, x_n, y_1, \cdots, y_m)
= T(x_1, \cdots, x_n) \times S(y_1, \cdots, y_m)
$$

因此，一个 $n$ 阶张量和一个 $m$ 阶张量进行张量和或张量积，得到的是一个 $n+m$ 阶张量。

TypeScript 实现为

```ts
// 辅助函数：按左侧张量的阶数切分输入
function splitTensorArgs<A extends unknown[], B extends unknown[]>(
  args: [...A, ...B],
  leftRank: A["length"],
): [A, B] {
  return [args.slice(0, leftRank), args.slice(leftRank)] as [A, B];
}

// 张量和
function tensorPlus<A extends unknown[], B extends unknown[]>(
  T: Tensor<A, number>,
  S: Tensor<B, number>,
): Tensor<[...A, ...B], number> {
  return tensor(T.rank + S.rank, (...args: [...A, ...B]) => {
    const [left, right] = splitTensorArgs<A, B>(args, T.rank);
    return T.apply(...left) + S.apply(...right);
  });
}

// 张量积
function tensorTimes<A extends unknown[], B extends unknown[]>(
  T: Tensor<A, number>,
  S: Tensor<B, number>,
): Tensor<[...A, ...B], number> {
  return tensor(T.rank + S.rank, (...args: [...A, ...B]) => {
    const [left, right] = splitTensorArgs<A, B>(args, T.rank);
    return T.apply(...left) * S.apply(...right);
  });
}
```

{{< demo entry="demo/14-entry.ts" code="demo/14-tensor-plus-times.ts" >}}

现假设两个张量的输入类型相同，只有阶数不同

$$
T: X^n \to \mathbb{R}
\qquad
S: X^m \to \mathbb{R}
$$

对于

$$
f: A \to X
$$

拉回保持张量和

$$
\begin{align*}
  f^*(T\oplus S)(x_1, \cdots, x_n, y_1, \cdots, y_m)
  &= (T\oplus S)(f(x_1), \cdots, f(x_n), f(y_1), \cdots, f(y_m))\\
  &= T(f(x_1), \cdots, f(x_n)) + S(f(y_1), \cdots, f(y_m))\\
  &= f^*T(x_1, \cdots, x_n) + f^*S(y_1, \cdots, y_m)\\
  &= (f^*T\oplus f^*S)(x_1, \cdots, x_n, y_1, \cdots, y_m)
\end{align*}
$$

拉回保持张量积

$$
\begin{align*}
  f^*(T\otimes S)(x_1, \cdots, x_n, y_1, \cdots, y_m)
  &= (T\otimes S)(f(x_1), \cdots, f(x_n), f(y_1), \cdots, f(y_m))\\
  &= T(f(x_1), \cdots, f(x_n)) \times S(f(y_1), \cdots, f(y_m))\\
  &= f^*T(x_1, \cdots, x_n) \times f^*S(y_1, \cdots, y_m)\\
  &= (f^*T\otimes f^*S)(x_1, \cdots, x_n, y_1, \cdots, y_m)
\end{align*}
$$

对于

$$
g: \mathbb{R} \to B
$$

前推不一定保持张量和。$g_*(T\oplus S)$ 和 $g_*T \oplus g_*S$ 分别展开为

$$
\begin{cases}
  (g_*(T\oplus S))(x_1, \cdots, x_n, y_1, \cdots, y_m)
  =g(T(x_1, \cdots, x_n) + S(y_1, \cdots, y_m)) \\
  \\
  (g_*T \oplus g_*S)(x_1, \cdots, x_n, y_1, \cdots, y_m)
  =g(T(x_1, \cdots, x_n)) + g(S(y_1, \cdots, y_m))
\end{cases}
$$

而 $g(T + S) = g(T) + g(S)$ 不是所有的 $g$ 都满足。

前推不一定保持张量积。$g_*(T\otimes S)$ 和 $g_*T \otimes g_*S$ 分别展开为

$$
\begin{cases}
  (g_*(T\otimes S))(x_1, \cdots, x_n, y_1, \cdots, y_m)
  =g(T(x_1, \cdots, x_n) \times S(y_1, \cdots, y_m)) \\
  \\
  (g_*T \otimes g_*S)(x_1, \cdots, x_n, y_1, \cdots, y_m)
  =g(T(x_1, \cdots, x_n)) \times g(S(y_1, \cdots, y_m))
\end{cases}
$$

而 $g(T\times S) = g(T) \times g(S)$ 不是所有的 $g$ 都满足。

{{< demo entry="demo/15-entry.ts" code="demo/15-tensor-push-pull-plus-times.ts" >}}
