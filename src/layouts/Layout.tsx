import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { flushSync } from "react-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { contact } from "../data/studio";
import { LinkButton } from "../components/LinkButton";
import { Cursor } from "../components/Cursor";
import { usePageMotion, useReducedMotion } from "../hooks/useMotion";
import { scrollToAnchor } from "../lib/scroll";
import { track } from "../lib/analytics";
import { enableMotion } from "../lib/motionPreference";
import { appRoute } from "../lib/site";
import { ExperienceSwitcher } from "../components/ExperienceSwitcher";
import { useV2Experience } from "../lib/experience";
import "../styles/v3-tokens.css";
import "../styles/v3-hero.css";
import "../styles/v3-site.css";
import "../styles/v3-folio.css";
import "../styles/v3-pages.css";

export function Layout() {
  const experimental = useV2Experience();
  const [open, setOpen] = useState(false);
  const [menuPresent, setMenuPresent] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  usePageMotion();
  useEffect(() => {
    if (open) {
      setMenuPresent(true);
      return;
    }
    const timer = setTimeout(() => setMenuPresent(false), reduced ? 0 : 190);
    return () => clearTimeout(timer);
  }, [open, reduced]);
  useEffect(() => {
    let transition: ViewTransition | undefined;
    const click = (event: MouseEvent) => {
      if (
        event.button ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.defaultPrevented
      )
        return;
      const link = (event.target as Element).closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (!link || link.target || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) return;
      const destination = appRoute(url);
      if (destination === null) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        if (url.hash) {
          event.preventDefault();
          navigate(destination);
          scrollToAnchor(url.hash);
          if (link.classList.contains("skip-link"))
            document.getElementById("main")?.focus({ preventScroll: true });
        }
        return;
      }
      if (reduced || !document.startViewTransition) return;
      event.preventDefault();
      transition?.skipTransition();
      transition = document.startViewTransition(() =>
        flushSync(() => navigate(destination)),
      );
      transition.finished.catch(() => {});
      transition.ready.catch(() => {});
    };
    document.addEventListener("click", click, true);
    return () => {
      document.removeEventListener("click", click, true);
      transition?.skipTransition();
    };
  }, [navigate, reduced]);
  useEffect(() => {
    let frame = 0;
    // Written only on the consumers: an inherited property on <html> would
    // restyle the whole document every scroll frame.
    const targets = document.querySelectorAll<HTMLElement>(
      ".page-progress, .scroll-icon",
    );
    const paint = () => {
      frame = 0;
      const height = document.documentElement.scrollHeight - innerHeight;
      const progress = String(height > 0 ? scrollY / height : 0);
      targets.forEach((target) =>
        target.style.setProperty("--page-progress", progress),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    paint();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [location.pathname]);
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() =>
      menu.current?.querySelector<HTMLElement>("a")?.focus(),
    );
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (e.key === "Tab") {
        const elements = [
          toggle.current!,
          ...menu.current!.querySelectorAll<HTMLElement>("a"),
        ];
        const first = elements[0],
          last = elements.at(-1)!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  return (
    <div className={experimental ? "living-layout v3" : undefined}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="wordmark" to="/" aria-label="Webora home">
          webora<span>✳</span>
        </Link>
        <span className="header-descriptor mono">
          INDEPENDENT
          <br />
          WEB DESIGN STUDIO
        </span>
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink to="/work">Work</NavLink>
          <NavLink to="/services">Services</NavLink>
          <Link to="/#process">Process</Link>
          <NavLink to="/studio">Studio</NavLink>
        </nav>
        {/* Hidden on the enquiry itself: a CTA to the current page is noise. */}
        <div
          className={`header-cta${location.pathname === "/start-project" ? " is-here" : ""}`}
        >
          <LinkButton />
        </div>
        <button
          className="menu-toggle"
          ref={toggle}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      {(open || menuPresent) && (
        <nav
          className={`mobile-menu ${open ? "menu-open" : "menu-closing"}`}
          inert={!open}
          aria-hidden={!open}
          id="mobile-menu"
          ref={menu}
          aria-label="Mobile navigation"
        >
          <span className="mono">EXPLORE WEBORA</span>
          {[
            ["Work", "/work"],
            ["Services", "/services"],
            ["Process", "/#process"],
            ["Studio", "/studio"],
            ["Start a Project", "/start-project"],
          ].map(([label, path], i) => {
            const content = (
              <>
                <span className="mono">0{i + 1}</span>
                {label}
                <ArrowUpRight />
              </>
            );
            // NavLink marks the current route (aria-current); a hash link
            // would match "/" everywhere, so Process stays a plain Link.
            return path.includes("#") ? (
              <Link key={path} to={path} onClick={() => setOpen(false)}>
                {content}
              </Link>
            ) : (
              <NavLink key={path} to={path} onClick={() => setOpen(false)}>
                {content}
              </NavLink>
            );
          })}
          <a
            className="menu-contact"
            href={contact.whatsapp}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("whatsapp_clicked")}
          >
            Let’s talk on WhatsApp ↗
          </a>
        </nav>
      )}
      <main id="main" tabIndex={-1} inert={open}>
        <Outlet />
      </main>
      <footer className="site-footer" inert={open}>
        {experimental && location.pathname === "/" && (
          <div
            className="living-footer-sculpture"
            data-installation-kind="hero"
            aria-hidden="true"
          >
            <span>W</span>
          </div>
        )}
        <div className="footer-top">
          <div className="footer-invitation">
            <span className="eyebrow">THE NEXT CHAPTER STARTS HERE</span>
            <h2>
              Let’s make
              <br />
              <span>an impression.</span>
            </h2>
            <p className="footer-intro">
              Tell us about your business and what you want your website to do.
              We’ll recommend the right approach for your project.
            </p>
            <LinkButton />
          </div>
          <div className="footer-contact">
            <span className="mono">SAY HELLO</span>
            <a
              href={`mailto:${contact.email}`}
              onClick={() => track("email_clicked")}
            >
              <small>Email</small>
              {contact.email}
              <ArrowUpRight size={17} />
            </a>
            <a href="tel:+919814800017">
              <small>Phone</small>
              {contact.phone}
            </a>
            <a
              href={contact.whatsapp}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("whatsapp_clicked")}
            >
              <small>WhatsApp</small>
              WhatsApp Webora <ArrowUpRight size={17} />
            </a>
            <a href={contact.instagram} target="_blank" rel="noreferrer">
              <small>Instagram</small>
              @webora.web.design <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          WEBORA<span>✳</span>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Webora · Web Design Studio</span>
          <nav aria-label="Footer navigation">
            <Link to="/work">Work</Link>
            <Link to="/services">Services</Link>
            <Link to="/studio">Studio</Link>
            <Link to="/privacy">Privacy</Link>
          </nav>
          <span className="mono">DESIGNED TO BE REMEMBERED ↗</span>
        </div>
      </footer>
      <Cursor />
      <ExperienceSwitcher />
      {reduced && (
        <button className="motion-choice mono" onClick={enableMotion}>
          Enable 3D experience ↗
        </button>
      )}
      <div className="page-progress" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
