// 函数
export type Fn<A, B> = (a: A) => B;

// 前推：后复合
export function pushforward<A, B>(f: Fn<A, B>) {
  return <X>(g: Fn<X, A>): Fn<X, B> =>
    x => f(g(x));
}

// 拉回：前复合
export function pullback<A, B>(f: Fn<A, B>) {
  return <Y>(g: Fn<B, Y>): Fn<A, Y> =>
    a => g(f(a));
}

// 函数复合
export function compose<A, B, C>(
  f: Fn<B, C>,
  g: Fn<A, B>
): Fn<A, C> {
  return a => f(g(a));
}

// 函数加法
export function add<X>(
  f: Fn<X, number>,
  g: Fn<X, number>
): Fn<X, number> {
  return x => f(x) + g(x);
}

// 函数乘法
export function mul<X>(
  f: Fn<X, number>,
  g: Fn<X, number>
): Fn<X, number> {
  return x => f(x) * g(x);
}

// 张量
export type Tensor<X, Y, Args extends X[]> =
  (...args: Args) => Y;

// 张量前推：作用于输出
export function tensorPushforward<A, B>(f: Fn<A, B>) {
  return <X, Args extends X[]>(
    tensor: Tensor<X, A, Args>
  ): Tensor<X, B, Args> =>
    (...xs) => f(tensor(...xs));
}

// 张量拉回：作用于每个输入
export function tensorPullback<A, B>(g: Fn<A, B>) {
  return <Y, Args extends B[]>(
    tensor: Tensor<B, Y, Args>
  ): Tensor<A, Y, { [K in keyof Args]: A }> =>
    (...xs) => tensor(...xs.map(g) as Args);
}
