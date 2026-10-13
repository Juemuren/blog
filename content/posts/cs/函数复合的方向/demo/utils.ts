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

// 前推二元运算
export function pushBin<A, B, C>(
  f: Fn<B, C>,
  g: Fn<A, B>
): Fn<A, C> {
  return pushforward(f)(g);
}

// 拉回二元运算
export function pullBin<A, B, C>(
  f: Fn<A, B>,
  g: Fn<B, C>
): Fn<A, C> {
  return pullback(f)(g);
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
export type Tensor<X, Y, Args extends X[] = X[]> =
  (...args: Args) => Y;

// 张量前推：作用于输出
export function tensorPushforward<Y, A>(f: Fn<Y, A>) {
  return <X>(
    tensor: Tensor<X, Y>
  ): Tensor<X, A> =>
    (...xs) => f(tensor(...xs));
}

// 张量拉回：作用于每个输入
export function tensorPullback<B, X>(g: Fn<B, X>) {
  return <Y, Args extends X[]>(
    tensor: Tensor<X, Y, Args>
  ): Tensor<B, Y, { [K in keyof Args]: B }> =>
    (...bs) => tensor(...bs.map(g) as Args);
}

// 张量和
export function tensorPlus<
  X,
  Y,
  A extends X[],
  B extends Y[]
>(
  T: Tensor<X, number, A>,
  S: Tensor<Y, number, B>,
): Tensor<X | Y, number, [...A, ...B]> {
  return (...args) =>
    T(...args.slice(0, T.length) as A) +
    S(...args.slice(T.length) as B);
}

// 张量积
export function tensorTimes<
  X,
  Y,
  A extends X[],
  B extends Y[]
>(
  T: Tensor<X, number, A>,
  S: Tensor<Y, number, B>,
): Tensor<X | Y, number, [...A, ...B]> {
  return (...args) =>
    T(...args.slice(0, T.length) as A) *
    S(...args.slice(T.length) as B);
}
