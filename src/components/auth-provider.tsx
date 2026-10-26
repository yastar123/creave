import { ClerkProvider } from "@clerk/react";
import { enUS } from "@clerk/localizations";
import { publishableKeyFromHost } from "@clerk/react/internal";
import type { ReactNode } from "react";

export function getClerkAppearance(origin: string) {
  return {
    theme: "simple" as const,
    cssLayerName: "clerk",
    options: {
      logoPlacement: "inside" as const,
      logoLinkUrl: "/",
      logoImageUrl: `${origin}/logo.svg`,
    },
    variables: {
      colorPrimary: "#0B0B0C",
      colorForeground: "#0B0B0C",
      colorMutedForeground: "#737373",
      colorDanger: "#9B4134",
      colorBackground: "#F2F2F0",
      colorInput: "#FFFFFF",
      colorInputForeground: "#0B0B0C",
      colorNeutral: "#D8D8D6",
      fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif",
      borderRadius: "0px",
    },
    elements: {
      rootBox: "w-full flex justify-center",
      cardBox: "bg-[#F2F2F0] rounded-none w-[440px] max-w-full overflow-hidden shadow-2xl",
      card: "!shadow-none !border-0 !bg-transparent !rounded-none",
      footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
      headerTitle: "text-[#0B0B0C] font-medium",
      headerSubtitle: "text-[#60605E]",
      socialButtonsBlockButtonText: "text-[#0B0B0C]",
      formFieldLabel: "text-[#353533]",
      footerActionLink: "text-[#0B0B0C] underline underline-offset-4",
      footerActionText: "text-[#60605E]",
      dividerText: "text-[#60605E]",
      identityPreviewEditButton: "text-[#0B0B0C]",
      formFieldSuccessText: "text-[#45622D]",
      alertText: "text-[#7A3229]",
      logoBox: "h-8",
      logoImage: "max-h-8",
      socialButtonsBlockButton: "border border-[#D8D8D6] bg-white hover:bg-[#F8F8F6]",
      formButtonPrimary: "bg-[#0B0B0C] hover:bg-[#333] text-white rounded-none",
      formFieldInput: "border-[#D8D8D6] bg-white text-[#0B0B0C] rounded-none",
      footerAction: "border-0",
      dividerLine: "bg-[#D8D8D6]",
      alert: "border border-[#E7C4BE] bg-[#FFF4F1]",
      otpCodeFieldInput: "rounded-none border-[#D8D8D6]",
      formFieldRow: "gap-2",
      main: "gap-5",
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const clerkPubKey = publishableKeyFromHost(
    window.location.hostname,
    import.meta.env["VITE_CLERK_PUBLISHABLE_KEY"],
  );
  const clerkProxyUrl = import.meta.env["VITE_CLERK_PROXY_URL"];

  if (!clerkPubKey) {
    throw new Error("Clerk is not configured for this application.");
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={getClerkAppearance(window.location.origin)}
      localization={enUS}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      routerPush={(to) => window.location.assign(to)}
      routerReplace={(to) => window.location.replace(to)}
    >
      {children}
    </ClerkProvider>
  );
}
