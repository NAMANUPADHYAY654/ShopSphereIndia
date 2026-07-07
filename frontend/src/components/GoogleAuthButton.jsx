import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoogleAuthMutation } from '../redux/api/authApiSlice';

const GOOGLE_SCRIPT_ID = 'google-identity-services-script';

const GoogleAuthButton = ({ onSuccess }) => {
  const [googleAuth, { isLoading }] = useGoogleAuthMutation();
  const buttonDivRef = useRef(null);
  const callbackRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Keep callback ref fresh
  useEffect(() => {
    callbackRef.current = async (response) => {
      try {
        const result = await googleAuth({ credential: response.credential }).unwrap();
        toast.success(`Welcome, ${result.name}!`);
        onSuccess?.(result);
      } catch (error) {
        toast.error(error?.data?.message || 'Google sign-in failed');
      }
    };
  }, [googleAuth, onSuccess]);

  // Load Google Identity Services script
  useEffect(() => {
    if (!clientId) return;

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => callbackRef.current?.(response),
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      setScriptLoaded(true);
    };

    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', initGoogle);
      return () => existing.removeEventListener('load', initGoogle);
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.body.appendChild(script);

    return () => { script.onload = null; };
  }, [clientId]);

  // Render the official Google button once the script is loaded
  useEffect(() => {
    if (!scriptLoaded || !buttonDivRef.current || !window.google?.accounts?.id) return;

    window.google.accounts.id.renderButton(buttonDivRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      width: buttonDivRef.current.offsetWidth || 400,
      logo_alignment: 'left',
    });
  }, [scriptLoaded]);

  // Fallback if no client ID configured
  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-400 cursor-not-allowed dark:border-stone-700 dark:bg-stone-800 dark:text-stone-500"
      >
        Google Sign-In not configured
      </button>
    );
  }

  return (
    <div className="relative w-full flex items-center justify-center min-h-[44px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-2xl dark:bg-stone-900/70 z-10">
          <Loader2 className="h-5 w-5 animate-spin text-stone-500" />
        </div>
      )}
      {/* Google renders its own button here */}
      <div ref={buttonDivRef} className="w-full" />
      {/* Show placeholder while script loads */}
      {!scriptLoaded && (
        <div className="absolute inset-0 flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white text-sm font-semibold text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading Google Sign-In...
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;