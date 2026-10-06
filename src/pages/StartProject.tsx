import { useEffect, useRef, useState } from "react";
import { isMotionReduced } from "../lib/motionPreference";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  LockKeyhole,
  RotateCcw,
} from "lucide-react";
import {
  enquirySchema,
  validateStep,
  stepFields,
  categories,
  projectTypes,
  pageCounts,
  featureOptions,
  timelines,
  budgetOptions,
  type Draft,
} from "../../shared/enquiry";
import { sendEnquiry } from "../services/enquiries";
import { contact } from "../data/studio";
import { track } from "../lib/analytics";
import { Core } from "../three/Core";
import { restoreDraft } from "../lib/draft";
import { captureAttribution } from "../lib/attribution";

const STORAGE_KEY = "webora-enquiry-draft-v1";
const emptyDraft: Draft = {
  full_name: "",
  business_name: "",
  email: "",
  phone: "",
  instagram: "",
  business_category: "",
  business_description: "",
  existing_website: false,
  existing_website_url: "",
  project_type: "",
  estimated_pages: "",
  features: [],
  budget_range: "",
  timeline: "",
  additional_requirements: "",
  source: "direct",
  utm: {},
  referrer: "",
  landing_page: "",
  consent: false,
  website: "",
  submission_id: "",
};
const steps = [
  "About you",
  "Your business",
  "The project",
  "Features",
  "Budget & timeline",
  "Review & send",
];
const headlines = [
  "First, a little introduction.",
  "Tell us what you do.",
  "What are we building?",
  "What should it do?",
  "Let’s find the right fit.",
  "Ready for the next chapter?",
];
const descriptions = [
  "A few details so we can start a proper conversation.",
  "Help us understand the business behind the website.",
  "An initial direction is enough. We’ll work out the details together.",
  "Pick what matters. It’s okay if you’re still figuring it out.",
  "Share your preferences. We’ll recommend a scope around them.",
  "Check the details below. You can edit anything before sending.",
];

