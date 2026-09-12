import type { SVGProps } from "react";

/**
 * SF Black Filled (iOS) tarzı ikon seti: dolgulu, yuvarlak hatlı siluetler.
 * Tüm ikonlar currentColor kullanır; çağıran fill/stroke verirse onunki geçerli olur.
 */

type Props = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 24, children, ...props }: Props & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      {children}
    </svg>
  );
}

export function MenuIcon(props: Props) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="2.6" rx="1.3" />
      <rect x="3" y="10.7" width="18" height="2.6" rx="1.3" />
      <rect x="3" y="16.4" width="18" height="2.6" rx="1.3" />
    </Icon>
  );
}

export function UserIcon(props: Props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="7.6" r="4.1" />
      <path d="M12 13.4c-4.7 0-8 2.4-8 5.4 0 1 .8 1.9 1.9 1.9h12.2c1 0 1.9-.8 1.9-1.9 0-3-3.3-5.4-8-5.4z" />
    </Icon>
  );
}

export function SunIcon(props: Props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4.6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <rect key={a} x="11" y="2" width="2" height="4.6" rx="1" transform={`rotate(${a} 12 12)`} />
      ))}
    </Icon>
  );
}

export function MoonIcon(props: Props) {
  return (
    <Icon {...props}>
      <path d="M20.6 14.6A8.6 8.6 0 0 1 9.4 3.4a.8.8 0 0 0-1-1A10 10 0 1 0 21.6 15.6a.8.8 0 0 0-1-1z" />
    </Icon>
  );
}

export function BrushIcon(props: Props) {
  return (
    <Icon {...props}>
      <path d="M19.9 2.9a1.2 1.2 0 0 0-1.7 0l-6.9 6.9 3.9 3.9 6.9-6.9a1.2 1.2 0 0 0 0-1.7l-2.2-2.2z" />
      <path d="M10.2 11.1l-1.5-1.5c-2.3 2.3-3.4 4.7-3.7 7.2-.1 1 .7 1.8 1.7 1.7 2.5-.3 4.9-1.4 7.2-3.7l-1.5-1.5-2.2-2.2z" />
    </Icon>
  );
}

export function GlobeIcon(props: Props) {
  return (
    <Icon {...props}>
      <path
        fillRule="evenodd"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2.2c-1.7 1.6-2.8 4.6-2.8 7.8s1.1 6.2 2.8 7.8c1.7-1.6 2.8-4.6 2.8-7.8s-1.1-6.2-2.8-7.8z"
      />
    </Icon>
  );
}

export function SmartphoneIcon(props: Props) {
  return (
    <Icon {...props}>
      <path
        fillRule="evenodd"
        d="M7 2h10a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zm3.5 15.5h3a1 1 0 0 1 0 2h-3a1 1 0 0 1 0-2z"
      />
    </Icon>
  );
}

export function MonitorIcon(props: Props) {
  return (
    <Icon {...props}>
      <path d="M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5v2.5h3.5a1 1 0 0 1 0 2h-9a1 1 0 0 1 0-2H11V17H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    </Icon>
  );
}

export function MegaphoneIcon(props: Props) {
  return (
    <Icon {...props}>
      <path d="M3 10.8v2.4c0 1.5 1.2 2.8 2.8 2.8h1l1.9 4.3c.2.5.7.8 1.2.6.5-.2.8-.7.6-1.2l-1.6-3.7h8.3c2 0 3.8-1.6 3.8-3.6v-1.6c0-2-1.6-3.6-3.8-3.6H5.8c-1.6 0-2.8 1.3-2.8 2.8z" />
    </Icon>
  );
}

export function PackageIcon(props: Props) {
  return (
    <Icon stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" {...props}>
      <path d="M12 1.7l8.6 5c.6.3 1 1 1 1.7v7.2c0 .7-.4 1.4-1 1.7l-8.6 5c-.6.3-1.4.3-2 0l-8.6-5c-.6-.3-1-1-1-1.7V8.4c0-.7.4-1.4 1-1.7l8.6-5c.6-.4 1.4-.4 2 0z" />
    </Icon>
  );
}

