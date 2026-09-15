## Лекция 4. Полиномиальная аппроксимация характеристики ННУ

![Нелинейное безынерционное устройство ННУ](fig/k2-07-nonlinear-block.svg)

$$
\eta(t) = \varphi[\xi(t)],
$$

где $\varphi$ — нелинейная функция.

$$
\begin{aligned}
&m_\eta(t) = M\{\eta(t)\} = M\{\varphi[\xi(t)]\} = \\
&= \int_{-\infty}^{\infty} \varphi[x] \cdot W(x, t)\, dx .
\end{aligned}
$$

$$
\begin{aligned}
&K_\eta(t_1, t_2) = M\{\eta(t_1) \cdot \eta(t_2)\} = \\
&= M\{\varphi[\xi(t_1)] \cdot \varphi[\xi(t_2)]\} = \\
&= \iint_{-\infty}^{\infty} \varphi(x_1) \cdot \varphi(x_2) \times \\
&\qquad \times W_2(x_1, x_2; t_1, t_2)\, dx_1\, dx_2 .
\end{aligned}
$$

Виды аппроксимации:

1) Кусочно-линейная.
2) Полиномиальная.

### Нахождение моментных функций СП на выходе при использовании полиномиальной аппроксимации характеристики ННУ

$$
\eta(t) = \varphi[\xi(t)]
$$

$$
\varphi(\xi) = a_0 + a_1\xi + a_2\xi^2 + \ldots + a_k\xi^k,
$$

$$
a_k = \frac{1}{k!} \cdot \left.\frac{d^k \varphi(\xi)}{d\xi^k}\right|_{\xi = 0}
$$

Теперь можно найти $m_\eta(t)$:

$$
\begin{aligned}
&m_\eta(t) = M\{\eta(t)\} = \\
&= M\{a_0 + a_1\xi + a_2\xi^2 + \ldots\} = \\
&= a_0 + a_1 M\{\xi\} + a_2 M\{\xi^2\} + \\
&\qquad + a_3 M\{\xi^3\} + \ldots = \\
&= a_0 + a_1 M_{1\xi}(t) + a_2 M_{2\xi}(t) + \\
&\qquad + a_3 M_{3\xi}(t) + \ldots + a_k M_{k\xi}(t),
\end{aligned}
$$

где $M_{1\xi}(t), \ldots, M_{k\xi}(t)$ — одномерные начальные моментные функции $1 \ldots k$ порядка.

<!-- p035 -->

Пусть $\xi(t)$ — центрированный ГСП.

$$
\begin{aligned}
&\mu_k = 1 \cdot 3 \cdot 5 \cdot \ldots \cdot (k-1) \cdot \sigma_\xi^k, \\
&\qquad k \text{ — чётное}; \\
&\mu_k = 0, \quad k \text{ — нечётное}
\end{aligned}
$$

$$
\mu_7 = 0, \quad \mu_6 = 15\sigma_\xi^6
$$

$$
\begin{aligned}
&\mu_k = M\{\xi^k\} = \int_{-\infty}^{\infty} x^k \cdot W(x)\, dx = \\
&= \int_{-\infty}^{\infty} x^k \cdot \frac{1}{\sqrt{2\pi}\,\sigma_\xi} \cdot e^{-\frac{x^2}{2\sigma_\xi^2}}\, dx = \ldots
\end{aligned}
$$

$$
\begin{aligned}
&K_\eta(t_1, t_2) = M\{\eta(t_1) \cdot \eta(t_2)\} = \\
&= M\big\{[a_0 + a_1\xi_1 + a_2\xi_1^2 + \ldots + a_k\xi_1^k] \times \\
&\qquad \times [a_0 + a_1\xi_2 + a_2\xi_2^2 + \ldots + a_k\xi_2^k]\big\} \approx \\
&\approx \underbrace{M_1(t_2) + M_2(t_2) + \ldots + M_k(t_2)}_{k} + \\
&\qquad + \underbrace{\text{одн. нач. мом. функции для } t_1}_{k} + \\
&\qquad + \underbrace{M_{11}(t_1, t_2) + \ldots + M_{kk}(t_1, t_2)}_{\substack{\text{двумерные,} \\ \text{порядка } 2 \ldots 2k}} .
\end{aligned}
$$

(Слагаемые с $t_1$ — одномерные начальные моментные функции; последняя группа — двумерные начальные моментные функции порядка $2 \ldots 2k$.) Всего слагаемых $k^2$.

$\xi(t)$ — ГСП, стационарный, центрированный.

