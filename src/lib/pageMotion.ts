import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { setScrollDriver, scrollToAnchor } from "./scroll";
gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };
export function mountPageMotion(pathname: string, hash: string) {
  const context = gsap.context(() => {});
  let mounted = false,
    disposed = false;
  const animate = () => {
    const page = document.querySelector<HTMLElement>(".page-enter");
    if (!page || mounted) return;
    mounted = true;
    context.add(() => {
      gsap.fromTo(
        page,
        { opacity: 0.5, y: 18, filter: "blur(3px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.65,
          ease: "power3.out",
          clearProps: "all",
        },
      );
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { y: 36, clipPath: "inset(0 0 8% 0)" },
          {
            y: 0,
            clipPath: "inset(0 0 0% 0)",
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 94%", once: true },
            clearProps: "transform,clipPath",
          },
        );
      });
      const hero = document.querySelector<HTMLElement>(".hero");
      if (hero) {
        const depth = { value: 0 };
        const timeline = gsap.timeline({
          scrollTrigger: {
            id: "hero-depth",
            trigger: hero,
            start: () =>
              innerWidth < 900
                ? hero.querySelector(".hero-scene")!.getBoundingClientRect()
                    .top +
                  scrollY -
                  85
                : "top 85px",
            end: () =>
              innerWidth < 900
                ? hero.querySelector(".hero-scene")!.getBoundingClientRect()
                    .bottom + scrollY
                : "bottom top",
            invalidateOnRefresh: true,
            scrub: 0.55,
            onRefresh: () => {
              hero.dataset.depth = String(depth.value);
            },
          },
        });
        timeline
          .to(
            depth,
            {
              value: 0.12,
              duration: 0.2,
              ease: "none",
              onUpdate: () => {
                hero.dataset.depth = String(depth.value);
              },
            },
            0,
          )
          .to(
            depth,
            {
              value: 0.6,
              duration: 0.4,
              ease: "none",
              onUpdate: () => {
                hero.dataset.depth = String(depth.value);
              },
            },
            0.2,
          )
          .to(
            depth,
            {
              value: 1,
              duration: 0.4,
              ease: "none",
              onUpdate: () => {
                hero.dataset.depth = String(depth.value);
              },
            },
            0.6,
          )
          .to(
            ".hero-copy h1",
            {
              y: -130,
              x: -25,
              rotationY: -12,
              scale: 0.86,
              transformPerspective: 1000,
              ease: "none",
              duration: 0.8,
            },
            0.2,
          )
          .to(
            ".hero-copy > p, .hero-actions",
            { y: -65, opacity: 0.15, stagger: 0.04, duration: 0.6 },
            0.3,
          )
          .to(
            ".hero-brand",
            { xPercent: -20, y: -70, opacity: 0.12, duration: 1 },
            0,
          )
          .to(".hero-scene", { opacity: 0, duration: 0.18 }, 0.82);
      }
      gsap.utils.toArray<HTMLElement>(".section").forEach((section, i) => {
        gsap.fromTo(
          section,
          { "--atmosphere": 0 },
          {
            "--atmosphere": 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "center center",
              scrub: 0.6,
            },
          },
        );
        const heading = section.querySelector("h2");
        if (heading)
          gsap.fromTo(
            heading,
            {
              rotationX: 12,
              y: 55,
              transformPerspective: 900,
              clipPath: "inset(0 0 18% 0)",
            },
            {
              rotationX: 0,
              y: 0,
              clipPath: "inset(0 0 0% 0)",
              duration: 0.85,
              scrollTrigger: { trigger: heading, start: "top 92%", once: true },
              clearProps: "transform,clipPath",
            },
          );
        const cards = section.querySelectorAll(
          ".principles-grid > div, .engagements > article, .value-grid > div",
        );
        if (cards.length)
          gsap.fromTo(
            cards,
            {
              y: 65,
              rotationY: i % 2 ? -9 : 9,
              scale: 0.92,
              transformPerspective: 1100,
              clipPath: "inset(0 0 12% 0)",
            },
            {
              y: 0,
              rotationY: 0,
              scale: 1,
              clipPath: "inset(0 0 0% 0)",
              stagger: 0.08,
              duration: 0.75,
              ease: "power3.out",
              scrollTrigger: {
                trigger: cards[0],
                start: "top 92%",
                once: true,
              },
              clearProps: "transform,clipPath",
            },
          );
      });
      const world = document.querySelector(".work-world");
      if (world)
        gsap.fromTo(
          world,
          { scale: 0.78, rotationX: 8, transformPerspective: 1400 },
          {
            scale: 1,
            rotationX: 0,
            ease: "none",
            scrollTrigger: {
              trigger: world,
              start: "top 95%",
              end: "top 28%",
              scrub: 0.5,
            },
          },
        );
      gsap.utils.toArray<HTMLElement>(".section-label").forEach((label) => {
        gsap.fromTo(
          label,
          { "--thread-progress": 0 },
          {
            "--thread-progress": 1,
            ease: "none",
            scrollTrigger: {
              trigger: label.closest("section"),
              start: "top 75%",
              end: "bottom 30%",
              scrub: 0.4,
            },
          },
        );
      });
    });
    if (hash) scrollToAnchor(hash);
    ScrollTrigger.refresh();
  };
  const observer = new MutationObserver(animate);
  observer.observe(document.getElementById("main")!, {
    childList: true,
    subtree: true,
  });
  animate();
  const refresh = () => ScrollTrigger.refresh();
  document.fonts.ready.then(() => {
    if (!disposed) refresh();
  });
  window.addEventListener("load", refresh, { once: true });
  window.addEventListener("webora-intro-complete", refresh);
  return () => {
    disposed = true;
    observer.disconnect();
    window.removeEventListener("load", refresh);
    window.removeEventListener("webora-intro-complete", refresh);
    context.revert();
  };
}

/** Layout-owned scroll runtime: routes and hash navigation never recreate it. */
let smooth: Lenis | undefined;
let generation = 0;
export function mountSmoothScroll() {
  if (smooth) return () => {};
  const lenis = new Lenis({
    lerp: 0.075,
    smoothWheel: true,
    syncTouch: false,
    // The application already honors the system setting, with an explicit opt-in.
    respectReducedMotion: false,
    autoResize: true,
    prevent: (node) =>
      ["INPUT", "TEXTAREA", "SELECT"].includes(node.tagName) ||
      !!node.closest(".mobile-menu, .booking-page") ||
      document.body.style.overflow === "hidden",
  });
  smooth = lenis;
  document.documentElement.dataset.scrollRuntime = "lenis";
  document.documentElement.dataset.scrollInstances = "1";
  document.documentElement.dataset.scrollGeneration = String(++generation);
  setScrollDriver((top, immediate) =>
    lenis.scrollTo(top, {
      immediate,
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    }),
  );
  const tick = (time: number) => lenis.raf(time * 1000);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tick);
  const resize = () => {
    lenis.resize();
    ScrollTrigger.refresh();
  };
  window.addEventListener("resize", resize);
  return () => {
    window.removeEventListener("resize", resize);
    gsap.ticker.remove(tick);
    lenis.off("scroll", ScrollTrigger.update);
    lenis.destroy();
    smooth = undefined;
    setScrollDriver();
    delete document.documentElement.dataset.scrollRuntime;
    document.documentElement.dataset.scrollInstances = "0";
  };
}
