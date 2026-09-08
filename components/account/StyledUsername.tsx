import { nameTextStyle, type NameStyle } from "@/lib/account/name-style";

interface StyledUsernameProps {
  username: string;
  style: NameStyle;
  /** Premium yoksa her zaman düz isim. */
  enabled: boolean;
}

/** users/ sayfasındaki isim görünümü (premium stili varsa uygular). */
export default function StyledUsername({ username, style, enabled }: StyledUsernameProps) {
  if (!enabled) return <>@{username}</>;
  const css = nameTextStyle(style);
  if (!css) return <>@{username}</>;
  return <span style={css}>@{username}</span>;
}
