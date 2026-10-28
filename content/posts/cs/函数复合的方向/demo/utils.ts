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

// 张量类型
export type Tensor<Args extends unknown[], Y> = {
  readonly rank: Args["length"];
  readonly apply: (...args: Args) => Y;
};

// 张量构造器
export function tensor<Args extends unknown[], Y>(
  rank: Args["length"],
  apply: (...args: Args) => Y
): Tensor<Args, Y> {
  return { rank, apply };
}

// 张量前推：作用于输出
export function tensorPushforward<Y, A>(f: (y: Y) => A) {
  return <Args extends unknown[]>(
    T: Tensor<Args, Y>
  ): Tensor<Args, A> =>
    tensor(T.rank, (...xs: Args) => f(T.apply(...xs)));
}

// 张量拉回：作用于每个输入
export function tensorPullback<B, X>(g: (b: B) => X) {
  return <Args extends X[], Y>(
    T: Tensor<Args, Y>
  ): Tensor<{ [K in keyof Args]: B }, Y> => {
    type Bs = { [K in keyof Args]: B };

    return tensor(
      T.rank as Bs["length"],
      (...bs: Bs) => T.apply(...bs.map(g) as Args)
    );
  };
}

// 辅助函数：按左侧张量的阶数切分输入
function splitTensorArgs<A extends unknown[], B extends unknown[]>(
  args: [...A, ...B],
  leftRank: A["length"]
): [A, B] {
  return [args.slice(0, leftRank), args.slice(leftRank)] as [A, B];
}

// 张量和
export function tensorPlus<
  A extends unknown[],
  B extends unknown[]
>(
  T: Tensor<A, number>,
  S: Tensor<B, number>
): Tensor<[...A, ...B], number> {
  return tensor(
    T.rank + S.rank,
    (...args: [...A, ...B]) => {
      const [left, right] = splitTensorArgs<A, B>(args, T.rank);
      return T.apply(...left) + S.apply(...right);
    }
  );
}

// 张量积
export function tensorTimes<
  A extends unknown[],
  B extends unknown[]
>(
  T: Tensor<A, number>,
  S: Tensor<B, number>
): Tensor<[...A, ...B], number> {
  return tensor(
    T.rank + S.rank,
    (...args: [...A, ...B]) => {
      const [left, right] = splitTensorArgs<A, B>(args, T.rank);
      return T.apply(...left) * S.apply(...right);
    }
  );
}