$$
\begin{aligned}
&W_2(x_1, x_2; t_1, t_2) = \sum_{k=0}^{\infty} \sigma_\xi^{-2}\, \Phi^{(k+1)}\Big(\frac{x_1}{\sigma_\xi}\Big) \times \\
&\qquad \times \Phi^{(k+1)}\Big(\frac{x_2}{\sigma_\xi}\Big) \cdot \frac{r_\xi^k(\tau)}{k!}
\end{aligned}
$$

$$
\Phi(x) = \frac{1}{\sqrt{2\pi}} \int_{-\infty}^{x} e^{-\frac{z^2}{2}}\, dz,
$$

$\Phi^{(k+1)}$ — производная порядка $(k+1)$;

$$
\begin{aligned}
&\Phi^{(1)}(x) = \frac{1}{\sqrt{2\pi}}\, e^{-\frac{x^2}{2}}, \\
&\Phi^{(2)}(x) = \frac{1}{\sqrt{2\pi}}\, e^{-\frac{x^2}{2}} \cdot (-x) .
\end{aligned}
$$

$r_\xi(\tau)$ — нормированная корреляционная функция.

$$
\begin{aligned}
&\mu_{ij}(t_1, t_2) = M\{\xi^i(t_1) \cdot \xi^j(t_2)\} = \\
&= \iint_{-\infty}^{\infty} x_1^i \cdot x_2^j \cdot W_2(x_1, x_2; t_1, t_2)\, dx_1\, dx_2 = \\
&= \iint_{-\infty}^{\infty} x_1^i \cdot x_2^j \cdot \sum_{k=0}^{\infty} \sigma_\xi^{-2}\, \Phi^{(k+1)}\Big(\frac{x_1}{\sigma_\xi}\Big) \times \\
&\qquad \times \Phi^{(k+1)}\Big(\frac{x_2}{\sigma_\xi}\Big) \frac{r_\xi^k(\tau)}{k!}\, dx_1\, dx_2 = \\
&= \sum_{k=0}^{\infty} \frac{r_\xi^k(\tau)}{k!} \iint_{-\infty}^{\infty} \Phi^{(k+1)}\Big(\frac{x_1}{\sigma_\xi}\Big) \cdot \frac{x_1^i}{\sigma_\xi} \times \\
&\qquad \times \Phi^{(k+1)}\Big(\frac{x_2}{\sigma_\xi}\Big) \frac{x_2^j}{\sigma_\xi}\, dx_1\, dx_2 =
\end{aligned}
$$

Замена:

$$
\begin{aligned}
&z_1 = \frac{x_1}{\sigma_\xi}, \quad dz_1 = \frac{dx_1}{\sigma_\xi}, \\
&z_2 = \frac{x_2}{\sigma_\xi}, \quad dx_2 = \sigma_\xi\, dz_2, \\
&\frac{x_1^i}{\sigma_\xi} = \Big(\frac{x_1}{\sigma_\xi}\Big)^i \cdot \sigma_\xi^{i-1} = z_1^i \cdot \sigma_\xi^{i-1}
\end{aligned}
$$

$$
\begin{aligned}
&= \sum_{k=0}^{\infty} \frac{r_\xi^k(\tau)}{k!} \underbrace{\int_{-\infty}^{\infty} \Phi^{(k+1)}(z_1) \cdot z_1^i\, dz_1}_{N_{ik}} \times \\
&\qquad \times \underbrace{\int_{-\infty}^{\infty} \Phi^{(k+1)}(z_2) \cdot z_2^j\, dz_2}_{N_{jk}} \cdot \sigma_\xi^i \cdot \sigma_\xi^j =
\end{aligned}
$$

<!-- p036 -->

$$
\boxed{= \sigma^{i+j} \sum_{k=0}^{\infty} \frac{r_\xi^k(\tau)}{k!} \cdot N_{ik} \cdot N_{jk}}
$$

1) $N_{ik} = 0$, $\; i < k$;
2) $N_{ik} = 0$, $\; i$ и $k$ имеют разную чётность;
3) $N_{ik} = \underbrace{i(i-1)(i-2)(i-3)\ldots}_{k} \cdot 1 \cdot 3 \cdot 5 \cdot \ldots \cdot \underbrace{(i-k+1)}_{\text{нечётное}}$;
4) $N_{ik} > 0$, если $i$ и $k$ — чётные; $N_{ik} < 0$ — если $i$ и $k$ — нечётные.

<!-- p037 -->