export default function StartProject() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState("");
  const [success, setSuccess] = useState(false);
  const [saveDraft, setSaveDraft] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [storageNotice, setStorageNotice] = useState("");
  const lock = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const dirty = useRef(false);
  useEffect(() => {
    if (isMotionReduced()) return;
    const elements = form.current?.querySelectorAll<HTMLElement>(
      ".form-heading,.form-fields",
    );
    const animations = [...(elements ?? [])].map((element) =>
      element.animate(
        [
          { opacity: 0.35, transform: "translateY(10px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" },
      ),
    );
    return () => animations.forEach((animation) => animation.cancel());
  }, [step]);
  const first = useRef(true);
  const stepTimer = useRef(0);
  useEffect(() => () => clearTimeout(stepTimer.current), []);
  function changeStep(next: number, immediate = false) {
    if (immediate) {
      clearTimeout(stepTimer.current);
      stepTimer.current = 0;
      setStep(next);
      return;
    }
    if (stepTimer.current) return;
    if (isMotionReduced()) {
      setStep(next);
      return;
    }
    form.current
      ?.querySelectorAll<HTMLElement>(".form-heading,.form-fields")
      .forEach((element) => {
        element.animate(
          [
            { opacity: 1, transform: "none" },
            { opacity: 0.35, transform: "translateY(-6px)" },
          ],
          { duration: 90, easing: "ease-in" },
        );
      });
    stepTimer.current = window.setTimeout(() => {
      stepTimer.current = 0;
      setStep(next);
    }, 90);
  }
  useEffect(() => {
    let restored: Partial<Draft> = {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.expires > Date.now() &&
          parsed.draft &&
          typeof parsed.draft === "object"
        ) {
          restored = restoreDraft(parsed.draft);
          setSaveDraft(true);
          setStorageNotice("Your saved draft has been restored.");
        } else localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* Storage is optional; the in-memory form still works. */
    }
    const attribution = captureAttribution();
    const savedAttribution =
      !!restored.landing_page || Object.keys(restored.utm || {}).length > 0;
    setDraft({
      ...emptyDraft,
      ...restored,
      ...attribution,
      ...(savedAttribution
        ? {
            source: restored.source || attribution.source,
            utm: restored.utm || attribution.utm,
            referrer: restored.referrer || attribution.referrer,
            landing_page: restored.landing_page || attribution.landing_page,
          }
        : {}),
      submission_id: restored.submission_id || crypto.randomUUID(),
      consent: false,
    });
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded || success) return;
    try {
      if (saveDraft)
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ draft, expires: Date.now() + 7 * 86400000 }),
        );
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      setStorageNotice(
        "This browser cannot save drafts. Your details are kept while this page stays open.",
      );
    }
  }, [draft, saveDraft, loaded, success]);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    heading.current?.focus();
  }, [step]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty.current && !saveDraft && !success) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveDraft, success]);

  function update(key: keyof Draft, value: Draft[keyof Draft]) {
    if (!dirty.current) track("form_started");
    dirty.current = true;
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setFailure("");
  }
  const focusError = (next: Record<string, string>) => {
    requestAnimationFrame(() =>
      form.current
        ?.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)
        ?.focus(),
    );
  };
  function advance() {
    const next = validateStep(draft, step);
    setErrors(next);
    if (Object.keys(next).length) {
      focusError(next);
      return;
    }
    track("form_step_completed", { step: step + 1 });
    changeStep(step + 1);
  }
  async function submit() {
    if (lock.current || success) return;
    const result = enquirySchema.safeParse(draft);
    if (!result.success) {
      const next = Object.fromEntries(
        result.error.issues.map((issue) => [issue.path[0], issue.message]),
      );
      const invalidStep = stepFields.findIndex((fields) =>
        fields.some((field) => next[field]),
      );
      setStep(Math.max(invalidStep, 0));
      setErrors(next);
      focusError(next);
      return;
    }
    lock.current = true;
    setPending(true);
    setFailure("");
    try {
      await sendEnquiry(result.data);
      setSuccess(true);
      dirty.current = false;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* no persisted draft */
      }
      track("enquiry_submitted");
      requestAnimationFrame(() => heading.current?.focus());
    } catch (error) {
      setFailure(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please retry.",
      );
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  function field(
    key: keyof Draft,
    label: string,
    options: {
      type?: string;
      optional?: boolean;
      placeholder?: string;
      autoComplete?: string;
      area?: boolean;
    } = {},
  ) {
    return (
      <div className={`field ${options.area ? "field-full" : ""}`} key={key}>
        <label htmlFor={key}>
          {label}
          {options.optional && <span>Optional</span>}
        </label>
        {options.area ? (
          <textarea
            id={key}
            name={key}
            rows={4}
            maxLength={key === "additional_requirements" ? 4000 : 2000}
            value={String(draft[key])}
            placeholder={options.placeholder}
            onChange={(e) => update(key, e.target.value)}
            aria-invalid={!!errors[key]}
            aria-describedby={errors[key] ? `${key}-error` : undefined}
          />
        ) : (
          <input
            id={key}
            name={key}
            type={options.type || "text"}
            autoComplete={options.autoComplete}
            maxLength={
              key === "email"
                ? 254
                : key === "phone"
                  ? 30
                  : key === "instagram" || key === "existing_website_url"
                    ? 500
                    : 150
            }
            value={String(draft[key])}
            placeholder={options.placeholder}
            onChange={(e) => update(key, e.target.value)}
            aria-invalid={!!errors[key]}
            aria-describedby={errors[key] ? `${key}-error` : undefined}
          />
        )}{" "}
        {errors[key] && (
          <span className="field-error" id={`${key}-error`}>
            {errors[key]}
          </span>
        )}
      </div>
    );
  }
  function choices(
    key: keyof Draft,
    label: string,
    options: readonly string[],
    multi = false,
  ) {
    return (
      <fieldset className="choice-field">
        <legend>{label}</legend>
        <div className={`choices ${multi ? "choices-multi" : ""}`}>
          {options.map((option) => {
            const selected = multi
              ? draft.features.includes(
                  option as (typeof draft.features)[number],
                )
              : draft[key] === option;
            return (
              <label
                key={option}
                className={`choice ${selected ? "selected" : ""}`}
              >
                <input
                  name={key}
                  type={multi ? "checkbox" : "radio"}
                  value={option}
                  checked={selected}
                  aria-invalid={!!errors[key]}
                  aria-describedby={errors[key] ? `${key}-error` : undefined}
                  onChange={() => {
                    if (multi) {
                      const value = option as (typeof draft.features)[number];
                      const values =
                        option === "Not sure"
                          ? selected
                            ? []
                            : [value]
                          : selected
                            ? draft.features.filter((v) => v !== value)
                            : [
                                ...draft.features.filter(
                                  (v) => v !== "Not sure",
                                ),
                                value,
                              ];
                      update("features", values);
                    } else update(key, option);
                  }}
                />
                <span>{option}</span>
                <span className="choice-check" aria-hidden="true">
                  {selected ? <Check size={14} /> : <PlusIcon />}
                </span>
              </label>
            );
          })}
        </div>
        {errors[key] && (
          <span className="field-error" id={`${key}-error`}>
            {errors[key]}
          </span>
        )}
      </fieldset>
    );
  }
  return (
    <div className="page-enter booking-page">
      <section className="section booking-layout">
        <aside className="booking-intro">
          <Link to="/" className="text-link">
            <ArrowLeft size={16} /> Back to the studio
          </Link>
          <span className="eyebrow">START A PROJECT</span>
          <h1>
            Something
            <br />
            <span>
              great starts
              <br />
              here.
            </span>
          </h1>
          <p>
            Tell us what you have in mind. We’ll help turn your ambition into a
            clear direction.
          </p>
          <div className="booking-core">
            <Core small progress={success ? 1 : (step + 1) / 6} />
          </div>
          <div className="booking-contact">
            <span className="mono">PREFER A CONVERSATION?</span>
            <a
              href={contact.whatsapp}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("whatsapp_clicked")}
            >
              Let’s talk on WhatsApp <ArrowUpRight size={16} />
            </a>
            <small>
              <LockKeyhole size={13} /> Your details stay private.
            </small>
          </div>
        </aside>
        <div className="booking-form-wrap">
          {success ? (
            <div className="success-panel">
              <span className="success-mark">
                <CheckCheck size={35} />
              </span>
              <span className="eyebrow">THE NEXT CHAPTER</span>
              <h2 ref={heading} tabIndex={-1}>
                Project received.
              </h2>
              <p>
                Thanks, {draft.full_name.split(" ")[0]}. We’ve received the
                details for <strong>{draft.business_name}</strong>.
              </p>
              <p>
                Webora will review your project and contact you using the
                details you provided. You can also reach us directly below if
                there’s anything you’d like to add.
              </p>
              <div className="success-actions">
                <Link className="button" to="/">
                  Return to Webora <ArrowUpRight size={18} />
                </Link>
                <a
                  className="button button-secondary"
                  href={contact.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp Webora <ArrowUpRight size={18} />
                </a>
              </div>
              <small>{contact.phone}</small>
            </div>
          ) : (
            <>
              <div className="form-progress">
                <div>
                  <span className="mono">YOUR PROJECT BRIEF</span>
                  <span className="mono">0{step + 1} / 06</span>
                </div>
                <ol aria-label="Form progress">
                  {steps.map((name, i) => (
                    <li
                      key={name}
                      className={i <= step ? "complete" : ""}
                      aria-current={i === step ? "step" : undefined}
                    >
                      <span className="sr-only">
                        Step {i + 1}: {name}
                        {i < step ? ", completed" : ""}
                      </span>
                    </li>
                  ))}
                </ol>
                <span className="step-name">{steps[step]}</span>
              </div>
              <form
                ref={form}
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (step < 5) advance();
                  else void submit();
                }}
                aria-busy={pending}
              >
                <div className="form-heading">
                  <h2 ref={heading} tabIndex={-1}>
                    {headlines[step]}
                  </h2>
                  <p>{descriptions[step]}</p>
                </div>
                <fieldset className="form-fields" disabled={pending}>
                  <legend className="sr-only">{steps[step]}</legend>
                  {step === 0 && (
                    <div className="fields-grid">
                      {field("full_name", "Full name", {
                        autoComplete: "name",
                        placeholder: "Your name",
                      })}
                      {field("business_name", "Business / brand", {
                        autoComplete: "organization",
                        placeholder: "Your business name",
                      })}
                      {field("email", "Email address", {
                        type: "email",
                        autoComplete: "email",
                        placeholder: "you@yourbusiness.com",
                      })}
                      {field("phone", "Phone / WhatsApp", {
                        type: "tel",
                        autoComplete: "tel",
                        placeholder: "+91 …",
                      })}
                      {field("instagram", "Instagram / social URL", {
                        optional: true,
                        type: "url",
                        placeholder: "https://instagram.com/yourbrand",
                      })}
                    </div>
                  )}
                  {step === 1 && (
                    <>
                      <div className="field">
                        <label htmlFor="business_category">
                          Business category
                        </label>
                        <select
                          name="business_category"
                          id="business_category"
                          value={draft.business_category}
                          onChange={(e) =>
                            update("business_category", e.target.value)
                          }
                          aria-invalid={!!errors.business_category}
                          aria-describedby={
                            errors.business_category
                              ? "business_category-error"
                              : undefined
                          }
                        >
                          <option value="">Choose a category</option>
                          {categories.map((category) => (
                            <option key={category}>{category}</option>
                          ))}
                        </select>
                        {errors.business_category && (
                          <span
                            className="field-error"
                            id="business_category-error"
                          >
                            {errors.business_category}
                          </span>
                        )}
                      </div>
                      {field(
                        "business_description",
                        "What does your business do?",
                        {
                          area: true,
                          placeholder:
                            "Your offer, your audience, and what makes you different…",
                        },
                      )}
                      <fieldset className="choice-field">
                        <legend>Do you have an existing website?</legend>
                        <div className="choices">
                          {[false, true].map((value) => (
                            <label
                              key={String(value)}
                              className={`choice ${draft.existing_website === value ? "selected" : ""}`}
                            >
                              <input
                                type="radio"
                                name="existing_website"
                                checked={draft.existing_website === value}
                                onChange={() => {
                                  update("existing_website", value);
                                  if (!value)
                                    update("existing_website_url", "");
                                }}
                              />
                              <span>
                                {value ? "Yes" : "No, this is a fresh start"}
                              </span>
                              {draft.existing_website === value && (
                                <Check size={15} />
                              )}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      {draft.existing_website &&
                        field("existing_website_url", "Current website URL", {
                          type: "url",
                          placeholder: "https://yourbusiness.com",
                        })}
                    </>
                  )}
                  {step === 2 && (
                    <>
                      {choices("project_type", "Project type", projectTypes)}
                      {choices(
                        "estimated_pages",
                        "Estimated number of pages",
                        pageCounts,
                      )}
                    </>
                  )}
                  {step === 3 &&
                    choices(
                      "features",
                      "Choose the features you have in mind",
                      featureOptions,
                      true,
                    )}
                  {step === 4 && (
                    <>
                      {choices(
                        "budget_range",
                        "How would you like to approach the budget?",
                        budgetOptions,
                      )}
                      {choices("timeline", "Your ideal timeline", timelines)}
                      {field(
                        "additional_requirements",
                        "Anything else we should know?",
                        {
                          optional: true,
                          area: true,
                          placeholder:
                            "Budget details, inspiration, special requirements…",
                        },
                      )}
                    </>
                  )}
                  {step === 5 && (
                    <>
                      <div className="review-list">
                        {[
                          [
                            "About you",
                            `${draft.full_name} · ${draft.business_name}`,
                            `${draft.email} · ${draft.phone}`,
                          ],
                          [
                            "Your business",
                            draft.business_category,
                            draft.business_description,
                          ],
                          [
                            "The project",
                            draft.project_type,
                            `${draft.estimated_pages} pages${draft.existing_website ? ` · ${draft.existing_website_url}` : ""}`,
                          ],
                          ["Features", draft.features.join(", "), ""],
                          [
                            "Budget & timeline",
                            draft.budget_range,
                            `${draft.timeline}${draft.additional_requirements ? ` · ${draft.additional_requirements}` : ""}`,
                          ],
                        ].map(([title, value, more], i) => (
                          <div className="review-row" key={title}>
                            <span className="mono">{title}</span>
                            <button
                              type="button"
                              onClick={() => {
                                changeStep(i);
                                setErrors({});
                              }}
                            >
                              Edit <ArrowUpRight size={13} />
                            </button>
                            <p>{value}</p>
                            {more && <small>{more}</small>}
                          </div>
                        ))}
                      </div>
                      <label className="consent">
                        <input
                          name="consent"
                          type="checkbox"
                          checked={draft.consent}
                          onChange={(e) => update("consent", e.target.checked)}
                          aria-invalid={!!errors.consent}
                          aria-describedby={
                            errors.consent ? "consent-error" : undefined
                          }
                        />
                        <span>
                          I agree to the{" "}
                          <Link to="/privacy" target="_blank">
                            privacy notice
                          </Link>{" "}
                          and to Webora contacting me about this project.
                        </span>
                      </label>
                      {errors.consent && (
                        <span className="field-error" id="consent-error">
                          {errors.consent}
                        </span>
                      )}
                      <p className="form-note">
                        Sending an enquiry starts a conversation. It does not
                        commit you to a purchase.
                      </p>
                    </>
                  )}
                </fieldset>
                <div className="honeypot" aria-hidden="true">
                  <label htmlFor="website">Leave this field empty</label>
                  <input
                    id="website"
                    name="website"
                    value={draft.website}
                    tabIndex={-1}
                    autoComplete="off"
                    onChange={(e) => update("website", e.target.value)}
                  />
                </div>
                {failure && (
                  <div className="submission-error" role="alert">
                    <strong>We couldn’t confirm receipt.</strong>
                    <p>{failure}</p>
                    <a href={contact.whatsapp} target="_blank" rel="noreferrer">
                      Contact Webora on WhatsApp ↗
                    </a>
                  </div>
                )}
                <div className="form-navigation">
                  {step > 0 ? (
                    <button
                      type="button"
                      className="back-button"
                      disabled={pending}
                      onClick={() => {
                        changeStep(step - 1, true);
                        setErrors({});
                        setFailure("");
                      }}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                  ) : (
                    <span className="mono">LET’S GET ACQUAINTED</span>
                  )}
                  <button
                    className="button"
                    type="submit"
                    disabled={pending || !loaded}
                  >
                    {pending
                      ? "Sending your enquiry…"
                      : step === 5
                        ? failure
                          ? "Retry Project Enquiry"
                          : "Send Project Enquiry"
                        : "Continue"}
                    {pending ? (
                      <span className="spinner" />
                    ) : (
                      <ArrowRight size={18} />
                    )}
                  </button>
                </div>
              </form>
              <div className="draft-controls">
                <label>
                  <input
                    type="checkbox"
                    checked={saveDraft}
                    onChange={(e) => setSaveDraft(e.target.checked)}
                  />{" "}
                  Save my draft on this device
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSaveDraft(false);
                    setStorageNotice(
                      "Saved draft removed from this device. Your current form is still here.",
                    );
                  }}
                >
                  <RotateCcw size={12} /> Clear saved draft
                </button>
              </div>
              <p className="storage-notice" aria-live="polite">
                {storageNotice ||
                  "Optional. Saved drafts expire after 7 days. Avoid shared devices."}
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
function PlusIcon() {
  return <span className="plus-icon">+</span>;
}