export function StarIcon(props: Props) {
  return (
    <Icon fill="currentColor" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" {...props}>
      <path d="M12 2.5l2.9 5.9 6.6 1-4.7 4.6 1.1 6.5L12 17.4l-5.9 3.1 1.1-6.5L2.5 9.4l6.6-1L12 2.5z" />
    </Icon>
  );
}

export function MessageIcon(props: Props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5c-5 0-9 3.6-9 8 0 2.5 1.3 4.7 3.3 6.1-.1.9-.5 2.2-1.3 3.4-.1.2 0 .5.2.6.1.1.2.1.3.1.2 0 .4-.1.6-.2 1.2-.7 2.3-1.5 3-2.1 1 .3 2 .4 2.9.4 5 0 9-3.6 9-8s-4-8.3-9-8.3z" />
    </Icon>
  );
}

export function CameraIcon(props: Props) {
  return (
    <Icon {...props}>
      <path
        fillRule="evenodd"
        d="M8.6 4.5c.3-.4.8-.5 1.2-.5h4.4c.4 0 .9.1 1.2.5L17 6.5h3A2.5 2.5 0 0 1 22.5 9v8a2.5 2.5 0 0 1-2.5 2.5H4A2.5 2.5 0 0 1 1.5 17V9A2.5 2.5 0 0 1 4 6.5h3L8.6 4.5zm3.4 13a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z"
      />
    </Icon>
  );
}

export function InstagramIcon(props: Props) {
  return (
    <Icon {...props} fill="currentColor" stroke="none">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </Icon>
  );
}

export function MailIcon(props: Props) {
  return (
    <Icon {...props}>
      <path
        fillRule="evenodd"
        d="M4.5 4h15A2.5 2.5 0 0 1 22 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5v-11A2.5 2.5 0 0 1 4.5 4zM3.5 7L12 13l8.5-6-1-1.5L12 10.5 4.5 5.5 3.5 7z"
      />
    </Icon>
  );
}

export function CheckIcon(props: Props) {
  return (
    <Icon fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="4.5 12.5 10 18 19.5 6.5" />
    </Icon>
  );
}

export function SparklesIcon(props: Props) {
  return (
    <Icon {...props}>
      <path d="M12 2c.7 5.3 2.5 7.1 7.8 7.8-5.3.7-7.1 2.5-7.8 7.8-.7-5.3-2.5-7.1-7.8-7.8 5.3-.7 7.1-2.5 7.8-7.8z" />
      <path d="M18.5 13.5c.4 2.6 1.2 3.4 3.8 3.8-2.6.4-3.4 1.2-3.8 3.8-.4-2.6-1.2-3.4-3.8-3.8 2.6-.4 3.4-1.2 3.8-3.8z" />
      <path d="M5.5 13.5c.4 2.6 1.2 3.4 3.8 3.8-2.6.4-3.4 1.2-3.8 3.8-.4-2.6-1.2-3.4-3.8-3.8 2.6-.4 3.4-1.2 3.8-3.8z" />
    </Icon>
  );
}

export function PaletteIcon(props: Props) {
  return (
    <Icon {...props}>
      <path
        fillRule="evenodd"
        d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.4-1.1-.2-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6h1.7c3 0 5.9-2.4 5.9-5.9 0-5-4.2-8.7-10-8.7zM10.8 15.5h2.4a1 1 0 0 1 0 2h-2.4a1 1 0 0 1 0-2zM9 6.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zm-2.5 2.6a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zm11.9.6a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z"
      />
    </Icon>
  );
}

export function LayersIcon(props: Props) {
  return (
    <Icon {...props}>
      <path d="M12 2l10 5-10 5L2 7l10-5z" />
      <path d="M4.5 11.5L2 12.7v.6l10 5 10-5v-.6l-2.5-1.2L12 15.5l-7.5-4z" />
      <path d="M4.5 17L2 18.2v.6l10 5 10-5v-.6L19.5 17 12 21l-7.5-4z" />
    </Icon>
  );
}

export function PenToolIcon(props: Props) {
  return (
    <Icon {...props}>
      <path d="M14.2 3.3l6.5 6.5-9.7 9.7-3.9 1 1-3.9 6.1-13.3z" />
    </Icon>
  );
}

