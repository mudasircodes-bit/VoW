import { forwardRef } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

const TurnstileCaptcha = forwardRef(function TurnstileCaptcha(
  { onToken },
  ref
) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return (
      <p className="text-sm text-red-600">
        CAPTCHA is not configured.
      </p>
    );
  }

  return (
    <div className="flex justify-center">
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        onSuccess={onToken}
        onExpire={() => onToken("")}
        onError={() => onToken("")}
      />
    </div>
  );
});

export default TurnstileCaptcha;