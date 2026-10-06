import { LinkButton } from "../components/LinkButton";
export default function NotFound() {
  return (
    <section className="section page-heading not-found">
      <span className="eyebrow">404 / A DIFFERENT DIRECTION</span>
      <h1>
        This page
        <br />
        <span>is out of frame.</span>
      </h1>
      <p>Let’s get you back to the studio.</p>
      <LinkButton to="/">Return to Webora</LinkButton>
    </section>
  );
}