export function SettingsIcon(props: Props) {
  return (
    <Icon {...props}>
      <path
        fillRule="evenodd"
        d="M12 9.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2zM12 5.2a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6z"
      />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <rect key={a} x="10.5" y="1.8" width="3" height="4" rx="1.2" transform={`rotate(${a} 12 12)`} />
      ))}
    </Icon>
  );
}

export function TagIcon(props: Props) {
  return (
    <Icon {...props}>
      <path
        fillRule="evenodd"
        d="M3.6 2.5h6.9c.5 0 1 .2 1.4.6L20.4 12a1.5 1.5 0 0 1 0 2.1l-5.3 5.3a1.5 1.5 0 0 1-2.1 0l-8.9-8.9a1.5 1.5 0 0 1-.6-1.4V2.5zm4.4 5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z"
      />
    </Icon>
  );
}

export function LogoutIcon(props: Props) {
  return (
    <Icon {...props}>
      <path d="M13.5 3H19a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5.5v-2.6H19V5.6h-5.5V3z" />
      <path d="M2.5 11h9.8V8.2l4.2 3.8-4.2 3.8V13H2.5v-2z" />
    </Icon>
  );
}

export function DiscordIcon({ size = 24, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
    </svg>
  );
}

export function CrownIcon(props: Props) {
  return (
    <Icon {...props}>
      <path d="M2.8 7.2c.3-.4.9-.5 1.3-.2l4.1 3 3.8-5.6c.4-.5 1.2-.5 1.6 0l3.8 5.6 2.6-1.9c.5-.4 1.2-.2 1.5.3.1.2.2.5.2.7l-1.5 8.6c-.1.7-.7 1.3-1.5 1.3H5.9c-.8 0-1.4-.6-1.5-1.3L2.7 8.4c-.1-.5.1-.9.1-1.2z" />
      <rect x="5" y="20" width="14" height="2.2" rx="1.1" />
    </Icon>
  );
}

export function TerminalIcon(props: Props) {
  return (
    <Icon {...props}>
      <path
        fillRule="evenodd"
        d="M5 3h14a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zm2.2 5.2L11 12l-3.8 3.8-1.7-1.7 2.1-2.1-2.1-2.1 1.7-1.7zM12 16.5h5.5v2H12v-2z"
      />
    </Icon>
  );
}

export function CodeIcon(props: Props) {
  return (
    <Icon {...props}>
      <path d="M9.5 5.5L4 12l5.5 6.5 2-2.3-3.4-4.2 3.4-4.2-2-2.3z" />
      <path d="M14.5 5.5l-2 2.3 3.4 4.2-3.4 4.2 2 2.3L20 12l-5.5-6.5z" />
      <rect x="10.8" y="3" width="2.4" height="18" rx="1.2" transform="rotate(18 12 12)" />
    </Icon>
  );
}

export function GitBranchIcon(props: Props) {
  return (
    <Icon fill="currentColor" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" {...props}>
      <circle cx="6.5" cy="5.5" r="2.5" stroke="none" />
      <circle cx="6.5" cy="18.5" r="2.5" stroke="none" />
      <circle cx="17.5" cy="8.5" r="2.5" stroke="none" />
      <path d="M6.5 8v8M17.5 11c0 4-4 5-8 5" fill="none" />
    </Icon>
  );
}

export function ShieldIcon(props: Props) {
  return (
    <Icon {...props}>
      <path d="M12 2l7.5 2.8v6.1c0 5-3.1 8.6-7.5 11.1-4.4-2.5-7.5-6.1-7.5-11.1V4.8L12 2z" />
    </Icon>
  );
}

export function CompassIcon(props: Props) {
  return (
    <Icon {...props}>
      <path
        fillRule="evenodd"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2.6a7.4 7.4 0 1 0 0 14.8 7.4 7.4 0 0 0 0-14.8z"
      />
      <path d="M15.8 8.2l-2.5 5-5 2.5 2.5-5 5-2.5z" />
    </Icon>
  );
}

export function PercentIcon(props: Props) {
  return (
    <Icon {...props}>
      <circle cx="7" cy="7" r="2.7" />
      <circle cx="17" cy="17" r="2.7" />
      <path d="M18.6 5.2l-11.4 13.6-1.9-1.6L16.7 3.6l1.9 1.6z" />
    </Icon>
  );
}
