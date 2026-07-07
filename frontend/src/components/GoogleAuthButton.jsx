import { useEffect, useRef, useState } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoogleAuthMutation } from '../redux/api/authApiSlice';

const GOOGLE_SCRIPT_ID = 'google-identity-services-script';

const GoogleAuthButton = ({ mode = 'signin', onSuccess }) => {
  const [ready, setReady] = useState(false);
  const [googleAuth, { isLoading }] = useGoogleAuthMutation();
  const callbackRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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

      setReady(true);
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

    return () => {
      script.onload = null;
    };
  }, [clientId]);

  const handleClick = () => {
    if (!clientId) {
      toast.error('Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in');
      return;
    }

    if (!ready) {
      toast.error('Google sign-in is still loading');
      return;
    }

    window.google.accounts.id.prompt();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
      Continue with Google
    </button>
  );
};

export default GoogleAuthButton;